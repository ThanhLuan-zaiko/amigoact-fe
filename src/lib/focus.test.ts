import { describe, expect, test } from "bun:test";
import { asFocus, focusClass, markerClass, pointFromClick } from "./focus";

describe("focusClass", () => {
  test("snaps to the 10% grid", () => {
    expect(focusClass({ x: 0.24, y: 0.76 })).toBe("object-[20%_80%]");
    expect(focusClass({ x: 0, y: 1 })).toBe("object-[0%_100%]");
  });

  test("falls back to the upper middle", () => {
    expect(focusClass(null)).toBe("object-[50%_30%]");
    expect(focusClass(undefined)).toBe("object-[50%_30%]");
  });

  test("clamps values outside the picture", () => {
    expect(focusClass({ x: -3, y: 9 })).toBe("object-[0%_100%]");
    expect(focusClass({ x: Number.NaN, y: 0.5 })).toBe("object-[50%_50%]");
  });
});

test("markerClass places the dot on the same grid", () => {
  expect(markerClass({ x: 0.31, y: 0.69 })).toBe("left-[30%] top-[70%]");
});

describe("pointFromClick", () => {
  const box = { left: 100, top: 50, width: 200, height: 100 };

  test("measures from the top left of the drawn picture", () => {
    expect(pointFromClick(150, 75, box)).toEqual({ x: 0.25, y: 0.25 });
  });

  test("clamps clicks on the edge", () => {
    expect(pointFromClick(0, 500, box)).toEqual({ x: 0, y: 1 });
  });

  test("ignores an empty box", () => {
    expect(pointFromClick(1, 1, { ...box, width: 0 })).toBeNull();
  });
});

test("asFocus keeps only real points", () => {
  expect(asFocus({ x: 0.2, y: 1 })).toEqual({ x: 0.2, y: 1 });
  for (const bad of [null, "0.5", { x: "1", y: 0 }, { x: 2, y: 0 }, { x: 0 }]) {
    expect(asFocus(bad)).toBeNull();
  }
});
