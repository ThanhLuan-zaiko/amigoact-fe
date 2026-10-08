export const dashboardKeys = {
  all: ["my-dashboard"] as const,
  myOrgs: () => [...dashboardKeys.all, "orgs"] as const,
};
