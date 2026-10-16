import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiError } from "../core/api.ts";
import {
  createSnapshot,
  downloadExportCsv,
  listExportJobs,
  listSnapshots,
  requestExport,
  type ExportJob,
  type ReportSnapshot,
} from "./api.ts";

const keys = {
  all: ["reports"] as const,
  snapshots: (orgId: string) => [...keys.all, "snapshots", orgId] as const,
  jobs: () => [...keys.all, "jobs"] as const,
};

type Mutation<TData, TInput> = UseMutationResult<TData, ApiError, TInput>;

export function useSnapshots(
  orgId: string | undefined,
): UseQueryResult<ReportSnapshot[], ApiError> {
  return useQuery({
    enabled: Boolean(orgId),
    queryKey: keys.snapshots(orgId ?? ""),
    queryFn: () => listSnapshots(orgId ?? ""),
    staleTime: 30_000,
  });
}

export function useCreateSnapshot(
  orgId: string | undefined,
): Mutation<ReportSnapshot, { report_type: string }> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: "report.snapshot" },
    mutationFn: (input) => createSnapshot(orgId ?? "", input),
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: keys.snapshots(orgId ?? ""),
      });
    },
  });
}

export function useExportJobs(
  enabled: boolean,
): UseQueryResult<ExportJob[], ApiError> {
  return useQuery({
    enabled,
    queryKey: keys.jobs(),
    queryFn: listExportJobs,
    staleTime: 15_000,
  });
}

export function useRequestExport(
  orgId: string | undefined,
): Mutation<ExportJob, { job_type: string; activity_id?: string }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => requestExport(orgId ?? "", input),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.jobs() });
    },
  });
}

export function useDownloadExport(): Mutation<string, string> {
  return useMutation({
    mutationFn: downloadExportCsv,
  });
}
