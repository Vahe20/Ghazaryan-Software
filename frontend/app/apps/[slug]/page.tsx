"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/app/hooks";
import { useGetAppBySlugQuery, useGetAppPromotionsQuery, useGetAppEditionsQuery } from "@/src/features/api/appsApi";
import { usePurchaseAppMutation } from "@/src/features/api/paymentApi";
import { setUser } from "@/src/features/slices/authSlice";
import ConfirmModal from "@/src/components/shared/ConfirmModal/ConfirmModal";
import { calculateFinalPrice, extractErrorMessage } from "@/src/lib/utils";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { TopBar } from "./components/TopBar";
import { HeroSection } from "./components/HeroSection";
import { ScreenshotsSection } from "./components/ScreenshotsSection";
import { EditionsSection } from "./components/EditionsSection";
import { AboutSection } from "./components/AboutSection";
import { ChangelogSection } from "./components/ChangelogSection";
import { ReviewsSection } from "./components/ReviewsSection";
import style from "./page.module.scss";

export default function AppPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { data: app, isLoading, error } = useGetAppBySlugQuery(slug);
    const { data: promotions } = useGetAppPromotionsQuery(
        { appId: app?.id ?? "", activeOnly: true },
        { skip: !app }
    );
    const { data: editions } = useGetAppEditionsQuery(app?.id ?? "", { skip: !app });

    const user = useAppSelector((s) => s.auth.user);
    const [purchaseApp, { isLoading: purchasing, error: purchaseError }] = usePurchaseAppMutation();

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pendingPurchase, setPendingPurchase] = useState<{ id: string; name: string; price: number } | null>(
        null
    );
    const [activeScreenshot, setActiveScreenshot] = useState(0);

    const handlePurchaseClick = (id: string, name: string, price: number) => {
        if (!user) {
            router.push("/auth");
            return;
        }

        setPendingPurchase({ id, name, price });
        setConfirmModalOpen(true);
    };

    const handleConfirmPurchase = async () => {
        if (!pendingPurchase || !user) return;

        try {
            const result = await purchaseApp(pendingPurchase.id).unwrap();
            dispatch(
                setUser({
                    ...user,
                    balance: result.balance,
                    purchases: [...(user.purchases || []), result.purchase],
                })
            );
            setConfirmModalOpen(false);
            setPendingPurchase(null);
        } catch {
        }
    };

    if (isLoading) return <LoadingState />;

    if (error || !app) {
        return <ErrorState onBackToApps={() => router.push("/apps")} />;
    }

    const activePromotion = promotions?.[0];
    const basePrice = Number(app.price);
    const finalPrice = calculateFinalPrice(basePrice, activePromotion);
    const hasDiscount = finalPrice < basePrice;
    const discountPercent = hasDiscount ? Math.round((1 - finalPrice / basePrice) * 100) : 0;
    const isFree = basePrice === 0;

    const isPurchased = user?.purchases?.some((p) => p.appId === app.id);
    const reviews = app?.reviews ?? [];
    const purchaseErrorMsg = purchaseError ? extractErrorMessage(purchaseError, "Purchase failed") : null;
    const screenshots = app.screenshots ?? [];

    return (
        <div className={style.appPage}>
            <ConfirmModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmPurchase}
                title="Confirm Purchase"
                description={
                    pendingPurchase ? (
                        <div>
                            <p>
                                Purchase <strong>{pendingPurchase.name}</strong>?
                            </p>
                            <p className={style.modalPrice}>${pendingPurchase.price.toFixed(2)}</p>
                            {purchaseErrorMsg && <p className={style.modalError}>{purchaseErrorMsg}</p>}
                        </div>
                    ) : null
                }
                loading={purchasing}
                error={purchaseErrorMsg}
                confirmLabel="Confirm Purchase"
                cancelLabel="Cancel"
            />

            <TopBar onBack={() => router.back()} />

            <HeroSection
                app={app}
                isPurchased={isPurchased}
                hasDiscount={hasDiscount}
                discountPercent={discountPercent}
                isFree={isFree}
                basePrice={basePrice}
                finalPrice={finalPrice}
                activePromotion={activePromotion}
                purchasing={purchasing}
                onPurchase={handlePurchaseClick}
                onOpenLibrary={() => router.push("/library")}
            />

            <div className={style.appContent}>
                <ScreenshotsSection
                    appName={app.name}
                    screenshots={screenshots}
                    activeScreenshot={activeScreenshot}
                    onChangeActiveScreenshot={setActiveScreenshot}
                />

                <EditionsSection
                    editions={editions}
                    activePromotion={activePromotion}
                    purchasing={purchasing}
                    onPurchase={handlePurchaseClick}
                />

                <AboutSection app={app} />
                <ChangelogSection versions={app.versions} />
                <ReviewsSection reviews={reviews} />
            </div>
        </div>
    );
}
