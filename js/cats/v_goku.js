"use strict";
/* Võ phục bám khung Xoài; tóc theo đầu, vòng hào quang trễ một nhịp. */
(()=>{
const K=CatKit,{P,FT,R}=K;
const INK=[53,48,63],RED=[232,64,94],GOLD=[255,216,58],ORANGE=[244,134,40],
  GODORANGE=[255,152,48],BLUE=[52,84,186],GODBLUE=[64,108,226],TAIL=[156,100,64],
  WHITE=[253,250,244],AMBER=[196,126,22],HALO=[255,228,112],GLINT=[255,250,214];
const MARK=["#.##","#.#.","#.##","#..#"];
const hair=s=>s.ct==='gkGod'?RED:s.ct==='gkSSJ'?GOLD:INK;
K.costume('v_goku',{
  shape(F,s,FX){
    // Tai vẫn giữ hình mèo nhưng cùng màu tóc, không còn mảng hồng.
    FX.each(F,i=>{if(F.part[i]===P.EAR&&F.feat[i]===FT.EARIN){F.role[i]=R.D;F.feat[i]=0}});
  },
  paint(c,s){
    const {part,kind,u,v,A0,side}=c;
    if(kind!=='fur')return;
    if(part===P.EAR){c.lv=0;return hair(s)}
    if(part===P.TAIL){if(c.mark)c.lv=0;return TAIL}
    if(part!==P.BODY&&!K.isLeg(part))return;
    c.zone=false;if(c.mark)c.lv=0;
    const bl=s.ct==='gkGod'?GODBLUE:BLUE;
    if(c.feat===FT.PAW||side&&K.isLeg(part)&&v>A0.belly[1]+5)return v===A0.footNH?.[1]-2?GOLD:bl;
    if(side){
      if(Math.abs(u-A0.back[0])<=1||u>A0.throat[0]-5&&v<A0.chest[1]+1)return bl;
    }else{
      const d=Math.abs(u-A0.body[0]);
      if(Math.abs(v-(A0.chest[1]+5))<=1||v<A0.chest[1]+1&&d<(A0.chest[1]+2-v)*.8)return bl;
    }
    return s.ct==='gkGod'?GODORANGE:ORANGE;
  },
  draw(G,s){
    const A=G.A,B=G.lag(1),side=G.side,x=A.crown[0],y=A.crown[1],C=hair(s),L=G.layer();
    // Chỏm tóc lệch, đủ lớn để nhận ra ở cỡ thật trong game.
    const pts=side?
      [[x-18,y+9],[x-25,y+2],[x-15,y+1],[x-21,y-8],[x-9,y-3],[x-10,y-13],[x,y-5],[x+5,y-12],[x+10,y-2],[x+15,y+5],[x+5,y+7],[x+1,y+12],[x-5,y+6],[x-11,y+12]]:
      [[x-19,y+9],[x-24,y+1],[x-14,y+2],[x-19,y-8],[x-8,y-3],[x-8,y-13],[x+1,y-5],[x+8,y-11],[x+12,y-1],[x+20,y-5],[x+18,y+9],[x+10,y+7],[x+6,y+13],[x,y+7],[x-5,y+12],[x-11,y+6]];
    // Chừa khoảng trống cho vòng sáng cả ở khung bật nhảy cao đầu nhất.
    pts.forEach(p=>{if(p[1]<y)p[1]=Math.round(y+(p[1]-y)*.65)});
    L.poly(pts,C).stamp({outline:INK,edge:false,clip:(u,v)=>{
      const f=G.F.feat[v*G.W+u];return f!==FT.EYEL&&f!==FT.EYER;
    }});
    const H=G.layer(),hx=B.crown[0],hy=Math.max(3,B.crown[1]-18),rx=side?10:12;
    // Vòng rỗng để giữ nền và tóc bên dưới.
    for(let j=-2;j<=2;j++)for(let i=-rx-1;i<=rx+1;i++){
      const d=i*i/(rx*rx)+j*j/4;
      if(d<=1.18&&d>=.56)H.set(hx+i,hy+j,j===-2||j===0?HALO:AMBER);
    }
    H.line(hx-rx+4,hy-2,hx-2,hy-2,GLINT,1).stamp({outline:false});
    // Phù hiệu và nút đai không vẽ đè bàn chân đang liếm mặt.
    const D=G.layer(),cx=side?A.back[0]-7:A.chest[0]+7,cy=side?A.back[1]+8:A.chest[1];
    D.ell(cx,cy,3,3,WHITE);
    MARK.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]==='#')D.set(cx-1+i,cy-1+j,INK)});
    D.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.BODY});
    if(G.F.anim!=='sleep'){
      const bl=s.ct==='gkGod'?GODBLUE:BLUE,N=G.layer(),bx=side?A.back[0]:A.body[0]+7,by=side?A.belly[1]-2:A.chest[1]+5;
      N.rect(bx,by,3,3,bl).line(bx+1,by+2,bx+3,Math.min(72,by+6),bl,2).stamp({outline:false,clip:(x,y)=>y<=72&&G.F.part[y*G.W+x]===P.BODY});
    }
  }
});
})();
