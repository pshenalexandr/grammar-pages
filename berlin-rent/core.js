// Core helpers for a visual explainer: $/$$, Hz/length/money formatting, stick figures,
// reading-progress bar and WBW-style click-to-expand footnotes.
// Usage in HTML: <i data-stick='{"mood":"shock","arms":"up","hat":"glasses"}'></i>
// then call renderSticks(); initChrome(); on DOMContentLoaded.
// Footnotes: <span class="fn" data-note="...">0</span> (gray = add class "gray"); numbers are auto-assigned.
// Requires the #wobble SVG filter and #progress div from base.html.

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const INK = '#1b1b1b';
const L10 = Math.log10;

function fmtHz(f) {
  const t = (v) => (+v.toPrecision(4)).toLocaleString('en-US', {maximumFractionDigits: 3});
  if (f < 1e3) return t(f) + ' Hz';
  if (f < 1e6) return t(f / 1e3) + ' kHz';
  if (f < 1e9) return t(f / 1e6) + ' MHz';
  return t(f / 1e9) + ' GHz';
}
function fmtRange(lo, hi) { return `${fmtHz(lo)} – ${fmtHz(hi)}`; }
function fmtLen(m) {
  if (m >= 1000) return (+(m / 1000).toPrecision(3)).toLocaleString() + ' km';
  if (m >= 1) return (+m.toPrecision(3)) + ' m';
  if (m >= 0.01) return (+(m * 100).toPrecision(3)) + ' cm';
  return (+(m * 1000).toPrecision(3)) + ' mm';
}
function bigWords(n) {
  const u = [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']];
  for (const [v, w] of u) if (n >= v) return `${(+(n / v).toPrecision(3)).toLocaleString()} ${w}`;
  return Math.round(n).toLocaleString();
}
function money(v) {
  if (v >= 1e9) return '$' + (+(v / 1e9).toPrecision(3)) + 'B';
  if (v >= 1e6) return '$' + (+(v / 1e6).toPrecision(3)) + 'M';
  if (v >= 100) return '$' + Math.round(v).toLocaleString();
  if (v >= 1) return '$' + v.toFixed(2);
  return (v * 100).toFixed(v * 100 < 1 ? 2 : 1) + '¢';
}

/* ---------- stick figures ---------- */
function stick({mood = 'happy', arms, hat = 'none', prop = null, scale = 1, flip = false} = {}) {
  const S = `stroke="${INK}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  if (!arms) arms = prop ? 'hold' : mood === 'shock' ? 'up' : 'down';
  const ARMS = {
    down: 'M40 50 L27 70 M40 50 L53 70',
    up: 'M40 50 L24 30 M40 50 L56 30',
    hips: 'M40 50 L28 60 L37 69 M40 50 L52 60 L43 69',
    point: 'M40 50 L27 70 M40 50 L70 42',
    hold: 'M40 50 L27 70 M40 50 L58 60',
    shrug: 'M40 50 L26 54 L21 43 M40 50 L54 54 L59 43',
    punch: 'M40 50 L74 47 M40 50 L30 38'
  };
  let a = ARMS[arms] || ARMS.down;
  if (mood === 'shh') a = 'M40 50 L27 70 M40 50 L53 46 L42 34';
  const shades = hat === 'shades';
  const eyeR = mood === 'shock' ? 2.7 : 1.9;
  let face = shades ? '' : `<circle cx="35" cy="22" r="${eyeR}" fill="${INK}"/><circle cx="45" cy="22" r="${eyeR}" fill="${INK}"/>`;
  const MOUTH = {
    happy: 'M34 29 Q40 35 46 29', sad: 'M34 33 Q40 27 46 33', smug: 'M35 30 Q41 32 47 27',
    flat: 'M35 30.5 L45 30.5', sweat: 'M34 31 Q37 28 40 31 Q43 34 46 31', angry: 'M34 32 Q40 28 46 32'
  };
  if (mood === 'shock') face += `<ellipse cx="40" cy="31" rx="3" ry="4" fill="${INK}"/>`;
  else if (mood === 'shh') face += `<circle cx="40" cy="31" r="2" ${S}/><line x1="42" y1="25" x2="42" y2="36" ${S}/>`;
  else face += `<path d="${MOUTH[mood] || MOUTH.happy}" ${S}/>`;
  if (mood === 'angry') face += `<path d="M31 16 L38 19 M49 16 L42 19" ${S}/>`;
  if (mood === 'sweat' || mood === 'shock') face += `<path d="M58 9 Q62 16 58 18 Q54 16 58 9Z" fill="#6ab0e8" stroke="${INK}" stroke-width="1.5"/>`;

  const HATS = {
    hardhat: `<path d="M25 17 Q40 -1 55 17Z" fill="#f2c230" ${S.replace('fill="none"', '')}/><path d="M21 17 L59 17" ${S}/>`,
    tophat: `<rect x="29" y="-14" width="22" height="23" fill="${INK}"/><path d="M22 10 L58 10" ${S}/><rect x="29" y="1" width="22" height="4" fill="#e84a3a"/>`,
    headphones: `<path d="M25 24 Q40 -4 55 24" ${S}/><rect x="21" y="18" width="7" height="13" rx="3" fill="${INK}"/><rect x="52" y="18" width="7" height="13" rx="3" fill="${INK}"/>`,
    glasses: `<circle cx="35" cy="22" r="5.5" ${S} stroke-width="2.4"/><circle cx="45" cy="22" r="5.5" ${S} stroke-width="2.4"/><path d="M40.5 22 L39.5 22" ${S}/>`,
    pilot: `<path d="M27 13 Q40 1 53 13Z" fill="#1f3f9a" stroke="${INK}" stroke-width="2.5"/><path d="M25 13 L61 15" ${S}/><circle cx="40" cy="8" r="2.2" fill="#f2c230"/>`,
    captain: `<path d="M26 13 Q40 -1 54 13Z" fill="#fff" stroke="${INK}" stroke-width="2.5"/><rect x="27" y="9" width="26" height="4" fill="#1f3f9a"/><path d="M25 13 L60 14" ${S}/><path d="M37 6 L40 3 L43 6" stroke="#f2c230" stroke-width="2" fill="none"/>`,
    batears: `<path d="M30 13 L26 -3 L37 10Z M50 13 L54 -3 L43 10Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
    shades: `<path d="M29 18 H39 V25 Q34 27 29 25Z M41 18 H51 V25 Q46 27 41 25Z" fill="${INK}"/><path d="M39 19 L41 19" ${S}/><path d="M35 30.5 L45 30.5" ${S}/>`,
    antenna: `<line x1="40" y1="10" x2="40" y2="-6" ${S}/><circle cx="40" cy="-9" r="3.5" fill="#f26a21" stroke="${INK}" stroke-width="2"/><path d="M33 -2 Q40 -14 47 -2" stroke="#f26a21" stroke-width="2" fill="none"/>`,
    party: `<path d="M32 12 L40 -12 L48 12Z" fill="#f26a21" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="40" cy="-13" r="3.5" fill="#f7e43a" stroke="${INK}" stroke-width="2"/>`,
    helmet: `<path d="M24 20 Q40 -3 56 20Z" fill="#6b7a45" stroke="${INK}" stroke-width="2.5"/>`,
    none: ''
  };
  const PROPS = {
    phone: `<rect x="56" y="49" width="10" height="16" rx="2" fill="${INK}"/><rect x="58" y="51" width="6" height="10" fill="#7fd0ff"/>`,
    mega: `<path d="M57 60 L77 49 L77 72Z" fill="#fff" ${S.replace('fill="none"', '')}/><path d="M80 54 Q84 60 80 66 M85 50 Q91 60 85 70" stroke="${INK}" stroke-width="2" fill="none"/>`,
    clock: `<circle cx="66" cy="57" r="10" fill="#fff" ${S.replace('fill="none"', '')}/><path d="M66 57 L66 50 M66 57 L71 59" ${S} stroke-width="2.2"/>`,
    wheel: `<circle cx="66" cy="59" r="10" ${S}/><path d="M56 59 L76 59 M66 59 L66 69" ${S} stroke-width="2.2"/>`
  };
  const w = 96 * scale, h = 140 * scale;
  return `<span class="stick"><svg width="${w}" height="${h}" viewBox="-8 -18 104 140" style="${flip ? 'transform:scaleX(-1)' : ''}">
    <path d="${a}" ${S}/>
    <line x1="40" y1="38" x2="40" y2="78" ${S}/>
    <path d="M40 78 L28 111 M40 78 L52 111" ${S}/>
    <circle cx="40" cy="24" r="14" fill="#fff" ${S.replace('fill="none"', '')}/>
    ${face}${HATS[hat] || ''}${prop ? PROPS[prop] || '' : ''}
  </svg></span>`;
}
function renderSticks() {
  $$('[data-stick]').forEach(el => {
    const o = JSON.parse(el.dataset.stick || '{}');
    el.outerHTML = stick(o);
  });
}

/* ---------- progress + footnotes ---------- */
function initChrome() {
  const bar = $('#progress');
  addEventListener('scroll', () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  }, {passive: true});
  $$('.fn').forEach(fn => fn.addEventListener('click', () => {
    const host = fn.closest('p, li, div, blockquote');
    const next = host.nextElementSibling;
    if (next && next.classList.contains('fn-note') && next.dataset.for === fn.dataset.id) { next.remove(); return; }
    const n = document.createElement('div');
    n.className = 'fn-note' + (fn.classList.contains('gray') ? ' gray' : '');
    n.dataset.for = fn.dataset.id;
    n.innerHTML = fn.dataset.note;
    host.after(n);
  }));
  $$('.fn').forEach((f, i) => { f.dataset.id = i; f.textContent = i + 1; });
}

