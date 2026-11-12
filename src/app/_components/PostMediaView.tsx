import type { PostMedia } from "./types";

const MEDIA =
  "w-full rounded-md border border-slate-200 object-cover dark:border-slate-800";

// One attached picture or video. Inline ones keep their own shape,
// gallery tiles are cropped to the same 16:9 box.
export default function PostMediaView({
  item,
  tile = false,
}: {
  item: PostMedia;
  tile?: boolean;
}) {
  const shape = tile ? `${MEDIA} aspect-video` : `${MEDIA} max-h-[70vh]`;
  if (item.isVideo) {
    return (
      // biome-ignore lint/a11y/useMediaCaption: uploads come without captions.
      <video src={item.src} controls preload="metadata" className={shape} />
    );
  }
  // biome-ignore lint/performance/noImgElement: served by the media route.
  return <img src={item.src} alt="" loading="lazy" className={shape} />;
}
