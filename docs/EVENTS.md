# Trang sự kiện `/events` — amigoact-fe

Route `/events` (`activities/page.tsx`) hiển thị feed sự kiện công khai. Dữ liệu lấy từ `GET /activities/browse` của backend (xem `amigoact-be/docs/EVENTS.md`).

## 1. Bố cục

- Cột giữa (`page.tsx`) chỉ có tiêu đề và danh sách sự kiện.
- Cột phải (`components/EventsBrowseRail.tsx`, gắn trong `core/components/RightRail.tsx` theo route `/events`) giữ toàn bộ điều khiển: tìm kiếm, chip nhanh, tab thời gian, bộ lọc (danh mục, thành phố, từ/đến ngày, thẻ, sắp xếp) và chip trạng thái của tab `Của tôi`. Cấu trúc giống `EventsRail` của `/manage/events`.
- Rail và trang cùng đọc một URL (`useEventsUrl`), nên không cần truyền state giữa hai bên.
- Khi đã đăng nhập, rail thêm hai khối ở cuối:
  - `Sự kiện của tôi` (`activities/components/MyEventsCard.tsx`): danh sách từ `/me/activities`, cùng nguồn với `/manage/events`. Lọc các sự kiện nháp, đã công bố, đang diễn ra và chưa qua 24 giờ, sắp theo giờ bắt đầu, tối đa 5 mục. Có realtime qua `useLiveMyActivities` như trang quản lý. Liên kết "Xem thêm" dẫn tới `/manage/events`.
  - `Chat sự kiện` (`workspace/components/ActivityChatsCard.tsx`): các phòng chat của sự kiện từ hộp thư `/manage/chat`, phòng có tin chưa đọc lên đầu, tối đa 5 mục. Mỗi dòng mở đúng phòng trên `/manage/chat`.
- Trên điện thoại rail nằm trong cửa sổ bên, mở bằng nút "Mở cột bên" ở thanh tiêu đề, giống `/manage/events`.
- Tab: `Sắp tới`, `Đang diễn ra`, `Đã qua`. Khi đã đăng nhập thêm `Của tôi`. Tab là `role="tablist"`, phím mũi tên đổi tab và đưa focus theo. Rail hẹp nên tab xuống dòng.
- Mỗi hàng (`EventRow`): ô ngày, tên, tổ chức (logo, nhãn đã xác minh), địa điểm, chip trạng thái, số chỗ. Ảnh bìa hiện từ `@md:` trở lên.
- Rail không nằm trong cột `@container`, nên không dùng được biến thể `@lg:` trong rail. Bộ lọc xếp một cột.
- Chỉ dùng hai bậc responsive thật: cột giữa `PageShell` rộng 600px nên chỉ `@md:`, `@lg:`, `@xl:` có tác dụng (xem luật trong `AGENTS.md`).

## 2. Trạng thái URL

Mọi bộ lọc nằm trong query string để chia sẻ được link. Mặc định không ghi vào URL.

| Tham số | Ý nghĩa |
|---|---|
| `tab` | `live`, `past`, `mine` (bỏ qua khi là `upcoming`) |
| `q` | Từ khóa, debounce 350 ms trước khi ghi URL |
| `category`, `city`, `mode` (`online` hoặc `offline`) | Bộ lọc |
| `tag` | Slug thẻ. Giữ nguyên link `/events?tag=slug` từ các trang khác |
| `open=1` | Chỉ sự kiện đang mở đăng ký |
| `from`, `to` | Ngày theo giờ địa phương `YYYY-MM-DD`. `to` là ngày bao gồm |
| `sort=published` | Sắp theo ngày công bố (mặc định là ngày diễn ra) |
| `page` | Trang, 12 mục mỗi trang |
| `reg` | Chỉ tab `Của tôi`: lọc theo trạng thái đăng ký |

Đổi bộ lọc dùng `replace` và xóa `page`. Đổi tab thì push lịch sử. Giá trị sai bị bỏ qua khi đọc URL (`readFilters`).

## 3. Dữ liệu

