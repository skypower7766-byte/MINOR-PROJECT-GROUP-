/* ============================================
   WHY US PAGE — DEDICATED SCRIPT
   Hand-built dual-arc gauges (raw SVG) and an
   interactive savings thermometer. No chart library.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------
     1) COMPARISON DIALS — SkillSwap vs paid course
  --------------------------------------------- */
  const CRITERIA = [
    { label: 'Cost',          icon: 'fa-wallet',          swap: 98, paid: 35 },
    { label: 'Flexibility',   icon: 'fa-calendar-days',   swap: 90, paid: 55 },
    { label: 'Peer Support',  icon: 'fa-people-arrows',   swap: 92, paid: 30 },
    { label: 'Real Practice', icon: 'fa-hands-holding',   swap: 88, paid: 55 },
    { label: 'Community',     icon: 'fa-people-group',    swap: 95, paid: 25 }
  ];

  const dialGrid = document.getElementById('dialGrid');
  if (dialGrid) {
    const R_OUT = 52, R_IN = 38;
    const CIRC_OUT = 2 * Math.PI * R_OUT;
    const CIRC_IN = 2 * Math.PI * R_IN;

    CRITERIA.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'dial-card glass-card';
      card.innerHTML = `
        <div class="dial-svg-wrap">
          <svg viewBox="0 0 120 120">
            <circle class="dial-track" cx="60" cy="60" r="${R_OUT}"></circle>
            <circle class="dial-track" cx="60" cy="60" r="${R_IN}"></circle>
            <circle class="dial-arc-outer" cx="60" cy="60" r="${R_OUT}" data-circ="${CIRC_OUT}" data-value="${c.swap}"></circle>
            <circle class="dial-arc-inner" cx="60" cy="60" r="${R_IN}" data-circ="${CIRC_IN}" data-value="${c.paid}"></circle>
          </svg>
          <div class="dial-center"><i class="fa-solid ${c.icon}"></i></div>
        </div>
        <div class="dial-label">${c.label}</div>
        <div class="dial-scores"><strong>${c.swap}</strong>&nbsp;vs&nbsp;<span>${c.paid}</span></div>`;
      dialGrid.appendChild(card);
    });

    const dialObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.dial-arc-outer, .dial-arc-inner').forEach(arc => {
            const circ = parseFloat(arc.dataset.circ);
            const value = parseFloat(arc.dataset.value);
            const len = (value / 100) * circ;
            requestAnimationFrame(() => {
              arc.style.strokeDasharray = `${len} ${circ - len}`;
            });
          });
          dialObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    dialGrid.querySelectorAll('.dial-card').forEach(card => dialObserver.observe(card));
  }

  /* ---------------------------------------------
     2) SAVINGS THERMOMETER — switchable skill costs
  --------------------------------------------- */
  const COSTS = [
    { label: 'Design Course', amount: 8000 },
    { label: 'Coding Bootcamp', amount: 25000 },
    { label: 'Language Tutor', amount: 12000 },
    { label: 'Music Lessons', amount: 15000 },
    { label: 'Marketing Course', amount: 9000 }
  ];
  const THERMO_MAX = 30000;

  const tabsEl = document.getElementById('thermoTabs');
  const amountEl = document.getElementById('thermoAmount');
  const fillEl = document.getElementById('thermoFill');
  const captionEl = document.getElementById('thermoCaption');

  if (tabsEl && amountEl && fillEl) {
    let current = 0;

    const animateAmount = (target) => {
      const duration = 900;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        amountEl.textContent = '₹' + val.toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const render = (index) => {
      current = index;
      tabsEl.querySelectorAll('.thermo-tab').forEach((t, i) => t.classList.toggle('active', i === index));
      const cost = COSTS[index];
      animateAmount(cost.amount);
      fillEl.style.width = Math.min(100, (cost.amount / THERMO_MAX) * 100) + '%';
      captionEl.textContent = `typical cost of "${cost.label}" elsewhere — ₹0 on SkillSwap Campus`;
    };

    COSTS.forEach((c, i) => {
      const tab = document.createElement('button');
      tab.className = 'thermo-tab';
      tab.type = 'button';
      tab.textContent = c.label;
      tab.addEventListener('click', () => render(i));
      tabsEl.appendChild(tab);
    });

    const thermoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          render(0);
          thermoObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    thermoObserver.observe(tabsEl.closest('.thermo-wrap'));
  }

});