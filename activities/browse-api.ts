import { apiFetch } from "../core/api.ts";
import type { TagRef } from "./api.ts";

// Contract of amigoact-be GET /activities/browse (see docs/EVENTS.md).
export type BrowsePhase = "upcoming" | "ongoing" | "past" | "cancelled";

export interface BrowseOrg {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  verified: boolean;
}

export interface BrowseItem {
  id: string;
  org_id: string;
  slug: string;
  title: string;
  status: string;
  phase: BrowsePhase;
  start_at: string | null;
  end_at: string | null;
  city: string | null;
  location: string | null;
  is_remote: boolean;
  hours_awarded: number;
  category_id: string | null;
  tags: TagRef[];
  excerpt: string;
  cover_url: string | null;
  max_participants: number | null;
  registered_count: number | null;
  seats_left: number | null;
  registration_deadline: string | null;
  registration_open: boolean;
  // Open now and asks nothing beyond a click: no form questions, no slots.
  quick_apply: boolean;
  org: BrowseOrg;
}

export interface MyRegistration {
  registration_id: string;
  status: string;
  registered_at: string | null;
}

export interface MineBrowseItem extends BrowseItem {
  my_registration: MyRegistration;
}

export interface CityFacet {
  city: string;
  count: number;
}

export interface StatusFacet {
  status: string;
  count: number;
}

// A catalog category with matching activities; counts follow every filter
// except its own, so the list only ever offers values that have results.
export interface CategoryFacet {
  category_id: string;
  name: string;
  count: number;
}

export interface TagFacet {
  slug: string;
  name: string;
  count: number;
}

export interface BrowseFacets {
  cities: CityFacet[];
  categories: CategoryFacet[];
  tags: TagFacet[];
}

export interface BrowsePage {
  items: BrowseItem[];
  total: number;
  truncated: boolean;
  facets: BrowseFacets;
  // Token for the next time window; set only when this window was cut.
  next_cursor: string | null;
}

export interface MineBrowsePage {
  items: MineBrowseItem[];
  total: number;
  truncated: boolean;
  facets: BrowseFacets & { my_status: StatusFacet[] };
}

// One best registration per activity, from GET /registrations/mine/brief.
export interface MyBrief {
  activity_id: string;
  registration_id: string;
  status: string;
  registered_at: string | null;
}

export type BrowseQuery = Record<string, string>;

export function fetchBrowse(query: BrowseQuery): Promise<BrowsePage> {
  return apiFetch<BrowsePage>(
    `/activities/browse?${new URLSearchParams(query)}`,
  );
}

export function fetchBrowseMine(query: BrowseQuery): Promise<MineBrowsePage> {
  return apiFetch<MineBrowsePage>(
    `/activities/browse/mine?${new URLSearchParams(query)}`,
  );
}

export function fetchMyBriefs(): Promise<MyBrief[]> {
  return apiFetch<MyBrief[]>("/registrations/mine/brief");
}

// One card for the detail page, in the feed's item shape.
export function fetchEventCard(activityId: string): Promise<BrowseItem> {
  return apiFetch<BrowseItem>(`/activities/${activityId}/card`);
}
