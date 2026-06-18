# Báo cáo Kỹ thuật: Animation Blending & State Machines trong Three.js

## 1. Animation Mixer: Sử dụng `THREE.AnimationMixer` hiệu quả
`THREE.AnimationMixer` là trái tim của hệ thống hoạt hình trong Three.js, đóng vai trò như một bộ xử lý trung tâm điều khiển toàn bộ các hoạt ảnh của một đối tượng cụ thể.

- **Khởi tạo và Quản lý**: Mỗi nhân vật 3D (ví dụ: file GLTF) chỉ nên có **duy nhất một** `AnimationMixer`. Việc liên kết các `AnimationClip` với mixer được thực hiện thông qua `mixer.clipAction(clip)`, thao tác này sẽ trả về một `AnimationAction`.
- **Tối ưu hiệu suất**: Thay vì gọi `clipAction()` liên tục trong mỗi frame, hãy cache (lưu trữ) tất cả các `AnimationAction` vào một Dictionary/Object ngay khi load model.
- **Vòng lặp Cập nhật**: Bắt buộc phải gọi `mixer.update(deltaTime)` trong hàm render loop (`requestAnimationFrame`). `deltaTime` (thời gian tính bằng giây trôi qua từ frame trước) giúp hoạt ảnh chạy mượt mà, đảm bảo tốc độ của animation không phụ thuộc vào FPS của thiết bị.

## 2. Cross-Fading: Chuyển tiếp mượt mà giữa các hành động (Walk -> Run -> Jump)
Tránh hiện tượng "snapping" (giật cục) khi chuyển ngay lập tức giữa hai tư thế khác nhau. Kỹ thuật Cross-Fading sẽ hòa trộn dần hai chuyển động bằng cách giảm trọng số (weight) của hoạt ảnh cũ và tăng trọng số của hoạt ảnh mới.

- **API của Three.js**: Sử dụng các phương thức `fadeIn()`, `fadeOut()`, `crossFadeFrom()`, và `crossFadeTo()` của `AnimationAction`.
- **Ví dụ cơ bản cho hàm chuyển tiếp**:
```javascript
function fadeToAction(name, duration) {
    const previousAction = currentAction;
    const activeAction = actions[name];

    if (previousAction !== activeAction) {
        // Làm mờ dần hoạt ảnh trước đó
        previousAction.fadeOut(duration);
    }

    activeAction
        .reset()                      // Reset timeline của hoạt ảnh mới về 0
        .setEffectiveTimeScale(1)     // Đảm bảo tốc độ chạy chuẩn
        .setEffectiveWeight(1)        // Chuẩn bị trọng số đầy đủ
        .fadeIn(duration)             // Xuất hiện dần dần
        .play();                      // Bắt đầu chạy

    currentAction = activeAction;
}
```
- **Xử lý đặc biệt cho hoạt ảnh "Nhảy" (Jump)**: Nhảy thường là một hoạt ảnh không lặp lại. Cần thiết lập `.setLoop(THREE.LoopOnce, 1)` và `clampWhenFinished = true` để khi nhảy xong, nhân vật giữ nguyên tư thế chạm đất cho đến khi hệ thống tiếp tục cross-fade sang trạng thái Idle hoặc Walk.

## 3. State Machine (FSM): Cấu trúc logic phức tạp
Khi số lượng trạng thái tăng lên (Idle, Walk, Run, Jump, Fall, Attack...), việc dùng chuỗi `if-else` trong Controller sẽ dẫn đến mã nguồn rối rắm ("spaghetti code"). Finite State Machine (FSM) là mẫu thiết kế tiêu chuẩn để giải quyết vấn đề này.

- **Cấu trúc FSM**:
  - **Lớp `FiniteStateMachine`**: Nơi theo dõi trạng thái hiện tại (`currentState`) và nhận các thay đổi đầu vào (Input).
  - **Lớp `State` (Base Class)**: Định nghĩa các interface/phương thức chuẩn như `Enter()`, `Update()`, `Exit()`.
  - **Các lớp trạng thái cụ thể (`IdleState`, `WalkState`, `RunState`,...)**: Kế thừa từ `State`. Mỗi trạng thái tự chứa logic của riêng nó.
- **Luồng hoạt động mẫu**:
  1. Đang ở `WalkState`. Nhận Input (Nhấn phím `Shift`).
  2. Logic trong `WalkState` đánh giá hợp lệ và báo cho FSM đổi sang `RunState`.
  3. FSM gọi `WalkState.Exit()`.
  4. FSM thay đổi state hiện tại thành `RunState` và gọi `RunState.Enter()`.
  5. Trong `RunState.Enter()`, hàm `fadeToAction('Run', 0.2)` được kích hoạt để cross-fade sang hoạt ảnh chạy trong 0.2 giây.
- **Lợi ích**: Codebase trở nên module hóa cao, dễ dàng gỡ lỗi (debug) và có thể thêm vô số trạng thái mới mà không phá vỡ logic của các trạng thái cũ.

**Kết luận**: Sự kết hợp giữa bộ trộn API tích hợp sẵn (`AnimationMixer`, `AnimationAction.crossFadeTo`) với mẫu thiết kế kiến trúc FSM (Máy trạng thái hữu hạn) là giải pháp tối ưu, chuẩn nghiệp vụ để xây dựng Character Controller linh hoạt và mượt mà trong Three.js.
