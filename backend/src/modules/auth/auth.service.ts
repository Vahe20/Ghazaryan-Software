import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { jwtConfig } from "../../config/jwt";
import { UserCreateData, LoginInput } from "./auth.types";
import {
	NotFoundError,
	ConflictError,
	AuthenticationError,
	DatabaseError,
} from "../../utils/errors";

export async function getUserById(id: string) {
	try {
		const user = await prisma.users.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				userName: true,
				role: true,
				balance: true,
				blockedTime: true,
				attempt: true,
				avatarUrl: true,
				reviews: true,
				downloads: true,
				purchases: true,
				authoredApps: true,
			},
		});

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
		const existing = await prisma.users.findFirst({
			where: {
				OR: [{ email: data.email }, { userName: data.userName }],
			},
		});

		if (existing) {
			const field =
				existing.email === data.email ? "email" : "username";
			throw new ConflictError(`User with this ${field} already exists`);
		}

		const passwordHash = await bcrypt.hash(data.password, 10);

		const user = await prisma.users.create({
			data: {
				email: data.email,
				userName: data.userName,
				passwordHash,
			},
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
		const user = await prisma.users.findUnique({ where: { id: userId } });

		if (!user) {
			throw new NotFoundError("User", userId);
		}

		const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

		if (!isValid) {
			throw new AuthenticationError("Current password is incorrect");
		}

		const passwordHash = await bcrypt.hash(newPassword, 10);

		await prisma.users.update({
			where: { id: userId },
			data: { passwordHash },
		});
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
		const user = await prisma.users.findUnique({ where: { id: userId } });

		if (!user) {
			throw new NotFoundError("User", userId);
		}

		const isValid = await bcrypt.compare(password, user.passwordHash);

		if (!isValid) {
			throw new AuthenticationError("Password is incorrect");
		}

		await prisma.users.delete({ where: { id: userId } });
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

		const user = await prisma.users.findUnique({
			where: { email },
		});

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

			await prisma.users.update({
				where: { id: user.id },
				data: {
					attempt: attempts,
					blockedTime:
						attempts >= MAX_ATTEMPTS
							? new Date(now.getTime() + BLOCK_TIME_MS)
							: null,
				},
			});

			if (attempts >= MAX_ATTEMPTS) {
				throw new AuthenticationError(
					"Too many failed attempts. Account blocked for 15 minutes",
				);
			}

			throw new AuthenticationError("Invalid credentials");
		}

		await prisma.users.update({
			where: { id: user.id },
			data: {
				attempt: 0,
				blockedTime: null,
				lastLoginAt: new Date(),
			},
		});

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
			},
		};
	} catch (error) {
		if (error instanceof AuthenticationError) {
			throw error;
		}
		throw new DatabaseError("Failed to login", error);
	}
}

