#!/usr/bin/env node
/* Đo vòng "quay gacha rồi phóng sinh" (2026-11-13): quay bằng xu, giữ bé 5★ (hoặc từ 4★), phóng sinh hết các bé còn lại.
   Chạy: node tools/gachaloop.js. In số xu hoàn trung bình mỗi lượt và giá ròng của một bé được giữ lại, so với khi không phóng sinh. */
const fs=require('fs'),path=require('path'),R=path.join(__dirname,'..','js')+'/';
globalThis.localStorage={getItem(){return null},setItem(){},removeItem(){}};
(0,eval)(['data.js','game.js'].map(f=>fs.readFileSync(R+f,'utf8')).join('\n;')+';save=()=>{};globalThis.G={get S(){return S},fresh,gachaRoll,rehome,releaseGift,newCat,SP,STAR,GACHA_COST,setNotify(f){notify=f}}');
const G=globalThis.G;G.setNotify(()=>{});
function run(N,keep){
  G.fresh();const S=G.S;const base=G.newCat(G.SP.muop,1);base.room='living';S.cats.push(base);
  S.coins=1e9;S.tickets=0;let pulls=0,ref=0,tk=0,got=0,byStar={1:0,2:0,3:0,4:0,5:0},refStar={1:0,2:0,3:0,4:0,5:0};
  for(let i=0;i<N;i++){
    const c0=S.coins,t0=S.tickets;const c=G.gachaRoll(false);pulls++;if(!c||c.err)throw new Error('gacha '+JSON.stringify(c));
    const cat=c.cat||c;byStar[cat.star]++;
    if(cat.star>=keep){got++;continue}
    const a=S.coins,b=S.tickets,r=G.rehome(cat.uid);if(!r)throw new Error('rehome');ref+=S.coins-a;tk+=S.tickets-b;refStar[cat.star]+=S.coins-a;
  }
  return {pulls,ref,tk,got,byStar,refStar};
}
for(const keep of [5,4]){
  const r=run(200000,keep),cost=r.pulls*G.GACHA_COST,net=cost-r.ref-r.tk*100;
  console.log('Giữ từ '+keep+'★: '+r.pulls+' lượt, hoàn trung bình '+(r.ref/r.pulls).toFixed(1)+' xu + '+(r.tk/r.pulls).toFixed(3)+' vé mỗi lượt;',
    'tốn ròng '+(net/r.pulls).toFixed(1)+' xu mỗi lượt; '+(r.got/r.pulls*100).toFixed(2)+'% lượt ra bé giữ lại; mỗi bé giữ lại tốn ròng '+Math.round(net/r.got)+' xu',
    '(không phóng sinh: '+Math.round(cost/r.got)+' xu)');
  console.log('  tỉ lệ sao:',Object.entries(r.byStar).map(([k,v])=>k+'★ '+(v/r.pulls*100).toFixed(2)+'%').join(', '));
}
console.log('Tiền phóng sinh theo sao (STAR[n].sell):',G.STAR.map((s,i)=>s&&s.sell!=null?i+'★ '+s.sell:null).filter(Boolean).join(', ')+'; 5★ thêm 1 vé');
