import { getComments } from "@/lib/postApi";
import { mutedText } from "../ui";
import CommentThread from "./CommentThread";

type CommentSectionProps = {
  slug: string;
  postId: string;
  canComment: boolean;
  signedIn: boolean;
};

// The "Bình luận" tab beside a post. Reads the top-level comments behind a
// Suspense boundary; replies load when someone opens a thread.
export default async function CommentSection({
  slug,
  postId,
  canComment,
  signedIn,
}: CommentSectionProps) {
  const page = await getComments(postId, null);
  if (page === null) {
    return <p className={`${mutedText} p-4`}>Không tải được bình luận.</p>;
  }
  return (
    <section aria-label="Bình luận">
      <CommentThread
        slug={slug}
        postId={postId}
        items={page.items}
        canComment={canComment}
        signedIn={signedIn}
      />
    </section>
  );
}
