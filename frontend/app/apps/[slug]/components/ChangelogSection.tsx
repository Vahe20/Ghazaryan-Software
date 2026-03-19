"use client";

import type { AppVersion } from "@/src/types/Entities";
import style from "../page.module.scss";

interface ChangelogSectionProps {
    versions?: AppVersion[];
}

export function ChangelogSection({ versions }: ChangelogSectionProps) {
    if (!versions || versions.length === 0) {
        return null;
    }

    return (
        <section className={style.section}>
            <h2 className={style.sectionTitle}>Changelog</h2>
            <div className={style.timeline}>
                {versions.map((version, i) => (
                    <div key={version.id} className={style.timelineItem}>
                        <div className={style.timelineDot} />
                        {i < versions.length - 1 && <div className={style.timelineLine} />}

                        <div className={style.timelineContent}>
                            <div className={style.timelineHeader}>
                                <span className={style.versionTag}>{version.version}</span>
                                <span className={style.versionStatus}>{version.status}</span>
                                <span className={style.versionDate}>{new Date(version.releaseDate).toLocaleDateString()}</span>
                            </div>

                            {version.changelog && <p className={style.versionChangelog}>{version.changelog}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
