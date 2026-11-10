"use client";

import { useActionState } from "react";
import { FiSend } from "react-icons/fi";
import { publishDraft } from "@/app/_actions/posts";
import { FormMessage } from "./account/FormParts";
import PostCard from "./PostCard";
import type { Post } from "./types";
import { primaryButton } from "./ui";

function PublishForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(publishDraft, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <FormMessage state={state} />
      <input type="hidden" name="post_id" value={postId} />
      <button
        type="submit"
        disabled={pending}
        className={`${primaryButton} w-fit disabled:opacity-50`}
      >
        <FiSend aria-hidden="true" />
        {pending ? "Đang đăng…" : "Đăng bài"}
      </button>
    </form>
  );
}

export default function DraftList({ posts }: { posts: Post[] }) {
  return (
    <div className="flex flex-col gap-3 xl:grid xl:grid-cols-2 xl:items-start">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          actions={<PublishForm postId={post.id} />}
        />
      ))}
    </div>
  );
}
