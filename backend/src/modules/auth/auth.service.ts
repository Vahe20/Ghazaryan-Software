import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { jwtConfig } from "../../config/jwt";

export async function registerUser(data: {
	email: string;
	userName: string;
	password: string;
	fullName?: string;
}) {
	const existing = await prisma.users.findFirst({
		where: {
			OR: [{ email: data.email }, { username: data.userName }],
		},
	});

	if (existing) {
		throw new Error("User already exists");
	}

	const passwordHash = await bcrypt.hash(data.password, 10);

	const user = await prisma.users.create({
		data: {
			email: data.email,
			username: data.userName,
			fullName: data.fullName,
			passwordHash,
		},
	});

	return user;
}

export async function loginUser(email: string, password: string) {
	const user = await prisma.users.findUnique({
		where: { email },
	});

	if (!user) {
		throw new Error("Invalid credentials");
	}

	const isValid = await bcrypt.compare(password, user.passwordHash);

	if (!isValid) {
		throw new Error("Invalid credentials");
	}

	await prisma.users.update({
		where: { id: user.id },
		data: { lastLoginAt: new Date() },
	});

	const accessToken = jwt.sign(
		{ userId: user.id, role: user.role },
		jwtConfig.accessSecret,
		{ expiresIn: jwtConfig.accessExpiresIn },
	);

	const refreshToken = jwt.sign(
		{ userId: user.id },
		jwtConfig.refreshSecret,
		{
			expiresIn: jwtConfig.refreshExpiresIn,
		},
	);

	await prisma.refreshToken.create({
		data: {
			token: refreshToken,
			userId: user.id,
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		},
	});

	return { accessToken, refreshToken, user };
}

export async function refreshAccessToken(refreshToken: string) {
	let decoded;
	try {
		decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as {
			userId: string;
		};
	} catch (error) {
		throw new Error("Invalid refresh token");
	}

	const tokenRecord = await prisma.refreshToken.findUnique({
		where: { token: refreshToken },
	});

	if (!tokenRecord || tokenRecord.revoked) {
		throw new Error("Invalid or revoked refresh token");
	}

	if (new Date() > tokenRecord.expiresAt) {
		throw new Error("Refresh token expired");
	}

	const user = await prisma.users.findUnique({
		where: { id: decoded.userId },
	});

	if (!user) {
		throw new Error("User not found");
	}

	const newAccessToken = jwt.sign(
		{ userId: user.id, role: user.role },
		jwtConfig.accessSecret,
		{ expiresIn: jwtConfig.accessExpiresIn },
	);

	return { accessToken: newAccessToken, user };
}

export async function logoutUser(refreshToken: string) {
	await prisma.refreshToken.updateMany({
		where: { token: refreshToken },
		data: { revoked: true },
	});
}
