import { useState, type ReactElement } from "react";
import { FiSend, FiStar } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { formatDateTime } from "../../activities/dates.ts";
import { useCreateReview, useReviews } from "../hooks.ts";
import { toVietnameseReviewError } from "../messages.tsx";

interface ReviewsPanelProps {
  activityId: string;
}

function Stars({ rating }: { rating: number }): ReactElement {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar
          key={n}
          className={`h-4 w-4 ${
            n <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-zinc-300 dark:text-zinc-600"
          }`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function ReviewsPanel({
  activityId,
}: ReviewsPanelProps): ReactElement {
  const reviews = useReviews(activityId);
  const create = useCreateReview(activityId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const submit = async (): Promise<void> => {
    setError("");
    try {
      await create.mutateAsync({
        rating,
        comment: comment.trim() || null,
      });
      setComment("");
      setRating(5);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? toVietnameseReviewError(err.code, err.message)
          : "Có lỗi xảy ra.",
      );
    }
  };

  const data = reviews.data;

  return (
    <div data-rise>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Đánh giá
        </h3>
        {data && data.average_rating !== null && (
          <p className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            <FiStar
              className="h-4 w-4 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
            {data.average_rating}/5 · {data.count} đánh giá
          </p>
        )}
      </div>
      {reviews.isPending && (
        <LoadingState label="Đang tải đánh giá…" />
      )}
      {reviews.isError && (
        <ErrorState
          title="Không tải được"
          message={reviews.error.message}
        />
      )}
      {data && data.items.length === 0 && (
        <EmptyState
          title="Chưa có đánh giá"
          message="Hãy là người đầu tiên đánh giá hoạt động này."
        />
      )}
      {data && data.items.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {data.items.map((row) => (
            <li
              key={row.review_id}
              className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {row.student_name}
                </p>
                <Stars rating={row.rating} />
              </div>
              {row.comment && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {row.comment}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                {formatDateTime(row.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
      {data?.can_review && (
        <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Đánh giá của bạn
          </p>
          <div
            role="group"
            aria-label="Chọn số sao"
            className="mt-2 flex gap-1"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} sao`}
                aria-pressed={rating === n}
                className="rounded-lg p-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <FiStar
                  className={`h-6 w-6 ${
                    n <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-300 dark:text-zinc-600"
                  }`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
          <TextField
            label="Nhận xét (không bắt buộc)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn…"
            className="mt-2"
          />
          <Button
            className="mt-2"
            disabled={create.isPending}
            onClick={() => void submit()}
            icon={<FiSend className="h-4 w-4" aria-hidden="true" />}
          >
            Gửi đánh giá
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
