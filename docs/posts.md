# Bài viết

Bài viết nằm trong từng tổ chức, giống hoạt động. Backend mô tả ở `amigoact-be/docs/posts.md`.

## Các trang

Các trang nằm trong `src/app/(app)/organizations/[slug]/posts/`.

| Đường dẫn | Nội dung | Ai xem được |
| ---- | ---- | ---- |
| `/organizations/[slug]/posts` | Bảng tin của tổ chức, lọc Tất cả, Thông báo, Thảo luận, Đã ghim (`?filter=`), trang tiếp bằng `?before=`. Từ xl hiện hai cột | Mọi người, theo quyền xem |
| `/organizations/[slug]/posts/new` | Tạo bài, thay cho `/compose` cũ | Thành viên đang hoạt động |
| `/organizations/[slug]/posts/[postId]` | Chi tiết bài, nút sửa, ghim, xóa và bình luận | Theo quyền xem |
| `/organizations/[slug]/posts/[postId]/edit` | Sửa bài hoặc bản nháp | Tác giả |
| `/organizations/[slug]/posts/drafts` | Bản nháp của tôi trong tổ chức này | Đã đăng nhập |
| `/organizations/[slug]/posts/trash` | Thùng rác bài viết | Ban quản trị |
| `/drafts` | Bản nháp ở mọi tổ chức | Đã đăng nhập |
| `/compose` | Chỉ chuyển hướng: có đúng một tổ chức đăng được thì mở form của tổ chức đó, còn lại về `/organizations` | Đã đăng nhập |

- Tab "Bảng tin" nằm ngay sau "Giới thiệu" trong `OrgNav`.
- Nút "Tạo bài" trên header (`ComposeMenu`) liệt kê các tổ chức bạn đăng bài được. Chỉ có một thì mở thẳng form, chưa có thì dẫn tới `/organizations`.
- `src/lib/protectedPaths.ts` liệt kê các trang cần đăng nhập. `proxy.ts` dùng nó để chuyển khách sang `/login`. Bảng tin và bài công khai vẫn mở cho khách. Mỗi trang vẫn tự gọi `requireUser`.
- Trang chi tiết kiểm tra `postId` là UUIDv7 (`isPostId`) và bài thuộc đúng tổ chức trên đường dẫn, sai thì trả 404.

## Form bài viết

- `PostForm` (`src/app/_components/posts/PostForm.tsx`) dùng cho cả tạo và sửa. Tổ chức lấy từ đường dẫn: action được gắn sẵn bằng `createPost.bind(null, slug)`, nên form không còn ô "Đăng dưới".
- Chip "Thông báo" chỉ hiện với ban quản trị (`postKinds`). Khi sửa, loại bài bị khóa vì backend không cho đổi.
- Tên ô nhập là `post_title`, `post_body`, `post_tags`. `renameIssueField` đổi tên trường lỗi từ backend về các tên này.
- Thẻ dùng `TagInput` (`src/app/_components/compose/TagInput.tsx`) dạng chip. Enter hoặc dấu phẩy biến chữ thành chip, Backspace khi ô trống bỏ chip cuối, dán `a, b, c` thì tách thành ba chip. Đủ 5 thẻ thì ô chỉ còn đọc. Hai tên cùng slug (`tagSlug` trong `src/lib/tagInput.ts`, giống backend) chỉ giữ một.
- Form gửi ô ẩn `post_tags`, nối các chip bằng dấu phẩy, kèm cả chữ còn đang gõ dở, nên Server Action và `parseTags` không đổi.
- Gợi ý lấy từ Server Action `searchPostTags` (`src/app/_actions/postTags.ts`), gọi `GET /organizations/{slug}/post-tags`. `useTagSuggestions` chờ 200ms sau khi gõ, nhớ kết quả theo slug và bỏ câu trả lời đến muộn. Khi chữ đang gõ chưa có trong tổ chức, hàng đầu tiên là "Tạo thẻ". Lỗi mạng chỉ làm mất gợi ý, không chặn việc gõ.
- Tạo bài có hai nút: lưu nháp (`intent=draft`) và đăng (`intent=publish`). Sửa bản nháp cũng có hai nút đó. Sửa bài đã đăng chỉ có "Lưu thay đổi".
- Đăng xong thì chuyển tới trang chi tiết của bài.

