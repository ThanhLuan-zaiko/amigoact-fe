# Chat

Mọi cuộc trò chuyện nằm ở một chỗ: trang `/messages` (mục "Tin nhắn" của menu), dựng theo kiểu ứng dụng nhắn tin như Telegram. Tổ chức không còn tab "Chat" riêng; đường dẫn cũ `/org/[slug]/chat` đã bị bỏ. Backend mô tả ở `amigoact-be/docs/chat.md`.

## Trang

| Đường dẫn | Nội dung | Ai xem được |
| ---- | ---- | ---- |
| `/messages` | Danh sách cuộc trò chuyện và cuộc trò chuyện đang mở. `?room=<mã phòng>` mở một phòng | Đã đăng nhập |

- Trang nằm trong `src/lib/protectedPaths.ts`, nên khách bị chuyển sang `/login`. Trang vẫn gọi `requireUser`.
- Lần render đầu đọc `GET /chat/inbox` và, nếu `?room=` là UUID có trong hộp thư, trang tin mới nhất của phòng đó. Mã phòng không hợp lệ thì không mở phòng nào.
- Đổi phòng không tải lại trang: `useMessenger` giữ trạng thái và sửa địa chỉ bằng `history.replaceState`.

## Bố cục

- Khung nhắn tin chiếm hết chiều cao dưới header (`h-[calc(100dvh-…)]`), một khung viền bo `rounded-xl`, danh sách và cuộc trò chuyện ngăn bằng đường viền, không lồng thẻ.
- Điện thoại và máy tính bảng: một cột. Chưa mở phòng thì thấy danh sách; mở phòng thì thấy cuộc trò chuyện, nút mũi tên quay về danh sách.
- Từ `lg`: hai cột, danh sách 20rem (24rem từ `2xl`) bên trái. Chưa chọn phòng thì cột phải mời chọn một cuộc trò chuyện. Trang nhắn tin tách cột từ `lg` thay vì `xl` như trang khác, vì danh sách hẹp và người dùng cần thấy cả hai cùng lúc (xem quy tắc thiết kế trong `AGENTS.md`).

## Danh sách cuộc trò chuyện

- Một danh sách phẳng cho mọi tổ chức: phòng chung (ảnh logo tổ chức), kênh (icon `#` hoặc ổ khóa), tin nhắn riêng (ảnh đại diện người kia hoặc chữ viết tắt). Kênh và tin nhắn riêng có tên tổ chức sau dấu `·`.
- Phòng có tin mới nhất ở trên cùng. Tin mới qua socket đưa phòng lên đầu ngay.
- Mỗi dòng: tên, giờ tin cuối (`listTime`: hôm nay là giờ, trong tuần là thứ, trong năm là `dd/MM`, cũ hơn là `dd/MM/yy`), dòng xem trước (`previewLine`: "Bạn: …", "Lan: Ảnh (3)", hoặc chỉ nội dung trong tin nhắn riêng) và số chưa đọc (`99+` khi lớn hơn 99).
- Ô tìm kiếm lọc theo tên phòng hoặc tên tổ chức, không phân biệt dấu (`foldText`). Bộ lọc: Tất cả, Chưa đọc, Nhóm (phòng chung và kênh), Cá nhân.
- Nút bút mở hộp "Tin nhắn mới": danh bạ từ `GET /chat/contacts`, tìm theo tên hoặc tổ chức. Chọn một người thì mở hoặc tạo tin nhắn riêng trong tổ chức đó rồi mở luôn. Một người gặp ở hai tổ chức hiện hai dòng, vì tin nhắn riêng thuộc về một tổ chức.
- Tạo kênh, lưu trữ kênh và thêm người vào kênh giới hạn chưa có giao diện. Kênh lưu trữ không có trong hộp thư.

## Cuộc trò chuyện

- Đầu khung: ảnh, tên, dòng phụ (phòng chung, tổ chức và chủ đề của kênh, hoặc "Nhắn riêng · tổ chức"), chấm trạng thái kết nối, nút mở trang tổ chức và nút xem tin đã ghim.
- Tin là bong bóng: tin của mình bên phải nền `teal-50`, tin người khác bên trái nền slate. Trong nhóm, tin người khác có ảnh chữ viết tắt và tên tác giả; tin nhắn riêng thì không. Tin đã ghim có viền teal.
- Giờ, "đã sửa" và dấu ghim nằm ở góc dưới bong bóng. Mỗi ngày mới có một nhãn ngày ở giữa.
- Tin của cùng người, cách nhau dưới 5 phút và không phải trả lời, được gộp: không lặp tên và ảnh.
- Cuộn lên gần đầu tự tải trang cũ hơn bằng `before`, giữ nguyên vị trí đang đọc. Nút "Tin cũ hơn" vẫn có cho bàn phím.
- Đang đọc ở cuối thì tin mới và ảnh tải xong giữ khung ở cuối (`ResizeObserver`). Cuộn lên xa thì hiện nút mũi tên xuống tin mới nhất.

