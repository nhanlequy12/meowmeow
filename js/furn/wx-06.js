"use strict";
/* Hình thiết bị thời tiết nhóm 06 (Codex vẽ). Nạp sau js/art.js. */
(()=>{const {C,H,mix,dk,lt,hex,WH,EY,RED,NAVY,GOLDC,PINK,PUR,WOOD,WOOD2,CRMF,DWOOD,GRN,GRN2,STEM,TERRA,SAND,GLASS,HOLE,arch,star5}=Art.K;
const cream=[255,242,217],ivory=[255,250,235],rose=[231,143,153],coral=[229,126,105],gold=[232,187,101],
  mint=[148,201,178],teal=[78,143,144],blue=[151,199,220],ink=[77,100,119],lilac=[190,166,209],brown=[153,109,91];
// Rounded fabric and enamel shapes; all seams and badges stay inside their body.
const box=(b,x,y,w,h,r,c,reg)=>{b.rect(x+r,y,w-2*r,h,c,reg);b.rect(x,y+r,w,h-2*r,c,reg);for(const xx of [x+r,x+w-r])for(const yy of [y+r,y+h-r])b.ell(xx,yy,r,r,c,reg)};
const seam=(b,x0,y0,x1,y1,c)=>b.cap(x0,y0,x1,y1,.22,c,'x');
const cross=(b,x,y,s,c)=>{b.rect(x-s/2,y-s*1.5,s,s*3,c,'x');b.rect(x-s*1.5,y-s/2,s*3,s,c,'x')};
const flake=(b,x,y,r,c)=>{for(let i=0;i<3;i++){const t=i*Math.PI/3,dx=Math.cos(t)*r,dy=Math.sin(t)*r;seam(b,x-dx,y-dy,x+dx,y+dy,c)}b.set(x,y,c,'x')};
const drop=(b,x,y,r,c)=>{b.tri(x,y-r*1.8,x-r,y,x+r,y,c,'x');b.ell(x,y,r,r,c,'x');b.dot(x-r*.3,y-r*.2,lt(c,.55),'x')};
const paw=(b,x,y,s,c)=>{b.ell(x,y+s*.5,s*.9,s*.65,c,'x');for(const [dx,dy] of [[-.9,-.4],[0,-.8],[.9,-.4]])b.ell(x+dx*s,y+dy*s,s*.33,s*.4,c,'x')};
const heart=(b,x,y,s,c)=>{b.ell(x-s*.45,y,s*.55,s*.55,c,'x');b.ell(x+s*.45,y,s*.55,s*.55,c,'x');b.tri(x-s,y,x+s,y,x,y+s*1.15,c,'x')};
const steam=(b,x,y,c)=>{seam(b,x,y,x-.5,y-1,c);seam(b,x-.5,y-1,x+.5,y-2,c);seam(b,x+.5,y-2,x,y-3,c)};
const lid=(b,x,y,w,c)=>{box(b,x,y,w,2,.55,c);seam(b,x+1,y+.6,x+w-1,y+.6,lt(c,.4))};
const bottle=(b,c,cap)=>{box(b,4,5,8,9,1.6,c);b.tri(4.5,5.5,6,3.5,10,3.5,c);b.tri(10,3.5,11.5,5.5,4.5,5.5,c);b.rect(6,3,4,2,c);lid(b,5.5,1.5,5,cap);seam(b,5,6,5,10,lt(c,.5))};
const fan=(b,x,y,on)=>{b.ell(x,y,2.1,2.1,teal,'x');b.ell(x,y,1.65,1.65,cream,'x');for(let i=0;i<3;i++){const t=i*Math.PI*2/3+(on?.7:0);b.cap(x+Math.cos(t)*.45,y+Math.sin(t)*.45,x+Math.cos(t)*1.25,y+Math.sin(t)*1.25,.42,blue,'x')}b.ell(x,y,.45,.45,gold,'x')};
Art.addFurn({
  premiumpad(b,v,a){
    const c=C(a,0,[220,164,174]),p=C(a,1,cream);
    box(b,2,7,40,5.5,2,dk(c,.12));
    b.ell(12,6.5,10,4.5,c);b.ell(32,6.5,10,4.5,c);b.rect(12,2.5,20,6,c);
    seam(b,5,5,19,5,lt(c,.45));seam(b,25,5,39,5,lt(c,.45));
    b.ell(12,8.5,9.3,2.5,p,'x');b.ell(32,8.5,9.3,2.5,p,'x');
    for(const x of [12,32]){b.ell(x,8,7.7,1.7,lt(p,.35),'x');seam(b,x-7,10,x+7,10,gold)}
    for(const x of [5,9,15,19,25,29,35,39])b.dot(x,11.6,lt(c,.45),'x');
    box(b,20.5,5,3,6,1,c,'x');b.ell(22,8,1,.8,gold,'x');
    // Tiny crown on the upholstered central crest.
    b.rect(20,3.3,4,1,gold,'x');b.tri(20,3.5,19.5,1.8,21.5,3.5,gold,'x');b.tri(21,3.5,22,1.5,23,3.5,gold,'x');b.tri(22.5,3.5,24.5,1.8,24,3.5,gold,'x');
    seam(b,5,12,39,12,gold);b.rect(19.5,11.5,5,1.3,cream,'x');paw(b,22,12,.45,brown);
  },
  smartbed(b,v,a){
    const c=C(a,0,[159,200,188]),on=v==='a1';
    box(b,3,4,42,13,3,c);box(b,5,5,38,9,2,lt(c,.3),'x');
    for(const x of [6,40])box(b,x,18.5,2,2,.55,brown);
    box(b,2,14,44,6,2,cream);seam(b,5,19.2,43,19.2,gold);
    fan(b,9,8,on);fan(b,39,8,on);
    // One shared controller, with warm/cool zone indicators.
    box(b,19.5,2,9,7,1.5,cream);box(b,21,3,6,3.5,.65,ink,'x');
    b.rect(22,4,1.5,.5,mint,'x');b.rect(23,4, .5,1.5,mint,'x');b.rect(22,5.5,1.5,.5,mint,'x');
    b.rect(24.5,4,1.5,.5,mint,'x');b.rect(24.5,4.5,.5,1.5,mint,'x');b.rect(24.5,5.5,1.5,.5,mint,'x');
    b.ell(22,7.5,.5,.5,on?coral:gold,'x');b.ell(26,7.5,.5,.5,on?blue:teal,'x');
    for(const x of [13,35]){box(b,x-7.5,11,15,4,1.6,x===13?[242,204,184]:[205,224,232],'x');seam(b,x-6,12,x+6,12,ivory);b.ell(x,15.3,9.5,2.3,x===13?[255,229,207]:[224,240,238],'x');seam(b,x-7.5,16,x+7.5,16,x===13?gold:blue)}
    seam(b,24,11,24,16.5,dk(c,.22));
    box(b,19.5,17,9,2, .7,dk(c,.25),'x');for(let x=21;x<=27;x+=1.5)seam(b,x,17.6,x,18.5,cream);
    b.ell(6,17.7,.6,.6,on?gold:mint,'x');b.ell(42,17.7,.6,.6,on?mint:gold,'x');
    flake(b,35,10,1,teal);b.ell(13,10,.9,.9,gold,'x');for(const x of [11.5,14.5])b.set(x,10,coral,'x');
  },
  thermostat(b,v,a){
    const on=v==='a1';box(b,1.5,1.5,7,11,1.6,cream);seam(b,2.5,3,7.5,3,ivory);
    box(b,2.5,3.5,5,3.5,.65,ink,'x');
    for(const x of [3,5.5]){b.rect(x,4,1.5,.5,mint,'x');b.rect(x+1,4.5,.5,.5,mint,'x');b.rect(x,5,1.5,.5,mint,'x');b.rect(x,5.5,.5,.5,mint,'x');b.rect(x,6,1.5,.5,mint,'x')}
    b.ell(5,9.2,1.65,1.65,gold,'x');b.ell(5,9.2,1.1,1.1,ivory,'x');
    seam(b,5,9.2,on?5.7:4.3,8.5,teal);b.set(2.5,8,coral,'x');b.set(7,8,blue,'x');
    b.ell(3.5,11.5,.35,.35,on?mint:dk(mint,.3),'x');for(const x of [5,6,7])b.dot(x,11.5,brown,'x');
  },
  sensor(b,v,a){
    box(b,1.5,1.5,7,9,1.6,cream);box(b,2.5,3,5,4,.7,lt(blue,.45),'x');
    b.cap(3.5,4,3.5,6,.35,coral,'x');b.ell(3.5,6,.65,.65,coral,'x');drop(b,6,5.5,.75,teal);
    for(const x of [3,4.5,6])seam(b,x,8,x+.7,8,brown);b.ell(6.8,9.2,.45,.45,mint,'x');
    b.dot(3,2,ivory,'x');b.dot(7,2,ivory,'x');
  },
  sp_scarf(b,v,a){
    box(b,3,6,4.5,7.5,1,rose);box(b,8.5,5,4,7,1,dk(rose,.08));
    box(b,2,2.5,11.5,5.5,2,[241,168,164]);
    seam(b,3.5,4,12,4,cream);seam(b,4,6,11.5,6,cream);
    for(const y of [9,11]){b.rect(3,y,4.5,1,gold,'x');b.rect(8.5,y-1,4,1,cream,'x')}
    for(const x of [3.5,5,6.5])b.cap(x,13,x,14,.25,cream,'x');for(const x of [9,10.5,12])b.cap(x,11.5,x,13,.25,gold,'x');
    box(b,6.5,4.5,3,3,1,coral,'x');b.dot(7.5,5,cream,'x');
  },
  sp_handwarmer(b,v,a){
    box(b,3.5,4,9,10,2.5,[227,167,150]);lid(b,6,2,4,gold);
    box(b,5,6,6,5.5,1.5,cream,'x');b.tri(6,10,8.5,6.5,10,10,coral,'x');b.ell(8,10,2,1.5,coral,'x');
    b.tri(7,10.5,8,8.5,9,10.5,gold,'x');b.ell(8,10.5,1,.8,gold,'x');
    seam(b,5,5,5,7,lt(rose,.65));for(const x of [6,8,10])b.dot(x,12.5,cream,'x');
    seam(b,12.5,5,13.5,4,gold);seam(b,13.5,4,13.5,2.5,gold);
  },
  sp_coldmed(b,v,a){
    box(b,2.5,3.5,11,9,1.5,[197,215,220]);box(b,3.5,4.5,9,7,1,cream,'x');
    for(const y of [6.5,9.5]){b.ell(5.5,y,1.8,1.15,dk(blue,.16),'x');b.cap(4.8,y,6.3,y,.8,ivory,'x');b.cap(4.8,y,5.4,y,.8,rose,'x');b.dot(6.5,y-.3,WH,'x')}
    cross(b,10,6.5,.65,rose);flake(b,10,9.5,1.2,teal);
    seam(b,3.5,3.5,11.5,3.5,ivory);b.dot(12.5,11.5,blue,'x');
  },
  sp_hotsoup(b,v,a){
    b.ell(8,12,5,2,dk(coral,.1));b.rect(3,6,10,6,coral);b.ell(8,6,5,1.8,cream);
    b.ell(8,6,4,1.1,gold,'x');b.ell(8,6.3,3.5,.7,[239,172,89],'x');
    for(const [x,y,c] of [[5.5,6,mint],[8.5,5.7,coral],[10,6.4,cream]])b.rect(x,y,1,.5,c,'x');
    b.rect(3.5,8,9,3,cream,'x');b.ell(8,9.5,2.4,1,gold,'x');b.cap(5.8,9,10.2,9,.25,teal,'x');
    b.ell(7.5,4.5,.5,.3,ivory,'x');steam(b,6,4.5,ivory);steam(b,10,4,ivory);
    seam(b,4,12,12,12,gold);b.dot(4,7,ivory,'x');
  },
  sp_cooltowel(b,v,a){
    box(b,2,6,11,7.5,1.2,dk(blue,.12));box(b,3,3,10,8,1.5,blue);
    b.ell(5,4.5,2,1.5,lt(blue,.5),'x');b.ell(5,4.5,1.1,.65,teal,'x');b.ell(5,4.5,.5,.3,blue,'x');
    b.rect(3,9,10,1.2,ivory,'x');seam(b,3.5,12,11.5,12,cream);
    flake(b,9,6.5,1.6,ivory);for(const x of [4,6,8,10,12])b.cap(x,13,x,14,.25,cream,'x');
    drop(b,13.3,4.5,.65,teal);
  },
  sp_electrolyte(b,v,a){
    bottle(b,[179,218,216],teal);box(b,4.5,7,7,4.5,.6,cream,'x');
    drop(b,7,9.2,1.1,blue);b.tri(9.5,7.5,8,9.5,10,9.5,gold,'x');b.tri(9,9,10.5,9,9,11,gold,'x');
    seam(b,7,2.5,9,2.5,lt(teal,.5));b.ell(9.5,12.5,.5,.4,ivory,'x');b.ell(6.5,12.5,.4,.3,ivory,'x');
  },
  sp_heatmed(b,v,a){
    // Diagonal syringe with capped blue needle, clear barrel and sun label.
    b.cap(4,12,5.5,10.5,.7,teal);b.cap(3,13,4,12,.35,blue);
    b.cap(6,10,10.5,5.5,1.8,[215,235,234]);b.cap(6,10,8,8,1.2,blue,'x');
    seam(b,5.5,8.5,7.5,10.5,ivory);seam(b,7,7,9,9,teal);seam(b,8,6,10,8,teal);
    b.cap(8.5,4.5,11.5,7.5,.55,coral);b.cap(10.5,5.5,12.5,3.5,.65,cream);b.cap(11.3,2.3,13.7,4.7,.65,rose);
    b.ell(4,4,1.2,1.2,gold,'x');for(const [x,y] of [[2,4],[4,2],[6,4],[4,6]])b.dot(x,y,coral,'x');
  },
  sp_coolgel(b,v,a){
    box(b,3.5,3,9,8,1.5,[167,213,205]);b.tri(4,10,12,10,9.5,12.5,mint);b.tri(4,10,6.5,12.5,9.5,12.5,mint);
    lid(b,5.5,12,5,teal);box(b,4.5,4.5,7,5,.8,cream,'x');drop(b,8,7,1.6,blue);flake(b,8,7,1,ivory);
    for(const [x,y,r] of [[5.5,6,.35],[10,8,.5],[13,2.5,.7],[2.5,10.5,.5]])b.ell(x,y,r,r,lt(blue,.5),'x');
    seam(b,5,3.5,10.5,3.5,ivory);seam(b,7,13,9,13,lt(teal,.5));
  },
  sp_raincoat(b,v,a){
    b.ell(8,4.5,3,3,[241,205,111]);b.ell(8,4.5,1.8,2,[199,161,100],'x');
    b.tri(5,5,2,8,3,11,gold);b.tri(11,5,14,8,13,11,gold);
    b.tri(5,5,3.5,13.5,12.5,13.5,[248,215,126]);b.tri(5,5,11,5,12.5,13.5,[248,215,126]);
    seam(b,8,6.5,8,13,cream);for(const y of [7.5,9.5,11.5])b.ell(8,y,.35,.35,brown,'x');
    b.rect(4.5,9,2,2,lt(gold,.3),'x');b.rect(9.5,9,2,2,lt(gold,.3),'x');seam(b,4.5,9,6.5,9,cream);seam(b,9.5,9,11.5,9,cream);
    seam(b,4,12.5,7,12.5,ivory);seam(b,9,12.5,12,12.5,ivory);b.set(12.5,6,blue,'x');
  },
  sp_drybag(b,v,a){
    b.cap(4,5.5,2.5,10.5,.65,dk(teal,.08));b.cap(12,5.5,13.5,10.5,.65,dk(teal,.08));
    box(b,3.5,3.5,9,10.5,2,mint);box(b,3,2.5,10,2.5,.8,teal);seam(b,4.5,3.5,11.5,3.5,lt(mint,.55));
    box(b,6.5,3,3,2.5,.45,gold,'x');b.rect(7.5,3.5,1,1,teal,'x');
    box(b,5,7,6,5,1,lt(mint,.25),'x');drop(b,8,9.5,1.3,teal);seam(b,5,12.5,11,12.5,cream);
    seam(b,4.5,6,4.5,10,lt(mint,.6));
  },
  sp_immunity(b,v,a){
    bottle(b,[205,215,178],lilac);box(b,4.5,6.5,7,5.5,.8,cream,'x');
    b.rect(6,7.5,4,2.5,mint,'x');b.tri(6,10,10,10,8,11.5,mint,'x');cross(b,8,9,.65,ivory);
    b.ell(6,5.5,.5,.35,lt(mint,.6),'x');b.dot(10.5,12.5,gold,'x');
    for(const x of [6.5,8,9.5])seam(b,x,2,x,2.7,lt(lilac,.5));
  },
  sp_flashlight(b,v,a){
    b.cap(4,12,9,7,1.8,teal);b.cap(4,12,5,11,1.9,gold);b.cap(6,10,8,8,1.4,mint,'x');
    b.tri(7.5,6.5,10,3.5,13.5,7,gold);b.tri(7.5,6.5,13.5,7,10,9.5,gold);
    b.cap(10,3.5,13.5,7,1,cream);b.cap(10.3,3.8,13.2,6.7,.55,[250,226,149],'x');
    b.cap(7,8.5,7.8,7.7,.45,coral,'x');seam(b,4.3,10.5,5.5,9.3,lt(mint,.6));
    b.cap(2.5,12.5,2,13.5,.25,brown);b.cap(2,13.5,4.5,14,.25,brown);
    seam(b,11,1.7,11.5,2.5,ivory);seam(b,14,4.5,13.5,4.5,ivory);
  },
  sp_energybar(b,v,a){
    box(b,2,5,12,7,1,[198,165,198]);b.rect(2,5.5,1.5,6,gold);b.rect(12.5,5.5,1.5,6,gold);
    for(const y of [6,7.5,9,10.5]){seam(b,2.5,y,3,y,cream);seam(b,13,y,13.5,y,cream)}
    b.rect(4,5.5,7.5,6,cream,'x');b.tri(9,5.5,11.5,5.5,11.5,8.5,lilac,'x');
    b.rect(5,7,5,3,brown,'x');seam(b,6.5,7,6.5,10,dk(brown,.25));seam(b,8.5,7,8.5,10,dk(brown,.25));seam(b,5,8.5,10,8.5,dk(brown,.25));
    for(const x of [5.5,7.5,9])b.dot(x,7.5,gold,'x');b.tri(7,2,5.5,4,8,4,gold,'x');b.tri(7,3.5,8.5,3.5,7,5.5,gold,'x');
  },
  sp_rations(b,v,a){
    b.ell(8,12,4.5,2,dk(mint,.15));b.rect(3.5,4.5,9,7.5,mint);b.ell(8,4.5,4.5,1.7,cream);
    b.ell(8,4.5,3.5,1,lt(blue,.4),'x');b.ell(8.5,4.5,1.5,.7,brown,'x');b.ell(8.5,4.5,.8,.3,cream,'x');
    b.rect(4,6,8,5.5,cream,'x');b.ell(8,9,2.5,1.5,gold,'x');b.ell(8,8.5,2,1.2,coral,'x');
    b.ell(7.5,8.5,.55,.35,cream,'x');b.tri(10,8,11,7.5,11,9,coral,'x');
    for(const x of [5,6.5,8,9.5,11])b.dot(x,12.3,lt(mint,.5),'x');seam(b,4.5,5,6,5,ivory);
  },
  sp_firstaid(b,v,a){
    box(b,5.5,2,5,4,1.1,coral);box(b,6.5,3,3,2,.5,cream,'x');box(b,2,5,12,8.5,1.8,[237,164,157]);
    b.rect(2.5,7,11,1,cream,'x');box(b,5,7.5,6,4.5,.9,cream,'x');cross(b,8,9.7,.8,coral);
    for(const x of [4,12]){b.rect(x-.5,6.5,1,2,gold,'x');b.dot(x,7,brown,'x')}
    seam(b,3.5,12.5,12.5,12.5,lt(rose,.6));b.dot(3,6,ivory,'x');
  },
  sp_recovery(b,v,a){
    // Stoppered flask, lilac tonic, bubbles and a bright energy bolt.
    b.ell(8,10,4.5,4,[201,186,219]);b.rect(6.5,3.5,3,5,[201,186,219]);
    b.ell(8,10.8,3.5,2.2,lilac,'x');b.rect(5,9.5,6,1.5,lilac,'x');
    box(b,5.5,1.5,5,2.5,.6,gold);seam(b,6.5,2,9.5,2,cream);
    seam(b,5,8,4.5,10,ivory);b.ell(10,11.5,.5,.5,ivory,'x');
    b.tri(8.5,7,6,10,8.5,10,cream,'x');b.tri(7.5,9.5,10,9.5,7.5,12.5,cream,'x');
    for(const [x,y,r] of [[8,5,.45],[9,7,.4],[6,12,.35]])b.ell(x,y,r,r,lt(lilac,.55),'x');
  },
  sp_luckycharm(b,v,a){
    b.cap(7,3,5.5,2,.4,coral);b.cap(5.5,2,4.5,3.5,.4,coral);b.cap(4.5,3.5,7,5,.4,coral);
    b.cap(9,3,10.5,2,.4,coral);b.cap(10.5,2,11.5,3.5,.4,coral);b.cap(11.5,3.5,9,5,.4,coral);
    box(b,3.5,5,9,8.5,1.5,gold);box(b,4.5,6,7,6.5,1.1,cream,'x');
    for(const [x,y] of [[7,8],[9,8],[7,10],[9,10]])heart(b,x,y-.3,.9,mint);
    seam(b,8,9,9,11.5,teal);b.ell(8,9,.45,.45,gold,'x');
    b.cap(8,3.5,8,5.5,.45,coral,'x');b.cap(6,13,5.5,14,.25,coral);b.cap(10,13,10.5,14,.25,coral);
  },
  sp_compass(b,v,a){
    b.ell(8,3,1.7,1.5,gold);b.ell(8,3,.8,.6,cream,'x');b.ell(8,9,5.5,5.5,gold);b.ell(8,9,4.5,4.5,cream,'x');
    b.ell(8,9,3.6,3.6,[218,234,224],'x');
    for(let i=0;i<8;i++){const t=i*Math.PI/4;seam(b,8+Math.cos(t)*3.8,9+Math.sin(t)*3.8,8+Math.cos(t)*4.3,9+Math.sin(t)*4.3,brown)}
    b.tri(8,5.5,6.5,9,9.5,9,coral,'x');b.tri(6.5,9,9.5,9,8,12.5,teal,'x');b.ell(8,9,.6,.6,gold,'x');
    b.dot(5,6.5,ivory,'x');seam(b,7.5,4.5,8.5,4.5,coral);
  },
  sp_rescuekit(b,v,a){
    // A rope-bound life ring with a small rescue pouch.
    const ring=(x,y)=>((x-8)/2.5)**2+((y-7.5)/2.2)**2>=1;
    b.ell(8,7.5,6,5.5,cream,undefined,ring);b.ell(8,7.5,4.8,4.3,coral,'x',ring);b.ell(8,7.5,3.1,2.8,cream,'x',ring);
    b.rect(6.5,2,3,3,cream,'x');b.rect(6.5,10,3,3,cream,'x');b.rect(2,6,3,3,cream,'x');b.rect(11,6,3,3,cream,'x');
    b.cap(3,3.5,2.5,6,.25,gold,'x');b.cap(13,3.5,13.5,6,.25,gold,'x');b.cap(3,9,4,11.5,.25,gold,'x');
    box(b,8.5,10,5.5,4,1,teal);b.rect(9,10.5,4.5,.6,gold,'x');cross(b,11.2,12.3,.55,cream);
  },
});
})();
