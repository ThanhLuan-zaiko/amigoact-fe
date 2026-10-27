import { useEffect } from "react";

const APP_NAME = "AmigoACT";

// Sets the document title while the calling page is mounted, then restores the
// previous title. Pages call it themselves: a parent default would be
// overwritten, because child effects run before parent effects.
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | ${APP_NAME}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
