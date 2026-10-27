import { apiFetch } from "../core/api.ts";

export interface SafetyTimeout {
  user_id: string;
  user_name: string;
  until: string;
  set_by: string;
  reason: string;
}

export interface ChatSafety {
  // true: attaching files needs chat:attach (or ownership).
  attach_restricted: boolean;
  // The viewer's own timeout, so the composer can explain itself.
  my_timeout_until: string | null;
  // Active timeouts; only people who may set them receive the list.
  timeouts: SafetyTimeout[];
}

export async function getChatSafety(orgId: string): Promise<ChatSafety> {
  return apiFetch<ChatSafety>(`/orgs/${orgId}/chat/safety`);
}

export async function setAttachPolicy(
  orgId: string,
  restricted: boolean,
): Promise<{ attach_restricted: boolean }> {
  return apiFetch<{ attach_restricted: boolean }>(
    `/orgs/${orgId}/chat/safety/attachments`,
    { method: "PUT", body: JSON.stringify({ restricted }) },
  );
}

export async function timeoutMember(
  orgId: string,
  userId: string,
  minutes: number,
  reason: string,
): Promise<SafetyTimeout> {
  return apiFetch<SafetyTimeout>(
    `/orgs/${orgId}/chat/safety/timeouts/${userId}`,
    { method: "PUT", body: JSON.stringify({ minutes, reason }) },
  );
}

export async function liftTimeout(orgId: string, userId: string): Promise<void> {
  await apiFetch<unknown>(`/orgs/${orgId}/chat/safety/timeouts/${userId}`, {
    method: "DELETE",
  });
}
