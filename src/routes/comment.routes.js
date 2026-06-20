import { Router } from "express"
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
} from "../controllers/comment.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/:videoId").get(getVideoComments).post(verifyJWT, addComment)
router.route("/:videoId/:commentId").patch(verifyJWT, updateComment)
router.route("/:commentId").delete(verifyJWT, deleteComment)

export default router
