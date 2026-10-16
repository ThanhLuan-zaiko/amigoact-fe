import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import { dashboardKeys } from "./keys.ts";
import { listSkillMatches, type SkillMatch } from "./members-api.ts";

// Coordinator matching: only fires once a skill is picked; the
// backend enforces org-manager access on its side.
export function useSkillMatches(
  orgId: string | null,
  skillId: string | null,
): UseQueryResult<SkillMatch[], ApiError> {
  return useQuery({
    queryKey: dashboardKeys.skillMatches(orgId, skillId),
    queryFn: () => listSkillMatches(orgId as string, skillId as string),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: orgId !== null && skillId !== null,
  });
}
