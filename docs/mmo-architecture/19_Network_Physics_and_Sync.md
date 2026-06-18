# Báo cáo Kỹ thuật: Mạng, Đồng bộ và Dự đoán (WebGL MMO)

### 1. Interpolation (Nội suy) vs Extrapolation (Ngoại suy)
*Giải quyết bài toán chuyển động mượt mà khi Server Tick Rate thấp (ví dụ: 10Hz - 100ms/tick).*

*   **Interpolation (Nội suy - Khuyên dùng cho Other Players)**:
    *   **Cơ chế**: Thay vì hiển thị trạng thái mới nhất từ server ngay lập tức, client sẽ cố tình render hình ảnh "trong quá khứ" (thường lùi lại một khoảng thời gian bằng 1-2 lần thời gian giữa các tick, tức 100ms - 200ms).
    *   **Cách thức**: Khi client nhận được trạng thái B (trong khi đang ở trạng thái A), nó sẽ dùng Linear Interpolation (Lerp) để từ từ di chuyển mô hình từ A sang B ở tốc độ khung hình của client (ví dụ 60FPS). 
    *   **Kết quả**: Chuyển động cực kỳ mượt mà. Điểm đánh đổi là "Visual Delay" (độ trễ hiển thị hình ảnh so với thực tế của server), nhưng với các thực thể khác (không phải người chơi tự điều khiển), người chơi hầu như không nhận ra điều này.
*   **Extrapolation (Ngoại suy)**:
    *   **Cơ chế**: Cố gắng đoán vị trí tương lai. Khi không nhận được gói tin mới từ server đúng hạn (do packet loss hoặc lag), client sẽ lấy vận tốc hiện tại để tiếp tục đẩy vật thể về phía trước.
    *   **Vấn đề**: Dễ dẫn đến sai sót cực lớn (đặc biệt khi thực thể đổi hướng đột ngột). Thường chỉ dùng làm phương án dự phòng ngắn hạn (khi mất tick) chứ không thay thế nội suy trong di chuyển cơ bản.

### 2. Client-Side Prediction (Dự đoán phía máy khách)
*Loại bỏ "Input lag", tạo cảm giác phản hồi thao tác tức thì.*

*   **Vấn đề**: Nếu nhấn nút di chuyển và phải đợi tín hiệu lên server rồi trả về (Round-trip time - RTT, ví dụ 150ms) thì nhân vật sẽ phản ứng rất chậm chạp.
*   **Giải pháp (Dự đoán & Đối chiếu - Server Reconciliation)**:
    1.  **Dự đoán**: Ngay khi người chơi nhấn nút, Client áp dụng logic vật lý và di chuyển nhân vật cục bộ ngay lập tức, đồng thời gửi Input kèm theo một ID tuần tự (Sequence/Tick ID) lên Server.
    2.  **Lưu lịch sử**: Client lưu lại bộ đệm (buffer) chứa các Input và State (trạng thái) tương ứng mà nó đã tự mô phỏng.
    3.  **Đối chiếu (Reconciliation)**: Server luôn là "Authoritative" (Nguồn chân lý). Khi server xử lý xong, nó sẽ gửi lại vị trí thực tế ứng với Sequence ID đã xử lý. Client đem vị trí từ server đối chiếu với vị trí trong lịch sử tại cùng ID. 
    4.  **Sửa sai (Replay)**: Nếu khớp, mọi thứ bình thường. Nếu lệch (do server tính toán va chạm, lực cản mạng...), client sẽ gán vị trí hiện tại bằng vị trí server, sau đó "chạy lại" (replay/resimulate) tất cả các input chưa được server xác nhận bằng vận tốc máy để đưa nhân vật về đúng trạng thái hiện tại.

### 3. Dead Reckoning (Dự đoán quỹ đạo hướng đi)
*Giảm tải tối đa băng thông (Bandwidth), đặc biệt quan trọng cho các game MMO có lượng lớn người chơi trong cùng một khung hình.*

*   **Cơ chế**: Thay vì server phải gửi vị trí (Position) 10 lần một giây một cách mù quáng, Server chỉ gửi dữ liệu khi có thay đổi mang tính hệ trọng (ví dụ: Bắt đầu đi, dừng lại, hoặc chuyển hướng rõ rệt).
*   **Dữ liệu truyền**: Gói tin gửi đi chứa `[Vị trí ban đầu, Vận tốc, Gia tốc, Hướng]`.
*   **Xử lý ở Client**: Nhờ vào thuật toán động học (Kinematics) $P(t) = P_0 + v*t + 0.5*a*t^2$, Client có thể tự mô phỏng quỹ đạo và di chuyển thực thể theo đường thẳng/cong liên tục dù trong 2-3 giây không nhận được dữ liệu cập nhật vị trí nào từ Server.
*   **Kết quả**: Giảm số lượng bản tin mạng xuống có thể chỉ còn 1-2 packets/giây thay vì 10 packets/giây, tối ưu cực lớn về chi phí máy chủ và băng thông.

### 4. Rubber-Banding (Hiện tượng giật lùi / cao su) và Cách sửa lỗi mượt mà
*Khắc phục tình trạng "teleport" khi dự đoán Client bị sai lệch so với Server.*

*   **Nguyên nhân**: Rubber-banding xảy ra khi Client-Side Prediction đoán sai lệch quá xa (ví dụ đi xuyên qua vách đá trên client nhưng server phát hiện va chạm nên không cho đi), và hàm Reconciliation tự động ép (Hard-Snap) vị trí vật lý của nhân vật trở về vị trí server khiến khung hình giật cục.
*   **Giải pháp (Graceful Correction / Smoothing)**:
    1.  **Ngưỡng dung sai (Tolerance Zone)**: Đặt một khoảng lệch Epsilon. Nếu vị trí client và server lệch nhau dưới 0.1m, bỏ qua hoàn toàn để tránh hiện tượng vi-giật (micro-stuttering).
    2.  **Tách rời Logic và Hiển thị (Visual Lerp/Smoothing)**: Khi client bị buộc phải cập nhật theo server (snap logic), hệ thống KHÔNG kéo mô hình hiển thị (Mesh/Renderer) ngay lập tức. Thay vào đó, bộ xử lý logic sẽ bị dịch chuyển về vị trí server ngay, nhưng Renderer của người chơi sẽ dùng nội suy (Lerp / SmoothDamp) để "trượt" nhẹ từ vị trí sai lệch về vị trí đúng trong vòng vài khung hình (ví dụ 100ms - 200ms).
    3.  Cảm giác với người chơi sẽ là bị đẩy hoặc lướt nhanh về vị trí đúng chứ không phải bị dịch chuyển tức thời (teleport) nhức mắt.

**Tóm lại mô hình tối ưu cho WebGL MMO:**
*   **Local Player (Người chơi chính)**: Client-Side Prediction + Server Reconciliation + Visual Smoothing.
*   **Other Entities (Người chơi khác/Quái vật)**: Server Tick Rate thấp + Dead Reckoning (để tiết kiệm băng thông) + Interpolation (để hiển thị mượt mà ở 60FPS).
