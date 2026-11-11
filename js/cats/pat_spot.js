"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hsh,vnoise,marble,bandC}=K.U;

// Đệm đốm so le: đường kính 3–5 ô mịn, không tính lại cho từng khung.
const SZ=128,spots=new Uint8Array(SZ*SZ),legspots=new Uint8Array(SZ*SZ);
for(let j=-1;j<20;j++)for(let i=-1;i<18;i++){
  if(hsh(i+7,j+3)>.84)continue;
  const cx=i*8+(j&1)*4+4+(hsh(i,j+11)-.5)*2,
    cy=j*7+3+(hsh(i+5,j)-.5)*2,rx=1.7+hsh(i+2,j+9)*.65,ry=1.5+hsh(i+9,j+2)*.6;
  for(let v=Math.max(0,Math.ceil(cy-ry));v<=Math.min(SZ-1,Math.floor(cy+ry));v++)
    for(let u=Math.max(0,Math.ceil(cx-rx));u<=Math.min(SZ-1,Math.floor(cx+rx));u++)
      {
        const d=((u-cx)/rx)**2+((v-cy)/ry)**2;
        if(d<=1)spots[v*SZ+u]=1;
        if(d<=.3)legspots[v*SZ+u]=1;
      }
}
const spot=(u,v,small)=>u>=0&&v>=0&&u<SZ&&v<SZ&&(small?legspots:spots)[v*SZ+u];

K.pattern('spot',ctx=>{
  if(ctx.mark)ctx.lv=0;
  const {u,v,part,A0}=ctx;
  // Khoang đuôi bám theo chiều dài ở tư thế nghỉ, kể cả đuôi duỗi.
  if(part===P.TAIL){
    ctx.zone=false;ctx.lv=Math.min(ctx.lv,1);
    const a=ctx.side?A0.tailBase:A0.tail;
    return bandC(v-a[1]+(u-a[0])*.2,8,3)?ctx.c2:ctx.c;
  }
  if(part===P.HEAD){
    const ey=ctx.side?A0.eye[1]:Math.min(A0.eyeL[1],A0.eyeR[1]);
    return v<ey-5&&spot(u,v)?ctx.c2:ctx.c;
  }
  // Chân có đốm nhỏ hơn; giữ nguyên ô bàn chân và bóng chân xa.
  if(K.isLeg(part))return spot(u,v,true)?ctx.c2:ctx.c;
  return part===P.BODY&&spot(u,v)?ctx.c2:ctx.c;
});

K.pattern('lykoi',ctx=>{
  if(ctx.mark)ctx.lv=0;
  ctx.zone=false;ctx.lv=Math.min(ctx.lv,1);
  const {u,v,part,A0}=ctx;
  if(part===P.HEAD&&ctx.feat!==FT.PAW){
    const ex=ctx.side?A0.eye[0]+3:A0.head[0],
      ey=ctx.side?A0.eye[1]:(A0.eyeL[1]+A0.eyeR[1])/2,
      rx=ctx.side?11:18;
    // Mặt trụi lông quanh mắt, sống mũi và mõm; tuyệt đối không tô trắng.
    if(ctx.feat===FT.MUZ||((u-ex)/rx)**2+((v-ey-4)/11)**2<=1){
      ctx.lv=Math.min(ctx.lv,0);return ctx.c3;
    }
  }
  return hsh(u+1,v+1)<.12+vnoise(u/2,v/2,2)*.28?ctx.c2:ctx.c;
});

// Xà cừ dùng ba màu đặc, mảng loang đủ lớn để đọc được ở cỡ trong game.
const PEARL=[[255,206,228],[206,244,224],[198,224,255]];
K.pattern('nacre',ctx=>{
  if(ctx.mark)ctx.lv=0;
  const n=marble(ctx.u*.575,ctx.v*.575);
  return n<.4?PEARL[0]:n>.6?PEARL[1]:Math.abs(n-.5)<.04?PEARL[2]:ctx.c;
});

K.pattern('sheen',ctx=>{
  if(ctx.mark)ctx.lv=0;
  // Không để mõm, ngực và chóp đuôi sáng thành mảng trắng trên lông sẫm.
  ctx.zone=false;ctx.lv=Math.min(ctx.lv,0);
  return ctx.part===P.EAR||bandC(ctx.u+2*ctx.v+9,18,2.2)?ctx.c2:ctx.c;
});
})();
