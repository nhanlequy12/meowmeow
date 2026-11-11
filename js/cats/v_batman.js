"use strict";
(()=>{
const K=CatKit,{P}=K,{hex}=K.U;
const MASK=hex('#3f3c4c'),CAPE=hex('#302c3c'),SUIT=hex('#5a5868'),GOLD=hex('#f2c230'),SKIN=hex('#f6dfb8'),WHITE=hex('#ffffff'),INK=hex('#242331');
function rim(c){const i=c.i,w=c.F.W,r=c.F.role;return c.x===0||c.y===0||c.x===w-1||c.y===79||!r[i-1]||!r[i+1]||!r[i-w]||!r[i+w]}
K.costume('v_batman',{
  shape(){}, // Giữ tai nhọn của khung làm tai mặt nạ.
  paint(c){
    const A=c.A0;
    if(c.part===P.HEAD||c.part===P.EAR){
      if(c.kind==='line'&&rim(c))return INK;
      c.lv=c.kind==='fur'?Math.max(-1,Math.min(1,c.lv)):0;
      const dx=(c.u-A.nose[0])/8,dy=(c.v-(A.chin[1]-5))/6;
      if(dx*dx+dy*dy<1)return SKIN;
      if(c.mark)c.lv=0;
      return MASK;
    }
    if(c.part===P.BODY||K.isLeg(c.part)){
      if(c.kind==='line')return INK;
      c.lv=c.mark?0:Math.max(-1,Math.min(1,c.lv));
      if(K.isLeg(c.part)&&c.v>=(c.side?A.footNF[1]-8:A.pawL[1]-5))return CAPE;
      if(c.part===P.BODY&&(c.side?Math.abs(c.u-A.hip[0]-11)<=2:Math.abs(c.v-A.chest[1]-7)<=1))return GOLD;
      return SUIT;
    }
  },
  draw(G){
    const A=G.A,B=G.lag(2),L=G.layer(),n=B.neck;
    if(G.side){const h=B.hip,y=Math.min(71,h[1]+20);L.poly([[n[0],n[1]-4],[h[0]-11,h[1]+4],[h[0]-17,y],[h[0]-8,y-4],[h[0]-1,y],[n[0]-7,Math.min(70,n[1]+16)]],CAPE)}
    else{const b=B.body,y=Math.min(72,b[1]+7);L.poly([[n[0]-12,n[1]-2],[n[0]+12,n[1]-2],[b[0]+24,y],[b[0]+12,y-3],[b[0]+4,y],[b[0]-4,y-3],[b[0]-13,y],[b[0]-24,y]].map(p=>[Math.max(3,Math.min(G.W-4,p[0])),p[1]]),CAPE)}
    L.stamp({behind:true,outline:INK});
    const E=G.layer(),closed=G.F.anim==='sleep';
    const eye=(e,dir)=>{const x=e[0],y=e[1];E.poly(closed?[[x-4,y],[x+4,y],[x+3,y+1],[x-3,y+1]]:[[x-4,y-2*dir],[x+4,y],[x+3,y+2],[x-3,y+2]],WHITE)};
    if(G.side)eye(A.eye,1);else{eye(A.eyeL,1);eye(A.eyeR,-1)}
    E.line(A.nose[0]-2,A.chin[1]-4,A.nose[0]+2,A.chin[1]-4,INK);
    E.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.HEAD});
    const D=G.layer(),x=G.side?A.chest[0]-14:A.chest[0],y=G.side?A.chest[1]+1:A.chest[1]-2;
    D.ell(x,y,7,4,GOLD);
    D.poly([[x-6,y-2],[x-2,y-1],[x-1,y-3],[x,y-1],[x+1,y-3],[x+2,y-1],[x+6,y-2],[x+4,y+2],[x+2,y+1],[x,y+3],[x-2,y+1],[x-4,y+2]],CAPE);
    D.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.BODY});
  }
});
})();
