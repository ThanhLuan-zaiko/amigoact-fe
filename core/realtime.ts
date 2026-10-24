/**
 * Single WebSocket client for the whole app (see docs/REALTIME.md).
 *
 * Public facade over `core/realtime-client.ts`: the client mints a
 * one-time ticket via POST /ws/tickets, opens /ws?ticket=..., answers
 * server heartbeat ping.v1 with pong.v1, and speaks {"type","data"}
 * envelopes. TanStack Query stays the source of truth: consumers only
 * invalidate query keys or apply narrow deltas inside channel handlers.
 */

export {
  activitiesChannel,
  attendanceChannel,
  chatChannel,
  membersChannel,
  notificationsChannel,
  postsChannel,
} from "./channels.ts";
export { realtime } from "./realtime-client.ts";
export type {
  ChannelHandler,
  RealtimeIssue,
  RealtimeStatus,
  StatusHandler,
} from "./realtime-types.ts";
export type { ServerEnvelope } from "./realtime-transport.ts";

import { realtime } from "./realtime-client.ts";
import type { ChannelHandler, StatusHandler } from "./realtime-types.ts";

export function subscribeChannel(
  channel: string,
  handler: ChannelHandler,
): () => void {
  return realtime.subscribe(channel, handler);
}

export function onRealtimeStatus(handler: StatusHandler): () => void {
  return realtime.onStatus(handler);
}

export function sendTypingPing(channel: string): void {
  realtime.sendTyping(channel);
}

/** Force an immediate reconnect, skipping the backoff wait. */
export function retryRealtime(): void {
  realtime.reconnectNow();
}
