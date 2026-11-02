import "server-only";
import type {
  ActivityHours,
  Appeal,
  AttendanceSession,
  HourRule,
  MyHours,
  RosterEntry,
} from "./attendance";
import { getAccessToken } from "./auth";
import { backendFetch } from "./backend";

async function getData<T>(path: string): Promise<T | null> {
  const result = await backendFetch<T>(path, {
    method: "GET",
    token: await getAccessToken(),
  });
  return result.ok ? result.data : null;
}

function activityPath(id: string): string {
  return `/activities/${encodeURIComponent(id)}`;
}

// Read these behind a Suspense boundary, because they use the session.
export function getSessions(id: string): Promise<AttendanceSession[] | null> {
  return getData(`${activityPath(id)}/attendance-sessions`);
}

export function getRoster(sessionId: string): Promise<RosterEntry[] | null> {
  return getData(
    `/attendance-sessions/${encodeURIComponent(sessionId)}/roster`,
  );
}

export function getAppeals(id: string): Promise<Appeal[] | null> {
  return getData(`${activityPath(id)}/appeals`);
}

export function getActivityHours(id: string): Promise<ActivityHours[] | null> {
  return getData(`${activityPath(id)}/hours`);
}

export function getMyHours(): Promise<MyHours | null> {
  return getData("/hours/mine");
}

export function getHourRule(slug: string): Promise<HourRule | null> {
  return getData(`/organizations/${encodeURIComponent(slug)}/hour-rule`);
}
