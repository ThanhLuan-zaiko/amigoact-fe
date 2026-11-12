"use client";

import {
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { FiCornerUpLeft, FiPaperclip, FiSend, FiX } from "react-icons/fi";
import {
  type ChatMessage,
  type ChatResult,
  MESSAGE_MAX,
  textLength,
  validateMessage,
} from "@/lib/chat";
import { GALLERY_ACCEPT } from "@/lib/pictureRules";
import { iconButton, primaryButton } from "../ui";
import AttachmentTray from "./AttachmentTray";
import type { Attachments } from "./useAttachments";

type ChatComposerProps = {
  roomName: string;
  replyTo: ChatMessage | null;
  attachments: Attachments;
  onCancelReply: () => void;
  // Called on each keystroke with text; the messenger throttles the signal.
  onTyping: () => void;
  onSend: (body: string, attachmentIds: string[]) => Promise<ChatResult>;
};

// Enter sends and Shift+Enter adds a line. Pictures and videos come from the clip button,
// a paste, or a drop on the conversation. The text and files stay when the server refuses.
export default function ChatComposer({
  roomName,
  replyTo,
  attachments,
  onCancelReply,
  onTyping,
  onSend,
}: ChatComposerProps) {
  const [body, setBody] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const length = textLength(body.trim());
  const { drafts, uploading, failed, ids } = attachments;

  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  function send() {
    let issue = validateMessage(body, drafts.length);
    if (!issue && uploading) {
      issue = "Đợi tải xong ảnh, video rồi gửi.";
    }
    if (!issue && failed) {
      issue = "Bỏ các tệp tải lên lỗi rồi gửi lại.";
    }
    setProblem(issue);
    if (issue || pending) {
      return;
    }
    startTransition(async () => {
      const result = await onSend(body, ids);
      if (result.ok) {
        setBody("");
        setProblem(null);
        attachments.clear();
        inputRef.current?.focus();
      } else {
        setProblem(result.error);
      }
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      send();
    }
  }

  // A pasted screenshot becomes an attachment. Pasted text is left to the textarea.
  function onPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(event.clipboardData.files);
    if (files.length > 0) {
      event.preventDefault();
      attachments.add(files);
    }
  }

  const notice = problem ?? attachments.notice;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 border-t border-slate-200 p-2 sm:p-3 dark:border-slate-800"
    >
      {replyTo ? (
        <div className="flex items-center gap-2 border-l-2 border-teal-700 pl-2 text-sm dark:border-teal-400">
          <FiCornerUpLeft
            aria-hidden="true"
            className="shrink-0 text-teal-700 dark:text-teal-400"
          />
          <p className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {replyTo.author_name}
            </span>
            : {replyTo.body || "Ảnh hoặc video"}
          </p>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Bỏ trả lời"
            title="Bỏ trả lời"
            className={`${iconButton} h-8 w-8 border-transparent`}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <AttachmentTray drafts={drafts} onRemove={attachments.remove} />
      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={GALLERY_ACCEPT}
          aria-label="Chọn ảnh hoặc video"
          onChange={(event) => {
            attachments.add(Array.from(event.currentTarget.files ?? []));
            event.currentTarget.value = "";
          }}
          className="sr-only"
          tabIndex={-1}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Đính kèm ảnh hoặc video"
          title="Đính kèm ảnh hoặc video"
          className={`${iconButton} border-transparent`}
        >
          <FiPaperclip aria-hidden="true" />
        </button>
        <textarea
          ref={inputRef}
          name="chat_body"
          aria-label={`Nhắn vào ${roomName}`}
          placeholder="Viết tin nhắn…"
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            if (event.target.value.trim()) {
              onTyping();
            }
          }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          rows={1}
          aria-invalid={problem ? true : undefined}
          className="field-sizing-content max-h-40 min-h-10 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-teal-700 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-400"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Gửi"
          title="Gửi"
          className={`${primaryButton} w-10 px-0 disabled:opacity-50`}
        >
          <FiSend aria-hidden="true" />
        </button>
      </div>
      {notice || length > MESSAGE_MAX - 200 ? (
        <div className="flex items-center justify-between gap-2 px-1 text-xs">
          <p role="alert" className="text-red-700 dark:text-red-400">
            {notice}
          </p>
          {length > MESSAGE_MAX - 200 ? (
            <span
              className={
                length > MESSAGE_MAX
                  ? "text-red-700 dark:text-red-400"
                  : "text-slate-500 dark:text-slate-400"
              }
            >
              {length}/{MESSAGE_MAX}
            </span>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
