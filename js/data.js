"use strict";
/* ============ ĐỘ HIẾM ============ */
const STAR=[null,
 {n:'Phổ thông',c:'#5d6470',g:'#c3c8d0',m:1,p:50,good:.45,sell:20},
 {n:'Không phổ biến',c:'#22714a',g:'#5fd08a',m:1.3,p:30,good:.55,sell:40},
 {n:'Hiếm',c:'#2464aa',g:'#5aa9ff',m:1.7,p:14,good:.65,sell:100},
 {n:'Sử thi',c:'#7a4ccc',g:'#b98bff',m:2.3,p:5,good:.75,sell:300},
 {n:'Huyền thoại',c:'#855a05',g:'#ffd24a',m:3.2,p:1,good:.88,sell:1000}];
const GACHA_COST=100, PITY=10;

/* ============ GIỐNG MÈO ============ */
const BLK='#3a3448',WHT='#fbf7f0',ORG='#f0a050',DORG='#c96f28',CRM='#f6dfb8',GRY='#9aa3b5',DGRY='#646c80',BLU='#8794ad',BRN='#a8754a',DBRN='#5e3d28',SEAL='#5a4032',CHOC='#7a5238',SIL='#cfd4dc',GOLD='#e0b060',PNK='#f1c3b8',RUD='#c9783c',FAWN='#d9b48a',SAB='#6b4630';
const eG='#6fcf5f',eY='#ffd24a',eO='#ff9a3a',eB='#4aa8ff',eC='#d9772a',eA='#5fd6c8';
const B=(id,n,r,c,c2,pat,o,d,t,fav)=>Object.assign({id,n,r,c,c2,pat,d,t,fav},o||{});
const BREEDS=[
 // Mèo ta
 B('muop','Mướp ta',1,BRN,DBRN,'tabby',{eye:eG,w:1},'Mèo mướp Việt Nam, bắt chuột giỏi và rất dễ nuôi.','mouser glutton collector scratcher','kibble'),
 B('vang','Mèo vàng',1,ORG,DORG,'tabby',{eye:eY,f:.2,w:1},'Mèo cam “một nơ-ron”. Khoảng 80% mèo vàng là đực.','glutton charmer wander clumsy','pate'),
 B('mun','Mèo mun',1,BLK,BLK,'solid',{eye:eY},'Đen tuyền từ mũi tới đuôi, mắt vàng rực trong đêm.','nightowl hunter','tuna'),
 B('trang','Mèo trắng',1,WHT,WHT,'solid',{eye:eB},'Lông trắng muốt, hơi nhát người lạ.','shy gentle','churu'),
 B('venxam','Vện xám',1,GRY,DGRY,'tabby',{eye:eG},'Vằn xám tro, nghịch ngợm và nhanh nhẹn.','zoomies playful mouser','kibble'),
 B('bosua','Bò sữa',1,WHT,BLK,'cow',{eye:eG},'Trắng đốm đen như bò sữa, hơi ngáo ngơ.','clumsy boxlover','pate'),
 B('tuxedo','Tuxedo',1,BLK,BLK,'solid',{eye:eG,w:2},'Đen trắng như mặc vest, lúc nào cũng lịch lãm.','charmer smart','tuna'),
 B('tamthe','Tam thể',2,WHT,ORG,'calico',{c3:BLK,eye:eY,f:.9995},'Ba màu trắng, cam, đen. Gần như luôn là mèo cái.','lucky grumpy','salmon'),
 B('doimoi','Đồi mồi',2,BLK,ORG,'tortie',{eye:eY,f:.9995},'Lông đen cam loang lổ, cá tính mạnh. Hầu hết là cái.','grumpy hunter','chicken'),
 // Giống được công nhận
 B('amshort','American Shorthair',1,SIL,BLK,'tabby',{eye:eG},'Vằn bạc cổ điển, hậu duệ mèo bắt chuột trên tàu.','mouser sturdy','kibble'),
 B('european','European Shorthair',1,'#c9a878',DBRN,'tabby',{eye:eG,w:2},'Mèo nhà châu Âu, khỏe mạnh và độc lập.','mouser sturdy wander','kibble'),
 B('british','Anh lông ngắn',2,BLU,BLU,'solid',{eye:eO,ear:'small'},'Mặt tròn má phính, điềm tĩnh và hơi lười.','gentle lazy glutton sleeper','pate'),
 B('exotic','Exotic lông ngắn',2,ORG,DORG,'tabby',{eye:eC,flat:1,ear:'small'},'Ba Tư phiên bản lông ngắn, mặt tịt đáng yêu.','lazy sleeper charmer','pate'),
 B('mainecoon','Maine Coon',2,BRN,DBRN,'tabby',{eye:eG,fur:1,ear:'tuft',tail:'fluff',w:1},'Gã khổng lồ hiền lành, có thể nặng 8–10 kg.','glutton sturdy swimmer hairball collector','chicken'),
 B('persian','Ba Tư',2,WHT,WHT,'solid',{eye:eC,fur:1,flat:1,tail:'fluff',ear:'small'},'Lông dài mượt, mặt tịt, thích nằm yên một chỗ.','sleeper lazy picky hairball gentle','premium'),
 B('ragdoll','Ragdoll',2,CRM,'#7a6a88','point',{eye:eB,fur:1,mit:1,tail:'fluff'},'Bế lên là mềm oặt như búp bê vải.','sleeper lapcat gentle charmer','churu'),
 B('russian','Russian Blue',2,'#7f8ca8','#7f8ca8','solid',{eye:eG},'Lông xám xanh ánh bạc, kín đáo và sạch sẽ.','shy smalleater picky','salmon'),
 B('scottish','Scottish Fold',2,'#b0b6c4','#8a91a3','tabby',{eye:eO,ear:'fold'},'Tai cụp, mặt tròn như cú mèo.','charmer clumsy gentle','churu'),
 B('scotstraight','Scottish Straight',2,'#d9c2a0','#b08f66','tabby',{eye:eO},'Anh em tai thẳng của Scottish Fold.','gentle playful','pate'),
 B('siamese','Xiêm',2,CRM,SEAL,'point',{eye:eB,ear:'big'},'Mặt nạ nâu, mắt xanh, nói chuyện suốt ngày.','chatty smart loyal picky jealous','tuna'),
 B('thai','Mèo Thái',2,CRM,'#6b5a7a','point',{eye:eB},'Mèo Xiêm kiểu cổ, mặt tròn hơn.','chatty loyal','tuna'),
 B('abyssinian','Abyssinian',3,RUD,'#8a4a20','ticked',{eye:eG,ear:'big'},'Lông hung ánh kim, hiếu động, thích leo cao.','hunter climber smart fast zoomies','chicken'),
 B('ambobtail','American Bobtail',3,BRN,DBRN,'tabby',{eye:eY,fur:1,tail:'bob'},'Đuôi cộc tự nhiên, dáng hoang dã mà hiền.','sturdy playful','chicken'),
 B('amcurl','American Curl',3,CRM,ORG,'tabby',{eye:eG,ear:'curl',fur:1,w:1},'Vành tai cong ngược ra sau.','playful loyal','churu'),
 B('amwire','American Wirehair',3,WHT,ORG,'van',{eye:eY},'Lông xoăn cứng như dây thép, rất hiếm gặp.','mouser sturdy','kibble'),
 B('balinese','Balinese',3,CRM,SEAL,'point',{eye:eB,fur:1,tail:'fluff',ear:'big'},'Xiêm lông dài, dáng đi như vũ công.','chatty smart','tuna'),
 B('bengal','Bengal',3,'#e0a860',DBRN,'spot',{eye:eG},'Hoa văn báo đốm, mê nước, năng lượng vô tận.','hunter swimmer scratcher zoomies playful','chicken'),
 B('birman','Birman',3,CRM,SEAL,'point',{eye:eB,fur:1,mit:1,tail:'fluff'},'Mèo thiêng Miến Điện, bốn chân đi găng trắng.','lapcat gentle','salmon'),
 B('bombay','Bombay',3,'#2a2636','#2a2636','solid',{eye:eC},'Báo đen thu nhỏ, lông bóng như sơn mài.','nightowl lapcat','tuna'),
 B('britishlh','Anh lông dài',3,'#c9b8a0','#c9b8a0','solid',{eye:eO,fur:1,ear:'small',tail:'fluff'},'Anh lông ngắn khoác áo lông dày.','gentle lazy hairball','pate'),
 B('burmese','Burmese',3,SAB,SAB,'solid',{eye:eY},'Mèo Miến Điện nâu sẫm, bám chủ như hình với bóng.','loyal lapcat jealous','chicken'),
 B('burmilla','Burmilla',3,SIL,GRY,'smoke',{eye:eG},'Lông bạc như phủ sương, mắt kẻ viền đen.','gentle playful','salmon'),
 B('chartreux','Chartreux',3,BLU,BLU,'solid',{eye:eO},'Mèo xám xanh của nước Pháp, luôn như đang mỉm cười.','mouser gentle','kibble'),
 B('colorpoint','Colorpoint Shorthair',3,WHT,ORG,'point',{eye:eB,ear:'big'},'Họ hàng Xiêm với điểm màu đỏ cam.','chatty jealous','tuna'),
 B('cornish','Cornish Rex',3,'#efe6da','#efe6da','solid',{eye:eY,ear:'big'},'Lông xoăn gợn sóng, chạy như chó săn nhỏ.','fast coldfear playful','chicken'),
 B('devon','Devon Rex',3,FAWN,FAWN,'solid',{eye:eG,ear:'big'},'Tai dơi, mặt yêu tinh, cực kỳ quấn người.','playful loyal coldfear','churu'),
 B('euburmese','European Burmese',3,'#b5653a','#b5653a','solid',{eye:eY},'Burmese dòng châu Âu, nhiều màu lông hơn.','loyal playful','chicken'),
 B('himalayan','Himalayan',3,CRM,SEAL,'point',{eye:eB,fur:1,flat:1,tail:'fluff',ear:'small'},'Ba Tư mang điểm màu của Xiêm.','sleeper lazy hairball','premium'),
 B('jbobtail','Japanese Bobtail',3,WHT,ORG,'calico',{c3:BLK,eye:eY,tail:'bob',f:.9995},'Nguyên mẫu mèo vẫy tay maneki-neko.','lucky chatty','salmon'),
 B('kurilian','Kurilian Bobtail',3,'#b08a5a',DBRN,'tabby',{eye:eY,fur:1,tail:'bob'},'Đuôi pom-pom, thợ bắt cá vùng đảo Kuril.','naturekid swimmer','salmon'),
 B('laperm','LaPerm',3,'#c98a5a','#8f5a32','tabby',{eye:eG,fur:1},'Lông xoăn lọn như vừa đi uốn.','lapcat playful','pate'),
 B('manx','Manx',3,ORG,DORG,'tabby',{eye:eY,tail:'none',w:1},'Mèo không đuôi đến từ đảo Man.','mouser sturdy','kibble'),
 B('munchkin','Munchkin',3,CRM,ORG,'tabby',{eye:eG,w:2},'Chân ngắn tũn, chạy lạch bạch.','playful charmer clumsy collector','churu'),
 B('norwegian','Rừng Na Uy',3,BRN,DBRN,'tabby',{eye:eG,fur:1,ear:'tuft',tail:'fluff',w:2},'Mèo của người Viking, leo cây giỏi, không sợ tuyết.','climber naturekid swimmer sturdy','salmon'),
 B('ocicat','Ocicat',3,FAWN,CHOC,'spot',{eye:eY},'Đốm như mèo rừng nhưng thuần nhà 100%.','hunter playful','chicken'),
 B('oriental','Oriental lông ngắn',3,'#3f3a50','#3f3a50','solid',{eye:eG,ear:'big'},'Tai to, thân thon, hơn 300 kiểu màu lông.','chatty fast zoomies jealous','tuna'),
 B('ragamuffin','Ragamuffin',3,BRN,DBRN,'tabby',{eye:eG,fur:1,tail:'fluff',w:2},'To, mềm, thích được bế như em bé.','lapcat glutton gentle','pate'),
 B('selkirk','Selkirk Rex',3,CRM,CRM,'solid',{eye:eC,fur:1},'Lông xoăn bông như cừu non.','lazy gentle','pate'),
 B('siberian','Siberian',3,'#b08a5a',DBRN,'tabby',{eye:eG,fur:1,tail:'fluff'},'Ba lớp lông chống rét của nước Nga.','sturdy climber naturekid','salmon'),
 B('snowshoe','Snowshoe',3,CRM,SEAL,'point',{eye:eB,w:2},'Mèo điểm màu đi “giày tuyết” trắng.','loyal swimmer','tuna'),
 B('somali','Somali',3,RUD,'#8a4a20','ticked',{eye:eG,fur:1,tail:'fluff',ear:'big'},'Đuôi xù như cáo, họ hàng lông dài của Abyssinian.','climber fast playful','chicken'),
 B('sphynx','Sphynx',3,PNK,'#d9a79c','hairless',{eye:eG,ear:'big'},'Không lông, da ấm như túi sưởi.','lapcat loyal coldfear sunbath','chicken'),
 B('tonkinese','Tonkinese',3,'#b89878','#6b4a3a','point',{eye:eA},'Lai giữa Xiêm và Burmese, mắt xanh ngọc.','chatty playful','tuna'),
 B('angora','Angora Thổ Nhĩ Kỳ',3,WHT,WHT,'solid',{eye:eB,eye2:eY,fur:1,tail:'fluff'},'Lông trắng như lụa, thường hai mắt hai màu.','jealous smart','salmon'),
 B('minuet','Minuet',3,WHT,GRY,'cow',{eye:eC,fur:1,flat:1},'Chân ngắn của Munchkin, mặt của Ba Tư.','gentle clumsy','churu'),
 B('ausmist','Australian Mist',3,'#d9c0a0','#a8845c','spot',{eye:eG},'Đốm mờ như sương, giống mèo của nước Úc.','gentle lapcat','pate'),
 B('mau','Egyptian Mau',4,SIL,BLK,'spot',{eye:eG},'Giống mèo nhà chạy nhanh nhất, đốm hoàn toàn tự nhiên.','fast hunter shy','chicken'),
 B('havana','Havana Brown',4,CHOC,CHOC,'solid',{eye:eG},'Nâu sô-cô-la toàn thân, cả ria cũng nâu.','loyal playful','chicken'),
 B('korat','Korat',4,'#8f9bb0','#8f9bb0','solid',{eye:eG},'Mèo may mắn của Thái Lan, lông xám ánh bạc.','smalleater shy lucky','salmon'),
 B('cymric','Cymric',4,'#c9a878',DBRN,'tabby',{eye:eY,fur:1,tail:'none'},'Manx phiên bản lông dài.','mouser sturdy','kibble'),
 B('nebelung','Nebelung',4,BLU,BLU,'solid',{eye:eG,fur:1,tail:'fluff'},'“Sinh vật của sương mù”, lông dài xám xanh.','shy gentle','salmon'),
 B('orientallh','Oriental lông dài',4,CHOC,CHOC,'solid',{eye:eG,fur:1,tail:'fluff',ear:'big'},'Oriental với bộ lông dài mượt.','chatty fast','tuna'),
 B('peterbald','Peterbald',4,'#e6c3b6','#c99f93','hairless',{eye:eG,ear:'big'},'Mèo không lông thanh mảnh từ St. Petersburg.','coldfear sunbath loyal','chicken'),
 B('pixiebob','Pixiebob',4,BRN,DBRN,'spot',{eye:eY,tail:'bob',ear:'tuft'},'Trông như linh miêu con, thường có thừa ngón.','naturekid collector','chicken'),
 B('singapura','Singapura',4,'#d8bf9a','#8a6a48','ticked',{eye:eG,ear:'big'},'Giống mèo nhỏ nhất thế giới, mắt to tròn.','smalleater smart playful','chicken'),
 B('toyger','Toyger',4,ORG,BLK,'tiger',{eye:eY,w:1},'Hổ con trong phòng khách.','hunter playful','chicken'),
 B('van','Van Thổ Nhĩ Kỳ',4,WHT,ORG,'van',{eye:eB,eye2:eY,fur:1,tail:'fluff'},'Mèo biết bơi, chỉ có màu ở đầu và đuôi.','swimmer smart','salmon'),
 B('chausie','Chausie',4,RUD,'#6b4a2a','ticked',{eye:eY,ear:'tuft'},'Mang dòng máu mèo rừng, chân dài, nhảy cao.','hunter naturekid fast','chicken'),
 B('donskoy','Donskoy',4,'#d9b3ad','#b88f8a','hairless',{eye:eG,ear:'big'},'Mèo không lông nước Nga, da nhăn mềm.','coldfear sunbath lapcat','chicken'),
 B('highlander','Highlander',4,FAWN,CHOC,'spot',{eye:eY,ear:'curl',tail:'bob'},'Tai cong, đuôi cộc, dáng vạm vỡ.','playful sturdy','chicken'),
 B('serengeti','Serengeti',4,GOLD,BLK,'spot',{eye:eY,ear:'big'},'Chân dài tai to, dáng mèo đồng cỏ châu Phi.','fast hunter','chicken'),
 B('germanrex','German Rex',4,'#bfc4cf','#bfc4cf','solid',{eye:eG},'Lông xoăn ngắn mịn như nhung.','playful loyal','pate'),
 B('neva','Neva Masquerade',4,CRM,SEAL,'point',{eye:eB,fur:1,tail:'fluff'},'Siberian đeo mặt nạ dạ hội.','sturdy naturekid','salmon'),
 B('aphrodite','Aphrodite',4,WHT,BRN,'cow',{eye:eG,fur:1},'Mèo núi đảo Síp, to con và điềm đạm.','climber gentle','kibble'),
 B('toybob','Toybob',4,CRM,SEAL,'point',{eye:eB,tail:'bob',ear:'small'},'Bé xíu, đuôi cộc, mãi như mèo con.','lapcat smalleater','churu'),
 B('khaomanee','Khao Manee',5,WHT,WHT,'solid',{eye:'#8fdcff',eye2:'#ffab2e',odd:['#8fdcff','#ffab2e'],gem:1,bt:'b_khaomanee'},'“Mắt kim cương” của hoàng gia Thái, hai mắt hai màu.','lucky picky smart','premium'),
 B('lykoi','Lykoi',5,'#55505f','#b9b2c2','lykoi',{eye:eY,c3:'#8a7f8f',bt:'b_lykoi'},'Mèo sói: lông loang thưa quanh mắt và mõm.','nightowl hunter loyal','chicken'),
 B('savannah','Savannah',5,GOLD,BLK,'spot',{eye:eG,ear:'big',bt:'b_savannah'},'Lai mèo đồng cỏ serval, cao lớn và nhảy tới 2 mét.','hunter fast smart wander','chicken'),
 B('sokoke','Sokoke',5,'#b8905a',DBRN,'tiger',{eye:eG,bt:'b_sokoke'},'Giống hiếm bậc nhất, đến từ rừng Kenya.','naturekid fast climber','chicken'),
 B('suphalak','Suphalak',5,'#b5652f','#b5652f','solid',{eye:eY,bt:'b_suphalak'},'Mèo màu đồng đỏ của Thái Lan cổ, cực hiếm.','lucky loyal','salmon'),
];

