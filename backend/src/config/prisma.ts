import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL!,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
	adapter,
	log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

const cleanup = async () => {
	console.log("\n🔌 Disconnecting from database...");
	await prisma.$disconnect();
	await pool.end();
	process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
