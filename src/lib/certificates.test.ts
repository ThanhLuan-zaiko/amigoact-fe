import { describe, expect, test } from "bun:test";
import {
  certificateFailure,
  certificateTexts,
  DEFAULT_LAYOUT,
  isSerialShape,
  issuedMessage,
  LAYOUT_MESSAGE,
  layoutErrors,
  normalizeSerial,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  POSITION_MESSAGE,
  pagePoint,
  placementError,
  printableDesign,
  REASON_MESSAGE,
  readBackground,
  readLayout,
  reasonError,
  SIZE_MESSAGE,
  TEMPLATE_NAME_MESSAGE,
  templateNameError,
  updatePlacement,
  type VerifiedCertificate,
} from "./certificates";
import { isProtected } from "./protectedPaths";

function layoutForm(values: Record<string, string>): FormData {
  const form = new FormData();
  for (const [key, placement] of Object.entries(DEFAULT_LAYOUT)) {
    form.set(`${key}_x`, String(placement.x));
    form.set(`${key}_y`, String(placement.y));
    form.set(`${key}_size`, String(placement.size));
  }
  for (const [name, value] of Object.entries(values)) {
    form.set(name, value);
  }
  return form;
}

describe("placementError", () => {
  test("accepts positions from 0 to 100", () => {
    expect(placementError("x", "0")).toBeNull();
    expect(placementError("y", "100")).toBeNull();
    expect(placementError("x", "12.5")).toBeNull();
  });

  test("refuses positions outside the page or not plain numbers", () => {
    for (const value of ["-1", "100.5", "1e2", "", "abc", " "]) {
      expect(placementError("x", value)).toBe(POSITION_MESSAGE);
    }
  });

  test("takes whole font sizes from 8 to 72", () => {
    expect(placementError("size", "8")).toBeNull();
    expect(placementError("size", "72")).toBeNull();
    for (const value of ["7", "73", "12.5", "", "1e1"]) {
      expect(placementError("size", value)).toBe(SIZE_MESSAGE);
    }
  });
});

describe("layoutErrors", () => {
  test("names each wrong input", () => {
    const form = layoutForm({ name_x: "150", serial_size: "5" });
    const errors = layoutErrors((name) => String(form.get(name) ?? ""));
    expect(errors).toEqual({
      name_x: POSITION_MESSAGE,
      serial_size: SIZE_MESSAGE,
    });
  });
});

describe("readLayout", () => {
  test("sends real numbers, not strings", () => {
    const layout = readLayout(layoutForm({ name_x: "12.5" }));
    expect(layout.name).toEqual({ x: 12.5, y: 45, size: 28 });
    expect(typeof layout.serial.size).toBe("number");
  });

  test("sends what was typed when it is not a number, so the backend refuses it", () => {
    const layout = readLayout(layoutForm({ hours_y: "5abc", date_x: "" }));
    expect(layout.hours.y).toBe("5abc");
    expect(layout.date.x).toBeNull();
  });
});

describe("readBackground", () => {
  test("an uploaded picture wins", () => {
    const form = new FormData();
    form.set("background_asset_id", "abc");
    form.set("remove_background", "on");
    expect(readBackground(form)).toBe("abc");
  });

  test("the remove flag clears it, and nothing keeps it", () => {
    const form = new FormData();
    form.set("remove_background", "on");
    expect(readBackground(form)).toBeNull();
    expect(readBackground(new FormData())).toBeUndefined();
  });
});

describe("updatePlacement", () => {
  test("moves the text while the user types", () => {
    const next = updatePlacement(DEFAULT_LAYOUT, "name_x", "20");
    expect(next.name.x).toBe(20);
    expect(DEFAULT_LAYOUT.name.x).toBe(50);
  });

  test("keeps the last good value for unfinished input and other fields", () => {
    expect(updatePlacement(DEFAULT_LAYOUT, "name_x", "2a")).toBe(
      DEFAULT_LAYOUT,
    );
    expect(updatePlacement(DEFAULT_LAYOUT, "template_name", "50")).toBe(
      DEFAULT_LAYOUT,
    );
  });
});

describe("pagePoint", () => {
  test("turns percentages into points on an A4 landscape page", () => {
    expect(pagePoint({ x: 50, y: 50, size: 10 })).toEqual({
      x: PAGE_WIDTH / 2,
      y: PAGE_HEIGHT / 2,
    });
    expect(pagePoint({ x: 0, y: 100, size: 10 })).toEqual({
      x: 0,
      y: PAGE_HEIGHT,
    });
  });
});

