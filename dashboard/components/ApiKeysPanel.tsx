import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import {
  FiCheck,
  FiClipboard,
  FiKey,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { ConfirmDialog } from "../../core/components/ConfirmDialog.tsx";
import { EmptyState, LoadingState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { formatDateTime } from "../../activities/dates.tsx";
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from "../apikeys-hooks.ts";
import type { ApiKeyItem, IssuedApiKey } from "../apikeys-api.ts";

function IssuedBanner({
  issued,
  onDone,
}: {
  issued: IssuedApiKey;
  onDone: () => void;
}): ReactElement {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950">
      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
        Khóa API mới — sao chép ngay, hệ thống không lưu lại.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-emerald-200 bg-white px-2 py-1 text-xs dark:border-emerald-800 dark:bg-zinc-900">
          {issued.api_key}
        </code>
        <Button
          type="button"
          variant="secondary"
          aria-label="Sao chép khóa"
          icon={copied ? <FiCheck className="h-4 w-4" /> : <FiClipboard className="h-4 w-4" />}
          onClick={() => {
            void navigator.clipboard.writeText(issued.api_key);
            setCopied(true);
          }}
        >
          {copied ? "Đã chép" : "Chép"}
        </Button>
      </div>
      <Button type="button" variant="secondary" className="mt-2" onClick={onDone}>
        Tôi đã lưu khóa
      </Button>
    </div>
  );
}

function KeyRow({
  item,
  onRevoke,
}: {
  item: ApiKeyItem;
  onRevoke: (item: ApiKeyItem) => void;
}): ReactElement {
  const revoked = item.revoked_at !== null;
  return (
    <li className="flex items-center gap-3 px-1 py-2">
      <FiKey className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {item.name}
          {revoked ? (
            <span className="ml-2 text-xs text-zinc-500">Đã thu hồi</span>
          ) : null}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {item.scopes.length > 0 ? item.scopes.join(", ") : "Toàn quyền"} ·{" "}
          {item.last_used_at
            ? `Dùng gần nhất ${formatDateTime(item.last_used_at)}`
            : "Chưa dùng"}
          {item.expires_at ? ` · Hết hạn ${formatDateTime(item.expires_at)}` : ""}
        </p>
      </div>
      {!revoked ? (
        <button
          type="button"
          aria-label={`Thu hồi ${item.name}`}
          onClick={() => onRevoke(item)}
          className="rounded-full p-2 text-zinc-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-400 dark:hover:bg-red-950 dark:hover:text-red-400"
        >
          <FiTrash2 className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </li>
  );
}

export function ApiKeysPanel({ orgId }: { orgId: string }): ReactElement {
  const keys = useApiKeys(orgId);
  const create = useCreateApiKey(orgId);
  const revoke = useRevokeApiKey(orgId);
  const [name, setName] = useState("");
  const [issued, setIssued] = useState<IssuedApiKey | null>(null);
  const [target, setTarget] = useState<ApiKeyItem | null>(null);

  function submit(event: FormEvent): void {
    event.preventDefault();
    if (!name.trim()) return;
    create.mutate(
      { name: name.trim() },
      {
        onSuccess: (data) => {
          setIssued(data);
          setName("");
        },
      },
    );
  }

  return (
    <section className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <FiKey className="h-4 w-4" aria-hidden /> Khóa API tích hợp
      </h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Dùng header <code>X-Api-Key</code> để gọi API thay mặt tổ chức.
      </p>
      {issued ? (
        <div className="mt-3">
          <IssuedBanner issued={issued} onDone={() => setIssued(null)} />
        </div>
      ) : null}
      <form onSubmit={submit} className="mt-3 flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <TextField
            label="Tên khóa"
            name="apikey-name"
            placeholder="Ví dụ: bot đồng bộ"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          disabled={create.isPending || name.trim().length < 2}
          icon={<FiPlus className="h-4 w-4" aria-hidden />}
        >
          Tạo khóa
        </Button>
      </form>
      {keys.isPending ? (
        <LoadingState label="Đang tải khóa API" />
      ) : (keys.data ?? []).length === 0 ? (
        <div className="mt-2">
          <EmptyState
            title="Chưa có khóa nào"
            message="Tạo khóa để tích hợp hệ thống ngoài."
          />
        </div>
      ) : (
        <ul className="mt-1 divide-y divide-zinc-200 dark:divide-zinc-800">
          {keys.data!.map((item) => (
            <KeyRow key={item.key_id} item={item} onRevoke={setTarget} />
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={target !== null}
        danger
        title="Thu hồi khóa API?"
        message={`Khóa "${target?.name ?? ""}" sẽ ngừng hoạt động ngay.`}
        confirmLabel="Thu hồi"
        onClose={() => setTarget(null)}
        onConfirm={() => {
          if (target) revoke.mutate(target.key_id);
          setTarget(null);
        }}
      />
    </section>
  );
}
