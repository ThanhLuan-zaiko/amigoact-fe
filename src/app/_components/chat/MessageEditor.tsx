"use client";

import { type KeyboardEvent, useState, useTransition } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { validateMessage } from "@/lib/chat";
import { iconButton, inputField } from "../ui";

type MessageEditorProps = {
  initial: string;
  onSave: (body: string) => Promise<boolean>;
  onCancel: () => void;
};

// Edits a message in place. Enter saves, Shift+Enter adds a line, Escape cancels.
export default function MessageEditor({
  initial,
  onSave,
  onCancel,
}: MessageEditorProps) {
  const [body, setBody] = useState(initial);
  const [problem, setProblem] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    const issue = validateMessage(body);
    setProblem(issue);
    if (issue) {
      return;
    }
    if (body.trim() === initial.trim()) {
      onCancel();
      return;
    }
    startTransition(async () => {
      await onSave(body);
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    } else if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      save();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        aria-label="Sửa tin nhắn"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={onKeyDown}
        rows={2}
        // biome-ignore lint/a11y/noAutofocus: the editor opens because the user asked to edit.
        autoFocus
        aria-invalid={problem ? true : undefined}
        className={`${inputField} resize-y`}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          aria-label="Lưu"
          title="Lưu"
          className={`${iconButton} disabled:opacity-50`}
        >
          <FiCheck aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Hủy sửa"
          title="Hủy sửa"
          className={iconButton}
        >
          <FiX aria-hidden="true" />
        </button>
        {problem ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {problem}
          </p>
        ) : null}
      </div>
    </div>
  );
}
