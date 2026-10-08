import type { ReactElement } from "react";
import {
  FiCheckCircle,
  FiHash,
  FiKey,
  FiRefreshCw,
  FiShield,
  FiSmartphone,
  FiType,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { useRiseIn } from "../../core/motion.ts";

interface Benefit {
  Icon: IconType;
  title: string;
  body: string;
}

const PROFILE_BENEFITS: Benefit[] = [
  {
    Icon: FiCheckCircle,
    title: "Xác minh email",
    body: "Hoàn tất xác minh để mở khóa đầy đủ tính năng.",
  },
  {
    Icon: FiSmartphone,
    title: "Quản lý phiên đăng nhập",
    body: "Dùng máy lạ thì đăng xuất khỏi mọi thiết bị.",
  },
  {
    Icon: FiKey,
    title: "Mật khẩu riêng, khó đoán",
    body: "Đổi mật khẩu định kỳ và không dùng lại mật khẩu cũ.",
  },
];

const PASSWORD_RULES: Benefit[] = [
  {
    Icon: FiCheckCircle,
    title: "Tối thiểu 8 ký tự",
    body: "Mật khẩu càng dài càng khó đoán.",
  },
  {
    Icon: FiType,
    title: "Chữ hoa và chữ thường",
    body: "Kết hợp cả hai dạng chữ cái.",
  },
  {
    Icon: FiHash,
    title: "Số và ký tự đặc biệt",
    body: "Thêm vài ký tự như 2, 9, ! hoặc @.",
  },
  {
    Icon: FiRefreshCw,
    title: "Khác mật khẩu hiện tại",
    body: "Mật khẩu mới không được trùng mật khẩu cũ.",
  },
  {
    Icon: FiSmartphone,
    title: "Giữ lại phiên này",
    body: "Mọi thiết bị khác sẽ phải đăng nhập lại.",
  },
];

export function AccountSidePanel({
  variant,
}: {
  variant: "profile" | "password";
}): ReactElement {
  const scope = useRiseIn<HTMLDivElement>();
  const isProfile = variant === "profile";
  const items = isProfile ? PROFILE_BENEFITS : PASSWORD_RULES;
  const HeadIcon = isProfile ? FiShield : FiKey;
  return (
    <BentoCard className="order-2 border-brand/40 bg-brand/10 md:col-span-6 lg:order-1 lg:col-span-5 dark:border-brand/30 dark:bg-brand/10">
      <div ref={scope} className="flex h-full flex-col justify-center gap-5 p-2 sm:p-4">
        <div data-rise className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand bg-brand text-zinc-950 dark:border-brand dark:bg-brand dark:text-zinc-950">
            <HeadIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            AmigoACT
          </span>
        </div>
        <h2
          data-rise
          className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100"
        >
          {isProfile
            ? "Mọi thông tin tài khoản, gọn trong một chỗ."
            : "Đặt mật khẩu mạnh chỉ trong 30 giây."}
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
