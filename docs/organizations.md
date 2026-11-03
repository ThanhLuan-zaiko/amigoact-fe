# Tổ chức và thành viên

Tài liệu này mô tả giao diện phần tổ chức. Quy tắc nghiệp vụ và API nằm trong tài liệu của backend, `amigoact-be/docs/organizations.md`.

## Các trang

Các trang nằm trong `src/app/(app)/organizations/`.

| Đường dẫn | Nội dung | Ai xem được |
| ---- | ---- | ---- |
| `/organizations` | Hai cột: tổ chức của tôi (chỉ tổ chức sở hữu) và thùng rác (tổ chức đã xóa, có nút khôi phục), cùng một cột bên. Danh bạ gọi API với `exclude_owned=true`, nên không lặp lại tổ chức đã sở hữu và mỗi trang vẫn đủ số thẻ. Không sở hữu và không có gì trong thùng rác thì chỉ còn một cột | Mọi người (thùng rác: chủ sở hữu) |
| `/organizations/new` | Form tạo tổ chức, hai cột từ xl | Đã đăng nhập |
| `/organizations/[slug]` | Giới thiệu và liên hệ bên trái, bộ sưu tập bên phải từ xl | Mọi người |
| `/organizations/[slug]/members` | Thành viên, đổi vai trò, xóa thành viên. Từ xl hiện hai cột | Thành viên |
| `/organizations/[slug]/applications` | Duyệt yêu cầu tham gia. Từ xl hiện hai cột | Ban quản trị |
| `/organizations/[slug]/settings` | Sửa hồ sơ tổ chức. Form hồ sơ chia hai cột từ `xl`, ảnh và quy tắc giờ nằm cạnh nhau bên dưới. Chủ sở hữu còn thấy mục "Xóa tổ chức" ở cuối, rộng cả hai cột | Ban quản trị (xóa: chủ sở hữu) |

Thanh mục trong header chỉ hiện những trang người xem được phép mở. Backend vẫn là nơi kiểm tra quyền thật.

## Luồng dữ liệu

- `src/lib/organizationApi.ts` đọc dữ liệu trên server. Mỗi nơi đọc phải nằm sau một `<Suspense>`, vì dữ liệu phụ thuộc phiên đăng nhập hoặc tham số đường dẫn.
- `src/app/_actions/organizations.ts` chứa các Server Action. Sau khi thành công, action làm mới toàn bộ layout, vì header, thanh bên và các danh sách đều hiển thị trạng thái thành viên.
- `authedFetch` trong `src/lib/auth.ts` dùng chung cho các action. Khi backend trả 401, hàm này xóa cookie và chuyển về trang đăng nhập.

## Thành phần

- `ActionButton` chạy một Server Action và hiện lỗi ngay cạnh nút. Truyền `confirmLabel` để yêu cầu bấm xác nhận lần hai.
- `MembershipAction` chọn nút theo trạng thái của người xem: tham gia, xin tham gia, rút yêu cầu, rời tổ chức.
- `HeaderSearch` đổi theo trang: ở `/organizations` thanh tìm kiếm trên header tìm tổ chức, các trang khác tìm hoạt động. Điện thoại không có ô trên header, nên nút kính lúp nhảy đến ô tìm trong trang.
- `OrganizationForm` dùng cho cả tạo và sửa. Form chia bốn mục: thông tin chung, ảnh, liên hệ, pháp lý. Lúc tạo và lúc sửa đều có đủ các mục. Khi sửa, form điền sẵn giá trị đã lưu. Khi tạo, email và số điện thoại được điền sẵn từ tài khoản qua `contactDefaults`, kèm một dòng nhắc rằng chúng sẽ hiển thị công khai. Đây chỉ là bản sao: sửa được trước khi tạo và không đổi theo tài khoản về sau.
- `PictureField` là ô chọn ảnh: xem trước ảnh, kiểm tra dung lượng 5 MB ngay trên trình duyệt, và có ô "Gỡ ảnh hiện tại" khi đã có ảnh.
- `OrganizationLegalFields` là các trường pháp lý. Form không bao giờ gửi `legal_status`, vì trạng thái này do quản trị nền tảng đặt.
- `OrgHeader` hiển thị logo, ảnh bìa và trạng thái pháp lý. Chỉ trạng thái "Đã xác minh" có màu xanh.
- `SelectMenu` thay cho thẻ `<select>` mặc định. Menu hiện bằng hiệu ứng mờ dần và trượt nhẹ, tắt khi người dùng bật "giảm chuyển động". Bàn phím: mũi tên lên xuống để chọn, Enter hoặc Space để xác nhận, Escape để đóng. Giá trị gửi đi qua một input ẩn có cùng `name`.
- Trường bắt buộc có dấu `*` màu teal sau nhãn (`TextField` với `required`). Form có trường bắt buộc hiển thị chú thích "Trường bắt buộc" ở đầu, bằng `RequiredLegend`.

## Ảnh

