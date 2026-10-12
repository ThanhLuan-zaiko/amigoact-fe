import type { ReactElement } from "react";
import { FiBriefcase } from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import type { DashboardOrg } from "../api.ts";
import { JOIN_POLICY_LABELS, ORG_KIND_LABELS } from "../messages.tsx";
import type { OrgRole } from "../members-api.ts";
import { MemberInviteModal } from "./MemberInviteModal.tsx";
import { MemberManageActions } from "./MemberManageActions.tsx";
import { MemberOrgPicker } from "./MemberOrgPicker.tsx";

interface MemberOrgCardProps {
  orgs: DashboardOrg[];
  org: DashboardOrg | null;
  orgId: string | null;
  selfId: string | undefined;
  canInvite: boolean;
  inviting: boolean;
  viewerRole: string;
  viewerPermissions: string[];
  orgRoles: OrgRole[];
  onSelect: (orgId: string) => void;
  onToggleInvite: () => void;
  onCloseInvite: () => void;
}

// Right-rail tile: which org is being managed, its join policy, and the
// invite affordance. The member roster itself stays in the wide tile.
export function MemberOrgCard({
  orgs,
  org,
  orgId,
  selfId,
  canInvite,
  inviting,
  viewerRole,
  viewerPermissions,
  orgRoles,
  onSelect,
  onToggleInvite,
  onCloseInvite,
}: MemberOrgCardProps): ReactElement {
  return (
    <BentoCard className="md:col-span-6 lg:order-3 lg:col-span-4 lg:col-start-9 lg:self-start">
      <div data-rise className="flex items-center gap-2">
        <FiBriefcase
          className="h-5 w-5 text-zinc-900 dark:text-brand"
          aria-hidden="true"
        />
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Tổ chức
        </h3>
      </div>
      <MemberOrgPicker
        bare
        orgs={orgs}
        selectedId={orgId}
        onSelect={onSelect}
      />
      {org && (
        <>
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            {`${ORG_KIND_LABELS[org.kind] ?? org.kind} · @${org.slug} · ${JOIN_POLICY_LABELS[org.join_policy] ?? org.join_policy}`}
          </p>
          <div className="mt-3">
            <MemberManageActions
              org={org}
              selfId={selfId}
              canInvite={canInvite}
              inviting={inviting}
              onToggleInvite={onToggleInvite}
            />
          </div>
        </>
      )}
      {orgId !== null && (
        <MemberInviteModal
          orgId={orgId}
          viewerRole={viewerRole}
          viewerPermissions={viewerPermissions}
          orgRoles={orgRoles}
          open={inviting && canInvite}
          onClose={onCloseInvite}
        />
      )}
    </BentoCard>
  );
}
