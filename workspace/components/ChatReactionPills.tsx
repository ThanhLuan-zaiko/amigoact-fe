import type { ReactElement } from "react";
import type { ChatReaction } from "../api.ts";

// Aggregated emoji chips under a bubble; clicking toggles your own pick.
export function ChatReactionPills({
  reactions,
  mine,
  onToggle,
}: {
  reactions: ChatReaction[];
  mine: boolean;
  onToggle: (emoji: string) => void;
}): ReactElement | null {
  if (reactions.length === 0) return null;
  return (
    <span className="mt-1 flex flex-wrap gap-1">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          type="button"
          onClick={() => onToggle(reaction.emoji)}
          aria-label={`${reaction.emoji} ${reaction.count}`}
          className={`rounded-full border px-1.5 py-0.5 text-[11px] leading-none ${
            reaction.mine
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
              : mine
                ? "border-zinc-500 text-zinc-200 dark:text-zinc-700"
                : "border-zinc-300 text-zinc-600 dark:border-zinc-600 dark:text-zinc-300"
          }`}
        >
          {reaction.emoji} {reaction.count}
        </button>
      ))}
    </span>
  );
}
