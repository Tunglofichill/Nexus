# Báo cáo Kỹ thuật: Âm thanh Không gian & Trò chuyện Giọng nói cho Game 3D WebGL

## 1. Kiến trúc WebRTC cho Voice Chat: P2P vs SFU

Để hỗ trợ số lượng lớn người chơi trong cùng một bản đồ, việc lựa chọn kiến trúc mạng là yếu tố sống còn:

### P2P (Peer-to-Peer / Mesh)
*   **Cách hoạt động:** Mỗi người chơi kết nối trực tiếp và truyền gửi dữ liệu với tất cả những người khác.
*   **Ưu điểm:** Độ trễ (latency) thấp nhất, miễn phí chi phí server truyền tải media, dễ dàng mã hóa end-to-end.
*   **Nhược điểm:** Tốn cực kỳ nhiều băng thông upload của client. Số lượng kết nối tăng theo cấp số nhân ($N \times (N-1)$). Hệ thống sẽ sụp đổ nếu phòng có quá 5-7 người. Không khả thi cho một game xã hội (Social Game) đông người.

### SFU (Selective Forwarding Unit)
*   **Cách hoạt động:** Người chơi chỉ gửi một luồng (stream) duy nhất lên máy chủ trung tâm. Máy chủ này sẽ chịu trách nhiệm phân phối (forward) luồng đó đến các người chơi khác.
*   **Ưu điểm:** Tiết kiệm tối đa băng thông tải lên cho người dùng. Khả năng mở rộng cực cao, có thể hỗ trợ hàng trăm người trong cùng một không gian.
*   **Nhược điểm:** Yêu cầu bảo trì server, phát sinh chi phí hạ tầng (đặc biệt là băng thông chiều ra - egress bandwidth) và tăng một chút độ trễ do phải qua trạm trung chuyển.

### So sánh LiveKit vs Agora vs Custom WebRTC

*   **LiveKit (SFU):** Nền tảng mã nguồn mở, ưu tiên kiến trúc tự vận hành (self-hosted) nhưng cũng có dịch vụ cloud. Lựa chọn tuyệt vời nếu bạn không muốn bị khóa hệ sinh thái (vendor lock-in), muốn linh hoạt quản lý hạ tầng và chi phí, đồng thời có sẵn các công cụ tích hợp AI thời gian thực rất tốt.
*   **Agora (Managed CPaaS):** Nền tảng đóng gói, quản lý toàn diện. Thích hợp nếu bạn cần hạ tầng mạng biên (Edge network) siêu ổn định trên toàn cầu và muốn nhanh chóng tung ra thị trường mà không phải lo lắng về DevOps. Đổi lại, chi phí tính theo phút khá cao và bạn phụ thuộc vào công nghệ độc quyền của họ.
*   **Custom WebRTC (Tự xây dựng SFU bằng Pion, Mediasoup,...):** Tối ưu nhất về mặt chi phí máy chủ vì bạn chỉ trả tiền cho phần cứng thực dùng. Pion (viết bằng Golang) là một SFU cực kỳ nhẹ và phù hợp cho game. Tuy nhiên, thời gian, công sức lập trình và chi phí bảo trì hệ thống là một rào cản rất lớn.

**Khuyến nghị:** Đối với các dự án indie/startup, nên tự host **LiveKit** hoặc dùng máy chủ tùy chỉnh với **Pion** để kiểm soát chi phí. Nếu game scale lớn và có ngân sách dư dả, **Agora** là một giải pháp cực kỳ an toàn.

---

## 2. Âm thanh Không gian 3D với Web Audio API và Three.js

Để tạo cảm giác chân thực khi một người chơi đi ra xa thì tiếng của họ nhỏ dần (và ngược lại), chúng ta sử dụng `THREE.PositionalAudio` kết hợp với WebRTC MediaStream.

**Các bước triển khai cốt lõi:**

