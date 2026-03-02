import { NotFoundError, DatabaseError } from "../../utils/errors.js";
import { userRepository } from "../../repositories/user.repository.js";

export async function updateUserAvatar(userId: string, avatarUrl: string) {
	try {
		const user = await userRepository.update(userId, { avatarUrl });
		return { id: user.id, avatarUrl: user.avatarUrl };
	} catch (error) {
		throw new DatabaseError("Failed to update avatar", error);
	}
}
