"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { App } from "@/src/types/Entities";
import { useCreateAppMutation, useUpdateAppMutation, useUploadFileMutation } from "@/src/features/api/appsApi";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import TagsInput from "../TagsInput/TagsInput";
import BaseModal from "@/src/components/shared/BaseModal/BaseModal";
import s from "./AppModal.module.scss";
import form from "../../shared/_form.module.scss";
import btns from "../../shared/_buttons.module.scss";

type Platform = "WINDOWS" | "MAC" | "LINUX" | "ANDROID" | "IOS";
type Status = "BETA" | "RELEASE";

interface Category { id: string; name: string; slug: string; }

const PLATFORMS: Platform[] = ["WINDOWS", "MAC", "LINUX", "ANDROID", "IOS"];

interface AppFormData {
    name: string;
    slug: string;
    shortDesc: string;
    description: string;
    version: string;
    changelog: string;
    iconUrl: string;
    coverUrl: string;
    screenshots: { value: string }[];
    categoryId: string;
    tags: string[];
    size: string;
    platform: Platform[];
    downloadUrl: string;
    sourceUrl: string;
    documentationUrl: string;
    status: Status;
    price: string;
}

function appToForm(app: App): AppFormData {
    const platforms = Array.isArray(app.platform)
        ? (app.platform as Platform[])
        : ([app.platform].filter(Boolean) as Platform[]);
    return {
        name: app.name,
        slug: app.slug,
        shortDesc: app.shortDesc,
        description: app.description,
        version: app.version,
        changelog: app.changelog ?? "",
        iconUrl: app.iconUrl,
        coverUrl: app.coverUrl ?? "",
        screenshots: app.screenshots?.length ? app.screenshots.map(v => ({ value: v })) : [{ value: "" }],
        categoryId: app.categoryId,
        tags: app.tags ?? [],
        size: String(app.size),
        platform: platforms,
        downloadUrl: app.downloadUrl,
        sourceUrl: app.sourceUrl ?? "",
        documentationUrl: app.documentationUrl ?? "",
        status: app.status ?? "BETA",
        price: String(app.price ?? 0),
    };
}

const EMPTY_FORM: AppFormData = {
    name: "", slug: "", shortDesc: "", description: "",
    version: "1.0.0", changelog: "", iconUrl: "", coverUrl: "",
    screenshots: [{ value: "" }], categoryId: "", tags: [],
    size: "", platform: [], downloadUrl: "",
    sourceUrl: "", documentationUrl: "",
    status: "BETA", price: "0",
};

interface AppModalProps {
    isOpen: boolean;
    app: App | null;
    categories: Category[];
    onClose: () => void;
    onSaved: () => void;
}

