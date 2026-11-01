import Link from "next/link";
import { FiBell, FiMessageCircle, FiUser } from "react-icons/fi";
import { chipButton, mutedText } from "./ui";

type ComposerProps = {
  postingAs?: string;
};

export default function Composer({ postingAs }: ComposerProps) {
  return (
    <section className="flex flex-col gap-3 border-b border-slate-200 py-4 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400">
          <FiUser aria-hidden="true" />
        </div>
        <Link
          href="/compose"
          className="flex h-10 flex-1 items-center border border-slate-200 px-4 text-sm text-slate-500 hover:border-teal-700 dark:border-slate-800 dark:hover:border-teal-400"
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
