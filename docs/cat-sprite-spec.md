# Đặc tả sprite mèo: khung hoạt ảnh Xoài và CatKit

Mọi mèo trong game dùng chung **khung hoạt ảnh của Xoài** (giống `venxam`). Xoài là bộ sprite vẽ sẵn; các mèo khác được
**dựng lúc chạy** từ chính các khung đó: giữ nguyên dáng, số khung, nhịp chân, rồi đổi màu lông, hoa văn, hình tai/đuôi/lông
và vẽ thêm trang phục. Vì mọi mèo đi qua cùng một bộ khung nên nhịp chân và tốc độ luôn khớp Xoài.

## 1. File

| File | Vai trò | Ai được sửa |
|---|---|---|
| `js/sprites.js` | Dữ liệu khung của Xoài (`SHEETS.xoai`) | KHÔNG ai sửa (sinh bởi `tools/xoai_rig.py`) |
| `tools/xoai_rig.py` | Bộ khớp dựng khung đi, chạy, nhảy của Xoài | KHÔNG ai sửa |
| `js/catkit.js` | `CatKit`: gắn nhãn khung, bộ khớp bản JS, tô màu, vải vẽ phụ kiện, đăng ký module | KHÔNG sửa (lõi dùng chung) |
| `js/art.js` | Bộ vẽ cũ (vẫn dùng cho gacha, nội thất, icon). `Art.cat(s,pose)` gọi `CatKit.render` trước | KHÔNG sửa |
| `js/data.js`, `js/ui.js`, `js/game.js`, `js/net.js`, `index.html`, `server.py` | Dữ liệu và game | KHÔNG sửa |
| `js/cats/core.js` | Module mẫu của lõi: trait `closed`, costume `v_huh`, `v_grumpy` | KHÔNG sửa |
| `js/cats/<tên>.js` | **Module mèo**: mỗi phiên làm việc chỉ tạo/sửa file được giao | Theo file task |
| `tools/catprev.js` | Xuất ảnh xem trước và soát lỗi | KHÔNG sửa |

Thứ tự nạp: `data.js`, `sprites.js`, `art.js`, `catkit.js`, `js/cats/*.js`, `game.js`, `ui.js`, `net.js`. Tất cả là script cổ điển
chung phạm vi toàn cục, không build. `tools/catprev.js` tự nạp mọi file trong `js/cats/`.

## 2. Cấu trúc dữ liệu của Xoài

```js
SHEETS.xoai = {
  base: 73,                         // hàng viền dưới cùng (đường đáy) trong sheet
  stride: {walk:10, run:19},        // số ô lưới gốc mèo đi được trong một vòng hoạt ảnh
  n: {walk:8, run:8, groom:6, sleep:4},
  pal: {'.':null, A:'#30303F', B:'#566477', ... M:'#D3EAA3'},   // 13 màu
  a: { sit:{w:72,f:[4 chuỗi]}, sleep:{w:72,f:[4]}, groom:{w:72,f:[6]},
       stand:{w:100,f:[4]}, walk:{w:100,f:[8]}, run:{w:100,f:[8]}, jump:{w:100,f:[8]} }
}
```

Mỗi khung là một chuỗi `w*80` ký tự, mỗi ký tự là một ô lưới mịn: `.` = trong suốt, `A`..`M` = chỉ số màu.

**Vai màu (role)** của bảng màu, dùng cho mọi mèo:

| Ký tự | role | Ý nghĩa |
|---|---|---|
| A | 1 | viền và nét (mí mắt, miệng) |
| B | 2 | lông tối nhất: vằn đậm, bóng sâu |
| C | 3 | lông tối: vằn, bóng mép |
| D | 4 | màu lông chính |
| E | 5 | lông sáng |
| F | 6 | vùng trắng (mõm, ngực, chóp đuôi, ngón chân) |
| G | 7 | điểm sáng nhất |
| H, I, J | 8, 9, 10 | hồng: trong tai, mũi, má, lưỡi |
| K, L, M | 11, 12, 13 | mắt: con ngươi, mống mắt, ánh sáng |

