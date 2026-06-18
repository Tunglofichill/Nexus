# Báo Cáo Kỹ Thuật: Tối Ưu Hóa Physics Engine Cho Game WebGL MMO

## 1. Rapier vs Cannon.js cho Game 3D Trình Duyệt

Trong việc lựa chọn Physics Engine cho một tựa game WebGL 3D, sự khác biệt giữa Rapier và Cannon.js là rất rõ rệt:

*   **Rapier (Khuyên dùng):** Đây là tiêu chuẩn hiện đại cho lập trình web 3D. Được viết bằng ngôn ngữ Rust và biên dịch sang WebAssembly (WASM), Rapier mang lại hiệu suất cực cao (thường nhanh hơn từ 2 đến 10 lần so với các engine thuần JavaScript). Rapier hỗ trợ tốt các môi trường phức tạp có số lượng vật thể lớn, sở hữu các tính năng vật lý tiên tiến (như continuous collision detection) và dễ dàng tích hợp với các hệ sinh thái như Three.js hay React Three Fiber.
*   **Cannon.js / Cannon-es (Legacy):** Đây là một engine được viết bằng JavaScript thuần túy. Lợi thế đáng kể duy nhất của Cannon là dung lượng file tải (bundle size) rất nhỏ. Tuy nhiên, vì không có các cơ chế tối ưu hóa hiện đại, hiệu năng của nó sẽ sụt giảm nhanh chóng khi số lượng vật thể va chạm tăng lên. Hiện tại, lõi của Cannon không còn được phát triển tích cực mà chỉ được duy trì bởi cộng đồng.

**Kết luận:** Đối với một game MMO nơi số lượng tương tác vật lý liên tục mở rộng, **Rapier** là sự lựa chọn tối ưu nhất để đảm bảo tính ổn định và hiệu năng.

---

## 2. Tích hợp Web Workers (Tránh nghẽn Main Thread)

Với JavaScript, Main Thread phải xử lý cả việc render WebGL (Three.js/Babylon.js), quản lý UI và lắng nghe sự kiện của người dùng. Nếu chạy toàn bộ các phép tính vật lý nặng trên cùng luồng này, trò chơi sẽ bị drop FPS hoặc giật lag. Việc chuyển (offload) vật lý sang **Web Workers** là điều bắt buộc.

*   **Kiến trúc phân luồng (Thread Architecture):**
    *   **Main Thread:** Chuyên tâm render đồ họa ở mức khung hình cao và tiếp nhận input của người chơi.
    *   **Worker Thread:** Chạy độc lập Physics Engine (Rapier). Nó lấy dữ liệu đầu vào, xử lý nội suy, giải quyết va chạm (collision), trọng lực, và gửi trả lại các ma trận biến đổi (transform - bao gồm vị trí và góc xoay).
*   **Tối ưu hóa giao tiếp (Communication):** Việc gửi tin nhắn giữa hai luồng rất tốn kém bộ nhớ. Bắt buộc phải sử dụng `postMessage` kết hợp với **Transferable Objects** (như `Float32Array`) hoặc sử dụng **SharedArrayBuffer** để chia sẻ quyền đọc ghi vùng nhớ trực tiếp, nhằm tránh overhead sinh ra do việc sao chép dữ liệu (memory cloning).
*   **Kỹ thuật nội suy (Interpolation):** Việc nhắn tin giữa hai luồng luôn có độ trễ nhỏ (latency). Do vậy, Main Thread cần nội suy chuyển động giữa các trạng thái vật lý nhận được (physics steps) để tạo ra các hoạt ảnh mượt mà trên khung hình 60+ FPS thay vì để nhân vật di chuyển một cách "giật cục" (jitter).

---

## 3. Server Authoritative Physics (Vật Lý Ủy Quyền Máy Chủ)

Đối với game MMO, việc bảo mật dữ liệu là yếu tố sống còn. Nếu Client được phép gửi vị trí tọa độ trực tiếp, hacker có thể tự ý sửa đổi gói tin để sử dụng cheat (dịch chuyển tức thời, xuyên tường, speed hack). 

*   **Headless Physics Engine (Chạy trên Server):**
    *   Server (ví dụ: NodeJS) sẽ chạy một phiên bản "Headless" của Rapier. Phiên bản này chỉ có hệ thống tọa độ thế giới (world) và các hitbox/colliders mà không cần render hình ảnh.
    *   **Luồng hoạt động chuẩn:** Client KHÔNG gửi vị trí hiện tại lên Server. Client chỉ gửi **Inputs** (như "Nhấn phím W", "Nhảy"). Server tiếp nhận inputs, chạy mô phỏng vật lý ở phía Server, tính toán va chạm và di chuyển. Sau đó, Server phát (broadcast) "Snapshot" (trạng thái tuyệt đối của toàn bộ vật thể) về cho Client ở một tick rate cố định (ví dụ 30Hz - 60Hz).
*   **Kỹ thuật bù đắp độ trễ mạng (Latency Compensation):**
    *   Vì phải chờ mạng khứ hồi nên thao tác sẽ có độ trễ nếu không xử lý. Ta áp dụng 3 kỹ thuật:
        1.  **Client-Side Prediction (Dự đoán tại Client):** Khi người chơi thao tác, Client lập tức mô phân và cho nhân vật di chuyển ngay mà không đợi Server.
        2.  **Server Reconciliation (Hòa giải đồng bộ):** Khi nhận được Snapshot chính thức từ Server, Client đối chiếu với dữ liệu dự đoán. Nếu sai lệch, Server luôn đúng; Client bị buộc phải snap về vị trí của Server và áp dụng bù (replay) lại các input mà Server chưa ghi nhận.
        3.  **Entity Interpolation (Nội suy thực thể khác):** Để các người chơi khác di chuyển không bị giật lùi, Client hiển thị chúng trễ hơn thực tế một chút (khoảng 50-100ms) để dễ dàng nội suy chuyển động giữa hai gói tin Snapshot gần nhất nhận được.
*   **Tối ưu hóa Server CPU:** Mô phỏng vật lý là tác vụ ngốn CPU máy chủ lớn. Cần triển khai các hệ thống **Spatial Partitioning** (Chia bản đồ thành từng khu vực/grid). Server chỉ thực hiện tính toán vật lý cho những "vùng" hiện tại có người chơi đang hoạt động.
