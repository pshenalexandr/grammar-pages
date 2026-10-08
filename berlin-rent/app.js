// Widgets for the Berlin rent explainer. Copy + numbers come from data.js; the map lives in map.js.
// core.js gives $, $$, stick(), renderSticks(), initChrome() (progress bar + footnotes).

const euro = (v, d = 0) => '€' + Number(v).toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d});
const fnGray = id => `<span class="fn gray" data-note="${src(id).replace(/"/g, '&quot;')}">0</span>`;

/* ---------- Part 1: completions vs target ---------- */
function buildChart() {
  const svg = $('#buildChart'); if (!svg) return;
  const d = Object.entries(CITY.completions).map(([y, v]) => [+y, v]);
  const W = 700, H = 260, L = 52, B = 30, T = 14, max = 22000, bw = (W - L - 10) / d.length;
  const y = v => H - B - v / max * (H - B - T);
  let s = '';
  [0, 5000, 10000, 15000, 20000].forEach(v => { s += `<line x1="${L}" x2="${W - 6}" y1="${y(v)}" y2="${y(v)}" stroke="#e7e1d6"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" class="ax">${v ? v / 1000 + 'k' : 0}</text>`; });
  d.forEach(([yr, v], i) => {
    const x = L + i * bw + 3, h = H - B - y(v);
    s += `<g class="bc" data-i="${i}"><rect x="${x - 3}" y="${T}" width="${bw}" height="${H - B - T}" fill="transparent"/><rect x="${x}" y="${y(v)}" width="${bw - 6}" height="${h}" rx="3" fill="${v === 18999 ? '#dc5127' : '#f79a52'}"/>
      <text x="${x + (bw - 6) / 2}" y="${H - B + 16}" text-anchor="middle" class="ax">${i % 2 ? '' : "'" + String(yr).slice(2)}</text></g>`;
  });
  s += `<line x1="${L}" x2="${W - 6}" y1="${y(20000)}" y2="${y(20000)}" stroke="#1b1b1b" stroke-width="2.5" stroke-dasharray="7 5"/><text x="${W - 8}" y="${y(20000) - 7}" text-anchor="end" class="tl">the 20,000 target</text>`;
  s += `<text x="${L + 8 * bw + bw / 2}" y="${y(18999) - 8}" text-anchor="middle" class="tl">best since the 1990s</text>`;
  svg.innerHTML = s;
  $$('.bc', svg).forEach(g => g.addEventListener('mouseenter', () => { const [yr, v] = d[g.dataset.i];
    $$('.bc', svg).forEach(o => o.classList.toggle('dim', o !== g));
    $('#buildInsp').innerHTML = `<b>${yr}</b>: ${v.toLocaleString()} flats completed, ${Math.round(v / 200)}% of the 20,000 target.`; }));
  svg.addEventListener('mouseleave', () => $$('.bc', svg).forEach(o => o.classList.remove('dim')));
}

/* ---------- fights ---------- */
function fights() {
  const box = $('#fights'); if (!box) return;
  box.innerHTML = FIGHTS.map((f, i) => `<div class="fight" data-i="${i}">
    <div class="yr">${f.yr}</div><h4>${f.h}</h4>
    <div class="ring"><div class="corner l">${stick(f.l.st)}<div class="who">${f.l.who}</div></div><div class="vs">VS</div><div class="corner r">${stick({...f.r.st, flip: true})}<div class="who">${f.r.who}</div></div></div>
    <div class="story">${f.story}</div>
    <button class="bell">🔔 Ring the bell</button>
    <div class="verdict">${f.verdict}<div class="vsrc">Sources: ${f.srcs.map(s => `<a href="${SRC[s].u}" target="_blank" rel="noopener">${SRC[s].t.split(':')[0].split('(')[0].trim()}</a> (${SRC[s].d})`).join(' · ')}</div></div>
  </div>`).join('');
  $$('.fight', box).forEach(f => $('.bell', f).onclick = () => { f.classList.add('ding'); setTimeout(() => { f.classList.remove('ding'); f.classList.add('done'); $('.bell', f).textContent = '🔔 Ding ding ding'; }, 1050); });
}

/* ---------- characters ---------- */
function chars() {
  const box = $('#chars'); if (!box) return;
  box.innerHTML = CHARS.map(c => `<div class="tenant" tabindex="0"><div class="inner">
    <div class="face front"><div class="swatch" style="background:${c.c}"></div>${stick(c.st)}<div class="nm">${c.nm}</div><div class="nick">${c.nick}</div><div class="flip-hint">click to flip</div></div>
    <div class="face back"><h5>${c.nm}</h5><div>${c.bio}</div><div class="q">“${c.q}”</div></div>
  </div></div>`).join('');
  $$('.tenant', box).forEach(t => { const f = () => t.classList.toggle('flip'); t.onclick = f; t.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } }; });
}

