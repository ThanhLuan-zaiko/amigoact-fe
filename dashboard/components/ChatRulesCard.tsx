import type { ReactElement } from "react";
import { FiMessageSquare, FiVolume2 } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { pushToast } from "../../core/toast.ts";
import {
  useChatSafety,
  useLiftTimeout,
  useSetAttachPolicy,
} from "../../workspace/safety-hooks.ts";
import { formatTime } from "../../workspace/messages.tsx";
import { hasPermission } from "../members-utils.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import { memberMutationToast } from "../messages-members.tsx";

interface ChatRulesCardProps {
  orgId: string;
  viewerRole: string;
  viewerPermissions: string[];
}

// Chat house rules for managers: who may attach files, and who is muted
// right now. Rendered only for people who can change at least one of them.
export function ChatRulesCard({
  orgId,
  viewerRole,
  viewerPermissions,
}: ChatRulesCardProps): ReactElement | null {
  const safety = useChatSafety(orgId);
  const policy = useSetAttachPolicy(orgId);
  const lift = useLiftTimeout(orgId);
  const canPolicy = hasPermission(viewerRole, viewerPermissions, "chat:channel");
  const canMute = hasPermission(viewerRole, viewerPermissions, "chat:timeout");
  if (!canPolicy && !canMute) return null;

  const restricted = safety.data?.attach_restricted ?? false;
  const timeouts = safety.data?.timeouts ?? [];

  async function act(task: Promise<unknown>, success: string): Promise<void> {
    try {
      await task;
      pushToast({ tone: "success", title: success });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Thao tác thất bại",
        message: toVietnameseDashboardMessage(
          error instanceof ApiError ? error.code : "REQUEST_FAILED",
        ),
      });
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <FiMessageSquare className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Quy tắc chat
        </h3>
      </div>
      <div className="mt-3 flex flex-col gap-4" aria-live="polite" aria-busy={safety.isPending}>
        {safety.isPending && <LoadingState label="Đang tải quy tắc chat…" />}
        {safety.isError && (
          <ErrorState
            title="Không tải được quy tắc chat"
            message={toVietnameseDashboardMessage(
              safety.error instanceof ApiError ? safety.error.code : "REQUEST_FAILED",
            )}
          />
        )}
        {safety.data && canPolicy && (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 accent-zinc-900 dark:accent-zinc-100"
              checked={restricted}
              disabled={policy.isPending}
              onChange={() =>
                void act(
                  policy.mutateAsync(!restricted),
                  restricted
                    ? "Mọi thành viên đã đính kèm được tệp."
                    : "Đã giới hạn đính kèm tệp cho người được cấp quyền.",
                )
              }
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Giới hạn đính kèm tệp
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                Chỉ chủ sở hữu và người có quyền "Đính kèm tệp" được gửi ảnh, video trong các phòng chung. Tin nhắn riêng không bị ảnh hưởng.
              </span>
            </span>
          </label>
        )}
        {safety.data && canMute && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Đang bị tạm cấm chat
            </p>
            {timeouts.length === 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Hiện không có thành viên nào bị tạm cấm chat.
              </p>
            )}
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {timeouts.map((item) => (
                <li key={item.user_id} className="flex items-center justify-between gap-2 py-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.user_name || "Thành viên"}
                    </span>
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      {`đến ${formatTime(item.until)}${item.reason ? ` · ${item.reason}` : ""}`}
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={lift.isPending}
                    onClick={() =>
                      void act(
                        lift.mutateAsync(item.user_id),
                        memberMutationToast("untimeout", item.user_name || null),
                      )
                    }
                    icon={<FiVolume2 className="h-4 w-4" aria-hidden="true" />}
                  >
                    Bỏ cấm
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
