const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const collections = await Collection.find({ active: true }).sort({ order: 1 });
        res.json({ success: true, data: collections });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const collection = new Collection(req.body);
        await collection.save();
        res.status(201).json({ success: true, data: collection });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const collection = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
        res.json({ success: true, data: collection });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const collection = await Collection.findByIdAndDelete(req.params.id);
        if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
        res.json({ success: true, message: 'Collection deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
