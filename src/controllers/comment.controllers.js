import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { json } from "express"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}=req.params
    const { content } = req.body;
    if(!videoId){
        throw new ApiError(400,"Video id is required")
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }
    if(!content?.trim()){
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.create({
        content:content,
        video:videoId,
        owner:req.user._id
    })
    if(!comment){
        throw new ApiError(500, "Failed to create comment")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment created successfully"))


})


const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const{videoId,commentId}=req.params
    const {content}=req.body
     if(!videoId){
        throw new ApiError(400,"Video id is required")
    }

     if(!commentId){
        throw new ApiError(400,"commentId is required")
    }
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

     if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid video id")
    }

    const video= await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "Invalid video id")
    }

     if(!content){
        throw new ApiError(400,"Content is required")
    }

    const comment =await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(400,"Comment not found")
    }

    comment.content=content
    
    await comment.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment is updated"
        )
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} =req.params
    if(!commentId){
        throw new ApiError(400,"Comment Id is required")
    }
    const commentExist=await Comment.findById(commentId)
    if(!commentExist){
        throw new ApiError(400,"Comment not found")
    }
    const comment= await Comment.findByIdAndDelete(commentId)
     
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment has been deleted"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }