"use strict";
(()=>{
const H=CatKit.U.hex,P=CatKit.P,GREY=H('#9a9aa6'),SHADE=H('#777987'),LIGHT=H('#b5b5bf'),WHITE=H('#fafbff'),WOOD=H('#a8754a'),BARK=H('#805338');
CatKit.costume('v_gandalf',{
  shape(){}, // Khung thân do CatKit cung cấp.
  paint(q){
    if(q.kind==='fur'&&(q.part===P.BODY||CatKit.isLeg(q.part))){q.lv=0;return GREY}
  },
  draw(G){
    const A=G.A,D=G.lag(1),S=G.layer();
    const sx=G.side?D.hip[0]+12:D.head[0]+27,sy=Math.max(4,D.crown[1]-13),bottom=Math.min(76,G.side?D.belly[1]+10:D.body[1]+10);
    S.line(sx,bottom,sx-1,sy+2,WOOD,3);
    S.line(sx-1,sy+3,sx+2,sy,BARK,3);
    S.line(sx,bottom-2,sx,sy+6,WOOD,1);
    S.stamp({behind:true,clip:(x,y)=>y<=75});
    const L=G.layer(),cx=A.crown[0],by=A.crown[1]+2,tip=Math.max(1,by-24);
    // Mũ rộng và chóp cao, nằm hoàn toàn trong lưới.
    L.poly([[cx-17,by],[cx+5,tip],[cx+9,tip+4],[cx+17,by]],GREY);
    L.poly([[cx-15,by-1],[cx+4,tip+3],[cx-4,by-1]],LIGHT);
    L.ell(cx,by,24,3,GREY);
    L.line(cx-17,by-2,cx+17,by-2,SHADE,2);
    L.stamp();
    // Gốc râu theo mõm hiện tại; ngọn râu trễ một khung.
    // Khi liếm, chân giơ có nhãn HEAD: lấy mắt làm chuẩn gốc râu.
    const B=G.layer(),c=G.side?D.chin:[D.head[0],D.eyeL[1]+17],n=G.side?A.nose:[A.head[0],A.eyeL[1]+4];
    const top=Math.min(71,n[1]+8),end=Math.min(74,Math.max(top+10,c[1]+16));
    if(G.side){
      B.ell(c[0],top+2,9,5,WHITE);
      B.poly([[c[0]-9,top+2],[c[0]+9,top+2],[c[0]+6,Math.min(end,top+12)],[c[0],end],[c[0]-6,Math.min(end,top+12)]],WHITE);
      B.line(c[0]+2,top+5,c[0],Math.max(top+5,end-4),H('#e1e1eb'),1);
    }else{
      B.ell(n[0],top+1,11,5,WHITE);
      B.poly([[n[0]-11,top+1],[n[0]+11,top+1],[c[0]+9,Math.min(end,top+13)],[c[0],end],[c[0]-9,Math.min(end,top+13)]],WHITE);
      B.line(c[0]-5,top+5,c[0]-3,Math.max(top+5,end-4),H('#e1e1eb'),1);
    }
    B.stamp({clip:(x,y)=>y<=75});
  }
});
})();
