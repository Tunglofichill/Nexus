# Báo cáo Kỹ thuật: Procedural Animation & Inverse Kinematics (IK) trong Three.js

## 1. IK là gì và Ứng dụng trong đặt chân (Foot Placement) trên địa hình
**Định nghĩa:** 
Inverse Kinematics (Động học ngược) là quá trình tính toán các góc của một chuỗi khớp xương (ví dụ: Hông -> Đầu gối -> Mắt cá chân) để điểm cuối cùng (End-effector, ở đây là bàn chân) đạt được một vị trí mục tiêu cụ thể trong không gian 3D. Trái ngược với Forward Kinematics (chuyển động đi từ gốc đến ngọn theo animation có sẵn), IK kéo ngược từ ngọn về gốc để thích ứng với môi trường.

**Cơ chế Foot Placement (Đặt chân lên cầu thang/dốc):**
Quy trình để nhân vật bước đi tự nhiên trên địa hình gồ ghề bao gồm:
- **Raycasting (Bắn tia):** Từ vị trí chân theo animation gốc (hoặc từ hông), bắn một tia thẳng đứng xuống dưới. Giao điểm của tia này với địa hình (mesh) cho biết vị trí chính xác mặt đất ở đâu, cùng với vector pháp tuyến (normal) chỉ độ nghiêng của dốc.
- **IK Target:** Lấy vị trí giao điểm làm "mục tiêu" mới cho bàn chân.
- **Giải mã IK (IK Solver):** Hệ thống IK tự động tính toán lại góc gập của đầu gối và khớp hông để đẩy bàn chân chạm chính xác vào mục tiêu, ngăn chặn hiện tượng chân bị "lún" vào bậc thang hoặc lơ lửng trên không.
- **Điều chỉnh xương chậu (Pelvis Adjustment):** Để tránh việc chân bị kéo giãn quá mức (over-extension) khi bước lên bậc thang cao, IK thường kết hợp với việc tính toán để tự động hạ thấp hoặc nâng cao trọng tâm (xương chậu/root) của nhân vật.

## 2. Hiệu suất (Performance): Giải IK cho 100 nhân vật mỗi frame có quá tải với JS?
**Câu trả lời ngắn:** **CÓ, sẽ rất tốn kém (CPU Bound) nếu chạy trực tiếp trên luồng chính (Main Thread) với độ phân giải cao nhất cho mọi frame.** 

Việc liên tục thực hiện Raycasting và chạy thuật toán giải IK (đặc biệt là các thuật toán lặp như CCD hoặc FABRIK) cho 100 nhân vật x 2 chân x 60 fps chắc chắn sẽ làm sụt giảm FPS nghiêm trọng trong JavaScript. Để khả thi, bắt buộc phải áp dụng các kỹ thuật tối ưu:
- **LOD cho Logic (Level of Detail):** Chỉ bật tính toán IK và Raycast cho các nhân vật ở gần Camera. Những nhân vật ở xa chỉ chạy bộ animation đi bộ tiêu chuẩn (Forward Kinematics) hoặc bị vô hiệu hóa hoàn toàn.
- **Offload sang Web Workers:** Tách các phép toán ma trận phức tạp và tính toán raycast của IK ra khỏi luồng render chính của Three.js và đưa vào Web Workers.
- **Giảm tần suất cập nhật (Tick Rate):** Không nhất thiết phải chạy IK ở mỗi khung hình (60hz). Có thể cập nhật IK ở mức 20-30hz và sử dụng nội suy tuyến tính (Lerp) để làm mượt chuyển động giữa các khung hình.
- **Sử dụng Engine Vật lý:** Thay vì dùng Raycaster của Three.js vốn nặng nề, hãy dùng dữ liệu va chạm cực nhanh từ các thư viện vật lý (như Rapier, Cannon-es) được biên dịch bằng WebAssembly (WASM).
- **GPU Draw Calls:** Cần lưu ý việc render 100 `SkinnedMesh` riêng biệt cũng sẽ làm đứng GPU. Cần kết hợp sử dụng `InstancedSkinnedMesh` để render hàng loạt nhân vật trong một draw call.

## 3. Best Practices: Tích hợp IK với Walking Animations
Trong Three.js, vì không có hệ thống Animation State Machine tích hợp sẵn như Unity/Unreal, quá trình tích hợp cần xử lý cẩn thận qua code:

- **Kiến trúc Layering (Lớp phủ Override):** 
  Coi animation đi bộ (walk cycle) đã bake sẵn là **Lớp cơ sở (Base Layer)**. Thuật toán IK sẽ chạy sau khi Three.js đã cập nhật khung xương theo animation, đóng vai trò là **Lớp hiệu chỉnh (Post-process Override)**. IK sẽ lấy tọa độ chân hiện tại của animation làm điểm bắt đầu để tính toán Raycast.

- **Quản lý trọng số pha trộn (Blending/Weighting):**
  Không áp dụng IK 100% thời gian, nếu không chân sẽ bị dán chặt xuống đất.
  - **Giai đoạn trụ (Stance Phase):** Khi animation gốc cho thấy chân đang chạm đất, tăng trọng số IK lên gần 1 để giữ chân ổn định với bề mặt địa hình, chống hiện tượng trượt chân (Foot Sliding).
  - **Giai đoạn nhấc/vung (Swing Phase):** Khi animation cho thấy chân đang nhấc lên bước tới, giảm mạnh trọng số IK về 0 (bằng hàm lerp mượt mà) để trả lại quyền điều khiển cho animation, giúp nhân vật vung chân tự nhiên.

- **Dùng Thuật toán "Two-Bone IK":**
  Thay vì dùng CCDIKSolver (của Three.js) giải cho nhiều khớp, hãy dùng thuật toán phân tích (Analytical Two-Bone IK) dựa trên định lý Cosin chỉ giải cho 3 điểm: Hông, Đầu gối, Mắt cá. Nó nhanh hơn gấp nhiều lần, ít bị lỗi giật góc (jitter) và dễ dàng giới hạn góc gập của đầu gối (Joint Constraints - chỉ gập về một phía).

- **Xoay cổ chân theo địa hình (Foot Alignment):**
  Khi giải IK xong vị trí, dùng vector pháp tuyến (Normal Vector) lấy được từ Raycast để xoay quaternion xương cổ chân, giúp lòng bàn chân áp sát song song một cách thực tế vào sườn dốc.
