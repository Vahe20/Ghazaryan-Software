import { App } from "@/src/types/Entities";
import { formatDate, formatSize } from "@/src/lib/utils";
import s from "./AppsTable.module.scss";
import table from "../../shared/_table.module.scss";
import badges from "../../shared/_badges.module.scss";
import misc from "../../shared/_misc.module.scss";
import btns from "../../shared/_buttons.module.scss";

interface AppsTableProps {
    apps: App[];
    onEdit: (app: App) => void;
    onDelete: (app: App) => void;
    onViewApp: (app: App) => void;
    onManageEditions: (app: App) => void;
    onManageVersions: (app: App) => void;
    onManagePromotions: (app: App) => void;
}

export default function AppsTable({ 
    apps, 
    onEdit, 
    onDelete,
    onViewApp,
    onManageEditions,
    onManageVersions,
    onManagePromotions,
}: AppsTableProps) {
    return (
        <table className={table.table}>
            <thead>
                <tr>
                    <th className={table.tableTh}>App</th>
                    <th className={table.tableTh}>Category</th>
                    <th className={table.tableTh}>Status</th>
                    <th className={table.tableTh}>Price</th>
                    <th className={table.tableTh}>Rating</th>
                    <th className={table.tableTh}>Downloads</th>
                    <th className={table.tableTh}>Size</th>
                    <th className={table.tableTh}>Created</th>
                    <th className={table.tableTh}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {apps.map(app => (
                    <tr key={app.id} className={table.tableTr}>
                        <td className={table.tableTd}>
                            <div className={s.appCell}>
                                <div className={misc.appIcon}><img src={app.iconUrl} alt={app.name} /></div>
                                <div>
                                    <p className={s.appName}>{app.name}</p>
                                    <p className={s.appSlug}>/{app.slug}</p>
                                </div>
                            </div>
                        </td>
                        <td className={table.tableTd}>{app.category?.name ?? "—"}</td>
                        <td className={table.tableTd}>
                            <span className={`${badges.badge} ${app.status === "RELEASE" ? badges.badgeRelease : badges.badgeBeta}`}>
                                {app.status ?? "BETA"}
                            </span>
                        </td>
                        <td className={table.tableTd}>{Number(app.price) === 0 ? "Free" : `${Number(app.price).toLocaleString()} USD`}</td>
                        <td className={table.tableTd}>⭐ {app.rating.toFixed(1)}</td>
                        <td className={table.tableTd}>{app.downloadCount.toLocaleString()}</td>
                        <td className={table.tableTd}>{formatSize(app.size)}</td>
                        <td className={table.tableTd} style={{ whiteSpace: "nowrap" }}>{formatDate(app.createdAt)}</td>
                        <td className={table.tableTd}>
                            <div className={s.actions}>
                                <div className={s.actionsRow}>
                                    <button 
                                        className={btns.btnSecondary} 
                                        onClick={() => onViewApp(app)}
                                        title="View app page"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    </button>
                                    <button 
                                        className={btns.btnEdit} 
                                        onClick={() => onEdit(app)}
                                        title="Edit app"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                    <button 
                                        className={btns.btnDanger} 
                                        onClick={() => onDelete(app)}
                                        title="Delete app"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                            <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                </div>
                                <div className={s.actionsRow}>
                                    <button 
                                        className={s.managementBtn}
                                        onClick={() => onManageEditions(app)}
                                        title="Manage editions"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                            <path d="M9 9h6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Editions
                                    </button>
                                    <button 
                                        className={s.managementBtn}
                                        onClick={() => onManageVersions(app)}
                                        title="Manage versions"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Versions
                                    </button>
                                    <button 
                                        className={s.managementBtn}
                                        onClick={() => onManagePromotions(app)}
                                        title="Manage promotions"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M7 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Promos
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
