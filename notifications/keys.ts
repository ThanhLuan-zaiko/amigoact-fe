export const notificationKeys = {
  all: ["notifications"] as const,
  list: (limit: number, offset: number) =>
    [...notificationKeys.all, "list", limit, offset] as const,
  prefs: () => [...notificationKeys.all, "prefs"] as const,
};
