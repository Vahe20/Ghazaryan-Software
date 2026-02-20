import badges from "../../shared/_badges.module.scss";

interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const cls =
        status === "COMPLETED" ? badges.badgeCompleted :
        status === "PENDING"   ? badges.badgePending   :
        status === "FAILED"    ? badges.badgeFailed     : badges.badgeRefunded;

    const dot: Record<string, string> = {
        COMPLETED: "🟢",
        PENDING: "🟡",
        FAILED: "🔴",
        REFUNDED: "🔵",
    };

    return <span className={`${badges.badge} ${cls}`}>{dot[status] ?? "⚪"} {status}</span>;
}
