# Báo Cáo Kiến Trúc: Chia Nhỏ Không Gian & Quản Lý Thế Giới Cho Web MMO

## 1. Phân Vùng Không Gian Cho Bản Đồ Cỡ "Trái Đất"
Để hỗ trợ một thế giới mở khổng lồ, hệ tọa độ phải được cấu trúc lại để tối ưu hóa cả việc truy vấn của server lẫn độ chính xác hiển thị của client.
- **Chia Nhỏ Theo Lưới (Grid-Based Chunking 2D/3D):** Thế giới được băm ra thành các ô (Chunk) có kích thước đều nhau (VD: lưới 64x64 mét). Việc này tạo ra một hệ quy chiếu toán học O(1) cực kỳ ổn định để phân bổ người chơi vào các khu vực và chia đều tải cho các cụm máy chủ.
- **QuadTrees (2D) / Octrees (3D):** Được sử dụng khi mật độ người chơi không đồng đều (VD: Thành phố thì đông nghẹt, ngoài biển thì vắng hoe). Các nút của cây (Nodes) sẽ tự động chia nhỏ hơn nữa khi số lượng thực thể vượt qua một giới hạn nhất định, giúp tăng tốc độ kiểm tra va chạm (collision) và truy vấn những người xung quanh một cách đáng kinh ngạc.
- **Gốc Tọa Độ Trôi (Floating Origin - Bắt Buộc Có):** Độ chính xác của số thực 32-bit (Floating-point) trong WebGL sẽ bị giảm sút trầm trọng nếu tọa độ quá xa số 0, gây ra hiện tượng hình ảnh bị giật cục/rung lắc (jitter). Kiến trúc này buộc phải dùng "Floating Origin", tức là Client sẽ tự động dời toàn bộ thế giới lại gần gốc tọa độ `(0,0,0)` so với Camera, hoặc Server phải dùng số thực 64-bit (Double Precision) nhưng chỉ gửi các tọa độ bù trừ (offsets) ngắn về cho Client.

## 2. Quản Lý Vùng Nhìn Thấy (Area of Interest - AOI)
Để gánh được 1000+ người chơi, server phải lọc cực kỳ gắt gao dữ liệu mạng đẩy ra ngoài.
- **Đăng Ký Ô Lưới (Cell Subscriptions):** Dựa vào hệ thống Lưới ở trên, một người chơi sẽ tự động đăng ký nhận dữ liệu của ô lưới họ đang đứng và các ô xung quanh ngay sát cạnh (thường là một mạng lưới 3x3 ô).
- **Sự Kiện Vòng Đời & Mã Hóa Delta:** Server quản lý hai sự kiện "Vào AOI" và "Rời AOI". Khi một người chơi bước vào vùng AOI của bạn, toàn bộ dữ liệu (tên, đồ đạc) của họ sẽ được tải về 1 lần. Chừng nào họ còn ở trong vùng AOI, server chỉ gửi cập nhật Delta (chỉ gửi những gì bị thay đổi như tọa độ di chuyển, máu), giúp tiết kiệm cực lớn băng thông.
- **LOD Trên Băng Thông Mạng (Network Streaming):** Những thực thể ở rất xa hoặc ít quan trọng sẽ được cập nhật mạng chậm hơn (VD: Gửi vị trí của người ở xa 5 lần/giây, thay vì người ở gần là 20 lần/giây).

## 3. Chiến Lược Database: Trạng Thái Tạm Thời vs. Lưu Trữ Vĩnh Viễn
Một MMO có khả năng mở rộng tốt phải chia đều khối lượng công việc giữa một bộ đệm không gian trên RAM (In-memory) và một cơ sở dữ liệu vật lý (Persistent DB).
- **Redis (GeoHash) / In-Memory Grids:** 
  Dùng cho **Vòng lặp game thời gian thực (Real-Time Game Loop)**. Redis lưu giữ tọa độ hiện tại của tất cả người chơi/NPC trên RAM và dùng thuật toán GeoHash để trả lời các truy vấn không gian liên tục (VD: "Tìm tất cả người chơi trong bán kính 50m") với độ trễ chưa tới 1 phần nghìn giây.
- **PostGIS (Supabase / PostgreSQL):** 
  Dùng làm **Nguồn Sống Vĩnh Cửu (Persistent Source of Truth)**. PostGIS cực kỳ mạnh trong việc xử lý phân tích không gian phức tạp, hình dạng hình học tĩnh của bản đồ, các khu vực đa giác (như Vùng an toàn, Khu vực chiếm đóng), và lưu lại vị trí của người chơi khi họ Offline. Nó quá chậm để xử lý va chạm Real-time, nhưng hoàn hảo để lưu trữ dữ liệu thế giới lâu dài.
- **Quy Trình Ống Nước (The Pipeline):** Khi Server khởi động, nó tải toàn bộ hình học tĩnh và thông tin người chơi offline từ PostGIS đẩy lên Redis/RAM. Quá trình chơi game thực tế chỉ làm thay đổi dữ liệu trên RAM. Theo định kỳ, dữ liệu trên RAM này sẽ được gom thành một cục (batch) và ghi đè ngược lại vào PostGIS để lưu trữ.

## 4. Tải Cảnh Mượt Mà Trên Client (Three.js)
Để đạt được cảnh giới vừa đi vừa load map như Minecraft hay Genshin Impact mà không làm treo trình duyệt:
- **Web Workers & ArrayBuffers:** Mọi tác vụ như tải thông tin Chunk từ mạng, phân tích cú pháp, và tạo sinh đồ họa (procedural generation) phải được ném sang luồng chạy nền (Web Workers). Web Worker sẽ tính toán sẵn mảng dữ liệu đồ họa (vertex arrays) rồi bắn về luồng chính (Main Thread) thông qua cơ chế không sao chép bộ nhớ (`ArrayBuffer`) để render lên màn hình.
- **Tải Trước Dự Đoán (Predictive Lazy Loading):** Client liên tục theo dõi vận tốc và hướng đi của người chơi để dự đoán và tải trước các ô (Chunks) nằm ngoài rìa màn hình trước khi người chơi kịp nhìn thấy chúng.
- **Gộp Lệnh Vẽ (Draw Call Batching với `InstancedMesh`):** Đối với các môi trường dày đặc, toàn bộ cây cỏ và đồ vật tĩnh trong một Chunk sẽ được gộp lại thành một cụm `THREE.InstancedMesh` duy nhất, giúp Card màn hình (GPU) giảm hàng ngàn lệnh vẽ (Draw calls) xuống chỉ còn 1 lệnh.
- **Dọn Rác Cực Đoan (`dispose()`):** Trình duyệt web có giới hạn RAM rất ngặt nghèo. Khi các Chunk rơi ra ngoài vùng AOI, Client bắt buộc phải gọi lệnh dọn rác thủ công `geometry.dispose()`, `material.dispose()`, và `texture.dispose()` để tránh rò rỉ bộ nhớ gây sập trình duyệt.
