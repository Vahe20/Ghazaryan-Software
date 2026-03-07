"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/src/app/hooks";
import { Role } from "@/src/types/Role";
import style from "./Navbar.module.scss";

export function Navbar() {
    const pathname = usePathname();
    const user = useAppSelector(s => s.auth.user);
    const isAdmin = user?.role === Role.ADMIN;

    const links = [
        { href: "/", label: "Home", always: true },
        { href: "/apps", label: "Apps", always: true },
        { href: "/library", label: "Library", show: !!user },
        { href: "/admin", label: "Admin", show: isAdmin },
    ].filter(l => l.always || l.show);

    return (
        <div className={style.navWrapper}>
            <nav className={style.desktopNav}>
                <ul className={style.list}>
                    {links.map(l => (
                        <li key={l.href}>
                            <Link href={l.href} className={`${style.link} ${pathname === l.href ? style.active : ""}`}>
                                {l.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
