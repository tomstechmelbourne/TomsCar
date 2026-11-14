#!/usr/bin/env python3
"""Turn the approved Main.dc.html board into the app's offline web UI (assets/web)."""
import os, json, re, sys, pathlib, shutil

src_path, out_dir = sys.argv[1], pathlib.Path(sys.argv[2])
here = pathlib.Path(__file__).parent
s = open(src_path, encoding='utf-8').read()

PATCHES = [
    # live speed
    ("const speed = this.state.spd != null ? this.state.spd : Number(this.props.speed ?? 60);",
     "const LV = this.state.live || null; const LOB = LV && LV.obd;\n    const speed = this.state.spd != null ? this.state.spd : (LV ? (LV.speed == null ? 0 : Math.round(LV.speed)) : Number(this.props.speed ?? 60));"),
    # live weather kind
    ("const wx = wxSel === 'auto' ? autoWx : wxSel;",
     "const wx = wxSel === 'auto' ? ((this.state.live && this.state.live.wx && this.state.live.wx.code) || autoWx) : wxSel;"),
    # live rpm
    ("const rpm = moving ? 900 + speed * 22 : 750;",
     "const rpm = (LOB && LOB.rpm != null) ? Math.round(LOB.rpm) : (LV ? 0 : (moving ? 900 + speed * 22 : 750));"),
    # status: battery / engine / volt sources
    ("const bat = S.bat ?? 'chg', tmpT = S.tmpT ?? 'n', eng = S.eng ?? 'n', volt = S.volt ?? (moving ? 'chg' : 'off');",
     "const bat = S.bat ?? (LV && LV.bat ? (LV.bat.hot ? 'hot' : LV.bat.charging ? 'chg' : 'x') : 'chg'), tmpT = S.tmpT ?? 'n', eng = S.eng ?? (LOB && LOB.coolant != null ? (LOB.coolant < 60 ? 'cold' : LOB.coolant >= 105 ? 'hot' : 'n') : 'n'), volt = S.volt ?? (LOB && LOB.volt != null ? (LOB.volt >= 13.2 ? 'chg' : LOB.volt >= 12.2 ? 'off' : 'low') : (moving ? 'chg' : 'off'));"),
    ("const feel = tt + (",
     "const feel = (LV && LV.wx && LV.wx.feels != null && S.tmpT == null) ? Math.round(LV.wx.feels) : tt + ("),
    ("const rainP = { clear: 0,",
     "const rainP = (LV && LV.wx && S.tmpT == null) ? Math.round(LV.wx.rain || 0) : { clear: 0,"),
    ("const lvl = { '80': 80, '35': 35, '12': 12, chg: 64, hot: 72 }[bat];",
     "const lvl = (LV && LV.bat && S.bat == null) ? Math.round(LV.bat.level) : { '80': 80, '35': 35, '12': 12, chg: 64, hot: 72 }[bat];"),
    ("const engV = eng === 'cold' ? 45 : eng === 'hot' ? 108 : 88;",
     "const engV = (LV && S.eng == null) ? (LOB && LOB.coolant != null ? Math.round(LOB.coolant) : '--') : (eng === 'cold' ? 45 : eng === 'hot' ? 108 : 88);"),
    ("v: vV.toFixed(1) + ' V',",
     "v: (LV && S.volt == null) ? (LOB && LOB.volt != null ? LOB.volt.toFixed(1) + ' V' : '-- V') : vV.toFixed(1) + ' V',"),
    ("hi: tt + 4, lo: tt - 6,",
     "hi: (LV && LV.wx && S.tmpT == null) ? Math.round(LV.wx.hi) : tt + 4, lo: (LV && LV.wx && S.tmpT == null) ? Math.round(LV.wx.lo) : tt - 6,"),
    # connected devices from the phone
    ("roomy: ['none', 'buds'].includes(S.devs ?? 'buds'),",
     "roomy: (LV && S.devs == null) ? (LV.devs || []).length <= 1 : ['none', 'buds'].includes(S.devs ?? 'buds'),"),
    ("devs: (() => { const dv = S.devs ?? 'buds';",
     "devs: (LV && S.devs == null) ? (() => { const IC = { audio: 'M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H4zM17 15h3v5h-3z', watch: 'M8 6l1-4h6l1 4M8 18l1 4h6l1-4M7 6h10v12H7z', speaker: 'M6 3h12v18H6zM12 12a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM12 7h.01', other: 'M7 7l10 10-5 4V3l5 4L7 17' }; const all = (LV.devs || []).map((d) => { const p = d.level; const has = p != null && p >= 0; return { name: d.name, icon: IC[d.type] || IC.other, p: has ? p : 101, pct: has ? p + '%' : '', c: !has ? '#CFE6EE' : p > 50 ? '#7BD88F' : p >= 20 ? '#FBD000' : '#E5484D', cls: has && p < 20 ? 'st-blink' : '' }; }).sort((a, b) => a.p - b.p); const shown = all.slice(0, 2); if (all.length > 2) shown.push({ name: all.slice(2).map((x) => x.name).join(', '), icon: 'M12 5v14M5 12h14', pct: '' + (all.length - 2), c: '#CFE6EE', cls: '' }); return shown; })() : (() => { const dv = S.devs ?? 'buds';"),
    ("links: [['gps', 'GPS', true], ['bt', 'Bluetooth', true], ['obd', 'OBD-II', S.obdOff !== true]]",
     "links: [['gps', 'GPS', LV ? !!LV.gps : true], ['bt', 'Bluetooth', LV ? !!LV.bt : true], ['obd', 'OBD-II', LV ? !!LOB : S.obdOff !== true]]"),
    # now playing
    ("const t = vi ? L.vi : L.en;",
     "const t0 = vi ? L.vi : L.en; const MD = this.state.live && this.state.live.media;\n    const t = (MD && MD.title) ? Object.assign({}, t0, { song: MD.title, artist: MD.artist || '' }) : t0;"),
    # workspace -> real apps
    ("self.coverTimer = setTimeout(() => self.setState({ stage: 'run' }), 1900);",
     "self.coverTimer = setTimeout(() => { if (window.TCN) { self.setState({ stage: null }); window.TCN.call('launch', JSON.stringify(d.apps)); } else self.setState({ stage: 'run' }); }, 1900);"),
    # road trip from GPS
    ("const pos = (leg === 'go' ? [135, 420, 640] : [85, 300, 650])[pi];",
     "const LT = this.state.live && this.state.live.trip; const pos = (LT && S.rtPos == null) ? Math.max(0, Math.min(700, Math.round(leg === 'go' ? LT.km : 700 - LT.km))) : (leg === 'go' ? [135, 420, 640] : [85, 300, 650])[pi];"),
    ("const baseMin = 8 * 60 + 5 + (leg === 'go' ? 0 : 30);\n        const p2",
     "const baseMin = (LT && S.rtPos == null) ? (() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes() - (pos / 100) * 60 - list.filter((x) => x.km <= pos).reduce((a, x) => a + (x.stay || 0), 0); })() : 8 * 60 + 5 + (leg === 'go' ? 0 : 30);\n        const p2"),
    # buttons wired to the phone
    ('<button aria-label="{{t.prev}}" class="tc-btn" style="width: 40px', '<button onClick="{{mx.prevF}}" aria-label="{{t.prev}}" class="tc-btn" style="width: 40px'),
    ('<button aria-label="{{t.play}}" class="tc-btn" style="width: 42px', '<button onClick="{{mx.playF}}" aria-label="{{t.play}}" class="tc-btn" style="width: 42px'),
    ('<button aria-label="{{t.next}}" class="tc-btn" style="width: 40px', '<button onClick="{{mx.nextF}}" aria-label="{{t.next}}" class="tc-btn" style="width: 40px'),
    ('<button aria-label="{{t.vol}}" class="tc-btn" style="width: 36px', '<button onClick="{{mx.volF}}" aria-label="{{t.vol}}" class="tc-btn" style="width: 36px'),
    ('<path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"></path></svg></button>', '<path d="{{mx.playIcon}}"></path></svg></button>'),
    ('<button onClick="{{togglePicker}}" aria-expanded="{{pickerExpanded}}"', '<button data-demo="1" onClick="{{togglePicker}}" aria-expanded="{{pickerExpanded}}"'),
    ('<path d="M900 372 L900 344 L884 344 L908 316', '<path data-demo="1" d="M900 372 L900 344 L884 344 L908 316'),
    ('<rect x="1081" y="321" width="46" height="61" rx="4" fill="#E9E4D8"></rect><circle cx="1104" cy="351.5"', '<rect data-demo="1" x="1081" y="321" width="46" height="61" rx="4" fill="#E9E4D8"></rect><circle data-demo="1" cx="1104" cy="351.5"'),
    ('<text x="1104" y="358.5" text-anchor="middle"', '<text data-demo="1" x="1104" y="358.5" text-anchor="middle"'),
    ("const sp = speed, r = rpm, lim = 60;", "const sp = speed, r = rpm, lim = LV ? 999 : 60;"),
    ('<button aria-label="{{aboutTitle}}" onClick="{{introToAbout}}"', '<button data-demo="1" aria-label="{{aboutTitle}}" onClick="{{introToAbout}}"'),
    ("this.introTimer = setTimeout(() => { if (this.state.intro === 'splash') this.setState({ intro: 'about' }); }, 4500);",
     "this.introTimer = setTimeout(() => { if (this.state.intro === 'splash') { this.setState({ intro: 'about' }); this.introTimer = setTimeout(() => { if (this.state.intro === 'about') this.setState({ intro: null }); }, 6000); } }, 4500);"),
    ("temp += { clear: 0, cloudy: -1, rain: -3, storm: -2, fog: -4 }[wx] + { day: 0, dawn: -4, dusk: -2, night: -6 }[phase];",
     "temp += { clear: 0, cloudy: -1, rain: -3, storm: -2, fog: -4 }[wx] + { day: 0, dawn: -4, dusk: -2, night: -6 }[phase];\n    if (this.state.live && this.state.live.wx && this.state.live.wx.temp != null) temp = Math.round(this.state.live.wx.temp);"),
    ('<button aria-label="{{t.settings}}"', '<button onClick="{{openSettings}}" aria-label="{{t.settings}}"'),
    ('font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l7 19-7-4-7 4z">',
     'font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px" onClick="{{rt.navF}}"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l7 19-7-4-7 4z">'),
]
for a, b in PATCHES:
    n = s.count(a)
    if n != 1:
        sys.exit(f'patch anchor found {n}x: {a[:70]}')
    s = s.replace(a, b)

