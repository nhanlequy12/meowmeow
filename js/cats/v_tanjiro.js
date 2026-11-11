"use strict";
(()=>{
const K=CatKit,{P,FT}=K,HAIR=[122,42,46],GREEN=[63,160,106],DARK=[58,52,72],SCAR=[176,70,76],PAPER=[253,245,223],RED=[204,57,64];
const BLADE=[42,42,52],SPINE=[115,115,130],HILT=[24,24,30],MARK=[128,27,38],GOLD=[255,210,74],ORANGE=[255,122,42],FLAME=[239,74,37];
// Kiếm đeo ở hông; cả lưỡi, kiếm cách và chuôi cùng trễ một khung.
function sword(G,B,fire){
  // Khi cuộn ngủ, đưa kiếm ra mép đầu để thân không che hết lưỡi.
  const gx=G.side?B.hip[0]:Math.max(B.body[0]+18,B.head[0]+16),gy=G.side?B.back[1]-3:B.body[1]-7;
  const tx=G.side?Math.max(7,B.hip[0]-24):Math.min(G.W-8,Math.max(B.body[0]+26,B.head[0]+24)),ty=G.side?B.back[1]-24:Math.min(B.crown[1]+5,gy-28);
  const dx=tx-gx,dy=ty-gy,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d,nx=-uy,ny=ux,L=G.layer();
  L.line(gx,gy,tx,ty,fire?ORANGE:BLADE,fire?5:3);
  if(fire){
    // Bốn lưỡi lửa đổi chiều dài theo khung, không thêm hào quang riêng.
    for(let j=0;j<4;j++){
      const t=(j+1)/5,x=gx+dx*t,y=gy+dy*t,h=4+(G.F.i+j)%3;
      L.poly([[x-ux*3,y-uy*3],[x+nx*h+ux*2,y+ny*h+uy*2],[x+ux*4,y+uy*4]],FLAME);
      L.poly([[x,y],[x+nx*(h-2)+ux*2,y+ny*(h-2)+uy*2],[x+ux*3,y+uy*3]],ORANGE);
    }
    L.line(gx,gy,tx,ty,GOLD,3);
  }else L.line(gx+nx,gy+ny,tx+nx,ty+ny,SPINE,1);
  L.line(gx-ux*2,gy-uy*2,gx-ux*9,gy-uy*9,HILT,3);
  for(let j=3;j<9;j+=2)L.line(gx-ux*j-nx,gy-uy*j-ny,gx-ux*(j+1)+nx,gy-uy*(j+1)+ny,RED,1);
  L.ell(gx,gy,3,3,HILT).stamp({behind:true,clip:(x,y)=>y<=71});
}
K.costume('v_tanjiro',{
  paint(c){
    if(c.kind!=='fur')return;
    const A=c.A0;
    if(c.part===P.HEAD&&c.v<=(c.side?A.eye[1]:A.eyeL[1])-8+(Math.floor(c.u/4)%2?2:0)){c.lv=0;return HAIR}
    if(c.part===P.BODY&&c.feat!==FT.PAW){c.zone=false;if(c.mark)c.lv=0;return (Math.floor((c.u-(c.side?A.hip[0]:A.body[0]))/5)+Math.floor((c.v-(c.side?A.back[1]:A.body[1]))/5))&1?GREEN:DARK}
  },
  draw(G,s){
    const A=G.A,B=G.lag(1),x=G.side?A.eye[0]-10:A.eyeL[0]+1,y=A.crown[1]+4,S=G.layer();
    const fire=s.ct==='tjKagura';
    sword(G,B,fire);
    S.poly(fire?[[x-5,y-1],[x+3,y-4],[x+7,y+1],[x+3,y+5],[x+5,y+10],[x-5,y+8],[x-7,y+3]]:[[x-3,y],[x+2,y-2],[x+5,y+2],[x+2,y+4],[x+3,y+7],[x-4,y+6]],fire?MARK:SCAR).stamp({outline:false});
    // Hoa tai hanafuda: đầu dây theo tai, mặt thẻ trễ một khung.
    const roots=G.side?[[A.neck,B.neck,-1]]:[[A.head,B.head,-1],[A.head,B.head,1]];
    for(const [a,b,k] of roots){
      const rx=a[0]+(G.side?1:23*k),ry=G.side?a[1]-4:a[1]+4;
      const sway=Math.max(-2,Math.min(2,b[0]-a[0]));
      const ex=b[0]+(G.side?0:25*k)+sway,ey=Math.min(62,(G.side?b[1]:b[1]+10));
      const E=G.layer();E.line(rx,ry,ex,ey,DARK,1).rect(ex-2,ey,5,9,PAPER).stamp();
      const D=G.layer();D.rect(ex-1,ey+1,3,3,RED).line(ex,ey+5,ex,ey+8,DARK,1).stamp({outline:false});
    }
  }
});
})();
