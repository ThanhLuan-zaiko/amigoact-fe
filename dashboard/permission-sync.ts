import type { QueryClient } from "@tanstack/react-query";
import { activityKeys } from "../activities/keys.ts";
import { workspaceKeys } from "../workspace/keys.ts";
import { dashboardKeys } from "./keys.ts";

// Membership actions that change what someone may do. Permission-gated UI
// lives outside the dashboard scope too (the /manage/events feed carries
// can_create/can_manage; board feeds and channels carry viewer_permissions),
// so these actions refresh those caches along with the roster.
const PERMISSION_ACTIONS: ReadonlySet<string> = new Set([
  "promoted",
  "demoted",
  "role_granted",
  "role_revoked",
  "role_catalog_changed",
  "suspended",
  "reactivated",
  "removed",
  "chat_timeout",
  "chat_untimeout",
]);

// Every member event refreshes the dashboard scope; permission-changing
// ones also refresh activity feeds, board posts and channel lists. The
// server still enforces each request, so this only keeps buttons honest.
export function syncPermissionScopes(
  queryClient: QueryClient,
  action: unknown,
): void {
  void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  if (typeof action !== "string" || !PERMISSION_ACTIONS.has(action)) return;
  void queryClient.invalidateQueries({ queryKey: activityKeys.all });
  void queryClient.invalidateQueries({
    queryKey: [...workspaceKeys.all, "posts"],
  });
  void queryClient.invalidateQueries({
    queryKey: [...workspaceKeys.all, "channels"],
  });
  void queryClient.invalidateQueries({
    queryKey: [...workspaceKeys.all, "safety"],
  });
}
