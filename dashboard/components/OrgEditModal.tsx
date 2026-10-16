import { useState } from "react";
import type { ReactElement } from "react";
import { Modal } from "../../core/components/Modal.tsx";
import { UnsavedChangesDialog } from "../../core/components/UnsavedGuard.tsx";
import type { DashboardOrg } from "../api.ts";
import { OrgEditCard } from "./OrgEditCard.tsx";
import { StructurePanel } from "./StructurePanel.tsx";
import { ApiKeysPanel } from "./ApiKeysPanel.tsx";

interface OrgEditModalProps {
  org: DashboardOrg;
  onClose: () => void;
}

export function OrgEditModal({ org, onClose }: OrgEditModalProps): ReactElement {
  const [dirty, setDirty] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Modal chrome (X, overlay, Esc) and the card's Cancel button ask
  // before discarding; the post-save onDone bypasses the check by design.
  function requestClose(): void {
    if (dirty) setConfirming(true);
    else onClose();
  }

  return (
    <Modal open wide title={`Sửa ${org.name}`} onClose={requestClose}>
      <OrgEditCard
        org={org}
        onDone={onClose}
        onCancel={requestClose}
        onDirtyChange={setDirty}
      />
      <StructurePanel orgId={org.id} />
      <ApiKeysPanel orgId={org.id} />
      {confirming && (
        <UnsavedChangesDialog
          onStay={() => setConfirming(false)}
          onLeave={onClose}
        />
      )}
    </Modal>
  );
}
