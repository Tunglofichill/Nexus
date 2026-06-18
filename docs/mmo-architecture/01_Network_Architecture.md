# Báo Cáo Kiến Trúc Mạng MMO Trên Trình Duyệt: Xử Lý 1000+ Người Chơi Cùng Lúc

## 1. So Sánh Các Giải Pháp Backend

Việc xử lý 1000+ người chơi đồng thời (CCU) trong cùng một thế giới đòi hỏi một kiến trúc mạnh mẽ, có khả năng mở rộng ngang (horizontal scaling). Các game MMO trên trình duyệt dựa vào WebSockets, nhưng cách triển khai backend sẽ quyết định khả năng mở rộng.

| Giải pháp | Điểm mạnh | Điểm yếu | Phù hợp nhất cho |
| :--- | :--- | :--- | :--- |
| **Custom WebSockets (Node.js/uWebSockets.js)** | Linh hoạt tối đa, hiệu năng thô cực cao, không có dependency rác. | Phải tự xây dựng hệ thống đồng bộ state, Area of Interest (AoI), và nén delta từ đầu. | Game MMO hiệu năng cao, cơ chế đặc thù mà các framework có sẵn không đáp ứng được. |
| **Colyseus (Node.js)** | Có sẵn đồng bộ state, nén delta, và quản lý phòng (room). Hỗ trợ TypeScript native. | Một room chỉ mở rộng dọc (tăng cấu hình máy). 1000 CCU trong *một* room sẽ gây nghẽn nếu không có cơ chế chia nhỏ. | Game hành động/chiến thuật chia thành các khu vực hoặc trận đấu riêng biệt. |
| **Nakama (Go/Lua/TS)** | "Đầy đủ đồ chơi": Ghép trận, đăng nhập, tính năng xã hội. Khả năng mở rộng và hiệu năng rất cao. | Khó học. Cần tự viết cơ chế chia nhỏ không gian (spatial partitioning) trong vòng lặp game. | Game MMO hoàn chỉnh cần nhiều tính năng xã hội và khả năng mở rộng cấp doanh nghiệp. |
| **BaaS (Supabase/Firebase)** | Ra mắt cực nhanh. Supabase Broadcast có độ trễ <50ms cho dữ liệu tạm thời. | Quá đắt đỏ và độ trễ cao nếu chạy vòng lặp game tốc độ cao (20-30Hz). Bị giới hạn rate limit khắt khe. | Game turn-based, đồng bộ state đơn giản, hoặc lưu trữ (túi đồ), nhưng **không thể** dùng cho di chuyển thời gian thực. |

**Nhận định cho quy mô MMO:** 
Server **Nakama** hoặc **Custom Go/Rust/uWebSockets.js** là lựa chọn mạnh mẽ nhất. Colyseus rất tốt nhưng yêu cầu chia "thế giới duy nhất" thành các room riêng biệt. Supabase chỉ nên xử lý phần lưu trữ dữ liệu cứng (Database PostgreSQL), tuyệt đối không dùng để mô phỏng di chuyển realtime.

## 2. Thuật Toán & Đồng Bộ Trạng Thái (State Sync)

Việc gửi bản cập nhật của 1000 người chơi cho 1000 client ở mỗi nhịp game (tick) sẽ tạo ra sự bùng nổ lưu lượng mạng O(N^2) không thể kiểm soát.

### Các Thuật Toán Cốt Lõi
*   **Chia Nhỏ Không Gian & Vùng Nhìn Thấy (Area of Interest - AoI):** Thế giới phải được chia thành các ô lưới (Grid), Quadtree, hoặc Octree. Server chỉ gửi thông tin của một người chơi cho những client có camera đang nhìn vào ô chứa người chơi đó.
*   **Nội Suy Khung Hình (Snapshot Interpolation):** Server chạy ở một tốc độ cố định (VD: 20Hz) và gửi "ảnh chụp" (snapshot) của thế giới về client. Client sẽ lưu lại các snapshot này và nội suy (làm mượt) chuyển động giữa 2 snapshot cũ nhất, giúp giật lag mạng bị che giấu hoàn toàn.
*   **Dự Đoán Tại Client (Client Prediction):** Vì server có thẩm quyền (authoritative) sẽ gây ra độ trễ phím (input lag), client sẽ mô phỏng ngay lập tức chuyển động của người chơi ("Dự đoán"). Khi snapshot từ server về tới, client sẽ so sánh. Nếu bị sai lệch (do hack hoặc lag), client sẽ tự động kéo nhân vật về đúng vị trí của server ("Hòa giải" - Reconciliation).
*   **Nén Delta (Delta Compression):** Thay vì gửi toàn bộ snapshot mỗi tick, server chỉ gửi những thuộc tính bị thay đổi kể từ gói tin cuối cùng được xác nhận (VD: nếu nhân vật không xoay người, thì không gửi dữ liệu góc xoay).

