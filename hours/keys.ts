export const hourKeys = {
  all: ["hours"] as const,
  mine: () => [...hourKeys.all, "mine"] as const,
  activity: (activityId: string) =>
    [...hourKeys.all, "activity", activityId] as const,
  pending: (orgId: string) =>
    [...hourKeys.all, "pending", orgId] as const,
};
