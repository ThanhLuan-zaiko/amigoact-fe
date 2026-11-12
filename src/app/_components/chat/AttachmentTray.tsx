import { FiAlertCircle, FiPlay, FiX } from "react-icons/fi";
import type { Draft } from "./useAttachments";

type AttachmentTrayProps = {
  drafts: Draft[];
  onRemove: (key: string) => void;
};

// The files waiting to be sent, with how far each upload is. A failed one is marked and
// must be removed before sending.
export default function AttachmentTray({
  drafts,
  onRemove,
}: AttachmentTrayProps) {
  if (drafts.length === 0) {
    return null;
  }
  return (
    <ul aria-label="Tệp đính kèm" className="flex gap-2 overflow-x-auto pb-1">
      {drafts.map((draft) => {
        const busy = draft.assetId === null && draft.error === null;
        return (
          <li
            key={draft.key}
            className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border ${draft.error ? "border-red-700 dark:border-red-400" : "border-slate-200 dark:border-slate-800"}`}
            title={draft.error ?? draft.name}
          >
            {draft.kind === "video" ? (
              <video
                src={draft.preview}
                muted
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : (
              // biome-ignore lint/performance/noImgElement: local preview of the chosen file.
              <img
                src={draft.preview}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
            {draft.kind === "video" && !busy ? (
              <FiPlay
                aria-hidden="true"
                className="absolute bottom-1 left-1 text-white"
              />
            ) : null}
            {busy ? (
              <span className="absolute inset-0 flex items-center justify-center bg-slate-950/50 text-xs font-bold text-white">
                <output aria-label={`Đang tải ${draft.name}`}>
                  {draft.progress}%
                </output>
              </span>
            ) : null}
            {draft.error ? (
              <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-xl text-red-700 dark:bg-slate-950/70 dark:text-red-400">
                <FiAlertCircle aria-label={draft.error} />
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onRemove(draft.key)}
              aria-label={`Bỏ ${draft.name}`}
              title={`Bỏ ${draft.name}`}
              className="absolute top-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/70 text-xs text-white hover:bg-slate-950 focus-visible:outline-2 focus-visible:outline-white"
            >
              <FiX aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
