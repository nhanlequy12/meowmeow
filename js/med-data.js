"use strict";
/* ============ NƯỚC UỐNG, BỆNH TẬT, THUỐC, NHÀ THUỐC & BỆNH VIỆN THÚ Y: CẤU HÌNH (2026-11-12) ============
   Mọi con số cân bằng nằm ở file này; luật ở js/med.js (không đụng DOM), giao diện ở js/med-ui.js và js/water-ui.js, hướng dẫn ở js/tut-med.js.
   Nạp sau js/pw-data.js (cần SUPPLY, SUP, FCATS, FEATS, WXST, DEST_CLIMATE).
   Mọi thuốc và tỉ lệ khỏi bệnh là cơ chế giả tưởng của game, không phải hướng dẫn thú y ngoài đời.
   - Nước uống: mua ở Cửa hàng (mở từ cấp 1), cất trong túi đồ S.inv, đổ tay vào bát nước; máy lọc nước chỉ rót nước đang có trong kho.
   - Bệnh: mỗi đợt bệnh là một mục trong c.ill = [{eid, k, t, tries, rel, fail, sp}]; chỉ phát sinh khi Nhà thuốc đã mở (cấp MED_LV) và không phát sinh lúc vắng mặt.
   - Thuốc điều trị: tối đa MEDC.tries lần thử mỗi đợt bệnh; kết quả bốc bằng hạt giống của đợt bệnh và lưu ngay nên tải lại game không thử lại được.
   - Bệnh viện: S.hosp[uid] = {t0, until, ks, eids, cost, ch}; 60 phút thật, tính bằng mốc thời gian nên vẫn trôi khi thoát game. */

const MED_LV=3;
const MEDC={
  hospMin:60,          // phút nằm viện
  charityK:2,          // ca nghiêm trọng mà không đủ xu: quỹ cứu trợ nhận, trả số xu đang có, nằm viện lâu gấp đôi
  tries:2,             // số lần thử thuốc điều trị cho mỗi đợt bệnh
  relief:30,reliefK:.4,// thuốc giảm triệu chứng: 30 phút, triệu chứng chỉ còn 40%; không cộng dồn
  splintK:.5,          // nẹp cố định: triệu chứng của bong gân, gãy chân còn một nửa cho tới khi khỏi
  immune:180,          // phút miễn bệnh mới sau khi khỏi một bệnh
  maxIll:2,            // mỗi bé mắc cùng lúc tối đa 2 bệnh (không tính chấn thương viễn chinh)
  houseCap:.34,        // khi hơn 34% số mèo đang bệnh thì không phát thêm bệnh do môi trường
  lowStock:5,          // còn dưới 5 chai nước trong kho thì cảnh báo
  starter:12,          // số chai Nước lọc tặng một lần khi hệ thống nước bắt đầu
  dryAt:5,dryMin:20,   // nước của bé từ 5 trở xuống liền 20 phút (lúc đang mở game) thì có thể bị Mất nước
  floor:{he:10,he3:5,en:5,hp:0,wa:0}, // bệnh không kéo chỉ số xuống dưới các mức này (he3: bệnh nghiêm trọng); lúc vắng mặt dùng mức sàn WXC.away
  out:{en:40,he:80,full:60,wa:80},    // ra viện: các chỉ số ít nhất bằng mức này (năng lượng chưa hồi đủ)
  tonic:{en:30,he:10,cd:30},          // vật phẩm hỗ trợ phục hồi: +30 năng lượng, +10 sức khỏe, mỗi bé 30 phút một lần
  logMax:60,
};

