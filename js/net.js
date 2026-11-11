/* ============ NHIỀU NGƯỜI CHƠI (chỉ hoạt động khi game được mở qua server.py) ============
   Mỗi người chơi có một hồ sơ trên máy chủ (tên + khóa riêng, lưu ở localStorage khóa meoxu_player).
   Cứ 30 giây game gửi bản lưu lên máy chủ; máy chủ trả về các lệnh quản trị viên đã gửi (tặng xu, vé, mèo, thông báo, đặt lại).
   Bảng Admin khi chạy qua máy chủ thì phải nhập mã quản trị, và có thêm mục "Người chơi" để theo dõi và quản lý.
   Mở game bằng file:// hoặc máy chủ tĩnh thường thì NET.on = false và mọi thứ như cũ. */
const NET={on:false,pl:null,adm:'',admOk:false,busy:false,okAt:0};
const PKEY='meoxu_player',AKEY='meoxu_admkey';
const api=(ep,body,adm)=>fetch('api/'+ep,{method:body?'POST':'GET',cache:'no-store',
  headers:Object.assign(body?{'Content-Type':'application/json'}:{},adm?{'X-Admin-Key':NET.adm||''}:{}),body:body?JSON.stringify(body):undefined})
  .then(r=>r.json().catch(()=>({})).then(j=>{if(!r.ok)throw Object.assign(new Error(j.err||('Lỗi '+r.status)),{code:r.status});return j}));
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lsSet=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}};

/* ---------- người chơi ---------- */
function netInit(){
  api('ping').then(j=>{
    if(!j||j.app!=='meoxu')return;
    NET.on=true;
    try{NET.pl=JSON.parse(lsGet(PKEY))}catch(e){NET.pl=null}
    NET.adm=lsGet(AKEY)||'';
    if(NET.adm)api('admin/check',null,1).then(()=>{NET.admOk=true}).catch(()=>{NET.adm='';lsSet(AKEY,null)});
    if(NET.pl&&NET.pl.id)netSync();else setTimeout(netAskName,700);
    setInterval(netSync,30000);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')netSync()});
  }).catch(()=>{});
}
function netAskName(){
  if($('modal').style.display==='flex'||$('gz').className||(typeof TUT!=='undefined'&&TUT.active())){setTimeout(netAskName,3000);return} // đang bận hộp thoại khác, đang quay gacha hoặc đang hướng dẫn tân thủ: hỏi sau
  modal('<h3>👋 Chào mừng tới Mèo Xu</h3><div class="dim">Game đang chạy trên máy chủ chung. Đặt một cái tên để quản trị viên nhận ra bạn (đổi sau được, nhờ quản trị viên).</div>'+
    '<div class="row" style="margin-top:8px"><input id="npname" maxlength="20" placeholder="Tên của bạn" style="flex:1" onkeydown="if(event.key===\'Enter\')netJoin()"><button class="sm on" onclick="netJoin()">Vào chơi</button></div><div id="nperr" class="dim" style="color:var(--bad)"></div>',true);
  setTimeout(()=>{const i=$('npname');if(i)i.focus()},50);
}
function netJoin(){
  const name=($('npname').value||'').trim();if(!name){$('nperr').textContent='Hãy nhập một cái tên.';return}
  api('join',{name}).then(j=>{NET.pl={id:j.id,tok:j.tok,name:j.name};lsSet(PKEY,JSON.stringify(NET.pl));closeModal();toast('Xin chào '+j.name+'! Bản lưu của bạn sẽ được sao lên máy chủ.',{icon:'👋',title:'Đã vào máy chủ'});netSync()})
    .catch(e=>{$('nperr').textContent='Không vào được: '+e.message});
}
function netSync(){
  if(!NET.on||!NET.pl||NET.busy)return;
  NET.busy=true;save();
  api('sync',{id:NET.pl.id,tok:NET.pl.tok,cn:S.cn||0,save:JSON.stringify(S),plan:typeof ntfSyncPlan==='function'?ntfSyncPlan():[]}).then(j=>{
    NET.busy=false;NET.okAt=Date.now();
    if(j.name&&j.name!==NET.pl.name){NET.pl.name=j.name;lsSet(PKEY,JSON.stringify(NET.pl))}
    const todo=(j.cmds||[]).filter(c=>c.n>(S.cn||0)).sort((a,b)=>a.n-b.n);
    if(!todo.length)return;
    todo.forEach(c=>{try{netApply(c)}catch(e){}S.cn=c.n});
    save();render();setTimeout(netSync,400); // báo ngay cho máy chủ là đã nhận, để lệnh không bị gửi lại
  }).catch(e=>{NET.busy=false;if(e.code===404){NET.pl=null;lsSet(PKEY,null);setTimeout(netAskName,500)}}); // hồ sơ bị xóa trên máy chủ: hỏi tên lại, bản lưu vẫn giữ
}
// áp dụng một lệnh của quản trị viên lên bản lưu đang chơi
function netApply(c){
  const T={icon:'🎁',title:'Quản trị viên',ms:7000},nf=n=>Math.abs(n).toLocaleString('vi-VN');
  if(c.type==='coins'){S.coins=clamp(S.coins+c.amt,0,MAXC);toast(c.amt>0?'Bạn được tặng '+nf(c.amt)+' xu':'Bạn bị trừ '+nf(c.amt)+' xu',T)}
  else if(c.type==='tickets'){S.tickets=Math.max(0,S.tickets+c.amt);toast(c.amt>0?'Bạn được tặng '+nf(c.amt)+' vé gacha':'Bạn bị trừ '+nf(c.amt)+' vé gacha',T)}
  else if(c.type==='cat'){
    const sp=SP[c.sp];if(!sp)return;
    const coat=sp.coats&&(sp.coats.includes(c.coat)||(RARE[c.coat]&&!sp.noRare))?c.coat:undefined,star=c.star||(RARE[coat]?4:sp.r),cat=newCat(sp,star,coat);
    cat.room=freeRoom();S.cats.push(cat);markSeen(cat);syncEnts();toast('Bạn được tặng '+sp.n+' '+star+'★, tên tạm là '+cat.name,T);
  }
  else if(c.type==='msg')toast(c.text,{icon:'📢',title:'Thông báo từ quản trị viên',ms:10000});
  else if(c.type==='reset'){fresh();cur='living';camX=0;ents=[];syncEnts();toast('Dữ liệu của bạn đã được quản trị viên đặt lại.',{icon:'🧹',title:'Quản trị viên',ms:9000})}
}

