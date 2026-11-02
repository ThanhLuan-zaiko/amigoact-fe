import { FiBookmark, FiGlobe, FiStar } from "react-icons/fi";
import Composer from "../_components/Composer";
import FeedList from "../_components/FeedList";
import RightRail from "../_components/RightRail";
import TabBar from "../_components/TabBar";

// The feed is the only page that shows the right rail.
export default function HomePage() {
  return (
    <div className="flex min-w-0 flex-1 gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <Composer />
        <TabBar
          tabs={[
            { label: "Dành cho bạn", icon: FiStar, active: true },
            { label: "Đang theo dõi", icon: FiBookmark },
            { label: "Công khai", icon: FiGlobe },
          ]}
        />
        <FeedList posts={[]} />
      </div>

      <aside className="hidden w-[300px] shrink-0 lg:block">
        <RightRail popularTags={[]} />
      </aside>
    </div>
  );
}
