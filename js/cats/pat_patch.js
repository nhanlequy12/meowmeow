"use strict";
(()=>{
const K=CatKit,{P}=K,{blob,marble}=K.U;

// Mảng lớn theo toạ độ nghỉ; giữ bóng mép, bỏ vằn của Xoài.
K.pattern('cow',ctx=>{
  if(ctx.mark)ctx.lv=0;
  const {u,v,part,A0,side}=ctx,h=A0.head;
  if(part===P.TAIL)return ctx.c2;
  if(part===P.EAR)return u>h[0]?ctx.c2:ctx.c;
  if(part===P.HEAD){
    if(blob(u/2,v/2,(h[0]+12)/2,(h[1]-10)/2,7,7)||
      (!side&&blob(u/2,v/2,(h[0]-16)/2,(h[1]-15)/2,4.6,4.2)))return ctx.c2;
  }
  if(part===P.BODY){
    const b=side?A0.hip:A0.body;
    if(blob(u/2,v/2,(b[0]-(side?0:12))/2,(b[1]+(side?6:-3))/2,side?8:4.6,side?9:6))return ctx.c2;
  }
  return ctx.c;
});

// Hai tai hai màu, đuôi tối; thân giữ khoảng trắng giữa hai mảng.
K.pattern('calico',ctx=>{
  if(ctx.mark)ctx.lv=0;
  const {u,v,part,A0,side}=ctx,h=A0.head;
  if(part===P.TAIL)return ctx.c3;
  if(part===P.EAR)return u<h[0]?ctx.c2:ctx.c3;
  if(part===P.HEAD){
    if(blob(u/2,v/2,(h[0]-14)/2,(h[1]-9)/2,7,7))return ctx.c2;
    if(blob(u/2,v/2,(h[0]+14)/2,(h[1]-12)/2,7,7))return ctx.c3;
  }
  if(part===P.BODY){
    const b=side?A0.hip:A0.body;
    if(blob(u/2,v/2,(b[0]+(side?0:12))/2,(b[1]+(side?7:-5))/2,side?7:4.6,6))return ctx.c2;
    const f=side?A0.chest:b;
    if(blob(u/2,v/2,(f[0]-(side?9:13))/2,(f[1]+(side?-4:8))/2,side?7:4.2,side?8:4))return ctx.c3;
  }
  return ctx.c;
});

// Loang hai lớp, cùng tỉ lệ hạt với bộ vẽ cũ, không trộn thêm màu.
K.pattern('tortie',ctx=>{
  if(ctx.mark)ctx.lv=0;
  return marble(ctx.u/2,ctx.v/2)<.47?ctx.c2:ctx.c;
});

// Van chỉ có màu trên đỉnh đầu, tai và toàn bộ đuôi.
K.pattern('van',ctx=>{
  if(ctx.mark)ctx.lv=0;
  const {u,v,part,A0}=ctx;
  if(part===P.TAIL)return ctx.c2;
  if(part===P.EAR||(part===P.HEAD&&v<A0.crown[1]+9+Math.sin(u*.45)*1.2))return ctx.c2;
  return ctx.c;
});
})();
