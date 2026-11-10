"use strict";
/* ============ GIAO DIỆN ============ */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
let BS=4; // số điểm ảnh thật cho mỗi ô lưới trong phòng, luôn là số nguyên (fitCanvas tính lại theo màn hình)
const DPR=()=>window.devicePixelRatio||1;
// k < 3: ô vuông đặc; k >= 3: mỗi ô là một hạt cườm, hở 1 điểm ảnh, có nền nhạt để không xuyên thấu
// f = số điểm ảnh thật cho mỗi ô mịn của sprite (lưới mịn gấp đôi lưới gốc), luôn là số nguyên
function bufCanvas(b,f){
  const W=b.W,H=b.H,c=document.createElement('canvas');c.width=W*f;c.height=H*f;c.lw=b.w;c.lh=b.h;const g=c.getContext('2d'),d=f-1;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=b.c[y*W+x];if(!p)continue;
    const a=p.length===4?p[3]/255:1,L=v=>Math.round(v+(255-v)*.14),full='rgba('+p[0]+','+p[1]+','+p[2]+','+a+')',lite='rgba('+L(p[0])+','+L(p[1])+','+L(p[2])+','+a+')';
    g.fillStyle=full;g.fillRect(x*f,y*f,f,f);
    if(f<2||b.r[y*W+x]==='o')continue; // viền luôn vẽ đặc cho sắc nét
    g.fillStyle=lite;
    if(f===2)g.fillRect(x*f+1,y*f+1,1,1); // hạt nhỏ: chỉ chấm sáng một góc
    else{g.fillRect(x*f+d,y*f,1,f);g.fillRect(x*f,y*f+d,d,1);if(f>=5){g.fillRect(x*f,y*f,1,1);g.fillRect(x*f+d-1,y*f,1,1);g.fillRect(x*f,y*f+d-1,1,1);g.fillRect(x*f+d-1,y*f+d-1,1,1)}}}
  return c;
}
const CC={},CI={},FC={},FI={};
const fk=k=>Math.max(1,Math.round(k/2)); // điểm ảnh mỗi ô gốc -> điểm ảnh mỗi ô mịn
const catCv=(sp,pose,k)=>{const f=fk(k||BS),key=sp+'|'+(pose||'sit')+'|'+f;return CC[key]||(CC[key]=bufCanvas(Art.cat(look(sp),pose),f))};
const furnCv=(id,v,k)=>{const f=fk(k||BS),key=id+'|'+(v||'')+'|'+f;return FC[key]||(FC[key]=bufCanvas(Art.furn(id,v),f))};
// ảnh trong giao diện: phóng đúng bội số nguyên rồi hiển thị 1:1 với điểm ảnh màn hình
const kk=k=>2*fk(k*DPR());
const catSrc=(sp,k)=>{const n=kk(k),key=sp+'|'+n;return CI[key]||(CI[key]=catCv(sp,'sit',n).toDataURL())};
const catTag=(sp,k)=>{const n=kk(k),d=DPR();return '<img class="px'+(sp.indexOf('~r_')>0||(COATS[sp.split('~')[1]]||{}).form?' rareglow':'')+'" width="'+36*n/d+'" height="'+40*n/d+'" src="'+catSrc(sp,k)+'">'};
function furnTag(id,v,mw,mh){
  const d=DPR(),sz=id==='gift'?[28,28]:[FURN[id].w,FURN[id].h],fit=Math.min((mw||48)*d/sz[0],(mh||40)*d/sz[1]),n=2*Math.max(1,Math.floor(fit/2)),sh=Math.min(n,Math.max(1,Math.floor(fit)));
  const key=id+'|'+(v||'')+'|'+n,src=FI[key]||(FI[key]=furnCv(id,v,n).toDataURL());
  return '<img class="px" width="'+sz[0]*sh/d+'" height="'+sz[1]*sh/d+'" src="'+src+'">';
}
const sexIc=c=>c.sex==='f'?'<span class="f">♀</span>':'<span class="m">♂</span>';
// sao theo độ hiếm: 1★ trắng, 2★ xanh lục, 3★ xanh biển, 4★ tím, 5★ vàng lấp lánh; rb = cầu vồng 7 màu lấp lánh (màu hiếm, ưu tiên hơn số sao).
// --d là độ trễ âm theo đồng hồ thật, để hiệu ứng không chạy lại từ đầu mỗi lần giao diện vẽ lại (mọi chu kỳ đều là ước của 6 giây)
const starsOf=(n,rb)=>'<span class="stars '+(rb?'rb':'s'+n)+'"'+(rb||n===5?' style="--d:-'+(Date.now()%6000)+'ms"':'')+'>'+'★'.repeat(n)+'</span>';
const isRb=c=>{const ct=coatOf(c)||{};return isRare(c)||!!ct.jewel||!!ct.form};   // màu lông hiếm, cặp mắt quý hiếm của Khao Manee, hoặc trang phục hiếm của Goku và Naruto
const formOf=c=>c&&(coatOf(c)||{}).form;                 // bé đang mang trang phục hiếm (Siêu Saiyan God, Tiên nhân Cửu Vĩ, Hokage)
const coatLbl=c=>SP[c.sp].xt||formOf(c)?'Trang phục':'Màu lông';          // mèo trang phục có "dạng", giống thật có "màu lông"
const starsC=c=>starsOf(c.star,isRb(c));
const big=c=>c.sp==='v_gojo'?lk(c)+'!open':lk(c);  // ảnh chân dung lớn: Gojo kéo băng mắt để lộ đôi mắt
const tagOf=(t,extra)=>'<span class="tag '+TRAITS[t].k+'" tabindex="0" data-tip="'+esc(TRAITS[t].d)+'">'+TRAITS[t].n+(extra?' · '+extra:'')+'</span>';
const kind=c=>{const ct=coatOf(c),st=c.born?ageStage(c):1;return SP[c.sp].n+(ct?' · '+(isRare(c)||ct.form?'✨ ':ct.jewel?'💎 ':ct.u?'✦ ':'')+ct.n:'')+(st===0?' · 🍼 mèo con':st===2?' · 🧓 mèo già':'')};
const ageTxt=c=>{const st=ageStage(c),n=Math.floor(ageDays(c));return AGE_IC[st]+' '+AGE_N[st]+' · '+(n<1?'chưa đầy 1 ngày tuổi':n+' ngày tuổi')};
const AGE_TIP=['Mèo con (dưới '+AGE_ADULT+' ngày): hiếu động, chạy nhảy và trèo nhiều hơn.','Trưởng thành: sinh hoạt bình thường. Từ '+AGE_OLD+' ngày tuổi sẽ thành mèo già.','Mèo già (từ '+AGE_OLD+' ngày): đi chậm, hay ngủ, ít trèo và không lên tầng cao.'];
const coatTags=c=>{const ct=coatOf(c);return isRare(c)?'<span class="tag x" tabindex="0" data-tip="Màu lông hiếm: luôn 4★ và có một trait riêng của màu.">✨ Màu hiếm</span>':ct&&ct.form?'<span class="tag x" tabindex="0" data-tip="Trang phục hiếm: chỉ khoảng 10% số bé '+SP[c.sp].n+' mang dạng này. Sao chuyển bảy màu và có một trait riêng của dạng.">✨ Trang phục hiếm</span>':ct&&ct.jewel?'<span class="tag x" tabindex="0" data-tip="Cặp màu mắt quý hiếm của Khao Manee: mỗi cặp chỉ xuất hiện ở khoảng 8% số bé Khao Manee.">💎 Mắt quý hiếm</span>':ct&&ct.u?'<span class="tag g" tabindex="0" data-tip="Màu ít gặp trong giống này, tỉ lệ ra thấp hơn các màu khác.">✦ Màu ít gặp</span>':''};
const stat=(ic,v,col)=>'<span class="stat">'+ic+'<span class="bar"><i style="width:'+Math.round(v)+'%;background:'+col+'"></i></span></span>';
const stats=c=>stat('🍗',c.full,c.full<20?'#ff6b6b':'#ffb347')+stat('⚡',c.en,'#7fb7ff')+stat('😊',c.hp,'#5fd08a');
/* --- tooltip (data-tip): một khối nổi gắn thẳng vào body nên không bị khung cuộn của thẻ gacha hay hộp thoại cắt mất, không sinh thanh cuộn.
   Tự giãn theo nội dung, mặc định hiện phía trên, không đủ chỗ thì lật xuống dưới, luôn nằm gọn trong màn hình. --- */
const tipEl=document.createElement('div');tipEl.id='tip';tipEl.setAttribute('role','tooltip');document.body.appendChild(tipEl);
let tipFor=null;
function showTip(t){
  tipFor=t;tipEl.textContent=t.dataset.tip;tipEl.classList.add('on');
  const r=t.getBoundingClientRect(),w=tipEl.offsetWidth,h=tipEl.offsetHeight,m=8;
  let x=r.left+r.width/2-w/2,y=r.top-h-m;
  if(y<m)y=r.bottom+m;
  if(y+h>innerHeight-m)y=Math.max(m,innerHeight-m-h);
  x=Math.max(m,Math.min(x,innerWidth-m-w));
  tipEl.style.transform='translate('+Math.round(x)+'px,'+Math.round(y)+'px)';
}
function hideTip(){tipFor=null;tipEl.classList.remove('on')}
const tipOf=e=>e.target&&e.target.closest?e.target.closest('[data-tip]'):null;
document.addEventListener('mouseover',e=>{const t=tipOf(e);if(t){if(t!==tipFor)showTip(t)}else if(tipFor&&document.activeElement!==tipFor)hideTip()});
document.addEventListener('focusin',e=>{const t=tipOf(e);if(t)showTip(t)});
document.addEventListener('focusout',hideTip);
document.addEventListener('click',e=>{const t=tipOf(e);if(t)showTip(t);else hideTip()}); // chạm trên điện thoại: chạm vào thẻ để xem, chạm ra ngoài để tắt
document.addEventListener('scroll',hideTip,true);addEventListener('resize',hideTip);
setInterval(()=>{if(tipFor&&!tipFor.isConnected)hideTip()},400);

function modal(html){$('mbox').innerHTML=html;$('modal').style.display='flex'}
function closeModal(){$('modal').style.display='none'}
/* thông báo nhỏ: trượt từ trên xuống, mỗi loại một icon và màu nhấn, số xu đếm chạy lên */
const TT={pet:['🤚','#e88aa2'],feed:['🍖','#e39a4a'],coin:['🪙','#d1a02a'],shop:['🛋','#5fb3a1'],room:['🚪','#6fa3d6'],level:['🎉','#9a78d8'],trip:['🎒','#6fb486'],cat:['🐱','#e88aa2'],warn:['⚠️','#d97070'],fix:['🔧','#5fb3a1'],info:['🐾','#a07654']};
function toast(msg,o){
  o=o||{};
  if(!o.type){const m=/^(🎉|😾)\s*/.exec(msg);if(m){o.type=m[1]==='🎉'?'level':'warn';if(m[1]==='😾')o.icon='😾';msg=msg.slice(m[0].length)}else o.type='info'}
  const t=TT[o.type]||TT.info,box=$('toast'),d=document.createElement('div');
  d.className='tst';d.style.setProperty('--ac',t[1]);
  d.innerHTML='<div class="ic">'+(o.icon||t[0])+'</div><div class="bd">'+(o.title?'<b>'+esc(o.title)+'</b>':'')+'<span>'+esc(msg)+'</span></div>'+(o.coins?'<div class="cn">+<span class="num">0</span> 🪙</div>':'');
  while(box.children.length>=4)box.firstChild.remove();
  box.style.top=($('pop').classList.contains('on')?Math.round($('pop').getBoundingClientRect().bottom)+14:10)+'px';
  box.appendChild(d);
  requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.add('on')));
  if(o.coins){const n=d.querySelector('.num'),t0=performance.now(),run=t=>{const k=Math.min(1,(t-t0)/700);n.textContent=Math.round(o.coins*(1-Math.pow(1-k,3)));if(k<1&&d.isConnected)requestAnimationFrame(run)};requestAnimationFrame(run)}
  setTimeout(()=>{d.style.marginBottom=-(d.offsetHeight+7)+'px';d.classList.remove('on');d.classList.add('out');setTimeout(()=>d.remove(),340)},o.ms||2600);
}
notify=toast;

/* ============ HẠT HIỆU ỨNG TRONG PHÒNG ============ */
// Mỗi hạt có vòng đời: sinh ra, bay theo vận tốc/trọng lực, mờ dần rồi biến mất. sh là hình dạng.
let rparts=[],FDT=.016;
const PMAX=280; // trần số hạt để phòng đông mèo không bị lag
const rp=(x,y,col,o)=>{if(rparts.length<PMAX){const p=Object.assign({x,y,vx:0,vy:0,g:0,life:.6,col,sz:1},o);p.max=p.life;rparts.push(p)}};
const ch=pr=>Math.random()<pr;
const RBW=['#ff8080','#ffc478','#fff08c','#9ce296','#8cc4ff','#c4a0f0'];
const GLY={note:["..##","..#.","..#.","###.","###."],heart:[".#.#.","#####",".###.","..#.."],qm:[".##.","#..#","..#.","....","..#."],bat:["#...#","##.##","#####",".#.#."]};
function stepParts(dt){
  FDT=dt;
  rparts=rparts.filter(p=>(p.life-=dt)>0);
  rparts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;if(p.vr)p.r+=p.vr*dt;if(p.gy!=null&&p.y>p.gy){p.y=p.gy;p.vy*=-.45;p.vx*=.7}});
}
function drawParts(g){
  rparts.forEach(p=>{
    const k=p.life/p.max,x=Math.round(p.x),y=Math.round(p.y);
    g.globalAlpha=Math.min(1,k*2.2)*(p.a||1);g.fillStyle=p.col;
    switch(p.sh){
      case 'star':g.fillRect(x-1,y,3,1);g.fillRect(x,y-1,1,3);if(k>.5){g.fillStyle='#fff';g.fillRect(x,y,1,1)}break;
      case 'coin':g.fillRect(x,y-1,2,2);g.fillStyle='#fff3b0';g.fillRect(x,y-1,1,1);break;
      case 'rb':RBW.forEach((c,i)=>{g.fillStyle=c;g.fillRect(x,y+i*2,p.w,2)});break;
      case 'line':g.fillRect(p.bd>0?x:x-p.len,y,p.len,1);break;
      case 'ring':g.strokeStyle=p.col;g.lineWidth=.7;g.beginPath();g.ellipse(p.x,p.y,p.r,p.r*.75,0,0,6.283);g.stroke();break;
      case 'bolt':if(ch(.8)){g.strokeStyle=p.col;g.lineWidth=1.3;g.beginPath();g.moveTo(p.x,p.y);p.pts.forEach(q=>g.lineTo(p.x+q[0],p.y+q[1]));g.stroke();g.strokeStyle='#fff';g.lineWidth=.5;g.stroke()}break;
      default:if(GLY[p.sh])GLY[p.sh].forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]==='#')g.fillRect(x+i,y+j,1,1)});else g.fillRect(x,y,p.sz,p.sz);
    }
  });
  g.globalAlpha=1;
}
/* ---------- vệt di chuyển: mỗi kiểu là một hàm sinh hạt; chạy thì dày và mạnh hơn đi bộ ---------- */
// e: mèo trong phòng, p: vị trí vẽ, bx: ngay sau đuôi, bd: hướng "phía sau" (+1 hoặc −1), run: đang chạy/nhảy, gy: mặt sàn
const on=(r,run)=>Math.random()<r*FDT*(run?2.2:1);
function zig(bd,len,n,amp){const pts=[];let x=0,y=0;for(let i=0;i<n;i++){x+=bd*len/n;y+=rnd(-amp,amp);pts.push([x,y])}return pts}
const K={
  cloud:(e,p,bx,bd,run,gy,o)=>{if(on(run?18:9))rp(bx-bd*5+rnd(-2,2),p.y-rnd(0,4),pick(o.c),{vx:bd*rnd(5,14),vy:rnd(-3,3),life:rnd(.35,.7),sz:run?3:2,a:.85})}, // mây vàng tan dần sau Cân Đẩu Vân
  dust:(e,p,bx,bd,run,gy,o)=>{if(on(run?12:1.2))rp(bx-bd*5,gy-1,o.c||'#a58f76',{vx:bd*rnd(4,14),vy:-rnd(4,12),g:24,life:rnd(.25,.45),sz:run?2:1,a:.7})},
  sparkle:(e,p,bx,bd,run,gy,o)=>{if(on(o.r||4))rp(bx+rnd(-4,4),p.y-rnd(6,26),pick(o.c),{sh:'star',life:rnd(.4,.7),vy:-5})},
  bolt:(e,p,bx,bd,run,gy,o)=>{
    if(on(o.r||10)){const y0=p.y-rnd(8,22),pts=zig(bd,run?26:12,run?7:4,o.thin?3:5);rp(bx-bd*8,y0,o.c,{sh:'bolt',pts,life:rnd(.07,.15)});
      if(!o.thin&&ch(.7)){const q=pts[1+Math.floor(Math.random()*(pts.length-2))];rp(bx-bd*8+q[0],y0+q[1],o.c,{sh:'bolt',pts:zig(bd,run?12:7,3,6),life:rnd(.06,.12)})}}  // nhánh phụ
    if(on(o.thin?6:16))rp(p.x+rnd(-9,9),gy-1,pick([o.c,'#ffffff']),{vx:rnd(-34,34),vy:-rnd(18,48),g:170,life:rnd(.14,.3)});                                     // tia điện tóe dưới chân
  },
  rainbow:(e,p,bx,bd,run)=>{rp(bx-bd*4,p.y-23,'#fff',{sh:'rb',w:2,life:run?.95:.55});if(on(6))rp(bx+bd*rnd(2,26),p.y-rnd(4,30),'#ffffff',{sh:'star',life:rnd(.35,.6)})},
  coins:(e,p,bx,bd,run,gy)=>{if(on(3.2))rp(bx,p.y-rnd(10,20),'#f2c230',{sh:'coin',vx:bd*rnd(6,26),vy:-rnd(20,50),g:230,gy:gy-1,life:1.1});if(on(6))rp(bx+rnd(-5,5),p.y-rnd(6,26),'#ffe9a0',{sh:'star',life:.45})},
  magic:(e,p,bx,bd,run,gy,o)=>{if(on(13))rp(bx+rnd(-2,2),p.y-rnd(8,22),pick(o.c),{vx:bd*rnd(8,24),vy:rnd(-8,8),life:rnd(.3,.6)});if(on(5))rp(bx+bd*rnd(0,10),p.y-rnd(6,26),o.c[0],{sh:'star',life:rnd(.4,.7),vy:-4})},
  cosmos:(e,p,bx,bd,run,gy,o)=>{if(on(12))rp(bx+rnd(-4,4),p.y-rnd(2,26),pick(o.c),{vx:bd*rnd(2,12),vy:rnd(-10,10),life:rnd(.5,.9),sz:ch(.3)?2:1});if(on(1.5))rp(bx-bd*6,p.y-14,o.c[0],{sh:'ring',r:3,vr:24,life:.5})},
  embers:(e,p,bx,bd,run,gy,o)=>{if(on(12))rp(bx+rnd(-3,3),p.y-rnd(2,18),pick(o.c),{vx:bd*rnd(2,10),vy:-rnd(14,30),life:rnd(.3,.6)})},
  petals:(e,p,bx,bd,run,gy,o)=>{if(on(7))rp(bx+rnd(-6,6),p.y-rnd(14,30),pick(o.c),{vx:bd*rnd(2,12)+rnd(-6,6),vy:rnd(10,24),life:rnd(.6,1),sz:2})},
  mist:(e,p,bx,bd,run,gy,o)=>{if(on(9))rp(bx+rnd(-4,4),p.y-rnd(2,16),pick(o.c),{vx:bd*rnd(2,8),vy:-rnd(2,8),life:rnd(.5,.9),sz:ch(.5)?3:2,a:.5})},
  water:(e,p,bx,bd,run,gy,o)=>{if(on(10))rp(bx,p.y-rnd(4,14),pick(o.c),{vx:bd*rnd(6,26),vy:-rnd(10,40),g:160,gy:gy-1,life:rnd(.3,.55)})},
  flame:(e,p,bx,bd,run,gy,o)=>{if(on(15))rp(p.x+rnd(-9,9)+bd*4,p.y-rnd(0,10),pick(o.c),{vy:-rnd(20,44),vx:bd*rnd(0,8),life:rnd(.25,.5),sz:ch(.4)?2:1})},
  glyph:(e,p,bx,bd,run,gy,o)=>{if(on(o.r||3))rp(bx,p.y-rnd(16,28),pick(o.c),{sh:o.g,vx:bd*rnd(2,8),vy:-rnd(6,14),life:.9})},
  lines:(e,p,bx,bd,run,gy,o)=>{if(on(run?13:3))rp(bx+bd*rnd(0,6),p.y-rnd(4,24),pick(o.c),{sh:'line',len:run?rnd(8,16):rnd(3,6),bd,life:.18})},
  pixels:(e,p,bx,bd,run,gy,o)=>{if(on(9))rp(bx+rnd(-3,3),p.y-rnd(2,22),pick(o.c),{life:rnd(.2,.5),sz:2,vx:bd*rnd(0,6)})},
  crumbs:(e,p,bx,bd,run,gy,o)=>{if(on(7))rp(bx,p.y-rnd(6,14),pick(o.c),{vx:bd*rnd(2,12),vy:-rnd(4,16),g:130,gy:gy-1,life:.6})},
};
const TRAIL={
  // 5★
  v_thunder:[['bolt',{c:'#ffd83a'}]],
  v_goku:[['cloud',{c:['#ffe07a','#fff3b0','#ffd24a']}]],
  v_naruto:[['petals',{c:['#6fbf6f','#3f9a55','#b5e08a']}],['lines',{c:['#f08a2a','#ffd83a']}]],
  v_nyan:[['rainbow']],
  v_maneki:[['coins']],
  v_harry:[['magic',{c:['#ffe9a0','#ffffff','#f2c230']}]],
  v_gojo:[['cosmos',{c:['#b46aff','#5a8cff','#ffffff']}]],
  v_vader:[['embers',{c:['#ff5a5a','#ff9a8a']}],['mist',{c:['#3a3745']}]],
  v_astro:[['sparkle',{c:['#ffffff','#bcd0ff'],r:9}],['embers',{c:['#ffb347','#fff3b0']}]],
  v_royal:[['petals',{c:['#ffd24a','#ff9db5','#fff3b0']}],['sparkle',{c:['#ffd24a']}]],
  khaomanee:[['sparkle',{c:['#5ab4ff','#ffcf4a'],r:10}]],
  lykoi:[['mist',{c:['#5a546e','#8a84a0']}],['sparkle',{c:['#f4f1dc'],r:2}]],
  savannah:[['dust',{c:'#c9a878'}],['lines',{c:['#e6cfa6','#ffffff']}]],
  sokoke:[['petals',{c:['#6fd26f','#3f9a55','#b5e08a']}]],
  suphalak:[['embers',{c:['#ffb060','#e88a3a']}],['sparkle',{c:['#ffd89a']}]],
  // mèo trang phục 4★
  v_luffy:[['water',{c:['#8cc4ff','#d6ecff']}]],
  v_tanjiro:[['water',{c:['#5a9ae0','#bfe2ff']}],['lines',{c:['#8cc4ff']}]],
  v_nezuko:[['flame',{c:['#f59ab5','#ff6a8a']}]],
  v_anya:[['glyph',{c:['#f59ab5'],g:'heart'}],['sparkle',{c:['#ffe9a0'],r:3}]],
  v_frieren:[['magic',{c:['#d6ecff','#ffffff','#9cc4e8']}]],
  v_levi:[['lines',{c:['#7fb88a','#ffffff']}]],
  v_pika:[['bolt',{c:'#ffd83a',thin:1,r:6}]],
  v_totoro:[['petals',{c:['#7fb88a','#a8754a']}]],
  v_dora:[['sparkle',{c:['#8cc4ff','#ffffff'],r:6}]],
  v_sailor:[['petals',{c:['#f59ab5','#ffd6e0']}],['sparkle',{c:['#fff08c'],r:4}]],
  v_conan:[['glyph',{c:['#5a9ae0'],g:'qm',r:1.6}]],
  v_hero:[['lines',{c:['#e2484e','#5a9ae0']}]],
  v_pirate:[['water',{c:['#8cc4ff']}],['coins']],
  v_hermione:[['magic',{c:['#c4a0f0','#ffffff']}]],
  v_voldemort:[['mist',{c:['#3f7a52','#2a3a30']}]],
  v_wednesday:[['mist',{c:['#4a4458','#6a5a86']}],['glyph',{c:['#3a3448'],g:'bat',r:1.2}]],
  v_eleven:[['pixels',{c:['#e2484e','#5a9ae0','#ffffff']}]],
  v_heist:[['petals',{c:['#7fbf8a','#a8d6a8']}]],
  v_guard:[['pixels',{c:['#f0508a','#ffffff']}]],
  v_456:[['pixels',{c:['#2f9a8a','#ffffff']}]],
  v_iron:[['embers',{c:['#bff4ff','#ffb347']}]],
  v_spider:[['lines',{c:['#ffffff']}]],
  v_batman:[['mist',{c:['#3f3c4c']}],['glyph',{c:['#2a2733'],g:'bat',r:1.5}]],
  v_jedi:[['sparkle',{c:['#6ab8ff'],r:6}],['lines',{c:['#6ab8ff']}]],
  v_gandalf:[['magic',{c:['#ffffff','#d6d6e0']}]],
  v_grumpy:[['mist',{c:['#9a9aa6']}]],
  v_huh:[['glyph',{c:['#c8785a'],g:'qm',r:1.6}]],
  v_garfield:[['crumbs',{c:['#f39a3a','#f2c84a','#c0392b']}]],
  v_tank:[['dust',{}],['water',{c:['#bfe2ff']}]],
  v_ninja:[['mist',{c:['#9aa3b5','#6b7385']}]],
  v_chef:[['mist',{c:['#ffffff','#e6e6ee']}]],
  v_bread:[['crumbs',{c:['#d69c60','#fae4b4']}]],
  v_dj:[['glyph',{c:['#f06ad0','#5ad0e8','#ffd24a'],g:'note'}]],
};
const TR_NORMAL=[['dust',{}]],TR_RARE=[['dust',{}],['sparkle',{c:['#ffe07a','#ffffff'],r:2.5}]];
function trail(e,c,p){
  const list=TRAIL[c.sp]||(isRare(c)?TR_RARE:TR_NORMAL);
  if(rparts.length>PMAX*.75&&!TRAIL[c.sp])return; // sắp chạm trần thì nhường hạt cho mèo có hiệu ứng riêng
  const bd=e.flip?-1:1,run=e.state!=='walk',gy=p.gy||p.y;
  list.forEach(t=>K[t[0]](e,p,p.x+bd*11,bd,run,gy,t[1]||{}));
}
/* --- Goku và Naruto trong phòng ---
   Goku: khi di chuyển thì đứng trên Cân Đẩu Vân (entPos trả cloud:1); thỉnh thoảng hóa Siêu Saiyan trong 60 giây: hai tai chuyển vàng, hào quang vàng bốc lên (e.fm = {key: ngoại hình tạm, t: giây còn lại, aura}).
   Naruto: thỉnh thoảng phân thân thành ba trong 60 giây. Phân thân là ent có clone:1, cùng uid với bản thể (bản thể luôn đứng trước trong mảng ents nên các chỗ tìm theo uid vẫn ra bản thể).
   Phân thân tan thành khói khi hết giờ, khi bị chạm, hoặc khi cho phòng ăn. e.cd là số giây chờ trước lần diễn kế tiếp. */
