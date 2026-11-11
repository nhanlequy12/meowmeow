"use strict";
(()=>{
const K=CatKit,{P,FT,R}=K,{hex}=K.U;
const PALE=hex('#eef0ea'),ROBE=hex('#3a3448'),RED=hex('#d0302a'),SLIT=hex('#9a9aa6'),WOOD=hex('#c8bba3'),INK=hex('#59292b');
K.costume('v_voldemort',{
  shape(F,s,FX){
    // Bỏ tai; khép vòm sọ tròn theo mỏ neo đầu của từng khung.
    const a=F.A,h=a.head,side=F.view==='side',rx=side?18:22,ry=side?20:23;
    FX.erase(F,i=>F.part[i]===P.EAR);
    for(let y=Math.max(0,h[1]-ry);y<h[1]-4;y++)for(let x=Math.max(0,h[0]-rx);x<=Math.min(F.W-1,h[0]+rx);x++){
      if(((x-h[0])/rx)**2+((y-h[1])/ry)**2<=1)FX.put(F,x,y,R.E,P.HEAD);
    }
    FX.seal(F,i=>F.part[i]===P.HEAD);FX.prune(F);
  },
  paint(c){
    if(c.part===P.HEAD&&(c.kind!=='line'||c.feat===FT.NOSE||c.feat===FT.MOUTH||c.feat===FT.RIM)){c.lv=0;return PALE}
    if(c.kind==='fur'&&(c.part===P.BODY||K.isLeg(c.part))){c.lv=0;return ROBE}
  },
  draw(G){
    const A=G.A,B=G.lag(1),L=G.layer(),shut=G.F.anim==='sleep'||(G.F.anim==='groom'&&G.F.i>1&&G.F.i<5);
    const eyes=G.side?[A.eye]:[A.eyeL,A.eyeR],ey=G.side?A.eye[1]:Math.min(A.eyeL[1],A.eyeR[1]);
    G.recolor(q=>{
      if(q.part!==P.HEAD)return;
      if(q.role===1&&q.y<=ey+3&&G.get(q.x-2,q.y)&&G.get(q.x+2,q.y)&&G.get(q.x,q.y-2)&&G.get(q.x,q.y+2))return PALE;
      for(const e of eyes)if(Math.abs(q.x-e[0])<=6&&Math.abs(q.y-e[1])<=7)return PALE;
    });
    for(const e of eyes){if(shut)L.line(e[0]-3,e[1],e[0]+2,e[1],RED,1);else{L.rect(e[0]-3,e[1]-2,6,4,RED);L.line(e[0]-4,e[1]-3,e[0]+3,e[1]-2,INK,1)}}
    const n=A.nose;
    if(G.side){L.line(n[0]-5,n[1]+2,n[0]-6,n[1]+5,SLIT,2);L.line(n[0]-1,n[1]+2,n[0]-2,n[1]+5,SLIT,1)}
    else{L.line(n[0]-4,n[1]+2,n[0]-4,n[1]+6,SLIT,2);L.line(n[0]+3,n[1]+2,n[0]+3,n[1]+6,SLIT,2)}
    L.stamp({outline:false});
    // Đũa xương trễ theo chân trước, giữ nguyên nhịp bước.
    const p=G.side?B.chest:B.pawR,wx=p[0]+4,wy=G.side?p[1]+6:p[1]-10,W=G.layer();
    W.line(wx,wy,wx+15,wy-22,G.oc,3);W.line(wx,wy,wx+15,wy-22,WOOD,1);W.stamp({outline:false,behind:G.F.anim==='sleep',clip:(x,y)=>y<73});
  }
});
})();
