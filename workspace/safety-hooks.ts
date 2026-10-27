import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiError } from "../core/api.ts";
import { workspaceKeys } from "./keys.ts";
import {
  getChatSafety,
  liftTimeout,
  setAttachPolicy,
  timeoutMember,
  type ChatSafety,
  type SafetyTimeout,
} from "./safety-api.ts";

// A member's own timeout expires by the clock, so poll while one is active.
const MUTED_POLL_MS = 30_000;

export function useChatSafety(
  orgId: string | null,
): UseQueryResult<ChatSafety, ApiError> {
  return useQuery({
    queryKey: workspaceKeys.safety(orgId),
    queryFn: () => getChatSafety(orgId as string),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchInterval: (query) =>
      query.state.data?.my_timeout_until ? MUTED_POLL_MS : false,
    enabled: orgId !== null,
  });
}

function useRefreshSafety(orgId: string): () => Promise<void> {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: workspaceKeys.safety(orgId) });
}

export function useSetAttachPolicy(
  orgId: string,
): UseMutationResult<{ attach_restricted: boolean }, ApiError, boolean> {
  const refresh = useRefreshSafety(orgId);
  return useMutation({
    mutationFn: (restricted: boolean) => setAttachPolicy(orgId, restricted),
    onSuccess: refresh,
  });
}

export function useTimeoutMember(
  orgId: string,
): UseMutationResult<
  SafetyTimeout,
  ApiError,
  { userId: string; minutes: number; reason: string }
> {
  const refresh = useRefreshSafety(orgId);
  return useMutation({
    mutationFn: (input: { userId: string; minutes: number; reason: string }) =>
      timeoutMember(orgId, input.userId, input.minutes, input.reason),
    onSuccess: refresh,
  });
}

export function useLiftTimeout(
  orgId: string,
): UseMutationResult<void, ApiError, string> {
  const refresh = useRefreshSafety(orgId);
  return useMutation({
    mutationFn: (userId: string) => liftTimeout(orgId, userId),
    onSuccess: refresh,
  });
}
