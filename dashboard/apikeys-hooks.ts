import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiError } from "../core/api.ts";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  type ApiKeyItem,
  type IssuedApiKey,
} from "./apikeys-api.ts";

const keys = {
  all: ["api-keys"] as const,
  list: (orgId: string) => [...keys.all, orgId] as const,
};

type Mutation<TData, TInput> = UseMutationResult<TData, ApiError, TInput>;

export function useApiKeys(
  orgId: string,
): UseQueryResult<ApiKeyItem[], ApiError> {
  return useQuery({
    queryKey: keys.list(orgId),
    queryFn: () => listApiKeys(orgId),
    staleTime: 30_000,
  });
}

export function useCreateApiKey(
  orgId: string,
): Mutation<IssuedApiKey, { name: string; scopes?: string[]; ttl_days?: number | null }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => createApiKey(orgId, input),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.list(orgId) });
    },
  });
}

export function useRevokeApiKey(orgId: string): Mutation<void, string> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: "apikey.revoked" },
    mutationFn: (keyId) => revokeApiKey(orgId, keyId),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.list(orgId) });
    },
  });
}
