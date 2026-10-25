# Fetih testleri

Bot simülasyonu, oyunu (`../index.html?test=1`) gizli bir iframe'de yükler ve oyunun kendi global fonksiyonlarıyla (newGame, research, recruit, resolve, endTurn…) oynar. `?test=1` kipinde oyun açılış yüklemesini atlar ve localStorage'a hiç dokunmaz; gerçek kaydın bozulmaz.

## Çalıştırma

```sh
cd /Users/osman/fetih && python3 -m http.server 8123
```

Tarayıcıda: <http://localhost:8123/tests/index.html> → **Çalıştır**. `?auto` eklersen sayfa açılınca kendiliğinden başlar.

Konsoldan ya da `javascript_tool` ile:

```js
const r = await runSim({seeds:[11,22,33,44], difficulty:'kalfa', dynasty:'boru', cards:['erken']});
r.summary          // kazanma oranı, ortalama tur, koalisyonlu oyun, hata sayısı, randLeak…
window.SIM_RESULT  // son çalıştırmanın tamamı
await checkMaps()  // Klasik/Kıta/Normal haritaları ve başlangıç durumu Faz 0 ile aynı mı (map-hashes.json)
simJob('ad', [{difficulty:'kalfa'}, {difficulty:'usta'}])  // uzun ölçüm: arka planda koşar, JOBS.ad'da birikir
await runSim({difficulty:'kalfa', goal:'hegemonya', seeds:[1,2,3]})  // zafer yolu botu
await metaRun('m',10) // 1c: §9.3 planıyla 10 oyunluk miras ilerlemesi × tekrar, JOBS.m'de
await evUnit(7)    // olay birim testi: 18 olay + Biat Teklifi, her seçenek ayrı kopyada, 3 yıl oynanır; [{id,cond,opt,m,bad,err}]
```

## Seçenekler

