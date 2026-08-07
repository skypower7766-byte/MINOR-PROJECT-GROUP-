/* ============================================
   SKILLSWAP CAMPUS — SCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- AOS -------- */
  if (window.AOS) {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: reduceMotion
    });
  }

  /* -------- GSAP ScrollTrigger -------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Timeline progress fill
    const fill = document.getElementById('timelineFill');
    if (fill) {
      gsap.to(fill, {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.timeline',
          start: 'top 75%',
          end: 'bottom 60%',
          scrub: 1
        }
      });
    }

    // Subtle parallax on blobs while scrolling
    gsap.utils.toArray('.blob').forEach((blob, i) => {
      gsap.to(blob, {
        y: (i % 2 === 0 ? 80 : -80),
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.4
        }
      });
    });
  }

  /* -------- Navbar scroll state -------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* -------- Mobile menu -------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  navToggle?.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    navToggle.classList.toggle('active');
  });
  mobileMenu?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  /* -------- Cursor glow -------- */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && !reduceMotion && matchMedia('(pointer: fine)').matches) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    const raf = () => {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      cursorGlow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(raf);
    };
    raf();
  } else if (cursorGlow) {
    cursorGlow.style.display = 'none';
  }

  /* -------- Mouse parallax on hero swap stage (corner cards only) -------- */
  const swapStage = document.getElementById('swapStage');
  const centerCard = document.getElementById('centerCard');

  if (swapStage && !reduceMotion && matchMedia('(pointer: fine)').matches) {
    // Corner cards: gentle depth-based parallax, center circle is handled separately below
    const cards = swapStage.querySelectorAll('.swap-card:not(#centerCard)');

    swapStage.addEventListener('mousemove', (e) => {
      const rect = swapStage.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      gsapNudge(cards, px, py);
    });
    swapStage.addEventListener('mouseleave', () => {
      gsapNudge(cards, 0, 0);
    });
  }

  function gsapNudge(cards, px, py) {
    if (!window.gsap) return;
    cards.forEach((card, i) => {
      const depth = (i + 1) * 5;
      gsap.to(card, { x: px * depth, y: py * depth, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    });
  }

  /* -------- Center "Swap" circle: follows the cursor directly -------- */
  if (swapStage && centerCard && !reduceMotion && matchMedia('(pointer: fine)').matches) {
    const maxOffset = 55; // keeps the circle anchored near its bottom-right spot instead of wandering off

    swapStage.addEventListener('mousemove', (e) => {
      const cardRect = centerCard.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;

      let dx = (e.clientX - cardCenterX) * 0.4;
      let dy = (e.clientY - cardCenterY) * 0.4;
      dx = Math.max(-maxOffset, Math.min(maxOffset, dx));
      dy = Math.max(-maxOffset, Math.min(maxOffset, dy));

      if (window.gsap) {
        gsap.to(centerCard, { x: dx, y: dy, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
      } else {
        centerCard.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    });

    swapStage.addEventListener('mouseleave', () => {
      if (window.gsap) {
        gsap.to(centerCard, { x: 0, y: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
      } else {
        centerCard.style.transform = 'translate(0,0)';
      }
    });
  }

  /* -------- Magnetic buttons -------- */
  if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  /* -------- Vanilla Tilt on cards -------- */
  if (window.VanillaTilt && !reduceMotion && matchMedia('(pointer: fine)').matches) {
    VanillaTilt.init(document.querySelectorAll('.tilt-card'), {
      max: 10,
      speed: 400,
      glare: true,
      'max-glare': 0.15,
      scale: 1.03
    });
  }

  /* -------- Animated counters -------- */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(tick);
  }

  /* -------- Testimonial carousel: duplicate track for seamless loop -------- */
  const track = document.getElementById('carouselTrack');
  if (track) {
    track.innerHTML += track.innerHTML;
  }

  /* -------- Particle background -------- */
  const canvas = document.getElementById('particles');
  if (canvas) initParticles(canvas, reduceMotion);

  function initParticles(canvas, reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    const colors = ['#4F46E5', '#7C3AED', '#06B6D4', '#22C55E'];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 22000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2
    }));

    if (reduceMotion) {
      draw();
      return;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* -------- Smooth anchor scroll offset for fixed navbar -------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const offset = target.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }
    });
  });

});