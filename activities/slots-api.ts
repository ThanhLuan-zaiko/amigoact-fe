import { apiFetch } from "../core/api.ts";

export interface ActivitySlot {
  slot_id: string;
  schedule_id: string;
  title: string;
  capacity: number | null;
  registered: number;
  start_at: string | null;
  end_at: string | null;
}

export interface SlotInput {
  title: string;
  capacity?: number | null;
  start_at?: string | null;
  end_at?: string | null;
}

export function listSlots(
  orgId: string,
  activityId: string,
): Promise<ActivitySlot[]> {
  return apiFetch<ActivitySlot[]>(
    `/orgs/${orgId}/activities/${activityId}/slots`,
  );
}

export function createSlot(
  orgId: string,
  activityId: string,
  scheduleId: string,
  input: SlotInput,
): Promise<ActivitySlot> {
  return apiFetch<ActivitySlot>(
    `/orgs/${orgId}/activities/${activityId}/schedules/${scheduleId}/slots`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function deleteSlot(
  orgId: string,
  activityId: string,
  scheduleId: string,
  slotId: string,
): Promise<void> {
  return apiFetch<void>(
    `/orgs/${orgId}/activities/${activityId}/schedules/${scheduleId}/slots/${slotId}`,
    { method: "DELETE" },
  );
}
