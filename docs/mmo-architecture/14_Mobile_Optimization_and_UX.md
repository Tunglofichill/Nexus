# Báo cáo Kỹ thuật: Tối ưu hóa Mobile và UX/UI cho WebGL MMO

Báo cáo này tập trung vào các kỹ thuật và thực tiễn tốt nhất để tối ưu hóa trải nghiệm trên thiết bị di động cho một tựa game MMO 3D hạng nặng chạy trên nền tảng WebGL.

## 1. Điều khiển cảm ứng (Touch Controls) & Tránh thao tác mặc định của trình duyệt

Khi triển khai joystick ảo và xoay camera, một trong những thách thức lớn nhất là tránh kích hoạt các cử chỉ của trình duyệt như "pull-to-refresh" (vuốt xuống để tải lại) hay "swipe-to-go-back" (vuốt mép màn hình để quay lại).

**Thực tiễn tốt nhất:**
*   **CSS `touch-action`**: Cài đặt thuộc tính `touch-action: none;` cho thẻ `<canvas>` hoặc container của game. Điều này vô hiệu hóa các thao tác pan/zoom mặc định của trình duyệt ở mức trình duyệt/hệ điều hành, giúp loại bỏ hoàn toàn hiện tượng pull-to-refresh và cuộn trang dọc/ngang.
*   **Ngăn chặn sự kiện (Event Prevention)**: Gọi `event.preventDefault()` trong các event listener của `touchstart`, `touchmove`, và `touchend` gắn vào canvas. Lưu ý: Khi đăng ký event bằng `addEventListener`, hãy bắt buộc truyền vào option `{ passive: false }` vì mặc định trên di động các sự kiện touch được thiết lập là passive để tăng tốc độ cuộn trang.
*   **Quản lý đa điểm (Multi-touch)**:
    *   Sử dụng `event.changedTouches` và theo dõi từng điểm chạm độc lập thông qua `touch.identifier` để tránh xung đột giữa tay điều khiển di chuyển và tay xoay góc nhìn.
    *   Vùng ảo hóa (Hitbox Zones): Chia màn hình một cách logic, ví dụ nửa trái dành cho joystick (di chuyển), nửa phải hoặc vùng trống trên màn hình dành cho thao tác xoay camera (camera panning).
*   **Fullscreen API**: Khuyến khích hoặc yêu cầu người dùng vào chế độ toàn màn hình (`element.requestFullscreen()`) để ẩn thanh địa chỉ (URL bar), tối đa hóa diện tích hiển thị và hạn chế thao tác nhầm vào viền trình duyệt.

## 2. Quản lý bộ nhớ GPU & Phân loại thiết bị di động cấu hình thấp

Các thiết bị di động có sự phân mảnh phần cứng rất lớn. Game cần có cơ chế phát hiện và tự động giảm chất lượng đồ họa (graceful degradation) để tránh crash do tràn VRAM và duy trì mức FPS chơi được.

**Phương pháp nhận diện (Detection):**
*   **Benchmarking động (Dynamic Performance Profiling)**: Đây là cách đáng tin cậy nhất. Theo dõi FPS thực tế (thông qua delta time của `requestAnimationFrame`) trong 10-15 giây đầu khi vào game. Nếu FPS trung bình dưới 30, tự động kích hoạt "Performance Mode" (giảm cấu hình).
*   **Kiểm tra API phần cứng (Hardware APIs)**:
    *   `navigator.deviceMemory`: Giúp lấy dung lượng RAM gần đúng (chủ yếu trên Android/Chrome). Nếu RAM <= 4GB, nên mặc định là thiết bị cấu hình thấp.
    *   `navigator.hardwareConcurrency`: Lấy số lượng luồng xử lý của CPU.
*   **Thông tin GPU qua WebGL**: Sử dụng WebGL extension `WEBGL_debug_renderer_info` để truy xuất `UNMASKED_RENDERER_WEBGL`. Thông tin này (ví dụ: "Adreno 640", "Apple A15 GPU") có thể được so khớp với một danh sách thiết bị định sẵn để cấu hình trước. Dù một số trình duyệt chặn do chống fingerprinting, nó vẫn hữu ích trên nhiều trình duyệt khác.
*   **Giới hạn WebGL**: Kiểm tra `gl.getParameter(gl.MAX_TEXTURE_SIZE)` và `MAX_RENDERBUFFER_SIZE` để biết giới hạn khả năng vẽ và lưu trữ texture của thiết bị.

