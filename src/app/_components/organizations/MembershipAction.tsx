"use client";

import { useState } from "react";
import { FiClock, FiLogOut, FiSend, FiUserPlus, FiX } from "react-icons/fi";
import {
  joinOrganization,
  leaveOrganization,
} from "@/app/_actions/organizations";
import { formatDate, type OrganizationDetail } from "@/lib/organizations";
import { ME } from "@/lib/realtime";
import { FormMessage, SubmitButton, TextAreaField } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import LiveRefresh from "../realtime/LiveRefresh";
import { mutedText, primaryButton, secondaryButton, tagChip } from "../ui";
import ActionButton from "./ActionButton";

function JoinForm({
  slug,
  needsApproval,
}: {
  slug: string;
  needsApproval: boolean;
}) {
  const { state, pending, formProps } = useAccountForm(
    joinOrganization.bind(null, slug),
  );
  return (
    <form {...formProps} className="flex w-full flex-col items-start gap-3">
      <FormMessage state={state} />
      {needsApproval ? (
        <div className="w-full">
          <TextAreaField
            label="Lời nhắn cho ban quản trị (không bắt buộc)"
            name="message"
            rows={3}
            maxLength={1000}
            errors={state.fieldErrors}
          />
        </div>
      ) : null}
      <SubmitButton
        pending={pending}
        icon={needsApproval ? FiSend : FiUserPlus}
        className={primaryButton}
      >
        {needsApproval ? "Gửi yêu cầu" : "Tham gia"}
      </SubmitButton>
    </form>
  );
}

// The viewer's own standing in an organization changed, from any tab or any manager.
const OWN_EVENTS = ["membership.changed"] as const;

type MembershipActionProps = {
  organization: OrganizationDetail;
};

// What the viewer can do with their own membership. Visitors see the join
// button too, and the action sends them to log in first.
export default function MembershipAction({
  organization,
}: MembershipActionProps) {
  const { slug, viewer, join_policy: joinPolicy } = organization;
  const [formOpen, setFormOpen] = useState(false);

  if (viewer.role === "owner") {
    return null;
  }
  if (viewer.status === "active") {
    return (
      <>
        {/* A manager removing this member reloads the view at once. */}
        <LiveRefresh topic={ME} types={OWN_EVENTS} orgId={organization.id} />
        <ActionButton
          action={leaveOrganization.bind(null, slug)}
          label="Rời tổ chức"
          confirmLabel="Rời tổ chức?"
        >
          <FiLogOut aria-hidden="true" />
        </ActionButton>
      </>
    );
  }
  if (viewer.status === "applied") {
    return (
      <div className="flex items-center gap-2">
        {/* Approval or rejection reloads this view at once. */}
        <LiveRefresh topic={ME} types={OWN_EVENTS} orgId={organization.id} />
        <span className={`${tagChip} gap-1`}>
          <FiClock aria-hidden="true" />
          Chờ duyệt
        </span>
        <ActionButton
          action={leaveOrganization.bind(null, slug)}
          label="Rút yêu cầu"
        >
          <FiX aria-hidden="true" />
        </ActionButton>
      </div>
    );
  }
  if (viewer.status === "suspended") {
    return <p className={mutedText}>Tư cách thành viên đang bị tạm ngưng.</p>;
  }
  if (viewer.reapply_after) {
    return (
      <p className={mutedText}>
        Yêu cầu trước đã bị từ chối. Bạn có thể gửi lại từ ngày{" "}
        {formatDate(viewer.reapply_after)}.
      </p>
    );
  }
  // A removed member always goes through approval, even in an open organization.
  const needsApproval = joinPolicy !== "open" || viewer.status === "revoked";
  if (needsApproval && !formOpen) {
    return (
      <button
        type="button"
        onClick={() => setFormOpen(true)}
        className={secondaryButton}
      >
        <FiSend aria-hidden="true" />
        Xin tham gia
      </button>
    );
  }
  return <JoinForm slug={slug} needsApproval={needsApproval} />;
}
