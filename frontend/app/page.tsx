import { NewsCarousel } from "@/src/components/home/newsCarousel/NewsCarousel";
import { PopularAppsSection } from "@/src/components/home/popularAppsSection/PopularAppsSection";
import { TopRatedAppsSection } from "@/src/components/home/topRatedAppsSection/TopRatedAppsSection";
import style from "./page.module.scss";

export default function HomePage() {
    return (
        <div className={style.home}>
            <NewsCarousel />
            <PopularAppsSection />
            <TopRatedAppsSection />
        </div>
    );
}
