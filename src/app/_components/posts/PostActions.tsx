"use client";

import Link from "next/link";
import { FiEdit2, FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";
import { TbPin, TbPinnedOff } from "react-icons/tb";
import { deletePost, setHidden, setPinned } from "@/app/_actions/posts";
import { postPath } from "@/lib/posts";
import ActionButton from "../organizations/ActionButton";
import type { Post } from "../types";
import { iconButton } from "../ui";
import ConfirmAction from "./ConfirmAction";

// The controls of a post. Each one shows only when the backend says this viewer
// may use it. `inline` sits in the footer of a list card instead of its own row.
export default function PostActions({
  post,
  inline = false,
}: {
  post: Post;
  inline?: boolean;
}) {
  const { viewer } = post;
  const isDraft = post.status === "draft";
  if (
    !viewer.can_edit &&
    !viewer.can_delete &&
    !viewer.can_pin &&
    !viewer.can_hide
  ) {
    return null;
  }
  const back = isDraft ? `${postPath(post.slug)}/drafts` : postPath(post.slug);

  return (
    <div
      className={
        inline
          ? "flex items-center gap-1"
          : "flex flex-wrap items-start gap-2 border-t border-slate-200 pt-3 dark:border-slate-800"
      }
    >
      {viewer.can_edit ? (
        <Link
          href={`${postPath(post.slug, post.id)}/edit`}
          aria-label="Sửa bài"
          title="Sửa bài"
          className={iconButton}
        >
          <FiEdit2 aria-hidden="true" />
        </Link>
      ) : null}
      {viewer.can_pin ? (
        <ActionButton
          action={setPinned.bind(null, post.slug, post.id, !post.pinned)}
          label={post.pinned ? "Bỏ ghim" : "Ghim bài"}
        >
          {post.pinned ? (
            <TbPinnedOff aria-hidden="true" />
          ) : (
            <TbPin aria-hidden="true" />
          )}
        </ActionButton>
      ) : null}
      {viewer.can_hide ? (
        <ActionButton
          action={setHidden.bind(null, post.slug, post.id, !post.hidden)}
          label={post.hidden ? "Hiện lại bài" : "Ẩn khỏi bảng tin"}
        >
          {post.hidden ? (
            <FiEye aria-hidden="true" />
          ) : (
            <FiEyeOff aria-hidden="true" />
          )}
        </ActionButton>
      ) : null}
      {viewer.can_delete ? (
        <ConfirmAction
          action={deletePost.bind(null, post.slug, post.id, back)}
          label="Xóa bài"
          icon={<FiTrash2 aria-hidden="true" />}
          title={isDraft ? "Xóa bản nháp?" : "Chuyển bài vào thùng rác?"}
          confirmLabel={isDraft ? "Xóa vĩnh viễn" : "Chuyển vào thùng rác"}
        >
          {isDraft ? (
            <p>Bản nháp sẽ bị xóa vĩnh viễn và không khôi phục được.</p>
          ) : (
            <p>
              Bài sẽ ẩn khỏi bảng tin. Ban quản trị có thể khôi phục trong 30
              ngày, sau đó bài bị xóa vĩnh viễn.
            </p>
          )}
        </ConfirmAction>
      ) : null}
    </div>
  );
}
