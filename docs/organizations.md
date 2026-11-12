# Tổ chức và thành viên

Tài liệu này mô tả giao diện phần tổ chức. Quy tắc nghiệp vụ và API nằm trong tài liệu của backend, `amigoact-be/docs/organizations.md`.

## Các trang

Các trang nằm trong `src/app/(app)/organizations/`.

| Đường dẫn | Nội dung | Ai xem được |
| ---- | ---- | ---- |
| `/organizations` | Hai cột: tổ chức của tôi (chỉ tổ chức sở hữu) ở cột bên, danh bạ ở cột chính. Danh bạ gọi API với `exclude_owned=true`, nên không lặp lại tổ chức đã sở hữu và mỗi trang vẫn đủ số thẻ. Không sở hữu tổ chức nào thì chỉ còn một cột. Tổ chức đã xóa không hiện ở đây | Mọi người |
| `/organizations/new` | Form tạo tổ chức, hai cột từ xl | Đã đăng nhập |
| `/organizations/[slug]` | Tổng quan. Cột chính: giới thiệu, liên hệ và bài ghim (chưa ghim thì bài mới nhất). Cột phụ từ xl: hoạt động gần đây và bộ sưu tập (`OrgHighlights`) | Mọi người |
| `/organizations/[slug]/posts` | Bảng tin của tổ chức, xem `posts.md` | Mọi người, theo quyền xem |
| `/organizations/[slug]/members` | Thành viên, đổi vai trò, xóa thành viên. Từ xl hiện hai cột | Thành viên |
| `/trash` | Thùng rác của chính mình, có nút khôi phục và xóa vĩnh viễn. Mục "Thùng rác" trong thanh bên trái trỏ tới đây. Trang trống hiện "Thùng rác trống" | Đã đăng nhập |
| `/organizations/[slug]/applications` | Duyệt yêu cầu tham gia. Từ xl hiện hai cột | Ban quản trị |
| `/organizations/[slug]/settings` | Sửa hồ sơ tổ chức. Form hồ sơ chia hai cột từ `xl`, ảnh và quy tắc giờ nằm cạnh nhau bên dưới. Chủ sở hữu còn thấy mục "Đưa tổ chức vào thùng rác" ở cuối, rộng cả hai cột | Ban quản trị (xóa: chủ sở hữu) |

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
- `PicturePicker` là một ô tải ảnh chung cho logo và ảnh bìa: người dùng kéo thả hoặc chọn nhiều ảnh, mỗi ảnh tải ngay qua `/media/upload`, rồi bấm nút "Logo" hoặc "Ảnh bìa" dưới từng ảnh để chọn vai trò. Lựa chọn đi cùng form dưới dạng `logo_asset_id` và `cover_asset_id`. Logo và ảnh bìa đang dùng hiện kèm nhãn "Logo" hoặc "Ảnh bìa" (`CurrentPictures`), không còn ô "Gỡ": muốn đổi thì bấm "Đổi chỗ logo và ảnh bìa" hoặc chọn một ảnh trong bộ sưu tập. Ảnh tối đa 20 MB, kiểm tra ngay trên trình duyệt.
- `OrganizationLegalFields` là các trường pháp lý. Form không bao giờ gửi `legal_status`, vì trạng thái này do quản trị nền tảng đặt.
- `OrgHeader` hiển thị logo, ảnh bìa và trạng thái pháp lý. Chỉ trạng thái "Đã xác minh" có màu xanh.
- Ở các trang con của bảng tin (`/posts/{id}`, `/posts/{id}/edit`, `/posts/new`, `/posts/drafts`, `/posts/trash`), `OrgHeaderFrame` thay `OrgHeader` bằng một hàng gọn: nút quay lại, logo và tên tổ chức. Nút quay lại về bảng tin, riêng trang sửa bài về lại bài đó (`feedBackHref` trong `src/lib/orgBack.ts`).
- `SelectMenu` thay cho thẻ `<select>` mặc định. Menu hiện bằng hiệu ứng mờ dần và trượt nhẹ, tắt khi người dùng bật "giảm chuyển động". Bàn phím: mũi tên lên xuống để chọn, Enter hoặc Space để xác nhận, Escape để đóng. Giá trị gửi đi qua một input ẩn có cùng `name`.
- Trường bắt buộc có dấu `*` màu teal sau nhãn (`TextField` với `required`). Form có trường bắt buộc hiển thị chú thích "Trường bắt buộc" ở đầu, bằng `RequiredLegend`.

## Ảnh

