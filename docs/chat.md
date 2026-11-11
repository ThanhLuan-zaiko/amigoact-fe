# Chat

Chat nằm trong từng tổ chức, tại tab "Chat" của `OrgNav`. Backend mô tả ở `amigoact-be/docs/chat.md`.

## Các trang

| Đường dẫn | Nội dung | Ai xem được |
| ---- | ---- | ---- |
| `/organizations/[slug]/chat` | Danh sách phòng và phòng đang mở. `?room=<mã phòng>` chọn phòng | Thành viên đang hoạt động |
| `/messages` | Mục "Tin nhắn" của menu: danh sách tổ chức bạn chat được, kèm tổng số chưa đọc | Đã đăng nhập |

- Tab "Chat" chỉ hiện với thành viên đang hoạt động (`viewer.status === "active"`). Người khác mở thẳng đường dẫn thì thấy thông báo "Chỉ dành cho thành viên".
- Cả hai trang nằm trong `src/lib/protectedPaths.ts`, nên khách bị chuyển sang `/login`. Trang vẫn gọi `requireUser`.
- Mã phòng trên địa chỉ phải là UUID và nằm trong danh sách phòng người xem thấy, nếu không thì mở phòng chung.

## Bố cục

- Điện thoại: một cột. Không có `?room=` thì hiện danh sách phòng. Chọn phòng thì hiện phòng, nút mũi tên quay về danh sách.
- Từ `xl`: hai cột, danh sách phòng 20rem bên trái, phòng đang mở bên phải. Không có `?room=` thì mở phòng chung.
- Đổi phòng không tải lại trang: `ChatShell` giữ trạng thái và sửa địa chỉ bằng `history.replaceState`.

## Phòng

- Phòng chung có mã trùng mã tổ chức, luôn đứng đầu.
- Kênh: kênh mở trước, kênh giới hạn (icon khóa) sau, kênh lưu trữ (icon hộp) cuối. Kênh lưu trữ chỉ đọc: ô soạn tin được thay bằng dòng "Kênh đã lưu trữ".
- Tin nhắn riêng: xếp theo tên người kia. Ô "Nhắn riêng cho" ở cuối danh sách mở hoặc tạo cuộc trò chuyện với một thành viên (tối đa 100 người đầu tiên của danh sách thành viên).
- Tạo kênh, lưu trữ kênh và thêm người vào kênh giới hạn chưa có giao diện.

## Tin nhắn

| Việc | Ai làm được | Ghi chú |
| ---- | ---- | ---- |
| Gửi, trả lời, thả cảm xúc | Người vào được phòng, trừ kênh lưu trữ | Enter gửi, Shift+Enter xuống dòng |
| Sửa | Tác giả, trừ kênh lưu trữ | Không giới hạn thời gian. Tin đã sửa có "(đã sửa)" |
| Xóa | Tác giả. Ban quản trị trong phòng chung và kênh | Xóa hẳn, kèm ghim và cảm xúc. Hỏi lại bằng `ConfirmDialog` |
| Ghim, bỏ ghim | Ban quản trị trong phòng chung và kênh. Cả hai người trong tin nhắn riêng | Nút dấu trang trên đầu phòng mở danh sách tin đã ghim |

- Quyền được tính trong `messageRights` (`src/lib/chat.ts`), giống quy tắc backend. Backend vẫn kiểm tra lại mọi lần gọi.
- Backend xóa tin hẳn (không có xóa mềm như bình luận), nên giao diện bỏ tin khỏi danh sách và không để lại chỗ trống.
- Thao tác của mỗi tin nằm sau nút "⋯". Từ `xl` nút này chỉ hiện khi rê chuột hoặc focus, trên điện thoại luôn hiện.
- Cảm xúc đổi ngay trên màn hình rồi mới gửi. Server từ chối thì trả lại như cũ.
- Tin của cùng người, cách nhau dưới 5 phút và không phải trả lời, được gộp: không lặp tên và giờ. Mỗi ngày mới có một dòng ngày.
- "Tin cũ hơn" tải trang trước bằng `before`, giữ nguyên vị trí đang đọc.
- Nội dung từ 1 đến 2000 ký tự, đếm theo code point như backend (một emoji là một ký tự). Ký tự điều khiển trừ xuống dòng và tab bị từ chối (`validateMessage`).

## Chưa đọc

- Số chưa đọc của từng phòng hiện cạnh tên phòng (`99+` khi lớn hơn 99).
- Phòng đang mở được đánh dấu đã đọc tới tin mới nhất (`POST /rooms/{id}/read`) mỗi khi có tin mới, và số của nó về 0. Vị trí đã đọc chỉ tiến lên (`needsReadMark`).
- Trên điện thoại, khi đang xem danh sách phòng thì không phòng nào được tính là đang mở.
- Tin mới của người khác ở phòng không mở cộng thêm 1 (`unreadAfterFrame`).

## Kết nối thời gian thực

Trình duyệt không gọi thẳng backend, và token chỉ nằm trong cookie httpOnly. WebSocket là ngoại lệ duy nhất, vì Next.js không chuyển tiếp được WebSocket: Route Handler đóng kết nối khi trả lời xong (xem `node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md`). Cách làm:

