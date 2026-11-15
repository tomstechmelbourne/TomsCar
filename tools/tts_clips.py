# Tom's Car — #77: record the fixed phrases with VieNeu-TTS (runs on CI). Output: voice/{doan,son}/N.mp3 + voice/index.json
import os, sys, json, subprocess, traceback
sys.path.insert(0, os.path.dirname(__file__))
from voice_phrases import phrases
from vieneu import Vieneu
out = sys.argv[1] if len(sys.argv) > 1 else 'voice'
WANT = {'doan': 'Thục Đoan', 'son': 'Thái Sơn'}
P = phrases(); keys = sorted(P)
tts = Vieneu()
voices = tts.list_preset_voices()
idx = {'keys': {k: i for i, k in enumerate(keys)}, 'voices': []}
for slug, nm in WANT.items():
    vid = next(((v[1] if isinstance(v, (list, tuple)) else v) for v in voices if nm in (v[0] if isinstance(v, (list, tuple)) else str(v))), None)
    if vid is None: print('MISSING', nm); continue
    vd = tts.get_preset_voice(vid); d = os.path.join(out, slug); os.makedirs(d, exist_ok=True); ok = 0
    for i, k in enumerate(keys):
        try:
            text = P[k]; text = text[0].upper() + text[1:]
            if not text.endswith(('.', '!', '?')): text += '.'
            w = os.path.join(d, f'{i}.wav'); tts.save(tts.infer(text=text, voice=vd), w)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ac', '1', '-b:a', '64k', os.path.join(d, f'{i}.mp3')], check=True)
            os.remove(w); ok += 1
        except Exception: traceback.print_exc()
    idx['voices'].append(slug); print(nm, ok, '/', len(keys))
json.dump(idx, open(os.path.join(out, 'index.json'), 'w'), ensure_ascii=False)
