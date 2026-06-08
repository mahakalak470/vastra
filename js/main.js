function initPreloader() {
    const preloader = document.getElementById('preloader');
    const barFill = document.querySelector('.preloader-bar-fill');
    if (!preloader) return;
    let progress = 0;
    const interval = setInterval(function () {
        progress += Math.random() * 30;
        if (progress >= 100) progress = 100;
        if (barFill) barFill.style.width = progress + '%';
        if (progress === 100) {
            clearInterval(interval);
            setTimeout(function () {
                preloader.classList.add('loaded');
                document.body.classList.remove('no-scroll');
            }, 400);
        }
    }, 150);
}

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    hamburger.addEventListener('click', function () {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });

    document.addEventListener('click', function (e) {
        if (navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) &&
            !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            const navHeight = document.getElementById('navbar').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', function () {
        if (window.scrollY > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    window.addEventListener('scroll', function () {
        let current = '';
        sections.forEach(function (section) {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }, { passive: true });
}

document.addEventListener('DOMContentLoaded', async function () {
    document.body.classList.add('no-scroll');
    try { initPreloader(); } catch(e) { console.error('initPreloader error:', e); }
    try { initNavbar(); } catch(e) { console.error('initNavbar error:', e); }
    try { initSmoothScroll(); } catch(e) { console.error('initSmoothScroll error:', e); }
    try { initBackToTop(); } catch(e) { console.error('initBackToTop error:', e); }
    try { initActiveNavLinks(); } catch(e) { console.error('initActiveNavLinks error:', e); }
    try { initProductFilters(); } catch(e) { console.error('initProductFilters error:', e); }
    try { initSearch(); } catch(e) { console.error('initSearch error:', e); }
    try { initUI(); } catch(e) { console.error('initUI error:', e); }
    try { initForms(); } catch(e) { console.error('initForms error:', e); }
    try { initAnimations(); } catch(e) { console.error('initAnimations error:', e); }
    try { await fetchProducts(); } catch(e) { console.error('fetchProducts error:', e); PRODUCTS = typeof FALLBACK_PRODUCTS !== 'undefined' ? FALLBACK_PRODUCTS : []; }
    try { renderProducts('all'); } catch(e) { console.error('renderProducts error:', e); }
});
