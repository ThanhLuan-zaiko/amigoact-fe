import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { FiUserPlus, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Avatar } from "../../core/components/Avatar.tsx";
import { Button } from "../../core/components/Button.tsx";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { useOrgMembers } from "../../dashboard/members-hooks.ts";
import type { ChatChannel } from "../api.ts";
import {
  useAddChannelMember,
  useChannelMembers,
  useRemoveChannelMember,
} from "../channel-hooks.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";

interface ChannelMembersDialogProps {
  open: boolean;
  onClose: () => void;
  orgId: string;
  channel: ChatChannel;
}

// Restricted-channel roster editor: seated members plus an add picker
// fed by org members who do not hold a seat yet.
export function ChannelMembersDialog({
  open,
  onClose,
  orgId,
  channel,
}: ChannelMembersDialogProps): ReactElement {
  const [pick, setPick] = useState("");
  const [error, setError] = useState<string | null>(null);
  const roster = useChannelMembers(
    orgId,
    open ? channel.channel_id : null,
  );
  const members = useOrgMembers(orgId, { limit: 50, status: "active" });
  const add = useAddChannelMember(orgId, channel.channel_id);
  const remove = useRemoveChannelMember(orgId, channel.channel_id);

  const candidates = useMemo(() => {
    const seated = new Set(
      (roster.data?.items ?? []).map((item) => item.user_id),
    );
    return (members.data?.items ?? [])
      .filter((member) => !seated.has(member.user_id))
      .map((member) => ({
        value: member.user_id,
        label: member.full_name,
      }));
  }, [roster.data, members.data]);

  function fail(err: unknown): void {
    setError(
      toVietnameseWorkspaceMessage(
        err instanceof ApiError ? err.code : "REQUEST_FAILED",
      ),
    );
  }

  function seat(): void {
    if (pick === "") return;
    setError(null);
    add.mutate(pick, { onSuccess: () => setPick(""), onError: fail });
  }

  return (
    <Modal
      open={open}
      title={`Thành viên kênh #${channel.name}`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-2">
          <SelectField
            label="Thêm thành viên"
            name="channel-member-pick"
            value={pick}
            onChange={setPick}
            options={candidates}
            placeholder="Chọn thành viên…"
            className="min-w-0 flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={seat}
            disabled={pick === "" || add.isPending}
            aria-label="Thêm vào kênh"
            icon={<FiUserPlus className="h-4 w-4" aria-hidden="true" />}
          >
            Thêm
          </Button>
        </div>
        {roster.isPending && <LoadingState label="Đang tải…" />}
        <ul className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          {(roster.data?.items ?? []).map((item) => (
            <li
              key={item.user_id}
              className="flex items-center gap-2.5 border-b border-zinc-100 px-3 py-2 last:border-0 dark:border-zinc-800"
            >
              <Avatar
                name={item.full_name}
                src={item.avatar_url}
                size="sm"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {item.full_name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  remove.mutate(item.user_id, { onError: fail })
                }
                disabled={remove.isPending}
                aria-label={`Gỡ ${item.full_name} khỏi kênh`}
                icon={<FiX className="h-4 w-4" aria-hidden="true" />}
              />
            </li>
          ))}
          {roster.data !== undefined &&
            roster.data.items.length === 0 && (
              <li className="px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                Chưa có thành viên nào trong kênh.
              </li>
            )}
        </ul>
        {error !== null && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
