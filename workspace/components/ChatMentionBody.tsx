import type { ReactElement } from "react";
import type { ChatMessage } from "../api.ts";

// Wrap each stored @mention in a bolder span inside the bubble body.
// Mentions are persisted server-side, so the names here are exact.
export function ChatMentionBody({
  message,
  mine,
}: {
  message: ChatMessage;
  mine: boolean;
}): ReactElement {
  const names = message.mentions.map((m) => m.name).filter(Boolean);
  if (names.length === 0) {
    return <p className="whitespace-pre-wrap break-words">{message.body}</p>;
  }
  const pattern = new RegExp(
    `@(${names
      .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})`,
    "g",
  );
  const parts = message.body.split(pattern).map((part, index) =>
    index % 2 === 1 ? (
      <span
        key={index}
        className={`font-semibold underline ${
          mine
            ? "text-white dark:text-zinc-950"
            : "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        @{part}
      </span>
    ) : (
      part
    ),
  );
  return <p className="whitespace-pre-wrap break-words">{parts}</p>;
}
