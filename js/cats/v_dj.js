"use strict";
(()=>{
const {hex}=CatKit.U,P=CatKit.P;
const HOOD=hex('#49445e'),SEAM=hex('#827c9c'),PHONE=hex('#5c5c78'),PAD=hex('#3c354e');
const CYAN=hex('#82e6e6'),GLASS=hex('#463c5a'),PINK=hex('#f078d2'),WHITE=hex('#eefbff');
CatKit.costume('v_dj',{
  paint(q){
    if(q.kind==='fur'&&(q.part===P.BODY||(CatKit.isLeg(q.part)&&q.v<q.A0.belly?.[1]&&q.y<72))){
      q.zone=false;if(q.mark)q.lv=0;return HOOD;
    }
  },
  draw(G){
    const A=G.A,h=A.head,c=A.crown,L=G.layer();
    // Tai nghe bám đầu; đệm xanh ngọc nổi rõ ở cỡ nhỏ.
    if(G.side){
      const e=A.earN,px=h[0]-8;
      L.line(h[0]-14,c[1]-2,e[0],c[1]-2,PHONE,4);
      L.line(px,c[1]-1,px,h[1]+3,PHONE,4);
      L.ell(px,h[1]+1,6,9,PAD);L.ell(px,h[1],4,7,PHONE);
      L.rect(px-1,h[1]-4,3,9,CYAN);
    }else{
      const left=h[0]-25,right=h[0]+25;
      L.line(left,c[1]+13,left+3,c[1]+1,PHONE,4);
      L.line(left+3,c[1]+1,h[0]-9,c[1]-5,PHONE,4);
      L.line(h[0]-9,c[1]-5,h[0]+9,c[1]-5,PHONE,4);
      L.line(h[0]+9,c[1]-5,right-3,c[1]+1,PHONE,4);
      L.line(right-3,c[1]+1,right,c[1]+13,PHONE,4);
      for(const x of [left,right]){
        L.rect(x-4,h[1]-6,8,15,PAD);L.rect(x-3,h[1]-5,6,13,PHONE);
        L.rect(x-1,h[1]-3,3,9,CYAN);
      }
    }
    L.stamp();
    const S=G.layer();
    if(G.side){
      const e=A.eye;
      S.line(h[0]-2,e[1]-1,e[0]-7,e[1]-1,GLASS,2);
      S.rect(e[0]-7,e[1]-3,14,7,GLASS);
      S.rect(e[0]-5,e[1]-2,2,2,WHITE);S.rect(e[0]-2,e[1]+2,7,1,PINK);
    }else{
      const l=A.eyeL,r=A.eyeR;
      S.line(l[0],l[1]-1,r[0],r[1]-1,GLASS,2);
      for(const e of [l,r]){
        S.rect(e[0]-7,e[1]-3,14,7,GLASS);
        S.rect(e[0]-5,e[1]-2,2,2,WHITE);S.rect(e[0]-3,e[1]+2,8,1,PINK);
      }
    }
    S.stamp();
    // Viền mũ áo và dây rút ngắn nằm trên vải.
    const n=G.side?A.throat:A.neck,B=G.layer(),lag=G.lag(1),t=G.side?lag.throat:lag.neck;
    B.line(n[0]-7,n[1]+2,n[0],n[1]+6,SEAM,2);
    B.line(n[0],n[1]+6,n[0]+7,n[1]+2,SEAM,2);
    B.line(n[0]-3,n[1]+5,t[0]-3,t[1]+11,CYAN,1);
    B.line(n[0]+3,n[1]+5,t[0]+4,t[1]+10,CYAN,1);
    B.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.BODY&&y<72});
  }
});
})();
