# Tổ chức và thư viện media — `dashboard/` + `orgs/` (public)

## 1. Thư mục công khai trên `/` và `/orgs/:slug` (`orgs/`)

Thư mục guest (không cần đăng nhập), đọc `GET /orgs` và
`GET /orgs/{slug}` của backend — feature module riêng `orgs/`
(`api.ts`, `keys.ts`, `hooks.ts`, `messages.tsx`, `utils.ts`,
`components/`), không lẫn với `dashboard/` quản trị.

Cột trang chủ `/` chia hai tab kiểu X qua `home/components/HomeTabs.tsx`
(sticky ngay dưới `CenterHeader`, mỗi tab một URL riêng): `Bài đăng` tại
`/` và `Tổ chức` tại `/?tab=orgs`.

- Tab `Bài đăng` (`/`): hero khách + hàng lời mời tổ chức (khi có) rồi
  timeline toàn cục qua `orgs/components/AnnouncementTimeline.tsx`: đọc
  `GET /announcements?limit&cursor` (guest, cursor = `post_id` cuối trang)
  render từng teaser dạng dòng feed — avatar + tên tác giả (`author_name`,
  `author_avatar_url`), meta `đăng trong {tên org} · ngày`, tiêu đề,
  excerpt, mosaic media của bài (cùng `OrgMediaMosaic` như tab Tổ chức:
  `media[]`/`media_count` cover-dẫn-đầu của bài viết, tối đa 4 ô + `+N`),
  số bình luận, và chip thẻ (`tags[{name,slug}]`, tối đa 3) dưới excerpt.
  Chip nằm trong dòng, nên bấm cả dòng vẫn mở
  `/orgs/:slug/posts/:postId`. Timeline không lọc theo thẻ. Ô media
  (kể cả `+N`) mở lightbox ngay tại
  feed qua `PostMediaViewer` → `GET /orgs/{slug}/announcements/{id}/media`.
  Sentinel `IntersectionObserver`
  (`rootMargin` 600px) tự gọi `fetchNextPage` của `useAnnouncementFeed`
  (infinite query, trang 12 item) khi user lướt gần cuối — cuộn vô tận
  không nút, kèm spinner nhỏ khi đang tải và dòng kết feed khi hết dữ liệu.
- Tab `Tổ chức` (`/?tab=orgs`): thư mục public qua
  `orgs/components/OrgDirectory.tsx` — danh sách phẳng, mỗi org một dòng
  `OrgFeedRow` định danh theo chủ sở hữu (`owner_name`/`owner_avatar_url`:
  avatar chủ sở hữu, tên đậm, meta `sở hữu {tên org} ✓`, mô tả, meta
  loại/thành viên/địa điểm/chính sách tham gia; org thiếu owner brief vẫn
  hiện logo + tên + `@slug` như cũ), kèm section phân trang. Dưới mô tả,
  `OrgMediaMosaic.tsx` render dải media kiểu X từ `media[]`/`media_count`
  của card (cover dẫn đầu, ảnh lẫn video, tối đa 4 ô: 1 → 16:9, 2 → hai ô
  vuông, 3 → trái `row-span-2`, 4 → lưới 2x2), video hiện khung đầu kèm
  badge play, ô cuối phủ `+N` khi thư viện còn nữa — cả dòng vẫn là một
  link tới trang org, nhưng tile là `<button>` `preventDefault` +
  `stopPropagation` mở lightbox tại chỗ (`OrgMediaViewer` →
  `GET /orgs/{slug}/gallery`).
  Ô `Tìm tổ chức` ở rail phải submit `/?tab=orgs&q=`; khi có `q` tab hiện
  một dòng `Kết quả cho "…"` kèm nút xóa. Phân trang nằm trên URL
  (`/?tab=orgs&q&page`) nên deep-link được. Route `/orgs` cũ redirect về
  `/?tab=orgs` và forward nguyên query string nên link/search cũ không gãy
  (`OrgsDirectoryRedirect` trong `App.tsx`); URL `/` trần kèm
  `q/kind/sort/page` cũng tự mở tab `Tổ chức`.
