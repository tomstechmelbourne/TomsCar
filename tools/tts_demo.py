# Tom's Car — #77 demo: a few navigation phrases read by VieNeu-TTS preset voices (offline model, run on CI).
import os, sys, re, json, traceback
from vieneu import Vieneu
out = sys.argv[1] if len(sys.argv) > 1 else 'tts_out'
os.makedirs(out, exist_ok=True)
LINES = [
    "Ba trăm mét nữa, rẽ phải vô Taylors Road.",
    "Rẽ trái.",
    "Vô vòng xoay, ra lối thứ hai.",
    "Phía trước có camera tốc độ.",
    "Dạ, đang tìm Bunnings Sunshine cho Tom.",
    "Đã tới nơi, nhà của Tom.",
]
tts = Vieneu()
voices = tts.list_preset_voices()
print('VOICES', voices)
info = []
for v in voices:
    name, vid = (v[0], v[1]) if isinstance(v, (list, tuple)) else (str(v), v)
    slug = re.sub(r'[^A-Za-z0-9]+', '_', name.encode('ascii', 'ignore').decode()).strip('_') or str(vid)
    try:
        vd = tts.get_preset_voice(vid)
        for i, t in enumerate(LINES):
            a = tts.infer(text=t, voice=vd)
            tts.save(a, os.path.join(out, f'{slug}_{i+1}.wav'))
        info.append({'name': name, 'slug': slug})
        print('OK', name)
    except Exception:
        traceback.print_exc()
json.dump({'voices': info, 'lines': LINES}, open(os.path.join(out, 'info.json'), 'w'), ensure_ascii=False, indent=1)
