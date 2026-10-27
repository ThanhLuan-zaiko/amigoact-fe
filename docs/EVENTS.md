# Trang sự kiện `/events` — amigoact-fe

Route `/events` (`activities/page.tsx`) hiển thị feed sự kiện công khai. Dữ liệu lấy từ `GET /activities/browse` của backend (xem `amigoact-be/docs/EVENTS.md`). Trang chi tiết `/events/:orgId/:slug` lấy thêm card từ `GET /activities/{id}/card`.

## 1. Bố cục

- Cột giữa (`page.tsx`) có tiêu đề, danh sách sự kiện và, khi đang ở điện thoại, thanh điều khiển ở trên (`components/EventsMobileBar.tsx`).
- Từ 1024 px, cột phải (`components/EventsBrowseRail.tsx`, gắn trong `core/components/RightRail.tsx` theo route `/events`) giữ toàn bộ điều khiển: tìm kiếm, chip nhanh, tab thời gian, bộ lọc (danh mục, thành phố, từ/đến ngày, thẻ, sắp xếp) và chip trạng thái của tab `Của tôi`.
- Dưới 1024 px, rail nằm trong cửa sổ bên mở bằng nút "Mở cột bên", và chỉ còn hai khối cá nhân. Điều khiển chuyển lên cột giữa (`EventsMobileBar`), và nút "Bộ lọc (n)" mở `EventsFilterSheet` với đúng các bộ lọc của rail.
- Rail và trang cùng đọc một URL (`useEventsUrl`), và `useEventsBrowseState` gom phần glue dùng chung cho rail và thanh điện thoại.
- `PageShell` chỉ mount rail một lần (cột phải từ 1024 px, cửa sổ bên dưới đó), nên id trong rail không bị trùng.
- Khi đã đăng nhập, rail thêm hai khối ở cuối:
  - `Sự kiện của tôi` (`activities/components/MyEventsCard.tsx`): danh sách từ `/me/activities`, cùng nguồn với `/manage/events`. Tối đa 5 mục. Liên kết "Xem thêm" dẫn tới `/manage/events`.
  - `Chat sự kiện` (`workspace/components/ActivityChatsCard.tsx`): các phòng chat của sự kiện, tối đa 5 mục.
- Tab: `Sắp tới`, `Đang diễn ra`, `Đã qua`. Khi đã đăng nhập thêm `Của tôi`. Tab là `role="tablist"`, phím mũi tên đổi tab và đưa focus theo. Trên điện thoại tab cuộn ngang (`layout="scroll"`).
- Khi có tổ chức đang được lọc (`?org=`), cột giữa hiện chip "Tổ chức: X ×" (`OrgScopeChip`). Bấm chip để bỏ lọc.
- Mỗi hàng (`EventRow`) là một `<li>` có `relative`. Tiêu đề là liên kết phủ cả hàng (`after:absolute after:inset-0`), còn các thành phần khác trong hàng (tổ chức, thẻ, nút đăng ký) có `relative z-10` để nằm trên lớp phủ. Hàng hiện: ô ngày (có năm nếu khác năm hiện tại), giờ bắt đầu và kết thúc theo `formatEventWhen`, nhãn "Hôm nay" hoặc "Còn N ngày", tổ chức (logo, nhãn đã xác minh, link tới `/orgs/:slug`), địa điểm kèm thành phố, mô tả ngắn (2 dòng), tối đa 3 thẻ, chip trạng thái, số chỗ, và nút đăng ký nhanh. Ảnh bìa hiện từ `@md:` trở lên.
- Hàng sự kiện đã hủy là chữ thuần, không phải liên kết, vì không còn trang chi tiết.
- Rail không nằm trong cột `@container`, nên không dùng được biến thể `@lg:` trong rail. Bộ lọc xếp một cột.
- Chỉ dùng hai bậc responsive thật: cột giữa `PageShell` rộng 600px nên chỉ `@md:`, `@lg:`, `@xl:` có tác dụng (xem luật trong `AGENTS.md`).

## 2. Trạng thái URL

Mọi bộ lọc nằm trong query string để chia sẻ được link. Mặc định không ghi vào URL.

