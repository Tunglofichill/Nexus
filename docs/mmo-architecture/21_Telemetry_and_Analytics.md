# Báo Cáo Kỹ Thuật: Phân Tích Dữ Liệu & Telemetry Cho Game MMO

## 1. Spatial Analytics & Heatmaps (Phân tích Không gian & Bản đồ Nhiệt)
**Mục đích:** Theo dõi cách người chơi di chuyển, tương tác trong thế giới 3D, từ đó tối ưu hóa Level Design (thiết kế màn chơi).

*   **Cách thu thập dữ liệu (Tracking):**
    *   Game client/server sẽ định kỳ gửi các sự kiện chứa tọa độ `(X, Y, Z)`, góc nhìn, `Map_ID`, `Server_ID` và `Timestamp`. Việc này thường được thực hiện theo chu kỳ ngắn (vd: 5-7 giây/lần) hoặc dựa trên sự kiện (khi người chơi chết, PK, nhặt rương).
*   **Trực quan hóa (Visualization):**
    *   **Hotspots (Vùng quá tải/Sôi động):** Bản đồ nhiệt sẽ hiển thị màu đỏ/cam tại các điểm có mật độ người chơi cao. Điều này giúp phát hiện các khu vực farm quái bị quá tải hoặc điểm "nghẽn cổ chai", từ đó có phương án phân tải server hoặc sắp xếp lại quái vật.
    *   **Dead zones (Khu vực chết):** Các vùng màu xanh hoặc không có dữ liệu cho thấy người chơi hiếm khi lui tới. Designer có thể dùng thông tin này để thêm Quest, NPC, hoặc làm lại địa hình để khuyến khích khám phá.
    *   Công cụ thường dùng: Tích hợp custom plugins thẳng vào Game Engine (Unreal/Unity) để render heatmap lên không gian 3D, hoặc dùng công cụ như Tableau.

## 2. Funnel Analysis (Phân tích Phễu: Tỉ lệ bỏ rơi Tutorial)
**Mục đích:** Tìm ra chính xác vị trí và nguyên nhân khiến người chơi thoát game (quit) trong phần hướng dẫn tân thủ (FTUE - First Time User Experience).

*   **Cách thiết lập:** Chia nhỏ Tutorial thành nhiều bước (steps) cụ thể.
    *   *Ví dụ:* `1_start` -> `2_move_done` -> `3_open_inventory` -> `4_kill_first_monster` -> `5_tutorial_complete`.
*   **Phân tích & Hành động:**
    *   **Đo lường Drop-off rate:** Tính phần trăm lượng người chơi rơi rụng giữa từng bước. Theo tiêu chuẩn ngành, tỉ lệ hoàn thành tutorial thường nằm ở mức 60-90%.
    *   **Xác định Bottleneck:** Nếu dữ liệu cho thấy số lượng người chơi sụt giảm mạnh từ 80% xuống 30% ở bước `4_kill_first_monster`, nguyên nhân có thể do quái quá mạnh, cơ chế combat phức tạp, hoặc có bug cản trở người chơi tấn công.
    *   **Giải pháp:** Kết hợp với Session Replays (ghi hình phiên chơi) hoặc UI Heatmaps (vị trí click) để xem người chơi có bị kẹt hay "bấm loạn lên" vì bối rối không, từ đó đơn giản hóa luồng thao tác.

## 3. Economy Telemetry (Theo dõi Kinh tế: Sinks & Faucets)
**Mục đích:** Kiểm soát lạm phát và duy trì vòng lặp kinh tế bền vững trong MMO.

*   **Khái niệm Cốt lõi:**
    *   **Faucets (Nguồn cung):** Các hoạt động tạo ra tiền/tài nguyên mới đẩy vào server (Ví dụ: Thưởng nhiệm vụ, quái rớt vàng, điểm danh hằng ngày).
    *   **Sinks (Nguồn tiêu thụ):** Các hoạt động phá hủy/loại bỏ tiền vĩnh viễn khỏi server (Ví dụ: Phí sửa đồ, thuế giao dịch trên Auction House, cường hóa/đập đồ).
*   **Chiến lược Telemetry:**
    *   Theo dõi mọi sự kiện giao dịch với nhãn `economy_transaction`, bao gồm `amount`, `currency_type`, và phân loại in/out.
    *   Xây dựng Dashboard hiển thị **"Tổng lượng tiền đang lưu thông"**. Nếu tốc độ Faucets sinh ra tiền vượt xa Sinks tiêu thụ, lượng tiền tích lũy tăng vọt dẫn tới **Lạm phát** (giá trị tiền tệ giảm, giá vật phẩm trên chợ đen lạm phát).
*   **Can thiệp (LiveOps):** Khi phát hiện lạm phát sớm, nhà phát triển có thể thiết kế các "Luxury Sinks" (ví dụ: thú cưỡi siêu đắt đỏ) để hút bớt tiền từ người chơi giàu, hoặc tăng nhẹ thuế giao dịch.

## 4. Data Pipeline (Đường ống dữ liệu High-Throughput)
**Mục đích:** Gửi hàng chục nghìn sự kiện telemetry mỗi giây (EPS) từ hàng nghìn Concurrent Users (CCU) mà không làm sụt giảm Tick Rate hay gây lag Game Server.

*   **Kiến trúc Bất đồng bộ (Asynchronous):**
    *   Game Server tuyệt đối **không** ghi dữ liệu thẳng vào Database. Thay vào đó, Server đóng gói dữ liệu (thường dùng chuẩn nén như Protobuf thay vì JSON để tiết kiệm băng thông) và đẩy bất đồng bộ vào một **Message Broker/Buffer**.
*   **Lựa chọn Broker: Apache Kafka vs. AWS Kinesis**
    *   **Apache Kafka:** 
        *   Cung cấp thông lượng (throughput) cực kỳ khủng và độ trễ thấp.
        *   Hỗ trợ kiến trúc Multi-cloud (không bị khóa vào một nhà cung cấp đám mây), dễ dàng mở rộng.
        *   *Nhược điểm:* Đội ngũ Kỹ sư Dữ liệu phải tự vận hành, bảo trì và cân bằng cụm (cluster), cấu hình phân vùng (partitions) rất phức tạp.
    *   **AWS Kinesis (Data Streams):**
        *   Dịch vụ Serverless (fully-managed) của Amazon. Đội ngũ không cần quản lý máy chủ hay cài đặt hạ tầng.
        *   Được tích hợp sẵn cực tốt với hệ sinh thái AWS (bắn data vào S3, phân tích bằng Athena hoặc Redshift).
        *   *Nhược điểm:* Có thể tốn kém hơn ở quy mô siêu lớn, mô hình tính phí dựa trên Shard cần theo dõi cẩn thận.
*   **Luồng xử lý (Data Flow):** `Game Server/Client` -> `API Gateway / Ingestion Service` -> `Kafka / Kinesis (Buffer)` -> `Stream Processor (Ví dụ: Flink, Lambda)` -> `Data Warehouse (Phân tích) / Data Lake (Lưu trữ)`. Kiến trúc này tách biệt hoàn toàn tải của Game Server khỏi tải của hệ thống Phân tích Dữ liệu.
