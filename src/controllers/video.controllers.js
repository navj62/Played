import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Likes} from "../models/likes.model.js"
import {Subscription} from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query

    const filter = { isPublished: true }
    if (query) filter.title = { $regex: query, $options: 'i' }
    if (userId && isValidObjectId(userId)) filter.owner = userId

    const sortOrder = sortType === 'asc' ? 1 : -1
    const skip = (Number(page) - 1) * Number(limit)

    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .populate("owner", "username avatar fullName")

    const total = await Video.countDocuments(filter)

    return res.status(200).json(
        new ApiResponse(200, { videos, total, page: Number(page), limit: Number(limit) }, "Videos fetched successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const {title, description} = req.body
    const videoInput = req.files?.video?.[0];
    const thumbnailInput = req.files?.thumbnail?.[0];

    if(!title?.trim()){
        throw new ApiError(400,"Title is required")
    }
    if(!description?.trim()){
        throw new ApiError(400,"Description is required")
    }
    if(!videoInput){
        throw new ApiError(400,"Video not uploaded")
    }
     if(!thumbnailInput){
        throw new ApiError(400,"thumbnail not uploaded")
    }

    // Upload the small thumbnail first so an invalid image fails fast,
    // before we spend time pushing the video to Cloudinary.
    const thumbnail= await uploadOnCloudinary(thumbnailInput.buffer, thumbnailInput.mimetype)
    if(!thumbnail?.url){
        throw new ApiError(500,"Thumbnail upload to cloud failed")
    }

    const videofile= await uploadOnCloudinary(videoInput.buffer, videoInput.mimetype)
    if(!videofile?.url){
        // Thumbnail already landed on Cloudinary — clean it up so we don't orphan it.
        await deleteFromCloudinary(thumbnail.url, "image")
        throw new ApiError(500,"Video upload to cloud failed")
    }

    let video
    try {
        video = await Video.create({
            videoFile:videofile.url,
            thumbnail:thumbnail.url,
            title,
            owner: req.user?._id,
            description,
            duration:videofile.duration || 0,
        })
    } catch (err) {
        video = null
    }

    if(!video){
        // Roll back both uploaded assets so a failed DB write leaves no orphans.
        await Promise.all([
            deleteFromCloudinary(videofile.url, "video"),
            deleteFromCloudinary(thumbnail.url, "image"),
        ])
        throw new ApiError(500,"Something went wrong while uploading video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "video uploaded succesfully"
        )
    )

})

// Revisit
const getVideoById = asyncHandler(async (req, res) => {
     //TODO: get video by id 

    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400,"VideoId is required")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const video=await Video.findById(videoId).populate("owner", "username avatar fullName")
     if(!video){
        throw new ApiError(404,"Video not found")
    }

    // Real like count for this video
    const likeCount = await Likes.countDocuments({ video: videoId })

    // Per-user state + watch history + view count (only when authenticated)
    let isLiked = false
    let isSubscribed = false

    if (req.user?._id) {
        const userId = req.user._id

        isLiked = !!(await Likes.findOne({ video: videoId, likedBy: userId }))

        if (video.owner?._id) {
            isSubscribed = !!(await Subscription.findOne({
                channel: video.owner._id,
                subscriber: userId,
            }))
        }

        // Record watch history (no duplicates) — skip the owner watching their own video
        await User.findByIdAndUpdate(userId, {
            $pull: { watchHistory: videoId },
        })
        await User.findByIdAndUpdate(userId, {
            $push: { watchHistory: { $each: [videoId], $position: 0 } },
        })
    }

    // Increment view count
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } })
    video.views += 1

    const data = { ...video.toObject(), likeCount, isLiked, isSubscribed }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            data,
            "Video feteched succesfully"
        )
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400,"VideoId is required")
    }

    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"Video not found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to update this video")
    }

   const {title,description}=req.body

   if(!title){
    throw new ApiError(400,"Title is required")
   }

   if(!description){
    throw new ApiError(400,"description is required")
   }

   video.title=title
   video.description=description
   const thumbnailInput = req.files?.thumbnail?.[0];

  if (thumbnailInput) {
    const thumbnail = await uploadOnCloudinary(thumbnailInput.buffer, thumbnailInput.mimetype);

    if (!thumbnail?.url) {
      throw new ApiError(400, "Thumbnail upload failed");
    }

    video.thumbnail = thumbnail.url;
  }

  await video.save()

   return res
   .status(200)
   .json(
    new ApiResponse(
         200,
         video,
         "Video has been updated succesfully"
    )
   )
})

const deleteVideo = asyncHandler(async (req, res) => {
  // TODO: delete video
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "VideoId is required");
  }

  const videoExist = await Video.findById(videoId);

  if (!videoExist) {
    throw new ApiError(400, "Video does not exist");
  }

  if(videoExist.owner.toString() !== req.user._id.toString()){
    throw new ApiError(403,"You are not authorized to delete this video")
  }

  await Promise.all([
    deleteFromCloudinary(videoExist.videoFile, "video"),
    deleteFromCloudinary(videoExist.thumbnail, "image"),
  ])

  const video = await Video.findByIdAndDelete(videoId);

  return res.status(200).json(
    new ApiResponse(
      200,
      video,
      "Video deleted successfully"
    )
  );
});


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId?.trim()) {
        throw new ApiError(400, "videoId is required")
    }

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to change this video's publish status")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video publish status updated successfully"))
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}