# Báo Cáo Bảo Mật & Chống Gian Lận Cho Browser-Based MMO

## 1. Ngăn chặn Khai thác Phía Client (Client-Side Exploits)
Do client chạy trên trình duyệt (môi trường người dùng toàn quyền kiểm soát qua DevTools), nguyên tắc cốt lõi là **Zero Trust (Không bao giờ tin tưởng Client)**.
* **Bảo vệ Object & Console:** Sử dụng `Object.freeze()` và `Object.seal()` lên các API cốt lõi hoặc cấu hình Three.js để chặn người chơi ghi đè các hàm hay chỉnh sửa các vector (tọa độ, vận tốc) trực tiếp từ DevTools Console. 
* **Cô lập Scope:** Gói gọn mã game trong các IIFE (Immediately Invoked Function Expression) hoặc module hệ thống, tránh phơi bày biến ra global scope (`window`).
* **Gây khó khăn dịch ngược (Obfuscation & WASM):** Biên dịch logic lõi (Core Game Loop) thành WebAssembly (từ C++/Rust). WASM khiến việc đọc và thao túng bộ nhớ khó hơn rất nhiều so với JavaScript. Nếu dùng JS, bắt buộc phải dùng các công cụ Minifier/Obfuscator mạnh (Terser, Jscrambler).

## 2. Xác thực Phía Server (Server-Side Validation)
Server là nguồn chân lý duy nhất (Source of Truth). Client chỉ gửi *yêu cầu* (Input/Intent), server tính toán và trả về *kết quả*.
* **Chống Speedhack & Teleporting:** Lưu timestamp cuối cùng cho mỗi yêu cầu di chuyển. Khi tính toán khoảng cách ($\Delta d$) và thời gian ($\Delta t$), nếu vận tốc ($v = \Delta d / \Delta t$) vượt quá giới hạn tối đa (kèm sai số ping mạng), server sẽ từ chối và ép tọa độ người chơi giật ngược về vị trí hợp lệ gần nhất (Rubber-banding). 
* **Xác thực Không gian & Vật lý:** Tích hợp lưới điều hướng (NavMesh/Grid) trên server để sử dụng Raycasting kiểm tra va chạm, đảm bảo client không đi xuyên tường (No-clip) hoặc chém/bắn xuyên vật cản (Line of sight validation).
* **Xác thực Tương tác:** Quản lý chặt chẽ khoảng cách tác động (Max Range) và thời gian hồi chiêu (Cooldown) hoàn toàn trên server để tránh các hack spam kỹ năng hay auto-aim tầm xa.

## 3. Giới hạn Tỷ lệ & Phòng chống DDoS (Rate Limiting)
Hệ thống WebSocket duy trì kết nối liên tục nên cần được bảo vệ chặt chẽ để chống Flooding và cạn kiệt tài nguyên.
* **Bảo mật Kênh truyền:** Bắt buộc sử dụng giao thức `wss://` (WebSocket Secure kết hợp TLS/SSL) nhằm ngăn chặn việc nghe lén hoặc sửa đổi gói tin trên đường truyền (MitM).
* **Rate Limiting phía Ứng dụng:** Áp dụng thuật toán Token Bucket/Leaky Bucket cho từng session kết nối (VD: tối đa 15-20 messages/giây). Nếu phát hiện tần suất gửi vượt ngưỡng, hệ thống tự động drop packet, ngắt kết nối (Kick) hoặc cấm IP (Ban) tự động.
* **Kiểm tra Kích thước & Cấu trúc:** Giới hạn chặt chẽ kích thước tối đa của payload (ví dụ < 1KB/packet). Nên sử dụng giao thức nhị phân có Schema tĩnh (như Protobuf, FlatBuffers) thay cho JSON. Các gói tin sai định dạng sẽ tự động bị loại bỏ ở Gateway trước khi đi sâu vào logic server.

## 4. Bảo mật Kinh tế & Chống Nhân bản Vật phẩm (Economy Security)
Rủi ro lớn nhất của hệ thống kinh tế MMO là nhân bản vật phẩm (Dupe) và lạm phát thông qua các lỗi Race Condition.
* **Giao dịch ACID:** Mọi giao dịch mua bán/trao đổi phải được thực hiện thông qua CSDL quan hệ (PostgreSQL, MySQL) thay vì Redis thuần. Sử dụng Database Transactions (Begin/Commit/Rollback) để đảm bảo việc trao đổi tài sản là nguyên tử (Atomic), nếu có lỗi xảy ra thì mọi thay đổi đều được thu hồi.
* **Khóa đồng thời (Distributed Locks):** Trước khi xử lý thao tác Trade giữa A và B, hệ thống phải cấp phát Lock (VD: `SELECT ... FOR UPDATE` trong CSDL, hoặc Redis Mutex) cho Inventory của *cả hai* người chơi cùng một lúc. Cơ chế này triệt tiêu khả năng 2 request diễn ra trong cùng mili-giây gây lỗi nhân đôi tài sản.
* **Audit Trail & UUID:** Cấp định danh duy nhất (UUID) cho mọi tài sản hoặc vật phẩm hiếm. Ghi log toàn bộ lịch sử tạo ra (Spawn), giao dịch (Trade) và bị mất đi (Sink) dựa trên UUID đó. Có thể thiết lập Cron Jobs để liên tục quét DB tìm kiếm các UUID trùng lặp, tự động cảnh báo admin để khóa tài khoản trục lợi.
