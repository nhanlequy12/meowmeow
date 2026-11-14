"use strict";
/* ============ KIỂM THỬ THĂM NHÀ BẠN VÀ BẢNG XẾP HẠNG (server.py, js/friend.js) ============
   node tools/friendtest.js [cổng]   (mặc định 8772)
   Khởi động server.py tạm với thư mục dữ liệu riêng (thư mục tạm của hệ thống, xóa khi xong), tạo ba hồ sơ (A, B cấp 3, C cấp 1),
   đồng bộ bản lưu dựng bằng đúng mã game, rồi gọi các API friend/* và admin/friend: quyền, thưởng một lần mỗi ngày, quà chủ nhà
   (có trần mỗi ngày), quà đi qua hàng lệnh chờ và trọng tài nhận bản lưu đã cộng quà, bảng xếp hạng, đổi tem, không lộ dữ liệu riêng,
   giới hạn tốc độ, khóa cũ sau khi chuyển máy. Cần Python 3 và Node 18+. */
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const ROOT=path.join(__dirname,'..'),PORT=+process.argv[2]||8772,BASE='http://127.0.0.1:'+PORT+'/api/';
globalThis.localStorage={getItem(){return null},setItem(){},removeItem(){}};
(0,eval)(['js/data.js','js/wx-data.js','js/pw-data.js','js/med-data.js','js/garden-data.js','js/game.js'].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n;\n')+
  '\n;globalThis.G={fresh,newCat,getS:()=>S,SP};');

let pass=0,fail=0;
const ok=(c,m)=>{if(c){pass++;console.log('  ✓ '+m)}else{fail++;console.log('  ✗ '+m)}};
const call=async(ep,body,hdr)=>{const r=await fetch(BASE+ep,{method:body?'POST':'GET',headers:Object.assign({'Content-Type':'application/json'},hdr||{}),body:body?JSON.stringify(body):undefined});
  let j={};try{j=await r.json()}catch(e){}return {code:r.status,j}};
