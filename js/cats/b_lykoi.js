"use strict";
(()=>{
const K=CatKit,{P,FT}=K,red=[200,50,60],fold=[142,34,53],rim=[236,100,105];
K.costume('lykoi',{
  paint(c){
    const A=c.F.A;
    if(c.kind==='fur'&&c.part===P.BODY){
      const wear=c.side?c.u<c.A0.throat[0]-3&&c.v<c.A0.belly[1]-3:
        c.F.anim==='sleep'||Math.abs(c.x-A.chest[0])>6;
      if(wear){c.zone=false;if(c.mark)c.lv=0;return red}
    }
    // Chừa ô mặt và chóp tai sói; mũ trùm ôm đúng đầu của từng khung.
    if(c.part!==P.HEAD||c.kind==='line'||c.kind==='eye'||c.feat===FT.NOSE)return;
    const dx=c.x-(c.side?A.eye[0]-5:A.head[0]),dy=c.y-(c.side?A.eye[1]+4:A.head[1]+3);
    if((dx*dx)/(c.side?18*18:17*17)+dy*dy/(15*15)>1){
      c.zone=false;if(c.mark)c.lv=0;return red;
    }
  },
  draw(G){
    const A=G.A,B=G.lag(2),L=G.layer(),sleep=G.F.anim==='sleep';
    // Vạt áo trễ hai khung, nằm sau thân và cách xa bàn chân.
    if(G.side){
      L.poly([[A.neck[0]+3,A.neck[1]],[B.hip[0]-8,B.hip[1]+14],
        [B.back[0]-3,B.belly[1]-3],[A.throat[0]-3,A.throat[1]]],red).stamp({behind:true});
      G.layer().line(A.neck[0],A.neck[1]+2,B.hip[0]-6,B.hip[1]+12,fold,2).stamp({behind:true,outline:false});
    }else if(sleep){
      L.poly([[A.head[0]-16,A.head[1]-7],[B.body[0]-8,B.body[1]+6],
        [B.body[0]+7,B.chin[1]-2],[A.head[0]-13,A.chin[1]-5]],red).stamp({behind:true});
    }else{
      for(const d of [-1,1])L.poly([[A.neck[0]+d*9,A.neck[1]-2],
        [B.body[0]+d*20,B.body[1]+5],[B.body[0]+d*10,B.body[1]+5]],red);
      L.stamp({behind:true});
    }
    // Mép mũ trên trán, tai vẫn ló ra phía trên.
    G.layer().line(A.crown[0]-6,A.crown[1]+2,A.crown[0]+5,A.crown[1]+2,rim,2).stamp({outline:false});
    const n=G.side?A.throat:sleep?[A.head[0]-15,A.head[1]+9]:A.neck;
    const bow=G.layer();
    bow.poly([[n[0],n[1]+1],[n[0]-5,n[1]-1],[n[0]-4,n[1]+5]],rim);
    bow.poly([[n[0],n[1]+1],[n[0]+5,n[1]-1],[n[0]+4,n[1]+5]],red).stamp();
    G.layer().ell(n[0],n[1]+2,2,2,fold).stamp({outline:false});
  }
});
})();
