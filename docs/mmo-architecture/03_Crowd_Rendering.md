# Hướng Dẫn Nâng Cao WebGL & React Three Fiber: Hiển Thị Hơn 1000 Nhân Vật Chuyển Động

Việc hiển thị một đám đông khổng lồ với hơn 1000 nhân vật 3D chuyển động với tốc độ khung hình 60 FPS ổn định trên trình duyệt web đòi hỏi sự thay đổi hoàn toàn về tư duy kiến trúc: Chuyển từ mô hình quản lý Cây cảnh (Scene-Graph truyền thống) sang chiến lược ưu tiên Xử lý dữ liệu và Card đồ họa (GPU-centric).

Dưới đây là tài liệu kỹ thuật chuyên sâu về 4 trọng tâm: Instanced Rendering (Render hàng loạt), Level of Detail (LOD - Chi tiết theo khoảng cách), Culling (Cắt tỉa phần khuất), và Quản lý bộ nhớ.

---

## 1. Instanced Rendering: Đồ Vật Tĩnh vs. Nhân Vật Chuyển Động

Kỹ thuật `THREE.SkinnedMesh` mặc định là hoàn toàn vô dụng cho các đám đông lớn. Nó bắt CPU phải tính toán vị trí của từng chiếc xương trên 1000 nhân vật, tạo ra hàng ngàn lệnh vẽ (draw calls) và làm chết máy ngay lập tức.

### Đồ Vật Tĩnh (Cây cối, Ô tô)
Đối với những đồ vật tĩnh hoặc chỉ trượt đi cứng nhắc, `THREE.InstancedMesh` là tiêu chuẩn. Nó cho phép vẽ hàng ngàn mô hình 3D (dùng chung một loại vật liệu) chỉ bằng **1 Lệnh Vẽ duy nhất**.
- **Cách dùng:** Bạn nhét tọa độ của 1000 vật thể vào một mảng khổng lồ `Float32Array`. Gọi hàm `mesh.setMatrixAt(index, matrix)` và bật `mesh.instanceMatrix.needsUpdate = true`. Xong.

### Khối Instanced Chuyển Động Độc Lập (Animated Instanced Meshes)
`THREE.InstancedMesh` **không** hỗ trợ xương khớp (skeletal animation). Để 1000 người chạy bộ với nhịp độ khác nhau, bạn phải dùng một trong 2 cách sau:

**A. Đưa Ảnh Vào Vertex (Vertex Animation Textures - VAT / VTF)**
Đây là tuyệt kỹ hiệu năng cao nhất. Đóng gói toàn bộ chuyển động của bộ xương thành một bức ảnh `THREE.DataTexture`.
- **Cách hoạt động:** Thay vì bắt CPU tính xương, ta tính sẵn tọa độ của từng đỉnh (vertex) trên mô hình 3D ở từng khung hình rồi "nướng" (bake) nó vào một bức ảnh 2D. Chiều ngang bức ảnh là số đỉnh, chiều dọc là số khung hình chạy bộ.
- **Can thiệp Shader:** Sử dụng `material.onBeforeCompile`, ta sửa code của Vertex Shader trên GPU để GPU tự động tra cứu tọa độ đỉnh từ "bức ảnh" kia. Bằng cách truyền ID của nhân vật và số khung hình bị lệch (Offset) vào `InstancedBufferAttribute`, GPU sẽ tự động vẽ 1000 nhân vật chạy bộ nhưng không ai bị đều nhịp giống ai.

**B. Sử dụng Thư Viện Chuyên Dụng**
Tự viết Shader VAT rất chua. Các thư viện cộng đồng đã lo việc này:
- **`@three.ez/instanced-mesh`**: Thư viện này cung cấp một component `InstancedMesh2` chuyên trị bài toán Instanced cho nhân vật có xương, kèm theo tự động culling và tự động LOD. Nó gánh phần lớn công việc phức tạp trên GPU.

---

## 2. Chi Tiết Theo Khoảng Cách (LOD) và Người Rơm (Impostors)

LOD (`THREE.LOD` mặc định) chỉ hoạt động trên từng Object riêng lẻ, không chạy được trong một mẻ lưới gộp chung `InstancedMesh`.

### Chiến lược LOD Cho Instanced
Để làm LOD cho đám đông 1000 người, bạn phải băm đám đông đó ra thành nhiều cụm `InstancedMesh` khác nhau, mỗi cụm đại diện cho 1 mức độ phân giải (VD: Cụm Nét Cao, Cụm Nét Thấp, Cụm Vuông Vức).
- **Thực thi:** Tính khoảng cách từ Camera tới từng nhân vật. Liên tục tráo đổi dữ liệu nhân vật giữa Cụm Nét Cao và Cụm Nét Thấp. Để tránh việc GPU phải nạp lại mảng ma trận mỗi khung hình, hãy tạo mảng ma trận lớn nhất có thể và dùng thuộc tính `count` (giới hạn vẽ) để linh hoạt vẽ ít hơn số đó, dồn dữ liệu của người đứng xa vào mảng của Cụm Nét Thấp.

