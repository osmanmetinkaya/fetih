# Fetih: Faz 2 Tasarım Belgesi ("Derinlik": zorluk, ekonomi, atölye, deniz)

*Hazırlayan: oyun tasarımcısı (Opus, Fable yerine). Tarih: 24.10.2026. Esas alınan sürüm: v0.10.0 (canlı 0.9.2), kayıt `SAVE_VER 8`. Kod değiştirilmedi; bu belge uygulayıcıya doğrudan aktarılacak bir şartnamedir.*

**Okuma notu (dürüstlük kuralı).** Belgedeki sayılar üç türdür:
- **[ölçüm]**: depodaki eski bot ölçümlerinden (`tests/economy-1c.md`, `tests/matrix-1b.json`, `tests/baseline-v6.json`, `docs/faz1-tasarim.md` uygulama notları) alınmış ya da bu belge için o ham verilerden yeniden hesaplanmış değerler. Yeni bot koşusu **yapılmadı**.
- **[hesap]**: oyun sabitlerinden (index.html) elle/betikle türetilmiş değerler (oyun koşturulmadan).
- **[tahmin]**: tasarımcı varsayımı; bot ile doğrulanacak. Bütün yeni parametreler başlangıç değeridir.

Uygulama maliyeti etiketi her önerinin yanında: **(D)** düşük, **(O)** orta, **(Y)** yüksek (tek dosyalık JS oyununda).

---

## A. Teşhis: neden zafer kaçınılmaz oluyor?

### A.0 Önce kritik bir gözlem: bot "zor" diyor, kullanıcı "kolay" diyor

Mevcut bot (fetih politikası) ile zorluk eğrisi kâğıt üstünde hedefte **[ölçüm]**: 0.9.2'de Çırak %92, Kalfa %44-48, Usta %21-25 (48 tohum, `baseline-v6.json` `matrix.before/after`); 0.8.1'de Destan %10. Yani sorun "sayılar yanlış ayarlı" değil; iki yapısal sorun var:

1. **Bot insan oyuncunun vekili değil.** Bot asker yığmaz (her bölge kendi hazır askeriyle tek başına saldırır), donanım/kuşatma/yeniçeri kullanmaz, garnizon hesabı yapmaz. Deneyimli bir insan aynı haritada botun yenildiği oyunların çoğunu kazanır. Zorluk bu bota göre ayarlandığı için insanda kayar. **Sonuç:** Faz 2'de zorluk hedefleri ikinci, daha güçlü bir bota ("Usta bot", §B.3) göre tanımlanmalı.
2. **Zorluk önden yüklü; oyun ortası ve sonu kayıp üretmiyor.** 1b matrisindeki 1.824 oyunun **[ölçüm, bu belge için yeniden hesaplandı]**:
   - %25 toprağa ulaşamayan oyunlarda kazanma **%0,9**; ulaşanlarda **%77**.
   - Kaybedilen oyunların bitiş turu medyanı **51**; %25'e ulaşıp yine de kaybeden oyun yalnız 168/1.824 (%9).
   - 0.9.2 taban satırlarında (çoğu Çırak, küçük örnek: 31 oyun) %50'ye ulaşan 21 oyunun 20'si (%95), %75'e ulaşan 19 oyunun 19'u kazandı.
   - %75 → %100 arası ortalama yalnız **3,9-6,3 tur** (0.9.1/0.9.2 matrisi, `avg75to100`). Toprak çeyrekleri: 37 / 32 / **16** tur (`economy-1c.md` §5).

   Yani oyun "ilk 40-50 turda hayatta kal → sonrası formalite". Kullanıcının "belli bir noktadan sonra" cümlesi tam bu eğriyi tarif ediyor. İnsan oyuncu erken krizi bottan iyi atlattığı için neredeyse her oyunu kazanıyor.

### A.1 Kartopu mekanizmaları (koddan), etki büyüklüğü sırasıyla

| # | Mekanizma | Kod | Neden kartopu | Etki tahmini |
|---|---|---|---|---|
| 1 | **Rakibin ekonomisi yok** | `aiTurn`: `gain=round((1+min(n,12)·0,5+max(0,n−12)·0,25+tur·0,02)·aiGain·…)` | Rakip asker "doğurur": hazine, bakım, nüfus, tesis, donanım yok. Rakip büyüse de yatırımla güçlenmez (12 bölgeden sonra bölge başı kazanç yarıya iner), küçülünce de ekonomik çöküş yerine yalnız doğrusal azalma olur. Bakım ödemediği için ordusu sınırsız birikir ama **rastgele cepheye** dağılır. | **[hesap]** Kalfa'da 1 bölge kaybı rakibe tur başına −0,8 asker; oyuncuya +2-3 kaynak/tur + ganimet. Her fetih ~2 katlı salınım. |
| 2 | **Rakip kararları yerel ve temkinli** | `aiTurn` saldırı döngüsü | Her bölge yalnız kendi `ready` askeriyle saldırır; iki bölgeden aynı hedefe **birleşik saldırı yok**; eşik `need` 1,15-1,9 (oyuncuya 1,3-1,9). İç bölgedeki asker cepheye tur başına 1 adım akar, odak/yığınak yalnız 2 kişilikte ve kısmi. Karşı saldırı yalnız Savunmacı'da. | Oyuncu cephede rakibin tek bölge gücünün 1/1,3'ünü tutarsa hiç saldırı yemez. İnsan bunu çabuk öğrenir. **[tahmin]** en büyük "akıllı oyuncu" kaldıracı. |
| 3 | **Fetih ganimeti** | `lootStore` (bölge üretimi ×8 + asker başı altın/tahıl, başkent ×1,5), `lootRate` %30+%30·fr (tavan %75) | Duyarlılıkta en güçlü kaldıraç: ±%30 → kazanma %82/%32 (50 puan) **[ölçüm]**. Büyük ordu → az kayıp → yüksek `fr` → yüksek pay: güçlü olan daha çok kazanır. | **[hesap]** 20 askerli sıradan rakip bölgesi ≈ 22🌾 14🪙 3⚒️ 4📜; 40 askerli başkent ≈ 65🌾 55🪙: t40'ta 3-5 turluk altın geliri. |
| 4 | **Fethedilen bölge anında tam verimle üretir** | `conquer`: nüfus ×0,7, `r.auto=true`; `workforce` ≥ 0,4 | Rakip bölge nüfusu azaminin %65'iyle başlar; ×0,7 sonrası %45 → işgücü 0,91. Huzursuzluk, isyan riski, asimilasyon yok. | **[hesap]** Bölge geliri fetih turunda %90'ın üstünde. |
| 5 | **İmparatorluk büyüklüğünün maliyeti yok** | `economy()`: bakım yalnız asker ağırlığına bağlı (tahıl 0,15, altın 0,10) | 50 bölgelik devletin idaresi 5 bölgeninkiyle aynı; uzak bölgeler aynı verimde. Tek fren `newFieldCost` (1+0,2·tesis sayısı): bu da yatırımı pahalılaştırıp **fethi** tek ucuz gelir kaynağı yapıyor (arazi geliri bedava). | "Ekonomi-önce" %38 vs referans %64 **[ölçüm]**: fetih yatırımdan üstün. |
| 6 | **Stok sınırı yok** | `S.res` sınırsız | Atıl kaynak birikir (t60: odun 332, demir 296 **[ölçüm]**), sonra kademe/sur/teknoloji tek turda alınır. Kıtlık 5.193 turun 2'sinde, hazine boşluğu 0'ında görüldü **[ölçüm]**. | Ekonomi "baskı" üretmiyor; kaynak kararları anlamsızlaşıyor. |
| 7 | **Kalite farkı oyuncu lehine büyür** | `baseMil` / `aiB` | Oyuncu tavanı: saldırı teknolojisi +0,65, donanım +0,35, moral 1,0-1,1, Yeniçeri; rakip tavanı: `aiBCap` 0,50-0,70, rastgele karışım. Rakibin donanımı ve kademe ilerlemesi yok. | **[hesap]** t64+ oyuncu birim başı saldırı ×2,0 (×2,7 Yeniçeri) vs rakip ×1,55-1,70. |
| 8 | **Koalisyon kısa ve dağınık** | `updateCoal`: 12 yıl, `need −0,15`, skor +0,5, sonra 10 yıl bekleme | Üyeler eşgüdümsüz (aynı hedefe birlikte gelmiyor), koalisyon oyuncu %35'i aşınca bir kez çıkıyor ve oyuncu büyüdükçe **sertleşmiyor**. | Kalfa'da oyunların %54-56'sında kuruluyor **[ölçüm]** ama kartopu turlarında (t60+) etkisiz. |
| 9 | **Rakipler oyuncu büyürken birbirleriyle savaşmayı sürdürür** | `aiTurn`: koalisyon dışı rakip rakibe saldırır | Oyuncu %50'deyken bile iki rakip birbirini zayıflatabilir. | **[tahmin]** orta. |
| 10 | **Son bölgeler savunmasız** | `aiTurn` (son 1-3 bölgede ek kural yok), Zafer İlanı 1,25×/%25 | Son başkentler normal bölgeden farksız; %75 → %100 ≈ 4-6 tur **[ölçüm]**. | Oyun sonu gerilimi sıfır. |
| 11 | **Moral pozitif geri besleme** | `conqMorale` +5/fetih, `moraleMult` | Kazanan moral toplar (×1,0-1,1), kaybedenin morali yok (rakip). | küçük |

**Özet teşhis.** Oyuncu ile rakip **farklı oyunlar** oynuyor: oyuncu bir ekonomi + kalite + yığınak oyunu, rakip bir "bölge sayısına bağlı asker musluğu". Musluk erken oyunda oyuncuyu ezebiliyor (kayıplar t~51), ama oyuncunun ekonomisi bir eşikten sonra musluğu aşınca fark her fetihle açılıyor ve geri dönmüyor. Çözüm "musluğu açmak" (aiGain'i büyütmek) olmamalı; bu yalnız erken ölüm oranını artırır (1a-1b'de Usta/Destan kalibrasyonu tam olarak bunu yaptı: aiGain 1,95-2,10). Çözüm iki yönlü:
- **Rakibe gerçek bir ekonomi ve plan** (bölge → gelir → bakım/yatırım/donanım; odaklı ve eşgüdümlü saldırı, karşı saldırı, savunma yedeği).
- **Oyuncuya büyüklük maliyeti** (idare yükü, taşra verimi, yeni fetih huzursuzluğu, azalan ganimet, stok tavanı) ki eğri oyunun ortasında düzleşsin ve sonu çekişmeli olsun.

---

## B. Zorluk ve ekonomi dengesi

### B.0 Karışım oranı: neden ikisi birden, hangi oranla

Kullanıcı "ya üretim/tüketim dengesi ya rakip zorluğu" dedi. Öneri: **kazanma oranı etkisinin ~%45'i oyuncu tarafı frenlerinden, ~%55'i rakip tarafından** gelsin.

