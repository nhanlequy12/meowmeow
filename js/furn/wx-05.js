"use strict";
/* Hình thiết bị thời tiết nhóm 05 (Codex vẽ). Nạp sau js/art.js. */
(()=>{const {C,H,mix,dk,lt,hex,WH,EY,RED,NAVY,GOLDC,PINK,PUR,WOOD,WOOD2,CRMF,DWOOD,GRN,GRN2,STEM,TERRA,SAND,GLASS,HOLE,arch,star5}=Art.K;
const cream=[252,239,214],mint=[161,204,185],sage=[117,168,140],rose=[222,153,145],ink=[87,109,117],aqua=[139,204,220],gold=[239,195,113];
const seam=(b,x,y,X,Y,c)=>b.cap(x,y,X,Y,.25,c,'x');
const paw=(b,x,y,c,s=1)=>{b.ell(x,y+.5*s,.85*s,.6*s,c,'x');[[-.9,-.4],[0,-.8],[.9,-.4]].forEach(p=>b.ell(x+p[0]*s,y+p[1]*s,.3*s,.35*s,c,'x'))};
const snow=(b,x,y,c,s=1)=>{seam(b,x-s,y,x+s,y,c);seam(b,x-.6*s,y-.8*s,x+.6*s,y+.8*s,c);seam(b,x-.6*s,y+.8*s,x+.6*s,y-.8*s,c)};
const cloud=(b,x,y,c,s=1)=>{b.ell(x,y,1.4*s,.65*s,c,'x');b.ell(x-.55*s,y-.5*s,.65*s,.65*s,c,'x');b.ell(x+.45*s,y-.7*s,.8*s,.8*s,c,'x')};
Art.addFurn({
  winddoor(b,v,a){
    const wood=C(a,0,[208,167,125]),pad=C(a,1,mint),dark=dk(pad,.3);
    // A thick timber frame, inner weather seal, and a soft draft bolster.
    b.rect(2,2,26,36,wood);b.rect(3,3,24,34,lt(wood,.22),'x');
    b.rect(4,4,22,32,dk(wood,.32),'x');b.rect(5,5,20,30,pad,'x');
    seam(b,3,4,3,35,lt(wood,.55));seam(b,26.5,4,26.5,35,dk(wood,.18));
    [8,28].forEach(y=>{b.rect(3.5,y,2.5,3,gold,'x');seam(b,4.5,y+.5,4.5,y+2.5,dk(gold,.28))});
    // Double glazing with a small snowflake and diagonal reflections.
    arch(b,15,6,7,18,cream,'x');arch(b,15,7.5,5.5,16.5,[137,181,189],'x');
    seam(b,15,8,15,16.5,cream);seam(b,10,12.5,20,12.5,cream);
    seam(b,10.5,10.5,12,8.5,lt(aqua,.65));seam(b,17.5,15,19.5,12,lt(aqua,.65));
    snow(b,18,10,WH,.9);
    b.rect(7,20,16,12,lt(pad,.15),'x');
    // Small diamond stitches stay inside the padded panel.
    for(let y=21;y<31;y+=3)for(let x=8;x<22;x+=4){
      seam(b,x,y,x+1.5,y+1.5,dk(pad,.12));seam(b,x+1.5,y+1.5,x+3,y,dk(pad,.12));
      b.dot(x+1.5,y+1.5,cream,'x');
    }
    b.ell(22.5,20,1,1.8,dk(wood,.25),'x');b.cap(22.5,19,22.5,21,.5,gold,'x');
    b.cap(22.5,19.5,20.5,19.5,.45,lt(gold,.3),'x');
    b.cap(6.5,34.5,23.5,34.5,1.1,rose,'x');
    for(let x=8;x<24;x+=3)seam(b,x,34,x+.5,35,lt(rose,.45));
    b.rect(3,36.5,24,1,dk(wood,.12),'x');
    [5,25].forEach(x=>{b.ell(x,2.5,.45,.45,gold,'x');b.dot(x,2.25,WH,'x')});
  },
  raintent(b,v,a){
    const cloth=C(a,0,[142,187,180]),lining=[98,134,138],trim=C(a,1,cream),cush=[235,180,169];
    // Broad A-frame canopy; the front remains open above all three beds.
    b.tri(22,2,2,26,42,26,cloth);b.tri(22,5.5,5,26,39,26,lining,'x');
    b.tri(22,3,3.5,25.5,10.5,23,lt(cloth,.2),'x');
    b.tri(22,3,33.5,23,40.5,25.5,dk(cloth,.1),'x');
    b.cap(22,2.5,2.5,26,.65,trim,'x');b.cap(22,2.5,41.5,26,.65,trim,'x');
    seam(b,22,5.5,9,24,lt(cloth,.4));seam(b,22,5.5,35,24,lt(cloth,.25));
    // Rolled entrance flaps, ties, and a little scalloped bunting.
    b.cap(8,19.5,5.5,25,1.1,rose,'x');b.cap(36,19.5,38.5,25,1.1,rose,'x');
    [7,37].forEach(x=>{b.cap(x-1,22,x+1,22,.35,gold,'x');b.cap(x,22,x-.5,24,.25,gold,'x')});
    seam(b,14,15,22,17,cream);seam(b,22,17,30,15,cream);
    [[16,15.5],[20,16.5],[24,16.5],[28,15.5]].forEach((p,i)=>b.tri(p[0]-1,p[1],p[0]+1,p[1],p[0],p[1]+2,i%2?gold:rose,'x'));
    cloud(b,22,10,cream,1.2);[20.5,23.5].forEach(x=>seam(b,x,11.5,x-.5,12.5,aqua));
    // The sleeping plane spans x=1..43 at y=28: anchors 10, 22, 34.
    b.rect(2,27,40,2,[187,144,119]);b.ell(22,28,20.4,.4,cush,'x');
    [10,22,34].forEach((x,i)=>{
      b.ell(x,26,6.2,1.1,i===1?lt(gold,.35):lt(cush,.32),'x');
      seam(b,x-4.5,26,x+4.5,26,lt(cream,.2));
    });
    b.rect(2,28,40,1,cush,'x');seam(b,2.5,28,41,28,cream);
    for(let x=4;x<41;x+=3)b.rect(x,28.5,1,.5,cream,'x');
    [16,28].forEach(x=>seam(b,x,27.5,x,28.5,dk(cush,.2)));
    // Rain beads on the waterproof side panels.
    [[13,12],[9,17],[31,12],[35,17]].forEach(p=>b.cap(p[0],p[1],p[0]-.5,p[1]+1,.3,lt(aqua,.45),'x'));
  },
  hairdryer(b,v,a){
    const shell=C(a,0,rose),on=v==='a1';
    b.ell(7,18,5.3,.35,lt(mint,.08));b.rect(3,17.5,8,1,mint);
    b.rect(5.5,10,3,7.5,cream);seam(b,8,12,8,16,dk(cream,.2));
    b.cap(10.5,12,11,15.5,.35,ink);b.cap(11,15.5,10,17,.35,ink);
    b.cap(5,3,5,2,.6,cream);b.cap(5,2,8,2,.6,cream);b.cap(8,2,8,3,.6,cream);
    b.rect(2,4,4,6,dk(shell,.08));b.ell(7,6.8,4.6,4.5,shell);
    b.rect(1.5,5.5,3,3,cream);b.rect(1.5,6,.5,2,ink,'x');
    b.rect(2.5,6,1,2,gold,'x');
    b.ell(7,6.8,3.5,3.4,cream,'x');b.ell(7,6.8,2.7,2.6,[113,143,149],'x');
    // Four rounded fan blades rotate within the same circular guard.
    for(let i=0;i<4;i++){
      const t=i*Math.PI/2+(on?Math.PI/4:0),dx=Math.cos(t),dy=Math.sin(t);
      b.cap(7+.7*dx,6.8+.7*dy,7+2*dx,6.8+2*dy,.65,lt(mint,.35),'x');
    }
    b.ell(7,6.8,.65,.65,gold,'x');
    [4.7,9.3].forEach(x=>seam(b,x,5.5,x,8,lt(cream,.15)));
    b.ell(7,12.8,.8,.8,ink,'x');b.ell(7,12.8,.4,.4,on?gold:mint,'x');
    b.rect(6,14.5,2,.5,rose,'x');b.rect(6,15.5,2,.5,rose,'x');
    paw(b,7,17.6,cream,.7);b.dot(4,4.5,lt(shell,.65),'x');
  },
  wxstation(b,v,a){
    const body=C(a,0,mint),on=v==='a1',screen=[89,130,142];
    // A weather vane over a freestanding instrument console.
    b.cap(9,2,9,8,.45,gold);b.cap(3.5,4.5,14,4.5,.35,gold);
    b.tri(14.5,4.5,12,3,12,6,rose);b.rect(3,3.5,2.5,2,cream);
    b.ell(9,2,.65,.65,cream);seam(b,4,4,5,5,dk(gold,.25));
    b.rect(7,26,4,6,dk(body,.12));seam(b,8,28,8,31,lt(body,.45));
    b.ell(9,32,6.5,.4,body);b.rect(4,31.5,10,1,body);
    b.rect(2,8,14,19,body);b.cap(3.5,8,14.5,8,1,body);
    b.rect(3,9,12,17,lt(body,.3),'x');
    b.rect(4,10,10,8,cream,'x');b.rect(4.5,10.5,9,7,screen,'x');
    b.ell(7,13,1.5,1.5,gold,'x');
    [[7,10.9,7,11.2],[5,12.5,5.5,12.5],[8.5,11.2,8.2,11.7]].forEach(p=>seam(b,...p,gold));
    cloud(b,on?10:9.5,14,lt(aqua,.45),1.15);
    seam(b,5.5,16.5,8,16.5,lt(mint,.5));seam(b,9,16.5,11.5,16.5,lt(mint,.5));
    // Six forecast cells: sun, cloud, rain, wind, storm, clear.
    for(let i=0;i<6;i++){
      const x=4+(i%3)*3.5,y=19+Math.floor(i/3)*3;
      b.rect(x,y,2.5,2.5,cream,'x');
      if(i===0||i===5)b.ell(x+1,y+1,.65,.65,gold,'x');
      else if(i===1)cloud(b,x+1,y+1.1,ink,.55);
      else if(i===2){cloud(b,x+1,y+.8,sage,.5);seam(b,x+.5,y+1.7,x+.2,y+2,aqua);seam(b,x+1.5,y+1.7,x+1.2,y+2,aqua)}
      else if(i===3){seam(b,x+.3,y+.8,x+1.7,y+.8,sage);seam(b,x+.7,y+1.7,x+2,y+1.7,sage)}
      else{b.tri(x+1.2,y+.2,x+.4,y+1.3,x+1.4,y+1.3,gold,'x');seam(b,x+1.4,y+1.1,x+.8,y+2,gold)}
    }
    b.rect(4,25,7,.5,screen,'x');b.rect(4,25,5.5,.5,sage,'x');
    b.ell(13,25,.55,.55,on?rose:gold,'x');
    [3,15].forEach(x=>[9,26].forEach(y=>b.dot(x,y,dk(body,.28),'x')));
  },
  shadetree(b,v,a){
    const leaf=C(a,0,[143,181,126]),wood=C(a,1,[185,139,104]),deep=dk(leaf,.2),light=lt(leaf,.22);
    // Tapered trunk, forked boughs and spreading roots beneath the canopy.
    b.tri(18,28,16,57.5,24,57.5,wood);b.rect(18,28,5,29,wood);
    b.cap(19.5,39,11,25,1.7,wood);b.cap(21,36,29,24,1.6,wood);
    b.tri(18,52,11,58,20,58,wood);b.tri(22,52,29,58,20,58,wood);
    seam(b,18.5,40,18,54,lt(wood,.3));seam(b,22,39,22.5,53,dk(wood,.25));
    seam(b,20,47,19.5,49,dk(wood,.25));seam(b,15,56.5,18,55,dk(wood,.2));
    b.ell(20.5,43,1.1,1.8,dk(wood,.22),'x');b.ell(20.5,43,.55,1.1,wood,'x');
    // Large layered crown, with a darker cool underside.
    b.ell(11,25,8.8,10,deep);b.ell(29,25,8.7,10,deep);b.ell(20,29,12,8,deep);
    b.ell(10,18,8,9,leaf);b.ell(29,17.5,8.6,9.5,leaf);b.ell(20,13,12.2,11.2,leaf);
    b.ell(8.5,22,6.5,7.5,leaf);b.ell(32,23,5.5,7.4,leaf);
    b.ell(18,24,9,8,leaf);b.ell(26,27,6.6,6.5,leaf);
    b.ell(16,10,6.5,6,light,'x');b.ell(9,17,4.5,5,light,'x');b.ell(26,15,6.2,5,light,'x');
    b.ell(16,23,5,4.8,lt(leaf,.1),'x');b.ell(31,23,3.5,3,lt(leaf,.12),'x');
    // Paired leaves, dappled highlights, and scattered cream blossoms.
    [[14,7],[23,8],[7,16],[19,17],[30,15],[12,27],[24,24],[31,29],[18,31]].forEach((p,i)=>{
      const c=i%3?lt(leaf,.32):deep;
      b.ell(p[0]-.7,p[1],1.1,.55,c,'x');b.ell(p[0]+.8,p[1]-.7,.6,1,c,'x');
      seam(b,p[0]-.6,p[1]+.7,p[0]+.7,p[1]-.7,lt(leaf,.48));
    });
    [[12,12],[26,19],[7,24],[21,28],[32,20]].forEach(p=>{
      [[-.7,0],[.7,0],[0,-.7],[0,.7]].forEach(d=>b.ell(p[0]+d[0],p[1]+d[1],.55,.55,cream,'x'));
      b.ell(p[0],p[1],.35,.35,gold,'x');
    });
    // Tiny bird shelter suspended from the lower right branch.
    b.cap(27.5,33,27.5,38,.25,dk(wood,.2),'x');b.rect(25,38,5,5,cream);
    b.tri(24.5,38,27.5,35.5,30.5,38,rose);b.ell(27.5,39.5,.9,1,ink,'x');
    b.cap(27.5,41,27.5,42,.3,wood,'x');b.rect(24.5,43,6,.5,wood,'x');
    [10,29].forEach((x,i)=>{
      b.cap(x,56.5,x,58,.45,cream);b.ell(x,56,1.5,.8,i?gold:rose);b.dot(x-.5,55.75,WH,'x');
    });
    b.cap(13,58,14,56.5,.35,sage);b.cap(27,58,26.5,56.5,.35,sage);
  },
  waterbowl(b,v,a){
    const c=C(a,0,rose),full=v==='full';
    b.ell(8,6,5.7,.35,dk(c,.12));b.ell(8,4.8,6.4,1.6,c);
    b.ell(8,3.2,6.5,1.7,cream,'x');b.ell(8,3.1,5.3,1.15,full?aqua:[195,164,146],'x');
    b.ell(8,3.4,4.6,.65,full?lt(aqua,.14):[223,194,171],'x');
    if(full){b.cap(4.5,2.8,7,2.6,.25,WH,'x');b.cap(9.5,3.5,11.5,3.3,.2,lt(aqua,.65),'x');b.dot(11.5,2.7,WH,'x')}
    else seam(b,5.5,3.8,10.5,3.8,[192,157,136]);
    seam(b,3,5,4,5.5,lt(c,.45));paw(b,8,5.5,cream,.7);
  },
  thermobottle(b,v,a){
    const c=C(a,0,mint),full=v==='full';
    // Insulated flask with ribbed screw cap, side handle and level window.
    b.cap(9,4.5,10,5.5,.55,dk(c,.12));b.cap(10,5.5,10,9,.55,dk(c,.12));b.cap(10,9,9,10,.55,dk(c,.12));
    b.rect(2.5,4,6.5,10,c);b.ell(5.8,4,3.1,1.1,c);b.ell(5.8,13.7,3.1,.8,c);
    b.rect(3,1.5,5.5,2.5,[185,173,204]);b.ell(5.7,1.8,2.6,.65,[205,192,221]);
    [4,5.5,7].forEach(x=>seam(b,x,2.2,x,3.5,lt(PUR,.45)));
    b.rect(3,4,5.5,.7,cream,'x');snow(b,5.8,6,cream,.8);
    b.rect(3.5,7.5,4.5,5.5,cream,'x');b.rect(4,8,3.5,4.5,full?aqua:[199,186,164],'x');
    if(full){b.rect(4,8,3.5,.5,lt(aqua,.6),'x');seam(b,4.5,9,4.5,11.5,lt(aqua,.65));b.dot(6.5,9,WH,'x')}
    else b.rect(4,11.5,3.5,1,[222,208,184],'x');
    [9,10.5,12].forEach(y=>b.rect(7,y,1,.5,dk(c,.18),'x'));
    seam(b,3,6,3,12,lt(c,.35));b.rect(3,14,5.5,.5,cream,'x');
  },
  waterfilter(b,v,a){
    const c=C(a,0,mint),full=v==='full',on=v==='a1';
    // Rear filter cartridge and a curved faucet above the drinking tray.
    b.rect(12,3,5,9,c);b.ell(14.5,3,2.5,1.3,lt(c,.12));
    b.ell(14.5,2,2.4,.65,cream,'x');b.rect(13,4,3,4,cream,'x');
    b.rect(13.5,4.5,2,3,full?lt(aqua,.1):[205,194,171],'x');
    [5,6,7].forEach(y=>b.rect(14,y,1,.5,full?aqua:cream,'x'));
    b.cap(12,5,8,5,.8,cream);b.cap(8,5,6,6,.8,cream);b.cap(6,6,6,7.5,.65,cream);
    seam(b,8,5,11.5,5,lt(c,.4));b.rect(5.5,7.5,1,.5,ink,'x');
    b.ell(14.5,9.5,.7,.7,ink,'x');b.ell(14.5,9.5,.35,.35,on?gold:sage,'x');
    b.ell(10,13.8,8,.7,dk(c,.08));b.ell(10,12.1,8.5,2.2,c);
    b.ell(10,11.5,8.2,1.8,cream,'x');b.ell(10,11.5,7,1.1,full?aqua:[191,173,153],'x');
    b.ell(10,11.8,6,.65,full?lt(aqua,.18):[221,202,179],'x');
    if(full){b.cap(4.5,11.2,7.5,11,.25,WH,'x');b.cap(10,12,13,11.8,.2,lt(aqua,.65),'x')}
    if(on){b.cap(6,8.7,6,9.4,.35,aqua,'x');b.dot(5.5,10.5,lt(aqua,.6),'x');b.dot(6.5,10.5,lt(aqua,.6),'x')}
    paw(b,10,13.5,cream,.8);seam(b,3.5,12.5,4,13,lt(c,.45));
  },
  whitenoise(b,v,a){
    const c=C(a,0,[191,180,210]),on=v==='a1',face=lt(cream,.1);
    b.rect(3,9.5,6,1.5,[198,162,126]);
    b.ell(6,5.3,4.5,4,c);b.rect(2,5,8,4,c);b.ell(6,8.5,4,1.2,c);
    b.ell(6,5.5,3.4,3,face,'x');b.ell(6,5.3,2.6,2.2,lt(c,.1),'x');
    // Moon emblem surrounded by tiny speaker perforations.
    b.ell(5.8,4.7,1.1,1.2,gold,'x');b.ell(6.5,4.2,.9,1.1,lt(c,.1),'x');
    [[4,4],[4,5.5],[4.5,6.5],[5.5,7],[6.5,7],[7.5,6.5],[8,5.5],[8,4]].forEach(p=>b.dot(p[0],p[1],ink,'x'));
    b.cap(4,8.8,5,8.8,.3,on?gold:sage,'x');b.ell(7.5,8.7,.65,.65,cream,'x');
    seam(b,7.5,8.3,7.5,8.7,ink);
    // A shifting sound meter is contained in the housing in both frames.
    [0,1,2].forEach(i=>b.rect(8.5-i*.6,3.5+(on?i%2:1-i%2)*.5,.5,.5,WH,'x'));
    b.dot(3,3,lt(c,.55),'x');
  }
});
})();
