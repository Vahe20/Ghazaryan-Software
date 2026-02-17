"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AdminService } from "@/src/services/admin.service";
import { App } from "@/src/types/Entities";
import { useDebounce } from "@/src/hooks/useDebounce";
import s from "../admin.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────
type Platform = "WINDOWS" | "MAC" | "LINUX" | "ANDROID" | "IOS";
type Status = "BETA" | "RELEASE";

interface Category { id: string; name: string; slug: string; }

const PLATFORMS: Platform[] = ["WINDOWS", "MAC", "LINUX", "ANDROID", "IOS"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d?: string | Date) {
    if (!d) return "—";
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(d));
}

function formatSize(b: number) {
    if (b >= 1073741824) return (b / 1073741824).toFixed(1) + " GB";
    if (b >= 1048576) return (b / 1048576).toFixed(1) + " MB";
    return (b / 1024).toFixed(1) + " KB";
}

// ─── Tags input ───────────────────────────────────────────────────────────────
function TagsInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
    const [input, setInput] = useState("");
    const addTag = (val: string) => {
        const v = val.trim().toLowerCase();
        if (v && !tags.includes(v)) onChange([...tags, v]);
        setInput("");
    };
    return (
        <div className={s.tagsInput}>
            {tags.map(t => (
                <span key={t} className={s.tag}>
                    {t}
                    <button type="button" onClick={() => onChange(tags.filter(x => x !== t))}>×</button>
                </span>
            ))}
            <input
                className={s.tagInput}
                placeholder="Add tag, press Enter..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); }
                    if (e.key === "Backspace" && !input && tags.length) onChange(tags.slice(0, -1));
                }}
                onBlur={() => input.trim() && addTag(input)}
            />
        </div>
    );
}

// ─── App Form Modal ───────────────────────────────────────────────────────────
interface AppFormData {
    name: string; slug: string; shortDesc: string; description: string;
    version: string; changelog: string; iconUrl: string; coverUrl: string;
    screenshots: string[]; categoryId: string; tags: string[];
    size: string; platform: Platform[]; downloadUrl: string;
    sourceUrl: string; documentationUrl: string;
    status: Status; price: string;
}

const EMPTY_FORM: AppFormData = {
    name: "", slug: "", shortDesc: "", description: "",
    version: "1.0.0", changelog: "", iconUrl: "", coverUrl: "",
    screenshots: [""], categoryId: "", tags: [],
    size: "", platform: [], downloadUrl: "",
    sourceUrl: "", documentationUrl: "",
    status: "BETA", price: "0",
};

function appToForm(app: App): AppFormData {
    return {
        name: app.name, slug: app.slug, shortDesc: app.shortDesc, description: app.description,
        version: app.version, changelog: app.changelog ?? "",
        iconUrl: app.iconUrl, coverUrl: app.coverUrl ?? "",
        screenshots: app.screenshots?.length ? app.screenshots : [""],
        categoryId: app.categoryId, tags: app.tags ?? [],
        size: String(app.size), platform: Array.isArray(app.platform) ? app.platform : [app.platform].filter(Boolean) as Platform[],
        downloadUrl: app.downloadUrl, sourceUrl: app.sourceUrl ?? "",
        documentationUrl: app.documentationUrl ?? "",
        status: (app as any).status ?? "BETA", price: String(app.price ?? 0),
    };
}

