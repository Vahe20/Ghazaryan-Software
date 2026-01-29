import express from "express";
import cors from "cors";
import path from "path";

import authRouter from "./modules/auth/auth.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import appsRoutes from "./modules/apps/apps.routes";
import categoryRoutes from "./modules/categories/category.routes";
import appVersionRoutes from "./modules/versions/version.routes";


export const app = express();

app.use(cors());
app.use(express.json());


app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));


app.use("/api/auth", authRouter);
app.use("/api/upload", uploadRoutes);
app.use("/api/apps", appsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/apps", appVersionRoutes);

app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

app.use(
	(
		err: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction,
	) => {
		console.error("Error:", err);
		res.status(err.status || 500).json({
			error: err.message || "Internal server error",
		});
	},
);
