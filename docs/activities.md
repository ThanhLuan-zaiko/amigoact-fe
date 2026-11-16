# Hoạt động và đăng ký

Tài liệu này mô tả giao diện phần hoạt động. Quy tắc nghiệp vụ và API nằm trong tài liệu của backend, `amigoact-be/docs/activities.md`.

## Các trang

| Đường dẫn | Nội dung | Ai xem được |
| ---- | ---- | ---- |
| `/?tab=activities` | Tab "Tất cả" chỉ hiện bài viết; hoạt động hiện bên trong bài gắn với nó (`PostActivityRow`, xem `docs/posts.md`). Địa chỉ này, mở từ ô tìm trên header, là mọi hoạt động sắp diễn ra, có phân trang, thay chỗ bảng tin nhưng vẫn dưới tab "Tất cả" (không còn tab "Hoạt động" riêng). Tiêu đề "Tất cả hoạt động" hoặc "Hoạt động: “từ khóa”", nút × quay lại bảng tin. Thẻ xếp một cột, ảnh rộng hết thẻ (16:9). Không có thanh tìm riêng: ô tìm trên header là ô duy nhất, gõ tên hoặc thành phố đều được (backend khớp `q` với cả hai). Điện thoại không có ô trên header, nên trang hiện một ô tìm (`md:hidden`). Không có ô soạn bài (`ActivityDirectory`) | Mọi người |
| `/activities` | Hoạt động bạn đã đăng ký. Từ xl hiện hai cột | Đã đăng nhập |
| `/activities/[id]` | Chi tiết bên trái, đăng ký và nút quản lý bên phải từ xl | Mọi người. Bản nháp chỉ ban quản trị |
| `/activities/[id]/edit` | Sửa hoạt động, form hai cột từ xl, các ca nằm bên dưới | Ban quản trị |
| `/activities/[id]/registrations` | Người đăng ký, lọc theo trạng thái (cột trái từ xl), duyệt và từ chối | Ban quản trị |
| `/org/[slug]/activities` | Hoạt động của tổ chức, không gồm bản nháp. Thanh công cụ giống Bảng tin: tab Tất cả / Sắp tới / Đã kết thúc / Đã hủy (`?filter=`), rồi nút Bản nháp, Thùng rác và "Tạo hoạt động" cho ban quản trị. Từ 2xl hiện ba cột | Mọi người. Nút quản lý chỉ ban quản trị thấy |
| `/org/[slug]/activities/drafts` | Hoạt động nháp của tổ chức | Ban quản trị |
| `/org/[slug]/activities/trash` | Bản nháp đã xóa, giữ 30 ngày. "Khôi phục" đưa về bản nháp. Chỉ chủ sở hữu thấy "Xóa vĩnh viễn", phải gõ lại tên hoạt động | Ban quản trị |
| `/org/[slug]/activities/new` | Tạo hoạt động, form hai cột từ xl. "Đăng ngay" tạo rồi đăng luôn, "Lưu nháp" chỉ lưu. Bắt buộc: tên, mô tả, bắt đầu, kết thúc, giờ tình nguyện, thành phố, và địa điểm nếu không trực tuyến | Ban quản trị |

Trang `/explore` cũ đã gộp vào trang chủ. Địa chỉ `/explore` chuyển hướng (307, trong `next.config.ts`) sang `/?tab=activities`, giữ nguyên `q`, `city`, `page`, nên link cũ vẫn chạy. Thanh điều hướng không còn mục "Khám phá".

Ô tìm kiếm trên header ("Tìm hoạt động, thành phố") dẫn tới `/?tab=activities&q=...`. Link cũ chỉ có `?city=` được đọc như từ khóa tìm, và ô trên header hiện giá trị đó.

Tab, đường dẫn và câu báo trống của từng tab nằm trong `src/lib/activityList.ts`. Thanh tab là `ActivityFilters`, danh sách thùng rác là `ActivityTrashList`. Xóa một bản nháp xong thì quay về trang Bản nháp. Ba trang `new`, `drafts`, `trash` cần đăng nhập (`src/lib/protectedPaths.ts`).

## Thẻ

- Form hoạt động dùng lại `TagInput` của bài viết, với `source="activity"` và trường ẩn `tags`. Gợi ý lấy từ Server Action `searchTags` (`src/app/_actions/postTags.ts`) gọi `GET /organizations/{slug}/activity-tags`. Kiểm tra trước khi gửi dùng chung `tagListError` với bài viết: tối đa 5 thẻ, mỗi thẻ tối đa 40 ký tự và phải có chữ hoặc số.
- `ActivityCard` hiện chip `#thẻ` dẫn tới `/org/[slug]/activities?tag=<slug>` (`activityTagHref`). Link tiêu đề phủ cả thẻ bằng `after:absolute after:inset-0`, còn các chip nằm trên lớp đó (`relative z-10`), vì link lồng trong link là HTML sai.
- `ActivityCard` có ảnh ở đầu thẻ khi API trả `picture`: ảnh đầu của bài công khai mới nhất gắn với hoạt động, không có thì ảnh bìa tổ chức (quy tắc ở `amigoact-be/docs/posts.md`). Ảnh cắt theo điểm lấy nét (`focusClass`).
- Trang hoạt động của tổ chức đọc `?tag=`, hiện `TagFilterBar` có nút bỏ lọc. Đổi tab và phân trang đều giữ thẻ.

## Ngày giờ

Giờ hiển thị theo múi giờ của người xem; chi tiết ở `docs/time-zones.md`.

- Ô `datetime-local` không có múi giờ: giá trị là giờ trên đồng hồ của người tạo hoạt động. Form có `ZoneNote` ghi múi giờ đó và gửi kèm ô ẩn `time_zone`.
- `toLocalInput(value, timeZone)` đổi thời điểm lưu trữ thành giá trị cho ô nhập; `fromLocalInput(value, timeZone)` đổi lại thành chuỗi ISO 8601 có độ lệch của múi giờ đó (ví dụ `+07:00`, hay `-04:00` ở New York mùa hè).
- Trang hoạt động ghi giờ bắt đầu, kết thúc và hạn đăng ký kèm múi giờ (`formatTimeRange`, `formatDateTimeZoned`); thẻ và danh sách dùng `formatDateTime`.

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
