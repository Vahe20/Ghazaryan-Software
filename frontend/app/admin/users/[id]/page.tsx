"use client";

import { useEffect, useState, useCallback } from "react";
import {
	AdminUser,
	UserPurchase, UserDownload, UserReview,
	PurchaseStatus,
} from "@/src/types/Admin";
import { useParams, useRouter } from "next/navigation";
import RoleModal from "@/src/components/admin/users/RoleModal/RoleModal";
import DeleteUserModal from "@/src/components/admin/users/DeleteUserModal/DeleteUserModal";
import BanModal from "@/src/components/admin/users/BanModal/BanModal";
import UserAvatar from "@/src/components/admin/users/UserAvatar/UserAvatar";
import RoleBadge from "@/src/components/admin/users/RoleBadge/RoleBadge";
import Pagination from "@/src/components/admin/shared/Pagination/Pagination";
import { useAsyncAction } from "@/src/hooks/useAsyncAction";
import s from "../../../admin/admin.module.scss";
import us from "./userDetail.module.scss";

type Tab = "details" | "purchases" | "downloads" | "reviews";

const STATUS_LABELS: Record<PurchaseStatus, string> = {
	PENDING:   "Pending",
	COMPLETED: "Completed",
	FAILED:    "Failed",
	REFUNDED:  "Refunded",
};

const PLATFORM_ICONS: Record<string, string> = {
	WINDOWS: "🪟", MAC: "🍎", LINUX: "🐧", ANDROID: "🤖", IOS: "📱",
};

interface SubState<T> {
	items: T[];
	page: number;
	totalPages: number;
	total: number;
	loading: boolean;
}

function makeSubState<T>(): SubState<T> {
	return { items: [], page: 1, totalPages: 1, total: 0, loading: false };
}

