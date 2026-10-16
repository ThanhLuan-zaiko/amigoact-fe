export const certificateKeys = {
  all: ["certificates"] as const,
  mine: () => [...certificateKeys.all, "mine"] as const,
  activity: (activityId: string) =>
    [...certificateKeys.all, "activity", activityId] as const,
};
