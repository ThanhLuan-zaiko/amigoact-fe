# Chứng nhận

Tài liệu này mô tả giao diện phần chứng nhận. Quy tắc nghiệp vụ và API nằm trong tài liệu của backend, `amigoact-be/docs/certificates.md`.

## Các trang

| Đường dẫn | Nội dung | Ai xem được |
| ---- | ---- | ---- |
| `/org/[slug]/certificates` | Danh sách mẫu, xem trước, sửa, tắt hoặc bật lại mẫu. Thẻ mẫu chia hai cột từ `sm`, ba cột từ `2xl` | Ban quản trị |
| `/org/[slug]/certificates/new` | Tạo mẫu | Ban quản trị |
| `/org/[slug]/certificates/[templateId]` | Sửa mẫu, đọc bằng `GET /certificate-templates/{id}` | Ban quản trị |
| `/activities/[id]` | Khung "Chứng nhận" ở cột phải khi hoạt động đã kết thúc: cấp, danh sách, thu hồi, hoàn tác | Ban quản trị |
| `/certificates` | Chứng nhận của tôi, có liên kết tới trang xác minh để xem và in | Đã đăng nhập |
| `/certificates/verify` | Ô nhập số serial (form GET, chạy được khi chưa có JavaScript) | Công khai |
| `/certificates/verify/[serial]` | Kết quả xác minh, nút tải PDF và nút in | Công khai |
| `/certificates/verify/[serial]/pdf` | Route handler chuyển file PDF từ backend | Công khai |

Thẻ "Chứng nhận" trong `OrgNav` chỉ hiện với ban quản trị. Mục "Chứng nhận" trong thanh bên trái dẫn tới `/certificates`.

`src/lib/protectedPaths.ts` đưa `/certificates` và mọi trang dưới `/org/[slug]/certificates` vào danh sách cần đăng nhập. Hai trang xác minh không nằm trong danh sách, và gọi backend không kèm token, nên ai cũng thấy cùng một nội dung.

## Mẫu chứng nhận

`TemplateForm` gồm tên mẫu, ảnh nền và vị trí của năm nội dung: tên người nhận, tên hoạt động, số giờ, ngày cấp và số serial.

- Tên mẫu dùng ô `template_name`, không dùng `name`, vì `validateField` coi `name` là tên tổ chức. Lỗi `name` từ backend được đổi về ô này.
- Mỗi nội dung có ba ô `TextField numeric`: `<nội dung>_x`, `<nội dung>_y` (phần trăm 0 đến 100, kiểu `decimal`) và `<nội dung>_size` (cỡ chữ 8 đến 72, kiểu `integer`), ví dụ `name_x`, `serial_size`.
- `readLayout` trong `src/lib/certificates.ts` gửi số thật, không gửi chuỗi, vì backend dùng `StrictFloat` và `StrictInt`. Giá trị không phải số được gửi nguyên văn để backend từ chối, giống `numberOrNull`.
- Trình duyệt kiểm tra trước bằng `layoutErrors` và `templateNameError`, nên lỗi hiện ngay dưới đúng ô. Backend chỉ trả phần cuối của đường dẫn lỗi (`x`, `y`, `size`), nên nếu lỗi vị trí vẫn tới được backend, form hiện một thông báo chung cho cả bố cục.
- Ảnh nền được tải lên ngay khi chọn qua `/media/upload` (`BackgroundPicker`, dùng lại `uploadFile`). Form chỉ mang `background_asset_id`. Khi gỡ ảnh hiện tại, form gửi `remove_background`, và action gửi `background_asset_id: null`. Không chọn gì thì khóa này bị bỏ khỏi body, nên ảnh giữ nguyên. Ảnh gắn vào mẫu sẽ thành công khai.
- Mẫu không xóa được. Nút mắt trên thẻ mẫu gửi `PATCH` với `is_active`.

### Xem trước

`CertificatePreview` vẽ trang bằng SVG theo khổ A4 ngang tính bằng point (842 × 595), nên cỡ chữ trong mẫu giống khi in. Chữ được đặt bằng thuộc tính `x`, `y`, `fontSize` của SVG, không cần inline style. Chữ được căn giữa tại điểm đó. Giấy luôn màu trắng, kể cả ở chế độ tối, vì nó thể hiện bản in.

Trên form, xem trước đi theo từng phím gõ: form nghe sự kiện `input` và gọi `updatePlacement`. Giá trị chưa hợp lệ giữ vị trí cũ, nên chữ không nhảy về góc. Từ xl, các ô nằm bên trái và xem trước dính ở bên phải. Trên điện thoại, xem trước nằm trên cùng.

## Cấp và thu hồi

`CertificatePanel` là server component, nằm sau một `<Suspense>` riêng trong trang hoạt động. Khung chỉ hiện khi người xem quản lý được hoạt động và hoạt động đã `completed`.

- `IssueForm` cấp cho mọi người đã tham gia mà chưa có chứng nhận. Ô "Mẫu" chỉ liệt kê mẫu đang dùng, kèm lựa chọn "Không dùng mẫu". Kết quả hiện "Đã cấp n chứng nhận mới."
- Khi `missing_count` bằng 0, nút cấp được ẩn. Người vừa được chấp nhận khiếu nại sẽ làm số này tăng lại.
- `RevokeButton` mở một form ngắn ngay trong dòng, cần lý do từ 5 ký tự. Hoàn tác thu hồi dùng `ActionButton` có bước xác nhận.

Mã lỗi riêng của chứng nhận (`activity_not_completed`, `certificate_template_inactive`, ...) được dịch trong `certificateFailure`, các mã còn lại dùng `failureState` chung.

## Xác minh và in

Trang xác minh chuẩn hóa số serial (bỏ dấu cách, viết hoa) bằng `normalizeSerial`, và chỉ gọi backend khi chuỗi có dạng backend nhận (`isSerialShape`). Trạng thái "Có hiệu lực" dùng nhãn xanh lá, "Đã thu hồi" dùng nhãn vàng kèm ngày thu hồi. Trang không hiện lý do thu hồi hay thông tin liên hệ.

Nút tải PDF dẫn tới `/certificates/verify/[serial]/pdf`, một route handler chuyển file PDF từ `GET /certificates/verify/{serial}/pdf` của backend. Trình duyệt không gọi thẳng backend. Route chuyển tiếp `x-forwarded-for`, vì backend giới hạn tra cứu theo IP. Lỗi 404, 409 (đã thu hồi) và 429 giữ nguyên mã. Nút chỉ hiện với chứng nhận còn hiệu lực.

Khi backend trả về `rate_limited`, trang xác minh báo "Tra cứu quá nhiều lần" thay vì "Không tìm thấy".

Nút in gọi `window.print()` để in ngay trang này.

- API xác minh trả về `design` (ảnh nền và bố cục của mẫu lúc cấp). Khi chứng nhận còn hiệu lực và có `design`, trang vẽ chứng nhận thật bằng `CertificatePreview` với `certificateTexts`: tên, hoạt động, số giờ, ngày cấp đủ bốn số năm, số serial. Từ xl, thông tin xác minh nằm bên trái và bản in bên phải.
- Khi in, chỉ bản vẽ chứng nhận được in. Header, thanh bên, thanh dưới trên điện thoại và phần thông tin có `print:hidden`.
- `printableDesign` không trả về bản vẽ cho chứng nhận đã thu hồi, nên bản in không thể trông như còn hiệu lực. Chứng nhận đã thu hồi hoặc không có mẫu thì in phần thông tin xác minh.
