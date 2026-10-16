import type { ReactElement } from "react";
import type { PublicOrgMedia } from "../api.ts";
import { usePublicOrgMedia, usePublicPostMedia } from "../hooks.ts";
import { MediaLightbox } from "./MediaLightbox.tsx";

interface ViewerProps {
  /** Card preview items shown while the full list is still loading. */
  fallback: PublicOrgMedia[];
  index: number;
  title: string;
  onClose: () => void;
  onIndex: (index: number) => void;
}

// Mount-on-open: the query only fires while a viewer exists, then the
// full cover-first list swaps in over the card's preview tiles. Preview
// is a strict prefix of the endpoint's ordering, so the open index
// survives the swap.
export function OrgMediaViewer({
  slug,
  ...props
}: ViewerProps & { slug: string }): ReactElement {
  const media = usePublicOrgMedia(slug);
  return (
    <MediaLightbox
      items={media.data?.items ?? props.fallback}
      index={props.index}
      title={props.title}
      onClose={props.onClose}
      onIndex={props.onIndex}
    />
  );
}

export function PostMediaViewer({
  slug,
  postId,
  ...props
}: ViewerProps & { slug: string; postId: string }): ReactElement {
  const media = usePublicPostMedia(slug, postId);
  return (
    <MediaLightbox
      items={media.data?.items ?? props.fallback}
      index={props.index}
      title={props.title}
      onClose={props.onClose}
      onIndex={props.onIndex}
    />
  );
}