| Tham số | Ý nghĩa |
|---|---|
| `tab` | `live`, `past`, `mine` (bỏ qua khi là `upcoming`) |
| `q` | Từ khóa, tối đa 100 ký tự, debounce 350 ms trước khi ghi URL. `tag` cắt ở 60 ký tự, `city` ở 80 |
| `category`, `city`, `mode` (`online` hoặc `offline`) | Bộ lọc |
| `tag` | Slug thẻ. Giữ nguyên link `/events?tag=slug` từ các trang khác |
| `org` | Slug tổ chức. Chỉ áp cho các tab công khai, tab `Của tôi` bỏ qua |
| `open=1` | Chỉ sự kiện đang mở đăng ký (cả tab `Của tôi`) |
| `from`, `to` | Ngày theo giờ địa phương `YYYY-MM-DD`. `to` là ngày bao gồm. Nếu `to` trước `from`, ô đến ngày báo lỗi và FE không gửi cận trên lên backend. Áp cho cả tab `Của tôi` |
| `sort=published` | Sắp theo ngày công bố (mặc định là ngày diễn ra). Chỉ tab công khai |
| `page` | Trang, 12 mục mỗi trang, tối đa 42 (backend giới hạn offset 500). Trong một cửa sổ thời gian |
| `cursor` | Token của cửa sổ thời gian, chỉ tab công khai. Do nút "Xem sự kiện xa hơn" đặt, không nhập tay |
| `reg` | Chỉ tab `Của tôi`: lọc theo trạng thái đăng ký |

Đổi bộ lọc dùng `replace`, xóa `page` và xóa `cursor` (mọi thay đổi làm đổi nội dung feed đều bắt đầu lại từ cửa sổ đầu). Đổi tab và đổi trang thì push lịch sử; đổi trang còn cuộn về đầu danh sách. Giá trị sai bị bỏ qua, giá trị quá dài bị cắt khi đọc URL (`readFilters`). Nếu trang hiện tại vượt quá tổng số trang (URL sửa tay hoặc dữ liệu vừa bị gỡ), trang tự lùi về trang cuối bằng `replace`.

Tab `Của tôi` không gửi `org`, `sort` và `cursor`. Chip "Tổ chức" và chip sắp xếp không hiện ở tab này, và `org` không được tính là đang lọc (`hasNarrowing`).

## 3. Dữ liệu

- `browse-api.ts`: kiểu và hàm gọi `/activities/browse`, `/activities/browse/mine`, `/registrations/mine/brief` và `/activities/{id}/card` (`fetchEventCard`). `BrowsePage.next_cursor` và `BrowseItem.quick_apply` theo đúng contract backend.
- `browse-utils.ts`: đọc URL thành bộ lọc, dựng query cho backend (`toPublicQuery`, `toMineQuery`), patch query string, `hasNarrowing` và `activeFilterCount`.
- `browse-state-hooks.ts`: `useEventsBrowseState()` cho rail và thanh điện thoại. Gồm bộ lọc, hai query, facet, tên thẻ, `selectTab` và `setTag`.
- `browse-hooks.ts`:
  - `useEventsUrl().patch` xóa `cursor` khi thay đổi làm đổi nội dung feed.
  - `useBrowse`, `useBrowseMine` dùng `keepPreviousData`, nên đổi trang không làm trống danh sách (danh sách mờ đi khi đang tải).
  - `useMyBriefMap` trả map `activity_id` sang trạng thái của người dùng, rỗng với khách.
  - `useEventsRealtime` đăng ký `events:feed` và `orgs:directory`, gộp gợi ý trong 800 ms rồi invalidate `activityKeys.browseAll()`.
- `detail-hooks.ts`:
  - `useEventCard(id)` tải card của trang chi tiết. 404 không thử lại; card không chặn trang.
  - `useEventDetailRealtime(orgId, id, slug)` nghe `events:feed`, lọc theo `activity_id`, gộp 800 ms rồi invalidate card, detail và bySlug.
- Khóa query (`keys.ts`): mọi danh sách, bản "Của tôi", map brief và card nằm dưới `browseAll()`, nên một lần invalidate làm mới tất cả.
- Đăng ký, duyệt, hủy (`registrations/hooks.ts`) cũng invalidate `browseAll()`, vì số chỗ và trạng thái trên trang này thay đổi theo.

