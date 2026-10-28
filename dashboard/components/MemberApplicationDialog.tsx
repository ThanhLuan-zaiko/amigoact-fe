import type { ReactElement } from "react";
import { ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { useMemberApplication } from "../application-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { DashboardMember } from "../members-api.ts";

interface MemberApplicationDialogProps {
  orgId: string;
  member: DashboardMember;
  onClose: () => void;
}

// Reviewer view of one submission: answers in form order, blanks marked.
export function MemberApplicationDialog({
  orgId,
  member,
  onClose,
}: MemberApplicationDialogProps): ReactElement {
  const application = useMemberApplication(orgId, member.user_id, true);
  const data = application.data;
  const submitted = data
    ? new Date(data.submitted_at).toLocaleString("vi-VN")
    : "";
  return (
    <Modal
      open
      title={`Hồ sơ của ${member.full_name || "người nộp"}`}
      onClose={onClose}
    >
      {application.isPending && <LoadingState label="Đang tải hồ sơ…" />}
      {application.isError && (
        <ErrorState
          title="Không tải được hồ sơ"
          message={toVietnameseDashboardMessage(
            application.error?.code ?? "REQUEST_FAILED",
          )}
        />
      )}
      {data && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {`Nộp lúc ${submitted}`}
          </p>
          {data.answers.length === 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Biểu mẫu hiện không có câu hỏi nào.
            </p>
          )}
          <dl className="flex flex-col gap-3">
            {data.answers.map((item) => (
              <div key={item.question_id}>
                <dt className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {item.label}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                  {item.answer || "Chưa trả lời"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Modal>
  );
}
