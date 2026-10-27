import type { ReactElement } from "react";
import {
  FiCheckCircle,
  FiHash,
  FiKey,
  FiRefreshCw,
  FiSmartphone,
  FiType,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { Section } from "../../core/components/Section.tsx";
import { HeroPanel } from "./HeroPanel.tsx";

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
  const isProfile = variant === "profile";
  if (isProfile) {
    return (
      <HeroPanel
        eyebrow="Tài khoản"
        headline="Mọi thông tin tài khoản, gọn trong một chỗ."
        lead="Cập nhật hồ sơ, ảnh đại diện và giữ tài khoản luôn an toàn."
        items={PROFILE_BENEFITS}
      />
    );
  }
  const items = PASSWORD_RULES;
  const HeadIcon = FiKey;
  return (
    <Section>
      <div className="flex flex-col justify-start gap-5 p-2 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950">
            <HeadIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            AmigoACT
          </span>
        </div>
        <h2
          className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100"
        >
          Đặt mật khẩu mạnh chỉ trong 30 giây.
        </h2>
        <ul className="flex flex-col gap-4">
          {items.map(({ Icon, title, body }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950">
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
    </Section>
  );
}
