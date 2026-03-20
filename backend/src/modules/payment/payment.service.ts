import { prisma } from "../../config/prisma.js";
import { DatabaseError, NotFoundError, ApiError } from "../../utils/errors.js";
import stripe from "../../config/stripe.js";
import env from "../../config/env.js";
import type Stripe from "stripe";
import { webhookRepository } from "../../repositories/webhook.repository.js";
import { userRepository } from "../../repositories/user.repository.js";

export async function purchaseApp(userId: string, appId: string) {
	try {
		const now = new Date();
		const [app, user, promotions] = await Promise.all([
			prisma.apps.findUnique({
				where: { id: appId },
				select: { id: true, name: true, price: true },
			}),
			prisma.users.findUnique({
				where: { id: userId },
				select: { balance: true },
			}),
			prisma.appPromotion.findMany({
				where: {
					appId,
					isActive: true,
					startsAt: { lte: now },
					endsAt: { gte: now },
				},
				orderBy: { startsAt: "desc" },
				take: 1,
			}),
		]);

		if (!app) throw new NotFoundError("App", appId);
		if (!user) throw new NotFoundError("User", userId);

		const basePrice = Number(app.price);

		let finalPrice = basePrice;
		if (promotions.length > 0 && promotions[0]) {
			const promotion = promotions[0];
			if (promotion.discountAmount?.gt(0)) {
				finalPrice = basePrice - promotion.discountAmount.toNumber();
			} else if (promotion.discountPercent && promotion.discountPercent > 0) {
				finalPrice = basePrice * (1 - promotion.discountPercent / 100);
			}
			finalPrice = Math.max(0, finalPrice);
		}

		const existingPurchase = await prisma.purchases.findUnique({
			where: { userId_appId: { userId, appId } },
		});

		if (existingPurchase) throw ApiError.conflict("You already own this app");

		if (user.balance.lt(finalPrice)) throw ApiError.badRequest("Insufficient balance");

		const { purchase, balance } = await prisma.$transaction(async (tx) => {
			const purchase = await tx.purchases.create({
				data: {
					userId,
					appId,
					price: finalPrice,
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
			});

			const updatedUser = await tx.users.update({
				where: { id: userId },
				data: { balance: { decrement: finalPrice } },
				select: { balance: true },
			});

			return { purchase, balance: updatedUser.balance };
		});

		return { purchase, balance };
	} catch (error) {
		if (error instanceof NotFoundError || error instanceof ApiError) throw error;
		console.error("purchaseApp error:", error);
		throw new DatabaseError("Failed to purchase app", {
			message: error instanceof Error ? error.message : String(error),
			code: (error as any)?.code,
			meta: (error as any)?.meta,
		});
	}
}

export async function checkAppPurchase(userId: string, appId: string): Promise<boolean> {
	try {
		const purchase = await prisma.purchases.findUnique({
			where: { userId_appId: { userId, appId } },
			select: { id: true, status: true },
		});

		return purchase?.status === "COMPLETED";
	} catch (error) {
		console.error("checkAppPurchase error:", error);
		return false;
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


export async function createCheckoutSession(userId: string, amount: number) {
	try {
		const user = await prisma.users.findUnique({
			where: { id: userId },
			select: { email: true, id: true },
		});

		if (!user) {
			throw new NotFoundError("User", userId);
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price_data: {
						currency: "usd",
						product_data: {
							name: "Balance Top-Up",
							description: `Add $${amount} to your account balance`,
						},
						unit_amount: Math.round(amount * 100), // Convert to cents
					},
					quantity: 1,
				},
			],
			mode: "payment",
			success_url: `${env.FRONTEND_URL}/profile?payment=success`,
			cancel_url: `${env.FRONTEND_URL}/profile?payment=cancelled`,
			customer_email: user.email,
			metadata: {
				userId: user.id,
				amount: amount.toString(),
				type: "balance_topup",
			},
		});

		return {
			sessionId: session.id,
			url: session.url,
		};
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw error;
		}
		throw new DatabaseError("Failed to create checkout session", error);
	}
}

