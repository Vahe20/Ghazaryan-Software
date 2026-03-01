import Stripe from "stripe";
import env from "./env.js";

if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
});

export default stripe;