import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Likes } from "../models/likes.model.js"
import { json } from "express"
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(400,"Video id not found")
    }

    if(!isValidObjectId(videoId)){
         throw new ApiError(400,"Invalid Obj id")
    }
    const userId=req.user._id

     if(!userId){
        throw new ApiError(400, "userId is required")
    }
    // to check if the user already liked it
    // findOne:If either field doesn't match, it returns null.
    const existedLike= await Likes.findOne({
        video:videoId,
        likedBy:userId
    })
    
    // if video is already liked remove the like
    if(existedLike){
       await Likes.findByIdAndDelete(existedLike._id)
         return res
        .status(200)
        .json(new ApiResponse(200, null, "Video unliked successfully"))
    }

    // if like is not present

    const like= await Like.create({
        video:videoId,
        likedBy:userId
    })

    if(!like){
        throw new ApiError(500,"failed to toggle the like")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            like,
            "Video liked succesfully"
        )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
     //TODO: toggle like on comment
    const {commentId} = req.params
    if(!commentId){
        throw new ApiError(400,"CommentId is wrong")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id")
    }

    const userId=req.user._id;
    if(!userId){
        throw new ApiError(400,"Userid is wrong")
    }

    const existedLike= await Like.findOne({
       comment: commentId,
        likedBy:userId
    })

    if(existedLike){
        await Like.findByIdAndDelete(existedLike._id)
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Comment unliked succesfully"
            )
        )
    }

    const like= await Like.create({
        comment:commentId,
        likedBy:userId
    })

    if(!like){
        throw new ApiError(500,"Something went wrong")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            like,
            "Comment liked Succesfully"
        )
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
        //TODO: toggle like on tweet
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400,"Tweet Id is required")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }
    const userId =req.user._id
    
    const likeExisted= await Like.findOne({
        tweet:tweetId,
        likedBy:userId
    })
    if(likeExisted){
        await Like.findByIdAndDelete(likeExisted._id)
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Tweet unliked succesfully"
            )
        )
    }

    const like=await Like.create({
        tweet:tweetId,
        likedBy:userId
    })

    if(!like){
        throw new ApiError(500,"Something went wrong")
    }

    return res.
    status(200)
    .json(
        new ApiResponse(
            200,
            like,
            "Liked the tweet succesfully "
        )
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {

    const LikedVideos=await Like.aggregate([
        {
            $match:{
               likedBy:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"LikedVideos",
            }
        },
        {
            $addFields:{
                LikedVideos:{
                    $arrayElemAt: ["$LikedVideos", 0] 
                }
            }
        }

    ])
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}