import { useState } from "react";
import { AdminService } from "@/src/services/admin.service";
import { App } from "@/src/types/Entities";
import TagsInput from "../TagsInput/TagsInput";
import BaseModal from "@/src/components/shared/BaseModal/BaseModal";
import s from "./AppModal.module.scss";
import form from "../../shared/_form.module.scss";
import btns from "../../shared/_buttons.module.scss";
import { useAsyncAction } from "@/src/hooks/useAsyncAction";

type Platform = "WINDOWS" | "MAC" | "LINUX" | "ANDROID" | "IOS";
type Status = "BETA" | "RELEASE";

interface Category { id: string; name: string; slug: string; }

const PLATFORMS: Platform[] = ["WINDOWS", "MAC", "LINUX", "ANDROID", "IOS"];

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
        size: String(app.size),
        platform: Array.isArray(app.platform) ? app.platform : [app.platform].filter(Boolean) as Platform[],
        downloadUrl: app.downloadUrl, sourceUrl: app.sourceUrl ?? "",
        documentationUrl: app.documentationUrl ?? "",
        status: (app as any).status ?? "BETA", price: String(app.price ?? 0),
    };
}

interface AppModalProps {
    isOpen: boolean;
    app: App | null;
    categories: Category[];
    onClose: () => void;
    onSaved: (saved: App) => void;
}

