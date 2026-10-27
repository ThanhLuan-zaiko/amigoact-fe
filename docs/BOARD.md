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
| `board-hooks.ts` | TanStack Query: `useOrgPosts` (paged), `usePostShelf` (drafts/trash), `useOrgPost`, mutation lifecycle + `useCreateRevision`, comments (infinite) |
| `api.ts` / `hooks.ts` | Chat giữ nguyên; `export *` từ `board-api.ts`, `channel-api.ts`, `media-api.ts` để import cũ không vỡ |
| `channel-api.ts` | Hợp đồng kênh chat có tên (`ChatChannel`, CRUD, roster) tách khỏi `api.ts` |
| `media-api.ts` | Hợp đồng index nội dung đã chia sẻ (`SharedMediaItem`, `listSharedMedia` — `GET /chat/rooms/{id}/media?kind=&author_id=`; `SharedMediaAuthor` + `listSharedMediaAuthors` — `GET .../media/authors` cho màn lọc người gửi); `useSharedMedia`/`useSharedMediaAuthors` ở `hooks.ts`, invalidate qua prefix `chat-media` cả khi mutation lẫn realtime `message.created/edited/deleted`. Tab Ảnh/Video render `ChatMediaGrid` (thumbnail wall, author chỉ ở tooltip + filter), Tệp/Liên kết giữ `ChatSharedRow`. Hàng `Người gửi` trong `ChatSharedPanel` mở `ChatSenderPicker` — drill-in thay toàn bộ drawer thành danh sách tài khoản theo `kind` của tab đang mở (header đổi `Người gửi` + nút back qua prop `onBack` của `Modal`, header drawer được pin khi list dài), kèm ô tìm kiếm sticky bỏ-dấu khi danh sách > 10 người; chọn xong quay về panel với filter đã áp |
| `keys.ts` | Mọi key bảng tin nằm dưới `["workspace","posts",orgId]` nên một prefix invalidate phủ feed + detail + drafts + trash |
| `article.ts` | Pure helpers: `EditorBlock` (kèm React key), convert bài legacy `body`+media thành blocks, `coverUrl`, `excerpt`, `wordCount`, `cleanBlocks` |
| `editor-hooks.ts` | `useArticleEditor` — toàn bộ state editor: blocks, cover, upload inline (role `attachment`), `revisionOf`/`wasPublished`, pipeline Lưu nháp/Đăng bài/Đăng lại |
| `messages.tsx` | Copy tiếng Việt, `postStatusLabel` (Nháp / Nháp chờ đăng / Đã gỡ xuống / Đã đăng) + `postEventToast` cho realtime |

## 2. Trang `/manage/board` (`board-page.tsx`)

`WorkspaceOrgBar` chọn org (deep-link `?org=`) kèm nút `Viết bài`. Ba tab nằm
trên `?tab=` (`published` mặc định, `draft`, `trash`) nên deep-link được.

- **Đã đăng**: `FeedShelf` render rail ghim (`ArticleCard featured` full
  width) rồi lưới `ArticleCard` 3 cột (`lg:col-span-4`): cover, badge
  `Thông báo` (kind) và/hoặc `Chỉ thành viên` (bài published mà
  `visibility=members`), title, excerpt, tác giả + giờ + `x phút đọc` +
  số bình luận.
  Lọc kind qua `?kind=` (discussion/announcement) và lọc thẻ qua `?tag=`
  (đọc index cạnh bài; banner "Đang lọc theo thẻ" + "Bỏ lọc"). Chip thẻ
  trên `ArticleCard` mở lại đúng bộ lọc. Phân trang số trang qua
  `?page=` + `PostPage.total` — `Pagination` giống `/manage/orgs`; `pinned[]`
  chỉ kèm ở trang 1, đổi tab/kind reset về trang 1.
- **Nháp**: `ShelfCard` liệt kê `ArticleRow` từ `GET .../posts/drafts`
  (chỉ bài của mình). Nút `Viết tiếp` mở editor, `Đăng bài`/`Đăng lại`
  publish tại chỗ, `Bỏ vào thùng rác` đưa vào thùng rác. Chip phân biệt
  `Nháp` (chưa đăng), `Nháp chờ đăng` (revision của bài đang live, kèm link
  "Xem bài đang hiển thị") và `Đã gỡ xuống` (bài từng đăng bị rút về).
- **Thùng rác**: cùng `ShelfCard` với `GET .../posts/trash` (member thấy
  bài mình, manager thấy hết). Hành động `Khôi phục` + `Xóa vĩnh viễn`
  xác nhận 2 bước (lần 1 đổi viền đỏ + nhãn `Bấm lại để xóa vĩnh viễn`,
  lần 2 mới gọi `DELETE ?hard=true`) — đúng pattern `OrgCardActions`.

