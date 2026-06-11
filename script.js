/* ─── Nav Scroll State ───────────────────────────────────────────────────── */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── Mobile Menu ────────────────────────────────────────────────────────── */
const toggle = document.getElementById('navToggle');
const links  = document.getElementById('navLinks');

function toggleMenu() {
  const open = toggle.classList.toggle('open');
  links.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

toggle.addEventListener('touchstart', e => {
  e.preventDefault();
  toggleMenu();
}, { passive: false });

toggle.addEventListener('click', e => {
  // touchstart already handled on touch devices
  if (e.detail === 0) return; // synthetic click from touch, skip
  toggleMenu();
});

links.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    toggle.classList.remove('open');
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ─── Reveal on Scroll ───────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) {
      target.classList.add('is-visible');
      revealObserver.unobserve(target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── Activity Rings ─────────────────────────────────────────────────────── */
const CIRCUMFERENCE = 2 * Math.PI * 40; // r=40 → 251.33

function animateRing(ringFill, pct, pctLabel, delay) {
  const target = CIRCUMFERENCE * (1 - pct / 100);
  // Kurze Verzögerung pro Ring für den Stagger-Effekt
  setTimeout(() => {
    ringFill.style.strokeDashoffset = target;

    // Zähler im Zentrum hochzählen
    const duration = 1400;
    const step     = 16;
    const increment = pct / (duration / step);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, pct);
      pctLabel.textContent = Math.round(current) + '%';
      if (current >= pct) clearInterval(timer);
    }, step);
  }, delay);
}

const ringObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (!isIntersecting) return;
    target.querySelectorAll('.ring-item').forEach((item, i) => {
      const fill  = item.querySelector('.ring-fill');
      const label = item.querySelector('.ring-pct');
      const pct   = parseInt(fill.dataset.pct, 10);
      animateRing(fill, pct, label, i * 80); // 80ms Stagger pro Ring
    });
    ringObserver.unobserve(target);
  });
}, { threshold: 0.2 });

document.querySelectorAll('.rings-grid').forEach(el => ringObserver.observe(el));

/* ─── Counter Animation ──────────────────────────────────────────────────── */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) {
      target.querySelectorAll('[data-target]').forEach(el => {
        const end = parseInt(el.dataset.target, 10);
        const duration = 1800;
        const step = 16;
        const increment = end / (duration / step);
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + increment, end);
          el.textContent = Math.floor(current);
          if (current >= end) clearInterval(timer);
        }, step);
      });
      counterObserver.unobserve(target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stats-row').forEach(el => counterObserver.observe(el));

/* ─── Active Nav Link ────────────────────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link:not(.nav-link--cta)');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) {
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* Add active style via CSS */
const activeStyle = document.createElement('style');
activeStyle.textContent = `.nav-link.active { color: var(--clr-text) !important; }
.nav-link.active::after { transform: translateX(-50%) scaleX(1) !important; }`;
document.head.appendChild(activeStyle);

/* ─── Form ───────────────────────────────────────────────────────────────── */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const originalHTML = btn.innerHTML;
    btn.textContent = 'Wird gesendet…';
    btn.disabled = true;

    try {
      const data = new FormData(form);
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data
      });
      const json = await res.json();

      if (json.success) {
        btn.innerHTML = '✓ Nachricht gesendet!';
        btn.style.background = '#22c55e';
        form.reset();
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      btn.innerHTML = '✗ Fehler – bitte per E-Mail melden';
      btn.style.background = '#ef4444';
    }

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      btn.disabled = false;
    }, 4000);
  });
}

