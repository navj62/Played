import multer from 'multer';

// 1️⃣ Set up the storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp');   // Folder name where files go
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name
  }
});

// 2️⃣ Create the upload middleware
const upload = multer({ storage: storage });

export default upload;