# ---- hide the scene board's own UI in the app (the App board draws the UI on top) ----
def wrap_block(src, start):
    i = src.index(start)
    m = re.match(r'<([a-zA-Z-]+)', src[i:]); tag = m.group(1)
    rx = re.compile(r'<' + tag + r'\b|</' + tag + r'>')
    depth = 0
    for mm in rx.finditer(src, i):
        depth += -1 if mm.group(0).startswith('</') else 1
        if depth == 0:
            j = mm.end(); break
    return src[:i] + '<div data-ui="1" style="display: contents">' + src[i:j] + '</div>' + src[j:]
for start in ['<sc-if value="{{isRain}}"', '<sc-if value="{{sc.rainOn}}"', '<sc-if value="{{g.on}}"', '<sc-if value="{{listening}}"',
              '<header style="position: absolute; left: 20px; right: 20px; top: 34px', '<sc-if value="{{pickerOpen}}"',
              '<section aria-label="Workspace" style="position: absolute; left: 20px; top: 100px', '<footer style="position: absolute; left: 20px; right: 20px; bottom: 16px',
              '<sc-if value="{{showCover}}"', '<sc-if value="{{rt.on}}"', '<sc-if value="{{showRun}}"', '<sc-if value="{{introSplash}}"',
              '<sc-if value="{{introAbout}}"', '<sc-if value="{{introStepOn}}"']:
    s = wrap_block(s, start)
