"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { FiCornerUpLeft, FiSend, FiX } from "react-icons/fi";
import {
  type ChatMessage,
  type ChatResult,
  MESSAGE_MAX,
  textLength,
  validateMessage,
} from "@/lib/chat";
import { iconButton, inputField, primaryButton } from "../ui";

type ChatComposerProps = {
  roomName: string;
  replyTo: ChatMessage | null;
  onCancelReply: () => void;
  onSend: (body: string) => Promise<ChatResult>;
};

// Enter sends and Shift+Enter adds a line. The text stays when the server refuses it.
export default function ChatComposer({
  roomName,
  replyTo,
  onCancelReply,
  onSend,
}: ChatComposerProps) {
  const [body, setBody] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const length = textLength(body.trim());

  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  function send() {
    const issue = validateMessage(body);
    setProblem(issue);
    if (issue || pending) {
      return;
    }
    startTransition(async () => {
      const result = await onSend(body);
      if (result.ok) {
        setBody("");
        setProblem(null);
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

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 border-t border-slate-200 p-3 sm:px-4 dark:border-slate-800"
    >
      {replyTo ? (
        <div className="flex items-center gap-2 border-l-2 border-teal-700 pl-2 text-sm dark:border-teal-400">
          <FiCornerUpLeft aria-hidden="true" className="shrink-0" />
          <p className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-400">
            Trả lời <span className="font-semibold">{replyTo.author_name}</span>
            : {replyTo.body}
          </p>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Bỏ trả lời"
            title="Bỏ trả lời"
            className={iconButton}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          name="chat_body"
          aria-label={`Nhắn vào ${roomName}`}
          placeholder={`Nhắn vào ${roomName}`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          aria-invalid={problem ? true : undefined}
          className={`${inputField} max-h-40 min-h-10 resize-none`}
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
      <div className="flex items-center justify-between gap-2 text-xs">
        <p role="alert" className="text-red-700 dark:text-red-400">
          {problem}
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
    </form>
  );
}
