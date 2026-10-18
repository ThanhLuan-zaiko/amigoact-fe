import type { ReactElement } from "react";
import { Avatar } from "./Avatar.tsx";

interface AvatarStackItem {
  name: string;
  src: string | null;
}

interface AvatarStackProps {
  items: AvatarStackItem[];
  max?: number;
}

// Messenger-style overlapping identity discs: used by read receipts
// and the typing row where a name line would eat too much space. The
// stack stays decorative - callers carry names in an aria-label.
export function AvatarStack({
  items,
  max = 6,
}: AvatarStackProps): ReactElement | null {
  if (items.length === 0) return null;
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  return (
    <span className="flex items-center -space-x-1.5" aria-hidden="true">
      {shown.map((item, index) => (
        <Avatar
          key={`${item.name}-${index}`}
          name={item.name}
          src={item.src}
          size="xs"
        />
      ))}
      {rest > 0 && (
        <span className="pl-2.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          +{rest}
        </span>
      )}
    </span>
  );
}
