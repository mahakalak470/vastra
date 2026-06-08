function initForms() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject') || 'General Inquiry';
            const message = formData.get('message');
            const waMessage = `Hello Vastra Team,\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`;
            const url = `https://wa.me/918168540355?text=${encodeURIComponent(waMessage)}`;
            window.open(url, '_blank');
            showToast('Message sent via WhatsApp!', 'success');
            this.reset();
        });
    }

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            let subscribers = JSON.parse(localStorage.getItem('vastra_newsletter') || '[]');
            if (subscribers.includes(email)) {
                showToast('Already subscribed!', 'info');
                return;
            }
            subscribers.push(email);
            localStorage.setItem('vastra_newsletter', JSON.stringify(subscribers));
            showToast('Welcome to VASTRA family!', 'success');
            this.reset();
        });
    }
}

let lastAIDesignUrl = '';

async function generateAIDesign() {
    const prompt = document.getElementById('aiPrompt').value.trim();
    const style = document.getElementById('aiStyle').value;

    if (!prompt || prompt.length < 3) {
        showToast('Please describe your design idea (at least 3 characters)', 'error');
        return;
    }

    const generateBtn = document.getElementById('aiGenerateBtn');
    const loadingEl = document.getElementById('aiLoading');
    const resultEl = document.getElementById('aiResult');

    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    loadingEl.style.display = 'block';
    resultEl.style.display = 'none';

    try {
        const res = await fetch(API_URL + '/designs/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, style, sessionId: sessionId() })
        });

        const data = await res.json();

        if (data.success && data.data && data.data.imageUrl) {
            lastAIDesignUrl = data.data.imageUrl;
            document.getElementById('aiResultImage').src = data.data.imageUrl;
            resultEl.style.display = 'block';
            showToast('Design generated!', 'success');
        } else {
            showToast(data.message || 'Generation failed. Try WhatsApp instead.', 'error');
        }
    } catch (err) {
        showToast('AI service unavailable. Contact us on WhatsApp for custom designs.', 'info');
        const waMsg = `Hello Vastra Team,\n\nI want a custom t-shirt design!\n\nMy idea: ${prompt}\nStyle: ${style}\n\nPlease create this for me.`;
        window.open(`https://wa.me/918168540355?text=${encodeURIComponent(waMsg)}`, '_blank');
    }

    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Design';
    loadingEl.style.display = 'none';
}

function orderAIDesign() {
    const prompt = document.getElementById('aiPrompt').value.trim();
    const msg = `Hello Vastra Team,\n\nI want to order a custom AI-designed t-shirt!\n\nDesign Description: ${prompt}\n${lastAIDesignUrl ? 'Design Image: ' + lastAIDesignUrl : ''}\n\nPlease share size and pricing details.`;
    window.open(`https://wa.me/918168540355?text=${encodeURIComponent(msg)}`, '_blank');
}

function sessionId() {
    let sid = localStorage.getItem('vastra_session_id');
    if (!sid) {
        sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        localStorage.setItem('vastra_session_id', sid);
    }
    return sid;
}
