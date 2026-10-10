export const reviewKeys = {
  all: ["reviews"] as const,
  activity: (activityId: string) =>
    [...reviewKeys.all, activityId] as const,
};