const SSJK='v_goku~gkSSJ',SMOKE=['#ffffff','#eceef4','#cfd3de'],NIM={};
function nimbusCv(f){
  f=f||fk(BS);if(NIM[f])return NIM[f];
  const b=new Art.Buf(30,11),Y=[255,214,84],Y2=[255,240,160];
  b.ell(15,7.2,11.5,2.8,Y,'c');b.ell(7.5,5.8,4.6,3.3,Y,'c');b.ell(15,4.9,6.2,4.1,Y,'c');b.ell(22,5.9,4.6,3.2,Y,'c');b.ell(26.8,7.6,2.4,1.8,Y,'c');
  b.ell(6.6,4.7,2.2,1.1,Y2,'x');b.ell(14,3.4,3.2,1.4,Y2,'x');b.ell(21.4,4.8,2.2,1,Y2,'x');
  b.pastel(.06);b.shade(.16);b.outline([152,98,64]);
  return NIM[f]=bufCanvas(b,f);
}
function poof(x,y){for(let i=0;i<14;i++)rp(x+rnd(-9,9),y-rnd(2,30),pick(SMOKE),{vx:rnd(-16,16),vy:-rnd(4,20),life:rnd(.35,.75),sz:ch(.5)?3:2,a:.9})}
function dispel(uid){ents.forEach(o=>{if(o.clone&&!o.dead&&(uid==null||o.uid===uid)){const p=entPos(o);poof(p.x,p.y);o.dead=1}})}
function spawnClones(e){
  const c=entCat(e);if(!c)return;
  [-1,1].forEach(k=>{const x=clamp(e.x+k*rnd(15,24),16,WORLD_W-16),y=clamp(e.y+rnd(-3,3),FLOOR_MIN,FLOOR_MAX);
    ents.push({uid:e.uid,clone:1,life:60,x,y,tx:x,ty:y,state:'idle',t:rnd(.4,1.4),flip:k>0,goal:null,emo:null,emoT:0,wt:rnd(0,5),left:0,eatT:(c.eat&&c.eat.t)||0});poof(x,y)});
  e.cd=60+rnd(60,150);
}
const orbit=(p,r,n,cols,sp)=>{const t=performance.now()/1000;for(let i=0;i<n;i++){const a=t*sp+i*6.283/n;rp(p.x+Math.cos(a)*r,p.y-18+Math.sin(a)*r*.6,pick(cols),{life:.25})}};
// S5: hành động đặc trưng của mèo 5★, thỉnh thoảng tự diễn. pose: tư thế, hover: độ lơ lửng theo tiến độ k (0..1), fx: hạt mỗi khung hình
const S5={
  v_goku:{n:'gồng mình hóa Siêu Saiyan trong 1 phút',dur:2.6,pose:'sit',look:(k,e)=>k>.6&&!formOf(entCat(e))?SSJK:undefined,start(e){e.sgB=0},
    draw(g,e,p,k){g.fillStyle=(formOf(entCat(e))?'rgba(255,90,110,':'rgba(255,214,70,')+(.4*Math.min(1,k/.6)).toFixed(3)+')';g.beginPath();g.ellipse(p.x,p.y-17,15+6*k,22+8*k,0,0,6.283);g.fill()},
    fx:(e,p,k)=>{const col=formOf(entCat(e))?'#ff6a7a':'#ffd83a';
      if(k<.6){if(on(34)){const a=rnd(0,6.283),r=rnd(18,30);rp(p.x+Math.cos(a)*r,p.y-17+Math.sin(a)*r*.8,pick([col,'#ffffff']),{vx:-Math.cos(a)*r*2.8,vy:-Math.sin(a)*r*2.2,life:.32})}
        if(on(12))rp(p.x+rnd(-18,18),e.y-1,'#a58f76',{vy:-rnd(14,30),life:.6,sz:2})}
      else{if(!e.sgB){e.sgB=1;for(let i=0;i<26;i++){const a=rnd(0,6.283),s=rnd(30,80);rp(p.x,p.y-17,pick([col,'#ffffff']),{vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(.3,.5),sz:2})}rp(p.x,p.y-17,col,{sh:'ring',r:4,vr:60,life:.5})}
        if(on(30))rp(p.x+rnd(-12,12),p.y-rnd(0,30),pick([col,'#fff7d0']),{vy:-rnd(24,50),life:rnd(.3,.55),sz:ch(.4)?2:1})}},
    end(e){const rf=formOf(entCat(e));e.fm={key:rf?null:SSJK,t:60,aura:rf?'#ff6a7a':'#ffd83a'}}},
  v_naruto:{n:'kết ấn phân thân thành ba trong 1 phút',dur:1.5,pose:'sit',fx:(e,p)=>{if(on(18))rp(p.x+rnd(-14,14),p.y-rnd(2,30),pick(SMOKE),{vx:rnd(-8,8),vy:-rnd(4,16),life:rnd(.3,.6),sz:ch(.5)?3:2,a:.8})},end(e){spawnClones(e)}},
  v_nyan:{n:'bay lơ lửng kéo cầu vồng',dur:3.4,pose:k=>'run'+Math.floor(k*14)%8,hover:k=>9+Math.sin(k*16)*2,glide:30,fx:(e,p)=>K.rainbow(e,p,p.x+(e.flip?-11:11),e.flip?-1:1,true)},
  v_maneki:{n:'vẫy tay rơi xu',dur:3,pose:'sit',start(){S.coins+=2},hover:k=>Math.abs(Math.sin(k*18))*2,fx:(e,p)=>{if(on(7))rp(p.x+10,p.y-28,'#f2c230',{sh:'coin',vx:rnd(-16,16),vy:-36,g:120,gy:e.y-1,life:1.1});if(on(5))rp(p.x+rnd(-12,12),p.y-rnd(8,34),'#ffe9a0',{sh:'star',life:.5})}},
  v_harry:{n:'vung đũa phép',dur:2.6,pose:'sit',fx:(e,p)=>{if(on(40))rp(p.x+14,p.y-24,pick(['#ffe9a0','#ffffff','#f2c230']),{vx:rnd(8,46),vy:-rnd(8,46),life:.5});if(on(10))rp(p.x+14+rnd(4,26),p.y-24-rnd(4,26),'#ffe9a0',{sh:'star',life:.5})}},
  v_thunder:{n:'ngủ gật rồi lóe sét lao đi',dur:2.6,pose:k=>'sleep'+(Math.floor(k*5)%2),fx:(e,p,k)=>{if(k>.7){if(on(26))rp(p.x+rnd(-6,6),p.y-46,'#ffd83a',{sh:'bolt',pts:zig(1,0,5,5).map((q,i)=>[q[1],(i+1)*9]),life:.1});if(on(30))rp(p.x+rnd(-9,9),e.y-1,pick(['#ffd83a','#ffffff']),{vx:rnd(-34,34),vy:-rnd(18,48),g:170,life:.25})}else if(on(1.5))rp(p.x+8,p.y-34,'#a58e7a',{vy:-6,life:.8})},end(e){e.state='run';e.left=1;e.pre=0;e.boost=2.4;runTarget(e)}},
  v_gojo:{n:'kéo băng mắt, mở lãnh địa',dur:3.2,pose:'sit',look:(k,e)=>lk(entCat(e))+'!open',draw(g,e,p,k){g.fillStyle='rgba(60,30,120,'+(.38*Math.sin(Math.PI*k)).toFixed(3)+')';g.beginPath();g.ellipse(p.x,p.y-18,24,20,0,0,6.283);g.fill()},fx:(e,p)=>{orbit(p,20,3,['#b46aff','#5a8cff','#ffffff'],3);if(on(2.5))rp(p.x,p.y-18,'#b46aff',{sh:'ring',r:4,vr:30,life:.6})}},
  v_vader:{n:'vung kiếm ánh sáng',dur:2.6,pose:'sit',fx:(e,p,k)=>{const a=-2.6+k*2.4;for(let r=10;r<26;r+=3)rp(p.x+Math.cos(a)*r,p.y-16+Math.sin(a)*r,r>20?'#ffffff':'#ff3a3a',{life:.18,sz:2})}},
  v_astro:{n:'trôi lơ lửng không trọng lực',dur:3.6,pose:'sit',hover:k=>Math.sin(Math.PI*k)*14,fx:(e,p)=>{if(on(16))rp(p.x+rnd(-16,16),p.y-rnd(0,36),'#ffffff',{sh:ch(.4)?'star':undefined,life:.6})}},
  v_royal:{n:'ban phát hoa giấy vàng',dur:3,pose:'sit',fx:(e,p)=>{if(on(28))rp(p.x+rnd(-18,18),p.y-44,pick(['#ffd24a','#ff9db5','#ffffff','#b98bff']),{vy:26,vx:rnd(-6,6),life:1.2,sz:2})}},
  khaomanee:{n:'đôi mắt hai màu lóe sáng',dur:2.4,pose:'sit',fx:(e,p)=>{const L=look(lk(entCat(e)));[[-5,L.eye],[5,L.eye2||L.eye]].forEach(q=>{if(on(40)){const a=rnd(0,6.283);rp(p.x+q[0],p.y-21,q[1],{vx:Math.cos(a)*26,vy:Math.sin(a)*26,life:.3})}if(on(6))rp(p.x+q[0]*3+rnd(-4,4),p.y-21+rnd(-8,8),q[1],{sh:'star',life:.4})})}},
  lykoi:{n:'hú dưới trăng',dur:3,pose:'sit',draw(g,e,p,k){g.fillStyle='rgba(244,241,220,'+Math.sin(Math.PI*k).toFixed(3)+')';g.beginPath();g.arc(p.x+10,p.y-52,7,0,6.283);g.fill()},fx:(e,p)=>{if(on(5))rp(p.x+6,p.y-36,'#8a84a0',{sh:'note',vy:-12,vx:6,life:.9})}},
  savannah:{n:'bật nhảy cao tại chỗ',dur:1.1,pose:k=>'leap'+Math.min(3,Math.floor(k*4)),hover:k=>Math.sin(Math.PI*k)*34,fx:(e,p,k)=>{if(k>.9&&on(60))rp(p.x+rnd(-12,12),e.y-1,'#c9a878',{vy:-10,vx:rnd(-20,20),life:.4,sz:2})}},
  sokoke:{n:'gọi lá rừng xoáy quanh',dur:3,pose:'sit',fx:(e,p)=>orbit(p,18,2,['#6fd26f','#3f9a55','#b5e08a'],-2.4)},
  suphalak:{n:'tỏa vòng sáng đồng đỏ',dur:2.6,pose:'sit',fx:(e,p)=>{if(on(3))rp(p.x,p.y-16,'#ffb060',{sh:'ring',r:3,vr:26,life:.7});if(on(14))rp(p.x+rnd(-14,14),p.y-rnd(4,30),'#ffd89a',{sh:'star',life:.4})}},
};
/* --- trạng thái đặc trưng 60 giây của các bé 5★ còn lại (giống Goku hóa Siêu Saiyan, Naruto phân thân) ---
   Diễn xong hành động riêng trong S5 thì bé vào trạng thái này: e.fm = {t, key, aura, md}. Hết giờ thì nghỉ 90–180 giây (e.cd).
   Trường của md: key (ngoại hình tạm), aura (màu luồng khí), sp (hệ số tốc độ), run (xác suất chọn chạy), hover(e) (độ lơ lửng),
   ride (vật cưỡi vẽ đè lên chân khi di chuyển), alpha(e), tilt(e), under/over(g,e,p,c) (vẽ trước/sau sprite), fx(e,p,c) (hạt mỗi khung hình). */
const NOW=()=>performance.now()/1000,BRM={};
const glowAt=(g,x,y,rx,ry,col,a)=>{g.globalAlpha=a;g.fillStyle=col;g.beginPath();g.ellipse(x,y,rx,ry,0,0,6.283);g.fill();g.globalAlpha=1};
const sprAt=(cv,x,y,flip)=>{const w=cv.lw,ax=w===36?18:20,px=Math.round((x-(flip?w-ax:ax))*ZC)/ZC,py=Math.round((y-39)*ZC)/ZC;if(flip){RX.save();RX.translate(px+w,py);RX.scale(-1,1);RX.drawImage(cv,0,0,w,40);RX.restore()}else RX.drawImage(cv,px,py,w,40)};
function broomCv(f){
  f=f||fk(BS);if(BRM[f])return BRM[f];
  const b=new Art.Buf(38,9),W=[156,104,62],Y=[236,196,98],Y2=[200,150,62];
  b.cap(2,4.5,25,4.5,.8,W,'c');b.tri(23,4.5,36.5,1,36.5,8,Y,'c');b.ell(24.5,4.5,1.6,2,[120,76,48],'c');
  [2.6,4.5,6.4].forEach(y=>b.cap(27,4.5+(y-4.5)*.3,36,y,.25,Y2,'x'));
  b.pastel(.06);b.shade(.16);b.outline([110,70,48]);
  return BRM[f]=bufCanvas(b,f);
}
const MD={
  // Zenitsu: Thần tốc, lao đi rất nhanh để lại dư ảnh và tia sét
  v_thunder:{sp:1.9,run:.75,
    under(g,e,p,c){const a=e.gh||(e.gh=[]),l=a[a.length-1],t=NOW();if(!l||Math.hypot(l.x-p.x,l.y-p.y)>7){a.push({x:p.x,y:p.y,pose:p.pose,f:e.flip,t});if(a.length>5)a.shift()}
      a.forEach(q=>{const k=1-(t-q.t)/.42;if(k>0&&q!==a[a.length-1]){g.globalAlpha=.36*k;sprAt(catCv(lk(c),q.pose),q.x,q.y,q.f)}});g.globalAlpha=1},
    fx(e,p){if(on(7))rp(p.x+rnd(-12,12),p.y-rnd(6,30),'#ffd83a',{sh:'bolt',pts:zig(ch(.5)?1:-1,9,3,5),life:.1});if(on(10))rp(p.x+rnd(-9,9),e.y-1,pick(['#ffd83a','#ffffff']),{vx:rnd(-30,30),vy:-rnd(14,40),g:170,life:.22})}},
  // Gojo: tháo băng mắt, lơ lửng trong màn Vô Hạn, hai quả cầu Xích và Thương xoay quanh
  v_gojo:{key:c=>lk(c)+'!open',hover:e=>3+Math.sin(e.wt*2.2)*1.2,
    under(g,e,p){glowAt(g,p.x,p.y-18,22,21,'#5a3ac8',.15+.05*Math.sin(e.wt*3));g.strokeStyle='rgba(196,170,255,.6)';g.lineWidth=.6;g.beginPath();g.ellipse(p.x,p.y-18,22,21,0,0,6.283);g.stroke()},
    over(g,e,p){const t=e.wt*2.4;[['#ff4a5a',0],['#4a8cff',Math.PI]].forEach(q=>{const x=p.x+Math.cos(t+q[1])*19,y=p.y-19+Math.sin(t+q[1])*7;glowAt(g,x,y,3.6,3.6,q[0],.35);glowAt(g,x,y,1.9,1.9,q[0],1);glowAt(g,x-.5,y-.6,.6,.6,'#ffffff',1)})},
    fx(e,p){if(on(5))rp(p.x+rnd(-18,18),p.y-rnd(0,36),pick(['#b46aff','#5a8cff','#ffffff']),{vy:-rnd(4,12),life:.6})}},
  // Harry Potter: cưỡi chổi bay mỗi khi di chuyển
  v_harry:{run:.45,ride:{cv:broomCv,w:38,h:9,off:16,dy:-10,lift:13},
    fx(e,p){if(on(8))rp(p.x+rnd(-14,14),p.y-rnd(0,30),pick(['#ffe9a0','#ffffff','#f2c230']),{sh:ch(.4)?'star':undefined,vy:-rnd(4,10),life:.5})}},
  // Darth Vader: dùng Thần lực nâng ba tảng đá xoay quanh, bóng tối loang dưới chân
  v_vader:{aura:'#ff3a3a',
    under(g,e,p){glowAt(g,p.x,(p.gy||p.y)-1,21,5.5,'#2a0810',.42)},
    over(g,e,p){for(let i=0;i<3;i++){const a=e.wt*.9+i*2.094,x=Math.round(p.x+Math.cos(a)*21),y=Math.round(p.y-22+Math.sin(a*1.7+i)*4+Math.sin(a)*5);
      g.fillStyle='#2e2a38';g.fillRect(x-2,y-1,5,3);g.fillRect(x-1,y-2,3,5);g.fillStyle='#6a6478';g.fillRect(x-1,y-1,2,1);g.fillStyle='rgba(255,70,70,.55)';g.fillRect(x-2,y+4,5,1)}}},
  // Nyan Cat: bay khắp phòng không chạm đất, kéo cầu vồng
  v_nyan:{run:1,sp:1.25,hover:e=>10+Math.sin(e.wt*7)*1.6,
    fx(e,p){if(on(6))rp(p.x+rnd(-20,20),p.y-rnd(-4,34),'#ffffff',{sh:'star',life:.45})}},
  // Thần Tài: mưa lộc, xu vàng rơi quanh và vầng sáng vàng dưới chân
  v_maneki:{under(g,e,p){glowAt(g,p.x,(p.gy||p.y)-1,19,5,'#ffd24a',.3+.1*Math.sin(e.wt*4))},
    fx(e,p){if(on(5))rp(p.x+rnd(-22,22),p.y-rnd(44,56),'#f2c230',{sh:'coin',vy:rnd(16,30),g:60,gy:e.y-1,life:1.3});if(on(4))rp(p.x+rnd(-14,14),p.y-rnd(6,34),'#ffe9a0',{sh:'star',life:.5})}},
  // Phi Hành Gia: không trọng lực, trôi lơ lửng nghiêng ngả, động cơ phụt lửa
  v_astro:{sp:.8,hover:e=>11+Math.sin(e.wt*1.6)*4,tilt:e=>Math.sin(e.wt*.9)*.22,
    fx(e,p){if(on(14))rp(p.x+rnd(-3,3),p.y+rnd(0,2),pick(['#ffb347','#fff3b0','#bff4ff']),{vy:rnd(14,30),vx:rnd(-4,4),life:rnd(.2,.4)});if(on(4))rp(p.x+rnd(-18,18),p.y-rnd(0,38),'#ffffff',{sh:'star',life:.6})}},
  // Hoàng Gia: ngự giá, thảm đỏ trải theo chân, hoa giấy rơi, các bé đứng gần thả tim
  v_royal:{under(g,e,p){const y=Math.round((p.gy||p.y)-3),x=Math.round(p.x-19);g.fillStyle='#b8323e';g.fillRect(x,y,38,6);g.fillStyle='#e6b93a';g.fillRect(x,y,38,1);g.fillRect(x,y+5,38,1);g.fillStyle='#8a2430';g.fillRect(x,y+3,38,1)},
    fx(e,p){if(on(9))rp(p.x+rnd(-18,18),p.y-rnd(40,50),pick(['#ffd24a','#ff9db5','#ffffff','#b98bff']),{vy:rnd(16,28),vx:rnd(-5,5),life:1.1,sz:2});
      if(on(.5)){const o=ents.find(o=>o!==e&&!o.clone&&!o.ghost&&Math.hypot(o.x-e.x,o.y-e.y)<46&&!(o.emoT>0));if(o)o.emoT=1.4}}},
  // Khao Manee: hai viên ngọc mang đúng hai màu mắt xoay quanh
  khaomanee:{over(g,e,p,c){const L=look(lk(c)),t=e.wt*2;[[L.eye,0],[L.eye2||L.eye,Math.PI]].forEach(q=>{const x=p.x+Math.cos(t+q[1])*18,y=p.y-20+Math.sin(t+q[1])*6;glowAt(g,x,y,4.2,4.2,q[0],.3);
        g.fillStyle=q[0];g.beginPath();g.moveTo(x,y-3);g.lineTo(x+2.2,y);g.lineTo(x,y+3);g.lineTo(x-2.2,y);g.fill();g.fillStyle='#ffffff';g.fillRect(x-.8,y-1.3,1,1)})},
    fx(e,p,c){const L=look(lk(c));if(on(8))rp(p.x+rnd(-14,14),p.y-rnd(4,34),ch(.5)?L.eye:(L.eye2||L.eye),{sh:'star',life:.5,vy:-5})}},
  // Lykoi: đêm trăng, vầng trăng đi theo trên đầu, sương dưới chân, hóa "sói" chạy nhanh hơn
  lykoi:{sp:1.3,run:.45,
    under(g,e,p){const x=p.x+(e.flip?-9:9),y=p.y-54;glowAt(g,x,y,11,11,'#f4f1dc',.16);glowAt(g,x,y,6.5,6.5,'#f4f1dc',.95);glowAt(g,x+2,y-1.5,1.6,1.6,'#d6d2b4',.9);glowAt(g,x-2,y+2,1.1,1.1,'#d6d2b4',.9)},
    fx(e,p){if(on(7))rp(p.x+rnd(-16,16),e.y-rnd(0,5),pick(['#5a546e','#8a84a0']),{vx:rnd(-6,6),vy:-rnd(1,5),life:rnd(.6,1),sz:3,a:.45});if(on(.3)&&e.state==='idle')e.emo='note'}},
  // Savannah: máu săn mồi, phóng khắp phòng
  savannah:{sp:1.55,run:.85,aura:'#f2b24a',
    fx(e,p){if(e.state==='run'&&on(16))rp(p.x+rnd(-8,8),e.y-1,'#c9a878',{vx:rnd(-16,16),vy:-rnd(6,16),g:30,life:.4,sz:2});if(e.state==='run'&&on(8))rp(p.x+rnd(-14,14),p.y-rnd(4,30),'#fff3d0',{sh:'line',len:rnd(6,12),bd:e.flip?-1:1,life:.2})}},
  // Sokoke: ngụy trang, mờ dần lẫn vào nền, lá rơi quanh
  sokoke:{alpha:e=>.42+.12*Math.sin(e.wt*2.5),
    fx(e,p){if(on(5))rp(p.x+rnd(-16,16),p.y-rnd(24,40),pick(['#6fd26f','#3f9a55','#b5e08a']),{vx:rnd(-8,8),vy:rnd(8,18),life:rnd(.6,1),sz:2})}},
  // Suphalak: bộ lông đồng đỏ rực sáng
  suphalak:{aura:'#ffb060',
    under(g,e,p){glowAt(g,p.x,p.y-16,17+2*Math.sin(e.wt*3),20,'#ff9a3a',.2)},
    fx(e,p){if(on(.8))rp(p.x,p.y-16,'#ffb060',{sh:'ring',r:4,vr:28,life:.7});if(on(7))rp(p.x+rnd(-14,14),p.y-rnd(4,32),'#ffd89a',{sh:'star',life:.45})}},
};
Object.keys(MD).forEach(k=>{S5[k].md=MD[k]});

/* ============ PHÒNG ============ */
let VW=240,VHV=170,ZC=4,ZMIN=0,camY=0;const VH=170;
const room=$('room'),RX=room.getContext('2d');
const SIDE=matchMedia('(min-width:1024px),(orientation:landscape) and (max-height:520px)');
/* Khung phòng chiếm gần hết cửa sổ. BS = số điểm ảnh thật mỗi ô (số chẵn, để ô mịn của sprite là số nguyên), ZC = mức đang hiển thị (chạy mượt về BS).
   Mức nhỏ nhất ZMIN là mức vừa đủ để phòng phủ kín khung; lăn chuột hoặc chụm 2 ngón để phóng to thêm tối đa 4 nấc. */