- `browse-api.ts`: kiểu và hàm gọi `/activities/browse`, `/activities/browse/mine`, `/registrations/mine/brief`.
- `browse-utils.ts`: đọc URL thành bộ lọc, dựng query cho backend, patch query string.
- `browse-hooks.ts`:
  - `useBrowse`, `useBrowseMine` dùng `keepPreviousData`, nên đổi trang không làm trống danh sách (danh sách mờ đi khi đang tải).
  - `useMyBriefMap` trả map `activity_id` sang trạng thái của người dùng, rỗng với khách.
  - `useEventsRealtime` đăng ký `events:feed` và `orgs:directory`, gộp gợi ý trong 800 ms rồi invalidate `activityKeys.browseAll()`.
- Khóa query (`keys.ts`): mọi danh sách, bản "Của tôi" và map brief nằm dưới `browseAll()`, nên một lần invalidate làm mới tất cả.
- Đăng ký, duyệt, hủy (`registrations/hooks.ts`) cũng invalidate `browseAll()`, vì số chỗ và trạng thái trên trang này thay đổi theo.

## 4. Trạng thái giao diện

Mỗi khối dữ liệu có đủ loading, empty, error:

- Loading: `LoadingState`.
- Lỗi: `ErrorState` với nút `Thử lại`. Thông báo tiếng Việt lấy từ `toVietnameseBrowseMessage(code)`.
- Trống theo tab: tiêu đề riêng cho từng tab. Trống do bộ lọc: gợi ý bỏ bớt bộ lọc và nút `Xóa bộ lọc`.
- Khách mở `Của tôi`: `EmptyState` với nút `Đăng nhập` dẫn tới `/login`.
- Khi backend báo `truncated`: dòng nhắc chỉ hiển thị các sự kiện gần nhất.

## 5. Chip và màu

- Chip dùng chung `StateChip` với 4 tông: `emerald` (thành công, đang mở đăng ký), `amber` (cần chú ý: sắp hết hạn, chờ duyệt, danh sách chờ), `red` (bị từ chối), `zinc` (trung tính, đã đóng, đã hủy).
- Số chỗ (`SeatsMeter`) không dùng đỏ: khi hết chỗ hiện "Hết chỗ, vào danh sách chờ" vì sự kiện vẫn nhận đăng ký.
- Mọi màu có cặp `dark:`. Các chỗ dùng sky, indigo trước đây trong đường dẫn này đã đổi sang zinc.

## 6. Thành phần

| File | Vai trò |
|---|---|
| `page.tsx` | Cột giữa: tiêu đề và danh sách |
| `components/EventsBrowseRail.tsx` | Cột phải: tab, tìm kiếm, chip, bộ lọc, trạng thái của tôi |
| `components/EventsTabs.tsx` | Tab theo mẫu WAI |
| `components/EventsFilters.tsx` | Ô tìm kiếm và chip nhanh |
| `components/EventsFilterPanel.tsx` | Danh mục, thành phố, ngày, thẻ, sắp xếp. Danh mục, thành phố và thẻ lấy từ `facets` của chính kết quả, nên chỉ hiện giá trị có sự kiện khớp, kèm số đếm |
| `components/TagFilter.tsx` | Thẻ dạng dropdown: bấm vào mở danh sách thẻ của kết quả (kèm số đếm), gõ để lọc ngay trên danh sách, đồng thời hỏi danh bạ thẻ công khai (`/tags?q=`) cho thẻ ngoài kết quả. Phím mũi tên và Enter để chọn |
| `components/MyStatusFilter.tsx` | Chip trạng thái của tab `Của tôi` |
| `components/EventsFeed.tsx` | Các trạng thái loading, error, empty, danh sách, phân trang |
| `components/EventRow.tsx` | Một hàng, thuần trình bày, không gọi hook |
| `components/DateTile.tsx`, `SeatsMeter.tsx`, `RegistrationStateChip.tsx`, `MyRegistrationChip.tsx`, `StateChip.tsx` | Khối hiển thị nhỏ |

## 7. Kiểm tra

- `bun run build`, `bun run lint`, `bun scripts/check-size.ts`.
- Cổng CI: không có `shadow`/`ring-` trong `.tsx`/`.ts`; `.ts` chỉ ASCII; comment `.tsx` chỉ ASCII; `page.tsx` có tiếng Việt; không gọi `fetch(` trong `.tsx`.
- Kiểm tra thủ công ở 360, 768, 1024 và 1440 px, cả light và dark: khách và người đã đăng nhập, link `/events?tag=...`, backend tắt để xem trạng thái lỗi, hai tab trình duyệt để xem realtime, focus bàn phím trên tab và chip.
