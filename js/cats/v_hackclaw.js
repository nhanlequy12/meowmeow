"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex,vnoise}=K.U;
const HAIR=hex('#1a2730'),ARMOR=hex('#242c35'),EDGE=hex('#46535f'),GREEN=hex('#67e5be'),GLASS=hex('#397f78');
const INK=hex('#1b1b20'),PAPER=hex('#e6e3e0'),SILVER=hex('#a8bac6'),BLACK=hex('#11181f');
K.costume('v_hackclaw',{
  paint(c,s){
    if(c.kind!=='fur')return;
    const A=c.A0,inky=s.ct==='hcInky';
    if(c.part===P.HEAD&&c.v<(c.side?A.eye[1]:A.eyeL[1])-7+Math.cos((c.u-A.head[0])/4)*2){
      c.lv=0;return inky&&Math.abs(c.u-A.head[0]+4)<2?SILVER:HAIR;
    }
    if(c.part===P.BODY||(K.isLeg(c.part)&&c.v<68&&c.feat!==FT.PAW)){
      c.zone=false;if(c.mark)c.lv=0;
      const x=c.u-(c.side?A.belly[0]:A.body[0]),y=c.v-(c.side?A.back[1]:A.neck[1]);
      if(inky)return x+y*.36+(vnoise(c.u,c.v,7)-.5)*16>1?PAPER:INK;
      if(c.part===P.BODY){
        if(c.side?y>6&&y<9&&x>-7&&x<7:y>6&&y<9&&Math.abs(x)<9)return GREEN;
        if(Math.abs(x)<2||Math.floor(y/7)%3===1)return EDGE;
      }
      return ARMOR;
    }
  },
  draw(G,s){
    const A=G.A,B=G.lag(1),C=G.lag(2),inky=s.ct==='hcInky';
    if(inky){
      // Vòng âm dương nằm sau lưng, trễ một khung.
      const p=G.side?B.back:B.body,x=Math.max(12,Math.min(G.W-13,p[0]-(G.side?6:18)));
      const y=Math.max(12,Math.min(64,p[1]-(G.side?12:17))),L=G.layer();
      L.ell(x,y,10,10,PAPER);
      L.poly([[x,y-10],[x+7,y-7],[x+10,y],[x+7,y+7],[x,y+10]],INK)
        .ell(x,y-5,5,5,PAPER).ell(x,y+5,5,5,INK)
        .ell(x,y-5,1,1,INK).ell(x,y+5,1,1,PAPER).stamp({behind:true});
    }else{
      // Drone hộp sau lưng, đèn xanh; neo trễ hai khung.
      const p=G.side?C.back:C.body,x=Math.max(8,p[0]-(G.side?15:26)),y=Math.max(9,p[1]-(G.side?14:19));
      const D=G.layer();
      D.line(x-9,y-4,x+9,y-4,BLACK,1).rect(x-10,y-5,6,2,EDGE).rect(x+5,y-5,6,2,EDGE)
        .rect(x-5,y-3,11,7,EDGE).rect(x-3,y-2,6,4,ARMOR).rect(x+1,y-1,3,2,GREEN).stamp();
    }
    // Dao ở hông; lúc cuộn ngủ chuyển sang hông trái, tránh mặt.
    const hip=G.side?A.hip:A.body,kx=hip[0]+(G.side?1:A.head[0]-hip[0]>8?-12:16);
    const ky=hip[1]+(G.side?4:-1),D=G.layer();
    D.poly([[kx-2,ky+1],[kx+2,ky+1],[kx+1,ky+12],[kx-1,ky+14]],inky?INK:SILVER)
      .line(kx-3,ky,kx+3,ky,EDGE,2).line(kx,ky-5,kx,ky-1,BLACK,3).stamp({clip:(x,y)=>y<73});
    // Kính chữ nhật chỉ che một mắt, giữ mắt còn lại của lõi.
    const eye=G.side?A.eye:A.eyeL,x=eye[0],y=eye[1],V=G.layer();
    V.rect(x-6,y-4,12,8,inky?PAPER:BLACK).rect(x-5,y-3,10,6,GLASS)
      .line(x-4,y+1,x+3,y-2,inky?PAPER:GREEN,1)
      .line(x-7,y-1,x-10,y-2,inky?PAPER:EDGE,2).stamp({outline:false});
    G.layer().rect(x+3,y-3,2,2,inky?PAPER:GREEN).stamp({outline:false});
  }
});
})();
