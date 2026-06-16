# 🧠 Antigravity Core Memory (Handoff Document)

**Xin chào đặc vụ Antigravity mới!** Nếu bạn đang đọc file này, nghĩa là user (sếp) đã tạo một session/conversation mới để làm việc trong dự án `nexus-tv` này nhằm xóa bỏ lịch sử hội thoại quá dài của dự án cũ. 

Hãy đọc kỹ toàn bộ thông tin dưới đây để "nhập hồn" và tiếp tục công việc ngay lập tức.

## 🎯 Bối Cảnh (Context)
- **Tên dự án:** Nexus TV (Chibi Society OS)
- **Mục tiêu:** Xây dựng một **Mạng Xã Hội Game Hóa (Gamified Social Network)** cho cộng đồng VTuber.
- **Kiến trúc cốt lõi:** Desktop OS UI. Ứng dụng chạy full màn hình không cuộn dọc. Giao diện nền là phòng 2.5D (Nexus Hub), điều hướng bằng thanh Dock kiểu MacOS, các chức năng phụ như Đăng bài, Hồ sơ mở trong các Cửa sổ Kính mờ kéo thả được (Draggable Windows).
- **Trạng thái hiện tại:** Dự án Next.js 14 App Router, Tailwind V4 đã được khởi tạo xong. Base UI (DraggableWindow, NexusDock, MainLayoutWrapper) đã được dựng khung cơ bản.

## 🚧 Nhiệm Vụ Tiếp Theo (Next Actions)
Ngay khi bắt đầu hội thoại với sếp, hãy yêu cầu sếp cung cấp:
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Sau khi sếp cung cấp, bạn hãy thực hiện các việc sau theo thứ tự:
1. Tạo file `.env.local` với 2 key trên.
2. Cài đặt các file tiện ích Supabase SSR (`src/utils/supabase/server.ts`, `client.ts`, `middleware.ts`).
3. Xây dựng trang `/login` phong cách Cyberpunk OS.
4. **Trọng tâm:** Xây dựng trang `/onboarding` (Phòng thay đồ/Dressing Room). Đây là nơi sau khi đăng ký, user bị ép vào để tạo hình nhân vật Chibi (chọn tóc, quần áo, da) và lưu vào `avatar_data` (JSONB) trên Supabase.

## 🛠️ Công Nghệ & Lưu Ý Kỹ Thuật
- **Công nghệ:** Next.js 14 (App Router), Tailwind CSS v4 (cấu hình trong `globals.css`), Supabase SSR, Framer Motion, Lucide React.
- **Lỗi Next.js Router (ĐÃ KHẮC PHỤC):** Trong Layout, **TUYỆT ĐỐI KHÔNG ĐƯỢC** ẩn hoàn toàn thuộc tính `{children}` bằng render có điều kiện (ví dụ `{!isHome && children}`). Nếu làm vậy Next.js sẽ crash lỗi màn hình đen. Hãy dùng CSS để ẩn (`className={isHome ? 'hidden' : ''}`).
- **Theme:** Cyberpunk, Dark Mode, kính mờ (glassmorphism), tông màu chủ đạo là Indigo và Purple.

*Sẵn sàng nhận lệnh từ sếp chưa? Let's go!* 🚀
