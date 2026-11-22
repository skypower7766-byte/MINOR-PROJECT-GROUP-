/* ============================================
   STORIES PAGE — DEDICATED SCRIPT
   Hand-built growth-area chart (raw SVG) and a
   proportional skill mosaic. No chart library.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------
     1) GROWTH AREA CHART — completed swaps per month
  --------------------------------------------- */
  const MONTHS = [
    { label: 'Aug', value: 22 },
    { label: 'Sep', value: 48 },
    { label: 'Oct', value: 75 },
    { label: 'Nov', value: 110 },
    { label: 'Dec', value: 96 },
    { label: 'Jan', value: 140 },
    { label: 'Feb', value: 175 },
    { label: 'Mar', value: 210 },
    { label: 'Apr', value: 255 },
    { label: 'May', value: 300 }
  ];

  const gSvg = document.getElementById('growthSvg');
  const growthStat = document.getElementById('growthStat');

  if (gSvg) {
    const ns = 'http://www.w3.org/2000/svg';
    const W = 900, H = 340;
    const PAD_L = 40, PAD_R = 20, PAD_T = 30, PAD_B = 36;
    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;
    const maxVal = Math.max(...MONTHS.map(m => m.value));

    const xFor = (i) => PAD_L + (i / (MONTHS.length - 1)) * plotW;
    const yFor = (v) => PAD_T + plotH - (v / maxVal) * plotH;
    const points = MONTHS.map((m, i) => ({ ...m, x: xFor(i), y: yFor(m.value) }));

    const defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = `
      <linearGradient id="growthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#7C3AED"/>
        <stop offset="100%" stop-color="#06B6D4"/>
      </linearGradient>
      <linearGradient id="growthAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="#06B6D4" stop-opacity="0"/>
      </linearGradient>`;
    gSvg.appendChild(defs);

    for (let g = 0; g <= 3; g++) {
      const gy = PAD_T + (plotH / 3) * g;
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', PAD_L); line.setAttribute('x2', W - PAD_R);
      line.setAttribute('y1', gy); line.setAttribute('y2', gy);
      line.setAttribute('class', 'growth-grid');
      gSvg.appendChild(line);

      const val = Math.round(maxVal * (1 - g / 3));
      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', PAD_L - 8);
      label.setAttribute('y', gy + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('class', 'growth-axis-label');
      label.textContent = val;
      gSvg.appendChild(label);
    }

    const linePath = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
    const areaPath = linePath +
      ` L ${points[points.length - 1].x.toFixed(1)} ${PAD_T + plotH}` +
      ` L ${points[0].x.toFixed(1)} ${PAD_T + plotH} Z`;

    const areaEl = document.createElementNS(ns, 'path');
    areaEl.setAttribute('d', areaPath);
    areaEl.setAttribute('fill', 'url(#growthAreaGrad)');
    areaEl.setAttribute('class', 'growth-area');
    gSvg.appendChild(areaEl);

    const lineEl = document.createElementNS(ns, 'path');
    lineEl.setAttribute('d', linePath);
    lineEl.setAttribute('class', 'growth-line');
    gSvg.appendChild(lineEl);

    const dots = [];
    points.forEach((p) => {
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
      dot.setAttribute('class', 'growth-dot');
      gSvg.appendChild(dot);
      dots.push(dot);

      const monthLabel = document.createElementNS(ns, 'text');
      monthLabel.setAttribute('x', p.x);
      monthLabel.setAttribute('y', H - 12);
      monthLabel.setAttribute('text-anchor', 'middle');
      monthLabel.setAttribute('class', 'growth-month-label');
      monthLabel.textContent = p.label;
      gSvg.appendChild(monthLabel);
    });

    if (growthStat) {
      const total = MONTHS.reduce((sum, m) => sum + m.value, 0);
      growthStat.innerHTML = `<span class="num">${total.toLocaleString()}</span><span class="cap">swaps completed this year</span>`;
    }

    const growthObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          lineEl.style.strokeDashoffset = '0';
          areaEl.style.opacity = '1';
          dots.forEach((dot, i) => setTimeout(() => dot.setAttribute('r', 5), 800 + i * 130));
          growthObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    growthObserver.observe(gSvg);
  }

  /* ---------------------------------------------
     2) SKILL MOSAIC — proportional tiles
  --------------------------------------------- */
  const MOSAIC = [
    { label: 'Coding', count: 189, icon: 'fa-code', bg: 'linear-gradient(135deg,#4F46E5,#6366f1)' },
    { label: 'Design', count: 172, icon: 'fa-palette', bg: 'linear-gradient(135deg,#7C3AED,#a78bfa)' },
    { label: 'Language', count: 105, icon: 'fa-language', bg: 'linear-gradient(135deg,#06B6D4,#22d3ee)' },
    { label: 'Music', count: 84, icon: 'fa-music', bg: 'linear-gradient(135deg,#22C55E,#4ade80)' },
    { label: 'Marketing', count: 77, icon: 'fa-bullhorn', bg: 'linear-gradient(135deg,#F59E0B,#fbbf24)' },
    { label: 'Photography', count: 73, icon: 'fa-camera-retro', bg: 'linear-gradient(135deg,#EC4899,#f472b6)' }
  ];

  const mosaicGrid = document.getElementById('mosaicGrid');
  if (mosaicGrid) {
    MOSAIC.forEach((m) => {
      const tile = document.createElement('div');
      tile.className = 'mosaic-tile';
      tile.style.flexGrow = m.count;
      tile.style.background = m.bg;
      tile.innerHTML = `<i class="fa-solid ${m.icon}"></i><strong>${m.label}</strong><span>${m.count} swaps</span>`;
      mosaicGrid.appendChild(tile);
    });

    const mosaicObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.mosaic-tile').forEach((tile, i) => {
            setTimeout(() => tile.classList.add('placed'), i * 100);
          });
          mosaicObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    mosaicObserver.observe(mosaicGrid);
  }

  /* ---------------------------------------------
     3) STORY FILTER CHIPS
  --------------------------------------------- */
  const filterChips = document.querySelectorAll('.filter-chip');
  const storyCards = document.querySelectorAll('.story-card');
  if (filterChips.length && storyCards.length) {
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        storyCards.forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          card.style.display = show ? 'flex' : 'none';
        });
      });
    });
  }

});