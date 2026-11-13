window.__AppComp = function() {
  const APP = !!(typeof window !== "undefined" && (window.TCNative || window.TCN));
  const tcn = (a, b) => {
    try {
      if (window.TCN) window.TCN.call(a, b == null ? "" : String(b));
    } catch (e) {
    }
  };
  const STORE = APP ? "tomscar-ui" : "tomscar-fix-demo";
  const ADDR = {
    "The Flywheel Bar & Cafe": "27 Neill St, Beaufort VIC 3373",
    "Ampol Foodary Beaufort": "74 Neill St, Beaufort VIC 3373",
    "Pink Lake": "Pink Lake, Western Hwy, Dimboola VIC 3414",
    "Kaniva Windmill": "Commercial St E, Kaniva VIC 3419",
    "Keith (12810 Dukes Hwy)": "12810 Dukes Hwy, Keith SA 5267",
    "Coonalpyn Silo Mural": "23-25 Poyntz Terrace, Coonalpyn SA 5265",
    "Adelaide": "Adelaide SA 5000",
    "Tailem Bend": "Tailem Bend SA 5259",
    "Keith Bakery and Coffee shop": "Makin St, Keith SA 5267",
    "McDonald's Horsham": "32-36 Dimboola Rd, Horsham VIC 3400",
    "Melbourne": "Melbourne VIC 3000"
  };
  function readPhoto(input, done) {
    const f = input && input.files && input.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      const im = new Image();
      im.onload = () => {
        const W = 640, sc = Math.min(1, W / im.width);
        const cv = document.createElement("canvas");
        cv.width = Math.round(im.width * sc);
        cv.height = Math.round(im.height * sc);
        cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
        try {
          done(cv.toDataURL("image/jpeg", 0.72));
        } catch (e) {
        }
      };
      im.src = rd.result;
    };
    rd.readAsDataURL(f);
  }
  function commonsPhoto(q, done) {
    if (!APP) return;
    const u = "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=1&gsrsearch=" + encodeURIComponent(q) + "&prop=imageinfo&iiprop=url&iiurlwidth=640";
    fetch(u).then((r) => r.json()).then((j) => {
      const p = j && j.query && j.query.pages;
      if (!p) return;
      const k = Object.keys(p)[0];
      const ii = p[k].imageinfo && p[k].imageinfo[0];
      if (ii && (ii.thumburl || ii.url)) done(ii.thumburl || ii.url);
    }).catch(() => {
    });
  }
  const INT = Math.floor;
  function jdFromDate(dd, mm, yy) {
    const a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
    let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    return jd;
  }
  function newMoon(k) {
    const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = Math.PI / 180;
    let Jd1 = 241502075933e-5 + 29.53058868 * k + 1178e-7 * T2 - 155e-9 * T3;
    Jd1 += 33e-5 * Math.sin((166.56 + 132.87 * T - 9173e-6 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 333e-7 * T2 - 347e-8 * T3, Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 1236e-8 * T3, F = 21.2964 + 390.67050646 * k - 16528e-7 * T2 - 239e-8 * T3;
    let C1 = (0.1734 - 393e-6 * T) * Math.sin(M * dr) + 21e-4 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 4e-4 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 51e-4 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 74e-4 * Math.sin(dr * (M - Mpr)) + 4e-4 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 4e-4 * Math.sin(dr * (2 * F - M)) - 6e-4 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 1e-3 * Math.sin(dr * (2 * F - Mpr)) + 5e-4 * Math.sin(dr * (2 * Mpr + M));
    const deltat = T < -11 ? 1e-3 + 839e-6 * T + 2261e-7 * T2 - 845e-8 * T3 - 81e-9 * T * T3 : -278e-6 + 265e-6 * T + 262e-6 * T2;
    return Jd1 + C1 - deltat;
  }
  function sunLong(jdn) {
    const T = (jdn - 2451545) / 36525, T2 = T * T, dr = Math.PI / 180, M = 357.5291 + 35999.0503 * T - 1559e-7 * T2 - 48e-8 * T * T2, L0 = 280.46645 + 36000.76983 * T + 3032e-7 * T2;
    let DL = (1.9146 - 4817e-6 * T - 14e-6 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 101e-6 * T) * Math.sin(dr * 2 * M) + 29e-5 * Math.sin(dr * 3 * M);
    let L = (L0 + DL) * dr;
    L = L - Math.PI * 2 * INT(L / (Math.PI * 2));
    return L;
  }
  const TZV = 7;
  const getNewMoonDay = (k) => INT(newMoon(k) + 0.5 + TZV / 24);
  const getSunLong = (d) => INT(sunLong(d - 0.5 - TZV / 24) / Math.PI * 6);
  function lunarMonth11(yy) {
    const off = jdFromDate(31, 12, yy) - 2415021;
    const k = INT(off / 29.530588853);
    let nm = getNewMoonDay(k);
    if (getSunLong(nm) >= 9) nm = getNewMoonDay(k - 1);
    return nm;
  }
  function leapOffset(a11) {
    const k = INT((a11 - 2415021076998695e-9) / 29.530588853 + 0.5);
    let last, i = 1, arc = getSunLong(getNewMoonDay(k + i));
    do {
      last = arc;
      i++;
      arc = getSunLong(getNewMoonDay(k + i));
    } while (arc !== last && i < 14);
    return i - 1;
  }
  function solar2lunar(dd, mm, yy) {
    const dayNumber = jdFromDate(dd, mm, yy), k = INT((dayNumber - 2415021076998695e-9) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1);
    if (monthStart > dayNumber) monthStart = getNewMoonDay(k);
    let a11 = lunarMonth11(yy), b11 = a11, lunarYear;
    if (a11 >= monthStart) {
      lunarYear = yy;
      a11 = lunarMonth11(yy - 1);
    } else {
      lunarYear = yy + 1;
      b11 = lunarMonth11(yy + 1);
    }
    const lunarDay = dayNumber - monthStart + 1, diff = INT((monthStart - a11) / 29);
    let lunarLeap = 0, lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      const ld = leapOffset(a11);
      if (diff >= ld) {
        lunarMonth = diff + 10;
        if (diff === ld) lunarLeap = 1;
      }
    }
    if (lunarMonth > 12) lunarMonth -= 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
    return [lunarDay, lunarMonth, lunarYear, lunarLeap];
  }
  function tzTime(d, zone) {
    try {
      return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: zone }).format(d);
    } catch (e) {
      return "";
    }
  }
  const THU = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const ICO = { cafe: "M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 4h-2M8 3v3M11 3v3", fuel: "M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M4 20h11M7 8h5M14 9h2l2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3", food: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 0-3 3-3 6s1 3 3 3v9", lake: "M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0M12 4l4 7H8z", sight: "M4 8h4l2-3h4l2 3h4v11H4zM12 11a3 3 0 1 0 0 6a3 3 0 1 0 0-6z", end: "M5 21V4M5 4h11l-2 4 2 4H5", wc: "M7 4a2 2 0 1 0 0 .1M17 4a2 2 0 1 0 0 .1M5 21v-7H4l1-6h4l1 6H9v7M15 21V8h4v7h-1v6", rest: "M3 14h18M5 14v6M19 14v6M7 14l2-6h6l2 6M12 3v5", shop: "M4 6h16l-2 9H6zM4 6L3 3M8 20a1.5 1.5 0 1 0 0 .1M17 20a1.5 1.5 0 1 0 0 .1" };
  const SIGN = { cafe: "#1F5FAE", fuel: "#1F5FAE", food: "#1F5FAE", wc: "#1F5FAE", rest: "#1F5FAE", shop: "#1F5FAE", lake: "#6B3E26", sight: "#6B3E26", end: "#00653A" };
  const TOTAL = 727;
  const PLACES = {
    flywheel: { name: "The Flywheel Bar & Cafe", town: "Beaufort VIC", k: "cafe", km: 160, stay: 35 },
    ampolbf: { name: "Ampol Foodary Beaufort", town: "Beaufort VIC", k: "fuel", km: 161, stay: 20 },
    mcd: { name: "McDonald's Horsham", town: "Horsham VIC", k: "food", km: 300, stay: 30 },
    pink: { name: "Pink Lake", town: "Dimboola VIC", k: "lake", km: 336, stay: 15 },
    kaniva: { name: "Kaniva Windmill", town: "Kaniva VIC", k: "sight", km: 405, stay: 20 },
    keith: { name: "Keith (12810 Dukes Hwy)", town: "Keith SA", k: "fuel", km: 490, stay: 15 },
    keithb: { name: "Keith Bakery and Coffee shop", town: "Keith SA", k: "cafe", km: 491, stay: 20 },
    coon: { name: "Coonalpyn Silo Mural", town: "Coonalpyn SA", k: "sight", km: 555, stay: 15 },
    tailem: { name: "Tailem Bend", town: "Tailem Bend SA", k: "cafe", km: 625, stay: 30 }
  };
  const MAPLINE = [[603, 270], [528.5, 249], [497.2, 238.1], [466.8, 225.8], [417.9, 178.7], [406.3, 156.7], [381.2, 146.8], [353.9, 150.5], [322.4, 145], [294.5, 127.2], [261.3, 93.9], [234.2, 57.1], [195.7, 39.2], [177, 30]];
  const BORDER = 425;
  const DEF_GO = ["flywheel", "pink", "kaniva", "keith", "coon"];
  const DEF_BACK = ["tailem", "coon", "keithb", "kaniva", "pink", "mcd", "flywheel"];
  const MINE_BACK = { tailem: 1, keithb: 1, mcd: 1 };
  const MINE_GO = { flywheel: 1, pink: 1, kaniva: 1, keith: 1, coon: 1 };
  const PHOTO_SRC = { pink: "Wikimedia Commons (\u0111i\u1EC3m tham quan) \u2014 ho\u1EB7c h\xECnh b\u1EA1n ch\u1EE5p", kaniva: "Wikimedia Commons (\u0111i\u1EC3m tham quan) \u2014 ho\u1EB7c h\xECnh b\u1EA1n ch\u1EE5p", coon: "Wikimedia Commons (\u0111i\u1EC3m tham quan) \u2014 ho\u1EB7c h\xECnh b\u1EA1n ch\u1EE5p" };
  function rnd(i) {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }
  const DROPS = Array.from({ length: 46 }, (_, i) => ({ x: Math.round(rnd(i + 1) * 1270), dur: (5 + rnd(i + 50) * 4).toFixed(2), del: (-rnd(i + 99) * 9).toFixed(2), op: (0.3 + rnd(i + 7) * 0.5).toFixed(2) }));
  const GLASS = Array.from({ length: 12 }, (_, i) => {
    const s = Math.round(6 + rnd(i + 200) * 9);
    return { x: Math.round(rnd(i + 300) * 1260), y: Math.round(60 + rnd(i + 400) * 420), s, dur: (9 + rnd(i + 500) * 8).toFixed(1), del: (-rnd(i + 600) * 16).toFixed(1) };
  });
  const WAVE = Array.from({ length: 48 }, (_, i) => ({ h: Math.round(5 + rnd(i + 700) * 13), del: (-rnd(i + 800) * 1.1).toFixed(2) }));
  const DEFAULTS = {
    lang: "vi",
    clock: "24",
    unit: "kmg",
    autoBoot: true,
    rainFx: true,
    calm: true,
    dimBottom: 70,
    dimMusic: 85,
    autoDim: true,
    edge: false,
    wave: "tt",
    src: "jukebox",
    shrink: true,
    obd: "veepeak",
    tyre: true,
    oil: true,
    mapApp: "waze",
    mapSide: "left",
    rtView: "road",
    rest: 2,
    offline: false,
    places: "osm",
    dexFull: true,
    strip: "right",
    hideTask: false,
    forceRes: false,
    reopen: true,
    privacy: false,
    autoPrivacy: true,
    autoSms: true,
    msgKeep: 30,
    spStyle: "neon",
    spSize: "M",
    spRing: true,
    spAuto: false,
    spSrc: "gps",
    kmUnder: true,
    kmSeg: true,
    kmPost: true,
    limitEst: true,
    placePhotos: true,
    clkStyle: "neon",
    clkDate: true,
    clkLunar: true,
    clkVN: false,
    clkDual: true,
    clkBlink: true,
    clkAuto: false,
    mapApp2: "waze"
  };
  const APPS = [
    ["waze", "Waze", "map", "#2D8FD6", "W"],
    ["gmaps", "Google Maps", "map", "#3C8F5A", "GM"],
    ["here", "HERE WeGo", "map", "#2A6F8F", "H"],
    ["jukebox", "Tom's Jukebox", "music", "#C77A12", "TJ"],
    ["spotify", "Spotify", "music", "#1E8E4A", "Sp"],
    ["ytm", "YouTube Music", "music", "#B83232", "YM"],
    ["abc", "ABC listen", "music", "#4A4A4A", "A"],
    ["podcast", "Podcast", "music", "#7A4BB5", "P"],
    ["yt", "YouTube", "video", "#C43030", "YT"],
    ["netflix", "Netflix", "video", "#8A1C1C", "N"],
    ["plex", "Plex", "video", "#B8860B", "Px"],
    ["phone", "\u0110i\u1EC7n Tho\u1EA1i", "call", "#2E7D4F", "\u0110T"],
    ["gmsg", "Google Messages", "call", "#2A6FD6", "GM"],
    ["wa", "WhatsApp", "call", "#1E8E5A", "W"],
    ["msgr", "Messenger", "call", "#6B4BD8", "M"],
    ["shield", "Tom's Shield", "tt", "#1F5FAE", "TS"],
    ["mic", "Tom's Mic", "tt", "#8F3FA8", "TM"],
    ["cal", "L\u1ECBch Google", "other", "#2A6FD6", "L"],
    ["chrome", "Chrome", "other", "#3A7F3A", "C"],
    ["gku", "GKU GO (dashcam)", "other", "#5A5A5A", "G"],
    ["cam", "M\xE1y \u1EA2nh", "other", "#555F6B", "MA"],
    ["w-clock", "\u0110\u1ED3ng H\u1ED3 L\u1EADt", "widget", "#0D2C40", "\u231A"],
    ["w-wx", "Th\u1EDDi Ti\u1EBFt", "widget", "#0D2C40", "\u2601"],
    ["w-obd", "Th\xF4ng S\u1ED1 Xe", "widget", "#0D2C40", "OBD"],
    ["w-cal", "L\u1ECBch H\u1EB9n", "widget", "#0D2C40", "\u{1F4C5}"],
    ["w-cam", "Camera Giao Th\xF4ng", "widget", "#0D2C40", "CAM"]
  ];
  const DEF_NOW = { music: ["B\xE0i h\xE1t m\u1EABu 1", "Tom's Jukebox", "Ch\u01B0a ph\xE1t nh\u1EA1c"], radio: ["ABC Melbourne", "Radio \xB7 tr\u1EF1c ti\u1EBFp", "Ch\u01B0a ph\xE1t radio"], podcast: ["Podcast m\u1EABu 1", "Podcast \xB7 t\u1EADp m\u1EDBi", "Ch\u01B0a ph\xE1t podcast"] };
  const RADIO = {
    au: [["abcnews", "ABC News", "Tin t\u1EE9c 24 gi\u1EDD", "A", "#2B2B2B"], ["abcclassic", "ABC Classic", "Nh\u1EA1c c\u1ED5 \u0111i\u1EC3n", "A", "#2B2B2B"], ["triplej", "triple j", "Nh\u1EA1c tr\u1EBB", "J", "#B83232"], ["sbs1", "SBS Radio 1", "\u0110a ng\xF4n ng\u1EEF", "S", "#1F5FAE"]],
    vn: [["sbsvn", "SBS Ti\u1EBFng Vi\u1EC7t", "Ch\u01B0\u01A1ng tr\xECnh ti\u1EBFng Vi\u1EC7t c\u1EE7a SBS", "S", "#1F5FAE"], ["vov", "VOV (Vi\u1EC7t Nam)", "\u0110\xE0i Ti\u1EBFng n\xF3i Vi\u1EC7t Nam", "V", "#C8102E"], ["voh", "VOH (TP.HCM)", "\u0110\xE0i Ph\xE1t thanh TP.HCM", "V", "#C8102E"]]
  };
  const REGION_ABC = [["Melbourne", "ABC Melbourne"], ["Ballarat", "ABC Ballarat"], ["Wimmera", "ABC Wimmera"], ["Keith", "ABC \u0111\u1ECBa ph\u01B0\u01A1ng v\xF9ng Keith"], ["Adelaide", "ABC Adelaide"]];
  const OFTEN = ["waze", "jukebox", "yt", "spotify", "gmaps", "phone"];
  const ZONES = { fw: [110, "Freeway"], town: [80, "Th\u1ECB tr\u1EA5n"], res: [50, "Khu d\xE2n c\u01B0"], school: [40, "School Zone"], none: [100, "Kh\xF4ng d\u1EEF li\u1EC7u"] };
  const STY = {
    neon: { label: "Neon", font: "'Chakra Petch', sans-serif", fw: 700, fst: "normal", base: "#CFF6FF", glow: "0 0 20px rgba(95,212,240,0.6)", ls: "0px" },
    led: { label: "S\u1ED1 LED", font: "'Courier New', monospace", fw: 700, fst: "italic", base: "#7BFF9A", glow: "0 0 12px rgba(123,255,154,0.45)", ls: "4px" },
    analog: { label: "Kim \u0110\u1ED3ng H\u1ED3", font: "'Chakra Petch', sans-serif", fw: 600, fst: "normal", base: "#E8F1F5", glow: "none", ls: "0px" },
    minimal: { label: "T\u1ED1i Gi\u1EA3n", font: "'Segoe UI', system-ui, sans-serif", fw: 300, fst: "normal", base: "#E8F1F5", glow: "none", ls: "0px" },
    au: { label: "Bi\u1EC3n B\xE1o \xDAc", font: "Overpass, sans-serif", fw: 800, fst: "normal", base: "#FFFFFF", glow: "none", ls: "0px" },
    rally: { label: "Rally", font: "'Chakra Petch', sans-serif", fw: 700, fst: "italic", base: "#FFD08A", glow: "none", ls: "-2px" },
    retro: { label: "Retro X\u01B0a", font: "Georgia, 'Times New Roman', serif", fw: 700, fst: "normal", base: "#F3E2B8", glow: "0 0 8px rgba(243,226,184,0.3)", ls: "0px" }
  };
  const CLK = {
    neon: { label: "Neon", font: "'Chakra Petch', sans-serif", fw: 700, fst: "normal", c: "#CFF6FF", glow: "0 0 12px rgba(95,212,240,0.6)", ls: "0px" },
    flip: { label: "L\u1EADt HTC" },
    led: { label: "S\u1ED1 LED", font: "'Courier New', monospace", fw: 700, fst: "italic", c: "#7BFF9A", glow: "0 0 8px rgba(123,255,154,0.45)", ls: "2px" },
    analog: { label: "Kim Nh\u1ECF", font: "'Chakra Petch', sans-serif", fw: 600, fst: "normal", c: "#E8F1F5", glow: "none", ls: "0px" },
    minimal: { label: "T\u1ED1i Gi\u1EA3n", font: "'Segoe UI', system-ui, sans-serif", fw: 300, fst: "normal", c: "#E8F1F5", glow: "none", ls: "0px" },
    au: { label: "Bi\u1EC3n B\xE1o \xDAc", font: "Overpass, sans-serif", fw: 800, fst: "normal", c: "#FFFFFF", glow: "none", ls: "0px" },
    retro: { label: "Retro X\u01B0a", font: "Georgia, 'Times New Roman', serif", fw: 700, fst: "normal", c: "#F3E2B8", glow: "none", ls: "0px" }
  };
  const WXI = {
    clear: ["M24 14a10 10 0 1 0 0 20a10 10 0 1 0 0-20z", "#FBB040", "M24 4v5M24 39v5M4 24h5M39 24h5M9.9 9.9l3.5 3.5M34.6 34.6l3.5 3.5M9.9 38.1l3.5-3.5M34.6 13.4l3.5-3.5", "none", "#FBB040"],
    night: ["M34 29A12 12 0 1 1 19 12a9.5 9.5 0 0 0 15 17z", "#F3EBD2", "M0 0", "none", "none"],
    cloudy: ["M14 34h20a7 7 0 0 0 0-14 9 9 0 0 0-17.3-2.4A6.5 6.5 0 0 0 14 34z", "#CFE6EE", "M0 0", "none", "none"],
    rain: ["M14 28h20a7 7 0 0 0 0-14 9 9 0 0 0-17.3-2.4A6.5 6.5 0 0 0 14 28z", "#B7CAD4", "M17 33l-1.5 4M25 33l-1.5 4M33 33l-1.5 4", "none", "#5FD4F0"],
    storm: ["M14 28h20a7 7 0 0 0 0-14 9 9 0 0 0-17.3-2.4A6.5 6.5 0 0 0 14 28z", "#8FA2AD", "M26 27l-6 9h6l-4 9 10-12h-6l4-6z", "#FBB040", "none"],
    fog: ["M0 0", "none", "M8 16h32M5 24h38M9 32h30M13 40h22", "none", "#CFE6EE"]
  };
  const WXVI = { clear: "N\u1EAFng", night: "Tr\u1EDDi quang", cloudy: "Nhi\u1EC1u m\xE2y", rain: "M\u01B0a", storm: "Gi\xF4ng", fog: "S\u01B0\u01A1ng m\xF9" };
  const SIZES = { S: [70, 190], M: [94, 230], L: [118, 270] };
  const polar = (deg, r) => [100 + r * Math.cos(deg * Math.PI / 180), 100 + r * Math.sin(deg * Math.PI / 180)];
  const arcPath = (f, r) => {
    if (f <= 1e-3) return "M0 0";
    f = Math.min(1, f);
    const a = polar(135, r), b = polar(135 + 270 * f, r);
    return "M" + a[0].toFixed(1) + " " + a[1].toFixed(1) + " A" + r + " " + r + " 0 " + (270 * f > 180 ? 1 : 0) + " 1 " + b[0].toFixed(1) + " " + b[1].toFixed(1);
  };
  let DIALT = "";
  for (let v = 0; v <= 160; v += 20) {
    const a = 135 + 270 * v / 160, p = polar(a, 92), q = polar(a, 80);
    DIALT += "M" + p[0].toFixed(1) + " " + p[1].toFixed(1) + " L" + q[0].toFixed(1) + " " + q[1].toFixed(1) + " ";
  }
  class Component extends DCLogic {
    constructor(props) {
      super(props);
      let sv = {};
      try {
        sv = JSON.parse(window.localStorage.getItem(STORE) || "{}") || {};
      } catch (e) {
        sv = {};
      }
      this.state = {
        scr: "home",
        boot: "splash",
        drive: false,
        playing: false,
        perm: false,
        now: Date.now(),
        last: Date.now(),
        grp: "chung",
        exitOpen: false,
        createOpen: false,
        rtCheck: true,
        listOpen: false,
        leg: "go",
        pos: 167,
        goList: sv.goList || DEF_GO.slice(),
        backList: sv.backList || DEF_BACK.slice(),
        skip: sv.skip || {},
        dlg: null,
        delId: null,
        stopId: null,
        split: 0.36,
        lastSplit: 0.5,
        dragging: false,
        cat: "fuel",
        dexMode: "after",
        dexTwo: true,
        dexTask: true,
        z: 1,
        zMode: "all",
        fx: 400,
        panning: false,
        panX0: 0,
        fx0: 400,
        panAt: 0,
        speed: 92,
        noGps: false,
        zone: "fw",
        pendZone: null,
        pendAt: 0,
        popAt: 0,
        statsOpen: false,
        call: null,
        callAt: 0,
        mute: false,
        spkCar: true,
        toast: "",
        toastAt: 0,
        ctTab: "calls",
        ctApp: "all",
        rpName: "",
        rpApp: "",
        wsSel: ["waze", "jukebox"],
        wsGrp: "often",
        wsQ: "",
        src: "music",
        mpOpen: false,
        mpTab: "queue",
        panelAt: 0,
        nowT: "",
        nowS: "",
        favs: { abcm: 1, sbsvn: 1 },
        va: false,
        set: Object.assign({}, DEFAULTS, sv.set || {}),
        live: {},
        narrow: false,
        wsList: sv.wsList || [],
        wsName: "",
        apps: null,
        places: {},
        placesBusy: false,
        calls: null,
        msgs: null,
        radioLists: null,
        addQ: "",
        addLink: "",
        addMsg: "",
        custom: sv.custom || {},
        photos: sv.photos || {},
        commons: {},
        vaHeard: "",
        vaHint: "",
        clkBig: false,
        legManual: false,
        savedPl: sv.savedPl || []
      };
      if (APP) this.state.boot = "splash";
    }
    componentDidMount() {
      if (APP) window.__uiComp = this;
      this.tick = setInterval(() => {
        const S = this.state, now = Date.now();
        if (S.pendZone && now - S.pendAt >= 2e3) this.setState({ now, zone: S.pendZone, pendZone: null, popAt: now });
        else this.setState({ now });
      }, 1e3);
      this.startBoot();
    }
    componentWillUnmount() {
      clearInterval(this.tick);
      clearTimeout(this.b1);
      clearTimeout(this.b2);
    }
    startBoot() {
      clearTimeout(this.b1);
      clearTimeout(this.b2);
      this.setState({ boot: "splash", scr: "home", last: Date.now() });
      this.b1 = setTimeout(() => this.setState({ boot: "about" }), 2700);
      if (this.state.set.autoBoot) this.b2 = setTimeout(() => this.setState({ boot: null, scr: "home", last: Date.now() }), 6800);
    }
    save(patch) {
      const st = Object.assign({}, this.state, patch);
      try {
        window.localStorage.setItem(STORE, JSON.stringify({ set: st.set, goList: st.goList, backList: st.backList, skip: st.skip, wsList: st.wsList, custom: st.custom, photos: st.photos, savedPl: st.savedPl }));
      } catch (e) {
      }
      this.setState(patch);
    }
    setS(k, v) {
      this.save({ set: Object.assign({}, this.state.set, { [k]: v }) });
    }
    toast(t) {
      this.setState({ toast: t, toastAt: Date.now() });
    }
    say(t, sensitive) {
      this.toast(t);
      if (APP && !(sensitive && this.state.set.privacy)) tcn("say", t);
    }
    runVoice(text) {
      const t = (text || "").toLowerCase();
      this.setState({ vaHeard: text });
      const cmds = this._cmds || [];
      for (const c of cmds) {
        const m = c.re && t.match(c.re);
        if (m) {
          setTimeout(() => c.run(m, text), 350);
          return;
        }
      }
      setTimeout(() => {
        this.setState({ va: false });
        this.say("D\u1EA1, m\xECnh ch\u01B0a hi\u1EC3u. B\u1EA1n n\xF3i l\u1EA1i gi\xFAp m\xECnh nha");
      }, 350);
    }
    renderVals() {
      const self = this, S = this.state, C = S.set;
      const LV = S.live || {};
      const drive = APP ? (LV.speed || 0) >= 8 : S.drive;
      const p2 = (n) => String(n).padStart(2, "0");
      const d = new Date(S.now);
      const clock = C.clock === "24" ? p2(d.getHours()) + ":" + p2(d.getMinutes()) : (d.getHours() % 12 || 12) + ":" + p2(d.getMinutes()) + (d.getHours() < 12 ? " SA" : " CH");
      const ON = { bg: "#FBB040", fg: "#2A1A00" }, OFF = { bg: "#0D2C40", fg: "#CFE6EE" };
      const go = (scr) => () => self.setState({ scr, dlg: null, listOpen: false, exitOpen: false, createOpen: false });
      const priv = C.privacy;
      const nar = APP && !!S.narrow;
      const SCR = [["home", "M\xE0n H\xECnh Ch\xEDnh"], ["settings", "C\xE0i \u0110\u1EB7t"], ["rt", "Road Trip"], ["split", "Road Trip + B\u1EA3n \u0110\u1ED3"], ["dex", "Workspace DeX"], ["search", "T\xECm Ch\u1ED7"], ["contacts", "Li\xEAn L\u1EA1c"]];
      const scrBtns = SCR.map(([k, label]) => {
        const on = S.scr === k;
        return { label, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: go(k) };
      });
      const idle = S.now - S.last > 5e3 && C.autoDim && !S.boot;
      const opBottom = idle ? C.dimBottom / 100 : 1;
      const opMusic = idle ? C.dimMusic / 100 : 1;
      const CALL = APP ? LV.call && LV.call.state ? LV.call : null : S.call ? { state: S.call, since: S.callAt } : null;
      const inCall = !!CALL;
      const MD = LV.media || null;
      const playing = APP ? S.src === "radio" ? !!(LV.radio && LV.radio.playing) : !!(MD && MD.playing) : S.playing;
      const showWave = playing && C.wave !== "off" && !drive && !inCall && S.src === "music";
      const waveBars = WAVE.map((w, i) => ({ h: C.wave === "tt" ? w.h : 6 + i % 4 * 3, del: w.del, cls: "wv", c: i < 20 ? "#FBB040" : "rgba(95,212,240,0.75)" }));
      const wxc = APP ? LV.wx && LV.wx.code : "rain";
      const rainy = wxc === "rain" || wxc === "storm";
      const rainOn = C.rainFx && !drive && rainy;
      const LM = APP ? LV.limit : { v: ZONES[S.zone][0], est: S.zone === "none", school: S.zone === "school", label: ZONES[S.zone][1], at: S.popAt, ahead: S.pendZone ? ZONES[S.pendZone][0] : null };
      const zinfo = [LM ? LM.v : 0, LM ? LM.label || "" : ""], lim = LM ? LM.v : 999, est = !!(LM && LM.est);
      const lost = APP ? LV.gps === false : drive && S.noGps;
      const spd = APP ? Math.round(C.spSrc === "obd" && LV.obd && LV.obd.speed != null ? LV.obd.speed : LV.speed || 0) : drive ? S.speed : 0;
      const styKey = C.spAuto ? "neon" : C.spStyle;
      const st = STY[styKey] || STY.neon;
      const over = LM ? spd - lim : 0;
      const col = lost ? "#5E8496" : over > 3 ? "#FF7A7A" : over >= 1 ? "#FFC46B" : st.base;
      const sz = SIZES[C.spSize] || SIZES.M;
      const parked = !drive;
      const fs0 = styKey === "analog" ? Math.round(sz[0] * 0.5) : sz[0];
      const needle = polar(135 + 270 * Math.min(spd, 160) / 160, 70);
      const sb = {
        num: lost ? "\u2013 \u2013" : String(spd),
        unit: C.unit === "mph" ? "mph" : "km/g",
        fs: parked ? Math.round(fs0 * 0.62) : fs0,
        ring: parked ? Math.round(sz[1] * 0.7) : sz[1],
        mt: styKey === "analog" ? 60 : 0,
        font: st.font,
        fw: st.fw,
        fst: st.fst,
        ls: st.ls,
        c: col,
        glow: lost ? "none" : st.glow,
        showRing: C.spRing && styKey !== "analog" && !parked,
        analog: styKey === "analog",
        rally: styKey === "rally" && !parked,
        arcBg: arcPath(1, 90),
        arc: arcPath(lost ? 0 : spd / lim, 90),
        ticks: DIALT,
        nx: needle[0].toFixed(1),
        ny: needle[1].toFixed(1),
        barW: Math.min(100, Math.round(spd / 160 * 100)),
        parked,
        tap: () => {
          if (!drive) self.setState({ statsOpen: !S.statsOpen });
        },
        statsOpen: S.statsOpen && parked,
        aria: "T\u1ED1c \u0111\u1ED9 " + (lost ? "m\u1EA5t GPS" : spd + " km/g"),
        limShow: !!LM && !(est && !C.limitEst),
        lim: LM ? LM.v : "",
        limAria: "Gi\u1EDBi h\u1EA1n " + lim + (est ? " (\u01B0\u1EDBc t\xEDnh)" : ""),
        limBorder: est ? "3px dashed #D0202E" : "0",
        limNote: est ? "\u01B0\u1EDBc t\xEDnh" : LM && LM.school ? "School Zone \xB7 gi\u1EDD h\u1ECDc" : zinfo[1],
        limNoteC: est ? "#FFD08A" : "#CFE6EE",
        pop: !!(LM && LM.at && S.now - LM.at < 3200),
        zoneL: (est ? "\u01AF\u1EDBc t\xEDnh \xB7 " : "V\xE0o v\xF9ng m\u1EDBi \xB7 ") + zinfo[1],
        ahead: !!(LM && LM.ahead),
        aheadL: LM && LM.ahead ? LM.ahead + "" : "",
        stats: APP ? LV.today ? "H\xF4m nay: " + LV.today.km + " km \xB7 TB " + LV.today.avg + " km/g \xB7 cao nh\u1EA5t " + LV.today.max + " km/g" : "Ch\u01B0a c\xF3 chuy\u1EBFn n\xE0o h\xF4m nay" : "H\xF4m nay: 167 km \xB7 TB 78 km/g \xB7 cao nh\u1EA5t 104 km/g (m\u1EABu)"
      };
      const zones = Object.keys(ZONES).map((k) => {
        const on = (S.pendZone || S.zone) === k;
        return { label: ZONES[k][1] + " " + ZONES[k][0], on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => {
          if (k !== S.zone) self.setState({ pendZone: k, pendAt: Date.now() });
        } };
      });
      const tg = (k, label, hint) => ({ isToggle: true, label, hint, on: C[k] ? "true" : "false", trackBg: C[k] ? "#FBB040" : "#2A3C48", knobX: C[k] ? 34 : 4, stateL: C[k] ? "M\u1EDF" : "T\u1EAFt", stateC: C[k] ? "#FFD08A" : "#8FC3D3", toggle: () => self.setS(k, !C[k]) });
      const ch = (k, label, hint, opts) => ({ isChoice: true, label, hint, opts: opts.map(([v, l]) => {
        const on = C[k] === v;
        return { label: l, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => self.setS(k, v) };
      }) });
      const stt = (label, hint, ok, okL, badL, actL, act) => ({ isStatus: true, label, hint, stL: ok ? "\u2713 " + okL : "\u26A0 " + badL, stC: ok ? "#7BD88F" : "#FFD08A", hasAct: !ok && !!actL, actL, act });
      const info = (label, hint, val) => ({ isInfo: true, label, hint, val });
      const dimOpts = [[100, "100%"], [85, "85%"], [70, "70%"], [55, "55%"]];
      const PM = LV.perms || {};
      const GRP = {
        chung: { label: "Chung", icon: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM4 12h2M18 12h2M12 4v2M12 18v2", desc: "Ng\xF4n ng\u1EEF, gi\u1EDD, c\xE1ch m\u1EDF app, ri\xEAng t\u01B0, cu\u1ED9c g\u1ECDi", rows: [
          ch("lang", "Ng\xF4n ng\u1EEF", "Ch\u1EEF tr\xEAn m\u1ECDi m\xE0n h\xECnh", [["vi", "Ti\u1EBFng Vi\u1EC7t"], ["en", "English"]]),
          ch("clock", "Ki\u1EC3u gi\u1EDD", "M\u1EB7c \u0111\u1ECBnh 24h", [["24", "24h"], ["12", "12h"]]),
          ch("unit", "\u0110\u01A1n v\u1ECB t\u1ED1c \u0111\u1ED9", "M\u1EB7c \u0111\u1ECBnh km/g", [["kmg", "km/g"], ["mph", "mph"]]),
          tg("autoBoot", "M\xE0n h\xECnh ch\xE0o + Gi\u1EDBi Thi\u1EC7u t\u1EF1 chuy\u1EC3n", "M\u1EDF app t\u1EF1 v\xE0o M\xE0n H\xECnh Ch\xEDnh, kh\xF4ng \u0111\u1EE9ng ch\u1EDD b\u1EA5m"),
          info("M\u1EDF app v\xE0o th\u1EB3ng", "Lu\xF4n v\xE0o tab n\xE0y sau m\xE0n h\xECnh ch\xE0o", "M\xE0n H\xECnh Ch\xEDnh"),
          stt("Nh\u1EDB m\u1ECDi l\u1EF1a ch\u1ECDn khi tho\xE1t", "Giao di\u1EC7n, t\xEDnh n\u0103ng, Workspace, ch\u1EB7ng Road Trip\u2026", true, "Lu\xF4n nh\u1EDB", "", "", null),
          tg("privacy", "Ch\u1EBF \u0110\u1ED9 Ri\xEAng T\u01B0", "Gi\u1EA5u t\xEAn ng\u01B0\u1EDDi g\u1ECDi, n\u1ED9i dung tin nh\u1EAFn, th\xF4ng tin kh\xE1ch"),
          info("Cu\u1ED9c g\u1ECDi \u0111\u1EBFn", 'Kh\xF4ng \u0111\u1ECDc t\xEAn ra loa \u2014 ch\u1EC9 b\xE1o "C\xF3 cu\u1ED9c g\u1ECDi"', "Chu\xF4ng theo nh\xF3m \u25B8"),
          tg("autoSms", "T\u1EEB ch\u1ED1i th\xEC t\u1EF1 nh\u1EAFn l\u1EA1i", '"M\xECnh \u0111ang l\xE1i xe, l\xE1t g\u1ECDi l\u1EA1i nha"'),
          ch("msgKeep", "T\u1EF1 xo\xE1 tin nh\u1EAFn \u0111\xE3 l\u01B0u (WhatsApp, Messenger\u2026)", "Tin b\u1EAFt t\u1EEB th\xF4ng b\xE1o", [[7, "7 ng\xE0y"], [30, "30 ng\xE0y"], [0, "Kh\xF4ng xo\xE1"]])
        ] },
        gd: { label: "Giao Di\u1EC7n", icon: "M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-7.9-9-7.9zM7.5 11.5h.01M10.5 7.5h.01M15.5 7.5h.01", desc: "Ki\u1EC3u m\xE0n h\xECnh, s\u1ED1 t\u1ED1c \u0111\u1ED9, m\u01B0a, l\xE0m m\u1EDD, d\u1ECBu m\u1EAFt", rows: [
          stt("Ki\u1EC3u giao di\u1EC7n", "23 ki\u1EC3u + ki\u1EC3u \u0111\u1ED3ng h\u1ED3 bu\u1ED3ng l\xE1i", false, "", "B\u1EA5m \u0111\u1EC3 ch\u1ECDn", "M\u1EDF Giao Di\u1EC7n", () => openTheme()),
          ch("spStyle", "Ki\u1EC3u s\u1ED1 t\u1ED1c \u0111\u1ED9", "Ch\u1ECDn l\xE0 \u0111\u1ED5i ngay tr\xEAn M\xE0n H\xECnh Ch\xEDnh", Object.keys(STY).map((k) => [k, STY[k].label])),
          ch("spSize", "C\u1EE1 s\u1ED1 t\u1ED1c \u0111\u1ED9", "", [["S", "Nh\u1ECF"], ["M", "V\u1EEBa"], ["L", "To"]]),
          tg("spRing", "V\xF2ng cung gi\u1EDBi h\u1EA1n quanh s\u1ED1", "G\u1EA7n ch\u1EA1m gi\u1EDBi h\u1EA1n th\xEC v\xF2ng g\u1EA7n k\xEDn"),
          tg("spAuto", "Ki\u1EC3u s\u1ED1 t\u1EF1 \u0111\u1ED5i theo giao di\u1EC7n", "Giao di\u1EC7n \xDAc \u2192 Bi\u1EC3n B\xE1o \xDAc, Synthwave \u2192 Neon\u2026"),
          tg("calm", "D\u1ECBu M\u1EAFt", "Xe ch\u1EA1y th\xEC n\u1EC1n \u0111\u1EE9ng y\xEAn, m\u1EDD v\xE0 t\u1ED1i h\u01A1n"),
          tg("rainFx", "Hi\u1EC7u \u1EE9ng m\u01B0a", "H\u1EA1t m\u01B0a li ti + gi\u1ECDt \u0111\u1ECDng tr\xEAn k\xEDnh; xe ch\u1EA1y t\u1EF1 t\u1EAFt"),
          ch("dimBottom", "\u0110\u1ED9 r\xF5 thanh d\u01B0\u1EDBi c\xF9ng", "Tr\u1EE3 l\xFD, nhi\u1EC7t m\xE1y, b\xECnh \u0111i\u1EC7n, \xF4 S\u1EAFp T\u1EDBi", dimOpts),
          ch("dimMusic", "\u0110\u1ED9 r\xF5 thanh nh\u1EA1c", "Ch\u1EC9nh ri\xEAng v\u1EDBi thanh d\u01B0\u1EDBi", dimOpts),
          tg("autoDim", "T\u1EF1 m\u1EDD sau 5 gi\xE2y", "Ch\u1EA1m l\xE0 s\xE1ng l\u1EA1i; c\u1EA3nh b\xE1o quan tr\u1ECDng t\u1EF1 s\xE1ng"),
          tg("edge", "\xC1nh s\xE1ng ch\u1EA1y vi\u1EC1n", "T\u1EAFt cho \u0111\u1EE1 nh\u1EE9c m\u1EAFt khi l\xE1i"),
          ch("clkStyle", "Ki\u1EC3u \u0111\u1ED3ng h\u1ED3 (thanh tr\xEAn c\xF9ng)", "Ch\u1EA1m \u0111\u1ED3ng h\u1ED3 \u0111\u1EC3 ph\xF3ng to ki\u1EC3u L\u1EADt", Object.keys(CLK).map((k) => [k, CLK[k].label])),
          tg("clkAuto", "\u0110\u1ED3ng h\u1ED3 t\u1EF1 \u0111\u1ED5i theo giao di\u1EC7n", ""),
          tg("clkDate", "Hi\u1EC7n th\u1EE9, ng\xE0y", "vd T7 14/11"),
          tg("clkLunar", "Ng\xE0y \xE2m l\u1ECBch", "Nh\u1EAFc R\u1EB1m, m\xF9ng 1, T\u1EBFt"),
          tg("clkDual", "Hai m\xFAi gi\u1EDD SA / VIC", "Khi g\u1EA7n ho\u1EB7c qua bi\xEAn gi\u1EDBi SA"),
          tg("clkVN", "Th\xEAm gi\u1EDD Vi\u1EC7t Nam", ""),
          tg("clkBlink", 'D\u1EA5u ":" nh\u1EA5p nh\xE1y', "Xe ch\u1EA1y th\xEC t\u1EF1 \u0111\u1EE9ng y\xEAn")
        ] },
        nhac: { label: "Nh\u1EA1c", icon: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", desc: "Thanh nh\u1EA1c, s\xF3ng nh\u1EA1c, ngu\u1ED3n nh\u1EA1c", rows: [
          ch("wave", "Ki\u1EC3u s\xF3ng nh\u1EA1c", "M\u1EB7c \u0111\u1ECBnh gi\u1ED1ng Tom\u2019s Jukebox", [["tt", "M\u1EB7c \u0110\u1ECBnh (Tom's Tech)"], ["bars", "Thanh \u0110\u1EC1u"], ["off", "T\u1EAFt"]]),
          ch("src", "Ngu\u1ED3n nh\u1EA1c \u01B0u ti\xEAn", "N\xFAt tr\xEAn thanh nh\u1EA1c \u0111i\u1EC1u khi\u1EC3n app n\xE0y", [["jukebox", "Tom's Jukebox"], ["spotify", "Spotify"], ["ytm", "YouTube Music"]]),
          stt("Quy\u1EC1n \u0111\u1ECDc b\xE0i \u0111ang ph\xE1t", "\u0110\u1EC3 hi\u1EC7n t\xEAn b\xE0i, \u1EA3nh b\xECa", S.perm, "\u0110\xE3 c\u1EA5p", "Ch\u01B0a c\u1EA5p", "C\u1EA5p Quy\u1EC1n", () => self.setState({ perm: true })),
          tg("shrink", "Thu nh\u1ECF thanh nh\u1EA1c khi xe ch\u1EA1y", "Gi\u1EEF \u23EE \u23F8 \u23ED, t\u1EAFt s\xF3ng nh\u1EA1c")
        ] },
        xe: { label: "Xe & OBD-II", icon: "M5 17h14M6 17V9l2-4h8l2 4v8M7 17v2M17 17v2M8 12h.01M16 12h.01", desc: "C\u1EE5c OBD-II, h\u1ED3 s\u01A1 xe, ngu\u1ED3n t\u1ED1c \u0111\u1ED9, nh\u1EAFc b\u1EA3o d\u01B0\u1EE1ng", rows: [
          stt("C\u1EE5c OBD-II", LV.obd ? "\u0110\xE3 n\u1ED1i \xB7 " + (LV.obd.protocol || "") : "Veepeak OBDCheck BLE (Bluetooth)", !!LV.obd, "\u0110\xE3 n\u1ED1i", "Ch\u01B0a n\u1ED1i", "Ch\u1ECDn C\u1EE5c OBD", () => tcn("settings")),
          ch("spSrc", "Ngu\u1ED3n t\u1ED1c \u0111\u1ED9", "\u0110\u1ED3ng h\u1ED3 tapl\xF4 th\u01B0\u1EDDng ch\u1EC9 cao h\u01A1n th\u1EF1c t\u1EBF v\xE0i km/g", [["gps", "GPS (m\u1EB7c \u0111\u1ECBnh)"], ["obd", "OBD-II"]]),
          info("H\u1ED3 s\u01A1 xe", "M\xE1y d\u1EA7u \xB7 c\u1ED5ng OBD 16 ch\xE2n", "Toyota HiAce 200 \xB7 04/2006"),
          info("\xC1p su\u1EA5t v\u1ECF (b\u01A1m ngu\u1ED9i)", "195R15C", "350 kPa tr\u01B0\u1EDBc / sau"),
          tg("tyre", "Nh\u1EAFc b\u01A1m v\u1ECF", "M\u1ED7i 2 tu\u1EA7n"),
          tg("oil", "Nh\u1EAFc thay nh\u1EDBt", "Theo km \u0111\xE3 ch\u1EA1y")
        ] },
        map: { label: "B\u1EA3n \u0110\u1ED3 & Road Trip", icon: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14", desc: "App b\u1EA3n \u0111\u1ED3, chia m\xE0n h\xECnh, qu\xE3ng \u0111\u01B0\u1EDDng, km, h\xECnh, gi\u1EDBi h\u1EA1n", rows: [
          ch("mapApp", "B\u1EA3n \u0111\u1ED3 ch\xEDnh", "D\xF9ng khi ch\u1EC9 \u0111\u01B0\u1EDDng v\xE0 chia m\xE0n h\xECnh", [["waze", "Waze"], ["gmaps", "Google Maps"], ["here", "HERE"]]),
          ch("mapSide", "B\u1EA3n \u0111\u1ED3 n\u1EB1m b\xEAn", "Road Trip + B\u1EA3n \u0110\u1ED3", [["left", "Tr\xE1i"], ["right", "Ph\u1EA3i"]]),
          ch("rtView", "Ki\u1EC3u hi\u1EC3n th\u1ECB qu\xE3ng \u0111\u01B0\u1EDDng", "\u0110\u1ED5i nhanh ngay tr\xEAn khung", [["road", "Con \u0110\u01B0\u1EDDng"], ["map", "B\u1EA3n \u0110\u1ED3"]]),
          tg("kmUnder", "Km c\xF2n l\u1EA1i d\u01B0\u1EDBi m\u1ED7i ch\u1EB7ng", ""),
          tg("kmSeg", "Km gi\u1EEFa hai ch\u1EB7ng", "Tr\xEAn m\u1EB7t \u0111\u01B0\u1EDDng"),
          tg("kmPost", "C\u1ECDc km d\u1ECDc \u0111\u01B0\u1EDDng", "M\u1ED7i 100 km \u2014 ph\xF3ng to th\xEC m\u1ED7i 10 km"),
          tg("placePhotos", "H\xECnh \u0111\u1EA1i di\u1EC7n \u0111\u1ECBa \u0111i\u1EC3m", "H\xECnh b\u1EA1n ch\u1EE5p \u2192 Wikimedia Commons \u2192 bi\u1EC3n b\xE1o"),
          tg("limitEst", "Gi\u1EDBi h\u1EA1n \u01B0\u1EDBc t\xEDnh khi thi\u1EBFu d\u1EEF li\u1EC7u", "50 khu d\xE2n c\u01B0 / 100 ngo\xE0i th\u1ECB tr\u1EA5n \u2014 vi\u1EC1n \u0111\u1EE9t"),
          ch("rest", "Nh\u1EAFc ngh\u1EC9 ch\xE2n m\u1ED7i", "Theo gi\u1EDD l\xE1i li\xEAn t\u1EE5c", [[1.5, "1,5 gi\u1EDD"], [2, "2 gi\u1EDD"], [3, "3 gi\u1EDD"]]),
          tg("offline", "T\u1EA3i s\u1EB5n b\u1EA3n \u0111\u1ED3 offline", "\u0110o\u1EA1n Melbourne \u21C4 Adelaide"),
          ch("places", "Ngu\u1ED3n t\xECm ch\u1ED7", "Google Places c\u1EA7n kho\xE1 Google Cloud", [["osm", "OpenStreetMap"], ["gp", "Google Places"]])
        ] },
        ws: { label: "Workspace", icon: "M3 4h8v7H3zM13 4h8v4h-8zM13 10h8v10h-8zM3 13h8v7H3z", desc: "C\xE1ch m\u1EDF app tr\xEAn DeX v\xE0 \u0111i\u1EC7n tho\u1EA1i", rows: [
          tg("dexFull", "Ph\xF3ng to theo m\xE0n h\xECnh DeX", "Tr\u1EEB thanh t\xE1c v\u1EE5; 1 app th\xEC ph\xF3ng to h\u1EBFt"),
          ch("strip", "D\u1EA3i Tom\u2019s Car \u1EDF m\xE9p", "N\xFAt v\u1EC1 Tom\u2019s Car, tr\u1EE3 l\xFD, \u0111\u1ED5i Workspace", [["left", "Tr\xE1i"], ["right", "Ph\u1EA3i"], ["off", "T\u1EAFt"]]),
          tg("hideTask", "\u1EA8n thanh t\xE1c v\u1EE5 DeX", "Khi d\xF9ng Workspace (n\u1EBFu m\xE1y cho ph\xE9p)"),
          stt("DeX Labs: Bu\u1ED9c app thay \u0111\u1ED5i k\xEDch th\u01B0\u1EDBc", "C\u1EA7n cho app kh\xF4ng ch\u1ECBu ph\xF3ng to", C.forceRes, "\u0110\xE3 b\u1EADt", "Ch\u01B0a b\u1EADt", "H\u01B0\u1EDBng D\u1EABn", () => {
            self.setS("forceRes", true);
            self.toast('Tr\xEAn DeX: m\u1EDF C\xE0i \u0111\u1EB7t \u2192 Samsung DeX \u2192 DeX Labs \u2192 b\u1EADt "Bu\u1ED9c app thay \u0111\u1ED5i k\xEDch th\u01B0\u1EDBc"');
          }),
          tg("reopen", "T\u1EF1 m\u1EDF l\u1EA1i app b\u1ECB t\u1EAFt/v\u0103ng", "")
        ] },
        quyen: { label: "Quy\u1EC1n & K\u1EBFt N\u1ED1i", icon: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z", desc: "\u2713 l\xE0 \u0111\xE3 c\u1EA5p, \u26A0 l\xE0 c\xF2n thi\u1EBFu \u2014 b\u1EA5m C\u1EA5p Quy\u1EC1n \u0111\u1EC3 m\u1EDF ch\u1ED7 c\u1EA5p", rows: [
          stt("V\u1ECB tr\xED (GPS)", "T\u1ED1c \u0111\u1ED9, t\xEAn \u0111\u01B0\u1EDDng, Road Trip", PM.loc !== false, "\u0110\xE3 c\u1EA5p", "Ch\u01B0a c\u1EA5p", "C\u1EA5p Quy\u1EC1n", () => tcn("perm", "loc")),
          stt("Bluetooth", "Pin tai nghe, OBD-II", PM.bt !== false, "\u0110\xE3 c\u1EA5p", "Ch\u01B0a c\u1EA5p", "C\u1EA5p Quy\u1EC1n", () => tcn("perm", "bt")),
          stt("\u0110\u1ECDc b\xE0i \u0111ang ph\xE1t / th\xF4ng b\xE1o", "Thanh nh\u1EA1c + tin WhatsApp, Messenger\u2026", APP ? !!PM.notif : S.perm, "\u0110\xE3 c\u1EA5p", "Ch\u01B0a c\u1EA5p", "C\u1EA5p Quy\u1EC1n", () => {
            if (APP) tcn("perm", "notif");
            else self.setState({ perm: true });
          }),
          stt("Nh\u1EADt k\xFD cu\u1ED9c g\u1ECDi + SMS + danh b\u1EA1", "Tab Li\xEAn L\u1EA1c", !!PM.calllog, "\u0110\xE3 c\u1EA5p", "Ch\u01B0a c\u1EA5p", "C\u1EA5p Quy\u1EC1n", () => tcn("perm", "calllog")),
          stt("Nghe / t\u1EEB ch\u1ED1i cu\u1ED9c g\u1ECDi, g\u1EEDi SMS", "Thanh g\u1ECDi m\u1ECFng, t\u1EF1 nh\u1EAFn l\u1EA1i", !!PM.phone, "\u0110\xE3 c\u1EA5p", "Ch\u01B0a c\u1EA5p", "C\u1EA5p Quy\u1EC1n", () => tcn("perm", "phone")),
          stt("Micro", "Tr\u1EE3 l\xFD gi\u1ECDng n\xF3i", !!PM.mic, "\u0110\xE3 c\u1EA5p", "Ch\u01B0a c\u1EA5p", "C\u1EA5p Quy\u1EC1n", () => tcn("perm", "mic")),
          stt("L\u1ECBch (Google Calendar)", "Nh\u1EAFc h\u1EB9n c\u1EA1nh \u0111\u1ED3ng h\u1ED3", !!PM.cal, "\u0110\xE3 c\u1EA5p", "Ch\u01B0a c\u1EA5p", "C\u1EA5p Quy\u1EC1n", () => tcn("perm", "cal")),
          stt("Hi\u1EC7n tr\xEAn app kh\xE1c", "D\u1EA3i Tom\u2019s Car tr\xEAn Waze (b\u1EA3n sau)", !!PM.overlay, "\u0110\xE3 c\u1EA5p", "Ch\u01B0a c\u1EA5p", "C\u1EA5p Quy\u1EC1n", () => tcn("perm", "overlay"))
        ] },
        gt: { label: "Gi\u1EDBi Thi\u1EC7u", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5h.01", desc: "Th\xF4ng tin app", rows: [
          info("Phi\xEAn b\u1EA3n", "Tom\u2019s Technology Solutions", window.TC_VERSION || "0.9.5-beta"),
          info("Kh\u1EA9u hi\u1EC7u", "", "Focus On One Thing And Do It Well"),
          info("Bi\u1EC3n b\xE1o", "Theo chu\u1EA9n \xDAc AS 1742", "Ngu\u1ED3n: Wikimedia Commons"),
          info("H\xECnh \u0111\u1ECBa \u0111i\u1EC3m / logo h\xE3ng", "", "Wikimedia Commons \xB7 Wikidata"),
          info("Th\u1EDDi ti\u1EBFt / b\u1EA3n \u0111\u1ED3", "", "Open-Meteo \xB7 OpenStreetMap")
        ] }
      };
      const warnOf = (g) => GRP[g].rows.some((r) => r.isStatus && r.stL.charAt(0) === "\u26A0");
      const groups = Object.keys(GRP).map((k) => {
        const on = S.grp === k, w = warnOf(k);
        return { label: GRP[k].label, icon: GRP[k].icon, on: on ? "true" : "false", bg: on ? "rgba(251,176,64,0.16)" : "transparent", fg: on ? "#FFE2A8" : "#CFE6EE", ring: on ? "inset 0 0 0 1px #FBB040" : "none", mark: w ? "\u26A0" : "\u2713", markC: w ? "#FFD08A" : "#7BD88F", pick: () => self.setState({ grp: k }) };
      });
      const G = GRP[S.grp];
      const rows = G.rows.map((r) => Object.assign({ isToggle: false, isChoice: false, isStatus: false, isInfo: false, hint: "", opts: [], hasAct: false, on: "false", trackBg: "", knobX: 0, stateL: "", stateC: "", toggle: () => {
      }, stL: "", stC: "", actL: "", val: "" }, r, { act: r.act || (() => {
      }) }));
      const LT = LV.trip || null;
      const leg = APP && LT && LT.dir && !S.legManual ? LT.dir : S.leg, isGo = leg === "go";
      const ids = isGo ? S.goList : S.backList;
      const ALLP = Object.assign({}, PLACES, S.custom);
      const kmOf = (id) => isGo ? ALLP[id].km : TOTAL - ALLP[id].km;
      const list = ids.filter((id) => ALLP[id]).map((id) => Object.assign({ id }, ALLP[id], { km: kmOf(id) })).concat([{ id: "end", name: isGo ? "Adelaide" : "Melbourne", town: isGo ? "SA" : "VIC", k: "end", km: TOTAL }]);
      const pos = APP && LT ? Math.max(0, Math.min(TOTAL, Math.round(isGo ? LT.km : TOTAL - LT.km))) : APP ? 0 : S.pos;
      const border = isGo ? BORDER : TOTAL - BORDER;
      const baseMin = APP && LT && LT.startMin != null ? LT.startMin : APP ? d.getHours() * 60 + d.getMinutes() : 8 * 60 + 5;
      const active = list.filter((x) => !S.skip[leg + x.id]);
      const timeAt = (km) => baseMin + km / 100 * 60 + active.filter((x) => x.km < km).reduce((a, x) => a + (x.stay || 0), 0);
      const inSA = (km) => isGo ? km >= border : km < border;
      const fmt = (mins, sa) => {
        let m = Math.round(mins - (sa ? 30 : 0));
        m = (m % 1440 + 1440) % 1440;
        return p2(Math.floor(m / 60)) + ":" + p2(m % 60);
      };
      const nextIdx = list.findIndex((x) => x.km > pos && !S.skip[leg + x.id]);
      const mine = isGo ? MINE_GO : MINE_BACK;
      const move = (i, dir) => () => {
        const arr = (isGo ? S.goList : S.backList).slice();
        const j = i + dir;
        if (j < 0 || j >= arr.length) return;
        const t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
        self.save(isGo ? { goList: arr } : { backList: arr });
      };
      const openStop = (id) => () => {
        self.setState({ dlg: "stop", stopId: id });
        if (APP && !S.photos[id] && !S.commons[id] && ALLP[id] && (ALLP[id].k === "sight" || ALLP[id].k === "lake")) commonsPhoto(ALLP[id].name + " " + ALLP[id].town, (url) => self.setState({ commons: Object.assign({}, self.state.commons, { [id]: url }) }));
      };
      const kmLeft = (x) => x.km <= pos ? "\u2713" : "c\xF2n " + (x.km - pos) + " km";
      const stops = list.map((x, i) => {
        const done = x.km <= pos, next = i === nextIdx, sk = !!S.skip[leg + x.id], isEnd = x.id === "end";
        return {
          name: x.name,
          town: x.town,
          icon: ICO[x.k],
          sign: SIGN[x.k],
          photo: C.placePhotos && !isEnd,
          noPhoto: !(C.placePhotos && !isEnd),
          open: openStop(x.id),
          stay: isEnd ? "\u0110i\u1EC3m \u0111\u1EBFn" : "gh\xE9 " + x.stay + " ph",
          tag: isEnd ? "" : mine[x.id] ? isGo ? "ch\u1EB7ng \u0111i c\u1EE7a b\u1EA1n" : "ch\u1EB7ng v\u1EC1 c\u1EE7a b\u1EA1n" : "t\u1EEB ch\u1EB7ng \u0111i",
          tagC: mine[x.id] ? "#7BD88F" : "#8FC3D3",
          dist: sk ? "b\u1ECF qua chuy\u1EBFn n\xE0y" : done ? "\u2713 \u0111\xE3 gh\xE9" : x.km - pos + " km",
          distC: sk ? "#8FC3D3" : done ? "#7BD88F" : next ? "#FBB040" : "#E8F1F5",
          eta: sk ? "" : (done ? "" : "d\u1EF1 ki\u1EBFn ") + fmt(timeAt(x.km), inSA(x.km)) + (inSA(x.km) ? " gi\u1EDD SA" : ""),
          op: done || sk ? 0.55 : 1,
          strike: sk ? "line-through" : "none",
          bg: next ? "rgba(251,176,64,0.12)" : "rgba(13,44,64,0.55)",
          cls: next ? "nxt" : "",
          up: isEnd ? () => {
          } : move(i, -1),
          down: isEnd ? () => {
          } : move(i, 1),
          skip: isEnd ? () => {
          } : () => self.save({ skip: Object.assign({}, S.skip, { [leg + x.id]: !sk }) }),
          skipL: sk ? "\u21BA" : "\u2298",
          del: isEnd ? () => {
          } : () => self.setState({ dlg: "del", delId: x.id })
        };
      });
      const endMin = timeAt(TOTAL), nowMin = timeAt(pos);
      const left = Math.max(0, Math.round(endMin - nowMin));
      const driveMin = Math.round(pos / 100 * 60);
      const sinceRest = driveMin % (C.rest * 60);
      const restLeft = C.rest * 60 - sinceRest;
      const X = (km) => 30 + km / TOTAL * 740;
      const Y = (x) => 190 + 16 * Math.sin((x - 30) / 58) + 6 * Math.sin((x - 30) / 23);
      const pathTo = (xmax) => {
        let s = "";
        for (let x = 30; x <= xmax; x += 6) s += (s ? " L" : "M") + x.toFixed(1) + " " + Y(x).toFixed(1);
        s += " L" + xmax.toFixed(1) + " " + Y(xmax).toFixed(1);
        return s;
      };
      const REG = [[0, 60, "Th\xE0nh ph\u1ED1 Melbourne"], [60, 230, "\u0110\u1ED3ng c\u1ECF Ballarat"], [230, 425, "\u0110\u1ED3ng l\xFAa m\xEC Wimmera"], [425, 610, "B\u1EE5i kh\xF4 v\xF9ng Keith"], [610, 727, "\u0110\u1ED3i Adelaide"]];
      const regs = REG.map(([a, b, label]) => {
        const s = isGo ? a : TOTAL - b, e = isGo ? b : TOTAL - a;
        return { x: X(s) - (s === 0 ? 30 : 0), w: X(e) - X(s) + (s === 0 ? 30 : 0) + (e === TOTAL ? 30 : 0), label };
      });
      let cityD = "", hillD = "", wheatD = "", scrubD = "", ahillD = "";
      regs.forEach((r, i) => {
        const x0 = r.x, x1 = r.x + r.w;
        if (i === 0) for (let x = x0 + 4; x < x1 - 8; x += 13) {
          const h = 30 + rnd(x) * 55;
          cityD += "M" + x + " 160 V" + (160 - h).toFixed(0) + " H" + (x + 10) + " V160 Z ";
        }
        if (i === 1) {
          hillD += "M" + x0 + " 175 ";
          for (let x = x0; x <= x1; x += 20) hillD += "Q" + (x + 10) + " " + (140 + rnd(x) * 18).toFixed(0) + " " + (x + 20) + " 175 ";
          hillD += "L" + x1 + " 175 Z ";
        }
        if (i === 2) for (let x = x0 + 6; x < x1 - 4; x += 9) for (let y = 128; y < 170; y += 14) wheatD += "M" + x + " " + y + " l0 -8 ";
        if (i === 3) for (let x = x0 + 8; x < x1 - 6; x += 17) {
          const y = 150 + rnd(x + 3) * 18, rr = 4 + rnd(x + 9) * 4;
          scrubD += "M" + (x - rr) + " " + y.toFixed(0) + " a" + rr.toFixed(1) + " " + rr.toFixed(1) + " 0 1 0 " + (2 * rr).toFixed(1) + " 0 a" + rr.toFixed(1) + " " + rr.toFixed(1) + " 0 1 0 " + (-2 * rr).toFixed(1) + " 0 ";
        }
        if (i === 4) {
          ahillD += "M" + x0 + " 175 ";
          for (let x = x0; x <= x1; x += 26) ahillD += "Q" + (x + 13) + " " + (110 + rnd(x + 5) * 25).toFixed(0) + " " + (x + 26) + " 175 ";
          ahillD += "L" + x1 + " 175 Z ";
        }
      });
      const view = C.rtView;
      const cum = [0];
      for (let i = 1; i < MAPLINE.length; i++) cum.push(cum[i - 1] + Math.hypot(MAPLINE[i][0] - MAPLINE[i - 1][0], MAPLINE[i][1] - MAPLINE[i - 1][1]));
      const LEN = cum[cum.length - 1];
      const ptAt = (frac) => {
        const t = frac * LEN;
        let i = 1;
        while (i < cum.length - 1 && cum[i] < t) i++;
        const a = MAPLINE[i - 1], b = MAPLINE[i], f = Math.min(1, Math.max(0, (t - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)));
        return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      };
      const offX = (800 - 780 * (290 / 300)) / 2;
      const mx = (x) => offX + x * (290 / 300), my = (y) => y * (290 / 300);
      const vp = ptAt((isGo ? pos : TOTAL - pos) / TOTAL);
      const vanX = X(pos), vanY = Y(vanX) + 6;
      const followNow = S.zMode === "follow" || S.zMode === "free" && drive && S.now - S.panAt > 1e4 && !S.panning;
      const z = S.zMode === "all" ? 1 : S.z;
      const focusX = S.zMode === "all" ? 400 : followNow ? view === "road" ? vanX : mx(vp[0]) : S.fx;
      const focusY = view === "road" ? 175 : my(vp[1]);
      const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
      const tx = clamp(400 - focusX * z, 800 - 800 * z, 0), ty = clamp(150 - focusY * z, 290 - 290 * z, 0);
      const curFx = (400 - tx) / z;
      const zoomTo = (nz) => {
        if (nz <= 1.05) self.setState({ zMode: "all", z: 1 });
        else self.setState({ z: Math.min(4, nz), zMode: S.zMode === "all" ? "follow" : S.zMode, fx: curFx });
      };
      const step = z >= 2 ? 10 : 100;
      let tickD = "";
      const ticks = [];
      if (C.kmPost && view === "road") for (let k = step; k < TOTAL; k += step) {
        const x = X(k), y = Y(x);
        tickD += "M" + x.toFixed(1) + " " + (y + 11).toFixed(1) + " l0 5 ";
        if (step === 100 || k % 50 === 0 || z >= 3) ticks.push({ x: x.toFixed(1), y: (y + 17).toFixed(1), label: k + "" });
      }
      const segs = [];
      if (C.kmSeg && view === "road") {
        let prev = 0;
        active.forEach((x) => {
          const mid = (prev + x.km) / 2, sx = X(mid);
          segs.push({ x: sx.toFixed(1), y: (Y(sx) + 32).toFixed(1), label: x.km - prev + " km" });
          prev = x.km;
        });
      }
      const photos = C.placePhotos && z >= 2;
      const signs = list.map((x, i) => {
        const sx = X(x.km), isEnd = x.id === "end";
        return {
          x: sx.toFixed(1),
          y: (Y(sx) - 14).toFixed(1),
          icon: ICO[x.k],
          bg: SIGN[x.k],
          short: isEnd ? x.name : x.town.replace(/ (VIC|SA)$/, ""),
          op: x.km <= pos || S.skip[leg + x.id] ? 0.5 : 1,
          cls: i === nextIdx ? "nxt" : "",
          km: C.kmUnder ? kmLeft(x) : "",
          kmC: x.km <= pos ? "#7BD88F" : i === nextIdx ? "#FBB040" : "#E8F1F5",
          photo: photos && !isEnd,
          sign: !(photos && !isEnd),
          aria: x.name + " \u2014 b\u1EA5m xem chi ti\u1EBFt, ch\u1EA1m 2 l\u1EA7n \u0111\u1EC3 ph\xF3ng t\u1EDBi",
          open: openStop(x.id),
          focus: () => {
            const dist = Math.abs(sx - vanX) + 80;
            self.setState({ zMode: "free", fx: (sx + vanX) / 2, z: Math.min(4, Math.max(1.6, 700 / dist)), panAt: Date.now() });
          }
        };
      });
      const etaMin = endMin - (isGo ? 30 : 0);
      const etaH = Math.floor((etaMin % 1440 + 1440) % 1440 / 60);
      const day = etaH >= 6 && etaH < 19;
      const mapDots = list.map((x) => {
        const p = ptAt((isGo ? x.km : TOTAL - x.km) / TOTAL);
        return { x: mx(p[0]).toFixed(1), y: my(p[1]).toFixed(1), name: (x.id === "end" ? x.name : x.name.split(" (")[0]) + (C.kmUnder ? " \xB7 " + kmLeft(x) : ""), c: x.km <= pos ? "#7BD88F" : SIGN[x.k] === "#6B3E26" ? "#C8875A" : "#5FD4F0" };
      }).concat([{ x: mx(isGo ? 603 : 177).toFixed(1), y: my(isGo ? 270 : 30).toFixed(1), name: isGo ? "Melbourne" : "Adelaide", c: "#7BD88F" }]);
      const rt = {
        title: isGo ? "Melbourne \u2192 Adelaide" : "Adelaide \u2192 Melbourne",
        legs: [["go", "Ch\u1EB7ng \u0110i"], ["back", "Ch\u1EB7ng V\u1EC1"]].map(([k, label]) => {
          const on = leg === k;
          return { label, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => self.setState({ leg: k, legManual: true }) };
        }),
        boxes: [["XU\u1EA4T PH\xC1T", fmt(baseMin, !isGo), isGo ? "gi\u1EDD VIC" : "gi\u1EDD SA"], ["D\u1EF0 KI\u1EBEN T\u1EDAI N\u01A0I", fmt(endMin, isGo), isGo ? "gi\u1EDD SA" : "gi\u1EDD VIC"], ["C\xD2N L\u1EA0I", Math.floor(left / 60) + " gi\u1EDD " + p2(left % 60) + " ph", TOTAL - pos + " km"]].map(([l, v, s]) => ({ l, v, s })),
        views: [["road", "Con \u0110\u01B0\u1EDDng"], ["map", "B\u1EA3n \u0110\u1ED3"]].map(([k, label]) => {
          const on = view === k;
          return { label, on: on ? "true" : "false", bg: on ? ON.bg : "rgba(3,17,28,0.85)", fg: on ? ON.fg : "#CFE6EE", pick: () => self.setS("rtView", k) };
        }),
        road: view === "road",
        map: view === "map",
        r0x: regs[0].x,
        r0w: regs[0].w,
        r1x: regs[1].x,
        r1w: regs[1].w,
        r2x: regs[2].x,
        r2w: regs[2].w,
        r3x: regs[3].x,
        r3w: regs[3].w,
        r4x: regs[4].x,
        r4w: regs[4].w,
        cityD: cityD || "M0 0",
        hillD: hillD || "M0 0",
        wheatD: wheatD || "M0 0",
        scrubD: scrubD || "M0 0",
        ahillD: ahillD || "M0 0",
        tickD: tickD || "M0 0",
        regions: regs.map((r) => ({ x: Math.max(0, r.x), w: r.w, label: r.label })),
        ticks,
        segs,
        roadD: pathTo(770),
        doneD: pathTo(Math.max(31, vanX)),
        bx: X(border),
        borderL: isGo ? "V\xF4 SA \xB7 \u221230 ph" : "V\xF4 VIC \xB7 +30 ph",
        signs,
        vanX,
        vanY,
        vanL: Math.round(pos / TOTAL * 100) + "% \xB7 " + pos + " km",
        sunX: X(TOTAL) - 40,
        eta: fmt(endMin, isGo),
        sunIcon: day ? "M12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10zM12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" : "M20 15A8 8 0 1 1 9 4a6.5 6.5 0 0 0 11 11z",
        sunC: day ? "#FBB040" : "#F3EBD2",
        mapLine: MAPLINE.map((p) => p[0] + "," + p[1]).join(" "),
        mapVanX: mx(vp[0]).toFixed(1),
        mapVanY: my(vp[1]).toFixed(1),
        mapDots,
        z,
        inv: (1 / z).toFixed(3),
        tx: tx.toFixed(1),
        ty: ty.toFixed(1),
        zL: "x" + (Math.round(z * 10) / 10).toString().replace(".", ","),
        cursor: z > 1 ? S.panning ? "grabbing" : "grab" : "default",
        followOn: followNow && z > 1 ? "true" : "false",
        followBg: followNow && z > 1 ? ON.bg : "rgba(3,17,28,0.85)",
        followFg: followNow && z > 1 ? ON.fg : "#CFE6EE",
        follow: () => self.setState({ zMode: "follow", z: Math.max(2, S.z) }),
        all: () => self.setState({ zMode: "all", z: 1 }),
        zoomIn: () => zoomTo(z * 1.5),
        zoomOut: () => zoomTo(z / 1.5),
        wheel: (e) => {
          zoomTo(e.deltaY < 0 ? z * 1.25 : z / 1.25);
        },
        panStart: (e) => {
          if (z <= 1 || e.target && e.target.closest && e.target.closest("button")) return;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch (x) {
          }
          self.setState({ panning: true, panX0: e.clientX, fx0: curFx, zMode: "free", fx: curFx });
        },
        panMove: (e) => {
          if (!S.panning) return;
          self.setState({ fx: S.fx0 - (e.clientX - S.panX0) / z });
        },
        panEnd: () => {
          if (S.panning) self.setState({ panning: false, panAt: Date.now() });
        },
        foot: view === "map" ? "H\xECnh m\u1EABu \u2014 khi build l\xE0 b\u1EA3n \u0111\u1ED3 OpenStreetMap th\u1EADt, k\xE9o hai ng\xF3n \u0111\u1EC3 ph\xF3ng to" : z > 1 ? "K\xE9o \u0111\u1EC3 d\u1EDDi \xB7 xe ch\u1EA1y th\xEC 10 gi\xE2y sau t\u1EF1 v\u1EC1 Theo Xe" : "B\u1EA5m bi\u1EC3n ch\u1EB7ng xem chi ti\u1EBFt \xB7 ch\u1EA1m 2 l\u1EA7n \u0111\u1EC3 ph\xF3ng t\u1EDBi \xB7 cu\u1ED9n chu\u1ED9t / + \u2212 \u0111\u1EC3 ph\xF3ng to",
        count: list.length,
        stats: [["\u0110\xC3 \u0110I", pos + " km", "#7BD88F"], ["C\xD2N L\u1EA0I", TOTAL - pos + " km", "#E8F1F5"], ["\u0110\xC3 L\xC1I", Math.floor(driveMin / 60) + " gi\u1EDD " + p2(driveMin % 60) + " ph", "#E8F1F5"], ["NH\u1EAEC NGH\u1EC8 CH\xC2N", restLeft <= 20 ? "Ngh\u1EC9 ch\xE2n sau " + restLeft + " ph\xFAt n\u1EEFa" : "Ngh\u1EC9 sau " + String(C.rest).replace(".", ",") + " gi\u1EDD l\xE1i li\xEAn t\u1EE5c", restLeft <= 20 ? "#FFD08A" : "#E8F1F5"]].map(([l, v, c]) => ({ l, v, c })),
        stops
      };
      const curIds = isGo ? S.goList : S.backList;
      const saved = Object.keys(ALLP).map((id) => {
        const has = curIds.indexOf(id) >= 0;
        const p = ALLP[id];
        return { name: p.name, town: p.town, km: kmOf(id), icon: ICO[p.k], sign: SIGN[p.k], has, op: has ? 0.5 : 1, st: has ? "\u2713 \u0111\xE3 c\xF3" : "+ Th\xEAm", stC: has ? "#7BD88F" : "#FFD08A", add: () => {
          if (has) return;
          const arr = curIds.concat([id]).sort((a, b) => kmOf(a) - kmOf(b));
          self.save(isGo ? { goList: arr } : { backList: arr });
        } };
      }).sort((a, b) => a.km - b.km);
      const sdP = S.stopId === "end" ? { name: isGo ? "Adelaide" : "Melbourne", town: isGo ? "SA" : "VIC", k: "end", km: TOTAL } : S.stopId && ALLP[S.stopId] ? Object.assign({}, ALLP[S.stopId], { km: kmOf(S.stopId) }) : null;
      const sdImg = S.stopId ? S.photos[S.stopId] || S.commons[S.stopId] || "" : "";
      const sd = sdP ? { hasPhoto: !!sdImg, noPhoto: !sdImg, photo: sdImg, onPhoto: (e) => readPhoto(e.target, (url) => self.save({ photos: Object.assign({}, S.photos, { [S.stopId]: url }) })), nav: () => tcn("nav", sdP.addr || ADDR[sdP.name] || sdP.name), name: sdP.name, town: sdP.town, sign: SIGN[sdP.k], icon: ICO[sdP.k], info: (sdP.stay ? "gh\xE9 " + sdP.stay + " ph \xB7 " : "") + "d\u1EF1 ki\u1EBFn " + fmt(timeAt(sdP.km), inSA(sdP.km)) + " \xB7 " + (sdP.km <= pos ? "\u0111\xE3 qua" : "c\xF2n " + (sdP.km - pos) + " km"), photoNote: "Ch\u01B0a c\xF3 h\xECnh. H\xECnh b\u1EA1n ch\u1EE5p khi gh\xE9 s\u1EBD hi\u1EC7n \u1EDF \u0111\xE2y" + (PHOTO_SRC[S.stopId] ? " \u2014 \u0111i\u1EC3m tham quan n\xE0y l\u1EA5y \u0111\u01B0\u1EE3c h\xECnh t\u1EEB Wikimedia Commons" : "") } : { name: "", town: "", sign: "", icon: "", info: "", photoNote: "", hasPhoto: false, noPhoto: true, photo: "", onPhoto: () => {
      }, nav: () => {
      } };
      const W = 1280 - 22;
      const carFrac = S.split;
      const mapW = Math.round(W * (1 - carFrac));
      const SN = [[0.06, "D\u1EA3i m\u1ECFng"], [1 / 3, "1/3"], [0.5, "1/2"], [2 / 3, "2/3"]];
      const sp = {
        dir: C.mapSide === "left" ? "row" : "row-reverse",
        mapW,
        mapName: C.mapApp === "waze" ? "Waze" : C.mapApp === "gmaps" ? "Google Maps" : "HERE",
        barBg: S.dragging ? "rgba(251,176,64,0.25)" : "#0A1E2C",
        pctL: "Tom's Car " + Math.round(carFrac * 100) + "%",
        narrow: carFrac < 0.15,
        wide: carFrac >= 0.15,
        snaps: SN.map(([v, label]) => {
          const on = Math.abs(carFrac - v) < 0.01;
          return { label, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => {
            self.setState({ lastSplit: S.split, split: v });
            if (APP) tcn("split", JSON.stringify({ frac: v, side: C.mapSide, map: C.mapApp }));
          } };
        })
      };
      const snapTo = (f) => SN.reduce((b, [v]) => Math.abs(v - f) < Math.abs(b - f) ? v : b, 0.5);
      const CATS = [["fuel", "Tr\u1EA1m X\u0103ng", "fuel", false], ["mcd", "McDonald's", "food", true], ["hj", "Hungry Jack's", "food", true], ["kfc", "KFC", "food", true], ["cafe", "Caf\xE9", "cafe", false], ["wc", "Nh\xE0 V\u1EC7 Sinh", "wc", false], ["rest", "Ngh\u1EC9 Ch\xE2n", "rest", false], ["shop", "Si\xEAu Th\u1ECB", "shop", false]];
      const cats = CATS.map(([k, label, ic, logo]) => {
        const on = S.cat === k;
        return { label, icon: ICO[ic], logo, sign: !logo, on: on ? "true" : "false", bg: "#1F5FAE", ring: on ? "0 0 0 3px #FBB040" : "none", pick: () => {
          self.setState({ cat: k });
          if (APP && window.tcFindPlaces) window.tcFindPlaces(k);
        } };
      });
      const RES = {
        fuel: [["Ampol", "Western Hwy, Horsham VIC", 12, true, "b\xEAn tr\xE1i", "Diesel \u2014", "[logo Ampol]"], ["BP", "Horsham VIC", 14, true, "b\xEAn ph\u1EA3i", "Diesel \u2014", "[logo BP]"], ["Shell", "Dimboola VIC", 45, true, "b\xEAn tr\xE1i", "Diesel \u2014", "[logo Shell]"]],
        mcd: [["McDonald's Horsham", "32-36 Dimboola Rd, Horsham VIC", 13, true, "b\xEAn ph\u1EA3i", "", "[logo McDonald's]"]],
        hj: [["Hungry Jack's", "Horsham VIC", 14, true, "b\xEAn tr\xE1i", "", "[logo Hungry Jack's]"]],
        kfc: [["KFC", "Horsham VIC", 14, false, "b\xEAn tr\xE1i", "", "[logo KFC]"]],
        cafe: [["Caf\xE9", "Horsham VIC", 12, true, "b\xEAn ph\u1EA3i", "", "bi\u1EC3n caf\xE9"], ["Caf\xE9", "Dimboola VIC", 45, false, "b\xEAn tr\xE1i", "", "bi\u1EC3n caf\xE9"]],
        wc: [["Nh\xE0 v\u1EC7 sinh c\xF4ng c\u1ED9ng", "Horsham VIC", 12, true, "b\xEAn tr\xE1i", "", "bi\u1EC3n WC"]],
        rest: [["Ch\u1ED7 ngh\u1EC9 ch\xE2n (Rest Area)", "Western Hwy", 28, true, "b\xEAn tr\xE1i", "", "bi\u1EC3n ngh\u1EC9"]],
        shop: [["Si\xEAu th\u1ECB", "Horsham VIC", 13, true, "b\xEAn ph\u1EA3i", "", "[logo h\xE3ng]"]]
      };
      const catTitle = (CATS.find((c) => c[0] === S.cat) || CATS[0])[1].toUpperCase();
      const addPlaceStop = (p) => {
        const km = window.tcRouteKm ? window.tcRouteKm(p.lat, p.lon) : null;
        if (km == null) {
          self.toast("Ch\u1ED7 n\xE0y kh\xF4ng n\u1EB1m tr\xEAn tuy\u1EBFn Melbourne \u21C4 Adelaide");
          return;
        }
        const id = "c" + Date.now();
        const cu = Object.assign({}, S.custom, { [id]: { name: p.name, town: p.addr || "", k: p.k || "food", km: Math.round(km), stay: 20, lat: p.lat, lon: p.lon, addr: p.name + " " + (p.addr || "") } });
        const arr = (isGo ? S.goList : S.backList).concat([id]).sort((a, b) => (isGo ? cu[a].km : TOTAL - cu[a].km) - (isGo ? cu[b].km : TOTAL - cu[b].km));
        self.save(Object.assign({ custom: cu }, isGo ? { goList: arr } : { backList: arr }));
        self.toast("\u0110\xE3 th\xEAm v\xE0o ch\u1EB7ng gh\xE9: " + p.name);
      };
      const LIVEP = APP ? S.places[S.cat] || null : null;
      const results = APP ? LIVEP ? LIVEP.map((p) => ({ name: p.name, addr: p.addr || "", logo: p.logo ? "" : "\u2014", logoUrl: p.logo || "", logoImg: !!p.logo, logoTxt: !p.logo, logoBg: p.logo ? "#FFFFFF" : "transparent", km: p.km + " km", eta: fmt(d.getHours() * 60 + d.getMinutes() + p.km * 0.75, false), open: p.open === true ? "\u0110ang m\u1EDF c\u1EEDa" : p.open === false ? "\u0110\xE3 \u0111\xF3ng c\u1EEDa" : "Gi\u1EDD m\u1EDF: ch\u01B0a r\xF5", openC: p.open === true ? "#7BD88F" : p.open === false ? "#FF9A9E" : "#8FC3D3", side: p.side || "", price: "", nav: () => tcn("nav", p.lat + "," + p.lon), addStop: () => addPlaceStop(p), save: () => {
        self.save({ savedPl: S.savedPl.concat([p]) });
        self.toast("\u0110\xE3 l\u01B0u: " + p.name);
      } })) : [] : (RES[S.cat] || []).map(([name, addr, km, open, side, price, logo]) => ({ name, addr, logo, logoUrl: "", logoImg: false, logoTxt: true, logoBg: "transparent", km: km + " km", eta: fmt(d.getHours() * 60 + d.getMinutes() + km * 0.6, false), open: open ? "\u0110ang m\u1EDF c\u1EEDa" : "\u0110\xE3 \u0111\xF3ng c\u1EEDa", openC: open ? "#7BD88F" : "#FF9A9E", side, price: price ? price + " (n\u1EBFu c\xF3 d\u1EEF li\u1EC7u)" : "", nav: () => {
      }, addStop: () => {
      }, save: () => {
      } }));
      const searchNote = APP ? S.placesBusy ? "\u0110ANG T\xCCM\u2026" : LIVEP ? LIVEP.length ? "G\u1EA6N NH\u1EA4T, \u01AFU TI\xCAN PH\xCDA TR\u01AF\u1EDAC" : "KH\xD4NG TH\u1EA4Y CH\u1ED6 N\xC0O TRONG 30 KM" : "B\u1EA4M M\u1ED8T N\xDAT \u0110\u1EC2 T\xCCM" : "PH\xCDA TR\u01AF\u1EDAC TR\xCAN \u0110\u01AF\u1EDCNG \u0110ANG CH\u1EA0Y";
      const fuelP = APP ? S.places.fuel || null : null;
      const fuelNote = APP ? fuelP && fuelP.length ? "Tr\u1EA1m x\u0103ng g\u1EA7n nh\u1EA5t c\xE1ch " + fuelP[0].km + " km (" + fuelP[0].name + ")" : 'B\u1EA5m "Tr\u1EA1m X\u0103ng" \u0111\u1EC3 t\xECm tr\u1EA1m g\u1EA7n nh\u1EA5t' : "V\xED d\u1EE5 nh\u1EAFc tr\xEAn Road Trip: Tr\u1EA1m x\u0103ng k\u1EBF ti\u1EBFp c\xE1ch 45 km, sau \u0111\xF3 120 km kh\xF4ng c\xF3 tr\u1EA1m";
      const dx = {
        modes: [["before", "Tr\u01B0\u1EDBc (0.9.0)"], ["after", "Sau khi s\u1EEDa"]].map(([k, label]) => {
          const on = S.dexMode === k;
          return { label, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => self.setState({ dexMode: k }) };
        }),
        before: S.dexMode === "before",
        after: S.dexMode === "after",
        two: S.dexTwo,
        f1: S.dexTwo ? 1.8 : 1,
        appsL: S.dexTwo ? "Th\u1EED 1 app (ph\xF3ng to h\u1EBFt)" : "Th\u1EED 2 app",
        taskL: S.dexTask ? "\u1EA8n thanh t\xE1c v\u1EE5 DeX" : "Hi\u1EC7n thanh t\xE1c v\u1EE5 DeX",
        showTask: S.dexTask,
        taskH: S.dexTask ? 40 : 0
      };
      const WG = [["often", "Hay D\xF9ng"], ["all", "T\u1EA5t C\u1EA3"], ["map", "B\u1EA3n \u0110\u1ED3"], ["music", "Nh\u1EA1c & Radio"], ["video", "Video"], ["call", "G\u1ECDi & Nh\u1EAFn"], ["tt", "Tom's Tech"], ["other", "Kh\xE1c"], ["widget", "Widget"]];
      const q = (S.wsQ || "").trim().toLowerCase();
      const SRCAPPS = APP && S.apps ? S.apps.map((a) => [a.pkg, a.name, a.cat || "other", "#0D2C40", "", a.icon]).concat(APPS.filter((a) => a[2] === "widget")) : APPS;
      const appList = SRCAPPS.filter((a) => q ? a[1].toLowerCase().indexOf(q) >= 0 : S.wsGrp === "all" ? a[2] !== "widget" : S.wsGrp === "often" ? APP ? S.apps ? (S.apps.find((x) => x.pkg === a[0]) || {}).often : false : OFTEN.indexOf(a[0]) >= 0 : S.wsGrp === "tt" ? a[1].indexOf("Tom's") === 0 : a[2] === S.wsGrp);
      const nameOf = (id) => (SRCAPPS.find((a) => a[0] === id) || APPS.find((a) => a[0] === id) || [id, id])[1];
      const ws = {
        q: S.wsQ,
        setQ: (e) => self.setState({ wsQ: e.target.value }),
        groups: WG.map(([k, label]) => {
          const on = !q && S.wsGrp === k;
          return { label, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => self.setState({ wsGrp: k, wsQ: "" }) };
        }),
        apps: appList.map((a) => {
          const idx = S.wsSel.indexOf(a[0]);
          return { name: a[1], letter: a[5] ? "" : a[4], icon: a[5] || "", hasIcon: !!a[5], tile: a[5] ? "url(" + a[5] + ") center/cover no-repeat" : a[3], radius: a[2] === "widget" ? "8px" : "12px", sel: idx >= 0, n: idx + 1, on: idx >= 0 ? "true" : "false", bg: idx >= 0 ? "rgba(251,176,64,0.16)" : "#0D2C40", ring: idx >= 0 ? "inset 0 0 0 2px #FBB040" : "none", pick: () => {
            const sel = S.wsSel.slice();
            if (idx >= 0) sel.splice(idx, 1);
            else if (sel.length < 3) sel.push(a[0]);
            else {
              self.toast("T\u1ED1i \u0111a 3 \xF4 \u2014 b\u1EA5m b\u1ECF m\u1ED9t app tr\u01B0\u1EDBc");
              return;
            }
            self.setState({ wsSel: sel });
          } };
        }),
        thumb: S.wsSel.length ? S.wsSel.map((id, i) => ({ n: i + 1, name: nameOf(id), flex: S.wsSel.length === 3 ? i === 0 ? 2 : 1 : S.wsSel.length === 2 ? i === 0 ? 1.8 : 1 : 1, bg: ["#1B3A52", "#2A2440", "#203A2A"][i] })) : [{ n: "\u2013", name: "Ch\u01B0a ch\u1ECDn app", flex: 1, bg: "#0D2C40" }],
        hint: S.wsSel.length + "/3 \xF4 \u0111\xE3 ch\u1ECDn" + (S.wsSel.length === 3 ? " \u2014 \u0111\u1EE7 r\u1ED3i" : ""),
        hintC: S.wsSel.length === 3 ? "#FFD08A" : "#8FC3D3"
      };
      const WCOL = ["#1B3A52", "#2A2440", "#203A2A"];
      const wsCards = S.wsList.map((w, i) => ({
        name: w.name,
        rt: !!w.rt,
        boxes: w.apps.map((id, k) => ({ name: nameOf(id), flex: w.apps.length === 3 ? k === 0 ? 2 : 1 : w.apps.length === 2 ? k === 0 ? 1.8 : 1 : 1, bg: WCOL[k] })),
        open: () => {
          const pcts = w.apps.length === 3 ? [50, 25, 25] : w.apps.length === 2 ? [64, 36] : [100];
          tcn("launch", JSON.stringify(w.apps.filter((a) => a.indexOf("w-") !== 0).map((a, k) => [a, pcts[k]])));
          if (w.rt) self.setState({ scr: "rt" });
        },
        del: () => self.save({ wsList: S.wsList.filter((_, k) => k !== i) })
      }));
      const callSec = CALL && CALL.state === "talk" ? Math.floor((S.now - (CALL.since || S.now)) / 1e3) : 0;
      const cb = {
        on: !!CALL,
        ring: !!CALL && CALL.state === "ring",
        talk: !!CALL && CALL.state === "talk",
        name: priv ? "C\xF3 cu\u1ED9c g\u1ECDi" : APP ? CALL && (CALL.name || CALL.number) || "S\u1ED1 l\u1EA1" : "Anh Minh (m\u1EABu)",
        group: APP ? CALL && CALL.group || "S\u1ED1 L\u1EA1" : "Kh\xE1ch H\xE0ng",
        state: CALL && CALL.state === "ring" ? "\u0111ang g\u1ECDi t\u1EDBi \xB7 chu\xF4ng nh\xF3m Kh\xE1ch H\xE0ng" : p2(Math.floor(callSec / 60)) + ":" + p2(callSec % 60),
        sub: priv ? "Ch\u1EBF \u0110\u1ED9 Ri\xEAng T\u01B0: \u0111\xE3 gi\u1EA5u t\xEAn v\xE0 th\xF4ng tin kh\xE1ch \xB7 kh\xF4ng \u0111\u1ECDc t\xEAn ra loa" : APP ? (CALL && CALL.number ? CALL.number + " \xB7 " : "") + 'kh\xF4ng \u0111\u1ECDc t\xEAn ra loa, ch\u1EC9 b\xE1o "C\xF3 cu\u1ED9c g\u1ECDi"' : `Tom's Shield: L\u1EAFp camera \u2013 Tarneit (m\u1EABu) \xB7 kh\xF4ng \u0111\u1ECDc t\xEAn ra loa, ch\u1EC9 b\xE1o "C\xF3 cu\u1ED9c g\u1ECDi"`,
        answer: () => {
          if (APP) tcn("call", "answer");
          else self.setState({ call: "talk", callAt: Date.now() });
        },
        decline: () => {
          if (APP) tcn("call", "decline:" + (C.autoSms ? 1 : 0));
          else self.setState({ call: null });
          self.toast(C.autoSms ? '\u0110\xE3 t\u1EEB ch\u1ED1i v\xE0 t\u1EF1 nh\u1EAFn l\u1EA1i: "M\xECnh \u0111ang l\xE1i xe, l\xE1t g\u1ECDi l\u1EA1i nha"' : "\u0110\xE3 t\u1EEB ch\u1ED1i cu\u1ED9c g\u1ECDi");
        },
        hang: () => {
          if (APP) tcn("call", "end");
          else self.setState({ call: null });
        },
        mute: () => {
          if (APP) tcn("call", S.mute ? "unmute" : "mute");
          self.setState({ mute: !S.mute });
        },
        muteOn: S.mute ? "true" : "false",
        muteL: S.mute ? "M\u1EDF Mic" : "T\u1EAFt Mic",
        muteC: S.mute ? "#FF9A9E" : "#E8F1F5",
        spk: () => {
          if (APP) tcn("call", S.spkCar ? "phone" : "speaker");
          self.setState({ spkCar: !S.spkCar });
        },
        spkL: S.spkCar ? "Loa Xe" : "\u0110i\u1EC7n Tho\u1EA1i"
      };
      const toastOn = !!S.toast && S.now - S.toastAt < 4e3;
      const MAPP = { sms: ["SMS", "#1F5FAE", "S"], wa: ["WhatsApp", "#1E8E5A", "W"], msgr: ["Messenger", "#6B4BD8", "M"], signal: ["Signal", "#2D6FD6", "Si"], tg: ["Telegram", "#2A9BD6", "T"] };
      const GROUPC = { "Kh\xE1ch H\xE0ng": "#FFD08A", "Gia \u0110\xECnh": "#9FE3B0", "B\u1EA1n B\xE8": "#A9D8F0", "S\u1ED1 L\u1EA1": "#C9C9C9" };
      const ini = (n) => n.split(" ").filter((w) => /^[A-Za-zÀ-ỹ]/.test(w)).map((w) => w.charAt(0).toUpperCase()).join(".").slice(0, 5) + ".";
      const CALLS = [["Anh Minh", "Kh\xE1ch H\xE0ng", "G\u1ECDi nh\u1EE1", "08:42", "miss"], ["Ch\u1ECB Lan", "Gia \u0110\xECnh", "G\u1ECDi \u0111\u1EBFn \xB7 3 ph", "H\xF4m qua 18:10", "in"], ["+61 4\xB7\xB7 \xB7\xB7\xB7 123", "S\u1ED1 L\u1EA1", "G\u1ECDi nh\u1EE1", "H\xF4m qua 11:02", "miss"], ["Anh Tu\u1EA5n", "B\u1EA1n B\xE8", "G\u1ECDi \u0111i \xB7 1 ph", "12/11", "out"]];
      const MSGS = [["Ch\u1ECB Lan", "Gia \u0110\xECnh", "sms", "T\u1ED1i nay v\u1EC1 \u0103n c\u01A1m kh\xF4ng?", "09:05", 1], ["Anh Minh", "Kh\xE1ch H\xE0ng", "wa", "Mai l\u1EAFp camera l\xFAc m\u1EA5y gi\u1EDD anh?", "08:50", 2], ["Nh\xF3m \u0110i Adelaide", "B\u1EA1n B\xE8", "msgr", "Ai mang \u0111\u1ED3 n\u01B0\u1EDBng?", "H\xF4m qua", 0], ["Anh Tu\u1EA5n", "B\u1EA1n B\xE8", "signal", "Ok nha", "H\xF4m qua", 0], ["K\xEAnh tin t\u1EE9c", "S\u1ED1 L\u1EA1", "tg", "B\u1EA3n tin s\xE1ng", "11/11", 0]];
      const hideTxt = drive || priv;
      const CL = APP ? S.calls || [] : CALLS, MS = APP ? S.msgs || [] : MSGS;
      const isCalls = S.ctTab === "calls";
      const ctRows = isCalls ? CL.map(([n, g, sub, time, kind, num]) => ({ name: priv ? ini(n) + " \xB7 " + g : n, av: priv ? "\u2022" : n.charAt(0) === "+" ? "#" : n.split(" ").pop().charAt(0), avBg: "#2B4A5E", tag: g, tagBg: GROUPC[g], tile: "transparent", letter: "", tileShow: "none", sub, subC: kind === "miss" ? "#FF9A9E" : "#8FC3D3", time, unread: false, unreadN: 0, actL: "G\u1ECDi L\u1EA1i", actCls: "btn-o", act: () => {
        if (APP) tcn("call", "dial:" + (num || ""));
        else self.toast("\u0110ang g\u1ECDi l\u1EA1i\u2026 (m\u1EABu)");
      } })) : MS.filter((m) => S.ctApp === "all" || m[2] === S.ctApp).map(([n, g, app, txt, time, un, key]) => ({ name: priv ? ini(n) + " \xB7 " + g : n, av: priv ? "\u2022" : n.split(" ").pop().charAt(0), avBg: "#2B4A5E", tag: g, tagBg: GROUPC[g], tile: MAPP[app][1], letter: MAPP[app][2], tileShow: "inline-flex", sub: hideTxt ? drive ? "N\u1ED9i dung \u1EA9n khi xe ch\u1EA1y" : "Ch\u1EBF \u0110\u1ED9 Ri\xEAng T\u01B0: \u1EA9n n\u1ED9i dung" : MAPP[app][0] + ": " + txt, subC: hideTxt ? "#5E8496" : "#CFE6EE", time, unread: un > 0, unreadN: un, actL: "Tr\u1EA3 L\u1EDDi", actCls: "", act: () => self.setState({ dlg: "reply", rpName: priv ? ini(n) : n, rpApp: MAPP[app][0], rpKey: key || "" }) }));
      const ct = {
        tabs: [["calls", "Cu\u1ED9c G\u1ECDi"], ["msgs", "Tin Nh\u1EAFn"]].map(([k, label]) => {
          const on = S.ctTab === k;
          return { label, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => self.setState({ ctTab: k }) };
        }),
        msgs: !isCalls,
        listTop: isCalls ? 70 : 116,
        apps: [["all", "T\u1EA5t C\u1EA3", "#3A4A55", "\u2217"]].concat(Object.keys(MAPP).map((k) => [k, MAPP[k][0], MAPP[k][1], MAPP[k][2]])).map(([k, label, tile, letter]) => {
          const on = S.ctApp === k;
          return { label, tile, letter, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => self.setState({ ctApp: k }) };
        }),
        rows: ctRows,
        modeL: priv ? "Ch\u1EBF \u0110\u1ED9 Ri\xEAng T\u01B0: \u0111ang b\u1EADt" : drive ? "Xe \u0111ang ch\u1EA1y: \u1EA9n n\u1ED9i dung tin nh\u1EAFn" : "\u0110\u1EADu xe: hi\u1EC7n \u0111\u1EA7y \u0111\u1EE7",
        modeC: priv || drive ? "#FFD08A" : "#7BD88F",
        note: isCalls ? "Cu\u1ED9c g\u1ECDi + SMS: \u0111\u1ECDc \u0111\u01B0\u1EE3c to\xE0n b\u1ED9 l\u1ECBch s\u1EED (c\u1EA7n c\u1EA5p quy\u1EC1n). \xD4 ch\u1EEF c\xE1i l\xE0 h\xECnh m\u1EABu, kh\xF4ng ph\u1EA3i logo app." : "WhatsApp, Messenger\u2026: ch\u1EC9 b\u1EAFt \u0111\u01B0\u1EE3c tin m\u1EDBi qua th\xF4ng b\xE1o t\u1EEB l\xFAc c\xE0i Tom\u2019s Car, app t\u1EF1 l\u01B0u l\u1EA1i \xB7 t\u1EF1 xo\xE1 sau " + (C.msgKeep ? C.msgKeep + " ng\xE0y" : "\u2014 (kh\xF4ng xo\xE1)") + '. Kh\xF4ng t\u1EF1 \u0111\u1ECDc to \u2014 mu\u1ED1n nghe th\xEC n\xF3i "Hey Tom, \u0111\u1ECDc tin nh\u1EAFn".'
      };
      const rp = { name: S.rpName, app: S.rpApp, tpls: ["M\xECnh \u0111ang l\xE1i xe, l\xE1t g\u1ECDi l\u1EA1i nha", "S\u1EAFp t\u1EDBi r\u1ED3i", "Ok", "T\u1ED1i g\u1ECDi l\u1EA1i nh\xE9"].map((t) => ({ text: t, send: () => {
        self.setState({ dlg: null });
        if (APP) tcn("reply", JSON.stringify({ key: S.rpKey, text: t }));
        self.toast("\u0110\xE3 g\u1EEDi qua " + S.rpApp + ': "' + t + '"');
      } })) };
      const rIdx = pos < 60 ? 0 : pos < 230 ? 1 : pos < 425 ? 2 : pos < 610 ? 3 : 4;
      const regName = (isGo ? REGION_ABC[rIdx] : REGION_ABC[4 - rIdx])[0], regAbc = (isGo ? REGION_ABC[rIdx] : REGION_ABC[4 - rIdx])[1];
      const nextAbc = isGo ? (REGION_ABC[rIdx + 1] || [])[1] : (REGION_ABC[3 - rIdx] || [])[1];
      const NEAR = [["abcm", regAbc, "\u0110\xE0i ABC v\xF9ng n\xE0y \xB7 tin t\u1EE9c, giao th\xF4ng, th\u1EDDi ti\u1EBFt", "A", "#2B2B2B"]].concat(nextAbc ? [["abcnext", nextAbc, "V\xF9ng k\u1EBF ti\u1EBFp \u2014 app t\u1EF1 chuy\u1EC3n khi t\u1EDBi", "A", "#2B2B2B"]] : []).concat([["comm", "\u0110\xE0i c\u1ED9ng \u0111\u1ED3ng \u0111\u1ECBa ph\u01B0\u01A1ng", "Tu\u1EF3 th\u1ECB tr\u1EA5n (m\u1EABu)", "C", "#3A5A3A"]]);
      const allRadio = NEAR.concat(RADIO.au, RADIO.vn);
      const TABS = { music: [["queue", "\u0110ang Ph\xE1t"], ["lists", "Danh S\xE1ch Ph\xE1t"], ["albums", "Album / Ngh\u1EC7 S\u0129"], ["radio", "Radio"]], radio: [["near", "G\u1EA7n \u0110\xE2y"], ["fav", "Y\xEAu Th\xEDch"], ["au", "\xDAc"], ["vn", "Vi\u1EC7t Nam"]], podcast: [["pnew", "T\u1EADp M\u1EDBi"], ["psub", "\u0110\xE3 Theo D\xF5i"]] };
      const tabOk = TABS[S.src].some((t) => t[0] === S.mpTab) ? S.mpTab : TABS[S.src][0][0];
      const play = (t, sub, src, url) => () => {
        if (APP && (src || S.src) === "radio") tcn("radio", JSON.stringify({ url: url || "", name: t }));
        self.setState({ nowT: t, nowS: sub, src: src || S.src, playing: true, perm: true, panelAt: Date.now() });
      };
      let rowsRaw = [];
      if (APP) {
        const RL = S.radioLists || {};
        const toRows = (arr) => (arr || []).map((r) => ({ id: r.id, t: r.name, s: r.sub || "", url: r.url, letter: (r.name || "?").charAt(0), tile: "#2B2B2B", rad: "50%", isRadio: true }));
        if (S.src === "music") {
          const qu = MD && MD.queue || [];
          if (tabOk === "queue") rowsRaw = qu.length ? qu.map((q2) => ({ t: q2.title, s: q2.sub || "", letter: "\u266A", tile: "#3A2A10", rad: "6px", qid: q2.id })) : [{ t: MD ? "App nh\u1EA1c n\xE0y ch\u01B0a cho xem h\xE0ng ch\u1EDD" : "Ch\u01B0a ph\xE1t nh\u1EA1c", s: MD ? "B\u1EA5m \u0111\u1EC3 m\u1EDF " + (MD.app || "app nh\u1EA1c") : "M\u1EDF app nh\u1EA1c r\u1ED3i b\u1EA5m ph\xE1t", letter: "\u266A", tile: "#3A2A10", rad: "6px", open: true }];
          else if (tabOk !== "radio") rowsRaw = [{ t: "M\u1EDF trong " + (MD && MD.app || "app nh\u1EA1c"), s: "Danh s\xE1ch ph\xE1t / album ch\u1ECDn b\xEAn app nh\u1EA1c", letter: "\u2197", tile: "#1B3A52", rad: "6px", open: true }];
        }
        if (S.src === "radio") rowsRaw = tabOk === "fav" ? toRows([].concat(RL.near || [], RL.au || [], RL.vn || []).filter((r) => S.favs[r.id])) : toRows(RL[tabOk]);
        if (S.src === "podcast") rowsRaw = [{ t: "M\u1EDF app podcast", s: "Pocket Casts / Spotify \u2014 podcast ph\xE1t b\xEAn app \u0111\xF3", letter: "P", tile: "#7A4BB5", rad: "8px", open: true }];
        if (S.src === "radio" && !rowsRaw.length) rowsRaw = [{ t: S.radioLists ? "Kh\xF4ng t\xECm th\u1EA5y \u0111\xE0i" : "\u0110ang t\u1EA3i danh s\xE1ch \u0111\xE0i\u2026", s: "C\u1EA7n c\xF3 m\u1EA1ng", letter: "\u2026", tile: "#2B2B2B", rad: "50%" }];
      } else if (S.src === "music") {
        if (tabOk === "queue") rowsRaw = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ t: "B\xE0i h\xE1t m\u1EABu " + i, s: "Ngh\u1EC7 s\u0129 m\u1EABu \xB7 3:" + p2(10 + i * 4), letter: "\u266A", tile: "#3A2A10", rad: "6px" }));
        if (tabOk === "lists") rowsRaw = [["\u0110i Adelaide", "24 b\xE0i"], ["Nh\u1EA1c X\u01B0a", "58 b\xE0i"], ["L\xE1i \u0110\xEAm", "31 b\xE0i"], ["Y\xEAu Th\xEDch", "120 b\xE0i"]].map(([t, sub]) => ({ t, s: sub, letter: "\u2261", tile: "#1B3A52", rad: "6px" }));
        if (tabOk === "albums") rowsRaw = ["A", "B", "C", "D", "E"].map((x) => ({ t: "Album m\u1EABu " + x, s: "Ngh\u1EC7 s\u0129 m\u1EABu", letter: x, tile: "#2A2440", rad: "6px" }));
      }
      const radioRows = (arr) => arr.map(([id, t, sub, letter, tile]) => ({ id, t, s: sub, letter, tile, rad: "50%", isRadio: true }));
      if (!APP && S.src === "radio") rowsRaw = radioRows(tabOk === "near" ? NEAR : tabOk === "fav" ? allRadio.filter((r) => S.favs[r[0]]) : RADIO[tabOk] || []);
      if (!APP && S.src === "podcast") rowsRaw = [1, 2, 3, 4, 5].map((i) => ({ t: "Podcast m\u1EABu " + i, s: tabOk === "pnew" ? "T\u1EADp m\u1EDBi \xB7 " + (20 + i * 7) + " ph" : "\u0110\xE3 theo d\xF5i", letter: "P", tile: "#7A4BB5", rad: "8px" }));
      const maxRows = drive ? 6 : 99;
      const curT = APP ? S.src === "radio" ? LV.radio && LV.radio.name : MD && MD.title : S.nowT || DEF_NOW[S.src][0];
      const mpOpen = S.mpOpen && !(drive && S.now - S.panelAt > 8e3);
      const mp = {
        open: mpOpen,
        touch: () => self.setState({ panelAt: Date.now() }),
        close: () => self.setState({ mpOpen: false }),
        srcs: [["music", "Nh\u1EA1c"], ["radio", "Radio"], ["podcast", "Podcast"]].map(([k, label]) => {
          const on = S.src === k;
          return { label, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => self.setState({ src: k, mpTab: TABS[k][0][0], nowT: "", nowS: "", panelAt: Date.now() }) };
        }),
        srcNote: S.src === "music" ? APP ? "Ngu\u1ED3n: " + (MD && MD.app || "app nh\u1EA1c \u0111ang ph\xE1t") : "Ngu\u1ED3n: Tom's Jukebox" : S.src === "radio" ? "Radio qua m\u1EA1ng \xB7 ~30\u201360 MB/gi\u1EDD" : "Podcast",
        tabs: TABS[S.src].map(([k, label]) => {
          const on = tabOk === k;
          return { label, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => {
            if (k === "radio") self.setState({ src: "radio", mpTab: "near", panelAt: Date.now() });
            else self.setState({ mpTab: k, panelAt: Date.now() });
          } };
        }),
        searchPh: drive ? 'Kho\xE1 g\xF5 khi xe ch\u1EA1y \u2014 n\xF3i "Hey Tom, ph\xE1t\u2026"' : S.src === "radio" ? "T\xECm \u0111\xE0i" : "T\xECm b\xE0i, ngh\u1EC7 s\u0129",
        searchBg: drive ? "#0A1822" : "#0D2C40",
        regionOn: S.src === "radio" && tabOk === "near",
        regionL: APP ? "V\xF9ng hi\u1EC7n t\u1EA1i: " + (S.radioLists && S.radioLists.region || LV.place && LV.place.suburb || "\u2026") + " (theo GPS) \xB7 T\u1EF1 \u0111\u1ED5i \u0111\xE0i theo v\xF9ng: M\u1EDF" : "V\xF9ng hi\u1EC7n t\u1EA1i: " + regName + " (theo GPS \xB7 m\u1EABu) \xB7 T\u1EF1 \u0111\u1ED5i \u0111\xE0i theo v\xF9ng: M\u1EDF",
        rows: rowsRaw.slice(0, maxRows).map((r) => {
          const cur = playing && r.t === curT;
          return Object.assign({ isRadio: false, id: "" }, r, { bg: cur ? "rgba(251,176,64,0.14)" : "rgba(13,44,64,0.55)", st: cur ? "\u0110ANG PH\xC1T" : "", stC: "#FFD08A", play: r.open ? () => tcn(S.src === "podcast" ? "openApp" : "openMedia", S.src === "podcast" ? "podcast" : "") : r.qid != null ? () => tcn("media", "queue:" + r.qid) : play(r.t, r.isRadio ? "Radio \xB7 tr\u1EF1c ti\u1EBFp" : r.s, r.isRadio ? "radio" : S.src, r.url), favOn: S.favs[r.id] ? "true" : "false", favC: S.favs[r.id] ? "#FBB040" : "#5E8496", fav: () => self.setState({ favs: Object.assign({}, S.favs, { [r.id]: !S.favs[r.id] }), panelAt: Date.now() }) });
        }),
        fs: drive ? 18 : 15,
        rowPad: drive ? "10px 8px" : "6px 8px",
        foot: drive ? "Xe \u0111ang ch\u1EA1y: ch\u1EEF to, t\u1ED1i \u0111a 6 d\xF2ng, t\u1EF1 \u0111\xF3ng sau 8 gi\xE2y kh\xF4ng \u0111\u1EE5ng." : S.src === "music" ? `Tom's Jukebox: \u0111\u1EE7 4 tab. Spotify / YouTube Music: ch\u1EC9 th\u1EA5y h\xE0ng ch\u1EDD n\u1EBFu app cho ph\xE9p, c\xF2n l\u1EA1i c\xF3 n\xFAt "M\u1EDF trong \u2026".` : S.src === "radio" ? 'M\u1EA5t s\xF3ng (vd Kaniva \u2192 Keith) app s\u1EBD h\u1ECFi: "Chuy\u1EC3n sang nh\u1EA1c trong m\xE1y?" \xB7 T\xEAn b\xE0i/\u0111\xE0i trong demo l\xE0 s\u1ED1 li\u1EC7u m\u1EABu.' : "S\u1ED1 li\u1EC7u m\u1EABu."
      };
      const sayV = (t, sens) => {
        self.setState({ va: false });
        self.say(t, sens);
      };
      const findContact = (name) => {
        const all = (S.calls || []).concat(S.msgs || []);
        const n = (name || "").trim().toLowerCase();
        return all.find((r) => (r[0] || "").toLowerCase().indexOf(n) >= 0);
      };
      const CMDS = [
        { t: "T\xECm tr\u1EA1m x\u0103ng g\u1EA7n nh\u1EA5t", re: /(tr[aạ]m x[aă]ng|đổ x[aă]ng|petrol|fuel|servo)/, run: () => {
          self.setState({ va: false, scr: "search", cat: "fuel" });
          if (APP && window.tcFindPlaces) window.tcFindPlaces("fuel");
          self.say("D\u1EA1, \u0111ang t\xECm tr\u1EA1m x\u0103ng g\u1EA7n nh\u1EA5t");
        } },
        { t: "McDonald's g\u1EA7n nh\u1EA5t", re: /(mc ?donald|mác đô|macca)/, run: () => {
          self.setState({ va: false, scr: "search", cat: "mcd" });
          if (APP && window.tcFindPlaces) window.tcFindPlaces("mcd");
          self.say("D\u1EA1, \u0111ang t\xECm McDonald's");
        } },
        { t: "Nghe \u0111\xE0i v\xF9ng n\xE0y", re: /(đài|radio|ra đi ô)/, run: () => {
          self.setState({ va: false, src: "radio", mpOpen: true, mpTab: "near", panelAt: Date.now() });
          const n = S.radioLists && S.radioLists.near && S.radioLists.near[0] || null;
          if (APP && n) tcn("radio", JSON.stringify({ url: n.url, name: n.name }));
          self.say(n ? "D\u1EA1, \u0111ang m\u1EDF " + n.name : "D\u1EA1, m\u1EDF danh s\xE1ch \u0111\xE0i v\xF9ng n\xE0y");
        } },
        { t: "C\xF2n bao xa", re: /(bao xa|còn bao nhiêu|how far|bao lâu)/, run: () => sayV("D\u1EA1, c\xF2n " + (TOTAL - pos) + " ki l\xF4 m\xE9t, t\u1EDBi " + (isGo ? "Adelaide" : "Melbourne") + " kho\u1EA3ng " + fmt(endMin, isGo)) },
        { t: "B\xE0i k\u1EBF", re: /(bài kế|bài tiếp|next|qua bài)/, run: () => {
          tcn("media", "next");
          sayV("D\u1EA1");
        } },
        { t: "D\u1EEBng nh\u1EA1c", re: /(dừng|tắt nhạc|pause|stop)/, run: () => {
          tcn(S.src === "radio" ? "radio" : "media", S.src === "radio" ? "stop" : "toggle");
          sayV("D\u1EA1");
        } },
        { t: "Ph\xE1t nh\u1EA1c", re: /(phát nhạc|mở nhạc|play)/, run: () => {
          self.setState({ src: "music" });
          tcn("media", "toggle");
          sayV("D\u1EA1");
        } },
        { t: "B\u1EADt ri\xEAng t\u01B0", re: /(riêng tư|privacy)/, run: () => {
          self.setS("privacy", !/tắt/.test(S.vaHeard || ""));
          sayV("D\u1EA1, \u0111\xE3 " + (/tắt/.test(S.vaHeard || "") ? "t\u1EAFt" : "b\u1EADt") + " Ch\u1EBF \u0110\u1ED9 Ri\xEAng T\u01B0");
        } },
        { t: "D\u1ECBu m\u1EAFt", re: /(dịu mắt|tối màn hình)/, run: () => {
          self.setS("calm", true);
          sayV("D\u1EA1, \u0111\xE3 b\u1EADt D\u1ECBu M\u1EAFt");
        } },
        { t: "\u0110\u1ECDc tin nh\u1EAFn", re: /(đọc tin|tin nhắn|read message)/, run: () => {
          if (priv) return sayV("\u0110ang b\u1EADt Ri\xEAng T\u01B0 n\xEAn kh\xF4ng \u0111\u1ECDc tin nh\u1EAFn");
          const m = (S.msgs || [])[0];
          sayV(m ? m[0] + " nh\u1EAFn: " + m[3] : "D\u1EA1, kh\xF4ng c\xF3 tin nh\u1EAFn m\u1EDBi", true);
        } },
        { t: "Nghe m\xE1y", re: /^(nghe|nghe máy|answer)$/, run: () => {
          tcn("call", "answer");
          self.setState({ va: false });
        } },
        { t: "T\u1EEB ch\u1ED1i", re: /^(từ chối|decline|không nghe)/, run: () => {
          tcn("call", "decline:" + (C.autoSms ? 1 : 0));
          self.setState({ va: false });
        } },
        { t: "G\u1ECDi \u2026", re: /^(gọi|call) (.+)$/, run: (m) => {
          const c = findContact(m[2]);
          if (c && c[5]) {
            self.setState({ va: false });
            self.say("D\u1EA1, \u0111ang g\u1ECDi " + (priv ? "ng\u01B0\u1EDDi \u0111\xE3 ch\u1ECDn" : c[0]), true);
            tcn("call", "dial:" + c[5]);
          } else {
            tcn("call", "dialName:" + m[2]);
            sayV("D\u1EA1, \u0111ang t\xECm " + m[2] + " trong danh b\u1EA1", true);
          }
        } },
        { t: "Ch\u1EC9 \u0111\u01B0\u1EDDng t\u1EDBi \u2026", re: /(chỉ đường|dẫn đường|đi tới|navigate)( tới| đến| to)? (.+)$/, run: (m) => {
          tcn("nav", m[3]);
          sayV("D\u1EA1, \u0111ang ch\u1EC9 \u0111\u01B0\u1EDDng t\u1EDBi " + m[3]);
        } },
        { t: "Ch\u1EB7ng k\u1EBF ti\u1EBFp", re: /(chặng kế|ghé chỗ kế|next stop)/, run: () => {
          const nx = list[nextIdx];
          if (nx) {
            tcn("nav", nx.addr || ADDR[nx.name] || nx.name);
            sayV("D\u1EA1, \u0111ang ch\u1EC9 \u0111\u01B0\u1EDDng t\u1EDBi " + nx.name);
          } else sayV("D\u1EA1, h\u1EBFt ch\u1EB7ng gh\xE9 r\u1ED3i");
        } }
      ];
      self._cmds = CMDS;
      const va = {
        on: S.va,
        close: () => {
          self.setState({ va: false });
          tcn("voice", "stop");
        },
        title: S.vaHint || "\u0110ang nghe\u2026 n\xF3i l\u1EC7nh",
        heard: S.vaHeard,
        heardOn: !!S.vaHeard,
        hint: APP ? "V\xED d\u1EE5 l\u1EC7nh (b\u1EA5m th\u1EED \u0111\u01B0\u1EE3c):" : "B\u1EA5m th\u1EED m\u1ED9t l\u1EC7nh m\u1EABu (b\u1EA3n th\u1EADt th\xEC n\xF3i):",
        cmds: CMDS.slice(0, 8).map((c) => ({ t: c.t, run: () => c.run([c.t, "", c.t, c.t]) }))
      };
      const IT = [
        ["M\xE0n h\xECnh ch\xE0o \u2192 Gi\u1EDBi Thi\u1EC7u t\u1EF1 v\xE0o M\xE0n H\xECnh Ch\xEDnh", "M\u1EDF L\u1EA1i App", "home"],
        ['"M\u01B0a xx%" kh\xF4ng b\u1ECB c\u1EAFt (b\u1ECF n\xFAt \u24D8)', "M\xE0n H\xECnh Ch\xEDnh", "home"],
        ["D\u1EDDi g\u01B0\u01A1ng camera sau xu\u1ED1ng d\u01B0\u1EDBi thanh tr\xEAn", "M\xE0n H\xECnh Ch\xEDnh", "home"],
        ["Icon C\xE0i \u0110\u1EB7t b\xE1nh r\u0103ng r\xF5, to h\u01A1n", "M\xE0n H\xECnh Ch\xEDnh", "home"],
        ['Thanh nh\u1EA1c: "Ch\u01B0a ph\xE1t nh\u1EA1c" + nh\u1EAFc c\u1EA5p quy\u1EC1n', "M\xE0n H\xECnh Ch\xEDnh", "home"],
        ["Nh\u1EDB m\u1ECDi l\u1EF1a ch\u1ECDn; m\u1EDF app v\xE0o th\u1EB3ng M\xE0n H\xECnh Ch\xEDnh", "C\xE0i \u0110\u1EB7t \u2192 Chung", "settings"],
        ['B\u1ECF Workspace m\u1EABu; "+ T\u1EA1o Workspace \u0110\u1EA7u Ti\xEAn"; \xF4 "M\u1EDF Road Trip"', "M\xE0n H\xECnh Ch\xEDnh", "home"],
        ["N\xFAt Tho\xE1t \u23FB: Tho\xE1t h\u1EB3n / Ch\u1EA1y n\u1EC1n / H\u1EE7y", "M\xE0n H\xECnh Ch\xEDnh", "home"],
        ["M\u01B0a h\u1EA1t li ti, gi\u1ECDt tr\xEAn k\xEDnh, xe ch\u1EA1y t\u1EF1 t\u1EAFt, c\xF4ng t\u1EAFc", "M\xE0n H\xECnh Ch\xEDnh + \u0110ang Ch\u1EA1y", "home"],
        ["C\xE0i \u0110\u1EB7t to\xE0n trang Neon, 8 nh\xF3m, \u2713/\u26A0", "C\xE0i \u0110\u1EB7t", "settings"],
        ["L\xE0m m\u1EDD thanh d\u01B0\u1EDBi + thanh nh\u1EA1c (ri\xEAng), t\u1EF1 m\u1EDD 5 gi\xE2y", "M\xE0n H\xECnh Ch\xEDnh / C\xE0i \u0110\u1EB7t \u2192 Giao Di\u1EC7n", "home"],
        ["S\xF3ng nh\u1EA1c m\u1EB7c \u0111\u1ECBnh ki\u1EC3u Tom's Jukebox", "M\xE0n H\xECnh Ch\xEDnh (b\u1EA5m ph\xE1t)", "home"],
        ["Workspace DeX ph\xF3ng to h\u1EBFt m\xE0n h\xECnh + d\u1EA3i Tom\u2019s Car", "Workspace DeX", "dex"],
        ["Road Trip th\xEAm/xo\xE1/s\u1EEDa/s\u1EAFp x\u1EBFp ch\u1EB7ng, cu\u1ED9n danh s\xE1ch", "Road Trip", "rt"],
        ["Canh gi\u1EEFa c\xE1c \xF4 Road Trip; ch\u1EEF d\xE0i t\u1EF1 xu\u1ED1ng d\xF2ng", "Road Trip", "rt"],
        ["Qu\xE3ng \u0111\u01B0\u1EDDng sinh \u0111\u1ED9ng: Con \u0110\u01B0\u1EDDng / B\u1EA3n \u0110\u1ED3", "Road Trip", "rt"],
        ["Ch\u1EB7ng v\u1EC1: \u0111\u1EA3o ng\u01B0\u1EE3c ch\u1EB7ng \u0111i + th\xEAm t\u1EEB danh s\xE1ch", "Road Trip \u2192 Ch\u1EB7ng V\u1EC1", "rt"],
        ["T\xECm Ch\u1ED7 G\u1EA7n \u0110\xE2y (x\u0103ng, McDonald\u2019s, Hungry Jack\u2019s\u2026)", "T\xECm Ch\u1ED7", "search"],
        ["Road Trip + B\u1EA3n \u0110\u1ED3 chia m\xE0n h\xECnh, thanh k\xE9o gi\xE3n", "Road Trip + B\u1EA3n \u0110\u1ED3", "split"],
        ["T\u1EA1o Workspace: ch\u1ECDn m\u1ECDi app trong m\xE1y + widget, t\u1ED1i \u0111a 3 \xF4", "M\xE0n H\xECnh Ch\xEDnh \u2192 + T\u1EA1o Workspace", "create"],
        ["Km tr\xEAn Con \u0110\u01B0\u1EDDng / B\u1EA3n \u0110\u1ED3: c\xF2n bao xa, gi\u1EEFa ch\u1EB7ng, c\u1ECDc km", "Road Trip", "rt"],
        ["Ph\xF3ng to / thu nh\u1ECF: + \u2212, Theo Xe, C\u1EA3 Chuy\u1EBFn, k\xE9o, ch\u1EA1m 2 l\u1EA7n", "Road Trip", "rt"],
        ["H\xECnh \u0111\u1EA1i di\u1EC7n cho t\u1EEBng ch\u1EB7ng + th\u1EBB chi ti\u1EBFt", "Road Trip (b\u1EA5m t\xEAn ch\u1EB7ng)", "rt"],
        ["Thanh tr\xEAn c\xF9ng: T\xECm Ch\u1ED7 sau Workspace DeX", "Thanh b\u1EA3n m\u1EABu", "search"],
        ["T\xECm Ch\u1ED7: logo t\u1EEBng h\xE3ng (app t\u1EF1 l\u1EA5y khi build)", "T\xECm Ch\u1ED7", "search"],
        ["Cu\u1ED9c g\u1ECDi \u0111\u1EBFn: thanh m\u1ECFng, kh\xF4ng \u0111\u1ECDc t\xEAn, ri\xEAng t\u01B0", 'B\u1EA5m "G\u1ECDi Th\u1EED"', "call"],
        ["Tab Li\xEAn L\u1EA1c: l\u1ECBch s\u1EED cu\u1ED9c g\u1ECDi + tin nh\u1EAFn c\xE1c app", "Li\xEAn L\u1EA1c", "contacts"],
        ["S\u1ED1 t\u1ED1c \u0111\u1ED9: m\xE0u theo gi\u1EDBi h\u1EA1n, v\xF2ng cung, 7 ki\u1EC3u, c\u1EE1 s\u1ED1", "M\xE0n H\xECnh Ch\xEDnh / C\xE0i \u0110\u1EB7t \u2192 Giao Di\u1EC7n", "home"],
        ["Canh gi\u1EEFa con s\u1ED1 trong \u0111\u1ED3ng h\u1ED3 t\u1ED1c \u0111\u1ED9", "M\xE0n H\xECnh Ch\xEDnh", "home"],
        ["Gi\u1EDBi h\u1EA1n t\u1ED1c \u0111\u1ED9 theo v\xF9ng + b\xE1o tr\u01B0\u1EDBc + bi\u1EC3n to khi \u0111\u1ED5i", "M\xE0n H\xECnh Ch\xEDnh \u2192 \xF4 B\u1EA3n M\u1EABu", "home"],
        ["Thanh nh\u1EA1c: n\xFAt \u2630 ch\u1ECDn b\xE0i, \u0111\u1ED5i Nh\u1EA1c / Radio / Podcast, radio theo v\xF9ng", "M\xE0n H\xECnh Ch\xEDnh \u2192 thanh nh\u1EA1c", "panel"],
        ["Tr\u1EE3 l\xFD gi\u1ECDng n\xF3i (l\xE0m chung \u0111\u1EE3t n\xE0y) \u2014 l\u1EC7nh m\u1EABu", "M\xE0n H\xECnh Ch\xEDnh \u2192 n\xFAt mic", "voice"]
      ];
      const items = IT.map(([t, where, scr], i) => ({ n: i + 1, t, where, go: () => {
        if (i === 0) {
          self.setState({ listOpen: false });
          self.startBoot();
          return;
        }
        if (scr === "create") {
          self.setState({ scr: "home", listOpen: false, createOpen: true });
          return;
        }
        if (scr === "call") {
          self.setState({ scr: "home", listOpen: false, call: "ring" });
          return;
        }
        if (i === 16) {
          self.setState({ scr, leg: "back", listOpen: false });
          return;
        }
        if (i === 27) {
          self.setState({ scr: "home", listOpen: false, drive: true });
          return;
        }
        if (scr === "panel") {
          self.setState({ scr: "home", listOpen: false, mpOpen: true, panelAt: Date.now() });
          return;
        }
        if (scr === "voice") {
          self.setState({ scr: "home", listOpen: false, va: true });
          return;
        }
        go(scr)();
      } }));
      const PL = LV.place || null;
      const street = APP ? PL && PL.street ? PL.street : LV.gps === false ? "\u0110ang d\xF2 GPS\u2026" : "\u0110ang d\xF2 v\u1ECB tr\xED\u2026" : "Western Hwy (A8)";
      const devList = APP ? [{ l: "\u0110i\u1EC7n tho\u1EA1i " + ((LV.bat && LV.bat.level) != null ? LV.bat.level + "%" : "--") + (LV.bat && LV.bat.charging ? " \u26A1" : ""), c: LV.bat && LV.bat.hot ? "#FF9A9E" : LV.bat && LV.bat.level < 20 ? "#FFC46B" : "#7BD88F" }].concat((LV.devs || []).slice(0, 1).map((dv) => ({ l: dv.name + (dv.level != null && dv.level >= 0 ? " " + dv.level + "%" : ""), c: "#CFE6EE" }))) : [{ l: "\u0110i\u1EC7n tho\u1EA1i 82% \u26A1", c: "#7BD88F" }, { l: "Tai nghe 60%", c: "#CFE6EE" }];
      const WX = APP ? LV.wx || null : { temp: 14, code: "rain", rain: 70, hi: 17, lo: 9, wind: 18 };
      const wk = WX ? WX.code === "clear" && (d.getHours() < 6 || d.getHours() >= 19) ? "night" : WX.code || "cloudy" : "cloudy";
      const wi = WXI[wk] || WXI.cloudy;
      const wxi = { d1: wi[0], c1: wi[1], d2: wi[2], f2: wi[3], s2: wi[4] };
      const wxT = WX && WX.temp != null ? Math.round(WX.temp) + "\xB0" : "--\xB0";
      const wxL1 = WX ? (WXVI[wk] || "") + (WX.rain != null ? " " + Math.round(WX.rain) + "%" : "") + (WX.hi != null ? " \xB7 \u2191" + Math.round(WX.hi) + "\xB0 \u2193" + Math.round(WX.lo) + "\xB0" : "") : "\u0110ang l\u1EA5y th\u1EDDi ti\u1EBFt\u2026";
      const wxL2 = WX && WX.wind != null ? "Gi\xF3 " + Math.round(WX.wind) + " km/g" : "";
      const THEMEMAP = { outback: "au", coast: "au", melb: "au", neonau: "neon", dandenong: "au", yarra: "au", snow: "au", sgold: "retro", synth: "neon", cyber: "neon", minimal: "minimal", rally: "led" };
      const ck = C.clkAuto ? THEMEMAP[LV.theme] || "neon" : C.clkStyle;
      const cs = CLK[ck] || CLK.neon;
      const H = d.getHours(), M = d.getMinutes();
      const h12 = C.clock === "12";
      const hh = h12 ? String(H % 12 || 12) : p2(H), mm = p2(M);
      const digs = (hh.length === 1 ? " " + hh : hh) + mm;
      const flipAnim = !drive;
      const mkCards = (big) => digs.split("").map((ch2, i) => ({ d: ch2.trim(), gap: i === 2 ? big ? 26 : 6 : 0, cls: flipAnim ? Number(ch2) % 2 ? "fa" : "fb" : "" }));
      const lun = C.clkLunar ? solar2lunar(d.getDate(), d.getMonth() + 1, d.getFullYear()) : null;
      const lunTxt = lun ? "\xC2L " + lun[0] + "/" + lun[1] + (lun[0] === 15 ? " \xB7 R\u1EB1m" : lun[0] === 1 ? lun[1] === 1 ? " \xB7 T\u1EBFt" : " \xB7 M\xF9ng 1" : "") : "";
      const nearSA = APP ? !!(LV.trip && LV.trip.km >= 360) : isGo ? pos >= 360 : pos <= 367;
      const line2 = [C.clkDual && nearSA ? "SA " + tzTime(d, "Australia/Adelaide") + " \xB7 VIC " + tzTime(d, "Australia/Melbourne") : "", C.clkVN ? "VN " + tzTime(d, "Asia/Ho_Chi_Minh") : ""].filter(Boolean).join(" \xB7 ");
      const night = H >= 20 || H < 6;
      const AP = LV.appt || null;
      const apMin = AP ? Math.round((AP.start - S.now) / 6e4) : 0;
      const clk = {
        flip: ck === "flip",
        analog: ck === "analog",
        text: ck !== "flip" && ck !== "analog",
        cards: mkCards(false),
        h: hh,
        m: mm,
        ap: h12 ? H < 12 ? "SA" : "CH" : "",
        font: cs.font || "'Chakra Petch', sans-serif",
        fw: cs.fw || 700,
        fst: cs.fst || "normal",
        c: cs.c || "#CFF6FF",
        glow: cs.glow || "none",
        ls: cs.ls || "0px",
        colonOp: C.clkBlink && !drive && d.getSeconds() % 2 ? 0.25 : 1,
        hx: (20 + 9 * Math.sin((H % 12 + M / 60) / 12 * 2 * Math.PI)).toFixed(1),
        hy: (20 - 9 * Math.cos((H % 12 + M / 60) / 12 * 2 * Math.PI)).toFixed(1),
        mx: (20 + 14 * Math.sin(M / 60 * 2 * Math.PI)).toFixed(1),
        my: (20 - 14 * Math.cos(M / 60 * 2 * Math.PI)).toFixed(1),
        line1On: C.clkDate || !!lunTxt,
        line1: [C.clkDate ? THU[d.getDay()] + " " + d.getDate() + "/" + (d.getMonth() + 1) : "", lunTxt].filter(Boolean).join(" \xB7 "),
        line2On: !!line2,
        line2,
        line2C: "#FFD08A",
        filter: night ? "sepia(0.35) brightness(0.85)" : "none",
        aria: "\u0110\u1ED3ng h\u1ED3 " + hh + ":" + mm + " \u2014 ch\u1EA1m \u0111\u1EC3 ph\xF3ng to",
        tap: () => self.setState({ clkBig: true }),
        closeBig: () => self.setState({ clkBig: false, parkedAt: S.now }),
        big: !nar && (S.clkBig || APP && !drive && C.autoBig !== false && LV.parkedMin >= 10 && S.scr === "home" && !(S.parkedAt && S.now - S.parkedAt < 6e5)),
        bigCards: mkCards(true),
        bigDate: THU[d.getDay()] + ", " + d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + (lunTxt ? "  \xB7  " + lunTxt : ""),
        bigSub: (WX ? wxT + " " + (WXVI[wk] || "") : "") + (line2 ? "   \xB7   " + line2 : ""),
        appt: !!AP && apMin > -15 && apMin < 180,
        apptL: AP ? "H\u1EB9n " + p2(new Date(AP.start).getHours()) + ":" + p2(new Date(AP.start).getMinutes()) + (apMin > 0 ? " \xB7 c\xF2n " + apMin + " ph" : " \xB7 t\u1EDBi gi\u1EDD") : "",
        apptNav: () => {
          if (AP && AP.loc) tcn("nav", AP.loc);
          else self.toast(AP ? AP.title + " (l\u1ECBch h\u1EB9n kh\xF4ng c\xF3 \u0111\u1ECBa ch\u1EC9)" : "");
        }
      };
      const openTheme = () => {
        if (window.__tc) window.__tc.setState({ themeOpen: true });
        else self.toast("Ch\u1ECDn giao di\u1EC7n \u1EDF b\u1EA3ng 1");
      };
      const OB = LV.obd || null;
      const engT = APP ? OB && OB.coolant != null ? Math.round(OB.coolant) + "\xB0" : "--" : "88\xB0";
      const voltT = APP ? OB && OB.volt != null ? OB.volt.toFixed(1) + " V" : "-- V" : "14.1 V";
      const nxS = list[nextIdx];
      const upL = APP && LT && nxS ? "CH\u1EB6NG GH\xC9 K\u1EBE" : "S\u1EAEP T\u1EDAI";
      const upMain = APP && LT && nxS ? nxS.name + " \xB7 " + (nxS.km - pos) + " km" : APP ? street : "Qu\u1EB9o tr\xE1i \xB7 300 m";
      const cp = { next: nxS ? nxS.name : "\u2014", nextSub: nxS ? "c\xF2n " + (nxS.km - pos) + " km \xB7 d\u1EF1 ki\u1EBFn " + fmt(timeAt(nxS.km), inSA(nxS.km)) + (inSA(nxS.km) ? " gi\u1EDD SA" : "") : "", left: TOTAL - pos + " km", eta: fmt(endMin, isGo), rest: restLeft <= 20 ? "Ngh\u1EC9 ch\xE2n sau " + restLeft + " ph\xFAt n\u1EEFa" : "Ngh\u1EC9 sau " + String(C.rest).replace(".", ",") + " gi\u1EDD l\xE1i li\xEAn t\u1EE5c", full: () => tcn("split", "off") };
      const saveWs = () => {
        if (!S.wsSel.length) {
          self.toast("Ch\u1ECDn \xEDt nh\u1EA5t 1 app");
          return;
        }
        const w = { name: (S.wsName || "").trim() || "Workspace " + (S.wsList.length + 1), apps: S.wsSel.slice(), rt: S.rtCheck };
        self.save({ wsList: S.wsList.concat([w]), createOpen: false, wsName: "", wsSel: [] });
        self.toast("\u0110\xE3 l\u01B0u Workspace " + w.name);
      };
      const addHere = () => {
        if (!APP) {
          self.setState({ dlg: null });
          return;
        }
        if (LV.lat == null) {
          self.setState({ addMsg: "Ch\u01B0a c\xF3 GPS" });
          return;
        }
        addPlaceStop({ name: PL && PL.street || "Ch\u1ED7 \u0111\xE3 l\u01B0u", addr: PL ? [PL.suburb, PL.state].filter(Boolean).join(" ") : "", lat: LV.lat, lon: LV.lon, k: "rest" });
        self.setState({ dlg: null });
      };
      const addFind = () => {
        if (!APP) {
          self.setState({ dlg: null });
          return;
        }
        const q2 = (S.addLink || S.addQ || "").trim();
        if (!q2) {
          self.setState({ addMsg: "G\xF5 t\xEAn/\u0111\u1ECBa ch\u1EC9 ho\u1EB7c d\xE1n link" });
          return;
        }
        self.setState({ addMsg: "\u0110ang t\xECm\u2026" });
        window.__geoCb = (r) => {
          if (!r || r.lat == null) {
            self.setState({ addMsg: "Kh\xF4ng t\xECm th\u1EA5y ch\u1ED7 n\xE0y" });
            return;
          }
          addPlaceStop({ name: r.name || q2, addr: r.addr || "", lat: r.lat, lon: r.lon, k: "food" });
          self.setState({ dlg: null, addQ: "", addLink: "", addMsg: "" });
        };
        tcn("geocode", q2);
      };
      const delP = S.delId ? ALLP[S.delId] : null;
      return {
        verL: window.TC_VERSION || "0.9.x-beta",
        rootBg: APP ? "transparent" : "#03111C",
        opaqueBg: APP && (nar || S.scr !== "home"),
        clock,
        scrBtns,
        zones,
        sb,
        mp,
        va,
        clk,
        openTheme,
        street,
        devList,
        wxi,
        wxT,
        wxL1,
        wxL2,
        engT,
        voltT,
        upL,
        upMain,
        cp,
        searchNote,
        fuelNote,
        unreadN: APP ? (S.msgs || []).reduce((a, m) => a + (m[5] || 0), 0) + (LV.missed || 0) : 3,
        wsAny: S.wsList.length > 0,
        wsEmpty: !S.wsList.length,
        wsCards,
        wsName: S.wsName,
        setWsName: (e) => self.setState({ wsName: e.target.value }),
        saveWs,
        exitHard: () => {
          self.setState({ exitOpen: false });
          tcn("exit", "hard");
        },
        exitBg: () => {
          self.setState({ exitOpen: false });
          tcn("exit", "bg");
        },
        addQ: S.addQ,
        setAddQ: (e) => self.setState({ addQ: e.target.value, addLink: "" }),
        addLink: S.addLink,
        setAddLink: (e) => self.setState({ addLink: e.target.value }),
        addHere,
        addFind,
        addMsg: S.addMsg,
        srcL: S.src === "music" ? "NH\u1EA0C" : S.src === "radio" ? "RADIO" : "PODCAST",
        cycleSrc: () => {
          const n = { music: "radio", radio: "podcast", podcast: "music" }[S.src];
          self.setState({ src: n, mpTab: TABS[n][0][0], nowT: "", nowS: "" });
        },
        togglePanel: () => self.setState({ mpOpen: !mpOpen, panelAt: Date.now() }),
        panelExp: mpOpen ? "true" : "false",
        startListen: () => {
          self.setState({ va: true, vaHeard: "", vaHint: "" });
          tcn("voice", "start");
        },
        isHome: !nar && S.scr === "home",
        isSettings: !nar && S.scr === "settings",
        isRt: !nar && S.scr === "rt",
        isSplit: !nar && S.scr === "split",
        isSearch: !nar && S.scr === "search",
        isDex: !nar && S.scr === "dex",
        isContacts: !nar && S.scr === "contacts",
        isCompact: nar,
        appTop: APP ? 0 : 40,
        appW: nar ? LV.vw || 420 : 1280,
        appH: nar ? LV.vh || 720 : APP ? 720 : 680,
        appBg: APP ? "transparent" : "linear-gradient(180deg,#020A12 0%,#06192A 55%,#0B2436 100%)",
        touch: () => {
          if (!S.dragging && !S.panning) self.setState({ last: Date.now() });
        },
        drive,
        drivePressed: drive ? "true" : "false",
        driveBg: drive ? "#7BD88F" : "#0D2C40",
        driveFg: drive ? "#03111C" : "#CFF6FF",
        driveLabel: drive ? "\u0110ang Ch\u1EA1y" : "\u0110\u1EADu Xe",
        toggleDrive: () => self.setState({ drive: !S.drive, statsOpen: false }),
        spdVal: S.speed,
        parkedNow: !drive,
        setSpeed: (e) => self.setState({ speed: Number(e.target.value) }),
        spdHint: drive ? S.speed + " km/g" : 'b\u1EA5m "\u0110\u1EADu Xe" tr\xEAn thanh b\u1EA3n m\u1EABu \u0111\u1EC3 ch\u1EA1y',
        toggleGps: () => self.setState({ noGps: !S.noGps }),
        gpsPressed: S.noGps ? "true" : "false",
        gpsBg: S.noGps ? "#FF9A9E" : "#0D2C40",
        gpsFg: S.noGps ? "#2A0A0A" : "#CFE6EE",
        tint: drive && C.rainFx ? "rgba(10,40,70,0.35)" : "transparent",
        rainOn,
        rainDriveNote: drive && C.rainFx,
        drops: DROPS,
        glass: GLASS,
        opBottom,
        opMusic,
        dimmedAny: idle,
        musicW: drive ? 560 : 640,
        togglePlay: () => {
          if (APP) {
            if (S.src === "radio") tcn("radio", playing ? "stop" : JSON.stringify({ url: LV.radio && LV.radio.url || "", name: LV.radio && LV.radio.name || "" }));
            else tcn("media", "toggle");
          } else self.setState({ playing: !S.playing, perm: S.playing ? S.perm : true });
        },
        playLabel: playing ? "D\u1EEBng" : "Ph\xE1t",
        prevF: () => {
          if (APP) tcn(S.src === "radio" ? "radio" : "media", S.src === "radio" ? "prev" : "prev");
        },
        nextF: () => {
          if (APP) tcn(S.src === "radio" ? "radio" : "media", "next");
        },
        playIcon: playing && !inCall ? "M7 5h4v14H7zM13 5h4v14h-4z" : "M8 5l11 7-11 7z",
        songTitle: APP ? S.src === "radio" ? LV.radio && LV.radio.name || DEF_NOW.radio[2] : MD && MD.title || DEF_NOW.music[2] : S.playing ? S.nowT || DEF_NOW[S.src][0] : DEF_NOW[S.src][2],
        songSub: inCall && playing ? "T\u1EA1m d\u1EEBng v\xEC c\xF3 cu\u1ED9c g\u1ECDi" : APP ? S.src === "radio" ? playing ? "Radio \xB7 tr\u1EF1c ti\u1EBFp" : LV.radio && LV.radio.err || "" : MD ? [MD.artist, MD.app].filter(Boolean).join(" \xB7 ") : PM.notif ? "M\u1EDF app nh\u1EA1c r\u1ED3i b\u1EA5m ph\xE1t" : "" : S.playing ? S.nowS || DEF_NOW[S.src][1] : S.perm ? "B\u1EA5m \u25B6 \u0111\u1EC3 ph\xE1t" : "",
        showWave,
        waveBars,
        prog: APP ? MD && MD.pos != null && MD.dur ? Math.round(MD.pos / MD.dur * 100) : 0 : 38,
        needPerm: APP ? S.src === "music" && !PM.notif : !S.perm && !S.playing,
        showSkip: playing,
        grantPerm: () => {
          if (APP) tcn("perm", "notif");
          else self.setState({ perm: true });
        },
        goSettings: go("settings"),
        goHome: go("home"),
        goRt: go("rt"),
        goSplit: () => {
          go("split")();
          if (APP) tcn("split", JSON.stringify({ frac: S.split, side: C.mapSide, map: C.mapApp }));
        },
        goSearch: go("search"),
        goContacts: () => {
          go("contacts")();
          if (APP) {
            tcn("calllog");
            tcn("msgs");
          }
        },
        togglePrivacy: () => self.setS("privacy", !priv),
        privPressed: priv ? "true" : "false",
        privC: priv ? "#7BD88F" : "#CFF6FF",
        privRing: priv ? "inset 0 0 0 2px #7BD88F" : "inset 0 0 0 1px rgba(95,212,240,0.55)",
        privIcon: priv ? "M9 12l2 2 4-4" : "M12 8v5M12 16h.01",
        openExit: () => self.setState({ exitOpen: true }),
        closeExit: () => self.setState({ exitOpen: false }),
        exitOpen: S.exitOpen,
        openCreate: () => {
          self.setState({ createOpen: true, wsSel: [], wsName: "" });
          if (APP && !S.apps) tcn("apps");
        },
        closeCreate: () => self.setState({ createOpen: false }),
        createOpen: S.createOpen,
        toggleRtCheck: () => self.setState({ rtCheck: !S.rtCheck }),
        rtCheck: S.rtCheck ? "true" : "false",
        rtCheckBg: S.rtCheck ? "#FBB040" : "transparent",
        rtCheckMark: S.rtCheck ? "\u2713" : "",
        ws,
        groups,
        grpTitle: G.label,
        grpDesc: G.desc,
        rows,
        rt,
        pos,
        setPos: (e) => self.setState({ pos: Number(e.target.value) }),
        openAdd: () => self.setState({ dlg: "add" }),
        openPick: () => self.setState({ dlg: "pick" }),
        closeDlg: () => self.setState({ dlg: null, delId: null, stopId: null }),
        addOpen: S.dlg === "add",
        pickOpen: S.dlg === "pick",
        delOpen: S.dlg === "del",
        stopOpen: S.dlg === "stop",
        replyOpen: S.dlg === "reply",
        delName: delP ? delP.name : "",
        sd,
        rp,
        confirmDel: () => {
          const arr = (isGo ? S.goList : S.backList).filter((x) => x !== S.delId);
          self.save(Object.assign({ dlg: null, delId: null }, isGo ? { goList: arr } : { backList: arr }));
        },
        saved,
        legName: isGo ? "ch\u1EB7ng \u0111i" : "ch\u1EB7ng v\u1EC1",
        sp,
        dragStart: (e) => {
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch (x) {
          }
          self.setState({ dragging: true });
        },
        dragMove: (e) => {
          if (!S.dragging) return;
          const r = e.currentTarget.getBoundingClientRect();
          let f = (e.clientX - r.left) / r.width;
          if (C.mapSide === "left") f = 1 - f;
          self.setState({ split: Math.min(0.75, Math.max(0.05, f)) });
        },
        dragEnd: () => {
          if (!S.dragging) return;
          self.setState({ dragging: false, lastSplit: S.split, split: snapTo(S.split) });
        },
        dragSwap: () => self.setState({ split: Math.abs(S.lastSplit - S.split) < 0.01 ? S.split === 0.5 ? 1 / 3 : 0.5 : S.lastSplit, lastSplit: S.split }),
        swapSide: () => self.setS("mapSide", C.mapSide === "left" ? "right" : "left"),
        cats,
        catTitle,
        results,
        searchPh: drive ? 'Kho\xE1 g\xF5 khi xe ch\u1EA1y \u2014 b\u1EA5m n\xFAt b\xEAn d\u01B0\u1EDBi ho\u1EB7c n\xF3i "Hey Tom, t\xECm\u2026"' : "G\xF5 t\xEAn ho\u1EB7c \u0111\u1ECBa ch\u1EC9 (vd: Hungry Jack\u2019s Horsham)",
        searchBg: drive ? "#0A1822" : "#0D2C40",
        dx,
        dexApps: () => self.setState({ dexTwo: !S.dexTwo }),
        dexTask: () => self.setState({ dexTask: !S.dexTask }),
        cb,
        simCall: () => self.setState({ call: "ring", mute: false }),
        toastOn,
        toastText: S.toast,
        ct,
        aboutNote: C.autoBoot ? "T\u1EF1 v\xE0o M\xE0n H\xECnh Ch\xEDnh sau 4 gi\xE2y \u2014 kh\xF4ng c\u1EA7n b\u1EA5m" : "T\u1EF1 chuy\u1EC3n \u0111ang t\u1EAFt (C\xE0i \u0110\u1EB7t \u2192 Chung) \u2014 b\u1EA5m V\xE0o Ngay",
        bootSplash: S.boot === "splash",
        bootAbout: S.boot === "about",
        skipBoot: () => {
          clearTimeout(self.b2);
          self.setState({ boot: null, scr: "home", last: Date.now() });
        },
        restart: () => self.startBoot(),
        listOpen: S.listOpen,
        openList: () => self.setState({ listOpen: true }),
        closeList: () => self.setState({ listOpen: false }),
        items
      };
    }
  }
  return Component;
}();
window.__APP_TPL = `
<helmet>
<style>
body{margin:0}
a{color:#5FD4F0}a:hover{color:#CFF6FF}
.pnl{background:rgba(3,17,28,0.82);box-shadow:inset 0 0 0 1px rgba(95,212,240,0.55);clip-path:polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)}
.btn{border:0;cursor:pointer;font-family:inherit;color:#E8F1F5;background:rgba(3,17,28,0.85);box-shadow:inset 0 0 0 1px rgba(95,212,240,0.55);clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700;font-size:14px;padding:0 14px;height:44px;flex-shrink:0}
.btn:hover{filter:brightness(1.25)}
.btn-o{background:#FBB040;color:#2A1A00;box-shadow:0 0 14px rgba(251,176,64,0.45)}
.btn-r{background:#5A1418;color:#FFD9DB;box-shadow:inset 0 0 0 1px #E5484D}
.pill{border:0;cursor:pointer;font-family:inherit;height:34px;padding:0 12px;border-radius:9px;font-size:13px;font-weight:700;flex-shrink:0}
.lbl{font-size:11px;letter-spacing:1.2px;color:#8FC3D3;font-weight:700}
.drop{position:absolute;top:0;width:3px;height:3px;border-radius:50%;background:rgba(207,246,255,0.5);animation:tf-drop linear infinite}
@keyframes tf-drop{from{transform:translateY(-10px)}to{transform:translateY(690px)}}
.glass{position:absolute;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,0.5),rgba(160,210,230,0.12) 60%,rgba(255,255,255,0) 72%);animation:tf-glass ease-in infinite}
@keyframes tf-glass{0%{transform:translateY(0);opacity:0}15%{opacity:0.85}100%{transform:translateY(150px);opacity:0}}
.wv{transform-origin:50% 100%;animation:tf-wv 1.1s ease-in-out infinite alternate}
@keyframes tf-wv{from{transform:scaleY(0.25)}to{transform:scaleY(1)}}
.nxt{animation:tf-nxt 2.6s ease-in-out infinite}
@keyframes tf-nxt{0%,100%{box-shadow:0 0 0 2px #FBB040}50%{box-shadow:0 0 0 6px rgba(251,176,64,0.22)}}
.bootbar{animation:tf-bar 2.6s linear both}
.aboutbar{animation:tf-bar 4s linear both}
@keyframes tf-bar{from{width:0}to{width:100%}}
.fadein{animation:tf-fade .5s ease-out both}
@keyframes tf-fade{from{opacity:0}to{opacity:1}}
.dimbox{transition:opacity .6s ease}
.scrl{overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(95,212,240,0.6) transparent}
.scrl::-webkit-scrollbar{width:5px}.scrl::-webkit-scrollbar-thumb{background:rgba(95,212,240,0.6);border-radius:3px}
input[type=range]{accent-color:#FBB040}
.tnum{font-variant-numeric:tabular-nums}
.orb{animation:tf-orb 1.6s ease-in-out infinite}
@keyframes tf-orb{0%,100%{transform:scale(1);opacity:.45}50%{transform:scale(1.3);opacity:.95}}
.bigsign{animation:tf-pop .35s ease-out both}
@keyframes tf-pop{from{transform:translate(-50%,-50%) scale(.6);opacity:0}to{transform:translate(-50%,-50%) scale(1);opacity:1}}
.fcard{position:relative;display:inline-flex;align-items:center;justify-content:center;width:24px;height:34px;border-radius:5px;background:linear-gradient(180deg,#1C2B36 0 49%,#0B141B 51% 100%);color:#F3F7FA;font-size:24px;font-weight:700;font-family:'Chakra Petch',sans-serif;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06)}
.fcard::after{content:'';position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(0,0,0,0.7)}
.fbig{width:120px;height:170px;font-size:120px;border-radius:14px}
.fa{animation:tf-fa .45s ease-out}.fb{animation:tf-fb .45s ease-out}
@keyframes tf-fa{from{transform:perspective(200px) rotateX(-80deg)}to{transform:none}}
@keyframes tf-fb{from{transform:perspective(200px) rotateX(-80deg)}to{transform:none}}
.ph{background:linear-gradient(135deg,#2B4A5E,#132A38);display:flex;align-items:center;justify-content:center;color:#8FC3D3}
</style>
</helmet>
<div onPointerDown="{{touch}}" style="position: relative; width: 1280px; height: 720px; overflow: hidden; background: {{rootBg}}; color: #E8F1F5; font-family: 'Chakra Petch', 'Segoe UI', system-ui, sans-serif">

  <!-- ===== thanh demo (kh\xF4ng thu\u1ED9c app) ===== -->
  <nav data-demo="1" aria-label="Ch\u1ECDn m\xE0n h\xECnh b\u1EA3n m\u1EABu" style="position: absolute; left: 0; right: 0; top: 0; height: 40px; display: flex; align-items: center; gap: 6px; padding: 0 10px; background: #0A1E2C; border-bottom: 1px solid rgba(95,212,240,0.35); z-index: 50">
    <span style="font-size: 12px; font-weight: 700; color: #FBB040; letter-spacing: 1px; margin-right: 4px">B\u1EA2N M\u1EAAU</span>
    <sc-for list="{{scrBtns}}" as="b" hint-placeholder-count="7"><button onClick="{{b.pick}}" aria-pressed="{{b.on}}" class="pill" style="height: 28px; font-size: 12px; background: {{b.bg}}; color: {{b.fg}}">{{b.label}}</button></sc-for>
    <span style="margin-left: auto"></span>
    <button onClick="{{toggleDrive}}" aria-pressed="{{drivePressed}}" class="pill" style="height: 28px; font-size: 12px; background: {{driveBg}}; color: {{driveFg}}">{{driveLabel}}</button>
    <button onClick="{{simCall}}" class="pill" style="height: 28px; font-size: 12px; background: #0D2C40; color: #CFF6FF">G\u1ECDi Th\u1EED</button>
    <button onClick="{{openList}}" class="pill" style="height: 28px; font-size: 12px; background: #0D2C40; color: #CFF6FF">Danh S\xE1ch 32 M\u1EE5c</button>
    <button onClick="{{restart}}" class="pill" style="height: 28px; font-size: 12px; background: #0D2C40; color: #CFF6FF">M\u1EDF L\u1EA1i App</button>
  </nav>

  <!-- ===== m\xE0n h\xECnh app (1280 x 680) ===== -->
  <div style="position: absolute; left: 0; top: {{appTop}}px; width: {{appW}}px; height: {{appH}}px; overflow: hidden; background: {{appBg}}">

    <sc-if value="{{opaqueBg}}" hint-placeholder-val="{{ false }}"><div aria-hidden="true" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: radial-gradient(ellipse at 70% 0%, #0B2C40, #020A12 70%)"></div></sc-if>
    <!-- ========== 1. M\xC0N H\xCCNH CH\xCDNH ========== -->
    <sc-if value="{{isHome}}" hint-placeholder-val="{{ true }}">
      <svg data-demo="1" aria-hidden="true" viewBox="0 0 1280 680" width="1280" height="680" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: block">
        <path d="M0 330 L1280 330" stroke="rgba(95,212,240,0.25)" stroke-width="1"></path>
        <path d="M640 330 L-200 680 M640 330 L1480 680" stroke="#FBB040" stroke-width="3" opacity="0.55"></path>
        <path d="M640 330 L640 680" stroke="#5FD4F0" stroke-width="2" stroke-dasharray="26 22" opacity="0.4"></path>
        <path d="M0 330 L120 300 L210 312 L300 284 L380 300 L470 276 L560 296 L640 288 L740 300 L820 280 L930 298 L1030 276 L1130 300 L1280 286 L1280 330 Z" fill="#071A28" stroke="rgba(95,212,240,0.4)" stroke-width="1"></path>
      </svg>
      <div aria-hidden="true" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: {{tint}}; pointer-events: none"></div>

      <!-- m\u01B0a: h\u1EA1t nh\u1ECF li ti + gi\u1ECDt \u0111\u1ECDng tr\xEAn k\xEDnh -->
      <sc-if value="{{rainOn}}" hint-placeholder-val="{{ true }}">
        <div aria-hidden="true" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; pointer-events: none">
          <sc-for list="{{drops}}" as="d" hint-placeholder-count="40"><span class="drop" style="left: {{d.x}}px; animation-duration: {{d.dur}}s; animation-delay: {{d.del}}s; opacity: {{d.op}}"></span></sc-for>
          <sc-for list="{{glass}}" as="g" hint-placeholder-count="12"><span class="glass" style="left: {{g.x}}px; top: {{g.y}}px; width: {{g.s}}px; height: {{g.s}}px; animation-duration: {{g.dur}}s; animation-delay: {{g.del}}s"></span></sc-for>
        </div>
      </sc-if>

      <!-- thanh tr\xEAn c\xF9ng -->
      <header style="position: absolute; left: 20px; right: 20px; top: 14px; display: flex; align-items: center; gap: 10px">
        <div style="display: flex; flex-direction: column; gap: 2px; flex-shrink: 0">
          <div style="font-size: 28px; font-weight: 700; line-height: 1; font-family: Bahnschrift, 'Barlow Semi Condensed', sans-serif; text-shadow: 0 0 12px rgba(95,212,240,0.6)"><span style="color: #48B0C8">TOM'S</span> <span style="position: relative; display: inline-block; color: #FBB040">CAR<svg aria-hidden="true" viewBox="0 10 300 90" style="position: absolute; left: -0.5em; top: -0.56em; width: 2.7em; height: 1.1em; overflow: visible; pointer-events: none"><path d="M12 74 C60 46 104 22 160 20 C204 18 232 30 262 54 C236 36 206 28 162 30 C110 32 66 52 12 74 Z" fill="#FBB040"></path><path d="M96 58 C120 40 150 34 178 34 C204 34 222 42 236 54 C214 48 190 46 166 46 C140 46 118 50 96 58 Z" fill="#FBB040"></path><path d="M176 58 C214 54 256 56 290 64 C296 66 296 71 290 71 C254 63 216 60 176 58 Z" fill="#FBB040"></path><path d="M296 76 C292 82 286 86 276 88 C282 84 288 80 296 76 Z M200 86 C176 90 150 90 128 87 C150 87 176 87 200 86 Z M54 86 C40 86 26 82 16 76 C28 80 40 83 54 86 Z" fill="#FBB040"></path><path d="M58 86 C62 70 76 62 92 62 C108 62 120 72 124 86 C116 76 106 70 92 70 C78 70 66 76 58 86 Z" fill="#FBB040"></path><path d="M206 86 C210 70 224 62 240 62 C256 62 268 72 272 86 C264 76 254 70 240 70 C226 70 214 76 206 86 Z" fill="#FBB040"></path><path d="M281 63 L291 66 L282 67 Z" fill="#FFE9A8"></path></svg></span></div>
          <div style="font-size: 11px; color: #CFE6EE">Focus On One Thing And Do It Well</div>
        </div>
        <div class="pnl" style="height: 44px; padding: 0 12px; display: flex; flex-direction: column; justify-content: center; flex-shrink: 0">
          <span class="lbl">\u0110ANG CH\u1EA0Y TR\xCAN</span><span style="font-size: 14px; font-weight: 700; max-width: 170px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{street}}</span>
        </div>
        <div class="pnl" role="group" aria-label="Pin thi\u1EBFt b\u1ECB" style="height: 44px; padding: 0 12px; display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 700; flex-shrink: 0">
          <sc-for list="{{devList}}" as="dv" hint-placeholder-count="2"><span style="color: {{dv.c}}; white-space: nowrap">{{dv.l}}</span></sc-for>
        </div>
        <div class="pnl" style="margin-left: auto; height: 44px; padding: 0 12px; display: flex; align-items: center; gap: 10px; flex-shrink: 1; min-width: 0">
          <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke-linecap="round" aria-hidden="true" style="flex-shrink: 0"><path d="{{wxi.d1}}" fill="{{wxi.c1}}"></path><path d="{{wxi.d2}}" fill="{{wxi.f2}}" stroke="{{wxi.s2}}" stroke-width="2.6"></path></svg>
          <span style="font-size: 18px; font-weight: 700; flex-shrink: 0">{{wxT}}</span>
          <span style="display: flex; flex-direction: column; line-height: 1.2; min-width: 0"><span style="font-size: 12px; color: #CFE6EE; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{wxL1}}</span><span style="font-size: 11px; color: #8FC3D3; white-space: nowrap">{{wxL2}}</span></span>
        </div>
        <button onClick="{{clk.tap}}" aria-label="{{clk.aria}}" class="pnl" style="border: 0; cursor: pointer; font-family: inherit; color: inherit; height: 54px; padding: 0 10px; display: flex; align-items: center; gap: 8px; flex-shrink: 0; background: rgba(3,17,28,0.82); filter: {{clk.filter}}">
          <sc-if value="{{clk.flip}}" hint-placeholder-val="{{ false }}"><span style="display: flex; align-items: center; gap: 2px"><sc-for list="{{clk.cards}}" as="cd" hint-placeholder-count="4"><span class="fcard {{cd.cls}}" style="margin-left: {{cd.gap}}px">{{cd.d}}</span></sc-for></span></sc-if>
          <sc-if value="{{clk.analog}}" hint-placeholder-val="{{ false }}"><svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#0B141B" stroke="#A9C7D4" stroke-width="1.5"></circle><line x1="20" y1="20" x2="{{clk.hx}}" y2="{{clk.hy}}" stroke="#E8F1F5" stroke-width="2.6" stroke-linecap="round"></line><line x1="20" y1="20" x2="{{clk.mx}}" y2="{{clk.my}}" stroke="#FBB040" stroke-width="1.8" stroke-linecap="round"></line><circle cx="20" cy="20" r="2" fill="#FBB040"></circle></svg></sc-if>
          <sc-if value="{{clk.text}}" hint-placeholder-val="{{ true }}"><span class="tnum" style="font-size: 24px; font-weight: {{clk.fw}}; font-family: {{clk.font}}; font-style: {{clk.fst}}; color: {{clk.c}}; text-shadow: {{clk.glow}}; letter-spacing: {{clk.ls}}">{{clk.h}}<span style="opacity: {{clk.colonOp}}">:</span>{{clk.m}}<span style="font-size: 12px; margin-left: 3px">{{clk.ap}}</span></span></sc-if>
          <span style="display: flex; flex-direction: column; line-height: 1.25; text-align: left">
            <sc-if value="{{clk.line1On}}" hint-placeholder-val="{{ true }}"><span style="font-size: 11px; color: #CFE6EE; white-space: nowrap">{{clk.line1}}</span></sc-if>
            <sc-if value="{{clk.line2On}}" hint-placeholder-val="{{ false }}"><span style="font-size: 11px; color: {{clk.line2C}}; white-space: nowrap">{{clk.line2}}</span></sc-if>
          </span>
        </button>
        <sc-if value="{{clk.appt}}" hint-placeholder-val="{{ false }}"><button onClick="{{clk.apptNav}}" class="pill" style="height: 44px; background: rgba(251,176,64,0.16); color: #FFE2A8; box-shadow: inset 0 0 0 1px #FBB040; white-space: nowrap">{{clk.apptL}}</button></sc-if>
        <button onClick="{{togglePrivacy}}" aria-pressed="{{privPressed}}" aria-label="Ch\u1EBF \u0110\u1ED9 Ri\xEAng T\u01B0" title="Ch\u1EBF \u0110\u1ED9 Ri\xEAng T\u01B0" class="btn" style="width: 54px; height: 54px; padding: 0; color: {{privC}}; box-shadow: {{privRing}}"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"></path><path d="{{privIcon}}"></path></svg></button>
        <button onClick="{{openTheme}}" aria-label="Giao Di\u1EC7n" title="Giao Di\u1EC7n" class="btn" style="width: 54px; height: 54px; padding: 0; color: #CFF6FF"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-7.9-9-7.9zM7.5 11.5h.01M10.5 7.5h.01M15.5 7.5h.01"></path></svg></button>
        <button onClick="{{goSettings}}" aria-label="C\xE0i \u0110\u1EB7t" title="C\xE0i \u0110\u1EB7t" class="btn" style="width: 54px; height: 54px; padding: 0; color: #FBB040"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button>
        <button onClick="{{openExit}}" aria-label="Tho\xE1t ch\u01B0\u01A1ng tr\xECnh" title="Tho\xE1t" class="btn" style="width: 54px; height: 54px; padding: 0; color: #FF9A9E"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v9"></path><path d="M18.4 6.6a9 9 0 1 1-12.8 0"></path></svg></button>
      </header>

      <!-- tab + g\u01B0\u01A1ng camera sau (d\u1EDDi xu\u1ED1ng d\u01B0\u1EDBi thanh tr\xEAn) -->
      <div style="position: absolute; left: 20px; top: 86px; display: flex; gap: 6px">
        <button class="pill" style="background: #FBB040; color: #2A1A00">M\xE0n H\xECnh Ch\xEDnh</button>
        <button onClick="{{goRt}}" class="pill" style="background: rgba(3,17,28,0.85); color: #CFE6EE; box-shadow: inset 0 0 0 1px rgba(95,212,240,0.5)">Road Trip</button>
        <button onClick="{{goContacts}}" class="pill" style="background: rgba(3,17,28,0.85); color: #CFE6EE; box-shadow: inset 0 0 0 1px rgba(95,212,240,0.5); display: flex; align-items: center; gap: 6px">Li\xEAn L\u1EA1c<span style="min-width: 18px; height: 18px; border-radius: 9px; background: #FBB040; color: #2A1A00; font-size: 11px; display: inline-flex; align-items: center; justify-content: center">{{unreadN}}</span></button>
        <button onClick="{{goSearch}}" class="pill" style="background: rgba(3,17,28,0.85); color: #CFE6EE; box-shadow: inset 0 0 0 1px rgba(95,212,240,0.5)">T\xECm Ch\u1ED7</button>
      </div>
      <div data-demo="1" class="pnl" style="position: absolute; right: 20px; top: 86px; width: 300px; height: 80px; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg,#0E2A3C,#06141F)">
        <span class="lbl" style="position: absolute; left: 12px; top: 8px">CAM SAU</span>
        <svg width="120" height="44" viewBox="0 0 120 44" aria-hidden="true"><path d="M0 44 L46 8 L74 8 L120 44" fill="none" stroke="#FBB040" stroke-width="2" opacity="0.6"></path><rect x="50" y="18" width="20" height="12" rx="2" fill="#5FD4F0" opacity="0.5"></rect></svg>
      </div>

      <!-- c\u1ED9t Workspace: tr\u1ED1ng l\u1EA7n \u0111\u1EA7u -->
      <section aria-label="Workspace" style="position: absolute; left: 20px; top: 138px; width: 330px; bottom: 100px; display: flex; flex-direction: column; gap: 8px">
        <div style="display: flex; align-items: center; gap: 8px"><span class="lbl" style="flex: 1">WORKSPACE</span><sc-if value="{{wsAny}}" hint-placeholder-val="{{ false }}"><button onClick="{{openCreate}}" class="btn" style="height: 34px; font-size: 12px">+ T\u1EA1o</button></sc-if></div>
        <sc-if value="{{wsEmpty}}" hint-placeholder-val="{{ true }}">
        <div class="pnl" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
          <button onClick="{{openCreate}}" class="btn btn-o" style="height: 64px; font-size: 18px; width: 100%">+ T\u1EA1o Workspace \u0110\u1EA7u Ti\xEAn</button>
          <div style="font-size: 13px; color: #CFE6EE; line-height: 1.55">
            <div>1. Ch\u1ECDn 1, 2 ho\u1EB7c 3 app (Waze, nh\u1EA1c, YouTube\u2026)</div>
            <div>2. \u0110\u1EB7t t\xEAn, ch\u1ECDn c\xF3 m\u1EDF Road Trip kh\xF4ng</div>
            <div>3. L\xEAn xe b\u1EA5m m\u1ED9t c\xE1i l\xE0 c\xE1c app t\u1EF1 m\u1EDF</div>
          </div>
        </div>
        </sc-if>
        <sc-if value="{{wsAny}}" hint-placeholder-val="{{ false }}">
        <div class="scrl" style="flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 8px">
          <sc-for list="{{wsCards}}" as="w" hint-placeholder-count="2">
            <div class="pnl" style="flex-shrink: 0; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px">
              <div style="display: flex; align-items: center; gap: 8px"><span style="flex: 1; min-width: 0; font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{w.name}}</span><sc-if value="{{w.rt}}" hint-placeholder-val="{{ false }}"><span style="font-size: 11px; color: #2A1A00; background: #FBB040; border-radius: 4px; padding: 1px 6px">Road Trip</span></sc-if><button onClick="{{w.del}}" aria-label="Xo\xE1 Workspace" class="btn" style="width: 34px; height: 34px; padding: 0; color: #FF9A9E">\u2715</button></div>
              <div aria-hidden="true" style="display: flex; gap: 4px; height: 30px"><sc-for list="{{w.boxes}}" as="b" hint-placeholder-count="2"><span style="flex: {{b.flex}}; min-width: 0; border-radius: 4px; background: {{b.bg}}; font-size: 11px; display: flex; align-items: center; justify-content: center; white-space: nowrap; overflow: hidden; padding: 0 4px">{{b.name}}</span></sc-for></div>
              <button onClick="{{w.open}}" class="btn btn-o" style="height: 44px">M\u1EDF Workspace</button>
            </div>
          </sc-for>
        </div>
        </sc-if>
      </section>

      <!-- s\u1ED1 t\u1ED1c \u0111\u1ED9 (canh gi\u1EEFa, \u0111\u1ED5i ki\u1EC3u \u0111\u01B0\u1EE3c) + bi\u1EC3n gi\u1EDBi h\u1EA1n theo v\xF9ng -->
      <div style="position: absolute; left: 440px; top: 130px; width: 400px; height: 310px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border-radius: 50%; background: radial-gradient(closest-side, rgba(1,6,10,0.72), rgba(1,6,10,0.45) 60%, rgba(1,6,10,0))">
        <button onClick="{{sb.tap}}" aria-label="{{sb.aria}}" style="position: relative; width: {{sb.ring}}px; height: {{sb.ring}}px; border: 0; padding: 0; background: transparent; cursor: pointer; color: inherit; font-family: inherit; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0">
          <sc-if value="{{sb.showRing}}" hint-placeholder-val="{{ true }}">
            <svg aria-hidden="true" viewBox="0 0 200 200" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%"><path d="{{sb.arcBg}}" fill="none" stroke="rgba(95,212,240,0.18)" stroke-width="6" stroke-linecap="round"></path><path d="{{sb.arc}}" fill="none" stroke="{{sb.c}}" stroke-width="6" stroke-linecap="round"></path></svg>
          </sc-if>
          <sc-if value="{{sb.analog}}" hint-placeholder-val="{{ false }}">
            <svg aria-hidden="true" viewBox="0 0 200 200" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%"><path d="{{sb.ticks}}" stroke="#A9C7D4" stroke-width="3" stroke-linecap="round"></path><line x1="100" y1="100" x2="{{sb.nx}}" y2="{{sb.ny}}" stroke="#FBB040" stroke-width="4" stroke-linecap="round"></line><circle cx="100" cy="100" r="7" fill="#FBB040"></circle></svg>
          </sc-if>
          <span class="tnum" style="position: relative; display: block; width: 100%; text-align: center; font-size: {{sb.fs}}px; line-height: 1; font-family: {{sb.font}}; font-weight: {{sb.fw}}; font-style: {{sb.fst}}; letter-spacing: {{sb.ls}}; color: {{sb.c}}; text-shadow: {{sb.glow}}; margin-top: {{sb.mt}}px">{{sb.num}}</span>
          <span style="position: relative; display: block; width: 100%; text-align: center; font-size: 14px; color: #8FC3D3; margin-top: 4px">{{sb.unit}}</span>
          <sc-if value="{{sb.rally}}" hint-placeholder-val="{{ false }}">
            <span aria-hidden="true" style="position: relative; display: block; width: 70%; height: 8px; margin-top: 8px; border-radius: 4px; background: rgba(255,208,138,0.2); overflow: hidden"><span style="display: block; height: 100%; width: {{sb.barW}}%; background: {{sb.c}}"></span></span>
          </sc-if>
        </button>
        <sc-if value="{{sb.parked}}" hint-placeholder-val="{{ true }}">
          <div style="width: 100%; text-align: center; font-size: 16px; color: #CFE6EE">{{clock}} \xB7 <span style="color: #8FC3D3">ch\u1EA1m s\u1ED1: chuy\u1EBFn h\xF4m nay</span></div>
        </sc-if>
        <sc-if value="{{sb.ahead}}" hint-placeholder-val="{{ false }}">
          <div class="pnl fadein" style="padding: 6px 14px; font-size: 14px; color: #FFD08A; text-align: center">Ph\xEDa tr\u01B0\u1EDBc 300 m: {{sb.aheadL}}</div>
        </sc-if>
        <sc-if value="{{sb.statsOpen}}" hint-placeholder-val="{{ false }}">
          <div class="pnl fadein" style="padding: 8px 14px; font-size: 13px; color: #CFE6EE; text-align: center">{{sb.stats}}</div>
        </sc-if>
      </div>
      <sc-if value="{{sb.limShow}}" hint-placeholder-val="{{ true }}">
      <div style="position: absolute; left: 826px; top: 196px; display: flex; flex-direction: column; align-items: center; gap: 4px">
        <div aria-label="{{sb.limAria}}" style="width: 66px; height: 86px; background: #FFFFFF; border-radius: 6px; box-sizing: border-box; border: {{sb.limBorder}}; display: flex; align-items: center; justify-content: center"><div style="width: 54px; height: 54px; border-radius: 50%; border: 6px solid #D0202E; box-sizing: border-box; display: flex; align-items: center; justify-content: center; font-family: Overpass, sans-serif; font-weight: 800; font-size: 21px; color: #111111; text-align: center">{{sb.lim}}</div></div>
        <span style="font-size: 11px; color: {{sb.limNoteC}}; text-align: center; white-space: nowrap">{{sb.limNote}}</span>
      </div>
      </sc-if>
      <sc-if value="{{sb.pop}}" hint-placeholder-val="{{ false }}">
        <div class="bigsign" aria-live="polite" style="position: absolute; left: 640px; top: 300px; transform: translate(-50%, -50%); z-index: 12; display: flex; flex-direction: column; align-items: center; gap: 8px">
          <div style="width: 170px; height: 220px; background: #FFFFFF; border-radius: 12px; box-sizing: border-box; border: {{sb.limBorder}}; box-shadow: 0 10px 40px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center"><div style="width: 140px; height: 140px; border-radius: 50%; border: 16px solid #D0202E; box-sizing: border-box; display: flex; align-items: center; justify-content: center; font-family: Overpass, sans-serif; font-weight: 800; font-size: 58px; color: #111111">{{sb.lim}}</div></div>
          <span class="pnl" style="padding: 4px 12px; font-size: 14px; color: #E8F1F5">{{sb.zoneL}}</span>
        </div>
      </sc-if>
      <sc-if value="{{rainDriveNote}}" hint-placeholder-val="{{ false }}">
        <div class="pnl fadein" style="position: absolute; left: 380px; top: 436px; width: 520px; box-sizing: border-box; padding: 6px 14px; font-size: 12px; color: #CFE6EE; text-align: center">\u0110ang ch\u1EA1y: t\u1EAFt hi\u1EC7u \u1EE9ng m\u01B0a, ch\u1EC9 gi\u1EEF icon m\u01B0a + n\u1EC1n h\u01A1i t\u1ED1i xanh</div>
      </sc-if>
      <!-- \xF4 \u0111i\u1EC1u khi\u1EC3n ch\u1EC9 c\xF3 trong b\u1EA3n m\u1EABu -->
      <div data-demo="1" class="pnl" style="position: absolute; left: 380px; top: 470px; width: 520px; padding: 8px 12px; box-sizing: border-box; display: flex; flex-direction: column; gap: 6px; background: rgba(10,30,44,0.92); box-shadow: inset 0 0 0 1px #FBB040">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #FFD08A"><b>B\u1EA2N M\u1EAAU</b><span style="color: #CFE6EE">V\xF9ng:</span>
          <sc-for list="{{zones}}" as="zn" hint-placeholder-count="5"><button onClick="{{zn.pick}}" aria-pressed="{{zn.on}}" class="pill" style="height: 26px; padding: 0 8px; font-size: 11px; background: {{zn.bg}}; color: {{zn.fg}}">{{zn.label}}</button></sc-for>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #CFE6EE">
          <label style="flex: 1; display: flex; align-items: center; gap: 8px">T\u1ED1c \u0111\u1ED9<input type="range" min="0" max="130" step="1" value="{{spdVal}}" disabled="{{parkedNow}}" onChange="{{setSpeed}}" style="flex: 1"></label>
          <button onClick="{{toggleGps}}" aria-pressed="{{gpsPressed}}" class="pill" style="height: 26px; padding: 0 8px; font-size: 11px; background: {{gpsBg}}; color: {{gpsFg}}">M\u1EA5t GPS</button>
          <span style="color: #8FC3D3">{{spdHint}}</span>
        </div>
      </div>

      <!-- thanh d\u01B0\u1EDBi c\xF9ng (l\xE0m m\u1EDD) -->
      <div class="dimbox" style="position: absolute; left: 20px; bottom: 16px; display: flex; gap: 8px; opacity: {{opBottom}}">
        <button onClick="{{startListen}}" class="btn" aria-label="Tr\u1EE3 l\xFD gi\u1ECDng n\xF3i" style="width: 64px; height: 64px; padding: 0; color: #5FD4F0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path></svg></button>
        <div class="pnl" style="width: 120px; height: 64px; display: flex; flex-direction: column; align-items: center; justify-content: center"><span class="lbl">NHI\u1EC6T M\xC1Y</span><span style="font-size: 20px; font-weight: 700">{{engT}}</span></div>
        <div class="pnl" style="width: 120px; height: 64px; display: flex; flex-direction: column; align-items: center; justify-content: center"><span class="lbl">B\xCCNH \u0110I\u1EC6N</span><span style="font-size: 20px; font-weight: 700">{{voltT}}</span></div>
        <sc-if value="{{drive}}" hint-placeholder-val="{{ false }}">
          <div class="pnl" style="width: 230px; height: 64px; padding: 0 12px; display: flex; flex-direction: column; justify-content: center"><span class="lbl">{{upL}}</span><span style="font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{upMain}}</span></div>
        </sc-if>
      </div>

      <!-- thanh nh\u1EA1c (l\xE0m m\u1EDD ri\xEAng) -->
      <div class="pnl dimbox" style="position: absolute; right: 20px; bottom: 16px; width: {{musicW}}px; height: 64px; padding: 0 14px; box-sizing: border-box; display: flex; align-items: center; gap: 12px; opacity: {{opMusic}}">
        <button onClick="{{togglePlay}}" aria-label="{{playLabel}}" style="width: 44px; height: 44px; border: 0; border-radius: 50%; cursor: pointer; flex-shrink: 0; background: #FBB040; color: #2A1A00; box-shadow: 0 0 16px rgba(251,176,64,0.7); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="{{playIcon}}"></path></svg></button>
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px">
          <div style="display: flex; align-items: baseline; gap: 8px; min-width: 0"><span style="font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{songTitle}}</span><span style="font-size: 12px; color: #8FC3D3; white-space: nowrap">{{songSub}}</span></div>
          <sc-if value="{{showWave}}" hint-placeholder-val="{{ true }}">
            <div aria-hidden="true" style="position: relative; height: 18px; display: flex; align-items: flex-end; gap: 2px">
              <sc-for list="{{waveBars}}" as="w" hint-placeholder-count="48"><span class="{{w.cls}}" style="width: 4px; height: {{w.h}}px; border-radius: 2px; background: {{w.c}}; animation-delay: {{w.del}}s"></span></sc-for>
              <span style="position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: rgba(95,212,240,0.35)"></span>
              <span style="position: absolute; left: 0; bottom: 0; height: 2px; width: {{prog}}%; background: #FBB040; box-shadow: 0 0 6px #FBB040"></span>
            </div>
          </sc-if>
        </div>
        <button onClick="{{cycleSrc}}" aria-label="\u0110\u1ED5i ngu\u1ED3n nghe: nh\u1EA1c, radio, podcast" class="pill" style="height: 30px; padding: 0 10px; font-size: 11px; letter-spacing: 1px; background: #0D2C40; color: #FFD08A; box-shadow: inset 0 0 0 1px rgba(251,176,64,0.6)">{{srcL}}</button>
        <button onClick="{{togglePanel}}" aria-label="Danh s\xE1ch b\xE0i v\xE0 \u0111\xE0i" aria-expanded="{{panelExp}}" class="btn" style="width: 44px; height: 44px; padding: 0"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"></path></svg></button>
        <sc-if value="{{needPerm}}" hint-placeholder-val="{{ true }}">
          <button onClick="{{grantPerm}}" class="btn" style="height: 36px; font-size: 12px; color: #FFD08A; box-shadow: inset 0 0 0 1px #FBB040">\u26A0 C\u1EA5p quy\u1EC1n \u0111\u1ECDc b\xE0i \u0111ang ph\xE1t</button>
        </sc-if>
        <sc-if value="{{showSkip}}" hint-placeholder-val="{{ false }}">
          <div style="display: flex; gap: 4px"><button onClick="{{prevF}}" class="btn" aria-label="B\xE0i tr\u01B0\u1EDBc" style="width: 40px; height: 40px; padding: 0">\u23EE</button><button onClick="{{nextF}}" class="btn" aria-label="B\xE0i k\u1EBF" style="width: 40px; height: 40px; padding: 0">\u23ED</button></div>
        </sc-if>
      </div>
      <!-- b\u1EA3ng ch\u1ECDn b\xE0i / \u0111\xE0i (tr\u01B0\u1EE3t l\xEAn t\u1EEB thanh nh\u1EA1c) -->
      <sc-if value="{{mp.open}}" hint-placeholder-val="{{ false }}">
        <section aria-label="Ch\u1ECDn b\xE0i v\xE0 \u0111\xE0i" class="pnl fadein" onPointerDown="{{mp.touch}}" style="position: absolute; right: 20px; bottom: 88px; width: 640px; height: 400px; z-index: 8; display: flex; flex-direction: column; background: #06192A">
          <div style="padding: 12px 14px 8px; display: flex; align-items: center; gap: 6px">
            <sc-for list="{{mp.srcs}}" as="o" hint-placeholder-count="3"><button onClick="{{o.pick}}" aria-pressed="{{o.on}}" class="pill" style="height: 32px; background: {{o.bg}}; color: {{o.fg}}">{{o.label}}</button></sc-for>
            <span style="margin-left: auto; font-size: 11px; color: #8FC3D3">{{mp.srcNote}}</span>
            <button onClick="{{mp.close}}" aria-label="\u0110\xF3ng" class="btn" style="width: 36px; height: 36px; padding: 0">\u2715</button>
          </div>
          <div style="padding: 0 14px 8px; display: flex; align-items: center; gap: 6px">
            <sc-for list="{{mp.tabs}}" as="t" hint-placeholder-count="4"><button onClick="{{t.pick}}" aria-pressed="{{t.on}}" class="pill" style="height: 30px; font-size: 12px; background: {{t.bg}}; color: {{t.fg}}">{{t.label}}</button></sc-for>
            <label style="flex: 1; display: flex"><span style="position: absolute; left: -9999px">T\xECm</span><input type="text" placeholder="{{mp.searchPh}}" disabled="{{drive}}" style="flex: 1; min-width: 0; height: 32px; padding: 0 10px; border: 0; border-radius: 6px; font-family: inherit; font-size: 13px; background: {{mp.searchBg}}; color: #E8F1F5"></label>
          </div>
          <sc-if value="{{mp.regionOn}}" hint-placeholder-val="{{ false }}">
            <div style="margin: 0 14px 8px; padding: 6px 10px; border-radius: 6px; background: rgba(123,216,143,0.12); font-size: 12px; color: #BFF0CA">{{mp.regionL}}</div>
          </sc-if>
          <div class="scrl" style="flex: 1; min-height: 0; padding: 0 10px 0 14px; display: flex; flex-direction: column; gap: 6px">
            <sc-for list="{{mp.rows}}" as="r" hint-placeholder-count="6">
              <div style="flex-shrink: 0; display: flex; align-items: center; gap: 10px; padding: {{mp.rowPad}}; border-radius: 8px; background: {{r.bg}}">
                <span aria-hidden="true" style="width: 38px; height: 38px; border-radius: {{r.rad}}; background: {{r.tile}}; color: #FFFFFF; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0">{{r.letter}}</span>
                <button onClick="{{r.play}}" style="flex: 1; min-width: 0; border: 0; background: transparent; padding: 0; cursor: pointer; font-family: inherit; color: #E8F1F5; text-align: left">
                  <span style="display: block; font-size: {{mp.fs}}px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.t}}</span>
                  <span style="display: block; font-size: 12px; color: #8FC3D3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.s}}</span>
                </button>
                <sc-if value="{{r.isRadio}}" hint-placeholder-val="{{ false }}"><button onClick="{{r.fav}}" aria-label="Y\xEAu th\xEDch" aria-pressed="{{r.favOn}}" class="btn" style="width: 38px; height: 38px; padding: 0; color: {{r.favC}}">\u2605</button></sc-if>
                <span style="font-size: 12px; font-weight: 700; color: {{r.stC}}; white-space: nowrap">{{r.st}}</span>
              </div>
            </sc-for>
          </div>
          <div style="padding: 8px 14px 12px; font-size: 11px; color: #8FC3D3; line-height: 1.45">{{mp.foot}}</div>
        </section>
      </sc-if>

      <!-- tr\u1EE3 l\xFD gi\u1ECDng n\xF3i: \u0111ang nghe -->
      <sc-if value="{{va.on}}" hint-placeholder-val="{{ false }}">
        <div role="dialog" aria-label="Tr\u1EE3 l\xFD \u0111ang nghe" class="pnl fadein" style="position: absolute; left: 50%; bottom: 96px; transform: translateX(-50%); width: 680px; z-index: 9; padding: 16px 18px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; background: #06192A">
          <div style="display: flex; align-items: center; gap: 14px">
            <span aria-hidden="true" style="position: relative; width: 46px; height: 46px; flex-shrink: 0"><span class="orb" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; border-radius: 50%; border: 2px solid #5FD4F0"></span><span style="position: absolute; inset: 12px; border-radius: 50%; background: #5FD4F0; box-shadow: 0 0 18px #5FD4F0"></span></span>
            <div style="flex: 1; min-width: 0"><div style="font-size: 18px; font-weight: 700">{{va.title}}</div><div style="font-size: 12px; color: #8FC3D3">Nh\u1EA1c t\u1EF1 nh\u1ECF l\u1EA1i trong l\xFAc nghe \xB7 "t\xEDt" nh\u1EB9 khi b\u1EAFt \u0111\u1EA7u</div></div>
            <button onClick="{{va.close}}" aria-label="\u0110\xF3ng tr\u1EE3 l\xFD" class="btn" style="width: 40px; height: 40px; padding: 0">\u2715</button>
          </div>
          <sc-if value="{{va.heardOn}}" hint-placeholder-val="{{ false }}"><div style="font-size: 16px; color: #FFE2A8">"{{va.heard}}"</div></sc-if>
          <div style="font-size: 12px; color: #CFE6EE">{{va.hint}}</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap">
            <sc-for list="{{va.cmds}}" as="c" hint-placeholder-count="6"><button onClick="{{c.run}}" class="pill" style="height: 34px; background: #0D2C40; color: #CFF6FF; box-shadow: inset 0 0 0 1px rgba(95,212,240,0.5)">"{{c.t}}"</button></sc-for>
          </div>
        </div>
      </sc-if>

      <sc-if value="{{dimmedAny}}" hint-placeholder-val="{{ false }}">
        <div class="fadein" style="position: absolute; left: 50%; bottom: 92px; transform: translateX(-50%); font-size: 12px; color: #8FC3D3">Thanh d\u01B0\u1EDBi + thanh nh\u1EA1c t\u1EF1 m\u1EDD sau 5 gi\xE2y \u2014 ch\u1EA1m \u0111\u1EC3 s\xE1ng l\u1EA1i</div>
      </sc-if>
    </sc-if>

    <!-- ========== 2. C\xC0I \u0110\u1EB6T TO\xC0N TRANG ========== -->
    <sc-if value="{{isSettings}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: flex; background: radial-gradient(ellipse at 70% 0%,rgba(95,212,240,0.12),transparent 60%),#03111C">
        <aside style="width: 300px; flex-shrink: 0; padding: 18px 14px; box-sizing: border-box; display: flex; flex-direction: column; gap: 6px; border-right: 1px solid rgba(95,212,240,0.3)">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px">
            <button onClick="{{goHome}}" aria-label="V\u1EC1 M\xE0n H\xECnh Ch\xEDnh" class="btn" style="width: 44px; padding: 0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg></button>
            <span style="font-size: 24px; font-weight: 700; color: #FBB040">C\xE0i \u0110\u1EB7t</span>
          </div>
          <sc-for list="{{groups}}" as="g" hint-placeholder-count="8">
            <button onClick="{{g.pick}}" aria-pressed="{{g.on}}" style="border: 0; cursor: pointer; font-family: inherit; height: 54px; padding: 0 12px; display: flex; align-items: center; gap: 12px; text-align: left; background: {{g.bg}}; color: {{g.fg}}; box-shadow: {{g.ring}}; clip-path: polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{g.icon}}"></path></svg>
              <span style="flex: 1; font-size: 15px; font-weight: 700">{{g.label}}</span>
              <span style="font-size: 14px; font-weight: 700; color: {{g.markC}}">{{g.mark}}</span>
            </button>
          </sc-for>
        </aside>
        <main class="scrl" style="flex: 1; min-width: 0; padding: 22px 30px; box-sizing: border-box">
          <div style="font-size: 26px; font-weight: 700; margin-bottom: 4px">{{grpTitle}}</div>
          <div style="font-size: 13px; color: #8FC3D3; margin-bottom: 16px">{{grpDesc}}</div>
          <div style="display: flex; flex-direction: column; gap: 8px">
            <sc-for list="{{rows}}" as="r" hint-placeholder-count="6">
              <div class="pnl" style="min-height: 62px; padding: 10px 16px; box-sizing: border-box; display: flex; align-items: center; gap: 14px">
                <div style="flex: 1; min-width: 0"><div style="font-size: 15px; font-weight: 700">{{r.label}}</div><div style="font-size: 12px; color: #8FC3D3">{{r.hint}}</div></div>
                <sc-if value="{{r.isToggle}}" hint-placeholder-val="{{ true }}">
                  <button onClick="{{r.toggle}}" role="switch" aria-checked="{{r.on}}" aria-label="{{r.label}}" style="width: 64px; height: 34px; border: 0; border-radius: 17px; cursor: pointer; position: relative; background: {{r.trackBg}}; flex-shrink: 0"><span style="position: absolute; top: 4px; left: {{r.knobX}}px; width: 26px; height: 26px; border-radius: 50%; background: #FFFFFF; transition: left .2s"></span></button>
                  <span style="width: 44px; font-size: 13px; font-weight: 700; color: {{r.stateC}}">{{r.stateL}}</span>
                </sc-if>
                <sc-if value="{{r.isChoice}}" hint-placeholder-val="{{ false }}">
                  <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; max-width: 560px">
                    <sc-for list="{{r.opts}}" as="o" hint-placeholder-count="3"><button onClick="{{o.pick}}" aria-pressed="{{o.on}}" class="pill" style="background: {{o.bg}}; color: {{o.fg}}">{{o.label}}</button></sc-for>
                  </div>
                </sc-if>
                <sc-if value="{{r.isStatus}}" hint-placeholder-val="{{ false }}">
                  <span style="font-size: 14px; font-weight: 700; color: {{r.stC}}">{{r.stL}}</span>
                  <sc-if value="{{r.hasAct}}" hint-placeholder-val="{{ false }}"><button onClick="{{r.act}}" class="btn btn-o" style="height: 38px">{{r.actL}}</button></sc-if>
                </sc-if>
                <sc-if value="{{r.isInfo}}" hint-placeholder-val="{{ false }}">
                  <span style="font-size: 14px; font-weight: 700; color: #CFF6FF; text-align: right">{{r.val}}</span>
                </sc-if>
              </div>
            </sc-for>
          </div>
        </main>
      </div>
    </sc-if>

    <!-- ========== 3. ROAD TRIP ========== -->
    <sc-if value="{{isRt}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; left: 20px; right: 20px; top: 12px; display: flex; align-items: center; gap: 8px">
        <button onClick="{{goHome}}" class="pill" style="background: rgba(3,17,28,0.85); color: #CFE6EE; box-shadow: inset 0 0 0 1px rgba(95,212,240,0.5)">M\xE0n H\xECnh Ch\xEDnh</button>
        <button class="pill" style="background: #FBB040; color: #2A1A00">Road Trip</button>
        <span style="font-size: 20px; font-weight: 700; margin-left: 8px">{{rt.title}}</span>
        <sc-for list="{{rt.legs}}" as="c" hint-placeholder-count="2"><button onClick="{{c.pick}}" aria-pressed="{{c.on}}" class="pill" style="background: {{c.bg}}; color: {{c.fg}}">{{c.label}}</button></sc-for>
        <span style="font-size: 12px; color: #7BD88F">\u25CF t\u1EF1 nh\u1EADn chi\u1EC1u theo GPS</span>
        <span style="margin-left: auto"></span>
        <button class="btn" style="height: 40px; font-size: 13px">Chuy\u1EBFn: Melbourne \u21C4 Adelaide \u25BE</button>
        <button onClick="{{goSearch}}" class="btn" style="height: 40px; font-size: 13px">T\xECm Ch\u1ED7</button>
        <button onClick="{{goSplit}}" class="btn btn-o" style="height: 40px; font-size: 13px">M\u1EDF B\u1EA3n \u0110\u1ED3</button>
      </div>

      <!-- 3 \xF4 tr\xEAn: canh gi\u1EEFa -->
      <div style="position: absolute; left: 20px; top: 64px; width: 800px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px">
        <sc-for list="{{rt.boxes}}" as="b" hint-placeholder-count="3">
          <div class="pnl" style="height: 76px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 2px"><span class="lbl">{{b.l}}</span><span style="font-size: 22px; font-weight: 700">{{b.v}}</span><span style="font-size: 12px; color: #8FC3D3">{{b.s}}</span></div>
        </sc-for>
      </div>

      <!-- hi\u1EC3n th\u1ECB qu\xE3ng \u0111\u01B0\u1EDDng: ph\xF3ng to / thu nh\u1ECF, km, h\xECnh ch\u1EB7ng -->
      <div class="pnl" onWheel="{{rt.wheel}}" onPointerDown="{{rt.panStart}}" onPointerMove="{{rt.panMove}}" onPointerUp="{{rt.panEnd}}" onPointerLeave="{{rt.panEnd}}" style="position: absolute; left: 20px; top: 152px; width: 800px; height: 290px; overflow: hidden; touch-action: none; cursor: {{rt.cursor}}">
        <div style="position: absolute; left: 0; top: 0; width: 800px; height: 290px; transform-origin: 0 0; transform: translate({{rt.tx}}px, {{rt.ty}}px) scale({{rt.z}})">
          <sc-if value="{{rt.road}}" hint-placeholder-val="{{ true }}">
            <svg aria-hidden="true" viewBox="0 0 800 290" width="800" height="290" style="position: absolute; left: 0; top: 0; display: block">
              <rect x="{{rt.r0x}}" y="0" width="{{rt.r0w}}" height="290" fill="#0B1E33"></rect>
              <rect x="{{rt.r1x}}" y="0" width="{{rt.r1w}}" height="290" fill="#0E2A22"></rect>
              <rect x="{{rt.r2x}}" y="0" width="{{rt.r2w}}" height="290" fill="#2A2612"></rect>
              <rect x="{{rt.r3x}}" y="0" width="{{rt.r3w}}" height="290" fill="#2A1C12"></rect>
              <rect x="{{rt.r4x}}" y="0" width="{{rt.r4w}}" height="290" fill="#1B2618"></rect>
              <path d="{{rt.cityD}}" fill="#163650" stroke="#5FD4F0" stroke-width="1" opacity="0.8"></path>
              <path d="{{rt.hillD}}" fill="#1F4A33" opacity="0.9"></path>
              <path d="{{rt.wheatD}}" stroke="#C9A64A" stroke-width="2" opacity="0.7"></path>
              <path d="{{rt.scrubD}}" fill="#6B5A34" opacity="0.9"></path>
              <path d="{{rt.ahillD}}" fill="#2D4A28" opacity="0.9"></path>
              <path d="{{rt.roadD}}" fill="none" stroke="#2B3A46" stroke-width="22" stroke-linecap="round"></path>
              <path d="{{rt.roadD}}" fill="none" stroke="#E8F1F5" stroke-width="1.6" stroke-dasharray="10 10" opacity="0.6"></path>
              <path d="{{rt.doneD}}" fill="none" stroke="#7BD88F" stroke-width="6" stroke-linecap="round" opacity="0.85"></path>
              <path d="{{rt.tickD}}" stroke="#E8F1F5" stroke-width="1.5" opacity="0.7"></path>
              <line x1="{{rt.bx}}" y1="120" x2="{{rt.bx}}" y2="245" stroke="#FBB040" stroke-width="2" stroke-dasharray="5 4"></line>
            </svg>
            <sc-for list="{{rt.regions}}" as="g" hint-placeholder-count="5"><span style="position: absolute; left: {{g.x}}px; top: 262px; width: {{g.w}}px; text-align: center; font-size: 11px; color: #A9C7D4; letter-spacing: 0.5px">{{g.label}}</span></sc-for>
            <sc-for list="{{rt.ticks}}" as="t" hint-placeholder-count="7"><span style="position: absolute; left: {{t.x}}px; top: {{t.y}}px; transform: translateX(-50%) scale({{rt.inv}}); transform-origin: 50% 0; font-size: 10px; color: #CFE6EE; white-space: nowrap">{{t.label}}</span></sc-for>
            <sc-for list="{{rt.segs}}" as="g" hint-placeholder-count="6"><span style="position: absolute; left: {{g.x}}px; top: {{g.y}}px; transform: translateX(-50%) scale({{rt.inv}}); transform-origin: 50% 0; font-size: 11px; font-weight: 700; color: #FFD08A; background: rgba(3,17,28,0.75); border-radius: 4px; padding: 0 4px; white-space: nowrap">{{g.label}}</span></sc-for>
            <div aria-hidden="true" style="position: absolute; left: {{rt.sunX}}px; top: 14px; transform: scale({{rt.inv}}); transform-origin: 50% 0; display: flex; flex-direction: column; align-items: center; gap: 2px">
              <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="{{rt.sunIcon}}" fill="{{rt.sunC}}"></path></svg>
              <span style="font-size: 11px; color: #CFE6EE">t\u1EDBi {{rt.eta}}</span>
            </div>
            <sc-for list="{{rt.signs}}" as="s" hint-placeholder-count="6">
              <button onClick="{{s.open}}" onDoubleClick="{{s.focus}}" aria-label="{{s.aria}}" style="position: absolute; left: {{s.x}}px; top: {{s.y}}px; transform: translate(-50%, -100%) scale({{rt.inv}}); transform-origin: 50% 100%; border: 0; padding: 0; background: transparent; cursor: pointer; font-family: inherit; color: #E8F1F5; display: flex; flex-direction: column; align-items: center">
                <sc-if value="{{s.photo}}" hint-placeholder-val="{{ false }}"><span class="ph {{s.cls}}" style="position: relative; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #FFFFFF; box-sizing: border-box; opacity: {{s.op}}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4zM12 10a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7z"></path></svg><span style="position: absolute; right: -4px; bottom: -4px; width: 18px; height: 18px; border-radius: 3px; background: {{s.bg}}; border: 1.5px solid #FFFFFF; box-sizing: border-box; display: flex; align-items: center; justify-content: center"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{s.icon}}"></path></svg></span></span></sc-if>
                <sc-if value="{{s.sign}}" hint-placeholder-val="{{ true }}"><span class="{{s.cls}}" style="width: 30px; height: 30px; border-radius: 4px; background: {{s.bg}}; border: 2px solid #FFFFFF; box-sizing: border-box; display: flex; align-items: center; justify-content: center; opacity: {{s.op}}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{s.icon}}"></path></svg></span></sc-if>
                <span style="font-size: 10px; white-space: nowrap; max-width: 96px; overflow: hidden; text-overflow: ellipsis">{{s.short}}</span>
                <span style="font-size: 10px; font-weight: 700; white-space: nowrap; color: {{s.kmC}}">{{s.km}}</span>
                <span style="width: 2px; height: 8px; background: #A9C7D4"></span>
              </button>
            </sc-for>
            <div style="position: absolute; left: {{rt.bx}}px; top: 96px; transform: translateX(-4px) scale({{rt.inv}}); transform-origin: 0 100%; display: flex; align-items: center; gap: 4px">
              <svg width="16" height="22" viewBox="0 0 16 22" aria-hidden="true"><path d="M2 22V2" stroke="#FBB040" stroke-width="2"></path><path d="M3 2h11l-3 4 3 4H3z" fill="#D0202E"></path></svg>
              <span style="font-size: 11px; font-weight: 700; color: #FFD08A; white-space: nowrap">{{rt.borderL}}</span>
            </div>
            <div style="position: absolute; left: {{rt.vanX}}px; top: {{rt.vanY}}px; transform: translate(-50%, -100%) scale({{rt.inv}}); transform-origin: 50% 100%; display: flex; flex-direction: column; align-items: center">
              <span style="font-size: 12px; font-weight: 700; color: #2A1A00; background: #FBB040; border-radius: 6px; padding: 1px 6px; margin-bottom: 2px; white-space: nowrap">{{rt.vanL}}</span>
              <svg width="44" height="24" viewBox="0 0 44 24" aria-hidden="true"><path d="M2 18V4h24l8 5h8v9z" fill="#E8F1F5"></path><rect x="27" y="5" width="9" height="6" rx="1" fill="#5FD4F0"></rect><circle cx="11" cy="20" r="3.5" fill="#0B1620" stroke="#A9C7D4"></circle><circle cx="33" cy="20" r="3.5" fill="#0B1620" stroke="#A9C7D4"></circle></svg>
            </div>
          </sc-if>
          <sc-if value="{{rt.map}}" hint-placeholder-val="{{ false }}">
            <svg aria-hidden="true" viewBox="0 0 780 300" width="800" height="290" style="position: absolute; left: 0; top: 0; display: block; background: #0A1B28">
              <path d="M0 60 L780 40 M0 160 L780 190 M0 250 L780 230 M120 0 L160 300 M420 0 L390 300 M640 0 L700 300" stroke="#16324A" stroke-width="1"></path>
              <path d="M335 0 L335 300" stroke="#FBB040" stroke-width="1.5" stroke-dasharray="6 5" opacity="0.8"></path>
              <polyline points="{{rt.mapLine}}" fill="none" stroke="#3A5A70" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline>
              <polyline points="{{rt.mapLine}}" fill="none" stroke="#5FD4F0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
            </svg>
            <sc-for list="{{rt.mapDots}}" as="m" hint-placeholder-count="8">
              <div style="position: absolute; left: {{m.x}}px; top: {{m.y}}px; transform: translate(-6px, -6px) scale({{rt.inv}}); transform-origin: 6px 6px; display: flex; align-items: center; gap: 4px"><span style="width: 12px; height: 12px; border-radius: 50%; background: {{m.c}}; border: 2px solid #03111C; box-sizing: border-box; flex-shrink: 0"></span><span style="font-size: 11px; font-weight: 600; color: #E8F1F5; white-space: nowrap; text-shadow: 0 0 4px #03111C">{{m.name}}</span></div>
            </sc-for>
            <div aria-hidden="true" style="position: absolute; left: {{rt.mapVanX}}px; top: {{rt.mapVanY}}px; width: 18px; height: 18px; margin: -9px 0 0 -9px; border-radius: 50%; background: #FBB040; border: 2px solid #2A1A00; box-sizing: border-box; transform: scale({{rt.inv}})"></div>
          </sc-if>
        </div>
        <div style="position: absolute; left: 14px; top: 10px; display: flex; gap: 6px; z-index: 3">
          <sc-for list="{{rt.views}}" as="v" hint-placeholder-count="2"><button onClick="{{v.pick}}" aria-pressed="{{v.on}}" class="pill" style="height: 30px; background: {{v.bg}}; color: {{v.fg}}">{{v.label}}</button></sc-for>
        </div>
        <div style="position: absolute; right: 12px; top: 10px; display: flex; gap: 6px; align-items: center; z-index: 3">
          <span style="font-size: 11px; color: #CFE6EE; background: rgba(3,17,28,0.8); padding: 3px 6px; border-radius: 4px">{{rt.zL}}</span>
          <button onClick="{{rt.follow}}" aria-pressed="{{rt.followOn}}" class="pill" style="height: 30px; background: {{rt.followBg}}; color: {{rt.followFg}}">Theo Xe</button>
          <button onClick="{{rt.all}}" class="pill" style="height: 30px; background: rgba(3,17,28,0.85); color: #CFE6EE">C\u1EA3 Chuy\u1EBFn</button>
          <button onClick="{{rt.zoomOut}}" aria-label="Thu nh\u1ECF" class="btn" style="width: 40px; height: 40px; padding: 0; font-size: 22px">\u2212</button>
          <button onClick="{{rt.zoomIn}}" aria-label="Ph\xF3ng to" class="btn" style="width: 40px; height: 40px; padding: 0; font-size: 22px">+</button>
        </div>
        <div style="position: absolute; left: 14px; bottom: 8px; font-size: 11px; color: #8FC3D3; background: rgba(3,17,28,0.7); padding: 2px 6px; border-radius: 4px; z-index: 3">{{rt.foot}}</div>
      </div>

      <!-- m\xF4 ph\u1ECFng v\u1ECB tr\xED (ch\u1EC9 trong b\u1EA3n m\u1EABu) -->
      <label data-demo="1" style="position: absolute; left: 20px; top: 452px; width: 800px; display: flex; align-items: center; gap: 10px; font-size: 12px; color: #8FC3D3">M\xF4 ph\u1ECFng v\u1ECB tr\xED xe (ch\u1EC9 trong b\u1EA3n m\u1EABu)<input type="range" min="0" max="727" step="1" value="{{pos}}" onChange="{{setPos}}" style="flex: 1"><span style="width: 60px; color: #E8F1F5">{{pos}} km</span></label>

      <!-- 4 \xF4 s\u1ED1 li\u1EC7u: canh gi\u1EEFa, ch\u1EEF d\xE0i t\u1EF1 xu\u1ED1ng d\xF2ng -->
      <div style="position: absolute; left: 20px; top: 488px; width: 800px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px">
        <sc-for list="{{rt.stats}}" as="b" hint-placeholder-count="4">
          <div class="pnl" style="min-height: 92px; padding: 8px 10px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 2px"><span class="lbl">{{b.l}}</span><span style="font-size: 20px; font-weight: 700; color: {{b.c}}; white-space: normal; overflow-wrap: anywhere; line-height: 1.2">{{b.v}}</span></div>
        </sc-for>
      </div>
      <div data-demo="1" style="position: absolute; left: 20px; top: 596px; width: 800px; font-size: 12px; color: #8FC3D3">Ch\u1EB7ng v\u1EC1 m\u1EB7c \u0111\u1ECBnh = ch\u1EB7ng \u0111i \u0111\u1EA3o ng\u01B0\u1EE3c + c\xE1c ch\u1EB7ng v\u1EC1 c\u1EE7a b\u1EA1n (g\u1ED9p ch\u1ED7 tr\xF9ng). S\u1ED1 km \u0111o l\u1EA1i theo \u0111\u01B0\u1EDDng th\u1EADt khi build.</div>

      <!-- c\xE1c ch\u1EB7ng gh\xE9 -->
      <section aria-label="C\xE1c ch\u1EB7ng gh\xE9" class="pnl" style="position: absolute; right: 20px; top: 64px; width: 420px; height: 600px; display: flex; flex-direction: column">
        <div style="padding: 12px 14px 8px; display: flex; align-items: center; gap: 8px"><span class="lbl" style="flex: 1">C\xC1C CH\u1EB6NG GH\xC9 \xB7 {{rt.count}}</span><span style="font-size: 11px; color: #8FC3D3">k\xE9o \u22EE\u22EE ho\u1EB7c \u25B2\u25BC \u0111\u1EC3 \u0111\u1ED5i th\u1EE9 t\u1EF1</span></div>
        <div class="scrl" style="flex: 1; min-height: 0; padding: 0 10px 0 14px; display: flex; flex-direction: column; gap: 6px">
          <sc-for list="{{rt.stops}}" as="s" hint-placeholder-count="7">
            <div class="{{s.cls}}" style="flex-shrink: 0; display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 8px; background: {{s.bg}}; opacity: {{s.op}}">
              <span aria-hidden="true" style="color: #5E8496; font-size: 16px; cursor: grab">\u22EE\u22EE</span>
              <sc-if value="{{s.photo}}" hint-placeholder-val="{{ true }}">
                <div class="ph" aria-hidden="true" style="position: relative; width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4zM12 10a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7z"></path></svg><span style="position: absolute; right: -3px; bottom: -3px; width: 18px; height: 18px; border-radius: 3px; background: {{s.sign}}; border: 1.5px solid #FFFFFF; box-sizing: border-box; display: flex; align-items: center; justify-content: center"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="{{s.icon}}"></path></svg></span></div>
              </sc-if>
              <sc-if value="{{s.noPhoto}}" hint-placeholder-val="{{ false }}">
                <div style="width: 34px; height: 34px; border-radius: 4px; background: {{s.sign}}; border: 2px solid #FFFFFF; box-sizing: border-box; display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{s.icon}}"></path></svg></div>
              </sc-if>
              <div style="flex: 1; min-width: 0">
                <button onClick="{{s.open}}" style="border: 0; background: transparent; padding: 0; cursor: pointer; font-family: inherit; color: #E8F1F5; text-align: left; font-size: 14px; font-weight: 700; text-decoration: {{s.strike}}">{{s.name}}</button>
                <div style="font-size: 11px; color: #8FC3D3">{{s.town}} \xB7 {{s.stay}} \xB7 <span style="color: {{s.tagC}}">{{s.tag}}</span></div>
                <div style="font-size: 12px"><span style="color: {{s.distC}}; font-weight: 700">{{s.dist}}</span> <span style="color: #CFE6EE">{{s.eta}}</span></div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px">
                <button onClick="{{s.up}}" aria-label="L\xEAn" class="btn" style="width: 30px; height: 24px; padding: 0; font-size: 11px">\u25B2</button>
                <button onClick="{{s.down}}" aria-label="Xu\u1ED1ng" class="btn" style="width: 30px; height: 24px; padding: 0; font-size: 11px">\u25BC</button>
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px">
                <button onClick="{{s.skip}}" aria-label="B\u1ECF qua chuy\u1EBFn n\xE0y" title="B\u1ECF qua chuy\u1EBFn n\xE0y" class="btn" style="width: 30px; height: 24px; padding: 0; font-size: 11px">{{s.skipL}}</button>
                <button onClick="{{s.del}}" aria-label="Xo\xE1 ch\u1EB7ng" class="btn" style="width: 30px; height: 24px; padding: 0; color: #FF9A9E"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path></svg></button>
              </div>
            </div>
          </sc-for>
        </div>
        <div style="padding: 10px 14px 14px; display: flex; gap: 8px">
          <button onClick="{{openAdd}}" class="btn" style="flex: 1">+ Th\xEAm Ch\u1EB7ng</button>
          <button onClick="{{openPick}}" class="btn btn-o" style="flex: 1">+ Th\xEAm T\u1EEB Danh S\xE1ch</button>
        </div>
      </section>
    </sc-if>

    <!-- ========== 4. ROAD TRIP + B\u1EA2N \u0110\u1ED2 (CHIA M\xC0N H\xCCNH) ========== -->
    <sc-if value="{{isSplit}}" hint-placeholder-val="{{ false }}">
      <div onPointerMove="{{dragMove}}" onPointerUp="{{dragEnd}}" onPointerLeave="{{dragEnd}}" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: flex; flex-direction: {{sp.dir}}">
        <!-- b\u1EA3n \u0111\u1ED3 -->
        <div data-demo="1" style="width: {{sp.mapW}}px; flex-shrink: 0; position: relative; overflow: hidden; background: #0D1720">
          <svg aria-hidden="true" viewBox="0 0 900 680" preserveAspectRatio="xMidYMid slice" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%">
            <path d="M0 120 L900 160 M0 300 L900 260 M0 480 L900 520 M150 0 L210 680 M480 0 L430 680 M720 0 L780 680 M0 600 L900 610" stroke="#1C2B36" stroke-width="10"></path>
            <path d="M440 680 C430 560 470 470 520 380 C570 290 560 180 620 60 L650 0" fill="none" stroke="#33CCFF" stroke-width="12" stroke-linecap="round"></path>
            <path d="M440 650 l-16 34 16 -9 16 9 z" fill="#FFFFFF"></path>
          </svg>
          <div style="position: absolute; left: 16px; right: 16px; top: 14px; display: flex; gap: 10px; align-items: center">
            <div style="background: #1B6FD8; border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; min-width: 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 20V5M6 11l6-6 6 6"></path></svg><div style="min-width: 0"><div style="font-size: 18px; font-weight: 700; white-space: nowrap">34 km</div><div style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">Western Hwy (A8)</div></div></div>
            <span style="margin-left: auto; font-size: 11px; color: #9FB7C4; background: rgba(0,0,0,0.45); padding: 4px 8px; border-radius: 6px; white-space: nowrap">{{sp.mapName}} (h\xECnh m\u1EABu)</span>
          </div>
          <div style="position: absolute; left: 16px; bottom: 14px; background: rgba(10,20,28,0.9); border-radius: 10px; padding: 8px 12px; font-size: 13px">T\u1EDBi The Flywheel Bar &amp; Cafe \xB7 09:35</div>
        </div>
        <!-- thanh k\xE9o gi\xE3n -->
        <div data-demo="1" onPointerDown="{{dragStart}}" onDoubleClick="{{dragSwap}}" role="separator" aria-orientation="vertical" aria-label="K\xE9o \u0111\u1EC3 ch\u1EC9nh \u0111\u1ED9 r\u1ED9ng" style="width: 22px; flex-shrink: 0; cursor: col-resize; touch-action: none; background: {{sp.barBg}}; display: flex; align-items: center; justify-content: center; position: relative">
          <span style="width: 8px; height: 90px; border-radius: 4px; background: #FBB040; box-shadow: 0 0 10px rgba(251,176,64,0.7)"></span>
          <span style="position: absolute; top: 50%; margin-top: 56px; font-size: 11px; font-weight: 700; color: #FFD08A; white-space: nowrap">{{sp.pctL}}</span>
        </div>
        <!-- c\u1ED9t Road Trip g\u1ECDn -->
        <div style="flex: 1; min-width: 0; position: relative; overflow: hidden; background: #03111C">
          <sc-if value="{{sp.narrow}}" hint-placeholder-val="{{ false }}">
            <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: flex; flex-direction: column; align-items: center; gap: 12px; padding-top: 18px">
              <span style="font-size: 12px; font-weight: 700; color: #FBB040; writing-mode: vertical-rl">TOM'S CAR</span>
              <button class="btn" aria-label="V\u1EC1 Tom's Car" style="width: 44px; padding: 0">\u2302</button>
              <button class="btn" aria-label="Tr\u1EE3 l\xFD" style="width: 44px; padding: 0; color: #5FD4F0">\u25CF</button>
              <span style="font-size: 12px; color: #CFE6EE; writing-mode: vertical-rl">Keith \xB7 64 km</span>
            </div>
          </sc-if>
          <sc-if value="{{sp.wide}}" hint-placeholder-val="{{ true }}">
            <div class="scrl" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px">
              <div style="display: flex; align-items: center; gap: 8px"><span style="font-size: 18px; font-weight: 700; color: #FBB040">Road Trip</span><span style="font-size: 13px; color: #CFE6EE">Melbourne \u2192 Adelaide</span></div>
              <div class="pnl nxt" style="padding: 14px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px"><span class="lbl">CH\u1EB6NG GH\xC9 K\u1EBE</span><span style="font-size: 20px; font-weight: 700">Keith (12810 Dukes Hwy)</span><span style="font-size: 14px; color: #FFD08A">c\xF2n 64 km \xB7 d\u1EF1 ki\u1EBFn 13:03 gi\u1EDD SA</span></div>
              <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
                <div class="pnl" style="padding: 10px; text-align: center"><div class="lbl">C\xD2N L\u1EA0I</div><div style="font-size: 18px; font-weight: 700">301 km</div></div>
                <div class="pnl" style="padding: 10px; text-align: center"><div class="lbl">T\u1EDAI N\u01A0I</div><div style="font-size: 18px; font-weight: 700">15:52</div></div>
              </div>
              <div class="pnl" style="padding: 10px; text-align: center; font-size: 14px; color: #CFE6EE">Ngh\u1EC9 ch\xE2n sau 35 ph\xFAt n\u1EEFa</div>
              <div class="pnl" style="padding: 10px; display: flex; align-items: center; gap: 10px"><span style="width: 32px; height: 32px; border-radius: 50%; background: #FBB040; flex-shrink: 0"></span><span style="font-size: 13px; color: #CFE6EE">Ch\u01B0a ph\xE1t nh\u1EA1c</span></div>
            </div>
          </sc-if>
        </div>
      </div>
      <!-- \u0111i\u1EC1u khi\u1EC3n chia m\xE0n h\xECnh -->
      <div class="pnl" style="position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); padding: 8px 10px; display: flex; gap: 6px; align-items: center; z-index: 5">
        <span style="font-size: 12px; color: #8FC3D3; margin-right: 4px">N\u1EA5c:</span>
        <sc-for list="{{sp.snaps}}" as="n" hint-placeholder-count="4"><button onClick="{{n.pick}}" aria-pressed="{{n.on}}" class="pill" style="height: 30px; background: {{n.bg}}; color: {{n.fg}}">{{n.label}}</button></sc-for>
        <button onClick="{{swapSide}}" class="pill" style="height: 30px; background: #0D2C40; color: #CFF6FF">\u0110\u1ED5i b\xEAn b\u1EA3n \u0111\u1ED3</button>
        <button onClick="{{goRt}}" class="pill" style="height: 30px; background: #0D2C40; color: #CFF6FF">V\u1EC1 Road Trip</button>
      </div>
      <div style="position: absolute; left: 50%; top: 10px; transform: translateX(-50%); font-size: 12px; color: #FFD08A; background: rgba(3,17,28,0.85); padding: 4px 10px; border-radius: 6px">K\xE9o thanh cam (bu\xF4ng tay t\u1EF1 h\xEDt v\xE0o n\u1EA5c) \xB7 ch\u1EA1m 2 l\u1EA7n \u0111\u1EC3 \u0111\u1ED5i nhanh 2 c\u1EE1 hay d\xF9ng \xB7 \u0111ang ch\u1EA1y v\u1EABn k\xE9o \u0111\u01B0\u1EE3c</div>
    </sc-if>

    <!-- ========== 5. T\xCCM CH\u1ED6 G\u1EA6N \u0110\xC2Y ========== -->
    <sc-if value="{{isSearch}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; left: 20px; right: 20px; top: 14px; display: flex; align-items: center; gap: 10px">
        <button onClick="{{goRt}}" aria-label="Quay l\u1EA1i" class="btn" style="width: 44px; padding: 0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg></button>
        <span style="font-size: 24px; font-weight: 700; color: #FBB040">T\xECm Ch\u1ED7 G\u1EA7n \u0110\xE2y</span>
        <label style="flex: 1; display: flex"><span style="position: absolute; left: -9999px">T\xECm ch\u1ED7</span><input type="text" placeholder="{{searchPh}}" disabled="{{drive}}" style="flex: 1; height: 46px; box-sizing: border-box; padding: 0 14px; border: 0; border-radius: 8px; font-family: inherit; font-size: 15px; background: {{searchBg}}; color: #E8F1F5; box-shadow: inset 0 0 0 1px rgba(95,212,240,0.55)"></label>
        <span style="font-size: 12px; color: #7BD88F">Ngu\u1ED3n: OpenStreetMap \xB7 logo h\xE3ng t\u1EF1 l\u1EA5y khi build</span>
      </div>
      <div style="position: absolute; left: 20px; right: 20px; top: 76px; display: flex; gap: 10px; flex-wrap: wrap">
        <sc-for list="{{cats}}" as="c" hint-placeholder-count="8">
          <button onClick="{{c.pick}}" aria-pressed="{{c.on}}" style="border: 0; cursor: pointer; font-family: inherit; width: 126px; height: 96px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border-radius: 8px; background: {{c.bg}}; color: #FFFFFF; box-shadow: {{c.ring}}">
            <sc-if value="{{c.logo}}" hint-placeholder-val="{{ false }}"><span style="width: 52px; height: 44px; border: 1.5px dashed #FFFFFF; border-radius: 6px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; font-size: 9px; line-height: 1.1; text-align: center; padding: 2px; background: rgba(255,255,255,0.12)">[logo]</span></sc-if>
            <sc-if value="{{c.sign}}" hint-placeholder-val="{{ true }}"><span style="width: 40px; height: 40px; border: 2px solid #FFFFFF; border-radius: 6px; box-sizing: border-box; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{c.icon}}"></path></svg></span></sc-if>
            <span style="font-size: 13px; font-weight: 700; font-family: Overpass, sans-serif">{{c.label}}</span>
          </button>
        </sc-for>
        <button class="btn" style="width: 126px; height: 96px; font-size: 13px">+ Th\xEAm N\xFAt</button>
      </div>
      <div style="position: absolute; left: 20px; right: 20px; top: 194px; display: flex; align-items: center; gap: 10px">
        <span class="lbl">{{catTitle}} \xB7 {{searchNote}}</span>
        <span data-demo="1" style="font-size: 11px; color: #2A1A00; background: #FBB040; border-radius: 4px; padding: 1px 6px; font-weight: 700">S\u1ED0 LI\u1EC6U M\u1EAAU</span>
      </div>
      <div class="scrl" style="position: absolute; left: 20px; right: 20px; top: 222px; height: 370px; display: flex; flex-direction: column; gap: 8px">
        <sc-for list="{{results}}" as="r" hint-placeholder-count="4">
          <div class="pnl" style="flex-shrink: 0; min-height: 80px; padding: 10px 16px; box-sizing: border-box; display: flex; align-items: center; gap: 16px">
            <span aria-hidden="true" style="width: 52px; height: 52px; flex-shrink: 0; border: 1.5px dashed #8FC3D3; border-radius: 8px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9px; line-height: 1.15; color: #CFE6EE; padding: 3px; overflow: hidden; background: {{r.logoBg}}"><sc-if value="{{r.logoImg}}" hint-placeholder-val="{{ false }}"><img src="{{r.logoUrl}}" alt="" style="max-width: 46px; max-height: 46px; object-fit: contain"></sc-if><sc-if value="{{r.logoTxt}}" hint-placeholder-val="{{ true }}">{{r.logo}}</sc-if></span>
            <div style="flex: 1; min-width: 0"><div style="font-size: 17px; font-weight: 700">{{r.name}}</div><div style="font-size: 13px; color: #8FC3D3">{{r.addr}}</div></div>
            <div style="width: 90px; text-align: center"><div style="font-size: 20px; font-weight: 700; color: #FFD08A">{{r.km}}</div><div style="font-size: 11px; color: #8FC3D3">t\u1EDBi {{r.eta}}</div></div>
            <div style="width: 110px; text-align: center; font-size: 13px; font-weight: 700; color: {{r.openC}}">{{r.open}}</div>
            <div style="width: 90px; text-align: center; font-size: 13px; color: #CFE6EE">{{r.side}}</div>
            <div style="width: 110px; text-align: center; font-size: 13px; color: #CFE6EE">{{r.price}}</div>
            <button onClick="{{r.nav}}" class="btn btn-o" style="height: 40px">Ch\u1EC9 \u0110\u01B0\u1EDDng</button>
            <button onClick="{{r.addStop}}" class="btn" style="height: 40px">+ Ch\u1EB7ng Gh\xE9</button>
            <button onClick="{{r.save}}" class="btn" style="height: 40px">L\u01B0u</button>
          </div>
        </sc-for>
      </div>
      <div class="pnl" style="position: absolute; left: 20px; right: 20px; bottom: 16px; height: 52px; padding: 0 16px; display: flex; align-items: center; gap: 10px; box-shadow: inset 0 0 0 1px #FBB040">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBB040" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M4 20h11M7 8h5M14 9h2l2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3"></path></svg>
        <span style="font-size: 14px">{{fuelNote}}</span>
      </div>
    </sc-if>

    <!-- ========== 6. WORKSPACE TR\xCAN DEX ========== -->
    <sc-if value="{{isDex}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; left: 20px; right: 20px; top: 12px; display: flex; align-items: center; gap: 8px">
        <span style="font-size: 20px; font-weight: 700; color: #FBB040">Workspace tr\xEAn Samsung DeX</span>
        <sc-for list="{{dx.modes}}" as="m" hint-placeholder-count="2"><button onClick="{{m.pick}}" aria-pressed="{{m.on}}" class="pill" style="background: {{m.bg}}; color: {{m.fg}}">{{m.label}}</button></sc-for>
        <span style="margin-left: auto"></span>
        <button onClick="{{dexApps}}" class="pill" style="background: #0D2C40; color: #CFF6FF">{{dx.appsL}}</button>
        <button onClick="{{dexTask}}" class="pill" style="background: #0D2C40; color: #CFF6FF">{{dx.taskL}}</button>
      </div>
      <!-- m\xE0n h\xECnh DeX m\xF4 ph\u1ECFng -->
      <div style="position: absolute; left: 20px; top: 60px; width: 1240px; height: 540px; background: #1A2733; border-radius: 6px; overflow: hidden; box-shadow: inset 0 0 0 1px #33495A">
        <sc-if value="{{dx.before}}" hint-placeholder-val="{{ false }}">
          <div style="position: absolute; left: 120px; top: 80px; width: 460px; height: 300px; background: #0D1720; border-radius: 6px; box-shadow: 0 6px 20px rgba(0,0,0,0.5)"><div style="height: 26px; background: #22313D; font-size: 12px; padding: 5px 10px; box-sizing: border-box">Waze</div></div>
          <div style="position: absolute; left: 600px; top: 120px; width: 320px; height: 260px; background: #141018; border-radius: 6px; box-shadow: 0 6px 20px rgba(0,0,0,0.5)"><div style="height: 26px; background: #2A2030; font-size: 12px; padding: 5px 10px; box-sizing: border-box">Tom's Jukebox</div></div>
          <div style="position: absolute; left: 50%; top: 420px; transform: translateX(-50%); font-size: 14px; color: #FF9A9E">0.9.0: app m\u1EDF ra nh\u1ECF, ch\u1EEBa kho\u1EA3ng tr\u1ED1ng \u2014 kh\xF4ng full m\xE0n h\xECnh</div>
        </sc-if>
        <sc-if value="{{dx.after}}" hint-placeholder-val="{{ true }}">
          <div style="position: absolute; left: 0; top: 0; bottom: {{dx.taskH}}px; right: 56px; display: flex; gap: 4px">
            <div style="flex: {{dx.f1}}; position: relative; background: #0D1720"><div style="height: 26px; background: #22313D; font-size: 12px; padding: 5px 10px; box-sizing: border-box">Waze</div><svg aria-hidden="true" viewBox="0 0 400 300" preserveAspectRatio="none" style="position: absolute; left: 0; top: 26px; width: 100%; height: calc(100% - 26px)"><path d="M180 300 C175 240 200 190 230 150 C260 110 250 60 290 0" fill="none" stroke="#33CCFF" stroke-width="6"></path></svg></div>
            <sc-if value="{{dx.two}}" hint-placeholder-val="{{ true }}"><div style="flex: 1; position: relative; background: #141018"><div style="height: 26px; background: #2A2030; font-size: 12px; padding: 5px 10px; box-sizing: border-box">Tom's Jukebox</div></div></sc-if>
          </div>
          <div style="position: absolute; right: 0; top: 0; bottom: {{dx.taskH}}px; width: 56px; background: #03111C; box-shadow: inset 1px 0 0 rgba(95,212,240,0.55); display: flex; flex-direction: column; align-items: center; gap: 10px; padding-top: 12px; box-sizing: border-box">
            <span style="font-size: 11px; font-weight: 700; color: #FBB040; writing-mode: vertical-rl">TOM'S CAR</span>
            <button class="btn" aria-label="V\u1EC1 Tom's Car" style="width: 42px; padding: 0">\u2302</button>
            <button class="btn" aria-label="Tr\u1EE3 l\xFD" style="width: 42px; padding: 0; color: #5FD4F0">\u25CF</button>
            <button class="btn" aria-label="\u0110\u1ED5i Workspace" style="width: 42px; padding: 0">\u21C4</button>
          </div>
          <sc-if value="{{dx.showTask}}" hint-placeholder-val="{{ true }}">
            <div style="position: absolute; left: 0; right: 0; bottom: 0; height: 40px; background: #0B141B; display: flex; align-items: center; gap: 14px; padding: 0 14px; font-size: 12px; color: #9FB7C4">Thanh t\xE1c v\u1EE5 DeX</div>
          </sc-if>
        </sc-if>
      </div>
      <div class="pnl" style="position: absolute; left: 20px; right: 20px; bottom: 14px; min-height: 52px; padding: 8px 16px; box-sizing: border-box; display: flex; align-items: center; gap: 12px; box-shadow: inset 0 0 0 1px #FBB040">
        <span style="font-size: 14px; flex: 1">M\u1EB9o: n\u1EBFu Waze kh\xF4ng ch\u1ECBu ph\xF3ng to, b\u1EADt <b style="color: #FFD08A">DeX Labs \u2192 "Bu\u1ED9c app thay \u0111\u1ED5i k\xEDch th\u01B0\u1EDBc"</b>. Tom's Car s\u1EBD nh\u1EAFc khi c\u1EA7n. C\u1EA7n b\u1EA1n th\u1EED tr\xEAn Note 8.</span>
        <button class="btn btn-o" style="height: 38px">M\u1EDF DeX Labs</button>
      </div>
    </sc-if>

    <!-- ========== 7. LI\xCAN L\u1EA0C (cu\u1ED9c g\u1ECDi + tin nh\u1EAFn) ========== -->
    <sc-if value="{{isContacts}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; left: 20px; right: 20px; top: 14px; display: flex; align-items: center; gap: 10px">
        <button onClick="{{goHome}}" aria-label="V\u1EC1 M\xE0n H\xECnh Ch\xEDnh" class="btn" style="width: 44px; padding: 0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg></button>
        <span style="font-size: 24px; font-weight: 700; color: #FBB040">Li\xEAn L\u1EA1c</span>
        <sc-for list="{{ct.tabs}}" as="t" hint-placeholder-count="2"><button onClick="{{t.pick}}" aria-pressed="{{t.on}}" class="pill" style="background: {{t.bg}}; color: {{t.fg}}">{{t.label}}</button></sc-for>
        <span style="font-size: 11px; color: #2A1A00; background: #FBB040; border-radius: 4px; padding: 1px 6px; font-weight: 700">S\u1ED0 LI\u1EC6U M\u1EAAU</span>
        <span style="margin-left: auto; font-size: 12px; color: {{ct.modeC}}">{{ct.modeL}}</span>
      </div>
      <sc-if value="{{ct.msgs}}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; left: 20px; right: 20px; top: 70px; display: flex; gap: 6px; flex-wrap: wrap">
          <sc-for list="{{ct.apps}}" as="a" hint-placeholder-count="6"><button onClick="{{a.pick}}" aria-pressed="{{a.on}}" class="pill" style="display: flex; align-items: center; gap: 6px; background: {{a.bg}}; color: {{a.fg}}"><span aria-hidden="true" style="width: 20px; height: 20px; border-radius: 5px; background: {{a.tile}}; color: #FFFFFF; font-size: 10px; display: inline-flex; align-items: center; justify-content: center">{{a.letter}}</span>{{a.label}}</button></sc-for>
        </div>
      </sc-if>
      <div class="scrl" style="position: absolute; left: 20px; right: 20px; top: {{ct.listTop}}px; bottom: 70px; display: flex; flex-direction: column; gap: 8px">
        <sc-for list="{{ct.rows}}" as="r" hint-placeholder-count="5">
          <div class="pnl" style="flex-shrink: 0; min-height: 70px; padding: 10px 16px; box-sizing: border-box; display: flex; align-items: center; gap: 14px">
            <span aria-hidden="true" style="width: 42px; height: 42px; border-radius: 50%; background: {{r.avBg}}; color: #FFFFFF; font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0">{{r.av}}</span>
            <div style="flex: 1; min-width: 0">
              <div style="display: flex; align-items: center; gap: 8px"><span style="font-size: 16px; font-weight: 700">{{r.name}}</span><span style="font-size: 11px; color: #2A1A00; background: {{r.tagBg}}; border-radius: 4px; padding: 0 6px">{{r.tag}}</span><span aria-hidden="true" style="width: 18px; height: 18px; border-radius: 4px; background: {{r.tile}}; color: #FFFFFF; font-size: 9px; display: {{r.tileShow}}; align-items: center; justify-content: center">{{r.letter}}</span></div>
              <div style="font-size: 13px; color: {{r.subC}}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.sub}}</div>
            </div>
            <span style="font-size: 12px; color: #8FC3D3; white-space: nowrap">{{r.time}}</span>
            <sc-if value="{{r.unread}}" hint-placeholder-val="{{ false }}"><span style="min-width: 22px; height: 22px; border-radius: 11px; background: #FBB040; color: #2A1A00; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center">{{r.unreadN}}</span></sc-if>
            <button onClick="{{r.act}}" class="btn {{r.actCls}}" style="height: 40px">{{r.actL}}</button>
          </div>
        </sc-for>
      </div>
      <div style="position: absolute; left: 20px; right: 20px; bottom: 16px; font-size: 12px; color: #8FC3D3; line-height: 1.5">{{ct.note}}</div>
    </sc-if>

    <!-- ===== thanh cu\u1ED9c g\u1ECDi m\u1ECFng (n\u1EB1m tr\xEAn m\u1ECDi m\xE0n h\xECnh) ===== -->
    <sc-if value="{{cb.on}}" hint-placeholder-val="{{ false }}">
      <div role="alert" class="fadein" style="position: absolute; left: 20px; right: 20px; top: 8px; height: 60px; z-index: 26; display: flex; align-items: center; gap: 14px; padding: 0 12px 0 16px; border-radius: 12px; background: #0B2A1E; box-shadow: 0 6px 24px rgba(0,0,0,0.55), inset 0 0 0 1px #7BD88F">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7BD88F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"></path></svg>
        <div style="min-width: 0; flex: 1">
          <div style="display: flex; align-items: center; gap: 8px"><span style="font-size: 17px; font-weight: 700">{{cb.name}}</span><span style="font-size: 11px; color: #2A1A00; background: #FFD08A; border-radius: 4px; padding: 0 6px">{{cb.group}}</span><span style="font-size: 12px; color: #BFF0CA">{{cb.state}}</span></div>
          <div style="font-size: 12px; color: #CFE6EE; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{cb.sub}}</div>
        </div>
        <sc-if value="{{cb.ring}}" hint-placeholder-val="{{ true }}">
          <button onClick="{{cb.decline}}" class="btn btn-r" style="height: 46px; width: 120px; font-size: 16px">T\u1EEB Ch\u1ED1i</button>
          <button onClick="{{cb.answer}}" class="btn" style="height: 46px; width: 120px; font-size: 16px; background: #1E8E4A; color: #FFFFFF; box-shadow: none">Nghe</button>
        </sc-if>
        <sc-if value="{{cb.talk}}" hint-placeholder-val="{{ false }}">
          <button onClick="{{cb.mute}}" aria-pressed="{{cb.muteOn}}" class="btn" style="height: 46px; color: {{cb.muteC}}">{{cb.muteL}}</button>
          <button onClick="{{cb.spk}}" class="btn" style="height: 46px">{{cb.spkL}}</button>
          <button onClick="{{cb.hang}}" class="btn btn-r" style="height: 46px; width: 120px; font-size: 16px">G\xE1c M\xE1y</button>
        </sc-if>
      </div>
    </sc-if>
    <sc-if value="{{toastOn}}" hint-placeholder-val="{{ false }}">
      <div class="pnl fadein" role="status" style="position: absolute; left: 50%; top: 80px; transform: translateX(-50%); z-index: 26; padding: 10px 18px; font-size: 14px; color: #E8F1F5; white-space: nowrap; background: #06192A">{{toastText}}</div>
    </sc-if>


    <!-- ===== \u0111\u1ED3ng h\u1ED3 l\u1EADt l\u1EDBn (ch\u1EA1m \u0111\u1ED3ng h\u1ED3 / \u0111\u1EADu xe l\xE2u) ===== -->
    <sc-if value="{{clk.big}}" hint-placeholder-val="{{ false }}">
      <button onClick="{{clk.closeBig}}" aria-label="\u0110\xF3ng \u0111\u1ED3ng h\u1ED3 l\u1EDBn" class="fadein" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 22; border: 0; padding: 0; cursor: pointer; font-family: inherit; color: #E8F1F5; background: rgba(1,6,10,0.88); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px">
        <span style="display: flex; align-items: center; gap: 10px"><sc-for list="{{clk.bigCards}}" as="cd" hint-placeholder-count="4"><span class="fcard fbig {{cd.cls}}" style="margin-left: {{cd.gap}}px">{{cd.d}}</span></sc-for></span>
        <span style="font-size: 26px; font-weight: 700">{{clk.bigDate}}</span>
        <span style="font-size: 18px; color: #CFE6EE">{{clk.bigSub}}</span>
        <span style="font-size: 13px; color: #8FC3D3">Ch\u1EA1m \u0111\u1EC3 \u0111\xF3ng</span>
      </button>
    </sc-if>

    <!-- ===== c\u1EEDa s\u1ED5 h\u1EB9p: c\u1ED9t Road Trip g\u1ECDn c\u1EA1nh b\u1EA3n \u0111\u1ED3 ===== -->
    <sc-if value="{{isCompact}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; padding: 14px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; background: #03111C">
        <div style="display: flex; align-items: center; gap: 8px"><span style="font-size: 18px; font-weight: 700; color: #FBB040">Tom's Car</span><span style="flex: 1"></span><span class="tnum" style="font-size: 18px; font-weight: 700; color: #CFF6FF">{{clock}}</span></div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 14px">
          <span class="tnum" style="font-size: 64px; font-weight: 700; line-height: 1; color: {{sb.c}}; text-align: center">{{sb.num}}</span>
          <sc-if value="{{sb.limShow}}" hint-placeholder-val="{{ true }}"><div style="width: 52px; height: 68px; background: #FFFFFF; border-radius: 5px; box-sizing: border-box; border: {{sb.limBorder}}; display: flex; align-items: center; justify-content: center"><div style="width: 42px; height: 42px; border-radius: 50%; border: 5px solid #D0202E; box-sizing: border-box; display: flex; align-items: center; justify-content: center; font-family: Overpass, sans-serif; font-weight: 800; font-size: 16px; color: #111111">{{sb.lim}}</div></div></sc-if>
        </div>
        <div class="pnl nxt" style="padding: 12px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px"><span class="lbl">CH\u1EB6NG GH\xC9 K\u1EBE</span><span style="font-size: 18px; font-weight: 700">{{cp.next}}</span><span style="font-size: 14px; color: #FFD08A">{{cp.nextSub}}</span></div>
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
          <div class="pnl" style="padding: 10px; text-align: center"><div class="lbl">C\xD2N L\u1EA0I</div><div style="font-size: 18px; font-weight: 700">{{cp.left}}</div></div>
          <div class="pnl" style="padding: 10px; text-align: center"><div class="lbl">T\u1EDAI N\u01A0I</div><div style="font-size: 18px; font-weight: 700">{{cp.eta}}</div></div>
        </div>
        <div class="pnl" style="padding: 10px; text-align: center; font-size: 14px; color: #CFE6EE">{{cp.rest}}</div>
        <div class="pnl" style="padding: 8px 10px; display: flex; align-items: center; gap: 10px">
          <button onClick="{{togglePlay}}" aria-label="{{playLabel}}" style="width: 40px; height: 40px; border: 0; border-radius: 50%; cursor: pointer; flex-shrink: 0; background: #FBB040; color: #2A1A00; display: flex; align-items: center; justify-content: center"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="{{playIcon}}"></path></svg></button>
          <span style="flex: 1; min-width: 0; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{songTitle}}</span>
        </div>
        <span style="flex: 1"></span>
        <div style="display: flex; gap: 8px">
          <button onClick="{{startListen}}" class="btn" aria-label="Tr\u1EE3 l\xFD gi\u1ECDng n\xF3i" style="flex: 1; height: 52px; color: #5FD4F0">Tr\u1EE3 L\xFD</button>
          <button onClick="{{cp.full}}" class="btn" style="flex: 1; height: 52px">M\u1EDF R\u1ED9ng</button>
        </div>
      </div>
    </sc-if>

    <!-- ===== h\u1ED9p tho\u1EA1i: Tho\xE1t ===== -->
    <sc-if value="{{exitOpen}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(1,6,10,0.7); display: flex; align-items: center; justify-content: center; z-index: 20">
        <div role="dialog" aria-label="Tho\xE1t Tom's Car" class="pnl fadein" style="width: 520px; padding: 26px; display: flex; flex-direction: column; gap: 14px; background: #06192A">
          <div style="font-size: 22px; font-weight: 700">Tho\xE1t Tom's Car?</div>
          <div style="font-size: 14px; color: #CFE6EE">Tho\xE1t h\u1EB3n s\u1EBD t\u1EAFt GPS v\xE0 OBD-II. Ch\u1EA1y n\u1EC1n th\xEC v\u1EABn \u0111o chuy\u1EBFn \u0111i v\xE0 nghe tr\u1EE3 l\xFD.</div>
          <div style="display: flex; gap: 10px">
            <button onClick="{{exitHard}}" class="btn btn-r" style="flex: 1; height: 56px; font-size: 16px">Tho\xE1t H\u1EB3n</button>
            <button onClick="{{exitBg}}" class="btn" style="flex: 1; height: 56px; font-size: 16px">Ch\u1EA1y N\u1EC1n</button>
            <button onClick="{{closeExit}}" class="btn" style="flex: 1; height: 56px; font-size: 16px">H\u1EE7y</button>
          </div>
        </div>
      </div>
    </sc-if>

    <!-- ===== h\u1ED9p tho\u1EA1i: T\u1EA1o Workspace (ch\u1ECDn m\u1ECDi app trong m\xE1y + widget) ===== -->
    <sc-if value="{{createOpen}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(1,6,10,0.7); display: flex; align-items: center; justify-content: center; z-index: 20">
        <div role="dialog" aria-label="T\u1EA1o Workspace" class="pnl fadein" style="width: 1040px; height: 620px; padding: 20px 22px; box-sizing: border-box; display: flex; gap: 20px; background: #06192A">
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px">
            <div style="display: flex; align-items: center; gap: 12px"><span style="font-size: 22px; font-weight: 700">T\u1EA1o Workspace</span><span style="font-size: 12px; color: #8FC3D3">Ch\u1ECDn t\u1ED1i \u0111a 3 \xF4 \u2014 app ho\u1EB7c widget</span></div>
            <label style="display: flex"><span style="position: absolute; left: -9999px">T\xECm app</span><input type="text" value="{{ws.q}}" onChange="{{ws.setQ}}" placeholder="T\xECm app trong m\xE1y (vd: spo)" style="flex: 1; height: 42px; padding: 0 12px; border: 0; border-radius: 8px; font-family: inherit; font-size: 15px; background: #0D2C40; color: #E8F1F5"></label>
            <div style="display: flex; gap: 6px; flex-wrap: wrap">
              <sc-for list="{{ws.groups}}" as="g" hint-placeholder-count="8"><button onClick="{{g.pick}}" aria-pressed="{{g.on}}" class="pill" style="height: 30px; font-size: 12px; background: {{g.bg}}; color: {{g.fg}}">{{g.label}}</button></sc-for>
            </div>
            <div class="scrl" style="flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; align-content: start; padding-right: 4px">
              <sc-for list="{{ws.apps}}" as="a" hint-placeholder-count="12">
                <button onClick="{{a.pick}}" aria-pressed="{{a.on}}" style="position: relative; border: 0; cursor: pointer; font-family: inherit; height: 96px; border-radius: 10px; background: {{a.bg}}; box-shadow: {{a.ring}}; color: #E8F1F5; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 4px">
                  <span aria-hidden="true" style="width: 44px; height: 44px; border-radius: {{a.radius}}; background: {{a.tile}}; background-size: cover; color: #FFFFFF; font-weight: 700; font-size: 16px; display: flex; align-items: center; justify-content: center">{{a.letter}}</span>
                  <span style="font-size: 12px; line-height: 1.15; text-align: center">{{a.name}}</span>
                  <sc-if value="{{a.sel}}" hint-placeholder-val="{{ false }}"><span style="position: absolute; right: 6px; top: 6px; width: 24px; height: 24px; border-radius: 50%; background: #FBB040; color: #2A1A00; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center">{{a.n}}</span></sc-if>
                </button>
              </sc-for>
            </div>
            <div data-demo="1" style="font-size: 11px; color: #8FC3D3">\xD4 vu\xF4ng ch\u1EEF c\xE1i ch\u1EC9 l\xE0 h\xECnh m\u1EABu \u2014 app th\u1EADt hi\u1EC7n \u0111\xFAng icon c\u1EE7a t\u1EEBng app l\u1EA5y t\u1EEB m\xE1y.</div>
          </div>
          <div style="width: 300px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px">
            <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #8FC3D3">T\xEAn Workspace<input type="text" value="{{wsName}}" onChange="{{setWsName}}" placeholder="vd: \u0110i Adelaide" style="height: 42px; padding: 0 12px; border: 0; border-radius: 8px; font-family: inherit; font-size: 15px; background: #0D2C40; color: #E8F1F5"></label>
            <div class="lbl">C\xC1CH CHIA M\xC0N H\xCCNH</div>
            <div aria-label="H\xECnh thu nh\u1ECF c\xE1ch chia" style="height: 150px; display: flex; gap: 4px; padding: 4px; border-radius: 8px; background: #0A1B28; box-shadow: inset 0 0 0 1px rgba(95,212,240,0.4)">
              <sc-for list="{{ws.thumb}}" as="b" hint-placeholder-count="2"><div style="flex: {{b.flex}}; min-width: 0; border-radius: 5px; background: {{b.bg}}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 4px; text-align: center"><span style="width: 22px; height: 22px; border-radius: 50%; background: #FBB040; color: #2A1A00; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center">{{b.n}}</span><span style="font-size: 12px">{{b.name}}</span></div></sc-for>
            </div>
            <div style="font-size: 12px; color: {{ws.hintC}}">{{ws.hint}}</div>
            <button onClick="{{toggleRtCheck}}" role="checkbox" aria-checked="{{rtCheck}}" style="border: 0; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 10px; background: transparent; color: #E8F1F5; font-size: 14px; padding: 0; text-align: left">
              <span style="width: 26px; height: 26px; flex-shrink: 0; border-radius: 6px; box-shadow: inset 0 0 0 2px #FBB040; display: flex; align-items: center; justify-content: center; color: #2A1A00; background: {{rtCheckBg}}; font-weight: 700">{{rtCheckMark}}</span>
              M\u1EDF Road Trip (chia b\u1EA3n \u0111\u1ED3 + Road Trip)
            </button>
            <span style="flex: 1"></span>
            <div style="display: flex; gap: 10px; justify-content: flex-end">
              <button onClick="{{closeCreate}}" class="btn">H\u1EE7y</button>
              <button onClick="{{saveWs}}" class="btn btn-o">L\u01B0u Workspace</button>
            </div>
          </div>
        </div>
      </div>
    </sc-if>

    <!-- ===== Road Trip: th\xEAm ch\u1EB7ng / th\xEAm t\u1EEB danh s\xE1ch / x\xE1c nh\u1EADn xo\xE1 ===== -->
    <sc-if value="{{addOpen}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(1,6,10,0.7); display: flex; align-items: center; justify-content: center; z-index: 20">
        <div role="dialog" aria-label="Th\xEAm ch\u1EB7ng" class="pnl fadein" style="width: 560px; padding: 24px; display: flex; flex-direction: column; gap: 12px; background: #06192A">
          <div style="font-size: 22px; font-weight: 700">Th\xEAm Ch\u1EB7ng</div>
          <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #8FC3D3">G\xF5 t\xEAn ho\u1EB7c \u0111\u1ECBa ch\u1EC9<input type="text" value="{{addQ}}" onChange="{{setAddQ}}" placeholder="vd: Bordertown Bakery" style="height: 44px; padding: 0 12px; border: 0; border-radius: 8px; font-family: inherit; font-size: 15px; background: #0D2C40; color: #E8F1F5"></label>
          <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #8FC3D3">Ho\u1EB7c d\xE1n link Google Maps<input type="text" value="{{addLink}}" onChange="{{setAddLink}}" placeholder="https://maps.app.goo.gl/\u2026" style="height: 44px; padding: 0 12px; border: 0; border-radius: 8px; font-family: inherit; font-size: 15px; background: #0D2C40; color: #E8F1F5"></label>
          <button onClick="{{addHere}}" class="btn" style="height: 50px">L\u01B0u Ch\u1ED7 \u0110ang \u0110\u1EE9ng</button>
          <div style="font-size: 12px; color: #FFD08A">{{addMsg}}</div>
          <div style="display: flex; gap: 10px; justify-content: flex-end"><button onClick="{{closeDlg}}" class="btn">H\u1EE7y</button><button onClick="{{addFind}}" class="btn btn-o">Th\xEAm</button></div>
        </div>
      </div>
    </sc-if>
    <sc-if value="{{pickOpen}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(1,6,10,0.7); display: flex; align-items: center; justify-content: center; z-index: 20">
        <div role="dialog" aria-label="Th\xEAm t\u1EEB danh s\xE1ch" class="pnl fadein" style="width: 600px; height: 540px; padding: 22px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; background: #06192A">
          <div style="font-size: 22px; font-weight: 700">Th\xEAm T\u1EEB Danh S\xE1ch</div>
          <div style="font-size: 13px; color: #8FC3D3">B\u1EA5m l\xE0 app t\u1EF1 ch\xE8n v\xE0o \u0111\xFAng ch\u1ED7 tr\xEAn \u0111\u01B0\u1EDDng ({{legName}})</div>
          <div class="scrl" style="flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 6px">
            <sc-for list="{{saved}}" as="p" hint-placeholder-count="8">
              <button onClick="{{p.add}}" disabled="{{p.has}}" style="flex-shrink: 0; border: 0; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; background: #0D2C40; color: #E8F1F5; text-align: left; opacity: {{p.op}}">
                <span style="width: 30px; height: 30px; border-radius: 4px; background: {{p.sign}}; border: 2px solid #FFFFFF; box-sizing: border-box; display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{p.icon}}"></path></svg></span>
                <span style="flex: 1; min-width: 0"><span style="display: block; font-size: 14px; font-weight: 700">{{p.name}}</span><span style="display: block; font-size: 11px; color: #8FC3D3">{{p.town}} \xB7 km {{p.km}}</span></span>
                <span style="font-size: 13px; font-weight: 700; color: {{p.stC}}">{{p.st}}</span>
              </button>
            </sc-for>
          </div>
          <div style="display: flex; justify-content: flex-end"><button onClick="{{closeDlg}}" class="btn btn-o">Xong</button></div>
        </div>
      </div>
    </sc-if>
    <sc-if value="{{delOpen}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(1,6,10,0.7); display: flex; align-items: center; justify-content: center; z-index: 20">
        <div role="dialog" aria-label="Xo\xE1 ch\u1EB7ng" class="pnl fadein" style="width: 480px; padding: 24px; display: flex; flex-direction: column; gap: 14px; background: #06192A">
          <div style="font-size: 20px; font-weight: 700">Xo\xE1 "{{delName}}"?</div>
          <div style="font-size: 14px; color: #CFE6EE">Mu\u1ED1n ch\u1EC9 b\u1ECF qua chuy\u1EBFn n\xE0y th\xEC b\u1EA5m \u2298 thay v\xEC xo\xE1.</div>
          <div style="display: flex; gap: 10px; justify-content: flex-end"><button onClick="{{closeDlg}}" class="btn">H\u1EE7y</button><button onClick="{{confirmDel}}" class="btn btn-r">Xo\xE1 H\u1EB3n</button></div>
        </div>
      </div>
    </sc-if>

    <!-- ===== th\u1EBB chi ti\u1EBFt ch\u1EB7ng (h\xECnh \u0111\u1EA1i di\u1EC7n) ===== -->
    <sc-if value="{{stopOpen}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(1,6,10,0.7); display: flex; align-items: center; justify-content: center; z-index: 20">
        <div role="dialog" aria-label="{{sd.name}}" class="pnl fadein" style="width: 600px; padding: 0 0 20px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; background: #06192A">
          <sc-if value="{{sd.hasPhoto}}" hint-placeholder-val="{{ false }}"><img src="{{sd.photo}}" alt="{{sd.name}}" style="display: block; width: 100%; height: 230px; object-fit: cover"></sc-if>
          <sc-if value="{{sd.noPhoto}}" hint-placeholder-val="{{ true }}">
          <div class="ph" style="height: 230px; flex-direction: column; gap: 8px; text-align: center; padding: 0 30px">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4zM12 10a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7z"></path></svg>
            <span style="font-size: 13px">{{sd.photoNote}}</span>
          </div>
          </sc-if>
          <div style="padding: 0 22px; display: flex; flex-direction: column; gap: 6px">
            <div style="display: flex; align-items: center; gap: 10px"><span style="width: 30px; height: 30px; border-radius: 4px; background: {{sd.sign}}; border: 2px solid #FFFFFF; box-sizing: border-box; display: flex; align-items: center; justify-content: center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{sd.icon}}"></path></svg></span><span style="font-size: 22px; font-weight: 700">{{sd.name}}</span></div>
            <div style="font-size: 14px; color: #CFE6EE">{{sd.town}} \xB7 {{sd.info}}</div>
          </div>
          <div style="padding: 0 22px; display: flex; gap: 8px; flex-wrap: wrap">
            <label class="btn" style="position: relative">Ch\u1EE5p H\xECnh Ch\u1ED7 N\xE0y<input type="file" accept="image/*" capture="environment" onChange="{{sd.onPhoto}}" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; opacity: 0; cursor: pointer"></label>
            <label class="btn" style="position: relative">Ch\u1ECDn T\u1EEB Th\u01B0 Vi\u1EC7n<input type="file" accept="image/*" onChange="{{sd.onPhoto}}" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; opacity: 0; cursor: pointer"></label>
            <button onClick="{{sd.nav}}" class="btn btn-o">Ch\u1EC9 \u0110\u01B0\u1EDDng</button>
            <button onClick="{{closeDlg}}" class="btn" style="margin-left: auto">\u0110\xF3ng</button>
          </div>
        </div>
      </div>
    </sc-if>

    <!-- ===== tr\u1EA3 l\u1EDDi nhanh tin nh\u1EAFn ===== -->
    <sc-if value="{{replyOpen}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(1,6,10,0.7); display: flex; align-items: center; justify-content: center; z-index: 20">
        <div role="dialog" aria-label="Tr\u1EA3 l\u1EDDi nhanh" class="pnl fadein" style="width: 560px; padding: 22px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; background: #06192A">
          <div style="font-size: 20px; font-weight: 700">Tr\u1EA3 l\u1EDDi {{rp.name}} qua {{rp.app}}</div>
          <sc-for list="{{rp.tpls}}" as="t" hint-placeholder-count="4"><button onClick="{{t.send}}" class="btn" style="height: 50px; justify-content: flex-start; font-size: 15px; font-weight: 600">{{t.text}}</button></sc-for>
          <button class="btn" style="height: 50px; color: #5FD4F0">N\xF3i \u0111\u1EC3 tr\u1EA3 l\u1EDDi\u2026</button>
          <div style="display: flex; justify-content: flex-end"><button onClick="{{closeDlg}}" class="btn">H\u1EE7y</button></div>
        </div>
      </div>
    </sc-if>


    <!-- ===== M\xE0n h\xECnh ch\xE0o + Gi\u1EDBi Thi\u1EC7u t\u1EF1 chuy\u1EC3n ===== -->
    <sc-if value="{{bootSplash}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 30; background: radial-gradient(ellipse at 50% 45%,#0B2A3E,#020A12 70%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px">
        <div style="font-size: 72px; font-weight: 700; line-height: 1; font-family: Bahnschrift, 'Barlow Semi Condensed', sans-serif; text-shadow: 0 0 20px rgba(95,212,240,0.7)"><span style="color: #48B0C8">TOM'S</span> <span style="color: #FBB040">CAR</span></div>
        <div style="font-size: 16px; color: #CFE6EE">Focus On One Thing And Do It Well</div>
        <div style="width: 320px; height: 4px; background: rgba(95,212,240,0.2); border-radius: 2px; overflow: hidden"><div class="bootbar" style="height: 100%; background: #FBB040"></div></div>
      </div>
    </sc-if>
    <sc-if value="{{bootAbout}}" hint-placeholder-val="{{ false }}">
      <div class="fadein" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 30; background: #03111C; display: flex; align-items: center; justify-content: center">
        <div class="pnl" style="width: 640px; padding: 30px; display: flex; flex-direction: column; gap: 12px; background: #06192A">
          <div style="font-size: 30px; font-weight: 700; color: #FBB040">Tom's Car <span style="font-size: 16px; color: #CFE6EE">{{verL}}</span></div>
          <div style="font-size: 14px; color: #CFE6EE; line-height: 1.6">M\xE0n h\xECnh xe cho Samsung DeX, \u0111i\u1EC7n tho\u1EA1i v\xE0 m\xE1y t\xEDnh b\u1EA3ng \xB7 Tom's Technology Solutions</div>
          <div style="height: 4px; background: rgba(95,212,240,0.2); border-radius: 2px; overflow: hidden"><div class="aboutbar" style="height: 100%; background: #5FD4F0"></div></div>
          <div style="display: flex; align-items: center; gap: 12px"><span style="flex: 1; font-size: 13px; color: #8FC3D3">{{aboutNote}}</span><button onClick="{{skipBoot}}" class="btn btn-o">V\xE0o Ngay</button></div>
        </div>
      </div>
    </sc-if>

    <!-- ===== Danh s\xE1ch 19 m\u1EE5c ===== -->
    <sc-if value="{{listOpen}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(1,6,10,0.75); display: flex; align-items: center; justify-content: center; z-index: 40">
        <div role="dialog" aria-label="Danh s\xE1ch 32 m\u1EE5c" class="pnl fadein" style="width: 900px; height: 620px; padding: 22px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; background: #06192A">
          <div style="display: flex; align-items: center"><span style="flex: 1; font-size: 22px; font-weight: 700">32 M\u1EE5c S\u1EEDa Sau Khi Th\u1EED 0.9.0</span><button onClick="{{closeList}}" class="btn">\u0110\xF3ng</button></div>
          <div class="scrl" style="flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; align-content: start">
            <sc-for list="{{items}}" as="it" hint-placeholder-count="32">
              <button onClick="{{it.go}}" style="border: 0; cursor: pointer; font-family: inherit; text-align: left; display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; border-radius: 8px; background: #0D2C40; color: #E8F1F5">
                <span style="width: 26px; height: 26px; border-radius: 50%; background: #FBB040; color: #2A1A00; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0">{{it.n}}</span>
                <span style="flex: 1; min-width: 0"><span style="display: block; font-size: 13px; font-weight: 700">{{it.t}}</span><span style="display: block; font-size: 11px; color: #8FC3D3">Xem \u1EDF: {{it.where}}</span></span>
              </button>
            </sc-for>
          </div>
        </div>
      </div>
    </sc-if>
  </div>
</div>
`;
window.__APP_PROPS = { "$preview": null };
