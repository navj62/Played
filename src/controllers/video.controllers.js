import mongoose, {isValidObjectId} from "mongoose"
import {Video, Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const {title, description} = req.body
    const videoPath = req.files?.video?.[0]?.path;
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;

    if(!videoPath){
        throw new ApiError(400,"Video not uploaded")
    }
     if(!thumbnailPath){
        throw new ApiError(400,"thumbnail not uploaded")
    }
    const videofile= await uploadOnCloudinary(videoPath)
    const thumbnail= await uploadOnCloudinary(thumbnailPath)

    await fs.unlink(videoPath);
    await fs.unlink(thumbnailPath);

    const video= await Video.create({
        videoFile:videofile.url,
        thumbnail:thumbnail.url,
        title:title,
         owner: req.user?._id, 
        description:description,
        duration:videofile.duration,
    })

    if(!video){
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

    const video=await Video.findById(videoId)
     if(!video){
        throw new ApiError(404,"Video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video feteched succesfully"
        )
    )
   
})

const updateVideo = asyncHandler(async (req, res) => {
     //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params
     
    if(!videoId){
        throw new ApiError(400,"VideoId is required")
    }
    
    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"Video not found")
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
   const thumbnailPath = req.files?.thumbnail?.[0]?.path;

  if (thumbnailPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailPath);

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


    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                ispublished: !video.ispublished
            }
        },
        { new: true }
    )
    if(!video) {
        throw new ApiError(404, "Video not found")
    }  

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