function AppModal({ app, categories, onClose, onSaved }: {
    app: App | null;
    categories: Category[];
    onClose: () => void;
    onSaved: (saved: App) => void;
}) {
    const [form, setForm] = useState<AppFormData>(app ? appToForm(app) : EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const set = (patch: Partial<AppFormData>) => setForm(f => ({ ...f, ...patch }));

    const togglePlatform = (p: Platform) =>
        set({ platform: form.platform.includes(p) ? form.platform.filter(x => x !== p) : [...form.platform, p] });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = {
                ...form,
                size: Number(form.size),
                price: Number(form.price),
                screenshots: form.screenshots.filter(Boolean),
                slug: form.slug || undefined,
            };
            const saved = app
                ? await AdminService.updateApp(app.id, payload)
                : await AdminService.createApp(payload);
            onSaved(saved);
        } catch (e: any) {
            const msg = e.response?.data?.error?.message;
            setError(Array.isArray(msg) ? msg.map((m: any) => m.message ?? m).join(", ") : msg ?? "Failed to save app");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={s.modal} style={{ maxWidth: "760px" }}>
                <div className={s.modalHeader}>
                    <h2>{app ? "Edit Application" : "Create Application"}</h2>
                    <button className={s.modalClose} onClick={onClose}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={s.modalBody}>
                        {error && <div className={s.alertError}>{error}</div>}

                        {/* Basic Info */}
                        <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: "13px", color: "var(--text-tertiary, #8a8d91)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Basic Info</p>
                        <div className={s.formGrid}>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Name *</label>
                                <input className={s.formInput} required value={form.name} onChange={e => set({ name: e.target.value })} placeholder="App name" />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Slug</label>
                                <input className={s.formInput} value={form.slug} onChange={e => set({ slug: e.target.value })} placeholder="auto-generated if empty" />
                            </div>
                            <div className={`${s.formGroup} ${s.span2}`}>
                                <label className={s.formLabel}>Short Description * (10–200 chars)</label>
                                <input className={s.formInput} required minLength={10} maxLength={200} value={form.shortDesc} onChange={e => set({ shortDesc: e.target.value })} placeholder="One-line description" />
                            </div>
                            <div className={`${s.formGroup} ${s.span2}`}>
                                <label className={s.formLabel}>Full Description * (min 50 chars)</label>
                                <textarea className={s.formTextarea} required minLength={50} rows={4} value={form.description} onChange={e => set({ description: e.target.value })} placeholder="Detailed description..." />
                            </div>
                        </div>

                        {/* Meta */}
                        <p style={{ margin: "20px 0 12px", fontWeight: 700, fontSize: "13px", color: "var(--text-tertiary, #8a8d91)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Meta</p>
                        <div className={s.formGrid}>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Version * (X.Y.Z)</label>
                                <input className={s.formInput} required pattern="^\d+\.\d+\.\d+$" value={form.version} onChange={e => set({ version: e.target.value })} placeholder="1.0.0" />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Price (AMD)</label>
                                <input className={s.formInput} type="number" min="0" value={form.price} onChange={e => set({ price: e.target.value })} />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Category *</label>
                                <select className={s.formSelect} required value={form.categoryId} onChange={e => set({ categoryId: e.target.value })}>
                                    <option value="">Select category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Status</label>
                                <select className={s.formSelect} value={form.status} onChange={e => set({ status: e.target.value as Status })}>
                                    <option value="BETA">Beta</option>
                                    <option value="RELEASE">Release</option>
                                </select>
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Size (bytes) *</label>
                                <input className={s.formInput} required type="number" min="1" value={form.size} onChange={e => set({ size: e.target.value })} placeholder="e.g. 52428800" />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Tags</label>
                                <TagsInput tags={form.tags} onChange={tags => set({ tags })} />
                            </div>
                        </div>

                        {/* Platforms */}
                        <p style={{ margin: "20px 0 10px", fontWeight: 700, fontSize: "13px", color: "var(--text-tertiary, #8a8d91)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Platforms *</p>
                        <div className={s.checkboxGroup}>
                            {PLATFORMS.map(p => (
                                <label key={p} className={`${s.checkboxChip} ${form.platform.includes(p) ? s.checked : ""}`}>
                                    <input type="checkbox" checked={form.platform.includes(p)} onChange={() => togglePlatform(p)} />
                                    {p}
                                </label>
                            ))}
                        </div>

                        {/* URLs */}
                        <p style={{ margin: "20px 0 12px", fontWeight: 700, fontSize: "13px", color: "var(--text-tertiary, #8a8d91)", textTransform: "uppercase", letterSpacing: "0.5px" }}>URLs</p>
                        <div className={s.formGrid}>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Icon URL *</label>
                                <input className={s.formInput} required type="url" value={form.iconUrl} onChange={e => set({ iconUrl: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Cover URL</label>
                                <input className={s.formInput} type="url" value={form.coverUrl} onChange={e => set({ coverUrl: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Download URL *</label>
                                <input className={s.formInput} required type="url" value={form.downloadUrl} onChange={e => set({ downloadUrl: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Source URL</label>
                                <input className={s.formInput} type="url" value={form.sourceUrl} onChange={e => set({ sourceUrl: e.target.value })} placeholder="https://github.com/..." />
                            </div>
                            <div className={`${s.formGroup} ${s.span2}`}>
                                <label className={s.formLabel}>Documentation URL</label>
                                <input className={s.formInput} type="url" value={form.documentationUrl} onChange={e => set({ documentationUrl: e.target.value })} placeholder="https://..." />
                            </div>
                        </div>

                        {/* Screenshots */}
                        <p style={{ margin: "20px 0 10px", fontWeight: 700, fontSize: "13px", color: "var(--text-tertiary, #8a8d91)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Screenshots</p>
                        <div className={s.screenshotList}>
                            {form.screenshots.map((url, i) => (
                                <div key={i} className={s.screenshotRow}>
                                    <input
                                        className={`${s.formInput} ${s.screenshotInput}`}
                                        type="url"
                                        placeholder={`Screenshot ${i + 1} URL`}
                                        value={url}
                                        onChange={e => {
                                            const ss = [...form.screenshots];
                                            ss[i] = e.target.value;
                                            set({ screenshots: ss });
                                        }}
                                    />
                                    {form.screenshots.length > 1 && (
                                        <button type="button" className={s.btnIconDanger} onClick={() => set({ screenshots: form.screenshots.filter((_, j) => j !== i) })}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                            {form.screenshots.length < 10 && (
                                <button type="button" className={s.btnIconAdd} onClick={() => set({ screenshots: [...form.screenshots, ""] })}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                    Add Screenshot
                                </button>
                            )}
                        </div>

                        {/* Changelog */}
                        <p style={{ margin: "20px 0 12px", fontWeight: 700, fontSize: "13px", color: "var(--text-tertiary, #8a8d91)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Changelog</p>
                        <textarea
                            className={s.formTextarea}
                            rows={3}
                            placeholder="What's new in this version..."
                            value={form.changelog}
                            onChange={e => set({ changelog: e.target.value })}
                        />
                    </div>

                    <div className={s.modalFooter}>
                        <button type="button" className={s.btnSecondary} onClick={onClose}>Cancel</button>
                        <button type="submit" className={s.btnPrimary} disabled={loading || form.platform.length === 0}>
                            {loading ? "Saving..." : app ? "Save Changes" : "Create App"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteAppModal({ app, onClose, onDeleted }: { app: App; onClose: () => void; onDeleted: (id: string) => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await AdminService.deleteApp(app.id);
            onDeleted(app.id);
        } catch (e: any) {
            setError(e.response?.data?.error?.message ?? "Failed to delete");
            setLoading(false);
        }
    };

    return (
        <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={s.confirmModal}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <h3>Delete Application?</h3>
                <p>Are you sure you want to delete <strong>{app.name}</strong>? All associated data will be removed permanently.</p>
                {error && <div className={s.alertError}>{error}</div>}
                <div className={s.confirmButtons}>
                    <button className={s.btnSecondary} onClick={onClose}>Cancel</button>
                    <button className={s.btnDanger} onClick={handleDelete} disabled={loading} style={{ padding: "10px 24px" }}>
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminAppsPage() {
    const [apps, setApps] = useState<App[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [page, setPage] = useState(1);

    const [editingApp, setEditingApp] = useState<App | null | "new">(null);
    const [deletingApp, setDeletingApp] = useState<App | null>(null);

    const debouncedSearch = useDebounce(search, 400);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AdminService.getApps({
                page,
                limit: 15,
                search: debouncedSearch || undefined,
                status: statusFilter || undefined,
                categoryId: categoryFilter || undefined,
            });
            setApps(data.apps);
            setPagination(data.pagination);
        } catch {
            setError("Failed to load apps");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, statusFilter, categoryFilter]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, categoryFilter]);

    useEffect(() => {
        AdminService.getCategories().then(setCategories).catch(() => {});
    }, []);

    const handleSaved = (saved: App) => {
        setApps(prev => {
            const idx = prev.findIndex(a => a.id === saved.id);
            return idx >= 0 ? prev.map(a => a.id === saved.id ? saved : a) : [saved, ...prev];
        });
        setEditingApp(null);
    };

    const handleDeleted = (id: string) => {
        setApps(prev => prev.filter(a => a.id !== id));
        setDeletingApp(null);
        setPagination(p => ({ ...p, total: p.total - 1 }));
    };

    return (
        <div className={s.page}>
            {/* Header */}
            <div className={s.pageHeader}>
                <div>
                    <h1 className={s.pageTitle}>Applications</h1>
                    <p className={s.pageSubtitle}>{pagination.total} apps in catalog</p>
                </div>
                <button className={s.btnPrimary} onClick={() => setEditingApp("new")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    New App
                </button>
            </div>

            {/* Toolbar */}
            <div className={s.toolbar}>
                <div className={s.searchBox}>
                    <svg className={s.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input className={s.searchInput} placeholder="Search apps..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className={s.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="RELEASE">Release</option>
                    <option value="BETA">Beta</option>
                </select>
                <select className={s.filterSelect} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className={s.tableCard}>
                {loading ? (
                    <div className={s.loading}><div className={s.spinner} /><p>Loading apps...</p></div>
                ) : error ? (
                    <div className={s.errorState}><p>{error}</p></div>
                ) : apps.length === 0 ? (
                    <div className={s.empty}><p>No apps found</p></div>
                ) : (
                    <table className={s.table}>
                        <thead>
                            <tr>
                                <th className={s.tableTh}>App</th>
                                <th className={s.tableTh}>Category</th>
                                <th className={s.tableTh}>Status</th>
                                <th className={s.tableTh}>Price</th>
                                <th className={s.tableTh}>Rating</th>
                                <th className={s.tableTh}>Downloads</th>
                                <th className={s.tableTh}>Size</th>
                                <th className={s.tableTh}>Version</th>
                                <th className={s.tableTh}>Created</th>
                                <th className={s.tableTh}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apps.map(app => (
                                <tr key={app.id} className={s.tableTr}>
                                    <td className={s.tableTd}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div className={s.appIcon}><img src={app.iconUrl} alt={app.name} /></div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary, #e4e6eb)", whiteSpace: "nowrap" }}>{app.name}</p>
                                                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-tertiary, #8a8d91)" }}>/{app.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={s.tableTd}>{app.category?.name ?? "—"}</td>
                                    <td className={s.tableTd}>
                                        <span className={`${s.badge} ${(app as any).status === "RELEASE" ? s.badgeRelease : s.badgeBeta}`}>
                                            {(app as any).status ?? "BETA"}
                                        </span>
                                    </td>
                                    <td className={s.tableTd}>{Number(app.price) === 0 ? "Free" : `${Number(app.price).toLocaleString()} AMD`}</td>
                                    <td className={s.tableTd}>⭐ {app.rating.toFixed(1)}</td>
                                    <td className={s.tableTd}>{app.downloadCount.toLocaleString()}</td>
                                    <td className={s.tableTd}>{formatSize(app.size)}</td>
                                    <td className={s.tableTd}>v{app.version}</td>
                                    <td className={s.tableTd} style={{ whiteSpace: "nowrap" }}>{formatDate(app.createdAt)}</td>
                                    <td className={s.tableTd}>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button className={s.btnEdit} onClick={() => setEditingApp(app)}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                                Edit
                                            </button>
                                            <button className={s.btnDanger} onClick={() => setDeletingApp(app)}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className={s.pagination}>
                        <span className={s.paginationInfo}>
                            Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
                        </span>
                        <div className={s.paginationButtons}>
                            <button className={s.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            </button>
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const pg = i + Math.max(1, Math.min(page - 2, pagination.totalPages - 4));
                                return <button key={pg} onClick={() => setPage(pg)} className={`${s.pageBtn} ${pg === page ? s.pageBtnActive : ""}`}>{pg}</button>;
                            })}
                            <button className={s.pageBtn} disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {editingApp !== null && (
                <AppModal
                    app={editingApp === "new" ? null : editingApp}
                    categories={categories}
                    onClose={() => setEditingApp(null)}
                    onSaved={handleSaved}
                />
            )}
            {deletingApp && (
                <DeleteAppModal
                    app={deletingApp}
                    onClose={() => setDeletingApp(null)}
                    onDeleted={handleDeleted}
                />
            )}
        </div>
    );
}
