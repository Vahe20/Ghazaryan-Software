import config from "./env.js";
import jwt from 'jsonwebtoken';

export const jwtConfig = {
	accessSecret: config.JWT_ACCESS_SECRET,
	accessExpiresIn: "30d" as jwt.SignOptions["expiresIn"],
};
