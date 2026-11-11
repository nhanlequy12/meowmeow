"use strict";
(()=>{
const P=CatKit.P,{hex}=CatKit.U,SKIN=hex('#f6d2a8'),GREEN=hex('#4aa84a'),SHIRT=hex('#f2e6b0'),PANTS=hex('#6a4a9a'),WHITE=hex('#fffaf0'),EYE=hex('#3a3448'),INK=hex('#554134');
CatKit.costume('v_ferb',{
  shape(F,s,FX){
    const h=F.A.head,c=F.A.crown,chin=F.A.chin,side=F.view==='side',left=h[0]-(side?12:13),right=h[0]+(side?9:13),top=c[1]-6;
    FX.erase(F,i=>F.part[i]===P.HEAD||F.part[i]===P.EAR);
    // Đầu chữ nhật cao thêm sáu hàng so với đỉnh đầu Xoài.
    for(let y=top;y<=chin[1];y++)for(let x=left;x<=right;x++)FX.put(F,x,y,5,P.HEAD,0,x-h[0]+40,y-h[1]+38);
    FX.prune(F);FX.seal(F,i=>F.part[i]===P.HEAD);
  },
  paint(c){
    if(c.part===P.HEAD){c.zone=false;c.lv=0;return c.kind==='line'?INK:SKIN}
    if(c.kind!=='fur')return;
    if(c.part===P.BODY){c.zone=false;c.lv=0;return c.v>=(c.side?c.A0.belly[1]-8:c.A0.body[1])?PANTS:SHIRT}
    if(CatKit.isLeg(c.part)){
      c.zone=false;c.lv=0;
      return c.side?(c.part===P.NH||c.part===P.FH?PANTS:SKIN):(c.u<c.A0.body[0]-5?PANTS:SKIN);
    }
  },
  draw(G){
    const A=G.A,h=A.head,side=G.side,x=h[0],y=A.crown[1]-6,L=G.layer();
    // Mái xanh hất sang trái, phần tóc sau trễ một khung.
    const lag=G.lag(1).crown,dx=Math.max(-2,Math.min(2,lag[0]-A.crown[0]));
    L.poly([[x-13,y+5],[x-16+dx,y-2],[x-9,y-1],[x-9,y-7],[x-2,y-3],[x+3,y-8],[x+8,y-3],[x+12,y-4],[x+10,y+5],[x+1,y+2],[x-6,y+6]],GREEN);
    L.stamp({outline:INK});
    const face=G.layer(),ey=h[1]-5,closed=G.F.anim==='sleep'||G.F.anim==='groom'||(G.F.anim==='sit'&&G.F.i===2);
    const eyes=side?[[x+5,ey-1,5],[x-3,ey+1,3]]:[[x-7,ey,5],[x+7,ey+1,3]];
    for(const [ex,yy,r] of eyes){if(closed)face.line(ex-r+1,yy,ex+r-1,yy+1,INK,1);else{face.ell(ex,yy,r,r+1,INK);face.ell(ex,yy,r-1,r,WHITE);face.ell(ex+1,yy+1,1,2,EYE)}}
    // Mũi vuông lớn, vẫn nằm trong khung khi nhảy.
    const nx=side?x+10:x+1,ny=h[1]+3;
    face.rect(nx-3,ny-3,7,7,INK);face.rect(nx-2,ny-2,5,5,SKIN);
    face.line(x-3,h[1]+12,x+3,h[1]+12,INK,1);face.stamp({outline:false});
    const collar=G.layer(),n=A.neck;
    if(!side){collar.poly([[n[0]-6,n[1]+1],[n[0],n[1]+5],[n[0]-3,n[1]+8]],WHITE);collar.poly([[n[0]+6,n[1]+1],[n[0],n[1]+5],[n[0]+3,n[1]+8]],WHITE)}
    collar.stamp({outline:false,clip:(x,y)=>y<=75&&G.F.part[y*G.W+x]===P.BODY});
    if(G.F.anim==='groom'&&G.F.i>=1&&G.F.i<=4){
      const hand=G.layer(),c=A.chest,px=x+6,py=A.nose[1]+5;
      hand.line(c[0]+5,c[1]+2,px,py,SKIN,5);hand.ell(px,py,3,3,SKIN);hand.stamp({outline:INK});
    }
  }
});
})();
