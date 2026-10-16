const $ = s => document.querySelector(s);

/* ---------- stars ---------- */
const stars = $('#stars');
const small = innerWidth < 700;
for (let i = 0; i < (small ? 35 : 55); i++) {
  const s = document.createElement('i');
  s.style.left = Math.random() * 100 + '%';
  s.style.top = Math.random() * 70 + '%';
  s.style.animationDelay = Math.random() * 3 + 's';
  s.style.transform = `scale(${0.6 + Math.random() * 1.4})`;
  stars.appendChild(s);
}
const flies = $('#flies');
for (let i = 0; i < (small ? 8 : 14); i++) {
  const f = document.createElement('i');
  f.style.left = Math.random() * 100 + '%';
  f.style.top = 40 + Math.random() * 40 + '%';
  f.style.animationDelay = -Math.random() * 9 + 's';
  f.style.animationDuration = 6 + Math.random() * 6 + 's';
  flies.appendChild(f);
}
const flyers = $('#flyers'), prog = $('#progress');
const lorryEl = $('#lorry');
let lastY = scrollY;

/* ---------- time-of-day keyframes (dawn -> day -> sunset -> night) ---------- */
const KEYS = [
  { p: 0.00, sky1: '#f6b98a', sky2: '#ffe3b8', ink: '#2b1d14', h1: '#c9785a', h2: '#a85a45', h3: '#7a3f33' },
  { p: 0.30, sky1: '#6fb7e8', sky2: '#d6f0ff', ink: '#1d2b36', h1: '#86b6a0', h2: '#5f9a85', h3: '#3f7a68' },
  { p: 0.58, sky1: '#f08a4b', sky2: '#ffd08a', ink: '#2b1d14', h1: '#b0603f', h2: '#8a4733', h3: '#5e2f26' },
  { p: 0.80, sky1: '#1b2150', sky2: '#4a3a7a', ink: '#f6ead6', h1: '#2c2f63', h2: '#20244e', h3: '#151a3b' },
  { p: 1.00, sky1: '#0b0f2b', sky2: '#26214f', ink: '#f6ead6', h1: '#1a1d45', h2: '#12163a', h3: '#0b0e26' }
];
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function palette(p) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i], b = KEYS[i + 1], t = clamp((p - a.p) / (b.p - a.p));
  const o = {};
  ['sky1', 'sky2', 'ink', 'h1', 'h2', 'h3'].forEach(k => o[k] = mix(a[k], b[k], t));
  return o;
}

/* ---------- elements ---------- */
const root = document.documentElement.style;
const sun = $('#sun'), moon = $('#moon'), clouds = $('#clouds'), starsEl = $('#stars');
const l1 = $('#l1'), l2 = $('#l2'), l3 = $('#l3'), road = $('#road');
const w1 = $('#w1'), w2 = $('#w2'), beam = $('#beam');
const kmEl = $('#hud-km'), stopEl = $('#hud-stop');

const skyEl = $('#sky'), sceneEl = document.querySelector('.scene');
let MAX = 1, VW = innerWidth, VH = innerHeight, tiles = [0, 0, 0], lastQ = -1;
function measure() {
  VW = innerWidth; VH = innerHeight;
  MAX = document.documentElement.scrollHeight - VH;
  tiles = [l1, l2, l3].map(el => el ? el.offsetWidth / 2 : 600);
}
const setT = (el, v) => { if (el && el._t !== v) { el._t = v; el.style.transform = v; } };

function frame() {
  const y = scrollY, p = MAX > 0 ? clamp(y / MAX) : 0;

  // sky + hills colours
  const q = Math.round(p * 80);
  if (q !== lastQ) {
    lastQ = q;
    const c = palette(q / 80);
    skyEl.style.setProperty('--sky1', c.sky1); skyEl.style.setProperty('--sky2', c.sky2);
    sceneEl.style.setProperty('--h1', c.h1); sceneEl.style.setProperty('--h2', c.h2); sceneEl.style.setProperty('--h3', c.h3);
    root.setProperty('--ink', c.ink);
  }

  // sun arc (day) / moon arc (night) via transforms
  const ts = clamp(p / 0.72);
  setT(sun, `translate3d(${(0.08 + 0.84 * ts) * VW}px,${(0.60 - Math.sin(Math.PI * ts) * 0.48) * VH}px,0) translate(-50%,-50%)`);
  sun.style.opacity = (1 - clamp((p - 0.62) / 0.1)).toFixed(2);
  const tm = clamp((p - 0.72) / 0.28);
  setT(moon, `translate3d(${(0.18 + 0.64 * tm) * VW}px,${(0.46 - Math.sin(Math.PI * tm) * 0.26) * VH}px,0) translate(-50%,-50%)`);
  moon.style.opacity = clamp((p - 0.7) / 0.08).toFixed(2);
  starsEl.style.opacity = clamp((p - 0.72) / 0.16).toFixed(2);
  clouds.style.opacity = (1 - clamp((p - 0.68) / 0.2) * 0.85).toFixed(2);

  // parallax: the world slides past behind the lorry
  [[l1, 0.10], [l2, 0.22], [l3, 0.42]].forEach(([el, k], i) => {
    if (el) setT(el, `translate3d(${-((y * k) % tiles[i])}px,0,0)`);
  });
  if (road) road.style.setProperty('--rx', -(y * 0.9 % 80) + 'px');

  // Real wheels spin with scroll velocity
  const rot = `rotate(${(y * 0.9) % 360}deg)`;
  if (w1) setT(w1, rot);
  if (w2) setT(w2, rot);

  // Headlight beam at dusk and night (p > 0.72)
  if (beam) beam.style.opacity = (clamp((p - 0.72) / 0.1) * 0.92).toFixed(2);

  // Odometer (km traveled)
  const km = String(Math.round(p * 1240)).padStart(4, '0');
  if (kmEl && kmEl.textContent !== km) kmEl.textContent = km;

  // Progress bar, fireflies, day flyers
  setT(prog, `scaleX(${p.toFixed(4)})`);
  const fo = clamp((p - 0.74) / 0.12);
  if (flies) { flies.style.opacity = fo.toFixed(2); flies.style.visibility = fo > 0 ? 'visible' : 'hidden'; }
  const fl = 1 - clamp((p - 0.62) / 0.15);
  if (flyers) { flyers.style.opacity = fl.toFixed(2); flyers.style.visibility = fl > 0 ? 'visible' : 'hidden'; }
}

