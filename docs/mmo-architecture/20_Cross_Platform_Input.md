### Báo cáo Kỹ thuật: Kiến trúc Trừu tượng hóa Đầu vào và Đa Nền tảng cho Game WebGL

**1. Lớp Trừu tượng hóa Đầu vào (Input Abstraction Layer)**
Lớp trừu tượng hóa đóng vai trò là "cầu nối" (middleware) tách biệt phần cứng vật lý khỏi logic cốt lõi của game. Điều này đặc biệt quan trọng trong môi trường WebGL, nơi game có thể chạy trên trình duyệt PC, điện thoại di động, hoặc console.

*   **Keyboard/Mouse (Phím/Chuột):** Lắng nghe các sự kiện DOM (`keydown`, `keyup`, `pointerdown`). Trong môi trường Web, cần chú ý quản lý tiêu điểm (focus) của canvas và dùng `event.preventDefault()` để chặn các hành vi mặc định của trình duyệt (ví dụ: nhấn Space bị cuộn trang).
*   **Gamepad:** Sử dụng `HTML5 Gamepad API`. Có hai điểm cốt lõi: (1) Trình duyệt yêu cầu người dùng phải có tương tác (nhấn một nút) thì mới cấp quyền nhận diện thiết bị; (2) Trạng thái gamepad không hoạt động theo sự kiện (event-driven) mà cần được quét liên tục (polling) bằng `navigator.getGamepads()` trong vòng lặp `requestAnimationFrame`.
*   **Touch (Cảm ứng):** Chuyển đổi các sự kiện `touchstart`, `touchmove`, `touchend` thành các thao tác điều khiển. Tọa độ chạm thường được dùng để tính toán vector cho "cần gạt ảo" (virtual joystick) hoặc kiểm tra vùng va chạm với các nút ảo (virtual buttons).

**2. Gán Hành động (Action Mapping)**
Hệ thống này chuyển đổi các nút vật lý thành một "Hành động logic" (Logical Action). Game logic sẽ không kiểm tra "Phím Space có đang được nhấn không?", mà sẽ gọi kiểm tra "Hành động Jump có đang kích hoạt không?".

*   **Cấu trúc Ánh xạ (Input Map):** Sử dụng dữ liệu cấu hình (JSON) liên kết nhiều loại đầu vào vật lý với một hành động.
    ```json
    {
      "JumpAction": {
        "Keyboard": ["Space", "ArrowUp"],
        "Gamepad": ["ButtonA", "ButtonR1"],
        "Touch": ["VirtualBtn_Jump"]
      }
    }
    ```
*   **Input Manager:** Có nhiệm vụ tổng hợp trạng thái. Khi được truy vấn, hệ thống dùng toán tử logic `OR`. Nếu *bất kỳ* thiết bị nào trong danh sách của `JumpAction` được kích hoạt, hệ thống trả về `true`. Cấu trúc này cho phép người chơi sử dụng song song nhiều thiết bị cùng lúc.

**3. Khả năng Thích ứng UI/UX (UI/UX Adaptability)**
Khi người chơi thay đổi phương thức điều khiển giữa chừng, giao diện cần phản hồi theo thời gian thực (Dynamic Input Device Detection).

*   **Theo dõi Thiết bị Cuối (Last Used Device):** Input Manager cần ghi nhận thiết bị cuối cùng có phát sinh thao tác. Bất kỳ sự thay đổi nào (ví dụ: đang dùng Gamepad nhưng lại chạm tay vào màn hình) sẽ kích hoạt sự kiện `OnDeviceChanged`.
*   **Gợi ý Đầu vào Động (Dynamic Input Prompts):**
    *   Áp dụng phương pháp Data-Driven UI. Các văn bản UI không chứa text cứng mà dùng thẻ đại diện như `[Action:Interact]`.
    *   Sử dụng một **UI Proxy Component** lắng nghe sự kiện `OnDeviceChanged`. Nếu chuyển sang Gamepad, hệ thống tra cứu và thay `[Action:Interact]` bằng hình ảnh (Sprite) của nút "A" (Xbox) hoặc "X" (PlayStation).
*   **Chuyển đổi Bố cục Theo Ngữ cảnh (Contextual Layout):**
    *   **Mouse/Keyboard:** Dùng text "Press E" hoặc tooltip nhỏ gọn, kích hoạt con trỏ chuột.
    *   **Touch:** Khi hệ thống nhận diện `ActiveDevice` là Touch, tự động thay đổi text thành "Tap Here", đồng thời hiển thị các UI điều khiển ảo (Virtual Joystick) trên màn hình. Kích thước (hitbox) của các nút UI cũng phải được phóng to để thân thiện với thao tác ngón tay.
    *   **Gamepad:** Ẩn con trỏ chuột và UI cảm ứng, thiết lập lại hệ thống EventSystem của UI để làm nổi bật (highlight) nút đang được trỏ tới, giúp điều hướng dễ dàng qua D-pad.
