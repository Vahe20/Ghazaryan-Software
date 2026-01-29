import { prisma } from "../config/prisma";

export async function recalcAppRating(appId: string) {
	const result = await prisma.reviews.aggregate({
		where: { appId },
		_avg: { rating: true },
		_count: { rating: true },
	});

	await prisma.apps.update({
		where: { id: appId },
		data: {
			rating: result._avg.rating ?? 0,
			ratingCount: result._count.rating,
		},
	});
}
