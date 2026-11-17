window.__AppComp = function() {
  const APP = !!(typeof window !== "undefined" && (window.TCNative || window.TCN));
  const tcn = (a, b) => {
    try {
      if (window.TCN) window.TCN.call(a, b == null ? "" : String(b));
    } catch (e) {
    }
  };
  const STORE = APP ? "tomscar-ui" : "tomscar-fix-demo";
  const TOWNS = [
    ["Melton", -37.683, 144.583],
    ["Bacchus Marsh", -37.675, 144.438],
    ["Ballarat", -37.562, 143.85, 1],
    ["Beaufort", -37.43, 143.383],
    ["Ararat", -37.283, 142.933],
    ["Stawell", -37.057, 142.78],
    ["Horsham", -36.717, 142.2, 1],
    ["Dimboola", -36.457, 142.025],
    ["Nhill", -36.333, 141.65],
    ["Kaniva", -36.38, 141.243],
    ["Bordertown", -36.307, 140.772, 1],
    ["Keith", -36.1, 140.35],
    ["Tintinara", -35.883, 140.05],
    ["Coonalpyn", -35.695, 139.855],
    ["Tailem Bend", -35.255, 139.455],
    ["Murray Bridge", -35.12, 139.276, 1],
    ["Hahndorf", -35.028, 138.81],
    ["Adelaide", -34.929, 138.601, 1],
    ["Geelong", -38.15, 144.362, 1],
    ["Bendigo", -36.757, 144.279, 1],
    ["Castlemaine", -37.064, 144.217],
    ["Daylesford", -37.342, 144.143],
    ["Mildura", -34.208, 142.125, 1],
    ["Swan Hill", -35.338, 143.554],
    ["Echuca", -36.13, 144.75],
    ["Mount Gambier", -37.828, 140.78, 1],
    ["Naracoorte", -36.958, 140.738],
    ["Hamilton", -37.744, 142.022],
    ["Warrnambool", -38.382, 142.488, 1],
    ["Colac", -38.339, 143.585],
    ["Shepparton", -36.383, 145.4, 1],
    ["Seymour", -37.027, 145.139],
    ["Wangaratta", -36.358, 146.312],
    ["Albury", -36.074, 146.914, 1],
    ["Wodonga", -36.122, 146.888],
    ["Traralgon", -38.195, 146.541],
    ["Sale", -38.1, 147.067],
    ["Gawler", -34.6, 138.75],
    ["Victor Harbor", -35.552, 138.617]
  ];
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
  const TGROUPS0 = [
    ["LOW-POLY", [["lp_au", "\u0110\u01B0\u1EDDng \xDAc (m\u1EB7c \u0111\u1ECBnh)"], ["lp_farm", "\u0110\u1ED3ng Qu\xEA Wimmera"], ["lp_coast", "Ven Bi\u1EC3n"], ["lp_outback", "Outback"], ["lp_melb", "Melbourne (tram)"], ["lp_dande", "R\u1EEBng Dandenong"], ["lp_yarra", "V\xF9ng Nho Yarra"], ["lp_snow", "N\xFAi Tuy\u1EBFt"], ["lp_autumn", "M\xF9a Thu L\xE1 V\xE0ng"], ["lp_wheat", "\u0110\u1ED3ng L\xFAa M\xEC"], ["lp_saigon", "S\xE0i G\xF2n"], ["lp_mekong", "Mi\u1EC1n T\xE2y"]]],
    ["KI\u1EC2U CH\xCDNH", [["neon", "Neon"], ["glass", "K\xEDnh M\u1EDD"], ["hud", "T\u1ED1i Gi\u1EA3n (HUD)"], ["plane", "Bu\u1ED3ng L\xE1i M\xE1y Bay"], ["synth", "Synthwave 80s"], ["cyber", "Th\xE0nh Ph\u1ED1 \u0110\xEAm"], ["rally", "Th\u1EC3 Thao (Rally)"], ["relax", "Th\u01B0 Gi\xE3n"]]],
    ["THU\u1EA6N \xDAC", [["outback", "Outback"], ["coast", "Ven Bi\u1EC3n"], ["melb", "Melbourne (tram)"], ["neonau", "Neon \xDAc"], ["dandenong", "R\u1EEBng Dandenong"], ["yarra", "Yarra Valley"], ["snow", "N\xFAi Tuy\u1EBFt"]]],
    ["MI\u1EC0N NAM", [["sgcenter", "Trung T\xE2m (\u0110\u1EE9c B\xE0)"], ["sgnight", "S\xE0i G\xF2n V\u1EC1 \u0110\xEAm"], ["mekong", "Mi\u1EC1n T\xE2y"], ["rain", "M\u01B0a Chi\u1EC1u"], ["benthanh", "Ch\u1EE3 B\u1EBFn Th\xE0nh"], ["sgold", "S\xE0i G\xF2n X\u01B0a"], ["coffee", "C\xE0 Ph\xEA S\xE1ng"], ["tet", "T\u1EBFt Mi\u1EC1n Nam"]]]
  ];
  const QC = { fuel: ["\u26FD", "C\xE2y x\u0103ng"], cafe: ["\u2615", "C\xE0 ph\xEA"], food: ["\u{1F35C}", "Qu\xE1n \u0103n"], fast: ["\u{1F354}", "\u0110\u1ED3 \u0103n nhanh"], shop: ["\u{1F6D2}", "Si\xEAu th\u1ECB"], pharm: ["\u{1F48A}", "Nh\xE0 thu\u1ED1c"], parking: ["\u{1F17F}", "B\xE3i \u0111\u1EADu"], wc: ["\u{1F6BB}", "Nh\xE0 v\u1EC7 sinh"], atm: ["\u{1F3E7}", "ATM"], ev: ["\u{1F50C}", "S\u1EA1c xe \u0111i\u1EC7n"], hosp: ["\u{1F3E5}", "B\u1EC7nh vi\u1EC7n"], church: ["\u26EA", "Nh\xE0 th\u1EDD"], hotel: ["\u{1F3E8}", "Kh\xE1ch s\u1EA1n"], repair: ["\u{1F527}", "S\u1EEDa xe"], green: ["\u{1F333}", "C\xF4ng vi\xEAn"], post: ["\u2709", "B\u01B0u \u0111i\u1EC7n"] };
  const QC_DEF = ["fuel", "cafe", "food", "fast", "shop", "pharm", "parking", "wc", "atm", "ev", "hosp", "church", "hotel", "repair", "green"];
  const ASI = { fuel: "M5 3h8a1 1 0 0 1 1 1v16H4V4a1 1 0 0 1 1-1zM6 5v5h6V5zM3 20h12v2H3zM14.6 6.4l1-1L19 8.8V17a2.5 2.5 0 0 1-5 0v-4.5h-.6V11H15.6v6a1 1 0 0 0 2 0V9.4z", cafe: "M4 8h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 9h1.5a2.5 2.5 0 0 1 0 5H16v-1.6h1.5a.9.9 0 0 0 0-1.8H16zM3 19h15v1.6H3zM8 2.5c1 1 1 2 0 3s-1 2 0 3H6.6c-1-1-1-2 0-3s1-2 0-3zM12 2.5c1 1 1 2 0 3s-1 2 0 3h-1.4c-1-1-1-2 0-3s1-2 0-3z", wc: "M7 1.6a2 2 0 1 1 0 4a2 2 0 1 1 0-4zM5 6.6h4l1.2 7H9v8.4H5v-8.4H3.8zM17 1.6a2 2 0 1 1 0 4a2 2 0 1 1 0-4zM15 6.6h4l2.4 8.4h-2v7h-4.8v-7h-2zM11.6 2h.8v20h-.8z", rest: "M12 1a5 4 0 0 1 5 4a4 3 0 0 1-2 6H9a4 3 0 0 1-2-6a5 4 0 0 1 5-4zM11.2 10.6h1.6V14h-1.6zM4 14h16v1.6H4zM6 15.6h1.6L5.6 22H4zM16.4 15.6H18l2 6.4h-1.6zM3 18.4h18v1.4H3z", shop: "M1.5 3H5l.6 2H21.5l-2.2 8.4H7.7l.4 1.6H19.5v1.6H6.9L3.9 4.6H1.5zM9 18.2a1.7 1.7 0 1 1 0 3.4a1.7 1.7 0 1 1 0-3.4zM17 18.2a1.7 1.7 0 1 1 0 3.4a1.7 1.7 0 1 1 0-3.4z", food: "M7 2h1.4v6.5a2 2 0 0 0 1.2-1.8V2H11v4.7A3.4 3.4 0 0 1 8.4 10v12H7V10a3.4 3.4 0 0 1-2.6-3.3V2h1.4v4.7A2 2 0 0 0 7 8.5zM15.5 2C18 2 19 5 19 8.5c0 2-1 3.5-2.4 3.8V22h-1.6V2z" };
  const icF = (k) => ASI[k] ? "#FFFFFF" : "none", icS = (k) => ASI[k] ? "none" : "#FFFFFF";
  const ICO = { cafe: "M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 4h-2M8 3v3M11 3v3", fuel: "M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M4 20h11M7 8h5M14 9h2l2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3", food: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 0-3 3-3 6s1 3 3 3v9", lake: "M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0M12 4l4 7H8z", sight: "M4 8h4l2-3h4l2 3h4v11H4zM12 11a3 3 0 1 0 0 6a3 3 0 1 0 0-6z", end: "M5 21V4M5 4h11l-2 4 2 4H5", wc: "M7 4a2 2 0 1 0 0 .1M17 4a2 2 0 1 0 0 .1M5 21v-7H4l1-6h4l1 6H9v7M15 21V8h4v7h-1v6", rest: "M3 14h18M5 14v6M19 14v6M7 14l2-6h6l2 6M12 3v5", shop: "M4 6h16l-2 9H6zM4 6L3 3M8 20a1.5 1.5 0 1 0 0 .1M17 20a1.5 1.5 0 1 0 0 .1" };
  const ICX = Object.assign({}, ICO, ASI);
  const SIGN = { cafe: "#1F5FAE", fuel: "#1F5FAE", food: "#1F5FAE", wc: "#1F5FAE", rest: "#1F5FAE", shop: "#1F5FAE", lake: "#6B3E26", sight: "#6B3E26", end: "#00653A" };
  let TOTAL = 727;
  let PLACES = {
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
  let BORDER = 425;
  const DEF_GO = ["flywheel", "pink", "kaniva", "keith", "coon"];
  const DEF_BACK = ["tailem", "coon", "keithb", "kaniva", "pink", "mcd", "flywheel"];
  let MINE_BACK = { tailem: 1, keithb: 1, mcd: 1 };
  let MINE_GO = { flywheel: 1, pink: 1, kaniva: 1, keith: 1, coon: 1 };
  const MA = { total: TOTAL, places: PLACES, border: BORDER, mineGo: MINE_GO, mineBack: MINE_BACK };
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
    vnVoice: "doan",
    navVol: 80,
    startScr: "home",
    splashSec: 3,
    idlePlace: true,
    idlePhoto: false,
    spWarn: true,
    navBanner: "auto",
    navHeading: true,
    kbLock: false,
    bubbleOn: true,
    homeMap: true,
    autoMap: true,
    navVoice: true,
    navCams: true,
    navRotate: false,
    tripLog: true,
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
    mapApp2: "waze",
    musicApp: "jukebox",
    musicAppName: "Tom's Jukebox",
    autoPlay: false,
    jbFollow: false,
    vizOn: true,
    lpTheme: "lp_au",
    drawStyle: "poly",
    cockpit2: "lowpoly",
    gaugeAuto: true,
    gaugeManual: "classic",
    autoScene: true,
    sceneMove: "still",
    idleOn: true,
    wsCol: false,
    wsGuideOff: false,
    idleMin: 3,
    idleClock: "min",
    idleWxBg: true,
    idleHourly: true,
    idle3d: true,
    idleAppt: true,
    idleVN: false,
    ttsRate: 1,
    ttsPitch: 1,
    ttsVoice: "",
    hotSens: 1,
    hotMuteMusic: false,
    hotOn: true,
    cockpitAuto: false,
    mapStyle: "auto",
    mapBright: 100,
    dashLayout: "wheel",
    idleLayout: "htc",
    odoOn: true,
    stateRules: true,
    chimeOn: true,
    chime: "soft",
    chimeVol: 60
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
        rtCheck: false,
        listOpen: false,
        leg: "go",
        pos: 167,
        trips: sv.trips || [],
        tripId: sv.tripId || "mel-adl",
        melStore: sv.melStore || null,
        tripDlg: false,
        ntFrom: "",
        ntTo: "",
        ntMsg: "",
        ntBusy: false,
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
        const lv0 = S.live || {};
        if (APP && (lv0.speed || 0) > 10 && (S.set || {}).autoMap !== false && (S.scr === "search" || S.scr === "contacts") && now - S.last > 15e3 && !S.dlg) {
          this.setState({ scr: "home" });
          return;
        }
        if (S.pendZone && now - S.pendAt >= 2e3) this.setState({ now, zone: S.pendZone, pendZone: null, popAt: now });
        else this.setState({ now });
      }, 1e3);
      this.startBoot();
      setTimeout(() => {
        const c0 = this.state.set || {};
        if (APP && c0.chimeOn !== false) tcn("chime", JSON.stringify({ name: "chime_" + (c0.chime || "soft"), vol: c0.chimeVol == null ? 60 : c0.chimeVol }));
      }, 250);
      setTimeout(() => {
        this.syncNative(this.state.set);
        if (APP && this.state.set.autoPlay) tcn("media", "autoplay");
        if (APP) {
          tcn("media", "jbquery");
          tcn("voice", "report");
        }
      }, 1500);
    }
    syncNative(C) {
      if (!APP) return;
      tcn("media", "app:" + (C.musicApp || "jukebox"));
      tcn("bubble", C.bubbleOn === false ? "off" : "on");
      tcn("voice", "cfg:" + JSON.stringify({ lang: C.lang === "en" ? "en" : "vi", clip: C.vnVoice || "", rate: +C.ttsRate || 1, pitch: +C.ttsPitch || 1, voice: C.ttsVoice || "", sens: C.hotSens == null ? 1 : +C.hotSens, muteMusic: !!C.hotMuteMusic, hot: C.hotOn !== false, navVol: +C.navVol || 80 }));
    }
    componentWillUnmount() {
      clearInterval(this.tick);
      clearTimeout(this.b1);
      clearTimeout(this.b2);
    }
    // 0.9.12 (#111): which screen opens after the splash, and how long the splash stays
    startScr() {
      const C = this.state.set || {};
      let k = C.startScr || "home";
      if (k === "last") {
        try {
          k = localStorage.getItem("tc-lastScr") || "home";
        } catch (e) {
          k = "home";
        }
      }
      if (k === "ws") {
        const L = C.wsLastLaunch;
        k = "home";
        if (L && L.apps) {
          if (APP) tcn("launch", JSON.stringify(L.apps));
          if (L.rt) k = "rt";
        }
      }
      return ["home", "trip", "rt", "contacts", "search", "split", "dex"].indexOf(k) >= 0 ? k : "home";
    }
    startBoot() {
      clearTimeout(this.b1);
      clearTimeout(this.b2);
      const C = this.state.set || {}, sec = C.splashSec == null ? 3 : +C.splashSec;
      if (!sec) {
        this.setState({ boot: null, scr: this.startScr(), last: Date.now() });
        return;
      }
      this.setState({ boot: "splash", scr: "home", last: Date.now() });
      this.b2 = setTimeout(() => this.setState({ boot: null, scr: this.startScr(), last: Date.now() }), sec * 1e3 + 200);
    }
    save(patch) {
      const st = Object.assign({}, this.state, patch);
      try {
        window.localStorage.setItem(STORE, JSON.stringify({ set: st.set, goList: st.goList, backList: st.backList, skip: st.skip, wsList: st.wsList, custom: st.custom, photos: st.photos, savedPl: st.savedPl, trips: st.trips, tripId: st.tripId, melStore: st.melStore }));
      } catch (e) {
      }
      this.setState(patch);
    }
    setS(k, v) {
      const n = Object.assign({}, this.state.set, { [k]: v });
      this.save({ set: n });
      if (/^(musicApp|tts|hot|bubbleOn)/.test(k)) this.syncNative(n);
      if (k === "jbFollow" && v) tcn("media", "jbquery");
    }
    toast(t) {
      this.setState({ toast: t, toastAt: Date.now() });
    }
    say(t, sensitive) {
      if (window.tcTr) t = window.tcTr(t);
      this.toast(t);
      this.setState({ replyAt: Date.now() });
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
      const r = this.state.vaRetry || 0;
      if (r < 1) {
        setTimeout(() => {
          this.setState({ va: true, vaRetry: r + 1, vaHint: 'M\xECnh nghe l\xE0 "' + text + '" \u2014 ch\u01B0a hi\u1EC3u, b\u1EA1n n\xF3i l\u1EA1i nha' });
          this.say("D\u1EA1, m\xECnh ch\u01B0a hi\u1EC3u. B\u1EA1n n\xF3i l\u1EA1i gi\xFAp m\xECnh nha");
          setTimeout(() => {
            if (this.state.va) tcn("voice", "start");
          }, 2600);
        }, 350);
        return;
      }
      setTimeout(() => {
        this.setState({ va: false, vaRetry: 0 });
        this.say("D\u1EA1, m\xECnh v\u1EABn ch\u01B0a hi\u1EC3u. B\u1EA1n b\u1EA5m n\xFAt mic th\u1EED l\u1EA1i nha");
      }, 350);
    }
    renderVals() {
      const self = this, S = this.state, C = S.set;
      const LV = S.live || {};
      const drive = APP ? (LV.speed || 0) >= 8 : S.drive;
      const kbLk = drive && C.kbLock === true;
      const p2 = (n) => String(n).padStart(2, "0");
      const d = new Date(S.now);
      const clock = C.clock === "24" ? p2(d.getHours()) + ":" + p2(d.getMinutes()) : (d.getHours() % 12 || 12) + ":" + p2(d.getMinutes()) + (d.getHours() < 12 ? " SA" : " CH");
      const ON = { bg: "#FBB040", fg: "#2A1A00" }, OFF = { bg: "#0D2C40", fg: "#CFE6EE" };
      const go = (scr) => () => self.setState({ scr, dlg: null, listOpen: false, exitOpen: false, createOpen: false });
      const priv = C.privacy;
      const nar = APP && !!S.narrow;
      let dk = { on: false }, mpPos = null;
      if (!S.boot && S.scr !== self.__lastScr) {
        self.__lastScr = S.scr;
        if (["home", "trip", "rt", "contacts", "search", "split", "dex"].indexOf(S.scr) >= 0) {
          try {
            localStorage.setItem("tc-lastScr", S.scr);
          } catch (e) {
          }
        }
      }
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
      const wxCode0 = APP ? LV.wx && LV.wx.code : "rain";
      const rainy = wxCode0 === "rain" || wxCode0 === "storm";
      const rainOn = C.rainFx && !drive && rainy;
      const LM = APP ? LV.limit : { v: ZONES[S.zone][0], est: S.zone === "none", school: S.zone === "school", label: ZONES[S.zone][1], at: S.popAt, ahead: S.pendZone ? ZONES[S.pendZone][0] : null };
      const zinfo = [LM ? LM.v : 0, LM ? LM.label || "" : ""], lim = LM ? LM.v : 999, est = !!(LM && LM.est);
      const spdRaw = !APP ? drive ? S.speed : 0 : C.spSrc === "obd" ? LV.obdSpeed != null ? LV.obdSpeed : LV.gpsSpeed : LV.gpsSpeed != null ? LV.gpsSpeed : LV.obdSpeed;
      const spd0 = spdRaw != null ? spdRaw : APP && LV.fresh ? 0 : null;
      const lost = APP ? spd0 == null : drive && S.noGps;
      const spd = Math.round(spd0 || 0);
      const styKey = C.spAuto ? "neon" : C.spStyle;
      const st = STY[styKey] || STY.neon;
      const over = LM ? spd - lim : 0;
      const col = lost ? "#5E8496" : over > 3 && !est ? "#FF7A7A" : over >= 1 ? "#FFC46B" : st.base;
      const sz = SIZES[C.spSize] || SIZES.M;
      const parked = !drive;
      const fs0 = styKey === "analog" ? Math.round(sz[0] * 0.5) : sz[0];
      const needle = polar(135 + 270 * Math.min(spd, 160) / 160, 70);
      const sb = {
        limTap: () => {
          if (APP) self.setState({ dlg: "limfix" });
        },
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
        limBorder: "0",
        limNote: est ? "\u01B0\u1EDBc t\xEDnh" : LM && LM.school ? "School Zone \xB7 gi\u1EDD h\u1ECDc" : zinfo[1],
        limNoteC: est ? "#9AAAB2" : "#CFE6EE",
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
      const VS = window.__voiceState || {};
      const tg = (k, label, hint) => ({ isToggle: true, label, hint, on: C[k] ? "true" : "false", trackBg: C[k] ? "#FBB040" : "#2B4252", knobX: C[k] ? 32 : 4, tick: C[k] ? "\u2713" : "", stateL: C[k] ? "M\u1EDF" : "T\u1EAFt", stateC: C[k] ? "#FFD08A" : "#8FC3D3", toggle: () => self.setS(k, !C[k]), rowTap: () => self.setS(k, !C[k]), rowCur: "pointer" });
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
          tg("chimeOn", "Nh\u1EA1c ch\xE0o khi m\u1EDF app", "Kho\u1EA3ng 2 gi\xE2y \xB7 kh\xF4ng k\xEAu khi m\xE1y \u0111\u1EC3 im l\u1EB7ng ho\u1EB7c \u0111ang ph\xE1t nh\u1EA1c"),
          Object.assign(ch("chime", "Ki\u1EC3u nh\u1EA1c ch\xE0o", "B\u1EA5m l\xE0 nghe th\u1EED", [["soft", "Nh\u1EB9 Nh\xE0ng"], ["modern", "Hi\u1EC7n \u0110\u1EA1i"], ["engine", "N\u1ED5 M\xE1y"]]), { opts: [["soft", "Nh\u1EB9 Nh\xE0ng"], ["modern", "Hi\u1EC7n \u0110\u1EA1i"], ["engine", "N\u1ED5 M\xE1y"]].map(([v, l]) => {
            const on = (C.chime || "soft") === v;
            return { label: l, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => {
              self.setS("chime", v);
              tcn("chime", JSON.stringify({ name: "chime_" + v, vol: C.chimeVol == null ? 60 : C.chimeVol, test: true }));
            } };
          }) }),
          ch("chimeVol", "\xC2m l\u01B0\u1EE3ng nh\u1EA1c ch\xE0o", "So v\u1EDBi \xE2m l\u01B0\u1EE3ng nh\u1EA1c c\u1EE7a m\xE1y", [[30, "Nh\u1ECF"], [60, "V\u1EEBa"], [100, "L\u1EDBn"]]),
          ch("startScr", "M\u1EDF app th\xEC v\xE0o", "Sau m\xE0n h\xECnh ch\xE0o \xB7 app t\u1EF1 m\u1EDF l\u1EA1i sau s\u1EF1 c\u1ED1 th\xEC v\u1EC1 \u0111\xFAng m\xE0n h\xECnh \u0111ang xem", [["home", "M\xE0n H\xECnh Ch\xEDnh"], ["trip", "H\xE0nh Tr\xECnh"], ["rt", "Road Trip"], ["contacts", "Li\xEAn L\u1EA1c"], ["search", "T\xECm Ch\u1ED7"], ["ws", "Workspace g\u1EA7n nh\u1EA5t"], ["last", "M\xE0n h\xECnh l\xFAc t\u1EAFt app"]]),
          ch("splashSec", "M\xE0n h\xECnh ch\xE0o", "Logo + phi\xEAn b\u1EA3n \xB7 ch\u1EA1m \u0111\u1EC3 v\xE0o s\u1EDBm", [[0, "T\u1EAFt"], [1, "1 gi\xE2y"], [3, "3 gi\xE2y"], [5, "5 gi\xE2y"]]),
          info("M\u1EDF app v\xE0o th\u1EB3ng", "Lu\xF4n v\xE0o tab n\xE0y sau m\xE0n h\xECnh ch\xE0o", "M\xE0n H\xECnh Ch\xEDnh"),
          stt("Nh\u1EDB m\u1ECDi l\u1EF1a ch\u1ECDn khi tho\xE1t", "Giao di\u1EC7n, t\xEDnh n\u0103ng, Workspace, ch\u1EB7ng Road Trip\u2026", true, "Lu\xF4n nh\u1EDB", "", "", null),
          tg("privacy", "Ch\u1EBF \u0110\u1ED9 Ri\xEAng T\u01B0", "Gi\u1EA5u t\xEAn ng\u01B0\u1EDDi g\u1ECDi, n\u1ED9i dung tin nh\u1EAFn, th\xF4ng tin kh\xE1ch"),
          info("Cu\u1ED9c g\u1ECDi \u0111\u1EBFn", 'Kh\xF4ng \u0111\u1ECDc t\xEAn ra loa \u2014 ch\u1EC9 b\xE1o "C\xF3 cu\u1ED9c g\u1ECDi"', "Chu\xF4ng theo nh\xF3m \u25B8"),
          tg("autoSms", "T\u1EEB ch\u1ED1i th\xEC t\u1EF1 nh\u1EAFn l\u1EA1i", '"M\xECnh \u0111ang l\xE1i xe, l\xE1t g\u1ECDi l\u1EA1i nha"'),
          ch("msgKeep", "T\u1EF1 xo\xE1 tin nh\u1EAFn \u0111\xE3 l\u01B0u (WhatsApp, Messenger\u2026)", "Tin b\u1EAFt t\u1EEB th\xF4ng b\xE1o", [[7, "7 ng\xE0y"], [30, "30 ng\xE0y"], [0, "Kh\xF4ng xo\xE1"]])
        ] },
        gd: { label: "Giao Di\u1EC7n", icon: "M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-7.9-9-7.9zM7.5 11.5h.01M10.5 7.5h.01M15.5 7.5h.01", desc: "Ki\u1EC3u m\xE0n h\xECnh, s\u1ED1 t\u1ED1c \u0111\u1ED9, m\u01B0a, l\xE0m m\u1EDD, d\u1ECBu m\u1EAFt", rows: [
          (() => {
            const tn = (TGROUPS0.reduce((a, g) => a.concat(g[1]), []).find(([k]) => k === (C.lpTheme || "lp_au")) || [0, "\u0110ang d\xF9ng"])[1];
            return { isStatus: true, label: "Ki\u1EC3u giao di\u1EC7n", hint: "23 ki\u1EC3u + ki\u1EC3u \u0111\u1ED3ng h\u1ED3 bu\u1ED3ng l\xE1i", stL: "\u2713 " + tn, stC: "#7BD88F", hasAct: true, actL: "M\u1EDF Giao Di\u1EC7n", act: () => openTheme() };
          })(),
          tg("idleOn", "M\xE0n h\xECnh ch\u1EDD", "Khi \u0111\u1EADu xe v\xE0 l\xE2u kh\xF4ng \u0111\u1EE5ng m\xE0n h\xECnh"),
          ch("idleLayout", "Ki\u1EC3u \u0111\u1ED3ng h\u1ED3 m\xE0n h\xECnh ch\u1EDD", "HTC l\xE0 ki\u1EC3u g\u1EE3i \xFD", [["htc", "HTC l\u1EADt s\u1ED1"], ["mini", "L\u1EADt s\u1ED1 mini + 5 ng\xE0y"], ["flap", "B\u1EA3ng s\xE2n bay"], ["analog", "Kim m\u1EB7t k\xEDnh"], ["minimal", "S\u1ED1 l\u1EDBn t\u1ED1i gi\u1EA3n"], ["ios", "iOS 6"], ["xiaomi", "Xiaomi"], ["samsung", "Samsung"], ["sony", "Sony"]]),
          tg("idleEdge", "Vi\u1EC1n s\xE1ng tr\xEAn m\xE0n h\xECnh ch\u1EDD", "Vi\u1EC1n m\u1EA3nh \u0111\u1EC1u 4 c\u1EA1nh; t\u1EAFt = kh\xF4ng vi\u1EC1n (m\u1EB7c \u0111\u1ECBnh)"),
          tg("idlePlace", "T\xEAn \u0111\u1ECBa danh to", "Hi\u1EC7n t\xEAn n\u01A1i \u0111ang \u0111\u1EADu xe th\u1EADt to, nh\u01B0 app th\u1EDDi ti\u1EBFt Yahoo"),
          tg("idlePhoto", "H\xECnh \u0111\u1ECBa danh l\xE0m n\u1EC1n", "L\u1EA5y h\xECnh c\u1EE7a n\u01A1i \u0111\xF3 t\u1EEB Wikipedia / Wikimedia Commons (c\u1EA7n m\u1EA1ng)"),
          tg("clkLunar", "Ng\xE0y \xE2m l\u1ECBch", "Hi\u1EC7n ng\xE0y \xE2m l\u1ECBch, R\u1EB1m, m\xF9ng 1, T\u1EBFt \u2014 c\u1EA3 ti\u1EBFng Vi\u1EC7t l\u1EABn ti\u1EBFng Anh"),
          ch("idleMin", "Hi\u1EC7n m\xE0n h\xECnh ch\u1EDD sau", "Kh\xF4ng bao gi\u1EDD hi\u1EC7n khi \u0111ang ch\u1EC9 \u0111\u01B0\u1EDDng ho\u1EB7c xe \u0111ang ch\u1EA1y", [[0, "T\u1EAFt"], [1, "1 ph\xFAt"], [3, "3 ph\xFAt"], [5, "5 ph\xFAt"], [10, "10 ph\xFAt"]]),
          tg("idleWxBg", "N\u1EC1n tr\u1EDDi \u0111\u1ED9ng", "M\xE2y tr\xF4i m\u01B0\u1EE3t khi \u0111\u1EADu xe, \u0111\u1EE9ng y\xEAn khi xe ch\u1EA1y"),
          tg("idleVN", "Gi\u1EDD Vi\u1EC7t Nam", "Hi\u1EC7n gi\u1EDD S\xE0i G\xF2n d\u01B0\u1EDBi ng\xE0y th\xE1ng"),
          tg("idleAppt", "L\u1ECBch h\u1EB9n", "T\u1EEB Google Calendar"),
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
          tg("clkDual", "Hai m\xFAi gi\u1EDD SA / VIC", "Khi g\u1EA7n ho\u1EB7c qua bi\xEAn gi\u1EDBi SA"),
          tg("clkVN", "Th\xEAm gi\u1EDD Vi\u1EC7t Nam", ""),
          tg("clkBlink", 'D\u1EA5u ":" nh\u1EA5p nh\xE1y', "Xe ch\u1EA1y th\xEC t\u1EF1 \u0111\u1EE9ng y\xEAn")
        ] },
        nhac: { label: "Nh\u1EA1c", icon: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", desc: "App nh\u1EA1c m\u1EB7c \u0111\u1ECBnh, thanh nh\u1EA1c ki\u1EC3u Tom\u2019s Jukebox", rows: [
          ch("musicApp", "App nh\u1EA1c m\u1EB7c \u0111\u1ECBnh", "B\u1EA5m \u25B6 khi ch\u01B0a c\xF3 nh\u1EA1c l\xE0 ph\xE1t app n\xE0y (kh\xF4ng c\u1EA7n tho\xE1t ra)", [["jukebox", "Tom's Jukebox"], ["com.spotify.music", "Spotify"], ["com.google.android.apps.youtube.music", "YouTube Music"]]),
          tg("autoPlay", "T\u1EF1 ph\xE1t nh\u1EA1c khi m\u1EDF Tom\u2019s Car", "Ph\xE1t ti\u1EBFp b\xE0i \u0111ang nghe d\u1EDF"),
          tg("jbFollow", "Theo Tom\u2019s Jukebox", "M\xE0u thanh th\u1EDDi gian, s\xF3ng nh\u1EA1c, n\xFAt\u2026 l\u1EA5y theo giao di\u1EC7n \u0111ang ch\u1ECDn b\xEAn Tom\u2019s Jukebox"),
          tg("vizOn", "S\xF3ng nh\u1EA1c tr\xEAn vi\xEAn thu\u1ED1c", "Xe ch\u1EA1y th\xEC s\xF3ng t\u1EF1 d\u1ECBu l\u1EA1i"),
          info("Tom's Jukebox", "C\u1EA7n b\u1EA3n 0.9.5 tr\u1EDF l\xEAn \u0111\u1EC3 Tom\u2019s Car ph\xE1t ng\u1EA7m v\xE0 xem th\u01B0 vi\u1EC7n", window.__jbLook ? "\u0110\xE3 n\u1ED1i \u2713" : APP ? "Ch\u01B0a th\u1EA5y" : "B\u1EA3n m\u1EABu"),
          stt("Quy\u1EC1n \u0111\u1ECDc b\xE0i \u0111ang ph\xE1t", "\u0110\u1EC3 hi\u1EC7n t\xEAn b\xE0i, th\u1EDDi gian", APP ? !!PM.notif : S.perm, "\u0110\xE3 c\u1EA5p", "Ch\u01B0a c\u1EA5p", "C\u1EA5p Quy\u1EC1n", () => {
            if (APP) tcn("perm", "notif");
            else self.setState({ perm: true });
          })
        ] },
        tl: { label: "Tr\u1EE3 L\xFD", icon: "M9 3h6v11a3 3 0 0 1-6 0zM5 11a7 7 0 0 0 14 0M12 18v3", desc: 'Gi\u1ECDng n\xF3i ti\u1EBFng Vi\u1EC7t, "Hey Tom", \u0111\u1ED9 nh\u1EA1y', rows: [
          stt("Gi\u1ECDng Ti\u1EBFng Vi\u1EC7t", VS.google ? "D\xF9ng b\u1ED9 \u0111\u1ECDc Google (c\xF3 ti\u1EBFng Vi\u1EC7t, ch\u1EA1y offline)" : 'M\xE1y ch\u01B0a c\xF3 b\u1ED9 \u0111\u1ECDc Google \u2014 t\u1EA3i "Speech Services by Google"', !!VS.vi, "\u0110\xE3 c\xF3", "Ch\u01B0a c\xF3", "T\u1EA3i Gi\u1ECDng Vi\u1EC7t", () => tcn("voice", "installvi")),
          ch("vnVoice", "Gi\u1ECDng mi\u1EC1n Nam (thu s\u1EB5n)", "C\xE2u c\u1ED1 \u0111\u1ECBnh (ch\u1EC9 \u0111\u01B0\u1EDDng, c\u1EA3nh b\xE1o, tr\u1EA3 l\u1EDDi ng\u1EAFn) \u0111\u1ECDc b\u1EB1ng gi\u1ECDng thu s\u1EB5n; c\xE2u c\xF3 t\xEAn ri\xEAng v\u1EABn d\xF9ng gi\u1ECDng Google", [["", "Gi\u1ECDng Google"], ["doan", "Th\u1EE5c \u0110oan (n\u1EEF)"], ["son", "Th\xE1i S\u01A1n (nam)"]]),
          ch("ttsVoice", "Gi\u1ECDng \u0111\u1ECDc", "Gi\u1ECDng c\xF3 s\u1EB5n trong m\xE1y", [["", "M\u1EB7c \u0111\u1ECBnh"]].concat((VS.voices || []).slice(0, 6).map((v, i) => [v.name, "Gi\u1ECDng " + (i + 1) + (v.offline ? "" : " (c\u1EA7n m\u1EA1ng)")]))),
          ch("ttsRate", "T\u1ED1c \u0111\u1ED9 \u0111\u1ECDc", "", [[0.85, "Ch\u1EADm"], [1, "V\u1EEBa"], [1.15, "Nhanh"]]),
          ch("ttsPitch", "\u0110\u1ED9 cao gi\u1ECDng", "", [[0.9, "Tr\u1EA7m"], [1, "V\u1EEBa"], [1.1, "Cao"]]),
          { isStatus: true, label: "Nghe th\u1EED", hint: "Tr\u1EE3 l\xFD n\xF3i m\u1ED9t c\xE2u m\u1EABu", stL: "\u2713 " + (C.vnVoice === "son" ? "Th\xE1i S\u01A1n" : C.vnVoice === "doan" ? "Th\u1EE5c \u0110oan" : C.ttsVoice ? "Gi\u1ECDng \u0111\xE3 ch\u1ECDn" : "Gi\u1ECDng m\u1EB7c \u0111\u1ECBnh"), stC: "#7BD88F", hasAct: true, actL: "Nghe Th\u1EED", act: () => tcn("voice", "test") },
          tg("hotOn", 'G\u1ECDi b\u1EB1ng "Hey Tom"', "T\u1EAFt = ch\u1EC9 g\u1ECDi b\u1EB1ng n\xFAt mic / n\xFAt Bluetooth v\xF4 l\u0103ng"),
          ch("hotSens", '\u0110\u1ED9 nh\u1EA1y "Hey Tom"', "Th\u1EA5p = \xEDt g\u1ECDi nh\u1EA7m nh\u1EA5t", [[0, "Th\u1EA5p"], [1, "V\u1EEBa"], [2, "Cao"]]),
          tg("hotMuteMusic", 'T\u1EA1m t\u1EAFt "Hey Tom" khi nh\u1EA1c to', "\u0110\u1EE1 b\u1ECB g\u1ECDi nh\u1EA7m v\xEC ti\u1EBFng nh\u1EA1c t\u1EEB loa"),
          info("L\u1EA7n g\u1ECDi g\u1EA7n \u0111\xE2y", "Gi\u1EDD \xB7 c\xE2u tr\u1EE3 l\xFD nghe \xB7 \u0111\u1ED9 ch\u1EAFc", VS.log && VS.log.length ? VS.log.slice(0, 3).join("   |   ") : "Ch\u01B0a c\xF3")
        ] },
        xe: { label: "Xe & OBD-II", icon: "M5 17h14M6 17V9l2-4h8l2 4v8M7 17v2M17 17v2M8 12h.01M16 12h.01", desc: "C\u1EE5c OBD-II, h\u1ED3 s\u01A1 xe, ngu\u1ED3n t\u1ED1c \u0111\u1ED9, nh\u1EAFc b\u1EA3o d\u01B0\u1EE1ng", rows: [
          stt("C\u1EE5c OBD-II", LV.obd ? "\u0110\xE3 n\u1ED1i \xB7 " + (LV.obd.protocol || "") : "Veepeak OBDCheck BLE (Bluetooth)", !!LV.obd, "\u0110\xE3 n\u1ED1i", "Ch\u01B0a n\u1ED1i", "Ch\u1ECDn C\u1EE5c OBD", () => tcn("settings")),
          tg("kbLock", "Kho\xE1 b\xE0n ph\xEDm khi xe ch\u1EA1y", "T\u1EAFt = g\xF5 \u0111\u1ECBa ch\u1EC9 l\xFAc n\xE0o c\u0169ng \u0111\u01B0\u1EE3c (m\u1EB7c \u0111\u1ECBnh)"),
          tg("spWarn", "Nh\u1EAFc khi ch\u1EA1y qu\xE1 t\u1ED1c \u0111\u1ED9", "Ch\u1EC9 nh\u1EAFc khi bi\u1EBFt ch\u1EAFc s\u1ED1 gi\u1EDBi h\u1EA1n, qu\xE1 3 km/g, m\u1ED7i \u0111o\u1EA1n \u0111\u01B0\u1EDDng 1 l\u1EA7n"),
          ch("navBanner", "B\u0103ng ch\u1EC9 \u0111\u01B0\u1EDDng", "Ch\u1EA1m v\xE0o b\u0103ng khi \u0111ang ch\u1EA1y c\u0169ng \u0111\u1ED5i \u0111\u01B0\u1EE3c", [["auto", "G\u1ECDn, t\u1EF1 to khi g\u1EA7n ch\u1ED7 r\u1EBD"], ["big", "Lu\xF4n l\u1EDBn"], ["hide", "\u1EA8n, ch\u1EC9 \u0111\u1ECDc gi\u1ECDng"]]),
          ch("spSrc", "Ngu\u1ED3n t\u1ED1c \u0111\u1ED9", "\u0110\u1ED3ng h\u1ED3 tapl\xF4 th\u01B0\u1EDDng ch\u1EC9 cao h\u01A1n th\u1EF1c t\u1EBF v\xE0i km/g", [["gps", "GPS (m\u1EB7c \u0111\u1ECBnh)"], ["obd", "OBD-II"]]),
          info("H\u1ED3 s\u01A1 xe", "M\xE1y d\u1EA7u \xB7 c\u1ED5ng OBD 16 ch\xE2n", "Toyota HiAce 200 \xB7 04/2006"),
          info("\xC1p su\u1EA5t v\u1ECF (b\u01A1m ngu\u1ED9i)", "195R15C", "350 kPa tr\u01B0\u1EDBc / sau"),
          tg("tyre", "Nh\u1EAFc b\u01A1m v\u1ECF", "M\u1ED7i 2 tu\u1EA7n"),
          tg("oil", "Nh\u1EAFc thay nh\u1EDBt", "Theo km \u0111\xE3 ch\u1EA1y")
        ] },
        map: { label: "B\u1EA3n \u0110\u1ED3 & Road Trip", icon: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14", desc: "App b\u1EA3n \u0111\u1ED3, chia m\xE0n h\xECnh, qu\xE3ng \u0111\u01B0\u1EDDng, km, h\xECnh, gi\u1EDBi h\u1EA1n", rows: [
          ch("mapApp", "B\u1EA3n \u0111\u1ED3 ch\xEDnh", "D\xF9ng khi ch\u1EC9 \u0111\u01B0\u1EDDng v\xE0 chia m\xE0n h\xECnh", [["waze", "Waze"], ["gmaps", "Google Maps"], ["here", "HERE"]]),
          (() => {
            const hm0 = APP && window.tcHome ? window.tcHome() : null;
            return { isStatus: true, label: "Nh\xE0 (\u0111i\u1EC3m xu\u1EA5t ph\xE1t Road Trip)", hint: hm0 ? "\u0110\xE3 l\u01B0u: " + hm0.name + " \u2014 chuy\u1EBFn \u0111i b\u1EAFt \u0111\u1EA7u v\xE0 chuy\u1EBFn v\u1EC1 k\u1EBFt th\xFAc \u1EDF \u0111\xE2y" : "Ch\u01B0a l\u01B0u \u2014 g\xF5 \u0111\u1ECBa ch\u1EC9, d\xF9ng v\u1ECB tr\xED hi\u1EC7n t\u1EA1i ho\u1EB7c ch\u1ECDn tr\xEAn b\u1EA3n \u0111\u1ED3", stL: hm0 ? "\u2713 " + hm0.name : "Ch\u01B0a l\u01B0u", stC: hm0 ? "#7BD88F" : "#8FC3D3", hasAct: true, actL: hm0 ? "S\u1EEDa" : "\u0110\u1EB7t Nh\xE0", act: () => self.setState({ dlg: "pe", peKind: "home", peQ: "", peRes: [] }) };
          })(),
          (() => {
            const wk0 = window.NAV && window.NAV.getWork ? window.NAV.getWork() : null;
            return { isStatus: true, label: "Ch\u1ED7 L\xE0m", hint: wk0 ? "\u0110\xE3 l\u01B0u: " + wk0.name : "Ch\u01B0a l\u01B0u", stL: wk0 ? "\u2713 " + wk0.name : "Ch\u01B0a l\u01B0u", stC: wk0 ? "#7BD88F" : "#8FC3D3", hasAct: true, actL: wk0 ? "S\u1EEDa" : "\u0110\u1EB7t Ch\u1ED7 L\xE0m", act: () => self.setState({ dlg: "pe", peKind: "work", peQ: "", peRes: [] }) };
          })(),
          ch("mapSide", "B\u1EA3n \u0111\u1ED3 n\u1EB1m b\xEAn", "Road Trip + B\u1EA3n \u0110\u1ED3", [["left", "Tr\xE1i"], ["right", "Ph\u1EA3i"]]),
          tg("placePhotos", "H\xECnh \u0111\u1EA1i di\u1EC7n \u0111\u1ECBa \u0111i\u1EC3m", "H\xECnh b\u1EA1n ch\u1EE5p \u2192 Wikimedia Commons \u2192 bi\u1EC3n b\xE1o"),
          tg("limitEst", "Gi\u1EDBi h\u1EA1n \u01B0\u1EDBc t\xEDnh khi thi\u1EBFu d\u1EEF li\u1EC7u", '50 khu d\xE2n c\u01B0 / 100 ngo\xE0i th\u1ECB tr\u1EA5n \u2014 c\xF3 ch\u1EEF "\u01B0\u1EDBc t\xEDnh" d\u01B0\u1EDBi bi\u1EC3n'),
          ch("rest", "Nh\u1EAFc ngh\u1EC9 ch\xE2n m\u1ED7i", "Theo gi\u1EDD l\xE1i li\xEAn t\u1EE5c", [[1.5, "1,5 gi\u1EDD"], [2, "2 gi\u1EDD"], [3, "3 gi\u1EDD"]]),
          tg("homeMap", "M\xE0n H\xECnh Ch\xEDnh l\xE0 b\u1EA3n \u0111\u1ED3", "T\u1EAFt th\xEC n\u1EC1n l\xE0 c\u1EA3nh low-poly nh\u01B0 c\u0169 (\u0111\u1ED5i trong Giao Di\u1EC7n)"),
          tg("autoMap", "T\u1EF1 hi\u1EC7n b\u1EA3n \u0111\u1ED3 khi xe ch\u1EA1y", "Tr\xEAn 10 km/g: n\u1EC1n low-poly \u0111\u1ED5i sang b\u1EA3n \u0111\u1ED3, T\xECm Ch\u1ED7 / Li\xEAn L\u1EA1c t\u1EF1 v\u1EC1 b\u1EA3n \u0111\u1ED3"),
          tg("navVoice", "\u0110\u1ECDc ch\u1EC9 \u0111\u01B0\u1EDDng", "Qu\u1EB9o tr\xE1i, qu\u1EB9o ph\u1EA3i, b\xF9ng binh\u2026 b\u1EB1ng gi\u1ECDng Vi\u1EC7t \xB7 t\u1EAFt nhanh b\u1EB1ng n\xFAt \u{1F50A} c\u1EA1nh gi\u1EDD t\u1EDBi"),
          ch("navVol", "\xC2m l\u01B0\u1EE3ng gi\u1ECDng ch\u1EC9 \u0111\u01B0\u1EDDng", "Nh\u1EA1c t\u1EF1 nh\u1ECF l\u1EA1i trong l\xFAc gi\u1ECDng ch\u1EC9 \u0111\u01B0\u1EDDng n\xF3i", [[60, "V\u1EEBa"], [80, "To"], [100, "R\u1EA5t to"]]),
          tg("navCams", "Nh\u1EAFc camera t\u1ED1c \u0111\u1ED9 + v\xF9ng tr\u01B0\u1EDDng h\u1ECDc", "D\u1EEF li\u1EC7u OpenStreetMap \u2014 c\xF3 th\u1EC3 thi\u1EBFu ch\u1ED7"),
          ch("navHeading", "H\u01B0\u1EDBng b\u1EA3n \u0111\u1ED3 khi ch\u1EC9 \u0111\u01B0\u1EDDng", "Theo h\u01B0\u1EDBng xe: h\u01B0\u1EDBng ch\u1EA1y lu\xF4n \u1EDF ph\xEDa tr\xEAn, nh\u01B0 Google Maps", [[true, "Theo h\u01B0\u1EDBng xe"], [false, "H\u01B0\u1EDBng B\u1EAFc"]]),
          tg("tripLog", "Nh\u1EADt k\xFD H\xE0nh Tr\xECnh", "T\u1EF1 ghi ch\u1ED7 \u0111\u1EADu h\u01A1n 3 ph\xFAt \u2014 ch\u1EC9 l\u01B0u trong m\xE1y n\xE0y, kh\xF4ng g\u1EEDi \u0111i \u0111\xE2u"),
          { isChoice: true, label: "N\xFAt t\xECm nhanh (M\xE0n H\xECnh Ch\xEDnh)", hint: "Ch\u1EA1m \u0111\u1EC3 b\u1EADt/t\u1EAFt t\u1EEBng n\xFAt \u2014 k\u1EBFt qu\u1EA3 hi\u1EC7n ngay tr\xEAn b\u1EA3n \u0111\u1ED3, \u0111ang ch\u1EC9 \u0111\u01B0\u1EDDng th\xEC t\xECm d\u1ECDc \u0111\u01B0\u1EDDng", opts: Object.keys(QC).map((k) => {
            const cur = Array.isArray(C.qcList) && C.qcList.length ? C.qcList : QC_DEF;
            const on = cur.indexOf(k) >= 0;
            return { label: QC[k][0] + " " + QC[k][1], on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => self.setS("qcList", on ? cur.filter((x) => x !== k) : cur.concat([k])) };
          }) },
          tg("satFast", "V\u1EC7 Tinh nh\u1EB9 khi ch\u1EA1y nhanh", "\u0110ang d\xF9ng V\u1EC7 Tinh m\xE0 ch\u1EA1y tr\xEAn 80 km/g ho\u1EB7c xem c\u1EA3 tuy\u1EBFn th\xEC t\u1EA1m d\xF9ng b\u1EA3n \u0111\u1ED3 th\u01B0\u1EDDng cho nh\u1EB9 m\xE1y"),
          ch("mapStyle", "Ki\u1EC3u b\u1EA3n \u0111\u1ED3", "T\u1EF1 \u0110\u1ED9ng = S\xE1ng ban ng\xE0y, T\u1ED1i ban \u0111\xEAm (theo gi\u1EDD m\u1EB7t tr\u1EDDi m\u1ECDc/l\u1EB7n)", [["auto", "T\u1EF1 \u0110\u1ED9ng"], ["dark", "T\u1ED1i"], ["light", "S\xE1ng"], ["topo", "\u0110\u1ECBa H\xECnh"], ["sat", "V\u1EC7 Tinh"]]),
          ch("mapBright", "\u0110\u1ED9 s\xE1ng b\u1EA3n \u0111\u1ED3", "B\u1EADt D\u1ECBu M\u1EAFt th\xEC t\u1EF1 gi\u1EA3m", [[70, "70%"], [85, "85%"], [100, "100%"], [115, "115%"]]),
          tg("odoOn", "\u0110\u1ED3ng h\u1ED3 km ki\u1EC3u cu\u1ED9n", "Trip A, Trip B, km t\u1EDBi ch\u1EB7ng k\u1EBF, v\xF2ng % chuy\u1EBFn"),
          tg("stateRules", "Nh\u1EAFc lu\u1EADt khi qua ti\u1EC3u bang kh\xE1c", "\u0110\u1ECDc to + hi\u1EC7n tr\xEAn m\xE0n h\xECnh")
        ] },
        ws: { label: "Workspace", icon: "M3 4h8v7H3zM13 4h8v4h-8zM13 10h8v10h-8zM3 13h8v7H3z", desc: "C\xE1ch m\u1EDF app tr\xEAn DeX v\xE0 \u0111i\u1EC7n tho\u1EA1i", rows: [
          tg("dexFull", "Ph\xF3ng to theo m\xE0n h\xECnh DeX", "Tr\u1EEB thanh t\xE1c v\u1EE5; 1 app th\xEC ph\xF3ng to h\u1EBFt"),
          tg("bubbleOn", "N\xFAt n\u1ED5i Tom\u2019s Car", "M\u1EDD 50% tr\xEAn app kh\xE1c \u2014 b\u1EA5m l\xE0 v\u1EC1 Tom\u2019s Car, k\xE9o \u0111\u1EC3 d\u1EDDi, b\u1EA5m gi\u1EEF \u0111\u1EC3 \u1EA9n"),
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
          stt("Gi\u1ECDng Ti\u1EBFng Vi\u1EC7t cho tr\u1EE3 l\xFD", "B\u1ED9 \u0111\u1ECDc Google, t\u1EA3i 1 l\u1EA7n, ch\u1EA1y offline", !!VS.vi, "\u0110\xE3 c\xF3", "Ch\u01B0a c\xF3", "T\u1EA3i Gi\u1ECDng Vi\u1EC7t", () => tcn("voice", "installvi")),
          stt("L\u1ECBch (Google Calendar)", "Nh\u1EAFc h\u1EB9n c\u1EA1nh \u0111\u1ED3ng h\u1ED3", !!PM.cal, "\u0110\xE3 c\u1EA5p", "Ch\u01B0a c\u1EA5p", "C\u1EA5p Quy\u1EC1n", () => tcn("perm", "cal")),
          stt("Hi\u1EC7n tr\xEAn app kh\xE1c", "D\u1EA3i Tom\u2019s Car tr\xEAn Waze (b\u1EA3n sau)", !!PM.overlay, "\u0110\xE3 c\u1EA5p", "Ch\u01B0a c\u1EA5p", "C\u1EA5p Quy\u1EC1n", () => tcn("perm", "overlay"))
        ] },
        gt: { label: "Gi\u1EDBi Thi\u1EC7u", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5h.01", desc: "Th\xF4ng tin app", rows: [
          info("Phi\xEAn b\u1EA3n", "Tom\u2019s Technology Solutions", window.TC_VERSION || "0.9.5-beta"),
          info("Kh\u1EA9u hi\u1EC7u", "", "Focus On One Thing And Do It Well"),
          info("Bi\u1EC3u t\u01B0\u1EE3ng d\u1ECBch v\u1EE5", "Theo AS 1742.6 (n\u1EC1n xanh, h\xECnh tr\u1EAFng)", "D\u1EF1a theo b\u1ED9 bi\u1EC3n c\u1EE7a QLD TMR \u2014 CC BY 4.0"),
          info("H\xECnh \u0111\u1ECBa \u0111i\u1EC3m", "", "Wikimedia Commons \xB7 Wikidata"),
          info("Logo h\xE3ng", "\u0110\xF3ng s\u1EB5n trong app l\xFAc build", "Trang web ch\xEDnh th\u1EE9c c\u1EE7a t\u1EEBng h\xE3ng"),
          info("Th\u1EDDi ti\u1EBFt", "", "Open-Meteo"),
          info("B\u1EA3n \u0111\u1ED3", "T\u1ED1i/S\xE1ng \xA9 CARTO \xB7 \u0110\u1ECBa H\xECnh \xA9 OpenTopoMap \xB7 V\u1EC7 Tinh \xA9 Esri", "\xA9 OpenStreetMap contributors"),
          info("T\xECm \u0111\u01B0\u1EDDng chuy\u1EBFn m\u1EDBi", "", "OSRM \xB7 Nominatim (OpenStreetMap)")
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
      const TRIP = S.tripId === "mel-adl" ? null : (S.trips || []).find((t) => t.id === S.tripId) || null;
      if (TRIP) {
        TOTAL = TRIP.km;
        PLACES = TRIP.places || {};
        BORDER = TRIP.border > 0 ? TRIP.border : -1;
        MINE_GO = {};
        MINE_BACK = {};
      } else {
        TOTAL = MA.total;
        PLACES = MA.places;
        BORDER = MA.border;
        MINE_GO = MA.mineGo;
        MINE_BACK = MA.mineBack;
      }
      const hasBorder = BORDER > 0, saFirst = TRIP ? TRIP.from.st === "SA" : false;
      const SP = !TRIP && APP && window.tcStartPt ? window.tcStartPt() : null;
      const FROM = TRIP ? TRIP.from.name : SP && SP.name ? SP.name : "Melbourne", TO = TRIP ? TRIP.to.name : "Adelaide", FROMS = TRIP ? TRIP.from.st : "VIC", TOS = TRIP ? TRIP.to.st : "SA";
      if (window.__tripId !== S.tripId) {
        window.__tripId = S.tripId;
        if (window.tcSetRoute) window.tcSetRoute(TRIP ? TRIP.pts : null, TRIP ? TRIP.km : 727);
        window.__tripRoutes = (S.trips || []).map((t) => ({ id: t.id, name: t.name, pts: t.pts }));
      }
      const leg = APP && LT && LT.dir && !S.legManual ? LT.dir : S.leg, isGo = leg === "go";
      const eastFirst = TRIP ? TRIP.from.lon > TRIP.to.lon : true;
      const flip = isGo ? eastFirst : !eastFirst;
      const ids = isGo ? S.goList : S.backList;
      const ALLP = Object.assign({}, PLACES, S.custom);
      const kmOf = (id) => isGo ? ALLP[id].km : TOTAL - ALLP[id].km;
      const list = ids.filter((id) => ALLP[id]).map((id) => Object.assign({ id }, ALLP[id], { km: kmOf(id) })).concat([{ id: "end", name: isGo ? TO : FROM, town: isGo ? TOS : FROMS, k: "end", km: TOTAL }]);
      const pos = APP && LT ? Math.max(0, Math.min(TOTAL, Math.round(isGo ? LT.km : TOTAL - LT.km))) : APP ? 0 : S.pos;
      const border = isGo ? BORDER : TOTAL - BORDER;
      const baseMin = APP && LT && LT.startMin != null ? LT.startMin : APP ? d.getHours() * 60 + d.getMinutes() : 8 * 60 + 5;
      const active = list.filter((x) => !S.skip[leg + x.id]);
      const timeAt = (km) => baseMin + km / 100 * 60 + active.filter((x) => x.km < km).reduce((a, x) => a + (x.stay || 0), 0);
      const inSA = (km) => hasBorder && (saFirst ? isGo ? km < border : km >= border : isGo ? km >= border : km < border);
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
        const done = x.km <= pos, next = i === nextIdx, sk2 = !!S.skip[leg + x.id], isEnd = x.id === "end";
        return {
          name: x.name,
          town: x.town,
          icon: ICX[x.k],
          icF: icF(x.k),
          icS: icS(x.k),
          sign: SIGN[x.k],
          photo: C.placePhotos && !isEnd,
          noPhoto: !(C.placePhotos && !isEnd),
          open: openStop(x.id),
          stay: isEnd ? "\u0110i\u1EC3m \u0111\u1EBFn" : "gh\xE9 " + x.stay + " ph",
          tag: isEnd ? "" : mine[x.id] ? isGo ? "ch\u1EB7ng \u0111i c\u1EE7a b\u1EA1n" : "ch\u1EB7ng v\u1EC1 c\u1EE7a b\u1EA1n" : "t\u1EEB ch\u1EB7ng \u0111i",
          tagC: mine[x.id] ? "#7BD88F" : "#8FC3D3",
          dist: sk2 ? "b\u1ECF qua chuy\u1EBFn n\xE0y" : done ? "\u2713 \u0111\xE3 gh\xE9" : x.km - pos + " km",
          distC: sk2 ? "#8FC3D3" : done ? "#7BD88F" : next ? "#FBB040" : "#E8F1F5",
          eta: sk2 ? "" : (done ? "" : "d\u1EF1 ki\u1EBFn ") + fmt(timeAt(x.km), inSA(x.km)) + (inSA(x.km) ? " gi\u1EDD SA" : ""),
          op: done || sk2 ? 0.55 : 1,
          strike: sk2 ? "line-through" : "none",
          bg: next ? "rgba(251,176,64,0.12)" : "rgba(13,44,64,0.55)",
          cls: next ? "nxt" : "",
          up: isEnd ? () => {
          } : move(i, -1),
          down: isEnd ? () => {
          } : move(i, 1),
          skip: isEnd ? () => {
          } : () => self.save({ skip: Object.assign({}, S.skip, { [leg + x.id]: !sk2 }) }),
          skipL: sk2 ? "\u21BA" : "\u2298",
          del: isEnd ? () => {
          } : () => self.setState({ dlg: "del", delId: x.id })
        };
      });
      const endMin = timeAt(TOTAL), nowMin = timeAt(pos);
      const left = Math.max(0, Math.round(endMin - nowMin));
      const driveMin = Math.round(pos / 100 * 60);
      const sinceRest = driveMin % (C.rest * 60);
      const restLeft = C.rest * 60 - sinceRest;
      const X = (km) => flip ? 770 - km / TOTAL * 740 : 30 + km / TOTAL * 740;
      const Y = (x) => 190 + 16 * Math.sin((x - 30) / 58) + 6 * Math.sin((x - 30) / 23);
      const pathTo = (xa, xb) => {
        if (xb === void 0) {
          xb = xa;
          xa = 30;
        }
        const lo = Math.min(xa, xb), hi = Math.max(xa, xb);
        let s = "";
        for (let x = lo; x <= hi; x += 6) s += (s ? " L" : "M") + x.toFixed(1) + " " + Y(x).toFixed(1);
        s += " L" + hi.toFixed(1) + " " + Y(hi).toFixed(1);
        return s;
      };
      const REG = TRIP ? [[0, 0.06, "Th\xE0nh ph\u1ED1 " + FROM], [0.06, 0.3, "Ngo\u1EA1i \xF4"], [0.3, 0.6, "\u0110\u01B0\u1EDDng tr\u01B0\u1EDDng"], [0.6, 0.92, "Mi\u1EC1n qu\xEA"], [0.92, 1, "T\u1EDBi " + TO]].map(([a, b, l]) => [a * TOTAL, b * TOTAL, l]) : [[0, 60, "Th\xE0nh ph\u1ED1 Melbourne"], [60, 230, "\u0110\u1ED3ng c\u1ECF Ballarat"], [230, 425, "\u0110\u1ED3ng l\xFAa m\xEC Wimmera"], [425, 610, "B\u1EE5i kh\xF4 v\xF9ng Keith"], [610, 727, "\u0110\u1ED3i Adelaide"]];
      const regs = REG.map(([a, b, label]) => {
        const s = isGo ? a : TOTAL - b, e = isGo ? b : TOTAL - a;
        let x0 = Math.min(X(s), X(e)), x1 = Math.max(X(s), X(e));
        if (x0 <= 31) x0 = 0;
        if (x1 >= 769) x1 = 800;
        return { x: x0, w: x1 - x0, label };
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
      const circ = (n) => n <= 20 ? String.fromCharCode(9311 + n) : n + ".";
      const raw = list.map((x, i) => ({ x, i, sx: X(x.km), isEnd: x.id === "end" }));
      const sgGroups = [];
      raw.slice().sort((a, b) => a.sx - b.sx).forEach((r) => {
        const g = sgGroups[sgGroups.length - 1];
        if (g && Math.abs(r.sx - g[g.length - 1].sx) * z < 26) g.push(r);
        else sgGroups.push([r]);
      });
      const lastEnd = [-1e9, -1e9, -1e9];
      const signs = sgGroups.map((g) => {
        const r = g.find((q2) => q2.i === nextIdx) || g.find((q2) => q2.isEnd) || g[0];
        const x = r.x, i = r.i, sx = r.sx, isEnd = r.isEnd;
        const many = g.length > 1;
        const nameOk = isEnd || i === nextIdx || z >= 1.8;
        const nm = isEnd ? x.name : (x.town || x.name).replace(/ (VIC|SA|NSW|QLD|ACT|WA|TAS|NT)$/, "").split(" (")[0];
        const label = many ? circ(g[0].i + 1) + "\u2013" + circ(g[g.length - 1].i + 1) + (nameOk ? " " + nm : "") : isEnd ? "\u{1F3C1} " + nm : circ(i + 1) + (nameOk ? " " + nm : "");
        const wpx = (label.length * 6.2 + 10) / z;
        let lv = 0;
        while (lv < 2 && sx - wpx / 2 < lastEnd[lv]) lv++;
        lastEnd[lv] = sx + wpx / 2;
        const gx = g.reduce((a, q2) => a + q2.sx, 0) / g.length;
        return {
          x: sx.toFixed(1),
          y: (Y(sx) - 14).toFixed(1),
          icon: ICX[x.k],
          icF: icF(x.k),
          icS: icS(x.k),
          bg: SIGN[x.k],
          short: label,
          op: x.km <= pos || S.skip[leg + x.id] ? 0.5 : 1,
          cls: i === nextIdx ? "nxt" : "",
          km: C.kmUnder && !many ? kmLeft(x) : many ? g.length + " ch\u1ED7" : "",
          kmC: x.km <= pos ? "#7BD88F" : i === nextIdx ? "#FBB040" : "#E8F1F5",
          lead: 8 + lv * 30,
          photo: photos && !isEnd && !many,
          sign: !(photos && !isEnd && !many),
          aria: many ? g.length + " ch\u1EB7ng g\u1EA7n nhau \u2014 b\u1EA5m \u0111\u1EC3 ph\xF3ng to" : x.name + " \u2014 b\u1EA5m xem chi ti\u1EBFt, ch\u1EA1m 2 l\u1EA7n \u0111\u1EC3 ph\xF3ng t\u1EDBi",
          open: many ? () => self.setState({ zMode: "free", fx: gx, z: Math.min(4, z * 2.2), panAt: Date.now() }) : openStop(x.id),
          focus: () => {
            const dist = Math.abs(sx - vanX) + 80;
            self.setState({ zMode: "free", fx: (sx + vanX) / 2, z: Math.min(4, Math.max(1.6, 700 / dist)), panAt: Date.now() });
          }
        };
      });
      const etaMin = endMin - (inSA(TOTAL) ? 30 : 0);
      const etaH = Math.floor((etaMin % 1440 + 1440) % 1440 / 60);
      const day = etaH >= 6 && etaH < 19;
      const mapDots = list.map((x) => {
        const p = ptAt((isGo ? x.km : TOTAL - x.km) / TOTAL);
        return { x: mx(p[0]).toFixed(1), y: my(p[1]).toFixed(1), name: (x.id === "end" ? x.name : x.name.split(" (")[0]) + (C.kmUnder ? " \xB7 " + kmLeft(x) : ""), c: x.km <= pos ? "#7BD88F" : SIGN[x.k] === "#6B3E26" ? "#C8875A" : "#5FD4F0" };
      }).concat([{ x: mx(isGo ? 603 : 177).toFixed(1), y: my(isGo ? 270 : 30).toFixed(1), name: isGo ? "Melbourne" : "Adelaide", c: "#7BD88F" }]);
      const rt = {
        title: isGo ? FROM + " \u2192 " + TO : TO + " \u2192 " + FROM,
        tripL: "\u{1F9ED} Chuy\u1EBFn \u25BE",
        autoDir: !S.legManual,
        autoDirBg: !S.legManual ? "rgba(123,216,143,0.18)" : "rgba(3,17,28,0.85)",
        autoDirC: !S.legManual ? "#7BD88F" : "#8FC3D3",
        toggleAutoDir: () => self.setState({ legManual: !S.legManual }),
        openTrips: () => self.setState({ tripDlg: true, ntMsg: "" }),
        legs: [["go", "Ch\u1EB7ng \u0110i"], ["back", "Ch\u1EB7ng V\u1EC1"]].map(([k, label]) => {
          const on = leg === k;
          return { label, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => self.setState({ leg: k, legManual: true }) };
        }),
        boxes: [["XU\u1EA4T PH\xC1T", fmt(baseMin, inSA(0)), hasBorder ? inSA(0) ? "gi\u1EDD SA" : "gi\u1EDD VIC" : "gi\u1EDD " + (isGo ? FROMS : TOS)], ["D\u1EF0 KI\u1EBEN T\u1EDAI N\u01A0I", fmt(endMin, inSA(TOTAL)), hasBorder ? inSA(TOTAL) ? "gi\u1EDD SA" : "gi\u1EDD VIC" : "gi\u1EDD " + (isGo ? TOS : FROMS)], ["C\xD2N L\u1EA0I", Math.floor(left / 60) + " gi\u1EDD " + p2(left % 60) + " ph", TOTAL - pos + " km"]].map(([l, v, s]) => ({ l, v, s })),
        views: [["road", "Con \u0110\u01B0\u1EDDng"], ["map", "B\u1EA3n \u0110\u1ED3"]].map(([k, label]) => {
          const on = view === k;
          return { label, on: on ? "true" : "false", bg: on ? ON.bg : "rgba(3,17,28,0.85)", fg: on ? ON.fg : "#CFE6EE", pick: () => self.setS("rtView", k) };
        }),
        road: view === "road",
        map: view === "map" && !APP,
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
        roadD: pathTo(30, 770),
        doneD: pathTo(X(0), vanX + (flip ? -0.5 : 0.5)),
        bx: X(border),
        bxOn: hasBorder,
        bxOp: hasBorder ? 1 : 0,
        vanFlip: flip ? -1 : 1,
        borderL: inSA(TOTAL) ? "V\xF4 SA \xB7 \u221230 ph" : "V\xF4 VIC \xB7 +30 ph",
        signs,
        vanX,
        vanY,
        vanL: Math.round(pos / TOTAL * 100) + "% \xB7 " + pos + " km",
        sunX: flip ? X(TOTAL) - 10 : X(TOTAL) - 40,
        eta: fmt(endMin, inSA(TOTAL)),
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
        foot: view === "map" ? APP ? "B\u1EA3n \u0111\u1ED3 OpenStreetMap \xB7 k\xE9o \u0111\u1EC3 d\u1EDDi, hai ng\xF3n \u0111\u1EC3 ph\xF3ng to" : "H\xECnh m\u1EABu \u2014 b\u1EA3n th\u1EADt l\xE0 b\u1EA3n \u0111\u1ED3 OpenStreetMap" : z > 1 ? "K\xE9o \u0111\u1EC3 d\u1EDDi \xB7 xe ch\u1EA1y th\xEC 10 gi\xE2y sau t\u1EF1 v\u1EC1 Theo Xe" : "B\u1EA5m bi\u1EC3n ch\u1EB7ng xem chi ti\u1EBFt \xB7 ch\u1EA1m 2 l\u1EA7n \u0111\u1EC3 ph\xF3ng t\u1EDBi \xB7 cu\u1ED9n chu\u1ED9t / + \u2212 \u0111\u1EC3 ph\xF3ng to",
        count: list.length,
        stats: [["\u0110\xC3 \u0110I", pos + " km", "#7BD88F"], ["C\xD2N L\u1EA0I", TOTAL - pos + " km", "#E8F1F5"], ["\u0110\xC3 L\xC1I", Math.floor(driveMin / 60) + " gi\u1EDD " + p2(driveMin % 60) + " ph", "#E8F1F5"], ["NH\u1EAEC NGH\u1EC8 CH\xC2N", restLeft <= 20 ? "Ngh\u1EC9 ch\xE2n sau " + restLeft + " ph\xFAt n\u1EEFa" : "Ngh\u1EC9 sau " + String(C.rest).replace(".", ",") + " gi\u1EDD l\xE1i li\xEAn t\u1EE5c", restLeft <= 20 ? "#FFD08A" : "#E8F1F5"]].map(([l, v, c]) => ({ l, v, c })),
        stops
      };
      const OD = LV.odo || { a: S.demoA != null ? S.demoA : 128.4, b: pos, leg: 0, legMin: 0 };
      const gk = window.__curGauge || C.gaugeManual || "classic";
      const ost = gk === "rally" ? { f: "'Overpass Mono', monospace", c: "#FFD84A", bg: "#141005", sh: "none" } : gk === "neon" ? { f: "Overpass, sans-serif", c: "#5FF0FF", bg: "#031821", sh: "0 0 8px rgba(95,240,255,0.8)" } : gk === "bar" ? { f: "Overpass, sans-serif", c: "#FFFFFF", bg: "#0A2236", sh: "none" } : { f: "Overpass, sans-serif", c: "#F3EBD2", bg: "#0B1620", sh: "none" };
      const roll = (v, n) => {
        const t = (Math.max(0, v) * 10).toFixed(0).padStart(n + 1, "0").slice(-(n + 1));
        return t.split("").map((ch2, k) => ({ y: -+ch2 * 1.15, bl: k === n ? "2px solid rgba(255,255,255,0.35)" : "0", pl: k === n ? "3px" : "0", digs: "0123456789".split("").map((d0) => ({ d: d0 })) }));
      };
      const nxStop = nextIdx >= 0 ? list[nextIdx] : null, nxKm = nxStop ? nxStop.km - pos : null;
      if (nxStop && nxKm <= 5 && nxKm > 0 && self._ting !== leg + nxStop.id) {
        self._ting = leg + nxStop.id;
        try {
          const ac = new (window.AudioContext || window.webkitAudioContext)();
          const o = ac.createOscillator(), g2 = ac.createGain();
          o.frequency.value = 1320;
          o.connect(g2);
          g2.connect(ac.destination);
          g2.gain.setValueAtTime(0.25, ac.currentTime);
          g2.gain.exponentialRampToValueAtTime(1e-3, ac.currentTime + 0.9);
          o.start();
          o.stop(ac.currentTime + 0.9);
        } catch (e) {
        }
      }
      const pct = Math.round(pos / TOTAL * 100), RC = 2 * Math.PI * 30;
      const OBD = LV.obd || {};
      const legsAll = APP && window.tcLegs ? window.tcLegs().filter((l) => (l.trip || "mel-adl") === S.tripId) : [];
      const sumDir = (dr) => legsAll.filter((l) => l.dir === dr).reduce((a, l) => ({ km: a.km + l.km, mins: a.mins + l.mins }), { km: 0, mins: 0 });
      const gGo = sumDir("go"), gBack = sumDir("back");
      const od = {
        on: C.odoOn !== false,
        f: ost.f,
        c: ost.c,
        bg: ost.bg,
        sh: ost.sh,
        a: roll(OD.a, 4),
        b: roll(OD.b, 4),
        resetA: () => {
          if (window.tcOdoReset) window.tcOdoReset("a");
          else self.setState({ demoA: 0 });
          self.toast("\u0110\xE3 \u0111\u1EB7t l\u1EA1i Trip A");
        },
        resetB: () => {
          if (window.tcOdoReset) window.tcOdoReset("b");
          self.toast("\u0110\xE3 \u0111\u1EB7t l\u1EA1i Trip B");
        },
        nx: nxStop ? (nxStop.id === "end" ? "\u{1F3C1} " : "") + (nxStop.town || nxStop.name).replace(/ (VIC|SA|NSW|QLD|ACT|WA|TAS|NT)$/, "").split(" (")[0] : "\u2014",
        nxKm: nxKm != null ? nxKm + " km" : "\u2014",
        nxC: nxKm != null && nxKm <= 5 ? "#FBB040" : "#E8F1F5",
        nxBg: nxKm != null && nxKm <= 5 ? "rgba(251,176,64,0.18)" : "transparent",
        pct: pct + "%",
        dash: (RC * pct / 100).toFixed(1) + " " + RC.toFixed(1),
        obd: OBD.odo != null ? "ODO " + Math.round(OBD.odo).toLocaleString("en-AU") + " km" : "",
        range: OBD.range != null ? "C\xF2n ch\u1EA1y ~" + Math.round(OBD.range) + " km" : "",
        obdOn: OBD.odo != null || OBD.range != null,
        legNow: OD.leg ? "Ch\u1EB7ng n\xE0y: " + Math.round(OD.leg * 10) / 10 + " km \xB7 " + OD.legMin + " ph" : "Ch\u1EB7ng n\xE0y: ch\u01B0a ch\u1EA1y",
        openLog: () => self.setState({ logOpen: true }),
        logOpen: !!S.logOpen,
        closeLog: () => self.setState({ logOpen: false }),
        logRows: legsAll.slice(-40).reverse().map((l) => ({ t: new Date(l.start).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) + " " + new Date(l.start).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }), dir: l.dir === "go" ? "Ch\u1EB7ng \u0111i" : "Ch\u1EB7ng v\u1EC1", km: l.km + " km", est: l.est != null ? "\u01B0\u1EDBc t\xEDnh " + l.est + " km" : "", diff: l.est != null ? (l.km - l.est >= 0 ? "+" : "") + Math.round(l.km - l.est) + " km" : "", time: Math.floor(l.mins / 60) + "g" + p2(l.mins % 60), avg: l.avg + " km/g", place: l.place || "" })),
        logEmpty: !legsAll.length,
        totGo: "Ch\u1EB7ng \u0111i: " + Math.round(gGo.km) + " km \xB7 " + Math.floor(gGo.mins / 60) + "g" + p2(gGo.mins % 60),
        totBack: "Ch\u1EB7ng v\u1EC1: " + Math.round(gBack.km) + " km \xB7 " + Math.floor(gBack.mins / 60) + "g" + p2(gBack.mins % 60)
      };
      const switchTrip = (id) => {
        const cur = { goList: S.goList, backList: S.backList, skip: S.skip, custom: S.custom };
        let trips = (S.trips || []).slice(), mel = S.melStore;
        if (S.tripId === "mel-adl") mel = cur;
        else trips = trips.map((t) => t.id === S.tripId ? Object.assign({}, t, { lists: cur }) : t);
        const nt = id === "mel-adl" ? null : trips.find((t) => t.id === id);
        const L = id === "mel-adl" ? mel || { goList: DEF_GO.slice(), backList: DEF_BACK.slice(), skip: {}, custom: {} } : nt.lists || { goList: [], backList: [], skip: {}, custom: {} };
        self.save(Object.assign({ trips, melStore: mel, tripId: id, tripDlg: false, legManual: false, leg: "go" }, L));
      };
      const tripRows = [{ id: "mel-adl", name: "Melbourne \u21C4 Adelaide", km: 727, pinned: true, builtin: true }].concat((S.trips || []).slice().sort((a, b) => b.pinned - a.pinned || b.at - a.at)).map((t) => {
        const on = t.id === S.tripId;
        return {
          ring: on ? "inset 0 0 0 2px #FBB040" : "inset 0 0 0 1px rgba(255,255,255,0.1)",
          name: t.name,
          sub: t.km + " km" + (t.builtin ? " \xB7 c\xF3 s\u1EB5n" : " \xB7 " + Object.keys(t.places || {}).length + " ch\u1ED7 gh\xE9 g\u1EE3i \xFD") + (t.pinned && !t.builtin ? " \xB7 \u{1F4CC}" : ""),
          on: on ? "true" : "false",
          bg: on ? "rgba(251,176,64,0.16)" : "rgba(13,44,64,0.55)",
          curL: on ? "\u0110ang d\xF9ng" : "Ch\u1ECDn",
          curBg: on ? "#FBB040" : "#0D2C40",
          curFg: on ? "#2A1A00" : "#CFE6EE",
          edit: !t.builtin,
          pick: () => {
            if (!on) {
              switchTrip(t.id);
              self.toast("\u0110\xE3 \u0111\u1ED5i sang chuy\u1EBFn " + t.name);
            }
          },
          pin: () => self.save({ trips: S.trips.map((q2) => q2.id === t.id ? Object.assign({}, q2, { pinned: !q2.pinned }) : q2) }),
          copy: () => {
            const c = JSON.parse(JSON.stringify(t));
            c.id = "t" + Date.now().toString(36);
            c.name = t.name + " (b\u1EA3n sao)";
            c.at = Date.now();
            c.pinned = false;
            self.save({ trips: S.trips.concat([c]) });
          },
          rename: () => self.setState({ tripEdit: t.id, tripEditName: t.name }),
          del: () => {
            if (S.tripDel !== t.id) {
              self.setState({ tripDel: t.id });
              self.toast("B\u1EA5m Xo\xE1 l\u1EA7n n\u1EEFa \u0111\u1EC3 xo\xE1 chuy\u1EBFn " + t.name);
              return;
            }
            if (on) switchTrip("mel-adl");
            self.save({ trips: S.trips.filter((q2) => q2.id !== t.id), tripDel: null });
            window.tcLegsClear && window.tcLegsClear(t.id);
          },
          delL: S.tripDel === t.id ? "Xo\xE1 th\u1EADt?" : "Xo\xE1"
        };
      });
      const tp = {
        open: S.tripDlg,
        close: () => self.setState({ tripDlg: false, tripEdit: null, tripDel: null }),
        rows: tripRows,
        newTrip: () => self.setState({ tripDlg: false, scr: "rt", ntOpen: true, ntMsg: "", pnlMin: Object.assign({}, S.pnlMin || {}, { rt: false }) }),
        from: S.ntFrom,
        to: S.ntTo,
        msg: S.ntMsg,
        busy: S.ntBusy,
        lock: kbLk,
        lockL: drive ? "Xe \u0111ang ch\u1EA1y \u2014 \u0111\u1EADu xe r\u1ED3i m\u1EDBi t\u1EA1o chuy\u1EBFn m\u1EDBi" : 'G\xF5 n\u01A1i \u0111i v\xE0 n\u01A1i t\u1EDBi (vd "Melbourne" \u2192 "Sydney"). App t\u1EF1 t\xECm \u0111\u01B0\u1EDDng, g\u1EE3i \xFD ch\u1ED7 gh\xE9; ch\u1EB7ng v\u1EC1 = ch\u1EB7ng \u0111i \u0111\u1EA3o ng\u01B0\u1EE3c.',
        setFrom: (e) => self.setState({ ntFrom: e.target.value }),
        setTo: (e) => self.setState({ ntTo: e.target.value }),
        fromPh: "\u{1F4CD} V\u1ECB tr\xED c\u1EE7a Tom" + (LV.place && LV.place.suburb ? " (" + LV.place.suburb + ")" : ""),
        create: () => {
          if (drive || S.ntBusy) return;
          const sp0 = window.tcStartPt ? window.tcStartPt() : null;
          const f = (S.ntFrom || "").trim() || (sp0 ? sp0 : LV.place && LV.place.suburb || "Melbourne"), t2 = (S.ntTo || "").trim();
          if (!t2) {
            self.setState({ ntMsg: "G\xF5 n\u01A1i t\u1EDBi tr\u01B0\u1EDBc nha" });
            return;
          }
          if (!APP || !window.tcPlanTrip) {
            self.setState({ ntMsg: "B\u1EA3n m\u1EABu: t\u1EA1o chuy\u1EBFn c\u1EA7n app th\u1EADt (c\xF3 m\u1EA1ng)" });
            return;
          }
          self.setState({ ntBusy: true });
          window.tcPlanTrip(f, t2).then((trip) => {
            const trips = (self.state.trips || []).concat([trip]);
            self.save({ trips, ntBusy: false, ntFrom: "", ntTo: "" });
            setTimeout(() => {
              self.switchTripExt && self.switchTripExt(trip.id);
            }, 60);
            self.toast("\u0110\xE3 t\u1EA1o chuy\u1EBFn " + trip.name + " \xB7 " + trip.km + " km");
          }).catch(() => self.setState({ ntBusy: false }));
        },
        editing: !!S.tripEdit,
        editName: S.tripEditName || "",
        setEditName: (e) => self.setState({ tripEditName: e.target.value }),
        saveName: () => {
          const n = (S.tripEditName || "").trim();
          if (n) self.save({ trips: S.trips.map((q2) => q2.id === S.tripEdit ? Object.assign({}, q2, { name: n }) : q2), tripEdit: null });
          else self.setState({ tripEdit: null });
        }
      };
      self.switchTripExt = switchTrip;
      const curIds = isGo ? S.goList : S.backList;
      const saved = Object.keys(ALLP).map((id) => {
        const has = curIds.indexOf(id) >= 0;
        const p = ALLP[id];
        return { name: p.name, town: p.town, km: kmOf(id), icon: ICX[p.k], icF: icF(p.k), icS: icS(p.k), sign: SIGN[p.k], has, op: has ? 0.5 : 1, st: has ? "\u2713 \u0111\xE3 c\xF3" : "+ Th\xEAm", stC: has ? "#7BD88F" : "#FFD08A", add: () => {
          if (has) return;
          const arr = curIds.concat([id]).sort((a, b) => kmOf(a) - kmOf(b));
          self.save(isGo ? { goList: arr } : { backList: arr });
        } };
      }).sort((a, b) => a.km - b.km);
      const sdP = S.stopId === "end" ? { name: isGo ? TO : FROM, town: isGo ? TOS : FROMS, k: "end", km: TOTAL } : S.stopId && ALLP[S.stopId] ? Object.assign({}, ALLP[S.stopId], { km: kmOf(S.stopId) }) : null;
      const sdImg = S.stopId ? S.photos[S.stopId] || S.commons[S.stopId] || "" : "";
      const sd = sdP ? { hasPhoto: !!sdImg, noPhoto: !sdImg, photo: sdImg, onPhoto: (e) => readPhoto(e.target, (url) => self.save({ photos: Object.assign({}, S.photos, { [S.stopId]: url }) })), nav: () => tcn("nav", sdP.addr || ADDR[sdP.name] || sdP.name), name: sdP.name, town: sdP.town, sign: SIGN[sdP.k], icon: ICX[sdP.k], icF: icF(sdP.k), icS: icS(sdP.k), info: (sdP.stay ? "gh\xE9 " + sdP.stay + " ph \xB7 " : "") + "d\u1EF1 ki\u1EBFn " + fmt(timeAt(sdP.km), inSA(sdP.km)) + " \xB7 " + (sdP.km <= pos ? "\u0111\xE3 qua" : "c\xF2n " + (sdP.km - pos) + " km"), photoNote: "Ch\u01B0a c\xF3 h\xECnh. H\xECnh b\u1EA1n ch\u1EE5p khi gh\xE9 s\u1EBD hi\u1EC7n \u1EDF \u0111\xE2y" + (PHOTO_SRC[S.stopId] ? " \u2014 \u0111i\u1EC3m tham quan n\xE0y l\u1EA5y \u0111\u01B0\u1EE3c h\xECnh t\u1EEB Wikimedia Commons" : "") } : { name: "", town: "", sign: "", icon: "", info: "", photoNote: "", hasPhoto: false, noPhoto: true, photo: "", onPhoto: () => {
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
        const lu = logo && window.tcLogo ? window.tcLogo(label) : "";
        return { label, icon: ASI[ic], logoImg: !!lu, logoUrl: lu, sign: !lu, on: on ? "true" : "false", bg: "#1F5FAE", ring: on ? "0 0 0 3px #FBB040" : "none", pick: () => {
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
      const catTitle = /^q:/.test(S.cat) ? ("\u201C" + S.cat.slice(2) + "\u201D").toUpperCase() : (CATS.find((c) => c[0] === S.cat) || CATS[0])[1].toUpperCase();
      const addPlaceStop = (p) => {
        const km = window.tcRouteKm ? window.tcRouteKm(p.lat, p.lon, 150) : null;
        if (km == null) {
          self.toast("Ch\u1ED7 n\xE0y c\xE1ch tuy\u1EBFn \u0111\u01B0\u1EDDng qu\xE1 xa (h\u01A1n 150 km)");
          return;
        }
        const id = "c" + Date.now();
        const cu = Object.assign({}, S.custom, { [id]: { name: p.name, town: p.addr || "", k: p.k || "food", km: Math.round(km), stay: 20, lat: p.lat, lon: p.lon, addr: p.name + " " + (p.addr || "") } });
        const arr = (isGo ? S.goList : S.backList).concat([id]).sort((a, b) => (isGo ? cu[a].km : TOTAL - cu[a].km) - (isGo ? cu[b].km : TOTAL - cu[b].km));
        self.save(Object.assign({ custom: cu }, isGo ? { goList: arr } : { backList: arr }));
        self.toast("\u0110\xE3 th\xEAm v\xE0o ch\u1EB7ng gh\xE9: " + p.name);
      };
      const LIVEP = APP ? S.places[S.cat] || null : null;
      const results = APP ? LIVEP ? LIVEP.map((p) => ({ name: p.name, addr: p.addr || "", sign: ASI[p.k] || ASI.food, logoBd: p.logo ? "0" : "2px solid #FFFFFF", logoUrl: p.logo || "", logoImg: !!p.logo, logoTxt: !p.logo, logoBg: p.logo ? "#FFFFFF" : "#1F5FAE", km: p.km + " km", eta: fmt(d.getHours() * 60 + d.getMinutes() + p.km * 0.75, false), open: p.open === true ? "\u0110ang m\u1EDF c\u1EEDa" : p.open === false ? "\u0110\xE3 \u0111\xF3ng c\u1EEDa" : "Gi\u1EDD m\u1EDF: ch\u01B0a r\xF5", openC: p.open === true ? "#7BD88F" : p.open === false ? "#FF9A9E" : "#8FC3D3", side: p.side || "", price: "", nav: () => tcn("nav", p.lat + "," + p.lon), addStop: () => addPlaceStop(p), save: () => {
        self.save({ savedPl: S.savedPl.concat([p]) });
        self.toast("\u0110\xE3 l\u01B0u: " + p.name);
      } })) : [] : (RES[S.cat] || []).map(([name, addr, km, open, side, price, logo]) => ({ name, addr, sign: ASI[(CATS.find((c) => c[0] === S.cat) || CATS[0])[2]], logoBd: "2px solid #FFFFFF", logoUrl: "", logoImg: false, logoTxt: true, logoBg: "#1F5FAE", km: km + " km", eta: fmt(d.getHours() * 60 + d.getMinutes() + km * 0.6, false), open: open ? "\u0110ang m\u1EDF c\u1EEDa" : "\u0110\xE3 \u0111\xF3ng c\u1EEDa", openC: open ? "#7BD88F" : "#FF9A9E", side, price: price ? price + " (n\u1EBFu c\xF3 d\u1EEF li\u1EC7u)" : "", nav: () => {
      }, addStop: () => {
      }, save: () => {
      } }));
      const searchNote = APP ? (S.placesMsg || (S.placesBusy ? "\u0110ang t\xECm\u2026" : "B\u1EA5m m\u1ED9t n\xFAt \u0111\u1EC3 t\xECm")).toUpperCase() : "PH\xCDA TR\u01AF\u1EDAC TR\xCAN \u0110\u01AF\u1EDCNG \u0110ANG CH\u1EA0Y";
      const searchRetry = APP && !S.placesBusy && (S.placesFail || LIVEP && !LIVEP.length), doRetry = () => window.tcFindPlaces && window.tcFindPlaces(S.cat);
      if (APP && S.scr === "search" && !self._autoS) {
        self._autoS = true;
        setTimeout(() => window.tcFindPlaces && window.tcFindPlaces(self.state.cat), 60);
      }
      if (S.scr !== "search") self._autoS = false;
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
      const wsEq = (n) => n === 3 ? [33, 34, 33] : n === 2 ? [50, 50] : [100];
      const wsP = S.wsPct && S.wsPct.length === S.wsSel.length ? S.wsPct : wsEq(S.wsSel.length);
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
        thumb: S.wsSel.length ? S.wsSel.map((id, i) => ({ n: i + 1, name: nameOf(id), flex: wsP[i], pctL: wsP[i] + "%", div: i > 0, drag: (e) => {
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch (x) {
          }
          self.setState({ wsDrag: i });
        }, bg: ["#1B3A52", "#2A2440", "#203A2A"][i] })) : [{ n: "\u2013", name: "Ch\u01B0a ch\u1ECDn app", flex: 100, pctL: "", div: false, drag: () => {
        }, bg: "#0D2C40" }],
        move: (e) => {
          const k = S.wsDrag;
          if (k == null || k < 1) return;
          const r = e.currentTarget.getBoundingClientRect();
          const f = (e.clientX - r.left) / r.width * 100;
          const P = wsP.slice();
          const lo = P.slice(0, k - 1).reduce((a, b2) => a + b2, 0), hi = lo + P[k - 1] + P[k];
          const b = Math.max(lo + 20, Math.min(hi - 20, Math.round(f / 5) * 5));
          P[k - 1] = b - lo;
          P[k] = hi - b;
          self.setState({ wsPct: P });
        },
        up: () => {
          if (S.wsDrag != null) self.setState({ wsDrag: null });
        },
        presets: (S.wsSel.length === 2 ? [["Chia \u0110\u1EC1u", [50, 50]], ["2 : 1", [65, 35]], ["1 : 2", [35, 65]]] : S.wsSel.length === 3 ? [["Chia \u0110\u1EC1u", [33, 34, 33]], ["Gi\u1EEFa L\u1EDBn", [25, 50, 25]], ["Tr\xE1i L\u1EDBn", [50, 25, 25]], ["Ph\u1EA3i L\u1EDBn", [25, 25, 50]]] : []).map(([l, v]) => {
          const on = v.join() === wsP.join();
          return { label: l, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => self.setState({ wsPct: v }) };
        }),
        hasPresets: S.wsSel.length > 1,
        hint: S.wsSel.length + "/3 \xF4 \u0111\xE3 ch\u1ECDn" + (S.wsSel.length === 3 ? " \u2014 \u0111\u1EE7 r\u1ED3i" : ""),
        hintC: S.wsSel.length === 3 ? "#FFD08A" : "#8FC3D3"
      };
      const WCOL = ["#1B3A52", "#2A2440", "#203A2A"];
      const wsPcts = (w) => w.pcts && w.pcts.length === w.apps.length ? w.pcts : wsEq(w.apps.length);
      const wsCards = S.wsList.map((w, i) => ({
        name: w.name,
        rt: !!w.rt,
        boxes: w.apps.map((id, k) => ({ name: nameOf(id), flex: wsPcts(w)[k], bg: WCOL[k] })),
        edit: () => {
          self.setState({ createOpen: true, wsEdit: i, wsSel: w.apps.slice(), wsPct: wsPcts(w).slice(), wsName: w.name, rtCheck: !!w.rt });
          if (APP && !S.apps) tcn("apps");
        },
        open: () => {
          const pcts = wsPcts(w);
          const apps = w.apps.filter((a) => a.indexOf("w-") !== 0).map((a, k) => [a, pcts[k]]);
          tcn("launch", JSON.stringify(apps));
          self.setS("wsLastLaunch", { apps, rt: !!w.rt, name: w.name });
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
          else if (tabOk !== "radio") {
            const LB = window.__jbLib;
            const jbRow = (kind, name, sub, letter, tile) => ({ t: name, s: sub, letter, tile, rad: "6px", jb: { kind, name } });
            if (LB && (C.musicApp || "jukebox") === "jukebox") {
              if (tabOk === "lists") rowsRaw = (LB.playlists || []).map((x) => jbRow("playlist", x.name, x.n + " b\xE0i", "\u2261", "#1B3A52"));
              if (tabOk === "albums") rowsRaw = [jbRow("shuffle", "Tr\u1ED9n t\u1EA5t c\u1EA3 b\xE0i", "Th\u01B0 vi\u1EC7n Tom\u2019s Jukebox", "\u292E", "#3A2A10")].concat((LB.albums || []).slice(0, 60).map((x) => jbRow("album", x.name, x.artist + " \xB7 " + x.n + " b\xE0i", (x.name || "?").charAt(0), "#2A2440")), (LB.artists || []).slice(0, 40).map((x) => jbRow("artist", x.name, "Ngh\u1EC7 s\u0129 \xB7 " + x.n + " b\xE0i", (x.name || "?").charAt(0), "#24402A")));
              if (!rowsRaw.length) rowsRaw = [{ t: "Tom\u2019s Jukebox ch\u01B0a c\xF3 " + (tabOk === "lists" ? "danh s\xE1ch ph\xE1t" : "b\xE0i"), s: "Th\xEAm b\xE0i b\xEAn Tom\u2019s Jukebox", letter: "\u266A", tile: "#3A2A10", rad: "6px" }];
            } else rowsRaw = [{ t: "M\u1EDF trong " + (MD && MD.app || "app nh\u1EA1c"), s: (C.musicApp || "jukebox") === "jukebox" ? "C\u1EA7n Tom\u2019s Jukebox 0.9.5 \u0111\u1EC3 xem th\u01B0 vi\u1EC7n ngay \u0111\xE2y" : "Danh s\xE1ch ph\xE1t / album ch\u1ECDn b\xEAn app nh\u1EA1c", letter: "\u2197", tile: "#1B3A52", rad: "6px", open: true }];
          }
        }
        if (S.src === "radio") rowsRaw = tabOk === "fav" ? toRows([].concat(RL.near || [], RL.au || [], RL.vn || []).filter((r) => S.favs[r.id])) : toRows(RL[tabOk]);
        if (S.src === "podcast") {
          const LB = window.__jbLib;
          if (!LB) rowsRaw = [{ t: "Ch\u01B0a n\u1ED1i \u0111\u01B0\u1EE3c Tom\u2019s Jukebox", s: "B\u1EA5m \u0111\u1EC3 th\u1EED l\u1EA1i \xB7 c\u1EA7n Tom\u2019s Jukebox 0.9.6 tr\u1EDF l\xEAn", letter: "\u21BB", tile: "#5A3A10", rad: "50%", retry: true }];
          else {
            const pc = (x, grp) => ({ t: x.name, s: (grp ? grp + " \xB7 " : x.author ? x.author + " \xB7 " : "") + "Ph\xE1t t\u1EADp m\u1EDBi nh\u1EA5t", letter: (x.name || "P").charAt(0), tile: "#7A4BB5", rad: "8px", jb: { kind: "podcast", name: x.id || x.name } });
            const subs = (LB.podcasts || []).map((x) => pc(x, "\u0110\xE3 theo d\xF5i")), groups2 = LB.podGroups || [];
            const hdr = (t) => ({ t: t.toUpperCase(), s: "", letter: "", tile: "transparent", rad: "0", hdr: true });
            if (tabOk === "pnew") {
              const seen = {};
              rowsRaw = subs.concat(...groups2.filter((g) => /news|catholic/.test(g.key)).map((g) => g.items.map((x) => pc(x, g.name)))).filter((r) => !seen[r.t] && (seen[r.t] = 1));
            } else rowsRaw = (subs.length ? [hdr("K\xEAnh Tom theo d\xF5i")].concat(subs) : []).concat(...groups2.map((g) => [hdr(g.name)].concat(g.items.map((x) => pc(x, g.name)))));
            if (!rowsRaw.length) rowsRaw = [{ t: "\u0110ang t\u1EA3i danh m\u1EE5c podcast t\u1EEB Tom\u2019s Jukebox\u2026", s: "B\u1EA5m \u0111\u1EC3 th\u1EED l\u1EA1i", letter: "\u21BB", tile: "#5A3A10", rad: "50%", retry: true }];
          }
          const q2 = (S.mpQ || "").trim().toLowerCase();
          if (q2) rowsRaw = rowsRaw.filter((r) => !r.hdr && !r.retry && (r.t + " " + r.s).toLowerCase().indexOf(q2) >= 0);
        }
        if (S.src === "radio" && !rowsRaw.length) rowsRaw = [{ t: S.radioLists ? "Kh\xF4ng t\xECm th\u1EA5y \u0111\xE0i" : "\u0110ang t\u1EA3i danh s\xE1ch \u0111\xE0i\u2026", s: "C\u1EA7n c\xF3 m\u1EA1ng", letter: "\u2026", tile: "#2B2B2B", rad: "50%" }];
        if (APP && S.src !== "radio" && !rowsRaw.length) rowsRaw = [{ t: !window.__jbLib ? C.musicApp === "jukebox" ? "Ch\u01B0a \u0111\u1ECDc \u0111\u01B0\u1EE3c th\u01B0 vi\u1EC7n Tom's Jukebox" : "App nh\u1EA1c n\xE0y kh\xF4ng cho xem danh s\xE1ch" : S.src === "podcast" ? "Ch\u01B0a theo d\xF5i podcast n\xE0o trong Tom's Jukebox" : "Th\u01B0 vi\u1EC7n tr\u1ED1ng", s: !window.__jbLib ? "C\u1EA7n Tom's Jukebox 0.9.5 tr\u1EDF l\xEAn \u2014 m\u1EDF Jukebox m\u1ED9t l\u1EA7n r\u1ED3i b\u1EA5m l\u1EA1i" : "Th\xEAm nh\u1EA1c trong Tom's Jukebox", letter: "!", tile: "#2B2B2B", rad: "50%", open: true }];
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
          return { label, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => {
            if (APP && k === "podcast") tcn("media", "jbquery");
            self.setState({ src: k, mpTab: TABS[k][0][0], nowT: "", nowS: "", mpQ: "", panelAt: Date.now() });
          } };
        }),
        srcNote: S.src === "music" ? APP ? "Ngu\u1ED3n: " + (MD && MD.app || "app nh\u1EA1c \u0111ang ph\xE1t") : "Ngu\u1ED3n: Tom's Jukebox" : S.src === "radio" ? "Radio qua m\u1EA1ng \xB7 ~30\u201360 MB/gi\u1EDD" : "Podcast",
        tabs: TABS[S.src].map(([k, label]) => {
          const on = tabOk === k;
          return { label, on: on ? "true" : "false", bg: on ? ON.bg : OFF.bg, fg: on ? ON.fg : OFF.fg, pick: () => {
            if (k === "radio") self.setState({ src: "radio", mpTab: "near", panelAt: Date.now() });
            else self.setState({ mpTab: k, panelAt: Date.now() });
          } };
        }),
        searchPh: drive ? 'Kho\xE1 g\xF5 khi xe ch\u1EA1y \u2014 n\xF3i "Hey Tom, ph\xE1t\u2026"' : S.src === "radio" ? "T\xECm \u0111\xE0i" : S.src === "podcast" ? "T\xECm podcast" : "T\xECm b\xE0i, ngh\u1EC7 s\u0129",
        q: S.mpQ || "",
        setQ: (e) => self.setState({ mpQ: e.target.value, panelAt: Date.now() }),
        searchBg: drive ? "#0A1822" : "#0D2C40",
        regionOn: S.src === "radio" && tabOk === "near",
        regionL: APP ? "V\xF9ng hi\u1EC7n t\u1EA1i: " + (S.radioLists && S.radioLists.region || LV.place && LV.place.suburb || "\u2026") + " (theo GPS) \xB7 T\u1EF1 \u0111\u1ED5i \u0111\xE0i theo v\xF9ng: M\u1EDF" : "V\xF9ng hi\u1EC7n t\u1EA1i: " + regName + " (theo GPS \xB7 m\u1EABu) \xB7 T\u1EF1 \u0111\u1ED5i \u0111\xE0i theo v\xF9ng: M\u1EDF",
        rows: rowsRaw.slice(0, maxRows).map((r) => {
          const cur = playing && r.t === curT;
          return Object.assign({ isRadio: false, id: "" }, r, { bg: r.hdr ? "transparent" : cur ? "rgba(251,176,64,0.14)" : "rgba(13,44,64,0.55)", st: cur ? "\u0110ANG PH\xC1T" : "", stC: "#FFD08A", play: r.hdr ? () => {
          } : r.retry ? () => {
            tcn("media", "jbquery");
            self.toast("\u0110ang h\u1ECFi l\u1EA1i Tom\u2019s Jukebox\u2026");
            self.setState({ panelAt: Date.now() });
          } : r.jb ? () => {
            tcn("media", "jb:" + JSON.stringify(r.jb));
            self.setState({ panelAt: Date.now() });
          } : r.open ? () => tcn(S.src === "podcast" ? "openApp" : "openMedia", S.src === "podcast" ? "podcast" : "") : r.qid != null ? () => tcn("media", "queue:" + r.qid) : play(r.t, r.isRadio ? "Radio \xB7 tr\u1EF1c ti\u1EBFp" : r.s, r.isRadio ? "radio" : S.src, r.url), favOn: S.favs[r.id] ? "true" : "false", favC: S.favs[r.id] ? "#FBB040" : "#5E8496", fav: () => self.setState({ favs: Object.assign({}, S.favs, { [r.id]: !S.favs[r.id] }), panelAt: Date.now() }) });
        }),
        fs: drive ? 18 : 15,
        rowPad: drive ? "10px 8px" : "6px 8px",
        foot: drive ? "Xe \u0111ang ch\u1EA1y: ch\u1EEF to, t\u1ED1i \u0111a 6 d\xF2ng, t\u1EF1 \u0111\xF3ng sau 8 gi\xE2y kh\xF4ng \u0111\u1EE5ng." : S.src === "music" ? `Tom's Jukebox: \u0111\u1EE7 4 tab. Spotify / YouTube Music: ch\u1EC9 th\u1EA5y h\xE0ng ch\u1EDD n\u1EBFu app cho ph\xE9p, c\xF2n l\u1EA1i c\xF3 n\xFAt "M\u1EDF trong \u2026".` : S.src === "radio" ? 'M\u1EA5t s\xF3ng (vd Kaniva \u2192 Keith) app s\u1EBD h\u1ECFi: "Chuy\u1EC3n sang nh\u1EA1c trong m\xE1y?"' : "Podcast l\u1EA5y t\u1EEB Tom\u2019s Jukebox \xB7 \u23EE l\xF9i 15 gi\xE2y \xB7 \u23ED t\u1EDBi 30 gi\xE2y."
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
        { t: "T\xECm tr\u1EA1m x\u0103ng g\u1EA7n nh\u1EA5t", re: /(tr[aạ]m x[aă]ng|đổ x[aă]ng|petrol|fuel|servo|gas station)/, run: () => {
          self.setState({ va: false, scr: "search", cat: "fuel" });
          if (APP && window.tcFindPlaces) window.tcFindPlaces("fuel");
          self.say("D\u1EA1, \u0111ang t\xECm tr\u1EA1m x\u0103ng g\u1EA7n nh\u1EA5t");
        } },
        { t: "McDonald's g\u1EA7n nh\u1EA5t", re: /(mc ?donald|mác đô|macca)/, run: () => {
          self.setState({ va: false, scr: "search", cat: "mcd" });
          if (APP && window.tcFindPlaces) window.tcFindPlaces("mcd");
          self.say("D\u1EA1, \u0111ang t\xECm McDonald's");
        } },
        { t: "C\xF2n bao xa", re: /(bao xa|còn bao nhiêu|how far|bao lâu|how long)/, run: () => sayV("D\u1EA1, c\xF2n " + (TOTAL - pos) + " ki l\xF4 m\xE9t, t\u1EDBi " + (isGo ? TO : FROM) + " kho\u1EA3ng " + fmt(endMin, inSA(TOTAL))) },
        { t: "B\xE0i k\u1EBF", re: /(bài kế|bài tiếp|bài sau|next|qua bài|chuyển bài)/, run: () => {
          tcn("media", "next");
          sayV("D\u1EA1");
        } },
        { t: "B\xE0i tr\u01B0\u1EDBc", re: /(bài trước|lùi bài|quay lại bài|previous)/, run: () => {
          tcn("media", "prev");
          sayV("D\u1EA1");
        } },
        { t: "L\u1EDBn ti\u1EBFng", re: /(lớn tiếng|to lên|lớn lên|tăng âm|vặn to|volume up|louder|turn it up)/, run: () => {
          tcn("media", "volup");
          tcn("media", "volup");
          sayV("D\u1EA1");
        } },
        { t: "Nh\u1ECF ti\u1EBFng", re: /(nhỏ tiếng|nhỏ lại|nhỏ xuống|giảm âm|vặn nhỏ|volume down|quieter|turn it down)/, run: () => {
          tcn("media", "voldown");
          tcn("media", "voldown");
          sayV("D\u1EA1");
        } },
        { t: "T\u1EAFt nh\u1EA1c", re: /((tắt|dừng|ngưng|ngừng|thôi) ?(nhạc|bài|hát|đài|radio|phát)|^(tắt|dừng|ngưng|ngừng|pause|stop)$|stop (the )?music|pause music)/, run: () => {
          if (S.src === "radio") tcn("radio", "stop");
          else tcn("media", "pause");
          sayV("D\u1EA1, \u0111\xE3 t\u1EAFt");
        } },
        { t: "B\u1EADt playlist \u2026", re: /(bật|mở|phát|cho (?:mình |tui |tôi |em )?nghe|nghe|chơi) (playlist|danh sách|album|ca sĩ|nghệ sĩ|nhạc của|bài hát|bài) (.+)$/, run: (m) => {
          if (/^(hát|nhạc|nhạc đi|đi|lên)$/.test(m[3].trim())) {
            self.setState({ src: "music" });
            tcn("media", "play");
            return sayV("D\u1EA1, ph\xE1t nh\u1EA1c n\xE8");
          }
          const k = /playlist|danh sách/.test(m[2]) ? "playlist" : /album/.test(m[2]) ? "album" : /ca sĩ|nghệ sĩ|nhạc của/.test(m[2]) ? "artist" : "search";
          self.setState({ src: "music" });
          tcn("media", "jb:" + JSON.stringify({ kind: k, name: m[3] }));
          sayV("D\u1EA1, \u0111ang m\u1EDF " + m[3]);
        } },
        { t: "Tr\u1ED9n b\xE0i", re: /(trộn bài|ngẫu nhiên|shuffle)/, run: () => {
          self.setState({ src: "music" });
          tcn("media", "jb:" + JSON.stringify({ kind: "shuffle", name: "" }));
          sayV("D\u1EA1, ph\xE1t ng\u1EABu nhi\xEAn");
        } },
        { t: "B\u1EADt nh\u1EA1c", re: /((bật|mở|phát|chơi|cho (?:mình |tui |tôi |em )?nghe|nghe) ?(nhạc|bài hát|bài|music)|^play|play music|resume|tiếp tục (phát|nghe|nhạc)|^(bật|mở) lên$)/, run: () => {
          self.setState({ src: "music" });
          tcn("media", "play");
          sayV("D\u1EA1, ph\xE1t nh\u1EA1c n\xE8");
        } },
        { t: "Nghe \u0111\xE0i v\xF9ng n\xE0y", re: /(đài|radio|ra đi ô)/, run: () => {
          self.setState({ va: false, src: "radio", mpOpen: true, mpTab: "near", panelAt: Date.now() });
          const n = S.radioLists && S.radioLists.near && S.radioLists.near[0] || null;
          if (APP && n) tcn("radio", JSON.stringify({ url: n.url, name: n.name }));
          self.say(n ? "D\u1EA1, \u0111ang m\u1EDF " + n.name : "D\u1EA1, m\u1EDF danh s\xE1ch \u0111\xE0i v\xF9ng n\xE0y");
        } },
        { t: "B\u1EADt ri\xEAng t\u01B0", re: /(riêng tư|privacy)/, run: () => {
          self.setS("privacy", !/tắt/.test(S.vaHeard || ""));
          sayV("D\u1EA1, \u0111\xE3 " + (/tắt/.test(S.vaHeard || "") ? "t\u1EAFt" : "b\u1EADt") + " Ch\u1EBF \u0110\u1ED9 Ri\xEAng T\u01B0");
        } },
        { t: "D\u1ECBu m\u1EAFt", re: /(dịu mắt|tối màn hình|calm mode|dim)/, run: () => {
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
        { t: "Xe t\xF4i \u1EDF \u0111\xE2u?", re: /(xe (tôi|tui|mình|em) (ở|đậu|nằm) đâu|đậu xe ở đâu|where.*(car|park)|my car)/, run: () => {
          const pk = window.NAV && window.NAV.hist.park;
          self.setState({ va: false, scr: "trip" });
          if (pk) {
            window.NAV.flyTo([pk.lat, pk.lon], 17);
            sayV("D\u1EA1, xe \u0111\u1EADu \u1EDF " + (pk.name || "ch\u1ED7 \u0111\xE1nh d\u1EA5u tr\xEAn b\u1EA3n \u0111\u1ED3"));
          } else sayV("D\u1EA1, m\xECnh ch\u01B0a ghi ch\u1ED7 \u0111\u1EADu xe n\xE0o");
        } },
        { t: "Ch\u1EC9 \u0111\u01B0\u1EDDng t\u1EDBi \u2026", re: /(chỉ đường|dẫn đường|đi tới|đi đến|navigate|take me|drive|directions|go)( tới| đến| to)? (.+)$/, run: (m) => {
          const q2 = m[3];
          const NV2 = window.NAV, ll = LV.lat != null ? [LV.lat, LV.lon] : null;
          if (!NV2 || !ll) {
            tcn("nav", q2);
            sayV("D\u1EA1, \u0111ang ch\u1EC9 \u0111\u01B0\u1EDDng t\u1EDBi " + q2);
            return;
          }
          if (/^(nhà|về nhà|home)$/.test(q2.trim()) && window.tcHome && window.tcHome()) {
            const h = window.tcHome();
            self.setState({ va: false, scr: "home", wp: [{ name: "Nh\xE0", lat: h.lat, lon: h.lon }] });
            NV2.startTo({ name: "Nh\xE0", lat: h.lat, lon: h.lon });
            return;
          }
          sayV("D\u1EA1, \u0111ang t\xECm " + q2);
          NV2.search(q2, ll, (r) => {
            const p0 = r && r[0];
            if (!p0) {
              sayV("D\u1EA1, m\xECnh kh\xF4ng t\xECm th\u1EA5y " + q2);
              return;
            }
            const w = { name: p0.name, lat: p0.lat, lon: p0.lon, logo: p0.logo || "" };
            self.setState({ va: false, scr: "home", wp: [w] });
            NV2.startTo(w);
          });
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
        ["T\xECm Ch\u1ED7: logo t\u1EEBng h\xE3ng (t\u1EF1 l\u1EA5y, nh\u1EDB s\u1EB5n)", "T\xECm Ch\u1ED7", "search"],
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
      const hrNow = d.getHours();
      const tod = window.tcTod ? window.tcTod(d) : hrNow < 6 || hrNow >= 20 ? "night" : hrNow < 7 ? "dawn" : hrNow >= 19 ? "dusk" : "day";
      const CLOUD = "M14 34h20a8 8 0 0 0 0-16 11 11 0 0 0-21 3 7 7 0 0 0 1 13z";
      const WP = {
        clear: [{ d: "M24 6v5M24 37v5M6 24h5M37 24h5M11.3 11.3l3.5 3.5M33.2 33.2l3.5 3.5M11.3 36.7l3.5-3.5M33.2 14.8l3.5-3.5", fill: "none", stroke: "#FFD24D", sw: 2.6, cls: "sr" }, { d: "M24 16a8 8 0 1 0 0.01 0z", fill: "#FFD24D", stroke: "none", sw: 0, cls: "" }],
        night: [{ d: "M30 10a14 14 0 1 0 8 25 12 12 0 0 1-8-25z", fill: "#F3EFDC", stroke: "none", sw: 0, cls: "" }, { d: "M12 12l1 2 2 1-2 1-1 2-1-2-2-1 2-1z", fill: "#FFFFFF", stroke: "none", sw: 0, cls: "fl" }],
        cloudy: [{ d: "M30 14a7 7 0 1 0 0.01 0z", fill: "#FFD24D", stroke: "none", sw: 0, cls: "" }, { d: CLOUD, fill: "#E8F1F5", stroke: "none", sw: 0, cls: "cl" }],
        rain: [{ d: CLOUD, fill: "#C9D6DE", stroke: "none", sw: 0, cls: "cl" }, { d: "M17 38l-1 3M24 38l-1 3M31 38l-1 3", fill: "none", stroke: "#8FD4FF", sw: 2.4, cls: "rd" }],
        storm: [{ d: CLOUD, fill: "#9AA8B3", stroke: "none", sw: 0, cls: "cl" }, { d: "M25 30l-5 8h5l-3 7", fill: "none", stroke: "#FFE066", sw: 2.6, cls: "fl" }, { d: "M15 38l-1 3M33 38l-1 3", fill: "none", stroke: "#8FD4FF", sw: 2.2, cls: "rd" }],
        fog: [{ d: "M8 18h32M5 25h38M10 32h28", fill: "none", stroke: "#E1E8EC", sw: 3, cls: "cl" }]
      };
      const SKYC = { day: "linear-gradient(180deg,#3f8fd6,#86c1ea)", dawn: "linear-gradient(180deg,#f19a6b,#f9d1a6)", dusk: "linear-gradient(180deg,#d9734f,#f0b27f)", night: "linear-gradient(180deg,#07112a,#22345e)" };
      const wxSky = wk === "rain" ? "linear-gradient(180deg,#3d4e5e,#6c7f8f)" : wk === "storm" ? "linear-gradient(180deg,#1f2833,#3b4756)" : wk === "fog" ? "linear-gradient(180deg,#8e9aa3,#c3cacf)" : wk === "cloudy" && tod === "day" ? "linear-gradient(180deg,#5d7488,#93a6b4)" : SKYC[tod];
      const wxc = {
        parts: WP[wk] || WP.cloudy,
        sky: wxSky,
        cls: "wx-anim" + (drive ? " wx-calm" : ""),
        hl: WX && WX.hi != null ? "\u2191" + Math.round(WX.hi) + "\xB0  \u2193" + Math.round(WX.lo) + "\xB0" : "",
        desc: WX ? (WXVI[wk] || "") + (WX.rain ? " \xB7 " + Math.round(WX.rain) + "%" : "") : "\u0110ang l\u1EA5y\u2026",
        aria: WX ? wxT + " " + (WXVI[wk] || "") : "\u0111ang l\u1EA5y",
        open: () => self.setState({ idleOn: true, idleAt: Date.now() })
      };
      window.__wxState = { kind: wk, tod, calm: drive && !!C.calm, drive };
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
        c: night ? "#F2D3A6" : cs.c || "#CFF6FF",
        glow: night ? "none" : cs.glow || "none",
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
        op: night ? 0.82 : 1,
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
      const openTheme = () => self.setState({ scr: "theme", last: Date.now() });
      const BUILT = ["neon", "outback", "coast", "melb", "neonau", "sgcenter", "sgnight", "mekong", "rain"];
      const TGROUPS = TGROUPS0;
      const COCKPITS = [["lowpoly", "Low-Poly"], ["neon", "Neon"], ["real", "Th\u1EADt"], ["hiace", "HiAce C\u1EE7a Tom"], ["lux", "Xe Sang"], ["sport", "Th\u1EC3 Thao"], ["ev", "Xe \u0110i\u1EC7n T\u01B0\u01A1ng Lai"], ["retro70", "C\u1ED5 \u0110i\u1EC3n 70"], ["offroad", "4WD Off-Road"], ["truck", "Xe T\u1EA3i \u0110\u01B0\u1EDDng D\xE0i"], ["none", "Kh\xF4ng Tapl\xF4 (HUD)"], ["pixel", "Retro Pixel 8-bit"]];
      const GAUGES = [["auto", "Theo Giao Di\u1EC7n"], ["classic", "C\u1ED5 \u0110i\u1EC3n"], ["neon", "Neon"], ["bar", "Thanh Ngang"], ["minimal", "T\u1ED1i Gi\u1EA3n"], ["rings", "V\xF2ng L\u1ED3ng"], ["rally", "Rally"], ["retro", "Retro X\u01B0a"]];
      const GMAP = { lp_au: "classic", neon: "neon", synth: "neon", cyber: "neon", neonau: "neon", rally: "rally", plane: "rings", sgold: "retro", glass: "classic", outback: "bar", coast: "bar", melb: "bar", dandenong: "bar", yarra: "bar", snow: "bar", lp_farm: "bar", lp_coast: "bar", lp_outback: "bar", lp_melb: "bar", lp_dande: "bar", lp_yarra: "bar", lp_snow: "bar", lp_autumn: "bar", lp_wheat: "bar" };
      const CP_AUTO = { outback: "offroad", lp_outback: "offroad", rally: "sport", synth: "neon", cyber: "neon", neon: "neon", neonau: "neon", sgold: "retro70", hud: "none", plane: "none" };
      const chip = (on) => ({ bg: on ? "#FBB040" : "#0D2C40", fg: on ? "#2A1A00" : "#E8F1F5" });
      const thTheme = C.lpTheme || "lp_au";
      const TH_DEF = ["lp_au", "neon", "lp_coast", "lp_saigon"], thExtra = Array.isArray(C.thExtra) ? C.thExtra : [];
      const regionTheme = C.autoScene && thTheme.indexOf("lp_") === 0 && window.__regionScene ? window.__regionScene : null;
      const curTheme = regionTheme || thTheme;
      const curCockpit = C.cockpitAuto && CP_AUTO[curTheme] ? CP_AUTO[curTheme] : C.cockpit2 || "lowpoly";
      const curGauge = C.gaugeAuto ? GMAP[curTheme] || "minimal" : C.gaugeManual || "classic";
      window.__curGauge = curGauge;
      const engineOn = curTheme.indexOf("lp_") === 0 || BUILT.indexOf(curTheme) < 0 || C.drawStyle === "poly" || curCockpit !== "neon";
      const sunNow = tod;
      const LIMV = LV.limit || null;
      const sceneCfg = { on: engineOn && !nar, noGauge: true, slim: true, theme: curTheme, style: curTheme.indexOf("lp_") === 0 ? "poly" : C.drawStyle === "poly" ? "poly" : "flat", cockpit: curCockpit, gauge: curGauge, tod: sunNow, wx: wk === "night" ? "clear" : wk === "cloudy" ? "cloud" : wk, drive, moveMode: C.sceneMove || "still", dim: drive && C.calm ? 0.25 : 0, unit: C.unit === "kmg" ? "km/g" : "km/h" };
      const sk = JSON.stringify(sceneCfg);
      const lpOn = engineOn && !nar;
      const spF = Math.min(1, (APP ? LV.speed || 0 : drive ? S.speed : 0) / 160);
      const overC = sb.c === "#FF7A7A" || sb.c === "#FFC46B" ? sb.c : null;
      const nxtStop = (() => {
        try {
          return rt && rt.stops ? rt.stops.find((x) => x.cls === "nxt") : null;
        } catch (e) {
          return null;
        }
      })();
      dk = {
        on: !nar,
        arc: (348 * spF).toFixed(1) + " 465",
        arcC: overC || "#5FD4F0",
        arc2: (292 * spF).toFixed(1) + " 390",
        arcC2: overC || "#FBB040",
        numC: overC || "#FFFFFF",
        unit: C.unit === "mph" ? "MPH" : "KM/G",
        note: nxtStop ? nxtStop.dist + " \xB7 " + nxtStop.name.split(" (")[0].slice(0, 14) : sb.limNote || "",
        gx: 846,
        sx: 950
      };
      mpPos = { L: "auto", R: "20px", W: 552 };
      if (window.TCScene && sk !== window.__sceneKey) {
        window.__sceneKey = sk;
        window.TCScene.set(sceneCfg);
      }
      if (window.TCScene) window.TCScene.set({ speed: APP ? LV.speed || 0 : drive ? S.speed : 0, limit: LIMV ? LIMV.v : 0 });
      if (!engineOn && window.__tc) {
        const want = { theme: curTheme, cockpit: "neon", gauge: curGauge };
        const ts = window.__tc.state;
        if (ts.theme !== want.theme || ts.gauge !== want.gauge || ts.cockpit !== "neon") window.__tc.setState(want);
      }
      if (!window.__thumbs) window.__thumbs = {};
      const thumbOf = (k) => {
        const key = k + "|" + (k.indexOf("lp_") === 0 ? "poly" : C.drawStyle);
        if (!window.__thumbs[key] && window.TCScene && S.scr === "theme") {
          try {
            window.__thumbs[key] = window.TCScene.thumb(k, k.indexOf("lp_") === 0 ? "poly" : C.drawStyle === "poly" ? "poly" : "flat", "none", 256, 144);
          } catch (e) {
            window.__thumbs[key] = "";
          }
        }
        return window.__thumbs[key] || "";
      };
      const th = {
        homeBg: [[true, "\u{1F5FA} B\u1EA3n \u0110\u1ED3"], [false, "\u{1F3D4} C\u1EA3nh Low-Poly"]].map(([k, l]) => Object.assign({ label: l, on: C.homeMap !== false === k ? "true" : "false", pick: () => self.setS("homeMap", k) }, chip(C.homeMap !== false === k))),
        styles: [["flat", "G\u1ED1c"], ["poly", "Low-Poly"]].map(([k, l]) => Object.assign({ label: l, on: (C.drawStyle || "poly") === k ? "true" : "false", pick: () => self.setS("drawStyle", k) }, chip((C.drawStyle || "poly") === k))),
        // #52: a few themes by default; the rest are added from "Thêm Giao Diện" (only what is shown gets drawn)
        groups: (S.thMore ? TGROUPS.map(([label, items2]) => [label, items2.filter(([k]) => TH_DEF.indexOf(k) < 0)]) : [["\u0110ANG D\xD9NG", TGROUPS.reduce((a, g) => a.concat(g[1]), []).filter(([k], i, arr) => (TH_DEF.indexOf(k) >= 0 || thExtra.indexOf(k) >= 0 || k === thTheme) && arr.findIndex((x) => x[0] === k) === i).sort((a, b) => (TH_DEF.indexOf(a[0]) < 0 ? 99 : TH_DEF.indexOf(a[0])) - (TH_DEF.indexOf(b[0]) < 0 ? 99 : TH_DEF.indexOf(b[0])))]]).map(([label, items2]) => ({ label, items: items2.map(([k, l]) => {
          const added = thExtra.indexOf(k) >= 0, isDef = TH_DEF.indexOf(k) >= 0;
          return {
            label: l,
            img: thumbOf(k),
            sw: "#0B2436",
            on: thTheme === k ? "true" : "false",
            badge: S.thMore ? added ? "\u2713 \u0110\xE3 th\xEAm" : "+ Th\xEAm" : isDef ? "" : "B\u1ECF",
            badgeOn: !!(S.thMore || !isDef),
            badgeBg: S.thMore ? added ? "#FBB040" : "rgba(3,17,28,0.85)" : "rgba(120,20,30,0.85)",
            badgeFg: S.thMore && added ? "#2A1A00" : "#FFFFFF",
            ring: thTheme === k ? "inset 0 0 0 3px #FBB040, 0 0 12px rgba(251,176,64,0.5)" : "inset 0 0 0 1px rgba(255,255,255,0.15)",
            pick: () => {
              if (S.thMore) {
                const nx = added ? thExtra.filter((x) => x !== k) : thExtra.concat([k]);
                self.setS("thExtra", nx);
                if (!added) self.toast("\u0110\xE3 th\xEAm " + l + " v\xE0o Giao Di\u1EC7n");
              } else self.save({ set: Object.assign({}, C, { lpTheme: k, homeMap: false }) });
            },
            drop: (e) => {
              if (e && e.stopPropagation) e.stopPropagation();
              if (isDef) return;
              self.setS("thExtra", thExtra.filter((x) => x !== k));
              if (thTheme === k) self.setS("lpTheme", "lp_au");
            }
          };
        }) })),
        more: !!S.thMore,
        moreL: S.thMore ? "\u2713 Xong" : "+ Th\xEAm Giao Di\u1EC7n (" + (TGROUPS.reduce((a, g) => a + g[1].length, 0) - TH_DEF.length) + " ki\u1EC3u)",
        toggleMore: () => self.setState({ thMore: !S.thMore }),
        cockpits: COCKPITS.map(([k, l]) => Object.assign({ label: l, on: (C.cockpit2 || "lowpoly") === k ? "true" : "false", pick: () => self.setS("cockpit2", k) }, chip((C.cockpit2 || "lowpoly") === k))),
        gauges: GAUGES.map(([k, l]) => {
          const on = k === "auto" ? !!C.gaugeAuto : !C.gaugeAuto && C.gaugeManual === k;
          return Object.assign({ label: l, on: on ? "true" : "false", pick: () => k === "auto" ? self.setS("gaugeAuto", true) : self.save({ set: Object.assign({}, C, { gaugeAuto: false, gaugeManual: k }) }) }, chip(on));
        }),
        toggles: [
          ["autoScene", "T\u1EF1 \u0111\u1ED5i c\u1EA3nh theo v\xF9ng", "\u0110i qua th\xE0nh ph\u1ED1, ngo\u1EA1i \xF4, \u0111\u1ED3ng qu\xEA, r\u1EEBng, bi\u1EC3n\u2026 c\u1EA3nh t\u1EF1 \u0111\u1ED5i (c\u1EA3nh Low-Poly)"],
          ["cockpitAuto", "Bu\u1ED3ng l\xE1i theo giao di\u1EC7n", "Outback \u2192 4WD, Rally \u2192 Th\u1EC3 Thao, Synthwave \u2192 Neon\u2026"],
          ["sceneSlow", "C\u1EA3nh ch\u1EA1y r\u1EA5t ch\u1EADm khi xe ch\u1EA1y", "T\u1EAFt = c\u1EA3nh \u0111\u1EE9ng y\xEAn khi xe ch\u1EA1y (\u0111\u1EE1 nh\u1EE9c m\u1EAFt)"],
          ["calm", "D\u1ECBu M\u1EAFt khi xe ch\u1EA1y", "N\u1EC1n t\u1ED1i v\xE0 m\u1EDD h\u01A1n"]
        ].map(([k, l, sub]) => {
          const on = k === "sceneSlow" ? C.sceneMove === "slow" : !!C[k];
          return Object.assign({ label: l, sub, on: on ? "true" : "false", state: on ? "M\u1EDF" : "T\u1EAFt", swBg: on ? "#FBB040" : "#2B4252", knobX: on ? 32 : 4, tick: on ? "\u2713" : "", pick: () => k === "sceneSlow" ? self.setS("sceneMove", on ? "still" : "slow") : self.setS(k, !on) }, chip(on));
        }),
        note: regionTheme ? "\u0110ang t\u1EF1 \u0111\u1ED5i c\u1EA3nh theo v\xF9ng: " + (window.TCScene ? window.TCScene.names(regionTheme) : regionTheme) + ' \xB7 kho\xE1 c\u1EA3nh: t\u1EAFt "T\u1EF1 \u0111\u1ED5i c\u1EA3nh theo v\xF9ng"' : "Ch\u1ECDn l\xE0 \u0111\u1ED5i ngay. Ki\u1EC3u v\u1EBD G\u1ED1c / Low-Poly \xE1p d\u1EE5ng cho m\u1ECDi giao di\u1EC7n; nh\xF3m Low-Poly lu\xF4n v\u1EBD Low-Poly."
      };
      const OB = LV.obd || null;
      const engT = APP ? OB && OB.coolant != null ? Math.round(OB.coolant) + "\xB0" : "--" : "88\xB0";
      const voltT = APP ? OB && OB.volt != null ? OB.volt.toFixed(1) + " V" : "-- V" : "14.1 V";
      const obdHint = APP && !OB && LV.obdSt === "wait" ? "M\u1EDF m\xE1y \u0111\u1EC3 n\u1ED1i OBD" : "";
      const nxS = list[nextIdx];
      const upL = APP && LT && nxS ? "CH\u1EB6NG GH\xC9 K\u1EBE" : "S\u1EAEP T\u1EDAI";
      const upMain = APP && LT && nxS ? nxS.name + " \xB7 " + (nxS.km - pos) + " km" : APP ? street : "Qu\u1EB9o tr\xE1i \xB7 300 m";
      const cp = { next: nxS ? nxS.name : "\u2014", nextSub: nxS ? "c\xF2n " + (nxS.km - pos) + " km \xB7 d\u1EF1 ki\u1EBFn " + fmt(timeAt(nxS.km), inSA(nxS.km)) + (inSA(nxS.km) ? " gi\u1EDD SA" : "") : "", left: TOTAL - pos + " km", eta: fmt(endMin, isGo), rest: restLeft <= 20 ? "Ngh\u1EC9 ch\xE2n sau " + restLeft + " ph\xFAt n\u1EEFa" : "Ngh\u1EC9 sau " + String(C.rest).replace(".", ",") + " gi\u1EDD l\xE1i li\xEAn t\u1EE5c", full: () => tcn("split", "off") };
      const saveWs = () => {
        if (!S.wsSel.length) {
          self.toast("Ch\u1ECDn \xEDt nh\u1EA5t 1 app");
          return;
        }
        const ed = S.wsEdit != null && S.wsList[S.wsEdit];
        const w = { name: (S.wsName || "").trim() || "Workspace " + (S.wsList.length + 1), apps: S.wsSel.slice(), pcts: wsP.slice(), rt: S.rtCheck };
        const list2 = ed ? S.wsList.map((x, k) => k === S.wsEdit ? w : x) : S.wsList.concat([w]);
        self.save({ wsList: list2, createOpen: false, wsName: "", wsSel: [], wsPct: null, wsEdit: null, rtCheck: false });
        self.toast((ed ? "\u0110\xE3 s\u1EEDa Workspace " : "\u0110\xE3 l\u01B0u Workspace ") + w.name);
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
      const addNear = (() => {
        const pts = window.__rtRealPts || (S.tripId && (S.trips || []).find((t) => t.id === S.tripId) || {}).pts;
        return pts && pts.length ? pts[Math.floor(pts.length / 2)] : LV.lat != null ? [LV.lat, LV.lon] : APP ? null : [-37.7466, 144.7326];
      })();
      const addSearch = (q2) => {
        clearTimeout(self.addT);
        if (!NV || (q2 || "").trim().length < 3) {
          self.setState({ addRes: [], addBusy: false });
          return;
        }
        self.setState({ addBusy: true, addMsg: "\u0110ang t\xECm\u2026", addRetry: false });
        self.addT = setTimeout(() => NV.search(q2, addNear, (r, err) => self.setState({ addRes: r || [], addBusy: false, addMsg: err && !(r || []).length ? "M\u1EA1ng ch\u1EADm \u2014 kh\xF4ng t\xECm \u0111\u01B0\u1EE3c" : (r || []).length ? "Ch\u1EA1m m\u1ED9t ch\u1ED7 \u0111\u1EC3 th\xEAm v\xE0o chuy\u1EBFn" : "Kh\xF4ng t\xECm th\u1EA5y \u2014 th\u1EED g\xF5 th\xEAm t\xEAn v\xF9ng (vd Parafield Gardens SA)", addRetry: !!err })), 300);
      };
      const addPick = (p) => {
        if (!p || p.lat == null) return;
        addPlaceStop({ name: p.name, addr: p.sub || p.addr || "", lat: p.lat, lon: p.lon, k: "food" });
        self.setState({ dlg: null, addQ: "", addLink: "", addMsg: "", addRes: [] });
      };
      const addFind = () => {
        if (!APP) {
          self.setState({ dlg: null });
          return;
        }
        const link = (S.addLink || "").trim(), q2 = (S.addQ || "").trim();
        if (!link && !q2) {
          self.setState({ addMsg: "G\xF5 t\xEAn/\u0111\u1ECBa ch\u1EC9 ho\u1EB7c d\xE1n link" });
          return;
        }
        if (!link && (S.addRes || []).length) {
          addPick(S.addRes[0]);
          return;
        }
        if (!link) {
          addSearch(q2);
          return;
        }
        self.setState({ addMsg: "\u0110ang \u0111\u1ECDc link\u2026", addRetry: false });
        let done = false;
        const to = setTimeout(() => {
          if (done) return;
          done = true;
          window.__geoCb = null;
          self.setState({ addMsg: "M\u1EA1ng ch\u1EADm \u2014 kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c link", addRetry: true });
        }, 1e4);
        window.__geoCb = (r) => {
          if (done) return;
          done = true;
          clearTimeout(to);
          if (!r || r.lat == null) {
            self.setState({ addMsg: "Kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c ch\u1ED7 trong link n\xE0y", addRetry: true });
            return;
          }
          addPick({ name: r.name || "Ch\u1ED7 gh\xE9", sub: r.addr || "", lat: r.lat, lon: r.lon });
        };
        tcn("geocode", link);
      };
      const fmtT = (ms) => {
        if (!ms || ms < 0) return "0:00";
        const t = Math.round(ms / 1e3);
        return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
      };
      const silk = (amp, ph2) => {
        let d2 = "M0 40 L0 " + (24 - amp * Math.sin(ph2)).toFixed(1);
        for (let x = 0; x <= 600; x += 25) d2 += " L" + x + " " + (24 - amp * Math.sin(ph2 + x / 200 * 6.2832)).toFixed(1);
        return d2 + " L600 40 Z";
      };
      const JL = window.__jbLook || {};
      const jbBar = C.jbFollow && JL.barColour ? JL.barColour : "#FBB040";
      const jb = {
        posL: fmtT(MD && MD.pos),
        durL: fmtT(MD && MD.dur),
        ring: "#FBB040",
        bg: "linear-gradient(180deg, rgba(40,62,80,0.88), rgba(9,26,38,0.92))",
        w1: silk(8, 0),
        w2: silk(6, 2.1),
        wc1: "#5FD4F0",
        wc2: "#FBB040",
        waveOp: C.vizOn === false ? 0 : drive ? 0.35 : 0.8,
        discCls: playing && !drive ? "disc-on" : "",
        bar: jbBar,
        rec: APP && playing && !!MD && MD.pkg === "com.tomstechsolutions.jukebox" && /radio|trực tiếp|live/i.test((MD.artist || "") + " " + (MD.title || "")),
        recTap: () => {
          if (APP) tcn("media", "jb:" + JSON.stringify({ kind: "record", name: "" }));
        }
      };
      const idleMs = (C.idleMin == null ? 3 : C.idleMin) * 6e4;
      const NV0 = window.NAV, navOn0 = !!(NV0 && NV0.st && (NV0.st.active || NV0.st.route));
      if (navOn0 || (LV.speed || 0) >= 5) self.__busyAt = S.now;
      const idleAuto = C.idleOn && C.idleMin !== 0 && APP && !drive && !navOn0 && !(LV.speed >= 5) && S.scr === "home" && !S.mpOpen && !S.va && S.now - Math.max(S.last || S.now, self.__busyAt || 0) >= idleMs;
      const idlOn = !nar && (S.clkBig || S.idleOn || idleAuto);
      const ist = C.idleClock === "theme" ? { neon: "neon", synth: "neon", cyber: "neon", rally: "led", plane: "led", sgold: "retro", outback: "sign", coast: "sign", melb: "sign", lp_au: "min" }[C.lpTheme] || "min" : C.idleClock || "min";
      const IS = {
        min: { fw: 200, font: "'Overpass',sans-serif", c: "#FFFFFF", ls: "0", glow: "0 2px 12px rgba(0,0,0,0.3)", plate: "transparent", border: "0", pad: "0" },
        neon: { fw: 400, font: "'Chakra Petch',sans-serif", c: "#9FF3FF", ls: "4px", glow: "0 0 18px rgba(63,224,255,0.8)", plate: "transparent", border: "0", pad: "0" },
        led: { fw: 500, font: "'Courier New',monospace", c: "#FF5A3C", ls: "6px", glow: "0 0 10px rgba(255,90,60,0.7)", plate: "rgba(0,0,0,0.75)", border: "2px solid #333", pad: "6px 18px" },
        sign: { fw: 700, font: "'Overpass',sans-serif", c: "#FFFFFF", ls: "2px", glow: "none", plate: "#0B6B3A", border: "4px solid #FFFFFF", pad: "6px 22px" },
        retro: { fw: 400, font: "Georgia,serif", c: "#F3DFAE", ls: "2px", glow: "0 2px 8px rgba(0,0,0,0.5)", plate: "rgba(60,40,20,0.55)", border: "2px solid #C9A86A", pad: "4px 20px" }
      };
      const isS = IS[ist] || IS.min;
      const hA = (d.getHours() % 12 + d.getMinutes() / 60) * 30 * Math.PI / 180, mA = d.getMinutes() * 6 * Math.PI / 180;
      let tk = "";
      for (let i = 0; i < 12; i++) {
        const a = i * 30 * Math.PI / 180, r1 = i % 3 ? 40 : 36;
        tk += "M" + (50 + Math.sin(a) * r1).toFixed(1) + " " + (50 - Math.cos(a) * r1).toFixed(1) + "L" + (50 + Math.sin(a) * 44).toFixed(1) + " " + (50 - Math.cos(a) * 44).toFixed(1);
      }
      const WXH = LV.wx && LV.wx.hourly || [];
      const WXD = LV.wx && LV.wx.daily || [];
      const EMO = { clear: "\u2600", night: "\u263E", cloudy: "\u2601", rain: "\u{1F327}", storm: "\u26C8", fog: "\u{1F32B}" };
      const shift = Math.floor(S.now / 12e4) % 6;
      const IC = {
        clear: [{ d: "M32 20a12 12 0 1 0 0.01 0z", f: "#FFC94A", s: "none", w: 0 }, { d: "M32 6v7M32 51v7M6 32h7M51 32h7M13 13l5 5M46 46l5 5M13 51l5-5M46 18l5-5", f: "none", s: "#FFC94A", w: 4 }],
        night: [{ d: "M40 10a22 22 0 1 0 14 34 18 18 0 0 1-14-34z", f: "#F3EFDC", s: "none", w: 0 }],
        cloudy: [{ d: "M24 13a11 11 0 1 0 0.01 0z", f: "#FFC94A", s: "none", w: 0 }, { d: "M22 46h26a9 9 0 0 0 0-18 13 13 0 0 0-25-2A10 10 0 0 0 22 46z", f: "#FFFFFF", s: "none", w: 0 }],
        rain: [{ d: "M16 34h30a10 10 0 0 0 0-20 14 14 0 0 0-27-3A11 11 0 0 0 16 34z", f: "#FFFFFF", s: "none", w: 0 }, { d: "M22 42l-3 8M33 42l-3 8M44 42l-3 8", f: "none", s: "#7FD0FF", w: 3.5 }],
        storm: [{ d: "M16 32h30a10 10 0 0 0 0-20 14 14 0 0 0-27-3A11 11 0 0 0 16 32z", f: "#D5DCE2", s: "none", w: 0 }, { d: "M34 34l-8 12h8l-5 10", f: "none", s: "#FFE066", w: 3.5 }],
        fog: [{ d: "M10 24h44M6 34h52M12 44h40", f: "none", s: "#E8EEF2", w: 4 }]
      };
      const icKey = (c, h) => {
        const k = c === "cloud" ? "cloudy" : c || "cloudy";
        return k === "clear" && h != null && (h < 6 || h >= 20) ? "night" : k;
      };
      const icOf = (c, h) => {
        const k = c === "cloud" ? "cloudy" : c;
        if (k === "clear" && h != null && (h < 6 || h >= 20)) return IC.night;
        return IC[k] || IC.cloudy;
      };
      const ilay = C.idleLayout || "htc";
      const sunT = window.__sun || null;
      const hm = (t) => {
        if (!t) return "--:--";
        const x = new Date(t);
        return p2(x.getHours()) + ":" + p2(x.getMinutes());
      };
      const nowCode = wk === "night" ? "clear" : wk;
      const futH = WXH.filter((h) => new Date(h.t).getTime() > d.getTime()).slice(0, 5);
      const hrs = [{ t: "B\xE2y gi\u1EDD", code: nowCode, temp: WX ? WX.temp : null, hr: d.getHours() }].concat(futH.map((h) => ({ t: p2(new Date(h.t).getHours()) + "h", code: h.code === "night" ? "clear" : h.code, temp: h.temp, hr: new Date(h.t).getHours(), p: h.rain })));
      const tv = hrs.map((h) => h.temp).filter((v) => v != null);
      const tmin = Math.min.apply(null, tv.length ? tv : [0]), tmax = Math.max.apply(null, tv.length ? tv : [1]);
      const hx = (i) => 40 + i * (570 / Math.max(1, hrs.length - 1)), hyv = (v) => 130 - (v - tmin) / Math.max(1, tmax - tmin) * 50;
      const curve = hrs.map((h, i) => (i ? "L" : "M") + hx(i).toFixed(1) + " " + hyv(h.temp == null ? tmin : h.temp).toFixed(1)).join(" ");
      const days = WXD.slice(0, 5);
      const dlo = Math.min.apply(null, days.map((x) => x.lo).concat([99])), dhi = Math.max.apply(null, days.map((x) => x.hi).concat([-99]));
      const rng = Math.max(1, dhi - dlo);
      const dayName = (x, i) => i === 0 ? "H\xF4m nay" : i === 1 ? "Ng\xE0y mai" : THU[(/* @__PURE__ */ new Date(x.d + "T12:00")).getDay()];
      const minA = (d.getMinutes() + d.getSeconds() / 60) * 6 * Math.PI / 180, hrA = (d.getHours() % 12 + d.getMinutes() / 60) * 30 * Math.PI / 180, secA = d.getSeconds() * 6 * Math.PI / 180;
      const pol = (a, r) => [(100 + Math.sin(a) * r).toFixed(1), (100 - Math.cos(a) * r).toFixed(1)];
      let tk2 = "";
      for (let i = 0; i < 12; i++) {
        const a = i * 30 * Math.PI / 180, r1 = i % 3 ? 82 : 76;
        const p1 = pol(a, r1), p2b = pol(a, 88);
        tk2 += "M" + p1[0] + " " + p1[1] + "L" + p2b[0] + " " + p2b[1];
      }
      const sunArc = (() => {
        if (!sunT) return "M0 0";
        const ang = (t) => {
          const x = new Date(t);
          return (x.getHours() % 12 + x.getMinutes() / 60) * 30 * Math.PI / 180;
        };
        let a1 = ang(sunT.rise), a2 = ang(sunT.set);
        if (a2 <= a1) a2 += Math.PI * 2;
        if (a2 - a1 > Math.PI * 1.95) a2 = a1 + Math.PI * 1.95;
        const s1 = pol(a1, 93), s2 = pol(a2, 93);
        return "M" + s1[0] + " " + s1[1] + " A93 93 0 " + (a2 - a1 > Math.PI ? 1 : 0) + " 1 " + s2[0] + " " + s2[1];
      })();
      const hStr = (C.clock === "12" ? d.getHours() % 12 || 12 : p2(d.getHours())) + "", mStr = p2(d.getMinutes());
      const flipM = self._lastM !== mStr;
      if (flipM) {
        self._lastM = mStr;
        self._flipAt = S.now;
      }
      const flipNow = S.now - (self._flipAt || 0) < 700;
      const idl = {
        on: idlOn,
        close: () => self.setState({ clkBig: false, idleOn: false, last: Date.now(), parkedAt: S.now }),
        bgOp: C.idleWxBg === false ? 0 : 1,
        dark: tod === "night" ? 0.2 : 0.02,
        x: [0, 4, 8, 4, -4, -8][shift],
        y: [0, 3, 6, 3, -3, -6][shift],
        htc: ilay === "htc",
        glass: ilay === "glass",
        days3On: WXD.length > 0,
        analog: ilay === "analog",
        days5On: ilay !== "glass" && WXD.length > 0,
        h: hStr,
        m: mStr,
        flipH: flipNow && mStr === "00" ? "flp" : "",
        flipM: flipNow ? "flp" : "",
        icon: icOf(nowCode, d.getHours()),
        temp: WX ? Math.round(WX.temp) + "\xB0" : "--\xB0",
        desc: WX ? (WXVI[wk] || "") + (WX.rain ? " \xB7 m\u01B0a " + Math.round(WX.rain) + "%" : "") : "\u0110ang l\u1EA5y th\u1EDDi ti\u1EBFt\u2026",
        desc2: WX ? "\u2191" + Math.round(WX.hi) + "\xB0 \u2193" + Math.round(WX.lo) + "\xB0" + (WX.wind != null ? " \xB7 gi\xF3 " + Math.round(WX.wind) + " km/g" : "") + (PL && PL.suburb ? " \xB7 " + PL.suburb : "") : "",
        hilo: WX ? "\u2191" + Math.round(WX.hi) + "\xB0 \u2193" + Math.round(WX.lo) + "\xB0" : "",
        wind: WX && WX.wind != null ? "Gi\xF3 " + Math.round(WX.wind) + " km/g" : "Gi\xF3 --",
        rain: WX ? "M\u01B0a " + Math.round(WX.rain || 0) + "%" : "M\u01B0a --",
        rise: hm(sunT && sunT.rise),
        set: hm(sunT && sunT.set),
        date: THU[d.getDay()] + ", " + p2(d.getDate()) + "/" + p2(d.getMonth() + 1) + "/" + d.getFullYear(),
        sub: [C.clkLunar !== false ? lunTxt : "", sunT ? "L\u1EB7n " + hm(sunT.set) : "", C.idleVN ? "VN " + tzTime(d, "Asia/Ho_Chi_Minh") : ""].filter(Boolean).join(" \xB7 "),
        appt: C.idleAppt !== false && AP && apMin > -15 && apMin < 600 ? "H\u1EB9n " + p2(new Date(AP.start).getHours()) + ":" + p2(new Date(AP.start).getMinutes()) + " \xB7 " + (AP.title || "") : "",
        place: PL && (PL.suburb || PL.street) ? PL.suburb || PL.street : "",
        hourly: C.idleHourly !== false && hrs.length > 1,
        curve: curve || "M0 0",
        curveA: curve ? curve + " L" + hx(hrs.length - 1).toFixed(1) + " 160 L40 160 Z" : "M0 0",
        hours: hrs.map((h, i) => ({ t: h.t, icon: icOf(h.code, h.hr), p: h.p != null ? Math.round(h.p) + "%" : "", x: (20 + hx(i)).toFixed(0), ty: (14 + hyv(h.temp == null ? tmin : h.temp) - 26).toFixed(0), v: h.temp == null ? "--" : Math.round(h.temp) + "\xB0" })),
        days3: days.slice(0, 3).map((x, i) => ({ n: dayName(x, i), icon: icOf(x.code), hi: Math.round(x.hi) + "\xB0", lo: Math.round(x.lo) + "\xB0" })),
        days5: days.map((x, i) => ({ n: dayName(x, i), icon: icOf(x.code), hi: Math.round(x.hi) + "\xB0", lo: Math.round(x.lo) + "\xB0", l: ((x.lo - dlo) / rng * 100).toFixed(0), w: Math.max(6, (x.hi - x.lo) / rng * 100).toFixed(0) })),
        sunArc,
        ticks: tk2,
        hx: pol(hrA, 46)[0],
        hy: pol(hrA, 46)[1],
        mx: pol(minA, 70)[0],
        my: pol(minA, 70)[1],
        sx: pol(secA, 78)[0],
        sy: pol(secA, 78)[1]
      };
      window.__idleOn = idlOn;
      if (idlOn && window.TCIdle) {
        const EN = C.lang === "en";
        const DOWF = EN ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] : ["Ch\xFAa Nh\u1EADt", "Th\u1EE9 Hai", "Th\u1EE9 Ba", "Th\u1EE9 T\u01B0", "Th\u1EE9 N\u0103m", "Th\u1EE9 S\xE1u", "Th\u1EE9 B\u1EA3y"];
        const DOWS = EN ? ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] : ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const WXEN = { clear: "Sunny", night: "Clear", cloudy: "Cloudy", rain: "Rain", storm: "Storm", fog: "Fog" };
        const lunD = lun ? EN ? "Lunar " + lun[0] + "/" + lun[1] + (lun[0] === 15 ? " \xB7 Full moon" : lun[0] === 1 ? lun[1] === 1 ? " \xB7 Lunar New Year" : " \xB7 New moon" : "") : lunTxt : "";
        const angOf = (t) => {
          if (!t) return null;
          const x = new Date(t);
          return (x.getHours() % 12 + x.getMinutes() / 60) * 30;
        };
        const ist2 = { glass: "mini", htc: "htc", analog: "analog" }[ilay] || ilay;
        const dDays = days.map((x, i) => ({ n: i === 0 ? EN ? "Today" : "H\xF4m nay" : DOWS[(/* @__PURE__ */ new Date(x.d + "T12:00")).getDay()].replace(/^(.)(.*)$/, (m, a, b) => EN ? a + b.toLowerCase() : m), code: x.code === "cloud" ? "cloudy" : x.code || "cloudy", hi: Math.round(x.hi), lo: Math.round(x.lo), l: ((x.lo - dlo) / rng * 100).toFixed(0), w: Math.max(6, (x.hi - x.lo) / rng * 100).toFixed(0) }));
        const descE = WX ? (EN ? WXEN : WXVI)[wk] || "" : EN ? "Getting the weather\u2026" : "\u0110ang l\u1EA5y th\u1EDDi ti\u1EBFt\u2026";
        const plName = PL && (PL.suburb || PL.street) || "";
        const idata = {
          style: ist2,
          lang: EN ? "en" : "vi",
          H: hStr.length < 2 ? "0" + hStr : hStr,
          M: mStr,
          H24: d.getHours(),
          sec: d.getSeconds(),
          night: tod === "night",
          date: EN ? DOWF[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()] : DOWF[d.getDay()] + ", " + d.getDate() + "/" + (d.getMonth() + 1),
          dowShort: DOWS[d.getDay()],
          dm: d.getDate() + "/" + (d.getMonth() + 1),
          place: C.idlePlace !== false ? plName : "",
          photoOn: C.idlePhoto === true,
          photoPlace: plName,
          st: PL && PL.state ? PL.state : "VIC",
          code: icKey(nowCode, d.getHours()),
          temp: WX ? Math.round(WX.temp) + "\xB0" : "--\xB0",
          desc: descE,
          descShort: descE.split(" ")[0],
          hilo: WX ? "\u2191" + Math.round(WX.hi) + "\xB0 \u2193" + Math.round(WX.lo) + "\xB0" : "",
          rainP: WX && WX.rain ? (EN ? "rain " : "m\u01B0a ") + Math.round(WX.rain) + "%" : "",
          sub: [C.clkLunar !== false ? lunD : "", C.idleVN ? (EN ? "Vietnam " : "VN ") + tzTime(d, "Asia/Ho_Chi_Minh") : ""].filter(Boolean).join(" \xB7 "),
          sunL: sunT ? (EN ? "Sunrise " : "M\u1ECDc ") + hm(sunT.rise) + (EN ? " \xB7 Sunset " : " \xB7 L\u1EB7n ") + hm(sunT.set) : "",
          riseA: sunT ? angOf(sunT.rise) : null,
          setA: sunT ? angOf(sunT.set) : null,
          appt: C.idleAppt !== false && AP && apMin > -15 && apMin < 600 ? p2(new Date(AP.start).getHours()) + ":" + p2(new Date(AP.start).getMinutes()) + " \xB7 " + (AP.title || "") : "",
          days: dDays,
          batt: LV.batt != null ? (EN ? "Battery " : "Pin ") + LV.batt + "%" : ""
        };
        Object.assign(idata, { shift, bgOp: C.idleWxBg === false ? 0 : 1, dark: tod === "night" ? 0.2 : 0.02, edge: C.idleEdge === true });
        window.__idleClose = () => self.setState({ clkBig: false, idleOn: false, last: Date.now(), parkedAt: S.now });
        try {
          window.TCIdle.paint(idata);
        } catch (e) {
          console.log("idle " + e);
        }
      } else if (window.TCIdle && window.TCIdle.isOn()) window.TCIdle.hide();
      const NV = window.NAV || null;
      const shell = !nar && (S.scr === "home" || S.scr === "trip" || S.scr === "rt");
      if (window.tcLangSync) window.tcLangSync(C.lang === "en" ? "en" : "vi");
      if (NV) {
        NV.cfg.rotate = C.navHeading !== false;
        NV.cfg.cams = C.navCams !== false;
        NV.cfg.histOff = C.tripLog === false;
        NV.cfg.mute = C.navVoice === false;
        NV.cfg.clip = C.vnVoice === "doan" || C.vnVoice === "son";
      }
      const navV = NV && NV.st.route ? NV.navView() : null;
      const navAct = !!(navV && navV.active);
      const arrived = !!(NV && NV.st.arrivedAt && !navAct && Date.now() - NV.st.arrivedAt < 45e3);
      const hereLL = LV.lat != null ? [LV.lat, LV.lon] : APP ? null : [-37.7466, 144.7326];
      const fastNow = (LV.speed || 0) > 10;
      const mapShow = shell && (S.scr !== "home" || C.homeMap !== false || !!navV || fastNow && C.autoMap !== false);
      const sun0 = window.__sun, nowT0 = Date.now();
      const night0 = sun0 && sun0.rise ? !(nowT0 > new Date(sun0.rise).getTime() && nowT0 < new Date(sun0.set).getTime()) : d.getHours() < 6 || d.getHours() >= 19;
      const toWp = (p) => ({ name: p.name, lat: p.lat, lon: p.lon, logo: p.logo || (NV ? NV.logoOf(p.name) : ""), st: p.st || "" });
      const wpList = S.wp || [];
      const planWp = (wp, start) => {
        self.setState({ wp, nq: "", nRes: null, nField: "" });
        if (!NV) return;
        if (!wp.length) {
          NV.cancel();
          return;
        }
        if (!hereLL) {
          self.toast("Ch\u01B0a b\u1EAFt \u0111\u01B0\u1EE3c GPS \u2014 ch\u1EDD ch\xFAt r\u1ED3i b\u1EA5m l\u1EA1i");
          return;
        }
        NV.plan([{ name: "V\u1ECB tr\xED c\u1EE7a Tom", lat: hereLL[0], lon: hereLL[1] }].concat(wp), { name: wp[wp.length - 1].name }).then(() => {
          if (start) NV.start();
        }).catch(() => {
        });
      };
      const kmTo = (p) => hereLL && NV && p && p.lat != null ? NV.fmtDist(NV.dist(hereLL, [p.lat, p.lon])) : "";
      const resRow = (p, pick) => {
        const lg = p.logo || (NV ? NV.logoOf(p.name) : "");
        const pg = !lg && NV && NV.pict ? NV.pict(p.kind || "", p.house || /^\d/.test(p.name || "")) : null;
        const im = lg || (pg ? pg.url : "");
        return { name: p.name, sub: p.sub || "", km: p.km != null ? (p.km < 10 ? String(Math.round(p.km * 10) / 10).replace(".", ",") : Math.round(p.km)) + " km" : kmTo(p), logo: im, logoOn: !!im, icOn: !im, icon: p.icon || "\u{1F4CD}", icBg: lg ? "#FFFFFF" : pg ? pg.bg : "rgba(13,44,64,0.9)", pick };
      };
      const typeIn = (field) => (e) => {
        const q2 = e.target.value;
        const patch = { nq: q2, nField: field };
        if (q2.trim().length < 3) patch.nRes = null;
        if (field === "from") patch.ntFrom = q2, patch.ntFromP = null;
        if (field === "to") patch.ntTo = q2, patch.ntToP = null;
        self.setState(patch);
        if (NV) NV.search(q2, hereLL, (r) => {
          if (self.state.nField === field) self.setState({ nRes: r });
        });
      };
      const resFor = (field, onPick) => S.nField === field && S.nRes ? S.nRes.map((p) => resRow(p, () => onPick(p))) : [];
      const homeP = APP && window.tcHome ? window.tcHome() : APP ? null : { name: "Nh\xE0", lat: -37.7466, lon: 144.7326 };
      const H0 = NV ? NV.hist : { saved: [], trips: [], places: {}, park: null };
      const work = (H0.saved || []).find((s) => s.role === "work");
      const habit = NV && hereLL ? NV.habit(hereLL) : null;
      const MAN = { straight: "M24 42V8M13 19L24 8l11 11", right: "M14 42V25q0-7 7-7h15M28 10l8 8-8 8", left: "M34 42V25q0-7-7-7H12M20 10l-8 8 8 8", "slight right": "M18 42V27L33 12M21 11h13v13", "slight left": "M30 42V27L15 12M27 11H14v13", "sharp right": "M16 6v24l16 10M33 28v13H20", "sharp left": "M32 6v24L16 40M15 28v13h13", uturn: "M32 42V18a8 8 0 0 0-16 0v14M9 25l7 8 7-8", round: "M24 44V32M24 32a9 9 0 1 1 9-9M27 10l7 13-14 2", arrive: "M13 44V6M13 8h22l-5 8 5 8H13" };
      const AV = NV ? NV.cfg.avoid || [] : [];
      const avoidT = (k) => () => {
        const a = AV.indexOf(k) >= 0 ? AV.filter((x) => x !== k) : AV.concat([k]);
        NV.setCfg("avoid", a);
        if (wpList.length && !navAct) planWp(wpList, false);
      };
      const destLL = navV && NV.st.dest ? NV.st.dest : null;
      const extNav = (app) => () => {
        if (!destLL) return;
        tcn("nav", app + ":" + destLL.lat + "," + destLL.lon + "|" + (destLL.name || ""));
      };
      const chips = [];
      if (homeP) chips.push({ l: "\u{1F3E0} Nh\xE0", go: () => planWp([toWp(Object.assign({}, homeP, { name: "Nh\xE0" }))], false) });
      if (work) chips.push({ l: "\u{1F4BC} Ch\u1ED7 l\xE0m", go: () => planWp([toWp(work)], false) });
      if (habit) chips.push({ l: "\u2B50 " + habit.name, go: () => planWp([toWp(habit)], false) });
      if (H0.park) chips.push({ l: "\u{1F17F} Xe \u0111\u1EADu", go: () => NV && NV.flyTo([H0.park.lat, H0.park.lon], 17) });
      const qcKeys = (Array.isArray(C.qcList) && C.qcList.length ? C.qcList : QC_DEF).filter((k) => QC[k]);
      const qcGo = (k) => () => {
        if (S.qc === k) {
          self.setState({ qc: null });
          return;
        }
        self.setState({ qc: k });
        if (!APP || !window.tcFindPlaces) {
          self.toast("B\u1EA3n m\u1EABu: c\u1EA7n app th\u1EADt c\xF3 GPS");
          return;
        }
        window.tcFindPlaces(k, false, { along: navAct && NV ? NV.ahead(40) : null });
      };
      qcKeys.forEach((k) => chips.push({ l: QC[k][0] + " " + QC[k][1], go: qcGo(k), on: S.qc === k }));
      const qcItems = S.qc ? (S.places || {})[S.qc] || [] : [];
      const qcPick = (p) => {
        const w = { name: p.name, lat: p.lat, lon: p.lon, logo: p.logo || "" };
        self.setState({ qc: null });
        if (navAct && NV.st.dest) {
          const d0 = NV.st.dest;
          NV.plan([{ name: "V\u1ECB tr\xED c\u1EE7a Tom", lat: hereLL[0], lon: hereLL[1] }, w, { name: d0.name, lat: d0.lat, lon: d0.lon, logo: d0.logo || "" }], { name: d0.name }).then(() => NV.start()).catch(() => {
          });
          self.toast("\u0110\xE3 th\xEAm \u0111i\u1EC3m d\u1EEBng: " + p.name);
        } else planWp([w], false);
      };
      const qcRows = qcItems.slice(0, 8).map((p) => {
        const pg = NV && NV.pict ? NV.pict(p.kind || "", false) : null;
        const im = p.logo || (pg ? pg.url : "");
        return { name: p.name, sub: [p.addr, p.side].filter(Boolean).join(" \xB7 "), km: String(p.km).replace(".", ",") + " km", open: p.open === true ? "\u0110ang m\u1EDF" : p.open === false ? "\u0110\xE3 \u0111\xF3ng" : "", openC: p.open === false ? "#FF9A9E" : "#7BD88F", img: im, icBg: p.logo ? "#FFFFFF" : pg ? pg.bg : "#1F5FAE", pick: () => qcPick(p) };
      });
      const qcPins = qcItems.slice(0, 12).map((p) => {
        const pg = NV && NV.pict ? NV.pict(p.kind || "", false) : null;
        return { name: p.name, lat: p.lat, lon: p.lon, icon: S.qc ? QC[S.qc][0] : "", logo: p.logo || (pg ? pg.url : ""), raw: p };
      });
      const pnlMin = !!(S.pnlMin || {})[S.scr];
      const ctlTop = navAct && (C.navBanner === "big" || (C.navBanner || "auto") === "auto" && NV.st.toNext != null && NV.st.toNext < 200) ? 214 : navAct ? 160 : S.scr === "home" ? 200 : 138;
      const shortRd = (t) => (t || "").replace(/\bAvenue\b/g, "Ave").replace(/\bBoulevard\b/g, "Blvd").replace(/\bRoad\b/g, "Rd").replace(/\bDrive\b/g, "Dr").replace(/\bStreet\b/g, "St").replace(/\bHighway\b/g, "Hwy").replace(/\bFreeway\b/g, "Fwy").replace(/\bCourt\b/g, "Ct").replace(/\bCrescent\b/g, "Cres").replace(/\bParade\b/g, "Pde").replace(/\bService Road\b/g, "Service Rd");
      const waitGps = !!(APP && navAct && (!LV.fresh || Date.now() - (NV && NV.st.fixAt || 0) > 8e3));
      const nearTurn = !!(navAct && NV.st.toNext != null && NV.st.toNext < 200);
      const bnSize = C.navBanner === "big" ? "big" : C.navBanner === "hide" ? nearTurn ? "mini" : "tiny" : nearTurn ? "big" : "mini";
      const etaOpen = !!S.etaOpen;
      const nv = {
        mapOn: mapShow,
        boxOn: shell && S.scr === "home" && !navAct && !arrived && mapShow,
        q: S.nField === "go" ? S.nq || "" : "",
        qOn: S.nField === "go" && !!S.nq,
        lock: kbLk,
        ph: kbLk ? '\u0110\u1EADu xe r\u1ED3i g\xF5 \u2014 ho\u1EB7c n\xF3i "Hey Tom, \u0111i t\u1EDBi\u2026"' : "\u0110i \u0111\xE2u? G\xF5 t\xEAn ch\u1ED7 ho\u1EB7c \u0111\u1ECBa ch\u1EC9",
        typeGo: typeIn("go"),
        clearQ: () => self.setState({ nq: "", nRes: null }),
        goFirst: () => {
          const r = S.nField === "go" && S.nRes && S.nRes[0];
          if (r) planWp([toWp(r)], true);
          else if (navV) NV.start();
          else self.toast("G\xF5 ch\u1ED7 mu\u1ED1n t\u1EDBi tr\u01B0\u1EDBc nha");
        },
        res: resFor("go", (p) => planWp([toWp(p)], false)),
        resOn: S.nField === "go" && !!(S.nRes && S.nRes.length) && S.scr === "home",
        micGo: () => {
          self.setState({ va: true, vaHeard: "", vaHint: "N\xF3i t\xEAn ch\u1ED7 ho\u1EB7c \u0111\u1ECBa ch\u1EC9\u2026 v\xED d\u1EE5 \u201C\u0111i t\u1EDBi Bunnings Sunshine\u201D" });
          tcn("voice", "start");
        },
        qcOn: shell && !!S.qc && (S.scr === "home" || navAct),
        qcRows,
        qcEmpty: !!S.qc && !qcRows.length,
        qcMsg: S.placesBusy ? S.placesMsg || "\u0110ang t\xECm\u2026" : qcRows.length ? navAct ? "D\u1ECDc \u0111\u01B0\u1EDDng \u0111i \xB7 ch\u1EA1m \u0111\u1EC3 th\xEAm \u0111i\u1EC3m d\u1EEBng" : S.placesMsg || "" : S.placesMsg || "Kh\xF4ng th\u1EA5y ch\u1ED7 n\xE0o",
        qcTitle: S.qc && QC[S.qc] ? QC[S.qc][0] + " " + QC[S.qc][1] : "",
        qcClose: () => self.setState({ qc: null }),
        navChips: qcKeys.slice(0, 6).map((k) => ({ l: QC[k][0], a: QC[k][1] + " d\u1ECDc \u0111\u01B0\u1EDDng", go: qcGo(k), on: S.qc === k })),
        navChipsOn: shell && navAct && mapShow,
        chips,
        chipsOn: shell && S.scr === "home" && !navAct && !navV && !arrived && mapShow && !(S.nField === "go" && S.nRes && S.nRes.length),
        bannerOn: shell && navAct && mapShow && !waitGps && bnSize === "big",
        bnMini: shell && navAct && mapShow && !waitGps && bnSize === "mini",
        bnTiny: shell && navAct && mapShow && !waitGps && bnSize === "tiny",
        waitGps: shell && navAct && mapShow && waitGps,
        bnTap: () => self.setS("navBanner", C.navBanner === "big" ? "hide" : C.navBanner === "hide" ? "auto" : "big"),
        shortText: navV ? shortRd(navV.text) : "",
        thenShort: navV && navV.then ? shortRd(navV.then).replace(/^(Rẽ|Chếch|Giữ|Đi|Ra|Vô)[^ ]* [^ ]* (vô |theo )?/, "") : "",
        bar: navV && NV.st.toNext != null ? Math.max(4, Math.min(100, 100 - NV.st.toNext / 2)) : 0,
        thenIcoD: navV ? MAN[navV.thenIco] || "" : "",
        thenIcoOn: !!(navV && navV.then),
        icoD: navV ? MAN[navV.ico] || MAN.straight : "",
        dist: navV ? navV.dist : "",
        text: navV ? navV.text : "",
        thenOn: !!(navV && navV.then),
        then: navV ? navV.then : "",
        thenDist: navV ? navV.thenDist : "",
        prevOn: shell && !!navV && !navAct && !arrived && mapShow,
        dest: navV ? navV.dest : "",
        destLogo: navV ? navV.destLogo : "",
        destLogoOn: !!(navV && navV.destLogo),
        destIcOn: !(navV && navV.destLogo),
        sum: navV ? navV.left + " \xB7 " + navV.km + " \xB7 t\u1EDBi " + navV.eta : "",
        alts: navV ? navV.alts.map((a) => ({ label: a.label, info: a.min + " \xB7 " + a.km, toll: a.toll ? "\u{1F4B2} thu ph\xED" : "", on: a.on ? "true" : "false", bg: a.on ? "rgba(47,208,245,0.18)" : "rgba(255,255,255,0.04)", ring: a.on ? "inset 0 0 0 2px #2FD0F5" : "inset 0 0 0 1px rgba(255,255,255,0.12)", pick: a.pick })) : [],
        avoid: [["toll", "Tr\xE1nh thu ph\xED"], ["motorway", "Tr\xE1nh cao t\u1ED1c"], ["ferry", "Tr\xE1nh ph\xE0"]].map(([k, l]) => {
          const on = AV.indexOf(k) >= 0;
          return { l: (on ? "\u2713 " : "") + l, on: on ? "true" : "false", bg: on ? "rgba(123,216,143,0.2)" : "rgba(255,255,255,0.05)", fg: on ? "#7BD88F" : "#CFE6EE", tap: avoidT(k) };
        }),
        tollOn: !!(navV && navV.tolls.length),
        tollL: navV && navV.tolls.length ? "\u26A0 C\xF3 \u0111o\u1EA1n thu ph\xED: " + navV.tolls.slice(0, 2).join(", ") + (navV.noEx ? " (kh\xF4ng n\xE9 \u0111\u01B0\u1EE3c h\u1EBFt)" : "") : "",
        msg: navV ? navV.planning ? "\u0110ang t\xECm \u0111\u01B0\u1EDDng\u2026" : navV.err || "" : "",
        msgOn: !!(navV && (navV.planning || navV.err)),
        start: () => NV && NV.start(),
        cancel: () => {
          self.setState({ wp: [] });
          NV && NV.cancel();
        },
        gmaps: extNav("gmaps"),
        waze: extNav("waze"),
        etaOn: shell && navAct && mapShow && etaOpen,
        etaMini: shell && navAct && mapShow && !etaOpen,
        etaTap: () => self.setState({ etaOpen: !etaOpen }),
        eta: navV ? navV.eta : "",
        left: navV ? navV.left : "",
        km: navV ? navV.km : "",
        voiceIc: C.navVoice === false ? "\u{1F507}" : "\u{1F50A}",
        voiceA: C.navVoice === false ? "B\u1EADt \u0111\u1ECDc ch\u1EC9 \u0111\u01B0\u1EDDng" : "T\u1EAFt \u0111\u1ECDc ch\u1EC9 \u0111\u01B0\u1EDDng",
        voice: () => self.setS("navVoice", C.navVoice === false),
        share: () => {
          if (!navV) return;
          tcn("share", "Tom \u0111ang tr\xEAn \u0111\u01B0\u1EDDng t\u1EDBi " + navV.dest + ", d\u1EF1 ki\u1EBFn t\u1EDBi l\xFAc " + navV.eta + " (c\xF2n " + navV.left + ").");
        },
        stop: () => {
          self.setState({ wp: [] });
          NV && NV.stop();
        },
        arrivedOn: shell && arrived && mapShow,
        arrivedL: "\u{1F3C1} \u0110\xE3 t\u1EDBi " + (NV && NV.st.dest ? NV.st.dest.name : "n\u01A1i"),
        done: () => {
          self.setState({ wp: [] });
          NV && NV.cancel();
        },
        ctlOn: shell && mapShow,
        ctlTop,
        zin: () => NV && NV.zoomIn(),
        zout: () => NV && NV.zoomOut(),
        loc: () => NV && NV.locate(),
        locC: NV && NV.following() ? "#FBB040" : "#CFF6FF",
        fit: () => NV && NV.fitAll(),
        fitOn: !!navV || S.scr === "rt" || !!(NV && NV.st.preview),
        rotOn: navAct,
        rotL: C.navHeading !== false ? "\u{1F9ED}" : "N",
        rotA: C.navHeading !== false ? "B\u1EA3n \u0111\u1ED3 theo h\u01B0\u1EDBng xe \u2014 b\u1EA5m \u0111\u1EC3 v\u1EC1 H\u01B0\u1EDBng B\u1EAFc" : "B\u1EA3n \u0111\u1ED3 H\u01B0\u1EDBng B\u1EAFc \u2014 b\u1EA5m \u0111\u1EC3 theo h\u01B0\u1EDBng xe",
        lyOpen: !!S.lyOpen,
        lyTap: () => self.setState({ lyOpen: !S.lyOpen }),
        lyName: { auto: "T\u1EF1 \u0110\u1ED9ng", dark: "T\u1ED1i", light: "S\xE1ng", topo: "\u0110\u1ECBa H\xECnh", sat: "V\u1EC7 Tinh" }[C.mapStyle || "auto"],
        lyOpts: [["auto", "\u{1F317}", "T\u1EF1 \u0110\u1ED9ng"], ["dark", "\u{1F319}", "T\u1ED1i"], ["light", "\u2600\uFE0F", "S\xE1ng"], ["topo", "\u26F0\uFE0F", "\u0110\u1ECBa H\xECnh"], ["sat", "\u{1F6F0}\uFE0F", "V\u1EC7 Tinh"]].map(([k, ic, label]) => {
          const on = (C.mapStyle || "auto") === k;
          return { ic, label, on, fg: on ? "#0A1A24" : "#E8F1F5", bg: on ? "#FBB040" : "rgba(255,255,255,0.06)", pick: () => {
            self.setS("mapStyle", k);
            self.setState({ lyOpen: false });
          } };
        }),
        rot: () => self.setS("navHeading", C.navHeading === false),
        compass: () => {
          if (NV) NV.compass();
        },
        followOff: shell && mapShow && NV && !NV.following() && (navAct || drive),
        refollowL: "B\u1EA3n \u0111\u1ED3 s\u1EBD t\u1EF1 theo xe sau 10 gi\xE2y"
      };
      const unread0 = APP ? (S.msgs || []).reduce((a, m) => a + (m[5] || 0), 0) + (LV.missed || 0) : 3;
      const tabGo = (scr) => () => self.setState({ scr, dlg: null, nq: "", nRes: null, nField: "", ntOpen: scr === "rt" ? S.ntOpen : false });
      const tabs = [["home", "M\xE0n H\xECnh Ch\xEDnh"], ["trip", "\u27A4 H\xE0nh Tr\xECnh"], ["rt", "\u{1F5FA} Road Trip"], ["contacts", "Li\xEAn L\u1EA1c"], ["search", "T\xECm Ch\u1ED7"]].map(([k, l]) => {
        const on = S.scr === k;
        return { label: l, on: on ? "true" : "false", bg: on ? "#FBB040" : "rgba(8,22,34,0.62)", fg: on ? "#2A1A00" : "#FFFFFF", ring: on ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.22)", cls: on ? "" : "glt", badge: unread0, badgeOn: k === "contacts" && unread0 > 0, go: k === "contacts" ? () => {
          tabGo("contacts")();
          if (APP) {
            tcn("calllog");
            tcn("msgs");
          }
        } : tabGo(k) };
      });
      const togglePnl = () => self.setState({ pnlMin: Object.assign({}, S.pnlMin || {}, { [S.scr]: !pnlMin }) });
      const dowS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      const hjTab = S.hjTab || "saved";
      const placeRow = (p, act, actL, actA) => Object.assign(resRow(Object.assign({}, p, { km: null, sub: p.sub || "" }), () => planWp([toWp(p)], false)), { sub: kmTo(p), go: () => planWp([toWp(p)], true), act: act || (() => {
      }), actL: actL || "", actOn: !!act, actA: actA || "", addStop: () => planWp(wpList.concat([toWp(p)]), false) });
      let hjRows = [];
      if (hjTab === "saved") {
        if (homeP) hjRows.push(placeRow(Object.assign({}, homeP, { name: "Nh\xE0", icon: "\u{1F3E0}" })));
        (H0.saved || []).forEach((s, i) => hjRows.push(placeRow(Object.assign({ icon: s.icon || "\u2B50" }, s), () => NV.unstar(i), "\u2715", "B\u1ECF l\u01B0u " + s.name)));
      } else if (hjTab === "freq") {
        hjRows = (NV ? NV.frequent() : []).map((p) => placeRow(Object.assign({ icon: "\u{1F4CD}" }, p), () => NV.star(p), "\u2B50", "L\u01B0u " + p.name));
      } else if (hjTab === "recent") {
        hjRows = (NV ? NV.recent() : []).map((p) => placeRow(Object.assign({ icon: "\u{1F558}" }, p), () => NV.star(p), "\u2B50", "L\u01B0u " + p.name));
      }
      const logRows = hjTab === "log" ? (H0.trips || []).slice(0, 60).map((t) => {
        const a = new Date(t.t0);
        return { when: dowS[a.getDay()] + " " + a.getDate() + "/" + (a.getMonth() + 1) + " \xB7 " + a.getHours() + ":" + p2(a.getMinutes()), name: (t.from.name || "?") + " \u2192 " + (t.to.name || "?"), km: String(t.km).replace(".", ",") + " km \xB7 " + Math.max(1, Math.round((t.t1 - t.t0) / 6e4)) + " ph", on: NV && NV.st.preview === t ? "true" : "false", bg: NV && NV.st.preview === t ? "rgba(47,208,245,0.16)" : "rgba(255,255,255,0.04)", show: () => NV && NV.showTrail(NV.st.preview === t ? null : t), del: () => NV && NV.delTrip(t.t0) };
      }) : [];
      const moveWp = (i, dir) => () => {
        const a = wpList.slice(), j = i + dir;
        if (j < 0 || j >= a.length) return;
        const t = a[i];
        a[i] = a[j];
        a[j] = t;
        planWp(a, false);
      };
      const tidyWp = () => {
        if (wpList.length < 3 || !hereLL) return;
        const last = wpList[wpList.length - 1], rest = wpList.slice(0, -1), out = [];
        let cur = hereLL;
        while (rest.length) {
          let bi = 0, bd = 1e12;
          rest.forEach((w2, i) => {
            const dd = NV.dist(cur, [w2.lat, w2.lon]);
            if (dd < bd) {
              bd = dd;
              bi = i;
            }
          });
          const w = rest.splice(bi, 1)[0];
          out.push(w);
          cur = [w.lat, w.lon];
        }
        out.push(last);
        planWp(out, false);
        self.toast("\u0110\xE3 s\u1EAFp x\u1EBFp c\xE1c \u0111i\u1EC3m d\u1EEBng cho g\u1ECDn \u0111\u01B0\u1EDDng");
      };
      const parkAgo = H0.park ? Math.max(0, Math.round((Date.now() - H0.park.t) / 6e4)) : 0;
      const hj = {
        on: shell && S.scr === "trip" && !pnlMin,
        min: shell && S.scr === "trip" && pnlMin,
        toggle: togglePnl,
        habitOn: !!habit && !navV,
        habitL: habit ? "Gi\u1EDD n\xE0y Tom hay \u0111i " + habit.name : "",
        habitGo: () => habit && planWp([toWp(habit)], true),
        parkOn: !!H0.park && !drive,
        parkL: H0.park ? "Xe \u0111\u1EADu \u1EDF " + (H0.park.name || "\u0111\xE2y") + " \xB7 " + (parkAgo < 60 ? parkAgo + " ph\xFAt tr\u01B0\u1EDBc" : Math.floor(parkAgo / 60) + " gi\u1EDD tr\u01B0\u1EDBc") : "",
        parkSee: () => H0.park && NV.flyTo([H0.park.lat, H0.park.lon], 17),
        parkR: H0.park && H0.park.until ? "\u23F0 Nh\u1EAFc l\xFAc " + NV.hhmm(H0.park.until - 6e5) : "",
        parkRemind: [[60, "1P"], [120, "2P"], [240, "4P"]].map(([m, l]) => ({ l, on: H0.park && H0.park.limit === m ? "true" : "false", bg: H0.park && H0.park.limit === m ? "#FBB040" : "rgba(255,255,255,0.06)", fg: H0.park && H0.park.limit === m ? "#2A1A00" : "#CFE6EE", tap: () => NV.parkRemind(m) })),
        wps: wpList.map((w, i) => {
          const last = i === wpList.length - 1;
          return { n: last ? "\u2691" : String(i + 1), bg: last ? "#D0202E" : "#F28A1A", name: w.name, logo: w.logo || "", logoOn: !!w.logo, up: moveWp(i, -1), down: moveWp(i, 1), del: () => planWp(wpList.filter((_, k) => k !== i), false), upOp: i === 0 ? 0.35 : 1, downOp: last ? 0.35 : 1 };
        }),
        wpOn: wpList.length > 0,
        tidyOn: wpList.length >= 3,
        tidy: tidyWp,
        q: S.nField === "hj" ? S.nq || "" : "",
        ph: kbLk ? "\u0110\u1EADu xe r\u1ED3i g\xF5 nha" : wpList.length ? "+ Th\xEAm \u0111i\u1EC3m d\u1EEBng" : "\u0110i \u0111\xE2u? G\xF5 t\xEAn ch\u1ED7 ho\u1EB7c \u0111\u1ECBa ch\u1EC9",
        type: typeIn("hj"),
        lock: kbLk,
        res: resFor("hj", (p) => planWp(wpList.concat([toWp(p)]), false)),
        resOn: S.nField === "hj" && !!(S.nRes && S.nRes.length),
        tabs: [["saved", "\u0110\xE3 L\u01B0u"], ["freq", "Hay \u0110i"], ["recent", "G\u1EA7n \u0110\xE2y"], ["log", "Nh\u1EADt K\xFD"]].map(([k, l]) => {
          const on = hjTab === k;
          return { l, on: on ? "true" : "false", bg: on ? "#FBB040" : "rgba(255,255,255,0.06)", fg: on ? "#2A1A00" : "#CFE6EE", tap: () => self.setState({ hjTab: k }) };
        }),
        rows: hjRows,
        rowsOn: hjTab !== "log" && hjRows.length > 0,
        logOn: hjTab === "log",
        logRows,
        logAny: logRows.length > 0,
        empty: hjTab === "log" ? C.tripLog === false ? "Nh\u1EADt k\xFD \u0111ang t\u1EAFt." : "Ch\u01B0a c\xF3 chuy\u1EBFn n\xE0o \u2014 ch\u1EA1y xe r\u1ED3i \u0111\u1EADu h\u01A1n 3 ph\xFAt l\xE0 app t\u1EF1 ghi." : hjTab === "saved" ? "Ch\u01B0a l\u01B0u ch\u1ED7 n\xE0o \u2014 b\u1EA5m \u2B50 \u1EDF Hay \u0110i / G\u1EA7n \u0110\xE2y \u0111\u1EC3 l\u01B0u." : hjTab === "freq" ? "Ch\u1EA1y v\xE0i b\u1EEFa l\xE0 app bi\u1EBFt Tom hay \u0111i \u0111\xE2u." : "Ch\u01B0a c\xF3 ch\u1ED7 n\xE0o trong 8 ng\xE0y qua.",
        emptyOn: hjTab === "log" ? !logRows.length : !hjRows.length,
        logToggle: () => self.setS("tripLog", C.tripLog === false),
        logOnL: C.tripLog === false ? "B\u1EADt ghi nh\u1EADt k\xFD" : "T\u1EAFt ghi nh\u1EADt k\xFD",
        clear: () => {
          if (S.hjClear) {
            NV && NV.clearHist();
            self.setState({ hjClear: false });
            self.toast("\u0110\xE3 xo\xE1 h\u1EBFt nh\u1EADt k\xFD, ch\u1ED7 hay \u0111i v\xE0 g\u1EA7n \u0111\xE2y");
          } else {
            self.setState({ hjClear: true });
            self.toast('B\u1EA5m "Xo\xE1 H\u1EBFt" l\u1EA7n n\u1EEFa \u0111\u1EC3 xo\xE1 th\u1EADt');
          }
        },
        clearL: S.hjClear ? "Xo\xE1 th\u1EADt?" : "Xo\xE1 H\u1EBFt",
        workSet: () => {
          if (!hereLL) return;
          NV.setWork({ name: LV.place && (LV.place.street || LV.place.suburb) || "Ch\u1ED7 l\xE0m", lat: hereLL[0], lon: hereLL[1] });
        },
        workOn: !work && hjTab === "saved"
      };
      const rtStartP = SP ? SP : null;
      const fromRows = S.nField === "from" ? [{ name: "\u{1F4CD} V\u1ECB tr\xED hi\u1EC7n t\u1EA1i", sub: LV.place && LV.place.suburb || "", icon: "\u{1F4CD}", cur: true }].concat(homeP ? [{ name: "\u{1F3E0} Nh\xE0", sub: homeP.name, icon: "\u{1F3E0}", home: true }] : []).map((r) => Object.assign(resRow({ name: r.name, sub: r.sub, icon: r.icon, km: null }, () => {
        const P = r.home ? { name: "Nh\xE0", lat: homeP.lat, lon: homeP.lon, st: "" } : hereLL ? { name: LV.place && LV.place.suburb || "V\u1ECB tr\xED c\u1EE7a Tom", lat: hereLL[0], lon: hereLL[1], st: "" } : null;
        if (!P) {
          self.toast("Ch\u01B0a b\u1EAFt \u0111\u01B0\u1EE3c GPS");
          return;
        }
        const nm2 = S.ntNameTouched ? S.ntName : P.name + (S.ntToP ? " - " + S.ntToP.name : "");
        self.setState({ ntFromP: P, ntFrom: r.home ? "Nh\xE0" : P.name, nRes: null, nField: "", ntName: nm2 });
      }), { logoOn: false, icOn: true, logo: "", km: "" })) : [];
      const shortN = (n) => (n || "").split(",")[0].trim();
      const pickFrom = (p) => {
        const nm2 = S.ntNameTouched ? S.ntName : shortN(p.name) + (S.ntToP ? " - " + shortN(S.ntToP.name) : "");
        self.setState({ ntFromP: toWp(p), ntFrom: p.name, nRes: null, nField: "", nq: "", ntName: nm2 });
      };
      const pickTo = (p) => {
        const fromN = S.ntFromP ? shortN(S.ntFromP.name) : (S.ntFrom || "").trim() || (homeP ? "Nh\xE0" : LV.place && LV.place.suburb || "V\u1ECB tr\xED c\u1EE7a Tom");
        self.setState({ ntToP: toWp(p), ntTo: p.name, nRes: null, nField: "", nq: "", ntName: S.ntNameTouched ? S.ntName : fromN + " - " + shortN(p.name) });
      };
      const nxS2 = nextIdx >= 0 ? list[nextIdx] : null;
      const nxLL0 = nxS2 ? nxS2.id === "end" ? TRIP ? isGo ? TRIP.to : TRIP.from : isGo ? { lat: -34.9285, lon: 138.6007 } : SP || { lat: -37.8136, lon: 144.9631 } : nxS2 : null;
      const nxLL = nxLL0 && nxLL0.lat == null && NV && NV.stopLL ? NV.stopLL(nxS2.addr || ADDR[nxS2.name] || nxS2.name + (nxS2.town ? ", " + nxS2.town : "")) || nxLL0 : nxLL0;
      const OD0 = LV.odo || { a: S.demoA != null ? S.demoA : 128.4, b: pos };
      const offKey = "tc-off-" + S.tripId;
      const offDone = (() => {
        try {
          return localStorage.getItem(offKey);
        } catch (e) {
          return null;
        }
      })();
      const rtp = {
        on: shell && S.scr === "rt" && !pnlMin,
        min: shell && S.scr === "rt" && pnlMin,
        toggle: togglePnl,
        title: rt.title,
        legs: rt.legs,
        openTrips: rt.openTrips,
        newTrip: () => self.setState({ ntOpen: !S.ntOpen, ntMsg: "", nField: "", nRes: null }),
        newL: S.ntOpen ? "\u2715 \u0110\xF3ng" : "+ Chuy\u1EBFn M\u1EDBi",
        formOn: !!S.ntOpen,
        from: S.ntFrom || "",
        fromPh: tp.fromPh,
        to: S.ntTo || "",
        typeFrom: typeIn("from"),
        typeTo: typeIn("to"),
        focusFrom: () => {
          if (S.nField !== "from") self.setState({ nField: "from", nRes: null });
        },
        resFrom: fromRows.concat(resFor("from", pickFrom)),
        resFromOn: S.nField === "from",
        resTo: resFor("to", pickTo),
        resToOn: S.nField === "to" && !!(S.nRes && S.nRes.length),
        name: S.ntName || "",
        namePh: "T\xEAn chuy\u1EBFn (t\u1EF1 \u0111\u1EB7t theo n\u01A1i \u0111i - n\u01A1i t\u1EDBi)",
        setName: (e) => self.setState({ ntName: e.target.value, ntNameTouched: true }),
        create: () => {
          if (drive || S.ntBusy) return;
          const f = S.ntFromP || (S.ntFrom || "").trim() || (window.tcStartPt ? window.tcStartPt() : null) || "Melbourne", t2 = S.ntToP || (S.ntTo || "").trim();
          if (!t2) {
            self.setState({ ntMsg: "G\xF5 n\u01A1i t\u1EDBi tr\u01B0\u1EDBc nha" });
            return;
          }
          if (!APP || !window.tcPlanTrip) {
            self.setState({ ntMsg: "B\u1EA3n m\u1EABu: t\u1EA1o chuy\u1EBFn c\u1EA7n app th\u1EADt (c\xF3 m\u1EA1ng)" });
            return;
          }
          self.setState({ ntBusy: true });
          window.tcPlanTrip(f, t2, { name: (S.ntName || "").trim() }).then((trip) => {
            const trips = (self.state.trips || []).concat([trip]);
            self.save({ trips, ntBusy: false, ntFrom: "", ntTo: "", ntFromP: null, ntToP: null, ntName: "", ntNameTouched: false, ntOpen: false });
            setTimeout(() => {
              self.switchTripExt && self.switchTripExt(trip.id);
              NV && setTimeout(NV.fitAll, 400);
            }, 60);
            self.toast("\u0110\xE3 t\u1EA1o chuy\u1EBFn " + trip.name + " \xB7 " + trip.km + " km");
          }).catch(() => self.setState({ ntBusy: false }));
        },
        mainOn: !S.ntOpen,
        busy: !!S.ntBusy,
        createL: S.ntBusy ? "\u0110ang t\u1EA1o\u2026" : "T\u1EA1o Chuy\u1EBFn",
        msg: S.ntMsg || "",
        lockL: drive ? "Xe \u0111ang ch\u1EA1y \u2014 \u0111\u1EADu xe r\u1ED3i m\u1EDBi t\u1EA1o chuy\u1EBFn m\u1EDBi" : "",
        lock: kbLk,
        boxes: rt.boxes,
        stops: rt.stops,
        count: list.length,
        pct: Math.round(pos / TOTAL * 100),
        pctL: Math.round(pos / TOTAL * 100) + "% \xB7 " + pos + "/" + TOTAL + " km",
        nx: od.nx,
        nxKm: od.nxKm,
        a: (Math.round((+OD0.a || 0) * 10) / 10).toString().replace(".", ","),
        b: (Math.round((+OD0.b || 0) * 10) / 10).toString().replace(".", ","),
        resetA: od.resetA,
        resetB: od.resetB,
        openLog: od.openLog,
        startL: navAct ? "D\u1EEBng Ch\u1EC9 \u0110\u01B0\u1EDDng" : nxS2 ? "B\u1EAFt \u0110\u1EA7u \xB7 t\u1EDBi " + od.nx : "B\u1EAFt \u0110\u1EA7u",
        startBg: navAct ? "#E5484D" : "#FBB040",
        startFg: navAct ? "#FFFFFF" : "#2A1A00",
        start: () => {
          if (navAct) {
            NV.stop();
            return;
          }
          if (!nxLL || nxLL.lat == null) {
            self.toast("Ch\u1EB7ng k\u1EBF ch\u01B0a c\xF3 to\u1EA1 \u0111\u1ED9");
            return;
          }
          self.setState({ tripStarted: true });
          planWp([toWp({ name: od.nx.replace(/^🏁 /, ""), lat: nxLL.lat, lon: nxLL.lon })], true);
        },
        offL: offDone ? "\u2713 B\u1EA3n \u0111\u1ED3 offline \u0111\xE3 t\u1EA3i" : S.offProg ? "\u0110ang t\u1EA3i " + S.offProg : "\u2B07 T\u1EA3i b\u1EA3n \u0111\u1ED3 offline",
        off: () => {
          if (S.offProg || !NV) return;
          const pts = TRIP ? TRIP.pts : window.__rtRealPts || window.__routePts;
          if (!pts || pts.length < 2) {
            self.toast("Ch\u01B0a c\xF3 tuy\u1EBFn \u0111\u01B0\u1EDDng \u0111\u1EC3 t\u1EA3i");
            return;
          }
          const n = NV.tileList(pts).length * 2, mb = Math.max(1, Math.round(n * 18 / 1024));
          if (S.offAsk !== S.tripId) {
            self.setState({ offAsk: S.tripId });
            self.toast("T\u1EA3i kho\u1EA3ng " + mb + " MB b\u1EA3n \u0111\u1ED3 d\u1ECDc \u0111\u01B0\u1EDDng (n\xEAn d\xF9ng Wi-Fi) \u2014 b\u1EA5m l\u1EA7n n\u1EEFa \u0111\u1EC3 t\u1EA3i");
            return;
          }
          self.setState({ offAsk: null, offProg: "0%" });
          NV.prefetch(pts, (dn, tot) => self.setState({ offProg: Math.round(dn / tot * 100) + "%" })).then((r) => {
            try {
              localStorage.setItem(offKey, String(Date.now()));
            } catch (e) {
            }
            self.setState({ offProg: null });
            self.toast(r.bad ? "\u0110\xE3 t\u1EA3i b\u1EA3n \u0111\u1ED3 offline (" + r.bad + " m\u1EA3nh l\u1ED7i)" : "\u0110\xE3 t\u1EA3i xong b\u1EA3n \u0111\u1ED3 offline cho chuy\u1EBFn n\xE0y");
          });
        },
        addStop: () => self.setState({ dlg: "add" }),
        pickStop: () => self.setState({ dlg: "pick" }),
        routeNote: !TRIP && !window.__rtRealPts ? "\u0110ang l\u1EA5y \u0111\u01B0\u1EDDng th\u1EADt t\u1EEB " + (SP ? SP.name : "Melbourne") + " t\u1EDBi Adelaide\u2026" : ""
      };
      if (APP && NV && !TRIP && S.scr === "rt") {
        const st0 = SP || { lat: -37.8136, lon: 144.9631 };
        const rk = st0.lat.toFixed(3) + "," + st0.lon.toFixed(3);
        if (window.__rtRealKey !== rk) {
          window.__rtRealKey = rk;
          window.__rtRealPts = null;
          NV.realRoute([st0.lat, st0.lon], [-34.9285, 138.6007]).then((v) => {
            if (v && v.pts) {
              window.__rtRealPts = v.pts;
              self.setState({ navAt: Date.now() });
            }
          });
        }
      }
      if (NV) {
        const rtPts = TRIP ? TRIP.pts : window.__rtRealPts || window.__routePts || null;
        const rtStops = [Object.assign({ id: "", start: true, short: isGo ? FROM : TO }, rtStartP && isGo ? { lat: rtStartP.lat, lon: rtStartP.lon } : TRIP ? isGo ? TRIP.from : TRIP.to : {})].concat(list.map((x, i) => {
          const endLL = x.id === "end" ? TRIP ? isGo ? TRIP.to : TRIP.from : isGo ? { lat: -34.9285, lon: 138.6007 } : SP || { lat: -37.8136, lon: 144.9631 } : x;
          return { id: x.id, n: i + 1, end: x.id === "end", next: i === nextIdx && x.id !== "end", short: x.id === "end" ? SP && !isGo ? SP.name : x.name : (x.name || "").split(" (")[0], logo: NV.logoOf(x.name), lat: endLL.lat, lon: endLL.lon, q: endLL.lat == null ? x.addr || ADDR[x.name] || x.name + (x.town ? ", " + x.town : "") : null, frac: TOTAL ? x.km / TOTAL : null, rev: !isGo };
        }));
        const vis = S.scr === "rt" && rtPts;
        NV.onPlaceClick = null;
        NV.sync({
          show: mapShow,
          night: night0,
          style: C.mapStyle || "auto",
          bright: C.calm ? Math.min(C.mapBright || 100, 85) : C.mapBright || 100,
          van: hereLL,
          brg: LV.bearing || 0,
          spd: LV.speed || 0,
          drive,
          padL: (S.scr === "trip" || S.scr === "rt") && !pnlMin ? 430 : S.scr === "home" ? 380 : 40,
          rt: vis ? { sig: S.tripId + ":" + leg + ":" + rtPts.length + ":" + list.map((x) => x.id).join(",") + ":" + nextIdx, pts: rtPts, stops: rtStops, towns: (() => {
            const k = rtPts.length + ":" + (rtPts[0] || []).join();
            if (self.townK !== k) {
              self.townK = k;
              const smp = rtPts.filter((_, j) => j % 3 === 0);
              self.townL = TOWNS.filter((t) => smp.some((q2) => Math.abs(q2[0] - t[1]) < 0.045 && Math.abs(q2[1] - t[2]) < 0.055)).map((t) => ({ name: t[0], lat: t[1], lon: t[2], big: !!t[3] }));
            }
            return self.townL;
          })() } : null,
          satFast: C.satFast !== false,
          places: (S.scr === "home" || S.scr === "trip") && S.qc ? qcPins : null,
          park: S.scr === "trip" && H0.park ? H0.park : null
        });
        if (S.qc) NV.onPlaceClick = (pp) => qcPick(pp.raw || pp);
      }
      const peHome = S.peKind !== "work";
      const peCur0 = peHome ? window.tcHome && window.tcHome() : NV && NV.getWork ? NV.getWork() : null;
      const peSave = (p) => {
        if (!p) return;
        const o = { name: p.name || (peHome ? "Nh\xE0" : "Ch\u1ED7 l\xE0m"), lat: p.lat, lon: p.lon };
        if (peHome) {
          if (window.tcSetHome) window.tcSetHome(false, o);
        } else if (NV) NV.setWork(o);
        self.setState({ dlg: null, pePick: false, homeAt: Date.now() });
        self.toast((peHome ? "\u0110\xE3 l\u01B0u Nh\xE0: " : "\u0110\xE3 l\u01B0u Ch\u1ED7 L\xE0m: ") + o.name);
      };
      const pe = {
        open: S.dlg === "pe",
        title: peHome ? "\u{1F3E0} Nh\xE0" : "\u{1F4BC} Ch\u1ED7 L\xE0m",
        what: peHome ? "Nh\xE0" : "Ch\u1ED7 L\xE0m",
        cur: peCur0 ? "\u0110ang l\u01B0u: " + peCur0.name : "Ch\u01B0a l\u01B0u",
        has: !!peCur0,
        q: S.peQ || "",
        busy: !!S.peBusy,
        busyL: S.peBusy === "gps" ? "\u0110ang ch\u1EDD GPS\u2026" : "\u0110ang t\xECm\u2026",
        res: (S.peRes || []).slice(0, 6).map((r) => ({ name: r.name, sub: r.addr || r.sub || "", pick: () => peSave(r) })),
        close: () => self.setState({ dlg: null }),
        type: (e) => {
          const q2 = e.target.value;
          self.setState({ peQ: q2 });
          clearTimeout(self.peT);
          if (q2.trim().length < 3 || !NV) {
            self.setState({ peRes: [] });
            return;
          }
          self.peT = setTimeout(() => {
            self.setState({ peBusy: "q" });
            NV.search(q2, hereLL, (r) => self.setState({ peRes: r || [], peBusy: null }));
          }, 450);
        },
        here: () => {
          const tryIt = (n) => {
            const L0 = window.__liveLL && window.__liveLL();
            if (L0) {
              self.setState({ peBusy: null });
              if (NV && NV.reverse) NV.reverse(L0).then((nm) => peSave({ name: nm || LV.place && (LV.place.street || LV.place.suburb), lat: L0[0], lon: L0[1] })).catch(() => peSave({ lat: L0[0], lon: L0[1] }));
              else peSave({ lat: L0[0], lon: L0[1] });
              return;
            }
            if (n <= 0) {
              self.setState({ peBusy: null });
              self.toast("Ch\u01B0a b\u1EAFt \u0111\u01B0\u1EE3c GPS \u2014 th\u1EED l\u1EA1i sau");
              return;
            }
            self.setState({ peBusy: "gps" });
            setTimeout(() => tryIt(n - 1), 1e3);
          };
          tryIt(20);
        },
        onMap: () => {
          if (!NV) return;
          self.setState({ dlg: null, pePick: true, scr: "home", mapOn: true });
          NV.onMapClick = (ll) => {
            NV.onMapClick = null;
            const p = [ll.lat, ll.lng];
            NV.reverse(p).then((nm) => peSave({ name: nm, lat: p[0], lon: p[1] })).catch(() => peSave({ lat: p[0], lon: p[1] }));
          };
        },
        pickBar: !!S.pePick,
        cancelPick: () => {
          if (NV) NV.onMapClick = null;
          self.setState({ pePick: false });
        },
        del: () => {
          if (peHome) {
            if (window.tcSetHome) window.tcSetHome(true);
          } else if (NV && NV.clearWork) NV.clearWork();
          self.setState({ dlg: null, homeAt: Date.now() });
          self.toast("\u0110\xE3 xo\xE1");
        }
      };
      const lf = {
        open: S.dlg === "limfix",
        title: "Bi\u1EC3n t\u1ED1c \u0111\u1ED9 \u1EDF \u0111\xE2y l\xE0 bao nhi\xEAu?",
        sub: (LM && LM.label ? LM.label + " \xB7 " : "") + "App s\u1EBD nh\u1EDB s\u1ED1 Tom ch\u1ECDn cho con \u0111\u01B0\u1EDDng n\xE0y (ch\u1EC9 trong m\xE1y)",
        close: () => self.setState({ dlg: null }),
        opts: [40, 50, 60, 70, 80, 90, 100, 110].map((v) => ({ v, on: LM && LM.v === v ? "true" : "false", ring: LM && LM.v === v ? "0 0 0 4px #FBB040" : "none", pick: () => {
          const ok = window.tcLimitFix && window.tcLimitFix(v);
          self.setState({ dlg: null });
          self.toast(ok ? "\u0110\xE3 nh\u1EDB " + v + " km/g cho \u0111\u01B0\u1EDDng n\xE0y" : "\u0110ang ch\u1EC9 \u0111\u01B0\u1EDDng: s\u1ED1 l\u1EA5y theo tuy\u1EBFn, ch\u01B0a s\u1EEDa \u0111\u01B0\u1EE3c");
        } }))
      };
      const delP = S.delId ? ALLP[S.delId] : null;
      const phTrip = !!S.tripStarted || !!(LT && LT.km > 25 && LT.km < TOTAL - 25);
      const DOWV = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
      const openFull = (scr, extra) => {
        if (APP && window.tcForceWide) window.tcForceWide(true);
        self.setState(Object.assign({ scr }, extra || {}));
      };
      const ph = {
        trip: nar && phTrip,
        noTrip: nar && !phTrip,
        date: DOWV[d.getDay()] + ", " + d.getDate() + "/" + (d.getMonth() + 1) + (lunTxt ? " \xB7 " + lunTxt : ""),
        hours: hrs.slice(0, 6).map((h) => ({ t: h.t, icon: icOf(h.code, h.hr), v: h.temp == null ? "--" : Math.round(h.temp) + "\xB0", p: h.p != null && h.p >= 10 ? Math.round(h.p) + "%" : "" })),
        start: () => openFull("rt", { tripStarted: true }),
        list: () => openFull("home", { mpOpen: true, panelAt: Date.now() }),
        backOn: APP && !!LV.forceWide && !nar,
        back: () => {
          if (window.tcForceWide) window.tcForceWide(false);
        },
        btns: [
          { l: "Tr\u1EE3 L\xFD", c: "#5FD4F0", ic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3", go: () => {
            self.setState({ va: true, vaHeard: "", vaHint: "", vaRetry: 0 });
            tcn("voice", "start");
          } },
          { l: "Road Trip", c: "#FBB040", ic: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14", go: () => openFull("rt") },
          { l: "T\xECm Ch\u1ED7", c: "#7BD88F", ic: "M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM20 20l-4-4", go: () => openFull("search") },
          { l: "M\u1EDF R\u1ED9ng", c: "#CFE6EE", ic: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5", go: () => openFull("home") }
        ]
      };
      const wsHid = navAct || spd > 15 ? !S.wsOpen : !!C.wsCol;
      window.__mapTouched = () => {
        if (shell && self.state.scr === "home" && !self.state.qc && !wsHid) {
          if (navAct || spd > 15) self.setState({ wsOpen: false });
          else self.setS("wsCol", true);
        }
      };
      return {
        crashOn: !!S.crash,
        crashClose: () => self.setState({ crash: "" }),
        crashSend: () => {
          const v = window.TC_VERSION || "0.9.x-beta";
          tcn("mail", JSON.stringify({ subject: "G\xF3p \xDD Tom's Car " + v, body: "App v\u1EEBa b\u1ECB t\u1EAFt b\u1EA5t ng\u1EDD.\n\n" + S.crash }));
          self.setState({ crash: "" });
        },
        rootW: nar || APP ? "100%" : "1280px",
        rootH: nar || APP ? "100%" : "720px",
        verL: window.TC_VERSION || "0.9.x-beta",
        ph,
        rootBg: APP ? "transparent" : "#03111C",
        opaqueBg: APP && (nar || !shell),
        nv,
        tabs,
        hj,
        rtp,
        lf,
        pe,
        wsShow: shell && S.scr === "home" && !S.qc && !wsHid,
        wsGuide: !C.wsGuideOff,
        wsLater: () => self.setS("wsGuideOff", true),
        wsHide: () => navAct || spd > 15 ? self.setState({ wsOpen: false }) : self.setS("wsCol", true),
        upCardOn: drive && !navAct,
        wsPill: shell && S.scr === "home" && !S.qc && wsHid,
        wsTog: () => navAct || spd > 15 ? self.setState({ wsOpen: true }) : (self.setS("wsCol", false), self.setState({ wsOpen: false })),
        rtDlgOn: shell,
        kbLk,
        clock,
        scrBtns,
        zones,
        sb,
        mp,
        va,
        clk,
        idl,
        openTheme,
        street,
        devList,
        wxi,
        wxc,
        wxT,
        wxL1,
        wxL2,
        engT,
        voltT,
        obdHint,
        obdHintOn: !!obdHint,
        upL,
        upMain,
        cp,
        searchNote,
        searchRetry,
        doRetry,
        searchQ: S.searchQ || "",
        setSearchQ: (e) => self.setState({ searchQ: e.target.value }),
        doSearchQ: () => {
          const q2 = (S.searchQ || "").trim();
          if (!q2) return;
          self.setState({ cat: "q:" + q2 });
          if (APP && window.tcFindPlaces) window.tcFindPlaces("q:" + q2);
        },
        fuelNote,
        unreadN: APP ? (S.msgs || []).reduce((a, m) => a + (m[5] || 0), 0) + (LV.missed || 0) : 3,
        wsTitle: S.wsEdit != null ? "S\u1EEDa Workspace" : "T\u1EA1o Workspace",
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
        setAddQ: (e) => {
          const v = e.target.value;
          self.setState({ addQ: v, addLink: "" });
          addSearch(v);
        },
        addResOn: (S.addRes || []).length > 0,
        addRetryOn: !!S.addRetry,
        addRes: (S.addRes || []).slice(0, 6).map((p) => {
          const pg = NV && NV.pict ? NV.pict(p.kind || "", p.house) : null;
          const lg = p.logo || "";
          return { name: p.name, sub: p.sub || p.addr || "", km: p.km != null ? (p.km < 10 ? String(Math.round(p.km * 10) / 10).replace(".", ",") : Math.round(p.km)) + " km" : "", img: lg || (pg ? pg.url : ""), icBg: lg ? "#FFFFFF" : pg ? pg.bg : "#1F5FAE", pick: () => addPick(p) };
        }),
        addLink: S.addLink,
        setAddLink: (e) => self.setState({ addLink: e.target.value }),
        addHere,
        addFind,
        addMsg: S.addMsg,
        vo: (() => {
          const now = Date.now(), nat = typeof LV.vol === "number" ? LV.vol : S.volDemo != null ? S.volDemo : 60;
          const p = S.volSet != null && now - (S.volSetAt || 0) < 1500 ? S.volSet : nat;
          const extAt = LV.volAt || 0;
          const on = !!self.__volDrag || S.volOpen && now - (S.volTouch || 0) < 4e3 || extAt > (S.volSeenAt || 0) && now - extAt < 4e3 && !S.idleOn;
          const icon = p <= 0 ? "\u{1F507}" : p < 50 ? "\u{1F508}" : "\u{1F50A}";
          const setP = (v) => {
            v = Math.max(0, Math.min(100, Math.round(v)));
            if (APP) tcn("media", "vol:" + v);
            self.setState({ volSet: v, volSetAt: Date.now(), volDemo: APP ? S.volDemo : v, volOpen: true, volTouch: Date.now() });
          };
          return {
            on,
            onA: on ? "true" : "false",
            p,
            pL: p + "%",
            icon,
            x: 640,
            aria: "\xC2m l\u01B0\u1EE3ng nh\u1EA1c " + p + "%",
            muteA: p <= 0 ? "B\u1EADt ti\u1EBFng" : "T\u1EAFt ti\u1EBFng",
            tap: () => self.setState({ volOpen: !on, volTouch: Date.now(), volSeenAt: on ? Date.now() : S.volSeenAt || 0, srcMenu: false }),
            touch: () => self.setState({ volTouch: Date.now(), volOpen: true }),
            up: () => setP(p + 10),
            down: () => setP(p - 10),
            mute: () => {
              if (APP) {
                tcn("media", "mute");
                self.setState({ volTouch: Date.now(), volOpen: true, volSet: null });
              } else setP(p > 0 ? 0 : S.volMuteFrom || 40);
              if (!APP && p > 0) self.setState({ volMuteFrom: p });
            },
            // 0.9.12 (#104): the finger is followed on the whole window until it lifts, so a redraw of the bar cannot drop it
            drag: (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              if (!r.width) return;
              if (e.preventDefault) e.preventDefault();
              if (e.stopPropagation) e.stopPropagation();
              const val = (x) => Math.round(Math.max(0, Math.min(1, (x - r.left) / r.width)) * 20) * 5;
              self.__volDrag = true;
              self.__volLast = val(e.clientX);
              setP(self.__volLast);
              const mv = (ev) => {
                const v = val(ev.clientX);
                if (v !== self.__volLast) {
                  self.__volLast = v;
                  setP(v);
                }
              };
              const up = () => {
                window.removeEventListener("pointermove", mv);
                window.removeEventListener("pointerup", up);
                window.removeEventListener("pointercancel", up);
                self.__volDrag = false;
                self.setState({ volTouch: Date.now(), volOpen: true });
              };
              window.addEventListener("pointermove", mv);
              window.addEventListener("pointerup", up);
              window.addEventListener("pointercancel", up);
            }
          };
        })(),
        srcL: S.src === "music" ? "NH\u1EA0C" : S.src === "radio" ? "RADIO" : "PODCAST",
        cycleSrc: () => {
          const n = { music: "radio", radio: "podcast", podcast: "music" }[S.src];
          self.setState({ src: n, mpTab: TABS[n][0][0], nowT: "", nowS: "" });
        },
        togglePanel: () => self.setState({ mpOpen: !mpOpen, panelAt: Date.now() }),
        panelExp: mpOpen ? "true" : "false",
        startListen: () => {
          self.setState({ va: true, vaHeard: "", vaHint: "", vaRetry: 0 });
          tcn("voice", "start");
        },
        micOff: APP && PM.mic === false,
        micCls: APP && PM.mic === false ? "" : S.va ? "mic-listen" : S.now - (S.replyAt || 0) < 3e3 ? "mic-reply" : drive ? "mic-idle mic-calm" : "mic-idle",
        micBg: APP && PM.mic === false ? "#5E6B73" : "#FBB040",
        micW: APP && PM.mic === false ? "#5E6B73" : S.va ? "#FBB040" : "#5FD4F0",
        micA: APP && PM.mic === false ? "ch\u01B0a c\u1EA5p quy\u1EC1n micro" : S.va ? "\u0111ang nghe" : "s\u1EB5n s\xE0ng",
        isHome: shell,
        isSettings: !nar && S.scr === "settings",
        isTheme: !nar && S.scr === "theme",
        th,
        isRt: false,
        tp,
        od,
        dk,
        spdDisp: "none",
        mpL: mpPos ? mpPos.L : "auto",
        mpR: mpPos ? mpPos.R : "20px",
        mpW: mpPos ? mpPos.W : drive ? 600 : 660,
        mpH: mpPos ? 72 : 80,
        mpB: mpPos ? 16 : 10,
        mpCls: mpPos ? "gl" : "",
        srcMenuOn: !!S.srcMenu,
        srcMenuX: 760,
        srcMenuTap: () => self.setState({ srcMenu: !S.srcMenu }),
        srcMenu: [["music", "Nh\u1EA1c"], ["radio", "Radio"], ["podcast", "Podcast"]].map(([k, l]) => {
          const on = S.src === k;
          return { label: l, on: on ? "true" : "false", bg: on ? "#FBB040" : "#0D2C40", fg: on ? "#2A1A00" : "#E8F1F5", pick: () => (APP && k === "podcast" && tcn("media", "jbquery"), self.setState({ src: k, srcMenu: false, mpOpen: true, mpQ: "", mpTab: k === "radio" ? "near" : k === "music" ? "lists" : self.state.mpTab, panelAt: Date.now() })) };
        }),
        townOn: !!(S.townSign && S.now - S.townSign.at < 6e3 && S.scr === "home"),
        townL: S.townSign ? S.townSign.name : "",
        isSplit: !nar && S.scr === "split",
        isSearch: !nar && S.scr === "search",
        isDex: !nar && S.scr === "dex",
        isContacts: !nar && S.scr === "contacts",
        isCompact: nar,
        appTop: APP ? 0 : 40,
        appW: nar || APP ? "100%" : "1280px",
        appH: nar || APP ? "100%" : "680px",
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
        tint: drive && C.rainFx && !nv.mapOn ? "rgba(10,40,70,0.35)" : "transparent",
        rainOn,
        drops: DROPS,
        glass: GLASS,
        opBottom,
        opMusic,
        dimmedAny: idle,
        dimHint: idle && (() => {
          try {
            if (!window.__dimHintUntil) {
              if (localStorage.getItem("tc-dimhint")) {
                window.__dimHintUntil = 1;
              } else {
                localStorage.setItem("tc-dimhint", "1");
                window.__dimHintUntil = Date.now() + 6e3;
              }
            }
          } catch (e) {
            window.__dimHintUntil = 1;
          }
          return Date.now() < window.__dimHintUntil;
        })(),
        jb,
        musicW: drive ? 600 : 660,
        togglePlay: () => {
          if (APP) {
            if (S.src === "radio") tcn("radio", playing ? "stop" : JSON.stringify({ url: LV.radio && LV.radio.url || "", name: LV.radio && LV.radio.name || "" }));
            else tcn("media", playing ? "pause" : "play");
          } else self.setState({ playing: !S.playing, perm: S.playing ? S.perm : true });
        },
        playLabel: playing ? "D\u1EEBng" : "Ph\xE1t",
        prevF: () => {
          if (!APP) return;
          if (S.src === "podcast") tcn("media", "jb:" + JSON.stringify({ kind: "seek", name: "-15000" }));
          else tcn(S.src === "radio" ? "radio" : "media", "prev");
        },
        nextF: () => {
          if (!APP) return;
          if (S.src === "podcast") tcn("media", "jb:" + JSON.stringify({ kind: "seek", name: "30000" }));
          else tcn(S.src === "radio" ? "radio" : "media", "next");
        },
        prevLabel: S.src === "podcast" ? "L\xF9i 15 gi\xE2y" : S.src === "radio" ? "\u0110\xE0i tr\u01B0\u1EDBc" : "B\xE0i tr\u01B0\u1EDBc",
        nextLabel: S.src === "podcast" ? "T\u1EDBi 30 gi\xE2y" : S.src === "radio" ? "\u0110\xE0i k\u1EBF" : "B\xE0i k\u1EBF",
        playIcon: playing && !inCall ? "M7 5h4v14H7zM13 5h4v14h-4z" : "M8 5l11 7-11 7z",
        songTitle: APP ? S.src === "radio" ? LV.radio && LV.radio.name || DEF_NOW.radio[2] : MD && MD.title || DEF_NOW.music[2] : S.playing ? S.nowT || DEF_NOW[S.src][0] : DEF_NOW[S.src][2],
        songSub: inCall && playing ? "T\u1EA1m d\u1EEBng v\xEC c\xF3 cu\u1ED9c g\u1ECDi" : APP ? S.src === "radio" ? playing ? "Radio \xB7 tr\u1EF1c ti\u1EBFp" : LV.radio && LV.radio.err || "" : MD ? [MD.artist, MD.app].filter(Boolean).join(" \xB7 ") : "B\u1EA5m \u25B6 \u0111\u1EC3 ph\xE1t " + ({ "com.spotify.music": "Spotify", "com.google.android.apps.youtube.music": "YouTube Music" }[C.musicApp] || "Tom's Jukebox") : S.playing ? S.nowS || DEF_NOW[S.src][1] : S.perm ? "B\u1EA5m \u25B6 \u0111\u1EC3 ph\xE1t" : "",
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
        privIcon: priv ? "M3 3l18 18" : "",
        openExit: () => self.setState({ exitOpen: true }),
        closeExit: () => self.setState({ exitOpen: false }),
        exitOpen: S.exitOpen,
        openCreate: () => {
          self.setState({ createOpen: true, wsSel: [], wsName: "", wsPct: null, wsEdit: null, rtCheck: false });
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
        bootDur: Math.max(0.6, (C.splashSec == null ? 3 : +C.splashSec) - 0.4),
        bootAbout: S.boot === "about",
        skipBoot: () => {
          clearTimeout(self.b2);
          self.setState({ boot: null, scr: S.boot === "about" ? S.scr : self.startScr(), last: Date.now() });
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
.jbbtn{border:0;border-radius:50%;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;background:rgba(3,17,28,0.55);box-shadow:inset 0 0 0 2.5px #48C8C0,inset 0 0 0 3.5px rgba(251,176,64,0.75),0 0 10px rgba(72,200,192,0.35)}
.jbbtn:active{transform:scale(.94)}
@keyframes tf-spin{to{transform:rotate(360deg)}}
.disc-on{animation:tf-spin 6s linear infinite;transform-origin:50% 50%}
@keyframes tf-silk{from{transform:translateX(0)}to{transform:translateX(-200px)}}
.jbwave .w1{animation:tf-silk 9s linear infinite}.jbwave .w2{animation:tf-silk 13s linear infinite reverse}
.jbpill.calm .jbwave path{animation-duration:40s}
@keyframes tf-breathe{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes tf-jump{0%,100%{transform:scaleY(.45)}50%{transform:scaleY(1.25)}}
.gl{background:rgba(8,22,34,.5)!important;backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);box-shadow:0 8px 28px rgba(0,0,0,.22),inset 0 0 0 1px rgba(255,255,255,.22)!important;border-radius:999px!important;clip-path:none!important}
.glc{background:rgba(8,22,34,.5);backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);box-shadow:0 8px 28px rgba(0,0,0,.22),inset 0 0 0 1px rgba(255,255,255,.22);border-radius:26px}
.glr{background:rgba(8,22,34,.5)!important;backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);box-shadow:0 8px 28px rgba(0,0,0,.22),inset 0 0 0 1px rgba(255,255,255,.22)!important;border-radius:50%!important;clip-path:none!important}
.glt{backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.glb{background:rgba(8,22,34,.55)!important;backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);box-shadow:0 8px 28px rgba(0,0,0,.22),inset 0 0 0 1px rgba(255,255,255,.22)!important;border-radius:18px!important;clip-path:none!important}
#ui .lbl{text-shadow:0 1px 3px rgba(0,0,0,.45)}
.flipc{position:relative;width:250px;height:230px;border-radius:22px;background:linear-gradient(#1d2a36 0 50%,#16212b 50%);box-shadow:0 18px 40px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-family:Overpass,sans-serif;font-size:190px;font-weight:300;line-height:1;letter-spacing:-6px;color:#fff}
.flipc:after{content:'';position:absolute;left:0;right:0;top:50%;height:3px;background:rgba(0,0,0,.55)}
.flipc.flp{animation:tf-flip .6s ease-in-out}
@keyframes tf-flip{0%{transform:perspective(600px) rotateX(0)}50%{transform:perspective(600px) rotateX(-12deg)}100%{transform:perspective(600px) rotateX(0)}}
@keyframes tf-tapf{0%,70%{opacity:.9}100%{opacity:0}}
.tapfade{animation:tf-tapf 7s forwards}
.sw2{width:64px;height:36px;border-radius:18px;position:relative;flex-shrink:0;transition:background .2s}
.sw2 .kn{position:absolute;top:4px;width:28px;height:28px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#E08A00;font-size:15px;font-weight:800;transition:left .2s}
.odo-d{display:inline-block;height:1.15em;overflow:hidden;vertical-align:top}.odo-c{display:flex;flex-direction:column;transition:transform .6s cubic-bezier(.3,1.3,.5,1)}.odo-c span{height:1.15em;line-height:1.15em;text-align:center}
.mic-idle .mw{animation:tf-breathe 2.4s ease-in-out infinite}
.mic-listen .mw{animation:tf-jump .45s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.mic-listen .mw2{animation-delay:.15s}
.mic-reply .mw{stroke:#3FD17A!important;animation:tf-breathe .8s ease-in-out infinite}
.mic-calm .mw{animation:none;opacity:.7}
@keyframes tf-cloud{from{transform:translateX(-6px)}to{transform:translateX(6px)}}
.wx-anim .cl{animation:tf-cloud 4s ease-in-out infinite alternate}
@keyframes tf-sunr{to{transform:rotate(360deg)}}
.wx-anim .sr{animation:tf-sunr 24s linear infinite;transform-box:fill-box;transform-origin:center}
@keyframes tf-rd{from{transform:translateY(-3px);opacity:0}50%{opacity:1}to{transform:translateY(7px);opacity:0}}
.wx-anim .rd{animation:tf-rd 1.4s linear infinite}
@keyframes tf-fl{0%,92%,100%{opacity:0}94%{opacity:1}}
.wx-anim .fl{animation:tf-fl 5s linear infinite}
.wx-calm *{animation-duration:20s!important}
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
<div onPointerDown="{{touch}}" style="position: relative; width: {{rootW}}; height: {{rootH}}; overflow: hidden; background: {{rootBg}}; color: #E8F1F5; font-family: 'Chakra Petch', 'Segoe UI', system-ui, sans-serif">

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
  <div style="position: absolute; left: 0; top: {{appTop}}px; width: {{appW}}; height: {{appH}}; overflow: hidden; background: {{appBg}}">

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
        <div class="pnl gl" style="height: 58px; padding: 0 22px; display: flex; flex-direction: column; justify-content: center; flex-shrink: 1; min-width: 0; max-width: 260px">
          <span class="lbl">\u0110ANG CH\u1EA0Y TR\xCAN</span><span style="font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{street}}</span>
          <span role="group" aria-label="Pin thi\u1EBFt b\u1ECB" style="display: flex; gap: 10px; font-size: 11px; font-weight: 700; white-space: nowrap; overflow: hidden"><sc-for list="{{devList}}" as="dv" hint-placeholder-count="2"><span style="color: {{dv.c}}">{{dv.l}}</span></sc-for></span>
        </div>
        <button onClick="{{clk.tap}}" aria-label="{{clk.aria}}" class="pnl gl" style="position: relative; margin: 0 auto; border: 0; cursor: pointer; font-family: inherit; color: inherit; height: 58px; padding: 0 24px; display: flex; align-items: center; gap: 8px; flex-shrink: 0; background: rgba(3,17,28,0.82); opacity: {{clk.op}}">
          <sc-if value="{{clk.flip}}" hint-placeholder-val="{{ false }}"><span style="display: flex; align-items: center; gap: 2px"><sc-for list="{{clk.cards}}" as="cd" hint-placeholder-count="4"><span class="fcard {{cd.cls}}" style="margin-left: {{cd.gap}}px">{{cd.d}}</span></sc-for></span></sc-if>
          <sc-if value="{{clk.analog}}" hint-placeholder-val="{{ false }}"><svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#0B141B" stroke="#A9C7D4" stroke-width="1.5"></circle><line x1="20" y1="20" x2="{{clk.hx}}" y2="{{clk.hy}}" stroke="#E8F1F5" stroke-width="2.6" stroke-linecap="round"></line><line x1="20" y1="20" x2="{{clk.mx}}" y2="{{clk.my}}" stroke="#FBB040" stroke-width="1.8" stroke-linecap="round"></line><circle cx="20" cy="20" r="2" fill="#FBB040"></circle></svg></sc-if>
          <sc-if value="{{clk.text}}" hint-placeholder-val="{{ true }}"><span class="tnum" style="font-size: 24px; font-weight: {{clk.fw}}; font-family: {{clk.font}}; font-style: {{clk.fst}}; color: {{clk.c}}; text-shadow: {{clk.glow}}; letter-spacing: {{clk.ls}}">{{clk.h}}<span style="opacity: {{clk.colonOp}}">:</span>{{clk.m}}<span style="font-size: 12px; margin-left: 3px">{{clk.ap}}</span></span></sc-if>
          <span style="display: flex; flex-direction: column; line-height: 1.25; text-align: left">
            <sc-if value="{{clk.line1On}}" hint-placeholder-val="{{ true }}"><span style="font-size: 11px; color: #CFE6EE; white-space: nowrap">{{clk.line1}}</span></sc-if>
            <sc-if value="{{clk.line2On}}" hint-placeholder-val="{{ false }}"><span style="font-size: 11px; color: {{clk.line2C}}; white-space: nowrap">{{clk.line2}}</span></sc-if>
          </span>
        </button>
        <button onClick="{{wxc.open}}" aria-label="Th\u1EDDi ti\u1EBFt: {{wxc.aria}}" class="pnl gl {{wxc.cls}}" style="position: relative; border: 0; cursor: pointer; font-family: inherit; color: #FFFFFF; height: 58px; width: 230px; min-width: 150px; flex-shrink: 1; padding: 0 18px; overflow: hidden; display: flex; align-items: center; gap: 10px; flex-shrink: 1; background: {{wxc.sky}}">
          <canvas id="wxmini" aria-hidden="true" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none"></canvas><span aria-hidden="true" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(10,30,50,0.3); pointer-events: none"></span>
          <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true" style="position: relative; flex-shrink: 0"><sc-for list="{{wxc.parts}}" as="pp" hint-placeholder-count="3"><path class="{{pp.cls}}" d="{{pp.d}}" fill="{{pp.fill}}" stroke="{{pp.stroke}}" stroke-width="{{pp.sw}}" stroke-linecap="round"></path></sc-for></svg>
          <span style="position: relative; display: flex; flex-direction: column; align-items: flex-start; line-height: 1.1; min-width: 0">
            <span style="font-size: 26px; font-weight: 300">{{wxT}}</span>
            <span style="font-size: 11px; white-space: nowrap">{{wxc.hl}}</span>
          </span>
          <span style="position: relative; margin-left: auto; font-size: 11px; text-align: right; line-height: 1.2; max-width: 70px">{{wxc.desc}}</span>
        </button>
        <sc-if value="{{clk.appt}}" hint-placeholder-val="{{ false }}"><button onClick="{{clk.apptNav}}" class="pill" style="height: 44px; background: rgba(251,176,64,0.16); color: #FFE2A8; box-shadow: inset 0 0 0 1px #FBB040; white-space: nowrap">{{clk.apptL}}</button></sc-if>
        <button onClick="{{togglePrivacy}}" aria-pressed="{{privPressed}}" aria-label="Ch\u1EBF \u0110\u1ED9 Ri\xEAng T\u01B0" title="Ch\u1EBF \u0110\u1ED9 Ri\xEAng T\u01B0" class="btn glr" style="width: 54px; height: 54px; padding: 0; color: {{privC}}; box-shadow: {{privRing}}"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle><path d="{{privIcon}}"></path></svg></button>
        <button onClick="{{openTheme}}" aria-label="Giao Di\u1EC7n" title="Giao Di\u1EC7n" class="btn glr" style="width: 54px; height: 54px; padding: 0"><svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 1 0 0 19c1.2 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.1 0-.9.8-1.7 1.7-1.7h2.1a5.4 5.4 0 0 0 5.4-5.4C22 6.3 17.6 2.5 12 2.5z" fill="#F3EBD2" stroke="#8a6b3a" stroke-width="0.8"></path><circle cx="6.8" cy="11.6" r="1.9" fill="#E5484D"></circle><circle cx="9.6" cy="6.9" r="1.9" fill="#FBB040"></circle><circle cx="14.8" cy="6.6" r="1.9" fill="#7BD88F"></circle><circle cx="18.2" cy="10.4" r="1.9" fill="#2FD0F5"></circle><circle cx="8.6" cy="16.2" r="1.7" fill="#B07CF0"></circle></svg></button>
        <button onClick="{{goSettings}}" aria-label="C\xE0i \u0110\u1EB7t" title="C\xE0i \u0110\u1EB7t" class="btn glr" style="width: 54px; height: 54px; padding: 0; color: #FBB040"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button>
        <button onClick="{{openExit}}" aria-label="Tho\xE1t ch\u01B0\u01A1ng tr\xECnh" title="Tho\xE1t" class="btn glr" style="width: 54px; height: 54px; padding: 0; color: #FF9A9E"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v9"></path><path d="M18.4 6.6a9 9 0 1 1-12.8 0"></path></svg></button>
      </header>

      <!-- tab: M\xE0n H\xECnh Ch\xEDnh \xB7 H\xE0nh Tr\xECnh \xB7 Road Trip \xB7 Li\xEAn L\u1EA1c \xB7 T\xECm Ch\u1ED7 -->
      <div style="position: absolute; left: 20px; top: 90px; display: flex; gap: 8px; z-index: 6">
        <sc-for list="{{tabs}}" as="tb" hint-placeholder-count="5"><button onClick="{{tb.go}}" aria-pressed="{{tb.on}}" class="pill {{tb.cls}}" style="background: {{tb.bg}}; color: {{tb.fg}}; box-shadow: {{tb.ring}}; display: flex; align-items: center; gap: 6px; white-space: nowrap">{{tb.label}}<sc-if value="{{tb.badgeOn}}" hint-placeholder-val="{{ false }}"><span style="min-width: 18px; height: 18px; border-radius: 9px; background: #FBB040; color: #2A1A00; font-size: 11px; display: inline-flex; align-items: center; justify-content: center">{{tb.badge}}</span></sc-if></button></sc-for>
      </div>

      <!-- c\u1ED9t Workspace: tr\u1ED1ng l\u1EA7n \u0111\u1EA7u -->
      <sc-if value="{{wsShow}}" hint-placeholder-val="{{ true }}">
      <section aria-label="Workspace" style="position: absolute; left: 20px; top: 138px; width: 330px; bottom: 100px; display: flex; flex-direction: column; gap: 8px">
        <div style="display: flex; align-items: center; gap: 8px"><span class="lbl" style="flex: 1">WORKSPACE</span><button onClick="{{wsHide}}" aria-label="Thu g\u1ECDn Workspace" class="btn" style="width: 40px; height: 34px; padding: 0">\u25C2</button><sc-if value="{{wsAny}}" hint-placeholder-val="{{ false }}"><button onClick="{{openCreate}}" class="btn" style="height: 34px; font-size: 12px">+ T\u1EA1o</button></sc-if></div>
        <sc-if value="{{wsEmpty}}" hint-placeholder-val="{{ true }}">
        <div class="pnl glb" style="padding: 20px; display: flex; flex-direction: column; gap: 14px">
          <button onClick="{{openCreate}}" class="btn btn-o" style="height: 64px; font-size: 18px; width: 100%">+ T\u1EA1o Workspace \u0110\u1EA7u Ti\xEAn</button>
          <sc-if value="{{wsGuide}}" hint-placeholder-val="{{ true }}">
          <div style="font-size: 13px; color: #CFE6EE; line-height: 1.55">
            <div>1. Ch\u1ECDn 1, 2 ho\u1EB7c 3 app (Waze, nh\u1EA1c, YouTube\u2026)</div>
            <div>2. \u0110\u1EB7t t\xEAn, ch\u1ECDn c\xF3 m\u1EDF Road Trip kh\xF4ng</div>
            <div>3. L\xEAn xe b\u1EA5m m\u1ED9t c\xE1i l\xE0 c\xE1c app t\u1EF1 m\u1EDF</div>
          </div>
          <button onClick="{{wsLater}}" class="btn" style="height: 40px; font-size: 14px; color: #CFF6FF; align-self: flex-end; padding: 0 16px">\u0110\u1EC3 Sau</button>
          </sc-if>
        </div>
        </sc-if>
        <sc-if value="{{wsAny}}" hint-placeholder-val="{{ false }}">
        <div class="scrl" style="flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 8px">
          <sc-for list="{{wsCards}}" as="w" hint-placeholder-count="2">
            <div class="pnl glb" style="flex-shrink: 0; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px">
              <div style="display: flex; align-items: center; gap: 8px"><span style="flex: 1; min-width: 0; font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{w.name}}</span><sc-if value="{{w.rt}}" hint-placeholder-val="{{ false }}"><span style="font-size: 11px; color: #2A1A00; background: #FBB040; border-radius: 4px; padding: 1px 6px">Road Trip</span></sc-if><button onClick="{{w.edit}}" aria-label="S\u1EEDa Workspace" class="btn" style="width: 34px; height: 34px; padding: 0; color: #CFF6FF">\u270E</button><button onClick="{{w.del}}" aria-label="Xo\xE1 Workspace" class="btn" style="width: 34px; height: 34px; padding: 0; color: #FF9A9E">\u2715</button></div>
              <div aria-hidden="true" style="display: flex; gap: 4px; height: 30px"><sc-for list="{{w.boxes}}" as="b" hint-placeholder-count="2"><span style="flex: {{b.flex}}; min-width: 0; border-radius: 4px; background: {{b.bg}}; font-size: 11px; display: flex; align-items: center; justify-content: center; white-space: nowrap; overflow: hidden; padding: 0 4px">{{b.name}}</span></sc-for></div>
              <button onClick="{{w.open}}" class="btn glb" style="height: 44px; color: #FFD08A; font-weight: 800; background: rgba(251,176,64,0.16); box-shadow: inset 0 0 0 1px rgba(251,176,64,0.7)">M\u1EDF Workspace</button>
            </div>
          </sc-for>
        </div>
        </sc-if>
      </section>
      </sc-if>
      <sc-if value="{{wsPill}}" hint-placeholder-val="{{ false }}">
        <button onClick="{{wsTog}}" aria-label="Hi\u1EC7n Workspace" class="pill glb" style="position: absolute; left: 20px; top: 138px; height: 40px; padding: 0 14px; z-index: 6; font-size: 13px; color: #FFD08A">WORKSPACE \u25B8</button>
      </sc-if>
      <!-- ===== 0.9.9: l\u1EDBp tr\xEAn b\u1EA3n \u0111\u1ED3 ===== -->
      <!-- \xF4 "\u0110i \u0111\xE2u?" (M\xE0n H\xECnh Ch\xEDnh) -->
      <sc-if value="{{nv.boxOn}}" hint-placeholder-val="{{ false }}">
        <div class="pnl glb" style="position: absolute; right: 20px; top: 88px; width: 470px; height: 54px; box-sizing: border-box; padding: 0 6px 0 14px; display: flex; align-items: center; gap: 8px; z-index: 7">
          <span aria-hidden="true" style="font-size: 20px; color: #FBB040">\u27A4</span>
          <input type="text" aria-label="\u0110i \u0111\xE2u?" value="{{nv.q}}" placeholder="{{nv.ph}}" disabled="{{nv.lock}}" onInput="{{nv.typeGo}}" style="flex: 1; min-width: 0; height: 42px; border: 0; background: transparent; color: #FFFFFF; font-family: inherit; font-size: 18px; outline: none">
          <button onClick="{{nv.micGo}}" aria-label="N\xF3i \u0111\u1ECBa ch\u1EC9" class="btn" style="width: 42px; height: 42px; padding: 0; background: transparent; font-size: 20px">\u{1F3A4}</button><sc-if value="{{nv.qOn}}" hint-placeholder-val="{{ false }}"><button onClick="{{nv.clearQ}}" aria-label="Xo\xE1 ch\u1EEF" class="btn" style="width: 40px; height: 40px; padding: 0; background: transparent">\u2715</button></sc-if>
          <button onClick="{{nv.goFirst}}" class="btn btn-o" style="height: 42px; padding: 0 20px; font-size: 17px">\u0110i</button>
        </div>
      </sc-if>
      <sc-if value="{{nv.resOn}}" hint-placeholder-val="{{ false }}">
        <div class="pnl fadein" role="listbox" style="position: absolute; right: 20px; top: 148px; width: 470px; max-height: 380px; box-sizing: border-box; padding: 6px; display: flex; flex-direction: column; gap: 2px; z-index: 8; background: rgba(4,18,30,0.96); box-shadow: 0 16px 40px rgba(0,0,0,0.6)">
          <div class="scrl" style="display: flex; flex-direction: column; gap: 2px; max-height: 368px">
            <sc-for list="{{nv.res}}" as="r" hint-placeholder-count="4"><button onClick="{{r.pick}}" style="flex-shrink: 0; width: 100%; border: 0; background: transparent; cursor: pointer; font-family: inherit; color: #E8F1F5; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; text-align: left"><span style="width: 38px; height: 38px; border-radius: 8px; background: {{r.icBg}}; display: flex; align-items: center; justify-content: center; font-size: 19px; flex-shrink: 0; overflow: hidden"><sc-if value="{{r.logoOn}}" hint-placeholder-val="{{ false }}"><img src="{{r.logo}}" alt="" style="width: 32px; height: 32px; object-fit: contain"></sc-if><sc-if value="{{r.icOn}}" hint-placeholder-val="{{ true }}"><span>{{r.icon}}</span></sc-if></span><span style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.name}}</span><span style="font-size: 12px; color: #8FC3D3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.sub}}</span></span><span style="font-size: 12px; color: #FFD08A; white-space: nowrap">{{r.km}}</span></button></sc-for>
          </div>
        </div>
      </sc-if>
      <sc-if value="{{nv.chipsOn}}" hint-placeholder-val="{{ false }}">
        <div class="scrl" style="position: absolute; right: 20px; top: 150px; width: 470px; display: flex; gap: 6px; flex-wrap: nowrap; overflow-x: auto; overflow-y: hidden; padding-bottom: 4px; z-index: 6">
          <sc-for list="{{nv.chips}}" as="c" hint-placeholder-count="3"><button onClick="{{c.go}}" aria-pressed="{{c.on}}" class="pill glt" style="flex-shrink: 0; height: 38px; background: rgba(8,22,34,0.72); color: #FFFFFF; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.22); font-size: 14px; white-space: nowrap">{{c.l}}</button></sc-for>
        </div>
      </sc-if>
      <sc-if value="{{nv.navChipsOn}}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; left: 20px; top: 186px; display: flex; gap: 6px; z-index: 6">
          <sc-for list="{{nv.navChips}}" as="c" hint-placeholder-count="6"><button onClick="{{c.go}}" aria-label="{{c.a}}" aria-pressed="{{c.on}}" class="btn glr" style="width: 46px; height: 46px; padding: 0; font-size: 20px">{{c.l}}</button></sc-for>
        </div>
      </sc-if>
      <sc-if value="{{nv.qcOn}}" hint-placeholder-val="{{ false }}">
        <div class="pnl fadein" style="position: absolute; left: 20px; top: 240px; width: 400px; max-height: 330px; box-sizing: border-box; padding: 8px; display: flex; flex-direction: column; gap: 4px; z-index: 8; background: rgba(4,18,30,0.94)">
          <div style="display: flex; align-items: center; gap: 8px; padding: 0 4px"><span style="flex: 1; font-size: 16px; font-weight: 800">{{nv.qcTitle}}</span><button onClick="{{nv.qcClose}}" aria-label="\u0110\xF3ng" class="btn" style="width: 38px; height: 34px; padding: 0">\u2715</button></div>
          <span style="font-size: 12px; color: #8FC3D3; padding: 0 4px">{{nv.qcMsg}}</span>
          <div class="scrl" style="display: flex; flex-direction: column; gap: 2px; min-height: 0">
            <sc-for list="{{nv.qcRows}}" as="r" hint-placeholder-count="3"><button onClick="{{r.pick}}" style="flex-shrink: 0; width: 100%; border: 0; background: transparent; cursor: pointer; font-family: inherit; color: #E8F1F5; display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: 8px; text-align: left"><span style="width: 36px; height: 36px; border-radius: 8px; background: {{r.icBg}}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden"><img src="{{r.img}}" alt="" style="width: 32px; height: 32px; object-fit: contain"></span><span style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.name}}</span><span style="font-size: 12px; color: #8FC3D3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.sub}}</span></span><span style="display: flex; flex-direction: column; align-items: flex-end"><span style="font-size: 13px; color: #FFD08A; white-space: nowrap">{{r.km}}</span><span style="font-size: 11px; color: {{r.openC}}">{{r.open}}</span></span></button></sc-for>
          </div>
        </div>
      </sc-if>

      <!-- b\u0103ng ch\u1EC9 \u0111\u01B0\u1EDDng: G\u1ECDn / L\u1EDBn / \u1EA8n (#94) \u2014 ch\u1EA1m \u0111\u1EC3 \u0111\u1ED5i -->
      <sc-if value="{{nv.bannerOn}}" hint-placeholder-val="{{ false }}">
        <button onClick="{{nv.bnTap}}" aria-label="B\u0103ng ch\u1EC9 \u0111\u01B0\u1EDDng \u2014 ch\u1EA1m \u0111\u1EC3 \u0111\u1ED5i c\u1EE1" class="pnl fadein" style="position: absolute; right: 20px; top: 88px; width: 430px; box-sizing: border-box; padding: 10px 14px 8px; display: flex; flex-direction: column; gap: 6px; background: rgba(12,92,66,0.94); box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 7; border: 0; cursor: pointer; font-family: inherit; color: #FFFFFF; text-align: left">
          <span style="display: flex; align-items: center; gap: 12px; width: 100%">
            <svg width="58" height="58" viewBox="0 0 48 48" aria-hidden="true" style="flex-shrink: 0"><path d="{{nv.icoD}}" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <span style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span class="tnum" style="font-size: 32px; font-weight: 800; line-height: 1">{{nv.dist}}</span><span style="font-size: 18px; font-weight: 700; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{nv.shortText}}</span></span>
          </span>
          <span style="display: block; width: 100%; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.2); overflow: hidden"><span style="display: block; height: 100%; width: {{nv.bar}}%; background: #FFFFFF"></span></span>
          <sc-if value="{{nv.thenIcoOn}}" hint-placeholder-val="{{ false }}"><span style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #D8FFF0; white-space: nowrap; overflow: hidden"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path d="{{nv.thenIcoD}}" fill="none" stroke="#D8FFF0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path></svg>{{nv.thenDist}} \xB7 {{nv.thenShort}}</span></sc-if>
        </button>
      </sc-if>
      <sc-if value="{{nv.bnMini}}" hint-placeholder-val="{{ false }}">
        <button onClick="{{nv.bnTap}}" aria-label="B\u0103ng ch\u1EC9 \u0111\u01B0\u1EDDng g\u1ECDn \u2014 ch\u1EA1m \u0111\u1EC3 \u0111\u1ED5i c\u1EE1" class="pnl" style="position: absolute; right: 20px; top: 88px; max-width: 430px; height: 52px; box-sizing: border-box; padding: 0 16px 0 10px; display: flex; align-items: center; gap: 10px; background: rgba(12,92,66,0.94); box-shadow: 0 8px 24px rgba(0,0,0,0.45); z-index: 7; border: 0; border-radius: 26px; cursor: pointer; font-family: inherit; color: #FFFFFF">
          <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true" style="flex-shrink: 0"><path d="{{nv.icoD}}" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          <span class="tnum" style="font-size: 22px; font-weight: 800; white-space: nowrap">{{nv.dist}}</span>
          <span style="font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.95">{{nv.shortText}}</span>
        </button>
      </sc-if>
      <sc-if value="{{nv.bnTiny}}" hint-placeholder-val="{{ false }}">
        <button onClick="{{nv.bnTap}}" aria-label="Ch\u1EC9 \u0111\u01B0\u1EDDng \u0111ang \u1EA9n \u2014 ch\u1EA1m \u0111\u1EC3 hi\u1EC7n" class="pnl" style="position: absolute; right: 20px; top: 88px; width: 64px; height: 64px; box-sizing: border-box; padding: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(12,92,66,0.9); z-index: 7; border: 0; border-radius: 16px; cursor: pointer; font-family: inherit; color: #FFFFFF">
          <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true"><path d="{{nv.icoD}}" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          <span class="tnum" style="font-size: 11px; font-weight: 700">{{nv.dist}}</span>
        </button>
      </sc-if>
      <sc-if value="{{nv.waitGps}}" hint-placeholder-val="{{ false }}">
        <div class="pnl" role="status" style="position: absolute; right: 20px; top: 88px; height: 52px; box-sizing: border-box; padding: 0 18px; display: flex; align-items: center; gap: 10px; background: rgba(60,72,82,0.92); z-index: 7; border-radius: 26px; color: #E8F1F5; font-size: 16px"><span style="width: 10px; height: 10px; border-radius: 5px; background: #FFC46B; animation: tw 1s steps(1) infinite alternate"></span>\u0110ang ch\u1EDD GPS\u2026</div>
      </sc-if>

      <!-- th\u1EBB t\xF3m t\u1EAFt chuy\u1EBFn (xem tr\u01B0\u1EDBc, ch\u01B0a ch\u1EA1y) -->
      <sc-if value="{{nv.prevOn}}" hint-placeholder-val="{{ false }}">
        <div class="pnl glb fadein" role="dialog" aria-label="T\xF3m t\u1EAFt \u0111\u01B0\u1EDDng \u0111i" style="position: absolute; right: 84px; top: 150px; width: 406px; box-sizing: border-box; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; z-index: 6">
          <div style="display: flex; align-items: center; gap: 10px">
            <span style="width: 40px; height: 40px; border-radius: 8px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; font-size: 20px"><sc-if value="{{nv.destLogoOn}}" hint-placeholder-val="{{ false }}"><img src="{{nv.destLogo}}" alt="" style="width: 34px; height: 34px; object-fit: contain"></sc-if><sc-if value="{{nv.destIcOn}}" hint-placeholder-val="{{ true }}"><span style="color: #D0202E">\u2691</span></sc-if></span>
            <div style="flex: 1; min-width: 0"><div style="font-size: 18px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{nv.dest}}</div><div style="font-size: 13px; color: #CFE6EE">{{nv.sum}}</div></div>
            <button onClick="{{nv.cancel}}" aria-label="Hu\u1EF7 \u0111\u01B0\u1EDDng \u0111i" class="btn" style="width: 40px; height: 40px; padding: 0">\u2715</button>
          </div>
          <sc-for list="{{nv.alts}}" as="a" hint-placeholder-count="2"><button onClick="{{a.pick}}" aria-pressed="{{a.on}}" style="border: 0; cursor: pointer; font-family: inherit; color: #E8F1F5; display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; border-radius: 8px; background: {{a.bg}}; box-shadow: {{a.ring}}"><span style="font-size: 14px; font-weight: 700; flex: 1; text-align: left">{{a.label}}</span><span style="font-size: 12px; color: #FFD08A">{{a.toll}}</span><span class="tnum" style="font-size: 14px">{{a.info}}</span></button></sc-for>
          <div style="display: flex; gap: 6px; flex-wrap: wrap"><sc-for list="{{nv.avoid}}" as="v" hint-placeholder-count="3"><button onClick="{{v.tap}}" aria-pressed="{{v.on}}" class="pill" style="height: 32px; padding: 0 10px; font-size: 12px; background: {{v.bg}}; color: {{v.fg}}">{{v.l}}</button></sc-for></div>
          <sc-if value="{{nv.tollOn}}" hint-placeholder-val="{{ false }}"><div style="font-size: 13px; color: #FFD08A">{{nv.tollL}}</div></sc-if>
          <sc-if value="{{nv.msgOn}}" hint-placeholder-val="{{ false }}"><div style="font-size: 13px; color: #FFD08A">{{nv.msg}}</div></sc-if>
          <button onClick="{{nv.start}}" class="btn btn-o" style="height: 54px; font-size: 19px">B\u1EAFt \u0110\u1EA7u</button>
          <div style="display: flex; gap: 6px"><button onClick="{{nv.gmaps}}" class="btn" style="flex: 1; height: 38px; font-size: 13px">M\u1EDF b\u1EB1ng Google Maps</button><button onClick="{{nv.waze}}" class="btn" style="flex: 1; height: 38px; font-size: 13px">M\u1EDF b\u1EB1ng Waze</button></div>
          <div style="font-size: 11px; color: #8FC3D3">Th\u1EDDi gian \u01B0\u1EDBc t\xEDnh theo \u0111\u01B0\u1EDDng, ch\u01B0a t\xEDnh k\u1EB9t xe.</div>
        </div>
      </sc-if>

      <sc-if value="{{nv.etaMini}}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; right: 20px; bottom: 100px; display: flex; gap: 8px; z-index: 6; align-items: center"><button onClick="{{nv.voice}}" aria-label="{{nv.voiceA}}" class="pnl glb" style="width: 46px; height: 46px; border: 0; border-radius: 23px; padding: 0; font-size: 20px; cursor: pointer; pointer-events: auto">{{nv.voiceIc}}</button><button onClick="{{nv.etaTap}}" aria-label="Gi\u1EDD t\u1EDBi \u2014 ch\u1EA1m \u0111\u1EC3 hi\u1EC7n n\xFAt" class="pnl glb" style="position: relative; height: 46px; box-sizing: border-box; padding: 0 16px; display: flex; align-items: center; gap: 8px; z-index: 6; border: 0; border-radius: 23px; cursor: pointer; font-family: inherit; color: #E8F1F5; white-space: nowrap"><span class="tnum" style="font-size: 20px; font-weight: 800; color: #7BD88F">{{nv.eta}}</span><span style="font-size: 14px">\xB7 {{nv.left}} \xB7 {{nv.km}}</span></button></div>
      </sc-if>
      <!-- th\u1EBB gi\u1EDD t\u1EDBi (\u0111ang ch\u1EA1y) -->
      <sc-if value="{{nv.etaOn}}" hint-placeholder-val="{{ false }}">
        <div class="pnl glb" style="position: absolute; right: 20px; bottom: 100px; width: 470px; height: 66px; box-sizing: border-box; padding: 0 8px 0 16px; display: flex; align-items: center; gap: 8px; z-index: 6">
          <div style="flex: 1; min-width: 0"><div class="tnum" style="font-size: 24px; font-weight: 800; color: #7BD88F; line-height: 1.1">{{nv.eta}} <span style="font-size: 13px; font-weight: 600; color: #CFE6EE">t\u1EDBi n\u01A1i</span></div><div style="font-size: 13px; color: #CFE6EE; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{nv.left}} \xB7 {{nv.km}} \xB7 {{nv.dest}}</div></div>
          <button onClick="{{nv.etaTap}}" aria-label="Thu g\u1ECDn" class="btn" style="width: 40px; height: 48px; padding: 0">\u25BE</button>
          <button onClick="{{nv.voice}}" aria-label="{{nv.voiceA}}" class="btn" style="width: 48px; height: 48px; padding: 0; font-size: 20px">{{nv.voiceIc}}</button>
          <button onClick="{{nv.share}}" aria-label="G\u1EEDi gi\u1EDD t\u1EDBi b\u1EB1ng tin nh\u1EAFn" class="btn" style="height: 48px; font-size: 13px">G\u1EEDi ETA</button>
          <button onClick="{{nv.stop}}" class="btn" style="height: 48px; font-size: 15px; color: #FFFFFF; background: #C8343A">D\u1EEBng</button>
        </div>
      </sc-if>
      <sc-if value="{{nv.arrivedOn}}" hint-placeholder-val="{{ false }}">
        <div class="pnl glb fadein" role="status" style="position: absolute; right: 20px; top: 88px; width: 470px; height: 70px; box-sizing: border-box; padding: 0 10px 0 18px; display: flex; align-items: center; gap: 10px; z-index: 7; background: rgba(12,92,66,0.94)">
          <span style="flex: 1; font-size: 20px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{nv.arrivedL}}</span>
          <button onClick="{{nv.done}}" class="btn btn-o" style="height: 48px">Xong</button>
        </div>
      </sc-if>

      <!-- n\xFAt b\u1EA3n \u0111\u1ED3: + \u2212 v\u1ECB tr\xED, c\u1EA3 chuy\u1EBFn, h\u01B0\u1EDBng -->
      <sc-if value="{{nv.ctlOn}}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; right: 20px; top: {{nv.ctlTop}}px; display: flex; flex-direction: column; gap: 8px; z-index: 5">
          <button onClick="{{nv.zin}}" aria-label="Ph\xF3ng to" class="btn glr" style="width: 54px; height: 54px; padding: 0; font-size: 28px">+</button>
          <button onClick="{{nv.zout}}" aria-label="Thu nh\u1ECF" class="btn glr" style="width: 54px; height: 54px; padding: 0; font-size: 28px">\u2212</button>
          <button onClick="{{nv.loc}}" aria-label="V\u1EC1 v\u1ECB tr\xED xe" class="btn glr" style="width: 54px; height: 54px; padding: 0; color: {{nv.locC}}"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="2.5" fill="currentColor"></circle><path d="M12 1v4M12 19v4M1 12h4M19 12h4"></path></svg></button>
          <sc-if value="{{nv.fitOn}}" hint-placeholder-val="{{ false }}"><button onClick="{{nv.fit}}" aria-label="Xem c\u1EA3 chuy\u1EBFn" title="Xem c\u1EA3 chuy\u1EBFn" class="btn glr" style="width: 54px; height: 54px; padding: 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"></path></svg></button></sc-if>
          <button onClick="{{nv.lyTap}}" aria-label="Ki\u1EC3u b\u1EA3n \u0111\u1ED3: {{nv.lyName}}" aria-expanded="{{nv.lyOpen}}" class="btn glr" style="width: 54px; height: 54px; padding: 0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#CFF6FF" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 8l10 5 10-5-10-5Z"></path><path d="m2 12 10 5 10-5"></path><path d="m2 16 10 5 10-5"></path></svg></button>
          <sc-if value="{{nv.lyOpen}}" hint-placeholder-val="{{ false }}">
            <div class="pnl glb" role="menu" aria-label="Ki\u1EC3u b\u1EA3n \u0111\u1ED3" style="position: absolute; right: 64px; top: 0; width: 190px; padding: 8px; display: flex; flex-direction: column; gap: 6px; z-index: 8">
              <sc-for list="{{nv.lyOpts}}" as="o" hint-placeholder-count="5"><button onClick="{{o.pick}}" role="menuitemradio" aria-checked="{{o.on}}" class="btn" style="height: 46px; justify-content: flex-start; padding: 0 12px; font-size: 16px; color: {{o.fg}}; background: {{o.bg}}">{{o.ic}} {{o.label}}</button></sc-for>
            </div>
          </sc-if>
          <button onClick="{{nv.compass}}" aria-label="La b\xE0n \u2014 v\u1EC1 v\u1ECB tr\xED xe, theo h\u01B0\u1EDBng xe ch\u1EA1y" class="btn glr" style="width: 54px; height: 54px; padding: 0"><svg id="tccompassN" width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" style="transition: transform 0.15s linear"><path d="M17 3 L22 17 L12 17 Z" fill="#FF5A4E"></path><path d="M17 31 L12 17 L22 17 Z" fill="#E8F1F5"></path><text x="17" y="12.5" text-anchor="middle" font-size="6.5" font-weight="800" fill="#FFFFFF" font-family="Overpass, sans-serif">N</text></svg></button>
        </div>
      </sc-if>

      <!-- ===== H\xC0NH TR\xCCNH (#63, #66) ===== -->
      <sc-if value="{{hj.min}}" hint-placeholder-val="{{ false }}"><button onClick="{{hj.toggle}}" class="pill glb" style="position: absolute; left: 20px; top: 140px; height: 44px; z-index: 6; background: rgba(4,18,30,0.8); color: #FFD08A">\u27A4 H\xE0nh Tr\xECnh \u25B8</button></sc-if>
      <sc-if value="{{hj.on}}" hint-placeholder-val="{{ false }}">
        <section aria-label="H\xE0nh Tr\xECnh" class="pnl glb" style="position: absolute; left: 20px; top: 138px; width: 392px; bottom: 92px; box-sizing: border-box; padding: 12px; display: flex; flex-direction: column; gap: 7px; z-index: 6; overflow: hidden">
          <div style="display: flex; align-items: center; gap: 8px"><span class="lbl" style="flex: 1">H\xC0NH TR\xCCNH</span><button onClick="{{hj.toggle}}" aria-label="Thu g\u1ECDn b\u1EA3ng" class="btn" style="width: 38px; height: 34px; padding: 0">\u25C0</button></div>
          <sc-if value="{{hj.habitOn}}" hint-placeholder-val="{{ false }}"><button onClick="{{hj.habitGo}}" style="border: 0; cursor: pointer; font-family: inherit; color: #E8F1F5; text-align: left; padding: 8px 12px; border-radius: 10px; background: rgba(251,176,64,0.14); box-shadow: inset 0 0 0 1px rgba(251,176,64,0.6); display: flex; align-items: center; gap: 8px"><span style="flex: 1; font-size: 14px">{{hj.habitL}}</span><span style="font-weight: 800; color: #FBB040">\u0110i \u27A4</span></button></sc-if>
          <sc-if value="{{hj.parkOn}}" hint-placeholder-val="{{ false }}">
            <div style="padding: 8px 10px; border-radius: 10px; background: rgba(47,107,245,0.14); box-shadow: inset 0 0 0 1px rgba(47,107,245,0.55); display: flex; flex-direction: column; gap: 6px">
              <button onClick="{{hj.parkSee}}" style="border: 0; background: transparent; padding: 0; cursor: pointer; font-family: inherit; color: #E8F1F5; text-align: left; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">\u{1F17F} {{hj.parkL}}</button>
              <div style="display: flex; gap: 6px; align-items: center"><span style="font-size: 11px; color: #8FC3D3">Nh\u1EAFc h\u1EBFt gi\u1EDD:</span><sc-for list="{{hj.parkRemind}}" as="k" hint-placeholder-count="3"><button onClick="{{k.tap}}" aria-pressed="{{k.on}}" class="pill" style="height: 28px; padding: 0 10px; font-size: 12px; background: {{k.bg}}; color: {{k.fg}}">{{k.l}}</button></sc-for><span style="font-size: 11px; color: #FFD08A">{{hj.parkR}}</span></div>
            </div>
          </sc-if>
          <div style="display: flex; flex-direction: column; gap: 0">
            <div style="display: flex; align-items: center; gap: 10px; height: 32px"><span style="width: 22px; height: 22px; border-radius: 11px; background: #14A05A; border: 2.5px solid #FFFFFF; box-sizing: border-box; flex-shrink: 0"></span><span style="font-size: 14px; color: #CFE6EE">T\u1EEB: V\u1ECB tr\xED hi\u1EC7n t\u1EA1i</span></div>
            <sc-for list="{{hj.wps}}" as="w" hint-placeholder-count="2">
              <div style="display: flex; flex-direction: column">
                <span aria-hidden="true" style="width: 0; height: 10px; margin-left: 10px; border-left: 2px dotted #A9C7D4"></span>
                <div style="display: flex; align-items: center; gap: 8px; min-height: 34px">
                  <span style="width: 22px; height: 22px; border-radius: 11px; background: {{w.bg}}; border: 2.5px solid #FFFFFF; box-sizing: border-box; flex-shrink: 0; color: #FFFFFF; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center">{{w.n}}</span>
                  <sc-if value="{{w.logoOn}}" hint-placeholder-val="{{ false }}"><img src="{{w.logo}}" alt="" style="width: 20px; height: 20px; border-radius: 4px; background: #FFFFFF"></sc-if>
                  <span style="flex: 1; min-width: 0; font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{w.name}}</span>
                  <button onClick="{{w.up}}" aria-label="L\xEAn" class="btn" style="width: 30px; height: 28px; padding: 0; font-size: 11px; opacity: {{w.upOp}}">\u25B2</button>
                  <button onClick="{{w.down}}" aria-label="Xu\u1ED1ng" class="btn" style="width: 30px; height: 28px; padding: 0; font-size: 11px; opacity: {{w.downOp}}">\u25BC</button>
                  <button onClick="{{w.del}}" aria-label="B\u1ECF \u0111i\u1EC3m n\xE0y" class="btn" style="width: 30px; height: 28px; padding: 0; color: #FF9A9E">\u2715</button>
                </div>
              </div>
            </sc-for>
          </div>
          <div style="position: relative">
            <input type="text" aria-label="\u0110i \u0111\xE2u?" value="{{hj.q}}" placeholder="{{hj.ph}}" disabled="{{hj.lock}}" onInput="{{hj.type}}" style="width: 100%; box-sizing: border-box; height: 46px; border: 0; border-radius: 10px; padding: 0 14px; font-family: inherit; font-size: 16px; background: rgba(13,44,64,0.92); color: #FFFFFF; box-shadow: inset 0 0 0 1px rgba(251,176,64,0.55); outline: none">
          </div>
          <sc-if value="{{hj.resOn}}" hint-placeholder-val="{{ false }}">
            <div class="scrl" style="max-height: 220px; display: flex; flex-direction: column; gap: 2px; background: rgba(4,18,30,0.9); border-radius: 10px; padding: 4px">
              <sc-for list="{{hj.res}}" as="r" hint-placeholder-count="3"><button onClick="{{r.pick}}" style="flex-shrink: 0; width: 100%; border: 0; background: transparent; cursor: pointer; font-family: inherit; color: #E8F1F5; display: flex; align-items: center; gap: 10px; padding: 6px 8px; border-radius: 8px; text-align: left"><span style="width: 34px; height: 34px; border-radius: 8px; background: {{r.icBg}}; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; overflow: hidden"><sc-if value="{{r.logoOn}}" hint-placeholder-val="{{ false }}"><img src="{{r.logo}}" alt="" style="width: 28px; height: 28px; object-fit: contain"></sc-if><sc-if value="{{r.icOn}}" hint-placeholder-val="{{ true }}"><span>{{r.icon}}</span></sc-if></span><span style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.name}}</span><span style="font-size: 11px; color: #8FC3D3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.sub}}</span></span><span style="font-size: 11px; color: #FFD08A; white-space: nowrap">{{r.km}}</span></button></sc-for>
            </div>
          </sc-if>
          <sc-if value="{{hj.wpOn}}" hint-placeholder-val="{{ false }}"><div style="display: flex; gap: 6px"><sc-if value="{{hj.tidyOn}}" hint-placeholder-val="{{ false }}"><button onClick="{{hj.tidy}}" class="btn" style="flex: 1; height: 40px; font-size: 13px">S\u1EAFp X\u1EBFp G\u1ECDn</button></sc-if><button onClick="{{nv.start}}" class="btn btn-o" style="flex: 1; height: 40px; font-size: 15px">B\u1EAFt \u0110\u1EA7u</button></div></sc-if>
          <div role="tablist" style="display: flex; gap: 4px"><sc-for list="{{hj.tabs}}" as="t" hint-placeholder-count="4"><button onClick="{{t.tap}}" role="tab" aria-selected="{{t.on}}" class="pill" style="flex: 1; height: 34px; padding: 0 4px; font-size: 13px; background: {{t.bg}}; color: {{t.fg}}">{{t.l}}</button></sc-for></div>
          <div class="scrl" style="flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 4px">
            <sc-if value="{{hj.emptyOn}}" hint-placeholder-val="{{ false }}"><span style="font-size: 13px; color: #8FC3D3; padding: 10px 4px; line-height: 1.45">{{hj.empty}}</span></sc-if>
            <sc-if value="{{hj.workOn}}" hint-placeholder-val="{{ false }}"><button onClick="{{hj.workSet}}" class="btn" style="flex-shrink: 0; height: 36px; font-size: 13px">\u{1F4BC} L\u01B0u ch\u1ED7 \u0111ang \u0111\u1EADu l\xE0 Ch\u1ED7 L\xE0m</button></sc-if>
            <sc-if value="{{hj.rowsOn}}" hint-placeholder-val="{{ false }}">
              <sc-for list="{{hj.rows}}" as="r" hint-placeholder-count="4">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; background: rgba(255,255,255,0.04)">
                  <span style="width: 36px; height: 36px; border-radius: 8px; background: {{r.icBg}}; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; overflow: hidden"><sc-if value="{{r.logoOn}}" hint-placeholder-val="{{ false }}"><img src="{{r.logo}}" alt="" style="width: 30px; height: 30px; object-fit: contain"></sc-if><sc-if value="{{r.icOn}}" hint-placeholder-val="{{ true }}"><span>{{r.icon}}</span></sc-if></span>
                  <button onClick="{{r.pick}}" style="flex: 1; min-width: 0; border: 0; background: transparent; padding: 0; cursor: pointer; font-family: inherit; color: #E8F1F5; text-align: left; display: flex; flex-direction: column"><span style="font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%">{{r.name}}</span><span style="font-size: 11px; color: #8FC3D3">{{r.sub}}</span></button>
                  <button onClick="{{r.addStop}}" aria-label="Th\xEAm l\xE0m \u0111i\u1EC3m d\u1EEBng" class="btn" style="width: 34px; height: 34px; padding: 0; font-size: 16px">\uFF0B</button>
                  <sc-if value="{{r.actOn}}" hint-placeholder-val="{{ false }}"><button onClick="{{r.act}}" aria-label="{{r.actA}}" class="btn" style="width: 34px; height: 34px; padding: 0">{{r.actL}}</button></sc-if>
                  <button onClick="{{r.go}}" aria-label="\u0110i t\u1EDBi \u0111\xE2y" class="btn btn-o" style="width: 40px; height: 34px; padding: 0">\u27A4</button>
                </div>
              </sc-for>
            </sc-if>
            <sc-if value="{{hj.logOn}}" hint-placeholder-val="{{ false }}">
              <sc-for list="{{hj.logRows}}" as="l" hint-placeholder-count="3">
                <div style="flex-shrink: 0; display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; background: {{l.bg}}">
                  <button onClick="{{l.show}}" aria-pressed="{{l.on}}" style="flex: 1; min-width: 0; border: 0; background: transparent; padding: 0; cursor: pointer; font-family: inherit; color: #E8F1F5; text-align: left; display: flex; flex-direction: column"><span style="font-size: 11px; color: #8FC3D3">{{l.when}}</span><span style="font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%">{{l.name}}</span><span style="font-size: 11px; color: #FFD08A">{{l.km}}</span></button>
                  <button onClick="{{l.del}}" aria-label="Xo\xE1 chuy\u1EBFn n\xE0y" class="btn" style="width: 34px; height: 34px; padding: 0; color: #FF9A9E">\u2715</button>
                </div>
              </sc-for>
            </sc-if>
          </div>
          <sc-if value="{{hj.logOn}}" hint-placeholder-val="{{ false }}"><div style="display: flex; gap: 6px; align-items: center"><span style="flex: 1; font-size: 11px; color: #8FC3D3">Ch\u1EC9 l\u01B0u trong m\xE1y n\xE0y</span><button onClick="{{hj.logToggle}}" class="btn" style="height: 34px; font-size: 12px">{{hj.logOnL}}</button><button onClick="{{hj.clear}}" class="btn" style="height: 34px; font-size: 12px; color: #FF9A9E">{{hj.clearL}}</button></div></sc-if>
        </section>
      </sc-if>

      <!-- ===== ROAD TRIP tr\xEAn b\u1EA3n \u0111\u1ED3 (#59) ===== -->
      <sc-if value="{{rtp.min}}" hint-placeholder-val="{{ false }}"><button onClick="{{rtp.toggle}}" class="pill glb" style="position: absolute; left: 20px; top: 140px; height: 44px; z-index: 6; background: rgba(4,18,30,0.8); color: #FFD08A">\u{1F5FA} Road Trip \u25B8</button></sc-if>
      <sc-if value="{{rtp.on}}" hint-placeholder-val="{{ false }}">
        <section aria-label="Road Trip" class="pnl glb" style="position: absolute; left: 20px; top: 138px; width: 392px; bottom: 92px; box-sizing: border-box; padding: 12px; display: flex; flex-direction: column; gap: 7px; z-index: 6; overflow: hidden">
          <div style="display: flex; align-items: center; gap: 8px"><span style="flex: 1; min-width: 0; font-size: 18px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{rtp.title}}</span><button onClick="{{rtp.toggle}}" aria-label="Thu g\u1ECDn b\u1EA3ng" class="btn" style="width: 38px; height: 34px; padding: 0">\u25C0</button></div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap">
            <sc-for list="{{rtp.legs}}" as="c" hint-placeholder-count="2"><button onClick="{{c.pick}}" aria-pressed="{{c.on}}" class="pill" style="height: 34px; padding: 0 12px; font-size: 13px; background: {{c.bg}}; color: {{c.fg}}">{{c.label}}</button></sc-for>
            <button onClick="{{rtp.openTrips}}" class="btn" style="height: 34px; font-size: 13px">C\xE1c Chuy\u1EBFn \u25BE</button>
            <button onClick="{{rtp.newTrip}}" class="btn" style="height: 34px; font-size: 13px; color: #FFD08A">{{rtp.newL}}</button>
          </div>
          <sc-if value="{{rtp.formOn}}" hint-placeholder-val="{{ false }}">
            <div style="padding: 10px; border-radius: 10px; background: rgba(4,18,30,0.75); box-shadow: inset 0 0 0 1px rgba(251,176,64,0.5); display: flex; flex-direction: column; gap: 6px">
              <label style="display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: #8FC3D3">T\u1EEB<input type="text" value="{{rtp.from}}" placeholder="{{rtp.fromPh}}" disabled="{{rtp.lock}}" onClick="{{rtp.focusFrom}}" onInput="{{rtp.typeFrom}}" style="height: 42px; border: 0; border-radius: 8px; padding: 0 12px; font-family: inherit; font-size: 15px; background: #0D2C40; color: #E8F1F5"></label>
              <sc-if value="{{rtp.resFromOn}}" hint-placeholder-val="{{ false }}"><div class="scrl" style="max-height: 170px; display: flex; flex-direction: column; gap: 2px"><sc-for list="{{rtp.resFrom}}" as="r" hint-placeholder-count="2"><button onClick="{{r.pick}}" style="flex-shrink: 0; border: 0; background: rgba(255,255,255,0.04); cursor: pointer; font-family: inherit; color: #E8F1F5; display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; text-align: left"><span style="width: 28px; height: 28px; border-radius: 6px; background: {{r.icBg}}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden"><sc-if value="{{r.logoOn}}" hint-placeholder-val="{{ false }}"><img src="{{r.logo}}" alt="" style="width: 24px; height: 24px; object-fit: contain"></sc-if><sc-if value="{{r.icOn}}" hint-placeholder-val="{{ true }}"><span>{{r.icon}}</span></sc-if></span><span style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.name}}</span><span style="font-size: 11px; color: #8FC3D3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.sub}}</span></span></button></sc-for></div></sc-if>
              <label style="display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: #8FC3D3">T\u1EDBi<input type="text" value="{{rtp.to}}" placeholder="Vd: Adelaide, Bunnings Sunshine\u2026" disabled="{{rtp.lock}}" onInput="{{rtp.typeTo}}" style="height: 42px; border: 0; border-radius: 8px; padding: 0 12px; font-family: inherit; font-size: 15px; background: #0D2C40; color: #E8F1F5"></label>
              <sc-if value="{{rtp.resToOn}}" hint-placeholder-val="{{ false }}"><div class="scrl" style="max-height: 170px; display: flex; flex-direction: column; gap: 2px"><sc-for list="{{rtp.resTo}}" as="r" hint-placeholder-count="2"><button onClick="{{r.pick}}" style="flex-shrink: 0; border: 0; background: rgba(255,255,255,0.04); cursor: pointer; font-family: inherit; color: #E8F1F5; display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; text-align: left"><span style="width: 28px; height: 28px; border-radius: 6px; background: {{r.icBg}}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden"><sc-if value="{{r.logoOn}}" hint-placeholder-val="{{ false }}"><img src="{{r.logo}}" alt="" style="width: 24px; height: 24px; object-fit: contain"></sc-if><sc-if value="{{r.icOn}}" hint-placeholder-val="{{ true }}"><span>{{r.icon}}</span></sc-if></span><span style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.name}}</span><span style="font-size: 11px; color: #8FC3D3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.sub}}</span></span><span style="font-size: 11px; color: #FFD08A">{{r.km}}</span></button></sc-for></div></sc-if>
              <label style="display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: #8FC3D3">T\xEAn chuy\u1EBFn<input type="text" value="{{rtp.name}}" placeholder="{{rtp.namePh}}" onInput="{{rtp.setName}}" style="height: 40px; border: 0; border-radius: 8px; padding: 0 12px; font-family: inherit; font-size: 15px; background: #0D2C40; color: #E8F1F5"></label>
              <button onClick="{{rtp.create}}" disabled="{{rtp.lock}}" class="btn btn-o" style="height: 44px; font-size: 16px">{{rtp.createL}}</button>
              <span style="font-size: 12px; color: #FFD08A">{{rtp.lockL}}{{rtp.msg}}</span>
            </div>
          </sc-if>
          <sc-if value="{{rtp.mainOn}}" hint-placeholder-val="{{ true }}">
          <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px">
            <sc-for list="{{rtp.boxes}}" as="b" hint-placeholder-count="3"><div style="border-radius: 8px; background: rgba(255,255,255,0.05); padding: 5px 4px; display: flex; flex-direction: column; align-items: center; text-align: center"><span class="lbl" style="font-size: 9px">{{b.l}}</span><span style="font-size: 16px; font-weight: 800; white-space: nowrap">{{b.v}}</span><span style="font-size: 10px; color: #8FC3D3; white-space: nowrap">{{b.s}}</span></div></sc-for>
          </div>
          <button onClick="{{rtp.openLog}}" aria-label="Ti\u1EBFn \u0111\u1ED9 chuy\u1EBFn \u2014 b\u1EA5m xem nh\u1EADt k\xFD" style="border: 0; background: transparent; padding: 0; cursor: pointer; font-family: inherit; color: #E8F1F5; display: flex; flex-direction: column; gap: 4px; text-align: left">
            <span style="display: block; width: 100%; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.1); overflow: hidden"><span style="display: block; height: 100%; width: {{rtp.pct}}%; background: linear-gradient(90deg, #7BD88F, #FBB040)"></span></span>
            <span style="display: flex; gap: 8px; font-size: 12px; width: 100%"><span style="color: #CFE6EE; flex: 1">{{rtp.pctL}}</span><span style="color: #FFD08A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 210px">Ch\u1EB7ng k\u1EBF: {{rtp.nx}} \xB7 {{rtp.nxKm}}</span></span>
          </button>
          <div class="lbl" style="display: flex; align-items: center"><span style="flex: 1">C\xC1C CH\u1EB6NG GH\xC9 \xB7 {{rtp.count}}</span></div>
          <div class="scrl" style="flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 4px">
            <sc-for list="{{rtp.stops}}" as="s" hint-placeholder-count="5">
              <div class="{{s.cls}}" style="flex-shrink: 0; display: flex; align-items: center; gap: 6px; padding: 6px; border-radius: 8px; background: {{s.bg}}; opacity: {{s.op}}">
                <div style="width: 28px; height: 28px; border-radius: 4px; background: {{s.sign}}; border: 2px solid #FFFFFF; box-sizing: border-box; display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="15" height="15" viewBox="0 0 24 24" fill="{{s.icF}}" stroke="{{s.icS}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{s.icon}}"></path></svg></div>
                <button onClick="{{s.open}}" style="flex: 1; min-width: 0; border: 0; background: transparent; padding: 0; cursor: pointer; font-family: inherit; color: #E8F1F5; text-align: left; display: flex; flex-direction: column"><span style="font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; text-decoration: {{s.strike}}">{{s.name}}</span><span style="font-size: 11px"><span style="color: {{s.distC}}; font-weight: 700">{{s.dist}}</span> <span style="color: #8FC3D3">{{s.eta}}</span></span></button>
                <button onClick="{{s.up}}" aria-label="L\xEAn" class="btn" style="width: 28px; height: 26px; padding: 0; font-size: 10px">\u25B2</button>
                <button onClick="{{s.down}}" aria-label="Xu\u1ED1ng" class="btn" style="width: 28px; height: 26px; padding: 0; font-size: 10px">\u25BC</button>
                <button onClick="{{s.skip}}" aria-label="B\u1ECF qua chuy\u1EBFn n\xE0y" class="btn" style="width: 28px; height: 26px; padding: 0; font-size: 11px">{{s.skipL}}</button>
                <button onClick="{{s.del}}" aria-label="Xo\xE1 ch\u1EB7ng" class="btn" style="width: 28px; height: 26px; padding: 0; color: #FF9A9E; font-size: 11px">\u2715</button>
              </div>
            </sc-for>
          </div>
          <div style="display: flex; gap: 6px"><button onClick="{{rtp.addStop}}" class="btn" style="flex: 1; height: 36px; font-size: 12px">+ Th\xEAm Ch\u1EB7ng</button><button onClick="{{rtp.pickStop}}" class="btn" style="flex: 1; height: 36px; font-size: 12px">+ T\u1EEB Danh S\xE1ch</button></div>
          <div style="flex-shrink: 0; display: flex; gap: 4px; align-items: center; font-size: 12px; color: #CFE6EE">
            <span class="tnum" style="white-space: nowrap">A <b style="color: #FFFFFF">{{rtp.a}}</b></span><button onClick="{{rtp.resetA}}" aria-label="\u0110\u1EB7t l\u1EA1i Trip A" class="btn" style="width: 28px; height: 28px; padding: 0">\u21BA</button>
            <span class="tnum" style="white-space: nowrap; margin-left: 4px">B <b style="color: #FFFFFF">{{rtp.b}}</b></span><button onClick="{{rtp.resetB}}" aria-label="\u0110\u1EB7t l\u1EA1i Trip B" class="btn" style="width: 28px; height: 28px; padding: 0">\u21BA</button>
            <button onClick="{{rtp.off}}" class="btn" style="flex: 1; min-width: 0; height: 28px; font-size: 11px; color: #A9E3F2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{rtp.offL}}</button>
          </div>
          </sc-if>
          <button onClick="{{rtp.start}}" class="btn" style="height: 50px; font-size: 16px; font-weight: 800; background: {{rtp.startBg}}; color: {{rtp.startFg}}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{rtp.startL}}</button>
        </section>
      </sc-if>

      <!-- s\u1ED1 t\u1ED1c \u0111\u1ED9 (canh gi\u1EEFa, \u0111\u1ED5i ki\u1EC3u \u0111\u01B0\u1EE3c) + bi\u1EC3n gi\u1EDBi h\u1EA1n theo v\xF9ng -->
      <div style="display: {{spdDisp}}; position: absolute; left: 440px; top: 130px; width: 400px; height: 310px; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border-radius: 50%; background: radial-gradient(closest-side, rgba(1,6,10,0.72), rgba(1,6,10,0.45) 60%, rgba(1,6,10,0))">
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
      <sc-if value="{{townOn}}" hint-placeholder-val="{{ false }}"><div class="fadein" aria-live="polite" style="position: absolute; left: 50%; top: 92px; transform: translateX(-50%); background: #1F5FAE; border: 3px solid #FFFFFF; border-radius: 8px; padding: 6px 22px; font-family: Overpass, sans-serif; font-weight: 800; font-size: 22px; color: #FFFFFF; box-shadow: 0 6px 20px rgba(0,0,0,0.5); white-space: nowrap">{{townL}}</div></sc-if>
      <sc-if value="{{sb.limShow}}" hint-placeholder-val="{{ true }}">
      <div style="display: {{spdDisp}}; position: absolute; left: 826px; top: 196px; flex-direction: column; align-items: center; gap: 4px">
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
        <button onClick="{{startListen}}" aria-label="Tr\u1EE3 l\xFD gi\u1ECDng n\xF3i ({{micA}})" class="{{micCls}}" style="width: 128px; height: 64px; padding: 0; border: 0; background: transparent; display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer"><svg width="28" height="40" viewBox="0 0 28 40" aria-hidden="true"><path class="mw mw2" d="M6 14v12" stroke="{{micW}}" stroke-width="3" stroke-linecap="round"></path><path class="mw" d="M14 8v24" stroke="{{micW}}" stroke-width="3" stroke-linecap="round"></path><path class="mw mw2" d="M22 4v32" stroke="{{micW}}" stroke-width="3" stroke-linecap="round"></path></svg><span style="width: 60px; height: 60px; border-radius: 50%; background: {{micBg}}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.45)"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3" fill="#FFFFFF"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path><sc-if value="{{micOff}}" hint-placeholder-val="{{ false }}"><path d="M3 3l18 18" stroke="#FFFFFF" stroke-width="2.6"></path></sc-if></svg></span><svg width="28" height="40" viewBox="0 0 28 40" aria-hidden="true"><path class="mw mw2" d="M6 4v32" stroke="{{micW}}" stroke-width="3" stroke-linecap="round"></path><path class="mw" d="M14 8v24" stroke="{{micW}}" stroke-width="3" stroke-linecap="round"></path><path class="mw mw2" d="M22 14v12" stroke="{{micW}}" stroke-width="3" stroke-linecap="round"></path></svg></button>
        <div class="pnl glb" style="width: 120px; height: 64px; display: flex; flex-direction: column; align-items: center; justify-content: center"><span class="lbl">NHI\u1EC6T M\xC1Y</span><span style="font-size: 20px; font-weight: 700">{{engT}}</span><sc-if value="{{obdHintOn}}" hint-placeholder-val="{{ false }}"><span style="font-size: 10px; font-weight: 700; color: #FBB040; white-space: nowrap">{{obdHint}}</span></sc-if></div>
        <div class="pnl glb" style="width: 120px; height: 64px; display: flex; flex-direction: column; align-items: center; justify-content: center"><span class="lbl">B\xCCNH \u0110I\u1EC6N</span><span style="font-size: 20px; font-weight: 700">{{voltT}}</span></div>
      </div>
      <sc-if value="{{upCardOn}}" hint-placeholder-val="{{ false }}">
        <div class="pnl glb dimbox" style="position: absolute; right: 20px; bottom: 102px; width: 300px; height: 56px; padding: 0 16px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; opacity: {{opBottom}}"><span class="lbl">{{upL}}</span><span style="font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{upMain}}</span></div>
      </sc-if>


      <!-- \u0111\u1ED3ng h\u1ED3 t\u1ED1c \u0111\u1ED9 c\u1ED1 \u0111\u1ECBnh gi\u1EEFa \u0111\xE1y m\xE0n h\xECnh (#46) + bi\u1EC3n gi\u1EDBi h\u1EA1n s\xE1t b\xEAn -->
      <sc-if value="{{dk.on}}" hint-placeholder-val="{{ true }}">
        <button onClick="{{sb.tap}}" class="glr" aria-label="T\u1ED1c \u0111\u1ED9 {{sb.num}} {{sb.unit}} \u2014 ch\u1EA1m xem chuy\u1EBFn h\xF4m nay" style="position: absolute; left: 585px; bottom: 8px; width: 110px; height: 110px; border: 0; padding: 0; cursor: pointer; color: #FFFFFF; font-family: inherit; display: flex; align-items: center; justify-content: center">
          <svg width="110" height="110" viewBox="0 0 150 150" aria-hidden="true" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0"><circle cx="75" cy="75" r="62" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="9" stroke-dasharray="292 390" transform="rotate(135 75 75)" stroke-linecap="round"></circle><circle cx="75" cy="75" r="62" fill="none" stroke="{{dk.arcC2}}" stroke-width="9" stroke-dasharray="{{dk.arc2}}" transform="rotate(135 75 75)" stroke-linecap="round"></circle></svg>
          <span style="text-align: center; position: relative"><span class="tnum" style="display: block; font-size: 38px; font-weight: 200; line-height: 1; color: {{dk.numC}}">{{sb.num}}</span><span style="display: block; font-size: 9px; letter-spacing: 2px; opacity: 0.85; margin-top: 2px">{{dk.unit}}</span></span>
        </button>
        <sc-if value="{{sb.limShow}}" hint-placeholder-val="{{ true }}"><button onClick="{{sb.limTap}}" aria-label="{{sb.limAria}}" style="border: 0; background: transparent; padding: 0; cursor: pointer; font-family: inherit; position: absolute; left: 524px; bottom: 30px; display: flex; flex-direction: column; align-items: center; gap: 3px"><div style="width: 42px; height: 54px; background: #FFFFFF; border-radius: 5px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35)"><div style="width: 36px; height: 36px; border-radius: 50%; border: 4px solid #D0202E; box-sizing: border-box; color: #111; font-family: Overpass, sans-serif; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center">{{sb.lim}}</div></div><span style="font-size: 12px; font-weight: 700; color: {{sb.limNoteC}}; white-space: nowrap; text-shadow: 0 1px 3px #000">{{sb.limNote}}</span></button></sc-if>
        <div style="position: absolute; left: 640px; bottom: 128px; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 6px; pointer-events: none">
          <sc-if value="{{sb.ahead}}" hint-placeholder-val="{{ false }}"><div class="pnl glb fadein" style="padding: 6px 14px; font-size: 14px; color: #FFD08A; text-align: center; white-space: nowrap">Ph\xEDa tr\u01B0\u1EDBc 300 m: {{sb.aheadL}}</div></sc-if>
          <sc-if value="{{sb.statsOpen}}" hint-placeholder-val="{{ false }}"><div class="pnl glb fadein" style="padding: 8px 14px; font-size: 13px; color: #CFE6EE; text-align: center; white-space: nowrap">{{sb.stats}}</div></sc-if>
        </div>
      </sc-if>
      <!-- thanh nh\u1EA1c: vi\xEAn thu\u1ED1c ki\u1EC3u Tom's Jukebox (\u0111\u0129a than tr\xE1i, t\xEAn gi\u1EEFa, \u23EE \u25B6 \u23ED b\xEAn ph\u1EA3i, thanh th\u1EDDi gian trong vi\xEAn thu\u1ED1c, s\xF3ng l\u1EE5a \u1EDF m\xE9p d\u01B0\u1EDBi) -->
      <div class="pnl dimbox jbpill {{mpCls}}" style="position: absolute; left: {{mpL}}; right: {{mpR}}; bottom: {{mpB}}px; width: {{mpW}}px; height: {{mpH}}px; padding: 0 12px 0 8px; box-sizing: border-box; border-radius: 40px; overflow: hidden; display: flex; align-items: center; gap: 12px; opacity: {{opMusic}}; box-shadow: inset 0 0 0 1.5px {{jb.ring}}; background: {{jb.bg}}">
        <svg aria-hidden="true" class="jbwave" viewBox="0 0 400 40" preserveAspectRatio="none" style="position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 26px; pointer-events: none; opacity: {{jb.waveOp}}"><path class="w1" d="{{jb.w1}}" fill="{{jb.wc1}}" opacity="0.55"></path><path class="w2" d="{{jb.w2}}" fill="{{jb.wc2}}" opacity="0.45"></path></svg>
        <button onClick="{{togglePanel}}" aria-label="Danh s\xE1ch b\xE0i v\xE0 \u0111\xE0i" style="position: relative; width: 60px; height: 60px; border: 0; padding: 0; border-radius: 50%; flex-shrink: 0; cursor: pointer; background: transparent">
          <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true" class="{{jb.discCls}}"><circle cx="30" cy="30" r="29" fill="#1A1A1A"></circle><circle cx="30" cy="30" r="22" fill="none" stroke="#2C2C2C" stroke-width="1"></circle><circle cx="30" cy="30" r="17" fill="none" stroke="#2C2C2C" stroke-width="1"></circle><circle cx="30" cy="30" r="11" fill="#FBB040"></circle><circle cx="30" cy="30" r="3" fill="#2A1A00"></circle></svg>
        </button>
        <div style="position: relative; flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; align-items: center">
          <span style="max-width: 100%; font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center">{{songTitle}}</span>
          <span style="max-width: 100%; font-size: 12px; color: #8FC3D3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center">{{songSub}}</span>
          <div style="width: 100%; display: flex; align-items: center; gap: 8px; font-size: 11px; color: #CFE6EE" class="tnum">
            <span>{{jb.posL}}</span>
            <span style="position: relative; flex: 1; height: 4px; border-radius: 2px; background: rgba(0,0,0,0.45)"><span style="position: absolute; left: 0; top: 0; bottom: 0; width: {{prog}}%; border-radius: 2px; background: {{jb.bar}}"></span><span style="position: absolute; top: -4px; left: calc({{prog}}% - 6px); width: 12px; height: 12px; border-radius: 50%; background: #FFFFFF"></span></span>
            <span>{{jb.durL}}</span>
          </div>
        </div>
        <button onClick="{{srcMenuTap}}" aria-label="Ch\u1ECDn ngu\u1ED3n nghe: nh\u1EA1c, radio, podcast" aria-expanded="{{srcMenuOn}}" class="pill" style="position: relative; height: 28px; padding: 0 8px; font-size: 10px; letter-spacing: 1px; background: rgba(13,44,64,0.8); color: #FFD08A; box-shadow: inset 0 0 0 1px rgba(251,176,64,0.6); flex-shrink: 0">{{srcL}} \u25BE</button>
        <button onClick="{{vo.tap}}" aria-label="{{vo.aria}}" aria-expanded="{{vo.onA}}" class="jbbtn" style="width: 40px; height: 40px; flex-shrink: 0; font-size: 18px; line-height: 1">{{vo.icon}}</button>
        <sc-if value="{{needPerm}}" hint-placeholder-val="{{ false }}">
          <button onClick="{{grantPerm}}" class="btn" style="position: relative; height: 34px; font-size: 11px; color: #FFD08A; box-shadow: inset 0 0 0 1px #FBB040; flex-shrink: 0">\u26A0 C\u1EA5p quy\u1EC1n</button>
        </sc-if>
        <sc-if value="{{jb.rec}}" hint-placeholder-val="{{ false }}">
          <button onClick="{{jb.recTap}}" aria-label="Th\xE2u \u0111\xE0i \u0111ang nghe" class="jbbtn" style="width: 40px; height: 40px; border-color: #E5484D"><span style="width: 14px; height: 14px; border-radius: 50%; background: #E5484D; display: block"></span></button>
        </sc-if>
        <div style="position: relative; display: flex; align-items: center; gap: 8px; flex-shrink: 0">
          <button onClick="{{togglePanel}}" aria-label="Danh s\xE1ch ph\xE1t" aria-expanded="{{panelExp}}" class="jbbtn" style="width: 40px; height: 40px"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h10v2H4z" fill="#FBB040"></path></svg></button>
          <button onClick="{{prevF}}" aria-label="{{prevLabel}}" class="jbbtn" style="width: 42px; height: 42px"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="3" height="14" rx="1" fill="#FBB040"></rect><path d="M19 5v14L9 12z" fill="#FBB040"></path></svg></button>
          <button onClick="{{togglePlay}}" aria-label="{{playLabel}}" class="jbbtn" style="width: 54px; height: 54px"><svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="{{playIcon}}" fill="#FBB040"></path></svg></button>
          <button onClick="{{nextF}}" aria-label="{{nextLabel}}" class="jbbtn" style="width: 42px; height: 42px"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5v14l10-7z" fill="#FBB040"></path><rect x="16" y="5" width="3" height="14" rx="1" fill="#FBB040"></rect></svg></button>
        </div>
      </div>


      <sc-if value="{{vo.on}}" hint-placeholder-val="{{ false }}">
        <div class="glc fadein" role="group" aria-label="\xC2m l\u01B0\u1EE3ng nh\u1EA1c" onPointerDown="{{vo.touch}}" style="pointer-events: auto; position: absolute; right: 20px; bottom: 96px; z-index: 9; padding: 10px 14px; display: flex; align-items: center; gap: 12px">
          <button onClick="{{vo.mute}}" aria-label="{{vo.muteA}}" class="jbbtn" style="width: 52px; height: 52px; font-size: 24px; line-height: 1">{{vo.icon}}</button>
          <button onClick="{{vo.down}}" aria-label="Nh\u1ECF l\u1EA1i 10%" class="pill" style="width: 58px; height: 52px; font-size: 30px; font-weight: 700; background: #0D2C40; color: #FBB040">\u2212</button>
          <div onPointerDown="{{vo.drag}}" role="slider" aria-label="K\xE9o \u0111\u1EC3 ch\u1EC9nh \xE2m l\u01B0\u1EE3ng" aria-valuenow="{{vo.p}}" aria-valuemin="0" aria-valuemax="100" style="pointer-events: auto; position: relative; width: 320px; height: 64px; touch-action: none; cursor: pointer">
            <span style="position: absolute; left: 0; right: 0; top: 28px; height: 8px; border-radius: 4px; background: rgba(0,0,0,0.5)"></span>
            <span style="position: absolute; left: 0; top: 28px; height: 8px; width: {{vo.p}}%; border-radius: 4px; background: #FBB040"></span>
            <span style="position: absolute; top: 15px; left: calc({{vo.p}}% - 17px); width: 34px; height: 34px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 1px 4px rgba(0,0,0,0.5)"></span>
          </div>
          <button onClick="{{vo.up}}" aria-label="To l\xEAn 10%" class="pill" style="width: 58px; height: 52px; font-size: 28px; font-weight: 700; background: #0D2C40; color: #FBB040">+</button>
          <span class="tnum" style="min-width: 58px; text-align: right; font-size: 20px; font-weight: 700; color: #FFFFFF">{{vo.pL}}</span>
        </div>
      </sc-if>
      <sc-if value="{{srcMenuOn}}" hint-placeholder-val="{{ false }}">
        <div class="glc fadein" role="menu" aria-label="Ch\u1ECDn ngu\u1ED3n nghe" style="position: absolute; left: {{srcMenuX}}px; bottom: 96px; z-index: 9; padding: 8px; display: flex; gap: 8px">
          <sc-for list="{{srcMenu}}" as="o" hint-placeholder-count="3"><button onClick="{{o.pick}}" role="menuitem" aria-pressed="{{o.on}}" class="pill" style="height: 48px; padding: 0 18px; font-size: 15px; background: {{o.bg}}; color: {{o.fg}}">{{o.label}}</button></sc-for>
        </div>
      </sc-if>
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
            <label style="flex: 1; display: flex"><span style="position: absolute; left: -9999px">T\xECm</span><input type="text" value="{{mp.q}}" onInput="{{mp.setQ}}" placeholder="{{mp.searchPh}}" disabled="{{kbLk}}" style="flex: 1; min-width: 0; height: 32px; padding: 0 10px; border: 0; border-radius: 6px; font-family: inherit; font-size: 13px; background: {{mp.searchBg}}; color: #E8F1F5"></label>
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

      <sc-if value="{{dimHint}}" hint-placeholder-val="{{ false }}">
        <div class="fadein" style="position: absolute; left: 50%; bottom: 130px; transform: translateX(-50%); font-size: 12px; color: #8FC3D3">Thanh d\u01B0\u1EDBi + thanh nh\u1EA1c t\u1EF1 m\u1EDD sau 5 gi\xE2y \u2014 ch\u1EA1m \u0111\u1EC3 s\xE1ng l\u1EA1i</div>
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
              <div class="pnl" onClick="{{r.rowTap}}" style="min-height: 62px; padding: 10px 16px; box-sizing: border-box; display: flex; align-items: center; gap: 14px; cursor: {{r.rowCur}}">
                <div style="flex: 1; min-width: 0"><div style="font-size: 15px; font-weight: 700">{{r.label}}</div><div style="font-size: 12px; color: #8FC3D3">{{r.hint}}</div></div>
                <sc-if value="{{r.isToggle}}" hint-placeholder-val="{{ true }}">
                  <button onClick="{{r.toggle}}" role="switch" aria-checked="{{r.on}}" aria-label="{{r.label}}" class="sw2" style="border: 0; padding: 0; cursor: pointer; background: {{r.trackBg}}"><span class="kn" style="left: {{r.knobX}}px">{{r.tick}}</span></button>
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

    <!-- ========== GIAO DI\u1EC6N: c\u1EA3nh, ki\u1EC3u v\u1EBD, bu\u1ED3ng l\xE1i, \u0111\u1ED3ng h\u1ED3 t\u1ED1c \u0111\u1ED9 ========== -->
    <sc-if value="{{isTheme}}" hint-placeholder-val="{{ false }}">
      <div class="scrl" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; overflow-y: auto; padding: 18px 24px 30px; box-sizing: border-box; background: radial-gradient(ellipse at 70% 0%,rgba(95,212,240,0.12),transparent 60%),#03111C">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px">
          <button onClick="{{goHome}}" aria-label="V\u1EC1 M\xE0n H\xECnh Ch\xEDnh" class="btn" style="width: 44px; padding: 0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg></button>
          <span style="font-size: 24px; font-weight: 700; color: #FBB040">Giao Di\u1EC7n</span>
          <span style="flex: 1"></span>
          <span class="lbl">KI\u1EC2U V\u1EBC</span>
          <sc-for list="{{th.styles}}" as="o" hint-placeholder-count="2"><button onClick="{{o.pick}}" aria-pressed="{{o.on}}" class="pill" style="height: 38px; padding: 0 14px; background: {{o.bg}}; color: {{o.fg}}">{{o.label}}</button></sc-for>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; margin: 4px 0 6px"><span class="lbl">N\u1EC0N M\xC0N H\xCCNH CH\xCDNH</span><sc-for list="{{th.homeBg}}" as="o" hint-placeholder-count="2"><button onClick="{{o.pick}}" aria-pressed="{{o.on}}" class="pill" style="height: 40px; padding: 0 16px; background: {{o.bg}}; color: {{o.fg}}">{{o.label}}</button></sc-for><span style="font-size: 12px; color: #8FC3D3">Ch\u1ECDn m\u1ED9t c\u1EA3nh b\xEAn d\u01B0\u1EDBi l\xE0 n\u1EC1n \u0111\u1ED5i sang low-poly \xB7 khi ch\u1EC9 \u0111\u01B0\u1EDDng lu\xF4n hi\u1EC7n b\u1EA3n \u0111\u1ED3</span></div>
        <sc-for list="{{th.groups}}" as="gp" hint-placeholder-count="4">
          <div style="margin: 10px 0 8px; font-size: 13px; font-weight: 800; letter-spacing: 1px; color: #FBB040">{{gp.label}}</div>
          <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px">
            <sc-for list="{{gp.items}}" as="it" hint-placeholder-count="6">
              <button onClick="{{it.pick}}" aria-pressed="{{it.on}}" style="border: 0; padding: 0; cursor: pointer; font-family: inherit; color: #E8F1F5; background: #0A1E2C; border-radius: 10px; overflow: hidden; box-shadow: {{it.ring}}; text-align: left">
                <span style="position: relative; display: block"><img src="{{it.img}}" alt="" style="display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; background: {{it.sw}}"><sc-if value="{{it.badgeOn}}" hint-placeholder-val="{{ false }}"><span onClick="{{it.drop}}" style="position: absolute; right: 6px; top: 6px; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; background: {{it.badgeBg}}; color: {{it.badgeFg}}">{{it.badge}}</span></sc-if></span>
                <span style="display: block; padding: 6px 8px; font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{it.label}}</span>
              </button>
            </sc-for>
          </div>
        </sc-for>
        <button onClick="{{th.toggleMore}}" aria-pressed="{{th.more}}" class="pill" style="margin-top: 14px; height: 44px; padding: 0 20px; background: #0D2C40; color: #FFD08A; box-shadow: inset 0 0 0 1px #FBB040">{{th.moreL}}</button>
        <div style="margin: 16px 0 8px; font-size: 13px; font-weight: 800; letter-spacing: 1px; color: #FBB040">M\xC0U TR\u1EE4 XE + TAPL\xD4</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px">
          <sc-for list="{{th.cockpits}}" as="o" hint-placeholder-count="12"><button onClick="{{o.pick}}" aria-pressed="{{o.on}}" class="pill" style="height: 40px; padding: 0 14px; background: {{o.bg}}; color: {{o.fg}}">{{o.label}}</button></sc-for>
        </div>
        <div style="margin-top: 16px; display: flex; flex-wrap: wrap; gap: 10px">
          <sc-for list="{{th.toggles}}" as="o" hint-placeholder-count="4"><button onClick="{{o.pick}}" role="switch" aria-checked="{{o.on}}" class="pnl" style="border: 0; cursor: pointer; font-family: inherit; color: #E8F1F5; height: 56px; padding: 0 14px; display: flex; align-items: center; gap: 12px; text-align: left"><span style="display: flex; flex-direction: column"><span style="font-size: 14px; font-weight: 700">{{o.label}}</span><span style="font-size: 11px; color: #8FC3D3">{{o.sub}}</span></span><span class="sw2" style="margin-left: 8px; background: {{o.swBg}}"><span class="kn" style="left: {{o.knobX}}px">{{o.tick}}</span></span></button></sc-for>
        </div>
        <div style="margin-top: 12px; font-size: 12px; color: #8FC3D3">{{th.note}}</div>
      </div>
    </sc-if>

    <!-- ========== 3. ROAD TRIP ========== -->
    <sc-if value="{{lf.open}}" hint-placeholder-val="{{ false }}">
      <div role="dialog" aria-label="B\xE1o s\u1ED1 t\u1ED1c \u0111\u1ED9 sai" class="pnl glb fadein" style="position: absolute; left: 50%; bottom: 120px; transform: translateX(-50%); z-index: 14; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; background: rgba(4,18,30,0.95); box-shadow: 0 20px 60px rgba(0,0,0,0.7), inset 0 0 0 1.5px rgba(251,176,64,0.7)">
        <div style="display: flex; align-items: center; gap: 10px"><span style="font-size: 18px; font-weight: 800; flex: 1">{{lf.title}}</span><button onClick="{{lf.close}}" class="btn" style="height: 38px">\u0110\xF3ng</button></div>
        <span style="font-size: 13px; color: #8FC3D3">{{lf.sub}}</span>
        <div style="display: flex; gap: 8px"><sc-for list="{{lf.opts}}" as="o" hint-placeholder-count="8"><button onClick="{{o.pick}}" aria-pressed="{{o.on}}" style="width: 64px; height: 64px; border-radius: 32px; border: 6px solid #D0202E; background: #FFFFFF; color: #111; font-family: inherit; font-size: 22px; font-weight: 800; cursor: pointer; box-shadow: {{o.ring}}">{{o.v}}</button></sc-for></div>
      </div>
    </sc-if>
    <sc-if value="{{pe.open}}" hint-placeholder-val="{{ false }}">
      <div role="dialog" aria-label="{{pe.title}}" class="pnl glb fadein" style="position: absolute; left: 50%; top: 90px; transform: translateX(-50%); width: 620px; z-index: 15; padding: 16px; display: flex; flex-direction: column; gap: 10px; background: rgba(4,18,30,0.97); box-shadow: 0 20px 50px rgba(0,0,0,0.6)">
        <div style="display: flex; align-items: center; gap: 10px"><span style="font-size: 20px; font-weight: 800; flex: 1">{{pe.title}}</span><button onClick="{{pe.close}}" class="btn" style="height: 40px">\u0110\xF3ng</button></div>
        <span style="font-size: 14px; color: #8FC3D3">{{pe.cur}}</span>
        <input type="text" aria-label="G\xF5 \u0111\u1ECBa ch\u1EC9" value="{{pe.q}}" placeholder="G\xF5 \u0111\u1ECBa ch\u1EC9, v\xED d\u1EE5 12 Nova Ave Truganina" onInput="{{pe.type}}" style="height: 52px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: #FFFFFF; font-family: inherit; font-size: 18px; padding: 0 14px; outline: none">
        <sc-if value="{{pe.busy}}" hint-placeholder-val="{{ false }}"><span style="font-size: 13px; color: #8FC3D3">{{pe.busyL}}</span></sc-if>
        <div class="scrl" style="max-height: 230px; display: flex; flex-direction: column; gap: 6px">
          <sc-for list="{{pe.res}}" as="r" hint-placeholder-count="3"><button onClick="{{r.pick}}" class="btn" style="flex-shrink: 0; height: auto; min-height: 52px; padding: 8px 12px; justify-content: flex-start; text-align: left; display: flex; flex-direction: column; align-items: flex-start; gap: 2px"><span style="font-size: 16px; font-weight: 700">\u{1F4CD} {{r.name}}</span><span style="font-size: 12px; color: #8FC3D3">{{r.sub}}</span></button></sc-for>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap">
          <button onClick="{{pe.here}}" class="btn btn-o" style="height: 50px; flex: 1">\u{1F4E1} D\xF9ng v\u1ECB tr\xED hi\u1EC7n t\u1EA1i</button>
          <button onClick="{{pe.onMap}}" class="btn" style="height: 50px; flex: 1">\u{1F5FA} Ch\u1ECDn tr\xEAn b\u1EA3n \u0111\u1ED3</button>
          <sc-if value="{{pe.has}}" hint-placeholder-val="{{ false }}"><button onClick="{{pe.del}}" class="btn" style="height: 50px; color: #FF9A8A">\u{1F5D1} Xo\xE1</button></sc-if>
        </div>
      </div>
    </sc-if>
    <sc-if value="{{pe.pickBar}}" hint-placeholder-val="{{ false }}">
      <div class="pnl" role="status" style="position: absolute; left: 50%; top: 150px; transform: translateX(-50%); z-index: 15; padding: 10px 14px; display: flex; align-items: center; gap: 12px; background: rgba(12,92,66,0.95)"><span style="font-size: 16px; font-weight: 700">\u{1F446} Ch\u1EA1m l\xEAn b\u1EA3n \u0111\u1ED3 ch\u1ED7 {{pe.what}}</span><button onClick="{{pe.cancelPick}}" class="btn" style="height: 40px">Hu\u1EF7</button></div>
    </sc-if>
    <!-- c\xE1c h\u1ED9p tho\u1EA1i Road Trip (b\u1EA3ng Road Trip n\u1EB1m tr\xEAn b\u1EA3n \u0111\u1ED3 \u1EDF M\xE0n H\xECnh Ch\xEDnh) -->
    <sc-if value="{{crashOn}}" hint-placeholder-val="{{ false }}">
      <div role="alertdialog" aria-label="App v\u1EEBa b\u1ECB t\u1EAFt b\u1EA5t ng\u1EDD" class="pnl glb fadein" style="position: absolute; left: 50%; top: 120px; transform: translateX(-50%); width: 560px; z-index: 30; padding: 22px 24px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px; background: rgba(4,18,30,0.96); box-shadow: 0 20px 60px rgba(0,0,0,0.7), inset 0 0 0 1.5px rgba(251,176,64,0.7)">
        <div style="font-size: 22px; font-weight: 800; color: #FBB040">App V\u1EEBa B\u1ECB T\u1EAFt B\u1EA5t Ng\u1EDD</div>
        <div style="font-size: 15px; color: #CFE6EE; line-height: 1.5">Tom's Car \u0111\xE3 t\u1EF1 m\u1EDF l\u1EA1i. B\u1EA5m G\u1EEDi B\xE1o L\u1ED7i \u0111\u1EC3 g\u1EEDi l\xFD do cho Tom's Technology Solutions (kh\xF4ng k\xE8m d\u1EEF li\u1EC7u ri\xEAng).</div>
        <div style="display: flex; gap: 10px; justify-content: flex-end"><button onClick="{{crashClose}}" class="btn" style="height: 48px; padding: 0 20px; font-size: 15px">\u0110\xF3ng</button><button onClick="{{crashSend}}" class="btn btn-o" style="height: 48px; padding: 0 22px; font-size: 15px; font-weight: 800">G\u1EEDi B\xE1o L\u1ED7i</button></div>
      </div>
    </sc-if>
    <sc-if value="{{rtDlgOn}}" hint-placeholder-val="{{ false }}">
      <sc-if value="{{tp.open}}" hint-placeholder-val="{{ false }}">
        <div role="dialog" aria-label="C\xE1c Chuy\u1EBFn" class="pnl glb fadein" style="position: absolute; left: 50%; top: 70px; transform: translateX(-50%); width: 720px; max-height: 560px; z-index: 12; padding: 16px 18px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; background: rgba(4,18,30,0.94); box-shadow: 0 20px 60px rgba(0,0,0,0.7), inset 0 0 0 1.5px rgba(251,176,64,0.75)">
          <div style="display: flex; align-items: center; gap: 10px"><span style="font-size: 22px; font-weight: 800; color: #FBB040; flex: 1">C\xE1c Chuy\u1EBFn</span><button onClick="{{tp.newTrip}}" class="btn" style="height: 40px; color: #FFD08A">+ Chuy\u1EBFn M\u1EDBi</button><button onClick="{{tp.close}}" class="btn" style="height: 40px">\u0110\xF3ng</button></div>
          <div class="scrl" style="flex: 1; min-height: 0; max-height: 420px; display: flex; flex-direction: column; gap: 8px">
            <sc-for list="{{tp.rows}}" as="t" hint-placeholder-count="2">
              <div style="flex-shrink: 0; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: rgba(13,44,64,0.55); box-shadow: {{t.ring}}">
                <div style="flex: 1; min-width: 0"><div style="font-size: 16px; font-weight: 700; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow-wrap: anywhere">{{t.name}}</div><div style="font-size: 12px; color: #8FC3D3">{{t.sub}}</div></div>
                <button onClick="{{t.pick}}" aria-pressed="{{t.on}}" class="pill" style="flex-shrink: 0; background: {{t.curBg}}; color: {{t.curFg}}">{{t.curL}}</button>
                <sc-if value="{{t.edit}}" hint-placeholder-val="{{ false }}"><div style="display: flex; gap: 4px; flex-shrink: 0"><button onClick="{{t.pin}}" class="btn" aria-label="Ghim" style="height: 36px; width: 40px; padding: 0">\u{1F4CC}</button><button onClick="{{t.rename}}" class="btn" style="height: 36px; font-size: 13px">S\u1EEDa T\xEAn</button><button onClick="{{t.copy}}" class="btn" style="height: 36px; font-size: 13px">Ch\xE9p</button><button onClick="{{t.del}}" class="btn" style="height: 36px; font-size: 13px; color: #FF9A9E">{{t.delL}}</button></div></sc-if>
              </div>
            </sc-for>
          </div>
          <sc-if value="{{tp.editing}}" hint-placeholder-val="{{ false }}"><div style="display: flex; gap: 8px; align-items: center"><label style="flex: 1; display: flex; gap: 8px; align-items: center; font-size: 13px; color: #8FC3D3">T\xEAn m\u1EDBi<input type="text" value="{{tp.editName}}" onInput="{{tp.setEditName}}" style="flex: 1; height: 40px; border: 0; border-radius: 8px; padding: 0 12px; font-family: inherit; font-size: 15px; background: #0D2C40; color: #E8F1F5"></label><button onClick="{{tp.saveName}}" class="btn btn-o" style="height: 40px">L\u01B0u</button></div></sc-if>
        </div>
      </sc-if>

      <sc-if value="{{od.logOpen}}" hint-placeholder-val="{{ false }}">
        <div role="dialog" aria-label="Nh\u1EADt k\xFD Road Trip" class="pnl fadein" style="position: absolute; left: 50%; top: 70px; transform: translateX(-50%); width: 820px; height: 560px; z-index: 12; padding: 16px 18px; box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; background: #06192A; box-shadow: 0 20px 60px rgba(0,0,0,0.7)">
          <div style="display: flex; align-items: center; gap: 10px"><span style="font-size: 22px; font-weight: 700; color: #FBB040; flex: 1">Nh\u1EADt K\xFD Road Trip</span><button onClick="{{od.closeLog}}" class="btn" style="height: 40px">\u0110\xF3ng</button></div>
          <div style="display: flex; gap: 16px; font-size: 14px; color: #7BD88F"><span>{{od.totGo}}</span><span>{{od.totBack}}</span></div>
          <span style="font-size: 12px; color: #8FC3D3">M\u1ED7i l\u1EA7n ch\u1EA1y r\u1ED3i \u0111\u1EADu xe h\u01A1n 10 ph\xFAt l\xE0 m\u1ED9t ch\u1EB7ng \u2014 km \u0111o b\u1EB1ng GPS, so v\u1EDBi km \u01B0\u1EDBc t\xEDnh tr\xEAn tuy\u1EBFn.</span>
          <sc-if value="{{od.logEmpty}}" hint-placeholder-val="{{ false }}"><span style="font-size: 15px; color: #CFE6EE; padding: 20px 0">Ch\u01B0a c\xF3 ch\u1EB7ng n\xE0o \u2014 ch\u1EA1y xe l\xE0 app t\u1EF1 ghi.</span></sc-if>
          <div class="scrl" style="flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 4px">
            <sc-for list="{{od.logRows}}" as="l" hint-placeholder-count="3"><div style="flex-shrink: 0; display: grid; grid-template-columns: 110px 90px 80px 120px 70px 70px 80px 1fr; gap: 8px; align-items: center; padding: 6px 8px; border-radius: 6px; background: rgba(13,44,64,0.55); font-size: 13px"><span>{{l.t}}</span><span style="color: #8FC3D3">{{l.dir}}</span><b style="color: #FFD08A">{{l.km}}</b><span style="color: #8FC3D3">{{l.est}}</span><span>{{l.diff}}</span><span>{{l.time}}</span><span>{{l.avg}}</span><span style="color: #8FC3D3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{l.place}}</span></div></sc-for>
          </div>
        </div>
      </sc-if>
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
        <label style="flex: 1; display: flex"><span style="position: absolute; left: -9999px">T\xECm ch\u1ED7</span><input type="text" value="{{searchQ}}" onInput="{{setSearchQ}}" placeholder="{{searchPh}}" disabled="{{kbLk}}" style="flex: 1; height: 46px; box-sizing: border-box; padding: 0 14px; border: 0; border-radius: 8px; font-family: inherit; font-size: 15px; background: {{searchBg}}; color: #E8F1F5; box-shadow: inset 0 0 0 1px rgba(95,212,240,0.55)"></label>
        <button onClick="{{doSearchQ}}" disabled="{{kbLk}}" class="btn btn-o" style="height: 46px">T\xECm</button>
        <span style="font-size: 12px; color: #7BD88F">Ngu\u1ED3n: OpenStreetMap \xB7 logo: trang web c\xE1c h\xE3ng</span>
      </div>
      <div style="position: absolute; left: 20px; right: 20px; top: 76px; display: flex; gap: 10px; flex-wrap: wrap">
        <sc-for list="{{cats}}" as="c" hint-placeholder-count="8">
          <button onClick="{{c.pick}}" aria-pressed="{{c.on}}" style="border: 0; cursor: pointer; font-family: inherit; width: 126px; height: 96px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border-radius: 8px; background: {{c.bg}}; color: #FFFFFF; box-shadow: {{c.ring}}">
            <sc-if value="{{c.logoImg}}" hint-placeholder-val="{{ false }}"><span style="width: 52px; height: 44px; border-radius: 6px; background: #FFFFFF; display: flex; align-items: center; justify-content: center"><img src="{{c.logoUrl}}" alt="" style="max-width: 46px; max-height: 38px; object-fit: contain"></span></sc-if>
            <sc-if value="{{c.sign}}" hint-placeholder-val="{{ true }}"><span style="width: 44px; height: 44px; border: 2px solid #FFFFFF; border-radius: 6px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; background: #1F5FAE"><svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="{{c.icon}}" fill="#FFFFFF" fill-rule="evenodd"></path></svg></span></sc-if>
            <span style="font-size: 13px; font-weight: 700; font-family: Overpass, sans-serif">{{c.label}}</span>
          </button>
        </sc-for>
        <button class="btn" style="width: 126px; height: 96px; font-size: 13px">+ Th\xEAm N\xFAt</button>
      </div>
      <div style="position: absolute; left: 20px; right: 20px; top: 194px; display: flex; align-items: center; gap: 10px">
        <span class="lbl">{{catTitle}} \xB7 {{searchNote}}</span><sc-if value="{{searchRetry}}" hint-placeholder-val="{{ false }}"><button onClick="{{doRetry}}" class="btn btn-o" style="height: 40px; padding: 0 22px; font-size: 16px">\u21BB Th\u1EED L\u1EA1i</button></sc-if>
        <span data-demo="1" style="font-size: 11px; color: #2A1A00; background: #FBB040; border-radius: 4px; padding: 1px 6px; font-weight: 700">S\u1ED0 LI\u1EC6U M\u1EAAU</span>
      </div>
      <div class="scrl" style="position: absolute; left: 20px; right: 20px; top: 222px; height: 370px; display: flex; flex-direction: column; gap: 8px">
        <sc-for list="{{results}}" as="r" hint-placeholder-count="4">
          <div class="pnl" style="flex-shrink: 0; min-height: 80px; padding: 10px 16px; box-sizing: border-box; display: flex; align-items: center; gap: 16px">
            <span aria-hidden="true" style="width: 52px; height: 52px; flex-shrink: 0; border-radius: 8px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; overflow: hidden; background: {{r.logoBg}}; border: {{r.logoBd}}"><sc-if value="{{r.logoImg}}" hint-placeholder-val="{{ false }}"><img src="{{r.logoUrl}}" alt="" style="max-width: 46px; max-height: 46px; object-fit: contain"></sc-if><sc-if value="{{r.logoTxt}}" hint-placeholder-val="{{ true }}"><svg width="34" height="34" viewBox="0 0 24 24"><path d="{{r.sign}}" fill="#FFFFFF" fill-rule="evenodd"></path></svg></sc-if></span>
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


    <!-- ===== m\xE0n h\xECnh ch\u1EDD ki\u1EC3u Th\u1EDDi Ti\u1EBFt Samsung (\u0111\u1EADu xe l\xE2u kh\xF4ng \u0111\u1EE5ng m\xE0n h\xECnh / ch\u1EA1m \xF4 th\u1EDDi ti\u1EBFt / ch\u1EA1m \u0111\u1ED3ng h\u1ED3) ===== -->
    <!-- 0.9.11: m\xE0n h\xECnh ch\u1EDD v\u1EBD \u1EDF l\u1EDBp ri\xEAng (idle.js), kh\xF4ng n\u1EB1m trong trang n\xE0y n\u1EEFa -->

    <!-- ===== \u0111i\u1EC7n tho\u1EA1i / c\u1EEDa s\u1ED5 h\u1EB9p (#44): vi\xEAn thu\u1ED1c tr\xEAn, \u0111\u1ED3ng h\u1ED3 k\xEDnh tr\xF2n, th\u1EBB chuy\u1EBFn ho\u1EB7c th\u1EDDi ti\u1EBFt, thanh nh\u1EA1c, 4 n\xFAt ===== -->
    <sc-if value="{{isCompact}}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; overflow: hidden; background: #050E18">
        <canvas id="phsky" aria-hidden="true" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; opacity: 0.45; pointer-events: none"></canvas>
        <div aria-hidden="true" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: linear-gradient(180deg, rgba(3,10,18,0.35), rgba(3,10,18,0.75)); pointer-events: none"></div>
        <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; padding: 14px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px">
          <div class="glc" style="padding: 10px 16px; display: flex; align-items: center; gap: 10px; border-radius: 999px">
            <span class="tnum" style="font-size: 26px; font-weight: 300; line-height: 1">{{clock}}</span>
            <span style="display: flex; flex-direction: column; line-height: 1.2; min-width: 0"><span style="font-size: 11px; color: #CFE6EE; white-space: nowrap">{{ph.date}}</span><span style="font-size: 11px; color: #8FC3D3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{street}}</span></span>
            <span style="flex: 1"></span>
            <button onClick="{{wxc.open}}" aria-label="Th\u1EDDi ti\u1EBFt: {{wxc.aria}}" style="border: 0; background: transparent; cursor: pointer; color: #FFFFFF; font-family: inherit; display: flex; align-items: center; gap: 6px; padding: 0"><svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true"><sc-for list="{{wxc.parts}}" as="pp" hint-placeholder-count="3"><path d="{{pp.d}}" fill="{{pp.fill}}" stroke="{{pp.stroke}}" stroke-width="{{pp.sw}}" stroke-linecap="round"></path></sc-for></svg><span style="font-size: 22px; font-weight: 300">{{wxT}}</span></button>
          </div>
          <div style="display: flex; justify-content: center; gap: 10px; font-size: 11px; font-weight: 700"><sc-for list="{{devList}}" as="dv" hint-placeholder-count="2"><span style="color: {{dv.c}}">{{dv.l}}</span></sc-for></div>
          <div style="position: relative; display: flex; justify-content: center; align-items: center; height: 200px; flex-shrink: 0">
            <button onClick="{{sb.tap}}" class="glr" aria-label="T\u1ED1c \u0111\u1ED9 {{sb.num}} {{sb.unit}}" style="position: relative; width: 196px; height: 196px; border: 0; padding: 0; cursor: pointer; color: #FFFFFF; font-family: inherit; display: flex; align-items: center; justify-content: center">
              <svg width="196" height="196" viewBox="0 0 150 150" aria-hidden="true" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0"><circle cx="75" cy="75" r="62" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="7" stroke-dasharray="292 390" transform="rotate(135 75 75)" stroke-linecap="round"></circle><circle cx="75" cy="75" r="62" fill="none" stroke="{{dk.arcC2}}" stroke-width="7" stroke-dasharray="{{dk.arc2}}" transform="rotate(135 75 75)" stroke-linecap="round"></circle></svg>
              <span style="position: relative; text-align: center"><span class="tnum" style="display: block; font-size: 70px; font-weight: 200; line-height: 1; color: {{dk.numC}}">{{sb.num}}</span><span style="display: block; font-size: 12px; letter-spacing: 3px; opacity: 0.85; margin-top: 4px">{{dk.unit}}</span></span>
            </button>
            <sc-if value="{{sb.limShow}}" hint-placeholder-val="{{ true }}"><div aria-label="{{sb.limAria}}" style="position: absolute; right: 6px; bottom: 10px; display: flex; flex-direction: column; align-items: center; gap: 3px"><div style="width: 50px; height: 64px; background: #FFFFFF; border-radius: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4)"><div style="width: 42px; height: 42px; border-radius: 50%; border: 5px solid #D0202E; box-sizing: border-box; color: #111; font-family: Overpass, sans-serif; font-weight: 800; font-size: 16px; display: flex; align-items: center; justify-content: center">{{sb.lim}}</div></div><span style="font-size: 10px; color: {{sb.limNoteC}}; white-space: nowrap">{{sb.limNote}}</span></div></sc-if>
          </div>
          <sc-if value="{{ph.trip}}" hint-placeholder-val="{{ false }}">
            <div class="glc" style="padding: 12px 16px; display: flex; flex-direction: column; gap: 8px">
              <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2px"><span class="lbl">CH\u1EB6NG GH\xC9 K\u1EBE</span><span style="font-size: 18px; font-weight: 700">{{cp.next}}</span><span style="font-size: 13px; color: #FFD08A">{{cp.nextSub}}</span></div>
              <div style="display: flex; gap: 8px"><div style="flex: 1; text-align: center"><div class="lbl">C\xD2N L\u1EA0I</div><div style="font-size: 17px; font-weight: 700">{{cp.left}}</div></div><div style="flex: 1; text-align: center"><div class="lbl">T\u1EDAI N\u01A0I</div><div style="font-size: 17px; font-weight: 700">{{cp.eta}}</div></div></div>
              <div style="font-size: 12px; color: #CFE6EE; text-align: center">{{cp.rest}}</div>
            </div>
          </sc-if>
          <sc-if value="{{ph.noTrip}}" hint-placeholder-val="{{ true }}">
            <div class="glc" style="padding: 12px 10px; display: flex; flex-direction: column; gap: 10px">
              <div style="display: flex; justify-content: space-between"><sc-for list="{{ph.hours}}" as="hh" hint-placeholder-count="6"><span style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px"><span style="font-size: 11px; color: #CFE6EE; white-space: nowrap">{{hh.t}}</span><svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true"><sc-for list="{{hh.icon}}" as="pp" hint-placeholder-count="2"><path d="{{pp.d}}" fill="{{pp.f}}" stroke="{{pp.s}}" stroke-width="{{pp.w}}" stroke-linecap="round"></path></sc-for></svg><span class="tnum" style="font-size: 14px; font-weight: 700">{{hh.v}}</span><span style="font-size: 10px; color: #9FD8FF; min-height: 12px">{{hh.p}}</span></span></sc-for></div>
              <button onClick="{{ph.start}}" class="pill" style="height: 44px; background: #FBB040; color: #2A1A00; font-size: 15px">B\u1EAFt \u0110\u1EA7u Chuy\u1EBFn</button>
            </div>
          </sc-if>
          <span style="flex: 1"></span>
          <div class="glc" style="padding: 8px 10px 8px 8px; display: flex; align-items: center; gap: 8px; border-radius: 999px">
            <button onClick="{{ph.list}}" aria-label="Danh s\xE1ch b\xE0i v\xE0 \u0111\xE0i" style="width: 44px; height: 44px; border: 0; padding: 0; border-radius: 50%; flex-shrink: 0; cursor: pointer; background: transparent"><svg viewBox="0 0 60 60" width="44" height="44" aria-hidden="true" class="{{jb.discCls}}"><circle cx="30" cy="30" r="29" fill="#1A1A1A"></circle><circle cx="30" cy="30" r="20" fill="none" stroke="#2C2C2C" stroke-width="1"></circle><circle cx="30" cy="30" r="11" fill="#FBB040"></circle><circle cx="30" cy="30" r="3" fill="#2A1A00"></circle></svg></button>
            <span style="flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.25"><span style="font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{songTitle}}</span><span style="font-size: 11px; color: #8FC3D3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{songSub}}</span></span>
            <button onClick="{{prevF}}" aria-label="{{prevLabel}}" class="jbbtn" style="width: 38px; height: 38px"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="3" height="14" rx="1" fill="#FBB040"></rect><path d="M19 5v14L9 12z" fill="#FBB040"></path></svg></button>
            <button onClick="{{togglePlay}}" aria-label="{{playLabel}}" class="jbbtn" style="width: 48px; height: 48px"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="{{playIcon}}" fill="#FBB040"></path></svg></button>
            <button onClick="{{nextF}}" aria-label="{{nextLabel}}" class="jbbtn" style="width: 38px; height: 38px"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5v14l10-7z" fill="#FBB040"></path><rect x="16" y="5" width="3" height="14" rx="1" fill="#FBB040"></rect></svg></button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px">
            <sc-for list="{{ph.btns}}" as="bt" hint-placeholder-count="4"><button onClick="{{bt.go}}" aria-label="{{bt.l}}" class="glc" style="height: 62px; border: 0; cursor: pointer; font-family: inherit; color: {{bt.c}}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border-radius: 22px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{bt.ic}}"></path></svg><span style="font-size: 11px; color: #E8F1F5; white-space: nowrap">{{bt.l}}</span></button></sc-for>
          </div>
        </div>
      </div>
    </sc-if>
    <sc-if value="{{ph.backOn}}" hint-placeholder-val="{{ false }}">
      <button onClick="{{ph.back}}" class="pill gl" style="position: absolute; left: 50%; top: 4px; transform: translateX(-50%); z-index: 30; height: 38px; color: #FFD08A; font-size: 14px">\u25C0 M\xE0n H\xECnh G\u1ECDn</button>
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
            <div style="display: flex; align-items: center; gap: 12px"><span style="font-size: 22px; font-weight: 700">{{wsTitle}}</span><span style="font-size: 12px; color: #8FC3D3">Ch\u1ECDn t\u1ED1i \u0111a 3 \xF4 \u2014 app ho\u1EB7c widget</span></div>
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
            <div aria-label="C\xE1ch chia \u2014 k\xE9o thanh gi\u1EEFa \u0111\u1EC3 ch\u1EC9nh" onPointerMove="{{ws.move}}" onPointerUp="{{ws.up}}" style="height: 150px; display: flex; padding: 4px; border-radius: 8px; background: #0A1B28; box-shadow: inset 0 0 0 1px rgba(95,212,240,0.4); touch-action: none">
              <sc-for list="{{ws.thumb}}" as="b" hint-placeholder-count="2"><sc-if value="{{b.div}}" hint-placeholder-val="{{ false }}"><span role="separator" aria-orientation="vertical" aria-label="K\xE9o \u0111\u1EC3 ch\u1EC9nh \u0111\u1ED9 r\u1ED9ng" onPointerDown="{{b.drag}}" style="width: 16px; flex-shrink: 0; cursor: col-resize; touch-action: none; display: flex; align-items: center; justify-content: center"><span style="width: 6px; height: 46px; border-radius: 3px; background: #FBB040"></span></span></sc-if><div style="flex: {{b.flex}}; min-width: 0; border-radius: 5px; background: {{b.bg}}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 4px; text-align: center"><span style="width: 22px; height: 22px; border-radius: 50%; background: #FBB040; color: #2A1A00; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center">{{b.n}}</span><span style="font-size: 12px">{{b.name}}</span><span class="tnum" style="font-size: 13px; font-weight: 700; color: #FFD08A">{{b.pctL}}</span></div></sc-for>
            </div>
            <sc-if value="{{ws.hasPresets}}" hint-placeholder-val="{{ true }}"><div style="display: flex; gap: 6px; flex-wrap: wrap"><sc-for list="{{ws.presets}}" as="o" hint-placeholder-count="3"><button onClick="{{o.pick}}" aria-pressed="{{o.on}}" class="pill" style="height: 30px; font-size: 12px; background: {{o.bg}}; color: {{o.fg}}">{{o.label}}</button></sc-for></div></sc-if>
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
          <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #8FC3D3">G\xF5 t\xEAn ho\u1EB7c \u0111\u1ECBa ch\u1EC9<input type="text" value="{{addQ}}" onInput="{{setAddQ}}" placeholder="vd: Bordertown Bakery" style="height: 44px; padding: 0 12px; border: 0; border-radius: 8px; font-family: inherit; font-size: 15px; background: #0D2C40; color: #E8F1F5"></label>
          <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #8FC3D3">Ho\u1EB7c d\xE1n link Google Maps<input type="text" value="{{addLink}}" onChange="{{setAddLink}}" placeholder="https://maps.app.goo.gl/\u2026" style="height: 44px; padding: 0 12px; border: 0; border-radius: 8px; font-family: inherit; font-size: 15px; background: #0D2C40; color: #E8F1F5"></label>
          <sc-if value="{{addResOn}}" hint-placeholder-val="{{ false }}">
            <div class="scrl" style="max-height: 230px; display: flex; flex-direction: column; gap: 4px; margin-top: -4px">
              <sc-for list="{{addRes}}" as="r" hint-placeholder-count="3"><button onClick="{{r.pick}}" style="flex-shrink: 0; border: 0; background: rgba(255,255,255,0.06); border-radius: 10px; cursor: pointer; font-family: inherit; color: #E8F1F5; display: flex; align-items: center; gap: 10px; padding: 8px 10px; text-align: left"><span style="width: 34px; height: 34px; border-radius: 8px; background: {{r.icBg}}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden"><img src="{{r.img}}" alt="" style="width: 30px; height: 30px; object-fit: contain"></span><span style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.name}}</span><span style="font-size: 12px; color: #8FC3D3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{r.sub}}</span></span><span style="font-size: 13px; color: #FFD08A; white-space: nowrap">{{r.km}}</span></button></sc-for>
            </div>
          </sc-if>
          <button onClick="{{addHere}}" class="btn" style="height: 50px">L\u01B0u Ch\u1ED7 \u0110ang \u0110\u1EE9ng</button>
          <div style="display: flex; align-items: center; gap: 10px"><span style="font-size: 12px; color: #FFD08A; flex: 1">{{addMsg}}</span><sc-if value="{{addRetryOn}}" hint-placeholder-val="{{ false }}"><button onClick="{{addFind}}" class="btn" style="height: 36px; font-size: 13px">\u21BB Th\u1EED L\u1EA1i</button></sc-if></div>
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
                <span style="width: 30px; height: 30px; border-radius: 4px; background: {{p.sign}}; border: 2px solid #FFFFFF; box-sizing: border-box; display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="16" height="16" viewBox="0 0 24 24" fill="{{p.icF}}" stroke="{{p.icS}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{p.icon}}"></path></svg></span>
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
            <div style="display: flex; align-items: center; gap: 10px"><span style="width: 30px; height: 30px; border-radius: 4px; background: {{sd.sign}}; border: 2px solid #FFFFFF; box-sizing: border-box; display: flex; align-items: center; justify-content: center"><svg width="16" height="16" viewBox="0 0 24 24" fill="{{sd.icF}}" stroke="{{sd.icS}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{sd.icon}}"></path></svg></span><span style="font-size: 22px; font-weight: 700">{{sd.name}}</span></div>
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


    <!-- ===== M\xE0n h\xECnh ch\xE0o (m\u1ED9t m\xE0n h\xECnh duy nh\u1EA5t, t\u1EF1 v\xE0o M\xE0n H\xECnh Ch\xEDnh, ch\u1EA1m \u0111\u1EC3 v\xE0o s\u1EDBm) ===== -->
    <sc-if value="{{bootSplash}}" hint-placeholder-val="{{ false }}">
      <button onClick="{{skipBoot}}" aria-label="V\xE0o M\xE0n H\xECnh Ch\xEDnh" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 30; border: 0; padding: 0; cursor: pointer; color: inherit; font-family: inherit; background: radial-gradient(ellipse at 50% 45%,#0B2A3E,#020A12 70%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px">
        <div style="font-size: 72px; font-weight: 700; line-height: 1; font-family: Bahnschrift, 'Barlow Semi Condensed', sans-serif; text-shadow: 0 0 20px rgba(95,212,240,0.7)"><span style="color: #48B0C8">TOM'S</span> <span style="color: #FBB040">CAR</span></div>
        <div style="font-size: 16px; color: #CFE6EE">Focus On One Thing And Do It Well</div>
        <div style="width: 320px; height: 4px; background: rgba(95,212,240,0.2); border-radius: 2px; overflow: hidden"><div class="bootbar" style="height: 100%; background: #FBB040; animation-duration: {{bootDur}}s"></div></div>
        <div style="font-size: 13px; color: #8FC3D3">{{verL}} \xB7 Tom's Technology Solutions</div>
      </button>
    </sc-if>
    <sc-if value="{{bootAbout}}" hint-placeholder-val="{{ false }}">
      <div class="fadein" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 30; background: #03111C; display: flex; align-items: center; justify-content: center">
        <div class="pnl" style="width: 640px; padding: 30px; display: flex; flex-direction: column; gap: 12px; background: #06192A">
          <div style="font-size: 30px; font-weight: 700; color: #FBB040">Tom's Car <span style="font-size: 16px; color: #CFE6EE">{{verL}}</span></div>
          <div style="font-size: 14px; color: #CFE6EE; line-height: 1.6">M\xE0n h\xECnh xe cho Samsung DeX, \u0111i\u1EC7n tho\u1EA1i v\xE0 m\xE1y t\xEDnh b\u1EA3ng \xB7 Tom's Technology Solutions \xB7 Focus On One Thing And Do It Well</div>
          <div style="display: flex; justify-content: flex-end"><button onClick="{{skipBoot}}" class="btn btn-o">\u0110\xF3ng</button></div>
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
