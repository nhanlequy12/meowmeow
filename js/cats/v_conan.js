"use strict";
(()=>{
const K=CatKit,{P,FT}=K;
const HAIR=[94,61,40],LIGHT=[133,88,56],BLUE=[61,95,192],WHITE=[250,248,242],RED=[224,72,60],RIM=[58,52,72];
// Gọng tròn rỗng, giữ nguyên mắt và nét nhắm mắt bên trong.
function lens(L,x,y,rx,ry){
  for(let j=-ry;j<=ry;j++)for(let i=-rx;i<=rx;i++){
    const d=i*i/(rx*rx)+j*j/(ry*ry);
    if(d<=1&&d>=.57)L.set(x+i,y+j,RIM);
  }
}
K.costume('v_conan',{
  paint(c){
    if(c.kind!=='fur')return;
    const A=c.A0;
    if(c.part===P.HEAD&&c.v<A.crown[1]+10+((Math.floor((c.u-A.crown[0])/4)%2+2)%2)){
      c.zone=false;if(c.mark)c.lv=0;return HAIR;
    }
    if(c.part===P.BODY&&c.feat!==FT.PAW){
      c.zone=false;if(c.mark)c.lv=0;
      if(!c.side&&Math.abs(c.u-A.chin[0])<4&&c.v<A.chin[1]+10)return WHITE;
      if(c.side&&c.u>A.neck[0]+7&&c.v<A.throat[1]+6)return WHITE;
      return BLUE;
    }
  },
  draw(G){
    const A=G.A,H=G.layer(),x=A.crown[0],y=A.crown[1];
    H.line(x-6,y+3,x+3,y+6,LIGHT,1).stamp({outline:false});
    const L=G.layer();
    if(G.side){
      const e=A.eye;
      lens(L,e[0],e[1]+1,6,7);
      L.line(e[0]-6,e[1],e[0]-14,e[1]-2,RIM,2).line(e[0]+6,e[1]+1,e[0]+9,e[1]+1,RIM,1);
    }else{
      const e=A.eyeL,f=A.eyeR;
      lens(L,e[0],e[1],7,8);lens(L,f[0],f[1],7,8);
      L.line(e[0]+7,e[1]-1,f[0]-7,f[1]-1,RIM,2);
    }
    L.stamp({outline:false});
    const N=G.side?A.throat:A.chin,nx=N[0],ny=Math.min(69,N[1]+3),B=G.layer();
    // Nơ đỏ trên cổ áo trắng, bám cổ ở cả dáng liếm và ngủ.
    B.poly([[nx-7,ny-1],[nx-1,ny+1],[nx-1,ny+3],[nx-7,ny+5]],RED);
    B.poly([[nx+7,ny-1],[nx+1,ny+1],[nx+1,ny+3],[nx+7,ny+5]],RED).rect(nx-1,ny+1,3,3,[166,44,57]);
    B.stamp({outline:false,clip:(x,y)=>y<=75&&G.F.part[y*G.W+x]===P.BODY});
  }
});
})();
