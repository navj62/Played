import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


    const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null
        //upload the file on cloudinary
      const response=  await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",

        })
        //file has been uploaded
        console.log("File is uploaded on cloudinary", response.url )
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.error("Cloudinary upload error:", error.message)
        try { fs.unlinkSync(localFilePath) } catch (_) {}
        return null
    }
    }

const deleteFromCloudinary = async (url, resourceType = "image") => {
    try {
        if (!url) return null
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
        const publicId = match?.[1]
        if (!publicId) return null
        return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    } catch (error) {
        return null
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}