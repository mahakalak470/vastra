const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '918168540355';

function buildOrderMessage(order) {
    let msg = `🛒 *New VASTRA Order*\n\n`;
    msg += `📋 Order ID: ${order.orderId}\n\n`;
    msg += `*Items:*\n`;
    order.items.forEach(item => {
        msg += `  • ${item.qty}x ${item.name} (${item.size}) — ₹${item.price * item.qty}\n`;
    });
    msg += `\n💰 *Total: ₹${order.subtotal}*\n\n`;
    msg += `*Customer Details:*\n`;
    msg += `  Name: ${order.customer.name}\n`;
    msg += `  Phone: ${order.customer.phone}\n`;
    if (order.customer.email) msg += `  Email: ${order.customer.email}\n`;
    msg += `  Address: ${order.customer.address}\n`;
    if (order.customer.address2) msg += `  ${order.customer.address2}\n`;
    msg += `  City: ${order.customer.city}, State: ${order.customer.state}\n`;
    msg += `  Pincode: ${order.customer.pincode}\n\n`;
    msg += `💳 Payment: ${order.paymentMethod === 'upi' ? 'UPI (Proof uploaded)' : 'Cash on Delivery'}\n`;
    if (order.paymentProof) msg += `  Payment proof uploaded ✓\n`;
    return msg;
}

function buildDesignMessage(designPrompt, size, imageUrl) {
    let msg = `🎨 *Custom Design Request*\n\n`;
    msg += `Design: ${designPrompt}\n`;
    if (size) msg += `Size: ${size}\n`;
    if (imageUrl) msg += `Design Image: ${imageUrl}\n`;
    msg += `\nPlease confirm and process this order.`;
    return msg;
}

function getWhatsAppLink(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

module.exports = { buildOrderMessage, buildDesignMessage, getWhatsAppLink, WHATSAPP_NUMBER };
