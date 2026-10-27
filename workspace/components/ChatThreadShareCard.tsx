import { useMemo } from "react";
import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiCornerDownRight } from "react-icons/fi";
import { AvatarStack } from "../../core/components/AvatarStack.tsx";
import type { ChatChannel } from "../channel-api.ts";
import { useChannels } from "../channel-hooks.ts";
import { useChatInbox, useChatMessages } from "../hooks.ts";
import { chatRoomHref } from "../inbox-tab.ts";

const SPEAKER_CAP = 3;

function shareBlurb(name: string, channel: ChatChannel | undefined): string {
  const activity = channel?.activity_title?.trim() ?? "";
  if (activity !== "" && activity !== name) return activity;
  const topic = channel?.topic.trim() ?? "";
  if (topic !== "" && topic !== name) return topic;
  return "";
}

// Bubble card for a shared sub-thread. The link opens that thread.
// At most SPEAKER_CAP unique authors, newest first, newest disc on
// the right. The subtitle is the linked event or channel topic.
export function ChatThreadShareCard({
  roomId,
  name,
  mine,
}: {
  roomId: string;
  name: string;
  mine: boolean;
}): ReactElement {
  const inbox = useChatInbox(true);
  const room = inbox.data?.items.find((row) => row.room_id === roomId);
  const channels = useChannels(room?.org_id ?? null, room !== undefined);
  const channel = channels.data?.items.find(
    (row) => row.channel_id === roomId,
  );
  const chat = useChatMessages(roomId);
  const speakers = useMemo(() => {
    const pages = chat.data?.pages ?? [];
    const items = [...pages].reverse().flatMap((page) => page.items);
    const seen = new Set<string>();
    const out: { name: string; src: string | null }[] = [];
    for (let i = items.length - 1; i >= 0; i -= 1) {
      const message = items[i];
      if (message === undefined || seen.has(message.author_id)) continue;
      seen.add(message.author_id);
      out.push({
        name: message.author_name,
        src: message.author_avatar_url,
      });
    }
    return out;
  }, [chat.data]);
  const latest = speakers.slice(0, SPEAKER_CAP);
  const stacked = [...latest].reverse();
  const gone =
    inbox.isSuccess &&
    (room === undefined || room.activity_deleted);
  const blurb = gone ? "Sự kiện đã bị xóa" : shareBlurb(name, channel);
  const names = latest.map((row) => row.name).join(", ");
  const tone = mine
    ? "border-white/30 bg-white/10 text-white hover:bg-white/20 dark:border-zinc-900/20 dark:bg-zinc-900/10 dark:text-zinc-950 dark:hover:bg-zinc-900/20"
    : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-950";
  return (
    <Link
      to={chatRoomHref(roomId, "threads")}
      aria-label={
        names === "" ? `Luồng ${name}` : `Luồng ${name}. ${names}`
      }
      className={`mt-0.5 flex items-center gap-2 rounded-xl border px-2.5 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400 ${tone}`}
    >
      <FiCornerDownRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wide opacity-70">
          Luồng
        </span>
        <span className="block truncate text-sm font-semibold">{name}</span>
        {blurb !== "" && (
          <span className="mt-0.5 block truncate text-[11px] font-medium opacity-70">
            {blurb}
          </span>
        )}
      </span>
      <AvatarStack items={stacked} max={SPEAKER_CAP} />
    </Link>
  );
}
