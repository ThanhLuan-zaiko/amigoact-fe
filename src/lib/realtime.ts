// The realtime socket: topic names, frames, and the subscription counts the provider keeps.
// Pure, so bun tests cover them. See docs/realtime.md.

// The viewer's own topic. The backend joins it on connect and names it user:<id>.
export const ME = "me";

export const orgTopic = (orgId: string) => `org:${orgId}`;
export const managersTopic = (orgId: string) => `org-managers:${orgId}`;
export const roomTopic = (roomId: string) => `room:${roomId}`;

export type RealtimeData = Record<string, unknown>;

export type RealtimeFrame =
  | { kind: "event"; topic: string; data: RealtimeData }
  | { kind: "revoked"; topic: string; data: RealtimeData }
  | { kind: "other"; data: RealtimeData };

// Events on user:<id> reach listeners of ME, so a component never needs the viewer's id.
export function localTopic(topic: string): string {
  return topic.startsWith("user:") ? ME : topic;
}

export function parseRealtimeFrame(text: string): RealtimeFrame | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const data = parsed as RealtimeData;
  const topic = typeof data.topic === "string" ? localTopic(data.topic) : null;
  if (data.op === "revoked" && topic) {
    return { kind: "revoked", topic, data };
  }
  if (typeof data.type === "string" && topic) {
    return { kind: "event", topic, data };
  }
  return { kind: "other", data };
}

// How many listeners each topic has. The socket subscribes on the first and leaves on the last.
export class TopicCounts {
  private counts = new Map<string, number>();

  // True when this is the first listener, so the socket should subscribe.
  add(topic: string): boolean {
    const next = (this.counts.get(topic) ?? 0) + 1;
    this.counts.set(topic, next);
    return next === 1;
  }

  // True when this was the last listener, so the socket should unsubscribe.
  remove(topic: string): boolean {
    const current = this.counts.get(topic) ?? 0;
    if (current <= 1) {
      this.counts.delete(topic);
      return current === 1;
    }
    this.counts.set(topic, current - 1);
    return false;
  }

  // A revoked topic stops being heard, even though components still list it.
  drop(topic: string): void {
    this.counts.delete(topic);
  }

  has(topic: string): boolean {
    return this.counts.has(topic);
  }

  // Topics the socket subscribes to; ME is joined by the backend on connect.
  remote(): string[] {
    return [...this.counts.keys()].filter((topic) => topic !== ME);
  }

  get size(): number {
    return this.counts.size;
  }
}

// The browser opens the socket itself, so it needs an address it can reach. REALTIME_WS_URL
// wins, then the older CHAT_WS_URL (its /ws/chat path still works); otherwise the socket sits
// next to BACKEND_URL, which only works when the browser can reach that address.
export function realtimeSocketUrl(
  backendUrl: string | undefined,
  override: string | undefined,
  legacy: string | undefined,
): string | null {
  for (const value of [override, legacy]) {
    const explicit = value?.trim();
    if (explicit) {
      return /^wss?:\/\//.test(explicit) ? explicit : null;
    }
  }
  const base = backendUrl?.trim().replace(/\/+$/, "");
  if (!base || !/^https?:\/\//.test(base)) {
    return null;
  }
  return `${base.replace(/^http/, "ws")}/ws`;
}

// True when an event should reload a page: its type is one of these, and it passes the filter.
export function wantsRefresh(
  data: RealtimeData,
  types: readonly string[],
  orgId?: string,
): boolean {
  if (typeof data.type !== "string") {
    return false;
  }
  if (data.type === "resync") {
    return true;
  }
  if (!types.includes(data.type)) {
    return false;
  }
  return orgId === undefined || data.org_id === orgId;
}