/* ---------- Part 2: lock-in machine ---------- */
function lockin() {
  const sl = $('#liSlider'); if (!sl) return;
  const msFor = y => { let best = null; for (const k in CITY.mietspiegel) if (+k <= y) best = CITY.mietspiegel[k]; return best; };
  const msYear = y => { let best = null; for (const k in CITY.mietspiegel) if (+k <= y) best = +k; return best; };
  const turn = y => { let best = null; for (const k in CITY.turnoverBBU) if (+k <= y) best = [+k, CITY.turnoverBBU[k]]; return best; };
  const maxR = 55 * 16;
  const upd = () => {
    const y = +sl.value, ms = msFor(y), ask = CITY.askMedian[y];
    const stay = LOCKIN.bigM2 * ms, move = LOCKIN.smallM2 * ask, diff = move - stay;
    $('#liYear').textContent = y;
    $('#liStay').textContent = euro(stay) + '/mo';
    $('#liMove').textContent = euro(move) + '/mo';
    $('#liStayBar').style.width = (stay / maxR * 100) + '%';
    $('#liMoveBar').style.width = (move / maxR * 100) + '%';
    $('#liVerdict').innerHTML = diff < 0
      ? `Moving to the <b>smaller</b> flat saves <b>${euro(-diff)}</b>/month. Sensible people move.`
      : `Moving to the <b>smaller</b> flat costs <b>${euro(diff)} more</b> per month (${euro(diff * 12)}/year). Nobody moves.`;
    $('#liVerdict').className = 'li-verdict ' + (diff < 0 ? 'ok' : 'bad');
    const fr = [...LOCKIN.frames].reverse().find(f => f.y <= y);
    $('#liFig').innerHTML = `<div class="bubble">${fr.say}</div>${stick({mood: fr.mood, arms: fr.mood === 'smug' ? 'hips' : fr.mood === 'sweat' ? 'shrug' : 'down'})}${stick({mood: fr.mood, hat: 'glasses', arms: 'down', flip: true})}`;
    const t = turn(y);
    $('#liTurn').textContent = t ? t[1] + '%' : '–';
    $('#liTurnBar').style.width = t ? (t[1] / 10 * 100) + '%' : 0;
    $('#liTurnNote').textContent = t ? `(BBU figure for ${t[0]}; it was 9.5% in 2001)` : '';
    const lvl = Math.max(0, Math.min(4, Math.round((move / stay - 0.85) * 5)));
    $$('#liLoop .lp').forEach((p, i) => p.classList.toggle('on', i < lvl));
    $('#liLoop').classList.toggle('spin', lvl >= 4);
    $('#lockin').dataset.ms = msYear(y);
  };
  sl.oninput = upd; upd();
}

