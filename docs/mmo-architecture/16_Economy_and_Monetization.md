# Báo cáo Thiết kế Kinh tế Game MMO Social

## 1. Hệ thống Tiền tệ Kép (Dual Currency System)
Để duy trì một nền kinh tế bền vững, cần có sự phân định và cân bằng rõ ràng giữa hai loại tiền tệ:
*   **Tiền mềm (Soft Currency - Cày cuốc):** Đóng vai trò là động cơ của vòng lặp gameplay cốt lõi. Người chơi kiếm được qua nhiệm vụ, mini-game, hay tương tác xã hội.
    *   *Sử dụng:* Dành cho tiến trình cơ bản, mua nguyên liệu, hoặc phí duy trì.
    *   *Kiểm soát:* Phải có hệ thống "xả" (Sinks) hiệu quả như thuế chợ đen, phí nâng cấp/sửa chữa, phí di chuyển... để chống lạm phát.
*   **Tiền cứng (Hard Currency - Nạp thẻ):** Đại diện cho giá trị thực tế, mang lại tiện ích hoặc giá trị thời trang.
    *   *Sử dụng:* Dành cho mỹ phẩm, thẻ bỏ qua thời gian chờ (speedups), và các dịch vụ cao cấp.
*   **Cách thức Cân bằng:** 
    *   **Nguyên tắc "Đổi thời gian lấy tiền bạc":** Game phải tôn trọng người có nhiều thời gian (cày cuốc) và người có nhiều tiền (nạp thẻ). 
    *   **Không trộn lẫn vai trò:** Đừng ép người chơi dùng cả 2 loại tiền cho cùng một vật phẩm, vì sẽ làm hỏng cảm giác tiến trình.
    *   **Cầu nối trao đổi:** Có thể cho phép quy đổi lượng nhỏ Tiền Cứng thông qua nỗ lực cày cuốc cường độ cao của Tiền Mềm để giữ chân người chơi cày chay (F2P), từ đó tạo ra tập khách hàng dồi dào cho người chơi nạp thẻ (Whales) tương tác.

## 2. Kiếm tiền từ Mỹ phẩm & Gia trang (Cosmetics & Housing)
Việc kiếm tiền từ hệ thống xây nhà và thời trang rất dễ vấp phải ranh giới "Pay-To-Win" (P2W) hoặc gây ác cảm nếu không khéo léo.
*   **Thuần túy Thẩm mỹ (Purely Cosmetic):** Đảm bảo các đồ nội thất, skin, hoặc gói mở rộng đất đai mua bằng tiền thật KHÔNG mang lại chỉ số sức mạnh hay buff tiện ích (như tăng tốc độ chế đồ, tăng sức chứa kho không giới hạn). Chúng chỉ nên đóng vai trò thể hiện cá tính, địa vị xã hội (Status).
*   **Hệ sinh thái Đồ nội thất đan xen:** Cho phép người chơi F2P tự chế tạo (Crafting) ra các mẫu nội thất đẹp và đa dạng. Các vật phẩm bán bằng Tiền Cứng nên là những phiên bản có hiệu ứng độc bản (VFX), chủ đề giới hạn theo sự kiện (Seasonal) hoặc kết hợp IP (Collab).
*   **Tránh Thương mại hóa độc hại:** Bán mở rộng không gian nhà/rương đồ có thể bị coi là P2W nếu không gian cơ bản quá nhỏ hẹp. Hãy cung cấp một không gian mặc định rộng rãi, chỉ thu phí khi người chơi muốn xây "lâu đài" siêu lớn.

## 3. Kiến trúc Giao dịch (Player-to-Player & Auction House)
Với đặc thù của game MMO, Hệ thống Chợ (Auction House) là mục tiêu hàng đầu của Hacker và thao túng tiền thật (RMT).
*   **Thẩm quyền Máy chủ (Server-Side Authority):** Tuyệt đối không tin tưởng Client. Mọi hành động niêm yết, đặt giá, hủy bỏ đều phải được Server xác thực chéo về quyền sở hữu và số dư tiền tệ.
*   **Tính nhất quán của Giao dịch (ACID):** Sử dụng Cơ sở dữ liệu quan hệ (Relational Database như PostgreSQL/MySQL) cho các luồng giao dịch. Quá trình trao đổi (trừ vật phẩm của người bán + trừ tiền người mua) phải là một **giao dịch nguyên tử (Atomic)** – thành công tất cả hoặc hủy bỏ tất cả, để tránh triệt để lỗi nhân bản (dupe) vật phẩm.
*   **Kiến trúc Phân tán (Microservices/Queues):** Tách biệt dịch vụ Chợ khỏi Server Game chính. Sử dụng Message Queues (như Kafka hoặc RabbitMQ) để xử lý lượng lớn lệnh đấu giá đồng thời mà không làm lag các hoạt động di chuyển/chiến đấu trong game.
*   **Cơ chế Chống Gian lận (Anti-Fraud):** 
    *   Áp dụng *Rate Limiting* để chặn Bot cào dữ liệu và "bắn tỉa" (sniping) giá.
    *   Có thể áp dụng độ trễ hiển thị ngẫu nhiên (Delayed Visibility) từ 1-5 phút khi niêm yết đồ mới lên chợ để vô hiệu hóa lợi thế tốc độ của Bot.
    *   Lưu trữ Immutable Logs (nhật ký không thể chỉnh sửa) cho mọi giao dịch để kiểm toán và truy vết đường dây bơm tiền.