/* ============ MÈO TRANG PHỤC & ĐẶC BIỆT (4★–5★) ============ */
// g: nhóm bộ sưu tập (anime | film | meme). cos: chuỗi = bộ vẽ tay, mảng = ghép từ các bộ phận.
const V=(id,n,r,g,o,cos,xt,d,fav)=>Object.assign({id,n,r,g,cos,xt,d,fav,pat:'solid'},o);
const VARIANTS=[
 // --- Anime ---
 // Naruto và Goku (5★): trang phục nằm ở từng "dạng" trong COATS (gkBase, nrBase…), xem FORMS bên dưới
 V('v_naruto','Mèo Naruto',5,'anime',{c:CRM,c2:CRM,eye:'#3d8fe8',noRare:1},[],'v_naruto','Ninja làng Lá tóc vàng. Hét “dattebayo” mỗi khi thấy bát mì ramen.','chicken'),
 V('v_luffy','Mèo Luffy',4,'anime',{c:CRM,c2:CRM,w:1},[['haircap','#3a3448',12,1],['strawhat'],['scar','under'],['suit','#e0483c',26],['belt','#f2d04a',33]],'v_luffy','Sẽ trở thành Vua Mèo Hải Tặc. Trước hết phải ăn đã.','chicken'),
 V('v_goku','Mèo Goku',5,'anime',{c:CRM,c2:CRM,eye:'#3a3448',noRare:1},[],'v_goku','Võ phục cam, vòng hào quang trên đầu, cưỡi Cân Đẩu Vân. Càng đói càng mạnh, ăn xong lại càng mạnh.','chicken'),
 V('v_tanjiro','Mèo Tanjiro',4,'anime',{c:CRM,c2:CRM,eye:'#b0303a'},[['haircap','#7a2a2e',12,1],['scar','tanjiro'],['earrings'],['checker','#3fa06a','#3a3448']],'v_tanjiro','Ngửi được mùi cá khô từ đầu ngõ.','salmon'),
 V('v_nezuko','Mèo Nezuko',4,'anime',{c:WHT,c2:WHT,eye:'#f59ab5'},[['longhair','#3a3448',13,12,22],['haircap','#3a3448',11,1],['mr',21,8,4,2,'#f59ab5'],['bamboo'],['suit','#f7b3c6'],['belt','#c0392b',30]],'v_nezuko','Ngậm ống tre, thích chui hộp ngủ cả ngày.','churu'),
 V('v_thunder','Mèo Zenitsu',5,'anime',{c:CRM,c2:CRM,closed:1},[['sword'],['haircap','#f5cf3a',12,1],['tripat','#f5cf3a','#f08a2a'],['sparks','#f2c230']],'v_thunder','Nhát gan khi thức, nhưng ngủ gật là ra đòn nhanh như chớp.','chicken'),
 V('v_gojo','Mèo Gojo',5,'anime',{c:'#e9e4ef',c2:'#e9e4ef'},[['spikes','#fafbff'],['blindfold','#3a3448'],['suit','#2f3552',24,1],['collar','#2f3552']],'v_gojo','Bịt mắt vẫn bắt trúng chuột. Mạnh nhất, và biết điều đó.','premium'),
 V('v_anya','Mèo Anya',4,'anime',{c:CRM,c2:CRM,eye:eG},[['longhair','#f5a8c0',12,8,19],['haircap','#f5a8c0',13,1],['horns','#3a3448'],['suit','#3a3448'],['collar','#ffffff']],'v_anya','Thích đậu phộng. Biết bạn đang nghĩ gì.','churu'),
 V('v_frieren','Mèo Frieren',4,'anime',{c:WHT,c2:WHT,eye:eA},[['staff','#a8754a','#e0483c'],['twintails','#f4f6fb'],['haircap','#f4f6fb',12],['suit','#fbfbff'],['belt','#e0b040',28],['collar','#e0b040']],'v_frieren','Sống cả ngàn năm, ngủ nướng cũng tính bằng thập kỷ.','salmon'),
 V('v_levi','Mèo Levi',4,'anime',{c:CRM,c2:CRM,eye:'#8a8f9c'},[['cape','#4f7a52'],['haircap','#3a3448',12,1],['suit','#f4f0e6'],['cravat'],['belt','#6b4a34',31]],'v_levi','Binh trưởng. Thấy một sợi lông rơi là lau cả nhà.','tuna'),
 V('v_pika','Mèo Pikachu',4,'anime',{c:'#f9dc5c',c2:'#f9dc5c'},[['eartips','#3a3448'],['cheeks','#f0483c'],['tailbase','#a86a3a']],'v_pika','Má đỏ phát điện mỗi khi được gãi cằm.','churu'),
 V('v_totoro','Mèo Totoro',4,'anime',{c:'#8f95a3',c2:'#8f95a3'},[['leaf'],['belly','#f6eedc']],'v_totoro','Đội lá đứng chờ xe buýt dưới mưa.','kibble'),
 V('v_dora','Mèo Doraemon',4,'anime',{c:'#4aa8e8',c2:'#4aa8e8',w:2,short:1,base:'munchkin'},[['flag','noEars'],['collar','#e0483c',1],['pocket']],'v_dora','Mèo máy không tai, túi thần kỳ chứa toàn bánh rán.','premium'),
 V('v_sailor','Mèo Sailor Moon',4,'anime',{c:CRM,c2:CRM,eye:eB},[['twintails','#f5cf3a'],['buns','#f5cf3a'],['haircap','#f5cf3a',12,1],['tiara'],['suit','#ffffff'],['sailor','#3d5fc0'],['bow','#e0483c']],'v_sailor','Nhân danh mặt trăng, đòi thêm pate.','churu'),
 V('v_conan','Mèo Conan',4,'anime',{c:CRM,c2:CRM,eye:eB},[['haircap','#5e3d28',12,1],['glasses','#3a3448'],['suit','#3d5fc0'],['bow','#e0483c']],'v_conan','Sự thật chỉ có một: ai đã ăn vụng cá.','tuna'),
 // --- Phim ---
 V('v_hero','Mèo Superman',4,'film',{c:CRM,c2:CRM,eye:eB},[['cape','#d0342c'],['haircap','#3a3448',10],['suit','#3d6fd0',24,1],['emblem','#f2c230','#d0342c'],['belt','#f2c230',33]],'v_hero','Áo choàng đỏ tung bay, giải cứu cá khô khắp phố.','tuna'),
 V('v_pirate','Mèo Jack Sparrow',4,'film',{c:BRN,c2:DBRN,pat:'tabby',w:1,eye:eY},[['longhair','#4a3020',12.5,9,20],['haircap','#c0392b',12],['tricorn'],['suit','#f1e6d0'],['sides','#5a4a6a'],['belt','#c0392b',31],['fr',16,24,1,3,'#4a3020'],['fr',19,24,1,3,'#4a3020']],'v_pirate','Thuyền trưởng. Lúc nào cũng hỏi rượu rum đâu rồi.','tuna'),
 V('v_harry','Mèo Harry Potter',5,'film',{c:CRM,c2:CRM,eye:eG},[['wand'],['haircap','#3a3448',12,1],['scar','bolt'],['glasses','#3a3448'],['suit','#3a3448'],['scarf','#b8323a','#f2c230']],'v_harry','Cậu bé sống sót, giờ sống sót qua cả bồn tắm.','chicken'),
 V('v_hermione','Mèo Hermione',4,'film',{c:CRM,c2:CRM,eye:'#8a5a34'},[['wand'],['longhair','#8a5a34',14.5,11,19],['haircap','#8a5a34',12,1],['suit','#3a3448'],['tie','#b8323a','#f2c230']],'v_hermione','Là “Levi-Ô-sa”, không phải “Levio-SÁ”.','salmon'),
 V('v_voldemort','Mèo Voldemort',4,'film',{c:'#eef0ea',c2:'#eef0ea',eye:'#d0302a'},[['wand'],['flag','noFace'],['flag','noEars'],['fr',12,17,2,2,'#d0302a'],['fr',22,17,2,2,'#d0302a'],['fr',16,20,1,2,'#9a9aa6'],['fr',19,20,1,2,'#9a9aa6'],['suit','#3a3448',24,1]],'v_voldemort','Kẻ-mà-ai-cũng-biết-là-không-có-mũi.','tuna'),
 V('v_wednesday','Mèo Wednesday',4,'film',{c:'#f1ece6',c2:'#f1ece6',eye:'#3a3448'},[['twintails','#3a3448'],['haircap','#3a3448',12],['suit','#3a3448',24,1],['collar','#ffffff'],['lids']],'v_wednesday','Không cười. Không khóc. Chỉ nhìn.','tuna'),
 V('v_eleven','Mèo Eleven',4,'film',{c:CRM,c2:CRM},[['haircap','#8a6a4a',10],['suit','#f5a8c0'],['sides','#4a6fb0'],['fr',17,21,1,2,'#e0302a']],'v_eleven','Dùng ý nghĩ để mở hộp bánh quế.','pate'),
 V('v_heist','Mèo Phi Vụ Áo Đỏ',4,'film',{c:CRM,c2:CRM},[['flag','noMuz'],['hood','#d0342c'],['faceplate','#f6efe2'],['mustache'],['suit','#d0342c',24,1]],'v_heist','Bella ciao, bella ciao, bella… cá khô.','pate'),
 V('v_guard','Mèo Lính Áo Hồng',4,'film',{c:CRM,c2:CRM},[['flag','noFace'],['flag','noMuz'],['hood','#f0508a'],['faceplate','#3a3448'],['shape','tri'],['suit','#f0508a',24,1]],'v_guard','Đèn xanh… đèn đỏ.','kibble'),
 V('v_456','Mèo Số 456',4,'film',{c:CRM,c2:CRM},[['haircap','#3a3448',11,1],['suit','#2f9a8a',25],['number','456','#ffffff']],'v_456','Người chơi cuối cùng, vẫn còn nợ tiền hạt.','kibble'),
 V('v_iron','Mèo Iron Man',4,'film',{c:'#d0342c',c2:'#d0342c',eye:'#bff4ff'},[['flag','noFace'],['flag','noMuz'],['fullmask','#d0342c'],['faceplate','#f2c230'],['fr',11,17,4,1,'#bff4ff'],['fr',21,17,4,1,'#bff4ff'],['suit','#d0342c',24,1],['emblem','#bff4ff']],'v_iron','Thiên tài, tỷ phú, và rất thích nằm lên bàn phím.','premium'),
 V('v_spider','Mèo Spider-Man',4,'film',{c:'#d0342c',c2:'#d0342c'},[['flag','noFace'],['flag','noMuz'],['fullmask','#d0342c'],['lenses','#ffffff'],['web'],['suit','#d0342c',24],['sides','#3d5fc0'],['emblem','#3a3448']],'v_spider','Hàng xóm thân thiện, leo rèm cửa trong ba giây.','tuna'),
 V('v_batman','Mèo Batman',4,'film',{c:CRM,c2:CRM},[['cape','#3a3448'],['flag','noFace'],['fullmask','#3f3c4c'],['lenses','#ffffff',3,2],['suit','#5a5868',24,1],['emblem','#f2c230','#3a3448'],['belt','#f2c230',32]],'v_batman','Ta là bóng đêm. Ta là kẻ làm đổ cốc nước lúc 3 giờ sáng.','tuna'),
 V('v_jedi','Mèo Jedi',4,'film',{c:CRM,c2:CRM,eye:eB},[['saber','#6ab8ff'],['hood','#8a6a4a'],['suit','#d9c7a6',24,1],['sides','#8a6a4a'],['belt','#5e3d28',31]],'v_jedi','Thần lực ở bên bé, nhất là lúc mở tủ lạnh.','salmon'),
 V('v_vader','Mèo Darth Vader',5,'film',{c:'#2e2a38',c2:'#2e2a38'},[['vcape'],['flag','noFace'],['flag','noMuz'],['vhelm'],['vface'],['vsuit']],'v_vader','“Ta là… chủ của ngươi.” (thở khò khè)','premium'),
 V('v_gandalf','Mèo Gandalf',4,'film',{c:'#e9e4ef',c2:'#e9e4ef',eye:eB},[['staff','#a8754a'],['pointhat','#9a9aa6'],['beard','#fafbff'],['suit','#9a9aa6',25,1]],'v_gandalf','Không ai được qua! Trừ người mang đồ ăn.','salmon'),
 // --- Meme & đặc biệt ---
 V('v_nyan','Nyan Cat',5,'meme',{c:'#9a9aa6',c2:'#9a9aa6',intro:'nyan'},[['nrainbow'],['npoptart'],['cheeks','#f59ab5'],['nstars']],'v_nyan','Thân bánh pop-tart, bay xuyên vũ trụ, để lại cầu vồng.','churu'),
 V('v_maneki','Mèo Thần Tài',5,'meme',{c:WHT,c2:ORG,c3:BLK,pat:'calico',closed:1,intro:'coins',f:.5},[['collar','#e0483c',1],['paw'],['coin']],'v_maneki','Maneki-neko vẫy tay gọi tài lộc, ôm khư khư đồng vàng.','salmon'),
 V('v_grumpy','Mèo Grumpy',4,'meme',{c:'#efe6da',c2:'#8a6a55',pat:'point',eye:eB},[['frown']],'v_grumpy','Mặt quạu bẩm sinh. Thật ra đang rất vui. Có lẽ.','pate'),
 V('v_huh','Mèo “Huh?”',4,'meme',{c:WHT,c2:'#8a8f9c',pat:'cow',eye:eG},[['qmark']],'v_huh','Huh?','kibble'),
 V('v_garfield','Mèo Garfield',4,'meme',{c:'#f39a3a',c2:'#3a3448',pat:'tiger',f:.05},[['lenses','#ffffff',4,4],['pupils','#3a3448'],['lids','#f39a3a']],'v_garfield','Ghét thứ Hai, mê lasagna, coi thường mọi bài tập thể dục.','premium'),
 V('v_tank','Mèo Ba Lỗ',4,'meme',{c:ORG,c2:DORG,pat:'tabby',eye:eG},'tank','v_tank','Tập tạ mỗi sáng, mặc ba lỗ quanh năm.','chicken'),
 V('v_ninja','Mèo Ninja',4,'meme',{c:'#d8d2c8',c2:'#d8d2c8',eye:eY},'ninja','v_ninja','Không ai thấy nó đi. Chỉ thấy đĩa cá trống trơn.','salmon'),
 V('v_chef','Mèo Đầu Bếp',4,'meme',{c:WHT,c2:GRY,pat:'cow',eye:eG},'chef','v_chef','Nếm trước mọi món, gọi là kiểm tra chất lượng.','premium'),
 V('v_bread','Mèo Bánh Mì',4,'meme',{c:CRM,c2:ORG,w:1,eye:eG,short:1,base:'munchkin'},'bread','v_bread','Chui đầu qua lát bánh mì rồi quyết định ở luôn trong đó.','pate'),
 V('v_dj','Mèo DJ',4,'meme',{c:'#6a6480',c2:'#6a6480',w:1,eye:eA},'dj','v_dj','Chơi nhạc lúc 3 giờ sáng, hàng xóm rất “thích”.','churu'),
 V('v_astro','Mèo Phi Hành Gia',5,'meme',{c:WHT,c2:WHT,eye:eB},'astro','v_astro','Tin rằng chấm laser đỏ đến từ sao Hỏa và quyết đi tìm.','premium'),
 V('v_royal','Mèo Hoàng Gia',5,'meme',{c:WHT,c2:WHT,fur:1,eye:eC},'royal','v_royal','Bạn không nuôi ngài. Ngài cho phép bạn hầu hạ.','premium'),
];
const GROUPS=[['breed','Giống thật'],['anime','Anime'],['film','Phim'],['meme','Meme & Đặc biệt']];

