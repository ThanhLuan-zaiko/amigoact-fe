// View models for the UI. Filled from the API once it exists.

export type PostKind = "announcement" | "discussion";

export type PostVisibility = "public" | "members";

export type JoinPolicy = "open" | "invite";

export type Post = {
  id: string;
  organizationName: string;
  organizationInitials: string;
  kind: PostKind;
  visibility: PostVisibility;
  publishedAt: string;
  title: string;
  body: string;
  tags: string[];
  commentCount: number;
  pinned?: boolean;
};

export type Activity = {
  id: string;
  title: string;
  startsAt: string;
  location: string;
  hours: number;
  registeredCount: number;
  maxParticipants: number;
};

export type Organization = {
  id: string;
  name: string;
  initials: string;
  typeLabel: string;
  joinPolicy: JoinPolicy;
  description: string;
  memberCount: number;
  activityCount: number;
  volunteerHours: number;
};
