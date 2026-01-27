import * as jwt from 'jsonwebtoken';
export const jwtConfig = {
	accessSecret: process.env.JWT_ACCESS_SECRET as string,
	refreshSecret: process.env.JWT_REFRESH_SECRET as string,
	accessExpiresIn: "15m" as jwt.SignOptions["expiresIn"],
	refreshExpiresIn: "30d" as jwt.SignOptions["expiresIn"],
};
