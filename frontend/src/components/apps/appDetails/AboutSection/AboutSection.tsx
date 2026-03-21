"use client";

import type { App } from "@/src/types/Entities";
import style from "./AboutSection.module.scss";

interface AboutSectionProps {
    app: App;
}

export function AboutSection({ app }: AboutSectionProps) {
    return (
        <section className={style.section}>
            <h2 className={style.sectionTitle}>About</h2>
            <p className={style.aboutText}>{app.description}</p>

            <div className={style.aboutMeta}>
                {app.createdAt && (
                    <div className={style.metaItem}>
                        <span className={style.metaKey}>Release Date</span>
                        <span className={style.metaVal}>
                            {new Date(app.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </span>
                    </div>
                )}

                {app.size > 0 && (
                    <div className={style.metaItem}>
                        <span className={style.metaKey}>Size</span>
                        <span className={style.metaVal}>{(app.size / 1_048_576).toFixed(1)} MB</span>
                    </div>
                )}

                {app.minVersion && (
                    <div className={style.metaItem}>
                        <span className={style.metaKey}>Min Version</span>
                        <span className={style.metaVal}>{app.minVersion}</span>
                    </div>
                )}

                {app.sourceUrl && (
                    <div className={style.metaItem}>
                        <span className={style.metaKey}>Source</span>
                        <a href={app.sourceUrl} target="_blank" rel="noopener noreferrer" className={style.metaLink}>
                            GitHub ↗
                        </a>
                    </div>
                )}

                {app.documentationUrl && (
                    <div className={style.metaItem}>
                        <span className={style.metaKey}>Docs</span>
                        <a href={app.documentationUrl} target="_blank" rel="noopener noreferrer" className={style.metaLink}>
                            Documentation ↗
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}
