(() => {
  'use strict';

  document.documentElement.classList.add('no-scroll');
  document.body.classList.add('pre-reveal');

  /* ============================================================
     LOADER — progreso simulado + salida en "cortina"
     ============================================================ */
  const loader = document.getElementById('loader');
  const ldFill = document.getElementById('ldFill');
  const ldEmbers = document.getElementById('ldEmbers');

  // brasas subiendo dentro del loader
  if (ldEmbers) {
    const N = 26;
    for (let i = 0; i < N; i++) {
      const s = document.createElement('span');
      const left = Math.random() * 100;
      const size = 3 + Math.random() * 5;
      const dur = 3 + Math.random() * 3.5;
      const delay = Math.random() * 4;
      const drift = (Math.random() * 80 - 40) + 'px';
      s.style.left = left + '%';
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.animationDuration = dur + 's';
      s.style.animationDelay = delay + 's';
      s.style.setProperty('--drift', drift);
      ldEmbers.appendChild(s);
    }
  }

  let progress = 0;
  const minDuration = 2800; // impacto: no debe sentirse instantáneo
  const startTime = performance.now();

  function tickProgress() {
    const elapsed = performance.now() - startTime;
    const target = Math.min(96, (elapsed / minDuration) * 100);
    progress += (target - progress) * 0.12;
    if (ldFill) ldFill.style.width = Math.min(progress, 96) + '%';
    if (elapsed < minDuration + 600) {
      requestAnimationFrame(tickProgress);
    }
  }
  requestAnimationFrame(tickProgress);

  function finishLoader() {
    if (ldFill) ldFill.style.width = '100%';
    setTimeout(() => {
      loader.classList.add('ld-exit');
      document.body.classList.remove('pre-reveal');
      document.body.classList.add('revealed');
      document.documentElement.classList.remove('no-scroll');
      setTimeout(() => {
        loader.classList.add('ld-hide');
        heroEntrance();
      }, 1050);
    }, 260);
  }

  window.addEventListener('load', () => {
    const elapsed = performance.now() - startTime;
    const wait = Math.max(0, minDuration - elapsed);
    setTimeout(finishLoader, wait);
  });
  // salvaguarda por si "load" tarda demasiado
  setTimeout(finishLoader, 6500);

  function heroEntrance() {
    document.querySelectorAll('#hero .rev').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), 80 * i);
    });
  }

  /* ============================================================
     NAV — scroll state + menú móvil
     ============================================================ */
  const nav = document.getElementById('nav');
  const onScrollNav = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  const ham = document.getElementById('ham');
  const mob = document.getElementById('mob');
  function closeMob() {
    ham.classList.remove('open');
    mob.classList.remove('open');
    ham.setAttribute('aria-expanded', 'false');
  }
  if (ham && mob) {
    ham.addEventListener('click', () => {
      const open = mob.classList.toggle('open');
      ham.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', String(open));
    });
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMob));
  }

  /* ============================================================
     SCROLL REVEAL — títulos, subtítulos y tarjetas
     ============================================================ */
  const revEls = document.querySelectorAll('.rev, .heading, .sub');
  revEls.forEach(el => { if (!el.classList.contains('rev')) el.classList.add('rev'); });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.rev').forEach(el => io.observe(el));

  /* ============================================================
     CONTADORES (hero + about)
     ============================================================ */
  function animateCount(el, target, opts = {}) {
    const prefix = opts.prefix || '';
    const suffix = opts.suffix || '';
    const dur = 1600;
    const start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const countTargets = [
    ...document.querySelectorAll('[data-hero-count]'),
    ...document.querySelectorAll('[data-count]')
  ];
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.dataset.heroCount ?? el.dataset.count;
      const target = parseInt(raw, 10);
      if (!isNaN(target)) {
        animateCount(el, target, { prefix: el.dataset.prefix || '', suffix: el.dataset.suffix || '' });
      }
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  countTargets.forEach(el => countIO.observe(el));

  /* ============================================================
     HERO — título con efecto máquina de escribir (palabra acento)
     ============================================================ */
  const accentEl = document.getElementById('accentCycle');
  if (accentEl) {
    const words = ['Como Lo Prefieras', 'Al Carbón', 'Con Sabor de Barrio'];
    let wi = 0;
    let typing = true;

    function typeLoop() {
      const word = words[wi];
      let ci = accentEl.dataset.ci ? parseInt(accentEl.dataset.ci, 10) : 0;

      if (typing) {
        ci++;
        accentEl.textContent = word.slice(0, ci);
        if (ci >= word.length) {
          accentEl.dataset.ci = ci;
          typing = false;
          setTimeout(typeLoop, 2100);
          return;
        }
      } else {
        ci--;
        accentEl.textContent = word.slice(0, ci);
        if (ci <= 0) {
          typing = true;
          wi = (wi + 1) % words.length;
          accentEl.dataset.ci = 0;
          setTimeout(typeLoop, 420);
          return;
        }
      }
      accentEl.dataset.ci = ci;
      setTimeout(typeLoop, typing ? 78 : 38);
    }
    setTimeout(typeLoop, 1600);
  }

  /* ============================================================
     PARTÍCULAS — canvas de brasas en el hero
     ============================================================ */
  const canvas = document.getElementById('pcanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let W, H, particles;
    const COUNT = window.innerWidth < 700 ? 26 : 48;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    function makeParticle() {
      return {
        x: Math.random() * W,
        y: H + Math.random() * 100,
        r: 1 + Math.random() * 2.6,
        vy: 0.35 + Math.random() * 0.9,
        vx: (Math.random() - 0.5) * 0.4,
        alpha: 0.15 + Math.random() * 0.55,
        hue: Math.random() > 0.5 ? '214,162,74' : '199,91,41'
      };
    }
    function init() {
      resize();
      particles = Array.from({ length: COUNT }, () => {
        const p = makeParticle();
        p.y = Math.random() * H;
        return p;
      });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.y -= p.vy;
        p.x += p.vx + Math.sin(p.y * 0.01) * 0.15;
        if (p.y < -10) Object.assign(p, makeParticle(), { y: H + 10 });
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    init();
    draw();
    window.addEventListener('resize', resize);
  }

  /* ============================================================
     PARTÍCULAS — polvo flotante CSS en varias secciones
     ============================================================ */
  function seedParticles(container, count) {
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      const size = 2 + Math.random() * 4;
      s.style.left = Math.random() * 100 + '%';
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.animationDuration = (7 + Math.random() * 9) + 's';
      s.style.animationDelay = (Math.random() * 8) + 's';
      s.style.setProperty('--driftx', (Math.random() * 60 - 30) + 'px');
      container.appendChild(s);
    }
  }
  ['nosotros', 'porque', 'contacto'].forEach(id => {
    const sec = document.getElementById(id);
    if (!sec) return;
    sec.style.position = sec.style.position || 'relative';
    const holder = document.createElement('div');
    holder.className = 'section-particles';
    sec.prepend(holder);
    seedParticles(holder, window.innerWidth < 700 ? 8 : 14);
  });

  /* ============================================================
     SCROLL SUAVE — solo al hacer clic en enlaces internos
     (evita que el scroll normal con mouse/trackpad se sienta "brincado")
     ============================================================ */
  const navHeight = 90;
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================================================
     FORMULARIO — arma el pedido y abre WhatsApp
     ============================================================ */
  const form = document.getElementById('cForm');
  const WHATSAPP_NUMBER = '526648532821';

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = form.nombre.value.trim();
      const telefono = form.telefono.value.trim();
      const sabor = form.sabor.value;
      const cantidad = form.cantidad.value;
      const entrega = form.entrega.value;
      const direccion = form.direccion.value.trim();
      const mensaje = form.mensaje.value.trim();

      if (!nombre || !telefono || !sabor || !entrega) {
        form.reportValidity();
        return;
      }

      let text = `Hola, quiero pedir pollo asado 🔥\n\n`;
      text += `*Nombre:* ${nombre}\n`;
      text += `*Teléfono:* ${telefono}\n`;
      text += `*Producto:* ${sabor}\n`;
      text += `*Cantidad:* ${cantidad}\n`;
      text += `*Entrega:* ${entrega}\n`;
      if (direccion) text += `*Dirección/Zona:* ${direccion}\n`;
      if (mensaje) text += `*Comentarios:* ${mensaje}\n`;

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

})();
