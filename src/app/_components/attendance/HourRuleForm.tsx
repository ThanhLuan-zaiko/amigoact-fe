"use client";

import { FiSave } from "react-icons/fi";
import { setHourRule } from "@/app/_actions/attendance";
import type { HourRule } from "@/lib/attendance";
import { FormMessage, SubmitButton, TextField } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import { panel, sectionTitle } from "../ui";

type HourRuleFormProps = {
  slug: string;
  rule: HourRule;
};

export default function HourRuleForm({ slug, rule }: HourRuleFormProps) {
  const { state, pending, formProps } = useAccountForm(
    setHourRule.bind(null, slug),
    { resetOnSuccess: false },
  );
  return (
    <form {...formProps} className={`${panel} flex flex-col gap-4 p-4 sm:p-6`}>
      <h2 className={sectionTitle}>Quy tắc tính giờ</h2>
      <FormMessage state={state} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Hệ số"
          name="multiplier"
          numeric="decimal"
          defaultValue={String(rule.multiplier)}
          hint="Nhân với số giờ của mỗi hoạt động"
          errors={state.fieldErrors}
          required
        />
        <TextField
          label="Giới hạn giờ mỗi kỳ"
          name="cap_hours"
          numeric="decimal"
          defaultValue={rule.cap_hours?.toString()}
          hint="Mỗi người, mỗi nửa năm. Bỏ trống nếu không giới hạn"
          errors={state.fieldErrors}
        />
      </div>
      <div>
        <SubmitButton pending={pending} icon={FiSave}>
          Lưu
        </SubmitButton>
      </div>
    </form>
  );
}
