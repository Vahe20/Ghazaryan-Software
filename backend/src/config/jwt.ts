import config from "./env";
import * as jwt from 'jsonwebtoken';

export const jwtConfig = {
	accessSecret: config.JWT_ACCESS_SECRET,
	refreshSecret: config.JWT_REFRESH_SECRET,
	accessExpiresIn: "30d" as jwt.SignOptions["expiresIn"],
};
