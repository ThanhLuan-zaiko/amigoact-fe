# Điểm danh và giờ tình nguyện

Tài liệu này mô tả giao diện phần điểm danh. Quy tắc nghiệp vụ và API nằm trong tài liệu của backend, `amigoact-be/docs/attendance.md`.

## Các trang

| Đường dẫn | Nội dung | Ai xem được |
| ---- | ---- | ---- |
| `/checkin` | Nhập mã, hoặc xác nhận khi đến từ mã QR (`?token=`) | Đã đăng nhập |
| `/hours` | Dashboard giờ tình nguyện: bộ lọc khoảng thời gian, biểu đồ theo tuần hoặc tháng, giờ theo tổ chức, các dòng gần đây. Từ xl: biểu đồ bên trái, tổng quan (`stickySide`) bên phải | Đã đăng nhập |
| `/activities` | Thêm trạng thái điểm danh và nút khiếu nại | Đã đăng nhập |
| `/activities/[id]/attendance` | Mở và đóng phiên, hiện mã QR và mã nhập tay. Từ xl: mở phiên bên trái, các phiên bên phải | Ban quản trị |
| `/activities/[id]/attendance/[sessionId]` | Danh sách, xác nhận mã, điểm danh hộ. Từ xl: tổng quan bên trái | Ban quản trị |
| `/activities/[id]/appeals` | Xử lý khiếu nại. Từ xl: tổng quan bên trái | Ban quản trị |
| `/activities/[id]/hours` | Giờ của từng người, điều chỉnh. Từ xl hiện hai cột | Ban quản trị |
| `/org/[slug]/hours` | Dashboard giờ của tổ chức: biểu đồ theo tuần hoặc tháng, giờ theo hoạt động. Từ xl: tổng quan, tỉ lệ có mặt và 10 người nhiều giờ nhất ở cột phụ | Người có quyền `attendance.hours` |

Quy tắc tính giờ nằm trong trang cài đặt của tổ chức.

## Dashboard giờ (`/hours`)

- Dữ liệu lấy từ `GET /hours/mine/stats` (`getMyHourStats`) và `GET /hours/mine` (các dòng gần đây, không lọc theo khoảng thời gian). Logic bộ lọc, nhãn kỳ và đường dẫn nằm trong `src/lib/hoursStats.ts`.
- Bộ lọc là link thường: `?range=3m|6m|12m|all` (mặc định `12m`) và `?bucket=week|month` (mặc định `month`). Giá trị lạ quay về mặc định. Khoảng thời gian tính theo tháng giờ Việt Nam, gồm cả tháng hiện tại. Đây là chỗ cố ý không theo múi giờ của người xem: backend cộng giờ theo ngày và kỳ giờ Việt Nam, nên mọi người thấy cùng tổng cho cùng một tháng (xem `docs/time-zones.md`). Giờ đóng phiên điểm danh thì hiện theo múi giờ của người xem, kèm độ lệch.
- Trên điện thoại, tổng quan đứng trước biểu đồ. Từ xl, cột phụ dùng `stickySide`.

### Dashboard của tổ chức (`/org/[slug]/hours`)

- Dữ liệu từ `GET /organizations/{slug}/hours/stats` (`getOrgHourStats`). Trang và mục "Giờ" trong `OrgNav` chỉ hiện với `hasPermission(viewer, "attendance.hours")`; backend kiểm tra lại quyền. Trang nằm trong `src/lib/protectedPaths.ts`.
- Chủ tổ chức xem ở `/organizations/<slug>/hours`, người khác ở `/org/<slug>/hours`. Link của bộ lọc dựng từ `orgBase`, nên giữ đúng địa chỉ.
- Dùng chung với `/hours`: `StatsFilters`, `TrendSection`, `BreakdownSection`, `AttendanceRate`, `TermChips` trong `src/app/_components/hours/`.

### Biểu đồ canvas

Biểu đồ vẽ bằng canvas tự viết, không dùng thư viện. Code nằm trong `src/app/_components/charts/`:

| File | Vai trò |
| ---- | ---- |
| `useCanvas.ts` | Đặt kích thước pixel qua thuộc tính `width`/`height` (không dùng `style`), nhân theo `devicePixelRatio`, vẽ lại khi khung đổi kích thước hoặc khi class `dark` trên `<html>` đổi |
| `Swatches.tsx` | Các phần tử ẩn mang class màu Tailwind. Canvas đọc màu bằng `getComputedStyle`, nên màu vẫn là class Tailwind và tự theo dark mode |
| `draw.ts` | Cột bo góc 4px ở đầu dữ liệu, đường lưới 1px, chữ, cắt chữ dài |
| `ColumnChart.tsx` | Cột chồng: giờ được ghi (teal) và điều chỉnh (slate, âm thì nằm dưới trục 0). Rê chuột hoặc chạm để xem số của từng kỳ |
| `BarListChart.tsx` | Thanh ngang theo tổ chức, tối đa 8 tổ chức và một dòng "Khác" |
| `MeterBar.tsx` | Thanh tỉ lệ có mặt |

- Hình học (thang trục, vị trí cột, khoảng cách nhãn) là hàm thuần trong `src/lib/chartGeometry.ts`, có unit test.
- Canvas có `aria-hidden`; mỗi biểu đồ kèm một bảng `sr-only` để trình đọc màn hình đọc số liệu. Chú thích màu viết bằng HTML.
- Chiều cao của biểu đồ thanh ngang chọn từ danh sách class cố định (`h-10` đến `h-100`), vì Tailwind không tạo được class lúc chạy.
- Màu đã kiểm tra: teal-700 và slate-400 (sáng), teal-400 và slate-500 (tối) đủ tách biệt cho người mù màu. Slate cố ý là màu trung tính cho phần điều chỉnh, nên luôn có chú thích, dòng số liệu và bảng đi kèm.

## Mã QR

`SessionQr` vẽ mã trên server bằng thư viện `qrcode`, nên trình duyệt chỉ nhận một ảnh. Mã QR dẫn tới `/checkin?token=...`, và điện thoại quét bằng camera có sẵn, không cần máy quét trong ứng dụng.

Địa chỉ trong mã QR lấy từ `APP_URL` nếu có, nếu không thì lấy từ request hiện tại. Khi chạy ở máy cá nhân, địa chỉ `localhost` không mở được từ điện thoại, nên hãy đặt `APP_URL` thành địa chỉ mà điện thoại truy cập được. Production phải đặt `APP_URL`.

Trang `/checkin` không nằm trong danh sách bảo vệ của `src/proxy.ts`, vì proxy chỉ giữ lại đường dẫn. Trang tự gọi `requireUser` với cả `token`, nên sau khi đăng nhập người dùng vẫn quay lại đúng mã đã quét.

## Thanh điều hướng

Thanh dưới trên điện thoại có Trang chủ, Hoạt động, Tin nhắn, Hồ sơ. Hoạt động hiện bên trong bài viết gắn với nó trên bảng tin, và tìm được bằng ô tìm trên header. Tạo bài vẫn ở nút cộng trên header.
