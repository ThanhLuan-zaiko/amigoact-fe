import type { PublicOrg, PublicOrgDetail, PublicOrgMedia } from "./api.ts";

export function orgLocation(org: PublicOrg): string | null {
  return org.city ?? org.country;
}

// Tile order shared by the feed mosaic and the lightbox fallback list:
// the org/post cover leads, then the backend's cover-first media strip.
// Callers pass mosaicItems() output as the viewer's fallback so tile
// index N in the grid always means item N in the viewer.
export function mosaicItems(
  source: Pick<PublicOrg, "cover_url" | "media">,
): PublicOrgMedia[] {
  const items = [...source.media];
  if (
    source.cover_url !== null &&
    !items.some((item) => item.url === source.cover_url)
  ) {
    items.unshift({ url: source.cover_url, kind: "image", mime: "image/*" });
  }
  return items;
}

export type TrustState = "pass" | "fail" | "warn" | "info";

export interface TrustCheck {
  key: string;
  state: TrustState;
  noteKey?: string;
}

// The profile turns raw signals into an explainable checklist instead of
// a magic score: every verdict maps to data the visitor can verify.
export function buildTrustChecks(org: PublicOrgDetail): TrustCheck[] {
  const legalState: TrustState =
    org.legal_status === "verified"
      ? "pass"
      : org.legal_status === "pending"
        ? "warn"
        : org.legal_status === "rejected"
          ? "fail"
          : "info";
  return [
    {
      key: "platform_verified",
      state: org.verified_at !== null ? "pass" : "fail",
    },
    {
      key: "legal",
      state: legalState,
      noteKey: `legal_${org.legal_status}`,
    },
    {
      key: "activities",
      state: org.activity_count > 0 ? "pass" : "fail",
      noteKey: org.activity_count > 0 ? undefined : "activities_zero",
    },
    {
      key: "contact",
      state: org.website || org.email || org.phone ? "pass" : "fail",
      noteKey:
        org.website || org.email || org.phone ? undefined : "contact_missing",
    },
    {
      key: "address",
      state: org.address || org.city || org.country ? "pass" : "fail",
    },
    {
      key: "gallery",
      state: org.gallery.length > 0 ? "pass" : "fail",
    },
  ];
}

export function trustScore(checks: TrustCheck[]): number {
  return checks.filter((check) => check.state === "pass").length;
}
