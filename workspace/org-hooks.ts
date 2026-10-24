import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface WorkspaceOrgOptions {
  // Read-only mode: a missing ?org= means "no org filter" (the events
  // feed spans every org), so the URL is never rewritten to the first org.
  optional?: boolean;
}

// Org selection shared by every workspace view: ?org= deep link, falling
// back to the first org once the picker data arrives.
export function useWorkspaceOrg(
  orgItems: { id: string }[],
  options: WorkspaceOrgOptions = {},
): {
  orgId: string | null;
  selectOrg: (id: string) => void;
} {
  const optional = options.optional ?? false;
  const [searchParams, setSearchParams] = useSearchParams();
  const orgParam = searchParams.get("org");
  const orgId: string | null =
    orgParam !== null && orgItems.some((item) => item.id === orgParam)
      ? orgParam
      : optional
        ? null
        : (orgItems[0]?.id ?? null);
  // Deep-link hygiene: once the membership list lands, drop or rewrite a
  // missing/unknown ?org= so the URL always names the rendered org.
  useEffect(() => {
    if (optional) return;
    if (orgId !== null && orgParam !== orgId) {
      const next = new URLSearchParams(searchParams);
      next.set("org", orgId);
      setSearchParams(next, { replace: true });
    }
  }, [optional, orgParam, orgId, searchParams, setSearchParams]);
  return {
    orgId,
    selectOrg: (id: string) => {
      const next = new URLSearchParams(searchParams);
      next.set("org", id);
      setSearchParams(next, { replace: true });
    },
  };
}
