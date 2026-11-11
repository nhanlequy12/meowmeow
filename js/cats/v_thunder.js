"use strict";
(()=>{
const K=CatKit,{P,FT}=K;
const GOLD=[245,207,58],ORANGE=[240,138,42],PALE=[255,226,122],WHITE=[255,251,232],YELLOW=[255,194,26],STEEL=[205,210,222],INK=[65,48,40];
K.costume('v_thunder',{
  paint(c,s){
    if(c.kind!=='fur')return;
    const god=s.ct==='ztGod';
    // Tóc mái bám đầu; chừa tai và đôi mắt nhắm của lõi.
    if(c.part===P.HEAD&&c.v<c.A0.crown[1]+9+(Math.floor(c.u/4)%2)*2){c.lv=0;return god?PALE:GOLD}
    if(c.part===P.BODY||(K.isLeg(c.part)&&c.feat!==FT.PAW&&c.v<c.A0.chest[1]+9)){
      c.zone=false;if(c.mark)c.lv=0;
      const x=((c.u+Math.floor(c.v/8)%2*4)%9+9)%9,y=((c.v%8)+8)%8;
      // Tam giác rộng, không dùng chấm rời ở cỡ nhỏ.
      if(y>=2&&y<=5&&Math.abs(x-4)<=(y-2)*.65){c.lv=0;return WHITE}
      return c.v>c.A0.chest[1]+4?(god?YELLOW:ORANGE):(god?WHITE:GOLD);
    }
  },
  draw(G,s){
    const A=G.A,B=G.lag(1),C=G.lag(2),god=s.ct==='ztGod',n=G.side?A.neck:A.chest,b=G.side?B.hip:B.body;
    // Kiếm bên hông: chuôi gắn áo, mũi kiếm trễ một khung.
    const L=G.layer(),x=n[0]+(G.side?-9:15),y=Math.min(66,n[1]+1),tx=G.F.anim==='sleep'?Math.min(G.W-5,x+4):Math.min(G.W-5,b[0]+(G.side?5:23)),ty=G.F.anim==='sleep'?A.crown[1]-2:Math.max(8,b[1]-27);
    L.line(x,y,tx,ty,STEEL,3).line(x-2,y+4,x+2,y-3,INK,3).line(x-4,y-1,x+4,y+2,YELLOW,2).stamp();
    // Tia điện rời trễ hai khung, không chạm bàn chân.
    const e=G.side?C.back:C.head,E=G.layer(),sx=Math.max(4,e[0]-24),sy=Math.max(5,e[1]-7),col=god?PALE:GOLD;
    E.line(sx,sy,sx+2,sy+3,col,2).line(sx+2,sy+3,sx,sy+5,col,2);
    const rx=Math.min(G.W-5,e[0]+(G.side?4:25)),ry=Math.min(66,e[1]+13);
    E.line(rx,ry,rx-2,ry+3,col,2).line(rx-2,ry+3,rx,ry+5,col,2);
    if(god){E.line(sx+3,sy+10,sx+6,sy+16,YELLOW,2).line(sx+6,sy+16,sx+2,sy+16,YELLOW,2).line(sx+2,sy+16,sx+5,sy+23,WHITE,2)}
    E.stamp({outline:false});
  }
});
})();
