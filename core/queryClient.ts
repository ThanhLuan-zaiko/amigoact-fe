import { MutationCache, QueryClient } from "@tanstack/react-query";
import { MUTATION_TOAST_TITLES } from "./mutation-copy.tsx";
import { pushToast, type MutationToastMeta } from "./toast.ts";

function resolveToast(key: string | undefined): string | undefined {
  if (!key) return undefined;
  // Registry key resolves to Vietnamese copy; a literal title resolves to
  // itself so .tsx callers can pass copy straight through hook params.
  return MUTATION_TOAST_TITLES[key] ?? key;
}

const mutationCache = new MutationCache({
  onSuccess: (_data, _variables, _context, mutation) => {
    const meta = mutation.options.meta as MutationToastMeta | undefined;
    const title = resolveToast(meta?.successToast);
    if (title) pushToast({ tone: "success", title });
  },
  onError: (_error, _variables, _context, mutation) => {
    const meta = mutation.options.meta as MutationToastMeta | undefined;
    const title = resolveToast(meta?.errorToast);
    if (title) pushToast({ tone: "error", title });
  },
});

export function createQueryClient(): QueryClient {
  return new QueryClient({
    mutationCache,
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export const queryClient: QueryClient = createQueryClient();