/* ---------- nước uống ---------- wa: nước cộng cho bé mỗi lần uống; cool: giảm điểm phơi nóng; he: cộng sức khỏe; cf: cộng độ thoải mái */
const DRINKS=[
  {id:'w_plain',n:'Nước lọc',ic:'💧',price:5,wa:20,d:'+20 nước.'},
  {id:'w_mineral',n:'Nước khoáng',ic:'🫧',price:12,wa:35,d:'+35 nước.'},
  {id:'w_pure',n:'Nước tinh khiết cao cấp',ic:'💎',price:25,wa:50,d:'+50 nước.'},
  {id:'w_electro',n:'Nước điện giải cho thú cưng',ic:'🧃',price:40,wa:50,cool:40,d:'+50 nước, hạ nhiệt khi bé bị nóng.'},
  {id:'w_nutri',n:'Nước bổ sung dinh dưỡng cho mèo',ic:'🥛',price:60,wa:40,he:5,d:'+40 nước, +5 sức khỏe.'},
  {id:'w_special',n:'Nước uống đặc biệt',ic:'✨',price:100,wa:60,cf:5,d:'+60 nước, +5 thoải mái.'},
];
DRINKS.forEach(w=>{w.grp='drink'});
const DRINK=Object.fromEntries(DRINKS.map(w=>[w.id,w]));

/* ---------- bệnh và chấn thương ----------
   sev: 1 nhẹ, 2 vừa, 3 nghiêm trọng; grp: nhóm thuốc giảm triệu chứng có tác dụng; fx: mất mỗi phút (hp vui, en năng lượng, wa nước, he sức khỏe);
   cost: viện phí (xu); self: số phút tự khỏi khi được nghỉ ở chỗ tốt (0 là không tự khỏi); hosp: chỉ bệnh viện chữa được; inj: chấn thương;
   noTrip: không đi viễn chinh được; slow: chuyến đi lâu hơn; wx: triệu chứng và tự khỏi do js/wx.js lo (trạng thái Ốm, c.wxs.sk). */
