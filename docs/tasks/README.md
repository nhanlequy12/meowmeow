# Chuyển mọi mèo sang khung Xoài: danh mục và phân nhóm

Sinh bởi `node tools/mktasks.js`. Đặc tả: `docs/cat-sprite-spec.md`.

Mèo không có file riêng: mọi mèo được **dựng lúc chạy** bởi CatKit từ khung Xoài + các module trong `js/cats/`.
Một giống thường = hoa văn (theo màu lông) + đặc điểm hình dáng; mèo đặc biệt = thêm một module trang phục.
Vì vậy việc được chia theo **module**, mỗi nhóm kèm danh sách mèo phải soát.

## Phân nhóm (22 phiên Codex)

| Phiên | Nội dung | File được sửa | Mèo phải soát |
|---|---|---|---|
| agent-01 | Hoa văn vằn hổ và lông ticked | `js/cats/pat_stripe.js` | toyger, sokoke, abyssinian, singapura, chausie, somali |
| agent-02 | Hoa văn mảng: bò sữa, tam thể, đồi mồi, van | `js/cats/pat_patch.js` | bosua, tamthe, doimoi, amwire, jbobtail, aphrodite, van |
| agent-03 | Hoa văn điểm màu (Xiêm) và khói | `js/cats/pat_point.js` | siamese, thai, ragdoll, birman, snowshoe, tonkinese, colorpoint, burmilla |
| agent-04 | Hoa văn đốm, Lykoi, xà cừ, ánh xanh | `js/cats/pat_spot.js` | bengal, ocicat, ausmist, mau, savannah, lykoi |
| agent-05 | Hình dáng tai | `js/cats/trait_ear.js` | british, scottish, siamese, oriental, amcurl, pixiebob, highlander, cornish, devon |
| agent-06 | Hình dáng đuôi | `js/cats/trait_tail.js` | manx, cymric, jbobtail, kurilian, ambobtail, toybob, nebelung, angora |
| agent-07 | Lông dài và mặt tịt | `js/cats/trait_fur.js` | persian, mainecoon, exotic, himalayan, selkirk, laperm, ragamuffin, siberian, norwegian, britishlh, balinese |
| agent-08 | Mèo không lông, mắt kim cương, soát giống chân ngắn | `js/cats/trait_skin.js` | sphynx, peterbald, donskoy, bambino, dwelf, khaomanee, munchkin, lambkin, kinkalow, skookum, genetta, minuet |
| agent-09 | Naruto và Goku (5★, nhiều dạng) | `js/cats/v_naruto.js`<br>`js/cats/v_goku.js` | v_naruto, v_goku |
| agent-10 | Zenitsu và Gojo (5★) | `js/cats/v_thunder.js`<br>`js/cats/v_gojo.js` | v_thunder, v_gojo |
| agent-11 | Harry Potter và Darth Vader (5★) | `js/cats/v_harry.js`<br>`js/cats/v_vader.js` | v_harry, v_vader |
| agent-12 | Nyan Cat và Mèo Thần Tài (5★) | `js/cats/v_nyan.js`<br>`js/cats/v_maneki.js` | v_nyan, v_maneki |
| agent-13 | Phi Hành Gia và Hoàng Gia (5★) | `js/cats/v_astro.js`<br>`js/cats/v_royal.js` | v_astro, v_royal |
| agent-14 | Trang phục hiếm của năm giống 5★ | `js/cats/b_khaomanee.js`<br>`js/cats/b_lykoi.js`<br>`js/cats/b_savannah.js`<br>`js/cats/b_sokoke.js`<br>`js/cats/b_suphalak.js` | khaomanee, lykoi, savannah, sokoke, suphalak |
| agent-15 | Luffy, Tanjiro, Nezuko, Anya | `js/cats/v_luffy.js`<br>`js/cats/v_tanjiro.js`<br>`js/cats/v_nezuko.js`<br>`js/cats/v_anya.js` | v_luffy, v_tanjiro, v_nezuko, v_anya |
| agent-16 | Frieren, Levi, Sailor Moon, Conan | `js/cats/v_frieren.js`<br>`js/cats/v_levi.js`<br>`js/cats/v_sailor.js`<br>`js/cats/v_conan.js` | v_frieren, v_levi, v_sailor, v_conan |
| agent-17 | Pikachu, Totoro, Doraemon, Garfield | `js/cats/v_pika.js`<br>`js/cats/v_totoro.js`<br>`js/cats/v_dora.js`<br>`js/cats/v_garfield.js` | v_pika, v_totoro, v_dora, v_garfield |
| agent-18 | Superman, Batman, Spider-Man, Iron Man | `js/cats/v_hero.js`<br>`js/cats/v_batman.js`<br>`js/cats/v_spider.js`<br>`js/cats/v_iron.js` | v_hero, v_batman, v_spider, v_iron |
| agent-19 | Jack Sparrow, Hermione, Voldemort, Wednesday | `js/cats/v_pirate.js`<br>`js/cats/v_hermione.js`<br>`js/cats/v_voldemort.js`<br>`js/cats/v_wednesday.js` | v_pirate, v_hermione, v_voldemort, v_wednesday |
| agent-20 | Eleven, Phi Vụ Áo Đỏ, Lính Áo Hồng, Số 456 | `js/cats/v_eleven.js`<br>`js/cats/v_heist.js`<br>`js/cats/v_guard.js`<br>`js/cats/v_456.js` | v_eleven, v_heist, v_guard, v_456 |
| agent-21 | Jedi, Gandalf, Ba Lỗ, Ninja | `js/cats/v_jedi.js`<br>`js/cats/v_gandalf.js`<br>`js/cats/v_tank.js`<br>`js/cats/v_ninja.js` | v_jedi, v_gandalf, v_tank, v_ninja |
| agent-22 | Đầu Bếp, Bánh Mì, DJ | `js/cats/v_chef.js`<br>`js/cats/v_bread.js`<br>`js/cats/v_dj.js` | v_chef, v_bread, v_dj |

