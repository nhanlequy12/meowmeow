#!/usr/bin/env python3
"""Dựng lại hoạt ảnh đi, chạy, nhảy của Xoài từ khung đứng gốc bằng một bộ khớp (rig) pixel.

Giữ nguyên tạo hình và bảng màu: đầu và đuôi là pixel gốc; thân là pixel gốc được co giãn/uốn; bốn chân vẽ lại bằng
đúng các màu trong bảng (chân phía xa tối hơn một bậc). Lưới 100x80, mặt đất cố định (ô tô cuối ở hàng 71, viền tới 73).
Chạy:  python3 tools/xoai_rig.py            -> ghi lại js/sprites.js
       python3 tools/xoai_rig.py --preview  -> thêm sheet và GIF vào art/xem-truoc (cần Pillow)
"""
import json, math, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = os.path.join(ROOT, 'js', 'sprites.js')
W, H, GROUND = 100, 80, 71
txt = open(JS, encoding='utf8').read()
m = re.search(r'const SHEETS=(\{.*\});\s*$', txt, re.S)
head_txt = txt[:m.start()]
raw = re.sub(r'([{,])([a-zA-Z_]+):', r'\1"\2":', m.group(1)) if '"xoai"' not in m.group(1) else m.group(1)
DATA = json.loads(raw)
X = DATA['xoai']
f0 = X['a']['stand']['f'][0]
src = [f0[y * W:(y + 1) * W] for y in range(H)]

# ---------- tách bộ phận từ khung đứng ----------
def is_head(x, y):
    return src[y][x] != '.' and ((y <= 37 and x >= 46) or (38 <= y <= 44 and x >= 48) or (45 <= y <= 48 and x >= 55))
def is_tail(x, y):
    lim = 27 if y <= 43 else 26 if y == 44 else 24 if y <= 46 else -1
    return src[y][x] != '.' and x <= lim
HEAD = {(x, y): src[y][x] for y in range(H) for x in range(W) if is_head(x, y)}
TAIL = {(x, y): src[y][x] for y in range(H) for x in range(W) if is_tail(x, y)}
TORSO = {}
for y in range(38, 62):
    for x in range(W):
        c = src[y][x]
        if c in '.A' or (x, y) in HEAD or (x, y) in TAIL: continue
        TORSO[(x, y)] = c
for (x, y) in HEAD:                      # phần thân bị đầu che: tô lông để khi đầu nhích đi không hở
    if 39 <= y <= 48 and x <= 62: TORSO[(x, y)] = 'D'
TX0, TX1, TCX = 22, 66, 44
HIP = {'nh': (28, 60), 'fh': (35, 60), 'nf': (53, 60), 'ff': (59, 60)}   # n = phía gần người xem, f = phía xa; h = sau, f = trước
LEGW = {'nh': 8, 'fh': 5, 'nf': 7, 'ff': 5}

def torso_shift(t, p):
    return p.get('dy', 0) + p.get('dyr', 0) * (1 - t) + p.get('dyf', 0) * t - p.get('arch', 0) * 4 * t * (1 - t)
def tmap(x, y, p):                       # điểm trên thân gốc -> vị trí sau khi co giãn/uốn
    t = min(1, max(0, (x - TX0) / (TX1 - TX0)))
    return TCX + (x - TCX) * p.get('sx', 1) + p.get('dx', 0), y + torso_shift(t, p)