s = s.replace('<div role="tablist" style="position: absolute; right: 20px; top: 4px;', '<div data-ui="1" role="tablist" style="position: absolute; right: 20px; top: 4px;', 1)
s = s.replace('  <g opacity="0.92">', '  <g data-ui="1" opacity="0.92">', 1)
i = s.index('  <rect x="700" y="548" width="480" height="96"'); j = s.index('  <g class="{{wheelClass}}"', i)
s = s[:i] + '  <g data-ui="1">\n' + s[i:j] + '  </g>\n' + s[j:]

# template = everything inside <x-dc> except <link> tags (fonts are bundled)
tpl = s[s.index('<x-dc>') + 6: s.index('</x-dc>')]
tpl = re.sub(r'<link[^>]*>\s*', '', tpl)
# older Android System WebView (< 87) has no CSS 'inset'
tpl = re.sub(r'inset: ?0(px)?;', 'top: 0; right: 0; bottom: 0; left: 0;', tpl)
tpl = re.sub(r'inset: ?0(px)?"', 'top: 0; right: 0; bottom: 0; left: 0"', tpl)
script_m = re.search(r'<script type="text/x-dc"[^>]*data-props=\'([^\']*)\'[^>]*>(.*?)</script>', s, re.S)
props_def = json.loads(script_m.group(1))
props = {k: v.get('default') for k, v in props_def.items()}
code = script_m.group(2)

