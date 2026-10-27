import type { ReactElement } from "react";
import { FiLayers } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { ROLE_TEMPLATES } from "../messages-roles.tsx";
import type { RoleTemplate } from "../messages-roles.tsx";

interface RoleTemplatePickerProps {
  assignable: string[];
  isLocked: (code: string) => boolean;
  // Receives the template with permissions the viewer cannot grant removed.
  onPick: (template: RoleTemplate) => void;
}

// Starting points for a new role. Templates the viewer could not grant any
// permission of are hidden rather than shown disabled.
export function RoleTemplatePicker({
  assignable,
  isLocked,
  onPick,
}: RoleTemplatePickerProps): ReactElement | null {
  const usable = ROLE_TEMPLATES.map((template) => ({
    ...template,
    permissions: template.permissions.filter(
      (code) => assignable.includes(code) && !isLocked(code),
    ),
  })).filter((template) => template.permissions.length > 0);
  if (usable.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Bắt đầu từ mẫu</p>
      <div role="group" aria-label="Mẫu vai trò" className="flex flex-wrap gap-2">
        {usable.map((template) => (
          <Button
            key={template.key}
            type="button"
            variant="secondary"
            onClick={() => onPick(template)}
            icon={<FiLayers className="h-4 w-4" aria-hidden="true" />}
          >
            {template.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
