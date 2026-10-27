# Realtime — `core/realtime.ts` + Speculation Rules

## 1. WebSocket client (module duy nhất, xem AGENTS.md, Data)

Toàn bộ vòng đời socket nằm trong `core/realtime.ts`. Component không bao
giờ gọi `new WebSocket` trực tiếp — dữ liệu live đi qua typed hook trong
`<feature>/hooks.ts`, và TanStack Query vẫn là source of truth (message WS
chỉ invalidate đúng query key hoặc apply delta hẹp).

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

Hợp đồng với backend (`amigoact-be` docs/REALTIME.md):

1. Handshake: client `POST /ws/tickets` (Bearer JWT qua `apiFetch`, tự
   refresh-401) → mở `ws(s)://<api>/ws?ticket=<one-time-ticket>`. Ticket
   một lần nên mỗi lần (re)connect đều xin ticket mới.
2. **Guest**: `401` khi xin ticket (chưa đăng nhập) → client mở
   `ws(s)://<api>/ws` không ticket — socket ẩn danh của backend chỉ
   subscribe được kênh public (`orgs:directory`, `announcements:feed`,
   `events:feed`);
   kênh private vẫn nhận `FORBIDDEN` + `4403` như thường.
3. Sau khi mở, server gửi `ready.v1` (`heartbeat_seconds` được dùng để chỉnh
   watchdog) rồi client `subscribe.v1` lại toàn bộ kênh đang giữ
   (resubscribe-on-reconnect). Kênh `notifications:{userId}` server tự join
   trên socket đã auth.
4. Heartbeat: server `ping.v1` mỗi ~25s → client trả `pong.v1`. Watchdog:
   không có frame nào trong `heartbeat + 15s` thì client tự đóng để chạy
   reconnect.
5. Reconnect: exponential backoff `500ms × 2^n` (cap 15s) + jitter.
   `FORBIDDEN` trên kênh → đánh dấu denied, không resubscribe kênh đó nữa.
6. Mã đóng: `4401` ticket sai, `4403` bị từ chối, `4400` bad frame, `4408`
   miss pong — mọi close đều chạy reconnect trừ khi teardown chủ động.

API xuất ra:

| Export | Vai trò |
|---|---|
| `subscribeChannel(channel, handler)` | Đăng ký kênh, trả về hàm unsubscribe |
| `onRealtimeStatus(handler)` | Nghe `idle`/`connecting`/`open`/`reconnecting`/`offline` cho banner kết nối (copy tiếng Việt) |
| `retryRealtime()` | Reconnect ngay, bỏ qua backoff — dùng cho nút "Thử lại" của banner |
| `notificationsChannel` / `attendanceChannel` / `activitiesChannel` / `membersChannel` | Helper tên kênh chuẩn backend |
| `realtime` | Singleton client (dùng nội bộ hai hàm trên) |

Socket machinery nằm trong `core/realtime-client.ts` (class
`RealtimeClient`, bookkeeping `RealtimeIssue`: `session` / `denied` /
`error`); `core/realtime.ts` chỉ là facade export API. Banner kết nối là
`core/components/RealtimeBanner.tsx`, mount một lần trong `PageShell`
dưới `CenterHeader`: reconnecting đọc amber (transient), `session`
(4401) và `denied` (4403) đọc red kèm hành động Đăng nhập / Thử lại,
`error` (frame `error.v1` không phải FORBIDDEN) đọc amber kèm Thử lại.
Banner tự giữ một status listener nên socket không teardown khi hết
channel subscriber — chỉ mở socket khi có kênh subscribe, listener đơn
thuần không tự kết nối.

`subscribe.v1` chỉ gửi một frame cho mỗi channel dù có nhiều handler cùng
đăng ký, và `unsubscribe.v1` bị trì hoãn ~750ms (`UNSUB_LINGER_MS`) — hủy
nếu kênh được subscribe lại trong cửa sổ đó (StrictMode mount hai lần,
điều hướng nhanh). Server giới hạn 20 subscribe/phút và 20 frame/giây nên
hai lớp giảm frame này tránh `error.v1` `TOO_MANY_REQUESTS`.

Socket tự teardown về `idle` khi không còn subscriber/status listener nào.
Các kênh public hoạt động trên socket ẩn danh: `orgs:directory` (qua
`useOrgsRealtime`), `announcements:feed` (qua `useAnnouncementsRealtime`,
payload `{action, post_id, org_id}`) và `events:feed` (qua
`useEventsRealtime` ở trang `/events`, payload `{action, activity_id, org_id}`
với `action` là `updated`, `removed` hoặc `seats`). Tất cả chỉ là gợi ý
invalidate query, không phải sự thật; trang `/events` gộp các gợi ý trong
800 ms rồi invalidate toàn bộ nhóm `activityKeys.browseAll()`.