**Chiến lược hạ cấp hình ảnh (Graceful Degradation):**
*   **Giảm độ phân giải render (Resolution Scaling)**: Màn hình điện thoại hiện đại thường có mật độ điểm ảnh rất cao (`devicePixelRatio` = 2, 3). Render WebGL ở độ phân giải gốc của máy sẽ vắt kiệt GPU ngay lập tức. Khuyến nghị giới hạn tỷ lệ pixel (`pixelRatio`) tối đa là 1.0 (hoặc thấp hơn mức 0.7-0.8 đối với máy rất yếu), và sử dụng CSS để upscale canvas cho vừa kích thước hiển thị.
*   **Tối giản Bóng đổ (Shadows)**: Chuyển bóng đổ thời gian thực (real-time soft shadows) thành độ phân giải thấp hơn. Với thiết bị yếu, hãy tắt hoàn toàn bóng đổ động và thay bằng "blob shadows" (bóng đổ decal tròn dính dưới chân nhân vật).
*   **Tắt Post-Processing**: Vô hiệu hóa các hiệu ứng tốn kém như Bloom, Ambient Occlusion (SSAO), Anti-aliasing (FXAA/SMAA), và Depth of Field.
*   **Culling & LOD (Level of Detail)**: Hạ thấp giới hạn số lượng nhân vật/hiệu ứng đồng thời hiển thị trên màn hình, thay thế bằng model ít đa giác hơn.

## 3. Giảm tiêu hao pin và ngăn chặn quá nhiệt (Overheating)

Chạy một game MMO 3D bằng WebGL liên tục sẽ gây quá tải cho cả CPU/GPU trên di động. Nhiệt độ cao sẽ kích hoạt cơ chế bóp hiệu năng (thermal throttling), làm rớt FPS đột ngột và gây hao mòn thiết bị.

**Kỹ thuật tối ưu năng lượng và nhiệt độ:**
*   **Khóa Framerate (FPS Capping)**: Không nên cố gắng render ở 60 FPS trên di động trừ khi thiết bị thuộc dòng máy cấu hình rất mạnh. Giới hạn tốc độ khung hình ở mức 30 FPS bằng cách tính toán khoảng thời gian trôi qua (`elapsed time`) bên trong vòng lặp `requestAnimationFrame`. Điều này sẽ giảm tải tính toán của CPU/GPU đi xấp xỉ 50%.
*   **Tối ưu WebGL Context**: Khi tạo WebGL context, thiết lập cấu hình `{ powerPreference: 'low-power' }` nếu máy quá yếu, tuy nhiên với MMO có thể cần `{ powerPreference: 'default' }` hoặc cho người dùng tự cấu hình "Chế độ Tiết kiệm pin" trong phần cài đặt game.
*   **Quản lý Vòng đời (Visibility API)**: Lắng nghe sự kiện `visibilitychange` của document. Khi người dùng ẩn trình duyệt hoặc chuyển sang tab khác, NGAY LẬP TỨC tạm dừng vòng lặp render (`cancelAnimationFrame`), ngừng update các hệ thống hạt (particles) và mute âm thanh để tiết kiệm pin tối đa.
*   **Dừng Render Khi Chờ (On-Demand Rendering)**: Khi người dùng đang ở trong menu toàn màn hình, màn hình tải, hoặc hòm đồ (inventory), có thể xem xét ngừng update vòng lặp đồ họa 3D phía sau hoặc giảm tối đa FPS (vd: xuống 10 FPS) nếu cảnh nền chỉ tĩnh và không có hoạt cảnh quan trọng.
*   **Tối ưu Băng thông Bộ nhớ (Memory Bandwidth)**:
    *   Nhiệt phát sinh phần lớn do luân chuyển dữ liệu lớn giữa RAM và GPU. Hãy nén texture (sử dụng định dạng ASTC cho thiết bị mới, và ETC2 hoặc PVRTC cho thiết bị cũ). Texture nén không chỉ giải phóng RAM mà còn giảm lượng dữ liệu đọc từ GPU, giúp thiết bị mát hơn.
    *   Giảm số lượng Draw Calls (sử dụng Instancing) để CPU không phải hoạt động hết công suất khi giao tiếp với GPU.