## Xóa mềm và xóa cứng

| Đối tượng | Nút | Kết quả |
| ---- | ---- | ---- |
| Bản nháp | Thùng rác trên bản nháp, có hộp xác nhận | Xóa cứng, không khôi phục được |
| Bài đã đăng | Thùng rác trên trang chi tiết, có hộp xác nhận | Vào thùng rác 30 ngày |
| Bài trong thùng rác | "Khôi phục" | Quay lại bảng tin |
| Bài trong thùng rác | "Xóa vĩnh viễn", chỉ chủ sở hữu thấy | Hộp xác nhận khóa nút cho tới khi gõ lại đúng tiêu đề (`purgeConfirmed`) |
| Bình luận | Thùng rác, bấm xác nhận lần hai | Xóa mềm: hiện "Bình luận đã bị xóa." |
| Bình luận đã xóa | "Khôi phục", chỉ ban quản trị thấy | Hiện lại nội dung |

`ConfirmAction` là nút icon mở `ConfirmDialog` rồi chạy Server Action. Truyền `typeToConfirm` để bắt gõ lại một chuỗi trước khi mở khóa nút.

## Ẩn bài

- Ban quản trị thấy nút con mắt gạch (`can_hide`) trên thẻ bài và trang chi tiết. Bấm để ẩn bài khỏi bảng tin, bấm lại để hiện. Không cần xác nhận vì làm lại được ngay.
- Bài ẩn chỉ ban quản trị thấy, có nhãn vàng "Đã ẩn" ở đầu thẻ. Người khác không thấy bài và mở link nhận 404.
- Action là `setHidden` trong `src/app/_actions/posts.ts`. Chi tiết quy tắc ở `docs/posts.md` của backend.

## Bình luận

- `CommentSection` đọc bình luận trên server. `CommentItem` hiện từng bình luận với nút sửa, xóa, khôi phục theo cờ `can_edit`, `can_delete`, `can_restore` của backend.
- Sửa bình luận ngay tại chỗ bằng `CommentForm`. Backend chỉ cho sửa trong 15 phút sau khi viết.
- Ô nhập tên là `comment_body`, 1 đến 1000 ký tự (`validateComment`).
- Server Action nằm trong `src/app/_actions/comments.ts`.

## Kiểm tra dữ liệu

- Trình duyệt kiểm tra trước bằng `validatePost`: tiêu đề 1 đến 160 ký tự và phải có ít nhất một chữ cái (`hasLetter`), nên "2024" bị từ chối. Nội dung tối đa 5000 ký tự, tối đa 5 thẻ.
- Backend kiểm tra lại. Các mã `text_needs_letter`, `bool_type`, `post_not_in_trash`, `comment_edit_expired`, `comment_not_deleted` được dịch trong `src/lib/forms.ts`.

## Trang chủ

- `/` đọc `GET /feed` (tab "Dành cho bạn") hoặc `GET /feed/public` (tab "Công khai") theo `?tab=`. Khách luôn thấy tab công khai.
- Mục "Thẻ phổ biến" lấy từ `GET /feed/popular-tags`. Mỗi thẻ dẫn tới `/?tab=public&tag=<slug>`.

## Lọc theo thẻ

- Thẻ trên `PostCard` dẫn tới `/organizations/[slug]/posts?tag=<slug>` (`orgTagHref` trong `src/lib/tagLinks.ts`). Slug tính bằng `tagSlug`, giống backend.
- Trang bài của tổ chức và trang chủ đọc `?tag=` bằng `readTag` rồi gửi cho backend. Lọc loại bài, đổi tab và "Xem bài cũ hơn" đều giữ thẻ (`listQuery`).
- Khi đang lọc, `TagFilterBar` hiện thẻ ở đầu danh sách, kèm nút × để bỏ lọc. Tên hiện là tên mà bài trên trang dùng (`tagLabel`), không có bài nào thì hiện slug. Danh sách trống thì báo "Chưa có bài với thẻ này".
- Tiêu đề bài trên thẻ dẫn tới trang chi tiết. Tên tổ chức dẫn tới trang tổ chức.

## Gắn bài với hoạt động

