import type { ReactElement } from "react";
import type { ActivitySlot } from "../../activities/slots-api.ts";

interface SlotPickerProps {
  slots: ActivitySlot[];
  value: string | null;
  onChange: (slotId: string) => void;
}

// Radio list of sessions with seats taken. Full sessions stay visible and
// selectable; the backend has the final say.
export function SlotPicker({
  slots,
  value,
  onChange,
}: SlotPickerProps): ReactElement {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Chọn ca tham gia
      </legend>
      {slots.map((s) => {
        const full = s.capacity != null && s.registered >= s.capacity;
        return (
          <label
            key={s.slot_id}
            className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
              value === s.slot_id
                ? "border-zinc-900 dark:border-zinc-100"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="slot"
                checked={value === s.slot_id}
                onChange={() => onChange(s.slot_id)}
              />
              <span className="text-zinc-900 dark:text-zinc-100">
                {s.title}
              </span>
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {s.capacity != null
                ? `${s.registered}/${s.capacity}${full ? " · đầy" : ""}`
                : `${s.registered} đã đăng ký`}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
