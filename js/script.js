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

  /* -------- Hero info cards: ONE card at a time, slides LEFT to RIGHT, stops on hover -------- */
  const cardsTrack = document.getElementById('cardsTrack');
  const cardSlider = document.getElementById('cardSlider');
  const cardDots   = document.getElementById('cardDots');

  if (cardsTrack && cardSlider) {
    const DELAY = 4500;   // how long each card stays (milliseconds)
    const SPEED = 900;    // how long the slide takes (milliseconds)

    const cards = Array.from(cardsTrack.children);   // card 1..N in the order written in the HTML
    const total = cards.length;

    // Put the cards in reverse order, plus a copy of card 1 on the far left,
    // so moving the track to the right shows card 1, 2, 3 ... one after another.
    const lead = cards[0].cloneNode(true);
    lead.setAttribute('aria-hidden', 'true');
    cardsTrack.innerHTML = '';
    [lead, ...cards.slice().reverse()].forEach(el => cardsTrack.appendChild(el));

    const posOf = k => total - k;       // position of card k inside the track
    cardSlider.classList.add('anim-ready');   // turns on the card entrance animation (see style.css)
    let current = 0;
    let busy = false;
    let hovered = false;
    let timer = null;

    function setPos(pos, animate) {
      cardsTrack.style.transition = animate ? `transform ${SPEED}ms cubic-bezier(.16,.84,.44,1)` : 'none';
      cardsTrack.style.transform = `translateX(calc(${-pos * 100}% - ${pos} * var(--card-gap)))`;
    }

    // dots
    const dots = [];
    if (cardDots) {
      cards.forEach((_, k) => {
        const d = document.createElement('button');
        d.type = 'button';
        d.setAttribute('aria-label', 'Show card ' + (k + 1));
        d.addEventListener('click', () => goTo(k));
        cardDots.appendChild(d);
        dots.push(d);
      });
    }
    function updateDots() {
      dots.forEach((d, k) => d.classList.toggle('active', k === current));
    }

    // Marks the shown card as active so its animation plays.
    // The old card keeps its look until it has slid out of view.
    let activeToken = 0;
    function setActive(k) {
      const token = ++activeToken;
      const incoming = [cards[k]];
      if (k === 0) incoming.push(lead);       // card 1 also exists as a copy on the far left
      incoming.forEach(el => el.classList.add('is-active'));
      setTimeout(() => {
        if (token !== activeToken) return;    // a newer card has taken over
        [lead, ...cards].forEach(el => { if (!incoming.includes(el)) el.classList.remove('is-active'); });
      }, SPEED + 60);
    }

    function goTo(k) {
      if (busy || k === current) return;
      busy = true;
      current = k;
      setPos(posOf(k), true);
      updateDots();
      setActive(k);
      setTimeout(() => { busy = false; }, SPEED);
    }

    function next() {
      if (busy) return;
      if (current === total - 1) {
        // last card: slide on to the copy of card 1, then jump back quietly
        busy = true;
        current = 0;
        setPos(0, true);
        updateDots();
        setActive(0);
        setTimeout(() => { setPos(posOf(0), false); busy = false; }, SPEED + 40);
      } else {
        goTo(current + 1);
      }
    }

    function schedule() {
      clearTimeout(timer);
      if (hovered || document.hidden) return;
      timer = setTimeout(() => { next(); schedule(); }, DELAY);
    }
    function pause() { clearTimeout(timer); timer = null; }

    cardSlider.addEventListener('mouseenter', () => { hovered = true;  pause(); });
    cardSlider.addEventListener('mouseleave', () => { hovered = false; schedule(); });
    cardSlider.addEventListener('touchstart', () => { hovered = true;  pause(); }, { passive: true });
    cardSlider.addEventListener('touchend',   () => { hovered = false; schedule(); }, { passive: true });
    cardSlider.addEventListener('touchcancel',() => { hovered = false; schedule(); }, { passive: true });
    document.addEventListener('visibilitychange', () => { document.hidden ? pause() : schedule(); });

    setPos(posOf(0), false);
    updateDots();
    setActive(0);
    schedule();
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
    const colors = ['#2DD4BF', '#A7F3D0', '#E8C170', '#F3D898'];

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