## 3. Lưới, hệ toạ độ, đường đáy

- Nhìn thẳng (ngồi, ngủ, liếm lông): lưới gốc 36×40, lưới mịn **72×80**.
- Nhìn ngang (đứng, đi, chạy, nhảy): lưới gốc 50×40, lưới mịn **100×80**. Trong kit mèo luôn **quay mặt sang PHẢI**; game tự lật khi mèo quay trái.
- **Toạ độ kit** (mọi module dùng hệ này) = toạ độ sheet + (0, 4) với khung nhìn thẳng, + (8, 4) với khung nhìn ngang.
- Đường đáy trong toạ độ kit: hàng lông cuối cùng chạm đất là **75** (`CatKit.GROUND`), viền dưới cùng là hàng **77** (`CatKit.BASE`).
  Không ô nào được nằm dưới hàng 77. Phía trên đầu Xoài còn trống khoảng 12 hàng (đầu bắt đầu từ hàng 12-13) để vẽ mũ, tóc.
- Mỗi ô một màu đặc, không khử răng cưa, nền trong suốt. Viền dày 2 ô ở mép ngoài. Riêng hào quang (`G.aura`) được bán trong suốt như game cũ.
- Chân phía xa (bên trái của mèo khi quay phải) tô tối hơn một bậc: chân gần dùng D/C/E, chân xa dùng C/B/D.

Vị trí chuẩn (toạ độ kit) ở khung ngồi 0: tâm đầu (40,38), đỉnh sọ giữa hai tai (40,21), chóp tai (28,13) và (51,13), mắt (31,38) và (51,37),
mũi (41,42), cằm (40,55), ngực (38,63), bàn chân trước hàng 75, đuôi quanh (16,64).
Ở khung đứng: tâm đầu (76,35), đỉnh sọ (74,20), tai gần (81,12), tai xa (65,15), mắt (84,33), mũi (93,35), cằm (81,51), gáy (58,45), cổ họng (68,52),
ngực (73,57), giữa lưng (52,44), hông (33,46), bụng (52,65), gốc đuôi (35,50), chóp đuôi (26,25), bốn bàn chân hàng 75 tại x = 36, 42, 62, 69.
Đừng chép cứng các số này: luôn đọc mỏ neo `F.A` / `G.A` của từng khung (mục 7).

## 4. Dáng, số khung, thời lượng

Thời lượng tính cho mèo trưởng thành ở tốc độ gốc. Đi và chạy đổi khung **theo quãng đường**, không theo thời gian, nên chân không trượt ở mọi tốc độ.

| Dáng | Khung trong sheet | Game dùng | Thời lượng mỗi khung | Một vòng |
|---|---|---|---|---|
| sit (ngồi) | 4 | khung 0 đứng yên; khung 2 chớp mắt ~140 ms; khung 3 vẫy đuôi ~450 ms (ngẫu nhiên theo từng bé); khung 1 không dùng | - | - |
| sleep (ngủ) | 4 | cả 4 | 625 ms | 2.500 ms |
| groom (liếm lông) | 6 | cả 6 | 133 ms | 800 ms |
| stand (đứng) | 4 | chỉ khung 0 (tư thế chuyển tiếp) | - | - |
| walk (đi) | 8 | cả 8, một vòng = 10 ô lưới gốc | 96 ms (13 ô/giây) | 769 ms |
| run (chạy) | 8 | cả 8, một vòng = 19 ô lưới gốc | 41 ms (58 ô/giây) | 328 ms |
| jump (nhảy) | 8 | 0-1 lấy đà (luân phiên 90 ms, tổng 360 ms); 2-5 trên không (350-900 ms tuỳ độ cao); 6-7 tiếp đất (130 ms mỗi khung) | | |

Giống chân ngắn (`short`): cùng số khung; một vòng đi = 6 ô (75 ms mỗi khung ở 10 ô/giây), chạy = 13 ô (34 ms mỗi khung ở 48 ô/giây).

