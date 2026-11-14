(function() {
  "use strict";
  const SKY = {
    day: ["#2f7fd6", "#7fbff0", "#e9d7a8"],
    dawn: ["#e98a6b", "#f6c79e", "#fde8cf"],
    dusk: ["#c9644a", "#ef9f6f", "#f7d3a5"],
    night: ["#050b1d", "#0f1f44", "#23345f"],
    cloudy: ["#5c7488", "#8ea3b3", "#b9c6cf"],
    rain: ["#2c3e50", "#4d6378", "#6f8597"],
    storm: ["#1b2430", "#33404f", "#4b5868"],
    fog: ["#8e9aa3", "#b3bcc2", "#cfd5d8"]
  };
  const seeded = (n) => {
    let s = n;
    return () => (s = s * 16807 % 2147483647) / 2147483647;
  };
  const state = {};
  function prep(cv) {
    const st = state[cv.id] || (state[cv.id] = {});
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(50, Math.round(r.width * dpr)), h = Math.max(30, Math.round(r.height * dpr));
    if (cv.width !== w || cv.height !== h) {
      cv.width = w;
      cv.height = h;
      st.init = false;
    }
    if (!st.init) {
      const R = seeded(cv.id.length * 97 + 3);
      st.drops = Array.from({ length: Math.round(w * h / 9e3) + 12 }, () => ({ x: R() * w, y: R() * h, r: (1 + R() * 2.2) * dpr, v: (0.1 + R() * 0.5) * dpr, s: R() < 0.35 }));
      st.stars = Array.from({ length: Math.round(w * h / 8e3) + 20 }, () => ({ x: R() * w, y: R() * h * 0.75, r: R() * 1.4 * dpr, p: R() * 6 }));
      st.clouds = Array.from({ length: 8 }, (_, i) => ({ x: R() * w, y: h * (0.08 + R() * 0.5), s: (0.6 + R()) * w * 0.17, v: (0.06 + i * 0.025) * dpr, a: 0.22 + R() * 0.3 }));
      st.init = true;
      st.dpr = dpr;
    }
    return st;
  }
  function draw(cv, ws, t) {
    if (!cv || !cv.isConnected) return;
    const x = cv.getContext("2d"), st = prep(cv), w = cv.width, h = cv.height, k = ws.kind, tod = ws.tod, calm = ws.calm ? 0.08 : 1;
    const key = k === "rain" || k === "storm" || k === "fog" ? k : k === "cloudy" && tod === "day" ? "cloudy" : k === "night" ? "night" : tod;
    const c = SKY[key] || SKY.day;
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, c[0]);
    g.addColorStop(0.6, c[1]);
    g.addColorStop(1, c[2]);
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    if ((key === "night" || tod === "night") && k !== "rain" && k !== "storm") {
      st.stars.forEach((s) => {
        x.fillStyle = "rgba(255,255,255," + (0.35 + 0.6 * Math.abs(Math.sin(t * 8e-4 + s.p))).toFixed(2) + ")";
        x.beginPath();
        x.arc(s.x, s.y, s.r, 0, 7);
        x.fill();
      });
      if (!st.shoot && Math.random() < 2e-3 * calm) st.shoot = { x: Math.random() * w * 0.6, y: Math.random() * h * 0.3, l: 0 };
      if (st.shoot) {
        const L = st.shoot.l += 0.02;
        x.strokeStyle = "rgba(255,255,255," + (1 - L) + ")";
        x.lineWidth = 2 * st.dpr;
        x.beginPath();
        x.moveTo(st.shoot.x + L * w * 0.3, st.shoot.y + L * h * 0.15);
        x.lineTo(st.shoot.x + L * w * 0.3 - w * 0.05, st.shoot.y + L * h * 0.15 - h * 0.025);
        x.stroke();
        if (L > 1) st.shoot = null;
      }
    }
    if (k === "clear" && tod !== "night") {
      const sx = w * 0.82, sy = h * 0.18;
      for (let i = 0; i < 12; i++) {
        const a = t * 5e-5 * calm + i * Math.PI / 6;
        x.strokeStyle = "rgba(255,240,190,0.16)";
        x.lineWidth = w * 0.012;
        x.beginPath();
        x.moveTo(sx, sy);
        x.lineTo(sx + Math.cos(a) * w * 0.25, sy + Math.sin(a) * w * 0.25);
        x.stroke();
      }
      const sg = x.createRadialGradient(sx, sy, 0, sx, sy, w * 0.12);
      sg.addColorStop(0, "rgba(255,248,215,0.95)");
      sg.addColorStop(0.3, "rgba(255,230,150,0.45)");
      sg.addColorStop(1, "rgba(255,230,150,0)");
      x.fillStyle = sg;
      x.fillRect(0, 0, w, h);
      const lg = x.createLinearGradient(w, 0, 0, h);
      lg.addColorStop(0, "rgba(255,245,210,0.14)");
      lg.addColorStop(0.5, "rgba(255,245,210,0)");
      x.fillStyle = lg;
      x.fillRect(0, 0, w, h);
    }
    const col = k === "storm" || k === "rain" ? "70,85,100" : key === "night" ? "60,75,110" : "255,255,255";
    const n = k === "clear" ? 3 : k === "night" ? 2 : 8;
    st.clouds.slice(0, n).forEach((cl) => {
      cl.x += cl.v * calm;
      if (cl.x - cl.s > w) cl.x = -cl.s;
      for (let i = 0; i < 5; i++) {
        const cx = cl.x + (i - 2) * cl.s * 0.35, cy = cl.y + Math.sin(i * 1.7) * cl.s * 0.08, r = cl.s * (0.35 + 0.12 * Math.sin(i * 2.3));
        const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r);
        gr.addColorStop(0, "rgba(" + col + "," + cl.a + ")");
        gr.addColorStop(1, "rgba(" + col + ",0)");
        x.fillStyle = gr;
        x.beginPath();
        x.arc(cx, cy, r, 0, 7);
        x.fill();
      }
    });
    if (k === "fog") for (let i = 0; i < 5; i++) {
      const y = h * (0.3 + i * 0.14), o = t * 0.02 * calm * (i % 2 ? 1 : -1) * st.dpr % w;
      const fg = x.createLinearGradient(0, y - h * 0.07, 0, y + h * 0.07);
      fg.addColorStop(0, "rgba(255,255,255,0)");
      fg.addColorStop(0.5, "rgba(255,255,255,0.28)");
      fg.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = fg;
      x.fillRect(o - w, y - h * 0.07, w * 3, h * 0.14);
    }
    if (k === "rain" || k === "storm") st.drops.forEach((d) => {
      if (d.s) {
        d.y += d.v * 3 * calm;
        if (d.y > h) {
          d.y = -10;
          d.x = Math.random() * w;
        }
      }
      x.fillStyle = "rgba(220,235,250,0.35)";
      x.beginPath();
      x.arc(d.x, d.y, d.r, 0, 7);
      x.fill();
      if (d.s) {
        x.strokeStyle = "rgba(220,235,250,0.15)";
        x.lineWidth = d.r * 0.8;
        x.beginPath();
        x.moveTo(d.x, d.y);
        x.lineTo(d.x, d.y - d.r * 8);
        x.stroke();
      }
    });
    if (k === "storm") {
      if (Math.random() < 5e-3 * calm) st.flash = 1;
      if (st.flash > 0) {
        x.fillStyle = "rgba(230,240,255," + st.flash * 0.35 + ")";
        x.fillRect(0, 0, w, h);
        st.flash -= 0.04;
      }
    }
    x.fillStyle = "rgba(0,0,0,0.08)";
    x.fillRect(0, 0, w, h);
  }
  let last = 0;
  function loop(t) {
    requestAnimationFrame(loop);
    const ws = window.__wxState;
    if (!ws) return;
    const fps = ws.calm ? 3 : 24;
    if (t - last < 1e3 / fps) return;
    last = t;
    draw(document.getElementById("wxmini"), ws, t);
    if (window.__idleOn) draw(document.getElementById("idlesky"), Object.assign({}, ws, { calm: false }), t);
  }
  requestAnimationFrame(loop);
})();
