// Shapes of the certificate API and pure helpers for the certificate pages.
// Text shown to users stays in Vietnamese.
import type { FieldErrors, FormState } from "./account";
import { failureState, type ValidationIssue } from "./forms";
import { isPlainDecimal, isPlainInteger } from "./validation";

export type CertificateStatus = "issued" | "revoked";

export const PLACEMENT_KEYS = [
  "name",
  "activity",
  "hours",
  "date",
  "serial",
] as const;

export type PlacementKey = (typeof PLACEMENT_KEYS)[number];

export type Placement = { x: number; y: number; size: number };

export type Layout = Record<PlacementKey, Placement>;

export type CertificateTemplate = {
  id: string;
  name: string;
  is_active: boolean;
  // Relative to the app, served by the /media/[id]/file route.
  background_url: string | null;
  layout: Layout;
  created_at: string;
};

// How an issued certificate looks: its template's picture and layout, without the
// template's name. Null when it was issued without a template.
export type CertificateDesign = {
  background_url: string | null;
  layout: Layout;
};

export type CertificateEntry = {
  id: string;
  user_id: string;
  full_name: string;
  serial_no: string;
  status: CertificateStatus;
  hours: number;
  issued_at: string;
};

export type ActivityCertificates = {
  items: CertificateEntry[];
  missing_count: number;
};

export type MyCertificate = {
  id: string;
  serial_no: string;
  status: CertificateStatus;
  hours: number;
  issued_at: string;
  activity_id: string;
  activity_title: string;
  organization_name: string;
  design: CertificateDesign | null;
};

export type VerifiedCertificate = {
  serial_no: string;
  status: CertificateStatus;
  full_name: string;
  hours: number;
  issued_at: string;
  revoked_at: string | null;
  activity_title: string;
  activity_start_at: string | null;
  organization_name: string;
  design: CertificateDesign | null;
};

export const CERTIFICATE_STATUS_LABELS: Record<CertificateStatus, string> = {
  issued: "Có hiệu lực",
  revoked: "Đã thu hồi",
};

export const PLACEMENT_LABELS: Record<PlacementKey, string> = {
  name: "Tên người nhận",
  activity: "Tên hoạt động",
  hours: "Số giờ",
  date: "Ngày cấp",
  serial: "Số serial",
};

// Same defaults as the backend: the name in the middle, the serial at the bottom.
export const DEFAULT_LAYOUT: Layout = {
  name: { x: 50, y: 45, size: 28 },
  activity: { x: 50, y: 55, size: 18 },
  hours: { x: 50, y: 62, size: 14 },
  date: { x: 50, y: 70, size: 12 },
  serial: { x: 50, y: 92, size: 10 },
};

export const POSITION_MESSAGE =
  "Vị trí là phần trăm từ 0 đến 100, ví dụ 50 hoặc 12.5.";
export const SIZE_MESSAGE = "Cỡ chữ là số nguyên từ 8 đến 72.";
export const TEMPLATE_NAME_MESSAGE = "Tên mẫu cần từ 2 đến 120 ký tự.";
export const LAYOUT_MESSAGE =
  "Bố cục chưa hợp lệ. Vị trí từ 0 đến 100, cỡ chữ là số nguyên từ 8 đến 72.";

export const REASON_MESSAGE = "Lý do cần từ 5 đến 1000 ký tự.";

export function reasonError(value: string): string | null {
  const reason = value.trim();
  return reason.length >= 5 && reason.length <= 1000 ? null : REASON_MESSAGE;
}

export function templateNameError(value: string): string | null {
  const name = value.trim();
  return name.length >= 2 && name.length <= 120 ? null : TEMPLATE_NAME_MESSAGE;
}

export type PlacementPart = "x" | "y" | "size";

// The form input of one value, such as "name_x" or "serial_size".
export function placementField(key: PlacementKey, part: PlacementPart): string {
  return `${key}_${part}`;
}

// Checked in the browser before submit. The backend checks the same ranges.
export function placementError(
  part: PlacementPart,
  value: string,
): string | null {
  const text = value.trim();
  if (part === "size") {
    const size = Number(text);
    return isPlainInteger(text) && size >= 8 && size <= 72
      ? null
      : SIZE_MESSAGE;
  }
  const position = Number(text);
  return isPlainDecimal(text) && position >= 0 && position <= 100
    ? null
    : POSITION_MESSAGE;
}

// Every placement input of a template form, with its message when it is wrong.
export function layoutErrors(read: (name: string) => string): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of PLACEMENT_KEYS) {
    for (const part of ["x", "y", "size"] as const) {
      const name = placementField(key, part);
      const message = placementError(part, read(name));
      if (message) {
        errors[name] = message;
      }
    }
  }
  return errors;
}

// A plain number becomes a real number. Anything else is sent as typed, so the
// backend, which takes strict numbers only, refuses it instead of guessing.
function numberInput(value: string): number | string | null {
  const text = value.trim();
  if (!text) {
    return null;
  }
  return isPlainDecimal(text) ? Number(text) : text;
}

