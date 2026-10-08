# Hướng dẫn đóng góp — amigoact-fe

Tài liệu này viết bằng tiếng Việt. Luật kỹ thuật bắt buộc nằm ở `AGENTS.md` (tiếng Anh). Nếu có mâu thuẫn, `AGENTS.md` được ưu tiên.

## 1. Chuẩn bị

```bash
cd amigoact-fe
bun install
```

Đọc trước: `README.md`, `docs/ARCHITECTURE.md`, `AGENTS.md` mục 2–8.

## 2. Tạo tính năng mới

1. Tạo một thư mục ở root theo tên bounded context, ví dụ `posts/`.
2. Tạo tối thiểu: `api.ts`, `keys.ts`, `hooks.ts`, `schemas.ts`, `components/`, `page.tsx`.
3. Không tạo thư mục `src/`. Không tạo file CSS mới. Không đặt component dùng chung trong thư mục tính năng.
4. `.tsx` không quá 250 dòng, `.ts` không quá 350 dòng. Vượt thì tách tile bento, tách hook, tách util.

## 3. Quy tắc kỹ thuật tóm tắt

- Server state chỉ qua TanStack Query. Cấm `fetch` trực tiếp trong component, cấm `useEffect` để fetch.
- Mỗi feature có key factory trong `keys.ts`, mutation phải invalidate đúng key.
- Chỉ dùng Tailwind. Cấm `shadow-*`, `ring-*`, `box-shadow`, CSS module, styled-components, `style={}` cho trang trí.
- Chỉ dùng border (`border-zinc-200 dark:border-zinc-800` cho card). Focus dùng `outline` theo mẫu dùng chung.
- Màu sắc: light/dark bắt buộc, xanh dương trang trí, đỏ lỗi, vàng cảnh báo, xanh lá thành công. Cấm thêm màu mới khi chưa sửa `AGENTS.md`.
- Mọi trang dùng `PageShell > bento grid > BentoCard`. Trang mới phải so sánh cạnh trang cũ để tránh lệch giao diện.
- Mọi tile dữ liệu phải có loading (skeleton), empty, error qua `Feedback.tsx`.
- Không render `<button>`, `<input>`, `<select>`, `<a>` trần — dùng primitive trong `core/components/`.

## 4. Kiểm tra bắt buộc

```bash
bun run build
bun run lint
```

Tự kiểm tra: số dòng file, không còn `shadow`/`ring`, mọi màu có cặp `dark:`, API đi qua hook, responsive không tràn ở 360px.

## 5. Quy trình pull request

1. Đặt tên nhánh rõ ràng: `feat/auth-page`, `fix/bento-drift`.
2. Đính kèm ảnh chụp light/dark (desktop + mobile) khi đổi giao diện.
3. Mô tả PR gồm: mục tiêu, hook/key Query ảnh hưởng, thay đổi `core/components` (nếu có), cách kiểm tra trạng thái loading/error/empty.
4. Cập nhật tài liệu tiếng Việt liên quan (`README.md`, `docs/ARCHITECTURE.md`).
5. Không merge khi build/lint đỏ, lệch bento grid, hoặc thiếu dark mode.

## 6. Báo lỗi giao diện

Ghi rõ: trang, breakpoint, theme (light/dark), bước tái hiện, ảnh chụp, kết quả mong đợi/thực tế.
