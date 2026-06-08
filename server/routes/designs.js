const express = require('express');
const router = express.Router();
const axios = require('axios');
const Design = require('../models/Design');
const { generateImage } = require('../services/nvidiaFlux');
const { uploadBase64, uploadBuffer } = require('../services/cloudinary');
const { aiLimiter } = require('../middleware/rateLimit');
const auth = require('../middleware/auth');

router.post('/generate', aiLimiter, async (req, res) => {
    try {
        const { prompt, style, sessionId } = req.body;

        if (!prompt || prompt.trim().length < 3) {
            return res.status(400).json({ success: false, message: 'Please provide a design description (at least 3 characters)' });
        }

        const design = new Design({
            prompt: prompt.trim(),
            style: style || 'custom',
            sessionId: sessionId || 'anon',
            status: 'processing'
        });
        await design.save();

        const result = await generateImage(prompt, style);

        if (!result.success) {
            design.status = 'failed';
            await design.save();
            return res.status(500).json({ success: false, message: result.message || 'AI generation failed', designId: design._id });
        }

        let imageUrl = '';

        if (result.imageBuffer) {
            const uploadResult = await uploadBuffer(result.imageBuffer, 'vastra/designs');
            if (uploadResult.success) {
                imageUrl = uploadResult.url;
                design.publicId = uploadResult.publicId;
            }
        } else if (result.imageBase64) {
            const uploadResult = await uploadBase64(result.imageBase64, 'vastra/designs');
            if (uploadResult.success) {
                imageUrl = uploadResult.url;
                design.publicId = uploadResult.publicId;
            }
        } else if (result.imageUrl) {
            try {
                const imgRes = await axios.get(result.imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
                const buffer = Buffer.from(imgRes.data, 'binary');
                const uploadResult = await uploadBuffer(buffer, 'vastra/designs');
                if (uploadResult.success) {
                    imageUrl = uploadResult.url;
                    design.publicId = uploadResult.publicId;
                } else {
                    imageUrl = result.imageUrl;
                }
            } catch (dlErr) {
                console.error('Image download error:', dlErr.message);
                imageUrl = result.imageUrl;
            }
        } else if (result.rawData) {
            const raw = result.rawData;
            if (raw.image) {
                const uploadResult = await uploadBase64(raw.image, 'vastra/designs');
                if (uploadResult.success) {
                    imageUrl = uploadResult.url;
                    design.publicId = uploadResult.publicId;
                }
            } else if (raw.url) {
                imageUrl = raw.url;
            }
        }

        if (!imageUrl) {
            design.status = 'failed';
            await design.save();
            return res.status(500).json({ success: false, message: 'Could not extract image from AI response', designId: design._id });
        }

        design.imageUrl = imageUrl;
        design.status = 'completed';
        await design.save();

        res.json({ success: true, data: { designId: design._id, imageUrl, prompt, style, status: 'completed' } });
    } catch (err) {
        console.error('Design generation error:', err);
        res.status(500).json({ success: false, message: 'Design generation failed. Please try again.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const design = await Design.findById(req.params.id);
        if (!design) return res.status(404).json({ success: false, message: 'Design not found' });
        res.json({ success: true, data: design });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const designs = await Design.find().sort({ createdAt: -1 }).limit(100);
        res.json({ success: true, data: designs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id/feature', auth, async (req, res) => {
    try {
        const design = await Design.findByIdAndUpdate(req.params.id, { featured: req.body.featured }, { new: true });
        if (!design) return res.status(404).json({ success: false, message: 'Design not found' });
        res.json({ success: true, data: design });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const design = await Design.findByIdAndDelete(req.params.id);
        if (!design) return res.status(404).json({ success: false, message: 'Design not found' });
        res.json({ success: true, message: 'Design deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
