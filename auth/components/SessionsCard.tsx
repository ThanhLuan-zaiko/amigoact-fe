import type { ReactElement } from "react";
import { useState } from "react";
import {
  FiClock,
  FiGlobe,
  FiMonitor,
  FiShield,
  FiSmartphone,
  FiTrash2,
} from "react-icons/fi";
import { EmptyState, LoadingState } from "../../core/components/Feedback.tsx";
import { Section } from "../../core/components/Section.tsx";
import { ConfirmDialog } from "../../core/components/ConfirmDialog.tsx";
import { formatDateTime } from "../../activities/dates.tsx";
import { useAuthSessions, useRevokeAuthSession } from "../hooks.ts";
import type { AuthSession } from "../api.ts";

function deviceIcon(agent: string | null) {
  const text = (agent ?? "").toLowerCase();
  const mobile = /mobile|android|iphone/.test(text);
  const Icon = mobile ? FiSmartphone : FiMonitor;
  return <Icon className="h-5 w-5" aria-hidden />;
}

function deviceLabel(session: AuthSession): string {
  if (session.device_label) return session.device_label;
  const agent = session.user_agent ?? "";
  if (!agent) return "Thiết bị không rõ";
  if (agent.length > 60) return `${agent.slice(0, 57)}…`;
  return agent;
}

function SessionRow({
  session,
  onRevoke,
}: {
  session: AuthSession;
  onRevoke: (session: AuthSession) => void;
}): ReactElement {
  const revoked = session.revoked_at !== null;
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 text-zinc-500 dark:text-zinc-400">
        {deviceIcon(session.user_agent)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {deviceLabel(session)}
          {session.current ? (
            <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Thiết bị này
            </span>
          ) : null}
          {revoked ? (
            <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              Đã đăng xuất
            </span>
          ) : null}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          {session.ip ? (
            <span className="inline-flex items-center gap-1">
              <FiGlobe className="h-3 w-3" aria-hidden />
              {session.ip}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <FiClock className="h-3 w-3" aria-hidden />
            Hoạt động {formatDateTime(session.last_seen_at)}
          </span>
        </p>
      </div>
      {!session.current && !revoked ? (
        <button
          type="button"
          onClick={() => onRevoke(session)}
          aria-label="Đăng xuất thiết bị này"
          className="rounded-full p-2 text-zinc-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-400 dark:hover:bg-red-950 dark:hover:text-red-400"
        >
          <FiTrash2 className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </li>
  );
}

export function SessionsCard(): ReactElement {
  const sessions = useAuthSessions();
  const revoke = useRevokeAuthSession();
  const [target, setTarget] = useState<AuthSession | null>(null);
  return (
    <Section>
      <div className="flex items-center gap-2 px-4 pt-4">
        <FiShield className="h-5 w-5 text-zinc-500 dark:text-zinc-400" aria-hidden />
        <h2 className="text-base font-semibold">Phiên đăng nhập</h2>
      </div>
      <p className="px-4 pb-2 pt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Các thiết bị đang đăng nhập tài khoản của bạn.
      </p>
      {sessions.isPending ? (
        <div className="px-4 pb-4">
          <LoadingState label="Đang tải phiên đăng nhập" />
        </div>
      ) : (sessions.data ?? []).length === 0 ? (
        <div className="px-4 pb-4">
          <EmptyState
            title="Chưa có phiên nào"
            message="Phiên đăng nhập sẽ xuất hiện ở đây."
          />
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {sessions.data!.map((session) => (
            <SessionRow
              key={session.session_id}
              session={session}
              onRevoke={setTarget}
            />
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={target !== null}
        danger
        title="Đăng xuất thiết bị này?"
        message="Thiết bị sẽ bị đăng xuất ngay và phải đăng nhập lại."
        confirmLabel="Đăng xuất thiết bị"
        onClose={() => setTarget(null)}
        onConfirm={() => {
          if (target) revoke.mutate(target.session_id);
          setTarget(null);
        }}
      />
    </Section>
  );
}
