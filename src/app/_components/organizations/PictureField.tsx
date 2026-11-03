"use client";

import { type ChangeEvent, useEffect, useId, useState } from "react";
import { FiAlertCircle, FiImage } from "react-icons/fi";
import { isPictureTooLarge, PICTURE_ACCEPT } from "@/lib/pictureRules";
import { fieldLabel, mutedText } from "../ui";

type PictureFieldProps = {
  label: string;
  // Form field name. The server reads it as "logo" or "cover".
  name: "logo" | "cover";
  currentUrl?: string | null;
  // The logo is square, the cover is wide.
  shape: "square" | "wide";
  error?: string;
};

const PREVIEW_SIZE = {
  square: "h-20 w-20",
  wide: "h-20 w-40 sm:w-56",
};

const TOO_LARGE = "Ảnh tối đa 5 MB. Hãy chọn ảnh nhỏ hơn.";

export default function PictureField({
  label,
  name,
  currentUrl,
  shape,
  error,
}: PictureFieldProps) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const message = clientError ?? error;

  // The object URL of a replaced preview is released, so memory does not grow.
  useEffect(() => {
    if (!preview) {
      return;
    }
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    setClientError(null);
    if (!file) {
      setPreview(null);
      return;
    }
    if (isPictureTooLarge(file.size)) {
      event.currentTarget.value = "";
      setPreview(null);
      setClientError(TOO_LARGE);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  const shownUrl = preview ?? currentUrl ?? null;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className={fieldLabel}>
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 ${PREVIEW_SIZE[shape]}`}
        >
          {shownUrl ? (
            // biome-ignore lint/performance/noImgElement: previews are object URLs or same-origin proxy paths.
            <img
              src={shownUrl}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <FiImage aria-hidden="true" className="text-2xl text-slate-400" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            id={inputId}
            type="file"
            name={name}
            accept={PICTURE_ACCEPT}
            onChange={onChange}
            aria-invalid={message ? true : undefined}
            className="w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-transparent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:border-teal-700 dark:text-slate-300 dark:file:border-slate-700 dark:file:text-slate-300 dark:hover:file:border-teal-400"
          />
          {currentUrl ? (
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                name={`remove_${name}`}
                className="h-4 w-4 accent-teal-700 dark:accent-teal-400"
              />
              Gỡ ảnh hiện tại
            </label>
          ) : null}
          {message ? (
            <span className="flex items-start gap-1 text-xs font-semibold text-red-700 dark:text-red-400">
              <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0" />
              {message}
            </span>
          ) : (
            <span className={`${mutedText} text-xs`}>
              JPEG, PNG hoặc WEBP, tối đa 5 MB
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
