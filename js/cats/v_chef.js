"use strict";
(()=>{
const {hex}=CatKit.U,P=CatKit.P;
const WHITE=hex('#fcfcff'),FOLD=hex('#d6d8e4'),RED=hex('#e2484e'),DARK=hex('#b52f3d');
CatKit.costume('v_chef',{
  paint(q){
    // Áo bếp ôm thân; giữ nguyên các bàn chân của khung Xoài.
    if(q.kind!=='fur')return;
    if(q.part===P.BODY||(CatKit.isLeg(q.part)&&q.v<q.A0.belly?.[1]+3&&q.y<72)){
      q.zone=false;if(q.mark)q.lv=0;return WHITE;
    }
  },
  draw(G){
    const A=G.A,c=A.crown,L=G.layer(),x=c[0],y=c[1],z=Math.min(1,(y-3)/21);
    // Ba múi mũ trắng và đai mũ bám đỉnh đầu.
    L.rect(x-11,y-12*z,23,12*z,WHITE);
    L.ell(x,y-14*z,12,7*z,WHITE);
    L.ell(x-10,y-10*z,7,6*z,WHITE);L.ell(x+10,y-10*z,7,6*z,WHITE);
    L.rect(x-11,y-3,23,3,FOLD);L.rect(x-9,y-4,19,2,WHITE);
    L.stamp();
    const n=G.side?A.throat:A.neck,S=G.layer();
    if(G.side){
      S.line(n[0]-5,n[1]-2,n[0]+5,n[1]+1,RED,3);
    }else S.rect(n[0]-12,n[1]-1,25,3,RED);
    S.rect(n[0]-2,n[1]+1,5,4,DARK);
    S.stamp({behind:G.F.anim==='sleep',clip:(px,py)=>py<73});
    // Đuôi khăn trễ một khung, gốc vẫn nối với nút thắt.
    const lag=G.lag(1),t=G.side?lag.throat:lag.neck,T=G.layer();
    T.poly([[n[0]-1,n[1]+3],[t[0]+5,t[1]+9],[t[0]+7,t[1]+3]],RED);
    T.stamp({behind:G.F.anim==='sleep',clip:(px,py)=>py<73});
    const b=A.chest,B=G.layer();
    B.rect(b[0]+(G.side?-6:5),b[1]+1,2,2,FOLD);
    B.rect(b[0]+(G.side?-6:5),b[1]+6,2,2,FOLD);
    B.stamp({outline:false,clip:(px,py)=>G.F.part[py*G.W+px]===P.BODY&&py<72});
  }
});
})();
