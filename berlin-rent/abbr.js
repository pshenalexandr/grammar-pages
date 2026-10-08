// Hover cards for every term in GLOSS (data.js), plus a full glossary rendered into #gloss.
// Wraps matches in <abbr class="tt"> (Unicode-aware, so it works for any language),
// re-wraps after widgets re-render (MutationObserver), tap-to-show on phones.
(() => {
  if (typeof GLOSS === 'undefined' || !GLOSS.length) return;
  const MAP = {};
  GLOSS.forEach(e => [e.t, ...e.a].forEach(k => { MAP[k] = e; }));
  const terms = Object.keys(MAP).sort((a, b) => b.length - a.length);
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  const RE = new RegExp(`(?<![\\p{L}\\d-])(${terms.map(escRe).join('|')})(?![\\p{L}\\d]|-[\\p{L}])`, 'gu');
  // Never underline inside these (add your widget's button rows / tab bars here).
  const SKIP = 'script, style, button, h1, h2, h3, h4, abbr, svg, .tt-card, #gloss, .tt-hint, input, label, select, .toggle, footer';
  // Entries with prose: true are not underlined inside these (example sentences, quiz options).
  const EXAMPLE = 'i, em, .ex, .opts';
  const tip = document.createElement('div');
  tip.className = 'tt-card';
  document.body.appendChild(tip);

  function wrap(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (!n.parentElement || n.parentElement.closest(SKIP)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const hits = []; let n;
    while ((n = w.nextNode())) { RE.lastIndex = 0; if (RE.test(n.textContent)) hits.push(n); }
    hits.forEach(node => {
      const frag = document.createDocumentFragment(); let last = 0;
      node.textContent.replace(RE, (m, t, i) => {
        frag.append(node.textContent.slice(last, i));
        if (MAP[t].prose && node.parentElement.closest(EXAMPLE)) { frag.append(m); last = i + m.length; return; }
        const a = document.createElement('abbr'); a.className = 'tt'; a.dataset.t = t; a.textContent = t;
        frag.append(a); last = i + m.length;
      });
      frag.append(node.textContent.slice(last));
      node.replaceWith(frag);
    });
  }

  let pending = false;
  const mo = new MutationObserver(() => {
    if (pending) return; pending = true;
    setTimeout(() => { pending = false; mo.disconnect(); wrap(document.body); observe(); }, 40);
  });
  const observe = () => mo.observe(document.body, {childList: true, subtree: true});

  let cur = null;
  const show = el => {
    const e = MAP[el.dataset.t]; if (!e) return;
    cur = el;
    tip.innerHTML = `<b>${e.t}</b><span class="full">${e.f}</span><span class="what">${e.w}</span>`;
    tip.style.display = 'block';
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top, t = tip.getBoundingClientRect();
    tip.style.left = Math.min(Math.max(8, x - t.width / 2), innerWidth - t.width - 8) + 'px';
    tip.style.top = (y - t.height - 12 < 8 ? r.bottom + 10 : y - t.height - 12) + 'px';
  };
  const hide = () => { tip.style.display = 'none'; cur = null; };
  document.addEventListener('mouseover', e => { const el = e.target.closest && e.target.closest('abbr.tt'); if (el) show(el); });
  document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('abbr.tt')) hide(); });
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('abbr.tt');
    if (el) { if (cur === el && tip.style.display === 'block') hide(); else show(el); }
    else hide();
  });
  addEventListener('scroll', hide, {passive: true});

  function glossary() {
    const box = document.getElementById('gloss'); if (!box) return;
    const groups = [...new Set(GLOSS.map(e => e.g))];
    box.innerHTML = groups.map(g => `<h4>${g}</h4><table>${GLOSS.filter(e => e.g === g).map(e =>
      `<tr><td><b>${e.t}</b></td><td><span class="gf">${e.f}</span>${e.w}</td></tr>`).join('')}</table>`).join('');
  }

  document.addEventListener('DOMContentLoaded', () => setTimeout(() => { glossary(); wrap(document.body); observe(); }, 30));
})();
