(function() {
  "use strict";
  const cv = document.getElementById("lp");
  if (!cv) return;
  let g = cv.getContext("2d");
  let W = 1280, H = 720, DPR = 1;
  const S = { theme: "lp_au", style: "poly", cockpit: "lowpoly", gauge: "classic", speed: 0, limit: 0, est: false, drive: false, moveMode: "still", wx: "clear", tod: "day", dim: 0, blur: 0, on: false, unit: "km/h", night: false, holiday: "" };
  let off = 0, t0 = 0, last = 0, dirty = true, fade = 1, prevImg = null;
  const rnd = (seed) => {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = s * 16807 % 2147483647) / 2147483647;
  };
  const mix = (a, b, k) => {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = (pa >> 16) + ((pb >> 16) - (pa >> 16)) * k, gg = (pa >> 8 & 255) + ((pb >> 8 & 255) - (pa >> 8 & 255)) * k, bb = (pa & 255) + ((pb & 255) - (pa & 255)) * k;
    return "#" + (1 << 24 | Math.round(r) << 16 | Math.round(gg) << 8 | Math.round(bb)).toString(16).slice(1);
  };
  const shade = (c, k) => k >= 0 ? mix(c, "#ffffff", k) : mix(c, "#000000", -k);
  const poly = (pts, c) => {
    g.fillStyle = c;
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath();
    g.fill();
  };
  const rect = (x, y, w, h, c) => {
    g.fillStyle = c;
    g.fillRect(x, y, w, h);
  };
  const circ = (x, y, r, c) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(x, y, r, 0, 6.2832);
    g.fill();
  };
  const TOD = {
    dawn: { sky: ["#f6b38a", "#fde3c4"], haze: "rgba(253,220,190,0.6)", light: 0.85, sun: [0.18, 0.4] },
    day: { sky: ["#8fc6ec", "#e3eff5"], haze: "rgba(236,243,247,0.7)", light: 1, sun: [0.8, 0.16] },
    dusk: { sky: ["#e98a5f", "#f6d3a5"], haze: "rgba(246,205,170,0.55)", light: 0.8, sun: [0.85, 0.4] },
    night: { sky: ["#07112a", "#1d2f58"], haze: "rgba(30,45,85,0.45)", light: 0.42, sun: [0.78, 0.14] }
  };
  const SC = {
    lp_au: { n: "\u0110\u01B0\u1EDDng \xDAc", m: ["#8fa3b5", "#a9b9c6", "#7e93a6"], gr: ["#9fc77a", "#8dba69"], rd: "#8e9399", side: "gum", extra: [], mh: 0.1 },
    lp_farm: { n: "\u0110\u1ED3ng Qu\xEA Wimmera", m: ["#9fae9f", "#b5c1b2", "#8c9d8d"], gr: ["#c9c27a", "#b9b067"], rd: "#8e9399", side: "gumSparse", extra: ["fence"], mh: 0.05 },
    lp_coast: { n: "Ven Bi\u1EC3n", m: ["#9bb0bf", "#b3c4cf", "#8aa1b2"], gr: ["#8fbf73", "#7fb064"], rd: "#8a8f95", side: "shrub", extra: ["sea"], mh: 0.12 },
    lp_outback: { n: "Outback", m: ["#c0623a", "#d07a4c", "#a9532f"], gr: ["#c9733f", "#b8662f"], rd: "#9a5a3c", side: "spinifex", extra: ["rock"], mh: 0.06 },
    lp_melb: { n: "Melbourne", m: ["#9fb0bd", "#b7c4cd", "#8d9faf"], gr: ["#8aa58a", "#7d987d"], rd: "#5f6670", side: "city", extra: ["tram"], mh: 0 },
    lp_dande: { n: "R\u1EEBng Dandenong", m: ["#5f7d68", "#6f8f78", "#4e6b57"], gr: ["#5d8a4e", "#4f7a42"], rd: "#7d8288", side: "forest", extra: ["fern"], mh: 0.16 },
    lp_yarra: { n: "V\xF9ng Nho Yarra", m: ["#8ea38a", "#a3b69e", "#7d927a"], gr: ["#94b86a", "#86aa5c"], rd: "#8a8f95", side: "vine", extra: ["barn"], mh: 0.09 },
    lp_snow: { n: "N\xFAi Tuy\u1EBFt", m: ["#e8eef3", "#cfdae3", "#b7c6d3"], gr: ["#dfe7ee", "#d2dce6"], rd: "#7a8088", side: "pine", extra: ["snowcap"], mh: 0.2 },
    lp_autumn: { n: "M\xF9a Thu L\xE1 V\xE0ng", m: ["#a99a8a", "#bcad9c", "#968877"], gr: ["#b8a45f", "#a99550"], rd: "#857f78", side: "autumn", extra: ["leaves"], mh: 0.09 },
    lp_wheat: { n: "\u0110\u1ED3ng L\xFAa M\xEC", m: ["#b9b39a", "#cbc5ab", "#a8a38b"], gr: ["#e2c46a", "#d4b458"], rd: "#8e9399", side: "wheat", extra: ["silo"], mh: 0.03 },
    lp_saigon: { n: "S\xE0i G\xF2n", m: ["#a7b3bd", "#bcc6ce", "#97a4ae"], gr: ["#9aa48f", "#8d9783"], rd: "#6c6f73", side: "shophouse", extra: ["moto", "tamarind"], mh: 0 },
    lp_mekong: { n: "Mi\u1EC1n T\xE2y", m: ["#8fb39a", "#a3c3ac", "#7ea38a"], gr: ["#7fb36a", "#70a45c"], rd: "#9b8a6a", side: "coconut", extra: ["river"], mh: 0 },
    // the older themes, drawn by the engine
    neon: { n: "Neon", m: ["#0b2a3a", "#0e3448", "#08202d"], gr: ["#03111c", "#041722"], rd: "#06131c", side: "neonpost", extra: ["grid"], mh: 0.08, forceNight: true },
    glass: { n: "K\xEDnh M\u1EDD", m: ["#a9bfd0", "#c3d4e0", "#97b0c3"], gr: ["#b9cfdc", "#aec6d4"], rd: "#9aa9b4", side: "gumSparse", extra: ["frost"], mh: 0.08 },
    hud: { n: "T\u1ED1i Gi\u1EA3n (HUD)", m: ["#1b232a", "#222c34", "#151c22"], gr: ["#0d1216", "#10161b"], rd: "#191f24", side: "none", extra: [], mh: 0.05, forceNight: true },
    plane: { n: "Bu\u1ED3ng L\xE1i M\xE1y Bay", m: ["#5f7f6a", "#6f8f78", "#4f6f5a"], gr: ["#6f8f5a", "#638450"], rd: "#596066", side: "runway", extra: ["clouds"], mh: 0.04 },
    synth: { n: "Synthwave 80s", m: ["#7b2a8f", "#9a3aa8", "#5d1d70"], gr: ["#1a0730", "#200a3a"], rd: "#120420", side: "palm", extra: ["grid", "synthsun"], mh: 0.12, forceNight: true },
    cyber: { n: "Th\xE0nh Ph\u1ED1 \u0110\xEAm", m: ["#1a2440", "#222e50", "#141c34"], gr: ["#0a0f1f", "#0d1326"], rd: "#0d1220", side: "neoncity", extra: [], mh: 0, forceNight: true },
    rally: { n: "Th\u1EC3 Thao (Rally)", m: ["#6b7d5c", "#7b8d6b", "#5a6b4c"], gr: ["#8b7a55", "#7d6c48"], rd: "#a08560", side: "forest", extra: ["dust"], mh: 0.12 },
    relax: { n: "Th\u01B0 Gi\xE3n", m: ["#9cb3c4", "#b4c7d4", "#8aa4b8"], gr: ["#9cc39a", "#8fb68d"], rd: "#9097a0", side: "gumSparse", extra: ["lake"], mh: 0.08 },
    outback: "lp_outback",
    coast: "lp_coast",
    melb: "lp_melb",
    dandenong: "lp_dande",
    yarra: "lp_yarra",
    snow: "lp_snow",
    mekong: "lp_mekong",
    neonau: { n: "Neon \xDAc", m: ["#3b1b0e", "#4a2412", "#2a1209"], gr: ["#140805", "#1a0a06"], rd: "#0d0604", side: "neonpost", extra: ["grid"], mh: 0.06, forceNight: true },
    sgcenter: { n: "S\xE0i G\xF2n Trung T\xE2m", base: "lp_saigon", extra: ["church"] },
    sgnight: { n: "S\xE0i G\xF2n V\u1EC1 \u0110\xEAm", base: "lp_saigon", forceNight: true, extra: ["moto", "lanternsOff"] },
    rain: { n: "M\u01B0a Chi\u1EC1u", base: "lp_saigon", wx: "rain" },
    benthanh: { n: "Ch\u1EE3 B\u1EBFn Th\xE0nh", base: "lp_saigon", extra: ["market", "moto"] },
    sgold: { n: "S\xE0i G\xF2n X\u01B0a", base: "lp_saigon", sepia: true, extra: ["tamarind"] },
    coffee: { n: "C\xE0 Ph\xEA S\xE1ng", base: "lp_saigon", forceTod: "dawn", extra: ["coffee", "tamarind"] },
    tet: { n: "T\u1EBFt Mi\u1EC1n Nam", base: "lp_saigon", extra: ["mai", "lanterns", "moto"] }
  };
  const scene = (k) => {
    let s = SC[k] || SC.lp_au;
    if (typeof s === "string") s = SC[s];
    if (s.base) {
      const b = SC[s.base];
      return Object.assign({}, b, s, { extra: (b.extra || []).concat(s.extra || []) });
    }
    return s;
  };
  const CP = {
    lowpoly: { dash: "#d9d4cb", dashN: "#1a1f26", top: 0.24, wheel: "arc", pillar: "#cfc9be", trim: "#bdb6aa" },
    hiace: { dash: "#4a4f55", dashN: "#1c1f23", top: 0.27, wheel: "four", pillar: "#55595e", trim: "#3a3e43", vents: true, high: true },
    lux: { dash: "#5b3b26", dashN: "#2a1b12", top: 0.25, wheel: "three", pillar: "#c9b79e", trim: "#d8c39a", wood: true },
    sport: { dash: "#1d1f22", dashN: "#0f1012", top: 0.23, wheel: "flat", pillar: "#2a2c30", trim: "#c8282e", carbon: true },
    ev: { dash: "#e9ecef", dashN: "#15181c", top: 0.17, wheel: "yoke", pillar: "#d5dade", trim: "#9fb6c4", screen: true },
    retro70: { dash: "#6b4b2e", dashN: "#2c1f13", top: 0.28, wheel: "thin", pillar: "#d8cbb3", trim: "#cfcfcf", wood: true, chrome: true },
    offroad: { dash: "#3c3a33", dashN: "#191814", top: 0.29, wheel: "four", pillar: "#4a473e", trim: "#d9a441", grab: true, high: true },
    truck: { dash: "#3e454c", dashN: "#191d21", top: 0.22, wheel: "big", pillar: "#4a5158", trim: "#9aa4ad", high: true, bigMirrors: true },
    none: { dash: null, top: 0, wheel: "none", hud: true },
    pixel: { dash: "#4d4d6b", dashN: "#24243a", top: 0.25, wheel: "arc", pillar: "#5d5d80", trim: "#f2c94c", pixel: true },
    real: { dash: "#2b2e33", dashN: "#141619", top: 0.26, wheel: "four", pillar: "#3a3d42", trim: "#6b7076", vents: true },
    neon: { dash: "#06121b", dashN: "#040c12", top: 0.24, wheel: "arc", pillar: "#071722", trim: "#3fe0ff", neon: true }
  };
  const HZ = () => H * (CP[S.cockpit] && CP[S.cockpit].high ? 0.43 : 0.46);
  const VX = () => W * 0.5;
  const proj = (x, z) => {
    const p = 1 / (z * 9 + 0.12);
    return { x: VX() + x * W * 0.085 * p, y: HZ() + H * 0.05 * p, p };
  };
  function tree(kind, x, y, s, pal, r, facets) {
    const k = s * H * 0.11;
    if (kind === "none") return;
    const trunk = (h, c) => {
      g.strokeStyle = c || "#7a6450";
      g.lineWidth = Math.max(1, k * 0.06);
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + k * 0.04, y - k * h);
      g.stroke();
    };
    const blob = (cx, cy, rr, cols) => {
      if (!facets) {
        circ(cx, cy, rr, cols[0]);
        circ(cx - rr * 0.35, cy - rr * 0.2, rr * 0.7, cols[1]);
        return;
      }
      const n = 6, pts = [];
      for (let i = 0; i < n; i++) {
        const a = i / n * 6.2832 + r;
        pts.push([cx + Math.cos(a) * rr * (0.85 + 0.25 * ((i * 7 + r * 10) % 3) / 3), cy + Math.sin(a) * rr * 0.85]);
      }
      for (let i = 0; i < n; i++) poly([[cx, cy], pts[i], pts[(i + 1) % n]], cols[(i + Math.floor(r * 4)) % cols.length]);
    };
    const leaf = pal.leaf;
    switch (kind) {
      case "gum":
      case "gumSparse":
      case "forest":
        trunk(0.8, "#8a7560");
        blob(x, y - k * 1, k * 0.55, leaf);
        blob(x + k * 0.25, y - k * 1.35, k * 0.35, leaf);
        break;
      case "autumn":
        trunk(0.75);
        blob(x, y - k, k * 0.55, ["#d98c2b", "#e8a93a", "#c4721f", "#f0c050"]);
        break;
      case "pine":
        poly([[x, y - k * 1.6], [x - k * 0.45, y - k * 0.2], [x + k * 0.45, y - k * 0.2]], facets ? "#2f5a46" : "#356650");
        if (facets) poly([[x, y - k * 1.6], [x, y - k * 0.2], [x + k * 0.45, y - k * 0.2]], "#3c6d55");
        poly([[x, y - k * 1.65], [x - k * 0.18, y - k * 1.15], [x + k * 0.18, y - k * 1.15]], "#f3f6f8");
        rect(x - k * 0.05, y - k * 0.2, k * 0.1, k * 0.2, "#6b5240");
        break;
      case "palm":
      case "coconut": {
        g.strokeStyle = kind === "palm" ? "#2a0f3a" : "#8a7356";
        g.lineWidth = Math.max(1, k * 0.07);
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + k * 0.3, y - k * 0.8, x + k * 0.15, y - k * 1.6);
        g.stroke();
        const cx = x + k * 0.15, cy = y - k * 1.6, fc = kind === "palm" ? "#ff4fd8" : "#4f9a44";
        for (let i = 0; i < 6; i++) {
          const a = -2.6 + i * 0.95;
          poly([[cx, cy], [cx + Math.cos(a) * k * 0.75, cy + Math.sin(a) * k * 0.5 + k * 0.15], [cx + Math.cos(a + 0.25) * k * 0.6, cy + Math.sin(a + 0.25) * k * 0.4 + k * 0.1]], fc);
        }
        break;
      }
      case "tamarind":
        trunk(0.9, "#6d5643");
        blob(x, y - k * 1.15, k * 0.7, ["#5c8f3c", "#6aa047", "#4f7f33", "#78ad52"]);
        break;
      case "shrub":
      case "spinifex":
        blob(x, y - k * 0.18, k * 0.28, kind === "spinifex" ? ["#b9a35a", "#a99350", "#c9b46a"] : leaf);
        break;
      case "vine":
        for (let i = 0; i < 3; i++) blob(x + (i - 1) * k * 0.3, y - k * 0.22, k * 0.18, ["#5f8f3a", "#6e9e45", "#527f31"]);
        rect(x - k * 0.45, y - k * 0.05, k * 0.9, k * 0.03, "#7a6450");
        break;
      case "wheat":
        for (let i = 0; i < 4; i++) poly([[x + (i - 2) * k * 0.15, y], [x + (i - 2) * k * 0.15 + k * 0.05, y - k * 0.35], [x + (i - 2) * k * 0.15 + k * 0.1, y]], i % 2 ? "#e9cd73" : "#d8b95c");
        break;
      case "city":
      case "neoncity":
      case "shophouse": {
        const hh = k * (kind === "shophouse" ? 1.3 : 2.2 + r * 1.6), ww = k * (kind === "shophouse" ? 0.75 : 0.9);
        const base = kind === "neoncity" ? "#121a33" : kind === "shophouse" ? ["#e9d8a6", "#f1c7a2", "#c9dfe0", "#f2e6c9"][Math.floor(r * 4)] : ["#b8c2cc", "#a7b3bf", "#c9d1d8"][Math.floor(r * 3)];
        const side = x < VX() ? 1 : -1;
        poly([[x - ww / 2, y], [x + ww / 2, y], [x + ww / 2, y - hh], [x - ww / 2, y - hh]], base);
        if (facets) poly([[x + side * ww / 2, y], [x + side * ww * 0.75, y - k * 0.1], [x + side * ww * 0.75, y - hh - k * 0.1], [x + side * ww / 2, y - hh]], shade(base, -0.18));
        const wc = kind === "neoncity" ? r > 0.5 ? "#ff4fd8" : "#3fe0ff" : S.night ? "#ffd98a" : "#5b6f80";
        for (let yy = y - hh + k * 0.2; yy < y - k * 0.3; yy += k * 0.32) for (let xx = x - ww / 2 + k * 0.12; xx < x + ww / 2 - k * 0.12; xx += k * 0.24) if ((xx * 7 + yy * 3) % 5 > 1.2) rect(xx, yy, k * 0.12, k * 0.16, wc);
        if (kind === "shophouse") {
          rect(x - ww / 2, y - hh * 0.42, ww, k * 0.06, "#8a5a3a");
          rect(x - ww * 0.3, y - k * 0.45, ww * 0.6, k * 0.45, "#5a4636");
        }
        break;
      }
      case "neonpost":
        g.strokeStyle = r > 0.5 ? "#3fe0ff" : "#ff8a3d";
        g.lineWidth = Math.max(1, k * 0.05);
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x, y - k * 0.8);
        g.stroke();
        break;
      case "runway":
        rect(x - k * 0.05, y - k * 0.12, k * 0.1, k * 0.12, "#f2f2f2");
        circ(x, y - k * 0.15, k * 0.05, "#ffd34d");
        break;
    }
  }
  function signs(T, scn) {
    if (scn.side === "city" || scn.side === "shophouse" || scn.side === "neoncity") return;
    const sg = proj(-3.3, 0.6), h = H * 0.05;
    rect(sg.x - 1, sg.y - h * 0.6, 2, h * 0.6, "#777");
    rect(sg.x - h * 0.36, sg.y - h * 1.5, h * 0.72, h * 0.9, "#fff");
    g.strokeStyle = "#d22";
    g.lineWidth = h * 0.08;
    g.beginPath();
    g.arc(sg.x, sg.y - h * 1.05, h * 0.27, 0, 6.2832);
    g.stroke();
    g.fillStyle = "#111";
    g.font = "700 " + h * 0.22 + 'px "Overpass",sans-serif';
    g.textAlign = "center";
    g.fillText(S.limit ? String(S.limit) : "100", sg.x, sg.y - h * 0.97);
    for (let i = 0; i < 6; i++) {
      const z = (i / 6 + off) % 1;
      const a = proj(-2.85, 1 - z), b = proj(2.85, 1 - z);
      const hh = H * 0.012 * a.p * 2.2;
      rect(a.x - 1, a.y - hh, 2, hh, "#f2f2f2");
      rect(a.x - 1, a.y - hh, 2, hh * 0.25, "#e33");
      rect(b.x - 1, b.y - hh, 2, hh, "#f2f2f2");
      rect(b.x - 1, b.y - hh, 2, hh * 0.25, "#fff");
    }
  }
  function moonDraw(g2, x, y, r, now) {
    const syn = 29.530588853, ref = Date.UTC(2e3, 0, 6, 18, 14);
    const p = ((now - ref) / 864e5 % syn + syn) % syn / syn;
    const gl = g2.createRadialGradient(x, y, r * 0.6, x, y, r * 2.8);
    gl.addColorStop(0, "rgba(243,239,220,0.22)");
    gl.addColorStop(1, "rgba(243,239,220,0)");
    g2.fillStyle = gl;
    g2.beginPath();
    g2.arc(x, y, r * 2.8, 0, 6.2832);
    g2.fill();
    g2.fillStyle = "rgba(200,210,235,0.10)";
    g2.beginPath();
    g2.arc(x, y, r, 0, 6.2832);
    g2.fill();
    if (p < 0.025 || p > 0.975) return;
    const litRight = !(p < 0.5);
    const k = Math.cos(2 * Math.PI * p);
    g2.fillStyle = "#f3efdc";
    g2.beginPath();
    g2.arc(x, y, r, -Math.PI / 2, Math.PI / 2, !litRight);
    g2.ellipse(x, y, Math.max(0.01, r * Math.abs(k)), r, 0, Math.PI / 2, -Math.PI / 2, k > 0 === litRight);
    g2.closePath();
    g2.fill();
  }
  window.tcMoonDraw = moonDraw;
  let stars = null;
  function sky(T, scn, t) {
    const hz = HZ();
    const sk = g.createLinearGradient(0, 0, 0, hz);
    let c0 = T.sky[0], c1 = T.sky[1];
    if (scn.extra.indexOf("synthsun") >= 0) {
      c0 = "#1b0a3a";
      c1 = "#ff6fb1";
    }
    const NT = S.tod === "night";
    if (S.wx === "rain" || S.wx === "storm") {
      c0 = mix(c0, NT ? "#0b111b" : "#4d5d6d", 0.6);
      c1 = mix(c1, NT ? "#1b2533" : "#7f8f9d", 0.6);
    }
    if (S.wx === "cloud") {
      c0 = mix(c0, NT ? "#0d1524" : "#8a9aa8", 0.45);
      c1 = mix(c1, NT ? "#1f2b40" : "#c3ccd3", 0.45);
    }
    if (S.wx === "fog") {
      c0 = mix(c0, NT ? "#1a2230" : "#b8c1c7", 0.7);
      c1 = mix(c1, NT ? "#2a3445" : "#d6dbde", 0.7);
    }
    sk.addColorStop(0, c0);
    sk.addColorStop(1, c1);
    g.fillStyle = sk;
    g.fillRect(0, 0, W, hz + 2);
    if (S.tod === "night" && S.wx !== "rain" && S.wx !== "storm") {
      if (!stars) {
        const r2 = rnd(7);
        stars = [];
        for (let i = 0; i < 80; i++) stars.push([r2() * 1280, r2() * 300, r2() * 1.3 + 0.4, r2() * 6]);
      }
      for (const st of stars) {
        g.fillStyle = "rgba(255,255,255," + (0.35 + 0.55 * Math.abs(Math.sin(t * 6e-4 + st[3]))).toFixed(2) + ")";
        g.fillRect(st[0] / 1280 * W, st[1] / 720 * H, st[2] * DPR, st[2] * DPR);
      }
      moonDraw(g, W * 0.6, H * 0.27, H * 0.018, Date.now());
    } else if (S.wx === "clear" || S.tod === "dawn" || S.tod === "dusk") {
      const sx = W * T.sun[0], sy = H * T.sun[1];
      const sg = g.createRadialGradient(sx, sy, 0, sx, sy, W * 0.11);
      sg.addColorStop(0, "rgba(255,248,215,0.95)");
      sg.addColorStop(0.3, "rgba(255,230,150,0.45)");
      sg.addColorStop(1, "rgba(255,230,150,0)");
      g.fillStyle = sg;
      g.fillRect(0, 0, W, hz);
      if (scn.extra.indexOf("synthsun") >= 0) {
        for (let i = 0; i < 7; i++) rect(W * 0.42, hz - H * 0.2 + i * H * 0.03, W * 0.16, H * 0.012, ["#ffd34d", "#ffb347", "#ff8a5c", "#ff6f91", "#e05ab1", "#b04fd1", "#7a4fe0"][i]);
      }
    }
    const nc = S.wx === "clear" ? 3 : S.wx === "cloud" ? 7 : S.wx === "rain" || S.wx === "storm" ? 9 : 4;
    const cc = S.tod === "night" ? "rgba(70,85,120,0.35)" : S.wx === "rain" || S.wx === "storm" ? "rgba(80,95,110,0.55)" : "rgba(255,255,255,0.6)";
    for (let i = 0; i < nc; i++) {
      const cx = ((i * 0.29 + t * 4e-6 * (1 + i % 3)) % 1.25 - 0.12) * W, cy = H * (0.07 + i % 4 * 0.045), r2 = H * (0.035 + i % 3 * 0.012);
      g.fillStyle = cc;
      [[0, 0, 1], [r2 * 0.9, r2 * 0.1, 0.8], [-r2 * 0.9, r2 * 0.15, 0.75], [r2 * 0.3, -r2 * 0.4, 0.7]].forEach((q) => {
        g.beginPath();
        g.arc(cx + q[0], cy + q[1], r2 * q[2], 0, 6.2832);
        g.fill();
      });
    }
    const r = rnd(scn.n.length * 31 + 5), pts = [[0, hz]];
    let x = 0;
    while (x < 1) {
      pts.push([x, hz - H * (0.025 + r() * scn.mh * 1.3)]);
      x += 0.06 + r() * 0.08;
    }
    pts.push([1, hz - H * 0.03], [1, hz]);
    for (let i = 0; i < pts.length - 2; i++) {
      const c = S.style === "poly" ? scn.m[i % 3] : scn.m[0];
      poly([[pts[i][0] * W, pts[i][1]], [pts[i + 1][0] * W, pts[i + 1][1]], [pts[i + 1][0] * W, hz], [pts[i][0] * W, hz]], tint(c, T));
      if (scn.extra.indexOf("snowcap") >= 0 && pts[i + 1][1] < hz - H * 0.09) poly([[pts[i + 1][0] * W, pts[i + 1][1]], [pts[i + 1][0] * W - W * 0.02, pts[i + 1][1] + H * 0.03], [pts[i + 1][0] * W + W * 0.02, pts[i + 1][1] + H * 0.03]], "#ffffff");
    }
    if (scn.extra.indexOf("sea") >= 0) {
      rect(0, hz - H * 0.01, W * 0.38, H * 0.04, tint("#3f8fbf", T));
      for (let i = 0; i < 6; i++) rect(W * (0.03 + i * 0.06), hz + H * 5e-3, W * 0.025, 2, "rgba(255,255,255,0.7)");
    }
    if (scn.extra.indexOf("lake") >= 0 || scn.extra.indexOf("river") >= 0) rect(W * 0.62, hz - H * 5e-3, W * 0.38, H * 0.03, tint("#5fa3c9", T));
    if (scn.extra.indexOf("silo") >= 0) {
      const sx = W * 0.72, sy = hz;
      rect(sx, sy - H * 0.08, W * 0.018, H * 0.08, tint("#c9c4b6", T));
      rect(sx + W * 0.02, sy - H * 0.07, W * 0.018, H * 0.07, tint("#bdb7a8", T));
    }
    if (scn.extra.indexOf("church") >= 0) {
      const sx = W * 0.3, sy = hz;
      rect(sx, sy - H * 0.06, W * 0.05, H * 0.06, tint("#c76b4f", T));
      poly([[sx + W * 5e-3, sy - H * 0.06], [sx + W * 0.012, sy - H * 0.11], [sx + W * 0.019, sy - H * 0.06]], tint("#7f8e9a", T));
      poly([[sx + W * 0.031, sy - H * 0.06], [sx + W * 0.038, sy - H * 0.11], [sx + W * 0.045, sy - H * 0.06]], tint("#7f8e9a", T));
    }
    if (scn.extra.indexOf("market") >= 0) {
      const sx = W * 0.6, sy = hz;
      rect(sx, sy - H * 0.05, W * 0.09, H * 0.05, tint("#e6d3a8", T));
      rect(sx + W * 0.04, sy - H * 0.085, W * 0.012, H * 0.035, tint("#d9c191", T));
      circ(sx + W * 0.046, sy - H * 0.07, H * 7e-3, "#fff");
    }
    if (scn.extra.indexOf("barn") >= 0) {
      const sx = W * 0.68, sy = hz;
      rect(sx, sy - H * 0.03, W * 0.035, H * 0.03, tint("#a23b2a", T));
      poly([[sx - W * 3e-3, sy - H * 0.03], [sx + W * 0.0175, sy - H * 0.05], [sx + W * 0.038, sy - H * 0.03]], tint("#5b2a20", T));
    }
    treeline(T, scn, hz);
    g.fillStyle = T.haze;
    g.fillRect(0, hz - H * 0.012, W, H * 0.016);
  }
  function treeline(T, scn, hz) {
    const k = scn.side;
    if (k === "none" || k === "wheat" || k === "spinifex" || k === "runway") return;
    const r = rnd(scn.n.length * 7 + 1), city = k === "city" || k === "neoncity" || k === "shophouse";
    const cols = city ? k === "neoncity" ? ["#141c34", "#1a2440", "#10162a"] : ["#a9b4bf", "#b9c3cc", "#98a5b2"] : k === "pine" || k === "forest" ? ["#3d6250", "#4a7058", "#33574a"] : k === "autumn" ? ["#c98a3a", "#b8782c", "#d79c4a"] : k === "coconut" || k === "palm" ? ["#4f8a44", "#5b9a4e", "#447a3a"] : ["#6f8f62", "#7c9c6d", "#627f56"];
    for (let x = 0; x < W; ) {
      if (Math.abs(x - VX()) < W * 0.07) {
        x += W * 0.02;
        continue;
      }
      const w = W * (0.012 + r() * 0.02), h = H * (city ? 0.02 + r() * 0.07 : 0.012 + r() * 0.022), c = tint(cols[Math.floor(r() * 3)], T);
      if (city) {
        rect(x, hz - h, w, h, c);
        if (k === "neoncity" && r() > 0.5) rect(x + w * 0.3, hz - h + 3, w * 0.2, 2, r() > 0.5 ? "#ff4fd8" : "#3fe0ff");
      } else if (S.style === "poly") poly([[x, hz], [x + w * 0.2, hz - h * 0.8], [x + w * 0.5, hz - h], [x + w * 0.85, hz - h * 0.7], [x + w, hz]], c);
      else {
        g.fillStyle = c;
        g.beginPath();
        g.ellipse(x + w / 2, hz, w * 0.6, h, 0, Math.PI, 0);
        g.fill();
      }
      x += w * (0.7 + r() * 0.5);
    }
  }
  const tint = (c, T) => T.light >= 1 ? c : mix(c, "#0b1630", 1 - T.light);
  function ground(T, scn) {
    const hz = HZ(), gr = scn.gr;
    for (let i = 0; i < 14; i++) {
      const z1 = (i / 14 + off) % 1, z2 = z1 + 1 / 14;
      const a = proj(-30, 1 - z1), b = proj(-30, 1 - Math.min(z2, 1));
      g.fillStyle = tint(S.style === "poly" ? gr[i % 2] : gr[0], T);
      g.fillRect(0, Math.min(a.y, b.y), W, Math.abs(a.y - b.y) + 1);
    }
    if (scn.extra.indexOf("grid") >= 0) {
      g.strokeStyle = scn.side === "palm" ? "rgba(255,79,216,0.55)" : "rgba(63,224,255,0.4)";
      g.lineWidth = 1 * DPR;
      for (let i = -12; i <= 12; i++) {
        const a = proj(i * 1.6, 1.05), b = proj(i * 6, 0);
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.stroke();
      }
      for (let i = 0; i < 10; i++) {
        const p = proj(0, 1 - (i / 10 + off) % 1);
        g.beginPath();
        g.moveTo(0, p.y);
        g.lineTo(W, p.y);
        g.stroke();
      }
    }
    const city = scn.side === "city" || scn.side === "shophouse" || scn.side === "neoncity";
    const L = proj(-2.6, 1.05), R = proj(2.6, 1.05), F = proj(-2.6, 0), Fr = proj(2.6, 0);
    poly([[F.x, F.y], [Fr.x, Fr.y], [R.x, R.y], [L.x, L.y]], tint(scn.rd, T));
    if (city) {
      const sl = proj(-3.4, 1.05), sf = proj(-3.4, 0), sr = proj(3.4, 1.05), sfr = proj(3.4, 0);
      poly([[sf.x, sf.y], [F.x, F.y], [L.x, L.y], [sl.x, sl.y]], tint("#b8b4ab", T));
      poly([[Fr.x, Fr.y], [sfr.x, sfr.y], [sr.x, sr.y], [R.x, R.y]], tint("#b8b4ab", T));
    }
    g.strokeStyle = scn.forceNight ? "rgba(63,224,255,0.8)" : "rgba(255,255,255,0.9)";
    g.lineWidth = 2 * DPR;
    [-2.5, 2.5].forEach((xx) => {
      const a = proj(xx, 1.05), b = proj(xx, 0);
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
    });
    for (let i = 0; i < 12; i++) {
      const z = (i / 12 + off) % 1, z2 = z + 0.035;
      if (z2 > 1) continue;
      const a = proj(0, 1 - z), b = proj(0, 1 - z2);
      g.strokeStyle = scn.forceNight ? "#3fe0ff" : "#ffffff";
      g.lineWidth = Math.max(1, 1.2 * a.p * DPR);
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
    }
    if (scn.extra.indexOf("tram") >= 0) {
      const a = proj(1.2, 1.05), b = proj(1.2, 0);
      g.strokeStyle = "rgba(80,80,80,0.6)";
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
      const tp = proj(1.25, 0.55);
      const k = tp.p * W * 0.012;
      rect(tp.x - k * 1.4, tp.y - k * 1.6, k * 2.8, k * 1.6, "#2a8f5b");
      rect(tp.x - k * 1.4, tp.y - k * 1.1, k * 2.8, k * 0.35, "#f2c94c");
      rect(tp.x - k * 1.1, tp.y - k * 1.5, k * 2.2, k * 0.35, "#cfe6ee");
    }
    if (scn.extra.indexOf("fence") >= 0) for (let i = 0; i < 16; i++) {
      const z = (i / 16 + off) % 1;
      const a = proj(-4.2, 1 - z);
      rect(a.x - 1, a.y - H * 8e-3 * a.p, 2, H * 8e-3 * a.p, "#8a7560");
    }
  }
  function roadside(T, scn) {
    const hz = HZ(), facets = S.style === "poly";
    const pal = { leaf: S.tod === "night" ? ["#21362a", "#2a4433", "#1a2d22", "#30503b"] : ["#6f9a5c", "#88b06e", "#5a8449", "#9cc07f"] };
    const kind = scn.side, sparse = kind === "gumSparse";
    const N = kind === "city" || kind === "shophouse" || kind === "neoncity" ? 18 : kind === "wheat" ? 26 : sparse ? 12 : 22;
    const items = [];
    const r = rnd(scn.n.length * 13 + 3);
    for (let i = 0; i < N; i++) items.push({ z: i / N + r() * 0.02, side: i % 2 ? 1 : -1, dx: kind === "city" || kind === "shophouse" || kind === "neoncity" ? 1.4 + r() * 0.4 : 0.5 + r() * 1.3, s: 0.8 + r() * 0.6, r: r() });
    items.forEach((it) => {
      it.zz = (it.z + off) % 1.02;
    });
    items.sort((a, b) => a.zz - b.zz);
    signs(T, scn);
    for (const it of items) {
      const p = proj(it.side * (2.6 + it.dx), 1 - it.zz);
      if (p.y < hz) continue;
      let k = kind;
      if (kind === "forest" && it.r > 0.75) k = "pine";
      if (scn.extra.indexOf("tamarind") >= 0 && it.r > 0.6) k = "tamarind";
      if (scn.extra.indexOf("mai") >= 0 && it.r > 0.7) k = "mai";
      if (k === "mai") {
        tree("gum", p.x, p.y, it.s * p.p * 0.18, { leaf: ["#f3c52b", "#f7d64a", "#e8b51f", "#ffe066"] }, it.r, facets);
        continue;
      }
      tree(k, p.x, p.y, it.s * p.p * (k === "city" || k === "neoncity" || k === "shophouse" ? 0.3 : 0.45), pal, it.r, facets);
    }
    if (scn.extra.indexOf("moto") >= 0) for (let i = 0; i < 3; i++) {
      const p = proj(-1.4 + i * 0.9, 0.35 + i * 0.12);
      const k = p.p * W * 6e-3;
      rect(p.x - k, p.y - k * 2.2, k * 2, k * 1.4, ["#c0392b", "#2c7fb8", "#f2c94c"][i]);
      circ(p.x, p.y - k * 2.8, k * 0.6, "#333");
      rect(p.x - k * 1.2, p.y - k * 0.6, k * 2.4, k * 0.6, "#222");
    }
    if (scn.extra.indexOf("lanterns") >= 0) for (let i = 0; i < 8; i++) {
      const z = (i / 8 + off) % 1;
      const a = proj(-3.1, 1 - z), b = proj(3.1, 1 - z);
      circ(a.x, a.y - H * 0.03 * a.p, H * 6e-3 * a.p, "#e53935");
      circ(b.x, b.y - H * 0.03 * b.p, H * 6e-3 * b.p, "#e53935");
    }
    if (scn.extra.indexOf("coffee") >= 0) {
      const p = proj(-3.4, 0.3);
      const k = p.p * W * 0.01;
      rect(p.x - k * 2, p.y - k * 1.2, k * 4, k * 0.25, "#7a5236");
      rect(p.x - k * 1.8, p.y - k * 0.95, k * 0.2, k * 0.95, "#5c3d28");
      rect(p.x + k * 1.6, p.y - k * 0.95, k * 0.2, k * 0.95, "#5c3d28");
      circ(p.x, p.y - k * 1.35, k * 0.3, "#fff");
    }
    const cp = proj(-1.25, 0.42);
    car(cp.x, cp.y, cp.p * 0.2, S.tod === "night" ? "#9aa4ae" : "#f4f6f8", facets);
  }
  function car(x, y, s, col, facets) {
    const w = s * W * 0.08, h = w * 0.62;
    poly([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - h * 0.55], [x - w / 2, y - h * 0.55]], col);
    poly([[x - w * 0.38, y - h * 0.55], [x + w * 0.38, y - h * 0.55], [x + w * 0.3, y - h], [x - w * 0.3, y - h]], facets ? shade(col, -0.06) : col);
    poly([[x - w * 0.3, y - h * 0.6], [x + w * 0.3, y - h * 0.6], [x + w * 0.25, y - h * 0.92], [x - w * 0.25, y - h * 0.92]], "#2b3640");
    rect(x - w * 0.48, y - h * 0.45, w * 0.14, h * 0.1, S.tod === "night" ? "#ff3b3b" : "#d33");
    rect(x + w * 0.34, y - h * 0.45, w * 0.14, h * 0.1, S.tod === "night" ? "#ff3b3b" : "#d33");
    rect(x - w * 0.45, y, w * 0.16, h * 0.12, "#222");
    rect(x + w * 0.29, y, w * 0.16, h * 0.12, "#222");
  }
  function weatherFx(t) {
    if (S.wx === "rain" || S.wx === "storm") {
      const r = rnd(11);
      for (let i = 0; i < 60; i++) {
        const x = r() * W, sp = 0.02 + r() * 0.05, y = (r() * H * 0.75 + (S.drive ? 0 : t * sp * 0.05)) % (H * 0.75);
        const rr = (1 + r() * 2.2) * DPR;
        g.fillStyle = "rgba(220,235,250,0.32)";
        g.beginPath();
        g.arc(x, y, rr, 0, 6.2832);
        g.fill();
      }
      if (S.wx === "storm" && !S.drive && Math.random() < 4e-3) {
        g.fillStyle = "rgba(230,240,255,0.3)";
        g.fillRect(0, 0, W, HZ());
      }
    }
    if (S.wx === "fog") {
      const fg = g.createLinearGradient(0, HZ() - H * 0.15, 0, HZ() + H * 0.12);
      fg.addColorStop(0, "rgba(230,235,238,0)");
      fg.addColorStop(0.5, "rgba(230,235,238,0.55)");
      fg.addColorStop(1, "rgba(230,235,238,0)");
      g.fillStyle = fg;
      g.fillRect(0, 0, W, H);
    }
  }
  function cockpit(t) {
    const c = CP[S.cockpit] || CP.lowpoly;
    const night = S.tod === "night";
    if (S.slim) {
      const sd = H * 0.07, sp = c.pillar || "#2a3038", sdash = c.dash ? night ? c.dashN : c.dash : night ? "#0b1118" : "#1d2630";
      poly([[0, 0], [W * 0.04, 0], [W * 0.09, H - sd], [0, H - sd]], night ? shade(sp, -0.7) : shade(sp, -0.15));
      poly([[W, 0], [W * 0.96, 0], [W * 0.91, H - sd], [W, H - sd]], night ? shade(sp, -0.7) : shade(sp, -0.15));
      rect(0, H - sd, W, sd, sdash);
      rect(0, H - sd, W, 2 * DPR, night ? "rgba(255,255,255,0.08)" : c.trim || "#9aa4ad");
      if (c.pixel) pixelate();
      return;
    }
    if (c.hud || !c.dash) {
      if (!S.noGauge) gaugeHud();
      return;
    }
    const dh = H * c.top, dash = night ? c.dashN : c.dash;
    poly([[0, 0], [W * 0.05, 0], [W * 0.13, H - dh], [0, H - dh]], night ? shade(c.pillar, -0.6) : c.pillar);
    poly([[W, 0], [W * 0.95, 0], [W * 0.87, H - dh], [W, H - dh]], night ? shade(c.pillar, -0.6) : c.pillar);
    if (c.bigMirrors) {
      rect(W * 0.01, H * 0.33, W * 0.06, H * 0.2, "#22272c");
      rect(W * 0.015, H * 0.34, W * 0.05, H * 0.18, "#7d93a6");
      rect(W * 0.93, H * 0.33, W * 0.06, H * 0.2, "#22272c");
      rect(W * 0.935, H * 0.34, W * 0.05, H * 0.18, "#7d93a6");
    }
    g.fillStyle = dash;
    g.beginPath();
    g.moveTo(0, H);
    g.lineTo(0, H - dh * 0.72);
    g.quadraticCurveTo(W * 0.5, H - dh * 1.25, W, H - dh * 0.72);
    g.lineTo(W, H);
    g.fill();
    if (c.carbon) {
      g.save();
      g.globalAlpha = 0.12;
      for (let x = 0; x < W; x += 8 * DPR) rect(x, H - dh, 4 * DPR, dh, "#ffffff");
      g.restore();
    }
    if (c.wood) {
      rect(0, H - dh * 0.55, W, dh * 0.12, night ? "#3b2616" : "#8a5a34");
      g.fillStyle = night ? "rgba(0,0,0,0.25)" : "rgba(60,30,10,0.25)";
      for (let x = 0; x < W; x += 30 * DPR) g.fillRect(x, H - dh * 0.55, 10 * DPR, dh * 0.12);
    }
    rect(0, H - dh * 0.66, W, 3 * DPR, c.trim);
    if (c.neon) {
      g.strokeStyle = "#3fe0ff";
      g.lineWidth = 2 * DPR;
      g.beginPath();
      g.moveTo(0, H - dh * 0.72);
      g.quadraticCurveTo(W * 0.5, H - dh * 1.25, W, H - dh * 0.72);
      g.stroke();
    }
    if (c.vents) for (const vx of [0.38, 0.55]) {
      rect(W * vx, H - dh * 0.5, W * 0.07, dh * 0.16, "#202326");
      for (let i = 0; i < 4; i++) rect(W * vx, H - dh * 0.5 + i * dh * 0.04, W * 0.07, 2 * DPR, "#3a3e43");
    }
    if (c.screen) {
      rect(W * 0.3, H - dh * 0.85, W * 0.25, dh * 0.4, night ? "#0b1218" : "#11181f");
      rect(W * 0.31, H - dh * 0.8, W * 0.23, dh * 0.3, "#1f3a4a");
    }
    if (c.grab) {
      g.strokeStyle = c.trim;
      g.lineWidth = 6 * DPR;
      g.beginPath();
      g.arc(W * 0.32, H - dh * 0.75, W * 0.04, Math.PI, 0);
      g.stroke();
    }
    if (c.chrome) rect(W * 0.3, H - dh * 0.66, W * 0.4, 2 * DPR, "#e6e6e6");
    if (!S.noGauge) {
      const gx = W * 0.75, gy = H - dh * 0.5;
      gauge(gx, gy, Math.min(H * 0.072, dh * 0.32), c);
      wheel(W * 0.75, H + H * 0.1, c, night);
    }
    if (c.pixel) pixelate();
  }
  function wheel(x, y, c, night) {
    const R = H * 0.3, col = night ? "#2a3038" : "#59636d";
    g.strokeStyle = col;
    g.lineCap = "round";
    switch (c.wheel) {
      case "four":
      case "three":
      case "big":
      case "thin": {
        const rr = c.wheel === "big" ? R * 1.15 : R;
        g.lineWidth = c.wheel === "thin" ? H * 0.018 : H * 0.035;
        g.beginPath();
        g.arc(x, y, rr, Math.PI * 1.08, Math.PI * 1.92);
        g.stroke();
        g.lineWidth = H * 0.02;
        if (c.wheel === "three") {
          g.beginPath();
          g.moveTo(x - rr * 0.85, y - rr * 0.35);
          g.lineTo(x, y - rr * 0.2);
          g.lineTo(x + rr * 0.85, y - rr * 0.35);
          g.stroke();
        } else {
          g.beginPath();
          g.moveTo(x - rr * 0.9, y - rr * 0.32);
          g.lineTo(x - rr * 0.25, y - rr * 0.3);
          g.moveTo(x + rr * 0.9, y - rr * 0.32);
          g.lineTo(x + rr * 0.25, y - rr * 0.3);
          g.stroke();
        }
        if (c.wood) {
          g.strokeStyle = "#8a5a34";
          g.lineWidth = H * 0.012;
          g.beginPath();
          g.arc(x, y, rr, Math.PI * 1.35, Math.PI * 1.65);
          g.stroke();
        }
        break;
      }
      case "flat":
        g.lineWidth = H * 0.035;
        g.beginPath();
        g.arc(x, y, R, Math.PI * 1.1, Math.PI * 1.9);
        g.stroke();
        g.strokeStyle = "#c8282e";
        g.lineWidth = H * 0.012;
        g.beginPath();
        g.arc(x, y, R, Math.PI * 1.48, Math.PI * 1.52);
        g.stroke();
        break;
      case "yoke":
        g.lineWidth = H * 0.03;
        g.beginPath();
        g.moveTo(x - R * 0.85, y - R * 0.25);
        g.lineTo(x - R * 0.85, y - R * 0.55);
        g.quadraticCurveTo(x, y - R * 0.75, x + R * 0.85, y - R * 0.55);
        g.lineTo(x + R * 0.85, y - R * 0.25);
        g.stroke();
        break;
      default:
        g.lineWidth = H * 0.035;
        g.beginPath();
        g.arc(x, y, R, Math.PI * 1.12, Math.PI * 1.88);
        g.stroke();
    }
    if (c.wheel !== "yoke") {
      g.strokeStyle = night ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.42)";
      g.lineWidth = H * 4e-3;
      g.beginPath();
      g.arc(x, y, (c.wheel === "big" ? R * 1.15 : R) - H * 0.012, Math.PI * 1.12, Math.PI * 1.88);
      g.stroke();
    }
    g.lineCap = "butt";
  }
  function mirror(c) {
    const mw = W * 0.18, mh = H * 0.1, mx = W * 0.5 - mw / 2, my = H * 0.025;
    g.fillStyle = "#2b3138";
    round(mx - 4, my - 4, mw + 8, mh + 8, 10);
    g.fill();
    g.save();
    round(mx, my, mw, mh, 7);
    g.clip();
    const T = TOD[S.tod];
    const ms = g.createLinearGradient(0, my, 0, my + mh);
    ms.addColorStop(0, T.sky[0]);
    ms.addColorStop(0.55, T.sky[1]);
    ms.addColorStop(0.55, "#7d8288");
    ms.addColorStop(1, "#6d7278");
    g.fillStyle = ms;
    g.fillRect(mx, my, mw, mh);
    car(mx + mw * 0.55, my + mh * 0.95, 0.5, "#c9d0d6", S.style === "poly");
    g.restore();
  }
  function round(x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  function gauge(x, y, r, c) {
    const sp = Math.max(0, Math.round(S.speed || 0)), lim = S.limit || 0, over = lim && sp > lim;
    const st = S.gauge, night = S.tod === "night";
    const A0 = -210, A1 = 30, ang = (v) => (A0 + (A1 - A0) * Math.min(v, 180) / 180) * Math.PI / 180;
    const face = { classic: night ? "#e8ecef" : "#ffffff", neon: "#04121b", rally: "#0b0b0b", bar: "#0b1a12", minimal: "rgba(0,0,0,0)", rings: "#0a1410", retro: "#efe6cf" }[st] || "#ffffff";
    const ink = { classic: "#1d2733", neon: "#bff6ff", rally: "#f2f2f2", bar: "#e6f5ec", minimal: night || ["hiace", "sport", "offroad", "truck", "real", "neon", "pixel", "none"].indexOf(S.cockpit) >= 0 ? "#f2f5f7" : "#1d2733", rings: "#cfe8d6", retro: "#3a2a18" }[st] || "#1d2733";
    if (st === "bar") {
      const w = r * 2.4, h = r * 1.3;
      round(x - w / 2, y - h / 2, w, h, 10);
      g.fillStyle = face;
      g.fill();
      const n = 20;
      for (let i = 0; i < n; i++) {
        const on = i < sp / 160 * n;
        rect(x - w * 0.44 + i * w * 0.044, y + h * 0.25 - i * h * 0.012, w * 0.032, h * 0.1 + i * h * 0.012, on ? i > 14 ? "#fbb040" : "#3fd17a" : "#163a2a");
      }
      g.fillStyle = over ? "#ffb347" : ink;
      g.font = "600 " + r * 0.75 + 'px "Chakra Petch",sans-serif';
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(String(sp), x, y - h * 0.08);
      g.font = r * 0.2 + "px sans-serif";
      g.fillText(S.unit, x, y + h * 0.4);
      g.textBaseline = "alphabetic";
      return;
    }
    if (st !== "minimal") {
      circ(x, y, r, face);
      g.strokeStyle = c && c.chrome ? "#d9d9d9" : st === "neon" ? "#3fe0ff" : "#c8c2b8";
      g.lineWidth = r * 0.08;
      g.beginPath();
      g.arc(x, y, r, 0, 6.2832);
      g.stroke();
    }
    if (st === "rings") {
      g.strokeStyle = "#123a24";
      g.lineWidth = r * 0.12;
      g.beginPath();
      g.arc(x, y, r * 0.8, ang(0), ang(180));
      g.stroke();
      g.strokeStyle = over ? "#ffb347" : "#3fd17a";
      g.beginPath();
      g.arc(x, y, r * 0.8, ang(0), ang(sp));
      g.stroke();
    } else if (st === "neon" || st === "minimal") {
      g.strokeStyle = st === "neon" ? "#123447" : "rgba(127,147,160,0.35)";
      g.lineWidth = r * (st === "neon" ? 0.09 : 0.03);
      g.beginPath();
      g.arc(x, y, r * 0.86, ang(0), ang(180));
      g.stroke();
      g.strokeStyle = over ? "#ffb347" : st === "neon" ? "#3fe0ff" : ink;
      g.beginPath();
      g.arc(x, y, r * 0.86, ang(0), ang(sp));
      g.stroke();
    } else {
      for (let v = 0; v <= 180; v += 10) {
        const a2 = ang(v), big = v % 20 === 0;
        g.strokeStyle = ink;
        g.lineWidth = big ? r * 0.035 : r * 0.018;
        g.beginPath();
        g.moveTo(x + Math.cos(a2) * r * (big ? 0.74 : 0.8), y + Math.sin(a2) * r * (big ? 0.74 : 0.8));
        g.lineTo(x + Math.cos(a2) * r * 0.9, y + Math.sin(a2) * r * 0.9);
        g.stroke();
      }
      if (st === "rally") {
        g.strokeStyle = "#e5322d";
        g.lineWidth = r * 0.06;
        g.beginPath();
        g.arc(x, y, r * 0.88, ang(130), ang(180));
        g.stroke();
      }
      const a = ang(sp);
      g.strokeStyle = st === "rally" ? "#ff7a1a" : st === "retro" ? "#b03a2e" : "#1d2733";
      if (st === "classic" && night) g.strokeStyle = "#d33";
      g.lineWidth = r * 0.05;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7);
      g.stroke();
      circ(x, y, r * 0.07, "#FBB040");
    }
    g.fillStyle = over ? "#e8851e" : ink;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = (st === "minimal" ? "300 " : "600 ") + r * (st === "minimal" ? 0.72 : 0.5) + "px " + (st === "retro" ? "Georgia,serif" : '"Chakra Petch",sans-serif');
    g.fillText(String(sp), x, y + (st === "neon" || st === "minimal" || st === "rings" ? 0 : r * 0.38));
    g.font = r * 0.16 + "px sans-serif";
    g.fillText(S.unit, x, y + (st === "neon" || st === "minimal" || st === "rings" ? r * 0.42 : r * 0.66));
    g.textBaseline = "alphabetic";
  }
  function gaugeHud() {
    const sp = Math.max(0, Math.round(S.speed || 0));
    g.fillStyle = "rgba(191,246,255,0.85)";
    g.textAlign = "center";
    g.font = "300 " + H * 0.09 + 'px "Chakra Petch",sans-serif';
    g.fillText(String(sp), W * 0.75, H * 0.82);
    g.font = H * 0.022 + "px sans-serif";
    g.fillText(S.unit, W * 0.75, H * 0.86);
  }
  function pixelate() {
    const k = 6 * DPR, w = Math.ceil(W / k), h = Math.ceil(H / k);
    if (!pixelate.c) pixelate.c = document.createElement("canvas");
    const pc = pixelate.c;
    pc.width = w;
    pc.height = h;
    const px = pc.getContext("2d");
    px.imageSmoothingEnabled = false;
    px.drawImage(cv, 0, 0, w, h);
    g.imageSmoothingEnabled = false;
    g.drawImage(pc, 0, 0, w, h, 0, 0, W, H);
    g.imageSmoothingEnabled = true;
  }
  function frame(ts) {
    requestAnimationFrame(frame);
    if (!S.on) return;
    const anim = !S.drive || S.moveMode === "slow";
    const fps = S.drive ? 2 : 24;
    if (!dirty && ts - last < 1e3 / fps) return;
    if (!dirty && !anim && ts - last < 1e3) return;
    last = ts;
    dirty = false;
    const dt = Math.min(100, ts - (t0 || ts));
    t0 = ts;
    if (anim) off = (off + dt * (S.drive ? 35e-7 : S.moveMode === "run" ? 25e-5 : 35e-7)) % 1;
    const scn = scene(S.theme);
    const tod = scn.forceNight ? "night" : scn.forceTod || S.tod;
    const T = TOD[tod] || TOD.day;
    const keepTod = S.tod;
    S.tod = tod;
    const keepWx = S.wx;
    if (scn.wx) S.wx = scn.wx;
    sky(T, scn, ts);
    ground(T, scn);
    roadside(T, scn);
    weatherFx(ts);
    if (scn.sepia) {
      g.fillStyle = "rgba(160,120,60,0.22)";
      g.fillRect(0, 0, W, H);
    }
    if (scn.extra.indexOf("frost") >= 0) {
      g.fillStyle = "rgba(235,242,247,0.18)";
      g.fillRect(0, 0, W, HZ());
    }
    if (S.dim > 0) {
      g.fillStyle = "rgba(1,6,10," + Math.min(0.75, S.dim).toFixed(2) + ")";
      g.fillRect(0, 0, W, H);
    }
    cockpit(ts);
    if (tod === "night") {
      g.fillStyle = "rgba(255,190,110,0.05)";
      g.fillRect(0, 0, W, H);
    }
    if (fade < 1 && prevImg) {
      g.globalAlpha = 1 - fade;
      g.drawImage(prevImg, 0, 0);
      g.globalAlpha = 1;
      fade = Math.min(1, fade + (S.drive ? 0.02 : 0.05));
      dirty = true;
    }
    S.tod = keepTod;
    S.wx = keepWx;
  }
  function resize() {
    const r = cv.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = cv.width = Math.max(320, Math.round((r.width || 1280) * DPR));
    H = cv.height = Math.max(180, Math.round((r.height || 720) * DPR));
    dirty = true;
  }
  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
  window.TCScene = {
    set(p) {
      const sceneChange = p.theme && p.theme !== S.theme && S.on;
      if (sceneChange) {
        try {
          if (!prevImg) prevImg = document.createElement("canvas");
          prevImg.width = cv.width;
          prevImg.height = cv.height;
          prevImg.getContext("2d").drawImage(cv, 0, 0);
          fade = 0;
        } catch (e) {
          fade = 1;
        }
      }
      Object.assign(S, p);
      dirty = true;
      if (p.on !== void 0) {
        document.body.classList.toggle("lp-on", !!p.on);
        if (p.on) resize();
      }
    },
    get: () => Object.assign({}, S),
    scenes: () => Object.keys(SC).map((k) => ({ k, n: scene(k).n })),
    names: (k) => scene(k).n,
    // small preview for the theme picker
    thumb(k, style, cockpit2, w, h) {
      const keep = Object.assign({}, S), kc = cv, kW = W, kH = H, kD = DPR;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      try {
        Object.assign(S, { theme: k, style: style || "poly", cockpit: cockpit2 || "none", speed: 0 });
        W = w;
        H = h;
        DPR = 1;
        const save = g;
        const gg = c.getContext("2d");
        g = gg;
        const scn = scene(k);
        const tod = scn.forceNight ? "night" : scn.forceTod || "day";
        const T = TOD[tod];
        S.tod = tod;
        if (scn.wx) S.wx = scn.wx;
        else S.wx = "clear";
        sky(T, scn, 0);
        ground(T, scn);
        roadside(T, scn);
        if (scn.sepia) {
          g.fillStyle = "rgba(160,120,60,0.22)";
          g.fillRect(0, 0, W, H);
        }
        if (cockpit2 && cockpit2 !== "none") cockpit2 && function() {
          const keepCp = S.cockpit;
          S.cockpit = cockpit2;
          cockpitFn(0);
          S.cockpit = keepCp;
        }();
        g = save;
      } catch (e) {
      }
      W = kW;
      H = kH;
      DPR = kD;
      Object.assign(S, keep);
      return c.toDataURL("image/jpeg", 0.7);
    }
  };
  const cockpitFn = cockpit;
})();
