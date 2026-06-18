# Báo Cáo Kiến Trúc Kỹ Thuật: Hệ Thống AI & Mô Phỏng NPC Quy Mô Lớn Cho MMO

## 1. AI trên Server (Server-Side) vs Client (Client-Side) & Phân Tán
Trong MMO, việc thiết kế kiến trúc phân bổ AI là sự đánh đổi giữa **Tính nhất quán/Bảo mật** và **Khả năng mở rộng hiệu năng**.

*   **Server-Side AI (Authoritative Model):** Đây là tiêu chuẩn thực tế. Server chạy vòng lặp chính, xử lý tìm đường và đưa ra quyết định để ngăn chặn gian lận (ví dụ: client hack để NPC ngừng tấn công). Điểm yếu là CPU/RAM của server bị giới hạn, khó gánh được hàng ngàn AI phức tạp cùng lúc.
*   **Offload sang Client (Distributed):** Offload việc tính toán AI phức tạp cho máy client. Mặc dù giúp giảm tải server, nhưng vi phạm nguyên tắc "Never trust the client". Bất kỳ logic nội bộ nào chạy trên client đều có nguy cơ bị thao túng hoặc gặp vấn đề desync do độ trễ mạng (latency).
*   **Giải pháp Khuyến nghị (Hybrid Architecture):** 
    *   Server giữ quyền quyết định tuyệt đối (Authoritative) đối với các NPC quan trọng (quái vật, boss, lính gác) và điều hướng vĩ mô.
    *   Phân bổ tải bằng **Area-Based Sharding** (chia thế giới thành các microcell và chỉ mô phỏng AI ở nơi có người chơi).
    *   Áp dụng **Staggered Updates** (không cập nhật toàn bộ AI mỗi tick, mà chia đều ra các frame để làm phẳng biểu đồ sử dụng CPU).
    *   Chỉ offload cho Client các hiệu ứng di chuyển vi mô thuần túy (như animation, boids nội bộ để hình ảnh trông mượt mà) mà không ảnh hưởng tới state trên server.

## 2. NavMesh Động & Tìm Đường A* Khi Người Chơi Xây Dựng
Khi thế giới liên tục thay đổi bởi công trình của người chơi, việc re-bake toàn bộ Navigation Mesh là thảm họa về mặt hiệu năng.

*   **NavMesh Cutting / Carving:** Thay vì tạo lại toàn bộ NavMesh, sử dụng kỹ thuật "cắt" (carving) các vùng có công trình mới đặt xuống làm chướng ngại vật động. Hệ thống chỉ xử lý lại đa giác tại một khu vực rất nhỏ xung quanh công trình.
*   **Navigation Invokers:** Tính năng chia nhỏ NavMesh theo từng chunk và chỉ load/update những mảng NavMesh nằm ngay sát người chơi hoặc NPC đang hoạt động, giúp tiết kiệm bộ nhớ đáng kể.
*   **Hierarchical Pathfinding (Tìm đường phân cấp):**
    *   *Vĩ mô (Macro):* Dùng A* trên một đồ thị đơn giản hóa để tìm luồng đi chính.
    *   *Vi mô (Micro):* Kết hợp Steering Behaviors hoặc Local Obstacle Avoidance (như RVO2/ORCA) để tự động lách qua chướng ngại vật mới hoặc người chơi mà không cần phải gọi lại A*.
*   Mọi tính toán đường đi phức tạp đều phải được đẩy sang luồng chạy nền (**Asynchronous Worker Threads**).

## 3. Mô Phỏng Đám Đông (Crowd Simulation) Ở Quy Mô Massive
Áp dụng Boids algorithm trực tiếp cho 1000+ NPC sẽ sụp đổ vì độ phức tạp O(N^2) khi mỗi NPC phải kiểm tra mọi NPC khác.

*   **Entity Component System (ECS):** Bắt buộc phải sử dụng kiến trúc ECS để đạt hiệu năng tối đa. Bằng cách lưu trữ dữ liệu (Position, Velocity) liên tiếp trong bộ nhớ, chúng ta loại bỏ cache miss và cho phép hệ thống tính toán bằng đa luồng cường độ cao (Job System) hoặc thậm chí Compute Shaders.
*   **Spatial Partitioning (Grid/Hashing):** Chia thế giới thành lưới. Mỗi NPC khi áp dụng Boids (Alignment, Cohesion, Separation) chỉ truy vấn những thực thể nằm cùng ô hoặc ô lân cận, đưa chi phí từ O(N) xuống O(N).
*   **Flow Fields (Trường Vector):** Đây là kỹ thuật cốt lõi cho số lượng lớn. Thay vì 1000 NPC tự tính 1000 đường A*, Flow Field tính toán 1 lần tạo ra "bản đồ dòng chảy" hướng về mục tiêu. Hàng ngàn NPC chỉ việc đọc vector chỉ hướng tại vị trí đang đứng (O(1)) kết hợp với Boids cục bộ để di chuyển như dòng nước mượt mà qua các con phố mà không gây tắc nghẽn server.

## 4. Hành Vi Ambient & Idle Cho Đô Thị Sống Động
Ambient NPC (người bán hàng, người đi dạo) cần tạo cảm giác thành phố sống động nhưng không được phép "ăn" CPU server.

*   **Lightweight FSM (Finite State Machine):** Đối với các NPC làm nền, Behavior Trees (BT) tốn quá nhiều overhead cho việc duyệt cây. Một FSM đơn giản (Idle -> Wander -> Use Smart Object) quản lý thông qua Data-driven events sẽ tốn ít CPU hơn rất nhiều. 
*   **AI Level of Detail (LOD) & Throttling:**
    *   *Cự ly gần:* NPC cập nhật logic và pathfinding ở tần số cao (10Hz).
    *   *Cự ly xa:* NPC giảm tick rate xuống 1Hz hoặc 0.5Hz.
    *   *Khuất tầm nhìn (Culled):* Đóng băng hoàn toàn FSM, chuyển NPC sang trạng thái ảo (ngủ đông) và chỉ ngoại suy vị trí hoặc xử lý xác suất sự kiện thay vì mô phỏng vật lý thực tế.
*   **Event-Driven Architecture:** Không dùng Polling (mỗi frame không hỏi "đã có khách chưa?"). Thay vào đó, AI chỉ thức dậy xử lý logic khi nhận được Event (ví dụ: Event "Người chơi tương tác", Event "Hết giờ làm việc").
