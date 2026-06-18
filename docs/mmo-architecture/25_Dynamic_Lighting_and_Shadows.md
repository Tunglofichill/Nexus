# Báo cáo Kỹ thuật: Hệ thống Ánh sáng và Bóng đổ động cho Web MMO 3D Isometric

## 1. Giới hạn Ánh sáng: Tại sao WebGL không thể hiển thị 100 Point Lights?
Trong WebGL, đặc biệt là với **Forward Rendering** (quy trình mặc định của hầu hết các engine như Three.js hay Babylon.js), việc render lượng lớn nguồn sáng sẽ gây sụt giảm FPS cực kỳ nghiêm trọng vì hai lý do chính:
- **Giới hạn Uniforms của GPU**: Dữ liệu của đèn (vị trí, màu sắc, cường độ, bán kính) được truyền vào shader thông qua các biến "uniform". Mỗi GPU trình duyệt có giới hạn cứng về số lượng uniform vectors (`MAX_FRAGMENT_UNIFORM_VECTORS`). Khi nạp quá nhiều đèn (ví dụ 100), dữ liệu truyền vào có thể vượt giới hạn, khiến shader từ chối biên dịch.
- **Nút thắt cổ chai về Hiệu suất (The Brute-Force Loop)**: Với Forward Rendering, fragment shader phải lặp qua **toàn bộ** các đèn đang hoạt động cho **mỗi một pixel** trên màn hình để tính toán mức độ nhận sáng. Nếu trên màn hình có 2 triệu pixel (1080p) và 100 point lights, GPU sẽ phải thực hiện hàng trăm triệu phép tính trong 1 khung hình, dẫn tới giật lag ngay lập tức.
=> **Giải pháp**: Đối với Web MMO, nếu muốn có nhiều đèn tĩnh (như đuốc, đèn đường), hãy sử dụng **Deferred Rendering** hoặc thực hiện **CPU Light Culling** (chỉ nạp vào shader 3-5 đèn gần với vật thể / người chơi nhất để tính toán).

## 2. Các Kỹ thuật Bóng đổ (Shadow Techniques)
Trong góc nhìn Isometric của MMO, việc tối ưu bóng đổ là chìa khóa để chạy mượt trên trình duyệt Web:

- **Baked Lightmaps (Bake ánh sáng tĩnh)**
  - *Cách hoạt động*: Tính toán mọi hiệu ứng ánh sáng (bao gồm nảy sáng Global Illumination, bóng mềm) trong phần mềm 3D offline, sau đó "nướng" (bake) thành một texture dán lên bề mặt mô hình.
  - *Ưu/Nhược điểm*: Cho **hiệu năng cao nhất** (với WebGL chỉ mất phí render ảnh texture) và đồ họa chân thực. Tuy nhiên, nó tiêu tốn dung lượng tải xuống (bundle size) do các file ảnh map lớn và bóng không tương tác được với nhân vật chuyển động.

- **Cascaded Shadow Maps - CSM (Bóng đổ phân tầng)**
  - *Cách hoạt động*: Khắc phục hiện tượng răng cưa của Shadow Map thường, bằng cách chia vùng nhìn camera (frustum) thành các tầng (cascades). Bóng gần nhân vật hiển thị độ phân giải sắc nét, bóng ở xa độ phân giải thấp hơn.
  - *Ưu/Nhược điểm*: Đây là chuẩn mực cho ánh sáng Mặt Trời động. Tuy nhiên, **chi phí GPU rất cao** vì mỗi tầng (cascade) đòi hỏi game phải render lại scene một lần vào các depth buffer khác nhau. Ở góc nhìn Isometric, bạn có thể tối ưu bằng cách hạn chế độ phủ của camera bóng đổ để chỉ bao trùm khu vực xung quanh nhân vật.

- **Contact Shadows (Bóng tiếp xúc)**
  - *Cách hoạt động*: Dựa trên Post-processing và Depth Buffer (không gian màn hình - Screen-Space) để thêm các viền tối nhỏ lẻ ở vị trí khe nứt, góc tường hoặc phần bàn chân nhân vật tiếp xúc với mặt đất.
  - *Ưu/Nhược điểm*: Chi phí phần cứng trung bình, giúp nhân vật không bị trôi nổi (floating) trên môi trường mà không cần shadow map độ phân giải quá cao. Nhược điểm là dễ bị nhiễu (noise) hoặc mất bóng nếu nguồn tạo bóng vượt khỏi tầm nhìn màn hình.

=> **Khuyến nghị cho MMO Isometric**: Sử dụng **Baked Lightmaps** cho môi trường, công trình tĩnh. Sử dụng **CSM (chỉ 1 tầng, tối ưu camera bó sát)** cho đổ bóng của nhân vật/vật thể động, và có thể kết hợp **Contact Shadows** nhẹ nhàng nhằm tăng chiều sâu.

## 3. Triển khai Chu kỳ Ngày/Đêm (Day/Night Cycle) không gây lag
Một chu kỳ ngày đêm mượt mà, không làm crash hoặc lag trình duyệt, đòi hỏi phải tránh việc GPU phải biên dịch lại (recompile) shader liên tục do thay đổi tính năng:

- **Giới hạn số đèn thay đổi**: Chỉ sử dụng **duy nhất 1 Directional Light** có khả năng `castShadow = true`. Đèn này sẽ đóng vai trò là Mặt trời vào ban ngày và Mặt trăng vào ban đêm. Không tạo thêm hoặc hủy bỏ đèn trong quá trình game đang chạy.
- **Sử dụng Nội suy (Interpolation)**: Thay vì đổi đèn, hãy dùng vòng lặp `requestAnimationFrame` để cập nhật từ từ các giá trị của đèn đó (`position` quay theo hình cung, đổi `color` dần từ trắng sang cam rực, rồi chuyển sang xanh thẳm, và tinh chỉnh `intensity`).
- **Phối hợp AmbientLight và HemisphereLight**: Đây là các nguồn sáng giá rẻ, không đổ bóng. Hãy dùng chúng để chỉnh độ sáng nền của thế giới. Tối ưu nhất là đổi màu ánh sáng bán cầu (Hemisphere) trùng khớp với màu bầu trời, giúp mọi bóng đổ môi trường tự động chìm vào ban đêm mà không cần tính toán vật lý thêm.
- **Tránh Compile lại Shader**: Không bật/tắt (toggle) cờ `castShadow` trong runtime. Nếu muốn đèn Mặt trăng bớt gắt, hãy hạ `intensity` hoặc `shadow.opacity` xuống. Bất kỳ thay đổi cấu trúc nào đối với hệ thống đèn đều khiến WebGL khựng khung hình.
- **Dynamic Sky / Fog**: Đổi màu của sương mù (Fog) từ xa và thay thế texture bầu trời linh hoạt bằng shader sẽ giúp đem lại cảm nhận Ngày/Đêm chân thực nhất trong khi chi phí về lighting gần như không đổi.
