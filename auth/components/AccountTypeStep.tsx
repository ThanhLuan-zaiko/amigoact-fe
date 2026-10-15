import type { ReactElement } from "react";
import { FiBriefcase, FiUser } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import type { AccountType } from "../schemas.ts";

interface AccountTypeStepProps {
  value: AccountType;
  onSelect: (value: AccountType) => void;
}

export function AccountTypeStep({ value, onSelect }: AccountTypeStepProps): ReactElement {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={value === "individual" ? "primary" : "secondary"}
          onClick={() => onSelect("individual")}
          aria-pressed={value === "individual"}
          icon={<FiUser className="h-4 w-4" aria-hidden="true" />}
        >
          Cá nhân
        </Button>
        <Button
          type="button"
          variant={value === "business" ? "primary" : "secondary"}
          onClick={() => onSelect("business")}
          aria-pressed={value === "business"}
          icon={<FiBriefcase className="h-4 w-4" aria-hidden="true" />}
        >
          Doanh nghiệp
        </Button>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {value === "business"
          ? "Dành cho công ty, hộ kinh doanh. Bước sau cần MST và người đại diện pháp luật."
          : "Dành cho tình nguyện viên, sinh viên. Chỉ cần thông tin cá nhân ở bước sau."}
      </p>
    </div>
  );
}
