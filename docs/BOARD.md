# Bảng tin bài viết — `workspace/`

Không gian viết/đọc bài của tổ chức: lưới bài kiểu báo, editor dạng block
(chèn ảnh/video ở bất kỳ vị trí nào), nháp riêng tư và thùng rác với đầy đủ
vòng đời xóa mềm/khôi phục/xóa cứng giống `/manage/orgs`. Đối chiếu API và
vòng đời ở `docs/BOARD.md` của backend. Chat chung module `workspace/` nhưng
tách file (`api.ts` + `hooks.ts` giữ chat và re-export board).

## 1. Module layout

| File | Vai trò |
|---|---|
| `board-api.ts` | Hợp đồng bài viết (`OrgPost`, `ArticleBlock`, `PostPage`) + hàm API (feed, drafts, trash, detail, CRUD, lifecycle, comments) |
| `board-hooks.ts` | TanStack Query: `useOrgPosts` (paged), `usePostShelf` (drafts/trash), `useOrgPost`, mutation lifecycle, comments (infinite) |
| `api.ts` / `hooks.ts` | Chat giữ nguyên; `export *` từ board module để import cũ không vỡ |
| `keys.ts` | Mọi key bảng tin nằm dưới `["workspace","posts",orgId]` nên một prefix invalidate phủ feed + detail + drafts + trash |
| `article.ts` | Pure helpers: `EditorBlock` (kèm React key), convert bài legacy `body`+media thành blocks, `coverUrl`, `excerpt`, `wordCount`, `cleanBlocks` |
| `editor-hooks.ts` | `useArticleEditor` — toàn bộ state editor: blocks, cover, upload inline (role `attachment`), pipeline Lưu nháp/Đăng bài |
| `messages.tsx` | Copy tiếng Việt + `postEventToast` cho realtime |

## 2. Trang `/manage/board` (`board-page.tsx`)

`WorkspaceOrgBar` chọn org (deep-link `?org=`) kèm nút `Viết bài`. Ba tab nằm
trên `?tab=` (`published` mặc định, `draft`, `trash`) nên deep-link được.

- **Đã đăng**: `FeedShelf` render rail ghim (`ArticleCard featured` full
  width) rồi lưới `ArticleCard` 3 cột (`lg:col-span-4`): cover, badge
  `Thông báo`, title, excerpt, tác giả + giờ + `x phút đọc` + số bình luận.
  Lọc kind qua `?kind=` (discussion/announcement). Phân trang số trang qua
  `?page=` + `PostPage.total` — `Pagination` giống `/manage/orgs`; `pinned[]`
  chỉ kèm ở trang 1, đổi tab/kind reset về trang 1.
- **Nháp**: `ShelfCard` liệt kê `ArticleRow` từ `GET .../posts/drafts`
  (chỉ bài của mình). Nút `Viết tiếp` mở editor, `Đăng bài` publish tại
  chỗ, `Xóa` đưa vào thùng rác.
- **Thùng rác**: cùng `ShelfCard` với `GET .../posts/trash` (member thấy
  bài mình, manager thấy hết). Hành động `Khôi phục` + `Xóa vĩnh viễn`
  xác nhận 2 bước (lần 1 đổi viền đỏ + nhãn `Bấm lại để xóa vĩnh viễn`,
  lần 2 mới gọi `DELETE ?hard=true`) — đúng pattern `OrgCardActions`.

`ArticleActions.tsx` gom nút theo shelf + quyền (`mine` = tác giả,
`canManage`/`canAnnounce` từ `viewer_permissions`):

| Shelf | Nút |
|---|---|
| Đã đăng | `Đọc`, `Sửa` (tác giả), `Ghim`/`Bỏ ghim` (manager), `Về nháp` (tác giả), `Xóa` (tác giả/manager) |
| Nháp | `Viết tiếp`, `Đăng bài` (khóa nếu announcement mà thiếu `post:announce`), `Xóa` |
| Thùng rác | `Khôi phục`, `Xóa vĩnh viễn` (2 bước) |

Mọi mutation invalidate `[workspace,"posts"]` + `[workspace,"comments"]`;
`useBoardRealtime` subscribe `posts:{orgId}` và toast các action của người
khác (`post.created/.updated/.deleted/.pinned/.unpinned/.unpublished/.restored/.purged`).

