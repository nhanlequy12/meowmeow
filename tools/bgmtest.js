"use strict";
/* Kiểm thử nhạc nền (chạy: node tools/bgmtest.js). Cần playwright-core và Chrome không giao diện (như các lần thử khác của dự án).
   Mở một trang trống, nạp riêng js/bgm.js với vài hàm giả của game (S, now, clamp, wxOpen, wxNow...), rồi:
   - kết xuất từng bản bằng OfflineAudioContext ở âm lượng mặc định và tối đa: không lỗi, không NaN, không im lặng, đỉnh 0,05–0,25;
   - kiểm bgmPick theo giờ và thời tiết. Thoát mã 1 nếu có phần hỏng. Chưa ai nghe thử bằng tai: kiểm thử này không nói nhạc hay hay dở. */
const fs=require('fs'),path=require('path'),http=require('http');
const R=path.join(__dirname,'..');
const PW=[process.env.PLAYWRIGHT_CORE,'playwright-core',path.join(process.env.APPDATA||'','npm/node_modules/openclaw/node_modules/playwright-core')].filter(Boolean);
let chromium=null;for(const p of PW){try{chromium=require(p).chromium;break}catch(e){}}
if(!chromium){console.log('Không tìm thấy playwright-core, bỏ qua.');process.exit(0)}
const findExe=()=>{const b=path.join(process.env.LOCALAPPDATA||'','ms-playwright');try{const d=fs.readdirSync(b).filter(x=>/^chromium_headless_shell-/.test(x)).sort().pop();if(d){const e=path.join(b,d,'chrome-headless-shell-win64','chrome-headless-shell.exe');if(fs.existsSync(e))return e}}catch(e){}return undefined};
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
const STUB=`window.S={set:{},level:5};const now=()=>Date.now(),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),$=id=>document.getElementById(id);
  window.WXT=null;function wxOpen(){return !!WXT}function wxNow(){return WXT}function save(){}function openSettings(){}function openAdmin(){}function admDone(){}function pwaCard(){return ''}`;
const srv=http.createServer((q,r)=>{const f=path.join(R,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(path.join(R,'js'))||!fs.existsSync(f)){r.writeHead(404);r.end();return}r.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8'});r.end(fs.readFileSync(f))});
srv.listen(0,'127.0.0.1',async()=>{
  const port=srv.address().port,br=await chromium.launch({executablePath:findExe()});
  try{
    const page=await br.newPage(),errs=[];page.on('pageerror',e=>errs.push(e.message));
    await page.setContent('<!doctype html><meta charset="utf-8"><div id="gz"></div><div id="mbox"></div><script>'+STUB+'</script><script src="http://127.0.0.1:'+port+'/js/bgm.js"></script>');
    await page.waitForFunction(()=>typeof bgmRender==='function');
    const R=await page.evaluate(async()=>{const out=[];
      for(const id of Object.keys(BGM_T))for(const vol of [.6,1]){
        const T=BGM_T[id],secs=Math.max(8,T.steps*T.dt+1),ctx=new OfflineAudioContext(1,Math.ceil(44100*secs),44100);
        let err=null;try{bgmRender(ctx,id,secs-.2,vol)}catch(e){err=e.message}
        const d=(await ctx.startRendering()).getChannelData(0);let pk=0,ss=0,nan=0,run=0,mx=0;
        for(let i=0;i<d.length;i++){const v=d[i];if(!isFinite(v))nan++;const a=Math.abs(v);if(a>pk)pk=a;ss+=v*v;if(i<d.length-44100){if(a<.002){run++;if(run>mx)mx=run}else run=0}}
        out.push({id,vol,n:T.n,err,loop:T.steps*T.dt,peak:pk,rms:Math.sqrt(ss/d.length),nan,sil:mx/44100});
      }return out});
    R.forEach(r=>ok('Bản '+r.id+' ('+r.n+'), âm lượng '+r.vol+': không lỗi, có tiếng, đỉnh 0,05–0,25',!r.err&&!r.nan&&r.rms>.003&&r.sil<2&&r.peak>=.05&&r.peak<=.25,
      'vòng '+r.loop.toFixed(1)+' giây, đỉnh '+r.peak.toFixed(3)+', RMS '+r.rms.toFixed(4)+', lặng dài nhất '+r.sil.toFixed(2)+' giây'+(r.err?', lỗi '+r.err:'')));
    ok('Có từ 4 tới 6 bản',R.length/2>=4&&R.length/2<=6,R.length/2);
    const P=await page.evaluate(()=>{const D0=Date.now,at=h=>{const d=new Date();d.setHours(h,10,0,0);return d.getTime()},W=(type,season)=>({type,season:{id:season||'spring'}});
      const pick=(h,w)=>{Date.now=()=>at(h);WXT=w||null;const r=bgmPick();Date.now=D0;WXT=null;return r};
      return {d10:pick(10),e18:pick(18),n23:pick(23),n3:pick(3),rain10:pick(10,W('drizzle')),storm23:pick(23,W('storm')),fog14:pick(14,W('fog')),snow10:pick(10,W('snow')),bliz2:pick(2,W('blizzard')),
        cold10:pick(10,W('cold')),winter10:pick(10,W('sunny','winter')),winter23:pick(23,W('sunny','winter')),ideal10:pick(10,W('ideal')),sunny10:pick(10,W('sunny','summer')),sunny18:pick(18,W('sunny','autumn'))}});
    const exp={d10:'day',e18:'eve',n23:'night',n3:'night',rain10:'rain',storm23:'rain',fog14:'rain',snow10:'snow',bliz2:'snow',cold10:'snow',winter10:'snow',winter23:'night',ideal10:'fest',sunny10:'day',sunny18:'eve'};
    Object.keys(exp).forEach(k=>ok('Chọn bản: '+k+' → '+exp[k],P[k]===exp[k],P[k]));
    const H=await page.evaluate(()=>{bgmHook(()=>'fest');const a=bgmPick();BGM_HOOKS.length=0;BGM.force='rain';const b=bgmPick();BGM.force=null;return [a,b]});
    ok('Tính năng khác chọn bản qua bgmHook',H[0]==='fest');ok('Admin ép bản',H[1]==='rain');
    ok('Mặc định tắt, chưa tạo AudioContext',await page.evaluate(()=>!S.set.bgm&&!BGM.ac));
    ok('Không lỗi JS',!errs.length,errs.join(' | '));
  }finally{await br.close();srv.close()}
  console.log(fail?'\n'+fail+' phần HỎNG':'\nTất cả đều ĐẠT');process.exit(fail?1:0);
});
