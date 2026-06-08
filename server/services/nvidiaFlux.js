const axios = require('axios');

const NVIDIA_API_URL = 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev';

async function generateImage(prompt, style) {
    let fullPrompt = prompt;

    const stylePresets = {
        anime: 'anime style, vibrant colors, manga inspired, detailed illustration,',
        mythology: 'mythological art, divine aura, ornate details, ancient indian art style,',
        streetwear: 'streetwear graphic design, urban culture, bold typography, edgy,',
        minimal: 'minimalist design, clean lines, simple, modern,',
        custom: ''
    };

    if (style && stylePresets[style]) {
        fullPrompt = stylePresets[style] + ' ' + prompt;
    }

    fullPrompt += ', high quality, t-shirt design, centered composition, white or dark background for printing';

    try {
        const response = await axios({
            method: 'post',
            url: NVIDIA_API_URL,
            headers: {
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: {
                prompt: fullPrompt,
                mode: 'base',
                cfg_scale: 3.5,
                height: 1024,
                width: 1024,
                steps: 50,
                seed: Math.floor(Math.random() * 999999999)
            },
            timeout: 180000
        });

        if (response.data) {
            if (response.data.artifacts && response.data.artifacts[0] && response.data.artifacts[0].base64) {
                const b64 = response.data.artifacts[0].base64;
                const buffer = Buffer.from(b64, 'base64');
                const isJpeg = b64.startsWith('/9j/');
                return { success: true, imageBuffer: buffer, mimeType: isJpeg ? 'image/jpeg' : 'image/png' };
            }
            if (response.data.image) {
                const b64 = response.data.image;
                const buffer = Buffer.from(b64, 'base64');
                const isJpeg = b64.startsWith('/9j/');
                return { success: true, imageBuffer: buffer, mimeType: isJpeg ? 'image/jpeg' : 'image/png' };
            }
            if (response.data.b64_json) {
                const b64 = response.data.b64_json;
                const buffer = Buffer.from(b64, 'base64');
                const isJpeg = b64.startsWith('/9j/');
                return { success: true, imageBuffer: buffer, mimeType: isJpeg ? 'image/jpeg' : 'image/png' };
            }
            if (response.data.images && response.data.images[0]) {
                if (response.data.images[0].base64) {
                    const b64 = response.data.images[0].base64;
                    const buffer = Buffer.from(b64, 'base64');
                    const isJpeg = b64.startsWith('/9j/');
                    return { success: true, imageBuffer: buffer, mimeType: isJpeg ? 'image/jpeg' : 'image/png' };
                }
                if (response.data.images[0].url) {
                    return { success: true, imageUrl: response.data.images[0].url };
                }
            }
            if (response.data.data) {
                if (response.data.data.image) {
                    const b64 = response.data.data.image;
                    const buffer = Buffer.from(b64, 'base64');
                    const isJpeg = b64.startsWith('/9j/');
                    return { success: true, imageBuffer: buffer, mimeType: isJpeg ? 'image/jpeg' : 'image/png' };
                }
                if (response.data.data.url) return { success: true, imageUrl: response.data.data.url };
                if (Array.isArray(response.data.data) && response.data.data[0]) {
                    if (response.data.data[0].b64_json) {
                        const b64 = response.data.data[0].b64_json;
                        const buffer = Buffer.from(b64, 'base64');
                        const isJpeg = b64.startsWith('/9j/');
                        return { success: true, imageBuffer: buffer, mimeType: isJpeg ? 'image/jpeg' : 'image/png' };
                    }
                    if (response.data.data[0].url) return { success: true, imageUrl: response.data.data[0].url };
                }
            }
            if (response.data.url) {
                return { success: true, imageUrl: response.data.url };
            }
            if (response.data.output && response.data.output[0]) {
                return { success: true, imageUrl: response.data.output[0] };
            }

            console.log('NVIDIA API unexpected response keys:', Object.keys(response.data));
            console.log('Response preview:', JSON.stringify(response.data).substring(0, 300));

            return { success: true, rawData: response.data };
        }

        return { success: false, message: 'No image in response' };
    } catch (err) {
        console.error('NVIDIA FLUX API Error:', err.response?.status, err.response?.data || err.message);

        if (err.response?.status === 401) {
            return { success: false, message: 'API key invalid. Check NVIDIA API key.' };
        }
        if (err.response?.status === 429) {
            return { success: false, message: 'Rate limit exceeded. Please try again later.' };
        }

        return { success: false, message: err.response?.data?.message || err.response?.data?.error || err.message || 'AI generation failed' };
    }
}

module.exports = { generateImage };
