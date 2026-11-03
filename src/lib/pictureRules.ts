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

export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const GALLERY_MAX_ITEMS = 10;
export const GALLERY_ACCEPT = `${PICTURE_ACCEPT},video/mp4,video/webm`;

export function isVideo(mime: string): boolean {
  return mime.startsWith("video/");
}

// Checked in the browser first. The backend checks the real file type again.
export function galleryFileError(file: {
  type: string;
  size: number;
}): string | null {
  if (!GALLERY_ACCEPT.split(",").includes(file.type)) {
    return "Chỉ nhận ảnh JPEG, PNG, WEBP hoặc video MP4, WEBM.";
  }
  if (isVideo(file.type)) {
    return file.size > VIDEO_MAX_BYTES ? "Video tối đa 50 MB." : null;
  }
  return isPictureTooLarge(file.size) ? "Ảnh tối đa 5 MB." : null;
}
