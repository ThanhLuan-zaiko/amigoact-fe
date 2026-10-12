import type { ReactElement } from "react";
import { FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { TextArea } from "../../core/components/TextArea.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { EditorBlock, MediaLookup } from "../article.ts";
import type { UploadState } from "../editor-hooks.ts";
import { BLOCK_TYPE_LABELS } from "../messages.tsx";
import { ListBlockFields } from "./ListBlockFields.tsx";
import { MediaBlockEditor } from "./MediaBlockEditor.tsx";

interface BlockEditorProps {
  block: EditorBlock;
  index: number;
  total: number;
  lookup: MediaLookup;
  upload?: UploadState;
  focused: boolean;
  onPatch: (key: string, patch: Partial<EditorBlock>) => void;
  onReplaceMedia: (key: string, file: File) => void;
  onMove: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
}

// One editable article block: a slim header (type label + move/remove
// controls) over the per-type field set. All inputs go through the
// shared TextField/TextArea primitives.
export function BlockEditor({
  block,
  index,
  total,
  lookup,
  upload,
  focused,
  onPatch,
  onReplaceMedia,
  onMove,
  onRemove,
}: BlockEditorProps): ReactElement {
  const label = BLOCK_TYPE_LABELS[block.type];
  return (
    <div
      data-rise
      className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {label} · {index + 1}
        </span>
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onMove(block.key, -1)}
            disabled={index === 0}
            aria-label="Đưa khối lên trên"
            icon={<FiArrowUp className="h-4 w-4" aria-hidden="true" />}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onMove(block.key, 1)}
            disabled={index >= total - 1}
            aria-label="Đưa khối xuống dưới"
            icon={<FiArrowDown className="h-4 w-4" aria-hidden="true" />}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(block.key)}
            aria-label={`Xóa ${label.toLowerCase()}`}
            icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
          />
        </div>
      </div>
      <BlockFields
        block={block}
        lookup={lookup}
        upload={upload}
        focused={focused}
        onPatch={onPatch}
        onReplaceMedia={onReplaceMedia}
      />
    </div>
  );
}

function BlockFields({
  block,
  lookup,
  upload,
  focused,
  onPatch,
  onReplaceMedia,
}: Omit<BlockEditorProps, "index" | "total" | "onMove" | "onRemove">): ReactElement {
  const key = block.key;
  switch (block.type) {
    case "heading":
      return (
        <div className="flex flex-col gap-2">
          <div role="group" aria-label="Cấp tiêu đề" className="flex gap-2">
            {([2, 3] as const).map((level) => (
              <Button
                key={level}
                type="button"
                variant={block.level === level ? "primary" : "secondary"}
                onClick={() => onPatch(key, { level })}
                aria-pressed={block.level === level}
              >
                {`H${level}`}
              </Button>
            ))}
          </div>
          <TextField
            label="Tiêu đề phụ"
            name={`heading-${key}`}
            value={block.text}
            autoFocus={focused}
            onChange={(event) => onPatch(key, { text: event.target.value })}
            placeholder="Nhập tiêu đề phụ…"
            maxLength={200}
          />
        </div>
      );
    case "quote":
      return (
        <div className="flex flex-col gap-2">
          <TextArea
            label="Trích dẫn"
            name={`quote-${key}`}
            value={block.text}
            autoFocus={focused}
            onChange={(event) => onPatch(key, { text: event.target.value })}
            placeholder="Nhập câu trích dẫn…"
            rows={2}
            maxLength={1000}
          />
          <TextField
            label="Nguồn trích dẫn"
            name={`cite-${key}`}
            value={block.cite}
            onChange={(event) => onPatch(key, { cite: event.target.value })}
            placeholder="Tên người hoặc nguồn (không bắt buộc)…"
            maxLength={120}
          />
        </div>
      );
    case "list":
      return (
        <ListBlockFields block={block} focused={focused} onPatch={onPatch} />
      );
    case "image":
    case "video":
      return (
        <MediaBlockEditor
          block={block}
          lookup={lookup}
          upload={upload}
          onCaption={(caption) => onPatch(key, { caption })}
          onReplace={(file) => onReplaceMedia(key, file)}
        />
      );
    case "divider":
      return (
        <hr
          aria-hidden="true"
          className="border-t-2 border-zinc-200 dark:border-zinc-800"
        />
      );
    default:
      return (
        <TextArea
          label="Đoạn văn"
          name={`paragraph-${key}`}
          value={block.text}
          autoFocus={focused}
          onChange={(event) => onPatch(key, { text: event.target.value })}
          placeholder="Viết nội dung đoạn này…"
          rows={3}
          maxLength={5000}
        />
      );
  }
}
