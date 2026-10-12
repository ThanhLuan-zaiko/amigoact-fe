import { useCallback, useState } from "react";
import type { ReactElement } from "react";
import { FiEdit3, FiSend } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { TextArea } from "../../core/components/TextArea.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useCreatePost } from "../hooks.ts";
import type { PostKind } from "../api.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";
import { PostAttachments } from "./PostAttachments.tsx";

interface PostComposerProps {
  orgId: string;
  canAnnounce: boolean;
}

// Composer for the org board: discussions are one body field, the
// announcement kind adds a required title (post:announce), and the
// attachment strip feeds uploaded media ids into the post.
export function PostComposer({
  orgId,
  canAnnounce,
}: PostComposerProps): ReactElement {
  const [kind, setKind] = useState<PostKind>("discussion");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mediaIds, setMediaIds] = useState<string[]>([]);
  const [attaching, setAttaching] = useState(false);
  const [resetTick, setResetTick] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const create = useCreatePost(orgId);

  const onAttachmentChange = useCallback(
    (ids: string[], busy: boolean) => {
      setMediaIds(ids);
      setAttaching(busy);
    },
    [],
  );

  function submit(): void {
    const trimmed = body.trim();
    if (!trimmed) {
      setError(toVietnameseWorkspaceMessage("REQUIRED"));
      return;
    }
    if (kind === "announcement" && !title.trim()) {
      setError("Thông báo cần có tiêu đề.");
      return;
    }
    if (attaching) {
      setError("Tệp đính kèm đang tải lên, vui lòng chờ.");
      return;
    }
    setError(null);
    create.mutate(
      {
        kind,
        title: kind === "announcement" ? title.trim() : "",
        body: trimmed,
        media_ids: mediaIds,
      },
      {
        onSuccess: () => {
          setBody("");
          setTitle("");
          setKind("discussion");
          setMediaIds([]);
          setResetTick((tick) => tick + 1);
        },
        onError: (err) => {
          setError(
            err instanceof ApiError
              ? toVietnameseWorkspaceMessage(err.code)
              : toVietnameseWorkspaceMessage("REQUEST_FAILED"),
          );
        },
      },
    );
  }

  return (
    <BentoCard className="md:col-span-6 lg:col-span-8">
      <div data-rise className="flex items-center gap-2">
        <FiEdit3 className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Đăng bài mới
        </h2>
      </div>
      <div className="mt-3 flex flex-col gap-3">
        {canAnnounce && (
          <div role="group" aria-label="Loại bài viết" className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={kind === "discussion" ? "primary" : "secondary"}
              onClick={() => setKind("discussion")}
              aria-pressed={kind === "discussion"}
            >
              Thảo luận
            </Button>
            <Button
              type="button"
              variant={kind === "announcement" ? "primary" : "secondary"}
              onClick={() => setKind("announcement")}
              aria-pressed={kind === "announcement"}
            >
              Thông báo
            </Button>
          </div>
        )}
        {kind === "announcement" && (
          <TextField
            label="Tiêu đề"
            name="post-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Tiêu đề thông báo…"
            maxLength={200}
          />
        )}
        <TextArea
          label="Nội dung"
          name="post-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Chia sẻ với thành viên trong tổ chức…"
          maxLength={5000}
          rows={3}
          error={error ?? undefined}
        />
        <PostAttachments
          key={resetTick}
          orgId={orgId}
          onChange={onAttachmentChange}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={submit}
            disabled={create.isPending || attaching}
            icon={<FiSend className="h-4 w-4" aria-hidden="true" />}
          >
            {create.isPending ? "Đang đăng…" : "Đăng bài"}
          </Button>
        </div>
      </div>
    </BentoCard>
  );
}
