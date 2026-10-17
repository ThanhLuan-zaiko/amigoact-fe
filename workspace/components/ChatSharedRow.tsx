import type { ReactElement } from "react";
import {
  FiExternalLink,
  FiFile,
  FiLink,
  FiTrash2,
} from "react-icons/fi";
import { apiBaseUrl } from "../../core/api.ts";
import { Avatar } from "../../core/components/Avatar.tsx";
import { formatInboxTime } from "../messages.tsx";
import type { SharedMediaItem } from "../api.ts";

// Attachment rows carry the public /media/ path on the API host; link
// rows already hold an absolute external URL.
function sharedItemHref(item: SharedMediaItem): string {
  return item.url.startsWith("/") ? `${apiBaseUrl()}${item.url}` : item.url;
}

function formatSize(bytes: number): string {
  if (bytes <= 0) return "";
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Kind-specific lead visual: thumbnails for media, glyph for file/link.
function ItemVisual({ item }: { item: SharedMediaItem }): ReactElement {
  const glyph =
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg " +
    "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
  const thumb =
    "h-12 w-12 shrink-0 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800";
  if (item.kind === "image") {
    return (
      <img
        src={sharedItemHref(item)}
        alt={item.name}
        loading="lazy"
        className={thumb}
      />
    );
  }
  if (item.kind === "video") {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        src={sharedItemHref(item)}
        preload="metadata"
        muted
        className={`${thumb} bg-black`}
      />
    );
  }
  return (
    <span className={glyph}>
      {item.kind === "link" ? (
        <FiLink className="h-5 w-5" aria-hidden="true" />
      ) : (
        <FiFile className="h-5 w-5" aria-hidden="true" />
      )}
    </span>
  );
}

function ItemTitle({ item }: { item: SharedMediaItem }): ReactElement {
  const base = "truncate text-sm font-medium text-zinc-800 dark:text-zinc-200";
  if (item.kind === "link") {
    return <p className={`${base} break-all`}>{item.url}</p>;
  }
  const size = formatSize(item.size_bytes);
  return (
    <p className={base}>
      {item.name || "Tệp đính kèm"}
      {size !== "" && (
        <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
          {" "}
          · {size}
        </span>
      )}
    </p>
  );
}

interface ChatSharedRowProps {
  item: SharedMediaItem;
  // Deleting removes the source message; visible to its author or
  // chat:manage viewers.
  canDelete: boolean;
  deleting: boolean;
  onDelete: (messageId: string) => void;
}

export function ChatSharedRow({
  item,
  canDelete,
  deleting,
  onDelete,
}: ChatSharedRowProps): ReactElement {
  return (
    <li className="flex items-center gap-2.5 py-2.5">
      <a
        href={sharedItemHref(item)}
        target="_blank"
        rel="noreferrer"
        aria-label="Mở nội dung đã chia sẻ"
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400"
      >
        <ItemVisual item={item} />
        <span className="min-w-0 flex-1">
          <ItemTitle item={item} />
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Avatar
              name={item.author_name}
              src={item.author_avatar_url}
              size="sm"
            />
            <span className="truncate">
              {item.author_name} · {formatInboxTime(item.created_at)}
            </span>
          </span>
        </span>
        <FiExternalLink
          className="h-4 w-4 shrink-0 text-zinc-400"
          aria-hidden="true"
        />
      </a>
      {canDelete && (
        <button
          type="button"
          aria-label="Xóa nội dung đã chia sẻ"
          disabled={deleting}
          onClick={() => onDelete(item.message_id)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-red-400 dark:focus-visible:outline-zinc-400"
        >
          <FiTrash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </li>
  );
}
