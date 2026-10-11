import type { ReactElement, ReactNode } from "react";
import { FiDroplet, FiMoon, FiRefreshCcw, FiRepeat, FiRotateCcw, FiRotateCw, FiSliders, FiSun } from "react-icons/fi";
import type { IconType } from "react-icons";
import { Button } from "../../core/components/Button.tsx";
import type { CropFilters } from "../crop-math.ts";

interface SliderRowProps {
  icon: ReactNode;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  disabled?: boolean;
  controls?: ReactNode;
  onChange: (value: number) => void;
}

export function SliderRow({ icon, label, min, max, step, value, display, disabled = false, controls, onChange }: SliderRowProps): ReactElement {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden="true">
        {icon}
      </span>
      <span className="w-16 shrink-0 text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      {controls}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-w-0 flex-1 accent-brand disabled:opacity-60"
        aria-label={label}
      />
      <span className="w-11 shrink-0 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{display}</span>
    </div>
  );
}

interface CropToolbarProps {
  disabled: boolean;
  adjustOpen: boolean;
  onRotate: (delta: number) => void;
  onFlip: (axis: "h" | "v") => void;
  onToggleAdjust: () => void;
  onReset: () => void;
}

export function CropToolbar({ disabled, adjustOpen, onRotate, onFlip, onToggleAdjust, onReset }: CropToolbarProps): ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Công cụ xoay, lật và bộ lọc">
      <Button size="icon" variant="ghost" disabled={disabled} aria-label="Xoay trái 90 độ" title="Xoay trái 90 độ" onClick={() => onRotate(-90)}>
        <FiRotateCcw className="h-5 w-5" aria-hidden="true" />
      </Button>
      <Button size="icon" variant="ghost" disabled={disabled} aria-label="Xoay phải 90 độ" title="Xoay phải 90 độ" onClick={() => onRotate(90)}>
        <FiRotateCw className="h-5 w-5" aria-hidden="true" />
      </Button>
      <Button variant="ghost" disabled={disabled} onClick={() => onFlip("h")} icon={<FiRepeat className="h-4 w-4" aria-hidden="true" />}>
        Lật ngang
      </Button>
      <Button
        variant="ghost"
        disabled={disabled}
        onClick={() => onFlip("v")}
        icon={
          <span className="inline-flex rotate-90">
            <FiRepeat className="h-4 w-4" aria-hidden="true" />
          </span>
        }
      >
        Lật dọc
      </Button>
      <Button variant="ghost" disabled={disabled} aria-pressed={adjustOpen} onClick={onToggleAdjust} icon={<FiSliders className="h-4 w-4" aria-hidden="true" />}>
        Bộ lọc
      </Button>
      <Button variant="ghost" disabled={disabled} onClick={onReset} icon={<FiRefreshCcw className="h-4 w-4" aria-hidden="true" />}>
        Đặt lại
      </Button>
    </div>
  );
}

const ADJUST_SLIDERS: { key: keyof CropFilters; label: string; Icon: IconType }[] = [
  { key: "brightness", label: "Độ sáng", Icon: FiSun },
  { key: "contrast", label: "Tương phản", Icon: FiMoon },
  { key: "saturation", label: "Bão hoà", Icon: FiDroplet },
];

interface AdjustPanelProps {
  filters: CropFilters;
  disabled: boolean;
  onChange: (filters: CropFilters) => void;
}

export function AdjustPanel({ filters, disabled, onChange }: AdjustPanelProps): ReactElement {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-2 dark:border-zinc-800">
      {ADJUST_SLIDERS.map(({ key, label, Icon }) => (
        <SliderRow
          key={key}
          icon={<Icon className="h-4 w-4" aria-hidden="true" />}
          label={label}
          min={0.4}
          max={1.6}
          step={0.05}
          value={filters[key]}
          display={`${Math.round(filters[key] * 100)}%`}
          disabled={disabled}
          onChange={(value) => onChange({ ...filters, [key]: value })}
        />
      ))}
    </div>
  );
}
