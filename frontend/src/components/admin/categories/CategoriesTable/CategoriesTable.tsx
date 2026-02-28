import t from "../../shared/_table.module.scss";
import btns from "../../shared/_buttons.module.scss";

interface Category { id: string; name: string; slug: string; }

interface Props {
    items: Category[];
    onEdit: (item: Category) => void;
    onDelete: (item: Category) => void;
}

export default function CategoriesTable({ items, onEdit, onDelete }: Props) {
    return (
        <table className={t.table}>
            <thead>
                <tr>
                    <th className={t.tableTh}>Name</th>
                    <th className={t.tableTh}>Slug</th>
                    <th className={t.tableTh} style={{ textAlign: "right" }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <tr key={item.id} className={t.tableTr}>
                        <td className={t.tableTd}>
                            <span style={{ fontWeight: 600, color: "var(--text-primary, #fff)" }}>{item.name}</span>
                        </td>
                        <td className={t.tableTd}>
                            <code style={{ fontSize: 13, color: "var(--text-tertiary, #999)" }}>{item.slug}</code>
                        </td>
                        <td className={t.tableTd}>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button className={btns.btnEdit} onClick={() => onEdit(item)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Edit
                                </button>
                                <button className={btns.btnDanger} onClick={() => onDelete(item)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
