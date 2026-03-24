// ===============================
// Enactus FST Tanger — main.js
// ===============================

const PLACEHOLDER = 'images/placeholder.webp';
const GALLERY_PREVIEW = 7;

const defaultData = {
    header: {
        title: "Enactus FST Tanger",
        subtitle: "Entrepreneurial Action Paving the Way to a Better World"
    },
    about: {
        title: "Notre Mission",
        description: `<p>L'objectif d'Enactus FSTT est de former des étudiants leaders capables de créer un impact positif durable à travers l'entrepreneuriat social.</p>
        <p>Enactus est une communauté internationale d'étudiants, de leaders académiques et professionnels engagés pour créer un monde meilleur à travers l'action entrepreneuriale.</p>`,
        image: "images/about.jpg",
        stats: [
            { number: "50+",   label: "Membres Actifs" },
            { number: "11",    label: "Projets en Cours" },
            { number: "1000+", label: "Vies Impactées" }
        ]
    },
    team:    [],
    events:  [],
    gallery: [],
    contact: {
        email:   "enactusfsttanger@gmail.com",
        address: "Faculté des Sciences et Techniques de Tanger<br>BP 416, Tanger, Maroc",
        social: [
            { platform: "Instagram", url: "https://www.instagram.com/enactusfstt/",    icon: '<i class="fab fa-instagram"></i>' },
            { platform: "TikTok",    url: "https://www.tiktok.com/@enactusfsttanger/", icon: '<i class="fab fa-tiktok"></i>' }
        ]
    }
};

let siteData         = { ...defaultData };
let allGalleryImages = [];
let lightboxIndex    = 0;

// ===============================
// Load data.json
// ===============================
async function loadData() {
    try {
        const res = await fetch('data.json');
        if (!res.ok) throw new Error('data.json not found');
        const data = await res.json();
        siteData = {
            header:  data.header  || defaultData.header,
            about:   data.about   || defaultData.about,
            team:    data.team    || [],
            events:  data.events  || [],
            gallery: data.gallery || [],
            contact: data.contact || defaultData.contact
        };
    } catch (e) {
        console.warn('Using default data:', e.message);
    }
    initializeSite();
}

// ===============================
// Initialize
// ===============================
function initializeSite() {
    updateHeader();
    updateAbout();
    renderTeam();
    renderEvents();
    renderGallery();
    updateContact();
    setupNavigation();
    setupMobileMenu();
    setupScrollEffects();
    setupLightbox();
    setupScrollProgress();
    setupRevealAnimations();
    setupCounterAnimations();
}

// ===============================
// Header
// ===============================
function updateHeader() {
    const t = document.getElementById('header-title');
    const s = document.getElementById('header-subtitle');
    if (t && siteData.header?.title)    t.textContent = siteData.header.title;
    if (s && siteData.header?.subtitle) s.textContent = siteData.header.subtitle;
}

// ===============================
// About
// ===============================
function updateAbout() {
    const titleEl = document.getElementById('about-title');
    const descEl  = document.getElementById('about-description');
    const imgEl   = document.getElementById('about-img');

    if (titleEl && siteData.about?.title)       titleEl.textContent = siteData.about.title;
    if (descEl  && siteData.about?.description) descEl.innerHTML    = siteData.about.description;
    if (imgEl   && siteData.about?.image) {
        imgEl.src = siteData.about.image;
        imgEl.onerror = () => { imgEl.src = PLACEHOLDER; };
    }

    (siteData.about?.stats || []).forEach((stat, i) => {
        const n = document.getElementById(`stat${i + 1}-number`);
        const l = document.getElementById(`stat${i + 1}-label`);
        if (n) n.textContent = stat.number;
        if (l) l.textContent = stat.label;
    });
}

