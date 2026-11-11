"use strict";
/* Hình thiết bị thời tiết nhóm 03 (Codex vẽ). Nạp sau js/art.js. */
(()=>{const {C,dk,lt,hex}=Art.K;
const CREAM=hex('#fff2db'),MILK=hex('#fffaf0'),MINT=hex('#a7d6c5'),TEAL=hex('#518d8c'),
  INK=hex('#58717e'),BLUE=hex('#a7d9e5'),ICE=hex('#dcf3ed'),PINK=hex('#edb3b3'),
  PEACH=hex('#edc59b'),WOOD=hex('#c59875'),HONEY=hex('#edcb80'),LED=hex('#9cdbad');
// Thin internal seams and wire guards; the renderer supplies the outside outline.
const seam=(b,x,y,X,Y,c=INK,r=.22)=>b.cap(x,y,X,Y,r,c,'x');
function ring(b,x,y,rx,ry,c,w=.18){
  for(let i=0;i<32;i++){const t=i*Math.PI/16,u=(i+1)*Math.PI/16;
    seam(b,x+Math.cos(t)*rx,y+Math.sin(t)*ry,x+Math.cos(u)*rx,y+Math.sin(u)*ry,c,w)}
}
function head(b,x,y,r,v,col){
  b.ell(x,y,r,r,col);b.ell(x,y,r-.55,r-.55,TEAL,'x');
  b.ell(x,y,r-1,r-1,ICE,'x');
  for(let i=0;i<3;i++){
    const t=i*Math.PI*2/3+(v==='a1'?.88:.15),q=t+.38;
    b.tri(x,y,x+Math.cos(t)*r*.7,y+Math.sin(t)*r*.7,
      x+Math.cos(t+.9)*r*.55,y+Math.sin(t+.9)*r*.55,dk(col,.12),'x');
    b.cap(x+Math.cos(q)*r*.24,y+Math.sin(q)*r*.24,
      x+Math.cos(q)*r*.55,y+Math.sin(q)*r*.55,r*.17,col,'x');
    seam(b,x+Math.cos(q)*r*.32,y+Math.sin(q)*r*.32,
      x+Math.cos(q)*r*.64,y+Math.sin(q)*r*.64,lt(col,.45),.16);
  }
  ring(b,x,y,r*.7,r*.7,lt(TEAL,.38),.15);
  for(let i=0;i<8;i++){const t=i*Math.PI/4;
    seam(b,x+Math.cos(t)*1.1,y+Math.sin(t)*1.1,
      x+Math.cos(t)*(r-.8),y+Math.sin(t)*(r-.8),lt(TEAL,.38),.15)}
  b.ell(x,y,1.12,1.12,CREAM,'x');b.ell(x,y,.45,.45,HONEY,'x');
  seam(b,x-r*.52,y-r*.67,x-r*.15,y-r*.83,MILK,.25);
  [0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(t=>
    b.dot(x+Math.cos(t)*(r-.2),y+Math.sin(t)*(r-.2),MILK,'x'));
}
function button(b,x,y,col=LED){b.ell(x,y,.6,.6,INK,'x');b.ell(x,y-.1,.35,.35,col,'x')}
function drop(b,x,y,s,col=BLUE){
  b.tri(x,y-s,x-s*.55,y+s*.12,x+s*.55,y+s*.12,col,'x');
  b.ell(x,y+s*.2,s*.55,s*.6,col,'x');b.dot(x-.2,y,ICE,'x');
}
function snow(b,x,y,c){
  for(let i=0;i<3;i++){const t=i*Math.PI/3;
    seam(b,x-Math.cos(t)*1.25,y-Math.sin(t)*1.25,x+Math.cos(t)*1.25,y+Math.sin(t)*1.25,c,.2)}
}
function aircon(b,v,a,dual){
  const tint=C(a,0,dual?PINK:MINT),front=dual?hex('#fff0e6'):MILK;
  b.cap(5,5.5,34,5.5,3.5,front);b.rect(5,2,29,8,front);
  b.cap(5,8,34,8,2.4,dk(front,.09));
  b.rect(3,4,34,3.5,front,'x');
  b.rect(4,3,31,1,lt(tint,.55),'x');seam(b,5,3,34,3,lt(front,.65));
  seam(b,3.5,7.6,35.5,7.6,dk(tint,.2));
  b.cap(6,9,33,9,1.1,INK,'x');
  b.rect(5.5,8.7,28,1.2,TEAL,'x');
  for(let x=8;x<=31;x+=4)seam(b,x,8.3,x+(v==='a1'?.5:-.3),9.7,lt(TEAL,.38),.17);
  seam(b,6,v==='a1'?9:9.5,33,v==='a1'?9.4:9.5,tint,.3);
  b.rect(28,4.5,5.5,2,INK,'x');
  // Tiny seven-segment style display: 24 degrees.
  const seg=(x,y,X,Y)=>seam(b,x,y,X,Y,ICE,.16);
  seg(28.6,4.9,29.6,4.9);seg(29.6,4.9,29.6,5.4);seg(28.6,5.4,29.6,5.4);
  seg(28.6,5.4,28.6,6);seg(28.6,6,29.6,6);
  seg(30.7,4.9,30.7,5.4);seg(30.7,5.4,31.7,5.4);seg(31.7,4.9,31.7,6);
  b.dot(32.7,4.8,HONEY,'x');button(b,35,5.5,v==='a1'?ICE:LED);
  snow(b,7,5.5,TEAL);
  if(dual){b.ell(12,5.5,.65,.65,HONEY,'x');
    [[10.5,5.5],[13.5,5.5],[12,4],[12,7]].forEach(p=>b.dot(p[0],p[1],WOOD,'x'));
    seam(b,17,5.5,23,5.5,lt(PINK,.1));b.dot(24,5.5,PINK,'x');
  }else{seam(b,12,5.5,18,5.5,lt(MINT,.12));b.dot(19,5.5,MINT,'x')}
  // The moving vane stays inside the casing, with cool/warm outlet accents.
  [11,20,29].forEach((x,i)=>seam(b,x,8.7,x+1.5,8.7,
    dual&&i===2?PEACH:BLUE,.2));
}
Art.addFurn({
  fanmini(b,v,a){
    const c=C(a,0,MINT);
    b.cap(6.5,10,6.5,13,.85,c);b.ell(6.5,13.8,4.7,.85,c);
    b.rect(3,13,7,1.5,c);seam(b,3.5,14.2,9.5,14.2,dk(c,.18));
    b.rect(5,12.8,3,.6,CREAM,'x');button(b,8.5,13.4);
    head(b,6.5,6.6,5.15,v,c);
  },
  fanstand(b,v,a){
    const c=C(a,0,PINK);
    b.ell(7.5,31,5.9,1.15,c);b.rect(3,30,9,1.5,c);
    seam(b,3.5,31.7,11.5,31.7,dk(c,.22));
    b.cap(7.5,17,7.5,29.5,1,CREAM);b.rect(7.5,18,1,10.5,dk(CREAM,.12),'x');
    b.cap(7.5,14.4,7.5,20,1.5,c);b.rect(6,16.5,3,4.5,c);
    seam(b,6.2,20.5,8.8,20.5,dk(c,.25));
    button(b,7.5,17.5);b.dot(7.5,19.5,HONEY,'x');
    b.ell(7.5,29.7,2,1,CREAM,'x');seam(b,5,30.7,7,30.7,lt(c,.6));
    head(b,7.5,8,6.15,v,c);
  },
  fanceiling(b,v,a){
    const c=C(a,0,PEACH);
    b.ell(17.5,2,3,.7,CREAM);b.cap(17.5,2.5,17.5,6, .7,WOOD);
    // The motor is fixed; the wooden blades turn in a foreshortened plane.
    const t=v==='a1'?1:0;
    const blade=(x,y,X,Y,r)=>{
      b.cap(x,y,X,Y,r,c);
      seam(b,x,y-.4,X,Y-.4,lt(c,.55),.26);
      for(let i=1;i<4;i++){
        const u=i/5,w=(i+.6)/5;
        seam(b,x+(X-x)*u,y+(Y-y)*u+.35,x+(X-x)*w,y+(Y-y)*w+.35,WOOD,.16);
      }
    };
    blade(4,5+t,16.5,7,1.65);blade(19,7,31,4.5-t,1.65);
    blade(18,8,12+t,11+.3*t,1.5);blade(19,8,27+t,10.5-t,1.3);
    b.ell(18,7.5,3.2,1.9,MINT);ring(b,18,7.4,2.5,1.25,TEAL,.18);
    b.ell(18,8.1,1.7,.85,CREAM,'x');b.dot(v==='a1'?18.5:17,7.9,HONEY,'x');
    seam(b,20.5,8.5,21,11.1,WOOD,.18);b.ell(21,11.7,.5,.7,HONEY);
  },
  ac1(b,v,a){aircon(b,v,a,false)},
  ac2(b,v,a){aircon(b,v,a,true)},
  mistfan(b,v,a){
    const c=C(a,0,BLUE);
    b.cap(8.5,14,8.5,21,1.1,CREAM);b.rect(8.5,15,1,5,dk(CREAM,.12),'x');
    b.rect(3,23,11,7.5,c);b.cap(5,23,12,23,2,c);
    b.ell(8.5,30.5,6,1.1,c);b.rect(3,28.5,11,2,c);
    b.rect(5,24,7,5.5,TEAL,'x');b.rect(5.5,24.5,6,4.5,ICE,'x');
    b.rect(5.5,26,6,3,BLUE,'x');seam(b,5.6,26,11.2,26,lt(BLUE,.65));
    seam(b,6,24.5,6,28, MILK,.25);drop(b,8.7,27.2,.9,TEAL);
    [25.2,26.7,28.2].forEach(y=>seam(b,10.6,y,11.2,y,TEAL,.17));
    b.rect(6,21,5,1.5,CREAM,'x');button(b,7,21.7);button(b,10,21.7,HONEY);
    b.ell(8.5,31.9,4.5,.3,dk(c,.22),'x');
    head(b,8.5,8.2,6.3,v,c);
    b.ell(8.5,8.2,1.1,1.1,CREAM,'x');b.ell(8.5,8.2,.4,.4,TEAL,'x');
    // A nozzle and alternating beads of mist at the top of the guard.
    b.rect(7.5,2,2,.8,TEAL,'x');
    [[5.5,4.5],[11.5,4.5],[4.8,7],[12.2,7]].forEach((p,i)=>{
      const y=p[1]+(v==='a1'?.5:0);b.ell(p[0],y,.4,.4,i%2?MILK:BLUE,'x')});
    drop(b,v==='a1'?10:7,17.5,.65,BLUE);
    b.dot(v==='a1'?6:11,19,BLUE,'x');
  },
  aircooler(b,v,a){
    const c=C(a,0,MINT);
    b.cap(5,26.5,5,28,.65,INK);b.cap(16,26.5,16,28,.65,INK);
    b.rect(3,5,15,21,c);b.cap(5,5,16,5,2,c);
    b.cap(5,25.5,16,25.5,2,c);b.rect(2.5,7,16,16,c);
    b.rect(4,5,13,19,CREAM,'x');
    b.rect(6.5,2,8,.8,TEAL,'x');b.rect(7.5,2.5,6,1,lt(c,.45),'x');
    b.rect(5,5,11,2.5,INK,'x');b.rect(6,5.5,4,1.2,ICE,'x');
    b.dot(7,6,HONEY,'x');b.dot(9,6,TEAL,'x');button(b,12,6);button(b,14.5,6,HONEY);
    b.rect(5,9,11,11,TEAL,'x');b.rect(5.5,9.5,10,10,INK,'x');
    for(let i=0;i<5;i++){
      const y=10+i*1.8,dy=v==='a1'?.4:0;
      b.rect(5.7,y,9.6,1.1,lt(c,.1),'x');seam(b,6,y+dy,15,y+dy,ICE,.22);
      seam(b,6,y+1,15,y+1,dk(TEAL,.12),.17);
    }
    seam(b,7.5,10,7.5,18.5,dk(c,.13),.17);
    seam(b,13,10,13,18.5,dk(c,.13),.17);
    seam(b,4.5,21,16.5,21,dk(c,.24));
    b.rect(6,22,9,2.5,TEAL,'x');b.rect(6.5,22.5,8,1.5,BLUE,'x');
    seam(b,7,22.8,11,22.8,ICE,.2);drop(b,10.5,23,.5,ICE);
    seam(b,7.5,25.8,13.5,25.8,CREAM,.35);
    b.rect(16.5,10,.5,8,dk(c,.17),'x');
    b.dot(3.5,24,lt(c,.65),'x');b.dot(17,24,lt(c,.65),'x');
  },
});
})();
