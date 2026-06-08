const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'vastra',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

async function uploadBase64(base64Data, folder) {
    try {
        const result = await cloudinary.uploader.upload(
            `data:image/png;base64,${base64Data}`,
            { folder: folder || 'vastra/designs', quality: 'auto', fetch_format: 'auto' }
        );
        return { success: true, url: result.secure_url, publicId: result.public_id };
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        return { success: false, message: err.message };
    }
}

async function uploadBuffer(buffer, folder) {
    try {
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: folder || 'vastra', quality: 'auto', fetch_format: 'auto' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });
        return { success: true, url: result.secure_url, publicId: result.public_id };
    } catch (err) {
        console.error('Cloudinary buffer upload error:', err);
        return { success: false, message: err.message };
    }
}

async function deleteImage(publicId) {
    try {
        await cloudinary.uploader.destroy(publicId);
        return { success: true };
    } catch (err) {
        console.error('Cloudinary delete error:', err);
        return { success: false, message: err.message };
    }
}

module.exports = { cloudinary, upload, uploadBase64, uploadBuffer, deleteImage };
