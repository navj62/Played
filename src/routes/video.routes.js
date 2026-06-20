import { Router } from "express"
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
} from "../controllers/video.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import upload from "../middlewares/multer.js"
import rateLimit from "express-rate-limit"

const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Upload limit reached. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
})

const router = Router()

router.route("/")
    .get(getAllVideos)
    .post(verifyJWT, uploadLimiter, upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]), publishAVideo)

router.route("/:videoId")
    .get(getVideoById)
    .patch(verifyJWT, upload.fields([{ name: "thumbnail", maxCount: 1 }]), updateVideo)
    .delete(verifyJWT, deleteVideo)

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus)

export default router
