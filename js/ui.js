"use strict";
/* ============ GIAO DIỆN ============ */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const BS=5; // mỗi ô vẽ thành một hạt cườm tròn 4px, hở 1px
function bufCanvas(b){
  const c=document.createElement('canvas');c.width=b.w*BS;c.height=b.h*BS;const g=c.getContext('2d');
  for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++){const p=b.c[y*b.w+x];if(!p)continue;
    const a=p.length===4?p[3]/255:1,L=v=>Math.round(v+(255-v)*.42);
    g.fillStyle='rgba('+L(p[0])+','+L(p[1])+','+L(p[2])+','+a+')';g.fillRect(x*BS,y*BS,BS,BS); // nền nhạt để khe giữa các hạt không bị xuyên thấu
    g.fillStyle='rgba('+p[0]+','+p[1]+','+p[2]+','+a+')';g.fillRect(x*BS+1,y*BS,2,4);g.fillRect(x*BS,y*BS+1,4,2)}
  return c;
}
const CC={},CI={},FC={},FI={};
const catCv=(sp,pose)=>{const k=sp+'|'+(pose||'sit');return CC[k]||(CC[k]=bufCanvas(Art.cat(SP[sp],pose)))};
const catImg=sp=>CI[sp]||(CI[sp]=catCv(sp).toDataURL());
const furnCv=(id,v)=>{const k=id+'|'+(v||'');return FC[k]||(FC[k]=bufCanvas(Art.furn(id,v)))};
const furnImg=(id,v)=>{const k=id+'|'+(v||'');return FI[k]||(FI[k]=furnCv(id,v).toDataURL())};
const sexIc=c=>c.sex==='f'?'<span class="f">♀</span>':'<span class="m">♂</span>';
const starsOf=n=>'<span style="color:'+STAR[n].c+'">'+'★'.repeat(n)+'</span>';
const tagOf=(t,extra)=>'<span class="tag '+TRAITS[t].k+'" tabindex="0" data-tip="'+esc(TRAITS[t].d)+'">'+TRAITS[t].n+(extra?' · '+extra:'')+'</span>';
const stat=(ic,v,col)=>'<span class="stat">'+ic+'<span class="bar"><i style="width:'+Math.round(v)+'%;background:'+col+'"></i></span></span>';
const stats=c=>stat('🍗',c.full,c.full<20?'#ff6b6b':'#ffb347')+stat('⚡',c.en,'#7fb7ff')+stat('😊',c.hp,'#5fd08a');

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

