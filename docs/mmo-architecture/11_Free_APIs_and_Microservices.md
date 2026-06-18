# Báo cáo Đánh giá Kỹ thuật: 3rd-Party APIs & Microservices (Free Tier) cho Social MMO

### 1. Lọc từ ngữ thô tục & Độc hại (Profanity & Toxicity Filtering)
- **PurgoMalum**: Là một RESTful API hoàn toàn miễn phí, không yêu cầu xác thực rườm rà (`/service/json?text=...`). Hệ thống hỗ trợ nhận diện các ký tự lách luật (vd: '@' thay cho 'a') và cho phép tuỳ chỉnh thêm danh sách từ cấm hoặc từ an toàn (safe words) thông qua query parameters. Rất lý tưởng cho việc lọc tên phòng và hệ thống chat của game.
- **Perspective API (Google)**: Mặc dù dùng AI rất mạnh nhưng **KHÔNG ĐƯỢC KHUYẾN NGHỊ**. API này có quota mặc định rất thấp (1 request/giây), không cho phép nâng hạn mức và quan trọng nhất là Google đã thông báo **khai tử (sunset) dịch vụ này vào ngày 31/12/2026**.
👉 **Quyết định**: Dùng **PurgoMalum** để triển khai nhanh và ổn định cho MVP.

### 2. Geolocation & Matchmaking (Định vị IP)
- **MaxMind GeoLite2**: Khác với các API RESTful thông thường, GeoLite2 là một Database tải trực tiếp về server (self-hosted). Việc tra cứu IP diễn ra ngay tại bộ nhớ local của backend, giúp đạt tốc độ siêu tốc (zero network latency) và **không giới hạn số lượng request**. Hoàn toàn miễn phí, chỉ cần cấu hình tự động cập nhật database định kỳ.
- **IPinfo (Lite)**: Hoàn toàn không giới hạn request nếu chỉ lấy dữ liệu cấp Quốc gia (Country) và ASN, nhưng cần token.
- **IP-API**: Gói miễn phí bị giới hạn ở 45 request/phút và cấm dùng cho mục đích thương mại, rất dễ bị thắt cổ chai (throttle).
👉 **Quyết định**: Tích hợp trực tiếp **MaxMind GeoLite2** tại backend để phân luồng người chơi vào cụm máy chủ gần nhất mà không lo tốn phí API hay bị giật lag.

### 3. Xử lý & Lưu trữ Hình ảnh (Avatars/Thumbnails)
- **Cloudinary**: Là nền tảng tối ưu nhất để thay thế/bổ trợ cho Supabase Storage trong việc upload và xử lý đa phương tiện.
- **Free Tier (Tính đến 2026)**: Cung cấp **25 credits/tháng** (tính theo chu kỳ cuốn chiếu 30 ngày). Trong đó, 1 credit = 1,000 lần xử lý ảnh (transformations), HOẶC 1GB lưu trữ, HOẶC 1GB băng thông. Tương đương với việc có 25GB lưu trữ hoặc tối đa 25,000 lần tối ưu ảnh miễn phí.
👉 **Quyết định**: Dùng **Cloudinary** để upload avatar/thumbnail. Game có thể tự động gọi API của Cloudinary để resize và nén ảnh xuống định dạng WebP/AVIF trước khi tải vào Unity/WebGL, giúp giảm tải đáng kể bộ nhớ RAM của thiết bị người chơi.

### 4. Phân tích dữ liệu & Theo dõi lỗi (Analytics & Error Tracking)
- **PostHog**: Giải pháp All-in-one vô cùng hào phóng cho các startup. Gói miễn phí cung cấp:
  - **1 triệu events/tháng** cho Analytics (hoàn hảo để đo Player Retention, DAU, MAU).
  - **100,000 exceptions (lỗi)/tháng** (gấp 20 lần Sentry).
  - **5,000 session replays/tháng** để ghi hình lại lúc người chơi gặp lỗi.
  - Không giới hạn số lượng thành viên dự án.
- **Sentry**: Dù là chuẩn công nghiệp để theo dõi mã nguồn, nhưng gói Developer miễn phí rất hạn hẹp: chỉ 5,000 lỗi/tháng, 50 replays/tháng và giới hạn cho 1 tài khoản quản trị.
👉 **Quyết định**: Lựa chọn **PostHog** làm trung tâm cho cả việc phân tích hành vi người chơi lẫn log lỗi hệ thống (như WebGL crash logs). Mức miễn phí của PostHog là quá đủ để một MMO hoạt động trơn tru trong giai đoạn vận hành ban đầu.
