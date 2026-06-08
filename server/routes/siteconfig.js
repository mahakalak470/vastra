const express = require('express');
const router = express.Router();
const SiteConfig = require('../models/SiteConfig');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const config = await SiteConfig.getConfig();
        res.json({ success: true, data: config });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/', auth, async (req, res) => {
    try {
        const config = await SiteConfig.getConfig();
        const updates = req.body;
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                config[key] = updates[key];
            }
        });
        await config.save();
        res.json({ success: true, data: config });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;
