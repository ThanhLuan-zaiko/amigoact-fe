import {
  type Layout,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  PLACEMENT_KEYS,
  type PlacementKey,
  pagePoint,
} from "@/lib/certificates";

const SAMPLE_TEXT: Record<PlacementKey, string> = {
  name: "Nguyễn Văn A",
  activity: "Tên hoạt động",
  hours: "12 giờ tình nguyện",
  date: "10/11/2026",
  serial: "AMG-XXXX-XXXX-XXXX",
};

type CertificatePreviewProps = {
  layout: Layout;
  backgroundUrl: string | null;
  label: string;
  // The real texts of an issued certificate. Without them, sample texts are shown.
  texts?: Record<PlacementKey, string>;
};

// The certificate page drawn as SVG, so each text sits at its x/y percentage without
// inline styles. The page is A4 landscape in points, so font sizes match the printout.
// The paper stays white in dark mode, because it shows what gets printed.
export default function CertificatePreview({
  layout,
  backgroundUrl,
  label,
  texts = SAMPLE_TEXT,
}: CertificatePreviewProps) {
  return (
    <svg
      viewBox={`0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}`}
      role="img"
      aria-label={label}
      className="h-auto w-full rounded-lg border border-slate-200 bg-white print:rounded-none print:border-0 dark:border-slate-800"
    >
      <rect width={PAGE_WIDTH} height={PAGE_HEIGHT} className="fill-white" />
      {backgroundUrl ? (
        <image
          href={backgroundUrl}
          width={PAGE_WIDTH}
          height={PAGE_HEIGHT}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : null}
      {PLACEMENT_KEYS.map((key) => {
        const placement = layout[key];
        const point = pagePoint(placement);
        return (
          <text
            key={key}
            x={point.x}
            y={point.y}
            fontSize={placement.size}
            textAnchor="middle"
            dominantBaseline="middle"
            className={
              key === "name"
                ? "fill-slate-900 font-bold"
                : "fill-slate-700 font-medium"
            }
          >
            {texts[key]}
          </text>
        );
      })}
    </svg>
  );
}