- Ảnh không đi thẳng từ trình duyệt tới backend. Form gửi file lên Server Action, action chuyển tiếp lên `POST /media` bằng `readPicture` trong `src/lib/pictures.ts`, rồi gửi `logo_asset_id` hoặc `cover_asset_id` cho backend.
- Form chỉ gửi asset ID nên Server Action không còn mang tệp ảnh, và không cần nâng `serverActions.bodySizeLimit`.
- Thẻ "Tổ chức của tôi" (`OwnedOrganizationCard`) hiện ảnh bìa ở trên và logo bên cạnh tên. Chưa có ảnh thì hiện chữ cái đầu của tên tổ chức.
- Ảnh hiển thị qua `src/app/media/[id]/file/route.ts`. Route này chỉ nhận ID dạng UUIDv7 và chuyển tiếp tới `GET /media/{id}/file` của backend, nên trình duyệt không gọi backend trực tiếp. Ảnh riêng trả về 404.
- `src/lib/pictureRules.ts` chứa các quy tắc dùng chung: định dạng JPEG, PNG hoặc WEBP, dung lượng tối đa 20 MB, và kiểm tra ID.

## Kiểm tra dữ liệu

Trình duyệt kiểm tra trước để phản hồi nhanh, backend kiểm tra lại toàn bộ.

- `src/lib/validation.ts` kiểm tra tên tổ chức và website. Các trường khác dùng lại quy tắc của tài khoản.
- Ô số dùng `TextField` với `numeric="integer"`, `"decimal"` hoặc `"signed-decimal"`: bàn phím điện thoại hiện bàn phím số, và ô chặn ngay ký tự không phải số khi gõ. Trước khi gửi, `isPlainInteger` và `isPlainDecimal` từ chối `1e3`, ` 5`, `0x10`.
- `numberOrNull` chỉ đổi chuỗi số thường thành số. Chuỗi khác được gửi nguyên văn để backend từ chối rõ ràng (`int_type`, `number_invalid`), thay vì bị đọc sai thành một số khác.
- Lỗi sai kiểu số hiện thông báo về khoảng giá trị của trường, nếu có, hoặc câu chung "Chỉ nhập số".
- `src/lib/forms.ts` dịch mã lỗi của backend sang tiếng Việt và gắn lỗi vào đúng trường.
- Khi thêm mã lỗi mới ở backend, hãy thêm bản dịch vào `ERROR_MESSAGES` hoặc `ISSUE_MESSAGES`.

## Bộ sưu tập

`GalleryManager` ở trang cài đặt nhận kéo thả hoặc chọn nhiều tệp, tải lần lượt từng tệp qua `/media/upload` rồi gắn vào tổ chức. Tệp 50 MB vượt giới hạn của Server Action nên phải đi qua route này. Route chỉ nhận yêu cầu cùng origin và token vẫn nằm trong cookie. `/media/[id]/file` chuyển tiếp header `Range` để tua được video. `OrganizationGallery` hiển thị ở trang giới thiệu. Form tạo cũng có `CreateGalleryField`: chọn ảnh hoặc video tải lên trước, mỗi tệp thành một `<input type="hidden" name="gallery_asset_id">`, và action gửi chúng thành `gallery_asset_ids` cùng lúc với logo và ảnh bìa. Khi đang tải lên, nút tạo tổ chức chưa bị chặn, nên người dùng nên đợi xong rồi mới bấm. `PicturePicker` (logo, ảnh bìa) cũng nhận kéo thả nhiều ảnh. Ảnh tải vào `PicturePicker` mà không được chọn làm logo hay ảnh bìa không bị bỏ: mỗi ảnh gửi theo form thành `extra_picture_id` (`PictureInputs`), và action gộp chúng vào bộ sưu tập bằng `galleryIds` trong `src/lib/galleryIds.ts` (bỏ trùng, không bao giờ lấy logo hay ảnh bìa). Khi tạo tổ chức, chúng đi trong `gallery_asset_ids`. Ở trang cài đặt, sau khi lưu thông tin, action gọi `POST /organizations/{slug}/gallery` cho từng ảnh; gọi lại cùng ảnh không thêm lần hai. Bộ sưu tập đầy thì báo `gallery_full`.

Đổi logo và ảnh bìa chỉ cần một cú bấm, không cần tick "Gỡ" rồi lưu. Trong phần Ảnh của trang cài đặt, nút "Đổi chỗ logo và ảnh bìa" (`SwapPictures`) hoán đổi hai ảnh ngay. Mỗi ảnh trong bộ sưu tập có hai nút "Đặt làm logo" và "Đặt làm ảnh bìa" (`GalleryRoleButtons`); nút của vai trò ảnh đang giữ được tô viền xanh. Cả hai gọi action `chooseOrgPictures`, tức `PUT /organizations/{slug}/pictures`. Logo hay ảnh bìa bị thay tự vào bộ sưu tập, nên bấm lại là đổi về được. Mã asset của logo và ảnh bìa hiện tại được đọc từ URL `/media/{id}/file` bằng `assetIdFromUrl`.

