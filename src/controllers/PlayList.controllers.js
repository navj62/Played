import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Playlist } from "../models/playlist.model.js"
import { isValidObjectId } from "mongoose"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;
    if(!name){
        throw new ApiError(400,"Name is required")
    }
     if(!description){
        throw new ApiError(400,"description is required")
    }

     if(!isValidObjectId(req.user._id)){
        throw new ApiError(400, "Invalid user id")
    }

    const playlist=Playlist.create({
        name,
        description,
        owner:req.user._id,
        videos:[]
    })
    if(!playlist){
        throw new ApiError(500,"Something went wrong")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist Has been created succesfully"
        )
    )
}
)

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId}=req.params
    if(!userId){
        throw new ApiError(400,"UserId is required")
    }
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"UserId wrong")
    }

    const playlists=await Playlist.findOne(
       { owner:userId}
    ).populate("videos")

      if(!playlists || playlists.length === 0){
        throw new ApiError(404, "No playlists found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlists,
            "Playlists fethed succesfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId?.trim()){
        throw new ApiError(400, "Playlist id is required")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist=await Playlist.findById(playlistId).populate("videos")

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            playlist, "Playlist fetched successfully"
        ))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Input validations
    if (!playlistId?.trim()) {
        throw new ApiError(400, "Playlist id is required");
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    if (!videoId?.trim()) {
        throw new ApiError(400, "Video id is required");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const playlist = await Playlist.findById(playlistId).populate("videos");
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const alreadyExists = playlist.videos.some((v) =>
        v._id.toString() === videoId
    );

    if (alreadyExists) {
        throw new ApiError(400, "Video already exists in the playlist");
    }

    playlist.videos.push(videoId);
    const updatedPlaylist = await playlist.save();

    const populatedPlaylist = await Playlist.findById(updatedPlaylist._id).populate("videos");
    if (!populatedPlaylist) {
        throw new ApiError(500, "Failed to populate videos in playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, populatedPlaylist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
      if (!playlistId?.trim()) {
        throw new ApiError(400, "Playlist id is required");
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    if (!videoId?.trim()) {
        throw new ApiError(400, "Video id is required");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400 ,"Playlist does not exist")
    }

     const alreadyExists = playlist.videos.some((v) =>
        v._id.toString() === videoId
    );

    if(!alreadyExists){
        throw new ApiError(400,"Video does not exit in playlist")
    }
    
     playlist.videos=playlist.videos.filter((vid)=> vid._id.toString() !== videoId)

    const updatedPlaylist = await playlist.save();

    const populatedPlaylist = await Playlist.findById(updatedPlaylist._id).populate("videos");
    if (!populatedPlaylist) {
        throw new ApiError(500, "Failed to populate videos in playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, populatedPlaylist, "Video removed from the playlist successfully"));
    

})

const deletePlaylist = asyncHandler(async (req, res) => {
        // TODO: delete playlist
    const {playlistId} = req.params
    if(!playlistId?.trim()){
        throw new ApiError(400, "Playlist id is required")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
        throw new ApiError(404, "Playlist not found or already deleted");
    }
    
    return res.
    status(200)
    .json((
        new ApiResponse(
            200,
            null,
            "Playlist deleted succesfully"
        )
    ))

})