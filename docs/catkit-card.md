# Thẻ tra nhanh CatKit (đủ để viết một module mèo)

Thẻ này thay cho việc đọc `js/catkit.js`, `js/art.js`, `js/sprites.js`, `tools/xoai_rig.py` và `docs/cat-sprite-spec.md`.
Chỉ mở các file đó khi thẻ này và `node tools/catctx.js <khoá>` không trả lời được, và khi mở thì dùng `rg -n` rồi `sed -n 'a,bp'` đúng đoạn cần.

## Khung và toạ độ

- Nhìn thẳng (ngồi 4 khung, ngủ 4, liếm lông 6): lưới 72×80. Nhìn ngang (đứng 1, đi 8, chạy 8, nhảy 8): lưới 100×80, mèo quay mặt sang PHẢI (game tự lật).
- Hàng lông chạm đất 75, viền đáy 77. Không vẽ dưới hàng 77, không vẽ ra ngoài lưới. Trên đầu trống khoảng 12 hàng cho mũ, tóc.
- Không dời hay xoá ô bàn chân ở hàng 74–75 của khung nhìn ngang (sẽ trượt chân). Mỗi ô một màu đặc, không bán trong suốt, không `Math.random` (dùng `CatKit.U.hsh`, `vnoise`).
- Luôn lấy vị trí từ mỏ neo của từng khung (`F.A` / `G.A`), không chép cứng số. Tên mỏ neo:
  nhìn thẳng `head crown earL earR eyeL eyeR nose chin neck chest body pawL pawR tail tailTip`;
  nhìn ngang `head crown earN earF eye nose chin cheek neck throat chest back hip belly tailBase tailTip footNH footFH footNF footFF`.
- Mỗi ô có `role` (0 trống, 1 viền, 2..7 = lông B..G từ tối tới sáng), `part` (`CatKit.P`: HEAD 1, EAR 2, BODY 3, TAIL 4, LEG 5, NH 6, FH 7, NF 8, FF 9; `CatKit.isLeg(p)`),
  `feat` (`CatKit.FT`: EYEL 1, EYER 2, NOSE 3, CHEEK 4, EARIN 5, MUZ 6, CHEST 7, PAW 8, TIP 9, MOUTH 10, RIM 11), và toạ độ nghỉ `u, v` (vị trí của ô đó trên khung ngồi 0 hoặc khung đứng: hoa văn tính theo `u, v` thì bám vào thân).
- Giới hạn: ở khung liếm lông 1–3 bàn chân giơ lên mang nhãn HEAD.

## Ba loại module (file `js/cats/<tên>.js`, mở đầu `"use strict";`, bọc `(()=>{ ... })();`)

```js
CatKit.pattern('tên', ctx => màu | undefined);                 // gọi cho từng ô lông
CatKit.trait('tên', { front(F,s,FX), side(F,s,FX), paint(ctx,s), draw(G,s) });
CatKit.costume('v_id', { shape(F,s,FX), paint(ctx,s), draw(G,s) });   // id = s.bid || s.id; dạng hiếm phân biệt bằng s.ct
```

- `ctx = {s, F, x, y, i, u, v, role, part, feat, view, side, kind, lv, mark, zone, c, c2, c3, white, oc, A0}`.
  `kind`: `'fur' | 'line' | 'eye' | 'pink'`. `lv`: bậc sáng tối của ô (gán `ctx.lv=0` để tô phẳng). `mark`: ô thuộc vằn gốc của Xoài. `zone=false`: tự quyết mõm, ngực, bàn chân. `A0`: mỏ neo khung nghỉ, dùng cùng `u, v`.
- `paint` là cách mặc áo: trả màu áo cho ô thân, chân; lõi giữ bóng và viền nên áo ôm theo thân ở mọi khung. Mặt nạ kín: tô đè cả ô `'line'`, `'eye'`, `'pink'` rồi vẽ mắt mới trong `draw`.
- `shape` / `front` / `side` sửa khung trước khi tô: `FX.put(F,x,y,role,part,feat,u,v)`, `FX.erase(F,(i,x,y)=>bool)`, `FX.each(F,(i,x,y)=>…)`, `FX.seal(F)` (thêm viền), `FX.prune(F)`, `FX.idx(F,x,y)`.
- `draw(G,s)` vẽ phụ kiện rời: `G.A`, `G.F`, `G.side`, `G.W`, `G.oc`, `G.get(x,y)`, `G.set(x,y,c)`, `G.recolor(q=>màu)` với `q={x,y,i,part,feat,role,col,u,v}`.
  `const L=G.layer(); L.set / L.rect(x,y,w,h,c) / L.ell(cx,cy,rx,ry,c) / L.line(x0,y0,x1,y1,c,dày) / L.poly([[x,y],…],c); L.stamp({behind, outline, edge, clip})`.
  `behind:true` chỉ vẽ vào ô trống (áo choàng, cánh nằm sau mèo). `outline:false` bỏ viền.
- Phụ kiện treo hoặc bay (áo choàng, khăn, tóc dài, kiếm) lấy mỏ neo trễ `G.lag(1)` hoặc `G.lag(2)`; phụ kiện gắn chặt (mũ, kính, mặt nạ) dùng `G.A`.
- Lõi tự vẽ hào quang `['aura', màu]` có trong `s.cos`. `G.spark(x,y,màu)` là một đốm lấp lánh.
- Tiện ích: `CatKit.shade(màu,lv)`, `CatKit.outlineOf(màu)`, `CatKit.WHITE`, `CatKit.bbox(F,i=>bool)`, `CatKit.U.{hex,mix,dk,lt,lum,hsh,vnoise,blob,fleck,marble,bandC,spotAt}`.

## Mẫu ngắn

```js
"use strict";
(()=>{const {hex}=CatKit.U,P=CatKit.P,RED=hex('#d0342c'),BLUE=hex('#3d6fd0');
CatKit.costume('v_hero',{
  paint(ctx){if(ctx.kind==='fur'&&(ctx.part===P.BODY||CatKit.isLeg(ctx.part))){if(ctx.mark)ctx.lv=0;return BLUE}},   // áo ôm thân, giữ bóng của Xoài, xoá vằn
  draw(G){const A=G.lag(1),L=G.layer(),n=A.neck,t=G.side?A.tailBase:A.body;                  // áo choàng trễ một khung
    L.poly(G.side?[[n[0],n[1]-2],[t[0]-6,t[1]-6],[t[0]-10,t[1]+8]]:[[n[0]-12,n[1]],[n[0]+12,n[1]],[n[0]+17,74],[n[0]-17,74]],RED);
    L.stamp({behind:true})}});
})();
```

Module mẫu đầy đủ, ngắn: `js/cats/core.js` (đọc file này nếu cần thêm ví dụ, không đọc module của nhóm khác).

## Vòng làm việc ít token

1. `node tools/catctx.js <khoá…>`: màu, cờ, từng bộ phận trang phục cũ kèm đúng đoạn mã vẽ nó, mỏ neo. Không cần mở `art.js` hay `data.js`.
2. Viết module. `node --check <file> && node tools/catprev.js <khoá…> --quiet; echo $?` (0 là đạt; chỉ chạy không `--quiet` khi cần xem lỗi).
3. Soát bằng mắt: mở `preview/<khoá>/peek.png` (1400×320: hàng trên mèo mới, hàng dưới bản cũ, 7 dáng). Chỉ mở `sheet.png` khi nghi một khung cụ thể bị lỗi.
4. Không in lưới điểm ảnh ra màn hình, không `cat` file ảnh hay JSON lớn. Cần một con số thì viết lệnh in đúng con số đó.