/* ---------- Besichtigung simulator ---------- */
function sim() {
  const box = $('#simW'); if (!box) return;
  let sc = SIM.scenarios[0], apps = 0, views = 0, flats = 0, docsShown = 0;
  $('#simScen').innerHTML = SIM.scenarios.map((s, i) => `<button data-i="${i}" class="${i ? '' : 'on'}">${s.n}</button>`).join('');
  // block outline path for the queue: a rounded rectangle, figures placed along it
  const path = (() => { const p = []; const x0 = 40, y0 = 40, x1 = 660, y1 = 290;
    for (let x = x1; x >= x0; x -= 4) p.push([x, y1]); for (let y = y1; y >= y0; y -= 4) p.push([x0, y]);
    for (let x = x0; x <= x1; x += 4) p.push([x, y0]); for (let y = y0; y <= y1; y += 4) p.push([x1, y]); return p; })();
  const drawQueue = (you) => {
    const n = Math.round(sc.applicants / 10), q = $('#queue'), per = Math.min(path.length, n * 7), step = per / n;
    let s = `<rect x="80" y="80" width="540" height="170" rx="6" fill="#efe7d6" stroke="#1b1b1b" stroke-width="2.5"/>
      <text x="350" y="155" text-anchor="middle" class="blk">Altbau, Vorderhaus, 4. OG links</text>
      <text x="350" y="182" text-anchor="middle" class="blk2">1 flat available · ${sc.applicants.toLocaleString()} applicants · 1 figure = 10 people</text>
      <rect x="626" y="262" width="34" height="40" fill="#fff" stroke="#1b1b1b" stroke-width="2"/><text x="643" y="318" text-anchor="middle" class="blk2">door</text>`;
    const laps = n * 7 > path.length;
    for (let i = 0; i < n; i++) {
      const k = Math.floor(i * step) % path.length, [x, y] = path[k], lap = Math.floor(i * step / path.length);
      const off = lap * 12;
      const xx = x + (x === 40 ? -off : x === 660 ? off : 0), yy = y + (y === 290 ? off : y === 40 ? -off : 0);
      s += `<g transform="translate(${xx - 4},${yy - 12})" class="qp"><circle cx="4" cy="2" r="2.6" fill="#fff" stroke="#1b1b1b" stroke-width="1.2"/><path d="M4 4.5 V10 M4 10 L1.5 15 M4 10 L6.5 15 M4 6.5 L1 9 M4 6.5 L7 9" stroke="#1b1b1b" stroke-width="1.2" fill="none"/></g>`;
    }
    if (laps) s += `<text x="350" y="22" text-anchor="middle" class="blk2">(the queue goes around the block ${Math.ceil(n * 7 / path.length)} times)</text>`;
    if (you) { const [x, y] = path[Math.min(path.length - 1, Math.floor((n - 1) * step) % path.length)]; s += `<g transform="translate(${x - 8},${y - 34})"><text x="8" y="-2" text-anchor="middle" class="you">you</text><path d="M8 0 L8 8" stroke="#dc5127" stroke-width="2"/></g>`; }
    q.innerHTML = s;
  };
  const setScen = i => { sc = SIM.scenarios[i]; $$('#simScen button').forEach((b, j) => b.classList.toggle('on', j === i));
    $('#simNote').innerHTML = sc.note + fnGray(sc.src); if (window.__chrome) initChrome2($('#simNote')); drawQueue(false);
    $('#simMsg').innerHTML = `Your odds per application: <b>${sc.id === 'gewobag' ? 'as bad as ' : ''}1 in ${sc.applicants.toLocaleString()}</b> (${(100 / sc.applicants).toFixed(2)}%). Expected applications until you get one: about <b>${sc.applicants.toLocaleString()}</b>.`; };
  $$('#simScen button').forEach(b => b.onclick = () => setScen(+b.dataset.i));
  const upd = () => { $('#sApps').textContent = apps; $('#sViews').textContent = views; $('#sFlats').textContent = flats; $('#sPages').textContent = (apps * 14).toLocaleString(); };
  const once = () => {
    apps++;
    const viewed = Math.random() < sc.viewers / sc.applicants;
    if (viewed) { views++; if (Math.random() < 1 / sc.viewers) flats++; }
    if (docsShown < SIM.docs.length && (apps === 1 || apps % 2 === 0)) {
      const d = SIM.docs[docsShown++], note = SIM.docNotes[d];
      $('#docs').insertAdjacentHTML('beforeend', `<span class="doc ${note ? 'has' : ''}" ${note ? `title="${note.replace(/"/g, '&quot;')}"` : ''}>📄 ${d}${note ? ' ⓘ' : ''}</span>`);
    }
    return viewed;
  };
  const report = (viewed, k) => {
    const msg = flats ? `🎉 You got a flat after ${apps} applications. Frame the lease. Never leave. Welcome to the Bestandsmieter club.`
      : viewed ? `You got a viewing! ${sc.viewers > 1 ? `You and ${sc.viewers - 1} others. ` : ''}No flat though. Application #${apps}.`
      : k > 1 ? `${k} more applications, no luck. Total: ${apps}. At one application a day that's ${apps} days of your life.` : `Rejected (or ghosted). Application #${apps}. At these odds you'd expect to need about ${sc.applicants.toLocaleString()}.`;
    $('#simMsg').innerHTML = msg; upd(); drawQueue(true);
  };
  $('#apply').onclick = () => report(once(), 1);
  $('#apply10').onclick = () => { let v = false; for (let i = 0; i < 10 && !flats; i++) v = once() || v; report(v, 10); };
  $('#simReset').onclick = () => { apps = views = flats = docsShown = 0; $('#docs').innerHTML = ''; upd(); setScen(SIM.scenarios.indexOf(sc)); };
  $('#docs').addEventListener('click', e => { const d = e.target.closest('.doc.has'); if (d) { const n = d.nextElementSibling; if (n && n.classList.contains('doc-note')) n.remove(); else d.insertAdjacentHTML('afterend', `<div class="doc-note">${d.title}</div>`); } });
  setScen(0); upd();
}
function initChrome2(el) { // number + wire footnotes added after page load
  $$('.fn', el).forEach(fn => { if (fn.dataset.id) return; fn.dataset.id = 'x' + Math.random().toString(36).slice(2); fn.textContent = 'i';
    fn.addEventListener('click', () => { const host = fn.closest('p, li, div'); const nx = host.nextElementSibling;
      if (nx && nx.classList.contains('fn-note') && nx.dataset.for === fn.dataset.id) { nx.remove(); return; }
      const n = document.createElement('div'); n.className = 'fn-note gray'; n.dataset.for = fn.dataset.id; n.innerHTML = fn.dataset.note; host.after(n); }); });
}

