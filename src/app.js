import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import multer from "multer"
import mongoose from "mongoose"
import { ApiError } from "./utils/ApiError.js"
const app= express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error(`CORS: origin ${origin} not allowed`))
        }
    },
    credentials: true,
}))

app.use(express.json({
    limit:"16kb"
}))

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())


// Health check — reports real DB connectivity, not just a static 200.
app.get("/health", (req, res) => {
    const dbState = mongoose.connection.readyState // 1 = connected
    const dbConnected = dbState === 1
    return res.status(dbConnected ? 200 : 503).json({
        ok: dbConnected,
        db: dbConnected ? "connected" : "disconnected",
        uptime: process.uptime(),
    })
})

// Routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import tweetRouter from "./routes/tweet.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/playlists", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/tweets", tweetRouter)

// Global error handler — catches errors thrown before/around controllers
// (e.g. multer file-type/size rejections) and returns the standard JSON shape
// instead of Express's default HTML error page.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500
    let message = err.message || "Internal Server Error"

    if (err instanceof multer.MulterError) {
        statusCode = 400
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File too large. Maximum size is 4 MB for video and 2 MB for images."
        }
    }

    if (!(err instanceof ApiError) && !(err instanceof multer.MulterError) && statusCode === 500) {
        message = "Internal Server Error"
    }

    return res.status(statusCode).json({
        statusCode,
        success: false,
        message,
        errors: err.errors || [],
    })
})

export {app}