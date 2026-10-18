import type { ReactElement } from "react";
import { AvatarStack } from "../../core/components/AvatarStack.tsx";

interface ChatTypingRowProps {
  users: { name: string; avatar_url: string | null }[];
}

// Typing strip under the bubble flow: an avatar stack plus the typing
// cue; names stay reachable through the aria-label.
export function ChatTypingRow({
  users,
}: ChatTypingRowProps): ReactElement | null {
  if (users.length === 0) return null;
  return (
    <p
      className="flex items-center gap-1.5 px-1 pt-1 text-xs text-zinc-500 dark:text-zinc-400"
      aria-live="polite"
      aria-label={`${users.map((u) => u.name).join(", ")} đang nhập`}
    >
      <AvatarStack
        items={users.map((u) => ({ name: u.name, src: u.avatar_url }))}
        max={4}
      />
      <span aria-hidden="true">
        đang nhập<span className="animate-pulse">…</span>
      </span>
    </p>
  );
}
