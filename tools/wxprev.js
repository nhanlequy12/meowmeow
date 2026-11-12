"use strict";
/* Xem trước hình thiết bị thời tiết và vật phẩm sinh tồn (js/furn/*.js) ra PNG để soát.
   node tools/wxprev.js js/furn/wx-01.js [id ...]   → preview/wx/wx-01.png (mỗi món vẽ khung thường, khung hoạt ảnh 'a1' và khung 'full' nếu có)
   node tools/wxprev.js all                         → preview/wx/all.png, mọi thiết bị và biểu tượng
   In ra món nào còn thiếu hình, món nào vẽ lỗi, món nào tô ra ngoài khung. */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const R=path.join(__dirname,'..');
globalThis.localStorage={getItem(){return null},setItem(){}};
const files=['js/data.js','js/wx-data.js','js/pw-data.js','js/sprites.js','js/art.js'];
(0,eval)(files.map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+'\n;globalThis.__G={Art,FURN,WXDEV,SUPPLY};');
const {Art,FURN,WXDEV,SUPPLY}=__G;globalThis.Art=Art;globalThis.FURN=FURN;
const arg=process.argv[2]||'all';
const furnFiles=arg==='all'?fs.readdirSync(path.join(R,'js/furn')).filter(f=>f.endsWith('.js')).map(f=>'js/furn/'+f):[arg];
furnFiles.forEach(f=>{try{(0,eval)(fs.readFileSync(path.join(R,f),'utf8'))}catch(e){console.log('LỖI nạp '+f+': '+e.message)}});
let ids=process.argv.slice(3);
if(!ids.length)ids=arg==='all'?WXDEV.map(f=>f.id).concat(SUPPLY.map(s=>'sp_'+s.id)):[...new Set((fs.readFileSync(path.join(R,arg),'utf8').match(/^\s{2,}(\w+)\(b,v,a\)/gm)||[]).map(s=>s.trim().split('(')[0]))];
const K=4,PAD=8,rows=[];
for(const id of ids){
  const f=FURN[id]||{},vs=['',...(f.anim?['a1']:[]),...(f.water?['full']:[])],row=[];
  if(!Art.hasFurn(id)){console.log('THIẾU hình: '+id);continue}
  for(const v of vs){try{const b=Art.furn(id,v);row.push({b,px:b.rgba(),v})}catch(e){console.log('LỖI vẽ '+id+(v?' ('+v+')':'')+': '+e.message)}}
  if(row.length)rows.push({id,row});
}
if(!rows.length){console.log('Không có hình nào để xuất.');process.exit(0)}
const f=K/2,W=Math.max(...rows.map(r=>r.row.reduce((a,o)=>a+o.b.W*f+PAD,PAD))),H=rows.reduce((a,r)=>a+Math.max(...r.row.map(o=>o.b.H*f))+PAD,PAD);
const img=Buffer.alloc(W*H*4);for(let i=0;i<W*H;i++){img[i*4]=196;img[i*4+1]=179;img[i*4+2]=154;img[i*4+3]=255}
let oy=PAD;
for(const r of rows){
  const rh=Math.max(...r.row.map(o=>o.b.H*f));let ox=PAD;
  for(const o of r.row){const b=o.b,d=o.px;let edge=0;
    for(let y=0;y<b.H;y++)for(let x=0;x<b.W;x++){const i=(y*b.W+x)*4;if(d[i+3]<10)continue;if(x===0||y===0||x===b.W-1)edge++;
      for(let yy=0;yy<f;yy++)for(let xx=0;xx<f;xx++){const X=ox+x*f+xx,Y=oy+rh-b.H*f+y*f+yy,j=(Y*W+X)*4;img[j]=d[i];img[j+1]=d[i+1];img[j+2]=d[i+2]}}
    if(edge>b.H)console.log('CHÚ Ý '+r.id+(o.v?' ('+o.v+')':'')+': hình chạm mép khung, có thể bị cắt mất phần viền');
    ox+=b.W*f+PAD}
  oy+=rh+PAD;
}
const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++){raw[y*(W*4+1)]=0;img.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4)}
const T=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;T[n]=c>>>0}
const crc=b=>{let r=0xffffffff;for(const x of b)r=T[(r^x)&255]^(r>>>8);return (r^0xffffffff)>>>0};
const ch=(ty,da)=>{const l=Buffer.alloc(4);l.writeUInt32BE(da.length);const td=Buffer.concat([Buffer.from(ty),da]),c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c])};
const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=6;
const out=path.join(R,'preview','wx',(arg==='all'?'all':path.basename(arg,'.js'))+'.png');fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ih),ch('IDAT',zlib.deflateSync(raw)),ch('IEND',Buffer.alloc(0))]));
console.log('Đã xuất '+rows.length+' món: '+path.relative(R,out));
