const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api';

let PRODUCTS = [];
let PRODUCTS_LOADED = false;

const FALLBACK_PRODUCTS = [
    { _id: '1', name: "Shiva The Destroyer Tee", collection: "mythology", price: 899, originalPrice: 1299, image: "assets/images/products/1.jpg", badge: "bestseller", sizes: ["S", "M", "L", "XL", "XXL"], rating: 4.8, reviews: 124, desc: "Premium oversized tee featuring a bold Lord Shiva design. 240 GSM heavyweight cotton with DTF print." },
    { _id: '2', name: "Hanuman Power Oversized Tee", collection: "mythology", price: 949, originalPrice: 1399, image: "assets/images/products/2.jpg", badge: "bestseller", sizes: ["S", "M", "L", "XL", "XXL"], rating: 4.9, reviews: 98, desc: "Premium oversized tee with Hanuman Ji graphic. High-quality DTF printing on 240 GSM cotton." },
    { _id: '3', name: "Naruto Sage Mode Tee", collection: "anime", price: 799, originalPrice: 1199, image: "assets/images/products/3.jpg", badge: "new", sizes: ["S", "M", "L", "XL", "XXL"], rating: 4.7, reviews: 76, desc: "Oversized anime tee with Naruto Sage Mode design. Premium DTF print on heavyweight cotton." },
    { _id: '4', name: "Goku Ultra Instinct Tee", collection: "anime", price: 849, originalPrice: 1249, image: "assets/images/products/4.jpg", badge: null, sizes: ["S", "M", "L", "XL", "XXL"], rating: 4.6, reviews: 63, desc: "Dragon Ball Z inspired oversized tee with Goku Ultra Instinct design." },
    { _id: '5', name: "Urban Streets Oversized Tee", collection: "streetwear", price: 699, originalPrice: 999, image: "assets/images/products/5.jpg", badge: null, sizes: ["S", "M", "L", "XL", "XXL"], rating: 4.5, reviews: 89, desc: "Clean urban streetwear design on premium oversized tee. 240 GSM cotton." },
    { _id: '6', name: "Dark Culture Street Tee", collection: "streetwear", price: 749, originalPrice: 1099, image: "assets/images/products/6.jpg", badge: "new", sizes: ["S", "M", "L", "XL", "XXL"], rating: 4.7, reviews: 45, desc: "Dark streetwear aesthetic with premium graphic. Oversized fit for maximum comfort." },
    { _id: '7', name: "Classic Oversized Black Tee", collection: "oversized", price: 599, originalPrice: 899, image: "assets/images/products/7.jpg", badge: "bestseller", sizes: ["S", "M", "L", "XL", "XXL"], rating: 4.8, reviews: 156, desc: "The essential oversized black tee. Premium 240 GSM cotton, perfect oversized drape." },
    { _id: '8', name: "Minimal Oversized White Tee", collection: "oversized", price: 599, originalPrice: 899, image: "assets/images/products/8.jpg", badge: null, sizes: ["S", "M", "L", "XL", "XXL"], rating: 4.6, reviews: 112, desc: "Clean minimal oversized white tee. Premium heavyweight cotton for all-day comfort." },
    { _id: '9', name: "Kali Ma Divine Tee", collection: "mythology", price: 999, originalPrice: 1499, image: "assets/images/products/9.jpg", badge: "limited", sizes: ["S", "M", "L", "XL"], rating: 5.0, reviews: 34, desc: "Limited edition Kali Ma design. Premium DTF print on oversized 240 GSM cotton." },
    { _id: '10', name: "One Piece Luffy Gear 5 Tee", collection: "anime", price: 899, originalPrice: 1299, image: "assets/images/products/10.jpg", badge: "limited", sizes: ["M", "L", "XL", "XXL"], rating: 4.9, reviews: 67, desc: "Limited edition Luffy Gear 5 design. Premium oversized tee with vibrant DTF print." },
    { _id: '11', name: "Graffiti King Street Tee", collection: "streetwear", price: 799, originalPrice: 1199, image: "assets/images/products/11.jpg", badge: "new", sizes: ["S", "M", "L", "XL", "XXL"], rating: 4.5, reviews: 38, desc: "Bold graffiti streetwear design. Premium oversized fit with DTF printing." },
    { _id: '12', name: "Washed Oversized Grey Tee", collection: "oversized", price: 699, originalPrice: 999, image: "assets/images/products/12.jpg", badge: null, sizes: ["S", "M", "L", "XL", "XXL"], rating: 4.7, reviews: 91, desc: "Washed grey oversized tee with premium feel. 240 GSM heavyweight cotton." }
];

async function fetchProducts() {
    try {
        const res = await fetch(API_URL + '/products');
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
            PRODUCTS = data.data;
            PRODUCTS_LOADED = true;
        } else {
            PRODUCTS = FALLBACK_PRODUCTS;
        }
    } catch (err) {
        console.log('Using fallback products (API unavailable)');
        PRODUCTS = FALLBACK_PRODUCTS;
    }
}

let currentFilter = 'all';
let currentSort = 'default';

function getProducts() {
    return PRODUCTS;
}

function getProductById(id) {
    return PRODUCTS.find(p => (p._id || p.id) === String(id) || p.id === parseInt(id));
}

function filterProducts(filter) {
    currentFilter = filter;
    let filtered = filter === 'all' ? [...PRODUCTS] : PRODUCTS.filter(p => p.collection === filter);
    return sortProducts(filtered, currentSort);
}

