"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{mix,lt,vnoise}=K.U;
const COLORS=new WeakMap(),REFS=new WeakMap(),PAWS=new Map();

// Đệm màu và kích thước theo ngoại hình, mỏ neo nghỉ; không cấp mảng cho từng ô.
function colors(q){
  let c=COLORS.get(q.s);
  if(!c){c={rim:mix(q.c,q.c2,.42),chest:lt(q.c,.3)};COLORS.set(q.s,c)}
  return c;
}
function refs(q){
  const A=q.A0;let r=REFS.get(A);
  if(!r){
    const ey=q.side?A.eye[1]:(A.eyeL[1]+A.eyeR[1])/2;
    r={cx:q.side?(A.eye[0]+A.nose[0])/2:(A.eyeL[0]+A.eyeR[0])/2,
      cy:q.side?(ey+A.chin[1])/2:A.nose[1]+2,
      rx:q.side?A.nose[0]-A.eye[0]+4:(A.eyeR[0]-A.eyeL[0])*.72,
      ry:(A.chin[1]-ey)*(q.side?.79:.7),
      head:A.crown[1]+(ey-A.crown[1])*.72,
      back:q.side?A.back[1]+(A.belly[1]-A.back[1])*.58:A.chest[1]-1};
    REFS.set(A,r);
  }
  return r;
}

// Khung liếm 1–3 còn gán chân giơ là HEAD: lấy dấu bàn chân từ khung 4,
// căn theo nét viền chóp chân của từng khung, chỉ đổi màu các ô lông sẵn có.
function pawCap(F){
  const A=F.A,W=F.W;
  for(let y=A.chin[1]-8;y<A.chin[1]-3;y++){
    let x0=-1;
    for(let x=A.head[0]-9;x<A.head[0];x++){
      if(F.role[y*W+x]===1){if(x0<0)x0=x}
      else{if(x0>=0&&x-x0>=2)return [(x0+x-1)/2,y];x0=-1}
    }
  }
  return [A.head[0]-4,A.chin[1]-7];
}
function raisedPaw(q){
  const F=q.F;
  if(q.side||F.anim!=='groom'||F.i<1||F.i>4)return false;
  const key=F.shape+'|'+F.i;let m=PAWS.get(key);
  if(!m){
    const B=K.baseFrame(F.shape,'groom',4),T=K.baseFrame(F.shape,'groom',F.i),a=pawCap(B),b=pawCap(T);
    const dx=Math.round(b[0]-a[0]),dy=b[1]-a[1];m=new Uint8Array(F.W*F.H);
    for(let i=0;i<B.role.length;i++)if(B.part[i]===P.LEG&&B.feat[i]===FT.PAW){
      const x=i%B.W+dx,y=((i/B.W)|0)+dy;
      if(x>=0&&x<F.W&&y>=0&&y<F.H)m[y*F.W+x]=1;
    }
    PAWS.set(key,m);
  }
  return m[q.i]!==0;
}

// Điểm màu: tai, đuôi, cẳng chân và mặt nạ; giữ vùng trắng cho lõi tô sau.
K.pattern('point',q=>{
  if(q.mark)q.lv=0;
  if(raisedPaw(q)){q.feat=FT.PAW;return q.c2}
  const {u,v,part,feat,A0:A,s}=q;
  if(part===P.EAR||part===P.TAIL)return q.c2;
  if(K.isLeg(part)||feat===FT.PAW){
    if(!q.side||v>=A.footNH[1]-11)return q.c2;
    return v>=A.footNH[1]-13?colors(q).rim:q.c;
  }
  // Hai cẳng trước ở dáng ngồi thuộc vùng thân, bụng giữa vẫn sáng.
  if(!q.side&&part===P.BODY&&v>=A.pawL[1]-8&&Math.abs(u-A.body[0])>=3)return q.c2;
  if(part===P.HEAD){
    const r=refs(q),dx=(u-r.cx)/r.rx,dy=(v-r.cy)/r.ry,m=dx*dx+dy*dy;
    if(m<1.2){
      const ey=q.side?A.eye[1]:A.eyeL[1];
      const blaze=s.w>=2&&(q.side?u>=A.eye[0]+3&&v>=ey-4:
        v>=ey-4&&Math.abs(u-A.head[0])<=(v-ey+5)*.75);
      // Bicolor giữ chữ V và mõm trắng; mặt nạ thường phủ kín cả mõm.
      if(!blaze&&!(s.w>=1&&feat===FT.MUZ)){
        q.zone=false;
        if(feat===FT.MUZ)q.lv=Math.min(0,q.lv-2);
      }
      return m<1?q.c2:colors(q).rim;
    }
  }
  return feat===FT.CHEST?colors(q).chest:q.c;
});

// Khói: ngọn lông tối phủ từ trên xuống, ranh giới lượn theo tọa độ nghỉ.
K.pattern('smoke',q=>{
  if(q.mark)q.lv=0;
  const {part,u,v}=q;
  if(part===P.EAR||part===P.TAIL)return q.c2;
  if(part===P.HEAD||part===P.BODY){
    const r=refs(q),edge=part===P.HEAD?r.head:r.back;
    if(v<edge-2)return q.c2;
    if(v<edge+2&&v<edge+(vnoise(u/2,v/2,1.5)-.5)*3.2)return q.c2;
  }
  return q.c;
});
})();
