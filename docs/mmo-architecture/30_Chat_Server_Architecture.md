# BÁO CÁO KIẾN TRÚC HỆ THỐNG CHAT CHO MMO

## 1. Kiến trúc phân chia các kênh Chat (Chat Channels Architecture)

Trong một MMO, lượng dữ liệu (throughput) rất lớn. Không thể dùng một luồng (stream) chung cho tất cả. Hệ thống nên sử dụng **Message Broker** (như NATS, Kafka, hoặc Redis Pub/Sub) để định tuyến tin nhắn.

*   **Global Chat (Kênh Thế giới / Kênh Toàn máy chủ):**
    *   **Thách thức:** Nếu có 50,000 CCU, một người chat sẽ tạo ra 50,000 requests. Đây là "Fan-out" khổng lồ làm nghẽn mạng.
    *   **Giải pháp:** Phân mảnh (Sharding) kênh Global thành các kênh con (ví dụ: `global_1`, `global_2`, mỗi kênh tối đa 1,000 - 2,000 người). Chỉ cho phép broadcast tin nhắn vào shard mà người chơi đang ở. Áp dụng giới hạn rate limit cực kỳ nghiêm ngặt trên kênh này.
*   **Regional / Map Chat (Kênh Khu vực):**
    *   **Giải pháp:** Sử dụng mô hình **Room-based** hoặc **Spatial Partitioning (Geohashing)**.
    *   Khi người chơi bước vào một bản đồ hoặc phân khu (zone), client (hoặc game server) gửi lệnh `Subscribe(room: "map_101")` đến Chat Server. Các tin nhắn trong khu vực này chỉ được Pub/Sub nội bộ trong room đó. Khi rời đi, thực hiện `Unsubscribe`.
*   **Guild / Party Chat (Kênh Bang hội / Tổ đội):**
    *   **Đặc thù:** Yêu cầu phải có lịch sử tin nhắn (Persistent History) vì thành viên có thể đang offline.
    *   **Giải pháp:** Subscribe vào topic tĩnh (ví dụ `guild_id_999`). Cần có một **Archiver Service** lắng nghe topic này để ghi tin nhắn vào Database (ưu tiên các DB tối ưu ghi chép như Cassandra, ScyllaDB hoặc DynamoDB) để đồng bộ (sync) lịch sử khi các thành viên đăng nhập lại.
*   **Private Whispers (Nhắn tin 1-1):**
    *   **Đặc thù:** Cần xác định vị trí node mạng của người nhận.
    *   **Giải pháp:** Sử dụng **Connection Registry / Presence Service** (lưu trên Redis). Khi User A nhắn cho User B, Gateway Service sẽ query Redis: *"User B đang kết nối tới node WebSocket nào?"*. Nếu B đang online ở `Node_3`, Gateway đẩy tin nhắn thẳng vào NATS với đích đến là `Node_3`. Nếu B offline, đẩy vào queue "Offline Messages" trong DB.

---

## 2. Đánh giá Tech Stack (Công nghệ)

### Lựa chọn 1: Supabase Realtime
*   **Đánh giá:** Được xây dựng trên nền PostgreSQL replication và Elixir, rất mạnh mẽ cho web apps/BaaS.
*   **Phù hợp với MMO không? KHÔNG.**
    *   Game chat là dữ liệu phù du (ephemeral) với tần suất cực cao. Việc dựa vào Database-centric events để broadcast chat cho hàng chục ngàn player sẽ gây thắt cổ chai ở DB và có thể đẩy chi phí lên mức không tưởng. Rate limits của Supabase cũng không thiết kế cho luồng traffic MMO.

### Lựa chọn 2: Third-party API (Stream Chat)
*   **Đánh giá:** Giải pháp SaaS "ăn liền", tính năng cực kỳ phong phú (Thread, Reaction, Profanity filter xịn).
*   **Phù hợp với MMO không? RẤT ĐẮT.**
    *   Stream Chat tính phí dựa trên MAU (Monthly Active Users) và Concurrent Connections. Với quy mô MMO, con số này có thể lên tới hàng chục ngàn đô la mỗi tháng. Việc tích hợp chặt chẽ hệ thống Bang hội của game vào một SaaS bên ngoài cũng gặp nhiều rào cản.

