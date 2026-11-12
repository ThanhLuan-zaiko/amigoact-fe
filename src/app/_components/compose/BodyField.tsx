"use client";

import { useEffect, useId, useRef } from "react";
import type { IconType } from "react-icons";
import {
  FiImage,
  FiList,
  FiMessageSquare,
  FiMinus,
  FiType,
  FiVideo,
} from "react-icons/fi";
import { applyFormat, type FormatAction } from "@/lib/postFormat";
import {
  insertMediaToken,
  MEDIA_INSERT_EVENT,
  MEDIA_REMOVE_EVENT,
  removeMediaToken,
} from "@/lib/postMedia";
import { FieldNotes } from "../account/FormParts";
import { inputField, inputFieldInvalid } from "../ui";

export const IMAGE_INPUT_ID = "post-image-input";
export const VIDEO_INPUT_ID = "post-video-input";

const FORMATS: { label: string; icon: IconType; action: FormatAction }[] = [
  { label: "Tiêu đề", icon: FiType, action: "heading" },
  { label: "Trích dẫn", icon: FiMessageSquare, action: "quote" },
  { label: "Danh sách", icon: FiList, action: "list" },
  { label: "Đường kẻ", icon: FiMinus, action: "rule" },
];

const toolbarButton =
  "inline-flex h-9 w-10 items-center justify-center border-r border-slate-200 text-sm text-slate-700 transition-colors last:border-r-0 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-50 disabled:hover:text-slate-700 dark:border-slate-800 dark:text-slate-300 dark:hover:text-teal-400 dark:focus-visible:outline-teal-400";

export default function BodyField({
  error,
  defaultValue,
}: {
  error?: string;
  defaultValue?: string;
}) {
  const errorId = useId();
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // MediaField asks to place a file at the cursor, or to drop it when removed.
  // A blurred textarea keeps its selection, so the cursor is where the writer left it.
  useEffect(() => {
    function onInsert(event: Event) {
      const area = areaRef.current;
      const id = (event as CustomEvent<string>).detail;
      if (!area || !id) {
        return;
      }
      const result = insertMediaToken(area.value, area.selectionEnd, id);
      area.value = result.text;
      area.focus();
      area.setSelectionRange(result.cursor, result.cursor);
    }
    function onRemove(event: Event) {
      const area = areaRef.current;
      const id = (event as CustomEvent<string>).detail;
      if (area && id) {
        area.value = removeMediaToken(area.value, id);
      }
    }
    window.addEventListener(MEDIA_INSERT_EVENT, onInsert);
    window.addEventListener(MEDIA_REMOVE_EVENT, onRemove);
    return () => {
      window.removeEventListener(MEDIA_INSERT_EVENT, onInsert);
      window.removeEventListener(MEDIA_REMOVE_EVENT, onRemove);
    };
  }, []);

  function format(action: FormatAction) {
    const area = areaRef.current;
    if (!area) {
      return;
    }
    const result = applyFormat(
      area.value,
      area.selectionStart,
      area.selectionEnd,
      action,
    );
    area.value = result.text;
    area.focus();
    area.setSelectionRange(result.start, result.end);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-fit flex-wrap overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
        {FORMATS.slice(0, 3).map(({ label, icon: Icon, action }) => (
          <button
            key={action}
            type="button"
            aria-label={label}
            title={label}
            onClick={() => format(action)}
            className={toolbarButton}
          >
            <Icon aria-hidden="true" />
          </button>
        ))}
        <button
          type="button"
          aria-label="Ảnh"
          title="Thêm ảnh"
          onClick={() => document.getElementById(IMAGE_INPUT_ID)?.click()}
          className={toolbarButton}
        >
          <FiImage aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Video"
          title="Thêm video"
          onClick={() => document.getElementById(VIDEO_INPUT_ID)?.click()}
          className={toolbarButton}
        >
          <FiVideo aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Đường kẻ"
          title="Đường kẻ"
          onClick={() => format("rule")}
          className={toolbarButton}
        >
          <FiMinus aria-hidden="true" />
        </button>
      </div>
      <textarea
        ref={areaRef}
        name="post_body"
        defaultValue={defaultValue}
        rows={8}
        maxLength={5000}
        placeholder="Nội dung bài viết…"
        aria-label="Nội dung bài viết"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${error ? inputFieldInvalid : inputField} field-sizing-content min-h-48 resize-y leading-relaxed`}
      />
      <FieldNotes id={errorId} error={error} />
    </div>
  );
}