Nút xóa một ảnh trong bộ sưu tập mở hộp thoại xác nhận, vì gỡ khỏi bộ sưu tập không hoàn tác được trên giao diện. Tệp vẫn còn trong kho cho đến khi script dọn dẹp chạy, nhưng không có nút nào để đưa lại. Hộp thoại là `ConfirmDialog` trong `src/app/_components/ConfirmDialog.tsx`, dùng thẻ `<dialog>` gốc của trình duyệt. Nút xác nhận màu đỏ, chỉ dùng cho thao tác không hoàn tác được.

## Xóa và khôi phục

Mục "Đưa tổ chức vào thùng rác" nằm ở cuối trang cài đặt, chỉ chủ sở hữu thấy. Code nằm trong `DeleteOrganizationPanel.tsx`. Đây là xóa mềm: backend chỉ đặt `deleted_at`, và chủ sở hữu khôi phục được trong thùng rác. Nhãn không dùng chữ "Xóa" một mình để người dùng không hiểu nhầm là xóa vĩnh viễn.

- Nút chỉ bật sau khi gõ đúng tên tổ chức. Đây là xác nhận trên giao diện. Quyền xóa thật do backend kiểm tra.
- Khi còn hoạt động ở trạng thái `published`, panel hiện số hoạt động còn mở và tắt nút. `open_activity_count` trong chi tiết tổ chức cung cấp con số này. Backend vẫn trả 409 `organization_has_open_activities` nếu có ai bấm được khi dữ liệu đã cũ.
- Nút dùng màu trung tính (`neutralButton` trong `ui.ts`), không dùng đỏ, vì thao tác khôi phục được từ thùng rác. Quy tắc trong `AGENTS.md` chỉ dành màu đỏ cho nút không hoàn tác được, ví dụ xóa ảnh khỏi bộ sưu tập. Trước đây nút này đỏ theo ví dụ "xóa tổ chức" trong quy tắc cũ, nhưng ví dụ đó không đúng sau khi xóa trở thành xóa mềm.
- Sau khi xóa, action chuyển về `/organizations`. Địa chỉ cũ của tổ chức trả về 404, nên không có trang nào để khôi phục từ đó.

Thùng rác chỉ hiện ở trang `/trash`, có mục "Thùng rác" trong thanh bên trái (`SideNav.tsx`). Tổ chức đã xóa không hiện ở `/organizations`, nên thùng rác là nơi duy nhất để khôi phục. Khôi phục không nằm trong cài đặt. Thanh dưới trên điện thoại (`MobileNav.tsx`) chưa có mục này.

Xóa vĩnh viễn nằm ngay cạnh nút khôi phục, trong thùng rác. `PurgeOrganizationButton.tsx` mở `ConfirmDialog` với ô nhập tên tổ chức. Nút đỏ "Xóa vĩnh viễn" chỉ bật khi tên khớp, và gọi `purgeOrganization` trong `src/app/_actions/organizations.ts`, tức `DELETE /organizations/mine/deleted/{org_id}` ở backend. Backend có thể từ chối với `organization_has_certificates` hoặc `organization_has_pending_hours`. Lỗi được hiện ngay trong hộp thoại, và tổ chức vẫn còn trong thùng rác. Chi tiết quy tắc nằm trong `amigoact-be/docs/organizations.md`, mục "Xóa vĩnh viễn". `DeletedOrganizations.tsx` gọi `getDeletedOrganizations()` và action `restoreOrganization`. Khôi phục có thể bị từ chối với `slug_taken` (đường dẫn cũ đã có người dùng) hoặc `organization_limit_reached` (đã đủ 5 tổ chức). Thông báo nằm trong `src/lib/forms.ts`.

## Phân trang

Mỗi trang có URL riêng dạng `?page=N`, trang đầu không có tham số. `PageLinks` hiện nút trang trước và sau, các số trang (trang đầu, trang cuối, các trang quanh trang hiện tại) và ô nhập để đi tới trang bất kỳ. Số trang tính từ `total` trong phản hồi của backend. Hàm thuần nằm trong `src/lib/pagination.ts`.

## Giới hạn tạo tổ chức

Trường bắt buộc khi tạo và sửa: tên, giới thiệu, email, số điện thoại, thành phố. Dấu `*` có màu đỏ.

Backend quyết định các giới hạn này, form chỉ hiện lỗi đã dịch: cần xác minh email (`email_not_verified`), tối đa 3 lần thử mỗi ngày (`rate_limited`), và sở hữu tối đa 5 tổ chức (`organization_limit_reached`).

## Chưa có

- Quy trình xác minh pháp lý của quản trị nền tảng. Hiện mọi tổ chức đều ở trạng thái "Chưa xác minh", và chưa có giao diện nào để đổi trạng thái đó.
- Ảnh đại diện của người dùng và ảnh bìa của hoạt động. Hai phần này dùng cùng luồng tải ảnh nhưng chưa làm trên giao diện.