### Thao tác với tin

| Việc | Ai làm được | Ghi chú |
| ---- | ---- | ---- |
| Gửi, trả lời, thả cảm xúc | Người vào được phòng | Enter gửi, Shift+Enter xuống dòng |
| Sửa | Tác giả | Tin có ảnh, video được xóa hết chú thích. Tin đã sửa có "đã sửa" |
| Xóa | Tác giả. Ban quản trị trong phòng chung và kênh | Xóa hẳn, kèm ảnh, video, ghim và cảm xúc. Hỏi lại bằng `ConfirmDialog` |
| Ghim, bỏ ghim | Ban quản trị trong phòng chung và kênh. Cả hai người trong tin nhắn riêng | |

- Quyền được tính trong `messageRights` (`src/lib/chat.ts`) từ `can_manage` của phòng trong hộp thư, giống quy tắc backend. Backend vẫn kiểm tra lại mọi lần gọi.
- Thao tác của mỗi tin nằm sau nút "⋯". Từ `lg` nút này chỉ hiện khi rê chuột hoặc focus, trên điện thoại luôn hiện.
- Cảm xúc đổi ngay trên màn hình rồi mới gửi. Server từ chối thì trả lại như cũ.

### Ảnh và video

- Ô soạn tin có nút kẹp giấy. Ảnh còn vào được bằng cách dán (Ctrl+V) hoặc kéo thả lên cuộc trò chuyện; khi kéo sẽ hiện khung "Thả ảnh hoặc video để gửi".
- Mỗi tệp được tải lên ngay khi chọn, qua route `/media/upload` (token vẫn nằm trong cookie). `useAttachments` dùng XHR để hiện phần trăm trên ảnh xem trước. Tệp lỗi có viền đỏ và phải bỏ đi trước khi gửi. Đang tải thì chưa gửi được.
- Quy tắc kiểm tra ở trình duyệt giống bộ sưu tập (`galleryFileError`): ảnh JPEG, PNG, WEBP tối đa 20 MB, video MP4, WEBM tối đa 50 MB, tối đa 10 tệp mỗi tin. Backend kiểm tra lại loại tệp thật.
- Gửi chỉ ảnh, không cần chữ. Chữ thành chú thích dưới album.
- Album (`MediaAlbum`): một tệp hiện nguyên chiều rộng bong bóng; nhiều tệp thành lưới tối đa 4 ô, ba tệp thì ô đầu rộng gấp đôi, ô cuối có "+N" cho tệp không vừa. Video có nút play.
- Bấm vào ô mở trình xem toàn màn hình (`MediaViewer`, `<dialog>` gốc): mũi tên trái phải hoặc phím mũi tên để chuyển, Esc để đóng, nút tải xuống, chú thích ở dưới. Video phát với điều khiển.
- Ảnh đọc qua route `/media/[id]/file` kèm token của người xem, nên chỉ thành viên phòng xem được.

## Đang nhập

- Gõ chữ vào ô soạn tin thì gửi tín hiệu `typing` qua socket chung (`RealtimeClient.typing`, hook `useRealtimeTyping`), tối đa mỗi 3 giây mỗi phòng (`TYPING_SEND_MS`). Gửi tin xong thì lần gõ kế tiếp báo lại ngay. Socket không sống thì không gửi gì.
- Nhận được tín hiệu thì người đó hiện là đang nhập trong 6 giây (`TYPING_SHOW_MS`), hoặc tới khi tin của họ tới. `useTyping` giữ danh sách và dọn tín hiệu cũ mỗi giây, chỉ khi đang có người.
- Hiển thị (`typingText`): tin nhắn riêng là "đang nhập…", nhóm là "Lan đang nhập…", "Lan và Bình đang nhập…" hoặc "Lan và 2 người khác đang nhập…". Chữ màu teal thay dòng phụ ở đầu cuộc trò chuyện và thay dòng xem trước trong danh sách.
- Code: `src/lib/typing.ts` (test ở `typing.test.ts`), `src/app/_components/chat/useTyping.ts`.

