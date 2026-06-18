# Hướng dẫn Kỹ thuật: Thiết kế Hệ thống Streaming Vô tận cho Game 3D Isometric/Web

Dưới đây là tài liệu nghiên cứu chuyên sâu về cách xây dựng một thế giới vô tận, ảo giác chiều sâu và chuyển đổi LOD động cho các tựa game Web 3D / Isometric (sử dụng Three.js, Babylon.js, hoặc Unity/Godot WebGL).

---

## 1. Infinite Walkways: Sinh ngẫu nhiên & Streaming thế giới vô tận

Để tạo ra một con đường phố vô tận với các căn hộ/nhà của những người chơi khác, bạn không thể load toàn bộ bản đồ vào bộ nhớ trình duyệt. Thay vào đó, áp dụng kiến trúc **Chunk-based Procedural Generation**.

*   **Kiến trúc Chunk & Lưới (Grid):**
    *   Chia thế giới thành các khối "Chunk" (ví dụ: lưới 32x32 tiles). Hệ thống chỉ cần lưu trữ và render các Chunk nằm trong tầm nhìn của Camera (Culling) cộng thêm 1-2 lớp Chunk đệm (Buffer Chunks).
    *   Khi người chơi di chuyển qua ranh giới của một Chunk, một sự kiện (Event) sẽ kích hoạt việc ngầm khởi tạo Chunk mới phía trước và hủy (Unload) các Chunk ở xa phía sau để giải phóng RAM.
*   **Procedural Generation với Noise (Simplex/Perlin Noise):**
    *   Để quyết định căn hộ của ai sẽ xuất hiện, hoặc cấu trúc đường phố thế nào, hãy dùng hàm Noise tất định kết hợp với Seed của vũ trụ game. Tọa độ `(x, y)` của Chunk sẽ là đầu vào của hàm Noise.
    *   **Lợi ích:** Vũ trụ là "vô tận" và nhất quán. Dù người chơi đi vạn dặm và quay lại, thế giới vẫn tự động sinh ra y hệt nhau mà không cần lưu trữ kích thước file lớn trên server.
*   **Tối ưu hóa Draw Call (Instanced Rendering & Pooling):**
    *   Các căn hộ, đèn đường, thùng rác... cần dùng kỹ thuật **InstancedMesh**. Nghĩa là hàng nghìn vật thể giống nhau có thể được GPU vẽ chỉ bằng một lệnh (Draw Call).
    *   Kết hợp với **Object Pooling**: Thay vì `destroy()` và `instantiate()` liên tục làm quá tải Garbage Collector của Javascript/WebAssembly, hãy tái sử dụng các vật thể đã trôi ra ngoài màn hình và đặt chúng vào vị trí mới phía trước.

---

## 2. Parallax & Depth in 3D: Ảo giác chiều sâu & Thành phố nền khổng lồ

Việc render một thành phố sầm uất phía xa bằng 3D thực là một sự lãng phí tài nguyên khủng khiếp. Ta sử dụng các kỹ thuật "đánh lừa thị giác" sau:

*   **3D Impostors (Hình nhân 2D giả lập 3D):**
    *   Thay vì dựng các tòa nhà xa xôi bằng hàng vạn đa giác, ta thay thế chúng bằng một mặt phẳng 2D (Billboard / Quad).
    *   **Kỹ thuật cao cấp (Octahedral Impostors):** Sử dụng một Texture Atlas chứa hình ảnh của tòa nhà được chụp (baking) từ hàng chục góc độ khác nhau. Bằng một custom Shader, khi camera di chuyển, Shader sẽ tự động tính toán góc nhìn để chuyển đổi sang khung hình chính xác trên Texture Atlas. Kết hợp với Normal Map và Depth Map, mặt phẳng 2D này có thể hứng ánh sáng và đổ bóng y hệt vật thể 3D thực thụ.
*   **2.5D Parallax Layers (Lớp nền thị sai):**
    *   Gom các nhóm Impostors phía xa thành các "Lớp" (Layers). Lớp càng xa, tốc độ dịch chuyển của nó khi người chơi bước đi càng chậm (áp dụng công thức `parallax_offset = camera_velocity * depth_factor`).
    *   Điều này đặc biệt hiệu quả với game có góc nhìn Isometric (sử dụng Orthographic Camera). Nhờ không có điểm tụ (vanishing point), phép tịnh tiến Parallax tạo ra cảm giác về một thành phố rộng lớn, có tầng lớp không đáy.
*   **Depth Fog / Volumetric Fog (Sương mù chiều sâu):**
    *   Sử dụng sương mù ngả màu theo độ sâu (Z-depth) để hòa trộn mượt mà ranh giới giữa khu vực 3D thực tế và các lớp Parallax phía sau, che đậy hoàn hảo sự thiếu hụt chi tiết.

---

## 3. Dynamic LODing: Chuyển đổi mượt mà từ "Cảnh nền" sang "Căn hộ tương tác"

Khi người chơi tiến lại gần một căn hộ, hệ thống cần nâng cấp độ chi tiết (Level of Detail - LOD) từ một tấm bìa 2D tĩnh thành một không gian có thể nhấp chuột, xem nội thất và tải dữ liệu mạng của chủ nhà. Vấn đề lớn nhất cần tránh là **hiện tượng "Popping"** (mô hình bị giật hình thay đổi đột ngột).

*   **Chuỗi LOD Động (Dynamic LOD Pipeline):**
    *   **LOD 3 (Rất xa):** Impostor 2D (Render bằng 2 tam giác).
    *   **LOD 2 (Tầm trung):** Proxy Mesh (Mô hình 3D tối giản, không có nội thất, cửa sổ vẽ bằng texture, dùng chung InstancedMesh).
    *   **LOD 1 (Gần, vùng Tương tác):** Fully Interactive Instanced Base (Mô hình High-Poly, có ban công, ánh sáng động, cho phép tải dữ liệu riêng của người chơi từ Database).
*   **Cross-Fading / Dithering Transition (Chuyển đổi mờ dần bằng Shader):**
    *   Để việc chuyển đổi giữa các cấp LOD không bị Popping, ta dùng kỹ thuật **Stippling (Dithering)** trong Shader. 
    *   Khi vật thể rơi vào vùng ranh giới chuyển giao (ví dụ: cách người chơi 20m), engine sẽ tạm thời dựng *cả* dạng LOD 2 và LOD 1 chồng lên nhau. 
    *   Shader sẽ tiến hành đánh rỗng các pixel (bỏ hiển thị pixel đan xen) của LOD 2 và dần dần hiển thị các pixel của LOD 1 theo tỷ lệ phần trăm khoảng cách. Kết quả là căn nhà "hiện hình" mượt mà như hiệu ứng tan biến ma thuật.
*   **Asynchronous Instancing (Nạp dữ liệu phi đồng bộ):**
    *   Dưới nền web (Web Workers), khi một căn hộ chuyển từ LOD 2 sang LOD 1, một luồng (thread) chạy ngầm sẽ gọi API (ví dụ GraphQL/REST) để kéo thông tin Customization của chủ nhà đó (màu sơn, đồ trang trí, nhân vật).
    *   Căn hộ được tách khỏi nhóm `InstancedMesh` tổng, và trở thành một thực thể `Mesh` độc lập (hoặc một Instance riêng biệt) cho phép gán Script tương tác, Raycasting để người dùng click vào mở UI.
