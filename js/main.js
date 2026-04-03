'use strict';

/* ==========================================================================
   WEB3FORMS — إرسال إيميل إشعار
========================================================================== */
const W3F_KEY = 'c8e66b5e-c182-4bbc-8384-71b453897867';

function sendEmail(subject, bodyLines) {
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      access_key: W3F_KEY,
      subject:    subject,
      message:    bodyLines.join('\n'),
      botcheck:   '',
    }),
  }).catch(console.error);
}

/* ==========================================================================
   PARTICLES (sparkles + golden dust)
========================================================================== */
(function () {
  const canvas = document.getElementById('particles-canvas');
  const ctx    = canvas.getContext('2d');
  const GOLD   = '#C9A84C';
  const GOLD2  = '#E8C97A';
  let W, H;
  const particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.init(true); }

    init(scattered = false) {
      this.x    = Math.random() * W;
      this.y    = scattered ? Math.random() * H : H + Math.random() * 60;
      this.r    = Math.random() * 2.2 + 0.4;
      this.vy   = -(Math.random() * 0.65 + 0.18);
      this.vx   = (Math.random() - 0.5) * 0.28;
      this.life = 0;
      this.max  = Math.random() * 360 + 180;
      this.star = Math.random() < 0.28;
      this.rot  = Math.random() * Math.PI * 2;
      this.drot = (Math.random() - 0.5) * 0.018;
      this.alpha = 0;
    }

    step() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.rot += this.drot;
      this.life++;
      const p = this.life / this.max;
      this.alpha = p < 0.2
        ? (p / 0.2) * 0.55
        : p > 0.75
          ? ((1 - p) / 0.25) * 0.55
          : 0.55;
      if (this.life >= this.max || this.y < -20) this.init();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      if (this.star) {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = GOLD;
        const s = this.r * 2.2;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle  = (i * Math.PI) / 4;
          const radius = i % 2 === 0 ? s : s * 0.42;
          i === 0
            ? ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
            : ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = Math.random() < .5 ? GOLD : GOLD2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < 90; i++) {
    const p = new Particle();
    p.life = Math.floor(Math.random() * p.max);
    particles.push(p);
  }

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.step(); p.draw(); });
    requestAnimationFrame(loop);
  })();
})();


/* ==========================================================================
   CURTAIN
========================================================================== */
function openCurtain() {
  const btn     = document.getElementById('open-btn');
  const overlay = document.getElementById('curtain-overlay');
  const left    = document.getElementById('curtainLeft');
  const right   = document.getElementById('curtainRight');
  const stage   = document.querySelector('.curtain-stage');

  if (!overlay || !left || !right) return;

  if (btn) { btn.disabled = true; btn.classList.add('hidden'); }

  // Immediately disable pointer events so nothing blocks clicks below
  overlay.style.pointerEvents = 'none';

  tryPlayMusic();

  let progress = 0;
  const duration = 2400;
  const start    = performance.now();
  const maxX     = window.innerWidth  / 2 + 80;
  const maxY     = window.innerHeight * 0.18;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
  }

  function animate(now) {
    const elapsed = now - start;
    progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    left.style.transform  = `translateX(${-maxX * ease}px) translateY(${-maxY * ease}px)`;
    right.style.transform = `translateX(${maxX * ease}px) translateY(${-maxY * ease}px)`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      if (stage) stage.classList.add('revealed');

      setTimeout(() => {
        const mp = document.getElementById('music-player');
        if (mp) mp.classList.add('visible');
      }, 2600);

      setTimeout(() => {
        const ov = document.getElementById('curtain-overlay');
        if (ov) { ov.style.transition = 'opacity .6s'; ov.style.opacity = '0'; }
      }, 2800);

      setTimeout(() => {
        const ov = document.getElementById('curtain-overlay');
        if (ov) ov.remove();
      }, 3500);
    }
  }

  requestAnimationFrame(animate);
}


/* ==========================================================================
   SCROLL-REVEAL — IntersectionObserver
========================================================================== */
(function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .stagger')
    .forEach(el => io.observe(el));
})();


/* ==========================================================================
   NAME MODAL — يظهر أول شيء عند فتح الرابط
========================================================================== */

// أظهر المودال فوراً عند تحميل الصفحة، وعطّل زرار الستارة لحين إدخال الاسم
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('weddingGuestName');
  if (!saved) {
    // زيارة أولى — اطلب الاسم
    const modal = document.getElementById('name-modal');
    const input = document.getElementById('guest-input');
    const openBtn = document.getElementById('open-btn');
    if (modal) modal.classList.add('active');
    if (input) setTimeout(() => input.focus(), 300);
    if (openBtn) openBtn.disabled = true; // لا يفتح الستارة قبل إدخال الاسم
  }
});

