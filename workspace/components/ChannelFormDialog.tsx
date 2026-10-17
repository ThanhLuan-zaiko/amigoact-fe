import { useState } from "react";
import type { ReactElement } from "react";
import { ApiError } from "../../core/api.ts";
import { Avatar } from "../../core/components/Avatar.tsx";
import { Button } from "../../core/components/Button.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useOrgMembers } from "../../dashboard/members-hooks.ts";
import type { ChatChannel } from "../api.ts";
import { useCreateChannel, useUpdateChannel } from "../channel-hooks.ts";
import {
  CHANNEL_KIND_LABELS,
  CHANNEL_POST_POLICY_LABELS,
  CHANNEL_VISIBILITY_LABELS,
  toVietnameseWorkspaceMessage,
} from "../messages.tsx";

interface ChannelFormDialogProps {
  open: boolean;
  onClose: () => void;
  orgId: string;
  // Edit mode when set; create mode when null.
  channel: ChatChannel | null;
}

// Channel create/edit form: name + topic, kind/post-policy/visibility
// selects, plus the seat picker restricted channels are created with.
export function ChannelFormDialog({
  open,
  onClose,
  orgId,
  channel,
}: ChannelFormDialogProps): ReactElement {
  const editing = channel !== null;
  const [name, setName] = useState(channel?.name ?? "");
  const [topic, setTopic] = useState(channel?.topic ?? "");
  const [kind, setKind] = useState(channel?.kind ?? "text");
  const [postPolicy, setPostPolicy] = useState(
    channel?.post_policy ?? "everyone",
  );
  const [visibility, setVisibility] = useState(
    channel?.visibility ?? "org",
  );
  const [seats, setSeats] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setName(channel?.name ?? "");
      setTopic(channel?.topic ?? "");
      setKind(channel?.kind ?? "text");
      setPostPolicy(channel?.post_policy ?? "everyone");
      setVisibility(channel?.visibility ?? "org");
      setSeats([]);
      setError(null);
    }
  }

  const members = useOrgMembers(orgId, { limit: 50, status: "active" });
  const create = useCreateChannel(orgId);
  const update = useUpdateChannel(orgId, channel?.channel_id ?? "");
  const busy = create.isPending || update.isPending;
  const restricted = visibility === "restricted";

  function fail(err: unknown): void {
    setError(
      toVietnameseWorkspaceMessage(
        err instanceof ApiError ? err.code : "REQUEST_FAILED",
      ),
    );
  }

  function submit(): void {
    if (name.trim() === "" || busy) return;
    setError(null);
    if (editing) {
      update.mutate(
        {
          name: name.trim(),
          topic: topic.trim(),
          kind,
          post_policy: postPolicy,
          visibility,
        },
        { onSuccess: onClose, onError: fail },
      );
      return;
    }
    create.mutate(
      {
        name: name.trim(),
        topic: topic.trim(),
        kind,
        post_policy: postPolicy,
        visibility,
        member_ids: restricted ? seats : [],
      },
      { onSuccess: onClose, onError: fail },
    );
  }

  return (
    <Modal
      open={open}
      title={editing ? "Chỉnh sửa kênh" : "Tạo kênh mới"}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3">
        <TextField
          label="Tên kênh"
          name="channel-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="vd: bao-cao-tuan"
          maxLength={80}
          autoComplete="off"
          required
        />
        <TextField
          label="Chủ đề"
          name="channel-topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Kênh này dùng để làm gì?"
          maxLength={200}
          autoComplete="off"
        />
        <SelectField
          label="Loại kênh"
          name="channel-kind"
          value={kind}
          onChange={(value) =>
            setKind(value as typeof kind)
          }
          options={Object.entries(CHANNEL_KIND_LABELS).map(
            ([value, label]) => ({ value, label }),
          )}
        />
        <SelectField
          label="Ai được đăng"
          name="channel-post-policy"
          value={postPolicy}
          onChange={(value) =>
            setPostPolicy(value as typeof postPolicy)
          }
          options={Object.entries(CHANNEL_POST_POLICY_LABELS).map(
            ([value, label]) => ({ value, label }),
          )}
        />
        <SelectField
          label="Ai nhìn thấy"
          name="channel-visibility"
          value={visibility}
          onChange={(value) =>
            setVisibility(value as typeof visibility)
          }
          options={Object.entries(CHANNEL_VISIBILITY_LABELS).map(
            ([value, label]) => ({ value, label }),
          )}
        />
        {restricted && !editing && (
          <section>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Thành viên kênh ({seats.length})
            </p>
            <ul className="max-h-[30vh] overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              {(members.data?.items ?? []).map((member) => {
                const picked = seats.includes(member.user_id);
                return (
                  <li key={member.user_id}>
                    <button
                      type="button"
                      onClick={() =>
                        setSeats((prev) =>
                          picked
                            ? prev.filter((id) => id !== member.user_id)
                            : [...prev, member.user_id],
                        )
                      }
                      aria-pressed={picked}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                        picked ? "bg-zinc-100 dark:bg-zinc-900" : ""
                      }`}
                    >
                      <Avatar
                        name={member.full_name}
                        src={member.avatar_url}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {member.full_name}
                      </span>
                      <span
                        className={`h-4 w-4 rounded-full border-2 ${
                          picked
                            ? "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100"
                            : "border-zinc-300 dark:border-zinc-700"
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
        {error !== null && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <Button
          type="button"
          variant="primary"
          onClick={submit}
          disabled={name.trim() === "" || busy}
        >
          {editing ? "Lưu thay đổi" : "Tạo kênh"}
        </Button>
      </div>
    </Modal>
  );
}
