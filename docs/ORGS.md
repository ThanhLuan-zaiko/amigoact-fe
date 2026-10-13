# Tổ chức và thư viện media — `dashboard/` + `orgs/` (public)

## 1. Trang công khai `/orgs` và `/orgs/:slug` (`orgs/`)

Thư mục guest (không cần đăng nhập), đọc `GET /orgs` và
`GET /orgs/{slug}` của backend — feature module riêng `orgs/`
(`api.ts`, `keys.ts`, `hooks.ts`, `messages.tsx`, `utils.ts`,
`components/`), không lẫn với `dashboard/` quản trị.

- `/orgs` là "discovery board" kiểu feed: section hero (search debounce + chip
  `kind` + chip `sort`), section thống kê theo `counts`, section nổi bật
  (org đầu kết quả theo sort), rail "Vừa tham gia", mosaic card, section
  phân trang. Filter/pagination nằm trên URL (`?q&kind&sort&page`) nên
  deep-link được; `splitDirectory` trong `utils.ts` chia items thành
  spotlight/rail/mosaic.
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
  chia 2 bước kiểu đăng ký (`core/components/StepProgress.tsx`) — bước 1
  tên + mô tả + chip `join_policy` (slug, loại đóng băng), bước 2 block
  liên hệ & pháp lý (`OrgContactFields` + hook `useContactForm` ở
  `contact-form.ts`); `Tiếp tục` chỉ qua khi bước 1 hợp lệ, submit lỗi
  tên/mô tả tự nhảy về bước 1, nút `Quay lại`/`Lưu`/`Hủy`.
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
- Lưới media và hàng tổ chức stagger fade+rise qua `useRiseOn` trong
  `core/motion.ts` (data về sau mount vẫn được animate); tôn trọng
  `prefers-reduced-motion`.

## 5. Upload qua `FormData`

`core/api.ts` mặc định gửi JSON nên upload dùng riêng `apiUpload()`
(không ép `Content-Type`, để trình duyệt tự gắn boundary `multipart`),
giữ nguyên cơ chế thử lại `401` + refresh token như `apiFetch()`.
`uploadOrgMedia` gửi kèm trường `role` trong multipart form
(`gallery`/`cover`/`logo`).
