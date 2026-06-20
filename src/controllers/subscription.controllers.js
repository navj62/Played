import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId?.trim()) {
        throw new ApiError(400, "Channel ID is required");
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscriberId = req.user?._id;

    if (!subscriberId) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    if (subscriberId.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: subscriberId
    });

    if (existingSubscription) {
        const removedSubscription = await Subscription.findByIdAndDelete(existingSubscription._id);
        if (!removedSubscription) {
            throw new ApiError(500, "Failed to remove subscription");
        }

        return res.status(200).json(
            new ApiResponse(200, null, "Subscription removed")
        );
    }

    const newSubscription = await Subscription.create({
        channel: channelId,
        subscriber: subscriberId
    });

    if (!newSubscription) {
        throw new ApiError(500, "Failed to create subscription");
    }

    return res.status(200).json(
        new ApiResponse(200, newSubscription, "Subscription added successfully")
    );
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId?.trim()) {
        throw new ApiError(400, "Channel ID is required");
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    const channelSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails"
        },
        {
            $project: {
                _id: 0,
                subscriber: "$subscriberDetails"
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            channelSubscribers,
            "Channel subscribers fetched successfully"
        )
    );
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId?.trim()) {
        throw new ApiError(400, "Subscriber ID is required");
    }

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users", // fix typo here
                localField: "channel",
                foreignField: "_id",
                as: "SubscribedChannel"
            }
        },
        {
            $unwind: "$SubscribedChannel" // fix syntax here
        },
        {
            $project: {
                _id: 0,
                channel: "$SubscribedChannel"
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribedChannels,
            "Subscribed channels fetched successfully"
        )
    );
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}