# Tổ chức và thư viện media — `my-dashboard/`

## 1. Trang `/my-dashboard/orgs`

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
  `ORG_DELETED`...) dịch sang tiếng Việt ở `my-dashboard/messages.tsx`.

## 3. Thư viện ảnh/video (`MediaDropzone.tsx`)

Trang tạo (`/my-dashboard/create`) có `MediaPicker.tsx` chọn file trước:
file không hợp lệ (sai định dạng/quá cỡ) bị lọc ngay kèm cảnh báo, tạo
org xong file tự đẩy lên nối tiếp, lỗi giữa chừng báo tên file và gợi ý
thử lại ở mục `Tệp`.

Mỗi dòng có nút `Tệp` mở rộng dropzone ngay dưới (không cần route mới):
- Kéo thả hoặc bấm để chọn nhiều file (`accept="image/*,video/*"`);
  upload nối tiếp từng file, file lỗi dừng lại và báo tên file + lý do
  (`UNSUPPORTED_MEDIA`, `MEDIA_TOO_LARGE`).
- Preview lưới `2 cột` (mobile) / `3 cột`: `img` cho ảnh, `video`
  (`controls`, `preload="metadata"`) cho video. URL tệp ghép bằng
  `orgMediaUrl()` (`apiBaseUrl()` + `file_url` tương đối từ backend).
- Mỗi item có nút `Xóa tệp` (chủ org). Xóa xong invalidate đúng
  `dashboardKeys.orgMedia(orgId)`.

## 4. Upload qua `FormData`

`core/api.ts` mặc định gửi JSON nên upload dùng riêng `apiUpload()`
(không ép `Content-Type`, để trình duyệt tự gắn boundary `multipart`),
giữ nguyên cơ chế thử lại `401` + refresh token như `apiFetch()`.
