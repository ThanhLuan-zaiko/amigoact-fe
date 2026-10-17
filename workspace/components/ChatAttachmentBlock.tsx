import type { ReactElement } from "react";
import { FiFile } from "react-icons/fi";
import { apiBaseUrl } from "../../core/api.ts";
import type { ChatAttachment } from "../api.ts";

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${bytes} B`;
}

// Image attachments render inline; video plays in place; the rest is a
// file card. Url is the public /media/ path on the API host.
export function ChatAttachmentBlock({
  item,
  mine,
}: {
  item: ChatAttachment;
  mine: boolean;
}): ReactElement {
  const href = `${apiBaseUrl()}${item.url}`;
  if (item.mime.startsWith("image/")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="-mx-1 mb-1 block"
      >
        <img
          src={href}
          alt={item.name}
          className="max-h-64 w-auto max-w-full rounded-xl object-cover"
          loading="lazy"
        />
      </a>
    );
  }
  if (item.mime.startsWith("video/")) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        src={href}
        controls
        className="-mx-1 mb-1 max-h-64 w-auto max-w-full rounded-xl"
      />
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] ${
        mine
          ? "bg-white/10 text-zinc-100 dark:bg-black/10 dark:text-zinc-800"
          : "bg-white text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
      }`}
    >
      <FiFile className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{item.name}</span>
      <span className="shrink-0 text-[11px] opacity-70">
        {formatSize(item.size_bytes)}
      </span>
    </a>
  );
}
