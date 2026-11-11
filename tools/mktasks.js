#!/usr/bin/env node
/* Sinh docs/tasks/README.md (danh mục mèo + phân nhóm) và docs/tasks/agent-XX.md (prompt tự đủ ý cho từng phiên Codex).
   Chạy lại khi đổi phân nhóm:  node tools/mktasks.js */
const fs=require('fs'),path=require('path'),ROOT=path.dirname(__dirname);
(0,eval)(fs.readFileSync(path.join(ROOT,'js/data.js'),'utf8')+';globalThis.D={BREEDS,VARIANTS,COATS,RARES,look}');
const {BREEDS,VARIANTS,COATS,RARES}=globalThis.D,SP=Object.fromEntries(BREEDS.concat(VARIANTS).map(s=>[s.id,s]));
const traits=s=>['ear','tail','fur','flat','short','hl','closed','gem','odd'].filter(k=>s[k]).map(k=>k+(typeof s[k]==='string'?'='+s[k]:'')).join(', ')||'-';
const cosOf=c=>Array.isArray(c)?c.map(p=>p[0]+(p[0]==='flag'||p[0]==='old'?':'+p[1]:'')).join(', '):(c||'-');
const diff=s=>s.g?(s.r===5?'nhân vật đặc biệt 5★':'có phụ kiện 4★'):(s.r===5?'giống 5★ có trang phục hiếm':(s.ear||s.tail||s.fur||s.flat||s.short||s.hl)?'thường, có đặc điểm hình dáng':'thường');
const catLine=id=>{const s=SP[id];let o='- `'+id+'` **'+s.n+'** ('+s.r+'★): lông `'+s.c+'`'+(s.c2&&s.c2!==s.c?' / `'+s.c2+'`':'')+(s.c3?' / `'+s.c3+'`':'')+', hoa văn `'+s.pat+'`'+(s.w?', trắng w='+s.w:'')+(s.mit?', găng trắng':'')+', mắt `'+(s.eye||'mặc định')+'`'+(s.eye2?' và `'+s.eye2+'`':'')+'; đặc điểm: '+traits(s);
  if(s.g)o+='; trang phục: '+cosOf(s.cos);
  if(s.coats)o+='; '+(s.g?'dạng':'màu lông')+': '+s.coats.map(c=>'`'+c+'`'+(COATS[c].pat&&COATS[c].pat!==s.pat?' ('+COATS[c].pat+')':'')+(COATS[c].cos?' [trang phục: '+cosOf(COATS[c].cos)+']':'')).join(', ');
  return o};

