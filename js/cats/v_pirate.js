"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex}=K.U;
const HAIR=hex('#4a3020'),LIGHT=hex('#725038'),RED=hex('#c0392b'),COAT=hex('#5a4a6a'),SHIRT=hex('#f1e6d0'),GOLD=hex('#d9b859');
K.costume('v_pirate',{
  shape(){},
  paint(c){
    if(c.kind!=='fur'||c.part!==P.BODY||c.feat===FT.PAW)return;
    const a=c.A0;c.lv=0;
    if(c.side){if(c.v>=a.belly[1]-6&&c.v<=a.belly[1]-3)return RED;return c.u>a.chest[0]-8?SHIRT:COAT}
    if(c.v<a.neck[1])return;
    if(c.v>=a.body[1]+2&&c.v<=a.body[1]+4)return RED;
    return Math.abs(c.u-a.chest[0])<7?SHIRT:COAT;
  },
  draw(G){
    const A=G.A,B=G.lag(1),h=A.head,c=A.crown,n=A.chin,L=G.layer();
    // Tóc dài theo đầu trễ một khung, không che bàn chân.
    const bh=B.head;
    if(G.side){L.ell(bh[0]-12,bh[1]+5,10,22,HAIR);L.ell(bh[0]-17,bh[1]+11,5,17,HAIR)}
    else{L.ell(bh[0]-21,bh[1]+3,8,23,HAIR);L.ell(bh[0]+21,bh[1]+3,8,23,HAIR)}
    L.stamp({behind:true,clip:(x,y)=>y<73});
    // Khăn đỏ dưới mũ ba góc, mép vàng lớn để đọc rõ khi thu nhỏ.
    const H=G.layer(),cx=c[0],cy=c[1];
    H.poly([[cx-22,cy+7],[cx-18,cy-1],[cx+17,cy-1],[cx+22,cy+7]],RED);
    H.poly([[cx-24,cy],[cx-17,cy-6],[cx-12,cy-13],[cx+1,cy-9],[cx+13,cy-13],[cx+18,cy-6],[cx+24,cy],[cx+17,cy+3],[cx-17,cy+3]],COAT);
    H.line(cx-19,cy+1,cx+19,cy+1,GOLD,2);H.stamp();
    const T=G.layer(),bn=B.chin;
    if(G.side){T.line(bn[0]+1,bn[1]-1,bn[0]-2,bn[1]+9,HAIR,3);T.rect(bn[0]-3,bn[1]+6,3,2,GOLD)}
    else{for(const dx of [-4,4]){T.line(n[0]+dx,n[1]-2,bn[0]+dx,bn[1]+9,HAIR,3);T.rect(bn[0]+dx-1,bn[1]+6,3,2,GOLD)}}
    T.stamp({outline:false,clip:(x,y)=>y<73});
    const S=G.layer();
    if(G.side)S.line(bh[0]-18,bh[1]-3,bh[0]-21,bh[1]+13,LIGHT,2);
    else{S.line(bh[0]-24,bh[1],bh[0]-23,bh[1]+14,LIGHT,2);S.line(bh[0]+24,bh[1],bh[0]+23,bh[1]+14,LIGHT,2)}
    S.stamp({outline:false,clip:(x,y)=>y<71});
  }
});
})();
