import { useState } from "react";
import type { ReactElement } from "react";
import { FiCheck, FiMail, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { useSession } from "../../auth/hooks.ts";
import { useAcceptInvite, useDeclineInvite, useMyMemberships } from "../members-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { MyMembership } from "../members-api.ts";

function invitedLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
}

export function InvitationInboxCard(): ReactElement | null {
  const session = useSession();
  const invites = useMyMemberships("invited", session.data != null);
  const accept = useAcceptInvite();
  const decline = useDeclineInvite();
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [noteCode, setNoteCode] = useState<string | null>(null);
  const busy = accept.isPending || decline.isPending;
  const items = invites.data?.items ?? [];

  async function run(task: Promise<unknown>, code: string): Promise<void> {
    setServerCode(null);
    setNoteCode(null);
    try {
      await task;
      setNoteCode(code);
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }


  if (
    invites.data !== undefined &&
    items.length === 0 &&
    !noteCode &&
    !serverCode &&
    !invites.isPending &&
    !invites.isError
  )
    return null;

  return (
    <Section>
      <div className="flex items-center gap-2">
        <FiMail className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Lời mời của tôi
        </h3>
        {items.length > 0 && (
          <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {items.length}
          </span>
        )}
      </div>
      <div className="mt-3" aria-live="polite" aria-busy={invites.isPending}>
        {invites.isPending && <LoadingState label="Đang tải lời mời…" />}
        {invites.isError && (
          <ErrorState
            title="Không tải được lời mời"
            message={toVietnameseDashboardMessage(
              invites.error instanceof ApiError ? invites.error.code : "REQUEST_FAILED",
            )}
          />
        )}
        {noteCode && (
          <p
            role="status"
            className="mb-3 flex items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-100 p-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <FiCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
            {toVietnameseDashboardMessage(noteCode)}
          </p>
        )}
        {serverCode && (
          <div className="mb-3">
            <ErrorState title="Thao tác thất bại" message={toVietnameseDashboardMessage(serverCode)} />
          </div>
        )}
        {items.length > 0 && (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {items.map((invite: MyMembership) => (
              <li
                key={invite.org_id}
                className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    <FiMail className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {invite.org_name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {`@${invite.org_slug}`}
                      {invitedLabel(invite.joined_at) ? ` · mời ${invitedLabel(invite.joined_at)}` : ""}
                      {invite.invited_by_name ? ` · bởi ${invite.invited_by_name}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={busy}
                    onClick={() => run(accept.mutateAsync(invite.org_id), "INVITE_ACCEPTED")}
                    icon={<FiCheck className="h-4 w-4" aria-hidden="true" />}
                  >
                    Chấp nhận
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => run(decline.mutateAsync(invite.org_id), "INVITE_DECLINED")}
                    icon={<FiX className="h-4 w-4" aria-hidden="true" />}
                  >
                    Từ chối
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
