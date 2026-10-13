# amigoact-fe

Frontend của dự án AmigoACT.

## Giới thiệu

- Nền tảng: **Vite + React 19 + TypeScript + Tailwind CSS 4**.
- Lấy API duy nhất bằng **TanStack Query**, backend mặc định `http://localhost:8100`.
- Styling duy nhất bằng **Tailwind**, cấm file CSS mới, cấm `shadow`/`ring`, chỉ dùng **border**.
- Theme chính: **light/dark**, màu trang trí duy nhất là **xanh dương**; đỏ = lỗi, vàng = cảnh báo, xanh lá = thành công.
- Phong cách thiết kế duy nhất: **feed một cột kiểu X**, mọi trang dùng chung `PageShell` + `Section`, không lệch giao diện.
- Hạn chế tối đa chi tiết trang trí mặc định của trình duyệt (nút, input, link đều phải qua component dùng chung).
- Giới hạn file: `.tsx` tối đa **250 dòng**, `.ts` tối đa **350 dòng**.
- Mỗi thư mục chức năng nằm ở **root**, không tạo thư mục `src/`.

Chi tiết bắt buộc tuân thủ xem tại `AGENTS.md` (file tiếng Anh duy nhất) và `docs/ARCHITECTURE.md`.

## Yêu cầu môi trường

- `bun`
- Backend `amigoact-be` đang chạy tại `http://localhost:8100`

## Cài đặt

```bash
cd amigoact-fe
bun install
bun add @tanstack/react-query
```

## Chạy

```bash
bun run dev      # dev server
bun run build    # tsc + vite build
bun run lint     # oxlint
bun run preview  # xem bản build
```

Biến môi trường:

| Biến | Mô tả | Mặc định |
|---|---|---|
| `VITE_API_URL` | Địa chỉ backend | `http://localhost:8100` |

Mỗi khi `bun run dev` khởi động, terminal hiện log kiểm tra kết nối
backend (`/health` + `/ready` theo `VITE_API_URL`):

```text
[api] backend connected: http://localhost:8100 (54ms)
[api] database ready: keyspace=amigoact tables=73
```

Nếu backend chưa chạy, log báo `[api] backend unreachable...` nhưng dev
server vẫn chạy bình thường.

## Cấu trúc thư mục

```text
amigoact-fe/
  main.tsx
  App.tsx
  index.css        # chỉ chứa tailwind import + @theme + dark variant
  index.html
  core/            # api, queryClient, theme, components dùng chung
  auth/            # api, keys, hooks, schemas, components, page
  users/
  <feature>/
  docs/
    ARCHITECTURE.md
```

Cấm tạo `src/`. Mọi màn hình đều đi qua `PageShell > cột feed > Section`.

## Quy ước nhanh

- Server state chỉ qua `useQuery`/`useMutation` trong `<feature>/hooks.ts`.
- Component chỉ gọi hook, không gọi `fetch` trực tiếp.
- Mọi màu sắc phải có cặp `dark:`.
- Mọi tile dữ liệu phải có trạng thái loading/empty/error.

## Tài liệu liên quan

- `AGENTS.md`: luật dành cho agent (tiếng Anh).
- `docs/ARCHITECTURE.md`: kiến trúc frontend (tiếng Việt).
- `CONTRIBUTING.md`: quy trình đóng góp.
- `CODE_OF_CONDUCT.md`: quy tắc ứng xử.
- `SECURITY.md`: chính sách bảo mật.
- `LICENSE`: Apache-2.0.
