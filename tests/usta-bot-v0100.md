# Fetih v0.10.0 · Usta bot ve mevcut zorluğun gerçekçi ölçümü (yeni "mevcut durum" taban çizgisi)

**Yöntem.** `index.html` değiştirilmedi. Ölçüm, v0.10.0'ın dondurulmuş kopyasında (md5 `e525e4ce…`) başsız Chrome ile yapıldı (`tests/usta-run.mjs`, 9 paralel işçi). Ayar: Klasik kurallar, Kıta, Normal boy, kart yok, **olaylar ve alternatif zaferler açık** (zafer kararı `devam`), `maxTurns` 240, tohumlar **1001-1048** (48), zorluk × hanedan (Klasik, Börü, Kartal) × iki bot (`ref`, `usta`) = **1.152 oyun**, `tel:true`. Ham özet: `usta-bot-v0100.json` (`byDiff`, `cells`, `sensitivity`). Analiz: `python3 tests/usta-analyze.py`.

**Denetimler (hepsi ölçüldü):** hata 0, invariant ihlali 0, `randLeak` 0, sim'de AudioContext 0, ölümcül iş 0. `ref` bot `baseline-v6.json` ile birebir (12 tohum `rows` ve `rowsOff`), hem dondurulmuş v0.10.0'da hem de ölçüm sırasında başka bir ajanın değiştirdiği canlı dosyada (0.11.0, görsel iş): oyun mantığı aynı; usta botun Kalfa ve Destan/Börü satırları da canlı ve dondurulmuş sürümde birebir aynı. Telemetri `ref` satırlarını değiştirmiyor (açık/kapalı 2×12 oyun birebir).

**Hata payı.** 48 oyunda Wilson %95 aralığı ±10-14 puan; zorluk başına 144 oyunda ±5-8 puan.

---

## 1. Usta bot nasıl oynuyor (kısaca)

