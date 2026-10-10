import { apiFetch } from "../core/api.ts";

export interface ReviewItem {
  review_id: string;
  activity_id: string;
  student_id: string;
  student_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewListResponse {
  items: ReviewItem[];
  average_rating: number | null;
  count: number;
  can_review: boolean;
}

export function listReviews(
  activityId: string,
): Promise<ReviewListResponse> {
  return apiFetch<ReviewListResponse>(
    `/activities/${activityId}/reviews`,
  );
}

export function createReview(
  activityId: string,
  input: { rating: number; comment?: string | null },
): Promise<ReviewItem> {
  return apiFetch<ReviewItem>(`/activities/${activityId}/reviews`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
