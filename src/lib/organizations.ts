// Shapes of the organization API responses, with their labels for the UI.

import type { CardPicture, Focus } from "./focus";
import type { RoleBadge } from "./roles";
import { dateFormat } from "./timeZone";
import type { VideoInfo } from "./video";

export type OrgRole = "owner" | "admin" | "member";
export type OrgType = "organization" | "club" | "group" | "business";
export type JoinPolicy = "open" | "invite";

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  org_type: OrgType;
  join_policy: JoinPolicy;
  member_count: number;
  created_at: string;
  // Served by the frontend at the same path (see app/media), or null.
  logo_url: string | null;
  cover_url: string | null;
  // Spots that crops of the logo and cover keep in view, or null.
  logo_focus?: Focus | null;
  cover_focus?: Focus | null;
  // The public directory only: pictures from the newest public posts.
  post_pictures?: CardPicture[];
};

export type OrganizationPage = {
  items: OrganizationSummary[];
  next_offset: number | null;
  total: number;
};

export type ViewerMembership = {
  status: string | null;
  role: OrgRole | null;
  can_manage: boolean;
  // Permission codes held. The owner holds all of them.
  permissions: string[];
  reapply_after: string | null;
};

export type LegalStatus = "none" | "pending" | "verified";

export type OrganizationDetail = OrganizationSummary & {
  // False when the owner or an admin hid the organization from the public directory.
  listed_publicly: boolean;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  legal_name: string | null;
  tax_code: string | null;
  license_number: string | null;
  legal_rep_name: string | null;
  legal_rep_position: string | null;
  legal_status: LegalStatus;
  // Served by the frontend at the same path (see app/media), or null.
  logo_url: string | null;
  cover_url: string | null;
  owner_name: string;
  activity_count: number;
  // Published activities not completed or cancelled yet. A delete is refused while any exist.
  open_activity_count: number;
  volunteer_hours: number;
  viewer: ViewerMembership;
};

// An organization in the owner's trash. slug is the one it had before the delete.
export type DeletedOrganization = {
  id: string;
  name: string;
  slug: string | null;
  deleted_at: string | null;
};

export type MyOrganization = OrganizationSummary & {
  status: string;
  role: OrgRole | null;
};

export type MemberInfo = {
  user_id: string;
  full_name: string;
  role: OrgRole;
  roles: RoleBadge[];
  joined_at: string | null;
};

export type MemberPage = {
  items: MemberInfo[];
  next_offset: number | null;
  total: number;
};

export type ApplicationInfo = {
  user_id: string;
  full_name: string;
  message: string | null;
  submitted_at: string | null;
};

export type ApplicationPage = {
  items: ApplicationInfo[];
  next_offset: number | null;
  total: number;
};

export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  organization: "Tổ chức",
  club: "Câu lạc bộ",
  group: "Nhóm",
  business: "Doanh nghiệp",
};

export const JOIN_POLICY_LABELS: Record<JoinPolicy, string> = {
  open: "Mở tham gia",
  invite: "Cần duyệt",
};

export const LEGAL_STATUS_LABELS: Record<LegalStatus, string> = {
  none: "Chưa xác minh",
  pending: "Đang chờ xác minh",
  verified: "Đã xác minh",
};

export const ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Chủ sở hữu",
  admin: "Quản trị viên",
  member: "Thành viên",
};

const DATE: Intl.DateTimeFormatOptions = { dateStyle: "short" };
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// A day such as 16/11/2026 on the viewer's clock (the device zone when timeZone
// is left out). A plain date such as "2026-11-20" names a calendar day, not a
// moment, so it is written as it is in every zone.
export function formatDate(value: string | null, timeZone?: string): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const zone = DATE_ONLY.test(value) ? "UTC" : timeZone;
  return dateFormat("vi-VN", DATE, zone).format(date);
}

// Up to two letters from the first two words, for the placeholder logo and avatars.
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
}

export { pageOffset } from "./pagination";

export const MAX_OWNED_ORGANIZATIONS = 5;

export type GalleryItem = {
  id: string;
  url: string;
  mime: string;
  focus?: Focus | null;
  video?: VideoInfo | null;
};
