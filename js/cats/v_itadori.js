"use strict";
(()=>{
const P=CatKit.P,FT=CatKit.FT,{hex}=CatKit.U;
const SKIN=hex('#f6dfb8'),PINK=hex('#f08aa0'),LIGHT=hex('#ffacb8'),
  SHAVE=hex('#5a3a34'),SUIT=hex('#2a2d44'),RED=hex('#c0392b'),
  INK=hex('#16121a'),EYE=hex('#ff3a50'),GOLD=hex('#e5b64e'),KIMONO=hex('#f1ece2');
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
      // Sukuna chiếm xác: kimono trắng, ve áo và đai đen, ngực để hở; hai chân trước để trần có hai vòng đen mảnh ở cổ tay.
      if(q.kind!=='fur')return;
      if(q.mark)q.lv=0;
      // Dáng ngồi gắn hai chân trước vào BODY nên phải nhận ra theo vị trí bàn chân.
      const front=q.side?(p===P.NF||p===P.FF):
        (p===P.LEG||(p===P.BODY&&v>=a.pawL[1]-12&&
          (Math.abs(u-a.pawL[0])<=4||Math.abs(u-a.pawR[0])<=4)));
      if(front){
        const d=(q.side?a.footNF[1]:a.pawL[1])-v;
        if(d===4||d===7){q.lv=0;return INK}
        return SKIN;
      }
      if(q.feat===FT.PAW)return SKIN;
      if(p===P.BODY){
        if(q.side){
          const dx=u-a.chest[0];
          if(dx>=-2)return SKIN;                                   // ngực hở
          if(dx>=-5){q.lv=0;return INK}                            // ve áo
          if(Math.abs(u-a.belly[0])<=1){q.lv=0;return INK}         // đai lưng
          return KIMONO;
        }
        const dx=Math.abs(u-a.chest[0]),dy=v-a.neck[1],gap=4.5-dy*.4;
        if(dy<11&&dx<gap)return SKIN;                              // ngực hở hình chữ V
        if(dy<12&&dx<gap+2.4){q.lv=0;return INK}                   // hai ve áo
        if(v>=a.body[1]+1&&v<=a.body[1]+3){q.lv=0;return INK}      // đai lưng
      }
      return KIMONO;
    }
    if(q.kind==='fur'){q.lv=q.mark?0:Math.min(q.lv,0);return SUIT}
  },
  draw(G,s){
    const a=G.A,rare=possessed(s),c=a.crown,n=a.neck,lag=G.lag(1),L=G.layer();
    // Mũ trùm trễ một nhịp, nổi sau gáy (dạng Sukuna mặc kimono nên không có mũ, khăn và khuy).
    if(!rare){
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
    }
    // Tóc ngắn gắn đầu; các chóp Sukuna vuốt ngược, cao hơn ba hàng.
    const hair=G.layer(),x=c[0],y=c[1],rise=rare?4:0;
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
        // Dấu Sukuna thật nhỏ, nét một ô mịn: ấn trán và khe mắt phụ đỏ dưới mắt.
        face.rect(e[0]-1,e[1]-6,4,1,INK);
        face.rect(e[0]-1,e[1]+5,4,1,INK).rect(e[0],e[1]+5,2,1,EYE);
      }else{
        face.line(e[0]-3,e[1]+6,e[0]-1,e[1]+7,SHAVE);
        face.line(e[0]+1,e[1]+6,e[0]+3,e[1]+7,SHAVE);
      }
    }else{
      const h=a.head,t=a.chin,no=a.nose;
      for(const eye of [a.eyeL,a.eyeR]){
        if(rare){
          const dir=eye[0]<h[0]?-1:1;
          face.rect(eye[0]-2,eye[1]+5,5,1,INK).rect(eye[0]-1,eye[1]+5,3,1,EYE);   // khe mắt phụ
          face.rect(eye[0]+dir*7,eye[1]+4,1,3,INK);                               // vạch má
        }else{
          face.line(eye[0]-3,eye[1]+5,eye[0]-2,eye[1]+7,SHAVE);
          face.line(eye[0]+2,eye[1]+5,eye[0]+3,eye[1]+7,SHAVE);
        }
      }
      if(rare){
        const y=a.eyeL[1]-5;                                                      // ấn trán: một vạch dọc và hai vạch ngang ngắn
        face.rect(h[0],y-1,1,3,INK).rect(h[0]-4,y,2,1,INK).rect(h[0]+3,y,2,1,INK);
        face.rect(h[0]-1,t[1]-4,1,2,INK).rect(h[0]+1,t[1]-4,1,2,INK);             // hai chấm cằm
      }
    }
    face.stamp({outline:false,clip:(x,y)=>{
      const i=y*G.W+x;return !!G.get(x,y)&&G.F.part[i]===P.HEAD;
    }});
  }
});
})();
