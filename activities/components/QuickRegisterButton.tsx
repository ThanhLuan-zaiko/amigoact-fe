import { useState, type ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FiLogIn, FiSend } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { useSession } from "../../auth/hooks.ts";
import { loginPath } from "../../auth/next-path.ts";
import { useApply } from "../../registrations/hooks.ts";
import {
  applyOutcomeCopy,
  toRegistrationFailure,
} from "../../registrations/messages.tsx";
import type { BrowseItem } from "../browse-api.ts";
import { activityKeys } from "../keys.ts";

interface QuickRegisterButtonProps {
  item: BrowseItem;
  myStatus?: string;
}

interface Failure {
  message: string;
  // The form or slots changed after the list loaded: the detail page can fix it.
  needsDetail: boolean;
}

// One-click sign-up on a feed row, offered only for open activities that ask
// nothing beyond the click. Guests get a sign-in link that comes back here.
export function QuickRegisterButton({
  item,
  myStatus,
}: QuickRegisterButtonProps): ReactElement | null {
  const session = useSession();
  const location = useLocation();
  const queryClient = useQueryClient();
  const apply = useApply(item.id);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);

  const offered =
    item.quick_apply &&
    item.registration_open &&
    (myStatus === undefined || myStatus === "cancelled");
  if (!offered) return null;

  if (!session.data) {
    return (
      <Button
        to={loginPath(`${location.pathname}${location.search}`)}
        variant="secondary"
        className="relative z-10"
        icon={<FiLogIn className="h-4 w-4" aria-hidden="true" />}
      >
        Đăng nhập để đăng ký
      </Button>
    );
  }

  const onRegister = async (): Promise<void> => {
    setOutcome(null);
    setFailure(null);
    try {
      const registration = await apply.mutateAsync({});
      setOutcome(applyOutcomeCopy(registration.status));
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "";
      if (code === "REGISTRATION_CLOSED" || code === "ALREADY_REGISTERED") {
        // The list is stale; refresh it so the row shows the current state.
        void queryClient.invalidateQueries({
          queryKey: activityKeys.browseAll(),
        });
      }
      setFailure({
        message: toRegistrationFailure(err),
        needsDetail: code === "INVALID_REGISTRATION_STATE",
      });
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-start gap-1">
      <Button
        disabled={apply.isPending}
        onClick={() => void onRegister()}
        icon={<FiSend className="h-4 w-4" aria-hidden="true" />}
      >
        {apply.isPending
          ? "Đang gửi…"
          : item.seats_left === 0
            ? "Vào danh sách chờ"
            : "Đăng ký tham gia"}
      </Button>
      {outcome !== null && (
        <p role="status" className="text-xs text-emerald-600 dark:text-emerald-400">
          {outcome}
        </p>
      )}
      {failure !== null && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {failure.message}
          {failure.needsDetail && (
            <>
              {" "}
              <Link
                to={`/events/${item.org_id}/${item.slug}`}
                className="underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400"
              >
                Mở trang đăng ký
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
