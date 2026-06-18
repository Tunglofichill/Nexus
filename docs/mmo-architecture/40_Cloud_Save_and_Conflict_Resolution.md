# Báo cáo Kiến trúc: Đồng bộ Hóa và Giải quyết Xung đột Dữ liệu Đám mây (Cloud Save)

Báo cáo này phân tích các vấn đề phát sinh trong hệ thống lưu trữ đám mây (Cloud Save) trên nhiều thiết bị (Cross-platform/Cross-device), đồng thời đề xuất kiến trúc xử lý dựa trên Vector Clocks và các phương pháp Cập nhật Nguyên tử.

---

## 1. Bài toán Xung đột (The Conflict Problem)

### Kịch bản (Scenario)
1. Người chơi đăng nhập trên PC, sau đó ngắt mạng (Offline).
2. Người chơi đăng nhập trên Mobile (hoặc một thiết bị khác), chơi và lưu tiến trình mới lên Cloud.
3. Người chơi mở lại PC. PC có mạng trở lại và bắt đầu đồng bộ (sync) bản lưu cũ (stale data) lên Cloud.

### Vấn đề gặp phải
- **Ghi đè dữ liệu sai (Stale Overwrite):** Nếu PC tải bản lưu cũ lên và Cloud chấp nhận, toàn bộ tiến trình chơi trên Mobile sẽ bị xóa sạch.
- **Nhân bản hoặc mất vật phẩm:** Nếu gộp (merge) không đúng cách, người chơi có thể tiêu cùng một số tiền ở hai thiết bị (Double-spending) hoặc bị mất vật phẩm vừa nhận được.
- **Trạng thái phân nhánh (Divergence / Split-brain):** Có hai phiên bản hợp lệ của save file không thể tự động gộp theo logic thông thường.

---

## 2. Theo dõi trạng thái: Vector Clocks & Timestamps

Để biết được bản lưu nào thực sự là mới nhất và phát hiện xung đột, hệ thống không nên chỉ dựa vào Client Timestamp (vì đồng hồ thiết bị có thể bị sai lệch hoặc cố tình chỉnh sửa - clock drift/manipulation).

### Vector Clocks (Đồng hồ Vector)
Vector Clock là một thuật toán/cấu trúc dữ liệu giúp theo dõi quan hệ nhân quả (causality) giữa các trạng thái cập nhật trên hệ thống phân tán.
- Mỗi thiết bị (Client) và Server duy trì một bộ đếm. Ví dụ: `[PC_Count, Mobile_Count]`.
- Khi PC tạo một cập nhật mới, nó tăng biến đếm của nó: `[1, 0]`.
- Khi Mobile có một cập nhật mới, biến đếm của nó tăng: `[0, 1]`.

**Phát hiện xung đột:**
- **Không xung đột (Causality):** Nếu bản save A có Vector Clock lớn hơn hoặc bằng bản save B ở *tất cả* các vị trí (ví dụ A=`[2, 1]`, B=`[1, 1]`), thì A chắc chắn xảy ra sau B. Hệ thống tự động ghi đè B bằng A.
- **Xung đột xảy ra (Concurrency):** Nếu A lớn hơn B ở vị trí này, nhưng lại nhỏ hơn B ở vị trí khác (ví dụ: PC gửi lên `[2, 0]` nhưng Cloud đang lưu state của Mobile là `[0, 1]`), điều này có nghĩa là hai thiết bị đã phát sinh tiến trình độc lập.

### Chiến lược Giải quyết (Conflict Resolution Strategies)
Khi Vector Clocks báo hiệu xung đột phân nhánh:
1. **Dựa vào quyết định của người dùng (Manual Prompt):** Hiển thị UI: "Có hai bản lưu không đồng nhất. Local Save (Level 10, ngày X) và Cloud Save (Level 12, ngày Y). Bạn muốn giữ bản nào?". Đây là cách an toàn và phổ biến nhất trong Game.
2. **Auto-Merge qua CRDT (Conflict-free Replicated Data Types):** Dành cho các loại dữ liệu độc lập có thể tự gộp, như các bộ sưu tập vật phẩm hoặc danh sách achievement.
3. **Last-Write-Wins (LWW) với Server Timestamp:** Chọn bản lưu được gửi đến server cuối cùng. Rất dễ lập trình nhưng dễ gây mất dữ liệu ngầm (data loss).

---

## 3. Cập nhật Nguyên tử (Atomic Updates)

Trong quá trình đồng bộ, thao tác với các tài nguyên nhạy cảm (như Tiền tệ - Gold, Gems, Cấp độ) cần được xử lý đặc biệt để tránh bất đồng bộ hoặc lợi dụng lỗi nhân bản vật phẩm (duplication exploits).

### Tránh Đồng bộ Trạng thái Tuyệt đối (Absolute State)
Nếu client gửi lên trạng thái tuyệt đối: `Gold = 500`. Khi PC và Mobile cùng gửi số Gold này, giá trị thực tế dễ bị đè lên nhau sai lệch.
Giải pháp: Hãy đồng bộ **Delta / Sự kiện (Relative Updates)**: `Spent -100 Gold` hoặc `Earned +50 Gold`.

### Kiến trúc Event Sourcing & Message Queues
- Các hành động liên quan đến kinh tế trong lúc offline được ghi vào một hàng đợi sự kiện (Event Queue / Ledger).
- Khi có mạng (sync), Client đẩy danh sách các sự kiện này lên thay vì đẩy toàn bộ số dư.
- **Xử lý trên Server:** Server nhận queue, áp dụng từng sự kiện để cộng/trừ tuần tự. Nếu phát hiện số dư (balance) rớt xuống âm, sự kiện đó bị đánh dấu vô hiệu (rollback).

### Optimistic Concurrency Control (OCC) với Versioning
Khi sử dụng các database hiện đại (như MongoDB, DynamoDB, Redis):
- Mỗi tài khoản hoặc inventory có đính kèm một `Revision ID` hoặc `Version`.
- Khi Client (PC) gửi yêu cầu: `Mua vật phẩm A giá 100 Gold, trên nền Version 5`.
- Server kiểm tra DB, nếu DB đang ở Version 5, giao dịch được thực hiện nguyên tử (Atomic Update - ví dụ dùng `HINCRBY` trong Redis), rồi tăng DB lên Version 6.
- Nếu DB hiện tại đã là Version 6 (do Mobile vừa mua vật phẩm khác và sync xong), giao dịch từ PC bị từ chối (Conflict Error). PC buộc phải tải bản dữ liệu mới nhất (pull new state), tính toán lại số tiền rồi mới thử giao dịch lại.

---

### Tổng kết
- Đối với **Tiến trình Game chung (Gameplay Data)**: Sử dụng **Vector Clocks** để phát hiện trạng thái rẽ nhánh và kích hoạt **Prompt cho Người chơi tự chọn bản lưu**.
- Đối với **Kinh tế / Vật phẩm (Economy & Items)**: Tách riêng thành kiến trúc **Event-based (Delta)** kết hợp với **Atomic Updates / OCC** trên Server để đảm bảo tài sản không bao giờ bị nhân bản hoặc thất thoát trong quá trình xử lý song song.
