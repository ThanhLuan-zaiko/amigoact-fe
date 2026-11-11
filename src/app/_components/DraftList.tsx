"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FiEdit2, FiSend, FiTrash2 } from "react-icons/fi";
import { deletePost, publishDraft } from "@/app/_actions/posts";
import { postPath } from "@/lib/posts";
import { FormMessage } from "./account/FormParts";
import PostCard from "./PostCard";
import ConfirmAction from "./posts/ConfirmAction";
import type { Post } from "./types";
import { iconButton, primaryButton } from "./ui";

function DraftActions({ post, back }: { post: Post; back: string }) {
  const [state, action, pending] = useActionState(publishDraft, {});
  return (
    <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
      <FormMessage state={state} />
      <div className="flex flex-wrap items-center gap-2">
        <form action={action}>
          <input type="hidden" name="post_id" value={post.id} />
          <input type="hidden" name="org_slug" value={post.slug} />
          <button
            type="submit"
            disabled={pending}
            className={`${primaryButton} disabled:opacity-50`}
          >
            <FiSend aria-hidden="true" />
            {pending ? "Đang đăng…" : "Đăng bài"}
          </button>
        </form>
        <Link
          href={`${postPath(post.slug, post.id)}/edit`}
          aria-label="Sửa bản nháp"
          title="Sửa bản nháp"
          className={iconButton}
        >
          <FiEdit2 aria-hidden="true" />
        </Link>
        <ConfirmAction
          action={deletePost.bind(null, post.slug, post.id, back)}
          label="Xóa bản nháp"
          icon={<FiTrash2 aria-hidden="true" />}
          title="Xóa bản nháp?"
          confirmLabel="Xóa vĩnh viễn"
        >
          <p>
            Bản nháp &quot;{post.title}&quot; sẽ bị xóa vĩnh viễn và không khôi
            phục được.
          </p>
        </ConfirmAction>
      </div>
    </div>
  );
}

// `back` is where a delete returns to: the global drafts page or one organization's.
export default function DraftList({
  posts,
  back,
}: {
  posts: Post[];
  back: string;
}) {
  return (
    <div className="flex flex-col gap-3 xl:grid xl:grid-cols-2 xl:items-start">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          actions={<DraftActions post={post} back={back} />}
        />
      ))}
    </div>
  );
}