/* ============ PHÒNG ============ */
const VW=240,VH=170,BOWL={x:70,y:158};
const room=$('room'),RX=room.getContext('2d');
room.width=VW*BS;room.height=VH*BS;
let cur='living',camX=0,edit=false,sel=null,ents=[];
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
  ents=ents.filter(e=>home.some(c=>c.uid===e.uid));
  home.forEach(c=>{if(!ents.some(e=>e.uid===c.uid)){const e={uid:c.uid,x:0,y:0,tx:0,ty:0,state:'idle',t:rnd(0,2.5),flip:Math.random()<.5,goal:null,emo:null,emoT:0,wt:rnd(0,5),left:0};const p=freeSpot(e);e.x=p.x;e.y=p.y;ents.push(e)}});
}
function setRoom(rid){cur=rid;camX=0;sel=null;ents=[];syncEnts();render()}
function navRoom(d){const o=ownedRooms(),i=o.findIndex(r=>r.id===cur);setRoom(o[(i+d+o.length)%o.length].id)}
function goItem(e,it){
  const u=FURN[it.fid].use,c=catBy(e.uid);
  e.goal={iid:it.iid};e.tx=clamp(it.x+(it.flip?-1:1)*(u.dx||0)+rnd(-2,2),14,WORLD_W-14);
  e.ty=u.floor||FURN[it.fid].kind==='wall'?rnd(FLOOR_MIN+2,FLOOR_MIN+12):clamp(it.y+2,FLOOR_MIN,FLOOR_MAX);
  e.state=c&&vigor(c)>0&&Math.random()<.5?'run':'walk';e.left=0;e.emo=null;
}
function runTarget(e){
  let x=rnd(16,WORLD_W-16); if(Math.abs(x-e.x)<70)x=clamp(e.x+(Math.random()<.5?-1:1)*rnd(80,200),16,WORLD_W-16);
  e.tx=x;e.ty=rnd(FLOOR_MIN,FLOOR_MAX);
}
// chọn việc tiếp theo; trait quyết định bé hay chạy nhảy hay hay nằm
function choose(e){
  const c=catBy(e.uid); if(!c)return;
  const k=vigor(c),r=Math.random();
  e.goal=null;e.emo=null;
  let a=k<0?.32:k>0?.06:.14;
  if(r<a||c.en<25){e.state='nap';e.t=rnd(6,12);e.emo='z';return}
  a+=.14; if(r<a){e.state='groom';e.t=rnd(3,6);return}
  a+=k>0?.26:k<0?.03:.1; if(r<a){e.state='run';e.left=1+Math.floor(rnd(1,4));runTarget(e);return}
  a+=.28; if(r<a){
    const free=itemsIn(cur).filter(i=>FURN[i.fid].use&&(FURN[i.fid].use.floor||!ents.some(o=>o!==e&&o.goal&&o.goal.iid===i.iid)));
    if(free.length){goItem(e,pick(free));return}
  }
  a+=.12; if(r<a){e.state='idle';e.t=rnd(1.5,4);return}
  const p=freeSpot(e);e.tx=p.x;e.ty=p.y;e.state='walk';
}
const usePos=(it)=>{const u=FURN[it.fid].use;return {x:it.x+(it.flip?-1:1)*u.dx,y:it.y+u.dy}};
function arrive(e){
  if(e.goal&&e.goal.bowl){e.state='use';e.t=rnd(5,9);e.emo='heart';return}
  const it=e.goal&&e.goal.iid&&S.items.find(i=>i.iid===e.goal.iid&&i.room===cur);
  if(it){
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
  e.wt+=dt;
  const c=catBy(e.uid); if(!c)return;
  if(e.state==='walk'||e.state==='run'){
    const k=vigor(c),sp=(e.state==='run'?58:13)*(k>0?1.15:k<0?.8:1),dx=e.tx-e.x,dy=e.ty-e.y,d=Math.hypot(dx,dy);
    if(d<=Math.max(1.2,sp*dt)){e.x=e.tx;e.y=e.ty;arrive(e)}
    else{e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt;if(Math.abs(dx)>.5)e.flip=dx>0}
  }else if(e.state==='jump'){
    e.jt+=dt;
    if(e.jt>=e.jd){
      if(e.j.next==='use'){const it=S.items.find(i=>i.iid===e.goal.iid);e.state='use';e.t=rnd(5,10);e.emo=it?FURN[it.fid].use.emo:null}
      else{e.x=e.j.tx;e.y=e.j.ty;e.goal=null;e.state='idle';e.t=rnd(.5,1.5)}
    }
  }else{
    e.t-=dt;
    if(e.t<=0){
      e.emo=null;
      const it=e.state==='use'&&e.goal&&e.goal.iid&&S.items.find(i=>i.iid===e.goal.iid&&i.room===cur);
      if(it&&!FURN[it.fid].use.floor&&FURN[it.fid].use.dy<=-4){const q=usePos(it);e.j={fx:q.x,fy:q.y,tx:e.x,ty:e.y,sy:it.y+.5,next:'idle'};e.jt=0;e.jd=clamp(Math.abs(q.y-e.y)/90+.35,.35,.9);e.state='jump'}
      else choose(e);
    }
  }
}
// vị trí vẽ, thứ tự trước sau và tư thế của một bé
function entPos(e){
  if(e.state==='jump'){
    const k=clamp(e.jt/e.jd,0,1),j=e.j;
    return {x:j.fx+(j.tx-j.fx)*k,y:j.fy+(j.ty-j.fy)*k-Math.sin(Math.PI*k)*(10+Math.abs(j.ty-j.fy)*.25),sy:j.sy,pose:'jump'};
  }
  if(e.state==='use'&&e.goal&&e.goal.iid){
    const it=S.items.find(i=>i.iid===e.goal.iid);
    if(!it||it.room!==cur){e.state='idle';e.goal=null;e.t=1;e.emo=null}
    else{const u=FURN[it.fid].use;if(!u.floor){const q=usePos(it);return {x:q.x,y:q.y,sy:it.y+(u.front?.5:-.5),pose:u.sleep?'sleep':'sit'}}}
  }
  const pose=e.state==='nap'?'sleep':e.state==='groom'?'groom'+Math.floor(e.wt*3)%2:e.state==='walk'?'walk'+Math.floor(e.wt*4)%2:e.state==='run'?'run'+Math.floor(e.wt*10)%2:'sit';
  return {x:e.x,y:e.y,sy:e.y,pose};
}
const EMO={z:["###","..#",".#.","#..","###"],heart:[".#.#.","#####","#####",".###.","..#.."],note:["..##","..#.","..#.","###.","###."],excl:["#","#","#",".","#"]};
const EMOC={z:'#a58e7a',heart:'#f0708a',note:'#e0a020',excl:'#e0a020'};
function drawEmo(n,x,y,col){RX.fillStyle=col||EMOC[n];EMO[n].forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='#')RX.fillRect(x+i,y+j,1,1)})}
function drawBg(g,rid){
  const F=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)},W=WORLD_W,Y=WALL_Y;
  const dots=(c,sx,sy,y0,y1,off)=>{for(let y=y0,j=0;y<y1;y+=sy,j++)for(let x=(j%2?off:0)+4;x<W;x+=sx)F(x,y,2,2,c)};
  if(rid==='bedroom'){
    F(0,0,W,Y,'#d0cce0');for(let i=0;i<40;i++)F((i*97)%W,(i*53)%(Y-14)+4,2,2,'#f1e4b6');F(0,Y-4,W,4,'#b9b2d0');
    F(0,Y,W,VH-Y,'#c2b7d2');dots('#b2a6c5',20,12,Y+8,VH,10);
  }else if(rid==='balcony'){
    F(0,0,W,Y,'#cbdde6');F(40,14,30,6,'#f4f1ea');F(50,10,16,5,'#f4f1ea');F(300,22,36,6,'#f4f1ea');F(312,17,18,6,'#f4f1ea');
    for(let i=0;i<12;i++){const h=20+(i*37)%40;F(i*42,Y-22-h,34,h+22,i%2?'#b3c7d5':'#bed1dd');for(let y=Y-18-h;y<Y-26;y+=8)for(let x=i*42+4;x<i*42+30;x+=8)F(x,y,3,4,'#d9e6ec')}
    F(0,Y-24,W,3,'#f1eadc');for(let x=4;x<W;x+=14)F(x,Y-24,2,24,'#f1eadc');
    F(0,Y,W,VH-Y,'#d9ccb4');for(let x=0;x<W;x+=24)F(x,Y,1,VH-Y,'#c7b99e');for(let y=Y+18;y<VH;y+=18)F(0,y,W,1,'#c7b99e');
  }else if(rid==='playroom'){
    F(0,0,W,Y,'#cbdcd0');dots('#b8cebf',24,18,10,Y-8,12);F(0,Y-4,W,4,'#abc3b3');
    for(let y=Y,j=0;y<VH;y+=19,j++)for(let x=0,i=0;x<W;x+=30,i++)F(x,y,30,19,(i+j)%2?'#e2cfa6':'#d8c292');
  }else if(rid==='garden'){
    F(0,0,W,Y,'#cce0e6');F(80,12,34,6,'#f4f1ea');F(92,8,16,5,'#f4f1ea');F(350,20,30,6,'#f4f1ea');F(410,10,6,6,'#fff0b0');
    F(0,Y-36,W,36,'#a5c79f');for(let x=0;x<W;x+=22)F(x+3,Y-41,16,6,'#a5c79f');for(let x=8;x<W;x+=34)F(x,Y-26+(x%3)*5,3,3,'#f7a8b8');
    F(0,Y,W,VH-Y,'#bcd4aa');for(let i=0;i<70;i++)F((i*61)%W,Y+4+(i*29)%(VH-Y-6),2,2,i%3?'#a9c696':'#cfe3bf');
  }else{
    F(0,0,W,Y,'#e4d6c3');for(let x=12;x<W;x+=24)F(x,0,2,Y,'#dccdb8');F(0,Y-4,W,4,'#c9b59c');
    F(0,Y,W,VH-Y,'#d3ba95');for(let y=Y+14;y<VH;y+=15)F(0,y,W,1,'#c2a780');for(let y=Y,j=0;y<VH;y+=15,j++)for(let x=(j%2?30:0);x<W;x+=60)F(x,y,1,15,'#c2a780');
  }
}
function drawItem(i){
  const f=FURN[i.fid],cv=furnCv(i.fid,i.broken?'broken':''),x0=Math.round(i.x-f.w/2),y0=Math.round(i.y-f.h);
  if(i.flip){RX.save();RX.translate(x0+f.w,y0);RX.scale(-1,1);RX.drawImage(cv,0,0,f.w,f.h);RX.restore()}else RX.drawImage(cv,x0,y0,f.w,f.h);
  if(edit&&sel===i.iid){RX.strokeStyle='#e58aa0';RX.lineWidth=1;RX.setLineDash([3,2]);RX.strokeRect(x0-1.5,y0-1.5,f.w+3,f.h+3);RX.setLineDash([])}
}
function drawEnt(e,p){
  const c=catBy(e.uid); if(!c)return;
  const cv=catCv(c.sp,p.pose),hop=p.pose==='walk1'?1:p.pose==='run1'?2.4:0;
  const px=Math.round((p.x-18)*BS)/BS,py=Math.round((p.y-39-hop)*BS)/BS; // bước 1/5 ô để chuyển động mượt
  if(e.flip){RX.save();RX.translate(px+36,py);RX.scale(-1,1);RX.drawImage(cv,0,0,36,40);RX.restore()}else RX.drawImage(cv,px,py,36,40);
  const t=performance.now()/1000,ex=Math.round(px),by=Math.round(py+Math.sin(t*3+ex));
  if(e.emoT>0)drawEmo('heart',ex+26,by);
  else if(c.full<20)drawEmo('excl',ex+28,by,'#d95a5a');
  else if(e.emo&&e.state!=='jump')drawEmo(e.emo,ex+26,by);
}
function drawRoom(){
  const g=RX;g.imageSmoothingEnabled=false;g.setTransform(BS,0,0,BS,0,0);g.clearRect(0,0,VW,VH);g.translate(-Math.round(camX),0);
  drawBg(g,cur);
  const its=itemsIn(cur);
  its.filter(i=>FURN[i.fid].kind==='rug').forEach(drawItem);
  its.filter(i=>FURN[i.fid].kind==='wall').forEach(drawItem);
  const list=its.filter(i=>FURN[i.fid].kind==='floor').map(i=>({y:i.y,f:()=>drawItem(i)}));
  list.push({y:BOWL.y,f:()=>g.drawImage(furnCv('bowl',bowlReady(cur)?'':'full'),BOWL.x-9,BOWL.y-10,18,10)});
  ents.forEach(e=>{const p=entPos(e);list.push({y:p.sy,f:()=>drawEnt(e,p)})});
  list.sort((a,b)=>a.y-b.y).forEach(o=>o.f());
  g.setTransform(BS,0,0,BS,0,0);
  g.fillStyle='rgba(150,100,70,.5)';
  if(camX<WORLD_W-VW-1)for(let i=0;i<4;i++)g.fillRect(VW-7+i,81+i,1,8-2*i);
  if(camX>1)for(let i=0;i<4;i++)g.fillRect(6-i,81+i,1,8-2*i);
}
/* --- chuột/chạm: kéo để cuộn, chạm mèo để vuốt, chế độ sắp xếp thì kéo đồ --- */
let ptr=null;
const ppos=ev=>{const b=room.getBoundingClientRect();return {x:(ev.clientX-b.left)/b.width*VW,y:(ev.clientY-b.top)/b.height*VH}};
function hitItem(wx,y){
  const order={rug:0,wall:1,floor:2};
  return itemsIn(cur).slice().sort((a,b)=>(order[FURN[b.fid].kind]-order[FURN[a.fid].kind])||(b.y-a.y)).find(i=>{const f=FURN[i.fid];return wx>=i.x-f.w/2-2&&wx<=i.x+f.w/2+2&&y>=i.y-f.h-2&&y<=i.y+2});
}
room.addEventListener('pointerdown',ev=>{
  const p=ppos(ev);ptr={x0:p.x,y0:p.y,cam0:camX,moved:false,item:null};
  try{room.setPointerCapture(ev.pointerId)}catch(e){}
  if(edit){const it=hitItem(p.x+camX,p.y);sel=it?it.iid:null;if(it){ptr.item=it;ptr.ox=it.x-(p.x+camX);ptr.oy=it.y-p.y}renderPanel()}
});
room.addEventListener('pointermove',ev=>{
  if(!ptr)return;const p=ppos(ev);
  if(Math.abs(p.x-ptr.x0)+Math.abs(p.y-ptr.y0)>3)ptr.moved=true;
  if(!ptr.moved)return;
  if(ptr.item){ptr.item.x=p.x+camX+ptr.ox;ptr.item.y=p.y+ptr.oy;clampItem(ptr.item);if(p.x>VW-14)camX=clamp(camX+3,0,WORLD_W-VW);if(p.x<14)camX=clamp(camX-3,0,WORLD_W-VW)}
  else camX=clamp(ptr.cam0-(p.x-ptr.x0),0,WORLD_W-VW);
});
function ptrEnd(ev){
  if(!ptr)return;const p=ppos(ev),was=ptr;ptr=null;
  if(was.item){save();return}
  if(was.moved||edit)return;
  const wx=p.x+camX,hit=ents.map(e=>({e,p:entPos(e)})).sort((a,b)=>b.p.sy-a.p.sy).find(o=>wx>=o.p.x-12&&wx<=o.p.x+12&&p.y>=o.p.y-35&&p.y<=o.p.y+1);
  if(!hit)return;
  const c=catBy(hit.e.uid);hit.e.emoT=1.5;
  const n=petCat(c);
  if(n){toast('kêu grừ grừ… ❤️ +'+3*(tE(c,'petHappy')||1)+' độ vui',{type:'pet',title:c.name,coins:n});render()}
}
room.addEventListener('pointerup',ptrEnd);room.addEventListener('pointercancel',()=>{if(ptr&&ptr.item)save();ptr=null});

