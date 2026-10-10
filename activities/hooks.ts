import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import {
  addAnnouncement,
  addSchedule,
  createActivity,
  createCategory,
  deleteSchedule,
  fetchDiscovery,
  getActivityBySlug,
  getActivityDetail,
  listActivities,
  listCategories,
  listOrgActivities,
  setActivitySkills,
  setActivityStaff,
  transitionActivity,
  updateActivity,
  type ActivityDetail,
  type ActivityDetailView,
  type ActivityInput,
  type ActivitySummary,
  type CategoryItem,
  type DiscoveryResponse,
} from "./api.ts";
import { activityKeys } from "./keys.ts";

export function useDiscovery(): UseQueryResult<
  DiscoveryResponse,
  ApiError
> {
  return useQuery({
    queryKey: activityKeys.discovery(),
    queryFn: () => fetchDiscovery(),
    staleTime: 60_000,
  });
}

export function useActivityFeed(
  status: string,
  categoryId?: string,
): UseQueryResult<ActivitySummary[], ApiError> {
  return useQuery({
    queryKey: activityKeys.feed(status, categoryId),
    queryFn: () => listActivities(status, categoryId),
    staleTime: 30_000,
  });
}

export function useCategories(
  orgId?: string,
): UseQueryResult<CategoryItem[], ApiError> {
  return useQuery({
    queryKey: activityKeys.categories(orgId),
    queryFn: () => listCategories(orgId),
    staleTime: 60_000,
  });
}

export function useActivityBySlug(
  orgId: string | undefined,
  slug: string | undefined,
): UseQueryResult<ActivityDetail, ApiError> {
  return useQuery({
    queryKey: activityKeys.bySlug(orgId ?? "", slug ?? ""),
    queryFn: () => getActivityBySlug(orgId ?? "", slug ?? ""),
    enabled: Boolean(orgId && slug),
    retry: 1,
  });
}

export function useOrgActivities(
  orgId: string | null,
): UseQueryResult<ActivitySummary[], ApiError> {
  return useQuery({
    queryKey: activityKeys.orgList(orgId ?? ""),
    queryFn: () => listOrgActivities(orgId ?? ""),
    enabled: Boolean(orgId),
  });
}

export function useActivityDetail(
  orgId: string | undefined,
  activityId: string | undefined,
): UseQueryResult<ActivityDetailView, ApiError> {
  return useQuery({
    queryKey: activityKeys.view(orgId ?? "", activityId ?? ""),
    queryFn: () => getActivityDetail(orgId ?? "", activityId ?? ""),
    enabled: Boolean(orgId && activityId),
  });
}

type OrgActivityMutation<TVariables> = UseMutationResult<
  unknown,
  ApiError,
  TVariables
>;

function useInvalidateActivities() {
  const queryClient = useQueryClient();
  return {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  };
}

export function useCreateActivity(
  orgId: string,
): OrgActivityMutation<ActivityInput> {
  return useMutation({
    mutationFn: (input: ActivityInput) => createActivity(orgId, input),
    ...useInvalidateActivities(),
  });
}

export function useUpdateActivity(
  orgId: string,
): OrgActivityMutation<{ activityId: string; input: ActivityInput }> {
  return useMutation({
    mutationFn: ({ activityId, input }) =>
      updateActivity(orgId, activityId, input),
    ...useInvalidateActivities(),
  });
}

export function useTransitionActivity(
  orgId: string,
): OrgActivityMutation<{ activityId: string; status: string }> {
  return useMutation({
    mutationFn: ({ activityId, status }) =>
      transitionActivity(orgId, activityId, status),
    ...useInvalidateActivities(),
  });
}

export function useCreateCategory(
  orgId: string,
): OrgActivityMutation<Parameters<typeof createCategory>[1]> {
  return useMutation({
    mutationFn: (input) => createCategory(orgId, input),
    ...useInvalidateActivities(),
  });
}

export function useSetSkills(
  orgId: string,
  activityId: string,
): OrgActivityMutation<{ skill_id: string; is_required: boolean }[]> {
  return useMutation({
    mutationFn: (skills) => setActivitySkills(orgId, activityId, skills),
    ...useInvalidateActivities(),
  });
}

export function useSetStaff(
  orgId: string,
  activityId: string,
): OrgActivityMutation<{ user_id: string; staff_role: string }[]> {
  return useMutation({
    mutationFn: (staff) => setActivityStaff(orgId, activityId, staff),
    ...useInvalidateActivities(),
  });
}

export function useAddSchedule(
  orgId: string,
  activityId: string,
): OrgActivityMutation<Parameters<typeof addSchedule>[2]> {
  return useMutation({
    mutationFn: (input) => addSchedule(orgId, activityId, input),
    ...useInvalidateActivities(),
  });
}

export function useDeleteSchedule(
  orgId: string,
  activityId: string,
): OrgActivityMutation<string> {
  return useMutation({
    mutationFn: (scheduleId) =>
      deleteSchedule(orgId, activityId, scheduleId),
    ...useInvalidateActivities(),
  });
}

export function useAddAnnouncement(
  orgId: string,
  activityId: string,
): OrgActivityMutation<{ title: string; body?: string }> {
  return useMutation({
    mutationFn: (input) => addAnnouncement(orgId, activityId, input),
    ...useInvalidateActivities(),
  });
}
