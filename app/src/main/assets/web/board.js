const SCN = /* @__PURE__ */ (() => {
  let seed = 7;
  const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const R = (x, y, w, h, rx) => rx ? `M${x + rx} ${y}H${x + w - rx}A${rx} ${rx} 0 0 1 ${x + w} ${y + rx}V${y + h - rx}A${rx} ${rx} 0 0 1 ${x + w - rx} ${y + h}H${x + rx}A${rx} ${rx} 0 0 1 ${x} ${y + h - rx}V${y + rx}A${rx} ${rx} 0 0 1 ${x + rx} ${y}Z` : `M${x} ${y}h${w}v${h}h${-w}Z`;
  const E = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
  const C = (cx, cy, r) => E(cx, cy, r, r);
  const P = (pts) => "M" + pts.map((p2) => p2.join(" ")).join("L") + "Z";
  const p = (d, f, x) => Object.assign({ d, f: f || "none", s: "none", w: 0, t: "", o: 1 }, x || {});
  const sk = (d, s, w, x) => p(d, "none", Object.assign({ s, w }, x || {}));
  const T = (x, y, txt, f, size) => ({ x, y, txt, f, size });
  const trees = (xs, c) => xs.map((x) => p(E(x, 286, 22 + rnd() * 10, 14 + rnd() * 8), c));
  const range = (a, b, s) => {
    const r = [];
    for (let i = a; i < b; i += s) r.push(i);
    return r;
  };
  const notre = (x) => {
    const o = [p(R(x, 236, 128, 64), "$brick")];
    [x, x + 100].forEach((tx) => o.push(p(R(tx, 178, 28, 122), "$brick"), p(P([[tx - 2, 178], [tx + 14, 128], [tx + 30, 178]]), "$brickDark"), p(R(tx + 13, 116, 2, 14), "$brickDark"), p(R(tx + 10, 120, 8, 2), "$brickDark"), p(R(tx + 9, 196, 10, 16, 5), "$brickDark")));
    o.push(p(P([[x + 28, 236], [x + 64, 212], [x + 100, 236]]), "$brick"), p(C(x + 64, 246, 9), "$brickDark"));
    [44, 64, 84].forEach((dx) => o.push(p(R(x + dx - 6, 272, 12, 28, 6), "$brickDark")));
    return o;
  };
  const post = (x) => {
    const o = [p(R(x, 262, 230, 38), "$cream"), p(R(x + 80, 246, 70, 54), "$cream"), p(`M${x + 80} 246Q${x + 115} 222 ${x + 150} 246Z`, "$cream"), p(C(x + 115, 240, 7), "$creamDark"), p(R(x, 262, 230, 4), "$creamDark")];
    for (let i = 0; i < 9; i++) {
      const xx = x + 8 + i * 25;
      if (xx > x + 78 && xx < x + 150) continue;
      o.push(p(R(xx, 272, 10, 20, 5), "$creamDark"));
    }
    [92, 110, 128].forEach((dx) => o.push(p(R(x + dx, 266, 10, 34, 5), "$creamDark")));
    return o;
  };
  const skyline = () => {
    const o = [];
    [[560, 40, 60], [604, 30, 90], [640, 24, 70], [670, 44, 110], [720, 30, 80], [800, 36, 70], [842, 28, 120], [990, 40, 80], [1036, 30, 60], [1070, 50, 90], [1124, 30, 70], [1160, 44, 100], [1210, 36, 60]].forEach(([x, w, h]) => {
      o.push(p(R(x, 300 - h, w, h), "$cityFar"));
      let d2 = "";
      for (let y = 300 - h + 8; y < 296; y += 12) for (let xx = x + 5; xx < x + w - 5; xx += 9) if (rnd() < 0.45) d2 += `M${xx} ${y}h4v5h-4Z`;
      if (d2) o.push(p(d2, "$winLit"));
    });
    o.push(p("M752 300L758 120Q770 98 782 120L788 300Z", "$tower"), p(E(777, 150, 20, 5), "$tower"));
    let d = "";
    for (let y = 130; y < 296; y += 10) d += `M766 ${y}h14v2h-14Z`;
    o.push(p(d, "$winLit", { o: 0.8 }));
    o.push(p("M900 300V120H912V80H924V50H936V80H948V120H960V300Z", "$tower"), p(R(929, 36, 2, 14), "$tower"));
    d = "";
    [906, 918, 930, 942, 954].forEach((x) => d += `M${x} 130h2v160h-2Z`);
    o.push(p(d, "$winLit", { o: 0.55 }));
    o.push(p(R(0, 282, 540, 6), "$bridge"), p("M300 282L312 170L324 282Z", "$bridge"));
    d = "";
    [-240, -200, -160, -120, -80, 80, 120, 160, 200, 240].forEach((dx, i) => d += `M312 ${176 + i * 6}L${312 + dx} 282`);
    o.push(sk(d, "$cable", 1.2));
    d = "";
    for (let x = 10; x < 540; x += 30) d += C(x, 281, 2);
    o.push(p(d, "$winLit"));
    return o;
  };
  const palm = (x, y, h, lean, c1, c2, sw) => {
    const tx = x + lean, ty = y - h;
    const o = [sk(`M${x} ${y}Q${x + lean / 2} ${y - h / 2} ${tx} ${ty}`, c1, sw)];
    [-60, -25, 10, 40, 75, 110, 150].forEach((a) => {
      const ex = tx + h * 0.35 * Math.cos((a + 180) * Math.PI / 180), ey = ty + h * 0.2 * Math.sin(a * Math.PI / 180) - 4;
      o.push(sk(`M${tx} ${ty}Q${(tx + ex) / 2} ${ty - 8} ${ex} ${ey}`, c2, sw));
    });
    return o;
  };
  const boats = () => {
    const o = [];
    [[180, 312, 1], [340, 322, 1.3], [70, 340, 1.6]].forEach(([x, y, s]) => {
      const t = `translate(${x} ${y}) scale(${s})`;
      o.push(p("M-40 0Q0 12 40 0L34 -6L-34 -6Z", "$boat", { t }), p(R(-16, -20, 30, 14, 3), "$boatCover", { t }), sk("M-6 -20L-6 -40", "$boat", 2, { t }), p(C(-6, -42, 5) + C(20, -10, 4), "$fruit", { t }), p(C(27, -10, 4), "$fruit2", { t }));
    });
    return o;
  };
  const waves = (y0) => [sk(`M0 ${y0}Q40 ${y0 - 4} 80 ${y0}T160 ${y0}T240 ${y0}T320 ${y0}T400 ${y0}T480 ${y0}`, "#FFFFFF", 2, { o: 0.3 }), sk(`M0 ${y0 + 60}Q50 ${y0 + 54} 100 ${y0 + 60}T200 ${y0 + 60}T300 ${y0 + 60}`, "#FFFFFF", 2, { o: 0.3 })];
  const O = {
    tamarind: () => ({ w: 150, h: 260, p: [sk("M75 260L75 120M75 160L40 110M75 150L112 104", "$trunk", 10), p(E(75, 78, 74, 58), "$leaf"), p(E(40, 100, 40, 30) + E(114, 96, 38, 30), "$leaf2")] }),
    lampFr: () => ({ w: 60, h: 260, p: [p(R(27, 40, 6, 220) + "M22 250L38 250L42 260L18 260Z", "$lampPost"), sk("M30 40Q30 18 52 16", "$lampPost", 4), p("M44 16L60 16L56 30L48 30Z", "$lampHead"), p(C(52, 32, 5), "$lampGlow")] }),
    kiosk: () => ({ w: 110, h: 130, p: [p(R(6, 30, 98, 100), "$kioskBody"), p("M0 30L55 4L110 30Z", "$kioskRoof"), p(R(16, 44, 78, 30), "$kioskSign"), p(R(16, 82, 78, 40), "$kioskWin")], t: [T(55, 66, "B\xC1O", "$kioskText", 17)] }),
    cyclo: () => ({ w: 120, h: 90, p: [sk(C(20, 70, 16) + C(96, 70, 16), "$metal", 4), p("M8 40Q20 20 46 22L50 56L8 56Z", "$cycloSeat"), sk("M50 56L96 70M70 30L96 70M60 30L80 30", "$metal", 4), p(C(70, 22, 7), "$rider"), p("M62 18L70 10L78 18Z", "$nonLa")] }),
    vespa: () => ({ w: 110, h: 80, p: [p(C(22, 64, 13) + C(88, 64, 13), "$metalDark"), p("M10 60Q12 30 46 34L62 34Q66 52 80 54L98 54Q100 34 92 20L96 16Q108 36 104 60Z", "$vespa"), p(R(34, 26, 30, 7, 3), "#3A2A20")] }),
    shop: (txt) => ({ w: 170, h: 200, p: [p(R(10, 80, 150, 120), "$shopBody"), p(R(0, 40, 170, 44, 4), "$shopSign"), p(R(22, 96, 126, 90), "$shopWin")], t: [T(85, 72, txt, "$shopText", 26)] }),
    coconut: () => ({ w: 120, h: 300, p: palm(60, 300, 260, 0, "$palmTrunk", "$palmLeaf", 8).concat([p(C(54, 48, 7) + C(66, 50, 7), "$coco")]) }),
    banana: () => ({ w: 100, h: 160, p: [sk("M50 160L50 60", "$palmTrunk", 8), p("M50 70Q10 40 0 70Q20 60 50 74ZM50 64Q90 30 100 60Q80 52 50 70ZM50 60Q40 10 56 0Q60 30 54 62Z", "$leaf")] }),
    cocoStand: () => ({ w: 130, h: 120, p: [p(R(10, 60, 110, 10), "$stall"), sk("M20 70L20 120M110 70L110 120", "$stall", 5), p("M0 30Q65 0 130 30L120 40L10 40Z", "$umbrella"), p(C(40, 52, 9) + C(60, 50, 9) + C(80, 52, 9), "$coco"), p(C(96, 100, 8), "$rider"), p("M86 96L96 86L106 96Z", "$nonLa")] }),
    // aussie
    spinifex: () => ({ w: 120, h: 60, p: [sk(range(-50, 51, 10).map((dx) => `M60 60Q${60 + dx / 2} 30 ${60 + dx} ${4 + Math.abs(dx) / 3}`).join(""), "$tuft", 4)] }),
    deadTree: () => ({ w: 140, h: 220, p: [sk("M70 220L70 110L40 60M70 120L104 66L120 50M70 100L76 30M40 60L26 40M104 66L96 40", "$snag", 8)] }),
    guideL: () => ({ w: 16, h: 60, p: [p(R(0, 0, 16, 60, 2), "#F2F4F5"), p(R(3, 6, 10, 12), "#E5484D")] }),
    guideR: () => ({ w: 16, h: 60, p: [p(R(0, 0, 16, 60, 2), "#F2F4F5"), p(R(3, 6, 10, 12), "#FFFFFF", { s: "#9AA4AA", w: 1 })] }),
    roo: () => ({ w: 60, h: 180, p: [p(R(27, 60, 6, 120), "#8F9AA1")].concat(W529("translate(0 0) scale(0.07354)")).concat([p(R(8, 60, 44, 26.4, 4), "#FEE011"), p(R(10, 62, 40, 22.4, 3), "none", { s: "#111", w: 2 })]), t: [T(30, 72, "NEXT", "#111", 8.5), T(30, 83, "12 km", "#111", 8.5)] }),
    greenSign: () => ({ w: 144, h: 220, p: [p(R(38, 80, 7, 140) + R(98, 80, 7, 140), "#8F9AA1"), p(R(2, 2, 140, 86, 8), "#00703C", { s: "#FFFFFF", w: 4 }), p(R(12, 12, 46, 24, 3), "#00703C", { s: "#FEE011", w: 2.5 })], t: [T(35, 29.3, "B100", "#FEE011", 15), T(70, 66, "Great Ocean Rd", "#FFFFFF", 17), T(126, 82, "12", "#FFFFFF", 17)] }),
    shrub: () => ({ w: 120, h: 70, p: [p(E(40, 48, 38, 22) + E(78, 44, 40, 26), "$shrub")] }),
    cypress: () => ({ w: 80, h: 240, p: [p(R(36, 180, 8, 60), "$snag"), p("M40 0Q76 90 64 190L16 190Q4 90 40 0Z", "$shrubDark")] }),
    bld: (w, h) => {
      let d = "";
      for (let y = 14; y < h - 20; y += 26) for (let x = 10; x < w - 14; x += 20) if (rnd() < 0.45) d += `M${x} ${y}h9v13h-9Z`;
      return { w, h, p: [p(R(0, 0, w, h), "$bldA"), p(d || "M0 0", "$win")] };
    },
    tramStop: () => ({ w: 120, h: 160, p: [p(R(10, 20, 6, 140), "#8F9AA1"), p(R(0, 0, 110, 30, 4), "#00703C"), p(R(30, 70, 80, 90), "$glassStop", { o: 0.5 })], t: [T(56, 21, "Tram Stop", "#FFFFFF", 15)] }),
    lamp: () => ({ w: 60, h: 260, p: [p(R(13, 0, 6, 260) + R(13, 0, 40, 6, 3), "#6E7F89"), p(R(40, 5, 18, 7, 3), "$lampC")] }),
    npost: () => ({ w: 16, h: 70, p: [sk(R(2, 2, 12, 66, 2), "$nA", 2), p(R(5, 8, 6, 12), "$nB")] }),
    ngum: () => ({ w: 140, h: 240, p: [sk("M70 240L70 120M70 150L40 100M70 140L104 92", "$nA", 3), sk(E(70, 70, 64, 50) + E(36, 96, 36, 26) + E(108, 90, 34, 26), "$nA", 2.5)] }),
    nroo: () => ({ w: 60, h: 180, p: [p(R(27, 70, 6, 110), "$nA"), p(R(6, 6, 48, 48), "#01060B", { s: "$nB", w: 4, t: "rotate(45 30 30)" }), sk(ROO, "$nB", 22, { t: "translate(-68.4 100.2) scale(0.07354)" })] })
  };
  const ROO = "M1022.264-990.418c62.343 106.022 145.794-1.882 206.692-72.034s137.986-66.824 187.023 12.009c12.871 20.68 33.847 31.102 48.165 28.348 14.318-2.745 12.148-12.584 27.338-15.329-18.658-8.828-33.988-17.36-38.327-31.677 13.742-1.447 33.699 6.213 51.198 24.156 2.457-1.02 3.765-3.617 5.646-1.743 7.086 7.094 43.103 23.434 56.846 41.08 1.586 1.883-.434 8.532-2.754 8.828-12.296 1.299-25.603 0-37.89 2.598-6.946.434-12.733 1.455-19.678 1.742-7.373 7.949-12.723 17.935-22.71 21.691-9.255 6.37-12.296 14.902-18.658 24.157-6.797 9.839-18.658 15.764-31.678 16.348-10.553 16.052-20.967 34.998-31.53 51.059-3.328 5.638-9.69 8.532-14.03 7.224-2.317-.578-5.062-2.745-6.797-5.925-1.734-3.182-2.457-7.957-.723-13.883 4.776 3.616 3.617 11.425 12.009 9.69 2.893-17.506 5.925-39.633 8.967-57.132-7.381-1.159-14.327-5.35-21.551-6.37-6.946 9.115-12.584 17.647-19.39 26.762 2.606 28.924 1.882 83.024 12.157 87.215 33.55 13.743 70.875 24.01 110.073 33.708 3.617-.434 7.233-.871 10.99-1.159 3.903 3.905 9.255 6.51 12.008 12h-6.51c-.871 1.743-1.595 3.617-2.318 5.5-11.277 1.594-22.71-.724-33.847-6.51-33.552-5.927-66.388-12-100.087-16.488-10.126-1.3-13.89-11.425-17.36-24.01-10.273-36.888-24.731-68.853-40.068-97.34-31.67-9.84-57.996-40.358-78.684-59.016-68.994 40.497-171.686 106.021-204.522-5.499";
  const W529 = (base) => [
    p(R(-29.179, -1921.107, 600, 600, 40), "#FEE011", { t: base + " translate(-929.864 1362.728) rotate(45)" }),
    p(R(-21.179, -1913.107, 584, 584, 32), "#111", { t: base + " translate(-929.864 1362.728) rotate(45)" }),
    p(R(-5.179, -1897.107, 552, 552, 16), "#FEE011", { t: base + " translate(-929.864 1362.728) rotate(45)" }),
    p(ROO, "#111", { t: base + " translate(-929.864 1362.728)" })
  ];
  const sets = {
    center: [["tamarind", "lampFr", "kiosk", "tamarind"], ["tamarind", "cyclo", "lampFr", "vespa"]],
    night: [["lampFr", ["shop", "PH\u1EDE"], "lampFr", ["shop", "C\xC0 PH\xCA"]], ["lampFr", "tamarind", ["shop", "H\u1EE6 TI\u1EBEU"], "lampFr"]],
    mekong: [["coconut", "banana", "coconut", "banana"], ["coconut", "cocoStand", "coconut", "banana"]],
    rain: [["tamarind", "lampFr", "tamarind", "lampFr"], ["tamarind", "lampFr", "cyclo", "tamarind"]],
    outback: [["spinifex", "roo", "guideL", "deadTree"], ["spinifex", "guideR", "spinifex", "deadTree"]],
    coast: [["guideL", "shrub", "greenSign", "cypress"], ["shrub", "guideR", "shrub", "guideR"]],
    city: [[["bld", 170, 330], "tramStop", ["bld", 140, 420], "lamp"], [["bld", 150, 400], ["bld", 190, 300], ["bld", 130, 460], ["bld", 170, 340]]],
    neon: [["nroo", "npost", "ngum", "npost"], ["npost", "ngum", "npost", "nroo"]]
  };
  const horizon = {
    center: () => trees(range(-10, 380, 44).concat(range(900, 1300, 44)), "$treeFar").concat(notre(400), post(700)),
    rain: () => trees(range(-10, 380, 44).concat(range(900, 1300, 44)), "$treeFar").concat(notre(400), post(700)),
    night: skyline,
    mekong: () => {
      const o = trees(range(560, 1300, 40), "$treeFar");
      range(700, 1290, 58).forEach((x) => o.push(...palm(x, 300, 40 + rnd() * 30, rnd() * 20 - 10, "$palmTrunk", "$palmLeaf", 3)));
      return o;
    },
    outback: () => {
      const o = [p("M760 300Q770 262 820 254Q900 244 1010 250Q1050 256 1066 300Z", "$rock"), sk(range(800, 1050, 26).map((x) => `M${x} 300Q${x + 4} 276 ${x + 6} 258`).join(""), "$rockLine", 2), p("M0 300Q120 288 260 296Q420 284 560 298L560 300L0 300Z", "$farHill")];
      return o;
    },
    coast: () => [p("M120 300L128 262L146 258L152 300ZM230 300L236 252L258 246L264 300ZM330 300L334 272L350 270L354 300Z", "$stack"), p("M560 300Q600 276 700 280Q860 270 1280 286L1280 300Z", "$farHill")],
    city: () => {
      const o = [p([[380, 40, 40], [426, 26, 62], [458, 46, 34], [510, 22, 78], [540, 40, 46], [586, 28, 58], [620, 16, 96], [642, 36, 40], [684, 28, 66], [718, 44, 38], [770, 24, 54], [800, 36, 30], [842, 30, 46]].map(([x, w, h]) => R(x, 300 - h, w, h)).join("") + "M690 300L690 286Q706 266 722 286L722 300Z", "$cityFar")];
      return o;
    },
    neon: () => [sk("M760 300Q770 262 820 254Q900 244 1010 250Q1050 256 1066 300", "$nB", 2.5), sk(range(800, 1050, 26).map((x) => `M${x} 300Q${x + 4} 276 ${x + 6} 258`).join(""), "$nB", 1, { o: 0.5 })]
  };
  const water = {
    mekong: () => [p(P([[0, 300], [600, 300], [120, 720], [0, 720]]), "$river")].concat(waves(330), boats(), [p(P([[560, 300], [610, 300], [220, 720], [140, 720]]), "$bank")]),
    night: () => {
      const o = [p(P([[0, 300], [560, 300], [0, 420]]), "$river")];
      let d = "";
      for (let i = 0; i < 26; i++) d += R(Math.round(rnd() * 420), 304 + Math.round(rnd() * 76), 10 + Math.round(rnd() * 30), 2);
      o.push(p(d, "$winLit", { o: 0.5 }));
      return o;
    },
    coast: () => [p(P([[0, 300], [637, 300], [100, 720], [0, 720]]), "$sea")].concat(waves(330), [p(P([[600, 300], [637, 300], [240, 720], [150, 720]]), "$cliff")]),
    neon: () => {
      let d = "";
      for (let i = 1; i < 12; i++) {
        const y = 300 + i * i * 3.4;
        d += `M0 ${y}H1280`;
      }
      for (let i = -10; i <= 10; i++) d += `M${640 + i * 6} 300L${640 + i * 160} 720`;
      return [sk(d, "$nA", 1, { o: 0.35 })];
    }
  };
  const fill = (list, col) => list.map((q) => Object.assign({}, q, { f: q.f[0] === "$" ? col[q.f.slice(1)] : q.f, s: q.s[0] === "$" ? col[q.s.slice(1)] : q.s }));
  const fillT = (list, col) => (list || []).map((q) => Object.assign({}, q, { f: q.f[0] === "$" ? col[q.f.slice(1)] : q.f }));
  const cache = {};
  const build = (style) => {
    if (cache[style]) return cache[style];
    seed = 7;
    const mk = (spec) => Array.isArray(spec) ? O[spec[0]](spec[1], spec[2]) : O[spec]();
    const objs = sets[style].map((side) => side.map(mk));
    return cache[style] = { h: horizon[style](), w: water[style] ? water[style]() : [], objs };
  };
  return (style, col, objDelay) => {
    const b = build(style);
    const objs = [];
    b.objs.forEach((side, si) => side.forEach((o, i) => objs.push({ cls: "tc-obj tc-obj" + (si ? "R" : "L"), delay: objDelay[i], w: o.w, h: o.h, vb: "0 0 " + o.w + " " + o.h, prims: fill(o.p, col), texts: fillT(o.t, col) })));
    return { horizon: fill(b.h, col), water: fill(b.w, col), objs };
  };
})();
const SCPAL = (style, phase, night, dim, mix) => {
  const sg = ["center", "night", "mekong", "rain"].includes(style);
  const isNeon = style === "neon";
  const ph = style === "night" ? "night" : style === "rain" ? "rain" : phase;
  const nightish = ph === "night";
  const n2 = "#0A1622";
  const dmx = style === "night" ? 0.55 : style === "rain" ? 0.25 : dim;
  const dm = (c) => mix(c, n2, dmx);
  const skyDay = { center: ["#5FA8DC", "#CFE6F2"], mekong: ["#69B4E0", "#DCEFE8"], outback: ["#3F95D0", "#9FD3EE"], coast: ["#4FA6DA", "#BFE3F2"], city: ["#7FA9C9", "#C9DDE8"] };
  let sky = ph === "rain" ? ["#56636C", "#8C979D"] : ph === "day" ? skyDay[style] || ["#0B2338", "#123650"] : { dawn: ["#5A6FA0", "#F4B98E"], dusk: ["#3B2C5A", "#F0884B"], night: [sg ? "#050B1C" : "#040A16", sg ? "#162A4A" : "#0C1A2E"] }[ph];
  if (isNeon) sky = { day: ["#0B2338", "#123650"], dawn: ["#101A33", "#3A2433"], dusk: ["#1A0F2A", "#3A1830"], night: ["#02070D", "#06121E"] }[ph] || ["#02070D", "#06121E"];
  const sunP = { day: ["74%", "6%", "#FFE08A"], dawn: ["16%", "26%", "#FFB36B"], dusk: ["70%", "27%", "#FF8A4C"], night: ["80%", "6%", "#F3EBD2"], rain: ["80%", "6%", "transparent"] }[ph] || ["80%", "6%", "#F3EBD2"];
  const lit = nightish || ph === "dusk";
  const col = {
    brick: dm("#B24A32"),
    brickDark: dm("#7A2E1E"),
    cream: dm("#E9D9A6"),
    creamDark: dm("#B49A5E"),
    treeFar: dm(style === "mekong" ? "#4F7D3E" : "#3F6B3A"),
    cityFar: sg ? "#1B2A44" : dm("#8EA6B6"),
    tower: "#22324F",
    winLit: "#FFD98A",
    bridge: "#2B3B57",
    cable: "#7FA6C9",
    palmTrunk: dm("#7A5A3A"),
    palmLeaf: dm("#3E7A34"),
    boat: dm("#6B3E22"),
    boatCover: dm("#2F5E7A"),
    fruit: dm("#E8A73A"),
    fruit2: dm("#7BB34A"),
    river: dm(style === "night" ? "#0E2238" : "#7C6A44"),
    bank: dm("#5E7A3A"),
    trunk: dm("#5A4433"),
    leaf: dm("#3F7A3A"),
    leaf2: dm("#2F6A30"),
    lampPost: dm("#2F3A33"),
    lampHead: dm("#3E4A42"),
    lampGlow: lit || style === "rain" ? "#FFE49A" : dm("#C9D6DD"),
    kioskBody: dm("#2E6B57"),
    kioskRoof: dm("#B24A32"),
    kioskSign: dm("#F2E3B3"),
    kioskText: dm("#7A2E1E"),
    kioskWin: dm("#9CC4D6"),
    metal: dm("#3A3F44"),
    metalDark: dm("#22262A"),
    cycloSeat: dm("#B24A32"),
    rider: dm("#7A5A44"),
    nonLa: dm("#E9D9A6"),
    vespa: dm("#7FB7A6"),
    shopBody: dm("#5A4A3A"),
    shopSign: style === "night" ? "#C8102E" : dm("#C8102E"),
    shopText: "#FFE49A",
    shopWin: style === "night" ? "#FFD98A" : dm("#9CC4D6"),
    coco: dm("#6E8B2E"),
    stall: dm("#6B4A2E"),
    umbrella: dm("#2E6BB0"),
    rock: dm("#B4471F"),
    rockLine: dm("#8E3517"),
    farHill: dm(style === "coast" ? "#6F8F5A" : "#C2704A"),
    sea: dm("#1F6E9A"),
    stack: dm("#D8B47A"),
    cliff: dm("#B89660"),
    tuft: dm("#C9B24E"),
    snag: dm("#9A8E80"),
    shrub: dm("#5E7D4A"),
    shrubDark: dm("#3E5A36"),
    bldA: dm("#4E6878"),
    win: night ? "#FFD98A" : dm("#B4D3E2"),
    glassStop: dm("#9CC4D6"),
    lampC: lit ? "#FFE49A" : dm("#C9D6DD"),
    nA: "#5FD4F0",
    nB: "#FBB040"
  };
  const ground = isNeon ? "#01060B" : dm({ center: "#8C9396", night: "#3A4048", mekong: "#7B8C4A", rain: "#5F676C", outback: "#B5502A", coast: "#7A9A5A", city: "#8E989E" }[style]);
  const road = isNeon ? "#000306" : dm(style === "rain" ? "#2C3236" : style === "outback" ? "#3D3A38" : "#4A4F54");
  return {
    col,
    skyTop: sky[0],
    skyLow: sky[1],
    ground,
    road,
    edgeC: isNeon ? "#FBB040" : "#ECEFF1",
    sunLeft: sunP[0],
    sunTop: sunP[1],
    sunColor: isNeon ? "transparent" : sunP[2],
    sunOp: isNeon || ph === "rain" ? 0 : 1,
    sunGlow: nightish ? "rgba(243,235,210,0.35)" : "rgba(255,190,110,0.5)",
    starOp: nightish ? 1 : 0,
    beamOp: nightish ? 0.12 : ph === "dusk" || ph === "rain" ? 0.06 : 0,
    laneC: isNeon ? "#CFF6FF" : "#F2F4F5",
    laneGlow: isNeon ? "0 0 12px #5FD4F0" : "none",
    glow: isNeon ? "tc-glow" : "",
    rainOn: style === "rain"
  };
};
const SCMAP = { sgcenter: "center", sgnight: "night", mekong: "mekong", rain: "rain", outback: "outback", coast: "coast", melb: "city", neonau: "neon" };
let SCSTARS = "";
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { intro: "splash", now: /* @__PURE__ */ new Date(), lang: "vi", picker: false, scenery: null, weather: null, season: null, phase: null, sort: "custom", listening: false, stage: null, runId: null };
  }
  componentDidMount() {
    this.timer = setInterval(() => this.setState({ now: /* @__PURE__ */ new Date() }), 15e3);
    this.introTimer = setTimeout(() => {
      if (this.state.intro === "splash") {
        this.setState({ intro: "about" });
        this.introTimer = setTimeout(() => {
          if (this.state.intro === "about") this.setState({ intro: null });
        }, 6e3);
      }
    }, 4500);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    clearTimeout(this.introTimer);
    clearTimeout(this.coverTimer);
  }
  renderVals() {
    var _a;
    const self = this;
    const vi = this.state.lang === "vi";
    const L = {
      vi: { ready: "S\u1EB5n S\xE0ng", screen: "DeX \xB7 M\xE0n H\xECnh Xe", langLabel: "\u0110\u1ED5i Sang Ti\u1EBFng Anh", night: "Ban \u0110\xEAm", tryScene: "Th\u1EED C\u1EA3nh", addWs: "Th\xEAm Workspace", settings: "C\xE0i \u0110\u1EB7t", sort: "S\u1EAFp X\u1EBFp", default: "M\u1EB7c \u0110\u1ECBnh", more: "Th\xEAm L\u1EF1a Ch\u1ECDn", launch: "M\u1EDF Workspace", edit: "S\u1EEDa Workspace", mic: "Tr\u1EE3 L\xFD Gi\u1ECDng N\xF3i", song: "[T\xEAn B\xE0i H\xE1t]", artist: "[Ca S\u0129]", prev: "B\xE0i Tr\u01B0\u1EDBc", play: "Ph\xE1t", next: "B\xE0i K\u1EBF", vol: "\xC2m L\u01B0\u1EE3ng", realApp: "b\u1EA3n th\u1EADt l\xE0 app th\u1EADt ch\u1EA1y \u1EDF \u0111\xE2y", pickerNote: "B\u1EA3n th\u1EADt t\u1EF1 ch\u1ECDn theo ng\xE0y gi\u1EDD, m\xF9a v\xE0 th\u1EDDi ti\u1EBFt t\u1EA1i v\u1ECB tr\xED GPS. Ch\u1EEF T\u1EF1 \u0110\u1ED9ng \u1EDF \u0111\xE2y d\xF9ng s\u1ED1 li\u1EC7u m\u1EABu.", gScene: "C\u1EA3nh", gWx: "Th\u1EDDi Ti\u1EBFt", gSeason: "M\xF9a", gPhase: "Bu\u1ED5i", auto: "T\u1EF1 \u0110\u1ED9ng", city: "Th\xE0nh Ph\u1ED1", suburb: "Ngo\u1EA1i \xD4", country: "\u0110\u1ED3ng Qu\xEA", clear: "N\u1EAFng", clearNight: "Tr\u1EDDi Trong", cloudy: "Nhi\u1EC1u M\xE2y", rain: "M\u01B0a", storm: "Gi\xF4ng B\xE3o", fog: "S\u01B0\u01A1ng M\xF9", summer: "M\xF9a H\xE8", autumn: "M\xF9a Thu", winter: "M\xF9a \u0110\xF4ng", spring: "M\xF9a Xu\xE2n", dawn: "B\xECnh Minh", day: "Ban Ng\xE0y", dusk: "Ho\xE0ng H\xF4n", nightP: "Ban \u0110\xEAm", custom: "T\u1EF1 S\u1EAFp", recent: "G\u1EA7n \u0110\xE2y", az: "T\xEAn A\u2013Z", listenTitle: "\u0110ang nghe\u2026", listenHint: "V\xED d\u1EE5: \u201Cm\u1EDF Workspace \u0110i Xa\u201D, \u201Cto l\xEAn\u201D, \u201Cv\u1EC1 nh\xE0\u201D", idleTitle: "N\xF3i \u201CHey Tom\u201D ho\u1EB7c \u201CHi Tom\u201D", idleHints: ["\u201CHey Tom, m\u1EDF Workspace \u0110i L\xE0m\u201D", "\u201CHi Tom, ch\u1EC9 \u0111\u01B0\u1EDDng b\u1EB1ng Waze t\u1EDBi Bunnings\u201D", "\u201CHey Tom, \u0111\u1ECDc tin nh\u1EAFn\u201D", "\u201CHey Tom, nhi\u1EC7t \u0111\u1ED9 m\xE1y bao nhi\xEAu?\u201D"], opening: "\u0110ang m\u1EDF Workspace", count: " Workspace", ws1: "\u0110i L\xE0m", ws2: "\u0110i Xa", ws3: "\u0110i L\u1EAFp Camera", a1: "T2\u2013T6 \xB7 7:00", a2: "Cu\u1ED1i Tu\u1EA7n", a3: "M\u1EDF B\u1EB1ng Tay", e1: ["D\u1EABn \u0110\u01B0\u1EDDng: Ch\u1ED7 L\xE0m", "\xC2m L\u01B0\u1EE3ng 40%", "Playlist Bu\u1ED5i S\xE1ng"], e2: ["Radio \xDAc / VN", "\xC2m L\u01B0\u1EE3ng 55%", "\u0110\u1ED9 S\xE1ng T\u1EF1 \u0110\u1ED9ng"], e3: ["D\u1EABn \u0110\u01B0\u1EDDng: Kh\xE1ch K\u1EBF Ti\u1EBFp", "\xC2m L\u01B0\u1EE3ng 30%"] },
      en: { ready: "Ready", screen: "DeX \xB7 Car Screen", langLabel: "Switch To Vietnamese", night: "Night Mode", tryScene: "Try Scenes", addWs: "Add Workspace", settings: "Settings", sort: "Sort", default: "Default", more: "More Options", launch: "Open Workspace", edit: "Edit Workspace", mic: "Voice Assistant", song: "[Song Title]", artist: "[Artist]", prev: "Previous", play: "Play", next: "Next", vol: "Volume", realApp: "the real app runs here", pickerNote: "The real app picks the scene from the date, time, season and weather at your GPS location. Auto here uses sample data.", gScene: "Scenery", gWx: "Weather", gSeason: "Season", gPhase: "Time Of Day", auto: "Auto", city: "City", suburb: "Suburb", country: "Country", clear: "Sunny", clearNight: "Clear", cloudy: "Cloudy", rain: "Rain", storm: "Storm", fog: "Fog", summer: "Summer", autumn: "Autumn", winter: "Winter", spring: "Spring", dawn: "Dawn", day: "Day", dusk: "Dusk", nightP: "Night", custom: "Custom", recent: "Recent", az: "Name A\u2013Z", listenTitle: "Listening\u2026", listenHint: "Try: \u201Copen Workspace Road Trip\u201D, \u201Cvolume up\u201D, \u201Cnavigate home\u201D", idleTitle: "Say \u201CHey Tom\u201D or \u201CHi Tom\u201D", idleHints: ["\u201CHey Tom, open Workspace Commute\u201D", "\u201CHi Tom, navigate to Bunnings with Waze\u201D", "\u201CHey Tom, read my messages\u201D", "\u201CHey Tom, what is the engine temperature?\u201D"], opening: "Opening Workspace", count: " Workspaces", ws1: "Commute", ws2: "Road Trip", ws3: "Install Job", a1: "Mon\u2013Fri \xB7 7:00", a2: "Weekends", a3: "Manual", e1: ["Navigate: Work", "Volume 40%", "Morning Playlist"], e2: ["AU / VN Radio", "Volume 55%", "Auto Brightness"], e3: ["Navigate: Next Customer", "Volume 30%"] }
    };
    const t0 = vi ? L.vi : L.en;
    const MD = this.state.live && this.state.live.media;
    const t = MD && MD.title ? Object.assign({}, t0, { song: MD.title, artist: MD.artist || "" }) : t0;
    const now = this.state.now;
    const pad = (n) => String(n).padStart(2, "0");
    const pick = (k, d) => {
      var _a2, _b;
      return (_b = (_a2 = this.state[k]) != null ? _a2 : this.props[k]) != null ? _b : d;
    };
    const scenery = pick("scenery", "city");
    const wxSel = pick("weather", "auto");
    const seSel = pick("season", "auto");
    const phSel = pick("phase", "auto");
    const m = now.getMonth() + 1;
    const autoSeason = m === 12 || m <= 2 ? "summer" : m <= 5 ? "autumn" : m <= 8 ? "winter" : "spring";
    const autoWx = ["clear", "cloudy", "rain", "clear", "cloudy", "storm", "fog"][now.getDate() % 7];
    const sun = [[6.1, 20.7], [6.6, 20.3], [7.2, 19.7], [6.8, 17.9], [7.2, 17.3], [7.5, 17.1], [7.5, 17.3], [7, 17.8], [6.3, 18.2], [6.5, 19.7], [6, 20.2], [5.9, 20.6]][m - 1];
    const hr = now.getHours() + now.getMinutes() / 60;
    const autoPhase = hr >= sun[0] - 0.5 && hr < sun[0] + 0.75 ? "dawn" : hr >= sun[0] + 0.75 && hr < sun[1] - 0.75 ? "day" : hr >= sun[1] - 0.75 && hr < sun[1] + 0.5 ? "dusk" : "night";
    const season = seSel === "auto" ? autoSeason : seSel;
    const wx = wxSel === "auto" ? this.state.live && this.state.live.wx && this.state.live.wx.code || autoWx : wxSel;
    const phase = phSel === "auto" ? autoPhase : phSel;
    const night = phase === "night";
    const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const mix = (a, b, k) => {
      const A2 = hx(a), B = hx(b);
      return "#" + A2.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join("");
    };
    const dim = { day: 0, dawn: 0.28, dusk: 0.38, night: 0.74 }[phase];
    const wg = { clear: 0, cloudy: 0.1, rain: 0.22, storm: 0.34, fog: 0.26 }[wx];
    const wgc = wx === "fog" ? "#C8D0D4" : "#7E8A92";
    const ap = (c) => mix(mix(c, wgc, wg), "#0A1622", dim);
    const skyBase = { day: ["#7FC1E6", "#BCE2F2"], dawn: ["#7E9FC4", "#F4BE98"], dusk: ["#4D5A8A", "#EE9A6C"], night: ["#061727", "#0E2840"] }[phase];
    const wxSky = { clear: null, cloudy: ["#9AA7B0", 0.55], rain: ["#6E7B85", 0.72], storm: ["#3D4751", 0.85], fog: ["#C9D1D5", 0.78] }[wx];
    const skyC = (c) => wxSky ? mix(c, mix(wxSky[0], "#0A1622", dim), wxSky[1]) : c;
    const S = {
      summer: { verge: "#B9A85E", leaf: "#4F7D3A", leaf2: "#648F45", leafOp: 1, blossom: "#F2C14E", blossomOp: 0, hillFar: "#A9A06A", hillNear: "#C2B673", gum: "#6E8462", fall: "#C9A64B" },
      autumn: { verge: "#8E9B5A", leaf: "#D9822B", leaf2: "#B5502A", leafOp: 1, blossom: "#E8B04A", blossomOp: 0, hillFar: "#8FA27A", hillNear: "#A6B07A", gum: "#6B8565", fall: "#D9822B" },
      winter: { verge: "#6E8F6A", leaf: "#4F6B4A", leaf2: "#4F6B4A", leafOp: 0, blossom: "#FFFFFF", blossomOp: 0, hillFar: "#7F9C88", hillNear: "#6F9775", gum: "#5E7D5C", fall: "#8A7B6B" },
      spring: { verge: "#6FAF5C", leaf: "#5FA04A", leaf2: "#7DBA5B", leafOp: 1, blossom: "#9B7FD1", blossomOp: 1, hillFar: "#7FB089", hillNear: "#6FA866", gum: "#6C8C62", fall: "#A68AD8" }
    }[season];
    const LV = this.state.live || null;
    const LOB = LV && LV.obd;
    const speed = this.state.spd != null ? this.state.spd : LV ? LV.speed == null ? 0 : Math.round(LV.speed) : Number((_a = this.props.speed) != null ? _a : 60);
    const moving = speed > 0;
    const sec = (k) => moving ? k / speed : 1;
    const objS = sec(150), laneS = sec(42);
    const wet = wx === "rain" || wx === "storm";
    const sunPos = { day: ["76%", "6%", "#FFD27A"], dawn: ["14%", "24%", "#FFB36B"], dusk: ["72%", "26%", "#FF9A5A"], night: ["78%", "5%", "#F3EBD2"] }[phase];
    const sunOp = { clear: 1, cloudy: 0.45, rain: 0, storm: 0, fog: 0.35 }[wx];
    let temp = { summer: 27, autumn: 17, winter: 11, spring: 20 }[season];
    temp += { clear: 0, cloudy: -1, rain: -3, storm: -2, fog: -4 }[wx] + { day: 0, dawn: -4, dusk: -2, night: -6 }[phase];
    if (this.state.live && this.state.live.wx && this.state.live.wx.temp != null) temp = Math.round(this.state.live.wx.temp);
    const icons = {
      sun: "M12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
      moon: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z",
      cloudy: "M7 18h10a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.5A3.5 3.5 0 0 0 7 18z",
      rain: "M7 15h10a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.5A3.5 3.5 0 0 0 7 15zM8 18l-1 3M12 18l-1 3M16 18l-1 3",
      storm: "M7 14h10a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.5A3.5 3.5 0 0 0 7 14zM13 15l-3 4h4l-3 4",
      fog: "M4 7h16M3 11h18M5 15h14M7 19h10"
    };
    const A = {
      maps: { name: "Maps", color: "#48B0C8", icon: "M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zM12 8a2 2 0 1 0 0 4a2 2 0 1 0 0-4z" },
      yt: { name: "YouTube", color: "#E5484D", icon: "M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM10 9l5 3-5 3z" },
      music: { name: "Tom's Jukebox", color: "#FBB040", icon: "M9 18V5l11-2v13M6 15a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM17 13a3 3 0 1 0 0 6a3 3 0 1 0 0-6z" },
      waze: { name: "Waze", color: "#8FD6F2", icon: "M3 11l18-8-8 18-2-8z" },
      shield: { name: "Tom's Shield", color: "#7BD88F", icon: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" }
    };
    const defs = [
      { id: 1, name: t.ws1, color: "#FBB040", isDefault: true, auto: t.a1, recent: 2, apps: [["maps", 60], ["music", 40]], extras: t.e1 },
      { id: 2, name: t.ws2, color: "#48B0C8", isDefault: false, auto: t.a2, recent: 1, apps: [["maps", 50], ["yt", 25], ["music", 25]], extras: t.e2 }
    ];
    const sorted = defs.slice();
    if (this.state.sort === "recent") sorted.sort((a, b) => a.recent - b.recent);
    if (this.state.sort === "az") sorted.sort((a, b) => a.name.localeCompare(b.name, vi ? "vi" : "en"));
    const mkApps = (d) => d.apps.map(([k, f]) => ({ ...A[k], flex: f, pct: f }));
    const workspaces = sorted.map((d) => ({
      name: d.name,
      color: d.color,
      isDefault: d.isDefault,
      auto: d.auto,
      extras: d.extras,
      trip: d.id === 2,
      openTrip: () => self.setState({ tab: "rt" }),
      border: d.isDefault ? "rgba(251,176,64,0.75)" : "rgba(72,176,200,0.25)",
      apps: mkApps(d),
      launch: () => {
        if (d.id === 2) {
          self.setState({ tab: "rt" });
          return;
        }
        clearTimeout(self.coverTimer);
        self.setState({ stage: "cover", runId: d.id });
        self.coverTimer = setTimeout(() => {
          if (window.TCN) {
            self.setState({ stage: null });
            window.TCN.call("launch", JSON.stringify(d.apps));
          } else self.setState({ stage: "run" });
        }, 1900);
      }
    }));
    const runDef = defs.find((d) => d.id === this.state.runId);
    const sorts = ["custom", "recent", "az"].map((k) => ({
      label: t[k],
      pressed: this.state.sort === k ? "true" : "false",
      bg: this.state.sort === k ? "#FBB040" : "transparent",
      fg: this.state.sort === k ? "#2A1A00" : "#CFE6EE",
      pick: () => self.setState({ sort: k })
    }));
    const opt = (key, values, current) => values.map((v) => ({
      label: t[v === "night" ? "nightP" : v],
      pressed: current === v ? "true" : "false",
      bg: current === v ? "#FBB040" : "#0D2C40",
      fg: current === v ? "#2A1A00" : "#E8F1F5",
      pick: () => self.setState({ [key]: v })
    }));
    const pickerGroups = [
      { label: t.gScene, options: opt("scenery", ["city", "suburb", "country"], scenery) },
      { label: t.gWx, options: opt("weather", ["auto", "clear", "cloudy", "rain", "storm", "fog"], wxSel) },
      { label: t.gSeason, options: opt("season", ["auto", "summer", "autumn", "winter", "spring"], seSel) },
      { label: t.gPhase, options: opt("phase", ["auto", "dawn", "day", "dusk", "night"], phSel) }
    ];
    const rpm = LOB && LOB.rpm != null ? Math.round(LOB.rpm) : LV ? 0 : moving ? 900 + speed * 22 : 750;
    const lanes = {}, objs = {};
    const hlS = moving ? 22 / speed : 1;
    for (let i = 0; i < 8; i++) objs["hlDelay" + i] = (-(i * hlS) / 8).toFixed(2) + "s";
    for (let i = 0; i < 4; i++) {
      lanes["laneDelay" + i] = (-(i * laneS) / 4).toFixed(2) + "s";
      objs["objDelay" + i] = (-(i * objS) / 4).toFixed(2) + "s";
    }
    return Object.assign({
      ...(() => {
        const intro = this.state.intro;
        const hr2 = now.getHours();
        const greet = vi ? hr2 < 11 ? "Ch\xE0o bu\u1ED5i s\xE1ng, Tom" : hr2 < 18 ? "Ch\xE0o bu\u1ED5i chi\u1EC1u, Tom" : "Ch\xE0o bu\u1ED5i t\u1ED1i, Tom" : hr2 < 12 ? "Good morning, Tom" : hr2 < 18 ? "Good afternoon, Tom" : "Good evening, Tom";
        const steps = [["splash", vi ? "1 \xB7 M\xE0n H\xECnh Ch\xE0o" : "1 \xB7 Splash"], ["about", vi ? "2 \xB7 Gi\u1EDBi Thi\u1EC7u" : "2 \xB7 About"], [null, vi ? "3 \xB7 M\xE0n H\xECnh Ch\xEDnh" : "3 \xB7 Home"]];
        return {
          introSplash: intro === "splash",
          introAbout: intro === "about",
          introStepOn: true,
          introSteps: steps.map(([k, lab]) => ({ label: lab, on: intro === k ? "true" : "false", bg: intro === k ? "#FBB040" : "rgba(255,255,255,0.1)", fg: intro === k ? "#2A1A00" : "#E8F1F5", pick: () => self.setState({ intro: k }) })),
          introLine: vi ? "M\xE0n h\xECnh xe \xB7 Tr\u1EE3 l\xFD gi\u1ECDng n\xF3i Vi\u1EC7t\u2013Anh \xB7 Workspace \xB7 Road Trip \xB7 D\u1EEF li\u1EC7u xe OBD-II" : "Car screen \xB7 Vietnamese\u2013English voice assistant \xB7 Workspaces \xB7 Road Trip \xB7 OBD-II car data",
          introGreet: greet + (vi ? " \u2014 ch\xFAc chuy\u1EBFn \u0111i vui v\u1EBB" : " \u2014 have a good drive"),
          introStatus: vi ? 'GPS \u2713 \xB7 Bluetooth xe \u2713 \xB7 OBD-II \u0111ang n\u1ED1i\u2026 \xB7 Workspace "\u0110i L\xE0m" s\u1EB5n s\xE0ng' : 'GPS \u2713 \xB7 Car Bluetooth \u2713 \xB7 OBD-II connecting\u2026 \xB7 Workspace "Commute" ready',
          introVer: (vi ? "Phi\xEAn B\u1EA3n " : "Version ") + "0.9.0-beta",
          introBtnAbout: vi ? "Gi\u1EDBi Thi\u1EC7u" : "About",
          introBtnMain: vi ? "V\xE0o M\xE0n H\xECnh Ch\xEDnh" : "Go To Home",
          introToAbout: () => self.setState({ intro: "about" }),
          introToMain: () => self.setState({ intro: null }),
          introReplay: () => self.setState({ intro: "splash", introRun: (self.state.introRun || 0) + 1 }),
          aboutTitle: vi ? "Gi\u1EDBi Thi\u1EC7u" : "About",
          aboutDesc: vi ? "Tom's Car bi\u1EBFn \u0111i\u1EC7n tho\u1EA1i (Samsung DeX hay Android) th\xE0nh m\xE0n h\xECnh xe: \u0111i\u1EC1u khi\u1EC3n b\u1EB1ng gi\u1ECDng n\xF3i ti\u1EBFng Vi\u1EC7t v\xE0 ti\u1EBFng Anh, Workspace m\u1EDF s\u1EB5n b\u1EA3n \u0111\u1ED3 v\xE0 nh\u1EA1c, ch\u1EBF \u0111\u1ED9 Road Trip, \u0111\u1ED3ng h\u1ED3 theo th\u1EDDi gian th\u1EF1c t\u1EEB GPS v\xE0 OBD-II." : "Tom's Car turns your phone (Samsung DeX or Android) into a car screen: Vietnamese and English voice control, Workspaces with maps and music ready, Road Trip mode, and live gauges from GPS and OBD-II.",
          aboutIdeaL: vi ? "\xDD T\u01B0\u1EDFng / Idea" : "Idea",
          aboutBuiltL: vi ? "X\xE2y D\u1EF1ng B\u1EDFi / Built by" : "Built by",
          aboutCreditsL: vi ? "NGU\u1ED2N D\u1EEE LI\u1EC6U & GHI C\xD4NG" : "DATA & CREDITS",
          aboutCredits: [
            vi ? "B\u1EA3n \u0111\u1ED3: \xA9 OpenStreetMap contributors" : "Maps: \xA9 OpenStreetMap contributors",
            vi ? "Th\u1EDDi ti\u1EBFt: Open-Meteo" : "Weather: Open-Meteo",
            vi ? "Camera giao th\xF4ng: d\u1EEF li\u1EC7u ch\xEDnh th\u1EE9c SA v\xE0 VIC" : "Road cameras: official SA and VIC data",
            vi ? 'Bi\u1EC3n W5-29: "Australia road sign W5-29.svg", Wikimedia Commons, CC BY 3.0 AU' : 'W5-29 sign: "Australia road sign W5-29.svg", Wikimedia Commons, CC BY 3.0 AU',
            vi ? "Ph\xF4ng ch\u1EEF: Overpass (SIL OFL)" : "Font: Overpass (SIL OFL)"
          ],
          aboutTm: vi ? "Waze, Google Maps, HERE WeGo, Samsung DeX v\xE0 Android l\xE0 nh\xE3n hi\u1EC7u c\u1EE7a c\xE1c c\xF4ng ty s\u1EDF h\u1EEFu." : "Waze, Google Maps, HERE WeGo, Samsung DeX and Android are trademarks of their respective owners.",
          aboutReplay: vi ? "Xem L\u1EA1i M\xE0n Ch\xE0o" : "Replay Splash",
          aboutFeedback: vi ? "G\xF3p \xDD" : "Feedback",
          aboutClose: vi ? "V\xE0o M\xE0n H\xECnh Ch\xEDnh" : "Go To Home"
        };
      })(),
      ...(() => {
        var _a2, _b, _c;
        const sel = (_a2 = this.state.theme) != null ? _a2 : "neon";
        const cp = (_b = this.state.cockpit) != null ? _b : "neon";
        const auto = (_c = this.state.autoTheme) != null ? _c : false;
        const G = [
          { label: vi ? "KI\u1EC2U CH\xCDNH" : "MAIN STYLES", items: [["neon", vi ? "Neon (\u0111ang d\xF9ng)" : "Neon (current)", "linear-gradient(135deg,#02070D,#0B3A55 60%,#FBB040)"], ["glass", vi ? "K\xEDnh M\u1EDD" : "Frosted Glass", "linear-gradient(135deg,#7FA9C9,#E8F1F5)"], ["hud", vi ? "T\u1ED1i Gi\u1EA3n (HUD)" : "Minimal HUD", "linear-gradient(135deg,#000,#1E2A33)"], ["plane", vi ? "Bu\u1ED3ng L\xE1i M\xE1y Bay" : "Aircraft Cockpit", "linear-gradient(135deg,#1C2B22,#3E5A36)"], ["synth", "Synthwave 80s", "linear-gradient(135deg,#2A0B45,#E5487D 60%,#FBB040)"], ["cyber", vi ? "Th\xE0nh Ph\u1ED1 \u0110\xEAm" : "Cyberpunk", "linear-gradient(135deg,#0A0F2A,#00E5FF 70%,#FF3EA5)"], ["rally", vi ? "Th\u1EC3 Thao (Rally)" : "Rally", "linear-gradient(135deg,#1A1A1A,#C8102E)"], ["relax", vi ? "Th\u01B0 Gi\xE3n" : "Relax", "linear-gradient(135deg,#9FD3C7,#F4E9D8)"]] },
          { label: vi ? "THU\u1EA6N \xDAC" : "AUSSIE", items: [["outback", "Outback", "linear-gradient(180deg,#3F95D0,#9FD3EE 45%,#B5502A 46%)", 5], ["coast", vi ? "Ven Bi\u1EC3n" : "Coast Road", "linear-gradient(180deg,#4FA6DA,#BFE3F2 45%,#1F6E9A 46%)", 5], ["melb", vi ? "Melbourne (tram)" : "Melbourne (tram)", "linear-gradient(180deg,#7FA9C9,#C9DDE8 45%,#2F8F5B 46%)", 5], ["neonau", vi ? "Neon \xDAc" : "Neon Aussie", "linear-gradient(180deg,#02070D,#0B2338 45%,#FBB040 46%,#01060B 50%)", 5], ["dandenong", vi ? "R\u1EEBng Dandenong" : "Dandenongs", "linear-gradient(180deg,#6E9A7A,#2F5A3A)"], ["yarra", "Yarra Valley", "linear-gradient(180deg,#9FC7E0,#7B8C3A 50%,#5E2A3A)"], ["snow", vi ? "N\xFAi Tuy\u1EBFt" : "Alpine Snow", "linear-gradient(180deg,#BFD8E8,#FFFFFF 55%,#6E8F9E)"]] },
          { label: vi ? "MI\u1EC0N NAM" : "SOUTHERN VIETNAM", items: [["sgcenter", vi ? "Trung T\xE2m (\u0110\u1EE9c B\xE0)" : "Downtown Saigon", "linear-gradient(180deg,#5FA8DC,#CFE6F2 45%,#B24A32 46%)", 7], ["sgnight", vi ? "S\xE0i G\xF2n V\u1EC1 \u0110\xEAm" : "Saigon Night", "linear-gradient(180deg,#050B1C,#162A4A 60%,#FFD98A)", 7], ["mekong", vi ? "Mi\u1EC1n T\xE2y" : "Mekong Delta", "linear-gradient(180deg,#69B4E0,#DCEFE8 45%,#7C6A44 46%)", 7], ["rain", vi ? "M\u01B0a Chi\u1EC1u" : "Afternoon Rain", "linear-gradient(180deg,#56636C,#8C979D)", 7], ["benthanh", vi ? "Ch\u1EE3 B\u1EBFn Th\xE0nh" : "Ben Thanh Market", "linear-gradient(180deg,#E8B04A,#7A2E1E)"], ["sgold", vi ? "S\xE0i G\xF2n X\u01B0a" : "Old Saigon", "linear-gradient(180deg,#D9C79A,#7A5A3A)"], ["coffee", vi ? "C\xE0 Ph\xEA S\xE1ng" : "Morning Coffee", "linear-gradient(180deg,#F4D9B0,#6B4A2E)"], ["tet", vi ? "T\u1EBFt Mi\u1EC1n Nam" : "Southern T\u1EBFt", "linear-gradient(180deg,#C8102E,#FBD000)"]] }
        ];
        const groups = G.map((g) => ({ label: g.label, items: g.items.map(([k, lab, sw, board]) => ({
          label: lab,
          sw,
          on: sel === k ? "true" : "false",
          ring: sel === k ? "inset 0 0 0 3px #FBB040, 0 0 12px rgba(251,176,64,0.5)" : "inset 0 0 0 1px rgba(255,255,255,0.25)",
          tag: board || k === "neon" ? vi ? "Xem \u0110\u01B0\u1EE3c" : "Live" : vi ? "Khi Build" : "At Build",
          tagBg: board || k === "neon" ? "#7BD88F" : "#CFE6EE",
          tagOp: 1,
          pick: () => self.setState({ theme: k })
        })) }));
        return {
          themeOpen: !!this.state.themeOpen,
          themeExpanded: this.state.themeOpen ? "true" : "false",
          themeToggle: () => self.setState({ themeOpen: !self.state.themeOpen }),
          themeBtn: vi ? "Giao Di\u1EC7n" : "Themes",
          themeDone: vi ? "Xong" : "Done",
          themeCockpitL: vi ? "BU\u1ED2NG L\xC1I" : "COCKPIT",
          themeCockpits: [["neon", "Neon"], ["real", vi ? "Th\u1EADt" : "Realistic"]].map(([k, lab]) => ({ label: lab, on: cp === k ? "true" : "false", bg: cp === k ? "#FBB040" : "#0D2C40", fg: cp === k ? "#2A1A00" : "#E8F1F5", pick: () => self.setState({ cockpit: k }) })),
          themeAutoL: vi ? "T\u1EF0 \u0110\u1ED4I THEO GI\u1EDC" : "AUTO BY TIME",
          themeAutoOn: auto ? "true" : "false",
          themeAutoTxt: auto ? vi ? "M\u1EDF" : "On" : vi ? "T\u1EAFt" : "Off",
          themeAutoBg: auto ? "#FBB040" : "#0D2C40",
          themeAutoFg: auto ? "#2A1A00" : "#E8F1F5",
          themeAutoToggle: () => self.setState({ autoTheme: !auto }),
          themeGroups: groups,
          gaugeL: vi ? "\u0110\u1ED2NG H\u1ED2" : "GAUGES",
          gaugeOpts: [["neon", vi ? "Neon" : "Neon"], ["classic", vi ? "C\u1ED5 \u0110i\u1EC3n" : "Classic"], ["bar", vi ? "Thanh Ngang" : "Bars"], ["minimal", vi ? "T\u1ED1i Gi\u1EA3n" : "Minimal"], ["rings", vi ? "V\xF2ng L\u1ED3ng" : "Rings"], ["rally", "Rally"], ["retro", vi ? "Retro X\u01B0a" : "Retro"]].map(([k, lab]) => {
            var _a3;
            const gs = (_a3 = this.state.gauge) != null ? _a3 : "neon";
            return { label: lab, on: gs === k ? "true" : "false", bg: gs === k ? "#FBB040" : "#0D2C40", fg: gs === k ? "#2A1A00" : "#E8F1F5", pick: () => self.setState({ gauge: k }) };
          }),
          g: (() => {
            var _a3;
            const gs = (_a3 = this.state.gauge) != null ? _a3 : "neon";
            const sp = speed, r = rpm, lim = LV ? 999 : 60;
            const circ = (rad, frac) => (2 * Math.PI * rad * Math.max(0, Math.min(1, frac))).toFixed(1) + " 400";
            const lit = Math.round(10 * Math.min(r / 6e3, 1));
            const o = {
              on: gs !== "neon",
              classic: gs === "classic",
              bar: gs === "bar",
              minimal: gs === "minimal",
              rings: gs === "rings",
              rally: gs === "rally",
              retro: gs === "retro",
              aria: vi ? "\u0110\u1ED3ng h\u1ED3 xe" : "Gauges",
              spdA: (-120 + 240 * Math.min(sp / 160, 1)).toFixed(1),
              rpmA: (-120 + 240 * Math.min(r / 7e3, 1)).toFixed(1),
              retA: (180 * Math.min(sp / 160, 1)).toFixed(1),
              retR: (180 * 0.55).toFixed(1),
              spdC: sp > lim ? "#FBB040" : "#E8F1F5",
              rpmW: (220 * Math.min(r / 7e3, 1)).toFixed(0),
              r1: circ(38, sp / 160),
              r2: circ(28, r / 7e3),
              r3: circ(18, 0.42),
              trip: (vi ? "Chuy\u1EBFn \u0111i " : "Trip ") + "42.6 km",
              odo: "ODO 128,450 km",
              odoN: "128450",
              tempL: vi ? "Nhi\u1EC7t M\xE1y 88\xB0C" : "Coolant 88\xB0C",
              fuelL: vi ? "X\u0103ng 70%" : "Fuel 70%",
              tempS: vi ? "Nhi\u1EC7t 88\xB0" : "Temp 88\xB0",
              fuelS: vi ? "X\u0103ng 70%" : "Fuel 70%",
              watch: "00:42:18",
              watchL: vi ? "B\u1EA4M GI\u1EDC CH\u1EB6NG" : "STAGE TIMER"
            };
            for (let i = 0; i < 10; i++) o["sl" + i] = i < lit ? i < 5 ? "#7BD88F" : i < 8 ? "#FBD000" : "#E5484D" : "#1E2226";
            return o;
          })(),
          scOn: !!SCMAP[sel],
          sc: (() => {
            const st = SCMAP[sel];
            if (!st) return { horizon: [], water: [], objs: [], lanes: [] };
            const P = SCPAL(st, phase, night, dim, mix);
            const od = [0, 1, 2, 3].map((i) => objs["objDelay" + i]);
            const S2 = SCN(st, P.col, od);
            const ps = moving ? "running" : "paused";
            if (!SCSTARS) {
              let s = 7, r = () => (s = s * 16807 % 2147483647) / 2147483647, a = [];
              for (let i = 0; i < 70; i++) a.push(Math.round(r() * 1280) + "px " + Math.round(r() * 280) + "px 0 " + (r() < 0.3 ? 1 : 0) + "px rgba(243,246,255," + (0.4 + r() * 0.55).toFixed(2) + ")");
              SCSTARS = a.join(", ");
            }
            return Object.assign({}, P, {
              stars: SCSTARS,
              horizon: S2.horizon,
              water: S2.water,
              objs: S2.objs.map((o) => Object.assign(o, { dur: objS.toFixed(2) + "s", ps, left: -o.w / 2 + "px" })),
              lanes: [0, 1, 2, 3].map((i) => ({ dur: laneS.toFixed(2) + "s", delay: lanes["laneDelay" + i], ps, c: P.laneC, glow: P.laneGlow }))
            });
          })(),
          themeNote: vi ? (cp === "real" ? "Bu\u1ED3ng L\xE1i Th\u1EADt: trong b\u1EA3n m\u1EABu xem \u1EDF b\u1EA3ng 2, khi build s\u1EBD \u0111\u1ED5i \u0111\u01B0\u1EE3c t\u1EA1i \u0111\xE2y. " : "") + 'Ki\u1EC3u c\xF3 nh\xE3n "Xem \u0110\u01B0\u1EE3c" \u0111\u1ED5i c\u1EA3nh ngay b\xEAn ngo\xE0i k\xEDnh; ki\u1EC3u "Khi Build" s\u1EBD c\xF3 khi build app.' : 'Preview: picking here only marks the choice. Styles tagged "Demo board 5/7" can be viewed on that board; Realistic cockpit is board 2. In the real app it switches instantly.'
        };
      })(),
      t,
      speed,
      clock: pad(now.getHours()) + ":" + pad(now.getMinutes()),
      temp,
      wxIcon: wx === "clear" ? night ? icons.moon : icons.sun : icons[wx],
      wxSun: wx === "clear" && !night,
      wxMoon: wx === "clear" && night,
      wxCloud: wx === "cloudy",
      wxRain: wx === "rain",
      wxStorm: wx === "storm",
      wxFog: wx === "fog",
      wxText: wx === "clear" && night ? t.clearNight : t[wx],
      ...(() => {
        var _a2, _b;
        const S2 = this.state;
        const leg = (_a2 = S2.rtLeg) != null ? _a2 : "go", pi = (_b = S2.rtPos) != null ? _b : 0;
        const GO = [
          { name: "The Flywheel Bar & Cafe", town: "Beaufort VIC", k: "cafe", km: 150, stay: 35 },
          { name: "Pink Lake", town: "Dimboola VIC", k: "lake", km: 330, stay: 15 },
          { name: "Kaniva Windmill", town: "Kaniva VIC", k: "sight", km: 410, stay: 20 },
          { name: "Keith (12810 Dukes Hwy)", town: "Keith SA", k: "fuel", km: 480, stay: 15 },
          { name: "Coonalpyn Silo Mural", town: "Coonalpyn SA", k: "sight", km: 535, stay: 15 },
          { name: "Adelaide", town: "SA", k: "end", km: 700 }
        ];
        const BACK = [
          { name: "Tailem Bend", town: "Tailem Bend SA", k: "food", km: 100, stay: 30 },
          { name: "Keith Bakery and Coffee shop", town: "Keith SA", k: "food", km: 215, stay: 20 },
          { name: "McDonald's Horsham", town: "Horsham VIC", k: "food", km: 400, stay: 30 },
          { name: "Melbourne", town: "VIC", k: "end", km: 700 }
        ];
        const list = leg === "go" ? GO : BACK;
        const LT = this.state.live && this.state.live.trip;
        const pos = LT && S2.rtPos == null ? Math.max(0, Math.min(700, Math.round(leg === "go" ? LT.km : 700 - LT.km))) : (leg === "go" ? [135, 420, 640] : [85, 300, 650])[pi];
        const border = leg === "go" ? 445 : 255;
        const baseMin = LT && S2.rtPos == null ? (() => {
          const n = /* @__PURE__ */ new Date();
          return n.getHours() * 60 + n.getMinutes() - pos / 100 * 60 - list.filter((x) => x.km <= pos).reduce((a, x) => a + (x.stay || 0), 0);
        })() : 8 * 60 + 5 + (leg === "go" ? 0 : 30);
        const p2 = (n) => String(n).padStart(2, "0");
        const fmt = (mins, sa) => {
          let m2 = Math.round(mins - (sa ? 30 : 0));
          m2 = (m2 % 1440 + 1440) % 1440;
          return p2(Math.floor(m2 / 60)) + ":" + p2(m2 % 60);
        };
        const timeAt = (km) => baseMin + km / 100 * 60 + list.filter((x) => x.km < km).reduce((a, x) => a + (x.stay || 0), 0);
        const saAt = (km) => leg === "go" ? km >= border : km < border;
        const nowMin = timeAt(pos);
        const nextIdx = list.findIndex((x) => x.km > pos);
        const ICO = { cafe: "M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 4h-2M8 3v3M11 3v3", fuel: "M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M4 20h11M7 8h5M14 9h2l2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3", food: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 0-3 3-3 6s1 3 3 3v9", lake: "M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0M12 4l4 7H8z", sight: "M4 8h4l2-3h4l2 3h4v11H4zM12 11a3 3 0 1 0 0 6a3 3 0 1 0 0-6z", end: "M5 21V4M5 4h11l-2 4 2 4H5" };
        const SIGNC = { cafe: "#1F5FAE", fuel: "#1F5FAE", food: "#1F5FAE", lake: "#6B3E26", sight: "#6B3E26", end: "#00653A" };
        const stops = list.map((x, i) => {
          const done = x.km <= pos, next = i === nextIdx;
          return {
            name: x.name,
            town: x.town,
            icon: ICO[x.k],
            sign: SIGNC[x.k],
            dist: done ? "\u2713" : x.km - pos + " km",
            distC: done ? "#7BD88F" : next ? "#FBB040" : "#E8F1F5",
            eta: (done ? vi ? "\u0110\xE3 gh\xE9 " : "Arrived " : vi ? "D\u1EF1 ki\u1EBFn " : "ETA ") + fmt(timeAt(x.km), saAt(x.km)),
            etaC: done ? "#7BD88F" : next ? "#FFD08A" : "#CFE6EE",
            stay: x.stay ? vi ? "Gh\xE9 " + x.stay + " ph" : x.stay + " min" : vi ? "\u0110i\u1EC3m \u0111\u1EBFn" : "Destination",
            op: done ? 0.55 : 1,
            ring: next ? "0 0 0 3px #FBB040" : "none",
            bg: next ? "rgba(251,176,64,0.12)" : "transparent"
          };
        });
        const nx = list[nextIdx] || list[list.length - 1];
        const X = (km) => (30 + km / 700 * 680).toFixed(1);
        const left = Math.round(timeAt(700) - nowMin);
        const driven = Math.round(nowMin - baseMin - list.filter((x) => x.km <= pos).reduce((a, x) => a + (x.stay || 0), 0));
        const route = list.map((x, i) => ({ x: X(x.km), c: x.km <= pos ? "#7BD88F" : i === nextIdx ? "#FBB040" : "#E8F1F5", r: i === nextIdx ? 9 : 7, lbl: i + 1 + "", lc: x.km <= pos ? "#03111C" : "#03111C" }));
        const rtGo = () => self.setState({ tab: "rt" });
        return {
          tabs: [["main", vi ? "M\xE0n H\xECnh Ch\xEDnh" : "Home"], ["rt", "Road Trip"]].map(([k, label]) => {
            var _a3;
            const on = ((_a3 = S2.tab) != null ? _a3 : "main") === k;
            return { label, on: on ? "true" : "false", bg: on ? "#FBB040" : "rgba(3,17,28,0.85)", fg: on ? "#2A1A00" : "#CFE6EE", pick: () => self.setState({ tab: k }) };
          }),
          rtGo,
          spdUnit: vi ? "km/g" : "km/h",
          rt: {
            on: S2.tab === "rt",
            title: leg === "go" ? "Melbourne \u2192 Adelaide" : "Adelaide \u2192 Melbourne",
            via: vi ? "Theo A8 Western Hwy \xB7 700 km \xB7 Dukes Hwy" : "Via A8 Western Hwy \xB7 700 km \xB7 Dukes Hwy",
            legs: [["go", vi ? "Ch\u1EB7ng \u0110i" : "Outbound"], ["back", vi ? "Ch\u1EB7ng V\u1EC1" : "Return"]].map(([k, label]) => ({ label, on: leg === k ? "true" : "false", bg: leg === k ? "#FBB040" : "#0D2C40", fg: leg === k ? "#2A1A00" : "#E8F1F5", pick: () => self.setState({ rtLeg: k, rtPos: 0 }) })),
            posL: vi ? "TH\u1EEC V\u1ECA TR\xCD" : "TRY POSITION",
            poss: (vi ? ["M\u1EDBi \u0110i", "G\u1EA7n Bi\xEAn Gi\u1EDBi", "S\u1EAFp T\u1EDBi"] : ["Just Left", "Near Border", "Almost There"]).map((label, i) => ({ label, on: pi === i ? "true" : "false", bg: pi === i ? "#FBB040" : "#0D2C40", fg: pi === i ? "#2A1A00" : "#E8F1F5", pick: () => self.setState({ rtPos: i }) })),
            boxes: [[vi ? "Xu\u1EA5t Ph\xE1t" : "Departed", fmt(baseMin, leg !== "go"), leg === "go" ? "VIC" : "SA"], [vi ? "D\u1EF1 Ki\u1EBFn T\u1EDBi N\u01A1i" : "ETA", fmt(timeAt(700), leg === "go"), leg === "go" ? vi ? "gi\u1EDD SA" : "SA time" : "VIC"], [vi ? "C\xF2n L\u1EA1i" : "Remaining", Math.floor(left / 60) + (vi ? " gi\u1EDD " : "h ") + p2(left % 60) + (vi ? " ph" : "m"), 700 - pos + " km"]].map(([l, v, s]) => ({ l, v, s })),
            stops,
            stopsL: vi ? "C\xC1C CH\u1EB6NG GH\xC9" : "STOPS",
            nxL: vi ? "T\u1EDAI K\u1EBE TI\u1EBEP" : "NEXT STOP",
            nxName: nx.name,
            nxTown: nx.town,
            nxIcon: ICO[nx.k],
            nxSign: SIGNC[nx.k],
            nxKm: nx.km - pos + " km",
            nxEta: (vi ? "D\u1EF1 ki\u1EBFn " : "ETA ") + fmt(timeAt(nx.km), saAt(nx.km)) + (saAt(nx.km) && !saAt(pos) ? vi ? " (gi\u1EDD SA)" : " (SA time)" : ""),
            nxStay: nx.stay ? vi ? "Gh\xE9 " + nx.stay + " ph\xFAt" : nx.stay + " min stop" : vi ? "\u0110i\u1EC3m \u0111\u1EBFn" : "Destination",
            navL: vi ? "D\u1EABn \u0110\u01B0\u1EDDng" : "Navigate",
            skipL: vi ? "B\u1ECF Qua" : "Skip",
            route,
            carX: X(pos),
            borderX: X(border),
            doneW: (+X(pos) - 30).toFixed(1),
            borderL: vi ? "Bi\xEAn gi\u1EDBi SA \xB7 l\xF9i 30 ph" : "SA border \xB7 \u221230 min",
            startL: leg === "go" ? "Melbourne" : "Adelaide",
            endL: leg === "go" ? "Adelaide" : "Melbourne",
            spd: speed,
            spdUnit: vi ? "km/g" : "km/h",
            limit: pos > 600 && leg === "go" ? 100 : 110,
            stats: [[pos + " km", vi ? "\u0110\xE3 \u0111i" : "Driven"], [700 - pos + " km", vi ? "C\xF2n l\u1EA1i" : "To go"], [Math.floor(driven / 60) + (vi ? " gi\u1EDD " : "h ") + p2(driven % 60), vi ? "Th\u1EDDi gian l\xE1i" : "Driving time"], [nx.km - pos <= 120 && nx.stay ? vi ? "S\u1EAFp gh\xE9" : "Stop soon" : vi ? "Ngh\u1EC9 sau 2 gi\u1EDD" : "Rest every 2h", vi ? "Nh\u1EAFc ngh\u1EC9 ch\xE2n" : "Rest reminder"]].map(([v, l]) => ({ v, l })),
            note: vi ? "B\u1EA3n Road Trip \u0111\u1EA7y \u0111\u1EE7 (b\u1EA3n \u0111\u1ED3 th\u1EADt, bi\u1EC3n b\xE1o \xDAc, nh\u1EAFc qua bi\xEAn gi\u1EDBi, nh\u1EADt k\xFD) xem \u1EDF b\u1EA3ng 6 \u2014 khi build s\u1EBD n\u1EB1m ngay trong tab n\xE0y." : "The full Road Trip (real map, AU signs, border alerts, journal) is on board 6 \u2014 in the real app it lives in this tab."
          }
        };
      })(),
      ...(() => {
        var _a2, _b, _c, _d, _e, _f, _g, _h;
        const S2 = this.state;
        const bat = (_a2 = S2.bat) != null ? _a2 : LV && LV.bat ? LV.bat.hot ? "hot" : LV.bat.charging ? "chg" : "x" : "chg", tmpT = (_b = S2.tmpT) != null ? _b : "n", eng = (_c = S2.eng) != null ? _c : LOB && LOB.coolant != null ? LOB.coolant < 60 ? "cold" : LOB.coolant >= 105 ? "hot" : "n" : "n", volt = (_d = S2.volt) != null ? _d : LOB && LOB.volt != null ? LOB.volt >= 13.2 ? "chg" : LOB.volt >= 12.2 ? "off" : "low" : moving ? "chg" : "off";
        const edge = (_e = S2.mxEdge) != null ? _e : "cover", wave = (_f = S2.mxWave) != null ? _f : "silk", ci = (_g = S2.mxCol) != null ? _g : 0;
        const tt = tmpT === "hot" ? 38 : tmpT === "cold" ? 1 : temp;
        const feel = LV && LV.wx && LV.wx.feels != null && S2.tmpT == null ? Math.round(LV.wx.feels) : tt + (wx === "clear" && !night ? 2 : wx === "rain" || wx === "storm" ? -2 : 0);
        const rainP = LV && LV.wx && S2.tmpT == null ? Math.round(LV.wx.rain || 0) : { clear: 0, cloudy: 20, rain: 80, storm: 90, fog: 10 }[wx];
        let sub = (vi ? "C\u1EA3m gi\xE1c " : "Feels ") + feel + "\xB0 \xB7 " + (vi ? "M\u01B0a " : "Rain ") + rainP + "%", subC = "#A9C7D4";
        if (tt >= 35) {
          sub = vi ? "\u26A0 N\u1EAFng n\xF3ng \u2013 nh\u1EDB u\u1ED1ng n\u01B0\u1EDBc" : "\u26A0 Heat warning \u2013 stay hydrated";
          subC = "#FFB37A";
        } else if (tt <= 3) {
          sub = vi ? "\u2744 \u0110\u01B0\u1EDDng c\xF3 th\u1EC3 \u0111\xF3ng b\u0103ng" : "\u2744 Possible ice on road";
          subC = "#9FE3FF";
        }
        const lvl = LV && LV.bat && S2.bat == null ? Math.round(LV.bat.level) : { "80": 80, "35": 35, "12": 12, chg: 64, hot: 72 }[bat];
        const batC = bat === "hot" ? "#FF8A3D" : lvl > 50 ? "#7BD88F" : lvl >= 20 ? "#FBD000" : "#E5484D";
        const engV = LV && S2.eng == null ? LOB && LOB.coolant != null ? Math.round(LOB.coolant) : "--" : eng === "cold" ? 45 : eng === "hot" ? 108 : 88;
        const engC = eng === "cold" ? "#5FB8FF" : eng === "hot" ? "#E5484D" : "#7BD88F";
        const vV = volt === "chg" ? 14.2 : volt === "off" ? 12.5 : 11.8;
        const vC = volt === "low" ? "#E5484D" : volt === "off" ? "#FBD000" : "#7BD88F";
        const ic = { gps: "M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zM12 8a2 2 0 1 0 0 4a2 2 0 1 0 0-4z", bt: "M7 7l10 10-5 4V3l5 4L7 17", obd: "M4 8h16v8H4zM8 12h.01M12 12h.01M16 12h.01M8 16v3M16 16v3" };
        const pals = [["#FBB040", "#E8507A", "linear-gradient(135deg,#FBB040,#E8507A)"], ["#5FD4F0", "#7B6CF6", "linear-gradient(135deg,#5FD4F0,#7B6CF6)"], ["#7BD88F", "#2BB3A3", "linear-gradient(135deg,#7BD88F,#2BB3A3)"], ["#F45B69", "#FFD166", "linear-gradient(135deg,#F45B69,#FFD166)"], ["#C792EA", "#4FC3F7", "linear-gradient(135deg,#C792EA,#4FC3F7)"]];
        const [c1, c2, art] = pals[ci % pals.length];
        const calm = moving && speed > 10;
        const big = !calm;
        const edgeBgs = {
          cover: `conic-gradient(from 0deg, transparent 0 18%, ${c2} 28%, ${c1} 36%, transparent 46% 68%, ${c1} 78%, ${c2} 86%, transparent 96%)`,
          aurora: "conic-gradient(from 0deg, #2EE59D, #5FD4F0, #B98CF0, #F06BB9, #2EE59D)",
          star: "conic-gradient(from 0deg, transparent 0 6%, #FFFFFF 7%, transparent 8% 22%, #9FD8FF 23%, transparent 24% 41%, #FFFFFF 42%, transparent 43% 58%, #CDE7FF 59%, transparent 60% 77%, #FFFFFF 78%, transparent 79% 91%, #9FD8FF 92%, transparent 93%)",
          bass: `conic-gradient(from 0deg, ${c1}, transparent 30%, ${c2} 50%, transparent 80%, ${c1})`,
          sunset: "conic-gradient(from 0deg, transparent 0 20%, #FF7A45 32%, #FF4F8B 42%, #FFC857 50%, transparent 62%)"
        };
        const fxNames = vi ? { cover: "Vi\u1EC1n Theo \u1EA2nh B\xECa", aurora: "Vi\u1EC1n C\u1EF1c Quang", star: "Vi\u1EC1n B\u1EE5i Sao", bass: "Vi\u1EC1n Ch\u1EA1y Theo Bass", sunset: "Vi\u1EC1n Ho\xE0ng H\xF4n", off: "T\u1EAFt Vi\u1EC1n" } : { cover: "Cover Edge", aurora: "Aurora Edge", star: "Stardust Edge", bass: "Bass Edge", sunset: "Sunset Edge", off: "Edge Off" };
        const waveNames = vi ? { bars: "C\u1ED9t S\xF3ng", silk: "S\xF3ng L\u1EE5a", aur: "C\u1EF1c Quang M\u1EC1m", off: "T\u1EAFt S\xF3ng" } : { bars: "Bars", silk: "Silk Wave", aur: "Soft Aurora", off: "Wave Off" };
        const hs = [10, 18, 26, 14, 22, 30, 16, 24, 12];
        const opt2 = (key, val, label, def) => {
          var _a3;
          const cur = (_a3 = S2[key]) != null ? _a3 : def;
          return { label, on: cur === val ? "true" : "false", bg: cur === val ? "#FBB040" : "#0D2C40", fg: cur === val ? "#2A1A00" : "#E8F1F5", pick: () => self.setState({ [key]: val }) };
        };
        const spdOpt = (val, label) => {
          const on = val === 0 ? !moving : moving;
          return { label, on: on ? "true" : "false", bg: on ? "#FBB040" : "#0D2C40", fg: on ? "#2A1A00" : "#E8F1F5", pick: () => self.setState({ spd: val, volt: void 0 }) };
        };
        const voltDef = moving ? "chg" : "off";
        return {
          st: {
            grpL: vi ? "Tr\u1EA1ng th\xE1i m\xE1y" : "Phone status",
            t: tt,
            tC: tt >= 35 ? "#FF9A4D" : tt <= 3 ? "#9FE3FF" : "#E8F1F5",
            hi: LV && LV.wx && S2.tmpT == null ? Math.round(LV.wx.hi) : tt + 4,
            lo: LV && LV.wx && S2.tmpT == null ? Math.round(LV.wx.lo) : tt - 6,
            sub,
            subC,
            batC,
            batW: lvl + "%",
            batTxt: lvl + "%",
            chg: bat === "chg",
            chgCls: bat === "chg" ? "st-chg" : "",
            batCls: lvl < 20 ? "st-blink" : "",
            hot: bat === "hot",
            batL: vi ? "Pin \u0111i\u1EC7n tho\u1EA1i" : "Phone battery",
            hotS: vi ? "M\xE1y N\xF3ng" : "Hot",
            hotTxt: vi ? "M\xE1y n\xF3ng \u2013 gi\u1EA3m \u0111\u1ED9 s\xE1ng" : "Phone hot \u2013 dimming screen",
            roomy: LV && S2.devs == null ? (LV.devs || []).length <= 1 : ["none", "buds"].includes((_h = S2.devs) != null ? _h : "buds"),
            devs: LV && S2.devs == null ? (() => {
              const IC = { audio: "M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H4zM17 15h3v5h-3z", watch: "M8 6l1-4h6l1 4M8 18l1 4h6l1-4M7 6h10v12H7z", speaker: "M6 3h12v18H6zM12 12a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM12 7h.01", other: "M7 7l10 10-5 4V3l5 4L7 17" };
              const all = (LV.devs || []).map((d) => {
                const p = d.level;
                const has = p != null && p >= 0;
                return { name: d.name, icon: IC[d.type] || IC.other, p: has ? p : 101, pct: has ? p + "%" : "", c: !has ? "#CFE6EE" : p > 50 ? "#7BD88F" : p >= 20 ? "#FBD000" : "#E5484D", cls: has && p < 20 ? "st-blink" : "" };
              }).sort((a, b) => a.p - b.p);
              const shown = all.slice(0, 2);
              if (all.length > 2) shown.push({ name: all.slice(2).map((x) => x.name).join(", "), icon: "M12 5v14M5 12h14", pct: "" + (all.length - 2), c: "#CFE6EE", cls: "" });
              return shown;
            })() : (() => {
              var _a3;
              const dv = (_a3 = S2.devs) != null ? _a3 : "buds";
              const D = { buds: ["Buds", "M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H4zM17 15h3v5h-3z", 72], watch: ["Watch", "M8 6l1-4h6l1 4M8 18l1 4h6l1-4M7 6h10v12H7z", 45], spk: ["Spk", "M6 3h12v18H6zM12 12a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM12 7h.01", 15] };
              const keys = { none: [], buds: ["buds"], two: ["buds", "watch"], all: ["buds", "watch", "spk"] }[dv] || [];
              const all = keys.map((k) => {
                const [name, icon, p] = D[k];
                return { name, icon, p, pct: p + "%", c: p > 50 ? "#7BD88F" : p >= 20 ? "#FBD000" : "#E5484D", cls: p < 20 ? "st-blink" : "" };
              }).sort((a, b) => a.p - b.p);
              const shown = all.slice(0, 2);
              if (all.length > 2) shown.push({ name: all.slice(2).map((x) => x.name + " " + x.pct).join(", "), icon: "M12 5v14M5 12h14", pct: "" + (all.length - 2), c: "#CFE6EE", cls: "" });
              return shown;
            })(),
            links: [["gps", "GPS", LV ? !!LV.gps : true], ["bt", "Bluetooth", LV ? !!LV.bt : true], ["obd", "OBD-II", LV ? !!LOB : S2.obdOff !== true]].map(([k, label, on]) => ({ label, d: ic[k], c: on ? "#5FD4F0" : "#6B7C86", op: on ? 1 : 0.45 })),
            eng: engV,
            engC,
            engCls: eng === "hot" ? "st-blink" : "",
            engS: vi ? eng === "cold" ? "M\xE1y Ngu\u1ED9i" : eng === "hot" ? "M\xE1y N\xF3ng!" : "Nhi\u1EC7t M\xE1y" : eng === "cold" ? "Warming Up" : eng === "hot" ? "Overheat!" : "Coolant",
            engL: vi ? "Nhi\u1EC7t \u0111\u1ED9 n\u01B0\u1EDBc l\xE0m m\xE1t m\xE1y (OBD-II)" : "Coolant temperature (OBD-II)",
            v: LV && S2.volt == null ? LOB && LOB.volt != null ? LOB.volt.toFixed(1) + " V" : "-- V" : vV.toFixed(1) + " V",
            vC,
            vW: (volt === "chg" ? 100 : volt === "off" ? 70 : 25) + "%",
            vCls: volt === "chg" ? "st-chg" : volt === "low" ? "st-blink" : "",
            vS: vi ? volt === "chg" ? "B\xECnh \u0110ang S\u1EA1c" : volt === "off" ? "B\xECnh \u0110i\u1EC7n" : "B\xECnh Y\u1EBFu!" : volt === "chg" ? "Charging" : volt === "off" ? "Battery" : "Low Battery!",
            vL: vi ? "\u0110i\u1EC7n \xE1p b\xECnh xe (OBD-II)" : "Car battery voltage (OBD-II)"
          },
          mx: {
            big,
            small: !big,
            w: big ? "100%" : "330px",
            ...(() => {
              var _a3, _b2;
              const rt = S2.tab === "rt", go = ((_a3 = S2.rtLeg) != null ? _a3 : "go") === "go", p = (_b2 = S2.rtPos) != null ? _b2 : 0;
              const R = go ? [["The Flywheel Bar & Cafe", "15 km", "09:35"], ["Keith (12810 Dukes Hwy)", "60 km", "13:33"], ["Adelaide", "60 km", "16:15"]][p] : [["Tailem Bend", "15 km", "09:44"], ["McDonald's Horsham", "100 km", "13:15"], ["Melbourne", "50 km", "16:45"]][p];
              return rt ? { upL: vi ? "CH\u1EB6NG GH\xC9 K\u1EBE" : "NEXT STOP", upIcon: "M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zM12 8a2 2 0 1 0 0 4a2 2 0 1 0 0-4z", upMain: R[0] + " \xB7 " + R[1], upSub: (vi ? "D\u1EF1 ki\u1EBFn " : "ETA ") + R[2] } : { upL: vi ? "S\u1EAEP T\u1EDAI" : "COMING UP", upIcon: "M15 20v-7a3 3 0 0 0-3-3H5M9 6l-4 4 4 4", upMain: (vi ? "Qu\u1EB9o tr\xE1i" : "Turn left") + " \xB7 300 m", upSub: vi ? "V\xF4 Western Hwy (A8) \xB7 t\u1EDBi n\u01A1i 09:35" : "Onto Western Hwy (A8) \xB7 arrive 09:35" };
            })(),
            c1,
            c2,
            art,
            bg: `linear-gradient(90deg, ${c1}33, rgba(3,12,20,0.92) 40%, rgba(3,12,20,0.92) 70%, ${c2}33)`,
            edgeOn: edge !== "off",
            edgeBg: edgeBgs[edge] || edgeBgs.cover,
            edgeOp: (calm ? 0.55 : 1) * (night ? 0.7 : 1),
            edgeDur: (calm ? 9 : edge === "bass" ? 2.2 : 4.5) + "s",
            wrapCls: edge === "bass" && !calm ? "mx-beat" : "",
            waveBars: wave === "bars" && big,
            waveSilk: wave === "silk" && big,
            waveAur: wave === "aur" && big,
            bars: hs.map((h, i) => ({ h: h + "px", c: i % 2 ? c2 : c1, d: (-i * 0.13).toFixed(2) + "s", dur: (0.7 + i % 3 * 0.18).toFixed(2) + "s" })),
            artistTxt: t.artist,
            srcTxt: "Tom's Jukebox",
            srcIcon: "M9 18V5l11-2v13M6 15a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM17 13a3 3 0 1 0 0 6a3 3 0 1 0 0-6z",
            fx: fxNames[edge] + " \xB7 " + waveNames[wave],
            artL: vi ? "\u1EA2nh b\xECa \u2013 nh\u1EA5p 2 l\u1EA7n \u0111\u1EC3 \u0111\u1ED5i m\xE0u" : "Cover \u2013 double-tap to change colour",
            artTap: () => {
              var _a3;
              const n = Date.now();
              if (self._mxT && n - self._mxT < 400) {
                self._mxT = 0;
                self.setState({ mxCol: (((_a3 = self.state.mxCol) != null ? _a3 : 0) + 1) % 5 });
              } else {
                self._mxT = n;
              }
            }
          },
          tstRows: [
            { label: vi ? "TH\u1EEC XE & PIN" : "TEST CAR & PHONE", opts: [spdOpt(0, vi ? "\u0110\u1EADu Xe" : "Parked"), spdOpt(60, vi ? "\u0110ang Ch\u1EA1y 60" : "Driving 60"), opt2("bat", "80", (vi ? "Pin " : "Battery ") + "80%", "chg"), opt2("bat", "35", (vi ? "Pin " : "Battery ") + "35%", "chg"), opt2("bat", "12", (vi ? "Pin " : "Battery ") + "12%", "chg"), opt2("bat", "chg", vi ? "\u0110ang S\u1EA1c" : "Charging", "chg"), opt2("bat", "hot", vi ? "M\xE1y N\xF3ng" : "Phone Hot", "chg")] },
            { label: vi ? "TH\u1EEC TR\u1EDCI & M\xC1Y" : "TEST WEATHER & ENGINE", opts: [opt2("tmpT", "n", vi ? "Tr\u1EDDi Th\u01B0\u1EDDng" : "Normal", "n"), opt2("tmpT", "hot", vi ? "N\xF3ng 38\xB0" : "Hot 38\xB0", "n"), opt2("tmpT", "cold", vi ? "L\u1EA1nh 1\xB0" : "Cold 1\xB0", "n"), opt2("eng", "n", vi ? "M\xE1y 88\xB0" : "Engine 88\xB0", "n"), opt2("eng", "cold", vi ? "M\xE1y Ngu\u1ED9i" : "Engine Cold", "n"), opt2("eng", "hot", vi ? "M\xE1y Qu\xE1 N\xF3ng" : "Overheat", "n"), opt2("volt", "chg", vi ? "B\xECnh \u0110ang S\u1EA1c" : "Charging", voltDef), opt2("volt", "off", vi ? "B\xECnh T\u1EAFt M\xE1y" : "Engine Off", voltDef), opt2("volt", "low", vi ? "B\xECnh Y\u1EBFu" : "Low", voltDef)] },
            { label: vi ? "VI\u1EC0N NH\u1EA0C" : "MUSIC EDGE", opts: ["cover", "aurora", "star", "bass", "sunset", "off"].map((k) => opt2("mxEdge", k, fxNames[k].replace(vi ? "Vi\u1EC1n " : " Edge", "").replace("T\u1EAFt", vi ? "T\u1EAFt" : "Off"), "cover")) },
            { label: vi ? "S\xD3NG NH\u1EA0C" : "MUSIC WAVE", opts: ["silk", "bars", "aur", "off"].map((k) => opt2("mxWave", k, waveNames[k], "silk")) }
          ]
        };
      })(),
      toggleLang: () => this.setState({ lang: vi ? "en" : "vi" }),
      enColor: vi ? "#A9C7D4" : "#FBB040",
      viColor: vi ? "#FBB040" : "#A9C7D4",
      toggleNight: () => this.setState({ phase: night ? "day" : "night" }),
      nightPressed: night ? "true" : "false",
      togglePicker: () => this.setState({ picker: !this.state.picker }),
      pickerOpen: this.state.picker,
      pickerExpanded: this.state.picker ? "true" : "false",
      pickerGroups,
      wsCount: defs.length + t.count,
      sorts,
      workspaces,
      listening: this.state.listening,
      listenPressed: this.state.listening ? "true" : "false",
      toggleListen: () => this.setState({ listening: !this.state.listening }),
      assistTitle: this.state.listening ? t.listenTitle : t.idleTitle,
      assistHint: this.state.listening ? t.listenHint : t.idleHints[now.getMinutes() % t.idleHints.length],
      showCover: this.state.stage === "cover",
      showRun: this.state.stage === "run",
      coverText: runDef ? t.opening + " " + runDef.name + "\u2026" : "",
      runApps: runDef ? mkApps(runDef) : [],
      closeRun: () => this.setState({ stage: null }),
      skyTop: { day: "#0B2338", dawn: "#101A33", dusk: "#1A0F2A", night: "#02070D" }[phase],
      skyLow: { day: "#123650", dawn: "#3A2433", dusk: "#3A1830", night: "#06121E" }[phase],
      horizonGlow: { day: "#5FD4F0", dawn: "#FBB040", dusk: "#FF7A59", night: "#48B0C8" }[phase],
      showSun: phase !== "night" && sunOp > 0,
      sunColor: { day: "#5FD4F0", dawn: "#FBB040", dusk: "#FF7A59", night: "#5FD4F0" }[phase],
      sunLeft: { day: "72%", dawn: "18%", dusk: "68%", night: "72%" }[phase],
      sunTop: { day: "7%", dawn: "22%", dusk: "22%", night: "7%" }[phase],
      showMoon: night && sunOp > 0,
      sunOp,
      showStars: night && (wx === "clear" || wx === "cloudy"),
      moreClouds: wx !== "clear",
      cloudOp: { clear: 0, cloudy: 0.5, rain: 0.8, storm: 0.9, fog: 0.4 }[wx],
      isCity: scenery === "city",
      isSuburb: scenery === "suburb",
      isCountry: scenery === "country",
      neonA: "#5FD4F0",
      neonB: "#FBB040",
      neonC: "#9B7FD1",
      leafNeon: { summer: "#7BD88F", autumn: "#FB8C3C", winter: "#5FD4F0", spring: "#B39DDB" }[season],
      leafOp: season === "winter" ? 0 : 1,
      blossomOp: season === "spring" ? 1 : 0,
      gridOp: night ? 0.6 : 0.42,
      laneDur: laneS.toFixed(2) + "s",
      objDur: objS.toFixed(2) + "s",
      hlDur: (moving ? 22 / speed : 1).toFixed(2) + "s",
      playState: moving ? "running" : "paused",
      fogOp: wx === "fog" ? 0.45 : 0,
      isRain: wet,
      isStorm: wx === "storm",
      showFall: (season === "autumn" || season === "spring") && !wet,
      fallColor: { summer: "#7BD88F", autumn: "#FB8C3C", winter: "#5FD4F0", spring: "#B39DDB" }[season],
      speedDash: (Math.min(speed / 140, 1) * 214).toFixed(0) + " 400",
      rpmDash: (Math.min(rpm / 6e3, 1) * 214).toFixed(0) + " 400",
      rpmText: rpm.toLocaleString(vi ? "vi-VN" : "en-AU"),
      rearCam: vi ? "CAM SAU" : "REAR CAM",
      hudTurn: vi ? "Qu\u1EB9o tr\xE1i \xB7 300 m" : "Turn left \xB7 300 m",
      wheelClass: moving ? "tc-sway" : ""
    }, lanes, objs);
  }
}
window.__TPL = `
<helmet>
<style>
body{margin:0}
a{color:#5FD4F0}a:hover{color:#CFF6FF}
.tc-btn{cursor:pointer;font-family:inherit}
@keyframes wx-spinkf{to{transform:rotate(360deg)}}.wx-spin{transform-box:view-box;transform-origin:24px 24px;animation:wx-spinkf 14s linear infinite}@keyframes wx-pulsekf{0%,100%{transform:scale(1);opacity:.18}50%{transform:scale(1.25);opacity:.32}}.wx-pulse{transform-box:view-box;transform-origin:24px 24px;animation:wx-pulsekf 3s ease-in-out infinite}@keyframes wx-driftkf{0%,100%{transform:translateX(-2px)}50%{transform:translateX(3px)}}.wx-drift{animation:wx-driftkf 5s ease-in-out infinite}.wx-drift2{animation:wx-driftkf 7s ease-in-out infinite reverse}@keyframes wx-dropkf{0%{transform:translateY(-4px);opacity:0}30%{opacity:1}100%{transform:translateY(8px);opacity:0}}.wx-drop{animation:wx-dropkf 1.1s linear infinite}@keyframes wx-flashkf{0%,70%,100%{opacity:.15}74%,82%{opacity:1}78%{opacity:.4}}.wx-flash{animation:wx-flashkf 3.2s linear infinite}@keyframes wx-fogkf{0%,100%{transform:translateX(-3px);opacity:.5}50%{transform:translateX(3px);opacity:1}}.wx-fog{animation:wx-fogkf 4s ease-in-out infinite}@keyframes wx-blinkkf{0%,100%{opacity:.2}50%{opacity:1}}.wx-blink{animation:wx-blinkkf 2.2s ease-in-out infinite}.wx-d2{animation-delay:-.4s}.wx-d3{animation-delay:-.8s}
@keyframes tc-wiperkf{0%,100%{transform:rotate(-62deg)}45%,55%{transform:rotate(40deg)}}.tc-wiper{transform-box:view-box;transform-origin:420px 640px;animation:tc-wiperkf 2.4s ease-in-out infinite}.tc-wiper2{transform-origin:860px 640px}
@keyframes tc-sgrainkf{from{background-position:0 0}to{background-position:-120px 720px}}.tc-sgrain{background-image:repeating-linear-gradient(105deg,rgba(220,235,245,0) 0 14px,rgba(220,235,245,0.35) 14px 15px,rgba(220,235,245,0) 15px 46px);animation:tc-sgrainkf .5s linear infinite}
@keyframes tc-introbarkf{from{width:0}to{width:100%}}.tc-introbar{width:100%;animation:tc-introbarkf 4s ease-out both}
@keyframes tc-introfadekf{from{opacity:0;transform:scale(1.02)}to{opacity:1;transform:none}}.tc-introfade{animation:tc-introfadekf .6s ease-out both}
.tc-btn:hover{filter:brightness(1.2)}
.tc-obj{position:absolute;left:0;top:0;width:0;height:0;animation-timing-function:cubic-bezier(0.8,0,0.96,0.5);animation-iteration-count:infinite}
@keyframes tc-objL{0%{transform:translate(640px,300px) scale(0.02);opacity:0}10%{opacity:1}100%{transform:translate(-460px,860px) scale(1.9);opacity:1}}
@keyframes tc-objR{0%{transform:translate(640px,300px) scale(0.02);opacity:0}10%{opacity:1}100%{transform:translate(2000px,840px) scale(1.9);opacity:1}}
.tc-objL{animation-name:tc-objL}
.tc-objR{animation-name:tc-objR}
.tc-lane{position:absolute;left:0;top:0;width:0;height:0;animation-name:tc-lanekf;animation-timing-function:cubic-bezier(0.8,0,0.96,0.5);animation-iteration-count:infinite}
@keyframes tc-lanekf{0%{transform:translate(640px,300px) scale(0.03);opacity:0}8%{opacity:1}100%{transform:translate(1290px,800px) scale(1.5);opacity:1}}
.tc-hl{position:absolute;left:0;right:0;top:0;height:2px;background:#5FD4F0;box-shadow:0 0 8px #5FD4F0;animation-name:tc-hlkf;animation-timing-function:cubic-bezier(0.8,0,0.96,0.5);animation-iteration-count:infinite}
@keyframes tc-hlkf{0%{transform:translateY(300px);opacity:0}15%{opacity:0.35}100%{transform:translateY(740px);opacity:0.9}}
.tc-glow{filter:drop-shadow(0 0 5px rgba(95,212,240,0.75))}
@keyframes tc-swaykf{0%,100%{transform:rotate(-1.2deg)}50%{transform:rotate(1.2deg)}}
.tc-sway{animation:tc-swaykf 5s ease-in-out infinite}
@keyframes tc-rainfall{from{background-position:0 0,0 0}to{background-position:-60px 240px,-40px 160px}}
.tc-rain{background-image:repeating-linear-gradient(105deg,rgba(95,212,240,0.35) 0 2px,transparent 2px 24px),repeating-linear-gradient(100deg,rgba(155,127,209,0.25) 0 1px,transparent 1px 16px);animation:tc-rainfall 0.45s linear infinite}
@keyframes tc-flashkf{0%,90%,94%,100%{opacity:0}91%{opacity:0.45}92%{opacity:0.1}93%{opacity:0.3}}
.tc-flash{animation:tc-flashkf 7s linear infinite}
@keyframes tc-fallkf{0%{transform:translate(0,-20px) rotate(0deg);opacity:0}10%{opacity:1}100%{transform:translate(-220px,520px) rotate(540deg);opacity:0.9}}
.tc-fall{position:absolute;top:60px;border-radius:60% 0 60% 0;animation-name:tc-fallkf;animation-timing-function:linear;animation-iteration-count:infinite}
@keyframes mx-rotkf{to{transform:rotate(360deg)}}.mx-edge{position:absolute;left:50%;top:50%;width:760px;height:760px;margin:-380px 0 0 -380px;animation:mx-rotkf 6s linear infinite}@keyframes mx-beatkf{0%,100%{filter:brightness(1)}40%{filter:brightness(1.9)}}.mx-beat{animation:mx-beatkf .55s ease-in-out infinite}@keyframes mx-mqkf{from{transform:translateX(0)}to{transform:translateX(-50%)}}.mx-mq{display:inline-block;white-space:nowrap;animation:mx-mqkf 14s linear infinite}@keyframes mx-barkf{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}.mx-bar{width:4px;border-radius:2px;transform-origin:50% 100%;animation:mx-barkf .9s ease-in-out infinite}@keyframes mx-silkkf{from{transform:translateX(0)}to{transform:translateX(-60px)}}.mx-silk{animation:mx-silkkf 2.4s linear infinite}.mx-silk2{animation:mx-silkkf 3.6s linear infinite reverse}@keyframes mx-aurkf{0%,100%{transform:translateX(-14px) scaleY(.8);opacity:.6}50%{transform:translateX(14px) scaleY(1.1);opacity:1}}.mx-aur{animation:mx-aurkf 3.2s ease-in-out infinite}@keyframes mx-dotkf{0%,100%{box-shadow:0 0 4px 1px var(--c)}50%{box-shadow:0 0 12px 4px var(--c)}}.mx-dot{animation:mx-dotkf 1.2s ease-in-out infinite}@keyframes st-chgkf{from{width:15%}to{width:100%}}.st-chg{animation:st-chgkf 2s ease-out infinite}@keyframes st-blinkkf{0%,100%{opacity:1}50%{opacity:.35}}.st-blink{animation:st-blinkkf 1.2s ease-in-out infinite}
@keyframes tc-barkf{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}
.tc-bar{width:4px;height:22px;border-radius:2px;background:#FBB040;box-shadow:0 0 6px #FBB040;transform-origin:center;animation:tc-barkf 0.8s ease-in-out infinite}
@keyframes tc-progkf{from{width:0%}to{width:100%}}
.tc-prog{animation:tc-progkf 1.8s ease-out forwards}
@keyframes tc-sweepkf{from{transform:translateX(-200px)}to{transform:translateX(1480px)}}
.tc-sweep{animation:tc-sweepkf 1.8s ease-in-out forwards}
@keyframes tc-scankf{from{transform:translateX(-120px)}to{transform:translateX(520px)}}
.tc-scan{animation:tc-scankf 3.2s linear infinite}
@keyframes tc-orbkf{0%{transform:scale(0.7);opacity:0.9}100%{transform:scale(1.6);opacity:0}}
.tc-orb{position:absolute;top: 0; right: 0; bottom: 0; left: 0;border-radius:50%;border:2px solid #5FD4F0;animation:tc-orbkf 1.6s ease-out infinite}
@keyframes tc-cloudkf{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.tc-clouds{animation:tc-cloudkf 120s linear infinite}
.tc-scroll::-webkit-scrollbar{width:6px}.tc-scroll::-webkit-scrollbar-thumb{background:#1E4A63}
</style>
</helmet>
<div style="width: 1280px; height: 720px; position: relative; overflow: hidden; background: #010407; color: #E8F1F5; font-family: 'Chakra Petch', 'Segoe UI', system-ui, sans-serif">

  <div aria-hidden="true" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0">
    <div style="position: absolute; left: 0; right: 0; top: 0; height: 180px; background: {{skyTop}}"></div>
    <div style="position: absolute; left: 0; right: 0; top: 180px; height: 120px; background: {{skyLow}}"></div>
    <sc-if value="{{showStars}}" hint-placeholder-val="{{ true }}"><div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0"><div style="position: absolute; left: 8%; top: 8%; width: 2px; height: 2px; border-radius: 50%; background: #CFF6FF; opacity: 0.8"></div><div style="position: absolute; left: 22%; top: 16%; width: 2px; height: 2px; border-radius: 50%; background: #CFF6FF; opacity: 0.6"></div><div style="position: absolute; left: 37%; top: 6%; width: 2px; height: 2px; border-radius: 50%; background: #CFF6FF; opacity: 0.7"></div><div style="position: absolute; left: 55%; top: 12%; width: 2px; height: 2px; border-radius: 50%; background: #CFF6FF; opacity: 0.8"></div><div style="position: absolute; left: 64%; top: 4%; width: 2px; height: 2px; border-radius: 50%; background: #CFF6FF; opacity: 0.5"></div><div style="position: absolute; left: 71%; top: 9%; width: 2px; height: 2px; border-radius: 50%; background: #CFF6FF; opacity: 0.6"></div><div style="position: absolute; left: 88%; top: 18%; width: 2px; height: 2px; border-radius: 50%; background: #CFF6FF; opacity: 0.7"></div><div style="position: absolute; left: 15%; top: 3%; width: 2px; height: 2px; border-radius: 50%; background: #CFF6FF; opacity: 0.5"></div><div style="position: absolute; left: 46%; top: 20%; width: 2px; height: 2px; border-radius: 50%; background: #CFF6FF; opacity: 0.5"></div><div style="position: absolute; left: 80%; top: 5%; width: 2px; height: 2px; border-radius: 50%; background: #CFF6FF; opacity: 0.6"></div></div></sc-if>
    <sc-if value="{{showSun}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; left: {{sunLeft}}; top: {{sunTop}}; width: 70px; height: 70px; border-radius: 50%; border: 3px solid {{sunColor}}; box-shadow: 0 0 24px {{sunColor}}, inset 0 0 18px {{sunColor}}; opacity: {{sunOp}}"></div>
    </sc-if>
    <sc-if value="{{showMoon}}" hint-placeholder-val="{{ true }}">
      <div style="position: absolute; left: 80%; top: 7%; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #CFF6FF; box-shadow: 0 0 18px #5FD4F0; opacity: {{sunOp}}"></div>
    </sc-if>
    <sc-if value="{{moreClouds}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; left: 0; top: 30px; width: 1280px; height: 150px; overflow: hidden; opacity: {{cloudOp}}">
        <div class="tc-clouds" style="display: flex; width: 2560px">
          <svg viewBox="0 0 1280 150" width="1280" height="150" style="display: block; flex-shrink: 0"><g fill="none" stroke="#9B7FD1" stroke-width="2"><path d="M60 80 Q90 40 140 60 Q180 30 230 62 Q270 60 280 80 Z"></path><path d="M420 50 Q450 20 500 36 Q540 10 590 40 Q630 40 640 56 Z"></path><path d="M820 90 Q850 56 900 72 Q940 44 990 74 Q1030 72 1040 92 Z"></path></g></svg>
          <svg viewBox="0 0 1280 150" width="1280" height="150" style="display: block; flex-shrink: 0"><g fill="none" stroke="#9B7FD1" stroke-width="2"><path d="M60 80 Q90 40 140 60 Q180 30 230 62 Q270 60 280 80 Z"></path><path d="M420 50 Q450 20 500 36 Q540 10 590 40 Q630 40 640 56 Z"></path><path d="M820 90 Q850 56 900 72 Q940 44 990 74 Q1030 72 1040 92 Z"></path></g></svg>
        </div>
      </div>
    </sc-if>
    <div style="position: absolute; left: 0; right: 0; top: 296px; height: 8px; background: {{horizonGlow}}; filter: blur(6px); opacity: 0.8"></div>
    <div style="position: absolute; left: 0; right: 0; top: 299px; height: 2px; background: {{horizonGlow}}"></div>
    <div class="tc-glow"><svg viewBox="0 0 1280 720" width="1280" height="720" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: block"><polyline points="0,300 60,282 120,290 170,262 230,276 300,248 360,270 420,258 480,280 640,300 800,278 860,252 930,270 990,240 1060,268 1120,256 1200,284 1280,300" fill="none" stroke="{{neonC}}" stroke-width="2" opacity="0.8"></polyline></svg><sc-if value="{{isCity}}" hint-placeholder-val="{{ true }}"><svg viewBox="0 0 1280 720" width="1280" height="720" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: block"><path d="M380 300 L380 260 L420 260 L420 300" fill="none" stroke="{{neonA}}" stroke-width="2" opacity="0.7"></path><path d="M426 300 L426 238 L452 238 L452 300" fill="none" stroke="{{neonA}}" stroke-width="2" opacity="0.7"></path><path d="M458 300 L458 266 L504 266 L504 300" fill="none" stroke="{{neonA}}" stroke-width="2" opacity="0.7"></path><path d="M510 300 L510 222 L532 222 L532 300" fill="none" stroke="{{neonA}}" stroke-width="2" opacity="0.7"></path><path d="M540 300 L540 254 L580 254 L580 300" fill="none" stroke="{{neonA}}" stroke-width="2" opacity="0.7"></path><path d="M586 300 L586 242 L614 242 L614 300" fill="none" stroke="{{neonA}}" stroke-width="2" opacity="0.7"></path><path d="M620 300 L620 212 L636 212 L636 300" fill="none" stroke="{{neonA}}" stroke-width="2" opacity="0.7"></path><path d="M642 300 L642 260 L678 260 L678 300" fill="none" stroke="{{neonA}}" stroke-width="2" opacity="0.7"></path><path d="M684 300 L684 234 L712 234 L712 300" fill="none" stroke="{{neonA}}" stroke-width="2" opacity="0.7"></path><path d="M718 300 L718 262 L762 262 L762 300" fill="none" stroke="{{neonA}}" stroke-width="2" opacity="0.7"></path><path d="M770 300 L770 246 L794 246 L794 300" fill="none" stroke="{{neonA}}" stroke-width="2" opacity="0.7"></path><path d="M800 300 L800 270 L836 270 L836 300" fill="none" stroke="{{neonA}}" stroke-width="2" opacity="0.7"></path><path d="M842 300 L842 254 L872 254 L872 300" fill="none" stroke="{{neonA}}" stroke-width="2" opacity="0.7"></path></svg></sc-if><sc-if value="{{isSuburb}}" hint-placeholder-val="{{ false }}"><svg viewBox="0 0 1280 720" width="1280" height="720" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: block"><path d="M400 300 L400 288 L414 280 L428 288 L428 300" fill="none" stroke="{{neonB}}" stroke-width="2" opacity="0.6"></path><path d="M452 300 L452 288 L466 280 L480 288 L480 300" fill="none" stroke="{{neonB}}" stroke-width="2" opacity="0.6"></path><path d="M504 300 L504 288 L518 280 L532 288 L532 300" fill="none" stroke="{{neonB}}" stroke-width="2" opacity="0.6"></path><path d="M556 300 L556 288 L570 280 L584 288 L584 300" fill="none" stroke="{{neonB}}" stroke-width="2" opacity="0.6"></path><path d="M608 300 L608 288 L622 280 L636 288 L636 300" fill="none" stroke="{{neonB}}" stroke-width="2" opacity="0.6"></path><path d="M660 300 L660 288 L674 280 L688 288 L688 300" fill="none" stroke="{{neonB}}" stroke-width="2" opacity="0.6"></path><path d="M712 300 L712 288 L726 280 L740 288 L740 300" fill="none" stroke="{{neonB}}" stroke-width="2" opacity="0.6"></path><path d="M764 300 L764 288 L778 280 L792 288 L792 300" fill="none" stroke="{{neonB}}" stroke-width="2" opacity="0.6"></path><path d="M816 300 L816 288 L830 280 L844 288 L844 300" fill="none" stroke="{{neonB}}" stroke-width="2" opacity="0.6"></path></svg></sc-if></div>
    <div style="position: absolute; left: 0; right: 0; top: 300px; bottom: 0; background: #01060B"></div>
    <svg viewBox="0 0 1280 720" width="1280" height="720" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: block; opacity: {{gridOp}}"><line x1="640" y1="300" x2="-1800" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="-1640" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="-1480" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="-1320" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="-1160" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="-1000" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="-840" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="-680" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="-520" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="-360" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="-200" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="-40" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="120" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="280" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="440" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="600" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="760" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="920" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="1080" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="1240" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="1400" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="1560" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="1720" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="1880" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="2040" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="2200" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="2360" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="2520" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="2680" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="2840" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="3000" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line><line x1="640" y1="300" x2="3160" y2="720" stroke="#5FD4F0" stroke-width="1.5"></line></svg>
    <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; overflow: hidden; opacity: {{gridOp}}"><div class="tc-hl" style="animation-duration: {{hlDur}}; animation-delay: {{hlDelay0}}; animation-play-state: {{playState}}"></div><div class="tc-hl" style="animation-duration: {{hlDur}}; animation-delay: {{hlDelay1}}; animation-play-state: {{playState}}"></div><div class="tc-hl" style="animation-duration: {{hlDur}}; animation-delay: {{hlDelay2}}; animation-play-state: {{playState}}"></div><div class="tc-hl" style="animation-duration: {{hlDur}}; animation-delay: {{hlDelay3}}; animation-play-state: {{playState}}"></div><div class="tc-hl" style="animation-duration: {{hlDur}}; animation-delay: {{hlDelay4}}; animation-play-state: {{playState}}"></div><div class="tc-hl" style="animation-duration: {{hlDur}}; animation-delay: {{hlDelay5}}; animation-play-state: {{playState}}"></div><div class="tc-hl" style="animation-duration: {{hlDur}}; animation-delay: {{hlDelay6}}; animation-play-state: {{playState}}"></div><div class="tc-hl" style="animation-duration: {{hlDur}}; animation-delay: {{hlDelay7}}; animation-play-state: {{playState}}"></div></div>
    <svg viewBox="0 0 1280 720" width="1280" height="720" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: block">
      <polygon points="637,300 643,300 2400,720 -300,720" fill="#000306" opacity="0.75"></polygon>
      <line x1="636" y1="300" x2="-230" y2="720" stroke="#FBB040" stroke-width="10" opacity="0.25"></line>
      <line x1="636" y1="300" x2="-230" y2="720" stroke="#FBB040" stroke-width="3"></line>
      <line x1="644" y1="300" x2="2200" y2="720" stroke="#FBB040" stroke-width="10" opacity="0.25"></line>
      <line x1="644" y1="300" x2="2200" y2="720" stroke="#FBB040" stroke-width="3"></line>
    </svg>
    <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; overflow: hidden"><div class="tc-lane" style="animation-duration: {{laneDur}}; animation-delay: {{laneDelay0}}; animation-play-state: {{playState}}"><div style="position: absolute; left: -6px; top: -60px; width: 12px; height: 120px; border-radius: 3px; background: #CFF6FF; box-shadow: 0 0 12px #5FD4F0; transform: rotate(-52deg)"></div></div><div class="tc-lane" style="animation-duration: {{laneDur}}; animation-delay: {{laneDelay1}}; animation-play-state: {{playState}}"><div style="position: absolute; left: -6px; top: -60px; width: 12px; height: 120px; border-radius: 3px; background: #CFF6FF; box-shadow: 0 0 12px #5FD4F0; transform: rotate(-52deg)"></div></div><div class="tc-lane" style="animation-duration: {{laneDur}}; animation-delay: {{laneDelay2}}; animation-play-state: {{playState}}"><div style="position: absolute; left: -6px; top: -60px; width: 12px; height: 120px; border-radius: 3px; background: #CFF6FF; box-shadow: 0 0 12px #5FD4F0; transform: rotate(-52deg)"></div></div><div class="tc-lane" style="animation-duration: {{laneDur}}; animation-delay: {{laneDelay3}}; animation-play-state: {{playState}}"><div style="position: absolute; left: -6px; top: -60px; width: 12px; height: 120px; border-radius: 3px; background: #CFF6FF; box-shadow: 0 0 12px #5FD4F0; transform: rotate(-52deg)"></div></div></div>
    <div class="tc-glow" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; overflow: hidden"><sc-if value="{{isCity}}" hint-placeholder-val="{{ true }}"><div class="tc-obj tc-objL" style="animation-duration: {{objDur}}; animation-delay: {{objDelay0}}; animation-play-state: {{playState}}"><svg viewBox="0 0 170 330" width="170" height="330" style="position: absolute; left: -85px; bottom: 0; overflow: visible; display: block"><rect x="1.5" y="1.5" width="167" height="327" fill="#04101A" fill-opacity="0.9" stroke="{{neonA}}" stroke-width="3"></rect><line x1="4" y1="30" x2="166" y2="30" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="60" x2="166" y2="60" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="90" x2="166" y2="90" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="120" x2="166" y2="120" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="150" x2="166" y2="150" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="180" x2="166" y2="180" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="210" x2="166" y2="210" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="240" x2="166" y2="240" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="270" x2="166" y2="270" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="300" x2="166" y2="300" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><g fill="{{neonB}}" opacity="0.85"><rect x="10" y="12" width="12" height="8"></rect><rect x="106" y="12" width="12" height="8"></rect><rect x="82" y="42" width="12" height="8"></rect><rect x="106" y="42" width="12" height="8"></rect><rect x="34" y="72" width="12" height="8"></rect><rect x="82" y="72" width="12" height="8"></rect><rect x="106" y="72" width="12" height="8"></rect><rect x="130" y="72" width="12" height="8"></rect><rect x="106" y="102" width="12" height="8"></rect><rect x="34" y="132" width="12" height="8"></rect><rect x="106" y="132" width="12" height="8"></rect><rect x="10" y="162" width="12" height="8"></rect><rect x="10" y="192" width="12" height="8"></rect><rect x="34" y="192" width="12" height="8"></rect><rect x="82" y="192" width="12" height="8"></rect><rect x="130" y="192" width="12" height="8"></rect><rect x="10" y="252" width="12" height="8"></rect><rect x="82" y="252" width="12" height="8"></rect></g><line x1="1.5" y1="1.5" x2="168" y2="1.5" stroke="{{neonB}}" stroke-width="3"></line></svg></div><div class="tc-obj tc-objL" style="animation-duration: {{objDur}}; animation-delay: {{objDelay1}}; animation-play-state: {{playState}}"><svg viewBox="0 0 60 260" width="60" height="260" style="position: absolute; left: -30px; bottom: 0; overflow: visible; display: block"><line x1="13" y1="4" x2="13" y2="260" stroke="{{neonA}}" stroke-width="4"></line><line x1="13" y1="4" x2="47" y2="4" stroke="{{neonA}}" stroke-width="4"></line><rect x="39" y="1" width="20" height="7" rx="3" fill="{{neonB}}"></rect></svg></div><div class="tc-obj tc-objL" style="animation-duration: {{objDur}}; animation-delay: {{objDelay2}}; animation-play-state: {{playState}}"><svg viewBox="0 0 140 420" width="140" height="420" style="position: absolute; left: -70px; bottom: 0; overflow: visible; display: block"><rect x="1.5" y="1.5" width="137" height="417" fill="#04101A" fill-opacity="0.9" stroke="{{neonA}}" stroke-width="3"></rect><line x1="4" y1="30" x2="136" y2="30" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="60" x2="136" y2="60" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="90" x2="136" y2="90" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="120" x2="136" y2="120" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="150" x2="136" y2="150" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="180" x2="136" y2="180" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="210" x2="136" y2="210" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="240" x2="136" y2="240" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="270" x2="136" y2="270" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="300" x2="136" y2="300" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="330" x2="136" y2="330" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="360" x2="136" y2="360" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="390" x2="136" y2="390" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><g fill="{{neonB}}" opacity="0.85"><rect x="10" y="12" width="12" height="8"></rect><rect x="34" y="12" width="12" height="8"></rect><rect x="82" y="42" width="12" height="8"></rect><rect x="58" y="72" width="12" height="8"></rect><rect x="82" y="72" width="12" height="8"></rect><rect x="106" y="102" width="12" height="8"></rect><rect x="10" y="132" width="12" height="8"></rect><rect x="10" y="222" width="12" height="8"></rect><rect x="58" y="222" width="12" height="8"></rect><rect x="82" y="222" width="12" height="8"></rect><rect x="82" y="252" width="12" height="8"></rect><rect x="106" y="252" width="12" height="8"></rect><rect x="10" y="282" width="12" height="8"></rect><rect x="58" y="282" width="12" height="8"></rect><rect x="82" y="282" width="12" height="8"></rect><rect x="106" y="312" width="12" height="8"></rect><rect x="82" y="342" width="12" height="8"></rect><rect x="106" y="342" width="12" height="8"></rect></g><line x1="1.5" y1="1.5" x2="138" y2="1.5" stroke="{{neonB}}" stroke-width="3"></line></svg></div><div class="tc-obj tc-objL" style="animation-duration: {{objDur}}; animation-delay: {{objDelay3}}; animation-play-state: {{playState}}"><svg viewBox="0 0 60 260" width="60" height="260" style="position: absolute; left: -30px; bottom: 0; overflow: visible; display: block"><line x1="13" y1="4" x2="13" y2="260" stroke="{{neonA}}" stroke-width="4"></line><line x1="13" y1="4" x2="47" y2="4" stroke="{{neonA}}" stroke-width="4"></line><rect x="39" y="1" width="20" height="7" rx="3" fill="{{neonB}}"></rect></svg></div><div class="tc-obj tc-objR" style="animation-duration: {{objDur}}; animation-delay: {{objDelay0}}; animation-play-state: {{playState}}"><svg viewBox="0 0 150 400" width="150" height="400" style="position: absolute; left: -75px; bottom: 0; overflow: visible; display: block"><rect x="1.5" y="1.5" width="147" height="397" fill="#04101A" fill-opacity="0.9" stroke="{{neonA}}" stroke-width="3"></rect><line x1="4" y1="30" x2="146" y2="30" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="60" x2="146" y2="60" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="90" x2="146" y2="90" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="120" x2="146" y2="120" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="150" x2="146" y2="150" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="180" x2="146" y2="180" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="210" x2="146" y2="210" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="240" x2="146" y2="240" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="270" x2="146" y2="270" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="300" x2="146" y2="300" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="330" x2="146" y2="330" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="360" x2="146" y2="360" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><g fill="{{neonB}}" opacity="0.85"><rect x="106" y="12" width="12" height="8"></rect><rect x="34" y="42" width="12" height="8"></rect><rect x="106" y="42" width="12" height="8"></rect><rect x="106" y="72" width="12" height="8"></rect><rect x="82" y="102" width="12" height="8"></rect><rect x="106" y="102" width="12" height="8"></rect><rect x="10" y="132" width="12" height="8"></rect><rect x="34" y="132" width="12" height="8"></rect><rect x="82" y="132" width="12" height="8"></rect><rect x="34" y="162" width="12" height="8"></rect><rect x="10" y="192" width="12" height="8"></rect><rect x="34" y="192" width="12" height="8"></rect><rect x="58" y="192" width="12" height="8"></rect><rect x="34" y="222" width="12" height="8"></rect><rect x="34" y="252" width="12" height="8"></rect><rect x="82" y="252" width="12" height="8"></rect><rect x="10" y="282" width="12" height="8"></rect><rect x="58" y="282" width="12" height="8"></rect><rect x="10" y="312" width="12" height="8"></rect><rect x="106" y="312" width="12" height="8"></rect><rect x="82" y="342" width="12" height="8"></rect></g><line x1="1.5" y1="1.5" x2="148" y2="1.5" stroke="{{neonB}}" stroke-width="3"></line></svg></div><div class="tc-obj tc-objR" style="animation-duration: {{objDur}}; animation-delay: {{objDelay1}}; animation-play-state: {{playState}}"><svg viewBox="0 0 190 300" width="190" height="300" style="position: absolute; left: -95px; bottom: 0; overflow: visible; display: block"><rect x="1.5" y="1.5" width="187" height="297" fill="#04101A" fill-opacity="0.9" stroke="{{neonA}}" stroke-width="3"></rect><line x1="4" y1="30" x2="186" y2="30" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="60" x2="186" y2="60" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="90" x2="186" y2="90" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="120" x2="186" y2="120" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="150" x2="186" y2="150" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="180" x2="186" y2="180" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="210" x2="186" y2="210" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="240" x2="186" y2="240" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="270" x2="186" y2="270" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><g fill="{{neonB}}" opacity="0.85"><rect x="58" y="12" width="12" height="8"></rect><rect x="34" y="42" width="12" height="8"></rect><rect x="58" y="42" width="12" height="8"></rect><rect x="82" y="42" width="12" height="8"></rect><rect x="34" y="72" width="12" height="8"></rect><rect x="10" y="102" width="12" height="8"></rect><rect x="34" y="102" width="12" height="8"></rect><rect x="82" y="102" width="12" height="8"></rect><rect x="34" y="132" width="12" height="8"></rect><rect x="154" y="132" width="12" height="8"></rect><rect x="106" y="192" width="12" height="8"></rect><rect x="106" y="222" width="12" height="8"></rect><rect x="34" y="252" width="12" height="8"></rect><rect x="82" y="252" width="12" height="8"></rect></g><line x1="1.5" y1="1.5" x2="188" y2="1.5" stroke="{{neonB}}" stroke-width="3"></line></svg></div><div class="tc-obj tc-objR" style="animation-duration: {{objDur}}; animation-delay: {{objDelay2}}; animation-play-state: {{playState}}"><svg viewBox="0 0 130 460" width="130" height="460" style="position: absolute; left: -65px; bottom: 0; overflow: visible; display: block"><rect x="1.5" y="1.5" width="127" height="457" fill="#04101A" fill-opacity="0.9" stroke="{{neonA}}" stroke-width="3"></rect><line x1="4" y1="30" x2="126" y2="30" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="60" x2="126" y2="60" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="90" x2="126" y2="90" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="120" x2="126" y2="120" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="150" x2="126" y2="150" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="180" x2="126" y2="180" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="210" x2="126" y2="210" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="240" x2="126" y2="240" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="270" x2="126" y2="270" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="300" x2="126" y2="300" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="330" x2="126" y2="330" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="360" x2="126" y2="360" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="390" x2="126" y2="390" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="420" x2="126" y2="420" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><g fill="{{neonB}}" opacity="0.85"><rect x="34" y="12" width="12" height="8"></rect><rect x="106" y="12" width="12" height="8"></rect><rect x="82" y="42" width="12" height="8"></rect><rect x="34" y="72" width="12" height="8"></rect><rect x="82" y="72" width="12" height="8"></rect><rect x="10" y="102" width="12" height="8"></rect><rect x="58" y="102" width="12" height="8"></rect><rect x="82" y="132" width="12" height="8"></rect><rect x="106" y="132" width="12" height="8"></rect><rect x="34" y="162" width="12" height="8"></rect><rect x="58" y="162" width="12" height="8"></rect><rect x="106" y="162" width="12" height="8"></rect><rect x="82" y="192" width="12" height="8"></rect><rect x="10" y="222" width="12" height="8"></rect><rect x="82" y="222" width="12" height="8"></rect><rect x="106" y="222" width="12" height="8"></rect><rect x="34" y="252" width="12" height="8"></rect><rect x="34" y="282" width="12" height="8"></rect><rect x="10" y="312" width="12" height="8"></rect><rect x="34" y="312" width="12" height="8"></rect><rect x="106" y="312" width="12" height="8"></rect><rect x="106" y="342" width="12" height="8"></rect><rect x="34" y="372" width="12" height="8"></rect><rect x="10" y="402" width="12" height="8"></rect><rect x="34" y="402" width="12" height="8"></rect><rect x="82" y="432" width="12" height="8"></rect></g><line x1="1.5" y1="1.5" x2="128" y2="1.5" stroke="{{neonB}}" stroke-width="3"></line></svg></div><div class="tc-obj tc-objR" style="animation-duration: {{objDur}}; animation-delay: {{objDelay3}}; animation-play-state: {{playState}}"><svg viewBox="0 0 170 340" width="170" height="340" style="position: absolute; left: -85px; bottom: 0; overflow: visible; display: block"><rect x="1.5" y="1.5" width="167" height="337" fill="#04101A" fill-opacity="0.9" stroke="{{neonA}}" stroke-width="3"></rect><line x1="4" y1="30" x2="166" y2="30" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="60" x2="166" y2="60" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="90" x2="166" y2="90" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="120" x2="166" y2="120" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="150" x2="166" y2="150" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="180" x2="166" y2="180" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="210" x2="166" y2="210" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="240" x2="166" y2="240" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="270" x2="166" y2="270" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><line x1="4" y1="300" x2="166" y2="300" stroke="{{neonA}}" stroke-width="1" opacity="0.35"></line><g fill="{{neonB}}" opacity="0.85"><rect x="10" y="12" width="12" height="8"></rect><rect x="82" y="12" width="12" height="8"></rect><rect x="106" y="12" width="12" height="8"></rect><rect x="34" y="42" width="12" height="8"></rect><rect x="58" y="42" width="12" height="8"></rect><rect x="82" y="42" width="12" height="8"></rect><rect x="106" y="42" width="12" height="8"></rect><rect x="58" y="72" width="12" height="8"></rect><rect x="82" y="72" width="12" height="8"></rect><rect x="106" y="102" width="12" height="8"></rect><rect x="10" y="132" width="12" height="8"></rect><rect x="34" y="132" width="12" height="8"></rect><rect x="130" y="132" width="12" height="8"></rect><rect x="58" y="162" width="12" height="8"></rect><rect x="34" y="192" width="12" height="8"></rect><rect x="130" y="222" width="12" height="8"></rect><rect x="130" y="252" width="12" height="8"></rect><rect x="82" y="282" width="12" height="8"></rect><rect x="106" y="312" width="12" height="8"></rect></g><line x1="1.5" y1="1.5" x2="168" y2="1.5" stroke="{{neonB}}" stroke-width="3"></line></svg></div></sc-if><sc-if value="{{isSuburb}}" hint-placeholder-val="{{ false }}"><div class="tc-obj tc-objL" style="animation-duration: {{objDur}}; animation-delay: {{objDelay0}}; animation-play-state: {{playState}}"><svg viewBox="0 0 160 220" width="160" height="220" style="position: absolute; left: -80px; bottom: 0; overflow: visible; display: block"><path d="M80 220 L80 120 M80 130 L50 84 M80 126 L112 80 M80 112 L84 54" stroke="{{neonA}}" stroke-width="4" stroke-linecap="round" fill="none"></path><g fill="{{leafNeon}}" fill-opacity="0.12" stroke="{{leafNeon}}" stroke-width="3" opacity="{{leafOp}}"><circle cx="48" cy="84" r="36"></circle><circle cx="112" cy="80" r="38"></circle><circle cx="80" cy="44" r="40"></circle></g><g fill="{{neonC}}" opacity="{{blossomOp}}"><circle cx="40" cy="70" r="5"></circle><circle cx="66" cy="52" r="5"></circle><circle cx="96" cy="38" r="5"></circle><circle cx="120" cy="70" r="5"></circle><circle cx="104" cy="96" r="5"></circle><circle cx="58" cy="96" r="5"></circle><circle cx="86" cy="20" r="5"></circle><circle cx="130" cy="92" r="5"></circle></g></svg></div><div class="tc-obj tc-objL" style="animation-duration: {{objDur}}; animation-delay: {{objDelay1}}; animation-play-state: {{playState}}"><svg viewBox="0 0 210 150" width="210" height="150" style="position: absolute; left: -105px; bottom: 0; overflow: visible; display: block"><path d="M20 150 L20 64 L105 8 L190 64 L190 150" fill="#04101A" fill-opacity="0.9" stroke="{{neonA}}" stroke-width="3"></path><path d="M6 66 L105 4 L204 66" fill="none" stroke="{{neonB}}" stroke-width="3"></path><rect x="40" y="84" width="34" height="26" fill="{{neonB}}" opacity="0.75"></rect><rect x="136" y="84" width="34" height="26" fill="{{neonB}}" opacity="0.75"></rect><rect x="92" y="104" width="26" height="46" fill="none" stroke="{{neonA}}" stroke-width="2"></rect></svg></div><div class="tc-obj tc-objL" style="animation-duration: {{objDur}}; animation-delay: {{objDelay2}}; animation-play-state: {{playState}}"><svg viewBox="0 0 60 260" width="60" height="260" style="position: absolute; left: -30px; bottom: 0; overflow: visible; display: block"><line x1="13" y1="4" x2="13" y2="260" stroke="{{neonA}}" stroke-width="4"></line><line x1="13" y1="4" x2="47" y2="4" stroke="{{neonA}}" stroke-width="4"></line><rect x="39" y="1" width="20" height="7" rx="3" fill="{{neonB}}"></rect></svg></div><div class="tc-obj tc-objL" style="animation-duration: {{objDur}}; animation-delay: {{objDelay3}}; animation-play-state: {{playState}}"><svg viewBox="0 0 210 150" width="210" height="150" style="position: absolute; left: -105px; bottom: 0; overflow: visible; display: block"><path d="M20 150 L20 64 L105 8 L190 64 L190 150" fill="#04101A" fill-opacity="0.9" stroke="{{neonA}}" stroke-width="3"></path><path d="M6 66 L105 4 L204 66" fill="none" stroke="{{neonB}}" stroke-width="3"></path><rect x="40" y="84" width="34" height="26" fill="{{neonB}}" opacity="0.75"></rect><rect x="136" y="84" width="34" height="26" fill="{{neonB}}" opacity="0.75"></rect><rect x="92" y="104" width="26" height="46" fill="none" stroke="{{neonA}}" stroke-width="2"></rect></svg></div><div class="tc-obj tc-objR" style="animation-duration: {{objDur}}; animation-delay: {{objDelay0}}; animation-play-state: {{playState}}"><svg viewBox="0 0 210 150" width="210" height="150" style="position: absolute; left: -105px; bottom: 0; overflow: visible; display: block"><path d="M20 150 L20 64 L105 8 L190 64 L190 150" fill="#04101A" fill-opacity="0.9" stroke="{{neonA}}" stroke-width="3"></path><path d="M6 66 L105 4 L204 66" fill="none" stroke="{{neonB}}" stroke-width="3"></path><rect x="40" y="84" width="34" height="26" fill="{{neonB}}" opacity="0.75"></rect><rect x="136" y="84" width="34" height="26" fill="{{neonB}}" opacity="0.75"></rect><rect x="92" y="104" width="26" height="46" fill="none" stroke="{{neonA}}" stroke-width="2"></rect></svg></div><div class="tc-obj tc-objR" style="animation-duration: {{objDur}}; animation-delay: {{objDelay1}}; animation-play-state: {{playState}}"><svg viewBox="0 0 160 220" width="160" height="220" style="position: absolute; left: -80px; bottom: 0; overflow: visible; display: block"><path d="M80 220 L80 120 M80 130 L50 84 M80 126 L112 80 M80 112 L84 54" stroke="{{neonA}}" stroke-width="4" stroke-linecap="round" fill="none"></path><g fill="{{leafNeon}}" fill-opacity="0.12" stroke="{{leafNeon}}" stroke-width="3" opacity="{{leafOp}}"><circle cx="48" cy="84" r="36"></circle><circle cx="112" cy="80" r="38"></circle><circle cx="80" cy="44" r="40"></circle></g><g fill="{{neonC}}" opacity="{{blossomOp}}"><circle cx="40" cy="70" r="5"></circle><circle cx="66" cy="52" r="5"></circle><circle cx="96" cy="38" r="5"></circle><circle cx="120" cy="70" r="5"></circle><circle cx="104" cy="96" r="5"></circle><circle cx="58" cy="96" r="5"></circle><circle cx="86" cy="20" r="5"></circle><circle cx="130" cy="92" r="5"></circle></g></svg></div><div class="tc-obj tc-objR" style="animation-duration: {{objDur}}; animation-delay: {{objDelay2}}; animation-play-state: {{playState}}"><svg viewBox="0 0 210 150" width="210" height="150" style="position: absolute; left: -105px; bottom: 0; overflow: visible; display: block"><path d="M20 150 L20 64 L105 8 L190 64 L190 150" fill="#04101A" fill-opacity="0.9" stroke="{{neonA}}" stroke-width="3"></path><path d="M6 66 L105 4 L204 66" fill="none" stroke="{{neonB}}" stroke-width="3"></path><rect x="40" y="84" width="34" height="26" fill="{{neonB}}" opacity="0.75"></rect><rect x="136" y="84" width="34" height="26" fill="{{neonB}}" opacity="0.75"></rect><rect x="92" y="104" width="26" height="46" fill="none" stroke="{{neonA}}" stroke-width="2"></rect></svg></div><div class="tc-obj tc-objR" style="animation-duration: {{objDur}}; animation-delay: {{objDelay3}}; animation-play-state: {{playState}}"><svg viewBox="0 0 170 260" width="170" height="260" style="position: absolute; left: -85px; bottom: 0; overflow: visible; display: block"><path d="M85 260 L82 140 L52 84 M82 140 L118 74 M82 150 L84 64" stroke="{{neonA}}" stroke-width="4" stroke-linecap="round" fill="none"></path><g fill="{{leafNeon}}" fill-opacity="0.12" stroke="{{leafNeon}}" stroke-width="3"><ellipse cx="48" cy="80" rx="38" ry="20"></ellipse><ellipse cx="86" cy="54" rx="42" ry="24"></ellipse><ellipse cx="124" cy="72" rx="36" ry="20"></ellipse></g></svg></div></sc-if><sc-if value="{{isCountry}}" hint-placeholder-val="{{ false }}"><div class="tc-obj tc-objL" style="animation-duration: {{objDur}}; animation-delay: {{objDelay0}}; animation-play-state: {{playState}}"><svg viewBox="0 0 16 56" width="16" height="56" style="position: absolute; left: -8px; bottom: 0; overflow: visible; display: block"><rect x="5" y="0" width="5" height="56" fill="{{neonA}}"></rect><rect x="2" y="6" width="11" height="10" rx="2" fill="{{neonB}}"></rect></svg></div><div class="tc-obj tc-objL" style="animation-duration: {{objDur}}; animation-delay: {{objDelay1}}; animation-play-state: {{playState}}"><svg viewBox="0 0 170 260" width="170" height="260" style="position: absolute; left: -85px; bottom: 0; overflow: visible; display: block"><path d="M85 260 L82 140 L52 84 M82 140 L118 74 M82 150 L84 64" stroke="{{neonA}}" stroke-width="4" stroke-linecap="round" fill="none"></path><g fill="{{leafNeon}}" fill-opacity="0.12" stroke="{{leafNeon}}" stroke-width="3"><ellipse cx="48" cy="80" rx="38" ry="20"></ellipse><ellipse cx="86" cy="54" rx="42" ry="24"></ellipse><ellipse cx="124" cy="72" rx="36" ry="20"></ellipse></g></svg></div><div class="tc-obj tc-objL" style="animation-duration: {{objDur}}; animation-delay: {{objDelay2}}; animation-play-state: {{playState}}"><svg viewBox="0 0 16 56" width="16" height="56" style="position: absolute; left: -8px; bottom: 0; overflow: visible; display: block"><rect x="5" y="0" width="5" height="56" fill="{{neonA}}"></rect><rect x="2" y="6" width="11" height="10" rx="2" fill="{{neonB}}"></rect></svg></div><div class="tc-obj tc-objL" style="animation-duration: {{objDur}}; animation-delay: {{objDelay3}}; animation-play-state: {{playState}}"><svg viewBox="0 0 160 220" width="160" height="220" style="position: absolute; left: -80px; bottom: 0; overflow: visible; display: block"><path d="M80 220 L80 120 M80 130 L50 84 M80 126 L112 80 M80 112 L84 54" stroke="{{neonA}}" stroke-width="4" stroke-linecap="round" fill="none"></path><g fill="{{leafNeon}}" fill-opacity="0.12" stroke="{{leafNeon}}" stroke-width="3" opacity="{{leafOp}}"><circle cx="48" cy="84" r="36"></circle><circle cx="112" cy="80" r="38"></circle><circle cx="80" cy="44" r="40"></circle></g><g fill="{{neonC}}" opacity="{{blossomOp}}"><circle cx="40" cy="70" r="5"></circle><circle cx="66" cy="52" r="5"></circle><circle cx="96" cy="38" r="5"></circle><circle cx="120" cy="70" r="5"></circle><circle cx="104" cy="96" r="5"></circle><circle cx="58" cy="96" r="5"></circle><circle cx="86" cy="20" r="5"></circle><circle cx="130" cy="92" r="5"></circle></g></svg></div><div class="tc-obj tc-objR" style="animation-duration: {{objDur}}; animation-delay: {{objDelay0}}; animation-play-state: {{playState}}"><svg viewBox="0 0 170 260" width="170" height="260" style="position: absolute; left: -85px; bottom: 0; overflow: visible; display: block"><path d="M85 260 L82 140 L52 84 M82 140 L118 74 M82 150 L84 64" stroke="{{neonA}}" stroke-width="4" stroke-linecap="round" fill="none"></path><g fill="{{leafNeon}}" fill-opacity="0.12" stroke="{{leafNeon}}" stroke-width="3"><ellipse cx="48" cy="80" rx="38" ry="20"></ellipse><ellipse cx="86" cy="54" rx="42" ry="24"></ellipse><ellipse cx="124" cy="72" rx="36" ry="20"></ellipse></g></svg></div><div class="tc-obj tc-objR" style="animation-duration: {{objDur}}; animation-delay: {{objDelay1}}; animation-play-state: {{playState}}"><svg viewBox="0 0 16 56" width="16" height="56" style="position: absolute; left: -8px; bottom: 0; overflow: visible; display: block"><rect x="5" y="0" width="5" height="56" fill="{{neonA}}"></rect><rect x="2" y="6" width="11" height="10" rx="2" fill="{{neonB}}"></rect></svg></div><div class="tc-obj tc-objR" style="animation-duration: {{objDur}}; animation-delay: {{objDelay2}}; animation-play-state: {{playState}}"><svg viewBox="0 0 170 260" width="170" height="260" style="position: absolute; left: -85px; bottom: 0; overflow: visible; display: block"><path d="M85 260 L82 140 L52 84 M82 140 L118 74 M82 150 L84 64" stroke="{{neonA}}" stroke-width="4" stroke-linecap="round" fill="none"></path><g fill="{{leafNeon}}" fill-opacity="0.12" stroke="{{leafNeon}}" stroke-width="3"><ellipse cx="48" cy="80" rx="38" ry="20"></ellipse><ellipse cx="86" cy="54" rx="42" ry="24"></ellipse><ellipse cx="124" cy="72" rx="36" ry="20"></ellipse></g></svg></div><div class="tc-obj tc-objR" style="animation-duration: {{objDur}}; animation-delay: {{objDelay3}}; animation-play-state: {{playState}}"><svg viewBox="0 0 16 56" width="16" height="56" style="position: absolute; left: -8px; bottom: 0; overflow: visible; display: block"><rect x="5" y="0" width="5" height="56" fill="{{neonA}}"></rect><rect x="2" y="6" width="11" height="10" rx="2" fill="{{neonB}}"></rect></svg></div></sc-if></div>
    <div style="position: absolute; left: 0; right: 0; top: 140px; height: 380px; background: #5FD4F0; opacity: {{fogOp}}; filter: blur(40px)"></div>
    <sc-if value="{{isRain}}" hint-placeholder-val="{{ false }}"><div class="tc-rain" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0"></div></sc-if>
    <sc-if value="{{showFall}}" hint-placeholder-val="{{ false }}"><div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; overflow: hidden"><div class="tc-fall" style="left: 20%; animation-duration: 6s; animation-delay: 0s; width: 10px; height: 6px; background: {{fallColor}}; box-shadow: 0 0 8px {{fallColor}}"></div><div class="tc-fall" style="left: 34%; animation-duration: 8s; animation-delay: 2.5s; width: 8px; height: 4px; background: {{fallColor}}; box-shadow: 0 0 8px {{fallColor}}"></div><div class="tc-fall" style="left: 48%; animation-duration: 7s; animation-delay: 1s; width: 11px; height: 6px; background: {{fallColor}}; box-shadow: 0 0 8px {{fallColor}}"></div><div class="tc-fall" style="left: 60%; animation-duration: 9s; animation-delay: 4s; width: 9px; height: 5px; background: {{fallColor}}; box-shadow: 0 0 8px {{fallColor}}"></div><div class="tc-fall" style="left: 72%; animation-duration: 6.5s; animation-delay: 3s; width: 10px; height: 6px; background: {{fallColor}}; box-shadow: 0 0 8px {{fallColor}}"></div><div class="tc-fall" style="left: 84%; animation-duration: 8.5s; animation-delay: 0.5s; width: 8px; height: 4px; background: {{fallColor}}; box-shadow: 0 0 8px {{fallColor}}"></div><div class="tc-fall" style="left: 94%; animation-duration: 7.5s; animation-delay: 5s; width: 11px; height: 6px; background: {{fallColor}}; box-shadow: 0 0 8px {{fallColor}}"></div><div class="tc-fall" style="left: 54%; animation-duration: 10s; animation-delay: 6s; width: 9px; height: 5px; background: {{fallColor}}; box-shadow: 0 0 8px {{fallColor}}"></div></div></sc-if>
  </div>
  <sc-if value="{{scOn}}" hint-placeholder-val="{{ false }}">
  <div aria-hidden="true" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; overflow: hidden">
    <div style="position: absolute; left: 0; right: 0; top: 0; height: 180px; background: {{sc.skyTop}}"></div>
    <div style="position: absolute; left: 0; right: 0; top: 180px; height: 120px; background: {{sc.skyLow}}"></div>
    <div style="position: absolute; left: 0; top: 0; width: 2px; height: 2px; border-radius: 50%; box-shadow: {{sc.stars}}; opacity: {{sc.starOp}}"></div>
    <div style="position: absolute; left: {{sc.sunLeft}}; top: {{sc.sunTop}}; width: 54px; height: 54px; border-radius: 50%; background: {{sc.sunColor}}; opacity: {{sc.sunOp}}; box-shadow: 0 0 50px {{sc.sunGlow}}"></div>
    <svg viewBox="0 0 1280 720" width="1280" height="720" class="{{sc.glow}}" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: block"><sc-for list="{{sc.horizon}}" as="q" hint-placeholder-count="3"><path d="{{q.d}}" fill="{{q.f}}" stroke="{{q.s}}" stroke-width="{{q.w}}" transform="{{q.t}}" opacity="{{q.o}}" stroke-linecap="round" stroke-linejoin="round" fill-rule="evenodd"></path></sc-for></svg>
    <div style="position: absolute; left: 0; right: 0; top: 300px; bottom: 0; background: {{sc.ground}}"></div>
    <svg viewBox="0 0 1280 720" width="1280" height="720" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: block"><sc-for list="{{sc.water}}" as="q" hint-placeholder-count="1"><path d="{{q.d}}" fill="{{q.f}}" stroke="{{q.s}}" stroke-width="{{q.w}}" transform="{{q.t}}" opacity="{{q.o}}" stroke-linecap="round" stroke-linejoin="round" fill-rule="evenodd"></path></sc-for>
      <polygon points="637,300 643,300 2400,720 -300,720" fill="{{sc.road}}"></polygon>
      <line x1="636" y1="300" x2="-230" y2="720" stroke="{{sc.edgeC}}" stroke-width="5"></line>
      <line x1="644" y1="300" x2="2200" y2="720" stroke="{{sc.edgeC}}" stroke-width="5"></line>
      <ellipse cx="560" cy="640" rx="460" ry="150" fill="#FFF3C4" opacity="{{sc.beamOp}}"></ellipse>
    </svg>
    <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; overflow: hidden"><sc-for list="{{sc.lanes}}" as="l" hint-placeholder-count="4"><div class="tc-lane" style="animation-duration: {{l.dur}}; animation-delay: {{l.delay}}; animation-play-state: {{l.ps}}"><div style="position: absolute; left: -6px; top: -60px; width: 12px; height: 120px; border-radius: 3px; background: {{l.c}}; box-shadow: {{l.glow}}; transform: rotate(-52deg)"></div></div></sc-for></div>
    <div class="{{sc.glow}}" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; overflow: hidden"><sc-for list="{{sc.objs}}" as="o" hint-placeholder-count="8"><div class="{{o.cls}}" style="animation-duration: {{o.dur}}; animation-delay: {{o.delay}}; animation-play-state: {{o.ps}}"><svg viewBox="{{o.vb}}" width="{{o.w}}" height="{{o.h}}" style="position: absolute; left: {{o.left}}; bottom: 0; overflow: visible; display: block"><sc-for list="{{o.prims}}" as="q" hint-placeholder-count="3"><path d="{{q.d}}" fill="{{q.f}}" stroke="{{q.s}}" stroke-width="{{q.w}}" transform="{{q.t}}" opacity="{{q.o}}" stroke-linecap="round" stroke-linejoin="round" fill-rule="evenodd"></path></sc-for><sc-for list="{{o.texts}}" as="x" hint-placeholder-count="1"><text x="{{x.x}}" y="{{x.y}}" text-anchor="middle" font-size="{{x.size}}" font-weight="800" fill="{{x.f}}" font-family="Overpass, 'Segoe UI', sans-serif">{{x.txt}}</text></sc-for></svg></div></sc-for></div>
    <sc-if value="{{sc.rainOn}}" hint-placeholder-val="{{ false }}"><div class="tc-sgrain" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0"></div><svg viewBox="0 0 1280 720" width="1280" height="720" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: block"><g class="tc-wiper"><line x1="420" y1="640" x2="420" y2="250" stroke="#11181D" stroke-width="7" stroke-linecap="round"></line></g><g class="tc-wiper tc-wiper2"><line x1="860" y1="640" x2="860" y2="250" stroke="#11181D" stroke-width="7" stroke-linecap="round"></line></g></svg></sc-if>
  </div>
  </sc-if>
  <sc-if value="{{isStorm}}" hint-placeholder-val="{{ false }}"><div class="tc-flash" aria-hidden="true" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: #CFF6FF"></div></sc-if>

  
<svg viewBox="0 0 1280 720" width="1280" height="720" aria-hidden="true" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: block">
  <defs>
    <linearGradient id="tnAmb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FBB040"></stop><stop offset="0.5" stop-color="#5FD4F0"></stop><stop offset="1" stop-color="#FBB040"></stop></linearGradient>
  </defs>
  <path d="M0 0 L1280 0 L1280 22 Q640 40 0 22 Z" fill="#010407"></path>
  <path d="M0 22 Q640 40 1280 22" fill="none" stroke="#5FD4F0" stroke-width="1.5" opacity="0.6"></path>
  <polygon points="0,0 74,0 14,470 0,480" fill="#010407"></polygon>
  <polygon points="1280,0 1206,0 1266,470 1280,480" fill="#010407"></polygon>
  <line x1="74" y1="0" x2="14" y2="470" stroke="#5FD4F0" stroke-width="2" opacity="0.7"></line>
  <line x1="1206" y1="0" x2="1266" y2="470" stroke="#5FD4F0" stroke-width="2" opacity="0.7"></line>
  <rect x="552" y="96" width="176" height="56" rx="10" fill="#020A12" stroke="#5FD4F0" stroke-width="2"></rect>
  <path d="M640 148 L596 106 M640 148 L684 106" stroke="#FBB040" stroke-width="2" opacity="0.6"></path>
  <line x1="640" y1="148" x2="640" y2="106" stroke="#5FD4F0" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.7"></line>
  <text x="566" y="114" fill="#5FD4F0" font-size="9" font-weight="700" font-family="Chakra Petch, sans-serif">{{rearCam}}</text>
  <circle cx="714" cy="110" r="3" fill="#E5484D"></circle>
  <g opacity="0.92">
    <text x="1000" y="372" text-anchor="middle" fill="#CFF6FF" font-size="54" font-weight="700" font-family="Chakra Petch, sans-serif">{{speed}}</text>
    <text x="1000" y="392" text-anchor="middle" fill="#5FD4F0" font-size="12" font-family="Chakra Petch, sans-serif">KM/H</text>
    <rect data-demo="1" x="1081" y="321" width="46" height="61" rx="4" fill="#E9E4D8"></rect><circle data-demo="1" cx="1104" cy="351.5" r="18.5" fill="none" stroke="#C8423F" stroke-width="4.6"></circle>
    <text data-demo="1" x="1104" y="358.5" text-anchor="middle" fill="#1A1A1A" font-size="19" font-weight="800" font-family="Overpass, sans-serif">60</text>
    <path data-demo="1" d="M900 372 L900 344 L884 344 L908 316 L932 344 L916 344 L916 372 Z" fill="#FBB040" opacity="0.9" transform="rotate(-90 908 344) translate(-6 -30)"></path>
    <text x="908" y="404" text-anchor="middle" fill="#FBB040" font-size="12" font-weight="600" font-family="Chakra Petch, sans-serif">{{hudTurn}}</text>
  </g>
  <path d="M0 548 Q640 500 1280 548 L1280 720 L0 720 Z" fill="#010407"></path>
  <path d="M0 548 Q640 500 1280 548" fill="none" stroke="url(#tnAmb)" stroke-width="10" opacity="0.25"></path>
  <path d="M0 548 Q640 500 1280 548" fill="none" stroke="url(#tnAmb)" stroke-width="2.5"></path>
  <rect x="700" y="548" width="480" height="96" rx="16" fill="#03111C" fill-opacity="0.85" stroke="#5FD4F0" stroke-width="1.5"></rect>
  <circle cx="790" cy="596" r="34" fill="none" stroke="#123044" stroke-width="7"></circle>
  <circle cx="790" cy="596" r="34" fill="none" stroke="#5FD4F0" stroke-width="7" stroke-linecap="round" stroke-dasharray="{{speedDash}}" transform="rotate(-90 790 596)"></circle>
  <text x="790" y="604" text-anchor="middle" fill="#CFF6FF" font-size="22" font-weight="700" font-family="Chakra Petch, sans-serif">{{speed}}</text>
  <circle cx="1090" cy="596" r="34" fill="none" stroke="#2A2010" stroke-width="7"></circle>
  <circle cx="1090" cy="596" r="34" fill="none" stroke="#FBB040" stroke-width="7" stroke-linecap="round" stroke-dasharray="{{rpmDash}}" transform="rotate(-90 1090 596)"></circle>
  <text x="1090" y="601" text-anchor="middle" fill="#FFE2B3" font-size="13" font-weight="700" font-family="Chakra Petch, sans-serif">{{rpmText}}</text>
  <text x="940" y="590" text-anchor="middle" fill="#7BD88F" font-size="30" font-weight="700" font-family="Chakra Petch, sans-serif">D</text>
  <rect x="880" y="606" width="120" height="5" rx="2.5" fill="#123044"></rect><rect x="880" y="606" width="84" height="5" rx="2.5" fill="#5FD4F0"></rect>
  <rect x="880" y="620" width="120" height="5" rx="2.5" fill="#123044"></rect><rect x="880" y="620" width="56" height="5" rx="2.5" fill="#7BD88F"></rect>
  <g class="{{wheelClass}}" style="transform-origin: 940px 860px">
    <path d="M750 798 A200 200 0 0 1 1130 798" fill="none" stroke="#020A12" stroke-width="34" stroke-linecap="round"></path>
    <path d="M758 778 A200 200 0 0 1 1122 778" fill="none" stroke="#5FD4F0" stroke-width="2" opacity="0.8"></path>
    <rect x="935" y="646" width="10" height="26" rx="3" fill="#FBB040"></rect>
  </g>
</svg>
  <sc-if value="{{g.on}}" hint-placeholder-val="{{ false }}">
    <svg viewBox="0 0 480 96" width="480" height="96" aria-label="{{g.aria}}" style="position: absolute; left: 700px; top: 548px; display: block"><sc-if value="{{g.classic}}" hint-placeholder-val="{{ false }}"><rect x="0" y="0" width="480" height="96" rx="16" fill="#0A0C0E" stroke="#3A3F44" stroke-width="1.5"></rect><circle cx="62" cy="52" r="42" fill="#111417" stroke="#555C62" stroke-width="2"></circle><path d="M27.4 72.0L32.6 69.0M22.0 52.0L28.0 52.0M27.4 32.0L32.6 35.0M42.0 17.4L45.0 22.6M62.0 12.0L62.0 18.0M82.0 17.4L79.0 22.6M96.6 32.0L91.4 35.0M102.0 52.0L96.0 52.0M96.6 72.0L91.4 69.0" stroke="#E8ECEF" stroke-width="2"></path><g transform="rotate({{g.spdA}} 62 52)"><path d="M62 52L62 18" stroke="#FBB040" stroke-width="3"></path></g><circle cx="62" cy="52" r="4" fill="#FBB040"></circle><text x="62" y="80" text-anchor="middle" fill="#E8ECEF" font-size="13" font-weight="700" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{speed}}</text><circle cx="418" cy="52" r="42" fill="#111417" stroke="#555C62" stroke-width="2"></circle><path d="M383.4 72.0L388.6 69.0M378.1 49.0L384.1 49.5M386.7 27.1L391.4 30.8M406.2 13.8L408.0 19.5M429.8 13.8L428.0 19.5M449.3 27.1L444.6 30.8M457.9 49.0L451.9 49.5M452.6 72.0L447.4 69.0" stroke="#E8ECEF" stroke-width="2"></path><g transform="rotate({{g.rpmA}} 418 52)"><path d="M418 52L418 18" stroke="#FBB040" stroke-width="3"></path></g><circle cx="418" cy="52" r="4" fill="#FBB040"></circle><text x="418" y="80" text-anchor="middle" fill="#9AA4AA" font-size="9" font-family="Chakra Petch, 'Segoe UI', sans-serif">x1000 RPM</text><text x="240" y="38" text-anchor="middle" fill="#7BD88F" font-size="22" font-weight="700" font-family="Chakra Petch, 'Segoe UI', sans-serif">D</text><text x="240" y="58" text-anchor="middle" fill="#E8ECEF" font-size="12" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{g.trip}}</text><text x="240" y="74" text-anchor="middle" fill="#9AA4AA" font-size="10" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{g.odo}}</text></sc-if><sc-if value="{{g.bar}}" hint-placeholder-val="{{ false }}"><rect x="0" y="0" width="480" height="96" rx="16" fill="#03111C" fill-opacity="0.9" stroke="#1E4A63" stroke-width="1.5"></rect><text x="90" y="62" text-anchor="middle" fill="{{g.spdC}}" font-size="52" font-weight="700" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{speed}}</text><text x="90" y="80" text-anchor="middle" fill="#A9C7D4" font-size="11" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{spdUnit}}</text><text x="176" y="27" fill="#A9C7D4" font-size="10" font-family="Chakra Petch, 'Segoe UI', sans-serif">RPM</text><rect x="256" y="20" width="200" height="7" rx="3.5" fill="#12293A"></rect><rect x="256" y="20" width="{{g.rpmW}}" height="7" rx="3.5" fill="#FBB040"></rect><text x="176" y="51" fill="#A9C7D4" font-size="10" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{g.tempS}}</text><rect x="256" y="44" width="200" height="7" rx="3.5" fill="#12293A"></rect><rect x="256" y="44" width="120" height="7" rx="3.5" fill="#5FD4F0"></rect><text x="176" y="75" fill="#A9C7D4" font-size="10" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{g.fuelS}}</text><rect x="256" y="68" width="200" height="7" rx="3.5" fill="#12293A"></rect><rect x="256" y="68" width="140" height="7" rx="3.5" fill="#7BD88F"></rect></sc-if><sc-if value="{{g.minimal}}" hint-placeholder-val="{{ false }}"><rect x="0" y="0" width="480" height="96" rx="16" fill="#000" fill-opacity="0.55"></rect><text x="240" y="64" text-anchor="middle" fill="{{g.spdC}}" font-size="56" font-weight="700" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{speed}}</text><text x="240" y="84" text-anchor="middle" fill="#8FA2AD" font-size="11" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{spdUnit}}</text><rect x="318" y="18" width="40" height="53" rx="4" fill="#E9E4D8"></rect><circle cx="338" cy="44.5" r="16" fill="none" stroke="#C8423F" stroke-width="4"></circle><text x="338" y="50.5" text-anchor="middle" fill="#1A1A1A" font-size="16" font-weight="800" font-family="Overpass, 'Segoe UI', sans-serif">60</text><path d="M150 58 L150 40 L140 40 L156 22 L172 40 L162 40 L162 58 Z" fill="#FBB040" opacity="0.9"></path></sc-if><sc-if value="{{g.rings}}" hint-placeholder-val="{{ false }}"><rect x="0" y="0" width="480" height="96" rx="16" fill="#03111C" fill-opacity="0.9" stroke="#1E4A63" stroke-width="1.5"></rect><circle cx="62" cy="48" r="38" fill="none" stroke="#10283A" stroke-width="7"></circle><circle cx="62" cy="48" r="38" fill="none" stroke="#5FD4F0" stroke-width="7" stroke-linecap="round" stroke-dasharray="{{g.r1}}" transform="rotate(-90 62 48)"></circle><circle cx="62" cy="48" r="28" fill="none" stroke="#2A2010" stroke-width="7"></circle><circle cx="62" cy="48" r="28" fill="none" stroke="#FBB040" stroke-width="7" stroke-linecap="round" stroke-dasharray="{{g.r2}}" transform="rotate(-90 62 48)"></circle><circle cx="62" cy="48" r="18" fill="none" stroke="#15301E" stroke-width="7"></circle><circle cx="62" cy="48" r="18" fill="none" stroke="#7BD88F" stroke-width="7" stroke-linecap="round" stroke-dasharray="{{g.r3}}" transform="rotate(-90 62 48)"></circle><text x="130" y="34" fill="#5FD4F0" font-size="13" font-weight="700" font-family="Chakra Petch, 'Segoe UI', sans-serif">\u25CF {{speed}} {{spdUnit}}</text><text x="130" y="56" fill="#FBB040" font-size="13" font-weight="700" font-family="Chakra Petch, 'Segoe UI', sans-serif">\u25CF {{rpmText}} RPM</text><text x="130" y="78" fill="#7BD88F" font-size="13" font-weight="700" font-family="Chakra Petch, 'Segoe UI', sans-serif">\u25CF {{g.trip}}</text><text x="450" y="56" text-anchor="end" fill="#E8F1F5" font-size="30" font-weight="700" font-family="Chakra Petch, 'Segoe UI', sans-serif">D</text></sc-if><sc-if value="{{g.rally}}" hint-placeholder-val="{{ false }}"><rect x="0" y="0" width="480" height="96" rx="16" fill="#0B0B0B" stroke="#C8102E" stroke-width="1.5"></rect><circle cx="150" cy="16" r="6" fill="{{g.sl0}}"></circle><circle cx="170" cy="16" r="6" fill="{{g.sl1}}"></circle><circle cx="190" cy="16" r="6" fill="{{g.sl2}}"></circle><circle cx="210" cy="16" r="6" fill="{{g.sl3}}"></circle><circle cx="230" cy="16" r="6" fill="{{g.sl4}}"></circle><circle cx="250" cy="16" r="6" fill="{{g.sl5}}"></circle><circle cx="270" cy="16" r="6" fill="{{g.sl6}}"></circle><circle cx="290" cy="16" r="6" fill="{{g.sl7}}"></circle><circle cx="310" cy="16" r="6" fill="{{g.sl8}}"></circle><circle cx="330" cy="16" r="6" fill="{{g.sl9}}"></circle><text x="240" y="72" text-anchor="middle" fill="{{g.spdC}}" font-size="44" font-weight="700" font-style="italic" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{speed}}</text><text x="240" y="88" text-anchor="middle" fill="#9AA4AA" font-size="10" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{spdUnit}}</text><text x="60" y="66" text-anchor="middle" fill="#FBB040" font-size="40" font-weight="700" font-family="Chakra Petch, 'Segoe UI', sans-serif">4</text><text x="60" y="84" text-anchor="middle" fill="#9AA4AA" font-size="9" font-family="Chakra Petch, 'Segoe UI', sans-serif">GEAR</text><text x="420" y="58" text-anchor="middle" fill="#E8ECEF" font-size="18" font-weight="700" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{g.watch}}</text><text x="420" y="76" text-anchor="middle" fill="#9AA4AA" font-size="9" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{g.watchL}}</text></sc-if><sc-if value="{{g.retro}}" hint-placeholder-val="{{ false }}"><rect x="0" y="0" width="480" height="96" rx="16" fill="#E9DFC4" stroke="#7A5A3A" stroke-width="3"></rect><path d="M24 74 A48 48 0 0 1 120 74" fill="none" stroke="#2A2420" stroke-width="2"></path><path d="M24.0 74.0L32.0 74.0" stroke="#2A2420" stroke-width="2"></path><path d="M27.7 55.6L35.0 58.7" stroke="#2A2420" stroke-width="2"></path><path d="M38.1 40.1L43.7 45.7" stroke="#2A2420" stroke-width="2"></path><path d="M53.6 29.7L56.7 37.0" stroke="#2A2420" stroke-width="2"></path><path d="M72.0 26.0L72.0 34.0" stroke="#2A2420" stroke-width="2"></path><path d="M90.4 29.7L87.3 37.0" stroke="#2A2420" stroke-width="2"></path><path d="M105.9 40.1L100.3 45.7" stroke="#2A2420" stroke-width="2"></path><path d="M116.3 55.6L109.0 58.7" stroke="#2A2420" stroke-width="2"></path><path d="M120.0 74.0L112.0 74.0" stroke="#2A2420" stroke-width="2"></path><g transform="rotate({{g.retA}} 72 74)"><path d="M72 74L30 74" stroke="#1A1A1A" stroke-width="3"></path></g><circle cx="72" cy="74" r="5" fill="#7A2E1E"></circle><text x="72" y="92" text-anchor="middle" fill="#2A2420" font-size="10" font-family="Georgia, serif">km/h</text><text x="240" y="44" text-anchor="middle" fill="#2A2420" font-size="30" font-weight="700" font-family="Georgia, serif">{{speed}}</text><rect x="180" y="58" width="120" height="22" rx="3" fill="#2A2420"></rect><text x="240" y="74" text-anchor="middle" fill="#E9DFC4" font-size="13" font-family="Courier New, monospace" letter-spacing="2">{{g.odoN}}</text><path d="M360 74 A48 48 0 0 1 456 74" fill="none" stroke="#2A2420" stroke-width="2"></path><g transform="rotate({{g.retR}} 408 74)"><path d="M408 74L366 74" stroke="#1A1A1A" stroke-width="3"></path></g><circle cx="408" cy="74" r="5" fill="#7A2E1E"></circle><text x="408" y="92" text-anchor="middle" fill="#2A2420" font-size="10" font-family="Georgia, serif">{{g.tempL}}</text></sc-if></svg>
  </sc-if>
  <div aria-hidden="true" style="position: absolute; left: 0; top: 0; bottom: 0; width: 540px; background: linear-gradient(90deg, rgba(1,4,7,0.9), rgba(1,4,7,0.55) 70%, rgba(1,4,7,0))"></div>

  <sc-if value="{{listening}}" hint-placeholder-val="{{ false }}">
    <div aria-hidden="true" style="position: absolute; left: 600px; top: 330px; width: 80px; height: 80px">
      <div class="tc-orb"></div><div class="tc-orb" style="animation-delay: -0.5s"></div><div class="tc-orb" style="animation-delay: -1s; border-color: #FBB040"></div>
      <div style="position: absolute; inset: 22px; border-radius: 50%; background: #5FD4F0; box-shadow: 0 0 30px #5FD4F0"></div>
    </div>
  </sc-if>

  <header style="position: absolute; left: 20px; right: 20px; top: 34px; display: flex; align-items: center; gap: 12px">
    <div style="display: flex; flex-direction: column; gap: 2px; flex-shrink: 0; white-space: nowrap">
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 0.5px; line-height: 1; font-family: Bahnschrift, 'Barlow Semi Condensed', sans-serif; text-shadow: 0 0 12px rgba(95,212,240,0.6)"><span style="color: #48B0C8">TOM'S</span> <span style="position: relative; display: inline-block; color: #FBB040">CAR<svg aria-hidden="true" viewBox="0 10 300 90" style="position: absolute; left: -0.5em; top: -0.56em; width: 2.7em; height: 1.1em; overflow: visible; pointer-events: none"><path d="M12 74 C60 46 104 22 160 20 C204 18 232 30 262 54 C236 36 206 28 162 30 C110 32 66 52 12 74 Z" fill="#FBB040"></path><path d="M96 58 C120 40 150 34 178 34 C204 34 222 42 236 54 C214 48 190 46 166 46 C140 46 118 50 96 58 Z" fill="#FBB040"></path><path d="M176 58 C214 54 256 56 290 64 C296 66 296 71 290 71 C254 63 216 60 176 58 Z" fill="#FBB040"></path><path d="M296 76 C292 82 286 86 276 88 C282 84 288 80 296 76 Z M200 86 C176 90 150 90 128 87 C150 87 176 87 200 86 Z M54 86 C40 86 26 82 16 76 C28 80 40 83 54 86 Z" fill="#FBB040"></path><path d="M58 86 C62 70 76 62 92 62 C108 62 120 72 124 86 C116 76 106 70 92 70 C78 70 66 76 58 86 Z" fill="#FBB040"></path><path d="M206 86 C210 70 224 62 240 62 C256 62 268 72 272 86 C264 76 254 70 240 70 C226 70 214 76 206 86 Z" fill="#FBB040"></path><path d="M281 63 L291 66 L282 67 Z" fill="#FFE9A8"></path></svg></span></div>
      <div style="font-size: 11px; color: #CFE6EE; letter-spacing: 0.5px; white-space: nowrap">Focus On One Thing And Do It Well</div>
    </div>
    <div style="display: flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; flex-shrink: 0; white-space: nowrap; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); background: rgba(123,216,143,0.14); box-shadow: inset 0 0 0 1px rgba(123,216,143,0.6); font-size: 13px; font-weight: 600; color: #BFF0CA"><span style="width: 8px; height: 8px; border-radius: 50%; background: #7BD88F; box-shadow: 0 0 8px #7BD88F"></span><sc-if value="{{st.roomy}}" hint-placeholder-val="{{ true }}">{{t.ready}}</sc-if></div>
    <div role="group" aria-label="{{st.grpL}}" style="display: flex; align-items: center; gap: 10px; height: 30px; padding: 0 12px; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); background: rgba(3,17,28,0.8); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.55); font-size: 13px; font-weight: 700"><span title="{{st.batL}}" class="{{st.batCls}}" style="display: flex; align-items: center; gap: 5px; color: {{st.batC}}"><span style="position: relative; width: 24px; height: 12px; box-sizing: border-box; border: 2px solid {{st.batC}}; border-radius: 3px; padding: 1px"><span class="{{st.chgCls}}" style="display: block; height: 100%; width: {{st.batW}}; background: {{st.batC}}; border-radius: 1px"></span><span style="position: absolute; right: -5px; top: 2px; width: 2px; height: 4px; background: {{st.batC}}; border-radius: 0 1px 1px 0"></span><sc-if value="{{st.chg}}" hint-placeholder-val="{{ false }}"><svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true" style="position: absolute; left: 4px; top: -3px"><path d="M7 0L1 8h4l-1 6 6-8H6z" fill="#FFF3C4" stroke="#03111C" stroke-width="1"></path></svg></sc-if></span>{{st.batTxt}}<sc-if value="{{st.hot}}" hint-placeholder-val="{{ false }}"><svg width="14" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF8A3D" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"></path></svg><span title="{{st.hotTxt}}" style="font-size: 11px; color: #FFC9A3">{{st.hotS}}</span></sc-if></span><sc-for list="{{st.devs}}" as="v" hint-placeholder-count="1"><span title="{{v.name}}" style="display: flex; align-items: center; gap: 3px; padding-left: 8px; border-left: 1px solid rgba(95,212,240,0.35); color: {{v.c}}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="{{v.icon}}"></path></svg><span class="{{v.cls}}" style="font-size: 12px; font-weight: 700">{{v.pct}}</span></span></sc-for><sc-for list="{{st.links}}" as="k" hint-placeholder-count="3"><span title="{{k.label}}" style="display: flex; align-items: center; opacity: {{k.op}}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="{{k.c}}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{k.d}}"></path></svg></span></sc-for></div>
    <div style="margin-left: auto; min-width: 0; display: flex; align-items: center; gap: 8px">
      <div style="min-width: 0; display: flex; align-items: center; gap: 8px; height: 48px; padding: 0 14px; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); background: rgba(3,17,28,0.8); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.55)">
        <svg width="38" height="38" viewBox="0 0 48 48" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="overflow: visible; flex-shrink: 0">
          <sc-if value="{{wxSun}}" hint-placeholder-val="{{ true }}"><circle cx="24" cy="24" r="14" fill="#FBB040" opacity="0.18" class="wx-pulse"></circle><g class="wx-spin"><path d="M24 4v5M24 39v5M4 24h5M39 24h5M9.9 9.9l3.5 3.5M34.6 34.6l3.5 3.5M9.9 38.1l3.5-3.5M34.6 13.4l3.5-3.5" stroke="#FBB040" stroke-width="3"></path></g><circle cx="24" cy="24" r="8.5" fill="#FBB040"></circle></sc-if>
          <sc-if value="{{wxMoon}}" hint-placeholder-val="{{ false }}"><path d="M34 29A12 12 0 1 1 19 12a9.5 9.5 0 0 0 15 17z" fill="#F3EBD2"></path><path d="M37 9l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#F3EBD2" class="wx-blink"></path><path d="M41 19l.7 1.4 1.3.6-1.3.6-.7 1.4-.7-1.4-1.3-.6 1.3-.6z" fill="#F3EBD2" class="wx-blink wx-d2"></path></sc-if>
          <sc-if value="{{wxCloud}}" hint-placeholder-val="{{ false }}"><g class="wx-drift2"><path d="M30 22h10a5 5 0 0 0 0-10 6.5 6.5 0 0 0-12.4-1.6" stroke="#9FB7C4" stroke-width="2.6"></path></g><g class="wx-drift"><path d="M14 34h20a7 7 0 0 0 0-14 9 9 0 0 0-17.3-2.4A6.5 6.5 0 0 0 14 34z" fill="#CFE6EE" stroke="#CFE6EE" stroke-width="1"></path></g></sc-if>
          <sc-if value="{{wxRain}}" hint-placeholder-val="{{ false }}"><path d="M14 28h20a7 7 0 0 0 0-14 9 9 0 0 0-17.3-2.4A6.5 6.5 0 0 0 14 28z" fill="#B7CAD4"></path><g stroke="#5FD4F0" stroke-width="2.6"><path d="M17 33l-2 5" class="wx-drop"></path><path d="M25 33l-2 5" class="wx-drop wx-d2"></path><path d="M33 33l-2 5" class="wx-drop wx-d3"></path></g></sc-if>
          <sc-if value="{{wxStorm}}" hint-placeholder-val="{{ false }}"><path d="M14 28h20a7 7 0 0 0 0-14 9 9 0 0 0-17.3-2.4A6.5 6.5 0 0 0 14 28z" fill="#8FA2AD"></path><path d="M26 27l-6 9h6l-4 9 10-12h-6l4-6z" fill="#FBB040" class="wx-flash"></path><g stroke="#5FD4F0" stroke-width="2.4"><path d="M15 33l-2 5" class="wx-drop"></path><path d="M35 33l-2 5" class="wx-drop wx-d3"></path></g></sc-if>
          <sc-if value="{{wxFog}}" hint-placeholder-val="{{ false }}"><g stroke="#CFE6EE" stroke-width="3"><path d="M8 16h32" class="wx-fog"></path><path d="M5 24h38" class="wx-fog wx-d2"></path><path d="M9 32h30" class="wx-fog wx-d3"></path><path d="M13 40h22" class="wx-fog"></path></g></sc-if>
        </svg>
        <span style="flex-shrink: 0; font-size: 18px; font-weight: 700; color: {{st.tC}}">{{st.t}}\xB0</span>
        <span style="min-width: 0; overflow: hidden; display: flex; flex-direction: column; line-height: 1.2"><span style="font-size: 12px; color: #CFE6EE; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{wxText}} \xB7 \u2191{{st.hi}}\xB0 \u2193{{st.lo}}\xB0</span><span style="font-size: 11px; white-space: nowrap; color: {{st.subC}}">{{st.sub}}</span></span>
        <span style="width: 1px; height: 22px; background: rgba(95,212,240,0.5)"></span>
        <span style="flex-shrink: 0; font-size: 18px; font-weight: 700; color: #CFF6FF">{{clock}}</span>
      </div>
      <button class="tc-btn" onClick="{{toggleLang}}" aria-label="{{t.langLabel}}" style="height: 48px; padding: 0 14px; border: 0; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); background: rgba(3,17,28,0.8); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.55); color: #E8F1F5; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 3px"><span style="color: {{enColor}}">EN</span><span style="color: #A9C7D4">/</span><span style="color: {{viColor}}">VI</span></button>
      <button onClick="{{toggleNight}}" aria-label="{{t.night}}" aria-pressed="{{nightPressed}}" class="tc-btn" style="width: 48px; height: 48px; border: 0; clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px); background: rgba(3,17,28,0.8); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.55); color: #CFF6FF; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"></path></svg></button>
      <button onClick="{{themeToggle}}" aria-expanded="{{themeExpanded}}" class="tc-btn" style="height: 48px; padding: 0 16px; border: 0; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); background: rgba(3,17,28,0.8); box-shadow: inset 0 0 0 1px #FBB040; color: #FFE2A8; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4.1-4-7.6-9-7.6zM7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01M17 11h.01"></path></svg>{{themeBtn}}</button>
      <button data-demo="1" onClick="{{togglePicker}}" aria-expanded="{{pickerExpanded}}" class="tc-btn" style="height: 48px; padding: 0 16px; border: 0; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); background: #FBB040; color: #2A1A00; font-size: 14px; font-weight: 700; box-shadow: 0 0 16px rgba(251,176,64,0.55)">{{t.tryScene}}</button>
      <button aria-label="{{t.addWs}}" class="tc-btn" style="width: 48px; height: 48px; border: 0; clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px); background: rgba(3,17,28,0.8); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.55); color: #CFF6FF; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg></button>
      <button data-demo="1" aria-label="{{aboutTitle}}" onClick="{{introToAbout}}" class="tc-btn" style="width: 48px; height: 48px; border: 0; clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px); background: rgba(3,17,28,0.8); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.55); color: #CFF6FF; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 11v6M12 7.5v.5"></path></svg></button>
      <button onClick="{{openSettings}}" aria-label="{{t.settings}}" class="tc-btn" style="width: 48px; height: 48px; border: 0; clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px); background: rgba(3,17,28,0.8); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.55); color: #CFF6FF; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"></path></svg></button>
    </div>
  </header>

  <sc-if value="{{pickerOpen}}" hint-placeholder-val="{{ false }}">
    <div style="position: absolute; right: 20px; top: 92px; width: 440px; box-sizing: border-box; padding: 14px; display: flex; flex-direction: column; gap: 10px; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); background: rgba(1,8,14,0.95); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.6); z-index: 5">
      <sc-for list="{{pickerGroups}}" as="g" hint-placeholder-count="4">
        <div style="display: flex; flex-direction: column; gap: 6px">
          <div style="font-size: 12px; font-weight: 700; color: #5FD4F0; letter-spacing: 1px">{{g.label}}</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px">
            <sc-for list="{{g.options}}" as="o" hint-placeholder-count="4">
              <button class="tc-btn" onClick="{{o.pick}}" aria-pressed="{{o.pressed}}" style="height: 34px; padding: 0 12px; border: 0; clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.45); font-size: 13px; font-weight: 600; background: {{o.bg}}; color: {{o.fg}}">{{o.label}}</button>
            </sc-for>
          </div>
        </div>
      </sc-for>
      <div style="font-size: 11px; color: #A9C7D4">{{t.pickerNote}}</div>
    </div>
  </sc-if>

  <section aria-label="Workspace" style="position: absolute; left: 20px; top: 100px; width: 420px; bottom: 96px; display: flex; flex-direction: column; gap: 10px">
    <div style="display: flex; align-items: center; gap: 8px">
      <h2 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 2px; color: #CFF6FF; text-shadow: 0 0 10px rgba(95,212,240,0.7)">WORKSPACE</h2>
      <span style="font-size: 13px; color: #A9C7D4">{{wsCount}}</span>
      <div role="group" aria-label="{{t.sort}}" style="margin-left: auto; display: flex; gap: 4px; padding: 4px; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); background: rgba(3,17,28,0.8); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.45)">
        <sc-for list="{{sorts}}" as="s" hint-placeholder-count="3">
          <button class="tc-btn" onClick="{{s.pick}}" aria-pressed="{{s.pressed}}" style="height: 32px; padding: 0 10px; border: 0; clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px); font-size: 12px; font-weight: 600; background: {{s.bg}}; color: {{s.fg}}">{{s.label}}</button>
        </sc-for>
      </div>
    </div>
    <div class="tc-scroll" style="flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 4px">
      <sc-for list="{{workspaces}}" as="w" hint-placeholder-count="3">
        <article style="position: relative; flex-shrink: 0; box-sizing: border-box; padding: 14px; display: flex; flex-direction: column; gap: 10px; clip-path: polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px); background: rgba(3,17,28,0.82); box-shadow: inset 0 0 0 1px {{w.border}}, inset 0 0 24px rgba(95,212,240,0.08); overflow: hidden">
          <sc-if value="{{w.isDefault}}" hint-placeholder-val="{{ false }}"><div class="tc-scan" aria-hidden="true" style="position: absolute; top: 0; left: 0; width: 120px; height: 2px; background: #FBB040; box-shadow: 0 0 10px #FBB040"></div></sc-if>
          <div style="display: flex; align-items: center; gap: 8px">
            <span style="width: 10px; height: 10px; transform: rotate(45deg); background: {{w.color}}; box-shadow: 0 0 10px {{w.color}}"></span>
            <h3 style="margin: 0; font-size: 19px; font-weight: 700; letter-spacing: 0.5px">{{w.name}}</h3>
            <sc-if value="{{w.isDefault}}" hint-placeholder-val="{{ false }}"><span style="padding: 2px 8px; background: rgba(95,212,240,0.16); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.5); color: #CFF6FF; font-size: 11px; font-weight: 700">{{t.default}}</span></sc-if>
            <span style="padding: 2px 8px; background: rgba(251,176,64,0.14); box-shadow: inset 0 0 0 1px rgba(251,176,64,0.45); color: #FFD08A; font-size: 11px; font-weight: 600">{{w.auto}}</span>
            <sc-if value="{{w.trip}}" hint-placeholder-val="{{ false }}"><button onClick="{{w.openTrip}}" class="tc-btn" style="height: 24px; padding: 0 10px; border: 0; border-radius: 12px; background: #FBB040; color: #2A1A00; font-size: 11px; font-weight: 800">Road Trip \u203A</button></sc-if>
            <button aria-label="{{t.more}}" class="tc-btn" style="margin-left: auto; width: 36px; height: 36px; border: 0; background: transparent; color: #CFE6EE; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5h.01M12 12h.01M12 19h.01"></path></svg></button>
          </div>
          <div style="display: flex; gap: 6px; height: 84px">
            <sc-for list="{{w.apps}}" as="a" hint-placeholder-count="2">
              <div style="flex: {{a.flex}}; min-width: 0; background: rgba(1,8,14,0.9); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.35); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="{{a.color}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="filter: drop-shadow(0 0 4px {{a.color}})"><path d="{{a.icon}}"></path></svg>
                <span style="font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 92%">{{a.name}}</span>
                <span style="font-size: 10px; color: #5FD4F0">{{a.pct}}%</span>
              </div>
            </sc-for>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px">
            <sc-for list="{{w.extras}}" as="x" hint-placeholder-count="3">
              <span style="padding: 3px 8px; background: rgba(1,8,14,0.9); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.3); font-size: 11px; color: #CFE6EE">{{x}}</span>
            </sc-for>
          </div>
          <div style="display: flex; gap: 8px">
            <button onClick="{{w.launch}}" class="tc-btn" style="flex: 1; height: 50px; border: 0; clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px); background: #FBB040; color: #2A1A00; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; gap: 8px"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8V4z"></path></svg>{{t.launch}}</button>
            <button aria-label="{{t.edit}}" class="tc-btn" style="width: 48px; height: 48px; border: 0; clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px); background: rgba(3,17,28,0.8); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.55); color: #CFF6FF; display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"></path></svg></button>
          </div>
        </article>
      </sc-for>
    </div>
  </section>

  <footer style="position: absolute; left: 20px; right: 20px; bottom: 16px; height: 68px; box-sizing: border-box; padding: 8px 10px; display: flex; align-items: center; gap: 12px; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); background: rgba(1,8,14,0.88); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.55), 0 0 24px rgba(95,212,240,0.15)">
    <button onClick="{{toggleListen}}" aria-label="{{t.mic}}" aria-pressed="{{listenPressed}}" class="tc-btn" style="width: 52px; height: 52px; border: 0; border-radius: 50%; background: #FBB040; color: #2A1A00; box-shadow: 0 0 18px rgba(251,176,64,0.7); display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0zM5 11a7 7 0 0 0 14 0M12 18v3"></path></svg></button>
    <div style="width: 330px; display: flex; flex-direction: column; gap: 2px">
      <div style="display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700">{{assistTitle}}
        <sc-if value="{{listening}}" hint-placeholder-val="{{ false }}"><span style="display: flex; align-items: center; gap: 3px"><span class="tc-bar"></span><span class="tc-bar" style="animation-delay: -0.2s"></span><span class="tc-bar" style="animation-delay: -0.4s"></span><span class="tc-bar" style="animation-delay: -0.6s"></span><span class="tc-bar" style="animation-delay: -0.1s"></span></span></sc-if>
      </div>
      <div style="font-size: 12px; color: #CFE6EE; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{assistHint}}</div>
    </div>
    <span style="width: 1px; height: 40px; background: rgba(95,212,240,0.45)"></span>
    <div style="display: flex; align-items: center; gap: 14px">
      <div title="{{st.engL}}" style="display: flex; align-items: center; gap: 6px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="{{st.engC}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"></path><path d="M12 9v6" stroke-width="3"></path></svg><span style="display: flex; flex-direction: column; line-height: 1.1"><span class="{{st.engCls}}" style="font-size: 15px; font-weight: 700; color: {{st.engC}}">{{st.eng}}\xB0C</span><span style="font-size: 10px; color: #A9C7D4">{{st.engS}}</span></span></div>
      <div title="{{st.vL}}" style="display: flex; align-items: center; gap: 6px"><span style="position: relative; width: 22px; height: 16px; box-sizing: border-box; border: 2px solid {{st.vC}}; border-radius: 3px; padding: 1px"><span class="{{st.vCls}}" style="display: block; height: 100%; width: {{st.vW}}; background: {{st.vC}}; border-radius: 1px"></span><span style="position: absolute; left: 3px; top: -5px; width: 4px; height: 3px; background: {{st.vC}}"></span><span style="position: absolute; right: 3px; top: -5px; width: 4px; height: 3px; background: {{st.vC}}"></span></span><span style="display: flex; flex-direction: column; line-height: 1.1"><span style="font-size: 15px; font-weight: 700; color: {{st.vC}}">{{st.v}}</span><span style="font-size: 10px; color: #A9C7D4">{{st.vS}}</span></span></div>
    </div>
    <span style="width: 1px; height: 40px; background: rgba(95,212,240,0.45)"></span>
    <div style="flex: 1; min-width: 0; display: flex; align-items: center; justify-content: flex-end; gap: 12px">
      <sc-if value="{{mx.small}}" hint-placeholder-val="{{ true }}"><div aria-label="{{mx.upL}}" style="flex: 1; min-width: 0; height: 52px; box-sizing: border-box; padding: 0 12px 0 6px; border-radius: 14px; background: rgba(251,176,64,0.12); box-shadow: inset 0 0 0 1px rgba(251,176,64,0.6); display: flex; align-items: center; gap: 10px"><span style="width: 40px; height: 40px; flex-shrink: 0; border-radius: 10px; background: #FBB040; color: #2A1A00; display: flex; align-items: center; justify-content: center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{mx.upIcon}}"></path></svg></span><span style="min-width: 0; display: flex; flex-direction: column; line-height: 1.2"><span style="font-size: 10px; font-weight: 800; letter-spacing: 1px; color: #FBB040">{{mx.upL}}</span><span style="font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{mx.upMain}}</span><span style="font-size: 11px; color: #CFE6EE; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{mx.upSub}}</span></span></div></sc-if>
      <div class="{{mx.wrapCls}}" style="position: relative; width: {{mx.w}}; height: 52px; box-sizing: border-box; padding: 2px; border-radius: 26px; overflow: hidden; background: rgba(95,212,240,0.18); transition: width 0.4s ease">
        <sc-if value="{{mx.edgeOn}}" hint-placeholder-val="{{ true }}"><div class="mx-edge" aria-hidden="true" style="background: {{mx.edgeBg}}; opacity: {{mx.edgeOp}}; animation-duration: {{mx.edgeDur}}"></div></sc-if>
        <div style="position: relative; height: 48px; border-radius: 24px; background: {{mx.bg}}; display: flex; align-items: center; gap: 8px; padding: 0 6px 0 4px; overflow: hidden">
          <button onClick="{{mx.artTap}}" aria-label="{{mx.artL}}" class="tc-btn" style="position: relative; width: 40px; height: 40px; flex-shrink: 0; border: 0; border-radius: 20px; background: {{mx.art}}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px {{mx.c1}}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{mx.srcIcon}}"></path></svg></button>
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 1px; overflow: hidden">
            <div style="width: 100%; overflow: hidden; text-align: center; font-size: 14px; font-weight: 700"><sc-if value="{{mx.big}}" hint-placeholder-val="{{ false }}"><span class="mx-mq">{{t.song}}&nbsp;&nbsp;\u2022&nbsp;&nbsp;{{mx.artistTxt}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{t.song}}&nbsp;&nbsp;\u2022&nbsp;&nbsp;{{mx.artistTxt}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></sc-if><sc-if value="{{mx.small}}" hint-placeholder-val="{{ true }}"><span style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{t.song}}</span></sc-if></div>
            <sc-if value="{{mx.big}}" hint-placeholder-val="{{ false }}"><div style="font-size: 11px; color: #CFE6EE; white-space: nowrap">{{mx.srcTxt}} \xB7 {{mx.fx}}</div></sc-if>
          </div>
          <sc-if value="{{mx.waveBars}}" hint-placeholder-val="{{ false }}"><div aria-hidden="true" style="height: 30px; display: flex; align-items: flex-end; gap: 3px; flex-shrink: 0"><sc-for list="{{mx.bars}}" as="b" hint-placeholder-count="9"><span class="mx-bar" style="height: {{b.h}}; background: {{b.c}}; box-shadow: 0 0 6px {{b.c}}; animation-delay: {{b.d}}; animation-duration: {{b.dur}}"></span></sc-for></div></sc-if>
          <sc-if value="{{mx.waveSilk}}" hint-placeholder-val="{{ false }}"><svg aria-hidden="true" width="84" height="34" viewBox="0 0 84 34" style="flex-shrink: 0; overflow: hidden"><g class="mx-silk"><path d="M0 17 C10 4 20 4 30 17 S50 30 60 17 S80 4 90 17 S110 30 120 17 S140 4 150 17" fill="none" stroke="{{mx.c1}}" stroke-width="3" opacity="0.9"></path></g><g class="mx-silk2"><path d="M0 17 C10 28 20 28 30 17 S50 6 60 17 S80 28 90 17 S110 6 120 17 S140 28 150 17" fill="none" stroke="{{mx.c2}}" stroke-width="2.4" opacity="0.8"></path></g><g class="mx-silk"><path d="M0 17 C15 10 25 24 40 17 S65 10 80 17 S105 24 120 17 S145 10 160 17" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity="0.6"></path></g></svg></sc-if>
          <sc-if value="{{mx.waveAur}}" hint-placeholder-val="{{ false }}"><div aria-hidden="true" style="position: relative; width: 84px; height: 34px; flex-shrink: 0; overflow: hidden; border-radius: 10px"><div class="mx-aur" style="position: absolute; left: -10px; right: -10px; top: 4px; height: 26px; background: linear-gradient(90deg, transparent, {{mx.c1}}, {{mx.c2}}, #7BD88F, transparent); filter: blur(6px)"></div><div class="mx-aur" style="position: absolute; left: -10px; right: -10px; top: 10px; height: 14px; background: linear-gradient(90deg, transparent, #B98CF0, {{mx.c1}}, transparent); filter: blur(4px); animation-delay: -1.6s"></div></div></sc-if>
          <button onClick="{{mx.prevF}}" aria-label="{{t.prev}}" class="tc-btn" style="width: 40px; height: 40px; border: 0; border-radius: 20px; background: rgba(255,255,255,0.08); color: #FFFFFF; display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 5L9 12l10 7V5zM5 5h2.5v14H5z"></path></svg></button>
          <button onClick="{{mx.playF}}" aria-label="{{t.play}}" class="tc-btn" style="width: 42px; height: 42px; border: 0; border-radius: 21px; background: #FFFFFF; color: #01080E; box-shadow: 0 0 14px {{mx.c1}}; display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="{{mx.playIcon}}"></path></svg></button>
          <button onClick="{{mx.nextF}}" aria-label="{{t.next}}" class="tc-btn" style="width: 40px; height: 40px; border: 0; border-radius: 20px; background: rgba(255,255,255,0.08); color: #FFFFFF; display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 5l10 7-10 7V5zM16.5 5H19v14h-2.5z"></path></svg></button><sc-if value="{{mx.big}}" hint-placeholder-val="{{ false }}"><button onClick="{{mx.volF}}" aria-label="{{t.vol}}" class="tc-btn" style="width: 36px; height: 40px; border: 0; background: transparent; color: #CFE6EE; display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 9a4 4 0 0 1 0 6"></path></svg></button></sc-if>
          <div aria-hidden="true" style="position: absolute; left: 50px; right: 22px; bottom: 3px; height: 2px; border-radius: 1px; background: rgba(255,255,255,0.15)"><div style="width: 38%; height: 2px; border-radius: 1px; background: linear-gradient(90deg, {{mx.c2}}, {{mx.c1}})"></div><span class="mx-dot" style="--c: {{mx.c1}}; position: absolute; left: 38%; top: -2px; width: 6px; height: 6px; margin-left: -3px; border-radius: 3px; background: #FFFFFF"></span></div>
        </div>
      </div>
    </div>
  </footer>

  <sc-if value="{{showCover}}" hint-placeholder-val="{{ false }}">
    <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 10; background: #010407; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; overflow: hidden">
      <div class="tc-sweep" aria-hidden="true" style="position: absolute; top: 0; bottom: 0; left: 0; width: 6px; background: #5FD4F0; box-shadow: 0 0 40px 12px rgba(95,212,240,0.6)"></div>
      <div style="font-size: 54px; font-weight: 700; letter-spacing: 1px; font-family: Bahnschrift, 'Barlow Semi Condensed', sans-serif; text-shadow: 0 0 20px rgba(95,212,240,0.7)"><span style="color: #48B0C8">TOM'S</span> <span style="position: relative; display: inline-block; color: #FBB040">CAR<svg aria-hidden="true" viewBox="0 10 300 90" style="position: absolute; left: -0.5em; top: -0.56em; width: 2.7em; height: 1.1em; overflow: visible; pointer-events: none"><path d="M12 74 C60 46 104 22 160 20 C204 18 232 30 262 54 C236 36 206 28 162 30 C110 32 66 52 12 74 Z" fill="#FBB040"></path><path d="M96 58 C120 40 150 34 178 34 C204 34 222 42 236 54 C214 48 190 46 166 46 C140 46 118 50 96 58 Z" fill="#FBB040"></path><path d="M176 58 C214 54 256 56 290 64 C296 66 296 71 290 71 C254 63 216 60 176 58 Z" fill="#FBB040"></path><path d="M296 76 C292 82 286 86 276 88 C282 84 288 80 296 76 Z M200 86 C176 90 150 90 128 87 C150 87 176 87 200 86 Z M54 86 C40 86 26 82 16 76 C28 80 40 83 54 86 Z" fill="#FBB040"></path><path d="M58 86 C62 70 76 62 92 62 C108 62 120 72 124 86 C116 76 106 70 92 70 C78 70 66 76 58 86 Z" fill="#FBB040"></path><path d="M206 86 C210 70 224 62 240 62 C256 62 268 72 272 86 C264 76 254 70 240 70 C226 70 214 76 206 86 Z" fill="#FBB040"></path><path d="M281 63 L291 66 L282 67 Z" fill="#FFE9A8"></path></svg></span></div>
      <div class="tc-glow"><svg width="240" height="100" viewBox="0 0 220 96" aria-hidden="true" style="overflow: visible"><path d="M10 70 L10 26 Q10 14 22 14 L150 14 Q160 14 166 22 L188 50 L204 54 Q212 56 212 66 L212 72 Q212 78 206 78 L16 78 Q10 78 10 72 Z" fill="none" stroke="#5FD4F0" stroke-width="2.5"></path><line x1="10" y1="60" x2="212" y2="60" stroke="#FBB040" stroke-width="2.5"></line><path d="M146 22 L162 22 L182 50 L146 50 Z" fill="none" stroke="#5FD4F0" stroke-width="2"></path><circle cx="52" cy="78" r="14" fill="#010407" stroke="#FBB040" stroke-width="3"></circle><circle cx="172" cy="78" r="14" fill="#010407" stroke="#FBB040" stroke-width="3"></circle><line x1="-120" y1="66" x2="6" y2="66" stroke="#5FD4F0" stroke-width="3" opacity="0.5"></line></svg></div>
      <div style="font-size: 18px; color: #CFF6FF; letter-spacing: 0.5px">{{coverText}}</div>
      <div style="width: 360px; height: 4px; background: #0B2233; overflow: hidden"><div class="tc-prog" style="height: 4px; background: #FBB040; box-shadow: 0 0 10px #FBB040"></div></div>
      <div style="font-size: 13px"><span style="color: #CFE6EE">One of </span><span style="color: #FBB040">Tom's Technology Solutions</span><span style="color: #CFE6EE"> Products</span></div>
    </div>
  </sc-if>

  <sc-if value="{{rt.on}}" hint-placeholder-val="{{ false }}">
    <div style="position: absolute; left: 0; right: 0; top: 0; bottom: 92px; z-index: 8; background: radial-gradient(ellipse at 70% 0%, #0B2C40, #020A12 60%); overflow: hidden">
      <div style="position: absolute; left: 20px; right: 20px; top: 40px; height: 56px; display: flex; align-items: center; gap: 14px">
        <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0">
          <div style="display: flex; align-items: center; gap: 10px"><span style="font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #FBB040">ROAD TRIP</span><span style="font-size: 22px; font-weight: 700; white-space: nowrap">{{rt.title}}</span></div>
          <div style="font-size: 12px; color: #A9C7D4; white-space: nowrap">{{rt.via}}</div>
        </div>
        <div style="display: flex; gap: 6px; margin-left: 8px"><sc-for list="{{rt.legs}}" as="c" hint-placeholder-count="2"><button onClick="{{c.pick}}" aria-pressed="{{c.on}}" class="tc-btn" style="height: 36px; padding: 0 14px; border: 0; border-radius: 9px; font-size: 13px; font-weight: 700; background: {{c.bg}}; color: {{c.fg}}">{{c.label}}</button></sc-for></div>
        <div style="margin-left: auto; display: flex; gap: 8px"><sc-for list="{{rt.boxes}}" as="b" hint-placeholder-count="3"><div style="min-width: 118px; padding: 6px 12px; border-radius: 12px; background: rgba(3,17,28,0.85); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.45); display: flex; flex-direction: column; gap: 1px"><span style="font-size: 10px; letter-spacing: 0.5px; color: #A9C7D4">{{b.l}}</span><span style="font-size: 20px; font-weight: 700; color: #FFFFFF; line-height: 1.1">{{b.v}}</span><span style="font-size: 10px; color: #FFD08A">{{b.s}}</span></div></sc-for></div>
      </div>

      <div style="position: absolute; left: 20px; top: 108px; width: 460px; bottom: 12px; box-sizing: border-box; padding: 12px; border-radius: 16px; background: rgba(3,17,28,0.85); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.4); display: flex; flex-direction: column; gap: 4px; overflow: hidden">
        <div style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: #FBB040; margin-bottom: 4px">{{rt.stopsL}}</div>
        <sc-for list="{{rt.stops}}" as="p" hint-placeholder-count="6">
          <div style="display: flex; align-items: center; gap: 10px; padding: 6px 8px; border-radius: 10px; background: {{p.bg}}; opacity: {{p.op}}">
            <span style="width: 34px; height: 34px; flex-shrink: 0; border-radius: 6px; background: {{p.sign}}; box-shadow: inset 0 0 0 2px #FFFFFF, {{p.ring}}; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{p.icon}}"></path></svg></span>
            <div style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{p.name}}</span><span style="font-size: 11px; color: #A9C7D4">{{p.town}} \xB7 {{p.stay}}</span></div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0"><span style="font-size: 14px; font-weight: 700; color: {{p.distC}}">{{p.dist}}</span><span style="font-size: 11px; color: {{p.etaC}}">{{p.eta}}</span></div>
          </div>
        </sc-for>
      </div>

      <div style="position: absolute; left: 496px; right: 20px; top: 108px; height: 150px; box-sizing: border-box; padding: 14px 18px; border-radius: 16px; background: linear-gradient(120deg, rgba(251,176,64,0.18), rgba(3,17,28,0.9) 55%); box-shadow: inset 0 0 0 1px rgba(251,176,64,0.6); display: flex; align-items: center; gap: 18px">
        <span style="width: 74px; height: 74px; flex-shrink: 0; border-radius: 10px; background: {{rt.nxSign}}; box-shadow: inset 0 0 0 3px #FFFFFF; display: flex; align-items: center; justify-content: center"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{rt.nxIcon}}"></path></svg></span>
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px">
          <span style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: #FBB040">{{rt.nxL}}</span>
          <span style="font-size: 24px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{rt.nxName}}</span>
          <span style="font-size: 13px; color: #CFE6EE">{{rt.nxTown}} \xB7 {{rt.nxStay}}</span>
          <span style="font-size: 13px; color: #FFD08A">{{rt.nxEta}}</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0">
          <span style="font-size: 34px; font-weight: 700; color: #FBB040; line-height: 1">{{rt.nxKm}}</span>
          <div style="display: flex; gap: 8px"><button class="tc-btn" style="height: 44px; padding: 0 16px; border: 0; border-radius: 12px; background: #FBB040; color: #2A1A00; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px" onClick="{{rt.navF}}"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l7 19-7-4-7 4z"></path></svg>{{rt.navL}}</button><button class="tc-btn" style="height: 44px; padding: 0 14px; border: 0; border-radius: 12px; background: rgba(255,255,255,0.1); color: #E8F1F5; font-size: 14px; font-weight: 700">{{rt.skipL}}</button></div>
        </div>
      </div>

      <div style="position: absolute; left: 496px; right: 20px; top: 270px; height: 118px; box-sizing: border-box; border-radius: 16px; background: rgba(3,17,28,0.85); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.4); overflow: hidden">
        <svg viewBox="0 0 740 118" width="100%" height="118" preserveAspectRatio="none" aria-hidden="true" style="display: block">
          <line x1="{{rt.borderX}}" y1="14" x2="{{rt.borderX}}" y2="96" stroke="#FFD08A" stroke-width="1.5" stroke-dasharray="4 4"></line>
          <text x="{{rt.borderX}}" y="12" text-anchor="middle" fill="#FFD08A" font-size="11" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{rt.borderL}}</text>
          <rect x="30" y="52" width="680" height="8" rx="4" fill="#12293A"></rect>
          <rect x="30" y="52" width="{{rt.doneW}}" height="8" rx="4" fill="#7BD88F"></rect>
          <sc-for list="{{rt.route}}" as="d" hint-placeholder-count="6"><circle cx="{{d.x}}" cy="56" r="{{d.r}}" fill="{{d.c}}" stroke="#03111C" stroke-width="2"></circle><text x="{{d.x}}" y="60" text-anchor="middle" fill="{{d.lc}}" font-size="10" font-weight="800" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{d.lbl}}</text></sc-for>
          <g transform="translate({{rt.carX}} 34)"><path d="M0 12 L-8 -4 L8 -4 Z" fill="#FBB040"></path><circle cx="0" cy="-10" r="7" fill="#FBB040" stroke="#FFFFFF" stroke-width="2"></circle></g>
          <text x="30" y="88" fill="#CFE6EE" font-size="12" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{rt.startL}}</text>
          <text x="710" y="88" text-anchor="end" fill="#CFE6EE" font-size="12" font-family="Chakra Petch, 'Segoe UI', sans-serif">{{rt.endL}}</text>
        </svg>
      </div>

      <div style="position: absolute; left: 496px; right: 20px; top: 400px; bottom: 12px; display: flex; gap: 12px">
        <div style="width: 230px; box-sizing: border-box; padding: 12px; border-radius: 16px; background: rgba(3,17,28,0.85); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.4); display: flex; align-items: center; justify-content: center; gap: 16px">
          <div style="width: 62px; height: 84px; box-sizing: border-box; border-radius: 5px; background: #FFFFFF; box-shadow: inset 0 0 0 2px #111; display: flex; align-items: center; justify-content: center"><div style="width: 50px; height: 50px; box-sizing: border-box; border-radius: 50%; border: 5px solid #D0202E; display: flex; align-items: center; justify-content: center; font-family: Overpass, 'Segoe UI', sans-serif; font-size: 19px; font-weight: 800; color: #111; line-height: 1; padding-top: 3px">{{rt.limit}}</div></div>
          <div style="display: flex; flex-direction: column; align-items: center"><span style="font-size: 52px; font-weight: 700; line-height: 1">{{rt.spd}}</span><span style="font-size: 12px; color: #A9C7D4">{{rt.spdUnit}}</span></div>
        </div>
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px">
          <div style="flex: 1; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px"><sc-for list="{{rt.stats}}" as="s" hint-placeholder-count="4"><div style="box-sizing: border-box; padding: 10px; border-radius: 14px; background: rgba(3,17,28,0.85); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.35); display: flex; flex-direction: column; justify-content: center; gap: 4px"><span style="font-size: 17px; font-weight: 700; white-space: nowrap">{{s.v}}</span><span style="font-size: 11px; color: #A9C7D4">{{s.l}}</span></div></sc-for></div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap"><span style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #FBB040">{{rt.posL}}</span><sc-for list="{{rt.poss}}" as="c" hint-placeholder-count="3"><button onClick="{{c.pick}}" aria-pressed="{{c.on}}" class="tc-btn" style="height: 30px; padding: 0 10px; border: 0; border-radius: 8px; font-size: 12px; font-weight: 700; background: {{c.bg}}; color: {{c.fg}}">{{c.label}}</button></sc-for></div>
          <div style="font-size: 11px; color: #8FA9B5; line-height: 1.35">{{rt.note}}</div>
        </div>
      </div>
    </div>
  </sc-if>
  <div role="tablist" style="position: absolute; right: 20px; top: 4px; z-index: 9; display: flex; gap: 4px; padding: 3px; border-radius: 16px; background: rgba(1,8,14,0.75); box-shadow: inset 0 0 0 1px rgba(95,212,240,0.4)"><sc-for list="{{tabs}}" as="c" hint-placeholder-count="2"><button role="tab" onClick="{{c.pick}}" aria-selected="{{c.on}}" class="tc-btn" style="height: 22px; padding: 0 14px; border: 0; border-radius: 12px; font-size: 12px; font-weight: 700; background: {{c.bg}}; color: {{c.fg}}">{{c.label}}</button></sc-for></div>
  <sc-if value="{{showRun}}" hint-placeholder-val="{{ false }}">
    <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 9; background: #010407; box-sizing: border-box; padding: 8px; display: flex; gap: 8px">
      <sc-for list="{{runApps}}" as="a" hint-placeholder-count="2">
        <div style="flex: {{a.flex}}; min-width: 0; background: #03111C; box-shadow: inset 0 0 0 1px rgba(95,212,240,0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="{{a.color}}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="filter: drop-shadow(0 0 8px {{a.color}})"><path d="{{a.icon}}"></path></svg>
          <div style="font-size: 24px; font-weight: 700">{{a.name}}</div>
          <div style="font-size: 13px; color: #A9C7D4">{{a.pct}}% \xB7 {{t.realApp}}</div>
        </div>
      </sc-for>
      <button onClick="{{closeRun}}" class="tc-btn" style="position: absolute; left: 20px; bottom: 20px; height: 48px; padding: 0 16px; border: 0; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); background: #FBB040; color: #2A1A00; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg><span>TOM'S CAR</span></button>
    </div>
  </sc-if>

  <sc-if value="{{themeOpen}}" hint-placeholder-val="{{ false }}">
    <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 50; background: rgba(2,8,14,0.6)">
      <div role="dialog" aria-label="{{themeBtn}}" class="tc-scroll" style="position: absolute; right: 20px; top: 92px; bottom: 92px; width: 720px; box-sizing: border-box; padding: 16px 18px; overflow-y: auto; border-radius: 16px; background: rgba(4,14,22,0.97); box-shadow: inset 0 0 0 1px rgba(251,176,64,0.6), 0 20px 50px rgba(0,0,0,0.6); color: #E8F1F5; display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; align-items: center; gap: 10px">
          <div style="flex: 1; font-size: 20px; font-weight: 700">{{themeBtn}}</div>
          <button onClick="{{themeToggle}}" class="tc-btn" style="height: 40px; padding: 0 14px; border: 0; border-radius: 10px; background: #FBB040; color: #2A1A00; font-size: 13px; font-weight: 700">{{themeDone}}</button>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: center">
          <span style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: #FBB040">{{themeCockpitL}}</span>
          <sc-for list="{{themeCockpits}}" as="c" hint-placeholder-count="2"><button onClick="{{c.pick}}" aria-pressed="{{c.on}}" class="tc-btn" style="height: 36px; padding: 0 14px; border: 0; border-radius: 9px; font-size: 13px; font-weight: 700; background: {{c.bg}}; color: {{c.fg}}">{{c.label}}</button></sc-for>
          <span style="margin-left: auto; font-size: 12px; font-weight: 800; letter-spacing: 1px; color: #FBB040">{{themeAutoL}}</span>
          <button onClick="{{themeAutoToggle}}" aria-pressed="{{themeAutoOn}}" class="tc-btn" style="height: 36px; padding: 0 14px; border: 0; border-radius: 9px; font-size: 13px; font-weight: 700; background: {{themeAutoBg}}; color: {{themeAutoFg}}">{{themeAutoTxt}}</button>
        </div>
        <sc-for list="{{tstRows}}" as="r" hint-placeholder-count="5"><div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">
          <span style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: #FBB040; margin-right: 6px; min-width: 120px">{{r.label}}</span>
          <sc-for list="{{r.opts}}" as="c" hint-placeholder-count="5"><button onClick="{{c.pick}}" aria-pressed="{{c.on}}" class="tc-btn" style="height: 34px; padding: 0 12px; border: 0; border-radius: 9px; font-size: 12px; font-weight: 700; background: {{c.bg}}; color: {{c.fg}}">{{c.label}}</button></sc-for>
        </div></sc-for>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">
          <span style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: #FBB040; margin-right: 6px">{{gaugeL}}</span>
          <sc-for list="{{gaugeOpts}}" as="c" hint-placeholder-count="7"><button onClick="{{c.pick}}" aria-pressed="{{c.on}}" class="tc-btn" style="height: 34px; padding: 0 12px; border: 0; border-radius: 9px; font-size: 12px; font-weight: 700; background: {{c.bg}}; color: {{c.fg}}">{{c.label}}</button></sc-for>
        </div>
        <sc-for list="{{themeGroups}}" as="g" hint-placeholder-count="3">
          <div style="display: flex; flex-direction: column; gap: 8px">
            <div style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: #FBB040">{{g.label}}</div>
            <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px">
              <sc-for list="{{g.items}}" as="i" hint-placeholder-count="4">
                <button onClick="{{i.pick}}" aria-pressed="{{i.on}}" class="tc-btn" style="position: relative; height: 84px; border: 0; padding: 0; border-radius: 10px; overflow: hidden; text-align: left; background: {{i.sw}}; box-shadow: {{i.ring}}; color: #FFFFFF">
                  <span style="position: absolute; left: 0; right: 0; bottom: 0; padding: 6px 8px; background: rgba(0,0,0,0.55); font-size: 12px; font-weight: 700">{{i.label}}</span>
                  <span style="position: absolute; right: 6px; top: 6px; padding: 1px 6px; border-radius: 6px; background: {{i.tagBg}}; color: #2A1A00; font-size: 10px; font-weight: 800; opacity: {{i.tagOp}}">{{i.tag}}</span>
                </button>
              </sc-for>
            </div>
          </div>
        </sc-for>
        <div style="font-size: 12px; color: #A9C7D4">{{themeNote}}</div>
      </div>
    </div>
  </sc-if>
  <sc-if value="{{introSplash}}" hint-placeholder-val="{{ true }}">
    <div class="tc-introfade" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 60; background: radial-gradient(ellipse at 50% 42%, #1E4A63 0%, #0D2C40 45%, #071A26 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: #E8F1F5">
      <div style="padding-top: 40px"><div style="font-size: 72px; font-weight: 700; letter-spacing: 1px; line-height: 1; font-family: Bahnschrift, 'Barlow Semi Condensed', sans-serif"><span style="color: #48B0C8">TOM'S</span> <span style="position: relative; display: inline-block; color: #FBB040">CAR<svg aria-hidden="true" viewBox="0 10 300 90" style="position: absolute; left: -0.5em; top: -0.56em; width: 2.7em; height: 1.1em; overflow: visible; pointer-events: none"><path d="M12 74 C60 46 104 22 160 20 C204 18 232 30 262 54 C236 36 206 28 162 30 C110 32 66 52 12 74 Z" fill="#FBB040"></path><path d="M96 58 C120 40 150 34 178 34 C204 34 222 42 236 54 C214 48 190 46 166 46 C140 46 118 50 96 58 Z" fill="#FBB040"></path><path d="M176 58 C214 54 256 56 290 64 C296 66 296 71 290 71 C254 63 216 60 176 58 Z" fill="#FBB040"></path><path d="M296 76 C292 82 286 86 276 88 C282 84 288 80 296 76 Z M200 86 C176 90 150 90 128 87 C150 87 176 87 200 86 Z M54 86 C40 86 26 82 16 76 C28 80 40 83 54 86 Z" fill="#FBB040"></path><path d="M58 86 C62 70 76 62 92 62 C108 62 120 72 124 86 C116 76 106 70 92 70 C78 70 66 76 58 86 Z" fill="#FBB040"></path><path d="M206 86 C210 70 224 62 240 62 C256 62 268 72 272 86 C264 76 254 70 240 70 C226 70 214 76 206 86 Z" fill="#FBB040"></path><path d="M281 63 L291 66 L282 67 Z" fill="#FFE9A8"></path></svg></span></div></div>
      <div style="font-size: 16px; color: #CFE6EE; letter-spacing: 0.5px; text-align: center">Focus On One Thing And Do It Well</div>
      <div style="font-size: 15px; color: #A9C7D4; text-align: center">{{introLine}}</div>
      <div style="font-size: 14px; font-weight: 600; letter-spacing: 0.5px; text-align: center"><span style="color: #CFE6EE">One of </span><span style="color: #FBB040">Tom's Technology Solutions</span><span style="color: #CFE6EE"> Products</span></div>
      <div style="margin-top: 26px; width: 360px; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.12); overflow: hidden"><div class="tc-introbar" style="height: 6px; border-radius: 3px; background: #FBB040"></div></div>
      <div style="font-size: 18px; font-weight: 700; color: #FFE2A8">{{introGreet}}</div>
      <div style="font-size: 13px; color: #A9C7D4">{{introStatus}}</div>
      <div style="position: absolute; right: 24px; bottom: 20px; font-size: 12px; color: #A9C7D4">{{introVer}}</div>
      <div style="position: absolute; left: 24px; bottom: 16px; display: flex; gap: 8px">
        <button onClick="{{introToAbout}}" class="tc-btn" style="height: 40px; padding: 0 14px; border: 0; border-radius: 10px; background: rgba(255,255,255,0.12); color: #E8F1F5; font-size: 13px; font-weight: 700">{{introBtnAbout}}</button>
        <button onClick="{{introToMain}}" class="tc-btn" style="height: 40px; padding: 0 14px; border: 0; border-radius: 10px; background: #FBB040; color: #2A1A00; font-size: 13px; font-weight: 700">{{introBtnMain}}</button>
      </div>
    </div>
  </sc-if>
  <sc-if value="{{introAbout}}" hint-placeholder-val="{{ false }}">
    <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 55; background: rgba(2,8,14,0.72); display: flex; align-items: center; justify-content: center">
      <div role="dialog" aria-label="{{aboutTitle}}" style="width: 640px; max-height: 660px; overflow: hidden; border-radius: 18px; background: #0B2233; box-shadow: 0 0 0 1px rgba(72,176,200,0.45), 0 20px 60px rgba(0,0,0,0.6); color: #E8F1F5; display: flex; flex-direction: column">
        <div style="background: #0D2C40; padding: 34px 24px 16px; display: flex; flex-direction: column; align-items: center; gap: 8px">
          <div style="font-size: 46px; font-weight: 700; letter-spacing: 1px; line-height: 1; font-family: Bahnschrift, 'Barlow Semi Condensed', sans-serif"><span style="color: #48B0C8">TOM'S</span> <span style="position: relative; display: inline-block; color: #FBB040">CAR<svg aria-hidden="true" viewBox="0 10 300 90" style="position: absolute; left: -0.5em; top: -0.56em; width: 2.7em; height: 1.1em; overflow: visible; pointer-events: none"><path d="M12 74 C60 46 104 22 160 20 C204 18 232 30 262 54 C236 36 206 28 162 30 C110 32 66 52 12 74 Z" fill="#FBB040"></path><path d="M96 58 C120 40 150 34 178 34 C204 34 222 42 236 54 C214 48 190 46 166 46 C140 46 118 50 96 58 Z" fill="#FBB040"></path><path d="M176 58 C214 54 256 56 290 64 C296 66 296 71 290 71 C254 63 216 60 176 58 Z" fill="#FBB040"></path><path d="M296 76 C292 82 286 86 276 88 C282 84 288 80 296 76 Z M200 86 C176 90 150 90 128 87 C150 87 176 87 200 86 Z M54 86 C40 86 26 82 16 76 C28 80 40 83 54 86 Z" fill="#FBB040"></path><path d="M58 86 C62 70 76 62 92 62 C108 62 120 72 124 86 C116 76 106 70 92 70 C78 70 66 76 58 86 Z" fill="#FBB040"></path><path d="M206 86 C210 70 224 62 240 62 C256 62 268 72 272 86 C264 76 254 70 240 70 C226 70 214 76 206 86 Z" fill="#FBB040"></path><path d="M281 63 L291 66 L282 67 Z" fill="#FFE9A8"></path></svg></span></div>
          <div style="font-size: 13px; color: #CFE6EE">Focus On One Thing And Do It Well</div>
          <div style="font-size: 12px; color: #A9C7D4">{{introVer}}</div>
          <div style="font-size: 13px; font-weight: 600; letter-spacing: 0.5px; text-align: center"><span style="color: #CFE6EE">One of </span><span style="color: #FBB040">Tom's Technology Solutions</span><span style="color: #CFE6EE"> Products</span></div>
        </div>
        <div class="tc-scroll" style="padding: 16px 24px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; font-size: 13px; line-height: 1.45">
          <div style="font-size: 14px; color: #E8F1F5; text-wrap: balance">{{aboutDesc}}</div>
          <div style="display: grid; grid-template-columns: 150px 1fr; gap: 4px 10px">
            <span style="color: #A9C7D4">{{aboutIdeaL}}</span><span>Tom's Technology Solutions</span>
            <span style="color: #A9C7D4">{{aboutBuiltL}}</span><span>Claude (Anthropic)</span>
          </div>
          <div style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: #FBB040">{{aboutCreditsL}}</div>
          <sc-for list="{{aboutCredits}}" as="c" hint-placeholder-count="5"><div style="font-size: 12px; color: #CFE6EE">\xB7 {{c}}</div></sc-for>
          <div style="font-size: 11px; color: #8FAEBB">{{aboutTm}}</div>
        </div>
        <div style="padding: 12px 24px 18px; display: flex; gap: 8px; justify-content: flex-end">
          <button onClick="{{introReplay}}" class="tc-btn" style="height: 42px; padding: 0 14px; border: 0; border-radius: 10px; background: rgba(255,255,255,0.1); color: #E8F1F5; font-size: 13px; font-weight: 700">{{aboutReplay}}</button>
          <a href="mailto:tomstechmelbourne@gmail.com?subject=G%C3%B3p%20%C3%9D%20Tom's%20Car%200.9.0-beta" class="tc-btn" style="height: 42px; padding: 0 14px; border-radius: 10px; background: rgba(255,255,255,0.1); color: #E8F1F5; font-size: 13px; font-weight: 700; display: flex; align-items: center; text-decoration: none">{{aboutFeedback}}</a>
          <button onClick="{{introToMain}}" class="tc-btn" style="height: 42px; padding: 0 16px; border: 0; border-radius: 10px; background: #FBB040; color: #2A1A00; font-size: 13px; font-weight: 700">{{aboutClose}}</button>
        </div>
      </div>
    </div>
  </sc-if>
  <sc-if value="{{introStepOn}}" hint-placeholder-val="{{ true }}">
    <div style="position: absolute; left: 50%; top: 10px; transform: translateX(-50%); z-index: 70; display: flex; gap: 4px; padding: 4px; border-radius: 999px; background: rgba(2,8,14,0.8); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.2)">
      <sc-for list="{{introSteps}}" as="s" hint-placeholder-count="3"><button onClick="{{s.pick}}" aria-pressed="{{s.on}}" class="tc-btn" style="height: 28px; padding: 0 12px; border: 0; border-radius: 999px; font-size: 12px; font-weight: 700; background: {{s.bg}}; color: {{s.fg}}">{{s.label}}</button></sc-for>
    </div>
  </sc-if>
</div>
`;
window.__PROPS = { "speed": 60, "scenery": "city", "weather": "auto", "season": "auto", "phase": "auto", "$preview": null };
