"use client";

import type { FieldErrors } from "@/lib/account";
import {
  type Layout,
  PLACEMENT_KEYS,
  PLACEMENT_LABELS,
  placementField,
} from "@/lib/certificates";
import { TextField } from "../account/FormParts";
import { fieldLabel, mutedText } from "../ui";

type PlacementFieldsProps = {
  layout: Layout;
  errors?: FieldErrors;
};

// Five texts, each with x and y as a percentage of the page and a font size.
// The values start from the saved layout and the form reads them on submit.
export default function PlacementFields({
  layout,
  errors,
}: PlacementFieldsProps) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className={`${fieldLabel} mb-1`}>Bố cục</legend>
      <p className={`${mutedText} text-xs`}>
        X tính từ trái, Y tính từ trên, theo phần trăm khổ giấy. Chữ được căn
        giữa tại điểm đó.
      </p>
      {PLACEMENT_KEYS.map((key) => (
        <div
          key={key}
          className="flex flex-col gap-2 border-t border-slate-200 pt-3 first-of-type:border-t-0 first-of-type:pt-0 dark:border-slate-800"
        >
          <span className="text-sm font-bold">{PLACEMENT_LABELS[key]}</span>
          <div className="grid grid-cols-3 gap-2">
            <TextField
              label="X (%)"
              name={placementField(key, "x")}
              numeric="decimal"
              defaultValue={String(layout[key].x)}
              errors={errors}
              required
            />
            <TextField
              label="Y (%)"
              name={placementField(key, "y")}
              numeric="decimal"
              defaultValue={String(layout[key].y)}
              errors={errors}
              required
            />
            <TextField
              label="Cỡ chữ"
              name={placementField(key, "size")}
              numeric="integer"
              defaultValue={String(layout[key].size)}
              errors={errors}
              required
            />
          </div>
        </div>
      ))}
    </fieldset>
  );
}
