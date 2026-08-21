const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');


// Configure multer for disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "/tmp")
    },
    filename: function (req, file, cb) {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  })
  
const upload = multer({ 
  storage: storage,
  limits: {
    // Stay under Vercel's ~4.5MB request body limit so the platform
    // does not reject the upload before CORS headers are applied.
    fileSize: 4 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
})

module.exports = upload;