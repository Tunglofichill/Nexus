# Báo Cáo Cấu Trúc: Triển Khai MMO Cho Stack Nexus TV (Next.js + Supabase)

Việc ghép một máy chủ Game MMO vào hệ sinh thái Web hiện đại như Next.js (App Router) và Supabase đòi hỏi sự tách biệt rõ ràng giữa "Dữ liệu Ổn định" (Giao diện, Profile) và "Dữ liệu Bay hơi" (Tọa độ di chuyển, Game Loop).

Dưới đây là phương án kiến trúc cụ thể cho dự án Nexus TV.

## 1. Tích Hợp Máy Chủ Backend & Bàn Giao Xác Thực (Auth Handoff)
- **Cơ chế Bàn Giao:** Vì Supabase sinh ra mã thông báo JWT (JSON Web Token) chuẩn hóa khi Sếp đăng nhập, Client Next.js sẽ lấy cái JWT này và nhét vào yêu cầu kết nối WebSocket gửi đến Máy Chủ Game MMO (VD: Colyseus, Nakama, hoặc Custom Node.js).
- **Máy Chủ Game Xác Nhận:** Máy Chủ Game sẽ tự giải mã và kiểm tra JWT này bằng đoạn mã bí mật (JWT Secret) của Supabase. Việc này giúp Máy Chủ Game nhận diện ngay lập tức Sếp là ai một cách bảo mật tuyệt đối mà KHÔNG CẦN gọi API về cơ sở dữ liệu Supabase để hỏi lại. Tốc độ xác thực diễn ra trong chớp mắt.

## 2. Điểm Yếu Của Next.js & Cách Hosting
- **Điểm yếu chí mạng:** Các API Route và Server Action của Next.js bản chất là không trạng thái (Stateless) và hoạt động theo dạng Serverless (Gọi xong là tắt). Chúng KHÔNG THỂ duy trì một vòng lặp game 20 lần/giây hay giữ kết nối WebSocket sống liên tục.
- **Giải Pháp Xương Sống:** Giữ Next.js làm nhiệm vụ tạo Giao diện Web (UI), điều hướng trang, và tải dữ liệu tĩnh (REST/GraphQL). Còn Máy Chủ Game MMO bắt buộc phải được lập trình thành một ứng dụng Node.js/Go/Rust riêng biệt và chạy trên các server vật lý/Cloud hỗ trợ kết nối sống lâu dài (Stateful Connections) như Fly.io, Railway, AWS ECS, hoặc máy ảo VPS thông thường.
- **Luồng Kết Nối:** Giao diện Next.js trên trình duyệt sẽ có một đoạn Script chạy ngầm để mở đường truyền WebSocket (VD: `wss://game.nexus.tv`) cắm thẳng vào Máy Chủ Game độc lập kia.

## 3. Supabase Realtime Chống Lại Custom Sockets
- **Supabase Realtime KHÔNG Dành Cho Lõi Game (Game Loop):** Gói Pro của Supabase giới hạn 500 tin nhắn/giây. Với 1000 người chơi cùng gửi và nhận tọa độ 20 lần/giây, hệ thống sẽ sinh ra **hàng triệu tin nhắn mỗi giây**. Sếp sẽ ngay lập tức bị khóa API (Lỗi HTTP 429), và nếu mở khóa, hóa đơn tiền cước sẽ làm Sếp phá sản (Trừ tiền theo từng triệu tin nhắn).
- **Giải Pháp:** Một Máy Chủ Game Độc Lập (như Colyseus) là Bắt Buộc. Máy chủ này sẽ chia bản đồ ra nhiều phòng (Rooms/Spatial Partitioning) để Sếp chỉ phải tải thông tin của những đứa đứng cạnh mình, tiết kiệm 99% băng thông. Supabase Realtime chỉ dùng cho những thao tác cực chậm (VD: Bật xanh đèn báo bạn bè đang Online, hoặc nhắn tin Kênh Thế Giới).

## 4. Quản Lý Trạng Thái Giao Diện (React State vs WebGL rendering)
- **Thảm Họa Render:** Nếu Sếp ngu ngốc lấy tọa độ nhân vật (cập nhật 60 lần/giây) nhét vào `useState` hoặc các Hook thông thường của React. Toàn bộ Giao Diện Web (HTML, Nút bấm, Khung Chat) sẽ bị bắt phải vẽ lại (Re-render) 60 lần 1 giây. Trình duyệt sẽ sập, máy sẽ nóng ran và giật tung chảo.
- **Giải Pháp Thoát Hiểm (Cập Nhật Chớp Nhoáng - Transient Updates):** Sử dụng thư viện **Zustand** kết hợp với `useRef` của React để hoàn toàn chặt đứt vòng lặp Game ra khỏi vòng lặp vẽ UI của React.
  - Khi WebSocket nhận tọa độ mới, nó ghi đè âm thầm vào kho dữ liệu Zustand.
  - Trong bộ công cụ 3D (R3F Canvas), các mô hình 3D đọc trực tiếp tọa độ này (bằng `subscribe` hoặc móc thẳng vào vòng lặp `useFrame`) để gán cho `ref.current.position.set(x,y,z)` của đồ vật 3D.
  - **Kết quả:** Các mô hình 3D chạy mượt mà 60fps trên màn hình mà React KHÔNG HỀ HAY BIẾT, tức là giao diện HTML không bị giật lại một khung hình nào. Các sự kiện vẽ UI của React chỉ xảy ra khi Sếp thực sự bấm nút mở Menu hoặc có tin nhắn mới. Mượt mà tuyệt đối!
