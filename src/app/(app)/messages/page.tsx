import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { isRoomId } from "@/lib/chat";
import { getInbox, getRoomMessages } from "@/lib/chatApi";
import Messenger from "../../_components/chat/Messenger";
import { mutedText } from "../../_components/ui";

export const metadata: Metadata = { title: "Tin nhắn | AmigoACT" };

// Every conversation of the viewer in one messenger: organization rooms, channels and
// direct messages. "?room=<id>" opens one of them.
async function MessengerPage({ searchParams }: PageProps<"/messages">) {
  const { room } = await searchParams;
  const user = await requireUser("/messages");
  const rooms = await getInbox();
  if (!rooms) {
    return (
      <p className={mutedText}>Không tải được tin nhắn. Vui lòng thử lại.</p>
    );
  }
  // A room from the address that the viewer cannot see opens nothing.
  const wanted = isRoomId(room)
    ? (rooms.find((item) => item.room_id === room) ?? null)
    : null;
  const page = wanted ? await getRoomMessages(wanted.room_id) : null;

  return (
    <Messenger
      viewerId={user.id}
      rooms={rooms}
      initialRoomId={wanted?.room_id ?? null}
      initialPage={page}
    />
  );
}

export default function MessagesPage(props: PageProps<"/messages">) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <MessengerPage {...props} />
    </Suspense>
  );
}
