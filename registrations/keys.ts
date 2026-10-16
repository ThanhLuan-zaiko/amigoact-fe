export const registrationKeys = {
  all: ["registrations"] as const,
  mine: () => [...registrationKeys.all, "mine"] as const,
  roster: (activityId: string) =>
    [...registrationKeys.all, "roster", activityId] as const,
  ticket: (activityId: string, registrationId: string) =>
    [...registrationKeys.all, "ticket", activityId, registrationId] as const,
  history: (activityId: string, registrationId: string) =>
    [...registrationKeys.all, "history", activityId, registrationId] as const,
  attendance: (activityId: string) =>
    [...registrationKeys.all, "attendance", activityId] as const,
  myAttendance: () =>
    [...registrationKeys.all, "attendance-mine"] as const,
};
