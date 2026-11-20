"use strict";
/* ============ BONG BÓNG "VUỐT VE ĐƯỢC" (2026-11-20) ============
   Bé nào đã qua thời gian chờ vuốt ve (PET_CD, 10 phút) thì có một bong bóng hồng nhỏ hình bàn chân trên đầu,
   để người chơi biết chạm vào bé lúc này sẽ được xu. Nối vào critDraw, vẽ sau bong bóng ước muốn của js/wish.js.
   - Chỉ là hình, không đổi luật. Không vẽ cho: khách lạ (e.ghost), phân thân (e.clone), bé đang chào tạm biệt,
     bé đang có bong bóng ước muốn (bong bóng đó đã nói bé muốn gì), lúc Sắp xếp đồ, lúc đang chơi với bé.
   - Nạp sau js/play-ui.js (đọc PL) và js/pwa.js (bọc pwaCard), trước js/bgm.js.
   - Bong bóng hiện dần khi bé vừa hết thời gian chờ, nhún nhẹ; vuốt ve xong thì tắt ngay (petAt đổi).
   - Tắt được trong Cài đặt (S.set.pcue === false). */
const PCUE={a:{},sz:12};   // a: độ hiện dần theo uid (0..1); sz: cỡ bong bóng theo ô thế giới
const pcueOn=()=>!(S&&S.set&&S.set.pcue===false);
function pcueReady(c){return !!c&&now()-(c.petAt||0)>=PET_CD}
const PCV={};
function pcueCv(){
  const k=fk(BS);if(PCV[k])return PCV[k];
  const b=new Art.Buf(16,16),P=[255,221,232];b.ell(8,7,7.4,6.4,P);b.tri(5,11,8,12,4.6,15.4,P);b.outline([112,74,52]);
  const bc=bufCanvas(b,k),ic=bufCanvas(Art.icon('paw'),k),c=document.createElement('canvas');c.width=bc.width;c.height=bc.height;
  const u=bc.width/16,g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(bc,0,0);g.drawImage(ic,Math.round(3*u),Math.round(1.6*u),Math.round(10*u),Math.round(10*u));
  return PCV[k]=c;
}
{const cd=critDraw;critDraw=function(g){cd(g);
  if(!pcueOn()||edit||(typeof PL!=='undefined'&&PL&&PL.on))return;
  const t=performance.now()/1000,dt=Math.min(.1,t-(PCUE.t||t));PCUE.t=t;
  const cv=pcueCv(),sz=PCUE.sz,seen={};
  for(const e of ents){
    if(e.ghost||e.clone||e.dead||e.state==='bye')continue;
    const c=catBy(e.uid);if(!c||seen[e.uid])continue;seen[e.uid]=1;
    const wishHere=typeof wish!=='undefined'&&wish&&wish.uid===e.uid&&wish.rid===cur;
    if(!pcueReady(c)||wishHere){PCUE.a[e.uid]=0;continue}
    const a=PCUE.a[e.uid]=Math.min(1,(PCUE.a[e.uid]||0)+dt*2.5);
    const p=entPos(e),ph=(e.uid%7)*.9;   // lệch pha để cả đàn không nhún cùng lúc
    const x=Math.round((p.x-sz/2+2)*ZC)/ZC,y=Math.round((p.y-51-(1-a)*4+Math.sin(t*2.2+ph)*1.2)*ZC)/ZC;
    g.save();g.globalAlpha=a*.95;g.drawImage(cv,x,y,sz,sz);g.restore();
  }
}}
// Cài đặt: thẻ "Gợi ý vuốt ve" (bọc pwaCard như bgm.js; nạp trước bgm.js nên nằm sau thẻ Nhạc nền, trước thẻ Ứng dụng)
function pcueSet(on){S.set.pcue=!!on;save();const mb=$('mbox');if(mb){const y=mb.scrollTop;openSettings();$('mbox').scrollTop=y}}
if(typeof pwaCard==='function'){const P0=pwaCard;pwaCard=function(){const on=pcueOn();
  return '<div class="card" style="flex-direction:column;align-items:stretch"><b>🐾 Gợi ý vuốt ve</b>'+
    '<div class="row"><button style="flex:1" class="'+(on?'on':'')+'" onclick="pcueSet(1)">Hiện</button><button style="flex:1" class="'+(on?'':'on')+'" onclick="pcueSet(0)">Ẩn</button></div>'+
    '<small>Bé nào vuốt ve được (đã qua 10 phút chờ) sẽ có bong bóng hồng hình bàn chân trên đầu. Chạm vào bé để nhận xu.</small></div>'+P0.apply(this,arguments)}}
