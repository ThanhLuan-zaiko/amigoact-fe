export const profileKeys = {
  all: ["profiles"] as const,
  mine: ["profiles", "me"] as const,
  skills: ["profiles", "skills"] as const,
  public: (userId: string) => ["profiles", "public", userId] as const,
};
