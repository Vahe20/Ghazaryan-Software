import "dotenv/config";
import config from "./config/env.js";
import { app } from "./app.js";

const PORT = config.PORT;

app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
});
