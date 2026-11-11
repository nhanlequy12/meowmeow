"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex}=K.U,FUR=hex('#f5f5ed'),STRIPE=hex('#9ca3a8'),CAP=hex('#c9cdd0'),INK=hex('#292c2f'),PINK=hex('#e5b2b8'),YELLOW=hex('#f1d789'),SHIRT=hex('#9ec8a2'),HAT=hex('#e2c69b'),BAND=hex('#ab885b'),PACK=hex('#ad8058'),DARK=hex('#75553c'),METAL=hex('#6b8490');
K.costume('v_chi',{
  paint(c,s){
    if(c.kind==='eye'||c.feat===FT.MOUTH||c.feat===FT.RIM)return FUR;
    if(c.feat===FT.EARIN)return PINK;
    if(c.kind!=='fur')return;const A=c.A0;c.zone=false;if(c.mark)c.lv=0;
    if(s.ct==='chiExplorer'&&c.part===P.BODY)return SHIRT;
    if(c.part===P.HEAD&&c.v<A.crown[1]+10){
      const dx=c.u-A.crown[0];if(Math.abs(dx)<13){if(Math.abs((dx+15)%8-4)<1.6)return STRIPE;return CAP}
    }
    if(c.part===P.BODY){if(c.side&&c.v<A.back[1]+9&&c.u>A.hip[0]+2&&c.u<A.neck[0]&&((c.u-A.hip[0])%11)<4)return STRIPE;if(!c.side&&c.u<A.body[0]-10&&c.v>A.body[1]-10&&c.v<A.body[1]+1&&(c.v-A.body[1]+10)%5<2)return STRIPE}
    if(c.part===P.TAIL){const t=A.tailTip,d=Math.hypot(c.u-t[0],c.v-t[1]);if((d>5&&d<9)||(d>13&&d<17))return STRIPE}
    return FUR;
  },
  draw(G,s){
    const A=G.A,B=G.lag(1),exp=s.ct==='chiExplorer',sleep=G.F.anim==='sleep';
    if(exp){
      // Balo trễ theo lưng, biểu tượng cá là mảng màu lớn.
      const x=G.side?B.back[0]-10:B.body[0]+(sleep?-6:-18),y=G.side?B.back[1]-4:B.body[1]-8,L=G.layer();
      L.rect(x-6,y-6,13,17,PACK).line(x-3,y-7,x+3,y-7,DARK,2).stamp();
      const D=G.layer();D.ell(x,y+2,3,2,YELLOW).poly([[x+2,y+2],[x+5,y-1],[x+5,y+5]],YELLOW).set(x-2,y+1,DARK).stamp({outline:false});
      const cx=A.crown[0],cy=A.crown[1],H=G.layer();
      H.ell(cx,cy,10,7,HAT).rect(cx-10,cy-1,21,3,BAND).ell(cx,cy+3,15,2,HAT).stamp();
    }
    const E=G.layer(),eyes=G.side?[A.eye]:[A.eyeL,A.eyeR];
    for(const e of eyes){if(sleep||G.F.anim==='groom'||(G.F.anim==='sit'&&G.F.i===2))E.line(e[0]-3,e[1],e[0]+3,e[1],INK,1);else{E.ell(e[0],e[1],3.5,4.5,INK);E.set(e[0]-1,e[1]-2,FUR)}}
    const n=A.nose,mx=G.side?n[0]-5:n[0],my=n[1]+4;
    E.line(mx-4,my,mx-2,my+2,INK,1).line(mx-2,my+2,mx,my,INK,1).line(mx,my,mx+2,my+2,INK,1).line(mx+2,my+2,mx+4,my,INK,1).stamp({outline:false});
    const a=sleep?[A.neck[0]-13,A.neck[1]-5]:A.neck,b=sleep?[B.neck[0]-13,B.neck[1]-5]:B.neck,S=G.layer();
    S.poly(G.side||sleep?[[b[0],b[1]+1],[b[0]-7,Math.min(75,b[1]+12)],[b[0]+6,Math.min(74,b[1]+8)],[b[0]+9,b[1]+1]]:[[b[0]-8,b[1]],[b[0]+8,b[1]],[b[0]+2,Math.min(71,b[1]+13)]],YELLOW).stamp({clip:(x,y)=>y<=76});
    const C=G.layer();C.line(a[0]-7,a[1]+1,a[0]+8,a[1]+2,YELLOW,3).stamp();
    if(exp){
      const x=G.side?B.chest[0]-1:B.chest[0]+2,y=Math.min(68,B.chest[1]+2),T=G.layer();
      T.line(a[0]-5,a[1]+3,x-5,y-3,DARK,1).line(a[0]+6,a[1]+3,x+5,y+1,DARK,1).line(x-5,y-2,x+5,y+2,BAND,4).line(x+4,y+1,x+7,y+3,METAL,5).line(x-6,y-3,x-4,y-2,METAL,3).stamp();
    }
  }
});
})();
