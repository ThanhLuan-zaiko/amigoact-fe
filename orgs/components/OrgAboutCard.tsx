import type { ReactElement } from "react";
import { FiFileText } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { EmptyState } from "../../core/components/Feedback.tsx";
import type { PublicOrgDetail } from "../api.ts";

interface OrgAboutCardProps {
  org: PublicOrgDetail;
}

export function OrgAboutCard({ org }: OrgAboutCardProps): ReactElement {
  return (
    <Section>
      <div data-rise>
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <FiFileText
            className="h-5 w-5 text-zinc-900 dark:text-brand"
            aria-hidden="true"
          />
          Giới thiệu
        </h2>
        {org.description.trim() !== "" ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {org.description}
          </p>
        ) : (
          <div className="mt-3">
            <EmptyState
              title="Chưa có giới thiệu"
              message="Tổ chức chưa cập nhật phần mô tả. Hãy xem các hoạt động và hình ảnh bên dưới để hiểu thêm."
            />
          </div>
        )}
      </div>
    </Section>
  );
}
