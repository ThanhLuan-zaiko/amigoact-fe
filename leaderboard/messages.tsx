// Vietnamese labels for leaderboard terms (ASCII-safe module).
export function termLabel(term: string): string {
  if (term === "all") return "Tất cả thời gian";
  const match = /^(\d{4})-H([12])$/.exec(term);
  if (match) {
    return `${match[2] === "1" ? "Đầu" : "Cuối"} năm ${match[1]}`;
  }
  return term;
}
