"use client";

import style from "./ScreenshotsSection.module.scss";

interface ScreenshotsSectionProps {
    appName: string;
    screenshots: string[];
    activeScreenshot: number;
    onChangeActiveScreenshot: (index: number) => void;
}

export function ScreenshotsSection({
    appName,
    screenshots,
    activeScreenshot,
    onChangeActiveScreenshot,
}: ScreenshotsSectionProps) {
    if (screenshots.length === 0) {
        return null;
    }

    return (
        <section className={style.section}>
            <h2 className={style.sectionTitle}>Screenshots</h2>
            <div className={style.screenshotViewer}>
                <div className={style.screenshotMain}>
                    <img
                        key={activeScreenshot}
                        src={screenshots[activeScreenshot]}
                        alt={`${appName} screenshot ${activeScreenshot + 1}`}
                        className={style.screenshotBig}
                    />

                    {screenshots.length > 1 && (
                        <>
                            <button
                                className={`${style.ssNav} ${style.ssNavPrev}`}
                                onClick={() =>
                                    onChangeActiveScreenshot((activeScreenshot - 1 + screenshots.length) % screenshots.length)
                                }
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M15 18l-6-6 6-6"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>

                            <button
                                className={`${style.ssNav} ${style.ssNavNext}`}
                                onClick={() => onChangeActiveScreenshot((activeScreenshot + 1) % screenshots.length)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M9 18l6-6-6-6"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>

                            <div className={style.ssDots}>
                                {screenshots.map((_, i) => (
                                    <button
                                        key={i}
                                        className={`${style.ssDot} ${i === activeScreenshot ? style.ssDotActive : ""}`}
                                        onClick={() => onChangeActiveScreenshot(i)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {screenshots.length > 1 && (
                    <div className={style.screenshotThumbs}>
                        {screenshots.map((src, i) => (
                            <button
                                key={i}
                                className={`${style.ssThumbnail} ${i === activeScreenshot ? style.ssThumbnailActive : ""}`}
                                onClick={() => onChangeActiveScreenshot(i)}
                            >
                                <img src={src} alt={`Screenshot ${i + 1}`} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
