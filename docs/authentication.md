# Xác thực và tài khoản

Tài liệu này mô tả phần tài khoản của frontend. API và quy tắc dữ liệu đầy đủ nằm trong tài liệu `docs/authentication.md` của repo backend.

## Luồng hoạt động

Trình duyệt không gọi backend trực tiếp. Mọi lời gọi đi qua server Next.js bằng `BACKEND_URL`.

```
Trình duyệt -> Server Action (src/app/_actions) -> backendFetch (src/lib/backend.ts) -> Backend
```

| File | Vai trò |
| ---- | ---- |
| `src/proxy.ts` | Làm mới access token đã hết hạn, chuyển người chưa đăng nhập khỏi `/account` |
| `src/lib/auth.ts` | Đọc cookie, lấy người dùng hiện tại, `requireUser` |
| `src/lib/authCookies.ts` | Tên và thuộc tính cookie |
| `src/lib/backend.ts` | Gọi backend và chuẩn hóa lỗi |
| `src/lib/forms.ts` | Đổi mã lỗi của backend thành thông báo tiếng Việt |
| `src/lib/validation.ts` | Kiểm tra dữ liệu ngay trên trình duyệt |
| `src/app/_actions/` | Server Actions của các form |
| `src/app/_components/account/` | Form và ô nhập |

## Token

- Token chỉ nằm trong cookie `httpOnly`, `sameSite=lax`, và `secure` ở production. Không đưa token vào client component hay `localStorage`.
- Cookie `access_token` hết hạn cùng lúc với JWT. Khi cookie này mất đi, `proxy.ts` dùng `refresh_token` để lấy token mới trước khi trang được render.
- Nếu backend từ chối refresh token, `proxy.ts` xóa cookie. Nếu backend không phản hồi, cookie được giữ lại để thử lại sau.

## Trang

| Đường dẫn | Chức năng |
| ---- | ---- |
| `/login` | Đăng nhập, nhận `?next=` là đường dẫn trong trang. Không có `next` thì về trang chủ |
| `/register` | Đăng ký tài khoản cá nhân hoặc tổ chức. Đăng ký xong về trang chủ |
| `/forgot-password` | Yêu cầu liên kết đặt lại mật khẩu |
| `/reset-password?token=` | Đặt lại mật khẩu |
| `/verify-email?token=` | Xác minh email. Phải bấm nút, để trình quét email không làm mất token |
| `/account` | Xem và sửa thông tin, đăng xuất. Từ xl: danh mục bên trái, nội dung bên phải |
| `/account/security` | Đổi mật khẩu, quản lý thiết bị. Bố cục như `/account` |

Trang liên kết qua email dùng `referrer: "same-origin"` để token không lộ sang trang khác. Không dùng `no-referrer`, vì khi đó trình duyệt gửi `Origin: null` và Next.js từ chối Server Action.

## Đọc phiên đăng nhập

Dự án bật Cache Components, nên component đọc phiên phải nằm trong `<Suspense>`:

```tsx
<Suspense fallback={<p>Đang tải…</p>}>
  <ProfileContent />
</Suspense>
```

Không bọc việc đọc phiên trong `cache` của React. Các lệnh GET giống nhau trong một lần render đã được React gộp thành một request.

## Form

Mọi form tài khoản dùng `useAccountForm`:

```tsx
const { state, pending, formProps, passwordProps } = useAccountForm(changePassword);

<form {...formProps}>
  <FormMessage state={state} />
  <TextField errors={state.fieldErrors} label="Email" name="email" type="email" required />
  <PasswordField {...passwordProps} label="Mật khẩu" name="password" required />
  <SubmitButton pending={pending} icon={FiKey}>Lưu</SubmitButton>
</form>
```

Hook này lo các việc sau:

- Giữ dữ liệu đã nhập khi bị từ chối, và chỉ xóa khi thành công. Truyền `{ resetOnSuccess: false }` nếu form cần giữ dữ liệu sau khi lưu.
- Kiểm tra dữ liệu trước khi gửi, rồi chuyển con trỏ tới ô lỗi đầu tiên.
- Dùng `noValidate` để thay thông báo của trình duyệt bằng thông báo tiếng Việt.

### Hiển thị lỗi

- Lỗi của một ô hiện ngay dưới ô đó, kèm viền đậm và `aria-invalid`.
- Lỗi chung của cả form, như sai email hoặc mật khẩu, hiện ở đầu form qua `FormMessage`.
- Muốn gắn một mã lỗi của backend vào ô cụ thể, thêm mã đó vào `CODE_FIELDS` trong `src/lib/forms.ts`.

### Kiểm tra trên trình duyệt

`validateField` trong `src/lib/validation.ts` kiểm tra số điện thoại, mã số thuế, giấy tờ người đại diện, ngày sinh, mật khẩu mới và mật khẩu nhập lại. Backend vẫn kiểm tra lại mọi thứ, và chỉ backend mới chặn được mật khẩu phổ biến hoặc chứa thông tin cá nhân.

Một ô được coi là mật khẩu mới khi có `autoComplete="new-password"`. Form đăng nhập dùng `current-password` nên không bị áp quy tắc này.

Khi đổi quy tắc ở backend, hãy sửa `validation.ts` theo cho khớp.

### Ô mật khẩu

`PasswordField` có nút con mắt để hiện mật khẩu:

- Mọi ô mật khẩu trong cùng một form hiện hoặc ẩn cùng nhau.
- Nút có `tabIndex={-1}`, nên phím Tab đi thẳng sang ô tiếp theo.
- Khi form gửi thành công, các ô trở về trạng thái ẩn.
