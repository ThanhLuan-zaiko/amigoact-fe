"use client";

import { type PointerEvent, useCallback, useState } from "react";
import { hoursText } from "@/lib/attendance";
import {
  columnLayout,
  indexAt,
  labelStride,
  niceScale,
  plotBox,
  stackExtent,
  yOf,
} from "@/lib/chartGeometry";
import { fillBar, hairline, label } from "./draw";
import Swatches from "./Swatches";
import { type Paint, useCanvas } from "./useCanvas";

export type ColumnPoint = {
  key: string;
  label: string;
  title: string;
  awarded: number;
  adjusted: number;
};

type ColumnChartProps = {
  points: ColumnPoint[];
  names: { awarded: string; adjusted: string };
  // Names the chart for screen readers, which read the table instead of the canvas.
  description: string;
};

const PADDING = { top: 8, right: 4, bottom: 24, left: 40 };
const LABEL_WIDTH = 44;

function plotFor(width: number, height: number) {
  return plotBox(width, height, PADDING);
}

export default function ColumnChart({
  points,
  names,
  description,
}: ColumnChartProps) {
  const [active, setActive] = useState<number | null>(null);

  const draw = useCallback(
    ({ context, width, height, palette, font }: Paint) => {
      const plot = plotFor(width, height);
      const [low, high] = stackExtent(points);
      const scale = niceScale(low, high);
      for (const tick of scale.ticks) {
        const y = yOf(tick, scale, plot);
        const color = tick === 0 ? palette.zero : palette.grid;
        hairline(context, plot.x, plot.x + plot.width, y, color);
        label(context, hoursText(tick), plot.x - 8, y, {
          color: palette.muted,
          font,
          align: "right",
        });
      }
      const columns = columnLayout(points, scale, plot);
      if (active !== null && points.length > 0) {
        const slot = plot.width / points.length;
        context.fillStyle = palette.highlight;
        context.fillRect(plot.x + active * slot, plot.y, slot, plot.height);
      }
      const stride = labelStride(points.length, plot.width, LABEL_WIDTH);
      columns.forEach((column, index) => {
        fillBar(context, column.awarded, palette.primary, "bottom");
        const below = points[index].adjusted < 0;
        fillBar(
          context,
          column.adjusted,
          palette.secondary,
          below ? "top" : "bottom",
        );
        if (index % stride === 0) {
          label(
            context,
            points[index].label,
            column.center,
            plot.y + plot.height + 14,
            {
              color: index === active ? palette.ink : palette.muted,
              font,
              align: "center",
            },
          );
        }
      });
    },
    [points, active],
  );

  const { wrapperRef, canvasRef } = useCanvas(draw);

  function onPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const x = event.clientX - canvas.getBoundingClientRect().left;
    setActive(
      indexAt(
        x,
        points.length,
        plotFor(canvas.clientWidth, canvas.clientHeight),
      ),
    );
  }

  const shown = points[active ?? points.length - 1];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-teal-700 dark:bg-teal-400" />
          {names.awarded}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
          {names.adjusted}
        </span>
      </div>
      <div
        ref={wrapperRef}
        aria-hidden="true"
        className="relative h-56 w-full sm:h-64"
      >
        <Swatches />
        <canvas
          ref={canvasRef}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerMove}
          onPointerLeave={() => setActive(null)}
          className="absolute inset-0 size-full touch-pan-y"
        />
      </div>
      {shown ? (
        <p
          aria-hidden="true"
          className="text-sm text-slate-600 dark:text-slate-300"
        >
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {shown.title}
          </span>
          {` · ${names.awarded} ${hoursText(shown.awarded)} · ${names.adjusted} ${hoursText(shown.adjusted, { signed: true })}`}
        </p>
      ) : null}
      <table className="sr-only">
        <caption>{description}</caption>
        <thead>
          <tr>
            <th scope="col">Kỳ</th>
            <th scope="col">{names.awarded}</th>
            <th scope="col">{names.adjusted}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.key}>
              <th scope="row">{point.title}</th>
              <td>{hoursText(point.awarded)}</td>
              <td>{hoursText(point.adjusted, { signed: true })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
