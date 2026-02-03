"use client"

import Link from "next/link";
import { Navbar } from "../navbar/Navbar";
import { AuthMenu } from "../authMenu/AuthMenu";
import style from "./Header.module.scss";

export function Header() {
  return (
    <header className={style.header}>
      <div className={style.navbar}>
        <Link href="/" className={style.navbar__logo}>
          <h1>Ghazaryan Software</h1>
        </Link>

        <Navbar />

        <div className={style.navbar__auth}>
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}
