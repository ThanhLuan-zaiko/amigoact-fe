import type { ReactElement } from "react";
import {
  FiActivity,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiMail,
  FiUsers,
} from "react-icons/fi";
import { HeroPanel, type HeroItem as Benefit } from "./HeroPanel.tsx";

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
  return variant === "login" ? (
    <HeroPanel
      eyebrow="Chào mừng trở lại"
      headline="Một tài khoản, mọi hoạt động tình nguyện."
      lead="Tiếp tục hành trình đóng góp của bạn: sự kiện, đội nhóm và giờ tình nguyện đều ở đây."
      items={LOGIN_BENEFITS}
    />
  ) : (
    <HeroPanel
      eyebrow="Chỉ 3 bước"
      headline="Bắt đầu hành trình tình nguyện trong 1 phút."
      lead="Tạo tài khoản miễn phí, xác minh email và tham gia hoạt động đầu tiên của bạn."
      items={REGISTER_STEPS}
      numbered
    />
  );
}