`ArticleActions.tsx` gom nút theo shelf + quyền (`mine` = tác giả,
`canManage`/`canAnnounce` từ `viewer_permissions`):

| Shelf | Nút |
|---|---|
| Đã đăng | `Đọc`, `Sửa` (tác giả — mở/tạo revision nháp riêng, bài live vẫn hiển thị), `Ghim`/`Bỏ ghim` (manager), `Gỡ xuống` (tác giả — rút bài về nháp, hấp thụ revision đang mở), `Bỏ vào thùng rác` (tác giả/manager — xóa mềm, khôi phục được) |
| Nháp | `Viết tiếp`, `Đăng bài`/`Đăng lại` cho revision (khóa nếu announcement hoặc `visibility=public` mà thiếu `post:announce`), `Bỏ vào thùng rác` |
| Thùng rác | `Khôi phục`, `Xóa vĩnh viễn` (2 bước) |

Mọi mutation invalidate `[workspace,"posts"]` + `[workspace,"comments"]`
và catalog thẻ (`activityKeys.all`), vì lưu bài có thể claim thẻ mới.
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
  block, `data-insert-index`) mở menu loại khối. Chọn `Ảnh`/`Video` mở file
  input ẩn — file hợp lệ (`isSupportedMedia` + đúng family) tạo block rỗng
  rồi upload nối tiếp vào đúng vị trí; file lỗi báo `UNSUPPORTED_MEDIA`.
- Kéo-thả: cả cột soạn bài (`ArticleEditor`) là drop zone — overlay "Thả
  ảnh hoặc video" hiện khi kéo file vào. Thả lên đường `+` chèn đúng index
  đó; thả lên một block (`data-block-index`) chèn trước/sau theo nửa chiều
  cao con trỏ; chỗ trống khác nối cuối bài. Thả một file duy nhất cùng
  family lên media block (`data-media-key`/`data-media-type` trong
  `MediaBlockEditor`) thì thay asset của block đó thay vì chèn. Ảnh và video
  trộn nhau trong một lần thả chia thành hai nhóm giữ đúng thứ tự tương
  đối; drop ngoài zone được chặn mặc định mở-file của trình duyệt nên không
  làm mất nháp.
- `BlockEditor`: header nhỏ (nhãn loại + lên/xuống/xóa) bọc field theo
  loại — `TextArea` đoạn văn, `TextField` + toggle H2/H3 cho heading,
  textarea + `Nguồn` cho quote, `ListBlockFields` (item thêm/bớt, toggle
  gạch đầu dòng/đánh số), `MediaBlockEditor` (preview `img`/`video
  controls preload="metadata"`, trạng thái đang tải/lỗi + thử lại, đổi
  file, `Chú thích`), divider chỉ là `<hr>`.
- `PublishPanel`: chip trạng thái (`Bản nháp mới`/`Nháp`/`Nháp chờ
  đăng`/`Đã gỡ xuống`/`Đã đăng`), chọn `Loại bài viết` chỉ trên nháp độc
  lập (revision khóa theo bài gốc), link "Xem bài đang hiển thị" khi đang
  sửa revision, `CoverPicker` (chọn/đổi/gỡ ảnh bìa), stats `n khối · m từ ·
  x phút đọc`, nhãn `Chưa lưu`/`Đã lưu lúc`. Nút primary: `Đăng bài`
  (nháp mới), `Đăng lại` (revision/bài đã gỡ), `Lưu thay đổi` (bài live —
  patch trực tiếp); secondary `Lưu nháp`/`Lưu nháp riêng` (trên bài live
  tự tạo revision trước khi lưu). Nhóm `Phạm vi hiển thị` (`Công khai` /
  `Chỉ thành viên`) gắn `visibility` — độc lập với `kind`, ẩn trên
  revision (kế thừa bài gốc); `Công khai` khóa khi thiếu `post:announce`
  và flip trên bài live áp dụng ngay sau `PATCH`.

`useArticleEditor` (`editor-hooks.ts`) giữ `dirty`, `savedAt`, `uploads`
(per block key + `cover`), `errorCode`. `ArticleEditor` mount
`UnsavedGuard` (`core/components/UnsavedGuard.tsx`) khi `dirty` hoặc đang
upload — chặn reload/đóng tab (beforeunload), click link nội bộ và nút
Back bằng dialog "Chưa lưu thay đổi"; `save()` reset `dirty` sau khi lưu
nên đường điều hướng sau publish không bị hỏi. Validate client trước khi gọi API:
publish cần nội dung (`POST_CONTENT_REQUIRED`), announcement cần tiêu đề
(`POST_TITLE_REQUIRED`), đang upload phải chờ (`UPLOAD_IN_PROGRESS`),
nháp chỉ cần không rỗng. Media block rỗng asset bị `cleanBlocks` loại.
Save pipeline: chưa có `post_id` → `POST` (status draft/published); đã có
→ `PATCH` rồi `POST .../publish` nếu mục tiêu là đăng; `cover_media_id`
luôn gửi (kể cả `null`) để đồng bộ `touches_cover`; `kind` chỉ gửi cho
nháp độc lập; `visibility` gửi khi không phải revision (bài đã đăng flip
được, revision bỏ field vì kế thừa bài gốc). `Lưu nháp` trên bài đã đăng gọi `POST .../revisions` trước
(get-or-create) rồi PATCH vào revision — bài live không đổi cho tới khi
revision được đăng lại (server gộp nội dung vào bài gốc, trả về snapshot
bài gốc). Publish xong gọi `onPublished` → điều hướng sang trang đọc.

