# Fetih: Faz 1 Tasarım Belgesi ("Bir oyun daha")

> Kapsam: Hanedanlar, kural kartları, harita türleri, zorluk, yapay zekâ kişilikleri, olaylar, alternatif zaferler, oyun sonu ekranı, miras ilerlemesi, günlük meydan okuma, başarımlar, yeni oyun akışı.
> Bütün sayılar `index.html` içindeki mevcut ölçeğe göre seçildi (TER verimleri 1-2/tur, FIELD base 2-3, UNITS atk 0,6-2,2, TCOST 15/30/60/110, FUND 260, GRACE 12, aiTurn eşiği 1,3/1,5, `aiB()` tavanı 0,5).
> Temel kural: **Mevcut oyun = "Klasik Beylik + Kart yok + Kıta + Çırak".** Bu ayarla oyun bugünküyle bit bit aynı çalışmalı. Bot ölçümleri ve eski kayıtlar bu ayara göre karşılaştırılır.

---

## 0. Teşhis

1. **Değişken olan tek şey harita.** `newGame()` her oyunda aynı başlangıcı kuruyor: 15 piyade, Karakol, sur 1, aynı kaynaklar (70/50/40/30/60/5), 260 akçe ve 12 tur barış. Rakipler her seferinde 14 piyade + 4 okçuyla başlıyor. `aiMix()` aynı takvimi izliyor (8. turda okçu, 16'da süvari, 24'te kuşatma, 34'te yeniçeri). Oyuncunun "bu sefer farklı ne yapayım" diye soracağı bir şey yok.
2. **Açılış çözülmüş durumda.** Kuruluşta 6 tesisten 1-2'si seçiliyor ama başkent hep ova/vadi (`cand` filtresi). Bu yüzden Tarla+Pazar ya da Tarla+Demir neredeyse her zaman doğru cevap. Oyunun ilk 5 dakikası her seferinde aynı geçiyor.
3. **Oyunun ortası iki uçlu.** %25 bölgeye ulaşmak 25-85 tur arasında değişiyor (uzun ve sıkıcı bir başlangıç), sonra kartopu başlıyor. AI'nin geliri `gain = 1 + 0,5·min(n,12) + …` formülüyle bölge sayısına bağlı, kaynak kısıtı yok. Küçülen AI hızla eriyor, büyüyen oyuncuyu durduracak hiçbir karşı güç yok. Son 20-30 tur ise bilinen sonun icrasından ibaret.
4. **Yapay zekânın kimliği yok.** Dört rakip aynı `need` eşiğini (1,3 / oyuncuya 1,5), aynı %20 yedeği, aynı %15 sur ihtimalini kullanıyor. "Kızıl Hanlık" ile "Mavi Krallık" arasındaki tek fark renk. Rakibi okuyup ona göre plan yapmak mümkün değil.
5. **Bitiş ekranı ve ilerleme yok.** `afterModal()` tek satır + "Yeni Oyun" gösteriyor. Skor, özet ya da kalıcı kazanım yok, bir sonraki oyunda farklı olacak hiçbir şey açılmıyor. Bot %80 kazandığı için zafer de anlamsızlaşıyor: oyuncuyu yeniden başlatan ne bir merak ("acaba X ile nasıl olur?") ne de bir hedef ("şunu açmama 20 puan kaldı").

## 0.1 Tasarım ilkeleri

1. **Her oyun bir "soru" ile başlar.** Hanedan + 1-2 kart + harita türü, oyuncuya açılıştan önce farklı bir problem verir ("demir yok ama süvarim güçlü, dağlık haritadayım"). Kural: herhangi iki oyunun ilk 10 turdaki en iyi açılışı farklı olmalı.
2. **Güçlü yan büyük, zayıf yan hissedilir.** Her hanedanın bir güçlü yanı oyunu %15-30 değiştirir. Zayıf yan, başka bir oyun planını açıkça kötüleştirir (sur, tarım, altın). Düz "+%5" bonusları yasak, çünkü fark edilmezler.
3. **Kartopuna karşı gerilim, ceza değil.** Oyuncu %35'e ulaşınca koalisyon kurulur, alternatif zaferlerin geri sayımları başlar, AI'nin eser yarışı devreye girer. Ama hiçbir mekanik oyuncunun bölgesini doğrudan silmez (isyan dışında, o da önlenebilir).
4. **Mevcut sayılar kutsal değil ama referanstır.** Tüm etkiler `mil()`, `TER`, `FIELD`, `UNITS`, `aiTurn` parametreleri üzerinden çarpan olarak uygulanır, yeni sistem minimumda tutulur. Klasik ayar mevcut oyunla aynı sonucu üretir. Botla ölçülen hedef: Kalfa zorluğunda her hanedan/kart kombinasyonunda **%35-65 kazanma**.
5. **Her bitiş bir sonraki oyunu satar.** Kazansan da kaybetsen de oyun sonu ekranı en az bir somut sonraki adım gösterir: "Deniz Beyleri'ne 18 MP kaldı", "Bu haritayı Usta'da dene", "Bugünün meydan okuması: Akıncı + Kara Veba". Miras puanı kayıpta da kazanılır (zaferin ~%30'u).

---

## 1. Hanedanlar

Klasik Beylik (`klasik`) değiştiricisi olmayan temel çizgidir: eski kayıtlar ve bot taban çizgisi için kullanılır, kuruluş ekranında "Klasik" etiketiyle her zaman seçilebilir ama miras çarpanı ×0,9'dur. Asıl 6 hanedan aşağıdadır.

| # | Hanedan (id) | Tema | Güçlü yan(lar) | Zayıf yan | Özel başlangıç | Özel yetenek | Kilit |
|---|---|---|---|---|---|---|---|
| 1 | **Börü Hanlığı** (`boru`) | Bozkır atlıları | Süvari saldırısı ×1,20 (1,7 → 2,04). Süvari demir maliyeti 2 → 1 | Sur savunması sur başına 0,25 → 0,20. Sur maliyeti ×1,4 | 11 piyade + 4 süvari (hazır). FUND 260 | **Akın:** Turda 1 kez, kazanılan bir saldırıdan sağ çıkan süvariler `rd` (hazır) kalır ve aynı tur yeniden saldırabilir | Açık |
| 2 | **Tunç Beyliği** (`tunc`) | Demirciler, ağır piyade | Silah donanımı bonusu +0,10 (0,25 → 0,35; tek. ile 0,40/0,45). Asker başına demir 0,2 → 0,15. Demir madeni ×1,25 | Tarla üretimi ×0,85. Nüfus büyümesi ×0,85 | Başkentte bedava **Demir Madeni Sv.1**. FUND 260 → 150 | **Dökümhane:** Yeniçeri Ordugâh'ta (kademe 4) açılır, Harbiye gerekmez. Yeniçeri demir maliyeti 3 → 2 | Açık |
| 3 | **Dağ Kartalları** (`kartal`) | Kale ve geçit bekçileri | Tüm bölgelerde savunma +0,15. Azami sur +1. Sur maliyeti ×0,75. Okçu savunması 1,6 → 1,9 | Saldırı çarpanı −0,10. Süvari maliyetine +1 demir | Başkent Tepelik/Dağlık da olabilir. Sur 2, 12 piyade + 4 okçu | **Geçit Bekçileri:** Elindeki her Dağ Geçidi ek +%20 savunma ve +1 moral/tur verir | Açık |
| 4 | **Bilge Hanedanı** (`bilge`) | Medrese ve âlimler | Medrese üretimi ×1,4. TCOST ×0,85 → [13, 26, 51, 94]. Antik Harabe bilgi +2 → +4 | Birlik altın maliyeti ×1,2. Altın maaşı ×1,1 | Strateji I (Haritacılık) açık başlar. Medrese fund 160 → 110 | **Külliye Ustaları:** Büyük Eser aşamaları −%25 kaynak, aşama süresi 3 → 2 tur | 60 MP **ya da** 1 Medeniyet zaferi |
| 5 | **Deniz Beyleri** (`deniz`) | Kıyı tüccarları | Liman altın 2 → 4, tahıl 2 → 3. Pazar Yeri ×1,3. Ticaret Kavşağı altın 3 → 4 | Ordu tahıl gideri ×1,2 (0,15 → 0,18). Fethedilen bölgeden gelen ganimet −0,05 | Başkent kıyıda seçilir, mümkünse Liman özellikli. +40 altın | **Haraç Diplomasisi:** Altın ödeyip bir rakiple 8 turluk ateşkes alır (maliyet 40 + 8 × o rakibin bölge sayısı). Bekleme süresi 15 tur | 90 MP **ya da** aynı anda 3 Liman tut |
| 6 | **Akıncı Sancağı** (`akinci`) | Yağmacı uç beyleri | Ganimet payı +0,15 (tavan 0,75 → 0,90). Fetihte moral +5 → +8 | Azami tesis seviyesi −1 (Sulama olmadan Sv.1). Fethedilen bölge nüfusu ×0,7 → ×0,6 | 18 piyade + 3 süvari. FUND 260 → 180 | **Yağma:** Komşu bir düşman/kabile bölgesine fethetmeden baskın. Saldırı gibi hesaplanır, kazanırsan bölge sahibinde kalır ama `lootStore` × 0,4 alınır, savunanın %25'i ölür ve bölge 3 tur üretim −%50 yaşar. Bekleme süresi 4 tur | 120 MP **ya da** tek oyunda 1500 toplam ganimet |

**Rakip AI'ye hanedan atama:** Her rakip, oyuncunun seçmediği 6 hanedandan rastgele birini alır (tekrarsız). AI sürümü sade bir **aiPerk** uygular: Börü → `aiMix` süvari ağırlığı ×2 ve süvari 10. turdan itibaren. Tunç → saldırı çarpanına +0,08. Kartal → sur tavanı 2 → 3, savunma +0,1. Bilge → `aiB` adımı ×1,25. Deniz → kazanç +1 (Liman/Kavşak başına). Akıncı → kabilelere karşı `need` −0,15. Renkler `FAC` dizisinde kalır, adlar hanedandan gelir ("Kızıl Börüler", "Mavi Tunçlar" … tabloda `aiAd`).

**Denge notu:** Klasik'e göre her hanedanın gücü bot ölçümünde ±%8 kazanma bandında olmalı. En riskli ikisi: Börü (ovalarda süvari ×1,3 × 1,2 = 2,65 etkin saldırı) ve Kartal (Medeniyet yoluyla "kaplumbağa").

---

## 2. Kural Değiştirici Kartlar (Mutatörler)

Kuruluşta 3 kart çekilir (açılmış kartlardan). Oyuncu **1'ini seçmek zorunda**, 2. kartı isteğe bağlı alır. "Zar at" düğmesi 2 rastgele kart atar ve ek ×1,10 verir. İlk oyun (Hızlı Başla) kartsızdır. Kart çarpanları çarpılır, toplam çarpan [0,8 ; 2,0] aralığına kırpılır.

| # | Kart (id) | Tür | Etki (sayısal) | Miras çarpanı | Kilit |
|---|---|---|---|---|---|
| 1 | **Kıtlık Çağı** (`kitlik`) | Kötü | Tarla üretimi ×0,75. Nüfus büyümesi ×0,8. Kıtlık olayı ağırlığı ×2 | ×1,25 | Açık |
| 2 | **Erken Savaş** (`erken`) | Kötü | GRACE 12 → 5 | ×1,30 | Açık |
| 3 | **Kabile Seli** (`kabile`) | Kötü | Kabile garnizonu (`base`) ×1,5. Kabileler 3 yerine 2 turda bir +1 piyade alır, sınır `base×1,5` → `base×2` | ×1,20 | Açık |
| 4 | **Sağlam Surlar** (`sur`) | Karma | Herkesin surları +1 başlar (azami sur sınırında). Sur başına savunma 0,25 → 0,30 (herkes). Kuşatma etkinliği −0,10 | ×1,15 | Açık |
| 5 | **Paralı Askerler** (`parali`) | Karma | Birlik altın maliyeti ×0,7. Altın maaşı 0,10 → 0,15 | ×1,00 | Açık |
| 6 | **Altın Çağı** (`altincag`) | Karma | Tüm tesisler ×1,2. AI kazancı ×1,2 | ×1,10 | Açık |
| 7 | **Bereketli Topraklar** (`bereket`) | İyi | Verimli Topraklar 5 → 10 bölge. Tarla +%15 | ×0,85 | Açık |
| 8 | **Demir Kıtlığı** (`demirsiz`) | Kötü | Demir verimi (arazi + tesis) ×0,6, ama asker başına demir 0,2 → 0,12 | ×1,15 | 20 MP |
| 9 | **Kara Veba** (`veba`) | Kötü | Veba olayı 15. turdan sonra her 15 turda kesin çıkar (herkes etkilenir, bkz. Olay E05) | ×1,15 | 20 MP |
| 10 | **Sisli Harita** (`sis`) | Kötü | Görüş `sight` 1 → 0 (komşular "?" görünür). Haritacılık 1'e çıkarır, Casusluk normal | ×1,15 | 25 MP |
| 11 | **Kanlı Toprak** (`kanli`) | Karma | Savaşta tüm kayıplar ×1,3 (kazanan sağ kalan oranı `fr` ^1,3). Ganimet payı +0,15 | ×1,10 | 25 MP |
| 12 | **Uzun Barış** (`baris`) | Karma | GRACE 12 → 20, ama AI kazancı ×1,15 ve AI'nin ilk saldırısı yığınakla yapılır | ×1,05 | 25 MP |
| 13 | **Kutsal İttifak** (`ittifak`) | Çok kötü | Koalisyon eşiği %35 → %22. Koalisyon sürerken AI'ler birbirine hiç saldırmaz | ×1,45 | 35 MP |
| 14 | **Sürgün Bey** (`surgun`) | Kötü | Başkent sur 0, Karakol yok (kademe 0), 8 piyade. FUND 260 → 420 (tesis ya da Karakol 20/20 alınabilir) | ×1,25 | 35 MP |

**Yasaklı/uyarılı çiftler:**
- `erken` + `surgun` yasak: 5. turda surutsuz ve 8 askerle saldırı yemek çözümsüz.
- `ittifak` + `kabile`, Destan zorlukta yasak.
- `bereket` + `altincag` uyarılı ("kolay" etiketi). Çarpanların çarpımı 0,935 olur, ×1,0 altı kabul edilir.

---

## 3. Harita Türleri

`genMap(seed)` → `genMap(seed, P)`. `P = MAPTYPES[id]` ile boyut çarpanlarının birleşimidir. Aşağıdaki "Kıta" değerleri **mevcut koddaki sabitlerle birebir aynıdır**, bu yüzden eski tohumlar aynı haritayı üretir.

| Parametre (koddaki karşılığı) | Kıta (`kita`) | Nehir Vadisi (`vadi`) | Dağ Kalesi (`dag`) | Körfez (`korfez`) |
|---|---|---|---|---|
| Merkez sayısı `sites` (80) | 80 | 80 | 84 | 86 |
| En küçük aralık `minD` (98) | 98 | 98 | 94 | 94 |
| Kara şekli `shape` | elips 0,47/0,45, gürültü 0,6 | elips 0,50/0,47, gürültü 0,45 | elips 0,47/0,45, gürültü 0,6 | elips 0,49/0,47 − iç deniz (bkz. not) |
| Kara eşiği `LAND` | 0,90 | 0,92 | 0,90 | 0,90 |
| Sıradağ oranı (`n*.15`) | 0,15 | 0,07 | 0,26 | 0,12 |
| Dağlık / Tepelik oranı (0,15/0,15) | 0,15 / 0,15 | 0,07 / 0,13 | 0,22 / 0,20 | 0,12 / 0,15 |
| Orman / Vadi oranı (`rest` içinde 0,38 / 0,20) | 0,38 / 0,20 | 0,28 / 0,34 | 0,40 / 0,12 | 0,34 / 0,20 |
| Maden Yatağı sayısı (5) | 5 | 3 | 8 | 5 |
| Nehir üst sınırı (6), kaynak aralığı (170) | 6, 170 | 11, 115 | 4, 190 | 5, 170 |
| Köprü oranı (`list.length/3`) | 1/3 | 1/4 | 1/3 | 1/2 |
| Geçit `clamp(gc,3,8)` | 3-8 | 2-5 | 6-12 | 3-8 |
| Kavşak / Liman / Verimli / Damar | 4 / 5 / 5 / 3 | 5 / 4 / 9 / 2 | 3 / 4 / 3 / 6 | 5 / 10 / 5 / 3 |
| Harabe / Kale / Mabet | 3 / 3 / 2 | 4 / 2 / 2 | 2 / 6 / 2 | 3 / 3 / 3 |
| Başkent adayı (`cand`) | ova/vadi, ≥3 komşu | vadi, ≥3 komşu | ova/vadi/tepe, ≥2 komşu | kıyı (`coastal`), ≥3 komşu |
| Beklenen oynanabilir bölge | ~55 | ~60 | ~48 | ~52 |
| Oyun karakteri | dengeli | süvari, köprüler, nehir cezası | geçit savaşı, kuşatma, okçu | çok liman/altın, iç denizin etrafında halka |
| Kilit | Açık | 30 MP | 45 MP | 60 MP |

**Körfez şekli:** `landV += max(0, 0,30 − d_c)·2,2`. Burada `d_c` merkezden normalize uzaklıktır (`(x−W/2)/(W·0,3)`, `(y−H/2)/(H·0,3)`). Ortada ~%9 alanlık bir iç deniz açılır. `coastal` hem dış hem iç kıyıda 1 olur, Liman sayısı 10'a çıkabilir. En büyük bileşen filtresi (`comp`) halkayı koparmamalı: iç deniz yarıçapı 0,30'u geçmesin, test tohumlarında halka kopuyorsa 0,26'ya düşür.

*(Gerçek "Takımada" için kıyı bölgeleri arasında deniz komşuluğu gerekiyor: `adjacency` dışı bir bağ, saldırıda ×0,6 ceza. Faz 2'ye bırakıldı, çünkü `MAP.regions[].adj` kullanan her yer etkilenir.)*

### Oyun boyu

| Boy (`size`) | `sites` × | `minD` | Rakip sayısı (`S.ais`) | Hedef oynanabilir | Hedef tur (bot medyan) | Hız bonusu tavanı (Skor `H`) | Kilit |
|---|---|---|---|---|---|---|---|
| Kısa (`kisa`) | 0,62 (≈50) | 122 | 3 (`[1,2,3]`) | ~34 | 35-50 | 60 tur | Açık |
| Orta (`orta`) | 1,0 | 98 | 4 | ~55 | 50-70 | 90 tur | Açık |
| Uzun (`uzun`) | 1,40 (≈112) | 82 | 4 + kabile garnizonu ×1,2 | ~78 | 85-115 | 130 tur | 40 MP |

Kısa oyunda Fetih zaferi %75 → %70, Hegemonya 3 → 2 başkent ister. GRACE değişmez.

---

## 4. Zorluk Basamakları

**Çırak = bugünkü oyun.** Yeni varsayılan Kalfa'dır (ilk oyundan sonra).

| Parametre | Çırak (`cirak`) | Kalfa (`kalfa`) | Usta (`usta`) | Destan (`destan`) |
|---|---|---|---|---|
| AI kazancı `gain` × | 1,00 | 1,20 | 1,40 | 1,65 |
| AI tekno `aiB` adımı (her 4 tur) / tavan | 0,03 / 0,50 | 0,035 / 0,55 | 0,04 / 0,62 | 0,045 / 0,70 |
| AI kuşatma (`siegeOf` AI dalı) | 0,15 → 0,35 (15. tur) | aynı | +0,05 | +0,10 |
| AI saldırı eşiği farkı (`need` +) | 0 | −0,05 | −0,10 | −0,15 |
| GRACE | 12 | 12 | 10 | 8 |
| Kabile garnizonu × | 1,0 | 1,1 | 1,2 | 1,3 |
| Oyuncu FUND | 260 | 260 | 240 | 210 |
| Oyuncu başlangıç kaynakları × | 1,0 | 1,0 | 0,9 | 0,8 |
| Koalisyon eşiği | yok | %35 | %33 | %30 |
| Olay dengesi (iyi:kötü ağırlığı) | 1,3 : 1 | 1 : 1 | 1 : 1,2 | 1 : 1,4 |
| Bot hedef kazanma oranı | ~%80 (mevcut) | %50 ± 8 | %30 ± 8 | %12 ± 6 |
| Miras çarpanı | ×0,6 | ×1,0 | ×1,4 | ×1,9 |
| Kilit | Açık | Açık | Kalfa'da 1 zafer | Usta'da 1 zafer |

---

## 5. Yapay Zekâ Kişilikleri

Her oyunda 4 kişilik 4 rakibe rastgele dağıtılır (Kısa oyunda 3 rakip, kişilik tekrarsız). Kişilik kuruluş ekranında gizlidir. Strateji I (Haritacılık) rakip panelinde gösterir, Casusluk niyetini de gösterir ("Yığınak: Taşhisar"). Bu, Strateji dalına yeni bir değer katar.

**Mevcut sabitler** (`aiTurn`): `need = 1,3` (oyuncuya 1,5); yedek `max(1, ready·0,2)`; `ready ≥ 4`; `n ≥ 3`; skor bonusu oyuncu +0,4 / başkent +0,6 / özellik +0,3; sur ihtimali 0,15 (sur < 2); başkentte tutulan %30; kazancın yarısı başkente, yarısı rastgele cepheye.

| Parametre (`AIPERS`) | Saldırgan (`saldirgan`) | Tüccar (`tuccar`) | Savunmacı (`savunmaci`) | Fırsatçı (`firsatci`) |
|---|---|---|---|---|
| `need` (AI/kabile) / oyuncuya | 1,15 / 1,30 | 1,45 / 1,70 | 1,60 / 1,90 | 1,30 / 1,50 (zayıflamış hedefe 1,10) |
| Yedek oranı `reserve` | 0,10 | 0,20 | 0,35 | 0,15 |
| En az hazır `minReady` | 3 | 5 | 6 | 4 |
| Kazanç × | 1,00 | 0,90 + 1 (Liman/Kavşak başına, ≤ +4) | 0,95 | 1,00 |
| Başkent payı `capShare` | 0,35 | 0,50 | 0,60 | 0,50 |
| Yığınak `stack` (cephe kazancının tek bölgeye giden oranı) | 0,60 | 0,20 | 0,00 | 0,40 (en zayıf komşuya bakan bölge) |
| Birlik karışımı (piy/okç/süv/kuş/yen ağırlık; `aiMix` eşikleri korunur) | 40/10/32/10/8 | 50/22/12/8/8 | 34/44/6/8/8 | 42/20/22/8/8 |
| Sur ihtimali / tavan | 0,05 / 1 | 0,15 / 2 | 0,30 / 3 | 0,12 / 2 |
| Hedef skoru: oyuncu / başkent / özellik | +0,6 / +0,6 / +0,2 | +0,1 / +0,3 / +0,8 (Kavşak/Liman +1,2) | +0,2 / +0,2 / +0,3 | +0,3 / +0,9 / +0,3 |
| Barış süresine tepki | GRACE−3'ten itibaren oyuncuya bakan cepheye `stack` = 1,0. GRACE turunda tek dalga | GRACE'ten sonra da 6 tur oyuncuya `need` +0,3 | GRACE bitişini önemsemez, oyuncuya yalnız karşı saldırı yapar | GRACE'ten sonra oyuncu bir savaş kaybettiği tur `need` 1,10 |
| Karşı saldırı | yok | yok | Saldırı yediği bölgeden, saldıranın bölgesine oran ≥ 1,2 ise | yok |
| Ateşkes / biat kabulü | ateşkes yalnız oyuncu 2× güçlüyse. Biat: bölge ≤ 2 | ateşkesi her zaman kabul eder. Biat: bölge ≤ 4 | ateşkes kabul. Biat: başkent düşünce | ateşkesi bozabilir (%25, oyuncu savaştaysa). Biat: bölge ≤ 3 |
| Koalisyona katılma | eşikte | eşik + %5 | eşikte | eşik − %5 (ilk katılan) |
| "Zayıflamış hedef" tanımı | — | — | — | Son turda asker sayısı ≥ %30 düşmüş ya da başka biriyle bu tur savaşmış bölge |

**Yığınak uygulaması:** `aiTurn` içindeki `for(k<gain-half)` döngüsü → `stackN = round((gain−capN)·stack)` birlik `S.aist[f].focus` bölgesine, kalanı rastgele cepheye gider. `focus`, en yüksek hedef skoruna bakan cephe bölgesidir ve 5 turda bir ya da fethedilince yeniden seçilir.

**Koalisyon (genel kural):** Oyuncu bölge oranı ≥ eşik (Kalfa %35) olunca, katılan AI'ler 12 tur boyunca birbirine saldırmaz, oyuncuya `need` −0,15 uygular ve hedef skoru oyuncu +0,5 alır. Oyuncu eşik − %5'in altına düşerse ya da 12 tur dolarsa koalisyon dağılır. Yeniden kurulma bekleme süresi 10 tur. Bir koalisyon üyesinin başkenti düşerse o üye koalisyondan çıkar ("Kılıç kırıldı"). Bu, oyuncuya bir koalisyonu kırma hedefi verir.

**Rakip adları:** `aiAd` = renk sıfatı + hanedan kökü: Kızıl/Mavi/Yeşil/Mor + Börüler / Tunçlar / Kartallar / Bilgeler / Deniz Beyleri / Akıncılar. Örnek: "Mavi Kartallar (Savunmacı)". Hükümdar adı rastgele seçilir (`RULERS`: Alp Er, Tarkan, Bilge Kağan, Yağmur Hatun, Arslan Bey, Ertuğrul, Tomris, Kutlu Bey, Turna Hatun, Atsız, Bumin, Börte, İlteriş, Sançar, Kara Yülük, Ay Hatun).

---

## 6. Rastgele Olaylar ve İkilemler

**Zamanlama:** İlk olay 5-7. turda. Sonra her olaydan sonra `S.evNext = turn + 6 + rnd(0..2)`, yani 75 turluk bir oyunda ~10-11 olay. Bir turda en fazla 1 rastgele olay + sistem olayları (Koalisyon, Eser Yarışı). Havuz: koşulu sağlayan olaylar `w` ağırlığıyla, son 20 turda çıkmış olanlar ×0,25. Seçimli olaylar modal açar ve yıl raporundan sonra gelir. Varsayılan seçenek ilk seçenektir, bot bunu seçer.

| Kod | Olay | Tür | Tetik / koşul | w | Seçenekler → sonuç |
|---|---|---|---|---|---|
| E01 | **Tüccar Kervanı** | Seçimli | Kavşak ya da Liman sahibi, ya da tur ≥ 8 | 10 | (a) Takas: −30 altın → +45 tahıl, +20 demir. (b) Vergi al: +25 altın. (c) Yağmala: +60 altın, moral −8, 15 tur kervan gelmez, Tüccar AI'ler 10 tur `need` −0,2 |
| E02 | **Kıtlık Yılı** | Kötü/seçimli | Tur ≥ 10. Ağırlık tahıl net < +5 ise ×2, `kitlik` kartıyla ×2 | 8 | 4 tur tarla −%40. (a) Ambarları aç: −35 altın, etki −%20'ye iner. (b) Orduyu kıs: 10% asker terhis (nüfusa döner), etki −%25. (c) Katlan |
| E03 | **Bereket Yılı** | İyi | Tur ≥ 6, ≥ 2 tarla | 7 | 3 tur tarla +%35, başkent nüfusu +8 |
| E04 | **Savaş Yorgunluğu** | Kötü/seçimli | Son 10 turda ≥ 8 savaş (oyuncu saldırısı + savunma) | 9 (koşulla) | (a) Şenlik: −45 altın, −20 tahıl, moral +6. (b) Sefer devam: moral −10 ve saldırmadığın her tur +2 geri gelir. (c) 3 tur saldırmama sözü: moral +4, 3 tur saldırı kilitli |
| E05 | **Veba** | Kötü/seçimli | Tur ≥ 20, ya da `veba` kartı | 5 | Oyuncunun rastgele bir bölgesi + komşularından 3'ü (her sahip): nüfus −%30, asker −%10. (a) Karantina: bu bölgelerde 3 tur üretim −%50, yayılma yok. (b) Ticaret açık: 2 tur sonra 3 yeni bölgeye yayılır (oyuncu ve AI) |
| E06 | **Hükümdarın Düğünü** | Seçimli | Tur ≥ 15, ≥ 1 komşu AI, AI'nin bir kızı yok, yani sadece bir kez | 6 | (a) Dünür ol (en güçlü komşu AI): 10 tur karşılıklı ateşkes, o AI'nin bölgeleri tam görünür. Bozarsan moral −15. (b) Büyük şölen: −50 altın, moral +15. (c) Sade nikâh: +10 altın |
| E07 | **Göçmen Dalgası** | İyi/seçimli | Tur ≥ 8 | 7 | (a) Başkente yerleştir: +20 nüfus (azami nüfusu 8 tur +10 aşabilir). (b) Sınır boylarına dağıt: 3 cephe bölgesine +8 nüfus ve +2 piyade |
| E08 | **Kütüphane Keşfi** | Seçimli | Antik Harabe sahibi | 8 (koşulla) | (a) Âlimlere ver: +35 bilgi. (b) Sat: +45 altın. (c) Sakla: Büyük Eser sonraki aşaması −%30 |
| E09 | **Usta Mimar** | Seçimli | Tur ≥ 10 | 6 | Sonraki (a) sur ya da askeri kuruluş −%50, veya (b) Büyük Eser aşaması 1 tur kısalır |
| E10 | **Paralı Bölük** | Seçimli | Altın ≥ 60 | 7 | (a) 60 altın → başkentte 8 süvari (hazır). 12 tur boyunca ek maaş 3 altın/tur, ödenmezse bölük dağılır. (b) Reddet |
| E11 | **Rakip Elçisi** | Seçimli | Tüccar ya da Savunmacı AI komşu, ateşkes yok | 7 | (a) Barış: o AI ile 10 tur ateşkes. (b) Ret: o AI 6 tur oyuncuya `need` −0,1. (c) Haraç iste (sen 1,5× güçlüysen): +30 altın, AI saldırgan moda geçer (`need` −0,15, 8 tur) |
| E12 | **Maden Çöküşü** | Kötü/seçimli | Demir madeni ya da taş ocağı Sv.≥2 | 6 | (a) Onar: −25 taş, −15 odun. (b) Bırak: tesis 1 seviye düşer |
| E13 | **Kabile Biatı** | İyi/seçimli | Komşu kabile bölgesi ve oyuncunun komşu askeri ≥ 2× o bölgenin | 8 (koşulla) | (a) −30 altın: bölge savaşsız senin olur (garnizonun yarısı piyade olarak sana katılır). (b) Reddet |
| E14 | **Ordu İçinde Hizip** | Kötü/seçimli | Toplam asker ≥ 120 ya da asker/nüfus ≥ 0,45 | 6 (koşulla) | (a) Ödüllendir: −60 altın. (b) Sürgün: moral −10, %8 asker kaybı. (c) Görmezden gel: %35 ihtimalle ≥ 10 askerli en uzak cephe bölgesi kabileye döner |
| E15 | **İsyan** | Kötü/seçimli | Moral < 35 ve ≥ 8 bölge, ya da kıtlık 2 tur üst üste | 9 (koşulla) | Başkente en uzak bölge isyan eder. (a) Rüşvet: −50 altın, −20 tahıl. (b) Bastır: bölgeyi isyancı kabileye karşı savun (asker 6 + nüfus×0,1). Kaybedersen bölge kabileye geçer |
| E16 | **Kuyruklu Yıldız** | Seçimli | Tur ≥ 25 | 4 | (a) Müneccimlere: bir dalın sonraki kademesi %50 bilgiyle açılır (5 tur içinde). (b) Kötü alamet ilan et: moral −5, rakiplerin bu tur kazancı ×0,5 |
| E17 | **Yangın** | Kötü/seçimli | Odun ≥ 80 | 5 | Odun stoğu −%40. (a) −10 taş ile kayıp −%20'ye iner |
| E18 | **Usta Akıncı Beyi** | İyi | Son 5 turda ≥ 3 fetih | 5 | Bir sonraki saldırıda moral çarpanı yerine ×1,15 sabit ve ganimet +0,1 |

**Sistem olayları** (`w`'siz, kesin):
- **S1 Koalisyon Kuruldu:** Kalfa'da %35. Bkz. §5.
- **S2 Eser Yarışı:** 30. turda en çok bölgesi olan AI kendi Büyük Eserine başlar (her 9 turda 1 aşama, 5 aşama). Başkenti düşerse sıfırlanır.
- **S3 Biat Teklifi:** §7 Hegemonya.
- **S4 Barış Bitti:** Mevcut GRACE mesajı.

---

## 7. Alternatif Zafer Yolları

**Öneri: Üç yol da her oyunda aynı anda açık. Kuruluşta isteğe bağlı bir "Ferman" (beyan edilen hedef) seçilir.**
Gerekçe: (1) Tek hedef kilidi, %25 sonrası kartopunda oyuncuya yön değiştirme kararı bırakmaz. Eş zamanlı yollar ise oyun ortasında gerçek bir karar üretir ("Külliyeye mi yükleneyim, son iki başkenti mi alayım?"). (2) Ferman tekrar oynanabilirliği artırır, çünkü oyuncu kendine bir soru seçer. Fermanı tutturursa MP ×1,25 alır, tutturamazsa ceza yoktur. Ferman 30. tura kadar 1 kez değiştirilebilir, ama değiştirirse bonus ×1,10'a düşer. (3) AI'nin üç yolu ayrı ayrı engelleme mantığı, oyuncuya hangi yolun tehdit altında olduğunu okuma işi verir.

| | **Fetih** (`fetih`) | **Medeniyet** (`medeniyet`) | **Hegemonya** (`hegemonya`) |
|---|---|---|---|
| Koşul | Bütün rakipleri yok et ya da oynanabilir bölgelerin ≥ %75'ini al (Kısa: %70) | ≥ 18/24 teknoloji **ve** başkentte **Büyük Eser (Külliye)** 5 aşamasının tamamı. Başkent o anda senin olmalı | 4 rakibin **orijinal** başkentlerinden 3'ünü (Kısa: 3'ten 2'sini) elinde tut ya da sahibini vasal yap, sonra bu durumu **10 tur kesintisiz** koru |
| İlerleme göstergesi | Bölge çubuğu `x/⌈0,75·playN⌉` + kalan rakip ikonları | Teknoloji 18 adımlık çubuk + 5 Külliye taşı | 3 başkent yuvası (★ tutuluyor / ⛓ vasal / ✕) + 10'luk geri sayım |
| Maliyet ölçeği | — | 18 tek. ≈ en ucuz 18 kademe: 6×(15+30+60) = 630 bilgi. Külliye aşaması k (1-5): taş 50·k^1,2, altın 40·k^1,2, bilgi 25·k, odun 20·k. Toplam ≈ 420 taş, 335 altın, 375 bilgi, 300 odun. Aşama başına en az 3 tur (Bilge 2), yani en az 15 tur | Vasallık bedeli: biat anında 40 altın ödül. Vasal haraç verir: 4 + 2 × bölge sayısı altın/tur |
| Başlama şartı | — | Külliye 1. aşama için ≥ 10 bölge ve İkmal II (Loncalar) | Biat teklifi: rakibin başkenti düşmüş ya da bölge sayısı kişilik eşiğinin altında (§5) **ve** sınır komşu askerin ≥ 2× onunki |
| Gerilim | Koalisyon (§5) | Aşama ≥ 3 olunca **tüm AI'ler** oyuncu başkentine hedef skoru +1,0 verir. Başkent düşerse Külliye 2 aşama geriler. AI Eser Yarışı (S2): AI 5 aşamayı önce bitirirse Medeniyet yolu kapanır (o AI'nin başkenti alınınca yeniden açılır) | Geri sayım sırasında tutulan başkentlere AI hedef skoru +1,0, Savunmacı AI'ler karşı saldırı eşiği 1,0. Vasal isyanı: moral < 40 ya da vasalın komşusu olan 2 bölgeni kaybedersen vasal bağımsızlığını ilan eder ve geri sayım sıfırlanır |
| Geri dönüş (oyuncu geride) | Kabile Biatı (E13), Akıncı/Börü erken baskısı | Külliye aşamaları savaşsız ilerler, küçük ama güvenli bir devletle kazanılabilir (ama ≥ 10 bölge şart) | Tek bir güçlü saldırıyla başkent alıp vasal yaparak büyümeden ilerlenebilir |
| AI'nin engellemesi | Koalisyon: `need` −0,15, AI'ler arası savaş durur | Eser Yarışı + başkent hedefleme + Fırsatçı AI Külliye'nin 4. aşamasında oyuncuya mutlaka saldırı dener (`need` 1,05) | Kaybedilen başkenti geri almak için o rakip tüm kazancını başkente komşu bölgeye yığar (`stack` 1,0) |
| Vasal davranışı | — | — | Oyuncuya saldırmaz, haraç öder, koalisyona katılmaz, bölgeleri Fetih yüzdesine **sayılmaz** (yollar birbirine karışmasın) |
| Skor tabanı `Z` | 1000 | 1100 | 1100 |

Bot hedefi (Kalfa, Orta, Ferman yok): zaferlerin %55-65'i Fetih, %15-25'i Medeniyet, %15-25'i Hegemonya. Bir yol < %10 kalırsa o yolun maliyeti %15 düşürülür.

---

## 8. Oyun Sonu Ekranı

### 8.1 Zafer ekranı (taslak)

```
┌─────────────────────────────────────────────────────────────┐
│ 👑 HÜKÜMDARLIK KURULDU — Medeniyet Zaferi                    │
│ Börü Hanlığı · Kalfa · Nehir Vadisi · Orta · 58. yıl         │
│ Kartlar: Erken Savaş (×1,30), Kanlı Toprak (×1,10)           │
│ Ferman: Medeniyet ✔ (MP ×1,25)                               │
├──────────────────────────┬──────────────────────────────────┤
│ SKOR 5.240               │ RÜTBE: Beylerbeyi  ▓▓▓▓▓▓░░ Vezir │
│ Taban 1100 · Bölge 1640  │ (sonraki rütbeye 760)            │
│ Tekno 500 · Savaş 380    │                                  │
│ Başkent 300 · Hız 384    │                                  │
│ × Zorluk 1,0 × Kart 1,43 │                                  │
├──────────────────────────┴──────────────────────────────────┤
│ GRAFİK (yıl ekseni): ■ bölge  ■ asker  ■ toplam brüt üretim │
│  dikey işaretler: ⚔ koalisyon, ★ başkent alındı, ☠ veba      │
├─────────────────────────────────────────────────────────────┤
│ En iyi savaş: 31. yıl Taşhisar — 22 askerle 41 düşman, %18   │
│ En büyük kayıp: 44. yıl Kuzgunkale — 37 asker, saldırı       │
│ En çok ganimet: Akdere (★) — 212                             │
│ Kıtlık turu: 2 · Olaylar: 11 (7 seçim) · Koalisyon: 1 kırdın │
├─────────────────────────────────────────────────────────────┤
│ MİRAS +78 MP  (oyun 60 + başarım 18)  → toplam 214           │
│ 🔓 Yeni: Deniz Beyleri artık alınabilir (90/90)              │
│ 🏅 Başarımlar: "Kanlı Kuruluş", "Külliye"                    │
│ Sıradaki: Akıncı Sancağı 120 MP — 94 kaldı                   │
├─────────────────────────────────────────────────────────────┤
│ [📋 Sonucu kopyala]  [↻ Aynı kurallar, yeni harita]           │
│ [🎲 Yeni kurallar]  [📅 Günlük meydan okuma (bugün oynanmadı)]│
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Yenilgi ekranı

Zafer ekranıyla aynı iskelet. Farklar:
- Başlık "🏴 Beylik Yıkıldı · 41. yıl". Altında **yenilgi nedeni** satırı: en son kaybedilen bölge, kim, kaçıncı yıl ("Kızıl Börüler başkentin Akdere'yi 38. yılda aldı").
- **"Seni ne bitirdi?"** (3 madde, kurallı teşhis; her biri bir `S.stats` sayacından üretilir):
  - kıtlık turu ≥ 3 → "Ordun 5 tur aç kaldı: ikinci tarlayı daha erken kur."
  - savunmada kaybedilen bölge ≥ 3 ve sur ortalaması < 1 → "Cephen surutsuzdu."
  - koalisyon kurulduktan sonra ≤ 10 turda düşüş → "Koalisyona tek cepheden yakalandın."
  - moral < 30 olan tur ≥ 5 → "Moral çöktü: Mabet ya da şenlik."
  - en yüksek bölge oranı ≥ %30 → "Zafere en yakın olduğun an: %34 (27. yıl)."
- Yollar çubuğu: üç zafer yolunda ne kadar ilerlemiştin (ör. Medeniyet 11/18 + 1/5).
- Miras ve "Sıradaki açılım" kutusu aynı. Yenilgi MP'si zaferin ~%30'u (§9).

### 8.3 Skor formülü

```
Skor_ham = Z + 40·B_maks + 25·T + 10·F + 100·K + H
  Z      = zafer tabanı (Fetih 1000, Medeniyet 1100, Hegemonya 1100; yenilgi 0)
  B_maks = oyun boyunca en çok tutulan bölge sayısı
  T      = açılan teknoloji (0-24)
  F      = kazanılan saldırı + savunma sayısı (savunma 0,5 sayılır)
  K      = ele geçirilen rakip başkenti (orijinal ya da sonradan, her olay 1 kez)
  H      = zafer ise max(0, Hız_tavanı − tur) × 12   (Orta: 90, Kısa: 60, Uzun: 130)
Skor = round(Skor_ham × Ç_zorluk × Ç_kart × Ç_harita)
  Ç_harita: Kıta 1,0 · Vadi 1,0 · Dağ Kalesi 1,1 · Körfez 1,05 · Klasik hanedan 0,9
```
Kalfa'da 65. yılda Fetih zaferi için örnek: 1000 + 40·42 + 25·16 + 10·40 + 100·4 + 25·12 = **4.180**.

### 8.4 Rütbeler

| Rütbe | Skor |
|---|---|
| Tımarlı | < 1.000 |
| Subaşı | 1.000-2.499 |
| Sancakbeyi | 2.500-3.999 |
| Beylerbeyi | 4.000-5.999 |
| Vezir-i Âzam | 6.000-7.999 |
| Cihangir | ≥ 8.000 |

### 8.5 Paylaşılabilir sonuç kartı (panoya metin)

```
⚔ Fetih · Günlük 19.10.2026
Börü Hanlığı · Kalfa · Nehir Vadisi
🃏 Erken Savaş + Kanlı Toprak
👑 Medeniyet · 58. yıl · 31/60 bölge
Skor 5.240 · Beylerbeyi
▁▂▂▃▅▆▆▇█  (her 10 yılda bölge payı)
Tohum: FTH-1A2B3C-BO-VA-KA-ER.KN
```
**Tohum kodu** = `FTH-<seed base36>-<dyn2>-<map2>-<diff2>-<kart2.kart2>[-<boy1>]`. Kuruluş ekranındaki "Tohum gir" alanı bu kodu çözer ve aynı kuralları + haritayı kurar. Günlük meydan okuma kodu `D` önekiyle başlar (`FTH-D20261019`).

### 8.6 "Yeni oyun" seçenekleri

- **Aynı kurallar, yeni harita:** cfg korunur, `seed` yeni; doğrudan kuruluşa (adım 4) gider.
- **Aynı tohum (rövanş):** cfg + seed korunur. Skor tabloya "rövanş" etiketiyle yazılır, MP ×0,5.
- **Yeni kurallar:** adım 1'den başlar, son hanedan ön seçili.
- **Günlük meydan okuma:** bugün oynanmadıysa vurgulu.

---

## 9. Miras (Meta) İlerleme

### 9.1 Miras puanı (MP) kazanımı

```
MP_oyun = round( (8 + Skor_ham/120 + (zafer ? 15 : 0)) × Ç_zorluk × Ç_kart × Ç_ferman × Ç_rövanş )
  Ç_ferman: ferman tuttu 1,25 / değiştirip tuttu 1,10 / yok-tutmadı 1,0
  Ç_rövanş: 0,5 (aynı tohum), aksi 1,0
  Erken pes: tur < 15 ise MP_oyun = 0 (taban 8 dahil)
MP_toplam = MP_oyun + Σ yeni başarım ödülleri + günlük seri ödülü
```
Örnekler: Kalfa 65. yıl Fetih zaferi (Skor_ham 4180) → 8 + 34,8 + 15 = **58**. Kalfa 40. yıl yenilgi (B_maks 12, T 6, F 15) → (480 + 150 + 150)/120 = 6,5 → 8 + 6,5 = **15**. Çırak zaferi ×0,6 → ~35.

**Çifte ödül koruması:** `S.metaDone = true` ancak MP yazıldıktan sonra kaydedilir. `load()` sonrası `afterModal()` bunu kontrol eder.

### 9.2 Harcama ve kilit ağacı

| Kategori | Öğe | Maliyet / koşul |
|---|---|---|
| Hanedan | Börü, Tunç, Kartal | Açık |
| | Bilge | 60 MP veya 1 Medeniyet zaferi |
| | Deniz Beyleri | 90 MP veya aynı anda 3 Liman |
| | Akıncı | 120 MP veya tek oyunda 1500 ganimet |
| Kart | 1-7 | Açık |
| | Demir Kıtlığı, Kara Veba | 20 MP |
| | Sisli Harita, Kanlı Toprak, Uzun Barış | 25 MP |
| | Kutsal İttifak, Sürgün Bey | 35 MP (ön koşul: 4 kart açılmış) |
| Harita | Kıta | Açık |
| | Nehir Vadisi | 30 MP |
| | Dağ Kalesi | 45 MP |
| | Körfez | 60 MP |
| | Uzun oyun boyu | 40 MP |
| Zorluk | Usta | Kalfa'da 1 zafer (MP yok) |
| | Destan | Usta'da 1 zafer |
| Başlangıç bonusu (bir yuva; 2. yuva toplam 400 MP harcanınca açılır). Her takılı bonus Ç_kart'ı ×0,95 yapar | Hazine Sandığı: FUND +40 | 30 MP |
| | Usta Çiftçi: başkentteki ilk tarla Sv.2 | 40 MP |
| | Haritacı: Strateji I açık (Bilge'de yerine Saldırı I) | 50 MP |
| | Kışla Temeli: başkent askeri kuruluş kademe 2 (Talim Usulü gerekmeden okçu) | 60 MP |
| | Sadık Muhafız: +6 piyade, +2 okçu | 45 MP |
| Kozmetik | Sancak motifleri (6), renk seçimi, rütbe çerçevesi | 15-30 MP ya da başarım |
| Ustalık | Hanedan ustalığı 1-5 (o hanedanla oyun/zafer). Yalnız kozmetik: unvan + bitiş kartında ★ | otomatik |

Toplam "güç" açılımları ≈ 60+90+120 + 2·20 + 3·25 + 2·35 + 30+45+60+40 + (30+40+50+60+45) = **995 MP**.

### 9.3 İlerleme eğrisi (örnek oyuncu, ~%50 kazanma)

| Oyun | Ayar | Sonuç | MP (oyun + başarım) | Birikmiş | Önerilen açılım | Kalan |
|---|---|---|---|---|---|---|
| 1 | Hızlı Başla: Börü, Çırak, Kıta, kart yok | Zafer, 72. yıl | 33 + 25 (İlk Zafer, Börü Yolu) | 58 | Nehir Vadisi (30) | 28 |
| 2 | Tunç, Kalfa, Kıtlık Çağı | Yenilgi, 44. yıl | 18 + 5 (Ders Alındı) | 51 | Demir Kıtlığı (20) | 31 |
| 3 | Kartal, Kalfa, Sağlam Surlar, Vadi | Zafer (Fetih) | 66 + 15 (Tunç Kapı, Kartal Yolu) | 112 | Bilge (60) | 52 |
| 4 | Bilge, Kalfa, Erken Savaş, Ferman: Medeniyet | Zafer (Medeniyet) | 98 + 30 (Külliye, Fermanın Sözü) | 180 | Dağ Kalesi (45), Hazine Sandığı (30) | 105 |
| 5 | Usta açık. Börü, Usta, Kabile Seli | Yenilgi | 30 + 10 | 220 | Kanlı Toprak (25) | 120 |
| 6 | Günlük meydan okuma (Kalfa) | Zafer | 62 + 15 (Günlük, seri 1) | 297 | Deniz Beyleri (90) | 45 |
| 7 | Deniz, Kalfa, Körfez yok → Kıta, 2 kart | Zafer (Hegemonya) | 85 + 25 | 407 | Körfez (60) | 10 |
| 8 | Kartal, Usta, Dağ Kalesi | Zafer | 105 + 30 (Usta Zaferi) → Destan açık | 542 | Uzun oyun (40), Usta Çiftçi (40), Veba (20) | 55 |
| 9 | Akıncı için birikim: Börü, Usta, 2 kart | Yenilgi | 38 + 5 | 598 | — | 98 |
| 10 | Tunç, Kalfa, Kutsal İttifak yok | Zafer | 64 + 10 | 672 | Akıncı (120) | 52 |

**Hedef eğri:** 10. oyunda 6/6 hanedan, 4/4 harita, ~9/14 kart, Destan açık. Kalan ~350 MP'lik kart/bonus ve 26 başarım 15-25 oyunluk ikinci dalgayı taşır. Sonrasında motivasyonu ustalık seviyeleri, rütbe rekorları ve günlük seri taşır.

### 9.4 Kalıcı veri şeması

Ayrı anahtar: `fetih-meta-v1`. Oyun kaydı `fetih-save-v5`, günlük oyun kaydı `fetih-daily-save-v1`. Şema §Veri şemaları → `META_DEFAULT`.

---

## 10. Günlük Meydan Okuma

- **Tohum:** `dseed = hash32('FTH' + YYYYMMDD)`. `hash32` = FNV-1a 32 bit, yerel saat dilimiyle tarih (00:00'da yenilenir).
- **Sabit kurallar** (`mulberry32(dseed)` ile sırayla çekilir): hanedan (6'dan biri, **oyuncunun açıp açmadığına bakılmaz**, günlük her şeyi tattırır), 2 kart (14'ten, yasaklı çiftler hariç), harita türü (4'ten), boy Orta (Pazar günleri Uzun), zorluk Kalfa (Cuma Usta), Ferman yok. Başlangıç bonusları **kapalı**.
- **Belirlenimcilik:** Harita `genMap(dseed)` ile zaten belirlenimci. Savaş, AI ve olaylar şu an `Math.random` kullanıyor. Günlük için tüm oyun içi rastgelelik `S.rs` durumlu bir RNG'ye (`rnd()`) taşınmalı (bkz. Entegrasyon §E7). Bu yapılmadan günlük skorlar oyuncunun kendi denemeleri arasında karşılaştırılamaz.
- **Deneme kuralı:** Günde 1 **sayılan** deneme. İlk biten oyun (zafer, yenilgi ya da 15. turdan sonra pes) skoru yazar. Sonraki denemeler "antrenman"dır, MP ×0,25.
- **Puan:** Normal Skor formülü. Günlük için ek olarak "tur cezası" yok, H tavanı 90.
- **Seri:** `daily.last` dün ise `streak++`, değilse `streak = 1`. Seri ödülü (günlük MP'ye eklenir): her gün +5. 3. gün +10, 7. gün +30 ve "Haftalık Sancak" kozmetiği, 14. gün +50, 30. gün +100 ve "Cihan Sancağı". **Seri koruması:** her 7 günlük seri 1 "Mühür" verir (en fazla 2). Kaçırılan 1 gün Mühür yakarak kurtarılır.
- **Saklama** (`META.daily`): `{last:'2026-10-19', streak:4, best:7, seals:1, hist:{'2026-10-19':{score:5240, win:true, turn:58, path:'medeniyet', dyn:'boru'}}}`. `hist` son 60 günle sınırlı. Günlük oyun ayrı kayıt anahtarında tutulur, böylece normal oyun bozulmaz. Ana menüde iki "Devam" düğmesi olur.
- **Paylaşım:** §8.5 kartı + `FTH-D20261019`. Başkası bu kodu girerse aynı kurallarla "antrenman" olarak oynar.

---

## 11. Başarımlar (28)

Ölçüm alanları: `S.stats` (oyun içi), `S.cfg`, `S.over/S.winBy`, `META`. "Farklı oynamayı teşvik eden"ler **[T]** ile işaretli.

| # | id | Ad | Koşul (ölçülebilir) | Ödül |
|---|---|---|---|---|
| 1 | `ilk_zafer` | İlk Zafer | Herhangi bir zafer | 15 MP |
| 2 | `ders` | Ders Alındı | İlk yenilgi (tur ≥ 15) | 5 MP |
| 3 | `boru_yolu` | Bozkırın Oğlu | Börü ile zafer | 10 MP |
| 4 | `tunc_kapi` | Tunç Kapı | Tunç ile zafer | 10 MP |
| 5 | `kartal_yolu` | Kartal Yuvası | Dağ Kartalları ile zafer | 10 MP |
| 6 | `bilge_yolu` | Kalem ve Kılıç | Bilge ile zafer | 10 MP |
| 7 | `deniz_yolu` | Denizler Beyi | Deniz Beyleri ile zafer | 10 MP |
| 8 | `akinci_yolu` | Uç Beyi | Akıncı ile zafer | 10 MP |
| 9 | `alti_hanedan` **[T]** | Altı Ocak | 6 hanedanın hepsiyle zafer (META) | 60 MP + "Altı Ocak" sancağı |
| 10 | `kulliye` **[T]** | Külliye | Medeniyet zaferi | 20 MP |
| 11 | `hegemon` **[T]** | Taç ve Haraç | Hegemonya zaferi | 20 MP |
| 12 | `uc_yol` **[T]** | Üç Yol | Üç zafer türünün hepsi (META) | 40 MP |
| 13 | `ferman` **[T]** | Fermanın Sözü | Ferman ilan edip ilk ferman yolundan kazan | 10 MP |
| 14 | `kanli_kurulus` **[T]** | Kanlı Kuruluş | `erken` kartıyla zafer | 15 MP |
| 15 | `vebali` **[T]** | Vebalı Yıllar | `veba` kartıyla, ≥ 2 vebadan sonra zafer | 15 MP |
| 16 | `sis_icinde` **[T]** | Sis İçinde | `sis` kartıyla, Strateji II açmadan zafer | 20 MP |
| 17 | `kutsal_ittifak` **[T]** | Herkese Karşı | `ittifak` kartıyla zafer | 25 MP |
| 18 | `cift_kart` **[T]** | Ağır Yük | Kart çarpanı ≥ 1,5 ile zafer | 20 MP |
| 19 | `usta` | Usta Hükümdar | Usta'da zafer | 30 MP |
| 20 | `destan` | Destan Yazıldı | Destan'da zafer | 60 MP + "Destan" çerçevesi |
| 21 | `yildirim` | Yıldırım | Orta haritada ≤ 45. yılda zafer | 20 MP |
| 22 | `kalesiz` **[T]** | Surları Sevmem | Hiç sur inşa etmeden (`stats.surBuilt = 0`) zafer | 15 MP |
| 23 | `piyade_ordusu` **[T]** | Halk Ordusu | Hiç süvari ve yeniçeri yetiştirmeden zafer (`stats.recruited.suv + yen = 0`, başlangıç birimleri hariç) | 15 MP |
| 24 | `koalisyon_kiran` | Kılıç Kırıldı | Bir koalisyonu bir üyenin başkentini alarak dağıt | 15 MP |
| 25 | `geri_donus` | Küllerinden | Başkentini kaybettikten sonra zafer | 20 MP |
| 26 | `yagmaci` | Ganimet Dağı | Tek oyunda ≥ 1500 toplam ganimet (`stats.loot`) | 10 MP |
| 27 | `kitlik_yok` | Bereketli Saltanat | Hiç kıtlık yaşamadan (`stats.famine = 0`) ≥ 50 turluk zafer | 10 MP |
| 28 | `seri7` | Yedi Gün Yedi Gece | Günlük seri 7 | 30 MP (seri ödülüne ek) |

Toplam başarım MP'si ≈ 595. Başarımlar yalnızca Çırak dışı zorlukta açılır (1, 2 ve 3-8 hariç), yoksa Çırak'ta çiftlik yapılır.

---

## 12. Yeni Oyun Akışı (Kuruluş Ekranı)

Mevcut `showSetup()` (tesis satın alma) **4. adım** olarak kalır. Önüne 3 adımlık "Sefer Hazırlığı" sihirbazı gelir (`ui.modal = 'wiz'`, `wide`).

**Adım 0: Karşılama** (META boşsa sihirbaz atlanır)
- İlk açılış: tek büyük düğme **"Hızlı Başla"** → Börü + kart yok + Kıta + Orta + Çırak → doğrudan 4. adım ve `showHelp()`. Altında küçük bir "Seferi kendim hazırlayayım" bağlantısı.
- Sonraki açılışlar: [Devam et] [Günlük meydan okuma (●)] [Yeni sefer] [Son ayarla yeniden].

**Adım 1: Hanedan seç**
- 6 kart (+ Klasik) ızgarası. Her kartta: sancak rengi, ad, tema cümlesi, ✔ güçlü yanlar (yeşil), ✖ zayıf yan (kırmızı), ★ yetenek, başlangıç satırı ("11🗡️ 4🐎 · 💰260"), ustalık yıldızları.
- Kilitli kart gri. "🔒 90 MP (sende 72)" ya da "3 Liman tut". MP yetiyorsa [Aç] düğmesi.
- [Rastgele hanedan] düğmesi (açık olanlardan).

**Adım 2: Kural kartları**
- 3 kart yüzü kapalı çekilir ve çevrilir. Her kartta tür rozeti (Kötü/Karma/İyi), etki satırı, miras çarpanı. Biri zorunlu, ikincisi isteğe bağlı.
- Sağda canlı **"Miras çarpanı: ×1,43"** ve bot verisiyle "Tahmini zorluk ●●●○○".
- [🎲 Zar at: 2 rastgele (+%10)] · [Yeniden çek] (oyun başına 1 kez; 2. kez 5 MP).

**Adım 3: Harita, boy, zorluk, ferman**
- Harita türü 4 kart (küçük önizleme: tohumla üretilmiş düşük çözünürlüklü harita, `genMap` ~150 ms, açılışta 1 kez). Boy: Kısa/Orta/Uzun. Zorluk: 4 düğme (kilitliler gri, koşul yazılı).
- Ferman: [Yok] [⚔ Fetih] [📜 Medeniyet] [👑 Hegemonya]. Kısa açıklama + "+%25 MP".
- Tohum alanı: boş = rastgele. `FTH-…` kodu yapıştırılınca adım 1-3 otomatik dolar ve kilitlenir.
- Özet şeridi: "Börü · Erken Savaş + Kanlı Toprak · Nehir Vadisi · Orta · Kalfa → MP ×1,43" + [Seferi Başlat ▶].

**Adım 4: Kuruluş** (mevcut `showSetup()`)
- Başlık "👑 {Hanedan} Kuruluşu". Hazine `S.cfg.fund` (hanedan + zorluk + bonus). Hanedanın bedava tesisi (Tunç: Demir Madeni Sv.1) "Hediye" etiketiyle önceden takılı ve geri alınamaz. Başlangıç bonusu satırı.
- Rakipler satırı: 4 sancak + adları. Kişilik "?" (Haritacılık açıksa görünür).

---

## Veri Şemaları (koda aktarılabilir taslaklar)

```js
// ---------- HANEDANLAR ----------
// mods: mil()'e eklenen/çarpan uygulanan alanlar (bkz. Entegrasyon E1)
const DYNASTIES={
 klasik:{ad:'Klasik Beylik',tema:'Ölçülü bir beylik',e:'🏳️',lock:null,mp:.9,
  start:{u:{piy:15},fund:260,mil:1,fort:1},mods:{},aiPerk:{}},
 boru:{ad:'Börü Hanlığı',tema:'Bozkır atlıları',e:'🐺',lock:null,aiAd:'Börüler',
  start:{u:{piy:11,suv:4},fund:260,mil:1,fort:1},
  mods:{suvAtk:1.2,unitCostAdd:{suv:{demir:-1}},fortPer:-.05,surCostMult:1.4},
  ability:'akin',aiPerk:{mixW:{suv:2},suvTurn:10}},
 tunc:{ad:'Tunç Beyliği',tema:'Demirciler ve ağır piyade',e:'🔨',lock:null,aiAd:'Tunçlar',
  start:{u:{piy:15},fund:150,mil:1,fort:1,fields:[{t:'demir',lv:1,gift:true}]},
  mods:{equipAdd:.10,iron:.15,fieldMult:{demir:1.25,tarla:.85},growth:.85,yenMil:4,unitCostAdd:{yen:{demir:-1}}},
  ability:'dokumhane',aiPerk:{atkAdd:.08}},
 kartal:{ad:'Dağ Kartalları',tema:'Kale ve geçit bekçileri',e:'🦅',lock:null,aiAd:'Kartallar',
  start:{u:{piy:12,okc:4},fund:260,mil:1,fort:2,capTerr:['ova','vadi','tepe','dag']},
  mods:{defAdd:.15,maxFortAdd:1,surCostMult:.75,unitDef:{okc:1.9},atkAdd:-.10,unitCostAdd:{suv:{demir:1}},gecitDef:.2,gecitMorale:1},
  ability:'gecit',aiPerk:{fortMax:3,defAdd:.1}},
 bilge:{ad:'Bilge Hanedanı',tema:'Medrese ve âlimler',e:'📜',lock:{mp:60,or:{winBy:'medeniyet'}},aiAd:'Bilgeler',
  start:{u:{piy:15},fund:260,mil:1,fort:1,tech:{str:1},fundCost:{medrese:110}},
  mods:{fieldMult:{medrese:1.4},tcost:.85,featY:{harabe:{bilgi:4}},unitGoldMult:1.2,upGold:1.1,wonderCost:.75,wonderTurns:2},
  ability:'kulliye',aiPerk:{aiBStep:1.25}},
 deniz:{ad:'Deniz Beyleri',tema:'Kıyı tüccarları',e:'⚓',lock:{mp:90,or:{harborsHeld:3}},aiAd:'Deniz Beyleri',
  start:{u:{piy:15},fund:260,mil:1,fort:1,res:{altin:40},capCoastal:true},
  mods:{featY:{liman:{altin:4,tahil:3},kavsak:{altin:4}},fieldMult:{pazar:1.3},upTahil:1.2,lootAdd:-.05},
  ability:'harac',aiPerk:{gainPerFeat:1}},
 akinci:{ad:'Akıncı Sancağı',tema:'Yağmacı uç beyleri',e:'🏹',lock:{mp:120,or:{lootOneGame:1500}},aiAd:'Akıncılar',
  start:{u:{piy:18,suv:3},fund:180,mil:1,fort:1},
  mods:{lootAdd:.15,lootCap:.9,conqMorale:8,maxFieldAdd:-1,conqPop:.6},
  ability:'yagma',aiPerk:{needNeutral:-.15}},
};
const ABILITIES={
 akin:{ad:'Akın',d:'Turda 1 kez: kazanılan saldırıdan sağ çıkan süvariler hazır kalır.',perTurn:1},
 dokumhane:{ad:'Dökümhane',d:'Yeniçeri Ordugâh\'ta açılır.',passive:true},
 gecit:{ad:'Geçit Bekçileri',d:'Geçitlerde +%20 savunma, geçit başına +1 moral/tur.',passive:true},
 kulliye:{ad:'Külliye Ustaları',d:'Büyük Eser −%25 maliyet, aşama 2 tur.',passive:true},
 harac:{ad:'Haraç Diplomasisi',d:'40+8×bölge altınla 8 tur ateşkes.',cd:15,truce:8},
 yagma:{ad:'Yağma',d:'Fethetmeden baskın: ganimetin %40\'ı, savunanın %25\'i ölür.',cd:4,loot:.4,kill:.25,prodPen:.5,prodTurns:3},
};

// ---------- KURAL KARTLARI ----------
const MUTATORS={
 kitlik:  {ad:'Kıtlık Çağı',tur:'kotu',x:1.25,lock:0, mods:{fieldMult:{tarla:.75},growth:.8},evW:{E02:2}},
 erken:   {ad:'Erken Savaş',tur:'kotu',x:1.30,lock:0, cfg:{grace:5}},
 kabile:  {ad:'Kabile Seli',tur:'kotu',x:1.20,lock:0, cfg:{neutralBase:1.5,neutralEvery:2,neutralCap:2}},
 sur:     {ad:'Sağlam Surlar',tur:'karma',x:1.15,lock:0, cfg:{fortStart:1,fortPerAll:.30,siegeAdd:-.10}},
 parali:  {ad:'Paralı Askerler',tur:'karma',x:1.00,lock:0, mods:{unitGoldMult:.7,upGoldRate:.15}},
 altincag:{ad:'Altın Çağı',tur:'karma',x:1.10,lock:0, mods:{fieldMultAll:1.2},cfg:{aiGain:1.2}},
 bereket: {ad:'Bereketli Topraklar',tur:'iyi',x:.85,lock:0, map:{verimli:10},mods:{fieldMult:{tarla:1.15}}},
 demirsiz:{ad:'Demir Kıtlığı',tur:'kotu',x:1.15,lock:20, mods:{resMult:{demir:.6},iron:.12}},
 veba:    {ad:'Kara Veba',tur:'kotu',x:1.15,lock:20, cfg:{plagueEvery:15,plagueFrom:15}},
 sis:     {ad:'Sisli Harita',tur:'kotu',x:1.15,lock:25, mods:{sightAdd:-1}},
 kanli:   {ad:'Kanlı Toprak',tur:'karma',x:1.10,lock:25, cfg:{lossExp:1.3},mods:{lootAdd:.15}},
 baris:   {ad:'Uzun Barış',tur:'karma',x:1.05,lock:25, cfg:{grace:20,aiGain:1.15,graceStack:true}},
 ittifak: {ad:'Kutsal İttifak',tur:'cokkotu',x:1.45,lock:35,req:4, cfg:{coalAt:.22,coalNoInfight:true}},
 surgun:  {ad:'Sürgün Bey',tur:'kotu',x:1.25,lock:35,req:4, start:{u:{piy:8},fund:420,mil:0,fort:0}},
};
const MUT_BAN=[['erken','surgun']], MUT_BAN_DESTAN=[['ittifak','kabile']];

// ---------- HARİTA TÜRLERİ / BOY ----------
// 'kita' = mevcut genMap sabitleri (eski tohumlarla bit bit aynı harita)
const MAPTYPES={
 kita:{ad:'Kıta',lock:0,sites:80,minD:98,ell:[.47,.45],noise:.6,LAND:.9,lake:0,
  ridge:.15,dag:.15,tepe:.15,orman:.38,vadi:.20,maden:5,rivers:6,rivGap:170,bridge:1/3,
  gecit:[3,8],feat:{kavsak:4,liman:5,verimli:5,damar:3,harabe:3,kale:3,mabet:2},cap:{terr:['ova','vadi'],adj:3}},
 vadi:{ad:'Nehir Vadisi',lock:30,sites:80,minD:98,ell:[.50,.47],noise:.45,LAND:.92,lake:0,
  ridge:.07,dag:.07,tepe:.13,orman:.28,vadi:.34,maden:3,rivers:11,rivGap:115,bridge:1/4,
  gecit:[2,5],feat:{kavsak:5,liman:4,verimli:9,damar:2,harabe:4,kale:2,mabet:2},cap:{terr:['vadi'],adj:3}},
 dag:{ad:'Dağ Kalesi',lock:45,sites:84,minD:94,ell:[.47,.45],noise:.6,LAND:.9,lake:0,
  ridge:.26,dag:.22,tepe:.20,orman:.40,vadi:.12,maden:8,rivers:4,rivGap:190,bridge:1/3,
  gecit:[6,12],feat:{kavsak:3,liman:4,verimli:3,damar:6,harabe:2,kale:6,mabet:2},cap:{terr:['ova','vadi','tepe'],adj:2}},
 korfez:{ad:'Körfez',lock:60,sites:86,minD:94,ell:[.49,.47],noise:.6,LAND:.9,lake:{r:.30,k:2.2},
  ridge:.12,dag:.12,tepe:.15,orman:.34,vadi:.20,maden:5,rivers:5,rivGap:170,bridge:1/2,
  gecit:[3,8],feat:{kavsak:5,liman:10,verimli:5,damar:3,harabe:3,kale:3,mabet:3},cap:{coastal:true,adj:3}},
};
const SIZES={
 kisa:{ad:'Kısa',sitesMult:.62,minD:122,ais:[1,2,3],speedCap:60,conqPct:.70,hegNeed:2,lock:0},
 orta:{ad:'Orta',sitesMult:1,minD:null,ais:[1,2,3,4],speedCap:90,conqPct:.75,hegNeed:3,lock:0},
 uzun:{ad:'Uzun',sitesMult:1.4,minD:82,ais:[1,2,3,4],speedCap:130,conqPct:.75,hegNeed:3,neutralBase:1.2,lock:40},
};

// ---------- ZORLUK ----------
const DIFFS={
 cirak: {ad:'Çırak', aiGain:1.00,aiBStep:.030,aiBCap:.50,aiSiege:0,  needAdd:0,   grace:12,neutral:1.0,fund:260,res:1.0,coalAt:null,evBias:1.3, mp:.6, lock:null},
 kalfa: {ad:'Kalfa', aiGain:1.20,aiBStep:.035,aiBCap:.55,aiSiege:0,  needAdd:-.05,grace:12,neutral:1.1,fund:260,res:1.0,coalAt:.35,evBias:1.0, mp:1.0,lock:null},
 usta:  {ad:'Usta',  aiGain:1.40,aiBStep:.040,aiBCap:.62,aiSiege:.05,needAdd:-.10,grace:10,neutral:1.2,fund:240,res:.9, coalAt:.33,evBias:.83,mp:1.4,lock:{winOn:'kalfa'}},
 destan:{ad:'Destan',aiGain:1.65,aiBStep:.045,aiBCap:.70,aiSiege:.10,needAdd:-.15,grace:8, neutral:1.3,fund:210,res:.8, coalAt:.30,evBias:.71,mp:1.9,lock:{winOn:'usta'}},
};

// ---------- YAPAY ZEKÂ KİŞİLİKLERİ ----------
// mix: aiMix ağırlıkları (tür, aiMix'in tur eşikleri açıldıktan sonra kullanılır)
const AIPERS={
 saldirgan:{ad:'Saldırgan',need:1.15,needP:1.30,reserve:.10,minReady:3,gain:1.0,capShare:.35,stack:.60,
  mix:{piy:40,okc:10,suv:32,kus:10,yen:8},fort:[.05,1],score:{player:.6,cap:.6,feat:.2},
  grace:{preStack:3},truceIf:'player2x',vassalAt:2,coal:0},
 tuccar:{ad:'Tüccar',need:1.45,needP:1.70,reserve:.20,minReady:5,gain:.9,gainPerFeat:{liman:1,kavsak:1,max:4},capShare:.50,stack:.20,
  mix:{piy:50,okc:22,suv:12,kus:8,yen:8},fort:[.15,2],score:{player:.1,cap:.3,feat:.8,trade:1.2},
  grace:{postNeedAdd:.3,turns:6},truceIf:'always',vassalAt:4,coal:.05},
 savunmaci:{ad:'Savunmacı',need:1.60,needP:1.90,reserve:.35,minReady:6,gain:.95,capShare:.60,stack:0,
  mix:{piy:34,okc:44,suv:6,kus:8,yen:8},fort:[.30,3],score:{player:.2,cap:.2,feat:.3},
  counter:1.2,grace:{ignore:true},truceIf:'always',vassalAt:'capLost',coal:0},
 firsatci:{ad:'Fırsatçı',need:1.30,needP:1.50,needWeak:1.10,reserve:.15,minReady:4,gain:1.0,capShare:.50,stack:.40,stackTarget:'weakest',
  mix:{piy:42,okc:20,suv:22,kus:8,yen:8},fort:[.12,2],score:{player:.3,cap:.9,feat:.3},
  weakDrop:.30,grace:{needOnPlayerLoss:1.10},truceBreak:.25,vassalAt:3,coal:-.05},
};
const AI_COLORS=['Kızıl','Mavi','Yeşil','Mor'];
const RULERS=['Alp Er','Tarkan','Bilge Kağan','Yağmur Hatun','Arslan Bey','Ertuğrul','Tomris','Kutlu Bey','Turna Hatun','Atsız','Bumin','Börte','İlteriş','Sançar','Kara Yülük','Ay Hatun'];

// ---------- OLAYLAR ----------
// cond(S) => bool; opts[].fx(S) uygular; 'ai' seçenek botun/varsayılanın indeksi
const EVENTS=[
 {id:'E01',ad:'Tüccar Kervanı',w:10,tur:'secim',cond:S=>S.turn>=8||hasFeat(['kavsak','liman']),
  opts:[{t:'Takas et',c:{altin:30},g:{tahil:45,demir:20}},{t:'Vergi al',g:{altin:25}},
        {t:'Yağmala',g:{altin:60},morale:-8,flag:{noCaravan:15,tuccarAngry:10}}]},
 {id:'E02',ad:'Kıtlık Yılı',w:8,tur:'kotu',cond:S=>S.turn>=10,wIf:[[S=>netTahil()<5,2]],
  eff:{fieldMult:{tarla:.6},turns:4},
  opts:[{t:'Ambarları aç',c:{altin:35},eff:{fieldMult:{tarla:.8}}},{t:'Orduyu kıs',disband:.10,eff:{fieldMult:{tarla:.75}}},{t:'Katlan'}]},
 {id:'E03',ad:'Bereket Yılı',w:7,tur:'iyi',cond:S=>S.turn>=6&&countFields('tarla')>=2,eff:{fieldMult:{tarla:1.35},turns:3},capPop:8},
 {id:'E04',ad:'Savaş Yorgunluğu',w:9,tur:'secim',cond:S=>battlesLast(10)>=8,
  opts:[{t:'Şenlik',c:{altin:45,tahil:20},morale:6},{t:'Sefer devam',morale:-10,regen:2},{t:'3 tur barış sözü',morale:4,lockAtk:3}]},
 {id:'E05',ad:'Veba',w:5,tur:'secim',cond:S=>S.turn>=20,plague:{pop:.30,troops:.10,n:4},
  opts:[{t:'Karantina',eff:{prodMult:.5,turns:3,scope:'plague'}},{t:'Ticaret açık',spread:{after:2,n:3}}]},
 {id:'E06',ad:'Hükümdarın Düğünü',w:6,tur:'secim',once:true,cond:S=>S.turn>=15&&adjAIs().length>0,
  opts:[{t:'Dünür ol',truce:{who:'strongestAdj',turns:10},reveal:true,breakMorale:-15},{t:'Büyük şölen',c:{altin:50},morale:15},{t:'Sade nikâh',g:{altin:10}}]},
 {id:'E07',ad:'Göçmen Dalgası',w:7,tur:'secim',cond:S=>S.turn>=8,
  opts:[{t:'Başkente yerleştir',capPop:20,overcap:{add:10,turns:8}},{t:'Sınır boylarına',front:{n:3,pop:8,piy:2}}]},
 {id:'E08',ad:'Kütüphane Keşfi',w:8,tur:'secim',cond:S=>hasFeat(['harabe']),
  opts:[{t:'Âlimlere',g:{bilgi:35}},{t:'Sat',g:{altin:45}},{t:'Sakla',wonderDisc:.3}]},
 {id:'E09',ad:'Usta Mimar',w:6,tur:'secim',cond:S=>S.turn>=10,
  opts:[{t:'Sur/kuruluş −%50',nextBuildDisc:.5},{t:'Eser aşaması −1 tur',wonderTurn:-1}]},
 {id:'E10',ad:'Paralı Bölük',w:7,tur:'secim',cond:S=>S.res.altin>=60,
  opts:[{t:'Kirala',c:{altin:60},units:{suv:8},ready:true,upkeep:{altin:3,turns:12}},{t:'Reddet'}]},
 {id:'E11',ad:'Rakip Elçisi',w:7,tur:'secim',cond:S=>adjAIs(['tuccar','savunmaci']).some(f=>!truce(f)),
  opts:[{t:'Barış',truce:{who:'envoy',turns:10}},{t:'Reddet',aiNeed:{who:'envoy',add:-.1,turns:6}},
        {t:'Haraç iste',req:'power1.5',g:{altin:30},aiNeed:{who:'envoy',add:-.15,turns:8}}]},
 {id:'E12',ad:'Maden Çöküşü',w:6,tur:'secim',cond:S=>hasFieldLv(['demir','tasocagi'],2),
  opts:[{t:'Onar',c:{tas:25,odun:15}},{t:'Bırak',fieldDown:1}]},
 {id:'E13',ad:'Kabile Biatı',w:8,tur:'secim',cond:S=>neutralAdjWeak(2).length>0,
  opts:[{t:'Kabul (30 altın)',c:{altin:30},annex:{joinFrac:.5}},{t:'Reddet'}]},
 {id:'E14',ad:'Ordu İçinde Hizip',w:6,tur:'secim',cond:S=>totalTroops()>=120||totalTroops()/totalPop()>=.45,
  opts:[{t:'Ödüllendir',c:{altin:60}},{t:'Sürgün',morale:-10,kill:.08},{t:'Görmezden gel',defect:{p:.35,minTroops:10}}]},
 {id:'E15',ad:'İsyan',w:9,tur:'secim',cond:S=>(S.morale<35&&own().length>=8)||S.stats.famineStreak>=2,
  opts:[{t:'Rüşvet',c:{altin:50,tahil:20}},{t:'Bastır',rebel:{base:6,popFrac:.1}}]},
 {id:'E16',ad:'Kuyruklu Yıldız',w:4,tur:'secim',cond:S=>S.turn>=25,
  opts:[{t:'Müneccimler',techDisc:{frac:.5,turns:5}},{t:'Kötü alamet',morale:-5,aiGainOnce:.5}]},
 {id:'E17',ad:'Yangın',w:5,tur:'secim',cond:S=>S.res.odun>=80,
  opts:[{t:'Söndür (10 taş)',c:{tas:10},resLoss:{odun:.2}},{t:'Yansın',resLoss:{odun:.4}}]},
 {id:'E18',ad:'Usta Akıncı Beyi',w:5,tur:'iyi',cond:S=>conquestsLast(5)>=3,buff:{nextAtkMorale:1.15,lootAdd:.1}},
];
const EV_CFG={first:[5,7],gap:[6,8],repeatPenalty:{turns:20,mult:.25}};

// ---------- ZAFER ----------
const VICTORY={
 fetih:{ad:'Fetih',Z:1000},
 medeniyet:{ad:'Medeniyet',Z:1100,tech:18,wonder:{stages:5,turns:3,minRegions:10,req:['eko',2],
  cost:k=>({tas:Math.round(50*k**1.2),altin:Math.round(40*k**1.2),bilgi:25*k,odun:20*k}),capLoss:2,aiTargetAt:3}},
 hegemonya:{ad:'Hegemonya',Z:1100,need:3,hold:10,vassalTribute:n=>4+2*n,vassalGift:40,rebelMorale:40,rebelLostAdj:2},
};

// ---------- BAŞARIMLAR ----------
// test(S,META) => bool; oyun sonunda (ve bazıları anında) değerlendirilir
const ACHIEVEMENTS=[
 {id:'ilk_zafer',ad:'İlk Zafer',mp:15,test:(S)=>S.over==='win'},
 {id:'ders',ad:'Ders Alındı',mp:5,test:(S)=>S.over==='lose'&&S.turn>=15},
 ...['boru','tunc','kartal','bilge','deniz','akinci'].map(d=>({id:d+'_yolu',ad:DYNASTIES[d].ad+' zaferi',mp:10,test:S=>S.over==='win'&&S.cfg.dyn===d})),
 {id:'alti_hanedan',ad:'Altı Ocak',mp:60,cos:'sancak_alti',test:(S,M)=>['boru','tunc','kartal','bilge','deniz','akinci'].every(d=>M.stats.byDyn[d]?.w>0)},
 {id:'kulliye',ad:'Külliye',mp:20,test:S=>S.winBy==='medeniyet'},
 {id:'hegemon',ad:'Taç ve Haraç',mp:20,test:S=>S.winBy==='hegemonya'},
 {id:'uc_yol',ad:'Üç Yol',mp:40,test:(S,M)=>['fetih','medeniyet','hegemonya'].every(p=>M.stats.byPath[p]>0)},
 {id:'ferman',ad:'Fermanın Sözü',mp:10,test:S=>S.over==='win'&&S.cfg.ferman&&S.winBy===S.cfg.ferman&&!S.fermanChanged},
 {id:'kanli_kurulus',ad:'Kanlı Kuruluş',mp:15,test:S=>S.over==='win'&&S.cfg.muts.includes('erken')},
 {id:'vebali',ad:'Vebalı Yıllar',mp:15,test:S=>S.over==='win'&&S.cfg.muts.includes('veba')&&S.stats.plagues>=2},
 {id:'sis_icinde',ad:'Sis İçinde',mp:20,test:S=>S.over==='win'&&S.cfg.muts.includes('sis')&&S.tech.str<2},
 {id:'kutsal_ittifak',ad:'Herkese Karşı',mp:25,test:S=>S.over==='win'&&S.cfg.muts.includes('ittifak')},
 {id:'cift_kart',ad:'Ağır Yük',mp:20,test:S=>S.over==='win'&&S.cfg.mutX>=1.5},
 {id:'usta',ad:'Usta Hükümdar',mp:30,test:S=>S.over==='win'&&['usta','destan'].includes(S.cfg.diff)},
 {id:'destan',ad:'Destan Yazıldı',mp:60,cos:'cerceve_destan',test:S=>S.over==='win'&&S.cfg.diff==='destan'},
 {id:'yildirim',ad:'Yıldırım',mp:20,test:S=>S.over==='win'&&S.cfg.size==='orta'&&S.turn<=45},
 {id:'kalesiz',ad:'Surları Sevmem',mp:15,test:S=>S.over==='win'&&S.stats.surBuilt===0},
 {id:'piyade_ordusu',ad:'Halk Ordusu',mp:15,test:S=>S.over==='win'&&!S.stats.recruited.suv&&!S.stats.recruited.yen},
 {id:'koalisyon_kiran',ad:'Kılıç Kırıldı',mp:15,test:S=>S.stats.coalBroken>0},
 {id:'geri_donus',ad:'Küllerinden',mp:20,test:S=>S.over==='win'&&S.stats.capLost>0},
 {id:'yagmaci',ad:'Ganimet Dağı',mp:10,test:S=>S.stats.loot>=1500},
 {id:'kitlik_yok',ad:'Bereketli Saltanat',mp:10,test:S=>S.over==='win'&&S.stats.famine===0&&S.turn>=50},
 {id:'seri7',ad:'Yedi Gün Yedi Gece',mp:30,test:(S,M)=>M.daily.streak>=7},
];
const ACH_CIRAK_OK=['ilk_zafer','ders','boru_yolu','tunc_yolu','kartal_yolu','bilge_yolu','deniz_yolu','akinci_yolu'];

// ---------- SKOR / MİRAS ----------
const RANKS=[[0,'Tımarlı'],[1000,'Subaşı'],[2500,'Sancakbeyi'],[4000,'Beylerbeyi'],[6000,'Vezir-i Âzam'],[8000,'Cihangir']];
function scoreRaw(S){const st=S.stats,win=S.over==='win',cap=SIZES[S.cfg.size].speedCap;
 return (win?VICTORY[S.winBy].Z:0)+40*st.maxRegions+25*techCount()+10*(st.atkWon+.5*st.defWon)+100*st.capsTaken+(win?Math.max(0,cap-S.turn)*12:0)}
function scoreMult(c){return DIFFS[c.diff].mp*c.mutX*({kita:1,vadi:1,dag:1.1,korfez:1.05})[c.map]*(c.dyn==='klasik'?.9:1)}
function mpGain(S){if(S.turn<15)return 0;const c=S.cfg;
 const f=c.ferman?(S.winBy===c.ferman?(S.fermanChanged?1.10:1.25):1):1;
 return Math.round((8+scoreRaw(S)/120+(S.over==='win'?15:0))*DIFFS[c.diff].mp*c.mutX*f*(c.rematch?.5:1)*(c.daily&&!c.dailyCounted?.25:1))}

// ---------- META (localStorage 'fetih-meta-v1') ----------
const META_KEY='fetih-meta-v1';
const META_DEFAULT={v:1,mp:0,mpTotal:0,games:0,wins:0,
 unlocked:{dyn:['klasik','boru','tunc','kartal'],mut:['kitlik','erken','kabile','sur','parali','altincag','bereket'],
  map:['kita'],size:['kisa','orta'],diff:['cirak','kalfa'],bonus:[],cos:[]},
 equipped:{bonus:[],banner:null,color:null},
 ach:{},                     // {id: 'YYYY-MM-DD'}
 stats:{byDyn:{},            // {boru:{g:3,w:2,best:5240,mastery:2}}
  byPath:{fetih:0,medeniyet:0,hegemonya:0},byDiff:{},bestScore:0,fastestWin:null,
  totalLoot:0,capsTaken:0,maxHarbors:0,maxLootGame:0},
 daily:{last:null,streak:0,best:0,seals:0,hist:{}},
 history:[],                 // son 20: {date,cfg,seed,over,winBy,turn,score,rank,mp}
 lastCfg:null,seenHelp:false};

// ---------- OYUN DURUMU EKLERİ (S) ----------
// S.cfg   = {dyn,muts:[],mutX,map,size,diff,ferman,fund,grace,ais:[..],daily:false,rematch:false,code}
// S.ai    = {1:{dyn,per,name,ruler,focus,focusT,truce:0,vassal:false,needMod:[[add,until]]}, ...}
// S.rs    = RNG durumu (uint32)          S.evNext, S.evPending, S.evSeen:{id:turn}, S.buffs:[{k,v,until}]
// S.coal  = {on:false,until:0,members:[],cd:0}
// S.wonder= {stage:0,turnsLeft:0}        S.aiWonder={f:null,stage:0,next:0}
// S.heg   = {caps:{1:idx,2:idx,..},held:0,count:0}   S.cd={akin:0,harac:0,yagma:0}
// S.hist  = [[turn,regions,troops,grossSum]]   (her tur 1 satır, 150'de seyrekleştir)
// S.stats = {maxRegions,atkWon,atkLost,defWon,defLost,capsTaken,capLost,loot,famine,famineStreak,plagues,
//            surBuilt,recruited:{piy,okc,suv,kus,yen},coalBroken,bestBattle:{t,r,sent,kill,lost},worstLoss:{t,r,lost},
//            bestLoot:{t,r,v},events:0,choices:0}
// S.metaDone=false
```

---

## Koda Entegrasyon Notları

**E1. `mil()` → sonuç birleştirme ve önbellek.** `mil()` bugün `S.tech`'ten saf bir nesne üretiyor ve `fieldOut`, `defParts`, `vis` gibi sık çağrılan yerlerde kullanılıyor. Yeni hali:
```js
function mil(){const key=S._mk;if(MILC&&MILC.k===key)return MILC.v;const M=baseMil(S.tech);applyMods(M,modsOf(S.cfg));return (MILC={k:key,v:M}).v}
// S._mk: research(), etkin buff ekleme/bitişinde ++ ; newGame/load'da 0
```
`applyMods` alanları: `atk += atkAdd`, `equip += equipAdd`, `def += defAdd`, `fortPer += fortPer`, `maxFort += maxFortAdd`, `surDisc *= surCostMult`, `maxField += maxFieldAdd`, `growth *= growth`, `sight += sightAdd`, `loot += lootAdd`. Yeni alanlar: `iron`, `suvAtk`, `unitDef`, `fieldMultBy`, `unitGoldMult`, `upGold`, `upTahil`, `lootCap`, `conqMorale`, `conqPop`, `yenMil`, `tcost`. `IRON`, `GRACE`, `FUND`, `AIS` **global sabitleri `S.cfg` okuyan fonksiyonlara dönüşür:** `iron()`, `grace()`, `S.cfg.fund`, `S.cfg.ais`. `GRACE` şu yerlerde kullanılıyor: `aiTurn` (`S.turn<GRACE`), `endTurn` mesajı, `finishSetup` log'u, `showHelp`. `AIS` `endTurn` ve `checkEnd` içinde kullanılıyor. Buff'lar (olay etkileri) `S.buffs` üzerinden aynı `applyMods`'a girer.

**E2. Birlik ve ekonomi kancaları.**
- `uAtk`: `UNITS[k].atk × (k==='suv'?M.suvAtk:1)`.
- `rawDef`: `M.unitDef[k] ?? UNITS[k].def`, yalnız oyuncu için. AI aiPerk için `defParts` içinde.
- `unitCost`: altın × `unitGoldMult`, `unitCostAdd` ekle.
- `economy()`: `up.tahil = uw·0,15·upkeep·upTahil`, `up.altin = uw·(upGoldRate ?? 0,10)·upkeep·upGold`.
- `fieldOut`: × `fieldMultBy[f.t]` × `fieldMultAll`.
- `prodParts`: TER/FEAT verimi `featY` override, `resMult`.
- `lootRate`: `clamp(.3+.3fr+M.loot, .25, M.lootCap ?? .75)`.
- `conquer`: `r.pop *= M.conqPop ?? .7`. `resolve` içinde moral +5 → `M.conqMorale ?? 5`.
- Yeniçeri kademesi: `UNITS.yen.mil` yerine `unitMil(k)`. `canRecruit`, `autoType`, `recruit` içinde.
- `research`: `TCOST[k] × M.tcost`, yuvarlanır. `S._mk++`.

**E3. `genMap(seed, P)`.** Sabitler parametreye çevrilir:
- `80 → P.sites`, `98 → P.minD`, `LAND → P.LAND`
- landV formülündeki `.47/.45/.6 → P.ell/P.noise` (+ `P.lake` terimi)
- `n*.15 → n*P.ridge`
- `nDag/nTepe → P.dag/P.tepe`
- `rest.length*.38/.58 → P.orman / P.orman+P.vadi`
- `Math.min(5,…) → P.maden`
- `rivers.length<6 → P.rivers`, `170 → P.rivGap`
- `list.length/3 → list.length*P.bridge`
- `clamp(gc.length,3,8) → clamp(gc.length,P.gecit[0],P.gecit[1])`, `put(...)` sayıları `P.feat`'ten

**Kabul:** `genMap(s, MAPTYPES.kita+SIZES.orta)` 20 test tohumunda bugünkü `genMap(s)` ile aynı `n`, `ids` özeti ve `regions[].terrain/feat` üretir. `rng()` çağrı sırası **değişmemeli**: yeni parametreler yeni `rng()` çağrısı eklememeli, `lake` için ek gürültü gerekirse en sona `makeNoise` eklenmeli. Haritanın değiştirdiği başkent adayı (`cand`) `newGame` içinde `P.cap`'ten okunur.

**E4. `newGame(seed, cfg)`.** Sıra:
1. `cfg` normalize edilir: yasaklı çift kontrolü, `mutX = clamp(Π x, .8, 2)`, `fund`, `grace`, `ais`.
2. `MAP = genMap(seed, P)`.
3. Rakiplere hanedan/kişilik/ad dağıtılır, `rng` ile ve harita çağrılarından **sonra**.
4. Oyuncu başlangıcı `DYNASTIES[d].start` + mutatör `start` (Sürgün Bey) + başlangıç bonusu ile kurulur. Bugünkü sabit `{piy:15}`, `r.mil=1`, `r.fort=1` yerine bu değerler kullanılır. Rakipler `{piy:14,okc:4}` alır, `kartal` aiPerk'te sur 2.
5. Kabile garnizonu `t × DIFFS.neutral × cfg.neutralBase` (`Math.min(28,…)` tavanı da aynı çarpanla).
6. `S.stats`, `S.hist`, `S.rs = seed ^ 0x85ebca6b` başlatılır.

`startNew()` sihirbazı açar. `newGame` doğrudan çağrılmaz.

**E5. `aiTurn(f, ev)`.** Başta `const P = AIPERS[S.ai[f].per], D = DIFFS[S.cfg.diff]`.
- `gain × P.gain × D.aiGain × cfg.aiGain` (+ `gainPerFeat`). `half` yerine `capShare`, `stack` ile `focus`.
- `aiMix(n)` → `aiMix(n, P.mix, perk)`. Tur eşikleri korunur, ağırlıklar kişilikten gelir.
- Sur: `rnd() < P.fort[0] && fort < P.fort[1]`.
- `r.ready < 4` → `P.minReady`. `fl(r.ready*.2)` → `P.reserve`.
- `need = (owner===0 ? P.needP : P.need) + D.needAdd + coalAdj + needMod(f) + (zayıf hedef ? P.needWeak − P.need : 0)`.
- `GRACE` → `grace()`. Ateşkes/vasal: `t.owner===0 && (truce(f) || S.ai[f].vassal)` ise atla.
- Skor bonusları `P.score` + Külliye/Hegemonya hedeflemesi (§7).
- `Math.random` → `rnd()`.
- Savunmacı karşı saldırısı: `resolve` sonucunda `S.ai[f].hitBy = from` işaretlenir, sonraki AI turunda önce o hedef denenir.
- Koalisyon `endTurn` içinde, AI döngüsünden **önce** güncellenir. `coalNoInfight` iken AI → AI hedefleri atlanır.
- `aiB()` → `Math.min(D.aiBCap, D.aiBStep·perk·fl(S.turn/4))`. Bugünkü çağrı `aiB()` faction bilmiyor, bu yüzden `aiB(f)` yapılır (`atkParts` ve `defParts` içinde `o` / `r.owner` geçirilir).

**E6. `endTurn()` kancaları** (sıra önemli):
1. Ekonomi ve kıtlık (mevcut). `S.stats.famine++` ve `famineStreak`.
2. Oto üretim (mevcut). `stats.recruited` sayılır.
3. Moral (mevcut + `gecitMorale`).
4. **`updateCoalition()`**.
5. `for f of S.cfg.ais: aiTurn(f, ev)`.
6. Kabile büyümesi: `S.turn % cfg.neutralEvery`, tavan `base × neutralCap`.
7. **Vasal haracı ve isyan kontrolü**, **Külliye aşama sayacı**, **AI Eser Yarışı**, **Hegemonya sayacı**.
8. `S.turn++`, `rd` yenileme (mevcut), `cd` ve `buffs` süre düşümü, `S._mk++`.
9. **`S.hist.push([...])`, `S.stats.maxRegions`**.
10. **`rollEvent(ev)`**: `S.turn >= S.evNext` ise seçimsiz olaylar `ev`'e yazılır, seçimli olay `S.evPending` olur.
11. `checkEnd()`. Rapor modalının "Tamam" düğmesi `S.evPending` varsa `showEvent()` açar. `S.evPending` kayda yazıldığı için `load()` sonrası da açılır.

**E7. Belirlenimci RNG.** `function rnd(){let t=(S.rs=(S.rs+0x6D2B79F5)|0);t=Math.imul(t^t>>>15,1|t);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}` (mulberry32'nin durumunu `S.rs`'de tutan hali). `resolve`, `aiMix`, `aiTurn`, olaylar ve yağma `Math.random` yerine bunu kullanır. Saldırı önizlemesi (`odds`) RNG tüketmez, böyle kalmalı. UI kaynaklı rastgelelik (efekt vb.) `Math.random`'da kalır. **Not:** paralel çalışan test altyapısı işi de `Math.random`'a dokunuyor olabilir. Bu değişiklik onunla uzlaştırılmalı: test tarafı `rnd`'yi enjekte edilebilir yapsın.

**E8. `checkEnd()` / `afterModal()`.** `checkEnd`:
```js
if(!mine) over='lose';
else if(!S.cfg.ais.some(f=>c[f]&&!S.ai[f].vassal) || mine>=Math.ceil(MAP.playN*SIZES[S.cfg.size].conqPct)){over='win';winBy='fetih'}
else if(techCount()>=18 && S.wonder.stage>=5 && capIdx()!=null){over='win';winBy='medeniyet'}
else if(S.heg.count>=VICTORY.hegemonya.hold){over='win';winBy='hegemonya'}
```
Not: Vasal rakip "yok edilmiş" sayılmaz ama Fetih için kalan rakip listesinden düşer. Yani bütün rakipleri yıkıp ya da vasal yapınca Fetih kazanılır, bu tasarım gereği bilinçli bir kesişimdir. `afterModal()` → `showEndScreen()`: skor, rütbe, grafik (`S.hist` canvas'a 600×160 çizgi), en iyi savaş/kayıp (`S.stats`), teşhis maddeleri, `commitMeta()` (`if(!S.metaDone)`: MP, başarımlar, `byDyn/byPath`, kilit koşulları (`harborsHeld`, `lootOneGame`, `winOn`), `history`, günlük; sonra `S.metaDone = true; save()`).

**E9. Kayıt/yükleme ve göç.**
- `SAVE = 'fetih-save-v5'`. `load()` önce v5'i, yoksa `fetih-save-v4`'ü dener. v4 göçü:
  - `cfg = {dyn:'klasik', muts:[], mutX:1, map:'kita', size:'orta', diff:'cirak', ferman:null, fund:260, grace:12, ais:[1,2,3,4]}`
  - `ai = her f için {per:'firsatci'(Çırak davranışına en yakın), dyn:null, name:FAC[f].ad}`. **Ama** `cirak` + `klasik` iken `aiTurn` bugünkü sabitleri kullanmalı: kişilik etkisizleştirilir, `per:'klasik'` = need 1,3 / 1,5, reserve 0,2, minReady 4 ve bugünkü `aiMix`.
  - `rs = seed ^ turn`
  - `stats` sıfır (`maxRegions = own().length`), `hist = []`, `wonder = {stage:0}`, `heg` (orijinal başkentler bilinmiyor: o anki `capital`'ler), `metaDone = !!S.over`, `evNext = turn + 6`
- `load()` içinde `MAP = genMap(s.seed)` → `genMap(s.seed, paramsOf(s.cfg))`. `MAP.n !== s.regions.length` kontrolü kalır.
- Meta ayrı anahtardadır, oyun kaydı silinince (Yeni Oyun) meta korunur. `askNew()` metni "Mevcut oyunun silinir (miras puanların korunur)" olur.
- Günlük oyun `fetih-daily-save-v1` anahtarına yazılır. `save()` `S.cfg.daily`'ye göre anahtar seçer.

**E10. UI.**
- `FAC[f].ad` kullanılan yerler → `facName(f)` (`S.ai[f]?.name ?? FAC[f].ad`). Bunlar `conquer`, `aiTurn` ev mesajları, `openAttack`, panel ve harita etiketleri.
- Üst çubuğa üç zafer yolu ikonu + yüzde eklenir.
- Ekonomi panelinde aktif kartlar/buff'lar listelenir.
- Bölge panelinde yetenek düğmeleri (Akın göstergesi, Yağma, Haraç Diplomasisi; bekleme süreleriyle).
- Kayıt sekmesine "Miras" alt sekmesi: MP, açılımlar, başarımlar ızgarası.

---

## Denge ve Ölçüm Planı

**Araç:** Test altyapısındaki başsız bot (oyuncu botu + `endTurn` döngüsü, DOM'suz). Gereken ekler:
1. `newGame(seed, cfg)` parametresi.
2. `rnd()` enjekte edilebilir.
3. Bot, olaylarda varsayılan (ilk) seçeneği alır. Bir varyantı ise "açgözlü" seçer (MP/kaynak değeri en yüksek seçenek).
4. Bot için 3 yol politikası: `fetih` (bugünkü bot), `medeniyet` (medrese + Loncalar öncelik, 10 bölgede dur, Külliye), `hegemonya` (en yakın 3 orijinal başkente yığınak, biat teklifini kabul et).
5. Her oyun için çıktı: `{cfg, seed, over, winBy, turn, t25 (ilk %25 bölge turu), maxRegions, famine, coalitions, capLost, mp, score}` (JSONL).

**Matris ve örneklem** (oyun başına ~0,3-1 sn, toplam ~15-25 dk):

| Deney | Hücre | Oyun/hücre | Toplam |
|---|---|---|---|
| D0 Taban | Klasik+Çırak+Kıta (bugünkü %80 tekrarlanmalı, ±4) | 200 | 200 |
| D1 Hanedan × Zorluk | 6 × 4 | 60 | 1440 |
| D2 Tekil kart | 14 kart × Kalfa × Klasik | 60 | 840 |
| D3 Riskli çiftler | aşağıdaki 10 kombinasyon × Kalfa | 80 | 800 |
| D4 Harita × Boy | 4 × 3, Kalfa, Klasik | 60 | 720 |
| D5 Yol politikası | 3 politika × 6 hanedan, Kalfa | 60 | 1080 |
| D6 Kişilik | 4 kişilik dağılımının sabitlenmesi (4 aynı kişilik) × Kalfa | 60 | 240 |

**Kabul eşikleri** (Kalfa, Orta):
- Her hanedan %42-58. Her hanedan × tekil kart %35-65. Her riskli çift %30-70; dışındaysa yasaklı listeye ya da çarpan düzeltmesi.
- Medyan tur 50-70. `t25` medyanı ≤ 30 ve 90. yüzdelik ≤ 50 (bugün 25-85: üst uç kısalmalı).
- Zafer yolları dağılımı §7 hedefi (politika karışık botla).
- Kart miras çarpanı ile bot kazanma kaybı uyumlu: `x ≈ 1 + 1,2·(Δkazanma)` (ör. −%20 kazanma → ×1,24). Sapma > 0,1 ise `x` güncellenir.
- Koalisyon oyunların %50-75'inde kurulmalı. Kurulan koalisyonların sonrasında oyuncu kazanma oranı %35'in altına düşmemeli.
- Kıtlık turu medyanı ≤ 3 (Kıtlık Çağı hariç).

**Riskli kombinasyonlar (D3):**
1. **Börü + Kıta/Vadi + Kanlı Toprak:** ovada etkin süvari saldırısı 2,65, kayıp üssü ganimeti büyütür. Kartopu %70'i geçebilir.
2. **Dağ Kartalları + Sağlam Surlar + Medeniyet politikası:** kaplumbağa. Sur 4-5 × 0,30 + 0,15 savunma ile AI hiç kırılamaz. Külliye hedeflemesi bunu kırmalı. Kırmıyorsa Kartal'ın `defAdd`'i 0,15 → 0,10.
3. **Akıncı + Kabile Seli:** daha fazla kabile = daha fazla ganimet. Ya çok güçlü ya erken çöküş (Sv.1 tesis). Varyans ölçülmeli.
4. **Deniz Beyleri + Körfez:** 10 Liman × 4 altın = +40 altın/tur. Pazar ×1,3 ile ekonomi patlar. Liman altını 4 → 3'e düşmeye aday.
5. **Bilge + Kuyruklu Yıldız + Medeniyet:** 18 tek. ~40. turda gelebilir. Eser Yarışı (AI 30. turda başlar, 75. turda biter) yetişmezse Medeniyet ≤ 50 tur.
6. **Erken Savaş + Usta/Destan:** 5. turda Saldırgan AI yığınağı (GRACE−3'ten önce yığınak başlamaz, önce düzeltilmeli: `preStack = min(3, grace−2)`).
7. **Kutsal İttifak + Kısa harita:** %22 eşiği 34 bölgede 8 bölge. Koalisyon neredeyse oyun başında kurulur.
8. **Sürgün Bey + Tunç:** FUND 420 − 150 hediye ayarı. Sürgün'ün `fund` değeri hanedan fund'ını ezmeli mi, toplamalı mı? Öneri: `max`.
9. **Sisli Harita + Hegemonya politikası:** orijinal başkentleri görmeden yığınak. Başkent konumları her zaman görünür olmalı (★ simgesi sisin üstünde).
10. **Paralı Askerler + Akıncı:** ucuz birlik + yüksek ganimet = altın döngüsü. Altın maaşı 0,15 bunu dengelemeli.

**Oyuncu tarafı ölçümü (botsuz):** META'ya isteğe bağlı yerel istatistik: oyun süresi (gerçek dakika), pes etme turu, "Aynı kurallar" ve "Yeni kurallar" tıklama oranı. "Bir oyun daha" metriği: bitiş ekranından 60 sn içinde yeni oyun başlatma oranı (hedef > %50).

---

## Uygulama Sırası

### 1a: Hanedan + kartlar + harita türü + zorluk + yeni oyun ekranı
İşler: `S.cfg`, `DYNASTIES/MUTATORS/MAPTYPES/SIZES/DIFFS` tabloları, `mil()` birleştirme + önbellek (E1-E2), `genMap(seed,P)` (E3), `newGame(seed,cfg)` (E4), `aiTurn` içinde yalnız `DIFFS` çarpanları (kişilik yok), GRACE/AIS/IRON/FUND'ın cfg'ye taşınması, sihirbaz (§12, adım 0-4), v4 → v5 kayıt göçü (E9), 3 aktif yetenek (Akın, Yağma, Haraç Diplomasisi). Kilitler 1a'da hep açık (meta 1c'de gelir).
**Kabul ölçütleri:**
- Klasik+Çırak+Kıta+Orta ile 20 tohumda harita bugünküyle aynı. D0 bot kazanma %80 ± 4, medyan tur bugünküyle ± 3.
- Eski v4 kaydı yüklenir, oynanır, kaydedilir, hata vermez.
- D1 (zorluk) Kalfa %50 ± 8, Usta %30 ± 8. D2'de hiçbir tekil kart Kalfa'da < %30 ya da > %70 değil.
- 4 harita türünün her biri 50 tohumda geçerli harita üretiyor (bağlantılı, ≥ 5 başkent adayı, playN hedef ± %15). Körfez'de halka kopması %0.
- Hızlı Başla'dan ilk tura ≤ 2 tık. Sihirbaz telefon genişliğinde (360 px) kaydırmadan kullanılabilir.

### 1b: AI kişilikleri + olaylar + alternatif zaferler
İşler: `AIPERS`, rakip hanedan/ad atama, yığınak/odak, koalisyon, ateşkes/vasal, `rnd()` (E7), `EVENTS` + `rollEvent` + olay modalı + `S.buffs`, Külliye (bölge panelinde inşa), Hegemonya sayacı, AI Eser Yarışı, `checkEnd` genişlemesi (E8, son ekran şimdilik eski modal + "zafer türü" satırı), üst çubukta yol göstergeleri, `S.stats`/`S.hist` sayaçları (1c için şimdiden).
**Kabul ölçütleri:**
- Aynı `seed` + `cfg` + aynı oyuncu eylemleri → aynı sonuç (belirlenimcilik testi: bot oyunu 2 kez koşulup JSONL birebir aynı).
- D6: her kişilik saldırı sıklığı ayırt edilebilir (saldırgan/savunmacı AI saldırı sayısı oranı ≥ 2,5). Savunmacı AI'nin bölge kaybı saldırgana göre ≥ %30 az.
- 75 turluk oyunda olay sayısı 9-12. Seçimli olay oranı ≥ %60. Hiçbir olay bir oyunda 2'den fazla çıkmıyor (Veba kartı hariç).
- D5: her yol politikası kendi yolundan %30-60 kazanıyor. Karışık botta zafer yolları dağılımı §7 hedefinde.
- `t25` 90. yüzdelik ≤ 50 tur. Koalisyon kurulma oranı %50-75.
- Olay modalı açıkken yenileme yapılınca olay yeniden gösteriliyor ve çift uygulanmıyor.

### 1c: Oyun sonu ekranı + miras + günlük + başarımlar
İşler: `showEndScreen` (§8, grafik, teşhis, paylaşım metni, tohum kodu kodlama/çözme), `META` + `commitMeta` + kilitlerin devreye girmesi, başlangıç bonusları, kilit kartları sihirbazda, günlük meydan okuma (§10, ayrı kayıt anahtarı, seri, mühür), `ACHIEVEMENTS` değerlendirmesi, Kayıt → Miras sekmesi, kozmetik (sancak motifleri).
**Kabul ölçütleri:**
- Oyun sonu MP bir kez yazılıyor (bitişte sayfa yenile → MP değişmiyor).
- Tohum kodu kopyala → başka tarayıcıda yapıştır → aynı harita ve kurallar. Günlük kod iki cihazda aynı hanedan/kart/harita veriyor.
- Örnek oyuncu eğrisi simülasyonu (bot, §9.3 ayarlarıyla 10 oyun × 30 tekrar): 10. oyunda medyan açılmış hanedan 5-6, harita 3-4. İlk açılım ≤ 2 oyunda.
- Günlük seri: tarih değişimi, kaçırılan gün, mühür kullanımı birim testleri (saat dilimi olarak yerel tarih).
- 28 başarımın her biri için koşul birim testi (sahte `S` + `META` ile). Çırak'ta yalnız izinli 8'i açılıyor.
- Bitiş ekranında her zaman en az 1 "sıradaki hedef" satırı var (ilerleme, kilit ya da günlük).
- `localStorage` erişilemezken (gizli mod) oyun çalışıyor, meta yalnız oturumluk kalıyor ve kullanıcıya bir kez uyarı gösteriliyor.
