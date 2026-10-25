import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiError } from "../core/api.ts";
import { dashboardKeys } from "./keys.ts";
import {
  getMemberVolunteerProfile,
  type MemberVolunteerProfile,
} from "./volunteer-profile-api.ts";

// Fetched only while the profile modal is open. Retry is off: a 403 or 404 is
// a decision on the server, so the modal should show it at once.
export function useMemberVolunteerProfile(
  orgId: string,
  userId: string,
  enabled: boolean,
): UseQueryResult<MemberVolunteerProfile, ApiError> {
  return useQuery({
    queryKey: dashboardKeys.volunteerProfile(orgId, userId),
    queryFn: () => getMemberVolunteerProfile(orgId, userId),
    enabled,
    retry: false,
    staleTime: 30_000,
  });
}