/* ============ TRAIT ============ */
// k: g = có lợi, b = bất lợi, x = độc quyền biến thể
const TRAITS={
 hunter:{n:'Thợ săn bẩm sinh',k:'g',d:'+10% xu mọi chuyến viễn chinh.',e:{coin:.10,fav:'chicken'}},
 nightowl:{n:'Mèo đêm',k:'g',d:'+20% xu nếu xuất phát ban đêm (19h–5h theo giờ thật).',e:{night:.20}},
 chatty:{n:'Lắm mồm',k:'g',d:'Các mèo khác cùng phòng +8 độ vui.',e:{aura:8}},
 boxlover:{n:'Thích hộp giấy',k:'g',d:'+15 độ vui khi phòng có thùng carton.',e:{like:['box',15]}},
 sleeper:{n:'Ngủ 16 tiếng',k:'g',d:'Hồi năng lượng nhanh hơn 50%, nhưng viễn chinh chậm hơn 20%.',e:{regen:1.5,speed:-.20}},
 lapcat:{n:'Mèo ôm ấp',k:'g',d:'Vuốt ve được thêm 2 xu, +5 độ vui.',e:{pet:2,self:5}},
 swimmer:{n:'Thích nước',k:'g',d:'+25% xu ở các điểm viễn chinh gần nước.',e:{water:.25,fav:'salmon'}},
 highup:{n:'Thích chỗ cao',k:'g',d:'Hay trèo lên tầng cao nhất. +10 độ vui khi phòng có đồ leo trèo.',e:{like:['tree',10]}},
 climber:{n:'Leo trèo giỏi',k:'g',d:'+12 độ vui khi phòng có tháp mèo, viễn chinh nhanh hơn 5%.',e:{like:['tree',12],speed:.05}},
 lucky:{n:'Mèo thần tài',k:'g',d:'+8% cơ hội mang vé gacha về.',e:{ticket:.08}},
 gentle:{n:'Hiền như bụt',k:'g',d:'Mèo khác cùng phòng +5 độ vui. Không bao giờ cào đồ.',e:{aura:5,noScratch:1}},
 smart:{n:'Thông minh',k:'g',d:'Chuyến viễn chinh của bé cho +50% kinh nghiệm.',e:{xp:1.5}},
 fast:{n:'Chân chạy',k:'g',d:'Viễn chinh nhanh hơn 15%.',e:{speed:.15}},
 sturdy:{n:'Dai sức',k:'g',d:'Viễn chinh tốn ít hơn 30% năng lượng.',e:{cost:.7}},
 mouser:{n:'Diệt chuột',k:'g',d:'+6% xu và +15% cơ hội tha thêm chiến lợi phẩm.',e:{coin:.06,loot:.15}},
 charmer:{n:'Được lòng người',k:'g',d:'+15% xu ở các điểm đông người.',e:{crowd:.15}},
 smalleater:{n:'Ăn như mèo',k:'g',d:'Đói chậm hơn 30%.',e:{hunger:.7}},
 playful:{n:'Ham chơi',k:'g',d:'+12 độ vui khi phòng có đồ chơi chuột.',e:{like:['mouse',12]}},
 birdwatch:{n:'Ngắm chim',k:'g',d:'+12 độ vui khi phòng có cửa sổ.',e:{like:['window',12]}},
 sunbath:{n:'Tắm nắng',k:'g',d:'+12 độ vui khi ở ban công hoặc sân vườn.',e:{outdoor:12}},
 loyal:{n:'Quấn chủ',k:'g',d:'Vuốt ve tăng gấp đôi độ vui, +5 độ vui.',e:{petHappy:2,self:5}},
 collector:{n:'Tha đồ về nhà',k:'g',d:'+30% cơ hội mang thêm chiến lợi phẩm (15 xu).',e:{loot:.30}},
 naturekid:{n:'Con của rừng',k:'g',d:'+15% xu ở các điểm thiên nhiên.',e:{nature:.15}},
 glutton:{n:'Ham ăn',k:'b',d:'Đói nhanh hơn 50%.',e:{hunger:1.5,fav:'pate'}},
 shy:{n:'Sợ người lạ',k:'b',d:'−15% xu ở các điểm đông người.',e:{crowd:-.15}},
 scratcher:{n:'Cào sofa',k:'b',d:'Mỗi 10 phút có 15% khả năng cào hỏng sofa cùng phòng (trụ cào giảm còn 4%).',e:{scratch:1}},
 picky:{n:'Kén ăn',k:'b',d:'Ăn hạt khô chỉ no một nửa.',e:{picky:1}},
 lazy:{n:'Lười vận động',k:'b',d:'Viễn chinh chậm hơn 15%.',e:{speed:-.15}},
 coldfear:{n:'Sợ lạnh',k:'b',d:'−15% xu nếu xuất phát ban đêm.',e:{night:-.15}},
 hairball:{n:'Rụng lông',k:'b',d:'Mèo khác cùng phòng −4 độ vui.',e:{aura:-4}},
 grumpy:{n:'Khó ở',k:'b',d:'−10 độ vui.',e:{self:-10}},
 wander:{n:'La cà',k:'b',d:'Hay ghé chỗ này chỗ kia, viễn chinh chậm hơn 10%.',e:{speed:-.10}},
 waterfear:{n:'Sợ nước',k:'b',d:'−20% xu ở các điểm gần nước.',e:{water:-.20}},
 zoomies:{n:'Chạy đua 3 giờ sáng',k:'b',d:'Viễn chinh tốn thêm 30% năng lượng.',e:{cost:1.3}},
 clumsy:{n:'Hậu đậu',k:'b',d:'Hay đánh rơi đồ, −8% xu viễn chinh.',e:{coin:-.08}},
 jealous:{n:'Hay ghen',k:'b',d:'−10 độ vui khi phòng có từ 6 mèo trở lên.',e:{bigRoom:-10}},
 v_thunder:{n:'Ngủ gật mới mạnh',k:'x',d:'Nếu xuất phát khi năng lượng dưới 50 (đang buồn ngủ), xu viễn chinh ×2.',e:{sleepyX2:1}},
 v_hero:{n:'Giải cứu thế giới',k:'x',d:'Viễn chinh nhanh hơn 30%.',e:{speed:.30}},
 v_tank:{n:'Cơ bắp cuồn cuộn',k:'x',d:'Viễn chinh tốn nửa năng lượng, +10% xu.',e:{cost:.5,coin:.10}},
 v_ninja:{n:'Vô ảnh',k:'x',d:'Bỏ qua mọi hình phạt ở điểm đông người, +30% xu ban đêm.',e:{ignoreCrowd:1,night:.30}},
 v_chef:{n:'Bếp trưởng',k:'x',d:'Cả phòng ăn no hơn 25% mỗi bữa và đói chậm hơn 30%.',e:{auraHunger:.7,chef:1}},
 v_astro:{n:'Không trọng lực',k:'x',d:'+15% cơ hội mang vé gacha về.',e:{ticket:.15}},
 v_pirate:{n:'Săn kho báu',k:'x',d:'+40% xu ở điểm gần nước, +30% cơ hội có chiến lợi phẩm.',e:{water:.40,loot:.30}},
 v_royal:{n:'Thuế hoàng gia',k:'x',d:'+10% xu, và mọi mèo khác cùng phòng +5% xu viễn chinh.',e:{coin:.10,auraCoin:.05}},
 v_bread:{n:'Thơm mùi bơ',k:'x',d:'Mèo khác cùng phòng +15 độ vui.',e:{aura:15}},
 v_dj:{n:'Quẩy xuyên đêm',k:'x',d:'+25% xu ban đêm, mèo khác cùng phòng +8 độ vui.',e:{night:.25,aura:8}},
 v_naruto:{n:'Ảnh phân thân',k:'x',d:'25% cơ hội phân thân đi cùng: xu chuyến đó ×2.',e:{doubleCoin:.25}},
 v_luffy:{n:'Vua hải tặc tương lai',k:'x',d:'+35% xu ở điểm gần nước, nhưng đói nhanh hơn 30%.',e:{water:.35,hunger:1.3}},
 v_goku:{n:'Siêu Saiyan',k:'x',d:'+15% xu, viễn chinh tốn ít hơn 40% năng lượng, đói nhanh hơn 50%.',e:{coin:.15,cost:.6,hunger:1.5}},
 v_tanjiro:{n:'Khứu giác siêu nhạy',k:'x',d:'+40% cơ hội có chiến lợi phẩm, +5% cơ hội nhặt vé.',e:{loot:.4,ticket:.05}},
 v_nezuko:{n:'Ngủ trong hộp',k:'x',d:'+20 độ vui khi phòng có thùng carton, hồi năng lượng nhanh hơn 50%.',e:{like:['box',20],regen:1.5}},
 v_gojo:{n:'Vô hạn',k:'x',d:'+20% xu. Mọi hiệu ứng trừ xu đều không chạm tới bé.',e:{coin:.2,noPenalty:1}},
 v_anya:{n:'Waku waku!',k:'x',d:'+15 độ vui, +10% cơ hội nhặt vé gacha.',e:{self:15,ticket:.1}},
 v_frieren:{n:'Pháp sư ngàn năm',k:'x',d:'Đói chậm hơn 50%, +50% kinh nghiệm, nhưng viễn chinh chậm hơn 10%.',e:{hunger:.5,xp:1.5,speed:-.1}},
 v_levi:{n:'Binh trưởng sạch sẽ',k:'x',d:'Viễn chinh nhanh hơn 25%. Có bé ở nhà thì không mèo nào trong phòng dám cào đồ.',e:{speed:.25,roomNoScratch:1,noScratch:1}},
 v_pika:{n:'Mười vạn vôn',k:'x',d:'Viễn chinh nhanh hơn 20%, +10% xu.',e:{speed:.2,coin:.1}},
 v_totoro:{n:'Thần rừng',k:'x',d:'+40% xu ở điểm thiên nhiên, mèo khác cùng phòng +8 độ vui.',e:{nature:.4,aura:8}},
 v_dora:{n:'Túi thần kỳ',k:'x',d:'Chuyến nào cũng móc thêm được chiến lợi phẩm (+15 xu).',e:{loot:1}},
 v_sailor:{n:'Nhân danh mặt trăng',k:'x',d:'+40% xu nếu xuất phát ban đêm.',e:{night:.4}},
 v_conan:{n:'Thám tử lừng danh',k:'x',d:'+10% cơ hội nhặt vé, +50% kinh nghiệm.',e:{ticket:.1,xp:1.5}},
 v_harry:{n:'Phép nhân bản',k:'x',d:'30% cơ hội nhân đôi toàn bộ phần thưởng chuyến đi (xu, chiến lợi phẩm, vé).',e:{doubleAll:.3}},
 v_hermione:{n:'Mọt sách',k:'x',d:'Chuyến viễn chinh của bé cho gấp đôi kinh nghiệm.',e:{xp:2}},
 v_voldemort:{n:'Kẻ-mà-ai-cũng-biết',k:'x',d:'+35% xu ban đêm, nhưng mèo khác cùng phòng −8 độ vui.',e:{night:.35,aura:-8}},
 v_wednesday:{n:'Không bao giờ vui',k:'x',d:'Độ vui luôn đứng yên ở 35, bù lại độ no không bao giờ giảm.',e:{fixedHappy:35,hunger:.0001}},
 v_eleven:{n:'Siêu năng lực',k:'x',d:'Viễn chinh nhanh hơn 30%, nhưng tốn thêm 30% năng lượng.',e:{speed:.3,cost:1.3}},
 v_heist:{n:'Phi vụ thế kỷ',k:'x',d:'+40% xu ở các điểm đông người.',e:{crowd:.4}},
 v_guard:{n:'Đèn xanh đèn đỏ',k:'x',d:'Mỗi chuyến là một canh bạc: xu nhân ngẫu nhiên từ ×0,5 đến ×1,7.',e:{gamble:[.5,1.7]}},
 v_456:{n:'Người chơi 456',k:'x',d:'+10% xu, và 4,56% cơ hội mang về thêm 456 xu.',e:{coin:.1,jackpot:1}},
 v_iron:{n:'Lò phản ứng hồ quang',k:'x',d:'Viễn chinh tốn ít hơn 60% năng lượng, nhanh hơn 10%.',e:{cost:.4,speed:.1}},
 v_spider:{n:'Giác quan nhện',k:'x',d:'Bỏ qua phạt ở điểm đông người, nhanh hơn 15%, +12 độ vui khi phòng có tháp mèo.',e:{ignoreCrowd:1,speed:.15,like:['tree',12]}},
 v_batman:{n:'Hiệp sĩ bóng đêm',k:'x',d:'+45% xu nếu xuất phát ban đêm.',e:{night:.45}},
 v_jedi:{n:'Thần lực',k:'x',d:'Viễn chinh nhanh hơn 15%, +12% xu.',e:{speed:.15,coin:.12}},
 v_vader:{n:'Mặt tối của Thần lực',k:'x',d:'+30% xu, nhưng mèo khác cùng phòng −5 độ vui.',e:{coin:.3,aura:-5}},
 v_gandalf:{n:'Không bao giờ đến muộn',k:'x',d:'Viễn chinh nhanh hơn 20%, và luôn được tính như đang vui tối đa.',e:{speed:.2,alwaysHappy:1}},
 v_nyan:{n:'Bay xuyên vũ trụ',k:'x',d:'Viễn chinh nhanh gấp đôi.',e:{speed:.5}},
 v_maneki:{n:'Chiêu tài',k:'x',d:'Chỉ cần có bé trong nhà: +30% xu từ mọi nguồn (viễn chinh, vuốt ve, cảm ơn bữa ăn).',e:{allCoin:.3}},
 v_grumpy:{n:'Cau có nổi tiếng',k:'x',d:'−15 độ vui, nhưng +30% xu ở điểm đông người vì ai cũng muốn chụp ảnh.',e:{self:-15,crowd:.3}},
 v_huh:{n:'Huh?',k:'x',d:'Không ai hiểu bé làm gì ngoài đó: xu nhân ngẫu nhiên từ ×0,7 đến ×1,5.',e:{gamble:[.7,1.5]}},
 v_garfield:{n:'Ghét thứ Hai',k:'x',d:'+15% xu mọi ngày, riêng thứ Hai (giờ thật) thì −20%. Đói nhanh hơn 50%.',e:{monday:1,hunger:1.5}},
};
const CONFLICT=[['swimmer','waterfear'],['charmer','shy'],['fast','lazy'],['fast','wander'],['glutton','smalleater'],['nightowl','coldfear'],['gentle','scratcher'],['gentle','grumpy'],['sturdy','zoomies'],['sleeper','zoomies'],['sleeper','fast']];

