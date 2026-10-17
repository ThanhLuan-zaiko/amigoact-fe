import type { ReactElement } from "react";
import { FiPlay, FiTrash2 } from "react-icons/fi";
import { apiBaseUrl } from "../../core/api.ts";
import { formatInboxTime } from "../messages.tsx";
import type { SharedMediaItem } from "../api.ts";

// Attachment rows carry the public /media/ path on the API host.
function tileHref(item: SharedMediaItem): string {
  return item.url.startsWith("/") ? `${apiBaseUrl()}${item.url}` : item.url;
}

interface ChatMediaGridProps {
  items: SharedMediaItem[];
  selfId: string | undefined;
  // chat:manage viewers may remove other members' shared items too.
  canManage: boolean;
  deleting: boolean;
  onDelete: (messageId: string) => void;
}

// Image/video tabs render as a clean thumbnail wall: author/time stay
// on the tooltip, the sender filter above does the narrowing.
export function ChatMediaGrid({
  items,
  selfId,
  canManage,
  deleting,
  onDelete,
}: ChatMediaGridProps): ReactElement {
  return (
    <ul className="grid grid-cols-3 gap-1.5">
      {items.map((item) => {
        const href = tileHref(item);
        const caption = `${item.author_name} · ${formatInboxTime(
          item.created_at,
        )}`;
        const canDelete = item.author_id === selfId || canManage;
        return (
          <li
            key={`${item.message_id}-${item.url}`}
            className="group relative"
          >
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              title={caption}
              aria-label={caption}
              className="block aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-visible:outline-zinc-400"
            >
              {item.kind === "video" ? (
                <>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    src={href}
                    preload="metadata"
                    muted
                    className="h-full w-full object-cover"
                  />
                  <span
                    className="absolute inset-0 flex items-center justify-center bg-black/20 text-white"
                    aria-hidden="true"
                  >
                    <FiPlay className="h-6 w-6" />
                  </span>
                </>
              ) : (
                <img
                  src={href}
                  alt={item.name || caption}
                  loading="lazy"
                  className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                />
              )}
            </a>
            {canDelete && (
              <button
                type="button"
                aria-label="Xóa nội dung đã chia sẻ"
                disabled={deleting}
                onClick={() => onDelete(item.message_id)}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-zinc-500 opacity-60 transition-opacity hover:text-red-600 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 group-hover:opacity-100 disabled:opacity-50 dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:text-red-400 dark:focus-visible:outline-zinc-400"
              >
                <FiTrash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
