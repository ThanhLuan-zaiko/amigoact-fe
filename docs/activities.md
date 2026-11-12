# Hoạt động và đăng ký

Tài liệu này mô tả giao diện phần hoạt động. Quy tắc nghiệp vụ và API nằm trong tài liệu của backend, `amigoact-be/docs/activities.md`.

## Các trang

| Đường dẫn | Nội dung | Ai xem được |
| ---- | ---- | ---- |
| `/explore` | Hoạt động sắp diễn ra, tìm theo tên và thành phố. Từ 2xl hiện ba cột | Mọi người |
| `/activities` | Hoạt động bạn đã đăng ký. Từ xl hiện hai cột | Đã đăng nhập |
| `/activities/[id]` | Chi tiết bên trái, đăng ký và nút quản lý bên phải từ xl | Mọi người. Bản nháp chỉ ban quản trị |
| `/activities/[id]/edit` | Sửa hoạt động, form hai cột từ xl, các ca nằm bên dưới | Ban quản trị |
| `/activities/[id]/registrations` | Người đăng ký, lọc theo trạng thái (cột trái từ xl), duyệt và từ chối | Ban quản trị |
| `/organizations/[slug]/activities` | Hoạt động của tổ chức, không gồm bản nháp. Thanh công cụ giống Bảng tin: tab Tất cả / Sắp tới / Đã kết thúc / Đã hủy (`?filter=`), rồi nút Bản nháp, Thùng rác và "Tạo hoạt động" cho ban quản trị. Từ 2xl hiện ba cột | Mọi người. Nút quản lý chỉ ban quản trị thấy |
| `/organizations/[slug]/activities/drafts` | Hoạt động nháp của tổ chức | Ban quản trị |
| `/organizations/[slug]/activities/trash` | Bản nháp đã xóa, giữ 30 ngày. "Khôi phục" đưa về bản nháp. Chỉ chủ sở hữu thấy "Xóa vĩnh viễn", phải gõ lại tên hoạt động | Ban quản trị |
| `/organizations/[slug]/activities/new` | Tạo hoạt động, form hai cột từ xl. "Đăng ngay" tạo rồi đăng luôn, "Lưu nháp" chỉ lưu. Bắt buộc: tên, mô tả, bắt đầu, kết thúc, giờ tình nguyện, thành phố, và địa điểm nếu không trực tuyến | Ban quản trị |

Ô tìm kiếm trên header dẫn tới `/explore`.

Tab, đường dẫn và câu báo trống của từng tab nằm trong `src/lib/activityList.ts`. Thanh tab là `ActivityFilters`, danh sách thùng rác là `ActivityTrashList`. Xóa một bản nháp xong thì quay về trang Bản nháp. Ba trang `new`, `drafts`, `trash` cần đăng nhập (`src/lib/protectedPaths.ts`).

## Thẻ

- Form hoạt động dùng lại `TagInput` của bài viết, với `source="activity"` và trường ẩn `tags`. Gợi ý lấy từ Server Action `searchTags` (`src/app/_actions/postTags.ts`) gọi `GET /organizations/{slug}/activity-tags`. Kiểm tra trước khi gửi dùng chung `tagListError` với bài viết: tối đa 5 thẻ, mỗi thẻ tối đa 40 ký tự và phải có chữ hoặc số.
- `ActivityCard` hiện chip `#thẻ` dẫn tới `/organizations/[slug]/activities?tag=<slug>` (`activityTagHref`). Link tiêu đề phủ cả thẻ bằng `after:absolute after:inset-0`, còn các chip nằm trên lớp đó (`relative z-10`), vì link lồng trong link là HTML sai.
- Trang hoạt động của tổ chức đọc `?tag=`, hiện `TagFilterBar` có nút bỏ lọc. Đổi tab và phân trang đều giữ thẻ.

## Giờ Việt Nam

Ô `datetime-local` không có múi giờ, nên ứng dụng luôn hiểu đó là giờ Việt Nam.

- `toLocalInput` đổi thời gian lưu trữ thành giá trị cho ô nhập.
- `fromLocalInput` thêm `+07:00` trước khi gửi lên backend.
- `formatDateTime` hiển thị theo `Asia/Ho_Chi_Minh`.

## Thành phần

- `IconStat` hiện một icon kèm giá trị, có tooltip và nhãn cho trình đọc màn hình.
- `ActivityCard` là thẻ hoạt động trong các danh sách.
- `RegisterControls` chọn nút theo trạng thái đăng ký của người xem, cho cả hoạt động hoặc từng ca.
- `ManageActions` chứa các nút đăng, sửa, kết thúc, hủy và xóa của ban quản trị.
- `ShiftEditor` thêm, sửa và xóa ca.
- `RegistrationBadge` hiện trạng thái đăng ký bằng icon và chữ ngắn.

## Giao diện dùng icon

Icon được dùng tự do: trên nút có chữ, tiêu đề và cạnh nhãn khi giúp người dùng lướt nhanh. Icon chỉ lấy từ `react-icons`. Mọi icon đứng một mình đều có `aria-label` và `title`. Nhãn form, câu xác nhận và nút chính của trang vẫn có chữ rõ ràng.

## Chưa có

Giao diện chưa có ô ghi chú khi đăng ký và ô lý do khi từ chối, dù API đã hỗ trợ `note`.
