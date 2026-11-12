// Pictures uploaded in the organization form but not marked as logo or cover
// go to the gallery, together with files added in the gallery field itself.
// The result keeps the upload order and lists each file once.
export function galleryIds(formData: FormData): string[] {
  const picked = new Set(
    ["logo_asset_id", "cover_asset_id"].map((key) => formData.get(key)),
  );
  const ids = [
    ...formData.getAll("gallery_asset_id"),
    ...formData.getAll("extra_picture_id"),
  ]
    .filter((value): value is string => typeof value === "string")
    .filter((value) => value !== "" && !picked.has(value));
  return [...new Set(ids)];
}
