(function() {
  const CSS = `
#tcidle{font-family:Overpass,sans-serif;color:#fff;overflow:hidden}
#tcidle .ph{position:absolute;inset:0;background-size:cover;background-position:center}
#tcidle .phd{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.15) 40%,rgba(0,0,0,.55))}
#tcidle .sh{text-shadow:0 2px 14px rgba(0,0,0,.45)}
#tcidle .glass{background:rgba(10,30,50,.34);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.18);border-radius:24px}
#tcidle .pl{font-weight:800;letter-spacing:.5px;line-height:1}
#tcidle .flip{display:flex;gap:6px;padding:14px;border-radius:22px;background:rgba(8,14,20,.6);box-shadow:0 20px 50px rgba(0,0,0,.4)}
#tcidle .dg{position:relative;width:118px;height:200px;border-radius:14px;background:linear-gradient(#26323d 0 50%,#1b252e 50%);display:flex;align-items:center;justify-content:center;font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;font-size:170px;line-height:1;color:#f4f7f9;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}
#tcidle .dg:after{content:'';position:absolute;left:0;right:0;top:50%;height:3px;margin-top:-1px;background:#0a0f14;z-index:3}
#tcidle .dg>span{display:block;width:100%;text-align:center}
#tcidle .dg .fp{position:absolute;left:0;right:0;top:0;height:50%;overflow:hidden;background:#26323d;transform-origin:50% 100%;z-index:2;animation:tcflip .6s ease-in forwards}
#tcidle .dg .fp>span{position:absolute;left:0;right:0;top:0;height:200%;display:flex;align-items:center;justify-content:center}
@keyframes tcflip{0%{transform:perspective(600px) rotateX(0)}99%{transform:perspective(600px) rotateX(-90deg);filter:brightness(.6)}100%{transform:perspective(600px) rotateX(-90deg);opacity:0}}
#tcidle .mini .dg{width:64px;height:108px;font-size:92px;border-radius:9px}
#tcidle .mini .flip{padding:8px;gap:4px;border-radius:14px}
#tcidle .board{display:flex;flex-direction:column;gap:16px;padding:30px 34px;background:#0b0d10;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.6)}
#tcidle .row{display:flex;gap:6px}
#tcidle .t{width:54px;height:78px;border-radius:6px;padding-top:6px;box-sizing:border-box;line-height:1;background:linear-gradient(#22262b 0 50%,#1a1d21 50%);color:#ffd84a;font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;font-size:58px;display:flex;align-items:center;justify-content:center;position:relative}
#tcidle .t:after{content:'';position:absolute;left:0;right:0;top:50%;height:2px;background:#000}
#tcidle .t.w{color:#e9edf0}#tcidle .t.e{background:#14171a}
#tcidle .t.go{animation:tcsf .5s steps(3) 1}
@keyframes tcsf{0%{filter:brightness(1.9)}100%{filter:none}}
#tcidle .blink{animation:tcbl 1s steps(1) infinite}
@keyframes tcbl{50%{opacity:.25}}
#tcidle .spin{transform-origin:center;animation:tcspin 60s linear infinite}
@keyframes tcspin{to{transform:rotate(360deg)}}
#tcidle .sweep{animation:tcsw 60s linear infinite}
@keyframes tcsw{to{stroke-dashoffset:0}}
`;
  const P2 = (n) => String(n).padStart(2, "0");
  const IC = {
    rain: '<svg viewBox="0 0 64 64" width="S" height="S"><path d="M18 40a11 11 0 0 1 1-22 15 15 0 0 1 28 4 9 9 0 0 1-1 18z" fill="#eef3f8"/><path d="M24 46l-3 8M33 46l-3 8M42 46l-3 8" stroke="#7cc4ff" stroke-width="3.5" stroke-linecap="round"/></svg>',
    storm: '<svg viewBox="0 0 64 64" width="S" height="S"><path d="M18 38a11 11 0 0 1 1-22 15 15 0 0 1 28 4 9 9 0 0 1-1 18z" fill="#d5dce2"/><path d="M34 40l-8 12h8l-5 10" fill="none" stroke="#FFE066" stroke-width="3.5"/></svg>',
    clear: '<svg viewBox="0 0 64 64" width="S" height="S"><circle cx="32" cy="32" r="12" fill="#FFC542"/><g stroke="#FFC542" stroke-width="4" stroke-linecap="round"><path d="M32 6v7M32 51v7M6 32h7M51 32h7M13 13l5 5M46 46l5 5M13 51l5-5M46 18l5-5"/></g></svg>',
    cloudy: '<svg viewBox="0 0 64 64" width="S" height="S"><circle cx="24" cy="24" r="10" fill="#FFC542"/><path d="M22 48a10 10 0 0 1 1-20 14 14 0 0 1 26 4 8 8 0 0 1-1 16z" fill="#eef3f8"/></svg>',
    night: '<svg viewBox="0 0 64 64" width="S" height="S"><path d="M40 10a22 22 0 1 0 14 34A18 18 0 0 1 40 10z" fill="#F3EBD2"/></svg>',
    fog: '<svg viewBox="0 0 64 64" width="S" height="S"><path d="M10 24h44M6 34h52M12 44h40" stroke="#E8EEF2" stroke-width="4" stroke-linecap="round"/></svg>'
  };
  const ic = (k, s) => (IC[k] || IC.cloudy).replace(/S/g, s);
  const PH = (() => {
    try {
      return JSON.parse(localStorage.getItem("tc-placeph") || "{}");
    } catch (e) {
      return {};
    }
  })();
  const phBusy = {};
  const photoFor = (place, st) => {
    if (!place) return "";
    const k = place + "|" + (st || "");
    const c = PH[k];
    if (c && (c.u || Date.now() - c.t < 864e5)) return c.u || "";
    if (phBusy[k]) return "";
    phBusy[k] = 1;
    const stName = { VIC: "Victoria", NSW: "New South Wales", SA: "South Australia", QLD: "Queensland", WA: "Western Australia", TAS: "Tasmania", NT: "Northern Territory", ACT: "Australian Capital Territory" }[st] || "Victoria";
    const save = (u) => {
      PH[k] = { u: u || "", t: Date.now() };
      try {
        localStorage.setItem("tc-placeph", JSON.stringify(PH));
      } catch (e) {
      }
      phBusy[k] = 0;
      last = "";
    };
    fetch("https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=1280&titles=" + encodeURIComponent(place + ", " + stName)).then((r) => r.json()).then((j) => {
      const pg = j.query && j.query.pages && Object.values(j.query.pages)[0];
      const u = pg && pg.thumbnail && pg.thumbnail.source;
      if (u && !/\.svg/i.test(u)) return save(u);
      return fetch("https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=5&gsrsearch=" + encodeURIComponent(place + " " + stName) + "&prop=imageinfo&iiprop=url&iiurlwidth=1280").then((r) => r.json()).then((c2) => {
        const ps = c2.query && c2.query.pages ? Object.values(c2.query.pages) : [];
        const hit = ps.map((p) => p.imageinfo && p.imageinfo[0]).find((i) => i && /\.(jpe?g|png)$/i.test(i.url || ""));
        save(hit ? hit.thumburl || hit.url : "");
      });
    }).catch(() => save(""));
    return "";
  };
  const dgs = (s, flip, prev) => s.split("").map((c, i) => '<div class="dg"><span>' + c + "</span>" + (flip && prev && prev[i] !== c ? '<div class="fp"><span>' + prev[i] + "</span></div>" : "") + "</div>").join("");
  const tiles = (s, cls, go) => '<div class="row">' + s.split("").map((c, i) => '<div class="t ' + (c === " " ? "e" : cls) + (go ? " go" : "") + '" style="animation-delay:' + i * 0.05 + 's">' + (c === " " ? "" : c) + "</div>").join("") + "</div>";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const big = (d, sz, extra) => d.place ? '<div class="pl sh" style="font-size:' + sz + "px;" + (extra || "") + '">' + esc(d.place) + "</div>" : "";
  const S = {};
  S.htc = (d, f) => '<div style="position:absolute;left:0;right:0;top:70px;display:flex;justify-content:center;gap:28px"><div class="flip">' + dgs(d.H, f.h, f.pH) + '</div><div class="flip">' + dgs(d.M, f.m, f.pM) + '</div></div><div style="position:absolute;left:0;right:0;top:320px;text-align:center">' + big(d, 64) + '</div><div class="sh" style="position:absolute;left:0;right:0;top:420px;display:flex;justify-content:center;align-items:center;gap:22px">' + ic(d.code, 84) + '<span style="font-size:88px;font-weight:200;line-height:1">' + esc(d.temp) + '</span><div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:26px;font-weight:700">' + esc(d.desc) + '</span><span style="font-size:18px;opacity:.9">' + esc(d.hilo) + (d.rainP ? " \xB7 " + esc(d.rainP) : "") + '</span></div><span style="width:2px;height:70px;background:rgba(255,255,255,.35)"></span><div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:26px;font-weight:700">' + esc(d.date) + '</span><span style="font-size:18px;opacity:.9">' + esc(d.sub) + "</span></div></div>" + (d.appt ? '<div class="glass sh" style="position:absolute;left:50%;transform:translateX(-50%);top:560px;padding:10px 22px;font-size:20px;white-space:nowrap">\u23F0 ' + esc(d.appt) + "</div>" : "");
  S.mini = (d, f) => '<div class="mini" style="position:absolute;left:60px;top:50px;display:flex;align-items:center;gap:16px"><div class="flip">' + dgs(d.H, f.h, f.pH) + '</div><div class="flip">' + dgs(d.M, f.m, f.pM) + '</div><div class="sh" style="margin-left:14px;display:flex;flex-direction:column;gap:4px">' + big(d, 46) + '<span style="font-size:26px;font-weight:700">' + esc(d.date) + '</span><span style="font-size:20px;opacity:.9">' + esc(d.desc) + " \xB7 " + esc(d.temp) + (d.sub ? " \xB7 " + esc(d.sub) : "") + "</span></div></div>" + (d.days.length ? '<div class="glass" style="position:absolute;left:60px;right:60px;bottom:56px;padding:22px 30px;display:grid;grid-template-columns:repeat(' + d.days.length + ',1fr);gap:16px">' + d.days.map((x) => '<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><span style="font-size:20px;font-weight:700">' + esc(x.n) + "</span>" + ic(x.code, 60) + '<span style="font-size:22px">' + x.hi + '\xB0 <span style="opacity:.7">' + x.lo + '\xB0</span></span><span style="width:120px;height:6px;border-radius:3px;background:rgba(255,255,255,.2);position:relative"><span style="position:absolute;left:' + x.l + "%;width:" + x.w + '%;top:0;bottom:0;border-radius:3px;background:linear-gradient(90deg,#7cc4ff,#FFC542)"></span></span></div>').join("") + "</div>" : "");
  S.flap = (d, f) => {
    const L1 = " " + d.H + ":" + d.M, L2 = d.dowShort + " " + d.dm, L3 = (d.desc || "") + " " + d.temp, L4 = d.place || "";
    const n = Math.max(10, Math.min(18, Math.max(L1.length, L2.length, L3.length, L4.length) + 1));
    const tw = Math.floor((1280 * 0.8 - 68 - (n - 1) * 6) / n), th = Math.round(tw * 1.42), fs = Math.round(tw * 0.92);
    flapN = n;
    flapPlace = L4.toUpperCase();
    const row = (txt, cls, go, id) => '<div class="row"' + (id ? ' id="' + id + '"' : "") + ">" + (" " + txt).toUpperCase().slice(0, n).padEnd(n, " ").split("").map((c, i) => '<div class="t ' + (c === " " ? "e" : cls) + (go && c !== " " ? " go" : "") + '" style="width:' + tw + "px;height:" + th + "px;font-size:" + fs + "px;animation-delay:" + i * 0.05 + 's">' + (c === " " ? "" : c) + "</div>").join("") + "</div>";
    return '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><div class="board">' + row(d.H + ":" + d.M, "", f.m) + row(L2, "w", f.m && d.M === "00") + row(L3, "w", false) + row(L4.length > n - 1 ? L4.slice(0, n - 1) : L4, "w", false, "tcflapPl") + "</div></div>";
  };
  S.analog = (d) => {
    const hA = (+d.H24 % 12 + +d.M / 60) * 30, mA = +d.M * 6, sA = d.sec * 6;
    const tk = Array.from({ length: 60 }, (_, i) => {
      const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 226 : 214;
      return '<line x1="' + (260 + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (260 - r1 * Math.cos(a)).toFixed(1) + '" x2="' + (260 + 236 * Math.sin(a)).toFixed(1) + '" y2="' + (260 - 236 * Math.cos(a)).toFixed(1) + '" stroke="rgba(255,255,255,' + (i % 5 ? 0.45 : 0.95) + ')" stroke-width="' + (i % 5 ? 2 : 4) + '"/>';
    }).join("");
    const arc = (a1, a2, r) => {
      const p = (a) => [260 + r * Math.sin(a * Math.PI / 180), 260 - r * Math.cos(a * Math.PI / 180)];
      if (a2 <= a1) a2 += 360;
      const s = p(a1), e = p(a2);
      return "M" + s[0].toFixed(1) + " " + s[1].toFixed(1) + " A" + r + " " + r + " 0 " + (a2 - a1 > 180 ? 1 : 0) + " 1 " + e[0].toFixed(1) + " " + e[1].toFixed(1);
    };
    const hand = (a, l, w, c) => '<line x1="260" y1="260" x2="' + (260 + l * Math.sin(a * Math.PI / 180)).toFixed(1) + '" y2="' + (260 - l * Math.cos(a * Math.PI / 180)).toFixed(1) + '" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round"/>';
    return '<div class="glass" style="position:absolute;left:150px;top:100px;width:520px;height:520px;border-radius:50%"></div><svg style="position:absolute;left:150px;top:100px" width="520" height="520">' + tk + (d.riseA != null ? '<path d="' + arc(d.riseA, d.setA, 248) + '" fill="none" stroke="#FBB040" stroke-width="6" stroke-linecap="round" opacity=".9"/>' : "") + hand(hA, 130, 12, "#fff") + hand(mA, 190, 7, "#fff") + '<g class="spin" style="transform-origin:260px 260px;animation-delay:-' + d.sec + 's"><line x1="260" y1="280" x2="260" y2="50" stroke="#FBB040" stroke-width="3"/></g><circle cx="260" cy="260" r="10" fill="#FBB040"/></svg><div class="sh" style="position:absolute;left:740px;top:140px;right:40px;display:flex;flex-direction:column;gap:16px">' + big(d, 60) + '<span style="font-size:34px;font-weight:700">' + esc(d.date) + '</span><div style="display:flex;align-items:center;gap:14px">' + ic(d.code, 80) + '<span style="font-size:80px;font-weight:200">' + esc(d.temp) + '</span></div><span style="font-size:22px">' + esc(d.desc) + '</span><span style="font-size:20px;opacity:.9">' + esc(d.sunL) + "</span>" + (d.sub ? '<span style="font-size:20px;opacity:.9">' + esc(d.sub) + "</span>" : "") + "</div>";
  };
  S.minimal = (d) => '<div style="position:absolute;inset:0;background:#000"></div><div style="position:absolute;left:0;right:0;top:120px;text-align:center;font-weight:200;font-size:300px;line-height:1;color:' + (d.night ? "#c96a3a" : "#e8eef2") + ';letter-spacing:4px;font-variant-numeric:tabular-nums">' + d.H + '<span class="blink">:</span>' + d.M + '</div><div style="position:absolute;left:0;right:0;top:460px;text-align:center">' + big(d, 54, "color:" + (d.night ? "#9a5a3a" : "#cfd8de") + ";text-shadow:none") + '</div><div style="position:absolute;left:0;right:0;top:540px;text-align:center;font-size:26px;color:' + (d.night ? "#7a4a32" : "#9fb0ba") + '">' + esc(d.date) + " \xB7 " + esc(d.temp) + " \xB7 " + esc(d.desc) + (d.sub ? " \xB7 " + esc(d.sub) : "") + "</div>";
  S.ios = (d) => {
    const hA = (+d.H24 % 12 + +d.M / 60) * 30 * Math.PI / 180, mA = +d.M * 6 * Math.PI / 180;
    const nums = Array.from({ length: 12 }, (_, i) => {
      const a = (i + 1) * 30 * Math.PI / 180;
      return '<text x="' + (160 + 122 * Math.sin(a)).toFixed(1) + '" y="' + (170 - 122 * Math.cos(a)).toFixed(1) + '" text-anchor="middle" font-family="Helvetica, Arial" font-size="30" fill="#222">' + (i + 1) + "</text>";
    }).join("");
    return '<svg style="position:absolute;left:110px;top:150px;filter:drop-shadow(0 18px 24px rgba(0,0,0,.6))" width="420" height="420" viewBox="0 0 320 320"><defs><linearGradient id="tcbz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f4f4"/><stop offset=".5" stop-color="#9a9a9a"/><stop offset="1" stop-color="#e0e0e0"/></linearGradient><radialGradient id="tcfc" cx=".5" cy=".4"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6e6e6"/></radialGradient></defs><circle cx="160" cy="160" r="156" fill="url(#tcbz)"/><circle cx="160" cy="160" r="142" fill="url(#tcfc)" stroke="#888"/>' + nums + '<line x1="160" y1="160" x2="' + (160 + 75 * Math.sin(hA)).toFixed(1) + '" y2="' + (160 - 75 * Math.cos(hA)).toFixed(1) + '" stroke="#111" stroke-width="9" stroke-linecap="round"/><line x1="160" y1="160" x2="' + (160 + 112 * Math.sin(mA)).toFixed(1) + '" y2="' + (160 - 112 * Math.cos(mA)).toFixed(1) + '" stroke="#111" stroke-width="6" stroke-linecap="round"/><g class="spin" style="transform-origin:160px 160px;animation-delay:-' + d.sec + 's"><line x1="160" y1="182" x2="160" y2="34" stroke="#d0202e" stroke-width="2.5"/></g><circle cx="160" cy="160" r="6" fill="#d0202e"/><ellipse cx="160" cy="95" rx="120" ry="55" fill="#fff" opacity=".35"/></svg><div style="position:absolute;left:600px;top:170px;width:560px;min-height:360px;box-sizing:border-box;border-radius:26px;background:linear-gradient(180deg,#6aa6dc 0%,#3c78b4 50%,#2e649c 51%,#4a86c2 100%);border:2px solid rgba(255,255,255,.55);box-shadow:0 18px 40px rgba(0,0,0,.5),inset 0 2px 0 rgba(255,255,255,.6);padding:26px 34px;color:#fff;text-shadow:0 -1px 0 rgba(0,0,0,.45);font-family:Helvetica,Arial,sans-serif"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><div style="min-width:0"><div style="font-size:46px;font-weight:700;line-height:1.05">' + esc(d.place || d.date) + '</div><div style="font-size:20px;opacity:.9;margin-top:4px">' + esc(d.hilo) + "</div></div>" + ic(d.code, 100) + '</div><div style="font-size:110px;font-weight:300;line-height:1;margin-top:6px">' + esc(d.temp) + '</div><div style="font-size:22px">' + esc(d.desc) + " \xB7 " + esc(d.date) + "</div>" + (d.sub ? '<div style="font-size:18px;opacity:.85;margin-top:4px">' + esc(d.sub) + "</div>" : "") + "</div>";
  };
  S.xiaomi = (d) => '<svg style="position:absolute;left:120px;top:60px" width="600" height="600"><circle cx="300" cy="300" r="280" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="3"/><circle class="sweep" cx="300" cy="300" r="280" fill="none" stroke="#5FD4F0" stroke-width="3" stroke-linecap="round" stroke-dasharray="1760" stroke-dashoffset="1760" style="transform:rotate(-90deg);transform-origin:300px 300px;animation-delay:-' + d.sec + 's"/></svg><div style="position:absolute;left:220px;top:120px;font-weight:100;font-size:260px;line-height:.9;color:#fff;font-variant-numeric:tabular-nums">' + d.H + '</div><div style="position:absolute;left:370px;top:340px;font-weight:100;font-size:260px;line-height:.9;color:#5FD4F0;font-variant-numeric:tabular-nums">' + d.M + '</div><div style="position:absolute;left:800px;top:220px;right:40px;display:flex;flex-direction:column;gap:12px">' + big(d, 54, "font-weight:300") + '<span style="font-size:30px;font-weight:300">' + esc(d.date) + '</span><span style="font-size:22px;opacity:.75;display:flex;align-items:center;gap:10px">' + ic(d.code, 40) + esc(d.desc) + " " + esc(d.temp) + "</span>" + (d.sub ? '<span style="font-size:20px;opacity:.6">' + esc(d.sub) + "</span>" : "") + "</div>";
  S.samsung = (d) => '<div class="sh" style="position:absolute;left:0;right:0;top:72px;text-align:center;line-height:.88;font-variant-numeric:tabular-nums"><div style="font-size:196px;font-weight:800;color:#fff">' + d.H + '</div><div style="font-size:196px;font-weight:200;color:#9fc4ff">' + d.M + '</div></div><div style="position:absolute;left:0;right:0;top:450px;text-align:center">' + big(d, 52) + '</div><div class="glass" style="position:absolute;left:50%;transform:translateX(-50%);top:540px;border-radius:999px;padding:14px 34px;display:flex;align-items:center;gap:22px;white-space:nowrap;font-size:22px">' + ic(d.code, 40) + "<span>" + esc(d.temp) + " " + esc(d.desc) + '</span><span style="opacity:.5">|</span><span>' + esc(d.date) + "</span>" + (d.sub ? '<span style="opacity:.5">|</span><span>' + esc(d.sub) + "</span>" : "") + (d.batt ? '<span style="opacity:.5">|</span><span>' + esc(d.batt) + "</span>" : "") + "</div>";
  S.sony = (d) => '<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,20,40,.5),rgba(0,20,40,0) 70%)"></div><div class="sh" style="position:absolute;left:100px;top:60px">' + big(d, 58, "font-weight:300;letter-spacing:3px;text-transform:uppercase") + '</div><div class="sh" style="position:absolute;left:92px;top:150px;font-weight:100;font-size:340px;line-height:.85;letter-spacing:-6px;font-variant-numeric:tabular-nums;transform:scaleY(1.12);transform-origin:left top">' + d.H + ":" + d.M + '</div><div class="sh" style="position:absolute;left:100px;top:575px;display:flex;gap:26px;align-items:center;font-size:24px;font-weight:300;letter-spacing:1px"><span style="font-weight:700">' + esc(d.date.toUpperCase()) + '</span><span style="width:40px;height:2px;background:#fff;opacity:.6"></span><span>' + esc(d.desc) + " " + esc(d.temp) + "</span>" + (d.sub ? '<span style="opacity:.8">' + esc(d.sub) + "</span>" : "") + "</div>";
  const OWN_BG = { flap: "#05070a", minimal: "#000", ios: "radial-gradient(ellipse at 50% 30%,#4b5a6a,#1c232b 75%)", xiaomi: "linear-gradient(160deg,#0d1b2a,#13293f 60%,#1d3a52)" };
  let cur = null, layer = null, box = null, canv = null, dim = null, edge = null, flapN = 10, flapPlace = "", flapOff = 0, flapT = 0;
  let last = "", prevH = "", prevM = "", styleEl = null, shownAt = 0;
  const fitBox = () => {
    if (!layer || !box) return;
    const W = layer.clientWidth || innerWidth, H = layer.clientHeight || innerHeight;
    const sc = Math.min(W / 1280, H / 720);
    const sh = cur ? [[0, 0], [5, 3], [9, 6], [5, 3], [-5, -3], [-9, -6]][cur.shift || 0] : [0, 0];
    box.style.transform = "translate(" + Math.round((W - 1280 * sc) / 2 + sh[0]) + "px," + Math.round((H - 720 * sc) / 2 + sh[1]) + "px) scale(" + sc + ")";
  };
  const mkLayer = () => {
    if (layer) return;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.textContent = CSS + "#tcidleL{position:fixed;inset:0;z-index:99990;overflow:hidden;background:#0B1A2A;cursor:pointer;animation:tcidlein .4s ease-out}@keyframes tcidlein{from{opacity:0}to{opacity:1}}#tcidleL .bx{position:absolute;left:0;top:0;width:1280px;height:720px;transform-origin:0 0;transition:transform 3s ease-in-out}#tcidleL .tap{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);font:14px Overpass,sans-serif;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.5);animation:tctap 6s forwards}@keyframes tctap{0%,70%{opacity:.8}100%{opacity:0}}";
      document.head.appendChild(styleEl);
    }
    layer = document.createElement("div");
    layer.id = "tcidleL";
    layer.setAttribute("role", "button");
    layer.setAttribute("aria-label", window.TC_LANG === "en" ? "Close the idle screen" : "\u0110\xF3ng m\xE0n h\xECnh ch\u1EDD");
    canv = document.createElement("canvas");
    canv.id = "idlesky";
    canv.setAttribute("aria-hidden", "true");
    canv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    dim = document.createElement("div");
    dim.style.cssText = "position:absolute;inset:0;pointer-events:none";
    const ph = document.createElement("div");
    ph.className = "phw";
    ph.style.cssText = "position:absolute;inset:0;pointer-events:none";
    box = document.createElement("div");
    box.className = "bx";
    box.id = "tcidle";
    edge = document.createElement("div");
    edge.style.cssText = "position:absolute;inset:0;pointer-events:none";
    const tap = document.createElement("span");
    tap.className = "tap";
    tap.textContent = window.TC_LANG === "en" ? "Tap to close" : "Ch\u1EA1m \u0111\u1EC3 \u0111\xF3ng";
    [canv, ph, dim, box, edge, tap].forEach((e) => layer.appendChild(e));
    layer.addEventListener("click", () => {
      if (window.__idleClose) window.__idleClose();
    });
    document.body.appendChild(layer);
    shownAt = Date.now();
    last = "";
    fitBox();
  };
  addEventListener("resize", fitBox);
  const flapTick = () => {
    const row = document.getElementById("tcflapPl");
    if (!row || flapPlace.length <= flapN - 1) return;
    const txt = flapPlace + "   " + flapPlace;
    flapOff = (flapOff + 1) % (flapPlace.length + 3);
    const seg = (" " + txt.slice(flapOff, flapOff + flapN - 1)).padEnd(flapN, " ");
    [].forEach.call(row.children, (t, i) => {
      const c = seg[i] || " ";
      if (t.textContent !== c.trim()) {
        t.textContent = c === " " ? "" : c;
        t.className = "t " + (c === " " ? "e" : "w");
      }
    });
  };
  window.TCIdle = {
    styles: ["htc", "mini", "flap", "analog", "minimal", "ios", "xiaomi", "samsung", "sony"],
    paint(d) {
      const shiftWas = cur ? cur.shift : null;
      cur = d;
      mkLayer();
      if (shiftWas !== d.shift) fitBox();
      const st = S[d.style] ? d.style : "htc";
      layer.style.background = OWN_BG[st] || "#0B1A2A";
      canv.style.display = OWN_BG[st] ? "none" : "block";
      canv.style.opacity = d.bgOp == null ? 1 : d.bgOp;
      dim.style.background = "rgba(0,0,0," + (d.dark || 0) + ")";
      edge.style.boxShadow = d.edge ? "inset 0 0 0 2px rgba(95,212,240,.55), inset 0 0 18px rgba(95,212,240,.25)" : "none";
      const photo = d.photoOn && !OWN_BG[st] ? photoFor(d.photoPlace, d.st) : "";
      const pw = layer.querySelector(".phw");
      const phHtml = photo ? `<div class="ph" style="background-image:url('` + photo.replace(/'/g, "%27") + `')"></div><div class="phd"></div>` : "";
      if (pw.getAttribute("data-u") !== photo) {
        pw.innerHTML = phHtml;
        pw.setAttribute("data-u", photo);
      }
      const sig = [st, d.H, d.M, d.date, d.temp, d.desc, d.place, d.sub, d.appt, d.lang, d.days.map((x) => x.n + x.hi + x.lo).join(","), d.night, d.batt, d.hilo, d.sunL].join("|");
      if (sig === last && box.firstChild) return;
      const f = { h: false, m: false, pH: prevH, pM: prevM };
      if (prevM && prevM !== d.M && last.split("|")[0] === st) {
        f.m = true;
        f.h = prevH !== d.H;
      }
      last = sig;
      prevH = d.H;
      prevM = d.M;
      box.innerHTML = S[st](d, f);
      clearInterval(flapT);
      flapOff = 0;
      if (st === "flap" && flapPlace.length > flapN - 1) flapT = setInterval(flapTick, 900);
    },
    hide() {
      if (!layer) return;
      clearInterval(flapT);
      layer.remove();
      layer = box = canv = dim = edge = null;
      cur = null;
      last = "";
      prevH = prevM = "";
    },
    reset() {
      this.hide();
    },
    isOn() {
      return !!layer;
    }
  };
})();
