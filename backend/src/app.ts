import express from "express";
import cors from "cors";

import appsRoutes from "./routes/apps.routes";

export const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ 
		status: "ok", 
		timestamp: new Date().toISOString(),
		uptime: process.uptime()
	});
});

// API routes
app.use("/api/apps", appsRoutes);

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error("Error:", err);
	res.status(err.status || 500).json({
		error: err.message || "Internal server error",
	});
});
