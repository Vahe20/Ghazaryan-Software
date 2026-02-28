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
}

export default function AppsTable({ apps, onEdit, onDelete }: AppsTableProps) {
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
                    <th className={table.tableTh}>Version</th>
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
                        <td className={table.tableTd}>v{app.version}</td>
                        <td className={table.tableTd} style={{ whiteSpace: "nowrap" }}>{formatDate(app.createdAt)}</td>
                        <td className={table.tableTd}>
                            <div className={s.actions}>
                                <button className={btns.btnEdit} onClick={() => onEdit(app)}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Edit
                                </button>
                                <button className={btns.btnDanger} onClick={() => onDelete(app)}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