Lõi (người điều phối) giữ: `js/catkit.js`, `js/cats/core.js` (trait `closed`, `v_huh`, `v_grumpy`), hoa văn `solid`/`tabby`, vùng trắng, màu mắt, chân ngắn, `tools/catprev.js`, `index.html`, `js/art.js`, `js/ui.js`, `js/data.js`.
File dùng chung KHÔNG phiên nào được sửa: mọi file ngoài cột "File được sửa" của phiên đó; đề xuất ghi vào `docs/tasks/agent-XX-shared-changes.md`.

## Giống mèo (86)

| id | Tên | Sao | Hoa văn mặc định | Đặc điểm | Màu lông (hoa văn khác mặc định) | Module cần | Độ khó | Phiên soát |
|---|---|---|---|---|---|---|---|---|
| muop | Mướp ta | 1★ | tabby | - | brownTabbyW, grayTabby, silverTabby, brownTabby | chỉ lõi | thường | (chỉ lõi + hoa văn) |
| vang | Mèo vàng | 1★ | tabby | - | redTabbyW, redTabby, creamTabby, redW (cow) | hoa văn cow | thường | (chỉ lõi + hoa văn) |
| mun | Mèo mun | 1★ | solid | - | black, blackRust, smoke (smoke) | hoa văn smoke | thường | (chỉ lõi + hoa văn) |
| trang | Mèo trắng | 1★ | solid | - | white, whiteY, oddWhite | chỉ lõi | thường | (chỉ lõi + hoa văn) |
| venxam | Vện xám | 1★ | tabby | - | grayTabby, blueTabby, silverTabby | chỉ lõi | thường | (chỉ lõi + hoa văn) |
| bosua | Bò sữa | 1★ | cow | - | cow, grayCow, redW | hoa văn cow | thường | agent-02 |
| tuxedo | Tuxedo | 1★ | solid | - | tux, blueW, vanBlack (van) | hoa văn van | thường | (chỉ lõi + hoa văn) |
| tamthe | Tam thể | 2★ | calico | - | calico, diluteCalico, calicoDark | hoa văn calico | thường | agent-02 |
| doimoi | Đồi mồi | 2★ | tortie | - | tortie, diluteTortie, chocTortie | hoa văn tortie | thường | agent-02 |
| amshort | American Shorthair | 1★ | tabby | - | silverTabby, brownTabby, redTabby, blueTabby | chỉ lõi | thường | (chỉ lõi + hoa văn) |
| european | European Shorthair | 1★ | tabby | - | brownTabbyW, grayTabby, black, white | chỉ lõi | thường | (chỉ lõi + hoa văn) |
| british | Anh lông ngắn | 2★ | solid | ear=small | blue, cream, white, silverTabby (tabby), lilac | ear | thường, có đặc điểm hình dáng | agent-05 |
| exotic | Exotic lông ngắn | 2★ | tabby | ear=small, flat | redTabby, cream, blue, calico (calico) | hoa văn calico, ear, flat | thường, có đặc điểm hình dáng | agent-07 |
| mainecoon | Maine Coon | 2★ | tabby | ear=tuft, tail=fluff, fur | brownTabbyW, redTabbyW, smoke (smoke), silverTabby | hoa văn smoke, ear, tail, fur | thường, có đặc điểm hình dáng | agent-07 |
| persian | Ba Tư | 2★ | solid | ear=small, tail=fluff, fur, flat | white, cream, smoke (smoke), chinchilla (smoke) | hoa văn smoke, ear, tail, fur, flat | thường, có đặc điểm hình dáng | agent-07 |
| ragdoll | Ragdoll | 2★ | point | tail=fluff, fur | sealMit, blueBi, lilacPt, flamePt | hoa văn point, tail, fur | thường, có đặc điểm hình dáng | agent-03 |
| russian | Russian Blue | 2★ | solid | - | blue, blueLight, blueDark | chỉ lõi | thường | (chỉ lõi + hoa văn) |
| scottish | Scottish Fold | 2★ | tabby | ear=fold | blue, white, calico (calico), blueTabby | hoa văn calico, ear | thường, có đặc điểm hình dáng | agent-05 |
| scotstraight | Scottish Straight | 2★ | tabby | - | creamTabby, blue, cow (cow), brownTabby | hoa văn cow | thường | (chỉ lõi + hoa văn) |
| siamese | Xiêm | 2★ | point | ear=big | sealPt, bluePt, chocPt, lilacPt | hoa văn point, ear | thường, có đặc điểm hình dáng | agent-03, agent-05 |
| thai | Mèo Thái | 2★ | point | - | sealPt, bluePt, chocPt | hoa văn point | thường | agent-03 |
| abyssinian | Abyssinian | 3★ | ticked | ear=big | ruddy, sorrel, blueTick, fawnTick | hoa văn ticked, ear | thường, có đặc điểm hình dáng | agent-01 |
| ambobtail | American Bobtail | 3★ | tabby | tail=bob, fur | brownTabby, redTabby, spotBrown (spot) | hoa văn spot, tail, fur | thường, có đặc điểm hình dáng | agent-06 |
| amcurl | American Curl | 3★ | tabby | ear=curl, fur | redTabbyW, brownTabbyW, white, sealPt (point) | hoa văn point, ear, fur | thường, có đặc điểm hình dáng | agent-05 |
| amwire | American Wirehair | 3★ | van | - | van, cow (cow), brownTabbyW (tabby) | hoa văn van, hoa văn cow | thường | agent-02 |
| balinese | Balinese | 3★ | point | ear=big, tail=fluff, fur | sealPt, bluePt, chocPt, lilacPt | hoa văn point, ear, tail, fur | thường, có đặc điểm hình dáng | agent-07 |
| bengal | Bengal | 3★ | spot | - | spotBrown, spotSilver, spotSnow | hoa văn spot | thường | agent-04 |
| birman | Birman | 3★ | point | tail=fluff, fur | sealMit, blueMit, lilacMit | hoa văn point, tail, fur | thường, có đặc điểm hình dáng | agent-03 |
| bombay | Bombay | 3★ | solid | - | bombay, bombaySable | chỉ lõi | thường | (chỉ lõi + hoa văn) |
| britishlh | Anh lông dài | 3★ | solid | ear=small, tail=fluff, fur | cream, blue, lilac, goldShade (smoke) | hoa văn smoke, ear, tail, fur | thường, có đặc điểm hình dáng | agent-07 |
| burmese | Burmese | 3★ | solid | - | sable, champagne, blue, platinum | chỉ lõi | thường | (chỉ lõi + hoa văn) |
| burmilla | Burmilla | 3★ | smoke | - | silverShade, goldShade, chinchilla | hoa văn smoke | thường | agent-03 |
| chartreux | Chartreux | 3★ | solid | - | blue, blueLight, blueDark | chỉ lõi | thường | (chỉ lõi + hoa văn) |
| colorpoint | Colorpoint Shorthair | 3★ | point | ear=big | flamePt, creamPt, lynxPt | hoa văn point, ear | thường, có đặc điểm hình dáng | agent-03 |
| cornish | Cornish Rex | 3★ | solid | ear=big | white, black, blue, redTabby (tabby) | ear | thường, có đặc điểm hình dáng | agent-05 |
| devon | Devon Rex | 3★ | solid | ear=big | champagne, black, white, brownTabby (tabby) | ear | thường, có đặc điểm hình dáng | agent-05 |
| euburmese | European Burmese | 3★ | solid | - | redBurm, sable, cream, tortie (tortie) | hoa văn tortie | thường | (chỉ lõi + hoa văn) |
| himalayan | Himalayan | 3★ | point | ear=small, tail=fluff, fur, flat | sealPt, bluePt, chocPt, flamePt | hoa văn point, ear, tail, fur, flat | thường, có đặc điểm hình dáng | agent-07 |
| jbobtail | Japanese Bobtail | 3★ | calico | tail=bob | calico, redW (cow), cow (cow), white | hoa văn calico, hoa văn cow, tail | thường, có đặc điểm hình dáng | agent-02, agent-06 |
| kurilian | Kurilian Bobtail | 3★ | tabby | tail=bob, fur | brownTabby, redTabby, grayTabby | tail, fur | thường, có đặc điểm hình dáng | agent-06 |
| laperm | LaPerm | 3★ | tabby | fur | redTabby, brownTabby, choc, tortie (tortie) | hoa văn tortie, fur | thường, có đặc điểm hình dáng | agent-07 |
| manx | Manx | 3★ | tabby | tail=none | redTabbyW, brownTabby, cow (cow), black | hoa văn cow, tail | thường, có đặc điểm hình dáng | agent-06 |
| munchkin | Munchkin | 3★ | tabby | short | redTabbyW, cow (cow), calico (calico), brownTabbyW | hoa văn cow, hoa văn calico, short | thường, có đặc điểm hình dáng | agent-08 |
| norwegian | Rừng Na Uy | 3★ | tabby | ear=tuft, tail=fluff, fur | brownTabbyW, redTabbyW, cow (cow), smoke (smoke) | hoa văn cow, hoa văn smoke, ear, tail, fur | thường, có đặc điểm hình dáng | agent-07 |
| ocicat | Ocicat | 3★ | spot | - | spotChoc, spotSilver, spotBrown | hoa văn spot | thường | agent-04 |
| oriental | Oriental lông ngắn | 3★ | solid | ear=big | black, white, choc, blue | ear | thường, có đặc điểm hình dáng | agent-05 |
| ragamuffin | Ragamuffin | 3★ | tabby | tail=fluff, fur | brownTabbyW, calico (calico), blueW, redTabbyW | hoa văn calico, tail, fur | thường, có đặc điểm hình dáng | agent-07 |
| selkirk | Selkirk Rex | 3★ | solid | fur | cream, white, blue, redTabby (tabby) | fur | thường, có đặc điểm hình dáng | agent-07 |
| siberian | Siberian | 3★ | tabby | tail=fluff, fur | brownTabby, redTabby, grayTabby, smoke (smoke) | hoa văn smoke, tail, fur | thường, có đặc điểm hình dáng | agent-07 |
| snowshoe | Snowshoe | 3★ | point | - | sealBi, blueBi, lilacBi | hoa văn point | thường | agent-03 |
| somali | Somali | 3★ | ticked | ear=big, tail=fluff, fur | ruddy, sorrel, blueTick, fawnTick | hoa văn ticked, ear, tail, fur | thường, có đặc điểm hình dáng | agent-01 |
| sphynx | Sphynx | 3★ | hairless | ear=big, hl | hlPink, hlCream, hlGray, hlPied (cow) | hoa văn cow, hoa văn hairless, ear, hairless | thường, có đặc điểm hình dáng | agent-08 |
| tonkinese | Tonkinese | 3★ | point | - | minkNat, minkBlue, minkChamp | hoa văn point | thường | agent-03 |
| angora | Angora Thổ Nhĩ Kỳ | 3★ | solid | tail=fluff, fur | white, black, cream, oddWhite | tail, fur | thường, có đặc điểm hình dáng | agent-06 |
| minuet | Minuet | 3★ | cow | fur, flat, short | grayCow, white, cream, calico (calico) | hoa văn cow, hoa văn calico, fur, flat, short | thường, có đặc điểm hình dáng | agent-08 |
| ausmist | Australian Mist | 3★ | spot | - | spotChoc, spotBlue, spotGold | hoa văn spot | thường | agent-04 |
| mau | Egyptian Mau | 4★ | spot | - | spotSilver, spotBrown, smoke (smoke) | hoa văn spot, hoa văn smoke | thường | agent-04 |
| havana | Havana Brown | 4★ | solid | - | choc, lilac | chỉ lõi | thường | (chỉ lõi + hoa văn) |
| korat | Korat | 4★ | solid | - | koratBlue, blueLight | chỉ lõi | thường | (chỉ lõi + hoa văn) |
| cymric | Cymric | 4★ | tabby | tail=none, fur | brownTabby, redTabbyW, cow (cow), black | hoa văn cow, tail, fur | thường, có đặc điểm hình dáng | agent-06 |
| nebelung | Nebelung | 4★ | solid | tail=fluff, fur | blue, blueLight, blueDark | tail, fur | thường, có đặc điểm hình dáng | agent-06 |
| orientallh | Oriental lông dài | 4★ | solid | ear=big, tail=fluff, fur | choc, black, lilac, white | ear, tail, fur | thường, có đặc điểm hình dáng | (chỉ lõi + hoa văn) |
| peterbald | Peterbald | 4★ | hairless | ear=big, hl | hlCream, hlPink, hlGray, hlBlack | hoa văn hairless, ear, hairless | thường, có đặc điểm hình dáng | agent-08 |
| pixiebob | Pixiebob | 4★ | spot | ear=tuft, tail=bob | spotBrown, spotChoc | hoa văn spot, ear, tail | thường, có đặc điểm hình dáng | agent-05 |
| singapura | Singapura | 4★ | ticked | ear=big | sepia, sepiaDark | hoa văn ticked, ear | thường, có đặc điểm hình dáng | agent-01 |
| toyger | Toyger | 4★ | tiger | - | tigerOr, tigerBrown | hoa văn tiger | thường | agent-01 |
| van | Van Thổ Nhĩ Kỳ | 4★ | van | tail=fluff, fur | van, vanBlack | hoa văn van, tail, fur | thường, có đặc điểm hình dáng | agent-02 |
| chausie | Chausie | 4★ | ticked | ear=tuft | ruddy, black, grizzle | hoa văn ticked, ear | thường, có đặc điểm hình dáng | agent-01 |
| donskoy | Donskoy | 4★ | hairless | ear=big, hl | hlGray, hlPink, hlCream, hlBlack | hoa văn hairless, ear, hairless | thường, có đặc điểm hình dáng | agent-08 |
| highlander | Highlander | 4★ | spot | ear=curl, tail=bob | spotChoc, spotBrown, spotSilver | hoa văn spot, ear, tail | thường, có đặc điểm hình dáng | agent-05 |
| serengeti | Serengeti | 4★ | spot | ear=big | spotGold, black, smoke (smoke) | hoa văn spot, hoa văn smoke, ear | thường, có đặc điểm hình dáng | (chỉ lõi + hoa văn) |
| germanrex | German Rex | 4★ | solid | - | platinum, white, black, redTabby (tabby) | chỉ lõi | thường | (chỉ lõi + hoa văn) |
| neva | Neva Masquerade | 4★ | point | tail=fluff, fur | sealPt, bluePt, lynxPt, flamePt | hoa văn point, tail, fur | thường, có đặc điểm hình dáng | (chỉ lõi + hoa văn) |
| aphrodite | Aphrodite | 4★ | cow | fur | brownCow, cow, redW | hoa văn cow, fur | thường, có đặc điểm hình dáng | agent-02 |
| toybob | Toybob | 4★ | point | ear=small, tail=bob | sealPt, bluePt, lynxPt | hoa văn point, ear, tail | thường, có đặc điểm hình dáng | agent-06 |
| khaomanee | Khao Manee | 5★ | solid | gem, odd | kmIce, kmSapphire, kmEmerald, kmAmethyst, kmRuby, kmChada [trang phục] | gem | giống 5★ có trang phục hiếm | agent-08, agent-14 |
| lykoi | Lykoi | 5★ | lykoi | - | lyBlack, lyBlue, lyHood [trang phục] | hoa văn lykoi | giống 5★ có trang phục hiếm | agent-04, agent-14 |
| savannah | Savannah | 5★ | spot | ear=big | spotGold, spotSilver, black, smoke (smoke), svEgypt [trang phục] | hoa văn spot, hoa văn smoke, ear | giống 5★ có trang phục hiếm | agent-04, agent-14 |
| sokoke | Sokoke | 5★ | tiger | - | tigerBrown, tigerDark, skForest [trang phục] | hoa văn tiger | giống 5★ có trang phục hiếm | agent-01, agent-14 |
| suphalak | Suphalak | 5★ | solid | - | copper, copperDark, spMalai [trang phục] | chỉ lõi | giống 5★ có trang phục hiếm | agent-14 |
| lambkin | Lambkin | 4★ | solid | fur, short | white, cream, cow (cow), redTabby (tabby) | hoa văn cow, fur, short | thường, có đặc điểm hình dáng | agent-08 |
| bambino | Bambino | 4★ | solid | ear=big, short, hl | hlPink, hlCream, hlPied (cow) | hoa văn cow, ear, hairless, short | thường, có đặc điểm hình dáng | agent-08 |
| kinkalow | Kinkalow | 4★ | tabby | ear=curl, short | brownTabby, black, calico (calico), cream | hoa văn calico, ear, short | thường, có đặc điểm hình dáng | agent-08 |
| skookum | Skookum | 4★ | tabby | fur, short | redTabbyW, cow (cow), blue | hoa văn cow, fur, short | thường, có đặc điểm hình dáng | agent-08 |
| dwelf | Dwelf | 4★ | solid | ear=curl, short, hl | hlPink, hlGray, hlBlack | ear, hairless, short | thường, có đặc điểm hình dáng | agent-08 |
| genetta | Genetta | 4★ | spot | short | spotBrown, spotSilver | hoa văn spot, short | thường, có đặc điểm hình dáng | agent-08 |

