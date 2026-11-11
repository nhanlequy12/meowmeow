/* Service worker của Mèo Xu (2026-11-11): cho phép cài game lên màn hình chính, chơi khi mất mạng, và nhận thông báo đẩy.
   - File game: luôn hỏi mạng trước (bản mới nhất, như khi chưa có service worker); mất mạng hoặc mạng quá chậm thì dùng bản đã lưu.
     Danh sách file cần lưu lấy từ chính index.html (mọi thẻ <script src> và <link href>), nên thêm file mới không phải sửa ở đây.
   - /api/ (máy chủ nhiều người chơi) và preview/ không lưu.
   - Thông báo đẩy không kèm nội dung: nhận được thì hỏi máy chủ (api/push/pull) xem cần báo gì. */
const CACHE='meoxu-v1',ICON='icons/icon-192.png',BADGE='icons/badge-96.png';
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(CACHE),r=await fetch('index.html',{cache:'no-cache'}),html=await r.clone().text();
  await c.put('index.html',r.clone());await c.put('./',r);
  const urls=[...html.matchAll(/<script[^>]+src="([^"]+)"/g),...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map(m=>m[1]).filter(u=>!/^[a-z]+:/i.test(u));
  urls.push(ICON,BADGE);
  await Promise.all(urls.map(u=>fetch(u,{cache:'no-cache'}).then(r=>r.ok?c.put(u,r):0).catch(()=>0)));
  await self.skipWaiting();
})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);
  await self.clients.claim();
})())});
async function netFirst(rq){
  const c=await caches.open(CACHE),hit=await c.match(rq,{ignoreSearch:true});
  const net=fetch(rq).then(r=>{if(r.ok&&r.type==='basic')c.put(rq,r.clone());return r});
  if(!hit)return net;
  return Promise.race([net,new Promise(res=>setTimeout(()=>res(hit),4000))]).catch(()=>hit);   // mất mạng, hoặc mạng chậm quá 4 giây: dùng bản đã lưu
}
self.addEventListener('fetch',e=>{
  const rq=e.request,u=new URL(rq.url);
  if(rq.method!=='GET'||u.origin!==self.location.origin||u.pathname.includes('/api/')||u.pathname.includes('/preview/'))return;
  e.respondWith(netFirst(rq));
});
self.addEventListener('push',e=>{e.waitUntil((async()=>{
  let m=null;
  try{const s=await self.registration.pushManager.getSubscription();
    if(s){const r=await fetch('api/push/pull',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint:s.endpoint})});if(r.ok)m=await r.json()}}catch(err){}
  await self.registration.showNotification((m&&m.title)||'Mèo Xu',{body:(m&&m.body)||'Có việc mới ở nhà mèo, vào xem nào.',tag:'meoxu',renotify:true,icon:ICON,badge:BADGE,lang:'vi'});
})())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil((async()=>{
  const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const c of cl)if('focus' in c)return c.focus();
  return self.clients.openWindow(self.registration.scope);
})())});
