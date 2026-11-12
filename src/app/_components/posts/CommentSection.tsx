import Link from "next/link";
import { FiMessageCircle } from "react-icons/fi";
import { addComment } from "@/app/_actions/comments";
import { formatDateTime } from "@/lib/activities";
import { getComments } from "@/lib/postApi";
import { mutedText, panel, sectionTitle } from "../ui";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

type CommentSectionProps = {
  slug: string;
  postId: string;
  canComment: boolean;
  signedIn: boolean;
};

// Read behind a Suspense boundary. Comments are flat and oldest first.
export default async function CommentSection({
  slug,
  postId,
  canComment,
  signedIn,
}: CommentSectionProps) {
  const page = await getComments(postId, null);
  const items = page?.items ?? [];

  return (
    <section
      aria-labelledby="comments-title"
      className={`${panel} flex flex-col gap-3 p-4 sm:p-6`}
    >
      <h2
        id="comments-title"
        className={`${sectionTitle} flex items-center gap-2`}
      >
        <FiMessageCircle aria-hidden="true" />
        Bình luận
      </h2>
      {page === null ? (
        <p className={mutedText}>Không tải được bình luận.</p>
      ) : items.length === 0 ? (
        <p className={mutedText}>Chưa có bình luận nào.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
          {items.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={{ ...comment, when: formatDateTime(comment.created_at) }}
              slug={slug}
              postId={postId}
            />
          ))}
        </ul>
      )}
      {canComment ? (
        <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
          <CommentForm action={addComment.bind(null, slug, postId)} />
        </div>
      ) : (
        <p className={mutedText}>
          {signedIn ? (
            "Chỉ thành viên của tổ chức mới bình luận được."
          ) : (
            <>
              <Link
                href={`/login?next=/org/${slug}/posts/${postId}`}
                className="font-semibold text-teal-700 hover:underline dark:text-teal-400"
              >
                Đăng nhập
              </Link>{" "}
              để bình luận.
            </>
          )}
        </p>
      )}
    </section>
  );
}
