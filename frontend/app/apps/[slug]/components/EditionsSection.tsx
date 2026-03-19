"use client";

import Link from "next/link";
import { calculateFinalPrice } from "@/src/lib/utils";
import type { App, AppPromotion } from "@/src/types/Entities";
import style from "../page.module.scss";

interface EditionsSectionProps {
    editions?: App[];
    activePromotion?: AppPromotion;
    purchasing: boolean;
    onPurchase: (id: string, name: string, price: number) => void;
}

export function EditionsSection({ editions, activePromotion, purchasing, onPurchase }: EditionsSectionProps) {
    if (!editions || editions.length === 0) {
        return null;
    }

    return (
        <section className={style.section}>
            <h2 className={style.sectionTitle}>Available Editions</h2>
            <div className={style.editionsList}>
                {editions.map((edition) => {
                    const editionBase = Number(edition.price);
                    const editionFinal = calculateFinalPrice(editionBase, activePromotion);
                    const editionHasDiscount = editionFinal < editionBase;
                    const editionPct = editionHasDiscount ? Math.round((1 - editionFinal / editionBase) * 100) : 0;

                    return (
                        <div key={edition.id} className={style.editionCard}>
                            <div className={style.editionInfo}>
                                <Link href={edition.slug ? `/apps/${edition.slug}` : '/apps'} className={style.editionName}>
                                    {edition.name}
                                </Link>
                                {edition.shortDesc && <p className={style.editionDesc}>{edition.shortDesc}</p>}
                            </div>

                            <div className={style.editionPriceRow}>
                                {editionHasDiscount && <span className={style.discountPill}>-{editionPct}%</span>}

                                <div className={style.priceStack}>
                                    {editionHasDiscount && <span className={style.oldPriceSm}>${editionBase.toFixed(2)}</span>}
                                    <span className={style.newPriceSm}>${editionFinal.toFixed(2)}</span>
                                </div>

                                <button
                                    onClick={() => onPurchase(edition.id, edition.name, editionFinal)}
                                    disabled={purchasing}
                                    className={style.buyBtnSm}
                                >
                                    {purchasing ? "..." : "Buy"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
