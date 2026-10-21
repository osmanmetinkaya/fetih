# Fetih v0.8.0 · Hiyerarşi ve ekonomi düzeni ölçümü (1c)

Ölçüm yöntemi: `index.html` değiştirilmeden, `tests/sim.js` botu başsız Chrome'da koşturuldu; `tests/econ-patch.js` oyunun global işlevlerini (endTurn, recruit, resolve, research, upgradeField, upgradeMil…) sarıp tur başına kayıt tutar. Sabit değişiklikleri (duyarlılık) iframe'de `eval` ile yapıldı. Ham veri: `tests/economy-1c.json`.

**Ayar (hepsi):** Kalfa · Klasik Beylik · Kıta · Normal boy · kart yok · olaylar ve alternatif zaferler açık · azami 150 tur. **Tohumlar:** S1 = 11,22,33,44,55,66,77,88,99,111,123,234,301–324 (36), S2 = 401–436 (36); her koşul iki kümede de koşuldu (72 oyun).

**Kapsama:** 2.952 ayrık oyun = politikalar 8×72 (576) + serbest kademe/birim 6×72 (432) + duyarlılık 27 koşul×72 (1.944). Hata sayısı 0, `randLeak` 0 (tüm koşularda). Ek olarak ilk deneme koşuları (504 oyun, kayıt düzeltmesinden önce) atıldı.

**Hata payı:** 72 oyunda tek bir kazanma oranı için Wilson %95 aralığı yaklaşık ±11 puan (örn. %64 → %52–74). İki koşu arasındaki farkın standart hatası ~8 puan. Bu yüzden **~16 puandan küçük kazanma farkları gürültü sayıldı**. Aynı politika iki tohum kümesinde bile %56 ↔ %72 (referans) çıktı.

**Önemli sınırlar:** (1) Bot "oyuncu" değildir; bulguların çoğu "bu bot politikası altında" geçerlidir. Referans bot hiç Kuşatma/Yeniçeri üretmez (kod gereği), Harbiye'ye ulaşamaz. (2) Yalnızca Kalfa/Klasik/Kıta/Normal ölçüldü; diğer zorluk/hanedan/harita/boy ölçülmedi. (3) "Eylemsiz tur" botun eylemsizliğidir, insan oyuncunun "bekleme" hissi değildir. (4) Geri ödeme tabloları bot koşusu değil, oyun sabitlerinden hesaplanmıştır.

---

## 1. Kaynak akış haritası

Zincir (koddan): Tesis → kaynak → harcama.

| Kaynak | Üreten | Harcayan |
|---|---|---|
| 🌾 Tahıl | Tarla (+arazi, başkent, liman) | Ordu bakımı (asker×0,15), birlik alımı, her tesis kurma/yükseltme, kıtlıkta asker ölür |
| 🪵 Odun | Kereste Ormanı (+orman) | Kuruluş (Karakol 20 … Ordugâh 90), sur (10), birlik (okçu 2, kuşatma 8), kuşatmada sur×8 odun, tesis maliyeti (tarla/taş/demir) |
| 🧱 Taş | Taş Ocağı (+dağ/tepe) | Sur (20×seviye), Kışla 25 … Harbiye 130, Pazar/Medrese kurma-yükseltme |
| ⚒️ Demir | Demir Madeni (+maden/dağ, başkent 2) | Saldırı başına asker×0,2 donanım, Süvari 2, Kuşatma 2, Yeniçeri 3, Talimhane 15 / Ordugâh 30 / Harbiye 50 |
| 🪙 Altın | Pazar (+vadi, kavşak, başkent 3) | Birlik alımı (3–10), asker maaşı (0,10), kuruluş kademeleri (20–160), Kereste kurma |
| 📜 Bilgi | Medrese (+başkent 3, harabe 2) | Teknoloji 15/30/60/110, Harbiye 20, Büyük Eser |

