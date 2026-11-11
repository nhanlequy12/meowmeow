#!/usr/bin/env node
/* Ghi lại danh sách thẻ <script> của các module mèo (js/cats/*.js) vào index.html và preview/index.html,
   giữa hai dòng đánh dấu <!-- cats:begin --> và <!-- cats:end -->. Chạy sau khi thêm/bớt file trong js/cats:  node tools/mkmods.js */
const fs=require('fs'),path=require('path'),ROOT=path.dirname(__dirname);
const files=fs.readdirSync(path.join(ROOT,'js','cats')).filter(f=>f.endsWith('.js')).sort((a,b)=>(a==='core.js'?-1:b==='core.js'?1:a<b?-1:1));
[['index.html','js/cats/'],['preview/index.html','../js/cats/']].forEach(([f,pre])=>{
  const p=path.join(ROOT,f);let t=fs.readFileSync(p,'utf8');const a=t.indexOf('<!-- cats:begin -->'),b=t.indexOf('<!-- cats:end -->');
  if(a<0||b<0){console.error('thiếu dòng đánh dấu trong',f);process.exit(1)}
  t=t.slice(0,a)+'<!-- cats:begin -->\n'+files.map(x=>'<script src="'+pre+x+'"></script>').join('\n')+'\n'+t.slice(b);fs.writeFileSync(p,t)});
console.log('đã ghi',files.length,'module mèo');
