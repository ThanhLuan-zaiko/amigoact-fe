# Vai trò và quyền

Giao diện cho cơ chế phân quyền giống Discord. Quy tắc và API nằm trong `amigoact-be/docs/roles.md`.

## Quyền của người xem

- `viewer.permissions` (từ `GET /organizations/{slug}`) liệt kê mã quyền người xem đang giữ. Chủ sở hữu giữ mọi mã.
- Mã quyền dạng `mục.hành động` (ví dụ `activities.create`), nên một vai trò có thể tạo mà không xóa được. Danh sách và nhãn tiếng Việt nằm ở `MODULES` trong `src/lib/roles.ts`.
- Dùng `hasPermission(viewer, "activities.create")` cho một hành động và `hasModule(viewer, "activities")` khi chỉ cần giữ bất kỳ quyền nào của mục. Không dùng `viewer.role === "admin"`. Người giữ `administrator` có mọi quyền.
- Backend vẫn kiểm tra mọi thao tác. Giao diện chỉ ẩn nút cho gọn.

| Nơi | Quyền cần |
| ---- | ---- |
| Mục "Cài đặt" và trang `/settings` | `organization.update` |
| Mục "Yêu cầu" | `applications.review` |
| Mục "Chứng nhận", trang `/certificates` | `certificates.templates` (mục hiện khi có bất kỳ quyền chứng nhận nào) |
| Danh sách hoạt động: bản nháp | bất kỳ quyền `activities.*` |
| Nút "Tạo hoạt động" và trang `/activities/new` | `activities.create` |
| Thùng rác hoạt động | `activities.delete` |
| Bài thông báo (form bài viết) | `posts.announce` |
| Thùng rác bài viết | `posts.moderate` |
| Trang tạo vai trò | `roles.create` |
| Nút gán vai trò | `roles.assign` |
| Nút xóa thành viên | `members.remove` |

## Trang vai trò

`/org/[slug]/roles` dùng bố cục danh sách và chi tiết. Trên màn hình xl, cột trái (`RoleList`) là danh sách vai trò, đứng yên khi cuộn. Cột phải là vai trò đang chọn (`RoleDetail`) hoặc form tạo vai trò. Điện thoại và tablet hiện danh sách trước, chi tiết ở dưới.

- Vai trò được chọn qua `?role=<id>` (`?role=new` cho vai trò mới), nên trang vẫn dựng trên server và có thể gửi link tới đúng vai trò. Mặc định chọn vai trò đầu tiên. Link có `#role-detail`, nên trên điện thoại trang cuộn xuống phần chi tiết.
- Mỗi dòng trong danh sách có thứ bậc, chấm màu, tên, biểu tượng khiên nếu là quản trị viên, và số thành viên. Dòng đang chọn có viền teal và nền nhạt.
- Phần chi tiết có các nút đưa lên hoặc xuống (cần `roles.update`) và xóa (cần `roles.delete`), chỉ hiện khi `below_you`. Nếu sửa được thì form sửa quyền dùng hết chiều rộng; nếu không thì hiện tóm tắt quyền theo mục, kèm lý do không sửa được. Mỗi vai trò có form riêng (`key`), nên đổi vai trò không giữ lại ô đã tích.
- Thanh lưu của form luôn dính ở cuối màn hình (trên thanh điều hướng dưới cùng của điện thoại), vì danh sách quyền dài.
- Nút đưa lên hoặc xuống gửi `PUT .../roles/order` với các vai trò người xem được phép di chuyển (`movedOrder`).
- Trang tự tải lại khi có `roles.changed` hoặc `members.changed` (`LiveRefresh`).

## Chọn quyền (`PermissionPicker`)

- **Mẫu quyền**: một hàng nút ("Duyệt thành viên", "Tổ chức hoạt động", "Kiểm duyệt nội dung", "Biên tập bài viết", "Điều hành", "Toàn quyền", "Chỉ để nhận diện"). Bấm một mẫu chỉ điền sẵn các ô, người dùng vẫn bỏ hoặc thêm từng quyền được. Mẫu nằm ở `PRESETS`.
- Quyền chia theo mục, mỗi mục có nút "Chọn hết" hoặc "Bỏ hết" và các ô riêng cho từng hành động.
- Ô bị tắt khi người xem không giữ quyền đó, vì không ai cấp được quyền mình không có. Quyền đã có sẵn trong vai trò vẫn được gửi lại (ô ẩn) để không bị bỏ, và mẫu không động vào những quyền này.
- Nếu người xem giữ `administrator`, có thêm ô "Quản trị viên".

## Màu

Backend nhận mọi mã `#rrggbb`, nhưng Tailwind chỉ dựng lớp viết đủ trong mã và dự án không dùng `style`, nên giao diện chỉ cho chọn trong bảng 8 màu cố định (`ROLE_COLORS`). Màu lạ hiện như màu mặc định.

## Trang thành viên

`MemberRolePicker` là menu hộp chọn đặt toàn bộ vai trò của một thành viên (`PUT .../members/{user_id}/roles`). Chỉ hiện khi người xem giữ `roles.assign`, thành viên không phải chủ sở hữu hoặc chính mình, và mọi vai trò của họ đều `below_you`. Menu chỉ liệt kê vai trò người xem được cấp.
