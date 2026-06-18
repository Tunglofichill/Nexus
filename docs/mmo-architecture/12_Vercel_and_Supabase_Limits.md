# Báo cáo Hạ tầng Kỹ thuật: Đánh giá Vercel và Supabase cho Game MMO

Báo cáo này phân tích các giới hạn kỹ thuật và mô hình giá của Vercel cùng Supabase khi áp dụng vào việc xây dựng một tựa game Massively Multiplayer Online (MMO). Đồng thời, đề xuất kiến trúc tối ưu chi phí để tận dụng thế mạnh của các nền tảng này mà không làm phát sinh chi phí ngoài tầm kiểm soát.

## 1. Giới hạn của Vercel

### Vấn đề với WebSockets ở Serverless/Edge Functions
*   **Không hỗ trợ kết nối liên tục:** Vercel Functions (cả Serverless và Edge) được thiết kế theo mô hình *stateless* (phi trạng thái) và *request-response* ngắn hạn. Chúng **không hỗ trợ** các kết nối WebSocket hai chiều, liên tục (persistent TCP/IP) vốn là xương sống của mọi game nhiều người chơi.
*   **Thời gian thực thi (Timeout):** Các function có giới hạn thời gian chạy tối đa (ví dụ 10-60 giây ở các gói thông thường, tối đa 300-1800 giây cho một số ngoại lệ nhưng không phải kết nối mở), sau đó sẽ bị buộc chấm dứt. Do đó, hoàn toàn không thể dùng Vercel làm server xử lý game loop thời gian thực.

### Chi phí Băng thông (Bandwidth) với 10,000 người chơi
*   **Giới hạn gói cước:** Băng thông trên Vercel được gọi là "Fast Data Transfer". Gói Pro (hiện tại từ $20/tháng/user) bao gồm **1TB/tháng**. Gói Hobby chỉ có 100GB.
*   **Chi phí vượt mức (Overage):** Khi vượt quá 1TB, Vercel tính phí khoảng **$40 cho mỗi 100GB** (tương đương $0.40/GB).
*   **Kịch bản 10,000 người chơi:** Nếu 10k người chơi liên tục tải ứng dụng Next.js frontend và các tài nguyên nặng như 3D assets (models, textures, âm thanh), băng thông có thể dễ dàng tiêu tốn hàng chục Terabyte mỗi tháng. Việc phục vụ tài nguyên 3D qua hạ tầng CDN của Vercel có thể đẩy hóa đơn lên mức hàng nghìn USD (Ví dụ: 10TB phát sinh = ~$3,600/tháng).

## 2. Giới hạn của Supabase

### Giới hạn của Supabase Realtime (Concurrent & Messages)
*   **Gói Free:** Hỗ trợ tối đa 200 kết nối đồng thời, 100 tin nhắn/giây, và quota 2 triệu tin nhắn/tháng.
*   **Gói Pro ($25/tháng):** Hỗ trợ tối đa 500 kết nối đồng thời, 500 tin nhắn/giây, và quota 5 triệu tin nhắn/tháng.
*   **Phân tích MMO:** Với 10,000 CCU (người chơi đồng thời), bạn sẽ vượt xa giới hạn gói Pro. Chi phí phát sinh của Supabase là khoảng **$10 cho mỗi 1,000 kết nối thêm** và **$2.50 cho mỗi 1 triệu tin nhắn**. Với một game MMO liên tục gửi tọa độ và thao tác di chuyển, số lượng tin nhắn sẽ chạm ngưỡng hàng tỷ mỗi tháng, dẫn đến chi phí Realtime khổng lồ.

### Ghi dữ liệu tần số cao vào Postgres (ví dụ 10 lần/giây/người)
*   **Giới hạn vật lý (I/O & CPU):** Supabase không tính phí theo số lượt write như Firestore, bạn trả tiền cho cấu hình máy chủ (Compute Instance). Tuy nhiên, việc ghi tọa độ người chơi vào Postgres 10 lần/giây với 10,000 người sẽ tạo ra **100,000 writes/giây**. Điều này sẽ ngay lập tức làm "sập" Disk I/O, CPU và RAM của máy chủ Postgres (ngay cả ở các bản nâng cấp Compute lớn nhất).
*   **Cơ sở dữ liệu quan hệ không dành cho Game Tick:** Postgres được sinh ra để đảm bảo tính nhất quán (ACID) của dữ liệu vĩnh viễn, không phải để làm bộ nhớ tạm cho game state thời gian thực.

## 3. Kiến trúc Tối ưu Chi phí (Cost Optimization)

Để tận dụng ưu điểm của Vercel (Developer Experience tốt) và Supabase (Bảo mật, quản lý data tĩnh) mà không bị "phá sản", bạn cần phân chia kiến trúc như sau:

### A. Nhiệm vụ của Vercel & Supabase (Vùng web / Metagame)
*   **Supabase Auth:** Xử lý hoàn toàn việc đăng ký, đăng nhập, bảo mật phiên người dùng.
*   **Supabase Postgres:** Lưu trữ dữ liệu "chậm" và bền vững. Ví dụ: thông tin tài khoản, túi đồ (inventory), tiền tệ trong game, cấp độ, bảng xếp hạng. Chỉ gọi API ghi vào Postgres khi kết thúc trận, người chơi mua đồ, hoặc định kỳ "save game" mỗi 5-10 phút.
*   **Vercel (Next.js):** Deploy các trang không yêu cầu WebSockets như Landing Page, Giao diện cửa hàng vật phẩm, Bảng xếp hạng, Quản lý tài khoản.

### B. Giải pháp thay thế cho phần cốt lõi của Game (Game Loop & Assets)
1.  **Dùng Game Server/VPS riêng biệt (Cho WebSockets & Game State):**
    *   Viết một Authoritative Server riêng (bằng Node.js, Go, Rust, hoặc Headless Unity/Unreal).
    *   Triển khai server này trên các nền tảng có giá cố định băng thông và hỗ trợ kết nối TCP/WebSocket lâu dài như **Hetzner (Dedicated/VPS)**, **DigitalOcean**, **Render**, hoặc **Fly.io**.
    *   Server này sẽ giữ toàn bộ game state (tọa độ người chơi) trên RAM hoặc một in-memory DB như Redis. Người chơi kết nối WebSocket trực tiếp đến Game Server này.
2.  **Lưu trữ 3D Assets tĩnh với Zero Egress Fee:**
    *   **TUYỆT ĐỐI KHÔNG** để file 3D nặng trong thư mục `/public` của ứng dụng Next.js trên Vercel.
    *   Offload toàn bộ assets lên các dịch vụ Object Storage có chính sách miễn phí hoặc cực rẻ phí xuất dữ liệu (Egress Bandwidth). Lựa chọn tốt nhất hiện nay là **Cloudflare R2** (miễn phí băng thông đầu ra) hoặc **Backblaze B2 kết hợp Cloudflare**.

## Kết luận
Vercel và Supabase là lựa chọn tuyệt vời để xây dựng "vỏ bọc" và cơ sở dữ liệu chính của một tựa game. Nhưng để vận hành hệ thống kết nối thời gian thực và phân phối tài nguyên 3D lớn cho 10,000 người chơi, bạn bắt buộc phải dùng một máy chủ chuyên dụng (VPS/Containers) cho Game Loop và Cloudflare R2 cho việc tối ưu băng thông. Nếu dùng sai mục đích của Vercel và Supabase Realtime, dự án sẽ ngay lập tức thất bại vì các rào cản kỹ thuật và hóa đơn hàng nghìn USD.