/* ---------------- phân nhóm ---------------- */
const G=[
 {t:'Hoa văn vằn hổ và lông ticked',files:['js/cats/pat_stripe.js'],kind:'pattern',
  mods:"`CatKit.pattern('tiger', fn)` (ghi đè bản dựng sẵn), `CatKit.pattern('ticked', fn)`",
  cats:['toyger','sokoke','abyssinian','singapura','chausie','somali'],
  keys:'toyger toyger~tigerBrown sokoke sokoke~tigerDark abyssinian abyssinian~sorrel abyssinian~blueTick abyssinian~fawnTick singapura singapura~sepiaDark chausie chausie~grizzle somali muop vang amshort european scotstraight',
  notes:`- \`tiger\`: vằn hổ đậm, dày và rõ hơn \`tabby\`: giữ vằn gốc của Xoài (ô \`ctx.mark\`) và thêm vằn dọc cong trên sườn, chân, đuôi, hai vạch má. Xem nhánh \`p==='tabby'||p==='tiger'\` trong \`colorer()\` và \`sideCol()\` của \`js/art.js\`. Toyger là "hổ con": nền cam, vằn đen, ngực trắng (w=1).
- \`ticked\` (Abyssinian, Somali, Singapura, Chausie): KHÔNG có vằn trên thân: tô phẳng vằn gốc, thêm lấm tấm agouti (dùng \`K.U.fleck\` theo \`u, v\`), đỉnh đầu và tai sẫm hơn, hai vạch má, chóp đuôi màu \`c2\`. Xem nhánh \`p==='ticked'\`.
- Hoa văn \`tabby\` do lõi dựng sẵn. Chỉ soát 5 giống vằn (muop, vang, amshort, european, scotstraight) và ghi nhận xét vào báo cáo; nếu thấy cần chỉnh \`tabby\` thì ghi đề xuất vào file shared-changes, không tự ghi đè.
- somali còn cần trait tai/đuôi/lông của nhóm khác: ở nhánh của bạn nó hiện dáng thường, chỉ cần hoa văn đúng.`},
 {t:'Hoa văn mảng: bò sữa, tam thể, đồi mồi, van',files:['js/cats/pat_patch.js'],kind:'pattern',
  mods:"`CatKit.pattern('cow', fn)`, `('calico', fn)`, `('tortie', fn)`, `('van', fn)`",
  cats:['bosua','tamthe','doimoi','amwire','jbobtail','aphrodite','van'],
  keys:'bosua bosua~grayCow bosua~redW tamthe tamthe~diluteCalico tamthe~calicoDark doimoi doimoi~diluteTortie doimoi~chocTortie amwire jbobtail aphrodite van van~vanBlack tuxedo~vanBlack british~r_mcalico british~r_stortie sphynx~hlPied',
  notes:`- Xem các nhánh \`p==='cow'\`, \`'calico'\`, \`'tortie'\`, \`'van'\` trong \`colorer()\` và \`sideCol()\` của \`js/art.js\` để giữ đúng bố cục: bò sữa = nền \`c\` với mảng \`c2\` (đuôi, một tai, mảng đầu, mảng thân); tam thể = nền trắng \`c\`, mảng cam \`c2\` và đen \`c3\` (hai tai hai màu, đuôi \`c3\`); đồi mồi = loang \`c\`/\`c2\` khắp thân (dùng \`K.U.marble\`); van = trắng, chỉ đỉnh đầu, tai và đuôi có màu \`c2\`.
- Mảng màu phải tính theo toạ độ nghỉ \`ctx.u, ctx.v\` và theo từng bộ phận (\`ctx.part\`) để không trôi khi mèo đi, chạy; mép mảng lượn tự nhiên (\`K.U.blob\`). Mảng ở khung nhìn thẳng và nhìn ngang không cần trùng nhau tuyệt đối nhưng phải cùng bố cục (ví dụ mảng đen bên mắt phải).
- Các hoa văn này còn được dùng cho màu hiếm trên MỌI giống (\`r_mcalico\`, \`r_stortie\`) và cho mèo trang phục (\`v_maneki\` tam thể, \`v_huh\`, \`v_chef\` bò sữa): không được phụ thuộc vào id giống.
- Tô phẳng vằn gốc của Xoài (\`if(ctx.mark)ctx.lv=0\`). Vùng mõm/ngực/bàn chân: để lõi lo (\`ctx.zone\`), trừ khi mảng màu cần phủ lên.`},
 {t:'Hoa văn điểm màu (Xiêm) và khói',files:['js/cats/pat_point.js'],kind:'pattern',
  mods:"`CatKit.pattern('point', fn)`, `('smoke', fn)`",
  cats:['siamese','thai','ragdoll','birman','snowshoe','tonkinese','colorpoint','burmilla'],
  keys:'siamese siamese~bluePt siamese~chocPt siamese~lilacPt thai ragdoll ragdoll~blueBi ragdoll~flamePt birman snowshoe tonkinese tonkinese~minkBlue colorpoint colorpoint~lynxPt burmilla burmilla~goldShade mun~smoke persian~chinchilla british~r_smoke v_grumpy',
  notes:`- \`point\`: thân màu \`c\` nhạt; mặt nạ quanh mắt-mũi-mõm, hai tai, bốn chân (từ khuỷu xuống) và đuôi màu \`c2\`; mép mặt nạ có một vòng chuyển màu (pha \`c\` với \`c2\`). Xem nhánh \`p==='point'\` trong \`colorer()\` / \`sideCol()\`. Mặt nạ phủ cả mõm nên phải gán \`ctx.zone=false\` cho các ô trong mặt nạ; ngực nhạt hơn thân.
- Biến thể: \`mit\` (Ragdoll sealMit, Birman): bàn chân trắng; \`w=2\` (bicolor: Snowshoe, blueBi): vệt trắng chữ V ngược trên mặt, ngực và bàn chân trắng. Hai luật trắng này lõi đã làm khi \`ctx.zone\` còn bật: hãy để lõi xử lý ở các ô đó (đừng tắt zone ở bàn chân và ở vệt trắng). Mink (Tonkinese): tương phản thấp, vẫn là \`point\`.
- \`smoke\`: lông gốc sáng \`c\`, ngọn lông sẫm \`c2\` phủ từ trên xuống: đỉnh đầu, tai, lưng, đuôi sẫm; má, bụng, chân sáng; ranh giới lượn nhẹ theo nhiễu (\`K.U.vnoise\`). Xem nhánh \`p==='smoke'\`.
- Cả hai hoa văn tô phẳng vằn gốc của Xoài. \`v_grumpy\` (lõi đã có trang phục) dùng \`point\`: soát luôn.`},
 {t:'Hoa văn đốm, Lykoi, xà cừ, ánh xanh',files:['js/cats/pat_spot.js'],kind:'pattern',
  mods:"`CatKit.pattern('spot', fn)`, `('lykoi', fn)`, `('nacre', fn)`, `('sheen', fn)`",
  cats:['bengal','ocicat','ausmist','mau','savannah','lykoi'],
  keys:'bengal bengal~spotSilver bengal~spotSnow ocicat ausmist ausmist~spotBlue mau savannah savannah~spotSilver lykoi lykoi~lyBlue pixiebob british~r_nacre russian~r_sheen muop~r_nacre mun~r_sheen',
  notes:`- \`spot\`: đốm tròn/bầu dục màu \`c2\` trên thân, đuôi và đỉnh đầu, xếp so le (xem \`spotAt\` và nhánh \`p==='spot'\`). Đốm tính theo \`u, v\` nên bám theo thân; cỡ đốm 3-5 ô mịn; chân có vài đốm nhỏ; đuôi có khoang. Bỏ vằn gốc trên thân (tô phẳng) nhưng có thể giữ chữ M trên trán.
- \`lykoi\` (mèo sói): lông loang thưa: nền \`c\` lấm tấm \`c2\`, vùng quanh mắt, mũi, mõm trụi lông màu \`c3\`. Xem nhánh \`p==='lykoi'\`. Mõm KHÔNG trắng (gán \`ctx.zone=false\` ở mặt).
- \`nacre\` (màu hiếm Ánh xà cừ, áp lên mọi giống): nền \`c\` trắng ngà loang hồng, xanh ngọc, xanh lam nhạt như vỏ ốc (xem \`nacreC\`, \`marble\`).
- \`sheen\` (màu hiếm Đen ánh xanh): nền \`c\` rất sẫm, các dải chéo màu \`c2\` như ánh sáng lướt trên lông, tai màu \`c2\` (xem nhánh \`p==='sheen'\`).
- lykoi và savannah có thêm trang phục hiếm (lyHood, svEgypt) do nhóm khác làm: bạn chỉ lo hoa văn.`},
 {t:'Hình dáng tai',files:['js/cats/trait_ear.js'],kind:'trait',
  mods:"`CatKit.trait('ear', {front, side})` xử lý `s.ear` = `small`, `big`, `tuft`, `curl`, `fold`",
  cats:['british','scottish','siamese','oriental','amcurl','pixiebob','highlander','cornish','devon'],
  keys:'british scottish scottish~white siamese oriental oriental~white amcurl pixiebob highlander cornish devon exotic mainecoon abyssinian toybob chausie kinkalow',
  notes:`- Tai của Xoài: hai tam giác (part \`EAR\`, lòng tai hồng feat \`EARIN\`), chóp ở \`A.earL/earR\` (nhìn thẳng) và \`A.earN/earF\` (nhìn ngang, tai xa nằm sau, thấp hơn). Đầu là \`HEAD\`, đỉnh sọ giữa hai tai ở \`A.crown\`.
- \`small\` (Anh lông ngắn, Ba Tư): tai thấp và nhỏ hơn rõ rệt, cách xa nhau. \`big\` (Xiêm, Oriental, Abyssinian, Sphynx): tai cao, rộng hơn (cao thêm khoảng 4-5 ô, không vượt mép trên khung). \`tuft\` (Maine Coon, Rừng Na Uy): tai thường thêm chùm lông nhọn 2-3 ô ở chóp. \`curl\` (American Curl): chóp tai cong ngược ra sau/ra ngoài. \`fold\` (Scottish Fold): tai cụp sát xuống trán thành hai nếp tròn nhỏ, đỉnh đầu gần như tròn.
- Xem cách vẽ cũ: biến \`ear\` trong \`cat()\` và \`side()\` của \`js/art.js\`.
- Cách làm: trong \`front(F,s,FX)\` / \`side(F,s,FX)\` xoá các ô tai cũ cần bỏ (\`FX.erase\`), vẽ tai mới bằng \`FX.put\` với role lông (D, mép C, sáng E), lòng tai hồng (role H, feat EARIN), part \`EAR\`, rồi \`FX.seal\` để có viền và \`FX.prune\` để dọn viền thừa. Chú ý vá đường viền đỉnh đầu ở chỗ tai cũ bị xoá. Đặt \`u, v\` của ô mới theo toạ độ nghỉ (cộng độ lệch giữa mỏ neo hiện tại và mỏ neo khung nghỉ) để hoa văn (điểm màu, tam thể...) tô đúng lên tai.
- Tai phải đúng ở MỌI khung: 14 khung nhìn thẳng (mỗi khung đầu lệch vài ô, luôn dựa vào \`F.A\`) và mọi khung nhìn ngang (đầu là khối cứng, dịch theo \`F.A.head\`). Tai không được nhấp nháy giữa các khung của cùng một hoạt ảnh.
- Trait \`fur\` (nhóm khác) chạy SAU trait tai; đừng phụ thuộc vào nó.`},
 {t:'Hình dáng đuôi',files:['js/cats/trait_tail.js'],kind:'trait',
  mods:"`CatKit.trait('tail', {front, side})` xử lý `s.tail` = `fluff`, `bob`, `none`",
  cats:['manx','cymric','jbobtail','kurilian','ambobtail','toybob','nebelung','angora'],
  keys:'manx manx~cow cymric jbobtail kurilian ambobtail toybob nebelung angora persian mainecoon pixiebob highlander ragdoll',
  notes:`- Đuôi của Xoài: part \`TAIL\`, chóp sáng feat \`TIP\`. Nhìn ngang: gốc đuôi \`A.tailBase\`, chóp \`A.tailTip\`; khi đứng và đi đuôi dựng lên, khi chạy và nhảy đuôi duỗi ra sau (vẽ bởi bộ khớp, nằm SAU thân nên xoá đuôi không làm hở thân, trừ khung đứng gốc). Nhìn thẳng: đuôi là khối bên trái thân (ngồi, liếm lông) hoặc dải dưới bên trái (ngủ).
- \`none\` (Manx, Cymric): không còn đuôi: xoá toàn bộ ô \`TAIL\` và viền của nó, vá lại viền mông/thân cho kín (\`FX.seal\`, \`FX.prune\`). \`bob\` (Bobtail, Pixiebob, Toybob): đuôi cộc như cục bông tròn đường kính 6-8 ô ngay tại gốc đuôi. \`fluff\` (Ba Tư, Maine Coon, Ragdoll...): đuôi xù to: dày gấp rưỡi tới gấp đôi, mép lởm chởm nhẹ.
- Xem cách vẽ cũ: biến \`tl\` trong \`cat()\` và \`side()\` của \`js/art.js\`.
- Giữ chuyển động đuôi của Xoài (đung đưa khi đi, duỗi khi chạy): hình đuôi mới phải bám theo vị trí đuôi của từng khung, không đứng yên một chỗ. Mép lởm chởm tính theo toạ độ nghỉ (\`u, v\`) hoặc theo vị trí dọc đuôi để không nhấp nháy giữa các khung.
- Ô đuôi mới phải mang part \`TAIL\` và \`u, v\` hợp lý để hoa văn (điểm màu: đuôi sẫm; tam thể...) tô đúng.
- Trait \`fur\` (nhóm khác) chạy SAU trait đuôi và có thể thêm viền lông; đừng phụ thuộc vào nó.`},
 {t:'Lông dài và mặt tịt',files:['js/cats/trait_fur.js'],kind:'trait',
  mods:"`CatKit.trait('fur', {front, side})` cho `s.fur`, `CatKit.trait('flat', {front, side})` cho `s.flat`",
  cats:['persian','mainecoon','exotic','himalayan','selkirk','laperm','ragamuffin','siberian','norwegian','britishlh','balinese'],
  keys:'persian persian~cream mainecoon exotic himalayan selkirk laperm ragamuffin siberian norwegian britishlh balinese birman neva somali aphrodite v_royal',
  notes:`- \`fur\` (lông dài): thân trông xù và to hơn: thêm bờm ngực (chùm lông nhọn dưới cằm/trước ngực), hai chùm lông má nhô ra hai bên đầu, mép thân/bụng/mông lởm chởm 1-2 ô, quần lông ở chân sau. KHÔNG đổi hai hàng bàn chân 74-75 và không đổi vị trí chân. Xem \`long\` trong \`cat()\` và \`s.fur\` trong \`side()\` của \`js/art.js\`.
- \`flat\` (mặt tịt: Ba Tư, Exotic, Himalayan, Minuet): mõm ngắn và dẹt: mũi nằm cao hơn, sát giữa hai mắt; má phính rộng hơn 1-2 ô; ở khung nhìn ngang mõm bớt nhô ra phía trước 2-3 ô (xoá phần nhô, vá viền).
- Chùm lông thêm vào phải mang part đúng (\`HEAD\` cho lông má, \`BODY\` cho bờm và thân) và \`u, v\` hợp lý để hoa văn phủ lên được. Mép lởm chởm tính theo toạ độ nghỉ để không nhấp nháy khi mèo cử động (khung nhìn ngang thân co giãn theo từng khung: dựa vào \`F.u, F.v\` của ô mép gần nhất).
- Thứ tự chạy trait: \`ear\`, \`tail\`, \`fur\`, \`flat\`. Hai trait của bạn chạy SAU tai và đuôi (do nhóm khác làm, ở nhánh của bạn chưa có): viết sao cho không phá tai/đuôi đã đổi hình, ví dụ không giả định đuôi còn tồn tại (Cymric: lông dài, không đuôi).
- Selkirk Rex và LaPerm là lông xoăn: vẫn dùng \`fur\`, không cần hiệu ứng riêng.`},
 {t:'Mèo không lông, mắt kim cương, soát giống chân ngắn',files:['js/cats/trait_skin.js'],kind:'trait',
  mods:"`CatKit.trait('hairless', {front, side, paint})` cho `s.hl`, `CatKit.trait('gem', {front, side, paint, draw})` cho `s.gem` (và `s.lash`)",
  cats:['sphynx','peterbald','donskoy','bambino','dwelf','khaomanee','munchkin','lambkin','kinkalow','skookum','genetta','minuet'],
  keys:'sphynx sphynx~hlGray sphynx~hlPied peterbald peterbald~hlBlack donskoy bambino dwelf khaomanee khaomanee~kmSapphire khaomanee~kmEmerald khaomanee~kmAmethyst khaomanee~kmRuby munchkin munchkin~calico lambkin kinkalow skookum genetta minuet v_dora v_bread',
  notes:`- \`hairless\` (Sphynx, Peterbald, Donskoy, Bambino, Dwelf): da trần màu \`s.c\`: không có vùng lông trắng/nhạt ở mõm, ngực, chóp đuôi (tô cùng màu da, chỉ sáng hơn rất nhẹ); 2-3 nếp nhăn ngang trên trán và 1-2 nếp ở cổ/vai bằng màu da sẫm hơn; đuôi mảnh hơn (bớt 1-2 ô mỗi bên) như đuôi chuột; bỏ vằn gốc của Xoài. Lòng tai, mũi hồng giữ nguyên. Xem \`s.pat==='hairless'||s.hl\` trong \`cat()\` của \`js/art.js\`. Màu \`hlPied\` là da loang (hoa văn \`cow\` của nhóm khác) trên mèo không lông.
- \`gem\` (Khao Manee "mắt kim cương", các dạng thần của Goku, Gojo Lục Nhãn): mắt to hơn 1 ô mỗi chiều, mống mắt nhiều mặt cắt như đá quý với 2 điểm sáng trắng, viền mắt sẫm rõ. \`s.lash\` (Gojo): thêm hàng mi trắng. Xem \`gemEye()\` và \`drawEye()\` trong \`js/art.js\`. Hai mắt hai màu: mắt trái màn hình dùng \`s.eye\`, mắt phải dùng \`s.eye2\` (khung nhìn ngang chỉ thấy một mắt: dùng \`s.eye\`). Ở khung nhắm mắt (ngồi 2, ngủ, liếm lông 2-4) không vẽ gì thêm.
- Khao Manee: trắng tuyền, hai mắt khác màu là đặc điểm bắt buộc phải nhìn rõ ở cỡ nhỏ; 5 màu mắt (kmIce, kmSapphire, kmEmerald, kmAmethyst, kmRuby). Trang phục hiếm \`kmChada\` do nhóm khác làm.
- Chân ngắn (\`short\`): lõi đã dựng (thân hạ 5 ô, sải chân ngắn). Nhiệm vụ: xuất xem trước 8 giống chân ngắn + \`v_dora\`, \`v_bread\`, xem GIF đi/chạy/nhảy, ghi nhận xét cụ thể vào báo cáo (chân có trượt không, dáng có ổn không). Nếu cần sửa lõi thì ghi vào file shared-changes.`},
 {t:'Naruto và Goku (5★, nhiều dạng)',files:['js/cats/v_naruto.js','js/cats/v_goku.js'],kind:'costume',cats:['v_naruto','v_goku'],
  keys:'v_naruto v_naruto~nrKurama v_naruto~nrHokage v_goku v_goku~gkGod v_goku~gkSSJ',
  notes:`- \`v_naruto\`: 3 dạng theo \`s.ct\`: \`nrBase\` (tóc vàng chĩa nhọn, băng trán làng Lá có đuôi băng bay, ba vạch ria mỗi bên má, bộ đồ cam-đen), \`nrKurama\` (Tiên nhân Cửu Vĩ: toàn thân vàng cam rực, áo choàng chakra, mặt có vạch đen, các quả cầu đen lơ lửng sau lưng), \`nrHokage\` (áo choàng trắng viền lửa đỏ, mũ Hokage có mạng che, tóc mái vàng). Bộ phận cũ: \`spk, nbandT, nband, hcap, marks, nsuit, kcape, kface, kcloak, korbs, hcape, hveil, hbangs, hhat, hcloak\`.
- \`v_goku\`: \`gkBase\` (tóc đen chĩa kiểu Goku, võ phục cam áo lót xanh, vòng hào quang trên đầu), \`gkGod\` (tóc và mắt đỏ), \`gkSSJ\` (tóc vàng dựng, mắt xanh ngọc; dạng biến hình tạm thời, khoá \`v_goku~gkSSJ\`). Bộ phận cũ: \`gears, ggi, halo\`. Trong phòng Goku đứng trên mây khi di chuyển (game tự vẽ mây, dùng dáng \`stand\`).
- Vòng hào quang, cầu đen, đuôi băng trán, vạt áo choàng: trễ 1-2 khung (\`G.lag\`). Luồng khí \`aura\` lõi tự vẽ. \`gem\` (mắt đá quý) do nhóm khác làm.`},
 {t:'Zenitsu và Gojo (5★)',files:['js/cats/v_thunder.js','js/cats/v_gojo.js'],kind:'costume',cats:['v_thunder','v_gojo'],
  keys:'v_thunder v_thunder~ztGod v_gojo v_gojo~gjSix \'v_gojo!open\'',
  notes:`- \`v_thunder\` (Zenitsu): luôn nhắm mắt (lõi lo), tóc vàng cam, áo haori vàng hoạ tiết tam giác trắng/cam (\`tripat\`), kiếm đeo bên hông (\`sword\`), tia điện nhỏ (\`sparks\`). Dạng hiếm \`ztGod\` (Hỏa Lôi Thần): tóc sáng hơn, hoạ tiết trắng-vàng, thêm tia sét (\`bolts\`).
- \`v_gojo\`: lông trắng ngà, tóc trắng dựng nhọn (\`spikes\`), BĂNG BỊT MẮT đen che cả hai mắt (\`blindfold\`), áo đen cổ cao. Khoá \`v_gojo!open\` là dáng kéo băng mắt: \`s.cos\` không còn \`blindfold\`, mắt xanh pha lê \`#38b6ff\` với \`s.gem\` và \`s.lash\`: phải lộ rõ đôi mắt xanh. Dạng hiếm \`gjSix\` (Lục Nhãn): không băng mắt, mắt xanh pha lê, áo tối hơn, cổ áo tím, quả cầu tím lơ lửng (\`orb\`).
- Kiếm, tia điện, quả cầu trễ 1-2 khung. Mắt đá quý (\`gem\`) do nhóm khác làm: ở nhánh của bạn mắt mở hiện kiểu thường, chỉ cần màu đúng.`},
 {t:'Harry Potter và Darth Vader (5★)',files:['js/cats/v_harry.js','js/cats/v_vader.js'],kind:'costume',cats:['v_harry','v_vader'],
  keys:'v_harry v_harry~hpSeeker v_vader v_vader~vdWhite',
  notes:`- \`v_harry\`: tóc đen rối, vết sẹo tia chớp trên trán, kính tròn, áo chùng đen, khăn quàng đỏ-vàng Gryffindor (đuôi khăn bay trễ nhịp), đũa phép. Dạng hiếm \`hpSeeker\`: áo choàng đỏ thẫm bay sau lưng, áo đỏ, khăn vàng-đỏ, trái Snitch vàng có cánh bay cạnh đầu (\`snitch\`).
- \`v_vader\`: toàn thân đen: mũ giáp Vader che kín đầu (không tai mèo, không mặt mèo: \`flag:noFace, noMuz\`), mặt nạ có lưới thở và hai hốc mắt, giáp ngực có bảng nút màu, áo choàng đen. Dạng hiếm \`vdWhite\`: đảo màu thành trắng (\`inv\`). Xem \`vhelm, vface, vsuit, vcape, vgrille\`.
- Áo choàng, khăn: trễ 1-2 khung, nằm sau thân (\`stamp({behind:true})\`).`},
 {t:'Nyan Cat và Mèo Thần Tài (5★)',files:['js/cats/v_nyan.js','js/cats/v_maneki.js'],kind:'costume',cats:['v_nyan','v_maneki'],
  keys:'v_nyan v_nyan~nyTac v_maneki v_maneki~mkGold',
  notes:`- \`v_nyan\`: lông xám, THÂN là chiếc bánh pop-tart hồng rắc cốm (hình chữ nhật bo góc ôm quanh thân), má hồng, vệt cầu vồng sáu màu kéo sau đuôi, vài ngôi sao. Dạng hiếm \`nyTac\` (Tac Nayn): lông đen xám, bánh waffle, cầu vồng tối/đảo màu, mắt đỏ. Xem \`npoptart, nrainbow, nstars, tart\` trong \`js/art.js\`. Cầu vồng gợn sóng theo số khung và trễ nhịp. Bánh phải co giãn theo thân (dùng \`paint\` trên các ô \`BODY\` theo \`u, v\` để viền bánh, cốm bám theo thân).
- \`v_maneki\`: tam thể (hoa văn \`calico\` do nhóm khác làm), luôn nhắm mắt cười (lõi lo), vòng cổ đỏ có chuông vàng, một chân trước giơ lên vẫy (ở các khung ngồi), đồng xu vàng ôm trước ngực. Dạng hiếm \`mkGold\`: toàn thân vàng ròng, bụng kem, lấp lánh.
- Giữ nguyên bàn chân ở khung nhìn ngang: chân vẫy chỉ thể hiện ở khung nhìn thẳng.`},
 {t:'Phi Hành Gia và Hoàng Gia (5★)',files:['js/cats/v_astro.js','js/cats/v_royal.js'],kind:'costume',cats:['v_astro','v_royal'],
  keys:'v_astro v_astro~asOrange v_royal v_royal~ryPurple',
  notes:`- \`v_astro\`: bộ đồ phi hành gia trắng phủ thân và chân, mũ kính tròn trong suốt trùm cả đầu (thấy mặt mèo và tai bên trong, vành mũ xám, vệt phản chiếu), bảng điều khiển trên ngực, ba lô sau lưng. Dạng hiếm \`asOrange\`: bộ đồ cam (\`#f08a3a\`). Trang phục cũ là bộ vẽ tay \`COS.astro\` / \`OLD2.astro\` và \`astroF, helmet\` trong \`js/art.js\`.
- \`v_royal\`: mèo trắng lông dài (trait \`fur\` do nhóm khác làm), vương miện vàng đính đá, áo choàng đỏ viền lông trắng chấm đen, dây chuyền. Dạng hiếm \`ryPurple\`: hoàng bào tím (đổi sắc đỏ thành tím, \`['hue',330,20,276,.35]\`). Xem \`COS.royal\` / \`OLD2.royal\`.
- Áo choàng bay trễ 1-2 khung; vương miện và mũ kính gắn chặt vào đầu.`},
 {t:'Trang phục hiếm của năm giống 5★',files:['js/cats/b_khaomanee.js','js/cats/b_lykoi.js','js/cats/b_savannah.js','js/cats/b_sokoke.js','js/cats/b_suphalak.js'],kind:'costume',cats:['khaomanee','lykoi','savannah','sokoke','suphalak'],
  keys:'khaomanee~kmChada lykoi~lyHood savannah~svEgypt sokoke~skForest suphalak~spMalai khaomanee lykoi savannah sokoke suphalak',
  notes:`- Mỗi giống đăng ký \`CatKit.costume('<id giống>', def)\`; module chỉ được gọi khi màu lông đang mang có \`cos\` (tức dạng hiếm). Các màu lông thường của giống không đi qua module.
- \`khaomanee~kmChada\`: mão vàng nhiều tầng kiểu Xiêm, chóp nhọn, đính đá (\`chadaAt\`), vòng cổ vàng có chuông. \`lykoi~lyHood\`: áo choàng và mũ trùm đỏ (cô bé quàng khăn đỏ), tai sói ló ra. \`savannah~svEgypt\`: vòng cổ rộng Ai Cập vàng-ngọc lam-đỏ (\`usekh\`), chóp tai vàng. \`sokoke~skForest\`: áo choàng lá xanh, vòng lá và hoa rừng trên đầu (\`wreathAt\`). \`suphalak~spMalai\`: vòng hoa nhài trắng quanh cổ (\`malai\`).
- Hoa văn và hình dáng của các giống này (lykoi, spot, tiger, tai to, mắt kim cương) do nhóm khác làm: ở nhánh của bạn mèo hiện với lông mặc định, chỉ cần trang phục đúng.
- Luồng khí \`aura\` lõi tự vẽ.`},
 {t:'Luffy, Tanjiro, Nezuko, Anya',files:['js/cats/v_luffy.js','js/cats/v_tanjiro.js','js/cats/v_nezuko.js','js/cats/v_anya.js'],kind:'costume',cats:['v_luffy','v_tanjiro','v_nezuko','v_anya'],
  keys:'v_luffy v_tanjiro v_nezuko v_anya',
  notes:`- \`v_luffy\`: tóc đen, MŨ RƠM vàng băng đỏ, sẹo dưới mắt trái, áo đỏ, thắt lưng vàng. \`v_tanjiro\`: tóc đỏ sẫm, vết sẹo trán, hoa tai hanafuda, áo haori ca-rô xanh lá/đen. \`v_nezuko\`: tóc đen dài ngọn cam, nơ hồng, ỐNG TRE ngậm ngang miệng, kimono hồng, đai đỏ, mắt hồng. \`v_anya\`: tóc hồng dài, hai sừng nhỏ đen, đồng phục đen cổ trắng, mắt xanh lá.`},
 {t:'Frieren, Levi, Sailor Moon, Conan',files:['js/cats/v_frieren.js','js/cats/v_levi.js','js/cats/v_sailor.js','js/cats/v_conan.js'],kind:'costume',cats:['v_frieren','v_levi','v_sailor','v_conan'],
  keys:'v_frieren v_levi v_sailor v_conan',
  notes:`- \`v_frieren\`: tóc trắng buộc hai bím dài, áo trắng viền vàng, gậy phép gỗ đính đá đỏ. \`v_levi\`: tóc đen rẽ ngôi, áo choàng xanh Trinh sát bay sau lưng, áo trắng, khăn cravat, đai nâu. \`v_sailor\`: tóc vàng hai búi + hai bím dài, vương miện, cổ áo thuỷ thủ xanh, nơ đỏ. \`v_conan\`: tóc nâu, kính to, áo vest xanh, nơ đỏ.`},
 {t:'Pikachu, Totoro, Doraemon, Garfield',files:['js/cats/v_pika.js','js/cats/v_totoro.js','js/cats/v_dora.js','js/cats/v_garfield.js'],kind:'costume',cats:['v_pika','v_totoro','v_dora','v_garfield'],
  keys:'v_pika v_totoro v_dora v_garfield',
  notes:`- \`v_pika\`: vàng, chóp tai đen, má đỏ tròn, gốc đuôi nâu (đuôi nên có dáng tia chớp nếu làm được mà vẫn bám theo chuyển động đuôi). \`v_totoro\`: xám, bụng kem to có vài dấu chữ V, chiếc lá xanh trên đầu. \`v_dora\`: xanh lam, KHÔNG TAI (\`flag:noEars\`: xoá tai trong \`shape\`, vá viền đỉnh đầu), mặt và bụng trắng, vòng cổ đỏ có chuông, túi thần kỳ; là giống chân ngắn (lõi lo). \`v_garfield\`: cam vằn đen (hoa văn \`tiger\`), mắt to trắng mí sụp nửa chừng (\`lenses, pupils, lids\`).`},
 {t:'Superman, Batman, Spider-Man, Iron Man',files:['js/cats/v_hero.js','js/cats/v_batman.js','js/cats/v_spider.js','js/cats/v_iron.js'],kind:'costume',cats:['v_hero','v_batman','v_spider','v_iron'],
  keys:'v_hero v_batman v_spider v_iron',
  notes:`- \`v_hero\` (Superman): tóc đen, áo xanh, biểu tượng vàng-đỏ trên ngực, đai vàng, áo choàng đỏ bay. \`v_batman\`: mặt nạ đen che nửa trên đầu, tai nhọn, mắt trắng, áo xám, biểu tượng dơi, đai vàng, áo choàng đen. \`v_spider\`: mặt nạ đỏ kín đầu (không mặt mèo), mắt trắng to viền đen, hoạ tiết mạng nhện, áo đỏ hai bên sườn xanh. \`v_iron\`: mũ giáp đỏ, mặt nạ vàng, khe mắt xanh phát sáng, giáp đỏ, lò phản ứng xanh trên ngực.
- Áo choàng trễ 1-2 khung và nằm sau thân. Mặt nạ kín (\`flag:noFace/noMuz\`): tô đè lên mặt bằng \`paint\` (cả ô 'line', 'eye', 'pink') rồi vẽ mắt mới trong \`draw\`.`},
 {t:'Jack Sparrow, Hermione, Voldemort, Wednesday',files:['js/cats/v_pirate.js','js/cats/v_hermione.js','js/cats/v_voldemort.js','js/cats/v_wednesday.js'],kind:'costume',cats:['v_pirate','v_hermione','v_voldemort','v_wednesday'],
  keys:'v_pirate v_hermione v_voldemort v_wednesday',
  notes:`- \`v_pirate\`: mèo vằn nâu ngực trắng, tóc nâu dài có khăn đỏ, mũ ba góc, áo trắng, áo khoác tím xám, đai đỏ, hai bím râu. \`v_hermione\`: tóc nâu xù dài, áo chùng đen, cà vạt đỏ-vàng, đũa phép. \`v_voldemort\`: trắng bệch, KHÔNG tai, KHÔNG mũi (hai khe mũi), mắt đỏ, áo chùng đen, đũa phép. \`v_wednesday\`: lông trắng bệch, tóc đen hai bím, váy đen cổ trắng, mắt đen mí sụp.`},
 {t:'Eleven, Phi Vụ Áo Đỏ, Lính Áo Hồng, Số 456',files:['js/cats/v_eleven.js','js/cats/v_heist.js','js/cats/v_guard.js','js/cats/v_456.js'],kind:'costume',cats:['v_eleven','v_heist','v_guard','v_456'],
  keys:'v_eleven v_heist v_guard v_456',
  notes:`- \`v_eleven\`: tóc nâu húi ngắn, váy hồng, áo khoác xanh, vệt máu mũi đỏ. \`v_heist\`: bộ đồ liền quần đỏ có mũ trùm, mặt nạ Dalí trắng ngà có ria mép. \`v_guard\`: bộ đồ hồng có mũ trùm, mặt nạ đen kín có hình tam giác trắng. \`v_456\`: tóc đen, bộ đồ thể thao xanh ngọc có số 456 trắng (ở khung nhìn thẳng đọc được số).`},
 {t:'Jedi, Gandalf, Ba Lỗ, Ninja',files:['js/cats/v_jedi.js','js/cats/v_gandalf.js','js/cats/v_tank.js','js/cats/v_ninja.js'],kind:'costume',cats:['v_jedi','v_gandalf','v_tank','v_ninja'],
  keys:'v_jedi v_gandalf v_tank v_ninja',
  notes:`- \`v_jedi\`: mũ trùm nâu, áo be, áo khoác nâu, đai, kiếm ánh sáng xanh (thân kiếm sáng, lõi trắng). \`v_gandalf\`: mũ nhọn xám cao (trong giới hạn khung), râu trắng dài, áo xám, gậy gỗ. \`v_tank\` (Mèo Ba Lỗ): mèo vằn cam mặc áo ba lỗ trắng, vai u cơ bắp; bộ vẽ tay \`COS.tank\` / \`OLD2.tank\`. \`v_ninja\`: bộ đồ ninja đen kín, chỉ hở dải mắt, băng trán; \`COS.ninja\` / \`OLD2.ninja\`.
- Kiếm ánh sáng, gậy, đuôi băng trán: trễ 1-2 khung.`},
 {t:'Đầu Bếp, Bánh Mì, DJ',files:['js/cats/v_chef.js','js/cats/v_bread.js','js/cats/v_dj.js'],kind:'costume',cats:['v_chef','v_bread','v_dj'],
  keys:'v_chef v_bread v_dj',
  notes:`- \`v_chef\`: mèo bò sữa (hoa văn \`cow\` do nhóm khác làm), mũ đầu bếp trắng phồng, tạp dề/áo bếp trắng, khăn cổ đỏ; \`COS.chef\` / \`OLD2.chef\`. \`v_bread\`: lát bánh mì vuông ôm quanh MẶT (vỏ nâu, ruột kem), mặt mèo thò ra giữa; chân ngắn (lõi lo); \`COS.bread\` / \`OLD2.bread\`. \`v_dj\`: tai nghe to chụp hai tai, kính râm, áo hoodie; \`COS.dj\` / \`OLD2.dj\`.`},
];

