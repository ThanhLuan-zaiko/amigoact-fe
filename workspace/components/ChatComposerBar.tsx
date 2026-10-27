import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { FiSend } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { ChatAttachment, ChatMessage } from "../api.ts";
import {
  useDiscardChatAttachment,
  useEditChatMessage,
  useSendChatMessage,
  useUploadChatAttachment,
} from "../hooks.ts";
import { sendChatTyping } from "../realtime-hooks.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";
import { useComposerSafety } from "../safety-state.tsx";
import { ChatAttachButton } from "./ChatAttachButton.tsx";
import { ChatContextBar } from "./ChatContextBar.tsx";
import { ChatComposerShortcuts } from "./ChatComposerShortcuts.tsx";
import { ChatPendingChips } from "./ChatPendingChips.tsx";

const ACCEPT = "image/*,video/*";
const MAX_ATTACHMENTS = 4;

function draftKey(roomId: string): string {
  return `chat-draft:${roomId}`;
}

interface ChatComposerBarProps {
  roomId: string;
  replyTo: ChatMessage | null;
  editing: ChatMessage | null;
  onClearContext: () => void;
  // Reply preview taps scroll back to the quoted message.
  onJumpTo?: (messageId: string) => void;
  // Called after a successful send so the panel can scroll to the tail.
  onSent: () => void;
  // Channel gates (managers-only/archived): replaces the input with a
  // notice so blocked members never type a message that would 403/409.
  disabledReason?: string | null;
  // Org whose safety rules apply (null for dm rooms).
  orgId?: string | null;
  onQuickEvent?: () => void;
  onShareThread?: () => void;
  manageActivityTo?: string;
}

// Telegram composer: per-room draft, reply/edit context bars above the
// input, staged attachment chips, Enter to send.
export function ChatComposerBar({
  roomId,
  replyTo,
  editing,
  onClearContext,
  onJumpTo,
  onSent,
  disabledReason: roomReason = null,
  orgId = null,
  onQuickEvent,
  onShareThread,
  manageActivityTo,
}: ChatComposerBarProps): ReactElement {
  const [draft, setDraft] = useState(
    () => localStorage.getItem(draftKey(roomId)) ?? "",
  );
  const [editingFor, setEditingFor] = useState<string | null>(null);
  const [pending, setPending] = useState<ChatAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const safety = useComposerSafety(orgId);
  const disabledReason = roomReason ?? safety.blockedReason;
  const send = useSendChatMessage(roomId);
  const edit = useEditChatMessage(roomId);
  const upload = useUploadChatAttachment(roomId);
  const discard = useDiscardChatAttachment(roomId);

  // Entering edit mode prefills the composer with the original text.
  if (editing !== null && editingFor !== editing.message_id) {
    setEditingFor(editing.message_id);
    setDraft(editing.body);
    for (const item of pending) discard.mutate(item.media_id);
    setPending([]);
    setError(null);
  }
  if (editing === null && editingFor !== null) setEditingFor(null);

  const busy = send.isPending || edit.isPending || upload.isPending;
  const hasText = draft.trim() !== "";
  const canSubmit = !busy && (hasText || (editing === null && pending.length > 0));

  function showError(err: unknown): void {
    setError(
      toVietnameseWorkspaceMessage(
        err instanceof ApiError ? err.code : "REQUEST_FAILED",
      ),
    );
  }

  function changeDraft(value: string): void {
    setDraft(value);
    localStorage.setItem(draftKey(roomId), value);
    if (value.trim()) sendChatTyping(roomId);
  }

  function pickFiles(files: FileList | null): void {
    if (files === null) return;
    const room = MAX_ATTACHMENTS - pending.length;
    for (const file of Array.from(files).slice(0, room)) {
      upload.mutate(file, {
        onSuccess: (item) =>
          setPending((prev) =>
            prev.length < MAX_ATTACHMENTS ? [...prev, item] : prev,
          ),
        onError: showError,
      });
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function submit(): void {
    const body = draft.trim();
    setError(null);
    if (editing !== null) {
      if (body === "") return;
      edit.mutate(
        { messageId: editing.message_id, body },
        {
          onSuccess: () => {
            setDraft("");
            localStorage.removeItem(draftKey(roomId));
            onClearContext();
            onSent();
          },
          onError: showError,
        },
      );
      return;
    }
    if (body === "" && pending.length === 0) return;
    send.mutate(
      {
        body,
        reply_to_id: replyTo?.message_id ?? null,
        attachment_ids: pending.map((item) => item.media_id),
      },
      {
        onSuccess: () => {
          setDraft("");
          setPending([]);
          localStorage.removeItem(draftKey(roomId));
          onClearContext();
          onSent();
        },
        onError: showError,
      },
    );
  }

  return (
    <footer className="shrink-0 border-t border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
      {replyTo !== null && editing === null && (
        <ChatContextBar
          label={`Trả lời ${replyTo.author_name}`}
          preview={replyTo.body}
          onClose={onClearContext}
          onJump={onJumpTo && (() => onJumpTo(replyTo.message_id))}
        />
      )}
      {editing !== null && (
        <ChatContextBar
          label="Chỉnh sửa tin nhắn"
          preview={editing.body}
          onClose={onClearContext}
        />
      )}
      {pending.length > 0 && (
        <ChatPendingChips
          items={pending}
          onRemove={(mediaId) => {
            discard.mutate(mediaId);
            setPending((prev) => prev.filter((item) => item.media_id !== mediaId));
          }}
        />
      )}
      {disabledReason !== null ? (
        <p className="rounded-xl bg-zinc-100 px-3 py-2.5 text-center text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          {disabledReason}
        </p>
      ) : (
      <div className="flex items-end gap-1.5">
        <ChatComposerShortcuts
          onQuickEvent={onQuickEvent}
          onShareThread={onShareThread}
          manageActivityTo={manageActivityTo}
        />
        <ChatAttachButton
          fileRef={fileRef}
          accept={ACCEPT}
          disabled={busy || pending.length >= MAX_ATTACHMENTS}
          visible={safety.canAttach}
          onPick={pickFiles}
        />
        <TextField
          label="Nhắn tin"
          hideLabel
          pill
          name="chat-draft"
          value={draft}
          onChange={(event) => changeDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
            if (event.key === "Escape") onClearContext();
          }}
          placeholder={
            editing !== null ? "Chỉnh sửa tin nhắn…" : "Nhắn tin…"
          }
          maxLength={2000}
          autoComplete="off"
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="primary"
          size="icon"
          onClick={submit}
          disabled={!canSubmit}
          aria-label={editing !== null ? "Lưu chỉnh sửa" : "Gửi tin nhắn"}
          icon={<FiSend className="h-5 w-5" aria-hidden="true" />}
        />
      </div>
      )}
      {error !== null && (
        <p
          role="alert"
          className="mt-1.5 text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </footer>
  );
}
