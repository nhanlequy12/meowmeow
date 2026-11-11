"use strict";
(()=>{
const K=CatKit,{P,FT,R}=K,H=K.U.hex,FUR=H('#fff9f4'),INK=H('#242424'),RED=H('#df263c'),BLUE=H('#377dc7'),PINK=H('#ffbbd2'),GOLD=H('#f4c243'),WHITE=H('#fff9f4'),LEAF=H('#45915a');
function bow(G,x,y,rare){
  const L=G.layer(),c=rare?H('#e84a77'):RED;
  L.poly([[x-2,y],[x-10,y-5],[x-11,y+4],[x-4,y+6],[x,y+2]],c)
    .poly([[x+2,y],[x+10,y-5],[x+11,y+4],[x+4,y+6],[x,y+2]],c)
    .ell(x,y+1,3,3,c).stamp();
  if(rare){const D=G.layer();D.poly([[x-3,y],[x+3,y],[x+2,y+4],[x,y+6],[x-2,y+4]],RED).line(x-3,y-1,x+3,y-1,LEAF,2).set(x-1,y+2,WHITE).set(x+1,y+3,WHITE).stamp({outline:false})}
}
K.costume('v_hellokitty',{
  shape(F,s,FX){
    // Khung ngủ, chớp mắt và gãi của Xoài vẽ mắt nhắm bằng các ô viền không có nhãn, lưỡi thì mang nhãn mũi.
    // Ở đây gắn nhãn cho chúng để paint xoá đi, rồi ghi lại vị trí thật của từng mắt và mũi trong khung (đầu nghiêng khi gãi) cho draw.
    if(F.view==='side')return;
    const A=F.A,eyes=[];
    // ô nằm sâu trong đầu (cách mép hình hơn 3 ô), để không đụng vào viền đầu
    const inner=(x,y)=>{for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const j=FX.idx(F,x+dx,y+dy);if(j<0||!F.role[j])return false}return true};
    for(const [e,ft] of [[A.eyeL,FT.EYEL],[A.eyeR,FT.EYER]]){
      let n=0,sx=0,sy=0,m=0,ex=0,ey=0;
      FX.each(F,(i,x,y)=>{
        if(F.feat[i]===ft){m++;ex+=x;ey+=y;return}
        if(F.role[i]===R.A&&F.part[i]===P.HEAD&&!F.feat[i]&&Math.abs(x-e[0])<=9&&y>=e[1]-6&&y<=e[1]+7&&inner(x,y)){n++;sx+=x;sy+=y;F.feat[i]=FT.RIM}
      });
      eyes.push(n?{x:Math.round(sx/n),y:Math.round(sy/n),shut:1}:m?{x:Math.round(ex/m),y:Math.round(ey/m)}:{x:e[0],y:e[1]});
    }
    let top=999,nn=0,nx=0,ny=0;
    FX.each(F,(i,x,y)=>{if(F.feat[i]===FT.NOSE)top=Math.min(top,y)});
    FX.each(F,(i,x,y)=>{if(F.feat[i]!==FT.NOSE)return;if(y>top+3)F.feat[i]=FT.MOUTH;else{nn++;nx+=x;ny+=y}});   // phần dưới mũi là lưỡi: Hello Kitty không có miệng
    F.hk={eyes,nose:nn?[Math.round(nx/nn),Math.round(ny/nn)]:A.nose};
  },
  paint(c,s){
    // xoá miệng, mắt gốc, viền mắt và má hồng của khung Xoài: Hello Kitty chỉ có hai mắt bầu dục, mũi vàng và ria
    if(c.feat===FT.MOUTH||c.feat===FT.EYEL||c.feat===FT.EYER||c.feat===FT.RIM||c.feat===FT.CHEEK){c.lv=0;return FUR}
    if(c.feat===FT.NOSE){c.lv=0;return GOLD}
    if(c.kind!=='fur')return;
    if(c.part===P.BODY){
      c.zone=false;if(c.mark)c.lv=0;
      if(s.ct==='hkStrawberry'){
        const hem=(c.side?c.A0.belly[1]-1:c.A0.body[1]+3);
        if(c.v>=hem&&c.v<=hem+2+(Math.floor(c.u/3)%2))return WHITE;
        return PINK;
      }
      return BLUE;
    }
  },
  draw(G,s){
    const A=G.A,B=G.lag(1),rare=s.ct==='hkStrawberry',D=G.layer();
    const hk=G.F.hk,eyes=G.side||!hk?(G.side?[A.eye]:[A.eyeL,A.eyeR]).map(e=>({x:e[0],y:e[1]})):hk.eyes;
    // mắt bầu dục đứng, đen đặc; nhắm thì là một nét cong nhỏ võng xuống
    for(const e of eyes){
      if(e.shut)D.rect(e.x-2,e.y+1,5,1,INK).rect(e.x-3,e.y,1,1,INK).rect(e.x+3,e.y,1,1,INK);
      else D.rect(e.x-1,e.y-3,3,7,INK).rect(e.x-2,e.y-2,5,5,INK);
    }
    const n=G.side||!hk?A.nose:hk.nose;D.ell(n[0],n[1],2,1,GOLD);
    // Ba ria mỗi má. Nhìn ngang chỉ vẽ ba ria trên má đang thấy, hướng về sau, không cắt qua mắt mũi.
    if(G.side){const k=A.cheek;for(let j=-1;j<=1;j++)D.line(k[0]-3,k[1]+3+j*3,k[0]-9,k[1]+3+j*5,INK,1)}
    else for(const k of [-1,1])for(let j=-1;j<=1;j++){
      const x=n[0]+k*17,y=n[1]+j*4;
      D.line(x,y,Math.max(1,Math.min(G.W-2,x+k*7)),y+j*2,INK,1);
    }
    D.stamp({outline:false});
    const ear=G.side?A.earN:A.earR;
    bow(G,ear[0]+(G.side?-2:1),ear[1]+7,rare);
    if(!rare){
      const V=G.layer(),b=G.side?A.throat:A.chest;
      V.line(b[0]-5,b[1]-2,b[0]-5,b[1]+5,BLUE,3).line(b[0]+5,b[1]-2,b[0]+5,b[1]+5,BLUE,3)
        .ell(b[0]-5,b[1]+4,1,1,GOLD).ell(b[0]+5,b[1]+4,1,1,GOLD).stamp({outline:false});
      return;
    }
    // vương miện đội lệch trên tai còn lại để không che nơ
    const C=G.layer(),ce=G.side?A.earF:A.earL,x=ce[0]+(G.side?0:2),y=ce[1]+6;
    C.poly([[x-6,y],[x-7,y-7],[x-3,y-4],[x,y-9],[x+3,y-4],[x+7,y-7],[x+6,y]],GOLD).rect(x-5,y-1,11,2,GOLD).ell(x,y-3,1,1,RED).stamp();
    const W=G.layer(),b=G.side?B.hip:B.body,wx=G.side?b[0]+1:Math.min(G.W-9,Math.max(b[0]+20,B.head[0]+24)),wy=b[1]-18;
    W.line(wx,wy+5,wx-3,Math.min(71,wy+24),GOLD,2)
      .poly([[wx,wy+5],[wx-6,wy],[wx-6,wy-4],[wx-3,wy-6],[wx,wy-3],[wx+3,wy-6],[wx+6,wy-4],[wx+6,wy]],RED).stamp({clip:(x,y)=>y<=72});
  }
});
})();
