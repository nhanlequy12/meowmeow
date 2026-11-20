# -*- coding: utf-8 -*-
"""Tạo lại hai font nhúng sẵn của Mèo Xu trong css/fonts/ từ bản gốc.

  python tools/mkfonts.py <Galmuri11.ttf> <Nunito[wght].ttf>

Bản gốc:
  - Galmuri11.ttf (Regular, bản viền glyf) trong gói Galmuri v2.40.4: https://github.com/quiple/galmuri/releases
    Bản Bold của Galmuri11 thiếu chữ tiếng Việt nên game chỉ dùng Regular, đậm giả bằng text-shadow (css/fonts.css).
  - Nunito[wght].ttf (biến thiên, trục wght 200–1000): https://github.com/google/fonts/tree/main/ofl/nunito
Cần fontTools có brotli: pip install fonttools brotli

Kết quả:
  css/fonts/meoxu-pixel.woff2  Galmuri11 cắt còn Latin + tiếng Việt + dấu câu, ĐỔI TÊN thành "MeoXu Pixel"
                               (bảng name ID 1, 3, 4, 6, 16, 17), vì giấy phép OFL không cho bản sửa đổi giữ tên gốc.
  css/fonts/nunito.woff2       Nunito biến thiên cắt còn Latin + tiếng Việt (giữ tên Nunito: không có tên dành riêng).
Giấy phép đi kèm: css/fonts/OFL-Galmuri.txt, css/fonts/OFL-Nunito.txt (viết tay, không do script này tạo).
"""
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'css', 'fonts')

# Latin cơ bản, Latin-1, các chữ Việt (Ă Đ Ĩ Ũ Ơ Ư, Ạ–Ỹ), dấu tổ hợp, dấu câu chung, ₫, mũi tên, sao
UNI = ('U+0020-007E,U+00A0-00FF,U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,'
       'U+0300-0323,U+1EA0-1EF9,U+2000-206F,U+20AB,U+2190-2193,U+2605-2606')

PIXEL_NAME = 'MeoXu Pixel'
PIXEL_PS = 'MeoXuPixel-Regular'


def cut(src):
    opt = subset.Options()
    opt.flavor = 'woff2'
    opt.layout_features = ['*']
    opt.name_IDs = ['*']
    opt.name_languages = ['*']
    opt.notdef_outline = True
    opt.glyph_names = False
    opt.hinting = True
    f = subset.load_font(src, opt)
    s = subset.Subsetter(opt)
    s.populate(unicodes=subset.parse_unicodes(UNI))
    s.subset(f)
    return f, opt


def rename(f):
    """Đổi họ font thành MeoXu Pixel; giữ dòng bản quyền (ID 0) và giấy phép (ID 13, 14), ghi chú bản sửa đổi ở ID 5."""
    nm = f['name']
    ver = nm.getDebugName(5) or ''
    new = {1: PIXEL_NAME, 2: 'Regular', 3: PIXEL_PS + ';modified from Galmuri11 2.40.4', 4: PIXEL_NAME,
           6: PIXEL_PS, 16: PIXEL_NAME, 17: 'Regular',
           5: (ver + '; subset and renamed from Galmuri11 for Meo Xu').strip('; ')}
    # bỏ các bản ghi tên cũ (mọi nền tảng, mọi ngôn ngữ) của những ID sẽ ghi lại, rồi ghi bản Windows và Mac
    nm.names = [r for r in nm.names if r.nameID not in new and r.nameID not in (18, 21, 22)]
    for i, v in new.items():
        nm.setName(v, i, 3, 1, 0x409)
        nm.setName(v, i, 1, 0, 0)
    if 'CFF ' in f:
        f['CFF '].cff.fontNames = [PIXEL_PS]


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    gal, nun = sys.argv[1], sys.argv[2]
    os.makedirs(OUT, exist_ok=True)
    f, opt = cut(gal)
    rename(f)
    p = os.path.join(OUT, 'meoxu-pixel.woff2')
    subset.save_font(f, p, opt)
    print(p, os.path.getsize(p), 'byte')
    f, opt = cut(nun)
    p = os.path.join(OUT, 'nunito.woff2')
    subset.save_font(f, p, opt)
    print(p, os.path.getsize(p), 'byte')


if __name__ == '__main__':
    main()
