"use strict";
/* Xem bát ăn: node tools/mealprev-f.js [--context]. Không cần trình duyệt. */
const fs=require('fs'),path=require('path'),vm=require('vm'),zlib=require('zlib'),assert=require('assert');
const root=path.join(__dirname,'..');
const ctx=vm.createContext({console,localStorage:{getItem(){return null},setItem(){}},
  fillRatio:it=>it.ratio,mTop:(k,it)=>it.top});
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
vm.runInContext(['js/data.js','js/wx-data.js','js/pw-data.js','js/sprites.js','js/art.js'].map(read).join('\n;')+
  '\n;globalThis.preview={Art,FURN,FOODS};',ctx);
const {Art,FURN,FOODS}=ctx.preview;
const ids=Object.keys(FURN).filter(id=>FURN[id].bowl),levels=[0,1,2,4,6,8];
if(process.argv.includes('--context')){
  const source=read('js/art.js');
  for(const key of [...new Set(ids.map(id=>FURN[id].art||id))]){
    console.log(source.split('\n').find(line=>line.trimStart().startsWith(key+'(b')));
  }
  console.log(ids.map(id=>`${id}: ${FURN[id].w}x${FURN[id].h}, ${JSON.stringify(FURN[id].a||[])}`).join('\n'));
  process.exit(0);
}
const legacy=['','full','broken','a1','other'];
const before=new Map(ids.map(id=>[id,legacy.map(v=>Buffer.from(Art.furn(id,v).rgba()))]));
vm.runInContext(read('js/meal-art.js'),ctx);
for(const id of ids)legacy.forEach((v,i)=>assert.deepStrictEqual(Buffer.from(Art.furn(id,v).rgba()),before.get(id)[i],id+': '+v));
for(const [ratio,level] of [[0,0],[.0001,1],[.0624,1],[.1875,2],[.5,4],[1,8]]){
  assert.strictEqual(ctx.mealVarF({ratio,top:'salmon'}),`mf${level}:salmon`);
}
assert.strictEqual(ctx.mealVarF({ratio:0}),'mf0:kibble');
assert.strictEqual(ctx.mealVarF({broken:true}),'broken');
const put=Art.Buf.prototype.put;
let checked=0;
Art.Buf.prototype.put=function(x,y,c,r){
  if(r==='mf')assert(x>=this.q&&y>=this.q&&x<this.W-this.q&&y<this.H-this.q,'Thức ăn sát mép khung');
  return put.call(this,x,y,c,r);
};
try{
  for(const id of ids)for(const food of FOODS){
    const seen=new Set();let previous=-1;
    for(let level=0;level<=8;level++){
      const b=Art.furn(id,`mf${level}:${food.id}`),amount=b.r.filter(r=>r==='mf').length;
      assert(amount>previous,`${id}/${food.id}/${level}: lượng hình không tăng (${previous}, ${amount})`);
      previous=amount;
      seen.add(Buffer.from(b.rgba()).toString('hex'));checked++;
    }
    assert.strictEqual(seen.size,9,`${id}/${food.id}: mức đầy bị trùng`);
  }
}finally{Art.Buf.prototype.put=put}
/* Chữ nhỏ vẽ bằng ô vuông để ảnh tự có nhãn, không phụ thuộc phông máy. */
const glyph={
  A:['010','101','111','101','101'],B:['110','101','110','101','110'],C:['011','100','100','100','011'],
  D:['110','101','101','101','110'],E:['111','100','110','100','111'],F:['111','100','110','100','100'],
  G:['011','100','101','101','011'],H:['101','101','111','101','101'],I:['111','010','010','010','111'],
  K:['101','101','110','101','101'],L:['100','100','100','100','111'],M:['10001','11011','10101','10001','10001'],
  N:['1001','1101','1011','1001','1001'],O:['010','101','101','101','010'],P:['110','101','110','100','100'],
  R:['110','101','110','101','101'],S:['011','100','010','001','110'],T:['111','010','010','010','010'],
  U:['101','101','101','101','111'],W:['10001','10001','10101','11011','10001'],Y:['101','101','010','010','010'],
  '0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['110','001','010','100','111'],
  '4':['101','101','111','001','001'],'6':['011','100','111','101','111'],'8':['111','101','111','101','111']
};
const step=64,cellW=step*6,cellH=64,labelW=74,head=26,cols=4;
/* Sáu nấc cho mỗi món; đủ tám món trên từng loại bát. */
const sectionH=head+ids.length*cellH;
const W=labelW+cols*cellW,H=Math.ceil(FOODS.length/cols)*sectionH;
const pixels=Buffer.alloc(W*H*4);
const dot=(x,y,c)=>{if(x>=0&&y>=0&&x<W&&y<H){const p=(y*W+x)*4;pixels[p]=c[0];pixels[p+1]=c[1];pixels[p+2]=c[2];pixels[p+3]=255}};
for(let y=0;y<H;y++)for(let x=0;x<W;x++)dot(x,y,[244,233,214]);
function text(s,x,y,c=[105,73,58]){
  for(const ch of s.toUpperCase()){
    const g=glyph[ch];if(g)g.forEach((row,j)=>[...row].forEach((v,i)=>{if(v==='1')dot(x+i,y+j,c)}));
    x+=(g?g[0].length:2)+1;
  }
}
FOODS.forEach((food,index)=>{
  const col=index%cols,group=Math.floor(index/cols),x0=labelW+col*cellW,top=group*sectionH;
  text(food.id,x0+4,top+3);
  levels.forEach((n,j)=>text(String(n),x0+5+j*step,top+15));
  ids.forEach((id,row)=>{
    const y0=top+head+row*cellH;if(col===0)text(id,3,y0+24);
    for(let y=y0;y<y0+cellH-1;y++)for(let x=x0;x<x0+cellW-1;x++)dot(x,y,row%2?[226,213,192]:[236,223,203]);
    levels.forEach((n,j)=>{
      const b=Art.furn(id,`mf${n}:${food.id}`),rgba=b.rgba();
      const ox=x0+Math.floor((step-b.W)/2)+j*step,oy=y0+cellH-4-b.H;
      /* Giữ đúng từng ô mịn, không nội suy làm mờ hình. */
      for(let y=0;y<b.H;y++)for(let x=0;x<b.W;x++){
        const i=(y*b.W+x)*4;if(rgba[i+3])dot(ox+x,oy+y,[rgba[i],rgba[i+1],rgba[i+2]]);
      }
    });
  });
});
/* PNG RGBA, même encodeur sans dépendance que les autres aperçus. */
const crc=b=>{let n=0xffffffff;for(const x of b){n^=x;for(let j=0;j<8;j++)n=n&1?0xedb88320^(n>>>1):n>>>1}return (n^0xffffffff)>>>0};
const chunk=(type,data)=>{const t=Buffer.concat([Buffer.from(type),data]),h=Buffer.alloc(4),c=Buffer.alloc(4);h.writeUInt32BE(data.length);c.writeUInt32BE(crc(t));return Buffer.concat([h,t,c])};
const ih=Buffer.alloc(13);ih.writeUInt32BE(W);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=6;
const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++)pixels.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4);
const out=path.join(root,'preview/meal/food.png');fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
console.log(`OK: ${ids.length} bát, ${checked} biến thể; hình cũ giữ nguyên. preview/meal/food.png`);
