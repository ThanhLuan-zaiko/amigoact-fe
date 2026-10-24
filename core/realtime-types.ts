import type { ServerEnvelope } from "./realtime-transport.ts";

/**
 * Shared realtime contracts (see docs/REALTIME.md). Split from
 * realtime-client.ts so both files stay under the size budget.
 */

export type RealtimeStatus =
  | "idle"
  | "connecting"
  | "open"
  | "reconnecting"
  | "offline";

/** Last surfaced problem, consumed by the Feedback banner. */
export type RealtimeIssue = "session" | "denied" | "error" | null;

export type ChannelHandler = (data: ServerEnvelope["data"]) => void;
export type StatusHandler = (status: RealtimeStatus) => void;
