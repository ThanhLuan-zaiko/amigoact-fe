import type { ReactElement } from "react";
import { Modal } from "../../core/components/Modal.tsx";
import type { DashboardOrg } from "../api.ts";
import { OrgEditCard } from "./OrgEditCard.tsx";

interface OrgEditModalProps {
  org: DashboardOrg;
  onClose: () => void;
}

export function OrgEditModal({ org, onClose }: OrgEditModalProps): ReactElement {
  return (
    <Modal open wide title={`Sửa ${org.name}`} onClose={onClose}>
      <OrgEditCard org={org} onDone={onClose} />
    </Modal>
  );
}
