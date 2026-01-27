import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL!,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🌱 Start seeding...");

	// Очищаем данные в правильном порядке (из-за foreign keys)
	await prisma.download.deleteMany({});
	await prisma.review.deleteMany({});
	await prisma.appVersion.deleteMany({});
	await prisma.app.deleteMany({});
	await prisma.appCategory.deleteMany({});
	await prisma.user.deleteMany({});
	console.log("🗑️  Cleared existing data");

	// Создаем пользователя
	const user = await prisma.user.create({
		data: {
			email: "admin@ghazaryan.dev",
			username: "ghazaryan",
			fullName: "Ghazaryan Developer",
			bio: "Full-stack developer and creator of amazing apps",
			website: "https://ghazaryan.dev",
		},
	});
	console.log(`✅ Created user: ${user.username}`);

	// Создаем категории
	const categories = await Promise.all([
		prisma.appCategory.create({
			data: {
				name: "Development Tools",
				slug: "development-tools",
				description: "Tools for developers and programmers",
				order: 1,
			},
		}),
		prisma.appCategory.create({
			data: {
				name: "Productivity",
				slug: "productivity",
				description: "Apps to boost your productivity",
				order: 2,
			},
		}),
		prisma.appCategory.create({
			data: {
				name: "Utilities",
				slug: "utilities",
				description: "Useful system utilities",
				order: 3,
			},
		}),
		prisma.appCategory.create({
			data: {
				name: "Business",
				slug: "business",
				description: "Business and enterprise applications",
				order: 4,
			},
		}),
	]);
	console.log(`✅ Created ${categories.length} categories`);

	// Создаем приложения
	const apps = await Promise.all([
		prisma.app.create({
			data: {
				name: "Code Editor Pro",
				slug: "code-editor-pro",
				shortDesc: "A powerful and lightweight code editor for developers",
				description:
					"Code Editor Pro is a modern, fast, and feature-rich code editor designed for professional developers. It supports multiple programming languages, has built-in Git integration, and offers intelligent code completion.",
				version: "1.0.0",
				changelog: "Initial release with core features",
				iconUrl: "https://example.com/icons/code-editor.png",
				coverUrl: "https://example.com/covers/code-editor.jpg",
				screenshots: [
					"https://example.com/screenshots/code-editor-1.jpg",
					"https://example.com/screenshots/code-editor-2.jpg",
				],
				categoryId: categories[0].id,
				tags: ["editor", "code", "development", "ide"],
				size: 125000000,
				platform: ["WINDOWS", "MAC", "LINUX"],
				minVersion: "Windows 10, macOS 12, Ubuntu 20.04",
				downloadUrl: "https://example.com/downloads/code-editor-pro.zip",
				sourceUrl: "https://github.com/ghazaryan/code-editor-pro",
				status: "PUBLISHED",
				featured: true,
				authorId: user.id,
				publishedAt: new Date(),
				rating: 4.8,
				downloadCount: 1250,
				reviewCount: 45,
			},
		}),
		prisma.app.create({
			data: {
				name: "Task Manager Plus",
				slug: "task-manager-plus",
				shortDesc: "Advanced task management and productivity tool",
				description:
					"Task Manager Plus helps you organize your work, track progress, and boost productivity. Features include task scheduling, time tracking, project management, and team collaboration.",
				version: "2.1.5",
				changelog: "Bug fixes and performance improvements",
				iconUrl: "https://example.com/icons/task-manager.png",
				screenshots: ["https://example.com/screenshots/task-manager-1.jpg"],
				categoryId: categories[1].id,
				tags: ["productivity", "tasks", "management", "organization"],
				size: 45000000,
				platform: ["WINDOWS", "MAC", "WEB"],
				downloadUrl: "https://example.com/downloads/task-manager-plus.zip",
				status: "PUBLISHED",
				featured: true,
				authorId: user.id,
				publishedAt: new Date(),
				rating: 4.6,
				downloadCount: 890,
				reviewCount: 32,
			},
		}),
		prisma.app.create({
			data: {
				name: "System Monitor",
				slug: "system-monitor",
				shortDesc: "Real-time system monitoring and diagnostics",
				description:
					"Monitor your system's performance in real-time. Track CPU, memory, disk usage, and network activity. Get alerts when resources are running low.",
				version: "1.5.0",
				iconUrl: "https://example.com/icons/system-monitor.png",
				screenshots: [],
				categoryId: categories[2].id,
				tags: ["utility", "monitoring", "system", "performance"],
				size: 28000000,
				platform: ["WINDOWS", "LINUX"],
				downloadUrl: "https://example.com/downloads/system-monitor.zip",
				status: "PUBLISHED",
				authorId: user.id,
				publishedAt: new Date(),
				rating: 4.3,
				downloadCount: 456,
				reviewCount: 18,
			},
		}),
	]);
	console.log(`✅ Created ${apps.length} apps`);

	// Создаем версии для приложений
	await prisma.appVersion.createMany({
		data: [
			{
				appId: apps[0].id,
				version: "0.9.0",
				changelog: "Beta release",
				downloadUrl: "https://example.com/downloads/code-editor-pro-0.9.0.zip",
				size: 120000000,
				isStable: false,
			},
			{
				appId: apps[0].id,
				version: "1.0.0",
				changelog: "Initial stable release",
				downloadUrl: "https://example.com/downloads/code-editor-pro-1.0.0.zip",
				size: 125000000,
				isStable: true,
			},
		],
	});
	console.log(`✅ Created app versions`);

	// Создаем отзывы
	await prisma.review.createMany({
		data: [
			{
				appId: apps[0].id,
				userId: user.id,
				rating: 5,
				title: "Amazing editor!",
				comment: "This is the best code editor I've ever used. Fast, reliable, and feature-rich.",
				helpful: 12,
			},
			{
				appId: apps[1].id,
				userId: user.id,
				rating: 4,
				title: "Great for productivity",
				comment: "Really helps me stay organized. Would love to see more integrations.",
				helpful: 8,
			},
		],
	});
	console.log(`✅ Created reviews`);

	console.log("🎉 Seeding finished successfully!");
}

main()
	.catch((e) => {
		console.error("❌ Error during seeding:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
