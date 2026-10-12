import type { ReactElement } from "react";
import { Modal } from "../../core/components/Modal.tsx";
import type { OrgRole } from "../members-api.ts";
import { MemberInviteCard } from "./MemberInviteCard.tsx";

interface MemberInviteModalProps {
  orgId: string;
  viewerRole: string;
  viewerPermissions: string[];
  orgRoles: OrgRole[];
  open: boolean;
  onClose: () => void;
}

export function MemberInviteModal({
  orgId,
  viewerRole,
  viewerPermissions,
  orgRoles,
  open,
  onClose,
}: MemberInviteModalProps): ReactElement | null {
  if (!open) return null;
  return (
    <Modal title="Mời thành viên" open={open} onClose={onClose}>
      <MemberInviteCard
        orgId={orgId}
        viewerRole={viewerRole}
        viewerPermissions={viewerPermissions}
        orgRoles={orgRoles}
        onDone={onClose}
      />
    </Modal>
  );
}
