"use strict";
(()=>{
const K=CatKit,{P}=K,{hex}=K.U;
const HAIR=hex('#202025'),BLACK=hex('#17171b'),RED=hex('#c92438'),WHITE=hex('#f4eddf'),LEAF=hex('#4acba6');
const SILVER=hex('#f4f3ef'),GOLD=hex('#bb9458'),PANTS=hex('#ece8df'),PINK=hex('#ff526e'),BLUE=hex('#459fff');
K.costume('v_oner',{
  paint(c,s){
    if(c.kind!=='fur')return;
    const A=c.A0,lee=s.ct==='onLeeSin';
    if(c.part===P.HEAD&&c.v<=(c.side?A.eye[1]-8:A.eyeL[1]-9)+(Math.floor((c.u-A.head[0])/4)%2?1:0)){c.lv=0;return lee?SILVER:HAIR}
    if(c.side&&c.y>=74)return;
    const leg=K.isLeg(c.part),body=c.part===P.BODY;
    if(!body&&!leg)return;
    if(lee){
      c.zone=false;if(c.mark)c.lv=0;
      if(c.side){
        if(c.part===P.NF||c.part===P.FF){if(c.v>A.footNF[1]-12){c.lv=0;return c.part===P.NF?PINK:BLUE}return GOLD}
        if(c.part===P.NH||c.part===P.FH||c.u<A.neck[0]-10)return PANTS;
        return c.v<A.back[1]+9?GOLD:BLACK;
      }
      if(c.v>A.pawL[1]-12&&c.v<A.pawL[1]-2&&(leg||Math.abs(c.u-A.body[0])>=3&&Math.abs(c.u-A.body[0])<=11)){c.lv=0;return c.u<A.body[0]?PINK:BLUE}
      if(c.v>A.body[1]-4)return PANTS;
      return Math.abs(c.u-A.neck[0])>8?GOLD:BLACK;
    }
    const frontLeg=c.side?(c.part===P.NF||c.part===P.FF):(leg||body&&Math.abs(c.u-A.body[0])>=3&&Math.abs(c.u-A.body[0])<=11);
    const py=c.side?A.footNF[1]:A.pawL[1];
    if(frontLeg&&c.v>=py-7&&c.v<=py-4){c.zone=false;c.lv=0;return c.v<py-5?RED:BLACK}
    if(body||(leg&&c.v<py-9)){
      c.zone=false;if(c.mark)c.lv=0;
      const h=c.side?A.hip:A.body,lx=h[0]+(c.side?6:12),ly=h[1]+(c.side?8:1);
      if(Math.abs(c.v-ly)<=3&&Math.abs(c.u-lx+(c.v-ly)*.6)<2)return LEAF;
      const dx=c.u-A.chest[0],dy=c.v-A.chest[1]-3;
      if((Math.abs(dx)<=4&&dy>=-1&&dy<=0)||(dx>=-2&&dx<=-1&&dy>=1&&dy<=3)||(dx>=1&&dx<=4&&dy===-3))return WHITE;
      return (c.side?c.u>A.neck[0]-5&&c.v<A.back[1]+8:c.v<A.neck[1]+8&&Math.abs(c.u-A.neck[0])>7)?BLACK:RED;
    }
  },
  draw(G,s){
    const A=G.A,L=G.layer();
    if(s.ct==='onLeeSin'){
      // Chỏm tóc nhỏ giữa hai tai, không thay đường đầu mèo.
      const c=A.crown,x=c[0],y=c[1];
      L.poly([[x-9,y+4],[x-8,y-2],[x-4,y],[x-3,y-7],[x,y-3],[x+3,y-9],[x+5,y-2],[x+8,y-5],[x+9,y+5]],SILVER).stamp();
      const D=G.layer(),n=G.side?A.throat:A.neck;
      if(G.side)D.poly([[n[0]-8,n[1]-6],[n[0]+2,n[1]-8],[n[0]+7,n[1]-2],[n[0]+4,n[1]+3],[n[0]-7,n[1]+1]],GOLD);
      else for(const k of [-1,1])D.poly([[n[0]+k*8,n[1]],[n[0]+k*15,n[1]+1],[n[0]+k*17,n[1]+7],[n[0]+k*8,n[1]+6]],GOLD);
      D.stamp({clip:(x,y)=>y<=73&&G.F.part[y*G.W+x]===P.BODY});
    }
  }
});
})();
