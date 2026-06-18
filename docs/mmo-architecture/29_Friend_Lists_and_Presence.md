# Báo Cáo Kiến Trúc Hệ Thống: Danh Sách Bạn Bè & Trạng Thái Trực Tuyến Thời Gian Thực (MMO)

## 1. Bài Toán Quy Mô (The Scale Problem)
- **Vấn đề (Polling là một thảm họa):** Trong môi trường MMO, nếu một người chơi có 500 bạn bè và client liên tục gửi request đến Database mỗi giây để kiểm tra ai đang online, hệ thống sẽ đối mặt với tình trạng thắt cổ chai cục bộ. Với `N` người chơi và `F` bạn bè, số lượng truy vấn là `O(N x F)`. Nếu có 10,000 người chơi online, hệ thống sẽ phải xử lý hàng triệu truy vấn Database mỗi giây.
- **Hậu quả:** Quá tải Cơ sở dữ liệu (Database bottleneck), ngốn băng thông máy chủ vô ích, tăng độ trễ mạng và gián đoạn gameplay.
- **Giải pháp:** Chuyển đổi từ mô hình "Pull" (Client liên tục hỏi) sang "Push" (Server chủ động báo cho Client qua WebSocket) và tách biệt hoàn toàn dữ liệu trạng thái trực tuyến (ephemeral data) ra khỏi Database chính.

## 2. Quản Lý Trạng Thái Bằng Redis & Supabase (Theo dõi Online/Offline hiệu quả)
Dữ liệu trực tuyến là dữ liệu tạm thời và thay đổi liên tục, do đó cần sử dụng In-memory Datastore hoặc các dịch vụ Real-time chuyên dụng để đảm bảo độ trễ thấp nhất.

**A. Giải pháp với Redis:**
- **Lưu trữ tối ưu:** Sử dụng `Redis Sets` (ví dụ: `SADD online_players player_id`) để chứa danh sách tập hợp những người đang online toàn server. Hoặc dùng `Redis Hashes` nếu cần lưu thêm metadata (Server ID/Timestamp).
- **Cơ chế Heartbeat (Nhịp tim) & TTL:** Client định kỳ gửi tín hiệu ping (vd: 15-30s/lần) lên Server. Server sẽ thiết lập hoặc gia hạn thời gian sống (TTL) của key trạng thái trên Redis bằng lệnh `SETEX player_status:123 45 "online"`. Nếu client ngắt kết nối đột ngột, key sẽ tự động hết hạn và kích hoạt `Keyspace Notification` của Redis để Server biết và đánh dấu người chơi Offline.

**B. Giải pháp với Supabase Presence:**
- Supabase Presence được xây dựng dựa trên hệ sinh thái Phoenix/Elixir và CRDTs (Conflict-free Replicated Data Types), giải quyết tuyệt vời bài toán phân tán trên diện rộng.
- **Ưu điểm:** Khả năng tự động đồng bộ trạng thái trực tuyến qua các kênh (Channels), xử lý mượt mà kịch bản đa kết nối (VD: một người chơi đăng nhập trên cả PC lẫn Mobile, hệ thống tự động gộp trạng thái và chỉ báo Offline khi kết nối cuối cùng ngắt). Supabase xử lý mọi cơ chế heartbeat ngầm, giúp tiết kiệm thời gian phát triển.

## 3. Cơ Chế Broadcasting (Phát Sóng Thông Báo) Không Gây Spam Mạng
Để tránh tình trạng "bão thông báo" (Broadcast Storm) khi có người đăng nhập:

- **Luồng xử lý chọn lọc (Targeted Fan-out):** 
  1. Khi `Player A` đăng nhập, kết nối WebSocket được thiết lập. Server đánh dấu `A` là Online trên Redis.
  2. Server tải danh sách `500 IDs` bạn bè của `A` (Từ Database hoặc Redis Cache).
  3. Lọc người đang Online: Server sử dụng lệnh `SMISMEMBER` (đối với Sets) hoặc pipeline trong Redis để đối chiếu xem trong 500 bạn bè đó, ai hiện *đang thực sự Online*.
  4. Định tuyến chính xác: Giả sử chỉ có `50` người bạn đang Online. Thông qua cơ chế `Pub/Sub` (Redis Pub/Sub, RabbitMQ hoặc Kafka), Server chỉ đẩy sự kiện "Player A vừa Online" tới đúng 50 socket connections/node servers đang quản lý kết nối của những người bạn đó, thay vì spam thông báo lên toàn bộ mạng lưới.

- **Tối ưu hóa bằng Batching (Gộp gói tin):**
  Trong trường hợp có "Login Storm" (hàng ngàn người đăng nhập cùng lúc, ví dụ sau khi bảo trì), hàng loạt thay đổi trạng thái sẽ diễn ra. Thay vì liên tục đẩy từng tin nhắn rác rưởi, Server sẽ gom nhóm (Batching) các sự kiện này lại theo chu kỳ nhỏ (vd: 1-2 giây) thành một mảng payload duy nhất trước khi gửi xuống Client. Điều này giúp giảm thiểu tối đa số lượng TCP packet phải xử lý.
