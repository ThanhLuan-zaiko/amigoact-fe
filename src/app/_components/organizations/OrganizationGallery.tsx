import type { GalleryItem } from "@/lib/organizations";
import { isVideo } from "@/lib/pictureRules";
import { panel, sectionTitle } from "../ui";

const MEDIA =
  "aspect-video w-full rounded-md border border-slate-200 object-cover dark:border-slate-800";

export default function OrganizationGallery({
  items,
}: {
  items: GalleryItem[];
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <section className={`${panel} flex flex-col gap-3 p-4 sm:p-6`}>
      <h2 className={sectionTitle}>Bộ sưu tập</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) =>
          isVideo(item.mime) ? (
            // biome-ignore lint/a11y/useMediaCaption: uploads come without captions.
            <video
              key={item.id}
              src={item.url}
              controls
              preload="metadata"
              className={MEDIA}
            />
          ) : (
            // biome-ignore lint/performance/noImgElement: same-origin proxy paths.
            <img
              key={item.id}
              src={item.url}
              alt=""
              loading="lazy"
              className={MEDIA}
            />
          ),
        )}
      </div>
    </section>
  );
}