function confirmName() {
  const raw  = document.getElementById('guest-input').value.trim();
  const name = raw || 'ضيفنا العزيز';

  localStorage.setItem('weddingGuestName', name);
  document.getElementById('name-modal').classList.remove('active');

  // فعّل زرار الستارة الآن
  const openBtn = document.getElementById('open-btn');
  if (openBtn) openBtn.disabled = false;

  // Pre-fill forms
  setVal('rsvp-name', name);
  setVal('gb-name',   name);

  // Welcome toast
  document.getElementById('toast-name').textContent = name;
  const toast = document.getElementById('welcome-toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

const _guestInput = document.getElementById('guest-input');
if (_guestInput) _guestInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmName();
});

// Restore saved name on reload
(function restoreName() {
  const saved = localStorage.getItem('weddingGuestName');
  if (saved) {
    setVal('rsvp-name', saved);
    setVal('gb-name',   saved);
    const tn = document.getElementById('toast-name'); if (tn) tn.textContent = saved;
  }
})();


/* ==========================================================================
   MUSIC PLAYER
========================================================================== */
const audio = document.getElementById('bg-music');
let   isPlaying = false;

function tryPlayMusic() {
  audio.volume = 0.28;
  audio.play()
    .then(() => { isPlaying = true; syncMusicUI(); })
    .catch(() => { /* blocked by browser; user can tap player */ });
}

function toggleMusic() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play().catch(() => {});
    isPlaying = true;
  }
  syncMusicUI();
}

function syncMusicUI() {
  document.querySelectorAll('.mp-bar').forEach(b =>
    b.classList.toggle('paused', !isPlaying)
  );
  document.getElementById('mp-label').textContent = isPlaying ? 'تشغيل' : 'موقوف';
}


/* ==========================================================================
   COUNTDOWN TIMER
   ← غيّر هنا تاريخ الزفاف
========================================================================== */
const WEDDING_DATE = new Date('2026-04-17T20:00:00');

function updateCountdown() {
  const diff = WEDDING_DATE - new Date();
  if (diff <= 0) {
    ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id =>
      document.getElementById(id).textContent = '00'
    );
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000)  / 60000);
  const s = Math.floor((diff % 60000)    / 1000);
  document.getElementById('cd-days').textContent  = String(d).padStart(3, '0');
  document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
  document.getElementById('cd-mins').textContent  = String(m).padStart(2, '0');
  document.getElementById('cd-secs').textContent  = String(s).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);


/* ==========================================================================
   GALLERY SLIDER (mobile)
========================================================================== */
(function initSlider() {
  const track  = document.getElementById('slider-track');
  const dotsEl = document.getElementById('slider-dots');
  if (!track) return;

  const total = track.children.length;
  let idx = 0;

  for (let i = 0; i < total; i++) {
    const d = document.createElement('div');
    d.className = 's-dot' + (i === 0 ? ' on' : '');
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  }

  function goTo(i) {
    idx = i;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dotsEl.querySelectorAll('.s-dot').forEach((d, j) =>
      d.classList.toggle('on', j === idx)
    );
  }

  setInterval(() => goTo((idx + 1) % total), 4500);
})();


/* ==========================================================================
   VIDEO PLACEHOLDER
   ← ضع YouTube video ID هنا بدل YOUR_VIDEO_ID
========================================================================== */
function loadVideo() {
  const videoId = 'YOUR_VIDEO_ID';
  const wrap    = document.getElementById('video-wrap');

  if (videoId === 'YOUR_VIDEO_ID') {
    document.getElementById('video-placeholder').innerHTML = `
      <div style="text-align:center; padding:40px;">
        <p style="font-family:'Cormorant Garamond',serif; font-size:1.5rem; color:var(--gold); margin-bottom:12px;">Coming Soon</p>
        <p style="font-size:11px; letter-spacing:3px; text-transform:uppercase; color:var(--text-3);">Our story video will be added soon</p>
      </div>`;
    return;
  }

  wrap.innerHTML = `<iframe
    width="100%" height="100%"
    src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    title="Our wedding story video"
  ></iframe>`;
}


/* ==========================================================================
   RSVP SYSTEM
========================================================================== */
let rsvpAnswer = null;

function pickRSVP(choice) {
  rsvpAnswer = choice;
  document.getElementById('rsvp-yes-btn').classList.toggle('active', choice === 'yes');
  document.getElementById('rsvp-no-btn').classList.toggle('active',  choice === 'no');

  const fields = document.getElementById('rsvp-fields');
  fields.classList.toggle('show', choice === 'yes');

  if (choice === 'no') {
    let noBtn = document.getElementById('rsvp-no-submit');
    if (!noBtn) {
      noBtn = document.createElement('button');
      noBtn.id        = 'rsvp-no-submit';
      noBtn.className = 'rsvp-submit';
      noBtn.style.marginTop = '20px';
      noBtn.textContent = 'Send My Reply  ✦';
      noBtn.onclick = submitRSVP;
      document.getElementById('rsvp-form-wrap').appendChild(noBtn);
    }
    noBtn.style.display = 'block';
  } else {
    const noBtn = document.getElementById('rsvp-no-submit');
    if (noBtn) noBtn.style.display = 'none';
  }
}