/* ============ HÀNH ĐỘNG ============ */
function openFeed(){
  const cats=homeCats(cur);
  if(!cats.length){toast('Phòng này không có bé nào ở nhà.');return}
  modal('<h3>Cho '+ROOM[cur].n+' ăn gì?</h3><div class="dim">Một bữa cho cả phòng ('+cats.length+' bé). Sau khi ăn, mỗi bé cảm ơn bạn vài xu. Bát đầy lại sau 10 phút.</div><br>'+
    FOODS.map(f=>{const lv=cats.filter(c=>favs(c).includes(f.id)).map(c=>esc(c.name));
      return '<div class="card"><div style="font-size:26px">'+f.ic+'</div><div class="g"><b>'+f.n+'</b><br><small>'+f.d+(lv.length?'<br>❤ Khoái khẩu của: '+lv.join(', '):'')+'</small></div><button class="sm" '+(S.coins<f.price?'disabled':'')+' onclick="doFeed(\''+f.id+'\')">🪙 '+f.price+'</button></div>'}).join('')+
    '<button onclick="closeModal()">Đóng</button>');
}
function doFeed(fid){
  const r=feedRoom(cur,fid); if(!r)return;
  closeModal();
  ents.forEach(e=>{e.goal={bowl:1};e.tx=BOWL.x+rnd(-26,30);e.ty=clamp(BOWL.y+rnd(-6,6),FLOOR_MIN,FLOOR_MAX);e.state='run';e.left=0;e.emo=null});
  toast(r.n+' bé chạy ra ăn và cảm ơn bạn'+(r.loved.length?' · ❤️ món khoái khẩu của '+r.loved.join(', '):''),{type:'feed',title:FOOD[fid].n+' · '+ROOM[cur].n,coins:r.coins});
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
      return '<div class="card '+(o.inf.why?'':'tap')+'" style="'+(o.inf.why?'opacity:.5':'')+'" '+(o.inf.why?'':'onclick="doTrip('+c.uid+')"')+'><img width="36" height="40" src="'+catImg(c.sp)+'"><div class="g"><b>'+esc(c.name)+'</b> '+sexIc(c)+' '+starsOf(c.star)+'<br><small>'+sp.n+' · '+(o.inf.why||('~'+o.inf.est+' xu · '+fmt(o.inf.dur)+' · −'+o.inf.cost+'⚡'))+'</small><br>'+stats(c)+'</div></div>'}).join(''):'<div class="dim">Không còn bé nào ở nhà.</div>')+
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
  el.innerHTML='<div class="hd">🎒 '+esc(r.cat.name)+' đã về từ '+r.dest.n+'!</div><div class="row"><img width="72" height="80" src="'+catImg(r.cat.sp)+'"><div style="flex:1;text-align:left">'+
    '<div class="big">+'+(r.coins+r.bonus)+' 🪙</div><div class="dim">Ngậm theo '+r.item+' · +'+r.xp+' kinh nghiệm'+(r.ticket?'<br>🎟 Nhặt được 1 vé gacha!':'')+'</div></div></div>'+
    (r.acts.length?'<div style="text-align:left;margin-top:6px"><span class="dim">Trait đã kích hoạt:</span><br>'+r.acts.map(a=>tagOf(a.t,a.txt)).join('')+'</div>':'<div class="dim" style="text-align:left;margin-top:6px">Chuyến này không có trait nào kích hoạt.</div>')+
    '<div style="text-align:right;margin-top:8px"><button class="go sm" onclick="closePop()">Nhận'+(popQ.length?' (còn '+popQ.length+')':'')+'</button></div>';
  requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('on')));
}
function closePop(){$('pop').classList.remove('on');setTimeout(nextPop,380)}

