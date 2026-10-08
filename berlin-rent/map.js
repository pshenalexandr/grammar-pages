// THE MAP. Two interchangeable renderers behind one tiny interface:
//   GLRenderer  - MapLibre GL (CDN) + optional OpenFreeMap basemap, 3D extrusion, swipe compare
//   SVGRenderer - plain SVG on paper, used when MapLibre can't load (offline bundle, no WebGL)
// The controller (initMap) only talks to the interface, so every mode works in both.
// Data: GEO (geo.js), MAPDATA (data-map.js), MAPCOPY + CITY (data.js).

const BBOX = [[13.08, 52.335], [13.77, 52.68]];
const PAPER = '#f6f1e6';
const NODATA = '#e4dfd4';
const RENT_BREAKS = [8, 10, 12, 14, 16, 18, 20, 22];
const RENT_COLORS = ['#fff1dc', '#fdd9a8', '#fbbd78', '#f79a52', '#ee7537', '#dc5127', '#bd351c', '#932414', '#621509'];
const GAP_BREAKS = [1.4, 1.6, 1.8, 2.0, 2.2, 2.4];
const GAP_COLORS = ['#ece8f6', '#d3cbeb', '#b5a8dd', '#9583cc', '#7660b8', '#5a42a0', '#3d2878'];
const GREY = '#c9c5bc';

const classOf = (v, br) => { let i = 0; while (i < br.length && v >= br[i]) i++; return i; };
const rentColor = v => v == null ? NODATA : RENT_COLORS[classOf(v, RENT_BREAKS)];
const gapColor = v => v == null ? NODATA : GAP_COLORS[classOf(v, GAP_BREAKS)];
const eur = (v, d = 0) => '€' + v.toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d});