export async function createAppPurchaseSession(userId: string, appId: string) {
	try {
		const now = new Date();
		const [user, app, promotions] = await Promise.all([
			prisma.users.findUnique({
				where: { id: userId },
				select: { email: true, id: true },
			}),
			prisma.apps.findUnique({
				where: { id: appId },
				select: { id: true, name: true, price: true, iconUrl: true },
			}),
			prisma.appPromotion.findMany({
				where: {
					appId,
					isActive: true,
					startsAt: { lte: now },
					endsAt: { gte: now },
				},
				orderBy: { startsAt: "desc" },
				take: 1,
			}),
		]);

		if (!user) {
			throw new NotFoundError("User", userId);
		}

		if (!app) {
			throw new NotFoundError("App", appId);
		}

		const existingPurchase = await prisma.purchases.findUnique({
			where: { userId_appId: { userId, appId } },
		});

		if (existingPurchase) {
			throw ApiError.conflict("You already own this app");
		}

		const basePrice = Number(app.price);
		let finalPrice = basePrice;
		if (promotions.length > 0 && promotions[0]) {
			const promotion = promotions[0];
			if (promotion.discountAmount?.gt(0)) {
				finalPrice = basePrice - promotion.discountAmount.toNumber();
			} else if (promotion.discountPercent && promotion.discountPercent > 0) {
				finalPrice = basePrice * (1 - promotion.discountPercent / 100);
			}
			finalPrice = Math.max(0, finalPrice);
		}

		const price = finalPrice;

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price_data: {
						currency: "usd",
						product_data: {
							name: app.name,
							description: `Purchase ${app.name}`,
							images: app.iconUrl ? [`${env.BACKEND_URL}${app.iconUrl}`] : [],
						},
						unit_amount: Math.round(price * 100),
					},
					quantity: 1,
				},
			],
			mode: "payment",
			success_url: `${env.FRONTEND_URL}/apps/${appId}?payment=success`,
			cancel_url: `${env.FRONTEND_URL}/apps/${appId}?payment=cancelled`,
			customer_email: user.email,
			metadata: {
				userId: user.id,
				appId: app.id,
				type: "app_purchase",
			},
		});

		return {
			sessionId: session.id,
			url: session.url,
		};
	} catch (error) {
		if (
			error instanceof NotFoundError ||
			error instanceof ApiError
		) {
			throw error;
		}
		throw new DatabaseError("Failed to create app purchase session", error);
	}
}

export async function handleWebhookEvent(event: Stripe.Event) {
	try {
		const existingEvent = await webhookRepository.findByEventId(event.id);

		if (existingEvent) {
			if (existingEvent.processed) {
				return;
			}
		} else {
			await webhookRepository.create({
				eventId: event.id,
				eventType: event.type,
				payload: JSON.stringify(event),
			});
		}

		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				await handleSuccessfulPayment(session);
				break;
			}
			case "payment_intent.payment_failed": {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;
				console.error("Payment failed:", paymentIntent.id);
				break;
			}
			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		await webhookRepository.markAsProcessed(event.id);
	} catch (error) {
		console.error("Error handling webhook event:", error);
		throw error;
	}
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
	const { userId, type, amount, appId } = session.metadata || {};

	if (!userId || !type) {
		throw new Error("Missing metadata in session");
	}

	if (type === "balance_topup") {
		if (!amount) {
			throw new Error("Missing amount in metadata");
		}

		await userRepository.incrementBalance(userId, Number(amount));
	} else if (type === "app_purchase") {
		if (!appId) {
			throw new Error("Missing appId in metadata");
		}

		const now = new Date();
		const [app, promotions] = await Promise.all([
			prisma.apps.findUnique({
				where: { id: appId },
				select: { price: true },
			}),
			prisma.appPromotion.findMany({
				where: {
					appId,
					isActive: true,
					startsAt: { lte: now },
					endsAt: { gte: now },
				},
				orderBy: { startsAt: "desc" },
				take: 1,
			}),
		]);

		if (!app) {
			throw new NotFoundError("App", appId);
		}

		const basePrice = Number(app.price);
		let finalPrice = basePrice;
		if (promotions.length > 0 && promotions[0]) {
			const promotion = promotions[0];
			if (promotion.discountAmount?.gt(0)) {
				finalPrice = basePrice - promotion.discountAmount.toNumber();
			} else if (promotion.discountPercent && promotion.discountPercent > 0) {
				finalPrice = basePrice * (1 - promotion.discountPercent / 100);
			}
			finalPrice = Math.max(0, finalPrice);
		}

		await prisma.purchases.create({
			data: {
				userId,
				appId,
				price: finalPrice,
				status: "COMPLETED",
				paymentMethod: "STRIPE",
				transactionId: session.payment_intent as string,
			},
		});
	}
}
