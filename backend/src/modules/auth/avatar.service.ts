import { prisma } from "../../config/prisma.js";
import { NotFoundError, DatabaseError } from "../../utils/errors.js";

export async function updateUserAvatar(userId: string, avatarUrl: string) {
	try {
		return await prisma.users.update({
			where: { id: userId },
			data: { avatarUrl },
			select: { id: true, avatarUrl: true },
		});
	} catch (error) {
		throw new DatabaseError("Failed to update avatar", error);
	}
}
