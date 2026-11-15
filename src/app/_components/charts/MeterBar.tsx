"use client";

import { useCallback } from "react";
import { barLength } from "@/lib/chartGeometry";
import { fillBar } from "./draw";
import Swatches from "./Swatches";
import { type Paint, useCanvas } from "./useCanvas";

type MeterBarProps = {
  // Between 0 and 1. The caller shows the number as text beside the bar.
  value: number;
};

export default function MeterBar({ value }: MeterBarProps) {
  const draw = useCallback(
    ({ context, width, height, palette }: Paint) => {
      fillBar(context, { x: 0, y: 0, width, height }, palette.track, "left");
      fillBar(
        context,
        { x: 0, y: 0, width: barLength(value, 1, width), height },
        palette.primary,
        "left",
      );
    },
    [value],
  );
  const { wrapperRef, canvasRef } = useCanvas(draw);

  return (
    <div ref={wrapperRef} aria-hidden="true" className="relative h-2 w-full">
      <Swatches />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
