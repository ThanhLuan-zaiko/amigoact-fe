import type { ReactElement } from "react";
import { FiImage } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { EmptyState } from "../../core/components/Feedback.tsx";
import { orgMediaUrl, type PublicOrgDetail } from "../api.ts";

interface OrgGalleryCardProps {
  org: PublicOrgDetail;
}

const MAX_TILES = 6;

export function OrgGalleryCard({ org }: OrgGalleryCardProps): ReactElement {
  const shown = org.gallery.slice(0, MAX_TILES);
  const overflow = org.gallery.length - shown.length;
  return (
    <Section>
      <div data-rise>
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <FiImage
            className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
            aria-hidden="true"
          />
          Hình ảnh hoạt động
        </h2>
        {shown.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {shown.map((url, index) => (
              <div key={url} className="relative">
                <img
                  src={orgMediaUrl(url)}
                  alt={`${org.name} ${index + 1}`}
                  loading="lazy"
                  className="aspect-square w-full rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
                />
                {index === MAX_TILES - 1 && overflow > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-950/60 text-sm font-semibold text-zinc-100">
                    {`+${overflow}`}
                  </span>
                )}
              </div>
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
    </Section>
  );
}