function submitRSVP() {
  if (!rsvpAnswer) {
    alert('يرجى اختيار ما إذا كنت ستشرفنا بالحضور.');
    return;
  }
  const name  = getVal('rsvp-name') || 'ضيف';
  const count = getVal('rsvp-count') || '1';
  const diet  = getVal('rsvp-diet')  || '';

  const list = JSON.parse(localStorage.getItem('weddingRSVPs') || '[]');
  list.push({ name, choice: rsvpAnswer, count, diet, ts: Date.now() });
  localStorage.setItem('weddingRSVPs', JSON.stringify(list));

  document.getElementById('rsvp-form-wrap').style.display = 'none';
  const done = document.getElementById('rsvp-done');
  done.classList.add('show');

  if (rsvpAnswer === 'yes') {
    document.getElementById('rsvp-done-title').textContent = 'تشرفنا بحضورك!';
    document.getElementById('rsvp-done-msg').textContent =
      `شكراً لك، ${name}! نحن متحمسون بحضورك في الفرح${count > 1 ? ` ومع ${count} ضيوفك` : ''}. نراك في 17 April! 🥂`;
  } else {
    document.getElementById('rsvp-done-title').textContent = 'سوف نفتقدك';
    document.getElementById('rsvp-done-msg').textContent =
      `شكراً لإعلامنا يا ${name}. ستكون في قلوبنا في يومنا المميز. 💛`;
  }

  // إرسال إيميل إشعار
  sendEmail(
    `RSVP جديد — ${name} (${rsvpAnswer === 'yes' ? 'سيحضر ✅' : 'لن يحضر ❌'})`,
    [
      `الاسم: ${name}`,
      `الرد: ${rsvpAnswer === 'yes' ? 'سيحضر ✅' : 'لن يحضر ❌'}`,
      `عدد الضيوف: ${count}`,
      `احتياجات غذائية: ${diet || '—'}`,
      `وقت الرد: ${new Date().toLocaleString('ar-EG')}`,
    ]
  );
}


/* ==========================================================================
   GUESTBOOK
========================================================================== */
function submitGuestMessage() {
  const name = getVal('gb-name').trim();
  const msg  = getVal('gb-msg').trim();
  if (!name || !msg) {
    alert('يرجى إدخال اسمك ورسالة معا.');
    return;
  }
  const msgs = JSON.parse(localStorage.getItem('weddingMessages') || '[]');
  msgs.push({ name, msg, ts: Date.now() });
  localStorage.setItem('weddingMessages', JSON.stringify(msgs));
  setVal('gb-msg', '');
  renderMessages();

  // إرسال إيميل إشعار
  sendEmail(
    `رسالة جديدة من ${name}`,
    [
      `الاسم: ${name}`,
      `الرسالة: ${msg}`,
      `الوقت: ${new Date().toLocaleString('ar-EG')}`,
    ]
  );
}

function renderMessages() {
  const msgs  = JSON.parse(localStorage.getItem('weddingMessages') || '[]');
  const grid  = document.getElementById('gb-grid');
  const empty = document.getElementById('gb-empty');

  grid.querySelectorAll('.gb-card').forEach(c => c.remove());

  if (msgs.length === 0) {
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  msgs.slice().reverse().forEach(m => {
    const card = document.createElement('div');
    card.className = 'gb-card';
    card.innerHTML = `
      <div class="gb-author">${escHtml(m.name)}</div>
      <div class="gb-msg">${escHtml(m.msg)}</div>
      <div class="gb-ts">${new Date(m.ts).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</div>
    `;
    grid.prepend(card);
  });
}

renderMessages();


/* ==========================================================================
   ADD TO CALENDAR (Google Calendar)
   ← غيّر التفاصيل هنا
========================================================================== */
function addToCalendar() {
  const params = new URLSearchParams({
    action:  'TEMPLATE',
    text:    '  Yousef & Mariem',
    dates:   '20260417T200000/20260418T000000',
    location:'القاعة الكبرى، فندق روز جاردن، القاهرة',
    details: 'يشرفنا حضوركم في فرح يوسف ومريم — 17 April 2026'
  });
  window.open(
    'https://calendar.google.com/calendar/render?' + params.toString(),
    '_blank', 'noopener,noreferrer'
  );
}


/* ==========================================================================
   MAP OVERLAY
========================================================================== */
const mapVeil = document.getElementById('map-veil');
if (mapVeil) {
  mapVeil.addEventListener('click', () => mapVeil.remove());
}


/* ==========================================================================
   NAV SCROLL + MOBILE DRAWER
========================================================================== */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', scrollY > 70);
}, { passive: true });

function openMobileNav() {
  document.getElementById('mobile-nav').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  document.getElementById('mobile-nav').classList.remove('open');
  document.body.style.overflow = '';
}

const _mobileNav = document.getElementById('mobile-nav');
if (_mobileNav) _mobileNav.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileNav();
});


/* ==========================================================================
   SCROLL-REVEAL (IntersectionObserver)
========================================================================== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .stagger')
        .forEach(el => observer.observe(el));


/* ==========================================================================
   HELPER UTILITIES
========================================================================== */
function getVal(id) { return (document.getElementById(id) || {}).value || ''; }
function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v; }

function escHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}
