/* Tom's Car — English mode (0.9.10, #83).
   The screens are written in Vietnamese; when Settings → Language = English this file
   translates every text, placeholder, aria-label and title on screen as it is drawn.
   Exact phrases first, then "prefix + rest", then " · " pieces, then number patterns. */
(function () {
  const RAW = `
Dạ|OK
Dạ, phát nhạc nè|OK, playing music
Dạ, đã bật Dịu Mắt|OK, calm mode on
Dạ, đã tắt|OK, turned off
Dạ, không có tin nhắn mới|No new messages
Dạ, hết chặng ghé rồi|No more stops
Dạ, mình chưa ghi chỗ đậu xe nào|I haven't saved a parking spot yet
Dạ, mình chưa hiểu. Bạn nói lại giúp mình nha|Sorry, I didn't get that. Please say it again
Dạ, mình vẫn chưa hiểu. Bạn bấm nút mic thử lại nha|Sorry, I still didn't get that. Tap the mic and try again
Dạ, mở danh sách đài vùng này|OK, opening local radio stations
Dạ, đang tìm trạm xăng gần nhất|OK, finding the nearest fuel station
Đang bật Riêng Tư nên không đọc tin nhắn|Privacy mode is on, so I won't read messages
Rằm|Full moon
Mùng 1|New moon
Tết|Lunar New Year
Mặc định 24h|Default 24h
Mặc định km/g|Default km/h
Nhạc chào khi mở app|Welcome chime
Khoảng 2 giây · không kêu khi máy để im lặng hoặc đang phát nhạc|About 2 seconds · silent when the phone is muted or music is playing
Kiểu nhạc chào|Chime style
Bấm là nghe thử|Tap to preview
Âm lượng nhạc chào|Chime volume
So với âm lượng nhạc của máy|Relative to the phone's music volume
Chế Độ Riêng Tư|Privacy Mode
Giấu tên người gọi, nội dung tin nhắn, thông tin khách|Hide caller names, message text and customer details
Từ chối thì tự nhắn lại|Auto-reply when declining
"Mình đang lái xe, lát gọi lại nha"|"I'm driving, I'll call you back"
Tự xoá tin nhắn đã lưu (WhatsApp, Messenger…)|Auto-delete saved messages (WhatsApp, Messenger…)
Tin bắt từ thông báo|Messages caught from notifications
Kiểu đồng hồ màn hình chờ|Idle clock style
HTC là kiểu gợi ý|HTC is the suggested style
Tên địa danh to|Big place name
Hiện tên nơi đang đậu xe thật to, như app thời tiết Yahoo|Show where you're parked in big letters, like the Yahoo weather app
Hình địa danh làm nền|Place photo background
Lấy hình của nơi đó từ Wikipedia / Wikimedia Commons (cần mạng)|Photo of the place from Wikipedia / Wikimedia Commons (needs internet)
Hiện ngày âm lịch, Rằm, mùng 1, Tết — cả tiếng Việt lẫn tiếng Anh|Show the lunar date, full moon, new moon, Lunar New Year — in both languages
Kiểu số tốc độ|Speed number style
Chọn là đổi ngay trên Màn Hình Chính|Changes right away on Home
Cỡ số tốc độ|Speed number size
Vòng cung giới hạn quanh số|Limit arc around the number
Gần chạm giới hạn thì vòng gần kín|The ring nearly closes near the limit
Kiểu số tự đổi theo giao diện|Number style follows the theme
Giao diện Úc → Biển Báo Úc, Synthwave → Neon…|Australian theme → road sign, Synthwave → Neon…
Xe chạy thì nền đứng yên, mờ và tối hơn|While driving the background stays still, dimmer and darker
Hạt mưa li ti + giọt đọng trên kính; xe chạy tự tắt|Fine rain and drops on the glass; off while driving
Độ rõ thanh dưới cùng|Bottom bar visibility
Trợ lý, nhiệt máy, bình điện, ô Sắp Tới|Assistant, coolant, battery, Coming Up box
Độ rõ thanh nhạc|Music bar visibility
Chỉnh riêng với thanh dưới|Set separately from the bottom bar
Tự mờ sau 5 giây|Dim after 5 seconds
Chạm là sáng lại; cảnh báo quan trọng tự sáng|Tap to brighten; important alerts brighten by themselves
Ánh sáng chạy viền|Running edge light
Tắt cho đỡ nhức mắt khi lái|Turn off to rest your eyes while driving
Kiểu đồng hồ (thanh trên cùng)|Clock style (top bar)
Chạm đồng hồ để phóng to kiểu Lật|Tap the clock for the big flip clock
Đồng hồ tự đổi theo giao diện|Clock follows the theme
Hiện thứ, ngày|Show day and date
vd T7 14/11|e.g. Sat 14/11
Hai múi giờ SA / VIC|Two time zones SA / VIC
Khi gần hoặc qua biên giới SA|Near or across the SA border
Thêm giờ Việt Nam|Add Vietnam time
Dấu ":" nhấp nháy|Blinking ":"
Xe chạy thì tự đứng yên|Still while driving
App nhạc mặc định|Default music app
Bấm ▶ khi chưa có nhạc là phát app này (không cần thoát ra)|▶ with nothing playing starts this app (no need to leave)
Tự phát nhạc khi mở Tom’s Car|Play music when Tom’s Car opens
Phát tiếp bài đang nghe dở|Resume what was playing
Theo Tom’s Jukebox|Follow Tom’s Jukebox
Màu thanh thời gian, sóng nhạc, nút… lấy theo giao diện đang chọn bên Tom’s Jukebox|Progress bar, music wave and button colours follow the theme chosen in Tom’s Jukebox
Sóng nhạc trên viên thuốc|Music wave on the pill
Xe chạy thì sóng tự dịu lại|The wave calms down while driving
Giọng miền Nam (thu sẵn)|Southern voice (recorded)
Câu cố định (chỉ đường, cảnh báo, trả lời ngắn) đọc bằng giọng thu sẵn; câu có tên riêng vẫn dùng giọng Google|Fixed phrases (directions, alerts, short replies) use the recorded voice; sentences with names still use the Google voice
Tắt = chỉ gọi bằng nút mic / nút Bluetooth vô lăng|Off = only the mic button / steering-wheel Bluetooth button
Thấp = ít gọi nhầm nhất|Low = fewest false wake-ups
Tạm tắt "Hey Tom" khi nhạc to|Pause "Hey Tom" when music is loud
Đỡ bị gọi nhầm vì tiếng nhạc từ loa|Fewer false wake-ups from the speakers
Đồng hồ taplô thường chỉ cao hơn thực tế vài km/g|Dashboard speedos usually read a few km/h high
Mỗi 2 tuần|Every 2 weeks
Theo km đã chạy|By distance driven
Bản đồ chính|Main map
Dùng khi chỉ đường và chia màn hình|Used for directions and split screen
Road Trip + Bản Đồ|Road Trip + Map
Hình đại diện địa điểm|Place pictures
Hình bạn chụp → Wikimedia Commons → biển báo|Your photo → Wikimedia Commons → road sign
Giới hạn ước tính khi thiếu dữ liệu|Estimated limit when data is missing
50 khu dân cư / 100 ngoài thị trấn — có chữ "ước tính" dưới biển|50 built-up / 100 outside towns — marked "estimated" under the sign
Nhắc nghỉ chân mỗi|Rest reminder every
Theo giờ lái liên tục|By continuous driving time
Tắt thì nền là cảnh low-poly như cũ (đổi trong Giao Diện)|Off = low-poly scene as before (change in Themes)
Trên 10 km/g: nền low-poly đổi sang bản đồ, Tìm Chỗ / Liên Lạc tự về bản đồ|Above 10 km/h: the low-poly scene switches to the map; Find Places / Contacts go back to the map
Rẽ trái, rẽ phải, vòng xoay… bằng giọng Việt|Turn left, turn right, roundabouts… spoken
Dữ liệu OpenStreetMap — có thể thiếu chỗ|OpenStreetMap data — may miss some
Theo hướng xe: hướng chạy luôn ở phía trên, như Google Maps|Heading up: the direction of travel is always at the top, like Google Maps
Tự ghi chỗ đậu hơn 3 phút — chỉ lưu trong máy này, không gửi đi đâu|Logs stops longer than 3 minutes — kept on this phone only, never sent anywhere
Bật Dịu Mắt thì tự giảm|Lower automatically in Calm mode
Đồng hồ km kiểu cuộn|Rolling odometer
Trip A, Trip B, km tới chặng kế, vòng % chuyến|Trip A, Trip B, km to the next stop, trip % ring
Nhắc luật khi qua tiểu bang khác|State rules when crossing a border
Đọc to + hiện trên màn hình|Spoken + shown on screen
Trừ thanh tác vụ; 1 app thì phóng to hết|Leaves the taskbar; one app fills the screen
Nút nổi Tom’s Car|Tom’s Car floating button
Mờ 50% trên app khác — bấm là về Tom’s Car, kéo để dời, bấm giữ để ẩn|50% see-through over other apps — tap to return to Tom’s Car, drag to move, long-press to hide
Dải Tom’s Car ở mép|Tom’s Car edge strip
Nút về Tom’s Car, trợ lý, đổi Workspace|Back to Tom’s Car, assistant, switch Workspace
Ẩn thanh tác vụ DeX|Hide the DeX taskbar
Khi dùng Workspace (nếu máy cho phép)|While using a Workspace (if the phone allows)
Tự mở lại app bị tắt/văng|Reopen apps that close or crash
Đường Úc (mặc định)|Aussie Road (default)
Đồng Quê Wimmera|Wimmera Countryside
Ven Biển|Coast
Rừng Dandenong|Dandenong Forest
Vùng Nho Yarra|Yarra Vineyards
Núi Tuyết|Snowy Mountains
Mùa Thu Lá Vàng|Golden Autumn
Đồng Lúa Mì|Wheat Fields
Sài Gòn|Saigon
Miền Tây|Mekong Delta
Kính Mờ|Frosted Glass
Tối Giản (HUD)|Minimal (HUD)
Buồng Lái Máy Bay|Aircraft Cockpit
Thành Phố Đêm|Night City
Thể Thao (Rally)|Sport (Rally)
Thư Giãn|Relax
Neon Úc|Aussie Neon
Trung Tâm (Đức Bà)|City Centre (Notre-Dame)
Sài Gòn Về Đêm|Saigon at Night
Mưa Chiều|Afternoon Rain
Chợ Bến Thành|Bến Thành Market
Sài Gòn Xưa|Old Saigon
Cà Phê Sáng|Morning Coffee
Tết Miền Nam|Southern Tết
Không dữ liệu|No data
Nhẹ Nhàng|Gentle
Hiện Đại|Modern
Nổ Máy|Engine Start
Nhỏ|Small
Vừa|Medium
Lớn|Large
7 ngày|7 days
30 ngày|30 days
Không xoá|Never
Đang dùng|In use
Giọng Google|Google voice
Thục Đoan (nữ)|Thục Đoan (female)
Thái Sơn (nam)|Thái Sơn (male)
Mặc định|Default
Thấp|Low
Cao|High
2 giờ|2 hours
3 giờ|3 hours
Chặng Đi|Outbound
Chặng Về|Return
Hay Dùng|Favourites
Khác|Other
Đang Phát|Now Playing
Album / Nghệ Sĩ|Albums / Artists
Úc|Australia
Việt Nam|Vietnam
Thật|Realistic
Thể Thao|Sport
Xe Điện Tương Lai|Future EV
Cổ Điển 70|Classic 70s
Xe Tải Đường Dài|Long-haul Truck
Không Taplô (HUD)|No Dashboard (HUD)
Theo Giao Diện|Follow Theme
Cổ Điển|Classic
Tối Giản|Minimal
Vòng Lồng|Nested Rings
Retro Xưa|Retro
Gốc|Original
Nhật Ký|Log
Số LED|LED Digits
Kim Đồng Hồ|Analog
Biển Báo Úc|Aussie Road Sign
Lật HTC|HTC Flip
Kim Nhỏ|Small Analog
Chung|General
Xe & OBD-II|Car & OBD-II
Nhạc|Music
Ngôn ngữ, giờ, cách mở app, riêng tư, cuộc gọi|Language, time, opening apps, privacy, calls
Mở app vào thẳng|Open the app on
Luôn vào tab này sau màn hình chào|Always open this tab after the splash screen
Logo + phiên bản, tự vào Màn Hình Chính sau 3 giây, chạm để vào sớm|Logo + version, goes to Home after 3 seconds, tap to skip
Nhớ mọi lựa chọn khi thoát|Remember all choices on exit
Giao diện, tính năng, Workspace, chặng Road Trip…|Themes, features, Workspaces, Road Trip stops…
Kiểu màn hình, số tốc độ, mưa, làm mờ, dịu mắt|Screen style, speed number, rain, dimming, calm mode
App nhạc mặc định, thanh nhạc kiểu Tom’s Jukebox|Default music app, Tom’s Jukebox style music bar
Giọng nói tiếng Việt, "Hey Tom", độ nhạy|Voice, "Hey Tom", sensitivity
Cục OBD-II, hồ sơ xe, nguồn tốc độ, nhắc bảo dưỡng|OBD-II dongle, vehicle profile, speed source, service reminders
App bản đồ, chia màn hình, quãng đường, km, hình, giới hạn|Map app, split screen, distance, km, pictures, limits
Workspace trên Samsung DeX|Workspaces on Samsung DeX
✓ là đã cấp, ⚠ là còn thiếu — bấm Cấp Quyền để mở chỗ cấp|✓ granted, ⚠ missing — tap Grant to open the setting
Để hiện tên bài, thời gian|To show the song and time
Tốc độ, tên đường, Road Trip|Speed, street names, Road Trip
Pin tai nghe, OBD-II|Headphone battery, OBD-II
Thanh nhạc + tin WhatsApp, Messenger…|Music bar + WhatsApp, Messenger messages…
Nhật ký cuộc gọi + SMS + danh bạ|Call log + SMS + contacts
Tab Liên Lạc|Contacts tab
Nghe / từ chối cuộc gọi, gửi SMS|Answer / decline calls, send SMS
Thanh gọi mỏng, tự nhắn lại|Slim call bar, auto-reply
Trợ lý giọng nói|Voice assistant
Bộ đọc Google, tải 1 lần, chạy offline|Google speech engine, download once, works offline
Nhắc hẹn cạnh đồng hồ|Appointments next to the clock
Lịch (Google Calendar)|Calendar (Google Calendar)
Đọc bài đang phát / thông báo|Read now playing / notifications
Quyền đọc bài đang phát|Now-playing access
Dùng bộ đọc Google (có tiếng Việt, chạy offline)|Uses the Google speech engine (works offline)
Máy chưa có bộ đọc Google — tải "Speech Services by Google"|No Google speech engine — install "Speech Services by Google"
Cần cho app không chịu phóng to|Needed for apps that won't resize
Hiện trên app khác|Display over other apps
Dải Tom’s Car trên Waze (bản sau)|Tom’s Car strip over Waze (later version)
Đơn vị tốc độ|Speed unit
Cuộc gọi đến: thanh mỏng, không đọc tên, riêng tư|Incoming calls: slim bar, names not spoken, private
Không đọc tên ra loa — chỉ báo "Có cuộc gọi"|Names not spoken — just "Incoming call"
Giới hạn tốc độ theo vùng + báo trước + biển to khi đổi|Speed limits by area + warnings + big sign on change
Nhắc nghỉ chân sau |Rest reminder in 
Hướng Dẫn|Guide
Mở DeX Labs|Open DeX Labs
Tải Giọng Việt|Download Vietnamese voice
Khoá gõ khi xe chạy — bấm nút bên dưới hoặc nói "Hey Tom, tìm…"|Typing locked while driving — tap a button below or say "Hey Tom, find…"
Gõ tên hoặc địa chỉ|Type a name or address
Gõ tên hoặc địa chỉ (vd: Hungry Jack’s Horsham)|Type a name or address (e.g. Hungry Jack’s Horsham)
Bấm một nút để tìm|Tap a button to search
Nguồn: OpenStreetMap · logo: trang web các hãng|Source: OpenStreetMap · logos: brand websites
Tìm Chỗ Gần Đây|Nearby Places
Nghỉ Chân|Rest Stops
Café|Café
Thời tiết|Weather
Đậu Xe|Park
Gọi Thử|Test Call
Danh Sách 32 Mục|32-Item List
Mở Lại App|Restart App
Road Trip + Bản Đồ|Road Trip + Map
Đang tìm vị trí…|Finding location…
Điện thoại --|Phone --
Ghé|Stop
Màn Hình Chính|Home
➤ Hành Trình|➤ Journeys
➤ Hành Trình ▸|➤ Journeys ▸
Hành Trình|Journeys
HÀNH TRÌNH|JOURNEYS
🗺 Road Trip|🗺 Road Trip
Liên Lạc|Contacts
Tìm Chỗ|Find Places
Tìm chỗ|Find places
Cài Đặt|Settings
WORKSPACE ▸|WORKSPACE ▸
Hiện Workspace|Show Workspace
Ẩn Workspace|Hide Workspace
+ Tạo Workspace Đầu Tiên|+ Create First Workspace
1. Chọn 1, 2 hoặc 3 app (Waze, nhạc, YouTube…)|1. Pick 1, 2 or 3 apps (Waze, music, YouTube…)
2. Đặt tên, chọn có mở Road Trip không|2. Name it, choose whether Road Trip opens too
3. Lên xe bấm một cái là các app tự mở|3. In the car, one tap opens all the apps
Mở Workspace|Open Workspace
Đi đâu?|Where to?
Đi đâu? Gõ tên chỗ hoặc địa chỉ|Where to? Type a place or address
Đậu xe rồi gõ — hoặc nói "Hey Tom, đi tới…"|Type when parked — or say "Hey Tom, go to…"
Đậu xe rồi gõ nha|Type when parked
+ Thêm điểm dừng|+ Add a stop
Đi|Go
Đi ➤|Go ➤
Nói địa chỉ|Say an address
Xoá chữ|Clear text
🏠 Nhà|🏠 Home
💼 Chỗ làm|💼 Work
💼 Chỗ Làm|💼 Work
🅿 Xe đậu|🅿 Parked car
Cây xăng|Fuel
Cà phê|Coffee
Quán ăn|Restaurants
Đồ ăn nhanh|Fast food
Siêu thị|Supermarket
Siêu Thị|Supermarket
Nhà thuốc|Pharmacy
Bãi đậu|Parking
Nhà vệ sinh|Toilets
Nhà Vệ Sinh|Toilets
Sạc xe điện|EV charging
Bệnh viện|Hospital
Nhà thờ|Church
Khách sạn|Hotel
Sửa xe|Car repair
Công viên|Park
Bưu điện|Post office
Trạm Xăng|Fuel
Trạm xăng|Fuel station
Nghỉ Chân|Rest Stop
Chỗ nghỉ chân|Rest area
Chỗ nghỉ chân (Rest Area)|Rest area
Dọc đường đi · chạm để thêm điểm dừng|Along the route · tap to add a stop
Không thấy chỗ nào|Nothing found
Không thấy chỗ nào trong 30 km|Nothing within 30 km
Đang mở|Open
Đã đóng|Closed
Đang mở cửa|Open now
Đã đóng cửa|Closed now
Giờ mở: chưa rõ|Hours unknown
Đóng|Close
Huỷ|Cancel
Hủy|Cancel
Lưu|Save
Sửa|Edit
Xoá|Delete
🗑 Xoá|🗑 Delete
Thêm|Add
+ Thêm|+ Add
Tìm|Search
Mở|Open
Tắt|Off
Bật|On
Đã bật|On
Chưa bật|Off
Luôn bật|Always on
Luôn nhớ|Always
Quay lại|Back
Thu gọn|Collapse
Mở Rộng|Expand
Phóng to|Zoom in
Thu nhỏ|Zoom out
Về vị trí xe|Back to the car
Xem cả chuyến|Show the whole trip
Kiểu bản đồ|Map style
Tự Động|Auto
Tối|Dark
Sáng|Light
Địa Hình|Terrain
Vệ Tinh|Satellite
Hướng Bắc|North up
Theo hướng xe|Heading up
Bản Đồ|Map
🗺 Bản Đồ|🗺 Map
Bản đồ|Map
🏔 Cảnh Low-Poly|🏔 Low-Poly Scene
Con Đường|Road
NHIỆT MÁY|COOLANT
BÌNH ĐIỆN|BATTERY
KM/G|KM/H
CHẶNG GHÉ KẾ|NEXT STOP
SẮP TỚI|COMING UP
Chạm để đóng|Tap to close
Đóng màn hình chờ|Close the idle screen
Thanh dưới + thanh nhạc tự mờ sau 5 giây — chạm để sáng lại|Bottom bar and music bar dim after 5 seconds — tap to brighten
Chưa phát nhạc|Nothing playing
NHẠC|MUSIC
⚠ Cấp quyền|⚠ Grant access
Bài kế|Next track
Bài trước|Previous track
Đài kế|Next station
Đài trước|Previous station
Bấm ▶ để phát|Tap ▶ to play
Nhạc|Music
Nhạc & Radio|Music & Radio
Danh sách phát|Playlists
Danh Sách Phát|Playlists
Yêu thích|Favourites
Yêu Thích|Favourites
Tất Cả|All
Trộn bài|Shuffle
Trộn tất cả bài|Shuffle all
Tìm bài, nghệ sĩ|Search songs, artists
Tìm đài|Search stations
Tìm podcast|Search podcasts
Nghe đài vùng này|Local radio
Đang tải danh sách đài…|Loading stations…
Không tìm thấy đài|No stations found
Thư viện trống|Library empty
Đã Theo Dõi|Following
Đã theo dõi|Following
Tập Mới|New Episodes
Thâu đài đang nghe|Record this station
Lùi 15 giây|Back 15 seconds
Tới 30 giây|Forward 30 seconds
Trợ lý giọng nói|Voice assistant
Trợ lý đang nghe|Assistant is listening
Đang nghe… nói lệnh|Listening… say a command
Đóng trợ lý|Close assistant
Nói để trả lời…|Speak to reply…
Băng chỉ đường|Direction banner
Băng chỉ đường — chạm để đổi cỡ|Direction banner — tap to resize
Băng chỉ đường gọn — chạm để đổi cỡ|Compact banner — tap to resize
Chỉ đường đang ẩn — chạm để hiện|Directions hidden — tap to show
Đang chờ GPS…|Waiting for GPS…
Giờ tới — chạm để hiện nút|Arrival — tap for buttons
Dừng|Stop
Dừng Chỉ Đường|Stop Navigation
Bắt Đầu|Start
Huỷ đường đi|Cancel route
Tóm tắt đường đi|Route summary
Tránh thu phí|Avoid tolls
Tránh cao tốc|Avoid motorways
Tránh phà|Avoid ferries
💲 thu phí|💲 tolls
Không thu phí|No tolls
Nhanh nhất|Fastest
Ngắn hơn|Shorter
Đường khác|Other route
Mở bằng Google Maps|Open in Google Maps
Mở bằng Waze|Open in Waze
Gửi ETA|Send ETA
Gửi giờ tới bằng tin nhắn|Send arrival time by SMS
Đọc chỉ đường|Voice directions
Đang tìm đường…|Finding a route…
Đang tìm…|Searching…
Tới nơi|Arrived
TỚI NƠI|ARRIVED
DỰ KIẾN TỚI NƠI|ESTIMATED ARRIVAL
Thêm làm điểm dừng|Add as a stop
Đi tới đây|Go here
Bỏ điểm này|Remove this stop
Biển tốc độ ở đây là bao nhiêu?|What is the speed limit here?
Báo số tốc độ sai|Report wrong speed limit
ước tính|estimated
Ước tính · |Estimated ·
🏠 Nhà|🏠 Home
Nhà|Home
Chỗ Làm|Work
Chỗ làm|Work
Đang lưu: |Saved:
Chưa lưu|Not saved
Gõ địa chỉ|Type an address
Gõ địa chỉ, ví dụ 12 Nova Ave Truganina|Type an address, e.g. 12 Nova Ave Truganina
📡 Dùng vị trí hiện tại|📡 Use current location
🗺 Chọn trên bản đồ|🗺 Pick on the map
Đặt Nhà|Set Home
Đặt Chỗ Làm|Set Work
Nhà (điểm xuất phát Road Trip)|Home (Road Trip start point)
Chưa lưu — gõ địa chỉ, dùng vị trí hiện tại hoặc chọn trên bản đồ|Not saved — type an address, use the current location or pick on the map
Huỷ|Cancel
Hay Đi|Frequent
Gần Đây|Recent
Đã Lưu|Saved
Chỗ đã lưu|Saved places
💼 Lưu chỗ đang đậu là Chỗ Làm|💼 Save this parking spot as Work
Nhật ký Hành Trình|Journey log
Chưa có chuyến nào hôm nay|No trips today
Hôm nay|Today
Hôm qua|Yesterday
Ngày mai|Tomorrow
Bây giờ|Now
Gió --|Wind --
Mưa --|Rain --
Đang lấy thời tiết…|Getting the weather…
Trời quang|Clear
Nắng|Sunny
Nhiều mây|Cloudy
Có mây|Cloudy
Mưa|Rain
Mưa nhẹ|Light rain
Giông|Storm
Sương mù|Fog
Đang dò vị trí…|Finding location…
Đang dò GPS…|Finding GPS…
Mất GPS|No GPS
mất GPS|no GPS
Chưa có GPS|No GPS yet
Chưa bắt được GPS|No GPS fix yet
Chưa bắt được GPS — thử lại sau|No GPS fix yet — try again later
Chưa bắt được GPS — chờ chút rồi bấm lại|No GPS fix yet — wait a moment and tap again
Bản mẫu: cần app thật có GPS|Preview: needs the real app with GPS
Vị trí của Tom|Tom's location
📍 Vị trí của Tom|📍 Tom's location
📍 Vị trí hiện tại|📍 Current location
Từ: Vị trí hiện tại|From: current location
Điện thoại|Phone
Điện Thoại|Phone
Cuộc Gọi|Calls
Tin Nhắn|Messages
Gọi nhỡ|Missed call
Cuộc gọi đến|Incoming call
Có cuộc gọi|Incoming call
Nghe máy|Answer
Từ chối|Decline
Từ Chối|Decline
Gác Máy|Hang up
Số lạ|Unknown number
Số Lạ|Unknown number
Mình đang lái xe, lát gọi lại nha|I'm driving, I'll call you back
Đã từ chối cuộc gọi|Call declined
Trả lời nhanh|Quick reply
Đọc tin nhắn|Read messages
Gọi & Nhắn|Calls & Messages
Thoát Tom's Car?|Exit Tom's Car?
Thoát Hẳn|Exit
Chạy Nền|Run in background
Thoát hẳn sẽ tắt GPS và OBD-II. Chạy nền thì vẫn đo chuyến đi và nghe trợ lý.|Exit turns off GPS and OBD-II. In the background the app still logs trips and listens for the assistant.
Giao Diện|Themes
Kiểu giao diện|Theme
Mở Giao Diện|Open Themes
23 kiểu + kiểu đồng hồ buồng lái|23 themes + cockpit gauge styles
Nghe thử|Test voice
Nghe Thử|Test
Trợ lý nói một câu mẫu|The assistant says a sample sentence
Giọng mặc định|Default voice
Giọng đã chọn|Chosen voice
Thục Đoan|Thục Đoan
Thái Sơn|Thái Sơn
Chung|General
Ngôn ngữ|Language
Chữ trên mọi màn hình|Text on every screen
Tiếng Việt|Tiếng Việt
Kiểu giờ|Clock format
Đơn vị tốc độ|Speed unit
Trợ Lý|Assistant
Trợ lý|Assistant
Giọng đọc|Voice
Tốc độ đọc|Speech rate
Độ cao giọng|Pitch
Gọi bằng "Hey Tom"|Wake with "Hey Tom"
Độ nhạy "Hey Tom"|"Hey Tom" sensitivity
Giọng Tiếng Việt|Vietnamese voice
Giọng Tiếng Việt cho trợ lý|Vietnamese voice for the assistant
Tải Giọng Việt|Download Vietnamese voice
Bản Đồ & Road Trip|Map & Road Trip
Màn Hình Chính là bản đồ|Home screen is a map
Tự hiện bản đồ khi xe chạy|Show the map when driving
Bản đồ nằm bên|Map side
Trái|Left
Phải|Right
Độ sáng bản đồ|Map brightness
Hướng bản đồ khi chỉ đường|Map orientation while navigating
Nút tìm nhanh (Màn Hình Chính)|Quick-search buttons (Home)
Chạm để bật/tắt từng nút — kết quả hiện ngay trên bản đồ, đang chỉ đường thì tìm dọc đường|Tap to turn each button on/off — results show on the map; while navigating it searches along the route
Tự Động = Sáng ban ngày, Tối ban đêm (theo giờ mặt trời mọc/lặn)|Auto = light by day, dark at night (by sunrise/sunset)
Khoá bàn phím khi xe chạy|Lock keyboard while driving
Tắt = gõ địa chỉ lúc nào cũng được (mặc định)|Off = type an address any time (default)
Nhắc khi chạy quá tốc độ|Speeding alert
Chỉ nhắc khi biết chắc số giới hạn, quá 3 km/g, mỗi đoạn đường 1 lần|Only when the limit is known, more than 3 km/h over, once per road
Gọn, tự to khi gần chỗ rẽ|Compact, grows near a turn
Luôn lớn|Always big
Ẩn, chỉ đọc giọng|Hidden, voice only
Chạm vào băng khi đang chạy cũng đổi được|You can also tap the banner while driving
Nhắc camera tốc độ + vùng trường học|Speed camera + school zone alerts
Màn hình chờ|Idle screen
Kiểu màn hình chờ|Idle screen style
Hiện màn hình chờ sau|Show idle screen after
Khi đậu xe và lâu không đụng màn hình|When parked and the screen is untouched
Nền trời động|Animated sky
Mây trôi mượt khi đậu xe, đứng yên khi xe chạy|Clouds drift when parked, still when driving
Dự báo theo giờ|Hourly forecast
Giờ Việt Nam|Vietnam time
Hiện giờ Sài Gòn dưới ngày tháng|Show Saigon time under the date
Lịch hẹn|Appointments
Từ Google Calendar|From Google Calendar
Ngày âm lịch|Lunar date
Hình địa điểm|Place photo
Quyền & Kết Nối|Permissions & Connections
Cấp Quyền|Grant
Đã cấp|Granted
Chưa cấp|Not granted
Đã có|Installed
Chưa có|Missing
Vị trí (GPS)|Location (GPS)
Micro|Microphone
Bluetooth|Bluetooth
Cục OBD-II|OBD-II dongle
Đã nối|Connected
Chưa nối|Not connected
Chọn Cục OBD|Choose OBD dongle
Nguồn tốc độ|Speed source
GPS (mặc định)|GPS (default)
Hồ sơ xe|Vehicle profile
Nhắc thay nhớt|Oil change reminder
Nhắc bơm vỏ|Tyre pressure reminder
Dịu Mắt|Calm mode
Dịu mắt|Calm mode
Hiệu ứng mưa|Rain effect
Màn hình chào|Splash screen
Phiên bản|Version
Giới Thiệu|About
Thoát|Exit
1 phút|1 minute
3 phút|3 minutes
5 phút|5 minutes
10 phút|10 minutes
Kiểu đồng hồ|Clock style
HTC lật số|HTC flip
Lật số mini + 5 ngày|Mini flip + 5 days
Bảng sân bay|Airport board
Kim mặt kính|Glass analog
Số lớn tối giản|Big minimal
Đậu Xe|Park
Đang Chạy|Driving
Khu dân cư|Built-up area
Thị trấn|Town
Đường trường|Open road
Lên|Up
Xuống|Down
Phóng to theo màn hình DeX|Fit to the DeX screen
`;
  const D = {}; RAW.split('\n').forEach((l) => { const i = l.indexOf('|'); if (i > 0) D[l.slice(0, i)] = l.slice(i + 1); });
  const PRE = [
    ['Dạ, đang chỉ đường tới ', 'OK, directions to '], ['Dạ, đang gọi ', 'OK, calling '], ['Dạ, đang mở ', 'OK, opening '], ['Dạ, đang tìm ', 'OK, searching for '], ['Dạ, mình không tìm thấy ', "Sorry, I couldn't find "], ['Dạ, xe đậu ở ', 'Your car is parked at '], ['Dạ, còn ', 'OK, '], ['Đã lưu Nhà: ', 'Home saved: '], ['Đã lưu Chỗ Làm: ', 'Work saved: '], ['Đã lưu: ', 'Saved: '], ['Đang lưu: ', 'Saved: '], ['Đã thêm điểm dừng: ', 'Stop added: '], ['Đã thêm vào chặng ghé: ', 'Added to stops: '], ['Đã thêm ', 'Added '],
    ['Đã nối · ', 'Connected · '], ['🏁 Đã tới ', '🏁 Arrived at '], ['Đang tìm trong ', 'Searching within '], ['Trong ', 'Within '], ['Đang tìm ', 'Searching for '], ['Tới ', 'To '], ['Hẹn ', 'Appt '], ['Gió ', 'Wind '], ['Mưa ', 'Rain '],
    ['Mọc ', 'Rise '], ['Lặn ', 'Set '], ['Kiểu bản đồ: ', 'Map style: '], ['Đã chuyển sang ', 'Switched to '], ['Xe đậu ở ', 'Parked at '], ['Đang nối ', 'Connecting '], ['Nguồn: ', 'Source: '], ['Vùng hiện tại: ', 'Current region: '], ['Đã gửi qua ', 'Sent via '],
    ['Bắt Đầu · tới ', 'Start · to '], ['Chặng này: ', 'This leg: '], ['Hôm nay: ', 'Today: '], ['Đồng hồ ', 'Clock '], ['Điện thoại ', 'Phone '], ['Tốc độ ', 'Speed '], ['Thành phố ', 'City '], ['ÂL ', 'Lunar '], ['Âm lịch ', 'Lunar ']
  ].sort((a, b) => b[0].length - a[0].length);
  const RX = [
    [/^(\d+) phút$/, '$1 min'], [/^(\d+) ph$/, '$1 min'], [/(\d+) giờ (\d+) ph/g, '$1 h $2 min'], [/(\d+) giờ\b/g, '$1 h'], [/(\d+) ph\b/g, '$1 min'], [/(\d+) phút\b/g, '$1 min'],
    [/km\/g/g, 'km/h'], [/^Chúa Nhật$/, 'Sunday'], [/^Thứ Hai$/, 'Monday'], [/^Thứ Ba$/, 'Tuesday'], [/^Thứ Tư$/, 'Wednesday'], [/^Thứ Năm$/, 'Thursday'], [/^Thứ Sáu$/, 'Friday'], [/^Thứ Bảy$/, 'Saturday'],
    [/\bCN\b/g, 'Sun'], [/\bT2\b/g, 'Mon'], [/\bT3\b/g, 'Tue'], [/\bT4\b/g, 'Wed'], [/\bT5\b/g, 'Thu'], [/\bT6\b/g, 'Fri'], [/\bT7\b/g, 'Sat'], [/\bTh (\d)\b/g, (m, d) => ['', '', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][+d]],
    [/^Hôm nay\b/, 'Today'], [/mưa (\d+)%/g, 'rain $1%'], [/gió (\d+)/g, 'wind $1']
  ];
  const VI = /[ăâđêôơưàáạảãầấậẩẫằắặẳẵèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹĐ]/i;
  const cache = new Map();
  const tr = (s) => {
    if (!s) return s;
    if (!VI.test(s) && !/km\/g|\bCN\b|\bT[2-7]\b/.test(s) && D[s.trim()] == null) return s;
    if (cache.has(s)) return cache.get(s);
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/); const core = m[2]; let out = null;
    if (D[core] != null) out = D[core];
    if (out == null) { const sm = core.match(/^([^A-Za-zÀ-ỹ0-9"(]+)(.+)$/); if (sm && D[sm[2]] != null) out = sm[1] + D[sm[2]]; }
    if (out == null && core.indexOf(' · ') > 0) out = core.split(' · ').map((p) => tr(p)).join(' · ');
    if (out == null) for (const [a, b] of PRE) if (core.indexOf(a) === 0) { out = b + tr(core.slice(a.length)); break; }
    if (out == null) { out = core; RX.forEach(([r, w]) => { out = out.replace(r, w); }); }
    const res = m[1] + out + m[3]; if (cache.size > 4000) cache.clear(); cache.set(s, res); return res;
  };
  window.tcTr = (s) => (window.TC_LANG === 'en' ? tr(s) : s);
  const ATTR = ['placeholder', 'aria-label', 'title'];
  const fixEl = (el) => { ATTR.forEach((a) => { const v = el.getAttribute && el.getAttribute(a); if (v) { const t = tr(v); if (t !== v) el.setAttribute(a, t); } }); };
  const walk = (n) => {
    if (n.nodeType === 3) { const t = tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; return; }
    if (n.nodeType !== 1 || n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return;
    fixEl(n); for (let c = n.firstChild; c; c = c.nextSibling) walk(c);
  };
  let obs = null, on = false;
  const start = () => {
    if (on) return; on = true; walk(document.body);
    obs = new MutationObserver((ms) => { ms.forEach((m) => { if (m.type === 'characterData') walk(m.target); else if (m.type === 'attributes') fixEl(m.target); else m.addedNodes.forEach(walk); }); });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTR });
  };
  // called by the screen on every draw; switching back to Vietnamese reloads so every text is original again
  window.tcLangSync = (lang) => {
    const was = window.TC_LANG; window.TC_LANG = lang;
    document.documentElement.lang = lang === 'en' ? 'en' : 'vi';
    if (lang === 'en') { if (document.body) start(); } else if (was === 'en' && on) { try { location.reload(); } catch (e) {} }
  };
})();