const DIS={
  cold:{n:'Cảm lạnh, viêm hô hấp',ic:'🤧',sev:1,grp:'resp',cause:'Lạnh, ẩm, dầm mưa lâu',sym:'Hắt hơi, mệt mỏi',fx:{hp:.3,he:.25},cost:300,self:90,wx:1},
  fever:{n:'Sốt',ic:'🤒',sev:2,grp:'fever',cause:'Sức khỏe yếu hoặc cảm lạnh để lâu',sym:'Mất sức, chán ăn',fx:{en:.4,hp:.2,he:.15},cost:450,self:0},
  dehyd:{n:'Mất nước',ic:'🏜️',sev:2,grp:'ors',cause:'Hết nước uống quá lâu',sym:'Khát, mệt lả',fx:{en:.3,hp:.3,he:.2},cost:500,self:60},
  heatex:{n:'Kiệt sức vì nóng',ic:'🥵',sev:2,grp:'ors',cause:'Ở chỗ quá nóng quá lâu',sym:'Yếu sức, thở dốc',fx:{en:.5,he:.3},cost:600,self:0},
  heatstroke:{n:'Sốc nhiệt',ic:'🚨',sev:3,hosp:1,cause:'Nhiệt độ cực cao',sym:'Nguy hiểm, cần cấp cứu',fx:{en:.6,he:.5,hp:.4},cost:900,self:0},
  hypo:{n:'Hạ thân nhiệt',ic:'🧊',sev:3,hosp:1,cause:'Nhiễm lạnh nặng kéo dài',sym:'Run rẩy, yếu sức',fx:{en:.5,he:.5,hp:.3},cost:600,self:0},
  derm:{n:'Viêm da, nấm da',ic:'🩹',sev:1,grp:'itch',cause:'Phòng ẩm, lông ướt lâu',sym:'Ngứa, khó chịu',fx:{hp:.3},cost:400,self:0},
  digest:{n:'Rối loạn tiêu hóa',ic:'🤢',sev:1,grp:'digest',cause:'Bị bỏ đói lâu',sym:'Chán ăn, mệt',fx:{en:.2,hp:.2},cost:350,self:120},
  diarrhea:{n:'Đau bụng, tiêu chảy',ic:'💩',sev:2,grp:'digest',cause:'Rối loạn tiêu hóa để lâu',sym:'Mất nước nhanh',fx:{wa:.6,en:.2,hp:.2},cost:350,self:0},
  eye:{n:'Viêm mắt',ic:'👁️',sev:1,grp:'eye',cause:'Gió bụi',sym:'Chảy nước mắt, kém vui',fx:{hp:.3},cost:400,self:180},
  allergy:{n:'Dị ứng',ic:'🌼',sev:1,grp:'itch',cause:'Phấn hoa mùa xuân, bụi',sym:'Ngứa, hắt hơi',fx:{hp:.25},cost:400,self:120},
  stress:{n:'Căng thẳng',ic:'😿',sev:1,grp:'calm',cause:'Sấm sét, mất điện, phòng khó chịu',sym:'Hoảng sợ, khó nghỉ',fx:{hp:.3,en:.15},cost:300,self:60},
  scratch:{n:'Trầy xước',ic:'🩹',sev:1,inj:1,cause:'Tai nạn nhỏ khi viễn chinh',sym:'Đau nhẹ',fx:{he:.05},cost:300,self:120},
  sprain:{n:'Bong gân',ic:'🦶',sev:2,inj:1,cause:'Tai nạn khi viễn chinh',sym:'Đi lại khó, viễn chinh chậm hơn 30%',fx:{hp:.15},cost:700,self:360,slow:1.3},
  fracH:{n:'Gãy chân sau',ic:'🦴',sev:3,inj:1,hosp:1,noTrip:1,cause:'Tai nạn hiếm khi viễn chinh',sym:'Không đi viễn chinh được',fx:{hp:.3,he:.1},cost:1200,self:0},
  fracF:{n:'Gãy chân trước',ic:'🦴',sev:3,inj:1,hosp:1,noTrip:1,cause:'Tai nạn hiếm khi viễn chinh',sym:'Không đi viễn chinh được',fx:{hp:.3,he:.1},cost:1200,self:0},
};
Object.keys(DIS).forEach(k=>{DIS[k].id=k});
const MED_COMPLEX=1800;  // viện phí gộp cho "Chấn thương phức tạp": từ hai chấn thương trở lên mà có gãy chân
const SEV=[null,{n:'Bệnh nhẹ',ic:'🟡',c:'y'},{n:'Bệnh vừa',ic:'🟠',c:'o'},{n:'Nghiêm trọng',ic:'🔴',c:'r'}];
const MEDST={ok:{n:'Khỏe mạnh',ic:'🟢',c:'g'},ill:{n:'Đang ốm',ic:'🟡',c:'y'},inj:{n:'Bị thương',ic:'🟠',c:'o'},sev:{n:'Nghiêm trọng',ic:'🔴',c:'r'},hosp:{n:'Đang điều trị',ic:'🔵',c:'b'}};
const GRP_N={resp:'đường hô hấp',fever:'sốt',ors:'mất nước, kiệt sức vì nóng',itch:'da và dị ứng',digest:'tiêu hóa',eye:'mắt',calm:'căng thẳng'};

/* ---------- thuốc và dụng cụ y tế (bán ở Nhà thuốc) ----------
   kind 'sym': giảm triệu chứng của nhóm bệnh grp trong MEDC.relief phút, hp/en cộng ngay; không chữa khỏi.
   kind 'cure': thuốc điều trị, rate là tỉ lệ khỏi; chỉ dùng cho bệnh không phải chấn thương và không thuộc loại "chỉ bệnh viện".
   kind 'tool': dụng cụ; cure: danh sách bệnh chữa khỏi ngay; splint: cố định tạm; tonic: hỗ trợ phục hồi cho bé không bệnh. */