## 3. Trang `/manage/board/write` (`write-page.tsx`)

`?org=` bắt buộc như board; `?post=<id>` mở bài/nháp đã có (GET detail —
nháp chỉ tác giả đọc được). `ArticleEditor` keyed theo `org:post` nên đổi
org/post reset state sạch; realtime refetch detail không ghi đè bản đang
gõ vì `initial` chỉ đọc lúc mount.

Layout 2 cột: cột trái (`lg:col-span-8`) tiêu đề + danh sách block, cột
phải (`lg:col-span-4`) `PublishPanel`.

- `BlockInserter`: nút `+` ở đường nối giữa hai block (đầu bài và sau mỗi
  block) mở menu loại khối. Chọn `Ảnh`/`Video` mở file input ẩn — file hợp
  lệ (`isSupportedMedia` + đúng family) tạo block rỗng rồi upload nối tiếp
  vào đúng vị trí; file lỗi báo `UNSUPPORTED_MEDIA`.
- `BlockEditor`: header nhỏ (nhãn loại + lên/xuống/xóa) bọc field theo
  loại — `TextArea` đoạn văn, `TextField` + toggle H2/H3 cho heading,
  textarea + `Nguồn` cho quote, `ListBlockFields` (item thêm/bớt, toggle
  gạch đầu dòng/đánh số), `MediaBlockEditor` (preview `img`/`video
  controls preload="metadata"`, trạng thái đang tải/lỗi + thử lại, đổi
  file, `Chú thích`), divider chỉ là `<hr>`.
- `PublishPanel`: chip trạng thái (`Bản nháp mới`/`Nháp`/`Đã đăng`), chọn
  `Loại bài viết` chỉ khi chưa đăng (announcement khóa nếu thiếu quyền),
  `CoverPicker` (chọn/đổi/gỡ ảnh bìa), stats `n khối · m từ · x phút đọc`,
  nhãn `Chưa lưu`/`Đã lưu lúc`, `Lưu nháp` (secondary) + `Đăng bài`/`Lưu
  thay đổi` (primary).

`useArticleEditor` (`editor-hooks.ts`) giữ `dirty`, `savedAt`, `uploads`
(per block key + `cover`), `errorCode`. Validate client trước khi gọi API:
publish cần nội dung (`POST_CONTENT_REQUIRED`), announcement cần tiêu đề
(`POST_TITLE_REQUIRED`), đang upload phải chờ (`UPLOAD_IN_PROGRESS`),
nháp chỉ cần không rỗng. Media block rỗng asset bị `cleanBlocks` loại.
Save pipeline: chưa có `post_id` → `POST` (status draft/published); đã có
→ `PATCH` rồi `POST .../publish` nếu mục tiêu là đăng; `cover_media_id`
luôn gửi (kể cả `null`) để đồng bộ `touches_cover`; `kind` chỉ gửi khi
còn nháp. Publish xong gọi `onPublished` → điều hướng sang trang đọc.

## 4. Trang `/manage/board/post` (`read-page.tsx`)

Cột bài (`lg:col-span-8`): cover, badge kind/`Nháp`/ghim, title display,
byline (tác giả + `published_at` + `đã chỉnh sửa`), `ArticleBody` render
blocks (paragraph/heading/quote/list/figure ảnh+video/divider; media chỉ
giải qua `media[]` nên asset rác không vỡ layout). `CommentThread` chỉ
hiện khi `status === "published"`. Cột phải (`lg:col-span-4`): dl meta
(tác giả, trạng thái, thời gian đọc, bình luận) + `ArticleActions` với
`onDone` điều hướng về bảng tin. Quyền lấy từ `useOrgPosts` (cache chung
với board). `useBoardRealtime` mount để bình luận/bài tươi theo kênh.

## 5. Tương thích bài cũ

Bài kiểu cũ (`body` + `media_ids`, không blocks) vẫn hiển thị: feed/detail
render `body` + dải ảnh. Mở trong editor, `articleBlocks()` convert thành
paragraph blocks + image blocks (trừ ảnh trùng cover) nên một lần lưu là
nâng cấp lên block model — backend giữ `body = blocks_to_text` cho
search/excerpt. `media_ids` không cần gửi: backend tự derive `media[]`
từ `cover_media_id` + `asset_id` trong blocks (tối đa 40 media refs).
