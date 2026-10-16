import { useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  FiHash,
  FiImage,
  FiList,
  FiMessageSquare,
  FiMinus,
  FiPlus,
  FiType,
  FiVideo,
} from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import type { BlockType } from "../board-api.ts";
import { BLOCK_TYPE_LABELS } from "../messages.tsx";

const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,image/bmp,image/tiff,image/heic,image/heif";
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";

interface BlockInserterProps {
  index: number;
  onInsert: (index: number, type: BlockType) => void;
  onMedia: (index: number, family: "image" | "video", files: File[]) => void;
}

const TEXT_BLOCKS: { type: BlockType; icon: ReactElement }[] = [
  { type: "paragraph", icon: <FiType className="h-4 w-4" aria-hidden="true" /> },
  { type: "heading", icon: <FiHash className="h-4 w-4" aria-hidden="true" /> },
  {
    type: "quote",
    icon: <FiMessageSquare className="h-4 w-4" aria-hidden="true" />,
  },
  { type: "list", icon: <FiList className="h-4 w-4" aria-hidden="true" /> },
  { type: "divider", icon: <FiMinus className="h-4 w-4" aria-hidden="true" /> },
];

// The "+" seam between two blocks: expands into the block-type menu; the
// image/video entries pipe through a hidden file input so picked files
// upload straight into a fresh block at this position.
export function BlockInserter({
  index,
  onInsert,
  onMedia,
}: BlockInserterProps): ReactElement {
  const [open, setOpen] = useState(false);
  const imageRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLInputElement | null>(null);

  function pick(family: "image" | "video", input: HTMLInputElement | null): void {
    if (input === null) return;
    const files = Array.from(input.files ?? []);
    input.value = "";
    setOpen(false);
    if (files.length > 0) onMedia(index, family, files);
  }

  return (
    <div
      data-insert-index={index}
      className="relative flex flex-col items-center gap-2"
    >
      <button
        type="button"
        onClick={() => setOpen((cur) => !cur)}
        aria-expanded={open}
        aria-label="Chèn khối nội dung tại đây"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-400"
      >
        <FiPlus className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="group"
          aria-label="Chọn loại khối"
          className="flex flex-wrap justify-center gap-2 rounded-xl border border-zinc-200 p-2 dark:border-zinc-800"
        >
          {TEXT_BLOCKS.map((item) => (
            <Button
              key={item.type}
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                onInsert(index, item.type);
              }}
              icon={item.icon}
            >
              {BLOCK_TYPE_LABELS[item.type]}
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={() => imageRef.current?.click()}
            icon={<FiImage className="h-4 w-4" aria-hidden="true" />}
          >
            {BLOCK_TYPE_LABELS["image"]}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => videoRef.current?.click()}
            icon={<FiVideo className="h-4 w-4" aria-hidden="true" />}
          >
            {BLOCK_TYPE_LABELS["video"]}
          </Button>
        </div>
      )}
      <input
        ref={imageRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => pick("image", event.target)}
      />
      <input
        ref={videoRef}
        type="file"
        accept={VIDEO_ACCEPT}
        multiple
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => pick("video", event.target)}
      />
    </div>
  );
}
