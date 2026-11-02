import Link from "next/link";
import { FiBell, FiMessageCircle, FiUser } from "react-icons/fi";
import { chipButton, mutedText, panel } from "./ui";

type ComposerProps = {
  postingAs?: string;
};

export default function Composer({ postingAs }: ComposerProps) {
  return (
    <section className={`${panel} flex flex-col gap-3 p-4`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300">
          <FiUser aria-hidden="true" />
        </div>
        <Link
          href="/compose"
          className="flex h-10 flex-1 items-center rounded-md border border-slate-200 px-4 text-sm text-slate-500 transition-colors hover:border-teal-700 dark:border-slate-800 dark:hover:border-teal-400"
        >
          Bạn muốn chia sẻ điều gì?
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/compose" className={chipButton}>
          <FiBell aria-hidden="true" />
          Thông báo
        </Link>
        <Link href="/compose" className={chipButton}>
          <FiMessageCircle aria-hidden="true" />
          Thảo luận
        </Link>
        <span className={`${mutedText} ml-auto`}>
          {postingAs ?? "Chưa chọn tổ chức"}
        </span>
      </div>
    </section>
  );
}
