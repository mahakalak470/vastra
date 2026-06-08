const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
    heroImage: { type: String, default: '' },
    aboutImage: { type: String, default: '' },
    founderImage: { type: String, default: '' },
    founderName: { type: String, default: 'Jatin' },
    founderBio: { type: String, default: '' },
    instagramImages: [{ type: String }],
    galleryImages: [{ type: String }],
    qrCodeImage: { type: String, default: '' },
    upiId: { type: String, default: '' },
    whatsappNumber: { type: String, default: '918168540355' },
    siteTitle: { type: String, default: 'VASTRA' },
    siteTagline: { type: String, default: 'Wear Your Identity' }
}, { timestamps: true });

siteConfigSchema.statics.getConfig = async function() {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
