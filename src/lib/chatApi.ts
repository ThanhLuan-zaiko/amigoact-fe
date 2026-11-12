import "server-only";
import { getAccessToken } from "./auth";
import { backendFetch } from "./backend";
import {
  type ChatChannel,
  type ChatDm,
  type MessagePage,
  PAGE_SIZE,
  type UnreadItem,
} from "./chat";
import type { MemberPage } from "./organizations";

// Reads for the first render of the chat page. Read them behind a Suspense boundary.

function chatBase(slug: string): string {
  return `/organizations/${encodeURIComponent(slug)}/chat`;
}

async function getJson<T>(path: string): Promise<T | null> {
  const result = await backendFetch<T>(path, {
    method: "GET",
    token: await getAccessToken(),
  });
  return result.ok ? result.data : null;
}

export type ChatStart = {
  channels: ChatChannel[];
  dms: ChatDm[];
  unread: UnreadItem[];
};

// Null when the viewer is not an active member, which the backend answers with 403.
export async function getChatStart(slug: string): Promise<ChatStart | null> {
  const [channels, dms, unread] = await Promise.all([
    getJson<{ items: ChatChannel[] }>(`${chatBase(slug)}/channels`),
    getJson<{ items: ChatDm[] }>(`${chatBase(slug)}/dms`),
    getJson<{ items: UnreadItem[] }>(`${chatBase(slug)}/unread`),
  ]);
  if (!channels || !dms || !unread) {
    return null;
  }
  return { channels: channels.items, dms: dms.items, unread: unread.items };
}

export function messagesPath(roomId: string, before?: string | null): string {
  const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (before) {
    query.set("before", before);
  }
  return `/rooms/${encodeURIComponent(roomId)}/messages?${query}`;
}

export async function getRoomMessages(
  roomId: string,
): Promise<MessagePage | null> {
  return getJson<MessagePage>(messagesPath(roomId));
}

// People the viewer can start a direct message with. The backend gives at most 100 per page,
// which covers the organizations this app serves today.
export async function getChatPeople(
  slug: string,
  viewerId: string,
): Promise<{ user_id: string; full_name: string }[]> {
  const page = await getJson<MemberPage>(
    `/organizations/${encodeURIComponent(slug)}/members?limit=100&offset=0`,
  );
  return (page?.items ?? [])
    .filter((member) => member.user_id !== viewerId)
    .map(({ user_id, full_name }) => ({ user_id, full_name }));
}

// The unread total of one organization, for the list of chats. Null when it cannot be read.
export async function getChatUnreadTotal(slug: string): Promise<number | null> {
  const unread = await getJson<{ items: UnreadItem[] }>(
    `${chatBase(slug)}/unread`,
  );
  return unread
    ? unread.items.reduce((total, item) => total + item.count, 0)
    : null;
}
