import type { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { ApiError } from "../core/api.ts";
import { Section } from "../core/components/Section.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { useRiseOn } from "../core/motion.ts";
import { useOrgsRealtime, usePublicOrg } from "./hooks.ts";
import { toVietnameseOrgsMessage } from "./messages.tsx";
import { OrgAboutCard } from "./components/OrgAboutCard.tsx";
import { OrgActivityList } from "./components/OrgActivityList.tsx";
import { OrgContactCard } from "./components/OrgContactCard.tsx";
import { OrgDetailHero } from "./components/OrgDetailHero.tsx";
import { OrgGalleryCard } from "./components/OrgGalleryCard.tsx";
import { OrgNewsCard } from "./components/OrgNewsCard.tsx";
import { OrgTrustCard } from "./components/OrgTrustCard.tsx";

export function OrgDetailPage(): ReactElement {
  const { slug } = useParams();
  useOrgsRealtime();
  const org = usePublicOrg(slug);
  const riseRef = useRiseOn<HTMLDivElement>(slug);

  if (slug === undefined || (org.isError && org.error instanceof ApiError && org.error.status === 404)) {
    return (
      <Section>
        <EmptyState
          title="Không tìm thấy tổ chức"
          message="Tổ chức này không tồn tại hoặc không còn hiển thị công khai. Quay lại danh sách để khám phá tổ chức khác."
        />
      </Section>
    );
  }
  if (org.isPending) {
    return (
      <Section>
        <LoadingState label="Đang tải hồ sơ tổ chức…" />
      </Section>
    );
  }
  if (org.isError || org.data === undefined) {
    return (
      <Section>
        <ErrorState
          title="Không tải được hồ sơ"
          message={toVietnameseOrgsMessage(
            org.error instanceof ApiError
              ? org.error.code
              : "REQUEST_FAILED",
          )}
          actionLabel="Thử lại"
          onAction={() => void org.refetch()}
        />
      </Section>
    );
  }
  const detail = org.data;
  return (
    <div ref={riseRef} className="contents">
      <OrgDetailHero org={detail} />
      <OrgTrustCard org={detail} />
      <OrgAboutCard org={detail} />
      <OrgContactCard org={detail} />
      <OrgNewsCard org={detail} />
      <OrgActivityList org={detail} />
      <OrgGalleryCard org={detail} />
    </div>
  );
}
