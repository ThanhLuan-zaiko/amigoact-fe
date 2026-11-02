import Image from "next/image";
import QRCode from "qrcode";

const SIZE = 192;

type SessionQrProps = {
  url: string;
};

// Rendered on the server, so the browser gets a picture and no QR library.
export default async function SessionQr({ url }: SessionQrProps) {
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
  });
  return (
    <Image
      src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
      alt="Mã QR điểm danh"
      width={SIZE}
      height={SIZE}
      unoptimized
      className="rounded-md border border-slate-200 dark:border-slate-800"
    />
  );
}