/* ---------- Schufa boss fight ---------- */
function boss() {
  const box = $('#boss'); if (!box) return;
  let you = 3, them = SIM.boss.hp, over = false;
  $('#youFig').innerHTML = stick({mood: 'sweat', arms: 'punch', scale: .8});
  const draw = () => { $('#youHp').style.width = (you / 3 * 100) + '%'; $('#bossHp').style.width = (them / SIM.boss.hp * 100) + '%'; };
  $('#bossMoves').innerHTML = SIM.boss.moves.map((m, i) => `<button data-i="${i}">${m.n}</button>`).join('') + `<button class="again" hidden>↺ fight again</button>`;
  $$('#bossMoves button[data-i]').forEach(b => b.onclick = () => {
    if (over) return;
    const m = SIM.boss.moves[b.dataset.i]; them = Math.max(0, them - m.dmg); you = Math.max(0, you - (m.hurt || 0)); b.disabled = true;
    box.classList.remove('hit', 'ouch'); void box.offsetWidth; box.classList.add(m.dmg ? 'hit' : 'ouch');
    let txt = m.txt;
    if (them === 0) { txt += `<br><b>${SIM.boss.win}</b>`; over = true; }
    else if (you === 0) { txt += `<br><b>${SIM.boss.lose}</b>`; over = true; }
    $('#bossLog').innerHTML = txt; draw();
    if (over) { $('.again', box).hidden = false; $$('#bossMoves button[data-i]').forEach(x => x.disabled = true); }
  });
  $('.again', box).onclick = () => { you = 3; them = SIM.boss.hp; over = false; $$('#bossMoves button').forEach(x => x.disabled = false); $('.again', box).hidden = true; $('#bossLog').textContent = 'A wild SCHUFA appears! Again.'; draw(); };
  draw();
}

/* ---------- Anmeldung loop ---------- */
function loop() {
  const box = $('#loopW'); if (!box) return;
  const steps = ['🏠 Flat', '📝 Wohnungsgeberbestätigung', '🏛️ Anmeldung', '🔢 Tax ID', '💶 Payslips', '📁 Dossier'];
  box.innerHTML = `<svg viewBox="0 0 400 300" class="loop-svg">${steps.map((s, i) => { const a = i / steps.length * Math.PI * 2 - Math.PI / 2, x = 200 + Math.cos(a) * 125, y = 150 + Math.sin(a) * 112;
      const a2 = (i + .5) / steps.length * Math.PI * 2 - Math.PI / 2, ax = 200 + Math.cos(a2) * 128, ay = 150 + Math.sin(a2) * 115;
      return `<text x="${ax}" y="${ay + 6}" text-anchor="middle" class="arr" transform="rotate(${a2 * 180 / Math.PI + 90} ${ax} ${ay})">➜</text><g class="node" data-i="${i}"><rect x="${x - 70}" y="${y - 17}" width="140" height="34" rx="17"/><text x="${x}" y="${y + 6}" text-anchor="middle">${s}</text></g>`; }).join('')}
    <text x="200" y="146" text-anchor="middle" class="mid">you need each one</text><text x="200" y="168" text-anchor="middle" class="mid">to get the next one</text></svg>`;
  let k = 0; setInterval(() => { if (document.hidden) return; $$('.node', box).forEach((n, i) => n.classList.toggle('on', i === k)); k = (k + 1) % steps.length; }, 900);
}

/* ---------- spot the scam ---------- */
function scams() {
  const box = $('#scamGrid'); if (!box) return;
  let right = 0, done = 0;
  box.innerHTML = SCAMS.map((s, i) => `<div class="scam" data-i="${i}"><div class="ad">${s.ad}</div>
    <div class="guess"><button data-g="legal">✅ legal</button><button data-g="sketchy">🤨 sketchy</button><button data-g="illegal">🚫 illegal</button></div>
    <div class="why"></div></div>`).join('');
  $$('.scam', box).forEach(c => $$('button', c).forEach(b => b.onclick = () => {
    if (c.classList.contains('done')) return;
    const s = SCAMS[c.dataset.i], ok = b.dataset.g === s.v; done++; if (ok) right++;
    c.classList.add('done', ok ? 'right' : 'wrong', 'v-' + s.v);
    b.classList.add('picked');
    $('.why', c).innerHTML = `<b>${ok ? 'Yes!' : 'Nope.'} ${s.v.toUpperCase()}.</b> ${s.why} <a href="${SRC[s.src].u}" target="_blank" rel="noopener" class="srcl">source</a>`;
    $('#scamScore').innerHTML = `Score: <b>${right} / ${done}</b>${done === SCAMS.length ? (right >= 10 ? ' · You could work at the Mieterverein.' : right >= 7 ? ' · Solid. Bring this page to your next viewing.' : ' · Please do not send anyone a deposit via Western Union.') : ''}`;
  }));
}

