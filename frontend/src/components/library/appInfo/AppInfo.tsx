"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/src/app/hooks";
import { useGetAppByIdQuery, useRecordDownloadMutation } from "@/src/features/api/appsApi";
import { formatSize } from "@/src/lib/utils";
import BaseModal from "../../shared/BaseModal/BaseModal";
import style from "./AppInfo.module.scss";

export const AppInfo = () => {
    const selectedAppId = useAppSelector(s => s.library.selectedAppId);
    const isValidSelectedAppId = Boolean(
        selectedAppId && selectedAppId !== "undefined" && selectedAppId !== "null"
    );
    const { data: app, isLoading } = useGetAppByIdQuery(selectedAppId ?? "", {
        skip: !isValidSelectedAppId,
    });
    const [recordDownload] = useRecordDownloadMutation();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const goToNext = useCallback(() => {
        if (app?.screenshots) setCurrentSlide(p => (p + 1) % app.screenshots.length);
    }, [app]);

    const goToPrev = useCallback(() => {
        if (app?.screenshots) setCurrentSlide(p => (p - 1 + app.screenshots.length) % app.screenshots.length);
    }, [app]);

    const openModal = useCallback((index: number) => {
        setCurrentSlide(index);
        setModalIsOpen(true);
    }, []);

    const closeModal = useCallback(() => setModalIsOpen(false), []);

    useEffect(() => {
        if (!modalIsOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") goToPrev();
            else if (e.key === "ArrowRight") goToNext();
            else if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [modalIsOpen, goToNext, goToPrev, closeModal]);

    if (!isValidSelectedAppId) {
        return (
            <div className={style.placeholder}>
                <div className={style.placeholder__canvas}>
                    <div className={style.placeholder__ring} aria-hidden />
                    <div className={style.placeholder__ring2} aria-hidden />
                    <svg viewBox="0 0 80 80" fill="none" className={style.placeholder__svg}>
                        <rect x="8" y="8" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2"/>
                        <rect x="44" y="8" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2"/>
                        <rect x="8" y="44" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2"/>
                        <rect x="44" y="44" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                </div>
                <h2 className={style.placeholder__title}>Select an app</h2>
                <p className={style.placeholder__sub}>Click on an app from your library to view its details</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={style.loading}>
                <div className={style.loading__spinner} />
            </div>
        );
    }

    if (!app) {
        return (
            <div className={style.placeholder}>
                <p style={{ color: "var(--error, #f02849)" }}>App not found</p>
            </div>
        );
    }

    const downloadUrl = app.versions?.[0]?.downloadUrl;

    return (
        <div className={style.view} key={app.id}>
            <div className={style.hero}>
                <div className={style.hero__bg} style={{ backgroundImage: `url(${app.iconUrl})` }} aria-hidden />
                <div className={style.hero__veil} aria-hidden />

                <div className={style.hero__content}>
                    <div className={style.hero__icon}>
                        <img src={app.iconUrl} alt={app.name} className={style.hero__img} />
                    </div>

                    <div className={style.hero__info}>
                        <div className={style.hero__nameLine}>
                            <h1 className={style.hero__name}>{app.name}</h1>
                            <span className={`${style.hero__status} ${app.status === "BETA" ? style.hero__status_beta : style.hero__status_release}`}>
                                {app.status === "BETA" ? "Beta" : "Release"}
                            </span>
                        </div>

                        {app.shortDesc && (
                            <p className={style.hero__desc}>{app.shortDesc}</p>
                        )}

                        <div className={style.hero__chips}>
                            {app.category?.name && (
                                <span className={style.chip}>{app.category.name}</span>
                            )}
                            {app.platform?.map(p => (
                                <span key={p} className={style.chip}>{p}</span>
                            ))}
                            {app.size && (
                                <span className={style.chip}>{formatSize(app.size)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={style.actions}>
                {downloadUrl && (
                    <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className={style.downloadBtn} onClick={() => recordDownload({ id: app.id })}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 3v12M8 15l4 4 4-4M5 19h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download
                    </a>
                )}
                {app.sourceUrl && (
                    <a href={app.sourceUrl} target="_blank" rel="noopener noreferrer" className={style.btn}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"
                                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Source Code
                    </a>
                )}
                {app.documentationUrl && (
                    <a href={app.documentationUrl} target="_blank" rel="noopener noreferrer" className={style.btn}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9 12h6M9 16h6M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2z"
                                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                        Docs
                    </a>
                )}
                {app.slug && (
                    <Link href={`/apps/${app.slug}`} className={style.btn}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                            <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                        View in Store
                    </Link>
                )}
            </div>

            {app.description && (
                <section className={style.block}>
                    <h2 className={style.block__title}>
                        <svg viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M10 9v5M10 7v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                        About
                    </h2>
                    <p className={style.block__text}>{app.description}</p>
                </section>
            )}

            {app.screenshots && app.screenshots.length > 0 && (
                <section className={style.block}>
                    <h2 className={style.block__title}>
                        <svg viewBox="0 0 20 20" fill="none">
                            <rect x="2" y="3.5" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="7" cy="9" r="2" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M2 14l4-3 3 2.5 3-3.5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Screenshots
                        <span className={style.block__badge}>{app.screenshots.length}</span>
                    </h2>
                    <div className={style.shots}>
                        {app.screenshots.map((src, i) => (
                            <button key={i} className={style.shot} onClick={() => openModal(i)} type="button">
                                <img src={src} alt={`${app.name} screenshot ${i + 1}`} className={style.shot__img} />
                                <div className={style.shot__overlay} aria-hidden>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {modalIsOpen && app?.screenshots && (
                <BaseModal isOpen={modalIsOpen} onClose={closeModal} title={app.name} maxWidth={1200}>
                    <div className={style.lb}>
                        <p className={style.lb__counter}>{currentSlide + 1} / {app.screenshots.length}</p>

                        <div className={style.lb__stage}>
                            <button className={style.lb__arrow} onClick={goToPrev} aria-label="Previous">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            <div className={style.lb__frame}>
                                <img
                                    key={currentSlide}
                                    src={app.screenshots[currentSlide]}
                                    alt={`Screenshot ${currentSlide + 1}`}
                                    className={style.lb__img}
                                />
                            </div>

                            <button className={style.lb__arrow} onClick={goToNext} aria-label="Next">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>

                        <div className={style.lb__dots}>
                            {app.screenshots.map((_, i) => (
                                <button
                                    key={i}
                                    className={`${style.lb__dot} ${i === currentSlide ? style.lb__dot_on : ""}`}
                                    onClick={() => setCurrentSlide(i)}
                                    aria-label={`Go to screenshot ${i + 1}`}
                                    type="button"
                                />
                            ))}
                        </div>

                        <div className={style.lb__strip}>
                            {app.screenshots.map((src, i) => (
                                <button
                                    key={i}
                                    className={`${style.lb__thumb} ${i === currentSlide ? style.lb__thumb_on : ""}`}
                                    onClick={() => setCurrentSlide(i)}
                                    type="button"
                                >
                                    <img src={src} alt={`Thumbnail ${i + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </BaseModal>
            )}
        </div>
    );
};
