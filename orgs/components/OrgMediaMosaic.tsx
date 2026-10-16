import type { MouseEvent, ReactElement, ReactNode } from "react";
import { FiPlay } from "react-icons/fi";
import { orgMediaUrl, type PublicOrg, type PublicOrgMedia } from "../api.ts";
import { mosaicItems } from "../utils.ts";

interface OrgMediaMosaicProps {
  org: Pick<PublicOrg, "name" | "cover_url" | "media" | "media_count">;
  /** When set, tiles become buttons opening the lightbox at that index. */
  onOpen?: (index: number) => void;
}

const MAX_TILES = 4;

interface TileProps {
  item: PublicOrgMedia;
  name: string;
  index: number;
  className: string;
  onOpen?: (index: number) => void;
  children?: ReactNode;
}

function Tile({
  item,
  name,
  index,
  className,
  onOpen,
  children,
}: TileProps): ReactElement {
  const body = (
    <>
      {item.kind === "video" ? (
        <>
          <video
            src={orgMediaUrl(item.url)}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950/60 text-zinc-100">
              <FiPlay className="h-5 w-5" />
            </span>
          </span>
          <span className="sr-only">Video</span>
        </>
      ) : (
        <img
          src={orgMediaUrl(item.url)}
          alt={`${name} ${index + 1}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {children}
    </>
  );
  const base =
    `relative block min-w-0 overflow-hidden bg-zinc-100 ` +
    `dark:bg-zinc-900 ${className}`;
  if (onOpen === undefined) {
    return <div className={base}>{body}</div>;
  }
  return (
    <button
      type="button"
      aria-label={`Xem media ${index + 1} của ${name}`}
      onClick={(event: MouseEvent) => {
        // The whole feed row is a <Link>; opening the viewer must not
        // navigate. preventDefault cancels the link activation, and
        // stopPropagation keeps parent click handlers out of it.
        event.preventDefault();
        event.stopPropagation();
        onOpen(index);
      }}
      className={`${base} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-500`}
    >
      {body}
    </button>
  );
}

// X-style media strip inside the org card: the org's cover leads, then the
// newest gallery images and videos. Tiles open MediaLightbox when onOpen is
// set; videos get a play badge and the last tile carries a "+N" overlay
// when the library holds more.
export function OrgMediaMosaic({
  org,
  onOpen,
}: OrgMediaMosaicProps): ReactElement | null {
  const items = mosaicItems(org);
  if (items.length === 0) {
    return null;
  }

  const shown = items.slice(0, MAX_TILES);
  const overflow = Math.max(org.media_count, items.length) - shown.length;

  function tileClass(index: number): string {
    if (shown.length === 2) return "aspect-square";
    if (shown.length === 3) {
      return index === 0 ? "row-span-2" : "aspect-[2/1]";
    }
    return "aspect-video";
  }

  function overlay(index: number): ReactNode {
    return index === shown.length - 1 && overflow > 0 ? (
      <span className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 text-lg font-semibold text-zinc-100">
        {`+${overflow}`}
      </span>
    ) : null;
  }

  return (
    <div
      className={
        "mt-2 overflow-hidden rounded-2xl border border-zinc-200 " +
        `bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 ` +
        (shown.length === 1 ? "" : "grid grid-cols-2 gap-0.5")
      }
    >
      {shown.map((item, index) => (
        <Tile
          key={item.url}
          item={item}
          name={org.name}
          index={index}
          className={tileClass(index)}
          onOpen={onOpen}
        >
          {overlay(index)}
        </Tile>
      ))}
    </div>
  );
}