const MEDS=[
  {id:'m_fever',n:'Thuốc giảm sốt',ic:'🌡️',price:20,kind:'sym',grp:['fever'],en:5,d:'Dịu cơn sốt.'},
  {id:'m_digest',n:'Thuốc hỗ trợ tiêu hóa',ic:'🫚',price:20,kind:'sym',grp:['digest'],hp:5,d:'Êm bụng, đỡ mệt.'},
  {id:'m_resp',n:'Thuốc hỗ trợ đường hô hấp',ic:'🌿',price:20,kind:'sym',grp:['resp'],en:5,d:'Dễ thở, bớt hắt hơi.'},
  {id:'m_itch',n:'Thuốc giảm ngứa',ic:'🧴',price:20,kind:'sym',grp:['itch','eye'],hp:5,d:'Dịu da, dịu mắt.'},
  {id:'m_recover',n:'Thuốc hỗ trợ hồi phục',ic:'🍵',price:25,kind:'sym',grp:['calm','fever','resp'],hp:5,en:5,d:'Thư giãn, lại sức.'},
  {id:'m_ors',n:'Dung dịch bù nước cho thú cưng',ic:'🧪',price:25,kind:'sym',grp:['ors','digest'],wa:25,d:'Bù nước, +25 nước.'},
  {id:'t_basic',n:'Thuốc cơ bản',ic:'💊',price:50,kind:'cure',rate:.3,d:'Thuốc điều trị bậc 1.'},
  {id:'t_good',n:'Thuốc tốt',ic:'💊',price:120,kind:'cure',rate:.5,d:'Thuốc điều trị bậc 2.'},
  {id:'t_premium',n:'Thuốc cao cấp',ic:'💉',price:250,kind:'cure',rate:.7,d:'Thuốc điều trị bậc 3.'},
  {id:'t_special',n:'Thuốc đặc trị',ic:'⚕️',price:500,kind:'cure',rate:.9,d:'Thuốc điều trị bậc 4.'},
  {id:'bandage',n:'Băng gạc',ic:'🩹',price:30,kind:'tool',cure:['scratch'],d:'Chữa khỏi Trầy xước.'},
  {id:'splint',n:'Nẹp chân tạm thời',ic:'🦯',price:80,kind:'tool',splint:['sprain','fracH','fracF'],d:'Cố định tạm: triệu chứng bong gân, gãy chân còn một nửa. Không chữa khỏi gãy chân.'},
  {id:'tonic',n:'Vật phẩm hỗ trợ phục hồi',ic:'🍯',price:60,kind:'tool',tonic:1,d:'Cho bé không bệnh: +'+MEDC.tonic.en+' năng lượng, +'+MEDC.tonic.he+' sức khỏe. Hợp lúc vừa ra viện.'},
];
MEDS.forEach(m=>{m.grp2='med'});
const MED=Object.fromEntries(MEDS.map(m=>[m.id,m]));

/* ---------- đồ bảo hộ viễn chinh: là vật phẩm sinh tồn (chọn mang theo ở màn chọn mèo), bán ở quầy dụng cụ y tế ----------
   inj: giảm xác suất chấn thương (cộng dồn tối đa WXC.resCap); soft: xác suất hạ một bậc chấn thương; frac: hệ số xác suất gãy chân;
   medbag: tự dùng khi bị chấn thương (trầy xước xử lý tại chỗ, bong gân được nẹp sẵn, không mất sức khỏe), không dùng thì trả lại túi. */
