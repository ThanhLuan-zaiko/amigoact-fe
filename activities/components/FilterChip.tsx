import type { ReactElement, ReactNode } from "react";
import { Button } from "../../core/components/Button.tsx";

// One filter chip: outlined when off, filled black when on (the primary
// button fill doubles as the selected marking here).
export function FilterChip({
  selected,
  onClick,
  icon,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    <Button
      type="button"
      variant={selected ? "primary" : "secondary"}
      aria-pressed={selected}
      onClick={onClick}
      icon={icon}
    >
      {children}
    </Button>
  );
}
