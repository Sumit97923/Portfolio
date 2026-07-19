// ---------------------------------------------------
// Sumit Gupta — Portfolio interactions
// ---------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Animated network background (canvas) ---- */
  (function initBgNetwork() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w, h, dpr, nodes = [];
    const ACCENT = '255,180,84';   // amber
    const ACCENT2 = '87,217,163';  // mint
    const LINK_DIST = 150;
    const MOUSE_DIST = 180;
    const mouse = { x: -9999, y: -9999 };

    function density() {
      // fewer nodes on small screens for performance
      const area = w * h;
      return Math.min(90, Math.max(28, Math.round(area / 22000)));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth = window.innerWidth;
      h = canvas.clientHeight = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function buildNodes() {
      const count = density();
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.8,
        c: Math.random() > 0.5 ? ACCENT : ACCENT2,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      // update + draw nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.c},0.75)`;
        ctx.fill();
      }

      // links between close nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${ACCENT2},${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        // link to mouse for an interactive "signal" feel
        const dxm = nodes[i].x - mouse.x, dym = nodes[i].y - mouse.y;
        const dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < MOUSE_DIST) {
          const alpha = (1 - dm / MOUSE_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${ACCENT},${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      requestAnimationFrame(step);
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });
    window.addEventListener('mouseleave', () => {
      mouse.x = -9999; mouse.y = -9999;
    });

    resize();

    if (reduceMotion) {
      // draw a single static frame, no animation loop
      step0Static();
    } else {
      requestAnimationFrame(step);
    }

    function step0Static() {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.c},0.5)`;
        ctx.fill();
      }
    }
  })();

  /* ---- Sticky nav background on scroll ---- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );

  /* ---- Scroll reveal animation ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---- Hero chat window: typed conversation ---- */
  const chatBody = document.getElementById('chatBody');
  const script = [
    { type: 'sys',  text: 'Connecting to a new peer…' },
    { type: 'sys',  text: 'You are now chatting with a stranger.' },
    { type: 'in',   text: 'hey, who\'s this?' },
    { type: 'out',  text: 'Sumit — frontend dev, 1st year @ IERT Prayagraj.' },
    { type: 'in',   text: 'what are you building?' },
    { type: 'out',  text: 'A real-time chat app like this one, using WebSockets.' },
    { type: 'in',   text: 'nice, got a resume?' },
    { type: 'out',  text: 'scroll down ↓' },
  ];

  let i = 0;
  function playScript() {
    if (!chatBody) return;
    if (i >= script.length) {
      // pause, then restart the loop
      setTimeout(() => {
        chatBody.innerHTML = '';
        i = 0;
        playScript();
      }, 2600);
      return;
    }
    const msg = script[i];
    const bubble = document.createElement('div');
    bubble.textContent = msg.text;
    bubble.className =
      msg.type === 'sys' ? 'bubble bubble-sys' :
      msg.type === 'in'  ? 'bubble bubble-in'  : 'bubble bubble-out';
    chatBody.appendChild(bubble);
    chatBody.scrollTop = chatBody.scrollHeight;
    i++;
    setTimeout(playScript, msg.type === 'sys' ? 650 : 1000);
  }
  playScript();

  /* ---- Contact form (client-side only demo) ---- */
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent(`Portfolio message from ${data.get('name')}`);
      const body = encodeURIComponent(`${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`);
      window.location.href = `mailto:sumitg979230@gmail.com?subject=${subject}&body=${body}`;
      note.textContent = 'Opening your email client…';
      form.reset();
    });
  }

  /* ---- Smooth-scroll offset for fixed nav ---- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

});
