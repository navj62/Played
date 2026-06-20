import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweets.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if(!content?.trim()){
        throw new ApiError(400,"Content is required")
    }
    const tweet = await Tweet.create({ content, owner: req.user._id })
    return res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"Valid userId is required")
    }
    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 })
    return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400,"Valid tweetId is required")
    }
    if(!content?.trim()){
        throw new ApiError(400,"Content is required")
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet) throw new ApiError(404,"Tweet not found")
    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to update this tweet")
    }
    tweet.content = content
    await tweet.save()
    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400,"Valid tweetId is required")
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet) throw new ApiError(404,"Tweet not found")
    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to delete this tweet")
    }
    await Tweet.findByIdAndDelete(tweetId)
    return res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
