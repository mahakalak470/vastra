const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
    prompt: { type: String, required: true },
    style: { type: String, default: 'custom' },
    imageUrl: { type: String, default: '' },
    publicId: { type: String, default: '' },
    sessionId: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Design', designSchema);