function clampCam(){camX=clamp(camX,0,Math.max(0,WORLD_W-VW));camY=clamp(camY,0,Math.max(0,VH-VHV))}
function fitCanvas(){
  if(!room.clientWidth)return;
  const d=DPR(),top=room.getBoundingClientRect().top+scrollY,below=SIDE.matches?86:$('tabs').offsetHeight+78;
  const bw=Math.max(240,Math.round(room.clientWidth*d)),bh0=Math.round(Math.max(170,innerHeight-top-below)*d);
  // mức nhỏ nhất: vừa phủ kín khung (máy tính), nhưng không to quá mức thấy được khoảng 200 ô theo chiều ngang (điện thoại dọc)
  let zm=Math.max(2,Math.min(2*Math.ceil(Math.max(bw/WORLD_W,bh0/VH)/2),2*Math.max(1,Math.round(bw/400))));
  if(S&&S.set&&S.set.bead)zm=Math.max(zm,6); // "hạt to": mỗi hạt cườm ít nhất 3 điểm ảnh thật, nhìn rõ dạng hạt trên màn hình thường
  const bh=Math.min(bh0,VH*zm),cssH=Math.round(bh/d);
  if(room.width===bw&&room.height===bh&&ZMIN===zm)return;
  const rel=ZMIN?BS-ZMIN:0,init=!ZMIN;
  room.width=bw;room.height=bh;room.style.height=cssH+'px';
  ZMIN=zm;BS=ZC=zm+rel;VW=bw/ZC;VHV=bh/ZC;
  if(init)camY=VH; // mặc định nhìn sát sàn
  if(typeof camX==='number')clampCam();
}
addEventListener('resize',fitCanvas);
let fol=null,ret=null,zan=null; // mèo đang theo dõi, điểm camera quay về, điểm neo khi zoom
function zoomStep(dir,fx,fy){
  const nz=clamp(BS+2*dir,ZMIN,ZMIN+8); if(nz===BS)return false;
  if(!fol)zan={wx:camX+fx*VW,wy:camY+fy*VHV,fx,fy};
  BS=nz;return true;
}
function follow(uid){
  if(!fol){fol={uid,back:{x:camX,y:camY,z:BS}};if(BS===ZMIN&&room.height/(BS+2)>=90)BS+=2} // zoom nhẹ vào nếu khung còn đủ caoelse fol.uid=uid;
  ret=null;zan=null;showFol();
}
function unfollow(back){
  if(!fol)return;
  if(back){ret={x:fol.back.x,y:fol.back.y,t:0};BS=fol.back.z;zan=null}
  fol=null;showFol();
}
function showFol(){
  const el=$('folcard'),c=fol&&catBy(fol.uid); if(!c){el.style.display='none';return}
  el.style.display='block';
  el.innerHTML='<div class="row"><div class="g">'+nm(c)+' '+sexIc(c)+' '+starsC(c)+'<br><small>'+kind(c)+'</small></div><button class="sm" onclick="openCat('+c.uid+')">Chi tiết</button><button class="sm" aria-label="Thôi theo dõi" onclick="unfollow(true)">✕</button></div><div style="margin-top:4px">'+stats(c)+'</div><div class="ft">'+c.traits.map(t=>tagOf(t)).join('')+'</div>';
}
// camera: zoom mượt quanh điểm neo, bám theo mèo đang theo dõi, hoặc trượt về chỗ cũ
function stepCam(dt){
  if(ZC!==BS){ZC+=(BS-ZC)*(1-Math.exp(-dt*10));if(Math.abs(ZC-BS)<.03)ZC=BS;VW=room.width/ZC;VHV=room.height/ZC;if(zan){camX=zan.wx-zan.fx*VW;camY=zan.wy-zan.fy*VHV}}
  else zan=null;
  const k=1-Math.exp(-dt*5);
  if(fol){const e=ents.find(e=>e.uid===fol.uid&&!e.ghost);if(!e)unfollow(true);else{const p=entPos(e);camX+=(clamp(p.x-VW/2,0,Math.max(0,WORLD_W-VW))-camX)*k;camY+=(clamp(p.y-20-VHV/2,0,Math.max(0,VH-VHV))-camY)*k}}
  else if(ret){ret.t+=dt;camX+=(ret.x-camX)*k;camY+=(ret.y-camY)*k;if(ret.t>2.5||(ZC===BS&&Math.abs(ret.x-camX)+Math.abs(ret.y-camY)<.3))ret=null}
  clampCam();
}
const entCat=e=>e.ghost||catBy(e.uid);
let cur='living',camX=0,edit=false,sel=null,ents=[];
// mức thích trèo: chân ngắn và mèo lười ít trèo, mèo năng động hoặc có trait leo trèo thì trèo nhiều và lên cao
// tuổi: mèo con trèo nhiều hơn, mèo già trèo ít hẳn
const climbK=c=>(SP[c.sp].short?.15:vigor(c)<0?.25:(has(c,'climber')||has(c,'highup'))?3:vigor(c)>0?1.6:1)*[1.3,1,.3][ageStage(c)];
const perchPos=(it,k)=>{const l=FURN[it.fid].lv[k];return {x:it.x+(it.flip?-1:1)*l[0],y:it.y+l[1]}};
const lvFree=(e,i)=>FURN[i.fid].lv.map((_,k)=>k).filter(k=>!ents.some(o=>o!==e&&o.goal&&o.goal.iid===i.iid&&o.goal.lv===k));
// nhảy lên (dir=1) hoặc xuống (dir=-1) một tầng của món đồ nhiều tầng; tầng -1 là sàn nhà
function climbJump(e,it,dir){
  const g=e.goal,nat=g.at+dir,fl={x:e.fx0,y:e.fy0},a=g.at<0?fl:perchPos(it,g.at),b=nat<0?fl:perchPos(it,nat);
  e.j={fx:a.x,fy:a.y,tx:b.x,ty:b.y,sy:it.y+.5,next:'climb',nat};e.jt=0;e.jd=clamp(Math.hypot(b.x-a.x,b.y-a.y)/90+.35,.35,.9);
  if(Math.abs(b.x-a.x)>.5)e.flip=b.x>a.x;e.state='jump';e.emo=null;
}
pickBowl=(c,bs)=>{const e=ents.find(e=>e.uid===c.uid);return e?bs.slice().sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0]:bs[0]};
function byeEnt(c){dispel(c.uid);const e=ents.find(e=>e.uid===c.uid);if(!e)return;e.ghost=c;e.state='bye';e.t=1.7;e.emo='heart';e.goal=null;if(fol&&fol.uid===c.uid)unfollow(true)}
const ACTIVE=['fast','zoomies','playful','hunter','climber','v_pika','v_eleven','v_hero','v_nyan','v_spider','v_naruto','v_goku','v_thunder'];
const LAZY=['sleeper','lazy','gentle','glutton','v_garfield','v_totoro','v_nezuko','v_frieren','v_wednesday'];
const vigor=c=>c.traits.some(t=>ACTIVE.includes(t))?1:c.traits.some(t=>LAZY.includes(t))?-1:0;
// tìm chỗ đứng cách các bé khác để đỡ đè lên nhau
function freeSpot(e){
  let best=null,bd=-1;
  for(let i=0;i<8;i++){
    const p={x:rnd(16,WORLD_W-16),y:rnd(FLOOR_MIN,FLOOR_MAX)};
    const d=ents.reduce((m,o)=>o===e?m:Math.min(m,Math.hypot((o.state==='walk'||o.state==='run'?o.tx:o.x)-p.x,((o.state==='walk'||o.state==='run'?o.ty:o.y)-p.y)*2)),1e9);
    if(d>bd){bd=d;best=p} if(d>26)break;
  }
  return best;
}
function syncEnts(){
  const home=homeCats(cur);
  ents=ents.filter(e=>e.ghost||home.some(c=>c.uid===e.uid));
  home.forEach(c=>{if(!ents.some(e=>e.uid===c.uid)){const e={uid:c.uid,x:0,y:0,tx:0,ty:0,state:'idle',t:rnd(0,2.5),flip:Math.random()<.5,goal:null,emo:null,emoT:0,wt:rnd(0,5),left:0};const p=freeSpot(e);e.x=p.x;e.y=p.y;ents.push(e)}});
}
function setRoom(rid){cur=rid;camX=0;camY=VH;clampCam();fol=null;ret=null;showFol();sel=null;ents=[];syncEnts();render()}
function navRoom(d){const o=ownedRooms(),i=o.findIndex(r=>r.id===cur);setRoom(o[(i+d+o.length)%o.length].id)}
function goItem(e,it,lvl){
  const f=FURN[it.fid],u=f.use||{},c=entCat(e);
  if(f.lv){e.goal={iid:it.iid,lv:lvl||0,at:-1};e.tx=clamp(perchPos(it,0).x+rnd(-3,3),14,WORLD_W-14)}
  else{e.goal={iid:it.iid};e.tx=clamp(it.x+(it.flip?-1:1)*(u.dx||0)+rnd(-2,2),14,WORLD_W-14)}
  e.ty=u.floor||f.kind==='wall'?rnd(FLOOR_MIN+2,FLOOR_MIN+12):clamp(it.y+2,FLOOR_MIN,FLOOR_MAX);
  e.state=c&&vigor(c)>0&&Math.random()<.5?'run':'walk';e.left=0;e.emo=null;e.pre=.2;
}
function runTarget(e){
  let x=rnd(16,WORLD_W-16); if(Math.abs(x-e.x)<70)x=clamp(e.x+(Math.random()<.5?-1:1)*rnd(80,200),16,WORLD_W-16);
  e.tx=x;e.ty=rnd(FLOOR_MIN,FLOOR_MAX);
}
// chọn việc tiếp theo; trait quyết định bé hay chạy nhảy hay hay nằm
function choose(e){
  const c=entCat(e); if(!c)return;
  const k=vigor(c),r=Math.random(),ag=ageStage(c);
  e.goal=null;e.emo=null;
  if(c.full<20&&ch(.6)){ // đói mà chưa có suất: ra đứng chờ cạnh bát gần nhất
    const b=bowlsIn(cur).slice().sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];
    if(b){e.tx=clamp(b.x+rnd(-14,14),14,WORLD_W-14);e.ty=clamp(b.y+rnd(0,5),FLOOR_MIN,FLOOR_MAX);e.state='walk';e.pre=.2;e.goal={wait:1};return}
  }
  if(c.star===5&&S5[c.sp]&&!e.clone&&!e.fm&&!(e.cd>0)&&ch(.2)){const sg=S5[c.sp];e.state='sig';e.t=sg.dur;if(sg.start)sg.start(e);return} // mèo 5★ thỉnh thoảng diễn hành động riêng
  const md=e.fm&&e.fm.md;
  if(md&&md.run&&c.en>=25&&ch(md.run)){e.state='run';e.pre=.2;e.left=1+Math.floor(rnd(1,3));runTarget(e);return} // đang trong trạng thái đặc trưng: chạy/bay nhiều hơn
  let a=(k<0?.32:k>0?.06:.14)+(ag===2?.12:ag===0?-.03:0); // mèo già ngủ nhiều hơn
  if(r<a||c.en<25){e.state='nap';e.t=rnd(6,12);e.emo='z';return}
  a+=.14; if(r<a){e.state='groom';e.t=rnd(3,6);return}
  a+=(k>0?.26:k<0?.03:.1)+(ag===0?.08:ag===2?-.02:0); if(r<a){e.state='run';e.pre=.2;e.left=1+Math.floor(rnd(1,4));runTarget(e);return}
  const ck=climbK(c);
  a+=.28+(ck>=3?.16:0); if(r<a){
    const cand=itemsIn(cur).filter(i=>{const f=FURN[i.fid];return f.lv?lvFree(e,i).length:f.use&&(f.use.floor||!ents.some(o=>o!==e&&o.goal&&o.goal.iid===i.iid))});
    const w=cand.map(i=>FURN[i.fid].lv?ck:1);let q=Math.random()*w.reduce((x,y)=>x+y,0),n=0;
    while(n<cand.length-1&&q>w[n]){q-=w[n];n++}
    const it=cand[n];
    if(it){
      const lv=FURN[it.fid].lv;
      if(!lv){goItem(e,it);return}
      const top=ck<.5?0:ag===2?Math.floor((lv.length-1)/2):lv.length-1,want=ck>=1.6?Math.max(Math.floor(Math.random()*(top+1)),Math.floor(Math.random()*(top+1))):Math.floor(Math.random()*(top+1));
      const ok=lvFree(e,it).filter(k=>k<=top).sort((x,y)=>Math.abs(x-want)-Math.abs(y-want));
      if(ok.length){goItem(e,it,ok[0]);return}
    }
  }
  a+=.12; if(r<a){e.state='idle';e.t=rnd(1.5,4);return}
  const p=freeSpot(e);e.tx=p.x;e.ty=p.y;e.state='walk';e.pre=.2;
}
const idlePose=e=>e.wt%4.3<.13?'sitb':e.wt%7.1<.45?'sitt':'sit'; // ngồi yên vẫn chớp mắt và vẫy đuôi
const JP=.36,JL=.26; // thời gian thu mình lấy đà và khựng lại khi tiếp đất
const usePos=(it)=>{const u=FURN[it.fid].use;return {x:it.x+(it.flip?-1:1)*u.dx,y:it.y+u.dy}};
function arrive(e){
  if(e.goal&&e.goal.bye){e.dead=1;return}
  if(e.goal&&e.goal.bowl){e.state='use';e.t=rnd(5,9);e.emo='heart';return}
  const it=e.goal&&e.goal.iid&&S.items.find(i=>i.iid===e.goal.iid&&i.room===cur);
  if(it){
    if(FURN[it.fid].lv){e.fx0=e.x;e.fy0=e.y;climbJump(e,it,1);return}
    const u=FURN[it.fid].use;
    if(!u.floor&&u.dy<=-4){const q=usePos(it);e.j={fx:e.x,fy:e.y,tx:q.x,ty:q.y,sy:it.y+.5,next:'use'};e.jt=0;e.jd=clamp(Math.abs(q.y-e.y)/90+.35,.35,.9);e.flip=q.x>e.x;e.state='jump';return}
    e.state='use';e.t=rnd(5,10);e.emo=u.emo;return;
  }
  e.goal=null;
  if(e.state==='run'&&--e.left>0){runTarget(e);return}
  e.state='idle';e.t=rnd(.8,3);
}
function stepEnt(e,dt){
  if(e.emoT>0)e.emoT-=dt;
  if(e.post>0)e.post-=dt;
  e.wt+=dt;
  const c=entCat(e); if(!c)return;
  if(e.cd>0)e.cd-=dt;
  if(e.clone&&(e.life-=dt)<=0){const q=entPos(e);poof(q.x,q.y);e.dead=1;return}                    // phân thân hết giờ thì tan thành khói
  if(e.fm&&(e.fm.t-=dt)<=0){e.fm=null;e.cd=rnd(90,180);for(let i=0;i<12;i++)rp(e.x+rnd(-11,11),e.y-rnd(2,32),'#fff7d0',{vy:-rnd(6,16),life:rnd(.3,.6)})} // hết 1 phút biến hình
  if(c.eat&&c.eat.t>(e.eatT||0)){ // vừa được chia một suất: chạy ra đúng cái bát đó
    if(e.clone){const q=entPos(e);poof(q.x,q.y);e.dead=1;return}                                     // được cho ăn: các phân thân biến mất, chỉ bản thể ra bát
    e.eatT=c.eat.t;const b=S.items.find(i=>i.iid===c.eat.iid&&i.room===cur);
    if(b&&now()-c.eat.t<4000&&!e.ghost&&e.state!=='jump'&&!(e.state==='use'&&e.goal&&e.goal.at>=0)){e.goal={bowl:b.iid};e.tx=clamp(b.x+rnd(-13,13),14,WORLD_W-14);e.ty=clamp(b.y+rnd(1,5),FLOOR_MIN,FLOOR_MAX);e.state='run';e.pre=0;e.left=0;e.emo=null}
  }
  if(e.state==='walk'||e.state==='run'){
    const k=vigor(c),lo=SP[c.sp].short,sp=(e.state==='run'?(lo?48:58):(lo?10:13))*(k>0?1.15:k<0?.8:1)*[1.1,1,.85][ageStage(c)]*(e.boost||1)*((e.fm&&e.fm.md&&e.fm.md.sp)||1),dx=e.tx-e.x,dy=e.ty-e.y,d=Math.hypot(dx,dy);
    if(e.pre>0){e.pre-=dt;e.acc=0;if(Math.abs(dx)>.5)e.flip=dx>0;return}   // đứng dậy quay về hướng đi rồi mới bước
    e.acc=Math.min(1,(e.acc||0)+dt*3.2);
    const v=sp*(.3+.7*e.acc*(2-e.acc))*clamp(d/12,.4,1);                    // tăng tốc êm lúc xuất phát, giảm tốc khi gần tới
    if(d<=Math.max(1.2,v*dt)){e.x=e.tx;e.y=e.ty;e.post=.22;e.boost=0;arrive(e)}
    else{e.x+=dx/d*v*dt;e.y+=dy/d*v*dt;e.wd=(e.wd||0)+v*dt;if(Math.abs(dx)>.5)e.flip=dx>0}
  }else if(e.state==='jump'){
    e.jt+=dt;
    if(e.jt>=JP+e.jd+JL){
      if(e.j.next==='climb'){
        const g=e.goal,it=g&&S.items.find(i=>i.iid===g.iid&&i.room===cur);
        if(!it){e.x=e.fx0;e.y=e.fy0;e.goal=null;e.state='idle';e.t=1;return}
        g.at=e.j.nat;
        if(g.at<0){e.x=e.fx0;e.y=e.fy0;e.goal=null;e.state='idle';e.t=rnd(.5,1.5)}
        else if(g.down)climbJump(e,it,-1);
        else if(g.at<g.lv)climbJump(e,it,1);
        else{e.state='use';e.t=rnd(7,15);g.sleep=FURN[it.fid].lvs||ch(.4);e.emo=g.sleep?'z':'note';c.hp=clamp(c.hp+1+g.at,0,100)} // ở trên cao thì vui hơn, càng cao càng vui
      }
      else if(e.j.next==='use'){const it=S.items.find(i=>i.iid===e.goal.iid);e.state='use';e.t=rnd(5,10);e.emo=it?FURN[it.fid].use.emo:null}
      else{e.x=e.j.tx;e.y=e.j.ty;e.goal=null;e.state='idle';e.t=rnd(.5,1.5)}
    }
  }else{
    const sg=e.state==='sig'&&S5[c.sp];
    if(sg&&sg.glide){e.x+=(e.flip?1:-1)*sg.glide*dt;if(e.x<20){e.x=20;e.flip=true}if(e.x>WORLD_W-20){e.x=WORLD_W-20;e.flip=false}}
    e.t-=dt;
    if(e.t<=0){
      if(e.state==='bye'){e.state='run';e.pre=.15;e.left=0;e.acc=0;e.tx=e.x<camX+VW/2?camX-45:camX+VW+45;e.ty=e.y;e.goal={bye:1};e.emo=null;return}
      e.emo=null;
      if(sg){e.state='idle';if(sg.md)e.fm={key:typeof sg.md.key==='function'?sg.md.key(c):sg.md.key||null,t:60,aura:sg.md.aura,md:sg.md};if(sg.end){sg.end(e);return}}
      const it=e.state==='use'&&e.goal&&e.goal.iid&&S.items.find(i=>i.iid===e.goal.iid&&i.room===cur);
      if(it&&FURN[it.fid].lv){if(e.goal.at>=0){e.goal.down=1;climbJump(e,it,-1)}else choose(e)}
      else if(it&&!FURN[it.fid].use.floor&&FURN[it.fid].use.dy<=-4){const q=usePos(it);e.j={fx:q.x,fy:q.y,tx:e.x,ty:e.y,sy:it.y+.5,next:'idle'};e.flip=e.x>q.x;e.jt=0;e.jd=clamp(Math.abs(q.y-e.y)/90+.35,.35,.9);e.state='jump'}
      else choose(e);
    }
  }
}
// vị trí vẽ, thứ tự trước sau và tư thế của một bé
function entPos(e){
  if(e.state==='jump'){
    const j=e.j,t=e.jt;
    if(t<JP)return {x:j.fx,y:j.fy,sy:j.sy,pose:'crouch'+Math.floor(t*11)%4};   // chuẩn bị: hạ người, ngoáy mông
    if(t>=JP+e.jd)return {x:j.tx,y:j.ty,sy:j.sy,pose:t-JP-e.jd<JL*.5?'land0':'land1'};                  // tiếp đất: chân trước chạm trước
    const k0=(t-JP)/e.jd,k=k0*k0*(3-2*k0)*.35+k0*.65;                                                       // bật lên theo đường parabol
    const jc=entCat(e),gy=j.fy+(j.ty-j.fy)*k,hgt=(12+Math.abs(j.ty-j.fy)*.25)*(jc&&SP[jc.sp].short?.55:1); // chân ngắn nhảy thấp hơn
    return {x:j.fx+(j.tx-j.fx)*k,y:gy-Math.sin(Math.PI*k)*hgt,gy,sy:j.sy,pose:'leap'+Math.min(3,Math.floor(k0*4))};
  }
  if(e.state==='use'&&e.goal&&e.goal.iid){
    const it=S.items.find(i=>i.iid===e.goal.iid);
    if(!it||it.room!==cur){e.state='idle';e.goal=null;e.t=1;e.emo=null}
    else if(FURN[it.fid].lv){const q=perchPos(it,Math.max(0,e.goal.at));return {x:q.x,y:q.y,sy:it.y+.5,pose:e.goal.sleep?'sleep'+(Math.floor(e.wt*.8)%2):idlePose(e)}}
    else{const u=FURN[it.fid].use;if(!u.floor){const q=usePos(it);return {x:q.x,y:q.y,sy:it.y+(u.front?.5:-.5),pose:u.sleep?'sleep'+(Math.floor(e.wt*.8)%2):idlePose(e)}}}
  }
  if(e.state==='bye')return {x:e.x,y:e.y-Math.abs(Math.sin(e.wt*9))*3,gy:e.y,sy:e.y,pose:'sitt'};
  if(e.state==='sig'){const c5=entCat(e),sg=c5&&S5[c5.sp];if(sg){const k=1-clamp(e.t/sg.dur,0,1);return {x:e.x,y:e.y-(sg.hover?sg.hover(k):0),gy:sg.hover?e.y:0,sy:e.y,pose:typeof sg.pose==='function'?sg.pose(k):sg.pose,look:typeof sg.look==='function'?sg.look(k,e):sg.look,k,sg}}}
  const cc=entCat(e),lo=cc&&SP[cc.sp].short,moving=e.state==='walk'||e.state==='run';
  // một chu kỳ bước đi được đúng 10 ô (chân ngắn: 6 ô) nên bàn chân không trượt trên sàn
  // đi 12 khung và chạy 8 khung mỗi chu kỳ, tính theo quãng đường nên chân khớp với sàn ở mọi tốc độ và mọi máy
  const pose=(moving&&e.pre>0)||(e.post>0&&(e.state==='idle'||e.state==='use'))?'stand':e.state==='nap'?'sleep'+(Math.floor(e.wt*.8)%2):e.state==='groom'?'groom'+Math.floor(e.wt*5)%4
    :e.state==='walk'?'walk'+Math.floor((e.wd||0)/(lo?6:10)*12)%12:e.state==='run'?'run'+Math.floor((e.wd||0)/(lo?13:19)*8)%8:idlePose(e);
  if(cc&&cc.sp==='v_goku'&&moving&&!(e.pre>0))return {x:e.x,y:e.y-9+Math.sin(e.wt*5)*.8,gy:e.y,sy:e.y,pose:'stand',cloud:1}; // Goku đứng trên Cân Đẩu Vân lướt đi
  const md=e.fm&&e.fm.md;
  if(md){
    if(md.ride&&moving&&!(e.pre>0))return {x:e.x,y:e.y-md.ride.lift+Math.sin(e.wt*5)*.8,gy:e.y,sy:e.y,pose:'stand',ride:md.ride};
    if(md.hover&&e.state!=='use')return {x:e.x,y:e.y-md.hover(e),gy:e.y,sy:e.y,pose};
  }
  return {x:e.x,y:e.y,sy:e.y,pose};
}
const EMO={z:["###","..#",".#.","#..","###"],heart:[".#.#.","#####","#####",".###.","..#.."],note:["..##","..#.","..#.","###.","###."],excl:["#","#","#",".","#"]};
const EMOC={z:'#a58e7a',heart:'#f0708a',note:'#e0a020',excl:'#e0a020'};
function drawEmo(n,x,y,col){RX.fillStyle=col||EMOC[n];EMO[n].forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='#')RX.fillRect(x+i,y+j,1,1)})}
/* nền phòng: tông trầm, mỗi phòng một kiểu tường và sàn riêng */
const THEMES={
  living:{w:['#b5a086','#aa947a','#8f7558'],wp:'stripe',f:['#a07d58','#8f6e4b'],fp:'plank'},
  bedroom:{w:['#8a86a4','#d6cc9a','#6e6a88'],wp:'stars',f:['#85769a','#766888'],fp:'dots'},
  kitchen:{w:['#b3ae9a','#a39e8a','#86816e'],wp:'tile',f:['#978c7c','#827768'],fp:'check'},
  balcony:{w:['#9bb2be','#869cab','#7a8f9c'],wp:'city',f:['#a4967e','#90826a'],fp:'tile'},
  bathroom:{w:['#98aeb0','#88a0a3','#6f868a'],wp:'tile',f:['#8a9c9c','#788a8a'],fp:'check'},
  playroom:{w:['#9aaea0','#8a9f90','#74897a'],wp:'dots',f:['#b0996e','#9e875c'],fp:'check'},
  dining:{w:['#ae9682','#a08874','#866c58'],wp:'panel',f:['#8a6a4e','#785a40'],fp:'plank'},
  attic:{w:['#987f64','#886f54','#6f583e'],wp:'wood',f:['#806448','#6f553a'],fp:'plank'},
  garden:{w:['#9fb8bc','#7fa67a','#6f9a6c'],wp:'hedge',f:['#8aa878','#7a9868'],fp:'grass'},
  library:{w:['#8a705a','#6a523e','#5e4836'],wp:'books',f:['#7a4e4c','#6a403e'],fp:'dots'},
  gameroom:{w:['#5c5776','#f06ad0','#444058'],wp:'neon',f:['#524d66','#47425a'],fp:'check'},
  greenhouse:{w:['#a5beb4','#e6efe8','#7fa67a'],wp:'glass',f:['#968668','#84745a'],fp:'tile'},
  tatami:{w:['#beb190','#8a7350','#86764e'],wp:'shoji',f:['#a4a976','#929766'],fp:'tatami'},
  basement:{w:['#7c7775','#6c6765','#565250'],wp:'brick',f:['#6c6765','#5e5957'],fp:'check'},
  pool:{w:['#98b8c7','#7fa67a','#6f9a6c'],wp:'hedge',f:['#b0a38a','#9c8f78'],fp:'pool'},
  rooftop:{w:['#8a97b4','#737f9c','#687490'],wp:'city',f:['#888684','#777573'],fp:'tile'},
  royal:{w:['#8a464e','#d9a83a','#6a343c'],wp:'royal',f:['#988662','#867452'],fp:'check'},
};
function drawBg(g,rid){
  const T=THEMES[rid]||THEMES.living,[w0,w1,w2]=T.w,[f0,f1]=T.f,W=WORLD_W,Y=WALL_Y,FH=VH-Y;
  const F=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  F(0,0,W,Y,w0);
  switch(T.wp){
    case 'stripe':for(let x=12;x<W;x+=24)F(x,0,2,Y,w1);break;
    case 'panel':for(let x=0;x<W;x+=40){F(x+4,8,32,Y-40,w1);F(x+4,Y-26,32,18,w1)}break;
    case 'stars':for(let i=0;i<46;i++)F((i*97)%W,(i*53)%(Y-14)+4,2,2,w1);F(380,14,10,10,w1);F(384,12,10,10,w0);break;
    case 'tile':for(let x=0;x<W;x+=16)F(x,0,1,Y,w1);for(let y=0;y<Y;y+=16)F(0,y,W,1,w1);break;
    case 'dots':for(let y=10,j=0;y<Y-8;y+=18,j++)for(let x=(j%2?12:0)+6;x<W;x+=24)F(x,y,4,4,w1);break;
    case 'wood':for(let y=10;y<Y;y+=12)F(0,y,W,1,w1);for(let x=30;x<W;x+=90)F(x,0,6,Y,w2);break;
    case 'brick':for(let y=0,j=0;y<Y;y+=8,j++){F(0,y,W,1,w1);for(let x=(j%2?10:0);x<W;x+=20)F(x,y,1,8,w1)}break;
    case 'books':for(let y=6,j=0;y<Y-12;y+=22,j++){F(0,y+18,W,3,w2);for(let x=4,i=0;x<W-4;x+=5,i++)if((i*7+j*3)%9)F(x,y+18-(10+(i*5+j)%7),4,10+(i*5+j)%7,['#8f5a52','#5e7a8a','#8a8452','#6a7a5a','#7a5e86','#9a7a52'][(i+j*2)%6])}break;
    case 'neon':F(30,20,60,2,w1);F(30,20,2,30,w1);F(180,34,50,2,'#5ad0e8');F(228,34,2,24,'#5ad0e8');F(330,18,70,2,'#f2c84a');F(360,18,2,40,'#f2c84a');for(let x=0;x<W;x+=40)F(x,Y-14,20,2,'#6c6690');break;
    case 'shoji':for(let x=0;x<W;x+=60){F(x,0,3,Y,w1);F(x+3,6,54,Y-14,'#d6ccb0');for(let k=1;k<3;k++)F(x+3+k*18,6,1,Y-14,w1);for(let y=28;y<Y-10;y+=22)F(x+3,y,54,1,w1)}break;
    case 'royal':for(let x=20;x<W;x+=80){F(x,0,10,Y,w1);F(x-2,0,14,5,w1);F(x-2,Y-9,14,5,w1)}for(let x=60;x<W;x+=80){F(x-12,20,24,30,'#7a3a42');F(x-3,30,6,10,w1)}break;
    case 'glass':for(let x=0;x<W;x+=30)F(x,0,2,Y,w1);F(0,30,W,2,w1);for(let x=10;x<W;x+=46){F(x,Y-30+(x%3)*4,10,30,w2);F(x+3,Y-38+(x%3)*4,4,10,'#8fb88a')}break;
    case 'city':F(40,14,30,6,'#dfe6e8');F(50,10,16,5,'#dfe6e8');F(300,22,36,6,'#dfe6e8');for(let i=0;i<12;i++){const h=20+(i*37)%40;F(i*42,Y-22-h,34,h+22,i%2?w1:w2);for(let y=Y-18-h;y<Y-26;y+=8)for(let x=i*42+4;x<i*42+30;x+=8)F(x,y,3,4,'#c9d6dc')}F(0,Y-24,W,3,'#d9d0c0');for(let x=4;x<W;x+=14)F(x,Y-24,2,24,'#d9d0c0');break;
    case 'hedge':F(80,12,34,6,'#e2e8e6');F(92,8,16,5,'#e2e8e6');F(350,20,30,6,'#e2e8e6');F(0,Y-36,W,36,w1);for(let x=0;x<W;x+=22)F(x+3,Y-41,16,6,w1);for(let x=8;x<W;x+=34)F(x,Y-26+(x%3)*5,3,3,'#e09aa8');break;
  }
  F(0,Y-4,W,4,w2);
  F(0,Y,W,FH,f0);
  switch(T.fp){
    case 'plank':for(let y=Y+14;y<VH;y+=15)F(0,y,W,1,f1);for(let y=Y,j=0;y<VH;y+=15,j++)for(let x=(j%2?30:0);x<W;x+=60)F(x,y,1,15,f1);break;
    case 'check':for(let y=Y,j=0;y<VH;y+=19,j++)for(let x=0,i=0;x<W;x+=30,i++)if((i+j)%2)F(x,y,30,19,f1);break;
    case 'tile':for(let x=0;x<W;x+=24)F(x,Y,1,FH,f1);for(let y=Y+18;y<VH;y+=18)F(0,y,W,1,f1);break;
    case 'dots':for(let y=Y+8,j=0;y<VH;y+=12,j++)for(let x=(j%2?10:0)+4;x<W;x+=20)F(x,y,2,2,f1);break;
    case 'grass':for(let i=0;i<90;i++)F((i*61)%W,Y+4+(i*29)%(FH-6),2,2,i%3?f1:'#a4c492');break;
    case 'tatami':for(let x=0;x<W;x+=60){F(x,Y,2,FH,'#6a7046');F(x+2,Y+FH/2,58,1,f1)}break;
    case 'pool':F(0,Y+4,W,22,'#6f9fb8');for(let y=Y+8;y<Y+24;y+=6)for(let x=(y%12?6:16);x<W;x+=24)F(x,y,8,1,'#9cc4d6');F(0,Y+26,W,3,'#d9d0c0');for(let x=0;x<W;x+=24)F(x,Y+29,1,FH-29,f1);break;
  }
  if(rid==='royal')F(0,Y+26,W,22,'#8a3a44');
  const dm=(S.set&&S.set.dim)||0;if(dm>0)F(0,0,W,VH,'rgba(24,14,8,'+dm+')'); // độ tối nền chỉnh trong Cài đặt
}
function drawItem(i){
  const f=FURN[i.fid],B=f.bowl,cv=furnCv(i.fid,i.broken?'broken':(B&&i.left>0?'full':'')),x0=Math.round(i.x-f.w/2),y0=Math.round(i.y-f.h);
  if(i.flip){RX.save();RX.translate(x0+f.w,y0);RX.scale(-1,1);RX.drawImage(cv,0,0,f.w,f.h);RX.restore()}else RX.drawImage(cv,x0,y0,f.w,f.h);
  if(B){ // số suất còn lại trong bát
    const tx=(i.left||0)+'/'+B.cap;RX.font='bold 4.5px system-ui,sans-serif';const tw=Math.ceil(RX.measureText(tx).width)+3,nx=Math.round(i.x-tw/2),ny=y0-8;
    RX.fillStyle=i.left>0?'#1c6340':'#8a3040';RX.fillRect(nx-.5,ny-.5,tw+1,7);RX.fillStyle='#fff8ec';RX.fillRect(nx,ny,tw,6);RX.fillStyle=i.left>0?'#1c6340':'#8a3040';RX.textBaseline='top';RX.fillText(tx,nx+1.5,ny+.6);
  }
  if(edit&&sel===i.iid){RX.strokeStyle='#e58aa0';RX.lineWidth=1;RX.setLineDash([3,2]);RX.strokeRect(x0-1.5,y0-1.5,f.w+3,f.h+3);RX.setLineDash([])}
}
function drawEnt(e,p){
  const c=entCat(e); if(!c)return;
  // sprite ngồi rộng 36 ô (tâm 18); sprite nhìn ngang rộng 50 ô, đầu quay trái (tâm 22). Đổi hướng bằng cách lật, không xoay.
  const key=p.look||(e.fm&&e.fm.key)||lk(c),cv=catCv(key,p.pose),w=cv.lw,ax=w===36?18:20;
  if(p.sg&&p.sg.draw)p.sg.draw(RX,e,p,p.k);
  const md=e.fm&&e.fm.md;if(md&&md.under)md.under(RX,e,p,c);
  RX.fillStyle='rgba(70,42,28,.24)';RX.beginPath();RX.ellipse(p.x,(p.gy||p.y)-1,p.gy?9:(w===36?11:15),p.gy?2.2:3,0,0,6.283);RX.fill(); // bóng đổ dưới chân
  const px=Math.round((p.x-(e.flip?w-ax:ax))*ZC)/ZC,py=Math.round((p.y-39)*ZC)/ZC,F=fol&&fol.uid===e.uid&&!e.ghost&&!e.clone;
  if(F){const t=performance.now()/1000;RX.strokeStyle='rgba(255,236,150,'+(.55+.3*Math.sin(t*4))+')';RX.lineWidth=1;RX.beginPath();RX.ellipse(p.x,(p.gy||p.y)-1,16,4.5,0,0,6.283);RX.stroke();RX.shadowColor='rgba(255,244,170,.95)';RX.shadowBlur=ZC*2.5} // viền sáng quanh bé đang theo dõi
  const al=md&&md.alpha?md.alpha(e):1,tl=md&&md.tilt?md.tilt(e):0;
  if(al<1||tl){RX.save();RX.globalAlpha=al;RX.translate(px+w/2,py+20);RX.rotate(tl);if(e.flip)RX.scale(-1,1);RX.drawImage(cv,-w/2,-20,w,40);RX.restore()} // mờ (ngụy trang) hoặc nghiêng (không trọng lực)
  else if(e.flip){RX.save();RX.translate(px+w,py);RX.scale(-1,1);RX.drawImage(cv,0,0,w,40);RX.restore()}else RX.drawImage(cv,px,py,w,40);
  RX.shadowBlur=0;
  if(p.ride){const r=p.ride,rc=r.cv(),nx=Math.round((p.x-(e.flip?r.w-r.off:r.off))*ZC)/ZC,ny=Math.round((p.y+r.dy)*ZC)/ZC;                              // vật cưỡi (chổi bay) vẽ đè lên chân
    if(e.flip){RX.save();RX.translate(nx+r.w,ny);RX.scale(-1,1);RX.drawImage(rc,0,0,r.w,r.h);RX.restore()}else RX.drawImage(rc,nx,ny,r.w,r.h)}
  if(md){if(md.over)md.over(RX,e,p,c);if(md.fx)md.fx(e,p,c)}
  if(p.cloud){const nc=nimbusCv(),nx=Math.round((p.x+(e.flip?-20:-10))*ZC)/ZC,ny=Math.round((p.y-5)*ZC)/ZC;   // đám mây vẽ đè lên bàn chân
    if(e.flip){RX.save();RX.translate(nx+30,ny);RX.scale(-1,1);RX.drawImage(nc,0,0,30,11);RX.restore()}else RX.drawImage(nc,nx,ny,30,11)}
  const au=(e.fm&&e.fm.aura)||look(key).aura;                                                          // luồng khí bốc lên quanh thân
  if(au&&on(e.fm?22:11))rp(p.x+rnd(-11,11),p.y-rnd(0,30),pick([au,au,'#fff7d0']),{vy:-rnd(20,44),vx:rnd(-3,3),life:rnd(.3,.6),sz:ch(.4)?2:1});
  const t=performance.now()/1000,ex=Math.round(p.x),by=Math.round(py+Math.sin(t*3+ex));
  if(isRare(c)){const k=Math.floor(t*4+c.uid)%6,sx=ex+[-12,9,-4,13,-9,3][k],sy=Math.round(p.y)+[-30,-34,-20,-14,-8,-26][k];RX.fillStyle='#ffe07a';RX.fillRect(sx-1,sy,3,1);RX.fillRect(sx,sy-1,1,3);RX.fillStyle='#fff';RX.fillRect(sx,sy,1,1)} // màu hiếm lấp lánh nhẹ
  if((e.state==='walk'||e.state==='run'||(e.state==='jump'&&p.gy))&&!(e.pre>0))trail(e,c,p); // vệt riêng khi di chuyển
  if(c.star===5){
    if(on(4))rp(p.x+rnd(-13,13),p.y-rnd(4,36),pick(['#ffd24a','#fff3b0']),{vy:-7,life:.7});   // hào quang vàng nhẹ
    if(p.sg&&p.sg.fx)p.sg.fx(e,p,p.k);
    if(!e.clone){RX.font='bold 5px system-ui,sans-serif';const tw=Math.ceil(RX.measureText(c.name).width)+4,nx=Math.round(p.x-tw/2),ny=Math.round(py)-5;
    const rf=formOf(c);RX.fillStyle=rf?'hsl('+Math.floor(t*90+c.uid*40)%360+',85%,58%)':'#c9961c';RX.fillRect(nx-1,ny-1,tw+2,8);RX.fillStyle=rf?'#fff0ff':'#fff3c4';RX.fillRect(nx,ny,tw,6);RX.fillStyle='#5a3a04';RX.textBaseline='top';RX.fillText(c.name,nx+2,ny+.4)} // khung tên vàng kim (phân thân không có khung tên)
  }
  if(e.emoT>0)drawEmo('heart',ex+8,by);
  else if(c.full<20&&!e.clone)drawEmo('excl',ex+10,by,'#d95a5a');
  else if(e.emo&&e.state!=='jump')drawEmo(e.emo,ex+8,by);
}
function drawRoom(){
  const g=RX;g.imageSmoothingEnabled=false;g.setTransform(ZC,0,0,ZC,0,0);g.clearRect(0,0,VW+1,VHV+1);g.translate(-Math.round(camX*ZC)/ZC,-Math.round(camY*ZC)/ZC);
  drawBg(g,cur);
  if(edit){g.fillStyle='rgba(50,30,18,.22)';for(let x=0;x<WORLD_W;x+=8)g.fillRect(x,0,1/ZC,VH);for(let y=0;y<VH;y+=8)g.fillRect(0,y,WORLD_W,1/ZC)} // lưới hỗ trợ xếp đồ
  const its=itemsIn(cur);
  its.filter(i=>FURN[i.fid].kind==='rug').forEach(drawItem);
  its.filter(i=>FURN[i.fid].kind==='wall').forEach(drawItem);
  const list=its.filter(i=>FURN[i.fid].kind==='floor').map(i=>({y:i.y,f:()=>drawItem(i)}));
  ents.forEach(e=>{const p=entPos(e);list.push({y:p.sy,f:()=>drawEnt(e,p)})});
  list.sort((a,b)=>a.y-b.y).forEach(o=>o.f());
  drawParts(g);
  g.setTransform(ZC,0,0,ZC,0,0);
  g.fillStyle='rgba(150,100,70,.5)';const my=Math.round(VHV/2);
  if(camX<WORLD_W-VW-1)for(let i=0;i<4;i++)g.fillRect(VW-7+i,my-4+i,1,8-2*i);
  if(camX>1)for(let i=0;i<4;i++)g.fillRect(6-i,my-4+i,1,8-2*i);
}
/* --- chuột/chạm: kéo để cuộn, chạm mèo để vuốt, chế độ sắp xếp thì kéo đồ --- */
let ptr=null,pinch=0;const PT=new Map();
const ppos=ev=>{const b=room.getBoundingClientRect();return {x:(ev.clientX-b.left-room.clientLeft)/room.clientWidth*VW,y:(ev.clientY-b.top-room.clientTop)/room.clientHeight*VHV}};
const pdist=()=>{const a=[...PT.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};
function hitItem(wx,y){
  const order={rug:0,wall:1,floor:2};
  return itemsIn(cur).slice().sort((a,b)=>(order[FURN[b.fid].kind]-order[FURN[a.fid].kind])||(b.y-a.y)).find(i=>{const f=FURN[i.fid];return wx>=i.x-f.w/2-2&&wx<=i.x+f.w/2+2&&y>=i.y-f.h-2&&y<=i.y+2});
}
room.addEventListener('pointerdown',ev=>{
  PT.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
  if(PT.size===2){ptr=null;pinch=pdist();return}
  const p=ppos(ev);ptr={x0:p.x,y0:p.y,cx:camX,cy:camY,moved:false,item:null};
  try{room.setPointerCapture(ev.pointerId)}catch(e){}
  if(edit){const it=hitItem(p.x+camX,p.y+camY);sel=it?it.iid:null;if(it){ptr.item=it;ptr.ox=it.x-(p.x+camX);ptr.oy=it.y-(p.y+camY)}renderPanel()}
});
room.addEventListener('pointermove',ev=>{
  if(PT.has(ev.pointerId))PT.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
  if(PT.size===2){const d=pdist();if(pinch&&d>pinch*1.22){zoomStep(1,.5,.5);pinch=d}else if(pinch&&d<pinch*.82){zoomStep(-1,.5,.5);pinch=d}return} // chụm 2 ngón để zoom
  if(!ptr)return;const p=ppos(ev);
  if(Math.abs(p.x-ptr.x0)+Math.abs(p.y-ptr.y0)>2.5)ptr.moved=true;
  if(!ptr.moved)return;
  if(ptr.item){ptr.item.x=Math.round((p.x+camX+ptr.ox)/4)*4;ptr.item.y=Math.round((p.y+camY+ptr.oy)/4)*4;clampItem(ptr.item);if(p.x>VW-14)camX+=3;if(p.x<14)camX-=3;clampCam()}
  else{if(fol)unfollow(false);ret=null;zan=null;camX=ptr.cx-(p.x-ptr.x0);camY=ptr.cy-(p.y-ptr.y0);clampCam()}
});
function ptrEnd(ev){
  PT.delete(ev.pointerId);
  if(!ptr)return;const p=ppos(ev),was=ptr;ptr=null;
  if(was.item){save();return}
  if(was.moved||edit)return;
  const wx=p.x+camX,wy=p.y+camY,hit=ents.filter(e=>!e.ghost).map(e=>({e,p:entPos(e)})).sort((a,b)=>b.p.sy-a.p.sy).find(o=>wx>=o.p.x-12&&wx<=o.p.x+12&&wy>=o.p.y-35&&wy<=o.p.y+1);
  if(!hit){unfollow(true);return} // chạm khoảng trống: thôi theo dõi, camera về chỗ cũ
  if(hit.e.clone){poof(hit.p.x,hit.p.y);hit.e.dead=1;return} // chạm vào phân thân của Naruto: tan thành khói
  const c=catBy(hit.e.uid);hit.e.emoT=1.5;follow(c.uid);
  const n=petCat(c);
  if(n){toast('kêu grừ grừ… ❤️ +'+3*(tE(c,'petHappy')||1)+' độ vui',{type:'pet',title:c.name,coins:n});render()}
}
room.addEventListener('pointerup',ptrEnd);room.addEventListener('pointercancel',ev=>{PT.delete(ev.pointerId);if(ptr&&ptr.item)save();ptr=null});
// Lăn chuột trên khung phòng thì cuộn trang như bình thường. Giữ Ctrl (hoặc ⌘, hoặc chụm hai ngón trên bàn di chuột) rồi lăn mới zoom quanh con trỏ.
let wheelHint=0;
room.addEventListener('wheel',ev=>{
  if(!(ev.ctrlKey||ev.metaKey)){if(!wheelHint&&ZMIN){wheelHint=1;toast('Giữ Ctrl rồi lăn chuột để phóng to, thu nhỏ phòng. Lăn chuột thường để cuộn trang.',{icon:'🔍',ms:4200})}return}
  ev.preventDefault();const p=ppos(ev);zoomStep(ev.deltaY<0?1:-1,p.x/VW,p.y/VHV);
},{passive:false});

/* ============ HÀNH ĐỘNG ============ */
function openFeed(){
  const cats=homeCats(cur),ready=bowlsIn(cur).filter(b=>now()>=(b.at||0)),sv=ready.reduce((a,b)=>a+FURN[b.fid].bowl.cap,0);
  if(!cats.length){toast('Phòng này không có bé nào ở nhà.');return}
  if(!ready.length){toast(bowlsIn(cur).length?'Các bát chưa sẵn sàng.':'Phòng này chưa có bát ăn. Mua ở Cửa hàng, mục Bát ăn.',{type:'warn'});return}
  const price=f=>ready.reduce((a,b)=>a+bowlCost(b,f.id),0);
  modal('<h3>Cho '+ROOM[cur].n+' ăn gì?</h3><div class="dim">Đổ đầy '+ready.length+' bát ('+sv+' suất) cho '+cats.length+' bé. Mỗi bé ăn một suất rồi cảm ơn bạn vài xu. Bạn chỉ trả cho số suất cần đổ thêm; nếu đổi sang món khác thì phần thừa trong bát bị bỏ. Bát đổ lại được sau 10 phút.'+(sv<cats.length?'<br><b style="color:var(--bad)">Thiếu bát ăn: '+(cats.length-sv)+' bé sẽ không có suất. Mua thêm bát ở Cửa hàng.</b>':'')+'</div><br>'+
    FOODS.map(f=>{const lv=cats.filter(c=>favs(c).includes(f.id)).map(c=>esc(c.name)),pr=price(f),nd=ready.reduce((a,b)=>a+bowlNeed(b,f.id),0);
      return '<div class="card"><div style="font-size:26px">'+f.ic+'</div><div class="g"><b>'+f.n+'</b><br><small>'+f.d+'<br>Đổ thêm '+nd+' suất'+(nd<sv?' (trong bát còn '+(sv-nd)+')':'')+(lv.length?'<br>❤ Khoái khẩu của: '+lv.join(', '):'')+'</small></div><button class="sm" '+(S.coins<pr?'disabled':'')+' onclick="doFeed(\''+f.id+'\')">🪙 '+pr+'</button></div>'}).join('')+
    '<button onclick="closeModal()">Đóng</button>');
}
function doFeed(fid){
  const r=feedRoom(cur,fid); if(!r)return;
  dispel(); // cho ăn thì mọi phân thân của Naruto trong phòng biến lại thành một
  closeModal();
  toast(r.n+' bé chạy ra ăn và cảm ơn bạn'+(r.loved.length?' · ❤️ món khoái khẩu của '+r.loved.join(', '):''),{type:'feed',title:FOOD[fid].n+' · '+r.bowls+' bát · '+ROOM[cur].n,coins:r.coins});
  if(r.miss>0)toast(r.miss+' bé chưa có suất. Mỗi bát chỉ đủ cho số suất ghi trên bát, hãy mua thêm bát.',{type:'warn',title:'Thiếu bát ăn'});
  render();
}
let pk={slot:0,dest:'alley'};
function openPicker(slot){pk.slot=slot;if(DEST[pk.dest].lvl>S.level)pk.dest='alley';drawPicker()}
function drawPicker(){
  const d=DEST[pk.dest],night=isNight();
  const cats=S.cats.filter(c=>!onTrip(c.uid)).map(c=>({c,inf:tripInfo(c,pk.dest)})).sort((a,b)=>(a.inf.why?1:0)-(b.inf.why?1:0)||b.inf.est-a.inf.est);
  modal('<h3>Điểm đến</h3><div class="row wrap" style="justify-content:center">'+
    DESTS.map(x=>'<button class="sm '+(x.id===pk.dest?'on':'')+'" '+(x.lvl>S.level?'disabled':'')+' onclick="pk.dest=\''+x.id+'\';drawPicker()">'+x.ic+' '+x.n+(x.lvl>S.level?' 🔒 cấp '+x.lvl:'')+'</button>').join('')+
    '</div><div class="dim" style="margin-top:6px">'+d.min+' phút · '+d.coin+' xu gốc · tốn '+d.en+'⚡'+(d.tags.length?' · '+d.tags.map(t=>TAGN[t]).join(', '):'')+' · bây giờ là '+(night?'ban đêm 🌙':'ban ngày ☀')+'</div><h3>Chọn mèo</h3>'+
    (cats.length?cats.map(o=>{const c=o.c,sp=SP[c.sp];
      return '<div class="card '+(o.inf.why?'':'tap')+'" style="'+(o.inf.why?'opacity:.5':'')+'" '+(o.inf.why?'':'onclick="doTrip('+c.uid+')"')+'>'+catTag(lk(c),1)+'<div class="g">'+nm(c)+' '+sexIc(c)+' '+starsC(c)+'<br><small>'+kind(c)+' · '+(o.inf.why||('~'+o.inf.est+' xu · '+fmt(o.inf.dur)+' · −'+o.inf.cost+'⚡'))+'</small><br>'+stats(c)+'</div></div>'}).join(''):'<div class="dim">Không còn bé nào ở nhà.</div>')+
    '<button onclick="closeModal()">Đóng</button>');
}
function doTrip(uid){
  if(!startTrip(pk.slot,uid,pk.dest))return;
  closeModal();syncEnts();render();toast('lên đường tới '+DEST[pk.dest].n,{type:'trip',title:catBy(uid).name});
}
function doClaim(slot){const r=claimTrip(slot);if(!r)return;syncEnts();render();showPop(r)}
function doClaimAll(){S.trips.forEach((p,i)=>{if(p&&now()>=p.end){const r=claimTrip(i);if(r)showPop(r)}});syncEnts();render()}
/* --- popup trở về --- */
const popQ=[];let popOn=false;
function showPop(r){popQ.push(r);if(!popOn)nextPop()}
function nextPop(){
  const r=popQ.shift(),el=$('pop'); if(!r){popOn=false;return}
  popOn=true;
  el.innerHTML='<div class="hd">🎒 '+esc(r.cat.name)+' đã về từ '+r.dest.n+'!</div><div class="row">'+catTag(lk(r.cat),2)+'<div style="flex:1;text-align:left">'+
    '<div class="big">+'+(r.coins+r.bonus)+' 🪙</div><div class="dim">Ngậm theo '+r.item+' · +'+r.xp+' kinh nghiệm'+(r.ticket?'<br>🎟 Nhặt được 1 vé gacha!':'')+'</div></div></div>'+
    (r.acts.length?'<div style="text-align:left;margin-top:6px"><span class="dim">Trait đã kích hoạt:</span><br>'+r.acts.map(a=>tagOf(a.t,a.txt)).join('')+'</div>':'<div class="dim" style="text-align:left;margin-top:6px">Chuyến này không có trait nào kích hoạt.</div>')+
    '<div style="text-align:right;margin-top:8px"><button class="go sm" onclick="closePop()">Nhận'+(popQ.length?' (còn '+popQ.length+')':'')+'</button></div>';
  requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('on')));
}
function closePop(){$('pop').classList.remove('on');setTimeout(nextPop,380)}