let tick = false;
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { frame(); tick = false; }); } }, { passive: true });
addEventListener('resize', () => { measure(); frame(); });
addEventListener('load', () => { measure(); frame(); });
measure(); frame();

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 90 + 'ms'; io.observe(el); });

/* ---------- current stop on the HUD ---------- */
const so = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting && stopEl && e.target.dataset.stop) {
    stopEl.textContent = e.target.dataset.stop;
  }
}), { rootMargin: '-40% 0px -50% 0px' });
document.querySelectorAll('[data-stop]').forEach(s => so.observe(s));
document.querySelectorAll('[data-stop]').forEach(s => so.observe(s));

/* ---------- select piece helper ---------- */
function selectPiece(pieceName) {
  const select = document.getElementById('b-piece');
  if (select) {
    select.value = pieceName;
  }
}

/* ---------- reservation -> WhatsApp (+91 85928 09092) for SANGEETHA ---------- */
const bForm = $('#booking-form');
if (bForm) {
  bForm.addEventListener('submit', e => {
    e.preventDefault();
    const v = id => encodeURIComponent($(id).value);
    const msg = `Hello SANGEETHA, I want to book custom furniture!%0ACustomer: ${v('#b-name')}%0ALocation: ${v('#b-place')}%0ADate: ${v('#b-date')}%0APiece: ${v('#b-piece')}%0APlease share catalogue and custom sizes.`;
    window.open('https://wa.me/918592809092?text=' + msg, '_blank');
  });
}

/* ---------- REAL LORRY: CLEAN BACKGROUND & SHADOW REMOVAL ---------- */
(function () {
  const cv = document.getElementById('lorryimg');
  if (!cv) return;
  const img = new Image();
  img.onload = () => {
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    const sc = Math.min(1, 950 / img.naturalWidth);
    const w = Math.round(img.naturalWidth * sc);
    const h = Math.round(img.naturalHeight * sc);
    cv.width = w; cv.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const id = ctx.getImageData(0, 0, w, h);
    const d = id.data;
    const seen = new Uint8Array(w * h);
    const st = [];

    // Background criteria:
    // 1. Pure light pixels (> 200 on all channels)
    // 2. OR desaturated floor shadow (> 125 on all channels, near neutral grey)
    const isNeutralBg = (r, g, b) => {
      if (r > 200 && g > 200 && b > 200) return true;
      if (r > 125 && g > 125 && b > 125) {
        const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        if (diff < 24) return true;
      }
      return false;
    };

    const isBg = i => {
      const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      return isNeutralBg(r, g, b);
    };

    const push = i => {
      if (!seen[i] && isBg(i)) {
        seen[i] = 1;
        st.push(i);
      }
    };

    // Seed flood-fill from all 4 borders
    for (let x = 0; x < w; x++) {
      push(x);
      push((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      push(y * w);
      push(y * w + w - 1);
    }

    // Flood fill
    while (st.length) {
      const i = st.pop();
      const x = i % w, y = (i / w) | 0;
      d[i * 4 + 3] = 0; // Transparent
      if (x > 0) push(i - 1);
      if (x < w - 1) push(i + 1);
      if (y > 0) push(i - w);
      if (y < h - 1) push(i + w);
    }

    // Clean up residual shadow under and around wheels
    // Rear wheel center: x ~ 0.298 * w, y ~ 0.758 * h
    // Front wheel center: x ~ 0.782 * w, y ~ 0.758 * h
    // Tire bottom is around y = 0.872 * h
    const rearX = 0.298 * w, frontX = 0.782 * w;
    const wheelRX = 0.06 * w;
    const tireBottomY = 0.872 * h;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (d[i * 4 + 3] === 0) continue;

        // 1. Anything below the bottom of the tires is 100% ground shadow
        if (y >= tireBottomY) {
          d[i * 4 + 3] = 0;
          continue;
        }

        // 2. Between wheels under the chassis (from y > 0.75 * h)
        const isNearRear = Math.abs(x - rearX) < wheelRX;
        const isNearFront = Math.abs(x - frontX) < wheelRX;
        if (y > 0.75 * h && !isNearRear && !isNearFront) {
          const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
          if (r > 110 && g > 110 && b > 110) {
            d[i * 4 + 3] = 0;
            continue;
          }
        }

        // 3. Remove bright white / light grey halo around the tires
        if (y > 0.77 * h && (isNearRear || isNearFront)) {
          const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
          // Tire rubber is dark (< 80)
          if (r > 130 && g > 130 && b > 130) {
            d[i * 4 + 3] = 0;
            continue;
          }
        }
      }
    }

    ctx.putImageData(id, 0, 0);
  };
  img.src = 'lorry-furniture.jpg';
})();

