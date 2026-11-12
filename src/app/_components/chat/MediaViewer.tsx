"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiDownload, FiX } from "react-icons/fi";
import type { ChatAttachment } from "@/lib/chat";
import { fileSize } from "@/lib/messenger";

type MediaViewerProps = {
  files: ChatAttachment[];
  start: number;
  caption: string;
  onClose: () => void;
};

const control =
  "inline-flex h-11 w-11 items-center justify-center rounded-full text-xl text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white disabled:opacity-30";

// A full-screen viewer for the pictures and videos of one message. Arrow keys move,
// Escape closes (the native dialog handles Escape and keeps focus inside).
export default function MediaViewer({
  files,
  start,
  caption,
  onClose,
}: MediaViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(start);
  const file = files[index];
  const many = files.length > 1;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function move(step: number) {
    setIndex((current) => (current + step + files.length) % files.length);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowRight" && many) {
      move(1);
    } else if (event.key === "ArrowLeft" && many) {
      move(-1);
    }
  }

  if (!file) {
    return null;
  }
  return (
    <dialog
      ref={dialogRef}
      aria-label={file.kind === "video" ? "Xem video" : "Xem ảnh"}
      onClose={onClose}
      onKeyDown={onKeyDown}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-slate-950/95 p-0 text-white backdrop:bg-slate-950/80 open:flex open:flex-col"
    >
      <div className="flex items-center gap-2 p-2 sm:p-3">
        <p className="min-w-0 flex-1 truncate px-2 text-sm text-slate-300">
          {many ? `${index + 1}/${files.length} · ` : ""}
          {file.name ?? (file.kind === "video" ? "Video" : "Ảnh")} ·{" "}
          {fileSize(file.size_bytes)}
        </p>
        <a
          href={file.url}
          download={file.name ?? true}
          aria-label="Tải xuống"
          title="Tải xuống"
          className={control}
        >
          <FiDownload aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          title="Đóng"
          className={control}
        >
          <FiX aria-hidden="true" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
        {file.kind === "video" ? (
          // biome-ignore lint/a11y/useMediaCaption: uploads come without captions.
          <video
            key={file.id}
            src={file.url}
            controls
            autoPlay
            playsInline
            className="max-h-full max-w-full"
          />
        ) : (
          // biome-ignore lint/performance/noImgElement: served by the media route with the viewer's cookie.
          <img
            key={file.id}
            src={file.url}
            alt={caption}
            className="max-h-full max-w-full object-contain"
          />
        )}
        {many ? (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Tệp trước"
              title="Tệp trước"
              className={`${control} absolute top-1/2 left-2 -translate-y-1/2`}
            >
              <FiChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Tệp sau"
              title="Tệp sau"
              className={`${control} absolute top-1/2 right-2 -translate-y-1/2`}
            >
              <FiChevronRight aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>
      {caption ? (
        <p className="max-h-24 overflow-y-auto p-4 text-center text-sm whitespace-pre-wrap text-slate-200">
          {caption}
        </p>
      ) : (
        <div className="h-4" />
      )}
    </dialog>
  );
}