/* ---------- quản trị viên ---------- */
function netAdminLogin(msg){
  modal('<h3>🔐 Mã quản trị</h3><div class="dim">Game đang chạy trên máy chủ chung nên bảng Admin chỉ mở cho quản trị viên. Mã được in ra ở cửa sổ chạy <b>server.py</b> (và lưu trong <b>data/admin_key.txt</b>).</div>'+
    '<div class="row" style="margin-top:8px"><input id="nakey" type="password" autocomplete="off" placeholder="Mã quản trị" style="flex:1" onkeydown="if(event.key===\'Enter\')netAdminTry()"><button class="sm on" onclick="netAdminTry()">Mở</button></div>'+
    '<div id="naerr" class="dim" style="color:var(--bad)">'+(msg||'')+'</div>');
  setTimeout(()=>{const i=$('nakey');if(i)i.focus()},50);
}
function netAdminTry(){
  NET.adm=($('nakey').value||'').trim();
  api('admin/check',null,1).then(()=>{NET.admOk=true;lsSet(AKEY,NET.adm);openAdmin()}).catch(e=>{NET.adm='';$('naerr').textContent=e.code===403?'Sai mã quản trị.':'Không kết nối được máy chủ: '+e.message});
}
function netAdminOut(){NET.adm='';NET.admOk=false;lsSet(AKEY,null);closeModal();toast('Đã đăng xuất quản trị trên máy này',{icon:'🔐',title:'Admin'})}
// ô thêm vào đầu bảng Admin
function netAdminBox(){
  if(!NET.on)return '';
  return '<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>👥 Người chơi trên máy chủ</b><div class="row wrap"><button class="sm on" onclick="netPlayers()">Theo dõi và quản lý</button><button class="sm" onclick="netGiftAll()">🎁 Tặng quà / thông báo cho tất cả</button><button class="sm" onclick="netAdminOut()">Đăng xuất quản trị</button></div>'+
    '<div class="dim">'+(NET.pl?'Bạn đang chơi với tên <b>'+esc(NET.pl.name)+'</b>. ':'')+'Các nút bên dưới chỉ tác động lên bản lưu của chính máy này.</div></div>';
}
const nfmt=n=>(+n||0).toLocaleString('vi-VN');
const nago=(t,now)=>{const s=Math.max(0,now-t);return s<90?'vừa xong':s<3600?Math.round(s/60)+' phút trước':s<86400?Math.round(s/3600)+' giờ trước':Math.round(s/86400)+' ngày trước'};
const ndur=s=>s<3600?Math.round(s/60)+' phút':(s/3600).toFixed(1).replace('.',',')+' giờ';
const nday=t=>{const d=new Date(t*1000),p=n=>String(n).padStart(2,'0');return p(d.getDate())+'/'+p(d.getMonth()+1)+' '+p(d.getHours())+':'+p(d.getMinutes())};
const NSEL='font:inherit;color:var(--ink);background:var(--panel);border:2px solid var(--line);border-radius:10px;padding:6px;min-width:0;flex:1';
const nerr=e=>{if(e.code===403){NET.admOk=false;netAdminLogin('Mã quản trị không còn đúng, hãy nhập lại.')}else toast('Máy chủ: '+e.message,{type:'warn',title:'Lỗi'})};
let netSort='last';
function netPlayers(sort){
  if(sort)netSort=sort;
  api('admin/players',null,1).then(j=>{
    const ps=j.players.slice(),key={last:p=>-(p.last||0),coins:p=>-(p.sum.coins||0),level:p=>-(p.sum.level||0),cats:p=>-(p.sum.ncat||0),name:p=>0}[netSort];
    ps.sort((a,b)=>netSort==='name'?a.name.localeCompare(b.name,'vi'):key(a)-key(b));
    const on=ps.filter(p=>p.online).length,tot=k=>ps.reduce((a,p)=>a+((p.sum||{})[k]||0),0);
    const row=p=>{const s=p.sum||{},st=s.stars||[0,0,0,0,0];
      return '<div class="card tap" style="flex-direction:column;align-items:stretch;gap:2px;cursor:pointer" onclick="netPlayer(\''+p.id+'\')">'+
        '<div class="row"><b style="flex:1">'+(p.online?'🟢':'⚪')+' '+esc(p.name)+(NET.pl&&NET.pl.id===p.id?' <span class="dim">(bạn)</span>':'')+'</b>'+(p.warn?'<span style="color:var(--bad);font-weight:800">⚠ '+p.warn+'</span>':'')+(p.pending?'<span class="dim">⏳ '+p.pending+' lệnh chờ</span>':'')+'</div>'+
        (p.sum&&p.sum.level?'<div>Cấp '+s.level+' · 🪙 '+nfmt(s.coins)+' · 🎟 '+nfmt(s.tickets)+' · 🐱 '+s.ncat+' (5★: '+st[4]+', 4★: '+st[3]+', màu hiếm: '+s.rare+') · 🏠 '+s.rooms+' phòng</div>':'<div class="dim">Chưa gửi bản lưu nào</div>')+
        '<div class="dim">'+(p.online?'Đang chơi':'Lần cuối '+nago(p.last,j.now))+' · đã chơi '+ndur(p.play||0)+' · tham gia '+nday(p.created)+'</div></div>'};
    const sb=(k,t)=>'<button class="sm'+(netSort===k?' on':'')+'" onclick="netPlayers(\''+k+'\')">'+t+'</button>';
    modal('<h3>👥 Người chơi <span class="dim">· '+ps.length+' người, '+on+' đang chơi</span></h3>'+
      '<div class="dim">Tổng cộng: 🪙 '+nfmt(tot('coins'))+' xu · 🐱 '+nfmt(tot('ncat'))+' mèo. ⚠ là số cảnh báo trong nhật ký (xu tăng bất thường, bật xu vô hạn, bản lưu bị lùi).</div>'+
      '<div class="row wrap" style="margin:6px 0">'+sb('last','Mới chơi')+sb('coins','Nhiều xu')+sb('level','Cấp cao')+sb('cats','Nhiều mèo')+sb('name','Theo tên')+'<button class="sm" onclick="netPlayers()">↻ Tải lại</button></div>'+
      (ps.length?ps.map(row).join(''):'<div class="dim">Chưa có người chơi nào vào máy chủ.</div>')+
      '<div class="row" style="justify-content:center;margin-top:6px"><button class="sm" onclick="netGiftAll()">🎁 Tặng / thông báo cho tất cả</button><button class="sm" onclick="openAdmin()">← Bảng Admin</button></div>');
  }).catch(nerr);
}
// các ô hành động dùng chung cho một người chơi hoặc cho tất cả (tg là id người chơi hoặc 'all')
function netActs(tg){
  const og=g=>'<optgroup label="'+g[1]+'">'+(g[0]==='breed'?BREEDS:VARIANTS.filter(v=>v.g===g[0])).slice().sort((a,b)=>b.r-a.r).map(x=>'<option value="'+x.id+'">'+x.r+'★ '+esc(x.n)+'</option>').join('')+'</optgroup>';
  const box=(t,h)=>'<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>'+t+'</b>'+h+'</div>',q="'"+tg+"'";
  return box('🪙 Xu và vé <span class="dim">(số âm là trừ)</span>','<div class="row"><input id="ncoins" type="number" value="1000" style="flex:1"><button class="sm on" onclick="netCmd('+q+',\'coins\')">Tặng xu</button></div><div class="row"><input id="ntick" type="number" value="1" style="flex:1"><button class="sm on" onclick="netCmd('+q+',\'tickets\')">Tặng vé</button></div>')+
    box('🐱 Tặng mèo','<div class="row"><select id="nsp" onchange="admCoats(\'nsp\',\'nct\')" style="'+NSEL+'">'+GROUPS.filter(g=>g[0]!=='rare').map(og).join('')+'</select></div><div class="row"><select id="nst" style="'+NSEL+'"><option value="0">sao mặc định</option>'+[1,2,3,4,5].map(n=>'<option value="'+n+'">'+n+'★</option>').join('')+'</select><select id="nct" style="'+NSEL+'"></select><button class="sm on" onclick="netCmd('+q+',\'cat\')">Tặng</button></div>')+
    box('📢 Gửi thông báo','<div class="row"><input id="nmsg" maxlength="200" placeholder="Nội dung hiện trên màn hình người chơi" style="flex:1"><button class="sm on" onclick="netCmd('+q+',\'msg\')">Gửi</button></div>');
}
function netCmd(tg,type){
  const cmd={type};
  if(type==='coins')cmd.n=Math.round(+$('ncoins').value||0);
  else if(type==='tickets')cmd.n=Math.round(+$('ntick').value||0);
  else if(type==='cat'){cmd.sp=$('nsp').value;cmd.star=+$('nst').value||0;cmd.coat=$('nct').value}
  else if(type==='msg')cmd.text=$('nmsg').value;
  else if(type==='reset'&&!confirm('Đặt lại toàn bộ dữ liệu của người chơi này? Không hoàn tác được.'))return;
  if(tg==='all'&&!confirm('Gửi cho TẤT CẢ người chơi?'))return;
  api('admin/cmd',{ids:tg==='all'?'all':[tg],cmd},1).then(j=>{toast('Đã xếp lệnh cho '+j.n+' người chơi. Lệnh tới nơi ở lần đồng bộ kế tiếp (trong 30 giây nếu họ đang chơi).',{icon:'🛠',title:'Admin'});if(tg!=='all')netPlayer(tg)}).catch(nerr);
}
function netGiftAll(){
  modal('<h3>🎁 Gửi cho tất cả người chơi</h3><div class="dim">Người đang chơi nhận trong vòng 30 giây; người vắng mặt nhận khi mở lại game.</div>'+netActs('all')+
    '<div class="row" style="justify-content:center"><button class="sm" onclick="netPlayers()">← Danh sách</button></div>');
  admCoats('nsp','nct');
}
function netPlayer(id){
  api('admin/player?id='+id,null,1).then(j=>{
    const p=j.player,s=p.sum||{},st=s.stars||[0,0,0,0,0],cats=(s.cats||[]).slice().sort((a,b)=>(b.star||0)-(a.star||0));
    const cn=c=>{const sp=SP[c.sp],ct=ALLCOAT[c.coat];return '<span class="tag" style="display:inline-block;margin:1px 2px;padding:1px 6px;border-radius:8px;background:var(--panel);border:1px solid var(--line)">'+(c.star||'?')+'★ '+esc(sp?sp.n:c.sp)+(RARE[c.coat]?' ✨':ct&&(ct.jewel||ct.form)?' 💎':'')+' <span class="dim">'+esc(c.name)+'</span></span>'};
    const lg=(p.log||[]).slice().reverse().map(e=>'<div style="'+(e.w?'color:var(--bad);font-weight:700':'')+'"><span class="dim">'+nday(e.t)+'</span> '+(e.w?'⚠ ':'')+esc(e.m)+'</div>').join('');
    const box=(t,h)=>'<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>'+t+'</b>'+h+'</div>';
    modal('<h3>'+(p.online?'🟢':'⚪')+' '+esc(p.name)+' <span class="dim">· '+(p.online?'đang chơi':'lần cuối '+nago(p.last,j.now))+'</span></h3>'+
      box('Tổng quan',(s.level?'<div>Cấp '+s.level+' ('+s.xp+' kinh nghiệm) · 🪙 '+nfmt(s.coins)+' · 🎟 '+nfmt(s.tickets)+'</div><div>🐱 '+s.ncat+' mèo: '+st.map((n,i)=>(i+1)+'★ '+n).join(' · ')+' · màu hiếm '+s.rare+'</div><div>🏠 '+s.rooms+' phòng · 🪑 '+s.items+' nội thất · 🎒 '+s.trips+' chuyến đang đi · đã phóng sinh '+s.released+' · bảo hiểm gacha '+s.pity+'/'+PITY+(s.inf?' · <b style="color:var(--bad)">đang bật xu vô hạn</b>':'')+'</div>':'<div class="dim">Chưa gửi bản lưu nào.</div>')+
        '<div class="dim">Đã chơi '+ndur(p.play||0)+' · tham gia '+nday(p.created)+' · địa chỉ '+esc(p.ip||'?')+(p.pending?' · ⏳ '+p.pending+' lệnh đang chờ':'')+'</div>')+
      netActs(id)+
      box('Hồ sơ','<div class="row"><input id="nname" maxlength="20" value="'+esc(p.name)+'" style="flex:1"><button class="sm" onclick="netRename(\''+id+'\')">Đổi tên</button></div><div class="row wrap">'+(p.pending?'<button class="sm" onclick="netPost(\'uncmd\',\''+id+'\')">Hủy '+p.pending+' lệnh đang chờ</button>':'')+'<button class="sm bad" onclick="netCmd(\''+id+'\',\'reset\')">Đặt lại dữ liệu</button><button class="sm bad" onclick="netDelete(\''+id+'\')">Xóa khỏi máy chủ</button></div>')+
      box('Đàn mèo ('+cats.length+')','<div style="max-height:150px;overflow:auto;line-height:1.7">'+(cats.length?cats.map(cn).join(''):'<span class="dim">Chưa có dữ liệu</span>')+'</div>')+
      box('Nhật ký','<div style="max-height:190px;overflow:auto;font-size:13px">'+(lg||'<span class="dim">Chưa có gì</span>')+'</div>')+
      '<div class="row" style="justify-content:center"><button class="sm" onclick="netPlayer(\''+id+'\')">↻ Tải lại</button><button class="sm" onclick="netPlayers()">← Danh sách</button></div>');
    admCoats('nsp','nct');
  }).catch(nerr);
}
const netPost=(ep,id,extra)=>api('admin/'+ep,Object.assign({id},extra||{}),1).then(()=>netPlayer(id)).catch(nerr);
function netRename(id){netPost('rename',id,{name:$('nname').value})}
function netDelete(id){if(confirm('Xóa người chơi này khỏi máy chủ? Bản lưu trên máy của họ vẫn còn; lần sau mở game họ sẽ được hỏi tên lại.'))api('admin/delete',{id},1).then(()=>netPlayers()).catch(nerr)}
netInit();