/* ============ THỨC ĂN (giá niêm yết là cho 8 suất; mỗi bát chỉ trả cho số suất cần đổ thêm) ============ */
const FOODS=[
 {id:'kibble',n:'Hạt khô',ic:'🥣',price:10,full:35,d:'Rẻ, no lâu: đói chậm hơn 30% trong 60 phút.',buff:{hunger:.7},min:60},
 {id:'pate',n:'Pate',ic:'🥫',price:25,full:50,hp:5,d:'No nhiều, +5 độ vui.'},
 {id:'tuna',n:'Cá ngừ',ic:'🐟',price:40,full:30,d:'+20% xu viễn chinh trong 30 phút, nhưng đói nhanh hơn 50%.',buff:{coin:.20,hunger:1.5},min:30},
 {id:'salmon',n:'Cá hồi',ic:'🍣',price:60,full:45,en:15,d:'+15 năng lượng, +10% xu trong 30 phút.',buff:{coin:.10},min:30},
 {id:'chicken',n:'Ức gà',ic:'🍗',price:45,full:40,en:25,d:'+25 năng lượng, không có buff xu.'},
 {id:'churu',n:'Súp thưởng',ic:'🍥',price:30,full:10,hp:25,d:'Gần như không no, nhưng +25 độ vui.'},
 {id:'catnip',n:'Cỏ mèo',ic:'🌿',price:50,full:0,en:-10,d:'Buff mạnh 10 phút: +30% xu, viễn chinh nhanh hơn 20%. Sau đó −10 năng lượng.',buff:{coin:.30,speed:.20},min:10},
 {id:'premium',n:'Hộp cao cấp',ic:'🍱',price:150,full:60,hp:15,en:15,d:'Đắt: +15 vui, +15 năng lượng, +15% xu và đói chậm hơn 20% trong 60 phút.',buff:{coin:.15,hunger:.8},min:60},
];
const FOOD=Object.fromEntries(FOODS.map(f=>[f.id,f]));

/* ============ NỘI THẤT ============ */
// kind: floor | wall | rug. use: cách mèo tương tác. g: hiệu ứng toàn nhà (mỗi loại tính 1 lần).
const FURNS=[
 {id:'box',n:'Thùng carton',price:80,kind:'floor',w:30,h:22,happy:3,d:'+3 độ vui trong phòng.',use:{dx:0,dy:-4,front:0,emo:'note'}},
 {id:'yarn',n:'Cuộn len',price:100,kind:'floor',w:14,h:13,g:{pet:1},d:'Vuốt ve được thêm 1 xu.',use:{dx:13,dy:1,front:1,emo:'note'}},
 {id:'mouse',n:'Chuột đồ chơi',price:120,kind:'floor',w:14,h:9,happy:4,d:'+4 độ vui trong phòng.',use:{dx:13,dy:1,front:1,emo:'note'}},
 {id:'picture',n:'Tranh cá',price:120,kind:'wall',w:24,h:20,happy:2,d:'+2 độ vui trong phòng.'},
 {id:'bed',n:'Nệm ngủ',price:150,kind:'floor',w:44,h:18,regen:1.15,d:'Mèo trong phòng hồi năng lượng nhanh hơn 15%.',use:{dx:0,dy:-5,front:1,sleep:1,emo:'z'}},
 {id:'plant',n:'Cây cảnh',price:150,kind:'floor',w:20,h:36,happy:2,d:'+2 độ vui trong phòng.'},
 {id:'rug',n:'Thảm',price:180,kind:'rug',w:70,h:22,happy:3,d:'+3 độ vui trong phòng.',use:{dx:0,dy:-6,front:1,sleep:1,emo:'z'}},
 {id:'lamp',n:'Đèn cây',price:200,kind:'floor',w:16,h:46,g:{night:.05},d:'+5% xu cho chuyến xuất phát ban đêm.'},
 {id:'post',n:'Trụ cào móng',price:250,kind:'floor',w:20,h:44,g:{speed:.08},guard:1,d:'Viễn chinh nhanh hơn 8%. Giảm mạnh khả năng mèo cào sofa trong phòng.',use:{dx:17,dy:1,front:1,emo:'note'}},
 {id:'shelf',n:'Kệ tường',price:300,kind:'wall',w:40,h:8,happy:4,d:'+4 độ vui. Mèo thích leo lên ngồi.',use:{dx:0,dy:-6,front:1,emo:'note'}},
 {id:'window',n:'Cửa sổ ngắm chim',price:400,kind:'wall',w:46,h:38,happy:6,g:{ticket:.05},d:'+6 độ vui, +5% cơ hội nhặt vé gacha.',use:{floor:1,emo:'excl'}},
 {id:'sofa',n:'Sofa',price:500,kind:'floor',w:64,h:34,happy:8,breakable:1,d:'+8 độ vui. Có thể bị mèo cào hỏng (sửa tốn 30% giá).',use:{dx:-10,dy:-13,front:1,sleep:1,emo:'z'}},
 {id:'tank',n:'Bể cá',price:600,kind:'floor',w:36,h:44,happy:5,thank:2,d:'+5 độ vui, mỗi bữa ăn được thêm 2 xu cảm ơn mỗi bé.',use:{dx:-26,dy:2,front:1,emo:'excl'}},
 {id:'catnip',n:'Chậu cỏ mèo',price:800,kind:'floor',w:20,h:30,g:{speed:.10},d:'Viễn chinh nhanh hơn 10%.',use:{dx:15,dy:2,front:1,emo:'heart'}},
 {id:'tree',n:'Tháp mèo',price:1200,kind:'floor',w:46,h:76,happy:5,g:{coin:.15},d:'+15% xu viễn chinh, +5 độ vui.',use:{dx:2,dy:-70,front:1,sleep:1,emo:'z'}},
];
const FURN=Object.fromEntries(FURNS.map(f=>[f.id,f]));

/* ============ PHÒNG ============ */
const ROOMS=[
 {id:'living',n:'Phòng khách',price:0,cap:8,d:'Căn phòng đầu tiên, ấm cúng.'},
 {id:'bedroom',n:'Phòng ngủ',price:600,cap:8,regen:1.25,d:'Yên tĩnh: hồi năng lượng nhanh hơn 25%.'},
 {id:'kitchen',n:'Bếp',price:850,cap:6,hunger:.8,d:'Gần đồ ăn: mèo ở đây đói chậm hơn 20%.'},
 {id:'balcony',n:'Ban công',price:1200,cap:6,happy:8,outdoor:1,d:'Ngoài trời: +8 độ vui, hợp với mèo thích tắm nắng.'},
 {id:'bathroom',n:'Phòng tắm',price:1700,cap:5,happy:4,regen:1.1,d:'Sạch sẽ, mát mẻ: +4 độ vui, hồi năng lượng nhanh hơn 10%.'},
 {id:'playroom',n:'Phòng chơi',price:2400,cap:10,happy:6,d:'Rộng và nhiều màu: +6 độ vui.'},
 {id:'dining',n:'Phòng ăn',price:3300,cap:8,thank:2,d:'Mỗi bữa ăn được thêm 2 xu cảm ơn từ mỗi bé.'},
 {id:'attic',n:'Gác mái',price:4600,cap:6,regen:1.2,happy:3,d:'Góc riêng yên ắng: hồi năng lượng nhanh hơn 20%, +3 độ vui.'},
 {id:'garden',n:'Sân vườn',price:6500,cap:12,happy:10,outdoor:1,d:'Ngoài trời, rộng: +10 độ vui.'},
 {id:'library',n:'Thư viện',price:9000,cap:8,coin:.06,d:'Mèo ở đây +6% xu viễn chinh.'},
 {id:'gameroom',n:'Phòng game',price:12500,cap:10,happy:9,d:'Đèn neon và máy chơi game: +9 độ vui.'},
 {id:'greenhouse',n:'Nhà kính',price:17500,cap:8,happy:7,hunger:.9,outdoor:1,d:'Đầy cây xanh: +7 độ vui, đói chậm hơn 10%, tính là ngoài trời.'},
 {id:'tatami',n:'Phòng Nhật',price:24500,cap:8,regen:1.25,happy:5,d:'Chiếu tatami và cửa giấy: hồi năng lượng nhanh hơn 25%, +5 độ vui.'},
 {id:'basement',n:'Tầng hầm',price:34000,cap:10,night:.10,d:'Mèo ở đây +10% xu khi xuất phát ban đêm.'},
 {id:'pool',n:'Hồ bơi',price:48000,cap:10,happy:8,outdoor:1,water:1,d:'+8 độ vui. Mèo thích nước thêm +10, mèo sợ nước −10.'},
 {id:'rooftop',n:'Sân thượng',price:67000,cap:12,happy:6,outdoor:1,ticket:.03,d:'Ngoài trời: +6 độ vui, +3% cơ hội nhặt vé gacha.'},
 {id:'royal',n:'Phòng hoàng gia',price:90000,cap:12,happy:8,coin:.10,d:'Thảm đỏ, cột vàng: +8 độ vui, +10% xu viễn chinh.'},
];
const ROOM=Object.fromEntries(ROOMS.map(r=>[r.id,r]));
ROOM.wait={id:'wait',n:'Phòng chờ',cap:Infinity,wait:1,d:'Nơi ở tạm của mèo chưa có phòng. Không có bonus, không được cho ăn.'};

/* ============ ĐIỂM VIỄN CHINH ============ */
const DESTS=[
 {id:'alley',n:'Quanh xóm',ic:'🏘',min:10,coin:50,en:25,lvl:1,tags:[],d:'Gần nhà, an toàn.'},
 {id:'park',n:'Công viên',ic:'🌳',min:10,coin:55,en:25,lvl:1,tags:['nature'],d:'Thiên nhiên.'},
 {id:'market',n:'Chợ cá',ic:'🐟',min:10,coin:65,en:30,lvl:2,tags:['crowd'],d:'Đông người.'},
 {id:'lake',n:'Bờ hồ',ic:'🎣',min:20,coin:115,en:40,lvl:3,tags:['water','nature'],d:'Gần nước, thiên nhiên.'},
 {id:'harbor',n:'Bến cảng',ic:'⚓',min:30,coin:165,en:50,lvl:5,tags:['water','crowd'],d:'Gần nước, đông người.'},
];
const DEST=Object.fromEntries(DESTS.map(d=>[d.id,d]));
const TAGN={crowd:'đông người',water:'gần nước',nature:'thiên nhiên'};

