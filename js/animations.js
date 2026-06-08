function initScrollAnimations() {
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                if (entry.target.classList.contains('timeline-item') ||
                    entry.target.classList.contains('tracking-step') ||
                    entry.target.classList.contains('insta-card')) {
                    entry.target.classList.add('revealed');
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .timeline-item, .tracking-step, .insta-card').forEach(function (el) {
        observer.observe(el);
    });
}

function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-num');
    if (counters.length === 0) return;
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-count'));
                if (!target) return;
                let current = 0;
                const increment = target / 60;
                const timer = setInterval(function () {
                    current += increment;
                    if (current >= target) {
                        el.textContent = target.toLocaleString();
                        clearInterval(timer);
                    } else {
                        el.textContent = Math.floor(current).toLocaleString();
                    }
                }, 30);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
        observer.observe(counter);
    });
}

function initParallax() {
    const heroImg = document.querySelector('.hero-bg-img');
    if (!heroImg) return;
    window.addEventListener('scroll', function () {
        const scrolled = window.pageYOffset;
        if (scrolled < window.innerHeight) {
            heroImg.style.transform = 'scale(' + (1.1 - scrolled * 0.0002) + ') translateY(' + (scrolled * 0.3) + 'px)';
        }
    }, { passive: true });
}

function initAnimations() {
    initScrollAnimations();
    initCounterAnimation();
    initParallax();
}
