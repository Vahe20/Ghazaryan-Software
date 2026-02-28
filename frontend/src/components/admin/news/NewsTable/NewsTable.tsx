"use client";

import { NewsItem, TagColor } from "@/src/types/Entities";
import t from "../../shared/_table.module.scss";
import btns from "../../shared/_buttons.module.scss";

const TAG_COLOR_LABELS: Record<TagColor, string> = {
    BLUE: "Blue",
    PINK: "Pink",
    PURPLE: "Purple",
    GREEN: "Green",
};

const TAG_COLOR_STYLES: Record<TagColor, React.CSSProperties> = {
    BLUE: { background: "rgba(0,132,255,.12)", color: "rgb(0,132,255)" },
    PINK: { background: "rgba(255,0,110,.12)", color: "rgb(255,0,110)" },
    PURPLE: { background: "rgba(124,58,237,.12)", color: "rgb(124,58,237)" },
    GREEN: { background: "rgba(0,186,136,.12)", color: "rgb(0,186,136)" },
};

interface Props {
    items: NewsItem[];
    onEdit: (item: NewsItem) => void;
    onDelete: (item: NewsItem) => void;
}

export default function NewsTable({ items, onEdit, onDelete }: Props) {
    return (
        <table className={t.table}>
            <thead>
                <tr>
                    <th className={t.tableTh}>Title</th>
                    <th className={t.tableTh}>Tag</th>
                    <th className={t.tableTh}>Cover</th>
                    <th className={t.tableTh}>Publish Date</th>
                    <th className={t.tableTh} style={{ textAlign: "right" }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <tr key={item.id} className={t.tableTr}>
                        <td className={t.tableTd}>
                            <div style={{ fontWeight: 600, color: "var(--text-primary, #fff)" }}>
                                {item.title}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-tertiary, #999)" }}>
                                {item.description}
                            </div>
                        </td>
                        <td className={t.tableTd}>
                            <span style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "3px 10px",
                                borderRadius: 9999,
                                fontSize: 12,
                                fontWeight: 700,
                                ...TAG_COLOR_STYLES[item.tagColor],
                            }}>
                                {item.tag}
                                <span style={{ fontSize: 10, opacity: 0.7 }}>({TAG_COLOR_LABELS[item.tagColor]})</span>
                            </span>
                        </td>
                        <td className={t.tableTd}>
                            {item.coverUrl ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.coverUrl} alt="" style={{ width: 56, height: 36, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(255,255,255,.08)" }} />
                                </>
                            ) : (
                                <span style={{ color: "var(--text-muted, #666)" }}>—</span>
                            )}
                        </td>
                        <td className={t.tableTd}>
                            {new Date(item.publishedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
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