## 3. Tối Ưu Hóa Băng Thông

Định dạng nén dữ liệu ảnh hưởng cực lớn đến băng thông mạng và quá trình dọn rác bộ nhớ (Garbage Collection) của CPU.

*   **JSON:** Nặng nhất về băng thông và CPU. Việc phân tích chuỗi (parsing) gây ra cấp phát bộ nhớ liên tục, làm CPU phải dọn rác và gây giật lag server. **Tuyệt đối tránh dùng cho vòng lặp game.**
*   **MessagePack (MsgPack):** Bản chất là JSON nhị phân. Nhỏ hơn JSON 50-70% và dễ code vì không cần định nghĩa cấu trúc (schemaless). Rất phù hợp ở giai đoạn đầu phát triển.
*   **FlatBuffers / Protocol Buffers:** Định dạng nhị phân có cấu trúc chặt chẽ. **FlatBuffers** là tiêu chuẩn công nghiệp cho MMO hiệu năng cao vì nó hỗ trợ **Giải nén Zero-Copy**. Dữ liệu được đọc thẳng từ bộ nhớ đệm (buffer) mà không cần chuyển đổi thành object tốn kém trên RAM, giúp giảm cực mạnh tải CPU và băng thông.

**Đề xuất:** Dùng FlatBuffers cho luồng dữ liệu tốc độ cao "hot path" (di chuyển, chiến đấu) và dùng JSON cho luồng dữ liệu chậm "cold path" (chat, API mua bán).

## 4. Mở Rộng Hệ Thống: Giao Tiếp Liên Máy Chủ (Cross-Server)

Một tiến trình Node.js duy nhất không thể gánh nổi vật lý, AI và mạng cho 1000 người chơi. Thế giới phải được mở rộng ngang (chia ra nhiều máy chủ).

*   **Kiến Trúc Chia Vùng (Zone-Based):** Bản đồ thế giới được chia thành các khu vực địa lý (VD: "Thành Phố Phía Bắc", "Rừng Phía Nam"). Mỗi khu vực do một tiến trình máy chủ riêng quản lý.
*   **Redis Pub/Sub & NATS:** Dùng làm cầu nối giữa các máy chủ này.
    *   **Ranh Giới Vùng:** Khi Người chơi A ở Vùng 1 đứng sát biên giới Vùng 2, Vùng 2 sẽ liên tục bắn dữ liệu của mình qua Redis Pub/Sub để Vùng 1 có thể render cảnh bên kia biên giới một cách mượt mà.
    *   **Hệ Thống Toàn Cầu:** Chat kênh thế giới, mời tổ đội, hay ghép trận đều bắn qua Redis để tất cả máy chủ đồng bộ với nhau.
    *   **Chuyển Giao (Handoff):** Khi người chơi bước qua biên giới, kết nối mạng của họ sẽ được chuyển giao mượt mà từ máy chủ cũ sang máy chủ mới.

### Tóm Lại
Để xử lý mượt mà 1000+ người chơi trên trình duyệt web: Hãy áp dụng hệ thống lưới **Area of Interest (AoI)** trên backend **Custom uWebSockets.js** hoặc **Nakama**. Nén dữ liệu di chuyển bằng **FlatBuffers**. Đảm bảo Client có dùng **Snapshot Interpolation** và **Client Prediction** để xử lý độ trễ của server 20Hz, và phân phối máy chủ mô phỏng thông qua **Redis Pub/Sub**.