/* --- gacha --- */
const gz={timers:[],cat:null,parts:[],raf:0,done:true};
const gp=$('gp'),GX=gp.getContext('2d');
// tiền rơi của Thần Tài: đồng xu xoay quanh trục dọc, thỏi vàng hình thang, tờ tiền bay lượn
function drawMoney(p,f){
  p.a+=p.va*f;const z=p.sz;GX.save();GX.translate(Math.round(p.x),Math.round(p.y));GX.lineWidth=2;
  if(p.t==='coin'){const w=Math.max(.16,Math.abs(Math.cos(p.a)));GX.fillStyle='#f2c230';GX.strokeStyle='#a86a08';GX.beginPath();GX.ellipse(0,0,z*w,z,0,0,6.283);GX.fill();GX.stroke();GX.fillStyle='#fff3b0';GX.fillRect(-z*w*.4,-z*.5,Math.max(1.5,z*w*.3),z*.55)}
  else if(p.t==='bar'){GX.rotate(Math.sin(p.a)*.35);GX.fillStyle='#ffd24a';GX.strokeStyle='#9a6410';GX.beginPath();GX.moveTo(-z,z*.4);GX.lineTo(z,z*.4);GX.lineTo(z*.7,-z*.4);GX.lineTo(-z*.7,-z*.4);GX.closePath();GX.fill();GX.stroke();GX.fillStyle='#fff3b0';GX.fillRect(-z*.5,-z*.24,z,z*.15)}
  else{GX.rotate(Math.sin(p.a)*.9);GX.scale(1,.35+.65*Math.abs(Math.cos(p.a*.7)));GX.fillStyle='#8fd69a';GX.strokeStyle='#2f7a45';GX.fillRect(-z,-z*.5,2*z,z);GX.strokeRect(-z,-z*.5,2*z,z);GX.fillStyle='#e4f7d2';GX.beginPath();GX.arc(0,0,z*.3,0,6.283);GX.fill()}
  GX.restore();
}
function gpLoop(){
  if(!$('gz').classList.contains('on')){gz.raf=0;gz.parts=[];return}
  if(gp.width!==innerWidth||gp.height!==innerHeight){gp.width=innerWidth;gp.height=innerHeight}
  GX.clearRect(0,0,gp.width,gp.height);
  gz.parts=gz.parts.filter(p=>p.life>0);
  const tn=performance.now(),f=Math.min(3,(tn-(gz.t0||tn))/16.667);gz.t0=tn; // f = số khung 60fps đã trôi qua, để tốc độ hạt đều trên mọi máy
  if(gz.parts.length>700)gz.parts.splice(0,gz.parts.length-700);
  gz.parts.forEach(p=>{p.x+=p.vx*f;p.y+=p.vy*f;p.vy+=p.g*f;p.life-=f;GX.globalAlpha=Math.max(0,Math.min(1,p.life/20));if(p.t){drawMoney(p,f);return}GX.fillStyle=p.col;GX.fillRect(Math.round(p.x),Math.round(p.y),p.sz,p.sz)});
  GX.globalAlpha=1;gz.raf=requestAnimationFrame(gpLoop);
}
function sparkle(col,n){for(let i=0;i<n;i++)gz.parts.push({x:innerWidth/2+rnd(-90,90),y:innerHeight/2+rnd(-60,80),vx:rnd(-.6,.6),vy:rnd(-3,-1),g:0,life:rnd(25,50),col:Math.random()<.3?'#fff':col,sz:Math.random()<.5?4:8})}
function burst(x,y,col){for(let i=0;i<46;i++){const a=rnd(0,6.283),s=rnd(2,7);gz.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:.09,life:rnd(40,75),col:Math.random()<.25?'#fff':col,sz:Math.random()<.6?4:8})}}
/* --- intro riêng cho từng mèo 5★: chạy sau hiệu ứng 5★ chung, dài 2–4 giây, bỏ qua được --- */
let AC=null;
function tone(f,t0,d,type,v){const o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.value=f;g.gain.setValueAtTime(v||.05,t0);g.gain.exponentialRampToValueAtTime(.001,t0+d);o.connect(g);g.connect(AC.destination);o.start(t0);o.stop(t0+d)}
function snd(f){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();f(AC.currentTime+.05)}catch(e){}}
const seq=(notes,step,d,type,v)=>snd(t=>notes.forEach((f,i)=>{if(f)tone(f,t+i*step,d,type,v)}));
const glide=(f0,f1,d,type,v)=>snd(t=>{const o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);g.gain.setValueAtTime(v||.06,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d)});
/* Giọng meo tổng hợp, một chất giọng duy nhất cho mọi bé: sóng răng cưa (dây thanh) đi qua bộ lọc cộng hưởng mở dần rồi khép dần như miệng mèo
   ("m" ngậm miệng, "i-a" mở to và sáng, "o-u" khép lại), cao độ vút lên rồi rơi xuống, thêm chút hơi thở và rung tự nhiên.
   Mỗi bé chỉ khác nhau ở nhịp (mốc thời gian), trường độ d, cao độ f và đường uốn cao độ c. o: {f (Hz), d (giây), c (hệ số cao độ theo thời gian), v (âm lượng)}. */
let MEWW=null,MEWAC=null;
// dạng sóng mềm: bồi âm giảm nhanh nên tiếng trong, không rè như sóng răng cưa
const mewWave=()=>{if(MEWAC!==AC){MEWAC=AC;const im=new Float32Array([0,1,.42,.2,.1,.05,.025,.012]);MEWW=AC.createPeriodicWave(new Float32Array(im.length),im)}return MEWW};
const MEW_N=48,mewCurve=fn=>{const a=new Float32Array(MEW_N);for(let i=0;i<MEW_N;i++)a[i]=fn(i/(MEW_N-1));return a};
const mewLerp=(pts,x)=>{const p=x*(pts.length-1),i=Math.min(pts.length-2,Math.floor(p));return pts[i]+(pts[i+1]-pts[i])*(p-i)};
const mewKey=(ks,x)=>{let i=0;while(i<ks.length-2&&x>ks[i+1][0])i++;const a=ks[i],b=ks[i+1],k=clamp((x-a[0])/(b[0]-a[0]),0,1);return a[1]*Math.pow(b[1]/a[1],k)}; // nội suy theo tỉ lệ (hợp với tần số)
const MEW_P=[[0,.86],[.12,.95],[.3,1.14],[.55,1.04],[1,.74]],          // cao độ: vút lên ở "i-a" rồi rơi dần
  MEW_LP=[[0,700],[.08,900],[.2,2600],[.36,3600],[.6,2600],[.85,1400],[1,900]], // độ mở miệng: tối, sáng bừng, rồi tối lại
  MEW_F2=[[0,950],[.1,1300],[.22,2700],[.42,1750],[.7,1100],[1,820]],   // formant thứ hai: m, i, a, o, u
  MEW_A=[[0,.3],[.08,.42],[.24,1],[.6,.92],[.86,.5],[1,.2]];             // độ to
