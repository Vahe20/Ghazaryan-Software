import { Purchase } from "@/src/services/admin.service";
import StatusBadge from "../StatusBadge/StatusBadge";
import { formatDate } from "@/src/lib/utils";
import s from "./OrdersTable.module.scss";
import table from "../../shared/_table.module.scss";
import misc from "../../shared/_misc.module.scss";
import btns from "../../shared/_buttons.module.scss";

interface OrdersTableProps {
    purchases: Purchase[];
    onView: (purchase: Purchase) => void;
}

export default function OrdersTable({ purchases, onView }: OrdersTableProps) {
    return (
        <table className={table.table}>
            <thead>
                <tr>
                    <th className={table.tableTh}>Customer</th>
                    <th className={table.tableTh}>Application</th>
                    <th className={table.tableTh}>Amount</th>
                    <th className={table.tableTh}>Status</th>
                    <th className={table.tableTh}>Method</th>
                    <th className={table.tableTh}>Date</th>
                    <th className={table.tableTh}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {purchases.map(p => (
                    <tr key={p.id} className={table.tableTr}>
                        <td className={table.tableTd}>
                            <div className={s.customerCell}>
                                <div className={misc.avatar}>
                                    {p.user.avatarUrl
                                        ? <img src={p.user.avatarUrl} alt={p.user.userName} />
                                        : p.user.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className={s.customerName}>{p.user.userName}</p>
                                    <p className={s.customerEmail}>{p.user.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className={table.tableTd}>
                            <div className={s.appCell}>
                                <div className={misc.appIcon}><img src={p.app.iconUrl} alt={p.app.name} /></div>
                                <span style={{ fontWeight: 500 }}>{p.app.name}</span>
                            </div>
                        </td>
                        <td className={table.tableTd}>
                            <span className={s.amount}>{Number(p.price).toLocaleString()} AMD</span>
                        </td>
                        <td className={table.tableTd}><StatusBadge status={p.status} /></td>
                        <td className={table.tableTd}>{p.paymentMethod ?? "—"}</td>
                        <td className={table.tableTd} style={{ whiteSpace: "nowrap" }}>{formatDate(p.purchasedAt, true)}</td>
                        <td className={table.tableTd}>
                            <button className={btns.btnEdit} onClick={() => onView(p)}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                View
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