def board_parts(text):
    t = text[text.index('<x-dc>') + 6: text.index('</x-dc>')]
    t = re.sub(r'<link[^>]*>\s*', '', t)
    t = re.sub(r'inset: ?0(px)?;', 'top: 0; right: 0; bottom: 0; left: 0;', t)
    t = re.sub(r'inset: ?0(px)?"', 'top: 0; right: 0; bottom: 0; left: 0"', t)
    sm = re.search(r'<script type="text/x-dc"[^>]*data-props=\'([^\']*)\'[^>]*>(.*?)</script>', text, re.S)
    pd = json.loads(sm.group(1))
    return t, {k: v.get('default') for k, v in pd.items()}, sm.group(2)

app_src = open(here / 'App.dc.html', encoding='utf-8').read()
app_tpl, app_props, app_code = board_parts(app_src)
version = sys.argv[3] if len(sys.argv) > 3 else '0.9.5-beta'

out_dir.mkdir(parents=True, exist_ok=True)
(out_dir / 'fonts').mkdir(exist_ok=True)
for f in (here.parent / 'fonts').glob('*'):
    shutil.copy(f, out_dir / 'fonts' / f.name)
shutil.copy(here / 'dcmini.js', out_dir / 'dcmini.js')
shutil.copy(here / 'glue.js', out_dir / 'glue.js')
shutil.copy(here / 'sky.js', out_dir / 'sky.js')
shutil.copy(here / 'lowpoly.js', out_dir / 'lowpoly.js')
LF = pathlib.Path(os.environ.get('LEAFLET', '/tmp/node_modules/leaflet/dist'))
shutil.copy(LF / 'leaflet.js', out_dir / 'leaflet.js')
shutil.copy(LF / 'leaflet.css', out_dir / 'leaflet.css')
(out_dir / 'scene.js').write_text(
    'window.__SceneComp = (function () {\n' + code + '\nreturn Component;\n})();\nwindow.__SCENE_TPL = ' + json.dumps(tpl, ensure_ascii=False) + ';\nwindow.__SCENE_PROPS = ' + json.dumps(props) + ';\n',
    encoding='utf-8')
(out_dir / 'app.js').write_text(
    'window.__AppComp = (function () {\n' + app_code + '\nreturn Component;\n})();\nwindow.__APP_TPL = ' + json.dumps(app_tpl, ensure_ascii=False) + ';\nwindow.__APP_PROPS = ' + json.dumps(app_props) + ';\n',
    encoding='utf-8')
