/* ═══════════════════════════════════════════════════
   築跡・金門建設 — main.js
   依賴：Three.js r128（在 index.html 中引入）
═══════════════════════════════════════════════════ */

/* ── CUSTOM CURSOR ────────────────────────────────── */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx - 4 + 'px';
  cursor.style.top  = my - 4 + 'px';
});

(function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursorRing.style.left = rx - 18 + 'px';
  cursorRing.style.top  = ry - 18 + 'px';
  requestAnimationFrame(animateRing);
})();

/* ── PRELOADER ────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
  }, 2800);
});

/* ── NAV SCROLL ──────────────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar')
    .classList.toggle('scrolled', window.scrollY > 80);
});

/* ── HERO PARALLAX ───────────────────────────────── */
window.addEventListener('scroll', () => {
  const bg = document.getElementById('hero-bg');
  if (bg) bg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
});

/* ── SCROLL REVEAL ───────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── THREE.JS 3D MODEL ───────────────────────────── */
(function init3D() {
  const canvas    = document.getElementById('three-canvas');
  const container = document.getElementById('canvas-container');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(4, 3, 6);
  camera.lookAt(0, 1, 0);

  /* Lighting */
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  const dirLight = new THREE.DirectionalLight(0xf5d58a, 1.2);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x8ab4f5, 0.4);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  /* Materials */
  const matGold     = new THREE.MeshStandardMaterial({ color: 0xB8973A, metalness: 0.8, roughness: 0.3 });
  const matConcrete = new THREE.MeshStandardMaterial({ color: 0x3A3A3A, metalness: 0.1, roughness: 0.9 });
  const matGlass    = new THREE.MeshStandardMaterial({ color: 0xADD8E6, metalness: 0.5, roughness: 0.1, transparent: true, opacity: 0.4 });
  const matWhite    = new THREE.MeshStandardMaterial({ color: 0xDDDDD0, metalness: 0.05, roughness: 0.8 });

  const group = new THREE.Group();

  /* Ground */
  const ground = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 8), matConcrete);
  ground.position.y = -0.05;
  group.add(ground);

  /* Podium */
  const podium = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.3, 3.5), matConcrete);
  podium.position.set(0, 0.15, 0);
  group.add(podium);

  /* Main tower */
  const tower = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2), matWhite);
  tower.position.set(0, 2, 0);
  tower.castShadow = true;
  group.add(tower);

  /* Gold floor bands */
  for (let i = 0; i < 8; i++) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 2.1), matGold);
    band.position.set(0, 0.5 + i * 0.5, 0);
    group.add(band);
  }

  /* Glass facade — front & side */
  const facadeFront = new THREE.Mesh(new THREE.BoxGeometry(1.95, 3.9, 0.05), matGlass);
  facadeFront.position.set(0, 2, 1.0);
  group.add(facadeFront);

  const facadeSide = new THREE.Mesh(new THREE.BoxGeometry(0.05, 3.9, 1.95), matGlass);
  facadeSide.position.set(1.0, 2, 0);
  group.add(facadeSide);

  /* Side wing */
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1.5), matWhite);
  wing.position.set(-1.5, 1, 0);
  group.add(wing);

  for (let i = 0; i < 4; i++) {
    const wBand = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 1.55), matGold);
    wBand.position.set(-1.5, 0.5 + i * 0.5, 0);
    group.add(wBand);
  }

  /* Roof cap + spire */
  const roofCap = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 2.2), matGold);
  roofCap.position.set(0, 4.1, 0);
  group.add(roofCap);

  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.08, 0.8, 8), matGold);
  spire.position.set(0, 4.6, 0);
  group.add(spire);

  scene.add(group);

  /* Grid */
  scene.add(new THREE.GridHelper(8, 20, 0x333333, 0x222222));

  /* Scroll-driven rotation */
  let scrollRot = 0;
  window.addEventListener('scroll', () => {
    const section = document.getElementById('model-section');
    const rect    = section.getBoundingClientRect();
    const progress = 1 - rect.bottom / (window.innerHeight + rect.height);
    scrollRot = progress * Math.PI * 2;
  });

  /* Mouse-drag rotation */
  let isDragging = false, prevX = 0, prevY = 0;
  let dragRotX = 0, dragRotY = 0;

  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
  });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    dragRotY += (e.clientX - prevX) * 0.01;
    dragRotX += (e.clientY - prevY) * 0.005;
    dragRotX  = Math.max(-0.5, Math.min(0.5, dragRotX));
    prevX = e.clientX;
    prevY = e.clientY;
  });

  /* Touch drag */
  let touchPrevX = 0, touchPrevY = 0;
  canvas.addEventListener('touchstart', e => {
    touchPrevX = e.touches[0].clientX;
    touchPrevY = e.touches[0].clientY;
  });
  canvas.addEventListener('touchmove', e => {
    dragRotY += (e.touches[0].clientX - touchPrevX) * 0.01;
    dragRotX += (e.touches[0].clientY - touchPrevY) * 0.005;
    dragRotX  = Math.max(-0.5, Math.min(0.5, dragRotX));
    touchPrevX = e.touches[0].clientX;
    touchPrevY = e.touches[0].clientY;
  });

  /* Scroll-wheel zoom */
  let zoom = 1;
  canvas.addEventListener('wheel', e => {
    zoom = Math.max(0.5, Math.min(2, zoom + e.deltaY * -0.001));
    e.preventDefault();
  }, { passive: false });

  /* Render loop */
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.005;
    group.rotation.y = scrollRot + dragRotY + Math.sin(time * 0.3) * 0.1;
    group.rotation.x = dragRotX;
    camera.position.setLength(7 / zoom);
    renderer.render(scene, camera);
  }
  animate();

  /* Resize */
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();