// ===============================
// Bento Grid Filter
// Called directly from onclick in HTML
// ===============================
function filterCards(tag, btn) {
    // Update active button state
    document.querySelectorAll('.ps-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show / hide cards based on data-tags
    document.querySelectorAll('#ps-grid .ps-card').forEach(card => {
        const tags = (card.dataset.tags || '').split(' ');
        const visible = tag === 'all' || tags.includes(tag);

        if (visible) {
            card.style.opacity   = '1';
            card.style.transform = '';
            card.style.display   = '';
        } else {
            card.style.opacity   = '0';
            card.style.transform = 'scale(0.95)';
            // Short delay matches the CSS transition before hiding from layout
            setTimeout(() => {
                if ((card.dataset.tags || '').split(' ').includes(tag) || tag === 'all') return;
                card.style.display = 'none';
            }, 300);
        }
    });
}
function toggleTeam() {
    const section = document.getElementById('team');
    const btn     = document.getElementById('team-toggle-btn');
    const expanded = section.classList.toggle('show-all');
    btn.textContent = expanded ? 'Réduire ↑' : 'Voir tous les membres ↓';
}
// ===============================
// Team — image-dominant grid
// ===============================
function renderTeam() {
    const container = document.getElementById('team-container');
    if (!container) return;

    if (!siteData.team?.length) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#666">Notre équipe sera bientôt présentée.</p>';
        return;
    }

    const sorted = [...siteData.team].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    container.innerHTML = sorted.map((m, i) => `
        <div class="team-member ${i === 0 ? 'is-leader' : ''}">
            <img src="${m.image || PLACEHOLDER}"
                 alt="${m.name}"
                 loading="lazy"
                 onerror="this.src='${PLACEHOLDER}'">
            ${m.linkedin ? `<a href="${m.linkedin}" target="_blank" rel="noopener" class="team-linkedin" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>` : ''}
            <div class="team-info">
                <h3>${m.name}</h3>
                <p class="role">${m.role}</p>
            </div>
        </div>
    `).join('');
}

