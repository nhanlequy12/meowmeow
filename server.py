#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Máy chủ nhỏ cho Mèo Xu: phục vụ file game và giữ bản lưu của từng người chơi để Admin theo dõi, quản lý.

Chạy:   python server.py            (cổng 8765, mọi máy trong mạng LAN vào được)
        python server.py 9000       (đổi cổng)
Dữ liệu nằm trong thư mục data/ cạnh file này (không commit):
    data/admin_key.txt      mã quản trị, tự sinh lần đầu, in ra màn hình khi khởi động
    data/players/<id>.json  hồ sơ, bản lưu, hàng lệnh chờ và nhật ký của từng người chơi
Chỉ dùng thư viện chuẩn của Python 3.8+.
"""
import hmac, json, os, re, secrets, sys, threading, time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, 'data')
PDIR = os.path.join(DATA, 'players')
KEYF = os.path.join(DATA, 'admin_key.txt')
LOCK = threading.Lock()
ID_RE = re.compile(r'^[0-9a-f]{12}$')
MAX_BODY = 4 * 1024 * 1024
LOG_MAX = 300
ONLINE = 90            # giây: đồng bộ gần hơn mức này thì coi là đang chơi
JUMP = 20000           # xu tăng quá mức này giữa hai lần đồng bộ mà không phải quà thì ghi cảnh báo
CMD_TYPES = {'coins', 'tickets', 'cat', 'msg', 'reset'}


def now():
    return int(time.time())


def admin_key():
    os.makedirs(PDIR, exist_ok=True)
    if not os.path.exists(KEYF):
        with open(KEYF, 'w', encoding='utf-8') as f:
            f.write(secrets.token_hex(4))
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
         'warn': sum(1 for e in p.get('log', []) if e.get('w'))}
    if full:
        o['log'] = p.get('log', [])[-120:]
        o['cmds'] = p.get('cmds', [])
        o['ua'] = p.get('ua', '')
    return o


class H(SimpleHTTPRequestHandler):
    server_version = 'MeoXu/1'

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
        n = int(self.headers.get('Content-Length') or 0)
        if n <= 0 or n > MAX_BODY:
            return None
        try:
            o = json.loads(self.rfile.read(n).decode('utf-8'))
            return o if isinstance(o, dict) else None
        except ValueError:
            return None

    def is_admin(self):
        return hmac.compare_digest((self.headers.get('X-Admin-Key') or '').encode(), self.server.akey.encode())

    def end_headers(self):
        if not self.path.startswith('/api/'):
            self.send_header('Cache-Control', 'no-cache')   # file game: luôn hỏi lại máy chủ, khỏi phải Ctrl+F5 sau khi cập nhật
        super().end_headers()

    # ---- file tĩnh: chỉ phục vụ game, không lộ data/, .git, mã nguồn máy chủ ----
    def blocked(self):
        parts = [x for x in urlparse(self.path).path.split('/') if x]
        return any(x.startswith('.') for x in parts) or (parts and (parts[0] == 'data' or parts[0].endswith(('.py', '.md'))))

    def do_GET(self):
        u = urlparse(self.path)
        if u.path.startswith('/api/'):
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
        b = self.body()
        if b is None:
            return self.send_json({'err': 'Dữ liệu gửi lên không hợp lệ'}, 400)
        self.api_post(u.path[5:], b)

    # ---- API ----
    def api_get(self, ep, q):
        if ep == 'ping':
            return self.send_json({'ok': 1, 'app': 'meoxu'})
        if not ep.startswith('admin/'):
            return self.send_json({'err': 'Không có'}, 404)
        if not self.is_admin():
            return self.send_json({'err': 'Sai mã quản trị'}, 403)
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
                p = {'id': secrets.token_hex(6), 'tok': secrets.token_hex(16), 'name': clean_name(b.get('name')), 'created': now(), 'last': now(),
                     'play': 0, 'cn': 0, 'nn': 0, 'cmds': [], 'log': [], 'sum': None, 'save': None}
                psave(p)
                return self.send_json({'ok': 1, 'id': p['id'], 'tok': p['tok'], 'name': p['name']})
            if ep == 'sync':
                return self.sync(b)
            if not ep.startswith('admin/'):
                return self.send_json({'err': 'Không có'}, 404)
            if not self.is_admin():
                return self.send_json({'err': 'Sai mã quản trị'}, 403)
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
            if ep == 'admin/delete':
                os.remove(ppath(p['id']))
                return self.send_json({'ok': 1})
        self.send_json({'err': 'Không có'}, 404)

    def sync(self, b):
        p = pload(str(b.get('id') or ''))
        if not p:
            return self.send_json({'err': 'gone'}, 404)
        if not hmac.compare_digest(str(b.get('tok') or '').encode(), p['tok'].encode()):
            return self.send_json({'err': 'Sai khóa người chơi'}, 403)
        t = now()
        gap = t - p.get('last', t)
        if 0 < gap <= 120:
            p['play'] = p.get('play', 0) + gap          # thời gian chơi: cộng dồn khoảng giữa các lần đồng bộ liền nhau
        p['last'] = t
        p['ip'] = self.client_address[0]
        p['ua'] = (self.headers.get('User-Agent') or '')[:160]
        # lệnh đã áp dụng xong ở máy người chơi thì bỏ khỏi hàng chờ
        cn = b.get('cn') if isinstance(b.get('cn'), int) else 0
        done = [c for c in p.get('cmds', []) if c['n'] <= cn]
        p['cmds'] = [c for c in p.get('cmds', []) if c['n'] > cn]
        p['gift'] = p.get('gift', 0) + sum(c.get('amt', 0) for c in done if c['type'] == 'coins')   # quà xu không tính là tăng bất thường
        raw = b.get('save')
        if isinstance(raw, str) and raw:
            try:
                sv = json.loads(raw)
                if isinstance(sv, dict):
                    new = summarize(sv)
                    diff_log(p, p.get('sum'), new)
                    p['sum'] = new
                    p['save'] = raw
            except ValueError:
                pass
        psave(p)
        self.send_json({'ok': 1, 'name': p['name'], 'cmds': p['cmds']})

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
    print('Mèo Xu đang chạy ở cổng %d. Máy này vào: http://localhost:%d' % (port, port))
    print('Máy khác trong mạng vào bằng http://<địa chỉ IP máy này>:%d' % port)
    print('Mã quản trị (nhập khi mở bảng Admin): %s   (lưu ở data/admin_key.txt)' % srv.akey)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\nĐã dừng.')


if __name__ == '__main__':
    main()