const NAMES=['Miu','Mít','Bơ','Sữa','Đậu','Mochi','Kem','Xoài','Na','Gấu','Cam','Su','Bánh Bao','Tôm','Tép','Khoai','Lu','Nấm','Mực','Bí','Ổi','Ki','Lạc','Vừng','Cốm','Chanh','Tiêu','Pate','Bún','Phở','Nem','Xôi','Mập','Bông','Mun','Mướp','Vàng','Đen','Tí','Tèo','Ú','Mỡ','Cục Bông','Hạt Dẻ','Bắp','Mận','Dừa','Kẹo','Nho','Sóc','Gạo','Trứng','Bột','Tofu','Sushi','Latte','Cacao','Mì','Chè','Bún Đậu'];
const LOOT=['một chiếc tất','lá cây khô','con cá khô','nắp chai','cái kẹp tóc','một con dế','chiếc lông chim','viên bi ve','tờ hóa đơn nhàu','cọng dây thun','con thạch sùng đồ chơi','chiếc dép lẻ'];

/* ============ GIỐNG CHÂN NGẮN ============ */
BREEDS.push(
 B('lambkin','Lambkin',4,WHT,WHT,'solid',{eye:eB,fur:1},'Munchkin lai Selkirk Rex: chân ngắn, lông xoăn như cừu con.','gentle lapcat clumsy','churu'),
 B('bambino','Bambino',4,PNK,PNK,'solid',{eye:eG,ear:'big'},'Sphynx chân ngắn, mãi trông như mèo con.','coldfear lapcat playful','chicken'),
 B('kinkalow','Kinkalow',4,BRN,DBRN,'tabby',{eye:eY,ear:'curl'},'Chân ngắn của Munchkin, tai cong của American Curl.','playful charmer','churu'),
 B('skookum','Skookum',4,ORG,DORG,'tabby',{eye:eG,fur:1,w:1},'Chân ngắn, lông xoăn lọn của LaPerm.','playful lapcat','pate'),
 B('dwelf','Dwelf',4,PNK,PNK,'solid',{eye:eG,ear:'curl'},'Không lông, chân ngắn, tai cong: trông như yêu tinh nhỏ.','coldfear sunbath loyal','chicken'),
 B('genetta','Genetta',4,'#e0a860',DBRN,'spot',{eye:eG},'Chân ngắn, thân dài, đốm như cầy hương.','hunter playful','chicken')
);
const SHORT_LEGS=['munchkin','minuet','lambkin','bambino','kinkalow','skookum','dwelf','genetta'];
const HAIRLESS=['sphynx','peterbald','donskoy','bambino','dwelf'];

/* ============ MÀU LÔNG ============ */
// u: màu ít gặp hơn trong giống (tỉ lệ ra thấp). f: tỉ lệ ra mèo cái của riêng màu đó.
const COATS={
 // Dạng của mèo trang phục 5★ (Goku, Naruto): mỗi dạng là một "màu lông" có bộ trang phục riêng (cos).
 // form:1 = dạng hiếm (sao cầu vồng, có trait riêng tr); aura = màu luồng khí bốc quanh thân khi ở trong phòng. gkSSJ là dạng biến hình tạm thời, không rơi từ gacha.
 // Trang phục hiếm của 13 bé 5★ còn lại (2026-11-10): mỗi bé một bộ, gắn với chính nhân vật hoặc gốc gác của giống. Luôn có luồng khí (aura) để nổi hơn 5★ thường.
 ztGod:{n:'Hỏa Lôi Thần',c:CRM,aura:'#ffe14a',cos:[['sword'],['haircap','#ffe27a',12,1],['tripat','#fffbe8','#ffc21a'],['sparks','#fff3a0'],['bolts','#ffe14a'],['aura','#ffe14a']],u:1,rw:.12,form:1,tr:'f_zt'},
 gjSix:{n:'Lục Nhãn giác ngộ',c:'#e9e4ef',eye:'#38b6ff',gem:1,lash:1,aura:'#b98bff',cos:[['spikes','#fafbff'],['suit','#1f1d2b',24,1],['collar','#7a5ae0'],['orb','#a45cff'],['aura','#b98bff']],u:1,rw:.12,form:1,tr:'f_six'},
 hpSeeker:{n:'Tầm thủ Gryffindor',c:CRM,eye:eG,aura:'#ffd24a',cos:[['cape','#8a1f2a'],['wand'],['haircap','#3a3448',12,1],['scar','bolt'],['glasses','#3a3448'],['suit','#c0303a'],['scarf','#f2c230','#b8323a'],['snitch'],['aura','#ffd24a']],u:1,rw:.12,form:1,tr:'f_seeker'},
 vdWhite:{n:'Vader Trắng',c:'#2e2a38',aura:'#bfe6ff',cos:[['vcape'],['flag','noFace'],['flag','noMuz'],['vhelm'],['vface'],['vsuit'],['inv'],['aura','#bfe6ff']],u:1,rw:.12,form:1,tr:'f_white'},
 nyTac:{n:'Tac Nayn (bánh waffle)',c:'#3a3644',eye:'#ff3a3a',aura:'#a070f0',cos:[['nrainbow',1],['npoptart',1],['cheeks','#a8566a'],['nstars'],['aura','#a070f0']],u:1,rw:.12,form:1,tr:'f_tac'},
 mkGold:{n:'Vàng ròng',c:'#f0b93a',aura:'#ffe07a',cos:[['belly','#fff1c0'],['collar','#d8342c',1],['paw'],['coin'],['sparks','#fff7c0'],['aura','#ffe07a']],u:1,rw:.12,form:1,tr:'f_gold'},
 asOrange:{n:'Bộ đồ phóng tàu cam',c:WHT,eye:eB,aura:'#ffb347',cos:[['suit','#f08a3a',22,1],['astroF'],['helmet'],['aura','#ffb347']],u:1,rw:.12,form:1,tr:'f_launch'},
 ryPurple:{n:'Hoàng bào tím',c:WHT,eye:eC,aura:'#c9a6ff',cos:[['old','royal'],['hue',330,20,276,.35],['aura','#c9a6ff']],u:1,rw:.12,form:1,tr:'f_purple'},
 kmChada:{n:'Mão vàng hoàng cung',c:WHT,aura:'#ffe07a',cos:[['chada'],['collar','#f2c230',1],['aura','#ffe07a']],u:1,rw:.165,form:1,tr:'f_chada'},
 lyHood:{n:'Khăn đỏ',c:'#55505f',c2:'#b9b2c2',c3:'#8a7f8f',pat:'lykoi',aura:'#ff8a8a',cos:[['cape','#c8323c'],['hood','#c8323c'],['aura','#ff8a8a']],u:1,rw:.22,form:1,tr:'f_hood'},
 svEgypt:{n:'Mèo của Pharaoh',c:GOLD,c2:BLK,pat:'spot',aura:'#ffd24a',cos:[['usekh'],['eartips','#f2c230'],['aura','#ffd24a']],u:1,rw:.37,form:1,tr:'f_pharaoh'},
 skForest:{n:'Thần rừng',c:'#b8905a',c2:DBRN,pat:'tiger',aura:'#8ee08a',cos:[['cape','#3f9a55'],['wreath'],['aura','#8ee08a']],u:1,rw:.22,form:1,tr:'f_forest'},
 spMalai:{n:'Vòng hoa nhài',c:'#b5652f',aura:'#fff3c4',cos:[['malai'],['aura','#fff3c4']],u:1,rw:.15,form:1,tr:'f_malai'},
 gkBase:{n:'Trang phục thường',c:CRM,eye:'#3a3448',cos:[['gears','#35303f'],['ggi'],['halo']]},
 gkGod:{n:'Siêu Saiyan God (đỏ)',c:CRM,eye:'#e8324a',gem:1,aura:'#ff6a7a',cos:[['gears','#e8405e'],['ggi',1],['aura','#ff6a7a'],['halo']],u:1,rw:.12,form:1,tr:'f_god'},
 gkSSJ:{n:'Siêu Saiyan',c:CRM,eye:'#2fc4a0',gem:1,aura:'#ffd83a',cos:[['gears','#ffd83a'],['ggi'],['aura','#ffd83a'],['halo']]},
 nrBase:{n:'Ninja làng Lá',c:CRM,eye:'#3d8fe8',cos:[['spk','#f7cf3a','naruto'],['nbandT'],['nband'],['hcap','#f7cf3a','naruto'],['marks'],['nsuit']]},
 nrKurama:{n:'Tiên nhân Cửu Vĩ',c:'#ffab32',eye:'#ff9a28',aura:'#ffd83a',cos:[['kcape'],['spk','#fff2a6','kurama'],['hcap','#fff2a6','kurama'],['kface'],['kcloak'],['aura','#ffd83a'],['korbs']],u:1,rw:.12,form:1,tr:'f_kurama'},
 nrHokage:{n:'Hokage Đệ Thất',c:CRM,eye:'#3d8fe8',cos:[['hcape'],['hveil'],['hbangs','#f7cf3a'],['hhat'],['marks'],['hcloak']],u:1,rw:.12,form:1,tr:'f_hokage'},
 kmIce:{n:'Trắng, mắt xanh băng & hổ phách',c:WHT,eye:'#8fdcff',eye2:'#ffab2e'},kmSapphire:{n:'Trắng, mắt sapphire & vàng kim',c:WHT,eye:'#2f66ee',eye2:'#ffd23a',u:1,rw:.12,jewel:1},
 kmEmerald:{n:'Trắng, mắt ngọc lục bảo & hổ phách',c:WHT,eye:'#1fc47c',eye2:'#ff962e',u:1,rw:.12,jewel:1},kmAmethyst:{n:'Trắng, mắt thạch anh tím & xanh băng',c:WHT,eye:'#a65cf2',eye2:'#8fdcff',u:1,rw:.12,jewel:1},kmRuby:{n:'Trắng, mắt hồng ngọc & bạc',c:WHT,eye:'#ee3050',eye2:'#c2cee0',u:1,rw:.12,jewel:1},
 white:{n:'Trắng',c:WHT},whiteY:{n:'Trắng mắt vàng',c:WHT,eye:eY},oddWhite:{n:'Trắng mắt hai màu',c:WHT,eye:eB,eye2:eY,u:1},
 black:{n:'Đen',c:BLK},blackRust:{n:'Đen ánh nâu',c:'#4a3a3c'},bombay:{n:'Đen tuyền',c:'#2a2636',eye:eC},bombaySable:{n:'Nâu sable',c:'#4a342c',eye:eC,u:1},
 blue:{n:'Xanh xám',c:BLU},blueLight:{n:'Xanh xám nhạt',c:'#9aa6bd'},blueDark:{n:'Xanh xám đậm',c:'#66728c'},koratBlue:{n:'Xanh ánh bạc',c:'#8f9bb0'},
 cream:{n:'Kem',c:CRM,f:.4},red:{n:'Đỏ cam',c:ORG,f:.2},redBurm:{n:'Đỏ',c:'#b5653a',f:.25},choc:{n:'Sô-cô-la',c:CHOC},lilac:{n:'Tím hoa cà',c:'#c9b8c8'},
 sable:{n:'Nâu sable',c:SAB},champagne:{n:'Champagne',c:'#d9bf9a'},platinum:{n:'Bạch kim',c:'#cfcfd8'},copper:{n:'Đồng đỏ',c:'#b5652f'},copperDark:{n:'Đồng sẫm',c:'#8f4a22',u:1},
 brownTabby:{n:'Mướp nâu',c:BRN,c2:DBRN,pat:'tabby'},brownTabbyW:{n:'Mướp nâu ngực trắng',c:BRN,c2:DBRN,pat:'tabby',w:2},
 grayTabby:{n:'Mướp xám',c:GRY,c2:DGRY,pat:'tabby'},silverTabby:{n:'Mướp bạc',c:SIL,c2:BLK,pat:'tabby'},blueTabby:{n:'Mướp xanh xám',c:'#b0b6c4',c2:'#8a91a3',pat:'tabby'},
 redTabby:{n:'Mướp vàng cam',c:ORG,c2:DORG,pat:'tabby',f:.2},redTabbyW:{n:'Vàng cam ngực trắng',c:ORG,c2:DORG,pat:'tabby',w:1,f:.2},creamTabby:{n:'Mướp kem',c:CRM,c2:'#e0b070',pat:'tabby',f:.35},
 calico:{n:'Tam thể',c:WHT,c2:ORG,c3:BLK,pat:'calico',f:.9995},diluteCalico:{n:'Tam thể nhạt',c:WHT,c2:'#f0c890',c3:BLU,pat:'calico',f:.9995},calicoDark:{n:'Tam thể đậm',c:'#f6ecd8',c2:DORG,c3:'#2a2636',pat:'calico',f:.9995},
 tortie:{n:'Đồi mồi',c:BLK,c2:ORG,pat:'tortie',f:.9995},diluteTortie:{n:'Đồi mồi nhạt',c:BLU,c2:'#f0c890',pat:'tortie',f:.9995},chocTortie:{n:'Đồi mồi sô-cô-la',c:CHOC,c2:ORG,pat:'tortie',f:.9995},
 cow:{n:'Trắng đen (bò sữa)',c:WHT,c2:BLK,pat:'cow'},grayCow:{n:'Trắng xám',c:WHT,c2:GRY,pat:'cow'},brownCow:{n:'Trắng nâu',c:WHT,c2:BRN,pat:'cow'},redW:{n:'Trắng cam',c:WHT,c2:ORG,pat:'cow',f:.25},
 tux:{n:'Tuxedo đen trắng',c:BLK,w:2},blueW:{n:'Xanh xám trắng',c:BLU,w:2},
 van:{n:'Van đỏ',c:WHT,c2:ORG,pat:'van'},vanBlack:{n:'Van đen',c:WHT,c2:BLK,pat:'van'},
 sealPt:{n:'Seal point',c:CRM,c2:SEAL,pat:'point',eye:eB},bluePt:{n:'Blue point',c:'#eef0f2',c2:'#7a8296',pat:'point',eye:eB},chocPt:{n:'Chocolate point',c:'#f6ead8',c2:'#9a6a4a',pat:'point',eye:eB},
 lilacPt:{n:'Lilac point',c:'#f6f0f2',c2:'#b9a6b6',pat:'point',eye:eB},flamePt:{n:'Flame point',c:WHT,c2:ORG,pat:'point',eye:eB,f:.25},creamPt:{n:'Cream point',c:WHT,c2:'#f0c890',pat:'point',eye:eB,f:.4},lynxPt:{n:'Lynx point',c:CRM,c2:GRY,pat:'point',eye:eB},
 sealMit:{n:'Seal mitted',c:CRM,c2:SEAL,pat:'point',mit:1,eye:eB},blueMit:{n:'Blue mitted',c:'#eef0f2',c2:'#7a8296',pat:'point',mit:1,eye:eB},lilacMit:{n:'Lilac mitted',c:'#f6f0f2',c2:'#b9a6b6',pat:'point',mit:1,eye:eB},
 sealBi:{n:'Seal bicolor',c:CRM,c2:SEAL,pat:'point',w:2,eye:eB},blueBi:{n:'Blue bicolor',c:'#eef0f2',c2:'#7a8296',pat:'point',w:2,eye:eB},lilacBi:{n:'Lilac bicolor',c:'#f6f0f2',c2:'#b9a6b6',pat:'point',w:2,eye:eB},
 minkNat:{n:'Mink tự nhiên',c:'#b89878',c2:'#6b4a3a',pat:'point',eye:eA},minkBlue:{n:'Mink xanh',c:'#c3c8d4',c2:'#7a8296',pat:'point',eye:eA},minkChamp:{n:'Mink champagne',c:'#ead8c0',c2:'#b08a6a',pat:'point',eye:eA},
 smoke:{n:'Đen khói',c:'#d9dbe2',c2:'#4a4458',pat:'smoke',u:1},chinchilla:{n:'Chinchilla bạc',c:'#f4f5f8',c2:'#c3c8d0',pat:'smoke',eye:eG,u:1},goldShade:{n:'Vàng kim ánh',c:'#f6dfb0',c2:'#d9a860',pat:'smoke',eye:eG,u:1},silverShade:{n:'Bạc ánh',c:SIL,c2:GRY,pat:'smoke',eye:eG},
 spotBrown:{n:'Đốm nâu',c:'#e0a860',c2:DBRN,pat:'spot'},spotSilver:{n:'Đốm bạc',c:SIL,c2:BLK,pat:'spot'},spotSnow:{n:'Snow (tuyết)',c:'#f6ecd8',c2:'#b08a5a',pat:'spot',eye:eB,u:1},
 spotGold:{n:'Đốm vàng',c:GOLD,c2:BLK,pat:'spot'},spotChoc:{n:'Đốm sô-cô-la',c:FAWN,c2:CHOC,pat:'spot'},spotBlue:{n:'Đốm xanh xám',c:'#d0d4dc',c2:'#7a8296',pat:'spot'},
 ruddy:{n:'Ruddy (hung đỏ)',c:RUD,c2:'#8a4a20',pat:'ticked'},sorrel:{n:'Sorrel (đỏ quế)',c:'#d98a50',c2:'#a85a2a',pat:'ticked'},blueTick:{n:'Blue',c:'#a8b0c0',c2:'#7a8296',pat:'ticked'},fawnTick:{n:'Fawn',c:'#e0c4a8',c2:'#c09a78',pat:'ticked'},
 sepia:{n:'Sepia agouti',c:'#d8bf9a',c2:'#8a6a48',pat:'ticked'},sepiaDark:{n:'Sepia sẫm',c:'#c0a078',c2:'#6e4e30',pat:'ticked'},grizzle:{n:'Grizzled',c:'#6a6470',c2:'#b9b2c2',pat:'ticked',u:1},
 tigerOr:{n:'Vằn hổ cam',c:ORG,c2:BLK,pat:'tiger',w:1},tigerBrown:{n:'Vằn gỗ nâu',c:'#b8905a',c2:DBRN,pat:'tiger'},tigerDark:{n:'Vằn gỗ sẫm',c:'#9a7448',c2:'#3a2a1c',pat:'tiger'},
 hlPink:{n:'Da hồng',c:PNK},hlCream:{n:'Da kem',c:'#f0d8c0'},hlGray:{n:'Da xám',c:'#b8b0b8'},hlBlack:{n:'Da đen',c:'#5a5260'},hlPied:{n:'Da loang',c:PNK,c2:'#8a8090',pat:'cow'},
 lyBlack:{n:'Đen loang (roan)',c:'#55505f',c2:'#b9b2c2',c3:'#8a7f8f',pat:'lykoi'},lyBlue:{n:'Xám loang',c:'#7a8296',c2:'#d0d4dc',c3:'#a8a0a8',pat:'lykoi'},
};
// màu đầu tiên là màu mặc định của giống
const BREED_COATS={
 muop:'brownTabbyW grayTabby silverTabby brownTabby',vang:'redTabbyW redTabby creamTabby redW',mun:'black blackRust smoke',trang:'white whiteY oddWhite',
 venxam:'grayTabby blueTabby silverTabby',bosua:'cow grayCow redW',tuxedo:'tux blueW vanBlack',tamthe:'calico diluteCalico calicoDark',doimoi:'tortie diluteTortie chocTortie',
 amshort:'silverTabby brownTabby redTabby blueTabby',european:'brownTabbyW grayTabby black white',british:'blue cream white silverTabby lilac',exotic:'redTabby cream blue calico',
 mainecoon:'brownTabbyW redTabbyW smoke silverTabby',persian:'white cream smoke chinchilla',ragdoll:'sealMit blueBi lilacPt flamePt',russian:'blue blueLight blueDark',
 scottish:'blue white calico blueTabby',scotstraight:'creamTabby blue cow brownTabby',siamese:'sealPt bluePt chocPt lilacPt',thai:'sealPt bluePt chocPt',
 abyssinian:'ruddy sorrel blueTick fawnTick',ambobtail:'brownTabby redTabby spotBrown',amcurl:'redTabbyW brownTabbyW white sealPt',amwire:'van cow brownTabbyW',
 balinese:'sealPt bluePt chocPt lilacPt',bengal:'spotBrown spotSilver spotSnow',birman:'sealMit blueMit lilacMit',bombay:'bombay bombaySable',
 britishlh:'cream blue lilac goldShade',burmese:'sable champagne blue platinum',burmilla:'silverShade goldShade chinchilla',chartreux:'blue blueLight blueDark',
 colorpoint:'flamePt creamPt lynxPt',cornish:'white black blue redTabby',devon:'champagne black white brownTabby',euburmese:'redBurm sable cream tortie',
 himalayan:'sealPt bluePt chocPt flamePt',jbobtail:'calico redW cow white',kurilian:'brownTabby redTabby grayTabby',laperm:'redTabby brownTabby choc tortie',
 manx:'redTabbyW brownTabby cow black',munchkin:'redTabbyW cow calico brownTabbyW',norwegian:'brownTabbyW redTabbyW cow smoke',ocicat:'spotChoc spotSilver spotBrown',
 oriental:'black white choc blue',ragamuffin:'brownTabbyW calico blueW redTabbyW',selkirk:'cream white blue redTabby',siberian:'brownTabby redTabby grayTabby smoke',
 snowshoe:'sealBi blueBi lilacBi',somali:'ruddy sorrel blueTick fawnTick',sphynx:'hlPink hlCream hlGray hlPied',tonkinese:'minkNat minkBlue minkChamp',
 angora:'white black cream oddWhite',minuet:'grayCow white cream calico',ausmist:'spotChoc spotBlue spotGold',mau:'spotSilver spotBrown smoke',havana:'choc lilac',
 korat:'koratBlue blueLight',cymric:'brownTabby redTabbyW cow black',nebelung:'blue blueLight blueDark',orientallh:'choc black lilac white',peterbald:'hlCream hlPink hlGray hlBlack',
 pixiebob:'spotBrown spotChoc',singapura:'sepia sepiaDark',toyger:'tigerOr tigerBrown',van:'van vanBlack',chausie:'ruddy black grizzle',donskoy:'hlGray hlPink hlCream hlBlack',
 highlander:'spotChoc spotBrown spotSilver',serengeti:'spotGold black smoke',germanrex:'platinum white black redTabby',neva:'sealPt bluePt lynxPt flamePt',aphrodite:'brownCow cow redW',
 toybob:'sealPt bluePt lynxPt',khaomanee:'kmIce kmSapphire kmEmerald kmAmethyst kmRuby kmChada',lykoi:'lyBlack lyBlue lyHood',savannah:'spotGold spotSilver black smoke svEgypt',sokoke:'tigerBrown tigerDark skForest',suphalak:'copper copperDark spMalai',
 lambkin:'white cream cow redTabby',bambino:'hlPink hlCream hlPied',kinkalow:'brownTabby black calico cream',skookum:'redTabbyW cow blue',dwelf:'hlPink hlGray hlBlack',genetta:'spotBrown spotSilver',
};
const FORMS={v_goku:'gkBase gkGod',v_naruto:'nrBase nrKurama nrHokage'};
// tám mèo trang phục 5★ còn lại: trang phục thường (lấy đúng ngoại hình gốc) + một trang phục hiếm
const FORM0={v_thunder:'ztGod',v_gojo:'gjSix',v_harry:'hpSeeker',v_vader:'vdWhite',v_nyan:'nyTac',v_maneki:'mkGold',v_astro:'asOrange',v_royal:'ryPurple'};
Object.keys(FORM0).forEach(id=>{const v=VARIANTS.find(x=>x.id===id);COATS[id+'_0']={n:'Trang phục thường',c:v.c,c2:v.c2,c3:v.c3,pat:v.pat,eye:v.eye};FORMS[id]=id+'_0 '+FORM0[id];v.noRare=1});
VARIANTS.forEach(v=>{if(FORMS[v.id])v.coats=FORMS[v.id].split(' ')});
BREEDS.forEach(b=>{b.coats=BREED_COATS[b.id].split(' ');if(SHORT_LEGS.includes(b.id))b.short=1;if(HAIRLESS.includes(b.id)){b.hl=1;b.noRare=1}if(b.id==='lykoi'||b.r===5)b.noRare=1}); // màu hiếm chỉ dành cho giống từ 4★ trở xuống; 5★ có "trang phục hiếm" riêng