function meow(o){snd(t=>{
  o=o||{};const d=o.d||.6,f=o.f||620,osc=AC.createOscillator(),lp=AC.createBiquadFilter(),bp=AC.createBiquadFilter(),bg=AC.createGain(),hp=AC.createBiquadFilter(),amp=AC.createGain(),env=AC.createGain(),out=AC.createGain();
  osc.setPeriodicWave(mewWave());osc.frequency.setValueCurveAtTime(mewCurve(x=>f*(o.c?mewLerp(o.c.length>1?o.c:[o.c[0],o.c[0]],x):mewKey(MEW_P,x))),t,d);
  [[5.2,.006]].forEach(q=>{const l=AC.createOscillator(),g=AC.createGain();l.frequency.value=q[0];g.gain.value=f*q[1];l.connect(g);g.connect(osc.frequency);l.start(t);l.stop(t+d+.06)}); // rung và run nhẹ của giọng thật
  lp.type='lowpass';lp.Q.value=.8;lp.frequency.setValueCurveAtTime(mewCurve(x=>mewKey(MEW_LP,x)),t,d);
  bp.type='bandpass';bp.Q.value=1.6;bp.frequency.setValueCurveAtTime(mewCurve(x=>mewKey(MEW_F2,x)),t,d);bg.gain.value=.35;
  hp.type='highpass';hp.frequency.value=260;
  osc.connect(lp);lp.connect(hp);osc.connect(bp);bp.connect(bg);bg.connect(hp);
  amp.gain.setValueCurveAtTime(mewCurve(x=>mewKey(MEW_A,x)),t,d);
  env.gain.setValueAtTime(.0001,t);env.gain.linearRampToValueAtTime(1,t+Math.min(.04,d*.15));env.gain.setValueAtTime(1,t+d*.8);env.gain.exponentialRampToValueAtTime(.001,t+d+.05);
  hp.connect(amp);amp.connect(env);env.connect(out);out.gain.value=(o.v||.2)*.6;out.connect(AC.destination);
  osc.start(t);osc.stop(t+d+.06);
})}
// giọng meo của từng bé trong intro: [mốc thời gian tính từ đầu cảnh (ms), {f, d, c, v}]
const MEOW={
  v_goku:[[1150,{f:420,d:.8,c:[.8,1,1.2,1.4]}],[2000,{f:560,d:.6,c:[.9,1.3,1.2]}],[2800,{f:480,d:.2}],[3030,{f:520,d:.2}],[3260,{f:560,d:.2}],[3490,{f:600,d:.2}],
    [3750,{f:620,d:.95,c:[.95,1.3,1.3,1.25,1.05]}]],
  v_naruto:[[350,{f:700,d:.25}],[520,{f:780,d:.22,v:.14}],[640,{f:660,d:.22,v:.14}],[1050,{f:760,d:.16}],[1550,{f:820,d:.16}],[2050,{f:720,d:.16}],
    [2600,{f:520,d:.5,c:[.8,1,1.3]}],[3400,{f:680,d:.55,c:[.9,1.3,1.1]}],[4400,{f:700,d:.16}],[4560,{f:640,d:.16}],[4720,{f:820,d:.3}]],
  v_nyan:[0,1,2,3,4,5,6,7].map(i=>[150+i*300,{f:[880,988,1047,988][i%4],d:.2}]),
  v_maneki:[[500,{f:520,d:.8}],[1700,{f:560,d:.18}],[1880,{f:500,d:.18}],[2060,{f:440,d:.22}],[3300,{f:500,d:.9}]],
  v_harry:[[300,{f:720,d:.3}],[1300,{f:800,d:.5,c:[.9,1.25,1.15]}],[2300,{f:900,d:.85,c:[1.25,1.1,.8,.55]}],[3200,{f:560,d:.7,c:[1,.9,1.05,.85]}]],
  v_thunder:[[150,{f:420,d:.7,c:[1,.92,.8],v:.14}],[1250,{f:840,d:.22}],[2350,{f:540,d:.6,c:[1,.95,.8,.7],v:.14}]],
  v_gojo:[[750,{f:480,d:.8}],[2400,{f:440,d:.9}]],
  v_vader:[[1900,{f:330,d:1.1,c:[.95,1.05,1,.8]}],[2850,{f:350,d:.5}]],
  v_astro:[[400,{f:640,d:.45}],[3300,{f:700,d:.3}]],
  v_royal:[[900,{f:680,d:1.1,c:[.9,1.2,1.15,1,.85]}],[2400,{f:600,d:.18}],[2600,{f:700,d:.22}]],
  khaomanee:[[600,{f:800,d:.7}],[2100,{f:980,d:.28}]],
  lykoi:[[1500,{f:420,d:1.2,c:[.8,1.4,1.5,1.4,1.05]}],[2700,{f:720,d:.3,v:.14}]],
  savannah:[[300,{f:460,d:.5}],[1150,{f:640,d:.35,c:[.85,1.2,1.4]}],[2300,{f:480,d:.8}]],
  sokoke:[[400,{f:620,d:.25,v:.1}],[2050,{f:420,d:.6,c:[1,.95,.9],v:.12}],[2850,{f:740,d:.4}]],
  suphalak:[[1000,{f:560,d:.3,v:.08}],[1500,{f:600,d:.35,v:.1}],[2050,{f:680,d:.8}]],
};
const fxClear=()=>{const f=$('gfx');f.innerHTML='';f.style.background='';f.style.animation='';$('gfly').className=''};
function fxEl(css,html){const d=document.createElement('div');d.style.cssText='position:absolute;'+css;if(html)d.innerHTML=html;$('gfx').appendChild(d);return d}
const fxTint=bg=>{$('gfx').style.background=bg};
function bolt(x,col){
  const pts=[];let px=x;for(let y=0;y<=innerHeight*.78;y+=innerHeight*.065){pts.push(Math.round(px)+','+Math.round(y));px+=rnd(-38,38)}
  const d=fxEl('inset:0','<svg width="100%" height="100%"><polyline points="'+pts.join(' ')+'" fill="none" stroke="'+col+'" stroke-width="9" stroke-linejoin="bevel" opacity=".85"/><polyline points="'+pts.join(' ')+'" fill="none" stroke="#fff" stroke-width="3"/></svg>');
  setTimeout(()=>d.remove(),190);glide(1500,90,.22,'sawtooth',.05);
}
const part=o=>gz.parts.push(Object.assign({x:innerWidth/2,y:innerHeight/2,vx:0,vy:0,g:0,life:60,col:'#fff',sz:8},o));
const rain=(cols,n)=>{for(let k=0;k<(n||4);k++)part({x:rnd(0,innerWidth),y:-10,vx:rnd(-1.2,1.2),vy:rnd(2,5),g:.08,life:170,col:pick(cols)})};
const fount=(cols,n)=>{for(let k=0;k<(n||4);k++){const a=rnd(0,6.283),v=rnd(1.5,6);part({vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rnd(30,60),col:pick(cols),sz:Math.random()<.5?4:8})}};
const stars=n=>{for(let k=0;k<n;k++)part({x:rnd(0,innerWidth),y:rnd(0,innerHeight),life:rnd(15,40),sz:Math.random()<.6?4:8,col:pick(['#fff','#bcd0ff','#e6c8ff'])})};
function coinRain(){rain(['#f2c230','#f2c230','#fff3b0'],5)}
const every=(T,t0,t1,step,f)=>{for(let t=t0;t<t1;t+=step)T(t,f)};
/* --- dựng cảnh cho intro: sprite của bé ở tư thế bất kỳ, chữ lớn --- */
const sprSrc=(key,pose,k)=>{const n=kk(k),id=key+'|'+pose+'|'+n;return CI[id]||(CI[id]=catCv(key,pose,n).toDataURL())};
const pct=v=>typeof v==='number'?v+'%':v;
// đặt sprite sao cho tâm nằm ở (x, y) của màn hình (số là %, chuỗi là giá trị CSS). o.flip lật ngang, o.key đổi ngoại hình, o.img là CSS thêm cho ảnh
function fxSpr(pose,k,x,y,css,o){
  o=o||{};const key=o.key||lk(gz.cat),n=kk(k),d=DPR(),cv=catCv(key,pose,n),w=cv.lw*n/d,h=cv.lh*n/d;
  return fxEl('left:'+pct(x)+';top:'+pct(y)+';width:'+w+'px;height:'+h+'px;margin:'+(-h/2)+'px 0 0 '+(-w/2)+'px;'+(css||''),'<img class="px" src="'+sprSrc(key,pose,k)+'" style="width:100%;height:100%;display:block;'+(o.flip?'transform:scaleX(-1);':'')+(o.img||'')+'">');
}
const fxTxt=(txt,x,y,css,anim)=>fxEl('left:'+pct(x)+';top:'+pct(y)+';transform:translate(-50%,-50%);white-space:nowrap','<div style="font-weight:900;line-height:1;'+(css||'')+(anim?';animation:'+anim:'')+'">'+txt+'</div>');
const K5=()=>Math.max(3,Math.min(6,Math.floor(Math.min(innerWidth,innerHeight)/110))); // cỡ sprite trong intro: 3 trên điện thoại, tới 6 trên màn hình lớn
const cell=k=>kk(k)/DPR();                                                             // số điểm ảnh CSS của một ô gốc ở cỡ k
const mixc=(c,p,w)=>'color-mix(in srgb,'+c+' '+p+'%,'+(w||'#fff')+')';                 // pha màu trong CSS: p% màu c với trắng (hoặc màu w)
const money=(t,o)=>part(Object.assign({t,x:rnd(0,innerWidth),y:-24,vx:rnd(-1.2,1.2),vy:rnd(2.5,6),g:.09,life:150,a:rnd(0,6.283),va:rnd(.08,.22)*(Math.random()<.5?-1:1),sz:t==='coin'?rnd(7,11):t==='bar'?rnd(13,19):rnd(15,21)},o));
/* Mỗi bé 5★ có một cảnh riêng kể đúng "tính cách" của bé. Mọi thứ hẹn giờ qua T nên bấm Bỏ qua là dừng ngay. */
const INTRO={
  // Goku: cưỡi Cân Đẩu Vân bay tới, gồng mình hóa Siêu Saiyan (hai tai chuyển vàng, hào quang vàng), tụ chưởng "KA-ME-HA-ME" rồi "HAAA!": luồng chưởng xanh thổi bay nửa trên ngọn núi
  v_goku:{dur:5000,run(T){
    fxTint('linear-gradient(#58aef0 0,#a6dcf8 54%,#f2dca6 80%)');
    const k=K5(),d=cell(k),BASE='v_goku~gkBase',W=innerWidth,Hh=innerHeight,gx=W*.24,gy=Hh*.8-18*d,nsrc=nimbusCv(fk(kk(k))).toDataURL();
    [[10,13,1],[55,8,1.3],[82,19,.9]].forEach(c=>{const w=d*30*c[2];fxEl('left:'+c[0]+'%;top:'+c[1]+'%;width:'+w+'px;height:'+w*.3+'px;border-radius:50%;background:#fff;opacity:.8;box-shadow:'+w*.3+'px '+w*.09+'px 0 '+(-w*.05)+'px #fff,'+(-w*.28)+'px '+w*.1+'px 0 '+(-w*.07)+'px #fff;animation:floaty 2.4s ease-in-out infinite alternate')});
    fxEl('left:0;bottom:0;width:100%;height:20%;background:linear-gradient(#b98b58,#86603a)');
    // ngọn núi gồm hai mảnh: chân núi ở lại, nửa trên sẽ bị chưởng thổi bay
    const MW=46*d,MH=32*d,mx=W*.76,mc='left:'+(mx-MW/2)+'px;top:'+(Hh*.8-MH)+'px;width:'+MW+'px;height:'+MH+'px;background:linear-gradient(100deg,#a58462 0 47%,#765a40 47%);';
    fxEl(mc+'clip-path:polygon(0 100%,10% 66%,90% 66%,100% 100%)');
    const top=fxEl(mc+'clip-path:polygon(10% 66%,26% 30%,40% 16%,50% 0,61% 18%,74% 32%,90% 66%)');
    // 1. cưỡi Cân Đẩu Vân bay tới rồi nhảy xuống
    let cat=fxSpr('stand',k,gx+'px',(gy-6*d)+'px','z-index:2;animation:runIn .7s cubic-bezier(.2,.7,.3,1) both',{flip:1,key:BASE}),aur,orb;
    cat.insertAdjacentHTML('beforeend','<img class="px" src="'+nsrc+'" style="position:absolute;left:'+10*d+'px;top:'+34*d+'px;width:'+30*d+'px;height:'+11*d+'px;transform:scaleX(-1)">');
    glide(500,1100,.6,'sine',.04);
    T(800,()=>{cat.remove();
      fxEl('left:'+(gx-15*d)+'px;top:'+(gy+8*d)+'px;width:'+30*d+'px;height:'+11*d+'px;z-index:1;animation:nimAway .8s ease-in forwards','<img class="px" src="'+nsrc+'" style="width:100%;height:100%;display:block;transform:scaleX(-1)">');
      cat=fxSpr('sit',k,gx+'px',gy+'px','z-index:2;animation:pop .3s ease-out both',{key:BASE});seq([659,784],.08,.1,'square',.04)});
    // 2. gồng mình: đất đá bay lên, hào quang lớn dần, rồi hóa Siêu Saiyan
    T(1150,()=>{cat.style.animation='trem .09s linear infinite';glide(110,520,.85,'sawtooth',.05);
      fxTxt('HAAAAAA!!',50,20,'color:#fff;font-size:min(10vw,56px);text-shadow:0 0 16px #ffb000,3px 3px 0 #7a4a00','count .85s ease-out both');
      aur=fxEl('left:'+(gx-24*d)+'px;top:'+(gy-48*d)+'px;width:'+48*d+'px;height:'+68*d+'px;z-index:1;transform-origin:50% 100%;animation:auraUp .85s ease-in both','<div style="width:100%;height:100%;border-radius:50% 50% 44% 44%/70% 70% 30% 30%;background:radial-gradient(ellipse at 50% 72%,rgba(255,255,255,.95) 0,rgba(255,226,96,.8) 36%,rgba(255,186,40,0) 70%);transform-origin:50% 100%;animation:flick .11s linear infinite alternate"></div>')});
    every(T,1150,2000,40,()=>part({x:gx+rnd(-34,34)*d,y:Hh*.8-rnd(0,3)*d,vx:rnd(-.4,.4),vy:-rnd(2,6),life:rnd(18,36),col:pick(['#86603a','#c9a878','#ffe07a','#fff']),sz:Math.random()<.5?4:8}));
    T(2000,()=>{flash();cat.style.animation='none';cat.firstChild.src=sprSrc(SSJK,'sit',k);
      for(let i=0;i<46;i++){const a=rnd(0,6.283),s=rnd(2,8);part({x:gx,y:gy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(26,50),col:pick(['#ffd83a','#fff7c0','#fff']),sz:Math.random()<.5?4:8})}
      fxTxt('SIÊU SAIYAN!',50,20,'color:#ffe066;font-size:min(11vw,64px);letter-spacing:2px;text-shadow:0 0 18px #ffb000,4px 4px 0 #6a4a00','count .8s ease-out both');seq([523,659,784,1047,1319],.06,.16,'square',.05)});
    every(T,2000,4600,50,()=>part({x:gx+rnd(-16,16)*d,y:gy+rnd(-16,18)*d,vx:rnd(-.4,.4),vy:-rnd(2,5.5),life:rnd(14,30),col:pick(['#ffd83a','#fff7c0','#ffffff']),sz:Math.random()<.5?4:8}));
    // 3. tụ chưởng giữa hai chân trước
    const ox=gx+24*d,oy=gy+6*d,S=10*d;
    T(2750,()=>{cat.remove();cat=fxSpr('crouch1',k,gx+'px',gy+'px','z-index:2',{flip:1,key:SSJK});
      orb=fxEl('left:'+(ox-S/2)+'px;top:'+(oy-S/2)+'px;width:'+S+'px;height:'+S+'px;z-index:3;border-radius:50%;background:radial-gradient(circle,#fff 0,#cfeeff 38%,#48a8ff 72%,rgba(72,168,255,0) 100%);box-shadow:0 0 '+3*d+'px '+d+'px #7cc8ff;animation:kame 1s ease-in both')});
    ['KA','ME','HA','ME'].forEach((s,i)=>T(2750+i*250,()=>{fxTxt(s,26+i*16,14,'color:#cfeeff;font-size:min(9vw,54px);text-shadow:0 0 14px #2f86e6,3px 3px 0 #0a3a7a','pop .25s ease-out both');seq([330+i*110],.1,.2,'square',.05)}));
    every(T,2750,3750,45,()=>{const a=rnd(0,6.283),r=rnd(9,16)*d;part({x:ox+Math.cos(a)*r,y:oy+Math.sin(a)*r,vx:-Math.cos(a)*r/9,vy:-Math.sin(a)*r/9,life:9,col:pick(['#fff','#8fd0ff','#48a8ff']),sz:4})});
    // 4. bắn: luồng chưởng xuyên qua và thổi bay nửa trên ngọn núi
    T(3750,()=>{flash();cat.firstChild.src=sprSrc(SSJK,'stand',k);orb.style.animation='flick .08s linear infinite alternate';
      fxTxt('HAAA!!!',50,27,'color:#fff;font-size:min(13vw,76px);font-style:italic;text-shadow:0 0 18px #48a8ff,4px 4px 0 #0a3a7a','pop .25s ease-out both');
      fxEl('left:'+ox+'px;top:'+(oy-5.5*d)+'px;width:'+(W-ox+40)+'px;height:'+11*d+'px;z-index:3;border-radius:'+5.5*d+'px 0 0 '+5.5*d+'px;background:linear-gradient(rgba(72,168,255,0),#7cc8ff 20%,#fff 40% 60%,#7cc8ff 80%,rgba(72,168,255,0));box-shadow:0 0 '+5*d+'px '+1.5*d+'px rgba(124,200,255,.75);transform-origin:0 50%;animation:beam 1s ease-out both');
      glide(1800,120,1,'sawtooth',.06);$('gfx').style.animation='quake .25s linear 4'});
    T(3880,()=>{top.style.setProperty('--tx',W*.3+'px');top.style.setProperty('--ty',-Hh*.34+'px');top.style.setProperty('--rot','55deg');top.style.animation='shard 1.1s ease-out forwards';
      fxEl('left:'+(mx-MW*.4)+'px;top:'+(Hh*.8-MH*.34-3)+'px;width:'+MW*.8+'px;height:6px;border-radius:3px;background:#ffd08a;box-shadow:0 0 14px 5px #ff8a2a;animation:fadeIn .15s both');
      for(let i=0;i<46;i++){const a=rnd(-2.6,.2),s=rnd(3,11);part({x:mx+rnd(-18,18)*d,y:Hh*.8-MH*.5+rnd(-8,8)*d,vx:Math.cos(a)*s+3,vy:Math.sin(a)*s,g:.22,life:rnd(30,60),col:pick(['#765a40','#a58462','#ffd08a','#fff']),sz:Math.random()<.5?8:12})}
      glide(160,40,.8,'sawtooth',.07)});
    // 5. thu chưởng: trở lại đúng dạng của bé (trang phục hiếm Siêu Saiyan God thì bùng hào quang đỏ)
    T(4650,()=>{if(orb)orb.remove();if(aur)aur.remove();cat.remove();const rf=formOf(gz.cat);
      fxSpr('sit',k,gx+'px',gy+'px','z-index:2;animation:pop .35s ease-out both');
      if(rf){flash();for(let i=0;i<40;i++){const a=rnd(0,6.283),s=rnd(2,8);part({x:gx,y:gy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(26,50),col:pick(['#ff6a7a','#ffd0d6','#fff']),sz:Math.random()<.5?4:8})}}
      seq([784,988,1175,1568],.08,.16,'square',.04)});
  }},
  // Naruto: giữa rừng cây, kết ấn phân thân thành ba; cả ba nhảy qua các cành cây và bụi cỏ áp sát kẻ địch; hai phân thân tan thành khói, bản thể tụ Rasengan rồi ném thẳng vào địch
  v_naruto:{dur:5200,run(T){
    fxTint('linear-gradient(#10301a,#3a7036)');
    const k=K5(),d=cell(k),key=lk(gz.cat),W=innerWidth,Hh=innerHeight,X=p=>W*p/100,gy=Hh*.8-18*d,GR=['#1f5a2a','#2c7236','#18481f','#368542','#2a6a33'],LF=['#6fd26f','#3f9a55','#b5e08a','#2c7236'];
    [3,21,48,72,92].forEach((x,i)=>fxEl('left:'+x+'%;top:0;width:'+(i%2?4:7)+'vw;height:100%;background:linear-gradient(90deg,#2e2014,#54391f 55%,#2e2014);opacity:.85'));
    [33,60].forEach((x,i)=>fxEl('left:'+x+'%;top:-10%;width:11vw;height:120%;background:linear-gradient(rgba(240,240,170,.22),transparent 85%);transform:skewX(-14deg);animation:fadeIn 1.2s '+i*.4+'s ease-out both'));
    fxEl('left:0;top:0;width:100%;height:13%;background:radial-gradient(ellipse 16vw 100% at 12% 0,#18481f 98%,transparent),radial-gradient(ellipse 20vw 100% at 40% 0,#1f5a2a 98%,transparent),radial-gradient(ellipse 18vw 100% at 68% 0,#18481f 98%,transparent),radial-gradient(ellipse 16vw 100% at 92% 0,#1f5a2a 98%,transparent)');
    fxEl('left:0;bottom:0;width:100%;height:20%;background:#0d2612');
    const blob=(c,i)=>'<div style="position:absolute;left:'+c[0]+'%;top:'+c[1]+'%;width:'+c[2]+'%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at 35% 30%,'+GR[(i+3)%5]+','+GR[i%5]+' 70%)"></div>',
      bush=(x,w,z)=>fxEl('left:'+(x-w/2)+'px;top:'+(Hh*.83-.62*w)+'px;width:'+w+'px;height:'+.62*w+'px;overflow:hidden;z-index:'+z,[[50,56,62],[22,72,46],[78,72,46],[36,39,44],[66,41,42]].map(blob).join(''));
    // cành cây: [tâm x theo %, mặt trên theo % chiều cao, dài theo vw]; bTop(i) là chỗ đứng trên cành
    const BR=[[22,37,26],[45,50,22],[65,29,24]],bTop=i=>[X(BR[i][0]),Hh*BR[i][1]/100-18*d];
    BR.forEach(b=>{const w=W*b[2]/100;fxEl('left:'+(X(b[0])-w/2)+'px;top:'+b[1]+'%;width:'+w+'px;height:'+2.6*d+'px;border-radius:'+1.3*d+'px;background:linear-gradient(#6e4c2c,#49311b)',
      [[3,30,5],[97,20,6],[86,120,4.4]].map((c,i)=>'<div style="position:absolute;left:'+c[0]+'%;top:'+c[1]+'%;width:'+c[2]*d+'px;height:'+c[2]*d*.66+'px;transform:translate(-50%,-50%);border-radius:50%;background:'+GR[i+1]+'"></div>').join(''))});
    const smoke=(x,y,n)=>{for(let i=0;i<(n||18);i++)part({x:x+rnd(-12,12)*d,y:y+rnd(-14,12)*d,vx:rnd(-2.4,2.4),vy:-rnd(.4,2.6),life:rnd(22,44),col:pick(SMOKE),sz:Math.random()<.5?8:12})},
      leaf=(x,y)=>part({x:x+rnd(-20,20)*d,y:y+rnd(-8,8)*d,vx:rnd(-3,3),vy:-rnd(1,4),g:.16,life:rnd(26,46),col:pick(LF),sz:Math.random()<.5?4:8});
    // ba Naruto: bản thể R đi đường giữa, phân thân A đi đường trên cành cao, phân thân C nhảy qua các bụi cỏ
    const mk=p=>({p,el:null}),R=mk([X(26),gy]),A=mk([X(26)-22*d,gy]),C=mk([X(26)+22*d,gy]),cx0=C.p[0];
    const put=(o,pose,css)=>{if(o.el)o.el.remove();o.el=fxSpr(pose,k,o.p[0]+'px',o.p[1]+'px','z-index:2;'+(css||''),{flip:pose!=='sit'})};
    const hop=(o,to,t0,dur,arc)=>{
      T(t0,()=>{if(o.el)o.el.remove();
        o.el=fxSpr('leap1',k,o.p[0]+'px',o.p[1]+'px','z-index:2;--dx:'+(to[0]-o.p[0])+'px;--dy:'+(to[1]-o.p[1])+'px;animation:hopTo '+dur+'ms linear both',{flip:1,img:'--dy:'+(-arc)+'px;animation:leapY '+dur+'ms both'});
        o.p=to;glide(320,900,dur/1000*.8,'triangle',.035)});
      T(t0+dur*.55,()=>{if(o.el)o.el.firstChild.src=sprSrc(key,'leap2',k)});
      T(t0+dur,()=>{put(o,'land1');for(let i=0;i<5;i++)leaf(to[0],to[1]+16*d)})};
    bush(X(8),30*d,1);bush(X(70),26*d,1);[8.5,26].forEach(o=>bush(cx0+o*d,15*d,3));
    // kẻ địch: ninja phản bội đứng chờ bên phải
    const EX=X(86),EK={key:'x_rogue',img:'filter:drop-shadow(0 0 8px #d03a4a)'},en=fxSpr('sit',k,EX+'px',gy+'px','z-index:2;animation:pop .4s .7s ease-out both',EK);
    T(1500,()=>{en.style.animation='shH .5s linear infinite'});
    // cảnh 1: kết ấn, hai phân thân hiện ra trong khói
    put(R,'sit','animation:pop .35s ease-out both');seq([523,659,784],.07,.1,'square',.04);
    T(350,()=>fxTxt('ẢNH PHÂN THÂN!',50,18,'color:#ffe07a;font-size:min(9vw,52px);letter-spacing:2px;text-shadow:0 0 14px #f08a2a,3px 3px 0 #5a2a00','count 1.5s ease-out both'));
    T(500,()=>{[A,C].forEach(o=>{smoke(o.p[0],o.p[1]);put(o,'sit','animation:pop .3s ease-out both')});glide(900,200,.25,'square',.04)});
    // cảnh 2: cả ba nhảy qua cành cây và bụi cỏ
    hop(A,bTop(0),1050,480,16*d);hop(A,bTop(2),1700,520,12*d);
    hop(R,bTop(1),1150,480,14*d);hop(R,[X(52),gy],1800,480,10*d);
    hop(C,[cx0+17*d,gy],1100,360,13*d);hop(C,[cx0+35*d,gy],1560,360,13*d);
    // cảnh 3: hai phân thân tan thành khói, bản thể tụ Rasengan
    const S=12*d,rx=()=>R.p[0]+25*d,ry=()=>R.p[1]+5*d;let orb;
    T(2400,()=>{[A,C].forEach(o=>{smoke(o.p[0],o.p[1]);if(o.el)o.el.remove()});glide(700,160,.25,'square',.04);put(R,'crouch1')});
    T(2500,()=>{orb=fxEl('left:'+(rx()-S/2)+'px;top:'+(ry()-S/2)+'px;width:'+S+'px;height:'+S+'px;z-index:3;animation:kame .8s ease-out both','<div style="width:100%;height:100%;border-radius:50%;background:conic-gradient(#fff,#8fd0ff,#2f86e6,#fff,#8fd0ff,#2f86e6,#fff);box-shadow:0 0 '+3*d+'px '+d+'px #7cc8ff,inset 0 0 '+2*d+'px #fff;animation:spin .22s linear infinite"></div>');glide(240,1400,.8,'sine',.05)});
    every(T,2500,3350,40,()=>{const a=rnd(0,6.283),r=rnd(10,18)*d;part({x:rx()+Math.cos(a)*r,y:ry()+Math.sin(a)*r,vx:-Math.cos(a)*r/9,vy:-Math.sin(a)*r/9,life:9,col:pick(['#fff','#8fd0ff','#2f86e6']),sz:4})});
    T(3000,()=>fxTxt('RASENGAN!',50,18,'color:#bfe8ff;font-size:min(13vw,76px);letter-spacing:3px;font-style:italic;text-shadow:0 0 18px #2f86e6,4px 4px 0 #0a3a7a','skewIn 1.5s ease-out both'));
    // cảnh 4: ném Rasengan trúng địch, địch bị thổi bay
    T(3400,()=>{put(R,'stand');orb.style.setProperty('--dx',(EX-rx())+'px');orb.style.setProperty('--dy',(-3*d)+'px');orb.style.animation='hopTo .36s ease-in forwards';glide(1400,300,.36,'sawtooth',.05)});
    T(3760,()=>{flash();orb.remove();en.remove();
      fxEl('left:'+(EX-7*d)+'px;top:'+(gy-7*d)+'px;width:'+14*d+'px;height:'+14*d+'px;z-index:3;border-radius:50%;background:radial-gradient(circle,#fff 0,#8fd0ff 45%,rgba(47,134,230,0) 72%);animation:ring .55s ease-out forwards');
      fxSpr('sit',k,EX+'px',gy+'px','z-index:2;--tx:'+Math.min(30*d,W*.2)+'px;--ty:'+(-Hh*.55)+'px;--rot:560deg;animation:shard 1s ease-out both',EK);
      for(let i=0;i<50;i++){const a=i*.5,s=2+i*.14;part({x:EX,y:gy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(24,46),col:pick(['#fff','#8fd0ff','#2f86e6']),sz:Math.random()<.5?4:8})}
      smoke(EX,gy,14);for(let i=0;i<14;i++)leaf(EX,gy);glide(600,50,.7,'sawtooth',.06)});
    T(4350,()=>{put(R,'sit','animation:pop .35s ease-out both');seq([784,988,1175,1568],.08,.16,'square',.04);
      fxTxt('Dattebayo!',50,18,'color:#ffe07a;font-size:min(9vw,48px);text-shadow:0 0 14px #f08a2a,3px 3px 0 #5a2a00','pop .35s ease-out both')});
    every(T,0,5100,90,()=>rain(LF,1));
  }},
  // Nyan Cat: bay ngang trời sao pixel kéo cầu vồng, chữ "nya" chạy ngược chiều
  v_nyan:{dur:2700,run(T){
    fxTint('linear-gradient(#0b1a4a,#1d2f7a)');
    for(let i=0;i<16;i++)fxTxt('✦',rnd(4,96),rnd(6,94),'color:'+pick(['#fff','#ffe07a','#9cd0ff'])+';font-size:'+Math.round(rnd(12,26))+'px','twk '+rnd(.3,.6).toFixed(2)+'s '+rnd(0,.4).toFixed(2)+'s ease-in-out infinite alternate');
    fxEl('left:0;bottom:12%;white-space:nowrap;font-size:min(7vw,40px);font-weight:900;letter-spacing:3px;color:#ffd6f0;text-shadow:3px 3px 0 #e2489a;animation:marq 2.7s linear both','NYA NYA NYA NYA NYA NYA NYA NYA~');
    const f=$('gfly');f.innerHTML='<div class="fl" style="animation-duration:2.4s"><div class="rb"></div><img class="px" src="'+catSrc(lk(gz.cat),3)+'"></div>';f.className='';void f.offsetWidth;f.className='go';
    seq([659,784,1047,784,659,784,1175,988,1047,1319,1175,988,1047,784,659,523,587,784,988,784,1047,1319,1568,2093,1568,2093,2637],.085,.08);
    every(T,0,2600,100,()=>{for(let k=0;k<4;k++)part({x:rnd(0,innerWidth),y:rnd(0,innerHeight),vx:-rnd(3,7),life:rnd(20,40),sz:Math.random()<.5?4:8})});
  }},
  // Thần Tài: hai câu đối TÀI – LỘC buông xuống, bé vẫy tay, đồng vàng lớn rơi vào lòng; mưa tiền dày đặc (xu xoay, thỏi vàng, tiền giấy) và đống vàng dâng lên dưới chân
  v_maneki:{dur:4400,run(T){
    fxTint('radial-gradient(circle,#8a1c1c 0,#2a0808 78%)');
    const ban=(x,t,dl)=>fxEl('left:'+x+'%;top:0;width:min(15vw,84px);margin-left:max(-7.5vw,-42px);height:58vh;background:#c0281e;border:4px solid #f2c230;border-top:0;border-radius:0 0 12px 12px;color:#ffe07a;font-size:min(10vw,56px);font-weight:900;line-height:1.25;display:flex;align-items:center;justify-content:center;text-align:center;text-shadow:0 3px 0 #7a1410;animation:drop .7s '+dl+'s cubic-bezier(.34,1.4,.64,1) both','<div>'+t.split('').join('<br>')+'</div>');
    ban(13,'TÀI',0);ban(87,'LỘC',.15);
    fxEl('left:50%;bottom:0;width:150vw;height:24vh;margin-left:-75vw;border-radius:50% 50% 0 0;background:radial-gradient(ellipse at 50% 0,#fff3b0 0,#f2c230 40%,#b87a12 100%);box-shadow:0 0 44px #ffd24a;transform-origin:50% 100%;animation:unroll 3.4s .4s cubic-bezier(.2,.7,.3,1) both');
    const k=K5(),d=cell(k);
    fxSpr('sit',k,50,58,'animation:wave .45s ease-in-out infinite alternate;transform-origin:50% 90%');
    T(500,()=>fxEl('left:50%;top:58%;width:'+12*d+'px;height:'+12*d+'px;margin:'+(-34*d)+'px 0 0 '+(-6*d)+'px;animation:drop .9s cubic-bezier(.3,1.3,.6,1) both','<div style="width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3b0,#f2c230 55%,#c98a12);border:3px solid #a86a08;box-shadow:0 0 26px #ffd24a;animation:coinSpin 1.2s linear infinite"></div>'));
    every(T,0,4250,45,()=>{money('coin');money('coin');if(ch(.55))money('coin',{sz:rnd(12,16)});if(ch(.32))money('bar');if(ch(.4))money('bill',{vy:rnd(1.6,3.2),g:.015,vx:rnd(-2.4,2.4)})});
    [0,700,1400,2100,2800,3500].forEach(t=>T(t,()=>seq([1319,1568,2093,2637],.08,.3,'sine',.07)));
    [2200,3300].forEach(t=>T(t,()=>{for(let i=0;i<6;i++)fount(['#f2c230','#fff3b0','#ffd24a'],8);
      for(let i=0;i<26;i++)money(pick(['coin','coin','bar']),{x:innerWidth/2+rnd(-40,40),y:innerHeight*.5,vx:rnd(-7,7),vy:-rnd(5,12),g:.25});
      seq([2093,2637,3136,4186],.07,.4,'sine',.07)}));
  }},
  // Harry Potter: cưỡi chổi bay lộn nhào, xoay vòng loạn xạ khắp màn hình; sét đánh, mất lái, rơi xoáy xuống đất rồi ngồi dậy choáng váng
  v_harry:{dur:4100,run(T){
    fxTint('radial-gradient(circle at 50% 40%,#2a2466 0,#0a0818 78%)');
    fxEl('right:9%;top:8%;width:min(20vw,96px);height:min(20vw,96px);border-radius:50%;background:#f4f1dc;box-shadow:0 0 50px 16px rgba(244,241,220,.35)');
    for(let i=0;i<8;i++)fxEl('left:'+rnd(2,92).toFixed(1)+'%;top:0;font-size:'+Math.round(rnd(22,38))+'px;opacity:.8;animation:fallSpin '+rnd(1.6,2.4).toFixed(2)+'s '+(i*.28).toFixed(2)+'s linear both','✉️');
    const k=K5(),d=cell(k),W=50*d,Hh=40*d,
      broom='<div style="position:absolute;left:'+(-10*d)+'px;top:'+32*d+'px;width:'+70*d+'px;height:'+1.8*d+'px;border-radius:'+d+'px;background:linear-gradient(#b07a44,#7a4e24)"></div>'+
        '<div style="position:absolute;left:'+(-25*d)+'px;top:'+27.4*d+'px;width:'+18*d+'px;height:'+11*d+'px;background:repeating-linear-gradient(8deg,#e0b050 0 3px,#b8862c 3px 5px);clip-path:polygon(100% 38%,100% 62%,0 100%,12% 50%,0 0)"></div>'+
        '<div style="position:absolute;left:'+(-8.6*d)+'px;top:'+31*d+'px;width:'+2.4*d+'px;height:'+3.8*d+'px;background:#8a2a2a;border-radius:2px"></div>';
    const rider=fxSpr('crouch1',k,50,50,'animation:broomFly 2.3s linear both',{flip:1});rider.insertAdjacentHTML('beforeend',broom);
    let fall;
    [0,460,920,1380,1840].forEach((t,i)=>T(t,()=>glide(i%2?950:420,i%2?420:1050,.42,'triangle',.04)));
    seq([988,1319,1175,1568,1976],.15,.3,'sine',.04);
    every(T,0,2300,40,()=>{const r=rider.getBoundingClientRect();for(let i=0;i<2;i++)part({x:r.left+r.width/2+rnd(-12,12),y:r.top+r.height/2+rnd(-12,12),vx:rnd(-1,1),vy:rnd(-1,1),life:rnd(18,38),col:pick(['#ffe9a0','#fff','#f2c230','#b9a6ff']),sz:Math.random()<.5?4:8})});
    T(2150,()=>{bolt(innerWidth*.5,'#ffe066');flash()});
    T(2300,()=>{const r=rider.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;rider.remove();
      fall=fxSpr('leap2',k,cx+'px',cy+'px','--dx:'+Math.round(innerWidth/2-cx)+'px;--dy:'+Math.round(innerHeight*.62-cy)+'px;animation:tumble .8s cubic-bezier(.45,0,.9,.55) both',{flip:1});
      fxEl('left:'+cx+'px;top:'+cy+'px;width:'+W+'px;height:'+Hh+'px;margin:'+(-Hh/2)+'px 0 0 '+(-W/2)+'px;animation:broomAway 1s ease-in both',broom);
      fxTxt('MEOOO!?',50,18,'color:#ffe9a0;font-size:min(11vw,56px);letter-spacing:3px;text-shadow:0 0 14px #b9a6ff','count .9s ease-out both');
      glide(1500,170,.8,'sine',.06)});
    T(3100,()=>{fall.remove();fxSpr('sit',k,50,62,'animation:pop .4s ease-out both');
      fxEl('left:50%;top:62%;width:'+24*d+'px;height:'+24*d+'px;margin:'+(-31*d)+'px 0 0 '+(-12*d)+'px;transform:scaleY(.38)','<div style="position:relative;width:100%;height:100%;animation:spin .9s linear infinite">'+[0,1,2].map(i=>'<span style="position:absolute;left:'+Math.round(50+46*Math.cos(i*2.094))+'%;top:'+Math.round(50+46*Math.sin(i*2.094))+'%;transform:translate(-50%,-50%);color:#ffe066;font-size:'+6*d+'px;line-height:1;text-shadow:0 0 6px #fff">✦</span>').join('')+'</div>');
      for(let i=0;i<22;i++)part({x:innerWidth/2+rnd(-50,50),y:innerHeight*.62+18*d,vx:rnd(-6,6),vy:-rnd(.5,3.5),g:.12,life:rnd(22,40),col:pick(['#cfc8e6','#8a84a0','#fff']),sz:Math.random()<.5?4:8});
      snd(t=>{tone(70,t,.3,'sine',.16);tone(52,t+.04,.3,'sine',.12)});T(260,()=>seq([1568,1319,1047,1319,1568],.1,.2,'sine',.05))});
  }},
  // Zenitsu: đang ngủ gật "Z z z" thì mèo quỷ hiện ra; sét đánh, bé lao đi để lại dư ảnh, một nhát chém đôi mèo quỷ (tan biến), rồi lại ngồi ngủ
  v_thunder:{dur:3300,run(T){
    fxTint('radial-gradient(circle,#3a2c06 0,#120d02 75%)');
    const k=K5(),d=cell(k),sl=fxSpr('sleep0',k,50,56,'animation:bob 1s ease-in-out infinite alternate');
    [0,380,760].forEach((t,i)=>T(t,()=>{fxTxt('Z',56+i*3,44-i*4,'color:#ffe9a0;font-size:'+(26+i*10)+'px','zzz 1.1s ease-out both');glide(150,105,.3,'sine',.05)}));
    // mèo quỷ hiện ra bên phải, gầm gừ
    const DX=78,DM={key:'x_demon',img:'filter:drop-shadow(0 0 10px #b04aff)'},dm=fxSpr('sit',k,DX,56,'animation:pop .45s .4s ease-out both',DM);
    T(400,()=>glide(110,62,.6,'sawtooth',.05));
    T(880,()=>{dm.style.animation='shH .45s linear infinite'});
    every(T,400,1450,70,()=>part({x:innerWidth*DX/100+rnd(-14,14)*d,y:innerHeight*.56+rnd(-4,18)*d,vx:rnd(-.6,.6),vy:-rnd(.5,2),life:rnd(20,40),col:pick(['#6a3ab0','#2a1a44','#b04aff']),sz:Math.random()<.5?4:8}));
    T(1250,()=>{bolt(innerWidth*.5,'#ffd83a');flash();sl.remove();
      for(let i=0;i<6;i++)T(i*45,()=>fxSpr('run'+(i*2)%8,k,10+i*16,56,'animation:ghost .55s ease-out both',{flip:1,img:'filter:brightness(1.5) sepia(1) saturate(5) hue-rotate(5deg)'}));
      fxEl('left:0;top:56%;width:100%;height:7px;margin-top:-3px;background:#fff;box-shadow:0 0 26px 9px #ffd83a;transform-origin:left;animation:slash .5s ease-out forwards');glide(2400,200,.35,'sawtooth',.06)});
    // nhát chém đi qua người mèo quỷ: tia sét lóe lên, mèo quỷ đứt đôi theo đường chéo, hai nửa trượt ra rồi tan thành khói tím
    T(1440,()=>{bolt(innerWidth*DX/100,'#ffd83a');flash();dm.remove();
      [['polygon(0 0,100% 0,100% 40%,0 60%)',3,-6,13],['polygon(0 60%,100% 40%,100% 100%,0 100%)',-3,5,-9]].forEach(h=>fxSpr('sit',k,DX,56,'clip-path:'+h[0]+';--tx:'+h[1]*d+'px;--ty:'+h[2]*d+'px;--rot:'+h[3]+'deg;animation:cutHalf 1.05s ease-out both',DM));
      fxEl('left:'+DX+'%;top:56%;width:'+52*d+'px;height:5px;margin:-2px 0 0 '+(-26*d)+'px;background:#fff;box-shadow:0 0 18px 6px #ffd83a;transform:rotate(-12.5deg);animation:ghost .5s ease-out both');
      glide(700,55,.75,'sawtooth',.06)});
    every(T,1500,2500,50,()=>{for(let i=0;i<3;i++)part({x:innerWidth*DX/100+rnd(-16,16)*d,y:innerHeight*.56+rnd(-18,16)*d,vx:rnd(-1,1),vy:-rnd(1,4),life:rnd(25,50),col:pick(['#b04aff','#6a3ab0','#2a1a44','#ff5a8a']),sz:Math.random()<.5?4:8})});
    [1500,1750].forEach((t,i)=>T(t,()=>bolt(innerWidth*[.22,.6][i],'#ffd83a')));
    T(1650,()=>fxTxt('THẦN TỐC',50,28,'color:#ffe066;font-size:min(13vw,72px);letter-spacing:4px;font-style:italic;text-shadow:0 0 18px #ffb000,4px 4px 0 #6a4a00','skewIn 1.3s ease-out both'));
    T(2250,()=>{fxSpr('sit',k,50,56,'animation:pop .45s ease-out both');for(let i=0;i<5;i++)fount(['#ffd83a','#fff'],8)});
    every(T,1250,3200,45,()=>fount(['#ffd83a','#fff'],3));
  }},
  // Gojo: kéo băng mắt lộ đôi mắt xanh, cầu đỏ và cầu xanh nhập lại thành tím, lãnh địa bừng sáng
  v_gojo:{dur:3700,run(T){
    fxTint('radial-gradient(circle,#1d1247 0,#04030d 78%)');every(T,0,3600,60,()=>stars(5));
    const k=K5(),d=cell(k);let cat=fxSpr('sit',k,50,58,'animation:pop .45s ease-out both'),r,b;
    T(750,()=>{cat.remove();cat=fxSpr('sit',k,50,58,'',{key:lk(gz.cat)+'!open'});
      fxEl('left:50%;top:58%;width:'+22*d+'px;height:'+6*d+'px;margin:'+(-5.5*d)+'px 0 0 '+(-11*d)+'px;border-radius:50%;background:radial-gradient(#fff 0,#5ad0ff 45%,transparent 72%);animation:ring .7s ease-out forwards');
      seq([2093,3136],.09,.35,'sine',.06)});
    const orb=(c,a)=>fxEl('left:50%;top:28%;width:70px;height:70px;margin:-35px;border-radius:50%;background:radial-gradient(#fff 0,'+c+' 55%,transparent 72%);animation:'+a+' 1.3s ease-in forwards');
    T(1100,()=>{r=orb('#ff5a6a','orbL');b=orb('#5a8cff','orbR');glide(180,880,1.3,'sine',.06)});
    T(2400,()=>{r.remove();b.remove();fxTint('radial-gradient(circle at 50% 28%,#efe6ff 0,#b49aff 26%,#2a1466 72%,#0a0620 100%)');
      fxEl('left:50%;top:28%;width:90px;height:90px;margin:-45px;border-radius:50%;background:radial-gradient(#fff 0,#b46aff 50%,transparent 72%);animation:ring 1.2s ease-out forwards');
      glide(900,70,1,'sawtooth',.06);for(let i=0;i<8;i++)fount(['#b46aff','#fff','#7a5cff'],8);
      fxTxt('VÔ HẠN',50,86,'color:#fff;font-size:min(12vw,64px);letter-spacing:10px;text-shadow:0 0 20px #b46aff,0 0 4px #5a2ad0','pop .5s ease-out both')});
  }},
  // Darth Vader: tiếng thở khò khè, bóng đen trồi lên, kiếm đỏ bật sáng đúng chỗ thanh kiếm, câu thoại gõ từng chữ
  v_vader:{dur:3700,run(T){
    fxTint('radial-gradient(circle,#2a0606 0,#050000 75%)');
    every(T,0,3600,120,()=>part({x:rnd(0,innerWidth),y:rnd(0,innerHeight),life:rnd(20,40),sz:4,col:'#fff'}));
    [0,1700].forEach(t=>{T(t,()=>glide(70,125,.55,'sawtooth',.05));T(t+700,()=>glide(125,60,.75,'sawtooth',.05))});
    const k=K5(),d=cell(k),cat=fxSpr('sit',k,50,54,'animation:rise 1.3s cubic-bezier(.2,.8,.3,1) both',{img:'filter:brightness(0) drop-shadow(0 0 10px #ff2a2a);transition:filter .6s'});
    T(1300,()=>{fxEl('left:50%;top:54%;width:'+2.4*d+'px;height:'+26*d+'px;margin:'+(-15.5*d)+'px 0 0 '+8.3*d+'px;transform-origin:50% 100%;transform:rotate(13.5deg)','<div style="width:100%;height:100%;background:#fff;border-radius:'+d+'px;box-shadow:0 0 26px 10px #ff2a2a;transform-origin:50% 100%;animation:ignite .45s ease-out both"></div>');glide(60,130,.5,'sawtooth',.08)});
    T(1900,()=>fxTxt('“Ta là… chủ của ngươi.”',50,88,'color:#ff8a8a;font-size:min(4.4vw,30px);letter-spacing:1px;text-shadow:0 0 12px #ff2a2a','typing 1.1s steps(24) both'));
    T(2850,()=>{cat.firstChild.style.filter='none';for(let i=0;i<5;i++)fount(['#ff5a5a','#ffb0b0','#fff'],7);glide(95,70,.6,'sawtooth',.05)});
    every(T,1400,3600,60,()=>part({x:innerWidth/2+rnd(9,16)*d,y:innerHeight*.54+rnd(-14,10)*d,vx:rnd(-1.5,1.5),vy:rnd(-2,-.5),life:rnd(20,45),col:pick(['#ff5a5a','#ffb0b0']),sz:4}));
  }},
  // Phi Hành Gia: bật động cơ bay ngang vũ trụ, lần lượt lướt qua hành tinh có vành đai, hành tinh đỏ, hành tinh xanh, rồi hạ cánh xuất hiện
  v_astro:{dur:4000,run(T){
    fxTint('linear-gradient(#04061a,#101a44)');
    const k=K5(),circ='position:absolute;left:0;top:0;width:100%;height:100%;border-radius:50%;',
      planet=(top,size,html,dl,du)=>fxEl('left:50%;top:'+top+'%;width:'+size+';height:'+size+';margin:calc(-.5*'+size+') 0 0 calc(-.5*'+size+');animation:passBy '+du+'s '+dl+'s linear both',html),
      ring=clip=>'<div style="position:absolute;left:-48%;top:31%;width:196%;height:38%;border:min(1.7vw,9px) solid rgba(246,226,170,.92);border-radius:50%;transform:rotate(-16deg)'+(clip?';clip-path:inset(50% 0 0 0)':'')+'"></div>';
    planet(27,'min(40vw,200px)',ring(0)+'<div style="'+circ+'background:repeating-linear-gradient(172deg,transparent 0 12%,rgba(150,96,40,.35) 12% 19%),radial-gradient(circle at 35% 30%,#fff0c8,#e6b866 50%,#8a5a22)"></div>'+ring(1),.1,1.5);
    planet(74,'min(24vw,120px)','<div style="'+circ+'background:radial-gradient(circle at 62% 64%,rgba(120,40,20,.55) 0 9%,transparent 10%),radial-gradient(circle at 30% 58%,rgba(120,40,20,.5) 0 6%,transparent 7%),radial-gradient(circle at 55% 26%,rgba(120,40,20,.45) 0 7%,transparent 8%),radial-gradient(circle at 35% 30%,#ffc09a,#dc5a32 52%,#6e1e0e);box-shadow:0 0 22px rgba(255,110,70,.5)"></div>',1,1.3);
    planet(29,'min(34vw,170px)','<div style="'+circ+'background:radial-gradient(ellipse 30% 18% at 36% 42%,#6fd88a 0 96%,transparent 100%),radial-gradient(ellipse 20% 26% at 66% 62%,#6fd88a 0 96%,transparent 100%),radial-gradient(ellipse 58% 7% at 55% 24%,rgba(255,255,255,.75) 0 96%,transparent 100%),radial-gradient(circle at 35% 30%,#cdf2ff,#3a8cff 52%,#10276e);box-shadow:0 0 26px rgba(90,180,255,.7)"></div>',1.9,1.4);
    const fl=fxSpr('leap1',k,42,52,'animation:slideL .6s ease-out both,hover 1s ease-in-out infinite alternate',{flip:1});
    fl.insertAdjacentHTML('beforeend','<div style="position:absolute;right:84%;top:44%;width:70%;height:24%;background:linear-gradient(270deg,#fff3b0,#ffb347 35%,#ff6a3a 70%,transparent);border-radius:60% 40% 40% 60%;transform-origin:100% 50%;animation:flick .09s linear infinite alternate;z-index:-1"></div>');
    glide(110,240,3.2,'triangle',.05);[850,1650,2600].forEach(t=>T(t,()=>glide(900,300,.5,'sine',.04)));
    every(T,0,3300,30,()=>part({x:innerWidth+10,y:rnd(0,innerHeight),vx:-rnd(14,28),life:80,sz:Math.random()<.3?8:4,col:pick(['#fff','#bcd0ff','#e6c8ff'])}));
    T(3300,()=>{flash();fl.remove();fxSpr('sit',k,50,52,'animation:pop .5s ease-out both');stars(40);for(let i=0;i<7;i++)fount(['#fff','#bcd0ff','#5a8cff','#ffb347'],8);seq([1047,1319,1568,2093,2637],.08,.3,'square',.045)});
    every(T,3300,3900,80,()=>stars(4));
  }},
  // Hoàng Gia: thảm đỏ trải ra, kèn hai bên, ngài bước ra, vương miện hạ xuống, hoa giấy vàng
  v_royal:{dur:3500,run(T){
    fxTint('radial-gradient(circle,#5e1828 0,#17050a 75%)');
    fxEl('left:50%;bottom:0;width:min(70vw,420px);height:44vh;margin-left:max(-35vw,-210px);background:linear-gradient(#d23a52,#8a1a2e);clip-path:polygon(30% 0,70% 0,100% 100%,0 100%);transform-origin:50% 100%;animation:unroll .7s ease-out both');
    T(250,()=>{fxEl('left:6%;top:36%;font-size:min(15vw,76px);animation:slideL .5s ease-out both','<div style="transform:scaleX(-1)">🎺</div>');fxEl('right:6%;top:36%;font-size:min(15vw,76px);animation:slideR .5s ease-out both','🎺');
      seq([523,523,523,698,0,523,698,880,0,1047],.15,.24,'square',.045)});
    const k=K5(),d=cell(k);
    T(900,()=>fxSpr('sit',k,50,50,'animation:pop .5s ease-out both'));
    T(1500,()=>fxEl('left:50%;top:50%;font-size:'+15*d+'px;line-height:1;margin:'+(-36*d)+'px 0 0 '+(-7.5*d)+'px;animation:drop .9s cubic-bezier(.34,1.56,.64,1) both','👑'));
    every(T,900,3400,55,()=>rain(['#ffd24a','#fff','#ff9db5','#b98bff'],4));
    T(2400,()=>{for(let i=0;i<5;i++)fount(['#ffd24a','#fff3b0'],8);seq([1047,1319,1568,2093],.09,.3,'square',.04)});
  }},
  // Khao Manee: hai con mắt lớn mở ra, mỗi mắt một màu (đúng cặp màu mắt của bé), nửa màn hình nhuộm theo từng mắt; tách ra lộ bé mèo, hai mắt lóe sáng
  khaomanee:{dur:3300,run(T){
    fxTint('radial-gradient(circle,#18203c 0,#06070f 75%)');
    const L=look(lk(gz.cat)),c1=L.eye,c2=L.eye2||L.eye,k=K5(),d=cell(k);
    const half=(side,c,dl)=>fxEl(side+':0;top:0;width:50%;height:100%;background:radial-gradient(circle at '+(side==='left'?'60%':'40%')+' 46%,'+c+' 0,transparent 66%);opacity:.8;animation:fadeIn .4s '+dl+'s ease-out both');
    const Lh=half('left',c1,0),Rh=half('right',c2,.4);
    // con mắt: mống mắt nhiều lớp sáng dần vào trong, con ngươi dọc, hai điểm sáng phản chiếu, quầng sáng
    const orb=(x,c,dl)=>fxEl('left:'+x+'%;top:46%;width:min(27vw,136px);height:min(27vw,136px);transform:translate(-50%,-50%);transition:transform .5s ease-in','<div style="width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 33% 27%,#fff 0 7%,transparent 8.5%),radial-gradient(circle at 67% 71%,rgba(255,255,255,.6) 0 3.5%,transparent 5%),radial-gradient(ellipse 12% 40% at 50% 50%,#0a0a1e 0 95%,transparent 100%),radial-gradient(circle,'+mixc(c,45)+' 0,'+c+' 40%,'+mixc(c,55,'#0a0a2a')+' 72%,#0a0a1e 75%);box-shadow:0 0 36px 8px '+c+';animation:eyeIn .5s '+dl+'s cubic-bezier(.3,1.4,.6,1) both,eyePulse .9s '+(dl+.5)+'s ease-in-out infinite alternate"></div>');
    const g1=orb(30,c1,0),g2=orb(70,c2,.4);
    seq([2093,0,2637,0,3136,2637,3136,3951],.16,.4,'sine',.05);
    T(1400,()=>{Lh.style.animation='partL .5s ease-in forwards';Rh.style.animation='partR .5s ease-in forwards';
      g1.style.transform='translate(calc(-50% - 24vw),-50%) scale(.55)';g2.style.transform='translate(calc(-50% + 24vw),-50%) scale(.55)';
      fxSpr('sit',k,50,52,'animation:pop .5s .15s ease-out both')});
    T(2100,()=>{[[-5,c1],[5,c2]].forEach(q=>fxEl('left:50%;top:52%;width:'+8*d+'px;height:'+8*d+'px;margin:'+(-6.5*d)+'px 0 0 '+(q[0]-4)*d+'px;border-radius:50%;background:radial-gradient(#fff 0,'+q[1]+' 40%,transparent 70%);animation:ring .8s ease-out forwards'));seq([3136,3951],.1,.4,'sine',.06)});
    every(T,0,3200,60,()=>{part({x:innerWidth*.3+rnd(-60,60),y:innerHeight*.46+rnd(-60,60),vy:-1,life:30,sz:4,col:c1});part({x:innerWidth*.7+rnd(-60,60),y:innerHeight*.46+rnd(-60,60),vy:-1,life:30,sz:4,col:c2})});
  }},
  // Lykoi: sương trôi, trăng lên, bóng mèo sói hú "AWOOO", rồi hiện nguyên hình và chữa lại "à nhầm, meo"
  lykoi:{dur:3500,run(T){
    fxTint('linear-gradient(#070b24,#1b2552)');
    fxEl('left:50%;top:62%;width:min(44vw,190px);height:min(44vw,190px);margin-left:max(-22vw,-95px);border-radius:50%;background:#f4f1dc;box-shadow:0 0 60px 22px rgba(244,241,220,.45);animation:moon 2.6s ease-out forwards');
    [0,1].forEach(i=>fxEl('left:-20%;top:'+(60+i*14)+'%;width:140%;height:18vh;background:radial-gradient(ellipse at center,rgba(200,206,230,.38) 0,transparent 70%);animation:fog '+(3.6+i)+'s linear '+(i?'reverse ':'')+'both'));
    const cat=fxSpr('sit',K5(),50,56,'animation:pop .5s 1s ease-out both',{img:'filter:brightness(0);transition:filter .7s'});
    every(T,0,3400,90,()=>stars(3));
    T(1500,()=>{glide(300,640,.55,'sine',.07);T(550,()=>glide(640,470,1.2,'sine',.07));
      'AWOOOO~'.split('').forEach((ch,i)=>fxTxt(ch,55+i*4.5,40-i*1.5,'color:#f4f1dc;font-size:min(9vw,46px);text-shadow:0 0 12px #8a84a0','howl 1.3s '+(i*.09).toFixed(2)+'s ease-out both'))});
    T(2700,()=>{cat.firstChild.style.filter='none';fxTxt('…à nhầm, meo.',50,88,'color:#cfc8e6;font-size:min(6vw,28px)','fadeIn .4s ease-out both');seq([880,988],.12,.2,'sine',.05)});
  }},
  // Savannah: chạy trên đồng cỏ lúc hoàng hôn, thu mình rồi bật nhảy vọt qua vạch 2 mét
  savannah:{dur:3300,run(T){
    fxTint('linear-gradient(#f0a040 0,#d8702a 55%,#7a3a12 100%)');
    fxEl('left:50%;top:24%;width:min(36vw,160px);height:min(36vw,160px);margin-left:max(-18vw,-80px);border-radius:50%;background:#ffe9a0;box-shadow:0 0 70px 26px rgba(255,220,130,.5)');
    fxEl('left:9%;bottom:20%;width:10px;height:22vh;background:#3a1c0a');fxEl('left:9%;bottom:calc(20% + 19vh);width:min(40vw,220px);height:7vh;margin-left:max(-20vw,-110px);border-radius:50%;background:#3a1c0a');
    fxEl('left:0;bottom:0;width:100%;height:20%;background:#3a1c0a');
    // cột đo cao 2 mét
    fxEl('left:84%;bottom:20%;width:4px;height:46vh;background:#fff3c8;animation:fadeIn .5s .4s both','<div style="position:absolute;left:-8px;top:0;width:20px;height:4px;background:#fff3c8"></div><div style="position:absolute;left:-8px;top:50%;width:20px;height:3px;background:#fff3c8"></div>');
    const mark=fxTxt('2 m',84,'calc(34% - 26px)','color:#fff3c8;font-size:min(7vw,34px);text-shadow:0 2px 0 #7a3a12','fadeIn .5s .4s both');
    const k=K5(),d=cell(k),key=lk(gz.cat),GY='calc(80% - '+18*d+'px)';
    const run=fxSpr('run0',k,30,GY,'animation:runIn .8s cubic-bezier(.3,.6,.4,1) both',{flip:1}),im=run.firstChild;let fr=0,lp;
    every(T,0,800,60,()=>{im.src=sprSrc(key,'run'+(fr=(fr+1)%8),k);part({x:innerWidth*.3-rnd(20,60),y:innerHeight*.8+rnd(-4,4),vx:-rnd(2,5),vy:-rnd(0,1.5),life:26,col:pick(['#e6c08a','#fff0c8'])})});
    glide(300,900,.5,'triangle',.04);
    T(850,()=>{im.src=sprSrc(key,'crouch0',k);run.style.animation='none'});
    T(1150,()=>{run.remove();lp=fxSpr('leap1',k,30,GY,'--dx:40vw;animation:leapX 1.1s linear both',{flip:1,img:'--dy:-48vh;animation:leapY 1.1s both'});glide(300,1300,.6,'triangle',.05)});
    T(1700,()=>{mark.firstChild.style.animation='pop .4s ease-out both';mark.firstChild.style.color='#fff';seq([1568,2093],.08,.25,'sine',.06)});
    T(2250,()=>{lp.remove();fxSpr('sit',k,'calc(30% + 40vw)',GY,'animation:pop .35s ease-out both');for(let i=0;i<14;i++)part({x:innerWidth*.3+innerWidth*.4+rnd(-40,40),y:innerHeight*.8,vx:rnd(-4,4),vy:-rnd(.5,3),life:30,col:pick(['#e6c08a','#fff0c8'])});seq([1047,1319,1568],.08,.2,'triangle',.05)});
  }},
  // Sokoke: rón rén bước trên hàng bụi cây (đi vài bước lại dừng nghe ngóng) rồi lẩn vào bụi lớn; bụi rung, hai con mắt sáng lộ ra; bé bật nhảy vọt khỏi bụi
  sokoke:{dur:4100,run(T){
    fxTint('linear-gradient(#0d2612,#2f5c2c)');
    [5,21,76,91].forEach((x,i)=>fxEl('left:'+x+'%;top:0;width:'+(i%2?5:8)+'vw;height:100%;background:#0a1c0e;opacity:.8'));
    [30,54].forEach((x,i)=>fxEl('left:'+x+'%;top:-10%;width:12vw;height:120%;background:linear-gradient(rgba(240,240,170,.24),transparent 85%);transform:skewX(-14deg);animation:fadeIn 1.2s '+i*.4+'s ease-out both'));
    fxEl('left:0;bottom:0;width:100%;height:20%;background:#0a1c0e');
    const k=K5(),d=cell(k),key=lk(gz.cat),BX=30,GR=['#1f5a2a','#2c7236','#18481f','#368542','#2a6a33'],LF=['#6fd26f','#3f9a55','#b5e08a','#2c7236'];
    const bush=(x,w,z)=>fxEl('left:'+x+'%;bottom:17%;width:'+w+'px;height:'+.62*w+'px;margin-left:'+(-w/2)+'px;overflow:hidden;transform-origin:50% 100%;z-index:'+z,
      [[50,56,62],[22,72,46],[78,72,46],[36,39,44],[66,41,42]].map((c,i)=>'<div style="position:absolute;left:'+c[0]+'%;top:'+c[1]+'%;width:'+c[2]+'%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at 35% 30%,'+GR[(i+3)%5]+','+GR[i]+' 70%)"></div>').join(''));
    [6,18].forEach(x=>bush(x,36*d,1));[74,92].forEach(x=>bush(x,30*d,1));
    const bb=bush(BX,66*d,3),bx=()=>innerWidth*BX/100,by=()=>innerHeight*.83-30*d,
      leaf=(x,y)=>part({x:(x||bx())+rnd(-24,24)*d,y:(y||by())+rnd(-10,10)*d,vx:rnd(-3,3),vy:-rnd(1,4.5),g:.16,life:rnd(26,46),col:pick(LF),sz:Math.random()<.5?4:8});
    // cảnh 1: đi rón rén trên hàng bụi
    const cat=fxSpr('walk0',k,BX,'calc(83% - '+37*d+'px)','z-index:2;animation:sneak 1.5s linear both',{flip:1}),im=cat.firstChild,t0=performance.now();let fr=0;
    every(T,0,1500,60,()=>{const e=performance.now()-t0,stop=(e>330&&e<510)||(e>840&&e<1020);im.src=sprSrc(key,stop?'stand':'walk'+(fr=(fr+1)%12),k)});
    [0,510,1020].forEach(t=>T(t,()=>seq([330,0,392],.11,.06,'triangle',.04)));
    T(1500,()=>{cat.style.animation='sinkIn .3s ease-in forwards';for(let i=0;i<8;i++)leaf()});
    // chuyển cảnh: bụi rung nhẹ, hai con mắt phát sáng lộ ra rồi chớp
    let eyes,lp;
    T(1800,()=>{bb.style.animation='bushShake .13s ease-in-out infinite alternate';seq([196,0,220,196,0,233,0,208],.07,.05,'sawtooth',.03)});
    every(T,1800,2850,110,()=>leaf());
    T(2050,()=>{const ec=look(key).eye||'#6fcf5f',one='<div style="width:'+10*d+'px;height:'+6.6*d+'px;border-radius:50%;background:radial-gradient(ellipse 15% 46% at 50% 50%,#04120a 0 95%,transparent 100%),radial-gradient(circle at 34% 28%,#fff 0 9%,transparent 11%),radial-gradient(circle,'+mixc(ec,40)+' 0,'+ec+' 55%,'+mixc(ec,55,'#04200c')+' 100%);box-shadow:0 0 '+4*d+'px '+1.5*d+'px '+ec+'"></div>';
      eyes=fxEl('left:'+BX+'%;bottom:calc(17% + '+13*d+'px);width:'+31*d+'px;height:'+13*d+'px;margin-left:'+(-15.5*d)+'px;z-index:4;display:flex;align-items:center;justify-content:space-between;padding:0 '+3.5*d+'px;border-radius:50%;background:radial-gradient(ellipse,#06140a 0 58%,transparent 74%);animation:eyeIn .35s ease-out both',one+one);
      seq([523,0,494],.16,.3,'sine',.05)});
    T(2450,()=>{eyes.style.animation='eyeBlink .28s ease-in-out both'});
    // cảnh cuối: bật nhảy ra khỏi bụi
    const DXL=Math.max(.26*innerWidth,56*d);
    T(2850,()=>{eyes.remove();bb.style.animation='bushShake .06s linear 8 alternate';for(let i=0;i<18;i++)leaf();
      lp=fxSpr('leap1',k,BX,'calc(83% - '+19*d+'px)','z-index:2;--dx:'+DXL+'px;animation:leapX .75s linear both',{flip:1,img:'--dy:-36vh;animation:leapY .75s both'});glide(300,1300,.6,'triangle',.05)});
    T(3600,()=>{lp.remove();fxSpr('sit',k,'calc('+BX+'% + '+DXL+'px)','calc(83% - '+18*d+'px)','z-index:2;animation:pop .35s ease-out both');
      for(let i=0;i<16;i++)leaf(bx()+DXL,innerHeight*.83-6*d);seq([1568,1976,2349,1976,2637],.09,.16,'sine',.05)});
    every(T,0,4000,80,()=>rain(LF,2));
  }},
  // Suphalak: quả cầu đồng đỏ có vệt sáng lướt qua; vết nứt lan dần thành nhiều nhánh, ánh sáng lọt ra qua khe nứt; vỏ vỡ tung thành mảnh và bé mèo xuất hiện giữa tàn lửa
  suphalak:{dur:3800,run(T){
    fxTint('radial-gradient(circle,#a8561e 0,#2a1206 78%)');
    fxEl('left:50%;top:50%;width:170vmax;height:170vmax;margin:-85vmax 0 0 -85vmax;background:repeating-conic-gradient(#ffc070 0 5deg,transparent 5deg 18deg);opacity:.25;animation:spin 14s linear infinite');
    const s=Math.round(Math.min(innerWidth,innerHeight)*.42),DISC='radial-gradient(circle at 35% 30%,#ffd8a8,#d9783a 45%,#8f3f14)',box='left:50%;top:50%;width:'+s+'px;height:'+s+'px;margin:'+(-s/2)+'px 0 0 '+(-s/2)+'px;';
    const disc=fxEl(box+'border-radius:50%;overflow:hidden;background:'+DISC+';border:6px solid #6e2e0c;box-shadow:0 0 40px #ff9a4a;animation:pop .5s ease-out both','<div style="position:absolute;top:0;left:0;width:45%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent);animation:shine .5s .4s ease-in-out both"></div>');
    snd(t=>{tone(110,t,2.4,'sine',.12);tone(165,t,2,'sine',.06);tone(221,t,1.4,'sine',.04)});
    // vết nứt: 6 nhánh chính toả từ tâm, mỗi nhánh rẽ 1–2 nhánh phụ; mỗi nét được vẽ dần bằng stroke-dashoffset
    const P2=(a,r)=>[50+Math.cos(a)*r,50+Math.sin(a)*r],cr=[],angs=[],a0=rnd(0,6.283);
    for(let i=0;i<6;i++){
      const a=a0+i*1.047+rnd(-.22,.22),pts=[[50+rnd(-2,2),50+rnd(-2,2)]];angs.push(a);
      for(let r=rnd(8,12);r<56;r+=rnd(8,12))pts.push(P2(a+rnd(-.28,.28),r));
      cr.push({pts,dl:i*.08,du:.75});
      for(let j=1;j<=2;j++){
        if(j===2&&ch(.4))continue;
        const q=[pts[Math.min(pts.length-2,j+i%2)]],ab=a+(j%2?1:-1)*rnd(.55,.95);
        for(let n=0;n<3;n++){const l=q[q.length-1],b2=ab+rnd(-.35,.35),st=rnd(6,10);q.push([l[0]+Math.cos(b2)*st,l[1]+Math.sin(b2)*st])}
        cr.push({pts:q,dl:i*.08+.32+j*.14,du:.5});
      }
    }
    const pth=c=>'<path d="M'+c.pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')+'" pathLength="1" style="animation-delay:'+c.dl.toFixed(2)+'s;animation-duration:'+c.du+'s"/>';
    T(700,()=>disc.insertAdjacentHTML('beforeend','<svg viewBox="0 0 100 100" style="position:absolute;left:0;top:0;width:100%;height:100%"><g class="crk g1">'+cr.map(pth).join('')+'</g><g class="crk g2">'+cr.map(pth).join('')+'</g></svg>'));
    every(T,700,1950,95,()=>snd(t=>tone(rnd(1500,2800),t,.035,'square',.035)));
    // ánh sáng lọt qua khe nứt: các tia sáng rọi ra theo hướng từng nhánh chính, quả cầu rung
    T(1350,()=>{disc.style.animation='shS .16s linear infinite';glide(200,520,.7,'sine',.05);
      angs.forEach((a,i)=>fxEl('left:50%;top:50%;width:90vmax;height:'+(i%2?12:7)+'px;margin-top:'+(i%2?-6:-3.5)+'px;transform-origin:0 50%;transform:rotate('+a.toFixed(3)+'rad);background:linear-gradient(90deg,rgba(255,246,210,.95),rgba(255,200,120,0) 72%);z-index:-1;animation:fadeIn .55s '+(i*.06).toFixed(2)+'s ease-in both'))});
    // vỏ vỡ tung thành 12 mảnh hình nêm bay ra và xoay, bé mèo xuất hiện
    T(2050,()=>{flash();disc.remove();
      const n=12,jg=[];for(let i=0;i<n;i++)jg.push(i*6.283/n+rnd(-.12,.12));jg.push(jg[0]+6.283);
      const pt=(t,r)=>(50+Math.cos(t)*r).toFixed(1)+'% '+(50+Math.sin(t)*r).toFixed(1)+'%';
      for(let i=0;i<n;i++){const a=jg[i],b=jg[i+1],m=(a+b)/2,ds=rnd(.5,1.05)*Math.max(innerWidth,innerHeight)*.5;
        fxEl(box+'background:'+DISC+';clip-path:polygon('+pt(m,rnd(3,10))+','+pt(a,51)+','+pt(m,53)+','+pt(b,51)+');--tx:'+Math.round(Math.cos(m)*ds)+'px;--ty:'+Math.round(Math.sin(m)*ds)+'px;--rot:'+Math.round(rnd(-260,260))+'deg;animation:shard '+rnd(.7,1).toFixed(2)+'s cubic-bezier(.15,.6,.4,1) both')}
      fxEl(box+'border-radius:50%;background:radial-gradient(#fff 0,#ffe0a8 45%,transparent 72%);animation:burst .5s ease-out forwards');
      fxSpr('sit',K5(),50,50,'animation:pop .6s ease-out both');for(let i=0;i<8;i++)fount(['#ffb060','#ffd89a','#e88a3a','#fff'],8);
      snd(t=>{tone(147,t,1.6,'sine',.1);tone(294,t,1.2,'sine',.05);tone(2200,t,.08,'square',.04);tone(1700,t+.05,.1,'square',.04)})});
    every(T,0,3700,50,()=>part({x:rnd(0,innerWidth),y:innerHeight+6,vx:rnd(-.6,.6),vy:-rnd(2,6),life:rnd(50,110),sz:Math.random()<.5?4:8,col:pick(['#ffb060','#ffd89a','#e88a3a'])}));
  }},
};
function flash(){const el=$('gz');el.classList.remove('fl');void el.offsetWidth;el.classList.add('fl')}
function doGacha(useTicket){
  const r=gachaRoll(useTicket); if(r.err){toast(r.err,{type:'warn'});return}
  render();playGacha(r.cat);
}
function playGacha(c){
  const el=$('gz'),st=c.star,col=STAR[st].g,box=$('gbox'),T=(ms,f)=>gz.timers.push(setTimeout(f,ms));
  gz.cat=c;gz.done=false;gz.parts=[];fxClear();gz.timers.forEach(clearTimeout);gz.timers=[];
  el.className='on';el.style.setProperty('--rc',col);
  $('grev').style.display='none';$('gskip').style.display='block';
  box.style.display='block';box.src=furnCv('gift',st>=3?col:'#aab0bd',kk(5)).toDataURL();box.className='s';
  if(!gz.raf)gz.raf=requestAnimationFrame(gpLoop);
  if(st<=2){T(850,()=>gReveal())}
  else if(st===3){box.classList.add('glow');for(let t=0;t<1300;t+=80)T(t,()=>sparkle(col,3));T(1400,()=>gReveal())}
  else if(st===4){box.className='h glow';el.classList.add('rayon');for(let t=0;t<1700;t+=60)T(t,()=>sparkle(col,4));T(1800,()=>{flash();gReveal()})}
  else{
    el.classList.add('dark');
    T(900,()=>{box.className='h glow';el.classList.add('pil')});
    for(let t=900;t<2300;t+=50)T(t,()=>sparkle('#ffd24a',5));
    const it=INTRO[c.sp];
    if(it){T(2400,()=>{flash();box.style.display='none';el.classList.remove('pil');it.run(T)});(MEOW[c.sp]||[]).forEach(m=>T(2400+m[0],()=>meow(m[1])));T(2400+it.dur,()=>{flash();gReveal()})}
    else T(2400,()=>{flash();gReveal()});
  }
}
function gReveal(skipped){
  if(gz.done)return; gz.done=true;
  gz.timers.forEach(clearTimeout);gz.timers=[];
  const c=gz.cat,sp=SP[c.sp],st=c.star,col=scol(st),el=$('gz'),rev=$('grev');
  $('gbox').style.display='none';$('gskip').style.display='none';el.classList.remove('pil');fxClear();
  if(st>=4)el.classList.add('rayon');
  if(st===5){
    if(!skipped){el.classList.add('quake');setTimeout(()=>el.classList.remove('quake'),600)}
    const cols=['#ffd24a','#ff8fa3','#7fb7ff','#5fd08a','#fff'];
    for(let i=0;i<(skipped?3:7);i++)gz.timers.push(setTimeout(()=>burst(rnd(.15,.85)*innerWidth,rnd(.12,.6)*innerHeight,pick(cols)),i*260));
  }else if(st>=3&&!skipped)burst(innerWidth/2,innerHeight/2,col);
  let stars='';for(let i=0;i<st;i++)stars+='<span class="st" style="animation-delay:'+(.25+i*.24)+'s">★</span>';
  stars=isRb(c)?'<div class="pop" style="font-size:26px">'+starsC(c)+'</div>':'<div class="stars s'+st+'" style="font-size:26px;--d:-'+(Date.now()%6000)+'ms">'+stars+'</div>';
  // bố cục thẻ: ảnh, hàng sao riêng một dòng, bậc hiếm, tên, câu thoại; rồi khung thông tin và khung thuộc tính; cuối cùng là đặt tên
  const ct=coatOf(c),row=(k,v)=>'<div class="k">'+k+'</div><div>'+v+'</div>',
    info=(ct?row(coatLbl(c),'<b>'+ct.n+'</b> '+coatTags(c)):'')+(c.replay?'':row('Tuổi',ageTxt(c)));
  rev.innerHTML='<div class="pop gv">'+(st===5?'<div class="legend">HUYỀN THOẠI</div>'+(ct&&ct.form?'<div class="legend" style="font-size:17px;letter-spacing:3px;color:#8a5ad0;text-shadow:0 2px 0 #fff,0 0 16px #c9a6ff">✨ TRANG PHỤC HIẾM ✨</div>':''):isRare(c)?'<div class="legend" style="color:#8a5ad0;text-shadow:0 2px 0 #fff,0 0 16px #c9a6ff">MÀU HIẾM!</div>':'')+
    '<div class="gv-pic">'+catTag(big(c),innerHeight<860&&innerWidth<520?3:4)+'</div><div class="gv-stars">'+stars+'</div>'+
    '<div class="gv-rank" style="color:'+col+'">'+STAR[st].n+(c.isNew?' · <span style="color:var(--good)">MỚI!</span>':'')+'</div>'+
    '<h2 class="gv-name">'+sp.n+' '+sexIc(c)+'</h2>'+(sp.q&&st===5?'<div class="quote">“'+sp.q+'”</div>':'')+
    '<div class="cd-sec">'+(info?'<div class="cd-grid">'+info+'</div>':'')+'<div class="cd-desc'+(info?'':' solo')+'">'+sp.d+'</div></div>'+
    '<div class="cd-sec"><h4>Thuộc tính ('+c.traits.length+')</h4><div class="cd-tags">'+c.traits.map(t=>tagOf(t)).join('')+'</div></div>'+
    (c.replay?'<button class="on gv-btn" onclick="endReplay()">Đóng</button></div>':
    '<div class="row gv-row"><input id="gname" maxlength="16" value="'+esc(c.name)+'" placeholder="Đặt tên cho bé" style="flex:1"><button class="sm" onclick="$(\'gname\').value=pick(NAMES)">🎲</button></div>'+
    '<button class="on gv-btn" onclick="gachaDone()">Đón về nhà</button></div>');
  rev.style.display='block';
}
function endReplay(){gz.timers.forEach(clearTimeout);gz.timers=[];$('gz').className=''}
// xem lại intro của một bé 5★ đã gặp, từ tab Sưu tập
function replayIntro(id){const sp=SP[id];playGacha({uid:0,sp:id,star:5,sex:'m',name:sp.n,traits:[sp.xt||sp.bt].filter(Boolean),replay:1})}
function gachaDone(){
  gz.timers.forEach(clearTimeout);gz.timers=[];
  const c=gz.cat,v=$('gname').value.trim().slice(0,16); if(v)c.name=v; delete c.isNew;
  save();$('gz').className='';syncEnts();render();
  toast('đã về '+ROOM[c.room].n,{type:'cat',title:c.name});
}

