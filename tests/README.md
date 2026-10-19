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
| `maxTurns` | 140 | Tohum başına azami tur (Uzun boyda 180 öner) |
| `dynasty` | `klasik` | Hanedan: `klasik`, `boru`, `tunc`, `kartal`, `bilge`, `deniz`, `akinci` |
| `cards` | `[]` | Kural kartları (en fazla 2): `kitlik`, `erken`, `kabile`, `sur`, `parali`, `altincag`, `bereket`, `demirsiz`, `veba`, `sis`, `kanli`, `baris`, `ittifak`, `surgun` |
| `mapType` | `kita` | Harita türü: `kita`, `vadi`, `dag`, `korfez` |
| `difficulty` | `cirak` | Zorluk: `cirak`, `kalfa`, `usta`, `destan` |
| `size` | `orta` | Oyun boyu: `kisa`, `orta` (Normal), `uzun` |
| `fast` | `true` | `refresh()` yalnızca görüşü günceller (çizim/panel atlanır). Oyun mantığını değiştirmez. |
| `slice` | 8 | Kaç turda bir tarayıcıya nefes aldırılacağı. `0`: turlar arasında hiç bekleme yok, tohumlar arasında MessageChannel ile nefes (gizli sekmede hızlı) |
| `seedRandom` | `true` | Yalnızca **eski** sürümler (oyunda `rnd()` yoksa, ör. `src:'_eski/index.html?test=1'`) için `Math.random`'ı tohumla sabitler |
| `bot` | bkz. `SIM_DEFAULTS.bot` | Bot eşikleri (`atkCh:.75`, `upTahil:80`, `okcP:.3`…). 1b: `evPick` (`'first'` ilk seçilebilir seçenek, `'random'` bot üreteciyle), `turtle:true` (Medeniyet botu 12 bölgede saldırıyı keser) |
| `goal` | `fetih` | Bot politikası: `fetih` (eski bot), `medeniyet` (Büyük Eser için taş/odun/bilgi ayırır, altın eksikse otomatik üretimi durdurur, 18 teknolojiden sonra bilgiyi esere saklar), `hegemonya` (tutulmayan eski başkentlere doğru saldırır ve asker kaydırır, tuttuğu başkentlerde sur kurar, geri sayımda oraya yığar) |
| `ferman` | `false` | `true`: `goal` ferman olarak beyan edilir |
| `pers` | — | Bütün rakiplere tek kişilik (`saldirgan`, `tuccar`, `savunmaci`, `firsatci`) |
| `ev` / `alt` | `true` | `false`: olaylar / alternatif zaferler (vasal, eser yarışı dahil) kapalı. İkisi kapalıyken Klasik/Çırak satırları `baseline-v2.json` ile birebir aynıdır |
| `meta` | `false` | 1c: satıra `meta` eklenir: skor, ham skor, MP (`mpCalc`, oturmuş oyuncu; `mpNew`: ilk 2 oyun), en yüksek bölge oranı, ilk "Zaferi ilan et" anı ve o anki skor (`dec`), başarım sayaçları. Kapalıyken satırlar eski taban çizgileriyle birebir aynı kalır |
| `declare` | `false` | `meta` ile: bot ilk fırsatta zaferi ilan eder |
| `cfgExtra` | — | Oyun ayarına ek alanlar (ör. `{daily:'2026-10-19'}`, `{bonus:['hazine']}`) |

Varsayılan ayar (Klasik + kart yok + Kıta + Normal + Çırak) Faz 0 oyunudur.

## Belirlenimcilik

Faz 1a'dan beri oyun içi bütün rastgelelik (savaş zarları, rakip birlik karışımı, AI kararları, veba) kayıtta tutulan `S.rs` durumlu `rnd()` ile üretilir. Aynı tohum + aynı ayar + aynı kararlar = aynı sonuç; `Math.random` tohumlamak gerekmez. Bot kendi kararları için tohumdan türetilmiş ayrı bir üreteç kullanır. Simülasyon sırasında oyunun `Math.random` çağırması bir sızıntı sayılır ve `summary.randLeak`'te raporlanır (0 olmalı).

## Çıktı

Tohum başına: bitiş turu, sonuç (`win`/`lose`/`-`), zafer yolu (`winBy`), olay sayısı ve kimlikleri (`ev`, `evN`), koalisyon kırma (`coalBroken`), Büyük Eser aşaması (`wonder`), rakibin eser yarışı (`aiWonder`, `medClosed`), teknoloji, Hegemonya sayacının en yükseği (`hegMax`), vasal sayısı, kişilik başına rakip saldırı/kayıp (`aiS`), son bölge sayısı, %25/%50/%75 toprağa ulaşılan tur, kıtlık sayısı, koalisyon sayısı, Akın kullanımı, tur başına eylem, hatalar.
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
- `matrix-1b.json`: Faz 1b denge matrisi (48/96 tohum): zorluklar, hanedanlar, kişilikler, 14 kart, zafer yolu botları, kaplumbağa, harita/boy, olay istatistikleri, kişilik ayrışması (D6).
- `matrix-1a.json`: Faz 1a denge matrisi (hanedan × Kalfa, harita türleri, tekil kartlar, zorluklar).
- `_eski/index.html`: Faz 0 oyununun değişmemiş kopyası (eşdeğerlik ve v5 kayıt göçü testleri için). `runSim({src:'_eski/index.html?test=1'})` ile eski oyun koşturulur.

Denge değişikliğinden sonra yeni taban çizgisi kaydedilmeli.
