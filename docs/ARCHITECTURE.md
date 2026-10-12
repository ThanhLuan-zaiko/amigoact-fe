# Kiến trúc frontend — amigoact-fe

## 1. Tổng quan

`amigoact-fe` là SPA React + Vite + TypeScript, styling bằng Tailwind duy nhất, dữ liệu qua TanStack Query tới `amigoact-be` (`http://localhost:8100`). Ngôn ngữ thiết kế duy nhất là bento grid, theme light/dark, màu trang trí xanh non `#AFF092`.

Mục tiêu: mọi trang nhìn thống nhất, không lệch spacing/card/typography/màu, file ngắn (`.tsx` ≤ 250, `.ts` ≤ 350), logic dữ liệu tách khỏi giao diện.

## 2. Nguyên tắc tổ chức

- Không có thư mục `src/`. Mỗi tính năng là một thư mục ở root (`auth/`, `users/`).
- `core/` chứa duy nhất phần dùng chung: `api.ts`, `queryClient.ts`, `theme.ts`, `components/` (`PageShell`, `BentoCard`, `Button`, `TextField`, `Feedback`).
- Mỗi tính năng gồm: `api.ts` (hàm gọi HTTP thuần), `keys.ts` (query-key factory), `hooks.ts` (`useQuery`/`useMutation`), `schemas.ts` (type + validator), `components/` (tile con), `page.tsx` (ghép `PageShell` + `BentoCard`).
- `main.tsx` chỉ khởi tạo provider + router + theme. `App.tsx` chỉ là route shell. Cấm fetch và logic nghiệp vụ ở hai file này.

## 3. Luồng dữ liệu

```text
page.tsx / components/*.tsx
  -> hooks.ts (useQuery/useMutation)
  -> api.ts (fetch qua core/api.ts)
  -> backend :8100 (kèm cookie HttpOnly)
  -> QueryClient cache -> invalidate đúng key sau mutation
```

- `core/queryClient.ts`: `staleTime 30s`, `gcTime 5p`, `retry 1`, `refetchOnWindowFocus false`.
- Session auth là server state: `useSession()` (`retry false`, `staleTime 60s`); login/refresh/logout là mutation và invalidate `authKeys.session`.
- Component chỉ render `data/isPending/isError`, không gọi `api.ts` trực tiếp, không dùng `useEffect` để fetch.

## 4. Styling và theme

- `index.css` chỉ chứa `@import "tailwindcss"`, `@custom-variant dark`, `@theme` token. Cấm file CSS mới, cấm `@apply` tràn lan, cấm `style={}` cho trang trí.
- Chỉ dùng border, cấm tuyệt đối `shadow-*`, `drop-shadow-*`, `box-shadow`, `ring-*`.
- Card chuẩn: `rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950`.
- Khoảng cách chuẩn: grid `gap-4 sm:gap-6`, stack `space-y-4`, inline `gap-2 sm:gap-3`.
- Theme `.dark` trên `<html>`, lưu `localStorage`, mặc định theo hệ thống. Mọi màu phải có cặp `dark:`.
- Bảng màu:
  - Nền/chữ: `white/zinc-950`, `zinc-900/zinc-100`.
  - Trang trí: xanh non `#AFF092` duy nhất (token `brand`, pha loãng bằng opacity `bg-brand/10`, `border-brand/40`).
  - Lỗi: đỏ. Cảnh báo: vàng/amber. Thành công: xanh lá. Info: màu brand (phân biệt bằng icon + nhãn).
  - Cấm tím, hồng, cam, teal, cyan, xanh dương, indigo cho khung UI.

## 5. Bento grid và chống lệch giao diện

- Cấu trúc mọi trang: `PageShell > grid bento > BentoCard`.
- Ngoại lệ: `/manage` dùng một tile full-row chứa sidebar trái (`aside`) và viewport phải (`section`), bên trong vẫn là các `BentoCard`.
- Grid chuẩn: `grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-6 lg:grid-cols-12`, tile dùng `md:col-span-*`/`lg:col-span-*` (`4` thường, `8` hero, `12` full-row).
- Trang đầu tiên chốt shell (chiều cao header, gap, card, typography). Trang sau tái sử dụng `PageShell`, `BentoCard`, `Button`, `TextField`, `Feedback`. Đổi card phải sửa `BentoCard`, không override từng trang.
- Typography chuẩn: display `text-2xl sm:text-3xl font-semibold tracking-tight`, tiêu đề card `text-base sm:text-lg font-semibold`, thân `text-sm`, caption `text-xs`.
- Responsive: mobile 1 cột, `md` 6 cột, `lg` 12 cột, không tràn ngang ở 360px, nút chính cao ≥ 44px.
- Mỗi tile dữ liệu phải có skeleton loading, empty, error. Không tile trống, không `alert()`, không `console.log` lỗi.

## 6. Chống style mặc định của trình duyệt

- Không render `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>` trần — bắt buộc qua primitive trong `core/components/`.
- Select dùng `appearance-none` + chevron tùy chỉnh, input có border `zinc-300/dark:zinc-700` + `rounded-lg` + placeholder rõ ràng.
- Focus luôn custom: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`, cấm `outline-none` mà không có thay thế.
- `index.html` phải có favicon/title/meta thật, không để `vite.svg` hay chữ mẫu.

## 7. Chất lượng

- TypeScript strict: cấm `any`, đủ kiểu cho hợp đồng API, không biến/tham số thừa.
- Kiểm tra trước merge: `bun run build`, `bun run lint`, đếm dòng `.tsx/.ts`, quét `shadow`/`ring`, soát `dark:`, kiểm tra loading/error/empty, so sánh cạnh với trang cũ, chụp ảnh light/dark desktop + mobile.

## 8. Tài liệu tính năng

- `docs/AUTH.md`: wizard đăng ký theo bước, validation `touched`, hai tầng tài khoản, thẻ phụ sticky.
- `docs/BOARD.md`: bảng tin bài viết — tab đã đăng/nháp/thùng rác, block editor (chèn ảnh/video mọi vị trí), trang đọc, vòng đời xóa mềm/khôi phục/xóa cứng.
- `docs/ORGS.md`: trang public `/orgs` + `/orgs/:slug` (discovery board, trust checklist, realtime `orgs:directory`), CRUD tổ chức (xóa mềm/khôi phục/xóa cứng), thùng rác, dropzone ảnh/video, upload `FormData`.
- `docs/REALTIME.md`: singleton socket `core/realtime.ts`, ticket một lần, socket ẩn danh cho kênh public, resubscribe + backoff.