/* ---------- geometry helpers ---------- */
function ringsOf(g) { return g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []; }
function inRing(pt, ring) {
  const [x, y] = pt; let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function inGeom(pt, g) { return ringsOf(g).some(poly => inRing(pt, poly[0]) && !poly.slice(1).some(h => inRing(pt, h))); }

/* =====================================================================
   SVG renderer (fallback): equirectangular with cos(lat) correction, pan/zoom by viewBox
   ===================================================================== */
class SVGRenderer {
  constructor(el) {
    this.el = el; this.kind = 'svg'; this.h = {};
    const lat0 = 52.5, k = 1000, cx = Math.cos(lat0 * Math.PI / 180);
    this.P = ([lon, lat]) => [(lon - 13.08) * cx * k, (52.68 - lat) * k];
    this.Pinv = ([x, y]) => [x / (cx * k) + 13.08, 52.68 - y / k];
    const [w] = this.P([13.77, 52.335]), [, h] = this.P([13.08, 52.335]);
    this.full = [0, 0, w, h]; this.vb = [...this.full];
    el.innerHTML = '';
    this.svg = this._svg(el, 'main');
    this._wire();
    setTimeout(() => this.h.ready && this.h.ready(), 0);
  }
  _path(g) {
    return ringsOf(g).map(poly => poly.map(r => 'M' + r.map(p => this.P(p).map(n => n.toFixed(1)).join(',')).join('L') + 'Z').join('')).join('');
  }
  _line(g) {
    const ls = g.type === 'LineString' ? [g.coordinates] : g.coordinates;
    return ls.map(l => 'M' + l.map(p => this.P(p).map(n => n.toFixed(1)).join(',')).join('L')).join('');
  }
  _svg(host, tag) {
    const NS = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('class', 'svgmap ' + tag);
    s.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    s.innerHTML = `<defs>
      <pattern id="hatch-${tag}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#1b1b1b" stroke-width="1" opacity=".35"/></pattern>
      <pattern id="lol-${tag}" width="34" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><rect width="34" height="22" fill="${GREY}"/><text x="4" y="15" font-family="Patrick Hand, cursive" font-size="12" fill="#8d887d">lol</text></pattern>
    </defs><rect class="paper" x="-2000" y="-2000" width="5000" height="5000" fill="${PAPER}"/>`;
    const g = (cls) => { const e = document.createElementNS(NS, 'g'); e.setAttribute('class', cls); s.appendChild(e); return e; };
    const gPlr = g('plr'), gHatch = g('hatch'), gLol = g('lol'), gThf = g('thf'), gBez = g('bez'), gLines = g('lines'), gRing = g('ring'), gBorder = g('border');
    const paths = {};
    GEO.plr.features.forEach(f => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', this._path(f.geometry)); p.dataset.id = f.properties.id;
      p.setAttribute('fill', NODATA); gPlr.appendChild(p); paths[f.properties.id] = p;
    });
    const add = (grp, d, attrs) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); for (const k in attrs) p.setAttribute(k, attrs[k]); grp.appendChild(p); return p; };
    GEO.bez.features.forEach(f => add(gBez, this._path(f.geometry), {fill: 'none', stroke: '#1b1b1b', 'stroke-width': 1.3, 'vector-effect': 'non-scaling-stroke'}));
    GEO.border.features.forEach(f => add(gBorder, this._path(f.geometry), {fill: 'none', stroke: '#1b1b1b', 'stroke-width': 2.6, 'vector-effect': 'non-scaling-stroke'}));
    GEO.thf.features.forEach(f => add(gThf, this._path(f.geometry), {fill: 'none', stroke: '#3c7a3c', 'stroke-width': 1.4, 'stroke-dasharray': '3 3', 'vector-effect': 'non-scaling-stroke'}));
    GEO.lines.features.filter(f => f.properties.line !== 'Ringbahn').forEach(f => add(gLines, this._line(f.geometry), {fill: 'none', stroke: f.properties.colour, 'stroke-width': 1.8, 'vector-effect': 'non-scaling-stroke', opacity: .9}));
    GEO.ring.features.forEach(f => add(gRing, this._path(f.geometry), {fill: 'none', stroke: '#1b1b1b', 'stroke-width': 3.2, 'stroke-dasharray': '7 4', 'vector-effect': 'non-scaling-stroke'}));
    host.appendChild(s);
    const self = {s, paths, gHatch, gLol, gLines, gBez, gRing, gThf, hl: null};
    self.hl = add(s, '', {fill: 'none', stroke: '#1b1b1b', 'stroke-width': 3, 'vector-effect': 'non-scaling-stroke', 'pointer-events': 'none'});
    this._applyVB(s);
    return self;
  }
  _applyVB(s) { (s.s || s).setAttribute('viewBox', this.vb.join(' ')); }
  _wire() {
    const s = this.svg.s; let drag = null, moved = false, pinch = null;
    const toSvg = (cx, cy) => { const r = s.getBoundingClientRect(), sc = Math.max(this.vb[2] / r.width, this.vb[3] / r.height);
      const ox = (r.width * sc - this.vb[2]) / 2, oy = (r.height * sc - this.vb[3]) / 2;
      return [this.vb[0] + (cx - r.left) * sc - ox, this.vb[1] + (cy - r.top) * sc - oy, sc]; };
    this.toSvg = toSvg;
    const zoomAt = (cx, cy, f) => { const [x, y] = toSvg(cx, cy); const nw = Math.min(this.full[2] * 1.2, Math.max(25, this.vb[2] * f)); const k = nw / this.vb[2];
      this.vb = [x - (x - this.vb[0]) * k, y - (y - this.vb[1]) * k, this.vb[2] * k, this.vb[3] * k]; this._sync(); };
    this.zoomAt = zoomAt;
    s.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY > 0 ? 1.15 : 1 / 1.15); }, {passive: false});
    const pts = new Map();
    s.addEventListener('pointerdown', e => { pts.set(e.pointerId, [e.clientX, e.clientY]); s.setPointerCapture(e.pointerId); moved = false;
      if (pts.size === 1) drag = [e.clientX, e.clientY, [...this.vb]];
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
    s.addEventListener('pointermove', e => {
      if (pts.has(e.pointerId)) pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, pinch / d); pinch = d; moved = true; return; }
      if (drag && pts.size === 1) { const [, , sc] = toSvg(0, 0); const dx = (e.clientX - drag[0]) * sc, dy = (e.clientY - drag[1]) * sc;
        if (Math.abs(dx) + Math.abs(dy) > 3 * sc) moved = true;
        this.vb = [drag[2][0] - dx, drag[2][1] - dy, drag[2][2], drag[2][3]]; this._sync(); return; }
      const id = e.target.dataset && e.target.dataset.id;
      this.h.hover && this.h.hover(id || null, [e.clientX, e.clientY]);
    });
    const end = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) drag = null; };
    s.addEventListener('pointerup', e => { end(e);
      if (!moved && pts.size === 0) { const [x, y] = toSvg(e.clientX, e.clientY); const ll = this.Pinv([x, y]);
        const id = document.elementsFromPoint(e.clientX, e.clientY).map(n => n.dataset && n.dataset.id).find(Boolean);
        this.h.click && this.h.click(id || null, ll); } });
    s.addEventListener('pointercancel', end);
    s.addEventListener('pointerleave', () => this.h.hover && this.h.hover(null));
    s.addEventListener('dblclick', e => { const [x, y] = toSvg(e.clientX, e.clientY); const ll = this.Pinv([x, y]);
      if (!(this.h.dblclick && this.h.dblclick(ll))) zoomAt(e.clientX, e.clientY, .6); });
    s.style.touchAction = 'none';
  }
  _sync() { this._applyVB(this.svg.s); if (this.cmp) this._applyVB(this.cmp.s); this.h.move && this.h.move(); }
  on(ev, fn) { this.h[ev] = fn; }
  setColors(map, which = 'main') { const t = which === 'main' ? this.svg : this.cmp; if (!t) return; for (const id in t.paths) t.paths[id].setAttribute('fill', map[id] || NODATA); }
  _overlay(t, grp, ids, pat) { grp.innerHTML = ''; ids.forEach(id => { const p = t.paths[id].cloneNode(); p.removeAttribute('data-id'); p.setAttribute('fill', `url(#${pat})`); p.setAttribute('pointer-events', 'none'); grp.appendChild(p); }); }
  setHatch(ids) { this._overlay(this.svg, this.svg.gHatch, ids, 'hatch-main'); if (this.cmp) this._overlay(this.cmp, this.cmp.gHatch, [], 'hatch-cmp'); }
  setLol(ids) { this._overlay(this.svg, this.svg.gLol, ids, 'lol-main'); }
  setLayer(name, on) { const m = {lines: 'gLines', bez: 'gBez', ring: 'gRing'}[name]; [this.svg, this.cmp].forEach(t => t && m && t[m].setAttribute('display', on ? '' : 'none')); }
  setExtrude() { return false; }
  highlight(id) { const p = id && this.svg.paths[id]; this.svg.hl.setAttribute('d', p ? p.getAttribute('d') : ''); }
  compare(on, host) {
    if (on && !this.cmp) { this.cmp = this._svg(host, 'cmp'); this.cmp.s.style.pointerEvents = 'none'; setTimeout(() => this.h.cmpready && this.h.cmpready(), 0); }
    if (!on && this.cmp) { this.cmp.s.remove(); this.cmp = null; }
  }
  project(ll) { const [x, y] = this.P(ll); const r = this.svg.s.getBoundingClientRect(); const sc = Math.max(this.vb[2] / r.width, this.vb[3] / r.height);
    const ox = (r.width * sc - this.vb[2]) / 2, oy = (r.height * sc - this.vb[3]) / 2; return [(x - this.vb[0] + ox) / sc, (y - this.vb[1] + oy) / sc]; }
  zoom(f) { const r = this.svg.s.getBoundingClientRect(); this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, f); }
  reset() { this.vb = [...this.full]; this._sync(); }
  resize() { this._sync(); }
}

