import { prisma } from "../../config/prisma";
import { AppVersion, CreateVersionData } from "./version.types";

export async function addVersion(
	appId: string,
	data: CreateVersionData,
	file: Express.Multer.File,
) {
	const app = await prisma.apps.findUnique({ where: { id: appId } });
	if (!app) throw new Error("App not found");

	return prisma.appsVersion.create({
		data: {
			appId,
			version: data.version,
			changelog: data.changelog,
			isStable: data.isStable,
			downloadUrl: `/uploads/versions/${file.filename}`,
			size: file.size,
		},
	});
}

export async function getVersions(appId: string) {
	return prisma.appsVersion.findMany({
		where: { appId },
		orderBy: { releaseDate: "desc" },
	});
}
