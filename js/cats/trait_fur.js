"use strict";
/* Lông dài và mặt tịt: giữ nguyên khớp, bàn chân, tai và đuôi của các trait trước. */
(()=>{
const K=CatKit,{P,FT,R}=K;
const SIDE=[[-1,0],[1,0],[0,-1],[0,1]],FRONT=SIDE.slice(0,3),LR=[-1,1];

// Gom ô mới trước khi dán để mép vừa vẽ không tự mọc thêm lông.
function fluff(F,FX){
  const add=new Map(),limit=F.view==='side'?71:73;
  return {
    put(x,y,i,p,r,f){
      if(x<0||x>=F.W||y<0||y>limit)return;
      const j=y*F.W+x,q=F.part[j];
      if(F.role[j]>1||(q&&q!==p))return;
      add.set(j,[r||R.D,p,f||0,F.u[i]+x-i%F.W,F.v[i]+y-((i/F.W)|0)]);
    },
    done(){
      add.forEach((a,j)=>FX.put(F,j%F.W,(j/F.W)|0,...a));
      FX.seal(F,i=>add.has(i));
    }
  };
}
const tooth=v=>{const t=((v%6)+6)%6;return t<2?1:t<4?2:0};

// Hai chùm má lấy mép đầu thật; không đụng bàn chân giơ lên khi liếm lông.
function cheeks(F,T,side,wide){
  const A=F.A,W=F.W,ey=side?A.eye[1]:Math.round((A.eyeL[1]+A.eyeR[1])/2);
  for(let y=ey+3;y<=Math.min(A.chin[1]-4,71);y++){
    let l=-1,r=-1;
    for(let x=0;x<W;x++){
      const i=y*W+x;
      if(F.part[i]===P.HEAD&&K.isFur(F.role[i])){if(l<0)l=i;r=i}
    }
    if(l<0)continue;
    const d=wide?2:2+tooth(F.v[l]);
    // Nhìn ngang chỉ xù phía gáy, giữ mõm quay phải rõ nét.
    for(let k=1;k<=d;k++)T.put(l%W-k,y,l,P.HEAD);
    if(!side)for(let k=1;k<=d;k++)T.put(r%W+k,y,r,P.HEAD);
  }
}

function fur(F,s,FX){
  const A=F.A,side=F.view==='side',W=F.W,T=fluff(F,FX);
  const A0=K.baseFrame('std',side?'stand':'sit',0).A;
  cheeks(F,T,side,false);
  // Mép lưng, bụng, mông: nhịp răng cưa lấy theo u/v nghỉ, không theo số khung.
  for(let i=0;i<W*F.H;i++){
    const p=F.part[i],r=F.role[i];
    if(!K.isFur(r))continue;
    const x=i%W,y=(i/W)|0;
    if(p===P.BODY&&y<(side?71:72)&&F.feat[i]!==FT.PAW){
      for(const [dx,dy] of side?SIDE:FRONT){
        const j=FX.idx(F,x+dx,y+dy);
        if(j<0||F.role[j]>1||(F.part[j]&&F.part[j]!==P.BODY))continue;
        const d=1+(tooth(dy?F.u[i]:F.v[i])===2?1:0);
        for(let k=1;k<=d;k++)T.put(x+dx*k,y+dy*k,i,P.BODY,r>=R.E?R.F:R.D,r>=R.E?FT.CHEST:0);
      }
    }
    // Quần lông ở đùi sau; dừng trước cổ chân và hai hàng bàn chân.
    if(side&&(p===P.NH||p===P.FH)&&F.feat[i]!==FT.PAW&&y<=71&&F.v[i]<=A0.belly[1]+5){
      for(const dx of LR){
        const j=FX.idx(F,x+dx,y);
        if(j<0||F.role[j]>1||F.part[j]===P.TAIL||F.part[j]===P.EAR)continue;
        for(let k=1;k<=2+tooth(F.v[i]);k++)T.put(x+dx*k,y,i,p,p===P.FH?R.C:R.D);
      }
    }
  }
  // Bờm ngực hình nêm, chùm cuối thu nhọn; lúc ngủ bờm nằm khuất dưới cằm.
  if(!side&&F.anim!=='sleep'){
    const y0=A.chin[1]-1,y1=Math.min(A.chest[1]+5,71);
    for(let y=y0;y<=y1;y++){
      const t=(y-y0)/(y1-y0||1),cx=Math.round(A.chin[0]*(1-t)+A.chest[0]*t);
      const hw=Math.round(12*(1-t)+3*t)+(tooth(y-y0)===2?1:0);
      let src=-1;
      for(let x=cx-3;x<=cx+3;x++){const i=y*W+x;if(F.part[i]===P.BODY&&K.isFur(F.role[i])){src=i;break}}
      if(src<0)continue;
      for(let x=cx-hw;x<=cx+hw;x++){
        const i=y*W+x;
        if(F.part[i]===P.BODY&&K.isFur(F.role[i])&&F.feat[i]!==FT.PAW){F.role[i]=R.F;F.feat[i]=FT.CHEST}
        else T.put(x,y,src,P.BODY,R.F,FT.CHEST);
      }
    }
  }
  if(side){
    // Bờm nghiêng theo cổ họng/ngực; mỗi hàng lấy ô mép để giữ hoa văn bám thân.
    const y0=A.throat[1]-1,y1=Math.min(A.chest[1]+8,71);
    for(let y=y0;y<=y1;y++){
      let src=-1;
      for(let x=A.neck[0];x<W;x++){
        const i=y*W+x;
        if(F.part[i]===P.BODY&&K.isFur(F.role[i]))src=i;
      }
      if(src<0)continue;
      const t=Math.max(0,Math.min(1,(F.v[src]-A0.throat[1]+1)/(A0.chest[1]+9-A0.throat[1])));
      const d=Math.round(2+4*(1-t))+tooth(F.v[src]);
      for(let k=1;k<=d;k++)T.put(src%W+k,y,src,P.BODY,R.F,FT.CHEST);
    }
  }
  T.done();
}

// Chỉ nhấc cụm mũi trên cùng; giữ lưỡi và bàn chân đang liếm ở phía dưới.
function nose(F,FX,dx,dy){
  const A=F.A,side=F.view==='side',ey=side?A.eye[1]:Math.round((A.eyeL[1]+A.eyeR[1])/2),pix=[];
  let top=99,sx=0,sy=0;
  for(let i=0;i<F.role.length;i++)if(F.part[i]===P.HEAD&&F.feat[i]===FT.NOSE&&K.isPink(F.role[i])){
    const y=(i/F.W)|0;if(y>=ey&&y<=ey+8)top=Math.min(top,y);
  }
  for(let y=top;y<=top+2;y++)for(let x=0;x<F.W;x++){
    const i=y*F.W+x;
    if(F.part[i]!==P.HEAD||F.feat[i]!==FT.NOSE||!K.isPink(F.role[i]))continue;
    pix.push([x+dx,y+dy,F.role[i],P.HEAD,FT.NOSE,F.u[i],F.v[i]]);sx+=x+dx;sy+=y+dy;
    F.role[i]=R.F;F.feat[i]=FT.MUZ;
  }
  if(pix.length)A.nose=[Math.round(sx/pix.length),Math.round(sy/pix.length)];
  return ()=>pix.forEach(a=>FX.put(F,...a));
}

function flatFront(F,s,FX){
  const T=fluff(F,FX);cheeks(F,T,false,true);T.done();
  const draw=nose(F,FX,0,-2);draw();
}
function flatSide(F,s,FX){
  const A=F.A,W=F.W,T=fluff(F,FX);cheeks(F,T,true,true);T.done();
  const draw=nose(F,FX,-3,-2),edge=new Int16Array(F.H).fill(-1);
  // Rút 3 ô mõm, chuyển tiếp 1–2 ô ở hàng trên để không tạo bậc vuông trước mắt.
  for(let y=A.eye[1]-2;y<=A.chin[1];y++){
    let right=-1;
    for(let x=A.eye[0]+3;x<W;x++){const i=y*W+x;if(F.part[i]===P.HEAD&&K.isFur(F.role[i]))right=x}
    if(right<0)continue;
    edge[y]=right-Math.min(3,y-A.eye[1]+3);
  }
  FX.erase(F,(i,x,y)=>F.part[i]===P.HEAD&&edge[y]>=0&&x>edge[y]&&F.feat[i]!==FT.EYEL);
  draw();
  FX.seal(F,(i,x,y)=>F.part[i]===P.HEAD&&edge[y]>=0&&x>=edge[y]-2);
}

K.trait('fur',{front:fur,side:fur});
K.trait('flat',{front:flatFront,side:flatSide});
})();
