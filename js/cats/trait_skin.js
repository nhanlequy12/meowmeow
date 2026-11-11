"use strict";
(()=>{
const K=CatKit,{P,FT,R}=K,{hex,mix,lt}=K.U;
const FOLD=32,skinCache=new Map(),eyeCache=new Map();

// Bảng màu da ít tương phản; không để mõm, ngực và chóp đuôi thành lông trắng.
function skin(c){
  let p=skinCache.get(c);
  if(!p){const b=hex(c);p={base:b,light:lt(b,.045),edge:mix(b,[70,49,67],.12),deep:mix(b,[70,49,67],.21),fold:mix(b,[b[0]*.35,b[1]*.3,b[2]*.4],.36)};skinCache.set(c,p)}
  return p;
}
function fold(F,FX,cx,y,half,part){
  for(let dx=-half;dx<=half;dx++){
    const x=Math.round(cx+dx),yy=Math.round(y+(Math.abs(dx)===half?1:0)),i=FX.idx(F,x,yy);
    if(i>=0&&F.part[i]===part&&K.isFur(F.role[i])&&F.feat[i]!==FT.EYEL&&F.feat[i]!==FT.EYER)
      FX.put(F,x,yy,R.C,part,FOLD,F.u[i],F.v[i]);
  }
}

// Thu bề ngang đuôi gốc, giữ nguyên đường cong và chuyển động của từng khung.
function thinTail(F,FX){
  const b=K.bbox(F,i=>F.part[i]===P.TAIL&&K.isFur(F.role[i]));
  if(!b.n)return;
  const vertical=b.y1-b.y0>=b.x1-b.x0,lo=new Int16Array(vertical?F.H:F.W),hi=new Int16Array(lo.length);
  lo.fill(999);hi.fill(-1);
  FX.each(F,(i,x,y)=>{if(F.part[i]===P.TAIL&&K.isFur(F.role[i])){const a=vertical?y:x,v=vertical?x:y;lo[a]=Math.min(lo[a],v);hi[a]=Math.max(hi[a],v)}});
  FX.erase(F,(i,x,y)=>{
    if(F.part[i]!==P.TAIL)return false;
    if(F.role[i]===R.A)return true;
    const a=vertical?y:x,v=vertical?x:y,cut=Math.min(2,Math.floor((hi[a]-lo[a])/2));
    return v<lo[a]+cut||v>hi[a]-cut;
  });
  // Chỉ bổ sung viền của đuôi; không đụng nhãn hoặc ô bàn chân.
  FX.seal(F,i=>F.part[i]===P.TAIL&&K.isFur(F.role[i]));
  FX.erase(F,(i,x,y)=>y>K.BASE&&F.part[i]===P.TAIL);
}
function skinFront(F,s,FX){
  thinTail(F,FX);
  const A=F.A,x=A.crown[0],y=A.crown[1];
  fold(F,FX,x,y+6,6,P.HEAD);fold(F,FX,x,y+9,5,P.HEAD);fold(F,FX,x,y+12,3,P.HEAD);
  if(F.anim==='sleep'){
    fold(F,FX,A.body[0],A.body[1]-4,3,P.BODY);
    fold(F,FX,A.body[0],A.body[1]-1,2,P.BODY);
  }else{
    fold(F,FX,A.chest[0],A.chin[1]+3,4,P.BODY);
    fold(F,FX,A.chest[0],A.chin[1]+6,3,P.BODY);
  }
}
function skinSide(F,s,FX){
  thinTail(F,FX);
  const A=F.A,x=A.eye[0]-6,y=A.crown[1];
  fold(F,FX,x,y+5,4,P.HEAD);fold(F,FX,x,y+8,3,P.HEAD);
  fold(F,FX,A.neck[0]+3,A.neck[1]+4,3,P.BODY);
  fold(F,FX,A.neck[0]+3,A.neck[1]+7,2,P.BODY);
}
K.trait('hairless',{
  front:skinFront,side:skinSide,
  paint(ctx,s){
    if(ctx.kind!=='fur')return;
    const p=skin(s.c),r=ctx.role;
    ctx.zone=false;ctx.lv=0;
    // Da loang vẫn đi qua module hoa văn cow; tắt mọi vùng trắng và vằn nền.
    if(s.pat&&s.pat!=='solid'&&s.pat!=='hairless'){
      if(ctx.feat===FOLD){ctx.lv=-1;ctx.mark=0}
      return;
    }
    if(ctx.feat===FOLD)return p.fold;
    if(ctx.side&&(ctx.part===P.FH||ctx.part===P.FF))return r===R.B?p.deep:p.edge;
    if(ctx.mark)return p.base;
    return r===R.B?p.deep:r===R.C?p.edge:r>=R.E?p.light:p.base;
  }
});

// Mặt cắt lớn, hai đốm sáng riêng, viền sẫm: còn rõ khi mỗi ô chỉ 1–2 px.
const GEM_F=['..KKKK..','.KaaaaK.','KrWWaiiK','KrWPPiiK','KriPPiiK','KriPPilK','KriiilwK','.KlLLlK.','..KKKK..'];
const GEM_S=['.KKKKK.','KrWaaiK','KrWPPiK','KriPPiK','KriiilK','KllLlwK','.KKKKK.'];
function shut(F,s){return s.closed||F.anim==='sleep'||(F.anim==='sit'&&F.i===2)||(F.anim==='groom'&&F.i>=2&&F.i<=4)}
function gemPal(c){
  let p=eyeCache.get(c);
  if(!p){const b=hex(c),d=[22,22,48];p={K:mix(b,d,.76),r:mix(b,d,.38),a:mix(b,d,.2),P:mix(b,d,.84),i:b,l:lt(b,.35),L:lt(b,.63),W:[255,255,255],w:[255,255,255]};eyeCache.set(c,p)}
  return p;
}
function gemShape(F,s,FX){
  if(shut(F,s))return;
  const side=F.view==='side',rows=side?GEM_S:GEM_F,hh=rows.length,ww=rows[0].length;
  function eye(e,feat){
    const x0=e[0]-Math.floor(ww/2),y0=e[1]-Math.floor(hh/2);
    FX.each(F,(i,x,y)=>{
      if(F.feat[i]===feat||(F.part[i]===P.HEAD&&x>=x0&&x<x0+ww&&y>=y0&&y<y0+hh)){
        F.role[i]=R.D;F.feat[i]=0;
      }
    });
    for(let y=0;y<hh;y++)for(let x=0;x<ww;x++){
      const ch=rows[y][x];if(ch==='.')continue;
      FX.put(F,x0+x,y0+y,ch==='K'?R.A:ch==='P'?R.K:ch==='W'||ch==='w'?R.M:R.L,P.HEAD,feat);
    }
  }
  if(side)eye(F.A.eye,FT.EYEL);
  else{eye(F.A.eyeL,FT.EYEL);eye(F.A.eyeR,FT.EYER)}
}
K.trait('gem',{
  front:gemShape,side:gemShape,
  paint(ctx,s){
    if(ctx.feat!==FT.EYEL&&ctx.feat!==FT.EYER)return;
    if(shut(ctx.F,s))return;
    const rows=ctx.side?GEM_S:GEM_F,A=ctx.F.A,e=ctx.side?A.eye:ctx.feat===FT.EYER?A.eyeR:A.eyeL,
      x=ctx.x-e[0]+Math.floor(rows[0].length/2),y=ctx.y-e[1]+Math.floor(rows.length/2),ch=(rows[y]||'')[x];
    if(ch&&ch!=='.')return gemPal(ctx.feat===FT.EYER?(s.eye2||s.eye||'#6fcf5f'):(s.eye||'#6fcf5f'))[ch];
  },
  draw(G,s){
    if(!s.lash||shut(G.F,s))return;
    const rows=G.side?GEM_S:GEM_F,L=G.layer(),white=[255,255,255];
    function lash(e){
      const x0=e[0]-Math.floor(rows[0].length/2),y0=e[1]-Math.floor(rows.length/2);
      L.rect(x0+1,y0-1,rows[0].length-2,1,white);
      L.set(x0,y0,white);L.set(x0+rows[0].length-1,y0,white);
    }
    if(G.side)lash(G.A.eye);else{lash(G.A.eyeL);lash(G.A.eyeR)}
    L.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.HEAD&&G.F.role[y*G.W+x]>0});
  }
});
})();
