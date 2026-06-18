# TÀI LIỆU THIẾT KẾ KỸ THUẬT: HỆ THỐNG SINH THÀNH PHỐ MMO (PROCEDURAL MMO CITY)

## 1. Logic Xếp Chồng Căn Hộ (Apartment Stacking Logic)
Để quản lý 10,000+ base "Studio Apartment" của người chơi thành một tòa nhà chọc trời (Skyscraper) hợp lý về mặt kiến trúc và logic, hệ thống sử dụng cách tiếp cận **Modular Assembly** kết hợp **Constraint Satisfaction**.

*   **Kiến trúc Lõi (The Core Constant):** Mọi tòa nhà đều bắt đầu với một "Lõi" trung tâm cố định theo trục Y (chứa thang máy, cầu thang bộ, và trục kỹ thuật).
*   **Phân bổ không gian (Space Partitioning):**
    *   Sử dụng thuật toán **Binary Space Partitioning (BSP)** kết hợp **Grid System** để chia không gian bao quanh Lõi thành các "Slot" 3D có kích thước chuẩn hóa (ví dụ: 5x5x3 mét).
    *   Mỗi "Studio Apartment" của người chơi sẽ được mapping 1-1 với một Slot này.
*   **Thuật toán Ráp nối (Wave Function Collapse - WFC):**
    *   Để tránh việc xếp các phòng một cách lộn xộn, WFC được sử dụng với các quy tắc ràng buộc (Constraints): *Ví dụ: Cửa chính của module phòng phải tiếp giáp với hành lang chung; Cửa sổ phải nằm ở mặt thoáng của tòa nhà.*
*   **Data-Driven Spawning:** 
    *   Khi người chơi mua căn hộ, Server sẽ truy vấn cây dữ liệu (ví dụ: Octree quản lý building) để tìm tầng thấp nhất còn Slot trống và gán `player_id` vào tọa độ đó. Tòa nhà sẽ "mọc" cao dần lên (Additive Growth) dựa trên tổng số lượng người chơi.

## 2. Quy Hoạch Khu Dân Cư Trải Rộng (Neighborhood Sprawl)
Khi player base mở rộng, thành phố cần tự động quy hoạch đất nền cho "Houses" và "Mansions".

*   **Sinh mạng lưới giao thông (Road Network Generation):**
    *   **L-Systems (Lindenmayer Systems):** Sử dụng để sinh ra các trục đường chính vươn ra khỏi trung tâm thành phố theo mô hình phân nhánh hữu cơ.
    *   **Tensor Fields:** Được áp dụng sau L-Systems để định hướng các đường nhánh nội khu sao cho chúng tạo thành các ô bàn cờ (Grid blocks) hoặc các đường cong song song theo địa hình tự nhiên, tránh góc cắt hẹp (<70 độ).
*   **Phân Lô (Lot Allotment) bằng Voronoi & Subdivision:**
    *   Các không gian trống kẹp giữa các con đường sẽ được xác định là một "Block".
    *   Sử dụng thuật toán **Recursive Subdivision** (Chia lô đệ quy) hoặc **Voronoi Diagrams** để chia Block thành các lô đất (Lots) nhỏ hơn.
    *   **Ràng buộc cốt lõi:** Bất kỳ Lô đất nào cũng phải có ít nhất 1 cạnh nằm trên đường (Road-facing edge) để đảm bảo pathfinding và lối vào cho người chơi.
*   **Dynamic Sprawl (Mở rộng động):**
    *   Hệ thống duy trì một "Density Heatmap" (Bản đồ nhiệt mật độ). Khi 80% các lô đất trong khu vực hiện tại đã có chủ, thuật toán sinh trưởng (Growth Algorithm) sẽ tự động nới rộng ranh giới L-System, sinh ra thêm các Block và lô đất mới ở vùng ngoại ô.

## 3. Biểu Diễn Trực Quan Khối Lượng Lớn (Massive WebGL Rendering)
Để render một siêu đô thị khổng lồ trên trình duyệt (60 FPS) mà không tải hàng vạn mô hình nội thất, ta cần đánh lừa thị giác và tối ưu phần cứng ở mức cao nhất.

*   **Instanced Rendering (Vẽ hàng loạt bằng GPU):**
    *   Thay vì gọi hàng chục ngàn draw calls cho từng tòa nhà, sử dụng `drawElementsInstanced` (WebGL 2.0) hoặc `InstancedMesh` (Three.js).
    *   Hệ thống chỉ nạp 1 model chuẩn của "Mảng tường", "Cửa sổ", "Mái nhà" vào GPU. GPU sẽ vẽ lại hình học này hàng vạn lần dựa trên một buffer chứa tọa độ, góc quay, và màu sắc riêng biệt (Texture Atlases) cho từng instance.
*   **Interior Mapping (Giả lập không gian nội thất):**
    *   Đây là "chìa khóa" để giải quyết bài toán: Không load nội thất khi chưa vào phòng.
    *   Kỹ thuật này sử dụng **Raycasting** ngay trong *Fragment Shader*. Khi camera nhìn vào một mặt phẳng cửa sổ 2D, shader sẽ tính toán góc nhìn của tia sáng và đối chiếu lên một Texture Cube Map ảo (chứa hình ảnh phòng/vật dụng), tạo ra **ảo giác có không gian 3D sâu thẳm bên trong** với chi phí render bằng 0 so với vẽ lưới 3D thật.
*   **Level of Detail (LOD) & Không gian cây (Octree):**
    *   **Occlusion & Frustum Culling:** Phân vùng toàn bộ thế giới bằng Octree/Quadtree. Bất kỳ khu phố nào không nằm trong góc nhìn camera (Frustum) hoặc bị tòa nhà khác che khuất (Occlusion) sẽ bị loại bỏ hoàn toàn khỏi chu trình Render.
    *   **Geometry LOD:** Các căn hộ ở khoảng cách xa sẽ tự động giảm từ model chi tiết (High-poly) thành khối hộp cơ bản (Low-poly) với texture mờ hơn.
*   **Lazy-Loading & Instanced Rooms (Khi người chơi vào phòng):**
    *   Nội thất của người chơi được lưu trên Database dưới dạng JSON (tọa độ các món đồ).
    *   Chỉ khi nhân vật tương tác với cánh cửa, hệ thống mới gửi request tải cục bộ (Lazy-Load) dữ liệu JSON này và khởi tạo một Scene con (Instanced Zone) dành riêng cho người chơi, giúp giảm tải hoàn toàn cho thế giới bên ngoài.
