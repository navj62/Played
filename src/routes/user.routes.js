import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory,
} from "../controllers/user.controllers.js";
import upload, { uploadImage } from "../middlewares/multer.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import rateLimit from "express-rate-limit"

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
})

const router=Router()

router.route("/register").post(
    authLimiter,
    uploadImage.fields([
        { name:"avatar", maxCount:1 },
        { name:"coverImage", maxCount:1 }
    ]),
    registerUser
)

router.route("/login").post(authLimiter, loginUser)
router.route("/refresh-token").post(authLimiter, refreshAccessToken)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/change-password").post(authLimiter, verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, uploadImage.fields([{ name:"avatar", maxCount:1 }]), updateUserAvatar)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router