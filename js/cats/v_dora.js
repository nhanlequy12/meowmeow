"use strict";
(()=>{
const K=CatKit,{P,R}=K,WHITE=K.WHITE,RED=[224,72,60],GOLD=[246,201,66],GOLDLIGHT=[255,235,143],INK=[91,61,48];
K.costume('v_dora',{
  shape(F,s,FX){
    // Bỏ toàn bộ tai, dựng lại vòm sọ và vá viền trong cùng khung Xoài.
    const A=F.A,side=F.view==='side',cx=A.head[0],cy=A.crown[1]+18,rx=side?20:24,ry=21,cut=A.crown[1]+10;
    FX.erase(F,(i,x,y)=>F.part[i]===P.EAR||(F.part[i]===P.HEAD&&y<=cut));
    for(let y=Math.ceil(cy-ry);y<=cut;y++)for(let x=Math.ceil(cx-rx);x<=Math.floor(cx+rx);x++){
      if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)FX.put(F,x,y,R.D,P.HEAD,0,x-A.head[0]+(side?76:40),y-A.crown[1]+(side?20:21));
    }
    FX.seal(F,(i,x,y)=>F.part[i]===P.HEAD&&y<=cut);
  },
  paint(c){
    if(c.kind!=='fur')return;
    // Mặt trắng rộng; giữ màu mắt và các nét mũi, miệng của lõi.
    if(c.part===P.HEAD){
      const A=c.A0,dx=(c.u-(c.side?A.head[0]+4:A.head[0]))/(c.side?17:19),dy=(c.v-(A.nose[1]+3))/14;
      if(c.v>=(c.side?A.eye[1]-1:A.eyeL[1]-2)&&dx*dx+dy*dy<=1){c.lv=c.mark?0:Math.min(1,c.lv);return WHITE}
    }
    if(c.part===P.BODY){
      const A=c.F.A,dx=(c.x-(c.side?A.chest[0]-8:A.body[0]))/(c.side?20:11),dy=(c.y-(c.side?A.belly[1]-3:A.body[1]-2))/(c.side?10:11);
      if(dx*dx+dy*dy<=1){c.lv=c.mark?0:Math.min(1,c.lv);return WHITE}
    }
  },
  draw(G){
    const A=G.A,sleep=G.F.anim==='sleep',side=G.side,C=G.layer();
    // Vòng cổ ôm cổ; chuông treo dùng mỏ neo trễ một khung.
    const nx=side?A.throat[0]+2:A.chin[0],ny=side?A.throat[1]+1:A.chin[1]+1;
    if(side)C.line(A.neck[0]+4,A.neck[1]+5,nx+4,ny+1,RED,3);
    else C.line(nx-11,ny,nx+10,ny,RED,3);
    C.stamp({outline:false,clip:(x,y)=>{
      const i=y*G.W+x;return y<74&&G.F.role[i]>1&&(G.F.part[i]===P.BODY||G.F.part[i]===P.HEAD);
    }});
    const B=G.lag(1),bn=side?B.throat:B.chin,bx=nx+(bn[0]-(side?A.throat[0]:A.chin[0]))*.4,by=ny+3;
    const bell=G.layer();bell.ell(bx,by,3,3,GOLD).stamp({outline:INK,edge:false,clip:(x,y)=>y<=74});
    G.layer().line(bx-2,by-1,bx+2,by-1,GOLDLIGHT,1).line(bx,by+1,bx,by+2,INK,1).stamp({outline:false,clip:(x,y)=>y<=74});
    // Le túi bán nguyệt trên bụng; khi ngủ chỉ hiện phần còn lộ ra.
    const px=side?A.chest[0]-8:sleep?A.body[0]+4:A.body[0],py=side?A.belly[1]-6:sleep?A.body[1]+5:A.body[1]-4,rx=side?6:8,ry=5,Q=G.layer();
    Q.line(px-rx,py,px+rx,py,INK,1);
    for(let k=0;k<12;k++){
      const t=k*Math.PI/12,t1=(k+1)*Math.PI/12;
      Q.line(px+rx*Math.cos(t),py+ry*Math.sin(t),px+rx*Math.cos(t1),py+ry*Math.sin(t1),INK,1);
    }
    Q.stamp({outline:false,clip:(x,y)=>{
      const i=y*G.W+x;return y<74&&G.F.part[i]===P.BODY&&G.F.role[i]>1;
    }});
  }
});
})();