### Toast realtime (thành viên)

Toast hiển thị giữa đáy màn hình qua `ToastViewport` (mount trong
`PageShell`, nguồn dữ liệu là store `core/toast.ts` — gọi `pushToast()`
từ bất kỳ đâu, kể cả handler kênh ngoài React). Hai điểm phát:

- `useMemberRealtime(orgId, selfId)` trên `/manage/members`: sự kiện
  `members:{orgId}` của *actor khác* → toast kèm tên tra từ query cache;
  bỏ qua khi `actor_id`/`user_id` là chính mình (mutation đã toast, còn
  thay đổi nhắm vào mình do `useMembershipRealtime` lo).
- `useMembershipRealtime(userId)` qua `MembershipRealtime` mount một lần
  trong `App.tsx` (mọi trang, không chỉ `/manage`): sự kiện
  `notifications:{user}` `scope:"membership"` nhắm vào mình → toast
  (được mời, bị tạm khóa/xóa, đổi vai trò) đồng thời invalidate
  `dashboardKeys.all`; action tự gây ra (accepted/declined/joined/left)
  trả `null` nên không toast.

Hai hook trên đều gọi `syncPermissionScopes` (`dashboard/permission-sync.ts`).
Ngoài `dashboardKeys.all`, các action làm đổi quyền (`promoted`, `demoted`,
`role_granted`, `role_revoked`, `role_catalog_changed`, `suspended`,
`reactivated`, `removed`) còn invalidate `activityKeys.all` (feed
`/manage/events` mang `can_create`/`can_manage`), nhóm `posts` và `channels`
của workspace (mang `viewer_permissions`). Backend vẫn kiểm quyền ở mọi request;
bước này chỉ giữ nút bấm khớp với quyền thật.

Payload member event có thêm trường tùy chọn `detail` (chuỗi) khi hành động
gắn với một vai trò cụ thể — backend gửi ở các action
`role_granted` / `role_revoked` (tên vai trò vừa gán/thu) và
`role_catalog_changed` (tên vai trò vừa thay đổi trong danh mục).
`memberEventToast` / `membershipEventToast` nhận `detail` làm đối số cuối;
thiếu `detail` thì copy rơi về "vai trò mới". `role_catalog_changed` đi trên
kênh `members:{orgId}` (roster) và, khi *quyền* của vai trò đổi hoặc vai trò
bị xóa, còn đi riêng tới `notifications:{user}` của từng người đang giữ vai
trò đó (trừ người thực hiện) để họ cập nhật dù không mở trang thành viên.
Đổi tên hoặc mô tả vai trò không gửi thông báo cá nhân.

`role_catalog_changed` còn mang hai `detail` đặc biệt: `order` (chủ sở hữu đổi
thứ tự bậc vai trò, chỉ đi trên `members:{orgId}`) và `defaults` (chủ sở hữu
đổi quyền mặc định của thành viên, đi trên `members:{orgId}` và tới từng thành
viên đang hoạt động, tối đa 500 người). `memberEventToast` /
`membershipEventToast` có copy riêng cho hai giá trị này.

Tạm cấm chat dùng hai action `chat_timeout` (kèm `detail` là thời điểm hết hạn,
ISO-8601) và `chat_untimeout`. Cả hai đi trên `members:{orgId}` và tới
`notifications:{user}` của người bị cấm. `syncPermissionScopes` coi chúng như
action đổi quyền: invalidate nhóm `safety` của workspace (`workspaceKeys.safety`)
để ô soạn tin khóa hoặc mở lại. Truy vấn `safety` tự poll mỗi 30 giây khi người
xem đang bị cấm, vì hạn cấm hết theo đồng hồ chứ không có sự kiện.

## 2. Speculation Rules API (`index.html`)

`index.html` chứa `<script type="speculationrules">` với `prefetch` và
`prerender` cùng `eagerness: "moderate"` cho navigation same-origin an
toàn (GET). Trình duyệt không hỗ trợ sẽ bỏ qua block này.

Danh sách loại trừ (không prerender/prefetch vùng auth hoặc tác vụ):

- Luồng auth cá nhân: `/login*`, `/register*`, `/verify*`,
  `/forgot-password*`, `/reset-password*`, `/change-password*`.
- Vùng riêng tư: `/profile*`, `/manage*`, `/my-dashboard*`, `/logout*`, `/auth/*`.
- Đường dẫn tải/tác vụ: `/export*` (và mọi mutation URL sau này).

Khi thêm route mới vào `App.tsx`, cập nhật JSON rules trong cùng thay đổi
Không dùng `instant.page` hay `<link rel="prefetch">` thủ công.
