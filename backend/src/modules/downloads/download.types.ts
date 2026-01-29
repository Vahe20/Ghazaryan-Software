export {
	createDownloadSchema,
	getDownloadsQuerySchema,
	getDownloadStatsSchema,
} from "./download.schema";
export type {
	CreateDownloadInput,
	GetDownloadsQuery,
	GetDownloadStatsInput,
} from "./download.schema";

export interface Download {
	id: string;
	appId: string;
	userId?: string | null;
	version: string;
	platform: string;
	ipAddress?: string | null;
	userAgent?: string | null;
	country?: string | null;
	downloadedAt: Date;
}

export interface DownloadStats {
	period: string;
	count: number;
	platform?: string;
	country?: string;
}
