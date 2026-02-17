import { prisma } from "../../config/prisma";
import { DatabaseError, NotFoundError, ApiError } from "../../utils/errors";

export async function topUpBalance(userId: string, amount: number) {
	try {
		const user = await prisma.users.update({
			where: { id: userId },
			data: {
				balance: {
					increment: amount,
				},
			},
			select: {
				id: true,
				balance: true,
			},
		});

		return user;
	} catch (error) {
		throw new DatabaseError("Failed to top up balance", error);
	}
}

export async function purchaseApp(userId: string, appId: string) {
	try {
		const app = await prisma.apps.findUnique({
			where: { id: appId },
			select: { id: true, name: true, price: true },
		});

		if (!app) {
			throw new NotFoundError("App", appId);
		}

		const price = Number(app.price);

		const existingPurchase = await prisma.purchases.findUnique({
			where: { userId_appId: { userId, appId } },
		});

		if (existingPurchase) {
			throw ApiError.conflict("You already own this app");
		}

		const user = await prisma.users.findUnique({
			where: { id: userId },
			select: { balance: true },
		});

		if (!user) {
			throw new NotFoundError("User", userId);
		}

		if (Number(user.balance) < price) {
			throw ApiError.badRequest("Insufficient balance");
		}

		const [purchase] = await prisma.$transaction([
			prisma.purchases.create({
				data: {
					userId,
					appId,
					price: app.price,
					status: "COMPLETED",
				},
				include: {
					app: {
						select: {
							id: true,
							name: true,
							slug: true,
							iconUrl: true,
							price: true,
						},
					},
				},
			}),
			prisma.users.update({
				where: { id: userId },
				data: {
					balance: {
						decrement: price,
					},
				},
			}),
		]);

		return purchase;
	} catch (error) {
		if (
			error instanceof NotFoundError ||
			error instanceof ApiError
		) {
			throw error;
		}
		throw new DatabaseError("Failed to purchase app", error);
	}
}

export async function getPaymentHistory(userId: string) {
	try {
		const purchases = await prisma.purchases.findMany({
			where: { userId },
			orderBy: { purchasedAt: "desc" },
			include: {
				app: {
					select: {
						id: true,
						name: true,
						slug: true,
						iconUrl: true,
					},
				},
			},
		});

		return purchases;
	} catch (error) {
		throw new DatabaseError("Failed to fetch payment history", error);
	}
}
