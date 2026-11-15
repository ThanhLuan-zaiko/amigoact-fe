import { describe, expect, test } from "bun:test";
import {
  barLength,
  columnLayout,
  indexAt,
  labelStride,
  niceScale,
  niceStep,
  plotBox,
  SEGMENT_GAP,
  stackExtent,
} from "./chartGeometry";

const PLOT = plotBox(240, 120, { top: 10, right: 0, bottom: 10, left: 40 });

describe("scales", () => {
  test("steps are 1, 2 or 5 times a power of ten", () => {
    expect(niceStep(0.3)).toBe(0.5);
    expect(niceStep(1.4)).toBe(2);
    expect(niceStep(7)).toBe(10);
    expect(niceStep(0)).toBe(1);
  });

  test("the axis holds zero and ends on whole steps", () => {
    expect(niceScale(0, 9)).toEqual({
      min: 0,
      max: 10,
      step: 5,
      ticks: [0, 5, 10],
    });
    expect(niceScale(-1.5, 4).min).toBe(-2);
  });

  test("an empty chart still has an axis", () => {
    const scale = niceScale(0, 0);
    expect(scale.max).toBeGreaterThan(scale.min);
  });

  test("the extent includes adjustments on both sides", () => {
    expect(
      stackExtent([
        { awarded: 4, adjusted: 1 },
        { awarded: 2, adjusted: -3 },
      ]),
    ).toEqual([-3, 5]);
  });
});

describe("columnLayout", () => {
  const scale = niceScale(-2, 8, 5);

  test("awarded hours rise from zero", () => {
    const [column] = columnLayout([{ awarded: 4, adjusted: 0 }], scale, PLOT);
    expect(column.awarded.height).toBeCloseTo(40);
    expect(column.awarded.y + column.awarded.height).toBeCloseTo(90);
    expect(column.adjusted.height).toBe(0);
  });

  test("a positive adjustment sits on top after a gap", () => {
    const [column] = columnLayout([{ awarded: 4, adjusted: 2 }], scale, PLOT);
    const adjustedBottom = column.adjusted.y + column.adjusted.height;
    expect(column.awarded.y - adjustedBottom).toBeCloseTo(SEGMENT_GAP);
  });

  test("a negative adjustment hangs below zero", () => {
    const [column] = columnLayout([{ awarded: 4, adjusted: -2 }], scale, PLOT);
    expect(column.adjusted.y).toBeCloseTo(90);
    expect(column.adjusted.height).toBeCloseTo(20);
  });

  test("columns stay narrow and centered in their slot", () => {
    const columns = columnLayout(
      [
        { awarded: 1, adjusted: 0 },
        { awarded: 1, adjusted: 0 },
      ],
      scale,
      PLOT,
    );
    expect(columns[0].awarded.width).toBe(28);
    expect(columns[0].center).toBeCloseTo(90);
    expect(columns[1].center).toBeCloseTo(190);
  });
});

describe("interaction helpers", () => {
  test("labels thin out on narrow plots", () => {
    expect(labelStride(12, 600, 40)).toBe(1);
    expect(labelStride(52, 300, 40)).toBe(8);
    expect(labelStride(0, 300, 40)).toBe(1);
  });

  test("the pointer maps to a column", () => {
    expect(indexAt(39, 4, PLOT)).toBeNull();
    expect(indexAt(40, 4, PLOT)).toBe(0);
    expect(indexAt(239, 4, PLOT)).toBe(3);
    expect(indexAt(100, 0, PLOT)).toBeNull();
  });

  test("small bars stay visible and empty ones vanish", () => {
    expect(barLength(5, 10, 200)).toBe(100);
    expect(barLength(0.001, 10, 200)).toBe(2);
    expect(barLength(0, 10, 200)).toBe(0);
    expect(barLength(-1, 10, 200)).toBe(0);
  });
});
