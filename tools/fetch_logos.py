#!/usr/bin/env python3
"""Download the brand logos into the app at build time (#53), so Tom's Car never looks a logo up by name.
For each brand in tools/brands.json: the site's own large icon (via Google's favicon service, 256 px),
falling back to the site's apple-touch-icon. Writes <out>/<slug>.png and <out>/logos.js (window.__LOGOS)."""
import json, os, re, struct, sys, urllib.request

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
brands = json.load(open(os.path.join(os.path.dirname(__file__), 'brands.json')))
UA = {'User-Agent': 'Mozilla/5.0 (Linux; Android 14) TomsCar-build'}

def get(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
            return r.read()
    except Exception as e:
        print('  ', url, 'failed:', e); return None

def png_size(b):
    if b and b[:8] == b'\x89PNG\r\n\x1a\n' and len(b) > 24: return struct.unpack('>II', b[16:24])
    return (0, 0)

ok, man = 0, {}
for br in brands:
    slug = re.sub(r'[^a-z0-9]+', '-', br['key'].lower()).strip('-')
    d = br['domain']; best = None
    for url in ['https://www.google.com/s2/favicons?domain=%s&sz=256' % d, 'https://%s/apple-touch-icon.png' % d, 'https://www.%s/apple-touch-icon.png' % d]:
        b = get(url); w, h = png_size(b)
        if w >= 64: best = b; print(br['key'], '<-', url, '%dx%d' % (w, h)); break
    if best:
        open(os.path.join(out, slug + '.png'), 'wb').write(best); man[br['key']] = 'logos/' + slug + '.png'; ok += 1
    else: print(br['key'], 'NO LOGO')
rules = [[b['key'], b['re']] for b in brands]
open(os.path.join(out, 'logos.js'), 'w').write('window.__LOGOS = ' + json.dumps(man) + ';\nwindow.__BRAND_RULES = ' + json.dumps(rules) + ';\n')
print('logos: %d/%d' % (ok, len(brands)))
