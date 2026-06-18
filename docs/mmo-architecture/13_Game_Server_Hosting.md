# Báo cáo Nghiên cứu Hạ tầng: Lưu trữ Game Server Stateful (Node.js/WebSockets)

Tôi đã hoàn thành nghiên cứu chi tiết về hạ tầng mạng cho ứng dụng WebSockets Game Server, tập trung vào giải quyết vấn đề của Vercel, so sánh các nền tảng (cập nhật 2026), và phương án mở rộng/tích hợp. Dưới đây là kết quả phân tích bằng tiếng Việt:

### 1. Vấn đề cốt lõi của Vercel với Stateful Game Loop
Vercel được xây dựng trên kiến trúc **Serverless** (stateless & ephemeral). Các Serverless Functions có thời gian sống ngắn, tự động bị hủy (timeout) và scale xuống 0 khi không có HTTP request.
Trong khi đó, một game loop MMO (dùng WebSockets thuần hoặc framework như Colyseus) yêu cầu:
- **Kết nối liên tục (Long-lived connections):** WebSockets cần duy trì trạng thái kết nối (state) của client ghim vào một máy chủ cố định.
- **Tiến trình chạy nền (Background process):** Vòng lặp game cần liên tục chạy trên RAM (ví dụ: 60 ticks/giây) để cập nhật vật lý, tính toán va chạm và đồng bộ trạng thái (state sync) giữa các người chơi.
Do đó, không thể dùng Vercel làm Node.js WebSockets server; bạn bắt buộc phải tách phần Backend (Game Server) sang một nền tảng hỗ trợ các tiến trình chạy liên tục (long-running containers hoặc VMs).

### 2. So sánh các Nền tảng Hosting
- **Fly.io:**
  - *Đặc điểm:* Triển khai ứng dụng dưới dạng MicroVMs toàn cầu.
  - *Ưu điểm:* Là lựa chọn hàng đầu cho game. Cho phép deploy máy chủ gần người chơi nhất (giảm tối đa ping/latency). Xử lý WebSockets cực tốt ở tầng edge.
  - *Nhược điểm:* Đường cong học tập cấu hình mạng nội bộ và `fly.toml` phức tạp hơn các nền tảng PaaS khác.
- **Railway:**
  - *Đặc điểm:* Container-based PaaS (Zero-config).
  - *Ưu điểm:* Trải nghiệm Developer xuất sắc nhất. Các container luôn chạy 24/7 không bị sleep, hỗ trợ native WebSockets "out-of-the-box" mà không cần tuỳ chỉnh sâu.
  - *Nhược điểm:* Thiếu các tùy chọn mạng lưới toàn cầu chuyên sâu như Fly.io nếu game yêu cầu đặt server ở quá nhiều châu lục.
- **Hathora:**
  - *Đặc điểm:* Game Server Orchestrator chuyên biệt cho game multiplayer.
  - *Ưu điểm:* Giải quyết triệt để bài toán mở rộng động (dynamic scaling) cho mô hình "Room/Match". Hathora sẽ tự động spin-up một server ở khu vực gần người chơi nhất khi có trận đấu mới, và tắt đi khi xong.
  - *Nhược điểm:* Yêu cầu phải thiết kế game theo chuẩn API phòng chơi của Hathora; có thể dư thừa/không phù hợp nếu bạn muốn làm một máy chủ MMO thế giới mở (monolithic) luôn chạy.
- **DigitalOcean App Platform:**
  - *Đặc điểm:* Nền tảng PaaS chung.
  - *Ưu điểm:* Hỗ trợ tốt `wss://` qua cổng 443; dễ cấu hình nếu bạn đã quen với DigitalOcean.
  - *Nhược điểm:* Hệ thống Load Balancer tối ưu cho các request HTTP tiêu chuẩn hơn là WebSockets. Khi dự án lớn lên, giới developer thường phải chuyển từ App Platform về tự quản trị trên DigitalOcean Droplets (VPS) để không bị ngắt kết nối oan.

### 3. Tầng Miễn phí (Free Tier) & Mở rộng (Scaling) với Redis
- **Về Free Tier (Cập nhật 2026):**
  - Thực tế hiện nay, **Fly.io và Railway không còn gói Free Tier vĩnh viễn** cho tài khoản mới. Fly.io hoạt động hoàn toàn theo dạng pay-as-you-go (chỉ có trial vài tiếng hoặc 7 ngày). Railway cung cấp $5 credit cho 30 ngày đầu, sau đó giới hạn ở mức ngân sách $1/tháng (chỉ đủ cho ứng dụng rất nhỏ).
  - Hathora có gói "Explore" dành cho dev nhưng mục đích chủ yếu là kiểm thử hệ thống API matchmaker.
  - *Khuyến nghị:* Để prototype một MMO Backend ổn định và không bị gián đoạn, hãy chuẩn bị ngân sách khoảng $5/tháng (cho gói Hobby của Railway, hoặc 1 máy ảo cơ bản của Fly.io/DO Droplet).
- **Mở rộng Horizontal Scaling qua Redis:**
  - Khi người chơi tăng lên, một server Node.js sẽ chạm trần CPU. Bạn cần nhân bản (scale) lên nhiều instances.
  - Do WebSockets là stateful (Player A ghim vào Server 1, Player B ghim vào Server 2), chúng không thể nhìn thấy nhau.
  - *Giải pháp:* Sử dụng **Redis Pub/Sub** (VD: `RedisPresence` trong Colyseus). Bất cứ khi nào Player A di chuyển, Server 1 sẽ *publish* sự kiện này vào Redis. Server 2 đang *subscribe* sẽ nhận được thông điệp từ Redis và *broadcast* xuống Player B. Cả Fly.io và Railway đều hỗ trợ thiết lập Managed Redis chỉ với một click.

### 4. Tích hợp: Next.js (Vercel) kết nối an toàn với Fly.io/Railway
Để thiết lập giao tiếp bảo mật giữa giao diện (Next.js trên Vercel) và máy chủ Game (trên Fly/Railway):
1. **Giao thức WSS:** Cả Fly.io và Railway đều tự động lo việc cấp phát chứng chỉ SSL ở tầng Edge. Từ client Next.js, bạn chỉ cần mở kết nối bằng WebSocket Secure (`wss://your-game-backend.up.railway.app`).
2. **CORS:** Cấu hình server Node.js chỉ chấp nhận luồng Upgrade WebSockets từ origin là domain của Next.js (ví dụ `https://my-game.vercel.app`), chặn lập tức các nguồn gốc lạ.
3. **Xác thực Handshake (Auth):** 
   - Quản lý định danh người chơi ở Frontend bằng JWT token (hoặc NextAuth.js).
   - Khi client khởi tạo kết nối (trong hàm `joinRoom` của Colyseus hoặc constructor của `WebSocket`), gửi kèm Token này.
   - Tại Backend (trong vòng đời `onAuth` của Colyseus), tiến hành xác thực JWT. Nếu hợp lệ thì cho phép tạo Socket Connection; nếu token sai hoặc hết hạn, ngắt kết nối (`socket.close()`) ngay lập tức để tiết kiệm tài nguyên.
