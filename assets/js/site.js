// Preloader
(function () {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const text = preloader.querySelector('.preloader-text');
  const loadStart = performance.now();
  const sleep = ms => new Promise(r => setTimeout(r, ms * speed));
  const variants = ['a', 'd'];
  let speed = 1;
  const chosen = variants[Math.floor(Math.random() * variants.length)];
  preloader.classList.add('variant-' + chosen);

  function removePreloader() {
    preloader.style.transition = 'none';
    preloader.style.opacity = '0';
    setTimeout(() => preloader.remove(), 100);
  }

  // ── VARIANT A: VHS Boot ──
  async function runA() {
    text.style.opacity = '0';
    const lines = [
      { label: 'SYS', text: 'BOOT SEQUENCE INITIATED' },
      { label: 'VID', text: 'VIDEO DRIVER................' },
      { label: 'AUD', text: 'AUDIO SUBSYSTEM.............' },
      { label: 'NET', text: 'NETWORK INTERFACE...........' },
      { label: 'MEM', text: 'ALLOCATING MEMORY...........' },
      { label: 'AST', text: 'LOADING ASSETS..............' },
      { label: 'RDR', text: 'RENDERER READY..............' },
    ];
    const container = document.createElement('div');
    container.className = 'preloader-boot-lines';
    preloader.insertBefore(container, text);

    for (const line of lines) {
      const el = document.createElement('div');
      el.className = 'preloader-boot-line';
      el.innerHTML = `<span class="bl-label">[${line.label}]</span><span>${line.text}</span><span class="bl-ok">OK</span>`;
      container.appendChild(el);
      el.style.opacity = '1';
      await sleep(110);
    }

    await sleep(150);
    text.textContent = 'I AM JON\nDUNCAN';
    text.innerHTML = 'I AM JON<br>DUNCAN<span class="preloader-cursor"></span>';
    text.style.opacity = '1';
    await sleep(1000);

    // Flicker then hard cut
    for (let i = 0; i < 3; i++) {
      preloader.style.opacity = '0';
      await sleep(40);
      preloader.style.opacity = '1';
      await sleep(60);
    }
    removePreloader();
  }

  // ── VARIANT D: Glitch Cut ──
  async function runD() {
    const originalText = '1 SEC...';
    text.setAttribute('data-text', originalText);
    await sleep(800);

    // Text corruption
    const chars = '!@#$%^&*<>?/\\|[]{}01';
    const corruptInterval = setInterval(() => {
      const corrupted = originalText.split('').map(c =>
        c === ' ' ? ' ' : (Math.random() < 0.6 ? chars[Math.floor(Math.random() * chars.length)] : c)
      ).join('');
      text.textContent = corrupted;
      text.setAttribute('data-text', corrupted);
    }, 60);
    await sleep(300);
    clearInterval(corruptInterval);

    text.textContent = originalText;
    text.setAttribute('data-text', originalText);
    text.classList.add('glitching');
    await sleep(400);

    // Screen tears
    const tears = [];
    for (let i = 0; i < 6; i++) {
      const tear = document.createElement('div');
      tear.className = 'pl-tear';
      const h = Math.floor(Math.random() * 80) + 20;
      const y = Math.floor(Math.random() * (window.innerHeight - h));
      tear.style.cssText = `top:${y}px;height:${h}px;transform:translateX(${(Math.random()-0.5)*80}px)`;
      document.body.appendChild(tear);
      tears.push(tear);
    }
    await sleep(80);

    // Flash then hard cut
    preloader.style.background = '#fff';
    await sleep(40);
    preloader.style.background = '#00FF41';
    await sleep(40);
    tears.forEach(t => t.remove());
    text.classList.remove('glitching');
    removePreloader();
  }

  window.addEventListener('load', () => {
    speed = (performance.now() - loadStart) < 1000 ? 0.5 : 1;
    if (chosen === 'a') runA();
    else runD();
  });
})();