Tên tư thế game gọi: `sit`, `sitb`, `sitt`, `sleepN`, `groomN`, `stand`, `walkN`, `runN`, `crouchN`, `leapN`, `land0`, `land1`,
và dạng gọi thẳng số khung `sit2s`, `walk5s`, `run3s`, `jump6s`... `CatKit.poseFrame(pose)` đổi sang `[hoạt ảnh, số khung]`.

## 5. Nhịp chân (không được thay đổi)

Tên chân: `NH` sau gần (phải), `FH` sau xa (trái), `NF` trước gần (phải), `FF` trước xa (trái).

**Đi, 4 nhịp so le.** Thứ tự chạm đất: sau trái (FH) → trước trái (FF) → sau phải (NH) → trước phải (NF), lệch pha 0, 2, 4, 6 khung.
Mỗi chân chạm đất 5 khung (lùi 2,5 ô mịn mỗi khung) rồi nhấc 3 khung.

| Khung | Chân chạm đất |
|---|---|
| 0 | FH, NH, NF |
| 1 | FH, NF |
| 2 | FH, FF, NF |
| 3 | FH, FF |
| 4 | FH, FF, NH |
| 5 | FF, NH |
| 6 | FF, NH, NF |
| 7 | NH, NF |

**Chạy, phi nước đại xoay vòng** (mỗi khung tiến 4,75 ô mịn): 0 hai chân sau chạm đất lệch nhau; 1 chỉ NH; 2 bay duỗi; 3 chỉ FF; 4 và 5 chỉ NF; 6 bay co; 7 cả bốn chân trên không.

**Nhảy:** 0-1 lấy đà (thân hạ, bốn chân chạm đất); 2 bật lên (chân sau còn chạm); 3-4 trên không; 5 chuẩn bị đáp; 6 tiếp đất (chân trước chạm trước); 7 đứng lại.

Module **không được** dời, kéo dài hay xoá các ô bàn chân ở hai hàng 74-75 của khung nhìn ngang: `tools/catprev.js` so từng ô với khung Xoài và báo lỗi "bàn chân lệch".

## 6. Cách đăng ký một mèo vào game

Game gọi `Art.cat(look(key), pose)`. `look(key)` trả về "ngoại hình" `s` gồm:
`id`, `bid` (id giống gốc), `ct` (id màu lông/trang phục đang mang), `c`, `c2`, `c3` (màu), `pat` (hoa văn), `w` (mức trắng 0-2), `mit` (găng trắng),
`eye`, `eye2`, `ear`, `tail`, `fur`, `flat`, `short`, `hl`, `closed`, `gem`, `lash`, `cos` (trang phục), `rare`, `aura`.

`CatKit.render(s,pose)` dựng mèo nếu **mọi module cần thiết đã đăng ký**; còn thiếu thì trả `null` và game vẽ kiểu cũ.
`CatKit.missing(s)` liệt kê module còn thiếu. Một ngoại hình cần:

| Điều kiện | Module cần có |
|---|---|
| `s.pat` khác `solid`, `tabby`, `tiger` (3 hoa văn dựng sẵn) | `CatKit.pattern(s.pat, fn)` |
| `s.ear` | `CatKit.trait('ear', def)` |
| `s.tail` | `CatKit.trait('tail', def)` |
| `s.fur` | `CatKit.trait('fur', def)` |
| `s.flat` | `CatKit.trait('flat', def)` |
| `s.hl` hoặc `pat==='hairless'` | `CatKit.trait('hairless', def)` |
| `s.gem` | `CatKit.trait('gem', def)` |
| `s.closed` | `CatKit.trait('closed', def)` (lõi đã có) |
| `s.cos` không rỗng | `CatKit.costume(s.bid||s.id, def)` |

Lõi tự lo: màu mắt (`eye`, `eye2`), vùng trắng (`w`, `mit`), chân ngắn (`short`: bộ khớp hạ thân 5 ô, sải chân ngắn), lấp lánh màu hiếm (`rare`).
"Đăng ký đúng như Xoài" nghĩa là: thêm file module vào `js/cats/`, thêm thẻ `<script>` trong `index.html` (việc của người điều phối), và `CatKit.missing` trả rỗng cho mọi ngoại hình của mèo đó.

