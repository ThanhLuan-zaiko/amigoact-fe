import type { ReactElement } from "react";
import { Modal } from "../../core/components/Modal.tsx";
import { MemberInviteCard } from "./MemberInviteCard.tsx";

interface MemberInviteModalProps {
  orgId: string;
  canAssignAdmin: boolean;
  open: boolean;
  onClose: () => void;
}

export function MemberInviteModal({
  orgId,
  canAssignAdmin,
  open,
  onClose,
}: MemberInviteModalProps): ReactElement | null {
  if (!open) return null;
  return (
    <Modal title="Mời thành viên" open={open} onClose={onClose}>
      <MemberInviteCard orgId={orgId} canAssignAdmin={canAssignAdmin} onDone={onClose} />
    </Modal>
  );
}
