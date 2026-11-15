"use client";

import { useCallback } from "react";
import { hoursText } from "@/lib/attendance";
import { barLength } from "@/lib/chartGeometry";
import { fillBar, fitText, label } from "./draw";
import Swatches from "./Swatches";
import { type Paint, useCanvas } from "./useCanvas";

export type BarRow = { key: string; label: string; hours: number };

type BarListChartProps = {
  rows: BarRow[];
  description: string;
};

// One row is 40px: the name and value on top, the bar below.
const ROW = 40;
const BAR = 8;
// Literal classes, one per row count, because Tailwind cannot build a class at runtime.
const HEIGHTS = [
  "h-10",
  "h-20",
  "h-30",
  "h-40",
  "h-50",
  "h-60",
  "h-70",
  "h-80",
  "h-90",
  "h-100",
];

export default function BarListChart({ rows, description }: BarListChartProps) {
  const draw = useCallback(
    ({ context, width, palette, font }: Paint) => {
      const max = Math.max(...rows.map((row) => row.hours), 0);
      rows.forEach((row, index) => {
        const top = index * ROW;
        const value = hoursText(row.hours);
        label(context, value, width, top + 10, {
          color: palette.ink,
          font,
          size: 13,
          weight: 600,
          align: "right",
        });
        const valueWidth = context.measureText(value).width;
        context.font = `400 13px ${font}`;
        const name = fitText(context, row.label, width - valueWidth - 12);
        label(context, name, 0, top + 10, {
          color: palette.ink,
          font,
          size: 13,
        });
        const barTop = top + 22;
        fillBar(
          context,
          { x: 0, y: barTop, width, height: BAR },
          palette.track,
          "left",
        );
        fillBar(
          context,
          {
            x: 0,
            y: barTop,
            width: barLength(row.hours, max, width),
            height: BAR,
          },
          palette.primary,
          "left",
        );
      });
    },
    [rows],
  );

  const { wrapperRef, canvasRef } = useCanvas(draw);
  const height =
    HEIGHTS[Math.min(rows.length, HEIGHTS.length) - 1] ?? HEIGHTS[0];

  return (
    <>
      <div
        ref={wrapperRef}
        aria-hidden="true"
        className={`relative w-full ${height}`}
      >
        <Swatches />
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      </div>
      <table className="sr-only">
        <caption>{description}</caption>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row">{row.label}</th>
              <td>{hoursText(row.hours)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
