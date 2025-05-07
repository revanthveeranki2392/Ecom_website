const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

require('dotenv').config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});




// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route POST /api/upload
// @desc Upload a file to Cloudinary
// @access Public

router.post("/", upload.single('image'), async (req, res) => {
    try {
        if(!req.file) {
            return res.status(400).json({message: "No file uploaded"});
        }

        //Function to handle the stream upload to Cloudinary
        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((error, result) => {
                    if(result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });

                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        };

        //call the stream upload function with the file buffer
        const result = await streamUpload(req.file.buffer);

        // respond with the uploaded image details
        res.json({ imageUrl: result.secure_url });
        
    } catch (error) {
        console.error("Error uploading image", error);
        res.status(500).json({message: "Server Error"});
        
    }
});

module.exports = router;