/* ---------------- viết file ---------------- */
const out=path.join(ROOT,'docs','tasks');fs.mkdirSync(out,{recursive:true});
const id=n=>'agent-'+String(n+1).padStart(2,'0');
const COMMON=(a,g)=>`# ${a}: ${g.t}

Bạn đang làm việc trong một worktree git của game "Mèo Xu" (HTML/CSS/JS thuần, không build, chơi trên trình duyệt). Nhánh của bạn: \`sprite/${a}\`.
Bạn KHÔNG thấy cuộc trò chuyện nào trước đó: mọi thứ cần biết nằm trong file này và trong repo.

## Bối cảnh

Dự án đang chuyển TẤT CẢ các loại mèo sang **khung hoạt ảnh của mèo Xoài**: cùng dáng, số khung, thời lượng, lưới, đường đáy và nhịp chân.
Phần lõi đã xong: \`js/catkit.js\` (CatKit) lấy các khung của Xoài làm khung xương và nhịp chân, rồi dựng từng con mèo lên trên bằng các **module**
(hoa văn lông, đặc điểm hình dáng, trang phục). Nhiều phiên làm việc chạy song song, mỗi phiên một nhóm; bạn là \`${a}\`.

## Đọc trước khi làm (tiết kiệm token: chỉ đọc đúng hai thứ này)

1. \`docs/catkit-card.md\`: thẻ tra nhanh, đủ để viết module (lưới, mỏ neo, API, mẫu, vòng làm việc).
2. Kết quả của \`node tools/catctx.js ${g.keys}\`: màu, cờ, từng bộ phận trang phục cũ kèm đúng đoạn mã vẽ nó, mỏ neo.

KHÔNG đọc \`js/art.js\`, \`js/catkit.js\`, \`js/data.js\`, \`js/sprites.js\`, \`tools/xoai_rig.py\`, \`docs/cat-sprite-spec.md\`, trừ khi hai thứ trên không trả lời được một câu hỏi cụ thể; khi đó dùng \`rg -n\` rồi \`sed -n 'a,bp'\` tối đa 60 dòng. Theo đúng luật trong \`AGENTS.md\`.

## Việc của nhóm bạn

${g.kind==='costume'?'Viết module trang phục cho các mèo dưới đây, **mỗi mèo một file**: '+g.files.map(f=>'`'+f+'`').join(', ')+'. Mỗi file đăng ký `CatKit.costume(\'<id>\', {shape, paint, draw})` (xem thẻ tra nhanh `docs/catkit-card.md`).':'Viết file '+g.files.map(f=>'`'+f+'`').join(', ')+' đăng ký: '+g.mods+'.'}

