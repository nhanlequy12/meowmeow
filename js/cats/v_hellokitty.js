"use strict";
(()=>{
const K=CatKit,{P,FT}=K,H=K.U.hex,FUR=H('#fff9f4'),INK=H('#242424'),RED=H('#df263c'),BLUE=H('#377dc7'),PINK=H('#ffbbd2'),GOLD=H('#f4c243'),WHITE=H('#fff9f4'),LEAF=H('#45915a');
function bow(G,x,y,rare){
  const L=G.layer(),c=rare?H('#e84a77'):RED;
  L.poly([[x-2,y],[x-10,y-5],[x-11,y+4],[x-4,y+6],[x,y+2]],c)
    .poly([[x+2,y],[x+10,y-5],[x+11,y+4],[x+4,y+6],[x,y+2]],c)
    .ell(x,y+1,3,3,c).stamp();
  if(rare){const D=G.layer();D.poly([[x-3,y],[x+3,y],[x+2,y+4],[x,y+6],[x-2,y+4]],RED).line(x-3,y-1,x+3,y-1,LEAF,2).set(x-1,y+2,WHITE).set(x+1,y+3,WHITE).stamp({outline:false})}
}
K.costume('v_hellokitty',{
  paint(c,s){
    if(c.feat===FT.MOUTH||c.feat===FT.EYEL||c.feat===FT.EYER){c.lv=0;return FUR}
    if(c.feat===FT.NOSE){c.lv=0;return GOLD}
    if(c.kind!=='fur')return;
    if(c.part===P.BODY){
      c.zone=false;if(c.mark)c.lv=0;
      if(s.ct==='hkStrawberry'){
        const hem=(c.side?c.A0.belly[1]-1:c.A0.body[1]+3);
        if(c.v>=hem&&c.v<=hem+2+(Math.floor(c.u/3)%2))return WHITE;
        return PINK;
      }
      return BLUE;
    }
  },
  draw(G,s){
    const A=G.A,B=G.lag(1),rare=s.ct==='hkStrawberry',D=G.layer();
    const eyes=G.side?[A.eye]:[A.eyeL,A.eyeR];
    for(const e of eyes){if(G.F.anim==='sleep')D.line(e[0]-2,e[1],e[0]+2,e[1]+1,INK,1);else D.ell(e[0],e[1],2,3,INK)}
    const n=A.nose;D.ell(n[0],n[1],2,1,GOLD);
    // Ba ria mỗi má, bám theo mũi ở cả dáng cuộn ngủ.
    for(const k of [-1,1])for(let j=-1;j<=1;j++){
      const x=n[0]+k*(G.side?4:17),y=n[1]+j*4;
      D.line(x,y,Math.max(1,Math.min(G.W-2,x+k*7)),y+j*2,INK,1);
    }
    D.stamp({outline:false});
    const ear=G.side?A.earN:A.earR;
    bow(G,ear[0]+(G.side?-2:1),ear[1]+7,rare);
    if(!rare){
      const V=G.layer(),b=G.side?A.throat:A.chest;
      V.line(b[0]-5,b[1]-2,b[0]-5,b[1]+5,BLUE,3).line(b[0]+5,b[1]-2,b[0]+5,b[1]+5,BLUE,3)
        .ell(b[0]-5,b[1]+4,1,1,GOLD).ell(b[0]+5,b[1]+4,1,1,GOLD).stamp({outline:false});
      return;
    }
    const C=G.layer(),x=A.crown[0],y=A.crown[1]-2;
    C.poly([[x-6,y],[x-7,y-7],[x-3,y-4],[x,y-9],[x+3,y-4],[x+7,y-7],[x+6,y]],GOLD).rect(x-5,y-1,11,2,GOLD).ell(x,y-3,1,1,RED).stamp();
    const W=G.layer(),b=G.side?B.hip:B.body,wx=G.side?b[0]+1:Math.min(G.W-9,Math.max(b[0]+20,B.head[0]+24)),wy=b[1]-18;
    W.line(wx,wy+5,wx-3,Math.min(71,wy+24),GOLD,2)
      .poly([[wx,wy+5],[wx-6,wy],[wx-6,wy-4],[wx-3,wy-6],[wx,wy-3],[wx+3,wy-6],[wx+6,wy-4],[wx+6,wy]],RED).stamp({clip:(x,y)=>y<=72});
  }
});
})();
