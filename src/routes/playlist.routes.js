import { Router } from "express"
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
} from "../controllers/PlayList.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/").post(verifyJWT, createPlaylist)
router.route("/user/:userId").get(verifyJWT, getUserPlaylists)
router.route("/:playlistId").get(getPlaylistById).delete(verifyJWT, deletePlaylist)
router.route("/:playlistId/:videoId")
    .post(verifyJWT, addVideoToPlaylist)
    .delete(verifyJWT, removeVideoFromPlaylist)

export default router
