/* ============ NHIỀU NGƯỜI CHƠI (chỉ hoạt động khi game được mở qua server.py) ============
   Mỗi người chơi có một hồ sơ trên máy chủ (tên + khóa riêng, lưu ở localStorage khóa meoxu_player).
   Cứ 30 giây game gửi bản lưu lên máy chủ; máy chủ trả về các lệnh quản trị viên đã gửi (tặng xu, vé, mèo, thông báo, đặt lại).
   Bảng Admin khi chạy qua máy chủ thì phải nhập mã quản trị, và có thêm mục "Người chơi" để theo dõi và quản lý.
   Mở game bằng file:// hoặc máy chủ tĩnh thường thì NET.on = false và mọi thứ như cũ. */
const NET={on:false,pl:null,adm:'',admOk:false,busy:false,okAt:0,rcAt:0,moved:null};
const PKEY='meoxu_player',AKEY='meoxu_admkey';
const api=(ep,body,adm)=>fetch('api/'+ep,{method:body?'POST':'GET',cache:'no-store',
  headers:Object.assign(body?{'Content-Type':'application/json'}:{},adm?{'X-Admin-Key':NET.adm||''}:{}),body:body?JSON.stringify(body):undefined})
  .then(r=>r.json().catch(()=>({})).then(j=>{if(!r.ok)throw Object.assign(new Error(j.err||('Lỗi '+r.status)),{code:r.status,j});return j}));
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lsSet=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}};

