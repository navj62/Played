import multer from 'multer';

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'video') {
        if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error(`Invalid video type: ${file.mimetype}. Allowed: mp4, webm, ogg, quicktime`), false)
        }
    } else {
        if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error(`Invalid image type: ${file.mimetype}. Allowed: jpeg, png, webp, gif`), false)
        }
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 200 * 1024 * 1024, // 200 MB max per file
    }
});

export default upload;
