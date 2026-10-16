import { apiFetch, apiUpload } from "../core/api.ts";

export interface ActivityMediaItem {
  asset_id: string;
  position: number;
  role: string;
  caption: string | null;
  file_url: string;
  mime: string;
  kind: string;
  size_bytes: number;
  original_name: string | null;
}

export interface ActivityMediaPatch {
  caption?: string | null;
  role?: "cover" | "gallery" | "document";
}

export function listActivityMedia(
  activityId: string,
): Promise<ActivityMediaItem[]> {
  return apiFetch<ActivityMediaItem[]>(`/activities/${activityId}/media`);
}

export function uploadActivityMedia(
  activityId: string,
  file: File,
  caption?: string,
  role?: string,
): Promise<ActivityMediaItem> {
  const form = new FormData();
  form.append("file", file);
  if (caption) form.append("caption", caption);
  if (role) form.append("role", role);
  return apiUpload<ActivityMediaItem>(
    `/activities/${activityId}/media`,
    form,
  );
}

export function updateActivityMedia(
  activityId: string,
  assetId: string,
  patch: ActivityMediaPatch,
): Promise<ActivityMediaItem> {
  return apiFetch<ActivityMediaItem>(
    `/activities/${activityId}/media/${assetId}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );
}

export function deleteActivityMedia(
  activityId: string,
  assetId: string,
): Promise<void> {
  return apiFetch<void>(`/activities/${activityId}/media/${assetId}`, {
    method: "DELETE",
  });
}
