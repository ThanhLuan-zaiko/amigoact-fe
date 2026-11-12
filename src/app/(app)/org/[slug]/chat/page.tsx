import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { buildRooms, isRoomId } from "@/lib/chat";
import {
  getChatPeople,
  getChatSocketUrl,
  getChatStart,
  getRoomMessages,
} from "@/lib/chatApi";
import { getOrganization } from "@/lib/organizationApi";
import ChatShell from "../../../../_components/chat/ChatShell";
import EmptyState from "../../../../_components/EmptyState";
import { mutedText } from "../../../../_components/ui";

export const metadata: Metadata = { title: "Chat tổ chức | AmigoACT" };

const GENERAL_ROOM_NAME = "Phòng chung";

async function OrganizationChat({
  params,
  searchParams,
}: PageProps<"/org/[slug]/chat">) {
  const { slug } = await params;
  const { room } = await searchParams;
  const user = await requireUser(`/org/${slug}/chat`);
  const organization = await getOrganization(slug);
  if (!organization) {
    return null;
  }
  if (organization.viewer.status !== "active") {
    return (
      <EmptyState
        title="Chỉ dành cho thành viên"
        description="Hãy tham gia tổ chức để trò chuyện cùng mọi người."
      />
    );
  }
  const start = await getChatStart(slug);
  if (!start) {
    return <p className={mutedText}>Không tải được chat. Vui lòng thử lại.</p>;
  }
  const general = { id: organization.id, name: GENERAL_ROOM_NAME };
  const rooms = buildRooms(general, start.channels, start.dms);
  // A room from the address that the viewer cannot see falls back to the general room.
  const wanted = isRoomId(room) ? rooms.find((item) => item.id === room) : null;
  const [page, people] = await Promise.all([
    getRoomMessages(wanted?.id ?? general.id),
    getChatPeople(slug, user.id),
  ]);

  return (
    <ChatShell
      slug={slug}
      general={general}
      viewer={{ userId: user.id, canManage: organization.viewer.can_manage }}
      channels={start.channels}
      dms={start.dms}
      unread={start.unread}
      initialRoomId={wanted?.id ?? null}
      initialPage={page}
      people={people}
      socketUrl={getChatSocketUrl()}
    />
  );
}

export default function OrganizationChatPage(
  props: PageProps<"/org/[slug]/chat">,
) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <OrganizationChat {...props} />
    </Suspense>
  );
}
