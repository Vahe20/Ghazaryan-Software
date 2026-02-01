import { HeroSection } from "@/src/components/home/HeroSection";
import { PopularAppsSection } from "@/src/components/home/PopularAppsSection";
import style from "./page.module.scss";

export default function HomePage() {
  return (
    <div className={style.home}>
      <HeroSection />
      <PopularAppsSection />
    </div>
  );
}
