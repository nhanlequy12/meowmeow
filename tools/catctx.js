#!/usr/bin/env node
/* Gói ngữ cảnh GỌN cho một con mèo, thay cho việc đọc cả js/art.js, js/data.js, js/catkit.js (tốn hàng chục nghìn token).

   node tools/catctx.js <khoá> [<khoá>...] [--full] [--anchors]
     khoá: như tools/catprev.js (v_hero, v_goku~gkGod, siamese~bluePt...)
     --full     in trọn mã bộ phận trang phục cũ (mặc định mỗi bộ phận cắt ở 420 ký tự)
     --anchors  in thêm mỏ neo của MỌI khung (mặc định chỉ khung ngồi 0 và khung đứng)
   In ra: ngoại hình (màu, hoa văn, mắt, cờ), module còn thiếu, từng bộ phận trang phục cũ kèm đúng đoạn mã vẽ nó
   (nhìn thẳng P và nhìn ngang PS) và số dòng trong js/art.js, rồi mỏ neo CatKit. Không ghi file nào. */
const fs=require('fs'),path=require('path');
const ROOT=path.dirname(__dirname),argv=process.argv.slice(2),flag=n=>argv.includes('--'+n),keys=argv.filter(a=>!a.startsWith('--'));
if(!keys.length){console.log(fs.readFileSync(__filename,'utf8').split('*/')[0].slice(22));process.exit(0)}
const files=['data','sprites','art','catkit'].map(f=>path.join(ROOT,'js',f+'.js')),cdir=path.join(ROOT,'js','cats');
if(fs.existsSync(cdir))fs.readdirSync(cdir).filter(f=>f.endsWith('.js')).sort().forEach(f=>files.push(path.join(cdir,f)));
(0,eval)(files.map(f=>fs.readFileSync(f,'utf8')).join('\n;')+'\n;globalThis.__G={look,CatKit,COATS,BREEDS,VARIANTS}');
const {look,CatKit:K,COATS,BREEDS,VARIANTS}=globalThis.__G;

// tách từng mục của một bảng `const TÊN={ ... };` trong art.js: {tên: {line, src}}
const ART=fs.readFileSync(path.join(ROOT,'js','art.js'),'utf8').split('\n');
function table(name){const out={},a=ART.findIndex(l=>l.startsWith('const '+name+'={'));if(a<0)return out;let cur=null;
  for(let i=a+1;i<ART.length&&!/^};?\s*$/.test(ART[i]);i++){const m=/^\s{1,3}([A-Za-z_]\w*)\s*[:(]/.exec(ART[i]);
    if(m){cur=out[m[1]]={line:i+1,src:ART[i].trim()}}else if(cur&&!/^\s*\/\//.test(ART[i]))cur.src+=' '+ART[i].trim()}
  return out}
const P=table('P'),PS=table('PS'),COS=table('COS');
const cut=s=>flag('full')||s.length<=420?s:s.slice(0,420)+' …';
const show=(tag,t,n)=>t[n]?'    '+tag+' art.js:'+t[n].line+'  '+cut(t[n].src):'    '+tag+' (không có)';
const SEEN={};
const KEEP=['c','c2','c3','pat','eye','eye2','w','mit','ear','tail','fur','flat','short','hl','closed','gem','lash','rare','aura'];

for(const key of keys){
  let s;try{s=look(key)}catch(e){}
  if(!s){console.log('## '+key+': không có ngoại hình này\n');continue}
  const sp=BREEDS.concat(VARIANTS).find(x=>x.id===(s.bid||s.id))||{};
  console.log('## '+key+'  '+(s.n||sp.n||'')+'  '+(sp.r||'?')+'★'+(sp.coats?'  dạng/màu: '+sp.coats.join(' '):''));
  console.log('  ngoại hình: '+KEEP.filter(k=>s[k]!=null&&s[k]!==false&&s[k]!==0).map(k=>k+'='+(typeof s[k]==='object'?JSON.stringify(s[k]):s[k])).join('  '));
  if(sp.d)console.log('  mô tả: '+sp.d);
  const miss=K.missing(s);console.log('  module: '+(miss.length?'CÒN THIẾU '+miss.join(', '):'đã đủ')+'  · khung: '+K.shapeOf(s));
  if(Array.isArray(s.cos)&&s.cos.length){
    console.log('  trang phục cũ (thứ tự vẽ; tham số sau tên bộ phận):');
    s.cos.forEach(q=>{const n=q[0],args=q.slice(1);
      console.log('  - '+n+(args.length?'  '+JSON.stringify(args):''));
      if(n==='flag'||n==='aura')return;
      if(n==='old'){console.log(show('bộ vẽ tay COS',COS,args[0]));return}
      console.log(show('thẳng',P,n));console.log(show('ngang',PS,n))})
  }else if(typeof s.cos==='string'&&s.cos){console.log('  trang phục cũ: bộ vẽ tay "'+s.cos+'"');console.log(show('COS',COS,s.cos))}
  if(flag('anchors')){
    const AN={sit:4,sleep:4,groom:6,stand:1,walk:8,run:8,jump:8};
    for(const a in AN)for(let i=0;i<AN[a];i++){const F=K.frameOf(s,a==='stand'?'stand':a+i+'s');if(F)console.log('  neo '+a+i+': '+JSON.stringify(F.A))}
  }else['sit','stand'].forEach(p=>{const F=K.frameOf(s,p);if(!F)return;const j=JSON.stringify(F.A);console.log('  neo '+p+' ('+F.W+'x80): '+(SEEN[p]===j?'như con ở trên':j));SEEN[p]=j});
  console.log('');
}
