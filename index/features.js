/* ============================================
   FEATURES PAGE — DEDICATED SCRIPT
   Hand-built visualizations: an orbit chart (SVG + JS trig,
   laid out in real pixels via ResizeObserver so nodes and
   lines always stay inside the stage — no viewBox guessing),
   a bar equalizer, and animated progress rings.
   No charting library used.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------
     1) ORBIT CHART — feature usage as gravity
     All six nodes sit on ONE true circle around the core —
     that's what actually reads as "arranged in a circle."
     Usage is instead encoded through node size, line
     thickness, and a visible percentage badge, so the data
     is still there without distorting the circle itself.
     Positions are computed in real pixels against the
     stage's current size, and recomputed on resize.
  --------------------------------------------- */
  const FEATURES = [
    { name: 'Verified Profiles', icon: 'fa-shield-halved', usage: 92 },
    { name: 'Skill Matching',    icon: 'fa-wand-magic-sparkles', usage: 88 },
    { name: 'Real-Time Chat',    icon: 'fa-comments', usage: 81 },
    { name: 'Badges',            icon: 'fa-trophy', usage: 74 },
    { name: 'Certificates',      icon: 'fa-certificate', usage: 63 },
    { name: 'Campus Circles',    icon: 'fa-people-group', usage: 58 }
  ];

  const orbitStage = document.getElementById('orbitStage');
  const orbitSvg = document.getElementById('orbitSvg');
  const orbitNodesEl = document.getElementById('orbitNodes');
  const orbitReadout = document.getElementById('orbitReadout');

  if (orbitStage && orbitSvg && orbitNodesEl) {
    const ns = 'http://www.w3.org/2000/svg';
    const usages = FEATURES.map(f => f.usage);
    const minU = Math.min(...usages), maxU = Math.max(...usages);

    // One fixed radius for every node — this is what actually
    // guarantees a clean, even circle at any screen size.
    const RING_FRAC = 0.335;
    // Node size still reflects usage, just via scale, not distance.
    const MIN_NODE_FRAC = 0.175;
    const MAX_NODE_FRAC = 0.215;

    let nodeEls = [];
    let linkEls = [];
    let ringGuide = null;
    let hasRevealed = false;
    let built = false;

    const usageT = (usage) => (usage - minU) / (maxU - minU || 1);

    const buildOnce = () => {
      if (built) return;
      built = true;

      const defs = document.createElementNS(ns, 'defs');
      defs.innerHTML = `
        <linearGradient id="orbitLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4F46E5"/>
          <stop offset="50%" stop-color="#7C3AED"/>
          <stop offset="100%" stop-color="#06B6D4"/>
        </linearGradient>`;
      orbitSvg.appendChild(defs);

      // one faint dashed guide ring, exactly where every node sits
      ringGuide = document.createElementNS(ns, 'circle');
      ringGuide.setAttribute('class', 'orbit-ring');
      orbitSvg.appendChild(ringGuide);

      linkEls = FEATURES.map((f) => {
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('class', 'orbit-link');
        line.style.strokeWidth = (1.2 + usageT(f.usage) * 1.6).toFixed(2);
        orbitSvg.appendChild(line);
        return line;
      });

      nodeEls = FEATURES.map((f) => {
        const el = document.createElement('div');
        el.className = 'orbit-node';
        el.innerHTML = `
          <i class="fa-solid ${f.icon}"></i>
          <span>${f.name}</span>
          <b class="orbit-node-pct">${f.usage}%</b>`;
        el.addEventListener('click', () => {
          nodeEls.forEach(n => n.classList.remove('active'));
          el.classList.add('active');
          orbitReadout.innerHTML = `<span><strong>${f.name}</strong> — used by ${f.usage}% of active students this week</span>`;
        });
        orbitNodesEl.appendChild(el);
        return el;
      });
    };

    const layout = () => {
      const size = orbitStage.clientWidth;
      if (!size) return;

      orbitSvg.setAttribute('viewBox', `0 0 ${size} ${size}`);
      const cx = size / 2, cy = size / 2;
      const ringR = size * RING_FRAC;

      ringGuide.setAttribute('cx', cx);
      ringGuide.setAttribute('cy', cy);
      ringGuide.setAttribute('r', ringR);

      FEATURES.forEach((f, i) => {
        const angle = (-90 + i * (360 / FEATURES.length)) * (Math.PI / 180);
        const x = cx + ringR * Math.cos(angle);
        const y = cy + ringR * Math.sin(angle);

        const line = linkEls[i];
        line.setAttribute('x1', cx); line.setAttribute('y1', cy);
        line.setAttribute('x2', x); line.setAttribute('y2', y);

        const node = nodeEls[i];
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        const nodeSize = size * (MIN_NODE_FRAC + usageT(f.usage) * (MAX_NODE_FRAC - MIN_NODE_FRAC));
        node.style.width = nodeSize + 'px';
        node.style.height = nodeSize + 'px';
      });
    };

    const reveal = () => {
      if (hasRevealed) return;
      hasRevealed = true;
      nodeEls.forEach((n, i) => setTimeout(() => n.classList.add('placed'), i * 110));
      linkEls.forEach((line, i) => setTimeout(() => line.classList.add('lit'), 300 + i * 110));
    };

    buildOnce();
    layout();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 120);
    });

    // ResizeObserver catches layout shifts (e.g. AOS reveal, font load)
    // that a plain resize event on the window would miss.
    if (window.ResizeObserver) {
      new ResizeObserver(() => layout()).observe(orbitStage);
    }

    const orbitObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          layout();
          reveal();
          orbitObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    orbitObserver.observe(orbitStage);
  }

  /* ---------------------------------------------
     2) EQUALIZER — skill category "signal strength"
  --------------------------------------------- */
  const SKILLS = [
    { name: 'Coding', value: 27 },
    { name: 'Design', value: 24 },
    { name: 'Language', value: 15 },
    { name: 'Music', value: 12 },
    { name: 'Marketing', value: 11 },
    { name: 'Photography', value: 11 }
  ];

  const eqEl = document.getElementById('equalizer');
  if (eqEl) {
    const maxVal = Math.max(...SKILLS.map(s => s.value));
    SKILLS.forEach((s) => {
      const bar = document.createElement('div');
      bar.className = 'eq-bar';
      bar.innerHTML = `
        <div class="eq-bar-track"><div class="eq-bar-fill" data-height="${(s.value / maxVal * 100).toFixed(0)}"></div></div>
        <div class="eq-bar-label">${s.name}</div>
        <div class="eq-bar-value">${s.value}%</div>`;
      eqEl.appendChild(bar);
    });

    const eqObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.eq-bar-fill').forEach((fill, i) => {
            setTimeout(() => { fill.style.height = fill.dataset.height + '%'; }, i * 130);
          });
          eqObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    eqObserver.observe(eqEl);
  }

  /* ---------------------------------------------
     3) DEEP-DIVE PROGRESS RINGS
  --------------------------------------------- */
  const rings = document.querySelectorAll('.dive-ring');
  if (rings.length) {
    const CIRC = 2 * Math.PI * 52; // matches r="52" in the ring markup
    const ringObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const ring = entry.target;
          const value = parseFloat(ring.dataset.value);
          const fillCircle = ring.querySelector('.ring-fill');
          fillCircle.style.strokeDasharray = String(CIRC);
          const offset = CIRC - (value / 100) * CIRC;
          requestAnimationFrame(() => { fillCircle.style.strokeDashoffset = offset; });
          ringObserver.unobserve(ring);
        }
      });
    }, { threshold: 0.4 });
    rings.forEach(r => ringObserver.observe(r));
  }

});