export default function AppModal({ isOpen, app, categories, onClose, onSaved }: AppModalProps) {
    const [createApp, { isLoading: creating, error: createError }] = useCreateAppMutation();
    const [updateApp, { isLoading: updating, error: updateError }] = useUpdateAppMutation();
    const [uploadFile] = useUploadFileMutation();

    const loading = creating || updating;
    const apiError = createError || updateError;

    const [iconFile, setIconFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [archiveFile, setArchiveFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string>("");
    const [coverPreview, setCoverPreview] = useState<string>("");
    const [uploadingFiles, setUploadingFiles] = useState(false);

    const iconRef = useRef<HTMLInputElement>(null);
    const coverRef = useRef<HTMLInputElement>(null);
    const archiveRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<AppFormData>({
        defaultValues: app ? appToForm(app) : EMPTY_FORM,
    });

    const { fields: screenshotFields, append: addScreenshot, remove: removeScreenshot } = useFieldArray({
        control,
        name: "screenshots",
    });

    const watchedPlatforms = watch("platform");
    const watchedTags = watch("tags");

    useEffect(() => {
        reset(app ? appToForm(app) : EMPTY_FORM);
        setIconFile(null);
        setCoverFile(null);
        setArchiveFile(null);
        setIconPreview(app?.iconUrl ?? "");
        setCoverPreview(app?.coverUrl ?? "");
    }, [app, isOpen, reset]);

    const togglePlatform = (p: Platform) => {
        const current = watchedPlatforms ?? [];
        if (current.includes(p)) {
            setValue("platform", current.filter(x => x !== p));
        } else {
            setValue("platform", [...current, p]);
        }
    };

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIconFile(file);
        setIconPreview(URL.createObjectURL(file));
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleArchiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setArchiveFile(file);
    };

    const onSubmit = async (data: AppFormData) => {
        try {
            setUploadingFiles(true);

            let iconUrl = data.iconUrl;
            let coverUrl = data.coverUrl;
            let downloadUrl = data.downloadUrl;

            if (iconFile) {
                const res = await uploadFile({ type: "avatar", file: iconFile }).unwrap();
                iconUrl = res.url;
            }

            if (coverFile) {
                const res = await uploadFile({ type: "screenshots", file: coverFile }).unwrap();
                coverUrl = res.url;
            }

            if (archiveFile) {
                const res = await uploadFile({ type: "archives", file: archiveFile }).unwrap();
                downloadUrl = res.url;
            }

            setUploadingFiles(false);

            const payload = {
                ...data,
                iconUrl,
                coverUrl: coverUrl || undefined,
                downloadUrl,
                size: Number(data.size),
                price: Number(data.price),
                screenshots: data.screenshots.map(s => s.value).filter(Boolean),
                slug: data.slug || undefined,
                sourceUrl: data.sourceUrl || undefined,
                documentationUrl: data.documentationUrl || undefined,
                changelog: data.changelog || undefined,
            };

            if (app) {
                await updateApp({ id: app.id, data: payload }).unwrap();
            } else {
                await createApp(payload).unwrap();
            }

            onSaved();
        } catch {
            setUploadingFiles(false);
        }
    };

    const busy = loading || uploadingFiles;

    const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string | null => {
        if (!error) return null;
        if ("message" in error && typeof error.message === "string") {
            return error.message;
        }
        if ("data" in error && error.data && typeof error.data === "object" && "message" in error.data) {
            return error.data.message as string;
        }
        return "Failed to save app";
    };

    const errorMessage = getErrorMessage(apiError);

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
                        disabled={busy || (watchedPlatforms?.length ?? 0) === 0}
                    >
                        {busy ? (uploadingFiles ? "Uploading..." : "Saving...") : app ? "Save Changes" : "Create App"}
                    </button>
                </>
            }
        >
            <form id="app-modal-form" onSubmit={handleSubmit(onSubmit)}>
                {errorMessage && <div className={form.alertError}>{errorMessage}</div>}

                <p className={s.sectionTitle}>Basic Info</p>
                <div className={form.formGrid}>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Name *</label>
                        <input
                            className={form.formInput}
                            placeholder="App name"
                            {...register("name", { required: "Name is required" })}
                        />
                        {errors.name && <span className={form.formError}>{errors.name.message}</span>}
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Slug</label>
                        <input className={form.formInput} {...register("slug")} placeholder="auto-generated if empty" />
                    </div>
                    <div className={`${form.formGroup} ${form.span2}`}>
                        <label className={form.formLabel}>Short Description * (10–200 chars)</label>
                        <input
                            className={form.formInput}
                            placeholder="One-line description"
                            {...register("shortDesc", {
                                required: "Short description is required",
                                minLength: { value: 10, message: "Min 10 chars" },
                                maxLength: { value: 200, message: "Max 200 chars" },
                            })}
                        />
                        {errors.shortDesc && <span className={form.formError}>{errors.shortDesc.message}</span>}
                    </div>
                    <div className={`${form.formGroup} ${form.span2}`}>
                        <label className={form.formLabel}>Full Description * (min 50 chars)</label>
                        <textarea
                            className={form.formTextarea}
                            rows={4}
                            placeholder="Detailed description..."
                            {...register("description", {
                                required: "Description is required",
                                minLength: { value: 50, message: "Min 50 chars" },
                            })}
                        />
                        {errors.description && <span className={form.formError}>{errors.description.message}</span>}
                    </div>
                </div>

                <p className={s.sectionTitle}>Meta</p>
                <div className={form.formGrid}>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Version * (X.Y.Z)</label>
                        <input
                            className={form.formInput}
                            placeholder="1.0.0"
                            {...register("version", {
                                required: "Version required",
                                pattern: { value: /^\d+\.\d+\.\d+$/, message: "Format: X.Y.Z" },
                            })}
                        />
                        {errors.version && <span className={form.formError}>{errors.version.message}</span>}
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Price (USD)</label>
                        <input className={form.formInput} type="number" min="0" {...register("price")} />
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Category *</label>
                        <select
                            className={form.formSelect}
                            {...register("categoryId", { required: "Category is required" })}
                        >
                            <option value="">Select category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.categoryId && <span className={form.formError}>{errors.categoryId.message}</span>}
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Status</label>
                        <select className={form.formSelect} {...register("status")}>
                            <option value="BETA">Beta</option>
                            <option value="RELEASE">Release</option>
                        </select>
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Size (bytes) *</label>
                        <input
                            className={form.formInput}
                            type="number"
                            min="1"
                            placeholder="e.g. 52428800"
                            {...register("size", { required: "Size is required" })}
                        />
                        {errors.size && <span className={form.formError}>{errors.size.message}</span>}
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Tags</label>
                        <Controller
                            control={control}
                            name="tags"
                            render={({ field }) => (
                                <TagsInput tags={field.value} onChange={field.onChange} />
                            )}
                        />
                    </div>
                </div>

                <p className={s.sectionTitle}>Platforms *</p>
                <div className={form.checkboxGroup}>
                    {PLATFORMS.map(p => (
                        <label
                            key={p}
                            className={`${form.checkboxChip} ${(watchedPlatforms ?? []).includes(p) ? form.checked : ""}`}
                        >
                            <input
                                type="checkbox"
                                checked={(watchedPlatforms ?? []).includes(p)}
                                onChange={() => togglePlatform(p)}
                            />
                            {p}
                        </label>
                    ))}
                </div>

                <p className={s.sectionTitle}>Files & Images</p>
                <div className={form.formGrid}>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Icon Image *</label>
                        <div className={s.fileUploadRow}>
                            {iconPreview && (
                                <img src={iconPreview} alt="icon" className={s.filePreviewThumb} />
                            )}
                            <button type="button" className={btns.btnSecondary} onClick={() => iconRef.current?.click()}>
                                {iconPreview ? "Change Icon" : "Upload Icon"}
                            </button>
                            <input ref={iconRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={handleIconChange} />
                        </div>
                        {!iconFile && (
                            <input
                                className={form.formInput}
                                style={{ marginTop: 6 }}
                                placeholder="Or paste icon URL"
                                {...register("iconUrl")}
                            />
                        )}
                        {errors.iconUrl && <span className={form.formError}>{errors.iconUrl.message}</span>}
                    </div>

                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Cover Image</label>
                        <div className={s.fileUploadRow}>
                            {coverPreview && (
                                <img src={coverPreview} alt="cover" className={s.filePreviewThumb} />
                            )}
                            <button type="button" className={btns.btnSecondary} onClick={() => coverRef.current?.click()}>
                                {coverPreview ? "Change Cover" : "Upload Cover"}
                            </button>
                            <input ref={coverRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={handleCoverChange} />
                        </div>
                        {!coverFile && (
                            <input
                                className={form.formInput}
                                style={{ marginTop: 6 }}
                                placeholder="Or paste cover URL"
                                {...register("coverUrl")}
                            />
                        )}
                    </div>

                    <div className={`${form.formGroup} ${form.span2}`}>
                        <label className={form.formLabel}>App Archive (zip) *</label>
                        <div className={s.fileUploadRow}>
                            <button type="button" className={btns.btnSecondary} onClick={() => archiveRef.current?.click()}>
                                {archiveFile ? `Selected: ${archiveFile.name}` : "Upload .zip"}
                            </button>
                            <input ref={archiveRef} type="file" accept="application/zip" style={{ display: "none" }} onChange={handleArchiveChange} />
                        </div>
                        {!archiveFile && (
                            <input
                                className={form.formInput}
                                style={{ marginTop: 6 }}
                                placeholder="Or paste download URL"
                                {...register("downloadUrl")}
                            />
                        )}
                    </div>
                </div>

                <p className={s.sectionTitle}>Additional URLs</p>
                <div className={form.formGrid}>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Source URL</label>
                        <input className={form.formInput} type="url" placeholder="https://github.com/..." {...register("sourceUrl")} />
                    </div>
                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Documentation URL</label>
                        <input className={form.formInput} type="url" placeholder="https://..." {...register("documentationUrl")} />
                    </div>
                </div>

                <p className={s.sectionTitle}>Screenshots (URLs)</p>
                <div className={form.screenshotList}>
                    {screenshotFields.map((field, i) => (
                        <div key={field.id} className={form.screenshotRow}>
                            <input
                                className={`${form.formInput} ${form.screenshotInput}`}
                                type="url"
                                placeholder={`Screenshot ${i + 1} URL`}
                                {...register(`screenshots.${i}.value`)}
                            />
                            {screenshotFields.length > 1 && (
                                <button type="button" className={btns.btnIconDanger} onClick={() => removeScreenshot(i)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                    {screenshotFields.length < 10 && (
                        <button type="button" className={btns.btnIconAdd} onClick={() => addScreenshot({ value: "" })}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Add Screenshot
                        </button>
                    )}
                </div>

                <p className={s.sectionTitle}>Changelog</p>
                <textarea
                    className={form.formTextarea}
                    rows={3}
                    placeholder="What's new in this version..."
                    {...register("changelog")}
                />
            </form>
        </BaseModal>
    );
}