- `orgs/components/OrgFeedRow.tsx` là khung dòng kiểu X dùng chung cho cả
  hai tab: `<li>` + link full-bleed, avatar tròn 40px (`avatar` prop — bài
  đăng: ảnh/`Avatar` chữ cái của tác giả; tổ chức: `OrgLogo`), header
  `title` đậm + `badge` + meta muted, body tùy biến (bài đăng: tiêu đề +
  excerpt + cover 16:9; tổ chức: mô tả + pill meta), footer muted — đổi một
  chỗ là cả hai tab đổi theo, bảo đảm bố cục đồng nhất.
- `orgs/components/MediaLightbox.tsx` là viewer fullscreen dùng chung
  (portal, khóa scroll, Esc/mũi tên trái-phải, nút đóng + đếm `i/n`,
  click ngoài đóng — theo convention `Modal`): ảnh `object-contain`,
  video `controls autoPlay`. `MediaViewers.tsx` chứa hai wrapper
  mount-khi-mở `OrgMediaViewer`/`PostMediaViewer`: fetch danh sách đầy
  đủ lười qua `usePublicOrgMedia`/`usePublicPostMedia`, trong lúc chờ
  hiển thị ngay `mosaicItems()` preview của card (preview là prefix của
  ordering endpoint nên index mở không lệch). Trên `/orgs/:slug` card
  `Hình ảnh hoạt động` (`OrgGalleryCard`) cũng đọc endpoint gallery —
  lưới 6 ô giờ có cả video và `+N` mở được viewer.
- `/orgs/:slug` render 6 section: hero (cover + logo + nút `Tham gia`),
  `Đánh giá tin cậy`, giới thiệu, liên hệ & pháp lý, hoạt động đã tổ
  chức, thư viện ảnh. `OrgTrustCard` dựng checklist 6 tiêu chí từ tín
  hiệu thô của API (verified, legal_status, activity_count, liên hệ,
  địa chỉ, gallery) kèm điểm `x/6` và disclaimer — không tự chấm điểm mù.
- Nút `Tham gia` (`useJoinOrg` → `POST /orgs/{id}/members/join`): guest
  thấy `Đăng nhập để tham gia`; org `invite` hiện ghi chú nhận qua lời
  mời; lỗi `ALREADY_MEMBER`/`INVITE_ONLY`/`ORG_DELETED` dịch ở
  `messages.tsx`. `404` từ detail hiển thị EmptyState "không còn hiển
  thị công khai".

### Realtime thư mục (`useOrgsRealtime`)

Cả hai trang mount `useOrgsRealtime()` (`orgs/hooks.ts`): subscribe kênh
public `orgs:directory` qua `subscribeChannel` (`core/realtime.ts`),
nhận `event.v1` `{action, org_id, slug}` (`created`/`updated`/`restored`/
`removed`) rồi `invalidateQueries(orgKeys.all)` — org bị xóa/ẩn biến mất
khỏi card và trang chi tiết chuyển sang EmptyState 404 mà không cần
F5. Payload chỉ là gợi ý refetch; REST vẫn là fact source nên event giả
không thể đưa org đã ẩn quay lại. Guest kết nối bằng socket ẩn danh —
xem `docs/REALTIME.md`.

### Realtime bảng tin (`useAnnouncementsRealtime`)

`AnnouncementTimeline` mount `useAnnouncementsRealtime()`: subscribe kênh
public `announcements:feed`, nhận `{action, post_id, org_id}`
(`created`/`updated`/`removed`) rồi invalidate `orgKeys.feed()` +
`orgKeys.orgDetails()` + `orgKeys.orgPosts()` — teaser, đếm bình luận và
tin tức trên trang org cập nhật không cần F5. Cùng nguyên tắc refetch-hint:
REST vẫn là fact source.

## 2. Trang `/manage/orgs`

`OrgListCard.tsx` hiển thị hai khối: `Tổ chức của tôi` (đang sống) và
`Thùng rác` (đã xóa mềm, có ghi chú khôi phục/xóa cứng). Khối đang sống
lấy qua `useMyOrgs(false, { q, status, sort, limit, offset })` — tìm kiếm,
lọc, sắp xếp và phân trang chạy phía server (`GET /orgs/mine` trả envelope
`{items, total, counts}`); `total` cho phân trang, `counts` cho chip lọc.
Mọi trạng thái lọc nằm trên URL (`?q&status&sort&page&media`) nên
deep-link được. Thùng rác và tra cứu modal dùng thêm một query rộng
(`limit: 100`). Mỗi dòng là `OrgRow`: tên, loại, `@slug`, số thành
viên/sự kiện, mô tả.

## 3. CRUD trên từng dòng

