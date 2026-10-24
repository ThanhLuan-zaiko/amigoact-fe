import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import {
  FiAlertTriangle,
  FiLoader,
  FiLogIn,
  FiRefreshCw,
} from "react-icons/fi";
import {
  onRealtimeStatus,
  realtime,
  retryRealtime,
  type RealtimeIssue,
  type RealtimeStatus,
} from "../realtime.ts";
import { Button } from "./Button.tsx";

interface BannerView {
  status: RealtimeStatus;
  issue: RealtimeIssue;
}

// Feedback-style connection banner (see AGENTS.md, Data): one slim feed row
// under the header, live on every route. Transient reconnecting reads
// amber; a dead session or denied socket reads red until the user acts.
// Renders nothing while the socket is healthy.
export function RealtimeBanner(): ReactElement | null {
  const [view, setView] = useState<BannerView>({
    status: realtime.getStatus(),
    issue: realtime.getIssue(),
  });
  useEffect(
    () =>
      onRealtimeStatus((status) =>
        setView({ status, issue: realtime.getIssue() }),
      ),
    [],
  );

  const offline = view.status === "offline" || view.status === "reconnecting";
  if (!offline && view.issue === null) return null;

  let title = "";
  let message = "";
  let action: ReactElement | null = null;
  let warn = true;
  if (view.issue === "session") {
    warn = false;
    title = "Phiên đăng nhập không còn hợp lệ";
    message = "Đăng nhập lại để tiếp tục nhận cập nhật trực tiếp.";
    action = (
      <Button
        to="/login"
        variant="secondary"
        icon={<FiLogIn className="h-4 w-4" aria-hidden="true" />}
      >
        Đăng nhập
      </Button>
    );
  } else if (view.issue === "denied") {
    warn = false;
    title = "Không thể truy cập kênh trực tiếp";
    message = "Quyền xem kênh này có thể đã thay đổi.";
    action = (
      <Button
        variant="secondary"
        icon={<FiRefreshCw className="h-4 w-4" aria-hidden="true" />}
        onClick={retryRealtime}
      >
        Thử lại
      </Button>
    );
  } else if (view.issue === "error") {
    title = "Kết nối trực tiếp gặp sự cố";
    message = "Một số cập nhật có thể chưa hiển thị.";
    action = (
      <Button
        variant="secondary"
        icon={<FiRefreshCw className="h-4 w-4" aria-hidden="true" />}
        onClick={retryRealtime}
      >
        Thử lại
      </Button>
    );
  } else if (view.status === "reconnecting") {
    title = "Mất kết nối trực tiếp";
    message = "Đang thử kết nối lại…";
  } else {
    title = "Đã ngắt kết nối trực tiếp";
    message = "Cập nhật mới sẽ hiển thị khi kết nối trở lại.";
    action = (
      <Button
        variant="secondary"
        icon={<FiRefreshCw className="h-4 w-4" aria-hidden="true" />}
        onClick={retryRealtime}
      >
        Thử lại
      </Button>
    );
  }

  const icon =
    view.status === "reconnecting" ? (
      <FiLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
    ) : (
      <FiAlertTriangle className="h-4 w-4" aria-hidden="true" />
    );

  return (
    <div
      role={warn ? "status" : "alert"}
      className={
        "flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2 " +
        (warn
          ? "border-amber-200 bg-amber-50 text-amber-800 " +
            "dark:border-amber-950 dark:bg-amber-950/40 dark:text-amber-200"
          : "border-red-200 bg-red-50 text-red-700 " +
            "dark:border-red-950 dark:bg-red-950/40 dark:text-red-300")
      }
    >
      {icon}
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-sm">{message}</p>
      {action}
    </div>
  );
}
