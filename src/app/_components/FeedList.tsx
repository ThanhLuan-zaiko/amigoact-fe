import EmptyState from "./EmptyState";
import PostCard from "./PostCard";
import type { Post } from "./types";

type FeedListProps = {
  posts: Post[];
};

export default function FeedList({ posts }: FeedListProps) {
  if (posts.length === 0) {
    return (
      <div className="py-6">
        <EmptyState
          title="Chưa có bài viết"
          description="Bài viết từ các tổ chức bạn theo dõi sẽ hiện ở đây."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