- Ảnh không đi thẳng từ trình duyệt tới backend. Form gửi file lên Server Action, action chuyển tiếp lên `POST /media` bằng `readPicture` trong `src/lib/pictures.ts`, rồi gửi `logo_asset_id` hoặc `cover_asset_id` cho backend.
- `next.config.ts` đặt `serverActions.bodySizeLimit` là 6 MB. Mặc định của Next.js chỉ là 1 MB, nên ảnh 5 MB sẽ bị từ chối nếu thiếu cấu hình này.
- Thẻ "Tổ chức của tôi" (`OwnedOrganizationCard`) hiện ảnh bìa ở trên và logo bên cạnh tên. Chưa có ảnh thì hiện chữ cái đầu của tên tổ chức.
- Ảnh hiển thị qua `src/app/media/[id]/file/route.ts`. Route này chỉ nhận ID dạng UUIDv7 và chuyển tiếp tới `GET /media/{id}/file` của backend, nên trình duyệt không gọi backend trực tiếp. Ảnh riêng trả về 404.
- `src/lib/pictureRules.ts` chứa các quy tắc dùng chung: định dạng JPEG, PNG hoặc WEBP, dung lượng tối đa 5 MB, và kiểm tra ID.

## Kiểm tra dữ liệu

Trình duyệt kiểm tra trước để phản hồi nhanh, backend kiểm tra lại toàn bộ.

- `src/lib/validation.ts` kiểm tra tên tổ chức và website. Các trường khác dùng lại quy tắc của tài khoản.
- `src/lib/forms.ts` dịch mã lỗi của backend sang tiếng Việt và gắn lỗi vào đúng trường.
- Khi thêm mã lỗi mới ở backend, hãy thêm bản dịch vào `ERROR_MESSAGES` hoặc `ISSUE_MESSAGES`.

## Bộ sưu tập

`GalleryManager` ở trang cài đặt nhận kéo thả hoặc chọn nhiều tệp, tải lần lượt từng tệp qua `/media/upload` rồi gắn vào tổ chức. Tệp 50 MB vượt giới hạn của Server Action nên phải đi qua route này. Route chỉ nhận yêu cầu cùng origin và token vẫn nằm trong cookie. `/media/[id]/file` chuyển tiếp header `Range` để tua được video. `OrganizationGallery` hiển thị ở trang giới thiệu. Form tạo cũng có `CreateGalleryField`: chọn ảnh hoặc video tải lên trước, mỗi tệp thành một `<input type="hidden" name="gallery_asset_id">`, và action gửi chúng thành `gallery_asset_ids` cùng lúc với logo và ảnh bìa. Khi đang tải lên, nút tạo tổ chức chưa bị chặn, nên người dùng nên đợi xong rồi mới bấm. `PictureField` (logo, ảnh bìa) cũng nhận kéo thả, mỗi ô một ảnh.

## Xóa và khôi phục

Mục "Xóa tổ chức" nằm ở cuối trang cài đặt, chỉ chủ sở hữu thấy. Code nằm trong `DeleteOrganizationPanel.tsx`.

- Nút xóa chỉ bật sau khi gõ đúng tên tổ chức. Đây là xác nhận trên giao diện. Quyền xóa thật do backend kiểm tra.
- Khi còn hoạt động ở trạng thái `published`, panel hiện số hoạt động còn mở và tắt nút xóa. `open_activity_count` trong chi tiết tổ chức cung cấp con số này. Backend vẫn trả 409 `organization_has_open_activities` nếu có ai bấm được khi dữ liệu đã cũ.
- Nút xóa dùng màu đỏ, vì đây là thao tác không hoàn tác được. Quy tắc màu trong `AGENTS.md` cho phép điều này cho các nút xóa không hoàn tác được.
- Sau khi xóa, action chuyển về `/organizations`. Địa chỉ cũ của tổ chức trả về 404, nên không có trang nào để khôi phục từ đó.

Khôi phục nằm ở mục "Thùng rác" trên trang `/organizations`, không nằm trong cài đặt. `DeletedOrganizations.tsx` gọi `getDeletedOrganizations()` và action `restoreOrganization`. Khôi phục có thể bị từ chối với `slug_taken` (đường dẫn cũ đã có người dùng) hoặc `organization_limit_reached` (đã đủ 5 tổ chức). Thông báo nằm trong `src/lib/forms.ts`.

## Phân trang

Mỗi trang có URL riêng dạng `?page=N`, trang đầu không có tham số. `PageLinks` hiện nút trang trước và sau, các số trang (trang đầu, trang cuối, các trang quanh trang hiện tại) và ô nhập để đi tới trang bất kỳ. Số trang tính từ `total` trong phản hồi của backend. Hàm thuần nằm trong `src/lib/pagination.ts`.

## Giới hạn tạo tổ chức

Trường bắt buộc khi tạo và sửa: tên, giới thiệu, email, số điện thoại, thành phố. Dấu `*` có màu đỏ.

Backend quyết định các giới hạn này, form chỉ hiện lỗi đã dịch: cần xác minh email (`email_not_verified`), tối đa 3 lần thử mỗi ngày (`rate_limited`), và sở hữu tối đa 5 tổ chức (`organization_limit_reached`).

## Chưa có

- Xóa vĩnh viễn tổ chức từ giao diện. Backend cũng chưa có API này.
- Quy trình xác minh pháp lý của quản trị nền tảng. Hiện mọi tổ chức đều ở trạng thái "Chưa xác minh", và chưa có giao diện nào để đổi trạng thái đó.
- Ảnh đại diện của người dùng và ảnh bìa của hoạt động. Hai phần này dùng cùng luồng tải ảnh nhưng chưa làm trên giao diện.
