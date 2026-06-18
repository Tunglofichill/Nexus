# Báo Cáo Kỹ Thuật: Đóng Gói và Phân Phối Tài Nguyên (Asset Delivery) Cho WebGL MMO

## 1. Đóng gói tài nguyên với GLTF/GLB (Asset Bundling)
Để tối ưu hóa thời gian tải và hiệu suất bộ nhớ trong môi trường WebGL, việc chuẩn hóa pipeline tài nguyên với **glTF/GLB** là bắt buộc:
*   **Sử dụng GLB:** Đây là định dạng nhị phân chứa toàn bộ hình học, vật liệu và kết cấu (texture) trong một tệp duy nhất, giúp truyền tải dữ liệu nhanh chóng qua mạng (so với việc tải file OBJ/MTL và ảnh rời rạc).
*   **Phân chia nhỏ (Modular Chunking):** Đối với MMO, tuyệt đối không đóng gói toàn bộ nhân vật (hoặc bản đồ) thành một bundle khổng lồ. Hãy tách phần thân (base mesh) và các phụ kiện (vũ khí, trang phục) thành các file GLB riêng biệt (lazy-loading).
*   **Nén dữ liệu:**
    *   **Geometry:** Sử dụng nén **Meshopt** (để giải mã nhanh trên web) hoặc **Draco** (nén dung lượng file tải xuống rất nhỏ, nhưng tốn CPU giải nén hơn).
    *   **Textures:** Sử dụng chuẩn nén **KTX2 / Basis Universal**. Định dạng này không chỉ giảm dung lượng mạng mà cực kỳ quan trọng là nó **giữ nguyên trạng thái nén trong VRAM của GPU**. Điều này giúp game MMO không bị crash vì cạn kiệt bộ nhớ đồ họa trên các thiết bị yếu.
*   **Tối ưu tự động:** Dùng các công cụ như `glTF-Transform` trong pipeline CI/CD để tự động loại bỏ dữ liệu thừa, gộp mesh và tối ưu vật liệu trước khi đẩy lên CDN.

## 2. Cập nhật OTA (Over-the-Air) Không Cần Làm Mới Trang
Bản chất WebGL chạy hoàn toàn trong bộ nhớ (memory), nên việc cập nhật một vật phẩm mới (ví dụ: Trang phục Giáng Sinh) không cần người dùng F5 có thể thực hiện thông qua quản lý trạng thái:
*   **Tải Bất Đồng Bộ (Async Fetch):** Khi nhân vật đi vào khu vực mới hoặc mua trang phục, client sử dụng `fetch()` hoặc `XMLHttpRequest` để tải file `xmas-outfit.glb` ở background mà không làm gián đoạn Main Thread (không bị khựng game).
*   **Khớp Xương (Bone Attachment/Retargeting):** Đối với trang phục, sau khi tải xong, hệ thống sẽ trích xuất phần Mesh từ file GLB mới và đính vào khung xương (Skeleton) đang chuyển động sẵn có của nhân vật.
*   **Cập Nhật Cấp Thấp (GPU Update):** 
    *   Nếu cập nhật Texture mới: Ghi đè vào GPU bằng `gl.bindTexture` và `gl.texSubImage2D` (hoặc đánh dấu cờ `needsUpdate = true` nếu dùng Three.js/Babylon.js).
    *   Nếu cập nhật Mesh: Nạp lại Vertex/Index Buffers bằng `gl.bufferSubData`.
*   **Bust Cache:** Khi server có bản vá lỗi cho bộ trang phục, hãy đổi param URL (`xmas-outfit.glb?v=1.1`) để buộc client tải phiên bản mới nhất thay vì dùng bản cũ trong bộ nhớ đệm trình duyệt.
*   **Thu dọn rác:** Luôn phải gọi `gl.deleteTexture` và `gl.deleteBuffer` cho bộ trang phục cũ bị thay ra, nếu không tab trình duyệt sẽ bị rò rỉ bộ nhớ (memory leak) và sập.

## 3. Streaming Tài Nguyên Bằng IndexedDB và Cache API
Lưu trữ cục bộ (Local Caching) cho phép WebGL MMO có tốc độ tải ngang ngửa với game Client cài đặt:

| Tính Năng | Cache API | IndexedDB |
| :--- | :--- | :--- |
| **Mục đích chính** | Tối ưu cho lưu trữ dữ liệu nhị phân lớn (Streaming file GLB, KTX2, Audio). | Tối ưu cho quản lý state, metadata, hoặc giả lập hệ thống file. |
| **Cách hoạt động** | Lưu cặp Request / Response. Hoạt động cực kỳ hiệu quả với Service Workers để chặn (intercept) các lệnh fetch. | Cơ sở dữ liệu Transactional/NoSQL. Lưu các Object, Blob. |
| **Ứng dụng MMO** | Dùng để cache vĩnh viễn file `xmas-outfit.glb`. Lần tới mở game sẽ lấy thẳng file từ đĩa cứng mà không cần tải lại từ CDN. | Lưu các cấu hình người dùng, tiến trình game, chỉ số của trang bị, hoặc được WebGL engine (như Unity) dùng làm IDBFS (File System ảo). |

**Chiến Lược Khuyên Dùng:**
1.  **Mô Hình Kết Hợp (Hybrid):** Dùng **Cache API** cho các tài nguyên 3D nặng, đồ họa, âm thanh. Dùng **IndexedDB** cho các dữ liệu game có cấu trúc (ví dụ: danh sách chỉ số kỹ năng, inventory).
2.  **Service Worker & Stale-while-revalidate:** Cài đặt Service Worker chặn mọi request tải GLB. Nếu đã có trong Cache API, trả về tức thì, đồng thời ngầm ping đến máy chủ để lấy bản cập nhật mới (nếu có) lưu lại cho lần sau.
3.  **Quản lý Vòng Đời Cache:** Một game MMO liên tục mở rộng sẽ nhanh chóng làm đầy ổ đĩa của người chơi. Cần lập trình cơ chế Eviction (như LRU - xóa các resource ít sử dụng nhất) để dọn dẹp các sự kiện/tài nguyên cũ.
