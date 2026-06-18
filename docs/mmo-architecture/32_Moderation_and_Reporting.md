# BÁO CÁO KỸ THUẬT: MMO PLAYER MODERATION & REPORTING ARCHITECTURE

## 1. Công Cụ Quản Trị (Admin Tooling) & Dashboard
Để đáp ứng môi trường MMO với số lượng người chơi đồng thời lớn, hệ thống không nên gắn trực tiếp logic quản lý vào các máy chủ trò chơi (game server) riêng lẻ. Thay vào đó, cần xây dựng một **Moderation Microservice** độc lập đóng vai trò là "Nguồn chân lý" (Source of Truth).

**Kiến trúc tổng quan:**
- **In-memory Store (Redis):** Lưu trữ trạng thái quản lý đang có hiệu lực (ví dụ: `is_muted`, `ban_expiry`) với độ trễ tính bằng microsecond để game server dễ dàng tra cứu.
- **Event-Driven Pub/Sub (Kafka, NATS, hoặc Redis Pub/Sub):** Khi Dashboard thực hiện lệnh, API sẽ đẩy một event vào Message Bus, tất cả các game server instances sẽ subscribe để cập nhật trạng thái ngay lập tức mà không cần polling (hỏi liên tục) database.

**Cách triển khai từng tính năng:**
- **Kick (Đuổi):** API xác định game server instance nào đang host người chơi (thông qua Session Service) và gửi lệnh trực tiếp. Server ép ngắt kết nối socket/TCP và trả về thông báo "Bạn đã bị kick".
- **Ban (Cấm):** Ghi thông tin (lý do, thời gian hết hạn) vào CSDL quan hệ (như PostgreSQL). Đồng thời, phát broadcast event. Game server sẽ drop ngay kết nối của người chơi đó. Khi đăng nhập lại, bước handshake ban đầu sẽ kiểm tra với Moderation Service, nếu dính ban, chặn từ cửa.
- **Mute (Cấm chat):** Dịch vụ Chat (Chat Microservice) sẽ tra cứu Redis xem player có cờ `is_muted` không trước khi phát đi tin nhắn. Ở phía client của người bị Mute, họ vẫn gửi đi bình thường, nhưng server sẽ ngầm "drop" tin nhắn (không gửi đến ai khác).
- **Dashboard Admin Cần Có:** Tính năng phân quyền Role-Based Access Control (RBAC) (để tránh lạm dụng quyền Ban), và hiển thị lịch sử (Audit Log) về mọi hành động của Mod (nhằm chống lạm quyền).

## 2. Kiến trúc Shadowbanning (Cấm ngầm)
Shadowban (hay Hellban/Ghostban) là kỹ thuật phạt mà người chơi bị vi phạm không hề nhận ra. Mục đích là để họ không tạo account mới và giữ họ "chơi" trong vô vọng, đặc biệt hiệu quả với cheater và bot.

**Cơ chế Kỹ thuật (Invisible to others, but thinks they are playing):**
- **Quyền lực thuộc về Server (Server-Side Authority):** Mọi hành động, vị trí của các người chơi được server tổng hợp và đồng bộ (Replication) về các client khác. 
- **Lọc luồng đồng bộ (Replication Stream Filtering):** Khi người chơi bị cắm cờ `shadowban_flag`, Game Server sẽ loại bỏ (filter out) toàn bộ gói tin định vị, hoạt ảnh, tấn công, và chat của người đó trước khi broadcast cho những người chơi khác trong cùng khu vực (Zone/Instance). 
- **Client của người bị phạt:** Vẫn nhận được thông tin thế giới xung quanh một cách bình thường (vì Game Server vẫn gửi data cho họ) và họ gửi gói tin đi thành công. Bản thân client vẫn render nhân vật của họ trên màn hình của họ, khiến họ tin rằng mọi thứ vẫn đang hoạt động.
- **Matchmaking Silos:** Trong các hệ thống PvP hoặc Dungeon Finder, thay vì cấm hẳn, hệ thống tự động đẩy những tài khoản shadowban vào cùng một hàng chờ (queue) chỉ gồm toàn những cheater/hacker (Cheater Pool).

## 3. Hệ thống Audit Logs & CSDL để điều tra Gian lận
Để điều tra RMT (Real-Money Trading), hành vi bot, hoặc gian lận, game phải log toàn bộ hành vi, nhưng tuyệt đối không được làm ảnh hưởng đến hiệu năng thời gian thực.

**Kiến trúc cơ sở dữ liệu:**
1. **Asynchronous Logging (Ghi log bất đồng bộ):** Game server gửi sự kiện hành động qua các hàng đợi (như Kafka hoặc RabbitMQ) dạng "Bắn và Quên" (Fire-and-Forget).
2. **Cold/Warm Storage:** Dữ liệu Audit không lưu ở DB chính (PostgreSQL/Redis) để tránh "phình to" chậm server. Nó được stream vào Data Warehouse hoặc Columnar Database chuyên phân tích tốc độ cao như **ClickHouse, Google BigQuery, hoặc ELK Stack (Elasticsearch)**.

**Chiến lược thiết kế schema (Structured Logging):**
- **Log Giao dịch (Trades):** Schema phải bao gồm `transaction_id`, `sender_id`, `receiver_id`, `item_id_list`, `currency_amount`, `location`, `ip_address`, `timestamp`.  
  *Cách điều tra RMT:* Hệ thống phân tích log tìm các mẫu "chuyển giao giá trị một chiều", tức là một account level thấp liên tục nhận tài sản giá trị cao từ các account khác mà không trade lại gì, hoặc ngược lại.
- **Log Chat:** Schema gồm `sender_id`, `channel`, `message_body`, `recipient_id`.  
  *Cách điều tra:* Dùng NLP (xử lý ngôn ngữ) quét log thường xuyên để tìm các từ khóa quảng cáo web cày thuê, bán vàng, hoặc lời lẽ độc hại (toxicity) để tự động áp dụng Mute hoặc Shadowban.
- **Log Di chuyển & Kỹ năng (Movements & Anti-Cheat):** Hệ thống không nên lưu mọi toạ độ trên mỗi khung hình vì quá tải. Chỉ lưu **các sự kiện có chỉ số rủi ro (Risk Score)**. Server phải validate mọi di chuyển (ví dụ: di chuyển quá khoảng cách tối đa trong 1 giây là không thể). Khi phát hiện, server ghi log hành vi phi lý này kèm `confidence_score` cao, lưu lại `path_nodes` (đường di chuyển).  
  *Cách điều tra:* Đối chiếu tọa độ lưu trong ClickHouse với biểu đồ Navigation Mesh (NavMesh) của game, hoặc chạy Machine Learning để nhận diện các quỹ đạo di chuyển mang tính lặp đi lặp lại như cái máy (dấu hiệu của Bot Auto).

Tóm lại, để kiến trúc có thể mở rộng và hiệu quả, Moderation phải được tách thành Microservice chuyên biệt, kết hợp với các công cụ phân tích sự kiện bất đồng bộ dựa trên luồng dữ liệu Log lớn.
