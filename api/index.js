// Vercel serverless entry point. The Express app is exported directly as the
// function's default handler — Vercel/@vercel/node accepts an Express app as a
// (req, res) handler. The DB connection is established lazily by a middleware
// inside the app (see src/app.js), so it works whether the platform loads this
// module or src/app.js as the entry.
import "dotenv/config";
import app from "../src/app.js";

export default app;
