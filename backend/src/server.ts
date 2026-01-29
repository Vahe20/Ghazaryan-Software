import "dotenv/config";
import config from "./config/env";
import { app } from "./app";

const PORT = config.PORT;

app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`📊 Prisma Studio: http://localhost:5555`);
});
