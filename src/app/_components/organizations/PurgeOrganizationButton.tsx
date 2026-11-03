"use client";

import { useState, useTransition } from "react";
import { FiTrash2 } from "react-icons/fi";
import { purgeOrganization } from "@/app/_actions/organizations";
import ConfirmDialog from "../ConfirmDialog";
import { dangerButton, fieldLabel, inputField } from "../ui";

type PurgeOrganizationButtonProps = {
  organizationId: string;
  name: string;
};

// Deletes a trashed organization for good. The owner types its name before the red button
// is enabled, because nothing can bring the organization back after this.
export default function PurgeOrganizationButton({
  organizationId,
  name,
}: PurgeOrganizationButtonProps) {
  const [open, setOpen] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, startPurge] = useTransition();
  const nameMatches = typedName.trim() === name;

  function close() {
    setOpen(false);
    setTypedName("");
    setError(undefined);
  }

  function confirm() {
    startPurge(async () => {
      const state = await purgeOrganization(organizationId);
      if (state.error) {
        setError(state.error);
        return;
      }
      close();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={dangerButton}
      >
        <FiTrash2 aria-hidden="true" />
        Xóa vĩnh viễn
      </button>
      <ConfirmDialog
        open={open}
        title="Xóa vĩnh viễn tổ chức?"
        confirmLabel="Xóa vĩnh viễn"
        confirmIcon={<FiTrash2 aria-hidden="true" />}
        confirmDisabled={!nameMatches}
        pending={pending}
        error={error}
        onConfirm={confirm}
        onClose={close}
      >
        <p>
          Thao tác này không thể hoàn tác. Hoạt động, đăng ký và điểm danh của
          tổ chức sẽ bị xóa hẳn. Giờ tình nguyện đã duyệt vẫn được giữ lại.
        </p>
        <label className="flex flex-col gap-1 pt-2">
          <span className={fieldLabel}>Nhập “{name}” để xác nhận</span>
          <input
            value={typedName}
            onChange={(event) => setTypedName(event.target.value)}
            autoComplete="off"
            className={inputField}
          />
        </label>
      </ConfirmDialog>
    </>
  );
}
