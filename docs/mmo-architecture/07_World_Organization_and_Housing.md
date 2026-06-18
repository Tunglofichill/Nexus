# TÀI LIỆU CHIẾN LƯỢC KIẾN TRÚC MMO: HỆ THỐNG GIA CƯ (PLAYER HOUSING)

Tài liệu này vạch ra chiến lược kiến trúc tổng thể cho hệ thống Server và Database nhằm quản lý hệ thống gia cư quy mô lớn trong game MMO.

## 1. Single-Shard vs Multi-Shard (Kiến trúc Thành phố)

Sự lựa chọn giữa một siêu máy chủ (Mega-city) và nhiều máy chủ song song (Channels/Instances) quyết định cách người chơi tương tác với thế giới.

*   **Single-Shard (Thành phố Mega-city duy nhất):** Mọi người chơi tồn tại trong cùng một thực tại. Tuy tạo ra cảm giác một thế giới "sống động" và đông đúc, kiến trúc này gặp giới hạn vật lý về băng thông, CPU server và khả năng render của Client khi có hàng ngàn người tụ tập. Thường yêu cầu công nghệ Server Meshing rất phức tạp.
*   **Multi-Shard (Kênh / Parallel Instances):** Thành phố được nhân bản thành nhiều kênh (VD: Channel 1, Channel 2) tùy thuộc vào số lượng người chơi (CCU) hiện tại.
*   **Chiến lược đề xuất (Hybrid Architecture):** Nên sử dụng mô hình **Dynamic Multi-Shard**. Trung tâm thành phố sẽ tự động sinh ra các kênh (channels) mới khi vượt quá ngưỡng chịu tải (ví dụ: 1000 người/kênh). Điều này đảm bảo hiệu năng và giảm "lag" do tính toán mạng. Dữ liệu nhà ở sẽ được đồng bộ từ một Central Database, nghĩa là nếu người chơi chuyển kênh, họ vẫn thấy cơ sở dữ liệu vật thể đồng nhất hoặc được cô lập hợp lý.

## 2. Kinh tế Gia cư và Tính Khan hiếm (Housing Economics & Scarcity)

Sự khác biệt giữa đất vật lý (Physical plots) và căn hộ nhân bản (Instanced apartments) ảnh hưởng sâu sắc đến hệ sinh thái và nền kinh tế của game.

*   **Đất vật lý (Open-world Plots):** Có số lượng hữu hạn trên bản đồ. Gây ra sự khan hiếm thực sự, thúc đẩy đầu cơ bất động sản, tạo ra các "tầng lớp" người chơi và là một kênh tiêu thụ tiền tệ (money sink) tuyệt vời. Tuy nhiên, nó dẫn đến khủng hoảng gia cư (như Final Fantasy XIV).
*   **Căn hộ Instanced:** Nguồn cung vô hạn, chi phí cố định. Giúp tất cả mọi người đều có nhà, nhưng không tạo ra tính cộng đồng hoặc chợ bất động sản.
*   **Chiến lược đề xuất (Mô hình Kết hợp - The Hybrid Economic Model):** 
    *   **Tier 1 (Đại trà):** Cung cấp *Instanced Apartments* bên trong các tòa nhà cao tầng ở trung tâm. Bất kỳ ai cũng có thể mua để làm không gian cá nhân, giải quyết nhu cầu cơ bản.
    *   **Tier 2 (Khan hiếm/VIP):** Cung cấp các khu đất *Physical Plots* giới hạn ở ngoại ô hoặc các khu quy hoạch đặc biệt. Đánh thuế duy trì hàng tuần/tháng. Nếu không đóng thuế, đất sẽ bị tịch thu và bán đấu giá. Điều này tạo động lực cày cuốc, giữ cho nền kinh tế cân bằng mà không bỏ rơi tân thủ.

## 3. Lựa chọn Mô hình: "Lobby" vs "Open World" Paradigm

*   **Fully Continuous Open World:** Nhà nằm trực tiếp ngoài thế giới. Mọi vật phẩm trang trí, bàn ghế của hàng ngàn ngôi nhà phải được stream liên tục cho bất kỳ ai đi ngang qua. Điều này tạo gánh nặng cực lớn về I/O và Network Bandwidth.
*   **Lobby Hub & Instanced Neighborhoods:** Người chơi gặp nhau ở Quảng trường trung tâm. Từ đây, họ tương tác với các cánh cửa (Teleport) để đi vào một Instance chứa nhà của mình.
*   **Chiến lược đề xuất (Hub & Instanced Wards):** Thay vì một căn nhà lẻ loi, hãy tạo ra các **"Instanced Neighborhoods" (Khu phố nhân bản)**. Mỗi Instance (Ward) chứa khoảng 30-50 ngôi nhà, có đường phố và bãi cỏ chung.
    *   *Lợi ích:* Cắt giảm 90% khối lượng dữ liệu stream xuống Client so với Open World. Vẫn giữ được cảm giác "hàng xóm" vì người chơi có thể chạy bộ quanh khu phố nhỏ của mình. Quảng trường chính sẽ đóng vai trò Lobby lớn gọn gàng và không bị rác (clutter) bởi hàng triệu vật phẩm nội thất.

## 4. Lập chỉ mục Database cho Truy vấn Không gian (Spatial Search)

Bài toán: *Làm sao để truy vấn nhanh danh sách các ngôi nhà (và nội thất của nó) đang hiển thị trong khu vực người chơi đang đứng?*

*   **Các cấu trúc dữ liệu phổ biến:**
    *   **Grid (Lưới cơ bản):** Tính toán cực nhanh (O(1)), cache-friendly, tốt cho mật độ đồng đều.
    *   **QuadTree / Octree:** Tốt cho mật độ không đồng đều (chỗ thưa thớt, chỗ dày đặc).
    *   **R-Tree:** Chuẩn mực của Database (PostGIS) cho các hình khối phức tạp hoặc bounding boxes giao nhau.
*   **Chiến lược đề xuất (Hệ thống Lập chỉ mục 2 Lớp - Two-Tier Indexing):**
    1.  **Lớp Lưu trữ (Persistence Layer):** Sử dụng **PostgreSQL với PostGIS (R-Tree Indexing)**. Các ngôi nhà và tọa độ được lưu trữ ở đây. Khi một server instance khởi động (hoặc một khu vực/zone được tải), nó sẽ query PostGIS để kéo toàn bộ dữ liệu tĩnh của khu vực đó.
    2.  **Lớp In-Memory (Real-time Game State):** Sau khi data đã nằm trên RAM của Game Server, không dùng query Database nữa. Hãy đưa tọa độ vào một **Hệ thống Lưới tĩnh (Uniform 2D/3D Spatial Grid)** trên RAM. Mỗi khi player di chuyển qua ranh giới lưới (Grid Cell Boundary), server chỉ việc gửi thông tin của các Cell lân cận (vd: ma trận 3x3 cells xung quanh) cho Client. Grid index có độ trễ cực thấp và phù hợp nhất với các vật thể tĩnh như nhà cửa.

**Tổng kết:** Để hệ thống chạy trơn tru với hàng triệu người chơi, cần tách bạch giữa "Cảnh quan chung" (chia kênh tĩnh) và "Nội thất/Gia cư" (đưa vào các phân khu / ward instance), kết hợp cùng hệ thống lưu trữ R-Tree (DB) tải lên Grid (RAM).
