"use client";

import { type DragEvent, useEffect, useId, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiAward,
  FiImage,
  FiTrash2,
  FiUploadCloud,
} from "react-icons/fi";
import {
  isPictureTooLarge,
  PICTURE_ACCEPT,
  PICTURE_MAX_MB,
} from "@/lib/pictureRules";
import { fieldLabel, iconButton, mutedText } from "../ui";
import CurrentPictures, {
  type PictureRole,
  ROLE_LABEL,
} from "./CurrentPictures";
import { uploadFile } from "./pictureUpload";

type Item = { id: string; preview: string };

type PicturePickerProps = {
  currentLogoUrl?: string | null;
  currentCoverUrl?: string | null;
  error?: { logo?: string; cover?: string };
};

const chooseButton =
  "flex h-8 w-8 items-center justify-center rounded-md border text-base transition-colors";
const chooseOn =
  "border-teal-700 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-400";
const chooseOff =
  "border-slate-300 text-slate-700 hover:border-teal-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400";

// One upload box for every picture. The user uploads first, then marks which
// picture is the logo and which is the cover. The marks travel with the form as
// hidden asset ids, so the server never has to guess.
export default function PicturePicker({
  currentLogoUrl,
  currentCoverUrl,
  error,
}: PicturePickerProps) {
  const inputId = useId();
  const previews = useRef<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [picked, setPicked] = useState<Record<PictureRole, string | null>>({
    logo: null,
    cover: null,
  });
  const [removed, setRemoved] = useState<Record<PictureRole, boolean>>({
    logo: false,
    cover: false,
  });
  const [busy, setBusy] = useState(false);
  const [failures, setFailures] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const current: Record<PictureRole, string | null> = {
    logo: currentLogoUrl ?? null,
    cover: currentCoverUrl ?? null,
  };

  // Object URLs are released when the form goes away.
  useEffect(() => {
    const urls = previews.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  async function addFiles(files: File[]) {
    setBusy(true);
    const errors: string[] = [];
    for (const file of files) {
      if (!PICTURE_ACCEPT.split(",").includes(file.type)) {
        errors.push(`${file.name}: Ảnh phải là JPEG, PNG hoặc WEBP.`);
        continue;
      }
      if (isPictureTooLarge(file.size)) {
        errors.push(`${file.name}: Ảnh tối đa ${PICTURE_MAX_MB} MB.`);
        continue;
      }
      const { id, error: failure } = await uploadFile(file);
      if (!id) {
        errors.push(`${file.name}: ${failure}`);
        continue;
      }
      const preview = URL.createObjectURL(file);
      previews.current.push(preview);
      setItems((list) => [...list, { id, preview }]);
    }
    setFailures(errors);
    setBusy(false);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!busy) {
      addFiles(Array.from(event.dataTransfer.files));
    }
  }

  // Clicking the chosen role again clears it. One picture holds one role at a
  // time per role, so choosing it elsewhere moves it.
  function toggle(role: PictureRole, id: string) {
    setPicked((state) => ({
      ...state,
      [role]: state[role] === id ? null : id,
    }));
  }

  function discard(item: Item) {
    setItems((list) => list.filter((entry) => entry.id !== item.id));
    setPicked((state) => ({
      logo: state.logo === item.id ? null : state.logo,
      cover: state.cover === item.id ? null : state.cover,
    }));
  }

  const roles: PictureRole[] = ["logo", "cover"];

  return (
    <div className="flex flex-col gap-3">
      <span className={fieldLabel}>Ảnh</span>
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
          {busy ? "Đang tải lên…" : "Kéo thả hoặc bấm để chọn ảnh"}
        </span>
        <span className={`${mutedText} text-xs`}>
          JPEG, PNG, WEBP, tối đa {PICTURE_MAX_MB} MB mỗi ảnh. Sau khi tải lên,
          hãy chọn ảnh nào là logo, ảnh nào là ảnh bìa.
        </span>
        <input
          id={inputId}
          type="file"
          multiple
          accept={PICTURE_ACCEPT}
          disabled={busy}
          onChange={(event) => {
            addFiles(Array.from(event.currentTarget.files ?? []));
            event.currentTarget.value = "";
          }}
          className="sr-only"
        />
      </label>
      {failures.length > 0 ? (
        <ul className="flex flex-col gap-1 text-xs font-semibold text-red-700 dark:text-red-400">
          {failures.map((message) => (
            <li key={message} className="break-words">
              {message}
            </li>
          ))}
        </ul>
      ) : null}
      {roles.map((role) => {
        const message = error?.[role];
        return message ? (
          <span
            key={role}
            className="flex items-start gap-1 text-xs font-semibold text-red-700 dark:text-red-400"
          >
            <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0" />
            {message}
          </span>
        ) : null;
      })}
      <CurrentPictures
        urls={current}
        replaced={{ logo: picked.logo !== null, cover: picked.cover !== null }}
        removed={removed}
        onRemoveChange={(role, checked) =>
          setRemoved((state) => ({ ...state, [role]: checked }))
        }
      />
      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-2">
              {/* biome-ignore lint/performance/noImgElement: local preview of the chosen file. */}
              <img
                src={item.preview}
                alt=""
                className="aspect-video w-full rounded-md border border-slate-200 object-cover dark:border-slate-800"
              />
              <div className="flex items-center gap-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={picked[role] === item.id}
                    aria-label={`Đặt làm ${ROLE_LABEL[role].toLowerCase()}`}
                    title={`Đặt làm ${ROLE_LABEL[role].toLowerCase()}`}
                    onClick={() => toggle(role, item.id)}
                    className={`${chooseButton} ${picked[role] === item.id ? chooseOn : chooseOff}`}
                  >
                    {role === "logo" ? (
                      <FiAward aria-hidden="true" />
                    ) : (
                      <FiImage aria-hidden="true" />
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Bỏ ảnh này"
                  title="Bỏ ảnh này"
                  onClick={() => discard(item)}
                  className={`${iconButton} ml-auto`}
                >
                  <FiTrash2 aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {picked.logo ? (
        <input type="hidden" name="logo_asset_id" value={picked.logo} />
      ) : null}
      {picked.cover ? (
        <input type="hidden" name="cover_asset_id" value={picked.cover} />
      ) : null}
      {removed.logo ? (
        <input type="hidden" name="remove_logo" value="on" />
      ) : null}
      {removed.cover ? (
        <input type="hidden" name="remove_cover" value="on" />
      ) : null}
    </div>
  );
}
