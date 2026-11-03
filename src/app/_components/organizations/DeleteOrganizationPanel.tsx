"use client";

import { useActionState, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { deleteOrganization } from "@/app/_actions/organizations";
import type { FormState } from "@/lib/account";
import { FormMessage } from "../account/FormParts";
import {
  dangerButton,
  fieldLabel,
  inputField,
  mutedText,
  panel,
  secondaryButton,
  sectionTitle,
} from "../ui";

type DeleteOrganizationPanelProps = {
  slug: string;
  name: string;
  openActivityCount: number;
};

// Only the owner sees this panel. The button stays off until the name is typed, and a
// published activity blocks the delete, so the owner cancels those first.
export default function DeleteOrganizationPanel({
  slug,
  name,
  openActivityCount,
}: DeleteOrganizationPanelProps) {
  const [confirming, setConfirming] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [state, formAction, pending] = useActionState<FormState>(
    deleteOrganization.bind(null, slug),
    {},
  );
  const blocked = openActivityCount > 0;
  const nameMatches = typedName.trim() === name;

  function cancel() {
    setConfirming(false);
    setTypedName("");
  }

  return (
    <section
      aria-labelledby="delete-organization-title"
      className={`${panel} flex flex-col gap-4 p-4`}
    >
      <div className="flex flex-col gap-1">
        <h2 id="delete-organization-title" className={sectionTitle}>
          Xóa tổ chức
        </h2>
        <p className={mutedText}>
          Tổ chức sẽ ẩn với mọi người và đường dẫn cũ được nhả ra. Thành viên,
          hoạt động và ảnh vẫn được giữ lại. Bạn có thể khôi phục tổ chức trong
          mục Tổ chức của tôi.
        </p>
      </div>
      {blocked ? (
        <p className={mutedText}>
          Còn {openActivityCount} hoạt động đang mở. Hãy hủy các hoạt động đó
          trước khi xóa tổ chức.
        </p>
      ) : null}
      {confirming ? (
        <form action={formAction} className="flex flex-col gap-3">
          <FormMessage state={state} />
          <label className="flex flex-col gap-1">
            <span className={fieldLabel}>Nhập “{name}” để xác nhận</span>
            <input
              name="confirm_name"
              value={typedName}
              onChange={(event) => setTypedName(event.target.value)}
              autoComplete="off"
              className={inputField}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={!nameMatches || pending || blocked}
              className={dangerButton}
            >
              <FiTrash2 aria-hidden="true" />
              Xóa tổ chức
            </button>
            <button type="button" onClick={cancel} className={secondaryButton}>
              Hủy
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          disabled={blocked}
          onClick={() => setConfirming(true)}
          className={`${dangerButton} self-start`}
        >
          <FiTrash2 aria-hidden="true" />
          Xóa tổ chức
        </button>
      )}
    </section>
  );
}
