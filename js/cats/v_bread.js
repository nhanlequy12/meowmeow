"use strict";
(()=>{
const {hex}=CatKit.U,P=CatKit.P,FT=CatKit.FT;
const CRUST=hex('#d69c60'),TOAST=hex('#ba7d43'),CRUMB=hex('#fae4b4'),LIGHT=hex('#fff0c9');
CatKit.costume('v_bread',{
  // Lát bánh che tai; giữ nguyên đầu, mặt và nhịp chân ngắn.
  shape(F,s,FX){
    const top=F.A.crown[1]+6;
    FX.erase(F,(i,x,y)=>F.part[i]===P.EAR||F.feat[i]===FT.EARIN||(F.part[i]===P.HEAD&&y<top));
  },
  draw(G){
    const A=G.A,h=A.head,c=A.crown,k=A.chin;
    const x0=Math.max(3,h[0]-(G.side?24:29));
    const x1=Math.min(G.W-4,h[0]+(G.side?20:29));
    const y0=Math.max(3,c[1]-8),y1=Math.min(70,k[1]+7);
    const w=x1-x0+1,mid=(x0+x1)/2,L=G.layer();
    // Hai vai tròn và cạnh vuông tạo hình lát sandwich.
    L.rect(x0,y0+7,w,y1-y0-6,CRUST);
    L.ell(x0+w*.28,y0+7,w*.28,7,CRUST);
    L.ell(x1-w*.28,y0+7,w*.28,7,CRUST);
    L.rect(x0+w*.25,y0,w*.5,9,CRUST);
    L.rect(x0+4,y0+8,w-8,y1-y0-11,CRUMB);
    L.ell(x0+w*.28,y0+8,w*.20,4,CRUMB);
    L.ell(x1-w*.28,y0+8,w*.20,4,CRUMB);
    L.rect(x0+w*.28,y0+4,w*.44,6,CRUMB);
    L.line(x0+2,y0+12,x0+2,y1-2,TOAST,1);
    L.line(x0+6,y0+12,x0+6,y1-7,LIGHT,2);
    L.line(mid-8,y1-5,mid+8,y1-5,LIGHT,1);
    L.stamp({behind:true});
  }
});
})();
