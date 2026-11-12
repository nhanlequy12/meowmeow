"use strict";
/* Hiệu ứng bữa ăn, nạp sau quest.js và meal.js.
   mealFx(k,iid,id,n): mealPour gọi sau khi thêm n suất; không sửa lượng thật.
   Vẽ phòng: const r=mealFxRatio(it,fillRatio(it)); dùng r thay cho fillRatio(it)
   khi chọn mức biến thể mf/mw: r>0 ? Math.max(1,Math.round(r*8)) : 0.
   Ngoài lúc đổ, mealFxRatio trả nguyên real. Không đưa thời gian vào khóa cache.
   Mọi hạt nằm trong bộ nhớ tạm, tối đa 40 hạt/gợn cho cả phòng. */

const MEALFX=(()=>{
  const pours=new Map(),dust=[],beats=new Map(),MAX=40;
  // Giữ đúng màu chính và màu sáng của bảng món trong meal-art.js.
  const food={
    kibble:['#a4663a','#d39c5c'],pate:['#b87570','#d79d8f'],
    tuna:['#cd6f6f','#f4aba1'],salmon:['#ed8f52','#ffebca'],
    chicken:['#f7e6c0','#fff9e4'],churu:['#ecb36e','#ffe0a6'],
    catnip:['#64a052','#abcd6e'],premium:['#c1765d','#f7ca51','#689b5f']
  };
  const water={
    w_plain:['#a3daeb','#ecfaff'],w_mineral:['#91cbe2','#e5f8ff'],
    w_pure:['#5ed9d1','#eefffb'],w_electro:['#c4df80','#f5ffd3'],
    w_nutri:['#f7f0d7','#fff9eb'],w_special:['#da9ddd','#fff0ff']
  };
  let room=null,scan=0,clock=0;
  const time=()=>performance.now()/1000;
  const unit=v=>Math.max(0,Math.min(1,v));
  const rand=(a,b)=>a+Math.random()*(b-a);
  const colors=(k,id)=>(k==='f'?food[id]||food.kibble:water[id]||water.w_plain);
  const valid=p=>p.it.room===p.room&&p.room===cur&&!p.it.broken&&
    !!FURN[p.it.fid]&&S.items.includes(p.it);
  const progress=p=>{const u=unit((time()-p.t-.12)/(p.dur*.72));return u*u*(3-2*u)};
  const pixel=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};

  // Mặt bát trong tọa độ hình nội thất; lật cả điểm đáp lẫn hướng bình/túi.
  function surface(it,r,side=0){
    const f=FURN[it.fid],w=f.w,h=f.h;
    let x=w/2,y=h-6.75,rx=Math.max(2,w/2-4),rise=1.05;
    if(it.fid==='bowldouble'){x=side%2?22:8;y=4.45;rx=3.3;r=unit(side%2?r*2-1:r*2)}
    else if(it.fid==='bowlraised'){x=10;y=5.05;rx=4}
    else if(it.fid==='feeder'){x=10;y=20.45;rx=5}
    else if(it.fid==='waterbowl'){x=8;y=2.6;rx=4.2}
    else if(it.fid==='thermobottle'){x=7.5;y=12.55;rx=1.9}
    else if(it.fid==='waterfilter'){x=10;y=11;rx=5.8}
    if(f.water){rx*=.35+.65*r;rise=1}
    const dir=it.flip?-1:1;
    return {x:it.x+dir*(x-w/2),y:it.y-h+y+(1-r)*rise,rx,dir};
  }
  function ratio(it,real){
    const p=pours.get(it.iid);
    if(!p||p.it!==it||!valid(p)||time()-p.t>=p.dur)return real;
    return Math.max(0,real-p.missing*(1-progress(p)));
  }
  function pour(k,iid,id,n){
    const it=S.items.find(i=>i.iid===iid),f=it&&FURN[it.fid];
    if(!f||it.room!==cur||it.broken||(k!=='f'&&k!=='w')||mbOf(it)!==k||!Number.isFinite(n)||n<=0)return;
    const cap=(k==='f'?f.bowl:f.water).cap,old=pours.get(iid);
    const carry=old&&old.it===it&&valid(old)&&time()-old.t<old.dur?old.missing*(1-progress(old)):0;
    // Đổ nối tiếp giữ phần còn đang rơi, tránh mức nhảy lên ở lần bấm thứ hai.
    const missing=Math.min(fillRatio(it),n/cap+carry);
    if(!pours.has(iid)&&pours.size>=12)pours.delete(pours.keys().next().value);
    const side=it.fid==='bowldouble'&&fillRatio(it)-missing>=.5?1:0;
    pours.set(iid,{it,room:it.room,k,id,t:time(),dur:1.25+Math.min(n,10)*.065,missing,emit:0,side});
  }
  function add(it,k,id,type,opts={}){
    if(dust.length>=MAX)return;
    const life=type==='ring'?.65:type==='shine'?.8:type==='bubble'?.45:rand(.35,.6);
    dust.push({it,room:it.room,k,id,type,age:0,life,side:0,x:0,y:0,vx:0,vy:0,size:1,
      color:colors(k,id)[Math.floor(Math.random()*colors(k,id).length)],...opts});
  }
  function ring(it,id,side=0){add(it,'w',id,'ring',{side})}

  function step(dt){
    if(room!==cur){room=cur;dust.length=0;beats.clear();scan=0}
    dt=Math.min(.1,Math.max(0,Number.isFinite(dt)?dt:0));clock+=dt;
    for(const [iid,p] of pours){
      if(!valid(p)||time()-p.t>=p.dur){pours.delete(iid);continue}
      const age=time()-p.t;
      // Bát đôi đầy lòng trái trước rồi tới lòng phải, như lớp hình thức ăn.
      if(p.it.fid==='bowldouble')p.side=ratio(p.it,fillRatio(p.it))>.5?1:0;
      if(age<.14||age>p.dur*.78)continue;
      p.emit-=dt;
      if(p.emit<=0){
        p.emit=p.k==='f'?.065:.18;
        if(p.k==='f'){
          add(p.it,p.k,p.id,'grain',{side:p.side,x:-9,y:-17,vx:rand(17,24),vy:rand(4,10),size:Math.random()<.3?2:1,life:.72,land:false});
        }else{
          ring(p.it,p.id,p.side);
          add(p.it,p.k,p.id,'bubble',{side:p.side,x:rand(-1,1),y:1,vy:-3});
          if(Math.random()<.5)add(p.it,p.k,p.id,'drop',{side:p.side,vx:rand(-8,8),vy:-rand(7,12)});
        }
      }
    }
    for(let i=dust.length-1;i>=0;i--){
      const p=dust[i];p.age+=dt;
      if(!valid(p)||p.age>=p.life){dust.splice(i,1);continue}
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.type==='grain'||p.type==='crumb'||p.type==='drop'){
        p.vy+=65*dt;
        if(p.type==='grain'&&!p.land&&p.y>=0){
          p.y=0;p.land=true;p.vx*=.22;p.vy=-rand(6,10);
          if(Math.random()<.22)add(p.it,p.k,p.id,'crumb',{side:p.side,x:p.x,vx:rand(-12,12),vy:-rand(9,15)});
        }else if(p.type==='grain'&&p.land&&p.y>=0){p.y=0;p.vx=0;p.vy=0}
      }
    }
    scan-=dt;if(scan>0)return;scan=.12;
    const seen=new Set();
    for(const it of S.items){
      if(it.room!==cur||it.broken||!FURN[it.fid])continue;
      const k=mbOf(it);if(!k)continue;seen.add(it);
      let b=beats.get(it);
      if(!b){b={eat:clock+rand(.05,.6),shine:clock+rand(.5,4)};beats.set(it,b)}
      const eaters=mealEaters(it).filter(c=>mealProg(c.meal)<1);
      if(eaters.length&&clock>=b.eat){
        const side=Math.floor(Math.random()*eaters.length),id=eaters[side].meal.id;
        b.eat=clock+(k==='f'?rand(.35,.8):.55);
        if(k==='f')add(it,k,id,'crumb',{side,x:rand(-2,2),vx:rand(-9,9),vy:-rand(8,14)});
        else{
          ring(it,id,side);
          if(Math.random()<.35)add(it,k,id,'drop',{side,x:rand(-1,1),vx:rand(-5,5),vy:-8});
        }
      }
      if(k==='w'&&clock>=b.shine){
        b.shine=clock+rand(3,6);
        if(fillRatio(it)>0&&!eaters.length&&!pours.has(it.iid))add(it,k,mTop(k,it),'shine',{x:-1,vx:2});
      }
    }
    for(const it of beats.keys())if(!seen.has(it))beats.delete(it);
  }

  // Gợn elip bằng chấm pixel, giữ trong lòng bát, không làm mềm nét vẽ.
  function ripple(g,s,p){
    const u=p.age/p.life,rx=.7+(s.rx-.7)*u,ry=Math.max(.45,rx*.22);
    g.globalAlpha*=.42*(1-u);
    for(let j=0;j<12;j++){
      const a=j*Math.PI/6;
      pixel(g,s.x+Math.cos(a)*rx,s.y+Math.sin(a)*ry,1,1,colors('w',p.id)[1]);
    }
  }
  function utensil(g,p,s){
    const age=time()-p.t,fade=unit(age/.12)*unit((p.dur-age)/.22),cc=colors(p.k,p.id);
    g.save();g.globalAlpha*=fade;g.translate(Math.round(s.x),Math.round(s.y));g.scale(s.dir,1);
    // Túi giấy nghiêng có nhãn món; miệng túi sát đầu đường rơi của hạt.
    if(p.k==='f'){
      g.save();g.translate(-9,-18);g.rotate(-.48+Math.sin(age*14)*.035);
      pixel(g,-7,-10,9,10,'#684738');pixel(g,-6,-9,7,8,'#e7c58f');
      pixel(g,-6,-9,7,1,'#fff0cc');pixel(g,-5,-6,5,3,cc[0]);
      pixel(g,-1,0,3,2,'#684738');pixel(g,0,0,1,1,cc[1]);g.restore();
    }else{
      // Chai cổ hẹp và dòng chảy liền vệt, khác hẳn các hạt thức ăn.
      g.save();g.translate(-9,-18);g.rotate(-.7);
      pixel(g,-8,-10,9,9,'#684f48');pixel(g,-7,-9,7,7,'#cce7e2');
      pixel(g,-6,-8,5,5,cc[0]);pixel(g,-7,-8,1,5,cc[1]);
      pixel(g,-2,-2,4,3,'#684f48');pixel(g,-1,-2,2,3,cc[0]);g.restore();
      if(age>.12&&age<p.dur*.82){
        const head=unit((age-.12)/.22),tail=unit((p.dur*.82-age)/.16);
        g.globalAlpha*=.8;
        for(let i=0;i<18;i++){
          const u=i/17;if(u>head||u<1-tail)continue;
          const x=-9*(1-u)*(1-u),y=-18+18*u;
          pixel(g,x,y,1+(i%5===Math.floor(age*18)%5?1:0),2,cc[0]);
          if(i%4===Math.floor(age*16)%4)pixel(g,x,y,1,1,cc[1]);
        }
      }
    }
    g.restore();
  }
  function draw(g){
    g.save();
    try{
      const levels=new Map();
      const level=it=>{if(!levels.has(it))levels.set(it,ratio(it,fillRatio(it)));return levels.get(it)};
      for(const p of pours.values()){
        if(valid(p)&&time()-p.t<p.dur)utensil(g,p,surface(p.it,level(p.it),p.side));
      }
      for(const p of dust){
        if(!valid(p))continue;
        const s=surface(p.it,level(p.it),p.side),u=p.age/p.life;
        g.save();
        if(p.type==='ring')ripple(g,s,p);
        else{
          g.globalAlpha*=p.type==='shine'?Math.sin(u*Math.PI)*.4:Math.min(1,(1-u)*4);
          const x=s.x+s.dir*p.x,y=s.y+p.y;
          if(p.type==='shine'){
            pixel(g,x,y,2,1,colors('w',p.id)[1]);
            if(u>.35&&u<.65)pixel(g,x+1,y-1,1,1,colors('w',p.id)[1]);
          }else if(p.type==='bubble')pixel(g,x,y,1,1,colors('w',p.id)[1]);
          else pixel(g,x,y,p.size,p.type==='drop'?2:p.size,p.color);
        }
        g.restore();
      }
    }finally{g.restore()}
  }
  return {pour,ratio,step,draw};
})();

function mealFx(k,iid,id,n){MEALFX.pour(k,iid,id,n)}
function mealFxRatio(it,real){return MEALFX.ratio(it,real)}
{const s0=critStep,d0=critDraw;critStep=dt=>{s0(dt);MEALFX.step(dt)};critDraw=g=>{d0(g);MEALFX.draw(g)}}