Gerekçe:
- Oyuncu frenleri tek başına "ceza" gibi hissedilir ve yatırımı daha da cazipsiz yapar (ekonomi-önce zaten %38). Bu yüzden frenler **yalnız büyüklükle** devreye girer (8 bölgeye kadar sıfır) ve erken oyunu bozmaz.
- Rakip tarafı oyunu **daha ilginç** yapar (yeni karar: nereyi tutacağım, karşı saldırıya nasıl hazırlanacağım) ve kartopuna karşı doğal bir mekanizma kurar: büyüyen rakip de güçlenir, oyuncu büyüdükçe rakipler birleşir.
- Rakip tarafı ayrıca erken oyunu *zorlaştırmadan* oyun ortasını zorlaştırabilir (bakım nedeniyle rakip ordusu erken oyunda bugünkünden büyük olmaz; fark t40'tan sonra açılır).

Etki bütçesi (Kalfa, Usta bot üstünde hedef −30 puan; **[tahmin]**, G1 ölçümüyle düzeltilecek):

| Kaldıraç | Beklenen kazanma etkisi | Ağırlık |
|---|---|---|
| İdare yükü + taşra verimi (B.1.1-2) | −6 | oyuncu |
| Yeni fetih huzursuzluğu (B.1.3) | −4 | oyuncu |
| Azalan ganimet (B.1.4) | −5 (lootStore esnekliğinden: −%20 pay ≈ −12 puan, yalnız geç oyunda) | oyuncu |
| Stok tavanı (B.1.5) | −1 | oyuncu |
| Rakip ekonomisi + donanım + teknoloji (B.2.1-2) | −6 | rakip |
| Akıllı hamleler (B.2.3) | −8 | rakip |
| Dengeleyici + Can Havli + koalisyon (B.2.4) | −6 | rakip |
| Atölye/ticaret/balık (C, D): iyi oyuncuya geri verir | +6 | — |
| **Net** | **≈ −30** | 16 : 20 ≈ %45 : %55 |

### B.1 Oyuncu tarafı

#### B.1.1 İdare yükü (Divan gideri) — (D)
Her tur altın gideri:

`idare = 0,5 · max(0, N − N0)^1,2` altın/tur

- `N` = sahip olunan bölge sayısı (vasal bölgeleri sayılmaz).
- `N0` = 8 (Kısa 6, Uzun 10). Akıncı hanedanı `N0` −1 (yağma devleti), Bilge +1.
- Strateji III (Yol Ağı) idare ×0,8. Ticaret Kavşağı bölgeleri 0,5 bölge sayılır (idari merkez).
- `economy()` içinde `up.altin += idare`; ekonomi panelinde ayrı satır: "🏛️ Divan gideri (N bölge)".

| N | 8 | 12 | 16 | 20 | 25 | 30 | 40 | 55 |
|---|---|---|---|---|---|---|---|---|
| İdare (altın/tur) **[hesap]** | 0 | 2,6 | 6,1 | 9,9 | 15,0 | 20,4 | 32,0 | 50,8 |
| Brüt altına oranı **[tahmin: bölge başı ~2,7 altın]** | 0 | %8 | %14 | %18 | %22 | %25 | %30 | %34 |

Bir bölgenin marjinal idare gideri N=20'de ~1,0, N=40'ta ~1,3 altın: bölge hâlâ kârlı ama kâr payı yarıya iner. **Neden altın:** altın en sıkı kaynak ve en duyarlı kaldıraç (Pazar −%30 → −26 puan **[ölçüm]**); bu yüzden üs 1,2 ve katsayı 0,5 bilerek yumuşak. ±%20 oynatılarak ölçülmeli (§F G1).

#### B.1.2 Taşra verimi (başkente uzaklık) — (D)
`production(i)` çarpanı:

`taşra(i) = max(0,65 ; 1 − 0,04 · max(0, d(i) − 3))`

- `d(i)`: başkentten kendi bölgelerin içinden BFS uzaklığı (kendi toprağından kopuk bölge: harita BFS uzaklığı + 2).
- d ≤ 3 → 1,00; d=6 → 0,88; d=8 → 0,80; d ≥ 12 → 0,65.
- Yol Ağı (Strateji III) katsayıyı 0,04 → 0,025 yapar. Başkent taşınırsa (düşerse) değer yeniden hesaplanır (önbellek: bölge sahipliği değişince).
- Gemi ticareti (D) taşradan etkilenmez (deniz yolu); balıkhane etkilenir (normal tesis).

Amaç: dağınık değil derli toplu büyümeyi ödüllendirmek, başkent konumuna anlam katmak. **[tahmin]** Normal haritada geç oyunda ortalama bölge verimi ≈ 0,85.

#### B.1.3 Yeni fetih huzursuzluğu ve isyan — (O)
Fetihte bölgeye `r.unr` (huzursuzluk sayacı) yazılır:

| Fethedilen | `unr` | Not |
|---|---|---|
| Kabile bölgesi | 6 | |
| Rakip bölgesi | 10 | |
| Rakip başkenti | 14 | |
| Kendi eski bölgen (geri alma) | 3 | |

- Üretim çarpanı: `huzur(i) = 1 − 0,06 · unr` (unr=10 → 0,40; her tur 1 azalır → 10 turda 1,00; ortalama 0,70).
- Huzursuz bölgede: otomatik asker üretimi kapalı, tesis kurma/yükseltme kapalı, atölye çalışmaz; sur yapılabilir.
- **Garnizon ihtiyacı** `G(i) = 3 + 0,08 · pop(i)` (piyade eşdeğeri, Yeniçeri 2 sayılır). Garnizon `g < G` ise tur başına isyan olasılığı `p = 0,05 · (1 − g/G)` (g=0 → %5/tur). İsyan mevcut İsyan olay yolunu kullanır (`6 + 0,1·pop` piyade, tek zarlı savaş; kaybedilirse bölge kabileye döner).
- Garnizon ≥ 2G ise `unr` turda 2 azalır (askeri bastırma: oyuncuya sıkıştırılmış bir tercih).
- Olay "İsyan" ağırlığı huzursuz bölge başına ×1,5 (isyan şu an en nadir olay **[ölçüm]**).

**[hesap]** 10 bölgelik bir dalganın ilk 10 turdaki geliri bugün ≈ %91, yeni kuralla ≈ %64. Beklenen isyan: garnizonsuz bırakılan bölgede 10 turda ~%40 (`1−0,95^10`); garnizon G/2 iken ~%23.

#### B.1.4 Azalan ganimet ("savaş yorgunluğu") — (D)
`lootRate` çarpanı: `× clamp(1,15 − s, 0,60, 1)`; `s` = oyuncunun toprak payı (`own/playN`).
- s ≤ %15 → ×1,0 (erken oyuna dokunmaz); s=%35 → ×0,80; s ≥ %55 → ×0,60.
- Bitiş ekranı ganimet tablosunda satır: "Savaş yorgunluğu −%20".

Gerekçe: en güçlü tek kaldıraç (±%30 → 50 puan **[ölçüm]**) ve doğrudan kartopu terimi. Erken oyunda değişmediği için Çırak/kabile açılışını bozmaz.

#### B.1.5 Stok tavanı ve Ambar — (D)
- Tavan (tahıl, odun, taş, demir ayrı ayrı): `T = 150 + 12·N + 120·Σ(Ambar Sv)`.
- Altın tavanı ("Hazine"): `250 + 15·N`; Ticaret Yolları ×1,5. Bilgi: tavansız (zaten araştırmaya akıyor).
- Tavanı aşan kısım her tur çürür: tahıl %40, odun/taş/demir %20, altın %10 (hırsızlık/israf). Yıl raporunda tek satır: "Ambar taştı: 🌾−18 🪵−6 çürüdü."
- **Ambar** yeni bir tesis (`FIELD.ambar`): üretim yok, yuva kullanır, kurma {odun 30, taş 20}, Sv. başına +120 tavan (bütün dökme kaynaklar), en çok Sv.3. Yuva kullanması bilinçli bir ikilem.
- Ganimet ve olay ödülleri tavanı aşabilir (o tur çürümez, sonraki turdan itibaren çürür).

**[hesap]** t60'ta N≈20 → tavan 390 (Ambarsız): bugünkü odun stoğu (332) sınırda, demir stoğu (296) atölyelerle zaten eriyecek. Tavan erken oyunda bağlamaz (t20: N≈9.5 → 264, stoklar 21-81 **[ölçüm]**).

#### B.1.6 Asker bakımı — bilerek dokunulmuyor
UNITS maliyeti ±%20 → 41 puan, ordu bakımı ±%20 → 14 puan **[ölçüm]**: çok duyarlı. Faz 2'de birlik maliyeti ve temel bakım **değişmez**. Ek ordu yükü donanım (atölye işçisi/ücreti, C.4) ve gemi tayfası (D.3) üzerinden gelir: yani yalnız kaliteyi seçen öder.

#### B.1.7 Yatırım tarafı — küçük düzeltme
`newFieldCost` bugün `1 + 0,2 · toplam tesis sayısı` (30 tesiste ×7) **[kod]**. Bu, "tesis kurmak yerine fethet" sinyali veriyor. Öneri: `1 + 0,12 · toplam tesis + 0,25 · bölgedeki tesis` (aynı bölgeye yığmak pahalı, yayılmak ucuzlar). 30 tesis / bölgede 2: ×5,1 (bugün ×7). (D) **[tahmin]** ekonomi-önce politikası +5-8 puan.

### B.2 Rakip tarafı

#### B.2.1 Rakip ekonomisi ("akçe" modeli) — (Y)
Rakip oyuncunun 6 kaynağını ayrı ayrı tutmaz (karar yükü ve kod maliyeti); tek bir değer birimi kullanır: **akçe**. Dönüşüm (oyuncu maliyetlerinden): `akçe = altın·1 + tahıl·0,6 + odun·0,6 + taş·0,6 + demir·1,2 + bilgi·1,0`.

**Rakip durumu (yeni alanlar `S.ai[f]`):** `h` hazine (akçe), `tp` teknoloji puanı, `eq` donanım kademesi (0-5) ve `eqP` biriken yatırım, `plan` (B.2.3), `levy` (Can Havli sayacı). Rakip bölgesinde: `r.dev` gelişim (0-3, rakibin soyut tesisleri), `r.unr` (rakip de fethettiği bölgede huzursuz).

**Gelir (tur başı):**

`I_f = E · Σ_bölge y(r)`, `y(r) = (3 + Σ TER.y + özellik + 2,5·dev + [başkent] 8) · huzur(r)`.

- `özellik`: Kavşak/Liman 3 (Tüccar ×1,5), Harabe 1 (teknoloji puanına gider), diğerleri 1.
- `E = D.aiEco · P.eco · fx.aiGain · (1 + Den(s))` (zorluk × kişilik × kart × dengeleyici, B.2.4).
- Rakip limanı: Tüccar kişiliği ve Deniz Beyleri rakibi liman bölgesi başına +2 akçe "deniz ticareti" (rakip gemi yapmaz; D.6).

**Harcama sırası (her tur):**
1. **Bakım:** `0,15 akçe × Σ birim ağırlığı (UNITS.up)` ("tımar": toprağa bağlı asker, oyuncunun 0,25'inden ucuz). Ödenemezse ordunun %5'i dağılır (rakibin kıtlığı) ve `h=0`.
2. **Rezerv:** `h` en az 3 turluk bakım kadar tutulur.
3. Kalan bütçe kişiliğin payına göre (tablo B.2.5): **ordu / gelişim / donanım / sur**.
4. **Ordu:** birim fiyatı akçe cinsinden: piyade 4,2 · okçu 5,4 · süvari 10,8 · kuşatma 11,2 · yeniçeri 10,6; artı donanım payı `0,6 · KF[eq]` (C.2). Alım, rakibin bölgelerindeki **alınabilir nüfusla** sınırlı (oyuncuyla aynı `draftable` kuralı; birim nüfusu kadar düşer). Birim türü planın hedefine göre seçilir (B.2.3/S7), plan yoksa `aiMix`.
5. **Gelişim:** en yüksek `Σ TER.y`'li ve cepheye en uzak bölgeye `dev+1`; maliyet `25·(dev+1)^1,5` → 25 / 71 / 130 akçe; getiri +2,5 akçe/tur (geri ödeme 10 / 28 / 52 tur **[hesap]**). Cephe bölgesi (oyuncuya komşu) geliştirilmez.
6. **Donanım:** `eqP` biriktirilir; kademe `T` için eşik `40·T^1,6` → T2 121, T3 232, T4 368, T5 525 akçe; ek kapı `tur ≥ 14·(T−1)` ve `T ≤ D.aiEqCap`.
7. **Sur:** `20·sur` akçe, mevcut `P.fort` tavanı korunur; olasılık yerine bütçe.

**Teknoloji:** `tp += (0,4 + 0,05·n_f) · D.aiTech` (+1 her Harabe); `aiB(f) = min(D.aiBCap, D.aiBStep · ⌊tp/4⌋)`. n=12'de bugünkü hız (4 turda bir adım); küçük rakip geri kalır, büyüyen rakip öne geçer. Bilge rakip ×1,25 korunur.

**Fetihte:** rakip bölgesini oyuncu alınca `dev` 1 düşer (oyuncu tesisi değildir, oyuncuya geçmez; ganimete `+15·dev` akçe değerinde altın eklenir). Rakip rakipten alınca `dev` aynı kalır.

**Kalibrasyon kontrolü [hesap].** Kalfa, 4 bölge, t20, ordu ~90: gelir `(4·5,7 + 8)·1,6 ≈ 49`, bakım 13,5, ordu payı %65 → 23 akçe → **5,5 piyade/tur**. Bugünkü formül aynı durumda 5,4 asker/tur verir. Yani erken oyun aynı kalır; fark sonra açılır:
- Rakip **büyürse** (12 bölge, dev 1,5 ortalama, t60): gelir `(12·9,5+8)·1,6 ≈ 195` → bakım düşülünce 20+ birim/tur ve T3-T4 donanım. Bugünkü formül 10,6 verir. → gerçek bir "ikinci büyük güç".
- Rakip **küçülürse** (3 bölge, ordu 150): gelir ~40, bakım 22: alım ~2/tur; ordusu erir (bugün 3,7/tur bakımsız birikir).
- Durağan rakip ordusunun zaman sabiti ~43 tur (`4,2 / (0,65·0,15)`); orduları sınırsız büyümez, ekonomileriyle orantılı kalır.

`aiGain` alanı kalkar; `DIFFS.aiEco` onun yerini alır (başlangıç değerleri aşağıda, aynı ölçekte). Eski davranış (`klasik` kişilik, `cfg.aiEco:false`) eşdeğerlik testleri için korunur (§F).

#### B.2.2 Rakip donanımı — (O)
Rakibin bütün ordusu kendi `eq` kademesinde sayılır (kapsama 1; rakipte stok/milis yok, sadelik). Savaş çarpanı oyuncuyla **aynı tablo** (C.2): saldırıda `A[eq]`, savunmada `D[eq]`. Kabileler sabit T1. `aiBCap` düşer çünkü donanım artık ayrı bir çarpan (aşağıda tablo). Rakip T0 hiç olmaz (başlangıç T1).

#### B.2.3 Daha akıllı hamleler — (Y)
Her davranış `D.aiSmart` olasılığıyla o tur etkin (Çırak'ta rakip bazen eski usul oynar). Rastgelelik `rnd()`; belirlenimcilik korunur.

| Kod | Davranış | Kural (özet) | Parametreler |
|---|---|---|---|
| S1 | **Sefer planı (odaklı saldırı)** | 3 turda bir ya da plan geçersizse: her aday hedef `j` (komşu düşman/kabile bölgesi) için `değer = hedef skoru (mevcut P.score) + 0,5·[j oyuncu toprağını ikiye bölen eklem noktası] + 0,4·[j huzursuz]`; `gereken = need · dP(j) · 1,1`; `toplanabilir` = j'ye ≤ 2 adım kendi bölgelerindeki serbest asker (S4 garnizonu düşülür). `toplanabilir ≥ gereken` olan en yüksek değerli `j` seçilir; **toplanma bölgesi** = j'ye komşu en kalabalık kendi bölgen. Sonraki turlarda serbest asker toplanma bölgesine akar (tur başı 1 adım), `hazır ≥ gereken` ya da `musterT` dolunca saldırı; yetmezse plan bırakılır. | `planEvery` 3; `musterT` = Çırak 2 / Kalfa 3 / Usta 4 / Destan 4; `pull` (serbest askerin plana çekilen payı) kişiliğe göre |
| S2 | **Çok yönlü saldırı** | Aynı turda aynı hedefe komşu ikinci/üçüncü bölge, ilk dalga sonrası oran `≥ 0,9·need` ise saldırır (ilk dalga savunmayı eritir). | en çok 3 dalga |
| S3 | **Zayıf cephe tespiti** | Oyuncunun cephe bölgesi için `zayıflık = savunma gücü / (komşu rakip saldırı potansiyeli)`; S1 değerine `+0,6·(1 − min(1, zayıflık))` eklenir. Rakip oyuncunun gerçek askerini görür ama `±D.noise` gürültüyle (Çırak %25 … Destan %5). | `noise` |
| S4 | **Savunma yedeği / başkent koruma** | Her kendi bölgesi için tehdit `Θ(i) = max komşu düşman hazır gücü × saldırı çarpanı`. Garnizon savunma gücü `≥ guard·Θ(i)` tutulur: başkent 1,1, oyuncuya komşu 0,8, diğer cephe 0,5, iç 0. Fazlası "serbest". Başkent tehdit altındaysa yeni alımın tamamı başkente. | `guard` kişiliğe göre ×(0,8-1,2) |
| S5 | **Geri çekilme** | Başkent değilse ve takviyeyle bile `savunma < 0,6·Θ` ise askerin %70'i tehdit altında olmayan komşu kendi bölgesine çekilir (ordu kurtarılır; bölge 1-2 askerle bırakılır). | `retreatP` kişilik |
| S6 | **Karşı saldırı (herkes)** | Rakip bir bölgesini kaybettiği tur ve sonraki tur: o bölgeye komşu kendi kuvveti `≥ counter · garnizon` ise öncelikli geri alma saldırısı (yeni fetihte sur −1 ve huzursuzluk yüzünden oyuncu bölgesi zayıftır). | `counter` 1,05-1,25 |
| S7 | **Bileşim: kuşatma ve süvari** | Plan hedefi surluysa (sur ≥ 2) kuşatma `min(8, 2·sur)` birime kadar; hedef ova/vadi ve köprüsüz nehir yoksa süvari payı %35; tehdit altındaki bölgeye alım okçu %40. Kişilik `mix` ağırlıkları taban olarak kalır, tur eşikleri (okçu 8, süvari 16, kuşatma 24, yeniçeri 34) korunur. | — |
| S8 | **Koalisyon eşgüdümü** | Koalisyon 3 turda bir **ortak hedef** seçer: oyuncu bölgesi, `Σ üye komşu gücü / savunma` en yüksek olan; üyelerin planları buna kilitlenir, saldırılar aynı turda güç sırasıyla. Koalisyon süresi: oyuncu payı `≥ eşik − %5` oldukça sürer (tavan 25 yıl), bekleme 10 → 6 yıl; üyelere gelir ×1,10. | `coalMax` 25 |
| S9 | **Rakipler arası ateşkes** | Oyuncu payı ≥ %45 iken koalisyon dışı rakipler de birbirine saldırmaz (Fırsatçı yalnız zayıflamış bölgeye). | `peaceAt` 0,45 |
| S10 | **Can Havli** | Rakip ≤ 3 bölgeye düşünce: bölgelerine savunma +%20; başkentine tur başı `2 + ⌊tur/25⌋` bedava milis-piyade (T1); biat eşiği değişmez (biat teklifini kabul etmek oyuncuya barışçıl çıkış). | `lastDef` .2 |

#### B.2.4 Oyuncu büyüklüğüne uyum (dengeleyici) — (D)
`s` = oyuncunun toprak payı (vasallar dahil). `Den(s) = clamp(D.balK · 1,25 · (s − 0,30), 0, 0,5)`.
- Kalfa (balK 1,0): s=%40 → +%12,5 gelir; s=%50 → +%25; s ≥ %70 → +%50.
- Ek: oyuncuya `need −0,15·clamp((s−0,30)/0,30, 0, 1)` (s=%60'ta −0,15).
- Arayüzde açık: Güç dengesi paneli "Rakipler senin büyümene karşı birleşiyor: gelir +%25" (gizli hile hissi vermemek için **görünür**).

**[tahmin]** Dengeleyici + S8 + S9 + S10 birlikte %75 → %100 süresini 4-6 turdan 10-15 tura çıkarır.

#### B.2.5 Kişiliklere bağlama (`AIPERS` yeni alanlar)

| Alan | Saldırgan | Tüccar | Savunmacı | Fırsatçı | Klasik |
|---|---|---|---|---|---|
| `eco` (gelir ×) | 1,00 | 1,10 (+liman/kavşak 1,5×) | 0,95 | 1,00 | eski formül |
| Bütçe ordu/gelişim/donanım/sur % | 70/10/15/5 | 45/30/15/10 | 50/15/10/25 | 60/15/15/10 | — |
| `pull` (S1) | 0,70 | 0,40 | 0,30 (yalnız karşı saldırı/Hegemonya hedefi) | 0,60 | 0 |
| `guard` çarpanı (S4) | 0,8 | 1,0 | 1,2 | 0,9 | — |
| `retreatP` (S5) | 0,2 | 0,6 | 0,8 | 0,5 | 0 |
| `counter` (S6) | 1,15 | 1,25 | 1,05 | 1,10 | — |
| Donanım önceliği | silah | dengeli | zırh (savunma D[eq] ×1,05) | silah | — |
| Mevcut alanlar (`need`, `mix`, `score`, `stack`, `vassalAt`…) | korunur | korunur | korunur | korunur | korunur |

Savunmacı'nın oyuncuya "yalnız karşı saldırı" kuralı korunur; S6 onu daha tehlikeli yapar ama saldırganlaştırmaz (D6 kişilik ayrışması hedefi ≥ 2,5 saldırı oranı korunmalı).

#### B.2.6 Zorluk basamaklarına bağlama (`DIFFS` yeni/değişen alanlar; başlangıç değerleri)

| Alan | Çırak | Kalfa | Usta | Destan | Not |
|---|---|---|---|---|---|
| `aiEco` (eski `aiGain` yerine) | 1,15 | 1,60 | 1,85 | 2,05 | Çırak bilerek +%15 (hedef düşürüldü) |
| `aiTech` | 0,9 | 1,0 | 1,1 | 1,2 | |
| `aiBStep / aiBCap` | ,030 / **,40** | ,035 / **,45** | ,040 / **,50** | ,045 / **,55** | tavan düştü: donanım ayrı çarpan |
| `aiEqCap` | 2 | 3 | 4 | 5 | |
| `aiSmart` | 0,35 | 0,65 | 0,85 | 1,00 | S1-S6'nın o tur etkin olma olasılığı |
| `noise` (S3) | 0,25 | 0,15 | 0,10 | 0,05 | |
| `balK` (B.2.4) | 0,8 | 1,0 | 1,25 | 1,5 | |
| `coalAt` | **0,50** (yeni) | 0,35 | 0,33 | 0,30 | Çırak'ta da geç koalisyon |
| `needAdd`, `grace`, `neutral`, `fund`, `res`, `evBias` | aynı | aynı | aynı | aynı | |

**[hesap] geç oyun saldırı çarpanı tavanı:** oyuncu `(1+0,65)·A[5]=2,77`; rakip Kalfa `(1+0,45)·A[3]=2,00`, Destan `(1+0,55)·A[5]=2,60` (bugün 1,55-1,70). Rakip niceliği (ekonomi) + kalitesi (donanım) birlikte büyür; oyuncunun kalite avantajı Destan'da neredeyse kapanır.

### B.3 Hedef eğri ve ölçütler (bot ile ölçülecek)

#### B.3.1 Üç bot
| Bot | Tanım | Rolü |
|---|---|---|
| **B0 Referans** | Bugünkü `sim.js` fetih botu, yeni sistemleri kullanmaz | Gerileme ve eşdeğerlik; "acemi oyuncu" |
| **B1 Kalfa bot** | B0 + yeni sistemler: atölye kur/yükselt, liman/tersane/gemi, balıkhane, ambar, garnizonla huzursuzluk yönetimi | Yeni sistemlerin kullanım payı ve "baskın strateji" testleri |
| **B2 Usta bot (insan vekili)** | B1 + yığınak (iç bölgelerden toplanma bölgesine), birleşik saldırı (2-3 bölgeden aynı hedef), yalnız `ch ≥ 0,65` ve `kayıp tahmini ≤ %40` ile saldırı, cephe garnizonu `≥ 0,9·komşu düşman hazır gücü`, yeni fetihte garnizon `≥ G`, öncelik zayıf rakip başkentleri | **Zorluk hedeflerinin ölçüldüğü bot** |

**B2'nin geçerlilik şartı:** 0.10.0 kodunda (değişiklikten önce) B2, Kalfa'da B0'dan en az +20 puan kazanmalı (ör. B0 %46 → B2 ≥ %66). Sağlamazsa B2 insan vekili sayılmaz, önce B2 güçlendirilir. Bu ölçüm G1'in **ilk** işidir.

#### B.3.2 Kazanma hedefleri (Normal boy, Kıta, Klasik + hanedanlar ortalaması, 96 tohum)

| Zorluk | B2 hedef (ana) | B0 beklenen | Gerekçe |
|---|---|---|---|
| Çırak | **%65-75** | %45-60 | Öğrenme basamağı; kaybetmek mümkün olmalı, bugün %92 (B0) zaten "kayıpsız" |
| Kalfa | **%35-45** | %20-30 | Varsayılan; deneyimli oyuncu "yarı yarıya, emekle" |
| Usta | **%15-25** | %8-15 | Ustalık sınavı |
| Destan | **%5-10** | %2-6 | Efsane; bot neredeyse hep kaybetmeli, insan iyi oyunla kazanabilmeli |

Kullanıcıdan önerilen bantlar korunmuştur; B0'ın bunun 10-15 puan altında kalması beklenir (B0 erken oyun hatalarıyla kaybeder). Hanedan bandı: her hanedan Kalfa'da B2 hedefinin ±10 puanı içinde (bugünkü %35-65 bandının daraltılmışı).

#### B.3.3 "Kartopu kırılma" ölçütleri (Kalfa, B2, 96 tohum)

| # | Ölçüt | Bugün (B0) | Hedef |
|---|---|---|---|
| K1 | P(kazanma \| %50 toprağa ulaştı) | ~%95-100 **[ölçüm, küçük örnek]** | **≤ %90** (Kalfa), ≤ %95 (Çırak), ≤ %80 (Usta) |
| K2 | P(kazanma \| %25 toprağa ulaştı) | %77 **[ölçüm 1b]** | ≤ %65 |
| K3 | %75 → %100 süresi (medyan) | 4-6 tur | **10-18 tur** |
| K4 | %50'ye ulaştıktan sonra rakibe ≥ 1 bölge kaybedilen oyun | ölçülmedi | ≥ %60; ≥ 3 bölge ≥ %30 |
| K5 | Kayıpların t60 sonrasındaki payı | medyan kayıp t51 | ≥ %35 |
| K6 | Kaybedilen oyunlarda en yüksek toprak payı ≥ %35 olanların oranı ("geri dönüş") | ~%9 (t25 sonrası kayıp) | ≥ %25 |
| K7 | Oyun uzunluğu (Normal) | ort. 74-85, kazanılan 81-101 | ort. ≤ 150, kazanılan **95-135**; Kısa ≤ 100; Uzun ≤ 200 (maxTurns 240/280 korunur, bitmeyen ≤ %5) |
| K8 | Kıtlık / hazine boşluğu | 2/5.193 tur **[ölçüm]** | En az bir sıkıntı turu yaşanan oyun %30-60; sıkıntı turu ≤ %4 |
| K9 | Atıl kaynak (stok ÷ net gelir medyanı, t15-60) | demir 27 | her kaynak ≤ 10 |
| K10 | "İkinci büyük güç": bir rakibin bir an ≥ %25 toprağa ulaştığı oyun | ölçülmedi | ≥ %40 |
| K11 | Rakip geri alma: oyunda en az bir kez oyuncunun aldığı bölgeyi 3 tur içinde geri alan rakip | ölçülmedi | ≥ %50 oyun |

K1-K3 birincil; diğerleri gözlem. **Yeni sim çıktıları:** satıra `peak` (en yüksek pay ve turu), `lostAfter50` (t50 sonrası kaybedilen bölge), `recap` (S6 geri alma sayısı), `aiPeak` (en yüksek rakip payı), `short` (sıkıntı turları), `idleRes` (kaynak başına stok/gelir), `t75to100`.

---

## C. Atölyeler ve donanım hiyerarşisi

### C.1 Model seçimi: ülke düzeyinde "donanım envanteri"
Üç aday düşünüldü:

| Model | Artı | Eksi | Karar |
|---|---|---|---|
| (a) Birim başına kademe (`u:{piy:{0:5,3:12}}`) | En gerçekçi | Bütün `u`/`rd`/`takeProp`/savaş/kayıt kodu değişir; (Y+) | ret |
| (b) Bölge düzeyinde stok | Lojistik derinliği | Asker taşırken envanter taşıma mikro yönetimi; önizleme karmaşık | ret |
| **(c) Ülke düzeyinde envanter + ortalama kademe** | Savaş hesabı O(1); `u` yapısı değişmez; ölçmesi kolay (kapsama %, ortalama kademe) | Batıdaki ordu doğuda dövülen kılıcı kullanır (soyutlama: "ikmal") | **seçildi** |

**Veri:** `S.eq = {kilic:{n,q}, yay:{n,q}, zirh:{n,q}}`. `n` = envanterdeki/kuşanılmış donanım sayısı, `q` = kademe toplamı; ortalama kademe `T̄ = q/n`. Donanım askere "bağlıdır": asker ölünce donanımı da gider (orantılı: `n` ve `q` aynı oranda düşer), terhis edilince depoya döner.

**Kim ne kuşanır:**

| Birim | Silah (saldırı çarpanı) | Zırh (savunma çarpanı) | Kural |
|---|---|---|---|
| 🗡️ Piyade | Kılıç | Zırh | Kılıç yoksa **milis** |
| 🏹 Okçu | Yay | Zırh | Yay yoksa milis |
| 🐎 Süvari | Kılıç (öncelikli) | Zırh | **Kılıçsız yetiştirilemez** (seçkin) |
| ⚔️ Yeniçeri | Kılıç **T̄ ≥ 3 depodan** (öncelikli) | Zırh (öncelikli) | Kılıç T3+ ve Zırh T2+ yoksa yetiştirilemez |
| 🪨 Kuşatma | — | — | Donanım kullanmaz (gücü Kuşatma dalından) |

Kapsama: `cov_k = min(1, n_kind_ayrılmış / asker_türü)`. Öncelik sırası: Yeniçeri → Süvari → Piyade (kılıç); zırhta Yeniçeri → Süvari → Okçu → Piyade. Seçkin birlikler her zaman kapsanmış sayılır (yetiştirme kuralı bunu garanti eder).

### C.2 Güç hiyerarşisi (oranlı ve azalan getirili)

| Kademe | Ad | Silah A (saldırı ×) | Zırh D (savunma ×) | Bileşik √(A·D) | Kit maliyet çarpanı KF | Bileşik kazanç / kaynak (T0'a göre) **[hesap]** |
|---|---|---|---|---|---|---|
| T0 | Milis (donanımsız) | **0,70** | 1,00 | 0,84 | 0 | — |
| T1 | Kaba demir | 1,00 | 1,08 | 1,04 | 1,0 | 0,14 |
| T2 | Dövme | 1,20 | 1,16 | 1,18 | 1,4 | 0,17 |
| T3 | Çelik | 1,38 | 1,24 | 1,31 | 1,9 | 0,17 |
| T4 | Şam çeliği | 1,54 | 1,31 | 1,42 | 2,5 | 0,16 |
| T5 | Usta işi (mühürlü) | 1,68 | 1,38 | 1,52 | 3,2 | 0,15 |

- Artışlar azalır (+0,30, +0,20, +0,18, +0,16, +0,14), kit fiyatı geometrik artar → **maliyet başına güç T2-T3'te tepe yapıp düşer** (bilinçli: herkes T5'e koşmasın; T5 son oyun lüksü).
- Zırh yokluğu ceza değil (savunmada milis 1,00): evini savunan köylü sopayla da savunur; ceza yalnız silahsız **saldırıda**. Bu, erken oyun savunmasını bugünküyle aynı tutar.
- **Oranlı hiyerarşi:** birlik türleri arası oran kademeden bağımsız korunur (aynı kademede Yeniçeri/Piyade saldırı = 2,2). En kötü Yeniçeri (T3 silah) saldırısı `2,2·1,38 = 3,04` > en iyi Piyade (T5) `1,68`: seçkin birlik her zaman üstte. En iyi Piyade (1,68) ≈ T1 Süvari (1,70): kalite niceliği yakalar ama seçkini geçmez.
- **Mevcut "demir donanımı" ile birleşme (çifte sayım yok):** `atkParts` içindeki "⚒️ Silah donanımı (cov·equip)" satırı ve saldırı başına `n·iron` demir harcaması **kaldırılır**. Eski tam donanım (+%25-35) ≈ yeni T2 (×1,20) kapsamı. Saldırı dalı metinleri değişir: Demircilik "Saldırı +%10; Demirhane ve Yayhane Sv.3"; Çelik Dövme "Saldırı toplam +%25; atölye Sv.4; kit demiri −%15". Okçuluk/Taş İşçiliği/Hendekler Zırhhane Sv.3/4/5 kapısı olur.
- Hanedan/kart karşılıkları: **Tunç** `equipAdd .1` + `iron .22` → "kit demiri ×0,75, Demirhane +1 kit/tur, A[T] +0,05". **Demir Kıtlığı** `iron .18` → "kit demiri ×0,7" (demir verimi ×0,6 kalır). **Dökümhane** (Yeniçeri Ordugâh'ta) korunur; Yeniçeri kılıç kuralı T3 → Tunç'ta T2.

**Savaş formülündeki yeri:** `uAtk(k,…)` sonucu `× eqA(o,k)`, `rawDef` birim terimi `× eqD(o,k)`:
- Oyuncu: `eqA = cov·A[T̄] + (1−cov)·A[0]` (T̄ kesirli olabilir; tablo doğrusal aradeğerlenir). `eqD` aynı, zırhla.
- Rakip: `A[ai.eq]`, `D[ai.eq]`; kabile `A[1]`, `D[1]`.
- Önizleme (`previewAtk`) ve saldırı penceresi yeni satırları gösterir: "⚒️ Kılıç T2,4 · kapsama %80 (milis 12)".

### C.3 Atölye türleri, girdiler ve kademeler

Atölye bir **bölge yapısıdır** (`r.ws = [{t, lv, on}]`), tesis yuvası kullanmaz; askeri kuruluşa bağlı ayrı **atölye yuvası** kullanır: Karakol 1 · Kışla 1 · Talimhane 2 · Ordugâh 2 · Harbiye 3. Askeri kuruluşu olmayan bölgede atölye olmaz. (Tesis yuvasını kullanmak daha sert bir ikilem olurdu; kullanıcı sorusu G2.)

| Atölye | Ürettiği | Kit girdisi (T1; × KF[T]) | Kurma | Kapı Sv.3 / Sv.4 / Sv.5 |
|---|---|---|---|---|
| ⚒️ **Demirhane** (kılıç) | Kılıç | demir 0,50 · odun 0,15 | taş 25 · odun 20 · demir 10 · altın 15 | Saldırı I / II / III |
| 🏹 **Yayhane** (yay-ok) | Yay | odun 0,60 · demir 0,05 | odun 30 · taş 15 · altın 15 | Saldırı I / II / III |
| 🛡️ **Zırhhane** (zırh-kalkan) | Zırh | demir 0,60 · odun 0,20 | taş 30 · odun 15 · demir 20 · altın 20 | Savunma I / II / III |

Ortak kurallar:
- **Kademe kapısı:** Sv.2 Kışla, Sv.3 Talimhane + dal I, Sv.4 Ordugâh + dal II, Sv.5 Harbiye + dal III (bölgenin kendi kuruluşu).
- **Yükseltme maliyeti:** kurma × `L^1,3` → Sv.2 ×2,46, Sv.3 ×4,17, Sv.4 ×6,06, Sv.5 ×8,10. Demirhane Sv.1→5 toplam ≈ 1.530 kaynak **[hesap]** (t60 oyuncusunun ~8 turluk toplam geliri). Harbiye (215) bunun yanında ucuz kalır: bilinçli, çünkü atölye **kaliteyi** satar, kuruluş **erişimi**.
- **Üretim hızı (kit/tur, kademesi = atölye seviyesi):** Sv.1 4 · Sv.2 6 · Sv.3 8 · Sv.4 10 · Sv.5 12. Girdi yetmezse ödenebildiği kadar üretir. Huzursuz bölgede durur.
- **İşçi ve bakım (çalışırken):** işçi `3·L` nüfus (bölgenin `workforce` hesabında çalışan sayılır: `pop_eff = pop − işçi`); ücret altın `0,4·L` + tahıl `0,4·L`/tur. Atölye kapatılabilir (`on:false`: bakım yok, üretim yok).
- **Yeniden dövme:** envanterdeki herkes kuşanmışsa (`n ≥ asker`) atölye boş kapasitesiyle en düşük kademeli kitleri yeniler: yeni kit maliyeti, eski kitin %30'u hurda olarak demir/odun iade.
- **Ganimet:** kazanılan saldırıda öldürülen düşmanın %15'i kadar Kılıç (T1) envantere eklenir; fethedilen bölgede rakip `eq` kademesinde 0,5·(dev+1)·5 kit (silah) bulunur.
- **Başlangıç:** başlangıç ordusu T1 Kılıç/Yay ile gelir (zırh yok); başkente **Demirhane Sv.1 ücretsiz** (Karakol'a bağlı). Böylece erken oyunda otomatik üretim (Karakol 2/tur) milis üretmez. Sürgün Bey: Demirhane yok.

**Örnek talep [hesap]:** t50 oyuncusu tur başı ~10 yeni asker + ~4 kayıp yenilemesi: Kılıç T2 14 × (0,70 demir + 0,21 odun) = 9,8 demir + 2,9 odun; Zırh T2 10 × 0,84 = 8,4 demir. Toplam ≈ 18 demir/tur → bugünkü 5,6-10 demir/tur gelirin **2-3 katı**: Demir Madeni kurmak ve maden bölgesi fethetmek anlam kazanır (demir artık atıl değil; K9).

**Maliyet–güç karşılaştırması [hesap]:** 1 piyade = 5 kaynak + 0,25/tur bakım (20 turda ~10) → saldırı gücü/kaynak ≈ 0,10. T2 Kılıç kiti = 0,91 kaynak → T0'a göre +0,50 saldırı → 0,55/kaynak (atölye yatırımı hariç); atölye kapasitesi sınırlı olduğundan nicelik ve nitelik birlikte gerekir. Bu oran ilk ölçümde baskın çıkarsa (B1'de "yalnız donanım" varyantı ≥ referans +15 puan) KF ×1,3.

### C.4 Rakip donanımı
B.2.2'deki gibi: rakip `eq` kademesi (akçe yatırımı, `aiEqCap` ile sınırlı), bütün ordu o kademede. Kişilik önceliği: Saldırgan/Fırsatçı silah, Savunmacı zırh (savunma ×1,05). **[tahmin]** Kalfa rakibi T2'ye ~t30, T3'e ~t50'de ulaşır; oyuncu Demirhane Sv.3'e Talimhane + Demircilik ile ~t35-45'te. Böylece kalite yarışı oyun ortasında başa baş.

### C.5 Arayüz notları
- **Bölge → Ordu sekmesi:** "Atölyeler (1/2 yuva)" kartı: her atölye satırı `[ikon] Demirhane Sv.2 · 6 kit/tur · girdi ⚒️4,2 🪵1,3 · işçi 6 · [Yükselt (maliyet)] [Durdur]`.
- **Ordu sekmesi (ülke):** "Donanım deposu" tablosu: Kılıç / Yay / Zırh → `n`, ortalama kademe, kapsama çubuğu (yeşil = kuşanmış, gri = milis), üretim/tur, tur başı talep tahmini ("12 tur sonra milis" uyarısı).
- **Asker satırı:** birlik ikonunun sağ altında küçük kademe rozeti (Roma rakamı I-V; milis için soluk "—").
- **Saldırı penceresi:** güç dökümüne "Donanım" satırı; düşman kademesi Casusluk ile görünür, Haritacılıkla "~T2".
- **Alım düğmesi:** kit yoksa "Milis olarak yetiştir (saldırı ×0,70)" ikincil uyarı; bölge ayarı "Yalnız donanımlı yetiştir" (otomatik üretim kit yoksa durur).

---

## D. Liman, tersane, gemi, dış ticaret, balıkçılık

### D.1 Liman kenti ve Liman genişletme — (O)
- **Liman kenti** = kıyı bölgesi (`MAP.regions[i].coast`). Haritadaki `FEAT.liman` bölgeleri "doğal liman"dır: Liman Sv.1 yarı fiyata, kapasite +2, ticaret ×1,15. (Körfez haritasında iç deniz kıyısı da kıyıdır.)
- Liman ve Tersane **kıyı yuvası** kullanır (tesis yuvasından ayrı; her kıyı bölgesinde 1 kıyı yuvası = Liman, Tersane onun içinde bir yapı).
- Mevcut `FEAT.liman` geliri (altın +2, tahıl +2) korunur.

| Liman Sv. | Gemi kapasitesi (yuva) | Maliyet | Kapı |
|---|---|---|---|
| 1 İskele | 2 | odun 25 · taş 25 · altın 20 | — |
| 2 Liman | 4 | odun 30 · taş 40 · altın 30 | Liman Sv.1 |
| 3 Büyük Liman | 6 | odun 50 · taş 80 · altın 40 | Loncalar (İkmal II) |
| 4 Mendirekli Liman (azami) | 8 | odun 70 · taş 120 · altın 60 · demir 20 | Ticaret Yolları (İkmal IV) |

Doğal limanda kapasite +2 (azami 10). Liman seviyesi düşerse (fetihte −1) fazla gemi en yakın kendi limanına gider, yer yoksa satılır (maliyetin %30'u).

### D.2 Tersane ve gemiler — (O)
**Tersane** liman kentinde, seviyesi ≤ Liman seviyesi:

| Tersane Sv. | Açtığı gemi | Maliyet | İşçi (inşa sırasında) | Ücret/tur (inşa; boşta %50) |
|---|---|---|---|---|
| 1 Kızak | Çektiri | odun 30 · taş 20 · altın 20 | 4 | tahıl 0,5 · altın 0,3 |
| 2 Tersane | Karamürsel | odun 40 · taş 20 · altın 30 | 8 | tahıl 1,0 · altın 0,6 |
| 3 Tersane-i Âmire | Kadırga | odun 60 · taş 30 · altın 40 | 12 | tahıl 1,5 · altın 0,9 |
| 4 Kalyon Havuzu | Kalyon | odun 90 · taş 40 · altın 60 · demir 20 | 16 | tahıl 2,0 · altın 1,2 |

Tersane aynı anda 1 gemi yapar (inşa süresi boyunca maliyet peşin ödenir; yarıda kalırsa %50 iade).

| Gemi | Yük `Y` | Yuva | Maliyet (çok pahalı) | Süre | Tayfa (nüfus, kalıcı) | Bakım/tur | Fırtına kaybı/tur | Özel |
|---|---|---|---|---|---|---|---|---|
| ⛵ Çektiri | 1 | 1 | odun 35 · altın 20 · demir 5 (60) | 3 | 3 | tahıl 0,8 · altın 0,4 | %0,8 | — |
| 🚢 Karamürsel | 2 | 1 | odun 70 · altın 45 · demir 15 (130) | 4 | 5 | tahıl 1,5 · altın 0,8 | %0,6 | — |
| ⚓ Kadırga | 2 | 1 | odun 100 · altın 70 · demir 40 (210) | 5 | 10 (kürekçi) | tahıl 2,5 · altın 1,2 | %0,4 | **Refakat:** limanın korsan riskini −%50 (2 kadırga = 0) |
| 🛳️ Kalyon | 5 | 2 | odun 180 · altın 120 · demir 60 · taş 20 (380) | 6 | 12 | tahıl 3,0 · altın 2,0 | %0,3 | 4 yük başına +1 bilgi/tur (uzak diyar kitapları) |

Tayfa gemiye binince bölge nüfusundan düşer, gemi batarsa kaybolur, satılırsa geri döner. **[hesap]** 50 turda fırtınada batma olasılığı: Çektiri %33, Karamürsel %26, Kadırga %18, Kalyon %14.

### D.3 Dış ticaret geliri — (O)
Bütün gemilerin toplam yükü `Ytot`. Ülkenin dış ticaret altını:

`ticaret = min( TG · Σ(Y_s · R_s) / (1 + Ytot/YK) ,  0,6 · ticaret dışı brüt altın )`

- `TG = 6` altın/yük, `YK = 30` (rota doygunluğu: aynı limanlara giden gemi arttıkça fiyat düşer).
- `R_s` liman çarpanı: doğal liman ×1,15; ticaret ağı +%5 her ek kendi liman kenti (en çok +%20); **abluka** (savaştaki bir rakip komşu kıyı bölgesine sahipse) ×0,75, Tüccar rakipse ×0,60; huzursuz bölgede ×0,5. Taşra verimi (B.1.2) uygulanmaz.
- **Tavan** `0,6 × ticaret dışı brüt altın` (Pazar, arazi, başkent, kavşak, liman özelliği): "dış ticaret iç pazarın malını satar". Ticaret Pazar'ın **yerine** değil **üstüne** gelir; hiyerarşi bu tavanla korunur.
- Ekonomi panelinde satır: "⚓ Dış ticaret 32 (tavan 33, doygunluk %79)".

**Toplam ticaret altını [hesap]** (R=1): Ytot 2 → 11,2 · 4 → 21,2 · 8 → 37,9 · 12 → 51,4 · 16 → 62,6 · 24 → 80,0. t60 oyuncusunun ticaret dışı brüt altını ~55 **[tahmin]** → tavan ~33 ≈ 7-8 yük: pratik tavan 2 liman kentinde 4 Karamürsel ya da 1 Kalyon + 2 Karamürsel.

**Marjinal gemi getirisi (net = brüt artış − bakım; geri ödeme = maliyet / net) [hesap]:**

| Gemi | Diğer yük 0 | 4 | 8 | 16 |
|---|---|---|---|---|
| Çektiri | 4,6 / 13 tur | 3,3 / 18 | 2,4 / 25 | 1,3 / 46 |
| Karamürsel | 8,9 / 15 | 6,5 / 20 | 4,8 / 27 | 2,6 / 50 |
| Kadırga | 7,5 / 28 | 5,1 / 41 | 3,4 / 62 | 1,2 / 176 |
| Kalyon | 20,7 / 18 | 15,4 / 25 | 11,5 / 33 | 6,5 / 58 |

**Paket geri ödemesi (altyapı dahil) [hesap]:**

| Paket | Yatırım | Net/tur | Geri ödeme |
|---|---|---|---|
| Liman 1 + Tersane 1 + 2 Çektiri | 260 | 8,3 | **31 tur** |
| Liman 2 + Tersane 2 + 2 Karamürsel | 590 | 15,6 | **38 tur** |
| Liman 3 + Tersane 2 + 4 Karamürsel | 1.020 | 27,7 | **37 tur** |
| + Tersane 3 + 1 Kalyon (yerine 2 Karamürsel) | 1.270 | 29,4 | 43 tur |

**Pazar ile karşılaştırma [hesap]:** Pazar Sv.1 kurma geri ödemesi erken oyunda (4 tesis) 22 tur, oyun ortasında (15 tesis, `newFieldCost` ×4) **48 tur**; Sv.1→2 27 tur. Gemi paketleri oyun ortasında Pazar'dan **~1,3-1,5× hızlı** geri öder (hedef 1,3-1,6×) ama erken oyunda Pazar daha iyidir; doygunluk ve tavan nedeniyle 8 yükten sonra gemi Pazar'ın gerisine düşer. Yani ticaret orta oyunun yatırımı, ölçeklenen bir motor değil.

**Riskler ve olaylar:**
- **Korsan baskını** (sistem olayı): ≥ 2 gemili limanda tur başı %2 (Usta %3, Destan %4); kadırga refakati olasılığı yarıya indirir. Sonuç: o limanın 3 turluk ticareti kaybolur ya da (yarı olasılıkla) bir Çektiri/Karamürsel ele geçer. Seçimli olay "Korsan Reisi": haraç ver (−40 altın, 15 tur bağışıklık) / donanma topla (−1 kadırga yapım hakkı, korsan yuvası kabile bölgesine +%10 ganimet) / yok say.
- **Fetih:** liman kenti düşerse gemilerin yarısı düşmana geçer (rakipte akçe olarak maliyetin %60'ı), kalanı en yakın kendi limanına kaçar (yer yoksa batar). Oyuncu rakip limanı alırsa rakip "filo"su ganimet: +30 altın × rakibin o limandaki ticaret seviyesi.
- **Askeri sonuç: yok** (Faz 2 kapsamı). Gemi asker taşımaz, deniz savaşı yok; kadırga yalnız refakat. Deniz komşuluğu (Takımada) Faz 1 notundaki gibi ayrı iş.

### D.4 Rakiplerin ticareti
Rakip gemi yapmaz (akçe modeli, B.2.1): liman bölgesi başına +2 akçe (Tüccar ve Deniz Beyleri), ticaret kavşağı +3; Tüccar kişiliğinin mevcut "Liman/Kavşak başına kazanç +1 (≤ +4)" kuralı bu terime dönüşür. Tüccar rakip abluka çarpanını ×0,60 yapar (oyuncunun ticaretine zarar veren tek rakip).

### D.5 Balıkçılık — (D)
Yeni tesis **Balıkhane** (`FIELD.balik`, nehirde "Dalyan" adıyla gösterilir):

| Alan | Değer |
|---|---|
| Kaynak | 🌾 tahıl (`r:'tahil'`) |
| `base` | 2,5 |
| Kurma / kuruluş (`fund`) | tahıl 15 · odun 15 / 90 |
| Yeterlilik | kıyı bölgesi **ya da** Nehir Vadisi arazisi **ya da** komşusuyla arasından nehir geçen bölge (`MAP.cross` içinde bölgenin bir kenarı) |
| Verim (`eff`) | kıyı 1,3 · doğal liman 1,6 · vadi/nehir 1,0 · diğer nehir kenarı 0,8 |
| Ek | Liman Sv.≥2 ×1,15; kıyıda Sv.3+ her seviye +0,3 altın (tuzlama) |
| Azami nüfus | +3 / seviye (tarla +6) |
| Etkileşimler | Sulama (+%25 tarla) ve Kıtlık Yılı (tarla −%20/−%25) **etkilemez**; Kıtlık Çağı kartında balık yedek gıda olur. `workforce` ve taşra verimi uygulanır. |

**[hesap]** Sv.1 üretim: kıyı ormanı 3,25 tahıl (tarla 1,8) · doğal liman 4,0 · kıyı ovası 3,25 (tarla 4,5) · nehir vadisi 2,5 (tarla 4,8). Balık tarlayı yalnız orman/dağ/tepe kıyılarında geçer: tahıl dağılımını çeşitlendirir, tarlanın yerini almaz. Bot ağırlığı `wNew.balik 1,2`.

---

## E. Renkli kaynak ikonları (ikon şartnamesi)

### E.1 Sorun
- Arayüzde kaynaklar iki yolla görünüyor: üst çubukta tek renkli SVG glif (`ic()`, renk `--r-*` token'ı) ve **metin içinde emoji** (`RES.e`: `costTxt`, `lootLine`, günlük, olay seçenekleri, ipuçları). Emoji işletim sistemine göre çizilir: 🧱 kırmızı **tuğla** (taş değil), ⚒️ gri çekiç-kazma (demir değil), 🪵 bazı sistemlerde soluk; parşömen üstünde renk kimliği yok, deri üstünde kaybolabiliyor.
- Glif şekilleri de belirsiz: `i-demir` bir **örs** (demir kaynağı değil, yeni Demirhane'nin simgesi olmalı), `i-tas` tuğla örgüsü, `i-odun` iki yuvarlatılmış çubuk.

### E.2 Kural
1. **HTML'de emoji yok:** altı kaynak her yerde `ric(k)` (renkli SVG) ile çizilir. `costTxt`, `lootLine`, ekonomi, saldırı/ganimet tabloları, olay seçeneği açıklamaları (`d:` metinlerindeki emoji, çizim anında `RES_EMOJI_RE` ile SVG'ye çevrilir; kayıttaki günlük metni değişmez). Emoji yalnız düz metin çıktısında kalır (panoya kopyalanan sonuç kartı, `aria-label` yerine ad kullanılır: "12 odun").
2. **İki tonlu ikon:** her kaynak simgesinde iki boya: `--ic1` **siluet** (zemine karşı ≥ 3:1) ve `--ic2` **iç ayrıntı** (silüete karşı ayırt edilir, kontrast şartı yok) + ortak `--ink` ince dış çizgi (yalnız 48 px'te). `<symbol>` içindeki yollar `fill="var(--ic1)"` / `fill="var(--ic2)"`; özel değişkenler `<use>` gölge ağacına miras geçer, ek JS gerekmez.
3. **Yüzeye göre takas:** parşömende koyu siluet + açık ayrıntı, deride (`header`, `#mapWrap`, `.foot`) açık siluet + koyu ayrıntı. Mevcut `--r-*` token'ları siluet olarak kalır (değerleri zaten iki yüzeyde tanımlı); yeni `--r-*-2` ayrıntı token'ları eklenir.
4. **Şekil kimliği renkten bağımsız** (renk körü kipi): her kaynağın silueti tek başına tanınır.

### E.3 Palet (siluet kontrastı ölçüldü [hesap: WCAG göreli parlaklık])

| Kaynak | Parşömen siluet `--r-*` | bg-1 / bg-3 | Parşömen ayrıntı `--r-*-2` | Deri siluet | deri / deri-3 | Deri ayrıntı |
|---|---|---|---|---|---|---|
| 🌾 Tahıl | `#4F6B1E` (sap yeşili) | 4,51 / 3,72 | `#D6A928` (başak altını) | `#B9CB7A` | 8,92 / 6,15 | `#5E7A1A` |
| 🪵 Odun | `#7A4A1E` (kabuk kahvesi) | 5,51 / 4,54 | `#E2B77A` (kesit, halkalar siluet renginde) | `#D3A06B` | 6,77 / 4,67 | `#8A5A2B` |
| 🧱→ Taş | `#5F574A` (arduvaz grisi) | 5,28 / 4,35 | `#9C958A` (yontu yüzeyi) | `#C2B9AA` | 8,12 / 5,60 | `#7E776B` |
| ⚒️→ Demir | `#2D5A84` (çelik mavisi) | 5,36 / 4,41 | `#A9C8E6` (parıltı şeridi) | `#92B6D8` | 7,44 / 5,13 | `#3E6E99` |
| 🪙 Altın | `#80600F` (eski altın) | 4,33 / 3,57 | `#F0CF6A` (sikke yüzü) | `#E9C55A` | 9,46 / 6,52 | `#A47A12` |
| 📜 Bilgi | `#5B4597` (lacivert-mor kurdele) | 5,68 / 4,68 | `#E9DDC1` (kâğıt) | `#B9A6E8` | 7,27 / 5,01 | `#7A64B8` |
| 🐟 Balık (yeni) | `#1F6E78` (deniz camı) | 4,38 / 3,61 | `#A8DCE2` | `#7CC6CF` | 8,14 / 5,61 | `#2E8792` |
| ⚔️ Donanım (yeni) | `#6B2F2A` (deri kını) | 7,54 / 6,21 | `#B8BEC6` (çelik ağız) | `#D98A7A` | 5,91 / 4,07 | `#8A3B33` |
| ⛵ Gemi (yeni) | `#244E73` (gece mavisi) | 6,46 / 5,32 | `#F3E7CC` (yelken) | `#9DB9D6` | 7,77 / 5,36 | `#7A4A1E` (gövde) |

Hepsi iki yüzeyin her iki tonunda ≥ 3:1 (en düşük 3,57: altın/bg-3). Yüksek kontrast kipinde siluet `--tx-1`, ayrıntı `--bg-1` (tek renk + delik), renk körü kipinde aynı palet (renk tek kimlik değil).

### E.4 Şekil şartnamesi (24 px ızgara, 2 px güvenli kenar)

| İkon | Siluet | Ayrıntı (`--ic2`) | 16 px sade sürüm |
|---|---|---|---|
| `i-odun` | Üst üste iki yatay kütük, sol uçları kesik daire (çap 7) | Kesitlerde 2 halka (1 px siluet renginde), sağ uçta kabuk çentiği | halkalar kalkar, tek kütük + kesit |
| `i-tas` | Üçgen yığın: altta 2, üstte 1 **yontulmuş blok** (köşeleri 1,5 px pahlı, tuğla değil) | Her bloğun üst yüzü açık ton (ışık) | 2 blok |
| `i-demir` | **Külçe**: yamuk prizma (alt 18 px, üst 12 px), yan yüz görünür | Üst yüzde çapraz parıltı şeridi; yan yüz siluet | yamuk + şerit |
| `i-tahil` | 3 sap, ortada demet bağı | Başak taneleri (altın) | 1 başak |
| `i-altin` | İki üst üste sikke (önde tam, arkada yarım) | Ön sikke yüzü açık ton, ortada küçük mühür | tek sikke |
| `i-bilgi` | Rulo parşömen + kurdele | Kâğıt yüzü açık ton, 2 satır çizgi | rulo |

Yeni ikonlar (aynı kural):
- **Donanım:** `i-kilic` (kınında kılıç, çapraz balçak), `i-yay` (gerili yay + ok), `i-zirh` (yuvarlak kalkan + pul zırh deseni), `i-milis` (sopa/yaba; soluk tek ton).
- **Atölyeler:** `i-demirhane` (bugünkü örs glifi taşınır + çekiç), `i-yayhane` (tezgâhta yay), `i-zirhhane` (kalkan + örs).
- **Kademe rozeti:** `i-kademe` (küçük şerit, içinde I-V; 12 px'te okunur).
- **Deniz:** `i-liman` (mevcut, korunur), `i-liman-genislet` (mendirek + yukarı ok), `i-tersane` (kızak üstünde kaburgalı tekne iskeleti), `i-cektiri` (tek küçük üçgen yelken), `i-karamursel` (tek büyük kare yelken), `i-kadirga` (kürek sırası + kısa direk), `i-kalyon` (3 direk, kale güverteli), `i-ticaret` (yelken + sikke), `i-korsan` (kara flama), `i-balik` (balık + dalga çizgisi).
- **Ekonomi:** `i-ambar` (kubbeli taş ambar), `i-divan` (mühürlü ferman; idare yükü), `i-huzursuz` (kıvılcımlı meşale; huzursuzluk).

**Okunurluk kabulü:** 16, 24 ve 48 px'te parşömen ve deri zeminde ekran görüntüsü; 6 kaynak ikonu yan yana gri tonlamada (renk kaldırılınca) ayırt edilebilmeli; 5 kişilik "hangi kaynak?" testi (rozetsiz, yalnız ikon) ≥ %90 doğru (özellikle taş/demir karışmamalı). `docs/ikon-onizleme.html` iki yüzeyli ızgarayla güncellenir.

---

## F. Uygulama planı ve test planı

Sıra: **G1 → G2 → G3**, G4 (ikonlar) mantıktan bağımsız olduğu için **G1 ile paralel** başlayabilir (görsel işi yapan ajanla eşgüdüm: `index.html` sprite ve CSS token bölgesi tek elden değişmeli). Her aşama ayrı sürüm, ayrı taban çizgisi.

### G1 — Zorluk ve ekonomi dengesi (sürüm 0.11.0, (Y))
**Kod bölgeleri:**
- `DIFFS` (yeni alanlar B.2.6; `aiGain` → `aiEco`), `AIPERS` (B.2.5 alanları), `cfgFx` (`aiGain` kart çarpanı `aiEco`'ya uygulanır).
- `aiTurn` yeniden yapılanır: `aiIncome(f)`, `aiUpkeep(f)`, `aiBudget(f)`, `aiBuy(f,budget,plan)`, `aiDevelop(f)`, `aiPlan(f)` (S1/S3), `aiGuard(f)` (S4), `aiRetreat(f)` (S5), `aiCounter(f)` (S6), `aiAttack(f)` (S2 dalgaları; mevcut döngü), `aiMove(f)` (toplanma bölgesine akış; mevcut BFS genelleşir). `aiMix` hedefe göre ağırlık alır (S7). `aiB(f)` `tp`'den okur.
- `updateCoal` (S8: süre/bekleme, ortak hedef `S.coal.tgt`), yeni `aiPeace()` (S9), `canHavli(f)` (S10), `balance()` (B.2.4).
- Oyuncu: `economy()` (idare, `up.altin`), `production(i)` (taşra × huzur), `conquer()` (`r.unr`, rakip `dev` ganimeti), `lootRate` (savaş yorgunluğu), `endTurn` (stok tavanı/çürüme, isyan zarı, `unr` azalması), `FIELD.ambar`, `newFieldCost` (B.1.7), `EVENTS` İsyan ağırlığı.
- Arayüz: ekonomi dökümü (Divan gideri, taşra, huzursuzluk, çürüme), bölge paneli huzursuzluk çubuğu + garnizon ihtiyacı ("Garnizon 6/9 · isyan %2/yıl"), stok çubuğunda tavan çizgisi, Güç dengesi panelinde dengeleyici satırı, rakip satırında hazine/donanım (Casusluk ile).

**Kayıt:** `SAVE_VER 8 → 9`, `MIG[8]`: `S.ai[f].h = 30 + 12·n_f`, `tp = 4·⌊tur/4⌋·(n_f/7,5)` yaklaşığı, `eq = min(aiEqCap, 1 + ⌊tur/20⌋)`, `plan = null`; bütün `r.dev = 0`, `r.unr = 0`; `S.cfg.rules = 2`. **Eski oyunlar yeni kurallara geçer** (kullanıcı zorluk istedi), ilk açılışta bir kez bildirim: "Kurallar güncellendi: rakipler artık ekonomiyle güçleniyor; büyük imparatorluğun Divan gideri var." Eşdeğerlik için `cfg.rules = 1` yolu (eski `aiTurn`, frensiz oyuncu) yalnız `?test=1` ile seçilebilir kalır (taban satırlarını tekrar üretmek için); oyuncuya açılmaz.

**Bot (`tests/sim.js`):** `bot.level: 'b0'|'b1'|'b2'`; B2 için `muster` (iç bölge askerini en değerli hedefe komşu toplanma bölgesine akıt), `joint` (2-3 bölgeden aynı hedefe sırayla), `garr` (cephe `≥ 0,9·komşu hazır`), `unrGarr` (yeni fetihte `≥ G`), `atkCh .65`, `lossCap .4`. Yeni satır alanları B.3.3 (`peak`, `lostAfter50`, `recap`, `aiPeak`, `short`, `idleRes`, `t75to100`), özet: K1-K11.

**Kabul ölçütleri:**
1. B2 geçerliliği (0.10.0'da): Kalfa B2 ≥ B0 + 20 puan.
2. Zorluk (B2, Klasik, Kıta, 96 tohum): Çırak %65-75 · Kalfa %35-45 · Usta %15-25 · Destan %5-10.
3. K1 ≤ %90, K2 ≤ %65, K3 medyan 10-18 tur, K7 (Normal ort. ≤ 150; kazanılan 95-135), bitmeyen ≤ %5.
4. Erken oyun korunur: t25 medyanı (B0, Kalfa) 0.10.0'a göre ≤ +5 tur; t30'dan önce kaybedilen oyun oranı ≤ 0.10.0 + 5 puan.
5. Hata 0, invariant 0, `randLeak` 0, belirlenimcilik (`det`), `checkMaps` 20/20 + 12/12, `evUnit` temiz. `endTurn` (Uzun harita) ≤ 10 ms.

**Ayar sırası (ölçümle):** (a) `aiEco` → zorluk bantları; (b) `balK` + S8/S10 → K1/K3; (c) idare katsayısı 0,5 ±0,1 ve `N0` → Ekonomi-önce varyantının referansa uzaklığı ≤ 15 puan; (d) `lootRate` yorgunluk eğimi.

### G2 — Atölyeler ve donanım hiyerarşisi (0.12.0, (Y))
**Kod bölgeleri:** yeni `WS` tablosu (C.3), `EQ` tablosu (C.2), `S.eq`; `r.ws`; `wsSlots(i)`, `buildWS(i,t)`, `upWS(i,k)`, `wsCost`, `wsTick()` (endTurn içinde, otomatik üretimden **önce**), `eqA(o,k)/eqD(o,k)`, `uAtk`/`rawDef`'e çarpan; `atkParts` "Silah donanımı" satırı ve `battle()` içindeki demir harcaması kalkar; `remU`/`takeProp` kayıplarında `eqLose(kayıp)`; `recruit`/otomatik üretim kit tüketir (Yeniçeri/Süvari kuralı), "Yalnız donanımlı" bölge ayarı (`r.eqOnly`); `BR` metinleri (Saldırı/Savunma dalları); `DYN.tunc.mods` ve `MUTS.demirsiz.mods` yeni anlamları; rakip `eq` savaşta (`aiTurn` B.2.2 zaten G1'de). Arayüz C.5.

**Kayıt:** `SAVE_VER 9 → 10`, `MIG[9]`: `S.eq.kilic = {n: piy+suv+yen, q: piy+suv+3·yen}`, `yay = {n: okc, q: okc}`, `zirh = {n:0,q:0}` (mevcut ordu milis olmaz); başkente Demirhane Sv.1; `r.ws = []`, `r.eqOnly = false`.

**Bot:** B1/B2 atölye politikası: kuruluşu olan her bölgede ilk yuva Demirhane; kapsama < %90 ise yeni atölye/yükseltme (öncelik: kılıç → zırh → yay), demir stoğu ≥ 2 tur talep; Talimhane sonrası Demirhane Sv.3 hedefi; Yeniçeri için T3. Satır: `eqCov` (t40/t80 kapsama), `eqT` (ortalama kademe), `wsN`, `milisPay` (milis yetiştirme payı), `demirIdle`.

**Kabul:** demir stok/gelir ≤ 10 (K9); B1 oyunlarının ≥ %80'inde ≥ 2 atölye, ≥ %40'ında Sv.3+; t60 kapsama ortalaması %60-90 (hep %100 ise fazla ucuz, < %50 ise fazla pahalı); "yalnız donanım" varyantı ≤ referans + 15 puan; zorluk bantları G1'deki gibi (yeniden ayar: KF ve `aiBCap`); Yeniçeri üretim payı (B2, Usta) ≥ %5.

### G3 — Liman, tersane, gemi, ticaret, balıkçılık (0.13.0, (O-Y))
**Kod bölgeleri:** `PORT` (Liman seviyeleri), `YARD` (tersane), `SHIPS` (gemi türleri); `r.port = {lv, yard, b:{t,left}|null}`, `S.ships = [{t, r}]`; `buildPort`, `upPort`, `upYard`, `buildShip`, `tradeIncome()` (D.3; `economy()` brüt altına ayrı anahtar `ticaret`, tavanla), `shipTick()` (inşa, fırtına zarı, tayfa nüfusu), korsan sistem olayı + "Korsan Reisi" olayı (`EVENTS`), `conquer()` içinde gemi el değiştirme; `FIELD.balik` (yeterlilik `fieldOk(i,t)` yeni denetimi; `buildField`'a eklenir), `maxPop` (+3/Sv balık). Rakip ticareti `aiIncome` terimi (D.4). Arayüz: Bölge → yeni **Liman** sekmesi (kıyı bölgesinde): liman seviyesi ve kapasite çubuğu (gemi yuvaları), tersane ve inşa kuyruğu, gemi listesi (ikon, yük, bakım, risk), ülke ticaret özeti ("⚓ 32/33 · doygunluk %79 · abluka: Kızıl Hanlık").

**Kayıt:** `SAVE_VER 10 → 11`, `MIG[10]`: `r.port = {lv:0, yard:0, b:null}`, `S.ships = []`.

**Bot:** B1/B2: kıyı bölgesi ve altın ≥ 120 ise Liman → Tersane → gemi (önce Karamürsel), ticaret tavanının %90'ına kadar; doğal limanda Liman Sv.3; kıyı/nehir bölgesinde boş yuvada balıkhane (`wNew.balik` 1,2; orman/dağ kıyısında 1,6); korsan riski ≥ %3 ise 1 Kadırga. Satır: `ships`, `tradeGold` (t60/t100), `tradeCapHit` (tavana dayanan tur payı), `fish`.

**Kabul:** Körfez haritasında ve Deniz Beyleri'nde (Kalfa, B1): ticaret, oyun ortası (t50-80) brüt altının %15-35'i; "yalnız ticaret" varyantı (Deniz Beyleri, kıyı başkenti, gemi önce) ≤ referans + 15 puan; Körfez Kalfa kazanma oranı Kıta'nın ±10 puanı içinde (bugün 1b'de %56 vs %50; 1a'da %25 **[ölçüm]**); gemi paket geri ödemesi (sim'den ölçülen net gelirle) 28-45 tur; balıkhane kurulan oyun (kıyısı olan) ≥ %40.

### G4 — Renkli ikonlar ve arayüz cilası (G1 ile paralel; (O))
**Kod:** sprite (`<svg id="sprite">`), `ic()` yanına `ric(k)` ve `costTxt`/`lootLine`/olay `d` metni dönüşümü, CSS token'ları (`--r-*-2`, iki yüzey), yeni ikonlar (E.4), `docs/ikonlar.svg` ve `docs/ikon-onizleme.html`.
**Kabul:** E.4 okunurluk testi; HTML'de kaynak emojisi kalmadı (DOM taraması: altı emoji 0 kez, panoya kopyalanan metin hariç); 1440×880 ve 375×812 ekran görüntüleri parşömen ve deri; yatay taşma yok.

### F.1 Ölçüm matrisi (her aşama sonunda)

| Blok | Ayar | Tohum | Bot |
|---|---|---|---|
| Zorluk | 4 zorluk × Klasik × Kıta × Normal | 96 | B0, B2 |
| Hanedan | Kalfa × 7 hanedan × Kıta | 48 | B2 |
| Harita | Kalfa × 4 harita × Klasik | 48 | B1, B2 |
| Boy | Kalfa × Kısa/Normal/Uzun | 48 | B2 |
| Kişilik | Kalfa × tek kişilik ×4 (D6) | 48 | B2 |
| Baskın strateji | Kalfa: referans · yalnız fetih (yeni sistem yok) · yalnız donanım · yalnız ticaret (Deniz/Körfez) · ekonomi-önce · kaplumbağa | 72 | B1 türevleri |
| Duyarlılık (G1) | `aiEco`, `balK`, idare katsayısı, yorgunluk eğimi, KF, TG ±%20 | 72 | B2 |

Hata payı: 96 tohumda tek oran için ±10 puan, iki koşu farkı ~±7 puan (1c raporu yöntemi); **< 14 puanlık fark gürültü** sayılır. Ölçülen her sayı `tests/matrix-2x.json` ve `tests/baseline-v7.json`'a (G1), `v8` (G2), `v9` (G3) yazılır.

### F.2 Riskler
| Risk | Belirti | Önlem |
|---|---|---|
| Erken oyun zorlaşır (bakım, milis) | t30 öncesi kayıp artar | Kabul ölçütü G1-4; başlangıç Demirhane'si; rakip bakımı 0,15 |
| Altın kaldıracı aşırı (idare + ticaret aynı kaynakta) | Ekonomi-önce < %30 ya da yalnız ticaret > ref +15 | İdare 0,4-0,6 bandı; ticaret tavanı 0,6 → 0,5 |
| Rakip "hile" hissi | Kullanıcı rakibin nereden asker bulduğunu anlamaz | Rakip hazinesi/donanımı/gelir çarpanı Güç dengesi panelinde görünür (Casusluk ayrıntı) |
| AI turu yavaşlar | `endTurn` > 10 ms (Uzun) | Plan 3 turda bir; BFS önbelleği sahiplik değişince |
| Belirlenimcilik | `det` bozulur | Bütün yeni zarlar `rnd()`; sıra sabit (rakip sırası, bölge sırası) |
| Yönetim yükü (oyuncu) | Tur başı karar sayısı artar | Atölye/tersane otomatik çalışır, varsayılan "açık"; ilk kez açılan sistemde tek satır ipucu |
| Bot ≠ insan | Hedefler tutar ama kullanıcı yine "kolay" der | B2 geçerlilik ölçütü + kullanıcıdan 5 oyunluk geri bildirim (Kalfa/Usta) |
| Taban çizgisi kopar | v6 satırları tutmaz | Bilerek; `cfg.rules=1` ile v6 `rowsOff` birebir tekrar üretilmeli (gerileme testi) |

### F.3 Eski kayıtlar ve taban çizgileri
- Her aşamanın `MIG` adımı yeni alanları güvenli varsayılanla doldurur (milis ordusu oluşmaz, rakip hazinesi ve donanımı turdan türetilir); `validSave` yeni alanları denetler (sonlu, ≥ 0, geçerli tür).
- Denge değiştiği için `baseline-v6` artık eşdeğerlik değil **gerileme referansı**dır: `cfg.rules=1` yolu v6 satırlarını birebir üretmeli; `rules=2` için yeni taban `baseline-v7.json` (G1), sonra v8/v9.
- Miras/skor: `DIFFS.mp/sc` değişmez; kazanma oranları düşünce MP beklentisi düşer → G1 sonunda `mpCalc` yeniden ölçülür, Kalfa/Çırak oranı ≥ 1,5 korunur (gerekirse yenilgi MP'si tabanı 12 → 15).

---

## G. Kullanıcıya sorular (tasarım yönünü değiştirenler)

1. **Senin için hedef ne?** Kalfa'da kabaca kaç oyunda bir kaybetmek istersin (öneri: 2 oyunda 1) ve Çırak da zorlaşsın mı (öneri: evet, %65-75)? Cevap, `aiEco` ve dengeleyici gücünü (`balK`) doğrudan belirler.
2. **Büyüklük cezası kabul mü?** Büyük imparatorluğa Divan gideri + uzak bölgede verim kaybı + yeni fethedilen bölgede huzursuzluk/isyan (öneri) mi istersin, yoksa zorluğun neredeyse tamamı rakiplerin güçlenmesinden mi gelsin? İkincisinde rakip ekonomisi ~%30 daha güçlü ayarlanır, oyun "ceza" yerine "daha sert rakip" hissi verir.
3. **Atölyeler yer kaplasın mı?** Öneri: askeri kuruluşa bağlı ayrı atölye yuvası (1-3). Alternatif: atölyeler tarla/pazar ile aynı tesis yuvasını paylaşır: daha sert bir "ekonomi mi ordu mu" ikilemi, ama bölge ekranı kalabalıklaşır ve ekonomi daha da zorlaşır.
4. **Gemiler yalnız ticaret için mi?** Öneri: Faz 2'de yalnız ticaret + refakat (deniz savaşı, asker taşıma yok). Deniz yoluyla çıkarma ve deniz savaşı istiyorsan harita komşuluğu (kıyıdan kıyıya bağ) gerekir; bu ayrı ve büyük bir iş (Y), G3'ün kapsamını ~2 katına çıkarır.

---

## Ek: Uygulama maliyeti özeti

| Öğe | Maliyet | Aşama |
|---|---|---|
| İdare yükü, taşra verimi, azalan ganimet, stok tavanı + Ambar | D | G1 |
| Huzursuzluk + isyan | O | G1 |
| Rakip akçe ekonomisi, gelişim, teknoloji puanı | Y | G1 |
| Akıllı hamleler S1-S10 | Y | G1 |
| Dengeleyici, koalisyon eşgüdümü | D-O | G1 |
| Usta bot (B2) + yeni sim çıktıları | O | G1 |
| Donanım envanteri + 3 atölye + savaş çarpanı + arayüz | Y | G2 |
| Liman/Tersane/4 gemi + ticaret + korsan + Liman sekmesi | O-Y | G3 |
| Balıkhane | D | G3 |
| Renkli iki tonlu ikonlar + emoji kaldırma | O | G4 |