RING = [(dx, dy) for dx in range(-2, 3) for dy in range(-2, 3) if abs(dx) + abs(dy) <= 3 and (dx, dy) != (0, 0)]
class Canvas:
    def __init__(s):
        s.c = [['.'] * W for _ in range(H)]; s.k = [[0] * W for _ in range(H)]
    def fill(s, pix, kind, ring_over=()):
        """pix: {(x,y): ký tự}. Viền chỉ vẽ lên ô trống hoặc ô thuộc các lớp trong ring_over."""
        for (x, y) in pix:
            for dx, dy in RING:
                u, v = x + dx, y + dy
                if 0 <= u < W and 0 <= v < H and (u, v) not in pix and (s.k[v][u] == 0 or s.k[v][u] == 9 or s.k[v][u] in ring_over):
                    s.c[v][u] = 'A'; s.k[v][u] = 9
        for (x, y), ch in pix.items():
            if 0 <= x < W and 0 <= y < H: s.c[y][x] = ch; s.k[y][x] = kind
    def paste(s, pix, kind, dx=0, dy=0):
        for (x, y), ch in pix.items():
            u, v = x + dx, y + dy
            if 0 <= u < W and 0 <= v < H: s.c[v][u] = ch; s.k[v][u] = kind
    def text(s): return ''.join(''.join(r) for r in s.c)

def leg_pix(name, hip, foot, lift):
    """Chân: một khối bo tròn từ hông tới bàn chân (đùi to hơn cổ chân), bàn chân nhô về trước. Chân phía xa tối hơn một bậc màu."""
    near = name[0] == 'n'; w = LEGW[name]; main, edge, toe = ('D', 'C', 'E') if near else ('C', 'B', 'D')
    hx, hy = hip; fx, fy = foot[0], GROUND - lift
    r0, r1 = w / 2 + (1 if name[1] == 'h' else .3), w / 2 - .6          # bán kính ở hông và ở cổ chân
    fy2 = fy - r1 + .5; pix = {}
    dx, dy = fx - hx, fy2 - hy; L = dx * dx + dy * dy or 1
    for y in range(int(min(hy, fy2) - 6), int(fy) + 1):
        for x in range(int(min(hx, fx) - 8), int(max(hx, fx) + 9)):
            t = max(0, min(1, ((x - hx) * dx + (y - hy) * dy) / L)); r = r0 + (r1 - r0) * t
            px, py = hx + dx * t, hy + dy * t; d = math.hypot(x - px, y - py)
            if d <= r and y <= fy: pix[(x, y)] = edge if (x - px) < -r + 1.2 else main
    by = int(round(fy))                   # bàn chân: 2 hàng cuối rộng thêm về phía trước, đầu ngón sáng hơn
    for k in range(int(round(fx - r1)), int(round(fx + r1)) + 3):
        for j in (0, 1): pix[(k, by - j)] = main
    pix[(int(round(fx + r1)) + 2, by)] = toe; pix[(int(round(fx + r1)) + 1, by)] = toe
    return pix

