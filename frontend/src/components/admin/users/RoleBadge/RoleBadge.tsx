import badges from "../../shared/_badges.module.scss";

interface RoleBadgeProps {
    role: string;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
    const cls = role === "ADMIN" ? badges.badgeAdmin : role === "DEVELOPER" ? badges.badgeDev : badges.badgeUser;
    return <span className={`${badges.badge} ${cls}`}>{role}</span>;
}
