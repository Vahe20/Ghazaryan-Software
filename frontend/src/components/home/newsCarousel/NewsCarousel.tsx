"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useGetNewsQuery } from "@/src/features/api/newsApi";
import { NewsItem, TagColor } from "@/src/types/Entities";
import style from "./NewsCarousel.module.scss";

const COLOR_MAP: Record<TagColor, string> = {
  BLUE: "blue",
  PINK: "pink",
  PURPLE: "purple",
  GREEN: "green",
};

const FALLBACK: NewsItem[] = [
  {
    id: "1",
    tag: "Platform",
    tagColor: "BLUE",
    title: "Welcome to Ghazaryan Software",
    description: "Discover hundreds of apps, tools, and software solutions for any task.",
    link: "/apps",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function NewsCarousel() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { data, isLoading } = useGetNewsQuery({ limit: 10 });

  useEffect(() => {
    if (data?.news && data.news.length > 0) {
      setItems(data.news);
    } else if (!isLoading) {
      setItems(FALLBACK);
    }
  }, [data, isLoading]);

  const total = items.length;

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || total === 0) return;
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent((index + total) % total);
        setIsAnimating(false)
      }, 350);
    },
    [isAnimating, total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, total]);

  if (isLoading || items.length === 0) {
    return (
      <section className={style.carousel}>
        <div className={style.bg}><div className={`${style.orb} ${style.orb_blue}`} /></div>
        <div className={style.skeleton} />
      </section>
    );
  }

  const news = items[current];
  const color = COLOR_MAP[news.tagColor] ?? "blue";

  return (
    <section className={style.carousel}>
      {}
      <div className={style.bg}>
        {news.coverUrl && (
          <div
            className={style.cover}
            style={{ backgroundImage: `url(${news.coverUrl})` }}
          />
        )}
        <div className={`${style.orb} ${style[`orb_${color}`]}`} />
        <div className={style.gridPattern} aria-hidden />
      </div>

      {}
      <div className={`${style.slide} ${isAnimating ? style.slide_animating : ""}`}>
        <div className={style.slide__inner}>
          <div className={`${style.tag} ${style[`tag_${color}`]}`}>
            <span className={style.tag__dot} />
            {news.tag}
          </div>

          <time className={style.date}>
            {new Date(news.publishedAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>

          <h1 className={style.title}>{news.title}</h1>
          <p className={style.description}>{news.description}</p>

          {news.link && (
            <Link href={news.link} className={style.button}>
              Read more
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {}
      {total > 1 && (
        <div className={style.controls}>
          <button className={style.arrow} onClick={prev} aria-label="Previous news">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className={style.dots}>
            {items.map((_, i) => (
              <button
                key={i}
                className={`${style.dot} ${i === current ? style.dot_active : ""}`}
                onClick={() => goTo(i)}
                aria-label={`News ${i + 1}`}
              />
            ))}
          </div>

          <button className={style.arrow} onClick={next} aria-label="Next news">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {}
      {total > 1 && (
        <div className={style.progressBar}>
          <div key={`${current}-${news.id}`} className={style.progressFill} />
        </div>
      )}
    </section>
  );
}
