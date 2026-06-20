import mongoose,{Schema} from "mongoose";

const likesSchema=new Schema({
     owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
         required: true
    },

   tweet:{
    type:Schema.Types.ObjectId,
            ref:"Tweet"
   },

    video:{
       type:Schema.Types.ObjectId,
            ref:"Video"
    },
   
     comment:{
       type:Schema.Types.ObjectId,
            ref:"Comment"
    },

    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
   
},{timestamps:true})

export const Likes=mongoose.model("Likes",likesSchema)