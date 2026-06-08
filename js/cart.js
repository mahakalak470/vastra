let cart = JSON.parse(localStorage.getItem('vastra_cart') || '[]');

function getCart() {
    return cart;
}

function saveCart() {
    localStorage.setItem('vastra_cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
}

function addToCart(productId, size) {
    const product = getProductById(productId);
    if (!product) return;
    const selectedSize = size || product.sizes[2];
    const pid = String(productId);
    const existingIndex = cart.findIndex(item => String(item.id) === pid && item.size === selectedSize);
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            id: pid,
            productId: product._id || product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: selectedSize,
            qty: 1
        });
    }
    saveCart();
    showToast('Added to cart!', 'success');
}

function removeFromCart(productId, size) {
    cart = cart.filter(item => !(String(item.id) === String(productId) && item.size === size));
    saveCart();
}

function updateCartQty(productId, size, delta) {
    const item = cart.find(i => String(i.id) === String(productId) && i.size === size);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(productId, size);
        return;
    }
    saveCart();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function renderCartItems() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartEmptyEl = document.getElementById('cartEmpty');
    const cartFooterEl = document.getElementById('cartFooter');
    const cartTotalEl = document.getElementById('cartTotal');

    if (!cartItemsEl) return;

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '';
        cartEmptyEl.style.display = 'flex';
        cartFooterEl.style.display = 'none';
        return;
    }

    cartEmptyEl.style.display = 'none';
    cartFooterEl.style.display = 'block';

    cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-img" onclick="openZoom('${item.image}')">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22><rect fill=%22%23111%22 width=%2280%22 height=%2280%22/></svg>'">
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-size">Size: ${item.size}</div>
                <div class="cart-item-price">&#8377;${item.price * item.qty}</div>
                <div class="cart-item-actions">
                    <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', '${item.size}', -1)">-</button>
                    <span class="cart-qty-num">${item.qty}</span>
                    <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', '${item.size}', 1)">+</button>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}', '${item.size}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');

    if (cartTotalEl) cartTotalEl.textContent = '₹' + getCartTotal();
}

function openCheckout() {
    if (cart.length === 0) {
        showToast('Cart is empty!', 'error');
        return;
    }
    closeCart();
    openModal('checkoutModal');
    renderCheckoutSummary();
}

function renderCheckoutSummary() {
    const el = document.getElementById('checkoutSummary');
    if (!el) return;
    el.innerHTML = cart.map(item => `
        <div class="checkout-summary-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><rect fill=%22%23111%22 width=%2250%22 height=%2250%22/></svg>'">
            <div>
                <span class="checkout-item-name">${item.name}</span>
                <span class="checkout-item-detail">${item.size} × ${item.qty} = ₹${item.price * item.qty}</span>
            </div>
        </div>
    `).join('');
    document.getElementById('checkoutTotal').textContent = '₹' + getCartTotal();
}

