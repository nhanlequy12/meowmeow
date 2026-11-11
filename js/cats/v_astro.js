"use strict";
(()=>{
const K=CatKit,{P}=K;
const SUIT=[238,243,250],ORANGE=[240,138,58],RIM=[147,165,183],LIGHT=[213,237,250],
  GLINT=[250,254,255],PANEL=[70,91,122],RED=[244,91,93],GREEN=[94,215,158];
K.costume('v_astro',{
  /* Áo và ủng tô trên ô gốc, giữ nguyên nhịp chân và bóng xa/gần. */
  paint(c,s){
    if(c.part!==P.BODY&&!K.isLeg(c.part))return;
    if(c.kind==='line')return;
    if(c.kind==='fur'||c.kind==='pink'){
      c.zone=false;if(c.mark)c.lv=0;
      if(c.v>=(c.side?c.A0.footNF[1]:c.A0.pawL[1])-2)return RIM;
      return s.ct==='asOrange'?ORANGE:SUIT;
    }
  },
  draw(G,s){
    const A=G.A,side=G.side,sleep=G.F.anim==='sleep',pack=G.layer();
    const b=side?A.back:sleep?A.body:[A.body[0],A.chin[1]+7];
    // Ba lô cứng gắn vào lưng, hai bình khí lộ ở hai bên khi nhìn thẳng.
    if(side){pack.rect(b[0]-12,b[1]-16,13,22,RIM);pack.rect(b[0]-10,b[1]-14,8,18,SUIT);pack.rect(b[0]-10,b[1]-5,8,3,PANEL)}
    else if(sleep){pack.rect(b[0]-8,b[1]-12,12,20,RIM);pack.rect(b[0]-6,b[1]-10,8,16,SUIT)}
    else{pack.rect(b[0]-20,b[1]-5,9,18,RIM);pack.rect(b[0]+12,b[1]-5,9,18,RIM);pack.rect(b[0]-18,b[1]-3,5,13,SUIT);pack.rect(b[0]+14,b[1]-3,5,13,SUIT)}
    pack.stamp({behind:true});
    const cx=side?A.head[0]-2:A.head[0],top=(side?Math.min(A.earN[1],A.earF[1]):Math.min(A.earL[1],A.earR[1]))-6,
      bottom=Math.min(75,A.chin[1]+7),cy=(top+bottom)/2,rx=side?22:sleep?25:28,ry=(bottom-top)/2;
    // Kính rỗng ở giữa: thấy nguyên mặt/tai, chỉ tô đặc vành và vệt phản chiếu.
    const glass=G.layer(),rim=G.layer();
    glass.ell(cx,cy,rx-2,ry-2,LIGHT).stamp({behind:true,outline:false});
    for(let y=Math.ceil(top);y<=bottom;y++)for(let x=Math.max(0,Math.floor(cx-rx));x<=Math.min(G.W-1,Math.ceil(cx+rx));x++){
      const dx=x-cx,dy=y-cy;
      if(dx*dx/(rx*rx)+dy*dy/(ry*ry)<=1&&dx*dx/((rx-2)*(rx-2))+dy*dy/((ry-2)*(ry-2))>1)rim.set(x,y,dy>ry*.6?RIM:LIGHT);
    }
    rim.stamp({outline:[75,91,112]});
    const shine=G.layer();
    shine.line(cx-rx+6,cy-7,cx-rx+10,cy-14,GLINT,2);
    shine.line(cx-rx+11,cy-15,cx-rx+14,cy-17,GLINT,2);
    shine.stamp({outline:false});
    const collar=G.layer(),ny=Math.min(73,bottom-1);
    collar.ell(cx,ny,side?10:13,2,RIM);collar.line(cx-8,ny-1,cx+8,ny-1,SUIT,2);collar.stamp({outline:false});
    const panel=G.layer(),px=sleep?A.body[0]:side?A.chest[0]-5:A.chest[0],py=sleep?A.body[1]+2:Math.max(A.chest[1]+5,bottom+5);
    panel.rect(px-5,py-3,11,7,PANEL);panel.rect(px-3,py-2,7,2,LIGHT);
    panel.rect(px-3,py+1,2,2,RED);panel.rect(px+2,py+1,2,2,GREEN);
    panel.stamp({outline:false});
  }
});
})();