/* ── PROJECT FILTER ──────────────────────────────── */
function filterProjects(type, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.project-card').forEach(card => {
    card.style.display = (type === 'all' || card.dataset.type === type) ? '' : 'none';
  });
}

/* ── PROJECT MODAL ───────────────────────────────── */
function openModal(name, loc, year, tag, img, size, price) {
  document.getElementById('modal-name').textContent  = name;
  document.getElementById('modal-loc').textContent   = loc;
  document.getElementById('modal-year').textContent  = year;
  document.getElementById('modal-tag').textContent   = tag;
  document.getElementById('modal-img').src           = img;
  document.getElementById('modal-size').textContent  = size;
  document.getElementById('modal-price').textContent = price;
  document.getElementById('project-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('project-modal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── APPOINTMENT MODAL ───────────────────────────── */
function openAppt() {
  document.getElementById('appt-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeAppt() {
  document.getElementById('appt-modal').classList.remove('open');
  document.body.style.overflow = '';
}
function submitAppt() {
  closeAppt();
  const current = parseInt(document.getElementById('appt-count').textContent) || 0;
  countUp('appt-count', current + 1);
  showToast('✓ 預約成功！我們將盡快與您聯繫。');
}

/* ── CONTACT FORM ────────────────────────────────── */
function submitForm() {
  const current = parseInt(document.getElementById('inquiry-count').textContent) || 0;
  countUp('inquiry-count', current + 1);
  showToast('✓ 諮詢已送出，我們將於24小時內回覆。');
}

/* ── ADMIN PANEL ─────────────────────────────────── */
function toggleAdmin() {
  const panel = document.getElementById('admin-panel');
  panel.classList.toggle('open');

  if (panel.classList.contains('open')) {
    countUp('visit-count',    3842);
    countUp('inquiry-count',    47);
    countUp('appt-count',       23);
    countUp('download-count',  156);

    setTimeout(() => {
      document.querySelectorAll('.chart-fill').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
    }, 300);
  }
}

/* ── COUNT-UP ANIMATION ──────────────────────────── */
function countUp(id, target) {
  const el        = document.getElementById(id);
  const duration  = 1200;
  const start     = parseInt(el.textContent) || 0;
  const startTime = performance.now();

  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * ease);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ── GOOGLE MAP FOCUS ────────────────────────────── */
function focusMap(lat, lng) {
  document.getElementById('map-iframe').src =
    `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1szh-TW!2stw!4v1700000000000!5m2!1szh-TW!2stw`;
}

/* ── TOAST NOTIFICATION ──────────────────────────── */
function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = [
    'position:fixed',
    'bottom:6rem',
    'left:50%',
    'transform:translateX(-50%)',
    'background:var(--gold)',
    'color:#1A1A1A',
    'padding:1rem 2rem',
    'font-size:0.85rem',
    'font-family:"Noto Sans TC",sans-serif',
    'z-index:9999',
    'letter-spacing:0.1em',
    'box-shadow:0 4px 20px rgba(0,0,0,0.4)',
    'transition:opacity 0.5s'
  ].join(';');
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

/* ── LIVE PAGE-VIEW COUNTER (demo) ───────────────── */
let pageViews = 3841;
setInterval(() => {
  if (Math.random() > 0.7) {
    pageViews++;
    const el    = document.getElementById('visit-count');
    const panel = document.getElementById('admin-panel');
    if (el && panel && panel.classList.contains('open')) {
      el.textContent = pageViews;
    }
  }
}, 5000);

/* ── KEYBOARD CLOSE MODALS ───────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeAppt();
    document.getElementById('admin-panel').classList.remove('open');
  }
});