FONTS = """
@font-face{font-family:'Chakra Petch';font-weight:400;src:url(fonts/ChakraPetch-Regular.ttf)}
@font-face{font-family:'Chakra Petch';font-weight:500;src:url(fonts/ChakraPetch-Medium.ttf)}
@font-face{font-family:'Chakra Petch';font-weight:600;src:url(fonts/ChakraPetch-SemiBold.ttf)}
@font-face{font-family:'Chakra Petch';font-weight:700 900;src:url(fonts/ChakraPetch-Bold.ttf)}
@font-face{font-family:'Overpass';font-weight:100 900;src:url('fonts/Overpass[wght].ttf')}
@font-face{font-family:'Barlow Semi Condensed';font-weight:600;src:url(fonts/BarlowSemiCondensed-SemiBold.ttf)}
@font-face{font-family:'Barlow Semi Condensed';font-weight:700;src:url(fonts/BarlowSemiCondensed-Bold.ttf)}
@font-face{font-family:'Bahnschrift';font-weight:400 900;src:local('Bahnschrift'),url(fonts/BarlowSemiCondensed-Bold.ttf)}
"""
(out_dir / 'index.html').write_text(f"""<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>Tom's Car</title>
<link rel="stylesheet" href="leaflet.css">
<style>{FONTS}
html,body{{margin:0;height:100%;background:#010407;overflow:hidden;-webkit-tap-highlight-color:transparent;user-select:none}}
body.app [data-demo]{{display:none!important}}
body.app [data-ui]{{display:none!important}}
#stage{{position:absolute;left:50%;top:50%;width:1280px;height:720px;transform-origin:50% 50%;overflow:hidden}}
#scene,#ui,#lp{{position:absolute;left:0;top:0;width:100%;height:100%}}
#lp{{display:none}}
body.lp-on #lp{{display:block}}
body.lp-on #scene{{display:none}}
#ui{{pointer-events:none}}
#ui button,#ui input,#ui label,#ui .pnl,#ui section,#ui [role=dialog],#ui [role=separator],#ui [role=switch],#ui [role=checkbox],#ui .scrl{{pointer-events:auto}}
#ui > div > div[style*="inset"],#ui [style*="background: rgba(1,6,10"]{{pointer-events:auto}}
body.theme-open #ui{{display:none}}
body.narrow #scene{{display:none}}
</style></head>
<body><div id="stage"><div id="scene"></div><canvas id="lp"></canvas><div id="ui"></div></div>
<script>window.TC_VERSION = '{version}';</script>
<script src="dcmini.js"></script>
<script src="scene.js"></script>
<script src="app.js"></script>
<script src="leaflet.js"></script>
<script src="glue.js"></script>
<script src="sky.js"></script>
<script src="lowpoly.js"></script>
<script>
window.__tc = dcMount(document.getElementById('scene'), window.__SCENE_TPL, window.__SceneComp, window.__SCENE_PROPS, {{ post: function (v, c) {{ v = (window.tcPost ? window.tcPost(v, c) : v) || v; return window.tcScenePost ? window.tcScenePost(v, c) : v; }} }});
if (window.tcSceneInit) window.tcSceneInit(window.__tc);
window.__ui = dcMount(document.getElementById('ui'), window.__APP_TPL, window.__AppComp, window.__APP_PROPS, {{}});
if (window.tcFit) window.tcFit();
if (window.TCNative) {{ try {{ window.TCNative.call('ready', ''); }} catch (e) {{}} }}
</script>
</body></html>
""", encoding='utf-8')
import subprocess, os
esb = os.environ.get('ESBUILD', '/tmp/node_modules/.bin/esbuild')
for f in ('scene.js', 'app.js', 'glue.js', 'dcmini.js', 'sky.js', 'lowpoly.js'):
    subprocess.run([esb, str(out_dir / f), '--target=chrome61', '--allow-overwrite', '--log-level=warning', '--outfile=' + str(out_dir / f)], check=True)
print('web UI written to', out_dir)
