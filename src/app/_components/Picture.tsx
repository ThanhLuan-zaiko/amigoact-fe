import { sizedSrc, srcSetFor } from "@/lib/pictureSizes";

// A server picture with every stored width in srcset. `sizes` tells the browser how
// wide the picture is drawn, so it fetches a sharp copy for the screen density
// without downloading the full original. Blob and data URLs render as they are.
//
// With a placeholder, a tiny blurred copy fills the frame until the real picture
// covers it. Width and height are the natural size, so the browser keeps the right
// shape before anything loads.
export default function Picture({
  src,
  sizes,
  className = "",
  frameClassName = "",
  placeholder,
  width,
  height,
  eager = false,
}: {
  src: string;
  sizes: string;
  className?: string;
  frameClassName?: string;
  placeholder?: string | null;
  width?: number | null;
  height?: number | null;
  eager?: boolean;
}) {
  const image = (
    // biome-ignore lint/performance/noImgElement: served by the media route with its own srcset.
    <img
      src={sizedSrc(src, 1080)}
      srcSet={srcSetFor(src)}
      sizes={srcSetFor(src) ? sizes : undefined}
      alt=""
      width={width ?? undefined}
      height={height ?? undefined}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={placeholder ? `relative ${className}` : className}
    />
  );
  if (!placeholder) {
    return image;
  }
  return (
    <span className={`relative block overflow-hidden ${frameClassName}`}>
      {/* biome-ignore lint/performance/noImgElement: a data URI under 1 KB. */}
      <img
        src={placeholder}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
      />
      {image}
    </span>
  );
}
