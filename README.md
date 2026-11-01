# AmigoACT - Frontend

Giao diện web của hệ thống AmigoACT, xây dựng bằng [Next.js](https://nextjs.org) 16, React 19, [Tailwind CSS](https://tailwindcss.com) và [Bun](https://bun.sh). Dự án hiện mới có trang khởi tạo mặc định.

> Next.js 16 có nhiều thay đổi so với các phiên bản cũ. Trước khi viết code, hãy đọc tài liệu trong `node_modules/next/dist/docs/` và xem [AGENTS.md](AGENTS.md).

## Yêu cầu

- [Bun 1.4.2](https://bun.sh/docs/installation), phiên bản được ghim trong trường `packageManager` của `package.json`

## Cài đặt

```bash
bun install
```

## Chạy ứng dụng

```bash
bun dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt. Trang sẽ tự cập nhật khi bạn sửa file.

Khi máy chủ khởi động, terminal sẽ in một dòng cho biết frontend có gọi được API của backend không:

- `Backend API connected: ...` nghĩa là backend đang phản hồi.
- `Backend API unreachable: ...` nghĩa là không kết nối được. Hãy kiểm tra backend đã chạy chưa.
- `Backend API returned HTTP ...` nghĩa là backend trả về lỗi. Hãy kiểm tra log của backend.

Mặc định frontend gọi `http://127.0.0.1:8100`. Muốn đổi địa chỉ, sao chép `.env.example` thành `.env.local` rồi sửa `BACKEND_URL`. Cách khác là đặt biến môi trường `BACKEND_URL` trước khi chạy `bun dev`. File `.env.local` không được commit.

## Lệnh thường dùng

| Lệnh | Mục đích |
| ---- | -------- |
| `bun dev` | Chạy máy chủ phát triển |
| `bun run lint` | Kiểm tra code bằng Biome |
| `bun run format` | Định dạng code bằng Biome (ghi thẳng vào file) |
| `bunx tsc --noEmit` | Kiểm tra kiểu TypeScript |
| `bun run build` | Build bản production |
| `bun test` | Chạy test (khi đã có file test) |

## Quy tắc giao diện

- Chỉ dùng Tailwind CSS. File `app/globals.css` chỉ chứa dòng `@import "tailwindcss";`.
- Không viết file CSS riêng và không dùng thuộc tính `style={{...}}`.
- Tên biến, hàm, component và kiểu dữ liệu viết bằng tiếng Anh. Chữ hiển thị cho người dùng viết bằng tiếng Việt.
- Giới hạn độ dài file: `.ts` tối đa 350 dòng, `.tsx` tối đa 260 dòng.
- Không đặt code trong thư mục `src/`. Mã ứng dụng nằm trong `app/`.

## Cấu trúc thư mục

```
amigoact-fe/
├── app/              layout.tsx, page.tsx, globals.css
├── public/           tệp tĩnh
├── .github/          CI và các mẫu issue, pull request
├── biome.json        cấu hình Biome
├── instrumentation.ts  kiểm tra kết nối backend khi khởi động
├── next.config.ts    cấu hình Next.js
└── tsconfig.json     cấu hình TypeScript
```

## Kiểm tra CI

Mỗi push và pull request đều chạy 13 gate trong `.github/workflows/ci.yml`, gồm: cài đặt từ lockfile, lint, format, type check, build, test, giới hạn số dòng file, tên biến tiếng Anh, không có file rác, quét secret, kiểm tra workflow và quy tắc giao diện chỉ dùng Tailwind.

## Đóng góp

Xem [CONTRIBUTING.md](.github/CONTRIBUTING.md) để biết cách tạo nhánh, commit và mở pull request. Báo lỗi bảo mật theo hướng dẫn trong [SECURITY.md](.github/SECURITY.md), không mở issue công khai.

## Giấy phép

Dự án được phát hành theo giấy phép MIT. Xem [LICENSE](LICENSE).
