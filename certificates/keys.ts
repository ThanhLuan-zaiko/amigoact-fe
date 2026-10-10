export const certificateKeys = {
  all: ["certificates"] as const,
  mine: () => [...certificateKeys.all, "mine"] as const,
};
