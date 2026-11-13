// The decision behind every back arrow (see BackLink). The arrow uses the browser
// history when this tab has an earlier page, so it returns to the page the viewer came
// from. Without one (a tab opened straight on a page), it goes to its fallback address.
export function hasEarlierPage(historyLength: number): boolean {
  return historyLength > 1;
}
