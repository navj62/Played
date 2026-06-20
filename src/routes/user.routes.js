import { Router } from "express";
import { registerUser,loginUser,logoutUser,refreshAccessToken } from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route("/upload").post(
      protect,
    upload.fields([
        {
            name:"video",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishAVideo
)


router.route("/login").post(loginUser)


// secured rout
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refrsh-token").post(refreshAccessToken)

export default router