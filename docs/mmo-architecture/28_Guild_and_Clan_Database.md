# Báo cáo Kiến trúc Cơ sở dữ liệu: Hệ thống Bang hội (Guild/Clan) cho Web MMO

## 1. Thiết kế Lược đồ (Database Schema)
Hệ thống yêu cầu các bảng cơ bản để quản lý bang hội, vai trò và thành viên.

```sql
-- Kích hoạt extension citext để xử lý tên không phân biệt hoa/thường tối ưu
CREATE EXTENSION IF NOT EXISTS citext;

-- Bảng lưu trữ thông tin Bang hội
CREATE TABLE guilds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name CITEXT NOT NULL UNIQUE, -- Đảm bảo tên duy nhất
    description TEXT,
    level INT DEFAULT 1,
    experience BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng phân quyền & vai trò trong Bang
CREATE TABLE guild_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- Ví dụ: Master, Officer, Member
    rank_level INT NOT NULL, -- Thứ bậc (VD: 1 là cao nhất)
    permissions JSONB DEFAULT '{}'::jsonb, -- Lưu quyền hạn cụ thể (ví dụ: {"can_invite": true})
    UNIQUE(guild_id, name)
);

-- Bảng thành viên Bang hội
CREATE TABLE guild_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES guild_roles(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guild_id, user_id), -- Một user chỉ tham gia 1 lần trong 1 bang
    UNIQUE(user_id) -- Ràng buộc bổ sung nếu MMO giới hạn 1 nhân vật chỉ vào 1 bang lúc đó
);
```

## 2. Giải quyết xung đột (Concurrency) khi tạo Bang
**Tình huống:** Hai người chơi (Player A và B) điền cùng tên bang và bấm tạo ở chính xác cùng một mili-giây.

**Giải pháp cốt lõi:**
Sử dụng **UNIQUE Constraint** ở database level (cột `name CITEXT UNIQUE`). Theo đặc tính nguyên tử (Atomicity) và cô lập (Isolation) của PostgreSQL, hệ thống sẽ chốt lock (row/index lock) cho transaction tới trước xử lý. Transaction tới sau sẽ bị chặn lại, và sau đó văng lỗi `23505 (unique_violation)`. Client/Supabase chỉ cần bắt lỗi này để báo "Tên bang đã tồn tại".

**Best Practice (Sử dụng RPC trong Supabase):**
Để tránh việc tạo bang thành công nhưng kết nối mạng chập chờn gây lỗi mất lệnh gán quyền Chủ bang, chúng ta cần gộp các thao tác này vào một Stored Procedure (RPC) - một Transaction duy nhất.

```sql
CREATE OR REPLACE FUNCTION create_guild(guild_name TEXT, user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    new_guild_id UUID;
    master_role_id UUID;
BEGIN
    -- 1. Cố gắng tạo Guild. Nếu trùng tên, Postgres sẽ văng lỗi unique_violation tại đây.
    INSERT INTO guilds (name) VALUES (guild_name) RETURNING id INTO new_guild_id;

    -- 2. Tạo role mặc định (Master, Member)
    INSERT INTO guild_roles (guild_id, name, rank_level, permissions)
    VALUES (new_guild_id, 'Master', 1, '{"all": true}') RETURNING id INTO master_role_id;

    INSERT INTO guild_roles (guild_id, name, rank_level, permissions)
    VALUES (new_guild_id, 'Member', 10, '{"all": false}');

    -- 3. Đưa người tạo vào làm Master
    INSERT INTO guild_members (guild_id, user_id, role_id)
    VALUES (new_guild_id, user_uuid, master_role_id);

    RETURN new_guild_id;
EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'Tên bang hội đã tồn tại';
END;
$$ LANGUAGE plpgsql;
```

## 3. Quản lý Không gian 3D (Guild Halls)
Dữ liệu cho một căn cứ 3D (Guild Hall) chia sẻ gồm nhiều vật thể. Để hỗ trợ người chơi trang trí thời gian thực (real-time decoration) và tránh rủi ro ghi đè khi nhiều người cùng thao tác, ta **không nên** lưu toàn bộ cả căn nhà vào một cột JSON duy nhất. Thay vào đó, hãy lưu từng vật thể (object) thành các dòng dữ liệu riêng.

```sql
-- Bảng định nghĩa trạng thái cơ bản của Guild Hall
CREATE TABLE guild_halls (
    guild_id UUID PRIMARY KEY REFERENCES guilds(id) ON DELETE CASCADE,
    theme_id VARCHAR(50), -- Giao diện môi trường gốc
    level INT DEFAULT 1,
    unlocked_areas JSONB DEFAULT '[]'::jsonb, -- Khu vực đã mở khóa (tĩnh, ít thay đổi)
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng lưu trữ TỪNG vật thể 3D giúp tối ưu Concurrency
CREATE TABLE guild_hall_objects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
    asset_id VARCHAR(100) NOT NULL, -- ID của 3D model (Ví dụ: 'chair_wood_01')
    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL,
    position_z FLOAT NOT NULL,
    rotation_x FLOAT NOT NULL DEFAULT 0,
    rotation_y FLOAT NOT NULL DEFAULT 0,
    rotation_z FLOAT NOT NULL DEFAULT 0,
    rotation_w FLOAT NOT NULL DEFAULT 1, -- Dùng Quaternion trong 3D
    scale FLOAT NOT NULL DEFAULT 1.0,
    placed_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Ưu điểm thiết kế cho MMO với bảng `guild_hall_objects`:**
1. **Concurrency khi xây dựng:** Nếu Player A dịch chuyển cái Bàn, Player B dịch chuyển cái Ghế, họ sẽ gọi `UPDATE` lên 2 dòng (row) với 2 `id` khác nhau. Sẽ không có xung đột (write-lock) như khi hai người cùng cố cập nhật chung một file JSON lớn.
2. **Supabase Realtime Synchronization:** Rất dễ cấu hình game client lắng nghe (subscribe) các luồng `UPDATE/INSERT/DELETE` của bảng này với bộ lọc `guild_id=X`. Khi ai đó di chuyển món đồ, những người khác trong Guild Hall lập tức nhận toạ độ mới thông qua WebSockets để diễn hoạt trên màn hình của họ mà không gây lag máy chủ.
