import type { ReactElement } from "react";
import { FiCalendar, FiShare2 } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";

interface ChatComposerShortcutsProps {
  onQuickEvent?: () => void;
  onShareThread?: () => void;
  manageActivityTo?: string;
}

// Icon actions sitting left of the attachment clip: create an event
// from a parent room, open an existing sub-thread, or jump to the
// linked event from a sub-thread.
export function ChatComposerShortcuts({
  onQuickEvent,
  onShareThread,
  manageActivityTo,
}: ChatComposerShortcutsProps): ReactElement | null {
  if (
    onQuickEvent === undefined &&
    onShareThread === undefined &&
    manageActivityTo === undefined
  ) {
    return null;
  }
  return (
    <>
      {onQuickEvent !== undefined && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onQuickEvent}
          aria-label="Tạo sự kiện nhanh"
          title="Tạo sự kiện nhanh"
          icon={<FiCalendar className="h-5 w-5" aria-hidden="true" />}
        />
      )}
      {onShareThread !== undefined && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onShareThread}
          aria-label="Luồng có sẵn"
          title="Luồng có sẵn"
          icon={<FiShare2 className="h-5 w-5" aria-hidden="true" />}
        />
      )}
      {manageActivityTo !== undefined && (
        <Button
          variant="ghost"
          size="icon"
          to={manageActivityTo}
          aria-label="Quản lý sự kiện"
          title="Quản lý sự kiện"
          icon={<FiCalendar className="h-5 w-5" aria-hidden="true" />}
        />
      )}
    </>
  );
}
