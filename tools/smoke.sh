#!/bin/bash
# Emulator smoke test: install, start, screenshots (phone landscape + tablet size), crash check.
set -x
API=$1
APK=$(ls app/build/outputs/apk/release/*.apk | head -1)
P=com.tomstechsolutions.car
mkdir -p shots
adb wait-for-device
for i in $(seq 1 60); do [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = "1" ] && break; sleep 5; done
sleep 45
ok=0
for i in 1 2 3; do
  adb wait-for-device
  until adb shell pm path android >/dev/null 2>&1; do sleep 5; done
  if adb install -r -g "$APK" 2>&1 | grep -q Success; then ok=1; break; fi
  echo "install try $i failed, waiting"; sleep 40
done
[ $ok = 1 ] || { echo "INSTALL FAILED (emulator)"; exit 1; }
adb logcat -c
adb shell settings put system accelerometer_rotation 0
adb shell settings put system user_rotation 1; sleep 3
adb shell am start -W -n $P/.MainActivity
sleep 3; timeout 20 adb exec-out screencap -p > shots/api${API}_1_splash.png
sleep 6; timeout 20 adb exec-out screencap -p > shots/api${API}_2_about.png
# a fake GPS position near Ballarat (Western Hwy) so the board gets live data
timeout 10 adb emu geo fix 143.85 -37.56 2>/dev/null || true
sleep 12; timeout 20 adb exec-out screencap -p > shots/api${API}_3_main.png
# tablet size
adb shell wm size 2560x1600; adb shell wm density 320; sleep 6
timeout 20 adb exec-out screencap -p > shots/api${API}_4_tablet.png
adb shell wm size reset; adb shell wm density reset; sleep 3
# portrait
adb shell settings put system user_rotation 0; sleep 5
timeout 20 adb exec-out screencap -p > shots/api${API}_5_portrait.png
# background and back: intro must NOT show again
adb shell input keyevent 3; sleep 3
adb shell am start -n $P/.MainActivity; sleep 4
adb shell settings put system user_rotation 1; sleep 4
timeout 20 adb exec-out screencap -p > shots/api${API}_6_resume.png
# Tìm Chỗ (#53 logos): tap the "Tìm Chỗ" tab of the 1280x720 stage, scaled to the screen
read W H <<< "$(adb shell wm size | grep -o '[0-9]*x[0-9]*' | tail -1 | tr x ' ')"
if [ "$W" -lt "$H" ]; then t=$W; W=$H; H=$t; fi
X=$(python3 -c "s=min($W/1280,$H/720);print(int(($W-1280*s)/2+383*s))"); Y=$(python3 -c "s=min($W/1280,$H/720);print(int(($H-720*s)/2+147*s))")
adb shell input tap $X $Y; sleep 25
timeout 20 adb exec-out screencap -p > shots/api${API}_7_search.png
PID=$(adb shell pidof $P)
adb logcat -d > shots/api${API}_logcat.txt
grep -i "chromium\|console" shots/api${API}_logcat.txt | tail -60 > shots/api${API}_console.txt || true
grep -A 30 "FATAL EXCEPTION" shots/api${API}_logcat.txt | grep -B2 -A 28 "Process: $P" > shots/api${API}_crash.txt || true
if [ -z "$PID" ] || [ -s shots/api${API}_crash.txt ]; then echo "APP CRASHED on API $API"; cat shots/api${API}_crash.txt; exit 1; fi
echo "API $API OK (pid $PID)"
