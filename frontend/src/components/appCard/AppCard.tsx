import Link from "next/link";
import { App } from "../../types/Entities";
import style from "./AppCard.module.scss"
import React from "react";


interface props {
    app: App;
}

export const AppCard: React.FC<props> = ({ app }) => {
    return (
        <Link
            key={app.id}
            href={`/apps/${app.slug}`}
            className={style.appCard}>
            <div className={style.appCard__image}>
                {app.coverUrl ? (
                    <img src={app.coverUrl} alt={app.name} />
                ) : (
                    <div className={style.appCard__placeholder}>
                        <img src={app.iconUrl} alt={app.name} />
                    </div>
                )}
            </div>
            <div className={style.appCard__content}>
                <div className={style.appCard__header}>
                    <img
                        src={app.iconUrl}
                        alt={app.name}
                        className={style.appCard__icon}
                    />
                    <div className={style.appCard__info}>
                        <h3 className={style.appCard__title}>{app.name}</h3>
                        <p className={style.appCard__category}>
                            {app.category.name}
                        </p>
                    </div>
                </div>
                <p className={style.appCard__description}>{app.shortDesc}</p>
                <div className={style.appCard__stats}>
                    <span className={style.appCard__stat}>
                        ⭐ {app.rating.toFixed(1)} ({app.reviewCount})
                    </span>
                    <span className={style.appCard__stat}>
                        ⬇️ {app.downloadCount.toLocaleString()}
                    </span>
                    <span className={style.appCard__price}>
                        {app.price?.toLocaleString()} dram
                    </span>
                </div>
            </div>
        </Link>
    )
}