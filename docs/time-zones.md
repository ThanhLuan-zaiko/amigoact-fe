# Ngày giờ và múi giờ

Mỗi người xem thấy ngày giờ theo đồng hồ của chính mình. Backend lưu mọi thời điểm bằng `timestamptz` và trả chuỗi ISO 8601 có độ lệch (UTC); frontend viết thời điểm đó theo múi giờ IANA của người xem, ví dụ `Asia/Ho_Chi_Minh` hay `America/New_York`.

## Múi giờ của người xem

- Trình duyệt biết múi giờ của mình (`Intl.DateTimeFormat().resolvedOptions().timeZone`). `TimeZoneSync` (trong layout `(app)`) ghi nó vào cookie `tz` (không httpOnly, không bí mật, một năm, `SameSite=Lax`).
- Mã máy chủ đọc bằng `viewerTimeZone()` trong `src/lib/viewerTimeZone.ts`. Cookie thiếu hoặc không phải múi giờ thật thì dùng `DEFAULT_TIME_ZONE` (`Asia/Ho_Chi_Minh`). `isTimeZone` kiểm tra với `Intl.supportedValuesOf("timeZone")` rồi với chính `Intl` (nhận cả bí danh như `Asia/Saigon`, `UTC`).
- `viewerTimeZone()` đọc cookie, nên chỉ gọi sau `<Suspense>`, như khi đọc phiên đăng nhập.
- Lần đầu vào trang chưa có cookie, trang được vẽ theo giờ mặc định. `TimeZoneSync` thấy khác múi giờ thì ghi cookie và gọi `router.refresh()` một lần (nhớ trong `sessionStorage` để trình duyệt chặn cookie không bị tải lại mãi). Đi sang múi giờ khác cũng được sửa như vậy.

## Truyền múi giờ xuống

- Hàm định dạng trong `src/lib` nhận `timeZone` tùy chọn ở cuối: `formatDateTime`, `formatDateTimeZoned`, `formatTimeRange`, `toLocalInput`, `fromLocalInput` (`activities.ts`), `formatDate` (`organizations.ts`), `messageTime`, `messageDay`, `continuesGroup` (`chat.ts`), `listTime` (`messenger.ts`), `timeAgo` (`notifications.ts`), `activityOptions` (`postActivity.ts`). Bỏ trống nghĩa là múi giờ của máy đang chạy: đúng trên điện thoại và trong trình duyệt, sai trên máy chủ. **Mã chạy trên máy chủ luôn truyền múi giờ của người xem.**
- Server Component: trang gọi `viewerTimeZone()` rồi truyền prop `timeZone` (bắt buộc) cho thành phần hiển thị giờ.
- Client Component cũng được vẽ trên máy chủ (messenger, danh sách thông báo, form hoạt động, ca): trang bọc bằng `TimeZoneProvider`, thành phần đọc bằng `useTimeZone()`, để máy chủ và trình duyệt viết cùng một giờ.
- Bình luận (`CommentTime`) tính sau khi trang tải trong trình duyệt nên dùng thẳng múi giờ của máy (xem `docs/posts.md`).
- Ngày thuần (`"2026-11-20"`) là một ngày lịch, không phải thời điểm: `formatDate` viết nguyên ngày đó ở mọi múi giờ.

## Ghi rõ múi giờ

Giờ người ta lên kế hoạch theo thì ghi kèm độ lệch, ví dụ `14:05 16/11/26 (GMT+7)`:

- giờ bắt đầu và kết thúc của hoạt động và của ca (`formatTimeRange`, ghi múi giờ một lần; nếu đổi giờ mùa hè xen giữa thì mỗi đầu ghi độ lệch riêng);
- hạn đăng ký và giờ hoạt động ở tab Hoạt động cạnh bài viết (`formatDateTimeZoned`);
- giờ đóng phiên điểm danh.

Danh sách, thẻ và thùng rác chỉ ghi giờ, không ghi múi giờ, cho gọn.

## Ô nhập ngày giờ

- `datetime-local` không có múi giờ: giá trị là giờ trên đồng hồ của người gõ.
- Form hoạt động và form ca có `ZoneNote`: dòng "Giờ theo múi giờ Asia/Ho_Chi_Minh (GMT+7)" và ô ẩn `time_zone` mang múi giờ form đã dùng để hiện giá trị.
- Server Action đọc múi giờ bằng `formTimeZone(formData)` (ô `time_zone`, không có thì cookie), rồi `fromLocalInput(value, timeZone)` đổi thành chuỗi ISO 8601 có độ lệch của múi giờ đó tại ngày ấy, ví dụ `2026-06-15T08:00:00-04:00` ở New York.
- Giờ bị bỏ qua khi chuyển sang giờ mùa hè (02:30 ngày 8/3/2026 ở New York) được đẩy lên đúng khoảng nhảy (03:30); giờ lặp lại khi trở về giờ chuẩn lấy lần đầu, như ứng dụng lịch.
- Giá trị không phải ngày giờ thật (ví dụ `2026-02-31T10:00`) được gửi nguyên văn để backend từ chối với lỗi rõ ràng.

## Những chỗ cố ý dùng giờ Việt Nam

Các con số phải giống nhau với mọi người xem, nên vẫn tính theo `Asia/Ho_Chi_Minh` như backend:

- kỳ giờ tình nguyện (`term_of` ở backend) và trần giờ theo kỳ;
- biểu đồ giờ theo tuần, tháng (`stats_queries.py` ở backend) và ngày bắt đầu khoảng lọc (`rangeStart` trong `hoursStats.ts`);
- ngày in trên chứng nhận (`certificateTexts`, khớp với PDF của backend).

## Ứng dụng điện thoại

App gọi các hàm trên không truyền múi giờ, nên dùng múi giờ của máy. Bộ chọn ngày giờ đọc và ghi theo đồng hồ của máy, `activityActions` gửi bằng `fromLocalInput` theo múi giờ của máy. Các tệp `src/lib` và bài kiểm tra được chép nguyên từ web.
