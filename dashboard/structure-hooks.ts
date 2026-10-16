import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import { dashboardKeys } from "./keys.ts";
import {
  createCampus,
  createDepartment,
  listCampuses,
  listDepartments,
  listOrgTypes,
  updateCampus,
  updateDepartment,
  type Campus,
  type CampusInput,
  type CampusPatch,
  type Department,
  type DepartmentInput,
  type DepartmentPatch,
  type OrgType,
} from "./structure-api.ts";

type Mutation<TVariables> = UseMutationResult<
  unknown,
  ApiError,
  TVariables,
  unknown
>;

export function useCampuses(
  orgId: string | null,
): UseQueryResult<Campus[], ApiError> {
  return useQuery({
    queryKey: dashboardKeys.campuses(orgId),
    queryFn: () => listCampuses(orgId ?? ""),
    enabled: orgId !== null && orgId !== "",
    staleTime: 30_000,
  });
}

export function useDepartments(
  orgId: string | null,
): UseQueryResult<Department[], ApiError> {
  return useQuery({
    queryKey: dashboardKeys.departments(orgId),
    queryFn: () => listDepartments(orgId ?? ""),
    enabled: orgId !== null && orgId !== "",
    staleTime: 30_000,
  });
}

function useInvalidateStructure(orgId: string) {
  const queryClient = useQueryClient();
  return {
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.campuses(orgId),
      });
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.departments(orgId),
      });
    },
  };
}

export function useCreateCampus(orgId: string): Mutation<CampusInput> {
  return useMutation({
    mutationFn: (input) => createCampus(orgId, input),
    ...useInvalidateStructure(orgId),
  });
}

export function useUpdateCampus(
  orgId: string,
): Mutation<{ campusId: string; patch: CampusPatch }> {
  return useMutation({
    mutationFn: ({ campusId, patch }) =>
      updateCampus(orgId, campusId, patch),
    ...useInvalidateStructure(orgId),
  });
}

export function useCreateDepartment(
  orgId: string,
): Mutation<DepartmentInput> {
  return useMutation({
    mutationFn: (input) => createDepartment(orgId, input),
    ...useInvalidateStructure(orgId),
  });
}

export function useUpdateDepartment(
  orgId: string,
): Mutation<{ departmentId: string; patch: DepartmentPatch }> {
  return useMutation({
    mutationFn: ({ departmentId, patch }) =>
      updateDepartment(orgId, departmentId, patch),
    ...useInvalidateStructure(orgId),
  });
}

export function useOrgTypes(): UseQueryResult<OrgType[], ApiError> {
  return useQuery({
    queryKey: [...dashboardKeys.all, "org-types"],
    queryFn: listOrgTypes,
    staleTime: 300_000,
  });
}
