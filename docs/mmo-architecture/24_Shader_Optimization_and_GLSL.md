# Báo Cáo Kỹ Thuật: Tối Ưu Hóa Shader và Custom GLSL cho Game WebGL

## 1. Tại sao cần Custom Shaders? (Sự nặng nề của MeshStandardMaterial)
- **Tính năng dư thừa:** `MeshStandardMaterial` trong Three.js là một material dựa trên vật lý (PBR) tích hợp sẵn rất nhiều tính toán phức tạp: ánh sáng môi trường (environment sampling), BRDF, bóng đổ (shadows), sương mù (fog), và đa nguồn sáng. GPU phải xử lý những tính toán này trên mỗi điểm ảnh (fragment), kể cả khi bạn không cần dùng đến.
- **Custom Shaders (ShaderMaterial/RawShaderMaterial):** Khi tự viết shader, bạn chỉ code những tính toán thực sự cần thiết. Ví dụ, nếu vật thể chỉ cần màu sắc cơ bản hoặc hiệu ứng cel-shading, custom shader sẽ bỏ qua toàn bộ các bước tính PBR nặng nề, giúp tăng tốc độ render đáng kể.
- **Giải pháp tối ưu:** Nếu vẫn cần các hiệu ứng ánh sáng chuẩn nhưng muốn thêm logic riêng, nên sử dụng `material.onBeforeCompile` (hoặc thư viện như `three-custom-shader-material`) để tiêm (inject) mã GLSL tùy chỉnh vào material có sẵn, thay vì viết lại toàn bộ từ đầu.

## 2. Các Kỹ Thuật Tối Ưu Hóa Shader (Optimization Tricks)
- **Tránh lệnh If (Branching) trong Fragment Shader:** 
  - GPU thực thi mã theo các nhóm luồng (warps/wavefronts). Khi gặp lệnh `if-else` (dynamic branching) mà các pixel rẽ nhánh khác nhau, GPU buộc phải chạy *cả hai nhánh* và loại bỏ kết quả sai, làm sụt giảm hiệu năng nghiêm trọng.
  - *Giải pháp:* Thay thế `if-else` bằng các hàm toán học tích hợp không phân nhánh như `step(edge, x)`, `mix(a, b, t)`, `clamp()`, `smoothstep()`.
- **Tối ưu độ chính xác của số thực (Float Precision):**
  - Trên các thiết bị di động/GPU yếu, việc sử dụng đúng độ chính xác rất quan trọng để giảm áp lực lên bộ nhớ.
  - `lowp`: Dùng cho màu sắc hoặc cường độ sáng cơ bản.
  - `mediump`: Dùng cho tọa độ texture (UV) và đa số tính toán ánh sáng.
  - `highp`: Dành riêng cho vertex positions hoặc các phép toán cần độ chính xác không gian tuyệt đối.
- **Gom gói dữ liệu (Data Packing):**
  - *Vertex Attributes:* Thay vì truyền nhiều biến `float` hay `vec2` riêng lẻ từ CPU sang GPU, hãy đóng gói chúng thành `vec4` để tận dụng tối đa băng thông.
  - *Texture Packing:* Nén nhiều thông số (roughness, metalness, ambient occlusion, mask) vào các kênh R, G, B, A của một texture duy nhất để giảm thiểu số lần đọc texture (texture lookups) – một tác vụ tốn kém băng thông của GPU.

## 3. Vertex Animation Textures (VAT) cho Đám đông (Massive Crowds)
- **Vấn đề của Skeletal Animation:** Việc tính toán ma trận biến đổi khung xương cho hàng nghìn nhân vật mỗi khung hình sẽ khiến CPU trở thành "nút thắt cổ chai" (bottleneck).
- **Cách hoạt động của VAT:** 
  - Hoạt ảnh của nhân vật được "nướng" (baked) trước thành các dữ liệu vị trí không gian (vertex offsets) và lưu dưới dạng một Texture 2D (Sử dụng công cụ như Houdini VAT hoặc OpenVAT cho Blender).
  - Nhân vật lúc này chỉ được render như một *Static Mesh* đơn giản.
  - Trong Vertex Shader, tọa độ thời gian (`time` hoặc `frame ID`) được dùng để đọc thông tin vị trí từ Texture, sau đó dịch chuyển vertex thông qua World Position Offset để tạo ra chuyển động.
- **Ưu điểm:** Di chuyển toàn bộ tính toán hoạt ảnh nặng nề từ CPU sang GPU. Khi kết hợp với *GPU Instancing*, bạn có thể render hàng vạn nhân vật chuyển động cùng lúc với số lượng draw calls cực thấp.
- **Lưu ý:** Kỹ thuật này đánh đổi dung lượng VRAM để lấy hiệu năng CPU (do texture hoạt ảnh khá nặng), và yêu cầu texture dùng định dạng số thực (`Float` hoặc `Half-Float`) để ngăn chặn việc chuyển động bị rung giật (jittering) do thiếu độ chính xác.
