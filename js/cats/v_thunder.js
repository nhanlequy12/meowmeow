"use strict";
(()=>{
const K=CatKit,{P,FT}=K;
const GOLD=[245,207,58],ORANGE=[240,138,42],PALE=[255,226,122],WHITE=[255,251,232],YELLOW=[255,194,26],STEEL=[205,210,222],INK=[65,48,40];
K.costume('v_thunder',{
  paint(c,s){
    if(c.kind!=='fur')return;
    const god=s.ct==='ztGod';
    // Tóc mái bám đầu; chừa tai và đôi mắt nhắm của lõi.
    const hair=c.A0.crown[1]+9+(Math.floor(c.u/4)%2)*2;
    if(c.part===P.HEAD&&c.v<hair){c.lv=0;return c.v>=hair-3?(god?YELLOW:ORANGE):(god?PALE:GOLD)}
    if(c.part===P.BODY||(K.isLeg(c.part)&&c.feat!==FT.PAW&&c.v<c.A0.chest[1]+9)){
      c.zone=false;c.lv=0;
      const x=((c.u+Math.floor(c.v/9)%2*5)%10+10)%10,y=((c.v%9)+9)%9;
      // Tam giác rộng, không dùng chấm rời ở cỡ nhỏ.
      if(y>=2&&y<=6&&Math.abs(x-5)<=(y-2)*.75)return god&&c.v<=c.A0.chest[1]+4?YELLOW:WHITE;
      return c.v>c.A0.chest[1]+4?(god?YELLOW:ORANGE):(god?WHITE:GOLD);
    }
  },
  draw(G,s){
    const A=G.A,B=G.lag(1),C=G.lag(2),god=s.ct==='ztGod';
    // Cả kiếm trễ một khung: chuôi trước-trên, lưỡi chếch sau-dưới hông.
    const L=G.layer(),x=G.side?B.neck[0]+3:B.body[0]+(G.F.anim==='sleep'?-6:18),y=G.side?B.back[1]+3:Math.min(59,B.body[1]-8),tx=G.side?B.hip[0]-4:Math.max(3,x-7),ty=Math.min(70,y+(G.side?17:14));
    L.line(x,y,tx,ty,STEEL,3).line(x,y+1,tx,ty+1,[151,160,181],1);
    L.line(x,y,x+5,y-3,INK,3).line(x-2,y-3,x+2,y+3,YELLOW,2).stamp();
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
