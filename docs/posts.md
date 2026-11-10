# Đăng bài

Trang `/compose` cho người đăng nhập tạo bài viết hoặc lưu nháp. Backend mô tả ở `amigoact-be/docs/posts.md`.

## Quyền vào trang

- `src/proxy.ts` chuyển khách chưa đăng nhập sang `/login?next=/compose`.
- `src/app/(app)/compose/page.tsx` gọi `requireUser("/compose")` sau Suspense, nên trang vẫn an toàn khi proxy bị bỏ qua.

## Form

- `ComposeForm` là client component dùng `useAccountForm`, nên nội dung đã gõ không mất khi server từ chối.
- Ô "Đăng dưới" chỉ liệt kê tổ chức mà người dùng là thành viên đang hoạt động. Với loại "Thông báo", chỉ còn tổ chức mà họ là chủ sở hữu hoặc quản trị viên (`postableOrganizations` trong `src/lib/posts.ts`).
- Tên ô nhập là `post_title`, `post_body`, `post_tags`, vì `title` đã có quy tắc riêng của hoạt động. `renameIssueField` đổi tên trường lỗi từ backend về các tên này.
- Thẻ nhập cách nhau bằng dấu phẩy, tối đa 3 thẻ, mỗi thẻ tối đa 40 ký tự.
- Hai nút gửi cùng form: `intent=draft` (lưu nháp) và `intent=publish` (đăng bài).

## Lỗi

- Trình duyệt kiểm tra trước bằng `validatePost`, hiện chữ đỏ dưới từng ô.
- Backend kiểm tra lại. Mã lỗi `too_many_tags`, `tag_invalid`, `members_post_has_no_media`, `post_forbidden` được dịch trong `src/lib/forms.ts`.

## Sau khi gửi

- Đăng bài: chuyển về trang chủ.
- Lưu nháp: ở lại trang, hiện thông báo thành công và xóa form.

## Định dạng nội dung

Nội dung lưu dạng văn bản thuần. Thanh công cụ chèn các dấu sau, `PostBody` hiển thị lại bằng React (không dùng HTML thô, nên không chèn mã được):

| Nút | Dấu | Kết quả |
| ---- | ---- | ---- |
| Tiêu đề | `## ` đầu dòng | Tiêu đề nhỏ |
| Trích dẫn | `> ` đầu dòng | Khối trích dẫn |
| Danh sách | `- ` đầu dòng | Danh sách chấm |
| Đường kẻ | dòng `---` | Đường phân cách |

Bấm lại nút lên các dòng đã có dấu thì gỡ dấu. Code ở `src/lib/postFormat.ts`.

## Ảnh và video

- Nút "Ảnh" và "Video" mở hộp chọn tệp. Mỗi tệp tải lên ngay qua `/media/upload` và đi kèm form dưới dạng `media_id`. Ảnh JPEG, PNG, WEBP tối đa 20 MB, video MP4, WEBM tối đa 50 MB, tổng cộng tối đa 10 tệp mỗi bài.
- Backend không cho bài chỉ dành cho thành viên có ảnh hoặc video. Thảo luận mặc định là chỉ thành viên, nên muốn có tệp phải chọn "Công khai". Form báo lỗi đỏ trước khi gửi (`effectiveVisibility`).
- Tệp của bản nháp còn riêng tư. `/media/[id]/file` gửi kèm token của người xem, nên tác giả xem được tệp nháp của mình, người khác nhận 404. Route chuyển tiếp cả `Range` để video tua được.
- `PostCard` hiển thị ảnh bằng `<img>` và video bằng `<video controls>`.

## Bản nháp

- `/drafts` (cần đăng nhập) liệt kê bản nháp của bạn ở mọi tổ chức bạn là thành viên đang hoạt động, mới nhất trước (`getMyDrafts`).
- Nút "Đăng bài" trên mỗi bản nháp gọi `POST /posts/{id}/publish` rồi chuyển về trang chủ. Mục "Bản nháp" nằm ở thanh bên.

## Chưa làm

- Sửa và xóa bản nháp, vì giao diện chưa có.
- Bảng tin trang chủ vẫn chưa nối backend, nên bài đã đăng chưa hiện ở đó.
