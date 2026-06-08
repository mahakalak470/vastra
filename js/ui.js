function showToast(message, type) {
    type = type || 'info';
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    toast.innerHTML = '<i class="' + icon + '"></i><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(function () {
        toast.classList.add('removing');
        setTimeout(function () {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

function openSizeGuide() {
    openModal('sizeGuideModal');
}

function openQuickView(productId) {
    const product = getProductById(productId);
    if (!product) return;
    addToRecentlyViewed(productId);
    const pid = getProductId(product);
    const content = document.getElementById('quickViewContent');
    const discount = getDiscount(product.price, product.originalPrice);
    content.innerHTML = `
        <div class="quick-view-image" onclick="openZoom('${product.image}')">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22><rect fill=%22%23111%22 width=%22400%22 height=%22400%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22%23333%22 font-size=%2216%22 text-anchor=%22middle%22 dy=%22.3em%22>VASTRA</text></svg>'">
        </div>
        <div class="quick-view-details">
            <span class="qv-collection">${product.collection}</span>
            <h2 class="qv-name">${product.name}</h2>
            <div class="qv-rating">
                ${renderStars(product.rating)}
                <span>${product.rating} (${product.reviews} reviews)</span>
            </div>
            <div class="qv-price">
                <span class="price-current">&#8377;${product.price}</span>
                <span class="price-original">&#8377;${product.originalPrice}</span>
                <span style="color:#00c853;font-weight:600;font-size:0.85rem;">${discount}% OFF</span>
            </div>
            <p class="qv-desc">${product.desc}</p>
            <div class="qv-size-section">
                <label>Select Size</label>
                <div class="qv-sizes" id="qvSizes">
                    ${product.sizes.map((s, i) => '<button class="qv-size-btn' + (i === 2 ? ' active' : '') + '" data-size="' + s + '" onclick="selectQVSize(this)">' + s + '</button>').join('')}
                </div>
                <span class="qv-size-guide-link" onclick="closeModal('quickViewModal');openSizeGuide();">View Size Guide</span>
            </div>
            <div class="qv-actions">
                <button class="btn btn-gold" onclick="addToCartFromQV('${pid}')"><i class="fas fa-shopping-bag"></i> Add to Cart</button>
                <button class="btn btn-outline-gold" onclick="toggleWishlist('${pid}')"><i class="${isProductWishlisted(pid) ? 'fas' : 'far'} fa-heart"></i></button>
            </div>
        </div>
    `;
    openModal('quickViewModal');
}

function selectQVSize(btn) {
    document.querySelectorAll('.qv-size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function addToCartFromQV(productId) {
    const activeSize = document.querySelector('.qv-size-btn.active');
    const size = activeSize ? activeSize.dataset.size : null;
    addToCart(String(productId), size);
    closeModal('quickViewModal');
}

function openZoom(imageSrc) {
    const zoomImg = document.getElementById('zoomImage');
    if (!zoomImg) return;
    zoomImg.src = imageSrc;
    openModal('zoomModal');
}

function closeSearch() {
    document.getElementById('searchOverlay').classList.remove('active');
    document.body.classList.remove('no-scroll');
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

function initModals() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function () {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
            closeSearch();
            closeCart();
            closeWishlist();
            document.body.classList.remove('no-scroll');
        }
    });
}

function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', function () {
            const item = this.closest('.faq-item');
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}

function initCountdown() {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    function update() {
        const now = new Date();
        const diff = endDate - now;
        if (diff <= 0) return;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        document.getElementById('countDays').textContent = String(days).padStart(2, '0');
        document.getElementById('countHours').textContent = String(hours).padStart(2, '0');
        document.getElementById('countMins').textContent = String(mins).padStart(2, '0');
        document.getElementById('countSecs').textContent = String(secs).padStart(2, '0');
    }
    update();
    setInterval(update, 1000);
}

function initUI() {
    initModals();
    initFAQ();
    initCountdown();
    try { updateCartCount(); } catch(e) {}
    try { updateWishlistCount(); } catch(e) {}
    try { renderCartItems(); } catch(e) {}
    try { renderWishlistItems(); } catch(e) {}
    try { renderRecentlyViewed(); } catch(e) {}

    try {
        document.getElementById('cartToggle').addEventListener('click', openCart);
        document.getElementById('cartClose').addEventListener('click', closeCart);
        document.getElementById('cartOverlay').addEventListener('click', closeCart);
    } catch(e) {}

    try {
        var wishlistOverlay = document.getElementById('wishlistOverlay');
        if (wishlistOverlay) wishlistOverlay.addEventListener('click', closeWishlist);
        document.getElementById('wishlistToggle').addEventListener('click', openWishlist);
        document.getElementById('wishlistClose').addEventListener('click', closeWishlist);
    } catch(e) {}

    try {
        document.getElementById('searchToggle').addEventListener('click', function () {
            document.getElementById('searchOverlay').classList.add('active');
            document.body.classList.add('no-scroll');
            setTimeout(function() { document.getElementById('searchInput').focus(); }, 100);
        });
        document.getElementById('searchClose').addEventListener('click', closeSearch);
    } catch(e) {}

    try {
        document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
    } catch(e) { try { document.getElementById('checkoutBtn').addEventListener('click', checkoutWhatsApp); } catch(e2) {} }

    try {
        document.getElementById('openSizeGuide').addEventListener('click', openSizeGuide);
        var footerSizeGuide = document.getElementById('footerSizeGuide');
        if (footerSizeGuide) footerSizeGuide.addEventListener('click', function (e) {
            e.preventDefault();
            openSizeGuide();
        });
    } catch(e) {}
}
