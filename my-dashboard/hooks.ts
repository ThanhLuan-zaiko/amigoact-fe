import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import { createOrg, listMyOrgs, type CreateOrgInput, type DashboardOrg } from "./api.ts";
import { dashboardKeys } from "./keys.ts";

export function useMyOrgs(): UseQueryResult<DashboardOrg[], ApiError> {
  return useQuery({
    queryKey: dashboardKeys.myOrgs(),
    queryFn: listMyOrgs,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateOrg(): UseMutationResult<DashboardOrg, ApiError, CreateOrgInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrg,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.myOrgs() });
    },
  });
}
