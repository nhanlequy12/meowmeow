"use strict";
(()=>{
const K=CatKit,{P}=K,{hex}=K.U;
const RED=hex('#d0342c'),GOLD=hex('#f2c230'),GOLDLOW=hex('#c4872b'),INK=hex('#63302e'),CYAN=hex('#bff4ff'),CYANDARK=hex('#397d94'),WHITE=hex('#efffff');
function rim(c){const i=c.i,w=c.F.W,r=c.F.role;return c.x===0||c.y===0||c.x===w-1||c.y===79||!r[i-1]||!r[i+1]||!r[i-w]||!r[i+w]}
K.costume('v_iron',{
  shape(){}, // Giáp giữ nguyên mọi điểm chạm đất của khung.
  paint(c){
    const A=c.A0;
    if(c.part===P.HEAD||c.part===P.EAR){
      if(c.kind==='line'&&rim(c))return INK;
      c.lv=0;
      if(c.part===P.HEAD){
        const dx=(c.u-(c.side?A.eye[0]-2:A.head[0]))/(c.side?13:15),dy=(c.v-(A.nose[1]+1))/13;
        if(dx*dx+dy*dy<1)return GOLD;
      }
      return RED;
    }
    if(c.part===P.BODY||K.isLeg(c.part)){
      if(c.kind==='line')return INK;
      c.lv=c.mark?0:Math.max(-1,Math.min(1,c.lv));
      if(K.isLeg(c.part)&&c.v>(c.side?A.footNF[1]-12:A.pawL[1]-10)&&c.v<(c.side?A.footNF[1]-7:A.pawL[1]-6))return GOLD;
      return RED;
    }
  },
  draw(G){
    const A=G.A,L=G.layer(),closed=G.F.anim==='sleep';
    const eye=e=>{const x=e[0],y=e[1];L.line(x-5,y,x+4,y,INK,4);L.rect(x-4,y,8,closed?1:2,CYAN);if(!closed)L.rect(x-3,y,5,1,WHITE)};
    if(G.side)eye(A.eye);else{eye(A.eyeL);eye(A.eyeR)}
    const nx=A.nose[0],cy=A.chin[1];
    L.line(nx-5,cy-5,nx+4,cy-5,INK);L.line(nx-6,cy-6,nx-4,cy-3,GOLDLOW);L.line(nx+5,cy-6,nx+3,cy-3,GOLDLOW);
    L.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.HEAD});
    const R=G.layer(),x=G.side?A.chest[0]-14:A.chest[0],y=G.side?A.chest[1]+1:A.chest[1]-2;
    // Lò phản ứng dùng các ô màu đặc, sáng ổn định.
    R.ell(x,y,5,5,INK);R.ell(x,y,4,4,CYANDARK);R.ell(x,y,3,3,CYAN);R.rect(x-1,y-1,3,3,WHITE);
    R.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.BODY});
  }
});
})();
