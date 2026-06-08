const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload } = require('../services/cloudinary');

router.post('/image', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }
        res.json({ success: true, data: { url: req.file.path, publicId: req.file.filename } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/images', auth, upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No image files provided' });
        }
        const images = req.files.map(file => ({ url: file.path, publicId: file.filename }));
        res.json({ success: true, data: images });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
