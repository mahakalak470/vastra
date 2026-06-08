const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { upload, uploadBase64 } = require('../services/cloudinary');
const { buildOrderMessage, getWhatsAppLink } = require('../services/whatsapp');
const { v4: uuidv4 } = require('uuid');

router.post('/', async (req, res) => {
    try {
        const { items, customer, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city || !customer.state || !customer.pincode) {
            return res.status(400).json({ success: false, message: 'Please fill all required customer details' });
        }

        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId || item.id);
            if (!product) continue;

            const orderItem = {
                productId: product._id,
                name: product.name,
                price: product.price,
                size: item.size || product.sizes[2],
                qty: item.qty || 1,
                image: product.image
            };
            orderItems.push(orderItem);
            subtotal += product.price * (item.qty || 1);
        }

        if (orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid products in cart' });
        }

        const orderId = 'VST-' + uuidv4().substring(0, 8).toUpperCase();

        const order = new Order({
            orderId,
            items: orderItems,
            customer,
            subtotal,
            paymentMethod: paymentMethod || 'cod',
            paymentStatus: 'pending',
            orderStatus: 'placed'
        });

        await order.save();

        const whatsappMsg = buildOrderMessage(order);
        const whatsappLink = getWhatsAppLink(whatsappMsg);

        order.whatsappSent = true;
        await order.save();

        res.status(201).json({
            success: true,
            data: {
                orderId: order.orderId,
                subtotal: order.subtotal,
                whatsappLink,
                message: 'Order placed successfully!'
            }
        });
    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/:id/payment-proof', upload.single('proof'), async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (req.file) {
            order.paymentProof = req.file.path;
        } else if (req.body.base64) {
            const result = await uploadBase64(req.body.base64, 'vastra/payments');
            if (result.success) {
                order.paymentProof = result.url;
            }
        }

        order.paymentStatus = 'pending';
        await order.save();

        const whatsappMsg = `💳 *Payment Proof Uploaded*\n\nOrder ID: ${order.orderId}\nAmount: ₹${order.subtotal}\n\nPayment proof has been uploaded. Please verify.`;
        const whatsappLink = getWhatsAppLink(whatsappMsg);

        res.json({ success: true, data: { paymentProof: order.paymentProof, whatsappLink } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = {};
        if (status) query.orderStatus = status;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.json({ success: true, data: orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/stats', auth, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$subtotal' } } }]);
        const pendingOrders = await Order.countDocuments({ orderStatus: 'placed' });
        const todayOrders = await Order.countDocuments({
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        res.json({
            success: true,
            data: {
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                pendingOrders,
                todayOrders
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id }) || await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id/status', auth, async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        const update = {};
        if (orderStatus) update.orderStatus = orderStatus;
        if (paymentStatus) update.paymentStatus = paymentStatus;

        const order = await Order.findOneAndUpdate(
            { $or: [{ orderId: req.params.id }, { _id: req.params.id }] },
            update,
            { new: true }
        );
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
