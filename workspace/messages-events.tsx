// Realtime toast copy for the board; Vietnamese lives in .tsx only.

// Toast copy for board events pushed on posts:{orgId} by other actors.
// Returns null for actions with no toast (still invalidate queries).
export function postEventToast(
  action: string,
  actorName: string | null,
): string | null {
  const actor = actorName ?? "Một thành viên";
  switch (action) {
    case "post.created":
      return `${actor} vừa đăng bài mới.`;
    case "post.updated":
      return `${actor} vừa chỉnh sửa bài viết.`;
    case "post.deleted":
      return `${actor} vừa xóa một bài viết.`;
    case "post.pinned":
      return `${actor} vừa ghim một bài viết.`;
    case "post.unpinned":
      return `${actor} vừa bỏ ghim một bài viết.`;
    case "post.unpublished":
      return `${actor} vừa gỡ một bài viết khỏi bảng tin.`;
    case "post.restored":
      return `${actor} vừa khôi phục một bài viết.`;
    case "post.purged":
      return `${actor} vừa xóa vĩnh viễn một bài viết.`;
    default:
      return null;
  }
}
