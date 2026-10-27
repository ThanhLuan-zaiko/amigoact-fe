import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { ApiError } from "../core/api.ts";
import type { OrgRoleList } from "./members-api.ts";
import { dashboardKeys } from "./keys.ts";
import { reorderOrgRoles, setMemberDefaults } from "./roles-api.ts";

// Role seniority and the member baseline both change what people may do,
// so they refresh the whole dashboard scope like other role mutations.
export function useReorderRoles(
  orgId: string,
): UseMutationResult<OrgRoleList, ApiError, string[]> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleIds: string[]) => reorderOrgRoles(orgId, roleIds),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
  });
}

export function useSetMemberDefaults(
  orgId: string,
): UseMutationResult<{ permissions: string[] }, ApiError, string[]> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissions: string[]) => setMemberDefaults(orgId, permissions),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
  });
}
