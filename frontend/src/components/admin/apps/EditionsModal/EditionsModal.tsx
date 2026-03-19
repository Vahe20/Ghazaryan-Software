"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { App } from "@/src/types/Entities";
import {
    useGetAppEditionsQuery,
    useCreateEditionMutation,
    useUpdateEditionMutation,
    useDeleteEditionMutation,
    useUploadFileMutation,
} from "@/src/features/api/appsApi";
import BaseModal from "@/src/components/shared/BaseModal/BaseModal";
import { extractErrorMessage, formatDate } from "@/src/lib/utils";
import s from "./EditionsModal.module.scss";
import form from "../../shared/_form.module.scss";
import btns from "../../shared/_buttons.module.scss";

interface EditionsModalProps {
    isOpen: boolean;
    app: App;
    onClose: () => void;
}

interface EditionFormData {
    name: string;
    slug: string;
    shortDesc: string;
    price: string;
    status: "BETA" | "RELEASE";
    iconUrl: string | null;
    downloadUrl: string | null;
}

const EMPTY_FORM: EditionFormData = {
    name: "",
    slug: "",
    shortDesc: "",
    price: "",
    status: "RELEASE",
    iconUrl: null,
    downloadUrl: null,
};

export default function EditionsModal({ isOpen, app, onClose }: EditionsModalProps) {
    const [editingEdition, setEditingEdition] = useState<App | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [downloadFile, setDownloadFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string>("");
    const [uploadingFiles, setUploadingFiles] = useState(false);

    const iconRef = useRef<HTMLInputElement>(null);
    const downloadRef = useRef<HTMLInputElement>(null);

    const { data: editions, isLoading } = useGetAppEditionsQuery(app.id, { skip: !isOpen });
    const [createEdition, { isLoading: creating, error: createError }] = useCreateEditionMutation();
    const [updateEdition, { isLoading: updating, error: updateError }] = useUpdateEditionMutation();
    const [deleteEdition, { isLoading: deleting }] = useDeleteEditionMutation();
    const [uploadFile] = useUploadFileMutation();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EditionFormData>({
        defaultValues: EMPTY_FORM,
    });

    const loading = creating || updating || deleting;
    const apiError = createError || updateError;

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIconFile(file);
        setIconPreview(URL.createObjectURL(file));
    };

    const handleDownloadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setDownloadFile(file);
    };

    const onSubmit = async (data: EditionFormData) => {
        try {
            setUploadingFiles(true);

            let iconUrl = data.iconUrl;
            let downloadUrl = data.downloadUrl;

            if (iconFile) {
                const res = await uploadFile({ type: "avatar", file: iconFile }).unwrap();
                iconUrl = res.url;
            }

            if (downloadFile) {
                const res = await uploadFile({ type: "archives", file: downloadFile, appName: data.name }).unwrap();
                downloadUrl = res.url;
            }

            if (!downloadUrl && !editingEdition) {
                throw new Error("Download file is required for new editions");
            }

            setUploadingFiles(false);

            const payload = {
                name: data.name,
                slug: data.slug || undefined,
                shortDesc: data.shortDesc || undefined,
                price: parseFloat(data.price),
                status: data.status,
                ...(iconUrl && { iconUrl }),
                ...(downloadUrl && { downloadUrl }),
            };

            if (editingEdition) {
                await updateEdition({
                    appId: app.id,
                    editionId: editingEdition.id,
                    data: payload,
                }).unwrap();
            } else {
                await createEdition({
                    appId: app.id,
                    ...payload,
                }).unwrap();
            }
            reset(EMPTY_FORM);
            setEditingEdition(null);
            setShowForm(false);
            setIconFile(null);
            setDownloadFile(null);
            setIconPreview("");
        } catch {
            setUploadingFiles(false);
        }
    };

    const handleEdit = (edition: App) => {
        setEditingEdition(edition);
        reset({
            name: edition.name,
            slug: edition.slug || "",
            shortDesc: edition.shortDesc || "",
            price: String(edition.price),
            status: edition.status || "RELEASE",
            iconUrl: edition.iconUrl || null,
            downloadUrl: edition.versions?.[0]?.downloadUrl || null,
        });
        setIconPreview(edition.iconUrl || "");
        setShowForm(true);
    };

    const handleDelete = async (editionId: string) => {
        if (!confirm("Delete this edition? This action cannot be undone.")) return;
        try {
            await deleteEdition({ appId: app.id, editionId }).unwrap();
        } catch (err) {
            console.error('Failed to delete edition:', err);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingEdition(null);
        reset(EMPTY_FORM);
        setIconFile(null);
        setDownloadFile(null);
        setIconPreview("");
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={`Manage Editions — ${app.name}`}>
            <div className={s.container}>
                <div className={s.header}>
                    <p className={s.subtitle}>
                        Create different editions (Standard, Pro, Enterprise) with unique pricing
                    </p>
                    {!showForm && (
                        <button className={btns.btnPrimary} onClick={() => setShowForm(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Add Edition
                        </button>
                    )}
                </div>

                {showForm && (
                    <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
                        <div className={s.formHeader}>
                            <h3>{editingEdition ? "Edit Edition" : "New Edition"}</h3>
                            <button type="button" onClick={handleCancel} className={s.closeBtn}>×</button>
                        </div>

                        <div className={form.formGrid}>
                            <div className={form.formGroup}>
                                <label className={form.formLabel}>
                                    Name <span className={s.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className={form.formInput}
                                    placeholder="e.g., Pro Edition"
                                    {...register("name", { required: "Name is required" })}
                                />
                                {errors.name && <span className={form.formError}>{errors.name.message}</span>}
                            </div>

                            <div className={form.formGroup}>
                                <label className={form.formLabel}>Slug</label>
                                <input
                                    type="text"
                                    className={form.formInput}
                                    placeholder="e.g., pro-edition (auto if empty)"
                                    {...register("slug")}
                                />
                            </div>
                        </div>

                        <div className={form.formGroup}>
                            <label className={form.formLabel}>Short Description</label>
                            <input
                                type="text"
                                className={form.formInput}
                                placeholder="Brief description of this edition"
                                {...register("shortDesc")}
                            />
                        </div>

                        <div className={form.formGrid}>
                            <div className={form.formGroup}>
                                <label className={form.formLabel}>Icon Image</label>
                                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                    {iconPreview && (
                                        <img src={iconPreview} alt="icon" style={{ width: 48, height: 48, borderRadius: 4, objectFit: "cover" }} />
                                    )}
                                    <button type="button" className={btns.btnSecondary} onClick={() => iconRef.current?.click()}>
                                        {iconPreview ? "Change Icon" : "Upload Icon"}
                                    </button>
                                    <input
                                        ref={iconRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        style={{ display: "none" }}
                                        onChange={handleIconChange}
                                    />
                                </div>
                                {!iconFile && (
                                    <input
                                        className={form.formInput}
                                        style={{ marginTop: 6 }}
                                        type="url"
                                        placeholder="Or paste icon URL"
                                        {...register("iconUrl")}
                                    />
                                )}
                            </div>
                        </div>

                        <div className={form.formGrid}>
                            <div className={form.formGroup}>
                                <label className={form.formLabel}>
                                    Price ($) <span className={s.required}>*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className={form.formInput}
                                    placeholder="49.99"
                                    {...register("price", {
                                        required: "Price is required",
                                        min: { value: 0, message: "Price must be 0 or greater" },
                                    })}
                                />
                                {errors.price && <span className={form.formError}>{errors.price.message}</span>}
                            </div>

                            <div className={form.formGroup}>
                                <label className={form.formLabel}>Status</label>
                                <select className={form.formSelect} {...register("status")}>
                                    <option value="RELEASE">Release</option>
                                    <option value="BETA">Beta</option>
                                </select>
                            </div>
                        </div>

                        <div className={form.formGroup}>
                            <label className={form.formLabel}>
                                App File {!editingEdition && "*"} (Upload or enter URL)
                            </label>
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                                {downloadFile && <span className={form.formHint}>📦 {downloadFile.name}</span>}
                                <button type="button" className={btns.btnSecondary} onClick={() => downloadRef.current?.click()}>
                                    {downloadFile ? "Change File" : "Upload Archive"}
                                </button>
                                <input
                                    ref={downloadRef}
                                    type="file"
                                    accept=".zip,.rar,.7z,.exe,.msi,.dmg,.pkg,.tar,.gz,.deb,.rpm"
                                    style={{ display: "none" }}
                                    onChange={handleDownloadChange}
                                />
                            </div>
                            {!downloadFile && (
                                <input
                                    className={form.formInput}
                                    type="url"
                                    placeholder="Or paste direct download URL"
                                    {...register("downloadUrl", !editingEdition ? { required: "Download file is required for new editions" } : {})}
                                />
                            )}
                            {errors.downloadUrl && <span className={form.formError}>{errors.downloadUrl.message}</span>}
                        </div>

                        {apiError && (
                            <div className={form.alertError}>{extractErrorMessage(apiError, "Failed to save edition")}</div>
                        )}

                        <div className={s.formActions}>
                            <button type="button" onClick={handleCancel} className={btns.btnSecondary}>
                                Cancel
                            </button>
                            <button type="submit" disabled={loading || uploadingFiles} className={btns.btnPrimary}>
                                {uploadingFiles ? "Uploading..." : loading ? "Saving..." : editingEdition ? "Update Edition" : "Create Edition"}
                            </button>
                        </div>
                    </form>
                )}

                <div className={s.editionsList}>
                    {isLoading ? (
                        <div className={s.loading}>Loading editions...</div>
                    ) : !editions || editions.length === 0 ? (
                        <div className={s.empty}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M9 9h6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <p>No editions yet</p>
                        </div>
                    ) : (
                        editions.map(edition => (
                            <div key={edition.id} className={s.editionCard}>
                                <div className={s.editionInfo}>
                                    <div className={s.editionHeader}>
                                        <h4>{edition.name}</h4>
                                        <div className={s.editionBadges}>
                                            <span className={`${s.statusBadge} ${s[edition.status?.toLowerCase() || "release"]}`}>
                                                {edition.status}
                                            </span>
                                            <span className={s.priceBadge}>${Number(edition.price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    {edition.shortDesc && <p className={s.editionDesc}>{edition.shortDesc}</p>}
                                    {edition.slug && <p className={s.editionSlug}>/{edition.slug}</p>}
                                    <div className={s.editionMeta}>
                                        <span>Created {formatDate(edition.createdAt)}</span>
                                    </div>
                                </div>
                                <div className={s.editionActions}>
                                    <button
                                        onClick={() => handleEdit(edition)}
                                        className={s.editBtn}
                                        disabled={loading}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(edition.id)}
                                        className={s.deleteBtn}
                                        disabled={loading}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </BaseModal>
    );
}
