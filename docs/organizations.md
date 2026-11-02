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
- `OrganizationForm` dùng cho cả tạo và sửa. Khi sửa, form hiện thêm các trường liên hệ.

## Kiểm tra dữ liệu

Trình duyệt kiểm tra trước để phản hồi nhanh, backend kiểm tra lại toàn bộ.

- `src/lib/validation.ts` kiểm tra tên tổ chức và website. Các trường khác dùng lại quy tắc của tài khoản.
- `src/lib/forms.ts` dịch mã lỗi của backend sang tiếng Việt và gắn lỗi vào đúng trường.
- Khi thêm mã lỗi mới ở backend, hãy thêm bản dịch vào `ERROR_MESSAGES` hoặc `ISSUE_MESSAGES`.

## Chưa có

Trang chưa có ảnh đại diện và ảnh bìa tổ chức, vì chưa làm phần tải tệp. Số hoạt động và giờ tình nguyện sẽ thêm cùng các phần đó.
