"use server";

import { getAccessToken } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import { realtimeSocketUrl } from "@/lib/realtime";

export type RealtimeTicket =
  | { ok: true; ticket: string; url: string }
  | { ok: false; reason: "no_url" | "signed_out" | "failed" };

// A one-time ticket for the socket, and the address to open it at. The ticket lasts five
// minutes and carries no token, so the browser may hold it; the token stays in its cookie.
// The address is read here, at request time, so one build serves any deployment.
// Unlike authedFetch, a missing session is not redirected: guests simply stay offline.
export async function getRealtimeTicket(): Promise<RealtimeTicket> {
  const url = realtimeSocketUrl(
    process.env.BACKEND_URL,
    process.env.REALTIME_WS_URL,
    process.env.CHAT_WS_URL,
  );
  if (!url) {
    return { ok: false, reason: "no_url" };
  }
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "signed_out" };
  }
  const result = await backendFetch<{ ticket: string }>("/realtime/tickets", {
    method: "POST",
    token,
  });
  if (!result.ok) {
    return {
      ok: false,
      reason: result.status === 401 ? "signed_out" : "failed",
    };
  }
  return { ok: true, ticket: result.data.ticket, url };
}
