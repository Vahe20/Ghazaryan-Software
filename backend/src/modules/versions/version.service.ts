import { prisma } from "../../config/prisma";
import { AppVersion, CreateVersionData } from "./version.types";
import { NotFoundError, DatabaseError } from "../../utils/errors";

export async function addVersion(
	appId: string,
	data: CreateVersionData,
	file: Express.Multer.File,
) {
	try {
		const app = await prisma.apps.findUnique({ where: { id: appId } });
		
		if (!app) {
			throw new NotFoundError("App", appId);
		}

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
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw error;
		}
		throw new DatabaseError("Failed to create version", error);
	}
}

export async function getVersions(appId: string) {
	try {
		return prisma.appsVersion.findMany({
			where: { appId },
			orderBy: { releaseDate: "desc" },
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch versions", error);
	}
}
