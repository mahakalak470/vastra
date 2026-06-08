const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
    try {
        const { collection, sort, search } = req.query;
        let query = { active: true };

        if (collection && collection !== 'all') {
            query.collection = collection;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { desc: { $regex: search, $options: 'i' } },
                { collection: { $regex: search, $options: 'i' } }
            ];
        }

        let products = Product.find(query);

        if (sort === 'price-low') products = products.sort({ price: 1 });
        else if (sort === 'price-high') products = products.sort({ price: -1 });
        else if (sort === 'rating') products = products.sort({ rating: -1 });
        else if (sort === 'newest') products = products.sort({ createdAt: -1 });
        else products = products.sort({ createdAt: -1 });

        const results = await products;
        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', require('../middleware/auth'), async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.put('/:id', require('../middleware/auth'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.delete('/:id', require('../middleware/auth'), async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