// bản lưu cấp lv có n mèo (bé đầu tiên là sp5 nếu có), đã xong hướng dẫn tân thủ
function mkSave(lv,cats){
  G.fresh();const S=G.getS();S.level=lv;S.tut={done:1,got:{},hints:{all:1}};
  cats.forEach(([sp,star])=>{const c=G.newCat(G.SP[sp],star);c.room='living';S.cats.push(c);S.seen[sp]=1});
  S.rooms.bedroom={bowlAt:0};S.items.push({iid:S.nid++,fid:'box',room:'bedroom',x:200,y:150,flip:false,broken:false});
  return JSON.parse(JSON.stringify(S));
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'meoxu-fr-'));
  const srv=cp.spawn('python',[path.join(ROOT,'server.py'),String(PORT),'127.0.0.1'],{env:Object.assign({},process.env,{MEOXU_DATA:dir,PYTHONIOENCODING:'utf-8'}),stdio:['ignore','pipe','pipe']});
  let out='';srv.stdout.on('data',d=>out+=d);srv.stderr.on('data',d=>out+=d);
  try{
    for(let i=0;i<60;i++){try{const r=await call('ping');if(r.j.app==='meoxu')break}catch(e){}await sleep(250)}
    await sleep(800);   // trọng tài khởi động
    const AK=fs.readFileSync(path.join(dir,'admin_key.txt'),'utf8').trim(),ADM={'X-Admin-Key':AK};
    const P={};
    for(const [k,nm] of [['A','Anh'],['B','Bình'],['C','Chi']]){const r=await call('join',{name:nm});P[k]=Object.assign({cn:0},r.j)}
    const sv={A:mkSave(3,[['khaomanee',5],['muop',1]]),B:mkSave(4,[['muop',1],['vang',1],['trang',2]]),C:mkSave(1,[['muop',1]])};
    {const d=new Date();sv.A.ct={d:d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(),th:'x',e:{u:[],b:77,at:Date.now(),nm:[]}}}   // A đã gửi bài Cuộc thi mèo hôm nay (js/contest.js)
    const sync=async(k,save)=>{const r=await call('sync',{id:P[k].id,tok:P[k].tok,cn:P[k].cn,save:save?JSON.stringify(save):undefined});return r};
    console.log('1. Hồ sơ và bản lưu đầu tiên');
    for(const k of ['A','B','C']){const r=await sync(k,sv[k]);ok(r.code===200&&!r.j.restore&&!r.j.fresh,k+' được nhận bản lưu cấp '+sv[k].level+(r.j.why?' ('+r.j.why+')':''))}
    const fr=(k,ep,o)=>call('friend/'+ep,Object.assign({id:P[k].id,tok:P[k].tok},o||{}));

    console.log('2. Quyền');
    let r=await fr('C','list');ok(r.code===403&&r.j.err==='lv'&&r.j.need===3,'C cấp 1 bị chặn (cần cấp 3)');
    r=await call('friend/list',{id:P.A.id,tok:'sai'});ok(r.code===403,'sai khóa người chơi: 403');
    r=await call('friend/list',{id:'000000000000',tok:'x'});ok(r.code===403,'hồ sơ không có: 403');
    r=await call('friend/visit',{id:P.A.id,tok:P.B.tok,host:P.B.id});ok(r.code===403,'dùng khóa của người khác: 403');

    console.log('3. Danh sách');
    r=await fr('A','list');const L=r.j.players||[];
    ok(r.code===200&&L.some(p=>p.id===P.B.id)&&!L.some(p=>p.id===P.A.id),'A thấy B, không thấy chính mình');
    ok(L.some(p=>p.id===P.C.id),'người chơi cấp thấp vẫn có trong danh sách để được thăm');
    const raw=JSON.stringify(r.j);ok(![P.B.tok,P.C.tok,'"save"','"ip"','"tok"','"cmds"','"log"'].some(s=>raw.includes(s)),'không lộ khóa, bản lưu, IP, lệnh, nhật ký');
    const pb=L.find(p=>p.id===P.B.id);ok(pb&&pb.lv===4&&pb.ncat===3&&pb.vis===false,'số liệu của B đúng (cấp 4, 3 mèo, chưa ghé)');
    ok(r.j.guest===30,'khách cấp 3 được 30 xu mỗi nhà');

    console.log('4. Thăm nhà');
    r=await fr('A','visit',{host:P.A.id});ok(r.code===400,'không tự thăm nhà mình');
    r=await fr('A','visit',{host:'ffffffffffff'});ok(r.code===404,'nhà không có: 404');
    r=await fr('A','visit',{host:P.B.id});const H=r.j.home||{};
    ok(r.code===200&&r.j.rew&&r.j.rew.xu===30&&r.j.rew.stamp===1,'lần đầu hôm nay: +30 xu, 1 tem');
    ok(H.rooms&&H.rooms.includes('living')&&H.rooms.includes('bedroom')&&H.cats.length===3&&H.items.length>=2,'nhà B đủ phòng, mèo, nội thất để vẽ');
    const hr=JSON.stringify(H);ok(!/"coins"|"tickets"|"tok"|"save"|"traits"|"full"|"rq"/.test(hr),'phần nhà không có xu, vé, khóa, thuộc tính, chỉ số');
    r=await fr('A','visit',{host:P.B.id});ok(r.code===200&&r.j.rew===null&&r.j.home,'thăm lại cùng ngày: xem được, không thưởng');
    r=await fr('A','list');ok(r.j.players.find(p=>p.id===P.B.id).vis===true&&r.j.stamps.total===1,'danh sách ghi đã ghé, sổ có 1 tem');

    console.log('5. Quà đi qua hàng lệnh chờ, trọng tài nhận');
    r=await sync('A');const ca=(r.j.cmds||[]).filter(c=>c.src==='fr');
    ok(ca.length===1&&ca[0].type==='coins'&&ca[0].amt===30,'A có lệnh +30 xu trong hàng chờ');
    r=await sync('B');const cb=(r.j.cmds||[]).filter(c=>c.src==='fr');
    ok(cb.length===1&&cb[0].amt===10+3*4,'chủ nhà B (cấp 4) có lệnh +22 xu');
    const apply=async(k,cmds)=>{const s=sv[k];cmds.forEach(c=>{if(c.type==='coins')s.coins+=c.amt;if(c.type==='tickets')s.tickets+=c.amt;P[k].cn=Math.max(P[k].cn,c.n)});s.nid++;
      const q=await sync(k,s);return q};
    r=await apply('A',ca);ok(r.code===200&&!r.j.restore&&!r.j.fresh&&!(r.j.cmds||[]).length,'A cộng 30 xu: trọng tài nhận, hàng chờ trống');
    r=await apply('B',cb);ok(r.code===200&&!r.j.restore&&!(r.j.cmds||[]).length,'B cộng 22 xu: trọng tài nhận');
    const sA=sv.A.coins;sv.A.coins+=50000;sv.A.nid++;r=await sync('A',sv.A);ok(!!r.j.restore,'đối chứng: tự cộng 50.000 xu không có lệnh thì bị từ chối');sv.A.coins=sA;

    console.log('6. Trần quà chủ nhà mỗi ngày');
    for(let i=0;i<10;i++){await call('admin/friend',{id:P.A.id,op:'reset'},ADM);await fr('A','visit',{host:P.B.id})}
    r=await sync('B');ok((r.j.cmds||[]).filter(c=>c.src==='fr').length===7,'B chỉ nhận thêm 7 lượt có xu (tổng 8 lượt mỗi ngày)');
    r=await fr('B','list');ok(r.j.host.today===8&&r.j.host.n===11&&r.j.host.who.length>=1,'B thấy 11 lượt khách, hôm nay 8 lượt có xu');
    r=await sync('A');ok((r.j.cmds||[]).filter(c=>c.src==='fr').length===10,'A có 10 lệnh +xu (mỗi lần đặt lại ngày thăm của quản trị)');
    await apply('A',r.j.cmds);await apply('B',(await sync('B')).j.cmds);

    console.log('7. Bảng xếp hạng');
    r=await fr('B','board');const bd=r.j.boards||{};
    ok(r.code===200&&bd.lv&&bd.seen&&bd.n5&&bd.ach,'có bốn bảng: cấp, loài, 5★, thành tựu');
    ok(bd.lv.top[0].id===P.B.id&&bd.lv.top[0].v===4,'B cấp 4 đứng đầu bảng cấp');
    ok(bd.n5.top[0].id===P.A.id&&bd.n5.top[0].v===1,'A có 1 bé 5★ đứng đầu bảng 5★');
    ok(bd.lv.me===1&&bd.lv.n===3,'B biết mình đứng thứ 1/3');
    ok(bd.cup&&bd.cup.n===1&&bd.cup.top[0].id===P.A.id&&bd.cup.top[0].v===77,'bảng Cuộc thi hôm nay chỉ có người đã gửi bài (A, 77 điểm)');
    ok(!JSON.stringify(r.j).includes(P.A.tok),'bảng không có khóa');

    console.log('8. Đổi tem');
    r=await fr('B','swap',{kind:'mix'});ok(r.code===400,'B chưa có tem: không đổi được');
    r=await fr('A','swap',{kind:'set'});ok(r.code===400,'A có 11 tem của 1 nhà: không đổi được bộ 5 nhà');
    r=await fr('A','swap',{kind:'mix'});ok(r.code===200&&r.j.rew.ve===1&&r.j.stamps.total===6,'A đổi 5 tem bất kỳ: +1 vé, còn 6 tem');
    r=await fr('A','swap',{kind:'xyz'});ok(r.code===400,'kiểu đổi lạ bị từ chối');
    r=await call('admin/friend',{id:P.A.id,op:'stamps'},{'X-Admin-Key':'sai'});ok(r.code===403,'admin/friend cần mã quản trị');
    await call('admin/friend',{id:P.A.id,op:'stamps'},ADM);
    r=await fr('A','swap',{kind:'set'});ok(r.code===200&&r.j.rew.ve===2&&r.j.rew.xu===100,'có tem 5 nhà: đổi bộ được 2 vé + 100 xu');
    r=await sync('A');const cs=(r.j.cmds||[]).filter(c=>c.src==='fr');
    ok(cs.filter(c=>c.type==='tickets').reduce((a,c)=>a+c.amt,0)===3&&cs.filter(c=>c.type==='coins').reduce((a,c)=>a+c.amt,0)===150,'hàng chờ có 3 vé, 150 xu');
    r=await apply('A',cs);ok(r.code===200&&!r.j.restore,'trọng tài nhận bản lưu cộng vé và xu đổi tem');

    console.log('9. Chuyển máy và giới hạn tốc độ');
    const x=await call('xfer/new',{id:P.B.id,tok:P.B.tok}),u=await call('xfer/use',{code:x.j.code});
    r=await call('friend/list',{id:P.B.id,tok:P.B.tok});ok(r.code===409,'khóa cũ của máy đã chuyển: 409');
    P.B.tok=u.j.tok;r=await fr('B','list');ok(r.code===200,'khóa mới dùng được');
    let n429=0;for(let i=0;i<70;i++){const q=await fr('C','list');if(q.code===429)n429++}
    ok(n429>0,'gọi quá 60 lần mỗi phút thì bị 429');
    r=await call('friend/nope',{id:P.A.id,tok:P.A.tok});ok(r.code===404,'API lạ: 404');
  }catch(e){fail++;console.log('LỖI: '+(e.stack||e))}
  finally{
    srv.kill();await sleep(300);try{fs.rmSync(dir,{recursive:true,force:true})}catch(e){}
    if(fail)console.log(out.split('\n').slice(-20).join('\n'));
    console.log('\n'+pass+' đạt, '+fail+' hỏng');process.exit(fail?1:0);
  }
})();
