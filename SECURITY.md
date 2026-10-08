# Chính sách bảo mật — amigoact-fe

## Phiên bản được hỗ trợ

| Nhánh | Trạng thái |
|---|---|
| `main` | Được hỗ trợ, vá bảo mật ưu tiên |
| Nhánh tính năng/PR | Chỉ hỗ trợ trong thời gian review |

## Phạm vi nhạy cảm

- Refresh token vận chuyển bằng cookie `HttpOnly; Secure; SameSite=Lax`, không lưu token trong `localStorage`, không gắn token vào URL.
- Access token chỉ nằm trong bộ nhớ và header `Authorization: Bearer`, không log ra console.
- API client (`core/api.ts`) bắt buộc `credentials: "include"`, xử lý lỗi theo envelope `{ code, message }`, không hiển thị stack trace cho người dùng.
- Không commit `VITE_*` secret production, token thật, dữ liệu người dùng thật.

## Cách báo cáo lỗ hổng

1. Không tạo issue công khai cho lỗ hổng chưa vá.
2. Gửi cho maintainer: mô tả, mức độ ảnh hưởng, bước tái hiện (trang, theme, vai trò), ảnh chụp đã che thông tin nhạy cảm.
3. Không khai thác vượt mức cần thiết để chứng minh.

## Cam kết xử lý

- Xác nhận tiếp nhận trong 48 giờ.
- Đánh giá và vá theo mức độ: nghiêm trọng trong 7 ngày, trung bình trong 30 ngày.
- Thông báo bản vá và ghi nhận người báo cáo (nếu đồng ý).

## Quy tắc cho người đóng góp

- Không dùng `alert()` hay `console.log` để lộ dữ liệu phiên làm việc.
- Màn hình lỗi dùng màu đỏ theo hệ semantic, không hiển thị chi tiết kỹ thuật nhạy cảm.
- Thay đổi luồng login/refresh/logout phải kiểm tra kỹ trạng thái hết hạn, thu hồi, tái sử dụng.
