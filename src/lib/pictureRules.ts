// Rules for uploaded pictures. Shared by the form (client) and the picture route (server).
// They mirror the backend: JPEG, PNG or WEBP, at most 5 MB, sent as a UUIDv7 asset id.

export const PICTURE_MAX_BYTES = 5 * 1024 * 1024;

export const PICTURE_ACCEPT = "image/jpeg,image/png,image/webp";

const PICTURE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Only ids of this shape are proxied, so a crafted path cannot reach other backend routes.
export function isPictureId(value: string): boolean {
  return PICTURE_ID.test(value);
}

// Checked in the browser before upload, so the user sees the error next to the field.
export function isPictureTooLarge(size: number): boolean {
  return size > PICTURE_MAX_BYTES;
}
