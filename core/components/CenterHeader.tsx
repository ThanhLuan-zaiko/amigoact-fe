import type { ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLogIn, FiMenu } from "react-icons/fi";
import { useSession } from "../../auth/hooks.ts";
import { pageMeta } from "../nav-meta.ts";
import { Avatar } from "./Avatar.tsx";
import { Button } from "./Button.tsx";

const ROUND_BUTTON =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-900 " +
  "transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-zinc-500 dark:text-zinc-100 dark:hover:bg-zinc-900 " +
  "dark:focus-visible:outline-zinc-400";

// Sticky, blurred column header (X): section title, a back arrow on detail
// pages, and on phones the avatar that opens the navigation drawer.
export function CenterHeader({
  onOpenDrawer,
  drawerOpen,
}: {
  onOpenDrawer: () => void;
  drawerOpen: boolean;
}): ReactElement {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const session = useSession();
  const profile = session.data ?? null;
  const meta = pageMeta(pathname);

  function goBack(): void {
    // React Router stores the history index; idx 0 means a direct visit.
    const state = window.history.state as { idx?: number } | null;
    if ((state?.idx ?? 0) > 0) navigate(-1);
    else navigate(meta.back ?? "/");
  }

  return (
    <header className="sticky top-0 z-30 flex min-h-[53px] items-center gap-3 border-b border-zinc-200 bg-white/85 px-2 backdrop-blur sm:px-4 dark:border-zinc-800 dark:bg-zinc-950/85">
      {meta.back !== null ? (
        <button
          type="button"
          onClick={goBack}
          aria-label="Quay lại"
          className={`${ROUND_BUTTON} sm:-ml-2`}
        >
          <FiArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Mở menu"
          aria-expanded={drawerOpen}
          aria-controls="app-drawer"
          className={`${ROUND_BUTTON} sm:hidden`}
        >
          {profile ? (
            <Avatar name={profile.full_name} src={profile.avatar_url} size="sm" />
          ) : (
            <FiMenu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      )}
      <div className="min-w-0 flex-1 py-1.5">
        <p className="truncate text-xl font-bold leading-6 text-zinc-900 dark:text-zinc-100">
          {meta.title}
        </p>
        {meta.section !== null && (
          <p className="truncate text-[13px] text-zinc-500 dark:text-zinc-400">
            {meta.section}
          </p>
        )}
      </div>
      {!profile && !session.isPending && (
        <Button
          to="/login"
          variant="primary"
          size="icon"
          aria-label="Đăng nhập"
          className="sm:hidden"
          icon={<FiLogIn className="h-5 w-5" aria-hidden="true" />}
        />
      )}
    </header>
  );
}
