# Thông báo

Chuông thông báo nằm trên header, cạnh nút đổi giao diện. Backend mô tả ở `amigoact-be/docs/notifications.md`.

## Chuông

| File | Việc |
| ---- | ---- |
| `src/app/_components/notifications/HeaderBell.tsx` | Server component: đọc phiên và số chưa đọc. Khách không thấy chuông |
| `src/app/_components/notifications/NotificationBell.tsx` | Client: số chưa đọc, socket, mở và đóng bảng |
| `src/app/_components/notifications/NotificationPanel.tsx` | Danh sách 20 thông báo mới nhất |
| `src/app/_actions/notifications.ts` | Server Action: tải danh sách, đánh dấu đã đọc |
| `src/lib/notifications.ts` | Chữ tiếng Việt cho từng mã, đọc khung socket, cập nhật trạng thái. Có test |

- Có thông báo chưa đọc thì chuông có viền teal và badge số (`99+` khi lớn hơn 99).
- Thông báo mới tới thì chuông rung khoảng 2,4 giây (tắt khi hệ thống bật giảm chuyển động) và trình đọc màn hình đọc nội dung qua `aria-live`.
- Mở bảng thì tải lại danh sách. Bấm một thông báo thì đánh dấu đã đọc và mở trang liên quan. Nút dấu tích đánh dấu tất cả đã đọc.
- Điện thoại: bảng trải ngang màn hình dưới header. Từ `sm`: bảng rộng 24rem treo dưới chuông.
- Trên điện thoại chỉ hiện chữ "A" của logo, để chuông vừa hàng nút trên header.

## Thời gian thực

Chuông nghe topic của chính người xem (`ME`) trên socket chung, xem `docs/realtime.md`.

| Khung | Việc |
| ---- | ---- |
| `notification.created` | Thêm vào đầu danh sách, tăng số chưa đọc, rung chuông. Cùng mã gửi hai lần chỉ tính một |
| `notification.read` | Đánh dấu đã đọc ở các tab khác |
| `notification.read_all` | Số chưa đọc về 0 ở các tab khác |
| `notification.deleted` | Bỏ khỏi danh sách, giảm số nếu nó chưa đọc. Ví dụ người xin vào rút yêu cầu |

Mỗi lần nối lại, và khi nhận `resync`, chuông tải lại danh sách, nên thông báo tới lúc mất mạng vẫn hiện. Không có địa chỉ socket thì chuông chỉ cập nhật khi mở bảng hoặc tải lại trang.

Các trang tự làm mới (duyệt yêu cầu, thành viên, nút tham gia) không dựa vào thông báo nữa mà nghe tín hiệu riêng, nên vẫn chạy khi người dùng tắt thông báo. Xem bảng "Đang dùng ở đâu" trong `docs/realtime.md`.

## Loại thông báo

| Mã | Chữ hiển thị | Mở trang |
| ---- | ---- | ---- |
| `membership_requested` | "{tên} xin vào {tổ chức}", kèm lý do | `/org/{slug}/applications` |
| `membership_approved`, `membership_rejected` | Kết quả yêu cầu vào tổ chức | `/org/{slug}` |
| `registration_*`, `activity_cancelled`, `appeal_*` | Kết quả đăng ký, hủy hoạt động, khiếu nại | `/activities/{id}` |
| `member_left` | "{tên} đã rời {tổ chức}" | `/org/{slug}/members` |
| `membership_removed` | "Bạn đã bị xóa khỏi {tổ chức}" | `/org/{slug}` |
| `hours_awarded` | Số giờ được ghi | `/hours` |
| `certificate_issued`, `certificate_revoked` | Chứng nhận được cấp hoặc thu hồi, kèm lý do | `/certificates` |

Mã lạ hiện "Bạn có thông báo mới", để backend mới hơn không làm hỏng chuông.

## Chưa có

- Trang `/notifications` để xem toàn bộ lịch sử và cài đặt thông báo. Email của backend đang trỏ tới trang này.
- Thông báo của trình duyệt khi tab đóng (Web Push).
