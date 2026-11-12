# Thời gian thực

Cả app dùng chung một socket tới backend. Giao thức và danh sách topic nằm ở `amigoact-be/docs/realtime.md`. Mọi trang cần cập nhật trực tiếp đều dùng các hook dưới đây, không tự mở `WebSocket`.

## Vì sao trình duyệt nối thẳng backend

Trình duyệt không gọi API backend, và token chỉ nằm trong cookie httpOnly. Socket là ngoại lệ duy nhất, vì Next.js không chuyển tiếp được WebSocket: Route Handler đóng kết nối khi trả lời xong (xem `node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md`).

1. Client gọi Server Action `getRealtimeTicket` (`src/app/_actions/realtime.ts`). Action dùng token trong cookie gọi `POST /realtime/tickets`, rồi trả vé và địa chỉ socket.
2. Vé dùng một lần, hạn 5 phút, không mở được API nào khác, nên trình duyệt giữ vé không làm lộ phiên đăng nhập.
3. Không có phiên thì action trả `signed_out` và không chuyển hướng, nên khách chỉ đơn giản không kết nối.

## Thành phần

| File | Việc |
| ---- | ---- |
| `src/app/_components/realtime/RealtimeProvider.tsx` | Đặt trong layout `(app)`. Giữ một `RealtimeClient` cho cả app |
| `src/app/_components/realtime/client.ts` | Socket, đếm người nghe theo topic, ping, nối lại. Có test với socket giả |
| `src/app/_components/realtime/hooks.ts` | `useTopics`, `useRealtimeOpen`, `useRealtimeStatus`, `useLiveRefresh` |
| `src/app/_components/realtime/LiveRefresh.tsx` | Component cho trang server: tải lại trang khi có sự kiện |
| `src/lib/realtime.ts` | Tên topic, đọc khung, địa chỉ socket, `wantsRefresh`. Có test |

## Cách dùng

```tsx
// Trang server: tải lại khi danh sách thành viên đổi.
<LiveRefresh topic={orgTopic(organization.id)} types={["members.changed"]} />

// Topic của chính người xem: dùng ME, không cần biết user id. Lọc theo tổ chức bằng orgId.
<LiveRefresh topic={ME} types={["membership.changed"]} orgId={organization.id} />

// Client component tự xử lý sự kiện.
useTopics([roomTopic(roomId)], ({ kind, data }) => { ... });
```

- `useLiveRefresh` gom các sự kiện tới sát nhau thành một lần `router.refresh()` (150 ms). Nó cũng tải lại sau mỗi lần nối lại, vì có thể đã lỡ sự kiện, và khi topic bị thu hồi.
- `resync` luôn làm tải lại: sự kiện quá lớn để chuyển giữa các worker.

## Kết nối

- Socket chỉ mở khi có component đầu tiên nghe một topic, nên trang không có phần trực tiếp và khách không bao giờ lấy vé.
- Topic được `subscribe` khi có người nghe đầu tiên và `unsubscribe` khi người cuối rời đi. Topic bị thu hồi (`revoked`) không được đăng ký lại khi nối lại.
- Mỗi 25 giây gửi `ping`. Mất kết nối thì lấy vé mới và nối lại sau 1, 2, 4… tối đa 30 giây. Đóng với mã 4408 (hết 30 phút) thì nối lại ngay. Socket chưa mở sau 10 giây thì bỏ và thử lại. Có mạng trở lại hoặc quay lại tab thì thử ngay.
- Không có địa chỉ socket hoặc không có phiên thì trạng thái là `offline` và chỉ thử lại khi quay lại tab. Chat chuyển sang polling.

## Địa chỉ socket

Đọc lúc chạy, phía server, trong `getRealtimeTicket`:

1. `REALTIME_WS_URL`, ví dụ `wss://api.example.com/ws`. Production phải đặt biến này.
2. `CHAT_WS_URL` cũ, ví dụ `wss://api.example.com/ws/chat`. Đường dẫn `/ws/chat` vẫn chạy như bí danh.
3. Không đặt cả hai thì dùng `BACKEND_URL` đổi `http` thành `ws` và thêm `/ws`. Chỉ đúng khi trình duyệt cũng tới được `BACKEND_URL`, như lúc phát triển trên máy.

## Đang dùng ở đâu

| Chỗ | Topic | Sự kiện |
| ---- | ---- | ---- |
| Chuông thông báo | `ME` | `notification.created`, `.read`, `.read_all`, `.deleted` |
| Chat | `room:<id>` cho mỗi phòng, `org:<id>` và `ME` | Tin nhắn; `rooms.changed` tải lại danh sách phòng |
| Trang duyệt yêu cầu | `org-managers:<id>` | `applications.changed` |
| Trang Thành viên | `org:<id>` | `members.changed` |
| Nút tham gia, chờ duyệt, rời tổ chức (`MembershipAction`) | `ME`, lọc theo tổ chức | `membership.changed` |
