import { prisma } from "../../config/prisma.js";
import { ApiError, ConflictError, DatabaseError, NotFoundError } from "../../utils/errors.js";
import type { CreateDeveloperRequestInput } from "./developer-request.types.js";

export async function submitRequest(userId: string, data: CreateDeveloperRequestInput) {
	try {
		const user = await prisma.users.findUnique({ where: { id: userId } });
		if (!user) throw new NotFoundError("User", userId);
		if (user.role === "DEVELOPER" || user.role === "ADMIN") {
			throw new ConflictError("You already have developer or admin role");
		}

		const existing = await prisma.developerRequest.findUnique({ where: { userId } });
		if (existing && existing.status === "PENDING") {
			throw new ConflictError("You already have a pending request");
		}

		if (existing) {
			return prisma.developerRequest.update({
				where: { userId },
				data: { ...data, status: "PENDING", reviewedAt: null },
			});
		}

		return prisma.developerRequest.create({ data: { ...data, userId } });
	} catch (error) {
		if (error instanceof ApiError || error instanceof ConflictError) throw error;
		throw new DatabaseError("Failed to submit developer request", error);
	}
}

export async function getMyRequest(userId: string) {
	try {
		return prisma.developerRequest.findUnique({ where: { userId } });
	} catch (error) {
		throw new DatabaseError("Failed to fetch developer request", error);
	}
}

export async function listRequests(status?: string) {
	try {
		return prisma.developerRequest.findMany({
			where: status ? { status: status as any } : undefined,
			include: {
				user: { select: { id: true, userName: true, email: true, avatarUrl: true } },
			},
			orderBy: { createdAt: "desc" },
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch developer requests", error);
	}
}

export async function reviewRequest(requestId: string, status: "APPROVED" | "REJECTED") {
	try {
		const request = await prisma.developerRequest.findUnique({ where: { id: requestId } });
		if (!request) throw new NotFoundError("DeveloperRequest", requestId);
		if (request.status !== "PENDING") throw ApiError.badRequest("Request is already reviewed");

		const updated = await prisma.developerRequest.update({
			where: { id: requestId },
			data: { status, reviewedAt: new Date() },
		});

		if (status === "APPROVED") {
			await prisma.users.update({
				where: { id: request.userId },
				data: { role: "DEVELOPER" },
			});
		}

		return updated;
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new DatabaseError("Failed to review developer request", error);
	}
}
