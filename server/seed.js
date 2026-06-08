require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Collection = require('./models/Collection');
const SiteConfig = require('./models/SiteConfig');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

const products = [
    {
        name: "Shiva The Destroyer Tee",
        collection: "mythology",
        price: 899,
        originalPrice: 1299,
        image: "assets/images/products/1.jpg",
        badge: "bestseller",
        sizes: ["S", "M", "L", "XL", "XXL"],
        rating: 4.8,
        reviews: 124,
        desc: "Premium oversized tee featuring a bold Lord Shiva design. 240 GSM heavyweight cotton with DTF print."
    },
    {
        name: "Hanuman Power Oversized Tee",
        collection: "mythology",
        price: 949,
        originalPrice: 1399,
        image: "assets/images/products/2.jpg",
        badge: "bestseller",
        sizes: ["S", "M", "L", "XL", "XXL"],
        rating: 4.9,
        reviews: 98,
        desc: "Premium oversized tee with Hanuman Ji graphic. High-quality DTF printing on 240 GSM cotton."
    },
    {
        name: "Naruto Sage Mode Tee",
        collection: "anime",
        price: 799,
        originalPrice: 1199,
        image: "assets/images/products/3.jpg",
        badge: "new",
        sizes: ["S", "M", "L", "XL", "XXL"],
        rating: 4.7,
        reviews: 76,
        desc: "Oversized anime tee with Naruto Sage Mode design. Premium DTF print on heavyweight cotton."
    },
    {
        name: "Goku Ultra Instinct Tee",
        collection: "anime",
        price: 849,
        originalPrice: 1249,
        image: "assets/images/products/4.jpg",
        badge: null,
        sizes: ["S", "M", "L", "XL", "XXL"],
        rating: 4.6,
        reviews: 63,
        desc: "Dragon Ball Z inspired oversized tee with Goku Ultra Instinct design."
    },
    {
        name: "Urban Streets Oversized Tee",
        collection: "streetwear",
        price: 699,
        originalPrice: 999,
        image: "assets/images/products/5.jpg",
        badge: null,
        sizes: ["S", "M", "L", "XL", "XXL"],
        rating: 4.5,
        reviews: 89,
        desc: "Clean urban streetwear design on premium oversized tee. 240 GSM cotton."
    },
    {
        name: "Dark Culture Street Tee",
        collection: "streetwear",
        price: 749,
        originalPrice: 1099,
        image: "assets/images/products/6.jpg",
        badge: "new",
        sizes: ["S", "M", "L", "XL", "XXL"],
        rating: 4.7,
        reviews: 45,
        desc: "Dark streetwear aesthetic with premium graphic. Oversized fit for maximum comfort."
    },
    {
        name: "Classic Oversized Black Tee",
        collection: "oversized",
        price: 599,
        originalPrice: 899,
        image: "assets/images/products/7.jpg",
        badge: "bestseller",
        sizes: ["S", "M", "L", "XL", "XXL"],
        rating: 4.8,
        reviews: 156,
        desc: "The essential oversized black tee. Premium 240 GSM cotton, perfect oversized drape."
    },
    {
        name: "Minimal Oversized White Tee",
        collection: "oversized",
        price: 599,
        originalPrice: 899,
        image: "assets/images/products/8.jpg",
        badge: null,
        sizes: ["S", "M", "L", "XL", "XXL"],
        rating: 4.6,
        reviews: 112,
        desc: "Clean minimal oversized white tee. Premium heavyweight cotton for all-day comfort."
    },
    {
        name: "Kali Ma Divine Tee",
        collection: "mythology",
        price: 999,
        originalPrice: 1499,
        image: "assets/images/products/9.jpg",
        badge: "limited",
        sizes: ["S", "M", "L", "XL"],
        rating: 5.0,
        reviews: 34,
        desc: "Limited edition Kali Ma design. Premium DTF print on oversized 240 GSM cotton."
    },
    {
        name: "One Piece Luffy Gear 5 Tee",
        collection: "anime",
        price: 899,
        originalPrice: 1299,
        image: "assets/images/products/10.jpg",
        badge: "limited",
        sizes: ["M", "L", "XL", "XXL"],
        rating: 4.9,
        reviews: 67,
        desc: "Limited edition Luffy Gear 5 design. Premium oversized tee with vibrant DTF print."
    },
    {
        name: "Graffiti King Street Tee",
        collection: "streetwear",
        price: 799,
        originalPrice: 1199,
        image: "assets/images/products/11.jpg",
        badge: "new",
        sizes: ["S", "M", "L", "XL", "XXL"],
        rating: 4.5,
        reviews: 38,
        desc: "Bold graffiti streetwear design. Premium oversized fit with DTF printing."
    },
    {
        name: "Washed Oversized Grey Tee",
        collection: "oversized",
        price: 699,
        originalPrice: 999,
        image: "assets/images/products/12.jpg",
        badge: null,
        sizes: ["S", "M", "L", "XL", "XXL"],
        rating: 4.7,
        reviews: 91,
        desc: "Washed grey oversized tee with premium feel. 240 GSM heavyweight cotton."
    }
];

const collections = [
    { name: "Mythology", slug: "mythology", image: "assets/images/collections/mythology.jpg", tagline: "Divine designs rooted in ancient power", order: 1 },
    { name: "Anime", slug: "anime", image: "assets/images/collections/anime.jpg", tagline: "Wear your favourite anime icons", order: 2 },
    { name: "Streetwear", slug: "streetwear", image: "assets/images/collections/streetwear.jpg", tagline: "Urban culture meets bold graphics", order: 3 },
    { name: "Oversized", slug: "oversized", image: "assets/images/collections/oversized.jpg", tagline: "Premium essentials in oversized fit", order: 4 }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await Product.deleteMany({});
        await Collection.deleteMany({});
        await SiteConfig.deleteMany({});
        await Admin.deleteMany({});

        const createdProducts = await Product.insertMany(products);
        console.log(`Seeded ${createdProducts.length} products`);

        const createdCollections = await Collection.insertMany(collections);
        console.log(`Seeded ${createdCollections.length} collections`);

        await SiteConfig.create({
            founderName: 'Jatin',
            whatsappNumber: '918168540355',
            siteTitle: 'VASTRA',
            siteTagline: 'Wear Your Identity',
            upiId: 'jatinpepsu123@okhdfcbank'
        });
        console.log('Seeded site config');

        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'vastra@2025', 10);
        await Admin.create({
            username: process.env.ADMIN_USERNAME || 'admin',
            password: hashedPassword
        });
        console.log('Seeded admin user');

        console.log('\nSeed complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}

seed();
