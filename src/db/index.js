import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Serverless platforms (Vercel) reuse a warm container across invocations but
// run the module fresh on cold starts. Cache the connection on the global object
// so we open at most one connection per container instead of one per request.
let cached = global._mongoose;
if (!cached) {
    cached = global._mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            .then((mongooseInstance) => {
                console.log(`MongoDb connected !! DB HOST:${mongooseInstance.connection.host}`);
                return mongooseInstance;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // Reset so the next invocation can retry instead of reusing a rejected promise.
        cached.promise = null;
        console.log("MongoDB connection error", error);
        throw error;
    }

    return cached.conn;
};

export default connectDB;