### Referans bot (a_referans, 72 oyun): tur başına net gelir / tur başı stok / tur içi harcama
(net = brüt − bakım; harcama = turun başındaki stok − bitirmeden önceki stok; ganimet kazanımı harcamayı azaltır, o yüzden bazı altın/demir harcamaları negatif görünür)

| Tur | Bölge | Tahıl net / stok | Odun | Taş | Demir | Altın | Bilgi |
|---|---|---|---|---|---|---|---|
| 5 | 4,6 | 12,1 / 33 | 1,3 / 27 | 0,4 / 19 | 2,5 / 37 | 8,2 / 38 | 5,4 / 10 |
| 10 | 6,9 | 16,9 / 38 | 2,7 / 28 | 0,9 / 19 | 2,9 / 50 | 9,3 / 23 | 5,6 / 9 |
| 20 | 9,5 | 28,6 / 51 | 6,5 / 45 | 2,0 / 21 | 3,7 / 81 | 12,3 / 33 | 6,0 / 18 |
| 40 | 13,6 | 60,0 / 79 | 19,9 / 165 | 6,2 / 34 | 5,6 / 166 | 20,5 / 75 | 7,0 / 43 |
| 60 | 20,5 | 97,0 / 112 | 29,7 / 332 | 15,1 / 44 | 10,2 / 296 | 39,0 / 147 | 9,2 / 60 |

Tur 40 ve 60'ta oyunların %6 / %29'u bitmiş olduğu için ortalama bitmeyen oyunlara aittir (n=68, 51).

### Darboğaz / atıl
| Kaynak | Stok ÷ net gelir (medyan, tur 15–60) | Turların kaçında stok >10 tur gelir | Yorum |
|---|---|---|---|
| Tahıl | 1,1 | %3 | Her tur harcanıyor: büyümeyi sınırlayan kaynak (tarla −%30 → −15 puan) |
| Altın | 2,5 | %8 | **En sıkı kaynak**: Pazar −%30 → −26 puan, t50 +14 tur; kademe engelinin %39–68'i altın |
| Bilgi | 4,4 | %11 | Hafif birikim; 24 teknolojiden ~20,8'i alınıyor, "teknoloji-önce" yine de ~20,6 |
| Odun | 4,8 | %26 | Orta; ama t10–70'te başkentin sonraki kademesini %49 oranında odun engelliyor |
| Taş | 8,3 | %35 | Yavaş akar (t40'ta net 6,2), kademeleri %51 oranında taş engelliyor; bot Taş Ocağı kurmuyor (t40'ta 0,6 adet) |
| **Demir** | **27** | **%98** | **Atıl.** t40'ta 166, t60'ta 296 stok; Demir Madeni t40'ta oyun başına 0,1 adet; "Demir üretimi −%30" kazanma oranını **hiç** değiştirmedi (64% → 64%). Kademe engeli: demir **%0** |

**Kıtlık ve hazine boşalması:** referansta 5.193 turun yalnızca 2'sinde kıtlık, 0'ında hazine boş (1/72 oyun). Ekonomi-önce botta 15 kıtlık turu, Kaplumbağa'da 9 — kıtlık mekaniği bot oynayışında neredeyse devreye girmiyor.

## 2. Hiyerarşi kullanımı

