import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { ApiError } from "../core/api.ts";
import { activitiesChannel, subscribeChannel } from "../core/realtime.ts";
import {
  createActivity,
  createCategory,
  fetchDiscovery,
  getActivityBySlug,
  getActivityDetail,
  getRegistrationForm,
  hardDeleteActivity,
  listActivities,
  listCategories,
  listOrgActivities,
  restoreActivity,
  setRegistrationForm,
  softDeleteActivity,
  transitionActivity,
  updateActivity,
  type ActivityDetail,
  type ActivityDetailView,
  type ActivityInput,
  type ActivitySummary,
  type CategoryItem,
  type DiscoveryResponse,
  type FormQuestion,
  type FormQuestionInput,
} from "./api.ts";
import {
  addAnnouncement,
  addSchedule,
  deleteSchedule,
  setActivityPartners,
  setActivitySkills,
  setActivityStaff,
} from "./ops.ts";
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
  tag?: string,
): UseQueryResult<ActivitySummary[], ApiError> {
  return useQuery({
    queryKey: activityKeys.feed(status, categoryId, tag),
    queryFn: () => listActivities(status, categoryId, tag),
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
  trash = false,
): UseQueryResult<ActivitySummary[], ApiError> {
  return useQuery({
    queryKey: activityKeys.orgList(orgId ?? "", trash),
    queryFn: () => listOrgActivities(orgId ?? "", trash),
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
        meta: { successToast: "activity.save" },
mutationFn: (input: ActivityInput) => createActivity(orgId, input),
    ...useInvalidateActivities(),
  });
}

export function useUpdateActivity(
  orgId: string,
): OrgActivityMutation<{ activityId: string; input: ActivityInput }> {
  return useMutation({
        meta: { successToast: "activity.save" },
mutationFn: ({ activityId, input }) =>
      updateActivity(orgId, activityId, input),
    ...useInvalidateActivities(),
  });
}

export function useTransitionActivity(
  orgId: string,
): OrgActivityMutation<{ activityId: string; status: string }> {
  return useMutation({
        meta: { successToast: "activity.save" },
mutationFn: ({ activityId, status }) =>
      transitionActivity(orgId, activityId, status),
    ...useInvalidateActivities(),
  });
}

export function useCreateCategory(
  orgId: string,
): OrgActivityMutation<Parameters<typeof createCategory>[1]> {
  return useMutation({
        meta: { successToast: "activity.category" },
mutationFn: (input) => createCategory(orgId, input),
    ...useInvalidateActivities(),
  });
}

export function useSetSkills(
  orgId: string,
  activityId: string,
): OrgActivityMutation<{ skill_id: string; is_required: boolean }[]> {
  return useMutation({
        meta: { successToast: "activity.save" },
mutationFn: (skills) => setActivitySkills(orgId, activityId, skills),
    ...useInvalidateActivities(),
  });
}

export function useSetPartners(
  orgId: string,
  activityId: string,
): OrgActivityMutation<
  { org_id: string; role: string; note?: string | null }[]
> {
  return useMutation({
        meta: { successToast: "activity.save" },
mutationFn: (partners) => setActivityPartners(orgId, activityId, partners),
    ...useInvalidateActivities(),
  });
}

export function useSetStaff(
  orgId: string,
  activityId: string,
): OrgActivityMutation<{ user_id: string; staff_role: string }[]> {
  return useMutation({
        meta: { successToast: "activity.save" },
mutationFn: (staff) => setActivityStaff(orgId, activityId, staff),
    ...useInvalidateActivities(),
  });
}

export function useAddSchedule(
  orgId: string,
  activityId: string,
): OrgActivityMutation<Parameters<typeof addSchedule>[2]> {
  return useMutation({
        meta: { successToast: "activity.save" },
mutationFn: (input) => addSchedule(orgId, activityId, input),
    ...useInvalidateActivities(),
  });
}

export function useDeleteSchedule(
  orgId: string,
  activityId: string,
): OrgActivityMutation<string> {
  return useMutation({
        meta: { successToast: "activity.delete" },
mutationFn: (scheduleId) =>
      deleteSchedule(orgId, activityId, scheduleId),
    ...useInvalidateActivities(),
  });
}

// Live org activity feed (see docs/REALTIME.md): committed lifecycle events on
// activities:{orgId} (create/update/status change) refresh every activity
// query. The payload is never trusted as truth; queries are invalidated.
export function useLiveActivities(orgId: string | undefined): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (orgId === undefined) return undefined;
    return subscribeChannel(activitiesChannel(orgId), () => {
      void queryClient.invalidateQueries({ queryKey: activityKeys.all });
    });
  }, [orgId, queryClient]);
}

export function useAddAnnouncement(
  orgId: string,
  activityId: string,
): OrgActivityMutation<{ title: string; body?: string }> {
  return useMutation({
        meta: { successToast: "activity.announce" },
mutationFn: (input) => addAnnouncement(orgId, activityId, input),
    ...useInvalidateActivities(),
  });
}

export function useSoftDeleteActivity(
  orgId: string,
  successTitle: string,
): OrgActivityMutation<string> {
  return useMutation({
        meta: { successToast: successTitle },
mutationFn: (activityId) => softDeleteActivity(orgId, activityId),
    ...useInvalidateActivities(),
  });
}

export function useHardDeleteActivity(
  orgId: string,
  successTitle: string,
): OrgActivityMutation<string> {
  return useMutation({
        meta: { successToast: successTitle },
mutationFn: (activityId) => hardDeleteActivity(orgId, activityId),
    ...useInvalidateActivities(),
  });
}

export function useRestoreActivity(
  orgId: string,
  successTitle: string,
): OrgActivityMutation<string> {
  return useMutation({
        meta: { successToast: successTitle },
mutationFn: (activityId) => restoreActivity(orgId, activityId),
    ...useInvalidateActivities(),
  });
}

export function useRegistrationForm(
  orgId: string | undefined,
  activityId: string | undefined,
): UseQueryResult<FormQuestion[], ApiError> {
  return useQuery({
    queryKey: activityKeys.form(orgId ?? "", activityId ?? ""),
    queryFn: () =>
      getRegistrationForm(orgId as string, activityId as string),
    enabled: Boolean(orgId && activityId),
  });
}

export function useSetForm(
  orgId: string,
  activityId: string,
): OrgActivityMutation<FormQuestionInput[]> {
  return useMutation({
        meta: { successToast: "activity.save" },
mutationFn: (questions) =>
      setRegistrationForm(orgId, activityId, questions),
    ...useInvalidateActivities(),
  });
}
