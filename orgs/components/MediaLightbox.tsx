import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { createPortal } from "react-dom";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { riseIn } from "../../core/motion.ts";
import { orgMediaUrl, type PublicOrgMedia } from "../api.ts";

interface MediaLightboxProps {
  items: PublicOrgMedia[];
  index: number;
  title: string;
  onClose: () => void;
  onIndex: (index: number) => void;
}

// Fullscreen viewer for media hidden behind the mosaic's "+N" overflow:
// image or playable video, prev/next, counter, Esc/backdrop/X to close.
// Follows Modal's portal + focus + scroll-lock + backdrop conventions;
// the row's <Link> never sees the tile click (mosaic stops propagation).
export function MediaLightbox({
  items,
  index,
  title,
  onClose,
  onIndex,
}: MediaLightboxProps): ReactElement | null {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const downOutside = useRef(false);
  const total = items.length;
  const safe = total === 0 ? 0 : Math.min(index, total - 1);
  const item = total === 0 ? null : items[safe];

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = rootRef.current;
    if (root !== null) {
      riseIn(root, { y: 8, duration: 180 });
      root.focus({ preventScroll: true });
    }
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft" && safe > 0) onIndex(safe - 1);
      else if (event.key === "ArrowRight" && safe < total - 1) {
        onIndex(safe + 1);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus({ preventScroll: true });
    };
  }, [safe, total, onClose, onIndex]);

  if (item === null) return null;

  const nav = (
    label: string,
    icon: ReactElement,
    target: number,
    side: string,
    enabled: boolean,
  ): ReactElement => (
    <button
      type="button"
      aria-label={label}
      disabled={!enabled}
      onClick={() => onIndex(target)}
      className={
        `absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center ` +
        `justify-center rounded-full bg-zinc-950/60 text-zinc-100 ` +
        `transition hover:bg-zinc-950/80 disabled:cursor-default ` +
        `disabled:opacity-30 ${side}`
      }
    >
      {icon}
    </button>
  );

  return createPortal(
    <div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center outline-none"
      // Same press-and-release-outside rule as Modal: a drag starting on
      // the media and releasing on the backdrop must not close it.
      onMouseDown={(event) => {
        downOutside.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (downOutside.current && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-zinc-950/85"
      />
      <div className="absolute left-4 top-4 rounded-full bg-zinc-950/60 px-3 py-1.5 text-sm font-medium text-zinc-100">
        {`${safe + 1} / ${total}`}
      </div>
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-950/60 text-zinc-100 transition hover:bg-zinc-950/80"
      >
        <FiX className="h-5 w-5" aria-hidden="true" />
      </button>
      {total > 1 &&
        nav(
          "Xem media trước",
          <FiChevronLeft className="h-6 w-6" aria-hidden="true" />,
          safe - 1,
          "left-3",
          safe > 0,
        )}
      {total > 1 &&
        nav(
          "Xem media tiếp theo",
          <FiChevronRight className="h-6 w-6" aria-hidden="true" />,
          safe + 1,
          "right-3",
          safe < total - 1,
        )}
      {item.kind === "video" ? (
        <video
          key={item.url}
          src={orgMediaUrl(item.url)}
          controls
          autoPlay
          playsInline
          className="max-h-[85vh] max-w-full rounded-lg"
        />
      ) : (
        <img
          key={item.url}
          src={orgMediaUrl(item.url)}
          alt={`${title} ${safe + 1}`}
          className="max-h-[85vh] max-w-full rounded-lg object-contain"
        />
      )}
    </div>,
    document.body,
  );
}
