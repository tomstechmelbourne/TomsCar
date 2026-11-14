#!/usr/bin/env python3
"""Tom's Car start-up sounds (#56) — synthesised here, original (not copied from any phone maker). ~2 s each."""
import numpy as np, subprocess, sys, os
SR = 44100
def env(n, a=0.01, d=1.0):
    t = np.arange(n) / SR; e = np.exp(-t / d); k = int(a * SR); e[:k] *= np.linspace(0, 1, k); return e
def bell(f, dur, d=0.6, a=0.004):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*2.0*f*t)*np.exp(-t/0.25) + 0.12*np.sin(2*np.pi*3.01*f*t)*np.exp(-t/0.12)
    return s * env(n, a, d)
def place(buf, sig, at):
    i = int(at * SR); j = min(len(buf), i + len(sig)); buf[i:j] += sig[:j - i]
def reverb(x, mix=0.25):
    out = x.copy()
    for dl, g in [(0.031, .5), (0.047, .42), (0.071, .33), (0.103, .25), (0.149, .18), (0.211, .12)]:
        k = int(dl * SR); out[k:] += x[:-k] * g * mix * 2
    return out
def save(x, name):
    x = reverb(x); x = x / (np.max(np.abs(x)) + 1e-9) * 0.85
    fade = int(0.15 * SR); x[-fade:] *= np.linspace(1, 0, fade)
    wav = '/tmp/' + name + '.wav'
    import scipy.io.wavfile as w; w.write(wav, SR, (x * 32767).astype(np.int16))
    out = os.path.join(sys.argv[1], name + '.ogg')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libvorbis', '-q:a', '5', out], check=True)
    print(out, os.path.getsize(out))
N = int(2.2 * SR)
# 1. Nhẹ Nhàng: bell arpeggio rising C – E – G – C
x = np.zeros(N)
for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]): place(x, bell(f, 1.8, 0.7 if i < 3 else 1.1) * (0.8 if i < 3 else 1.0), 0.0 + i * 0.16)
save(x, 'chime_soft')
# 2. Hiện Đại: soft pad swell (Fmaj9) then a bright double ping
x = np.zeros(N); t = np.arange(N) / SR
pad = sum(np.sin(2*np.pi*f*t + p) for f, p in [(174.6, 0), (220.0, 1), (261.6, 2), (329.6, 3), (392.0, 4)])
sw = np.clip(t / 0.9, 0, 1) ** 2 * np.exp(-np.clip(t - 0.9, 0, None) / 0.6)
x += pad * sw * 0.18
place(x, bell(1396.9, 1.2, 0.45), 0.85); place(x, bell(2093.0, 1.1, 0.5) * 0.6, 1.0)
save(x, 'chime_modern')
# 3. Nổ Máy: starter whirr, engine catches (low rumble rising), then a short welcome ping
x = np.zeros(N); rng = np.random.default_rng(7)
n1 = int(0.55 * SR); t1 = np.arange(n1) / SR
starter = np.sign(np.sin(2*np.pi*(18 + 6*np.sin(2*np.pi*3*t1))*t1)) * 0.25 + rng.normal(0, .08, n1)
place(x, starter * np.linspace(0.3, 1, n1), 0)
n2 = int(1.3 * SR); t2 = np.arange(n2) / SR
f = 38 + 30 * (1 - np.exp(-t2 / 0.25)); ph = 2*np.pi*np.cumsum(f) / SR
rum = (np.sin(ph) + 0.5*np.sin(2*ph) + 0.3*np.sin(3*ph)) * (0.7 + 0.3*np.sin(2*np.pi*11*t2)) + rng.normal(0, .05, n2)
place(x, rum * np.exp(-np.clip(t2 - 0.5, 0, None) / 0.4) * 0.55, 0.5)
place(x, bell(1174.7, 1.0, 0.45) * 0.55, 1.25); place(x, bell(1568.0, 0.9, 0.45) * 0.45, 1.38)
save(x, 'chime_engine')
