import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Likes} from "../models/likes.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id)

    const [videoStats] = await Video.aggregate([
        { $match: { owner: userId } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$likes" } },
            }
        }
    ])

    const totalSubscribers = await Subscription.countDocuments({ channel: userId })

    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos: videoStats?.totalVideos || 0,
            totalViews: videoStats?.totalViews || 0,
            totalLikes: videoStats?.totalLikes || 0,
            totalSubscribers,
        }, "Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({ owner: req.user._id }).sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    )
})

export {
    getChannelStats,
    getChannelVideos
}
