import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { FiInbox } from "react-icons/fi";
import { useSession } from "../../auth/hooks.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { Section } from "../../core/components/Section.tsx";
import { useMyMemberships } from "../../dashboard/members-hooks.ts";
import { FormFields } from "../../registrations/components/FormFields.tsx";
import { useApplyToOrg, useMembershipForm } from "../application-hooks.ts";
import type { PublicOrgDetail } from "../api.ts";
import { toVietnameseOrgsMessage } from "../messages.tsx";

interface ApplyOrgCardProps {
  org: PublicOrgDetail;
}

// Applicant panel for review-policy orgs: shows the org's form, or the
// viewer's current standing when a form is no longer the next step.
export function ApplyOrgCard({ org }: ApplyOrgCardProps): ReactElement | null {
  const session = useSession();
  const signedIn = session.data != null;
  const mine = useMyMemberships(undefined, signedIn);
  const status =
    mine.data?.items.find((item) => item.org_id === org.id)?.status ?? null;
  const canApply =
    signedIn &&
    mine.isSuccess &&
    (status === null || status === "left" || status === "revoked");
  const form = useMembershipForm(org.id, canApply);
  const apply = useApplyToOrg(org.slug);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [missing, setMissing] = useState(false);

  if (!signedIn) return null;

  const questions = form.data?.questions ?? [];

  function onSubmit(event: FormEvent): void {
    event.preventDefault();
    const blank = questions.some(
      (q) => q.required && !(answers[q.question_id] ?? "").trim(),
    );
    setMissing(blank);
    if (blank) return;
    apply.mutate({ orgId: org.id, answers });
  }

  function standing(): ReactElement | null {
    if (status === "active") {
      return <p className="text-sm text-zinc-700 dark:text-zinc-300">Bạn đã là thành viên của tổ chức này.</p>;
    }
    if (status === "applied") {
      return (
        <p className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <FiInbox className="h-4 w-4" aria-hidden="true" />
          Hồ sơ của bạn đã được gửi và đang chờ tổ chức duyệt.
        </p>
      );
    }
    if (status === "invited") {
      return <p className="text-sm text-zinc-700 dark:text-zinc-300">Bạn đang có lời mời tham gia tổ chức này. Hãy phản hồi lời mời ở mục Thành viên.</p>;
    }
    if (status === "suspended") {
      return <p className="text-sm text-zinc-700 dark:text-zinc-300">Bạn đang bị tạm khóa tại tổ chức này.</p>;
    }
    return null;
  }

  let body: ReactElement;
  if (mine.isPending) {
    body = <LoadingState label="Đang kiểm tra hồ sơ…" />;
  } else if (mine.isError) {
    body = (
      <ErrorState
        title="Không tải được trạng thái hồ sơ"
        message={toVietnameseOrgsMessage(mine.error?.code ?? "REQUEST_FAILED")}
      />
    );
  } else if (!canApply) {
    body = standing() ?? <></>;
  } else if (form.isPending) {
    body = <LoadingState label="Đang tải biểu mẫu…" />;
  } else if (form.isError) {
    body = (
      <ErrorState
        title="Không tải được biểu mẫu"
        message={toVietnameseOrgsMessage(form.error?.code ?? "REQUEST_FAILED")}
      />
    );
  } else {
    body = (
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormFields
          questions={questions}
          answers={answers}
          onChange={(questionId, value) =>
            setAnswers((prev) => ({ ...prev, [questionId]: value }))
          }
        />
        {missing && (
          <p className="text-sm text-red-700 dark:text-red-300">
            {toVietnameseOrgsMessage("ANSWER_REQUIRED")}
          </p>
        )}
        {apply.isError && (
          <ErrorState
            title="Chưa gửi được hồ sơ"
            message={toVietnameseOrgsMessage(apply.error?.code ?? "REQUEST_FAILED")}
          />
        )}
        <div>
          <Button type="submit" variant="primary" disabled={apply.isPending}>
            {apply.isPending ? "Đang gửi…" : "Gửi hồ sơ"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div id="apply-org">
      <Section>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Nộp hồ sơ tình nguyện
        </h2>
        <div className="mt-3">{body}</div>
      </Section>
    </div>
  );
}
