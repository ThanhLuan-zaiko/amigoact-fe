import "server-only";

export type PictureField = "logo" | "cover";

// Reads one picture field of a submitted organization form. The browser has already
// uploaded the files, so the form carries only asset ids.
// - "<field>_asset_id" is the picture the user marked for this role.
// - The "remove" flag returns null, which clears the picture.
// - Neither returns undefined. JSON leaves that key out, so the picture stays as it is.
export function readPicture(
  formData: FormData,
  field: PictureField,
): string | null | undefined {
  const assetId = formData.get(`${field}_asset_id`);
  if (typeof assetId === "string" && assetId !== "") {
    return assetId;
  }
  return formData.get(`remove_${field}`) === "on" ? null : undefined;
}
