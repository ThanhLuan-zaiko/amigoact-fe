import "server-only";
import { getAccessToken } from "./auth";
import { backendFetch } from "./backend";
import { type ChatRoom, type MessagePage, PAGE_SIZE } from "./chat";

// Reads for the first render of the messenger page. Read them behind a Suspense boundary.

async function getJson<T>(path: string): Promise<T | null> {
  const result = await backendFetch<T>(path, {
    method: "GET",
    token: await getAccessToken(),
  });
  return result.ok ? result.data : null;
}

export function messagesPath(roomId: string, before?: string | null): string {
  const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (before) {
    query.set("before", before);
  }
  return `/rooms/${encodeURIComponent(roomId)}/messages?${query}`;
}

// Every conversation of the viewer in every organization, newest activity first.
export async function getInbox(): Promise<ChatRoom[] | null> {
  const inbox = await getJson<{ items: ChatRoom[] }>("/chat/inbox");
  return inbox ? inbox.items : null;
}

export async function getRoomMessages(
  roomId: string,
): Promise<MessagePage | null> {
  return getJson<MessagePage>(messagesPath(roomId));
}
