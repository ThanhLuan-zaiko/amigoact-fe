// Structural slice shared by ActivitySummary and the browse feed items.
interface PlaceFields {
  is_remote: boolean;
  location: string | null;
  city?: string | null;
  hours_awarded: number;
}

// The online label or the venue and city, then awarded hours when there are any.
export function placeLine(activity: PlaceFields): string | null {
  const venue = [activity.location, activity.city]
    .filter((part) => Boolean(part))
    .join(", ");
  const place = activity.is_remote ? "Trực tuyến" : venue || null;
  const hours =
    activity.hours_awarded > 0 ? `${activity.hours_awarded} giờ` : null;
  const parts = [place, hours].filter((part) => Boolean(part));
  return parts.length === 0 ? null : parts.join(" · ");
}
