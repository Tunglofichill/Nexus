# Báo Cáo Kỹ Thuật: DevOps, CI/CD & Cập Nhật Không Gián Đoạn (Zero-Downtime) Cho Game Server Stateful

Dưới đây là báo cáo nghiên cứu chuyên sâu về các phương pháp và kiến trúc DevOps dành riêng cho stateful game servers (MMO, Multiplayer):

### 1. Cập Nhật Không Gián Đoạn (Zero-Downtime Deployments)
Khác với web server (stateless), game server duy trì trạng thái liên tục (vị trí, máu, kết nối) của người chơi. Do đó, không thể áp dụng Rolling Updates thông thường vì sẽ làm ngắt kết nối những người chơi đang trong trận.
*   **Graceful Connection Draining (Rút cạn kết nối an toàn):** Đây là phương pháp phổ biến nhất (thường được gọi là Draining hoặc Rainbow Deployment). Khi triển khai phiên bản mới, hệ thống định tuyến (Matchmaker/Load Balancer) sẽ bắt đầu chỉ định hướng người chơi **mới** vào các máy chủ phiên bản mới.
*   **Vòng đời máy chủ cũ:** Các máy chủ chạy phiên bản cũ sẽ chuyển sang trạng thái "Draining". Chúng ngừng nhận người chơi mới nhưng vẫn tiếp tục duy trì hoạt động phục vụ các session hiện tại cho đến khi trận đấu kết thúc tự nhiên hoặc người chơi tự thoát. Chỉ khi máy chủ đã trống hoàn toàn, nó mới được dập tắt (terminate) một cách an toàn.

### 2. State Hydration / Transfer (Dịch chuyển và Phục hồi trạng thái)
Trong các game MMO nơi người chơi ở trong một thế giới liên tục, nếu bắt buộc phải bảo trì một server (Server A) đang chạy, ta cần chuyển người chơi sang Server B mà không làm rớt mạng. Quá trình di chuyển liền mạch (seamless migration) hoạt động theo cơ chế sau:
*   **Kiến trúc Gateway / Proxy:** Người chơi không kết nối trực tiếp đến IP của Game Server. Họ kết nối vào một Proxy server đóng vai trò giữ kết nối TCP/UDP ổn định.
*   **State Transfer (Chuyển giao trạng thái):** Server A sẽ tạm "đóng băng" (freeze) các logic cập nhật của game trong vài mili-giây, gom gói (serialize) toàn bộ trạng thái trong RAM (inventory, tọa độ, thông tin nhân vật) thành một snapshot và gửi thẳng sang Server B (hoặc qua một Data Store trung gian tốc độ cao như Redis/Memcached).
*   **State Hydration (Phục hồi/Cấp nước trạng thái):** Server B nhận luồng dữ liệu, tiến hành giải nén và "hydrate" (bơm) vào bộ nhớ nội bộ của nó, khởi tạo lại chính xác thế giới ở khung hình cuối cùng của Server A.
*   **Chuyển đổi (Switchover):** Ngay sau khi Server B sẵn sàng, Proxy sẽ định tuyến lại luồng gói tin sang Server B. Người chơi sẽ chỉ gặp hiện tượng giật lag nhẹ (latency spike) trong chớp mắt mà không hề hay biết server vật lý phía sau đã được thay đổi.

### 3. Infrastructure as Code (IaC) & Best Practices cho MMO
Việc quản lý hạ tầng bằng Terraform, Kubernetes và Agones là tiêu chuẩn công nghiệp hiện nay:
*   **Terraform:** Được dùng để cấp phép hạ tầng lõi một cách tĩnh (VPC, Node Pools, Kubernetes/EKS clusters, IAM Roles). Các best practices bao gồm: chia nhỏ cấu trúc code thành các Module có thể tái sử dụng, lưu trữ Remote State ở một backend an toàn (S3+DynamoDB/Terraform Cloud) và triển khai qua CI/CD pipeline (GitOps).
*   **Kubernetes & Agones (Điều phối Game Server):** Agones biến K8s thành một bộ máy chuyên quản lý Game Server stateful.
    *   **Dedicated Node Pools:** Luôn phân tách môi trường bằng cách cho Game Server chạy trên các Node Pool riêng biệt. Sử dụng Taints/Tolerations để ngăn các thành phần hệ thống (Monitoring agents, CoreDNS) chạy cùng Node, tránh tranh giành tài nguyên CPU gây lag cho game.
    *   **Tích hợp Agones SDK:** Game Server cần phải tích hợp Agones SDK để có thể tương tác với K8s. Các lệnh như `Ready()` (đã tải xong tài nguyên), `Allocate()` (đã có người chơi/trận đấu) và `Shutdown()` (kết thúc vòng đời) là bắt buộc để K8s không vô tình kill nhầm server đang có người chơi.
    *   **Fleets & Auto-scaling:** Sử dụng khái niệm `Fleet` của Agones để gộp nhóm Game Server. Việc Auto-scaling phải dựa trên các metrics đặc thù (số lượng người chơi, buffer server dự phòng) thay vì CPU/RAM như các ứng dụng web thông thường, đảm bảo có sẵn server ngay khi lượng người chơi tăng đột biến.
