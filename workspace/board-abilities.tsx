// What the viewer may do on one org's board, derived from the
// viewer_permissions the board endpoints return (the owner gets them all).
export interface BoardAbilities {
  create: boolean;
  publish: boolean;
  announce: boolean;
  pin: boolean;
  editAny: boolean;
  deleteAny: boolean;
  comment: boolean;
  deleteComment: boolean;
}

export const NO_ABILITIES: BoardAbilities = {
  create: false,
  publish: false,
  announce: false,
  pin: false,
  editAny: false,
  deleteAny: false,
  comment: false,
  deleteComment: false,
};

// Why publishing is unavailable, or undefined when it is allowed. Announcements
// and public posts also need post:announce on top of post:publish.
export function publishBlockReason(
  abilities: BoardAbilities,
  post: { kind: string; visibility: string },
): string | undefined {
  if (!abilities.publish) return "Bạn chưa có quyền đăng bài";
  const needsAnnounce =
    post.kind === "announcement" || post.visibility === "public";
  return needsAnnounce && !abilities.announce
    ? "Chỉ quản lý mới đăng được bài công khai"
    : undefined;
}

export function boardAbilities(permissions: readonly string[]): BoardAbilities {
  const has = (code: string) => permissions.includes(code);
  return {
    create: has("post:create"),
    publish: has("post:publish"),
    announce: has("post:announce"),
    pin: has("post:manage"),
    editAny: has("post:edit-any"),
    deleteAny: has("post:delete-any"),
    comment: has("comment:create"),
    deleteComment: has("comment:delete-any"),
  };
}
