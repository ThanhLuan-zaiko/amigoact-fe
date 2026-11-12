import EmptyState from "./EmptyState";
import PostCard from "./PostCard";
import type { Post } from "./types";

type FeedListProps = {
  posts: Post[];
  // True when the list is filtered by a tag, so the empty message says so.
  filtered?: boolean;
};

export default function FeedList({ posts, filtered = false }: FeedListProps) {
  if (posts.length === 0) {
    return filtered ? (
      <EmptyState
        title="Chưa có bài với thẻ này"
        description="Thử tab khác hoặc bỏ lọc thẻ để xem mọi bài."
      />
    ) : (
      <EmptyState
        title="Chưa có bài viết"
        description="Bài viết từ các tổ chức bạn theo dõi sẽ hiện ở đây."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