`OrgCardActions.tsx` gom nút theo trạng thái (xem `docs/ORGS.md` của
backend để đối chiếu API và mã lỗi):

| Trạng thái | Nút |
|---|---|
| Đang sống | `Sửa` (mở modal `OrgEditModal`), `Quản lý`, `Tệp`, `Xóa mềm` |
| Thùng rác | `Khôi phục`, `Xóa cứng` (bấm 2 lần: lần 1 xác nhận đỏ, lần 2 xóa thật) |

- Sửa (`OrgEditCard.tsx` bên trong `OrgEditModal.tsx`, `Modal wide` —
  `core/components/Modal.tsx` có prop `wide` nới panel lên `max-w-3xl`):
  một form cuộn gồm tên + mô tả + chip `join_policy` + block liên hệ &
  pháp lý (`OrgContactFields` + hook `useContactForm` ở
  `contact-form.ts`), nút `Lưu`/`Hủy`. Form tự diff với baseline đã lưu
  (re-seed sau mỗi lần lưu): bẩn thì `UnsavedGuard` chặn thoát trang,
  còn `OrgEditModal` gate cả X/overlay/Esc/`Hủy` bằng dialog
  `UnsavedChangesDialog` (cùng file `core/components/UnsavedGuard.tsx`);
  đường đóng sau khi lưu thành công (`onDone`) bỏ qua confirm.
- Mọi mutation invalidate `dashboardKeys.all` nên cả danh sách sống và
  thùng rác đều tươi lại. Lỗi backend (`SLUG_TAKEN`, `FORBIDDEN`,
  `ORG_DELETED`...) dịch sang tiếng Việt ở `dashboard/messages.tsx`.

## 4. Thư viện ảnh/video (`MediaDropzone.tsx`)

Trang tạo (`/manage/orgs/create`) cũng hiện block `Thông tin liên hệ &
pháp lý` (`OrgContactFields`, toàn bộ không bắt buộc — `contactPayload`
chỉ gửi ô có nhập), và có `MediaPicker.tsx` chọn file trước:
file không hợp lệ (sai định dạng/quá cỡ) bị lọc ngay kèm cảnh báo, tạo
org xong file tự đẩy lên nối tiếp, lỗi giữa chừng báo tên file và gợi ý
thử lại ở mục `Tệp`.

Mỗi ảnh chờ tải (`PendingMedia`) chọn vai trò `Thường`/`Ảnh bìa`/`Logo`
(`assignMediaRole` giữ chỉ một bìa và một logo) và có thể `Cắt` qua
`ImageCropper.tsx` với lõi hình học ở `crop-math.ts` và vẽ/xuất canvas ở
`crop-render.ts` (kéo để di chuyển, cuộn chuột hoặc chụm hai ngón để thu
phóng neo theo con trỏ, xoay ±90°, nghiêng ±45°, lật ngang/dọc, tỉ lệ
1:1/4:3/16:9/3:1 kèm nút đảo ngang/dọc, lưới tam phân, bộ lọc độ
sáng/tương phản/bão hoà qua `CropControls.tsx`, xuất canvas tối đa
2048px, giữ nguyên mime jpeg/png/webp). Nhấn `Giữ nguyên gốc` để bỏ cắt. Video không cắt và chỉ ở vai trò `Thường` —
backend trả `INVALID_MEDIA_ROLE` nếu ép bìa/logo lên video hoặc người
không phải chủ org đặt vai trò.

Mỗi dòng có nút `Tệp` mở modal `OrgMediaModal.tsx` (`?media=<id>`, đóng
bằng Back khi mở từ list, `Esc`/bấm nền cũng đóng; dialog đứng yên, chỉ
vùng thư viện bên trong cuộn):
- Kéo thả hoặc bấm để chọn nhiều file (`accept="image/*,video/*"`); file
  vào hàng chờ `MediaPicker` (chọn vai trò Thường/Bìa/Logo, cắt ảnh tùy
  chọn, gỡ) — bấm `Tải lên N tệp` mới upload nối tiếp. File lỗi dừng lại,
  giữ trong hàng chờ để thử lại, báo tên file + lý do
  (`UNSUPPORTED_MEDIA`, `MEDIA_TOO_LARGE`). Backend tự transcode ảnh
  không web-safe (HEIC, TIFF, BMP…) sang JPEG/PNG nên gallery luôn
  hiển thị được; file đó không cắt được phía client (browser không
  decode) nhưng vẫn upload nguyên gốc.
