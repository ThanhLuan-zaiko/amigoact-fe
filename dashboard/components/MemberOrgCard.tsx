import type { ReactElement } from "react";
import { Section } from "../../core/components/Section.tsx";
import type { DashboardOrg } from "../api.ts";
import type { OrgRole } from "../members-api.ts";
import { MemberInviteModal } from "./MemberInviteModal.tsx";
import { MemberManageActions } from "./MemberManageActions.tsx";

interface MemberOrgCardProps {
  org: DashboardOrg | null;
  orgId: string | null;
  selfId: string | undefined;
  canInvite: boolean;
  inviting: boolean;
  viewerRole: string;
  viewerPermissions: string[];
  orgRoles: OrgRole[];
  onCloseInvite: () => void;
}

// Join-policy control for the selected org. Org switching and the invite
// button live in the manage rail; this card only keeps the owner action
// and the invite dialog the rail opens.
export function MemberOrgCard({
  org,
  orgId,
  selfId,
  canInvite,
  inviting,
  viewerRole,
  viewerPermissions,
  orgRoles,
  onCloseInvite,
}: MemberOrgCardProps): ReactElement | null {
  const owner = org !== null && org.owner_id === selfId;
  if (orgId === null || (!owner && !(inviting && canInvite))) return null;
  return (
    <Section className=" @4xl:self-start">
      {org && (
        <MemberManageActions org={org} selfId={selfId} />
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
    </Section>
  );
}
