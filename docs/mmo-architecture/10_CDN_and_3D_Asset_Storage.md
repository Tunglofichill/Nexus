# Báo cáo Kỹ thuật: Cơ sở hạ tầng CDN & Storage cho Game 3D Assets

Dưới đây là báo cáo phân tích các giải pháp lưu trữ và phân phối tài nguyên 3D nặng (GLTF, textures, audio) cho game trên nền tảng web, tập trung vào việc tối ưu chi phí và hiệu suất.

## 1. Bẫy băng thông của Vercel (The Vercel Bandwidth Trap)

Khi phát triển (đặc biệt với Next.js) trên Vercel, các lập trình viên thường có thói quen đặt tài nguyên tĩnh vào thư mục `public/`. Tuy nhiên, với game 3D, đây là một "cạm bẫy" tài chính nghiêm trọng.

*   **Vấn đề:** Mọi file phục vụ từ thư mục `public/` đều bị tính vào giới hạn băng thông "Fast Data Transfer" của Vercel.
*   **Ví dụ thực tế:** Giả sử bạn có một model thành phố 3D nặng 50MB. Vercel giới hạn băng thông là 100GB (gói Hobby) hoặc 1TB (gói Pro). 
    *   Chỉ với 2.000 lượt tải (Hobby) hoặc 20.000 lượt tải (Pro), bạn sẽ cạn kiệt toàn bộ hạn mức băng thông của tháng.
    *   Sau khi vượt giới hạn, Vercel sẽ tính phí vượt mức (overage fees) rất cao (thường khoảng $40 cho mỗi 100GB tiếp theo).
*   **Kết luận:** Tuyệt đối không lưu trữ các file GLTF/GLB, texture hoặc audio nặng trong thư mục `public/` của Next.js nếu host trên Vercel.

## 2. So sánh các giải pháp Storage: Tìm phương án tối ưu

Để phục vụ hàng Terabyte tài nguyên 3D cho người chơi, yếu tố quyết định chi phí lớn nhất không phải là phí lưu trữ (Storage cost) mà là **phí truyền dữ liệu ra ngoài (Egress fees)**.

| Tiêu chí | Cloudflare R2 | Supabase Storage | AWS S3 |
| :--- | :--- | :--- | :--- |
| **Phí Egress (Băng thông ra)** | **$0 (Miễn phí hoàn toàn)** | ~$0.09/GB (sau mức miễn phí của gói) | ~$0.09/GB (sau 100GB đầu tiên) |
| **Phí lưu trữ (Storage)** | $0.015 / GB / tháng | Phụ thuộc vào gói đang dùng | ~$0.023 / GB / tháng |
| **Độ phức tạp** | Thấp - Trung bình | Thấp (Tích hợp sẵn tốt) | Cao (Cần cấu hình CloudFront) |

**Đánh giá chi tiết:**
*   **AWS S3:** Quá đắt đỏ cho việc phân phối nội dung trực tiếp do phí Egress cao. Bạn sẽ phải trả khoảng 90 USD cho mỗi 1TB dữ liệu truyền tải ra internet.
*   **Supabase Storage:** Dễ sử dụng và tích hợp tốt. Tuy nhiên, dù có CDN cache (giảm phí egress xuống khoảng $0.03/GB), nó vẫn tính phí khi bạn vượt giới hạn băng thông của gói (VD: Gói Pro miễn phí 250GB). Nếu game của bạn phổ biến, chi phí băng thông vẫn sẽ đội lên đáng kể.
*   **Cloudflare R2:** **Là lựa chọn tuyệt đối tốt nhất và rẻ nhất**. Với mô hình "Zero Egress Fees", bạn có thể phục vụ 10TB hay 100TB tài nguyên 3D cho người chơi mà không phải trả thêm bất kỳ đồng phí băng thông nào. R2 cũng tự động tận dụng sức mạnh của mạng lưới CDN toàn cầu Cloudflare.

## 3. Chiến lược Caching: Tải model một lần duy nhất

Ngay cả khi dùng Cloudflare R2 để tối ưu chi phí, việc tải đi tải lại file 50MB sẽ làm game load chậm và gây trải nghiệm tệ. Cần áp dụng 2 lớp caching cực kỳ mạnh (aggressive caching):

### Lớp 1: Aggressive HTTP Cache Headers (Cache-Control)
Cấu hình từ phía CDN (hoặc R2 custom domain) để trả về header sau cho các file tĩnh như `.glb`, `.gltf`, texture, audio:
`Cache-Control: public, max-age=31536000, immutable`

*   `max-age=31536000`: Lưu cache trong trình duyệt tối đa 1 năm.
*   `immutable`: Báo cho trình duyệt biết file này không bao giờ thay đổi nội dung, bỏ qua bước gửi request xác thực (revalidation) tới server.
*   **Lưu ý:** Vì áp dụng rule bất biến (immutable), mỗi lần cập nhật model 3D, bạn **bắt buộc phải thay đổi tên file** (ví dụ: từ `city-v1.glb` sang `city-v2.glb` hoặc chèn thêm mã hash `city-[hash].glb`).

### Lớp 2: Service Workers & Cache API (Trình duyệt)
HTTP Cache truyền thống đôi khi bị trình duyệt dọn dẹp (evict) tự động khi dung lượng thiết bị đầy. Để đảm bảo người chơi luôn có trải nghiệm load ngay lập tức, hãy dùng **Service Worker** với chiến lược **Cache-First**:
1.  **Cache-First Strategy:** Khi game fetch file `city-v1.glb`, Service Worker sẽ chặn (intercept) request và kiểm tra `CacheStorage` của trình duyệt trước.
2.  **Lưu trữ vĩnh viễn:** Nếu có trong cache, lập tức trả về file. Nếu chưa có, tiến hành tải từ R2/CDN về, sau đó dùng `cache.put()` để lưu ngay file đó vào bộ nhớ cục bộ cho các lần chơi sau.
3.  **Khuyến nghị định dạng:** Luôn ưu tiên dùng **.glb (Binary GLTF)** thay vì .gltf. Định dạng .glb đóng gói cả lưới hình học (geometry), chất liệu (material) và ảnh (texture) vào chung một file duy nhất, giúp giảm số lượng network request xuống mức tối thiểu, đồng thời giúp việc quản lý cache trong Service Worker đơn giản hơn rất nhiều.

## Tổng kết khuyến nghị
1. **Dời ngay toàn bộ 3D assets nặng ra khỏi thư mục Vercel `public/`**.
2. Sử dụng **Cloudflare R2** làm hệ thống lưu trữ và phân phối chính.
3. Đóng gói assets thành định dạng **.glb**, thiết lập HTTP Header **`immutable`**, kết hợp với **Service Worker (Cache-First)** ở phía client.
