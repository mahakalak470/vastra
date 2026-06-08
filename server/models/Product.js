const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    collection: { type: String, required: true, enum: ['mythology', 'anime', 'streetwear', 'oversized'] },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    image: { type: String, default: '' },
    badge: { type: String, enum: ['bestseller', 'limited', 'new', null], default: null },
    sizes: [{ type: String }],
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    desc: { type: String, default: '' },
    active: { type: Boolean, default: true }
}, { timestamps: true, suppressReservedKeysWarning: true });

module.exports = mongoose.model('Product', productSchema);
