"use strict";
(()=>{
const K=CatKit,{P,FT}=K;
const RED=[224,72,60],REDG=[216,52,44],GOLD=[248,206,90],RIM=[196,139,38],
  SHINE=[255,239,166],CREAM=[255,241,192],PAD=[244,164,181],INK=[128,87,36],WAVE=[0,-2,0,2];

K.costume('v_maneki',{
  paint(ctx,s){
    if(s.ct!=='mkGold'||ctx.kind!=='fur')return;
    if(ctx.mark)ctx.lv=0;
    ctx.zone=false;
    const A=ctx.A0,dx=ctx.u-(ctx.side?A.belly[0]:A.body[0]),dy=ctx.v-(ctx.side?A.belly[1]-4:A.body[1]-1);
    if(ctx.part===P.BODY&&dx*dx/(ctx.side?144:81)+dy*dy/81<1)return CREAM;
    return ctx.c;
  },
  draw(G,s){
    const A=G.A,B=G.lag(1),gold=s.ct==='mkGold',sleep=G.F.anim==='sleep',C=G.layer(),
      neck=G.side?A.throat:A.neck,red=gold?REDG:RED;
    let bx,by,cx,cy;
    if(G.side){
      C.line(A.neck[0]+3,A.neck[1]+3,neck[0]+2,neck[1]+3,red,4);
      bx=neck[0]+2;by=neck[1]+6;
      cx=A.chest[0]-3;cy=A.chest[1]+5;
    }else if(sleep){
      // Khi ngủ, vòng cổ và đồng xu thu về gần bàn chân dưới má.
      C.line(A.chin[0]-14,A.chin[1]-7,A.chin[0]-9,A.chin[1]-1,red,3);
      bx=A.chin[0]-11;by=A.chin[1]-2;
      cx=A.pawL[0]-2;cy=A.pawL[1]-5;
    }else{
      C.line(neck[0]-11,neck[1]+1,neck[0]+10,neck[1]+1,red,3);
      bx=neck[0];by=neck[1]+4;
      cx=A.body[0];cy=A.body[1]+1;
    }
    C.stamp();
    // Chuông treo trễ một khung; đồng xu áp sát ngực theo thân.
    const oldNeck=G.side?B.throat:B.neck,bell=G.layer();
    bx+=Math.max(-1,Math.min(1,oldNeck[0]-neck[0]));
    bell.ell(bx,Math.min(73,by),2.7,2.7,GOLD).stamp({outline:INK});
    const detail=G.layer();detail.rect(bx-1,Math.min(73,by),2,1,INK);detail.set(bx-1,by-1,SHINE);detail.stamp({outline:false});
    const coin=G.layer(),rx=G.side?4:sleep?4:6,ry=G.side?6:sleep?4:7;
    cy=Math.min(70,cy);
    coin.ell(cx,cy,rx,ry,RIM).ell(cx,cy-1,rx-1,ry-1,GOLD).stamp();
    const mark=G.layer();
    mark.line(cx,cy-ry+3,cx,cy+ry-2,RIM,2);
    mark.line(cx-2,cy-2,cx+2,cy-2,RIM,1);
    mark.line(cx-2,cy+1,cx+2,cy+1,RIM,1);
    mark.line(cx-rx+2,cy-3,cx-rx+2,cy,SHINE,1);mark.stamp({outline:false});
    if(!G.side&&G.F.anim==='sit'){
      const po=K.poseFrame(G.F.pose),w=WAVE[po[1]],px=A.eyeR[0]+11+w/2,py=A.eyeR[1]+1+w,
        arm=G.layer(),fur=gold?K.U.hex(s.c):K.WHITE;
      arm.line(A.chest[0]+10,A.chest[1]+3,px,py+4,fur,7);
      arm.ell(px,py,4.5,6,fur).stamp();
      const pads=G.layer();pads.ell(px,py+1,2,2,PAD);
      pads.rect(px-3,py-3,2,2,PAD);pads.rect(px,py-4,2,2,PAD);pads.rect(px+2,py-2,2,2,PAD);pads.stamp({outline:false});
    }
    if(gold){
      const h=G.side?B.earN:B.earR,t=B.tailTip;
      G.spark(Math.min(G.W-4,h[0]+8),Math.max(4,h[1]+3),SHINE);
      G.spark(Math.max(4,t[0]-6),Math.min(69,t[1]+8),SHINE);
    }
  }
});
})();