function sortProducts(products, sort) {
    currentSort = sort;
    let sorted = [...products];
    switch (sort) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            sorted.sort((a, b) => (b.createdAt || b.id || 0) > (a.createdAt || a.id || 0) ? 1 : -1);
            break;
        default:
            break;
    }
    return sorted;
}

function searchProducts(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
    );
}

function getDiscount(price, originalPrice) {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function renderStars(rating) {
    let stars = '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
    if (half) stars += '<i class="fas fa-star-half-alt"></i>';
    const empty = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < empty; i++) stars += '<i class="far fa-star"></i>';
    return stars;
}

function getProductId(p) {
    return p._id || p.id;
}

function renderProductCard(product) {
    const pid = getProductId(product);
    const discount = getDiscount(product.price, product.originalPrice);
    const isWishlisted = isProductWishlisted(pid);
    let badgeHTML = '';
    if (product.badge === 'bestseller') badgeHTML = '<span class="product-badge bestseller">Best Seller</span>';
    else if (product.badge === 'limited') badgeHTML = '<span class="product-badge limited">Limited</span>';
    else if (product.badge === 'new') badgeHTML = '<span class="product-badge new">New</span>';

    return `
    <div class="product-card" data-id="${pid}" data-collection="${product.collection}">
        <div class="product-card-img" onclick="openQuickView('${pid}')">
            <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22><rect fill=%22%23111%22 width=%22400%22 height=%22400%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22%23333%22 font-size=%2216%22 text-anchor=%22middle%22 dy=%22.3em%22>VASTRA</text></svg>'">
            ${badgeHTML}
            <div class="product-actions">
                <button class="product-action-btn ${isWishlisted ? 'wishlisted' : ''}" onclick="toggleWishlist('${pid}', event)" title="Wishlist">
                    <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <button class="product-action-btn" onclick="openQuickView('${pid}')" title="Quick View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="product-action-btn" onclick="openZoom('${product.image}')" title="Zoom">
                    <i class="fas fa-search-plus"></i>
                </button>
            </div>
        </div>
        <div class="product-card-info">
            <div class="product-card-collection">${product.collection}</div>
            <h3 class="product-card-name">${product.name}</h3>
            <div class="product-card-rating">
                ${renderStars(product.rating)}
                <span>(${product.reviews})</span>
            </div>
            <div class="product-card-price">
                <span class="price-current">&#8377;${product.price}</span>
                <span class="price-original">&#8377;${product.originalPrice}</span>
                <span class="price-discount">${discount}% OFF</span>
            </div>
            <button class="product-add-cart" onclick="addToCart('${pid}')">Add to Cart</button>
        </div>
    </div>
    `;
}

function renderProducts(filter) {
    const products = filterProducts(filter || currentFilter);
    const grid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');
    if (products.length === 0) {
        grid.innerHTML = '';
        noProducts.style.display = 'block';
    } else {
        noProducts.style.display = 'none';
        grid.innerHTML = products.map(p => renderProductCard(p)).join('');
    }
}

function filterFromCollection(collection) {
    currentFilter = collection;
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === collection);
    });
    renderProducts(collection);
}

function initProductFilters() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderProducts(currentFilter);
        });
    });

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            currentSort = this.value;
            renderProducts(currentFilter);
        });
    }
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
        const query = this.value;
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        const results = searchProducts(query);
        if (results.length === 0) {
            searchResults.innerHTML = '<p style="color:var(--text-muted);padding:1rem;">No products found</p>';
        } else {
            searchResults.innerHTML = results.slice(0, 6).map(p => `
                <div class="search-result-item" onclick="searchSelectProduct('${getProductId(p)}')">
                    <img src="${p.image}" alt="${p.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><rect fill=%22%23111%22 width=%2250%22 height=%2250%22/></svg>'">
                    <div class="search-result-info">
                        <h4>${p.name}</h4>
                        <span>&#8377;${p.price}</span>
                    </div>
                </div>
            `).join('');
        }
    });
}

function searchSelectProduct(id) {
    closeSearch();
    openQuickView(id);
}

function addToRecentlyViewed(productId) {
    let recentlyViewed = JSON.parse(localStorage.getItem('vastra_recently_viewed') || '[]');
    recentlyViewed = recentlyViewed.filter(id => id !== String(productId));
    recentlyViewed.unshift(String(productId));
    recentlyViewed = recentlyViewed.slice(0, 10);
    localStorage.setItem('vastra_recently_viewed', JSON.stringify(recentlyViewed));
    renderRecentlyViewed();
}

function renderRecentlyViewed() {
    const section = document.getElementById('recentlyViewed');
    const grid = document.getElementById('recentlyViewedGrid');
    if (!section || !grid) return;
    const recentlyViewed = JSON.parse(localStorage.getItem('vastra_recently_viewed') || '[]');
    if (recentlyViewed.length === 0) {
        section.style.display = 'none';
        return;
    }
    section.style.display = 'block';
    const products = recentlyViewed.map(id => getProductById(id)).filter(Boolean);
    grid.innerHTML = products.map(p => `
        <div class="recently-viewed-card" onclick="openQuickView('${getProductId(p)}')">
            <div class="recently-viewed-card-img">
                <img src="${p.image}" alt="${p.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22220%22 height=%22200%22><rect fill=%22%23111%22 width=%22220%22 height=%22200%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22%23333%22 font-size=%2214%22 text-anchor=%22middle%22 dy=%22.3em%22>VASTRA</text></svg>'">
            </div>
            <div class="recently-viewed-card-info">
                <h4>${p.name}</h4>
                <span>&#8377;${p.price}</span>
            </div>
        </div>
    `).join('');
}
