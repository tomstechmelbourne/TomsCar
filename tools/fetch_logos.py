#!/usr/bin/env python3
"""Download the brand logos into the app at build time (#53), so Tom's Car never looks a logo up by name.
For each brand in tools/brands.json (fixed official website), tries in order:
  1. Google's favicon service at 256 px (domain and www.domain)
  2. the icons the home page itself declares (apple-touch-icon, icon sizes, web manifest)
  3. DuckDuckGo's icon (ICO, converted)
  4. Google's favicon service, smaller sizes accepted
Writes <out>/<slug>.png (square, transparent padding) and <out>/logos.js (window.__LOGOS + window.__BRAND_RULES)."""
import io, json, os, re, struct, sys, urllib.parse, urllib.request
try:
    from PIL import Image
except Exception:
    Image = None

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
brands = json.load(open(os.path.join(os.path.dirname(__file__), 'brands.json')))
UA = {'User-Agent': 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36', 'Accept-Language': 'en-AU,en'}

def get(url, limit=4_000_000):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
            return r.read(limit), r.geturl()
    except Exception as e:
        return None, url

def to_png(b):
    """Returns (png_bytes, size) for PNG/ICO/JPEG/WebP input, or (None, 0)."""
    if not b: return None, 0
    if b[:8] == b'\x89PNG\r\n\x1a\n' and Image is None:
        w, h = struct.unpack('>II', b[16:24]); return b, min(w, h)
    if Image is None: return None, 0
    try:
        im = Image.open(io.BytesIO(b))
        if getattr(im, 'format', '') == 'ICO':
            sizes = sorted(im.info.get('sizes', [im.size]), key=lambda s: s[0])
            im.size = sizes[-1]
        im = im.convert('RGBA'); w, h = im.size
        s = max(w, h); sq = Image.new('RGBA', (s, s), (0, 0, 0, 0)); sq.paste(im, ((s - w) // 2, (s - h) // 2))
        if s > 256: sq = sq.resize((256, 256), Image.LANCZOS); s = 256
        o = io.BytesIO(); sq.save(o, 'PNG'); return o.getvalue(), min(w, h)
    except Exception:
        return None, 0

def page_icons(domain):
    """Icon URLs the home page declares, biggest first."""
    found = []
    for home in ['https://www.%s/' % domain, 'https://%s/' % domain]:
        html, final = get(home, 1_500_000)
        if not html: continue
        t = html.decode('utf-8', 'ignore')
        for m in re.finditer(r'<link\b[^>]*>', t, re.I):
            tag = m.group(0); rel = re.search(r'rel=["\']([^"\']+)', tag, re.I); href = re.search(r'href=["\']([^"\']+)', tag, re.I)
            if not rel or not href: continue
            rel = rel.group(1).lower(); u = urllib.parse.urljoin(final, href.group(1))
            if 'manifest' in rel:
                mj, mu = get(u)
                try:
                    for ic in json.loads(mj.decode('utf-8', 'ignore')).get('icons', []):
                        sz = max([int(x) for x in re.findall(r'(\d+)x\d+', ic.get('sizes', ''))] or [0])
                        found.append((sz, urllib.parse.urljoin(mu, ic.get('src', ''))))
                except Exception: pass
            elif 'icon' in rel:
                sz = max([int(x) for x in re.findall(r'(\d+)x\d+', tag)] or [180 if 'apple' in rel else 32])
                found.append((sz, u))
        for p in ['/apple-touch-icon.png', '/apple-touch-icon-precomposed.png']:
            found.append((180, urllib.parse.urljoin(final, p)))
        if found: break
    return [u for s, u in sorted(found, key=lambda x: -x[0]) if not u.endswith('.svg')]

def fetch(d):
    """(png, quality, how) for one domain: quality 3 = big icon, 2 = page icon, 1 = DuckDuckGo, 0 = small favicon."""
    for x in (d, 'www.' + d):
        png, s = to_png(get('https://www.google.com/s2/favicons?domain=%s&sz=256' % x)[0])
        if s >= 96: return png, 3, 'google ' + x
    for url in page_icons(d)[:8]:
        png, s = to_png(get(url)[0])
        if s >= 64: return png, 2, url
    png, s = to_png(get('https://icons.duckduckgo.com/ip3/%s.ico' % d)[0])
    if s >= 48: return png, 1, 'duckduckgo ' + d
    for x in (d, 'www.' + d):
        png, s = to_png(get('https://www.google.com/s2/favicons?domain=%s&sz=256' % x)[0])
        if s >= 32: return png, 0, 'google small %d %s' % (s, x)
    return None, -1, ''

ok, man = 0, {}
for br in brands:
    slug = re.sub(r'[^a-z0-9]+', '-', br['key'].lower()).strip('-')
    best = (None, -1, '')
    for d in br['domains']:
        r = fetch(d)
        if r[1] > best[1]: best = r
        if best[1] >= 2: break
    if best[0]:
        open(os.path.join(out, slug + '.png'), 'wb').write(best[0]); man[br['key']] = 'logos/' + slug + '.png'; ok += 1
        print('%-18s <- %s' % (br['key'], best[2]))
    else: print('%-18s NO LOGO' % br['key'])
rules = [[b['key'], b['re']] for b in brands]
open(os.path.join(out, 'logos.js'), 'w').write('window.__LOGOS = ' + json.dumps(man) + ';\nwindow.__BRAND_RULES = ' + json.dumps(rules) + ';\n')
print('logos: %d/%d' % (ok, len(brands)))
