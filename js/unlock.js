"use strict";
/* ============ LỘ TRÌNH MỞ KHÓA THEO CẤP ============
   Bấm vào ô Cấp trên cùng để xem mỗi cấp mở những gì: tính năng (FEATS trong data.js), ô viễn chinh, điểm đến, phòng, món ăn,
   nội thất và thiết bị. Chỉ đọc dữ liệu có sẵn (trường ul, lvl), không đổi cấp mở của thứ gì. */
function openRoadmap(){
  const slotLv=n=>{for(let l=1;l<=MAX_LV;l++)if(Math.min(5,1+Math.floor((l-1)/2))>=n)return l;return 0};
  const wxc=['warm','cool','shield','care'];
  const row=l=>{
    const P=[];
    FEATS.filter(f=>f.lv===l).forEach(f=>P.push('<b>'+f.ic+' '+f.n+'</b>'+(f.d?' <span class="dim">'+f.d+'</span>':'')));
    for(let n=2;n<=5;n++)if(slotLv(n)===l)P.push('🎒 Ô viễn chinh thứ '+n);
    const D=DESTS.filter(d=>(d.lvl||1)===l);if(D.length)P.push('🗺 Điểm đến: '+D.map(d=>d.n).join(', '));
    const R=ROOMS.filter(r=>r.ul===l&&r.price>0);if(R.length)P.push('🚪 Phòng: '+R.map(r=>r.n).join(', '));
    const F=FOODS.filter(f=>f.ul===l);if(F.length&&l>1)P.push('🍚 Món ăn: '+F.map(f=>f.n).join(', '));
    const W=FURNS.filter(f=>f.ul===l&&wxc.includes(f.cat)),I=FURNS.filter(f=>f.ul===l&&!wxc.includes(f.cat));
    if(W.length)P.push('🌡 Thiết bị khí hậu: '+W.slice(0,4).map(f=>f.n).join(', ')+(W.length>4?' và '+(W.length-4)+' món khác':''));
    if(I.length)P.push('🛋 Nội thất: '+I.slice(0,4).map(f=>f.n).join(', ')+(I.length>4?' và '+(I.length-4)+' món khác':''));
    if(l===1)P.unshift('<b>🐾 Chăm sóc cơ bản</b> <span class="dim">Cho ăn, vuốt ve, gacha, viễn chinh, sưu tập.</span>');
    if(!P.length)return '';
    const done=S.level>=l,nx=l===S.level+1;
    return '<div class="card" style="align-items:flex-start;padding:7px 10px;'+(done?'':'opacity:'+(nx?1:.72)+';')+(nx?'border-color:var(--pink);':'')+'"><div style="flex:none;min-width:58px;text-align:center"><b>Cấp '+l+'</b><br><small>'+(done?'✅ đã mở':nx?'⏳ kế tiếp':'🔒')+'</small></div><div class="g" style="text-align:left;font-size:13px;line-height:1.5">'+P.join('<br>')+'</div></div>';
  };
  let h='<h3>⭐ Lộ trình mở khóa</h3><div class="dim" style="margin-bottom:8px">Bạn đang ở cấp <b>'+S.level+'</b>'+(S.level<MAX_LV?' · còn '+(xpNeed()-S.xp).toLocaleString('vi-VN')+' kinh nghiệm nữa lên cấp '+(S.level+1):' (cao nhất)')+'. Thứ đã mở thì không bao giờ khóa lại.</div>';
  for(let l=1;l<=MAX_LV;l++)h+=row(l);
  modal(h);
}
// ô Cấp trên cùng bấm được
{const R0=renderTop;renderTop=function(){R0.apply(this,arguments);const c=document.querySelector('#top .chip.xp');
  if(c&&!c.onclick){c.classList.add('tap');c.setAttribute('data-tip','Bấm để xem mỗi cấp mở những gì.');c.onclick=()=>{if(typeof TUT==='undefined'||!TUT.active())openRoadmap()}}}}
