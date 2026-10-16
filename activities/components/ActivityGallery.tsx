import { useState, type ReactElement } from "react";
import { FiFile, FiPlay } from "react-icons/fi";
import { orgMediaUrl, type PublicOrgMedia } from "../../orgs/api.ts";
import { MediaLightbox } from "../../orgs/components/MediaLightbox.tsx";
import { useActivityMedia } from "../media-hooks.ts";

interface ActivityGalleryProps {
  activityId: string;
}

/** Public activity gallery; images/videos open in the shared lightbox. */
export function ActivityGallery({
  activityId,
}: ActivityGalleryProps): ReactElement | null {
  const media = useActivityMedia(activityId);
  const [index, setIndex] = useState<number | null>(null);
  const rows = media.data ?? [];
  const visuals = rows.filter((m) => m.kind !== "document");
  const docs = rows.filter((m) => m.kind === "document");
  if (rows.length === 0) return null;

  const items: PublicOrgMedia[] = visuals.map((m) => ({
    url: m.file_url,
    kind: m.kind === "video" ? "video" : "image",
    mime: m.mime,
  }));

  return (
    <div data-rise>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Thư viện
      </h3>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {visuals.map((m, i) => (
          <li key={m.asset_id}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="block w-full overflow-hidden rounded-xl border border-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-800"
              aria-label={m.caption ?? `Media ${i + 1}`}
            >
              {m.kind === "video" ? (
                <span className="relative block">
                  <video
                    src={orgMediaUrl(m.file_url)}
                    className="aspect-video w-full object-cover"
                    muted
                    preload="metadata"
                  />
                  <FiPlay
                    className="absolute left-1.5 top-1.5 h-4 w-4 text-white"
                    aria-hidden="true"
                  />
                </span>
              ) : (
                <img
                  src={orgMediaUrl(m.file_url)}
                  alt={m.caption ?? m.original_name ?? "Media hoạt động"}
                  className="aspect-video w-full object-cover"
                  loading="lazy"
                />
              )}
            </button>
            {m.caption && (
              <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                {m.caption}
              </p>
            )}
          </li>
        ))}
      </ul>
      {docs.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {docs.map((m) => (
            <li key={m.asset_id}>
              <a
                href={orgMediaUrl(m.file_url)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <FiFile className="h-4 w-4" aria-hidden="true" />
                {m.caption ?? m.original_name ?? "Tài liệu"}
              </a>
            </li>
          ))}
        </ul>
      )}
      {index !== null && (
        <MediaLightbox
          items={items}
          index={index}
          title="Thư viện hoạt động"
          onIndex={setIndex}
          onClose={() => setIndex(null)}
        />
      )}
    </div>
  );
}
