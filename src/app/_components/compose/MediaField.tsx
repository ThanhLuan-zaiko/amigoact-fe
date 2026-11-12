"use client";

import { useState } from "react";
import { FiCornerDownLeft, FiTrash2 } from "react-icons/fi";
import { uploadMessage } from "@/lib/forms";
import {
  isPictureTooLarge,
  isVideo,
  PICTURE_ACCEPT,
  VIDEO_MAX_BYTES,
} from "@/lib/pictureRules";
import { MEDIA_INSERT_EVENT, MEDIA_REMOVE_EVENT } from "@/lib/postMedia";
import { POST_MEDIA_LIMIT } from "@/lib/posts";
import { FieldNotes } from "../account/FormParts";
import { iconButton, mutedText } from "../ui";
import { IMAGE_INPUT_ID, VIDEO_INPUT_ID } from "./BodyField";

type Item = { id: string; mime: string; preview: string };

function tellBody(event: string, id: string) {
  window.dispatchEvent(new CustomEvent(event, { detail: id.toLowerCase() }));
}

const VIDEO_ACCEPT = "video/mp4,video/webm";
const MEDIA_CLASS =
  "aspect-video w-full rounded-md border border-slate-200 object-cover dark:border-slate-800";

async function uploadFile(
  file: File,
): Promise<{ id?: string; error?: string }> {
  const body = new FormData();
  body.set("file", file);
  const response = await fetch("/media/upload", { method: "POST", body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: uploadMessage(data.code ?? "network_error") };
  }
  return { id: data.id };
}

// Checked in the browser first. The backend checks the real file type again.
function fileError(file: File): string | null {
  if (isVideo(file.type)) {
    if (!VIDEO_ACCEPT.split(",").includes(file.type)) {
      return "Video phải là MP4 hoặc WEBM.";
    }
    return file.size > VIDEO_MAX_BYTES ? "Video tối đa 50 MB." : null;
  }
  if (!PICTURE_ACCEPT.split(",").includes(file.type)) {
    return "Chỉ nhận ảnh JPEG, PNG, WEBP hoặc video MP4, WEBM.";
  }
  return isPictureTooLarge(file.size) ? "Ảnh tối đa 20 MB." : null;
}

// Each file uploads at once and travels with the form as a hidden asset id.
// The inputs are opened from the toolbar, so they have no visible control.
// The edit form passes the files a post already has. They are served by the media route.
export default function MediaField({
  error,
  initial = [],
}: {
  error?: string;
  initial?: { id: string; mime: string }[];
}) {
  const [items, setItems] = useState<Item[]>(() =>
    initial.map(({ id, mime }) => ({ id, mime, preview: `/media/${id}/file` })),
  );
  const [busy, setBusy] = useState(false);
  const [failures, setFailures] = useState<string[]>([]);
  const full = items.length >= POST_MEDIA_LIMIT;

  async function addFiles(files: File[]) {
    setBusy(true);
    const errors: string[] = [];
    let room = POST_MEDIA_LIMIT - items.length;
    for (const file of files) {
      const invalid =
        room <= 0 ? `Tối đa ${POST_MEDIA_LIMIT} tệp mỗi bài.` : fileError(file);
      if (invalid) {
        errors.push(`${file.name}: ${invalid}`);
        continue;
      }
      const { id, error: failure } = await uploadFile(file);
      if (id) {
        room -= 1;
        const preview = URL.createObjectURL(file);
        setItems((current) => [...current, { id, mime: file.type, preview }]);
        // A new file lands where the cursor is, like a picture in an article.
        tellBody(MEDIA_INSERT_EVENT, id);
      } else {
        errors.push(`${file.name}: ${failure}`);
      }
    }
    setFailures(errors);
    setBusy(false);
  }

  function remove(item: Item) {
    if (item.preview.startsWith("blob:")) {
      URL.revokeObjectURL(item.preview);
    }
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    tellBody(MEDIA_REMOVE_EVENT, item.id);
  }

  function picker(id: string, accept: string, label: string) {
    return (
      <input
        id={id}
        type="file"
        multiple
        accept={accept}
        disabled={busy || full}
        aria-label={label}
        onChange={(event) => {
          addFiles(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = "";
        }}
        className="sr-only"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {picker(IMAGE_INPUT_ID, PICTURE_ACCEPT, "Chọn ảnh cho bài viết")}
      {picker(VIDEO_INPUT_ID, VIDEO_ACCEPT, "Chọn video cho bài viết")}
      {busy ? <p className={mutedText}>Đang tải lên…</p> : null}
      {failures.length > 0 ? (
        <ul className="flex flex-col gap-1 text-xs font-semibold text-red-700 dark:text-red-400">
          {failures.map((message) => (
            <li key={message} className="break-words">
              {message}
            </li>
          ))}
        </ul>
      ) : null}
      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-2">
              {isVideo(item.mime) ? (
                <video
                  src={item.preview}
                  muted
                  preload="metadata"
                  className={MEDIA_CLASS}
                />
              ) : (
                // biome-ignore lint/performance/noImgElement: local preview of the chosen file.
                <img src={item.preview} alt="" className={MEDIA_CLASS} />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Chèn vào vị trí con trỏ"
                  title="Chèn vào vị trí con trỏ"
                  onClick={() => tellBody(MEDIA_INSERT_EVENT, item.id)}
                  className={iconButton}
                >
                  <FiCornerDownLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Gỡ tệp"
                  title="Gỡ tệp"
                  onClick={() => remove(item)}
                  className={iconButton}
                >
                  <FiTrash2 aria-hidden="true" />
                </button>
              </div>
              <input type="hidden" name="media_id" value={item.id} />
            </li>
          ))}
        </ul>
      ) : null}
      <FieldNotes
        id="post-media-error"
        error={error}
        hint={
          items.length > 0
            ? `${items.length}/${POST_MEDIA_LIMIT} tệp. Dòng [media:…] trong nội dung là chỗ đặt tệp, tệp chưa đặt sẽ hiện cuối bài. Chỉ bài công khai có ảnh hoặc video.`
            : undefined
        }
      />
    </div>
  );
}
