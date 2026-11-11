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

// Ba chùm má liền khối, hướng về gáy và xuống dưới; UV bám đầu nghỉ.
const SIDE_CHEEK=[[-18,1],[-20,5],[-21,8],[-24,10],[-20,10],[-22,14],[-17,13],[-18,17],[-11,15],[-7,11],[-10,5]];
let cheekStamp;
function sideCheeks(F,FX){
  const A0=K.baseFrame('std','stand',0).A.head;
  if(!cheekStamp){
    const B=K.cloneF(K.baseFrame('std','stand',0)),added=new Set();
    // Tạo dấu một lần ở tư thế nghỉ, không phụ thuộc thân co giãn.
    for(let y=1;y<=17;y++)for(let x=-24;x<=-7;x++){
      let inside=false;
      for(let i=0,j=SIDE_CHEEK.length-1;i<SIDE_CHEEK.length;j=i++){
        const a=SIDE_CHEEK[i],b=SIDE_CHEEK[j];
        if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
      }
      if(!inside)continue;
      const X=A0[0]+x,Y=A0[1]+y,i=Y*B.W+X;
      if(B.part[i]===P.HEAD&&B.role[i]>1)continue;
      FX.put(B,X,Y,R.D,P.HEAD,0,X,Y);added.add(i);
    }
    // Viền ngoài của dấu nghỉ cũng dịch cứng theo đầu.
    FX.seal(B,i=>added.has(i));
    cheekStamp=[];
    for(let i=0;i<B.role.length;i++)if(added.has(i)||(B.part[i]===P.HEAD&&B.role[i]===R.A)){
      const x=i%B.W,y=(i/B.W)|0;
      if(x>=A0[0]-26&&x<=A0[0]-7&&y>=A0[1]+1&&y<=A0[1]+19)
        cheekStamp.push([x-A0[0],y-A0[1],B.role[i],B.feat[i],B.u[i],B.v[i]]);
    }
  }
  for(const [x,y,r,f,u,v] of cheekStamp){
    const X=F.A.head[0]+x,Y=F.A.head[1]+y,i=FX.idx(F,X,Y);
    if(i>=0&&F.part[i]!==P.EAR&&F.part[i]!==P.TAIL&&!K.isLeg(F.part[i]))
      FX.put(F,X,Y,r,P.HEAD,f,u,v);
  }
}

function fur(F,s,FX){
  const A=F.A,side=F.view==='side',W=F.W,T=fluff(F,FX);
  const A0=K.baseFrame('std',side?'stand':'sit',0).A;
  if(side)sideCheeks(F,FX);else cheeks(F,T,false,false);
  // Mép lưng, bụng, mông: nhịp răng cưa lấy theo u/v nghỉ, không theo số khung.
  for(let i=0;i<W*F.H;i++){
    const p=F.part[i],r=F.role[i];
    if(!K.isFur(r))continue;
    const x=i%W,y=(i/W)|0;
    if(p===P.BODY&&y<(side?71:72)&&F.feat[i]!==FT.PAW){
      if(side&&x>=A.neck[0]-4&&y<A.throat[1])continue;
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
    const y0=Math.max(A.chin[1]+1,A.throat[1]-1),y1=Math.min(A.chest[1]+8,71);
    for(let y=y0;y<=y1;y++){
      let src=-1;
      for(let x=A.neck[0];x<W;x++){
        const i=y*W+x;
        if(F.part[i]===P.BODY&&K.isFur(F.role[i]))src=i;
      }
      if(src<0)continue;
      const t=Math.max(0,Math.min(1,(F.v[src]-A0.throat[1]+1)/(A0.chest[1]+9-A0.throat[1])));
      const d=Math.round(2+4*(1-t))+tooth(F.v[src]);
      for(let k=1;k<=d&&src%W+k<A.nose[0]-2;k++)T.put(src%W+k,y,src,P.BODY,R.F,FT.CHEST);
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
  const A=F.A,H=A.head,A0=K.baseFrame('std','stand',0).A.head;
  const edge=y=>H[0]+Math.round(14*Math.sqrt(Math.max(0,1-((y-H[1])/16)**2)));
  // Xoá nét mõm cũ rồi bo liên tục từ trán tới cằm, ngắn hơn 2–3 ô.
  for(let i=0;i<F.role.length;i++)if(F.part[i]===P.HEAD&&
      ((F.feat[i]===FT.NOSE&&K.isPink(F.role[i]))||F.feat[i]===FT.MOUTH)){
    F.role[i]=R.F;F.feat[i]=FT.MUZ;
  }
  FX.erase(F,(i,x,y)=>F.part[i]===P.HEAD&&y>=A.eye[1]-6&&y<=A.chin[1]&&x>edge(y));
  const put=(x,y,r,f)=>FX.put(F,x,y,r,P.HEAD,f,x-H[0]+A0[0],y-H[1]+A0[1]);
  const ny=A.eye[1]+2,nx=edge(ny)+1;
  put(nx-1,ny,R.J,FT.NOSE);put(nx,ny,R.H,FT.NOSE);
  const my=ny+4,mx=edge(my)-2;
  put(mx,my,R.A,FT.MOUTH);put(mx+1,my,R.A,FT.MOUTH);
  A.nose=[nx,ny];
  FX.seal(F,(i,x,y)=>F.part[i]===P.HEAD&&y>=A.eye[1]-7&&y<A.chin[1]&&x>=edge(y)-2);
}

K.trait('fur',{front:fur,side:fur});
K.trait('flat',{front:flatFront,side:flatSide});
})();