// ===============================
// Events
// ===============================
function renderEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;

    if (!siteData.events?.length) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666">Aucun événement prévu pour le moment. Restez connectés !</div>';
        return;
    }

    const sorted = [...siteData.events].sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = sorted.map(ev => {
        let date = 'Date à venir';
        try {
            const d = new Date(ev.date);
            if (!isNaN(d)) date = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (_) {}
        return `
            <div class="event-card">
                <div class="event-date">${date}</div>
                <div class="event-info">
                    <h3>${ev.title}</h3>
                    <p>${ev.description}</p>
                    ${ev.link ? `<a href="${ev.link}" class="event-link" target="_blank" rel="noopener">S'inscrire</a>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ===============================
// Gallery — masonry with lightbox
// ===============================
function renderGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    if (!siteData.gallery?.length) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666">La galerie sera bientôt disponible !</div>';
        return;
    }

    const sorted = [...siteData.gallery].sort((a, b) => new Date(b.date) - new Date(a.date));
    allGalleryImages = sorted;

    const preview = sorted.slice(0, GALLERY_PREVIEW);
    const layouts = ['g-big', 'g-normal', 'g-tall', 'g-wide', 'g-tall', 'g-tall', 'g-tall'];

    container.innerHTML = preview.map((item, i) => `
        <div class="gallery-item ${layouts[i % layouts.length]}"
             data-index="${i}"
             role="button"
             tabindex="0"
             aria-label="Voir photo : ${item.caption || i + 1}">
            <img src="${item.image}"
                 alt="${item.caption || 'Photo Enactus FST Tanger'}"
                 loading="lazy"
                 onerror="this.src='${PLACEHOLDER}'">
            <div class="gallery-overlay">
                <div class="g-icon"><i class="fas fa-expand" aria-hidden="true"></i></div>
                ${item.caption ? `<span class="g-caption">${item.caption}</span>` : ''}
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.gallery-item').forEach(item => {
        const open = () => openLightbox(parseInt(item.dataset.index));
        item.addEventListener('click', open);
        item.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
}

// ===============================
// Lightbox
// ===============================
function setupLightbox() {
    if (document.getElementById('gallery-lightbox')) return;

    const lb = document.createElement('div');
    lb.id = 'gallery-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = `
        <button id="lb-close" aria-label="Fermer">✕</button>
        <button class="lb-btn" id="lb-prev" aria-label="Précédent">&#8249;</button>
        <div class="lb-content">
            <img id="lb-img" src="" alt="">
            <p class="lb-caption" id="lb-caption"></p>
            <p class="lb-counter" id="lb-counter"></p>
        </div>
        <button class="lb-btn" id="lb-next" aria-label="Suivant">&#8250;</button>
    `;

    const style = document.createElement('style');
    style.textContent = `
        #gallery-lightbox {
            display:none; position:fixed; inset:0;
            background:rgba(0,0,0,0.96); z-index:9999;
            align-items:center; justify-content:center;
        }
        #gallery-lightbox.active { display:flex; }
        .lb-content { display:flex; flex-direction:column; align-items:center; gap:10px; max-width:90vw; }
        #lb-img {
            max-width:88vw; max-height:78vh;
            object-fit:contain; border-radius:6px;
            box-shadow:0 30px 80px rgba(0,0,0,0.6);
            transition:opacity 0.3s ease;
        }
        .lb-caption { color:rgba(255,255,255,0.55); font-size:0.8rem; text-align:center; }
        .lb-counter  { color:rgba(255,255,255,0.3);  font-size:0.7rem; }
        .lb-btn {
            position:absolute; top:50%; transform:translateY(-50%);
            width:52px; height:52px; border-radius:50%;
            border:1px solid rgba(255,255,255,0.2);
            background:rgba(255,255,255,0.08); color:white; font-size:2rem;
            cursor:pointer; display:flex; align-items:center; justify-content:center;
            transition:background 0.2s ease;
        }
        .lb-btn:hover { background:rgba(255,255,255,0.2); }
        #lb-prev { left:12px; } #lb-next { right:12px; }
        #lb-close {
            position:absolute; top:14px; right:14px;
            width:40px; height:40px; border-radius:50%;
            border:1px solid rgba(255,255,255,0.2);
            background:rgba(255,255,255,0.08); color:white; font-size:1rem;
            cursor:pointer; display:flex; align-items:center; justify-content:center;
            transition:background 0.2s ease;
        }
        #lb-close:hover { background:rgba(255,255,255,0.22); }
        @media(max-width:640px){
            .lb-btn{width:38px;height:38px;font-size:1.4rem;}
            #lb-prev{left:4px;} #lb-next{right:4px;}
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(lb);

    document.getElementById('lb-close').addEventListener('click', closeLightbox);
    document.getElementById('lb-prev').addEventListener('click', () => navigateLightbox(-1));
    document.getElementById('lb-next').addEventListener('click', () => navigateLightbox(1));
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

    let lbTouchX = 0;
    lb.addEventListener('touchstart', e => { lbTouchX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend',   e => {
        const dx = e.changedTouches[0].clientX - lbTouchX;
        if (Math.abs(dx) > 40) navigateLightbox(dx < 0 ? 1 : -1);
    }, { passive: true });

    document.addEventListener('keydown', e => {
        if (!lb.classList.contains('active')) return;
        if (e.key === 'ArrowRight') navigateLightbox(1);
        if (e.key === 'ArrowLeft')  navigateLightbox(-1);
        if (e.key === 'Escape')     closeLightbox();
    });
}

function openLightbox(index) {
    lightboxIndex = index;
    updateLightboxImage();
    document.getElementById('gallery-lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('gallery-lightbox')?.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + allGalleryImages.length) % allGalleryImages.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    const item    = allGalleryImages[lightboxIndex];
    const img     = document.getElementById('lb-img');
    const caption = document.getElementById('lb-caption');
    const counter = document.getElementById('lb-counter');
    img.style.opacity = '0';
    img.src = item.image;
    img.alt = item.caption || 'Photo Enactus';
    img.onerror = () => { img.src = PLACEHOLDER; };
    img.onload  = () => { img.style.opacity = '1'; };
    if (img.complete) img.style.opacity = '1';
    if (caption) caption.textContent = item.caption || '';
    if (counter) counter.textContent  = `${lightboxIndex + 1} / ${allGalleryImages.length}`;
}

// ===============================
// Contact
// ===============================
function updateContact() {
    const emailEl  = document.getElementById('contact-email');
    const addrEl   = document.getElementById('contact-address');
    const socialEl = document.getElementById('social-links-container');

    if (emailEl && siteData.contact?.email) {
        emailEl.textContent = siteData.contact.email;
        emailEl.href = `mailto:${siteData.contact.email}`;
    }
    if (addrEl && siteData.contact?.address) {
        addrEl.innerHTML = siteData.contact.address;
    }
    if (socialEl && siteData.contact?.social?.length) {
        socialEl.innerHTML = siteData.contact.social.map(s => `
            <a href="${s.url}" class="social-link"
               target="_blank" rel="noopener noreferrer"
               title="${s.platform}" aria-label="${s.platform}">
                ${s.icon}
            </a>
        `).join('');
    }
}

// ===============================
// Navigation
// ===============================
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section, header');

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
                document.querySelector('.nav-links')?.classList.remove('active');
                document.querySelector('.mobile-menu-toggle')?.classList.remove('active');
            }
        });
    });

    let rafId = null;
    window.addEventListener('scroll', () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            let current = '';
            sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) current = s.id; });
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
            });
        });
    }, { passive: true });
}

