import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import bcrypt from "bcrypt";

/* ------------------ DB ------------------ */
const pool = new Pool({
	connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
	adapter: new PrismaPg(pool),
});

/* ------------------ CONSTANTS ------------------ */

const APP_TOTAL = 60;

const APP_NAMES = [
	"Code Studio",
	"TaskFlow",
	"System Guard",
	"DevTools Pro",
	"Focus Desk",
	"Cloud Manager",
	"BuildMaster",
	"Quick Notes",
	"MonitorX",
	"Project Hub",
];

const DESCRIPTIONS = [
	"Modern application designed to improve productivity and workflow efficiency.",
	"Powerful tool built for professionals and teams.",
	"Lightweight and fast software with a clean user interface.",
	"Advanced solution with focus on performance and stability.",
	"Reliable application used by thousands of users worldwide.",
];

const ICONS = [
	"https://cdn-icons-png.flaticon.com/512/906/906324.png",
	"https://cdn-icons-png.flaticon.com/512/2921/2921222.png",
	"https://cdn-icons-png.flaticon.com/512/1827/1827370.png",
	"https://cdn-icons-png.flaticon.com/512/1055/1055687.png",
];

const COVERS = [
	"https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80",
	"https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1600&q=80",
	"https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1600&q=80",
];

const SCREENSHOTS = [
	"https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1200&q=80",
];

/* ------------------ SEED ------------------ */

async function main() {
	console.log("🌱 Seeding started...");

	await prisma.downloads.deleteMany();
	await prisma.reviews.deleteMany();
	await prisma.appsVersion.deleteMany();
	await prisma.apps.deleteMany();
	await prisma.appsCategory.deleteMany();
	await prisma.users.deleteMany();

	/* ---------- USER ---------- */
	const passwordHash = await bcrypt.hash("admin1234", 10);

	const user = await prisma.users.create({
		data: {
			email: "admin@ghazaryan.dev",
			userName: "admin",
			passwordHash,
			role: "ADMIN",
		},
	});

	/* ---------- CATEGORIES ---------- */
	const categories = await prisma.appsCategory.createMany({
		data: [
			{
				name: "Development Tools",
				slug: "development-tools",
				description: "Tools for developers",
				order: 1,
			},
			{
				name: "Productivity",
				slug: "productivity",
				description: "Productivity apps",
				order: 2,
			},
			{
				name: "Utilities",
				slug: "utilities",
				description: "System utilities",
				order: 3,
			},
			{
				name: "Business",
				slug: "business",
				description: "Business software",
				order: 4,
			},
		],
	});

	const categoryList = await prisma.appsCategory.findMany();

	/* ---------- APPS ---------- */
	for (let i = 0; i < APP_TOTAL; i++) {
		const baseName = APP_NAMES[i % APP_NAMES.length];
		const name = `${baseName} ${i + 1}`;

		const app = await prisma.apps.create({
			data: {
				name,
				slug: name.toLowerCase().replace(/\s+/g, "-"),
				shortDesc: DESCRIPTIONS[i % DESCRIPTIONS.length],
				description: `${DESCRIPTIONS[i % DESCRIPTIONS.length]}

This application provides a set of professional tools designed for daily use. It focuses on stability, performance, and usability.`,
				version: `1.${i % 5}.0`,
				changelog: "Initial stable release",
				iconUrl: ICONS[i % ICONS.length],
				coverUrl: COVERS[i % COVERS.length],
				screenshots: [
					SCREENSHOTS[i % SCREENSHOTS.length],
					SCREENSHOTS[(i + 1) % SCREENSHOTS.length],
					SCREENSHOTS[(i + 2) % SCREENSHOTS.length],
				],
				categoryId: categoryList[i % categoryList.length].id,
				tags: ["software", "tool", baseName.toLowerCase()],
				size: 50_000_000 + i * 1_000_000,
				platform:
					i % 3 === 0
						? ["WINDOWS"]
						: i % 3 === 1
							? ["WINDOWS", "MAC"]
							: ["WINDOWS", "MAC", "LINUX"],
				minVersion: "Windows 10 / macOS 12 / Ubuntu 20.04",
				downloadUrl: "https://speed.hetzner.de/100MB.bin",
				sourceUrl: "https://github.com",
				status: i % 4 === 0 ? "BETA" : "RELEASE",
				featured: i % 10 === 0,
				price: i % 5 === 0 ? 0 : 500 + i * 10,
				authorId: user.id,
				publishedAt: new Date(Date.now() - i * 86400000),
				rating: 3.5 + (i % 5) * 0.3,
				downloadCount: 100 * i,
				reviewCount: i % 20,
			},
		});

		await prisma.appsVersion.createMany({
			data: [
				{
					appId: app.id,
					version: `0.${i}.0`,
					changelog: "Beta version",
					downloadUrl: "https://speed.hetzner.de/100MB.bin",
					size: 45_000_000,
					isStable: false,
				},
				{
					appId: app.id,
					version: `1.${i % 5}.0`,
					changelog: "Stable release",
					downloadUrl: "https://speed.hetzner.de/100MB.bin",
					size: 55_000_000,
					isStable: true,
				},
			],
		});
	}

	console.log("🎉 Seeding finished successfully!");
}

main()
	.catch(e => {
		console.error("❌ Seed error:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
