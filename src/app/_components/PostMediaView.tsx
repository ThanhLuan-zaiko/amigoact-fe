import { focusClass } from "@/lib/focus";
import Picture from "./Picture";
import type { PostMedia } from "./types";
import VideoPlayer from "./VideoPlayer";

const FRAME =
  "rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900";

// The post column is the full phone width, and about half the 1400px container on
// wide screens, so the browser never needs more than about 900 CSS pixels.
const POST_SIZES = "(min-width: 1280px) 860px, (min-width: 768px) 70vw, 100vw";
const TILE_SIZES = "(min-width: 1280px) 430px, (min-width: 768px) 35vw, 50vw";

// One attached picture or video. Tiles (gallery and feed cover) fill a 16:9 box and
// crop around the upper middle, where faces usually are. Inline media keep their own
// shape: never cropped or stretched, only scaled down to fit the column and screen.
export default function PostMediaView({
  item,
  tile = false,
  cover = false,
}: {
  item: PostMedia;
  tile?: boolean;
  // A feed cover is as wide as the post, so it asks for a larger copy than a tile.
  cover?: boolean;
}) {
  const shape = tile
    ? `block aspect-video h-full w-full object-cover ${focusClass(item.focus)}`
    : "mx-auto block h-auto max-h-[80vh] w-auto max-w-full object-contain";
  if (item.isVideo) {
    return (
      <VideoPlayer
        id={item.id}
        info={item.video}
        className={`${FRAME} ${shape} bg-slate-950`}
      />
    );
  }
  return (
    <Picture
      src={item.src}
      sizes={tile && !cover ? TILE_SIZES : POST_SIZES}
      width={item.width}
      height={item.height}
      placeholder={item.placeholder}
      // With a placeholder the frame draws the border, otherwise the picture does.
      className={item.placeholder && tile ? shape : `${FRAME} ${shape}`}
      frameClassName={
        tile
          ? `${FRAME} aspect-video w-full`
          : "mx-auto w-fit max-w-full rounded-lg"
      }
    />
  );
}
