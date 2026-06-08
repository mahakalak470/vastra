const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    size: String,
    qty: Number,
    image: String
});

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, default: '' },
        address: { type: String, required: true },
        address2: { type: String, default: '' },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    subtotal: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['upi', 'cod'], default: 'cod' },
    paymentProof: { type: String, default: '' },
    paymentStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    orderStatus: { type: String, enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'placed' },
    whatsappSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
