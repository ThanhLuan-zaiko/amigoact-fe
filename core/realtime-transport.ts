import {
  ApiError,
  apiBaseUrl,
  apiFetch,
  isGuestSession,
  probeSession,
} from "./api.ts";

/** Wire glue for realtime-client.ts: URL build + handshake ticket fetch. */

export const CLOSE_UNAUTHORIZED = 4401;
export const CLOSE_FORBIDDEN = 4403;
export const MAX_FRAME_CHARS = 1_000_000;

const WS_PATH = "/ws";
const TICKETS_PATH = "/ws/tickets";

interface WsTicket {
  ticket: string;
  expires_in: number;
}

export function wsUrl(ticket: string): string {
  const url = new URL(apiBaseUrl());
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  // Keep ticket in query per backend contract. Never log the returned URL.
  const basePath = url.pathname.replace(/\/+$/, "");
  url.pathname = `${basePath}${WS_PATH}`;
  // Empty ticket opens an anonymous guest socket (public channels only).
  url.search = ticket ? `?ticket=${encodeURIComponent(ticket)}` : "";
  return url.toString();
}

export interface ServerEnvelope {
  type: string;
  data: Record<string, unknown>;
}

/** Strict envelope decode: anything off-contract returns null. */
export function parseEnvelope(raw: string): ServerEnvelope | null {
  let frame: ServerEnvelope;
  try {
    frame = JSON.parse(raw) as ServerEnvelope;
  } catch {
    return null;
  }
  if (typeof frame !== "object" || frame === null) return null;
  if (typeof frame.type !== "string") return null;
  if (frame.data === null || typeof frame.data !== "object") return null;
  return frame;
}

export type TicketOutcome = "guest" | "retry" | { ticket: string };

/**
 * Mint a one-time handshake ticket. "guest" means there is no session
 * (401) so the caller opens an anonymous socket; "retry" means the call
 * itself failed and the caller should back off instead.
 */
export async function fetchTicket(): Promise<TicketOutcome> {
  // A proven guest mints no ticket: skip the doomed POST and open the
  // anonymous socket directly.
  await probeSession();
  if (isGuestSession()) return "guest";
  try {
    const body = await apiFetch<WsTicket>(TICKETS_PATH, { method: "POST" });
    return { ticket: body.ticket };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return "guest";
    return "retry";
  }
}
