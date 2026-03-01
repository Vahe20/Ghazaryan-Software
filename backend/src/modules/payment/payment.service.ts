import { prisma } from "../../config/prisma.js";
import { DatabaseError, NotFoundError, ApiError } from "../../utils/errors.js";
import stripe from "../../config/stripe.js";
import env from "../../config/env.js";
import type Stripe from "stripe";

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

		const [purchase, updatedUser] = await prisma.$transaction([
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
				data: { balance: { decrement: price } },
				select: { id: true, balance: true },
			}),
		]);

		return { purchase, balance: updatedUser.balance };
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
		const [user, app] = await Promise.all([
			prisma.users.findUnique({
				where: { id: userId },
				select: { email: true, id: true },
			}),
			prisma.apps.findUnique({
				where: { id: appId },
				select: { id: true, name: true, price: true, iconUrl: true },
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

		const price = Number(app.price);

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
						unit_amount: Math.round(price * 100), // Convert to cents
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

		await prisma.users.update({
			where: { id: userId },
			data: {
				balance: {
					increment: Number(amount),
				},
			},
		});
	} else if (type === "app_purchase") {
		if (!appId) {
			throw new Error("Missing appId in metadata");
		}

		const app = await prisma.apps.findUnique({
			where: { id: appId },
			select: { price: true },
		});

		if (!app) {
			throw new NotFoundError("App", appId);
		}

		await prisma.purchases.create({
			data: {
				userId,
				appId,
				price: app.price,
				status: "COMPLETED",
				paymentMethod: "STRIPE",
				transactionId: session.payment_intent as string,
			},
		});
	}
}