// ===============================
// Mobile Menu
// ===============================
function setupMobileMenu() {
    const toggle   = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', e => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        toggle.classList.toggle('active');
    });

    document.addEventListener('click', e => {
        if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            toggle.classList.remove('active');
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            navLinks.classList.remove('active');
            toggle.classList.remove('active');
        }
    });
}

// ===============================
// Scroll Effects
// ===============================
function setupScrollEffects() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 100);
    }, { passive: true });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.event-card, .stat-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===============================
// Section title periods
// ===============================
function addTitlePeriods() {
    document.querySelectorAll('.section-title').forEach(el => {
        if (el.querySelector('.section-title-dot')) return;
        const dot = document.createElement('span');
        dot.className = 'section-title-dot';
        dot.textContent = '.';
        el.appendChild(dot);
    });
}

// ===============================
// About image 3D tilt (desktop only)
// ===============================
function setupImageTilt() {
    if (window.innerWidth < 1024) return;
    const img = document.querySelector('.about-image img');
    if (!img) return;

    img.addEventListener('mousemove', e => {
        const rect = img.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * 6;
        const rotY = ((cx - x) / cx) * 6;
        img.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    });

    img.addEventListener('mouseleave', () => {
        img.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
}

// ===============================
// Custom cursor (desktop only)
// ===============================
function setupCursor() {
    if (window.innerWidth < 1024) return;
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;
    let animating = false;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.classList.add('visible');
        if (!animating) { animating = true; moveCursor(); }
    }, { passive: true });

    document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));

    function moveCursor() {
        curX += (mouseX - curX) * 0.18;
        curY += (mouseY - curY) * 0.18;
        cursor.style.left = curX + 'px';
        cursor.style.top  = curY + 'px';
        if (Math.abs(mouseX - curX) > 0.5 || Math.abs(mouseY - curY) > 0.5) {
            requestAnimationFrame(moveCursor);
        } else {
            animating = false;
        }
    }

    const hoverEls = 'a, button, .team-member, .gallery-item, .event-card';
    document.querySelectorAll(hoverEls).forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// ===============================
// Boot
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setTimeout(() => {
        addTitlePeriods();
        setupImageTilt();
        setupCursor();
    }, 100);
});

// ===============================
// Scroll Progress Bar
// ===============================
function setupScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
        bar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
}

// ===============================
// Reveal on Scroll
// ===============================
function setupRevealAnimations() {
    document.querySelectorAll(
        '.stat-item, .about-content, .contact-content, ' +
        '.section-title, .section-subtitle, .join-benefits'
    ).forEach(el => el.classList.add('reveal-on-scroll'));

    const io = new IntersectionObserver(entries => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('revealed'), i * 80);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => io.observe(el));
}

// ===============================
// Counter Animation for Stats
// ===============================
function setupCounterAnimations() {
    const counters = document.querySelectorAll('#stat1-number, #stat2-number, #stat3-number');

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const raw    = el.textContent.replace(/\D/g, '');
            const target = parseInt(raw, 10);
            const suffix = el.textContent.replace(/[0-9]/g, '');
            if (isNaN(target)) return;

            let current = 0;
            const steps = 60;
            const step  = target / steps;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    el.textContent = target + suffix;
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(current) + suffix;
                }
            }, 20);
            io.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(el => io.observe(el));
}