## 4. Trạng thái giao diện

Mỗi khối dữ liệu có đủ loading, empty, error:

- Loading: `LoadingState`.
- Lỗi: `ErrorState` với nút `Thử lại`. Thông báo tiếng Việt lấy từ `toVietnameseBrowseMessage(code)`. Khi lỗi là `VALIDATION_ERROR` (cursor hoặc bộ lọc không hợp lệ), nút là `Xóa bộ lọc`, vì thử lại không sửa được.
- Trống theo tab: tiêu đề riêng cho từng tab. Trống do bộ lọc: gợi ý bỏ bớt bộ lọc và nút `Xóa bộ lọc`. Trống trong một cửa sổ mà vẫn còn cửa sổ sau: nút `Xem sự kiện xa hơn`.
- Khách mở `Của tôi`: `EmptyState` với nút `Đăng nhập` dẫn tới `/login`.
- Khi backend báo `truncated`: dòng nhắc mỗi lần chỉ hiển thị một khoảng thời gian, chọn khoảng ngày hoặc bấm "Xem sự kiện xa hơn".
- Chân danh sách: nút `Xem sự kiện xa hơn` khi có `next_cursor`, và `Về đầu danh sách` khi đang ở cửa sổ sau.
- Khi danh sách đang cập nhật: `aria-busy` trên danh sách và một dòng `role="status"` ẩn ("Đang cập nhật…").

## 5. Đăng ký nhanh và đăng nhập quay lại

