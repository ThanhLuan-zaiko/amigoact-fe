import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { createPortal } from "react-dom";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { orgMediaUrl, type OrgMedia } from "../api.ts";
import { MEDIA_ROLE_LABELS } from "../messages.tsx";

const MAX_THUMBS = 4;

interface OrgMediaStripProps {
  media: OrgMedia[];
  onBrowse: () => void;
}

const THUMB_BUTTON =
  "relative h-16 w-24 overflow-hidden rounded-lg border border-zinc-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 " +
  "dark:border-zinc-800 dark:focus-visible:outline-zinc-400";

export function OrgMediaStrip({ media, onBrowse }: OrgMediaStripProps): ReactElement | null {
  const images = media.filter((item) => item.kind === "image");
  const [viewer, setViewer] = useState<number | null>(null);
  const open = viewer !== null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const shown = images.slice(0, MAX_THUMBS);
  const rest = media.length - shown.length;

  useEffect(() => {
    if (!open) return;
    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    // Lock background scroll while the viewer is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setViewer(null);
      } else if (event.key === "ArrowLeft") {
        setViewer((v) => (v === null ? v : (v - 1 + images.length) % images.length));
      } else if (event.key === "ArrowRight") {
        setViewer((v) => (v === null ? v : (v + 1) % images.length));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, images.length]);

  useEffect(() => {
    if (open) return;
    restoreRef.current?.focus();
    restoreRef.current = null;
  }, [open]);

  if (images.length === 0) return null;

  function step(delta: number): void {
    setViewer((v) => (v === null ? v : (v + delta + images.length) % images.length));
  }

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2" aria-label="Xem nhanh ảnh">
        {shown.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setViewer(index)}
            aria-label={`Xem ảnh ${index + 1}`}
            className={THUMB_BUTTON}
          >
            <img
              src={orgMediaUrl(item.file_url)}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
            {item.role !== "gallery" && (
              <span className="absolute bottom-0.5 left-0.5 rounded-md bg-zinc-950/80 px-1 py-0.5 text-xs text-zinc-100">
                {MEDIA_ROLE_LABELS[item.role]}
              </span>
            )}
          </button>
        ))}
        {rest > 0 && (
          <button
            type="button"
            onClick={onBrowse}
            className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
          >
            {`+${rest} tệp`}
          </button>
        )}
      </div>
      {open && images[viewer] && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh"
          className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 p-4"
          onClick={() => setViewer(null)}
        >
          {/* Wrapper keeps wide/tall photos inside the viewport on small screens. */}
          <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-center justify-center">
            <figure className="flex min-h-0 min-w-0 items-center justify-center">
              <img
                src={orgMediaUrl(images[viewer].file_url)}
                alt="Ảnh của tổ chức"
                onClick={(event) => event.stopPropagation()}
                className="h-auto max-h-[68vh] w-auto max-w-full rounded-xl object-contain sm:max-h-[76vh]"
              />
            </figure>
          </div>
          <div className="absolute right-4 top-4">
            <Button
              ref={closeRef}
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setViewer(null)}
              aria-label="Đóng"
              icon={<FiX className="h-4 w-4" aria-hidden="true" />}
            />
          </div>
          {images.length > 1 && (
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Ảnh trước"
                onClick={(event) => {
                  event.stopPropagation();
                  step(-1);
                }}
                icon={<FiChevronLeft className="h-4 w-4" aria-hidden="true" />}
              />
              <span className="rounded-full bg-zinc-950/80 px-3 py-1 text-xs text-zinc-100">
                {`${viewer + 1} / ${images.length}`}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Ảnh sau"
                onClick={(event) => {
                  event.stopPropagation();
                  step(1);
                }}
                icon={<FiChevronRight className="h-4 w-4" aria-hidden="true" />}
              />
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
