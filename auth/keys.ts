export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};
export const sessionKeys = {
  all: ["auth-sessions"] as const,
  list: () => [...sessionKeys.all, "list"] as const,
};