### Mèo của nhóm và đặc điểm riêng phải giữ

${g.cats.map(catLine).join('\n')}

### Ghi chú riêng

${g.notes}

### Khoá phải xuất xem trước

\`\`\`bash
node tools/catprev.js ${g.keys}
\`\`\`

## File được sửa và KHÔNG được sửa

- ĐƯỢC tạo/sửa: ${g.files.map(f=>'`'+f+'`').join(', ')}, \`docs/tasks/${a}-report.md\`, \`docs/tasks/${a}-shared-changes.md\`, và thư mục \`preview/\` (ảnh xem trước, không vào git).
- KHÔNG được sửa bất kỳ file nào khác, đặc biệt là file dùng chung: \`js/catkit.js\`, \`js/art.js\`, \`js/data.js\`, \`js/ui.js\`, \`js/game.js\`, \`js/net.js\`, \`index.html\`, \`server.py\`, \`tools/*\`, \`docs/cat-sprite-spec.md\`, \`js/cats/core.js\`, file của Xoài (\`js/sprites.js\`, \`tools/xoai_rig.py\`) và file \`js/cats/*\` của nhóm khác.
- Nếu buộc phải đổi file dùng chung (thiếu mỏ neo, thiếu hàm, lỗi của lõi...), KHÔNG tự sửa: ghi đề xuất cụ thể (file, hàm, đổi gì, vì sao) vào \`docs/tasks/${a}-shared-changes.md\` rồi tìm cách làm tạm trong file của mình.

## Quy tắc

- Làm lại sprite đúng khung Xoài: cùng cấu trúc, dáng, số khung, thời lượng, lưới, đường đáy, nhịp chân. Khung xương và nhịp chân của Xoài do CatKit cung cấp; bạn vẽ thân, lông, mắt, phụ kiện của từng con lên trên qua module. Không tạo bộ khung riêng, không đổi số khung hay thời lượng.
- Giữ nguyên đặc điểm riêng của từng con (màu lông, hoa văn, màu mắt, phụ kiện, biến thể màu hiếm): ví dụ Khao Manee hai mắt khác màu, Gojo mắt xanh pha lê, phụ kiện của Hoàng Gia, Phi Hành Gia, Harry, Darth Vader, Nyan. Nhìn ở cỡ thật trong game (mỗi ô mịn chỉ 1-2 điểm ảnh màn hình) vẫn phải nhận ra nhân vật: ưu tiên hình khối lớn, màu tương phản, ít chi tiết vụn.
- Phụ kiện chuyển động theo thân; phụ kiện treo hoặc bay (khăn, áo choàng, tóc dài, kiếm, gậy, vật lơ lửng) trễ 1-2 khung so với thân bằng \`G.lag(1)\` / \`G.lag(2)\`.
- Phải đúng ở MỌI dáng: ngồi (4 khung), ngủ (4), liếm lông (6), đứng (1), đi (8), chạy (8), nhảy (8), cả giống thân thường lẫn chân ngắn nếu mèo của bạn chân ngắn. Luôn dựa vào mỏ neo \`F.A\` / \`G.A\` của từng khung, không chép cứng toạ độ.
- KHÔNG sửa hoạt ảnh gacha của bất kỳ con nào (các cảnh intro và phần gacha trong \`js/ui.js\` vẽ kiểu cũ, không qua CatKit).
- KHÔNG dời, kéo dài hay xoá các ô bàn chân ở hai hàng 74-75 của khung nhìn ngang; không vẽ gì dưới hàng 77; không vẽ ra ngoài khung.
- Mỗi ô một màu đặc, không khử răng cưa, không bán trong suốt (trừ \`G.aura\` do lõi vẽ). Không dùng \`Math.random\` (dùng \`CatKit.U.hsh\` / \`vnoise\` để kết quả ổn định giữa các khung).
- Hàm tô màu chạy cho từng ô của từng khung: viết gọn, không cấp phát nhiều; dữ liệu tính trước thì đệm lại.
- Nếu có công cụ tạo ảnh thì được dùng để vẽ tham chiếu, nhưng sprite cuối phải đúng lưới và bảng màu, mỗi ô một màu đặc, sinh ra bởi module JS của bạn. Không thêm thư viện, không cài gói, không cần mạng.
- Viết chú thích bằng tiếng Việt, ngắn gọn, theo phong cách của \`js/cats/core.js\`. File bắt đầu bằng \`"use strict";\` và bọc trong \`(()=>{ ... })();\`.

## Quy trình

1. Đọc thẻ tra nhanh và chạy \`catctx\` như trên.
2. Với từng mèo: chạy \`node tools/catprev.js <khoá>\`, MỞ XEM \`preview/<khoá>/peek.png\` (hàng dưới là con mèo vẽ kiểu cũ: đây là thiết kế cần giữ), rồi viết module.
3. Sau mỗi lần sửa: chạy lại \`node tools/catprev.js <khoá>\` và MỞ XEM \`preview/<khoá>/peek.png\` (hàng trên là mèo của bạn, hàng dưới là bản cũ; 7 dáng). Chỉ mở \`sheet.png\` (mọi khung, hàng trên là Xoài) một lần trước khi kết thúc hoặc khi nghi một khung cụ thể. Soát: phụ kiện có nằm đúng chỗ không, có khung nào bị lệch, hở viền, thủng, nhấp nháy không; so với \`old.png\` xem đặc điểm riêng còn đủ không. Sửa tới khi đạt. Đừng báo xong khi chưa tự mở xem ảnh.
4. Mọi khoá trong danh sách phải được công cụ báo \`ĐẠT\` (dòng "chờ module" của nhóm khác là bình thường). Chạy \`node --check\` cho từng file của bạn.
5. Viết \`docs/tasks/${a}-report.md\`: mèo đã xong, file đã sửa, bảng mèo × dáng (đạt / chưa đạt), vấn đề còn tồn đọng, những chỗ nên được người xem lại bằng mắt.
6. Commit lên nhánh của mình (KHÔNG push, KHÔNG đổi nhánh, KHÔNG merge):
   \`\`\`bash
   git add ${g.files.join(' ')} docs/tasks/${a}-report.md docs/tasks/${a}-shared-changes.md 2>/dev/null; git add -A js/cats docs/tasks
   git commit -m "${a}: ${g.t}"
   \`\`\`
   Nếu \`git commit\` bị từ chối vì quyền ghi, cứ để nguyên thay đổi trên đĩa và ghi rõ điều đó trong báo cáo.
7. Kết thúc bằng một bản tóm tắt in ra màn hình: mèo đã xong, file đã sửa, vấn đề còn tồn đọng.
`;
G.forEach((g,n)=>fs.writeFileSync(path.join(out,id(n)+'.md'),COMMON(id(n),g)));