/* ============ MÀU HIẾM (luôn 4★, áp lên bất kỳ giống nào) ============ */
const RARE_P=.04;
const RARES=[
 {id:'r_odd',n:'Trắng mắt hai màu',c:WHT,eye:eB,eye2:eY,tr:'c_odd'},
 {id:'r_smoke',n:'Khói bạc',c:'#eceef2',c2:'#55505f',pat:'smoke',eye:eG,tr:'c_smoke'},
 {id:'r_gold',n:'Vàng kim',c:'#f2c050',c2:'#c98a2a',pat:'tabby',eye:eG,tr:'c_gold'},
 {id:'r_cinnamon',n:'Cinnamon (quế)',c:'#b06a3a',eye:eY,tr:'c_cinnamon'},
 {id:'r_fawn',n:'Fawn (nâu vàng nhạt)',c:'#e6cbb0',eye:eY,tr:'c_fawn'},
 {id:'r_stortie',n:'Đồi mồi khói',c:'#6a6478',c2:'#e8a878',pat:'tortie',f:.9995,eye:eY,tr:'c_stortie'},
 {id:'r_mcalico',n:'Tam thể đực',c:WHT,c2:ORG,c3:BLK,pat:'calico',sex:'m',eye:eY,tr:'c_mcalico'},
 {id:'r_nacre',n:'Ánh xà cừ',c:'#f6eef8',pat:'nacre',eye:'#b98bff',tr:'c_nacre'},
 {id:'r_sheen',n:'Đen ánh xanh',c:'#2f3350',c2:'#4f74c0',pat:'sheen',eye:eA,tr:'c_sheen'},
];
const RARE=Object.fromEntries(RARES.map(r=>[r.id,r]));
const ALLCOAT=Object.assign({},COATS,RARE);
Object.assign(TRAITS,{
 c_odd:{n:'Mắt hai màu',k:'x',d:'Màu hiếm. Mèo khác cùng phòng +10 độ vui.',e:{aura:10}},
 c_smoke:{n:'Khói bạc',k:'x',d:'Màu hiếm. +15% xu nếu xuất phát ban đêm.',e:{night:.15}},
 c_gold:{n:'Lông vàng kim',k:'x',d:'Màu hiếm. +15% xu mọi chuyến viễn chinh.',e:{coin:.15}},
 c_cinnamon:{n:'Thơm mùi quế',k:'x',d:'Màu hiếm. +10 độ vui cho chính bé.',e:{self:10}},
 c_fawn:{n:'Nhẹ nhàng',k:'x',d:'Màu hiếm. Đói chậm hơn 25%.',e:{hunger:.75}},
 c_stortie:{n:'Đồi mồi khói',k:'x',d:'Màu hiếm. +25% cơ hội có chiến lợi phẩm.',e:{loot:.25}},
 c_mcalico:{n:'Vạn con có một',k:'x',d:'Tam thể đực cực hiếm ngoài đời. +12% cơ hội nhặt vé gacha.',e:{ticket:.12}},
 c_nacre:{n:'Ánh xà cừ',k:'x',d:'Màu hiếm. +6 độ vui cho bé và cho mèo khác cùng phòng.',e:{self:6,aura:6}},
 c_sheen:{n:'Ánh xanh dưới đèn',k:'x',d:'Màu hiếm. Viễn chinh nhanh hơn 10%.',e:{speed:.10}},
 // thuộc tính riêng của năm giống thật 5★ (trường bt của giống), luôn đứng đầu danh sách trait
 b_khaomanee:{n:'Mắt kim cương',k:'x',d:'Đôi mắt hai màu soi ra của quý: +15% xu, +8% cơ hội nhặt vé gacha.',e:{coin:.15,ticket:.08}},
 b_lykoi:{n:'Sói đêm',k:'x',d:'+45% xu nếu xuất phát ban đêm, viễn chinh nhanh hơn 10%.',e:{night:.45,speed:.1}},
 b_savannah:{n:'Cú nhảy 2 mét',k:'x',d:'Viễn chinh nhanh hơn 30%, +10% xu.',e:{speed:.3,coin:.1}},
 b_sokoke:{n:'Bóng rừng Kenya',k:'x',d:'+45% xu ở điểm thiên nhiên, +30% cơ hội có chiến lợi phẩm.',e:{nature:.45,loot:.3}},
 b_suphalak:{n:'Đồng đỏ cát tường',k:'x',d:'+12% xu, mèo khác cùng phòng +10 độ vui.',e:{coin:.12,aura:10}},
 f_zt:{n:'Hỏa Lôi Thần',k:'x',d:'Trang phục hiếm của Zenitsu. Viễn chinh nhanh hơn 20%.',e:{speed:.2}},
 f_six:{n:'Lục Nhãn',k:'x',d:'Trang phục hiếm của Gojo. +15% xu, +30% kinh nghiệm.',e:{coin:.15,xp:1.3}},
 f_seeker:{n:'Bắt được trái Snitch',k:'x',d:'Trang phục hiếm của Harry. +10% cơ hội nhặt vé gacha, viễn chinh nhanh hơn 10%.',e:{ticket:.1,speed:.1}},
 f_white:{n:'Trở về phía ánh sáng',k:'x',d:'Trang phục hiếm của Vader. +10% xu, mèo khác cùng phòng +10 độ vui.',e:{coin:.1,aura:10}},
 f_tac:{n:'Bản sao bóng tối',k:'x',d:'Trang phục hiếm của Nyan Cat. +30% xu nếu xuất phát ban đêm.',e:{night:.3}},
 f_gold:{n:'Vàng mười',k:'x',d:'Trang phục hiếm của Thần Tài. +20% xu mọi chuyến viễn chinh.',e:{coin:.2}},
 f_launch:{n:'Sẵn sàng phóng',k:'x',d:'Trang phục hiếm của Phi Hành Gia. Viễn chinh nhanh hơn 20%, +5% cơ hội nhặt vé gacha.',e:{speed:.2,ticket:.05}},
 f_purple:{n:'Hoàng bào tím',k:'x',d:'Trang phục hiếm của Hoàng Gia. +10 độ vui cho bé, mọi mèo khác cùng phòng +5% xu viễn chinh.',e:{self:10,auraCoin:.05}},
 f_chada:{n:'Báu vật hoàng cung',k:'x',d:'Trang phục hiếm của Khao Manee. +15% xu mọi chuyến viễn chinh.',e:{coin:.15}},
 f_hood:{n:'Sói đội khăn đỏ',k:'x',d:'Trang phục hiếm của Lykoi. +30% cơ hội có chiến lợi phẩm, +15% xu ban đêm.',e:{loot:.3,night:.15}},
 f_pharaoh:{n:'Mèo của Pharaoh',k:'x',d:'Trang phục hiếm của Savannah. +15% xu mọi chuyến viễn chinh.',e:{coin:.15}},
 f_forest:{n:'Thần rừng',k:'x',d:'Trang phục hiếm của Sokoke. +30% xu ở điểm thiên nhiên, mèo khác cùng phòng +8 độ vui.',e:{nature:.3,aura:8}},
 f_malai:{n:'Hương nhài',k:'x',d:'Trang phục hiếm của Suphalak. +8 độ vui cho bé, mèo khác cùng phòng +12 độ vui.',e:{self:8,aura:12}},
 f_god:{n:'Thần khí Saiyan',k:'x',d:'Trang phục hiếm Siêu Saiyan God. +20% xu mọi chuyến viễn chinh.',e:{coin:.20}},
 f_kurama:{n:'Chakra Cửu Vĩ',k:'x',d:'Trang phục hiếm Tiên nhân Cửu Vĩ. Viễn chinh nhanh hơn 15%, mèo khác cùng phòng +8 độ vui.',e:{speed:.15,aura:8}},
 f_hokage:{n:'Hokage Đệ Thất',k:'x',d:'Trang phục hiếm Hokage. +10% xu, và mọi mèo khác cùng phòng +5% xu viễn chinh.',e:{coin:.10,auraCoin:.05}},
});
GROUPS.push(['rare','Màu hiếm']);
// "ngoại hình" của một bé: giống + màu lông. Khóa dạng 'giống~màu'.
const LOOKS={x_demon:{id:'x_demon',n:'Mèo quỷ',c:'#4a3a66',c2:'#4a3a66',pat:'solid',eye:'#ff3030',cos:[['dhorns'],['fangs']]}, // mèo quỷ chỉ dùng trong intro của Zenitsu
 x_rogue:{id:'x_rogue',n:'Ninja phản bội',c:'#8a8498',c2:'#8a8498',pat:'solid',eye:'#ff4040',cos:[['cape','#26222e'],['headband','#3a3448',1],['mr',14,11.5,8,.5,'#4a4460'],['suit','#26222e',24,1],['aclouds'],['fangs']]}}; // kẻ địch trong intro của Naruto