/* ---------- người chơi ---------- */
function netInit(){
  api('ping').then(j=>{
    if(!j||j.app!=='meoxu')return;
    NET.on=true;
    if(j.wx&&typeof wxReseed==='function')wxReseed(j.wx.seed,j.wx.t); // thời tiết chung của nhóm theo máy chủ
    try{NET.pl=JSON.parse(lsGet(PKEY))}catch(e){NET.pl=null}
    NET.adm=lsGet(AKEY)||'';
    if(NET.adm)api('admin/check',null,1).then(()=>{NET.admOk=true}).catch(()=>{NET.adm='';lsSet(AKEY,null)});
    if(NET.pl&&NET.pl.id){if(S.rq)RQ_ON=true;netSync()}
    else if(xfNew())setTimeout(xfWelcome,400);   // máy chưa có hồ sơ, ván còn mới: hỏi trước xem có mã chuyển máy không
    else setTimeout(netAskName,700); // bản lưu đã có hàng lượt gacha của máy chủ: dùng ngay, khỏi đợi lần đồng bộ đầu
    setInterval(netSync,30000);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')netSync()});
  }).catch(()=>{});
}
function netAskName(){
  if($('modal').style.display==='flex'||$('gz').className||(typeof TUT!=='undefined'&&TUT.active())){setTimeout(netAskName,3000);return} // đang bận hộp thoại khác, đang quay gacha hoặc đang hướng dẫn tân thủ: hỏi sau
  modal('<h3>👋 Chào mừng tới Mèo Xu</h3><div class="dim">Game đang chạy trên máy chủ chung. Đặt một cái tên để quản trị viên nhận ra bạn (đổi sau được, nhờ quản trị viên).</div>'+
    '<div class="row" style="margin-top:8px"><input id="npname" maxlength="20" placeholder="Tên của bạn" style="flex:1" onkeydown="if(event.key===\'Enter\')netJoin()"><button class="sm on" onclick="netJoin()">Vào chơi</button></div><div id="nperr" class="dim" style="color:var(--bad)"></div>'+
    '<div class="row" style="justify-content:center;margin-top:6px"><button class="sm" onclick="xferEnter()">🔑 Đã chơi trên máy khác? Nhập mã chuyển máy</button></div>',true);
  setTimeout(()=>{const i=$('npname');if(i)i.focus()},50);
}
function netJoin(){
  const name=($('npname').value||'').trim();if(!name){$('nperr').textContent='Hãy nhập một cái tên.';return}
  api('join',{name}).then(j=>{NET.pl={id:j.id,tok:j.tok,name:j.name};lsSet(PKEY,JSON.stringify(NET.pl));closeModal();toast('Xin chào '+j.name+'! Bản lưu của bạn sẽ được sao lên máy chủ.',{icon:'👋',title:'Đã vào máy chủ'});netSync()})
    .catch(e=>{$('nperr').textContent='Không vào được: '+e.message});
}
function netSync(){
  if(!NET.on||!NET.pl||NET.busy||NET.moved)return Promise.resolve(null);
  NET.busy=true;save();
  return api('sync',{id:NET.pl.id,tok:NET.pl.tok,cn:S.cn||0,save:JSON.stringify(S),plan:typeof ntfSyncPlan==='function'?ntfSyncPlan():[]},NET.admOk?1:0).then(j=>{
    NET.busy=false;NET.okAt=Date.now();NET.rcAt=j.rc||0;
    if(j.restore){netRestore(j.restore,j.why);return}   // máy chủ từ chối bản lưu: quay về bản hợp lệ cuối cùng trên máy chủ
    if(j.fresh){netRestore(null,j.why);return}          // bản lưu đầu tiên đã có sẵn tiến độ: chơi lại từ đầu
    if(j.rq){ // hàng lượt gacha máy chủ phát: bỏ các lượt máy chủ đã ghi nhận, giữ các lượt vừa dùng sau khi gửi
      S.rqUsed=(S.rqUsed||[]).filter(u=>u.q>j.ack);const used=new Set(S.rqUsed.map(u=>u.q));
      S.rq=j.rq.filter(r=>!used.has(r.q));if(!S.rqUsed.length){S.pity=j.pity%100;S.pity5=Math.floor(j.pity/100)}RQ_ON=true;save();
    }
    if(j.name&&j.name!==NET.pl.name){NET.pl.name=j.name;lsSet(PKEY,JSON.stringify(NET.pl))}
    const todo=(j.cmds||[]).filter(c=>c.n>(S.cn||0)).sort((a,b)=>a.n-b.n);
    if(!todo.length)return j;
    todo.forEach(c=>{try{netApply(c)}catch(e){}S.cn=c.n});
    save();render();setTimeout(netSync,400); // báo ngay cho máy chủ là đã nhận, để lệnh không bị gửi lại
    return j;
  }).catch(e=>{NET.busy=false;
    if(e.code===404){NET.pl=null;lsSet(PKEY,null);setTimeout(netAskName,500)} // hồ sơ bị xóa trên máy chủ: hỏi tên lại, bản lưu vẫn giữ
    else if(e.code===409)netMoved(e.j||{});                                  // hồ sơ đã chuyển sang máy khác
    return null});
}
// máy chủ không nhận bản lưu này (sửa dữ liệu, sửa mã game, hoặc bản trên máy cũ hơn): ghi bản hợp lệ của máy chủ (raw) rồi tải lại trang;
// raw rỗng là bắt đầu ván mới. SAVE_OFF chặn mọi lần ghi sau đó để trang đang đóng không ghi đè lại
function netRestore(raw,why){
  SAVE_OFF=true;try{raw?localStorage.setItem(KEY,raw):localStorage.removeItem(KEY)}catch(e){}
  modal('<h3>🛡 Máy chủ đã khôi phục bản lưu</h3><div class="dim">'+(raw?'Bản lưu trên máy này không khớp với máy chủ nên được trả về bản hợp lệ gần nhất.':'Bản lưu trên máy này không dùng được trên máy chủ nên bạn sẽ bắt đầu ván mới.')+(why?'<br>Lý do: '+esc(why):'')+'</div><div class="dim" style="margin-top:8px">Đang tải lại…</div>',true);
  setTimeout(()=>location.reload(),2600);
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
        '<div class="dim">Đã chơi '+ndur(p.play||0)+' · tham gia '+nday(p.created)+' · địa chỉ '+esc(p.ip||'?')+(p.pending?' · ⏳ '+p.pending+' lệnh đang chờ':'')+'</div>'+
        '<div class="dim">🔑 '+(p.rc?'Đã có mã khôi phục':'Chưa tạo mã khôi phục')+(p.mvat?' · chuyển máy gần nhất '+nday(p.mvat):'')+'</div>'+
        '<div class="dim">🛡 '+(p.trust?'<b>Đang tin tưởng: không kiểm tra chống gian lận</b>':'Chống gian lận đang bật')+(p.rej?' · <b style="color:var(--bad)">đã từ chối '+p.rej+' bản lưu</b> (xem nhật ký)':'')+'</div>')+
      netActs(id)+
      box('Hồ sơ','<div class="row"><input id="nname" maxlength="20" value="'+esc(p.name)+'" style="flex:1"><button class="sm" onclick="netRename(\''+id+'\')">Đổi tên</button></div><div class="row wrap">'+(p.pending?'<button class="sm" onclick="netPost(\'uncmd\',\''+id+'\')">Hủy '+p.pending+' lệnh đang chờ</button>':'')+'<button class="sm" onclick="netPost(\'trust\',\''+id+'\',{on:'+(p.trust?0:1)+'})">'+(p.trust?'🛡 Bật lại kiểm tra chống gian lận':'Tin tưởng: bỏ kiểm tra chống gian lận')+'</button><button class="sm" onclick="netAdmXfer(\''+id+'\')">🔑 Tạo mã chuyển máy</button><button class="sm bad" onclick="netCmd(\''+id+'\',\'reset\')">Đặt lại dữ liệu</button><button class="sm bad" onclick="netDelete(\''+id+'\')">Xóa khỏi máy chủ</button></div>')+
      box('Đàn mèo ('+cats.length+')','<div style="max-height:150px;overflow:auto;line-height:1.7">'+(cats.length?cats.map(cn).join(''):'<span class="dim">Chưa có dữ liệu</span>')+'</div>')+
      box('Nhật ký','<div style="max-height:190px;overflow:auto;font-size:13px">'+(lg||'<span class="dim">Chưa có gì</span>')+'</div>')+
      '<div class="row" style="justify-content:center"><button class="sm" onclick="netPlayer(\''+id+'\')">↻ Tải lại</button><button class="sm" onclick="netPlayers()">← Danh sách</button></div>');
    admCoats('nsp','nct');
  }).catch(nerr);
}
const netPost=(ep,id,extra)=>api('admin/'+ep,Object.assign({id},extra||{}),1).then(()=>netPlayer(id)).catch(nerr);
function netRename(id){netPost('rename',id,{name:$('nname').value})}
function netDelete(id){if(confirm('Xóa người chơi này khỏi máy chủ? Bản lưu trên máy của họ vẫn còn; lần sau mở game họ sẽ được hỏi tên lại.'))api('admin/delete',{id},1).then(()=>netPlayers()).catch(nerr)}

