# Tom's Car – Nội Dung Build

*Cập nhật 13/11/2026 · Tom's Technology Solutions*

## 1. Tổng quan

- App Android biến điện thoại / tablet / Samsung DeX thành màn hình giải trí trên xe (giống CarOS). Dùng riêng cho Tom.
- Máy thử: S21 Ultra, Note 20 Ultra, Note 8, Pixel + các cỡ tablet và DeX.
- Quy ước chung:
  - Song ngữ Việt / Anh, chữ miền Nam (đậu xe, quẹo…), xưng hô thân thiện.
  - Giờ 24h (đổi được 12h), đơn vị km/g (tiếng Anh km/h).
  - Mọi tính năng đều có công tắc Mở / Tắt riêng.
  - Không dùng phông Sài Gòn 1985 trên giao diện; chữ thường, dễ đọc.
- Logo: chiếc xe thể thao nét lướt màu cam #FBB040 trên chữ CAR; chữ TOM'S + CAR phông Bahnschrift.

## 2. Chia đợt build

### Đợt 1 – bản 0.9.0
- Mở app: Màn Hình Chào → Giới Thiệu → Màn Hình Chính (Giới Thiệu chỉ hiện khi khởi động mới, không hiện khi quay lại từ nền).
- Màn hình chính 2 tab: Màn Hình Chính / Road Trip.
- Thanh trên cùng: pin điện thoại + thiết bị Bluetooth, GPS / Bluetooth / OBD, thời tiết icon động theo vị trí, đồng hồ.
- Thanh dưới: trợ lý (nút), nhiệt máy, điện bình, ô "Sắp Tới", thanh nhạc kiểu Tom's Jukebox.
- 23 giao diện + tự đổi theo giờ; 7 kiểu đồng hồ; chế độ Dịu Mắt / Yên Tĩnh Khi Lái.
- Workspace Đi Làm / Đi Xa: mở 1–3 app chia màn hình, chỉnh tỷ lệ, nhớ âm lượng / độ sáng.
- Road Trip Melbourne ⇄ Adelaide: chặng ghé, giờ dự kiến, đổi giờ SA, nhắc trái cây, nhắc nghỉ.
- Tốc độ thời gian thực từ GPS; OBD-II cơ bản (tốc độ, vòng tua, nhiệt máy, điện bình) nếu xe đọc được.
- Chạy được trên điện thoại, tablet, DeX; ngang và dọc.

