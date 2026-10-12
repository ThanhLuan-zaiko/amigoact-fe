import type { ReactElement } from "react";
import { useSession } from "../../auth/hooks.ts";
import { useMembershipRealtime } from "../members-hooks.ts";

// Membership pushes on notifications:{user} (scope:"membership") must
// reach the viewer on every page: being invited, suspended, removed or
// role-changed in an org toasts even outside /manage. Mounted once in
// App so the single subscription both invalidates and toasts.
export function MembershipRealtime(): ReactElement | null {
  const session = useSession();
  useMembershipRealtime(session.data?.id);
  return null;
}
