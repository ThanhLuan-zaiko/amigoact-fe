// Responsive picture sources. The backend stores each picture at these widths and
// serves the smallest one that covers `?w=` (see the backend docs/media.md).
// Shared by the <Picture> component and the /media proxy route.

export const PICTURE_WIDTHS = [320, 640, 1080, 1600, 2400] as const;
export const MAX_PICTURE_WIDTH = 4096;

const WIDTH = /^[1-9][0-9]{0,3}$/;

// The proxy forwards only a plain whole number in range, never other query text.
export function parseWidth(raw: string | null): number | null {
  if (raw === null || !WIDTH.test(raw)) {
    return null;
  }
  const width = Number(raw);
  return width <= MAX_PICTURE_WIDTH ? width : null;
}

// Only server media paths take a width. Blob and data URLs are left as they are.
function resizable(src: string): boolean {
  return src.startsWith("/media/") && !src.includes("?");
}

export function sizedSrc(src: string, width: number): string {
  return resizable(src) ? `${src}?w=${width}` : src;
}

// Every stored width as a srcset, so the browser picks by layout width and screen density.
export function srcSetFor(src: string): string | undefined {
  if (!resizable(src)) {
    return undefined;
  }
  return PICTURE_WIDTHS.map(
    (width) => `${sizedSrc(src, width)} ${width}w`,
  ).join(", ");
}
