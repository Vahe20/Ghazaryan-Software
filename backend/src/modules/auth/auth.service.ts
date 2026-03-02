import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../../config/jwt.js";
import type { UserCreateData, LoginInput } from "./auth.types.js";
import {
	NotFoundError,
	ConflictError,
	AuthenticationError,
	DatabaseError,
} from "../../utils/errors.js";
import { userRepository } from "../../repositories/user.repository.js";

export async function getUserById(id: string) {
	try {
		const user = await userRepository.findByIdWithRelations(id);

		if (!user) {
			throw new NotFoundError("User", id);
		}

		return user;
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw error;
		}
		throw new DatabaseError("Failed to fetch user", error);
	}
}

export async function registerUser(data: UserCreateData) {
	try {
		const existing = await userRepository.findByEmailOrUsername(
			data.email,
			data.userName,
		);

		if (existing) {
			const field =
				existing.email === data.email ? "email" : "username";
			throw new ConflictError(`User with this ${field} already exists`);
		}

		const passwordHash = await bcrypt.hash(data.password, 10);

		const user = await userRepository.create({
			email: data.email,
			userName: data.userName,
			passwordHash,
		});

		return user;
	} catch (error) {
		if (error instanceof ConflictError) {
			throw error;
		}
		throw new DatabaseError("Failed to register user", error);
	}
}

export async function changeUserPassword(
	userId: string,
	currentPassword: string,
	newPassword: string,
) {
	try {
		const user = await userRepository.findById(userId);

		if (!user) {
			throw new NotFoundError("User", userId);
		}

		const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

		if (!isValid) {
			throw new AuthenticationError("Current password is incorrect");
		}

		const passwordHash = await bcrypt.hash(newPassword, 10);

		await userRepository.update(userId, { passwordHash });
	} catch (error) {
		if (
			error instanceof NotFoundError ||
			error instanceof AuthenticationError
		) {
			throw error;
		}
		throw new DatabaseError("Failed to change password", error);
	}
}

export async function deleteUserAccount(userId: string, password: string) {
	try {
		const user = await userRepository.findById(userId);

		if (!user) {
			throw new NotFoundError("User", userId);
		}

		const isValid = await bcrypt.compare(password, user.passwordHash);

		if (!isValid) {
			throw new AuthenticationError("Password is incorrect");
		}

		await userRepository.delete(userId);
	} catch (error) {
		if (
			error instanceof NotFoundError ||
			error instanceof AuthenticationError
		) {
			throw error;
		}
		throw new DatabaseError("Failed to delete account", error);
	}
}

const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MS = 15 * 60 * 1000;

export async function loginUser(data: LoginInput) {
	try {
		const { email, password } = data;

		const user = await userRepository.findByEmailWithPassword(email);

		if (!user) {
			throw new AuthenticationError("Invalid credentials");
		}

		const now = new Date();

		if (user.blockedTime && user.blockedTime > now) {
			const remainingTime = Math.ceil(
				(user.blockedTime.getTime() - now.getTime()) / 60000,
			);
			throw new AuthenticationError(
				`Account temporarily blocked. Try again in ${remainingTime} minutes`,
			);
		}

		const isValid = await bcrypt.compare(password, user.passwordHash);

		if (!isValid) {
			const attempts = user.attempt + 1;

			await userRepository.updateAttempts(
				user.id,
				attempts,
				attempts >= MAX_ATTEMPTS
					? new Date(now.getTime() + BLOCK_TIME_MS)
					: null,
			);

			if (attempts >= MAX_ATTEMPTS) {
				throw new AuthenticationError(
					"Too many failed attempts. Account blocked for 15 minutes",
				);
			}

			throw new AuthenticationError("Invalid credentials");
		}

		await userRepository.resetAttempts(user.id);

		const accessToken = jwt.sign(
			{ userId: user.id, role: user.role },
			jwtConfig.accessSecret,
			{ expiresIn: jwtConfig.accessExpiresIn },
		);

		return {
			accessToken,
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
				userName: user.userName,
				balance: user.balance,
				avatarUrl: user.avatarUrl,
				reviews: user.reviews,
				downloads: user.downloads,
				purchases: user.purchases,
				authoredApps: user.authoredApps,
				lastLoginAt: user.lastLoginAt,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
		};
	} catch (error: any) {
		if (error instanceof AuthenticationError) {
			throw error;
		}
		throw new DatabaseError(error);
	}
}

export async function findOrCreateGoogleUser(profile: {
	googleId: string;
	email: string;
	displayName: string;
	avatarUrl?: string;
}) {
	try {
		let user = await userRepository.findByGoogleId(profile.googleId);

		if (user) {
			await userRepository.update(user.id, { lastLoginAt: new Date() });
			return user;
		}

		user = await userRepository.findByEmail(profile.email);

		if (user) {
			user = await userRepository.update(user.id, {
				googleId: profile.googleId,
				avatarUrl: profile.avatarUrl || user.avatarUrl,
				lastLoginAt: new Date(),
			});
			return user;
		}

		const userName = profile.displayName ?? profile.email.split("@")[0];
		user = await userRepository.create({
			email: profile.email,
			userName,
			passwordHash: "",
			googleId: profile.googleId,
			avatarUrl: profile.avatarUrl,
		});

		return user;
	} catch (error) {
		throw new DatabaseError("Failed to process Google authentication", error);
	}
}

export function generateAuthToken(userId: string, role: string) {
	const accessToken = jwt.sign(
		{ userId, role },
		jwtConfig.accessSecret,
		{ expiresIn: jwtConfig.accessExpiresIn },
	);

	return accessToken;
}