// Hamburger nav
const hamburger = document.querySelector('.nav-hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// Work items -> detail page (static routing)
document.querySelectorAll('.work-item').forEach(item => {
  if (item.closest('a')) return;
  item.style.cursor = 'pointer';
  item.addEventListener('click', () => {
    const target = item.dataset.url || 'work-detail.html';
    window.location.href = target;
  });
});

const shuffleTargets = document.querySelectorAll(
  '.work-title, .hero-vhs-label, .statement-headline, .nav-logo, .showreel-caption-title, .footer-logo, .about-name, .service-title, .script-name, .contact-headline, .client-pill'
);
const shuffleConfig = {
  shuffleDirection: 'right',
  duration: 0.35,
  animationMode: 'evenodd',
  shuffleTimes: 1,
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)', // close to power3.out
  stagger: 0.03,
  threshold: 0.1,
  triggerOnce: true,
  triggerOnHover: true,
  respectReducedMotion: true,
  loop: false,
  loopDelay: 0,
  scrambleCharset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
};

const reduceMotion =
  shuffleConfig.respectReducedMotion &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function randomFrom(set) {
  return set.charAt(Math.floor(Math.random() * set.length));
}

function cleanupShuffle(el) {
  if (el._shuffleEndTimer) {
    clearTimeout(el._shuffleEndTimer);
    el._shuffleEndTimer = null;
  }
  if (el._shuffleLoopTimer) {
    clearTimeout(el._shuffleLoopTimer);
    el._shuffleLoopTimer = null;
  }
  if (Array.isArray(el._shuffleAnimations)) {
    el._shuffleAnimations.forEach(anim => anim.cancel());
    el._shuffleAnimations = null;
  }
  const original = el.dataset.shuffleOriginal;
  if (original != null) {
    el.textContent = original;
    el.style.whiteSpace = original.includes('\n') ? 'pre-line' : '';
  }
}

function buildShuffleStrips(el) {
  const original = el.dataset.shuffleOriginal;
  if (!original) return [];

  const direction = shuffleConfig.shuffleDirection;
  const isVertical = direction === 'up' || direction === 'down';
  const steps = Math.max(1, Math.floor(shuffleConfig.shuffleTimes)) + 1;
  const chars = Array.from(original);
  const strips = [];
  let spaceWidth = null;

  function getSpaceWidth() {
    if (spaceWidth !== null) return spaceWidth;
    const probe = document.createElement('span');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.whiteSpace = 'pre';
    probe.textContent = ' ';
    el.appendChild(probe);
    spaceWidth = Math.max(1, probe.getBoundingClientRect().width);
    probe.remove();
    return spaceWidth;
  }

  el.textContent = '';
  el.style.whiteSpace = original.includes('\n') ? 'pre-line' : '';

  chars.forEach(ch => {
    if (ch === '\n') {
      el.appendChild(document.createElement('br'));
      return;
    }
    if (ch === ' ') {
      const space = document.createElement('span');
      space.className = 'shuffle-space';
      space.textContent = '\u00A0';
      space.style.width = `${getSpaceWidth()}px`;
      space.style.flex = '0 0 auto';
      el.appendChild(space);
      return;
    }

    const wrap = document.createElement('span');
    wrap.className = 'shuffle-char-wrapper';
    wrap.textContent = ch;
    el.appendChild(wrap);
    strips.push({ wrap, char: ch });
  });

  strips.forEach(item => {
    const rect = item.wrap.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    item.wrap.style.width = `${width}px`;
    item.wrap.style.height = `${height}px`;

    const strip = document.createElement('span');
    strip.className = `shuffle-char-strip${isVertical ? ' is-vertical' : ''}`;

    const sequence = [item.char];
    for (let i = 0; i < steps - 1; i++) {
      sequence.push(
        shuffleConfig.scrambleCharset
          ? randomFrom(shuffleConfig.scrambleCharset)
          : item.char
      );
    }
    sequence.push(item.char);

    sequence.forEach(val => {
      const cell = document.createElement('span');
      cell.className = 'shuffle-char-cell';
      cell.textContent = val;
      cell.style.height = `${height}px`;
      strip.appendChild(cell);
    });

    item.wrap.replaceChildren(strip);
    item.strip = strip;
    item.distance = sequence.length - 1;
  });

  return strips;
}

function getDelayMs(index, total) {
  const staggerMs = shuffleConfig.stagger * 1000;
  if (shuffleConfig.animationMode !== 'evenodd') return Math.random() * 120;

  const oddCount = Math.floor(total / 2);
  if (index % 2 === 1) return Math.floor(index / 2) * staggerMs;
  return oddCount * staggerMs * 0.7 + Math.floor(index / 2) * staggerMs;
}

