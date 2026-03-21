"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { NewsItem, TagColor } from "@/src/types/Entities";
import { useCreateNewsMutation, useUpdateNewsMutation } from "@/src/features/api/newsApi";
import { useUploadFileMutation } from "@/src/features/api/appsApi";
import { extractErrorMessage } from "@/src/lib/utils";
import BaseModal from "@/src/components/shared/BaseModal/BaseModal";
import form from "../../shared/_form.module.scss";
import btns from "../../shared/_buttons.module.scss";
import s from "./NewsModal.module.scss";

const TAG_COLORS: TagColor[] = ["BLUE", "PINK", "PURPLE", "GREEN"];
const TAG_COLOR_LABELS: Record<TagColor, string> = {
    BLUE: "Blue", PINK: "Pink", PURPLE: "Purple", GREEN: "Green",
};
const TAG_COLOR_STYLES: Record<TagColor, React.CSSProperties> = {
    BLUE: { background: "rgba(0,132,255,.15)", color: "rgb(0,132,255)" },
    PINK: { background: "rgba(255,0,110,.15)", color: "rgb(255,0,110)" },
    PURPLE: { background: "rgba(124,58,237,.15)", color: "rgb(124,58,237)" },
    GREEN: { background: "rgba(0,186,136,.15)", color: "rgb(0,186,136)" },
};

interface FormData {
    title: string;
    description: string;
    tag: string;
    tagColor: TagColor;
    link: string;
    publishedAt: string;
    coverUrl: string;
}

function itemToForm(item: NewsItem): FormData {
    return {
        title: item.title,
        description: item.description,
        tag: item.tag,
        tagColor: item.tagColor,
        link: item.link ?? "",
        publishedAt: new Date(item.publishedAt).toISOString().slice(0, 16),
        coverUrl: item.coverUrl ?? "",
    };
}

const EMPTY: FormData = {
    title: "", description: "", tag: "", tagColor: "BLUE",
    link: "", publishedAt: new Date().toISOString().slice(0, 16), coverUrl: "",
};

interface Props {
    isOpen: boolean;
    item: NewsItem | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function NewsModal({ isOpen, item, onClose, onSaved }: Props) {
    const [createNews, { isLoading: creating, error: createError }] = useCreateNewsMutation();
    const [updateNews, { isLoading: updating, error: updateError }] = useUpdateNewsMutation();
    const [uploadFile] = useUploadFileMutation();

    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string>("");
    const [uploadingCover, setUploadingCover] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const loading = creating || updating || uploadingCover;
    const apiError = createError || updateError;

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
        defaultValues: item ? itemToForm(item) : EMPTY,
    });

    useEffect(() => {
        reset(item ? itemToForm(item) : EMPTY);
        setCoverFile(null);
        setCoverPreview(item?.coverUrl ?? "");
    }, [item, isOpen, reset]);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const onSubmit = async (data: FormData) => {
        let coverUrl = data.coverUrl;

        if (coverFile) {
            setUploadingCover(true);
            try {
                const res = await uploadFile({ type: "news", file: coverFile }).unwrap();
                coverUrl = res.url;
            } finally {
                setUploadingCover(false);
            }
        }

        const payload = {
            title: data.title,
            description: data.description,
            tag: data.tag,
            tagColor: data.tagColor,
            link: data.link || null,
            coverUrl: coverUrl || null,
            publishedAt: new Date(data.publishedAt),
        };

        try {
            if (item) {
                await updateNews({ id: item.id, data: payload }).unwrap();
            } else {
                await createNews(payload).unwrap();
            }
            onSaved();
        } catch {
            
        }
    };

    const errorMessage = apiError ? extractErrorMessage(apiError, "Failed to save") : null;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={item ? "Edit news" : "New news"}
            maxWidth={640}
            footer={
                <>
                    <button type="button" className={btns.btnSecondary} onClick={onClose}>Cancel</button>
                    <button type="submit" form="news-modal-form" className={btns.btnPrimary} disabled={loading}>
                        {loading ? "Saving..." : item ? "Save" : "Create"}
                    </button>
                </>
            }
        >
            <form id="news-modal-form" onSubmit={handleSubmit(onSubmit)}>
                {errorMessage && <div className={form.alertError}>{errorMessage}</div>}

                <div className={s.coverSection}>
                    <div
                        className={s.coverPreview}
                        style={coverPreview ? { backgroundImage: `url(${coverPreview})` } : undefined}
                        onClick={() => fileRef.current?.click()}
                    >
                        {!coverPreview && (
                            <div className={s.coverPlaceholder}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Click to upload cover</span>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpg,image/jpeg,image/webp"
                        style={{ display: "none" }}
                        onChange={handleCoverChange}
                    />
                    {coverPreview && (
                        <button
                            type="button"
                            className={s.removeCover}
                            onClick={() => { setCoverPreview(""); setCoverFile(null); }}
                        >
                            Remove cover
                        </button>
                    )}
                </div>

                <div className={form.formGrid}>
                    <div className={`${form.formGroup} ${form.span2}`}>
                        <label className={form.formLabel}>Title *</label>
                        <input
                            className={form.formInput}
                            placeholder="News title"
                            {...register("title", { required: "Title is required", maxLength: 200 })}
                        />
                        {errors.title && <span className={form.formError}>{errors.title.message}</span>}
                    </div>

                    <div className={`${form.formGroup} ${form.span2}`}>
                        <label className={form.formLabel}>Description *</label>
                        <textarea
                            className={form.formTextarea}
                            rows={4}
                            placeholder="News text..."
                            {...register("description", { required: "Description is required" })}
                        />
                        {errors.description && <span className={form.formError}>{errors.description.message}</span>}
                    </div>

                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Tag *</label>
                        <input
                            className={form.formInput}
                            placeholder="Update, New..."
                            {...register("tag", { required: "Tag is required", maxLength: 50 })}
                        />
                        {errors.tag && <span className={form.formError}>{errors.tag.message}</span>}
                    </div>

                    <div className={form.formGroup}>
                        <label className={form.formLabel}>Publish date</label>
                        <input className={form.formInput} type="datetime-local" {...register("publishedAt")} />
                    </div>

                    <div className={`${form.formGroup} ${form.span2}`}>
                        <label className={form.formLabel}>Tag color</label>
                        <Controller
                            control={control}
                            name="tagColor"
                            render={({ field }) => (
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {TAG_COLORS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => field.onChange(c)}
                                            style={{
                                                ...TAG_COLOR_STYLES[c],
                                                padding: "5px 14px",
                                                borderRadius: 9999,
                                                fontSize: 13,
                                                fontWeight: 700,
                                                cursor: "pointer",
                                                transition: "all .2s",
                                                outline: field.value === c ? "2px solid currentColor" : "none",
                                                outlineOffset: 2,
                                                opacity: field.value === c ? 1 : 0.55,
                                            }}
                                        >
                                            {TAG_COLOR_LABELS[c]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        />
                    </div>

                    <div className={`${form.formGroup} ${form.span2}`}>
                        <label className={form.formLabel}>Link (optional)</label>
                        <input className={form.formInput} {...register("link")} placeholder="/apps or https://example.com" />
                    </div>
                </div>
            </form>
        </BaseModal>
    );
}