- Preview lưới `1 cột` (mobile) / `3 cột` (`sm:` trở lên): `img` cho ảnh, `video`
  (`controls`, `preload="metadata"`) cho video. URL tệp ghép bằng
  `orgMediaUrl()` (`apiBaseUrl()` + `file_url` tương đối từ backend).
- Ảnh đã tải lên có nút `Chỉnh sửa` (`MediaItemCard.tsx`): tải bytes
  về (`downloadOrgMedia`), mở lại `ImageCropper`, rồi `PUT
  /orgs/{id}/media/{id}/file` thay bytes tại chỗ — giữ nguyên asset id,
  vai trò và brand pointer; ảnh có `updated_at` để bust cache khi URL
  không đổi. Video không sửa được (chỉ role/xoá).
- Chủ org (`canManage` = `owner_id === session.id`) thấy trên ảnh nút
  `Ảnh bìa`/`Logo` bật-tắt gọi `PATCH /orgs/{id}/media/{mediaId}` và nút
  `Xóa tệp`; badge vai trò nằm góc trái thumbnail. Bấm lại vai trò đang
  giữ để gỡ về `Thường`. Mọi thay đổi invalidate đúng
  `dashboardKeys.orgMedia(orgId)`.
- Nút `Xóa tất cả` (chủ org, xác nhận 2 bước) gọi `DELETE /orgs/{id}/media`
  xóa toàn bộ gallery — cả metadata lẫn bytes.
- Lưới media và hàng tổ chức hiện ngay khi dữ liệu về, không có
  hiệu ứng vào trang.

## 5. Upload qua `FormData`

`core/api.ts` mặc định gửi JSON nên upload dùng riêng `apiUpload()`
(không ép `Content-Type`, để trình duyệt tự gắn boundary `multipart`),
giữ nguyên cơ chế thử lại `401` + refresh token như `apiFetch()`.
`uploadOrgMedia` gửi kèm trường `role` trong multipart form
(`gallery`/`cover`/`logo`).

### Nộp hồ sơ duyệt (`join_policy = review`)

- Tổ chức có chính sách `review` hiện `ApplyOrgCard` ngay dưới hero (`#apply-org`),
  chỉ khi người xem đã đăng nhập. Nút CTA trong hero cuộn tới thẻ này; khách thấy
  `Đăng nhập để nộp hồ sơ`.
- Thẻ đọc trạng thái của người xem qua `useMyMemberships` và chỉ hiện biểu mẫu khi
  người xem chưa có quan hệ nào hoặc đã rời/bị thu hồi. Đang `applied`, `active`,
  `invited` hoặc `suspended` thì thẻ chỉ hiện trạng thái tương ứng.
- Biểu mẫu lấy qua `useMembershipForm` (`GET /orgs/{id}/membership-form`) và
  render bằng `FormFields` dùng chung với đăng ký hoạt động. Câu bắt buộc được kiểm
  ở client trước khi gửi; backend vẫn kiểm lại và trả `ANSWER_REQUIRED`.
- Quản lý (`member:invite` hoặc owner) có `MembershipFormCard` trong trang thành
  viên khi tổ chức ở chế độ `review`: thêm, sửa, xóa câu hỏi rồi lưu. Lưu gửi cả
  danh sách qua `PUT`, nên thứ tự và số lượng luôn khớp backend (tối đa 32).
- Trong danh sách thành viên có thẻ `Chờ duyệt` (`applied`). Dòng `applied` có
  `Xem hồ sơ nộp` (`MemberApplicationDialog`), `Duyệt hồ sơ` và `Từ chối hồ sơ`;
  người nộp tự rút bằng `Rút hồ sơ` (đi qua luồng rời tổ chức có sẵn), có hộp xác nhận riêng.
  `Từ chối hồ sơ` mở hộp xác nhận vì người nộp sẽ được báo và phải chờ 7 ngày mới
  nộp lại. `Duyệt hồ sơ` không có hộp xác nhận. Backend trả `APPLICATION_COOLDOWN`
  khi còn trong thời gian chờ, và `TOO_MANY_REQUESTS` khi nộp quá nhiều lần.
- Chủ tổ chức đổi chính sách qua ô chọn trong `MemberManageActions` (Chỉ mời,
  Nộp hồ sơ duyệt, Mở tham gia).