/* --- mèo --- */
function openCat(uid){
  const c=catBy(uid); if(!c)return; const sp=SP[c.sp],away=onTrip(uid),bf=buffOf(c),ct=coatOf(c),rb=isRb(c);
  const row=(k,v)=>'<div class="k">'+k+'</div><div>'+v+'</div>';
  const st=(ic,n,v,col)=>'<div class="k">'+ic+' '+n+'</div><div class="bar"><i style="width:'+Math.round(v)+'%;background:'+col+'"></i></div><div class="n">'+Math.round(v)+'%</div>';
  modal(
    // đầu trang: ảnh, tên, sao, bậc hiếm
    '<div class="cd-head r'+c.star+(rb?' rb':'')+'">'+catTag(big(c),3)+'<h2>'+esc(c.name)+' '+sexIc(c)+'</h2>'+
      '<div class="cd-star">'+starsC(c)+'</div><div class="cd-rank" style="color:'+scol(c.star)+'">'+STAR[c.star].n+(rb?' · '+(isRare(c)?'✨ Màu hiếm':'💎 Mắt quý hiếm'):'')+'</div></div>'+
    // hồ sơ
    '<div class="cd-sec"><h4>Hồ sơ</h4><div class="cd-grid">'+
      row('Giống','<b>'+sp.n+'</b>'+(sp.base?' <span class="dim">· gốc '+SP[sp.base].n+(sp.short?' (chân ngắn)':'')+'</span>':''))+
      (ct?row(coatLbl(c),'<b>'+ct.n+'</b> '+coatTags(c)):'')+
      row('Tuổi','<span class="tag g" tabindex="0" data-tip="'+esc(AGE_TIP[ageStage(c)])+'">'+ageTxt(c)+'</span>')+
      row('Nơi ở',away?'Đang đi viễn chinh':ROOM[c.room].n)+
      row('Khoái khẩu',favs(c).map(f=>FOOD[f].ic+' '+FOOD[f].n).join(', '))+
    '</div><div class="cd-desc">'+sp.d+'</div></div>'+
    // chỉ số
    '<div class="cd-sec"><h4>Chỉ số</h4><div class="cd-stats">'+st('🍗','Độ no',c.full,c.full<20?'#ff6b6b':'#ffb347')+st('⚡','Năng lượng',c.en,'#7fb7ff')+st('😊','Độ vui',c.hp,'#5fd08a')+'</div>'+
      (away&&!bf.food?'':'<div class="dim cd-note">'+(away?'':'Độ vui đang hướng tới '+Math.round(happyTarget(c))+'%.')+(bf.food?' Đang có buff '+FOOD[bf.food].n+' (còn '+fmt(bf.until-now())+').':'')+'</div>')+'</div>'+
    // thuộc tính
    '<div class="cd-sec"><h4>Thuộc tính ('+c.traits.length+')</h4><div class="cd-tags">'+c.traits.map(t=>tagOf(t)).join('')+'</div></div>'+
    // đổi tên, chuyển phòng
    '<div class="cd-sec"><h4>Đổi tên</h4><div class="row"><input id="cname" maxlength="16" value="'+esc(c.name)+'" style="flex:1"><button class="sm" onclick="$(\'cname\').value=pick(NAMES)">🎲</button><button class="sm on" onclick="doRename('+uid+')">Đổi tên</button></div></div>'+
    (away?'':'<div class="cd-sec"><h4>Chuyển phòng</h4><div class="row wrap">'+ownedRooms().concat([ROOM.wait]).map(r=>'<button class="sm '+(r.id===c.room?'on':'')+'" '+(r.id!==c.room&&catsIn(r.id).length>=r.cap?'disabled':'')+' onclick="doMove('+uid+',\''+r.id+'\')">'+r.n+' '+catsIn(r.id).length+'/'+(r.wait?'∞':r.cap)+'</button>').join('')+'</div></div>')+
    '<div class="row" style="justify-content:center;margin-top:12px"><button class="sm bad" '+(away||S.cats.length<=1?'disabled':'')+' onclick="doRehome('+uid+')">🕊 Phóng sinh (+'+STAR[c.star].sell+' xu'+(c.star===5?', +1 vé':'')+')</button><button class="sm" onclick="closeModal()">Đóng</button></div>');
}
function doRename(uid){const v=$('cname').value.trim().slice(0,16);if(!v)return;catBy(uid).name=v;save();render();openCat(uid);toast('Đã đổi tên',{icon:'✏️',title:v})}
function doMove(uid,rid){if(catBy(uid).room===rid)return;if(moveCat(uid,rid)){syncEnts();render();openCat(uid)}}
let relQ=[];
function doRehome(uid){askRelease([uid])}
function askRelease(uids,step){
  const cs=uids.map(catBy).filter(c=>c&&!onTrip(c.uid)); if(!cs.length)return;
  if(S.cats.length-cs.length<1){toast('Phải giữ lại ít nhất một bé.',{type:'warn'});return}
  relQ=cs.map(c=>c.uid);
  const rare=cs.filter(c=>c.star>=4),coins=cs.reduce((a,c)=>a+releaseGift(c).coins,0),tk=cs.reduce((a,c)=>a+releaseGift(c).ticket,0);
  const row=c=>'<div class="card">'+catTag(lk(c),1)+'<div class="g">'+nm(c)+' '+sexIc(c)+' '+starsC(c)+'<br><small>'+kind(c)+'</small></div></div>';
  if(step===2){modal('<h3 style="color:var(--bad)">Chắc chắn chứ?</h3><div>'+(rare.length>1?'Trong số này có '+rare.length+' bé hiếm 4★–5★:':'Đây là bé hiếm:')+'</div>'+rare.map(row).join('')+'<div class="dim">Phóng sinh rồi không lấy lại được.</div><div class="row" style="justify-content:center;margin-top:10px"><button class="bad" onclick="doRelease()">Vẫn phóng sinh</button><button class="go" onclick="closeModal()">Giữ lại</button></div>');return}
  modal('<h3>Phóng sinh '+(cs.length>1?cs.length+' bé':esc(cs[0].name))+'?</h3><div style="max-height:40vh;overflow:auto">'+cs.map(row).join('')+'</div><div>Bạn nhận lại 🪙 <b>'+coins+'</b>'+(tk?' và 🎟 <b>'+tk+'</b> vé gacha':'')+'.</div><div class="dim">Bé rời nhà vĩnh viễn. Bộ sưu tập vẫn ghi là đã từng sở hữu.</div>'+
    '<div class="row" style="justify-content:center;margin-top:10px"><button class="bad" onclick="'+(rare.length?'askRelease(relQ,2)':'doRelease()')+'">🕊 Phóng sinh</button><button onclick="closeModal()">Giữ lại</button></div>');
}
function doRelease(){
  const cs=relQ.map(catBy).filter(c=>c&&!onTrip(c.uid));let coins=0,tk=0,done=[];
  cs.forEach(c=>{if(c.room===cur)byeEnt(c);const g=rehome(c.uid);if(g){coins+=g.coins;tk+=g.ticket;done.push(c)}});
  relQ=[];mg.sel={};if(!done.length){closeModal();return}
  syncEnts();render();
  // hoạt ảnh chào tạm biệt: vẫy rồi chạy ra khỏi màn hình
  modal('<h3>Tạm biệt nhé!</h3><div style="overflow:hidden;white-space:nowrap;padding:14px 0">'+done.slice(0,6).map((c,i)=>'<span class="bye" style="animation-delay:'+i*.12+'s">'+catTag(lk(c),2)+'</span>').join('')+'</div><div class="dim">'+done.map(c=>esc(c.name)).join(', ')+' đã lên đường tìm cuộc sống mới.</div>');
  setTimeout(()=>{closeModal();toast((done.length>1?done.length+' bé':done[0].name)+' đã được phóng sinh'+(tk?' · +'+tk+' vé gacha':''),{type:'coin',title:'Phóng sinh',coins})},2100);
}
function mgSel(uid){if(mg.sel[uid])delete mg.sel[uid];else mg.sel[uid]=1;renderPanel()}
function toggleEdit(){edit=!edit;sel=null;room.classList.toggle('edit',edit);render()}
function doBuy(fid){
  const it=buyItem(fid,cur,camX+VW/2); if(!it)return;
  toast('Đã đặt vào '+ROOM[cur].n+'. Bấm Sắp xếp ở tab Nhà để di chuyển.',{type:'shop',title:FURN[fid].n});render();
}
function doFlip(){const it=S.items.find(i=>i.iid===sel);if(it){it.flip=!it.flip;save()}}
function doStore(){const it=S.items.find(i=>i.iid===sel);if(it){it.room=null;sel=null;save();render()}}
function doPlace(iid){const it=S.items.find(i=>i.iid===iid);if(!it)return;it.room=cur;it.x=camX+VW/2;it.y=FURN[it.fid].kind==='wall'?70:140;clampItem(it);sel=iid;save();render()}
function doRepair(iid){if(repairItem(iid)){toast('Đã sửa xong, hiệu ứng hoạt động lại',{type:'fix'});render()}else toast('Không đủ xu để sửa.',{type:'warn'})}
function doBuyRoom(rid){if(buyRoom(rid)){toast('Đã mở phòng mới, chứa được '+ROOM[rid].cap+' mèo',{type:'room',title:ROOM[rid].n});setRoom(rid)}}
function doSkip(){skipTime();syncEnts();render();toast('Đã tua nhanh 10 phút',{icon:'⏩'})}
function resetAll(){if(confirm('Xóa toàn bộ dữ liệu và chơi lại?')){fresh();save();cur='living';camX=0;ents=[];syncEnts();render()}}

