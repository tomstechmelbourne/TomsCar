# Tom's Car — #77: fixed phrases pre-recorded with VieNeu-TTS (Thục Đoan, Thái Sơn).
# The key is the text the app speaks (lower-case, no end punctuation); the value is what the voice reads
# (numbers written as words so the model reads them naturally).
DIG = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
def words(n):
    n = int(n)
    if n < 10: return DIG[n]
    if n < 20: return 'mười' + ('' if n == 10 else ' lăm' if n % 10 == 5 else ' ' + DIG[n % 10])
    if n < 100:
        c, u = divmod(n, 10)
        return DIG[c] + ' mươi' + ('' if u == 0 else ' mốt' if u == 1 else ' tư' if u == 4 else ' lăm' if u == 5 else ' ' + DIG[u])
    if n < 1000:
        h, r = divmod(n, 100)
        return DIG[h] + ' trăm' + ('' if r == 0 else (' lẻ ' + DIG[r]) if r < 10 else ' ' + words(r))
    return str(n)
def num(s):  # "1,5" → "một phẩy năm"
    if ',' in s: a, b = s.split(','); return words(a) + ' phẩy ' + words(b)
    return words(s)

def phrases():
    P = {}
    def add(key, say=None): P[key.lower().strip(' .')] = (say or key).strip()
    for m in range(50, 1000, 50): add(f'{m} mét nữa', f'{words(m)} mét nữa')
    kms = ['1', '1,5', '2', '2,5'] + [str(i) for i in range(3, 21)] + [str(i) for i in range(25, 101, 5)] + ['120', '150', '200']
    for k in kms: add(f'{k} cây số nữa', f'{num(k)} cây số nữa')
    for m in range(50, 550, 50): add(f'phía trước {m} mét có camera tốc độ', f'Phía trước {words(m)} mét có camera tốc độ')
    for v in (20, 30, 40, 50, 60, 70, 80, 90, 100, 110): add(f'giới hạn {v} cây số', f'giới hạn {words(v)} cây số')
    for t in ['Quay đầu', 'Rẽ gắt phải', 'Rẽ phải', 'Chếch phải', 'Đi thẳng', 'Chếch trái', 'Rẽ trái', 'Rẽ gắt trái', 'Đi tiếp', 'Đi', 'Rẽ',
              'Nhập làn', 'Nhập làn bên phải', 'Nhập làn bên trái', 'Lên đường dẫn', 'Lên đường dẫn bên phải', 'Lên đường dẫn bên trái',
              'Ra lối', 'Ra lối bên phải', 'Ra lối bên trái', 'Giữ phải', 'Giữ trái', 'Giữ thẳng', 'Cuối đường rẽ phải', 'Cuối đường rẽ trái', 'Cuối đường quay đầu',
              'Vô vòng xoay', 'Ra khỏi vòng xoay', 'Rẽ phải ở vòng xoay', 'Rẽ trái ở vòng xoay', 'Đi thẳng ở vòng xoay', 'Quay đầu ở vòng xoay',
              'Tới nơi', 'Ở bên tay phải', 'Ở bên tay trái', 'Xuất phát', 'Đã tới nơi', 'Bắt đầu chỉ đường', 'Đang tính lại đường', 'Đã dừng chỉ đường',
              'Vùng trường học', 'Chạy 40 cây số giờ', 'Chạy chậm lại',
              'Dạ', 'Dạ, phát nhạc nè', 'Dạ, đã bật Dịu Mắt', 'Dạ, đã tắt', 'Dạ, không có tin nhắn mới', 'Dạ, hết chặng ghé rồi', 'Dạ, mình chưa ghi chỗ đậu xe nào',
              'Dạ, mình chưa hiểu. Bạn nói lại giúp mình nha', 'Dạ, mình vẫn chưa hiểu. Bạn bấm nút mic thử lại nha', 'Dạ, mở danh sách đài vùng này',
              'Dạ, đang tìm trạm xăng gần nhất', 'Đang bật Riêng Tư nên không đọc tin nhắn', 'Dạ, em là trợ lý Tom\'s Car. Anh cần gì cứ nói nha', 'Có cuộc gọi',
              'Mình đang lái xe, lát gọi lại nha', 'Còn 10 phút là hết giờ đậu xe']:
        add(t, t.replace('40', 'bốn mươi'))
    for i in range(1, 7): add(f'ra lối thứ {i}', f'ra lối thứ {["", "nhất", "hai", "ba", "tư", "năm", "sáu"][i]}')
    return P
if __name__ == '__main__':
    import json; print(json.dumps(phrases(), ensure_ascii=False, indent=1)); print(len(phrases()))