Màu hiếm (áp lên mọi giống từ 4★ trở xuống): `r_odd` Trắng mắt hai màu (solid), `r_smoke` Khói bạc (smoke), `r_gold` Vàng kim (tabby), `r_cinnamon` Cinnamon (quế) (solid), `r_fawn` Fawn (nâu vàng nhạt) (solid), `r_stortie` Đồi mồi khói (tortie), `r_mcalico` Tam thể đực (calico), `r_nacre` Ánh xà cừ (nacre), `r_sheen` Đen ánh xanh (sheen).

## Mèo trang phục và đặc biệt (43)

| id | Tên | Sao | Nhóm | Đặc điểm | Trang phục | Dạng | Độ khó | Phiên |
|---|---|---|---|---|---|---|---|---|
| v_naruto | Mèo Naruto | 5★ | anime | - |  | nrBase, nrKurama, nrHokage | nhân vật đặc biệt 5★ | agent-09 |
| v_luffy | Mèo Luffy | 4★ | anime | - | haircap, strawhat, scar, suit, belt | - | có phụ kiện 4★ | agent-15 |
| v_goku | Mèo Goku | 5★ | anime | - |  | gkBase, gkGod | nhân vật đặc biệt 5★ | agent-09 |
| v_tanjiro | Mèo Tanjiro | 4★ | anime | - | haircap, scar, earrings, checker | - | có phụ kiện 4★ | agent-15 |
| v_nezuko | Mèo Nezuko | 4★ | anime | - | longhair, haircap, mr, bamboo, suit, belt | - | có phụ kiện 4★ | agent-15 |
| v_thunder | Mèo Zenitsu | 5★ | anime | closed | sword, haircap, tripat, sparks | v_thunder_0, ztGod | nhân vật đặc biệt 5★ | agent-10 |
| v_gojo | Mèo Gojo | 5★ | anime | - | spikes, blindfold, suit, collar | v_gojo_0, gjSix | nhân vật đặc biệt 5★ | agent-10 |
| v_anya | Mèo Anya | 4★ | anime | - | longhair, haircap, horns, suit, collar | - | có phụ kiện 4★ | agent-15 |
| v_frieren | Mèo Frieren | 4★ | anime | - | staff, twintails, haircap, suit, belt, collar | - | có phụ kiện 4★ | agent-16 |
| v_levi | Mèo Levi | 4★ | anime | - | cape, haircap, suit, cravat, belt | - | có phụ kiện 4★ | agent-16 |
| v_pika | Mèo Pikachu | 4★ | anime | - | eartips, cheeks, tailbase | - | có phụ kiện 4★ | agent-17 |
| v_totoro | Mèo Totoro | 4★ | anime | - | leaf, belly | - | có phụ kiện 4★ | agent-17 |
| v_dora | Mèo Doraemon | 4★ | anime | short | flag:noEars, collar, pocket | - | có phụ kiện 4★ | agent-17 |
| v_sailor | Mèo Sailor Moon | 4★ | anime | - | twintails, buns, haircap, tiara, suit, sailor, bow | - | có phụ kiện 4★ | agent-16 |
| v_conan | Mèo Conan | 4★ | anime | - | haircap, glasses, suit, bow | - | có phụ kiện 4★ | agent-16 |
| v_hero | Mèo Superman | 4★ | film | - | cape, haircap, suit, emblem, belt | - | có phụ kiện 4★ | agent-18 |
| v_pirate | Mèo Jack Sparrow | 4★ | film | -, hoa văn tabby | longhair, haircap, tricorn, suit, sides, belt, fr, fr | - | có phụ kiện 4★ | agent-19 |
| v_harry | Mèo Harry Potter | 5★ | film | - | wand, haircap, scar, glasses, suit, scarf | v_harry_0, hpSeeker | nhân vật đặc biệt 5★ | agent-11 |
| v_hermione | Mèo Hermione | 4★ | film | - | wand, longhair, haircap, suit, tie | - | có phụ kiện 4★ | agent-19 |
| v_voldemort | Mèo Voldemort | 4★ | film | - | wand, flag:noFace, flag:noEars, fr, fr, fr, fr, suit | - | có phụ kiện 4★ | agent-19 |
| v_wednesday | Mèo Wednesday | 4★ | film | - | twintails, haircap, suit, collar, lids | - | có phụ kiện 4★ | agent-19 |
| v_eleven | Mèo Eleven | 4★ | film | - | haircap, suit, sides, fr | - | có phụ kiện 4★ | agent-20 |
| v_heist | Mèo Phi Vụ Áo Đỏ | 4★ | film | - | flag:noMuz, hood, faceplate, mustache, suit | - | có phụ kiện 4★ | agent-20 |
| v_guard | Mèo Lính Áo Hồng | 4★ | film | - | flag:noFace, flag:noMuz, hood, faceplate, shape, suit | - | có phụ kiện 4★ | agent-20 |
| v_456 | Mèo Số 456 | 4★ | film | - | haircap, suit, number | - | có phụ kiện 4★ | agent-20 |
| v_iron | Mèo Iron Man | 4★ | film | - | flag:noFace, flag:noMuz, fullmask, faceplate, fr, fr, suit, emblem | - | có phụ kiện 4★ | agent-18 |
| v_spider | Mèo Spider-Man | 4★ | film | - | flag:noFace, flag:noMuz, fullmask, lenses, web, suit, sides, emblem | - | có phụ kiện 4★ | agent-18 |
| v_batman | Mèo Batman | 4★ | film | - | cape, flag:noFace, fullmask, lenses, suit, emblem, belt | - | có phụ kiện 4★ | agent-18 |
| v_jedi | Mèo Jedi | 4★ | film | - | saber, hood, suit, sides, belt | - | có phụ kiện 4★ | agent-21 |
| v_vader | Mèo Darth Vader | 5★ | film | - | vcape, flag:noFace, flag:noMuz, vhelm, vface, vsuit | v_vader_0, vdWhite | nhân vật đặc biệt 5★ | agent-11 |
| v_gandalf | Mèo Gandalf | 4★ | film | - | staff, pointhat, beard, suit | - | có phụ kiện 4★ | agent-21 |
| v_nyan | Nyan Cat | 5★ | meme | - | nrainbow, npoptart, cheeks, nstars | v_nyan_0, nyTac | nhân vật đặc biệt 5★ | agent-12 |
| v_maneki | Mèo Thần Tài | 5★ | meme | closed, hoa văn calico | collar, paw, coin | v_maneki_0, mkGold | nhân vật đặc biệt 5★ | agent-12 |
| v_grumpy | Mèo Grumpy | 4★ | meme | -, hoa văn point | frown | - | có phụ kiện 4★ | lõi (core.js) |
| v_huh | Mèo “Huh?” | 4★ | meme | -, hoa văn cow | qmark | - | có phụ kiện 4★ | lõi (core.js) |
| v_garfield | Mèo Garfield | 4★ | meme | -, hoa văn tiger | lenses, pupils, lids | - | có phụ kiện 4★ | agent-17 |
| v_tank | Mèo Ba Lỗ | 4★ | meme | -, hoa văn tabby | tank | - | có phụ kiện 4★ | agent-21 |
| v_ninja | Mèo Ninja | 4★ | meme | - | ninja | - | có phụ kiện 4★ | agent-21 |
| v_chef | Mèo Đầu Bếp | 4★ | meme | -, hoa văn cow | chef | - | có phụ kiện 4★ | agent-22 |
| v_bread | Mèo Bánh Mì | 4★ | meme | short | bread | - | có phụ kiện 4★ | agent-22 |
| v_dj | Mèo DJ | 4★ | meme | - | dj | - | có phụ kiện 4★ | agent-22 |
| v_astro | Mèo Phi Hành Gia | 5★ | meme | - | astro | v_astro_0, asOrange | nhân vật đặc biệt 5★ | agent-13 |
| v_royal | Mèo Hoàng Gia | 5★ | meme | fur | royal | v_royal_0, ryPurple | nhân vật đặc biệt 5★ | agent-13 |
