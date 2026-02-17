import { HeroSection } from "@/src/components/home/heroSection/HeroSection";
import { PopularAppsSection } from "@/src/components/home/popularAppsSection/PopularAppsSection";
import { CategoriesSection } from "@/src/components/home/categoriesSection/CategoriesSection";
import style from "./page.module.scss";

export default function HomePage() {
  return (
    <div className={style.home}>
      <HeroSection />
      <PopularAppsSection />
      <CategoriesSection />
    </div>
  );
}
