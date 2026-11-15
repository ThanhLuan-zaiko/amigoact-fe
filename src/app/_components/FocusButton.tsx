"use client";

import { useRouter } from "next/navigation";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { FiCheck, FiCrosshair, FiX } from "react-icons/fi";
import {
  DEFAULT_FOCUS,
  type Focus,
  focusClass,
  markerClass,
  pointFromClick,
} from "@/lib/focus";
import { sizedSrc } from "@/lib/pictureSizes";
import { type FocusResult, setMediaFocus } from "../_actions/media";
import {
  iconButton,
  mutedText,
  primaryButton,
  secondaryButton,
  sectionTitle,
} from "./ui";

const STEP = 0.05;
const KEY_MOVES: Record<string, [number, number]> = {
  ArrowLeft: [-STEP, 0],
  ArrowRight: [STEP, 0],
  ArrowUp: [0, -STEP],
  ArrowDown: [0, STEP],
};
const PREVIEW =
  "rounded-md border border-slate-200 object-cover dark:border-slate-800";

function clamp(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 1000) / 1000;
}

// An icon button on an uploaded picture that opens a dialog to choose its focal
// point: the spot every crop (feed cover, gallery tile, banner) keeps in view.
// The uploader taps the picture or moves the marker with the arrow keys, and sees
// two crops update before saving.
export default function FocusButton({
  assetId,
  src,
  initial,
  onSaved,
}: {
  assetId: string;
  src: string;
  initial?: Focus | null;
  onSaved?: (focus: Focus) => void;
}) {
  const router = useRouter();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<Focus | null>(initial ?? null);
  const [point, setPoint] = useState<Focus>(initial ?? DEFAULT_FOCUS);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog?.open) {
      dialog.close();
    }
  }, [open]);

  function start() {
    setPoint(saved ?? DEFAULT_FOCUS);
    setError("");
    setOpen(true);
  }

  function onKey(event: KeyboardEvent<HTMLButtonElement>) {
    const move = KEY_MOVES[event.key];
    if (move) {
      event.preventDefault();
      setPoint({ x: clamp(point.x + move[0]), y: clamp(point.y + move[1]) });
    }
  }

  async function save() {
    setPending(true);
    let result: FocusResult;
    try {
      result = await setMediaFocus(assetId, point);
    } catch {
      result = { ok: false, message: "Mất kết nối. Vui lòng thử lại." };
    }
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSaved(result.focus);
    onSaved?.(result.focus);
    setOpen(false);
    // Server-rendered crops on this page (gallery, banner) pick up the new point.
    router.refresh();
  }

  const picture = sizedSrc(src, 1080);
  return (
    <>
      <button
        type="button"
        onClick={start}
        aria-label="Chọn điểm lấy nét"
        title="Chọn điểm lấy nét"
        className={iconButton}
      >
        <FiCrosshair aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-lg border border-slate-200 bg-white p-0 text-slate-900 shadow-sm backdrop:bg-slate-900/50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
      >
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <h2
            id={titleId}
            className={`${sectionTitle} flex items-center gap-2`}
          >
            <FiCrosshair aria-hidden="true" />
            Điểm lấy nét
          </h2>
          <p className={mutedText}>
            Chạm vào phần quan trọng nhất của ảnh. Khi ảnh bị cắt cho vừa khung,
            phần này luôn được giữ lại.
          </p>
          <div className="relative mx-auto w-fit max-w-full">
            {/* biome-ignore lint/performance/noImgElement: a server or local preview picture. */}
            <img
              src={picture}
              alt=""
              className="block max-h-[50vh] w-auto max-w-full rounded-md"
            />
            <button
              type="button"
              aria-label="Đặt điểm lấy nét, hoặc dùng phím mũi tên"
              onClick={(event) => {
                const next = pointFromClick(
                  event.clientX,
                  event.clientY,
                  event.currentTarget.getBoundingClientRect(),
                );
                if (next) {
                  setPoint(next);
                }
              }}
              onKeyDown={onKey}
              className="absolute inset-0 cursor-crosshair rounded-md focus-visible:outline-2 focus-visible:outline-teal-700 dark:focus-visible:outline-teal-400"
            >
              <span
                aria-hidden="true"
                className={`absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-teal-700/70 ring-2 ring-teal-700 dark:bg-teal-400/70 dark:ring-teal-400 ${markerClass(point)}`}
              />
            </button>
          </div>
          <div className="flex items-end justify-center gap-3">
            {/* biome-ignore lint/performance/noImgElement: crop preview. */}
            <img
              src={picture}
              alt=""
              className={`${PREVIEW} aspect-video w-36 ${focusClass(point)}`}
            />
            {/* biome-ignore lint/performance/noImgElement: crop preview. */}
            <img
              src={picture}
              alt=""
              className={`${PREVIEW} aspect-square w-20 ${focusClass(point)}`}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={secondaryButton}
            >
              <FiX aria-hidden="true" />
              Huỷ
            </button>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className={`${primaryButton} disabled:opacity-60`}
            >
              <FiCheck aria-hidden="true" />
              {pending ? "Đang lưu…" : "Lưu"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
