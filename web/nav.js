/* Tom's Car 0.9.9 — full-screen map + turn-by-turn navigation (OpenStreetMap data).
   Map tiles: CARTO / OpenTopoMap / Esri. Search: Photon (komoot). Routing: OSRM. Cameras & schools: Overpass.
   Everything Tom's Car remembers (places, trips, parking) stays in this phone (localStorage / IndexedDB). */
(() => {
  'use strict';
  const NAV = window.NAV = { st: { active: false, route: null, alts: [], preview: null, dest: null, wps: [], said: {} }, ver: 1 };
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const RAD = Math.PI / 180, ER = 6371000;
  const dist = (a, b) => { const dLa = (b[0] - a[0]) * RAD, dLo = (b[1] - a[1]) * RAD; const s = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * RAD) * Math.cos(b[0] * RAD) * Math.sin(dLo / 2) ** 2; return 2 * ER * Math.asin(Math.min(1, Math.sqrt(s))); };
  NAV.dist = dist;
  const segProj = (p, a, b) => {
    const kx = Math.cos(p[0] * RAD) * ER * RAD, ky = ER * RAD;
    const ax = (a[1] - p[1]) * kx, ay = (a[0] - p[0]) * ky, bx = (b[1] - p[1]) * kx, by = (b[0] - p[0]) * ky;
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 ? -(ax * dx + ay * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
    return { d: Math.hypot(ax + t * dx, ay + t * dy), t };
  };
  const stepSay = (st) => (NAV.cfg && NAV.cfg.clip && !EN() && st.plain) ? st.plain : st.text;
  const say = (t) => { if (NAV.logEvt) NAV.logEvt('say', t); try { if (window.TCN && !(NAV.cfg && NAV.cfg.mute)) window.TCN.call('say', t); } catch (e) {} };
  const toast = (t) => { if (window.__ui && window.__ui.toast) window.__ui.toast(t); };
  const redraw = () => { if (window.__ui) window.__ui.setState({ navAt: Date.now() }); };
  NAV.cfg = LS.get('tc-navcfg', { mute: false, rotate: false, avoid: [], histOff: false, cams: true });
  NAV.setCfg = (k, v) => { NAV.cfg[k] = v; LS.set('tc-navcfg', NAV.cfg); redraw(); };
  // ---- 0.9.13: "Ghi chuyến đi" — every GPS fix + what the app made of it, kept in this phone until Tom sends it ----
  const REC = { t0: Date.now(), rows: [], ev: [] };
  try { const prev = localStorage.getItem('tc-drive-cur'); if (prev) localStorage.setItem('tc-drive-prev', prev); localStorage.removeItem('tc-drive-cur'); } catch (e) {}
  let recT = 0;
  const recSave = (force) => { if (!force && Date.now() - recT < 30000) return; recT = Date.now(); try { localStorage.setItem('tc-drive-cur', JSON.stringify(REC)); } catch (e) { REC.rows = REC.rows.slice(-3600); } };
  const r1 = (x, k) => x == null || isNaN(x) ? null : Math.round(x * k) / k;
  NAV.logEvt = (k, v) => { if (!NAV.cfg.rec) return; REC.ev.push([r1((Date.now() - REC.t0) / 1000, 10), k, v == null ? '' : String(v).slice(0, 160)]); if (REC.ev.length > 4000) REC.ev.shift(); };
  NAV.recFix = (f) => {
    if (!NAV.cfg.rec) return; const S = NAV.st;
    REC.rows.push([r1((Date.now() - REC.t0) / 1000, 10), r1(f.lat, 1e6), r1(f.lon, 1e6), r1(f.spd, 10), r1(f.brg, 1), r1(f.acc, 1), S.active ? 1 : 0, S.idx || 0, r1(S.along, 1), S.offRoute ? 1 : 0, S.rerouting ? 1 : 0,
      r1(Car.brg, 1), r1(GLM && map ? map.gl.getBearing() : -Rot.view, 1), follow ? 1 : 0, r1(GLM && map ? map.gl.getPitch() : 0, 1), NAV.lowFx ? 1 : 0]);
    if (REC.rows.length > 4 * 3600) REC.rows.shift(); recSave();
  };
  NAV.recInfo = () => ({ min: Math.round(REC.rows.length / 60), ev: REC.ev.length });
  NAV.recExport = (meta) => { recSave(true); let prev = null; try { prev = JSON.parse(localStorage.getItem('tc-drive-prev') || 'null'); } catch (e) {}
    return JSON.stringify(Object.assign({ v: 1, t0: new Date(REC.t0).toISOString(), engine: NAV.engine, here: !!NAV.cfg.hereKey,
      cols: ['t', 'lat', 'lon', 'spd', 'gpsBrg', 'acc', 'nav', 'idx', 'along', 'off', 'rerouting', 'carBrg', 'mapBrg', 'follow', 'pitch', 'lowFx'], rows: REC.rows, ev: REC.ev, prev }, meta || {})); };

  // ---------------- formatting (Vietnamese, Southern wording) ----------------
  const fmtDist = (m) => m >= 1000 ? (m >= 10000 ? Math.round(m / 1000) : (Math.round(m / 100) / 10).toString().replace('.', ',')) + ' km' : (m >= 100 ? Math.round(m / 50) * 50 : Math.max(10, Math.round(m / 10) * 10)) + ' m';
  const EN = () => window.TC_LANG === 'en';
  const kmClip = (k) => k < 3 ? Math.max(1, Math.round(k * 2) / 2) : k <= 20 ? Math.round(k) : k <= 100 ? Math.round(k / 5) * 5 : k < 135 ? 120 : k < 175 ? 150 : 200;
  const sayDist = (m) => (NAV.cfg && NAV.cfg.clip && !EN() && m >= 1000) ? String(kmClip(m / 1000)).replace('.', ',') + ' cây số' : EN() ? (m >= 1000 ? (Math.round(m / 100) / 10) + ' kilometres' : (Math.round(m / 50) * 50 || 50) + ' metres') : m >= 1000 ? (Math.round(m / 100) / 10).toString().replace('.', ',') + ' cây số' : (Math.round(m / 50) * 50 || 50) + ' mét';
  const fmtDur = (s) => { const m = Math.max(1, Math.round(s / 60)); if (EN()) return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60 ? (m % 60) + ' min' : '') : m + ' min'; return m >= 60 ? Math.floor(m / 60) + ' giờ ' + (m % 60 ? (m % 60) + ' ph' : '') : m + ' phút'; };
  const hhmm = (t) => { const d = new Date(t); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); };
  NAV.fmtDist = fmtDist; NAV.fmtDur = fmtDur; NAV.hhmm = hhmm;
  const DIRW = { uturn: 'Quay đầu', 'sharp right': 'Quẹo gắt qua phải', right: 'Quẹo phải', 'slight right': 'Quẹo nhẹ qua phải', straight: 'Đi thẳng', 'slight left': 'Quẹo nhẹ qua trái', left: 'Quẹo trái', 'sharp left': 'Quẹo gắt qua trái' };
  // 0.9.12 (#119): at a roundabout say which way to go (Australia: clockwise, exit 1 ≈ left, 2 ≈ straight, 3 ≈ right), never "exit number"
  const rbWay = (m) => { if (m.__way) return m.__way; const mod = m.modifier || ''; if (/uturn/.test(mod)) return 'u'; if (/right/.test(mod)) return 'r'; if (/left/.test(mod)) return 'l'; if (mod === 'straight') return 's'; const e = m.exit || 2; return e <= 1 ? 'l' : e === 2 ? 's' : e === 3 ? 'r' : 'u'; };
  const RBW = { l: 'quẹo trái', s: 'đi thẳng', r: 'quẹo phải', u: 'quay đầu' }, RBE = { l: 'turn left', s: 'go straight on', r: 'turn right', u: 'make a U-turn' };
  const side = (m) => /right/.test(m || '') ? 'phải' : /left/.test(m || '') ? 'trái' : '';
  const nm = (s) => { const n = (s.name || '').trim(), r = (s.ref || '').split(';')[0]; return n ? n + (r && n.indexOf(r) < 0 ? ' (' + r + ')' : '') : r; };
  const DIRE = { uturn: 'Make a U-turn', 'sharp right': 'Turn sharp right', right: 'Turn right', 'slight right': 'Bear right', straight: 'Go straight', 'slight left': 'Bear left', left: 'Turn left', 'sharp left': 'Turn sharp left' };
  const enText = (s, wpName) => {
    const m = s.maneuver, t = m.type, mod = m.modifier || '', n = nm(s), onto = n ? ' onto ' + n : '', sd = /right/.test(mod) ? 'right' : /left/.test(mod) ? 'left' : '';
    switch (t) {
      case 'depart': return 'Head off' + (n ? ' on ' + n : '');
      case 'arrive': return (wpName ? 'Arrive at ' + wpName : 'You have arrived') + (sd ? ', on the ' + sd : '');
      case 'merge': return 'Merge' + (sd ? ' ' + sd : '') + onto;
      case 'on ramp': return 'Take the ramp' + (sd ? ' on the ' + sd : '') + onto;
      case 'off ramp': { const d = (s.destinations || '').split(',')[0].replace(/^[^:]*:\s*/, ''); return 'Take exit' + (s.exits ? ' ' + s.exits.split(';')[0] : '') + (sd ? ' on the ' + sd : '') + (d ? ' towards ' + d : onto); }
      case 'fork': return 'Keep ' + (sd || 'straight') + (n ? ' on ' + n : '');
      case 'end of road': return 'At the end of the road, ' + (DIRE[mod] || 'turn').toLowerCase() + onto;
      case 'roundabout': case 'rotary': case 'roundabout turn': return 'At the roundabout, ' + RBE[rbWay(m)] + onto;
      case 'exit roundabout': case 'exit rotary': return 'Exit the roundabout' + onto;
      case 'continue': case 'new name': return mod && mod !== 'straight' ? (DIRE[mod] || 'Continue') + onto : 'Continue' + (n ? ' on ' + n : '');
      default: return (DIRE[mod] || 'Continue') + onto;
    }
  };
  const viText0 = (s, wpName) => {
    const m = s.maneuver, t = m.type, mod = m.modifier || '', n = nm(s), onto = n ? ' vô ' + n : '';
    switch (t) {
      case 'depart': return 'Xuất phát' + (n ? ' theo ' + n : '');
      case 'arrive': return (wpName ? 'Tới ' + wpName : 'Tới nơi') + (side(mod) ? ', ở bên tay ' + side(mod) : '');
      case 'merge': return 'Nhập làn' + (side(mod) ? ' bên ' + side(mod) : '') + onto;
      case 'on ramp': return 'Lên đường dẫn' + (side(mod) ? ' bên ' + side(mod) : '') + onto;
      case 'off ramp': { const d = (s.destinations || '').split(',')[0].replace(/^[^:]*:\s*/, ''); return 'Ra lối' + (s.exits ? ' số ' + s.exits.split(';')[0] : '') + (side(mod) ? ' bên ' + side(mod) : '') + (d ? ' về ' + d : onto); }
      case 'fork': return 'Giữ ' + (side(mod) || 'thẳng') + (n ? ' theo ' + n : '');
      case 'end of road': return 'Cuối đường ' + (DIRW[mod] || 'quẹo').toLowerCase() + onto;
      case 'roundabout': case 'rotary': case 'roundabout turn': return 'Tới bùng binh, ' + RBW[rbWay(m)] + onto;
      case 'exit roundabout': case 'exit rotary': return 'Ra khỏi bùng binh' + onto;
      case 'continue': case 'new name': return mod && mod !== 'straight' ? (DIRW[mod] || 'Đi tiếp') + onto : 'Đi thẳng' + (n ? ' theo ' + n : '');
      default: return (DIRW[mod] || 'Đi tiếp') + onto;
    }
  };
  const viText = (s, wpName) => EN() ? enText(s, wpName) : viText0(s, wpName);
  const iconKey = (s) => { const t = s.maneuver.type, mod = s.maneuver.modifier || 'straight'; if (t === 'arrive') return 'arrive'; if (/roundabout|rotary/.test(t)) return 'round'; if (t === 'fork' || t === 'off ramp' || t === 'on ramp' || t === 'merge') return /right/.test(mod) ? 'slight right' : /left/.test(mod) ? 'slight left' : 'straight'; return mod; };

  // ---------------- map ----------------
  // CARTO raster tiles now need an API key (watermark without one) → Esri basemaps, no key needed
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
  const TILES = {
    dark: { L: [[ESRI + 'Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', 16], [ESRI + 'Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', 16]], a: 'Bản đồ © Esri, HERE, Garmin, © OpenStreetMap' },
    light: { L: [[ESRI + 'World_Street_Map/MapServer/tile/{z}/{y}/{x}', 19]], a: 'Bản đồ © Esri, HERE, Garmin, © OpenStreetMap' },
    topo: { L: [['https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', 17]], a: '© OpenStreetMap · SRTM · © OpenTopoMap (CC-BY-SA)' },
    sat: { L: [[ESRI + 'World_Imagery/MapServer/tile/{z}/{y}/{x}', 18], [ESRI + 'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', 18]], a: 'Ảnh vệ tinh © Esri, Maxar, Earthstar Geographics' }
  };
  // offline tiles (prefetched before a long trip) live in IndexedDB; a tile that fails to load is looked up there
  let dbp = null;
  const db = () => dbp || (dbp = new Promise((res) => { try { const r = indexedDB.open('tc-tiles', 1); r.onupgradeneeded = () => r.result.createObjectStore('t'); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (e) { res(null); } }));
  const idbGet = (k) => db().then((d) => d ? new Promise((res) => { try { const q = d.transaction('t').objectStore('t').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); } catch (e) { res(null); } }) : null);
  const idbPut = (k, v) => db().then((d) => { if (d) try { d.transaction('t', 'readwrite').objectStore('t').put(v, k); } catch (e) {} });
  const tileUrl = (tpl, z, x, y) => tpl.replace('{s}', 'abc'[Math.abs(x + y) % 3]).replace('{z}', z).replace('{x}', x).replace('{y}', y).replace('{r}', '');

  // 0.9.11 (#99): every Road Trip stop gets a real position — looked up once from its address (kept on the phone),
  // else placed by its km along the route; labels stay readable (zoomed out: start, next stop, end only)
  const STOPLL = (() => { try { return JSON.parse(localStorage.getItem('tc-stopll') || '{}'); } catch (e) { return {}; } })();
  const stopBusy = {}; let stopQ = [];
  const stopRun = () => { if (stopQ.length === 0 || stopRun.on) return; stopRun.on = true; const q = stopQ.shift();
    fetch('https://photon.komoot.io/api/?limit=1&lang=en&bbox=112.9,-43.8,153.7,-10.6&q=' + encodeURIComponent(q)).then((r) => r.json()).then((j) => { const f = j.features && j.features[0]; STOPLL[q] = f ? [f.geometry.coordinates[1], f.geometry.coordinates[0]] : 0; })
      .catch(() => { delete stopBusy[q]; }).then(() => { try { localStorage.setItem('tc-stopll', JSON.stringify(STOPLL)); } catch (e) {} lastSig = ''; stopRun.on = false; setTimeout(stopRun, 1100); }); };
  NAV.stopLL = (q) => { if (!q) return null; const c = STOPLL[q]; if (c) return { lat: c[0], lon: c[1] }; if (c === 0 || stopBusy[q]) return null; stopBusy[q] = 1; stopQ.push(q); stopRun(); return null; };
  const ptAtFrac = (pts, f) => { if (!pts || pts.length < 2) return null; const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + dist(pts[i - 1], pts[i])); const t = Math.max(0, Math.min(1, f)) * L[L.length - 1]; let i = 1; while (i < L.length - 1 && L[i] < t) i++; const k = (t - L[i - 1]) / ((L[i] - L[i - 1]) || 1); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]; };
  let map = null, layer = null, layerKey = '', box = null, wrap = null;
  // 0.9.13 (#126): vector map (MapLibre) by default; "Bản đồ kiểu cũ" (Leaflet + picture tiles) stays as a choice,
  // and is used automatically when the phone cannot draw vector maps or starts without internet (saved offline tiles)
  let Lf = window.L, GLM = false;
  const OFM = 'https://tiles.openfreemap.org/styles/';
  const rasterStyle = (T) => ({ version: 8, sources: Object.assign({}, ...T.L.map((l, i) => ({ ['r' + i]: { type: 'raster', tiles: l[0].indexOf('{s}') >= 0 ? ['a', 'b', 'c'].map((x) => l[0].replace('{s}', x)) : [l[0]], tileSize: 256, maxzoom: l[1], attribution: i === 0 ? T.a : '' } }))),
    layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0b1620' } }].concat(T.L.map((l, i) => ({ id: 'r' + i, type: 'raster', source: 'r' + i }))) });
  const glStyle = (key) => key === 'light' ? OFM + 'liberty' : key === 'dark' ? OFM + 'dark' : rasterStyle(TILES[key] || TILES.light);
  let routeL = null, routeC = null, altL = [], trailL = null, van = null, /*car*/ marks = [], follow = true, userAt = 0, lastVan = null, lastSig = '', fittedSig = '';
  const mkLayer = (T) => {
    const CTL = window.L.TileLayer.extend({ createTile(c, done) { const img = document.createElement('img'); img.alt = ''; const url = this.getTileUrl(c); img.onload = () => done(null, img); img.onerror = () => { if (img.__f) { done(new Error('tile'), img); return; } img.__f = 1; idbGet(url).then((b) => { if (b) img.src = URL.createObjectURL(b); else done(new Error('tile'), img); }); }; img.src = url; return img; } });
    return window.L.layerGroup(T.L.map((l, i) => new CTL(l[0], { attribution: i === 0 ? T.a : '', maxNativeZoom: l[1], maxZoom: 19, subdomains: 'abc', detectRetina: false, zIndex: i + 1, keepBuffer: 1, updateWhenZooming: false })));
  };
  const ensure = () => {
    if (map) return true;
    box = document.getElementById('tcmap'); if (!box) return false;
    GLM = !!(window.GLL && window.GLL.ok && NAV.cfg.engine !== 'old' && navigator.onLine !== false && !NAV.__glFailed);
    NAV.engine = GLM ? 'gl' : 'old';
    if (GLM) {
      Lf = window.GLL; wrap = box;
      map = Lf.map(box, { style: glStyle('light'), center: [-37.75, 144.73], zoom: 13 }); map.styleKey = 'light';
      // vector map server not answering → use the old picture map for this session instead of showing an empty map
      let styled = false; map.gl.once('style.load', () => { styled = true; });
      setTimeout(() => { if (styled || !map || !GLM) return; NAV.__glFailed = true; NAV.logEvt && NAV.logEvt('gl-fallback');
        try { map.gl.remove(); } catch (e) {} box.innerHTML = ''; map = null; van = null; layer = null; layerKey = ''; lastSig = ''; fittedSig = ''; routeL = routeC = trailL = passedL = null; altL = []; marks = []; passedL0 = '';
        GLM = false; loopOn = false; box.__first = false; box.__sz = ''; NAV.__shown = false; redraw(); toast('Bản đồ vector chưa tải được — tạm dùng bản đồ kiểu cũ'); }, 10000);
      map.gl.on('error', (e) => { const m = String(e && e.error && (e.error.message || e.error.url) || ''); if (map.styleKey === 'dark' && /styles\/dark/.test(m)) { map.styleKey = ''; map.setStyle('dark2', OFM + 'fiord'); } });
      const off = () => { follow = false; userAt = Date.now(); redraw(); };
      map.on('dragstart', off);
      let zLab = 0; map.on('zoomend', () => { const zl = map.getZoom() >= 9 ? 1 : 0; if (zl !== zLab) { zLab = zl; lastSig = ''; } });
      map.on('click', (e) => { if (NAV.onMapClick) NAV.onMapClick(e.latlng); });
      box.addEventListener('pointerdown', () => { try { window.__mapTouched && window.__mapTouched(); } catch (x) {} });
      return true;
    }
    if (!window.L) return false; Lf = window.L;
    wrap = document.createElement('div'); wrap.style.cssText = 'position:absolute;left:50%;top:50%;width:100%;height:100%;transform:translate(-50%,-50%)';
    box.appendChild(wrap);
    map = window.L.map(wrap, { zoomControl: false, attributionControl: true, preferCanvas: true, zoomSnap: 0.5, inertia: true }).setView([-37.75, 144.73], 13);
    map.attributionControl.setPrefix('');
    const off = () => { follow = false; userAt = Date.now(); redraw(); };
    map.on('dragstart', off);
    wrap.addEventListener('wheel', off, { passive: true });
    wrap.addEventListener('touchstart', (e) => { if (e.touches && e.touches.length > 1) off(); }, { passive: true });
    let zLab = 0; map.on('zoomend', () => { const zl = map.getZoom() >= 9 ? 1 : 0; if (zl !== zLab) { zLab = zl; lastSig = ''; } });
    map.on('click', (e) => { if (Date.now() - Rot.movedAt < 400) return; if (NAV.onMapClick) NAV.onMapClick(e.latlng); });
    // 0.9.11 (#95): free rotation like Google Maps — two fingers twist / pinch, one finger pans (also when turned)
    map.dragging.disable(); map.touchZoom.disable(); map.doubleClickZoom.enable();
    const P = new Map(); let g = null;
    const scl = () => { const r = box.getBoundingClientRect(); return (r.width / (box.offsetWidth || r.width)) || 1; };
    const two = () => { const a = [...P.values()]; return { d: Math.hypot(a[1].x - a[0].x, a[1].y - a[0].y), a: Math.atan2(a[1].y - a[0].y, a[1].x - a[0].x) * 180 / Math.PI }; };
    box.addEventListener('pointerdown', (e) => { if (e.target.closest && e.target.closest('.leaflet-marker-icon,.leaflet-control')) return; P.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { window.__mapTouched && window.__mapTouched(); } catch (x) {} try { box.setPointerCapture(e.pointerId); } catch (x) {}
      if (P.size === 2) { const t = two(); g = { d0: t.d, a0: t.a, z0: map.getZoom(), r0: Rot.view }; } });
    box.addEventListener('pointermove', (e) => { const q = P.get(e.pointerId); if (!q) return; const dx = e.clientX - q.x, dy = e.clientY - q.y;
      if (P.size === 1) { if (Math.abs(dx) + Math.abs(dy) < 1) return; const s = scl(), th = -Rot.view * RAD, c = Math.cos(th), sn = Math.sin(th);
        const mx = (dx * c - dy * sn) / s, my = (dx * sn + dy * c) / s; map.panBy([-mx, -my], { animate: false }); q.x = e.clientX; q.y = e.clientY;
        if (Math.abs(dx) + Math.abs(dy) > 2) { Rot.movedAt = Date.now(); off(); } return; }
      q.x = e.clientX; q.y = e.clientY; if (P.size !== 2 || !g) return; const t = two();
      const dz = Math.log2(t.d / (g.d0 || 1)); if (Math.abs(dz) > 0.05) { map.setZoom(Math.max(4, Math.min(19, g.z0 + dz)), { animate: false }); userAt = Date.now(); }
      const da = ((t.a - g.a0 + 540) % 360) - 180; if (Rot.free || Math.abs(da) > 8) { Rot.free = true; Rot.ang = (g.r0 + da + 360) % 360; Rot.movedAt = Date.now(); startLoop(); } });
    const up = (e) => { P.delete(e.pointerId); if (P.size < 2) g = null; };
    box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
    box.style.touchAction = 'none';
    return true;
  };
  NAV.zoomIn = () => { if (map) { map.zoomIn(1); follow = false; userAt = Date.now(); } };
  NAV.zoomOut = () => { if (map) { map.zoomOut(1); follow = false; userAt = Date.now(); } };
  NAV.locate = () => { follow = true; userAt = 0; if (map && lastVan) map.setView(lastVan, NAV.st.active ? map.getZoom() : 15, { animate: true }); redraw(); };
  NAV.following = () => follow;
  NAV.fitAll = () => { if (!map) return; const ls = [routeL, trailL].concat(altL).filter(Boolean); let b = null; ls.forEach((l) => { try { const lb = l.getBounds(); b = b ? b.extend(lb) : lb; } catch (e) {} }); marks.forEach((m) => { b = b ? b.extend(m.getLatLng()) : Lf.latLngBounds(m.getLatLng(), m.getLatLng()); }); if (lastVan) b = b ? b.extend(lastVan) : null; if (b && b.isValid()) { follow = false; userAt = Date.now(); map.fitBounds(b, { paddingTopLeft: [NAV.padL || 40, 150], paddingBottomRight: [80, 130], maxZoom: 15 }); } };
  NAV.flyTo = (ll, z) => { if (!map) return; follow = false; userAt = Date.now(); map.setView(ll, z || 15, { animate: true }); };
  const pin = (ll, html, z) => Lf.marker(ll, { icon: Lf.divIcon({ className: '', html, iconSize: [0, 0] }), keyboard: false, zIndexOffset: z || 0 });
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dot = (bg, inner, label, logo) => '<div style="transform:translate(-13px,-13px);display:flex;align-items:center;gap:5px;white-space:nowrap"><span style="min-width:26px;height:26px;border-radius:13px;box-sizing:border-box;padding:0 4px;background:' + bg + ';border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);color:#fff;font:800 13px Overpass,sans-serif;display:flex;align-items:center;justify-content:center">' + inner + '</span>' + (label ? '<span style="display:flex;align-items:center;gap:4px;font:700 12px Overpass,sans-serif;color:#10202c;background:rgba(255,255,255,.94);padding:2px 7px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.3)">' + (logo ? '<img src="' + logo + '" style="width:16px;height:16px;border-radius:3px">' : '') + esc(label) + '</span>' : '') + '</div>';
  const arrowIco = (brg) => Lf.divIcon({ className: '', iconSize: [0, 0], html: '<div style="transform:translate(-22px,-22px) rotate(' + Math.round(brg || 0) + 'deg);width:44px;height:44px"><svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="rgba(47,208,245,0.18)"/><path d="M22 6l11 28-11-6-11 6z" fill="#FBB040" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/></svg></div>' });

  // o = { show, night, style, bright, van, brg, spd, drive, padL, rt:{sig,pts,stops,color}, places:[{lat,lon,name,logo}], park }
  NAV.sync = (o) => {
    document.body.classList.toggle('map-on', !!o.show);
    if (!o.show) { NAV.__shown = false; return; }
    if (!ensure()) return;
    NAV.padL = o.padL || 40;
    let key = o.style === 'auto' || !TILES[o.style] ? (o.night ? 'dark' : 'light') : o.style;
    // #102: satellite photos are heavy — whole-trip view (zoomed out) and fast driving use the light map instead
    if (key === 'sat' && (map.getZoom() < 10 || (o.satFast !== false && (o.spd || 0) > 80))) key = o.night ? 'dark' : 'light';
    if (GLM) {
      if (layerKey !== key) { layerKey = key; map.setStyle(key, glStyle(key)); }
      const cv = map.gl.getCanvas(); const flt = o.bright && o.bright !== 100 ? 'brightness(' + (o.bright / 100) + ')' : ''; if (cv.style.filter !== flt) cv.style.filter = flt;
      const sz = box.clientWidth + 'x' + box.clientHeight;
      if (box.clientWidth && (sz !== box.__sz || !NAV.__shown)) { box.__sz = sz; NAV.__shown = true; map.invalidateSize(); startLoop(); }
    } else {
    if (layerKey !== key) { if (layer) map.removeLayer(layer); layer = mkLayer(TILES[key]).addTo(map); layerKey = key; }
    const tp = wrap.querySelector('.leaflet-tile-pane'); if (tp) tp.style.filter = o.bright && o.bright !== 100 ? 'brightness(' + (o.bright / 100) + ')' : '';
    if (!box.__sized) { box.__sized = true; setTimeout(() => map.invalidateSize(false), 60); }
    // 0.9.13 (#123): when the map shows again or changes size, only measure it again — never wipe the picture (that flashed black)
    { const sz = box.clientWidth + 'x' + box.clientHeight;
      if (box.clientWidth && (sz !== box.__sz || !NAV.__shown)) { box.__sz = sz; NAV.__shown = true; if (rotOn) sizeWrap(); map.invalidateSize(false); setTimeout(() => map.invalidateSize(false), 120); NAV.__shownAt = Date.now(); if (follow && (Car.cur || o.van)) map.setView(Car.cur || o.van, map.getZoom(), { animate: false }); startLoop(); }
      // still no map picture 4 s after showing (and online) → build the layer again
      if (NAV.__shownAt && Date.now() - NAV.__shownAt > 4000 && Date.now() - NAV.__shownAt < 9000 && layer && !wrap.querySelector('.leaflet-tile-loaded') && navigator.onLine !== false) { NAV.__shownAt = 0; map.removeLayer(layer); layer = mkLayer(TILES[layerKey]).addTo(map); } }
    }
    // what to draw: active/preview navigation route > Road Trip route; history trail; places
    const S = NAV.st, R = S.route;
    const sig = (R ? 'n' + R.id + ':' + S.altPick + ':' + S.alts.length : '') + '|' + (o.rt ? o.rt.sig : '') + '|' + (S.preview ? S.preview.t0 : '') + '|' + (o.places || []).map((p) => p.name).join(',') + '|' + (o.park ? o.park.t : '') + '|' + (S.wps || []).length;
    if (sig !== lastSig) {
      lastSig = sig;
      [routeL, routeC, trailL, passedL].concat(altL).forEach((l) => { if (l) map.removeLayer(l); }); routeL = routeC = trailL = passedL = null; passedL0 = ''; altL = [];
      marks.forEach((m) => map.removeLayer(m)); marks = [];
      if (R) {
        S.alts.forEach((a, i) => { if (a === R) return; const l = Lf.polyline(a.pts, { color: '#7d8f9c', weight: 7, opacity: 0.75 }).addTo(map); l.on('click', () => NAV.pickAlt(i)); altL.push(l); });
        routeC = Lf.polyline(R.pts, { color: '#0b5f7a', weight: 12, opacity: 0.9, lineCap: 'round' }).addTo(map);
        routeL = Lf.polyline(R.pts, { color: '#2fd0f5', weight: 7, opacity: 1, lineCap: 'round' }).addTo(map);
        const wps = S.wps || [];
        wps.forEach((w, i) => { if (i === 0) return; const last = i === wps.length - 1; marks.push(pin([w.lat, w.lon], dot(last ? '#D0202E' : '#F28A1A', last ? '⚑' : String(i), w.name, w.logo), 500).addTo(map)); });
      } else if (o.rt && o.rt.pts && o.rt.pts.length > 1) {
        routeC = Lf.polyline(o.rt.pts, { color: '#5a3200', weight: 11, opacity: 0.7, lineCap: 'round' }).addTo(map);
        routeL = Lf.polyline(o.rt.pts, { color: '#FF8A1F', weight: 6, opacity: 1, lineCap: 'round' }).addTo(map);
        const zoomed = map.getZoom() >= 9;
        (o.rt.stops || []).forEach((s) => { let ll = s.lat != null ? [s.lat, s.lon] : null;
          if (!ll && s.q) { const g = NAV.stopLL(s.q); if (g) ll = [g.lat, g.lon]; }
          if (!ll && s.frac != null) ll = ptAtFrac(s.rev ? o.rt.pts.slice().reverse() : o.rt.pts, s.frac);
          if (!ll) return;
          const lab = s.start || s.end || s.next || zoomed ? s.short : '';
          marks.push(pin(ll, dot(s.start ? '#14A05A' : s.end ? '#D0202E' : s.next ? '#FBB040' : '#F28A1A', s.start ? '●' : s.end ? '⚑' : String(s.n || ''), lab, s.logo), s.start || s.end ? 600 : s.next ? 500 : 400).on('click', () => { if (s.id && window.__ui) window.__ui.setState({ dlg: 'stop', stopId: s.id }); }).addTo(map)); });
        (o.rt.towns || []).forEach((t) => { if (!zoomed && !t.big) return; marks.push(pin([t.lat, t.lon], '<div style="transform:translate(-50%,-50%);font:700 12px Overpass,sans-serif;color:#fff;text-shadow:0 0 3px #000,0 0 6px #000;white-space:nowrap;pointer-events:none">' + t.name + '</div>', 50).addTo(map)); });
      }
      if (S.preview && S.preview.pts && S.preview.pts.length > 1) {
        trailL = Lf.polyline(S.preview.pts, { color: '#2fd0f5', weight: 6, opacity: 0.95 }).addTo(map);
        marks.push(pin(S.preview.pts[0], dot('#14A05A', '●', ''), 300).addTo(map));
        marks.push(pin(S.preview.pts[S.preview.pts.length - 1], dot('#D0202E', '⚑', ''), 300).addTo(map));
      }
      (o.places || []).forEach((p) => marks.push(pin([p.lat, p.lon], dot('#F28A1A', p.icon || '', p.name, p.logo), 100).on('click', () => { if (NAV.onPlaceClick) NAV.onPlaceClick(p); }).addTo(map)));
      if (o.park) marks.push(pin([o.park.lat, o.park.lon], dot('#2f6bf5', 'P', 'Xe đậu ở đây'), 200).addTo(map));
      const fs = (R ? 'n' + R.id + ':' + S.altPick : o.rt ? o.rt.sig : '') + (S.preview ? S.preview.t0 : '');
      if (fs && fs !== fittedSig && !S.active) { fittedSig = fs; setTimeout(NAV.fitAll, 80); }
    }
    // the car: targets only — the animation loop moves the arrow and the map smoothly (#91)
    lastVan = o.van || null; Car.spd = o.spd || 0; Car.drive = !!o.drive;
    if (o.van) {
      let tgt = o.van, brg = null;
      // 0.9.13 (#120/#124): like Google Maps / Waze — below 8 km/h the heading is held (a parked phone's GPS heading is noise);
      // on the route it follows the road ~40 m ahead, not each short piece of line; at the start it takes the route's first direction
      const moving = (o.spd || 0) >= 8;
      if (S.active && !S.offRoute && S.snap && Date.now() - S.snap.t < 4000) { tgt = S.snap.p; if (moving || !Car.headInit) brg = S.snap.brgA != null ? S.snap.brgA : S.snap.brg; }
      else if (S.active && !S.offRoute && R && R.pts.length > 1 && !S.snap && !Car.headInit) brg = bearingOf(R.pts[0], posAlong(R, 40));
      else if (o.brg != null && moving) brg = o.brg;
      // standing still: the arrow stays put instead of wandering with GPS drift
      if ((o.spd || 0) < 3 && Car.to && dist(Car.to, tgt) < Math.max(15, Math.min(40, o.acc || 15))) tgt = Car.to;
      if (!Car.to || dist(Car.to, tgt) > 0.5) { const nw = performance.now(); if (Car.t0) Car.iv = Math.max(600, Math.min(2000, (Car.iv || 1000) * 0.7 + (nw - Car.t0) * 0.3)); Car.from = Car.cur || tgt; Car.to = tgt; Car.t0 = nw; }
      if (brg != null) { Car.brgT = brg; Car.headInit = true; } else if (Car.brgT == null) Car.brgT = 0;
      if (!van) { Car.cur = tgt; Car.brg = Car.brgT || 0; van = Lf.marker(tgt, { icon: arrowIco(0), keyboard: false, zIndexOffset: 1000, flat: true }).addTo(map); }
      if (!follow && userAt && (o.drive || S.active) && Date.now() - userAt > 10000) follow = true;
      if (!box.__first && follow) { box.__first = true; map.setView(tgt, 15, { animate: false }); }
      startLoop();
    }
    Car.rotate = !!(NAV.cfg.rotate && (S.active || Car.drive));   // heading-up while navigating or driving (#95)
    // passed part of the route turns grey (#91)
    if (R && S.active && routeL && passedL0 !== S.idx + ':' + R.id) {
      passedL0 = S.idx + ':' + R.id;
      const k = Math.min(R.pts.length - 1, (S.idx || 0) + 1), cut = S.snap ? S.snap.p : R.pts[k];
      const done = R.pts.slice(0, k).concat([cut]), rest = [cut].concat(R.pts.slice(k));
      if (!passedL) passedL = Lf.polyline(done, { color: '#8a97a3', weight: 7, opacity: 0.85, lineCap: 'round' }).addTo(map); else passedL.setLatLngs(done);
      routeL.setLatLngs(rest); if (routeC) routeC.setLatLngs(rest);
      if (passedL._map || passedL.map) passedL.bringToBack();
    }
    if (!S.active && passedL) { map.removeLayer(passedL); passedL = null; passedL0 = ''; }
  };
  // ---------------- smooth car + camera (#91) ----------------
  const Car = { cur: null, from: null, to: null, t0: 0, brg: 0, brgT: 0, spd: 0, rotate: false, drive: false };
  const Rot = { free: false, ang: 0, view: 0, movedAt: 0 };   // view = how far the map is turned on screen (deg, clockwise)
  // compass: 1st tap brings the map back to the car; when already following it switches heading-up ⇄ north-up (remembered in Cài Đặt)
  NAV.compass = () => {
    let r = 'follow';
    if (!(Rot.free || !follow)) { NAV.cfg.rotate = !NAV.cfg.rotate; r = 'toggle'; toast(NAV.cfg.rotate ? (EN() ? 'Heading up' : 'Theo hướng xe chạy') : (EN() ? 'North up' : 'Hướng Bắc lên trên')); }
    Rot.free = false; Rot.ang = 0; follow = true; userAt = 0;
    if (map && !GLM && (Car.cur || lastVan)) map.setView(Car.cur || lastVan, NAV.st.active ? map.getZoom() : Math.max(map.getZoom(), 15), { animate: true });
    startLoop(); redraw(); return r;
  };
  NAV.viewAngle = () => Rot.view;
  let passedL = null, passedL0 = '', loopOn = false, lastFrame = 0, rotOn = false, lastIcoBrg = -999, rotSz = '';
  const sizeWrap = () => { rotSz = box.clientWidth + 'x' + box.clientHeight; const d = Math.ceil(Math.hypot(box.clientWidth, box.clientHeight)) + 8; wrap.style.width = rotOn ? d + 'px' : '100%'; wrap.style.height = rotOn ? d + 'px' : '100%'; };
  const bearingOf = (a, b) => { const y = Math.sin((b[1] - a[1]) * RAD) * Math.cos(b[0] * RAD), x = Math.cos(a[0] * RAD) * Math.sin(b[0] * RAD) - Math.sin(a[0] * RAD) * Math.cos(b[0] * RAD) * Math.cos((b[1] - a[1]) * RAD); return (Math.atan2(y, x) / RAD + 360) % 360; };
  const angDiff = (a, b) => ((b - a + 540) % 360) - 180;
  // a point m metres along the route from the start (or from distance d0)
  const posAlong = (R, m, d0) => { const t = Math.max(0, Math.min(R.cum[R.cum.length - 1], (d0 || 0) + m)); let i = 1; while (i < R.cum.length - 1 && R.cum[i] < t) i++; const k = (t - R.cum[i - 1]) / ((R.cum[i] - R.cum[i - 1]) || 1); const A = R.pts[i - 1], B = R.pts[i] || A; return [A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k]; };
  const startLoop = () => { if (loopOn) return; loopOn = true; requestAnimationFrame(frame); };
  const frame = (ts) => {
    if (!map || !Car.to || !document.body.classList.contains('map-on') || window.__idleOn) { loopOn = false; return; }
    if (GLM) { glFrame(ts); if (loopOn) requestAnimationFrame(frame); return; }
    requestAnimationFrame(frame);
    const fps = (NAV.st.active || Car.drive || Date.now() - Rot.movedAt < 1500) ? 24 : 6;   // smooth while turning the map
    if (ts - lastFrame < 1000 / fps) return; lastFrame = ts;
    // glide from the last position to the new one over ~1 s (fixes arrive about once a second)
    const k = Math.min(Car.spd >= 5 ? 1.2 : 1, (ts - Car.t0) / (Car.iv || 1000));
    Car.cur = [Car.from[0] + (Car.to[0] - Car.from[0]) * k, Car.from[1] + (Car.to[1] - Car.from[1]) * k];
    Car.brg = (Car.brg + angDiff(Car.brg, Car.brgT || 0) * 0.18 + 360) % 360;
    van.setLatLng(Car.cur);
    // rotation: heading-up while navigating (map turns, arrow points up), otherwise north-up (arrow turns)
    const rot = Car.rotate;
    const ang = Rot.free ? Rot.ang : (rot ? (360 - Car.brg) % 360 : 0); Rot.view = ang;
    const turned = Math.abs(((ang + 540) % 360) - 180) < 179.5;   // any angle but 0
    if (turned !== rotOn || (turned && box.clientWidth + 'x' + box.clientHeight !== rotSz)) { rotOn = turned; sizeWrap(); map.invalidateSize(false); lastIcoBrg = -999; }
    wrap.style.transform = 'translate(-50%,-50%)' + (turned ? ' rotate(' + ang.toFixed(1) + 'deg)' : '');
    const cmp = document.getElementById('tccompassN'); if (cmp) cmp.style.transform = 'rotate(' + ang.toFixed(0) + 'deg)';
    const icoB = (Math.round(Car.brg / 3) * 3 + 360) % 360;
    if (icoB !== lastIcoBrg) { lastIcoBrg = icoB; van.setIcon(arrowIco(icoB)); }
    if (follow) {
      let z = map.getZoom();
      if (NAV.st.active) { const s = Car.spd; const zt = s > 85 ? 14.5 : s > 60 ? 15.5 : s > 30 ? 16.5 : 17; if (Math.abs(zt - z) >= 0.5) z = zt; }
      let c = Car.cur;
      if (NAV.st.active || Car.drive) {   // keep the car in the lower part of the screen, road ahead visible
        const h = box.clientHeight || 720, off = h * 0.22, b = -ang * RAD;
        const p0 = map.project(Car.cur, z); c = map.unproject(p0.add([Math.sin(b) * off, -Math.cos(b) * off]), z);
      }
      map.setView(c, z, { animate: false });
    }
  };
  // ---- vector map camera (#126): follow the car like Google Maps — car low on the screen, road ahead up,
  // tilted 3D while driving, zoom by speed and closer just before a turn; all changes ease in, nothing jumps ----
  const Cam = { z: null, b: 0, p: 0, last: 0, slow: 0, n: 0 };
  NAV.lowFx = false;
  const glFrame = (ts) => {
    const S = NAV.st, busy = S.active || Car.drive, easing = Cam.easing;
    const fps = busy || easing ? 30 : 8;
    if (ts - lastFrame < 1000 / fps - 2) return;
    const dt = Math.min(0.25, lastFrame ? (ts - lastFrame) / 1000 : 0.03); lastFrame = ts;
    // weaker phones: if frames keep coming slowly while driving, drop the 3D tilt (S10-class phones stay smooth)
    if (busy) { Cam.n++; if (dt > 0.075) Cam.slow++; if (Cam.n >= 150) { if (Cam.slow > 60 && !NAV.lowFx) { NAV.lowFx = true; NAV.logEvt && NAV.logEvt('lowfx'); } Cam.n = Cam.slow = 0; } }
    const k = Math.min(Car.spd >= 5 ? 1.2 : 1, (ts - Car.t0) / (Car.iv || 1000));
    Car.cur = [Car.from[0] + (Car.to[0] - Car.from[0]) * k, Car.from[1] + (Car.to[1] - Car.from[1]) * k];
    const d = angDiff(Car.brg, Car.brgT || 0); Car.brg = (Car.brg + Math.max(-120 * dt, Math.min(120 * dt, d * Math.min(1, dt * 4))) + 360) % 360;   // turn at most 120°/s
    van.setLatLng(Car.cur); van.setRotation(Car.brg);
    let still = Math.abs(d) < 0.5 && k >= 1;
    if (follow) {
      const g = map.gl, z0 = g.getZoom();
      let zt = z0;
      if (S.active) { const sp = Car.spd; zt = sp > 85 ? 14.8 : sp > 60 ? 15.6 : sp > 30 ? 16.4 : 16.9; if (S.toNext != null && S.toNext < 220 && sp < 75) zt = 17.3; }
      else if (Car.drive) zt = Math.max(15, Math.min(17, z0));
      const bt = Car.rotate ? Car.brg : 0;
      const pt = NAV.cfg.tilt !== false && !NAV.lowFx && busy ? 52 : 0;
      const z = z0 + (zt - z0) * Math.min(1, dt * 1.6), b = (g.getBearing() + angDiff(g.getBearing(), bt) * Math.min(1, dt * 5) + 360) % 360, p = g.getPitch() + (pt - g.getPitch()) * Math.min(1, dt * 1.8);
      const h = box.clientHeight || 720, pad = { top: busy ? Math.round(h * (pt ? 0.34 : 0.42)) : 0, bottom: 0, left: NAV.padL > 100 ? NAV.padL : 0, right: 0 };
      Cam.easing = Math.abs(zt - z) > 0.02 || Math.abs(angDiff(b, bt)) > 0.3 || Math.abs(pt - p) > 0.3;
      const c = g.getCenter(); const moved = Math.abs(c.lat - Car.cur[0]) + Math.abs(c.lng - Car.cur[1]) > 2e-7;
      if (moved || Cam.easing || Cam.padT !== pad.top || Cam.padL !== pad.left) { Cam.padT = pad.top; Cam.padL = pad.left; g.jumpTo({ center: [Car.cur[1], Car.cur[0]], zoom: z, bearing: b, pitch: p, padding: pad }); still = false; }
    } else Cam.easing = false;
    Rot.view = (360 - map.gl.getBearing()) % 360;
    const cmp = document.getElementById('tccompassN'); if (cmp) cmp.style.transform = 'rotate(' + (-map.gl.getBearing()).toFixed(0) + 'deg)';
    if (still && !busy && !Cam.easing) { loopOn = false; }   // parked and settled: stop drawing until the next fix
  };
  NAV.carPos = () => Car.cur;
  NAV.debug = () => ({ engine: NAV.engine, carBrg: Car.brg, carBrgT: Car.brgT, mapBrg: GLM && map ? map.gl.getBearing() : -Rot.view, pitch: GLM && map ? map.gl.getPitch() : 0, zoom: map ? map.getZoom() : 0, follow, lowFx: NAV.lowFx, cur: Car.cur });
  NAV.ahead = (km) => {   // #85: sample points on the remaining route (every ~1.5 km, up to km)
    const S = NAV.st, R = S.route; if (!R || !S.active || !R.pts) return null;
    const c = S.snap && S.snap.p ? S.snap.p : (lastVan || R.pts[0]); let best = 0, bd = 1e9;
    for (let i = 0; i < R.pts.length; i += 2) { const d = dist(c, R.pts[i]); if (d < bd) { bd = d; best = i; } }
    const out = [c]; let acc = 0, run = 0;
    for (let i = best + 1; i < R.pts.length && acc < km * 1000; i++) { const d = dist(R.pts[i - 1], R.pts[i]); acc += d; run += d; if (run > 1500) { out.push(R.pts[i]); run = 0; } }
    if (out.length < 2 && R.pts.length > best + 1) out.push(R.pts[Math.min(R.pts.length - 1, best + 20)]);
    return out.slice(0, 25);
  };

  // ---------------- search (Photon) ----------------
  const ICON = { fuel: '⛽', supermarket: '🛒', convenience: '🛒', marketplace: '🛒', cafe: '☕', restaurant: '🍜', fast_food: '🍔', place_of_worship: '⛪', school: '🏫', hospital: '🏥', pharmacy: '💊', chemist: '💊', parking: '🅿', doityourself: '🔧', hardware: '🔧', mall: '🏬', department_store: '🏬', bank: '🏦', post_office: '✉', house: '🏠', residential: '🏠', car_repair: '🔧', hotel: '🏨', park: '🌳', station: '🚉', aerodrome: '✈' };

  // 0.9.10 (#86): Here-style pictograms per place type — envelope for post office, cross for church…
  const PG = {
    post: ['#D9342B', 'M3 6h18v12H3z|M3 6l9 7 9-7'], church: ['#6B5BD2', 'M12 2v20|M6 8h12'], temple: ['#C9761E', 'M3 9 12 3l9 6|M5 9v11h14V9|M9 20v-6h6v6|M2 9h20'], mosque: ['#2E8B57', 'M12 3c-4 3-6 5-6 9h12c0-4-2-6-6-9z|M5 12v8h14v-8|M10 20v-4h4v4'],
    school: ['#E0A100', 'M2 9l10-5 10 5-10 5z|M6 11v5c3 2 9 2 12 0v-5'], uni: ['#E0A100', 'M2 9l10-5 10 5-10 5z|M6 11v5c3 2 9 2 12 0v-5|M22 9v6'], hospital: ['#D9342B', 'M12 5v14|M5 12h14'], pharmacy: ['#2E9E4F', 'M12 5v14|M5 12h14|M4 4h16v16H4z'], clinic: ['#D9342B', 'M8 3v6a4 4 0 0 0 8 0V3|M12 13v3a4 4 0 0 0 8 0v-2|M20 12a1 1 0 1 0 0 .1'], dentist: ['#3A8DDE', 'M7 3c-3 0-4 3-3 6l2 11h3l1-6h4l1 6h3l2-11c1-3 0-6-3-6-2 0-3 1-5 1S9 3 7 3z'],
    fuel: ['#1F6FB5', 'M4 20V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15|M3 20h12|M6 7h6v4H6z|M14 9h2l2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3'], ev: ['#16A34A', 'M13 2 5 13h6l-1 9 8-11h-6z'], repair: ['#5B6B78', 'M14 7a4 4 0 0 0-5 5L3 18l3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3z'], wash: ['#3A8DDE', 'M5 15l2-5h10l2 5|M4 15h16v4H4z|M8 3v3|M12 2v3|M16 3v3'], parking: ['#1F6FB5', 'M8 20V4h5a4 4 0 0 1 0 8H8'],
    shop: ['#E3672A', 'M3 7h18l-2 11H5z|M8 7V5a4 4 0 0 1 8 0v2'], cart: ['#E3672A', 'M2 3h3l3 12h11l2-8H6|M9 20a1 1 0 1 0 .1 0|M18 20a1 1 0 1 0 .1 0'], hardware: ['#5B6B78', 'M3 21 14 10|M14 3l7 7-4 4-7-7z'],
    food: ['#E3672A', 'M7 2v9|M4 2v6a3 3 0 0 0 6 0V2|M7 11v11|M17 2c-2 2-3 5-3 8h3v12|M17 2v20'], cafe: ['#8B5A2B', 'M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z|M17 10h2a2 2 0 0 1 0 4h-2|M8 2v3|M12 2v3'], fast: ['#E3672A', 'M4 11c0-4 4-6 8-6s8 2 8 6z|M3 14h18|M4 17h16a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3'], bar: ['#8E44AD', 'M4 4h16l-8 9z|M12 13v7|M8 20h8'],
    bank: ['#2C5282', 'M3 9l9-5 9 5|M5 9v9|M10 9v9|M14 9v9|M19 9v9|M3 20h18'], atm: ['#2C5282', 'M3 6h18v12H3z|M12 9v6|M10 10.5c0-1 1-1.5 2-1.5s2 .5 2 1.5-4 1-4 2.5 1 1.5 2 1.5 2-.5 2-1.5'], hotel: ['#3A6FB0', 'M3 19V7|M3 15h18v4|M21 15v-3a3 3 0 0 0-3-3h-7v6|M7 12a1.5 1.5 0 1 0 .1 0'],
    park: ['#2E8B57', 'M12 2 5 12h4l-3 5h12l-3-5h4z|M12 17v5'], beach: ['#E0A100', 'M3 20h18|M12 20 8 6|M3 9c3-4 9-5 13-2-4-1-8 0-13 2z|M17 4a3 3 0 1 0 .1 0'], library: ['#7A5C3A', 'M4 4h5v16H4z|M10 4h4v16h-4z|M15 5l4-1 3 15-4 1z'],
    train: ['#1F6FB5', 'M6 3h12a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2z|M4 10h16|M8 21l2-3|M16 21l-2-3'], bus: ['#1F6FB5', 'M5 4h14a1 1 0 0 1 1 1v12H4V5a1 1 0 0 1 1-1z|M4 11h16|M7 17v3|M17 17v3'], plane: ['#3A6FB0', 'M2 13l9-2V5a1 1 0 0 1 2 0v6l9 2v2l-9-1v4l2 2v1l-3-1-3 1v-1l2-2v-4l-9 1z'],
    police: ['#1E3A8A', 'M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z|M9 12l2 2 4-4'], fire: ['#D9342B', 'M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3 0-3 0-5 1-8z'], gym: ['#5B6B78', 'M6 7v10|M18 7v10|M3 9v6|M21 9v6|M6 12h12'], toilets: ['#3A6FB0', 'M7 4a1.5 1.5 0 1 0 .1 0|M5 9h4v6H5z|M6 15v5|M8 15v5|M17 4a1.5 1.5 0 1 0 .1 0|M14 16l3-7 3 7z|M16 16v4|M18 16v4|M12 3v18'],
    house: ['#4A6FA5', 'M3 11 12 3l9 8|M5 10v10h14V10|M10 20v-6h4v6'], road: ['#5B6B78', 'M8 3 5 21|M16 3l3 18|M12 4v3|M12 10v3|M12 16v3'], pin: ['#D9342B', 'M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z|M12 10a2 2 0 1 0 .1 0']
  };
  const PGK = { post_office: 'post', post_box: 'post', place_of_worship: 'church', church: 'church', cathedral: 'church', chapel: 'church', temple: 'temple', buddhist: 'temple', mosque: 'mosque', school: 'school', kindergarten: 'school', college: 'uni', university: 'uni', hospital: 'hospital', pharmacy: 'pharmacy', chemist: 'pharmacy', clinic: 'clinic', doctors: 'clinic', dentist: 'dentist',
    fuel: 'fuel', charging_station: 'ev', car_repair: 'repair', tyres: 'repair', car_wash: 'wash', parking: 'parking', parking_entrance: 'parking', supermarket: 'cart', convenience: 'cart', marketplace: 'cart', mall: 'shop', department_store: 'shop', clothes: 'shop', shoes: 'shop', electronics: 'shop', doityourself: 'hardware', hardware: 'hardware', trade: 'hardware',
    restaurant: 'food', food_court: 'food', cafe: 'cafe', bakery: 'cafe', fast_food: 'fast', bar: 'bar', pub: 'bar', biergarten: 'bar', bank: 'bank', atm: 'atm', bureau_de_change: 'bank', hotel: 'hotel', motel: 'hotel', hostel: 'hotel', guest_house: 'hotel', caravan_site: 'hotel', camp_site: 'park',
    park: 'park', garden: 'park', nature_reserve: 'park', playground: 'park', beach: 'beach', library: 'library', station: 'train', train_station: 'train', halt: 'train', tram_stop: 'train', bus_station: 'bus', bus_stop: 'bus', aerodrome: 'plane', airport: 'plane', terminal: 'plane', police: 'police', fire_station: 'fire', fitness_centre: 'gym', sports_centre: 'gym', toilets: 'toilets',
    house: 'house', residential: 'house', apartments: 'house', building: 'house', motorway: 'road', trunk: 'road', primary: 'road', secondary: 'road', tertiary: 'road', street: 'road', road: 'road' };
  const pgCache = {};
  NAV.pict = (kind, isHouse) => { const k = PGK[kind] || (isHouse ? 'house' : 'pin'); if (pgCache[k]) return pgCache[k]; const g = PG[k];
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 36 36"><circle cx="12" cy="12" r="18" fill="' + g[0] + '"/>' + g[1].split('|').map((d) => '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>').join('') + '</svg>';
    return (pgCache[k] = { url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), bg: g[0], key: k }); };
  NAV.iconOf = (kind) => ICON[kind] || '📍';
  const logoOf = (n) => (window.tcLogo && n) ? window.tcLogo(n) : '';
  NAV.logoOf = logoOf;
  const toPlace = (f, near) => {
    const p = f.properties || {}, c = f.geometry.coordinates;
    const street = (p.housenumber ? p.housenumber + ' ' : '') + (p.street || '');
    const name = p.name || street || p.city || 'Không tên';
    const area = [p.name && street ? street : '', p.district || p.locality || p.city || '', p.state === 'Victoria' ? 'VIC' : p.state || ''].filter(Boolean).join(', ');
    const pl = { name, sub: area, lat: c[1], lon: c[0], kind: p.osm_value || '', icon: ICON[p.osm_value] || (p.housenumber ? '🏠' : '📍'), house: !!p.housenumber };
    pl.st = { Victoria: 'VIC', 'South Australia': 'SA', 'New South Wales': 'NSW', Queensland: 'QLD', 'Australian Capital Territory': 'ACT', 'Western Australia': 'WA', Tasmania: 'TAS', 'Northern Territory': 'NT' }[p.state] || '';
    pl.logo = logoOf(p.name || ''); if (near) pl.km = dist(near, [pl.lat, pl.lon]) / 1000;
    return pl;
  };
  let sT = 0, sSeq = 0;
  // 0.9.11 (#98): every lookup gives up after a few seconds instead of spinning forever
  const tfetch = (u, ms) => { const ac = window.AbortController ? new AbortController() : null; const t = setTimeout(() => ac && ac.abort(), ms || 7000); return fetch(u, ac ? { signal: ac.signal } : {}).finally(() => clearTimeout(t)); };
  NAV.tfetch = tfetch;
  NAV.search = (q, near, cb) => {
    clearTimeout(sT); q = (q || '').trim(); if (q.length < 3) { cb([]); return; }
    const local = NAV.knownPlaces().filter((p) => p.name.toLowerCase().indexOf(q.toLowerCase()) >= 0).slice(0, 3).map((p) => Object.assign({ mine: true }, p));
    sT = setTimeout(() => {
      const my = ++sSeq;
      const u = 'https://photon.komoot.io/api/?limit=7&lang=en&bbox=112.9,-43.8,153.7,-10.6&q=' + encodeURIComponent(q) + (near ? '&lat=' + near[0].toFixed(4) + '&lon=' + near[1].toFixed(4) : '');
      tfetch(u, 7000).then((r) => r.json()).then((j) => { if (my === sSeq) cb(local.concat((j.features || []).map((f) => toPlace(f, near))).slice(0, 8)); })
        .catch(() => tfetch('https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=au&accept-language=en&q=' + encodeURIComponent(q)).then((r) => r.json()).then((a) => { if (my === sSeq) cb(local.concat((a || []).map((x) => ({ name: x.display_name.split(',')[0], sub: x.display_name.split(',').slice(1, 3).join(','), lat: +x.lat, lon: +x.lon, icon: '📍', logo: logoOf(x.display_name.split(',')[0]), km: near ? dist(near, [+x.lat, +x.lon]) / 1000 : null })))); }).catch(() => { if (my === sSeq) cb(local, true); }));
    }, 380);
  };
  NAV.reverse = (p) => fetch('https://photon.komoot.io/reverse?lang=en&lat=' + p[0] + '&lon=' + p[1]).then((r) => r.json()).then((j) => { const f = j.features && j.features[0]; if (!f) return ''; const pl = toPlace(f); return pl.name; }).catch(() => '');

  // ---------------- routing (OSRM) ----------------
  // 0.9.13 (#121): which way out of a roundabout comes from the shape of the road (OSRM's "modifier" there is the way IN —
  // always left in Australia); plain turns are checked against the road shape too
  const along = (g, m) => { let acc = 0; for (let i = 1; i < g.length; i++) { const d = dist([g[i - 1][1], g[i - 1][0]], [g[i][1], g[i][0]]); if (acc + d >= m) { const k = (m - acc) / (d || 1); return [g[i - 1][1] + (g[i][1] - g[i - 1][1]) * k, g[i - 1][0] + (g[i][0] - g[i - 1][0]) * k]; } acc += d; } const e = g[g.length - 1]; return [e[1], e[0]]; };
  const fixStep = (s) => {
    const m = s.maneuver, g = (s.geometry && s.geometry.coordinates) || [];
    if (/roundabout|rotary/.test(m.type) && !/^exit/.test(m.type) && g.length > 1 && m.bearing_before != null) {
      const len = Math.min(s.distance || 80, 90), d = angDiff(m.bearing_before, bearingOf(along(g, Math.max(10, len * 0.45)), along(g, len)));
      m.__way = Math.abs(d) < 35 ? 's' : Math.abs(d) >= 150 ? 'u' : d > 0 ? 'r' : 'l';
    } else if (/^(turn|end of road|continue|new name|fork|merge|on ramp|off ramp)$/.test(m.type) && m.bearing_before != null && m.bearing_after != null && m.modifier) {
      const d = angDiff(m.bearing_before, m.bearing_after);
      if (/left/.test(m.modifier) && d > 30) m.modifier = d > 120 ? 'sharp right' : d > 55 ? 'right' : 'slight right';
      else if (/right/.test(m.modifier) && d < -30) m.modifier = d < -120 ? 'sharp left' : d < -55 ? 'left' : 'slight left';
    }
  };
  const OSRM = 'https://router.project-osrm.org/route/v1/driving/';
  const build = (r, wps, noEx) => {
    const pts = [], steps = [], cum = [0]; let tolls = []; let legI = 0;
    r.legs.forEach((leg, li) => leg.steps.forEach((s, si) => {
      const g = (s.geometry && s.geometry.coordinates) || [];
      fixStep(s);
      const startIdx = Math.max(0, pts.length - 1);
      g.forEach((c, k) => { if (pts.length && k === 0) return; pts.push([c[1], c[0]]); if (pts.length > 1) cum.push(cum[cum.length - 1] + dist(pts[pts.length - 2], pts[pts.length - 1])); });
      const isWp = s.maneuver.type === 'arrive' && li < r.legs.length - 1;
      // one roundabout = one instruction: drop "exit roundabout" and a second roundabout step a few metres later (#121)
      const rb = /roundabout|rotary/.test(s.maneuver.type), prev = steps[steps.length - 1];
      if (/^exit (roundabout|rotary)$/.test(s.maneuver.type) || (rb && prev && prev.rb && (cum[startIdx] || 0) - prev.at < 45)) { legI = li; return; }
      steps.push({ rb, at: cum[startIdx] || 0, plain: viText0(Object.assign({}, s, { name: '', ref: '', destinations: '', exits: '' }), ''), text: viText(s, isWp ? (wps[li + 1] && wps[li + 1].name) : (s.maneuver.type === 'arrive' ? (wps[wps.length - 1] && wps[wps.length - 1].name) : '')), ico: iconKey(s), name: nm(s), dist: s.distance, leg: li, wp: s.maneuver.type === 'arrive' });
      (s.intersections || []).forEach((x) => { if ((x.classes || []).indexOf('toll') >= 0 && s.name && tolls.indexOf(s.name) < 0) tolls.push(s.name); });
      legI = li;
    }));
    if (!pts.length) r.geometry.coordinates.forEach((c) => pts.push([c[1], c[0]]));
    while (cum.length < pts.length) cum.push(cum[cum.length - 1]);
    // speed limits along the route: OSRM gives one value per segment of the overview line (#92)
    const lim = []; try {
      const og = r.geometry.coordinates; let gi = 0, acc = 0;
      r.legs.forEach((l) => { const ms = (l.annotation && l.annotation.maxspeed) || []; ms.forEach((m) => { const a2 = og[gi], b2 = og[gi + 1]; if (!b2) return; const v = m && m.speed ? (m.unit === 'mph' ? Math.round(m.speed * 1.609) : m.speed) : null; if (!lim.length || lim[lim.length - 1].v !== v) lim.push({ at: acc, v }); acc += dist([a2[1], a2[0]], [b2[1], b2[0]]); gi++; }); });
    } catch (e) {}
    return { id: Math.random().toString(36).slice(2, 8), lim, pts, cum, steps, dist: r.distance, dur: r.duration, tolls, noEx: !!noEx, legs: r.legs.map((l) => ({ dist: l.distance, dur: l.duration })) };
  };
  // 0.9.12 (#113): every routing call has a time limit, and a second server answers when the first is slow or busy
  const OSRM2 = 'https://routing.openstreetmap.de/routed-car/route/v1/driving/';
  // ---- HERE routing (#125): traffic-aware routes from HERE when Tom has put his HERE key in Cài Đặt;
  // the app limits itself to 300 HERE requests a day (far under the free allowance) and falls back to OSRM ----
  const HERE = 'https://router.hereapi.com/v8/routes';
  const today = () => new Date().toISOString().slice(0, 10);
  NAV.hereToday = () => (LS.get('tc-herecnt', {})[today()] || 0);
  const hereOk = () => !!(NAV.cfg.hereKey && NAV.hereToday() < 300);
  const hereCount = () => { const o = {}; o[today()] = NAV.hereToday() + 1; LS.set('tc-herecnt', o); };
  // HERE "flexible polyline" decoder (format published by HERE, MIT)
  const FPC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const fpDecode = (str) => {   // numbers stay far below 2^53 for road coordinates, so plain Number maths is exact
    const vals = []; let r = 0, mul = 1;
    for (let q = 0; q < str.length; q++) { const v = FPC.indexOf(str.charAt(q)); r += (v & 31) * mul; if ((v & 32) === 0) { vals.push(r); r = 0; mul = 1; } else mul *= 32; }
    const hdr = vals[1], prec = hdr & 15, third = (hdr >> 4) & 7, f = Math.pow(10, prec);
    const sg = (x) => (x % 2 ? -(x + 1) / 2 : x / 2);
    const out = []; let la = 0, lo = 0;
    for (let k = 2; k < vals.length;) { la += sg(vals[k]); lo += sg(vals[k + 1]); k += third ? 3 : 2; out.push([la / f, lo / f]); }
    return out;
  };
  const hereToOsrm = (j) => {
    if (!j || !j.routes || !j.routes.length) throw new Error((j && (j.title || j.error_description)) || 'here');
    const routes = j.routes.map((rt) => {
      let allC = [], D = 0, T = 0;
      const legs = rt.sections.map((sec) => {
        const pts = fpDecode(sec.polyline), C = pts.map((q) => [q[1], q[0]]), acts = sec.turnByTurnActions || sec.actions || [], steps = [];
        const brgAt = (o, back) => { const a = pts[Math.max(0, Math.min(pts.length - 1, o + (back ? -1 : 0)))], b = pts[Math.max(0, Math.min(pts.length - 1, o + (back ? 0 : 1)))]; return a && b && (a[0] !== b[0] || a[1] !== b[1]) ? bearingOf(a, b) : null; };
        for (let i = 0; i < acts.length; i++) {
          const a = acts[i]; let k = i, type = 'turn', mod = 'straight', exit;
          const dir = a.direction || '', sev = a.severity || '';
          const side = (x) => x === 'left' || x === 'right' ? (sev === 'light' ? 'slight ' + x : sev === 'heavy' ? 'sharp ' + x : x) : 'straight';
          if (a.action === 'depart') type = 'depart';
          else if (a.action === 'arrive') type = 'arrive';
          else if (/^roundabout/.test(a.action)) { type = 'roundabout'; if (a.action !== 'roundaboutExit') { let j2 = i + 1; while (j2 < acts.length && acts[j2].action !== 'roundaboutExit' && acts[j2].action !== 'arrive') j2++; if (j2 < acts.length && acts[j2].action === 'roundaboutExit') k = j2; } exit = acts[k].exit; }
          else if (a.action === 'keep') { type = 'fork'; mod = dir === 'middle' ? 'straight' : 'slight ' + (dir || 'right'); }
          else if (a.action === 'uTurn') mod = 'uturn';
          else if (a.action === 'continue') { type = 'continue'; mod = 'straight'; }
          else if (/ramp|exit|enterHighway/.test(a.action)) { type = a.action === 'enterHighway' ? 'on ramp' : 'off ramp'; mod = 'slight ' + (dir === 'left' ? 'left' : 'right'); }
          else mod = side(dir);
          const nx = acts[k + 1], o0 = a.offset || 0, o1 = nx ? nx.offset : C.length - 1;
          let len = 0, dur = 0; for (let q = i; q <= k; q++) { len += acts[q].length || 0; dur += acts[q].duration || 0; }
          const road = acts[k].nextRoad || {}, nm2 = road.name && road.name[0] ? road.name[0].value : '', ref = road.number && road.number[0] ? road.number[0].value : '';
          steps.push({ distance: len, duration: dur, name: nm2, ref, geometry: { coordinates: C.slice(o0, Math.max(o0 + 2, o1 + 1)) },
            maneuver: { type, modifier: mod, exit, location: C[o0], bearing_before: o0 > 0 ? brgAt(o0, true) : null, bearing_after: brgAt(o0, false) } });
          i = k;
        }
        const sm = sec.summary || {}; D += sm.length || 0; T += sm.duration || 0;
        allC = allC.concat(allC.length ? C.slice(1) : C);
        return { distance: sm.length || 0, duration: sm.duration || 0, steps };
      });
      return { distance: D, duration: T, geometry: { coordinates: allC }, legs };
    });
    return { code: 'Ok', routes, here: true };
  };
  const hereRoute = (wps, avoid, startBrg) => {
    const ll = (w) => (+w.lat).toFixed(6) + ',' + (+w.lon).toFixed(6);
    const AV = { toll: 'tollRoad', motorway: 'controlledAccessHighway', ferry: 'ferry' }, av = (avoid || []).map((x) => AV[x]).filter(Boolean);
    const u = HERE + '?transportMode=car&origin=' + ll(wps[0]) + (startBrg != null ? ';course=' + Math.round(startBrg) : '') + '&destination=' + ll(wps[wps.length - 1]) +
      wps.slice(1, -1).map((w) => '&via=' + ll(w)).join('') + '&return=polyline,summary,turnByTurnActions' + (wps.length === 2 ? '&alternatives=2' : '') +
      (av.length ? '&avoid[features]=' + av.join(',') : '') + '&apikey=' + encodeURIComponent(NAV.cfg.hereKey);
    hereCount();
    return tfetch(u, 8000).then((r) => { if (!r.ok) throw new Error('here ' + r.status); return r.json(); }).then(hereToOsrm);
  };
  NAV.route = (wps, avoid, startBrg) => {
    if (hereOk()) return hereRoute(wps, avoid, startBrg).then((j) => j.routes.map((r) => Object.assign(build(r, wps, false), { src: 'here' })))
      .catch((e) => { NAV.logEvt && NAV.logEvt('here-fail', String(e && e.message)); return osrmRoute(wps, avoid, startBrg); });
    return osrmRoute(wps, avoid, startBrg);
  };
  const osrmRoute = (wps, avoid, startBrg) => {
    const coords = wps.map((w) => (+w.lon).toFixed(6) + ',' + (+w.lat).toFixed(6)).join(';');
    // start in the direction the car is facing, so a new route does not ask for a U-turn
    const brgs = startBrg != null ? '&bearings=' + Math.round(startBrg) + ',60' + ';'.repeat(wps.length - 1) : '';
    const base = OSRM + coords + '?overview=full&geometries=geojson&steps=true&annotations=maxspeed&alternatives=' + (wps.length === 2 ? '3' : 'false') + brgs;
    const ex = (avoid || []).join(',');
    const go = (u) => tfetch(u, 8000).then((r) => { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .catch(() => tfetch(u.replace(OSRM, OSRM2), 10000).then((r) => r.json()));
    const noAnn = (u) => u.replace('&annotations=maxspeed', '');
    return go(base + (ex ? '&exclude=' + ex : '')).then((j) => j.code === 'Ok' ? j : go(noAnn(base) + (ex ? '&exclude=' + ex : ''))).then((j) => (j.code === 'Ok' || !ex) ? j : go(noAnn(base)).then((j2) => { j2.noEx = true; return j2; }))
      .then((j) => { if (j.code !== 'Ok' || !j.routes || !j.routes.length) throw new Error(j.message || 'route'); return j.routes.map((r) => Object.assign(build(r, wps, j.noEx), { src: 'osrm' })); });
  };
  // preview a route (Hành Trình / màn hình chính): alternatives shown grey, tap to pick
  NAV.plan = (wps, opt) => {
    opt = opt || {}; const S = NAV.st;
    S.planning = true; S.err = ''; redraw();
    return NAV.route(wps, opt.avoid || NAV.cfg.avoid).then((rs) => {
      S.planning = false; S.alts = rs; S.altPick = 0; S.route = rs[0]; S.wps = wps; S.dest = wps[wps.length - 1]; S.active = false; S.name = opt.name || ''; S.preview = null;
      rs.forEach((r, i) => { r.label = i === 0 ? 'Nhanh nhất' : r.tolls.length < rs[0].tolls.length ? 'Không thu phí' : r.dist < rs[0].dist ? 'Ngắn hơn' : 'Đường khác'; });
      redraw(); return rs;
    }).catch((e) => { S.planning = false; S.err = 'Không tìm được đường — kiểm tra mạng rồi thử lại'; redraw(); throw e; });
  };
  NAV.pickAlt = (i) => { const S = NAV.st; if (!S.alts[i]) return; S.altPick = i; S.route = S.alts[i]; redraw(); };
  NAV.cancel = () => { const S = NAV.st; S.active = false; S.route = null; S.alts = []; S.wps = []; S.dest = null; S.err = ''; fittedSig = ''; redraw(); };
  NAV.start = () => {
    const S = NAV.st; if (!S.route) return;
    S.active = true; S.idx = 0; S.along = null; S.moved = false; S.fixedStart = false; S.said = {}; S.off = 0; S.offRoute = false; S.rerouting = false; S.snap = null; Car.headInit = false; S.startAt = Date.now(); S.alts = [S.route]; S.next = 1; S.toNext = S.route.steps[1] ? S.route.steps[1].at : S.route.dist;
    S.remain = S.route.dist; S.remainDur = S.route.dur; follow = true; userAt = 0;
    const first = S.route.steps[1];
    if (EN()) say('Starting directions to ' + (S.dest ? S.dest.name : 'your destination') + '. ' + fmtDur(S.route.dur) + ', ' + sayDist(S.route.dist) + '.' + (first ? ' In ' + sayDist(first.at) + ', ' + first.text.toLowerCase() + '.' : '')); else if (NAV.cfg.clip) say('Bắt đầu chỉ đường.' + (first ? ' ' + sayDist(first.at) + ' nữa, ' + stepSay(first).toLowerCase() + '.' : '')); else say('Bắt đầu chỉ đường tới ' + (S.dest ? S.dest.name : 'nơi đến') + '. ' + fmtDur(S.route.dur) + ', ' + sayDist(S.route.dist) + '.' + (first ? ' ' + sayDist(first.at) + ' nữa, ' + first.text.toLowerCase() + '.' : ''));
    if (S.route.tolls.length && (NAV.cfg.avoid || []).indexOf('toll') < 0) toast('Đường này có đoạn thu phí: ' + S.route.tolls.slice(0, 2).join(', '));
    if (NAV.cfg.cams) loadCams(S.route.pts);
    redraw();
  };
  NAV.stop = (quiet) => { const S = NAV.st; if (S.active && !quiet) say(EN() ? 'Navigation stopped' : 'Đã dừng chỉ đường'); NAV.cancel(); };
  NAV.startTo = (place, opt) => {   // one tap "Đi": route from the car to a place and start
    const here = lastVan || (window.__liveLL && window.__liveLL());
    if (!here) { toast('Chưa bắt được GPS — chờ chút rồi bấm lại'); return Promise.resolve(); }
    return NAV.plan([{ name: 'Vị trí của Tom', lat: here[0], lon: here[1] }, place], opt).then(() => { if (!opt || opt.start !== false) NAV.start(); }).catch(() => {});
  };
  // ---- live progress (called on every GPS fix) ----
  NAV.tick = (f) => {
    if (f.lat == null) return;
    NAV.st.fixAt = Date.now();
    NAV.recFix(f);
    histTick(f); camTick(f);
    const S = NAV.st, R = S.route; if (!S.active || !R) return;
    const p = [f.lat, f.lon], spd0 = f.spd || 0, slow = spd0 < 10;
    if (spd0 >= 10) S.moved = true;
    // 0.9.13 (#120): right after "Đi", once GPS is accurate, start the route from the car's real spot (quietly, once)
    if (!S.moved && !S.fixedStart && (f.acc || 99) <= 30 && R.pts.length > 1 && dist(p, R.pts[0]) > 60 && !S.rerouting) { S.fixedStart = true; reroute(p, null, true); return; }
    // search a little back too, so one bad GPS fix cannot push "đã chạy qua" (grey) forward for good
    let best = 1e9, bi = S.idx || 0, bt = 0; const a = Math.max(0, (S.idx || 0) - 40), b = Math.min(R.pts.length - 1, (S.idx || 0) + 600);
    for (let i = a; i < b; i++) { const q = segProj(p, R.pts[i], R.pts[i + 1]); if (q.d < best) { best = q.d; bi = i; bt = q.t; } }
    const segB = (i) => { const A = R.pts[i], B = R.pts[i + 1] || A; return bearingOf(A, B); };
    // off the route? only while really driving (parked / crawling GPS drift never counts — #120);
    // wrong way on the line, or 40 m away, two fixes in a row → new route in a few seconds (#113b)
    const wrongWay = f.brg != null && spd0 >= 12 && best > 20 && Math.abs(angDiff(segB(bi), f.brg)) > 70;
    if (!slow && (best > Math.max(40, (f.acc || 0) * 1.5) || wrongWay)) {
      S.off = (S.off || 0) + 1; if (S.off >= 2 && !S.offRoute) { S.offRoute = true; redraw(); }
      if (S.off >= 2 && !S.rerouting && Date.now() - (S.rerouteAt || 0) > (S.rerouteOk ? 8000 : 4000)) reroute(p, spd0 >= 15 ? f.brg : null);
      return;
    }
    if (best > Math.max(40, (f.acc || 0) * 1.5)) return;   // slow and away from the line: keep everything as it is
    const along0 = R.cum[bi] + bt * ((R.cum[bi + 1] || R.cum[bi]) - R.cum[bi]);
    if (slow && S.along != null && along0 > S.along + 12) return;   // creeping/parked: progress may go back, never jump ahead
    S.off = 0; S.idx = bi; if (S.offRoute) { S.offRoute = false; }
    { const A = R.pts[bi], B = R.pts[bi + 1] || A; const sp = [A[0] + (B[0] - A[0]) * bt, A[1] + (B[1] - A[1]) * bt];
      S.snap = { p: sp, brg: segB(bi), brgA: bearingOf(sp, posAlong(R, 40, along0)), t: Date.now() }; }
    const along = along0; S.along = along0;
    S.remain = Math.max(0, R.dist - along); S.remainDur = R.dur * (S.remain / (R.dist || 1));
    let n = 1; while (n < R.steps.length - 1 && R.steps[n].at <= along + 4) n++;
    S.next = n; S.toNext = Math.max(0, R.steps[n].at - along);
    const st = R.steps[n], spd = f.spd || 0, said = S.said[n] || (S.said[n] = {});
    const far = spd > 75 ? 1500 : spd > 45 ? 600 : 350, near = spd > 75 ? 350 : spd > 45 ? 160 : 70;
    if (!said.far && S.toNext <= far && S.toNext > near * 1.6 && (R.steps[n].at - R.steps[n - 1].at) > near * 2) { said.far = 1; say(EN() ? 'In ' + sayDist(S.toNext) + ', ' + st.text.toLowerCase() : sayDist(S.toNext) + ' nữa, ' + stepSay(st).toLowerCase()); }
    if (!said.near && S.toNext <= near) { said.near = 1; say(stepSay(st)); if (st.wp && n < R.steps.length - 1) toast(st.text); }
    if (n === R.steps.length - 1 && S.toNext < 25) arrive();
    redraw();
  };
  const arrive = () => { const S = NAV.st, d = S.dest; say(EN() ? 'You have arrived' + (d && d.name ? ' at ' + d.name : '') + '.' : 'Đã tới nơi' + (d && d.name && !NAV.cfg.clip ? ', ' + d.name : '') + '.'); toast('🏁 Đã tới ' + (d ? d.name : 'nơi')); S.arrivedAt = Date.now(); S.active = false; setTimeout(() => { if (!NAV.st.active) NAV.cancel(); }, 45000); redraw(); };
  const reroute = (p, brg, quiet) => {
    const S = NAV.st; S.rerouteAt = Date.now(); S.rerouting = true; redraw(); NAV.logEvt && NAV.logEvt('reroute', quiet ? 'start-fix' : '');
    if (!quiet && Date.now() - (S.rerouteSaid || 0) > 25000) { S.rerouteSaid = Date.now(); say(EN() ? 'Recalculating' : 'Đang tìm đường mới'); }
    const R = S.route; const passedLegs = R.steps.slice(0, S.next).filter((s) => s.wp).length;
    const rest = S.wps.slice(1 + passedLegs);
    if (!rest.length) { S.rerouting = false; return; }
    NAV.route([{ name: 'Vị trí của Tom', lat: p[0], lon: p[1] }].concat(rest), NAV.cfg.avoid, brg).then((rs) => { if (!S.active) return; S.route = rs[0]; S.alts = [rs[0]]; S.wps = [{ name: 'Vị trí của Tom', lat: p[0], lon: p[1] }].concat(rest); S.idx = 0; S.along = null; S.said = {}; S.off = 0; S.offRoute = false; S.snap = null; S.rerouting = false; S.rerouteOk = true; S.rerouteAt = Date.now(); NAV.logEvt && NAV.logEvt('route', rs[0].src + ' ' + Math.round(rs[0].dist) + 'm'); redraw(); })
      .catch(() => { S.rerouting = false; S.rerouteOk = false; S.rerouteAt = Date.now(); if (Date.now() - (S.netToast || 0) > 30000) { S.netToast = Date.now(); toast(EN() ? 'Slow network — trying again…' : 'Mạng chậm — đang thử lại…'); } redraw(); });
  };
  NAV.limitNow = () => { const S = NAV.st, R = S.route; if (!S.active || !R || !R.lim || !R.lim.length) return null; const along = R.dist - (S.remain || R.dist); let v = null, ahead = null; for (let i = 0; i < R.lim.length; i++) { if (R.lim[i].at <= along + 5) v = R.lim[i].v; else { if (R.lim[i].at - along < 300) ahead = R.lim[i].v; break; } } return v ? { v, ahead: ahead && ahead !== v ? ahead : null } : null; };
  NAV.navView = () => {
    const S = NAV.st, R = S.route; if (!R) return null;
    const st = R.steps[S.next || 1] || R.steps[R.steps.length - 1], st2 = R.steps[(S.next || 1) + 1];
    const remain = S.active ? S.remain : R.dist, dur = S.active ? S.remainDur : R.dur;
    if (S.active && (S.rerouting || S.offRoute)) return { active: true, ico: 'straight', dist: '…', text: EN() ? 'Finding a new route…' : 'Đang tìm đường mới…', then: '', thenDist: '', thenIco: '', eta: hhmm(Date.now() + dur * 1000), left: fmtDur(dur), km: fmtDist(remain), dest: S.dest ? S.dest.name : '', destLogo: '', tolls: R.tolls, noEx: R.noEx, alts: [], planning: false, err: '', rerouting: true };
    return { active: S.active, ico: st ? st.ico : 'straight', dist: fmtDist(S.active ? S.toNext : (R.steps[1] ? R.steps[1].at : R.dist)), text: st ? st.text : '', then: st2 ? st2.text : '', thenDist: st2 ? fmtDist(st2.at - st.at) : '', thenIco: st2 ? st2.ico : '',
      eta: hhmm(Date.now() + dur * 1000), left: fmtDur(dur), km: fmtDist(remain), dest: S.dest ? S.dest.name : '', destLogo: S.dest ? S.dest.logo || logoOf(S.dest.name) : '', tolls: R.tolls, noEx: R.noEx,
      alts: S.alts.map((a, i) => ({ label: a.label || ('Đường ' + (i + 1)), km: fmtDist(a.dist), min: fmtDur(a.dur), toll: a.tolls.length > 0, on: i === S.altPick, pick: () => NAV.pickAlt(i) })), planning: !!S.planning, err: S.err };
  };

  // ---------------- speed cameras + school zones (Overpass, along the route) ----------------
  let cams = [], camWarned = {};
  const loadCams = (pts) => {
    cams = []; camWarned = {};
    const smp = []; let acc = 0; for (let i = 1; i < pts.length; i++) { acc += dist(pts[i - 1], pts[i]); if (acc > 1200 || i === pts.length - 1) { smp.push(pts[i]); acc = 0; } }
    if (smp.length < 2) smp.unshift(pts[0]);
    const chunks = []; for (let i = 0; i < smp.length; i += 80) chunks.push(smp.slice(Math.max(0, i - 1), i + 80));
    const one = (k) => { if (k >= chunks.length || k > 12) return; const line = chunks[k].map((p) => p[0].toFixed(5) + ',' + p[1].toFixed(5)).join(',');
      const q = '[out:json][timeout:20];(node["highway"="speed_camera"](around:120,' + line + ');nwr["amenity"="school"](around:220,' + line + '););out center 400;';
      fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q) }).then((r) => r.json()).then((j) => { (j.elements || []).forEach((e) => { const la = e.lat != null ? e.lat : e.center && e.center.lat, lo = e.lon != null ? e.lon : e.center && e.center.lon; if (la == null) return; cams.push({ id: e.type + e.id, lat: la, lon: lo, school: !!(e.tags && e.tags.amenity === 'school') }); }); }).catch(() => {}).then(() => one(k + 1)); };
    one(0);
  };
  const schoolTime = () => { const d = new Date(), h = d.getHours() + d.getMinutes() / 60, wd = d.getDay(); return wd >= 1 && wd <= 5 && ((h >= 8 && h <= 9.5) || (h >= 14.5 && h <= 16)); };
  const camTick = (f) => {
    if (!NAV.cfg.cams || !cams.length || !(f.spd > 20)) return; const p = [f.lat, f.lon];
    cams.forEach((c) => { if (camWarned[c.id]) return; const d = dist(p, [c.lat, c.lon]); if (c.school) { if (d < 180 && schoolTime() && f.spd > 45) { camWarned[c.id] = 1; say(EN() ? 'School zone, 40 kilometres an hour' : 'Vùng trường học, chạy 40 cây số giờ'); toast('🏫 Vùng trường học · 40 km/g'); } } else if (d < 330) { camWarned[c.id] = 1; say(EN() ? 'Speed camera ahead in ' + sayDist(d) : 'Phía trước ' + sayDist(Math.max(50, Math.round(d / 50) * 50)) + ' có camera tốc độ'); toast('📷 Camera tốc độ phía trước'); } });
  };

  // ---------------- history: places, trips, parking (only in this phone) ----------------
  const H = NAV.hist = LS.get('tc-hist', { places: {}, trips: [], saved: [], park: null });
  if (!H.saved) H.saved = []; if (!H.places) H.places = {}; if (!H.trips) H.trips = [];
  let saveT = 0; const saveH = () => { clearTimeout(saveT); saveT = setTimeout(() => LS.set('tc-hist', H), 500); };
  const pkey = (p) => p[0].toFixed(3) + ',' + p[1].toFixed(3);
  const simplify = (pts, minM) => { const o = [pts[0]]; for (let i = 1; i < pts.length; i++) if (dist(o[o.length - 1], pts[i]) >= minM || i === pts.length - 1) o.push([+pts[i][0].toFixed(5), +pts[i][1].toFixed(5)]); return o; };
  let ses = null, slowSince = 0;
  const histTick = (f) => {
    if (NAV.cfg.histOff) return;
    const p = [f.lat, f.lon], moving = (f.spd || 0) > 10;
    if (moving) {
      slowSince = 0;
      if (!ses) { const fromPark = H.park && dist([H.park.lat, H.park.lon], p) < 600; ses = { t0: Date.now(), from: fromPark ? { name: H.park.name, lat: H.park.lat, lon: H.park.lon } : { name: '', lat: p[0], lon: p[1] }, pts: [p], km: 0 }; if (!ses.from.name) { const s0 = ses; NAV.reverse(p).then((n) => { s0.from.name = n || 'Chỗ xuất phát'; }); } }
      else { const l = ses.pts[ses.pts.length - 1], d = dist(l, p); if (d > 40) { ses.pts.push(p); ses.km += d / 1000; } }
    } else if (ses) { if (!slowSince) slowSince = Date.now(); if (Date.now() - slowSince > 180000) endSes(p); }
  };
  const nameFromHome = (p) => { const h = window.tcHome && window.tcHome(); return h && dist([h.lat, h.lon], p) < 150 ? 'Nhà' : ''; };
  const endSes = (p) => {
    const s = ses; ses = null; slowSince = 0; if (!s || s.km < 0.4) return;
    const d = NAV.st.dest && dist([NAV.st.dest.lat, NAV.st.dest.lon], p) < 300 ? NAV.st.dest : null;
    const fin = (name) => {
      if (!s.from.name || nameFromHome([s.from.lat, s.from.lon])) s.from.name = nameFromHome([s.from.lat, s.from.lon]) || s.from.name || 'Chỗ xuất phát';
      const to = { name, lat: p[0], lon: p[1] };
      H.trips.unshift({ t0: s.t0, t1: Date.now(), from: s.from, to, km: +s.km.toFixed(1), pts: simplify(s.pts, 35) }); H.trips = H.trips.slice(0, 300);
      const k = pkey(p), pl = H.places[k] || { name, lat: p[0], lon: p[1], n: 0 }; pl.n++; pl.last = Date.now(); if (!pl.name || pl.name === 'Chỗ đậu xe') pl.name = name; H.places[k] = pl;
      H.park = { lat: p[0], lon: p[1], t: Date.now(), name }; saveH(); redraw();
    };
    const h = nameFromHome(p); if (h) fin(h); else if (d) fin(d.name); else NAV.reverse(p).then((n) => fin(n || 'Chỗ đậu xe'));
  };
  NAV.clearHist = () => { H.places = {}; H.trips = []; H.park = null; saveH(); redraw(); };
  NAV.delTrip = (t0) => { H.trips = H.trips.filter((t) => t.t0 !== t0); saveH(); redraw(); };
  NAV.delPlace = (k) => { delete H.places[k]; saveH(); redraw(); };
  NAV.star = (p) => { if (!H.saved.some((s) => dist([s.lat, s.lon], [p.lat, p.lon]) < 60)) { H.saved.push({ name: p.name, lat: p.lat, lon: p.lon, icon: p.icon || '⭐', role: p.role || '' }); saveH(); toast('Đã lưu ⭐ ' + p.name); } redraw(); };
  NAV.unstar = (i) => { H.saved.splice(i, 1); saveH(); redraw(); };
  NAV.getWork = () => H.saved.find((s) => s.role === 'work') || null;
  NAV.clearWork = () => { H.saved = H.saved.filter((s) => s.role !== 'work'); saveH(); redraw(); };
  NAV.setWork = (p) => { H.saved = H.saved.filter((s) => s.role !== 'work'); H.saved.unshift({ name: p.name, lat: p.lat, lon: p.lon, icon: '💼', role: 'work' }); saveH(); toast('Đã lưu Chỗ làm'); redraw(); };
  // frequently visited — ranked by visits, but the count itself is never shown (privacy, #63)
  NAV.frequent = () => Object.keys(H.places).map((k) => Object.assign({ key: k }, H.places[k])).filter((p) => p.n >= 2 && p.name !== 'Nhà').sort((a, b) => b.n - a.n || b.last - a.last).slice(0, 12);
  NAV.recent = () => { const seen = {}; return H.trips.filter((t) => Date.now() - t.t0 < 8 * 86400000).map((t) => t.to).filter((p) => { const k = pkey([p.lat, p.lon]); if (seen[k] || p.name === 'Nhà') return false; seen[k] = 1; return true; }).slice(0, 12); };
  NAV.knownPlaces = () => H.saved.concat(NAV.frequent()).concat(NAV.recent());
  NAV.habit = (here) => {
    const now = new Date(), wd = now.getDay(), hr = now.getHours() + now.getMinutes() / 60, c = {};
    H.trips.forEach((t) => { const d = new Date(t.t0); if (d.getDay() !== wd || Math.abs(d.getHours() + d.getMinutes() / 60 - hr) > 1 || Date.now() - t.t0 > 60 * 86400000) return; const k = pkey([t.to.lat, t.to.lon]); (c[k] = c[k] || { n: 0, to: t.to }).n++; });
    let best = null; Object.keys(c).forEach((k) => { if (c[k].n >= 2 && (!best || c[k].n > best.n)) best = c[k]; });
    if (!best || (here && dist(here, [best.to.lat, best.to.lon]) < 500)) return null;
    return best.to;
  };
  NAV.showTrail = (t) => { NAV.st.preview = t || null; fittedSig = ''; redraw(); };
  // parking: remember where the car is; optional 1P/2P/4P reminder (Android notification)
  NAV.parkRemind = (min) => { if (!H.park) return; H.park.limit = min; H.park.until = H.park.t + min * 60000; saveH(); try { if (window.TCN) window.TCN.call('park', JSON.stringify({ at: H.park.until - 10 * 60000, text: 'Còn 10 phút là hết giờ đậu xe ' + (min / 60) + 'P ở ' + (H.park.name || 'chỗ đậu') })); } catch (e) {} toast('Sẽ nhắc trước 10 phút khi hết giờ ' + (min / 60) + 'P'); redraw(); };

  // ---------------- offline map for a long trip ----------------
  const lon2x = (lon, z) => Math.floor((lon + 180) / 360 * 2 ** z), lat2y = (lat, z) => Math.floor((1 - Math.log(Math.tan(lat * RAD) + 1 / Math.cos(lat * RAD)) / Math.PI) / 2 * 2 ** z);
  NAV.tileList = (pts) => {
    const set = {}; const smp = [pts[0]]; let acc = 0;
    for (let i = 1; i < pts.length; i++) { acc += dist(pts[i - 1], pts[i]); if (acc > 700) { smp.push(pts[i]); acc = 0; } }
    smp.push(pts[pts.length - 1]);
    for (let z = 9; z <= 13; z++) smp.forEach((p) => { const x = lon2x(p[1], z), y = lat2y(p[0], z), r = z >= 12 ? 1 : 0; for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) set[z + '/' + (x + dx) + '/' + (y + dy)] = 1; });
    return Object.keys(set);
  };
  NAV.prefetch = (pts, onProg) => {
    const keys = NAV.tileList(pts), urls = [];
    keys.forEach((k) => { const [z, x, y] = k.split('/').map(Number); TILES.light.L.concat(TILES.dark.L).forEach((l) => { if (z <= l[1]) urls.push(tileUrl(l[0], z, x, y)); }); });
    let done = 0, i = 0, bad = 0; const total = urls.length;
    return new Promise((res) => {
      const next = () => { if (i >= total) { if (done >= total) res({ total, bad }); return; } const u = urls[i++];
        idbGet(u).then((have) => have || fetch(u).then((r) => r.ok ? r.blob() : null).then((b) => { if (b) idbPut(u, b); else bad++; }).catch(() => { bad++; }))
          .then(() => { done++; if (onProg && (done % 25 === 0 || done === total)) onProg(done, total); if (done >= total) res({ total, bad }); else next(); }); };
      for (let k = 0; k < 6; k++) next();
    });
  };

  // ---------------- Road Trip built-in route along the real roads (#67) ----------------
  NAV.realRoute = (from, to) => {
    const k = 'tc-rtreal-' + from[0].toFixed(3) + ',' + from[1].toFixed(3) + '-' + to[0].toFixed(2) + ',' + to[1].toFixed(2);
    const c = LS.get(k, null); if (c) return Promise.resolve(c);
    return fetch(OSRM + from[1] + ',' + from[0] + ';' + to[1] + ',' + to[0] + '?overview=full&geometries=geojson').then((r) => r.json()).then((j) => {
      const r0 = j.routes && j.routes[0]; if (!r0) return null;
      const all = r0.geometry.coordinates.map((c2) => [Math.round(c2[1] * 1e5) / 1e5, Math.round(c2[0] * 1e5) / 1e5]);
      const n = Math.max(1, Math.ceil(all.length / 900)); const pts = all.filter((_, i) => i % n === 0); pts.push(all[all.length - 1]);
      const v = { pts, km: Math.round(r0.distance / 1000), mins: Math.round(r0.duration / 60) }; LS.set(k, v); return v;
    }).catch(() => null);
  };
})();
