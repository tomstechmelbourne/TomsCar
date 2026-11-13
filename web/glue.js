// glue.js – connects the two Tom's Car layers (scene = Main board, ui = App board) to the Android shell (window.TCNative).
(function () {
  'use strict';
  const N = window.TCNative || null;
  const call = (action, arg) => { try { if (N) N.call(action, arg == null ? '' : String(arg)); } catch (e) { console.log('TCN ' + e); } };
  window.TCN = N ? { call } : null;
  if (N) document.body.classList.add('app');

  // ---- scale the 1280x720 stage to the window; a narrow window (next to a map) gets the compact column ----
  const stage = document.getElementById('stage');
  let narrow = false;
  const fit = () => {
    const w = window.innerWidth, h = window.innerHeight;
    narrow = w / h < 1.1;
    document.body.classList.toggle('narrow', narrow);
    if (narrow) {
      const vw = 420, vh = Math.round(420 * h / w), s = w / vw;
      stage.style.width = vw + 'px'; stage.style.height = vh + 'px';
      stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
      if (window.__ui) window.__ui.setState({ narrow: true, live: Object.assign({}, live, { vw, vh }) });
    } else {
      const s = Math.min(w / 1280, h / 720);
      stage.style.width = '1280px'; stage.style.height = '720px';
      stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
      if (window.__ui) window.__ui.setState({ narrow: false });
    }
  };
  window.addEventListener('resize', fit);

  // ---- Melbourne -> Adelaide route (approx. town coordinates) for Road Trip km (0..727) ----
  const ROUTE = [[-37.814, 144.963], [-37.562, 143.850], [-37.430, 143.383], [-37.283, 142.929], [-36.716, 142.199], [-36.452, 142.026], [-36.333, 141.650], [-36.378, 141.243], [-36.311, 140.772], [-36.098, 140.356], [-35.697, 139.860], [-35.255, 139.455], [-35.040, 138.880], [-34.929, 138.601]];
  const TOTAL = 727, R = 6371;
  const toXY = (lat, lon) => [lon * Math.cos(-36.5 * Math.PI / 180) * Math.PI / 180 * R, lat * Math.PI / 180 * R];
  const P = ROUTE.map(([a, b]) => toXY(a, b));
  let total = 0; const cum = [0];
  for (let i = 1; i < P.length; i++) { total += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); cum.push(total); }
  const routeKm = (lat, lon) => {
    const q = toXY(lat, lon); let best = { d: 1e9, k: 0 };
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i], vx = b[0] - a[0], vy = b[1] - a[1];
      const t = Math.max(0, Math.min(1, ((q[0] - a[0]) * vx + (q[1] - a[1]) * vy) / (vx * vx + vy * vy)));
      const x = a[0] + vx * t, y = a[1] + vy * t, d = Math.hypot(q[0] - x, q[1] - y);
      if (d < best.d) best = { d, k: cum[i - 1] + t * (cum[i] - cum[i - 1]) };
    }
    return { km: best.k / total * TOTAL, off: best.d };
  };
  window.tcRouteKm = (lat, lon) => { const r = routeKm(lat, lon); return r.off < 25 ? r.km : null; };
  const dist = (a, b, c, d) => { const x = (d - b) * Math.cos((a + c) / 2 * Math.PI / 180) * 111.32, y = (c - a) * 110.57; return Math.hypot(x, y); };

  // ---- weather (Open-Meteo, no key) ----
  const wxCode = (c) => c === 0 || c === 1 ? 'clear' : c <= 3 ? 'cloudy' : c === 45 || c === 48 ? 'fog' : c >= 95 ? 'storm' : 'rain';
  let wxAt = 0, wxBusy = false;
  const fetchWx = (lat, lon) => {
    if (wxBusy || Date.now() - wxAt < 15 * 60 * 1000) return;
    wxBusy = true;
    const u = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat.toFixed(3) + '&longitude=' + lon.toFixed(3) +
      '&current=temperature_2m,apparent_temperature,weather_code,precipitation_probability,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1';
    fetch(u).then((r) => r.json()).then((j) => {
      wxAt = Date.now();
      push({ wx: { temp: j.current.temperature_2m, feels: j.current.apparent_temperature, code: wxCode(j.current.weather_code), rain: j.current.precipitation_probability || 0, wind: j.current.wind_speed_10m, hi: j.daily.temperature_2m_max[0], lo: j.daily.temperature_2m_min[0] } });
    }).catch(() => {}).then(() => { wxBusy = false; });
  };

  // ---- Overpass (OpenStreetMap): speed limits + places ----
  const OVP = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  const overpass = (q) => {
    const tryAt = (i) => fetch(OVP[i], { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      .then((r) => { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .catch((e) => { if (i + 1 < OVP.length) return tryAt(i + 1); throw e; });
    return tryAt(0);
  };
  // speed limit of the road we are on (+ one point ~300 m ahead)
  let limAt = 0, limBusy = false, limLast = null;
  const segDist = (lat, lon, g) => { let best = 1e9; for (let i = 1; i < g.length; i++) { const a = g[i - 1], b = g[i]; const ax = (a.lon - lon) * 89, ay = (a.lat - lat) * 111, bx = (b.lon - lon) * 89, by = (b.lat - lat) * 111; const vx = bx - ax, vy = by - ay; const t = Math.max(0, Math.min(1, -(ax * vx + ay * vy) / ((vx * vx + vy * vy) || 1e-9))); best = Math.min(best, Math.hypot(ax + vx * t, ay + vy * t)); } return best; };
  const DEF_LIM = { motorway: 110, trunk: 100, primary: 100, secondary: 100, tertiary: 80, residential: 50, living_street: 10, service: 20, unclassified: 80 };
  const parseLim = (tags, now) => {
    const m = parseInt(tags.maxspeed, 10);
    let v = isNaN(m) ? null : m, school = false;
    const cond = tags['maxspeed:conditional'] || '';
    const cm = cond.match(/(\d+)\s*@\s*\(([^)]*)\)/);
    if (cm && /school/i.test(cond + (tags['maxspeed:type'] || ''))) {
      const hm = now.getHours() * 60 + now.getMinutes(), wd = now.getDay();
      const inSchool = wd >= 1 && wd <= 5 && ((hm >= 480 && hm <= 570) || (hm >= 870 && hm <= 960));
      if (inSchool) { v = parseInt(cm[1], 10); school = true; }
    }
    if (v == null) return { v: DEF_LIM[tags.highway] || (tags.highway ? 100 : null), est: true, school: false };
    return { v, est: false, school };
  };
  const fetchLimit = (lat, lon, brg, spd) => {
    if (limBusy || Date.now() - limAt < (spd > 5 ? 12000 : 60000)) return;
    limBusy = true;
    const ahead = brg != null ? [lat + Math.cos(brg * Math.PI / 180) * 0.3 / 111, lon + Math.sin(brg * Math.PI / 180) * 0.3 / 89] : null;
    const q = '[out:json][timeout:15];(way(around:30,' + lat + ',' + lon + ')[highway~"motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service|motorway_link|trunk_link|primary_link"];' +
      (ahead ? 'way(around:30,' + ahead[0] + ',' + ahead[1] + ')[highway~"motorway|trunk|primary|secondary|tertiary|unclassified|residential"];' : '') + ');out tags geom;';
    overpass(q).then((j) => {
      limAt = Date.now();
      const ws = (j.elements || []).filter((e) => e.geometry);
      if (!ws.length) return;
      const pick = (la, lo) => ws.map((w) => ({ w, d: segDist(la, lo, w.geometry) })).sort((a, b) => a.d - b.d)[0];
      const here = pick(lat, lon); if (!here || here.d > 0.05) return;
      const now = new Date();
      const L = parseLim(here.w.tags || {}, now); if (L.v == null) return;
      let aheadV = null;
      if (ahead) { const a = pick(ahead[0], ahead[1]); if (a && a.d < 0.05) { const LA = parseLim(a.w.tags || {}, now); if (LA.v != null && LA.v !== L.v) aheadV = LA.v; } }
      const changed = !limLast || limLast.v !== L.v;
      limLast = { v: L.v, est: L.est, school: L.school, label: (here.w.tags && (here.w.tags.name || here.w.tags.ref)) || '', at: changed ? Date.now() : (limLast ? limLast.at : 0), ahead: aheadV };
      push({ limit: limLast });
    }).catch(() => {}).then(() => { limBusy = false; });
  };
  // places near us (prefer ahead of the car)
  const CATQ = {
    fuel: '[amenity=fuel]', mcd: '[amenity~"fast_food|restaurant"][brand~"McDonald",i]', hj: '[amenity~"fast_food|restaurant"][brand~"Hungry Jack",i]', kfc: '[amenity~"fast_food|restaurant"][brand~"KFC",i]',
    cafe: '[amenity=cafe]', wc: '[amenity=toilets]', rest: '[highway=rest_area]', shop: '[shop=supermarket]'
  };
  const logoCache = (() => { try { return JSON.parse(localStorage.getItem('tc-logos') || '{}'); } catch (e) { return {}; } })();
  const brandLogo = (qid) => new Promise((res) => {
    if (!qid) return res('');
    if (logoCache[qid] !== undefined) return res(logoCache[qid]);
    fetch('https://www.wikidata.org/wiki/Special:EntityData/' + qid + '.json').then((r) => r.json()).then((j) => {
      const e = j.entities && j.entities[qid]; const c = e && e.claims && (e.claims.P154 || e.claims.P8972);
      const f = c && c[0] && c[0].mainsnak && c[0].mainsnak.datavalue && c[0].mainsnak.datavalue.value;
      const url = f ? 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(f) + '?width=96' : '';
      logoCache[qid] = url; try { localStorage.setItem('tc-logos', JSON.stringify(logoCache)); } catch (x) {}
      res(url);
    }).catch(() => res(''));
  });
  const isOpenNow = (oh) => { if (!oh) return null; if (oh === '24/7') return true; return null; };
  window.tcFindPlaces = (cat) => {
    if (!window.__ui) return;
    const lat = live.lat, lon = live.lon;
    if (lat == null) { window.__ui.toast('Chưa có GPS'); return; }
    window.__ui.setState({ placesBusy: true });
    const q = '[out:json][timeout:20];(nwr(around:30000,' + lat + ',' + lon + ')' + (CATQ[cat] || CATQ.fuel) + ';);out center tags 60;';
    overpass(q).then((j) => {
      const brg = live.bearing;
      const items = (j.elements || []).map((e) => {
        const la = e.lat != null ? e.lat : e.center && e.center.lat, lo = e.lon != null ? e.lon : e.center && e.center.lon;
        const t = e.tags || {}; const km = dist(lat, lon, la, lo);
        let ahead = true, side = '';
        if (brg != null && live.speed > 5) {
          const b = (Math.atan2((lo - lon) * Math.cos(lat * Math.PI / 180), la - lat) * 180 / Math.PI + 360) % 360;
          const diff = ((b - brg + 540) % 360) - 180; ahead = Math.abs(diff) < 75; side = diff < 0 ? 'bên trái' : 'bên phải';
        }
        return { name: t.name || t.brand || ({ fuel: 'Trạm xăng', cafe: 'Café', wc: 'Nhà vệ sinh', rest: 'Chỗ nghỉ chân', shop: 'Siêu thị' }[cat] || 'Chỗ này'), addr: [t['addr:street'], t['addr:suburb'] || t['addr:city']].filter(Boolean).join(', '), lat: la, lon: lo, km: Math.round(km * 10) / 10, ahead, side, open: isOpenNow(t.opening_hours), qid: t['brand:wikidata'] || '', k: cat === 'fuel' ? 'fuel' : cat === 'cafe' ? 'cafe' : cat === 'wc' ? 'wc' : cat === 'rest' ? 'rest' : cat === 'shop' ? 'shop' : 'food' };
      }).filter((p) => p.lat != null).sort((a, b) => (b.ahead - a.ahead) || (a.km - b.km)).slice(0, 12);
      return Promise.all(items.map((p) => brandLogo(p.qid).then((u) => Object.assign(p, { logo: u }))));
    }).then((items) => {
      const pl = Object.assign({}, window.__ui.state.places, { [cat]: items });
      window.__ui.setState({ places: pl, placesBusy: false });
    }).catch(() => { window.__ui.setState({ placesBusy: false }); window.__ui.toast('Không tìm được (mất mạng?)'); });
  };

  // ---- radio stations (radio-browser.info, free directory) ----
  const RB = 'https://de1.api.radio-browser.info/json/stations/';
  const REGIONS = [[-37.81, 144.96, 'Melbourne', 'ABC Radio Melbourne'], [-37.56, 143.85, 'Ballarat', 'ABC Ballarat'], [-36.72, 142.20, 'Wimmera', 'ABC Wimmera'], [-36.10, 140.36, 'Keith / Bordertown', 'ABC South East SA'], [-35.25, 139.46, 'Murraylands', 'ABC Riverland'], [-34.93, 138.60, 'Adelaide', 'ABC Radio Adelaide']];
  const st = (s) => ({ id: s.stationuuid, name: s.name.trim(), sub: [s.state, (s.tags || '').split(',').slice(0, 2).join(', ')].filter(Boolean).join(' · '), url: s.url_resolved || s.url });
  const byName = (n, lim) => fetch(RB + 'search?limit=' + (lim || 3) + '&hidebroken=true&order=votes&reverse=true&name=' + encodeURIComponent(n)).then((r) => r.json()).then((a) => a.map(st)).catch(() => []);
  let radioRegion = null;
  const loadRadio = (lat, lon) => {
    if (!window.__ui) return;
    const reg = REGIONS.map((r) => ({ r, d: dist(lat, lon, r[0], r[1]) })).sort((a, b) => a.d - b.d)[0].r;
    if (radioRegion === reg[2]) return; radioRegion = reg[2];
    const near = Promise.all([byName(reg[3], 1), fetch(RB + 'search?limit=8&hidebroken=true&order=votes&reverse=true&countrycode=AU&geo_lat=' + lat + '&geo_long=' + lon + '&geo_distance=120000').then((r) => r.json()).then((a) => a.map(st)).catch(() => [])]).then((x) => x[0].concat(x[1]));
    const au = Promise.all(['ABC News', 'ABC Classic', 'triple j', 'SBS Radio 1'].map((n) => byName(n, 1))).then((x) => [].concat.apply([], x));
    const vn = Promise.all([byName('SBS Vietnamese', 1), byName('VOV', 2), byName('VOH', 1)]).then((x) => [].concat.apply([], x));
    Promise.all([near, au, vn]).then(([n, a, v]) => {
      const seen = {}; const uniq = (arr) => arr.filter((s) => s.url && !seen[s.id] && (seen[s.id] = 1));
      window.__ui.setState({ radioLists: { region: reg[2], near: uniq(n), au: uniq(a), vn: uniq(v) } });
      // tự đổi đài theo vùng: đang nghe đài ABC địa phương thì chuyển sang đài ABC vùng mới
      const R0 = live.radio; if (R0 && R0.playing && /^ABC (Radio |)(Melbourne|Ballarat|Wimmera|South East|Riverland|Adelaide)/i.test(R0.name || '') && n[0] && n[0].name !== R0.name) {
        call('radio', JSON.stringify({ url: n[0].url, name: n[0].name })); window.__ui.toast('Đã chuyển sang ' + n[0].name);
      }
    });
  };

  // ---- trip: direction, start time, today's distance, parked time ----
  let trip = null, lastKm = null, dirVotes = 0, today = (() => { try { const t = JSON.parse(localStorage.getItem('tc-today') || 'null'); return t && t.day === new Date().toDateString() ? t : null; } catch (e) { return null; } })();
  let lastT = Date.now(), parkedSince = Date.now();
  const tripUpdate = (d) => {
    const now = Date.now(), dt = (now - lastT) / 3600000; lastT = now;
    const sp = d.speed || 0;
    if (!today || today.day !== new Date().toDateString()) today = { day: new Date().toDateString(), km: 0, max: 0, secs: 0 };
    if (sp > 3) { today.km += sp * dt; today.secs += dt * 3600; today.max = Math.max(today.max, sp); parkedSince = now; }
    try { localStorage.setItem('tc-today', JSON.stringify(today)); } catch (e) {}
    const out = { today: { km: Math.round(today.km), max: Math.round(today.max), avg: today.secs > 60 ? Math.round(today.km / (today.secs / 3600)) : 0 }, parkedMin: Math.floor((now - parkedSince) / 60000) };
    if (d.lat != null) {
      const r = routeKm(d.lat, d.lon);
      if (r.off < 40) {
        if (lastKm != null) { const dk = r.km - lastKm; if (Math.abs(dk) > 0.05) dirVotes = Math.max(-5, Math.min(5, dirVotes + (dk > 0 ? 1 : -1))); }
        lastKm = r.km;
        if (!trip) { const n = new Date(); trip = { startMin: n.getHours() * 60 + n.getMinutes() - Math.round(r.km / 100 * 60) }; }
        out.trip = { km: r.km, dir: dirVotes >= 0 ? 'go' : 'back', startMin: trip.startMin };
      } else { out.trip = null; }
    }
    return out;
  };

  // ---- live state from native → both layers ----
  let live = {};
  const push = (patch) => {
    live = Object.assign({}, live, patch);
    if (window.__tc) window.__tc.setState({ live });
    if (window.__ui) window.__ui.setState({ live: narrow ? Object.assign({}, live, { vw: 420, vh: Math.round(420 * window.innerHeight / window.innerWidth) }) : live });
  };
  window.tcLive = function (json) {
    let d; try { d = typeof json === 'string' ? JSON.parse(json) : json; } catch (e) { return; }
    const patch = Object.assign({}, d, tripUpdate(d));
    if (d.lat != null && d.lon != null) { fetchWx(d.lat, d.lon); fetchLimit(d.lat, d.lon, d.bearing, d.speed || 0); loadRadio(d.lat, d.lon); }
    push(patch);
  };
  // callbacks from native
  window.tcApps = (a) => { if (window.__ui) window.__ui.setState({ apps: typeof a === 'string' ? JSON.parse(a) : a }); };
  window.tcCallLog = (a) => { if (window.__ui) window.__ui.setState({ calls: typeof a === 'string' ? JSON.parse(a) : a }); };
  window.tcMsgs = (a) => { if (window.__ui) window.__ui.setState({ msgs: typeof a === 'string' ? JSON.parse(a) : a }); };
  window.tcGeo = (r) => { if (window.__geoCb) window.__geoCb(typeof r === 'string' ? JSON.parse(r) : r); };
  window.tcToast = (t) => { if (window.__ui) window.__ui.toast(t); };
  window.tcVoice = (v) => {
    const u = window.__ui; if (!u) return; v = typeof v === 'string' ? JSON.parse(v) : v;
    if (v.state === 'listening') u.setState({ va: true, vaHeard: '', vaHint: 'Đang nghe… nói lệnh' });
    else if (v.state === 'partial') u.setState({ vaHeard: v.text || '' });
    else if (v.state === 'result') u.runVoice(v.text || '');
    else if (v.state === 'error') { u.setState({ vaHint: v.text || 'Không nghe rõ — bấm mic thử lại' }); setTimeout(() => u.setState({ va: false }), 2500); }
  };
  window.tcSkipIntro = () => { if (window.__tc) window.__tc.setState({ intro: null }); const u = window.__ui; if (u) { clearTimeout(u.b1); clearTimeout(u.b2); u.setState({ boot: null }); } };

  // ---- scene layer: hide its own UI, remember theme choices, hide the UI layer while the theme picker is open ----
  const KEEP = ['theme', 'lang', 'gauge', 'cockpit', 'autoTheme', 'mxCol', 'night'];
  window.tcScenePost = function (v, comp) {
    if (N) {
      v.introStepOn = false;
      document.body.classList.toggle('theme-open', !!v.themeOpen);
      const keep = {}; KEEP.forEach((k) => { if (comp.state[k] !== undefined) keep[k] = comp.state[k]; });
      const js = JSON.stringify(keep); if (js !== window.__sceneKeep) { window.__sceneKeep = js; try { localStorage.setItem('tc-scene', js); } catch (e) {} if (live.theme !== keep.theme) { live.theme = keep.theme; } }
    }
    return v;
  };
  window.tcSceneInit = (comp) => { try { const k = JSON.parse(localStorage.getItem('tc-scene') || '{}'); if (k && typeof k === 'object') { comp.setState(Object.assign(k, { intro: null })); live.theme = k.theme; } } catch (e) {} };
  window.tcFit = fit;
})();
