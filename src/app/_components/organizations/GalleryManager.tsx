"use client";

import { type DragEvent, useId, useState, useTransition } from "react";
import { FiTrash2, FiUploadCloud } from "react-icons/fi";
import {
  addGalleryItem,
  removeGalleryItem,
} from "@/app/_actions/organizations";
import { uploadMessage } from "@/lib/forms";
import type { GalleryItem } from "@/lib/organizations";
import {
  assetIdFromUrl,
  GALLERY_ACCEPT,
  GALLERY_MAX_ITEMS,
  galleryFileError,
  isVideo,
} from "@/lib/pictureRules";
import ConfirmDialog from "../ConfirmDialog";
import { fieldLabel, iconButton, mutedText, panel, sectionTitle } from "../ui";
import GalleryRoleButtons from "./GalleryRoleButtons";

type Upload = { name: string; error?: string };

async function uploadOne(slug: string, file: File): Promise<string | null> {
  const body = new FormData();
  body.set("file", file);
  const response = await fetch("/media/upload", { method: "POST", body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return uploadMessage(data.code ?? "network_error");
  }
  const state = await addGalleryItem(slug, data.id);
  return state.error ?? null;
}

export default function GalleryManager({
  slug,
  items,
  logoUrl = null,
  coverUrl = null,
}: {
  slug: string;
  items: GalleryItem[];
  // The saved logo and cover, so their gallery tiles show the role they hold.
  logoUrl?: string | null;
  coverUrl?: string | null;
}) {
  const inputId = useId();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [removing, setRemoving] = useState<GalleryItem | null>(null);
  const [removeError, setRemoveError] = useState<string | undefined>();
  const [pendingRemove, startRemove] = useTransition();
  const room = GALLERY_MAX_ITEMS - items.length;

  function closeRemove() {
    setRemoving(null);
    setRemoveError(undefined);
  }

  // Removing a photo cannot be undone from the page, so the dialog asks first.
  function confirmRemove() {
    const item = removing;
    if (!item) {
      return;
    }
    startRemove(async () => {
      const state = await removeGalleryItem(slug, item.id);
      if (state.error) {
        setRemoveError(state.error);
        return;
      }
      closeRemove();
    });
  }

  // One at a time, so a failure is reported per file and the limit stays exact.
  async function addFiles(files: File[]) {
    setBusy(true);
    const results: Upload[] = [];
    let left = room;
    for (const file of files) {
      const invalid =
        left <= 0
          ? `Bộ sưu tập tối đa ${GALLERY_MAX_ITEMS} tệp.`
          : galleryFileError(file);
      const error = invalid ?? (await uploadOne(slug, file)) ?? undefined;
      if (!error) {
        left -= 1;
      }
      results.push({ name: file.name, error });
      setUploads([...results]);
    }
    setBusy(false);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!busy) {
      addFiles(Array.from(event.dataTransfer.files));
    }
  }

  const failed = uploads.filter((upload) => upload.error);

  return (
    <section className={`${panel} flex flex-col gap-4 p-4 sm:p-6`}>
      <div className="flex items-baseline gap-2">
        <h2 className={sectionTitle}>Bộ sưu tập</h2>
        <span className={mutedText}>
          {items.length}/{GALLERY_MAX_ITEMS}
        </span>
      </div>
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center gap-1 rounded-md border border-dashed p-6 text-center transition-colors ${
          dragging
            ? "border-teal-700 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/40"
            : "border-slate-300 hover:border-teal-700 dark:border-slate-700 dark:hover:border-teal-400"
        }`}
      >
        <FiUploadCloud aria-hidden="true" className="text-2xl text-slate-500" />
        <span className={fieldLabel}>
          {busy ? "Đang tải lên…" : "Kéo thả hoặc bấm để chọn tệp"}
        </span>
        <span className={`${mutedText} text-xs`}>
          Ảnh JPEG, PNG, WEBP tối đa 20 MB. Video MP4, WEBM tối đa 50 MB.
        </span>
        <input
          id={inputId}
          type="file"
          multiple
          accept={GALLERY_ACCEPT}
          disabled={busy || room <= 0}
          onChange={(event) => {
            addFiles(Array.from(event.currentTarget.files ?? []));
            event.currentTarget.value = "";
          }}
          className="sr-only"
        />
      </label>
      {failed.length > 0 ? (
        <ul className="flex flex-col gap-1 text-xs font-semibold text-red-700 dark:text-red-400">
          {failed.map((upload) => (
            <li key={upload.name} className="break-words">
              {upload.name}: {upload.error}
            </li>
          ))}
        </ul>
      ) : null}
      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-2">
              {isVideo(item.mime) ? (
                // biome-ignore lint/a11y/useMediaCaption: uploads come without captions.
                <video
                  src={item.url}
                  controls
                  preload="metadata"
                  className="aspect-video w-full rounded-md border border-slate-200 object-cover dark:border-slate-800"
                />
              ) : (
                // biome-ignore lint/performance/noImgElement: same-origin proxy paths.
                <img
                  src={item.url}
                  alt=""
                  className="aspect-video w-full rounded-md border border-slate-200 object-cover dark:border-slate-800"
                />
              )}
              <div className="flex items-start gap-2">
                {isVideo(item.mime) ? null : (
                  <GalleryRoleButtons
                    slug={slug}
                    assetId={item.id}
                    isLogo={assetIdFromUrl(logoUrl) === item.id}
                    isCover={assetIdFromUrl(coverUrl) === item.id}
                  />
                )}
                <button
                  type="button"
                  aria-label="Xóa khỏi bộ sưu tập"
                  title="Xóa khỏi bộ sưu tập"
                  onClick={() => setRemoving(item)}
                  className={`${iconButton} ml-auto`}
                >
                  <FiTrash2 aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <ConfirmDialog
        open={removing !== null}
        title={`Xóa ${removing && isVideo(removing.mime) ? "video" : "ảnh"} khỏi bộ sưu tập?`}
        confirmLabel="Xóa"
        confirmIcon={<FiTrash2 aria-hidden="true" />}
        pending={pendingRemove}
        error={removeError}
        onConfirm={confirmRemove}
        onClose={closeRemove}
      >
        <p>
          Thao tác này không thể hoàn tác. Tệp sẽ không còn hiện trong bộ sưu
          tập, và muốn đưa lại bạn phải tải lên lại.
        </p>
      </ConfirmDialog>
    </section>
  );
}
