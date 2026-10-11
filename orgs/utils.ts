import type { PublicOrg, PublicOrgDetail } from "./api.ts";

export interface DirectorySplit {
  spotlight: PublicOrg | null;
  rail: PublicOrg[];
  rest: PublicOrg[];
}

// One page splits into a featured tile, a compact "newest" rail and the
// remaining mosaic cards so the grid keeps an asymmetric rhythm.
export function splitDirectory(
  items: PublicOrg[],
  railSize = 4,
): DirectorySplit {
  return {
    spotlight: items[0] ?? null,
    rail: items.slice(1, 1 + railSize),
    rest: items.slice(1 + railSize),
  };
}

export function orgLocation(org: PublicOrg): string | null {
  return org.city ?? org.country;
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
