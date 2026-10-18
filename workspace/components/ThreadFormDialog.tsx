import { useState } from "react";
import type { ReactElement } from "react";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useOrgActivities } from "../../activities/hooks.ts";
import { useCreateRoomThread } from "../channel-hooks.ts";
import {
  CHANNEL_KIND_LABELS,
  CHANNEL_POST_POLICY_LABELS,
  toVietnameseWorkspaceMessage,
} from "../messages.tsx";

interface ThreadFormDialogProps {
  open: boolean;
  onClose: () => void;
  orgId: string;
  // The room the thread hangs under; shown as context in the title.
  roomId: string;
  parentTitle: string;
  // Navigate straight into the new thread once it is created.
  onCreated?: (roomId: string) => void;
}

// Focused sub-thread form: name + topic + kind + optional activity
// link. Visibility is inherited from the parent room (restricted
// parents gate threads through their roster), so there is no picker.
export function ThreadFormDialog({
  open,
  onClose,
  orgId,
  roomId,
  parentTitle,
  onCreated,
}: ThreadFormDialogProps): ReactElement {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [kind, setKind] = useState<"text" | "report" | "task">("text");
  const [postPolicy, setPostPolicy] = useState<"everyone" | "managers">(
    "everyone",
  );
  const [activityId, setActivityId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setName("");
      setTopic("");
      setKind("text");
      setPostPolicy("everyone");
      setActivityId("");
      setError(null);
    }
  }

  const activities = useOrgActivities(open ? orgId : null);
  const create = useCreateRoomThread(orgId, roomId);
  const busy = create.isPending;

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
    create.mutate(
      {
        name: name.trim(),
        topic: topic.trim(),
        kind,
        post_policy: postPolicy,
        activity_id: activityId === "" ? null : activityId,
      },
      {
        onSuccess: (thread) => {
          onClose();
          onCreated?.(thread.channel_id);
        },
        onError: fail,
      },
    );
  }

  return (
    <Modal
      open={open}
      title={`Luồng mới trong ${parentTitle}`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3">
        <TextField
          label="Tên luồng"
          name="thread-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="vd: chien-dich-mua-he"
          maxLength={80}
          autoComplete="off"
          required
        />
        <TextField
          label="Chủ đề"
          name="thread-topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Luồng này tập trung vào việc gì?"
          maxLength={200}
          autoComplete="off"
        />
        <SelectField
          label="Loại luồng"
          name="thread-kind"
          value={kind}
          onChange={(value) => setKind(value as typeof kind)}
          options={Object.entries(CHANNEL_KIND_LABELS).map(
            ([value, label]) => ({ value, label }),
          )}
        />
        <SelectField
          label="Ai được đăng"
          name="thread-post-policy"
          value={postPolicy}
          onChange={(value) =>
            setPostPolicy(value as typeof postPolicy)
          }
          options={Object.entries(CHANNEL_POST_POLICY_LABELS).map(
            ([value, label]) => ({ value, label }),
          )}
        />
        <SelectField
          label="Gắn hoạt động"
          name="thread-activity"
          value={activityId}
          onChange={setActivityId}
          options={[
            { value: "", label: "Không gắn" },
            ...(activities.data ?? []).map((item) => ({
              value: item.id,
              label: item.title,
            })),
          ]}
        />
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
          Tạo luồng
        </Button>
      </div>
    </Modal>
  );
}
