const cloudinary = require("cloudinary").v2;
const fs = require("fs");
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload the file
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });
    // Remove the locally saved temp file
    fs.unlinkSync(localFilePath);
    console.log("File has been uploaded on Cloudinary : ", response.url);
    // Return only the URL
    return response.url;
  } catch (error) {
    // Remove the locally saved temp file in case of upload failure
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Error uploading file to Cloudinary:", error);
    return null;
  }
};

module.exports = { uploadOnCloudinary };