/* --- gacha --- */
const gz={timers:[],cat:null,parts:[],raf:0,done:true};
const gp=$('gp'),GX=gp.getContext('2d');
function gpLoop(){
  if(!$('gz').classList.contains('on')){gz.raf=0;gz.parts=[];return}
  if(gp.width!==innerWidth||gp.height!==innerHeight){gp.width=innerWidth;gp.height=innerHeight}
  GX.clearRect(0,0,gp.width,gp.height);
  gz.parts=gz.parts.filter(p=>p.life>0);
  gz.parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life--;GX.globalAlpha=Math.min(1,p.life/20);GX.fillStyle=p.col;GX.fillRect(Math.round(p.x/4)*4,Math.round(p.y/4)*4,p.sz,p.sz)});
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
const fxClear=()=>{const f=$('gfx');f.innerHTML='';f.style.background='';$('gfly').className=''};
function fxEl(css,html){const d=document.createElement('div');d.style.cssText='position:absolute;'+css;if(html)d.innerHTML=html;$('gfx').appendChild(d);return d}
const fxTint=bg=>{$('gfx').style.background=bg};
const fxCat=(anim,extra)=>fxEl('left:50%;top:50%;width:144px;height:160px;margin:-80px 0 0 -72px;animation:'+anim+';'+(extra||''),'<img src="'+catImg(gz.cat.sp)+'" style="width:100%;height:100%">');
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
const INTRO={
  v_nyan:{dur:2100,run(T){
    const f=$('gfly');f.innerHTML='<div class="fl"><div class="rb"></div><img src="'+catImg(gz.cat.sp)+'"></div>';f.className='';void f.offsetWidth;f.className='go';
    seq([659,784,1047,784,659,784,1175,988,1047,1319,1175,988,1047,784,659,523,587,784,988,784,1047,1319,1568,2093],.085,.08);
    every(T,0,2000,100,()=>{for(let k=0;k<4;k++)part({x:rnd(0,innerWidth),y:rnd(0,innerHeight),vx:-rnd(3,7),life:rnd(20,40),sz:Math.random()<.5?4:8})});
  }},
  v_maneki:{dur:2900,run(T){
    fxTint('radial-gradient(circle,#7a4c14 0,#241206 75%)');fxCat('wave .45s ease-in-out infinite alternate','transform-origin:50% 90%');
    every(T,0,2800,70,coinRain);[0,700,1400,2100].forEach(t=>T(t,()=>seq([1319,1568,2093,2637],.08,.3,'sine',.07)));
  }},
  v_harry:{dur:3000,run(T){
    fxTint('radial-gradient(circle,#231a4a 0,#0a0818 75%)');
    T(150,()=>bolt(innerWidth*.28,'#ffe066'));T(650,()=>bolt(innerWidth*.72,'#ffe066'));
    T(1100,()=>{fxEl('left:50%;top:50%;width:22px;height:22px;margin:-11px;border-radius:50%;background:#fff;box-shadow:0 0 44px 22px #ffe9a0;animation:grow 1.9s ease-in forwards');seq([988,1319,1175,1568,1976,2349],.15,.32,'sine',.06)});
    every(T,1100,2900,55,()=>fount(['#ffe9a0','#fff','#f2c230'],5));
  }},
  v_thunder:{dur:2300,run(T){
    fxTint('radial-gradient(circle,#3a2c06 0,#120d02 75%)');
    [100,420,740,1060].forEach((t,i)=>T(t,()=>bolt(innerWidth*[.2,.8,.4,.62][i],'#ffd83a')));
    T(1450,()=>{fxEl('left:0;top:48%;width:100%;height:7px;background:#fff;box-shadow:0 0 26px 9px #ffd83a;transform-origin:left;animation:slash .5s ease-out forwards');glide(2400,200,.35,'sawtooth',.06)});
    every(T,1450,2200,40,()=>fount(['#ffd83a','#fff'],6));
  }},
  v_gojo:{dur:3300,run(T){
    fxTint('radial-gradient(circle,#1d1247 0,#04030d 78%)');every(T,0,3200,60,()=>stars(5));
    const orb=(c,a)=>fxEl('left:50%;top:50%;width:76px;height:76px;margin:-38px;border-radius:50%;background:radial-gradient(#fff 0,'+c+' 55%,transparent 72%);animation:'+a+' 1.8s ease-in forwards');
    const r=orb('#ff5a6a','orbL'),b=orb('#5a8cff','orbR');glide(180,880,1.8,'sine',.06);
    T(1850,()=>{r.remove();b.remove();fxEl('left:50%;top:50%;width:90px;height:90px;margin:-45px;border-radius:50%;background:radial-gradient(#fff 0,#b46aff 50%,transparent 72%);animation:ring 1.3s ease-out forwards');glide(900,70,1,'sawtooth',.06);for(let i=0;i<8;i++)fount(['#b46aff','#fff','#7a5cff'],8)});
  }},
  v_vader:{dur:2900,run(T){
    fxTint('radial-gradient(circle,#2a0606 0,#050000 75%)');
    T(300,()=>{fxEl('left:50%;bottom:16%;width:12px;height:62%;margin-left:-6px;background:#fff;border-radius:6px;box-shadow:0 0 34px 13px #ff2a2a;transform-origin:bottom;transform:scaleY(0);animation:ignite .5s ease-out forwards');glide(60,130,.5,'sawtooth',.08)});
    [900,1500,2100].forEach(t=>T(t,()=>glide(95,70,.5,'sawtooth',.05)));
    every(T,800,2800,60,()=>part({x:innerWidth/2+rnd(-30,30),y:innerHeight*.8-rnd(0,innerHeight*.6),vx:rnd(-2,2),vy:rnd(-2,-.5),life:rnd(20,45),col:pick(['#ff5a5a','#ffb0b0']),sz:4}));
  }},
  v_astro:{dur:2900,run(T){
    fxTint('linear-gradient(#04061a,#101a44)');fxCat('rise 2.5s cubic-bezier(.2,.8,.3,1) both');glide(110,720,2.4,'triangle',.07);
    every(T,0,2800,35,()=>part({x:rnd(0,innerWidth),y:-10,vy:rnd(12,24),life:70,sz:4,col:pick(['#fff','#bcd0ff'])}));
    every(T,0,2400,50,()=>part({x:innerWidth/2+rnd(-22,22),y:innerHeight/2+90,vy:rnd(3,7),life:26,col:pick(['#ffb347','#ff6a3a','#fff3b0'])}));
  }},
  v_royal:{dur:2900,run(T){
    fxTint('radial-gradient(circle,#5e1828 0,#17050a 75%)');fxCat('pop .5s ease-out both');
    fxEl('left:50%;top:50%;font-size:64px;line-height:1;margin:-158px 0 0 -32px;animation:drop 1s .7s cubic-bezier(.34,1.56,.64,1) both','👑');
    seq([523,523,523,698,0,523,698,880,0,1047],.15,.24,'square',.045);
    every(T,0,2800,55,()=>rain(['#ffd24a','#fff','#ff9db5','#b98bff'],4));
  }},
  khaomanee:{dur:2500,run(T){
    fxTint('radial-gradient(circle,#18203c 0,#06070f 75%)');
    const gem=(x,c,dl)=>fxEl('left:'+x+'%;top:46%;font-size:86px;line-height:1;margin-left:-36px;color:'+c+';text-shadow:0 0 30px '+c+';animation:twk .5s '+dl+'s ease-in-out infinite alternate','◆');
    gem(32,'#5ab4ff',0);gem(68,'#ffcf4a',.25);seq([2093,2637,3136,2637,3136,3951],.2,.4,'sine',.05);
    every(T,0,2400,60,()=>{part({x:innerWidth*.32+rnd(-50,50),y:innerHeight*.5+rnd(-50,50),vy:-1,life:30,sz:4,col:'#bfe2ff'});part({x:innerWidth*.68+rnd(-50,50),y:innerHeight*.5+rnd(-50,50),vy:-1,life:30,sz:4,col:'#ffe9a0'})});
  }},
  lykoi:{dur:2900,run(T){
    fxTint('linear-gradient(#070b24,#1b2552)');
    fxEl('left:50%;top:62%;width:170px;height:170px;margin-left:-85px;border-radius:50%;background:#f4f1dc;box-shadow:0 0 60px 22px rgba(244,241,220,.45);animation:moon 2.6s ease-out forwards');
    fxCat('pop .5s 1s ease-out both','filter:brightness(0)');every(T,0,2800,90,()=>stars(3));
    T(900,()=>glide(300,640,.55,'sine',.07));T(1450,()=>glide(640,470,1.3,'sine',.07));
  }},
  savannah:{dur:2500,run(T){
    fxTint('linear-gradient(#f0a040,#7a3a12)');
    fxEl('left:50%;top:30%;width:150px;height:150px;margin-left:-75px;border-radius:50%;background:#ffe9a0;box-shadow:0 0 70px 26px rgba(255,220,130,.5)');
    const dash=dl=>fxEl('left:0;top:56%;width:144px;height:160px;animation:dash .8s '+dl+'s cubic-bezier(.5,0,.3,1) both','<img src="'+catImg(gz.cat.sp)+'" style="width:100%;height:100%;transform:scaleX(-1)">');
    dash(.3);dash(1.4);[300,1400].forEach(t=>T(t,()=>glide(300,1300,.6,'triangle',.05)));
    every(T,300,2300,45,()=>part({x:rnd(0,innerWidth),y:innerHeight*.56+150+rnd(-8,8),vx:-rnd(2,6),vy:-rnd(0,1),life:30,col:pick(['#e6c08a','#fff0c8'])}));
  }},
  sokoke:{dur:2700,run(T){
    fxTint('linear-gradient(#0d2612,#2f5c2c)');fxCat('pop .6s 1.1s ease-out both');
    every(T,0,2600,55,()=>rain(['#6fd26f','#3f9a55','#b5e08a','#e6c060'],3));
    seq([1568,1976,1568,2349,0,1760,2093,1760],.13,.11,'sine',.05);
  }},
  suphalak:{dur:2700,run(T){
    fxTint('radial-gradient(circle,#a8561e 0,#2a1206 78%)');fxCat('pop .6s .9s ease-out both');
    fxEl('left:50%;top:50%;width:170vmax;height:170vmax;margin:-85vmax 0 0 -85vmax;background:repeating-conic-gradient(#ffc070 0 5deg,transparent 5deg 18deg);opacity:.25;animation:spin 14s linear infinite');
    snd(t=>{tone(110,t,2.4,'sine',.12);tone(165,t,2,'sine',.06);tone(221,t,1.4,'sine',.04)});
    every(T,0,2600,50,()=>part({x:rnd(0,innerWidth),y:innerHeight+6,vx:rnd(-.6,.6),vy:-rnd(2,6),life:rnd(50,110),sz:Math.random()<.5?4:8,col:pick(['#ffb060','#ffd89a','#e88a3a'])}));
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
  box.style.display='block';box.src=furnImg('gift',st>=3?col:'#aab0bd');box.className='s';
  if(!gz.raf)gz.raf=requestAnimationFrame(gpLoop);
  if(st<=2){T(850,()=>gReveal())}
  else if(st===3){box.classList.add('glow');for(let t=0;t<1300;t+=80)T(t,()=>sparkle(col,3));T(1400,()=>gReveal())}
  else if(st===4){box.className='h glow';el.classList.add('rayon');for(let t=0;t<1700;t+=60)T(t,()=>sparkle(col,4));T(1800,()=>{flash();gReveal()})}
  else{
    el.classList.add('dark');
    T(900,()=>{box.className='h glow';el.classList.add('pil')});
    for(let t=900;t<2300;t+=50)T(t,()=>sparkle('#ffd24a',5));
    const it=INTRO[c.sp];
    if(it){T(2400,()=>{flash();box.style.display='none';el.classList.remove('pil');it.run(T)});T(2400+it.dur,()=>{flash();gReveal()})}
    else T(2400,()=>{flash();gReveal()});
  }
}
function gReveal(skipped){
  if(gz.done)return; gz.done=true;
  gz.timers.forEach(clearTimeout);gz.timers=[];
  const c=gz.cat,sp=SP[c.sp],st=c.star,col=STAR[st].c,el=$('gz'),rev=$('grev');
  $('gbox').style.display='none';$('gskip').style.display='none';el.classList.remove('pil');fxClear();
  if(st>=4)el.classList.add('rayon');
  if(st===5){
    if(!skipped){el.classList.add('quake');setTimeout(()=>el.classList.remove('quake'),600)}
    const cols=['#ffd24a','#ff8fa3','#7fb7ff','#5fd08a','#fff'];
    for(let i=0;i<(skipped?3:7);i++)gz.timers.push(setTimeout(()=>burst(rnd(.15,.85)*innerWidth,rnd(.12,.6)*innerHeight,pick(cols)),i*260));
  }else if(st>=3&&!skipped)burst(innerWidth/2,innerHeight/2,col);
  let stars='';for(let i=0;i<st;i++)stars+='<span class="st" style="animation-delay:'+(.25+i*.24)+'s">★</span>';
  rev.innerHTML='<div class="pop">'+(st===5?'<div class="legend">HUYỀN THOẠI</div>':'')+
    '<img width="144" height="160" src="'+catImg(c.sp)+'"><div>'+stars+'</div>'+
    '<div style="color:'+col+'">'+STAR[st].n+(c.isNew?' · <span style="color:#2b8750">MỚI!</span>':'')+'</div>'+
    '<h2 style="margin:4px 0">'+sp.n+' '+sexIc(c)+'</h2><div class="dim">'+sp.d+'</div>'+
    '<div style="margin:6px 0">'+c.traits.map(t=>tagOf(t)).join('')+'</div>'+
    '<div class="row" style="margin:8px 0"><input id="gname" maxlength="16" value="'+esc(c.name)+'" placeholder="Đặt tên cho bé"><button class="sm" onclick="$(\'gname\').value=pick(NAMES)">🎲</button></div>'+
    '<button class="on" onclick="gachaDone()">Đón về nhà</button></div>';
  rev.style.display='block';
}
function gachaDone(){
  gz.timers.forEach(clearTimeout);gz.timers=[];
  const c=gz.cat,v=$('gname').value.trim().slice(0,16); if(v)c.name=v; delete c.isNew;
  save();$('gz').className='';syncEnts();render();
  toast('đã về '+ROOM[c.room].n,{type:'cat',title:c.name});
}

/* --- mèo --- */
function openCat(uid){
  const c=catBy(uid); if(!c)return; const sp=SP[c.sp],away=onTrip(uid),bf=buffOf(c);
  modal('<img width="108" height="120" src="'+catImg(c.sp)+'"><h2 style="margin:2px 0">'+esc(c.name)+' '+sexIc(c)+'</h2><div>'+starsOf(c.star)+' <span style="color:'+STAR[c.star].c+'">'+STAR[c.star].n+'</span></div>'+
    '<div><b>'+sp.n+'</b></div><div class="dim">'+sp.d+'</div><div style="margin:8px 0">'+stats(c)+'</div>'+
    '<div class="dim">'+(away?'Đang đi viễn chinh':'Đang ở '+ROOM[c.room].n+' · độ vui hướng tới '+Math.round(happyTarget(c)))+' · Khoái khẩu: '+favs(c).map(f=>FOOD[f].ic+' '+FOOD[f].n).join(', ')+(bf.food?'<br>Đang có buff '+FOOD[bf.food].n+' (còn '+fmt(bf.until-now())+')':'')+'</div>'+
    '<div style="margin:8px 0;text-align:left">'+c.traits.map(t=>tagOf(t)).join('')+'</div>'+
    '<div class="row"><input id="cname" maxlength="16" value="'+esc(c.name)+'"><button class="sm" onclick="$(\'cname\').value=pick(NAMES)">🎲</button><button class="sm on" onclick="doRename('+uid+')">Đổi tên</button></div>'+
    (away?'':'<h3>Chuyển phòng</h3><div class="row wrap" style="justify-content:center">'+ownedRooms().map(r=>'<button class="sm '+(r.id===c.room?'on':'')+'" '+(r.id!==c.room&&catsIn(r.id).length>=r.cap?'disabled':'')+' onclick="doMove('+uid+',\''+r.id+'\')">'+r.n+' '+catsIn(r.id).length+'/'+r.cap+'</button>').join('')+'</div>')+
    '<div class="row" style="justify-content:center;margin-top:12px"><button class="sm bad" '+(away||S.cats.length<=1?'disabled':'')+' onclick="doRehome('+uid+')">Cho đi nhận nuôi (+'+STAR[c.star].sell+' xu)</button><button class="sm" onclick="closeModal()">Đóng</button></div>');
}
function doRename(uid){const v=$('cname').value.trim().slice(0,16);if(!v)return;catBy(uid).name=v;save();render();openCat(uid);toast('Đã đổi tên',{icon:'✏️',title:v})}
function doMove(uid,rid){if(catBy(uid).room===rid)return;if(moveCat(uid,rid)){syncEnts();render();openCat(uid)}}
function doRehome(uid){const c=catBy(uid);if(!confirm('Cho '+c.name+' đi nhận nuôi? Bé sẽ rời nhà vĩnh viễn.'))return;const v=rehome(uid);if(v){closeModal();syncEnts();render();toast('đã có nhà mới',{type:'coin',title:c.name,coins:v})}}

/* --- nội thất --- */
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
let tab='home',albumG='breed';
const TABS=[['home','🏠','Nhà'],['trip','🎒','Viễn chinh'],['gacha','🥚','Gacha'],['shop','🛋','Cửa hàng'],['cats','🐱','Mèo'],['album','📖','Sưu tập']];
function setTab(t){tab=t;if(edit&&t!=='home')toggleEdit();else render()}
function renderTop(){
  const ready=S.trips.filter(p=>p&&now()>=p.end).length;
  document.title=(ready?'(!) ':'')+'Mèo Xu';
  $('top').innerHTML='<div class="chip">🪙 <b>'+S.coins+'</b></div><div class="chip">🎟 <b>'+S.tickets+'</b></div><div class="chip">🐱 <b>'+S.cats.length+'</b>/'+totalCap()+'</div>'+
    '<div class="chip xp">Cấp '+S.level+' <span class="dim">· '+S.xp+'/'+xpNeed()+'</span><div class="bar"><i style="width:'+(S.xp/xpNeed()*100)+'%"></i></div></div>';
  const o=ownedRooms();
  $('roomnav').innerHTML=(o.length>1?'<button class="sm" onclick="navRoom(-1)">◀</button>':'')+'<div class="nm">'+ROOM[cur].n+' <span class="dim">· '+catsIn(cur).length+'/'+ROOM[cur].cap+' mèo · kéo ngang để xem hết phòng</span></div>'+(o.length>1?'<button class="sm" onclick="navRoom(1)">▶</button>':'');
  $('tabs').innerHTML=TABS.map(t=>'<button class="'+(tab===t[0]?'on':'')+'" onclick="setTab(\''+t[0]+'\')"><span>'+t[1]+'</span>'+t[2]+(t[0]==='trip'&&ready?' ❗':'')+'</button>').join('');
}
function renderPanel(){$('panel').innerHTML=PANEL[tab]()}
function render(){renderTop();renderPanel()}
const catCard=c=>{const sp=SP[c.sp];return '<div class="card tap" onclick="openCat('+c.uid+')"><img width="36" height="40" src="'+catImg(c.sp)+'"><div class="g"><b>'+esc(c.name)+'</b> '+sexIc(c)+' '+starsOf(c.star)+' <small>'+sp.n+(onTrip(c.uid)?' · đang viễn chinh':'')+'</small><br>'+stats(c)+'</div></div>'};
const PANEL={
 home(){
  if(edit){
    const it=S.items.find(i=>i.iid===sel),kho=S.items.filter(i=>!i.room);
    return '<div class="card"><div class="g"><b>Chế độ sắp xếp</b><br><small>Kéo đồ trong phòng để di chuyển. Chạm vào món đồ để chọn, rồi xoay hoặc cất vào kho.</small></div><button class="go" onclick="toggleEdit()">✓ Xong</button></div>'+
     (it?'<div class="card"><img style="max-width:48px;max-height:40px" src="'+furnImg(it.fid)+'"><div class="g"><b>'+FURN[it.fid].n+'</b>'+(it.broken?' <span style="color:#b83a2e">(hỏng)</span>':'')+'<br><small>'+FURN[it.fid].d+'</small></div><div class="row wrap" style="justify-content:flex-end">'+(it.broken?'<button class="sm" onclick="doRepair('+it.iid+')">🔧 Sửa '+repairCost(it)+'</button>':'')+'<button class="sm" onclick="doFlip()">↔ Xoay</button><button class="sm" onclick="doStore()">📦 Cất kho</button></div></div>':'')+
     '<h3>Kho đồ ('+kho.length+')</h3>'+(kho.length?kho.map(i=>'<div class="card"><img style="max-width:48px;max-height:40px" src="'+furnImg(i.fid)+'"><div class="g"><b>'+FURN[i.fid].n+'</b>'+(i.broken?' <span style="color:#b83a2e">(hỏng)</span>':'')+'</div><button class="sm" onclick="doPlace('+i.iid+')">Đặt vào '+ROOM[cur].n+'</button></div>').join(''):'<div class="dim">Kho trống. Đồ mua ở Cửa hàng sẽ được đặt thẳng vào phòng đang xem.</div>');
  }
  const cats=catsIn(cur),ready=bowlReady(cur),broken=itemsIn(cur).filter(i=>i.broken);
  return '<div class="row" style="margin-bottom:8px"><button style="flex:1" class="'+(ready?'go':'')+'" '+(ready?'':'disabled')+' onclick="openFeed()">🍚 '+(ready?'Cho ăn':'Bát đầy lại sau '+fmt(S.rooms[cur].bowlAt-now()))+'</button><button onclick="toggleEdit()">✏️ Sắp xếp</button></div>'+
   broken.map(i=>'<div class="card"><div class="g">😾 <b>'+FURN[i.fid].n+'</b> bị cào hỏng, mất hiệu ứng.</div><button class="sm" onclick="doRepair('+i.iid+')">🔧 Sửa '+repairCost(i)+' xu</button></div>').join('')+
   (cats.length?cats.map(catCard).join(''):'<div class="dim">Phòng này chưa có bé nào. Vào tab Mèo để chuyển bé sang.</div>')+
   '<div class="dim">Chạm vào mèo trong phòng để vuốt ve (mỗi bé 20 giây cho xu một lần). 🍗 no · ⚡ năng lượng · 😊 độ vui (vui hơn thì viễn chinh được nhiều xu hơn).</div>';
 },
 trip(){
  let h='';const ready=S.trips.filter(p=>p&&now()>=p.end).length;
  if(ready>1)h+='<button class="go" style="width:100%;margin-bottom:8px" onclick="doClaimAll()">Nhận tất cả ('+ready+')</button>';
  for(let i=0;i<5;i++){
    if(i>=slotCount()){h+='<div class="card" style="opacity:.5"><div class="g">🔒 Ô viễn chinh '+(i+1)+'<br><small>Mở ở cấp '+(1+2*i)+'</small></div></div>';continue}
    const p=S.trips[i];
    if(!p){h+='<div class="card"><div class="g">Ô viễn chinh '+(i+1)+'<br><small>Đang trống</small></div><button onclick="openPicker('+i+')">Chọn mèo</button></div>';continue}
    const c=catBy(p.uid),d=DEST[p.dest],left=p.end-now(),done=left<=0;
    h+='<div class="card"><img width="36" height="40" src="'+catImg(c.sp)+'"><div class="g"><b>'+esc(c.name)+'</b> '+starsOf(c.star)+'<br><small>'+d.ic+' '+d.n+' · '+(done?'đã về, đang ngồi chờ trước cửa!':'còn '+fmt(left))+'</small><div class="bar"><i style="width:'+Math.min(100,(1-left/p.dur)*100)+'%"></i></div></div>'+(done?'<button class="go" onclick="doClaim('+i+')">Nhận quà</button>':'')+'</div>';
  }
  return h+'<div class="dim">Mèo cần no trên 20 và đủ năng lượng mới đi được. Ô mở thêm ở cấp 3, 5, 7, 9; điểm đến mới mở dần theo cấp.</div>';
 },
 gacha(){
  const full=S.cats.length>=totalCap();
  return '<div class="card" style="flex-direction:column;text-align:center"><img width="84" height="84" src="'+furnImg('gift','#ffd24a')+'"><div>Hộp quà mèo</div>'+
   (full?'<div style="color:#b83a2e">Nhà đã đủ '+totalCap()+' mèo. Mở thêm phòng hoặc cho bớt mèo đi nhận nuôi.</div>':'')+
   '<div class="row wrap" style="justify-content:center"><button class="on" '+(S.coins<GACHA_COST||full?'disabled':'')+' onclick="doGacha(false)">Mở · '+GACHA_COST+' xu</button><button '+(S.tickets<1||full?'disabled':'')+' onclick="doGacha(true)">Dùng vé 🎟 ('+S.tickets+')</button></div>'+
   '<small>'+[1,2,3,4,5].map(s=>'<span style="color:'+STAR[s].c+'">'+s+'★ '+STAR[s].n+' '+STAR[s].p+'%</span>').join(' · ')+'</small>'+
   '<small>Bảo hiểm: chắc chắn 4★ trở lên sau '+PITY+' lượt (đã mở '+S.pity+'/'+PITY+'). Số trait bằng số sao; sao càng cao càng dễ ra trait tốt. Biến thể kỳ quặc chỉ có ở 4★–5★.</small></div>';
 },
 shop(){
  return '<h3>Mở rộng nhà</h3>'+ROOMS.filter(r=>r.price).map(r=>'<div class="card"><div style="font-size:26px">🚪</div><div class="g"><b>'+r.n+'</b> <small>· chứa '+r.cap+' mèo</small><br><small>'+r.d+'</small></div>'+(S.rooms[r.id]?'<button class="sm" onclick="setRoom(\''+r.id+'\');setTab(\'home\')">Vào xem</button>':'<button class="sm" '+(S.coins<r.price?'disabled':'')+' onclick="doBuyRoom(\''+r.id+'\')">🪙 '+r.price+'</button>')+'</div>').join('')+
   '<h3>Nội thất <small class="dim">· đặt vào '+ROOM[cur].n+'</small></h3>'+FURNS.map(f=>{const n=S.items.filter(i=>i.fid===f.id).length;
     return '<div class="card"><div style="width:48px;text-align:center"><img style="max-width:48px;max-height:40px" src="'+furnImg(f.id)+'"></div><div class="g"><b>'+f.n+'</b>'+(n?' <small>· đang có '+n+'</small>':'')+'<br><small>'+f.d+'</small></div><button class="sm" '+(S.coins<f.price?'disabled':'')+' onclick="doBuy(\''+f.id+'\')">🪙 '+f.price+'</button></div>'}).join('')+
   '<div class="dim">Hiệu ứng của mỗi loại đồ chỉ tính một lần (độ vui tính theo từng phòng, xu và tốc độ tính cho cả nhà). Mua thêm cái thứ hai chỉ để trang trí.</div>';
 },
 cats(){
  return '<div class="dim" style="margin-bottom:8px">'+S.cats.length+'/'+totalCap()+' bé. Chạm vào một bé để xem trait, đổi tên, chuyển phòng.</div>'+
   S.cats.slice().sort((a,b)=>b.star-a.star).map(c=>'<div class="card tap" onclick="openCat('+c.uid+')"><img width="45" height="50" src="'+catImg(c.sp)+'"><div class="g"><b>'+esc(c.name)+'</b> '+sexIc(c)+' '+starsOf(c.star)+'<br><small>'+SP[c.sp].n+' · '+(onTrip(c.uid)?'đang viễn chinh':ROOM[c.room].n)+'</small><br>'+stats(c)+'<div onclick="event.stopPropagation()">'+c.traits.map(t=>tagOf(t)).join('')+'</div></div></div>').join('');
 },
 album(){
  const of=g=>g==='breed'?BREEDS:VARIANTS.filter(v=>v.g===g);
  const all=of(albumG).slice().sort((a,b)=>a.r-b.r);
  return '<div class="row wrap" style="margin-bottom:8px">'+GROUPS.map(g=>'<button class="sm '+(albumG===g[0]?'on':'')+'" onclick="albumG=\''+g[0]+'\';renderPanel()">'+g[1]+' '+of(g[0]).filter(x=>S.seen[x.id]).length+'/'+of(g[0]).length+'</button>').join('')+'</div><div class="grid">'+all.map(s=>
    S.seen[s.id]?'<div class="cell"><img src="'+catImg(s.id)+'"><br><b style="color:'+STAR[s.r].c+'">'+s.n+'</b><br><span style="color:'+STAR[s.r].c+'">'+'★'.repeat(s.r)+'</span><br><span class="dim" style="font-size:11px">'+s.d+(s.xt?'<br>'+tagOf(s.xt):'')+'</span></div>'
               :'<div class="cell unk"><img src="'+catImg(s.id)+'"><br><b style="color:'+STAR[s.r].c+'">???</b><br><span style="color:'+STAR[s.r].c+'">'+'★'.repeat(s.r)+'</span></div>').join('')+'</div>';
 }
};

/* ============ VÒNG LẶP ============ */
load();syncEnts();render();
let last=performance.now();
function loop(t){const dt=Math.min(.1,(t-last)/1000);last=t;ents.forEach(e=>stepEnt(e,dt));drawRoom();requestAnimationFrame(loop)}
requestAnimationFrame(loop);
let lastTick=now(),sec=0;
setInterval(()=>{
  const n=now();tick((n-lastTick)/1000);lastTick=n;sec++;
  renderTop();
  if($('modal').style.display==='flex')return;
  if((tab==='home'&&!edit)||tab==='trip')renderPanel();
  if(sec%10===0)save();
},1000);
