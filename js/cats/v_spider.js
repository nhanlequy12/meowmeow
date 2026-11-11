"use strict";
(()=>{
const K=CatKit,{P}=K,{hex}=K.U;
const RED=hex('#d0342c'),BLUE=hex('#3d5fc0'),INK=hex('#302c3b'),WEB=hex('#772d38'),WHITE=hex('#ffffff');
function rim(c){const i=c.i,w=c.F.W,r=c.F.role;return c.x===0||c.y===0||c.x===w-1||c.y===79||!r[i-1]||!r[i+1]||!r[i-w]||!r[i+w]}
K.costume('v_spider',{
  shape(){}, // Tô mặt nạ trên khung gốc, giữ nguyên bàn chân.
  paint(c){
    if(c.part===P.HEAD||c.part===P.EAR){
      if(c.kind==='line'&&rim(c))return INK;
      c.lv=0;return RED;
    }
    if(c.part===P.BODY||K.isLeg(c.part)){
      if(c.kind==='line')return INK;
      c.lv=c.mark?0:Math.max(-1,Math.min(1,c.lv));
      const A=c.A0;
      if(c.part===P.BODY&&(c.side?c.u<A.chest[0]-12:Math.abs(c.u-A.chest[0])>8))return BLUE;
      if(K.isLeg(c.part)&&c.v<(c.side?A.footNF[1]-8:A.pawL[1]-6))return BLUE;
      return RED;
    }
  },
  draw(G){
    const A=G.A,L=G.layer(),nx=G.side?A.eye[0]-4:A.head[0],ny=G.side?A.eye[1]-5:A.nose[1]-9;
    // Nét mạng nhện lớn, rõ ở cỡ hiển thị trong game.
    L.line(nx,ny-12,nx,ny+20,WEB);
    L.line(nx-17,ny-12,nx+17,ny+20,WEB);L.line(nx+17,ny-12,nx-17,ny+20,WEB);
    L.poly([[nx-17,ny-1],[nx-10,ny+2],[nx,ny+4],[nx+10,ny+2],[nx+17,ny-1],[nx+17,ny],[nx+10,ny+3],[nx,ny+5],[nx-10,ny+3],[nx-17,ny]],WEB);
    L.line(nx-17,ny+12,nx,ny+16,WEB);L.line(nx,ny+16,nx+17,ny+12,WEB);
    L.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.HEAD&&G.F.role[y*G.W+x]!==1});
    const E=G.layer(),closed=G.F.anim==='sleep';
    const eye=(e,dir)=>{const x=e[0],y=e[1],h=closed?1:5;
      E.poly([[x-6*dir,y-5],[x+5*dir,y-1],[x+4*dir,y+h],[x-3*dir,y+h+1],[x-6*dir,y+1]],INK);
      E.poly([[x-4*dir,y-3],[x+3*dir,y],[x+2*dir,y+h-1],[x-2*dir,y+h-1],[x-4*dir,y+1]],WHITE);
    };
    if(G.side)eye(A.eye,1);else{eye(A.eyeL,1);eye(A.eyeR,-1)}
    E.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.HEAD});
    const S=G.layer(),x=G.side?A.chest[0]-14:A.chest[0],y=G.side?A.chest[1]+1:A.chest[1]-2;
    S.ell(x,y,2,3,INK);S.rect(x-1,y-4,3,2,INK);
    for(const d of [-1,1]){S.line(x+d,y-1,x+d*5,y-4,INK);S.line(x+d,y,x+d*5,y-1,INK);S.line(x+d,y+1,x+d*5,y+4,INK)}
    S.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.BODY});
  }
});
})();
