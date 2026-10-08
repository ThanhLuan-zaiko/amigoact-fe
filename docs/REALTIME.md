# Realtime — `core/realtime.ts` + Speculation Rules

## 1. WebSocket client (module duy nhất, AGENTS.md §12.1)

Toàn bộ vòng đời socket nằm trong `core/realtime.ts`. Component không bao
giờ gọi `new WebSocket` trực tiếp — dữ liệu live đi qua typed hook trong
`<feature>/hooks.ts`, và TanStack Query vẫn là source of truth (message WS
chỉ invalidate đúng query key hoặc apply delta hẹp, §12.2).

```ts
import {
  subscribeChannel,
  notificationsChannel,
  activitiesChannel,
  onRealtimeStatus,
} from "../core/realtime.ts";

// Trả về hàm unsubscribe — dùng trong useEffect cleanup.
const off = subscribeChannel(activitiesChannel(orgId), (payload) => {
  queryClient.invalidateQueries({ queryKey: orgKeys.activities(orgId) });
});
```

Hợp đồng với backend (`amigoact-be` AGENTS.md §16):

1. Handshake: client `POST /ws/tickets` (Bearer JWT qua `apiFetch`, tự
   refresh-401) → mở `ws(s)://<api>/ws?ticket=<one-time-ticket>`. Ticket
   một lần nên mỗi lần (re)connect đều xin ticket mới.
2. Sau khi mở, server gửi `ready.v1` (`heartbeat_seconds` được dùng để chỉnh
   watchdog) rồi client `subscribe.v1` lại toàn bộ kênh đang giữ
   (resubscribe-on-reconnect). Kênh `notifications:{userId}` server tự join.
3. Heartbeat: server `ping.v1` mỗi ~25s → client trả `pong.v1`. Watchdog:
   không có frame nào trong `heartbeat + 15s` thì client tự đóng để chạy
   reconnect.
4. Reconnect: exponential backoff `500ms × 2^n` (cap 15s) + jitter.
   `401` khi xin ticket (chưa đăng nhập) → trạng thái `offline`, chờ
   `subscribe` tiếp theo. `FORBIDDEN` trên kênh → đánh dấu denied, không
   resubscribe kênh đó nữa.
5. Mã đóng: `4401` ticket sai, `4403` bị từ chối, `4400` bad frame, `4408`
   miss pong — mọi close đều chạy reconnect trừ khi teardown chủ động.

API xuất ra:

| Export | Vai trò |
|---|---|
| `subscribeChannel(channel, handler)` | Đăng ký kênh, trả về hàm unsubscribe |
| `onRealtimeStatus(handler)` | Nghe `idle`/`connecting`/`open`/`reconnecting`/`offline` cho banner kết nối (copy tiếng Việt, §12.5) |
| `notificationsChannel` / `attendanceChannel` / `activitiesChannel` | Helper tên kênh chuẩn backend |
| `realtime` | Singleton client (dùng nội bộ hai hàm trên) |

Socket tự teardown về `idle` khi không còn subscriber/status listener nào.

## 2. Speculation Rules API (`index.html`, §12.4)

`index.html` chứa `<script type="speculationrules">` với `prefetch` và
`prerender` cùng `eagerness: "moderate"` cho navigation same-origin an
toàn (GET). Trình duyệt không hỗ trợ sẽ bỏ qua block này.

Danh sách loại trừ (không prerender/prefetch vùng auth hoặc tác vụ):

- Luồng auth cá nhân: `/login*`, `/register*`, `/verify*`,
  `/forgot-password*`, `/reset-password*`, `/change-password*`.
- Vùng riêng tư: `/profile*`, `/manage*`, `/my-dashboard*`, `/logout*`, `/auth/*`.
- Đường dẫn tải/tác vụ: `/export*` (và mọi mutation URL sau này).

Khi thêm route mới vào `App.tsx`, cập nhật JSON rules trong cùng thay đổi
(§12.4). Không dùng `instant.page` hay `<link rel="prefetch">` thủ công.
