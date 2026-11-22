/* ============================================
   HOW IT WORKS PAGE — DEDICATED SCRIPT
   Hand-built growth-path chart (raw SVG + JS, no
   charting library) and an animated descending funnel.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------
     1) GROWTH PATH CHART — days elapsed per milestone
  --------------------------------------------- */
  const STEPS = [
    { label: 'Sign Up', days: 0 },
    { label: 'Add Skills', days: 2 },
    { label: 'Find Match', days: 4 },
    { label: 'Start Learning', days: 9 },
    { label: 'Earn Badge', days: 21 }
  ];

  const svg = document.getElementById('pathSvg');
  const legend = document.getElementById('pathLegend');

  if (svg) {
    const ns = 'http://www.w3.org/2000/svg';
    const W = 900, H = 360;
    const PAD_L = 46, PAD_R = 30, PAD_T = 30, PAD_B = 46;
    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;
    const maxDays = Math.max(...STEPS.map(s => s.days));

    const xFor = (i) => PAD_L + (i / (STEPS.length - 1)) * plotW;
    const yFor = (days) => PAD_T + plotH - (days / maxDays) * plotH;

    const points = STEPS.map((s, i) => ({ ...s, x: xFor(i), y: yFor(s.days) }));

    // defs: line + area gradients
    const defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = `
      <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#4F46E5"/>
        <stop offset="50%" stop-color="#7C3AED"/>
        <stop offset="100%" stop-color="#06B6D4"/>
      </linearGradient>
      <linearGradient id="pathAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#7C3AED" stop-opacity="0"/>
      </linearGradient>`;
    svg.appendChild(defs);

    // horizontal grid lines (0%, 25%, 50%, 75%, 100% of max days)
    for (let g = 0; g <= 4; g++) {
      const gy = PAD_T + (plotH / 4) * g;
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', PAD_L); line.setAttribute('x2', W - PAD_R);
      line.setAttribute('y1', gy); line.setAttribute('y2', gy);
      line.setAttribute('class', 'path-grid');
      svg.appendChild(line);

      const dayVal = Math.round(maxDays * (1 - g / 4));
      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', PAD_L - 10);
      label.setAttribute('y', gy + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('class', 'path-axis-label');
      label.textContent = dayVal + 'd';
      svg.appendChild(label);
    }

    // build line path + area path
    const linePath = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
    const areaPath = linePath +
      ` L ${points[points.length - 1].x.toFixed(1)} ${PAD_T + plotH}` +
      ` L ${points[0].x.toFixed(1)} ${PAD_T + plotH} Z`;

    const areaEl = document.createElementNS(ns, 'path');
    areaEl.setAttribute('d', areaPath);
    areaEl.setAttribute('fill', 'url(#pathAreaGrad)');
    areaEl.setAttribute('class', 'path-area');
    svg.appendChild(areaEl);

    const lineEl = document.createElementNS(ns, 'path');
    lineEl.setAttribute('d', linePath);
    lineEl.setAttribute('class', 'path-line');
    svg.appendChild(lineEl);

    // dots + day labels + step labels
    const dots = [];
    points.forEach((p) => {
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
      dot.setAttribute('class', 'path-dot');
      svg.appendChild(dot);
      dots.push(dot);

      const dayLabel = document.createElementNS(ns, 'text');
      dayLabel.setAttribute('x', p.x);
      dayLabel.setAttribute('y', p.y - 16);
      dayLabel.setAttribute('text-anchor', 'middle');
      dayLabel.setAttribute('class', 'path-day-label');
      dayLabel.textContent = p.days + 'd';
      svg.appendChild(dayLabel);
      dot.dayLabelRef = dayLabel;

      const stepLabel = document.createElementNS(ns, 'text');
      stepLabel.setAttribute('x', p.x);
      stepLabel.setAttribute('y', H - 14);
      stepLabel.setAttribute('text-anchor', 'middle');
      stepLabel.setAttribute('class', 'path-step-label');
      stepLabel.textContent = p.label;
      svg.appendChild(stepLabel);
    });

    if (legend) {
      legend.innerHTML = `
        <span class="path-legend-chip"><strong>21 days</strong> median sign-up to badge</span>
        <span class="path-legend-chip"><strong>+5 days</strong> biggest jump: matched → learning</span>`;
    }

    const pathObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          lineEl.style.strokeDashoffset = '0';
          areaEl.style.opacity = '1';
          dots.forEach((dot, i) => {
            setTimeout(() => {
              dot.setAttribute('r', 6);
              if (dot.dayLabelRef) dot.dayLabelRef.style.opacity = '1';
            }, 700 + i * 220);
          });
          pathObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    pathObserver.observe(svg);
  }

  /* ---------------------------------------------
     2) DESCENDING FUNNEL — students remaining per stage
  --------------------------------------------- */
  const FUNNEL = [
    { label: 'Signed Up', count: 2500, icon: 'fa-user-plus' },
    { label: 'Added Skills', count: 2150, icon: 'fa-layer-group' },
    { label: 'Matched', count: 1780, icon: 'fa-magnifying-glass' },
    { label: 'Started Learning', count: 1540, icon: 'fa-chalkboard-user' },
    { label: 'Earned Badge', count: 1120, icon: 'fa-award' }
  ];

  const funnelStack = document.getElementById('funnelStack');
  if (funnelStack) {
    const maxCount = FUNNEL[0].count;
    FUNNEL.forEach((f, i) => {
      const pct = Math.round((f.count / maxCount) * 100);

      const step = document.createElement('div');
      step.className = 'funnel-step';
      step.innerHTML = `
        <div class="funnel-step-icon"><i class="fa-solid ${f.icon}"></i></div>
        <div class="funnel-bar">
          <div class="funnel-fill" data-width="${pct}"></div>
          <div class="funnel-content">
            <span>${f.label}</span>
            <span class="funnel-count">${f.count.toLocaleString()}</span>
          </div>
        </div>`;
      funnelStack.appendChild(step);

      if (i < FUNNEL.length - 1) {
        const connector = document.createElement('div');
        connector.className = 'funnel-connector';
        funnelStack.appendChild(connector);
      }
    });

    const funnelObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.funnel-fill').forEach((fill, i) => {
            const target = fill.dataset.width;
            setTimeout(() => { fill.style.width = target + '%'; }, i * 160);
          });
          funnelObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    funnelObserver.observe(funnelStack);
  }

});