import { describe, expect, test } from "bun:test";
import {
  assignableRoles,
  hasModule,
  hasPermission,
  MODULES,
  movedOrder,
  PRESETS,
  permissionLabel,
  ROLE_COLORS,
  type RoleInfo,
  roleDot,
  summarize,
} from "./roles";

function role(id: string, below: boolean): RoleInfo {
  return {
    id,
    name: id,
    color: "",
    position: 1,
    permissions: [],
    member_count: 0,
    below_you: below,
  };
}

const ALL_CODES = MODULES.flatMap((module) =>
  module.permissions.map((permission) => permission.code),
);

describe("hasPermission and hasModule", () => {
  test("a listed permission is held, and only that one", () => {
    const viewer = { permissions: ["activities.create"] };
    expect(hasPermission(viewer, "activities.create")).toBe(true);
    expect(hasPermission(viewer, "activities.delete")).toBe(false);
    expect(hasModule(viewer, "activities")).toBe(true);
    expect(hasModule(viewer, "posts")).toBe(false);
  });

  test("administrator holds everything", () => {
    const viewer = { permissions: ["administrator"] };
    expect(hasPermission(viewer, "roles.delete")).toBe(true);
    expect(hasModule(viewer, "posts")).toBe(true);
  });

  test("a plain member holds nothing", () => {
    expect(hasPermission({ permissions: [] }, "posts.pin")).toBe(false);
    expect(hasModule({ permissions: [] }, "posts")).toBe(false);
  });
});

describe("movedOrder", () => {
  const roles = [role("top", false), role("a", true), role("b", true)];

  test("swaps with the neighbour among movable roles", () => {
    expect(movedOrder(roles, "b", "up")).toEqual(["b", "a"]);
    expect(movedOrder(roles, "a", "down")).toEqual(["b", "a"]);
  });

  test("returns null at the ends and for roles that cannot move", () => {
    expect(movedOrder(roles, "a", "up")).toBeNull();
    expect(movedOrder(roles, "b", "down")).toBeNull();
    expect(movedOrder(roles, "top", "down")).toBeNull();
    expect(movedOrder(roles, "missing", "up")).toBeNull();
  });

  test("only roles below the viewer are assignable", () => {
    expect(assignableRoles(roles)).toHaveLength(2);
  });
});

describe("catalog", () => {
  test("every code is module.action with a label and a hint", () => {
    for (const module of MODULES) {
      for (const item of module.permissions) {
        expect(item.code).toContain(".");
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.hint.length).toBeGreaterThan(0);
      }
    }
    expect(new Set(ALL_CODES).size).toBe(ALL_CODES.length);
  });

  test("every preset uses only known codes", () => {
    for (const preset of PRESETS) {
      for (const code of preset.codes) {
        expect(ALL_CODES).toContain(code);
      }
    }
  });

  test("the staff preset leaves out role management, the full preset has all", () => {
    const staff = PRESETS.find((preset) => preset.id === "staff");
    const full = PRESETS.find((preset) => preset.id === "all");
    expect(staff?.codes.some((code) => code.startsWith("roles."))).toBe(false);
    expect(full?.codes).toHaveLength(ALL_CODES.length);
  });

  test("a role can hold create without update or delete", () => {
    expect(summarize(["activities.create"])).toEqual([
      { module: "Hoạt động", actions: ["Tạo"] },
    ]);
  });

  test("summarize lists administrator first and skips empty modules", () => {
    const lines = summarize(["administrator", "posts.pin", "posts.moderate"]);
    expect(lines[0].module).toBe("Tất cả");
    expect(lines[1]).toEqual({
      module: "Bài viết",
      actions: ["Ghim", "Kiểm duyệt"],
    });
    expect(summarize([])).toEqual([]);
  });

  test("labels name the module, and an unknown code shows itself", () => {
    expect(permissionLabel("posts.pin")).toBe("Bài viết: Ghim");
    expect(permissionLabel("future.code")).toBe("future.code");
  });

  test("an unknown color falls back to the default dot", () => {
    expect(roleDot("#14B8A6")).toBe("bg-teal-500");
    expect(roleDot("#123456")).toBe(ROLE_COLORS[0].dot);
  });
});