/* ============ CÁC TAB ============ */
let tab='home',albumG='breed',shopT='rooms',shopSel=null,mg={sort:'star',room:'all',multi:false,sel:{}};
const TABS=[['home','🏠','Phòng'],['gacha','🥚','Gacha'],['trip','🎒','Viễn chinh'],['shop','🛋','Cửa hàng'],['album','📖','Sưu tập'],['cats','🐱','Quản lý mèo']];
function setTab(t){tab=t;$('app').dataset.tab=t;if(edit&&t!=='home'){toggleEdit();return}if(t==='home')fitCanvas();render();scrollTo(0,0)}
function renderTop(){
  const ready=S.trips.filter(p=>p&&now()>=p.end).length,n=S.cats.length||1;
  const hungry=S.cats.filter(c=>c.full<20).length,af=Math.round(S.cats.reduce((a,c)=>a+c.full,0)/n),ah=Math.round(S.cats.reduce((a,c)=>a+c.hp,0)/n),wt=catsIn('wait').length;
  document.title=(ready?'(!) ':'')+'Mèo Xu';
  $('top').innerHTML='<div class="chip">🪙 <b>'+S.coins.toLocaleString('vi-VN')+'</b></div><div class="chip">🎟 <b>'+S.tickets+'</b></div>'+
    '<div class="chip">🐱 <b>'+S.cats.length+'</b>'+(wt?' <span style="color:var(--bad)">· '+wt+' chờ phòng</span>':'')+'</div>'+
    '<div class="chip" title="Độ no trung bình">🍗 <b'+(hungry?' style="color:var(--bad)"':'')+'>'+af+'%</b>'+(hungry?' <span style="color:var(--bad)">· '+hungry+' bé đói</span>':'')+'</div>'+
    '<div class="chip" title="Độ vui trung bình">😊 <b>'+ah+'%</b></div>'+
    '<div class="chip xp">Cấp '+S.level+' <span class="dim">· '+S.xp+'/'+xpNeed()+'</span><div class="bar"><i style="width:'+(S.xp/xpNeed()*100)+'%"></i></div></div>';
  const o=ownedRooms();
  $('roomnav').innerHTML=(o.length>1?'<button onclick="navRoom(-1)" aria-label="Phòng trước">◀</button>':'')+'<button class="nm" onclick="openRooms()"><b>'+ROOM[cur].n+'</b> <span class="dim">· '+catsIn(cur).length+'/'+ROOM[cur].cap+' mèo'+(o.length>1?' · đổi phòng ▾':'')+'</span></button>'+(o.length>1?'<button onclick="navRoom(1)" aria-label="Phòng sau">▶</button>':'');
  $('tabs').innerHTML=TABS.map(t=>'<button class="'+(tab===t[0]?'on':'')+'" onclick="setTab(\''+t[0]+'\')"><span>'+t[1]+'</span>'+t[2]+(t[0]==='trip'&&ready?' ❗':'')+(t[0]==='cats'&&wt?' ❗':'')+'</button>').join('');
}
function openRooms(){
  modal('<h3>Chọn phòng</h3>'+ownedRooms().map(r=>'<div class="card tap" onclick="closeModal();setRoom(\''+r.id+'\')"><div style="font-size:24px">'+(r.id===cur?'📍':'🚪')+'</div><div class="g"><b>'+r.n+'</b> <small>· '+catsIn(r.id).length+'/'+r.cap+' mèo'+(catsIn(r.id).length>=r.cap?' · <span style="color:var(--bad)">đầy</span>':'')+'</small><br><small>'+r.d+'</small></div></div>').join('')+'<button onclick="closeModal()">Đóng</button>');
}
function renderPanel(){$('panel').innerHTML=PANEL[tab]()}
function render(){renderTop();renderPanel()}
const nm=c=>c.star===5?'<b class="n5">'+esc(c.name)+'</b>':'<b>'+esc(c.name)+'</b>'; // mèo 5★ có khung tên vàng kim
const catCard=c=>'<div class="card tap" onclick="openCat('+c.uid+')">'+catTag(lk(c),1)+'<div class="g">'+nm(c)+' '+sexIc(c)+' '+starsC(c)+' <small>'+kind(c)+(onTrip(c.uid)?' · đang viễn chinh':'')+'</small><br>'+stats(c)+'</div><div class="dim" style="font-size:20px">›</div></div>';
function list_all(){S.cats.filter(c=>(mg.room==='all'||c.room===mg.room)&&!onTrip(c.uid)).forEach(c=>mg.sel[c.uid]=1);renderPanel()}
function mgMove(uid,rid){
  const c=catBy(uid); if(!c||c.room===rid){renderPanel();return}
  if(moveCat(uid,rid)){syncEnts();render();toast('đã chuyển sang '+ROOM[rid].n,{type:'room',title:c.name})}
  else{toast(onTrip(uid)?'Bé đang đi viễn chinh, chưa chuyển phòng được.':ROOM[rid].n+' đã đầy ('+catsIn(rid).length+'/'+ROOM[rid].cap+').',{type:'warn'});renderPanel()}
}
function doDelete(){
  const it=S.items.find(i=>i.iid===sel); if(!it||!confirm('Xóa hẳn '+FURN[it.fid].n+'? Bạn được hoàn 25% giá mua.'))return;
  const v=sellItem(it.iid);sel=null;render();toast('Đã xóa món đồ',{type:'coin',title:FURN[it.fid].n,coins:v});
}
function applySet(){S.set=S.set||{theme:'soft',dim:0};document.documentElement.dataset.theme=S.set.theme}
const scol=n=>S.set&&S.set.theme==='dark'?STAR[n].g:STAR[n]['c'];
function setTheme(t){S.set.theme=t;applySet();save();render();openSettings()}
function setBead(v){S.set.bead=v;save();fitCanvas();camY=VH;clampCam();openSettings()}
function openSettings(){
  applySet();
  modal('<h3>⚙️ Cài đặt</h3>'+
   '<div class="card" style="flex-direction:column;align-items:stretch"><b>Giao diện</b><div class="row"><button style="flex:1" class="'+(S.set.theme==='soft'?'on':'')+'" onclick="setTheme(\'soft\')">🌤 Trầm dịu</button><button style="flex:1" class="'+(S.set.theme==='dark'?'on':'')+'" onclick="setTheme(\'dark\')">🌙 Tối</button></div></div>'+
   '<div class="card" style="flex-direction:column;align-items:stretch"><b>Cỡ hạt cườm trong phòng</b><div class="row"><button style="flex:1" class="'+(S.set.bead?'':'on')+'" onclick="setBead(0)">Tự động</button><button style="flex:1" class="'+(S.set.bead?'on':'')+'" onclick="setBead(1)">Hạt to, rõ</button></div><small>'+(ZMIN>=6&&!S.set.bead?'Màn hình này đã đủ nét: mỗi hạt hiện '+ZMIN/2+' điểm ảnh nên thấy rõ dạng hạt.':'Tự động: thấy được nhiều phòng nhất, nhưng trên màn hình thường mỗi hạt chỉ 2 điểm ảnh. Hạt to: mỗi hạt ít nhất 3 điểm ảnh nên thấy rõ dạng hạt cườm, bù lại phải kéo để xem hết phòng.')+'</small></div>'+
   '<div class="card" style="flex-direction:column;align-items:stretch"><b>Độ tối nền phòng</b><input type="range" min="0" max="60" value="'+Math.round(S.set.dim*100)+'" oninput="S.set.dim=this.value/100" onchange="save()"><small>Kéo sang phải để nền phòng tối hơn. Mèo và đồ đạc không bị tối theo.</small></div>'+
   '<div class="card" style="flex-direction:column;align-items:stretch"><b>Công cụ thử nghiệm</b><div class="row wrap"><button class="sm" onclick="closeModal();doSkip()">⏩ Tua nhanh 10 phút</button><button class="sm bad" onclick="closeModal();resetAll()">🗑 Chơi lại từ đầu</button></div></div>'+
   '<button onclick="closeModal()">Đóng</button>');
}
const PANEL={
 home(){
  if(edit){
    const it=S.items.find(i=>i.iid===sel),kho=S.items.filter(i=>!i.room);
    return '<div class="card"><div class="g"><b>Chế độ sắp xếp</b><br><small>Kéo đồ trong phòng để di chuyển (bám theo lưới). Chạm vào một món để chọn rồi xoay, cất kho hoặc xóa.</small></div><button class="go" onclick="toggleEdit()">✓ Xong</button></div>'+
     (it?'<div class="card" style="flex-wrap:wrap">'+furnTag(it.fid)+'<div class="g"><b>'+FURN[it.fid].n+'</b>'+(it.broken?' <span style="color:var(--bad)">(hỏng)</span>':'')+'<br><small>'+FURN[it.fid].d+'</small></div><div class="row wrap" style="width:100%">'+(it.broken?'<button style="flex:1" onclick="doRepair('+it.iid+')">🔧 Sửa '+repairCost(it)+'</button>':'')+'<button style="flex:1" onclick="doFlip()">↔ Xoay</button><button style="flex:1" onclick="doStore()">📦 Cất kho</button><button style="flex:1" class="bad" onclick="doDelete()">🗑 Xóa</button></div></div>':'<div class="dim" style="margin-bottom:8px">Chưa chọn món nào.</div>')+
     '<h3>Kho đồ ('+kho.length+')</h3>'+(kho.length?kho.map(i=>'<div class="card">'+furnTag(i.fid)+'<div class="g"><b>'+FURN[i.fid].n+'</b>'+(i.broken?' <span style="color:var(--bad)">(hỏng)</span>':'')+'</div><button class="sm" onclick="doPlace('+i.iid+')">Đặt vào phòng</button></div>').join(''):'<div class="dim">Kho trống. Đồ mua ở Cửa hàng được đặt thẳng vào phòng đang xem.</div>');
  }
  const cats=catsIn(cur),bs=bowlsIn(cur),ready=bowlReady(cur),broken=itemsIn(cur).filter(i=>i.broken),left=bs.reduce((a,b)=>a+(b.left||0),0),cap=bowlCap(cur),hm=homeCats(cur).length;
  return '<div class="row" style="margin-bottom:8px"><button style="flex:1" class="'+(ready?'go':'')+'" '+(ready||!bs.length?'':'disabled')+' onclick="openFeed()">🍚 '+(!bs.length?'Chưa có bát ăn':ready?'Cho ăn':'Bát đổ lại được sau '+fmt(bowlNext(cur)-now()))+'</button><button onclick="toggleEdit()">✏️ Sắp xếp đồ</button></div>'+
   '<div class="dim" style="margin-bottom:8px">🍽️ '+bs.length+' bát · còn '+left+'/'+cap+' suất cho '+hm+' bé ở nhà'+(cap<hm?' · <b style="color:var(--bad)">Thiếu bát ăn, mua thêm ở Cửa hàng</b>':'')+'</div>'+
   broken.map(i=>'<div class="card"><div class="g">😾 <b>'+FURN[i.fid].n+'</b> bị cào hỏng, mất hiệu ứng.</div><button class="sm" onclick="doRepair('+i.iid+')">🔧 Sửa '+repairCost(i)+' xu</button></div>').join('')+
   (cats.length?cats.map(catCard).join(''):'<div class="dim">Phòng này chưa có bé nào. Vào Quản lý mèo để chuyển bé sang.</div>')+
   '<div class="dim">Kéo để xem phòng; giữ Ctrl rồi lăn chuột, chụm 2 ngón hoặc bấm ＋ － để phóng to thu nhỏ. Chạm vào mèo để theo dõi và vuốt ve (mỗi bé 20 giây cho xu một lần), chạm chỗ trống để thôi theo dõi; chạm vào thẻ bên dưới để xem thông tin và chuyển phòng. 🍗 no · ⚡ năng lượng · 😊 độ vui.</div>';
 },
 trip(){
  let h='';const ready=S.trips.filter(p=>p&&now()>=p.end).length;
  if(ready>1)h+='<button class="go" style="width:100%;margin-bottom:8px" onclick="doClaimAll()">Nhận tất cả ('+ready+')</button>';
  for(let i=0;i<5;i++){
    if(i>=slotCount()){h+='<div class="card" style="opacity:.55"><div class="g">🔒 Ô viễn chinh '+(i+1)+'<br><small>Mở ở cấp '+(1+2*i)+'</small></div></div>';continue}
    const p=S.trips[i];
    if(!p){h+='<div class="card"><div class="g">Ô viễn chinh '+(i+1)+'<br><small>Đang trống</small></div><button onclick="openPicker('+i+')">Chọn mèo</button></div>';continue}
    const c=catBy(p.uid),d=DEST[p.dest],left=p.end-now(),done=left<=0;
    h+='<div class="card">'+catTag(lk(c),1)+'<div class="g">'+nm(c)+' '+starsC(c)+'<br><small>'+d.ic+' '+d.n+' · '+(done?'đã về, đang ngồi chờ trước cửa!':'còn '+fmt(left))+'</small><div class="bar"><i style="width:'+Math.min(100,(1-left/p.dur)*100)+'%"></i></div></div>'+(done?'<button class="go" onclick="doClaim('+i+')">Nhận quà</button>':'')+'</div>';
  }
  return h+'<div class="dim">Mèo cần no trên 20 và đủ năng lượng mới đi được. Ô mở thêm ở cấp 3, 5, 7, 9; điểm đến mới mở dần theo cấp.</div>';
 },
 gacha(){
  const full=S.cats.length>=totalCap();
  return '<div class="card" style="flex-direction:column;text-align:center">'+furnTag('gift','#ffd24a',84,84)+'<div>Hộp quà mèo</div>'+
   (full?'<div class="dim">Các phòng đã đầy: bé mới sẽ vào Phòng chờ cho đến khi bạn xếp phòng.</div>':'')+
   '<div class="row wrap" style="justify-content:center"><button class="on" '+(S.coins<GACHA_COST?'disabled':'')+' onclick="doGacha(false)">Mở · '+GACHA_COST+' xu</button><button '+(S.tickets<1?'disabled':'')+' onclick="doGacha(true)">Dùng vé 🎟 ('+S.tickets+')</button></div>'+
   '<small>'+[1,2,3,4,5].map(s=>'<span style="color:'+scol(s)+'">'+s+'★ '+STAR[s].n+' '+STAR[s].p+'%</span>').join(' · ')+'</small>'+
   '<small>Bảo hiểm: chắc chắn 4★ trở lên sau '+PITY+' lượt (đã mở '+Math.min(S.pity,PITY)+'/'+PITY+'). Số trait bằng số sao. Mèo trang phục chỉ có ở 4★–5★; màu lông hiếm rơi khoảng '+Math.round(RARE_P*100)+'% mỗi lượt.</small></div>';
 },
 shop(){
  const tabs='<div class="row wrap" style="margin-bottom:8px"><button class="sm '+(shopT==='rooms'?'on':'')+'" onclick="shopT=\'rooms\';renderPanel()">🚪 Phòng</button>'+FCATS.map(c=>'<button class="sm '+(shopT===c[0]?'on':'')+'" onclick="shopT=\''+c[0]+'\';shopSel=null;renderPanel()">'+c[1]+'</button>').join('')+'</div>';
  if(shopT==='rooms')return tabs+ROOMS.filter(r=>r.price).map(r=>'<div class="card"><div style="font-size:26px">'+(S.rooms[r.id]?'✅':'🚪')+'</div><div class="g"><b>'+r.n+'</b> <small>· chứa '+r.cap+' mèo</small><br><small>'+r.d+'</small></div>'+(S.rooms[r.id]?'<button class="sm" onclick="setRoom(\''+r.id+'\');setTab(\'home\')">Vào xem</button>':'<button class="sm" '+(S.coins<r.price?'disabled':'')+' onclick="doBuyRoom(\''+r.id+'\')">🪙 '+r.price.toLocaleString('vi-VN')+'</button>')+'</div>').join('');
  const items=FURNS.filter(f=>f.cat===shopT),f=FURN[shopSel]&&FURN[shopSel].cat===shopT?FURN[shopSel]:items[0],own=S.items.filter(i=>i.fid===f.id).length;
  const KIND={floor:'Đặt sàn',wall:'Treo tường',rug:'Thảm trải sàn'};
  return tabs+'<div class="card prev"><div class="pv">'+furnTag(f.id,'',150,110)+'</div><div class="g"><b style="font-size:16px">'+f.n+'</b>'+(f.set?' <span class="tag x">Bộ '+f.set+'</span>':'')+'<br><small>'+KIND[f.kind]+(f.use?' · mèo tương tác được':'')+(own?' · đang có '+own:'')+'</small><br>'+f.d+
    '<div style="margin-top:8px"><button class="on" '+(S.coins<f.price?'disabled':'')+' onclick="doBuy(\''+f.id+'\')">Mua · 🪙 '+f.price.toLocaleString('vi-VN')+'</button></div><small>Sẽ đặt vào '+ROOM[cur].n+'</small></div></div>'+
   '<div class="grid">'+items.map(x=>'<div class="cell tap'+(x.id===f.id?' sel':'')+'" onclick="shopSel=\''+x.id+'\';renderPanel()"><div class="ic">'+furnTag(x.id,'',64,44)+'</div><b>'+x.n+'</b><br><span style="color:var(--gold)">🪙 '+x.price.toLocaleString('vi-VN')+'</span></div>').join('')+'</div>'+
   '<div class="dim" style="margin-top:8px">Mỗi loại đồ chỉ tính hiệu ứng một lần. Độ vui từ nội thất trong một phòng tối đa +'+HAPPY_CAP+'; xu và tốc độ tính cho cả nhà.</div>';
 },
 cats(){
  const rooms=ownedRooms().concat([ROOM.wait]),cnt=r=>catsIn(r.id).length,full=r=>cnt(r)>=r.cap,cap=r=>r.wait?'∞':r.cap;
  const SORT={star:['Sao',(a,b)=>b.star-a.star],breed:['Giống',(a,b)=>SP[a.sp].n.localeCompare(SP[b.sp].n,'vi')],room:['Phòng',(a,b)=>ROOM[a.room].n.localeCompare(ROOM[b.room].n,'vi')],full:['Đói nhất',(a,b)=>a.full-b.full],hp:['Buồn nhất',(a,b)=>a.hp-b.hp]};
  const list=S.cats.filter(c=>mg.room==='all'||c.room===mg.room).sort(SORT[mg.sort][1]);
  return '<div class="dim" style="margin-bottom:6px">Chạm một ô phòng để lọc. Đổi phòng bằng ô chọn trên mỗi thẻ, hoặc kéo thẻ mèo thả vào ô phòng (trên máy tính).</div>'+
   '<div class="rchips">'+rooms.map(r=>'<div class="rchip'+(full(r)?' full':'')+(mg.room===r.id?' on':'')+'" onclick="mg.room=mg.room===\''+r.id+'\'?\'all\':\''+r.id+'\';renderPanel()" ondragover="event.preventDefault();this.classList.add(\'over\')" ondragleave="this.classList.remove(\'over\')" ondrop="event.preventDefault();mgMove(+event.dataTransfer.getData(\'text\'),\''+r.id+'\')"><b>'+r.n+'</b><br>'+cnt(r)+'/'+cap(r)+(full(r)?' · <span style="color:var(--bad)">ĐẦY</span>':'')+'</div>').join('')+'</div>'+
   '<div class="row wrap" style="margin:8px 0"><button class="sm '+(mg.multi?'on':'')+'" onclick="mg.multi=!mg.multi;mg.sel={};renderPanel()">☑ Chọn nhiều</button>'+(mg.multi?'<button class="sm" onclick="list_all()">Chọn hết danh sách</button><button class="sm bad" '+(Object.keys(mg.sel).length?'':'disabled')+' onclick="askRelease(Object.keys(mg.sel).map(Number))">🕊 Phóng sinh '+Object.keys(mg.sel).length+' bé</button>':'')+'</div>'+
   '<div class="row wrap" style="margin:8px 0"><b>Sắp xếp:</b>'+Object.keys(SORT).map(k=>'<button class="sm '+(mg.sort===k?'on':'')+'" onclick="mg.sort=\''+k+'\';renderPanel()">'+SORT[k][0]+'</button>').join('')+'</div>'+
   (list.length?list.map(c=>{const away=onTrip(c.uid);
     return '<div class="card'+(mg.multi&&mg.sel[c.uid]?' sel':'')+'" '+(mg.multi&&!away?'onclick="mgSel('+c.uid+')" ':'')+'draggable="'+(!away&&!mg.multi)+'" ondragstart="event.dataTransfer.setData(\'text\',\''+c.uid+'\')">'+(mg.multi?'<div style="font-size:24px">'+(away?'🎒':mg.sel[c.uid]?'☑':'☐')+'</div>':'')+'<div class="tap" onclick="'+(mg.multi?'':'openCat('+c.uid+')')+'">'+catTag(lk(c),1.5)+'</div><div class="g">'+nm(c)+' '+sexIc(c)+' '+starsC(c)+'<br><small>'+kind(c)+'</small><br>'+stats(c)+'<div>'+coatTags(c)+c.traits.map(t=>tagOf(t)).join('')+'</div>'+
       '<div class="row" style="margin-top:6px" onclick="event.stopPropagation()"><select style="flex:1" aria-label="Phòng của '+esc(c.name)+'" '+(away?'disabled':'')+' onchange="mgMove('+c.uid+',this.value)">'+rooms.map(r=>'<option value="'+r.id+'" '+(r.id===c.room?'selected':'')+' '+(r.id!==c.room&&full(r)?'disabled':'')+'>'+r.n+' · '+cnt(r)+'/'+cap(r)+(full(r)?' (đầy)':'')+'</option>').join('')+'</select>'+(away?'<small>đang viễn chinh</small>':'')+'</div></div></div>'}).join('')
     :'<div class="dim">Không có bé nào ở '+ROOM[mg.room].n+'.</div>');
 },
 album(){
  const of=g=>g==='breed'?BREEDS:VARIANTS.filter(v=>v.g===g),sc=S.seenCoat||{},sr=S.seenRare||{};
  const nCoat=b=>b.coats.filter(k=>sc[b.id+'~'+k]).length;
  const tabs='<div class="row wrap" style="margin-bottom:8px">'+GROUPS.map(g=>'<button class="sm '+(albumG===g[0]?'on':'')+'" onclick="albumG=\''+g[0]+'\';renderPanel()">'+g[1]+' '+(g[0]==='rare'?RARES.filter(r=>sr[r.id]).length+'/'+RARES.length:of(g[0]).filter(x=>S.seen[x.id]).length+'/'+of(g[0]).length)+'</button>').join('')+'</div>';
  if(albumG==='rare')return tabs+'<div class="dim" style="margin-bottom:8px">Màu hiếm có thể rơi vào bất kỳ giống nào, khoảng '+Math.round(RARE_P*100)+'% mỗi lượt gacha, luôn là 4★.</div><div class="grid">'+RARES.map(r=>
    sr[r.id]?'<div class="cell">'+catTag(sr[r.id]+'~'+r.id,1.5)+'<br><b style="color:'+scol(4)+'">'+r.n+'</b><br>'+starsOf(4,1)+'<br><span class="dim" style="font-size:11px">gặp lần đầu ở '+SP[sr[r.id]].n+'<br>'+tagOf(r.tr)+'</span></div>'
             :'<div class="cell" style="opacity:.75"><div style="font-size:44px;line-height:80px;color:var(--dim)">?</div><b style="color:'+scol(4)+'">???</b></div>').join('')+'</div>';
  const all=of(albumG).slice().sort((a,b)=>a.r-b.r);
  return tabs+(albumG==='breed'?'<div class="dim" style="margin-bottom:8px">Chạm vào một giống đã gặp để xem các màu lông của giống đó.</div>':'')+'<div class="grid">'+all.map(s=>
    S.seen[s.id]?'<div class="cell'+(s.coats?' tap" onclick="openBreed(\''+s.id+'\')':'')+'">'+catTag(s.id,1.5)+'<br><b style="color:'+scol(s.r)+'">'+s.n+'</b><br>'+starsOf(s.r)+(s.coats?'<br><b>'+(s.xt?'Trang phục':'Màu')+': '+nCoat(s)+'/'+s.coats.length+'</b>':'')+'<br><span class="dim" style="font-size:11px">'+s.d+(s.xt?'<br>'+tagOf(s.xt):'')+'</span>'+(s.r===5?'<br><button class="sm" onclick="event.stopPropagation();replayIntro(\''+s.id+'\')">▶ Xem lại intro</button>':'')+'</div>'
               :'<div class="cell unk">'+catTag(s.id,1.5)+'<br><b style="color:'+scol(s.r)+'">???</b><br>'+starsOf(s.r)+'</div>').join('')+'</div>';
 }
};
function openBreed(id){
  const b=SP[id],sc=S.seenCoat||{};
  modal('<h3>'+b.n+' '+starsOf(b.r)+'</h3><div class="dim">'+b.d+(b.short?' Giống chân ngắn.':'')+'</div><div class="grid" style="grid-template-columns:repeat(2,1fr);margin:10px 0">'+b.coats.map(k=>{const ct=COATS[k];
    return sc[id+'~'+k]?'<div class="cell">'+catTag(id+'~'+k,2)+'<br><b>'+(ct.form?'✨ ':ct.u?'✦ ':'')+ct.n+'</b>'+(ct.f>=.99?'<br><span class="dim">gần như luôn là cái</span>':ct.f<=.25?'<br><span class="dim">đa số là đực</span>':'')+'</div>'
                       :'<div class="cell unk">'+catTag(id+'~'+k,2)+'<br><b>???</b>'+(ct.form?'<br><span class="dim">trang phục hiếm</span>':ct.u?'<br><span class="dim">màu ít gặp</span>':'')+'</div>'}).join('')+'</div><button onclick="closeModal()">Đóng</button>');
}

