# Báo Cáo Kiến Trúc: Tích Hợp Căn Cứ & Thế Giới Mở (Portal Rendering)

## 1. Kiến Trúc Chung: Căn Cứ Riêng Tư Khép Kín (Instanced Base)
**Khái niệm:** Căn cứ riêng (Base/Phòng) của người chơi luôn tồn tại trong một không gian tọa độ hoàn toàn biệt lập (ví dụ: tạo một Cây cảnh Scene Graph khác, hoặc đẩy nó ra xa gốc tọa độ hàng triệu mét). Căn cứ này KHÔNG BAO GIỜ nằm vật lý giữa lòng bản đồ MMO đông đúc. Cách này giúp tránh đụng độ đồ vật, loại bỏ lỗi trôi sai số tọa độ, và cực kỳ nhẹ server.
**Triển khai:**
- **Quản Lý 2 Scene Song Song:** Lưu trên RAM cùng lúc 2 bối cảnh đồ họa: `SceneInstance` (Căn phòng riêng của Sếp) và `SceneOpenWorld` (Thành phố MMO đông người).
- **Điểm Neo Tọa Độ (Anchor Mapping):** Căn phòng có một "tọa độ ảo" cắm giữa thế giới mở (VD: Tầng 5 Tòa nhà X). Cái điểm neo này sẽ đóng vai trò làm Camera để ghi hình quang cảnh bên ngoài thế giới mở, dù thể xác của người chơi vẫn đang kẹt trong không gian phòng riêng.
- **Tách Biệt Server:** Máy chủ game ghi nhận người chơi đang ở trong "Room Riêng" (Instance Shard) để không tính va chạm, nhưng vẫn ngầm đối chiếu điểm neo của họ với bản đồ thế giới mở để gửi dữ liệu người đi đường xung quanh (AOI).

## 2. Kỹ Thuật Vẽ Cổng Không Gian / Camera Thay Thế (Three.js / R3F)
Để biến cái ô cửa sổ phòng Sếp thành một cái "Cổng" nhìn thẳng ra thế giới `SceneOpenWorld`, chúng ta dùng một trong 2 phép thuật WebGL sau:

**Cách A: Đục Lỗ Mặt Nạ (Stencil Buffer)**
- **Cách hoạt động:** Vẽ hình khối của khung cửa sổ ("tấm kính") bằng mực tàng hình (vào bộ đệm Stencil). Sau đó, vẽ thế giới `SceneOpenWorld` bằng Camera đặt ở điểm neo, nhưng cài đặt vật liệu sao cho thế giới đó CHỈ ĐƯỢC PHÉP hiện ra đúng ở chỗ lúc nãy vừa bôi mực tàng hình (`stencilFunc = THREE.EqualStencilFunc`). Chỗ nào là bức tường phòng Sếp thì thế giới ngoài kia bị tàng hình.
- **R3F Triển khai:** Dùng thẻ `<Mask>` của thư viện `@react-three/drei`. Rất gọn.
- **Ưu/Nhược:** Phối cảnh nét căng, góc nhìn của Sếp xê dịch thì thế giới bên kia cửa sổ cũng xê dịch theo cực chuẩn (tạo độ sâu 3D). Nhưng làm quen với hệ thống Stencil Buffer rất dễ tẩu hỏa nhập ma.

**Cách B: Màn Hình Camera Giấu Kín (RenderTarget)**
- **Cách hoạt động:** Đặt một cái "Camera Quay Lén" ngoài thế giới `SceneOpenWorld` ở đúng điểm neo phòng Sếp. Cho Camera này quay phim và lưu thẳng vào một cuộn băng video (tạo một `WebGLRenderTarget`). Cuối cùng, lấy cuộn băng đó áp làm Texture dán lên mặt kính cửa sổ ở `SceneInstance`. Sếp nhìn ra cửa sổ thực chất là nhìn cái TV đang live-stream.
- **R3F Triển khai:** Dùng thẻ `<RenderTexture>` của `@react-three/drei`. Nhớ ép góc quay của Camera quay lén khớp với góc quay Camera của người chơi để đánh lừa thị giác.
- **Ưu/Nhược:** Siêu dễ code, nhúng thêm hiệu ứng làm mờ kính dễ dàng. Nhưng nhược điểm là phối cảnh dễ bị giả trân nếu góc quay lệch.

## 3. Quản Lý Mạng Vùng Nhìn: Nhìn Qua Cửa Sổ (LOD AOI)
Sếp ở trong phòng nhìn ra cửa sổ, mà bắt mạng phải gánh hết cử động chi tiết của người ngoài đường thì mạng sẽ sập (Lỗi Tỉa Đạn / Sniper Problem).
**Cách gánh:**
- **AOI "Chỉ Đọc":** Server cấp cho điểm neo phòng Sếp một khu vực quét AOI đặc biệt: Chỉ được nghe ngóng, không được can thiệp vào người khác.
- **Lọc Theo Hình Nón (Culling by Cone):** Thay vì quét vùng tròn 360 độ xung quanh điểm neo, server chỉ quét một hình nón chiếu ra từ cửa sổ để tìm người chơi đang đi ngang qua, tiết kiệm 80% sức mạnh server.
- **Ép Xung (Tick Rate Downsampling):** Chuyển động người đi đường ngoài cửa sổ bị bóp xuống gửi 5-10 khung hình/giây thay vì 30 khung hình/giây. Client tự bù trừ làm mượt lại (Interpolation).
- **Người Rơm Bóng Ma (Silhouettes):** Cắt hết thông tin về mũ, nón, áo quần của người đi đường. Người chơi chỉ thấy ngoài cửa sổ là những "Bóng ma mờ ảo" (Silhouettes) đi dạo, vừa đẹp chuẩn không khí "Cyberpunk / Lofi", vừa không tốn đồ họa render cái mặt của người dưng.

## 4. Bươc Ra Cửa Liền Mạch (Không Màn Hình Chờ)
Sếp mở cửa ban công bước ra đường. Làm sao để không dính "Loading Screen"?
**Tuyệt Vọng Khoang Đệm (The "Airlock" Technique):**
- **Khu Vực Đệm:** Cánh cửa hoặc hàng lang là một vùng đệm (Airlock). Bước vào đó, kịch bản chuyển cảnh bắt đầu.
- **Tải Ngầm (Background Loading):** Game lén lút tải mảnh bản đồ (Chunk) chất lượng cao của thế giới ngoài cửa.
- **Trao Tay Đồ Họa:** Bước chân khỏi cửa, R3F `<Canvas>` chuyển gốc từ `SceneInstance` sang `SceneOpenWorld` cực mượt. Hệ tọa độ của Sếp tự dời từ phòng Sếp sang tọa độ Toàn Cầu.
- **Trao Tay Server:** Server chuyển nhượng Sếp từ Khu Vực Phòng Riêng sang Khu Vực Thế Giới Chung. Việc chuyển nhượng chỉ mất 1-2 giây (đúng bằng thời gian hiển thị hoạt ảnh Nhân Vật kéo tay nắm cửa). Mở cửa ra là cả 1000 người đập vào mắt, không một vết gợn!