1. Client gọi Server Action `getSocketTicket` (`src/app/_actions/chat.ts`). Action dùng token trong cookie gọi `POST /chat/tickets` và chỉ trả về vé.
2. Client mở `WebSocket` tới `CHAT_WS_URL?ticket=<vé>`. Vé dùng một lần, hạn 5 phút, không mở được API nào khác, nên trình duyệt giữ vé không làm lộ phiên đăng nhập. Token không bao giờ tới trình duyệt.
3. Mở xong thì đăng ký mọi phòng trong danh sách (`subscribe`), nên số chưa đọc của phòng khác cũng cập nhật ngay. Phòng thêm hoặc bớt thì đăng ký hoặc hủy theo.
4. Mỗi 25 giây gửi `ping`. Mất kết nối thì lấy vé mới và nối lại sau 1, 2, 4… tối đa 30 giây. Đóng với mã 4408 (hết 30 phút) thì nối lại ngay. Socket chưa mở sau 10 giây thì bỏ và thử lại. Có mạng trở lại hoặc quay lại tab thì thử ngay.
5. Sau mỗi lần nối lại, trang tải lại trang tin mới nhất của phòng đang mở và danh sách phòng, để bù sự kiện đã lỡ.
6. Sự kiện `revoked` bỏ phòng khỏi danh sách. Nếu đang mở phòng đó thì về danh sách kèm thông báo.

Sự kiện từ socket không có cờ `mine` của cảm xúc. `keepMyReactions` giữ cờ của người xem từ bản đang có.

### Địa chỉ socket

- `CHAT_WS_URL` (đọc lúc chạy, phía server) là địa chỉ đầy đủ mà trình duyệt kết nối được, ví dụ `wss://api.example.com/ws/chat`. Production phải đặt biến này.
- Không đặt thì dùng `BACKEND_URL` đổi `http` thành `ws` và thêm `/ws/chat`. Chỉ đúng khi trình duyệt cũng tới được `BACKEND_URL`, như lúc phát triển trên máy.
- Không có địa chỉ hợp lệ nào thì trang chỉ dùng polling.

### Polling dự phòng

- Khi socket chưa sống (đang nối, mất kết nối, hoặc không cấu hình), mỗi 10 giây trang gọi `pollChat`: một Server Action lấy trang tin mới nhất của phòng đang mở và số chưa đọc của mọi phòng.
- Trang tin mới nhất thay các tin trong khoảng của nó (`mergeNewestPage`), nên tin bị xóa lúc mất kết nối cũng biến mất. Tin cũ đã tải vẫn giữ.
- Dù socket sống, danh sách phòng vẫn được tải lại mỗi 60 giây, vì tin nhắn riêng mới do người khác mở không có sự kiện.
- Tab bị ẩn thì bỏ qua lượt polling.
- Đầu phòng có chấm trạng thái: xanh lá là trực tiếp, xám là đang kết nối, vàng là đang polling.

### Server Action và lỗi mạng

- Mọi lời gọi từ client đi qua các action trong `src/app/_actions/chat.ts`. Action kiểm tra mã phòng và mã tin là UUID trước khi ghép vào đường dẫn, vì tham số đến từ trình duyệt.
- Action trả `ChatResult`: `{ ok: true, data }` hoặc `{ ok: false, code, error }` với `error` đã dịch sang tiếng Việt (`chatError`).
- Gọi Server Action ném lỗi khi mất mạng. `attempt` biến lỗi đó thành `network_error`, nên trang hiện thông báo thay vì trang lỗi.
- Next.js chạy các Server Action của một trang lần lượt từng cái. Polling vì vậy gộp hai lời gọi vào một action.

## Code

| File | Nội dung |
| ---- | ---- |
| `src/lib/chat.ts` | Kiểu dữ liệu, danh sách phòng, quyền, kiểm tra nội dung, mã lỗi, địa chỉ socket, định dạng giờ |
| `src/lib/chatEvents.ts` | Đọc khung socket, gộp tin, cảm xúc, chưa đọc, bộ nhớ tin theo phòng |
| `src/lib/chatApi.ts` | Đọc dữ liệu cho lần render đầu (server-only) |
| `src/app/_actions/chat.ts` | Server Action cho vé, tin, cảm xúc, ghim, đã đọc, tin nhắn riêng |
| `src/app/_components/chat/useChatSocket.ts` | Vé, kết nối, đăng ký phòng, nối lại |
| `src/app/_components/chat/useChatState.ts` | Phòng, chưa đọc, tin đã tải và các thao tác |
| `src/app/_components/chat/ChatShell.tsx` | Bố cục một hoặc hai cột, nối socket và polling |

Test: `src/lib/chat.test.ts` và `src/lib/chatEvents.test.ts`.

## Chưa có

- Tạo, lưu trữ kênh và quản lý người trong kênh giới hạn.
- Tìm thành viên khi tổ chức có hơn 100 người để nhắn riêng.
- Tệp đính kèm, nhắc tên, tìm kiếm, thông báo đẩy, đang gõ.
- Số chưa đọc của chat trên menu chung.
