import { focusClass } from "@/lib/focus";
import type { GalleryItem } from "@/lib/organizations";
import { isVideo } from "@/lib/pictureRules";
import { sizedSrc, srcSetFor } from "@/lib/pictureSizes";
import { panel, sectionTitle } from "../ui";
import VideoPlayer from "../VideoPlayer";

const MEDIA =
  "block aspect-square w-full rounded-lg border border-slate-200 bg-slate-100 object-cover first:col-span-2 first:aspect-video dark:border-slate-800 dark:bg-slate-900";

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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
        {items.map((item) =>
          isVideo(item.mime) ? (
            <VideoPlayer
              key={item.id}
              id={item.id}
              info={item.video}
              className={`${MEDIA} bg-slate-950`}
            />
          ) : (
            // biome-ignore lint/performance/noImgElement: same-origin proxy paths.
            <img
              key={item.id}
              src={sizedSrc(item.url, 640)}
              srcSet={srcSetFor(item.url)}
              sizes="(min-width: 1280px) 480px, (min-width: 640px) 33vw, 50vw"
              alt=""
              loading="lazy"
              className={`${MEDIA} ${focusClass(item.focus)}`}
            />
          ),
        )}
      </div>
    </section>
  );
}
