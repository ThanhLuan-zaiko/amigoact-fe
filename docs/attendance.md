# Điểm danh và giờ tình nguyện

Tài liệu này mô tả giao diện phần điểm danh. Quy tắc nghiệp vụ và API nằm trong tài liệu của backend, `amigoact-be/docs/attendance.md`.

## Các trang

| Đường dẫn | Nội dung | Ai xem được |
| ---- | ---- | ---- |
| `/checkin` | Nhập mã, hoặc xác nhận khi đến từ mã QR (`?token=`) | Đã đăng nhập |
| `/hours` | Tổng giờ, giờ theo kỳ, các dòng trong sổ | Đã đăng nhập |
| `/activities` | Thêm trạng thái điểm danh và nút khiếu nại | Đã đăng nhập |
| `/activities/[id]/attendance` | Mở và đóng phiên, hiện mã QR và mã nhập tay | Ban quản trị |
| `/activities/[id]/attendance/[sessionId]` | Danh sách, xác nhận mã, điểm danh hộ | Ban quản trị |
| `/activities/[id]/appeals` | Xử lý khiếu nại | Ban quản trị |
| `/activities/[id]/hours` | Giờ của từng người, điều chỉnh | Ban quản trị |

Quy tắc tính giờ nằm trong trang cài đặt của tổ chức.

## Mã QR

`SessionQr` vẽ mã trên server bằng thư viện `qrcode`, nên trình duyệt chỉ nhận một ảnh. Mã QR dẫn tới `/checkin?token=...`, và điện thoại quét bằng camera có sẵn, không cần máy quét trong ứng dụng.

Địa chỉ trong mã QR lấy từ `APP_URL` nếu có, nếu không thì lấy từ request hiện tại. Khi chạy ở máy cá nhân, địa chỉ `localhost` không mở được từ điện thoại, nên hãy đặt `APP_URL` thành địa chỉ mà điện thoại truy cập được. Production phải đặt `APP_URL`.

Trang `/checkin` không nằm trong danh sách bảo vệ của `src/proxy.ts`, vì proxy chỉ giữ lại đường dẫn. Trang tự gọi `requireUser` với cả `token`, nên sau khi đăng nhập người dùng vẫn quay lại đúng mã đã quét.

## Thanh điều hướng

Thanh dưới trên điện thoại có Trang chủ, Khám phá, Hoạt động, Tin nhắn, Hồ sơ. Tạo bài vẫn ở nút cộng trên header.
