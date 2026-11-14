"use strict";
/* Xem trước phụ kiện đội (js/acc-art.js) ra PNG để soát bằng mắt. Không cần thư viện ngoài.
   node tools/accprev.js            → preview/acc/<phụ kiện>.png (mỗi phụ kiện: 5 giống × 9 dáng) và preview/acc/all.png (mọi phụ kiện, dáng ngồi và đi)
   node tools/accprev.js costumes   → preview/acc/costumes.png: mọi mèo trang phục và trang phục hiếm đeo mũ cói + khăn (soát danh sách ẩn)
   node tools/accprev.js <id> ...   → chỉ các phụ kiện đó
   Biến môi trường K=số điểm ảnh mỗi ô mịn (mặc định 3). */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const R=path.join(__dirname,'..');
globalThis.localStorage={getItem(){return null},setItem(){}};
const files=['js/data.js','js/sprites.js','js/art.js','js/catkit.js'];
fs.readdirSync(path.join(R,'js/cats')).filter(f=>f.endsWith('.js')).sort().forEach(f=>files.push('js/cats/'+f));
files.push('js/acc-data.js','js/acc-art.js');
(0,eval)(files.map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+'\n;globalThis.__G={Art,look,CatKit,ACCS,ACC,VARIANTS,BREEDS,COATS,FORMS:typeof FORMS!=="undefined"?FORMS:{},accHidden};');
const G=globalThis.__G,K=+process.env.K||3,OUT=path.join(R,'preview','acc');fs.mkdirSync(OUT,{recursive:true});
const BG=[196,179,154];
function png(w,h,img){const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;img.copy(raw,y*(w*4+1)+1,y*w*4,(y+1)*w*4)}
  const T=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;T[n]=c>>>0}
  const crc=b=>{let c=~0;for(const x of b)c=T[(c^x)&255]^(c>>>8);return(~c)>>>0};
  const ch=(t,b)=>{const l=Buffer.alloc(4);l.writeUInt32BE(b.length);const td=Buffer.concat([Buffer.from(t),b]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c])};
  const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ih),ch('IDAT',zlib.deflateSync(raw)),ch('IEND',Buffer.alloc(0))])}
// grid: mảng hàng, mỗi hàng là mảng {key,pose}; cột cố định rộng 100 ô mịn
function sheet(name,grid,label){
  const CW=100*K,RH=80*K,W=CW*Math.max(...grid.map(r=>r.length)),Hh=RH*grid.length,img=Buffer.alloc(W*Hh*4);
  for(let i=0;i<W*Hh;i++){img[i*4]=BG[0];img[i*4+1]=BG[1];img[i*4+2]=BG[2];img[i*4+3]=255}
  let err=0;
  grid.forEach((row,r)=>row.forEach((c,ci)=>{let b;try{b=G.Art.cat(G.look(c.key),c.pose)}catch(e){console.log('LỖI',c.key,c.pose,e.message);err++;return}
    if(!b){console.log('null',c.key,c.pose);err++;return}
    const d=b.rgba(),bw=b.W,ox=ci*CW+Math.floor((CW-bw*K)/2),oy=r*RH;
    // ô xen kẽ màu nền để thấy ranh giới
    if((r+ci)%2)for(let y=0;y<RH;y++)for(let x=0;x<CW;x++){const j=((oy+y)*W+ci*CW+x)*4;img[j]=188;img[j+1]=170;img[j+2]=146}
    for(let y=0;y<b.H;y++)for(let x=0;x<bw;x++){const i=(y*bw+x)*4;if(d[i+3]<10)continue;for(let yy=0;yy<K;yy++)for(let xx=0;xx<K;xx++){const j=((oy+y*K+yy)*W+ox+x*K+xx)*4;img[j]=d[i];img[j+1]=d[i+1];img[j+2]=d[i+2]}}}));
  fs.writeFileSync(path.join(OUT,name+'.png'),png(W,Hh,img));console.log('→ preview/acc/'+name+'.png',label||'',err?err+' lỗi':'');return err}
const BREEDS5=['muop','munchkin','persian','scottish','sphynx'];
const POSES=['sit','sitb','sleep1','groom2','groom4','stand','walk3','run6','leap0','land0'];
const arg=process.argv.slice(2);let errs=0;
if(arg[0]==='costumes'){
  const keys=[];G.VARIANTS.forEach(v=>{keys.push(v.id);if(v.coats)v.coats.forEach(ct=>{if((G.COATS[ct]||{}).form)keys.push(v.id+'~'+ct)})});
  G.BREEDS.filter(b=>b.r===5).forEach(b=>b.coats.forEach(ct=>{if((G.COATS[ct]||{}).form)keys.push(b.id+'~'+ct)}));
  const rows=[];for(let i=0;i<keys.length;i+=5)rows.push(keys.slice(i,i+5).flatMap(k=>[{key:k+'~@straw.scarf',pose:'sit'},{key:k+'~@straw.scarf',pose:'walk3'}]));
  errs+=sheet('costumes',rows,keys.length+' ngoại hình');
  keys.forEach(k=>{const s=G.look(k);const h=G.accHidden(s,'h'),n=G.accHidden(s,'n');if(h||n)console.log(k.padEnd(28),h?'ẩn đầu':'      ',n?'ẩn cổ':'')});
}else{
  const ids=arg.length?arg:G.ACCS.map(a=>a.id);
  ids.forEach(id=>{const a=G.ACC[id],sfx=a.sl==='h'?'~@'+id+'.':'~@.'+id;errs+=sheet(id,BREEDS5.map(b=>POSES.map(p=>({key:b+sfx,pose:p}))),a.n)});
  if(!arg.length){const rows=G.ACCS.map(a=>{const sfx=a.sl==='h'?'~@'+a.id+'.':'~@.'+a.id;return ['muop','persian','sphynx'].flatMap(b=>[{key:b+sfx,pose:'sit'},{key:b+sfx,pose:'walk1'}])});
    rows.push(['muop~@crown.pearls','munchkin~@party.bowtie','scottish~@beanie.scarf','sphynx~@shades.bandana','persian~@flowers.bell','muop~@straw.scarf'].map(k=>({key:k,pose:'sit'})));
    errs+=sheet('all',rows,'mọi phụ kiện')}
}
process.exit(errs?1:0);