// README: danh mục mèo + phân nhóm
const owner={};G.forEach((g,n)=>g.cats.forEach(c=>{(owner[c]=owner[c]||[]).push(id(n))}));
const need=s=>{const m=[];const pats=new Set((s.coats||[]).map(c=>COATS[c].pat||'solid').concat([s.pat]));pats.forEach(p=>{if(!['solid','tabby'].includes(p))m.push('hoa văn '+p)});['ear','tail','fur','flat','hl','gem','closed','short'].forEach(k=>{if(s[k])m.push(k==='hl'?'hairless':k)});return m.join(', ')||'chỉ lõi'};
let md=`# Chuyển mọi mèo sang khung Xoài: danh mục và phân nhóm

Sinh bởi \`node tools/mktasks.js\`. Đặc tả: \`docs/cat-sprite-spec.md\`.

Mèo không có file riêng: mọi mèo được **dựng lúc chạy** bởi CatKit từ khung Xoài + các module trong \`js/cats/\`.
Một giống thường = hoa văn (theo màu lông) + đặc điểm hình dáng; mèo đặc biệt = thêm một module trang phục.
Vì vậy việc được chia theo **module**, mỗi nhóm kèm danh sách mèo phải soát.

## Phân nhóm (${G.length} phiên Codex)

| Phiên | Nội dung | File được sửa | Mèo phải soát |
|---|---|---|---|
${G.map((g,n)=>'| '+id(n)+' | '+g.t+' | '+g.files.map(f=>'`'+f+'`').join('<br>')+' | '+g.cats.join(', ')+' |').join('\n')}

Lõi (người điều phối) giữ: \`js/catkit.js\`, \`js/cats/core.js\` (trait \`closed\`, \`v_huh\`, \`v_grumpy\`), hoa văn \`solid\`/\`tabby\`, vùng trắng, màu mắt, chân ngắn, \`tools/catprev.js\`, \`index.html\`, \`js/art.js\`, \`js/ui.js\`, \`js/data.js\`.
File dùng chung KHÔNG phiên nào được sửa: mọi file ngoài cột "File được sửa" của phiên đó; đề xuất ghi vào \`docs/tasks/agent-XX-shared-changes.md\`.

## Giống mèo (${BREEDS.length})

| id | Tên | Sao | Hoa văn mặc định | Đặc điểm | Màu lông (hoa văn khác mặc định) | Module cần | Độ khó | Phiên soát |
|---|---|---|---|---|---|---|---|---|
${BREEDS.map(s=>'| '+[s.id,s.n,s.r+'★',s.pat,traits(s),s.coats.map(c=>c+(COATS[c].pat&&COATS[c].pat!==s.pat?' ('+COATS[c].pat+')':'')+(COATS[c].cos?' [trang phục]':'')).join(', '),need(s),diff(s),(owner[s.id]||['(chỉ lõi + hoa văn)']).join(', ')].join(' | ')+' |').join('\n')}

Màu hiếm (áp lên mọi giống từ 4★ trở xuống): ${RARES.map(r=>'`'+r.id+'` '+r.n+' ('+(r.pat||'solid')+')').join(', ')}.

## Mèo trang phục và đặc biệt (${VARIANTS.length})

| id | Tên | Sao | Nhóm | Đặc điểm | Trang phục | Dạng | Độ khó | Phiên |
|---|---|---|---|---|---|---|---|---|
${VARIANTS.map(s=>'| '+[s.id,s.n,s.r+'★',s.g,traits(s)+(s.pat!=='solid'?', hoa văn '+s.pat:''),cosOf(s.cos),(s.coats||[]).join(', ')||'-',diff(s),(owner[s.id]||['lõi (core.js)']).join(', ')].join(' | ')+' |').join('\n')}
`;
fs.writeFileSync(path.join(out,'README.md'),md);
console.log('đã ghi',G.length,'file task vào docs/tasks; mèo trang phục chưa có phiên:',VARIANTS.filter(v=>!owner[v.id]).map(v=>v.id).join(', '));
