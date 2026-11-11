"use strict";
(()=>{
const P=CatKit.P,FT=CatKit.FT,{hex}=CatKit.U;
const SKIN=hex('#f6dfb8'),PINK=hex('#f08aa0'),LIGHT=hex('#ffacb8'),
  SHAVE=hex('#5a3a34'),SUIT=hex('#2a2d44'),RED=hex('#c0392b'),
  INK=hex('#16121a'),EYE=hex('#e0283a'),GOLD=hex('#e5b64e'),WHITE=hex('#fff5df');
const possessed=s=>s.ct==='itSukuna';
CatKit.costume('v_itadori',{
  // Giữ nguyên toàn bộ khung xương và bàn chân của Xoài.
  shape(){},
  paint(q,s){
    const rare=possessed(s),a=q.A0,p=q.part,u=q.u,v=q.v;
    if(p===P.HEAD){
      if(q.kind==='pink'&&q.feat===FT.CHEEK)return SKIN;
      if(q.kind==='fur'){
        const c=a.crown,h=a.head;
        if(v<c[1]+8+(u%4<2?1:0)){q.lv=0;return PINK}
        if(v<c[1]+16&&(q.side?u<h[0]-8:Math.abs(u-h[0])>14)){
          q.lv=0;return SHAVE;
        }
      }
    }
    if(p!==P.BODY&&!CatKit.isLeg(p))return;
    if(q.kind==='line')return;
    q.zone=false;
    if(rare){
      // Dáng ngồi gắn hai chân trước vào BODY; chỉ tô dải quanh từng bàn.
      const front=q.side?(p===P.NF||p===P.FF):
        (p===P.LEG||(p===P.BODY&&v>=a.pawL[1]-12&&
          (Math.abs(u-a.pawL[0])<=4||Math.abs(u-a.pawR[0])<=4)));
      if(front){
        // Ba vòng theo tọa độ nghỉ, bám chân cả khi co và duỗi.
        const end=q.side?a.footNF[1]:a.pawL[1],d=end-v;
        if((d>=2&&d<=3)||(d>=6&&d<=7)||(d>=10&&d<=11)){
          q.lv=0;return INK;
        }
        if(d<=1&&u%3===0){q.lv=0;return INK}
        return SKIN;
      }
      if(p===P.BODY){
        const open=q.side?u>=a.chest[0]-15:Math.abs(u-a.chest[0])<=9;
        if(open){
          const dy=v-a.chest[1];
          // Vạch vai và ngực lộ ra giữa áo mở, không phủ rời lên chân.
          if(q.side?((dy>=-3&&dy<=-2)||(dy>=2&&dy<=3)):
            ((dy===0||dy===1)&&Math.abs(u-a.chest[0])>=3)){
            q.lv=0;return INK;
          }
          return SKIN;
        }
      }
    }
    if(q.kind==='fur'){q.lv=q.mark?0:Math.min(q.lv,0);return SUIT}
  },
  draw(G,s){
    const a=G.A,rare=possessed(s),c=a.crown,n=a.neck,lag=G.lag(1),L=G.layer();
    // Mũ trùm trễ một nhịp, nổi sau gáy.
    const hood=G.layer(),hn=lag.neck;
    if(G.side)hood.poly([[hn[0]-6,hn[1]-5],[hn[0]+5,hn[1]-3],
      [hn[0]+9,hn[1]+9],[hn[0]-3,hn[1]+8]],RED);
    else hood.ell(hn[0],hn[1]+1,15,6,RED);
    hood.stamp({behind:true,clip:(x,y)=>y<74});
    if(G.side){
      L.poly([[n[0]+2,n[1]],[n[0]+9,n[1]+4],
        [n[0]+10,n[1]+10],[n[0]+5,n[1]+7]],RED);
    }else{
      L.poly([[n[0]-13,n[1]-2],[n[0],n[1]+1],[n[0]+12,n[1]-2],
        [n[0]+10,n[1]+3],[n[0],n[1]+5],[n[0]-11,n[1]+3]],RED);
    }
    L.stamp({outline:false,clip:(x,y)=>y<74});
    // Khuy xoáy vàng trên vạt áo; Sukuna mở áo để lộ ngực.
    const b=G.layer(),ch=a.chest,bx=ch[0]+(G.side?-17:11),by=ch[1]+2;
    b.rect(bx,by,3,3,GOLD).set(bx+1,by+1,SUIT).set(bx+2,by+2,GOLD);
    b.stamp({outline:false,clip:(x,y)=>y<74&&!!G.get(x,y)});
    // Tóc ngắn gắn đầu; các chóp Sukuna vuốt ngược, cao hơn ba hàng.
    const hair=G.layer(),x=c[0],y=c[1],rise=rare?3:0;
    hair.poly([[x-16,y+9],[x-16,y+2],[x-12,y-2-rise],
      [x-10,y+1],[x-6,y-5-rise],[x-4,y],[x+1,y-6-rise],
      [x+4,y-1],[x+8,y-5-rise],[x+10,y],[x+14,y-2-rise],
      [x+15,y+5],[x+12,y+9],[x+8,y+6],[x+4,y+9],
      [x,y+6],[x-5,y+9],[x-9,y+6],[x-12,y+10]],PINK);
    hair.line(x-8,y+1,x-5,y-2-rise,LIGHT);
    hair.line(x+1,y,x+2,y-3-rise,LIGHT);
    hair.stamp({outline:SHAVE,clip:(xx,yy)=>yy>=1&&yy<74});
    const face=G.layer();
    if(G.side){
      const e=a.eye,k=a.cheek,t=a.chin;
      if(rare){
        face.line(e[0]-11,e[1]-7,e[0]-4,e[1]-7,INK,2);
        face.line(e[0]-3,e[1]-6,e[0]+2,e[1]-4,INK,2);
        face.line(e[0]-12,e[1]-5,e[0]-9,e[1]-3,INK,2);
        face.rect(e[0]-2,e[1]+5,6,3,INK).rect(e[0]-1,e[1]+6,4,1,EYE);
        face.line(a.nose[0]-4,a.nose[1]+3,a.nose[0]-4,a.nose[1]+6,INK,2);
        face.line(k[0]-7,k[1]+1,k[0]-6,k[1]+7,INK,2);
        face.line(k[0]-6,k[1]+7,t[0]-4,t[1]-2,INK,2);
        face.line(k[0]-2,k[1]+4,k[0]-1,k[1]+8,INK,2);
        face.line(k[0]-1,k[1]+8,t[0],t[1]-1,INK,2);
        face.line(t[0]+2,t[1]-5,a.nose[0]-2,a.nose[1]+7,INK,2);
        face.rect(a.nose[0]-6,a.nose[1]+9,2,2,WHITE);
        face.line(t[0]+1,t[1]+1,t[0]+4,t[1],INK,2);
      }else{
        face.line(e[0]-3,e[1]+6,e[0]-1,e[1]+7,SHAVE);
        face.line(e[0]+1,e[1]+6,e[0]+3,e[1]+7,SHAVE);
      }
    }else{
      const h=a.head,t=a.chin,no=a.nose;
      for(const eye of [a.eyeL,a.eyeR]){
        if(rare){
          face.line(eye[0]-3,eye[1]-7,eye[0]+3,eye[1]-5,INK,2);
          face.rect(eye[0]-3,eye[1]+5,6,3,INK).rect(eye[0]-2,eye[1]+6,4,1,EYE);
          const dir=eye[0]<h[0]?-1:1;
          face.line(eye[0]+dir*6,eye[1]+4,eye[0]+dir*6,eye[1]+9,INK,2);
          face.line(eye[0]+dir*6,eye[1]+9,h[0]+dir*9,t[1]-3,INK,2);
          face.line(eye[0]+dir*2,eye[1]+10,h[0]+dir*6,t[1]-2,INK,2);
        }else{
          face.line(eye[0]-3,eye[1]+5,eye[0]-2,eye[1]+7,SHAVE);
          face.line(eye[0]+2,eye[1]+5,eye[0]+3,eye[1]+7,SHAVE);
        }
      }
      if(rare){
        face.line(h[0]-6,h[1]-10,h[0]+6,h[1]-10,INK,2);
        face.line(no[0],no[1]-3,no[0],no[1],INK,2);
        face.line(h[0]-3,t[1]-6,h[0]+4,t[1]-6,INK,2);
        face.line(h[0]+4,t[1]-6,h[0]+8,t[1]-9,INK,2);
        face.rect(h[0]+4,t[1]-5,2,2,WHITE);
        face.line(t[0]-2,t[1]-1,t[0]+2,t[1]-1,INK,2);
      }
    }
    face.stamp({outline:false,clip:(x,y)=>{
      const i=y*G.W+x;return !!G.get(x,y)&&G.F.part[i]===P.HEAD;
    }});
  }
});
})();