/* ---------- chuyển tiến độ sang máy khác ----------
   Máy cũ xin mã chuyển máy (8 ký tự, 10 phút, dùng một lần); máy mới nhập mã thì nhận đúng bản lưu hợp lệ máy chủ đang giữ
   (đã qua trọng tài chống gian lận), máy chủ cấp khóa mới cho máy mới và hủy khóa của máy cũ, nên mỗi lúc chỉ một máy chơi được.
   Mã khôi phục (12 ký tự, dùng một lần, không hết hạn) để lấy lại tiến độ khi mất máy cũ. Không có xuất hay nhập file bản lưu. */
const XF={t:0,exp:0,poll:0};
const xfNew=()=>!(S.tut&&S.tut.done)&&S.level<=1;   // ván trên máy này còn mới (chưa xong hướng dẫn tân thủ)
const xfClock=t=>{const d=new Date(t*1000),p=n=>String(n).padStart(2,'0');return p(d.getHours())+':'+p(d.getMinutes())+' ngày '+p(d.getDate())+'/'+p(d.getMonth()+1)};
const xfBig=c=>'<div style="font:800 30px/1.2 ui-monospace,Consolas,monospace;letter-spacing:3px;text-align:center;padding:10px 6px;margin:8px 0;border:3px dashed var(--line);border-radius:14px;background:var(--panel2);user-select:all;word-break:break-all">'+esc(c)+'</div>';
function xferCard(){
  const box=h=>'<div class="card" id="xfcard" style="flex-direction:column;align-items:stretch"><b>📱💻 Chơi tiếp trên máy khác</b>'+h+'</div>';
  if(!NET.on)return box('<small>Chuyển tiến độ sang máy khác chỉ dùng được khi chơi qua máy chủ chung (<b>server.py</b>). Mở game bằng file hay máy chủ tĩnh thì tiến độ chỉ nằm trên máy này.</small>');
  if(!NET.pl)return box('<div class="row wrap"><button style="flex:1" onclick="xferEnter()">📥 Nhận tiến độ từ máy khác</button></div>');
  return box('<div class="row wrap"><button style="flex:1" class="on" onclick="xferNew()">📤 Chuyển sang máy khác</button><button style="flex:1" onclick="xferEnter()">📥 Nhận tiến độ từ máy khác</button></div>'+
    '<div class="row wrap"><button style="flex:1" onclick="xferRec()">🛟 '+(NET.rcAt?'Tạo lại mã khôi phục':'Tạo mã khôi phục')+'</button></div>'+
    '<small>Máy chủ giữ bản lưu của bạn. Xin mã ở máy này rồi nhập vào máy kia là chơi tiếp, đủ mèo, xu, đồ. Mỗi lúc chỉ một máy chơi được. '+
    (NET.rcAt?'Bạn đã có mã khôi phục (tạo lúc '+xfClock(NET.rcAt)+').':'<b>Chưa có mã khôi phục</b>: tạo một mã và ghi lại, phòng khi mất máy này.')+'</small>');
}
// máy cũ: đồng bộ lần cuối rồi xin mã
function xferNew(){
  if(!NET.on||!NET.pl)return;
  modal('<h3>📤 Chuyển sang máy khác</h3><div class="dim">Đang gửi tiến độ mới nhất lên máy chủ…</div>');
  const go=()=>netSync().then(j=>{
    if(!j){if(SAVE_OFF||NET.moved)return;throw new Error('Không kết nối được máy chủ, thử lại sau ít giây')}   // máy chủ đang khôi phục bản lưu hoặc hồ sơ đã chuyển đi thì đã có màn riêng
    if(j.busy)throw new Error('Máy chủ đang bận kiểm tra bản lưu, thử lại sau ít giây');
    return api('xfer/new',{id:NET.pl.id,tok:NET.pl.tok}).then(xfShow)});
  const wait=k=>NET.busy&&k<40?new Promise(r=>setTimeout(r,250)).then(()=>wait(k+1)):go();   // đang có lần đồng bộ khác thì chờ nó xong (tối đa 10 giây)
  wait(0).catch(e=>{if(!NET.moved)modal('<h3>📤 Chuyển sang máy khác</h3><div style="color:var(--bad)">Không tạo được mã: '+esc(e.message)+'</div><div class="row" style="justify-content:center;margin-top:8px"><button class="sm on" onclick="xferNew()">Thử lại</button></div>')});
}
function xfShow(j){
  XF.exp=Date.now()+(j.exp-j.now)*1000;const s=j.sum||{};
  modal('<h3>📤 Mã chuyển máy</h3><div>Trên máy mới, mở Mèo Xu cùng địa chỉ máy chủ, chọn <b>Cài đặt › Nhận tiến độ từ máy khác</b> (máy mới tinh thì game tự hỏi) rồi nhập mã:</div>'+xfBig(j.code)+
    '<div class="dim" id="xfleft" style="text-align:center"></div>'+
    '<div class="card" style="flex-direction:column;align-items:stretch;margin-top:8px"><b>Máy mới sẽ nhận</b><div>Cấp '+(s.level||1)+' · 🪙 '+nfmt(s.coins)+' xu · 🎟 '+nfmt(s.tickets)+' vé · 🐱 '+nfmt(s.ncat)+' mèo, cùng phòng, đồ đạc, nhiệm vụ.</div></div>'+
    '<div class="dim" style="margin-top:6px">Mã dùng được một lần, hết hạn sau 10 phút. Máy mới nhận xong thì máy này thôi lưu tiến độ; những gì chơi thêm ở đây sau đó sẽ không được giữ. Đừng đưa mã cho người khác: ai có mã là lấy được tiến độ của bạn.</div>'+
    '<div class="row" style="justify-content:center;margin-top:8px"><button class="sm" onclick="xferCancel()">Hủy mã</button></div>');
  clearInterval(XF.poll);let k=0;
  XF.poll=setInterval(()=>{
    const el=$('xfleft');if(!el||NET.moved){clearInterval(XF.poll);return}
    const left=Math.max(0,Math.round((XF.exp-Date.now())/1000));
    el.innerHTML=left?'Còn '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0')+' · đang chờ máy mới nhập mã…':'<b>Mã đã hết hạn.</b> <button class="sm" onclick="xferNew()">Tạo mã mới</button>';
    if(left&&++k%5===0)netSync();   // 5 giây hỏi máy chủ một lần: máy mới nhận xong thì máy này biết ngay
    if(!left)clearInterval(XF.poll);
  },1000);
}
function xferCancel(){clearInterval(XF.poll);api('xfer/cancel',{id:NET.pl.id,tok:NET.pl.tok}).catch(()=>{});closeModal();toast('Đã hủy mã chuyển máy',{icon:'📤',title:'Chuyển máy'})}
// máy mới: nhập mã
function xfForm(){
  const has=S.level>1||S.cats.length>1||(S.tut&&S.tut.done);
  return '<div class="row" style="margin-top:8px"><input id="xfcode" maxlength="16" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD-EFGH" style="flex:1;font:700 20px ui-monospace,Consolas,monospace;letter-spacing:2px;text-transform:uppercase" onkeydown="if(event.key===\'Enter\')xferUse()"><button class="sm on" onclick="xferUse()">Nhận tiến độ</button></div>'+
    '<div id="xferr" class="dim" style="color:var(--bad);min-height:1.2em"></div>'+
    (has?'<div class="dim">⚠ Tiến độ đang có trên máy này (cấp '+S.level+', '+S.cats.length+' mèo) sẽ bị thay bằng tiến độ của mã.</div>':'')+
    '<div class="dim" style="margin-top:4px">Mất máy cũ? Nhập mã khôi phục 12 ký tự bạn đã ghi lại, hoặc nhờ quản trị viên tạo mã.</div>';
}
function xferEnter(){
  if(!NET.on){toast('Chỉ dùng được khi chơi qua máy chủ chung',{type:'warn',title:'Chuyển máy'});return}
  XF.mv=1;
  modal('<h3>📥 Nhận tiến độ từ máy khác</h3><div class="dim">Trên máy cũ, chọn <b>Cài đặt › Chuyển sang máy khác</b> để lấy mã 8 ký tự rồi nhập vào đây.</div>'+xfForm()+
    (NET.moved||!NET.pl?'<div class="row" style="justify-content:center;margin-top:8px"><button class="sm" onclick="'+(NET.moved?'netMoved()':'netAskName()')+'">‹ Quay lại</button></div>':''),!!NET.moved||!NET.pl);
  XF.mv=0;
  setTimeout(()=>{const i=$('xfcode');if(i)i.focus()},50);
}
function xferUse(){
  const i=$('xfcode'),er=$('xferr');if(!i)return;
  const code=(i.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(code.length!==8&&code.length!==12){er.textContent='Mã chuyển máy có 8 ký tự, mã khôi phục có 12 ký tự.';return}
  er.textContent='Đang kiểm tra…';
  api('xfer/use',{code}).then(j=>{
    NET.on=false;SAVE_OFF=true;           // trang này thôi đồng bộ và thôi ghi bản lưu, để không ghi đè bản vừa nhận
    try{localStorage.setItem(KEY,j.save)}catch(e){}
    lsSet(PKEY,JSON.stringify({id:j.id,tok:j.tok,name:j.name}));
    const w=$('xfwel');if(w)w.remove();
    XF.mv=1;modal('<h3>✅ Đã nhận tiến độ của '+esc(j.name)+'</h3><div>Máy này giờ là máy chơi chính. Máy cũ đã thôi lưu tiến độ.</div>'+
      (j.rc?'<div style="margin-top:6px"><b>Mã khôi phục vừa dùng đã hết hiệu lực.</b> Vào Cài đặt tạo mã mới và ghi lại nhé.</div>':'')+'<div class="dim" style="margin-top:8px">Đang tải lại…</div>',true);XF.mv=0;
    setTimeout(()=>location.reload(),1800);
  }).catch(e=>{er.textContent=e.message||'Không kết nối được máy chủ'});
}
// mã khôi phục: hiện đúng một lần
function xferRec(sure){
  if(NET.rcAt&&!sure){modal('<h3>🛟 Tạo lại mã khôi phục</h3><div>Bạn đã có mã khôi phục. Tạo mã mới thì mã cũ hết hiệu lực ngay.</div><div class="row" style="justify-content:center;margin-top:8px"><button class="sm on" onclick="xferRec(1)">Tạo mã mới</button><button class="sm" onclick="openSettings()">Thôi</button></div>');return}
  api('xfer/rec',{id:NET.pl.id,tok:NET.pl.tok}).then(j=>{
    NET.rcAt=j.t;
    modal('<h3>🛟 Mã khôi phục</h3><div>Ghi lại mã này ở nơi an toàn (giấy, ghi chú riêng). Mất máy thì nhập mã ở máy mới để lấy lại tiến độ.</div>'+xfBig(j.code)+
      '<div class="dim">Mã chỉ hiện một lần: máy chủ không giữ mã gốc nên không xem lại được, chỉ tạo lại được. Mã dùng được một lần; ai có mã là lấy được tiến độ của bạn, đừng gửi cho ai.</div>'+
      '<div class="row" style="justify-content:center;margin-top:8px"><button class="sm" onclick="xfCopy(\''+j.code+'\')">📋 Chép mã</button><button class="sm on" onclick="openSettings()">Tôi đã ghi lại</button></div>');
  }).catch(e=>{if(!NET.moved)toast('Không tạo được mã khôi phục: '+e.message,{type:'warn',title:'Chuyển máy'})});
}
function xfCopy(c){try{navigator.clipboard.writeText(c).then(()=>toast('Đã chép mã',{icon:'📋',title:'Chuyển máy'}),()=>{})}catch(e){toast('Trình duyệt không cho chép, hãy ghi tay',{type:'warn',title:'Chuyển máy'})}}
// máy cũ sau khi hồ sơ đã chuyển đi: khóa màn hình, không còn lưu gì lên máy chủ
function netMoved(j){
  if(j)NET.moved=j;else j=NET.moved||{};
  if(!NET.moved)NET.moved=j;
  SAVE_OFF=true;clearInterval(XF.poll);
  XF.mv=1;modal('<h3>📤 Hồ sơ đã chuyển sang máy khác</h3><div>Hồ sơ <b>'+esc(j.name||(NET.pl&&NET.pl.name)||'')+'</b> đang được chơi trên một máy khác'+(j.at?' (từ '+xfClock(j.at)+')':'')+'. Máy này không còn lưu tiến độ, nên chơi tiếp ở đây sẽ không được giữ.</div>'+
    '<div class="dim" style="margin-top:6px">Nếu không phải bạn chuyển, hãy báo quản trị viên ngay.</div>'+
    '<div class="row wrap" style="justify-content:center;margin-top:10px"><button class="sm on" onclick="xferEnter()">🔑 Nhập mã để chơi tiếp trên máy này</button><button class="sm" onclick="xfFresh()">🆕 Tạo hồ sơ mới trên máy này</button></div>',true);XF.mv=0;
}
function xfFresh(sure){
  if(!sure){XF.mv=1;modal('<h3>🆕 Tạo hồ sơ mới</h3><div>Máy này sẽ bắt đầu một ván mới từ đầu với một hồ sơ mới. Hồ sơ cũ vẫn ở máy kia, không mất gì.</div><div class="row" style="justify-content:center;margin-top:8px"><button class="sm on" onclick="xfFresh(1)">Bắt đầu ván mới</button><button class="sm" onclick="netMoved()">Thôi</button></div>',true);XF.mv=0;return}
  try{localStorage.removeItem(KEY)}catch(e){}lsSet(PKEY,null);location.reload();
}
// máy chưa có hồ sơ, ván còn mới: lớp chào riêng nằm trên cả hướng dẫn tân thủ
function xfWelcome(form){
  if(NET.pl||!xfNew())return;
  let w=$('xfwel');
  if(!w){w=document.createElement('div');w.id='xfwel';w.style.cssText='position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(60,36,20,.5)';document.body.appendChild(w)}
  w.innerHTML='<div style="background:var(--bg);color:var(--ink);border:4px solid var(--line);border-radius:18px;padding:14px 16px;max-width:420px;width:100%;box-shadow:0 6px 0 rgba(60,36,20,.25)">'+
    (form?'<h3 style="margin:0 0 4px">📥 Nhận tiến độ từ máy khác</h3><div class="dim">Trên máy cũ, chọn <b>Cài đặt › Chuyển sang máy khác</b> để lấy mã rồi nhập vào đây.</div>'+xfForm()+'<div class="row" style="justify-content:center;margin-top:8px"><button class="sm" onclick="xfWelcome()">‹ Quay lại</button></div>'
      :'<h3 style="margin:0 0 6px">👋 Chào mừng tới Mèo Xu</h3><div>Bạn đã chơi Mèo Xu trên máy khác (điện thoại, máy tính) chưa?</div>'+
       '<div class="row wrap" style="margin-top:10px"><button style="flex:1" class="on" onclick="xfWelcome(1)">🔑 Rồi, tôi có mã chuyển máy</button><button style="flex:1" onclick="xfWelClose()">Chưa, tôi mới chơi</button></div>')+'</div>';
  if(form)setTimeout(()=>{const i=$('xfcode');if(i)i.focus()},50);
}
function xfWelClose(){const w=$('xfwel');if(w)w.remove();setTimeout(netAskName,700)}
// hướng dẫn tân thủ chặn Enter, dấu cách ở bước bắt buộc: gõ trong ô nhập mã của lớp chào thì không để nó chặn
// (chặn ở pha bắt nên ô nhập không nhận onkeydown nữa: tự xử lý Enter; gõ chữ vẫn bình thường vì không preventDefault)
addEventListener('keydown',ev=>{if(ev.target&&ev.target.closest&&ev.target.closest('#xfwel')){ev.stopImmediatePropagation();if(ev.key==='Enter'&&ev.target.id==='xfcode')xferUse()}},true);
// máy đã chuyển hồ sơ đi: không để hộp thoại khác (điểm danh, quà...) đè mất màn khóa
{const m=modal,c=closeModal;
  modal=function(h,l){if(NET.moved&&!XF.mv)return;return m.apply(this,arguments)};
  closeModal=function(){if(NET.moved)return;return c.apply(this,arguments)};}
function netAdmXfer(id){
  if(!confirm('Tạo mã chuyển máy cho người chơi này? Ai có mã sẽ lấy được hồ sơ, máy hiện tại của họ thôi lưu tiến độ. Chỉ đưa mã khi chắc đúng người.'))return;
  api('admin/xfer',{id},1).then(j=>modal('<h3>🔑 Mã chuyển máy</h3><div>Đưa mã này cho người chơi. Họ mở game trên máy mới và chọn Nhận tiến độ từ máy khác.</div>'+xfBig(j.code)+'<div class="dim">Dùng một lần, hết hạn sau 10 phút.</div><div class="row" style="justify-content:center;margin-top:8px"><button class="sm" onclick="netPlayer(\''+id+'\')">← Người chơi</button></div>')).catch(nerr);
}
netInit();