/* =====================================================================
   MapLibre renderer
   ===================================================================== */
class GLRenderer {
  constructor(el, opts = {}) {
    this.el = el; this.kind = 'gl'; this.h = {}; this.ext = false;
    const touch = matchMedia('(pointer: coarse)').matches;
    this.map = this._make(el, {interactive: true, cooperativeGestures: touch});
    this.map.on('load', () => this._setup(this.map, 'main').then(() => this.h.ready && this.h.ready()));
    this.map.on('mousemove', 'plr-fill', e => { const f = e.features[0]; this.map.getCanvas().style.cursor = 'pointer'; this.h.hover && this.h.hover(f ? f.properties.id : null, [e.originalEvent.clientX, e.originalEvent.clientY]); });
    this.map.on('mouseleave', 'plr-fill', () => { this.map.getCanvas().style.cursor = ''; this.h.hover && this.h.hover(null); });
    this.map.on('click', e => { const f = this.map.queryRenderedFeatures(e.point, {layers: [this.ext ? 'plr-3d' : 'plr-fill']})[0];
      this.h.click && this.h.click(f ? f.properties.id : null, [e.lngLat.lng, e.lngLat.lat]); });
    this.map.on('dblclick', e => { if (this.h.dblclick && this.h.dblclick([e.lngLat.lng, e.lngLat.lat])) e.preventDefault(); });
    this.map.on('move', () => { if (this.cmp) this.cmp.jumpTo({center: this.map.getCenter(), zoom: this.map.getZoom(), bearing: this.map.getBearing(), pitch: this.map.getPitch()}); this.h.move && this.h.move(); });
  }
  _make(el, o) {
    return new maplibregl.Map({
      container: el, bounds: BBOX, fitBoundsOptions: {padding: 10}, maxBounds: [[12.6, 52.15], [14.25, 52.85]], minZoom: 7.5, maxZoom: 15.5,
      attributionControl: false, dragRotate: false, pitchWithRotate: false, doubleClickZoom: true, ...o,
      style: {version: 8, sources: {}, layers: [{id: 'paper', type: 'background', paint: {'background-color': PAPER}}]}
    });
  }
  async _setup(m, tag) {
    m.addSource('plr', {type: 'geojson', data: GEO.plr, promoteId: 'id'});
    m.addSource('bez', {type: 'geojson', data: GEO.bez});
    m.addSource('border', {type: 'geojson', data: GEO.border});
    m.addSource('ring', {type: 'geojson', data: GEO.ring});
    m.addSource('thf', {type: 'geojson', data: GEO.thf});
    m.addSource('lines', {type: 'geojson', data: {type: 'FeatureCollection', features: GEO.lines.features.filter(f => f.properties.line !== 'Ringbahn')}});
    m.addImage('hatch', this._pattern('hatch'), {pixelRatio: 2});
    m.addImage('lol', this._pattern('lol'), {pixelRatio: 2});
    const fc = ['to-color', ['coalesce', ['feature-state', 'color'], NODATA]];
    m.addLayer({id: 'plr-fill', type: 'fill', source: 'plr', paint: {'fill-color': fc, 'fill-opacity': 0.86}});
    m.addLayer({id: 'plr-line', type: 'line', source: 'plr', paint: {'line-color': '#fff', 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.15, 13, 1], 'line-opacity': .7}});
    m.addLayer({id: 'plr-hatch', type: 'fill', source: 'plr', filter: ['in', ['get', 'id'], ['literal', []]], paint: {'fill-pattern': 'hatch'}});
    m.addLayer({id: 'plr-lol', type: 'fill', source: 'plr', filter: ['in', ['get', 'id'], ['literal', []]], paint: {'fill-pattern': 'lol'}});
    m.addLayer({id: 'plr-3d', type: 'fill-extrusion', source: 'plr', layout: {visibility: 'none'}, paint: {
      'fill-extrusion-color': fc, 'fill-extrusion-height': ['*', ['coalesce', ['feature-state', 'h'], 0], 1], 'fill-extrusion-opacity': .92}});
    m.addLayer({id: 'thf-line', type: 'line', source: 'thf', paint: {'line-color': '#3c7a3c', 'line-width': 1.6, 'line-dasharray': [2, 2]}});
    m.addLayer({id: 'bez-line', type: 'line', source: 'bez', paint: {'line-color': '#1b1b1b', 'line-width': 1.3, 'line-opacity': .75}});
    m.addLayer({id: 'lines', type: 'line', source: 'lines', layout: {'line-cap': 'round', 'line-join': 'round', visibility: 'none'}, paint: {'line-color': ['get', 'colour'], 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 1.4, 14, 4]}});
    m.addLayer({id: 'ring-line', type: 'line', source: 'ring', paint: {'line-color': '#1b1b1b', 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 2.4, 14, 5], 'line-dasharray': [2.2, 1.3]}});
    m.addLayer({id: 'border-line', type: 'line', source: 'border', paint: {'line-color': '#1b1b1b', 'line-width': 2.6}});
    m.addLayer({id: 'hl', type: 'line', source: 'plr', filter: ['==', ['get', 'id'], ''], paint: {'line-color': '#1b1b1b', 'line-width': 3.2}});
    if (tag === 'main') this._basemap(m).catch(() => { this.h.basemap && this.h.basemap(false); });
    else if (this.basemapURL) this._addBase(m, this.basemapURL);
  }
  // Optional basemap: if OpenFreeMap answers, slip a muted street layer under the data. If not, paper it is.
  async _basemap(m) {
    const url = 'https://tiles.openfreemap.org/planet';
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
    const r = await fetch(url, {signal: ctl.signal}); clearTimeout(t);
    if (!r.ok) throw new Error('no tiles');
    this.basemapURL = url; this._addBase(m, url); this.basemap = true;
    this.h.basemap && this.h.basemap(true);
  }
  _addBase(m, url) {
    m.addSource('omt', {type: 'vector', url});
    const before = 'plr-fill';
    m.addLayer({id: 'b-water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: {'fill-color': '#d7e2e6'}}, before);
    m.addLayer({id: 'b-park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: {'fill-color': '#e3e8d6'}}, before);
    m.addLayer({id: 'b-road', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor']]],
      paint: {'line-color': '#d8d1c3', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, .4, 15, 3]}}, before);
    // water and big roads on top of the choropleth, faintly, so the city stays recognisable
    m.addLayer({id: 'b-water-top', type: 'fill', source: 'omt', 'source-layer': 'water', paint: {'fill-color': '#cfdde3', 'fill-opacity': .85}}, 'thf-line');
    m.addLayer({id: 'b-major', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary']]],
      paint: {'line-color': '#fff', 'line-opacity': .45, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, .5, 15, 3]}}, 'thf-line');
  }
  _pattern(kind) {
    const c = document.createElement('canvas'), x = c.getContext('2d');
    if (kind === 'hatch') { c.width = c.height = 16; x.strokeStyle = 'rgba(27,27,27,.4)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 16); x.lineTo(16, 0); x.moveTo(-4, 4); x.lineTo(4, -4); x.moveTo(12, 20); x.lineTo(20, 12); x.stroke(); }
    else { c.width = 84; c.height = 52; x.fillStyle = GREY; x.fillRect(0, 0, 84, 52); x.fillStyle = '#8d887d'; x.font = '24px "Patrick Hand", "Comic Sans MS", cursive'; x.save(); x.translate(10, 36); x.rotate(-.3); x.fillText('lol', 0, 0); x.restore(); }
    return x.getImageData(0, 0, c.width, c.height);
  }
  on(ev, fn) { this.h[ev] = fn; }
  setColors(map, which = 'main') {
    const m = which === 'main' ? this.map : this.cmp; if (!m || !m.getSource('plr')) return;
    for (const id in MAPDATA.areas) m.setFeatureState({source: 'plr', id}, {color: map[id] || NODATA});
  }
  setHeights(map) { for (const id in MAPDATA.areas) this.map.setFeatureState({source: 'plr', id}, {h: map[id] || 0}); }
  setHatch(ids) { this.map.setFilter('plr-hatch', ['in', ['get', 'id'], ['literal', ids]]); }
  setLol(ids) { this.map.setFilter('plr-lol', ['in', ['get', 'id'], ['literal', ids]]); }
  setLayer(name, on) { const id = {lines: 'lines', bez: 'bez-line', ring: 'ring-line'}[name]; [this.map, this.cmp].forEach(m => m && m.getLayer(id) && m.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none')); }
  setExtrude(on) {
    this.ext = on; const m = this.map;
    m.setLayoutProperty('plr-3d', 'visibility', on ? 'visible' : 'none');
    ['plr-fill', 'plr-hatch', 'plr-lol'].forEach(l => m.setLayoutProperty(l, 'visibility', on ? 'none' : 'visible'));
    m.easeTo({pitch: on ? 58 : 0, bearing: on ? -18 : 0, duration: 1200});
    m.dragRotate[on ? 'enable' : 'disable']();
    return true;
  }
  highlight(id) { this.map.setFilter('hl', ['==', ['get', 'id'], id || '']); }
  compare(on, host) {
    if (on && !this.cmp) {
      this.cmp = this._make(host, {interactive: false, center: this.map.getCenter(), zoom: this.map.getZoom(), bounds: undefined});
      this.cmp.on('load', () => this._setup(this.cmp, 'cmp').then(() => {
        this.cmp.resize(); this.cmp.jumpTo({center: this.map.getCenter(), zoom: this.map.getZoom()}); this.h.cmpready && this.h.cmpready(); }));
    }
    if (!on && this.cmp) { this.cmp.remove(); this.cmp = null; host.innerHTML = ''; }
  }
  project(ll) { const p = this.map.project(ll); return [p.x, p.y]; }
  zoom(f) { this.map.zoomTo(this.map.getZoom() - Math.log2(f)); }
  reset() { this.map.fitBounds(BBOX, {padding: 10, pitch: this.ext ? 58 : 0}); }
  resize() { this.map.resize(); this.cmp && this.cmp.resize(); }
}

/* =====================================================================
   Controller: modes, legend, inspector, Kiez card, layers drawer, easter eggs
   ===================================================================== */
function initMap() {
  const box = $('#mapbox'); if (!box) return;
  const A = MAPDATA.areas, Y = MAPDATA.years, C = MAPCOPY;
  // label anchors: area-weighted centroid of each Bezirk's largest polygon
  C.bezLabels = GEO.bez.features.map(f => {
    const ring = ringsOf(f.geometry).map(p => p[0]).sort((a, b) => b.length - a.length)[0];
    let a = 0, x = 0, y = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const c = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]; a += c; x += (ring[j][0] + ring[i][0]) * c; y += (ring[j][1] + ring[i][1]) * c; }
    return {id: f.properties.bez, n: C.bezNames[f.properties.bez], ll: [x / (3 * a), y / (3 * a)]};
  }).sort((p, q) => p.id.localeCompare(q.id));
  const yi = y => Y.indexOf(y);
  const S = {mode: 'time', year: 2025, gapYear: 2022, gapView: 'swipe', ext: false, affYear: 2025, income: 2700, size: 60, rule: 0.3, layers: {lines: false, bez: true, ring: true, social: false, hatch: true}, sel: null, home: null, swipe: 0.5};
  let R = null;

  const canGL = (() => { if (!window.maplibregl) return false; try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
  const mapEl = $('#map');
  R = canGL ? new GLRenderer(mapEl) : new SVGRenderer(mapEl);
  box.classList.add(R.kind);
  $('#mapstatus').innerHTML = canGL ? C.status.gl : C.status.svg;
  R.on('basemap', ok => { $('#mapstatus').innerHTML = ok ? C.status.tiles : C.status.paper; });

  /* ---- value per area for the current mode ---- */
  const askMed = (a, y) => a.med[yi(y)];
  const askMean = (a, y) => a.mean[yi(y)];
  const thin = (a, y) => { const n = a.n[yi(y)]; return n != null && n < 21; };
  const gapOf = (a, y) => { const m = askMean(a, y); return m != null && a.ex ? m / a.ex : null; };
  const monthly = a => { const m = askMed(a, S.affYear); return m == null ? null : m * S.size; };
  const affordable = a => { const r = monthly(a); return r == null ? null : r <= S.income * S.rule; };

  const hgt = v => v == null ? 0 : Math.max(80, (v - 4) * 380);
  function paint() {
    const col = {}, h = {}, hatch = [], lol = [];
    for (const id in A) {
      const a = A[id];
      if (S.mode === 'time') { const v = askMed(a, S.year); col[id] = rentColor(v); h[id] = hgt(v); if (v != null && thin(a, S.year)) hatch.push(id); }
      else if (S.mode === 'gap') {
        if (S.gapView === 'ratio') { const g = gapOf(a, S.gapYear); col[id] = gapColor(g); h[id] = g ? (g - 1) * 2200 : 0; }
        else { const v = askMean(a, S.gapYear); col[id] = rentColor(v); h[id] = hgt(v); }
        if (askMean(a, S.gapYear) != null && thin(a, S.gapYear)) hatch.push(id);
      } else {
        const ok = affordable(a), v = askMed(a, S.affYear);
        col[id] = ok === false ? GREY : rentColor(v); h[id] = ok ? hgt(v) : 60;
        if (ok === false) lol.push(id);
      }
    }
    R.setColors(col);
    if (R.cmp) { const c2 = {}; for (const id in A) c2[id] = rentColor(A[id].ex); R.setColors(c2, 'cmp'); }
    if (R.setHeights && S.ext) R.setHeights(h);
    R.setHatch(S.layers.hatch && !S.ext ? hatch : []);
    R.setLol(S.mode === 'afford' && !S.ext ? lol : []);
    legend(); readouts();
    if (S.sel) card(S.sel);
  }

  /* ---- legend (units + year on every view) ---- */
  function legend() {
    const L = $('#legend'); let html = '';
    const sw = (cols, brs, fmt) => `<div class="lg-ramp">${cols.map((c, i) => `<span style="background:${c}"><em>${i === 0 ? '<' + fmt(brs[0]) : i === cols.length - 1 ? '≥' + fmt(brs[i - 1]) : fmt(brs[i - 1])}</em></span>`).join('')}</div>`;
    const extra = `<div class="lg-x"><span class="sw nod"></span>no data${S.layers.hatch ? ' <span class="sw hat"></span>&lt;21 listings' : ''}</div>`;
    if (S.mode === 'time') html = `<b>Asking rent ${S.year}</b><small>median, € net cold per m² per month (IBB, Planungsraum)</small>` + sw(RENT_COLORS, RENT_BREAKS, v => v) + extra;
    else if (S.mode === 'gap' && S.gapView === 'ratio') html = `<b>The Gap: asking ÷ existing</b><small>asking mean ${S.gapYear} (IBB) ÷ existing mean 2022 (Zensus)</small>` + sw(GAP_COLORS, GAP_BREAKS, v => '×' + v) + extra;
    else if (S.mode === 'gap') html = `<b>◀ Neighbor pays (2022) | You'd pay (${S.gapYear}) ▶</b><small>mean € net cold per m², same colors both sides</small>` + sw(RENT_COLORS, RENT_BREAKS, v => v) + extra;
    else html = `<b>Affordable for you? (${S.affYear} listings)</b><small>${S.size} m² × median asking rent, cold, vs ${Math.round(S.rule * 100)}% of ${eur(S.income)}</small>` + sw(RENT_COLORS, RENT_BREAKS, v => v) + `<div class="lg-x"><span class="sw lol"></span>lol (out of budget) <span class="sw nod"></span>no data</div>`;
    L.innerHTML = html + `<button class="about" data-about="${S.mode === 'gap' ? 'gap' : S.mode}">ⓘ about this data</button>`;
  }

  /* ---- readouts under the map ---- */
  function readouts() {
    if (S.mode === 'time') {
      const k = yi(S.year); let out = 0, tot = 0;
      for (const id in A) { const a = A[id], v = a.med[k]; if (!a.ring && v != null) { tot++; if (v >= 12) out++; } }
      $('#yearBig').textContent = S.year;
      $('#cityMed').textContent = eur(CITY.askMedian[S.year], 2);
      $('#tide').innerHTML = `<b>${out}</b> of ${tot}`;
      $('#tideBar').style.width = (out / tot * 100) + '%';
      $('#timeNote').innerHTML = C.yearNotes[S.year] || '';
    }
    if (S.mode === 'afford') {
      let ok = 0, all = 0, okF = 0, allF = 0;
      for (const id in A) { const a = A[id], f = affordable(a); if (f == null) continue; all++; allF += a.exN || 0; if (f) { ok++; okF += a.exN || 0; } }
      const pct = allF ? okF / allF * 100 : 0;
      $('#affPct').textContent = Math.round(pct) + '%';
      $('#affAreas').textContent = `${ok} of ${all}`;
      $('#affBudget').textContent = eur(S.income * S.rule);
      $('#affIncome').textContent = eur(S.income);
      $('#affSize').textContent = S.size + ' m²';
      $('#affMood').innerHTML = pct < 5 ? C.afford.moods[0] : pct < 25 ? C.afford.moods[1] : pct < 60 ? C.afford.moods[2] : C.afford.moods[3];
      const h = S.home && A[S.home];
      const hm = h && askMed(h, S.affYear);
      $('#affHome').innerHTML = hm != null && h
        ? `To live in <b>${h.name}</b> (${S.size} m², ${eur(hm * S.size)} cold at the ${S.affYear} median) by the ${Math.round(S.rule * 100)}% rule, you need <b>${eur(Math.ceil(hm * S.size / S.rule / 10) * 10)}</b> net per month.`
        : C.afford.pickHome;
    }
  }

  /* ---- hover inspector ---- */
  const insp = $('#insp');
  R.on('hover', (id, xy) => {
    if (!id || !A[id]) { insp.style.display = 'none'; return; }
    const a = A[id]; let line;
    if (S.mode === 'time') { const v = askMed(a, S.year); line = v == null ? 'no data' : `${eur(v, 2)}/m² asking (${S.year})${thin(a, S.year) ? ' · thin data' : ''}`; }
    else if (S.mode === 'gap') { const m = askMean(a, S.gapYear); line = `neighbor ${a.ex ? eur(a.ex, 2) : '?'} · you ${m != null ? eur(m, 2) : '?'} /m²` + (gapOf(a, S.gapYear) ? ` · ×${gapOf(a, S.gapYear).toFixed(2)}` : ''); }
    else { const r = monthly(a); line = r == null ? 'no data' : `${eur(r)} cold for ${S.size} m² · ${affordable(a) ? 'fits' : 'lol'}`; }
    insp.innerHTML = `<b>${a.name}</b> <span>${C.bezNames[a.bez]}</span><br>${line}`;
    insp.style.display = 'block';
    if (xy) { const r = box.getBoundingClientRect(); let x = xy[0] - r.left + 14, y = xy[1] - r.top + 14;
      if (x + 240 > r.width) x -= 260; insp.style.left = x + 'px'; insp.style.top = y + 'px'; }
  });

  /* ---- Kiez card ---- */
  const kiez = $('#kiez');
  function spark(a) {
    const w = 260, h = 70, vs = a.med, max = Math.max(24, ...vs.filter(v => v != null)) + 1, min = 4;
    const pts = vs.map((v, i) => v == null ? null : [i / (vs.length - 1) * w, h - (v - min) / (max - min) * h]);
    let d = '', pen = false; pts.forEach(p => { if (!p) { pen = false; return; } d += (pen ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); pen = true; });
    const ex = a.ex ? h - (a.ex - min) / (max - min) * h : null;
    const k = yi(S.mode === 'gap' ? S.gapYear : S.mode === 'afford' ? S.affYear : S.year), cur = pts[k];
    return `<svg class="spark" viewBox="-4 -6 ${w + 70} ${h + 22}">
      ${ex != null ? `<line x1="0" x2="${w}" y1="${ex}" y2="${ex}" stroke="#7660b8" stroke-width="2" stroke-dasharray="4 3"/><text x="${w + 4}" y="${ex + 4}" fill="#5a42a0">neighbor</text>` : ''}
      <path d="${d}" fill="none" stroke="#dc5127" stroke-width="2.5" stroke-linejoin="round"/>
      ${cur ? `<circle cx="${cur[0]}" cy="${cur[1]}" r="4" fill="#dc5127" stroke="#fff" stroke-width="1.5"/>` : ''}
      <text x="0" y="${h + 14}">2012</text><text x="${w - 26}" y="${h + 14}">2025</text>
    </svg>`;
  }
  function card(id) {
    const a = A[id]; if (!a) { kiez.classList.remove('on'); R.highlight(null); return; }
    S.sel = id; R.highlight(id);
    const first = a.med.findIndex(v => v != null), last = a.med.length - 1 - [...a.med].reverse().findIndex(v => v != null);
    const v0 = a.med[first], v1 = a.med[last];
    const chg = v0 && v1 ? Math.round((v1 / v0 - 1) * 100) : null;
    const g = gapOf(a, 2022);
    const n25 = a.n[yi(2025)];
    const flat = v1 ? v1 * 60 : null;
    const quip = C.quipsPlr[id] || C.quipsBez[a.bez];
    const doner = flat ? Math.round(flat / CALC.prices.doner.v) : null;
    kiez.innerHTML = `<button class="x" aria-label="close">×</button>
      <div class="k-bez">${C.bezNames[a.bez]}${a.ring ? ' · inside the Ring' : ' · outside the Ring'}</div>
      <h4>${a.name}</h4>
      <div class="k-grid">
        <div><span>asking ${Y[last]}</span><b>${v1 != null ? eur(v1, 2) : 'n/a'}</b><small>median /m²${n25 != null ? `, ${n25} listings` : ''}</small></div>
        <div><span>since ${Y[first]}</span><b>${chg != null ? (chg >= 0 ? '+' : '') + chg + '%' : 'n/a'}</b><small>from ${v0 != null ? eur(v0, 2) : '?'}</small></div>
        <div><span>neighbor pays</span><b>${a.ex ? eur(a.ex, 2) : 'n/a'}</b><small>existing mean 2022</small></div>
        <div><span>the gap</span><b>${g ? '×' + g.toFixed(2) : 'n/a'}</b><small>asking ÷ existing, 2022</small></div>
      </div>
      ${spark(a)}
      ${flat ? `<p class="k-flat">A 60 m² flat here at the ${Y[last]} median: <b>${eur(flat)}</b> cold per month. That's ${doner} Döner.<span class="fn gray" data-note="${C.kiezNote}">i</span></p>` : ''}
      <p class="k-quip">${quip}</p>
      ${S.mode === 'afford' ? `<button class="k-home">This is my Kiez</button>` : ''}`;
    kiez.classList.add('on'); $('#drawer').classList.remove('on');
    $('.x', kiez).onclick = () => { S.sel = null; kiez.classList.remove('on'); R.highlight(null); };
    const hb = $('.k-home', kiez); if (hb) hb.onclick = () => { S.home = id; readouts(); hb.textContent = 'Saved ✓'; };
    const fn = $('.fn', kiez); if (fn) fn.onclick = () => { const n = $('.fn-note', kiez); if (n) n.remove(); else fn.parentElement.insertAdjacentHTML('afterend', `<div class="fn-note gray">${C.kiezNote}</div>`); };
  }
  R.on('click', id => { if (id && A[id]) { card(id); if (S.mode === 'afford') { S.home = id; readouts(); } } });

  /* ---- Tempelhofer Feld easter egg ---- */
  const thfGeom = GEO.thf.features[0].geometry;
  R.on('dblclick', ll => {
    if (!inGeom(ll, thfGeom)) return false;
    const pop = $('#thfpop'); pop.innerHTML = C.thf; pop.classList.add('on');
    $('.x', pop).onclick = () => pop.classList.remove('on');
    return true;
  });

  /* ---- overlays positioned in map space (ring label, Bezirk names, wanderer) ---- */
  const ov = $('#mapov');
  const ringLbl = document.createElement('div'); ringLbl.className = 'ring-lbl'; ringLbl.innerHTML = C.ringLabel; ov.appendChild(ringLbl);
  const bezLbls = C.bezLabels.map(b => { const d = document.createElement('div'); d.className = 'bez-lbl'; d.textContent = b.n.replace('-', '-\n'); d.dataset.ll = JSON.stringify(b.ll); ov.appendChild(d); return d; });
  function place() {
    const W = box.clientWidth, H = box.clientHeight;
    const put = (el, ll, show = true) => { const [x, y] = R.project(ll); const vis = show && x > -50 && y > -20 && x < W + 50 && y < H + 20; el.style.display = vis ? '' : 'none'; if (vis) el.style.transform = `translate(${x}px,${y}px)`; };
    put(ringLbl, C.ringLabelAt, S.layers.ring && !S.ext);
    bezLbls.forEach(d => put(d, JSON.parse(d.dataset.ll), S.layers.bez && !S.ext && W > 500));
    socialDots.forEach(d => put(d, JSON.parse(d.dataset.ll), S.layers.social && !S.ext));
    if (walker) put(walker.el, walker.ll, !S.ext);
  }
  R.on('move', place);

  /* social housing circles (Bezirk level, 2020 vs 2024) */
  const socialDots = C.bezLabels.map(b => {
    const s = SOCIAL.byBez[b.id], d = document.createElement('div'); d.className = 'soc';
    const r = n => Math.sqrt(n) / 4.2;
    d.innerHTML = `<i class="was" style="width:${2 * r(s[0])}px;height:${2 * r(s[0])}px"></i><i class="now" style="width:${2 * r(s[1])}px;height:${2 * r(s[1])}px"></i><em>${(s[1] / 1000).toFixed(1)}k</em>`;
    d.title = `${b.n}: ${s[0].toLocaleString()} (2020) → ${s[1].toLocaleString()} (2024) rent- and allocation-bound flats`;
    d.dataset.ll = JSON.stringify(b.ll); ov.appendChild(d); return d;
  });

  /* the wanderer: stick figure with a moving box, random walk from Alexanderplatz to the city limit */
  const border = GEO.border.features[0].geometry;
  let walker = null;
  function spawnWalker() {
    const el = document.createElement('div'); el.className = 'walker';
    el.innerHTML = `<svg viewBox="0 0 40 52" width="30" height="39"><circle cx="16" cy="8" r="6" fill="#fff" stroke="#1b1b1b" stroke-width="2"/><path d="M16 14 L16 32 M16 32 L10 46 M16 32 L22 46 M16 19 L27 22 M16 19 L25 27" stroke="#1b1b1b" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="22" y="15" width="15" height="12" fill="#d9b382" stroke="#1b1b1b" stroke-width="1.8"/><path d="M22 19 L37 19" stroke="#1b1b1b" stroke-width="1"/></svg><span class="wb"></span>`;
    ov.appendChild(el);
    walker = {el, ll: [13.4132, 52.5219], hd: Math.random() * Math.PI * 2, t: 0, done: false};
    const bubble = $('.wb', el);
    const lines = C.walker;
    const step = () => {
      if (!walker || walker.el !== el) return;
      if (!walker.done && !document.hidden && inView()) {
        walker.hd += (Math.random() - .5) * .7;
        const nx = walker.ll[0] + Math.cos(walker.hd) * .0016, ny = walker.ll[1] + Math.sin(walker.hd) * .001;
        walker.t++;
        if (walker.t % 160 === 40) { bubble.textContent = lines.search[(walker.t / 160 | 0) % lines.search.length]; bubble.style.display = 'block'; }
        if (walker.t % 160 === 110) bubble.style.display = 'none';
        if (!inGeom([nx, ny], border)) {
          walker.done = true; bubble.textContent = lines.giveUp[Math.random() * lines.giveUp.length | 0]; bubble.style.display = 'block';
          setTimeout(() => { el.classList.add('bye'); }, 3500);
          setTimeout(() => { el.remove(); walker = null; setTimeout(spawnWalker, 6000); }, 4500);
        } else walker.ll = [nx, ny];
        place();
      }
      setTimeout(step, 90);
    };
    step();
  }
  const inView = () => { const r = box.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };

  /* ---- controls ---- */
  function setMode(m) {
    if (m !== 'time' && timer) $('#play').click();
    S.mode = m;
    $$('#modeTabs button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
    $$('.mctl').forEach(c => c.hidden = c.dataset.for !== m);
    $('#mapCaption').innerHTML = C.captions[m];
    const cmp = m === 'gap' && S.gapView === 'swipe' && !S.ext;
    box.classList.toggle('swiping', cmp);
    R.compare(cmp, $('#map2'));
    if (cmp) setSwipe(S.swipe);
    paint(); place();
  }
  R.on('cmpready', () => { for (const k in S.layers) R.setLayer(k, S.layers[k]); paint(); });
  $$('#modeTabs button').forEach(b => b.onclick = () => setMode(b.dataset.m));

  const ys = $('#yearSlider'); let timer = null;
  ys.min = Y[0]; ys.max = Y[Y.length - 1]; ys.value = S.year;
  ys.oninput = () => { S.year = +ys.value; paint(); };
  $('#play').onclick = () => {
    if (timer) { clearInterval(timer); timer = null; $('#play').textContent = '▶ play'; return; }
    if (S.year >= Y[Y.length - 1]) S.year = Y[0] - 1;
    $('#play').textContent = '❚❚ pause';
    timer = setInterval(() => { S.year++; ys.value = S.year; paint();
      if (S.year >= Y[Y.length - 1]) { clearInterval(timer); timer = null; $('#play').textContent = '▶ replay'; } }, 850);
  };
  $$('#gapYear button').forEach(b => b.onclick = () => { S.gapYear = +b.dataset.y; $$('#gapYear button').forEach(x => x.classList.toggle('on', x === b)); paint(); });
  $$('#gapView button').forEach(b => b.onclick = () => { S.gapView = b.dataset.v; $$('#gapView button').forEach(x => x.classList.toggle('on', x === b)); setMode('gap'); });

  // swipe handle
  const handle = $('#swipe');
  function setSwipe(f) { S.swipe = Math.min(.97, Math.max(.03, f)); const W = box.clientWidth; handle.style.left = (S.swipe * 100) + '%'; $('#map2').style.clipPath = `inset(0 ${(1 - S.swipe) * W}px 0 0)`; }
  handle.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); handle.setPointerCapture(e.pointerId); handle.dragging = true; });
  handle.addEventListener('pointermove', e => { if (!handle.dragging) return; const r = box.getBoundingClientRect(); setSwipe((e.clientX - r.left) / r.width); });
  handle.addEventListener('pointerup', () => { handle.dragging = false; });

  // afford controls
  const inc = $('#incSlider'); inc.value = S.income;
  inc.oninput = () => { S.income = +inc.value; paint(); };
  $$('#sizeSel button').forEach(b => b.onclick = () => { S.size = +b.dataset.s; $$('#sizeSel button').forEach(x => x.classList.toggle('on', x === b)); paint(); });
  $$('#ruleSel button').forEach(b => b.onclick = () => { S.rule = +b.dataset.r; $$('#ruleSel button').forEach(x => x.classList.toggle('on', x === b)); paint(); });
  const ays = $('#affYear'); ays.onchange = () => { S.affYear = +ays.value; paint(); };

  // 3D
  const b3 = $('#btn3d');
  if (R.kind === 'svg') { b3.disabled = true; b3.title = C.no3d; }
  b3.onclick = () => {
    S.ext = !S.ext; b3.classList.toggle('on', S.ext); b3.textContent = S.ext ? '2D' : '3D skyline';
    R.setExtrude(S.ext); if (S.ext) R.compare(false, $('#map2'));
    box.classList.toggle('three', S.ext);
    setMode(S.mode);
    $('#mapstatus').innerHTML = S.ext ? C.status.three : (R.basemap ? C.status.tiles : C.status.paper);
  };
  $('#zin').onclick = () => R.zoom(1 / 1.6);
  $('#zout').onclick = () => R.zoom(1.6);
  $('#zreset').onclick = () => R.reset();

  // layers drawer
  const dr = $('#drawer');
  dr.innerHTML = `<h5>Layers</h5>` + C.layers.map(l => l.missing
    ? `<div class="ly off"><span>✗ ${l.n}</span><button class="about" data-about="${l.id}">why not?</button></div>`
    : `<label class="ly"><input type="checkbox" data-l="${l.id}" ${S.layers[l.id] ? 'checked' : ''}> ${l.n}<button class="about" data-about="${l.id}">ⓘ</button></label>`).join('');
  $$('input[data-l]', dr).forEach(i => i.onchange = () => { S.layers[i.dataset.l] = i.checked; R.setLayer(i.dataset.l, i.checked); paint(); place(); });
  $('#btnLayers').onclick = () => { dr.classList.toggle('on'); if (dr.classList.contains('on')) { kiez.classList.remove('on'); S.sel = null; R.highlight(null); } };

  // about-this-data popovers (legend + drawer)
  box.addEventListener('click', e => {
    const b = e.target.closest('.about'); const pop = $('#aboutpop');
    if (!b) return;
    e.stopPropagation();
    const a = C.about[b.dataset.about]; if (!a) return;
    pop.innerHTML = `<button class="x">×</button><h5>${a.t}</h5><dl><dt>Source</dt><dd>${a.src}</dd><dt>Granularity</dt><dd>${a.gran}</dd><dt>Estimated / caveats</dt><dd>${a.est}</dd></dl>`;
    pop.classList.add('on'); $('.x', pop).onclick = () => pop.classList.remove('on');
  });

  addEventListener('resize', () => { R.resize(); if (box.classList.contains('swiping')) setSwipe(S.swipe); place(); });

  R.on('ready', () => {
    for (const k in S.layers) R.setLayer(k, S.layers[k]);
    setMode('time');
    spawnWalker();
    // first-visit wow: run the time machine once when the map scrolls into view
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); S.year = Y[0]; ys.value = S.year; paint(); setTimeout(() => $('#play').click(), 600); } }, {threshold: .45});
    io.observe(box);
  });
}
