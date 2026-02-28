import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Profile, VerifyCallback } from "passport-google-oauth20";
import env from "./env.js";
import { prisma } from "./prisma.js";

export function configurePassport() {
    const googleClientId = env.GOOGLE_CLIENT_ID ?? "";
    const googleClientSecret = env.GOOGLE_CLIENT_SECRET ?? "";

    if (!googleClientId || !googleClientSecret) {
        throw new Error("Missing Google OAuth credentials");
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: googleClientId,
                clientSecret: googleClientSecret,
                callbackURL: `${env.BACKEND_URL}/api/auth/google/callback`,
            },
            async (
                accessToken: string,
                refreshToken: string,
                profile: Profile,
                done: VerifyCallback
            ) => {
                try {
                    const email = profile.emails?.[0]?.value;

                    if (!email) {
                        return done(new Error("No email found in Google profile"));
                    }

                    const userEmail = email;

                    let user = await prisma.users.findUnique({
                        where: { email: userEmail },
                    });

                    if (!user) {
                        const userName = profile.displayName ?? userEmail.split("@")[0];
                        const avatarUrl = profile.photos?.[0]?.value;

                        user = await prisma.users.create({
                            data: {
                                email: userEmail,
                                userName,
                                passwordHash: "",
                                avatarUrl,
                                googleId: profile.id,
                            },
                        });
                    } else if (!user.googleId) {
                        user = await prisma.users.update({
                            where: { id: user.id },
                            data: { googleId: profile.id },
                        });
                    }

                    return done(null, user as any);
                } catch (error) {
                    return done(error as Error);
                }
            }
        )
    );

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await prisma.users.findUnique({
                where: { id },
            });

            if (!user) {
                return done(null, false);
            }

            // Преобразуем объект User в формат Express.User
            const expressUser = {
                userId: user.id,
                role: user.role as any,
            };

            done(null, expressUser);
        } catch (error) {
            done(error);
        }
    });
}