/* ─── Spotlight + Kontur-Highlight (desktop only) ────────────────────────── */
if (window.matchMedia('(pointer: fine)').matches) {

  /* Spotlight layer */
  const spotlight = document.createElement('div');
  spotlight.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9998;
    width: 520px; height: 520px; border-radius: 50%;
    background: radial-gradient(circle,
      rgba(45,196,160,0.09) 0%,
      rgba(45,196,160,0.04) 35%,
      transparent 70%);
    transform: translate(-50%, -50%);
    top: 0; left: 0;
    will-change: left, top;
  `;
  document.body.appendChild(spotlight);

  /* Cursor dot */
  const dot = document.createElement('div');
  dot.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9999;
    width: 8px; height: 8px; border-radius: 50%;
    background: rgba(45,196,160,0.9);
    transform: translate(-50%, -50%);
    top: 0; left: 0;
    transition: width 0.2s, height 0.2s, background 0.2s, opacity 0.3s;
    will-change: left, top;
  `;
  document.body.appendChild(dot);

  /* Highlight ring */
  const ring = document.createElement('div');
  ring.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9998;
    width: 36px; height: 36px; border-radius: 50%;
    border: 1px solid rgba(45,196,160,0.35);
    transform: translate(-50%, -50%);
    top: 0; left: 0;
    transition: width 0.25s, height 0.25s, border-color 0.25s, opacity 0.3s;
    will-change: left, top;
  `;
  document.body.appendChild(ring);

  let mx = 0, my = 0;
  let sx = 0, sy = 0;
  let rx = 0, ry = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  const animate = () => {
    sx += (mx - sx) * 0.07;
    sy += (my - sy) * 0.07;
    spotlight.style.left = sx + 'px';
    spotlight.style.top  = sy + 'px';

    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    requestAnimationFrame(animate);
  };
  animate();

  /* Hover-Reaktion */
  document.querySelectorAll('a, button, .skill-card, .expertise-card, .stat-card, .timeline-item, .download-btn, .nav-link').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width        = '14px';
      dot.style.height       = '14px';
      dot.style.background   = 'rgba(45,196,160,1)';
      ring.style.width       = '56px';
      ring.style.height      = '56px';
      ring.style.borderColor = 'rgba(45,196,160,0.7)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width        = '8px';
      dot.style.height       = '8px';
      dot.style.background   = 'rgba(45,196,160,0.9)';
      ring.style.width       = '36px';
      ring.style.height      = '36px';
      ring.style.borderColor = 'rgba(45,196,160,0.35)';
    });
  });

  /* Kontur-Glow auf nahe Cards */
  const highlightEls = document.querySelectorAll('.skill-card, .expertise-card, .stat-card, .timeline-item');
  window.addEventListener('mousemove', e => {
    highlightEls.forEach(el => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const proximity = Math.max(0, 1 - dist / 380);
      el.style.boxShadow = proximity > 0.05
        ? `0 0 0 1px rgba(45,196,160,${(proximity * 0.45).toFixed(3)}), 0 8px 40px rgba(45,196,160,${(proximity * 0.12).toFixed(3)})`
        : '';
    });
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
}

/* ─── Expertise Cards: scroll-into-view glow (touch devices only) ────── */
if (window.matchMedia('(hover: none)').matches) {
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      target.classList.toggle('in-view', isIntersecting);
    });
  }, { threshold: 0.55 });

  document.querySelectorAll('.expertise-card').forEach(card => cardObserver.observe(card));
}

// ─── Word Cloud: continuous drift + scale + color animation ──────────
(function () {
  const rand = (min, max) => min + Math.random() * (max - min);

  // Color endpoints: accent green ↔ near-white
  const C_GREEN = [10, 149, 120];
  const C_WHITE = [235, 235, 233];

  function lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
  }
  function blendColor(t) {
    return `rgb(${lerp(C_GREEN[0], C_WHITE[0], t)},${lerp(C_GREEN[1], C_WHITE[1], t)},${lerp(C_GREEN[2], C_WHITE[2], t)})`;
  }

  function animateWord(w) {
    const dur   = rand(2500, 5000);
    const tx    = rand(-10, 10);
    const ty    = rand(-10, 10);
    const sc    = rand(0.88, 1.12);
    const colorT = rand(0, 1); // 0 = green, 1 = white

    w.style.transition = `transform ${dur}ms cubic-bezier(0.45,0,0.55,1), color ${dur}ms ease`;
    w.style.transform  = `translate(${tx}px, ${ty}px) scale(${sc})`;
    w.style.color      = blendColor(colorT);

    w._driftTimer = setTimeout(() => animateWord(w), dur);
  }

  document.querySelectorAll('.word-cloud .w').forEach(w => {
    const delay = rand(0, 3000);
    w._driftTimer = setTimeout(() => animateWord(w), delay);
  });
}());
