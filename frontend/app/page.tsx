import { HeroSection } from "@/src/components/home/heroSection/HeroSection";
import { PopularAppsSection } from "@/src/components/home/popularAppsSection/PopularAppsSection";
import style from "./page.module.scss";

export default function HomePage() {
  return (
    <div className={style.home}>
      <HeroSection />
      <PopularAppsSection />
    </div>
  );
}
