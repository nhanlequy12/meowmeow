#!/usr/bin/env node
/* Soát toàn bộ mèo: mọi giống × mọi màu lông (+ màu hiếm), mọi mèo trang phục × mọi dạng, mọi dáng.
   node tools/catcheck.js [--md]   -> in bảng mèo × dáng (đạt / chưa đạt). Mã thoát 1 nếu còn mèo chưa đạt. */
const fs=require('fs'),path=require('path'),ROOT=path.dirname(__dirname);
const files=['data','sprites','art','catkit'].map(f=>path.join(ROOT,'js',f+'.js'));
fs.readdirSync(path.join(ROOT,'js','cats')).filter(f=>f.endsWith('.js')).sort().forEach(f=>files.push(path.join(ROOT,'js','cats',f)));
(0,eval)(files.map(f=>fs.readFileSync(f,'utf8')).join('\n;')+'\n;globalThis.__G={Art,look,CatKit,BREEDS,VARIANTS,COATS,RARES}');
const {Art,look,CatKit:K,BREEDS,VARIANTS,COATS,RARES}=globalThis.__G;
const AN={sit:4,sleep:4,groom:6,stand:1,walk:8,run:8,jump:8},md=process.argv.includes('--md');
function check(key){ // trả {anim: '' | 'lý do'}
  const s=look(key),miss=K.missing(s),r={};
  for(const a in AN){let why='';
    if(miss.length)why='thiếu '+miss.join(', ');
    else for(let i=0;i<AN[a]&&!why;i++){const pose=a==='stand'?'stand':a+i+'s';let b;
      try{b=K.render(s,pose)}catch(e){why='lỗi: '+e.message;break}
      if(!b){why='không dựng được';break}
      const W=b.W;if(W!==(['sit','sleep','groom'].includes(a)?72:100)||b.H!==80){why='sai lưới';break}
      for(let y=78;y<80&&!why;y++)for(let x=0;x<W;x++){const c=b.c[y*W+x];if(c&&(c.length<4||c[3]===255)){why='ô dưới đường đáy (khung '+i+')';break}}
      if(!why&&W===100){const F=K.frameOf(s,pose),B=K.baseFrame(K.shapeOf(s),a,a==='stand'?0:i);let d=0;
        for(let y=74;y<=75;y++)for(let x=0;x<100;x++){const p=K.isLeg(F.part[y*100+x])&&F.role[y*100+x]>1,q=K.isLeg(B.part[y*100+x])&&B.role[y*100+x]>1;if(p!==q)d++}
        if(d)why='bàn chân lệch khung Xoài (khung '+i+')'}}
    r[a]=why}
  return r}
const rows=[];let bad=0,total=0,looks=0;
const add=(sp,keys)=>{const agg={};let n=0;keys.forEach(k=>{looks++;const r=check(k);for(const a in r)if(r[a]&&!agg[a])agg[a]=k+': '+r[a];n++});
  total++;const ok=!Object.keys(agg).length;if(!ok)bad++;rows.push({id:sp.id,n:sp.n,r:sp.r,keys:n,agg,ok})};
BREEDS.forEach(b=>add(b,b.coats.map(c=>b.id+'~'+c).concat(b.noRare?[]:RARES.map(r=>b.id+'~'+r.id))));
VARIANTS.forEach(v=>add(v,(v.coats?v.coats.map(c=>v.id+'~'+c):[v.id]).concat(v.id==='v_goku'?['v_goku~gkSSJ']:v.id==='v_gojo'?['v_gojo!open']:[])));
if(md){console.log('| Mèo | Sao | Số ngoại hình | '+Object.keys(AN).join(' | ')+' |\n|---|---|---|'+Object.keys(AN).map(()=>'---').join('|')+'|');
  rows.forEach(r=>console.log('| '+r.n+' (`'+r.id+'`) | '+r.r+'★ | '+r.keys+' | '+Object.keys(AN).map(a=>r.agg[a]?'chưa':'đạt').join(' | ')+' |'))}
else rows.filter(r=>!r.ok).forEach(r=>console.log('CHƯA '+r.id+': '+[...new Set(Object.values(r.agg))].slice(0,2).join(' ; ')));
console.log('\n'+(total-bad)+' / '+total+' mèo đạt mọi dáng ở mọi màu lông ('+looks+' ngoại hình đã soát)');
process.exit(bad?1:0);