| Ad | Varsayılan | Açıklama |
|---|---|---|
| `seeds` | 12 tohum | Harita tohumları |
| `maxTurns` | 240 | Tohum başına azami tur (0.9.1'den beri Fetih = bütün bölgeler; Uzun boyda 280 öner) |
| `dynasty` | `klasik` | Hanedan: `klasik`, `boru`, `tunc`, `kartal`, `bilge`, `deniz`, `akinci` |
| `cards` | `[]` | Kural kartları (en fazla 2): `kitlik`, `erken`, `kabile`, `sur`, `parali`, `altincag`, `bereket`, `demirsiz`, `veba`, `sis`, `kanli`, `baris`, `ittifak`, `surgun` |
| `mapType` | `kita` | Harita türü: `kita`, `vadi`, `dag`, `korfez` |
| `difficulty` | `cirak` | Zorluk: `cirak`, `kalfa`, `usta`, `destan` |
| `size` | `orta` | Oyun boyu: `kisa`, `orta` (Normal), `uzun` |
| `fast` | `true` | `refresh()` yalnızca görüşü günceller (çizim/panel atlanır). Oyun mantığını değiştirmez. |
| `slice` | 8 | Kaç turda bir tarayıcıya nefes aldırılacağı. `0`: turlar arasında hiç bekleme yok, tohumlar arasında MessageChannel ile nefes (gizli sekmede hızlı) |
| `seedRandom` | `true` | Yalnızca **eski** sürümler (oyunda `rnd()` yoksa, ör. `src:'_eski/index.html?test=1'`) için `Math.random`'ı tohumla sabitler |
| `bot` | bkz. `SIM_DEFAULTS.bot` | Bot eşikleri (`atkCh:.75`, 0.9.1 son aşama: `endAt:.75` (toprak payı ya da yaşayan rakip kalmayınca), `endCh:.6` (son aşamada saldırı eşiği), `endMove:true` (boştaki asker kalan bölgelere BFS ile kayar, önce başkentler, başka düşman komşusu varsa %30 garnizon kalır, vasal/dağ komşusu cephe sayılmaz; `false` + `endCh:.75` eski bot), `upTahil:80`, `okcP:.3`…). 1b: `evPick` (`'first'` ilk seçilebilir seçenek, `'random'` bot üreteciyle), `turtle:true` (Medeniyet botu 12 bölgede saldırıyı keser) |
| `goal` | `fetih` | Bot politikası: `fetih` (eski bot), `medeniyet` (Büyük Eser için taş/odun/bilgi ayırır, altın eksikse otomatik üretimi durdurur, 18 teknolojiden sonra bilgiyi esere saklar), `hegemonya` (tutulmayan eski başkentlere doğru saldırır ve asker kaydırır, tuttuğu başkentlerde sur kurar, geri sayımda oraya yığar) |
| `ferman` | `false` | `true`: `goal` ferman olarak beyan edilir |
| `pers` | — | Bütün rakiplere tek kişilik (`saldirgan`, `tuccar`, `savunmaci`, `firsatci`) |
| `ev` / `alt` | `true` | `false`: olaylar / alternatif zaferler (vasal, eser yarışı dahil) kapalı. İkisi kapalıyken Klasik/Çırak satırları `baseline-v2.json` ile birebir aynıdır |
| `meta` | `false` | 1c: satıra `meta` eklenir: skor, ham skor, MP (`mpCalc`, oturmuş oyuncu; `mpNew`: ilk 2 oyun), en yüksek bölge oranı, ilk "Zaferi ilan et" anı ve o anki skor (`dec`), başarım sayaçları. Kapalıyken satırlar eski taban çizgileriyle birebir aynı kalır |
| `declare` | `false` | `meta` ile: bot ilk fırsatta zaferi ilan eder |
| `altChoice` | — | 0.9.2 zafer kararı (Medeniyet/Hegemonya koşulu sağlanınca çıkan pencere, `S.altQ`): `'devam'` (fetihe devam, kilometre taşı `S.altM`) ya da `'bitir'` (zaferi al). Boşsa `goal:'fetih'` → `'devam'`, `medeniyet`/`hegemonya` → `'bitir'`. Bekleyen karar olay gibi tur sonunda otomatik çözülür. Satırda `alt` ([{p,t,k}]) ve `mile` (kilometre taşı yolları), özette `altGames`, `altN`, `altBy`, `mileWin` |
| `cfgExtra` | — | Oyun ayarına ek alanlar (ör. `{daily:'2026-10-19'}`, `{bonus:['hazine']}`) |
| `bot.profile` | `'ref'` | `'usta'`: insan vekili bot (`usta-bot.js`, aşağıda); `bot.usta` ile parametreleri |
| `tel` | `false` | `true`: satıra telemetri (`tel`) eklenir (iki bot için; satırların geri kalanı birebir aynı kalır) |

Varsayılan ayar (Klasik + kart yok + Kıta + Normal + Çırak) Faz 0 oyunudur.

## Bot profilleri: `ref` ve `usta`

`bot.profile` hangi botun oynayacağını seçer. Varsayılan `'ref'` (`sim.js` içindeki bot2): bütün taban çizgileri bu botla alınmıştır ve değişmez (`baseline-v6.json` 12 tohum birebir). `'usta'`: deneyimli insan oyuncunun vekili (`docs/faz2-derinlik.md` §B.3.1 "B2"), `usta-bot.js` dosyasında; `sim.js` dosyayı ilk kullanımda oyunun iframe'inde `eval` eder.

```js
await runSim({difficulty:'kalfa', bot:{profile:'usta'}})                      // usta bot
await runSim({difficulty:'destan', bot:{profile:'usta', usta:{atk:{r:1.5}, planR:1.4}}})  // parametreyle
await runSim({difficulty:'kalfa', tel:true})                                  // telemetri (iki botta da)
simJob('u', [{difficulty:'usta', bot:{profile:'usta'}}, {difficulty:'destan', bot:{profile:'usta'}}])
```

Usta bot yalnız oyuncunun arayüzde yapabildiklerini yapar (hazır askeri komşuya ya da Yol Ağı ile taşımak, komşudan saldırı, tesis/kuruluş/sur, alım, araştırma, otomatik üretimi aç/kapa, olay seçimi) ve oyuncunun gördüğünü kullanır: düşman sayısı ~5'e yuvarlı tahmindir (Casusluk ile kesin) ve tahmine +2,5 asker hata payı eklenir, rakip kişiliği Haritacılık'la bilinir. Kendi rastgeleliği yoktur, `Math.random` çağırmaz (`randLeak` 0); oyunun `rnd()` akışına yalnız oyunun kendi eylemleri dokunur. Bot hızlıdır (karar modülleri oyun başına ~40 ms; süre oyunun `endTurn`/AI'sinde geçer); `fast:true` ve `slice:0` ile başsız koşulur.

**Karar modülleri** (`USTA_BOT.order`, her tur bu sırayla; her biri `USTA_BOT.mods[ad](T,P,st)`):

| Modül | Ne yapar |
|---|---|
| `arastirma` | Katı araştırma sırası (`P.tech`, ör. `str1, ure1, sal1, eko1, …`); komşuda ≥2 surlu hedef varsa Kuşatma I-II öne alınır |
| `savunma` | Her bölge için gereken ham savunma = komşu rakip bölgelerinin olası saldırı gücü / rakibin eşiği × güvenlik payı (başkent 1,5). Barış/ateşkes bitimine `look` tur kala sayılır; Fırsatçı'nın "savaş görmüş bölge" eşiği hesaba katılır. Açığı komşudan (Yol Ağı'yla her yerden) kapatır |
| `saldiri` | Bütün (kaynak, hedef) çiftleri: gönderilebilir kuvvet = hazır asker − kaynakta kalması gereken savunma; eşik orana göre (küçük hedef 1,15, normal 1,3, başkent/geçit/kale/sur≥2 1,5; son aşamada kabileye 1,1), şans ≥ %80; fethedilen bölgeyi tutamayacaksa (sağ kalanlar / fetih sonrası tehdit < `holdMin`) saldırmaz. En değerli tek saldırı yapılır, sonra yeniden değerlendirilir (Akın dahil) |
| `yiginak` | Kapanmayan açıklar talep olur; her hedef için en iyi yığınak bölgesi seçilir ve kuvvet oraya toplanır (birleşik saldırı: bir sonraki tur toplam kuvvetle); yetişmeyen en değerli hedef uzun vadeli yığınak olur. Boştaki asker açığa > uzun yığınağa > rakip cephesine akar (kabile cephesinde atıl kalmaz) |
| `askerSav` | Önce açık olan / açığa yakın bölgelerde alım (okçu varsa okçu): alınan asker aynı tur savunur |
| `kurulus` | Açık bölgesine Karakol/Kışla, başkent en yüksek kademeye (`capTier`), yığınak merkezleri `hubTier`'a, cepheye yakın nüfuslu bölgelere Karakol. Altın yetmiyorsa ama diğer bedel hazırsa **biriktirme hedefi** konur (alım ve otomatik üretim bekler) |
| `sur` | Açık kalan bölgede, tehdit altındaki başkentte; taş atılsa daha cömert |
| `ekonomi` | Tesis kur/yükselt: geri ödeme = bedelin değeri / ek üretimin değeri; kaynak değeri dinamik (`vRes`: stok rahat düzeyin üstünde → atıl, değer düşer; darboğaz → yükselir), yeni tesise yuva fırsat maliyeti; ufuk `H=max(Hmin,H0−tur·Hdec)` |
| `asker` | Kalan altınla alım: yığınakta ova/vadi hedefi + Talimhane → süvari, surlu hedefe birkaç kuşatma, bol altın + Harbiye → yeniçeri, diğer piyade; nüfus payı (`popKeepF/N`) ve tahıl bakımı korunur. Otomatik üretim yalnız bütçe yetiyorsa açık |

Tur sonunda: olay ikilemleri değer tahminiyle (`h.evPick`; ör. Kabile Biatı kabul, Hizip'te altın varsa ödül, İsyan'da garnizon yetiyorsa bastır; Biat Teklifi yalnız kalan bölgelere erişimi kesmiyorsa kabul) ve zafer kararı `'devam'`.

**Genişletme:** yeni bir mekanik için yeni modül yazılır ve sıraya eklenir; ortak yardımcılar `USTA_BOT.h` (`threatRaw`, `holdThreat`, `spare`, `atkEst`, `tVal`, `vRes`, `fillDef`, `mv`, `ownBfs` …):

```js
// usta-bot.js içinde ya da koşudan önce iframe'de (simFrame().eval(...)):
USTA_BOT.mods.tersane=(T,P,st)=>{ /* liman bölgesinde tersane kur, gemi al… */ };
USTA_BOT.order.splice(USTA_BOT.order.indexOf('ekonomi')+1, 0, 'tersane');
```

Parametreler `USTA_BOT.P` (koşu başına `bot:{profile:'usta', usta:{…}}` ile; `atk`, `V`, `comfort` alt nesneleri birleştirilir). Satıra `usta` alanı eklenir: saldırı/başarısız saldırı, kayıp yüzdesi, taşıma, alım, tesis/kuruluş/sur sayısı, ganimet, birlik karışımı, modül süreleri (`tm`, ms).

**Telemetri** (`tel:true`, iki bot için; yalnız okur, satırları başka türlü değiştirmez): satıra `tel` eklenir: `peak`/`peakT` (en yüksek toprak payı), `aiPeak` (en büyük rakibin en yüksek payı), `lost` / `lostAfter50` (rakibe ya da kabileye düşen bölge; %50'den sonra), `recap` (fethedilen bölgenin 3 tur içinde rakipçe geri alınması), `hazine` / `famT` (hazine boş / kıtlık turu), `idle` (tur 15-60 stok ÷ net gelir medyanı, kaynak başına), `snap` (tur 20/40/60/80: stok, net, brüt, tesis, kademe, teknoloji, moral), `ser` (5 turda bir: [tur, bölge, asker, rakip asker toplamı, en güçlü rakip askeri, en büyük rakip bölge sayısı, net altın, net tahıl, brüt toplam, altın, tahıl]).

**Ölçüm araçları:** `usta-run.mjs` (başsız Chrome'da paralel `runSim` işleri: `URL=http://localhost:8123/tests/index.html node tests/usta-run.mjs JOBS.json OUT.json 9`; iş adı `bot|zorluk|hanedan|parça`), `usta-analyze.py OUT.json ÖZET.json` (kazanma, tempo, K1-K11, kaynak eğrileri, güç serisi). Mevcut taban: `usta-bot-v0100.md` / `.json`.

## Belirlenimcilik

Faz 1a'dan beri oyun içi bütün rastgelelik (savaş zarları, rakip birlik karışımı, AI kararları, veba) kayıtta tutulan `S.rs` durumlu `rnd()` ile üretilir. Aynı tohum + aynı ayar + aynı kararlar = aynı sonuç; `Math.random` tohumlamak gerekmez. Bot kendi kararları için tohumdan türetilmiş ayrı bir üreteç kullanır. Simülasyon sırasında oyunun `Math.random` çağırması bir sızıntı sayılır ve `summary.randLeak`'te raporlanır (0 olmalı).

## Çıktı

Tohum başına: bitiş turu, sonuç (`win`/`lose`/`-`), zafer yolu (`winBy`), olay sayısı ve kimlikleri (`ev`, `evN`), koalisyon kırma (`coalBroken`), Büyük Eser aşaması (`wonder`), rakibin eser yarışı (`aiWonder`, `medClosed`), teknoloji, Hegemonya sayacının en yükseği (`hegMax`), vasal sayısı, kişilik başına rakip saldırı/kayıp (`aiS`), son bölge sayısı, %25/%50/%75 toprağa ulaşılan tur, `t100` (bütün bölgeler sende ya da vasalında), `left` (Fetih'e kalan bölge), `aisEnd` (yaşayan, vasal olmayan rakip), kıtlık sayısı, koalisyon sayısı, Akın kullanımı, tur başına eylem, hatalar.
Her turdan sonra tutarlılık denetimi yapılır: `troops === sumU(u)`, birimler negatif/NaN değil, kaynaklar ve moral sayı, nüfus ≥ 0. İhlal `invariant`, yakalanan istisna `istisna` hatası olarak yazılır.

## Taban çizgileri

- `map-hashes.json`: Faz 0 `genMap(seed)` özetleri (20 tohum) ve `initGame` sonrası bölge durumu özetleri (12 tohum). `checkMaps()` bunları karşılaştırır; Klasik/Kıta/Normal'de birebir aynı çıkmalı.
- `baseline.json`: Faz 0 öncesi oyun, 12 tohum, `Math.random` tohumlu. Faz 1a'dan sonra RNG değiştiği için satırlar artık birebir tutmaz; yalnızca tarihsel referans.
- `baseline-v2.json`: Faz 1a, Klasik + kart yok + Kıta + Normal + Çırak, 12 tohum (ve 36 tohumluk eski/yeni karşılaştırma). Oyun mantığına dokunmayan bir değişiklikten sonra `rows` birebir aynı çıkmalıdır:

```js
const r = await runSim({}), b = await fetch('baseline-v2.json').then(x=>x.json());
JSON.stringify(r.rows.map(({ms,...x})=>x)) === JSON.stringify(b.rows)
```

- `baseline-v3.json`: Faz 1b varsayılanı (Klasik + kart yok + Kıta + Normal + Çırak, olaylar açık), 12 tohum; ayrıca `eq1a` (olaylar/alternatif zaferler kapalıyken `baseline-v2` ile birebir eşitlik) ve olay birim testi özeti.
- `baseline-v4.json`: Faz 1d (0.8.1) denge değişikliğinden sonraki taban: `rows` (varsayılan ayar, olaylar açık) ve `rowsOff` (`ev:false, alt:false`). baseline-v2/v3 eşitliği 1d'den beri bilerek tutmaz; oyun mantığına dokunmayan değişiklikten sonra v4'ün iki satır kümesi birebir aynı çıkmalı. `matrix1d`: 48 tohumluk önce/sonra ölçümü.
- `matrix-1b.json`: Faz 1b denge matrisi (48/96 tohum): zorluklar, hanedanlar, kişilikler, 14 kart, zafer yolu botları, kaplumbağa, harita/boy, olay istatistikleri, kişilik ayrışması (D6).
- `matrix-1a.json`: Faz 1a denge matrisi (hanedan × Kalfa, harita türleri, tekil kartlar, zorluklar).
- `_eski/index.html`: Faz 0 oyununun değişmemiş kopyası (eşdeğerlik ve v5 kayıt göçü testleri için). `runSim({src:'_eski/index.html?test=1'})` ile eski oyun koşturulur.

- `baseline-v5.json`: 0.9.1 (Fetih zaferi = haritadaki bütün oynanabilir bölgeler sende ya da vasalında; %75 ve "bütün rakipleri yık" artık bitirmez; `maxTurns` 240 ve son aşama botu). **v4 ile eşdeğerlik bilerek bozulur** (bitiş kuralı ve bot değişti). `rows` (varsayılan ayar) ve `rowsOff` (`ev:false, alt:false`); oyun mantığına dokunmayan değişiklikten sonra ikisi birebir aynı çıkmalı. `matrix.before/after`: 48 tohumluk önce (0.9.0, eski sim, 140 tur) / sonra ölçümü; ayrıca `det`, `maps`, `evUnit`, `audioCtx` (sim'de oluşan AudioContext sayısı, 0).

- `baseline-v6.json`: 0.9.2 (Medeniyet/Hegemonya oyunu kendiliğinden bitirmez; karar penceresi, fetih botu `'devam'`). `rows` (varsayılan ayar, 12 tohum) v5'ten yalnız Hegemonya koşulunu sağlayan 3 tohumda (22, 44, 99) ayrılır; `rowsOff` (`ev:false, alt:false`) v5 ile birebir aynı. `matrix`: 48 tohum (1001-1048; yol botları 2001-2024, Kalfa) 0.9.1 → 0.9.2; `det`, `maps`, `evUnit`, `audioCtx`.

- `baseline-v7.json`: **0.12.0 (G1)**: varsayılan ayar artık `cfg.rules=2` (Divan gideri, taşra, huzursuzluk, yorgunluk, stok tavanı, rakip akçe ekonomisi ve akıllı hamleler). `rows`/`rowsOff` 12 tohum (ref bot); oyun mantığına dokunmayan değişiklikten sonra birebir aynı çıkmalı. `eqV6`: `cfgExtra:{rules:1}` (yalnız `?test=1`) ile `baseline-v6` `rows` ve `rowsOff` birebir (gerileme testi). `matrix`: ref bot önce/sonra özeti.
- `usta-bot-v0120.md` / `.json`: usta ve ref bot, 4 zorluk × 3 hanedan × 48 tohum + Kalfa Kısa/Uzun, önce (v0.11.0, `_eski/v0110.html`) / sonra.
- `_eski/v0110.html`: v0.11.0'ın dondurulmuş kopyası (G1 "önce" ölçümü; `src:'_eski/v0110.html?test=1'`).

```js
await runSim({cfgExtra:{rules:1}})          // 0.11.0 kuralları (eşdeğerlik); varsayılan rules 2
```

### G1 ölçüm araçları
- `g1-jobs.py`: varyant işleri (`'ad@zorluk=iframe yaması'`), her işe benzersiz `src` verir: yama sonraki işlere sızmaz (`usta-run.mjs` pre'yi aynı iframe'de çalıştırır).
- `g1-analyze.py OUT.json ÖZET.json`: kazanma, tempo, K1/K4, %75→%100, sıkıntı turu, rakip saldırısı ve eşgüdüm, başkent kaybı, isyan, çürüme, t20/40/60 anlık görüntüleri (net gelir, stok÷net, Divan gideri, rakip ordusu/hazine/kademe/gelir).
- Telemetri (`tel:true`) G1 alanları: `aiA` (rakip saldırıları: `n`, oyuncuya `p`, başarılı `pw`, aynı tur aynı bölgeye 2+ `coord`, başkente `cap`), `idaShare` (Divan gideri / brüt altın), `rot` (çürüyen stok), `riot`, `annex`; `snap` içinde `idare`, `cap` (tavan), `unr` (huzursuz bölge), `ai` ([bölge, asker, hazine, kademe, aiB, gelir]).
- Botlar G1'i kullanır: usta bot huzursuz bölgede garnizon ≥ G, stok tavana yaklaşınca Ambar, Fetih vasal toprağı yüzünden tıkanınca sadık vasalı ilhak eder ve rakip eşiğini dengeleyici/koalisyon hedefiyle hesaplar; ref bot yalnız tıkanınca ilhak eder (rules 1'de hiçbiri çalışmaz).

- `baseline-v8.json`: **0.13.0 (G2)**: atölyeler ve donanım (`rules 2`). `rows`/`rowsOff` 12 tohum (ref bot), `det`, `eqV6` (`rules:1` → `baseline-v6` birebir), `matrix` (ref bot önce/sonra), `checks`.
- `usta-bot-v0130.md` / `.json`: G2 önce (v0.12.0, `_eski/v0120.html`) / sonra; `eq` = `g2-analyze.py` özeti.

### G2 ölçüm araçları
- `g2-jobs.py AD [src]`: tam ölçüm işleri (4 zorluk × 3 hanedan × 48 tohum × usta/ref + Kalfa Kısa/Uzun), `usta-run.mjs` ile koşulur; özet `g1-analyze.py` ve `g2-analyze.py OUT.json ÖZET.json` (kapsama, kademe, atölye sayısı/seviyesi, Sv.3+ ve ≥2 atölye payı, demir stok÷net, rakip kademesi, birlik karışımı).
- Telemetri `snap.eq`: `cov`/`T`/`n` (kılıç, yay, zırh), `ws`, `wsLv`, `wsMax`, `wage`; `tel.milis` (kitsiz yetişen Piyade/Okçu), `tel.recPO`.
- Botlar G2'yi kullanır: usta bot `atolye` modülü (`P.ws`: kapsama hedefi, yükseltme önceliği, demir payı, `T.resv` ile kaynak ayırma), ref bot boş yuvaya atölye ve altın > 60 iken yükseltme (`rules 1`'de hiçbiri çalışmaz).

- `baseline-v9.json`: **0.14.0 (G3)**: liman, tersane, gemi, dış ticaret, balıkçılık (`rules 2`). `rows`/`rowsOff` 12 tohum (ref bot), `det`, `eqV6` (`rules:1` → `baseline-v6` birebir), `checks`.
- `usta-bot-v0140.md` / `.json`: G3 önce (v0.13.0, `_eski/v0130.html`; ana matris için `usta-bot-v0130.json` "after") / sonra; `sea` = `g3-analyze.py` özeti.

### G3 ölçüm araçları
- `g3-jobs.py AD [src] [all|sea]`: G2 matrisi + deniz bloğu (Kalfa × Körfez/Klasik, Kıta/Deniz Beyleri, Körfez/Deniz Beyleri × 48 tohum × usta/ref); hücre adı boy alanında `korfezD`/`kitaD`.
- `g3-var.py AD 'ad@zorluk,..=iframe yaması' …`: usta bot varyant işleri (Klasik/Börü/Kartal × 48), kalibrasyon için (ör. `SEA.ai.max=0` rakip limanları kapalı, `window.buildPort=function(){}` oyuncu limanı kapalı).
- `g3-analyze.py OUT.json ÖZET.json`: liman/gemi/balıkhane kuran oyun payı, t40/60/80 gemi-yük-ticaret-tavan, t50-80 ticaret ÷ brüt altın (`trShare`), tavana dayanma payı (`capHit`), batan gemi/korsan, rakip liman seviyesi.
- Telemetri `snap.sea` (`ports`, `plv`, `yard`, `ships`, `Y`, `tr`, `cap`, `raw`, `up`, `fish`, `aiPort`) ve `tel.sea` (`seaT`, `capT`, `trShare`, `shipMax`, `fishMax`, `firstShip`, `port`, `st`: yapılan/batan/korsan/kaybedilen gemi).
- Botlar G3'ü kullanır: usta bot `liman` modülü (`P.sea`: paket geri ödemesi = liman + tersane + gemi bedelinin değeri ÷ ticaret artışı − bakım; ilk adım; çok iyi pakette `T.saveSea` ile altın biriktirme; korsan riski ≥ %3 ise Kadırga; olay E19 seçimi), Balıkhane `ekonomi` modülünde tesis adayı; ref bot en çok 2 kıyı bölgesinde Liman → Tersane → Çektiri/Karamürsel, `wNew.balik` 1,2 (`rules 1`'de hiçbiri çalışmaz).

Denge değişikliğinden sonra yeni taban çizgisi kaydedilmeli.
