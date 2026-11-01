import { FiBookmark, FiGlobe, FiStar } from "react-icons/fi";
import AppHeader from "./_components/AppHeader";
import Composer from "./_components/Composer";
import FeedList from "./_components/FeedList";
import MobileNav from "./_components/MobileNav";
import RightRail from "./_components/RightRail";
import SideNav from "./_components/SideNav";
import TabBar from "./_components/TabBar";

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-wrap gap-6 p-6 pb-24 md:pb-6">
        <aside className="hidden w-52 shrink-0 md:block">
          <SideNav activeHref="/" joinedOrganizations={[]} />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <Composer />
          <TabBar
            tabs={[
              { label: "Dành cho bạn", icon: FiStar, active: true },
              { label: "Đang theo dõi", icon: FiBookmark },
              { label: "Công khai", icon: FiGlobe },
            ]}
          />
          <FeedList posts={[]} />
        </main>

        <aside className="hidden w-[300px] shrink-0 lg:block">
          <RightRail
            activities={[]}
            suggestedOrganizations={[]}
            popularTags={[]}
          />
        </aside>
      </div>
      <MobileNav activeHref="/" />
    </>
  );
}