## Chưa đọc

- Phòng đang mở được đánh dấu đã đọc tới tin mới nhất (`POST /rooms/{id}/read`) mỗi khi có tin mới, và số của nó về 0. Vị trí đã đọc chỉ tiến lên (`needsReadMark`).
- Tin mới của người khác ở phòng không mở cộng thêm 1 (`inboxAfterFrame`). Bộ lọc "Chưa đọc" hiện tổng số.

## Kết nối thời gian thực

Chat dùng socket chung của app, xem `docs/realtime.md`. `useChatSocket` chỉ là lớp mỏng trên đó:

1. Nghe `room:<id>` của mọi phòng trong hộp thư, nên mọi dòng của danh sách cập nhật ngay.
2. Nghe `org:<id>` của mọi tổ chức có trong hộp thư và topic của chính mình. `rooms.changed` tải lại hộp thư.
3. Sau mỗi lần nối lại, và khi nhận `resync`, trang tải lại trang tin mới nhất của phòng đang mở và hộp thư.
4. Sự kiện `revoked` bỏ phòng khỏi danh sách. Nếu đang mở phòng đó thì đóng kèm thông báo.
5. Tin cuối của một phòng bị xóa thì hộp thư được tải lại, vì trang không biết tin nào thành tin cuối.

Sự kiện từ socket không có cờ `mine` của cảm xúc. `keepMyReactions` giữ cờ của người xem từ bản đang có.

### Polling dự phòng

- Khi socket chưa sống, mỗi 10 giây trang gọi `pollMessenger`: một Server Action lấy hộp thư và trang tin mới nhất của phòng đang mở.
- Trang tin mới nhất thay các tin trong khoảng của nó (`mergeNewestPage`), nên tin bị xóa lúc mất kết nối cũng biến mất.
- Dù socket sống, hộp thư vẫn được tải lại mỗi 60 giây.
- Chấm trạng thái ở đầu cuộc trò chuyện: xanh lá là trực tiếp, xám là đang kết nối, vàng là đang polling.

### Server Action và lỗi mạng

- Mọi lời gọi từ client đi qua các action trong `src/app/_actions/chat.ts`. Action kiểm tra mã phòng, mã tin và mã tệp là UUID, và slug đúng dạng, trước khi ghép vào đường dẫn.
- Action trả `ChatResult`: `{ ok: true, data }` hoặc `{ ok: false, code, error }` với `error` đã dịch sang tiếng Việt (`chatError`).
- `attempt` biến lỗi mạng khi gọi Server Action thành `network_error`, nên trang hiện thông báo thay vì trang lỗi.

## Code

| File | Nội dung |
| ---- | ---- |
| `src/lib/chat.ts` | Kiểu dữ liệu, quyền, kiểm tra nội dung, mã lỗi, định dạng giờ |
| `src/lib/chatEvents.ts` | Đọc khung socket, gộp tin, cảm xúc, bộ nhớ tin theo phòng |
| `src/lib/messenger.ts` | Lọc và tìm, dòng xem trước, giờ trong danh sách, cập nhật hộp thư theo sự kiện, bố cục album |
| `src/lib/chatApi.ts` | Đọc hộp thư và tin cho lần render đầu (server-only) |
| `src/app/_actions/chat.ts` | Server Action cho hộp thư, danh bạ, tin, cảm xúc, ghim, đã đọc, tin nhắn riêng |
| `src/app/_components/chat/Messenger.tsx` | Khung một hoặc hai cột, nối socket và polling |
| `src/app/_components/chat/useMessenger.ts` | Hộp thư, phòng đang mở, tin đã tải, sự kiện |
| `src/app/_components/chat/useMessageActions.ts` | Gửi, sửa, xóa, cảm xúc, ghim, tải trang cũ |
| `src/app/_components/chat/useAttachments.ts` | Tệp chờ gửi và tiến độ tải lên |
| `src/app/_components/chat/ChatList.tsx`, `ChatListRow.tsx`, `NewChatDialog.tsx` | Cột danh sách và hộp tin nhắn mới |
| `src/app/_components/chat/Conversation.tsx`, `MessageList.tsx`, `MessageBubble.tsx`, `ChatComposer.tsx` | Cuộc trò chuyện |
| `src/app/_components/chat/MediaAlbum.tsx`, `MediaViewer.tsx`, `AttachmentTray.tsx` | Ảnh và video |

Test: `src/lib/chat.test.ts`, `src/lib/chatEvents.test.ts` và `src/lib/messenger.test.ts`.