## 4. Trang `/manage/board/post` (`read-page.tsx`)

Cột bài (`lg:col-span-8`): cover, badge kind/`postStatusLabel` (`Nháp`,
`Nháp chờ đăng`, `Đã gỡ xuống`)/ghim, title display, byline (tác giả +
`published_at` + `đã chỉnh sửa`), chip thẻ link về
`/manage/board?org=&tag=`, `ArticleBody` render blocks
(paragraph/heading/quote/list/figure ảnh+video/divider; media chỉ giải
qua `media[]` nên asset rác không vỡ layout). `CommentThread` chỉ hiện
khi `status === "published"`. Cột phải (`lg:col-span-4`): dl meta (tác
giả, trạng thái — `Đang ở thùng rác` khi `deleted_at` khác null, thời
gian đọc, bình luận) + `ArticleActions` với `onDone` điều hướng về bảng
tin — shelf suy từ `deleted_at` trước rồi `status` nên bài trong thùng
rác hiện đúng cặp Khôi phục/Xóa vĩnh viễn. Quyền lấy từ `useOrgPosts`
(cache chung với board). `useBoardRealtime` mount để bình luận/bài tươi
theo kênh. Nếu `?org=` không nằm trong các tổ chức đang tham gia (đã rời CLB hoặc link thiếu `org`), trang không tự chuyển sang tổ chức khác mà hiện lỗi kèm nút `Tổ chức của tôi`; trong lúc danh sách tổ chức còn tải thì hiện loading.

## 5. Cổng public (`/orgs/:slug`)

Chỉ bài `visibility='public'` đã đăng ra ngoài board — `kind` không còn
quyết định phạm vi (announcement `members` và discussion `public` đều
hợp lệ); nháp/revision/thùng rác vẫn nội bộ.

- `orgs/api.ts`: `PublicOrgDetail.announcements` + `announcement_count` —
  teaser `title/excerpt/cover_url/author_name/published_at/comment_count`
  nhúng trong `GET /orgs/{slug}`.
- `orgs/components/OrgNewsCard.tsx`: section full-width "Tin tức từ tổ
  chức" trên profile, teaser link sang trang đọc public; link "Xem tất cả"
  (khi `announcement_count > announcements.length`) sang trang danh sách.
- `orgs/news-page.tsx` — route `/orgs/:slug/posts`, khách không cần đăng
  nhập. Lưới teaser (cover/title/excerpt/ngày+tác giả+comment) link sang
  trang đọc; đọc `GET /orgs/{slug}/announcements?limit&page` qua
  `listPublicOrgPosts` + `usePublicOrgPosts` (key `orgKeys.posts(slug,page)`,
  `ORG_NEWS_PAGE_SIZE` = 9). Số trang nằm ở `?page=` (deep-linkable), đổi
  trang qua `Pagination`; header có nút "Về trang tổ chức".
- `workspace/org-post-page.tsx` — route `/orgs/:slug/posts/:postId`, khách
  không cần đăng nhập. Đọc qua `GET /orgs/{slug}/announcements/{postId}`
  (`getPublicOrgPost` + `usePublicOrgPost`). Chip thẻ là chữ, không link
  vào `/manage`. Key `publicPost` tách khỏi prefix `posts` vì không gắn
  board mutation/realtime. Reuse `ArticleBody`
  + `coverUrl`/`formatTime`; rail phải link về profile org (qua
  `usePublicOrg` — contract import từ `orgs/hooks.ts`) + meta (ngày đăng,
  thời gian đọc, số bình luận). `CommentThread`/`ArticleActions` không
  render — khách chỉ đọc; lỗi 404 → `ErrorState` + nút về profile.

## 6. Tương thích bài cũ

Bài kiểu cũ (`body` + `media_ids`, không blocks) vẫn hiển thị: feed/detail
render `body` + dải ảnh. Mở trong editor, `articleBlocks()` convert thành
paragraph blocks + image blocks (trừ ảnh trùng cover) nên một lần lưu là
nâng cấp lên block model — backend giữ `body = blocks_to_text` cho
search/excerpt. `media_ids` không cần gửi: backend tự derive `media[]`
từ `cover_media_id` + `asset_id` trong blocks (tối đa 40 media refs).
