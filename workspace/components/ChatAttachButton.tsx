import type { ReactElement, RefObject } from "react";
import { FiPaperclip } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";

interface ChatAttachButtonProps {
  fileRef: RefObject<HTMLInputElement | null>;
  accept: string;
  disabled: boolean;
  // Hidden when the org limits attachments and the viewer lacks chat:attach.
  visible: boolean;
  onPick: (files: FileList | null) => void;
}

// Hidden file input plus the paperclip trigger of the chat composer.
export function ChatAttachButton({
  fileRef,
  accept,
  disabled,
  visible,
  onPick,
}: ChatAttachButtonProps): ReactElement | null {
  if (!visible) return null;
  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(event) => onPick(event.target.files)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileRef.current?.click()}
        disabled={disabled}
        aria-label="Đính kèm ảnh hoặc video"
        icon={<FiPaperclip className="h-5 w-5" aria-hidden="true" />}
      />
    </>
  );
}
