"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{mix,dk,fleck}=K.U;
const colors=new WeakMap();
// Đệm màu pha, không tạo mảng màu trong mỗi ô lông.
function palette(q){
  let p=colors.get(q.s);
  if(!p){p={tick:mix(q.c,q.c2,.5),crown:dk(q.c,.18),crownTick:mix(dk(q.c,.18),q.c2,.5)};colors.set(q.s,p)}
  return p;
}
const band=(t,period,width)=>Math.abs(t-period*Math.round(t/period))<width;
// Hai nét má né mắt và mõm, tính từ đầu ở tư thế nghỉ.
function cheek(q){
  const {u,v,A0:A}=q;
  if(q.side){const d=A.eye[0]-u;return d>=4&&d<=14&&(Math.abs(v-A.eye[1]-5+d*.22)<1||Math.abs(v-A.eye[1]-10+d*.12)<1)}
  const d=Math.abs(u-A.head[0]);
  return d>=13&&(Math.abs(v-A.nose[1]+2+(d-13)*.3)<1||Math.abs(v-A.nose[1]-4-(d-13)*.2)<1);
}
K.pattern('tiger',q=>{
  const {u,v,part,A0:A}=q;
  let stripe=!!q.mark;
  if(part===P.BODY){
    if(q.side){const h=v-A.back[1];stripe=stripe||(h<20&&band(u-A.hip[0]+h*.24+h*h*.012,9,Math.max(1,2.3-h*.055)))}
    else{const d=Math.abs(u-A.body[0]);stripe=stripe||(d>=8&&band(v-A.chest[1]-(d-8)*.5,6,Math.min(1.8,.8+(d-8)*.16)))}
  }else if(K.isLeg(part))stripe=stripe||band(v-A.chest[1]+u*.09,9,1.5);
  else if(part===P.TAIL)stripe=stripe||band(v-A.tailTip[1]+(u-A.tailTip[0])*.6,8,2);
  else if(part===P.HEAD)stripe=stripe||cheek(q);
  if(stripe){if(q.mark||q.lv>0)q.lv=0;return q.c2}
  return q.c;
});
K.pattern('ticked',q=>{
  if(q.mark)q.lv=0;                              // bỏ toàn bộ vằn gốc
  const {u,v,part,A0:A}=q,p=palette(q);
  if(part===P.TAIL){
    const dx=u-A.tailTip[0],dy=v-A.tailTip[1];
    if(q.feat===FT.TIP||dx*dx+dy*dy<49){q.lv=0;return q.c2}
  }
  if(part===P.HEAD&&cheek(q)){q.lv=0;return q.c2}
  const crown=part===P.EAR||(part===P.HEAD&&v<A.crown[1]+9);
  if(crown)return fleck(u/2,v/2,.15)?p.crownTick:p.crown;
  if(part===P.BODY&&fleck(u/2,v/2,.15))return p.tick;
  return q.c;
});
})();
