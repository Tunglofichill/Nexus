### BÁO CÁO KỸ THUẬT: WEBGL POST-PROCESSING CHO BROWSER MMO

#### 1. Các Hiệu ứng Thiết yếu (Essential Effects) cho Đồ họa "Premium"
Để đạt được chất lượng hình ảnh cao cấp (AAA/Premium look) trên môi trường trình duyệt, ba hiệu ứng sau là cốt lõi:
*   **Bloom (Đổ hào quang):** Giúp các bề mặt có độ sáng cao (HDR) hoặc vật liệu phát sáng (emissive) tỏa ra quầng sáng chân thực. *Khuyến nghị:* Nên sử dụng tính năng `mipmapBlur` thay vì Gaussian blur truyền thống để quầng sáng lan tỏa mềm mại, bảo toàn năng lượng và tạo cảm giác quang học thực tế hơn.
*   **SSAO (Screen Space Ambient Occlusion):** Thêm bóng râm cục bộ (micro-shadows) vào các nếp gấp, góc kẹp và điểm tiếp xúc giữa các vật thể. Thiếu SSAO, môi trường nhìn sẽ rất "phẳng" và trôi nổi. *Khuyến nghị:* Trong hệ sinh thái R3F hiện tại, nên ưu tiên dùng **`N8AO`** (một biến thể tối ưu hóa cực tốt của SSAO). N8AO đem lại chất lượng ngang ngửa nhưng tiêu tốn ít tài nguyên hơn hẳn các bộ lọc SSAO cũ.
*   **Tone Mapping & Color Grading:** Quá trình chuyển đổi dải động cao (HDR) về dải động thấp (LDR) của màn hình tiêu chuẩn. `ACESFilmicToneMapping` thường là chuẩn mực hiện nay, cung cấp sự pha trộn màu sắc mang tính điện ảnh, xử lý độ chói (highlights) mượt mà mà không bị cháy sáng (clipping).

#### 2. Chi phí Hiệu năng (Performance Costs): Mobile vs. Desktop
Với một game MMO (scene phức tạp, nhiều người chơi), post-processing có thể nhanh chóng trở thành nút thắt cổ chai (bottleneck) cho GPU.
*   **Tone Mapping:** *Chi phí cực thấp.* Bản chất là tính toán trên mỗi pixel độc lập, hoàn toàn phù hợp và chạy nhẹ nhàng trên mọi thiết bị (cả mobile và desktop).
*   **Bloom:** *Chi phí trung bình.* Tốc độ phụ thuộc vào độ phân giải (resolution). Desktop xử lý hoàn toàn mượt mà. Trên Mobile, `mipmapBlur` có thể làm giảm frame-rate. *Giải pháp cho Mobile:* Cần giảm `resolution` của Bloom pass hoặc tăng `luminanceThreshold` để GPU ít phải tính toán các vùng blur không cần thiết.
*   **SSAO / N8AO:** *Chi phí rất cao.* Đòi hỏi trích xuất Depth map (và Normal map), sau đó thực hiện lấy mẫu (sampling) nhiều lần xung quanh mỗi pixel.
    *   *Desktop:* Chạy tốt trên card đồ họa rời hoặc iGPU đời mới, mang lại khác biệt lớn về thị giác.
    *   *Mobile:* Thường là "sát thủ" phần cứng, làm nóng máy và rớt FPS nghiêm trọng. **Tối ưu:** Tự động tắt (Disable) SSAO trên Mobile. Nếu bắt buộc phải dùng, hãy sử dụng `halfRes` (nửa độ phân giải màn hình) và giảm số lượng `samples` xuống mức tối thiểu.

#### 3. Best Practices Triển khai EffectComposer trong R3F
Để triển khai hiệu quả trong React Three Fiber, hãy tuân thủ các nguyên tắc sau:
*   **Tuyệt đối sử dụng `@react-three/postprocessing`:** Đừng dùng `EffectComposer` thuần của Three.js (`three/examples/jsm/...`). Thư viện `@react-three/postprocessing` được xây dựng dựa trên `pmndrs/postprocessing`, có tính năng **Shader Merging** (tự động gộp các Pass thành một shader duy nhất nếu tương thích). Việc này giảm thiểu số lượng draw calls và read/write trên bộ nhớ GPU đi rất nhiều lần.
*   **Thứ tự các Pass (Order of Effects):** Rendering pipeline yêu cầu thứ tự shader chuẩn xác. Thứ tự chuẩn thường là: `Render -> N8AO (SSAO) -> Bloom -> ToneMapping -> Anti-Aliasing (SMAA/FXAA)`. Bắt buộc phải đặt ToneMapping trước Anti-aliasing để tránh các viền đen/sáng bất thường.
*   **Quản lý Anti-Aliasing (Khử răng cưa):** WebGL2 hỗ trợ MSAA mặc định trên `WebGLRenderTarget` (bằng cách thiết lập `multisampling={4}` trên component `<EffectComposer>`). Tuy nhiên, khi bạn có một pass yêu cầu đọc Depth buffer (như SSAO/N8AO), hệ thống buộc phải tách pass, làm vỡ MSAA mặc định. Trong trường hợp đó, bạn cần tắt multisampling (`multisampling={0}`) và chèn thêm một pass `<SMAA />` ở cuối cùng của `<EffectComposer>`. (Chú ý: SMAA tốn tài nguyên khá đáng kể trên mobile).
*   **Adaptive Performance (Tự động thích ứng):** Đặc thù MMO yêu cầu khung hình ổn định. Hãy sử dụng component `<PerformanceMonitor>` (từ `@react-three/drei`) để theo dõi tốc độ FPS của thiết bị người chơi. Nếu FPS rơi xuống dưới 45, tự động "hạ bậc" đồ họa theo trình tự: (1) Tắt SMAA và SSAO -> (2) Hạ resolution của Bloom -> (3) Tắt hoàn toàn Post-processing trên thiết bị quá yếu.