`tests/usta-bot.js`, `bot:{profile:'usta'}`. Yalnız arayüzde mümkün eylemler ve oyuncunun gördüğü bilgi (düşman sayısı ~5'e yuvarlı tahmin + 2,5 asker hata payı; kişilik Haritacılık ile). Karar modülleri sırayla: `arastirma` (katı sıra: Haritacılık, Talim, Demircilik, Sulama, Okçuluk, Çelik, Sefer, Casusluk …) → `savunma` (her bölgede gereken savunma = komşu rakiplerin olası saldırısı / onların eşiği × pay; açığı komşudan kapat) → `saldiri` (hazır − savunma payı ile, oran ≥ 1,15/1,3/1,5 ve şans ≥ %80, tutulamayacak fetih yok) → `yiginak` (hedef başına toplanma bölgesi; birleşik kuvvetle bir sonraki tur; boştaki asker açığa/yığınağa/rakip cephesine akar) → `askerSav` → `kurulus` (biriktirme hedefiyle) → `sur` → `ekonomi` (geri ödeme süresi, dinamik kaynak değeri) → `asker`; olaylar değer tahminiyle, Biat yalnız Fetih'i kilitlemiyorsa. Ayrıntı: `tests/README.md`.

## 2. Doğrulama: Usta bot insan vekili mi? (B.3.1 şartı: Kalfa'da ref + 20 puan)

| Zorluk (144 oyun) | **ref** kazanma | **usta** kazanma | Fark | ref ort. bitiş / kazanılan (medyan) | usta ort. bitiş / kazanılan | ref t25 / t50 / t75 | usta t25 / t50 / t75 |
|---|---|---|---|---|---|---|---|
| Çırak | %89,6 (83-94) | **%100** (97-100) | +10 | 93,0 / 85 | 36,1 / 35 | 35 / 64 / 77 | 12 / 22 / 31 |
| Kalfa | %49,3 (41-57) | **%93,1** (88-96) | **+44** | 81,2 / 92 | 42,3 / 39 | 39 / 72,5 / 84,5 | 12 / 24 / 34 |
| Usta | %24,3 (18-32) | **%80,6** (73-86) | **+56** | 65,9 / 96 | 52,3 / 45 | 44 / 77 / 88,5 | 14 / 28 / 40 |
| Destan | %11,8 (8-18) | **%77,8** (70-84) | **+66** | 60,6 / 123 | 50,2 / 43,5 | 50 / 87,5 / 111,5 | 14 / 27 / 39 |

Hanedan ayrımı (usta, 48'er): Kalfa Klasik/Börü/Kartal %93,8 / %93,8 / %91,7; Usta %79,2 / %85,4 / %77,1; Destan %72,9 / %85,4 / %75,0. (ref Kalfa %43,8 / %58,3 / %45,8.)

Oyun farkı (Kalfa, oyun başına ortalama): usta 49 saldırı, **0,0 başarısız**, gönderilenin %10,6'sı kayıp, 250 taşıma, 2.839 ganimet; rakibe kaybedilen bölge medyanı **1** (ref: 60), başkent kaybı 36 kez / 144 oyun (ref: 490). **Şart sağlandı (+44 puan, %25'e 3,2 kat, %50'ye 3 kat hızlı).** ref bot "acemi" olarak kalır (taban çizgileri için).

Botun sınırları (ölçülen): birlik karışımı yine %97 piyade (okçu %2-3, süvari %0,5, kuşatma/yeniçeri 0): oyunlar 40-50 turda bittiği için Talimhane+ nadiren gerekiyor; teknoloji Kalfa t40'ta 14. Deniz/Akıncı yetenekleri (Haraç, Yağma) kullanılmıyor. Yani bot bir insan ustanın **alt sınırı**dır; gerçek usta oyuncu en az bu kadar kazanır.

## 3. Mevcut zorluğun ölçümü (usta bot, 144 oyun/zorluk)

### 3.1 Kartopu ölçütleri (docs/faz2-derinlik.md §B.3.3)

| Ölçüt | Hedef (Kalfa) | Çırak | **Kalfa** | Usta | Destan |
|---|---|---|---|---|---|
| Kazanma (B.3.2 hedef bandı) | %35-45 | %100 (hedef 65-75) | **%93,1** | %80,6 (hedef 15-25) | %77,8 (hedef 5-10) |
| K1 P(kazanma \| %50'ye ulaştı) | ≤ %90 | %100 | **%97,8** | %95,1 | %91,8 |
| K2 P(kazanma \| %25'e ulaştı) | ≤ %65 | %100 | **%95,0** | %84,7 | %81,2 |
| K3 %75 → %100 (medyan tur) | 10-18 | 4 | **4** | 3 | 4 |
| K4 %50'den sonra rakibe/kabileye ≥1 / ≥3 bölge kaybı | ≥ %60 / ≥ %30 | %19 / %4 | **%38 / %18** | %48 / %19 | %55 / %23 |
| K5 kayıpların t60 sonrası payı | ≥ %35 | — | %40 (n=10) | %19 | %26 |
| K6 kaybedilen oyunlarda tepe pay ≥ %35 | ≥ %25 | — | %40 | %63 | %65 |
| K7 oyun uzunluğu, kazanılan (medyan) | 95-135 | 35 | **39** | 45 | 43,5 |
| K8 sıkıntı (kıtlık/hazine boş) yaşanan oyun / tur payı | %30-60 / ≤ %4 | %0,7 / %0,0 | **%4,9 / %0,4** | %6,9 / %0,4 | %10,4 / %0,8 |
| K9 atıl kaynak (stok ÷ net gelir, t15-60) | ≤ 10 | ≤ 6 | **≤ 6** (bilgi 5,9, taş 3, demir 2,4) | ≤ 6 | ≤ 6 |
| K10 bir rakip bir an ≥ %25 toprak | ≥ %40 | %0 | **%6** | %22 | %25 |
| K11 fethedilen bölgeyi 3 tur içinde geri alan rakip (oyun) | ≥ %50 | %17 | %40 | %54 | %49 |
| Koalisyon kurulan oyun | — | — | %96,5 | %95 | %96 |

Tur T'de toprak payı ≥ X olan oyunlarda kazanma (usta, Kalfa / Destan):

| Durum | Kalfa: oyun · kazanma | Destan: oyun · kazanma |
|---|---|---|
| t20'de ≥ %25 | 135/144 · %97 | 130/144 · %82 |
| t20'de ≥ %35 | 118 · %98 | 86 · %88 |
| t30'da ≥ %50 | 110 · %99 | 85 · %94 |
| t40'ta ≥ %50 | 59 · %98 | 79 · %94 |

### 3.2 Güç ve gelir eğrisi (usta bot, medyan; o tura kadar süren oyunlar)

Kalfa (n=144; t40'ta 83 oyun sürüyor):

| Tur | Bölge (/~56) | Asker ÷ rakip toplamı | Asker ÷ en güçlü rakip | Brüt gelir (6 kaynak) | Net altın | Net tahıl | Altın stoku |
|---|---|---|---|---|---|---|---|
| 5 | 5 | 0,48 | 1,71 | 41 | 10,9 | 11,2 | 17 |
| 10 | 11 | 0,58 | **1,98** | 71 | 17,2 | 18,9 | 19 |
| 15 | 17,5 | 0,59 | 1,99 | 103 | 24,1 | 25,7 | 24 |
| 20 | **24** | 0,64 | 2,03 | 139 | 29,4 | 34,3 | 28 |
| 30 | 35 | 0,82 | 2,24 | 234 | 51,8 | 69,9 | 39 |
| 40 | 44 | 1,16 | 2,88 | 340 | 80,0 | 110,8 | 39 |

Destan: bölge 4 → 10 → 21 → 29 → 38 (t5/10/20/30/40), asker ÷ en güçlü rakip 1,4-1,8 (her tur), ÷ rakip toplamı hiç 0,64'ü geçmiyor; brüt gelir 31 → 120 → 300.
ref (Kalfa) karşılaştırma: t20'de 8 bölge, asker ÷ en güçlü rakip 0,69, brüt 71; ancak t75-80'de 1,5-1,7 ve 27-29 bölgeye ulaşıyor.

Kaynak anlık görüntüsü (usta, Kalfa, medyan stok / net): t20 tahıl 81/+34, odun 31/+18, taş 17/+3, demir 17/+7, altın 29/+29, bilgi 29/+5 · t40 tahıl 228/+111, odun 55/+45, taş 44/+29, demir 32/+12, altın 39/+80, bilgi 50/+7. Tesis: t20'de 7 (Sv. 1,1), t40'ta 12 (Sv. 2,0); askeri kademe t40'ta en çok III.

### 3.3 Duyarlılık (usta bot, Kalfa/Klasik, 48 tohum; sabitler iframe'de yamalandı)

| Koşul | Kazanma (%95) | Ort. bitiş | Kazanılan (medyan) | t25 / t50 / t75 | %75→%100 | K1 |
|---|---|---|---|---|---|---|
| Bugün | %93,8 (83-98) | 40,4 | 39 | 12 / 23 / 34 | 4 | %98 |
| Ganimet (`lootStore`) ×0,6 | %77,1 (64-87) | 60,5 | 50 | 15 / 30 / 43 | 5 | %93 |
| Ganimet ×0,4 | %35,4 (23-50) | 69,1 | 77 | 24 / 55,5 / 69 | 4 | %94 |
| Rakip kazancı (Kalfa `aiGain`) 1,6 → 2,4 | %64,6 (50-77) | 50,8 | 43 | 13 / 25 / 35 | 4 | %86 |
| Kabile garnizonu (`neutral`) 1,1 → 2,0 | %81,2 (68-90) | 65,8 | 63 | 22 / 47 / 59 | 5 | %91 |
| Ganimet ×0,6 + aiGain 2,4 + neutral 2,0 | %35,4 (23-50) | 66,0 | 76 | 25 / 56 / 68 | 4 | %90 |

## 4. Kullanıcının şikâyeti doğrulandı mı?

**Evet, sayılarla.** Deneyimli oyuncu vekili Kalfa'da %93, Destan'da bile %78 kazanıyor; bugünkü "Kalfa %44-48, Destan %10" eğrisi yalnız ref bota (acemi oyuncuya) göre doğru.

- **"Belli bir noktadan sonra" = tur 10-20.** Barış (12 tur) biter bitmez usta oyuncu kabileleri yığınakla, kayıpsız (%10 kayıp, 0 yenilgi) toplar: t10'da 11, t20'de 24 bölge (%43). t20'de %25'i geçen oyunların %97'si (Kalfa) / %82'si (Destan) kazanılıyor; t30'da %50 → %94-99. Oyun ortası ve sonu (t30 → bitiş) fiilen formalite; %75 → %100 yalnız 3-4 tur.
- **"Kaynak üretmek çok kolay":** sorun stok birikmesi değil (usta oyuncu her şeyi harcıyor: atıl oran ≤ 6, kıtlık/hazine boşluğu turların %0,4-0,8'i), **gelirin bölge sayısıyla bedavaya büyümesi**: brüt gelir t5 → t20'de 3,4 kat, t40'ta 8,3 kat (Kalfa); net altın 11 → 29 → 80, net tahıl 11 → 34 → 111. Büyümenin kaynağı fetih: bölge başına arazi geliri + ganimet (oyun başına ~2.800). Duyarlılık bunu doğruluyor: ganimet ×0,4 tek başına kazanmayı %94 → %35'e indiriyor. "Çok kolay" ilk olarak **altın ve tahılda** başlıyor (t10-25 arası net altın her 5 turda ~+%20-40); taş ve demir t20'de hâlâ dar (net +3 / +7) ama oyunu belirlemiyor.
- **"Üstünlük kolay":** usta oyuncu t10'dan itibaren tek tek her rakipten 2 kat güçlü (asker ÷ en güçlü rakip 1,7-2,9; Destan'da 1,4-1,8), rakiplerin toplamından zayıf olduğu halde (0,5-0,8) kazanıyor: rakipler eşgüdümsüz. Koalisyon oyunların %96'sında kuruluyor ama etkisiz (K1 yine %98). Bir rakip yalnız Kalfa oyunlarının %6'sında %25 toprağa ulaşıyor (hedef ≥ %40).
- **"Sürekli zafer kaçınılmaz":** K1 %92-98, K3 3-4 tur, kazanılan oyun 39-45 tur (hedef 95-135). Destan'daki %22 kayıp, oyun ortasındaki ani çöküşlerden (başkent düşmesi) geliyor (K6 %65), uzun bir çekişmeden değil.

## 5. Öneri (denge hedefleri; usta bot ölçüm botu olmalı)

Hedefler B.3.2/B.3.3 aynen, ama **usta bota göre**: Kalfa %35-45, Usta %15-25, Destan %5-10; K1 ≤ %90, K2 ≤ %65, K3 10-18 tur, kazanılan oyun 95-135 tur. Bugünkü açık: Kalfa'da −50 puan, oyun süresinde ×2,5.

1. **Erken genişlemeyi yavaşlat (en çok t10-30):** ölçülen tek-düğme etkisi en büyük kaldıraç ganimettir (×0,6 → −17, ×0,4 → −58 puan). Tek başına kesmek yerine belgedeki **azalan ganimet (B.1.4)** ve **idare yükü + taşra verimi (B.1.1-2)** ile "8. bölgeden sonra" devreye sok: hedef usta botla Kalfa'da t25 ≥ 22, t50 ≥ 50 (bugün 12 / 24). Kabile garnizonu ×2 (neutral 2,0) yalnız tempoyu yavaşlatıyor (t50 23 → 47) ama kazanmayı az değiştiriyor (−13): zorluk değil süre düğmesi.
2. **Rakip kazancını büyütmek tek başına çözüm değil:** aiGain 1,6 → 2,4 yalnız −29 puan ve K3 4 turda kalıyor; Destan zaten 2,1 ile %78. Belgedeki rakip ekonomisi + eşgüdümlü saldırı (B.2.1, B.2.3) ve **dengeleyici (B.2.4)** gerekli: başarı ölçütü K10 (rakip ≥ %25) ≥ %40 ve K4 (≥1 bölge kaybı %50'den sonra) ≥ %60.
3. **Oyun sonu:** %75 → %100 3-4 tur. Son bölgelere/son başkentlere ek savunma (A.1 #10) ve koalisyonun oyuncu büyüdükçe sertleşmesi (B.2.4) olmadan K3 hedefi tutmaz; kombinasyonda bile K3 4 tur kaldı.
4. **Kalibrasyon kuralı:** her denge değişikliğinde iki bot birlikte; ref bot "acemi" bandı (Kalfa %20-30), usta bot hedef bandı. Combo (ganimet ×0,6 + aiGain 2,4 + neutral 2,0) Kalfa'yı %35'e indirdi: doğru büyüklük sırası bu (yaklaşık "3 kaldıraç birlikte"), ama K1 %90 / K3 4 tur: kartopu kırılmıyor, yalnız yavaşlıyor; yapısal öneriler (1-3) bunun için.

## 6. Riskler ve açık noktalar

- Usta bot insanın **alt sınırı**: birlik karışımı, Haraç/Yağma, olay sezgisi insan kadar iyi değil; Destan'da bazı tohumlarda ani çöküş yaşıyor. Denge ayarları usta bota fazla uydurulursa insan için yine kolay kalabilir; ileride bir "B2+" (karışık ordu, rakip başkentine öncelik) eklenebilir.
- Bot görünmeyen bilgiyi kullanmıyor ama oyunun gösterdiği şans halkası zaten gerçek birlik bileşimiyle hesaplanıyor (`knownDef`); bot da aynı hesabı kullanıyor.
- Oyun hatası (bilinen, ref'te de var): rakip bölge cebi yalnız vasallara komşu kalırsa Fetih imkânsızlaşıyor (ref seed 44 Çırak bu yüzden 241 turda bitmiyor). Usta bot Biat'ı yalnız erişim kesilmiyorsa kabul ederek bunu önlüyor; oyunda düzeltilmeli (ör. vasal toprağından geçiş ya da biat sırasında uyarı).
- Duyarlılık 48 tohum, tek hanedan; ±13 puan aralık. Ara değerler ölçülmedi.
- Ölçüm v0.10.0 kopyasında; canlı dosya ölçüm sırasında 0.11.0'a geçti (görsel), oyun mantığı aynı doğrulandı (yukarıda).