- Form bài có ô "Hoạt động liên quan" (`SelectMenu`, trường `activity_id`). Danh sách lấy từ `getLinkableActivities` trong `src/lib/activityApi.ts`: hoạt động đã đăng hoặc đã kết thúc của tổ chức, mới nhất trước. Tổ chức chưa có hoạt động nào như vậy thì ô này ẩn đi.
- Khi sửa bài, hoạt động đang gắn luôn có trong danh sách, kể cả khi đã bị hủy (`activityOptions` trong `src/lib/postActivity.ts`). Chọn "Không gắn hoạt động" thì gửi `null` và bỏ gắn.
- Bài có hoạt động hiện `PostActivityRow` ở cuối bài: tên hoạt động (link tới `/activities/[id]`), giờ, địa điểm, số chỗ. Đây là một phần của bài, ngăn bằng đường kẻ, không phải thẻ lồng trong thẻ.
- Nút "Đăng ký" (hoặc "Vào hàng chờ" khi hết chỗ) chỉ hiện khi hoạt động đã đăng và chưa qua hạn đăng ký (`canSignUp`). Nút dẫn tới trang hoạt động, nơi kiểm tra mọi quy tắc đăng ký. Hết hạn thì hiện "Đã đóng đăng ký", hoạt động đã kết thúc hoặc đã hủy thì hiện trạng thái.
- Mã lỗi `activity_not_linkable` hiện màu đỏ dưới ô chọn hoạt động.

## Định dạng nội dung

Nội dung lưu dạng văn bản thuần. Thanh công cụ chèn các dấu sau, `PostBody` hiển thị lại bằng React (không dùng HTML thô, nên không chèn mã được):

| Nút | Dấu | Kết quả |
| ---- | ---- | ---- |
| Tiêu đề | `## ` đầu dòng | Tiêu đề nhỏ |
| Trích dẫn | `> ` đầu dòng | Khối trích dẫn |
| Danh sách | `- ` đầu dòng | Danh sách chấm |
| Đường kẻ | dòng `---` | Đường phân cách |
| Ảnh, Video | dòng `[media:<id>]` | Ảnh hoặc video đặt đúng chỗ đó |

Bấm lại nút lên các dòng đã có dấu thì gỡ dấu. Code ở `src/lib/postFormat.ts`.

## Ảnh và video

- Nút "Ảnh" và "Video" mở hộp chọn tệp. Mỗi tệp tải lên ngay qua `/media/upload` và đi kèm form dưới dạng `media_id`. Ảnh JPEG, PNG, WEBP tối đa 20 MB, video MP4, WEBM tối đa 50 MB, tổng cộng tối đa 10 tệp mỗi bài.
- Tệp vừa tải lên được chèn ngay vào vị trí con trỏ trong nội dung, thành một dòng `[media:<id>]`, giống chèn ảnh khi viết báo. Nút "Chèn vào vị trí con trỏ" dưới mỗi tệp chèn lại tệp đó ở chỗ khác. Gỡ tệp thì các dòng đặt tệp đó cũng bị xóa. Code ở `src/lib/postMedia.ts`.
- Khi hiển thị, tệp được đặt trong nội dung hiện tại chỗ đó (giữ tỉ lệ gốc). Tệp đính kèm mà nội dung không đặt thì hiện thành lưới ở cuối bài, nên bài cũ vẫn hiện như trước. Dòng đặt một tệp mà bài không còn đính kèm thì không hiện gì. Backend không cần đổi: dấu đặt tệp chỉ là văn bản, và tệp vẫn đi qua `media_ids`.
- Khi sửa bài, `MediaField` hiện sẵn các tệp bài đang có. Gỡ một tệp rồi lưu thì backend thay cả danh sách.
- Backend không cho bài chỉ dành cho thành viên có ảnh hoặc video. Thảo luận mặc định là chỉ thành viên, nên muốn có tệp phải chọn "Công khai". Form báo lỗi đỏ trước khi gửi (`effectiveVisibility`).
- Tệp của bản nháp còn riêng tư. `/media/[id]/file` gửi kèm token của người xem, nên tác giả xem được tệp nháp của mình, người khác nhận 404. Route chuyển tiếp cả `Range` để video tua được.

## Chưa làm

- Tab "Đang theo dõi" ở trang chủ, vì backend chưa có việc theo dõi tổ chức.
