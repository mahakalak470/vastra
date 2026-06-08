const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Collection = require('../models/Collection');
const Order = require('../models/Order');
const Design = require('../models/Design');

router.get('/stats', auth, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ active: true });
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'placed' });
        const totalDesigns = await Design.countDocuments();
        const completedDesigns = await Design.countDocuments({ status: 'completed' });
        const revenueResult = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$subtotal' } } }]);
        const totalRevenue = revenueResult[0]?.total || 0;
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

        res.json({
            success: true,
            data: {
                totalProducts, activeProducts,
                totalOrders, pendingOrders,
                totalDesigns, completedDesigns,
                totalRevenue,
                recentOrders
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
