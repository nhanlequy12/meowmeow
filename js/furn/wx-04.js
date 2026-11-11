"use strict";
/* Hình thiết bị thời tiết nhóm 04 (Codex vẽ). Nạp sau js/art.js. */
(()=>{const {dk,lt,hex,WH,WOOD,WOOD2,CRMF,DWOOD}=Art.K;
const ICE=hex('#c8edf0'),AQUA=hex('#83c8cc'),TEAL=hex('#548f98'),DEEP=hex('#536f7c'),
  MINT=hex('#b8d8bf'),CREAM=hex('#fff3db'),PEACH=hex('#edbb9c'),ROSE=hex('#d79a9c'),
  LILAC=hex('#c8bbdc'),BLUE=hex('#a1cce2'),GOLD=hex('#e9c477');
// Rounded blocks keep their exact bounds, including on the doubled bead grid.
function box(b,x,y,w,h,r,c,z){b.rect(x+r,y,w-2*r,h,c,z);b.rect(x,y+r,w,h-2*r,c,z);
  for(const cx of [x+r,x+w-r])for(const cy of [y+r,y+h-r])b.ell(cx-.5,cy-.5,r-.25,r-.25,c,z)}
function seam(b,x,y,xx,yy,c){b.cap(x,y,xx,yy,.22,c,'x')}
function snow(b,x,y,s,c){for(const [dx,dy] of [[s,0],[s*.5,s*.8],[s*.5,-s*.8]])seam(b,x-dx,y-dy,x+dx,y+dy,c)}
function drop(b,x,y,s,c){b.tri(x,y-s,x-s*.65,y+s*.15,x+s*.65,y+s*.15,c,'x');b.ell(x,y+s*.1,s*.6,s*.7,c,'x')}
function leaf(b,x,y,c){b.ell(x,y,1.6,.85,c,'x');seam(b,x-1,y+.4,x+1,y-.4,lt(c,.5))}
Art.addFurn({
  coolmat(b,v,a){
    // The two broad quilt pads end at y=6: cat anchors (13,6), (35,6).
    box(b,1.5,2,45,5,1.8,TEAL);
    box(b,2,1.5,44,4.8,1.6,AQUA);
    for(const x of [3,25]){
      box(b,x,2,20,4,1.3,ICE,'x');
      for(let k=0;k<4;k++)seam(b,x+2+k*4.5,2.7,x+3+k*4.5,4.9,lt(AQUA,.22));
      seam(b,x+2,5.5,x+17,5.5,WH);
      snow(b,x+9,3.6,1.2,TEAL);
    }
    seam(b,24,2.7,24,5.8,TEAL);
    b.rect(42,4.5,3,1.5,CREAM,'x');b.set(43,4.5,MINT,'x');
    for(let x=5;x<40;x+=4)b.dot(x,6.4,lt(AQUA,.55),'x');
  },
  coolbed(b,v,a){
    // Raised back bolster; the uninterrupted mattress front is at y=11.
    box(b,3,10,28,4.5,1.5,TEAL);
    box(b,2,3,30,9,3,AQUA);
    box(b,4,4,26,6,2,ICE,'x');
    box(b,5,6.5,24,5,2,lt(BLUE,.3),'x');
    b.ell(16.5,8.3,10.4,1.6,lt(ICE,.48),'x');
    for(const x of [6,28]){b.ell(x,8.2,2.2,3,AQUA);seam(b,x-.7,6.4,x-.7,9.4,lt(ICE,.45))}
    seam(b,8,11,26,11,TEAL);
    box(b,12,11.5,10,2,.6,CREAM,'x');snow(b,16.8,12.2,.8,TEAL);
    b.set(25.5,12,MINT,'x');b.dot(26,12,WH,'x');
    for(const x of [6,26])box(b,x,13.5,2,1.5,.5,WOOD2);
    for(const x of [10,23]){b.dot(x,5,WH,'x');b.dot(x+.5,5.5,WH,'x')}
  },
  airpurifier(b,v,a){
    const on=v==='a1';
    for(const x of [4,10])box(b,x,25,2,2,.5,WOOD2);
    box(b,2,5,12,21,2.5,CRMF);
    box(b,3,5.5,10,2.5,1,MINT,'x');
    seam(b,5,6.5,8,6.5,TEAL);b.set(10,6,on?GOLD:AQUA,'x');
    b.ell(7.5,12,4.2,4.2,AQUA,'x');b.ell(7.5,12,3.5,3.5,DEEP,'x');
    for(let i=0;i<4;i++){
      const t=i*Math.PI/2+(on?Math.PI/4:0),cx=7.5,cy=12;
      b.cap(cx+Math.cos(t),cy+Math.sin(t),cx+Math.cos(t+.45)*2.8,cy+Math.sin(t+.45)*2.8,.85,lt(MINT,.22),'x');
    }
    b.ell(7.5,12,.9,.9,CREAM,'x');
    for(const x of [5.5,7.5,9.5])seam(b,x,9,x,15,lt(TEAL,.12));
    seam(b,4.5,11,10.5,11,TEAL);seam(b,4.5,13,10.5,13,TEAL);
    leaf(b,7.5,18,MINT);
    for(let y=21;y<24;y+=1.2)seam(b,4.5,y,11,y,TEAL);
    for(let i=0;i<3;i++){
      const x=4+i*3;seam(b,x,3.6,x+(on?.8:-.5),2.4,lt(AQUA,.35));
      b.dot(x+(on?1:0),1.5,ICE,'x');
    }
  },
  sunblind(b,v,a){
    // A warm wooden roller and woven, sun-blocking sage fabric.
    box(b,2,1.5,26,3.5,1.2,WOOD);
    for(const x of [3.5,25]){b.rect(x,2.5,1.5,2,DWOOD,'x');b.dot(x+.5,3,CREAM,'x')}
    b.rect(4,5,21,23,MINT);
    b.rect(4,5,2,23,lt(MINT,.26),'x');b.rect(23,5,2,23,dk(MINT,.1),'x');
    for(let y=7;y<27;y+=2.5){seam(b,6,y,23,y,dk(MINT,.16));seam(b,6,y+.6,22,y+.6,lt(MINT,.3))}
    for(let x=8;x<23;x+=4)for(let y=8;y<26;y+=5)b.dot(x,y,lt(CREAM,.1),'x');
    // Embroidered sun and leafy hem stay quiet against the slats.
    b.ell(14,12,2.3,2.3,CREAM,'x');b.ell(14,12,1.4,1.4,GOLD,'x');
    for(const [dx,dy] of [[0,-3],[0,3],[-3,0],[3,0]])b.dot(14+dx,12+dy,GOLD,'x');
    box(b,3.5,27,22,2.2,.7,WOOD);
    seam(b,6,28,22,28,WOOD2);
    seam(b,27,5,27,29,DWOOD);
    for(let y=7;y<28;y+=2)b.dot(27,y,CREAM,'x');
    box(b,26,28.5,2,3,1,PEACH);b.dot(26.5,30,CREAM,'x');
  },
  dehumid(b,v,a){
    const on=v==='a1';
    for(const x of [3.5,10.5])box(b,x,21,2,2,.5,WOOD2);
    box(b,2,4,12,18,2.2,CREAM);
    box(b,4,2,8,3,1.2,PEACH);seam(b,5.5,3,9.5,3,dk(PEACH,.25));
    box(b,3,5,10,2.5,.8,PEACH,'x');
    b.set(4.5,5.5,on?MINT:AQUA,'x');b.rect(7,5.5,3,1,DEEP,'x');
    b.dot(on?8.5:7.5,5.5,ICE,'x');b.dot(11,5.5,GOLD,'x');
    for(let y=9;y<=12;y+=1.3)seam(b,4.2,y,11.4,y,TEAL);
    seam(b,3.2,13.5,12.6,13.5,dk(PEACH,.25));
    box(b,3.5,14.5,9,5.8,1,lt(BLUE,.15),'x');
    box(b,4,17,8,3,1,BLUE,'x');
    seam(b,4.5,17,11.5,17,lt(ICE,.3));
    drop(b,on?8:7,15.1,.65,TEAL);
    seam(b,5,18,5,19.2,WH);seam(b,10.5,18.5,11,18.5,TEAL);
    box(b,6,20,4,1,.4,PEACH,'x');
  },
  humidifier(b,v,a){
    const on=v==='a1';
    // A ceramic pebble reservoir, wooden foot and a clearly visible mist spout.
    box(b,3,17,8,2,.8,WOOD2);
    box(b,2,9,10,9,3,ICE);
    b.ell(6.5,10,4,3,CRMF);b.rect(4,8,6,3,CRMF);
    box(b,5,6.5,4,2.5,.8,MINT);
    seam(b,6,7,8,7,TEAL);
    box(b,4.5,12,5,3.5,1,BLUE,'x');
    seam(b,5.5,13,5.5,14,WH);drop(b,7.2,13.1,.65,lt(ICE,.45));
    b.set(6,16,on?MINT:GOLD,'x');b.dot(6.5,16,WH,'x');
    const mist=lt(ICE,.48);
    b.cap(6.7,5.5,on?7.1:6.3,4.5,.6,mist,'x');
    b.ell(on?7.1:6.1,3.8,1.1,.75,mist,'x');
    b.ell(on?6.1:7.3,2.7,1.2,.8,mist,'x');
    b.ell(on?7:6.2,1.7,1,.5,mist,'x');
  },
  balconyroof(b,v,a){
    // Rear bracket and curved striped canvas with a scalloped valance.
    for(const x of [8,69]){
      b.rect(x,8,2,6,WOOD2);b.tri(x,9,x+7,9,x,14,WOOD);
      seam(b,x+.6,10,x+4,10,DWOOD);b.dot(x+.5,12.5,CREAM,'x');
    }
    box(b,3,1.5,74,2,1,WOOD);
    b.rect(7,3.5,66,1.5,CREAM);
    b.rect(5,5,70,1.5,CREAM);b.rect(3,6.5,74,2,CREAM);b.rect(1.5,8.5,77,2,CREAM);
    const bands=[PEACH,CREAM,MINT,CREAM,PEACH,CREAM,MINT,CREAM,PEACH,CREAM,MINT];
    for(let i=0;i<11;i++){
      const x=7+i*6,c=bands[i];
      b.rect(x,3.5,6,1.5,lt(c,.2),'x');b.rect(5+i*6.36,5,6.36,1.5,c,'x');
      b.rect(3+i*6.72,6.5,6.72,2,c,'x');b.rect(1.5+i*7,8.5,7,2,c,'x');
      b.rect(1.5+i*7,10.5,7,1,dk(c,.06));
      b.ell(4.5+i*7,10.6,3.25,2,dk(c,.06));
      seam(b,3+i*7,11.8,6+i*7,11.8,lt(c,.35));
    }
    seam(b,2,9,77,9,dk(PEACH,.23));
    box(b,34,8.5,12,2.5,.7,CREAM,'x');
    leaf(b,38.2,9.4,TEAL);b.dot(42,9.5,GOLD,'x');
  },
  raincurtain(b,v,a){
    // Reinforced blue vinyl panels and a rolled, tied-back side flap.
    box(b,2,1.5,32,2.5,.8,WOOD);
    for(const x of [5,12,19,26,31]){b.ell(x,4,.65,1,GOLD,'x');b.dot(x,3.5,CREAM,'x')}
    b.rect(3.5,5,28.5,29,BLUE);
    b.rect(5,5,25,27,lt(ICE,.15),'x');
    for(const x of [5,13,21,29])b.rect(x,5,1,28,AQUA,'x');
    // Broad pearl reflections read as clear, flexible rain shielding.
    for(const x of [7,15,23]){
      seam(b,x,8,x+2,6,WH);seam(b,x,11,x+4,7,lt(ICE,.6));
      seam(b,x,24,x+2,22,lt(ICE,.55));
      for(const y of [14,20,27]){
        const dx=x+1+(y===20?1:0);
        drop(b,dx,y,1.1,lt(TEAL,.23));
        b.dot(dx+.5,y+.2,WH,'x');
      }
    }
    b.rect(3.5,31.5,28.5,2.5,AQUA,'x');
    for(let x=6;x<30;x+=3)b.dot(x,32.5,CREAM,'x');
    box(b,3,33.5,29.5,1.5,.6,WOOD2);
    // Rolled edge is visibly fabric rather than another window mullion.
    box(b,28,5,4,26,1.5,lt(BLUE,.18));
    seam(b,30,7,30,29,AQUA);
    b.rect(27.5,18,5,2,CREAM,'x');
    b.ell(29.6,19,.65,.65,GOLD,'x');
    b.tri(30.5,19,33,20,32,21.5,CREAM,'x');
  }
});
})();