function playShuffle(el) {
  if (reduceMotion || el._shuffleRunning) return;
  const original = el.dataset.shuffleOriginal;
  if (!original) return;

  cleanupShuffle(el);
  const strips = buildShuffleStrips(el);
  if (!strips.length) return;

  el._shuffleRunning = true;
  el._shuffleAnimations = [];

  const direction = shuffleConfig.shuffleDirection;
  const isVertical = direction === 'up' || direction === 'down';
  let maxEndMs = 0;

  strips.forEach((item, idx) => {
    const percent = item.distance * 100;
    let fromTransform = 'translate3d(0,0,0)';
    let toTransform = 'translate3d(0,0,0)';

    if (!isVertical && direction === 'right') {
      fromTransform = `translate3d(-${percent}%,0,0)`;
      toTransform = 'translate3d(0,0,0)';
    } else if (!isVertical && direction === 'left') {
      fromTransform = 'translate3d(0,0,0)';
      toTransform = `translate3d(-${percent}%,0,0)`;
    } else if (isVertical && direction === 'down') {
      fromTransform = `translate3d(0,-${percent}%,0)`;
      toTransform = 'translate3d(0,0,0)';
    } else if (isVertical && direction === 'up') {
      fromTransform = 'translate3d(0,0,0)';
      toTransform = `translate3d(0,-${percent}%,0)`;
    }

    const delay = getDelayMs(idx, strips.length);
    const duration = shuffleConfig.duration * 1000;
    maxEndMs = Math.max(maxEndMs, delay + duration);

    const animation = item.strip.animate(
      [{ transform: fromTransform }, { transform: toTransform }],
      {
        duration,
        delay,
        easing: shuffleConfig.ease,
        fill: 'forwards'
      }
    );
    el._shuffleAnimations.push(animation);
  });

  el._shuffleEndTimer = setTimeout(() => {
    el._shuffleRunning = false;
    cleanupShuffle(el);
    if (shuffleConfig.loop) {
      el._shuffleLoopTimer = setTimeout(() => playShuffle(el), shuffleConfig.loopDelay * 1000);
    }
  }, maxEndMs + 30);
}

shuffleTargets.forEach((el, idx) => {
  const original = el.innerText.replace(/\r/g, '');
  if (!original.trim()) return;
  el.dataset.shuffleOriginal = original;
  el.style.whiteSpace = original.includes('\n') ? 'pre-line' : '';

  if (shuffleConfig.triggerOnHover) {
    el.addEventListener('mouseenter', () => playShuffle(el));
    el.addEventListener('focus', () => playShuffle(el));
  }

  if (!reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        setTimeout(() => playShuffle(el), 180 + idx * 110);
        if (shuffleConfig.triggerOnce) observer.unobserve(el);
      });
    }, { threshold: shuffleConfig.threshold });
    observer.observe(el);
  }
});

// Clients section invert lens
const clientsStrip = document.querySelector('.clients-strip');
const clientsLens = document.querySelector('.clients-invert-lens');
const supportsHover = window.matchMedia('(hover: hover)').matches;

if (clientsStrip && clientsLens && supportsHover) {
  const state = { x: -9999, y: -9999, tx: -9999, ty: -9999, raf: 0 };

  function updateLens() {
    state.tx += (state.x - state.tx) * 0.18;
    state.ty += (state.y - state.ty) * 0.18;
    clientsLens.style.transform = `translate3d(${state.tx}px, ${state.ty}px, 0)`;
    state.raf = requestAnimationFrame(updateLens);
  }

  function onMove(event) {
    const rect = clientsStrip.getBoundingClientRect();
    state.x = event.clientX - rect.left - clientsLens.offsetWidth / 2;
    state.y = event.clientY - rect.top - clientsLens.offsetHeight / 2;
  }

  clientsStrip.addEventListener('mouseenter', event => {
    const rect = clientsStrip.getBoundingClientRect();
    state.x = event.clientX - rect.left - clientsLens.offsetWidth / 2;
    state.y = event.clientY - rect.top - clientsLens.offsetHeight / 2;
    state.tx = state.x;
    state.ty = state.y;
    clientsStrip.classList.add('is-lens-active');
    if (!state.raf) state.raf = requestAnimationFrame(updateLens);
  });

  clientsStrip.addEventListener('mousemove', onMove);

  clientsStrip.addEventListener('mouseleave', () => {
    clientsStrip.classList.remove('is-lens-active');
    state.x = state.tx;
    state.y = state.ty;
    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }
  });
}
