import { FiPlay } from "react-icons/fi";
import type { ChatAttachment } from "@/lib/chat";
import { albumTiles } from "@/lib/messenger";

type MediaAlbumProps = {
  files: ChatAttachment[];
  onOpen: (index: number) => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:focus-visible:outline-teal-400";

function Thumb({ file, fill }: { file: ChatAttachment; fill: boolean }) {
  const size = fill
    ? "h-full w-full object-cover"
    : "max-h-80 w-full object-cover";
  if (file.kind === "video") {
    return (
      <>
        <video
          src={`${file.url}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          className={`${size} bg-slate-900`}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-950/60 text-xl text-white"
        >
          <FiPlay className="translate-x-0.5" />
        </span>
      </>
    );
  }
  return (
    // biome-ignore lint/performance/noImgElement: served by the media route with the viewer's cookie.
    <img src={file.url} alt="" loading="lazy" className={size} />
  );
}

// Pictures and videos of one message. One file shows on its own, more form a grid of up to
// four tiles; every tile opens the viewer at that file.
export default function MediaAlbum({ files, onOpen }: MediaAlbumProps) {
  if (files.length === 0) {
    return null;
  }
  if (files.length === 1) {
    const [file] = files;
    return (
      <button
        type="button"
        onClick={() => onOpen(0)}
        aria-label={file.kind === "video" ? "Xem video" : "Xem ảnh"}
        className={`relative block w-full overflow-hidden rounded-lg ${focusRing}`}
      >
        <Thumb file={file} fill={false} />
      </button>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-lg">
      {albumTiles(files).map(({ file, index, wide, more }) => (
        <button
          key={file.id}
          type="button"
          onClick={() => onOpen(index)}
          aria-label={`${file.kind === "video" ? "Xem video" : "Xem ảnh"} ${index + 1}/${files.length}`}
          className={`relative block overflow-hidden ${wide ? "col-span-2 aspect-video" : "aspect-square"} ${focusRing}`}
        >
          <Thumb file={file} fill />
          {more > 0 ? (
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-2xl font-bold text-white">
              +{more}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