### Kỹ Thuật "Người Rơm" (Impostors / Billboards)
Đối với những nhân vật ở xa tit tắp, vẽ cục 3D là một sự lãng phí đồ họa trắng trợn.
- **Nướng Hình (Baking):** Render sẵn nhân vật từ 8 hoặc 16 góc nhìn ngang khác nhau vào một tấm bản đồ ảnh nhỏ xíu (Sprite atlas).
- **Hiển Thị:** Ở Cụm LOD xa nhất, dùng `InstancedMesh` để vẽ các tấm biển phẳng 2D `THREE.PlaneGeometry` thay vì mô hình 3D.
- **Logic Shader:** Gửi góc quay của Camera xuống Shader. Shader sẽ tự tính xem nhân vật đang đứng nghiêng góc nào, và trích xuất đúng hình ảnh 2D từ tấm bản đồ ảnh kia đập lên tấm phẳng. Đứng nhìn từ xa, người chơi sẽ bị đánh lừa là 3D.

---

## 3. Cắt Tỉa Đồ Họa (Culling Techniques)

Mặc định, Một cụm `InstancedMesh` 1000 người chỉ bị loại bỏ khỏi đồ họa (Culling) nếu **TOÀN BỘ khung hộp bao quanh 1000 người đó** nằm ngoài màn hình. Nếu 1000 người rải đều quanh thành phố, GPU vẫn phải tính cả 1000 dù bạn chỉ nhìn thấy 3 người.

### Băm Nhỏ Không Gian (Spatial Chunking - Octrees / QuadTrees)
- **Khái niệm:** Băm bản đồ thành các ô lưới (Grid) hoặc cây Octree.
- **Thực thi:** Thay vì tạo 1 Cụm lớn 1000 người, hãy tạo 10 Cụm, mỗi Cụm quản lý 100 người trong 1 Ô không gian.
- **Cắt tỉa:** Rà soát xem Camera có nhìn thấy hình hộp chữ nhật của Ô Không Gian hay không. Nếu Camera không quay ra đằng sau Ô Không Gian đó, cho ẩn nguyên ô: `chunkMesh.visible = false`. Khối lượng tính toán của GPU giảm sút hàng loạt.

### Hộp Cây Thay Đổi Theo Thời Gian (Dynamic BVH) & Tráo Đổi Đệm
Sử dụng thư viện `three-mesh-bvh` để có được Cấu trúc không gian bao bọc linh hoạt.
- **Tráo đổi đệm (Buffer Swapping):** Nếu Sếp vẫn ngoan cố muốn dùng chung 1 Cụm InstancedMesh lớn nhưng muốn cắt tỉa từng người một. ĐỪNG CÓ HẠ SCALE CỦA NHÂN VẬT ĐÓ XUỐNG 0. GPU vẫn mất công vẽ cái số 0 đó. Hãy hoán đổi vị trí của Nhân Vật Khuất Tầm Nhìn với Nhân Vật Nằm Ở Cuối Danh Sách trong Mảng Đệm, sau đó giảm số lượng vẽ đi một: `mesh.count--`.

---

## 4. Quản Lý Bộ Nhớ Trình Duyệt

Vẽ 1000 người giống hệt nhau thì quá chán. 1000 người cần quần áo khác nhau, phụ kiện khác nhau nhưng số lệnh vẽ không được phình to.

### Dùng Chung Texture (Texture Atlasing)
Toàn bộ 1000 nhân vật trong Cụm dùng chung 1 hình dáng 3D và 1 loại Vật Liệu duy nhất. Làm sao để khác màu áo?
- **Ghép Texture:** Nén ảnh họa tiết của 10 cái áo khác nhau vào 1 tấm ảnh siêu bự (4096x4096px).
- **Lệch UV:** Cung cấp cho GPU một mảng UV Offset. Với mỗi nhân vật thứ N, GPU nhận tọa độ xê dịch tương ứng và tự động kéo mặt lưới của nhân vật đó ra chỗ hình "Cái Áo Vest", trong khi người kia thì lấy đúng chỗ "Áo Thun".

### Phụ Kiện Rời (Custom Accessories)
Phụ kiện như Cánh, Mũ được gom thành một Cụm InstancedMesh thứ 2.
- **Liên Kết:** Quản lý một mảng liên kết (Map): ID Nhân vật -> ID Cánh. Mỗi khi Shader VAT xoay cái "Xương Lưng" của nhân vật, hãy lấy nguyên kết quả đó đập vào cái Cánh trong cụm InstancedMesh thứ 2 để nó bay theo nhân vật.

### Thuộc Tính Vật Liệu Cá Nhân
Cụm mặc định chỉ hỗ trợ đổ màu `setColorAt`. Nếu muốn Thằng Số 5 mặc áo Bóng Loáng, còn Thằng Số 6 áo Vải Sần Sùi thì sao?
- Hãy dùng thư viện **`three-instanced-uniforms-mesh`**, cho phép nhét các chỉ số cá nhân như độ bóng (Roughness), độ kim loại (Metalness) hoặc độ phát sáng vào từng Instanced một cách nhẹ nhàng mà không phải ngồi hì hục tự code ShaderMaterial.

---

### Mẹo Sinh Tử Khi Dùng React Three Fiber (R3F)
Tuyệt đối tránh làm toán Ma Trận (Matrix Math) phức tạp bên trong hàm `useFrame` của React. Việc này tạo ra hàng rác bộ nhớ khổng lồ khiến khung hình sụt giảm sau mỗi giây.
- Khai báo 1 biến `THREE.Matrix4` và 1 cục `THREE.Object3D` rỗng ("Dummy Object") ĐỂ BÊN NGOÀI, rồi tái sử dụng vòng lặp.
- Các tag `<Instances>` và `<Instance>` của Drei chỉ hợp dùng cho vật đứng im (cái cây, hòn đá). Đám đông 1000 người đi lại tung tăng thì Sếp phải dùng lớp Buffer thuần của Three.js, gói vào `useMemo` của React để hiệu năng đạt đỉnh nhé.