## 7. API của CatKit

### Khung `F`
`F = {anim, i, n, W, H:80, view:'front'|'side', shape:'std'|'short', role, part, feat, u, v, A}`; mỗi mảng dài `W*80`, chỉ số `y*W+x`.

- `role[i]`: 0 = trống, 1..13 = A..M (`CatKit.R.A` ... `CatKit.R.M`).
- `part[i]` (`CatKit.P`): `HEAD` 1, `EAR` 2, `BODY` 3, `TAIL` 4, `LEG` 5 (chân trước ở khung nhìn thẳng), `NH` 6, `FH` 7, `NF` 8, `FF` 9. Ô viền mang bộ phận của ô lông gần nhất. `CatKit.isLeg(p)` đúng với 5..9.
- `feat[i]` (`CatKit.FT`): `EYEL` 1, `EYER` 2, `NOSE` 3 (mũi, miệng, lưỡi), `CHEEK` 4 (má hồng), `EARIN` 5 (trong tai), `MUZ` 6 (mõm sáng), `CHEST` 7 (ngực, bụng sáng), `PAW` 8 (bàn chân), `TIP` 9 (chóp đuôi sáng). Khung nhìn ngang chỉ có một mắt, mang `EYEL`.
- `u[i], v[i]`: **toạ độ nghỉ**. Khung nhìn ngang: vị trí tương ứng của ô đó trên khung đứng. Khung nhìn thẳng: vị trí tương ứng trên khung ngồi 0 (đầu, thân, đuôi dịch theo từng bộ phận). Hoa văn phải tính theo `u, v` (không theo `x, y`) thì mới bám vào thân khi mèo cử động.
- `A`: mỏ neo `[x, y]` của khung đó. Nhìn thẳng: `head, crown, earL, earR, eyeL, eyeR, nose, chin, neck, chest, body, pawL, pawR, tail, tailTip`. Nhìn ngang: `head, crown, earN, earF, eye, nose, chin, cheek, neck` (gáy)`, throat, chest, back, hip, belly, tailBase, tailTip, footNH, footFH, footNF, footFF`.

Giới hạn đã biết của nhãn: ở khung liếm lông 1-3, bàn chân đang giơ lên mang nhãn `HEAD`; ở khung ngủ, thân là khối lông phía sau đầu, đuôi là dải dưới bên trái.

### Hoa văn: `CatKit.pattern(tên, fn)`
`fn(ctx)` được gọi cho từng **ô lông** (role B..G) và trả màu nền `[r,g,b]` (hoặc `undefined` để dùng màu chính). Sau đó lõi áp luật vùng trắng rồi làm đậm/nhạt theo `ctx.lv`.

`ctx = {s, F, x, y, i, u, v, role, part, feat, view, side, kind, lv, mark, zone, c, c2, c3, white, oc, A0, P, FT, R}`
- `c, c2, c3`: màu của ngoại hình đã đổi sang `[r,g,b]`. `white`: màu trắng chuẩn. `A0`: mỏ neo của khung nghỉ (đứng hoặc ngồi 0), dùng cùng `u, v`.
- `lv`: bậc đậm nhạt theo role (B −2, C −1, D 0, E +1, F +2, G +3). Gán lại để đổi, ví dụ `ctx.lv=0` cho ô tô phẳng.
- `mark`: 1 nếu ô thuộc **vằn gốc của Xoài** (trên trán, lưng, đuôi). Hoa văn không có vằn nên tô phẳng: `if(ctx.mark)ctx.lv=0`.
- `zone`: mặc định `true`: sau khi lấy màu nền, lõi tô trắng mõm/ngực khi `w>=1`, bàn chân khi `w>=2` hoặc `mit`, vệt trắng trên mặt khi `w>=2`; khi không trắng thì mõm/ngực nhạt hơn nền một chút. Gán `ctx.zone=false` nếu hoa văn tự quyết vùng đó (ví dụ mặt nạ Xiêm phủ cả mõm).

