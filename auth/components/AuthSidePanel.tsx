import type { ReactElement } from "react";
import {
  FiActivity,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiMail,
  FiUsers,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { useRiseIn } from "../../core/motion.ts";

interface Benefit {
  Icon: IconType;
  title: string;
  body: string;
}

const LOGIN_BENEFITS: Benefit[] = [
  {
    Icon: FiCalendar,
    title: "Khám phá sự kiện phù hợp",
    body: "Lịch tình nguyện, chiến dịch và hoạt động ngoại khóa quanh bạn.",
  },
  {
    Icon: FiUsers,
    title: "Kết nối tổ chức, câu lạc bộ",
    body: "Tham gia đội nhóm và theo dõi hành trình đóng góp của mình.",
  },
  {
    Icon: FiAward,
    title: "Ghi nhận giờ và chứng chỉ",
    body: "Điểm danh QR, tích lũy giờ tình nguyện và nhận vinh danh.",
  },
];

const REGISTER_STEPS: Benefit[] = [
  {
    Icon: FiActivity,
    title: "Tạo tài khoản",
    body: "Chỉ cần email, số điện thoại và họ tên của bạn.",
  },
  {
    Icon: FiMail,
    title: "Xác minh email",
    body: "Nhập mã 6 số được gửi tới hộp thư để kích hoạt.",
  },
  {
    Icon: FiCheckCircle,
    title: "Tham gia sự kiện",
    body: "Đăng ký hoạt động và bắt đầu tích lũy giờ ngay.",
  },
];

export function AuthSidePanel({
  variant,
}: {
  variant: "login" | "register";
}): ReactElement {
  const scope = useRiseIn<HTMLDivElement>();
  const isLogin = variant === "login";
  const items = isLogin ? LOGIN_BENEFITS : REGISTER_STEPS;
  return (
    <BentoCard className="order-2 w-full self-start border-brand/40 bg-brand/10 md:col-span-6 lg:order-1 lg:col-span-7 lg:sticky lg:top-20 dark:border-brand/30 dark:bg-brand/10">
      <div ref={scope} className="flex flex-col justify-start gap-5 p-2 sm:p-4">
        <div data-rise className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand bg-brand text-zinc-950 dark:border-brand dark:bg-brand dark:text-zinc-950">
            <FiActivity className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            AmigoACT
          </span>
        </div>
        <h2
          data-rise
          className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100"
        >
          {isLogin
            ? "Một tài khoản, mọi hoạt động tình nguyện."
            : "Bắt đầu hành trình tình nguyện trong 1 phút."}
        </h2>
        <ul className="flex flex-col gap-4">
          {items.map(({ Icon, title, body }) => (
            <li key={title} data-rise className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand bg-brand text-zinc-950 dark:border-brand dark:bg-brand dark:text-zinc-950">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {title}
                </span>
                <span className="block text-sm text-zinc-600 dark:text-zinc-400">
                  {body}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </BentoCard>
  );
}
