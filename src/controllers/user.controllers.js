import {asyncHandler} from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import {ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import jwt from "jsonwebtoken"
import mongoose from 'mongoose';
const genrateAccessAndRefreshToken=async(userId)=>
    {
    try {
        const user=await User.findById(userId)
        const accessToken=user.genrateAccessToken()
        const refreshToken=user.genrateRefreshToken()

        // you have to add refresh token in the user model
        user.refreshToken=refreshToken
         
        await user.save({validateBeforeSave:false})
        
        return{accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Somthing went wrong whihle genratin token")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    // steps
    // 1. Take data from frontend
    // 2. validate data {not empty}
    // 3.check if user alredy exist{username,email}
    // 4.check for images,check for avatar
    // 5. upload them to cloudinary
    // 6.create user object-create entry in database
    // 7.remove password and refreshTOken feild from response
    // 8.check for user creation,return response

    // step-1
    const{fullName,username,email,password}=req.body;

    if(!fullName){
        throw new ApiError(400,"fullName is required")
    }
     if(!username){
        throw new ApiError(400,"username is required")
    }
     if(!email){
        throw new ApiError(400,"email is required")
    }
     if(!password){
        throw new ApiError(400,"password is required")
    }

    const existedUser=await User.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(existedUser){
        throw new ApiError(409,"User with same email and username is alredy existed")
    }

   const avatarFile= req.files?.avatar?.[0]
   const coverImageFile=req.files?.coverImage?.[0]

   const avatar= avatarFile ? await uploadOnCloudinary(avatarFile.buffer, avatarFile.mimetype) : null
   const coverImage= coverImageFile ? await uploadOnCloudinary(coverImageFile.buffer, coverImageFile.mimetype) : null

  const user=await User.create({
    fullName,
    username:username.toLowerCase(),
    avatar:avatar?.url || "",
    coverImage:coverImage?.url || "",
    email,
    password
   })

   const userExist=await User.findById(user._id).select(
        "-password -refreshToken"
   )
   if(!userExist){
   throw new ApiError(500,"Something went wrong while registring user")
   }
   
   return res.
   status(201)
   .json(
    new ApiResponse(201,userExist,"user Resitered succesfully")
)
})

const loginUser=asyncHandler(async(req,res)=>{
    //steps 
    // take data
    //check username or email
    //find the user
    //verify the password
    //grant user access and refresh token
    // send cookie
    const{username,email,password}=req.body
    if(!username && !email){
        throw new ApiError(400,"Username or email is required")
    }
    if(!password){
        throw new ApiError(400,"Password is required")
    }

    // this user does not have refreshtoken
    const user=await User.findOne({
        $or:[
            { email: email?.toLowerCase() },
            { username: username?.toLowerCase() },
        ]
    })

    if(!user){
        throw new ApiError(400,"User does not exist")
    }

   const isPasswordvalid= await user.isPasswordCorrect(password)
    if(!isPasswordvalid){
        throw new ApiError(401,"Password invalid")
    }

    const{accessToken,refreshToken}=await genrateAccessAndRefreshToken(user._id)

    //user with refresh token
    const loggedInUser= await User.findById(user._id)
    .select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        // Cross-site cookies (frontend and backend on different domains in
        // production) require SameSite=None + Secure. Lax keeps localhost working.
        sameSite:process.env.NODE_ENV==="production" ? "none" : "lax"
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken

            },
            "user logged in succesfully"
        )
    )

})

const logoutUser=asyncHandler(async(req,res)=>{
    //cookie cleer karni he
   const user= await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined
        }

    },
    {
        new:true
    }
)
         const options={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        // Cross-site cookies (frontend and backend on different domains in
        // production) require SameSite=None + Secure. Lax keeps localhost working.
        sameSite:process.env.NODE_ENV==="production" ? "none" : "lax"
    }
     
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    // Take old refresh token from the cookies
    //verfiy the refresh token
    //take id from refresh token
    // find user from id
    // from user validate incomingRefreshToken and user.refresh token
    // genrate new access and refresh token then update
    // if it is verifed update the access and refresh token
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"un req")
    }

   try {
     const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
     const user=await User.findById(decodedToken?._id)
 
      if(!user){
         throw new ApiError(401,"invalid refresh token")
     }
 
     // validate refresh token
     if(incomingRefreshToken!==user.refreshToken){
          throw new ApiError(401,"Refresh token is expired")
     }
 
     const options={
         httpOnly:true,
         secure:process.env.NODE_ENV==="production",
         sameSite:process.env.NODE_ENV==="production" ? "none" : "lax"
     }

     const {accessToken,refreshToken}=await genrateAccessAndRefreshToken(user._id)
 
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
         new ApiResponse(
             200,
             {accessToken,refreshToken},
             "Access token refresh succesfully"
         )
     )
     
 
   } catch (error) {
    throw new ApiError(401,error?.message||"invalid refresh token")
   }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    //take oldPassword and new pass form fronentend
   // verif the old pass if it is correct proced
    const {oldPassword,newPassword}=req.body;
    if(!oldPassword || !newPassword){
        throw new ApiError(400,"Old and new passwords are required")
    }
    const user= await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
  throw new ApiError(400,"Invalid password")
  }

  user.password=newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(
    new ApiResponse(
        200,
        {},
        "Password is succesfully changed"
    )
  )
})

