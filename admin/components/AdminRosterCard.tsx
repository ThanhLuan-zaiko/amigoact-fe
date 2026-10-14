import { useState } from "react";
import type { ReactElement } from "react";
import { FiMail, FiTrash2, FiUserPlus, FiUsers } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useAdmins, useGrantAdmin, useRevokeAdmin } from "../hooks.ts";
import { adminMessage } from "../messages.tsx";

export function AdminRosterCard(): ReactElement {
  const admins = useAdmins();
  const grant = useGrantAdmin();
  const revoke = useRevokeAdmin();
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  async function submit(): Promise<void> {
    setFeedback(null);
    try {
      await grant.mutateAsync(email.trim());
      setEmail("");
      setFeedback({ ok: true, text: "Đã cấp quyền quản trị viên." });
    } catch (err) {
      setFeedback({
        ok: false,
        text: adminMessage(
          err instanceof ApiError ? err.code : "REQUEST_FAILED",
        ),
      });
    }
  }

  async function remove(userId: string): Promise<void> {
    setFeedback(null);
    try {
      await revoke.mutateAsync(userId);
    } catch (err) {
      setFeedback({
        ok: false,
        text: adminMessage(
          err instanceof ApiError ? err.code : "REQUEST_FAILED",
        ),
      });
    }
  }

  return (
    <Section>
      <div className="flex items-center gap-2">
        <FiUsers
          className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
          aria-hidden="true"
        />
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Quản trị viên
        </h1>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Quản trị viên nền tảng duyệt hồ sơ tổ chức và cấp quyền cho tài khoản khác.
      </p>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="flex-1">
          <TextField
            label="Email tài khoản"
            name="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ten@example.com"
            icon={<FiMail className="h-4 w-4" aria-hidden="true" />}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={grant.isPending || email.trim().length < 3}
          icon={<FiUserPlus className="h-4 w-4" aria-hidden="true" />}
        >
          {grant.isPending ? "Đang cấp…" : "Cấp quyền"}
        </Button>
      </form>
      {feedback && (
        <p
          role={feedback.ok ? "status" : "alert"}
          className={`mt-2 text-sm ${
            feedback.ok
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="mt-4">
        {admins.isPending && <LoadingState label="Đang tải danh sách…" />}
        {admins.isError && (
          <ErrorState
            title="Không tải được danh sách"
            message={adminMessage(
              admins.error instanceof ApiError
                ? admins.error.code
                : "REQUEST_FAILED",
            )}
          />
        )}
        {admins.data && admins.data.length === 0 && (
          <EmptyState
            title="Chưa có quản trị viên được cấp"
            message="Quản trị viên bootstrap qua biến môi trường không hiển thị ở đây."
          />
        )}
        {admins.data && admins.data.length > 0 && (
          <ul className="flex flex-col gap-2">
            {admins.data.map((admin) => (
              <li
                key={admin.user_id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {admin.full_name}
                  </p>
                  <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                    {admin.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Thu hồi quyền của ${admin.email}`}
                  disabled={revoke.isPending}
                  onClick={() => void remove(admin.user_id)}
                >
                  <FiTrash2
                    className="h-4 w-4 text-red-600 dark:text-red-400"
                    aria-hidden="true"
                  />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