describe("certificateFailure", () => {
  test("translates certificate codes", () => {
    expect(certificateFailure("activity_not_completed").error).toContain(
      "đã kết thúc",
    );
    expect(certificateFailure("certificate_template_inactive").error).toContain(
      "đang tắt",
    );
  });

  test("puts the template name error on its input", () => {
    expect(
      certificateFailure("validation_error", [
        { field: "name", type: "string_too_short" },
      ]),
    ).toEqual({ fieldErrors: { template_name: TEMPLATE_NAME_MESSAGE } });
  });

  test("a placement error becomes one layout message", () => {
    expect(
      certificateFailure("validation_error", [
        { field: "x", type: "float_type" },
      ]),
    ).toEqual({ error: LAYOUT_MESSAGE });
  });

  test("falls back to the shared messages", () => {
    expect(certificateFailure("media_not_found").error).toContain("ảnh");
  });
});

describe("text checks", () => {
  test("template names are 2 to 120 characters", () => {
    expect(templateNameError("Mẫu A")).toBeNull();
    expect(templateNameError(" a ")).toBe(TEMPLATE_NAME_MESSAGE);
    expect(templateNameError("a".repeat(121))).toBe(TEMPLATE_NAME_MESSAGE);
  });

  test("a revoke reason has at least 5 characters", () => {
    expect(reasonError("Gian lận điểm danh")).toBeNull();
    expect(reasonError("  abc  ")).toBe(REASON_MESSAGE);
  });
});

describe("serials", () => {
  test("typed serials lose spaces and case", () => {
    expect(normalizeSerial(" amg-abcd-efgh-2345 ")).toBe("AMG-ABCD-EFGH-2345");
    expect(normalizeSerial("AMG - ABCD")).toBe("AMG-ABCD");
  });

  test("only the shape the backend accepts goes to it", () => {
    expect(isSerialShape("AMG-ABCD-EFGH-2345")).toBe(true);
    expect(isSerialShape("AMG")).toBe(false);
    expect(isSerialShape("../admin")).toBe(false);
  });
});

describe("issuedMessage", () => {
  test("says how many were issued", () => {
    expect(issuedMessage(3)).toBe("Đã cấp 3 chứng nhận mới.");
    expect(issuedMessage(0)).toContain("Không có ai");
  });
});

describe("certificate pages and login", () => {
  test("templates and my certificates need a login", () => {
    expect(isProtected("/certificates")).toBe(true);
    expect(isProtected("/organizations/abc/certificates")).toBe(true);
    expect(isProtected("/organizations/abc/certificates/new")).toBe(true);
  });

  test("the verify pages stay public", () => {
    expect(isProtected("/certificates/verify")).toBe(false);
    expect(isProtected("/certificates/verify/AMG-ABCD-EFGH-2345")).toBe(false);
    expect(isProtected("/certificates/verify/AMG-ABCD-EFGH-2345/pdf")).toBe(
      false,
    );
  });
});

function verified(
  fields: Partial<VerifiedCertificate> = {},
): VerifiedCertificate {
  return {
    serial_no: "AMG-ABCD-EFGH-2345",
    status: "issued",
    full_name: "Nguyễn Văn A",
    hours: 4.5,
    issued_at: "2026-11-10T03:00:00Z",
    revoked_at: null,
    activity_title: "Dọn rác bãi biển",
    activity_start_at: null,
    organization_name: "CLB Xanh",
    design: { background_url: "/media/x/file", layout: DEFAULT_LAYOUT },
    ...fields,
  };
}

describe("certificateTexts", () => {
  test("fills the five places with the real certificate", () => {
    const texts = certificateTexts(verified());
    expect(texts.name).toBe("Nguyễn Văn A");
    expect(texts.activity).toBe("Dọn rác bãi biển");
    expect(texts.hours).toBe("4.5 giờ tình nguyện");
    expect(texts.serial).toBe("AMG-ABCD-EFGH-2345");
    expect(texts.date).toBe("10/11/2026");
  });
});

describe("printableDesign", () => {
  test("a valid certificate is drawn with its template", () => {
    expect(printableDesign(verified())?.background_url).toBe("/media/x/file");
  });

  test("a revoked certificate is never drawn, so a printout cannot look valid", () => {
    expect(printableDesign(verified({ status: "revoked" }))).toBeNull();
  });

  test("a certificate without a template has nothing to draw", () => {
    expect(printableDesign(verified({ design: null }))).toBeNull();
  });
});