### Lựa chọn 3: Custom WebSocket Server (Go/Rust/Erlang + NATS/Redis)
*   **Đánh giá:** Tự build toàn bộ hệ thống bằng Golang hoặc Erlang/Elixir, kết hợp WebSockets, NATS cho Pub/Sub và Redis cho Presence.
*   **Phù hợp với MMO không? CÓ, NHƯNG TỐN NGUỒN LỰC DEV.**
    *   Hiệu năng cao nhất, tối ưu 100% tài nguyên, chi phí vận hành rẻ. Tuy nhiên, đội ngũ sẽ phải tự build mọi thứ từ đầu: Routing, Reconnection, Scaling, Presence, Storage.

### Lựa chọn 4: NAKAMA (Khuyên dùng)
*   **Đánh giá:** Nakama là một Game Server mã nguồn mở (viết bằng Golang) của Heroic Labs. Nó sinh ra để giải quyết chính xác bài toán này.
*   **Phù hợp với MMO không? SỰ LỰA CHỌN HOÀN HẢO.**
    *   Nó cung cấp sẵn in-memory chat routing, các kênh Global, Room (cho Map), Group (cho Guild) và Direct (Whisper). Có sẵn module Presence, Matchmaking và quản lý Party. Hệ thống có tính chất phân tán (Clustering), dễ dàng scale ngang bằng cách thêm node. Chi phí duy nhất là tiền thuê Server/Cloud (Self-hosted).

---

## 3. Phòng chống Spam & Lọc từ ngữ (Spam Prevention & Profanity Filtering)

Đây là các pipeline xử lý trên memory trước khi tin nhắn được Broadcast.

### A. Rate Limiting (Giới hạn tốc độ)
*   Sử dụng thuật toán **Token Bucket** hoặc **Leaky Bucket** (có thể triển khai nhanh qua Redis `EVAL` Lua scripts).
*   **Thiết lập theo cấu hình kênh:**
    *   Global Chat: 1 tin / 5 giây.
    *   Map Chat: 1 tin / 2 giây.
    *   Whisper/Party: 3 tin / 1 giây.
*   **Trừng phạt tự động (Auto-Penalty):** Nếu vi phạm rate limit quá 3 lần liên tiếp, tự động "Mute" tài khoản trong 5 phút ở cấp độ Session (Node sẽ rớt/drop tin nhắn ngay lập tức mà không cần gọi xuống DB).

### B. Kiến trúc Profanity Filtering (Lọc từ nhạy cảm)
Việc kiểm tra chuỗi (string) rất tốn CPU. Hệ thống cần phân lớp:
1.  **Lớp 1: Fast In-memory Filter (Cho Chat Realtime):**
    *   Sử dụng thuật toán **Aho-Corasick** hoặc **Bloom Filter** nạp thẳng vào RAM của Chat Node khi khởi động.
    *   Thuật toán này cho phép tìm kiếm hàng ngàn từ cấm (bad words) trong đoạn chat chỉ mất chưa tới `0.1ms`.
    *   Hành động: Thay thế (Masking) từ vi phạm bằng dấu `***` hoặc block tin nhắn.
2.  **Lớp 2: Pattern Regex (Bắt lách luật):**
    *   Bắt các chuỗi cố tình chèn ký tự (vd: `s.p.a.m`, `b_a_d`). Chỉ chạy lớp này nếu lớp 1 pass.
3.  **Lớp 3: Machine Learning API (Cho report/kiểm duyệt ngầm):**
    *   Không chạy realtime để tránh delay. Sử dụng hàng đợi Kafka đưa các đoạn chat khả nghi qua model NLP (như AWS Comprehend hoặc model tự train) để phát hiện hành vi lăng mạ, sau đó gửi report cho Admin.

### C. Shadowbanning
*   Vũ khí lợi hại nhất chống lại Bot Spam. Khi phát hiện Bot, thay vì ban account (chúng sẽ tạo account mới ngay lập tức), hệ thống gắn cờ **Shadowban**.
*   **Luồng hoạt động:** Bot gửi tin nhắn -> Chat Node nhận -> Vẫn trả về thông báo `Success` cho client của Bot -> Nhưng ở bước Broker, tin nhắn bị DROP và KHÔNG ĐƯỢC gửi tới bất kỳ ai. Bot sẽ nghĩ rằng nó vẫn đang spam thành công.

### D. Block/Mute List (Danh sách chặn 1-1)
*   Khi người chơi login, tải danh sách bị chặn (Blocked Users) của họ từ Database lên Session RAM của họ.
*   Khi có Whisper đến, kiểm tra trực tiếp trên RAM thay vì query DB để giảm tải I/O.