- `QuickRegisterButton` chỉ hiện khi `quick_apply` là `true`, sự kiện đang mở đăng ký, và người xem chưa đăng ký hoặc đã hủy.
- Khách thấy `Đăng nhập để đăng ký`. Link là `/login?next=<đường dẫn hiện tại>`, nên sau khi đăng nhập người dùng quay lại đúng danh sách.
- Người đã đăng nhập bấm `Đăng ký tham gia` (hoặc `Vào danh sách chờ` khi hết chỗ). Thông báo thành công lấy từ `applyOutcomeCopy`. Trạng thái hàng cập nhật qua `browseAll`.
- Lỗi `INVALID_REGISTRATION_STATE` (sự kiện vừa thêm câu hỏi hoặc ca) kèm link "Mở trang đăng ký". Lỗi `REGISTRATION_CLOSED` và `ALREADY_REGISTERED` làm mới danh sách.
- Không có hộp xác nhận: đăng ký hủy được, và nhãn nêu rõ hành động.
- Đăng nhập quay lại (`auth/next-path.ts`): `safeNextPath` chỉ nhận đường dẫn cùng origin, không có `//`, `\` hay khoảng trắng, và không quay lại `/login`. `LoginCard` và `RequireGuest` đều dùng hàm này; mọi giá trị khác rơi về `/`.

## 6. Chip và màu

- Chip dùng chung `StateChip` với 4 tông: `emerald` (thành công, đang mở đăng ký), `amber` (cần chú ý: sắp hết hạn, chờ duyệt, danh sách chờ), `red` (bị từ chối), `zinc` (trung tính, đã đóng, đã hủy).
- Số chỗ (`SeatsMeter`) không dùng đỏ: khi hết chỗ hiện "Hết chỗ, vào danh sách chờ" vì sự kiện vẫn nhận đăng ký.
- Mọi màu có cặp `dark:`.

## 7. Thành phần

| File | Vai trò |
|---|---|
| `page.tsx` | Cột giữa: tiêu đề, thanh điện thoại, chip tổ chức, danh sách và điều hướng cửa sổ |
| `components/EventsBrowseRail.tsx` | Cột phải: điều khiển trên desktop, cá nhân trên điện thoại |
| `components/EventsMobileBar.tsx` | Điện thoại: tìm kiếm, chip nhanh, tab cuộn, nút bộ lọc |
| `components/EventsFilterSheet.tsx` | Sheet bộ lọc trên điện thoại (`Modal` bên phải) |
| `components/EventsTabs.tsx` | Tab theo mẫu WAI, `wrap` hoặc `scroll` |
| `components/EventsFilters.tsx` | Ô tìm kiếm và chip nhanh |
| `components/EventsFilterPanel.tsx` | Danh mục, thành phố, ngày, thẻ, sắp xếp. Danh mục, thành phố và thẻ lấy từ `facets` của chính kết quả, kèm số đếm |
| `components/TagFilter.tsx` | Thẻ dạng dropdown: bấm vào mở danh sách thẻ của kết quả, gõ để lọc, và hỏi danh bạ thẻ công khai cho thẻ ngoài kết quả |
| `components/MyStatusFilter.tsx` | Chip trạng thái của tab `Của tôi` |
| `components/OrgScopeChip.tsx` | Chip tổ chức đang lọc |
| `components/EventsFeed.tsx` | Các trạng thái loading, error, empty, danh sách, điều hướng cửa sổ, phân trang |
| `components/EventRow.tsx` | Một hàng, dạng liên kết phủ cả hàng |
| `components/QuickRegisterButton.tsx` | Đăng ký nhanh trên hàng, hoặc đăng nhập để đăng ký |
| `components/DateTile.tsx`, `SeatsMeter.tsx`, `RegistrationStateChip.tsx`, `MyRegistrationChip.tsx`, `StateChip.tsx` | Khối hiển thị nhỏ |

## 8. Trang chi tiết `/events/:orgId/:slug`

- `detail-page.tsx` ghép các khối: `EventDetailHeader` (tổ chức, tên, chip trạng thái, danh mục, thẻ), `EventMeta` (thời gian, địa điểm, giờ, số chỗ còn lại, hạn đăng ký), `EventPeopleSection` (đối tác và nhân sự), `ApplyCard` (đăng ký), `SchedulePanel`, `AnnouncementPanel`, `ActivityGallery` và `ReviewsPanel`.
- Ảnh bìa, tổ chức, số chỗ còn lại và trạng thái nhận đăng ký lấy từ card. Trước khi card tải xong, trang vẫn hiện đầy đủ dữ liệu chi tiết và số chỗ tối đa.
- Card báo `registration_open = false` thì không hiện form, dù trạng thái là `published` hoặc `ongoing`. Người đã đăng ký vẫn thấy trạng thái và vé của mình.
- Chip trạng thái không hiện khi sự kiện đã công bố. Các trạng thái khác (đang diễn ra, đã kết thúc, bản nháp) vẫn hiện.
- Không tìm thấy (404) thì hiện "Không tìm thấy hoạt động". Lỗi khác (mạng, 5xx) thì hiện "Không tải được hoạt động" kèm nút "Thử lại". `useActivityBySlug` không thử lại khi gặp 404.
- Phần đối tác và nhân sự hiện trạng thái đang tải, lỗi kèm "Thử lại", hoặc danh sách. Không còn thông báo "Chỉ thành viên" cho khách.
- `ApplyCard` chỉ tải biểu mẫu và ca khi sự kiện đang nhận đăng ký. Sự kiện khác không gọi hai API này.
- Realtime: `useEventDetailRealtime` làm mới card và chi tiết khi `events:feed` báo đúng sự kiện này.
- Tiêu đề trình duyệt là tên sự kiện (`useDocumentTitle`, `core/page-title.ts`).

## 9. Kiểm tra

- `bun run build`, `bun run lint`, `bun scripts/check-size.ts`.
- Cổng CI: không có `shadow`/`ring-` trong `.tsx`/`.ts`; `.ts` chỉ ASCII; comment `.tsx` chỉ ASCII; `page.tsx` có tiếng Việt; không gọi `fetch(` trong `.tsx`.
- Kiểm tra thủ công ở 360, 768, 1024 và 1440 px, cả light và dark: khách và người đã đăng nhập, link `/events?tag=...` và `/events?org=...`, backend tắt để xem trạng thái lỗi, hai tab trình duyệt để xem realtime, focus bàn phím trên tab, chip và nút đăng ký nhanh.
- Kịch bản đăng nhập quay lại: khách bấm đăng ký nhanh, đăng nhập, rồi quay về đúng trang. Thử `next=//evil.com`, `next=https://evil.com`, `next=/\evil`, và chúng đều rơi về `/`.
