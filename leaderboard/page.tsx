import { useState, type ReactElement } from "react";
import { FiAward, FiTrendingUp } from "react-icons/fi";
import { BentoCard } from "../core/components/BentoCard.tsx";
import { Button } from "../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { useLeaderboard, useLeaderboardTerms } from "./hooks.ts";
import { termLabel } from "./messages.tsx";

export function LeaderboardPage(): ReactElement {
  const [term, setTerm] = useState("all");
  const terms = useLeaderboardTerms();
  const board = useLeaderboard(term);
  const boards = ["all", ...(terms.data ?? []).filter((t) => t !== "all")];

  return (
    <>
      <BentoCard className="md:col-span-6 lg:col-span-12">
        <div data-rise className="flex items-center gap-2">
          <FiTrendingUp
            className="h-5 w-5 text-zinc-900 dark:text-brand"
            aria-hidden="true"
          />
          <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Bảng xếp hạng tình nguyện viên
          </h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Vinh danh những bạn có nhiều giờ tình nguyện được duyệt nhất.
        </p>
        <div
          role="group"
          aria-label="Chọn kỳ xếp hạng"
          className="mt-3 flex flex-wrap gap-2"
        >
          {boards.map((t) => (
            <Button
              key={t}
              variant={term === t ? "primary" : "secondary"}
              onClick={() => setTerm(t)}
            >
              {termLabel(t)}
            </Button>
          ))}
        </div>
      </BentoCard>
      <BentoCard className="md:col-span-6 lg:col-span-12">
        {board.isPending && <LoadingState label="Đang tải bảng xếp hạng…" />}
        {board.isError && (
          <ErrorState
            title="Không tải được"
            message={board.error.message}
          />
        )}
        {board.data && board.data.entries.length === 0 && (
          <EmptyState
            title="Chưa có dữ liệu"
            message="Bảng xếp hạng hiện khi có giờ tình nguyện được duyệt."
          />
        )}
        {board.data && board.data.entries.length > 0 && (
          <ol className="flex flex-col gap-2">
            {board.data.entries.map((row) => (
              <li
                key={row.student_id}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                  row.rank <= 3
                    ? "border-brand/40 bg-brand/10 dark:border-brand/30"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      row.rank <= 3
                        ? "bg-brand text-white"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {row.rank}
                  </span>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {row.student_name ?? "Tình nguyện viên"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Hạng {row.rank}
                    </p>
                  </div>
                </div>
                <p className="flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-100">
                  <FiAward className="h-4 w-4 text-brand" aria-hidden="true" />
                  {row.total_hours} giờ
                </p>
              </li>
            ))}
          </ol>
        )}
      </BentoCard>
    </>
  );
}
