(() => {
  "use strict";
  const NAV = window.NAV = { st: { active: false, route: null, alts: [], preview: null, dest: null, wps: [], said: {} }, ver: 1 };
  const LS = {
    get(k, d) {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : d;
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {
      }
    }
  };
  const RAD = Math.PI / 180, ER = 6371e3;
  const dist = (a, b) => {
    const dLa = (b[0] - a[0]) * RAD, dLo = (b[1] - a[1]) * RAD;
    const s = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * RAD) * Math.cos(b[0] * RAD) * Math.sin(dLo / 2) ** 2;
    return 2 * ER * Math.asin(Math.min(1, Math.sqrt(s)));
  };
  NAV.dist = dist;
  const segProj = (p, a, b) => {
    const kx = Math.cos(p[0] * RAD) * ER * RAD, ky = ER * RAD;
    const ax = (a[1] - p[1]) * kx, ay = (a[0] - p[0]) * ky, bx = (b[1] - p[1]) * kx, by = (b[0] - p[0]) * ky;
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 ? -(ax * dx + ay * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    return { d: Math.hypot(ax + t * dx, ay + t * dy), t };
  };
  const say = (t) => {
    try {
      if (window.TCN && !(NAV.cfg && NAV.cfg.mute)) window.TCN.call("say", t);
    } catch (e) {
    }
  };
  const toast = (t) => {
    if (window.__ui && window.__ui.toast) window.__ui.toast(t);
  };
  const redraw = () => {
    if (window.__ui) window.__ui.setState({ navAt: Date.now() });
  };
  NAV.cfg = LS.get("tc-navcfg", { mute: false, rotate: false, avoid: [], histOff: false, cams: true });
  NAV.setCfg = (k, v) => {
    NAV.cfg[k] = v;
    LS.set("tc-navcfg", NAV.cfg);
    redraw();
  };
  const fmtDist = (m) => m >= 1e3 ? (m >= 1e4 ? Math.round(m / 1e3) : (Math.round(m / 100) / 10).toString().replace(".", ",")) + " km" : (m >= 100 ? Math.round(m / 50) * 50 : Math.max(10, Math.round(m / 10) * 10)) + " m";
  const sayDist = (m) => m >= 1e3 ? (Math.round(m / 100) / 10).toString().replace(".", ",") + " c\xE2y s\u1ED1" : (Math.round(m / 50) * 50 || 50) + " m\xE9t";
  const fmtDur = (s) => {
    const m = Math.max(1, Math.round(s / 60));
    return m >= 60 ? Math.floor(m / 60) + " gi\u1EDD " + (m % 60 ? m % 60 + " ph" : "") : m + " ph\xFAt";
  };
  const hhmm = (t) => {
    const d = new Date(t);
    return d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
  };
  NAV.fmtDist = fmtDist;
  NAV.fmtDur = fmtDur;
  NAV.hhmm = hhmm;
  const DIRW = { uturn: "Quay \u0111\u1EA7u", "sharp right": "R\u1EBD g\u1EAFt ph\u1EA3i", right: "R\u1EBD ph\u1EA3i", "slight right": "Ch\u1EBFch ph\u1EA3i", straight: "\u0110i th\u1EB3ng", "slight left": "Ch\u1EBFch tr\xE1i", left: "R\u1EBD tr\xE1i", "sharp left": "R\u1EBD g\u1EAFt tr\xE1i" };
  const side = (m) => /right/.test(m || "") ? "ph\u1EA3i" : /left/.test(m || "") ? "tr\xE1i" : "";
  const nm = (s) => {
    const n = (s.name || "").trim(), r = (s.ref || "").split(";")[0];
    return n ? n + (r && n.indexOf(r) < 0 ? " (" + r + ")" : "") : r;
  };
  const viText = (s, wpName) => {
    const m = s.maneuver, t = m.type, mod = m.modifier || "", n = nm(s), onto = n ? " v\xF4 " + n : "";
    switch (t) {
      case "depart":
        return "Xu\u1EA5t ph\xE1t" + (n ? " theo " + n : "");
      case "arrive":
        return (wpName ? "T\u1EDBi " + wpName : "T\u1EDBi n\u01A1i") + (side(mod) ? ", \u1EDF b\xEAn tay " + side(mod) : "");
      case "merge":
        return "Nh\u1EADp l\xE0n" + (side(mod) ? " b\xEAn " + side(mod) : "") + onto;
      case "on ramp":
        return "L\xEAn \u0111\u01B0\u1EDDng d\u1EABn" + (side(mod) ? " b\xEAn " + side(mod) : "") + onto;
      case "off ramp": {
        const d = (s.destinations || "").split(",")[0].replace(/^[^:]*:\s*/, "");
        return "Ra l\u1ED1i" + (s.exits ? " s\u1ED1 " + s.exits.split(";")[0] : "") + (side(mod) ? " b\xEAn " + side(mod) : "") + (d ? " v\u1EC1 " + d : onto);
      }
      case "fork":
        return "Gi\u1EEF " + (side(mod) || "th\u1EB3ng") + (n ? " theo " + n : "");
      case "end of road":
        return "Cu\u1ED1i \u0111\u01B0\u1EDDng " + (DIRW[mod] || "r\u1EBD").toLowerCase() + onto;
      case "roundabout":
      case "rotary":
        return "V\xF4 v\xF2ng xoay, ra l\u1ED1i th\u1EE9 " + (m.exit || 1) + onto;
      case "roundabout turn":
        return (DIRW[mod] || "\u0110i") + " \u1EDF v\xF2ng xoay" + onto;
      case "exit roundabout":
      case "exit rotary":
        return "Ra kh\u1ECFi v\xF2ng xoay" + onto;
      case "continue":
      case "new name":
        return mod && mod !== "straight" ? (DIRW[mod] || "\u0110i ti\u1EBFp") + onto : "\u0110i th\u1EB3ng" + (n ? " theo " + n : "");
      default:
        return (DIRW[mod] || "\u0110i ti\u1EBFp") + onto;
    }
  };
  const iconKey = (s) => {
    const t = s.maneuver.type, mod = s.maneuver.modifier || "straight";
    if (t === "arrive") return "arrive";
    if (/roundabout|rotary/.test(t)) return "round";
    if (t === "fork" || t === "off ramp" || t === "on ramp" || t === "merge") return /right/.test(mod) ? "slight right" : /left/.test(mod) ? "slight left" : "straight";
    return mod;
  };
  const TILES = {
    dark: ["https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", "\xA9 OpenStreetMap \xA9 CARTO", 19],
    light: ["https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", "\xA9 OpenStreetMap \xA9 CARTO", 19],
    topo: ["https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", "\xA9 OpenStreetMap \xB7 SRTM \xB7 \xA9 OpenTopoMap (CC-BY-SA)", 17],
    sat: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", "\u1EA2nh v\u1EC7 tinh \xA9 Esri, Maxar, Earthstar Geographics", 18]
  };
  let dbp = null;
  const db = () => dbp || (dbp = new Promise((res) => {
    try {
      const r = indexedDB.open("tc-tiles", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("t");
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(null);
    } catch (e) {
      res(null);
    }
  }));
  const idbGet = (k) => db().then((d) => d ? new Promise((res) => {
    try {
      const q = d.transaction("t").objectStore("t").get(k);
      q.onsuccess = () => res(q.result || null);
      q.onerror = () => res(null);
    } catch (e) {
      res(null);
    }
  }) : null);
  const idbPut = (k, v) => db().then((d) => {
    if (d) try {
      d.transaction("t", "readwrite").objectStore("t").put(v, k);
    } catch (e) {
    }
  });
  const tileUrl = (tpl, z, x, y) => tpl.replace("{s}", "abc"[Math.abs(x + y) % 3]).replace("{z}", z).replace("{x}", x).replace("{y}", y).replace("{r}", "");
  let map = null, layer = null, layerKey = "", box = null, wrap = null;
  let routeL = null, routeC = null, altL = [], trailL = null, van = null, marks = [], follow = true, userAt = 0, lastVan = null, lastSig = "", fittedSig = "";
  const mkLayer = (T) => {
    const CTL = window.L.TileLayer.extend({ createTile(c, done) {
      const img = document.createElement("img");
      img.alt = "";
      const url = this.getTileUrl(c);
      img.onload = () => done(null, img);
      img.onerror = () => {
        if (img.__f) {
          done(new Error("tile"), img);
          return;
        }
        img.__f = 1;
        idbGet(url).then((b) => {
          if (b) img.src = URL.createObjectURL(b);
          else done(new Error("tile"), img);
        });
      };
      img.src = url;
      return img;
    } });
    return new CTL(T[0], { attribution: T[1], maxZoom: T[2], subdomains: "abc", detectRetina: false });
  };
  const ensure = () => {
    if (map) return true;
    if (!window.L) return false;
    box = document.getElementById("tcmap");
    if (!box) return false;
    wrap = document.createElement("div");
    wrap.style.cssText = "position:absolute;left:50%;top:50%;width:100%;height:100%;transform:translate(-50%,-50%)";
    box.appendChild(wrap);
    map = window.L.map(wrap, { zoomControl: false, attributionControl: true, preferCanvas: true, zoomSnap: 0.5, inertia: true }).setView([-37.75, 144.73], 13);
    map.attributionControl.setPrefix("");
    const off = () => {
      follow = false;
      userAt = Date.now();
      redraw();
    };
    map.on("dragstart", off);
    wrap.addEventListener("wheel", off, { passive: true });
    wrap.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches.length > 1) off();
    }, { passive: true });
    map.on("click", (e) => {
      if (NAV.onMapClick) NAV.onMapClick(e.latlng);
    });
    return true;
  };
  NAV.zoomIn = () => {
    if (map) {
      map.zoomIn(1);
      follow = false;
      userAt = Date.now();
    }
  };
  NAV.zoomOut = () => {
    if (map) {
      map.zoomOut(1);
      follow = false;
      userAt = Date.now();
    }
  };
  NAV.locate = () => {
    follow = true;
    userAt = 0;
    if (map && lastVan) map.setView(lastVan, NAV.st.active ? map.getZoom() : 15, { animate: true });
    redraw();
  };
  NAV.following = () => follow;
  NAV.fitAll = () => {
    if (!map) return;
    const ls = [routeL, trailL].concat(altL).filter(Boolean);
    let b = null;
    ls.forEach((l) => {
      try {
        const lb = l.getBounds();
        b = b ? b.extend(lb) : lb;
      } catch (e) {
      }
    });
    marks.forEach((m) => {
      b = b ? b.extend(m.getLatLng()) : window.L.latLngBounds(m.getLatLng(), m.getLatLng());
    });
    if (lastVan) b = b ? b.extend(lastVan) : null;
    if (b && b.isValid()) {
      follow = false;
      userAt = Date.now();
      map.fitBounds(b, { paddingTopLeft: [NAV.padL || 40, 150], paddingBottomRight: [80, 130], maxZoom: 15 });
    }
  };
  NAV.flyTo = (ll, z) => {
    if (!map) return;
    follow = false;
    userAt = Date.now();
    map.setView(ll, z || 15, { animate: true });
  };
  const pin = (ll, html, z) => window.L.marker(ll, { icon: window.L.divIcon({ className: "", html, iconSize: [0, 0] }), keyboard: false, zIndexOffset: z || 0 });
  const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const dot = (bg, inner, label, logo) => '<div style="transform:translate(-13px,-13px);display:flex;align-items:center;gap:5px;white-space:nowrap"><span style="min-width:26px;height:26px;border-radius:13px;box-sizing:border-box;padding:0 4px;background:' + bg + ';border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);color:#fff;font:800 13px Overpass,sans-serif;display:flex;align-items:center;justify-content:center">' + inner + "</span>" + (label ? '<span style="display:flex;align-items:center;gap:4px;font:700 12px Overpass,sans-serif;color:#10202c;background:rgba(255,255,255,.94);padding:2px 7px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.3)">' + (logo ? '<img src="' + logo + '" style="width:16px;height:16px;border-radius:3px">' : "") + esc(label) + "</span>" : "") + "</div>";
  const arrowIco = (brg) => window.L.divIcon({ className: "", iconSize: [0, 0], html: '<div style="transform:translate(-22px,-22px) rotate(' + Math.round(brg || 0) + 'deg);width:44px;height:44px"><svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="rgba(47,208,245,0.18)"/><path d="M22 6l11 28-11-6-11 6z" fill="#FBB040" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/></svg></div>' });
  NAV.sync = (o) => {
    document.body.classList.toggle("map-on", !!o.show);
    if (!o.show) return;
    if (!ensure()) return;
    NAV.padL = o.padL || 40;
    const key = o.style === "auto" || !TILES[o.style] ? o.night ? "dark" : "light" : o.style;
    if (layerKey !== key) {
      if (layer) map.removeLayer(layer);
      layer = mkLayer(TILES[key]).addTo(map);
      layerKey = key;
    }
    const tp = wrap.querySelector(".leaflet-tile-pane");
    if (tp) tp.style.filter = o.bright && o.bright !== 100 ? "brightness(" + o.bright / 100 + ")" : "";
    if (!box.__sized) {
      box.__sized = true;
      setTimeout(() => map.invalidateSize(false), 60);
    }
    const S = NAV.st, R = S.route;
    const sig = (R ? "n" + R.id + ":" + S.altPick + ":" + S.alts.length : "") + "|" + (o.rt ? o.rt.sig : "") + "|" + (S.preview ? S.preview.t0 : "") + "|" + (o.places || []).map((p) => p.name).join(",") + "|" + (o.park ? o.park.t : "") + "|" + (S.wps || []).length;
    if (sig !== lastSig) {
      lastSig = sig;
      [routeL, routeC, trailL].concat(altL).forEach((l) => {
        if (l) map.removeLayer(l);
      });
      routeL = routeC = trailL = null;
      altL = [];
      marks.forEach((m) => map.removeLayer(m));
      marks = [];
      if (R) {
        S.alts.forEach((a, i) => {
          if (a === R) return;
          const l = window.L.polyline(a.pts, { color: "#7d8f9c", weight: 7, opacity: 0.75 }).addTo(map);
          l.on("click", () => NAV.pickAlt(i));
          altL.push(l);
        });
        routeC = window.L.polyline(R.pts, { color: "#0b5f7a", weight: 12, opacity: 0.9, lineCap: "round" }).addTo(map);
        routeL = window.L.polyline(R.pts, { color: "#2fd0f5", weight: 7, opacity: 1, lineCap: "round" }).addTo(map);
        const wps = S.wps || [];
        wps.forEach((w, i) => {
          if (i === 0) return;
          const last = i === wps.length - 1;
          marks.push(pin([w.lat, w.lon], dot(last ? "#D0202E" : "#F28A1A", last ? "\u2691" : String(i), w.name, w.logo), 500).addTo(map));
        });
      } else if (o.rt && o.rt.pts && o.rt.pts.length > 1) {
        routeC = window.L.polyline(o.rt.pts, { color: "#5a3200", weight: 11, opacity: 0.7, lineCap: "round" }).addTo(map);
        routeL = window.L.polyline(o.rt.pts, { color: "#FF8A1F", weight: 6, opacity: 1, lineCap: "round" }).addTo(map);
        (o.rt.stops || []).forEach((s) => {
          if (s.lat == null) return;
          marks.push(pin([s.lat, s.lon], dot(s.start ? "#14A05A" : s.end ? "#D0202E" : "#F28A1A", s.start ? "\u25CF" : s.end ? "\u2691" : String(s.n || ""), s.short, s.logo), s.start || s.end ? 600 : 400).on("click", () => {
            if (s.id && window.__ui) window.__ui.setState({ dlg: "stop", stopId: s.id });
          }).addTo(map));
        });
      }
      if (S.preview && S.preview.pts && S.preview.pts.length > 1) {
        trailL = window.L.polyline(S.preview.pts, { color: "#2fd0f5", weight: 6, opacity: 0.95 }).addTo(map);
        marks.push(pin(S.preview.pts[0], dot("#14A05A", "\u25CF", ""), 300).addTo(map));
        marks.push(pin(S.preview.pts[S.preview.pts.length - 1], dot("#D0202E", "\u2691", ""), 300).addTo(map));
      }
      (o.places || []).forEach((p) => marks.push(pin([p.lat, p.lon], dot("#F28A1A", p.icon || "", p.name, p.logo), 100).on("click", () => {
        if (NAV.onPlaceClick) NAV.onPlaceClick(p);
      }).addTo(map)));
      if (o.park) marks.push(pin([o.park.lat, o.park.lon], dot("#2f6bf5", "P", "Xe \u0111\u1EADu \u1EDF \u0111\xE2y"), 200).addTo(map));
      const fs = (R ? "n" + R.id + ":" + S.altPick : o.rt ? o.rt.sig : "") + (S.preview ? S.preview.t0 : "");
      if (fs && fs !== fittedSig && !S.active) {
        fittedSig = fs;
        setTimeout(NAV.fitAll, 80);
      }
    }
    lastVan = o.van || null;
    if (o.van) {
      if (!van) van = window.L.marker(o.van, { icon: arrowIco(o.brg), keyboard: false, zIndexOffset: 1e3 }).addTo(map);
      else {
        van.setLatLng(o.van);
        if (Math.abs((van.__b || 0) - (o.brg || 0)) > 2) {
          van.setIcon(arrowIco(rotOn ? 0 : o.brg));
          van.__b = o.brg;
        }
      }
      if (!follow && userAt && (o.drive || S.active) && Date.now() - userAt > 1e4) follow = true;
      if (follow) {
        let z = map.getZoom();
        if (S.active) {
          const s = o.spd || 0;
          z = s > 85 ? 14.5 : s > 60 ? 15.5 : s > 30 ? 16.5 : 17;
        } else if (!box.__first) {
          box.__first = true;
          z = 15;
        }
        if (S.active || o.drive) {
          const h = map.getSize().y;
          const p = map.project(o.van, z).add([0, -h * 0.18]);
          map.setView(map.unproject(p, z), z, { animate: true, duration: 0.8 });
        } else map.setView(o.van, z, { animate: true });
      }
    }
    applyRotate(S.active && NAV.cfg.rotate ? o.brg || 0 : 0);
  };
  let rotOn = false;
  const applyRotate = (deg) => {
    if (!wrap) return;
    const on = !!deg || deg === 0 && NAV.st.active && NAV.cfg.rotate;
    if (on !== rotOn) {
      rotOn = on;
      wrap.style.width = wrap.style.height = on ? "160%" : "100%";
      map.invalidateSize(false);
      if (on) map.dragging.disable();
      else map.dragging.enable();
      if (van) van.setIcon(arrowIco(on ? 0 : van.__b));
    }
    wrap.style.transform = "translate(-50%,-50%)" + (on ? " rotate(" + -deg + "deg)" : "");
  };
  const ICON = { fuel: "\u26FD", supermarket: "\u{1F6D2}", convenience: "\u{1F6D2}", marketplace: "\u{1F6D2}", cafe: "\u2615", restaurant: "\u{1F35C}", fast_food: "\u{1F354}", place_of_worship: "\u26EA", school: "\u{1F3EB}", hospital: "\u{1F3E5}", pharmacy: "\u{1F48A}", chemist: "\u{1F48A}", parking: "\u{1F17F}", doityourself: "\u{1F527}", hardware: "\u{1F527}", mall: "\u{1F3EC}", department_store: "\u{1F3EC}", bank: "\u{1F3E6}", post_office: "\u2709", house: "\u{1F3E0}", residential: "\u{1F3E0}", car_repair: "\u{1F527}", hotel: "\u{1F3E8}", park: "\u{1F333}", station: "\u{1F689}", aerodrome: "\u2708" };
  NAV.iconOf = (kind) => ICON[kind] || "\u{1F4CD}";
  const logoOf = (n) => window.tcLogo && n ? window.tcLogo(n) : "";
  NAV.logoOf = logoOf;
  const toPlace = (f, near) => {
    const p = f.properties || {}, c = f.geometry.coordinates;
    const street = (p.housenumber ? p.housenumber + " " : "") + (p.street || "");
    const name = p.name || street || p.city || "Kh\xF4ng t\xEAn";
    const area = [p.name && street ? street : "", p.district || p.locality || p.city || "", p.state === "Victoria" ? "VIC" : p.state || ""].filter(Boolean).join(", ");
    const pl = { name, sub: area, lat: c[1], lon: c[0], kind: p.osm_value || "", icon: ICON[p.osm_value] || (p.housenumber ? "\u{1F3E0}" : "\u{1F4CD}") };
    pl.st = { Victoria: "VIC", "South Australia": "SA", "New South Wales": "NSW", Queensland: "QLD", "Australian Capital Territory": "ACT", "Western Australia": "WA", Tasmania: "TAS", "Northern Territory": "NT" }[p.state] || "";
    pl.logo = logoOf(p.name || "");
    if (near) pl.km = dist(near, [pl.lat, pl.lon]) / 1e3;
    return pl;
  };
  let sT = 0, sSeq = 0;
  NAV.search = (q, near, cb) => {
    clearTimeout(sT);
    q = (q || "").trim();
    if (q.length < 3) {
      cb([]);
      return;
    }
    const local = NAV.knownPlaces().filter((p) => p.name.toLowerCase().indexOf(q.toLowerCase()) >= 0).slice(0, 3).map((p) => Object.assign({ mine: true }, p));
    sT = setTimeout(() => {
      const my = ++sSeq;
      const u = "https://photon.komoot.io/api/?limit=7&lang=en&bbox=112.9,-43.8,153.7,-10.6&q=" + encodeURIComponent(q) + (near ? "&lat=" + near[0].toFixed(4) + "&lon=" + near[1].toFixed(4) : "");
      fetch(u).then((r) => r.json()).then((j) => {
        if (my === sSeq) cb(local.concat((j.features || []).map((f) => toPlace(f, near))).slice(0, 8));
      }).catch(() => fetch("https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=au&accept-language=en&q=" + encodeURIComponent(q)).then((r) => r.json()).then((a) => {
        if (my === sSeq) cb(local.concat((a || []).map((x) => ({ name: x.display_name.split(",")[0], sub: x.display_name.split(",").slice(1, 3).join(","), lat: +x.lat, lon: +x.lon, icon: "\u{1F4CD}", logo: logoOf(x.display_name.split(",")[0]), km: near ? dist(near, [+x.lat, +x.lon]) / 1e3 : null }))));
      }).catch(() => {
        if (my === sSeq) cb(local);
      }));
    }, 380);
  };
  NAV.reverse = (p) => fetch("https://photon.komoot.io/reverse?lang=en&lat=" + p[0] + "&lon=" + p[1]).then((r) => r.json()).then((j) => {
    const f = j.features && j.features[0];
    if (!f) return "";
    const pl = toPlace(f);
    return pl.name;
  }).catch(() => "");
  const OSRM = "https://router.project-osrm.org/route/v1/driving/";
  const build = (r, wps, noEx) => {
    const pts = [], steps = [], cum = [0];
    let tolls = [];
    let legI = 0;
    r.legs.forEach((leg, li) => leg.steps.forEach((s) => {
      const g = s.geometry && s.geometry.coordinates || [];
      const startIdx = Math.max(0, pts.length - 1);
      g.forEach((c, k) => {
        if (pts.length && k === 0) return;
        pts.push([c[1], c[0]]);
        if (pts.length > 1) cum.push(cum[cum.length - 1] + dist(pts[pts.length - 2], pts[pts.length - 1]));
      });
      const isWp = s.maneuver.type === "arrive" && li < r.legs.length - 1;
      steps.push({ at: cum[startIdx] || 0, text: viText(s, isWp ? wps[li + 1] && wps[li + 1].name : s.maneuver.type === "arrive" ? wps[wps.length - 1] && wps[wps.length - 1].name : ""), ico: iconKey(s), name: nm(s), dist: s.distance, leg: li, wp: s.maneuver.type === "arrive" });
      (s.intersections || []).forEach((x) => {
        if ((x.classes || []).indexOf("toll") >= 0 && s.name && tolls.indexOf(s.name) < 0) tolls.push(s.name);
      });
      legI = li;
    }));
    if (!pts.length) r.geometry.coordinates.forEach((c) => pts.push([c[1], c[0]]));
    while (cum.length < pts.length) cum.push(cum[cum.length - 1]);
    return { id: Math.random().toString(36).slice(2, 8), pts, cum, steps, dist: r.distance, dur: r.duration, tolls, noEx: !!noEx, legs: r.legs.map((l) => ({ dist: l.distance, dur: l.duration })) };
  };
  NAV.route = (wps, avoid) => {
    const coords = wps.map((w) => (+w.lon).toFixed(6) + "," + (+w.lat).toFixed(6)).join(";");
    const base = OSRM + coords + "?overview=full&geometries=geojson&steps=true&alternatives=" + (wps.length === 2 ? "3" : "false");
    const ex = (avoid || []).join(",");
    const go = (u) => fetch(u).then((r) => r.json());
    return go(base + (ex ? "&exclude=" + ex : "")).then((j) => j.code === "Ok" || !ex ? j : go(base).then((j2) => {
      j2.noEx = true;
      return j2;
    })).then((j) => {
      if (j.code !== "Ok" || !j.routes || !j.routes.length) throw new Error(j.message || "route");
      return j.routes.map((r) => build(r, wps, j.noEx));
    });
  };
  NAV.plan = (wps, opt) => {
    opt = opt || {};
    const S = NAV.st;
    S.planning = true;
    S.err = "";
    redraw();
    return NAV.route(wps, opt.avoid || NAV.cfg.avoid).then((rs) => {
      S.planning = false;
      S.alts = rs;
      S.altPick = 0;
      S.route = rs[0];
      S.wps = wps;
      S.dest = wps[wps.length - 1];
      S.active = false;
      S.name = opt.name || "";
      S.preview = null;
      rs.forEach((r, i) => {
        r.label = i === 0 ? "Nhanh nh\u1EA5t" : r.tolls.length < rs[0].tolls.length ? "Kh\xF4ng thu ph\xED" : r.dist < rs[0].dist ? "Ng\u1EAFn h\u01A1n" : "\u0110\u01B0\u1EDDng kh\xE1c";
      });
      redraw();
      return rs;
    }).catch((e) => {
      S.planning = false;
      S.err = "Kh\xF4ng t\xECm \u0111\u01B0\u1EE3c \u0111\u01B0\u1EDDng \u2014 ki\u1EC3m tra m\u1EA1ng r\u1ED3i th\u1EED l\u1EA1i";
      redraw();
      throw e;
    });
  };
  NAV.pickAlt = (i) => {
    const S = NAV.st;
    if (!S.alts[i]) return;
    S.altPick = i;
    S.route = S.alts[i];
    redraw();
  };
  NAV.cancel = () => {
    const S = NAV.st;
    S.active = false;
    S.route = null;
    S.alts = [];
    S.wps = [];
    S.dest = null;
    S.err = "";
    fittedSig = "";
    redraw();
  };
  NAV.start = () => {
    const S = NAV.st;
    if (!S.route) return;
    S.active = true;
    S.idx = 0;
    S.said = {};
    S.off = 0;
    S.startAt = Date.now();
    S.alts = [S.route];
    S.next = 1;
    S.toNext = S.route.steps[1] ? S.route.steps[1].at : S.route.dist;
    S.remain = S.route.dist;
    S.remainDur = S.route.dur;
    follow = true;
    userAt = 0;
    const first = S.route.steps[1];
    say("B\u1EAFt \u0111\u1EA7u ch\u1EC9 \u0111\u01B0\u1EDDng t\u1EDBi " + (S.dest ? S.dest.name : "n\u01A1i \u0111\u1EBFn") + ". " + fmtDur(S.route.dur) + ", " + sayDist(S.route.dist) + "." + (first ? " " + sayDist(first.at) + " n\u1EEFa, " + first.text.toLowerCase() + "." : ""));
    if (S.route.tolls.length && (NAV.cfg.avoid || []).indexOf("toll") < 0) toast("\u0110\u01B0\u1EDDng n\xE0y c\xF3 \u0111o\u1EA1n thu ph\xED: " + S.route.tolls.slice(0, 2).join(", "));
    if (NAV.cfg.cams) loadCams(S.route.pts);
    redraw();
  };
  NAV.stop = (quiet) => {
    const S = NAV.st;
    if (S.active && !quiet) say("\u0110\xE3 d\u1EEBng ch\u1EC9 \u0111\u01B0\u1EDDng");
    NAV.cancel();
  };
  NAV.startTo = (place, opt) => {
    const here = lastVan || window.__liveLL && window.__liveLL();
    if (!here) {
      toast("Ch\u01B0a b\u1EAFt \u0111\u01B0\u1EE3c GPS \u2014 ch\u1EDD ch\xFAt r\u1ED3i b\u1EA5m l\u1EA1i");
      return Promise.resolve();
    }
    return NAV.plan([{ name: "V\u1ECB tr\xED c\u1EE7a Tom", lat: here[0], lon: here[1] }, place], opt).then(() => {
      if (!opt || opt.start !== false) NAV.start();
    }).catch(() => {
    });
  };
  NAV.tick = (f) => {
    if (f.lat == null) return;
    histTick(f);
    camTick(f);
    const S = NAV.st, R = S.route;
    if (!S.active || !R) return;
    const p = [f.lat, f.lon];
    let best = 1e9, bi = S.idx || 0, bt = 0;
    const a = Math.max(0, (S.idx || 0) - 8), b = Math.min(R.pts.length - 1, (S.idx || 0) + 600);
    for (let i = a; i < b; i++) {
      const q = segProj(p, R.pts[i], R.pts[i + 1]);
      if (q.d < best) {
        best = q.d;
        bi = i;
        bt = q.t;
      }
    }
    if (best > Math.max(55, (f.acc || 0) * 1.5)) {
      S.off = (S.off || 0) + 1;
      if (S.off >= 3 && Date.now() - (S.rerouteAt || 0) > 15e3) reroute(p);
      return;
    }
    S.off = 0;
    S.idx = bi;
    const along = R.cum[bi] + bt * ((R.cum[bi + 1] || R.cum[bi]) - R.cum[bi]);
    S.remain = Math.max(0, R.dist - along);
    S.remainDur = R.dur * (S.remain / (R.dist || 1));
    let n = 1;
    while (n < R.steps.length - 1 && R.steps[n].at <= along + 4) n++;
    S.next = n;
    S.toNext = Math.max(0, R.steps[n].at - along);
    const st = R.steps[n], spd = f.spd || 0, said = S.said[n] || (S.said[n] = {});
    const far = spd > 75 ? 1500 : spd > 45 ? 600 : 350, near = spd > 75 ? 350 : spd > 45 ? 160 : 70;
    if (!said.far && S.toNext <= far && S.toNext > near * 1.6 && R.steps[n].at - R.steps[n - 1].at > near * 2) {
      said.far = 1;
      say(sayDist(S.toNext) + " n\u1EEFa, " + st.text.toLowerCase());
    }
    if (!said.near && S.toNext <= near) {
      said.near = 1;
      say(st.text);
      if (st.wp && n < R.steps.length - 1) toast(st.text);
    }
    if (n === R.steps.length - 1 && S.toNext < 25) arrive();
    redraw();
  };
  const arrive = () => {
    const S = NAV.st, d = S.dest;
    say("\u0110\xE3 t\u1EDBi n\u01A1i" + (d && d.name ? ", " + d.name : "") + ".");
    toast("\u{1F3C1} \u0110\xE3 t\u1EDBi " + (d ? d.name : "n\u01A1i"));
    S.arrivedAt = Date.now();
    S.active = false;
    setTimeout(() => {
      if (!NAV.st.active) NAV.cancel();
    }, 45e3);
    redraw();
  };
  const reroute = (p) => {
    const S = NAV.st;
    S.rerouteAt = Date.now();
    say("\u0110ang t\xEDnh l\u1EA1i \u0111\u01B0\u1EDDng");
    const R = S.route;
    const passedLegs = R.steps.slice(0, S.next).filter((s) => s.wp).length;
    const rest = S.wps.slice(1 + passedLegs);
    if (!rest.length) return;
    NAV.route([{ name: "V\u1ECB tr\xED c\u1EE7a Tom", lat: p[0], lon: p[1] }].concat(rest), NAV.cfg.avoid).then((rs) => {
      S.route = rs[0];
      S.alts = [rs[0]];
      S.wps = [{ name: "V\u1ECB tr\xED c\u1EE7a Tom", lat: p[0], lon: p[1] }].concat(rest);
      S.idx = 0;
      S.said = {};
      S.off = 0;
      redraw();
    }).catch(() => {
    });
  };
  NAV.navView = () => {
    const S = NAV.st, R = S.route;
    if (!R) return null;
    const st = R.steps[S.next || 1] || R.steps[R.steps.length - 1], st2 = R.steps[(S.next || 1) + 1];
    const remain = S.active ? S.remain : R.dist, dur = S.active ? S.remainDur : R.dur;
    return {
      active: S.active,
      ico: st ? st.ico : "straight",
      dist: fmtDist(S.active ? S.toNext : R.steps[1] ? R.steps[1].at : R.dist),
      text: st ? st.text : "",
      then: st2 ? st2.text : "",
      thenDist: st2 ? fmtDist(st2.at - st.at) : "",
      thenIco: st2 ? st2.ico : "",
      eta: hhmm(Date.now() + dur * 1e3),
      left: fmtDur(dur),
      km: fmtDist(remain),
      dest: S.dest ? S.dest.name : "",
      destLogo: S.dest ? S.dest.logo || logoOf(S.dest.name) : "",
      tolls: R.tolls,
      noEx: R.noEx,
      alts: S.alts.map((a, i) => ({ label: a.label || "\u0110\u01B0\u1EDDng " + (i + 1), km: fmtDist(a.dist), min: fmtDur(a.dur), toll: a.tolls.length > 0, on: i === S.altPick, pick: () => NAV.pickAlt(i) })),
      planning: !!S.planning,
      err: S.err
    };
  };
  let cams = [], camWarned = {};
  const loadCams = (pts) => {
    cams = [];
    camWarned = {};
    const smp = [];
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      acc += dist(pts[i - 1], pts[i]);
      if (acc > 1200 || i === pts.length - 1) {
        smp.push(pts[i]);
        acc = 0;
      }
    }
    if (smp.length < 2) smp.unshift(pts[0]);
    const chunks = [];
    for (let i = 0; i < smp.length; i += 80) chunks.push(smp.slice(Math.max(0, i - 1), i + 80));
    const one = (k) => {
      if (k >= chunks.length || k > 12) return;
      const line = chunks[k].map((p) => p[0].toFixed(5) + "," + p[1].toFixed(5)).join(",");
      const q = '[out:json][timeout:20];(node["highway"="speed_camera"](around:120,' + line + ');nwr["amenity"="school"](around:220,' + line + "););out center 400;";
      fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(q) }).then((r) => r.json()).then((j) => {
        (j.elements || []).forEach((e) => {
          const la = e.lat != null ? e.lat : e.center && e.center.lat, lo = e.lon != null ? e.lon : e.center && e.center.lon;
          if (la == null) return;
          cams.push({ id: e.type + e.id, lat: la, lon: lo, school: !!(e.tags && e.tags.amenity === "school") });
        });
      }).catch(() => {
      }).then(() => one(k + 1));
    };
    one(0);
  };
  const schoolTime = () => {
    const d = /* @__PURE__ */ new Date(), h = d.getHours() + d.getMinutes() / 60, wd = d.getDay();
    return wd >= 1 && wd <= 5 && (h >= 8 && h <= 9.5 || h >= 14.5 && h <= 16);
  };
  const camTick = (f) => {
    if (!NAV.cfg.cams || !cams.length || !(f.spd > 20)) return;
    const p = [f.lat, f.lon];
    cams.forEach((c) => {
      if (camWarned[c.id]) return;
      const d = dist(p, [c.lat, c.lon]);
      if (c.school) {
        if (d < 180 && schoolTime() && f.spd > 45) {
          camWarned[c.id] = 1;
          say("V\xF9ng tr\u01B0\u1EDDng h\u1ECDc, ch\u1EA1y 40 c\xE2y s\u1ED1 gi\u1EDD");
          toast("\u{1F3EB} V\xF9ng tr\u01B0\u1EDDng h\u1ECDc \xB7 40 km/g");
        }
      } else if (d < 330) {
        camWarned[c.id] = 1;
        say("Ph\xEDa tr\u01B0\u1EDBc " + sayDist(d) + " c\xF3 camera t\u1ED1c \u0111\u1ED9");
        toast("\u{1F4F7} Camera t\u1ED1c \u0111\u1ED9 ph\xEDa tr\u01B0\u1EDBc");
      }
    });
  };
  const H = NAV.hist = LS.get("tc-hist", { places: {}, trips: [], saved: [], park: null });
  if (!H.saved) H.saved = [];
  if (!H.places) H.places = {};
  if (!H.trips) H.trips = [];
  let saveT = 0;
  const saveH = () => {
    clearTimeout(saveT);
    saveT = setTimeout(() => LS.set("tc-hist", H), 500);
  };
  const pkey = (p) => p[0].toFixed(3) + "," + p[1].toFixed(3);
  const simplify = (pts, minM) => {
    const o = [pts[0]];
    for (let i = 1; i < pts.length; i++) if (dist(o[o.length - 1], pts[i]) >= minM || i === pts.length - 1) o.push([+pts[i][0].toFixed(5), +pts[i][1].toFixed(5)]);
    return o;
  };
  let ses = null, slowSince = 0;
  const histTick = (f) => {
    if (NAV.cfg.histOff) return;
    const p = [f.lat, f.lon], moving = (f.spd || 0) > 10;
    if (moving) {
      slowSince = 0;
      if (!ses) {
        const fromPark = H.park && dist([H.park.lat, H.park.lon], p) < 600;
        ses = { t0: Date.now(), from: fromPark ? { name: H.park.name, lat: H.park.lat, lon: H.park.lon } : { name: "", lat: p[0], lon: p[1] }, pts: [p], km: 0 };
        if (!ses.from.name) {
          const s0 = ses;
          NAV.reverse(p).then((n) => {
            s0.from.name = n || "Ch\u1ED7 xu\u1EA5t ph\xE1t";
          });
        }
      } else {
        const l = ses.pts[ses.pts.length - 1], d = dist(l, p);
        if (d > 40) {
          ses.pts.push(p);
          ses.km += d / 1e3;
        }
      }
    } else if (ses) {
      if (!slowSince) slowSince = Date.now();
      if (Date.now() - slowSince > 18e4) endSes(p);
    }
  };
  const nameFromHome = (p) => {
    const h = window.tcHome && window.tcHome();
    return h && dist([h.lat, h.lon], p) < 150 ? "Nh\xE0" : "";
  };
  const endSes = (p) => {
    const s = ses;
    ses = null;
    slowSince = 0;
    if (!s || s.km < 0.4) return;
    const d = NAV.st.dest && dist([NAV.st.dest.lat, NAV.st.dest.lon], p) < 300 ? NAV.st.dest : null;
    const fin = (name) => {
      if (!s.from.name || nameFromHome([s.from.lat, s.from.lon])) s.from.name = nameFromHome([s.from.lat, s.from.lon]) || s.from.name || "Ch\u1ED7 xu\u1EA5t ph\xE1t";
      const to = { name, lat: p[0], lon: p[1] };
      H.trips.unshift({ t0: s.t0, t1: Date.now(), from: s.from, to, km: +s.km.toFixed(1), pts: simplify(s.pts, 35) });
      H.trips = H.trips.slice(0, 300);
      const k = pkey(p), pl = H.places[k] || { name, lat: p[0], lon: p[1], n: 0 };
      pl.n++;
      pl.last = Date.now();
      if (!pl.name || pl.name === "Ch\u1ED7 \u0111\u1EADu xe") pl.name = name;
      H.places[k] = pl;
      H.park = { lat: p[0], lon: p[1], t: Date.now(), name };
      saveH();
      redraw();
    };
    const h = nameFromHome(p);
    if (h) fin(h);
    else if (d) fin(d.name);
    else NAV.reverse(p).then((n) => fin(n || "Ch\u1ED7 \u0111\u1EADu xe"));
  };
  NAV.clearHist = () => {
    H.places = {};
    H.trips = [];
    H.park = null;
    saveH();
    redraw();
  };
  NAV.delTrip = (t0) => {
    H.trips = H.trips.filter((t) => t.t0 !== t0);
    saveH();
    redraw();
  };
  NAV.delPlace = (k) => {
    delete H.places[k];
    saveH();
    redraw();
  };
  NAV.star = (p) => {
    if (!H.saved.some((s) => dist([s.lat, s.lon], [p.lat, p.lon]) < 60)) {
      H.saved.push({ name: p.name, lat: p.lat, lon: p.lon, icon: p.icon || "\u2B50", role: p.role || "" });
      saveH();
      toast("\u0110\xE3 l\u01B0u \u2B50 " + p.name);
    }
    redraw();
  };
  NAV.unstar = (i) => {
    H.saved.splice(i, 1);
    saveH();
    redraw();
  };
  NAV.setWork = (p) => {
    H.saved = H.saved.filter((s) => s.role !== "work");
    H.saved.unshift({ name: p.name, lat: p.lat, lon: p.lon, icon: "\u{1F4BC}", role: "work" });
    saveH();
    toast("\u0110\xE3 l\u01B0u Ch\u1ED7 l\xE0m");
    redraw();
  };
  NAV.frequent = () => Object.keys(H.places).map((k) => Object.assign({ key: k }, H.places[k])).filter((p) => p.n >= 2 && p.name !== "Nh\xE0").sort((a, b) => b.n - a.n || b.last - a.last).slice(0, 12);
  NAV.recent = () => {
    const seen = {};
    return H.trips.filter((t) => Date.now() - t.t0 < 8 * 864e5).map((t) => t.to).filter((p) => {
      const k = pkey([p.lat, p.lon]);
      if (seen[k] || p.name === "Nh\xE0") return false;
      seen[k] = 1;
      return true;
    }).slice(0, 12);
  };
  NAV.knownPlaces = () => H.saved.concat(NAV.frequent()).concat(NAV.recent());
  NAV.habit = (here) => {
    const now = /* @__PURE__ */ new Date(), wd = now.getDay(), hr = now.getHours() + now.getMinutes() / 60, c = {};
    H.trips.forEach((t) => {
      const d = new Date(t.t0);
      if (d.getDay() !== wd || Math.abs(d.getHours() + d.getMinutes() / 60 - hr) > 1 || Date.now() - t.t0 > 60 * 864e5) return;
      const k = pkey([t.to.lat, t.to.lon]);
      (c[k] = c[k] || { n: 0, to: t.to }).n++;
    });
    let best = null;
    Object.keys(c).forEach((k) => {
      if (c[k].n >= 2 && (!best || c[k].n > best.n)) best = c[k];
    });
    if (!best || here && dist(here, [best.to.lat, best.to.lon]) < 500) return null;
    return best.to;
  };
  NAV.showTrail = (t) => {
    NAV.st.preview = t || null;
    fittedSig = "";
    redraw();
  };
  NAV.parkRemind = (min) => {
    if (!H.park) return;
    H.park.limit = min;
    H.park.until = H.park.t + min * 6e4;
    saveH();
    try {
      if (window.TCN) window.TCN.call("park", JSON.stringify({ at: H.park.until - 10 * 6e4, text: "C\xF2n 10 ph\xFAt l\xE0 h\u1EBFt gi\u1EDD \u0111\u1EADu xe " + min / 60 + "P \u1EDF " + (H.park.name || "ch\u1ED7 \u0111\u1EADu") }));
    } catch (e) {
    }
    toast("S\u1EBD nh\u1EAFc tr\u01B0\u1EDBc 10 ph\xFAt khi h\u1EBFt gi\u1EDD " + min / 60 + "P");
    redraw();
  };
  const lon2x = (lon, z) => Math.floor((lon + 180) / 360 * 2 ** z), lat2y = (lat, z) => Math.floor((1 - Math.log(Math.tan(lat * RAD) + 1 / Math.cos(lat * RAD)) / Math.PI) / 2 * 2 ** z);
  NAV.tileList = (pts) => {
    const set = {};
    const smp = [pts[0]];
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      acc += dist(pts[i - 1], pts[i]);
      if (acc > 700) {
        smp.push(pts[i]);
        acc = 0;
      }
    }
    smp.push(pts[pts.length - 1]);
    for (let z = 9; z <= 13; z++) smp.forEach((p) => {
      const x = lon2x(p[1], z), y = lat2y(p[0], z), r = z >= 12 ? 1 : 0;
      for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) set[z + "/" + (x + dx) + "/" + (y + dy)] = 1;
    });
    return Object.keys(set);
  };
  NAV.prefetch = (pts, onProg) => {
    const keys = NAV.tileList(pts), urls = [];
    keys.forEach((k) => {
      const [z, x, y] = k.split("/").map(Number);
      urls.push(tileUrl(TILES.light[0], z, x, y), tileUrl(TILES.dark[0], z, x, y));
    });
    let done = 0, i = 0, bad = 0;
    const total = urls.length;
    return new Promise((res) => {
      const next = () => {
        if (i >= total) {
          if (done >= total) res({ total, bad });
          return;
        }
        const u = urls[i++];
        idbGet(u).then((have) => have || fetch(u).then((r) => r.ok ? r.blob() : null).then((b) => {
          if (b) idbPut(u, b);
          else bad++;
        }).catch(() => {
          bad++;
        })).then(() => {
          done++;
          if (onProg && (done % 25 === 0 || done === total)) onProg(done, total);
          if (done >= total) res({ total, bad });
          else next();
        });
      };
      for (let k = 0; k < 6; k++) next();
    });
  };
  NAV.realRoute = (from, to) => {
    const k = "tc-rtreal-" + from[0].toFixed(3) + "," + from[1].toFixed(3) + "-" + to[0].toFixed(2) + "," + to[1].toFixed(2);
    const c = LS.get(k, null);
    if (c) return Promise.resolve(c);
    return fetch(OSRM + from[1] + "," + from[0] + ";" + to[1] + "," + to[0] + "?overview=full&geometries=geojson").then((r) => r.json()).then((j) => {
      const r0 = j.routes && j.routes[0];
      if (!r0) return null;
      const all = r0.geometry.coordinates.map((c2) => [Math.round(c2[1] * 1e5) / 1e5, Math.round(c2[0] * 1e5) / 1e5]);
      const n = Math.max(1, Math.ceil(all.length / 900));
      const pts = all.filter((_, i) => i % n === 0);
      pts.push(all[all.length - 1]);
      const v = { pts, km: Math.round(r0.distance / 1e3), mins: Math.round(r0.duration / 60) };
      LS.set(k, v);
      return v;
    }).catch(() => null);
  };
})();
