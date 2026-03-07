"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { App } from "@/src/types/Entities";
import { useGetAppVersionsQuery, useCreateAppVersionMutation, useUploadFileMutation } from "@/src/features/api/appsApi";
import BaseModal from "@/src/components/shared/BaseModal/BaseModal";
import { extractErrorMessage, formatDate } from "@/src/lib/utils";
import s from "./VersionsModal.module.scss";
import form from "../../shared/_form.module.scss";
import btns from "../../shared/_buttons.module.scss";

interface VersionsModalProps {
    isOpen: boolean;
    app: App;
    onClose: () => void;
}

interface VersionFormData {
    version: string;
    changelog: string;
    status: "BETA" | "RELEASE";
    downloadUrl: string;
}

const EMPTY_FORM: VersionFormData = {
    version: "",
    changelog: "",
    status: "RELEASE",
    downloadUrl: "",
};

export default function VersionsModal({ isOpen, app, onClose }: VersionsModalProps) {
    const [showForm, setShowForm] = useState(false);
    const [downloadFile, setDownloadFile] = useState<File | null>(null);

    const { data: versions, isLoading } = useGetAppVersionsQuery(app.id, { skip: !isOpen });
    const [createVersion, { isLoading: creating, error: createError }] = useCreateAppVersionMutation();
    const [uploadFile] = useUploadFileMutation();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<VersionFormData>({
        defaultValues: EMPTY_FORM,
    });

    const onSubmit = async (data: VersionFormData) => {
        try {
            let downloadUrl = data.downloadUrl;

            if (!downloadFile) {
                throw new Error("Please upload a file");
            }

            const res = await uploadFile({ type: "archives", file: downloadFile }).unwrap();
            downloadUrl = res.url;

            await createVersion({
                appId: app.id,
                version: data.version,
                changelog: data.changelog || undefined,
                status: data.status,
                downloadUrl: downloadUrl,
            }).unwrap();
            reset(EMPTY_FORM);
            setShowForm(false);
        } catch { }
    };

    const handleCancel = () => {
        setShowForm(false);
        reset(EMPTY_FORM);
    };

    const handleDownloadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setDownloadFile(file);
    };

    const downloadRef = useRef<HTMLInputElement>(null);

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={`Version History - ${app.name}`}>
            <div className={s.container}>
                <div className={s.header}>
                    <p className={s.subtitle}>
                        Track and publish new versions of your application
                    </p>
                    {!showForm && (
                        <button className={btns.btnPrimary} onClick={() => setShowForm(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Add Version
                        </button>
                    )}
                </div>

                {showForm && (
                    <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
                        <div className={s.formHeader}>
                            <h3>New Version</h3>
                            <button type="button" onClick={handleCancel} className={s.closeBtn}>×</button>
                        </div>

                        <div className={form.formGrid2}>
                            <div className={form.formGroup}>
                                <label className={form.label}>
                                    Version Number <span className={form.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className={form.input}
                                    placeholder="e.g., 2.1.0"
                                    {...register('version', { required: 'Version is required' })}
                                />
                                {errors.version && <span className={form.error}>{errors.version.message}</span>}
                            </div>

                            <div className={form.formGroup}>
                                <label className={form.label}>Status</label>
                                <select className={form.select} {...register('status')}>
                                    <option value="RELEASE">Release</option>
                                    <option value="BETA">Beta</option>
                                </select>
                            </div>
                        </div>

                        <div className={form.formGroup}>
                            <label className={form.label}>Changelog</label>
                            <textarea
                                className={form.textarea}
                                rows={8}
                                placeholder="What's new in this version?&#10;&#10;• New feature 1&#10;• Bug fix 2&#10;• Improvement 3"
                                {...register('changelog')}
                            />
                        </div>

                        <div className={form.formGroup}>
                            <label className={form.label}>upload Archive <span className={form.required}>*</span></label>
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
                            {errors.downloadUrl && <span className={form.error}>{errors.downloadUrl.message}</span>}
                        </div>

                        {createError && (
                            <div className={form.errorBox}>{extractErrorMessage(createError, "Failed to publish version")}</div>
                        )}

                        <div className={s.formActions}>
                            <button type="button" onClick={handleCancel} className={btns.btnSecondary}>
                                Cancel
                            </button>
                            <button type="submit" disabled={creating} className={btns.btnPrimary}>
                                {creating ? 'Publishing...' : 'Publish Version'}
                            </button>
                        </div>
                    </form>
                )}

                <div className={s.versionsList}>
                    {isLoading ? (
                        <div className={s.loading}>Loading versions...</div>
                    ) : !versions || versions.length === 0 ? (
                        <div className={s.empty}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14 2v6h6M12 18v-6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p>No versions yet</p>
                        </div>
                    ) : (
                        <div className={s.timeline}>
                            {versions.map((version, index) => (
                                <div key={version.id} className={s.versionCard}>
                                    <div className={s.timelineDot}>
                                        {index === 0 && (
                                            <span className={s.latestBadge}>Latest</span>
                                        )}
                                    </div>
                                    <div className={s.versionContent}>
                                        <div className={s.versionHeader}>
                                            <div>
                                                <h4>Version {version.version}</h4>
                                                <span className={s.versionDate}>
                                                    Released {formatDate(version.releaseDate)}
                                                </span>
                                            </div>
                                            <span className={`${s.statusBadge} ${s[version.status.toLowerCase()]}`}>
                                                {version.status}
                                            </span>
                                        </div>
                                        {version.changelog && (
                                            <div className={s.changelog}>
                                                {version.changelog.split('\n').map((line, i) => (
                                                    <p key={i}>{line}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </BaseModal>
    );
}
