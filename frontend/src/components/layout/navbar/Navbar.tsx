"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/src/store/AuthStore";
import { Role } from "@/src/types/Role";
import style from "./Navbar.module.scss";

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore(state => state.user);
  const isAdmin = user?.role === Role.ADMIN;

  return (
    <nav className={style.navbar__links}>
      <ul className={style.navbar__links_list}>
        <li className={style.navbar__links_item}>
          <Link
            href="/"
            className={pathname === "/" ? style.active : ""}>
            Home
          </Link>
        </li>
        <li className={style.navbar__links_item}>
          <Link
            href="/apps"
            className={pathname === "/apps" ? style.active : ""}>
            Apps
          </Link>
        </li>
        {user && (
          <li className={style.navbar__links_item}>
            <Link
              href="/library"
              className={pathname === "/library" ? style.active : ""}>
              Library
            </Link>
          </li>
        )}
        {isAdmin && (
          <li className={style.navbar__links_item}>
            <Link
              href="/admin"
              className={pathname === "/admin" ? style.active : ""}>
              Admin
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
