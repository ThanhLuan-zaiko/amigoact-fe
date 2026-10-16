export const adminKeys = {
  all: ["admin"] as const,
  status: () => [...adminKeys.all, "status"] as const,
  orgs: (status: string) => [...adminKeys.all, "orgs", status] as const,
  admins: () => [...adminKeys.all, "admins"] as const,
  moderation: (status: string) => [...adminKeys.all, "moderation", status] as const,
};