Ba hoa văn dựng sẵn: `solid` (tô phẳng vằn gốc), `tabby` và `tiger` (vằn gốc của Xoài: B = `c2`, C = pha `c` với `c2`).

### Đặc điểm hình dáng: `CatKit.trait(tên, def)`
`def = { front(F,s,FX), side(F,s,FX), paint(ctx,s), draw(G,s) }`, phần nào không cần thì bỏ.
- `front` / `side`: sửa khung **trước khi tô màu** (đổi tai, đuôi, viền lông...). Dùng `FX`:
  `FX.put(F,x,y,role,part,feat,u,v)`, `FX.erase(F,(i,x,y)=>bool)`, `FX.each(F,(i,x,y)=>...)`, `FX.seal(F,test?)` (thêm viền 2 ô quanh ô lông giáp ô trống), `FX.prune(F)` (xoá viền mồ côi), `FX.idx(F,x,y)`.
  Ô mới thêm nên đặt `u, v` hợp lý (mặc định bằng `x, y`) để hoa văn phủ lên được.
- `paint(ctx,s)`: như hoa văn nhưng chạy trước, cho mọi loại ô (`ctx.kind` = `'fur' | 'line' | 'eye' | 'pink'`). Trả màu để ghi đè, `undefined` để bỏ qua. Với ô lông, màu trả về còn được làm đậm/nhạt theo `ctx.lv`.
- `draw(G,s)`: vẽ thêm sau khi tô màu (xem vải vẽ `G`).

### Trang phục: `CatKit.costume(id, def)`
`id = s.bid || s.id` (ví dụ `v_gojo`, `khaomanee`). `def = { shape(F,s,FX), paint(ctx,s), draw(G,s) }`.
Một mèo có nhiều dạng (trang phục thường / hiếm) dùng chung một module: phân biệt bằng `s.ct` (ví dụ `gkGod`) hoặc nội dung `s.cos`.
- `shape`: xoá tai, đổi hình trước khi tô.
- `paint`: cách đúng để **mặc áo**: trả màu áo cho các ô thân/chân, lõi giữ nguyên bóng đổ và viền của Xoài nên áo ôm theo thân ở mọi khung.
- `draw`: phụ kiện rời.

### Vải vẽ `G` (trong `draw`)
- `G.F`, `G.A`, `G.s`, `G.W`, `G.H`, `G.side`, `G.view`, `G.oc` (màu viền của mèo).
- `G.get(x,y)`, `G.set(x,y,màu)`.
- `G.recolor(q=>màu)`: duyệt các ô mèo đã tô, `q = {x,y,i,part,feat,role,col,u,v}`.
- `const L=G.layer()` rồi `L.set(x,y,c)`, `L.rect(x,y,w,h,c)`, `L.ell(cx,cy,rx,ry,c)`, `L.line(x0,y0,x1,y1,c,độ_dày)`, `L.poly([[x,y],...],c)`; `c` có thể là hàm `(x,y)=>màu`.
  Kết thúc bằng `L.stamp({behind, outline, edge, clip})`: `behind:true` chỉ vẽ vào ô trống (áo choàng, cánh nằm sau mèo); `outline` là màu viền (mặc định viền của mèo, `false` = không viền); viền dày 2 ô về phía ô trống, 1 ô chỗ đè lên mèo (`edge:false` để bỏ); `clip(x,y)` giới hạn vùng dán.
- `G.lag(k)`: mỏ neo của khung trước đó `k` bước trong cùng hoạt ảnh. **Phụ kiện treo, bay (khăn, áo choàng, tóc dài, kiếm, đuôi mũ) phải dùng `G.lag(1)` hoặc `G.lag(2)`** để trễ nhịp theo thân; phụ kiện gắn chặt (mũ, kính, mặt nạ) dùng `G.A`.
- `G.aura(màu)`: hào quang quanh mèo (như game cũ). Bộ phận `['aura', màu]` trong `s.cos` được **lõi tự vẽ**, module không cần gọi lại. `G.spark(x,y,màu)`: một đốm lấp lánh.

