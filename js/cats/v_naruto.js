"use strict";
/* Ba dạng Naruto dùng chung đầu, thân và nhịp chân của Xoài. */
(()=>{
const K=CatKit,{P,FT}=K;
const INK=[52,48,66],BLUE=[46,62,124],BLUE2=[34,46,96],ORANGE=[244,138,40],
  HAIR=[247,207,58],LIGHT=[255,242,166],CHAKRA=[255,208,64],GLOW=[255,236,146],
  WHITE=[250,248,244],GREY=[222,218,212],RED=[214,52,58],METAL=[216,220,230],STEEL=[150,156,172];
const LEAF=["..##..","##..#.",".#.##.","##.##.","#.##.."],FIRE=["#.##.#","..##..","..##..",".####.","##..##","#....#"];
const glyph=(L,rows,x,y,c)=>rows.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]==='#')L.set(x+i,y+j,c)});
const flame=(u,v,b)=>v>b-2-3*Math.abs(Math.sin(u*.6+.4));
K.costume('v_naruto',{
  shape(F,s,FX){
    // Tai nằm trong mũ Hokage, không chọc qua mặt trắng của mũ.
    if(s.ct==='nrHokage')FX.erase(F,(i,x,y)=>F.part[i]===P.EAR&&y<F.A.crown[1]+1);
  },
  paint(c,s){
    const {part,kind,u,v,A0,side}=c,ku=s.ct==='nrKurama',ho=s.ct==='nrHokage';
    if(kind!=='fur')return;
    if(part!==P.BODY&&!K.isLeg(part))return;
    c.zone=false;if(c.mark)c.lv=0;
    if(c.feat===FT.PAW)return ku?INK:BLUE;
    if(ku){
      if(side)return part===P.BODY&&u<A0.throat[0]-6?CHAKRA:INK;
      return Math.abs(u-A0.body[0])<5?INK:CHAKRA;
    }
    if(ho){
      if(side&&part===P.BODY&&u<A0.throat[0]-6)return flame(u,v,A0.belly[1]-1)?RED:WHITE;
      if(!side&&Math.abs(u-A0.body[0])>5)return flame(u,v,A0.pawL[1]-1)?RED:WHITE;
    }
    if(side)return part===P.BODY&&u>A0.throat[0]-6?INK:ORANGE;
    return v<A0.chest[1]-1||Math.abs(u-A0.body[0])<1.5?INK:ORANGE;
  },
  draw(G,s){
    const A=G.A,B=G.lag(2),side=G.side,ku=s.ct==='nrKurama',ho=s.ct==='nrHokage',sleep=G.F.anim==='sleep',x=A.crown[0],y=A.crown[1];
    // Vạt áo và mạng che nối vào thân hiện tại, gấu theo thân trễ hai khung.
    if(ku||ho){
      const C=G.layer(),fill=ho?WHITE:CHAKRA;
      if(side){
        const bottom=Math.min(70,B.belly[1]+5),left=Math.max(3,B.hip[0]-8);
        C.poly([[A.neck[0],A.neck[1]-1],[A.throat[0]-4,A.throat[1]+3],[A.throat[0]-8,bottom-2],[left,bottom],[left+5,B.hip[1]+5]],(u,v)=>flame(u,v,bottom)?ho?RED:ORANGE:fill);
      }else if(sleep){
        const bx=B.body[0],by=B.body[1];
        C.poly([[A.body[0]+4,A.body[1]-8],[bx-8,by-5],[Math.max(4,bx-12),Math.min(71,by+12)],[bx+12,Math.min(71,by+12)]],(u,v)=>flame(u,v,by+12)?ho?RED:ORANGE:fill);
      }else{
        const by=Math.min(71,B.body[1]+6),bx=B.body[0];
        C.poly([[A.neck[0]-7,A.neck[1]-1],[A.neck[0]+7,A.neck[1]-1],[bx+21,by-2],[bx+14,by],[bx+8,by-2],[bx,by],[bx-8,by-2],[bx-20,by]],(u,v)=>flame(u,v,by)?ho?RED:ORANGE:fill);
      }
      C.stamp({behind:true,clip:(u,v)=>v<=71});
      if(ho){
        const V=G.layer();
        if(side)V.poly([[x-14,y],[x+9,y+5],[B.chin[0]-4,Math.min(71,B.chin[1]+5)],[B.neck[0]-7,B.neck[1]+5]],WHITE);
        else V.ell(B.head[0],Math.min(57,B.head[1]+1),23,19,WHITE);
        V.stamp({behind:true,clip:(u,v)=>v<=71});
      }
    }
    // Băng trán thắt sau đầu; hai dải có độ trễ khác nhau.
    if(!ku&&!ho){
      const B1=G.lag(1),T=G.layer(),tx=side?x-17:x+18,ty=y+7;
      T.line(tx,ty,side?B1.crown[0]-34:B1.crown[0]+29,B1.crown[1]+12,BLUE,3);
      T.line(tx,ty+2,side?B.crown[0]-29:B.crown[0]+26,B.crown[1]+21,BLUE2,3).stamp({behind:true});
    }
    const H=G.layer(),hc=ku?LIGHT:HAIR;
    if(!ho&&side){
      H.poly([[x-17,y+12],[x-25,y+8],[x-17,y+3],[x-24,y-3],[x-12,y-1],[x-16,y-10],[x-5,y-4],[x,y-12],[x+6,y-3],[x+13,y-10],[x+15,y+5],[x+9,y+10]],hc).stamp({behind:true});
      const Cap=G.layer();
      Cap.poly([[x-17,y+1],[x+14,y+1],[x+17,y+8],[x+12,y+14],[x+8,y+8],[x+3,y+12],[x-2,y+7],[x-9,y+13],[x-14,y+8],[x-18,y+13]],hc).stamp({edge:false,clip:(u,v)=>{
        const f=G.F.feat[v*G.W+u];return f!==FT.EYEL&&f!==FT.EYER;
      }});
    }else if(!ho){
      // Chín chỏm chung một khối, phủ chân tai để không hở nền hay viền trong.
      const l=A.earL,r=A.earR,top=v=>Math.max(3,v),shade=ku?[245,211,111]:[218,165,37],E=G.layer();
      // Chỉ giữ chóp tai có sẵn; bên dưới vẫn là tóc liền, không khoét ô trống.
      for(const e of [l,r])for(let v=e[1];v<=e[1]+5;v++)for(let u=e[0]-5;u<=e[0]+5;u++){
        if(G.F.part[v*G.W+u]===P.EAR&&G.F.role[v*G.W+u]>1)E.set(u,v,G.get(u,v));
      }
      H.poly([[x-20,y+4],[l[0]-19,y+8],[x-24,y+3],
        [l[0]-18,top(l[1]+3)],[x-23,y],
        [l[0]-11,top(l[1]-3)],[x-16,y-2],
        [l[0],top(l[1]-9)],[x-6,y-5],
        [x,top(y-19)],[x+6,y-5],
        [r[0]+1,top(r[1]-9)],[x+16,y-2],
        [r[0]+12,top(r[1]-3)],[x+23,y],
        [r[0]+19,top(r[1]+3)],[x+24,y+3],
        [r[0]+20,y+8],[x+20,y+4],
        [x+17,y+9],[x+13,y+4],[x+10,y+4],[x+6,y+9],[x+3,y+4],
        [x-3,y+4],[x-6,y+9],[x-10,y+4],[x-13,y+4],[x-17,y+9]],
        (u,v)=>v>=y+2+(Math.abs(u-x)<13?0:1)?shade:hc).stamp();
      E.stamp({outline:false});
    }else{
      const Bang=G.layer();
      for(let k=-1;k<=1;k++)Bang.poly([[x+k*8-4,y+7],[x+k*8+3,y+7],[x+k*8-2,y+13]],HAIR);
      Bang.stamp({edge:false});
      const Hat=G.layer();
      Hat.poly([[x-17,y+1],[x,y-(side?12:15)],[x+17,y+1]],WHITE).ell(x,y+2,23,3,WHITE);
      Hat.poly([[x-10,y+1],[x,y-10],[x+10,y+1]],RED).stamp();
      const D=G.layer();glyph(D,FIRE,x-3,y-6,WHITE);D.line(x-18,y+4,x+18,y+4,GREY,1).stamp({outline:false});
    }
    if(!ku&&!ho){
      const Band=G.layer();
      const by=y+(side?3:6);
      Band.rect(x-18,by+1,36,5,BLUE).rect(x-8,by,17,7,STEEL).rect(x-7,by+1,15,5,METAL).stamp({edge:false});
      const D=G.layer();glyph(D,LEAF,x-3,by+1,[92,98,120]);D.stamp({outline:false});
    }
    if(!side&&!ho){
      // Mái ngắn phủ mép băng; chừa nguyên miếng kim loại và biểu tượng Lá.
      const Bang=G.layer();
      for(const k of [-1,1]){
        Bang.poly([[x+k*20,y+1],[x+k*13,y+1],[x+k*17,y+9]],hc);
        Bang.poly([[x+k*12,y+1],[x+k*4,y+1],[x+k*6,y+9]],hc);
      }
      Bang.stamp({outline:false});
    }
    // Ba vạch mỗi má; giữ nguyên mí mắt nhắm của Xoài.
    const M=G.layer(),mark=(e,k)=>{for(let j=0;j<3;j++)M.line(e[0]+k*4,e[1]+5+j*3,e[0]+k*9,e[1]+4+j*4,INK,ku?2:1)};
    if(side)mark(A.eye,-1);else{mark(A.eyeL,-1);mark(A.eyeR,1)}
    M.stamp({outline:false,clip:(u,v)=>G.F.part[v*G.W+u]===P.HEAD&&v<=(side?A.chin[1]:A.chin[1]-2)});
    if(ku){
      const Eyes=G.layer(),eye=e=>{
        let open=false;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(G.F.role[(e[1]+dy)*G.W+e[0]+dx]>=11)open=true;
        if(open)Eyes.line(e[0]-2,e[1],e[0]+2,e[1],INK,1).line(e[0],e[1]-2,e[0],e[1]+2,INK,1);
      };
      if(side)eye(A.eye);else{eye(A.eyeL);eye(A.eyeR)}Eyes.stamp({outline:false});
      const O=G.layer(),cx=side?B.neck[0]-15:B.head[0],cy=side?B.back[1]-14:B.crown[1]+4;
      const orbs=side?[[cx-13,cy+3],[cx-5,cy-6],[cx+6,cy-10]]:[[cx-28,cy-6],[cx+27,cy-6],[cx-30,cy+9],[cx+28,cy+10]];
      orbs.forEach(p=>O.ell(Math.max(5,Math.min(G.W-6,p[0])),Math.max(5,p[1]),3,3,INK));O.stamp({behind:true,outline:[28,26,38]});
    }
    // Dấu áo chỉ tô trên thân: không đè lên đầu hoặc chân đang đưa lên.
    const D=G.layer(),cx=side?A.back[0]-5:A.chest[0]-7,cy=side?A.back[1]+8:A.chest[1];
    if(ku){
      for(let j=-1;j<=1;j++)D.ell(cx,cy+j*4,1,1,INK);
      if(!side&&!sleep){D.ell(A.body[0],A.body[1],3,3,CHAKRA).ell(A.body[0],A.body[1],1,1,INK)}
    }else if(!ho){
      D.ell(cx,cy,2,2,RED).set(cx-1,cy-1,WHITE);
      const px=side?A.back[0]+5:A.body[0]+8,py=side?A.belly[1]-7:A.body[1]+2;
      D.rect(px,py,5,2,WHITE);
    }
    D.stamp({outline:false,clip:(u,v)=>G.F.part[v*G.W+u]===P.BODY});
  }
});
})();
