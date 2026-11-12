#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Máy chủ nhỏ cho Mèo Xu: phục vụ file game và giữ bản lưu của từng người chơi để Admin theo dõi, quản lý.

Chạy:   python server.py            (cổng 8765, mọi máy trong mạng LAN vào được)
        python server.py 9000       (đổi cổng)
Dữ liệu nằm trong thư mục data/ cạnh file này (không commit):
    data/admin_key.txt      mã quản trị, tự sinh lần đầu, in ra màn hình khi khởi động
    data/players/<id>.json  hồ sơ, bản lưu, hàng lệnh chờ và nhật ký của từng người chơi
    data/vapid.json         cặp khóa của máy chủ để gửi thông báo đẩy (Web Push), tự sinh lần đầu
Đặt biến môi trường MEOXU_DATA để dùng thư mục dữ liệu khác (tiện khi thử).
Thông báo đẩy: game (js/pwa.js) gửi lên "kế hoạch" các việc sắp xong (viễn chinh về, bát đổ lại được, mèo con chào đời);
tới giờ mà người chơi đã tắt game thì máy chủ gửi một thông báo đẩy không kèm nội dung, service worker (sw.js) nhận được sẽ hỏi lại
nội dung ở /api/push/pull. Trình duyệt chỉ cho đăng ký nhận đẩy khi game được mở bằng localhost hoặc HTTPS, và máy chủ phải ra được Internet.
Chống gian lận: máy chủ giữ bản lưu hợp lệ cuối cùng của mỗi người chơi làm gốc. Mỗi lần đồng bộ, trọng tài tools/guard.js
(chạy nền bằng Node, dùng đúng mã game) so bản mới với bản gốc: mèo không được đổi, mèo gacha phải khớp hạt giống máy chủ phát,
tài sản và kinh nghiệm không được tăng nhanh hơn mức chơi thật. Bản lưu sai bị từ chối, máy người chơi được trả về bản gốc.
Máy không có Node thì chỉ kiểm cơ bản (in cảnh báo lúc khởi động).
Bảo mật: chỉ phục vụ file game (index.html, manifest.json, sw.js, js/, css/, icons/), không liệt kê thư mục, header chống nhúng khung
và chặn nội dung lạ (CSP), giới hạn số yêu cầu, số lần tạo hồ sơ và số lần nhập sai mã quản trị theo từng địa chỉ IP.
Chỉ dùng thư viện chuẩn của Python 3.8+ (và Node cho trọng tài).
"""
import base64, hashlib, hmac, http.client, json, os, queue, re, secrets, shutil, subprocess, sys, threading, time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, unquote

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.environ.get('MEOXU_DATA') or os.path.join(ROOT, 'data')
PDIR = os.path.join(DATA, 'players')
KEYF = os.path.join(DATA, 'admin_key.txt')
VAPF = os.path.join(DATA, 'vapid.json')
WXF = os.path.join(DATA, 'wx_seed.txt')   # hạt giống thời tiết chung của nhóm (tự sinh lần đầu)
LOCK = threading.Lock()
ID_RE = re.compile(r'^[0-9a-f]{12}$')
MAX_BODY = 4 * 1024 * 1024
LOG_MAX = 300
ONLINE = 90            # giây: đồng bộ gần hơn mức này thì coi là đang chơi
JUMP = 20000           # xu tăng quá mức này giữa hai lần đồng bộ mà không phải quà thì ghi cảnh báo
CMD_TYPES = {'coins', 'tickets', 'cat', 'msg', 'reset'}
PUSH_IDLE = 100        # giây: không đồng bộ lâu hơn mức này thì coi là đã tắt game, lúc đó mới gửi thông báo đẩy (game còn mở thì tự báo)
PUSH_LATE = 1800       # giây: việc quá hạn lâu hơn mức này (máy chủ vừa bật lại) thì bỏ, không báo muộn
PUSH_HOSTS = ('fcm.googleapis.com', 'push.services.mozilla.com', 'notify.windows.com', 'push.apple.com')   # chỉ gửi tới dịch vụ đẩy của các trình duyệt
PUSH_SUB = 'mailto:meoxu@example.com'   # địa chỉ liên hệ ghi trong khóa VAPID; đổi ở trường "sub" của data/vapid.json nếu muốn
PLAN_AT = {}           # id người chơi -> thời điểm của việc sớm nhất trong kế hoạch thông báo (để vòng lặp không phải đọc mọi hồ sơ)
EP_OF = {}             # địa chỉ đăng ký đẩy -> id người chơi
RQ_N = 30              # số lượt gacha phát sẵn cho mỗi người chơi
STATIC_FILES = {'', 'index.html', 'manifest.json', 'sw.js'}
STATIC_DIRS = ('js/', 'css/', 'icons/')
CSP = ("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "
       "media-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; "
       "object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'")
SEC_HEADERS = (('X-Content-Type-Options', 'nosniff'), ('X-Frame-Options', 'DENY'), ('Referrer-Policy', 'no-referrer'),
               ('Cross-Origin-Opener-Policy', 'same-origin'), ('Cross-Origin-Resource-Policy', 'same-origin'),
               ('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'), ('Content-Security-Policy', CSP))
LIM_API = (240, 60)        # tối đa 240 yêu cầu API mỗi 60 giây mỗi IP
LIM_JOIN = (5, 3600)       # tối đa 5 hồ sơ mới mỗi giờ mỗi IP
LIM_ADMFAIL = (8, 900)     # nhập sai mã quản trị 8 lần trong 15 phút thì khóa IP đó 15 phút
LIM_XFAIL = (5, 900)       # nhập sai mã chuyển máy 5 lần trong 15 phút thì khóa IP đó 15 phút
LIM_XFAIL_ALL = (40, 900)  # cả máy chủ: quá 40 lần sai trong 15 phút thì tạm khóa nhập mã (chống dò mã từ nhiều IP)
LIM_XNEW = (10, 3600)      # tối đa 10 lần tạo mã (chuyển máy, khôi phục) mỗi giờ mỗi người chơi
XF_TTL = 600               # giây: mã chuyển máy hết hạn sau 10 phút
XF_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'   # không có I, O, 0, 1 cho khỏi nhầm khi gõ


class Rate:
    """Đếm số lần theo khóa (loại, IP) trong một cửa sổ thời gian."""
    def __init__(self):
        self.h, self.lk = {}, threading.Lock()

    def _win(self, key, win):
        t = time.time()
        a = [x for x in self.h.get(key, ()) if t - x < win]
        self.h[key] = a
        if len(self.h) > 20000:
            self.h = {k: v for k, v in self.h.items() if v}
        return a, t

    def hit(self, key, lim):          # ghi một lần; trả False nếu đã quá giới hạn
        with self.lk:
            a, t = self._win(key, lim[1])
            if len(a) >= lim[0]:
                return False
            a.append(t)
            return True

    def over(self, key, lim):         # chỉ xem đã quá giới hạn chưa, không ghi
        with self.lk:
            return len(self._win(key, lim[1])[0]) >= lim[0]


RATE = Rate()


class Judge:
    """Trọng tài tools/guard.js chạy nền bằng Node; tự khởi động lại khi mã game hoặc trọng tài đổi."""
    FILES = ('js/data.js', 'js/wx-data.js', 'js/pw-data.js', 'js/game.js', 'tools/guard.js')

    def __init__(self):
        self.node = shutil.which('node')
        self.proc, self.q, self.mt, self.lk = None, None, None, threading.Lock()

    @property
    def on(self):
        return bool(self.node)

    def _mtime(self):
        return tuple(os.path.getmtime(os.path.join(ROOT, f)) for f in self.FILES)

    def stop(self):
        if self.proc:
            try:
                self.proc.kill()
            except OSError:
                pass
        self.proc = None

    @staticmethod
    def _read(proc, q):
        for line in proc.stdout:
            q.put(line)
        q.put(None)

    def _start(self):
        self.stop()
        self.proc = subprocess.Popen([self.node, os.path.join(ROOT, 'tools', 'guard.js')], cwd=ROOT, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                     stderr=subprocess.DEVNULL, text=True, encoding='utf-8', bufsize=1)
        self.q = queue.Queue()
        threading.Thread(target=self._read, args=(self.proc, self.q), daemon=True).start()
        self.mt = self._mtime()
        if not (self.q.get(timeout=20) or '').startswith('{"ready"'):
            raise RuntimeError('trọng tài không khởi động được')

    def call(self, req):
        if not self.node:
            return None
        with self.lk:
            try:
                if self.proc is None or self.proc.poll() is not None or self._mtime() != self.mt:
                    self._start()
                self.proc.stdin.write(json.dumps(req, ensure_ascii=False) + '\n')
                self.proc.stdin.flush()
                line = self.q.get(timeout=15)
                if line is None:
                    raise RuntimeError('trọng tài dừng đột ngột')
                return json.loads(line)
            except Exception as e:                              # lỗi, quá giờ: báo "bận", không nhận cũng không từ chối bản lưu
                sys.stderr.write('Trọng tài lỗi: %s\n' % e)
                self.stop()
                return None


JUDGE = Judge()


def now():
    return int(time.time())


def admin_key():
    os.makedirs(PDIR, exist_ok=True)
    if not os.path.exists(KEYF):
        with open(KEYF, 'w', encoding='utf-8') as f:
            f.write(secrets.token_hex(8))
    with open(KEYF, encoding='utf-8') as f:
        return f.read().strip()


def ppath(pid):
    return os.path.join(PDIR, pid + '.json')


def pload(pid):
    if not ID_RE.match(pid or ''):
        return None
    try:
        with open(ppath(pid), encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def psave(p):
    tmp = ppath(p['id']) + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(p, f, ensure_ascii=False)
    os.replace(tmp, ppath(p['id']))


def pall():
    out = []
    for fn in os.listdir(PDIR):
        if fn.endswith('.json'):
            p = pload(fn[:-5])
            if p:
                out.append(p)
    return out


# ---- Web Push (VAPID) chỉ bằng thư viện chuẩn: chữ ký ECDSA trên đường cong P-256 ----
P256_P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff
P256_N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551
P256_G = (0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296, 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5)


def ec_add(p, q):
    if p is None:
        return q
    if q is None:
        return p
    (x1, y1), (x2, y2) = p, q
    if x1 == x2:
        if (y1 + y2) % P256_P == 0:
            return None
        lam = (3 * x1 * x1 - 3) * pow(2 * y1, -1, P256_P) % P256_P
    else:
        lam = (y2 - y1) * pow(x2 - x1, -1, P256_P) % P256_P
    x3 = (lam * lam - x1 - x2) % P256_P
    return x3, (lam * (x1 - x3) - y1) % P256_P


def ec_mul(k, p):
    r = None
    while k:
        if k & 1:
            r = ec_add(r, p)
        p = ec_add(p, p)
        k >>= 1
    return r


def ec_sign(d, msg):
    """Chữ ký ES256 dạng r||s (64 byte) của msg bằng khóa riêng d."""
    z = int.from_bytes(hashlib.sha256(msg).digest(), 'big')
    while True:
        k = secrets.randbelow(P256_N - 1) + 1
        r = ec_mul(k, P256_G)[0] % P256_N
        s = pow(k, -1, P256_N) * (z + r * d) % P256_N
        if r and s:
            return r.to_bytes(32, 'big') + s.to_bytes(32, 'big')


def b64u(b):
    return base64.urlsafe_b64encode(b).rstrip(b'=').decode()


def vapid():
    os.makedirs(DATA, exist_ok=True)
    if not os.path.exists(VAPF):
        d = secrets.randbelow(P256_N - 1) + 1
        x, y = ec_mul(d, P256_G)
        with open(VAPF, 'w', encoding='utf-8') as f:
            json.dump({'d': '%064x' % d, 'pub': b64u(b'\x04' + x.to_bytes(32, 'big') + y.to_bytes(32, 'big')), 'sub': PUSH_SUB}, f)
    with open(VAPF, encoding='utf-8') as f:
        v = json.load(f)
    v['d'] = int(v['d'], 16)
    return v


JWT = {}


def vapid_auth(v, aud):
    t = now()
    c = JWT.get(aud)
    if not c or c[0] < t + 3600:               # khóa ký dùng lại trong nhiều giờ, khỏi ký lại mỗi lần gửi
        head = b64u(json.dumps({'typ': 'JWT', 'alg': 'ES256'}, separators=(',', ':')).encode())
        body = b64u(json.dumps({'aud': aud, 'exp': t + 12 * 3600, 'sub': v.get('sub') or PUSH_SUB}, separators=(',', ':')).encode())
        c = JWT[aud] = (t + 12 * 3600, head + '.' + body + '.' + b64u(ec_sign(v['d'], (head + '.' + body).encode())))
    return 'vapid t=%s, k=%s' % (c[1], v['pub'])


def push_host_ok(ep):
    try:
        u = urlparse(ep)
        host = (u.hostname or '').lower()
    except ValueError:
        return False
    return u.scheme == 'https' and len(ep) <= 1000 and any(host == x or host.endswith('.' + x) for x in PUSH_HOSTS)


def push_send(v, ep):
    """Gửi một thông báo đẩy không kèm nội dung tới địa chỉ đăng ký ep; trả về mã HTTP (0 nếu không kết nối được)."""
    u = urlparse(ep)
    conn = http.client.HTTPSConnection(u.hostname, u.port or 443, timeout=10)
    try:
        conn.request('POST', (u.path or '/') + ('?' + u.query if u.query else ''), body=b'',
                     headers={'Authorization': vapid_auth(v, 'https://' + u.netloc), 'TTL': '1800', 'Urgency': 'high', 'Topic': 'meoxu', 'Content-Length': '0'})
        r = conn.getresponse()
        r.read()
        return r.status
    except (OSError, http.client.HTTPException):
        return 0
    finally:
        conn.close()


def set_plan(p, raw):
    """Thay kế hoạch thông báo của người chơi bằng danh sách game vừa gửi: [{d: mili giây nữa, body: nội dung}]."""
    t = now()
    out = [e for e in (p.get('plan') or []) if e.get('force')]      # thông báo thử đang chờ thì giữ lại
    if isinstance(raw, list):
        for e in raw[:12]:
            if isinstance(e, dict) and isinstance(e.get('d'), (int, float)) and 0 <= e['d'] <= 7 * 86400 * 1000 and isinstance(e.get('body'), str) and e['body'].strip():
                out.append({'t': t + int(e['d'] / 1000), 'body': re.sub(r'[\x00-\x09\x0b-\x1f]', ' ', e['body']).strip()[:300]})
    p['plan'] = out
    if out:
        PLAN_AT[p['id']] = min(e['t'] for e in out)
    else:
        PLAN_AT.pop(p['id'], None)


def push_loop(v):
    """Chạy nền: tới giờ của một việc trong kế hoạch mà người chơi đã tắt game thì gửi thông báo đẩy."""
    while True:
        time.sleep(5)
        try:
            t = now()
            jobs = []
            with LOCK:
                for pid in [k for k, at in list(PLAN_AT.items()) if at <= t]:
                    p = pload(pid)
                    if not p:
                        PLAN_AT.pop(pid, None)
                        continue
                    plan = p.get('plan') or []
                    due = [e for e in plan if t - PUSH_LATE <= e['t'] <= t]
                    p['plan'] = [e for e in plan if e['t'] > t]
                    if p['plan']:
                        PLAN_AT[pid] = min(e['t'] for e in p['plan'])
                    else:
                        PLAN_AT.pop(pid, None)
                    if due and p.get('subs') and (any(e.get('force') for e in due) or t - p.get('last', 0) > PUSH_IDLE):
                        p['pmsg'] = {'title': 'Mèo Xu', 'body': due[-1]['body'], 't': t}
                        jobs.append((pid, list(p['subs'])))
                    psave(p)
            for pid, eps in jobs:
                for ep in eps:
                    st = push_send(v, ep)
                    if st in (404, 410):                      # trình duyệt đã hủy đăng ký này
                        with LOCK:
                            p = pload(pid)
                            if p:
                                p['subs'] = [x for x in p.get('subs', []) if x != ep]
                                psave(p)
                            EP_OF.pop(ep, None)
                    elif st not in (200, 201, 202):
                        sys.stderr.write('%s Thông báo đẩy cho %s không gửi được (mã %d)\n' % (time.strftime('%H:%M:%S'), pid, st))
        except Exception as e:                                # vòng lặp nền không được chết vì một hồ sơ lỗi
            sys.stderr.write('push_loop: %r\n' % (e,))


def xf_code(n):
    return '-'.join(''.join(secrets.choice(XF_ABC) for _ in range(4)) for _ in range(n // 4))


def xf_hash(code):
    c = re.sub(r'[^A-Z0-9]', '', str(code or '').upper())
    return hashlib.sha256(('meoxu-xfer:' + c).encode()).hexdigest() if len(c) in (8, 12) else ''


def tok_hash(tok):
    return hashlib.sha256(('meoxu-tok:' + str(tok)).encode()).hexdigest()


def tok_check(p, tok):
    """None nếu khóa đúng; 'moved' nếu là khóa cũ của máy đã chuyển hồ sơ sang máy khác; 'bad' nếu sai."""
    tok = str(tok or '')
    if hmac.compare_digest(tok.encode(), p['tok'].encode()):
        return None
    return 'moved' if tok and tok_hash(tok) in p.get('oldtok', []) else 'bad'


def clean_name(s):
    s = re.sub(r'[\x00-\x1f<>]', '', str(s or '')).strip()[:20]
    return s or 'Người chơi'


def log(p, msg, warn=False):
    p.setdefault('log', []).append({'t': now(), 'm': msg, 'w': 1 if warn else 0})
    del p['log'][:-LOG_MAX]


def summarize(save):
    """Rút gọn bản lưu thành các con số Admin cần xem. Không phụ thuộc vào data.js của game."""
    cats = [c for c in (save.get('cats') or []) if isinstance(c, dict)]
    stars = [0] * 6
    for c in cats:
        s = c.get('star')
        if isinstance(s, int) and 1 <= s <= 5:
            stars[s] += 1
    num = lambda k, d=0: save.get(k) if isinstance(save.get(k), (int, float)) else d
    return {
        'coins': int(num('coins')), 'tickets': int(num('tickets')), 'level': int(num('level', 1)), 'xp': int(num('xp')),
        'ncat': len(cats), 'stars': stars[1:],
        'rare': sum(1 for c in cats if str(c.get('coat') or '').startswith('r_')),
        'rooms': len(save.get('rooms') or {}), 'items': len(save.get('items') or []),
        'trips': sum(1 for t in (save.get('trips') or []) if t), 'pity': int(num('pity')),
        'released': int(num('released')), 'inf': bool((save.get('adm') or {}).get('inf')),
        'cats': [{'uid': c.get('uid'), 'sp': c.get('sp'), 'star': c.get('star'), 'coat': c.get('coat'), 'name': str(c.get('name') or '')[:20],
                  'room': c.get('room')} for c in cats][:400],
    }


def diff_log(p, old, new):
    """So hai lần đồng bộ liên tiếp để ghi nhật ký: lên cấp, mèo hiếm mới, phóng sinh, xu tăng bất thường."""
    if not old:
        log(p, 'Bắt đầu chơi: cấp %d, %d xu, %d mèo' % (new['level'], new['coins'], new['ncat']))
        return
    if new['level'] > old['level']:
        log(p, 'Lên cấp %d' % new['level'])
    seen = {c['uid'] for c in old.get('cats', [])}
    for c in new['cats']:
        if c['uid'] in seen:
            continue
        rare = str(c.get('coat') or '').startswith('r_')
        if (c.get('star') or 0) >= 5 or rare:
            log(p, 'Có mèo mới: %s %s★%s (%s)' % (c.get('sp'), c.get('star'), ' màu hiếm ' + c['coat'] if rare else '', c.get('name')))
    if new['ncat'] < old['ncat'] and new['released'] > old.get('released', 0):
        log(p, 'Phóng sinh %d bé' % (new['released'] - old.get('released', 0)))
    gain = new['coins'] - old['coins'] - p.pop('gift', 0)
    if gain > JUMP:
        log(p, 'Xu tăng bất thường: +%d trong một lần đồng bộ' % gain, True)
    if new['inf'] and not old.get('inf'):
        log(p, 'Bật "xu vô hạn" của bảng Admin', True)
    if new['level'] < old['level'] or (new['ncat'] <= 1 and old['ncat'] > 3):
        log(p, 'Bản lưu bị đặt lại hoặc lùi (cấp %d → %d, mèo %d → %d)' % (old['level'], new['level'], old['ncat'], new['ncat']), True)


def public(p, full=False):
    s = dict(p.get('sum') or {})
    if not full:
        s.pop('cats', None)
    o = {'id': p['id'], 'name': p['name'], 'created': p.get('created'), 'last': p.get('last'), 'play': p.get('play', 0),
         'online': now() - p.get('last', 0) < ONLINE, 'pending': len(p.get('cmds', [])), 'sum': s, 'ip': p.get('ip', ''),
         'warn': sum(1 for e in p.get('log', []) if e.get('w')), 'trust': bool(p.get('trust')), 'rej': p.get('rej', 0),
         'rc': bool(p.get('rc')), 'mvat': p.get('mvat', 0)}
    if full:
        o['log'] = p.get('log', [])[-120:]
        o['cmds'] = p.get('cmds', [])
        o['ua'] = p.get('ua', '')
    return o


class H(SimpleHTTPRequestHandler):
    server_version = 'MeoXu'
    sys_version = ''
    timeout = 20                      # kết nối treo quá 20 giây thì đóng (chống giữ kết nối chậm)

    def ip(self):
        a = self.client_address[0]
        if a in ('127.0.0.1', '::1'):  # đi qua đường hầm HTTPS (cloudflared...) thì lấy IP thật do đường hầm ghi
            f = self.headers.get('CF-Connecting-IP') or (self.headers.get('X-Forwarded-For') or '').split(',')[-1].strip()
            if f:
                return f[:64]
        return a

    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, fmt, *args):
        if '/api/' not in (self.path or ''):
            return
        sys.stderr.write('%s %s\n' % (time.strftime('%H:%M:%S'), fmt % args))

    # ---- tiện ích ----
    def send_json(self, obj, code=200):
        b = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(b)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(b)

    def body(self):
        try:
            n = int(self.headers.get('Content-Length') or 0)
        except ValueError:
            return None
        if n <= 0 or n > MAX_BODY:
            return None
        try:
            o = json.loads(self.rfile.read(n).decode('utf-8'))
            return o if isinstance(o, dict) else None
        except ValueError:
            return None

    def is_admin(self):
        return hmac.compare_digest((self.headers.get('X-Admin-Key') or '').encode(), self.server.akey.encode())

    def admin_gate(self):
        """Kiểm mã quản trị, có giới hạn số lần nhập sai theo IP. Trả None nếu được vào, hoặc (mã lỗi, nội dung)."""
        k = ('afail', self.ip())
        if RATE.over(k, LIM_ADMFAIL):
            return 429, {'err': 'Nhập sai mã quản trị quá nhiều lần, đợi 15 phút rồi thử lại'}
        if self.is_admin():
            return None
        RATE.hit(k, LIM_ADMFAIL)
        return 403, {'err': 'Sai mã quản trị'}

    def end_headers(self):
        if not self.path.startswith('/api/'):
            self.send_header('Cache-Control', 'no-cache')   # file game: luôn hỏi lại máy chủ, khỏi phải Ctrl+F5 sau khi cập nhật
        for k, v in SEC_HEADERS:
            self.send_header(k, v)
        super().end_headers()

    def list_directory(self, path):   # không bao giờ liệt kê thư mục
        self.send_error(404)
        return None

    # ---- file tĩnh: chỉ phục vụ đúng các file của game (danh sách cho phép), không lộ data/, tools/, docs/, .git, mã nguồn máy chủ ----
    def blocked(self):
        rel = unquote(urlparse(self.path).path).lstrip('/')
        if '\\' in rel or '\x00' in rel or any(x in ('..', '.') or x.startswith('.') for x in rel.split('/')):
            return True
        if rel in STATIC_FILES:
            return False
        return not (rel.startswith(STATIC_DIRS) and os.path.isfile(os.path.join(ROOT, *rel.split('/'))))

    def do_GET(self):
        u = urlparse(self.path)
        if u.path.startswith('/api/'):
            if not RATE.hit(('api', self.ip()), LIM_API):
                return self.send_json({'err': 'Gửi yêu cầu quá nhanh, đợi một chút'}, 429)
            return self.api_get(u.path[5:], parse_qs(u.query))
        if self.blocked():
            return self.send_error(404)
        super().do_GET()

    def do_HEAD(self):
        if self.path.startswith('/api/') or self.blocked():
            return self.send_error(404)
        super().do_HEAD()

    def do_POST(self):
        u = urlparse(self.path)
        if not u.path.startswith('/api/'):
            return self.send_error(404)
        if not RATE.hit(('api', self.ip()), LIM_API):
            return self.send_json({'err': 'Gửi yêu cầu quá nhanh, đợi một chút'}, 429)
        b = self.body()
        if b is None:
            return self.send_json({'err': 'Dữ liệu gửi lên không hợp lệ'}, 400)
        self.api_post(u.path[5:], b)

    # ---- API ----
    def api_get(self, ep, q):
        if ep == 'ping':                     # kèm hạt giống thời tiết và giờ máy chủ: mọi người chơi cùng một trời
            return self.send_json({'ok': 1, 'app': 'meoxu', 'wx': {'seed': self.server.wxseed, 't': int(time.time() * 1000)}})
        if ep == 'push/key':                # khóa công khai để trình duyệt đăng ký nhận thông báo đẩy
            return self.send_json({'ok': 1, 'key': self.server.vapid['pub']})
        if not ep.startswith('admin/'):
            return self.send_json({'err': 'Không có'}, 404)
        g = self.admin_gate()
        if g:
            return self.send_json(g[1], g[0])
        with LOCK:
            if ep == 'admin/check':
                return self.send_json({'ok': 1})
            if ep == 'admin/players':
                return self.send_json({'ok': 1, 'now': now(), 'players': [public(p) for p in pall()]})
            if ep == 'admin/player':
                p = pload((q.get('id') or [''])[0])
                return self.send_json({'ok': 1, 'now': now(), 'player': public(p, True)} if p else {'err': 'Không tìm thấy người chơi'}, 200 if p else 404)
        self.send_json({'err': 'Không có'}, 404)

    def api_post(self, ep, b):
        with LOCK:
            if ep == 'join':
                if not RATE.hit(('join', self.ip()), LIM_JOIN):
                    return self.send_json({'err': 'Đã tạo quá nhiều hồ sơ từ máy này, thử lại sau'}, 429)
                p = {'id': secrets.token_hex(6), 'tok': secrets.token_hex(16), 'name': clean_name(b.get('name')), 'created': now(), 'last': now(),
                     'play': 0, 'cn': 0, 'nn': 0, 'cmds': [], 'log': [], 'sum': None, 'save': None}
                psave(p)
                return self.send_json({'ok': 1, 'id': p['id'], 'tok': p['tok'], 'name': p['name']})
            if ep == 'sync':
                return self.sync(b)
            if ep.startswith('xfer/'):
                return self.xfer(ep[5:], b)
            if ep.startswith('push/'):
                return self.push_api(ep[5:], b)
            if not ep.startswith('admin/'):
                return self.send_json({'err': 'Không có'}, 404)
            g = self.admin_gate()
            if g:
                return self.send_json(g[1], g[0])
            if ep == 'admin/cmd':
                return self.admin_cmd(b)
            p = pload(str(b.get('id') or ''))
            if not p:
                return self.send_json({'err': 'Không tìm thấy người chơi'}, 404)
            if ep == 'admin/rename':
                old = p['name']
                p['name'] = clean_name(b.get('name'))
                log(p, 'Quản trị đổi tên: %s → %s' % (old, p['name']))
                psave(p)
                return self.send_json({'ok': 1})
            if ep == 'admin/uncmd':        # hủy các lệnh còn chờ
                n = len(p.get('cmds', []))
                p['cmds'] = []
                p.pop('gift', None)
                log(p, 'Quản trị hủy %d lệnh đang chờ' % n)
                psave(p)
                return self.send_json({'ok': 1, 'n': n})
            if ep == 'admin/trust':         # tin tưởng người chơi: bỏ kiểm tra chống gian lận (vẫn ghi nhận lượt gacha)
                p['trust'] = bool(b.get('on'))
                log(p, 'Quản trị ' + ('bỏ kiểm tra chống gian lận' if p['trust'] else 'bật lại kiểm tra chống gian lận'))
                psave(p)
                return self.send_json({'ok': 1})
            if ep == 'admin/xfer':          # người chơi mất máy cũ, không có mã khôi phục: quản trị viên cấp mã chuyển máy
                if not p.get('save'):
                    return self.send_json({'err': 'Người chơi này chưa có bản lưu trên máy chủ'}, 400)
                code = xf_code(8)
                p['xf'] = {'h': xf_hash(code), 'e': now() + XF_TTL}
                log(p, 'Quản trị viên tạo mã chuyển máy')
                psave(p)
                return self.send_json({'ok': 1, 'code': code, 'exp': p['xf']['e'], 'now': now()})
            if ep == 'admin/delete':
                os.remove(ppath(p['id']))
                return self.send_json({'ok': 1})
        self.send_json({'err': 'Không có'}, 404)

    def sync(self, b):
        p = pload(str(b.get('id') or ''))
        if not p:
            return self.send_json({'err': 'gone'}, 404)
        k = tok_check(p, b.get('tok'))
        if k:
            return self.tok_fail(p, k)
        t = now()
        gap = t - p.get('last', t)
        if 0 < gap <= 120:
            p['play'] = p.get('play', 0) + gap          # thời gian chơi: cộng dồn khoảng giữa các lần đồng bộ liền nhau
        p['last'] = t
        p['ip'] = self.client_address[0]
        p['ua'] = (self.headers.get('User-Agent') or '')[:160]
        # lệnh đã áp dụng ở máy người chơi (số thứ tự <= cn): chỉ bỏ khỏi hàng chờ khi bản lưu mang chúng được chấp nhận,
        # bản lưu bị từ chối thì máy người chơi quay về bản cũ và nhận lại các lệnh này
        cn = b.get('cn') if isinstance(b.get('cn'), int) else 0
        done = [c for c in p.get('cmds', []) if c['n'] <= cn]
        rest = [c for c in p.get('cmds', []) if c['n'] > cn]
        out = {'ok': 1, 'name': p['name'], 'rc': (p.get('rc') or {}).get('t', 0)}
        raw = b.get('save')
        sv = None
        if isinstance(raw, str) and raw:
            try:
                sv = json.loads(raw)
            except ValueError:
                sv = None
        if isinstance(sv, dict):
            v = self.verdict(p, sv, done, t)
            if v.get('ok'):
                if 'used' in v:
                    p['rq'] = p.get('rq', [])[v['used']:]
                    p['rqack'] = v['ack']
                    p['gpity'] = v['pity']
                if v.get('budget') is not None:
                    p['bud'] = v['budget']
                p['jt'] = t
                p['cmds'] = rest
                p['gift'] = p.get('gift', 0) + sum(c.get('amt', 0) for c in done if c['type'] == 'coins')   # quà xu không tính là tăng bất thường
                new = summarize(sv)
                diff_log(p, p.get('sum'), new)
                p['sum'] = new
                p['save'] = raw
            elif v.get('busy'):
                out['busy'] = 1
            elif v.get('fresh') or not p.get('save'):
                out['fresh'] = 1
                out['why'] = v.get('why', '')
                log(p, 'Từ chối bản lưu, yêu cầu chơi lại từ đầu: ' + v.get('why', ''), True)
            else:
                out['restore'] = p['save']
                out['why'] = v.get('why', '')
                if not v.get('restore'):          # bản lưu cũ hơn (xóa dữ liệu trình duyệt...) chỉ là khôi phục, không phải gian lận
                    p['rej'] = p.get('rej', 0) + 1
                log(p, ('Khôi phục bản lưu: ' if v.get('restore') else 'Từ chối bản lưu, trả về bản trước: ') + v.get('why', ''), not v.get('restore'))
        else:
            p['cmds'] = rest
        if 'plan' in b:
            set_plan(p, b.get('plan'))
        if JUDGE.on:                              # phát thêm lượt gacha cho đủ hàng
            rq = p.setdefault('rq', [])
            while len(rq) < RQ_N:
                p['rqn'] = p.get('rqn', 0) + 1
                rq.append({'q': p['rqn'], 's': secrets.randbits(32)})
            out.update(rq=rq, ack=p.get('rqack', 0), pity=p.get('gpity', 0))
        out['cmds'] = p['cmds']
        psave(p)
        self.send_json(out)

    def tok_fail(self, p, k):
        if k == 'moved':
            return self.send_json({'err': 'moved', 'name': p['name'], 'at': p.get('mvat', 0)}, 409)
        return self.send_json({'err': 'Sai khóa người chơi'}, 403)

    def xfer(self, ep, b):
        """Chuyển tiến độ sang máy khác. Máy mới chỉ nhận bản lưu hợp lệ mà máy chủ đang giữ (đã qua trọng tài), không bao giờ nhận
        file từ người chơi. Nhận xong thì máy chủ cấp khóa mới cho máy mới và hủy khóa của máy cũ: mỗi lúc chỉ một máy chơi được."""
        if ep == 'use':
            ip = self.ip()
            if RATE.over(('xfail', ip), LIM_XFAIL) or RATE.over(('xfail', '*'), LIM_XFAIL_ALL):
                return self.send_json({'err': 'Nhập sai mã quá nhiều lần, đợi 15 phút rồi thử lại'}, 429)
            h, t = xf_hash(b.get('code')), now()
            hit, kind = None, ''
            if h:
                for q in pall():
                    xf = q.get('xf') or {}
                    if xf.get('h') and hmac.compare_digest(xf['h'], h) and xf.get('e', 0) > t:
                        hit, kind = q, 'xf'
                        break
                    rc = q.get('rc') or {}
                    if rc.get('h') and hmac.compare_digest(rc['h'], h):
                        hit, kind = q, 'rc'
                        break
            if not hit or not hit.get('save'):
                RATE.hit(('xfail', ip), LIM_XFAIL)
                RATE.hit(('xfail', '*'), LIM_XFAIL_ALL)
                return self.send_json({'err': 'Mã không đúng hoặc đã hết hạn'}, 400)
            p = hit
            p.pop(kind, None)                      # mã nào cũng chỉ dùng được một lần
            p['oldtok'] = (p.get('oldtok', []) + [tok_hash(p['tok'])])[-8:]
            p['tok'] = secrets.token_hex(16)
            p['mvat'] = t
            for e in p.get('subs', []):            # thông báo đẩy không còn gửi tới máy cũ
                EP_OF.pop(e, None)
            p['subs'] = []
            log(p, 'Chuyển sang máy khác bằng %s (IP %s)' % ('mã khôi phục' if kind == 'rc' else 'mã chuyển máy', ip))
            psave(p)
            return self.send_json({'ok': 1, 'id': p['id'], 'tok': p['tok'], 'name': p['name'], 'save': p['save'], 'rc': kind == 'rc'})
        p = pload(str(b.get('id') or ''))
        k = tok_check(p, b.get('tok')) if p else 'bad'
        if k:
            return self.tok_fail(p, k)
        if ep in ('new', 'rec') and not RATE.hit(('xnew', p['id']), LIM_XNEW):
            return self.send_json({'err': 'Đã tạo mã quá nhiều lần, thử lại sau một giờ'}, 429)
        if ep == 'new':                            # mã chuyển máy: 8 ký tự, 10 phút, một lần
            if not p.get('save'):
                return self.send_json({'err': 'Máy chủ chưa có bản lưu của bạn, đợi vài giây rồi thử lại'}, 400)
            code = xf_code(8)
            p['xf'] = {'h': xf_hash(code), 'e': now() + XF_TTL}
            log(p, 'Tạo mã chuyển máy')
            psave(p)
            return self.send_json({'ok': 1, 'code': code, 'exp': p['xf']['e'], 'now': now(), 'sum': {x: (p.get('sum') or {}).get(x, 0) for x in ('level', 'coins', 'tickets', 'ncat')}})
        if ep == 'cancel':
            p.pop('xf', None)
            psave(p)
            return self.send_json({'ok': 1})
        if ep == 'rec':                            # mã khôi phục: 12 ký tự, không hết hạn, dùng một lần; tạo mã mới thì mã cũ mất hiệu lực
            code = xf_code(12)
            p['rc'] = {'h': xf_hash(code), 't': now()}
            log(p, 'Tạo mã khôi phục mới')
            psave(p)
            return self.send_json({'ok': 1, 'code': code, 't': p['rc']['t']})
        self.send_json({'err': 'Không có'}, 404)

    def verdict(self, p, sv, done, t):
        """Hỏi trọng tài về bản lưu mới. Trả {ok:1,...} | {ok:0, why, fresh?, restore?} | {busy:1}."""
        reset = any(c['type'] == 'reset' for c in done)
        first = reset or not p.get('save')
        trust = self.is_admin() or bool(p.get('trust'))
        if not JUDGE.on:                          # không có Node: chỉ kiểm cơ bản
            if (sv.get('adm') or {}).get('inf') and not trust:
                return {'ok': 0, 'why': 'Bật "xu vô hạn" của bảng Admin'}
            return {'ok': 1}
        try:
            old = None if first else json.loads(p['save'])
        except ValueError:
            old, first = None, True
        if 'gpity' not in p:                      # hồ sơ có từ trước khi có trọng tài: lấy bảo hiểm gacha từ bản lưu cũ
            try:
                p['gpity'] = max(0, min(int((old or {}).get('pity') or 0), 50)) + 100 * max(0, min(int((old or {}).get('pity5') or 0), 40))
            except (TypeError, ValueError):
                p['gpity'] = 0
        gift = {'coins': sum(c.get('amt', 0) for c in done if c['type'] == 'coins'),
                'tickets': sum(c.get('amt', 0) for c in done if c['type'] == 'tickets'),
                'cats': [{'sp': c.get('sp'), 'star': c.get('star') or 0} for c in done if c['type'] == 'cat']}
        req = {'old': old, 'neu': sv, 'dt': max(0, t - p.get('jt', t)), 'issued': p.get('rq', []), 'ack': p.get('rqack', 0),
               'pity': p.get('gpity', 0), 'gift': gift, 'first': first, 'trust': trust, 'budget': p.get('bud')}
        r = JUDGE.call(req)
        if r is None or r.get('err'):
            if r:
                sys.stderr.write('%s\n' % r.get('why'))
            return {'busy': 1}
        return r

    def push_api(self, ep, b):
        if ep == 'pull':                    # service worker vừa nhận một thông báo đẩy, hỏi nội dung cần hiện
            p = pload(EP_OF.get(str(b.get('endpoint') or ''), ''))
            m = (p or {}).get('pmsg')
            return self.send_json({'ok': 1, 'title': m['title'], 'body': m['body']} if m else {'ok': 0})
        p = pload(str(b.get('id') or ''))
        k = tok_check(p, b.get('tok')) if p else 'bad'
        if k:
            return self.tok_fail(p, k)
        e = str(b.get('endpoint') or '')
        if ep == 'sub':                     # trình duyệt của người chơi đăng ký nhận đẩy (giữ 3 đăng ký gần nhất)
            if not push_host_ok(e):
                return self.send_json({'err': 'Địa chỉ nhận đẩy không hợp lệ'}, 400)
            p['subs'] = ([x for x in p.get('subs', []) if x != e] + [e])[-3:]
            EP_OF[e] = p['id']
        elif ep == 'unsub':
            p['subs'] = [x for x in p.get('subs', []) if x != e]
            EP_OF.pop(e, None)
        elif ep == 'plan':                  # gói nhỏ game gửi lúc rời trang
            set_plan(p, b.get('plan'))
        elif ep == 'test':                  # gửi thử sau 15 giây, kể cả khi game đang mở
            if not p.get('subs'):
                return self.send_json({'err': 'Trình duyệt này chưa đăng ký nhận đẩy'}, 400)
            p['plan'] = [x for x in (p.get('plan') or []) if not x.get('force')] + [{'t': now() + 15, 'force': 1, 'body': 'Thông báo đẩy đang hoạt động: tắt hẳn game vẫn nhận được.'}]
            PLAN_AT[p['id']] = min(x['t'] for x in p['plan'])
        else:
            return self.send_json({'err': 'Không có'}, 404)
        psave(p)
        self.send_json({'ok': 1})

    def admin_cmd(self, b):
        cmd = b.get('cmd')
        if not isinstance(cmd, dict) or cmd.get('type') not in CMD_TYPES:
            return self.send_json({'err': 'Lệnh không hợp lệ'}, 400)
        ids = b.get('ids')
        ps = pall() if ids == 'all' else [p for p in (pload(str(i)) for i in (ids or [])) if p]
        c = {'type': cmd['type']}
        if c['type'] in ('coins', 'tickets'):
            try:
                c['n'] = max(-10 ** 9, min(10 ** 9, int(cmd.get('n'))))
            except (TypeError, ValueError):
                return self.send_json({'err': 'Số lượng không hợp lệ'}, 400)
            if not c['n']:
                return self.send_json({'err': 'Số lượng phải khác 0'}, 400)
        elif c['type'] == 'cat':
            c['sp'] = str(cmd.get('sp') or '')[:40]
            c['star'] = cmd.get('star') if cmd.get('star') in (1, 2, 3, 4, 5) else 0
            c['coat'] = str(cmd.get('coat') or '')[:40]
            if not re.match(r'^[A-Za-z0-9_]+$', c['sp']):
                return self.send_json({'err': 'Chưa chọn giống mèo'}, 400)
        elif c['type'] == 'msg':
            c['text'] = re.sub(r'[\x00-\x1f]', ' ', str(cmd.get('text') or '')).strip()[:200]
            if not c['text']:
                return self.send_json({'err': 'Chưa nhập nội dung'}, 400)
        label = {'coins': lambda: 'tặng %+d xu' % c['n'], 'tickets': lambda: 'tặng %+d vé' % c['n'], 'cat': lambda: 'tặng mèo %s' % c['sp'],
                 'msg': lambda: 'gửi thông báo: ' + c['text'], 'reset': lambda: 'đặt lại toàn bộ dữ liệu'}[c['type']]()
        for p in ps:
            p['nn'] = p.get('nn', 0) + 1
            one = {k: v for k, v in c.items() if k != 'n'}
            if 'n' in c:
                one['amt'] = c['n']                      # số lượng xu/vé; trường "n" của hàng chờ là số thứ tự lệnh
            one['n'] = p['nn']
            p.setdefault('cmds', []).append(one)
            log(p, 'Quản trị ' + label)
            psave(p)
        self.send_json({'ok': 1, 'n': len(ps)})


def main():
    for st in (sys.stdout, sys.stderr):                   # cửa sổ lệnh Windows mặc định không in được tiếng Việt
        try:
            st.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    host = sys.argv[2] if len(sys.argv) > 2 else '0.0.0.0'
    srv = ThreadingHTTPServer((host, port), H)
    srv.akey = admin_key()
    if not os.path.exists(WXF):
        with open(WXF, 'w', encoding='utf-8') as f:
            f.write(str(secrets.randbits(31)))
    with open(WXF, encoding='utf-8') as f:
        srv.wxseed = int(f.read().strip() or 1)
    srv.vapid = vapid()
    for p in pall():                                      # dựng lại bảng tra thông báo đẩy từ các hồ sơ đã lưu
        for e in p.get('subs', []):
            EP_OF[e] = p['id']
        if p.get('plan'):
            PLAN_AT[p['id']] = min(e['t'] for e in p['plan'])
    threading.Thread(target=push_loop, args=(srv.vapid,), daemon=True).start()
    print('Mèo Xu đang chạy ở cổng %d. Máy này vào: http://localhost:%d' % (port, port))
    print('Máy khác trong mạng vào bằng http://<địa chỉ IP máy này>:%d' % port)
    print('Mã quản trị (nhập khi mở bảng Admin): %s   (lưu ở data/admin_key.txt)' % srv.akey)
    if JUDGE.on:
        try:
            with JUDGE.lk:
                JUDGE._start()
            print('Chống gian lận: đang bật (trọng tài tools/guard.js chạy bằng %s).' % JUDGE.node)
        except Exception as e:
            print('CẢNH BÁO: trọng tài chống gian lận không khởi động được (%s). Bản lưu sẽ được kiểm lại ở lần đồng bộ sau.' % e)
    else:
        print('CẢNH BÁO: không tìm thấy Node.js nên chỉ kiểm tra chống gian lận cơ bản. Cài Node (nodejs.org) để bật đầy đủ.')
    print('Cài ứng dụng và thông báo đẩy chỉ chạy khi mở game bằng localhost hoặc HTTPS (địa chỉ http://<IP> thì trình duyệt không cho).')
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\nĐã dừng.')


if __name__ == '__main__':
    main()
