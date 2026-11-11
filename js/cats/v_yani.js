"use strict";
(()=>{
const P=CatKit.P,FT=CatKit.FT,{hex}=CatKit.U,FUR=hex('#efe6da'),VEST=hex('#fafaff'),EYE=hex('#6a7a3a'),INK=hex('#514b45'),BAG=hex('#bbb1aa'),LID=hex('#cfc3b7'),PAPER=hex('#fff9e9'),EMBER=hex('#ed6635'),ASH=hex('#bcbdb9'),SMOKE=hex('#d4d2ca');
CatKit.costume('v_yani',{
  shape(){},
  paint(c){
    if((c.feat===FT.EYEL||c.feat===FT.EYER)&&c.part===P.HEAD){c.zone=false;c.lv=0;return FUR}
    if(c.kind==='fur'&&c.part===P.BODY){
      // Nách và cổ khoét rộng; giữ lông chân cho áo ba lỗ.
      const a=c.A0;
      const inside=c.side?c.u>a.hip[0]+5&&c.v>a.back[1]+2:c.v>a.neck[1]+4&&(c.v>a.chest[1]||Math.abs(c.u-a.chest[0])<10);
      if(inside){c.zone=false;c.lv=0;return VEST}
    }
  },
  draw(G){
    const A=G.A,L=G.layer(),sleep=G.F.anim==='sleep',eyes=G.side?[A.eye]:[A.eyeL,A.eyeR];
    // Mí ngang che nửa trên mắt, quầng dưới màu nhạt.
    for(const [x,y] of eyes){
      L.line(x-3,y+5,x+3,y+5,BAG,2);
      L.rect(x-4,y-4,9,8,FUR);
      if(sleep)L.line(x-3,y+1,x+3,y+1,INK,1);
      else{L.rect(x-3,y,7,3,PAPER);L.rect(x,y,3,3,EYE);L.line(x-4,y-1,x+4,y-1,INK,2);L.line(x-3,y-3,x+3,y-3,LID,1)}
    }
    L.stamp({outline:false});
    const n=A.nose,mx=n[0]+(G.side?-1:4),my=n[1]+5,C=G.layer();
    // Điếu thuốc bảy ô, chếch xuống khỏi khoé miệng.
    C.line(mx,my,mx+6,my+3,INK,3);
    for(let t=0;t<7;t++){const y=my+Math.round(t/2);C.set(mx+t,y,PAPER);C.set(mx+t,y-1,PAPER)}
    C.rect(mx+5,my+2,2,2,EMBER);C.set(mx+4,my+2,ASH);C.stamp({outline:false});
    const S=G.layer(),a=G.lag(1).nose,b=G.lag(2).nose,k=G.F.i%4;
    const sx=Math.min(G.W-4,a[0]+(G.side?5:12)),sy=a[1]+6;
    // Cụm khói đặc, đổi nét theo khung và trễ một đến hai nhịp.
    S.ell(sx,sy-3,2,2,SMOKE);
    S.ell(Math.min(G.W-4,sx+(G.side?-1:4)+(k%2)),sy-10,2+(k===1?1:0),2,SMOKE);
    S.ell(Math.min(G.W-5,b[0]+(G.side?3:20)+(k-1)),b[1]-12,3,2,SMOKE);
    S.ell(Math.min(G.W-5,b[0]+(G.side?5:19)-(k%2)),b[1]-19,2,2,SMOKE);
    S.stamp({outline:false});
  }
});
})();
