import type { ReactElement } from "react";
import { FiArchive, FiHash, FiSettings, FiUsers } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import type { ChatChannel } from "../api.ts";
import { useUpdateChannel } from "../channel-hooks.ts";
import { CHANNEL_KIND_LABELS } from "../messages.tsx";

interface ChannelRowProps {
  channel: ChatChannel;
  canManage: boolean;
  orgId: string;
  onOpen: () => void;
  onEdit: () => void;
  onRoster: () => void;
  onError: (err: unknown) => void;
}

// One directory row: open the room, plus manager-only edit/roster/
// archive affordances.
export function ChannelRow({
  channel,
  canManage,
  orgId,
  onOpen,
  onEdit,
  onRoster,
  onError,
}: ChannelRowProps): ReactElement {
  const update = useUpdateChannel(orgId, channel.channel_id);
  const archived = channel.archived_at !== null;
  return (
    <li className="flex items-center gap-2.5 rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <FiHash
        className="h-4 w-4 shrink-0 text-zinc-500"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {channel.name}
          {archived && (
            <span className="ml-1.5 text-xs font-normal text-zinc-500">
              (đã lưu trữ)
            </span>
          )}
        </span>
        <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
          {CHANNEL_KIND_LABELS[channel.kind] ?? channel.kind}
          {channel.post_policy === "managers" && " · chỉ quản lý đăng"}
          {channel.visibility === "restricted" && " · hạn chế"}
        </span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onOpen}
        aria-label={`Mở kênh ${channel.name}`}
        icon={<FiHash className="h-4 w-4" aria-hidden="true" />}
      />
      {canManage && channel.visibility === "restricted" && !archived && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRoster}
          aria-label={`Thành viên kênh ${channel.name}`}
          icon={<FiUsers className="h-4 w-4" aria-hidden="true" />}
        />
      )}
      {canManage && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
          aria-label={`Chỉnh sửa ${channel.name}`}
          icon={<FiSettings className="h-4 w-4" aria-hidden="true" />}
        />
      )}
      {canManage && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() =>
            update.mutate({ archived: !archived }, { onError })
          }
          disabled={update.isPending}
          aria-label={
            archived
              ? `Khôi phục ${channel.name}`
              : `Lưu trữ ${channel.name}`
          }
          icon={<FiArchive className="h-4 w-4" aria-hidden="true" />}
        />
      )}
    </li>
  );
}
