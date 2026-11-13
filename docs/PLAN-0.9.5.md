# Tom's Car 0.9.5-beta — build plan (approved by Tom 14/11/2026)

All 33 items from board 8 (Fixes.dc.html, canvas 36ac348a…) + clock item 33 (no demo). Offline maps → later.

## Architecture
- Two stacked 1280x720 layers in `web/index.html`:
  - Layer A `#scene` = Main.dc.html (cockpit scene, 23 themes, theme modal). Its own UI (header, workspace column,
    footer, RT tab, tablist, intro, gauges) is hidden in app mode via `data-ui` attributes added by build_web.py.
  - Layer B `#ui` = App.dc.html (from Fixes.dc.html): all new UI. Demo-only bits carry `data-demo` and are hidden.
    `pointer-events:none` on the root, `auto` on panels/buttons. B hides itself while A's theme modal is open.
- Shared: `window.TCN.call(action,arg)` → Kotlin; `tcLive(json)` pushes live data to BOTH layers.
- Settings in localStorage (domStorage on). Photos stored by native in files/photos, served at /files/.

## Native actions (Bridge.call)
ready, settings, exit(hard|bg), media(prev|toggle|next|volume), nav(addr), launch(json ws), apps (→ tcApps),
call(answer|decline|end|mute|speaker|dial:<num>), sms(send json), calllog (→ tcCallLog), msgs (→ tcMsgs),
radio(play url|stop), voice(start|stop|hotword on/off|say text), photo(pick|camera stopId), perm(<name>),
dexLabs, privacy.

## Web-side data (fetch)
- Open-Meteo (weather), Overpass (places, maxspeed), Wikidata/Commons (brand logos, place photos),
  radio-browser.info (station stream URLs by name).

## Known limits to tell Tom
- "Auto privacy when another phone joins the car Bluetooth" cannot be detected from this phone → manual toggle.
- Hiding the DeX taskbar cannot be done by an app → instructions only.
- Split screen divider resizes our window; Waze window is re-launched with new bounds on release (DeX only).
- Spotify/YouTube Music queue only if the app exposes it.