1.  **Gắn "Tai nghe" (AudioListener):** Đại diện cho người chơi tại local. Thường được gắn vào Camera hoặc mô hình nhân vật của bạn.
    ```javascript
    const listener = new THREE.AudioListener();
    camera.add(listener);
    ```

2.  **Khởi tạo Nguồn phát Không gian (PositionalAudio):** Tạo cho từng người chơi khác trong phòng.
    ```javascript
    const positionalAudio = new THREE.PositionalAudio(listener);
    positionalAudio.setRefDistance(2);    // Khoảng cách bắt đầu suy hao âm thanh
    positionalAudio.setMaxDistance(30);   // Khoảng cách tối đa để nghe được
    positionalAudio.setRolloffFactor(1);  // Tốc độ suy hao
    
    // Gắn nguồn âm thanh vào model của người chơi khác
    otherPlayerMesh.add(positionalAudio);
    ```

3.  **Đưa WebRTC Stream vào Three.js:** Đây là nơi nhiều lập trình viên gặp lỗi (không có tiếng). Cách tương thích tốt nhất trên mọi trình duyệt là dùng thẻ HTML `<audio>` làm cầu nối trung gian:
    ```javascript
    const audioEl = document.createElement('audio');
    audioEl.srcObject = remoteMediaStream; // Luồng WebRTC từ người chơi khác
    audioEl.muted = true; // Chặn âm thanh 2D toàn cầu để chỉ nghe âm thanh 3D
    audioEl.play(); 

    // Gắn phần tử âm thanh này vào PositionalAudio
    positionalAudio.setMediaElementSource(audioEl);
    ```

---

## 3. Tối ưu Băng thông và Chi phí Compute

Trong mô hình SFU, tiền máy chủ chủ yếu đến từ Băng thông Egress (chiều ra) và CPU để xử lý stream.

*   **Định tuyến theo khoảng cách (Proximity/Spatial Routing):** Đây là kỹ thuật quan trọng nhất. Nếu có 100 người trong phòng, SFU KHÔNG ĐƯỢC gửi 99 luồng âm thanh đến mỗi client. Bạn phải gửi tọa độ người chơi lên máy chủ, máy chủ sẽ tính toán khoảng cách và chỉ gửi (forward) luồng âm thanh của khoảng 5-10 người chơi đứng gần client nhất. Kỹ thuật này cắt giảm hơn 90% băng thông egress.
*   **Phát hiện hoạt động giọng nói (VAD - Voice Activity Detection):** Đảm bảo thiết lập để client KHÔNG gửi các gói tin RTP trống khi người chơi đang im lặng. Điều này giúp giảm 40%-50% băng thông trên toàn hệ thống tùy vào mức độ giao tiếp.
*   **Cấu hình Codec Opus (Giảm Bitrate):** Voice chat trong game không cần chất lượng như nghe nhạc. Hãy ép Opus hoạt động ở bitrate thấp (ví dụ: `16 kbps` hoặc thậm chí `8-12 kbps`). Âm thanh vẫn đảm bảo độ rõ nét cho lời nói nhưng giảm đáng kể kích thước gói tin.
*   **Tránh Transcoding (Giải mã và mã hóa lại):** Hãy dùng cấu trúc SFU thuần túy (như Pion), server chỉ làm nhiệm vụ nhận packet và forward ("pass-through") thay vì kiến trúc MCU (Multipoint Control Unit - máy chủ trộn tất cả luồng thành một). Việc trộn âm trên server gây tốn CPU gấp 10-50 lần so với việc chuyển tiếp.
*   **Xử lý tạp âm ở Client:** Hãy tích hợp các module khử ồn (Noise Suppression) trực tiếp tại máy của người chơi (Client-side) trước khi gửi qua WebRTC. Đừng đẩy việc xử lý âm thanh nặng nề này lên server, nó sẽ đốt cháy CPU của bạn.

Việc kết hợp LiveKit/Pion với Proximity Routing và giảm bitrate sẽ giúp bạn duy trì voice chat cho hàng trăm người chơi với mức phí hạ tầng rất thấp.