/* ============ ADMIN (chỉ để test): Ctrl+Shift+A, hoặc chạm 7 lần liên tiếp vào tên game ============ */
const MAXC=999999999;
function openAdmin(){
  if(typeof NET!=='undefined'&&NET.on&&!NET.admOk){netAdminLogin();return} // chạy qua máy chủ chung: chỉ quản trị viên (có mã) mới mở được bảng Admin
  S.adm=S.adm||{};
  const og=g=>'<optgroup label="'+g[1]+'">'+(g[0]==='breed'?BREEDS:VARIANTS.filter(v=>v.g===g[0])).slice().sort((a,b)=>b.r-a.r).map(x=>'<option value="'+x.id+'">'+x.r+'★ '+esc(x.n)+'</option>').join('')+'</optgroup>';
  const stars='<option value="0">theo mặc định</option>'+[1,2,3,4,5].map(n=>'<option value="'+n+'">'+n+'★</option>').join('');
  const sel='font:inherit;color:var(--ink);background:var(--panel);border:2px solid var(--line);border-radius:10px;padding:6px;min-width:0;flex:1';
  const box=(t,h)=>'<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>'+t+'</b>'+h+'</div>';
  modal('<h3>🛠 Bảng Admin <span class="dim">· chỉ để test</span></h3>'+(typeof netAdminBox==='function'?netAdminBox():'')+
    box('Xu (đang có '+S.coins.toLocaleString('vi-VN')+')','<div class="row"><input id="axu" type="number" min="0" value="'+S.coins+'"><button class="sm on" onclick="admCoins(\'set\')">Đặt</button></div><div class="row wrap"><button class="sm" onclick="admCoins(1000)">+1.000</button><button class="sm" onclick="admCoins(100000)">+100.000</button><button class="sm" onclick="admCoins(\'max\')">Max xu</button><button class="sm '+(S.adm.inf?'go':'')+'" onclick="admInf()">Xu vô hạn: '+(S.adm.inf?'BẬT':'tắt')+'</button></div>')+
    box('Nhận mèo bất kỳ','<div class="row"><select id="asp" onchange="admCoats()" style="'+sel+'">'+GROUPS.map(og).join('')+'</select></div><div class="row"><select id="ast" style="'+sel+'">'+stars+'</select><select id="act" style="'+sel+'"></select></div><div class="row"><label class="dim" style="white-space:nowrap"><input id="aintro" type="checkbox" checked style="flex:none"> xem hoạt ảnh</label><button class="sm on" onclick="admCat()">Nhận</button></div><div class="dim">Muốn test intro 5★ thì chọn một bé 5★ và để số sao mặc định. Ô màu đổi theo giống đang chọn: màu thường của giống, 💎 mắt quý hiếm, ⚡ trang phục hiếm, ✨ màu hiếm (luôn 4★; không có ở giống trụi lông, Lykoi và mèo trang phục).</div>')+
    box('Gacha miễn phí','<div class="row"><select id="ags" style="'+sel+'"><option value="0">sao ngẫu nhiên</option>'+[1,2,3,4,5].map(n=>'<option value="'+n+'">ép ra '+n+'★</option>').join('')+'<option value="r">ép ra ✨ màu hiếm bất kỳ</option>'+RARES.map(r=>'<option value="'+r.id+'">ép ra ✨ '+r.n+'</option>').join('')+'</select><button class="sm on" onclick="admGacha()">Quay</button></div>')+
    box('Mở khóa','<div class="row wrap"><button class="sm" onclick="admRooms()">Mở mọi phòng</button><button class="sm" onclick="admFurn()">Nhận đủ nội thất</button><button class="sm" onclick="admBowl()">Bát ăn sẵn sàng ngay</button><button class="sm" onclick="admLevel()">Lên cấp 9</button></div><div class="dim">Thức ăn vốn không bị khóa; bật xu vô hạn là mua được mọi món.</div>')+
    box('Mèo và viễn chinh','<div class="row wrap"><button class="sm" onclick="admTrips()">Hoàn tất viễn chinh ngay</button><button class="sm" onclick="admStats()">Hồi đầy no, vui, năng lượng</button></div><div class="row wrap"><button class="sm" onclick="admAge(10)">Cả đàn già thêm 10 ngày</button><button class="sm" onclick="admAge(0)">Cả đàn thành mèo con</button></div>')+
    '<div class="row" style="justify-content:center"><button class="sm bad" onclick="closeModal();resetAll()">Reset toàn bộ dữ liệu</button><button class="sm" onclick="closeModal()">Đóng</button></div>');
  admCoats();
}
// ô chọn màu trong Admin: liệt kê đúng các màu của giống đang chọn, rồi tới các màu hiếm nếu giống đó nhận được
function admCoats(a,b){
  const s0=$(a||'asp'),el=$(b||'act');if(!s0||!el)return;const sp=SP[s0.value];
  const own=(sp.coats||[]).map(k=>{const c=COATS[k];return '<option value="'+k+'">'+(c.jewel?'💎 ':c.form?'⚡ ':'')+esc(c.n)+(c.jewel?' (mắt quý hiếm)':c.form?' (trang phục hiếm)':'')+'</option>'}).join('');
  el.innerHTML='<option value="">'+(sp.coats?'ngẫu nhiên theo tỉ lệ':'không có màu để chọn')+'</option>'+(own?'<optgroup label="'+(sp.xt?'Trang phục':'Màu')+' của '+esc(sp.n)+'">'+own+'</optgroup>':'')+
    (sp.coats&&!sp.noRare?'<optgroup label="✨ Màu hiếm (luôn 4★)">'+RARES.map(r=>'<option value="'+r.id+'">✨ '+esc(r.n)+'</option>').join('')+'</optgroup>':'');
}
const admDone=(msg,keep)=>{save();render();if(keep)openAdmin();toast(msg,{icon:'🛠',title:'Admin'})};
function admCoins(v){
  if(v==='max')S.coins=MAXC;else if(v==='set')S.coins=clamp(Math.floor(+$('axu').value||0),0,MAXC);else S.coins=Math.min(MAXC,S.coins+v);
  admDone('Xu hiện có: '+S.coins.toLocaleString('vi-VN'),1);
}
function admInf(){S.adm.inf=!S.adm.inf;if(S.adm.inf)S.coins=MAXC;admDone('Xu vô hạn: '+(S.adm.inf?'bật':'tắt'),1)}
function admCat(){
  const sp=SP[$('asp').value],av=$('act').value,rc=sp.coats&&(sp.coats.includes(av)||(RARE[av]&&!sp.noRare))?av:'',star=+$('ast').value||(RARE[rc]?4:sp.r),show=$('aintro').checked;
  const c=newCat(sp,star,rc||undefined);c.room=freeRoom();c.isNew=!S.seen[sp.id]||!!(sp.coats&&!RARE[rc]&&!(S.seenCoat||{})[lk(c)]);S.cats.push(c);markSeen(c);save();closeModal();
  if(show){render();playGacha(c)}else{delete c.isNew;syncEnts();admDone('Đã nhận '+sp.n+' '+star+'★')}
}
function admGacha(){const v=$('ags').value,r=gachaRoll(false,RARE[v]||v==='r'?{free:1,rare:RARE[v]?v:true}:{free:1,star:+v});closeModal();render();playGacha(r.cat)}
function admRooms(){ROOMS.forEach(r=>{if(!S.rooms[r.id]){S.rooms[r.id]={bowlAt:0};giveBowl(r.id)}});admDone('Đã mở cả '+ROOMS.length+' phòng',1)}
function admFurn(){let n=0;FURNS.forEach(f=>{if(!S.items.some(i=>i.fid===f.id)){S.items.push({iid:S.nid++,fid:f.id,room:null,x:120,y:140,flip:false,broken:false});n++}});admDone(n?'Đã thêm '+n+' món vào kho (Nhà → Sắp xếp để đặt)':'Bạn đã có đủ mọi loại nội thất',1)}
function admBowl(){S.items.forEach(i=>{if(FURN[i.fid].bowl)i.at=0});admDone('Mọi bát ăn đã sẵn sàng',1)}
function admLevel(){if(S.level<9){S.level=9;S.xp=0;fixSlots()}admDone('Đang ở cấp '+S.level+': đủ 5 ô viễn chinh và mọi điểm đến',1)}
function admTrips(){let n=0;S.trips.forEach(p=>{if(p&&p.end>now()){p.end=now();n++}});admDone(n?n+' chuyến đã về, vào tab Viễn chinh để nhận':'Không có chuyến nào đang đi',1)}
function admAge(n){S.cats.forEach(c=>{c.born=n?c.born-n*DAY:now()});const k=[0,1,2].map(i=>S.cats.filter(c=>ageStage(c)===i).length);admDone('Tuổi: '+k[0]+' mèo con, '+k[1]+' trưởng thành, '+k[2]+' mèo già',1)}
function admStats(){S.cats.forEach(c=>{c.full=100;c.en=100;c.hp=100});admDone('Cả '+S.cats.length+' bé đã no, vui và đầy năng lượng',1)}
addEventListener('keydown',ev=>{if(ev.ctrlKey&&ev.shiftKey&&ev.code==='KeyA'){ev.preventDefault();openAdmin()}});
{let n=0,t0=0;document.querySelector('h1').addEventListener('click',()=>{const t=Date.now();n=t-t0<600?n+1:1;t0=t;if(n>=7){n=0;openAdmin()}})}

/* ============ VÒNG LẶP ============ */
load();applySet();$('app').dataset.tab=tab;fitCanvas();syncEnts();render();
fitCanvas();camY=VH;clampCam(); // đo lại sau khi thanh trên, tên phòng và menu đã có nội dung (nếu không khung phòng lần đầu cao quá cửa sổ), rồi nhìn lại sát sàn
if(AWAY.n)setTimeout(()=>toast(AWAY.n+' suất đã được các bé tự ra ăn'+(AWAY.cost?' · máy cho ăn tốn '+AWAY.cost+' xu':''),{type:'feed',title:'Lúc bạn vắng',coins:AWAY.coins,ms:5200}),600);
let last=performance.now();
function loop(t){const dt=Math.min(.1,(t-last)/1000);last=t;ents.forEach(e=>stepEnt(e,dt));if(ents.some(e=>e.dead))ents=ents.filter(e=>!e.dead);stepParts(dt);if(tab==='home'){stepCam(dt);drawRoom()}requestAnimationFrame(loop)}
requestAnimationFrame(loop);
let lastTick=now(),sec=0;
setInterval(()=>{
  const n=now();tick((n-lastTick)/1000);lastTick=n;sec++;
  renderTop();if(fol)showFol();
  if($('modal').style.display==='flex')return;
  if((tab==='home'&&!edit)||tab==='trip')renderPanel();
  if(sec%10===0)save();
},1000);