export default function UserDetailPage() {
	const params = useParams();
	const router = useRouter();
	const id = typeof params?.id === "string"
		? params.id
		: Array.isArray(params?.id) ? params.id[0] : null;

	const [user,    setUser]    = useState<AdminUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [error,   setError]   = useState<string | null>(null);
	const [tab,     setTab]     = useState<Tab>("details");

	const [purState, setPurState] = useState<SubState<UserPurchase>>(makeSubState());
	const [dlState,  setDlState]  = useState<SubState<UserDownload>>(makeSubState());
	const [revState, setRevState] = useState<SubState<UserReview>>(makeSubState());

	const [roleModalOpen,   setRoleModalOpen]   = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [banModalOpen,    setBanModalOpen]    = useState(false);

	const { loading: unbanLoading, run: runUnban } = useAsyncAction<AdminUser>("Failed to unban user");

	useEffect(() => {
		if (!id) { router.push("/admin/users"); return; }
		let cancelled = false;
		async function load() {
			try {
				const data = await AdminService.getUserById(id as string);
				if (!cancelled) { setUser(data); setLoading(false); }
			} catch {
				if (!cancelled) { setError("Failed to load user"); setLoading(false); }
			}
		}
		load();
		return () => { cancelled = true; };
	}, [id, router]);

	const fetchPurchases = useCallback(async (page: number) => {
		if (!id) return;
		setPurState(p => ({ ...p, loading: true }));
		try {
			const data = await AdminService.getUserPurchases(id, { page, limit: 10 });
			setPurState({ items: data.purchases, page, totalPages: data.pagination.totalPages, total: data.pagination.total, loading: false });
		} catch {
			setPurState(p => ({ ...p, loading: false }));
		}
	}, [id]);

	const fetchDownloads = useCallback(async (page: number) => {
		if (!id) return;
		setDlState(p => ({ ...p, loading: true }));
		try {
			const data = await AdminService.getUserDownloads(id, { page, limit: 10 });
			setDlState({ items: data.downloads, page, totalPages: data.pagination.totalPages, total: data.pagination.total, loading: false });
		} catch {
			setDlState(p => ({ ...p, loading: false }));
		}
	}, [id]);

	const fetchReviews = useCallback(async (page: number) => {
		if (!id) return;
		setRevState(p => ({ ...p, loading: true }));
		try {
			const data = await AdminService.getUserReviews(id, { page, limit: 10 });
			setRevState({ items: data.reviews, page, totalPages: data.pagination.totalPages, total: data.pagination.total, loading: false });
		} catch {
			setRevState(p => ({ ...p, loading: false }));
		}
	}, [id]);

	useEffect(() => { if (tab === "purchases") fetchPurchases(purState.page); }, [tab]);
	useEffect(() => { if (tab === "downloads") fetchDownloads(dlState.page);  }, [tab]);
	useEffect(() => { if (tab === "reviews")   fetchReviews(revState.page);   }, [tab]);

	const handleRoleSaved = (u: AdminUser) => { setUser(u); setRoleModalOpen(false); };
	const handleBanSaved  = (u: AdminUser) => { setUser(u); setBanModalOpen(false); };
	const handleDeleted   = () => { setDeleteModalOpen(false); router.push("/admin/users"); };
	const handleUnban     = async () => {
		if (!user) return;
		const updated = await runUnban(() => AdminService.unbanUser(user.id));
		if (updated) setUser(updated);
	};

	if (loading) return (
		<div className={s.page}>
			<div className={s.loading}><div className={s.spinner} /><p>Loading user...</p></div>
		</div>
	);
	if (error || !user) return (
		<div className={s.page}>
			<div className={s.errorState}><p>{error ?? "User not found"}</p></div>
		</div>
	);

	const cnt         = user._count ?? { purchases: 0, downloads: 0, reviews: 0 };
	const isBanned    = user.isBanned ?? false;
	const banExpires  = user.bannedUntil ? new Date(user.bannedUntil) : null;
	const isPermanent = isBanned && !banExpires;

	const infoRows = [
		{ label: "User ID",    value: user.id },
		{ label: "Email",      value: user.email },
		{ label: "Username",   value: user.userName },
		{ label: "Balance",    value: `${Number(user.balance ?? 0).toFixed(2)} USD` },
		{ label: "Registered", value: new Date(user.createdAt).toLocaleString() },
		{ label: "Last Login", value: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—" },
	];

	const tabs: { key: Tab; label: string; count: number }[] = [
		{ key: "details",   label: "Details",   count: 0 },
		{ key: "purchases", label: "Purchases",  count: cnt.purchases },
		{ key: "downloads", label: "Downloads",  count: cnt.downloads },
		{ key: "reviews",   label: "Reviews",    count: cnt.reviews },
	];

	return (
		<div className={s.page}>
			<div className={s.pageHeader}>
				<div className={us.headerLeft}>
					<button className={us.backBtn} onClick={() => router.push("/admin/users")}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
							<path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
						Back to Users
					</button>
					<div>
						<h1 className={s.pageTitle}>{user.userName}</h1>
						<p className={s.pageSubtitle}>{user.email}</p>
					</div>
				</div>
				<div className={us.headerActions}>
					<button className={us.btnSecondary} onClick={() => setRoleModalOpen(true)}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
							<path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" />
							<path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" />
						</svg>
						Change Role
					</button>
					{isBanned ? (
						<button className={us.btnUnban} onClick={handleUnban} disabled={unbanLoading}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
								<path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
							</svg>
							{unbanLoading ? "Unbanning..." : "Unban"}
						</button>
					) : (
						<button className={us.btnWarn} onClick={() => setBanModalOpen(true)}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
								<path d="M4.93 4.93l14.14 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
							</svg>
							Ban User
						</button>
					)}
					<button className={us.btnDanger} onClick={() => setDeleteModalOpen(true)}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
							<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
						Delete
					</button>
				</div>
			</div>

			{isBanned && (
				<div className={us.banBanner}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
						<path d="M4.93 4.93l14.14 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
					</svg>
					<div className={us.banBannerText}>
						<strong>This user is banned</strong>
						{user.banReason && <span> — {user.banReason}</span>}
						{isPermanent
							? <span className={us.banMeta}> · Permanent</span>
							: <span className={us.banMeta}> · Until {banExpires!.toLocaleString()}</span>}
					</div>
				</div>
			)}

			<div className={us.layout}>
				<div className={us.profileCard}>
					<div className={us.avatarWrap}>
						<UserAvatar user={user} size={80} />
						{isBanned && <div className={us.bannedBadge}>Banned</div>}
					</div>
					<div className={us.profileName}>{user.userName}</div>
					<div className={us.profileEmail}>{user.email}</div>
					<div className={us.roleBadgeWrap}><RoleBadge role={user.role} /></div>
					<div className={us.statsGrid}>
						{[
							{ label: "Purchases", value: cnt.purchases, icon: "🛒" },
							{ label: "Downloads",  value: cnt.downloads,  icon: "📥" },
							{ label: "Reviews",    value: cnt.reviews,    icon: "⭐" },
						].map(st => (
							<div key={st.label} className={us.statItem}>
								<span className={us.statIcon}>{st.icon}</span>
								<span className={us.statValue}>{st.value}</span>
								<span className={us.statLabel}>{st.label}</span>
							</div>
						))}
					</div>
				</div>

				<div className={us.mainPanel}>
					<div className={us.tabs}>
						{tabs.map(t => (
							<button
								key={t.key}
								className={`${us.tabBtn} ${tab === t.key ? us.tabActive : ""}`}
								onClick={() => setTab(t.key)}
							>
								{t.label}
								{t.count > 0 && <span className={us.tabBadge}>{t.count}</span>}
							</button>
						))}
					</div>

					{tab === "details" && (
						<div className={us.detailsCard}>
							<div className={us.infoList}>
								{infoRows.map(row => (
									<div key={row.label} className={us.infoRow}>
										<span className={us.infoLabel}>{row.label}</span>
										<span className={us.infoValue}>{row.value}</span>
									</div>
								))}
								{isBanned && <>
									<div className={us.infoRow}>
										<span className={us.infoLabel}>Ban Status</span>
										<span className={`${us.infoValue} ${us.textWarning}`}>
											{isPermanent ? "Permanent" : `Until ${banExpires!.toLocaleString()}`}
										</span>
									</div>
									{user.banReason && (
										<div className={us.infoRow}>
											<span className={us.infoLabel}>Ban Reason</span>
											<span className={us.infoValue}>{user.banReason}</span>
										</div>
									)}
								</>}
							</div>
						</div>
					)}

					{tab === "purchases" && (
						<div className={us.detailsCard}>
							{purState.loading ? (
								<div className={s.loading}><div className={s.spinner} /><p>Loading...</p></div>
							) : purState.items.length === 0 ? (
								<div className={s.empty}><p>No purchases found</p></div>
							) : (
								<>
									<table className={us.subTable}>
										<thead><tr>
											<th>App</th><th>Price</th><th>Status</th><th>Method</th><th>Date</th>
										</tr></thead>
										<tbody>
											{purState.items.map(p => (
												<tr key={p.id}>
													<td><div className={us.appCell}>
														{p.app.iconUrl && <img src={p.app.iconUrl} alt={p.app.name} className={us.appIcon} />}
														<span>{p.app.name}</span>
													</div></td>
													<td>{Number(p.price).toFixed(2)} USD</td>
													<td><span className={`${us.statusBadge} ${us[`status${p.status}`]}`}>{STATUS_LABELS[p.status]}</span></td>
													<td>{p.paymentMethod ?? "—"}</td>
													<td>{new Date(p.purchasedAt).toLocaleDateString()}</td>
												</tr>
											))}
										</tbody>
									</table>
									<Pagination page={purState.page} totalPages={purState.totalPages} total={purState.total}
										onPageChange={pg => { setPurState(p => ({ ...p, page: pg })); fetchPurchases(pg); }} />
								</>
							)}
						</div>
					)}

					{tab === "downloads" && (
						<div className={us.detailsCard}>
							{dlState.loading ? (
								<div className={s.loading}><div className={s.spinner} /><p>Loading...</p></div>
							) : dlState.items.length === 0 ? (
								<div className={s.empty}><p>No downloads found</p></div>
							) : (
								<>
									<table className={us.subTable}>
										<thead><tr>
											<th>App</th><th>Version</th><th>Platform</th><th>Date</th>
										</tr></thead>
										<tbody>
											{dlState.items.map(d => (
												<tr key={d.id}>
													<td><div className={us.appCell}>
														{d.app.iconUrl && <img src={d.app.iconUrl} alt={d.app.name} className={us.appIcon} />}
														<span>{d.app.name}</span>
													</div></td>
													<td>v{d.version}</td>
													<td><span className={us.platformTag}>{PLATFORM_ICONS[d.platform] ?? "💻"} {d.platform}</span></td>
													<td>{new Date(d.downloadedAt).toLocaleDateString()}</td>
												</tr>
											))}
										</tbody>
									</table>
									<Pagination page={dlState.page} totalPages={dlState.totalPages} total={dlState.total}
										onPageChange={pg => { setDlState(p => ({ ...p, page: pg })); fetchDownloads(pg); }} />
								</>
							)}
						</div>
					)}

					{tab === "reviews" && (
						<div className={us.detailsCard}>
							{revState.loading ? (
								<div className={s.loading}><div className={s.spinner} /><p>Loading...</p></div>
							) : revState.items.length === 0 ? (
								<div className={s.empty}><p>No reviews found</p></div>
							) : (
								<>
									<div className={us.reviewsList}>
										{revState.items.map(r => (
											<div key={r.id} className={us.reviewCard}>
												<div className={us.reviewCardHeader}>
													<div className={us.appCell}>
														{r.app.iconUrl && <img src={r.app.iconUrl} alt={r.app.name} className={us.appIcon} />}
														<span className={us.reviewAppName}>{r.app.name}</span>
													</div>
													<div className={us.reviewStars}>
														{[1,2,3,4,5].map(n => (
															<span key={n} className={n <= r.rating ? us.starOn : us.starOff}>★</span>
														))}
													</div>
													<span className={us.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</span>
												</div>
												{r.title && <p className={us.reviewTitle}>{r.title}</p>}
												<p className={us.reviewComment}>{r.comment}</p>
											</div>
										))}
									</div>
									<Pagination page={revState.page} totalPages={revState.totalPages} total={revState.total}
										onPageChange={pg => { setRevState(p => ({ ...p, page: pg })); fetchReviews(pg); }} />
								</>
							)}
						</div>
					)}
				</div>
			</div>

			<RoleModal       isOpen={roleModalOpen}   user={user} onClose={() => setRoleModalOpen(false)}   onSaved={handleRoleSaved} />
			<BanModal        isOpen={banModalOpen}    user={user} onClose={() => setBanModalOpen(false)}    onSaved={handleBanSaved} />
			<DeleteUserModal isOpen={deleteModalOpen} user={user} onClose={() => setDeleteModalOpen(false)} onDeleted={handleDeleted} />
		</div>
	);
}
