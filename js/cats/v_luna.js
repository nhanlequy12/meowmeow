"use strict";
(()=>{
const K=CatKit,{P}=K,H=K.U.hex,GOLD=H('#f4d56b'),BAND=H('#83649d');
K.costume('v_luna',{
  paint(c){
    // Vòng cổ ôm thân; giữ vùng bóng để bộ lông tối có khối.
    if(c.part===P.BODY&&c.kind==='fur'){
      const n=c.A0.neck;
      if(c.side?c.u>=n[0]&&c.u<=c.A0.throat[0]+2&&Math.abs(c.v-n[1]-(c.u-n[0])*0.7)<2:c.v>=n[1]&&c.v<=n[1]+3){c.zone=false;return BAND}
    }
  },
  draw(G){
    const A=G.A,L=G.layer(),x=G.side?A.head[0]+3:A.head[0],y=A.crown[1]+8;
    L.poly([[x+3,y-5],[x-1,y-5],[x-4,y-2],[x-4,y+2],[x-1,y+5],[x+3,y+4],[x,y+3],[x-1,y],[x,y-3]],GOLD).stamp({outline:false});
    const S=G.layer(),n=G.side?A.throat:A.neck,sx=n[0],sy=Math.min(71,n[1]+(G.side?3:6));
    S.poly([[sx,sy-4],[sx+1,sy-1],[sx+4,sy-1],[sx+2,sy+1],[sx+3,sy+4],[sx,sy+2],[sx-3,sy+4],[sx-2,sy+1],[sx-4,sy-1],[sx-1,sy-1]],GOLD).stamp();
  }
});
})();