function goToStep(step) {
    document.querySelectorAll('.checkout-step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.checkout-step-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('checkoutStep' + step).classList.add('active');
    const btn = document.querySelector(`.checkout-step-btn[data-step="${step}"]`);
    if (btn) btn.classList.add('active');
}

async function placeOrder() {
    const name = document.getElementById('coName').value.trim();
    const phone = document.getElementById('coPhone').value.trim();
    const email = document.getElementById('coEmail').value.trim();
    const address = document.getElementById('coAddress').value.trim();
    const address2 = document.getElementById('coAddress2').value.trim();
    const city = document.getElementById('coCity').value.trim();
    const state = document.getElementById('coState').value.trim();
    const pincode = document.getElementById('coPincode').value.trim();

    if (!name || !phone || !address || !city || !state || !pincode) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    if (!/^\d{10}$/.test(phone)) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return;
    }

    if (!/^\d{6}$/.test(pincode)) {
        showToast('Please enter a valid 6-digit pincode', 'error');
        return;
    }

    const orderBtn = document.getElementById('placeOrderBtn');
    orderBtn.disabled = true;
    orderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';

    try {
        const res = await fetch(API_URL + '/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart.map(item => ({
                    productId: item.productId || item.id,
                    size: item.size,
                    qty: item.qty
                })),
                customer: { name, phone, email, address, address2, city, state, pincode },
                paymentMethod: 'upi'
            })
        });

        const data = await res.json();

        if (data.success) {
            document.getElementById('orderIdDisplay').textContent = data.data.orderId;
            document.getElementById('orderTotalDisplay').textContent = '₹' + getCartTotal();
            goToStep(3);
            cart = [];
            saveCart();
        } else {
            showToast(data.message || 'Order failed. Try again.', 'error');
        }
    } catch (err) {
        const orderId = 'VST-' + Date.now().toString(36).toUpperCase();
        document.getElementById('orderIdDisplay').textContent = orderId;
        document.getElementById('orderTotalDisplay').textContent = '₹' + getCartTotal();
        goToStep(3);

        let message = `Hello Vastra Team, I've placed an order:\n\nOrder ID: ${orderId}\n\n`;
        cart.forEach(item => {
            message += `${item.qty}x ${item.name} (Size: ${item.size}) - ₹${item.price * item.qty}\n`;
        });
        message += `\nTotal: ₹${getCartTotal()}\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}, ${city}, ${state} - ${pincode}\n\nI will send payment proof shortly.`;
        const url = `https://wa.me/918168540355?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');

        cart = [];
        saveCart();
    }

    orderBtn.disabled = false;
    orderBtn.innerHTML = '<i class="fas fa-check"></i> Place Order';
}

function sendProofWhatsApp() {
    const orderId = document.getElementById('orderIdDisplay').textContent;
    const total = document.getElementById('orderTotalDisplay').textContent;
    const message = `Hello Vastra Team,\n\nI've completed payment for my order:\n\nOrder ID: ${orderId}\nAmount: ${total}\n\nI'm sending the payment screenshot as proof. Please confirm my order.`;
    const url = `https://wa.me/918168540355?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    showToast('Redirected to WhatsApp for payment proof!', 'success');
}

function checkoutWhatsApp() {
    openCheckout();
}

function openCart() {
    document.getElementById('cartSidebar').classList.add('active');
    document.getElementById('cartOverlay').classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('cartOverlay').classList.remove('active');
    document.body.classList.remove('no-scroll');
}

let wishlist = JSON.parse(localStorage.getItem('vastra_wishlist') || '[]');

function isProductWishlisted(productId) {
    return wishlist.includes(String(productId));
}

function toggleWishlist(productId, event) {
    if (event) event.stopPropagation();
    productId = String(productId);
    if (isProductWishlisted(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
        showToast('Removed from wishlist', 'info');
    } else {
        wishlist.push(productId);
        showToast('Added to wishlist!', 'success');
    }
    localStorage.setItem('vastra_wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    renderWishlistItems();
    renderProducts(currentFilter);
}

function updateWishlistCount() {
    document.querySelectorAll('#wishlistCount').forEach(el => el.textContent = wishlist.length);
}

function renderWishlistItems() {
    const wishlistItemsEl = document.getElementById('wishlistItems');
    const wishlistEmptyEl = document.getElementById('wishlistEmpty');
    if (!wishlistItemsEl) return;

    if (wishlist.length === 0) {
        wishlistItemsEl.innerHTML = '';
        wishlistEmptyEl.style.display = 'flex';
        return;
    }

    wishlistEmptyEl.style.display = 'none';
    const products = wishlist.map(id => getProductById(id)).filter(Boolean);
    wishlistItemsEl.innerHTML = products.map(p => `
        <div class="cart-item">
            <div class="cart-item-img" onclick="openQuickView('${getProductId(p)}')">
                <img src="${p.image}" alt="${p.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22><rect fill=%22%23111%22 width=%2280%22 height=%2280%22/></svg>'">
            </div>
            <div class="cart-item-info">
                <h4>${p.name}</h4>
                <div class="cart-item-price">&#8377;${p.price}</div>
                <div class="cart-item-actions">
                    <button class="product-add-cart" style="padding:0.4rem 0.8rem;font-size:0.75rem;" onclick="addToCart('${getProductId(p)}')">Add to Cart</button>
                    <button class="cart-item-remove" onclick="toggleWishlist('${getProductId(p)}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

function openWishlist() {
    document.getElementById('wishlistSidebar').classList.add('active');
    document.getElementById('wishlistOverlay').classList.add('active');
    document.body.classList.add('no-scroll');
    renderWishlistItems();
}

function closeWishlist() {
    document.getElementById('wishlistSidebar').classList.remove('active');
    document.getElementById('wishlistOverlay').classList.remove('active');
    document.body.classList.remove('no-scroll');
}
