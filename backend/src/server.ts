import "dotenv/config";
import { app } from "./app";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`📊 Prisma Studio: http://localhost:5555`);
	console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