const getCurrentUser=asyncHandler(async(req,res)=>{
   return res
   .status(200)
   .json(
    new ApiResponse(
        200,
       req.user,
        "Current user fetched Succesfull"
    )
   )
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const{fullName,email}=req.body
    if(!fullName || !email){
        throw new ApiError(400,"fullName and email are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set:{ fullName, email } },
        { new: true }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
   const avatarFile = req.files?.avatar?.[0];
    if(!avatarFile){
        throw new ApiError(400,"Avatar not found")
    }
    const avatar=await uploadOnCloudinary(avatarFile.buffer, avatarFile.mimetype)

    if(!avatar?.url){
        throw new ApiError(400,"Avatar not uploaded")
    }

    const oldUser = await User.findById(req.user?._id)
    if(oldUser?.avatar) {
        await deleteFromCloudinary(oldUser.avatar, "image")
    }

   const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true},

    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Avatar updated succesfully"
        )
    )

})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const{username}=req.params;

    if(!username?.trim()){
        throw new ApiError(400,"Username does not exist")
    }

   const channel=await User.aggregate([

    //1
    {
        $match:{
            //for finding the username 
            // 1 pipeline for filltering
            username:username?.toLowerCase()
        }
    },
    //2
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },
    //3
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"
        }
    },
    //4
    {
        $addFields:{
            subscribersCount:{
                $size:"$subscribers"
            },

           channelsSubscribedToCount:{
                $size:"$subscribedTo"
            },

            isSubscribed:{
                $cond:{
                    if:{$in:[req.user._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false,
                }
            },
        },     
    },
    //5
    {
        // mark the fields 1 that you wnat to project{show}
        $project:{
            username:1,
            fullName:1,
            subscribersCount:1,
             channelsSubscribedToCount:1,
             isSubscribed:1,
             avatar:1,
             coverImage:1,
             email:1,
        }
    }

   ])

   if(!channel?.length){
    throw new ApiError(404,"Channel does not exist")
   }
   
   return res
   .status(200)
   .json(
    new ApiResponse(
        200,
        channel[0],
        "User channel fetched succesfully"
    )
   )
})

const getWatchHistory=asyncHandler(async(req,res)=>{
   const user=await User.aggregate([
    {
        $match:{
            _id:new mongoose.Types.ObjectId(req.user._id)
        }
    },
    {
        $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistoryVideos",
            // sub pipeline
            pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                           {
                            $project:{
                                username:1,
                                fullName:1,
                                avatar:1
                            }
                        }
                        ]
                    }
                },

                {
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }

            ]
        }
    },
    {
        // $lookup does not preserve array order; re-sort to match watchHistory
        // (stored most-recent-first), dropping any ids whose video no longer exists.
        $addFields:{
            watchHistory:{
                $filter:{
                    input:{
                        $map:{
                            input:"$watchHistory",
                            as:"id",
                            in:{
                                $let:{
                                    vars:{
                                        idx:{ $indexOfArray:["$watchHistoryVideos._id","$$id"] }
                                    },
                                    in:{
                                        $cond:[
                                            { $gte:["$$idx",0] },
                                            { $arrayElemAt:["$watchHistoryVideos","$$idx"] },
                                            null
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    cond:{ $ne:["$$this",null] }
                }
            }
        }
    }
   ])

   return res
   .status(200)
   .json(
    new ApiResponse(
        200,
        user[0].watchHistory,
        "WathcHistory fetch succesfully"
    )
   )
})





export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,getUserChannelProfile,getWatchHistory}