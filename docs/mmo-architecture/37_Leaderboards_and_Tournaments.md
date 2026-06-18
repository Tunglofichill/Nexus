# Báo cáo Kỹ thuật: Kiến trúc Bảng xếp hạng (Leaderboards) & Giải đấu (Tournaments) cho MMO

### 1. Redis Sorted Sets: Cấu trúc dữ liệu tối ưu nhất cho bảng xếp hạng toàn cầu
Trong các hệ thống MMO quy mô lớn, **Redis Sorted Sets (ZSET)** là tiêu chuẩn công nghiệp (industry standard) để xây dựng bảng xếp hạng thời gian thực.
- **Bản chất cấu trúc:** ZSET là sự kết hợp giữa Hash Table và Skip List. Hash Table lưu map từ `player_id` sang `score` (độ phức tạp $O(1)$). Skip List giữ các điểm số theo thứ tự sắp xếp (độ phức tạp $O(\log N)$).
- **Hiệu năng cập nhật (ZADD / ZINCRBY):** Khi người chơi ghi điểm, `ZINCRBY` cập nhật điểm và điều chỉnh lại vị trí của họ trong Skip List tức thì ($O(\log N)$). Không cần phải lock hay sắp xếp lại toàn bộ dữ liệu như trong cơ sở dữ liệu quan hệ (RDBMS).
- **Lấy Rank thời gian thực (ZREVRANK):** Tra cứu thứ hạng hiện tại của bất kỳ người chơi nào ngay lập tức với $O(\log N)$. Thậm chí với hàng chục triệu record, tốc độ phản hồi vẫn dưới 1ms.

### 2. Phân trang (Pagination): Lấy rank từ 50,000 đến 50,010 ngay lập tức
Truy vấn sâu (deep pagination) trong cơ sở dữ liệu SQL truyền thống bằng `OFFSET` rất tốn kém (phải quét và loại bỏ 50,000 bản ghi đầu tiên). Với Redis ZSET, kiến trúc được xử lý vô cùng tối ưu:
- **Câu lệnh sử dụng:** Dùng `ZREVRANGE leaderboard_key 50000 50010` (hoặc cú pháp mới `ZRANGE ... REV`).
- **Độ phức tạp:** $O(\log N + M)$, trong đó $N$ là tổng số người chơi và $M$ là số lượng phần tử cần lấy ($M=11$).
- **Cơ chế hoạt động:** Nhờ cấu trúc Skip List, Redis nhảy cóc qua các node để đến chính xác vị trí thứ 50,000 chỉ trong thời gian $O(\log N)$, thay vì phải duyệt tuần tự từ đầu. Sau đó, nó duyệt tiếp 11 node để lấy kết quả ($O(M)$). Do đó, việc fetch rank ở vị trí top 10 hay top 50,000 có tốc độ gần như tương đương nhau và trả về tức thì.

### 3. Đóng mùa giải (Seasonal Resets): Lưu trữ BXH cũ mà không có Downtime
Trong MMO, chuyển giao mùa giải (season) yêu cầu tính liên tục, không được làm gián đoạn việc ghi điểm của người chơi.
- **Sử dụng Key Rotation (Đổi tên Key):** Redis hỗ trợ lệnh `RENAME current_season_leaderboard season_1_leaderboard`. Lệnh này chạy cực nhanh với độ phức tạp $O(1)$ và mang tính nguyên tử (atomic).
- **Quy trình chuẩn không gây Downtime:**
  1. **Hot Path:** Game server luôn ghi điểm vào một key cố định đang active (VD: `leaderboard:current`).
  2. **Thời điểm Reset:** Thực thi lệnh `RENAME leaderboard:current leaderboard:season_1_archived`. Khóa cũ bị đổi tên, do đó các request update điểm tiếp theo sẽ tự động ghi vào khóa `leaderboard:current` hoàn toàn mới và trống rỗng của mùa giải tiếp theo. Người chơi không hề cảm nhận được sự gián đoạn.
  3. **Xử lý Archive:** Bảng xếp hạng cũ (`season_1_archived`) lúc này đã bị đóng băng (không còn ghi đè). Một Background Worker sẽ chạy bất đồng bộ, dùng lệnh `ZSCAN` để đọc dần dữ liệu ra và lưu vào RDBMS (như PostgreSQL) hoặc Data Warehouse.
  4. **Giải phóng bộ nhớ:** Sau khi đã backup thành công sang DB (Cold Storage), ta có thể gắn TTL (`EXPIRE`) hoặc xóa hẳn key cũ trong Redis để tối ưu hóa RAM.
