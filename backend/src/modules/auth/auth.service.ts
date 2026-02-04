import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { jwtConfig } from "../../config/jwt";
import { UserCreateData, LoginInput } from "./auth.types";

export async function getUserById(id: string) {
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
		throw new Error("User not require");
	}

	return user;
}

export async function registerUser(data: UserCreateData) {
	const existing = await prisma.users.findFirst({
		where: {
			OR: [{ email: data.email }, { userName: data.userName }],
		},
	});

	if (existing) {
		throw new Error("User already exists");
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
}

const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MS = 15 * 60 * 1000;

export async function loginUser(data: LoginInput) {
	const { email, password } = data;

	const user = await prisma.users.findUnique({
		where: { email },
	});

	if (!user) {
		throw new Error("Invalid credentials");
	}

	const now = new Date();

	if (user.blockedTime && user.blockedTime > now) {
		throw new Error("Account temporarily blocked");
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

		throw new Error("Invalid credentials");
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
}
