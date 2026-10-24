/**
 * Channel names mirror the backend (see docs/REALTIME.md). The realtime client in
 * core/realtime.ts re-exports these so existing imports keep working.
 */

export function notificationsChannel(userId: string): string {
  return `notifications:${userId}`;
}

export function attendanceChannel(activityId: string): string {
  return `attendance:${activityId}`;
}

export function activitiesChannel(orgId: string): string {
  return `activities:${orgId}`;
}

export function membersChannel(orgId: string): string {
  return `members:${orgId}`;
}

export function postsChannel(orgId: string): string {
  return `posts:${orgId}`;
}

// Public guest channel for the global announcement timeline (no UUID).
export function announcementsChannel(): string {
  return "announcements:feed";
}

export function chatChannel(roomId: string): string {
  return `chat:${roomId}`;
}
