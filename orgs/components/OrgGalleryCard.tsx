import { useState } from "react";
import type { ReactElement } from "react";
import { FiImage, FiPlay } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { EmptyState } from "../../core/components/Feedback.tsx";
import { orgMediaUrl, type PublicOrgDetail } from "../api.ts";
import { usePublicOrgMedia } from "../hooks.ts";
import { OrgMediaViewer } from "./MediaViewers.tsx";
import { mosaicItems } from "../utils.ts";

interface OrgGalleryCardProps {
  org: PublicOrgDetail;
}

const MAX_TILES = 6;

export function OrgGalleryCard({ org }: OrgGalleryCardProps): ReactElement {
  const [viewer, setViewer] = useState<number | null>(null);
  const media = usePublicOrgMedia(org.slug);
  // Typed endpoint list (videos included) once loaded; the profile's
  // image-only gallery strings fill the grid while the query is in flight.
  const items = mosaicItems({
    cover_url: org.cover_url,
    media:
      media.data?.items ??
      org.gallery.map((url) => ({
        url,
        kind: "image" as const,
        mime: "image/*",
      })),
  });
  const shown = items.slice(0, MAX_TILES);
  const overflow = items.length - shown.length;
  return (
    <Section>
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <FiImage
            className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
            aria-hidden="true"
          />
          Hình ảnh hoạt động
        </h2>
        {shown.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {shown.map((item, index) => (
              <button
                type="button"
                key={item.url}
                aria-label={`Xem media ${index + 1} của ${org.name}`}
                onClick={() => setViewer(index)}
                className="relative cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-500"
              >
                {item.kind === "video" ? (
                  <span className="relative block">
                    <video
                      src={orgMediaUrl(item.url)}
                      muted
                      playsInline
                      preload="metadata"
                      className="aspect-square w-full rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950/60 text-zinc-100">
                        <FiPlay className="h-4 w-4" />
                      </span>
                    </span>
                    <span className="sr-only">Video</span>
                  </span>
                ) : (
                  <img
                    src={orgMediaUrl(item.url)}
                    alt={`${org.name} ${index + 1}`}
                    loading="lazy"
                    className="aspect-square w-full rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
                  />
                )}
                {index === MAX_TILES - 1 && overflow > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-950/60 text-sm font-semibold text-zinc-100">
                    {`+${overflow}`}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3">
            <EmptyState
              title="Chưa có hình ảnh"
              message="Tổ chức chưa đăng ảnh hoạt động nào lên thư viện công khai."
            />
          </div>
        )}
      </div>
      {viewer !== null && (
        <OrgMediaViewer
          slug={org.slug}
          fallback={items}
          index={viewer}
          title={org.name}
          onClose={() => setViewer(null)}
          onIndex={setViewer}
        />
      )}
    </Section>
  );
}
