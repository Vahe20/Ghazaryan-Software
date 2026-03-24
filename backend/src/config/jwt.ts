import config from "./env.js";
import type jwt from "jsonwebtoken";

export const jwtConfig = {
	accessSecret: config.JWT_ACCESS_SECRET as string,
	accessExpiresIn: config.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
	refreshSecret: config.JWT_REFRESH_SECRET as string,
	refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
};