const GEAR=[
  {id:'pawwrap',n:'Băng bảo vệ chân',ic:'🧦',price:60,rare:1,on:'start',max:1,med:1,inj:.2,d:'Giảm 20% khả năng chấn thương trong một chuyến.'},
  {id:'catboots',n:'Giày bảo hộ mèo',ic:'🥾',price:120,rare:1,on:'start',max:1,med:1,inj:.3,d:'Giảm 30% khả năng chấn thương trong một chuyến.'},
  {id:'pads',n:'Bộ đệm chống va đập',ic:'🛡️',price:150,rare:2,on:'start',max:1,med:1,inj:.15,soft:.5,d:'Giảm 15% khả năng chấn thương; nếu vẫn bị thì 50% nhẹ đi một bậc.'},
  {id:'brace',n:'Nẹp hỗ trợ phòng chấn thương',ic:'🦿',price:180,rare:2,on:'start',max:1,med:1,inj:.15,frac:.5,d:'Giảm 15% khả năng chấn thương, giảm một nửa khả năng gãy chân.'},
  {id:'medbag',n:'Túi y tế viễn chinh',ic:'👜',price:200,rare:2,on:'auto',max:1,med:1,medbag:1,d:'Tự dùng khi bé bị chấn thương trên đường: trầy xước được xử lý tại chỗ, bong gân được nẹp sẵn. Không dùng thì trả lại túi.'},
];
GEAR.forEach(s=>{if(SUP[s.id])throw new Error('trùng id vật phẩm '+s.id);SUPPLY.push(s);SUP[s.id]=s});
// nước và thuốc dùng chung túi đồ S.inv với vật phẩm sinh tồn (trọng tài máy chủ định giá theo SUP), nhưng không nằm trong danh sách SUPPLY của viễn chinh
DRINKS.concat(MEDS).forEach(s=>{if(SUP[s.id])throw new Error('trùng id vật phẩm '+s.id);SUP[s.id]=s});

/* ---------- tai nạn viễn chinh ---------- dg: độ nguy hiểm của điểm đến (DEST_CLIMATE.danger, 0–0,05)
   xác suất = (base + dg × k) × (1 + wx × mức xấu nhất của thời tiết) × hệ số thời gian (phút / 40, trong 0,5–1,5) × (1 − bảo hộ).
   Điểm đến nguy hiểm nhất (0,05), trời đẹp, 40 phút: tai nạn nhẹ 5%, bong gân 1,7%, gãy chân 0,4%. Gãy chân chỉ có ở điểm đến nguy hiểm từ 0,03. */
const INJ={minor:[.01,.8],sprain:[.002,.3],frac:[0,.08],fracFrom:.03,wx:.15,stumbleEn:8,scratchHe:8,sprainHe:12,fracHe:25};

/* ---------- gắn vào cửa hàng, lộ trình, trạng thái ---------- */
FCATS.push(['drink','🥤 Nước uống']);
FEATS.push({lv:1,id:'water',ic:'🥤',n:'Nước uống',d:'Mua nước ở Cửa hàng rồi đổ vào bát nước cho các bé.'},
  {lv:MED_LV,id:'med',ic:'🏥',n:'Nhà thuốc & Bệnh viện thú y',d:'Mua thuốc, điều trị và cho bé nhập viện. Mở ở ô 🏥 trên cùng.'});
WXST.sick.cure='Cho bé nghỉ ở phòng ấm, khô, thoải mái khoảng 1,5 giờ, hoặc chữa ở Nhà thuốc & Bệnh viện thú y.';
WXST.thirsty.cure='Bấm 💧 Cho uống cạnh nút Cho ăn để rót nước (thiếu thì mua luôn).';
WXST.thirsty.d='Thiếu nước: kém vui, hồi năng lượng chậm; hết nước thì mất sức khỏe.';
FURN.waterbowl.d=FURN.waterbowl.d.replace('Bấm "Đổ nước" (miễn phí) để đổ đầy.','Bấm "Cho uống" để rót nước.');
FURN.waterfilter.d=FURN.waterfilter.d.replace('Tự đổ đầy nước mỗi 10 phút (kể cả lúc vắng)','Tự rót nước đang có trong kho mỗi 10 phút, kể cả lúc vắng (không tự tạo ra nước)');
SUP.coldmed.home={health:10};
SUP.coldmed.d='Tự dùng khi bé bị lạnh hoặc ướt trên đường: giảm 60% khả năng bị ốm. Ở nhà: +10 sức khỏe (muốn chữa khỏi thì đến Nhà thuốc).';
