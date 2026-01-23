import express, { Application } from "express";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const app: Application = express();

app.use(express.json());

app.get("/", (req, res) => {
	res.json("eee");
});

export default app;
