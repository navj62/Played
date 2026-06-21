// Vercel serverless entry point. Wraps the existing Express app as a single
// serverless function. Route definitions and controllers are unchanged — every
// request is funneled here (see vercel.json) and handed to the Express app.
import "dotenv/config";
import { app } from "../src/app.js";
import connectDB from "../src/db/index.js";

export default async function handler(req, res) {
    // Reuses the cached connection on warm invocations; opens one on cold start.
    await connectDB();
    return app(req, res);
}
