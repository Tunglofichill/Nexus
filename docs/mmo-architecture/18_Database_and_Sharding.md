# Báo Cáo Kỹ Thuật: Kiến Trúc Cơ Sở Dữ Liệu Game MMO

## 1. Phân loại dữ liệu: Hot vs Warm vs Cold Data
Trong hệ thống MMO, việc phân loại dữ liệu theo tần suất truy cập và yêu cầu tốc độ là yếu tố sống còn để đảm bảo hiệu năng và tối ưu chi phí.

*   **Dữ liệu Nóng (Hot Data)**
    *   **Nội dung:** Tọa độ người chơi (X,Y,Z), trạng thái di chuyển, lượng máu/mana hiện tại, các hiệu ứng (buff/debuff) đang kích hoạt.
    *   **Nơi lưu trữ:** Bộ nhớ RAM của Game Server hoặc các In-memory Data Store như **Redis**, Memcached.
    *   **Đặc điểm:** Tần suất đọc/ghi cực kỳ cao (hàng chục lần mỗi giây cho mỗi người chơi). Yêu cầu độ trễ (latency) gần như bằng không. Dữ liệu này thường bị mất khi server crash, nhưng có thể phục hồi trạng thái cơ bản từ Warm Data.
*   **Dữ liệu Ấm (Warm Data)**
    *   **Nội dung:** Túi đồ (Inventory), Tiền tệ (Gold/Crystals), Trạng thái nhiệm vụ (Quests), Kinh nghiệm (EXP), Chỉ số nhân vật.
    *   **Nơi lưu trữ:** Cơ sở dữ liệu quan hệ (RDBMS) như **PostgreSQL** hoặc MySQL. Đôi khi dùng các NoSQL DB hỗ trợ độ trễ thấp như MongoDB/Cassandra tùy kiến trúc.
    *   **Đặc điểm:** Yêu cầu tính toàn vẹn dữ liệu nghiêm ngặt (chuẩn ACID) để tránh lỗi mất đồ hoặc bug nhân bản tiền (duping). Dữ liệu thay đổi khi có các sự kiện cụ thể (hoàn thành nhiệm vụ, mua bán) và thường được ghi bất đồng bộ (asynchronous write-behind) từ Game Server xuống Database để tránh nghẽn cổ chai.
*   **Dữ liệu Lạnh (Cold Data)**
    *   **Nội dung:** Lịch sử chat, lịch sử giao dịch/mua bán cũ (ví dụ: trên 6 tháng), log hệ thống, dữ liệu hành vi người chơi.
    *   **Nơi lưu trữ:** Các dịch vụ lưu trữ Object Storage như **Amazon S3**, Google Cloud Storage, hoặc các hệ thống Data Lake / Data Warehouse (Snowflake, BigQuery).
    *   **Đặc điểm:** Khối lượng dữ liệu khổng lồ (Terabytes đến Petabytes) nhưng rất ít khi được truy cập. Chủ yếu phục vụ cho bộ phận Chăm sóc khách hàng (CS), kiểm toán hệ thống, Data Analytics và huấn luyện các mô hình Machine Learning (phát hiện bot/cheat).

---

## 2. Database Sharding: Giải bài toán cho hơn 100,000 người chơi
Khi CCU (Concurrent Users) hoặc tổng số người chơi vượt quá giới hạn xử lý của một Database vật lý (thường ở mốc vài chục ngàn user active), hệ thống bắt buộc phải mở rộng theo chiều ngang (Horizontal Scaling) thông qua Sharding.

*   **Khái niệm:** Sharding là kỹ thuật phân chia (partition) dữ liệu của người chơi ra nhiều Database Servers khác nhau (gọi là các Shard).
*   **Chiến lược phân mảnh (Sharding Strategies):**
    *   **Hash-based Sharding (Phân mảnh theo thuật toán băm):** Dùng một hàm băm trên `Player_ID` hoặc `Account_ID`. Ví dụ: `Shard_ID = Hash(Player_ID) % Số_lượng_Shard`. Cách này giúp dữ liệu phân bố đồng đều, tránh tình trạng một server gánh quá nhiều tải (hotspot).
    *   **Geo/Region-based Sharding:** Phân mảnh theo khu vực địa lý của người chơi (NA, EU, SEA) để giảm thiểu độ trễ mạng (Ping).
*   **Thách thức và Giải pháp khi mở rộng:**
    *   **Giao dịch xuyên Shard (Cross-shard Transactions):** Khi 2 người chơi ở 2 Shard khác nhau thực hiện giao dịch (Trade). Hệ thống không thể dùng transaction thông thường của SQL. Giải pháp là sử dụng **Two-Phase Commit (2PC)** hoặc **Saga Pattern** kết hợp với Message Queue (Kafka/RabbitMQ) để đảm bảo tính nhất quán cuối (Eventual Consistency).
    *   **Rebalancing (Tái cân bằng):** Khi cần thêm Shard mới do lượng người chơi tăng đột biến. Việc sử dụng **Consistent Hashing (Băm nhất quán)** sẽ giúp giảm thiểu tối đa lượng dữ liệu cần di chuyển giữa các server cũ và mới.

---

## 3. Data Serialization: Protobuf/Flatbuffers vs JSON
Khi cần lưu trữ một khối trạng thái game (Game State Blob) khổng lồ xuống Database (ví dụ: một cấu trúc Inventory phức tạp), việc chọn định dạng tuần tự hóa (Serialization) là cực kỳ quan trọng.

*   **Tại sao JSON không phù hợp cho MMO Game State?**
    *   **Quá cồng kềnh:** JSON lưu trữ dữ liệu dưới dạng văn bản (text), lặp lại các "key" ở mọi object, gây tốn băng thông mạng và dung lượng ổ cứng.
    *   **Tốc độ chậm:** Việc Parsing (phân tích cú pháp) chuỗi JSON tiêu tốn rất nhiều chu kỳ CPU, gây chậm trễ cho Game Server khi tải/lưu dữ liệu liên tục.
*   **Ưu điểm vượt trội của Protocol Buffers (Protobuf) / Flatbuffers:**
    *   **Định dạng Nhị phân (Binary):** Protobuf và Flatbuffers mã hóa dữ liệu thành các byte nhị phân siêu nhỏ gọn. Kích thước file lưu trữ có thể giảm từ 3 đến 10 lần so với JSON, giúp giảm tải trực tiếp cho Database IOPS và Storage.
    *   **Tốc độ xử lý siêu tốc:** Chuyển đổi dữ liệu nhị phân tốn ít CPU hơn nhiều. Đặc biệt, **Flatbuffers** sở hữu khả năng "Zero-copy" — tức là Game Server có thể đọc trực tiếp một thuộc tính (như `player.inventory.weapon`) từ luồng byte mà không cần phải phân tích toàn bộ object vào RAM, giúp tiết kiệm bộ nhớ và giảm thiểu tình trạng giật lag do Garbage Collection (GC).
    *   **Schema chặt chẽ và Tương thích ngược (Backward Compatibility):** Các file `.proto` hoặc `.fbs` định nghĩa cấu trúc dữ liệu rõ ràng. Khi cập nhật game (thêm/bớt field), hệ thống vẫn có thể đọc được dữ liệu từ các phiên bản cũ một cách an toàn mà không làm crash server hay hỏng file save của người chơi.