function look(key){
  if(LOOKS[key])return LOOKS[key];
  if(key.indexOf('!')>0){const b=look(key.split('!')[0]);return LOOKS[key]=Object.assign({},b,{cos:b.cos.filter(p=>p[0]!=='blindfold'),eye:'#38b6ff',gem:1,lash:1})} // dáng "kéo băng mắt"
  const [id,ct]=key.split('~'),sp=BREEDS.concat(VARIANTS).find(s=>s.id===id);
  if(!sp.coats)return LOOKS[key]=sp;
  const coat=ALLCOAT[ct]||COATS[sp.coats[0]];
  const L=Object.assign({},sp,{c2:undefined,c3:undefined,w:0,mit:0,pat:'solid',eye2:undefined},coat,{eye:coat.eye||sp.eye,c2:coat.c2||coat.c,rare:RARE[ct]||coat.form?1:0,bid:sp.id,ct:ALLCOAT[ct]?ct:sp.coats[0]}); // bid: id giống gốc (màu hiếm ghi đè id); ct: id màu lông / trang phục đang mang
  if(sp.odd&&!coat.eye2){L.eye=sp.odd[0];L.eye2=sp.odd[1]} // giống luôn có hai mắt hai màu (Khao Manee), kể cả khi mang màu lông hiếm
  return LOOKS[key]=L;
}

/* ============ NỘI THẤT BỔ SUNG ============ */
// cat: nhóm trong cửa hàng. art: hàm vẽ dùng chung, a: tham số màu. set: tên bộ chủ đề.
const FCATS=[['bed','Giường & nệm'],['tree','Tháp & trụ cào'],['toy','Đồ chơi'],['seat','Bàn ghế & sofa'],['plant','Cây cảnh'],['lamp','Đèn'],['rug','Thảm'],['art','Tranh'],['shelf','Kệ'],['climb','Leo trèo nhiều tầng'],['bowl','Bát ăn'],['window','Cửa sổ'],['deco','Trang trí'],['season','Theo mùa'],['set','Bộ chủ đề']];
Object.entries({box:'toy',yarn:'toy',mouse:'toy',picture:'art',bed:'bed',plant:'plant',rug:'rug',lamp:'lamp',post:'tree',shelf:'shelf',window:'window',sofa:'seat',tank:'deco',catnip:'plant',tree:'tree'}).forEach(e=>FURN[e[0]].cat=e[1]);
const F=(id,n,price,kind,w,h,cat,art,a,o)=>Object.assign({id,n,price,kind,w,h,cat,art,a},o);
const NAP={dx:0,dy:-5,front:1,sleep:1,emo:'z'},PLAY={dx:13,dy:1,front:1,emo:'note'};
FURNS.push(
 // giường & nệm
 F('cushion','Gối tròn',90,'floor',24,10,'bed','cushion',['#9cc4e8'],{regen:1.05,d:'Hồi năng lượng nhanh hơn 5%.',use:{dx:0,dy:-3,front:1,sleep:1,emo:'z'}}),
 F('basket','Giỏ mây',220,'floor',34,16,'bed','basket',['#f2a3b3'],{happy:3,d:'+3 độ vui.',use:{dx:0,dy:-5,front:1,sleep:1,emo:'z'}}),
 F('bedblue','Nệm xanh',180,'floor',44,18,'bed','bed',['#7ea6d8','#dcecff'],{happy:2,d:'+2 độ vui.',use:NAP}),
 F('bedgreen','Nệm lá',180,'floor',44,18,'bed','bed',['#7fb88a','#e2f4d8'],{happy:2,d:'+2 độ vui.',use:NAP}),
 // tháp & trụ cào
 F('postpink','Trụ cào hồng',280,'floor',20,44,'tree','post',['#f2a3b3'],{happy:2,guard:1,d:'+2 độ vui, giảm khả năng mèo cào sofa.',use:{dx:17,dy:1,front:1,emo:'note'}}),
 F('treegreen','Tháp mèo rừng',1500,'floor',46,76,'tree','tree',['#7fb88a'],{happy:7,d:'+7 độ vui.',use:{dx:2,dy:-70,front:1,sleep:1,emo:'z'}}),
 F('tunnel','Ống chui',260,'floor',40,18,'tree','tunnel',['#86b2dc'],{happy:4,d:'+4 độ vui. Mèo thích chui vào nấp.',use:{dx:0,dy:-3,front:0,emo:'note'}}),
 // đồ chơi
 F('ballred','Bóng đỏ',60,'floor',10,10,'toy','ball',['#e2484e'],{happy:1,d:'+1 độ vui.',use:PLAY}),
 F('ballblue','Bóng xanh',60,'floor',10,10,'toy','ball',['#5a9ae0'],{happy:1,d:'+1 độ vui.',use:PLAY}),
 F('fishtoy','Cá nhồi bông',110,'floor',16,8,'toy','fishtoy',['#f0a050'],{happy:3,d:'+3 độ vui.',use:PLAY}),
 // bàn ghế & sofa
 F('chair','Ghế gỗ',160,'floor',22,30,'seat','chair',['#c89a6a','#e2c79c'],{happy:1,d:'+1 độ vui. Mèo thích ngồi lên.',use:{dx:0,dy:-14,front:1,emo:'note'}}),
 F('table','Bàn trà',240,'floor',40,24,'seat','table',['#b98a5e','#f2e2c0'],{happy:2,d:'+2 độ vui.'}),
 F('sofapink','Sofa hồng',520,'floor',64,34,'seat','sofa',['#e8a0b0','#d08494','#f6c2cc'],{happy:8,breakable:1,d:'+8 độ vui. Có thể bị cào hỏng.',use:{dx:-10,dy:-13,front:1,sleep:1,emo:'z'}}),
 F('sofagray','Sofa xám',520,'floor',64,34,'seat','sofa',['#9aa3b5','#7f8a9f','#bcc4d2'],{happy:8,breakable:1,d:'+8 độ vui. Có thể bị cào hỏng.',use:{dx:-10,dy:-13,front:1,sleep:1,emo:'z'}}),
 // cây cảnh
 F('flower','Chậu hoa hồng',120,'floor',16,26,'plant','flower',['#f08aa8','#e89468'],{happy:2,d:'+2 độ vui.'}),
 F('flowery','Chậu hoa vàng',120,'floor',16,26,'plant','flower',['#f2c84a','#8fb7d8'],{happy:2,d:'+2 độ vui.'}),
 F('cactus','Xương rồng',100,'floor',14,24,'plant','cactus',[],{happy:1,d:'+1 độ vui.'}),
 F('bigplant','Cây lá to',320,'floor',20,36,'plant','plant',['#3f8f5a','#6fb878','#c98a5e'],{happy:4,d:'+4 độ vui.'}),
 // đèn
 F('lamppink','Đèn chụp hồng',220,'floor',16,46,'lamp','lamp',['#f6b6c4'],{happy:2,d:'+2 độ vui.'}),
 F('lampblue','Đèn ngủ xanh',220,'floor',16,46,'lamp','lamp',['#a8d0f2'],{regen:1.05,d:'Hồi năng lượng nhanh hơn 5%.'}),
 F('candles','Giá nến',260,'wall',30,14,'lamp','candles',[],{happy:3,d:'+3 độ vui.'}),
 // thảm
 F('rugblue','Thảm tròn xanh',180,'rug',70,22,'rug','rug',['#7ea6d8','#a8c6ea','#d2e4f8'],{happy:3,d:'+3 độ vui.',use:{dx:0,dy:-6,front:1,sleep:1,emo:'z'}}),
 F('ruggreen','Thảm cỏ',180,'rug',70,22,'rug','rug',['#7fb88a','#a4d0a8','#cbe6c8'],{happy:3,d:'+3 độ vui.',use:{dx:0,dy:-6,front:1,sleep:1,emo:'z'}}),
 F('rugstripe','Thảm kẻ sọc',240,'rug',80,24,'rug','rugr',['#c98a5e','#f2e2c0',1],{happy:4,d:'+4 độ vui.',use:{dx:0,dy:-6,front:1,sleep:1,emo:'z'}}),
 // tranh
 F('picpaw','Tranh dấu chân',120,'wall',24,20,'art','pic',['#e2b890','#fff2e0','paw','#e88aa2'],{happy:2,d:'+2 độ vui.'}),
 F('picmoon','Tranh trăng',160,'wall',24,20,'art','pic',['#6a6480','#2f3552','moon','#fff3b0'],{happy:2,g:{night:.03},d:'+2 độ vui, +3% xu ban đêm.'}),
 F('picheart','Tranh trái tim',120,'wall',24,20,'art','pic',['#f2a3b3','#fff2f4','heart','#e2484e'],{happy:2,d:'+2 độ vui.'}),
 F('clock','Đồng hồ treo tường',200,'wall',16,16,'art','clock',[],{g:{speed:.03},d:'Viễn chinh nhanh hơn 3%.'}),
 F('mirror','Gương',260,'wall',16,24,'art','mirror',['#c89a6a'],{happy:3,d:'+3 độ vui.'}),
 // kệ
 F('shelfdark','Kệ gỗ sẫm',300,'wall',40,8,'shelf','shelf',['#8a5a3c'],{happy:4,d:'+4 độ vui. Mèo thích leo lên ngồi.',use:{dx:0,dy:-6,front:1,emo:'note'}}),
 F('bookshelf','Kệ sách treo',380,'wall',40,14,'shelf','bookshelf',[],{happy:4,g:{coin:.02},d:'+4 độ vui, +2% xu.',use:{dx:10,dy:-12,front:1,emo:'note'}}),
 F('bookcase','Tủ sách',700,'floor',34,50,'shelf','bookcase',[],{happy:5,g:{coin:.04},d:'+5 độ vui, +4% xu viễn chinh.',use:{dx:0,dy:-48,front:1,sleep:1,emo:'z'}}),
 // cửa sổ
 F('winnight','Cửa sổ đêm trăng',450,'wall',46,38,'window','window',['night'],{happy:5,g:{night:.05},d:'+5 độ vui, +5% xu ban đêm.',use:{floor:1,emo:'excl'}}),
 F('winround','Cửa sổ tròn',500,'wall',34,34,'window','roundwin',[],{happy:6,d:'+6 độ vui.',use:{floor:1,emo:'excl'}}),
 // trang trí
 F('fountain','Đài nước mini',480,'floor',22,22,'deco','fountain',[],{happy:4,hunger:.95,d:'+4 độ vui, đói chậm hơn 5%.',use:{dx:15,dy:2,front:1,emo:'heart'}}),
 // theo mùa
 F('peach','Cây đào Tết',600,'floor',28,44,'season','peach',[],{happy:6,g:{ticket:.02},set:'Tết',d:'+6 độ vui, +2% cơ hội nhặt vé.'}),
 F('lantern','Đèn lồng đỏ',260,'wall',14,22,'season','lantern',['#e2484e'],{happy:3,set:'Tết',d:'+3 độ vui.'}),
 F('lixi','Dây lì xì',300,'wall',60,12,'season','garland',['#e2484e','#f2c84a'],{g:{coin:.03},set:'Tết',d:'+3% xu viễn chinh.'}),
 F('banhchung','Bánh chưng',180,'floor',16,12,'season','banhchung',[],{hunger:.95,set:'Tết',d:'Mèo trong phòng đói chậm hơn 5%.',use:PLAY}),
 F('pumpkin','Bí ngô Halloween',240,'floor',20,18,'season','pumpkin',[],{happy:4,set:'Halloween',d:'+4 độ vui.',use:PLAY}),
 F('batgar','Dây dơi',260,'wall',60,12,'season','garland',['#5a4a7a','#f0a050'],{g:{night:.04},set:'Halloween',d:'+4% xu ban đêm.'}),
 F('xmastree','Cây thông Noel',1200,'floor',30,46,'season','xmastree',[],{happy:8,set:'Noel',d:'+8 độ vui.'}),
 F('wreath','Vòng nguyệt quế',350,'wall',20,20,'season','wreath',[],{happy:3,set:'Noel',d:'+3 độ vui.'}),
 F('snowman','Người tuyết',450,'floor',18,28,'season','snowman',[],{happy:4,set:'Noel',d:'+4 độ vui.'}),
 F('giftpile','Chồng quà',500,'floor',26,18,'season','giftpile',[],{happy:3,g:{ticket:.02},set:'Noel',d:'+3 độ vui, +2% cơ hội nhặt vé.',use:{dx:0,dy:-16,front:1,emo:'note'}}),
 F('winsnow','Cửa sổ tuyết rơi',700,'wall',46,38,'season','window',['snow'],{happy:6,set:'Noel',d:'+6 độ vui.',use:{floor:1,emo:'excl'}}),
 // bộ chủ đề
 F('tatamimat','Chiếu tatami',650,'rug',80,24,'set','rugr',['#b8c48a','#8a9a5e',0],{happy:4,regen:1.05,set:'Nhật',d:'+4 độ vui, hồi năng lượng nhanh hơn 5%.',use:{dx:0,dy:-6,front:1,sleep:1,emo:'z'}}),
 F('kotatsu','Bàn sưởi kotatsu',1800,'floor',44,22,'set','kotatsu',['#e2484e'],{happy:7,regen:1.1,set:'Nhật',d:'+7 độ vui, hồi năng lượng nhanh hơn 10%.',use:{dx:-14,dy:-2,front:1,sleep:1,emo:'z'}}),
 F('bonsai','Bonsai',850,'floor',26,26,'set','bonsai',[],{happy:4,set:'Nhật',d:'+4 độ vui.'}),
 F('paperlamp','Đèn lồng giấy',600,'wall',14,22,'set','lantern',['#f6eedc'],{happy:3,set:'Nhật',d:'+3 độ vui.'}),
 F('throne','Ngai vàng',7500,'floor',30,46,'set','throne',[],{happy:8,g:{coin:.06},set:'Hoàng gia',d:'+8 độ vui, +6% xu viễn chinh.',use:{dx:0,dy:-19,front:1,sleep:1,emo:'z'}}),
 F('redcarpet','Thảm đỏ',1800,'rug',80,24,'set','rugr',['#c8465a','#f2c84a',0],{happy:5,set:'Hoàng gia',d:'+5 độ vui.',use:{dx:0,dy:-6,front:1,sleep:1,emo:'z'}}),
 F('royalbed','Giường hoàng gia',3600,'floor',44,18,'set','bed',['#c8465a','#fbe7a8'],{happy:5,regen:1.15,set:'Hoàng gia',d:'+5 độ vui, hồi năng lượng nhanh hơn 15%.',use:NAP}),
 F('goldmirror','Gương mạ vàng',2100,'wall',16,24,'set','mirror',['#e8b83a'],{happy:5,set:'Hoàng gia',d:'+5 độ vui.'}),
 F('cauldron','Vạc độc dược',1000,'floor',24,22,'set','cauldron',[],{happy:4,g:{ticket:.03},set:'Harry Potter',d:'+4 độ vui, +3% cơ hội nhặt vé.',use:{dx:17,dy:2,front:1,emo:'excl'}}),
 F('hbanner','Cờ nhà sư tử',550,'wall',14,30,'set','banner',['#b8323a','#f2c230'],{happy:3,g:{coin:.03},set:'Harry Potter',d:'+3 độ vui, +3% xu.'}),
 F('hbanner2','Cờ nhà rắn',550,'wall',14,30,'set','banner',['#2f7a52','#cfd4dc'],{happy:3,g:{night:.04},set:'Harry Potter',d:'+3 độ vui, +4% xu ban đêm.'}),
 F('gdesk','Bàn máy tính',1600,'floor',44,30,'set','gdesk',[],{happy:7,set:'Gaming',d:'+7 độ vui.',use:{dx:-10,dy:-17,front:1,sleep:1,emo:'z'}}),
 F('gchair','Ghế gaming',1000,'floor',22,34,'set','gchair',['#3a3448','#e2484e'],{happy:5,set:'Gaming',d:'+5 độ vui.',use:{dx:0,dy:-14,front:1,sleep:1,emo:'z'}}),
 F('neon','Đèn neon',700,'wall',30,16,'set','neon',['#f06ad0'],{happy:4,g:{night:.03},set:'Gaming',d:'+4 độ vui, +3% xu ban đêm.'}),
 F('tv','Tivi',1400,'floor',36,30,'set','tv',[],{happy:6,set:'Gaming',d:'+6 độ vui.',use:{dx:-24,dy:2,front:1,emo:'excl'}}),
 F('rocket','Tên lửa đồ chơi',1600,'floor',16,30,'set','rocket',[],{happy:5,g:{speed:.04},set:'Vũ trụ',d:'+5 độ vui, viễn chinh nhanh hơn 4%.',use:PLAY}),
 F('planet','Hành tinh treo',850,'wall',22,16,'set','planet',['#f0a050'],{happy:4,set:'Vũ trụ',d:'+4 độ vui.'}),
 F('winspace','Cửa sổ phi thuyền',1300,'wall',46,38,'set','window',['space'],{happy:6,g:{night:.04},set:'Vũ trụ',d:'+6 độ vui, +4% xu ban đêm.',use:{floor:1,emo:'excl'}}),
 F('rugmoon','Thảm thiên hà',800,'rug',70,22,'set','rug',['#3d4f8f','#5a6fb0','#fff3b0'],{happy:5,set:'Vũ trụ',d:'+5 độ vui.',use:{dx:0,dy:-6,front:1,sleep:1,emo:'z'}})
);
FURNS.forEach(f=>FURN[f.id]=f);
/* ============ MỞ KHÓA CỬA HÀNG THEO CẤP ============
   Mỗi phòng, món ăn và món nội thất có trường ul: cấp tối thiểu để MUA (đồ đã có thì vẫn dùng bình thường).
   Cách gán: phòng mở lần lượt theo giá, gần như mỗi cấp một phòng; món ăn có buff mở dần trong 8 cấp đầu;
   nội thất mặc định theo bậc giá (priceLv), trừ vài món gán tay cho hợp lý (ITEM_LV: bát ăn, tháp leo theo thứ tự từ thấp lên cao, sofa, bể cá);
   đồ theo mùa mở ở cấp 5, 7, 9; mỗi bộ chủ đề mở cùng lúc với căn phòng hợp với nó (SET_LV). MAX_LV là cấp mở món cuối cùng. */
