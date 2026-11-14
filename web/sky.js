/* Tom's Car — animated sky for the weather card (#wxmini) and the idle screen (#idlesky).
 * Layered scene in the style of a modern phone weather app, drawn here (no outside images):
 * gradient sky, far small clouds, near large soft clouds with a shadow, distant hills, sun/moon/stars, rain.
 * Parked: smooth ~30 fps drift. Driving: frozen. Calm (Dịu Mắt): half speed and dimmer.
 * Reads window.__wxState = { kind, tod, calm, drive }.
 */
(function () {
  'use strict';
  const SKY = {
    day: ['#3F86C9', '#7FB5E0', '#B9D6EC'], dawn: ['#5B6FA3', '#E8A48A', '#F6CFA6'], dusk: ['#3D5A8A', '#C9827A', '#F2B27A'], night: ['#060D22', '#13234A', '#26386A']
  };
  const HILL = { day: ['#8FB0C9', '#6E95AF'], dawn: ['#9A8AA6', '#7B6C8C'], dusk: ['#8E7C95', '#6D5E78'], night: ['#1C2A48', '#121D36'] };
  const seeded = (n) => { let s = n; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const mix = (a, b, t) => { const p = (c) => [1, 3, 5].map((i) => parseInt(c.substr(i, 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const state = {};
  function prep(cv) {
    const st = state[cv.id] || (state[cv.id] = {});
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(60, Math.round(r.width * dpr)), h = Math.max(30, Math.round(r.height * dpr));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; st.init = false; }
    if (!st.init) {
      const R = seeded(cv.id.length * 131 + 7), K = Math.max(0.18, w / 1280);
      st.K = K;
      st.far = Array.from({ length: 4 }, () => ({ x: R() * w, y: h * (0.08 + R() * 0.22), s: (0.4 + R() * 0.25) * K, v: 0.006 + R() * 0.004 }));
      st.near = Array.from({ length: 3 }, (_, i) => ({ x: (i + R() * 0.6) * w / 3, y: h * (0.3 + R() * 0.18), s: (0.85 + R() * 0.3) * K, v: 0.014 + R() * 0.008 }));
      st.drops = Array.from({ length: Math.round(w * h / 7000) + 14 }, () => ({ x: R() * w, y: R() * h, l: (6 + R() * 10) * dpr, v: (0.35 + R() * 0.35) * dpr }));
      st.stars = Array.from({ length: Math.round(w * h / 9000) + 18 }, () => ({ x: R() * w, y: R() * h * 0.6, r: (0.5 + R()) * dpr, p: R() * 6 }));
      st.init = true; st.dpr = dpr;
    }
    return st;
  }
  function cloud(g, x, y, s, a, tint, shadow) {
    g.save(); g.globalAlpha = a; g.fillStyle = tint;
    if (shadow) { g.shadowColor = 'rgba(30,50,80,0.25)'; g.shadowBlur = 30 * s; g.shadowOffsetY = 12 * s; }
    g.beginPath();
    [[0, 0, 46], [48, -22, 58], [108, -6, 50], [150, 10, 36], [70, 12, 48]].forEach(([dx, dy, r]) => { g.moveTo(x + dx * s + r * s, y + dy * s); g.arc(x + dx * s, y + dy * s, r * s, 0, 6.2832); });
    g.fill(); g.restore();
  }
  function hill(g, w, h, y, amp, col, seed) {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w; x += 6) g.lineTo(x, y + Math.sin(x / (w / 7.5) + seed) * amp + Math.sin(x / (w / 21) + seed * 2) * amp * 0.35);
    g.lineTo(w, h); g.fill();
  }
  function draw(cv, ws, dt, t) {
    if (!cv || !cv.isConnected) return;
    const g = cv.getContext('2d'), st = prep(cv), w = cv.width, h = cv.height, K = st.K;
    const tod = ws.tod || 'day', kind = ws.kind || 'clear';
    const wet = kind === 'rain' || kind === 'storm', grey = wet || kind === 'cloudy' || kind === 'fog';
    let c = SKY[tod] || SKY.day;
    if (grey) { const m = wet ? '#56687A' : kind === 'fog' ? '#AAB5BC' : '#8A9AA8'; const f = wet ? 0.6 : 0.4; c = c.map((x) => mix(x, m, f)); }
    const G = g.createLinearGradient(0, 0, 0, h); G.addColorStop(0, c[0]); G.addColorStop(0.6, c[1]); G.addColorStop(1, c[2]);
    g.fillStyle = G; g.fillRect(0, 0, w, h);
    // sun / moon / stars
    if (tod === 'night' && !wet) {
      for (const s of st.stars) { g.globalAlpha = 0.35 + 0.5 * Math.abs(Math.sin(t * 0.0005 + s.p)); g.fillStyle = '#fff'; g.fillRect(s.x, s.y, s.r, s.r); }
      g.globalAlpha = 1; g.fillStyle = '#F3EFDC'; g.beginPath(); g.arc(w * 0.18, h * 0.2, 28 * K + 6, 0, 6.2832); g.fill();
      g.fillStyle = c[0]; g.beginPath(); g.arc(w * 0.18 + 12 * K + 2, h * 0.2 - 6 * K, 26 * K + 5, 0, 6.2832); g.fill();
    } else if (!wet && kind !== 'fog') {
      const sx = tod === 'dusk' ? w * 0.82 : tod === 'dawn' ? w * 0.18 : w * 0.8, sy = tod === 'day' ? h * 0.16 : h * 0.62;
      const sg = g.createRadialGradient(sx, sy, 0, sx, sy, Math.max(w, h) * 0.28); sg.addColorStop(0, 'rgba(255,246,210,0.9)'); sg.addColorStop(0.25, 'rgba(255,226,150,0.35)'); sg.addColorStop(1, 'rgba(255,226,150,0)');
      g.fillStyle = sg; g.fillRect(0, 0, w, h);
    }
    const cl = tod === 'night' ? '#55648A' : grey ? '#E4E9EE' : '#FFFFFF';
    const move = (arr) => { for (const o of arr) { o.x += o.v * dt * st.dpr * (w / 1280 + 0.3); if (o.x - 200 * o.s > w) o.x = -180 * o.s; } };
    if (dt) { move(st.far); move(st.near); }
    for (const o of st.far) cloud(g, o.x, o.y, o.s, tod === 'night' ? 0.35 : 0.55, cl, false);
    hill(g, w, h, h * 0.72, 26 * K * 2, HILL[tod][0], 1);
    for (const o of st.near) cloud(g, o.x, o.y, o.s, tod === 'night' ? 0.5 : 0.93, cl, true);
    hill(g, w, h, h * 0.84, 20 * K * 2, HILL[tod][1], 3);
    if (kind === 'fog') { const fg = g.createLinearGradient(0, h * 0.4, 0, h); fg.addColorStop(0, 'rgba(225,230,234,0)'); fg.addColorStop(1, 'rgba(225,230,234,0.7)'); g.fillStyle = fg; g.fillRect(0, 0, w, h); }
    if (wet) {
      g.strokeStyle = 'rgba(200,225,245,0.55)'; g.lineWidth = 1.4 * st.dpr; g.beginPath();
      for (const d of st.drops) { if (dt) { d.y += d.v * dt; d.x -= d.v * dt * 0.15; if (d.y > h) { d.y = -d.l; d.x = Math.random() * w * 1.1; } } g.moveTo(d.x, d.y); g.lineTo(d.x - d.l * 0.15, d.y + d.l); }
      g.stroke();
      if (kind === 'storm' && dt && Math.random() < 0.002) { g.fillStyle = 'rgba(235,240,255,0.35)'; g.fillRect(0, 0, w, h); }
    }
    if (ws.calm) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 0, w, h); }
  }
  let last = 0, lastSig = '';
  function loop(ts) {
    requestAnimationFrame(loop);
    const ws = window.__wxState; if (!ws) return;
    const frozen = !!ws.drive;
    const sig = JSON.stringify(ws) + (window.__idleOn ? 1 : 0);
    if (frozen && sig === lastSig) return;            // driving: draw once, then stand still
    const gap = ts - last; if (!frozen && gap < 33) return;  // ~30 fps when parked
    lastSig = sig; last = ts;
    const dt = frozen ? 0 : Math.min(80, gap) * (ws.calm ? 0.5 : 1);
    draw(document.getElementById('wxmini'), ws, dt, ts);
    if (window.__idleOn) draw(document.getElementById('idlesky'), ws, dt, ts);
  }
  requestAnimationFrame(loop);
})();
