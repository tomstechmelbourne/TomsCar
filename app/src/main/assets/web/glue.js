// glue.js – connects the Tom's Car board to the Android shell (window.TCNative).
(function () {
  'use strict';
  const N = window.TCNative || null;
  const call = (action, arg) => { try { if (N) N.call(action, arg == null ? '' : String(arg)); } catch (e) { console.log('TCN ' + e); } };
  window.TCN = N ? { call } : null;
  if (N) document.body.classList.add('app');

  // ---- scale the 1280x720 board to the screen ----
  const stage = document.getElementById('stage');
  const fit = () => {
    const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  };
  window.addEventListener('resize', fit); fit();

  // ---- Melbourne -> Adelaide route (approx. town coordinates) for Road Trip km ----
  const ROUTE = [[-37.814, 144.963], [-37.562, 143.850], [-37.430, 143.383], [-37.283, 142.929], [-36.716, 142.199], [-36.452, 142.026], [-36.333, 141.650], [-36.378, 141.243], [-36.311, 140.772], [-36.098, 140.356], [-35.697, 139.860], [-35.255, 139.455], [-35.040, 138.880], [-34.929, 138.601]];
  const R = 6371;
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
    return { km: best.k / total * 700, off: best.d };
  };

  // ---- weather from Open-Meteo (no key) ----
  const wxCode = (c) => c === 0 || c === 1 ? 'clear' : c <= 3 ? 'cloudy' : c === 45 || c === 48 ? 'fog' : c >= 95 ? 'storm' : 'rain';
  let wxAt = 0, wxBusy = false;
  const fetchWx = (lat, lon) => {
    if (wxBusy || Date.now() - wxAt < 15 * 60 * 1000) return;
    wxBusy = true;
    const u = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat.toFixed(3) + '&longitude=' + lon.toFixed(3) +
      '&current=temperature_2m,apparent_temperature,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1';
    fetch(u).then((r) => r.json()).then((j) => {
      wxAt = Date.now();
      push({ wx: { temp: j.current.temperature_2m, feels: j.current.apparent_temperature, code: wxCode(j.current.weather_code), rain: j.current.precipitation_probability ?? 0, hi: j.daily.temperature_2m_max[0], lo: j.daily.temperature_2m_min[0] } });
    }).catch(() => {}).finally(() => { wxBusy = false; });
  };

  // ---- live state from native ----
  let live = {};
  const push = (patch) => {
    live = Object.assign({}, live, patch);
    if (window.__tc) window.__tc.setState({ live });
  };
  window.tcLive = function (json) {
    let d; try { d = typeof json === 'string' ? JSON.parse(json) : json; } catch (e) { return; }
    const patch = Object.assign({}, d);
    if (d.lat != null && d.lon != null) {
      const r = routeKm(d.lat, d.lon);
      patch.trip = r.off < 40 ? { km: r.km } : null; // only when near the Western Hwy route
      fetchWx(d.lat, d.lon);
    }
    push(patch);
  };

  // ---- extra values the board needs when running inside the app ----
  const ADDR = {
    'The Flywheel Bar & Cafe': '27 Neill St, Beaufort VIC 3373', 'Pink Lake': 'Pink Lake, Western Hwy, Dimboola VIC 3414',
    'Kaniva Windmill': 'Commercial St E, Kaniva VIC 3419', 'Keith (12810 Dukes Hwy)': '12810 Dukes Hwy, Keith SA 5267',
    'Coonalpyn Silo Mural': '23-25 Poyntz Terrace, Coonalpyn SA 5265', 'Adelaide': 'Adelaide SA 5000',
    'Tailem Bend': 'Tailem Bend SA 5259', 'Keith Bakery and Coffee shop': 'Makin St, Keith SA 5267',
    "McDonald's Horsham": '32-36 Dimboola Rd, Horsham VIC 3400', 'Melbourne': 'Melbourne VIC 3000'
  };
  window.tcPost = function (v, comp) {
    if (v.mx) v.mx.playIcon = 'M6 4h4.5v16H6zM13.5 4H18v16h-4.5z';
    if (!N) return v;
    v.tstRows = (v.tstRows || []).filter((r) => !/^(THỬ|TEST)/.test(r.label));
    v.openSettings = () => call('settings');
    const m = (comp.state.live || {}).media || {};
    if (v.mx) {
      v.mx.prevF = () => call('media', 'prev');
      v.mx.playF = () => call('media', 'toggle');
      v.mx.nextF = () => call('media', 'next');
      v.mx.volF = () => call('media', 'volume');
      v.mx.playIcon = m.playing === false ? 'M7 4l13 8-13 8V4z' : 'M6 4h4.5v16H6zM13.5 4H18v16h-4.5z';
      if (m.app) v.mx.srcTxt = m.app;
    }
    if (v.rt) v.rt.navF = () => call('nav', ADDR[v.rt.nxName] || v.rt.nxName);
    v.introStepOn = false;
    const vi = comp.state.lang !== 'en';
    const pl = (comp.state.live || {}).place;
    if (v.mx) {
      if (v.rt && v.rt.on) {
        v.mx.upMain = v.rt.nxName + ' · ' + v.rt.nxKm; v.mx.upSub = v.rt.nxEta;
      } else {
        v.mx.upL = vi ? 'ĐANG CHẠY TRÊN' : 'NOW ON';
        v.mx.upIcon = 'M12 2l7 19-7-4-7 4z';
        v.mx.upMain = pl && pl.street ? pl.street : (vi ? 'Đang dò vị trí…' : 'Finding location…');
        v.mx.upSub = pl ? [pl.suburb, pl.state].filter(Boolean).join(' · ') : '';
      }
    }
    v.hudTurn = pl && pl.street ? pl.street : '';
    return v;
  };
})();
