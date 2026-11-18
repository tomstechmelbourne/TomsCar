(function() {
  const RAW = `
D\u1EA1|OK
D\u1EA1, ph\xE1t nh\u1EA1c n\xE8|OK, playing music
D\u1EA1, \u0111\xE3 b\u1EADt D\u1ECBu M\u1EAFt|OK, calm mode on
D\u1EA1, \u0111\xE3 t\u1EAFt|OK, turned off
D\u1EA1, kh\xF4ng c\xF3 tin nh\u1EAFn m\u1EDBi|No new messages
D\u1EA1, h\u1EBFt ch\u1EB7ng gh\xE9 r\u1ED3i|No more stops
D\u1EA1, m\xECnh ch\u01B0a ghi ch\u1ED7 \u0111\u1EADu xe n\xE0o|I haven't saved a parking spot yet
D\u1EA1, m\xECnh ch\u01B0a hi\u1EC3u. B\u1EA1n n\xF3i l\u1EA1i gi\xFAp m\xECnh nha|Sorry, I didn't get that. Please say it again
D\u1EA1, m\xECnh v\u1EABn ch\u01B0a hi\u1EC3u. B\u1EA1n b\u1EA5m n\xFAt mic th\u1EED l\u1EA1i nha|Sorry, I still didn't get that. Tap the mic and try again
D\u1EA1, m\u1EDF danh s\xE1ch \u0111\xE0i v\xF9ng n\xE0y|OK, opening local radio stations
D\u1EA1, \u0111ang t\xECm tr\u1EA1m x\u0103ng g\u1EA7n nh\u1EA5t|OK, finding the nearest fuel station
\u0110ang b\u1EADt Ri\xEAng T\u01B0 n\xEAn kh\xF4ng \u0111\u1ECDc tin nh\u1EAFn|Privacy mode is on, so I won't read messages
R\u1EB1m|Full moon
M\xF9ng 1|New moon
T\u1EBFt|Lunar New Year
M\u1EB7c \u0111\u1ECBnh 24h|Default 24h
M\u1EB7c \u0111\u1ECBnh km/g|Default km/h
Nh\u1EA1c ch\xE0o khi m\u1EDF app|Welcome chime
Kho\u1EA3ng 2 gi\xE2y \xB7 kh\xF4ng k\xEAu khi m\xE1y \u0111\u1EC3 im l\u1EB7ng ho\u1EB7c \u0111ang ph\xE1t nh\u1EA1c|About 2 seconds \xB7 silent when the phone is muted or music is playing
Ki\u1EC3u nh\u1EA1c ch\xE0o|Chime style
B\u1EA5m l\xE0 nghe th\u1EED|Tap to preview
\xC2m l\u01B0\u1EE3ng nh\u1EA1c ch\xE0o|Chime volume
So v\u1EDBi \xE2m l\u01B0\u1EE3ng nh\u1EA1c c\u1EE7a m\xE1y|Relative to the phone's music volume
Ch\u1EBF \u0110\u1ED9 Ri\xEAng T\u01B0|Privacy Mode
Gi\u1EA5u t\xEAn ng\u01B0\u1EDDi g\u1ECDi, n\u1ED9i dung tin nh\u1EAFn, th\xF4ng tin kh\xE1ch|Hide caller names, message text and customer details
T\u1EEB ch\u1ED1i th\xEC t\u1EF1 nh\u1EAFn l\u1EA1i|Auto-reply when declining
"M\xECnh \u0111ang l\xE1i xe, l\xE1t g\u1ECDi l\u1EA1i nha"|"I'm driving, I'll call you back"
T\u1EF1 xo\xE1 tin nh\u1EAFn \u0111\xE3 l\u01B0u (WhatsApp, Messenger\u2026)|Auto-delete saved messages (WhatsApp, Messenger\u2026)
Tin b\u1EAFt t\u1EEB th\xF4ng b\xE1o|Messages caught from notifications
Ki\u1EC3u \u0111\u1ED3ng h\u1ED3 m\xE0n h\xECnh ch\u1EDD|Idle clock style
HTC l\xE0 ki\u1EC3u g\u1EE3i \xFD|HTC is the suggested style
T\xEAn \u0111\u1ECBa danh to|Big place name
Hi\u1EC7n t\xEAn n\u01A1i \u0111ang \u0111\u1EADu xe th\u1EADt to, nh\u01B0 app th\u1EDDi ti\u1EBFt Yahoo|Show where you're parked in big letters, like the Yahoo weather app
H\xECnh \u0111\u1ECBa danh l\xE0m n\u1EC1n|Place photo background
L\u1EA5y h\xECnh c\u1EE7a n\u01A1i \u0111\xF3 t\u1EEB Wikipedia / Wikimedia Commons (c\u1EA7n m\u1EA1ng)|Photo of the place from Wikipedia / Wikimedia Commons (needs internet)
Hi\u1EC7n ng\xE0y \xE2m l\u1ECBch, R\u1EB1m, m\xF9ng 1, T\u1EBFt \u2014 c\u1EA3 ti\u1EBFng Vi\u1EC7t l\u1EABn ti\u1EBFng Anh|Show the lunar date, full moon, new moon, Lunar New Year \u2014 in both languages
Ki\u1EC3u s\u1ED1 t\u1ED1c \u0111\u1ED9|Speed number style
Ch\u1ECDn l\xE0 \u0111\u1ED5i ngay tr\xEAn m\xE0n h\xECnh H\xE0nh Tr\xECnh|Changes right away on the Drive screen
C\u1EE1 s\u1ED1 t\u1ED1c \u0111\u1ED9|Speed number size
V\xF2ng cung gi\u1EDBi h\u1EA1n quanh s\u1ED1|Limit arc around the number
G\u1EA7n ch\u1EA1m gi\u1EDBi h\u1EA1n th\xEC v\xF2ng g\u1EA7n k\xEDn|The ring nearly closes near the limit
Ki\u1EC3u s\u1ED1 t\u1EF1 \u0111\u1ED5i theo giao di\u1EC7n|Number style follows the theme
Giao di\u1EC7n \xDAc \u2192 Bi\u1EC3n B\xE1o \xDAc, Synthwave \u2192 Neon\u2026|Australian theme \u2192 road sign, Synthwave \u2192 Neon\u2026
Xe ch\u1EA1y th\xEC n\u1EC1n \u0111\u1EE9ng y\xEAn, m\u1EDD v\xE0 t\u1ED1i h\u01A1n|While driving the background stays still, dimmer and darker
H\u1EA1t m\u01B0a li ti + gi\u1ECDt \u0111\u1ECDng tr\xEAn k\xEDnh; xe ch\u1EA1y t\u1EF1 t\u1EAFt|Fine rain and drops on the glass; off while driving
\u0110\u1ED9 r\xF5 thanh d\u01B0\u1EDBi c\xF9ng|Bottom bar visibility
Tr\u1EE3 l\xFD, nhi\u1EC7t m\xE1y, b\xECnh \u0111i\u1EC7n, \xF4 S\u1EAFp T\u1EDBi|Assistant, coolant, battery, Coming Up box
\u0110\u1ED9 r\xF5 thanh nh\u1EA1c|Music bar visibility
Ch\u1EC9nh ri\xEAng v\u1EDBi thanh d\u01B0\u1EDBi|Set separately from the bottom bar
T\u1EF1 m\u1EDD sau 5 gi\xE2y|Dim after 5 seconds
Ch\u1EA1m l\xE0 s\xE1ng l\u1EA1i; c\u1EA3nh b\xE1o quan tr\u1ECDng t\u1EF1 s\xE1ng|Tap to brighten; important alerts brighten by themselves
\xC1nh s\xE1ng ch\u1EA1y vi\u1EC1n|Running edge light
T\u1EAFt cho \u0111\u1EE1 nh\u1EE9c m\u1EAFt khi l\xE1i|Turn off to rest your eyes while driving
Ki\u1EC3u \u0111\u1ED3ng h\u1ED3 (thanh tr\xEAn c\xF9ng)|Clock style (top bar)
Ch\u1EA1m \u0111\u1ED3ng h\u1ED3 \u0111\u1EC3 ph\xF3ng to ki\u1EC3u L\u1EADt|Tap the clock for the big flip clock
\u0110\u1ED3ng h\u1ED3 t\u1EF1 \u0111\u1ED5i theo giao di\u1EC7n|Clock follows the theme
Hi\u1EC7n th\u1EE9, ng\xE0y|Show day and date
vd T7 14/11|e.g. Sat 14/11
Hai m\xFAi gi\u1EDD SA / VIC|Two time zones SA / VIC
Khi g\u1EA7n ho\u1EB7c qua bi\xEAn gi\u1EDBi SA|Near or across the SA border
Th\xEAm gi\u1EDD Vi\u1EC7t Nam|Add Vietnam time
D\u1EA5u ":" nh\u1EA5p nh\xE1y|Blinking ":"
Xe ch\u1EA1y th\xEC t\u1EF1 \u0111\u1EE9ng y\xEAn|Still while driving
App nh\u1EA1c m\u1EB7c \u0111\u1ECBnh|Default music app
B\u1EA5m \u25B6 khi ch\u01B0a c\xF3 nh\u1EA1c l\xE0 ph\xE1t app n\xE0y (kh\xF4ng c\u1EA7n tho\xE1t ra)|\u25B6 with nothing playing starts this app (no need to leave)
T\u1EF1 ph\xE1t nh\u1EA1c khi m\u1EDF Tom\u2019s Car|Play music when Tom\u2019s Car opens
Ph\xE1t ti\u1EBFp b\xE0i \u0111ang nghe d\u1EDF|Resume what was playing
Theo Tom\u2019s Jukebox|Follow Tom\u2019s Jukebox
M\xE0u thanh th\u1EDDi gian, s\xF3ng nh\u1EA1c, n\xFAt\u2026 l\u1EA5y theo giao di\u1EC7n \u0111ang ch\u1ECDn b\xEAn Tom\u2019s Jukebox|Progress bar, music wave and button colours follow the theme chosen in Tom\u2019s Jukebox
S\xF3ng nh\u1EA1c tr\xEAn vi\xEAn thu\u1ED1c|Music wave on the pill
Xe ch\u1EA1y th\xEC s\xF3ng t\u1EF1 d\u1ECBu l\u1EA1i|The wave calms down while driving
Gi\u1ECDng mi\u1EC1n Nam (thu s\u1EB5n)|Southern voice (recorded)
C\xE2u c\u1ED1 \u0111\u1ECBnh (ch\u1EC9 \u0111\u01B0\u1EDDng, c\u1EA3nh b\xE1o, tr\u1EA3 l\u1EDDi ng\u1EAFn) \u0111\u1ECDc b\u1EB1ng gi\u1ECDng thu s\u1EB5n; c\xE2u c\xF3 t\xEAn ri\xEAng v\u1EABn d\xF9ng gi\u1ECDng Google|Fixed phrases (directions, alerts, short replies) use the recorded voice; sentences with names still use the Google voice
T\u1EAFt = ch\u1EC9 g\u1ECDi b\u1EB1ng n\xFAt mic / n\xFAt Bluetooth v\xF4 l\u0103ng|Off = only the mic button / steering-wheel Bluetooth button
Th\u1EA5p = \xEDt g\u1ECDi nh\u1EA7m nh\u1EA5t|Low = fewest false wake-ups
T\u1EA1m t\u1EAFt "Hey Tom" khi nh\u1EA1c to|Pause "Hey Tom" when music is loud
\u0110\u1EE1 b\u1ECB g\u1ECDi nh\u1EA7m v\xEC ti\u1EBFng nh\u1EA1c t\u1EEB loa|Fewer false wake-ups from the speakers
\u0110\u1ED3ng h\u1ED3 tapl\xF4 th\u01B0\u1EDDng ch\u1EC9 cao h\u01A1n th\u1EF1c t\u1EBF v\xE0i km/g|Dashboard speedos usually read a few km/h high
M\u1ED7i 2 tu\u1EA7n|Every 2 weeks
Theo km \u0111\xE3 ch\u1EA1y|By distance driven
B\u1EA3n \u0111\u1ED3 ch\xEDnh|Main map
D\xF9ng khi ch\u1EC9 \u0111\u01B0\u1EDDng v\xE0 chia m\xE0n h\xECnh|Used for directions and split screen
Road Trip + B\u1EA3n \u0110\u1ED3|Road Trip + Map
H\xECnh \u0111\u1EA1i di\u1EC7n \u0111\u1ECBa \u0111i\u1EC3m|Place pictures
H\xECnh b\u1EA1n ch\u1EE5p \u2192 Wikimedia Commons \u2192 bi\u1EC3n b\xE1o|Your photo \u2192 Wikimedia Commons \u2192 road sign
Gi\u1EDBi h\u1EA1n \u01B0\u1EDBc t\xEDnh khi thi\u1EBFu d\u1EEF li\u1EC7u|Estimated limit when data is missing
50 khu d\xE2n c\u01B0 / 100 ngo\xE0i th\u1ECB tr\u1EA5n \u2014 c\xF3 ch\u1EEF "\u01B0\u1EDBc t\xEDnh" d\u01B0\u1EDBi bi\u1EC3n|50 built-up / 100 outside towns \u2014 marked "estimated" under the sign
Nh\u1EAFc ngh\u1EC9 ch\xE2n m\u1ED7i|Rest reminder every
Theo gi\u1EDD l\xE1i li\xEAn t\u1EE5c|By continuous driving time
T\u1EAFt th\xEC n\u1EC1n l\xE0 c\u1EA3nh low-poly nh\u01B0 c\u0169 (\u0111\u1ED5i trong Giao Di\u1EC7n)|Off = low-poly scene as before (change in Themes)
Tr\xEAn 10 km/g: n\u1EC1n low-poly \u0111\u1ED5i sang b\u1EA3n \u0111\u1ED3, T\xECm Ch\u1ED7 / Li\xEAn L\u1EA1c t\u1EF1 v\u1EC1 b\u1EA3n \u0111\u1ED3|Above 10 km/h: the low-poly scene switches to the map; Find Places / Contacts go back to the map
R\u1EBD tr\xE1i, r\u1EBD ph\u1EA3i, v\xF2ng xoay\u2026 b\u1EB1ng gi\u1ECDng Vi\u1EC7t|Turn left, turn right, roundabouts\u2026 spoken
D\u1EEF li\u1EC7u OpenStreetMap \u2014 c\xF3 th\u1EC3 thi\u1EBFu ch\u1ED7|OpenStreetMap data \u2014 may miss some
Theo h\u01B0\u1EDBng xe: h\u01B0\u1EDBng ch\u1EA1y lu\xF4n \u1EDF ph\xEDa tr\xEAn, nh\u01B0 Google Maps|Heading up: the direction of travel is always at the top, like Google Maps
T\u1EF1 ghi ch\u1ED7 \u0111\u1EADu h\u01A1n 3 ph\xFAt \u2014 ch\u1EC9 l\u01B0u trong m\xE1y n\xE0y, kh\xF4ng g\u1EEDi \u0111i \u0111\xE2u|Logs stops longer than 3 minutes \u2014 kept on this phone only, never sent anywhere
B\u1EADt D\u1ECBu M\u1EAFt th\xEC t\u1EF1 gi\u1EA3m|Lower automatically in Calm mode
\u0110\u1ED3ng h\u1ED3 km ki\u1EC3u cu\u1ED9n|Rolling odometer
Trip A, Trip B, km t\u1EDBi ch\u1EB7ng k\u1EBF, v\xF2ng % chuy\u1EBFn|Trip A, Trip B, km to the next stop, trip % ring
Nh\u1EAFc lu\u1EADt khi qua ti\u1EC3u bang kh\xE1c|State rules when crossing a border
\u0110\u1ECDc to + hi\u1EC7n tr\xEAn m\xE0n h\xECnh|Spoken + shown on screen
Tr\u1EEB thanh t\xE1c v\u1EE5; 1 app th\xEC ph\xF3ng to h\u1EBFt|Leaves the taskbar; one app fills the screen
N\xFAt n\u1ED5i Tom\u2019s Car|Tom\u2019s Car floating button
M\u1EDD 50% tr\xEAn app kh\xE1c \u2014 b\u1EA5m l\xE0 v\u1EC1 Tom\u2019s Car, k\xE9o \u0111\u1EC3 d\u1EDDi, b\u1EA5m gi\u1EEF \u0111\u1EC3 \u1EA9n|50% see-through over other apps \u2014 tap to return to Tom\u2019s Car, drag to move, long-press to hide
D\u1EA3i Tom\u2019s Car \u1EDF m\xE9p|Tom\u2019s Car edge strip
N\xFAt v\u1EC1 Tom\u2019s Car, tr\u1EE3 l\xFD, \u0111\u1ED5i Workspace|Back to Tom\u2019s Car, assistant, switch Workspace
\u1EA8n thanh t\xE1c v\u1EE5 DeX|Hide the DeX taskbar
Khi d\xF9ng Workspace (n\u1EBFu m\xE1y cho ph\xE9p)|While using a Workspace (if the phone allows)
T\u1EF1 m\u1EDF l\u1EA1i app b\u1ECB t\u1EAFt/v\u0103ng|Reopen apps that close or crash
\u0110\u01B0\u1EDDng \xDAc (m\u1EB7c \u0111\u1ECBnh)|Aussie Road (default)
\u0110\u1ED3ng Qu\xEA Wimmera|Wimmera Countryside
Ven Bi\u1EC3n|Coast
R\u1EEBng Dandenong|Dandenong Forest
V\xF9ng Nho Yarra|Yarra Vineyards
N\xFAi Tuy\u1EBFt|Snowy Mountains
M\xF9a Thu L\xE1 V\xE0ng|Golden Autumn
\u0110\u1ED3ng L\xFAa M\xEC|Wheat Fields
S\xE0i G\xF2n|Saigon
Mi\u1EC1n T\xE2y|Mekong Delta
K\xEDnh M\u1EDD|Frosted Glass
T\u1ED1i Gi\u1EA3n (HUD)|Minimal (HUD)
Bu\u1ED3ng L\xE1i M\xE1y Bay|Aircraft Cockpit
Th\xE0nh Ph\u1ED1 \u0110\xEAm|Night City
Th\u1EC3 Thao (Rally)|Sport (Rally)
Th\u01B0 Gi\xE3n|Relax
Neon \xDAc|Aussie Neon
Trung T\xE2m (\u0110\u1EE9c B\xE0)|City Centre (Notre-Dame)
S\xE0i G\xF2n V\u1EC1 \u0110\xEAm|Saigon at Night
M\u01B0a Chi\u1EC1u|Afternoon Rain
Ch\u1EE3 B\u1EBFn Th\xE0nh|B\u1EBFn Th\xE0nh Market
S\xE0i G\xF2n X\u01B0a|Old Saigon
C\xE0 Ph\xEA S\xE1ng|Morning Coffee
T\u1EBFt Mi\u1EC1n Nam|Southern T\u1EBFt
Kh\xF4ng d\u1EEF li\u1EC7u|No data
Nh\u1EB9 Nh\xE0ng|Gentle
Hi\u1EC7n \u0110\u1EA1i|Modern
N\u1ED5 M\xE1y|Engine Start
Nh\u1ECF|Small
V\u1EEBa|Medium
L\u1EDBn|Large
7 ng\xE0y|7 days
30 ng\xE0y|30 days
Kh\xF4ng xo\xE1|Never
\u0110ang d\xF9ng|In use
Gi\u1ECDng Google|Google voice
Th\u1EE5c \u0110oan (n\u1EEF)|Th\u1EE5c \u0110oan (female)
Th\xE1i S\u01A1n (nam)|Th\xE1i S\u01A1n (male)
M\u1EB7c \u0111\u1ECBnh|Default
Th\u1EA5p|Low
Cao|High
2 gi\u1EDD|2 hours
3 gi\u1EDD|3 hours
Ch\u1EB7ng \u0110i|Outbound
Ch\u1EB7ng V\u1EC1|Return
Hay D\xF9ng|Favourites
Kh\xE1c|Other
\u0110ang Ph\xE1t|Now Playing
Album / Ngh\u1EC7 S\u0129|Albums / Artists
\xDAc|Australia
Vi\u1EC7t Nam|Vietnam
Th\u1EADt|Realistic
Th\u1EC3 Thao|Sport
Xe \u0110i\u1EC7n T\u01B0\u01A1ng Lai|Future EV
C\u1ED5 \u0110i\u1EC3n 70|Classic 70s
Xe T\u1EA3i \u0110\u01B0\u1EDDng D\xE0i|Long-haul Truck
Kh\xF4ng Tapl\xF4 (HUD)|No Dashboard (HUD)
Theo Giao Di\u1EC7n|Follow Theme
C\u1ED5 \u0110i\u1EC3n|Classic
T\u1ED1i Gi\u1EA3n|Minimal
V\xF2ng L\u1ED3ng|Nested Rings
Retro X\u01B0a|Retro
G\u1ED1c|Original
Nh\u1EADt K\xFD|Log
S\u1ED1 LED|LED Digits
Kim \u0110\u1ED3ng H\u1ED3|Analog
Bi\u1EC3n B\xE1o \xDAc|Aussie Road Sign
L\u1EADt HTC|HTC Flip
Kim Nh\u1ECF|Small Analog
Chung|General
Xe & OBD-II|Car & OBD-II
Nh\u1EA1c|Music
Ng\xF4n ng\u1EEF, gi\u1EDD, c\xE1ch m\u1EDF app, ri\xEAng t\u01B0, cu\u1ED9c g\u1ECDi|Language, time, opening apps, privacy, calls
M\u1EDF app v\xE0o th\u1EB3ng|Open the app on
Lu\xF4n v\xE0o tab n\xE0y sau m\xE0n h\xECnh ch\xE0o|Always open this tab after the splash screen
Logo + phi\xEAn b\u1EA3n, t\u1EF1 v\xE0o M\xE0n H\xECnh Ch\xEDnh sau 3 gi\xE2y, ch\u1EA1m \u0111\u1EC3 v\xE0o s\u1EDBm|Logo + version, goes to Home after 3 seconds, tap to skip
Nh\u1EDB m\u1ECDi l\u1EF1a ch\u1ECDn khi tho\xE1t|Remember all choices on exit
Giao di\u1EC7n, t\xEDnh n\u0103ng, Workspace, ch\u1EB7ng Road Trip\u2026|Themes, features, Workspaces, Road Trip stops\u2026
Ki\u1EC3u m\xE0n h\xECnh, s\u1ED1 t\u1ED1c \u0111\u1ED9, m\u01B0a, l\xE0m m\u1EDD, d\u1ECBu m\u1EAFt|Screen style, speed number, rain, dimming, calm mode
App nh\u1EA1c m\u1EB7c \u0111\u1ECBnh, thanh nh\u1EA1c ki\u1EC3u Tom\u2019s Jukebox|Default music app, Tom\u2019s Jukebox style music bar
Gi\u1ECDng n\xF3i ti\u1EBFng Vi\u1EC7t, "Hey Tom", \u0111\u1ED9 nh\u1EA1y|Voice, "Hey Tom", sensitivity
C\u1EE5c OBD-II, h\u1ED3 s\u01A1 xe, ngu\u1ED3n t\u1ED1c \u0111\u1ED9, nh\u1EAFc b\u1EA3o d\u01B0\u1EE1ng|OBD-II dongle, vehicle profile, speed source, service reminders
App b\u1EA3n \u0111\u1ED3, chia m\xE0n h\xECnh, qu\xE3ng \u0111\u01B0\u1EDDng, km, h\xECnh, gi\u1EDBi h\u1EA1n|Map app, split screen, distance, km, pictures, limits
Workspace tr\xEAn Samsung DeX|Workspaces on Samsung DeX
\u2713 l\xE0 \u0111\xE3 c\u1EA5p, \u26A0 l\xE0 c\xF2n thi\u1EBFu \u2014 b\u1EA5m C\u1EA5p Quy\u1EC1n \u0111\u1EC3 m\u1EDF ch\u1ED7 c\u1EA5p|\u2713 granted, \u26A0 missing \u2014 tap Grant to open the setting
\u0110\u1EC3 hi\u1EC7n t\xEAn b\xE0i, th\u1EDDi gian|To show the song and time
T\u1ED1c \u0111\u1ED9, t\xEAn \u0111\u01B0\u1EDDng, Road Trip|Speed, street names, Road Trip
Pin tai nghe, OBD-II|Headphone battery, OBD-II
Thanh nh\u1EA1c + tin WhatsApp, Messenger\u2026|Music bar + WhatsApp, Messenger messages\u2026
Nh\u1EADt k\xFD cu\u1ED9c g\u1ECDi + SMS + danh b\u1EA1|Call log + SMS + contacts
Tab Li\xEAn L\u1EA1c|Contacts tab
Nghe / t\u1EEB ch\u1ED1i cu\u1ED9c g\u1ECDi, g\u1EEDi SMS|Answer / decline calls, send SMS
Thanh g\u1ECDi m\u1ECFng, t\u1EF1 nh\u1EAFn l\u1EA1i|Slim call bar, auto-reply
Tr\u1EE3 l\xFD gi\u1ECDng n\xF3i|Voice assistant
B\u1ED9 \u0111\u1ECDc Google, t\u1EA3i 1 l\u1EA7n, ch\u1EA1y offline|Google speech engine, download once, works offline
Nh\u1EAFc h\u1EB9n c\u1EA1nh \u0111\u1ED3ng h\u1ED3|Appointments next to the clock
L\u1ECBch (Google Calendar)|Calendar (Google Calendar)
\u0110\u1ECDc b\xE0i \u0111ang ph\xE1t / th\xF4ng b\xE1o|Read now playing / notifications
Quy\u1EC1n \u0111\u1ECDc b\xE0i \u0111ang ph\xE1t|Now-playing access
D\xF9ng b\u1ED9 \u0111\u1ECDc Google (c\xF3 ti\u1EBFng Vi\u1EC7t, ch\u1EA1y offline)|Uses the Google speech engine (works offline)
M\xE1y ch\u01B0a c\xF3 b\u1ED9 \u0111\u1ECDc Google \u2014 t\u1EA3i "Speech Services by Google"|No Google speech engine \u2014 install "Speech Services by Google"
C\u1EA7n cho app kh\xF4ng ch\u1ECBu ph\xF3ng to|Needed for apps that won't resize
Hi\u1EC7n tr\xEAn app kh\xE1c|Display over other apps
D\u1EA3i Tom\u2019s Car tr\xEAn Waze (b\u1EA3n sau)|Tom\u2019s Car strip over Waze (later version)
\u0110\u01A1n v\u1ECB t\u1ED1c \u0111\u1ED9|Speed unit
Cu\u1ED9c g\u1ECDi \u0111\u1EBFn: thanh m\u1ECFng, kh\xF4ng \u0111\u1ECDc t\xEAn, ri\xEAng t\u01B0|Incoming calls: slim bar, names not spoken, private
Kh\xF4ng \u0111\u1ECDc t\xEAn ra loa \u2014 ch\u1EC9 b\xE1o "C\xF3 cu\u1ED9c g\u1ECDi"|Names not spoken \u2014 just "Incoming call"
Gi\u1EDBi h\u1EA1n t\u1ED1c \u0111\u1ED9 theo v\xF9ng + b\xE1o tr\u01B0\u1EDBc + bi\u1EC3n to khi \u0111\u1ED5i|Speed limits by area + warnings + big sign on change
Nh\u1EAFc ngh\u1EC9 ch\xE2n sau |Rest reminder in 
H\u01B0\u1EDBng D\u1EABn|Guide
M\u1EDF DeX Labs|Open DeX Labs
T\u1EA3i Gi\u1ECDng Vi\u1EC7t|Download Vietnamese voice
Kho\xE1 g\xF5 khi xe ch\u1EA1y \u2014 b\u1EA5m n\xFAt b\xEAn d\u01B0\u1EDBi ho\u1EB7c n\xF3i "Hey Tom, t\xECm\u2026"|Typing locked while driving \u2014 tap a button below or say "Hey Tom, find\u2026"
G\xF5 t\xEAn ho\u1EB7c \u0111\u1ECBa ch\u1EC9|Type a name or address
G\xF5 t\xEAn ho\u1EB7c \u0111\u1ECBa ch\u1EC9 (vd: Hungry Jack\u2019s Horsham)|Type a name or address (e.g. Hungry Jack\u2019s Horsham)
B\u1EA5m m\u1ED9t n\xFAt \u0111\u1EC3 t\xECm|Tap a button to search
Ngu\u1ED3n: OpenStreetMap \xB7 logo: trang web c\xE1c h\xE3ng|Source: OpenStreetMap \xB7 logos: brand websites
T\xECm Ch\u1ED7 G\u1EA7n \u0110\xE2y|Nearby Places
Ngh\u1EC9 Ch\xE2n|Rest Stops
Caf\xE9|Caf\xE9
Th\u1EDDi ti\u1EBFt|Weather
\u0110\u1EADu Xe|Park
G\u1ECDi Th\u1EED|Test Call
Danh S\xE1ch 32 M\u1EE5c|32-Item List
M\u1EDF L\u1EA1i App|Restart App
Road Trip + B\u1EA3n \u0110\u1ED3|Road Trip + Map
\u0110ang t\xECm v\u1ECB tr\xED\u2026|Finding location\u2026
\u0110i\u1EC7n tho\u1EA1i --|Phone --
Gh\xE9|Stop
M\xE0n H\xECnh Ch\xEDnh|Home
\u27A4 H\xE0nh Tr\xECnh|\u27A4 Drive
\u27A4 H\xE0nh Tr\xECnh \u25B8|\u27A4 Journeys \u25B8
H\xE0nh Tr\xECnh|Drive
H\xC0NH TR\xCCNH|JOURNEYS
\u{1F5FA} Road Trip|\u{1F5FA} Road Trip
Li\xEAn L\u1EA1c|Contacts
T\xECm Ch\u1ED7|Find Places
T\xECm ch\u1ED7|Find places
C\xE0i \u0110\u1EB7t|Settings
WORKSPACE \u25B8|WORKSPACE \u25B8
Hi\u1EC7n Workspace|Show Workspace
\u1EA8n Workspace|Hide Workspace
+ T\u1EA1o Workspace \u0110\u1EA7u Ti\xEAn|+ Create First Workspace
1. Ch\u1ECDn 1, 2 ho\u1EB7c 3 app (Waze, nh\u1EA1c, YouTube\u2026)|1. Pick 1, 2 or 3 apps (Waze, music, YouTube\u2026)
2. \u0110\u1EB7t t\xEAn, ch\u1ECDn c\xF3 m\u1EDF Road Trip kh\xF4ng|2. Name it, choose whether Road Trip opens too
3. L\xEAn xe b\u1EA5m m\u1ED9t c\xE1i l\xE0 c\xE1c app t\u1EF1 m\u1EDF|3. In the car, one tap opens all the apps
M\u1EDF Workspace|Open Workspace
\u0110i \u0111\xE2u?|Where to?
\u0110i \u0111\xE2u? G\xF5 t\xEAn ch\u1ED7 ho\u1EB7c \u0111\u1ECBa ch\u1EC9|Where to? Type a place or address
\u0110\u1EADu xe r\u1ED3i g\xF5 \u2014 ho\u1EB7c n\xF3i "Hey Tom, \u0111i t\u1EDBi\u2026"|Type when parked \u2014 or say "Hey Tom, go to\u2026"
\u0110\u1EADu xe r\u1ED3i g\xF5 nha|Type when parked
+ Th\xEAm \u0111i\u1EC3m d\u1EEBng|+ Add a stop
\u0110i|Go
\u0110i \u27A4|Go \u27A4
N\xF3i \u0111\u1ECBa ch\u1EC9|Say an address
Xo\xE1 ch\u1EEF|Clear text
\u{1F3E0} Nh\xE0|\u{1F3E0} Home
\u{1F4BC} Ch\u1ED7 l\xE0m|\u{1F4BC} Work
\u{1F4BC} Ch\u1ED7 L\xE0m|\u{1F4BC} Work
\u{1F17F} Xe \u0111\u1EADu|\u{1F17F} Parked car
C\xE2y x\u0103ng|Fuel
C\xE0 ph\xEA|Coffee
Qu\xE1n \u0103n|Restaurants
\u0110\u1ED3 \u0103n nhanh|Fast food
Si\xEAu th\u1ECB|Supermarket
Si\xEAu Th\u1ECB|Supermarket
Nh\xE0 thu\u1ED1c|Pharmacy
B\xE3i \u0111\u1EADu|Parking
Nh\xE0 v\u1EC7 sinh|Toilets
Nh\xE0 V\u1EC7 Sinh|Toilets
S\u1EA1c xe \u0111i\u1EC7n|EV charging
B\u1EC7nh vi\u1EC7n|Hospital
Nh\xE0 th\u1EDD|Church
Kh\xE1ch s\u1EA1n|Hotel
S\u1EEDa xe|Car repair
C\xF4ng vi\xEAn|Park
B\u01B0u \u0111i\u1EC7n|Post office
Tr\u1EA1m X\u0103ng|Fuel
Tr\u1EA1m x\u0103ng|Fuel station
Ngh\u1EC9 Ch\xE2n|Rest Stop
Ch\u1ED7 ngh\u1EC9 ch\xE2n|Rest area
Ch\u1ED7 ngh\u1EC9 ch\xE2n (Rest Area)|Rest area
D\u1ECDc \u0111\u01B0\u1EDDng \u0111i \xB7 ch\u1EA1m \u0111\u1EC3 th\xEAm \u0111i\u1EC3m d\u1EEBng|Along the route \xB7 tap to add a stop
Kh\xF4ng th\u1EA5y ch\u1ED7 n\xE0o|Nothing found
Kh\xF4ng th\u1EA5y ch\u1ED7 n\xE0o trong 30 km|Nothing within 30 km
\u0110ang m\u1EDF|Open
\u0110\xE3 \u0111\xF3ng|Closed
\u0110ang m\u1EDF c\u1EEDa|Open now
\u0110\xE3 \u0111\xF3ng c\u1EEDa|Closed now
Gi\u1EDD m\u1EDF: ch\u01B0a r\xF5|Hours unknown
\u0110\xF3ng|Close
Hu\u1EF7|Cancel
H\u1EE7y|Cancel
L\u01B0u|Save
S\u1EEDa|Edit
Xo\xE1|Delete
\u{1F5D1} Xo\xE1|\u{1F5D1} Delete
Th\xEAm|Add
+ Th\xEAm|+ Add
T\xECm|Search
M\u1EDF|Open
T\u1EAFt|Off
B\u1EADt|On
\u0110\xE3 b\u1EADt|On
Ch\u01B0a b\u1EADt|Off
Lu\xF4n b\u1EADt|Always on
Lu\xF4n nh\u1EDB|Always
Quay l\u1EA1i|Back
Thu g\u1ECDn|Collapse
M\u1EDF R\u1ED9ng|Expand
Ph\xF3ng to|Zoom in
Thu nh\u1ECF|Zoom out
V\u1EC1 v\u1ECB tr\xED xe|Back to the car
Xem c\u1EA3 chuy\u1EBFn|Show the whole trip
Ki\u1EC3u b\u1EA3n \u0111\u1ED3|Map style
T\u1EF1 \u0110\u1ED9ng|Auto
T\u1ED1i|Dark
S\xE1ng|Light
\u0110\u1ECBa H\xECnh|Terrain
V\u1EC7 Tinh|Satellite
H\u01B0\u1EDBng B\u1EAFc|North up
Theo h\u01B0\u1EDBng xe|Heading up
B\u1EA3n \u0110\u1ED3|Map
\u{1F5FA} B\u1EA3n \u0110\u1ED3|\u{1F5FA} Map
B\u1EA3n \u0111\u1ED3|Map
\u{1F3D4} C\u1EA3nh Low-Poly|\u{1F3D4} Low-Poly Scene
Con \u0110\u01B0\u1EDDng|Road
NHI\u1EC6T M\xC1Y|COOLANT
B\xCCNH \u0110I\u1EC6N|BATTERY
KM/G|KM/H
CH\u1EB6NG GH\xC9 K\u1EBE|NEXT STOP
S\u1EAEP T\u1EDAI|COMING UP
Ch\u1EA1m \u0111\u1EC3 \u0111\xF3ng|Tap to close
\u0110\xF3ng m\xE0n h\xECnh ch\u1EDD|Close the idle screen
Thanh d\u01B0\u1EDBi + thanh nh\u1EA1c t\u1EF1 m\u1EDD sau 5 gi\xE2y \u2014 ch\u1EA1m \u0111\u1EC3 s\xE1ng l\u1EA1i|Bottom bar and music bar dim after 5 seconds \u2014 tap to brighten
Ch\u01B0a ph\xE1t nh\u1EA1c|Nothing playing
NH\u1EA0C|MUSIC
\u26A0 C\u1EA5p quy\u1EC1n|\u26A0 Grant access
B\xE0i k\u1EBF|Next track
B\xE0i tr\u01B0\u1EDBc|Previous track
\u0110\xE0i k\u1EBF|Next station
\u0110\xE0i tr\u01B0\u1EDBc|Previous station
B\u1EA5m \u25B6 \u0111\u1EC3 ph\xE1t|Tap \u25B6 to play
Nh\u1EA1c|Music
Nh\u1EA1c & Radio|Music & Radio
Danh s\xE1ch ph\xE1t|Playlists
Danh S\xE1ch Ph\xE1t|Playlists
Y\xEAu th\xEDch|Favourites
Y\xEAu Th\xEDch|Favourites
T\u1EA5t C\u1EA3|All
Tr\u1ED9n b\xE0i|Shuffle
Tr\u1ED9n t\u1EA5t c\u1EA3 b\xE0i|Shuffle all
T\xECm b\xE0i, ngh\u1EC7 s\u0129|Search songs, artists
T\xECm \u0111\xE0i|Search stations
T\xECm podcast|Search podcasts
Nghe \u0111\xE0i v\xF9ng n\xE0y|Local radio
\u0110ang t\u1EA3i danh s\xE1ch \u0111\xE0i\u2026|Loading stations\u2026
Kh\xF4ng t\xECm th\u1EA5y \u0111\xE0i|No stations found
Th\u01B0 vi\u1EC7n tr\u1ED1ng|Library empty
\u0110\xE3 Theo D\xF5i|Following
\u0110\xE3 theo d\xF5i|Following
T\u1EADp M\u1EDBi|New Episodes
Th\xE2u \u0111\xE0i \u0111ang nghe|Record this station
L\xF9i 15 gi\xE2y|Back 15 seconds
T\u1EDBi 30 gi\xE2y|Forward 30 seconds
Tr\u1EE3 l\xFD gi\u1ECDng n\xF3i|Voice assistant
Tr\u1EE3 l\xFD \u0111ang nghe|Assistant is listening
\u0110ang nghe\u2026 n\xF3i l\u1EC7nh|Listening\u2026 say a command
\u0110\xF3ng tr\u1EE3 l\xFD|Close assistant
N\xF3i \u0111\u1EC3 tr\u1EA3 l\u1EDDi\u2026|Speak to reply\u2026
B\u0103ng ch\u1EC9 \u0111\u01B0\u1EDDng|Direction banner
B\u0103ng ch\u1EC9 \u0111\u01B0\u1EDDng \u2014 ch\u1EA1m \u0111\u1EC3 \u0111\u1ED5i c\u1EE1|Direction banner \u2014 tap to resize
B\u0103ng ch\u1EC9 \u0111\u01B0\u1EDDng g\u1ECDn \u2014 ch\u1EA1m \u0111\u1EC3 \u0111\u1ED5i c\u1EE1|Compact banner \u2014 tap to resize
Ch\u1EC9 \u0111\u01B0\u1EDDng \u0111ang \u1EA9n \u2014 ch\u1EA1m \u0111\u1EC3 hi\u1EC7n|Directions hidden \u2014 tap to show
\u0110ang ch\u1EDD GPS\u2026|Waiting for GPS\u2026
Gi\u1EDD t\u1EDBi \u2014 ch\u1EA1m \u0111\u1EC3 hi\u1EC7n n\xFAt|Arrival \u2014 tap for buttons
D\u1EEBng|Stop
D\u1EEBng Ch\u1EC9 \u0110\u01B0\u1EDDng|Stop Navigation
B\u1EAFt \u0110\u1EA7u|Start
Hu\u1EF7 \u0111\u01B0\u1EDDng \u0111i|Cancel route
T\xF3m t\u1EAFt \u0111\u01B0\u1EDDng \u0111i|Route summary
Tr\xE1nh thu ph\xED|Avoid tolls
Tr\xE1nh cao t\u1ED1c|Avoid motorways
Tr\xE1nh ph\xE0|Avoid ferries
\u{1F4B2} thu ph\xED|\u{1F4B2} tolls
Kh\xF4ng thu ph\xED|No tolls
Nhanh nh\u1EA5t|Fastest
Ng\u1EAFn h\u01A1n|Shorter
\u0110\u01B0\u1EDDng kh\xE1c|Other route
M\u1EDF b\u1EB1ng Google Maps|Open in Google Maps
M\u1EDF b\u1EB1ng Waze|Open in Waze
G\u1EEDi ETA|Send ETA
G\u1EEDi gi\u1EDD t\u1EDBi b\u1EB1ng tin nh\u1EAFn|Send arrival time by SMS
\u0110\u1ECDc ch\u1EC9 \u0111\u01B0\u1EDDng|Voice directions
\u0110ang t\xECm \u0111\u01B0\u1EDDng\u2026|Finding a route\u2026
\u0110ang t\xECm\u2026|Searching\u2026
T\u1EDBi n\u01A1i|Arrived
T\u1EDAI N\u01A0I|ARRIVED
D\u1EF0 KI\u1EBEN T\u1EDAI N\u01A0I|ESTIMATED ARRIVAL
Th\xEAm l\xE0m \u0111i\u1EC3m d\u1EEBng|Add as a stop
\u0110i t\u1EDBi \u0111\xE2y|Go here
B\u1ECF \u0111i\u1EC3m n\xE0y|Remove this stop
Bi\u1EC3n t\u1ED1c \u0111\u1ED9 \u1EDF \u0111\xE2y l\xE0 bao nhi\xEAu?|What is the speed limit here?
B\xE1o s\u1ED1 t\u1ED1c \u0111\u1ED9 sai|Report wrong speed limit
\u01B0\u1EDBc t\xEDnh|estimated
\u01AF\u1EDBc t\xEDnh \xB7 |Estimated \xB7
\u{1F3E0} Nh\xE0|\u{1F3E0} Home
Nh\xE0|Home
Ch\u1ED7 L\xE0m|Work
Ch\u1ED7 l\xE0m|Work
\u0110ang l\u01B0u: |Saved:
Ch\u01B0a l\u01B0u|Not saved
G\xF5 \u0111\u1ECBa ch\u1EC9|Type an address
G\xF5 \u0111\u1ECBa ch\u1EC9, v\xED d\u1EE5 12 Nova Ave Truganina|Type an address, e.g. 12 Nova Ave Truganina
\u{1F4E1} D\xF9ng v\u1ECB tr\xED hi\u1EC7n t\u1EA1i|\u{1F4E1} Use current location
\u{1F5FA} Ch\u1ECDn tr\xEAn b\u1EA3n \u0111\u1ED3|\u{1F5FA} Pick on the map
\u0110\u1EB7t Nh\xE0|Set Home
\u0110\u1EB7t Ch\u1ED7 L\xE0m|Set Work
Nh\xE0 (\u0111i\u1EC3m xu\u1EA5t ph\xE1t Road Trip)|Home (Road Trip start point)
Ch\u01B0a l\u01B0u \u2014 g\xF5 \u0111\u1ECBa ch\u1EC9, d\xF9ng v\u1ECB tr\xED hi\u1EC7n t\u1EA1i ho\u1EB7c ch\u1ECDn tr\xEAn b\u1EA3n \u0111\u1ED3|Not saved \u2014 type an address, use the current location or pick on the map
Hu\u1EF7|Cancel
Hay \u0110i|Frequent
G\u1EA7n \u0110\xE2y|Recent
\u0110\xE3 L\u01B0u|Saved
Ch\u1ED7 \u0111\xE3 l\u01B0u|Saved places
\u{1F4BC} L\u01B0u ch\u1ED7 \u0111ang \u0111\u1EADu l\xE0 Ch\u1ED7 L\xE0m|\u{1F4BC} Save this parking spot as Work
Nh\u1EADt k\xFD H\xE0nh Tr\xECnh|Journey log
Ch\u01B0a c\xF3 chuy\u1EBFn n\xE0o h\xF4m nay|No trips today
H\xF4m nay|Today
H\xF4m qua|Yesterday
Ng\xE0y mai|Tomorrow
B\xE2y gi\u1EDD|Now
Gi\xF3 --|Wind --
M\u01B0a --|Rain --
\u0110ang l\u1EA5y th\u1EDDi ti\u1EBFt\u2026|Getting the weather\u2026
Tr\u1EDDi quang|Clear
N\u1EAFng|Sunny
Nhi\u1EC1u m\xE2y|Cloudy
C\xF3 m\xE2y|Cloudy
M\u01B0a|Rain
M\u01B0a nh\u1EB9|Light rain
Gi\xF4ng|Storm
S\u01B0\u01A1ng m\xF9|Fog
\u0110ang d\xF2 v\u1ECB tr\xED\u2026|Finding location\u2026
\u0110ang d\xF2 GPS\u2026|Finding GPS\u2026
M\u1EA5t GPS|No GPS
m\u1EA5t GPS|no GPS
Ch\u01B0a c\xF3 GPS|No GPS yet
Ch\u01B0a b\u1EAFt \u0111\u01B0\u1EE3c GPS|No GPS fix yet
Ch\u01B0a b\u1EAFt \u0111\u01B0\u1EE3c GPS \u2014 th\u1EED l\u1EA1i sau|No GPS fix yet \u2014 try again later
Ch\u01B0a b\u1EAFt \u0111\u01B0\u1EE3c GPS \u2014 ch\u1EDD ch\xFAt r\u1ED3i b\u1EA5m l\u1EA1i|No GPS fix yet \u2014 wait a moment and tap again
B\u1EA3n m\u1EABu: c\u1EA7n app th\u1EADt c\xF3 GPS|Preview: needs the real app with GPS
V\u1ECB tr\xED c\u1EE7a Tom|Tom's location
\u{1F4CD} V\u1ECB tr\xED c\u1EE7a Tom|\u{1F4CD} Tom's location
\u{1F4CD} V\u1ECB tr\xED hi\u1EC7n t\u1EA1i|\u{1F4CD} Current location
T\u1EEB: V\u1ECB tr\xED hi\u1EC7n t\u1EA1i|From: current location
\u0110i\u1EC7n tho\u1EA1i|Phone
\u0110i\u1EC7n Tho\u1EA1i|Phone
Cu\u1ED9c G\u1ECDi|Calls
Tin Nh\u1EAFn|Messages
G\u1ECDi nh\u1EE1|Missed call
Cu\u1ED9c g\u1ECDi \u0111\u1EBFn|Incoming call
C\xF3 cu\u1ED9c g\u1ECDi|Incoming call
Nghe m\xE1y|Answer
T\u1EEB ch\u1ED1i|Decline
T\u1EEB Ch\u1ED1i|Decline
G\xE1c M\xE1y|Hang up
S\u1ED1 l\u1EA1|Unknown number
S\u1ED1 L\u1EA1|Unknown number
M\xECnh \u0111ang l\xE1i xe, l\xE1t g\u1ECDi l\u1EA1i nha|I'm driving, I'll call you back
\u0110\xE3 t\u1EEB ch\u1ED1i cu\u1ED9c g\u1ECDi|Call declined
Tr\u1EA3 l\u1EDDi nhanh|Quick reply
\u0110\u1ECDc tin nh\u1EAFn|Read messages
G\u1ECDi & Nh\u1EAFn|Calls & Messages
Tho\xE1t Tom's Car?|Exit Tom's Car?
Tho\xE1t H\u1EB3n|Exit
Ch\u1EA1y N\u1EC1n|Run in background
Tho\xE1t h\u1EB3n s\u1EBD t\u1EAFt GPS v\xE0 OBD-II. Ch\u1EA1y n\u1EC1n th\xEC v\u1EABn \u0111o chuy\u1EBFn \u0111i v\xE0 nghe tr\u1EE3 l\xFD.|Exit turns off GPS and OBD-II. In the background the app still logs trips and listens for the assistant.
Giao Di\u1EC7n|Themes
Ki\u1EC3u giao di\u1EC7n|Theme
M\u1EDF Giao Di\u1EC7n|Open Themes
23 ki\u1EC3u + ki\u1EC3u \u0111\u1ED3ng h\u1ED3 bu\u1ED3ng l\xE1i|23 themes + cockpit gauge styles
Nghe th\u1EED|Test voice
Nghe Th\u1EED|Test
Tr\u1EE3 l\xFD n\xF3i m\u1ED9t c\xE2u m\u1EABu|The assistant says a sample sentence
Gi\u1ECDng m\u1EB7c \u0111\u1ECBnh|Default voice
Gi\u1ECDng \u0111\xE3 ch\u1ECDn|Chosen voice
Th\u1EE5c \u0110oan|Th\u1EE5c \u0110oan
Th\xE1i S\u01A1n|Th\xE1i S\u01A1n
Chung|General
Ng\xF4n ng\u1EEF|Language
Ch\u1EEF tr\xEAn m\u1ECDi m\xE0n h\xECnh|Text on every screen
Ti\u1EBFng Vi\u1EC7t|Ti\u1EBFng Vi\u1EC7t
Ki\u1EC3u gi\u1EDD|Clock format
\u0110\u01A1n v\u1ECB t\u1ED1c \u0111\u1ED9|Speed unit
Tr\u1EE3 L\xFD|Assistant
Tr\u1EE3 l\xFD|Assistant
Gi\u1ECDng \u0111\u1ECDc|Voice
T\u1ED1c \u0111\u1ED9 \u0111\u1ECDc|Speech rate
\u0110\u1ED9 cao gi\u1ECDng|Pitch
G\u1ECDi b\u1EB1ng "Hey Tom"|Wake with "Hey Tom"
\u0110\u1ED9 nh\u1EA1y "Hey Tom"|"Hey Tom" sensitivity
Gi\u1ECDng Ti\u1EBFng Vi\u1EC7t|Vietnamese voice
Gi\u1ECDng Ti\u1EBFng Vi\u1EC7t cho tr\u1EE3 l\xFD|Vietnamese voice for the assistant
T\u1EA3i Gi\u1ECDng Vi\u1EC7t|Download Vietnamese voice
B\u1EA3n \u0110\u1ED3 & Road Trip|Map & Road Trip
M\xE0n h\xECnh H\xE0nh Tr\xECnh l\xE0 b\u1EA3n \u0111\u1ED3|Drive screen is a map
T\u1EF1 hi\u1EC7n b\u1EA3n \u0111\u1ED3 khi xe ch\u1EA1y|Show the map when driving
B\u1EA3n \u0111\u1ED3 n\u1EB1m b\xEAn|Map side
Tr\xE1i|Left
Ph\u1EA3i|Right
\u0110\u1ED9 s\xE1ng b\u1EA3n \u0111\u1ED3|Map brightness
H\u01B0\u1EDBng b\u1EA3n \u0111\u1ED3 khi ch\u1EC9 \u0111\u01B0\u1EDDng|Map orientation while navigating
N\xFAt t\xECm nhanh (H\xE0nh Tr\xECnh)|Quick-search buttons (Drive screen)
Ch\u1EA1m \u0111\u1EC3 b\u1EADt/t\u1EAFt t\u1EEBng n\xFAt \u2014 k\u1EBFt qu\u1EA3 hi\u1EC7n ngay tr\xEAn b\u1EA3n \u0111\u1ED3, \u0111ang ch\u1EC9 \u0111\u01B0\u1EDDng th\xEC t\xECm d\u1ECDc \u0111\u01B0\u1EDDng|Tap to turn each button on/off \u2014 results show on the map; while navigating it searches along the route
T\u1EF1 \u0110\u1ED9ng = S\xE1ng ban ng\xE0y, T\u1ED1i ban \u0111\xEAm (theo gi\u1EDD m\u1EB7t tr\u1EDDi m\u1ECDc/l\u1EB7n)|Auto = light by day, dark at night (by sunrise/sunset)
Kho\xE1 b\xE0n ph\xEDm khi xe ch\u1EA1y|Lock keyboard while driving
T\u1EAFt = g\xF5 \u0111\u1ECBa ch\u1EC9 l\xFAc n\xE0o c\u0169ng \u0111\u01B0\u1EE3c (m\u1EB7c \u0111\u1ECBnh)|Off = type an address any time (default)
Nh\u1EAFc khi ch\u1EA1y qu\xE1 t\u1ED1c \u0111\u1ED9|Speeding alert
Ch\u1EC9 nh\u1EAFc khi bi\u1EBFt ch\u1EAFc s\u1ED1 gi\u1EDBi h\u1EA1n, qu\xE1 3 km/g, m\u1ED7i \u0111o\u1EA1n \u0111\u01B0\u1EDDng 1 l\u1EA7n|Only when the limit is known, more than 3 km/h over, once per road
G\u1ECDn, t\u1EF1 to khi g\u1EA7n ch\u1ED7 r\u1EBD|Compact, grows near a turn
Lu\xF4n l\u1EDBn|Always big
\u1EA8n, ch\u1EC9 \u0111\u1ECDc gi\u1ECDng|Hidden, voice only
Ch\u1EA1m v\xE0o b\u0103ng khi \u0111ang ch\u1EA1y c\u0169ng \u0111\u1ED5i \u0111\u01B0\u1EE3c|You can also tap the banner while driving
Nh\u1EAFc camera t\u1ED1c \u0111\u1ED9 + v\xF9ng tr\u01B0\u1EDDng h\u1ECDc|Speed camera + school zone alerts
M\xE0n h\xECnh ch\u1EDD|Idle screen
Ki\u1EC3u m\xE0n h\xECnh ch\u1EDD|Idle screen style
Hi\u1EC7n m\xE0n h\xECnh ch\u1EDD sau|Show idle screen after
Khi \u0111\u1EADu xe v\xE0 l\xE2u kh\xF4ng \u0111\u1EE5ng m\xE0n h\xECnh|When parked and the screen is untouched
N\u1EC1n tr\u1EDDi \u0111\u1ED9ng|Animated sky
M\xE2y tr\xF4i m\u01B0\u1EE3t khi \u0111\u1EADu xe, \u0111\u1EE9ng y\xEAn khi xe ch\u1EA1y|Clouds drift when parked, still when driving
D\u1EF1 b\xE1o theo gi\u1EDD|Hourly forecast
Gi\u1EDD Vi\u1EC7t Nam|Vietnam time
Hi\u1EC7n gi\u1EDD S\xE0i G\xF2n d\u01B0\u1EDBi ng\xE0y th\xE1ng|Show Saigon time under the date
L\u1ECBch h\u1EB9n|Appointments
T\u1EEB Google Calendar|From Google Calendar
Ng\xE0y \xE2m l\u1ECBch|Lunar date
H\xECnh \u0111\u1ECBa \u0111i\u1EC3m|Place photo
Quy\u1EC1n & K\u1EBFt N\u1ED1i|Permissions & Connections
C\u1EA5p Quy\u1EC1n|Grant
\u0110\xE3 c\u1EA5p|Granted
Ch\u01B0a c\u1EA5p|Not granted
\u0110\xE3 c\xF3|Installed
Ch\u01B0a c\xF3|Missing
V\u1ECB tr\xED (GPS)|Location (GPS)
Micro|Microphone
Bluetooth|Bluetooth
C\u1EE5c OBD-II|OBD-II dongle
\u0110\xE3 n\u1ED1i|Connected
Ch\u01B0a n\u1ED1i|Not connected
Ch\u1ECDn C\u1EE5c OBD|Choose OBD dongle
Ngu\u1ED3n t\u1ED1c \u0111\u1ED9|Speed source
GPS (m\u1EB7c \u0111\u1ECBnh)|GPS (default)
H\u1ED3 s\u01A1 xe|Vehicle profile
Nh\u1EAFc thay nh\u1EDBt|Oil change reminder
Nh\u1EAFc b\u01A1m v\u1ECF|Tyre pressure reminder
D\u1ECBu M\u1EAFt|Calm mode
D\u1ECBu m\u1EAFt|Calm mode
Hi\u1EC7u \u1EE9ng m\u01B0a|Rain effect
M\xE0n h\xECnh ch\xE0o|Splash screen
Phi\xEAn b\u1EA3n|Version
Gi\u1EDBi Thi\u1EC7u|About
Tho\xE1t|Exit
1 ph\xFAt|1 minute
3 ph\xFAt|3 minutes
5 ph\xFAt|5 minutes
10 ph\xFAt|10 minutes
Ki\u1EC3u \u0111\u1ED3ng h\u1ED3|Clock style
HTC l\u1EADt s\u1ED1|HTC flip
L\u1EADt s\u1ED1 mini + 5 ng\xE0y|Mini flip + 5 days
B\u1EA3ng s\xE2n bay|Airport board
Kim m\u1EB7t k\xEDnh|Glass analog
S\u1ED1 l\u1EDBn t\u1ED1i gi\u1EA3n|Big minimal
\u0110\u1EADu Xe|Park
\u0110ang Ch\u1EA1y|Driving
Khu d\xE2n c\u01B0|Built-up area
Th\u1ECB tr\u1EA5n|Town
\u0110\u01B0\u1EDDng tr\u01B0\u1EDDng|Open road
L\xEAn|Up
Xu\u1ED1ng|Down
Ph\xF3ng to theo m\xE0n h\xECnh DeX|Fit to the DeX screen
`;
  const D = {};
  RAW.split("\n").forEach((l) => {
    const i = l.indexOf("|");
    if (i > 0) D[l.slice(0, i)] = l.slice(i + 1);
  });
  const PRE = [
    ["D\u1EA1, \u0111ang ch\u1EC9 \u0111\u01B0\u1EDDng t\u1EDBi ", "OK, directions to "],
    ["D\u1EA1, \u0111ang g\u1ECDi ", "OK, calling "],
    ["D\u1EA1, \u0111ang m\u1EDF ", "OK, opening "],
    ["D\u1EA1, \u0111ang t\xECm ", "OK, searching for "],
    ["D\u1EA1, m\xECnh kh\xF4ng t\xECm th\u1EA5y ", "Sorry, I couldn't find "],
    ["D\u1EA1, xe \u0111\u1EADu \u1EDF ", "Your car is parked at "],
    ["D\u1EA1, c\xF2n ", "OK, "],
    ["\u0110\xE3 l\u01B0u Nh\xE0: ", "Home saved: "],
    ["\u0110\xE3 l\u01B0u Ch\u1ED7 L\xE0m: ", "Work saved: "],
    ["\u0110\xE3 l\u01B0u: ", "Saved: "],
    ["\u0110ang l\u01B0u: ", "Saved: "],
    ["\u0110\xE3 th\xEAm \u0111i\u1EC3m d\u1EEBng: ", "Stop added: "],
    ["\u0110\xE3 th\xEAm v\xE0o ch\u1EB7ng gh\xE9: ", "Added to stops: "],
    ["\u0110\xE3 th\xEAm ", "Added "],
    ["\u0110\xE3 n\u1ED1i \xB7 ", "Connected \xB7 "],
    ["\u{1F3C1} \u0110\xE3 t\u1EDBi ", "\u{1F3C1} Arrived at "],
    ["\u0110ang t\xECm trong ", "Searching within "],
    ["Trong ", "Within "],
    ["\u0110ang t\xECm ", "Searching for "],
    ["T\u1EDBi ", "To "],
    ["H\u1EB9n ", "Appt "],
    ["Gi\xF3 ", "Wind "],
    ["M\u01B0a ", "Rain "],
    ["M\u1ECDc ", "Rise "],
    ["L\u1EB7n ", "Set "],
    ["Ki\u1EC3u b\u1EA3n \u0111\u1ED3: ", "Map style: "],
    ["\u0110\xE3 chuy\u1EC3n sang ", "Switched to "],
    ["Xe \u0111\u1EADu \u1EDF ", "Parked at "],
    ["\u0110ang n\u1ED1i ", "Connecting "],
    ["Ngu\u1ED3n: ", "Source: "],
    ["V\xF9ng hi\u1EC7n t\u1EA1i: ", "Current region: "],
    ["\u0110\xE3 g\u1EEDi qua ", "Sent via "],
    ["B\u1EAFt \u0110\u1EA7u \xB7 t\u1EDBi ", "Start \xB7 to "],
    ["Ch\u1EB7ng n\xE0y: ", "This leg: "],
    ["H\xF4m nay: ", "Today: "],
    ["\u0110\u1ED3ng h\u1ED3 ", "Clock "],
    ["\u0110i\u1EC7n tho\u1EA1i ", "Phone "],
    ["T\u1ED1c \u0111\u1ED9 ", "Speed "],
    ["Th\xE0nh ph\u1ED1 ", "City "],
    ["\xC2L ", "Lunar "],
    ["\xC2m l\u1ECBch ", "Lunar "]
  ].sort((a, b) => b[0].length - a[0].length);
  const RX = [
    [/^(\d+) phút$/, "$1 min"],
    [/^(\d+) ph$/, "$1 min"],
    [/(\d+) giờ (\d+) ph/g, "$1 h $2 min"],
    [/(\d+) giờ\b/g, "$1 h"],
    [/(\d+) ph\b/g, "$1 min"],
    [/(\d+) phút\b/g, "$1 min"],
    [/km\/g/g, "km/h"],
    [/^Chúa Nhật$/, "Sunday"],
    [/^Thứ Hai$/, "Monday"],
    [/^Thứ Ba$/, "Tuesday"],
    [/^Thứ Tư$/, "Wednesday"],
    [/^Thứ Năm$/, "Thursday"],
    [/^Thứ Sáu$/, "Friday"],
    [/^Thứ Bảy$/, "Saturday"],
    [/\bCN\b/g, "Sun"],
    [/\bT2\b/g, "Mon"],
    [/\bT3\b/g, "Tue"],
    [/\bT4\b/g, "Wed"],
    [/\bT5\b/g, "Thu"],
    [/\bT6\b/g, "Fri"],
    [/\bT7\b/g, "Sat"],
    [/\bTh (\d)\b/g, (m, d) => ["", "", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][+d]],
    [/^Hôm nay\b/, "Today"],
    [/mưa (\d+)%/g, "rain $1%"],
    [/gió (\d+)/g, "wind $1"]
  ];
  const VI = /[ăâđêôơưàáạảãầấậẩẫằắặẳẵèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹĐ]/i;
  const cache = /* @__PURE__ */ new Map();
  const tr = (s) => {
    if (!s) return s;
    if (!VI.test(s) && !/km\/g|\bCN\b|\bT[2-7]\b/.test(s) && D[s.trim()] == null) return s;
    if (cache.has(s)) return cache.get(s);
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const core = m[2];
    let out = null;
    if (D[core] != null) out = D[core];
    if (out == null) {
      const sm = core.match(/^([^A-Za-zÀ-ỹ0-9"(]+)(.+)$/);
      if (sm && D[sm[2]] != null) out = sm[1] + D[sm[2]];
    }
    if (out == null && core.indexOf(" \xB7 ") > 0) out = core.split(" \xB7 ").map((p) => tr(p)).join(" \xB7 ");
    if (out == null) {
      for (const [a, b] of PRE) if (core.indexOf(a) === 0) {
        out = b + tr(core.slice(a.length));
        break;
      }
    }
    if (out == null) {
      out = core;
      RX.forEach(([r, w]) => {
        out = out.replace(r, w);
      });
    }
    const res = m[1] + out + m[3];
    if (cache.size > 4e3) cache.clear();
    cache.set(s, res);
    return res;
  };
  window.tcTr = (s) => window.TC_LANG === "en" ? tr(s) : s;
  const ATTR = ["placeholder", "aria-label", "title"];
  const fixEl = (el) => {
    ATTR.forEach((a) => {
      const v = el.getAttribute && el.getAttribute(a);
      if (v) {
        const t = tr(v);
        if (t !== v) el.setAttribute(a, t);
      }
    });
  };
  const walk = (n) => {
    if (n.nodeType === 3) {
      const t = tr(n.nodeValue);
      if (t !== n.nodeValue) n.nodeValue = t;
      return;
    }
    if (n.nodeType !== 1 || n.tagName === "SCRIPT" || n.tagName === "STYLE") return;
    fixEl(n);
    for (let c = n.firstChild; c; c = c.nextSibling) walk(c);
  };
  let obs = null, on = false;
  const start = () => {
    if (on) return;
    on = true;
    walk(document.body);
    obs = new MutationObserver((ms) => {
      ms.forEach((m) => {
        if (m.type === "characterData") walk(m.target);
        else if (m.type === "attributes") fixEl(m.target);
        else m.addedNodes.forEach(walk);
      });
    });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTR });
  };
  window.tcLangSync = (lang) => {
    const was = window.TC_LANG;
    window.TC_LANG = lang;
    document.documentElement.lang = lang === "en" ? "en" : "vi";
    if (lang === "en") {
      if (document.body) start();
    } else if (was === "en" && on) {
      try {
        location.reload();
      } catch (e) {
      }
    }
  };
})();