/* ---------- calculator ---------- */
function calc() {
  const r = $('#cRent'); if (!r) return;
  const P = CALC.prices;
  const upd = () => {
    const v = +r.value; $('#cRentV').textContent = euro(v);
    const row = (k, n, fmt) => `<div class="unit"><span class="ic">${P[k].icon}</span><b>${fmt(n)}</b><span>${P[k].n}</span></div>`;
    $('#units').innerHTML = [
      row('doner', v / P.doner.v, n => Math.round(n)),
      row('mate', v / P.mate.v, n => n.toFixed(1)),
      row('dt', v / P.dt.v, n => n.toFixed(1)),
      row('wg', v / P.wg.v, n => n.toFixed(2)),
      row('hour', v / P.hour.v, n => n.toFixed(1))
    ].join('');
    const share = v / CALC.hhinc * 100;
    $('#cShare').innerHTML = `That's <b>${Math.round(share)}%</b> of the median Berlin household's net income (€2,675/month). ${share > 50 ? 'More than half. What is left is for Döner.' : share > 30 ? 'Above the 30% rule of thumb, like a lot of Berlin.' : 'Under 30%. You are either sharing or a Bestandsmieter. Congratulations either way.'}`;
    const dons = Math.round(v / P.doner.v);
    $('#calcCap').innerHTML = `Formulas: Döner = rent ÷ €7.00 (Berlin median, Döneratlas, 30 Sept 2026, crowd-sourced) · crates = rent ÷ €21.50 (~€17 + €4.50 Pfand, typical shop price, no survey exists) · Deutschlandtickets = rent ÷ €63 (price since Jan 2026) · WG rooms = rent ÷ €650 (MMI, summer 2026) · hours = rent ÷ €27.42 (average gross hourly earnings, April 2025: a mean, before tax). ${dons} Döner a month is ${(dons / 30).toFixed(1)} a day.`;
  };
  r.oninput = upd; upd();
}

/* ---------- quiz ---------- */
function quiz() {
  const box = $('#quiz'); if (!box) return;
  let i = 0, sc = {};
  const show = () => {
    if (i >= QUIZ.qs.length) {
      const best = Object.keys(QUIZ.out).sort((a, b) => (sc[b] || 0) - (sc[a] || 0))[0], o = QUIZ.out[best];
      box.innerHTML = `<div class="result">${stick(o.st)}<div><div class="qn">You are…</div><h4>${o.n}</h4><p>${o.t}</p><button class="again">↺ take it again</button></div></div>`;
      $('.again', box).onclick = () => { i = 0; sc = {}; show(); }; return;
    }
    const q = QUIZ.qs[i];
    box.innerHTML = `<div class="qn">Question ${i + 1} of ${QUIZ.qs.length}</div><div class="qt">${q.q}</div><div class="opts">${q.a.map((a, j) => `<button data-j="${j}">${a[0]}</button>`).join('')}</div>`;
    $$('.opts button', box).forEach(b => b.onclick = () => { const w = q.a[b.dataset.j][1]; for (const k in w) sc[k] = (sc[k] || 0) + w[k]; i++; show(); });
  };
  show();
}

/* ---------- cheat sheet + sources ---------- */
function rules() {
  const ol = $('#rules'); if (ol) ol.innerHTML = RULES.map(([t, s]) => `<li>${t} <a href="${SRC[s].u}" target="_blank" rel="noopener" class="srcl">source</a></li>`).join('');
  const sl = $('#srcList'); if (sl) sl.innerHTML = Object.keys(SRC).map(k => `<li>${src(k)}</li>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderSticks();
  buildChart(); fights(); chars(); lockin(); sim(); boss(); loop(); scams(); calc(); quiz(); rules();
  initChrome(); window.__chrome = true;
  try { initMap(); } catch (e) { console.error('map failed', e); const s = $('#mapstatus'); if (s) s.textContent = 'The map failed to start: ' + e.message; }
});
