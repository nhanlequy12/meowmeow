"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hsh}=K.U;
const CRUST=[244,206,146],EDGE=[222,172,106],LIGHT=[252,226,176],
  PINK=[255,160,208],SHINE=[255,204,230],SPRINKLE=[[232,60,150],[196,44,128]],
  TOAST=[150,98,58],DARK=[118,74,44],WAFFLE=[222,166,84],RIDGE=[168,110,58],BUTTER=[240,190,104],
  RB=[[255,128,128],[255,196,120],[255,240,140],[156,226,150],[140,196,255],[196,160,240]],
  RBD=RB.map(c=>K.U.mix(c,[44,38,66],.58)).reverse(),WHITE=[255,253,248],GOLD=[255,236,150];
const bounds=new Map();

// Viền bánh và cốm tính trong toạ độ nghỉ, dùng lại cho mọi ô của khung.
function bodyBox(F){
  const key=F.view+'|'+F.anim;
  if(bounds.has(key))return bounds.get(key);
  F=K.baseFrame('std',F.view==='side'?'stand':F.anim,0);
  let x0=999,y0=999,x1=-1,y1=-1;
  for(let i=0;i<F.role.length;i++)if(F.role[i]>1&&F.part[i]===P.BODY&&F.feat[i]!==FT.PAW){
    x0=Math.min(x0,F.u[i]);x1=Math.max(x1,F.u[i]);y0=Math.min(y0,F.v[i]);y1=Math.max(y1,F.v[i]);
  }
  const b={x0,y0,x1,y1};bounds.set(key,b);return b;
}
K.costume('v_nyan',{
  shape(F){F.nyanBox=bodyBox(F)},
  paint(ctx,s){
    if(ctx.kind!=='fur'||ctx.part!==P.BODY||ctx.feat===FT.PAW)return;
    const b=ctx.F.nyanBox,u=ctx.u-b.x0,v=ctx.v-b.y0,w=b.x1-b.x0,h=b.y1-b.y0,alt=s.ct==='nyTac';
    ctx.zone=false;if(ctx.mark)ctx.lv=0;
    // Kem bo góc cách vỏ hai ô, không phủ lên bàn chân hay đầu.
    const dx=Math.max(0,3-u,u-w+3),dy=Math.max(0,3-v,v-h+3);
    if(u<2||u>w-2||v<2||v>h-2||dx*dx+dy*dy>4)return alt?(v>h-2?DARK:TOAST):(v<2?LIGHT:v>h-2?EDGE:CRUST);
    if(alt){const a=u%6,bv=v%6;return a<2||bv<2?RIDGE:a<4&&bv<4?BUTTER:WAFFLE}
    const col=Math.floor(u/7),row=Math.floor(v/5),sx=2+Math.floor(hsh(col,row)*3),sy=1+Math.floor(hsh(row+31,col)*2);
    if(u%7>=sx&&u%7<sx+2&&v%5===sy)return SPRINKLE[(col+row)&1];
    return v<4&&u<w*.6?SHINE:PINK;
  },
  draw(G,s){
    const A=G.A,B=G.lag(2),alt=s.ct==='nyTac',rb=alt?RBD:RB,L=G.layer(),
      tail=G.side?A.tailBase:A.tail,old=G.side?B.tailBase:B.tail,
      end=Math.max(4,Math.round(tail[0]+3)),cy=(tail[1]+old[1])/2+(G.side?0:-3);
    // Sáu dải màu kéo sau đuôi, nhịp sóng trễ hai khung so với thân.
    for(let x=1;x<=end;x++){
      const t=x/end,wave=Math.round(Math.sin(x*.32-(G.F.i-2)*Math.PI/4)*1.5),y0=Math.min(59,Math.max(3,cy-8+wave+(old[1]-tail[1])*(1-t)));
      for(let k=0;k<6;k++)L.rect(x,y0+k*2,1,2,rb[k]);
    }
    L.stamp({behind:true,outline:false});
    const cheek=alt?[168,86,106]:[245,154,181],C=G.layer();
    if(G.side)C.ell(A.cheek[0]+1,A.cheek[1]+3,3,2,cheek);
    else{
      C.ell(A.eyeL[0]-5,A.eyeL[1]+7,3,2,cheek);
      C.ell(A.eyeR[0]+5,A.eyeR[1]+7,3,2,cheek);
    }
    C.stamp({outline:false,clip:(x,y)=>{const i=y*G.W+x;return G.F.part[i]===P.HEAD&&G.F.feat[i]!==FT.NOSE}});
    const H=G.side?B.earN:B.earR,E=G.side?B.earF:B.earL;
    G.spark(Math.min(G.W-4,H[0]+10),Math.max(4,H[1]-3),GOLD);
    G.spark(Math.max(4,E[0]-15),Math.max(5,E[1]+4),WHITE);
  }
});
})();