def tail_pix(base, ang, wave, n=22):
    """Đuôi duỗi ra sau (dáng chạy, nhảy): vệt tròn bán kính 3, có khoang vằn và chóp trắng."""
    pix = {}; x, y = base
    for i in range(n):
        a = math.radians(ang + wave * math.sin(i / n * math.pi * 1.5)); x -= math.cos(a); y -= math.sin(a)
        ch = 'G' if i >= n - 4 else 'B' if (i // 4) % 2 else 'D'
        for dx in range(-3, 4):
            for dy in range(-3, 4):
                if dx * dx + dy * dy <= 9 + (0 if i < n - 6 else -3): pix[(int(round(x)) + dx, int(round(y)) + dy)] = ch
    return pix

def frame(p):
    """p: tham số thân (sx, arch, dy, dyf, dyr, dx), đầu (hdx, hdy), đuôi ('tail': gốc+lệch hoặc ('run', góc, sóng)),
    chân {tên: (lệch bàn chân so với hông, độ nhấc)} hoặc {tên: ('abs', x tuyệt đối, độ nhấc)}."""
    cv = Canvas(); hips = {}
    for nm, (hx, hy) in HIP.items():
        X_, Y_ = tmap(hx, hy, p); hips[nm] = (X_, Y_ + p.get('hip_' + nm, 0))
    def leg(nm):
        spec = p['legs'][nm]
        if spec[0] == 'abs': fx, lift = spec[1], spec[2]
        else: fx, lift = hips[nm][0] + spec[0], spec[1]
        return leg_pix(nm, hips[nm], (fx, 0), lift)
    cv.fill(leg('fh'), 1); cv.fill(leg('ff'), 1)
    tl = p.get('tail', ('orig', 0, 0))
    if tl[0] == 'orig': cv.paste(TAIL, 2, tl[1], tl[2] + int(round(torso_shift(0, p))))
    else:
        bx, by = tmap(27, 46, p); cv.fill(tail_pix((bx, by), tl[1], tl[2]), 2, ring_over=(1,))
    tor = {}
    sx = p.get('sx', 1)
    for Y in range(30, 70):               # lấy mẫu ngược (nearest) để thân co giãn không bị thủng
        for X_ in range(W):
            u = TCX + (X_ - p.get('dx', 0) - TCX) / sx; t = min(1, max(0, (u - TX0) / (TX1 - TX0)))
            v = Y - torso_shift(t, p); key = (int(round(u)), int(round(v)))
            if key in TORSO: tor[(X_, Y)] = TORSO[key]
    cv.fill(tor, 3, ring_over=(1, 2))
    cv.fill(leg('nh'), 4, ring_over=(1,)); cv.fill(leg('nf'), 4, ring_over=(1,))
    hx = int(round((sx - 1) * 14 + p.get('dx', 0) + p.get('hdx', 0))); hy = int(round(torso_shift(1, p) + p.get('hdy', 0)))
    cv.paste(HEAD, 5, hx, hy)
    return cv.text()

# ---------- ĐI: 8 khung, bốn nhịp. Thứ tự chạm đất: sau xa (trái) -> trước xa (trái) -> sau gần (phải) -> trước gần (phải) ----------
WPOSE = [(5, 0), (2.5, 0), (0, 0), (-2.5, 0), (-5, 0), (-4, 2), (0, 4), (4, 1.5)]   # P0..P7: (lệch bàn chân, độ nhấc)
WOFF = {'fh': 0, 'ff': 2, 'nh': 4, 'nf': 6}
def walk(f):
    legs = {nm: WPOSE[(f - o) % 8] for nm, o in WOFF.items()}
    hip_dy = 1 if f in (1, 5) else 0      # hông thấp nhất khi một chân sau ở P1
    sh_dy = 1 if f in (3, 7) else 0       # vai thấp nhất khi một chân trước ở P1
    sway = round(math.sin((f - 2) / 8 * 2 * math.pi) * 1.2)   # đuôi đung đưa, trễ 2 khung so với thân
    return frame({'dyr': hip_dy, 'dyf': sh_dy, 'hdy': -sh_dy, 'tail': ('orig', sway, -hip_dy), 'legs': legs})
def walk_contacts(f): return [nm for nm, o in WOFF.items() if (f - o) % 8 <= 4]

# ---------- CHẠY: 8 khung phi nước đại xoay vòng. Mỗi khung mèo tiến 4,75 ô thật (38 ô một vòng) ----------
V = 4.75
RUN = [  # sx, arch, dy, dyf, dyr, đuôi(góc, sóng), chân: g = chạm đất tại x tuyệt đối, (dx, nhấc) = trên không
 dict(sx=.90, arch=3, dy=0, tail=(8, 10), legs={'fh': ('g', 36), 'nh': ('g', 37), 'ff': (0, 6), 'nf': (-2, 5)}),          # 1 hai chân sau chạm đất lệch nhau
 dict(sx=.97, arch=1.5, dy=0, tail=(4, 6), legs={'fh': (-7, 2), 'nh': ('g', 37 - V), 'ff': (6, 5), 'nf': (4, 4)}),         # 2 chân sau đẩy, chân sau thứ nhất rời đất
 dict(sx=1.10, arch=-1, dy=-3, tail=(0, -4), legs={'fh': (-9, 4), 'nh': (-11, 3), 'ff': (9, 4), 'nf': (11, 3)}),           # 3 bay duỗi
 dict(sx=1.06, arch=0, dy=-1, dyf=1, tail=(-3, -8), legs={'fh': (-7, 5), 'nh': (-9, 4), 'ff': ('g', 68), 'nf': (9, 2)}),   # 4 chân trước thứ nhất chạm đất
 dict(sx=1.0, arch=1, dy=0, dyf=1, tail=(0, -4), legs={'fh': (-2, 5), 'nh': (-4, 5), 'ff': (-3, 1.5), 'nf': ('g', 62)}),   # 5 chân trước thứ hai chạm đất, chân thứ nhất nhấc lên
 dict(sx=.93, arch=2, dy=0, tail=(4, 4), legs={'fh': (2, 5), 'nh': (0, 5), 'ff': (-5, 5), 'nf': ('g', 62 - V)}),           # 6 chân trước đẩy, thân co lại
 dict(sx=.86, arch=4, dy=-2, tail=(8, 10), legs={'fh': (5, 5), 'nh': (3, 5), 'ff': (-1, 6), 'nf': (-3, 6)}),               # 7 bay co
 dict(sx=.88, arch=3.5, dy=-1, tail=(10, 12), legs={'fh': (6, 1), 'nh': (5, 3), 'ff': (0, 6), 'nf': (-2, 6)}),            # 8 chân sau thứ nhất vươn xuống
]
def run(f):
    p = dict(RUN[f]); p['tail'] = ('run',) + p['tail']; p['hdy'] = -p.get('dyf', 0) * .5 + (1 if p.get('dy', 0) < -2 else 0)  # đầu ổn định hơn thân
    p['legs'] = {nm: (('abs', s[1], 0) if s[0] == 'g' else s) for nm, s in p['legs'].items()}
    return frame(p)
def run_contacts(f): return [nm for nm, s in RUN[f]['legs'].items() if s[0] == 'g']

# ---------- NHẢY: lấy đà (2), bật lên, trên không (2), chuẩn bị đáp, tiếp đất, đứng lại ----------
JUMP = [
 dict(sx=1.04, arch=1, dy=2, dyf=1, dyr=-1, tail=(20, 6), legs={'fh': (1, 0), 'nh': (1, 0), 'ff': (2, 0), 'nf': (2, 0)}),      # lấy đà: thân hạ, hông nâng
 dict(sx=1.05, arch=1, dy=3, dyf=1, dyr=-2, dx=-1, tail=(26, 8), legs={'fh': (2, 0), 'nh': (2, 0), 'ff': (3, 0), 'nf': (3, 0)}),# lấy đà: ngoáy mông, nén thêm
 dict(sx=1.09, arch=-.5, dy=-2, dyf=-3, dyr=1, tail=(-12, -4), legs={'fh': (-5, 0), 'nh': (-6, 0), 'ff': (4, 5), 'nf': (5, 4)}), # bật lên: chân sau duỗi hết
 dict(sx=1.10, arch=-1, dy=-2, dyf=-2, tail=(-6, -6), legs={'fh': (-9, 3), 'nh': (-10, 3), 'ff': (8, 4), 'nf': (10, 3)}),      # trên không: duỗi người
 dict(sx=1.07, arch=0, dy=-2, tail=(2, -4), legs={'fh': (-8, 4), 'nh': (-9, 4), 'ff': (8, 3), 'nf': (9, 3)}),                  # trên không: đỉnh
 dict(sx=1.0, arch=1, dy=-1, dyf=2, dyr=-1, tail=(14, 6), legs={'fh': (-4, 5), 'nh': (-5, 5), 'ff': (6, 1), 'nf': (7, 1)}),    # chuẩn bị đáp: chân trước vươn xuống
 dict(sx=.95, arch=2, dy=1, dyf=2, dyr=-1, tail=(22, 8), legs={'fh': (2, 3), 'nh': (1, 3), 'ff': (3, 0), 'nf': (4, 0)}),       # tiếp đất: chân trước chạm trước
 dict(sx=1.03, arch=.5, dy=1, tail=(16, 6), legs={'fh': (0, 0), 'nh': (0, 0), 'ff': (1, 0), 'nf': (1, 0)}),                   # đứng lại: cả bốn chân, còn hơi nén
]
def jump(f):
    p = dict(JUMP[f]); p['tail'] = ('run',) + p['tail']; p['hdy'] = -p.get('dyf', 0) * .4
    return frame(p)

OUT = {'walk': [walk(f) for f in range(8)], 'run': [run(f) for f in range(8)], 'jump': [jump(f) for f in range(8)]}
for k, fr in OUT.items():
    for i, f in enumerate(fr):
        assert len(f) == W * H and set(f) <= set(X['pal']), (k, i, set(f) - set(X['pal']))
        rows = [y for y in range(H) if f[y * W:(y + 1) * W].strip('.')]
        assert max(rows) <= 73, (k, i, max(rows))
    X['a'][k] = {'w': W, 'f': fr}
X['stride'] = {'walk': 10, 'run': 19}; X['n'] = {'walk': 8, 'run': 8, 'groom': 6, 'sleep': 4}
open(JS, 'w', encoding='utf8').write(head_txt + 'const SHEETS=' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n')

NAMES = {'fh': 'sau trái (xa)', 'ff': 'trước trái (xa)', 'nh': 'sau phải (gần)', 'nf': 'trước phải (gần)'}
print('ĐI   khung: chân chạm đất')
for f in range(8): print('  %d: %s' % (f + 1, ', '.join(NAMES[n] for n in walk_contacts(f))))
print('CHẠY khung: chân chạm đất')
for f in range(8): print('  %d: %s' % (f + 1, ', '.join(NAMES[n] for n in run_contacts(f)) or '(cả bốn chân trên không)'))

if '--preview' in sys.argv:
    from PIL import Image
    PAL = {k: (tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) + (255,)) if v else (0, 0, 0, 0) for k, v in X['pal'].items()}
    out = os.path.join(ROOT, 'art', 'xem-truoc'); os.makedirs(out, exist_ok=True)
    def img(f, w):
        im = Image.new('RGBA', (w, H)); im.putdata([PAL[ch] for ch in f]); return im
    DUR = {'walk': [96] * 8, 'run': [41] * 8, 'jump': [180, 180, 110, 150, 150, 110, 130, 130], 'groom': [133] * 6, 'sleep': [625] * 4, 'sit': [1500, 140, 1500, 450], 'stand': [300] * 4}
    for k, d in DUR.items():
        a = X['a'][k]; w = a['w']; fr = [img(f, w) for f in a['f']]
        sh = Image.new('RGBA', (w * len(fr), H))
        for i, im in enumerate(fr): sh.paste(im, (i * w, 0))
        sh.save(os.path.join(out, k + '.png'))
        S = 4; g = []
        for im in fr:
            bg = Image.new('RGBA', (w * S, H * S), (160, 125, 88, 255)); bg.alpha_composite(im.resize((w * S, H * S), Image.NEAREST)); g.append(bg.convert('P', palette=Image.ADAPTIVE))
        g[0].save(os.path.join(out, k + '.gif'), save_all=True, append_images=g[1:], duration=d, loop=0, disposal=2)
    big = Image.new('RGBA', (100 * 4 * 5, 80 * 6 * 5), (160, 125, 88, 255))
    for r, k in enumerate(['walk', 'run', 'jump']):
        for i, f in enumerate(X['a'][k]['f']): big.alpha_composite(img(f, 100).resize((500, 400), Image.NEAREST), ((i % 4) * 500, (r * 2 + i // 4) * 400))
    big.convert('RGB').save(os.path.join(out, 'di-chay-nhay.png'))
    print('đã ghi xem trước vào', out)
