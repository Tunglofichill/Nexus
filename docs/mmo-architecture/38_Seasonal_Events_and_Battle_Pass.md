# Báo cáo Kiến trúc Kỹ thuật: Sự kiện Theo Mùa & Battle Pass

Dưới đây là báo cáo nghiên cứu kiến trúc cho hệ thống Sự kiện theo mùa (Seasonal Events) và Battle Pass, tập trung vào 3 yêu cầu cốt lõi theo đề bài:

## 1. Nội dung Time-gated (Tính năng bật/tắt qua Server Config)

Để bật/tắt các bản đồ sự kiện (event maps) hoặc vật phẩm (items) mà không cần triển khai lại mã nguồn (deploy code), cần sử dụng hệ thống **Feature Flags (Cờ tính năng)** kết hợp với cấu hình động (Dynamic Configuration).

*   **Lưu trữ cấu hình Backend:** Sử dụng Redis, Consul hoặc các nền tảng quản lý feature flag (như LaunchDarkly, ConfigCat) để lưu trữ các biến trạng thái (ví dụ: `{"HALLOWEEN_MAP_ENABLED": true, "XMAS_EVENT_START": "2026-12-01T00:00:00Z"}`).
*   **Server-Driven Logic:** Client không tự quyết định việc hiển thị. Khi client request thông tin phòng chơi hay cửa hàng, Server sẽ kiểm tra cấu hình feature flag hiện hành trong cache/DB, và chỉ trả về danh sách các sự kiện/bản đồ đang được bật (`enabled: true`). 
*   **Real-time Update:** Khi có sự thay đổi (ví dụ Admin tắt sự kiện trên dashboard), cập nhật sẽ đẩy vào Redis. Server backend lắng nghe thay đổi này và có thể push một event (thông qua WebSocket/SSE) xuống Client để lập tức vô hiệu hóa nút bấm/tải lại giao diện, ngăn người chơi truy cập.

## 2. Hệ thống Tiến trình (Progression System) - Database Schema

Để theo dõi điểm kinh nghiệm (Battle Pass XP) và các mốc (tiers) đã mở khóa, chúng ta cần một cơ sở dữ liệu quan hệ (RDBMS) để đảm bảo tính toàn vẹn dữ liệu. Dưới đây là lược đồ thiết kế (schema):

```sql
-- Thông tin cấu hình Mùa giải
CREATE TABLE seasons (
    season_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    is_active BOOLEAN DEFAULT false
);

-- Cấu hình các mốc (tiers) của Battle Pass và lượng XP cần thiết
CREATE TABLE battle_pass_tiers (
    tier_id SERIAL PRIMARY KEY,
    season_id VARCHAR(50) REFERENCES seasons(season_id),
    tier_level INT,
    required_xp INT,  -- Tổng XP cần thiết để đạt mốc này
    reward_item_id VARCHAR(100),
    is_premium BOOLEAN DEFAULT false -- Phần thưởng này thuộc nhánh Free hay Premium
);

-- Bảng lưu tiến trình của người dùng trong một mùa
CREATE TABLE user_season_progress (
    user_id VARCHAR(50),
    season_id VARCHAR(50) REFERENCES seasons(season_id),
    current_xp INT DEFAULT 0,
    current_tier INT DEFAULT 0,
    is_premium_unlocked BOOLEAN DEFAULT false, -- Người dùng đã mua vé Premium chưa
    updated_at TIMESTAMP,
    PRIMARY KEY (user_id, season_id)
);

-- Bảng ghi nhận lịch sử nhận thưởng (Anti-duplicate claims)
CREATE TABLE user_reward_claims (
    claim_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    season_id VARCHAR(50),
    tier_level INT,
    is_premium_reward BOOLEAN,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Unique constraint để đảm bảo 1 phần thưởng ở 1 mốc chỉ được nhận 1 lần
    UNIQUE(user_id, season_id, tier_level, is_premium_reward)
);
```

## 3. Chống gian lận (Anti-exploit): Ngăn đổi giờ (Clock Manipulation)

Hành vi phổ biến nhất của cheater là chỉnh đồng hồ của OS lên tương lai để nhận trước phần thưởng (hoặc chỉnh lùi thời gian để làm sự kiện đã qua). Để phòng chống:

*   **Server Authoritative Time (Chỉ tin tưởng đồng hồ Server):** Tuyệt đối không sử dụng thời gian của Client (`Date.now()` trên trình duyệt/mobile) để quyết định việc mở khóa nội dung. Mọi logic so sánh thời gian (`currentTime > eventStartTime`) đều phải gọi thư viện lấy thời gian của Backend Server hoặc `CURRENT_TIMESTAMP` của Database.
*   **NTP Synchronization:** Đảm bảo tất cả máy chủ backend được đồng bộ hoá thời gian chuẩn xác với Network Time Protocol (NTP) để không bị sai lệch giờ giữa các node.
*   **Validation chặt chẽ tại API Endpoint:** 
    Khi người dùng thực hiện API `/api/claim-reward`:
    1. Server lấy thời gian thực `server_now = UTC.Now()`.
    2. Server kiểm tra DB xem `server_now` đã đến ngày/giờ mở khóa tier này chưa.
    3. Kiểm tra season hiện tại có còn đang diễn ra hay không (`server_now <= season.end_time`).
    Nếu không thoả mãn, lập tức reject với HTTP 403 Forbidden. Client time hoàn toàn vô tác dụng.
*   **Giấu dữ liệu tương lai:** Server không được phép gửi nội dung chi tiết của phần thưởng ngày mai về Client vào ngày hôm nay. Dữ liệu chỉ được trả về thông qua API khi thời gian trên Server đã hợp lệ.
