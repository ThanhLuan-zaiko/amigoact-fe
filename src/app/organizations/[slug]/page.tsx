import {
  FiCalendar,
  FiFileText,
  FiInfo,
  FiMessageSquare,
  FiUsers,
} from "react-icons/fi";
import AppHeader from "../../_components/AppHeader";
import FeedList from "../../_components/FeedList";
import MobileNav from "../../_components/MobileNav";
import OrgHeader from "../../_components/OrgHeader";
import TabBar from "../../_components/TabBar";

export default function OrganizationPage() {
  return (
    <>
      <AppHeader />
      <div className="mx-auto w-full max-w-[1200px] flex-1 p-6 pb-24 md:pb-6">
        <OrgHeader />
        <div className="mt-4">
          <TabBar
            tabs={[
              { label: "Bảng tin", icon: FiFileText, active: true },
              { label: "Hoạt động", icon: FiCalendar },
              { label: "Thành viên", icon: FiUsers },
              { label: "Trò chuyện", icon: FiMessageSquare },
              { label: "Giới thiệu", icon: FiInfo },
            ]}
          />
        </div>
        <div className="mt-4">
          <FeedList posts={[]} />
        </div>
      </div>
      <MobileNav activeHref="/organizations" />
    </>
  );
}
