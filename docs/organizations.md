# Tổ chức và thành viên

Tài liệu này mô tả giao diện phần tổ chức. Quy tắc nghiệp vụ và API nằm trong tài liệu của backend, `amigoact-be/docs/organizations.md`.

## Các trang

Các trang nằm trong `src/app/(app)/organizations/`.

| Đường dẫn | Nội dung | Ai xem được |
| ---- | ---- | ---- |
| `/organizations` | Tổ chức của bạn và danh bạ có tìm kiếm | Mọi người |
| `/organizations/new` | Form tạo tổ chức | Đã đăng nhập |
| `/organizations/[slug]` | Giới thiệu và liên hệ | Mọi người |
| `/organizations/[slug]/members` | Thành viên, đổi vai trò, xóa thành viên | Thành viên |
| `/organizations/[slug]/applications` | Duyệt yêu cầu tham gia | Ban quản trị |
| `/organizations/[slug]/settings` | Sửa hồ sơ tổ chức | Ban quản trị |

Thanh mục trong header chỉ hiện những trang người xem được phép mở. Backend vẫn là nơi kiểm tra quyền thật.

## Luồng dữ liệu

- `src/lib/organizationApi.ts` đọc dữ liệu trên server. Mỗi nơi đọc phải nằm sau một `<Suspense>`, vì dữ liệu phụ thuộc phiên đăng nhập hoặc tham số đường dẫn.
- `src/app/_actions/organizations.ts` chứa các Server Action. Sau khi thành công, action làm mới toàn bộ layout, vì header, thanh bên và các danh sách đều hiển thị trạng thái thành viên.
- `authedFetch` trong `src/lib/auth.ts` dùng chung cho các action. Khi backend trả 401, hàm này xóa cookie và chuyển về trang đăng nhập.

## Thành phần

- `ActionButton` chạy một Server Action và hiện lỗi ngay cạnh nút. Truyền `confirmLabel` để yêu cầu bấm xác nhận lần hai.
- `MembershipAction` chọn nút theo trạng thái của người xem: tham gia, xin tham gia, rút yêu cầu, rời tổ chức.
- `OrganizationForm` dùng cho cả tạo và sửa. Form chia bốn mục: thông tin chung, ảnh, liên hệ, pháp lý. Lúc tạo và lúc sửa đều có đủ các mục, chỉ khác là khi sửa form điền sẵn giá trị đã lưu.
- `PictureField` là ô chọn ảnh: xem trước ảnh, kiểm tra dung lượng 5 MB ngay trên trình duyệt, và có ô "Gỡ ảnh hiện tại" khi đã có ảnh.
- `OrganizationLegalFields` là các trường pháp lý. Form không bao giờ gửi `legal_status`, vì trạng thái này do quản trị nền tảng đặt.
- `OrgHeader` hiển thị logo, ảnh bìa và trạng thái pháp lý. Chỉ trạng thái "Đã xác minh" có màu xanh.
- `SelectMenu` thay cho thẻ `<select>` mặc định. Menu hiện bằng hiệu ứng mờ dần và trượt nhẹ, tắt khi người dùng bật "giảm chuyển động". Bàn phím: mũi tên lên xuống để chọn, Enter hoặc Space để xác nhận, Escape để đóng. Giá trị gửi đi qua một input ẩn có cùng `name`.
- Trường bắt buộc có dấu `*` màu teal sau nhãn (`TextField` với `required`). Form có trường bắt buộc hiển thị chú thích "Trường bắt buộc" ở đầu, bằng `RequiredLegend`.

## Ảnh

- Ảnh không đi thẳng từ trình duyệt tới backend. Form gửi file lên Server Action, action chuyển tiếp lên `POST /media` bằng `readPicture` trong `src/lib/pictures.ts`, rồi gửi `logo_asset_id` hoặc `cover_asset_id` cho backend.
- `next.config.ts` đặt `serverActions.bodySizeLimit` là 6 MB. Mặc định của Next.js chỉ là 1 MB, nên ảnh 5 MB sẽ bị từ chối nếu thiếu cấu hình này.
- Ảnh hiển thị qua `src/app/media/[id]/file/route.ts`. Route này chỉ nhận ID dạng UUIDv7 và chuyển tiếp tới `GET /media/{id}/file` của backend, nên trình duyệt không gọi backend trực tiếp. Ảnh riêng trả về 404.
- `src/lib/pictureRules.ts` chứa các quy tắc dùng chung: định dạng JPEG, PNG hoặc WEBP, dung lượng tối đa 5 MB, và kiểm tra ID.

## Kiểm tra dữ liệu

Trình duyệt kiểm tra trước để phản hồi nhanh, backend kiểm tra lại toàn bộ.

- `src/lib/validation.ts` kiểm tra tên tổ chức và website. Các trường khác dùng lại quy tắc của tài khoản.
- `src/lib/forms.ts` dịch mã lỗi của backend sang tiếng Việt và gắn lỗi vào đúng trường.
- Khi thêm mã lỗi mới ở backend, hãy thêm bản dịch vào `ERROR_MESSAGES` hoặc `ISSUE_MESSAGES`.

## Chưa có

- Quy trình xác minh pháp lý của quản trị nền tảng. Hiện mọi tổ chức đều ở trạng thái "Chưa xác minh", và chưa có giao diện nào để đổi trạng thái đó.
- Ảnh đại diện của người dùng và ảnh bìa của hoạt động. Hai phần này dùng cùng luồng tải ảnh nhưng chưa làm trên giao diện.
