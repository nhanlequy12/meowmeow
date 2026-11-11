"use strict";
/* Sinh nhiệm vụ vẽ thiết bị thời tiết cho Codex: node tools/mkwxtasks.js → docs/tasks/wx-01.md ... wx-06.md */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
globalThis.localStorage={getItem(){return null},setItem(){}};
(0,eval)(['js/data.js','js/wx-data.js'].map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+'\n;globalThis.__G={FURN,WXDEV,SUPPLY};');
const {FURN,SUPPLY}=__G;
const GROUPS=[
  ['heatmini','heatpro','heatlamp','eblanket','furblanket','heatcatbed','heatmat'],
  ['fireplace','waterheater','glassdoor','thermcurtain','wintercathouse','insulcathouse','gardenhouse'],
  ['fanmini','fanstand','fanceiling','ac1','ac2','mistfan','aircooler'],
  ['coolmat','coolbed','airpurifier','sunblind','dehumid','humidifier','balconyroof','raincurtain'],
  ['winddoor','raintent','hairdryer','wxstation','shadetree','waterbowl','thermobottle','waterfilter','whitenoise'],
  ['premiumpad','smartbed','thermostat','sensor',...SUPPLY.map(s=>'sp_'+s.id)],
];
const KIND={floor:'đặt sàn (hàng cuối của khung là chỗ chạm sàn)',wall:'treo tường (không chạm sàn, không cần bóng chân)'};
const line=id=>{
  if(id.startsWith('sp_')){const s=SUPPLY.find(x=>'sp_'+x.id===id);return '- `'+id+'` 16×16: biểu tượng vật phẩm "'+s.n+'" '+s.ic+'. '+s.d};
  const f=FURN[id],x=[];
  x.push('- `'+id+'` '+f.w+'×'+f.h+', '+KIND[f.kind]+': "'+f.n+'". '+f.d.replace(/^\[[^\]]+\] /,''));
  if(f.anim)x.push('  Có khung hoạt ảnh: `v===\'a1\'` là khung thứ hai lúc máy chạy (cánh quạt xoay lệch, lửa, đèn, hơi nước, sóng âm…). Hai khung cùng khối, chỉ khác chi tiết chuyển động.');
  if(f.water)x.push('  Bát nước: `v===\'full\'` là lúc có nước (nước xanh nhạt, có ánh sáng), `v===\'\'` là bát cạn.');
  if(f.bed)x.push('  Ổ ngủ: mèo nằm tại '+f.bed.at.map(p=>'('+p[0]+', '+p[1]+')').join(', ')+' tính từ tâm ngang và đáy khung (dy âm là cao hơn đáy). Bề mặt nằm phải ở đúng độ cao đó, rộng đủ cho mỗi bé (khoảng 18 ô một bé).');
  if(f.use&&!f.bed)x.push('  Mèo nằm cạnh tại ('+f.use.dx+', '+f.use.dy+') nên chừa chỗ hợp lý.');
  return x.join('\n');
};
const head=n=>`# wx-${n}: vẽ thiết bị thời tiết nhóm ${n}

Bạn vẽ hình nội thất hạt cườm cho game Mèo Xu (HTML/JS thuần). Chỉ tạo đúng một file: \`js/furn/wx-${n}.js\`. Không sửa file nào khác.

## Cách viết
\`\`\`js
"use strict";
/* Hình thiết bị thời tiết nhóm ${n} (Codex vẽ). Nạp sau js/art.js. */
(()=>{const {C,H,mix,dk,lt,hex,WH,EY,RED,NAVY,GOLDC,PINK,PUR,WOOD,WOOD2,CRMF,DWOOD,GRN,GRN2,STEM,TERRA,SAND,GLASS,HOLE,arch,star5}=Art.K;
Art.addFurn({
  heatmini(b,v,a){ /* vẽ vào b */ },
  // ... mỗi id một hàm
});
})();
\`\`\`
- \`b\` là bộ vẽ lưới hạt cườm, kích thước đúng như ghi ở danh sách (rộng × cao, đơn vị ô gốc). Toạ độ là ô gốc, số lẻ .5 được (vẽ ở lưới mịn gấp đôi).
- Hàm vẽ: \`b.rect(x,y,w,h,màu[,'x'])\`, \`b.ell(cx,cy,rx,ry,màu[,vùng,lọc(x,y)])\`, \`b.tri(ax,ay,bx,by,cx,cy,màu[,'x'])\`, \`b.cap(x0,y0,x1,y1,bán kính,màu[,'x'])\`, \`b.line(x0,y0,x1,y1,màu[,'x'])\`, \`b.set(x,y,màu[,'x'])\`, \`b.dot(u,v,màu[,'x'])\` (một ô mịn). Màu là mảng [r,g,b]. \`lt(màu,t)\` làm sáng, \`dk(màu,t)\` làm tối. \`arch(b,cx,đỉnh,nửa rộng,đáy,màu,'x')\` vẽ ô cửa vòm.
- Vùng \`'x'\` là chi tiết (không bị tô sẫm mép dưới). Khối chính không cần \`'x'\`.
- Sau khi vẽ, game tự làm nhạt màu, tô sẫm mép dưới và viền nâu đậm bên ngoài. Đừng tự vẽ viền ngoài, nhưng nên có nét tối mảnh (cap bán kính .2–.35) để tách các phần bên trong.
- Chừa 1 ô trống quanh mép khung để viền không bị cắt.
- Phong cách: hạt cườm (perler bead), pastel, ấm áp, dễ thương, nhiều chi tiết nhỏ có ý nghĩa (đèn báo, nút, vân gỗ, hoa văn vải), giống các món có sẵn. Xem mẫu trong \`js/art.js\`: \`FART.bed\`, \`heatbed\`, \`feltcave\`, \`cloudbed\`, và khối "ổ ngủ và nhà cho mèo" (\`woodhouse\`, \`kennel\`, \`mansion\`).
- Không dùng màu đen tuyền; bóng tối dùng nâu, xanh đậm.

## Kiểm tra
\`node tools/wxprev.js js/furn/wx-${n}.js\` xuất \`preview/wx/wx-${n}.png\` (mỗi món, cả khung 'a1' và 'full' nếu có) và báo món thiếu, lỗi, chạm mép. Mở ảnh xem, sửa tới khi đẹp và rõ nghĩa. Không có lỗi, không thiếu món nào.

## Danh sách
`;
GROUPS.forEach((g,i)=>{const n=String(i+1).padStart(2,'0');
  fs.writeFileSync(path.join(R,'docs','tasks','wx-'+n+'.md'),head(n)+g.map(line).join('\n')+'\n\nBáo cáo cuối: một dòng mỗi món, ghi đã vẽ gì nổi bật.\n');});
console.log('Đã sinh '+GROUPS.length+' nhiệm vụ, '+GROUPS.flat().length+' hình');