### Askeri kuruluş kademeleri (referans, 72 oyun; "kademeye en az bir bölge ulaştı")
| Kademe | Ulaşan oyun | İlk ulaşma turu (ort.) | Sonraki kademe için engel (t10–70'te başkent) |
|---|---|---|---|
| II Kışla | %75 | 42 | — |
| III Talimhane | %42 | 63 | Taş %51, odun %49, altın %39, demir %0 |
| IV Ordugâh | %11 | 87 | |
| V **Harbiye** | **%1** (1/72) | 95 | |

Oyunlar ortalama 73 tur sürdüğünden **Ordugâh ve Harbiye (Kuşatma, Yeniçeri, +%25 otomatik üretim) fiilen oynanmıyor.** "Harbiye hedefli" ve "taş+odun yatırımlı" politikalar da Harbiye'ye ulaşamadı (%0), Ordugâh'a %3. Bunun nedeni analitik olarak da görülüyor: tur 40 net gelirle Ordugâh için 12,5 tur taş, 5,4 tur altın; Harbiye için 20 tur taş, 8,6 tur altın, 8,6 tur demir birikmesi gerekiyor (gelirlerin hepsi başka şeye harcanmasa bile).

### Birlik türleri
Referans botta üretimin %98,8'i piyade (bot yalnızca piyade/okçu üretiyor; süvari bölgeye göre otomatik seçilince %0,8). Bu botun sınırıdır; birlik dengesi için botun elini bağlayan kademe kapısını kaldırarak ayrıca ölçtüm (§3b).

Hesaplanan birim verimliliği (oyun sabitlerinden):
| Birim | Saldırı/altın | Saldırı/nüfus | Saldırı/bakım | Saldırı/alım hakkı (w) | Savunma/altın |
|---|---|---|---|---|---|
| Piyade | 0,33 | 1,0 | 1,0 | 1,0 | 0,33 |
| Okçu | 0,27 | 0,8 | 0,8 | 0,8 | **0,53** |
| Süvari | 0,28 | 1,7 | 0,85 | 0,85 | 0,15 |
| Kuşatma | 0,15 | 0,3 | 0,4 | 0,3 | 0,10 |
| Yeniçeri | 0,22 | **2,2** | **1,1** | **0,73** | 0,20 |

### Tesisler (referans, oyun sonu; her tesis türü için oyun başına adet ve ortalama seviye)
| Tesis | t40: adet / Sv | Oyun sonu: adet / Sv |
|---|---|---|
| Tarla | 4,1 / 1,54 | 6,4 / 2,28 |
| Pazar | 2,0 / 1,25 | 3,2 / 1,98 |
| Kereste | 1,8 / 1,58 | 2,5 / 2,08 |
| Taş Ocağı | 0,6 / 1,21 | 1,2 / 2,12 |
| Medrese | 1,1 / 1,03 | 1,5 / 1,57 |
| Demir | 0,1 / 1,33 | 0,6 / 2,15 |

**Ortalama tesis seviyesi 2,1; Sv.4–5 hiç görülmedi (ortalama).** Oyun sabitlerinden geri ödeme (ek üretim, bir "eff=1" arazide, maliyetin kaynak toplamı bölü ek üretim):

| Yükseltme | Tarla | Kereste | Taş Ocağı / Pazar / Medrese | Demir |
|---|---|---|---|---|
| Sv1→2 | 27 tur | 27 | 36 | 54 |
| Sv2→3 | 46 | 46 | 62 | 93 |
| Sv3→4 | 66 | 66 | 88 | 132 |
| Sv4→5 | **86** | 86 | 114 | 171 |

Oyun ort. 73 tur sürerken Sv.3+ yükseltmeleri geri ödemeden önce bitiyor; Sv.4–5 ayrıca Sulama/Loncalar/Ticaret Yolları teknolojilerini ister. **Sv.4–5 fiilen tuzak seçenek.** (LVM'yi Sv2–5 kazancında ±%20 oynatmak kazanma oranını yalnızca 2 puan değiştirdi: oyuncu o seviyelere zaten ulaşmıyor.)

### Teknoloji dalları (referans, 72 oyun)
| Dal | Ort. final kademe | K1 ilk tur | K2 | K3 (oran) | K4 (oran) |
|---|---|---|---|---|---|
| Askeri Üretim | 3,62 | 2,9 | 16 | 36 (%93) | 56 (%69) |
| İkmal & Ekonomi | 3,54 | 4,4 | 20 | 40 (%86) | 60 (%68) |
| Saldırı | 3,50 | 6,4 | 23 | 44 (%82) | 64 (%68) |
| Savunma | 3,42 | 8,2 | 26 | 47 (%78) | 68 (%64) |
| Strateji | 3,39 | 10,3 | 29 | 50 (%76) | 72 (%62) |
| Kuşatma | 3,31 | 12,4 | 31 | 52 (%75) | 76 (%56) |

Hiçbir dal "alınmıyor" değil, ama bu botun hepsini sırayla araştırmasından gelir; tercih sinyali yoktur. Bilgi darboğaz değil: teknoloji-önce politikası bilgi gelirini ~%19 artırdı (13,4 vs 11,3) fakat teknoloji sayısını artırmadı (20,6 vs 20,8) ve kazanma oranını düşürdü (%50 vs %64): **ek Medrese yatırımı karşılığını vermiyor** (ek medrese = ekonomi ve kademeler pahasına).

## 3a. Strateji varyantları (Kalfa/Klasik, 72 oyun her biri)

| Politika | Kazanma | %95 aralık | Ort. bitiş | Kazanılanlarda bitiş | t25 | t50 | t75 | Kıtlık/hazine boş (oyun) | Son nüfus | Teknoloji sayısı |
|---|---|---|---|---|---|---|---|---|---|---|
| a Referans | 46/72 **%64** | 52–74 | 73,1 | 84,2 | 37,5 | 70,0 | 85,7 | 1 / 0 | 902 | 20,8 |
| b Ekonomi-önce | 27/72 **%38** | 27–49 | 66,8 | 83,1 | 41,2 | 71,5 | 82,9 | 1 / 1 | 592 | 18,2 |
| c Askeri-önce (rush) | 34/72 **%47** | 36–59 | 86,3 | 92,5 | 36,8 | 72,2 | 94,8 | 1 / 1 | 817 | 16,2 |
| d Teknoloji-önce | 36/72 **%50** | 39–61 | 73,9 | 84,8 | 42,8 | 72,0 | 79,2 | 0 / 1 | 739 | 20,6 |
| e Kaplumbağa (sur+okçu) | 40/72 **%56** | 44–66 | 77,3 | 88,3 | 39,8 | 73,4 | 86,9 | 3 / 0 | 823 | 20,4 |
| f Süvari ağırlıklı | 49/72 **%68** | 57–78 | 77,2 | 88,9 | 38,4 | 70,4 | 87,2 | 0 / 0 | 953 | 21,0 |
| g Ağır (Kuşatma+Yeniçeri kademede) | 51/72 **%71** | 59–80 | 80,1 | 84,9 | 40,0 | 69,9 | 85,6 | 0 / 0 | 1064 | 21,8 |
| h Harbiye hedefli (altın biriktir) | 46/72 **%64** | 52–74 | 74,4 | 85,4 | 38,7 | 70,4 | 84,9 | 0 / 1 | 887 | 20,9 |
| i Kademe: Taş+Odun ağırlıklı | 37/72 **%51** | 40–63 | 78,3 | 91,6 | 39,4 | 75,8 | 91,0 | 1 / 1 | — | — |

(g, h ve f, kendi birimlerine yalnızca kademe izin verdiğinde geçebilir; g'de Kuşatma/Yeniçeri **hiç üretilmedi**, çünkü Ordugâh/Harbiye %4/%0 oyunda açıldı. Yani g ≈ referans + erken Kışla; f'de süvari payı sadece %2,1 üretim.)

**Yorum:**
- **Baskın strateji yok.** En yüksek %71 (g) ve %68 (f); referansla farkları (+7, +4 puan) gürültü sınırı içinde. %70 eşiği geçen, diğerlerinden açıkça iyi olan politika bulunmadı.
- **Anlamlı biçimde kötü:** *Ekonomi-önce* (%38; referanstan −26 puan, aralıklar neredeyse ayrık) ve ölçülen en zayıf stil. Nüfus %34 az (592 vs 902), brüt gelirler düşük: tesis yatırımı fetih ganimeti ve toprak getirisinin gerisinde kalıyor. Bu, ekonomi düzeninin "yatırım yapan kazanır" beklentisini karşılamadığı anlamına gelir.
- **Rush** (%47) ve **teknoloji-önce** (%50) referansın altında ama aralıklar çakışıyor; rush'ın belirgin etkisi oyunun uzaması (86 tur) — altın tüm turlarda kademeyi %68 engelledi.
- **Hiç işe yaramayan politika yok** (en düşük %38). Kaplumbağa (sur+okçu) %56 ile kullanılabilir ama yavaş (t75 86,9; 3 oyunda kıtlık); okçu üretim payı %14, savaşa gönderilen pay %12.

## 3b. Birim türü dengesi (kademe kapısı açıkken)
Test: tüm bölgeler ücretsiz Harbiye (kademe 5) ve Askeri Üretim 4 teknolojisi (`S.tech.ure=4`) ile başlar; bot her alımı ve otomatik üretimi tek bir türe çevirir. Böylece sadece **birim ekonomisi** ölçülür (kademe maliyeti sıfır; bu yüzden mutlak oran gerçekçi değil, **sıralama** önemli).

| Tek tür | Kazanma (72) | Ort. bitiş | t25 | t50 | Kıtlık (oyun) |
|---|---|---|---|---|---|
| **Piyade** | **71/72 (%99)** | **46,9** | 10,4 | 25,4 | 3 |
| Okçu | 56/72 (%78) | 69,5 | 27,4 | 53,8 | 9 |
| Yeniçeri | 36/72 (%50) | 61,9 | 31,9 | 63,8 | 0 |
| Süvari | 29/72 (%40) | 71,9 | 33,5 | 75,2 | 1 |
| Kuşatma | 0/72 (%0) | 43,6 | 97 | — | 1 |

Sonuç: **Piyade baskın** (ucuz: 3 altın + 2 tahıl, w=1; otomatik üretim hızı w'ye bölünüyor). Yeniçeri nüfus/bakım başına en iyisi (2,2 / 1,1) olduğu halde altın başına en kötü ikinci (0,22) ve alım hakkı 3 olduğundan otomatik üretimi piyadenin 1/3'ü: **Yeniçeri tuzak seçenek** (Harbiye'ye ulaşılsa bile piyade spam'inden zayıf). Süvari (6 altın, 2 demir, w=2) piyadenin gerisinde; yalnızca Börü gibi çarpanlarla kullanılabilir. Kuşatma tek başına işe yaramaz (saldırı 0,6) ve sadece surlu hedefe karşı destek olarak anlamlı; bu test onu destek olarak ölçmüyor.
Uyarı: tek-tür testleri yapay (karışık ordu ölçülmedi), ve Okçu yüksek nüfus/tahıl baskısı yüzünden 9 kıtlıklı.

## 4. Duyarlılık (monkey-patch, 72 oyun her ayar; referans %64, t50=70,0)
Etiket notu: `+20/−20` ilk ve ikinci uçtur; **lootStore ve popGrowth ±%30** uygulanmıştır (tablodaki "+20" etiketleri adlandırma kalıntısı), diğerleri ±%20.

| Sıra | Parametre | + uç: kazanma / t50 | − uç: kazanma / t50 | Genişlik (puan) |
|---|---|---|---|---|
| 1 | **lootStore çarpanı ±%30** | %82 / 61,8 | %32 / 76,5 | **50** |
| 2 | **UNITS maliyeti ±%20** (altın+tahıl+…) | %38 / 80,2 | %79 / 62,7 | **41** |
| (3) | Rakip kazancı (aiGain 1,6) ±%20 (referans zorluk kolu) | %44 / 72,2 | %81 / 71,6 | 37 |
| 3 | **TCOST ±%20** (15/30/60/110) | %51 / 73,4 | %74 / 64,5 | **23** |
| 4 | popGrowth ±%30 | %72 / 68,4 | %54 / 72,0 | 18 |
| 5 | FIELD.base ±%20 | %67 / 69,6 | %50 / 73,1 | 17 |
| 6 | Ordu bakımı ±%20 | %51 / 72,7 | %65 / 70,9 | 14 |
| 7 | MIL.auto ±%20 | %58 / 73,0 | %53 / 71,3 | 5 |
| 8 | LVM (Sv2–5 kazancı) ±%20 | %60 / 73,6 | %58 / 72,3 | 2 |
| 9 | MIL maliyeti ±%20 | %67 / 69,1 | %68 / 68,6 | 1 |

Kaynak bazlı (yalnızca o tesisin `base` değeri −%30):
| Tesis | Kazanma | Δ puan | t50 | Δ tur |
|---|---|---|---|---|
| **Pazar (altın)** | %38 | **−26** | 84,4 | **+14,4** |
| **Tarla (tahıl)** | %49 | **−15** | 69,7 | −0,3 |
| Medrese | %58 | −6 | 71,6 | +1,6 |
| Kereste | %62 | −2 | 70,8 | +0,8 |
| Taş Ocağı | %62 | −2 | 70,3 | +0,3 |
| Demir | %64 | 0 | 70,0 | 0,0 |

**En etkili 5 parametre** (rakip kazancı hariç, oyun içi ekonomi/denge kaldıraçları): (1) lootStore, (2) UNITS maliyeti, (3) TCOST, (4) Pazar/FIELD.base ailesi (altın kaynağı özellikle), (5) popGrowth. MIL.cost, MIL.auto ve LVM neredeyse etkisiz — çünkü yüksek kademelere/seviyelere zaten ulaşılmıyor (bu bir "güvenli" değil "bağlantısız" işaretidir).

**Güvenli aralık (varsayım: ±~10 puan kayma kabul; iki uç arası lineer değil, yalnızca ±uçlar ölçüldü):** lootStore ±%10 · UNITS maliyeti ±%7–10 · TCOST ±%10 · popGrowth ±%15 · FIELD.base ±%10 · ordu bakımı ±%15 · MIL.auto, LVM, MIL.cost ±%20 (etkisiz). Ara noktaları ölçülmedi; bunlar uç değerlerin yarısına doğrusal ekstrapolasyondur.

## 5. Tempo
**Erken oyun (ilk 25 tur, referans bot, 72 oyun):** her tur başında bütünüyle mümkün eylem kategorisi (araştırma, tesis yükseltme, yeni tesis, kademe, birlik alımı, sur, saldırı: 7 kategori) ve toplam seçenek:
| Tur aralığı | Etkin kategori / 7 | Toplam seçenek | Bot eylem/tur | Seçenek yok | Botun hiçbir şey yapmadığı tur |
|---|---|---|---|---|---|
| 1–5 | 3,5 | 8,1 | 2,7 | %0 | %2 |
| 6–12 | 2,9 | 7,5 | 1,5 | %2 | %24 |
| 13–25 | 3,2 | 10,8 | 1,7 | %3 | %24 |

Ödenebilir hiçbir seçeneğin olmadığı "gerçek bekleme turu" nadir (%0–3); botun hiçbir şey yapmadığı turlar ise %24 (6–25. turlar) çünkü bot eşik beklerken biriktiriyor — insan oyuncu için de "biriktirme turu" anlamına gelir. İlk dönemde tur 6–12 arası seçenek çeşidi (2,9) en düşük; barış süresi 12 tur, ilk %25 toprak ort. 37,5. turda.

**Bölge eğrisi:** %25 → tur 37,5; %50 → 70,0; %75 → 85,7. İlk çeyrek 37 tur, ikincisi 32, üçüncüsü 16 tur: **uzun, yavaş açılış ve hızlı bitiş** (kartopu).

**Zaferi ilan et (referans):** eşik (güç ≥1,5× rakipler ve toprak ≥%30) kazanılan 46 oyunun hepsinde açıldı (ort. tur 73) ve oyun doğal olarak ort. 11 tur (medyan 11) sonra bitti. Yani ilan, ortalama oyunun yalnızca ~%13'ünü kısaltıyor. Kaybedilen 26 oyunda eşik hiç açılmadı (0/26), hiçbir eşik kombinasyonunda (1,0×–1,5×, %20–30) yanlış açılma görülmedi:
| Eşik (güç oranı / toprak) | Kazanılan oyunlarda kısalan tur (ort., medyan) | Kaybedilen oyunda yanlış açılma |
|---|---|---|
| 1,5× / %30 (mevcut) | 11,2 / 11 | 0/26 |
| 1,25× / %25 | 14,0 / 12 | 0/26 |
| 1,0× / %20 | 20,0 / 17 | 0/26 |
| 2,0× / %20–30 | 8,8 / 8 (40/46 oyunda açılır) | — |
Temizlik evresi (ilan eşiğinden zafere): politikaya göre ortalama 10–15 tur (referans 11,2; Süvari ağırlıklı 14,7; yalnız bu politikaların ortalamaları ölçüldü, dağılım kuyruğu ayrıca çıkarılmadı).

## 6. Bulgular ve öneriler (en çok 12, etki/maliyet sırasıyla)
Sayılar tahmindir; **uygulanmadı ve önerilen değerlerle yeniden ölçülmedi.** "Beklenen etki" duyarlılık eğrilerinden ekstrapolasyondur.

| # | Değişiklik | Gerekçe (ölçüm) | Beklenen etki | Risk |
|---|---|---|---|---|
| 1 | **Yeniçeri** altın 10→7, tahıl 3→2, demir 3→2, alım hakkı w 3→2 | Tek-tür testinde %50 (piyade %99, okçu %78); saldırı/altın 0,22 < piyade 0,33; w=3 otomatik üretimi 1/3'e düşürüyor | Yeniçeri piyadeye yakın (≥%75) olur; Harbiye'nin amacı oluşur | Harbiye'ye ulaşılabilirse (#2) kartopu; test edilmeli |
| 2 | **Ordugâh/Harbiye maliyetini düşür** ve demire kaydır: Ordugâh {odun 90, taş 80, altın 100, demir 30} → {odun 60, taş 50, altın 70, demir 50}; Harbiye {taş 130, altın 160, demir 50, bilgi 20} → {taş 80, altın 100, demir 90, bilgi 20} | Ordugâh %11, Harbiye %1 oyunda; tur 87/95; engel taş %51/odun %49/altın %39, demir %0; demir stoku 166→296 atıl | Ordugâh ~%40, Harbiye ~%15 oyunda (tahmin); demir kullanım kazanır | Kuşatma/Yeniçeri erken gelirse oyun kısalır; birim dengesi (#1) önce |
| 3 | **Tesis yükseltme maliyet üssü** (lv+1)^1.7 → (lv+1)^1.4 | Geri ödeme Sv2→3 46, Sv3→4 66, Sv4→5 86 tur (oyun 73 tur); ortalama Sv 2,1; ekonomi-önce %38 | Sv3→4 geri ödemesi 66→~44; Ekonomi-önce %38→~%50 (tahmin) | Tarla/Pazar fazla güçlenirse altın darboğazı gevşer, altın zaten en kritik kaynak |
| 4 | **Demir sink'i**: donanım asker başı 0,2→0,3 demir ve/veya Piyade'ye 1 demir | Demir stoku tur 40'ta 166, %98 turda >10 tur gelir; −%30 üretim = 0 etki | Demir kararı anlam kazanır; Madeni %0,1→~1 adet | Piyade ucuzluğunu bozar; bot demir madeni kurmazsa saldırı gücü düşer (cov hesabı) |
| 5 | **lootStore çarpanını dokunmadan koru; zorluk ayarı için tek düğme olarak kullan** (±%10 ≈ ±8 puan) | ±%30 → %82/%32 (50 puan), t50 62↔77 | Tek bir sayıyla zorluk ince ayarı | Yanlışlıkla değişirse oyun akışı bozulur |
| 6 | **Birlik maliyeti (altın) ±%10 aralığında kal**; Pazar tabanını (3) koru | UNITS ±%20 → %38/%79; Pazar −%30 → −26 puan, t50 +14 | Altın tek-kaynak baskınlığı bilinçli kalır | — |
| 7 | **Taş Ocağı / Kereste / Demir'e kademe dışı rol ver** (ör. Kereste: sur odunu, Taş: sur maliyeti %−15 Sv başına; ya da Kışla+ maliyetini bu kaynaklara dağıt) | −%30 üretim → −2 / −2 / 0 puan: üç tesis kazanmayı etkilemiyor | Tesis türü seçimi anlam kazanır | Tesis sayısı arttıkça tur başı karar yükü |
| 8 | **LVM Sv4–5 çarpanlarını** [..,5.2,7] → [..,5.8,8.5] **ya da #3** | LVM ±%20 etkisiz (2 puan); Sv4–5 ulaşılmıyor | Üst seviyeler cazip olur | Altın üretimi artar (Ticaret Yolları +%30 ile birleşince) |
| 9 | **Talimhane (Kademe 3) maliyeti** {odun 60, taş 50, altın 60, demir 15} → {odun 45, taş 35, altın 50, demir 25} | Kademe 3: %42 oyun, tur 63; taş %51/odun %49 engeli | Kademe 3 ~%60, ort. tur ~52 | Süvari erken gelir (süvari testte zaten zayıf) |
| 10 | **Zaferi ilan et eşiğini** 1,5×/%30 → 1,25×/%25 | Kazanılan oyunlarda ort. 14 tur kısalır (şimdi 11); kaybedilen oyunlarda yanlış açılma yok (0/26) | Oyun süresi −3 tur daha | Az örnek (26 kayıp); Usta/Destan'da yanlış açılma ölçülmedi |
| 11 | **Barış-sonu ilk 25 tur için "ilk genişleme" yardımı** (ör. ilk fetihte +1 piyade ya da başlangıç piyade 15→18) | t25 = 37,5 (barış 12. turda biter; ilk %25 toprağa 25 tur sonra ulaşılıyor), 6–12. turlarda seçenek çeşidi 2,9 ve botun %24 eylemsiz turu | Açılış 5–6 tur kısalır (tahmin) | Ölçülmedi; Kalfa dengesi bozulabilir |
| 12 | **TCOST'u [15,30,60,110] → [13,26,52,95]** *yalnızca* teknolojiyi canlandırmak istenirse | ±%20 → %51/%74; ama teknoloji-önce %50 (<%64): tek başına Medrese yatırımı geri ödemiyor | Teknoloji erken gelir; ~+8–10 puan | Askeri teknolojiler hızlanır → kartopu |

### Baskın / atıl / tuzak seçenekler (özet)
- **Baskın:** Piyade (serbest kademe testinde %99, ucuz, w=1). Altın üretimi (Pazar) ve fetih ganimeti (lootStore).
- **Atıl:** Demir (stok 27 tur gelir, madene gerek yok), Taş Ocağı/Kereste (kazanma etkisi ≈ 0; yalnızca kademe için), Sv.4–5 tesis seviyeleri, bilgi fazlası.
- **Tuzak:** Yeniçeri ve Harbiye (ulaşılmıyor + ulaşılsa piyadeden zayıf), Kuşatma (tek başına %0; destek rolü ölçülmedi), ekonomi-önce yol (%38), tesis Sv.3+ (geri ödeme 46–86 tur).
- **Ölçülmeyenler:** diğer zorluk/hanedan/harita/boy, insan oyuncu, karışık ordu, Kuşatma'nın destek rolü, öneri değerleri.

## Tekrarlama
```sh
cd /Users/osman/fetih && python3 -m http.server 8131 --directory /Users/osman/fetih &
python3 tests/econ-jobs.py        # iş dosyalarını scratchpad'e yazar
python3 tests/econ-run.py NAME JOBS.json 8   # başsız Chrome, paralel
python3 tests/econ-analyze.py NAME ; python3 tests/econ-sens.py ; python3 tests/econ-analytic.py
```
(`econ-run.py`, `econ-analyze.py` içindeki scratchpad yolu `SP` oturuma özeldir; başka makinede güncellenmelidir.)