/* ================================================================
   SOFA PHOTO GALLERY FILTERING & PURE PHOTO LIGHTBOX
   ================================================================ */

const SOFA_PHOTOS = [
  {
    title: "The Travancore Barrel Spindle 3-Piece Suite",
    src: "assets/images/real-sofa-barrel-spindle-suite.jpg"
  },
  {
    title: "The Malabar Royal Salon 3-Piece Set",
    src: "assets/images/real-sofa-dark-teak-suite.jpg"
  },
  {
    title: "Malabar Royal Suite — Showroom View",
    src: "assets/images/real-sofa-showroom-front.jpg"
  },
  {
    title: "The Zurich Architectural Walnut Sofa",
    src: "assets/images/real-sofa-modern-walnut-side.jpg"
  },
  {
    title: "Kerala Heritage Living Atelier",
    src: "assets/images/hero-furniture-backdrop.jpg"
  },
  {
    title: "The Colonial Cane Heritage Set",
    src: "assets/images/furniture-cane-heritage.jpg"
  },
  {
    title: "The Botanica Hand-Turned Daybed",
    src: "assets/images/furniture-botanical-daybed.jpg"
  },
  {
    title: "The Malabar Heritage Spindle Armchairs & Salon Suite",
    src: "assets/images/real-sofa-heritage-spindle-suite.jpg"
  }
];

let activePhotoIndex = 0;

/* Gallery Filter function */
window.filterGallery = function(cat, btn) {
  const tabs = document.querySelectorAll('.gallery-tabs .g-tab');
  tabs.forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const items = document.querySelectorAll('.gallery-grid .g-item');
  items.forEach(item => {
    const itemCat = item.getAttribute('data-cat');
    if (cat === 'all' || itemCat === cat) {
      item.style.display = 'block';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0) scale(1)';
    } else {
      item.style.display = 'none';
    }
  });
};

/* Pure Photo Viewer Functions (Image Only) */
window.openPhotoViewer = function(idx) {
  if (idx < 0 || idx >= SOFA_PHOTOS.length) return;
  activePhotoIndex = idx;
  const item = SOFA_PHOTOS[idx];
  const modal = document.getElementById('photo-lightbox');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');

  if (img) {
    img.src = item.src;
    img.alt = item.title;
  }
  if (caption) {
    caption.textContent = item.title;
  }
  const counter = document.getElementById('lightbox-counter');
  if (counter) {
    counter.textContent = `${idx + 1} / ${SOFA_PHOTOS.length}`;
  }
  const waBtn = document.getElementById('lightbox-wa-btn');
  if (waBtn) {
    waBtn.href = `https://wa.me/918592809092?text=${encodeURIComponent('Hello SANGEETHA, I would like to inquire about: ' + item.title)}`;
  }

  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }
};

window.closePhotoViewer = function() {
  const modal = document.getElementById('photo-lightbox');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
};

window.nextPhoto = function() {
  activePhotoIndex = (activePhotoIndex + 1) % SOFA_PHOTOS.length;
  openPhotoViewer(activePhotoIndex);
};

window.prevPhoto = function() {
  activePhotoIndex = (activePhotoIndex - 1 + SOFA_PHOTOS.length) % SOFA_PHOTOS.length;
  openPhotoViewer(activePhotoIndex);
};

// Keyboard navigation (Escape, Left, Right)
document.addEventListener('keydown', e => {
  const modal = document.getElementById('photo-lightbox');
  if (!modal || !modal.classList.contains('open')) return;
  if (e.key === 'Escape') closePhotoViewer();
  if (e.key === 'ArrowRight') nextPhoto();
  if (e.key === 'ArrowLeft') prevPhoto();
});

// Mobile touch swipe gestures for pure photo viewer
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const lightboxEl = document.getElementById('photo-lightbox');
if (lightboxEl) {
  lightboxEl.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  lightboxEl.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > 40 && absDx > absDy) {
      if (dx < 0) nextPhoto();
      else prevPhoto();
    } else if (dy > 80 && absDy > absDx) {
      closePhotoViewer();
    }
  }, { passive: true });
}


