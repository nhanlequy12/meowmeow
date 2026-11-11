"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex}=K.U;
const HAIR=hex('#1c1c20'),BLACK=hex('#17171b'),RED=hex('#c92438'),WHITE=hex('#f4eddf'),BURG=hex('#792936'),GOLD=hex('#f6d987');
const IVORY=hex('#f6efe7'),CRIMSON=hex('#b92137'),TRIM=hex('#dfb768'),FUR=hex('#f0e2d3');
// Gọng một ô, góc cắt nhỏ để giữ mặt mèo bên trong tròng kính.
function frame(L,x,y,w,h){
  L.line(x+1,y,x+w-2,y,BLACK,1).line(x+1,y+h-1,x+w-2,y+h-1,BLACK,1);
  L.line(x,y+1,x,y+h-2,BLACK,1).line(x+w-1,y+1,x+w-1,y+h-2,BLACK,1);
}
function tails(G){
  const B=G.lag(2),b=G.side?B.hip:B.body,rx=b[0]+(G.side?3:0),ry=b[1]+(G.side?6:-2);
  for(let j=0;j<9;j++){
    let tx,ty;
    if(G.side){const a=(-110-j*17.5)*Math.PI/180;tx=rx+32*Math.cos(a);ty=ry+29*Math.sin(a)}
    else {const a=(-174+j*21.75)*Math.PI/180;tx=rx+34*Math.cos(a);ty=ry+54*Math.sin(a)}
    tx=Math.max(4,Math.min(G.W-5,tx));ty=Math.max(5,Math.min(72,ty));
    const dx=tx-rx,dy=ty-ry,d=Math.hypot(dx,dy),nx=-dy/d,ny=dx/d;
    const mx=rx+dx*.65+nx*2,my=ry+dy*.65+ny*2,L=G.layer();
    L.poly([[rx-nx,ry-ny],[mx-nx*3,my-ny*3],[tx-dx*.12-nx*2,ty-dy*.12-ny*2],[tx,ty],[tx-dx*.12+nx*2,ty-dy*.12+ny*2],[mx+nx*3,my+ny*3],[rx+nx,ry+ny]],IVORY);
    L.stamp({behind:true,outline:TRIM,clip:(x,y)=>y<=74});
  }
}
K.costume('v_faker',{
  paint(c,s){
    const A=c.A0,ahri=s.ct==='fkAhriHall',white=s.ct==='fkWhite2026';
    if(ahri&&c.part===P.EAR&&c.kind!=='line'){c.zone=false;c.lv=0;return c.feat===FT.EARIN?IVORY:CRIMSON}
    if(c.kind!=='fur')return;
    if(c.part===P.HEAD&&c.v<=(c.side?A.eye[1]-9:A.eyeL[1]-10)+(c.u<A.head[0]?2:0)){c.lv=0;return HAIR}
    if(c.side&&c.y>=74)return;
    if(c.part===P.BODY||(K.isLeg(c.part)&&c.v<(c.side?A.footNF[1]:A.pawL[1])-8)){
      c.zone=false;if(c.mark)c.lv=0;
      if(ahri){
        if(c.side?c.v<A.back[1]+3:Math.abs(c.u-A.neck[0])<3)return TRIM;
        return (c.side?c.u<A.neck[0]-9:Math.abs(c.u-A.body[0])>10)?CRIMSON:IVORY;
      }
      const b=white&&c.side?A.back:A.chest,x=b[0]+(white&&c.side?-7:0),y=b[1]+(white&&c.side?7:3),dx=c.u-x,dy=c.v-y;
      if((Math.abs(dx)<=4&&dy>=-1&&dy<=0)||(dx>=-2&&dx<=-1&&dy>=1&&dy<=3)||(dx>=1&&dx<=4&&dy===-3))return white?GOLD:WHITE;
      if(white){
        const j=Math.round((dx+8)/3);
        if(j>=0&&j<6&&dx===-8+j*3&&dy===-5-Math.round(2*Math.sin(j*Math.PI/5)))return GOLD;
        const sleeve=c.side?(c.part===P.NF||c.part===P.FF):Math.abs(c.u-A.body[0])>=3&&Math.abs(c.u-A.body[0])<=11;
        if(sleeve&&c.v>=(c.side?A.footNF[1]:A.pawL[1])-6&&c.v<=(c.side?A.footNF[1]:A.pawL[1])-4)return BURG;
      }
      const collar=c.side?c.u>A.neck[0]-5&&c.v<A.back[1]+8:c.v<A.neck[1]+8&&Math.abs(c.u-A.neck[0])>7;
      return collar?(white?BURG:BLACK):(white?WHITE:RED);
    }
  },
  draw(G,s){
    const A=G.A,ahri=s.ct==='fkAhriHall';
    if(ahri){
      tails(G);
      // Tà áo choàng cùng nhịp trễ, nằm sau thân và đuôi mèo gốc.
      const B=G.lag(1),n=B.neck,b=G.side?B.hip:B.body,C=G.layer();
      C.poly(G.side?[[n[0],n[1]],[b[0]-5,b[1]+2],[b[0]-8,Math.min(72,b[1]+19)],[n[0]-8,n[1]+15]]:[[n[0]-10,n[1]],[n[0]+10,n[1]],[b[0]+20,Math.min(72,b[1]+6)],[b[0]-20,Math.min(72,b[1]+6)]],CRIMSON).stamp({behind:true,outline:TRIM,clip:(x,y)=>y<=74});
    }
    const L=G.layer();
    if(G.side){
      const e=A.eye;frame(L,e[0]-6,e[1]-5,13,10);frame(L,e[0]-17,e[1]-5,8,9);
      L.line(e[0]-10,e[1]-2,e[0]-6,e[1]-2,BLACK,1).line(e[0]-19,e[1]-3,e[0]-23,e[1]-4,BLACK,1);
    }else{
      frame(L,A.eyeL[0]-7,A.eyeL[1]-5,15,10);frame(L,A.eyeR[0]-7,A.eyeR[1]-5,15,10);
      L.line(A.eyeL[0]+7,A.eyeL[1]-2,A.eyeR[0]-7,A.eyeR[1]-2,BLACK,1);
    }
    L.stamp({outline:false});
    // Mí bình thản chỉ che phần trên mắt đang mở, không mở lại mắt ngủ.
    G.recolor(q=>{
      if(q.feat!==FT.EYEL&&q.feat!==FT.EYER)return;
      const e=G.side?A.eye:(q.feat===FT.EYEL?A.eyeL:A.eyeR);
      if(q.y<e[1]-1&&Math.abs(q.x-e[0])<5)return FUR;
      if(q.y===e[1]-1&&Math.abs(q.x-e[0])<4)return BLACK;
    });
    const D=G.layer();
    if(ahri){
      const n=A.neck;D.line(n[0]-5,n[1]+1,n[0],n[1]+5,TRIM,2).line(n[0],n[1]+5,n[0]+5,n[1]+1,TRIM,2);
      D.poly([[A.head[0],A.crown[1]+10],[A.head[0]+2,A.crown[1]+13],[A.head[0],A.crown[1]+16],[A.head[0]-2,A.crown[1]+13]],CRIMSON);
    }
    D.stamp({outline:false,clip:(x,y)=>y<=74});
    if(ahri){
      const B=G.lag(2),p=G.side?B.footFF:B.pawR,x=Math.min(G.W-7,p[0]+13),y=Math.min(68,p[1]-14),O=G.layer();
      O.ell(x,y,5,5,TRIM).ell(x,y,4,4,CRIMSON).line(x-2,y+1,x+2,y-2,GOLD,2).set(x-2,y-2,IVORY).stamp({outline:false});
    }
  }
});
})();
