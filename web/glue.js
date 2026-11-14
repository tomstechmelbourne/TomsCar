// glue.js – connects the two Tom's Car layers (scene = Main board, ui = App board) to the Android shell (window.TCNative).
(function () {
  'use strict';
  const N = window.TCNative || null;
  const call = (action, arg) => { try { if (N) N.call(action, arg == null ? '' : String(arg)); } catch (e) { console.log('TCN ' + e); } };
  window.TCN = N ? { call } : null;
  if (N) document.body.classList.add('app');

  // ---- scale the 1280x720 stage to the window; a narrow window (next to a map) gets the compact column ----
  const stage = document.getElementById('stage');
  let narrow = false, forceWide = false;
  // phone (#44): the compact screen can open the full screens; "Màn Hình Gọn" brings it back
  window.tcForceWide = (on) => { forceWide = !!on; live.forceWide = forceWide; fit(); if (window.__ui) window.__ui.setState({ live: Object.assign({}, live) }); };
  const fit = () => {
    const w = window.innerWidth, h = window.innerHeight;
    narrow = w / h < 1.1 && !forceWide;
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
  let TOTAL = 727; const R = 6371;
  const toXY = (lat, lon) => [lon * Math.cos(-36.5 * Math.PI / 180) * Math.PI / 180 * R, lat * Math.PI / 180 * R];
  let P = [], total = 0, cum = [0];
  const setRoute = (pts, tot) => { window.__routePts = pts; P = pts.map(([a, b]) => toXY(a, b)); total = 0; cum = [0]; for (let i = 1; i < P.length; i++) { total += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); cum.push(total); } TOTAL = tot || Math.round(total); lastKm = null; dirVotes = 0; trip = null; };
  // a trip from the trip list: [[lat,lon],…] + road km (OSRM); null = Melbourne ⇄ Adelaide
  window.tcSetRoute = (pts, tot) => { if (pts && pts.length > 1) setRoute(pts, tot); else setRoute(ROUTE, 727); };
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
      '&current=temperature_2m,apparent_temperature,weather_code,precipitation_probability,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&timezone=auto&forecast_days=6';
    fetch(u).then((r) => r.json()).then((j) => {
      wxAt = Date.now();
      const nowH = new Date(); nowH.setMinutes(0, 0, 0);
      const hourly = []; const ht = (j.hourly && j.hourly.time) || [];
      for (let i = 0; i < ht.length && hourly.length < 12; i++) { const t = new Date(ht[i]); if (t >= nowH) { const hr = t.getHours(); let c = wxCode(j.hourly.weather_code[i]); if (c === 'clear' && (hr < 6 || hr >= 20)) c = 'night'; hourly.push({ t: ht[i], temp: j.hourly.temperature_2m[i], code: c, rain: j.hourly.precipitation_probability ? j.hourly.precipitation_probability[i] : null }); } }
      const daily = ((j.daily && j.daily.time) || []).map((d, i) => ({ d: d, hi: j.daily.temperature_2m_max[i], lo: j.daily.temperature_2m_min[i], code: wxCode(j.daily.weather_code[i]) }));
      const sun = j.daily && j.daily.sunrise ? { rise: j.daily.sunrise[0], set: j.daily.sunset[0] } : null;
      window.__sun = sun; window.__sunDays = j.daily ? { rise: j.daily.sunrise, set: j.daily.sunset } : null;
      push({ wx: { temp: j.current.temperature_2m, feels: j.current.apparent_temperature, code: wxCode(j.current.weather_code), rain: j.current.precipitation_probability || 0, wind: j.current.wind_speed_10m, hi: j.daily.temperature_2m_max[0], lo: j.daily.temperature_2m_min[0], hourly: hourly, daily: daily, sun: sun } });
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
  // brand logos: cached; OSM brand:wikidata first, otherwise look the brand up by name on Wikidata
  // #53: logos of the common Australian brands are packed into the app at build time (logos/logos.js) — never looked up by name.
  // Only a shop whose map entry names its exact brand item (brand:wikidata) and is not in the list is looked up, and an empty answer is retried after 3 days.
  const LOCAL = window.__LOGOS || {};
  const logoCache = (() => { try { const c = JSON.parse(localStorage.getItem('tc-logos2') || '{}'); localStorage.removeItem('tc-logos'); return c; } catch (e) { return {}; } })();
  const saveLogos = () => { try { localStorage.setItem('tc-logos2', JSON.stringify(logoCache)); } catch (x) {} };
  const BRANDS = ['Ampol', 'BP', 'Shell', 'Caltex', '7-Eleven', 'United Petroleum', 'Puma Energy', 'Liberty', 'Mobil', 'Metro Petroleum', 'OTR', 'EG Ampol', "McDonald's", "Hungry Jack's", 'KFC', 'Subway', "Domino's", 'Red Rooster', 'Oporto', 'Guzman y Gomez', 'Starbucks', 'Gloria Jean\'s Coffees', 'The Coffee Club', 'Coles', 'Woolworths', 'Aldi', 'IGA', 'Foodworks', 'Bakers Delight'];
  const BRULES = (window.__BRAND_RULES || []).map(([k, r]) => { try { return [k, new RegExp(r, 'i')]; } catch (e) { return null; } }).filter(Boolean);
  const brandKey = (n) => { const t = (n || '').toLowerCase().replace(/[’']/g, "'"); for (const [k, re] of BRULES) if (re.test(t)) return k; if (/maccas|mcdonald/.test(t)) return "McDonald's"; if (/hungry jack/.test(t)) return "Hungry Jack's"; if (/\bkfc\b|kentucky/.test(t)) return 'KFC'; if (/woolies|woolworths/.test(t)) return 'Woolworths'; if (/\bservo\b/.test(t)) return ''; return BRANDS.find((b) => t.indexOf(b.toLowerCase()) >= 0) || ''; };
  const logoOf = (qid) => fetch('https://www.wikidata.org/wiki/Special:EntityData/' + qid + '.json').then((r) => r.json()).then((j) => {
    const e = j.entities && j.entities[qid]; const c = e && e.claims && (e.claims.P154 || e.claims.P8972);
    const f = c && c[0] && c[0].mainsnak && c[0].mainsnak.datavalue && c[0].mainsnak.datavalue.value;
    return f ? 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(f) + '?width=96' : '';
  });
  const brandLogo = (qid, name) => new Promise((res) => {
    const bk = brandKey(name);
    if (bk && LOCAL[bk]) return res(LOCAL[bk]);
    if (!qid) return res('');
    const c = logoCache[qid];
    if (c && (c.u || Date.now() - c.t < 3 * 86400000)) return res(c.u || '');
    logoOf(qid).then((url) => { logoCache[qid] = { u: url || '', t: Date.now() }; saveLogos(); res(url || ''); }).catch(() => res(''));
  });
  window.tcBrandKey = brandKey;
  window.tcLogo = (n) => LOCAL[brandKey(n)] || '';
  const isOpenNow = (oh) => { if (!oh) return null; if (oh === '24/7') return true; return null; };
  // staged search 5 → 15 → 30 km; remembers last results; status shown on screen
  const placeCache = (() => { try { return JSON.parse(localStorage.getItem('tc-places') || '{}'); } catch (e) { return {}; } })();
  let lastFind = { cat: null, lat: null, lon: null };
  window.tcFindPlaces = (cat, quiet) => {
    const u = window.__ui; if (!u) return;
    const lat = live.lat, lon = live.lon;
    if (lat == null) { if (placeCache[cat]) u.setState({ places: Object.assign({}, u.state.places, { [cat]: placeCache[cat].items }), placesMsg: 'Chưa có GPS — đang hiện kết quả lần trước' }); else u.setState({ placesMsg: 'Chưa có GPS — chờ chút rồi bấm Thử Lại', placesFail: true }); return; }
    lastFind = { cat, lat, lon };
    const radii = [5000, 15000, 30000];
    const go = (ri) => {
      u.setState({ placesBusy: true, placesFail: false, placesMsg: 'Đang tìm trong ' + radii[ri] / 1000 + ' km…' });
      let filt = CATQ[cat] || CATQ.fuel;
      if (/^q:/.test(cat)) { const raw = cat.slice(2).trim(); const bk = brandKey(raw); const term = (bk || raw).replace(/[^\w\s'&-]/g, '').replace(/'/g, '.'); filt = '[~"^(name|brand)$"~"' + term + '",i]'; }
      const q = '[out:json][timeout:20];(nwr(around:' + radii[ri] + ',' + lat + ',' + lon + ')' + filt + ';);out center tags 60;';
      return overpass(q).then((j) => {
        const brg = live.bearing;
        const items = (j.elements || []).map((e) => {
          const la = e.lat != null ? e.lat : e.center && e.center.lat, lo = e.lon != null ? e.lon : e.center && e.center.lon;
          const t = e.tags || {}; const km = dist(lat, lon, la, lo);
          let ahead = true, side = '';
          if (brg != null && live.speed > 5) {
            const b = (Math.atan2((lo - lon) * Math.cos(lat * Math.PI / 180), la - lat) * 180 / Math.PI + 360) % 360;
            const diff = ((b - brg + 540) % 360) - 180; ahead = Math.abs(diff) < 75; side = diff < 0 ? 'bên trái' : 'bên phải';
          }
          const nm = t.brand || t.name || '';
          return { name: t.name || t.brand || ({ fuel: 'Trạm xăng', cafe: 'Café', wc: 'Nhà vệ sinh', rest: 'Chỗ nghỉ chân', shop: 'Siêu thị' }[cat] || 'Chỗ này'), brand: brandKey(nm), addr: [t['addr:street'], t['addr:suburb'] || t['addr:city']].filter(Boolean).join(', '), lat: la, lon: lo, km: Math.round(km * 10) / 10, ahead, side, open: isOpenNow(t.opening_hours), qid: t['brand:wikidata'] || '', k: cat === 'fuel' ? 'fuel' : cat === 'cafe' ? 'cafe' : cat === 'wc' ? 'wc' : cat === 'rest' ? 'rest' : cat === 'shop' ? 'shop' : 'food' };
        }).filter((p) => p.lat != null).sort((a, b) => (b.ahead - a.ahead) || (a.km - b.km)).slice(0, 12);
        if (!items.length && ri + 1 < radii.length) return go(ri + 1);
        return Promise.all(items.map((p) => brandLogo(p.qid, p.brand || p.name).then((url) => Object.assign(p, { logo: url })))).then((its) => {
          placeCache[cat] = { at: Date.now(), items: its }; try { localStorage.setItem('tc-places', JSON.stringify(placeCache)); } catch (x) {}
          u.setState({ places: Object.assign({}, u.state.places, { [cat]: its }), placesBusy: false, placesFail: false, placesMsg: its.length ? 'Trong ' + radii[ri] / 1000 + ' km · gần nhất, ưu tiên phía trước' : 'Không thấy chỗ nào trong 30 km' });
        });
      });
    };
    go(0).catch(() => {
      const old = placeCache[cat];
      u.setState({ placesBusy: false, placesFail: true, places: old ? Object.assign({}, u.state.places, { [cat]: old.items }) : u.state.places, placesMsg: old ? 'Mất mạng — đang hiện kết quả lần trước' : 'Không tìm được (mất mạng?) — bấm Thử Lại' });
    });
  };
  // while on the Tìm Chỗ screen and driving: search again about every 2 km
  setInterval(() => { const u = window.__ui; if (!u || u.state.scr !== 'search' || !lastFind.cat || live.lat == null || u.state.placesBusy) return; if (dist(live.lat, live.lon, lastFind.lat, lastFind.lon) >= 2) window.tcFindPlaces(u.state.cat, true); }, 15000);

  // ---- region → Low-Poly scene (OSM land use around us, ~every 1.5 km, needs the same answer twice) ----
  let regAt = null, regBusy = false, regCand = null, regCount = 0;
  const regionOf = (j) => {
    const sc = {}; const add = (k, w) => { sc[k] = (sc[k] || 0) + w; };
    (j.elements || []).forEach((e) => { const t = e.tags || {};
      if (t.natural === 'beach' || t.natural === 'coastline' || t.natural === 'bay') add('lp_coast', 3);
      if (t.landuse === 'vineyard') add('lp_yarra', 3);
      if (t.landuse === 'forest' || t.natural === 'wood') add('lp_dande', 1);
      if (t.natural === 'scrub' || t.natural === 'desert' || t.natural === 'sand' || t.natural === 'heath') add('lp_outback', 1.5);
      if (t.landuse === 'farmland' && /wheat|cereal|grain/.test(t.crop || '')) add('lp_wheat', 2);
      if (t.man_made === 'silo') add('lp_wheat', 2);
      if (t.landuse === 'farmland' || t.landuse === 'meadow' || t.landuse === 'farmyard' || t.landuse === 'orchard') add('lp_farm', 1);
      if (t.landuse === 'residential') add('lp_au', 1);
      if (t.landuse === 'commercial' || t.landuse === 'retail' || (t.building && +t['building:levels'] >= 8)) add('lp_melb', 1.5);
      if (t.natural === 'glacier' || t.landuse === 'winter_sports' || t['piste:type']) add('lp_snow', 4);
    });
    let best = null, bv = 0; Object.keys(sc).forEach((k) => { if (sc[k] > bv) { bv = sc[k]; best = k; } });
    return best || 'lp_outback';
  };
  const checkRegion = (lat, lon) => {
    if (regBusy || (regAt && dist(lat, lon, regAt[0], regAt[1]) < 1.5)) return;
    regBusy = true; regAt = [lat, lon];
    const q = '[out:json][timeout:15];(way(around:1200,' + lat + ',' + lon + ')[~"^(landuse|natural|man_made)$"~"."];way(around:600,' + lat + ',' + lon + ')["building:levels"];);out tags 300;';
    overpass(q).then((j) => {
      const r = regionOf(j);
      if (r === regCand) regCount++; else { regCand = r; regCount = 1; }
      if (regCount >= 2 && window.__regionScene !== r) {
        window.__regionScene = r;
        if (window.__ui) { window.__ui.setState({ regionAt: Date.now() }); const nm = window.TCScene && window.TCScene.names ? window.TCScene.names(r) : ''; if (nm && window.__ui.state.set && window.__ui.state.set.autoScene) window.__ui.setState({ townSign: { name: (live.place && live.place.suburb) || nm, at: Date.now() } }); }
      }
    }).catch(() => {}).then(() => { regBusy = false; });
  };


  // ---- new trip: geocode (Nominatim) → road route (OSRM) → suggested stops (Overpass) ----
  const ST = { Victoria: 'VIC', 'New South Wales': 'NSW', Queensland: 'QLD', 'South Australia': 'SA', 'Western Australia': 'WA', Tasmania: 'TAS', 'Northern Territory': 'NT', 'Australian Capital Territory': 'ACT' };
  const geocode = (q) => fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=au&addressdetails=1&accept-language=en&q=' + encodeURIComponent(q)).then((r) => r.json()).then((a) => {
    if (!a || !a[0]) throw new Error('nf:' + q);
    const ad = a[0].address || {}; const nm = ad.city || ad.town || ad.village || ad.suburb || q.split(',')[0];
    return { name: nm.replace(/^City of /, ''), st: ST[ad.state] || '', lat: +a[0].lat, lon: +a[0].lon };
  });
  const alongKm = (pts, km, la, lo) => { let tot = 0, best = { d: 1e9, k: 0 }; const L = []; for (let i = 1; i < pts.length; i++) L.push(dist(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1])); const sum = L.reduce((a, b) => a + b, 0) || 1;
    for (let i = 1; i < pts.length; i++) { const d0 = dist(la, lo, pts[i][0], pts[i][1]); if (d0 < best.d) best = { d: d0, k: tot + L[i - 1] }; tot += L[i - 1]; } return Math.round(best.k / sum * km); };
  const pointAt = (pts, frac) => { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + dist(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1])); const t = frac * L[L.length - 1]; let i = 1; while (i < L.length - 1 && L[i] < t) i++; return pts[i]; };
  window.tcPlanTrip = (fromQ, toQ) => {
    const u = window.__ui;
    const say = (m) => u && u.setState({ ntMsg: m });
    say('Đang tìm ' + (typeof fromQ === 'object' ? (fromQ.name || 'vị trí của Tom') : fromQ) + ' và ' + toQ + '…');
    const geo = (q) => (q && typeof q === 'object' && q.lat != null) ? Promise.resolve({ name: q.name || 'Vị trí của Tom', st: q.st || '', lat: q.lat, lon: q.lon }) : geocode(q);
    return Promise.all([geo(fromQ), geo(toQ)]).then(([a, b]) => {
      say('Đang tìm đường ' + a.name + ' → ' + b.name + '…');
      return fetch('https://router.project-osrm.org/route/v1/driving/' + a.lon + ',' + a.lat + ';' + b.lon + ',' + b.lat + '?overview=full&geometries=geojson').then((r) => r.json()).then((j) => {
        const rt = j.routes && j.routes[0]; if (!rt) throw new Error('route');
        const all = rt.geometry.coordinates.map((c) => [Math.round(c[1] * 1e5) / 1e5, Math.round(c[0] * 1e5) / 1e5]);
        const n = Math.max(1, Math.ceil(all.length / 250)); const pts = all.filter((_, i) => i % n === 0); pts.push(all[all.length - 1]);
        const km = Math.round(rt.distance / 1000);
        let border = -1;
        if ((a.st === 'SA') !== (b.st === 'SA') && (a.st === 'SA' || b.st === 'SA')) { for (let i = 1; i < pts.length; i++) { if ((pts[i - 1][1] - 140.965) * (pts[i][1] - 140.965) <= 0) { border = alongKm(pts, km, pts[i][0], pts[i][1]); if (a.st === 'SA') border = border; break; } } }
        return { a, b, pts, km, border, mins: Math.round(rt.duration / 60) };
      });
    }).then((T) => {
      const cnt = Math.max(1, Math.min(8, Math.floor(T.km / 130)));
      const places = {}; const ids = [];
      const one = (i) => {
        if (i > cnt) return Promise.resolve();
        if (i === cnt && T.km < 130) return Promise.resolve();
        const p = pointAt(T.pts, i / (cnt + 1)); say('Đang chọn chỗ ghé ' + i + '/' + cnt + '…');
        const q = '[out:json][timeout:15];(nwr(around:5000,' + p[0] + ',' + p[1] + ')[amenity~"^(fuel|cafe|fast_food)$"][name];nwr(around:6000,' + p[0] + ',' + p[1] + ')[highway=rest_area];node(around:25000,' + p[0] + ',' + p[1] + ')[place~"^(town|city)$"];);out center tags 40;';
        return overpass(q).then((j) => {
          const els = j.elements || []; const town = els.filter((e) => e.tags && e.tags.place).map((e) => ({ n: e.tags.name, d: dist(p[0], p[1], e.lat, e.lon) })).sort((x, y) => x.d - y.d)[0];
          const want = i % 2 ? ['cafe', 'fast_food', 'fuel'] : ['fuel', 'cafe', 'fast_food'];
          let pick = null; for (const w of want) { pick = els.find((e) => e.tags && e.tags.amenity === w); if (pick) break; }
          if (!pick) pick = els.find((e) => e.tags && e.tags.highway === 'rest_area');
          if (!pick) return;
          const la = pick.lat != null ? pick.lat : pick.center.lat, lo = pick.lon != null ? pick.lon : pick.center.lon, t = pick.tags;
          const k = t.amenity === 'fuel' ? 'fuel' : t.amenity === 'cafe' ? 'cafe' : t.highway === 'rest_area' ? 'rest' : 'food';
          const id = 's' + i + '_' + Date.now().toString(36);
          places[id] = { name: t.name || 'Chỗ nghỉ chân', town: (town ? town.n : '') + (T.a.st ? '' : ''), k, km: alongKm(T.pts, T.km, la, lo), stay: k === 'fuel' ? 15 : k === 'rest' ? 15 : 25, lat: la, lon: lo };
          ids.push(id);
        }).catch(() => {}).then(() => one(i + 1));
      };
      return one(1).then(() => {
        ids.sort((x, y) => places[x].km - places[y].km);
        say('');
        return { id: 't' + Date.now().toString(36), name: T.a.name + ' → ' + T.b.name, from: T.a, to: T.b, km: T.km, mins: T.mins, pts: T.pts, border: T.border, places, lists: { goList: ids.slice(), backList: ids.slice().reverse(), skip: {}, custom: {} }, pinned: false, at: Date.now() };
      });
    }).catch((e) => { say(/nf:/.test(String(e && e.message)) ? 'Không tìm thấy "' + String(e.message).slice(3) + '" — gõ rõ hơn (vd "Sydney NSW")' : 'Không tìm được đường (mất mạng?) — thử lại'); throw e; });
  };
  // routes of saved trips so we can guess which trip we're on
  window.__tripRoutes = [];
  let suggAt = 0;
  setInterval(() => {
    if (live.lat == null || !window.__tripRoutes.length || Date.now() - suggAt < 1800000) return;
    const on = routeKm(live.lat, live.lon); if (on.off < 40) return;
    const hit = window.__tripRoutes.find((t) => t.id !== window.__tripId && t.pts && t.pts.some((p) => dist(live.lat, live.lon, p[0], p[1]) < 8));
    if (hit && window.__ui) { suggAt = Date.now(); window.__ui.setState({ tripSuggest: hit.id }); window.__ui.toast('Hình như bạn đang chạy chuyến ' + hit.name + ' — bấm "Chuyến" trên Road Trip để đổi'); }
  }, 60000);
  // crossing into another state: a short reminder of the rules there
  const RULES = {
    VIC: 'Vô Victoria: qua xe cứu thương/cảnh sát đang đậu chớp đèn phải chạy 40 km/h.',
    NSW: 'Vô New South Wales: qua xe cứu thương/cảnh sát đang đậu chớp đèn phải chạy 40 km/h. Camera bắt dùng điện thoại khi lái.',
    SA: 'Vô South Australia: giờ SA chậm hơn VIC 30 phút. Qua xe cứu thương/cảnh sát đang đậu chớp đèn chạy 25 km/h. Có trạm kiểm dịch trái cây tươi.',
    QLD: 'Vô Queensland: QLD không đổi giờ mùa hè. Qua xe cứu thương/cảnh sát đang đậu chớp đèn phải chạy chậm lại.',
    ACT: 'Vô ACT: qua xe cứu thương/cảnh sát đang đậu chớp đèn phải chạy 40 km/h.',
    WA: 'Vô Western Australia: có trạm kiểm dịch, không mang trái cây/rau tươi. Giờ WA khác nhiều.',
    NT: 'Vô Northern Territory: đường dài ít trạm xăng — đổ đầy trước khi đi.',
    TAS: 'Vô Tasmania: có kiểm dịch trái cây/rau tươi.'
  };
  let lastState = null;
  const stateOf = (n) => ST[n] || n;
  const checkState = () => { const n = live.place && live.place.state ? stateOf(live.place.state) : null; if (!n) return; if (lastState && n !== lastState && RULES[n] && window.__ui) { window.__ui.toast(RULES[n] + ' (luật có thể đổi — nhớ coi biển báo)'); if (window.__ui.state.set && window.__ui.state.set.stateRules !== false) window.__ui.say(RULES[n]); } lastState = n; };
  setInterval(checkState, 20000);
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


  // time of day from the real sunrise/sunset (falls back to the clock): ±30 min around rise = dawn, around set = dusk
  window.tcTod = function (now) {
    const t = (now || new Date()).getTime(), sd = window.__sunDays;
    let r = null, st = null;
    if (sd && sd.rise) { const day = new Date(t).toISOString ? new Date(t) : null; for (let i = 0; i < sd.rise.length; i++) { const rr = new Date(sd.rise[i]).getTime(), ss = new Date(sd.set[i]).getTime(); if (t < ss + 12 * 3600000) { r = rr; st = ss; break; } } }
    if (r == null) { const h = new Date(t).getHours() + new Date(t).getMinutes() / 60; return h < 5.5 || h >= 20.5 ? 'night' : h < 6.5 ? 'dawn' : h >= 19.5 ? 'dusk' : 'day'; }
    const M = 1800000;
    if (t < r - M || t > st + M) return 'night';
    if (t <= r + M) return 'dawn';
    if (t >= st - M) return 'dusk';
    return 'day';
  };
  // ---- trip: direction, start time, today's distance, parked time ----
  let trip = null, lastKm = null, dirVotes = 0, today = (() => { try { const t = JSON.parse(localStorage.getItem('tc-today') || 'null'); return t && t.day === new Date().toDateString() ? t : null; } catch (e) { return null; } })();
  let lastT = Date.now(), parkedSince = Date.now();
  setRoute(ROUTE, 727);
  // odometer: Trip A (day), Trip B (whole trip), drive log per leg (GPS km vs estimate, time, average)
  const odo = (() => { try { return JSON.parse(localStorage.getItem('tc-odo') || 'null') || { a: 0, b: 0, aDay: '' }; } catch (e) { return { a: 0, b: 0, aDay: '' }; } })();
  const legs = (() => { try { return JSON.parse(localStorage.getItem('tc-legs') || '[]'); } catch (e) { return []; } })();
  let cur = null;
  window.tcOdoReset = (k) => { odo[k] = 0; try { localStorage.setItem('tc-odo', JSON.stringify(odo)); } catch (e) {} push({ odo: Object.assign({}, odo) }); };
  window.tcLegs = () => legs.slice();
  window.tcLegsClear = (tripId) => { for (let i = legs.length - 1; i >= 0; i--) if (!tripId || legs[i].trip === tripId) legs.splice(i, 1); try { localStorage.setItem('tc-legs', JSON.stringify(legs)); } catch (e) {} };
  const tripUpdate = (d) => {
    const now = Date.now(), dt = (now - lastT) / 3600000; lastT = now;
    const sp = d.speed || 0;
    if (!today || today.day !== new Date().toDateString()) today = { day: new Date().toDateString(), km: 0, max: 0, secs: 0 };
    if (sp > 3) {
      const dk = sp * dt; today.km += dk; today.secs += dt * 3600; today.max = Math.max(today.max, sp); parkedSince = now;
      if (odo.aDay !== today.day) { odo.a = 0; odo.aDay = today.day; }
      odo.a += dk; odo.b += dk;
      if (!cur) cur = { day: today.day, start: now, km: 0, secs: 0, fromKm: lastKm, trip: window.__tripId || 'mel-adl' };
      cur.km += dk; cur.secs += dt * 3600; cur.toKm = lastKm; cur.dir = dirVotes >= 0 ? 'go' : 'back';
      if (Math.round(odo.b * 10) % 5 === 0) { try { localStorage.setItem('tc-odo', JSON.stringify(odo)); } catch (e) {} }
    }
    // parked 10 min → close the leg and log it
    if (cur && now - parkedSince > 600000) {
      if (cur.km > 1) { legs.push({ trip: cur.trip, day: cur.day, start: cur.start, km: Math.round(cur.km * 10) / 10, est: (cur.fromKm != null && cur.toKm != null) ? Math.round(Math.abs(cur.toKm - cur.fromKm)) : null, mins: Math.round(cur.secs / 60), avg: cur.secs > 60 ? Math.round(cur.km / (cur.secs / 3600)) : 0, dir: cur.dir, place: (live.place && live.place.suburb) || '' }); if (legs.length > 300) legs.shift(); try { localStorage.setItem('tc-legs', JSON.stringify(legs)); localStorage.setItem('tc-odo', JSON.stringify(odo)); } catch (e) {} }
      cur = null;
    }
    try { localStorage.setItem('tc-today', JSON.stringify(today)); } catch (e) {}
    const out = { today: { km: Math.round(today.km), max: Math.round(today.max), avg: today.secs > 60 ? Math.round(today.km / (today.secs / 3600)) : 0 }, parkedMin: Math.floor((now - parkedSince) / 60000), odo: { a: odo.a, b: odo.b, leg: cur ? cur.km : 0, legMin: cur ? Math.round(cur.secs / 60) : 0 }, legsN: legs.length };
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
  // ---- #49: trip start = where Tom is (home address if saved, else the first GPS fix while parked) ----
  let gpsStart = null;
  window.tcHome = () => { try { return JSON.parse(localStorage.getItem('tc-home') || 'null'); } catch (e) { return null; } };
  window.tcSetHome = (clear) => { try { if (clear) { localStorage.removeItem('tc-home'); return null; } if (live.lat == null) return false; const h = { lat: live.lat, lon: live.lon, name: (live.place && live.place.suburb) || 'Nhà' }; localStorage.setItem('tc-home', JSON.stringify(h)); return h; } catch (e) { return false; } };
  window.tcStartPt = () => { const h = window.tcHome(); if (h) return Object.assign({ home: true }, h); if (gpsStart) return { lat: gpsStart.lat, lon: gpsStart.lon, name: gpsStart.name || 'Vị trí của Tom' }; return null; };
  const push = (patch) => {
    live = Object.assign({}, live, patch);
    if (window.__tc) window.__tc.setState({ live });
    if (window.__ui) window.__ui.setState({ live: narrow ? Object.assign({}, live, { vw: 420, vh: Math.round(420 * window.innerHeight / window.innerWidth) }) : live });
  };
  let fitW = 0, fitH = 0;
  window.tcLive = function (json) {
    if (window.innerWidth !== fitW || window.innerHeight !== fitH) { fitW = window.innerWidth; fitH = window.innerHeight; fit(); }
    let d; try { d = typeof json === 'string' ? JSON.parse(json) : json; } catch (e) { return; }
    const patch = Object.assign({}, d, tripUpdate(d));
    if (d.lat != null && d.lon != null && !gpsStart && !(d.speed > 8)) gpsStart = { lat: d.lat, lon: d.lon, name: '' };   // #49: where the car was when the app started
    if (gpsStart && !gpsStart.name && live.place && live.place.suburb) gpsStart.name = live.place.suburb;
    if (d.lat != null && d.lon != null) { fetchWx(d.lat, d.lon); fetchLimit(d.lat, d.lon, d.bearing, d.speed || 0); loadRadio(d.lat, d.lon); checkRegion(d.lat, d.lon); }
    push(patch);
  };
  // callbacks from native
  window.tcApps = (a) => { if (window.__ui) window.__ui.setState({ apps: typeof a === 'string' ? JSON.parse(a) : a }); };
  window.tcCallLog = (a) => { if (window.__ui) window.__ui.setState({ calls: typeof a === 'string' ? JSON.parse(a) : a }); };
  window.tcMsgs = (a) => { if (window.__ui) window.__ui.setState({ msgs: typeof a === 'string' ? JSON.parse(a) : a }); };
  window.tcGeo = (r) => { if (window.__geoCb) window.__geoCb(typeof r === 'string' ? JSON.parse(r) : r); };
  window.tcToast = (t) => { if (window.__ui) window.__ui.toast(t); };
  // Tom's Jukebox answered: library summary + its current look
  window.tcJukebox = (j) => { try { const o = typeof j === 'string' ? JSON.parse(j) : j; window.__jbLib = o; window.__jbLook = o.look || null; window.__jbRadio = true; if (window.__ui) window.__ui.setState({ jbAt: Date.now() }); } catch (e) {} };
  window.tcVoice = (v) => {
    const u = window.__ui; if (!u) return; v = typeof v === 'string' ? JSON.parse(v) : v;
    if (v.state === 'tts') { window.__voiceState = Object.assign(window.__voiceState || {}, { ok: v.ok, vi: v.vi, google: v.google, voices: v.voices || (window.__voiceState || {}).voices }); u.setState({ vsAt: Date.now() }); if (v.vi === false && !window.__viWarned) { window.__viWarned = true; u.toast('Chưa có giọng Tiếng Việt — vào Cài Đặt → Trợ Lý → Tải Giọng Việt'); } return; }
    if (v.state === 'wakelog') { window.__voiceState = Object.assign(window.__voiceState || {}, { log: v.log }); return; }
    if (v.state === 'closed') { u.setState({ va: false, vaHeard: '', vaHint: '' }); return; }
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

// ---- Road Trip real map (Leaflet + OpenStreetMap tiles), sits on top of the UI over the "Bản Đồ" box ----
(function () {
  const TILES = {
    dark: ['https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', '© OpenStreetMap © CARTO', 19],
    light: ['https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', '© OpenStreetMap © CARTO', 19],
    topo: ['https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', '© OpenStreetMap · SRTM · © OpenTopoMap (CC-BY-SA)', 17],
    sat: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 'Ảnh vệ tinh © Esri, Maxar, Earthstar Geographics', 18]
  };
  let follow = false, userAt = 0, lastVan = null, loc = null, curDrive = false;
  const paintLoc = () => { if (!loc) return; loc.style.color = !lastVan ? '#7A8A94' : follow ? '#FBB040' : '#FFFFFF'; loc.style.boxShadow = follow ? 'inset 0 0 0 2px #FBB040' : 'none'; loc.title = !lastVan ? 'Đang tìm vị trí…' : ''; };
  let map = null, layer = null, layerKey = '', routeL = null, doneL = null, van = null, marks = [], lastSig = '', box = null, ctl = null, fitted = '';
  const circ = (n) => n <= 20 ? String.fromCharCode(0x245F + n) : n + '.';
  const pointAtKm = (pts, km, tot) => { if (!pts || pts.length < 2) return null; const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], (pts[i][1] - pts[i - 1][1]) * 0.8)); const t = Math.max(0, Math.min(1, km / tot)) * L[L.length - 1]; let i = 1; while (i < L.length - 1 && L[i] < t) i++; const f = Math.min(1, (t - L[i - 1]) / ((L[i] - L[i - 1]) || 1)); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; };
  const place = () => {
    if (!box) return; const st = document.getElementById('stage'); if (!st) return;
    const r = st.getBoundingClientRect(), s = r.width / 1280;
    box.style.left = (r.left + 20 * s) + 'px'; box.style.top = (r.top + 152 * s) + 'px'; box.style.width = (800 * s) + 'px'; box.style.height = (290 * s) + 'px';
    if (map) map.invalidateSize(false);
  };
  window.addEventListener('resize', () => setTimeout(place, 50));
  const ensure = () => {
    if (map || !window.L) return !!map;
    box = document.createElement('div'); box.id = 'rtmap';
    box.style.cssText = 'position:fixed;z-index:50;display:none;border-radius:12px;overflow:hidden;background:#0A1B28';
    document.body.appendChild(box);
    map = window.L.map(box, { zoomControl: false, attributionControl: true, preferCanvas: true }).setView([-36.5, 142], 6);
    map.attributionControl.setPrefix('');
    ctl = document.createElement('div');
    ctl.style.cssText = 'position:absolute;right:8px;top:8px;z-index:1000;display:flex;gap:4px;align-items:center;font:600 12px Overpass,sans-serif';
    box.appendChild(ctl);
    window.L.DomEvent.disableClickPropagation(ctl);
    map.on('zoomend moveend', relayout);
    // view switch (top-left) + locate button (bottom-right)
    const vs = document.createElement('div'); vs.style.cssText = 'position:absolute;left:8px;top:8px;z-index:1000;display:flex;gap:4px;font:700 13px Overpass,sans-serif';
    vs.appendChild(btn('Con Đường', false, () => window.__ui && window.__ui.setS('rtView', 'road'))); vs.appendChild(btn('Bản Đồ', true, () => {}));
    box.appendChild(vs); window.L.DomEvent.disableClickPropagation(vs);
    loc = document.createElement('button'); loc.setAttribute('aria-label', 'Về vị trí xe');
    loc.style.cssText = 'position:absolute;right:10px;bottom:24px;z-index:1000;width:52px;height:52px;border-radius:50%;border:1px solid rgba(255,255,255,.3);cursor:pointer;display:flex;align-items:center;justify-content:center;background:rgba(8,22,34,.6);backdrop-filter:blur(10px)';
    loc.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
    loc.onclick = () => { if (!lastVan) return; follow = true; userAt = 0; map.setView(lastVan, Math.max(map.getZoom(), 13), { animate: true }); paintLoc(); };
    box.appendChild(loc); window.L.DomEvent.disableClickPropagation(loc);
    map.on('dragstart', () => { follow = false; userAt = Date.now(); paintLoc(); });
    map.getContainer().addEventListener('wheel', () => { follow = false; userAt = Date.now(); paintLoc(); }, { passive: true });
    map.getContainer().addEventListener('touchstart', (e) => { if (e.touches && e.touches.length > 1) { follow = false; userAt = Date.now(); paintLoc(); } }, { passive: true });
    paintLoc();
    return true;
  };
  const btn = (label, on, fn) => { const b = document.createElement('button'); b.textContent = label; b.style.cssText = 'height:30px;padding:0 9px;border:0;border-radius:15px;cursor:pointer;font:inherit;background:' + (on ? '#FBB040' : 'rgba(3,17,28,0.88)') + ';color:' + (on ? '#2A1A00' : '#CFE6EE'); b.onclick = fn; return b; };
  const drawCtl = (o) => {
    ctl.innerHTML = '';
    const set = (k, v) => window.__ui && window.__ui.setS(k, v);
    [['auto', 'Tự Động'], ['dark', 'Tối'], ['light', 'Sáng'], ['topo', 'Địa Hình'], ['sat', 'Vệ Tinh']].forEach(([k, l]) => ctl.appendChild(btn(l, o.style === k, () => set('mapStyle', k))));
    ctl.appendChild(btn(o.night ? '🌙' : '☀', false, () => set('mapStyle', o.night ? 'light' : 'dark')));
    const r = document.createElement('input'); r.type = 'range'; r.min = 40; r.max = 120; r.value = o.bright; r.setAttribute('aria-label', 'Độ sáng bản đồ'); r.style.cssText = 'width:80px'; r.onchange = () => set('mapBright', +r.value); ctl.appendChild(r);
    const f = document.createElement('button'); f.textContent = '⤢'; f.setAttribute('aria-label', 'Cả chuyến'); f.style.cssText = 'height:30px;width:30px;border:0;border-radius:15px;background:rgba(3,17,28,0.88);color:#CFE6EE;cursor:pointer'; f.onclick = () => { if (routeL) map.fitBounds(routeL.getBounds(), { padding: [20, 20] }); }; ctl.appendChild(f);
  };
  // labels: name only for next stop / start / destination when zoomed out; hide labels that overlap; merge dots that touch
  function relayout() {
    if (!map || !marks.length) return;
    const z = map.getZoom(); const P = marks.map((m) => ({ m, p: map.latLngToContainerPoint(m.ll) }));
    P.sort((a, b) => b.m.pri - a.m.pri);
    const shown = [], boxes = [];
    P.forEach((q) => {
      const near = shown.find((s) => Math.hypot(s.p.x - q.p.x, s.p.y - q.p.y) < 26);
      if (near) { near.group.push(q.m); q.m.mk.setOpacity(0); return; }
      q.group = [q.m]; shown.push(q); q.m.mk.setOpacity(1);
    });
    shown.forEach((q) => {
      const m = q.m, g = q.group; const wantName = m.pri >= 3 || z >= 9;
      let label = g.length > 1 ? Math.min.apply(null, g.map((x) => x.n || 99)) + '+' + (g.length - 1) : (m.end ? '🏁' : m.start ? '●' : String(m.n));
      let name = wantName ? m.short : '';
      const keep = m.start || m.end;
      const w = (label.length + name.length) * 7 + 30, bx = { x0: q.p.x - 12, x1: q.p.x - 12 + w, y0: q.p.y - 12, y1: q.p.y + 12 };
      if (name && boxes.some((b) => !(bx.x1 < b.x0 || bx.x0 > b.x1 || bx.y1 < b.y0 || bx.y0 > b.y1))) { bx.y0 -= 26; bx.y1 -= 26; if (!keep && boxes.some((b) => !(bx.x1 < b.x0 || bx.x0 > b.x1 || bx.y1 < b.y0 || bx.y0 > b.y1))) name = ''; else m.lift = 1; } else m.lift = 0;
      boxes.push(bx);
      const html = '<div style="display:flex;flex-direction:column;align-items:flex-start;transform:translate(-12px,' + (m.lift ? -38 : -12) + 'px)"><div style="display:flex;align-items:center;gap:4px;white-space:nowrap"><span style="min-width:24px;height:24px;border-radius:12px;padding:0 4px;box-sizing:border-box;background:' + m.bg + ';border:2px solid #fff;color:#fff;font:800 13px Overpass,sans-serif;display:flex;align-items:center;justify-content:center">' + label + '</span>' + (name ? '<span style="font:700 12px Overpass,sans-serif;color:#fff;background:rgba(3,17,28,0.85);padding:1px 6px;border-radius:4px">' + name + '</span>' : '') + '</div>' + (m.lift ? '<span style="width:2px;height:14px;background:#fff;margin-left:11px;opacity:.8"></span>' : '') + '</div>';
      m.mk.setIcon(window.L.divIcon({ className: '', html, iconSize: [0, 0] }));
      m.mk.off('click'); m.mk.on('click', () => { if (g.length > 1) map.fitBounds(window.L.latLngBounds(g.map((x) => x.ll)), { padding: [50, 50], maxZoom: 13 }); else if (window.__ui && m.id) window.__ui.setState({ dlg: 'stop', stopId: m.id }); });
    });
  }
  window.tcMapSync = (o) => {
    if (!o.show) { if (box) { box.style.display = 'none'; box.__shown = false; } return; }
    if (!ensure()) return;
    if (box.style.display === 'none' || !box.style.display) { box.style.display = 'block'; place(); }
    const key = o.styleKey; const T = TILES[key] || TILES.dark;
    if (layerKey !== key) { if (layer) map.removeLayer(layer); layer = window.L.tileLayer(T[0], { attribution: T[1], maxZoom: T[2], subdomains: 'abc', detectRetina: false }).addTo(map); layerKey = key; }
    const tp = box.querySelector('.leaflet-tile-pane'); if (tp) tp.style.filter = 'brightness(' + (o.bright / 100) + ')' + (o.tint ? ' sepia(0.15) saturate(1.1)' : '');
    const cs = o.style + o.night + o.bright; if (cs !== window.__mapCtlSig) { window.__mapCtlSig = cs; drawCtl(o); }
    if (box.__shown !== true) { box.__shown = true; setTimeout(() => { place(); }, 30); }
    const sig = o.tripId + '|' + o.isGo + '|' + o.stops.map((s) => s.id + s.next + s.done).join(',');
    if (sig !== lastSig) {
      lastSig = sig;
      const pts = o.pts && o.pts.length > 1 ? o.pts : [];
      if (routeL) map.removeLayer(routeL);
      routeL = window.L.polyline(pts, { color: '#FF8A1F', weight: 6, opacity: 0.95 }).addTo(map);
      marks.forEach((m) => map.removeLayer(m.mk)); marks = [];
      const mk = (m) => { const ll = m.lat != null ? [m.lat, m.lon] : pointAtKm(pts, m.routeKm, o.total); if (!ll) return; m.ll = window.L.latLng(ll[0], ll[1]); m.mk = window.L.marker(m.ll, { icon: window.L.divIcon({ className: '', html: '', iconSize: [0, 0] }), keyboard: false }).addTo(map); marks.push(m); };
      o.stops.forEach(mk);
      if (fitted !== o.tripId && pts.length) { fitted = o.tripId; map.fitBounds(routeL.getBounds(), { padding: [20, 20] }); }
      relayout();
    }
    lastVan = o.van || null; curDrive = !!o.drive; paintLoc();
    if (o.van) {
      const ico = window.L.divIcon({ className: '', iconSize: [0, 0], html: '<div style="transform:translate(-18px,-18px) rotate(' + Math.round(o.brg || 0) + 'deg);width:36px;height:36px"><svg width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="rgba(251,176,64,0.22)"/><path d="M18 5l9 23-9-5-9 5z" fill="#FBB040" stroke="#2A1A00" stroke-width="2" stroke-linejoin="round"/></svg></div>' });
      if (!van) van = window.L.marker(o.van, { icon: ico, keyboard: false, zIndexOffset: 1000 }).addTo(map); else { van.setLatLng(o.van); van.setIcon(ico); }
      if (!follow && curDrive && userAt && Date.now() - userAt > 10000) { follow = true; paintLoc(); }
      if (follow) map.panTo(o.van, { animate: true });
    }
  };
})();
