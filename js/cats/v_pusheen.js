"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex}=K.U,FUR=hex('#a9a39f'),STRIPE=hex('#686461'),INK=hex('#292929'),BLUSH=hex('#dfb6b5'),CREAM=hex('#fff6e5'),GOLD=hex('#eed38d');
const RAIN=['#efb1c3','#efcf9f','#f4e5a8','#b7dbbb','#b8d7e9','#c7bee3'].map(hex);
// Lõi chỉ gọi costume khi cos không rỗng; dấu cổ cùng màu chỉ dành cho bé này.
const base=VARIANTS.find(v=>v.id==='v_pusheen');
if(base&&Array.isArray(base.cos)&&!base.cos.length)base.cos.push(['collar','#a9a39f']);
K.costume('v_pusheen',{
  paint(c,s){
    if(c.kind==='eye'||c.feat===FT.RIM)return FUR;
    if(c.kind!=='fur'&&c.feat!==FT.MOUTH)return;
    const A=c.A0,uni=s.ct==='psUnicorn';c.zone=false;if(c.mark)c.lv=0;
    if(c.feat===FT.MOUTH)return FUR;
    if(uni&&c.part===P.TAIL)return RAIN[((Math.floor((c.u-A.tailTip[0]+30)/2)%6)+6)%6];
    if(uni&&(c.part===P.BODY||c.part===P.EAR||K.isLeg(c.part)||(c.part===P.HEAD&&c.v<A.crown[1]+7)))return CREAM;
    if(c.part===P.HEAD&&c.v>=A.crown[1]+1&&c.v<=A.crown[1]+9){
      const dx=c.u-A.crown[0];if(Math.abs(dx)<=9&&Math.abs((dx+10)%7-3)<=1)return STRIPE;
    }
    if(c.part===P.BODY){
      if(c.side&&c.v<A.back[1]+7&&c.u>A.hip[0]+4&&c.u<A.neck[0]-1&&((c.u-A.hip[0])%10)<3)return STRIPE;
      if(!c.side&&c.v<A.body[1]+1&&c.v>A.body[1]-9&&c.u<A.body[0]-9&&((c.v-A.body[1]+10)%5)<2)return STRIPE;
    }
    if(c.part===P.TAIL){const t=A.tailTip,d=Math.hypot(c.u-t[0],c.v-t[1]);if((d>6&&d<9)||(d>14&&d<17))return STRIPE}
    return FUR;
  },
  draw(G,s){
    const A=G.A,B=G.lag(1),uni=s.ct==='psUnicorn';
    if(uni){
      // Cánh và bờm trễ một khung theo lưng.
      const W=G.layer(),x=G.side?B.back[0]:B.body[0],y=G.side?B.back[1]:B.chest[1];
      if(G.side){W.poly([[x-2,y+8],[x-14,y-1],[x-17,y-12],[x-10,y-9],[x-6,y-3],[x+1,y-7],[x+4,y+2]],CREAM)}
      else for(const k of [-1,1])W.poly([[x+k*10,y+7],[x+k*23,y-1],[x+k*25,y-12],[x+k*18,y-8],[x+k*13,y-2]],CREAM);
      const M=G.layer(),n=B.neck,t=B.tailTip;
      for(let j=0;j<RAIN.length;j++){
        const mx=G.side?n[0]-6-j*2:B.head[0]-23-j, my=B.crown[1]+4+j;
        M.line(mx,my,mx-3,Math.min(70,my+18),RAIN[j],3);
        M.line(t[0]+j-3,Math.min(72,t[1]-3),t[0]+j-5,Math.min(75,t[1]+6),RAIN[j],2);
      }
      M.stamp({behind:true,outline:false,clip:(x,y)=>y<=76});
      W.stamp({behind:true,clip:(x,y)=>y<=75});
      const H=G.layer(),cx=A.crown[0],cy=A.crown[1];
      H.poly([[cx-4,cy+3],[cx,Math.max(2,cy-12)],[cx+4,cy+3]],GOLD).stamp();
      const D=G.layer();D.line(cx-2,cy-1,cx+2,cy+1,hex('#d1ae72'),1).stamp({outline:false});
    }
    const E=G.layer(),eyes=G.side?[A.eye]:[A.eyeL,A.eyeR];
    for(const e of eyes){if(G.F.anim==='sleep'||G.F.anim==='groom'||(G.F.anim==='sit'&&G.F.i===2))E.line(e[0]-2,e[1],e[0]+2,e[1],INK,1);else E.ell(e[0],e[1],1.5,1.5,INK)}
    const n=A.nose,mx=G.side?n[0]-5:n[0],my=n[1]+4;
    E.line(mx-4,my,mx-2,my+2,INK,1).line(mx-2,my+2,mx,my,INK,1).line(mx,my,mx+2,my+2,INK,1).line(mx+2,my+2,mx+4,my,INK,1);
    if(G.side)E.ell(A.cheek[0]+1,A.cheek[1]+5,3,1,BLUSH);else for(const e of eyes)E.ell(e[0],e[1]+6,3,1,BLUSH);
    E.stamp({outline:false});
    if(!uni){
      const x=G.side?A.hip[0]+9:A.body[0]+(G.F.anim==='sleep'?0:17),y=Math.min(69,G.side?A.hip[1]+11:A.body[1]-1),D=G.layer();
      // Donut để hở lỗ giữa, nhìn thấy lông bên dưới.
      for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++){const r=dx*dx+dy*dy;if(r<=36&&r>=7)D.set(x+dx,y+dy,dy<1?hex('#e8a7bf'):hex('#b98253'))}
      D.stamp();const S=G.layer();S.set(x-3,y-3,CREAM).set(x+2,y-4,CREAM).set(x+4,y-1,CREAM).stamp({outline:false});
    }
  }
});
})();