export default function AppModal({ isOpen, app, categories, onClose, onSaved }: AppModalProps) {
    const [formData, setFormData] = useState<AppFormData>(app ? appToForm(app) : EMPTY_FORM);
    const { loading, error, run } = useAsyncAction<App>("Failed to save app");

    const set = (patch: Partial<AppFormData>) => setFormData(f => ({ ...f, ...patch }));

    const togglePlatform = (p: Platform) =>
        set({ platform: formData.platform.includes(p) ? formData.platform.filter(x => x !== p) : [...formData.platform, p] });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            size: Number(formData.size),
            price: Number(formData.price),
            screenshots: formData.screenshots.filter(Boolean),
            slug: formData.slug || undefined,
        };
        const saved = await run(() =>
            app ? AdminService.updateApp(app.id, payload) : AdminService.createApp(payload)
        );
        if (saved) onSaved(saved);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={app ? "Edit Application" : "Create Application"}
            maxWidth={760}
            footer={
                <>
                    <button type="button" className={btns.btnSecondary} onClick={onClose}>Cancel</button>
                    <button
                        type="submit"
                        form="app-modal-form"
                        className={btns.btnPrimary}
                        disabled={loading || formData.platform.length === 0}
                    >
                        {loading ? "Saving..." : app ? "Save Changes" : "Create App"}
                    </button>
                </>
            }
        >
            <form id="app-modal-form" onSubmit={handleSubmit}>
                {error && <div className={form.alertError}>{error}</div>}

                <p className={s.sectionTitle}>Basic Info</p>
                <div className={form.formGrid}>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Name *</label>
                        <input className={form.formInput} required value={formData.name} onChange={e => set({ name: e.target.value })} placeholder="App name" />
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Slug</label>
                        <input className={form.formInput} value={formData.slug} onChange={e => set({ slug: e.target.value })} placeholder="auto-generated if empty" />
                    </div>
                    <div className={`${form.formGroup} ${form.span2}`}>
                        <label className={form.formLabel}>Short Description * (10–200 chars)</label>
                        <input className={form.formInput} required minLength={10} maxLength={200} value={formData.shortDesc} onChange={e => set({ shortDesc: e.target.value })} placeholder="One-line description" />
                    </div>
                    <div className={`${form.formGroup} ${form.span2}`}>
                        <label className={form.formLabel}>Full Description * (min 50 chars)</label>
                        <textarea className={form.formTextarea} required minLength={50} rows={4} value={formData.description} onChange={e => set({ description: e.target.value })} placeholder="Detailed description..." />
                    </div>
                </div>

                <p className={s.sectionTitle}>Meta</p>
                <div className={form.formGrid}>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Version * (X.Y.Z)</label>
                        <input className={form.formInput} required pattern="^\d+\.\d+\.\d+$" value={formData.version} onChange={e => set({ version: e.target.value })} placeholder="1.0.0" />
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Price (AMD)</label>
                        <input className={form.formInput} type="number" min="0" value={formData.price} onChange={e => set({ price: e.target.value })} />
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Category *</label>
                        <select className={form.formSelect} required value={formData.categoryId} onChange={e => set({ categoryId: e.target.value })}>
                            <option value="">Select category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Status</label>
                        <select className={form.formSelect} value={formData.status} onChange={e => set({ status: e.target.value as Status })}>
                            <option value="BETA">Beta</option>
                            <option value="RELEASE">Release</option>
                        </select>
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Size (bytes) *</label>
                        <input className={form.formInput} required type="number" min="1" value={formData.size} onChange={e => set({ size: e.target.value })} placeholder="e.g. 52428800" />
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Tags</label>
                        <TagsInput tags={formData.tags} onChange={tags => set({ tags })} />
                    </div>
                </div>

                <p className={s.sectionTitle}>Platforms *</p>
                <div className={form.checkboxGroup}>
                    {PLATFORMS.map(p => (
                        <label key={p} className={`${form.checkboxChip} ${formData.platform.includes(p) ? form.checked : ""}`}>
                            <input type="checkbox" checked={formData.platform.includes(p)} onChange={() => togglePlatform(p)} />
                            {p}
                        </label>
                    ))}
                </div>

                <p className={s.sectionTitle}>URLs</p>
                <div className={form.formGrid}>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Icon URL *</label>
                        <input className={form.formInput} required type="url" value={formData.iconUrl} onChange={e => set({ iconUrl: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Cover URL</label>
                        <input className={form.formInput} type="url" value={formData.coverUrl} onChange={e => set({ coverUrl: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Download URL *</label>
                        <input className={form.formInput} required type="url" value={formData.downloadUrl} onChange={e => set({ downloadUrl: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Source URL</label>
                        <input className={form.formInput} type="url" value={formData.sourceUrl} onChange={e => set({ sourceUrl: e.target.value })} placeholder="https://github.com/..." />
                    </div>
                    <div className={`${form.formGroup} ${form.span2}`}>
                        <label className={form.formLabel}>Documentation URL</label>
                        <input className={form.formInput} type="url" value={formData.documentationUrl} onChange={e => set({ documentationUrl: e.target.value })} placeholder="https://..." />
                    </div>
                </div>

                <p className={s.sectionTitle}>Screenshots</p>
                <div className={form.screenshotList}>
                    {formData.screenshots.map((url, i) => (
                        <div key={i} className={form.screenshotRow}>
                            <input
                                className={`${form.formInput} ${form.screenshotInput}`}
                                type="url"
                                placeholder={`Screenshot ${i + 1} URL`}
                                value={url}
                                onChange={e => {
                                    const ss = [...formData.screenshots];
                                    ss[i] = e.target.value;
                                    set({ screenshots: ss });
                                }}
                            />
                            {formData.screenshots.length > 1 && (
                                <button type="button" className={btns.btnIconDanger} onClick={() => set({ screenshots: formData.screenshots.filter((_, j) => j !== i) })}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                    {formData.screenshots.length < 10 && (
                        <button type="button" className={btns.btnIconAdd} onClick={() => set({ screenshots: [...formData.screenshots, ""] })}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Add Screenshot
                        </button>
                    )}
                </div>

                <p className={s.sectionTitle}>Changelog</p>
                <textarea className={form.formTextarea} rows={3} placeholder="What's new in this version..." value={formData.changelog} onChange={e => set({ changelog: e.target.value })} />
            </form>
        </BaseModal>
    );
}
