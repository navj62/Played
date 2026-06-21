import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Uploads an in-memory file buffer (from multer's memoryStorage) straight to
// Cloudinary — no disk involved, which is required on serverless. Files are
// capped small (see multer.js), so a plain non-chunked upload() is sufficient.
const uploadOnCloudinary = async(fileBuffer, mimetype)=>{
    try {
        if(!fileBuffer) return null

        const dataUri = `data:${mimetype || 'application/octet-stream'};base64,${fileBuffer.toString('base64')}`

        const response = await cloudinary.uploader.upload(dataUri, {
            resource_type: "auto",
        })

        return response
    } catch (error) {
        console.error("Cloudinary upload error:", error?.message || error)
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