### Đợt sau
- Trợ lý giọng nói "Hey Tom / Hi Tom" (Việt + Anh).
- Bluetooth tự động (nhận ra xe, nút vô lăng, nhắc khi rời xe).
- HUD phản chiếu lên kính, Chế Độ Đêm Đỏ.
- Lịch hẹn (Google Calendar / Tom's Shield), ghi chú giọng nói, danh bạ nhanh, tự trả lời tin nhắn.
- Camera giao thông chính thức SA / VIC; Nhật Ký Road Trip có bản đồ thật (Google Maps / OpenStreetMap).
- Khung ảnh Google Photos khi đậu xe; widget đồng hồ lật HTC kéo giãn tự do.
- Dashcam GKU D700 (chờ Tom thử VLC).

## 3. Màn hình chính

- **Thanh tab** góc trên phải: Màn Hình Chính / Road Trip.
- **Thanh trên cùng**
  - Logo + slogan "Focus On One Thing And Do It Well" (không bao giờ xuống dòng).
  - Ô Sẵn Sàng (chỉ còn chấm xanh khi có từ 2 thiết bị trở lên).
  - Pin điện thoại: xanh > 50%, vàng 20–50%, đỏ nhấp nháy < 20%; tia sét khi sạc; nhiệt kế cam khi máy nóng.
  - Pin thiết bị kết nối (tai nghe, đồng hồ, loa…): tối đa 2 cái, ưu tiên pin thấp nhất, phần còn lại gom "+N".
  - GPS, Bluetooth, OBD (mờ đi khi mất kết nối).
  - Thời tiết: icon động (nắng, đêm, mây, mưa, giông, sương mù), nhiệt độ, cao/thấp, cảm giác thực tế + khả năng mưa; ≥ 35° cảnh báo nắng nóng, ≤ 3° cảnh báo đường đóng băng.
  - Đồng hồ giờ.
- **Thanh dưới**
  - Nút trợ lý giọng nói.
  - Nhiệt máy (xanh dương nguội / xanh lá bình thường / đỏ nhấp nháy quá nóng).
  - Điện bình xe (đang sạc / tắt máy / yếu).
  - Ô "Sắp Tới": chỉ đường kế tiếp, hoặc chặng ghé kế khi Road Trip (chỉ hiện khi xe chạy).
  - Thanh nhạc kiểu Tom's Jukebox: viên thuốc kính mờ, ảnh bìa, tên bài chạy chữ, ⏮ ⏸ ⏭, đường tiến trình mỏng có chấm sáng; nhấp 2 lần ảnh bìa đổi màu.
  - Viền nhạc: Theo Ảnh Bìa, Cực Quang, Bụi Sao, Chạy Theo Bass, Hoàng Hôn, Tắt. Sóng nhạc: Sóng Lụa, Cột Sóng, Cực Quang Mềm, Tắt.
  - Xe chạy > 10 km/g: tắt sóng, viền chậm và dịu, ẩn nút âm lượng. Đậu xe: đủ hiệu ứng. Ban đêm tự giảm sáng.
- **Giao diện (23)**
  - Buồng lái gốc: Neon, Thật.
  - 7 kiểu chính: Kính Mờ, Tối Giản HUD, Máy Bay, Synthwave 80s, Cyberpunk, Rally, Thư Giãn.
  - 7 thuần Úc: Outback, Ven Biển, Melbourne tram, Neon Úc, Dandenong, Yarra Valley, Núi Tuyết.
  - 8 miền Nam: Trung Tâm, Về Đêm, Miền Tây, Mưa Chiều, Chợ Bến Thành, Sài Gòn Xưa, Cà Phê Sáng, Tết Miền Nam.
  - Tự đổi giao diện theo giờ.
- **Đồng hồ (7 kiểu)**: Neon, Cổ Điển, Thanh Ngang, Tối Giản, Vòng Lồng, Rally (đèn sang số), Retro Xưa. Số tốc độ chuyển cam khi vượt giới hạn.
- **Dịu Mắt / Yên Tĩnh Khi Lái**: nền đứng yên + mờ + tối, bỏ vật thể lướt, tắt mưa/lá khi chạy, bảng thông báo chỉnh độ rõ + tự mờ sau 5 giây, nút Dịu Mắt dễ bấm.

## 4. Workspace

- Hai Workspace mẫu: Đi Làm, Đi Xa (bấm Đi Xa mở luôn tab Road Trip). Đổi tên được.
- Chia 1 / 2 dọc / 2 ngang / chữ T / lưới 4; kéo thả app, thanh chia hiện %, khoá tỷ lệ.
- Mỗi Workspace nhớ: đài / playlist, âm lượng, độ sáng, chỗ dẫn đường.
- Tự mở theo giờ / ngày / vị trí; tự mở lại app bị văng; hỏi "Lưu kiểu này không?" khi Tom tự kéo lại.
- Hình thu nhỏ cách chia trên mỗi thẻ; vuốt qua lại giữa Workspace; nút nổi nhỏ.
- Widget trong ô: đồng hồ lật, thời tiết, thông số xe, lịch hẹn, ghi chú.
- YouTube hiện video bình thường.

## 5. Road Trip Melbourne ⇄ Adelaide

- Đường A8 Western Hwy → Dukes Hwy, khoảng 700 km.
- Chặng đi: The Flywheel Bar & Cafe (Beaufort) · Pink Lake (Dimboola) · Kaniva Windmill · đổ xăng 12810 Dukes Hwy (Keith) · Coonalpyn Silo Mural · Adelaide.
- Chặng về: Tailem Bend · Keith Bakery and Coffee shop · McDonald's Horsham · Melbourne.
- Ô trên: Xuất Phát, Dự Kiến Tới Nơi, Còn Lại; giờ dự kiến tới từng chặng ("Dự kiến" / "Đã ghé").
- Thẻ "Tới Kế Tiếp" + nút Dẫn Đường / Bỏ Qua; thanh lộ trình có vị trí xe và vạch biên giới SA.
- Qua biên giới SA: tự lùi 30 phút, nhắc bỏ trái cây / rau (thùng kiểm dịch gần Bordertown).
- Nhắc nghỉ mỗi 2 tiếng, báo trạm xăng kế tiếp, coi chừng kangaroo lúc chạng vạng.
- Biển báo chuẩn Úc: W5-29 kangaroo + bảng NEXT km, R4-1 tốc độ, biển xanh có số tuyến (A8, B100), biển dịch vụ xanh dương, du lịch nâu; phông Overpass; chữ canh giữa.
- Nhạc + app bản đồ (Waze chính, Google Maps phụ, HERE) chạy kế bên; Waze tự báo, Tom's Car vặn nhỏ nhạc khi Waze nói.
- Lưu thêm chỗ ghé mới; các điểm Adelaide đã lưu (Glenelg, Kickin' Inn, Victor Harbor, Mount Lofty, Urimbirra, German Inn Hahndorf, National Motor Museum, Whispering Wall).

## 6. Giọng nói, OBD-II, Bluetooth, tính năng thêm

- **Trợ lý giọng nói** (đợt sau): "Hey Tom" / "Hi Tom"; tiếng Việt + Anh; nhạc, âm lượng, màn hình, chỉ đường (Waze / Google Maps / HERE), gọi điện, SMS (Google Messages), hỏi số liệu xe.
- **Tốc độ thời gian thực**: GPS khoảng 1 lần/giây, ưu tiên OBD nếu đọc được; chưa bắt GPS thì hiện "--". Đồng hồ xe thường chỉ cao hơn GPS vài km/g.
- **OBD-II** (cục Veepeak OBDCheck BLE): vòng tua, nhiệt máy, điện bình, tốc độ; tự dò giao thức chuẩn rồi kiểu Toyota; không đọc được thì để mờ "Chưa kết nối OBD".
- **Chuyến Đi Hôm Nay**: km, giờ lái, tốc độ trung bình. Nhắc thay nhớt theo km, rego, bơm vỏ 350 kPa. Nhớ chỗ đậu xe.
- **Bluetooth** (đợt sau): nhận ra xe tự mở app, mỗi thiết bị một kiểu, nhớ âm lượng, nút vô lăng / nút gắn thêm, nhắc khi rời xe, hiện chuẩn âm thanh.
- **Thêm** (đợt sau): lịch hẹn hôm nay + nhắc giờ, ghi chú giọng nói, danh bạ nhanh, tự trả lời tin nhắn, Chế Độ Riêng Tư, HUD phản chiếu kính, Chế Độ Đêm Đỏ, khung ảnh Google Photos, điện thoại làm bàn điều khiển khi cắm DeX, vùng điều khiển cho hành khách.

## 7. Thông tin xe, máy thử, việc còn chờ

- **Xe**: Toyota HiAce 200 Series van, máy dầu, sản xuất 04/2006 (Úc), 3 chỗ, GVM 2.800 kg, cổng OBD 16 chân dưới taplô; vỏ 195R15C 106/104S, mâm 15x6J, bơm nguội 350 kPa trước/sau.
- **Tablet**: giao diện co giãn 8–13 inch; tablet không GPS thì lấy tốc độ từ OBD hoặc điện thoại.
- **Việc còn chờ**
  - Kết quả thử cục OBD Veepeak với Car Scanner (giao thức, các số đọc được).
  - Dashcam GKU D700 (chờ Tom thử VLC).
  - Cách build APK (xem phần dưới).
