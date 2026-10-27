import type { ReactElement } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { usePublicOrg } from "../../orgs/hooks.ts";

interface OrgScopeChipProps {
  slug: string;
  onClear: () => void;
}

// Names the organization the feed is scoped to, and clears that scope.
export function OrgScopeChip({ slug, onClear }: OrgScopeChipProps): ReactElement {
  const org = usePublicOrg(slug);
  const name = org.data?.name ?? slug;
  return (
    <Button
      variant="secondary"
      onClick={onClear}
      aria-label={`Bỏ lọc tổ chức ${name}`}
      icon={<FiX className="h-4 w-4" aria-hidden="true" />}
    >
      Tổ chức: {name}
    </Button>
  );
}
