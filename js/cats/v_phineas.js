"use strict";
(()=>{
const P=CatKit.P,{hex}=CatKit.U,SKIN=hex('#f6d2a8'),HAIR=hex('#e8642a'),ORANGE=hex('#f08a2a'),WHITE=hex('#fff7e9'),BLUE=hex('#3d5fa8'),EYE=hex('#3a6ad0'),INK=hex('#553d32');
// Đầu tam giác hướng về mõm; giữ nguyên thân và nhịp bàn chân.
CatKit.costume('v_phineas',{
  shape(F,s,FX){
    const h=F.A.head,n=F.A.nose,side=F.view==='side';
    const pts=side?[[h[0]-17,h[1]-14],[h[0]-17,h[1]+16],[Math.min(F.W-4,n[0]+2),h[1]+1]]:[[h[0]-18,h[1]-14],[h[0]-11,h[1]+16],[h[0]+23,h[1]+2]];
    FX.erase(F,i=>F.part[i]===P.HEAD||F.part[i]===P.EAR);
    for(let y=Math.floor(h[1]-14);y<=h[1]+16;y++)for(let x=Math.floor(h[0]-18);x<=Math.min(F.W-4,h[0]+23);x++){
      let pos=false,neg=false;
      for(let j=0;j<3;j++){const a=pts[j],b=pts[(j+1)%3],d=(x-a[0])*(b[1]-a[1])-(y-a[1])*(b[0]-a[0]);if(d>0)pos=true;if(d<0)neg=true}
      if(!(pos&&neg))FX.put(F,x,y,5,P.HEAD,0,x-h[0]+40,y-h[1]+38);
    }
    FX.prune(F);FX.seal(F,i=>F.part[i]===P.HEAD);
  },
  paint(c){
    if(c.part===P.HEAD){c.zone=false;c.lv=0;return c.kind==='line'?INK:SKIN}
    if(c.kind!=='fur')return;
    if(c.part===P.BODY){c.zone=false;c.lv=0;return Math.floor((c.v-c.A0.neck[1])/4)%2===0?ORANGE:WHITE}
    if(CatKit.isLeg(c.part)){
      const rear=c.side?(c.part===P.NH||c.part===P.FH):c.u<c.A0.body[0]-5;
      if(rear){c.zone=false;c.lv=0;return BLUE}
    }
  },
  draw(G){
    const h=G.A.head,L=G.layer(),side=G.side,back=h[0]-(side?17:18),top=h[1]-14;
    // Tóc ngắn gắn trên đầu, bốn lọn đỏ cam dễ nhận ra.
    L.poly([[back,top+10],[back-3,top+1],[back+3,top+3],[back+1,top-5],[back+9,top],[back+10,top-6],[back+17,top+2],[back+21,top-2],[back+22,top+9]],HAIR);
    L.stamp({outline:INK});
    const face=G.layer(),closed=G.F.anim==='sleep'||G.F.anim==='groom'||(G.F.anim==='sit'&&G.F.i===2);
    const eyes=side?[[h[0]-7,h[1]-3,5]]:[[h[0]-8,h[1]-2,4],[h[0]+4,h[1]+1,4]];
    for(const [x,y,r] of eyes){if(closed)face.line(x-r+1,y,x+r-1,y+1,INK,1);else{face.ell(x,y,r,r+1,INK);face.ell(x,y,r-1,r,WHITE);face.ell(x+1,y+1,2,3,EYE);face.set(x+1,y-1,WHITE)}}
    const tx=side?Math.min(G.W-4,G.A.nose[0]+1):h[0]+20,ty=h[1]+2;
    face.line(tx-4,ty+4,tx-8,ty+5,INK,1);face.stamp({outline:false});
    if(G.F.anim==='groom'&&G.F.i>=1&&G.F.i<=4){
      const hand=G.layer(),c=G.A.chest,px=h[0]+9,py=G.A.nose[1]+5;
      hand.line(c[0]+5,c[1]+2,px,py,SKIN,5);hand.ell(px,py,3,3,SKIN);hand.stamp({outline:INK});
    }
  }
});
})();
