import type { ServerEnvelope } from "./realtime-transport.ts";

/**
 * Shared realtime contracts (AGENTS.md 12.1). Split from
 * realtime-client.ts so both files stay under the size budget.
 */

export type RealtimeStatus =
  | "idle"
  | "connecting"
  | "open"
  | "reconnecting"
  | "offline";

/** Last surfaced problem, consumed by the Feedback banner (12.5). */
export type RealtimeIssue = "session" | "denied" | "error" | null;

export type ChannelHandler = (data: ServerEnvelope["data"]) => void;
export type StatusHandler = (status: RealtimeStatus) => void;
