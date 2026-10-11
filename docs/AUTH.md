# Đăng ký và đăng nhập — `auth/`

## 1. Wizard đăng ký theo bước

Form đăng ký chia bước để tài khoản doanh nghiệp (nhiều trường) không
ngợp (cá nhân 2 bước, doanh nghiệp 3 bước):

| Bước | Nội dung | Component |
|---|---|---|
| 1 | Chọn loại tài khoản (cá nhân/doanh nghiệp + mô tả cần gì sau) | `AccountTypeStep.tsx` |
| 2 | Họ tên, email, phone, mật khẩu, nhập lại | `PersonalInfoStep.tsx` |
| 3 (chỉ business) | Tên công ty, MST, người đại diện, CCCD, chức danh | `BusinessAccountFields.tsx` |

`core/components/StepProgress.tsx` vẽ chấm tròn + `Bước X/Y` (xong có
tích xanh) — primitive dùng chung, dashboard cũng xài (form sửa org).
Nút `Tiếp tục`/`Đăng ký` disabled cho tới khi bước hợp lệ, kèm gợi ý
`Điền đầy đủ thông tin hợp lệ để tiếp tục`. Nhấn Enter ở bước giữa chỉ
sang bước tiếp theo, không validate cả form.

## 2. Validation `touched` (không đỏ oan)

Mọi form auth chỉ hiện lỗi cho field đã chạm:

- `touched` lưu theo field, set khi `blur` (kèm validate ngay field đó)
  và khi bấm submit/Tiếp tục (đánh dấu cả bước).
- Đang gõ field chưa chạm: không đỏ. Tab ra ngoài: hiện lỗi nếu sai, sửa
  là hết ngay nhờ validate live.
- Lỗi server (`EMAIL_TAKEN`, `PHONE_TAKEN`) được đánh dấu `touched` lúc
  bắt lỗi nên luôn hiển thị, đồng thời nhảy về đúng bước.
- Mật khẩu có nút mắt xem chung một state cho cả form (`tabIndex={-1}`,
  chỉ dùng chuột), validate khác mật khẩu hiện tại (`SAME_AS_CURRENT`).

Đăng nhập (`LoginCard.tsx`) dùng đúng pattern này với 2 field email +
mật khẩu.

## 3. Hai tầng tài khoản

`RegisterForm.accountType`: `individual` gửi 4 trường cơ bản;
`business` gửi thêm `tax_code` (10 số, chi nhánh `10so-XXX`),
`company_name`, `legal_rep_name`, `legal_rep_id` (CCCD 12 số).
Validator MST/CCCD chặn số giả (toàn số giống nhau). Copy tiếng Việt nằm
hết ở `auth/messages.tsx` (file `.tsx` để qua cổng ASCII).

## 4. Thẻ phụ sticky

`AuthSidePanel` (login/register) và `AccountSidePanel` (profile/password)
dùng `w-full self-start` để không bị form cao kéo dãn, nội dung bám đỉnh
(`justify-start`), cộng `lg:sticky lg:top-20` để dính dưới navbar khi
form dài. Mobile vẫn xếp 1 cột, panel nằm dưới form như cũ.
