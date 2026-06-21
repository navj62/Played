import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Hard caps. The video cap is kept under Vercel's serverless request-body limit
// since the file is buffered in memory and forwarded to Cloudinary directly.
const VIDEO_MAX_BYTES = 4 * 1024 * 1024 // 4 MB
const IMAGE_MAX_BYTES = 2 * 1024 * 1024 // 2 MB

// Serverless filesystems are read-only outside /tmp, so we never touch disk —
// files are held in memory as a Buffer and streamed straight to Cloudinary.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'video') {
        if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new ApiError(400, `Invalid video type: ${file.mimetype}. Allowed: mp4, webm, ogg, quicktime`), false)
        }
    } else {
        if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new ApiError(400, `Invalid image type: ${file.mimetype}. Allowed: jpeg, png, webp, gif`), false)
        }
    }
}

// Used by routes that accept a video (plus its thumbnail): capped at the video limit.
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: VIDEO_MAX_BYTES,
    }
});

// Used by image-only routes (avatar, cover image, thumbnail update): tighter cap.
const uploadImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: IMAGE_MAX_BYTES,
    }
});

export default upload;
export { uploadImage, VIDEO_MAX_BYTES, IMAGE_MAX_BYTES };
