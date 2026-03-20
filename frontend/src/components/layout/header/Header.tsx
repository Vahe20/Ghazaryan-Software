"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "../navbar/Navbar";
import { AuthMenu } from "../authMenu/AuthMenu";
import style from "./Header.module.scss";

export function Header() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header className={style.header}>
        <div className={style.navbar}>
          <Link href="/" className={style.navbar__logo}>
            <h1>Ghazaryan Software</h1>
          </Link>

          <div className={style.navbar__desktopNav}>
            <Navbar />
          </div>

          <div className={style.navbar__auth}>
            <AuthMenu />
          </div>
        </div>
      </header>

      <div className={style.navbar__mobileDock}>
        <Navbar />
      </div>
    </>
  );
}