// (các bảng và phép gán nằm ở cuối file, sau khi mọi món nội thất đã được khai báo)
const HAPPY_CAP=35; // tổng độ vui từ nội thất trong một phòng không vượt quá mức này

/* ============ CÂU THOẠI CỦA MÈO 5★ (hiện ở thẻ giới thiệu sau intro) ============ */
const QUOTE={v_goku:'Chào! Tớ là Goku! Nhà mình còn gì ăn không?',v_naruto:'Tớ sẽ trở thành Hokage, dattebayo!',v_thunder:'Zzz… Thần tốc… nhất thức…',v_gojo:'Yên tâm đi. Vì ta là mạnh nhất mà.',v_harry:'Tôi long trọng thề rằng tôi sắp làm đổ cốc nước.',v_vader:'Hãy gia nhập mặt tối. Ở đây có pate.',
 v_nyan:'Nya nya nya nya nya nya nya~',v_maneki:'Vẫy một cái, tiền vô như nước.',v_astro:'Một bước nhỏ của mèo, một cú nhảy dài của loài mèo.',v_royal:'Ngươi được phép gãi cằm ta.',
 khaomanee:'Một mắt nhìn trời xanh, một mắt nhìn vàng ròng.',lykoi:'Awoooo… à nhầm, meo.',savannah:'Hai mét à? Nhảy khởi động thôi.',sokoke:'Rừng dạy ta đi không một tiếng động.',suphalak:'Hiếm như đồng đỏ, quý hơn vàng.'};
BREEDS.concat(VARIANTS).forEach(s=>{if(QUOTE[s.id])s.q=QUOTE[s.id]});

/* ---------- nội thất nhiều tầng: lv = danh sách chỗ đứng từ thấp lên cao [lệch ngang so với tâm, độ cao so với chân đồ] ---------- */
const towerLv=(w,h,n)=>{const a=[];for(let i=0;i<n-1;i++)a.push([(i%2?1:-1)*Math.round(w*.23),-22-20*i]);a.push([0,-(h-5)]);return a};
FURN.tree.lv=FURN.treegreen.lv=[[-6,-36],[2,-71]];
[
 F('tower3','Tháp mèo 3 tầng',900,'floor',44,72,'climb','tower',['#86b2dc',3],{happy:6,lv:towerLv(44,72,3),d:'+6 độ vui. Ba tầng để mèo nhảy lên nằm.'}),
 F('tower5','Tháp mèo 5 tầng',3300,'floor',52,112,'climb','tower',['#e8a0b0',5],{happy:9,g:{coin:.04},lv:towerLv(52,112,5),d:'+9 độ vui, +4% xu viễn chinh. Năm tầng cao gần chạm trần.'}),
 F('climbrack','Giá leo gỗ',700,'floor',48,66,'climb','rack',[],{happy:5,lv:[[-8,-22],[8,-42],[0,-63]],d:'+5 độ vui. Ba bậc gỗ so le.'}),
 F('tallcase','Tủ sách cao',1100,'floor',36,84,'climb','tallcase',[],{happy:6,g:{coin:.04},lv:[[0,-27],[0,-83]],d:'+6 độ vui, +4% xu viễn chinh. Có ngăn trống và nóc tủ cho mèo.'}),
 F('hammock','Võng treo',400,'floor',54,36,'climb','hammock',['#f2c84a'],{happy:3,regen:1.1,lv:[[0,-15]],lvs:1,d:'+3 độ vui, hồi năng lượng nhanh hơn 10%. Mèo nhảy lên nằm đung đưa.'}),
 F('treehouse','Nhà gỗ trên cao',4800,'floor',60,100,'climb','treehouse',[],{happy:10,lv:[[-20,-24],[-16,-48],[8,-87]],d:'+10 độ vui. Có bậc thang, sàn gỗ và mái nhà để trèo.'}),
 F('gianttree','Cây mèo khổng lồ',12000,'floor',72,124,'climb','gtree',[],{happy:12,g:{coin:.05},lv:[[-20,-24],[20,-46],[-20,-68],[20,-90],[0,-113]],d:'+12 độ vui, +5% xu viễn chinh. Năm tán lá cho cả đàn cùng trèo.'}),
 F('stairs','Kệ bậc thang',450,'wall',64,40,'climb','stairs',['#cea074'],{happy:4,lv:[[-21,-10],[0,-22],[21,-34]],d:'+4 độ vui. Ba bậc kệ treo tường để mèo nhảy dần lên.'}),
 F('bridge','Cầu treo',550,'wall',80,16,'climb','bridge',[],{happy:4,lv:[[-24,-7],[22,-7]],d:'+4 độ vui. Cầu dây nối hai đầu, mèo đi qua đi lại trên cao.'}),
 /* bát ăn: cap = số suất mỗi lần đổ, eff = hiệu quả thức ăn, hp = độ vui thêm khi ăn, coin = xu cảm ơn thêm, auto = tự đổ hạt khô */
 F('bowl','Bát nhựa',60,'floor',18,10,'bowl','bowl',[],{bowl:{cap:4},d:'4 suất mỗi lần đổ. Mỗi phòng được tặng sẵn một cái.'}),
 F('bowlsteel','Bát inox',280,'floor',22,11,'bowl','bowl',['#b8c0cc','#96a0b0'],{bowl:{cap:8},d:'Bền và to: 8 suất mỗi lần đổ, một cái đủ cho phòng 8 bé.'}),
 F('bowlclay','Bát gốm',350,'floor',18,10,'bowl','bowl',['#e8a888','#c98468'],{bowl:{cap:4,hp:5},d:'4 suất. Mỗi bé ăn ở bát này được thêm 5 độ vui.'}),
 F('feeder','Máy cho ăn tự động',1500,'floor',20,28,'bowl','feeder',[],{bowl:{cap:4,auto:1},d:'4 suất. Cứ 10 phút tự đổ thêm hạt khô cho đầy, kể cả khi bạn vắng (tối đa 8 giờ). Chỉ trừ xu cho số suất mèo đã ăn.'}),
 F('bowlgold','Bát vàng',3000,'floor',22,11,'bowl','bowl',['#f2c84a','#d6a020'],{bowl:{cap:8,eff:1.25,coin:3},d:'8 suất. Thức ăn hiệu quả hơn 25%, mỗi bé cảm ơn thêm 3 xu.'}),
].forEach(f=>{FURNS.push(f);FURN[f.id]=f});
// gán cấp mở khóa (trường ul; trường lv của nội thất là các tầng leo trèo, đừng nhầm)
const priceLv=p=>p<=150?1:p<=260?2:p<=400?3:p<=600?4:p<=900?5:p<=1200?6:p<=1500?7:p<=2200?8:p<=3200?10:12;
const ROOM_LV={living:1,bedroom:2,kitchen:3,balcony:4,bathroom:5,playroom:6,dining:7,attic:8,garden:9,library:10,gameroom:11,greenhouse:12,tatami:13,basement:14,pool:15,rooftop:16,royal:18};
const FOOD_LV={kibble:1,pate:1,churu:2,tuna:3,chicken:4,catnip:5,salmon:6,premium:8};
const SET_LV={'Tết':5,'Halloween':7,'Noel':9,'Harry Potter':10,'Gaming':11,'Nhật':13,'Vũ trụ':16,'Hoàng gia':18}; // Harry Potter đi với Thư viện, Gaming với Phòng game, Nhật với Phòng Nhật, Vũ trụ với Sân thượng, Hoàng gia với Phòng hoàng gia
const ITEM_LV={rug:1,sofa:3,tree:4,treegreen:5,tank:6,bowl:1,bowlsteel:3,bowlclay:4,feeder:7,bowlgold:10,tower3:6,tallcase:7,tower5:9,treehouse:11,gianttree:17};
const MAX_LV=18;
FURNS.forEach(f=>{f.ul=ITEM_LV[f.id]||(f.set&&SET_LV[f.set])||priceLv(f.price)});
ROOMS.forEach(r=>{r.ul=ROOM_LV[r.id]||1});
FOODS.forEach(f=>{f.ul=FOOD_LV[f.id]||1});
const unlocksAt=n=>[...ROOMS.filter(r=>r.ul===n).map(r=>r.n),...FOODS.filter(f=>f.ul===n).map(f=>f.n),...FURNS.filter(f=>f.ul===n).map(f=>f.n)]; // tên mọi thứ mở ở đúng cấp n
