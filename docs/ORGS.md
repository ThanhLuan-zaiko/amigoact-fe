# Tổ chức và thư viện media — `dashboard/`

## 1. Trang `/manage/orgs`

`OrgListCard.tsx` hiển thị hai khối: `Tổ chức của tôi` (đang sống) và
`Thùng rác` (đã xóa mềm, có ghi chú khôi phục/xóa cứng). Lấy qua
`useMyOrgs(false)` và `useMyOrgs(true)` (`?include_deleted=true`).
Mỗi dòng là `OrgRow`: tên, loại, `@slug`, số thành viên/sự kiện, mô tả.

## 2. CRUD trên từng dòng

`OrgCardActions.tsx` gom nút theo trạng thái (xem `docs/ORGS.md` của
backend để đối chiếu API và mã lỗi):

| Trạng thái | Nút |
|---|---|
| Đang sống | `Sửa` (mở form inline), `Quản lý`, `Tệp`, `Xóa mềm` |
| Thùng rác | `Khôi phục`, `Xóa cứng` (bấm 2 lần: lần 1 xác nhận đỏ, lần 2 xóa thật) |

- Sửa (`OrgEditCard.tsx`): chỉ tên + mô tả (slug, loại đóng băng),
  validation `touched` như form auth, `Lưu`/`Hủy`.
- Mọi mutation invalidate `dashboardKeys.all` nên cả danh sách sống và
  thùng rác đều tươi lại. Lỗi backend (`SLUG_TAKEN`, `FORBIDDEN`,
  `ORG_DELETED`...) dịch sang tiếng Việt ở `dashboard/messages.tsx`.

## 3. Thư viện ảnh/video (`MediaDropzone.tsx`)

Trang tạo (`/manage/orgs/create`) có `MediaPicker.tsx` chọn file trước:
file không hợp lệ (sai định dạng/quá cỡ) bị lọc ngay kèm cảnh báo, tạo
org xong file tự đẩy lên nối tiếp, lỗi giữa chừng báo tên file và gợi ý
thử lại ở mục `Tệp`.

Mỗi ảnh chờ tải (`PendingMedia`) chọn vai trò `Thường`/`Ảnh bìa`/`Logo`
(`assignMediaRole` giữ chỉ một bìa và một logo) và có thể `Cắt` qua
`ImageCropper.tsx` (kéo khung, trượt thu phóng, tỉ lệ 1:1/4:3/16:9/3:1,
xuất canvas tối đa 2048px, giữ nguyên mime jpeg/png/webp). Nhấn `Giữ
nguyên gốc` để bỏ cắt. Video không cắt và chỉ ở vai trò `Thường` —
backend trả `INVALID_MEDIA_ROLE` nếu ép bìa/logo lên video hoặc người
không phải chủ org đặt vai trò.

Mỗi dòng có nút `Tệp` mở rộng dropzone ngay dưới (không cần route mới):
- Kéo thả hoặc bấm để chọn nhiều file (`accept="image/*,video/*"`); file
  vào hàng chờ `MediaPicker` (chọn vai trò Thường/Bìa/Logo, cắt ảnh tùy
  chọn, gỡ) — bấm `Tải lên N tệp` mới upload nối tiếp. File lỗi dừng lại,
  giữ trong hàng chờ để thử lại, báo tên file + lý do
  (`UNSUPPORTED_MEDIA`, `MEDIA_TOO_LARGE`). Backend tự transcode ảnh
  không web-safe (HEIC, TIFF, BMP…) sang JPEG/PNG nên gallery luôn
  hiển thị được; file đó không cắt được phía client (browser không
  decode) nhưng vẫn upload nguyên gốc.
- Preview lưới `2 cột` (mobile) / `3 cột`: `img` cho ảnh, `video`
  (`controls`, `preload="metadata"`) cho video. URL tệp ghép bằng
  `orgMediaUrl()` (`apiBaseUrl()` + `file_url` tương đối từ backend).
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

## 4. Upload qua `FormData`

`core/api.ts` mặc định gửi JSON nên upload dùng riêng `apiUpload()`
(không ép `Content-Type`, để trình duyệt tự gắn boundary `multipart`),
giữ nguyên cơ chế thử lại `401` + refresh token như `apiFetch()`.
`uploadOrgMedia` gửi kèm trường `role` trong multipart form
(`gallery`/`cover`/`logo`).
