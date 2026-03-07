import fs from "fs/promises";
import path from "path";

const srcDir = path.join(process.cwd(), "src", "generated", "prisma");
const destDir = path.join(process.cwd(), "dist", "generated", "prisma");

async function copyPrismaClient() {
	try {
		await fs.access(srcDir);

		try {
			await fs.rm(destDir, { recursive: true, force: true });
		} catch (e) {
		}

		await fs.mkdir(path.join(process.cwd(), "dist", "generated"), {
			recursive: true,
		});

		await fs.cp(srcDir, destDir, { recursive: true });
	} catch (error) {
		process.exit(1);
	}
}

copyPrismaClient();