type LayoutBody = Record<
  PlacementKey,
  Record<PlacementPart, number | string | null>
>;

export function readLayout(formData: FormData): LayoutBody {
  const read = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return Object.fromEntries(
    PLACEMENT_KEYS.map((key) => [
      key,
      {
        x: numberInput(read(placementField(key, "x"))),
        y: numberInput(read(placementField(key, "y"))),
        size: numberInput(read(placementField(key, "size"))),
      },
    ]),
  ) as LayoutBody;
}

// The background of a submitted template form. The browser has already uploaded the file.
// - An asset id replaces the picture.
// - The remove flag returns null, which clears it.
// - Neither returns undefined. JSON leaves the key out, so the picture stays as it is.
export function readBackground(formData: FormData): string | null | undefined {
  const assetId = formData.get("background_asset_id");
  if (typeof assetId === "string" && assetId !== "") {
    return assetId;
  }
  return formData.get("remove_background") === "on" ? null : undefined;
}

const CERTIFICATE_ERRORS: Record<string, string> = {
  activity_not_completed: "Chỉ cấp được chứng nhận khi hoạt động đã kết thúc.",
  certificate_not_found: "Không tìm thấy chứng nhận này.",
  certificate_template_not_found: "Không tìm thấy mẫu chứng nhận này.",
  certificate_template_inactive:
    "Mẫu này đang tắt. Hãy bật lại mẫu hoặc chọn mẫu khác.",
  certificate_not_issued: "Chỉ thu hồi được chứng nhận đang có hiệu lực.",
  certificate_not_revoked: "Chỉ hoàn tác được chứng nhận đã thu hồi.",
  conflict: "Không tạo được số serial. Vui lòng thử lại.",
};

// Backend errors of the certificate API, as form state. Issue fields come back as the
// last part of their path, so "x" of every placement looks the same: those become one
// message for the whole layout, and the inputs were already checked in the browser.
export function certificateFailure(
  code: string,
  issues: ValidationIssue[] = [],
): FormState {
  const known = CERTIFICATE_ERRORS[code];
  if (known) {
    return { error: known };
  }
  if (issues.length === 0) {
    return failureState(code, issues);
  }
  const fieldErrors: FieldErrors = {};
  for (const { field } of issues) {
    if (field === "name") {
      fieldErrors.template_name = TEMPLATE_NAME_MESSAGE;
    } else if (field === "reason") {
      fieldErrors.reason = REASON_MESSAGE;
    } else if (field === "x" || field === "y" || field === "size") {
      return { error: LAYOUT_MESSAGE };
    } else {
      return failureState(code, issues);
    }
  }
  return { fieldErrors };
}

// Typed serials may have spaces or lower case. The backend ignores case too.
export function normalizeSerial(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

// Only what the backend accepts on the path, so a crafted value goes nowhere else.
export function isSerialShape(value: string): boolean {
  return /^[A-Za-z0-9-]{5,40}$/.test(value);
}

// A4 landscape in points. The preview draws on this page, so a font size of 28
// means the same as on paper.
export const PAGE_WIDTH = 842;
export const PAGE_HEIGHT = 595;

export function pagePoint(placement: Placement): { x: number; y: number } {
  return {
    x: (placement.x / 100) * PAGE_WIDTH,
    y: (placement.y / 100) * PAGE_HEIGHT,
  };
}

// The preview reads the inputs while the user types. A value that is not a number
// yet keeps the last good one, so the text does not jump to the corner.
export function updatePlacement(
  layout: Layout,
  field: string,
  value: string,
): Layout {
  const [key, part] = field.split("_") as [PlacementKey, PlacementPart];
  if (!PLACEMENT_KEYS.includes(key) || !["x", "y", "size"].includes(part)) {
    return layout;
  }
  if (placementError(part, value)) {
    return layout;
  }
  return { ...layout, [key]: { ...layout[key], [part]: Number(value.trim()) } };
}

export function issuedMessage(count: number): string {
  return count > 0
    ? `Đã cấp ${count} chứng nhận mới.`
    : "Không có ai mới cần cấp chứng nhận.";
}

// A full date such as 10/11/2026, in Vietnam time. Paper keeps the four-digit year.
const certificateDate = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

// The five texts printed on a certificate, in the places its template gives them.
export function certificateTexts(
  certificate: VerifiedCertificate,
): Record<PlacementKey, string> {
  return {
    name: certificate.full_name,
    activity: certificate.activity_title,
    hours: `${certificate.hours} giờ tình nguyện`,
    date: certificateDate.format(new Date(certificate.issued_at)),
    serial: certificate.serial_no,
  };
}

// Only a valid certificate is drawn for printing. A revoked one shows its status only,
// so a printout cannot look valid.
export function printableDesign(
  certificate: VerifiedCertificate,
): CertificateDesign | null {
  return certificate.status === "issued" ? certificate.design : null;
}
