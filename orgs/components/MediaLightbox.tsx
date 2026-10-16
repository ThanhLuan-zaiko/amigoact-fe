import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { createPortal } from "react-dom";
import { FiChevronLeft, FiChevronRight, FiPlay, FiX } from "react-icons/fi";
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
  const railRef = useRef<HTMLElement | null>(null);
  const downOutside = useRef(false);
  const total = items.length;
  const safe = total === 0 ? 0 : Math.min(index, total - 1);
  const item = total === 0 ? null : items[safe];

  // Mount-only: entrance, scroll lock and focus restore. Index changes
  // must not replay riseIn or the whole viewer flickers on each step.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = rootRef.current;
    if (root !== null) {
      riseIn(root, { y: 8, duration: 180 });
      root.focus({ preventScroll: true });
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      prev?.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
    };
  }, [safe, total, onClose, onIndex]);

  // Keep the active thumbnail visible while stepping with keys/arrows.
  useEffect(() => {
    railRef.current
      ?.querySelector("[data-active='true']")
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [safe]);

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

  const thumbs = total > 1 ? (
    <nav
      ref={railRef}
      aria-label="Chọn media"
      className={
        "flex shrink-0 gap-2 overflow-x-auto p-3 " +
        "sm:w-28 sm:flex-col sm:overflow-x-hidden sm:overflow-y-auto"
      }
    >
      {items.map((m, i) => {
        const active = i === safe;
        return (
          <button
            key={m.url}
            type="button"
            data-active={active}
            aria-label={`Xem media ${i + 1}`}
            aria-current={active}
            onClick={() => onIndex(i)}
            className={
              "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg " +
              "border-2 transition focus-visible:outline-2 " +
              "focus-visible:outline-offset-2 focus-visible:outline-zinc-100 " +
              "sm:aspect-square sm:h-auto sm:w-full " +
              (active
                ? "border-zinc-100"
                : "border-transparent opacity-70 hover:opacity-100")
            }
          >
            {m.kind === "video" ? (
              <>
                <video
                  src={orgMediaUrl(m.url)}
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 right-1 rounded-full bg-zinc-950/60 p-1 text-zinc-100"
                >
                  <FiPlay className="h-3 w-3" />
                </span>
              </>
            ) : (
              <img
                src={orgMediaUrl(m.url)}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </button>
        );
      })}
    </nav>
  ) : null;

  return createPortal(
    <div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex flex-col outline-none sm:flex-row"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-zinc-950/85"
      />
      <div
        className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center p-4"
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
            className="max-h-full max-w-full rounded-lg"
          />
        ) : (
          <img
            key={item.url}
            src={orgMediaUrl(item.url)}
            alt={`${title} ${safe + 1}`}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        )}
      </div>
      {thumbs}
    </div>,
    document.body,
  );
}
