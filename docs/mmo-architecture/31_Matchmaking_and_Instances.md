### Báo cáo Kỹ thuật: Hệ thống Matchmaking và Quản lý Instance cho Game MMO

**1. Hệ thống Lobby (Lobby System) - Ghép đội 4-8 người**
Để gom nhóm từ 4-8 người chơi cho một mini-game hoặc phụ bản (dungeon), giải pháp tiêu chuẩn hiện nay là sử dụng **Open Match** (một framework mã nguồn mở do Google phát triển).
- **Quy trình hoạt động:**
  - **Tạo Ticket (Vé):** Khi người chơi trong Open World muốn tham gia phụ bản, client sẽ gửi một yêu cầu (Ticket) đến `Frontend Service` của Open Match. Ticket này chứa các thông số như cấp độ (level), vai trò (tank, healer, DPS), hoặc điểm MMR.
  - **Hàng chờ (Queue) & Logic Ghép trận (Match Function):** Các ticket được đưa vào hàng chờ. Một `Match Function` (service chứa logic riêng do nhà phát triển lập trình) sẽ liên tục duyệt qua các ticket để tìm ra 4-8 người chơi phù hợp nhất dựa trên tiêu chí đã định (ví dụ: đủ 1 tank, 1 healer, 2 DPS).
  - **Kết quả:** Khi gom đủ người, Open Match tạo ra một `Match` (Trận đấu) và chuẩn bị cho bước cấp phát server.

**2. Khởi tạo Instance (Instance Spinning) trên Kubernetes (Agones)**
Khi đã có một `Match` gồm nhóm người chơi, hệ thống cần một Dedicated Game Server riêng cho phụ bản này. **Agones** (mở rộng trên nền tảng Kubernetes) là công cụ orchestration lý tưởng để quản lý vòng đời của các server này.
- **Quy trình khởi tạo:**
  - **Fleet & Autoscaling:** Quản trị viên khai báo một tập hợp (Fleet) các Game Server luôn ở trạng thái `Ready` (đứng chờ sẵn) hoặc tự động scale lên (Autoscaling) khi nhu cầu tăng.
  - **Director Service:** Đây là cầu nối giữa Open Match và Agones. Khi Director nhận được một `Match` từ Open Match, nó sẽ gọi API đến Agones để yêu cầu một `GameServerAllocation` (Cấp phát máy chủ).
  - **Allocation (Cấp phát):** Agones sẽ tìm một Game Server đang `Ready` trong Fleet, đổi trạng thái của nó thành `Allocated` (đã cấp phát, không ai khác được dùng), sau đó trả về địa chỉ **IP và Port** của Pod này cho Director. Nếu không có sẵn server `Ready`, Fleet Autoscaler sẽ tự động yêu cầu Kubernetes spin up các Pod mới.
  - **Kết nối:** Director gửi thông tin IP/Port này lại cho 4-8 người chơi thông qua kết nối hiện tại của họ để chuẩn bị di chuyển.

**3. Chuyển đổi trạng thái và không gian (Match State & Seamless Transition)**
Việc chuyển từ Global Open World sang Instanced Server sao cho mượt mà (seamless) - không bị lag hoặc không cần màn hình loading - đòi hỏi kiến trúc kết nối và đồng bộ dữ liệu tinh vi.
- **Gateway / Connection Server:** Để tránh việc client phải ngắt kết nối hoàn toàn và kết nối lại từ đầu (gây ra loading screen), client thường giữ một kết nối bền vững (TCP/UDP) với một `Gateway Server` (hoặc Proxy).
- **Quá trình Handoff (Bàn giao):**
  - **Lưu và Đồng bộ Trạng thái (State Sync):** Trước khi rời Open World, server đang quản lý khu vực Open World sẽ "đóng băng" người chơi, lưu trữ (serialize) trạng thái hiện tại (vị trí, máu, buff, inventory) vào một In-memory Database (như Redis) hoặc gửi trực tiếp cho Instanced Server thông qua backend network.
  - **Pre-loading (Tải trước):** Instanced Server nhận trước dữ liệu của nhóm người chơi và khởi tạo entity của họ trong bộ nhớ server trước khi họ thực sự xuất hiện.
  - **Redirecting Route:** Sau khi server đích đã sẵn sàng, Gateway Server sẽ âm thầm chuyển tiếp (route) các gói tin mạng của client từ Open World Server sang Instanced Server. Do client chỉ giao tiếp với Gateway, quá trình đổi server đằng sau diễn ra hoàn toàn vô hình với người chơi.
  - **Che giấu độ trễ (Boundary Buffering & Animation):** Trong lúc hệ thống serialize dữ liệu và Agones cấp phát server (có thể mất vài trăm mili-giây), game thường sử dụng các kỹ thuật thiết kế như: mở một cánh cửa dài, đi qua một hành lang hẹp (buffer zone), hoặc một đoạn cắt cảnh (cutscene) để che giấu thời gian xử lý của hệ thống mạng.

**Tóm tắt luồng hệ thống (Workflow):**
1. Người chơi ở Open World bấm tham gia Dungeon.
2. Gửi `Ticket` tới Open Match.
3. `Match Function` gom đủ 4-8 người thành một `Match`.
4. `Director` lấy Match và yêu cầu `Agones Allocation`.
5. Agones cấp phát một Pod (Instance) và trả về IP/Port.
6. Open World Server lưu state của 8 người lên Redis.
7. Gateway chuyển luồng kết nối mạng của 8 người sang IP/Port mới.
8. Người chơi tiếp tục di chuyển và xuất hiện mượt mà trong Dungeon.
