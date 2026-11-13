import type { PostMedia } from "./types";

const MEDIA =
  "w-full rounded-md border border-slate-200 object-cover dark:border-slate-800";

// One attached picture or video. Inline ones keep their own shape. Gallery tiles are
// cropped to a 16:9 box, and the cover in a feed card to a shorter 2:1 box, so a list
// of posts does not turn into a list of pictures.
export default function PostMediaView({
  item,
  tile = false,
  wide = false,
}: {
  item: PostMedia;
  tile?: boolean;
  wide?: boolean;
}) {
  // A wide feed cover is also capped at 14rem, so a wide column does not grow it.
  const ratio = wide ? "aspect-[2/1] max-h-56" : "aspect-video";
  const shape = tile ? `${MEDIA} ${ratio}` : `${MEDIA} max-h-[70vh]`;
  if (item.isVideo) {
    return (
      // biome-ignore lint/a11y/useMediaCaption: uploads come without captions.
      <video src={item.src} controls preload="metadata" className={shape} />
    );
  }
  // biome-ignore lint/performance/noImgElement: served by the media route.
  return <img src={item.src} alt="" loading="lazy" className={shape} />;
}