Tiện ích: `CatKit.shade(màu, lv)`, `CatKit.bbox(F, i=>bool)`, `CatKit.outlineOf(màu)`, `CatKit.WHITE`, và `CatKit.U` (từ `art.js`): `hex, mix, dk, lt, lum, hsh, vnoise, blob, fleck, marble, bandC, spotAt, nacreC`.

### Ví dụ
Xem `js/cats/core.js` (trait `closed`, costume `v_huh` dùng `G.lag`, costume `v_grumpy`). Mẫu hoa văn:

```js
"use strict";
(()=>{const K=CatKit,{P,FT}=K,{blob}=K.U;
K.pattern('cow',ctx=>{
  if(ctx.mark)ctx.lv=0;                                   // bỏ vằn gốc của Xoài
  const {u,v,part,A0}=ctx;
  if(part===P.TAIL)return ctx.c2;                         // đuôi đen
  if(part===P.EAR)return (ctx.side||u>A0.head[0])?ctx.c2:ctx.c;
  if(part===P.HEAD&&blob(u/2,v/2,(A0.head[0]+12)/2,(A0.head[1]-10)/2,7,6))return ctx.c2;  // tính theo toạ độ nghỉ nên mảng màu bám theo đầu
  return ctx.c;
});})();
```

Mẫu trang phục có áo, mũ, khăn bay:

```js
K.costume('v_example',{
  paint(ctx,s){ if(ctx.kind==='fur'&&(ctx.part===P.BODY||K.isLeg(ctx.part))&&ctx.feat!==FT.PAW){ctx.zone=false;if(ctx.mark)ctx.lv=0;return [224,72,60]} },   // áo đỏ: giữ bóng của Xoài, bỏ vằn gốc
  draw(G,s){
    const A=G.A, hat=G.layer(); hat.ell(A.crown[0],A.crown[1]-2,9,4,[242,208,74]).stamp();          // mũ gắn chặt vào đầu
    const B=G.lag(2), sc=G.layer(), n=G.side?A.neck:A.chin;                                          // khăn bay trễ 2 khung
    sc.line(n[0],n[1],(G.side?B.neck[0]-12:B.chin[0]-14),(G.side?B.neck[1]+4:B.chin[1]+6),[184,50,58],3).stamp({behind:true});
  }
});
```

## 8. Xem trước và soát lỗi

```bash
node tools/catprev.js siamese v_gojo v_goku~gkGod british~r_nacre
```

Ghi vào `preview/<khoá>/`: `sheet.png` (mỗi dáng hai hàng: Xoài ở trên, mèo đang làm ở dưới), `sit.gif`, `sleep.gif`, `groom.gif`, `walk.gif`, `run.gif`, `jump.gif` đúng tốc độ trong game, `stand.png`, `check.json`.
Công cụ báo `ĐẠT` khi: đúng lưới, không ô nào dưới đường đáy, bàn chân trùng khung Xoài. Module của nhóm khác còn thiếu thì ghi "chờ module" và vẽ tạm bằng mặc định; thêm `--strict` để coi đó là lỗi (dùng sau khi gộp).
Kèm `old.png`: chính con mèo đó vẽ theo kiểu cũ, để đối chiếu các đặc điểm riêng phải giữ.
GIF của Xoài để so: `node tools/catprev.js venxam`.
Thư mục `preview/` không đưa vào git (trừ `preview/index.html`); ảnh nằm lại trên đĩa của worktree để người điều phối xem.

Kiểm tra cú pháp: `node --check js/cats/<file>.js`. Không có bước build.

## 9. Hoạt ảnh gacha

Hoạt ảnh gacha (các cảnh intro, ảnh lúc mở trứng) **không đi qua CatKit**: `ui.js` gọi `catCv(..., old=1)` → `Art.cat(s,pose,true)` để vẽ đúng như trước. Không module nào được đụng tới phần này.
