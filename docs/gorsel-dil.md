# Fetih: Görsel Dil, Hareket ve Ses Sistemi (v1)

Hedef: "web sayfası" görünümünden **temiz modern strateji** oyununa geçiş (Civilization VI / Humankind okunabilirliği, Into the Breach netliği). Kapsam: tema + ikon seti + hareket + WebAudio ses/müzik. Kısıtlar: tek `index.html`, dış bağımlılık yok (font, CDN, ses/resim dosyası yok), Türkçe, masaüstü ve mobil eşit öncelik, dosya < 450 KB (şu an ~262 KB).

Kaynaklar: `index.html` (v0.8.0: `:root` 9 değişken, `renderHeader`, `renderPanel`, `wiz*`, `showEnd`, `modal`, `drawOverlay`, `drawIcons`/`iBadge`/`iCastle`/`iFeat`), `docs/faz1-tasarim.md` §8, §12, `tests/qa-1c.md` (B8-B12).

Ek dosyalar:
- `docs/ikonlar.svg`: SVG `<symbol>` sprite'ı (bölüm 7). Uygulayıcı içeriğini `<body>` başına gizli `<svg>` olarak yapıştırır.

---

## 1. Tasarım ilkeleri ve ton

1. **Harita sahnedir, arayüz çerçevedir.** Harita sıcak (kahve, toprak, yeşil rölyef); arayüz soğuk, koyu lacivert-arduvaz ve düz renkli. İkisi renk sıcaklığıyla ayrışır, böylece HUD hiçbir zaman araziyle karışmaz. Arayüzde doku, ahşap, parşömen yok. Süs yalnızca altın vurgu çizgisi ve ikonlarda.
2. **Tek bakışta okunur sayı.** Bir strateji oyununda oyuncu her tur aynı 10 sayıya bakar (6 kaynak + nüfus + moral + asker + yıl). Bunlar her ekran boyutunda **her zaman görünür**, tabular rakamla, ikon + sayı + eğilim (▲/▼ renkli) biçiminde. Açıklama metni asla HUD'da değil, ipucunda.
3. **Bilgi hiyerarşisi üç katman:**
   - *Katman 1, HUD (her zaman):* yıl, 6 kaynak (stok + net), nüfus, moral, toplam asker, zafer ilerlemesi (tek çip), Turu Bitir.
   - *Katman 2, bağlam (seçime bağlı):* seçili bölge kartı, saldırı şansı, hedef göstergeleri, uyarılar (kıtlık, boş hazine, koalisyon).
   - *Katman 3, sekme/pencere:* Ekonomi tablosu, Ordu bileşimi, Teknoloji ağacı, Hedefler, Kayıt, Miras.
   Bir öğe hangi katmandaysa oraya ait; Katman 3 bilgisi HUD'a sızmaz (bugünkü üst çubuktaki `🎯 hedef başarım` ve hanedan/kart çipi Katman 2'ye, açılır detaya taşınır).
4. **Her eylemin görsel + işitsel karşılığı vardır (geri bildirim ilkesi).** Tık: 80 ms basılma + "tık" sesi. Kaynak harcandı: ilgili çip kısa kırmızı nabız + sayı aşağı sayar + "harca" sesi. Kazanıldı: yeşil nabız + yüzen sayı. Savaş: haritada çarpışma efekti + sonuç sesi. Hiçbir eylem sessiz ve hareketsiz bitmez; ama hiçbir efekt oyuncuyu 600 ms'den fazla bekletmez (tur geçişi hariç, o da atlanabilir).
5. **Durum renkle değil, renk + şekil + metinle anlatılır.** İyi/kötü, sahiplik, hedef türü her zaman bir ikon veya desen de taşır (renk körü güvenliği; bölüm 2.6, 11).
6. **Ciddi strateji tonu.** Zafer anı ağırbaşlı: konfeti, zıplayan karakter, parıltı yağmuru yok. Fetih = renk dalgası + sancak dikilmesi + davul vuruşu. Yenilgi = renk çekilmesi + kısa derin ton. Altın rengi ödül anlarına saklanır.
7. **Başparmak ve fare eşit.** Her etkileşim ≥ 44×44 px dokunma hedefi, sağ tık gerektiren hiçbir eylem yok (mobilde saldırı/taşıma haritada bağlamsal düğmeyle). Kısayollar masaüstünde hız katar ama zorunlu değildir.

---

## 2. Renk sistemi

Koyu tema **ana ve tek** temadır. Açık tema **gerekmez**: harita zaten orta tonlu ve sıcak; açık arayüz haritayı soluk gösterir, strateji oyunlarında (Civ, Humankind, Northgard) standart koyu HUD'dur, iki tema bakım maliyetini ikiye katlar. Bunun yerine erişilebilirlik için **yüksek kontrast** varyantı (bölüm 11) yeter: aynı token adları, daha açık metin ve kalın kenar.

Tüm kontrast oranları WCAG 2.x göreli parlaklık formülüyle hesaplandı (sRGB, alfa yok). Eşikler: metin AA ≥ 4.5 (büyük metin ≥ 3), grafik/arayüz bileşeni ≥ 3.

### 2.1 Yüzey katmanları

| Token | Değer | Kullanım |
|---|---|---|
| `--bg-0` | `#0E1117` | Uygulama zemini, harita dışı alan, `body` |
| `--bg-1` | `#151A23` | Panel (aside, üst çubuk, alt çekmece, modal) |
| `--bg-2` | `#1D2430` | Yükseltilmiş: kart, kaynak çipi, satır hover, sekme şeridi |
| `--bg-3` | `#273041` | En üst: düğme normal, girdi, seçili kart zemini |
| `--bg-map` | `#0B1622` | Harita tuvali arka planı (deniz kenarı; bugünkü `#0d1a26` korunur) |
| `--overlay` | `rgba(6,8,12,.72)` | Modal arka perdesi (bugünkü `.6` siyahtan daha koyu, mavimsi) |
| `--scrim-map` | `rgba(11,22,34,.55)` | Harita üstü yüzen kontrollerin zemini (+ `backdrop-filter: blur(6px)` varsa) |
| `--line` | `#2F394A` | Bölücü çizgi (dekoratif, kontrast şartı yok) |
| `--edge` | `#7A879E` | Etkileşimli öğe kenarı (girdi, ikincil düğme): `--bg-1` üstünde **4.81**, `--bg-2` üstünde **4.30** (≥ 3 grafik) |

### 2.2 Metin

| Token | Değer | `--bg-0` | `--bg-1` | `--bg-2` | `--bg-3` | Not |
|---|---|---|---|---|---|---|
| `--tx-1` birincil | `#F1F3F7` | 17.01 | 15.70 | 14.03 | 11.92 | Sayılar, başlıklar, gövde |
| `--tx-2` ikincil | `#A7B1C2` | 8.74 | 8.07 | 7.21 | 6.13 | Etiket, açıklama (bugünkü `--muted #a99b84` yerine) |
| `--tx-3` soluk | `#8691A3` | — | 5.48 | 4.89 | — | Yardımcı metin, "şu an yapılamaz" (B11 düzeltmesi: 4.4 → 4.89) |
| `--tx-dis` devre dışı | `#6E788A` | 4.24 | 3.92 | 3.50 | 2.98 | Yalnız devre dışı öğe (WCAG muaf), her zaman kilit/çizgi ikonu ile |
| `--ink` | `#10131A` | — | — | — | — | Açık zemin (altın düğme, sancak rozeti) üstü metin |

Kural: `opacity:.4` ile devre dışı gösterme **kaldırılır** (bugünkü `.btn:disabled`); yerine `--tx-dis` + `--bg-2` zemin + kenar yok. Opaklık hem metni hem ikonu okunmaz yapıyordu.

### 2.3 Vurgu (marka)

| Token | Değer | Kontrast | Kullanım |
|---|---|---|---|
| `--brand` | `#F2B33D` | `--bg-1` 9.38; `--ink` üstünde 9.96 | Birincil düğme zemini, seçili sekme çizgisi, oyuncu ilerleme çubukları |
| `--brand-hi` | `#FFC95C` | `--ink` 12.15 | Birincil düğme hover |
| `--brand-lo` | `#B9862A` | — | Birincil düğme basılı |
| `--brand-wash` | `rgba(242,179,61,.14)` | — | Seçili kart zemini, ödül vuruşu zemini |
| `--focus` | `#FFD66B` | `--bg-1` 12.53 | Odak halkası (2px + 2px boşluk) |

Altın aynı zamanda **oyuncu sancak rengi** ailesindedir (`--f0`): "senin olan her şey altın". Bu bilinçli bir karardır: HUD'daki altın vurgu ile haritadaki kendi toprakların aynı dili konuşur.

### 2.4 Durum

| Token | Değer | `--bg-1` | `--bg-2` | Eşlik eden ikon |
|---|---|---|---|---|
| `--good` | `#4CC38A` | 7.87 | 7.04 | `i-check`, ▲ |
| `--bad` | `#FF6B5E` | 6.24 | 5.58 | `i-x`, ▼ |
| `--warn` | `#FF9447` | 7.96 | 7.11 | `i-warn` (üçgen) |
| `--info` | `#5AB0FF` | 7.55 | 6.75 | `i-info` |
| `--danger-bg` | `#B33A2B` | beyaz metin 5.90 | | Tehlike düğmesi zemini |
| `--good-wash` / `--bad-wash` / `--warn-wash` | `rgba(76,195,138,.14)` / `rgba(255,107,94,.14)` / `rgba(255,148,71,.14)` | | | Uyarı kutusu zemini (`.warn`, `.end-dg`) |

`--warn` turuncudur, `--brand` altındır; ikisi yan yana gelirse ayrım ikonla yapılır (uyarı her zaman üçgen taşır).

### 2.5 Kaynak renkleri

İkon rengi + çip sol kenar çizgisi + grafik çizgileri için. Hepsi `--bg-2` üstünde ≥ 6.4 (metin olarak da kullanılabilir).

| Kaynak | Token | Değer | `--bg-1` | `--bg-2` | Gerekçe |
|---|---|---|---|---|---|
| Tahıl | `--r-tahil` | `#B5D46A` | 10.46 | 9.35 | Taze ekin yeşili (Civ'deki "yiyecek = yeşil" alışkanlığı); altınla karışmasın diye sarı değil |
| Odun | `--r-odun` | `#D99A5B` | 7.25 | 6.48 | Kesilmiş kereste |
| Taş | `--r-tas` | `#BDB4A6` | 8.51 | 7.60 | Sıcak gri kesme taş |
| Demir | `--r-demir` | `#7DB6EC` | 8.12 | 7.25 | Çelik mavisi; taştan ton farkıyla ayrılır |
| Altın | `--r-altin` | `#FFD447` | 12.26 | 10.96 | Sikke sarısı (marka altınından daha limon) |
| Bilgi | `--r-bilgi` | `#B9A2FF` | 8.04 | 7.18 | Mürekkep moru; medrese/teknoloji |
| Nüfus | `--r-nufus` | `#E8D9C4` | — | — | Ten/keten; ikincil gösterge |
| Moral | `--r-moral` | `#FF8A5B` | — | — | Ateş; < 50 iken `--bad` |

Renk tek başına kaynağı tanıtmaz; her zaman ikon eşlik eder (tahıl başak, altın sikke).

### 2.6 Hanedan / oyuncu (sancak) renkleri

`FAC[].col` dizisinin yerine geçer. Ölçüt: (a) rozet üstü **koyu mürekkep** (`--ink`) ile metin ≥ 4.5, (b) normal görüşte ve deuteranopi/protanopi/tritanopi simülasyonunda (Machado 2009) çiftler arası en küçük CIE76 ΔE mümkün olduğunca büyük, (c) her renge bir **desen** ve **rozet şekli** eşlik eder çünkü 6 rengin tüm renk körlüğü türlerinde ayrışması fiziksel olarak mümkün değil.

| # | Ad | Token | Değer | `--ink` metin | `--bg-1` üstünde | Harita deseni | Rozet şekli |
|---|---|---|---|---|---|---|---|
| 0 | Beyliğin (oyuncu) | `--f0` | `#F5B829` | 10.42 | 9.78 | düz (desensiz), en kalın sınır | kalkan + yıldız |
| 1 | Kızıl Hanlık | `--f1` | `#E0473A` | 4.54 | 4.26 | çapraz çizgi `/` | üçgen (uç aşağı) |
| 2 | Mavi Krallık | `--f2` | `#3B82F6` | 5.05 | 4.74 | nokta | daire |
| 3 | Yeşil Boylar | `--f3` | `#139E8C` | 5.57 | 5.23 | yatay çizgi | kare |
| 4 | Mor Sultanlık | `--f4` | `#E77FD2` | 7.40 | 6.95 | ters çapraz `\` | baklava |
| 5 | Bağımsız Kabileler | `--f5` | `#CFC8BA` | 11.17 | 10.49 | yok (boyanmaz) | altıgen |

Not: yeşil, eski `[36,150,78]` çimen yeşilinden **turkuaza** (#139E8C) kaydırıldı (orman/vadi arazisiyle karışmasın, kırmızıyla deuteranopide ayrışsın); mor, pembe-mora (#E77FD2) kaydırıldı (protanopide maviden ayrışsın). Kabileler gri yerine kemik rengi: gri, deuteranopide turkuazla birleşiyordu.

Ölçülen en yakın çiftler (ΔE, büyük = iyi; < 20 riskli):

| Görüş | En yakın 3 çift |
|---|---|
| Normal | yeşil–kabile 45 · mavi–mor 53 · mor–kabile 62 |
| Deuteranopi | yeşil–mor 22 · yeşil–kabile 27 · mor–kabile 32 |
| Protanopi | yeşil–kabile 19 · mavi–mor 29 · kızıl–yeşil 34 |
| Tritanopi | mavi–yeşil 17 · oyuncu–mor 20 · oyuncu–kabile 32 |

Kalan riskli çiftler (protan yeşil–kabile 19, tritan mavi–yeşil 17) desen ve rozet şekliyle çözülür: kabileler hiç boyanmaz (yalnız altıgen rozet), mavi nokta, yeşil yatay çizgi.

**Harita üstü kontrast kuralı:** sancak renkleri arazi üstünde düşük kontrastlıdır (ölçüm: oyuncu altını ova `#C4BA76` üstünde 1.11, mavi ova üstünde 1.03). Bu yüzden haritadaki **her** sancak öğesi (sınır şeridi, rozet, ok) 1.5-2 px `--ink` hale (outline) ile çizilir; grafik kontrastı renk–hale arasında ölçülür ve tüm renklerde ≥ 4.5'tir. Rozet içindeki sayı daima `--ink` (beyaz değil: beyaz, altın üstünde 1.78, mor üstünde 2.51 kalıyordu).

### 2.7 Token bloğu (bugünkü `:root` yerine)

```css
:root{
 color-scheme:dark;
 --bg-0:#0E1117;--bg-1:#151A23;--bg-2:#1D2430;--bg-3:#273041;--bg-map:#0B1622;
 --overlay:rgba(6,8,12,.72);--scrim-map:rgba(11,22,34,.55);
 --line:#2F394A;--edge:#7A879E;
 --tx-1:#F1F3F7;--tx-2:#A7B1C2;--tx-3:#8691A3;--tx-dis:#6E788A;--ink:#10131A;
 --brand:#F2B33D;--brand-hi:#FFC95C;--brand-lo:#B9862A;--brand-wash:rgba(242,179,61,.14);--focus:#FFD66B;
 --good:#4CC38A;--bad:#FF6B5E;--warn:#FF9447;--info:#5AB0FF;--danger-bg:#B33A2B;
 --good-wash:rgba(76,195,138,.14);--bad-wash:rgba(255,107,94,.14);--warn-wash:rgba(255,148,71,.14);
 --r-tahil:#B5D46A;--r-odun:#D99A5B;--r-tas:#BDB4A6;--r-demir:#7DB6EC;--r-altin:#FFD447;--r-bilgi:#B9A2FF;--r-nufus:#E8D9C4;--r-moral:#FF8A5B;
 --f0:#F5B829;--f1:#E0473A;--f2:#3B82F6;--f3:#139E8C;--f4:#E77FD2;--f5:#CFC8BA;
 /* geriye uyum takma adları: 1. aşamada eski sınıflar kırılmasın */
 --bg:var(--bg-0);--panel:var(--bg-1);--panel2:var(--bg-2);--text:var(--tx-1);--muted:var(--tx-2);--accent:var(--brand);
}
```

JS tarafı: `FAC[k].col` dizileri yukarıdaki hex'lerle güncellenir (`[245,184,41]`, `[224,71,58]`, `[59,130,246]`, `[19,158,140]`, `[231,127,210]`, `[207,200,186]`). Canvas da aynı değerleri okusun diye `getComputedStyle(document.documentElement).getPropertyValue('--f1')` yerine sabit dizi kullanılması önerilir (her karede stil okuma pahalı).

---

## 3. Tipografi

### 3.1 Font yığını (dış font yok)

```css
--font-ui: system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans","Helvetica Neue",Arial,sans-serif;
--font-num: ui-rounded,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; /* SF Rounded varsa sayılar yumuşar */
--font-mono: ui-monospace,"SF Mono",Menlo,Consolas,monospace; /* yalnız FTH-… kodu */
```

Georgia/serif **kaldırılır** (`.title`, `h2`, `h3`, `#endSc`, `#loading`, harita etiketleri). Gerekçe: "temiz modern" yönü; Georgia'nın rakamları eski stil (değişken yükseklikte), skor sayacında titrer. Kimlik, sözcük işaretinde (wordmark) büyük harf + geniş harf aralığı + altın renkle sağlanır, serifle değil. Hepsi Türkçe glifleri (ç ğ ı İ ö ş ü, â î û) tam destekler.

### 3.2 Ölçek

Taban: masaüstü 14 px, mobil 15 px (mobilde okuma mesafesi aynı, piksel yoğunluğu yüksek; `<520px` için `html{font-size:15px}` ve tüm ölçek `rem`).

| Token | Masaüstü | Mobil | Ağırlık | Satır yüksekliği | Kullanım |
|---|---|---|---|---|---|
| `--t-micro` | 11 px | 11 px | 600 | 1.25 | Yalnız harita etiketi altı, rozet yan sayısı; asla gövde metni |
| `--t-xs` | 12 px | 12 px | 500 | 1.35 | Çip eğilimi (+3), tablo alt satırı, zaman damgası |
| `--t-sm` | 13 px | 13.5 px | 400/500 | 1.4 | Panel gövdesi, açıklama |
| `--t-md` | 14 px | 15 px | 400/600 | 1.45 | Varsayılan gövde, düğme etiketi |
| `--t-lg` | 16 px | 17 px | 700 | 1.3 | Kart başlığı, olay seçeneği başlığı, HUD sayıları |
| `--t-xl` | 20 px | 20 px | 700 | 1.25 | Panel başlığı (bölge adı `h2`) |
| `--t-2xl` | 26 px | 24 px | 800 | 1.2 | Modal başlığı (olay, bitiş) |
| `--t-3xl` | 40 px | 32 px | 800 | 1.1 | Skor sayacı, yıl geçiş kartı |

Ağırlıklar: 400 gövde, 500 etiket, 600 vurgu/düğme, 700 başlık ve sayı, 800 skor/wordmark. 300 ve altı kullanılmaz (koyu zeminde incelir).

### 3.3 Sayılar

- Her sayısal alan: `font-variant-numeric: tabular-nums lining-nums;` (bugün yalnız `.r b` ve `#endSc`'de var). Sayaç animasyonunda genişlik oynamasın.
- Biçim: binlik ayırıcı nokta, ondalık virgül (`fmtN` zaten `tr-TR`; `fmtX` virgüllü). HUD'da 10.000 üstü kısaltma: `12,4 B` (bin) yerine **tam sayı** tercih edilir (stoklar 4-5 haneyi nadiren geçer); 100.000 üstü `124 B`.
- Eğilim: `+3`, `−2` (eksi için U+2212 `−`, kısa çizgi değil; tabular hizada genişliği `+` ile aynı). Sıfır: `±0` soluk.
- Yüzde: `%62` (Türkçe yazımda işaret önde; kod zaten böyle).
- Çarpan: `×1,43`.

### 3.4 Başlık stili

- **Wordmark** "FETİH": 800, 15 px, `letter-spacing:.18em`, `--brand`, büyük harf **elle yazılı** (CSS dönüşümüne bırakılmaz).
- **Bölüm etiketi** (`h4`, bugünkü küçük büyük harf başlıklar): 12 px, 700, `letter-spacing:.08em`, `--tx-2`, `text-transform:uppercase`. Altında 1 px `--line` yok; yukarı 20 px boşluk yeter.
- **Panel başlığı** (`h2` bölge adı): 20 px 700 `--tx-1`, solunda 12 px sancak rozeti (şekilli, bölüm 2.6).
- **Modal başlığı**: 26 px 800; ikon 28 px solda, başlıkla aynı satır; alt başlık (yıl, olay türü) 13 px `--tx-2`.

### 3.5 Türkçe tuzakları

1. **İ/ı büyük-küçük dönüşümü.** CSS `text-transform:uppercase` ancak `lang="tr"` varken "i → İ" yapar; `<html lang="tr">` mevcut, **korunmalı**. Modal içeriği `innerHTML` ile gelir, `lang` mirası sorunsuz. JS'de `toUpperCase()`/`toLowerCase()` **kullanılmaz**: "Bilgi".toUpperCase() → "BILGI" (yanlış). Yerine `toLocaleUpperCase('tr-TR')`. Arama/eşleme için `toLocaleLowerCase('tr-TR')`. Kodda `/^fth-/i` gibi büyük-küçük harf duyarsız regex'ler yalnız ASCII için güvenli; Türkçe metinde `i` bayrağına güvenme.
2. **Aksan payı.** Büyük harfli satırlarda (Ğ, Ş, Ç, İ'nin noktası) `line-height` ≥ 1.2; rozet ve düğme içinde dikey ortalama `line-height:1` ile yapılırsa İ noktası ve Ç çengeli kırpılır. Düğmelerde yükseklik `min-height` + `display:inline-flex; align-items:center` ile verilir, `line-height:1` + `overflow:hidden` birlikte kullanılmaz.
3. **Uzun birleşik sözcükler.** "Askerîleştirme", "Kuşatma Takımı", "Talimhane" dar sekmelerde taşar: sekme etiketleri ≤ 9 karakter kısa ad taşır (bugünkü `.lg/.sm` deseni korunur: "Teknoloji/Tekno", "Ekonomi/Eko"). Genel metinde `overflow-wrap:anywhere` yalnız kayıt kodu ve günlükte; gövde metninde `hyphens:auto` (`lang=tr` ile tarayıcı Türkçe heceleme yapar, Safari ve Chrome destekler).
4. **Şapkalı harfler** (Ordugâh, Vezir-i Âzam, askerî): sistem fontlarında var; `â` ile `a` aynı genişlikte değil, tabular sayılarla karışık satırda hizayı bozmaz.
5. **Sıralama**: Bölge listeleri alfabetik sıralanacaksa `localeCompare(b,'tr')` (Ç, Ğ, İ, Ö, Ş, Ü doğru yere).

---

## 4. Boşluk, köşe, gölge, katman

### 4.1 Boşluk ölçeği (4 px ızgara)

| Token | px | Kullanım |
|---|---|---|
| `--s-1` | 4 | İkon–sayı arası, çip içi |
| `--s-2` | 8 | Çip arası, düğme ikon–metin |
| `--s-3` | 12 | Kart içi dolgu, liste satırı dikey |
| `--s-4` | 16 | Panel iç dolgusu, mobil kenar boşluğu |
| `--s-5` | 24 | Bölüm arası |
| `--s-6` | 32 | Modal dolgusu (masaüstü) |
| `--s-7` | 48 | Bitiş ekranı blokları arası |

### 4.2 Köşe yarıçapı

`--rad-xs:4px` (etiket, ilerleme çubuğu), `--rad-sm:6px` (kaynak çipi, girdi), `--rad-md:10px` (düğme, kart), `--rad-lg:14px` (panel, modal, alt çekmece üst köşeleri), `--rad-pill:999px` (alt sekme, anahtar). Harita üstü yüzen düğmeler `--rad-md`. Keskin köşe (0) yalnız ekran kenarına yapışan çubuklarda.

### 4.3 Gölge (yükselti)

Koyu temada gölge zayıf okunur; yükselti **zemin tonu + 1 px üst ışık çizgisi** ile anlatılır, gölge destekler.

| Token | Değer | Kullanım |
|---|---|---|
| `--e-1` | `0 1px 0 rgba(255,255,255,.04) inset, 0 1px 2px rgba(0,0,0,.4)` | Kart, çip |
| `--e-2` | `0 1px 0 rgba(255,255,255,.06) inset, 0 4px 12px rgba(0,0,0,.45)` | Yüzen harita kontrolleri, açılır menü |
| `--e-3` | `0 1px 0 rgba(255,255,255,.06) inset, 0 12px 32px rgba(0,0,0,.55)` | Modal, alt çekmece |
| `--e-glow` | `0 0 0 1px var(--brand), 0 0 16px rgba(242,179,61,.35)` | Ödül vuruşu, hazır Turu Bitir |

### 4.4 Katman (z-index) ölçeği

| Token | Değer | Öğe |
|---|---|---|
| `--z-map` | 0 | `#view` + efekt tuvali `#fx` |
| `--z-mapui` | 10 | Harita kontrolleri, mini harita, bağlamsal eylem düğmesi |
| `--z-hud` | 20 | Üst çubuk, sağ panel, Turu Bitir |
| `--z-sheet` | 30 | Mobil alt çekmece |
| `--z-toast` | 40 | Toast yığını |
| `--z-modal` | 50 | `#modalBg` (bugünkü 1000) |
| `--z-bars` | 60 | Hata/kayıt şeritleri `#bars` (bugünkü 1002) |
| `--z-tip` | 70 | İpucu `#tip` (bugün 5; modal içindeki ipuçları için yükselir) |

### 4.5 Izgara

- **Masaüstü (≥ 1100 px):** 3 sütun: harita (esnek) | sağ panel 400 px (bugünkü 420). Üst çubuk 52 px tam genişlik.
- **Tablet (768-1099 px):** harita tam genişlik; sağ panel 360 px **üst üste binen** çekmece (sağdan kayar, haritayı kesmez), varsayılan açık; daraltılınca 56 px ikon sütunu kalır.
- **Mobil (< 768 px):** harita tam ekran; üst çubuk 48 px; alt çekmece (3 durum, bölüm 6.3). Kenar boşluğu 16 px. 12 sütunlu ızgara kullanılmaz; panel içi 1 sütun, kart ızgaraları `repeat(auto-fill,minmax(150px,1fr))`, mobilde 2 sütun.

### 4.6 Dokunma hedefi kuralı

- Her etkileşimli öğenin **tıklanabilir alanı ≥ 44×44 px** (WCAG 2.5.5 AAA hedefi, Apple HIG). Görsel boyut küçük olabilir (ör. 32 px ikon düğme), ama `::before` ile 44 px'e genişletilmiş vuruş alanı olur.
- Bitişik hedefler arası ≥ 8 px boşluk (ya da vuruş alanları çakışmaz).
- QA B9 listesi kapanmalı: harita ＋ − ⤢ ◎ 34 → 44; Vazgeç/Saldır!/Taşı/Yükle 34 → 44 yükseklik; sürgü tutamacı 16 → 28 px görsel / 44 px vuruş; "Kilitli kartlar" özeti 30 → 44; sihirbazdaki "Miras" bağlantısı 49×16 → 44 yükseklikli düğme.
- Masaüstünde de aynı kural (yoğunluk modu yok): basitlik ve tutarlılık için.

---

## 5. Bileşen kataloğu

Ortak durum kuralları (her bileşen için geçerli, aşağıda yalnız farklar yazılır):

| Durum | Görsel | Ses | Hareket |
|---|---|---|---|
| normal | token zemini | — | — |
| hover (yalnız `@media (hover:hover)`) | zemin bir kat yukarı (`--bg-2`→`--bg-3`), kenar `--edge`→`--tx-2` | `ui-hover` (yalnız birincil düğme ve harita bölgesi, 120 ms kısıtlı) | — |
| aktif/basılı | `transform:translateY(1px) scale(.98)`, zemin bir kat koyu | `ui-tik` | `press` 80 ms |
| seçili (`aria-pressed`/`aria-selected`) | `--brand` 2 px kenar/alt çizgi, `--brand-wash` zemin | — | — |
| devre dışı | `--bg-2` zemin, `--tx-dis` metin, kenar yok, `cursor:not-allowed`, nedenini ipucunda yaz | tıklanırsa `ui-hata` (yalnız bir kez) + ipucu açılır | `shake` 160 ms (azaltılmış harekette yok) |
| odak (`:focus-visible`) | `outline:2px solid var(--focus); outline-offset:2px` | — | — |
| yükleniyor | etiket yerinde 16 px dönen halka, genişlik sabit | — | `spin` 800 ms doğrusal |

### 5.1 Düğmeler

| Tür | Sınıf | Yükseklik | Zemin / metin | Kullanım |
|---|---|---|---|---|
| Birincil | `.btn.pri` | 44 (büyük 56) | `--brand` / `--ink`, 700 | Turu Bitir, Saldır!, Seferi Başlat, olay seçimi onayı. **Ekranda en fazla bir tane.** |
| İkincil | `.btn` | 44 | `--bg-3` / `--tx-1`, 1 px `--edge` | Vazgeç, Kur, Yükselt, Yeni sefer |
| Hayalet | `.btn.ghost` | 44 | saydam / `--tx-2`, kenar yok | Ayrıntılar, Geri, bağlantı benzeri |
| Tehlike | `.btn.dng` | 44 | `--danger-bg` / beyaz (5.90) | Oyunu sil, Kaydı sıfırla, Koalisyonla savaş onayı |
| İkon | `.btn.ico` | 44×44 (görsel 36) | `--bg-2` / `--tx-1` | Harita ＋ −, ayarlar, kapat, ses |
| Küçük | `.btn.sm` | 36 görsel / 44 vuruş | ikincil gibi, 13 px | Panel içi satır eylemleri (⬆ Yükselt maliyetiyle) |

```css
.btn{--h:44px;display:inline-flex;align-items:center;justify-content:center;gap:var(--s-2);
 min-height:var(--h);padding:0 16px;border-radius:var(--rad-md);border:1px solid var(--edge);
 background:var(--bg-3);color:var(--tx-1);font:600 var(--t-md)/1.2 var(--font-ui);cursor:pointer;
 transition:background .12s,border-color .12s,transform .08s;-webkit-tap-highlight-color:transparent;position:relative}
.btn svg{width:20px;height:20px;flex:none}
@media (hover:hover){.btn:hover:not(:disabled){background:#313B4E;border-color:var(--tx-2)}}
.btn:active:not(:disabled){transform:translateY(1px) scale(.98)}
.btn:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.btn:disabled,.btn[aria-disabled=true]{background:var(--bg-2);color:var(--tx-dis);border-color:transparent;cursor:not-allowed}
.btn.pri{background:var(--brand);color:var(--ink);border-color:transparent;font-weight:700}
@media (hover:hover){.btn.pri:hover:not(:disabled){background:var(--brand-hi)}}
.btn.pri:active:not(:disabled){background:var(--brand-lo)}
.btn.pri.big{--h:56px;font-size:var(--t-lg);padding:0 24px}
.btn.ghost{background:transparent;border-color:transparent;color:var(--tx-2)}
.btn.dng{background:var(--danger-bg);border-color:transparent;color:#fff}
.btn.ico{width:44px;padding:0}
.btn.sm{--h:36px;padding:0 12px;font-size:13px}
.btn.sm::before{content:'';position:absolute;inset:-4px 0}/* 44 px vuruş alanı */
.btn .cost{font:500 12px/1 var(--font-num);font-variant-numeric:tabular-nums;color:inherit;opacity:.85}
.btn.busy{color:transparent}.btn.busy::after{content:'';position:absolute;width:16px;height:16px;border-radius:50%;
 border:2px solid var(--tx-2);border-top-color:transparent;animation:spin .8s linear infinite}
```

**Maliyetli düğme deseni** (Kur, Yükselt, Yetiştir, Araştır): `[ikon] Etiket · [kaynak ikonu]25 [kaynak ikonu]5`. Yetersiz kaynak varsa düğme devre dışı **değil** `aria-disabled` olur ve eksik kaynak sayısı `--bad` renkte gösterilir (`🌾25` yerine `<svg i-tahil> <b class=bad>25</b>`); tıklanınca "12 tahıl eksik" ipucu ve ilgili HUD çipi kırmızı nabız atar. Böylece oyuncu neyin eksik olduğunu öğrenir.

**Turu Bitir** özel: `.btn.pri.big`, ikon `i-next` (hourglass değil, ileri ok + çizgi). Durumlar: *normal*; *hazır* (bekleyen eylem yok: `--e-glow` 2 s'de bir yavaş nabız); *bekleyen olay* (etiket "Olayı Çöz", ikon `i-event`); *kuruluşta* (devre dışı, "Önce kuruluşu tamamla"); *işleniyor* (`busy`, en çok 400 ms).

### 5.2 Sekmeler

İki tür: **ana sekmeler** (Bölge · Ekonomi · Ordu · Hedef · Teknoloji · Kayıt; bugünkü `#tabs`) ve **alt sekmeler** (bölge içi Genel · Tesisler · Asker · Savunma; bugünkü `.sub`).

- Ana sekme: 48 px yükseklik, ikon 20 px + etiket 12 px **alt alta** (mobilde ve 400 px panelde altı sekme sığar: 400/6 = 66 px). Seçili: `--tx-1` + 3 px `--brand` alt çizgi (çizgi seçilen sekmeye 180 ms kayar, `tab-ink`). Seçili değil: `--tx-2`. Bildirim noktası: sağ üstte 8 px `--brand` daire (ör. Teknoloji: araştırılabilir kademe var; Hedef: zafer yolu eşiği yakın) + `aria-label`'a "yeni" eklenir.
- Alt sekme: hap (`--rad-pill`), 36 görsel / 44 vuruş, seçili `--bg-3` + `--tx-1` + 1 px `--brand`. Sayı rozeti içerir: "Tesisler 2/3".
- Kısayol: masaüstünde `1`-`6` ana sekmeler (olay penceresi açıkken 1-3 olay seçimidir, çakışmaz çünkü modal odak tuzağıdır).

```css
.tabs{display:flex;background:var(--bg-1);border-bottom:1px solid var(--line);position:relative}
.tabs button{flex:1;min-height:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
 background:none;border:0;color:var(--tx-2);font:600 12px/1.2 var(--font-ui);cursor:pointer;position:relative}
.tabs button svg{width:20px;height:20px}
.tabs button[aria-selected=true]{color:var(--tx-1)}
.tabs .ink{position:absolute;bottom:0;height:3px;background:var(--brand);border-radius:3px 3px 0 0;transition:transform .18s cubic-bezier(.2,.8,.2,1),width .18s}
.tabs button .dot{position:absolute;top:8px;right:calc(50% - 16px);width:8px;height:8px;border-radius:50%;background:var(--brand);box-shadow:0 0 0 2px var(--bg-1)}
```

### 5.3 Panel ve kart

- **Panel** (`aside`, alt çekmece, modal gövdesi): `--bg-1`, iç dolgu 16 px, bölüm arası 24 px, başlık satırı yapışkan (`position:sticky;top:0`, `--bg-1` zemin) ki uzun listede bölge adı kaybolmasın.
- **Kart** (`.card`, sihirbaz `.pick`, tesis satırı, birlik satırı): `--bg-2`, `--rad-md`, dolgu 12 px, `--e-1`. Seçilebilir kartta seçili: 2 px `--brand` iç kenar (`box-shadow:inset 0 0 0 2px`) + `--brand-wash` + sağ üstte `i-check` 16 px rozeti. Kilitli kart: 5.11'e bak.
- **İstatistik kutusu** (bugünkü `.stats`: Asker/Nüfus/Savunma): 3'lü ızgara, her biri `--bg-2`, üstte 12 px `--tx-2` etiket + ikon, altta 22 px 700 sayı, en altta 12 px ikincil bilgi ("hazır 6", "+1,2/tur").
- **Özellik kutusu** (`.feat`, özel bölge açıklaması): `--bg-2` + sol 3 px `--brand` şerit + 24 px özel bölge ikonu.
- **Uyarı kutusu** (`.warn`, `.end-dg`): `--warn-wash` / `--bad-wash` zemin + sol 3 px durum rengi + `i-warn` ikon; metin `--tx-1` (bugün kırmızımsı zeminde kahve metin vardı).

### 5.4 Kaynak çipi (HUD)

Yapı: `[ikon 18] [stok 16/700] [eğilim 12]`. Eğilim: net/tur, `▲ +3` `--good`, `▼ −2` `--bad`, `±0` `--tx-3`. Sol kenar 2 px kaynak rengi (yalnız masaüstü; mobilde kenar yok, ikon rengi yeter).

| Durum | Görsel | Tetikleyici |
|---|---|---|
| normal | `--bg-2` | — |
| artış nabzı | zemin `--good-wash`, sayı 1,08 ölçek, 400 ms | stok arttı (tur sonu, ganimet) |
| azalış nabzı | zemin `--bad-wash`, 400 ms | harcama |
| kritik | kenar `--bad`, eğilim yanıp sönmez ama `i-warn` ekler | tahıl: `stok + net×2 < 0` (2 tur içinde kıtlık); altın: maaş karşılanamıyor |
| eksik vurgusu | 3 kez `--bad` kenar nabzı, 600 ms | maliyetli düğme bu kaynak yüzünden basılamadı |

Etkileşim: tık / dokun → **kaynak ayrıntı açılır kutusu** (masaüstü: çipin altında 280 px popover; mobil: alt çekmece yarım durumunda "Ekonomi" sekmesinin o kaynağa kaydırılmış hali). İçerik: üretim kalemleri (`prodParts` özeti), ordu gideri, askeri rolü (bugünkü `RES[].ask`), son 10 tur mini çizgi grafiği (28 px yükseklik). Bugünkü `title=` ipucu kalkar (mobilde çalışmıyordu).

```css
.chip{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 10px 0 8px;border-radius:var(--rad-sm);
 background:var(--bg-2);box-shadow:var(--e-1);border-left:2px solid var(--rc,transparent);white-space:nowrap;cursor:pointer}
.chip svg{width:18px;height:18px;color:var(--rc)}
.chip b{font:700 16px/1 var(--font-num);font-variant-numeric:tabular-nums;color:var(--tx-1);min-width:3ch;text-align:right}
.chip .tr{font:600 12px/1 var(--font-num);font-variant-numeric:tabular-nums}
.chip.up{animation:pulse-good .4s ease-out}.chip.down{animation:pulse-bad .4s ease-out}
.chip.crit{box-shadow:inset 0 0 0 1px var(--bad)}
.chip[data-r=tahil]{--rc:var(--r-tahil)}.chip[data-r=odun]{--rc:var(--r-odun)}.chip[data-r=tas]{--rc:var(--r-tas)}
.chip[data-r=demir]{--rc:var(--r-demir)}.chip[data-r=altin]{--rc:var(--r-altin)}.chip[data-r=bilgi]{--rc:var(--r-bilgi)}
```

Satır içi maliyet gösterimi (`costTxt`, `lootLine`, `uTxt`): emoji+sayı yerine `<span class=c><svg class=ic><use href="#i-tahil"/></svg>25</span>`, ikon 14 px, ikon rengi kaynak rengi, sayı metin rengi. Bir yardımcı: `ic(id,cls)` → `<svg class="ic ${cls}" aria-hidden=true><use href="#i-${id}"/></svg>`.

### 5.5 İlerleme çubuğu ve halka

- **Çubuk** (`.bar`, Teknoloji kademe ilerlemesi, eser aşaması, fetih %): 8 px yükseklik (bugün 8), `--bg-3` iz, dolgu durum veya kaynak rengi, `--rad-xs`. Eşik işaretçisi: dolgunun üstünde 2 px dikey `--tx-1` çizgi + altında 11 px etiket (ör. fetih eşiği "%60"). Değişim: `width` değil `transform:scaleX()` ile, `transform-origin:left`, 400 ms `--ease-out`.
- **Bölümlü çubuk** (`.prog`, `.stones`: 4 kademe, 5 eser aşaması): eşit hücreler 6 px, aralık 3 px; tamam `--good`, sürmekte `--brand` + içte 1 s kayan parıltı (azaltılmış harekette yok), bekleyen `--bg-3`.
- **Halka** (zafer yolu çipi, araştırma kalan yıl, Yağma/Haraç bekleme): SVG `circle` `stroke-dasharray`; 28 px (HUD) / 64 px (Hedef sekmesi), 3 px / 5 px çizgi. Ortada sayı. Üç zafer yolu halkası Hedef sekmesinde yan yana: Fetih (altın), Medeniyet (`--r-bilgi`), Hegemonya (`--f4` değil, `--info`: sancak rengiyle karışmasın).

```html
<svg class=ring viewBox="0 0 36 36" style="--p:.62"><circle cx=18 cy=18 r=15.9 class=tr /><circle cx=18 cy=18 r=15.9 class=fg /></svg>
```
```css
.ring{width:28px;height:28px;transform:rotate(-90deg)}.ring circle{fill:none;stroke-width:3.5}
.ring .tr{stroke:var(--bg-3)}.ring .fg{stroke:var(--brand);stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:calc(100 - var(--p)*100);transition:stroke-dashoffset .4s var(--ease-out)}
```

### 5.6 Rozetler ve etiketler

| Tür | Görünüm | Örnek |
|---|---|---|
| Durum etiketi (`.tag`) | 22 px yükseklik, `--rad-pill`, 12 px 600, durum rengi metin + `*-wash` zemin + ikon 12 px | `İyi` `Kötü` `Karma` `Çok kötü` (kart türü; bugün "Kötü" 3.7 kontrastlıydı → `--bad` `--bg-1` üstünde 6.24) |
| Sayı rozeti | 18 px daire, `--brand` / `--ink`, 11 px 700 | Bekleyen olay sayısı, yeni açılım |
| Sancak rozeti (DOM) | 12-16 px, sancak şekli (2.6) içinde renk; `aria-label` sahip adı | Bölge adı yanı, komşu listesi (bugünkü `.dot`) |
| Seviye rozeti | `Sv.3` yerine 5 küçük elmas (◆◆◆◇◇) `--brand`; 12 px | Tesis seviyesi (bugünkü ★☆) |
| Rekor | `--good` dolu etiket, `--ink` metin | "YENİ REKOR +412" |

### 5.7 İpucu (tooltip) ve uzun basış

- Masaüstü: hover 350 ms gecikmeyle, odakta anında. `--bg-3` zemin, `--e-2`, `--rad-sm`, dolgu 8×10, en fazla 300 px, 13 px. 8 px ok (üçgen) hedefe bakar. Konumlama: önce üst, sığmazsa alt; ekran kenarından 8 px içeride.
- Mobil: **uzun basış 450 ms** (dokunma hareket etmeden) → ipucu açılır, `navigator.vibrate?.(8)` (yalnız destekleyen Android; iOS'ta yok). Parmak kalkınca açık kalır, dışarı dokununca kapanır. Kısa dokunma ipucu açmaz, eylemi yapar.
- Harita ipucu (`#tip`, `hover()`): masaüstünde imleci izler (bugünkü gibi); mobilde haritada uzun basış = bölge ipucu (seçmeden bilgi).
- Tek bir ipucu yöneticisi: `data-tip="…"` özniteliği olan her öğe; `title=` öznitelikleri kaldırılır (mobilde görünmez, ekran okuyucuda çift okunur). `aria-describedby` ile bağlanır.
- İçerik deseni: **başlık satırı** (700) + 1-3 satır açıklama + isteğe bağlı **sayı tablosu** (`kv`). Ör. kaynak çipi ipucu: "Tahıl · +3/tur" / "İkmal ve nüfus: ordu her tur tahıl yer…" / Üretim +9 · Ordu gideri −6.

### 5.8 Modal ve alt çekmece kalıbı

Tek `modal(h,kind,wide)` fonksiyonu kalır; görünüm ekran genişliğine göre değişir:

| | Masaüstü / tablet (≥ 768) | Mobil (< 768) |
|---|---|---|
| Kalıp | Ortada pencere | **Alt çekmece** (bottom sheet): alttan kayar, üst köşeler `--rad-lg`, genişlik %100 |
| Genişlik | `kind` ile: dar 460, geniş 680, sihirbaz/bitiş 880 | %100 |
| Yükseklik | en çok `min(90vh, 760px)` | içeriğe göre, en çok `92dvh`; tutamaç çubuğu 36×4 px üstte |
| Başlık | yapışkan üst satır: ikon + başlık + `i-close` (kapatılabilirse) | aynı; aşağı sürükleyerek kapatma (kapatılabilirse) |
| Eylem satırı | sağa yaslı, yapışkan alt | tam genişlik, yapışkan alt, `padding-bottom:env(safe-area-inset-bottom)`; birincil sağda (başparmak) |
| Giriş | `modal-in` 200 ms (ölçek .96→1 + opaklık) | `sheet-in` 260 ms (translateY 100%→0) |

Kurallar:
- `role=dialog`, `aria-modal=true`, `aria-labelledby` başlık; açılınca odak ilk etkileşimli öğeye (olayda 1. seçenek, saldırıda Saldır! değil sürgü), kapanınca açan öğeye döner. Odak tuzağı (Tab döngüsü).
- **Kapatılamaz pencereler** (`setup`, `over`, `bozuk`, `ev`, `miras` dönüşü): `i-close` gösterilmez, Esc ve perde tıklaması çalışmaz, aşağı sürükleme yok. QA B2'yi önlemek için saldırı **sonuç** penceresi (`res`) oyunu bitiren savaştaysa da kapatılamaz sayılır ve "Tamam" `afterModal()` çağırır.
- Her `modal()` çağrısında `#modal.scrollTop=0` (QA B7).
- İç taşma yok: modal içeriği `min-width:0`, sürgü satırları `grid-template-columns: minmax(0,1fr) auto` (QA B8).

### 5.9 Toast ve bildirim

Üç ayrı kanal (bugün tek `#toast` var ve Turu Bitir'i örtüyor, QA B10):

| Kanal | Yer | Süre | Örnek |
|---|---|---|---|
| **Toast** (geçici sonuç) | Masaüstü: harita alanının alt ortası, Turu Bitir'in solunda; mobil: üst çubuğun hemen altı (alt çekmeceyi ve FAB'ı örtmez) | 2,4 s; üst üste en çok 3, yenisi alttan iter | "Tarla Sv.2 kuruldu", "🔓 Çelik Dövme araştırılabilir" |
| **Uyarı şeridi** (`#bars`, kalıcı) | Üst çubuğun altında tam genişlik | Kapatılana kadar | Kayıt hatası, bozuk miras |
| **Olay akışı** (haritada) | Haritanın sol kenarı, dikey, en çok 4 kart | 6 s, sonra Kayıt sekmesine düşer | "Kızıl Hanlık Akdere'ye saldırdı (püskürtüldü)"; tıklayınca bölgeye kamera gider |

Toast yapısı: 44 px yükseklik, `--bg-3`, `--e-2`, sol 3 px durum rengi + ikon, metin 14 px. `role=status aria-live=polite` (hata toast'ları `role=alert`). Giriş `toast-in` 180 ms, çıkış 140 ms.

### 5.10 Tablo

Ekonomi ve Ordu tabloları (`table`): satır 36 px, başlık 12 px 600 `--tx-2` büyük harf değil, sayılar sağa yaslı tabular, ilk sütun sola. Satır ayırıcı 1 px `--line`; hover `--bg-2`. Mobilde 4 sütundan geniş tablo **kart listesine** döner (her satır bir kart: ad üstte, değerler 2×2 ızgara) — QA B10'daki Ordu/Teknoloji yatay taşması böyle kapanır. Toplam satırı 700 + üst 1 px `--edge`.

### 5.11 Sürgü, anahtar, kilitli öğe

**Sürgü** (asker seçimi `picker`): iz 6 px `--bg-3`, dolu kısım `--brand`, tutamaç 28 px daire `--tx-1` + 2 px `--ink` hale, vuruş alanı 44 px (görünmez `::before`). Sürgü satırı: `[birlik ikonu 24] [ad + güç] [− düğmesi] [sürgü] [+ düğmesi] [n/max]` — mobilde iki satır: üstte ikon+ad+n/max, altta − sürgü +. ± düğmeleri 44 px (hassas ayar için sürükleme şart değil). Değer değişince `ui-tik` sesi (her 1 birlikte değil, 60 ms kısıtlı).

```css
input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:44px;background:transparent;margin:0}
input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:linear-gradient(90deg,var(--brand) var(--v,0%),var(--bg-3) 0)}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;margin-top:-11px;border-radius:50%;background:var(--tx-1);box-shadow:0 0 0 2px var(--ink),var(--e-1)}
input[type=range]::-moz-range-track{height:6px;border-radius:3px;background:var(--bg-3)}
input[type=range]::-moz-range-progress{height:6px;border-radius:3px;background:var(--brand)}
input[type=range]::-moz-range-thumb{width:28px;height:28px;border:0;border-radius:50%;background:var(--tx-1);box-shadow:0 0 0 2px var(--ink)}
input[type=range]:focus-visible::-webkit-slider-thumb{outline:2px solid var(--focus);outline-offset:2px}
```
(`--v` JS'de `input` olayında yüzde olarak yazılır.)

**Anahtar** (ayarlar, "Kartsız", Ferman): 44×26 hap, kapalı `--bg-3` + `--edge` kenar, açık `--brand` zemin; topuz 20 px; `role=switch aria-checked`. Metin etiketi her zaman yanında ("Açık/Kapalı" durumu sadece renkle verilmez: topuzun içinde `i-check` 12 px).

**Kilitli öğe** (sihirbaz kartı, miras kilidi, teknoloji kademesi): içerik görünür kalır ama `--tx-3` ve gri tonlu (`filter:saturate(.2)` yalnız ikon/görselde, metinde değil), sağ üstte `i-lock` 16 px, altta koşul satırı: "`i-lock` 90 MP (sende 72)" ya da "Usta'da 1 zafer". MP yetiyorsa koşul satırı yerine **[Aç · 90 MP]** birincil-küçük düğme ve kart kenarı `--brand` kesik çizgi. Opaklık `.5` kullanılmaz (bugünkü `.lockd`, `.node.lock`, `.step.lock`).

### 5.12 Başarım kartı

`--bg-2` kart, solda 48 px madalya alanı: kazanılmış → `i-medal` `--brand` dolu + ince altın halka; kazanılmamış → `--bg-3` daire içinde `i-medal` `--tx-dis`; gizli → `i-help` ve "Gizli başarım". Sağda ad (16/700), açıklama (13 `--tx-2`), alt satır: `+15 MP` etiketi ve ilerleme (`pr`) varsa bölümlü çubuk "4/6". Oyun içi canlı hedef (`lv`): üst çubukta değil, Hedef sekmesi başında **hedef kartı** (yeşil: tutuyor, kırmızı: kaçtı, nötr: sürüyor). Kazanma anı: 5.15'teki ödül vuruşu + `basarim` sesi.

### 5.13 Olay penceresi (`showEvent`)

```
┌──────────────────────────────────────────────┐
│ [i-event 28]  Tüccar Kervanı      [İkilem]    │  başlık 26/800 + tür etiketi
│ Yıl 34 · 1 olay daha bekliyor                 │  13 --tx-2
├──────────────────────────────────────────────┤
│ Metin (15 px, en çok 3 satır)                 │
├──────────────────────────────────────────────┤
│ ┌ 1 ┐ Kervanı ağırla                         │  seçenek kartı 64+ px
│ └───┘ −30 altın · +8 bilgi, +5 moral          │  sonuçlar ikonlu, renkli
│ ┌ 2 ┐ Vergi al                                │
│ └───┘ +40 altın · moral −5                    │
│ ┌ 3 ┐ (devre dışı) Askerleri gönder           │  neden: "Hazır asker yok"
└──────────────────────────────────────────────┘
```
- Tür rengi başlık şeridinde 4 px üst kenar: İyi `--good`, Kötü `--bad`, İkilem `--brand`, Sistem `--info`.
- Seçenek kartı: solda 32 px kare tuş rozeti ("1"), içerik; hover/odakta `--brand` kenar; seçilince 200 ms içinde kart altın dolar, diğerleri soluklaşır, sonra pencere kapanır (sonuç toast'ı + kaynak çipi nabızları).
- Kazanç/kayıp satırları: kaynak ikonu + işaretli sayı, `--good`/`--bad`.
- Giriş: `event-in` (kart alttan 24 px + opaklık, 260 ms) + `olay` sesi (tür'e göre iki varyant).

### 5.14 Saldırı / taşıma penceresi

Başlık: `[kaynak bölge] → [hedef]` sancak rozetleriyle. Ortada **şans göstergesi**: 64 px halka, ortada `%62` 28/800; renk eşikleri bugünkü `chanceCol` gibi (≥70 `--good`, ≥40 `--brand`, altı `--bad`) **ve** kelime: "Güçlü / Belirsiz / Riskli". Altında güç karşılaştırma çubuğu: soldan oyuncu gücü (altın), sağdan savunma (sahip rengi), ortada oran. Çarpan listesi (`kv`) açılır "Ayrıntılar" içinde. Tahmini kayıp ve ganimet ikonlu satır. Eylem: [Vazgeç] [Yağma] [**Saldır!**]. Saldır! basılınca pencere hemen kapanır, savaş haritada oynar (8.6), sonuç **toast + bölge kartı güncellemesi** ile gelir; ayrı "sonuç modalı" yalnız başkent alındığında, oyunu bitiren savaşta veya büyük yenilgide (kayıp ≥ %60) açılır (bugün her savaşta modal açılıyor; 82 tur × ~2 savaş = 160 modal kapatma).

### 5.15 Bitiş ekranı bileşenleri (`showEnd`)

- **Kahraman satırı:** solda 220×151 bitiş haritası (`drawEndMap`) yuvarlatılmış, sağda başlık (zafer: `WIN_T[..][0]` 26/800 `--brand`; yenilgi: "Beylik Yıkıldı" `--tx-1`), anlatı cümlesi, ayar satırı (`cfgLine`, ikonlu).
- **Skor sayacı:** `#endSc` 40/800 tabular, 0'dan değere 1200 ms `ease-out-expo` sayar; her 1/8'de bir `skor-tik` sesi (perdesi yükselerek), bitişte `skor-son`. Sayaç bitince altında rütbe.
- **Rütbe:** `i-rank` + rütbe adı (Tımarlı → Cihangir, 6 kademe), altında bölümlü 6 hücreli çubuk (geçilen kademeler altın), "Vezir-i Âzam için 760". Rütbe yükseldiyse (meta'da önceki en iyi rütbeden yukarı) `rank-up`: rozet 1,0→1,15→1,0 ölçek 500 ms + `rutbe` sesi.
- **Ödül vuruşları** (`.beat`, bugün 300 ms opaklık): sırayla 350 ms aralıkla, her biri `beat-in` (sağdan 12 px + opaklık, 240 ms) + `odul` sesi (her vuruşta bir perde yukarı: pentatonik merdiven). Büyük vuruş (`.beat.big`, yeni açılım): `--e-glow` + `kilit-acildi` sesi + `i-unlock` ikonunun kilit dili açılma animasyonu. Oyuncu ekrana dokunursa tüm vuruşlar anında görünür (atla).
- **Yenilgi teşhisi** (`.end-dg`): `--bad-wash` kutu, `i-diag` (stetoskop yerine "nabız çizgisi") + 3 madde.
- **Eylem bloğu:** birincil büyük düğme (`endMain`), altında 3'lü ikincil satır (Aynı kurallar · Yeni sefer · Günlük ●), altında hayalet (Kopyala · Miras).

---

## 6. Yerleşim (wireframe)

### 6.1 Masaüstü 1440×880

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│FETİH │Yıl 34│ 🌾 412 ▲3 │ 🪵 88 ▲2 │ 🧱 64 ▲1 │ ⚒ 31 ▼1 │ 🪙 205 ▲6 │ 📜 47 ▲4 ││👥 312/400│🔥 78│🛡 64││◔ Fetih 18/33│⚙│ 52px
├───────────────────────────────────────────────────────────────────────────────┬────────────────────┤
│ ┌olay akışı──────────┐                                        ┌──┐            │ ▣ Akdere ★  [sancak]│
│ │⚔ Kızıl → Taşhisar  │                                        │＋│            │ Ova · Beyliğin      │
│ │  püskürtüldü       │                                        │－│ 44px       │┌─────┬─────┬──────┐ │
│ └────────────────────┘                                        │⤢ │ yüzen      ││Asker│Nüfus│Savunma│ │
│ ┌────────────────────┐                                        │◎ │ kontroller ││ 24  │ 61  │ ×1,45 │ │
│ │☠ Veba Kuzgunkale'de│          H A R İ T A                   └──┘            │└─────┴─────┴──────┘ │
│ └────────────────────┘          (esnek, ~1040×828)                            │(Genel)(Tesis 2/3)… │
│                                                                               │                     │
│                          [bağlamsal eylem: ⚔ Saldır %62 · ➜ Taşı]             │ panel içeriği       │
│                                                                               │ (kaydırılır)        │
│ ┌mini harita┐                                                                 │                     │
│ │ 180×124   │                   ┌toast──────────────────┐                     ├─────────────────────┤
│ └───────────┘                   │✔ Tarla Sv.2 kuruldu   │                     │[⚙][?]  [TURU BİTİR ▶]│ 72px
├───────────────────────────────────────────────────────────────────────────────┴─────────────────────┤
│ (alt çubuk yok)                                                         sağ panel 400px, sekmeler üstte│
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
 sağ panel sekmeleri (panel üstünde, 48px): [Bölge][Ekonomi][Ordu][Hedef][Tekno][Kayıt]
```
- Üst çubuk 52 px tek satır: sol blok (wordmark 64 px + yıl), orta blok 6 kaynak çipi (her biri ~108 px = 648), ayırıcı, nüfus/moral/asker (3×~84), ayırıcı, **zafer çipi** (en yakın zafer yolunun halkası + "Fetih 18/33"; tık → Hedef sekmesi), sağda ayarlar. Hanedan/kart/zorluk çipi üst çubuktan çıkar → Ordu sekmesi başlığına ve ayarlar menüsündeki "Bu sefer" kartına. "Zaferi ilan et" koşul sağlanınca zafer çipinin yerini alır (altın, nabızlı).
- Toplam genişlik: 64+70+648+16+252+16+170+44 ≈ 1280 < 1440 → rahat; 1280 px'de de sığar (çip 100 px'e iner).
- Turu Bitir **sağ alt köşe** (Civ alışkanlığı), 56 px yükseklik, panel genişliği eksi ikincil düğmeler; yanında ⚙ ve ? 44 px.
- Harita kontrolleri sağ üst (panelin solunda), dikey 4×44 + 4 px aralık; mini harita sol alt.

### 6.2 Tablet 768×1024 (dikey) ve 1024×768 (yatay)

```
┌──────────────────────────────────────────────┐
│FETİH Yıl 34 │🌾412▲3│🪵88│🧱64│⚒31│🪙205│📜47│⋯│ 52px (nüfus/moral/asker ⋯ açılırında)
├──────────────────────────────────────────────┤
│                                   ┌──────────┤
│            H A R İ T A            │ ▣ Akdere │ sağ çekmece 360px,
│                                   │ panel    │ haritanın ÜSTÜNE biner,
│  [olay akışı sol]                 │ içeriği  │ ‹ ile 56px ikon sütununa
│                       ┌──┐        │          │ daralır
│                       │＋│        │          │
│                       │－│        │          │
│                       └──┘        ├──────────┤
│ [mini]                            │[TURU BİTİR]│
└───────────────────────────────────┴──────────┘
```
- 768-1099 px: kaynak çipleri ikon+stok (eğilim yalnız işaret rengi: ▲ yeşil üçgen 8 px), 6 çip × 84 = 504 px. Nüfus/moral/asker `⋯` açılırında; moral < 50 ise moral çipi dışarı çıkar (kritik bilgi gizlenmez).
- Daraltılmış çekmece: 56 px dikey ikon şeridi (6 sekme ikonu + Turu Bitir ikon düğmesi altta). Harita kontrolleri çekmece kenarını izler.

### 6.3 Mobil 375×812

```
 kapalı (peek)                yarım (%50)                   tam (%92)
┌───────────────────────┐   ┌───────────────────────┐    ┌───────────────────────┐
│≡ Yıl34│🌾412▲│🪵88▲│🧱6›│   │≡ Yıl34│🌾412▲│🪵88▲│🧱6›│    │ ▬▬ (tutamaç)           │
├───────────────────────┤   ├───────────────────────┤    │ ▣ Akdere ★     [✕]    │
│[olay kartı]      ┌──┐ │   │                  ┌──┐ │    │[Bölge][Eko][Ordu]…    │ sekmeler
│                  │＋│ │   │   H A R İ T A    │◎ │ │    │                       │
│                  │－│ │   │                  └──┘ │    │ panel içeriği         │
│   H A R İ T A    │◎ │ │   ├──── ▬▬ ───────────────┤    │ (tam kaydırma)        │
│                  └──┘ │   │ ▣ Akdere ★  24⚔ 61👥  │    │                       │
│                       │   │[Bölge][Eko][Ordu][…]  │    │                       │
│   [⚔ Saldır %62]      │   │ (Genel)(Tesis)(Asker) │    │                       │
│                ┌────┐ │   │ panel içeriği         │    │                       │
├──── ▬▬ ───────┤ ▶  │─┤   │ kaydırılır            │    │                       │
│▣ Akdere ★ 24⚔ │BİTİR│ │   │                ┌────┐ │    │                ┌────┐ │
│ dokun: aç     └────┘ │   │                │ ▶  │ │    │                │ ▶  │ │
└───────────────────────┘   └────────────────┴────┴─┘    └────────────────┴────┴─┘
  peek 72px + safe-area       ~406px                       ~747px
```
- **Üst çubuk 48 px, tek satır, yatay kaydırılabilir şerit** (QA B10: 128 → 48 px). Solda yapışkan `≡` menü (44) + yıl çipi; kaydırılan kısım: 6 kaynak (ikon + stok + ▲/▼ işareti, ~64 px), sonra nüfus, moral, asker, zafer. Sağ kenarda 16 px karartma gradyanı + `›` ipucu (kaydırılabilir olduğu belli olsun). `scroll-snap-type:x proximity`. Herhangi bir çipe dokun → **kaynak detay alt çekmecesi** (tüm 10 göstergenin 2 sütunlu tablosu: stok, net, üretim, gider). Kritik çip (kıtlık yaklaşıyor) her zaman şeridin başına taşınır.
- **Alt çekmece üç durum:** *kapalı/peek* 72 px (seçili bölge özeti: sancak + ad + asker + nüfus; seçim yoksa "Bölgelerin: 7 · Hazır asker 18"); *yarım* %50 (harita üst yarıda görünür kalır; seçim yapınca otomatik buraya açılır); *tam* %92. Geçiş: tutamacı sürükle (hız eşiği 0,5 px/ms) veya peek'e dokun. Harita kaydırılınca tam → yarım'a iner. Durum `ui.sheet` değişkeninde; her `refresh()`'te korunur.
- **Turu Bitir: sağ alt FAB**, 64×64 (`--rad-lg`, `--brand`), çekmecenin üst kenarına 12 px binecek şekilde sabit konum (`bottom: calc(peek + 12px)`); çekmece tam açıkken çekmecenin içinde sağ altta kalır. Başparmak bölgesinde (sağ elle 375 px'te sağ alt %30 en rahat bölge). Sol elle oynayanlar için ayarlarda "Turu Bitir solda" seçeneği.
- **Harita kontrolleri:** sağ kenar, dikey, 44 px; mobilde ＋ − gizlenebilir (pinch var) → yalnız ◎ (seçime git) ve ⤢ (tümü) kalır. Mini harita mobilde yok; ⤢ yeterli.
- **Bağlamsal eylem düğmesi** (mobilin sağ tık karşılığı): kendi bölgen seçiliyken komşuya dokununca hedefin üstünde yüzen hap: `[⚔ Saldır %62]` ya da `[➜ Taşı]`; ikinci dokunuş pencereyi açar. Masaüstünde de görünür (sağ tığı bilmeyenler için).
- **Olay/uyarı alanı:** haritanın sol üstü, üst çubuğun 8 px altı, en çok 2 kart, 280 px genişlik; toast'lar aynı sütunda (alt çekmece ve FAB'ı asla örtmez).
- Güvenli alan: `padding: env(safe-area-inset-*)` üst çubukta ve çekmece altında; `viewport-fit=cover` meta eklenir. Yükseklikler `dvh` ile (iOS adres çubuğu).

### 6.4 Sihirbaz ve bitiş ekranı yerleşimi

- Sihirbaz masaüstünde 880 px modal (bugünkü), mobilde **tam ekran sayfa** (alt çekmece değil: 4 adımlı akış için ekranın tamamı gerekir). Üstte 4 adım göstergesi (numaralı daireler + çizgi; geçilen `--good` `i-check`), altta yapışkan gezinme `[‹ Geri] … [İleri ›]` 56 px. Hanedan kartları mobilde 2 sütun, kart yüksekliği 132 px, ayrıntı alttaki "Seçili hanedan" kutusunda (bugünkü `.mobdet` fikri).
- Bitiş ekranı masaüstünde 880 px; mobilde tam ekran, kahraman harita üstte tam genişlik (16:11), skor altında; eylem bloğu yapışkan altta.

---

## 7. İkon seti

Sprite: **`docs/ikonlar.svg`** (95 `<symbol>`, 25,6 KB ham; gzip ~7 KB). Önizleme: `docs/ikon-onizleme.html` (tarayıcıda aç; 48 px ve 18 px boyutta tüm ikonlar). Üreteç betiği belgede değil; sprite elle düzenlenebilir düz SVG'dir.

### 7.1 Stil kuralları

- **Izgara:** 24×24 `viewBox`, 1 px güvenli kenar (çizimler 1-23 arası), optik ağırlık merkezi ortada.
- **Seçim: dolu glif** (2 px çizgi değil). Gerekçe: (1) ikonlar en çok 14-18 px'te (maliyet satırı, HUD çipi) ve haritada 12 px'te görünür; 2 px çizgi 14 px'te 1,2 px'e iner ve koyu zeminde kaybolur, dolu siluet okunur kalır; (2) Civ VI / Humankind kaynak ikonları dolu silüettir, "oyun" hissini bu verir; (3) dolu glif tek `fill=currentColor` ile renklenir, çizgi kalınlığı ölçekle bozulmaz. İstisna: ince doğal parçalar (yay kirişi, başak sapı, ok gövdesi, ses dalgası) 2 px `currentColor` çizgi, yuvarlak uç.
- **Köşe:** dış köşeler keskin ya da 1 px yarıçap; yuvarlatma yalnız doğal formda (kütük, sikke). Dolu glif + keskin kenar = "temiz modern".
- **Renk:** tek renk `currentColor`. İç kesikler (kapı, pencere, sayfa çizgileri) iki yolla: `fill-rule="evenodd"` delik (zemin görünür) ya da `fill="var(--icon-cut,#10131A)"` (zemin rengiyle boyanan parça; çip içinde `--icon-cut:var(--bg-2)` verilir). İsteğe bağlı tek vurgu: yalnız `i-olay` mührü `var(--brand)`.
- **Boyutlar:** 14 (satır içi maliyet), 16 (etiket, rozet), 18 (HUD çipi), 20 (sekme, düğme), 24 (liste başı, panel başlığı), 28-32 (modal başlığı), 48 (başarım madalyası, sihirbaz kartı). Ara boyut yok.
- **Erişilebilirlik:** her `<symbol>` Türkçe `<title>` taşır; dekoratif kullanımda `<svg aria-hidden="true">`, anlam taşıyan tek başına ikon düğmede `<button aria-label="Yakınlaştır">`.

Kullanım:
```html
<!-- body başına bir kez (ikonlar.svg içeriği aynen) -->
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true"> … <symbol id="i-tahil" viewBox="0 0 24 24">…</symbol> … </svg>
<!-- kullanım -->
<svg class="ic" aria-hidden="true"><use href="#i-tahil"/></svg>
```
```css
.ic{width:1em;height:1em;fill:currentColor;flex:none;vertical-align:-.15em}
.chip,.card,.btn{--icon-cut:var(--bg-2)}.btn.pri{--icon-cut:var(--brand)}
```
```js
const ic=(id,c='')=>`<svg class="ic ${c}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
// RES[].e, FIELD[].e, UNITS[].e … alanlarına ek olarak RES[].i='tahil' gibi ikon kimliği eklenir; e (emoji) metin dışa aktarma (shareTxt) için kalır.
```

Örnek simge (sprite'tan):
```svg
<symbol id="i-asker" viewBox="0 0 24 24"><title>Asker</title><path d="M12 2 3.5 5v6c0 5.3 3.6 9.6 8.5 11 4.9-1.4 8.5-5.7 8.5-11V5Z"/></symbol>
```

### 7.2 Kimlik listesi (95)

| Grup | Kimlikler (`i-…`) |
|---|---|
| Kaynak (6) | `tahil` `odun` `tas` `demir` `altin` `bilgi` |
| Gösterge (4) | `nufus` `moral` `asker` `yil` |
| Birlik (5) | `piyade` `okcu` `suvari` `kusatma` `yeniceri` |
| Askeri kuruluş (5) | `karakol` `kisla` `talimhane` `ordugah` `harbiye` |
| Tesis (6) + sur | `tarla` `kereste` `tasocagi` `demirmaden` `pazar` `medrese` · `sur` · `baskent` |
| Özel bölge (8) | `gecit` `kavsak` `liman` `harabe` `kale` `mabet` `verimli` `damar` |
| Zafer yolu (3) | `v-fetih` `v-medeniyet` `v-hegemonya` |
| Arayüz | `ok-sag` `ok-sol` `yukselt` `ileri-tur` `kilit` `kilit-acik` `ayarlar` `kapat` `ses-acik` `ses-kapali` `oyna` `duraklat` `harita` `kayit` `miras` `basarim` `gunluk` `olay` `gunce` `onay` `uyari` `bilgi-i` `yardim` `arti` `eksi` `sigdir` `hedefle` `menu` `yenile` `zar` `kopyala` `ice-aktar` |
| Oyun durumu | `saldiri` `tasi` `ateskes` `vasal` `koalisyon` `kupa` `rutbe` `teshis` `olum` `goz` `terazi` `sancak` `ganimet` `yagma` `nehir` `kopru` `dag` |
| Hanedan (7) | `d-klasik` `d-boru` `d-tunc` `d-kartal` `d-bilge` `d-deniz` `d-akinci` |

### 7.3 Emoji → ikon eşlemesi (index.html envanteri, 110 farklı simge)

| Emoji (kullanım) | Yerine | Not |
|---|---|---|
| 🌾 Tahıl / Tarla / eko dalı / Usta Çiftçi | `tahil` (kaynak), `tarla` (tesis) | Tesis ile kaynak ayrı ikon: bugün ikisi de 🌾 |
| 🪵 Odun / Kereste / kuşatma dalı | `odun`, `kereste`; kuşatma dalı → `kusatma` | |
| 🧱 Taş / Taş Ocağı | `tas`, `tasocagi` | |
| ⚒️ Demir / Demir Madeni | `demir`, `demirmaden` | |
| 🪙 Altın / Pazar · 💰 ganimet, Paralı Askerler, Hazine Sandığı | `altin`, `pazar`; 💰 → `ganimet` | |
| 📜 Bilgi / Medrese / Bilge / Medeniyet / Teknoloji sekmesi | `bilgi`, `medrese`, `d-bilge`, `v-medeniyet`; sekme → `bilgi` | 📜 26 yerde 5 farklı anlamda kullanılıyordu |
| 👥 nüfus/işgücü · 🔥 moral, Saldırgan · 🛡/🛡️ asker, savunma dalı, Savunmacı, Sadık Muhafız | `nufus` · `moral` · `asker` | |
| 📅 Yıl, Günlük | `yil` (HUD), `gunluk` (günlük meydan okuma) | |
| 🗡️ Piyade · 🏹 Okçu · 🐎 Süvari · 🪨 Kuşatma · ⚔️ Yeniçeri | `piyade` `okcu` `suvari` `kusatma` `yeniceri` | ⚔ ayrıca Fetih, saldırı, Ordu sekmesi, Erken Savaş, koalisyon → bağlama göre `v-fetih` / `saldiri` / `koalisyon` |
| 🏭 askeri üretim dalı · 🏯 Kışla Temeli · 🏗 Kur · ⬆ yükselt · ⚑ kuruluş kademesi (haritada) | `kisla` · `kisla` · `arti` · `yukselt` · kademe rakamı + `karakol`…`harbiye` | |
| 👁️ Strateji/görüş · 🦊 Fırsatçı · ⚖️ Ölçülü/Tüccar | `goz` · `goz` · `terazi` | |
| 🏰 Bölge sekmesi, Sağlam Surlar, başkent sayacı | `kale` (sekme), `sur` (kart), `baskent` | |
| 🏳️ Klasik · 🐺 Börü · 🔨 Tunç · 🦅 Kartal · ⚓ Deniz, Körfez · 🏇 Akıncı, Yağma | `d-klasik` `d-boru` `d-tunc` `d-kartal` `d-deniz` (Körfez haritası → `liman`) `d-akinci`, Yağma → `yagma` | |
| 👑 Hegemonya, Zaferi ilan et, kuruluş başlığı · 🏆 Hedef sekmesi, Zafer! · 🎖 rütbe · 🏅 başarım · 🎯 hedef başarım | `v-hegemonya` · `kupa` · `rutbe` · `basarim` · `hedefle` | |
| ★ başkent · ☆ boş seviye · ◆◈◇ eser aşaması · ●○ zorluk noktası | `baskent`; seviye/aşama/zorluk → CSS noktaları (5.5, 5.6) | Metin içi simge olarak kalabilir ama renkle |
| 🔒 / 🔓 | `kilit` / `kilit-acik` | |
| ⛓ vasal, Biat, Demir Kıtlığı · 🤝 ateşkes, koalisyon dağıldı · 🕊 barış sözü, Uzun Barış | `vasal` · `ateskes` · `ateskes` | |
| 🌊 nehir, Nehir Vadisi · 🌉 köprü · 🏔️ sıradağ · ⛰️ Dağ Kalesi · 🗺️ Kıta | `nehir` · `kopru` · `dag` · `gecit` · `harita` | |
| ☠ veba, Kara Veba · 💀 yenilgi, en büyük kayıp · 🏴 Beylik Yıkıldı | `olum` · `olum` · `sancak` (soluk) | |
| 📯 yıl raporu · olay e: 🐪🥀😩💍🧳📚📐⛏🛖☄ | `olay` (başlık); olay kendi ikonu: kartın tür rengi + aşağıdaki eşleme | E01 kervan → `altin`, E02 kıtlık → `tahil`, E04 yorgunluk → `moral`, E06 düğün → `ateskes`, E07 göç → `nufus`, E08 kütüphane → `bilgi`, E09 mimar → `sur`, E12 maden → `demirmaden`, E13 biat → `vasal`, E16 yıldız → `baskent` |
| Kart (mutatör) e: 🥀⚔️🛖🏰💰✨🌻⛓️☠️🌫️🩸🕊️⛪🥾 | Kart ikonu: `tahil` `saldiri` `nufus` `sur` `altin` `kupa` `verimli` `demir` `olum` `goz` `olum` `ateskes` `koalisyon` `sancak` | Kart yüzünde ikon 32 px + tür şeridi; aynı ikon iki kartta ise tür rengi ayırır |
| Sancak e: 🏵️🐉🚩🎏🌟 | `sancak` + sancak rengi deseni | Kozmetik sancaklar ikon değil **renk/desen** ödülüdür (wordmark yanında küçük sancak) |
| 🧭 Yeni sefer, Haritacı · 🎲 zar · ⚡ Hızlı Başla/Önerilen · 🎁 Hediye · 🎚️ zorluk · 🃏 kartlar · 🩺 teşhis · ❔ gizli | `harita` · `zar` · `ileri-tur` · `onay` · `rutbe` · `olay` · `teshis` · `yardim` | |
| 📋 kopyala · 📥 yükle · 💾 kayıt · 🏛 Miras · 📖 Kayıt sekmesi | `kopyala` · `ice-aktar` · `kayit` · `miras` · `gunce` | |
| ✔ ✓ ✖ ✕ ✗ · ⚠ · ▶ · ↻ · ➜ → | `onay` · `kapat` · `uyari` · `ileri-tur`/`ok-sag` · `yenile` · `tasi`/`ok-sag` | Metin içindeki "→" (ok işareti, 44 yer) yazı karakteri olarak kalır |
| ＋ － ⤢ ◎ (harita) · ? · ↻ (alt çubuk) | `arti` `eksi` `sigdir` `hedefle` · `yardim` · `yenile` | |

Dışa aktarılan düz metin (`shareTxt`, panoya kopyalanan sonuç kartı) emoji kullanmaya **devam eder**: başka uygulamada SVG görünmez.

### 7.4 Harita üstü ikonlar (Canvas)

Bugünkü çizimler (`iCastle`, `iFort`, `iVillage`, `iFeat`, `iBadge`) rölyefle uyumlu "minyatür" üslupta ve iyi; **kale/köy yerleşimleri korunur** (haritanın parçası), yalnız HUD dili ile örtüşen katman değişir:

1. **Bölge rozeti** (`iBadge`): kalkan biçimi → **sancak şekli** (2.6: oyuncu kalkan, Kızıl üçgen, Mavi daire, Yeşil kare, Mor baklava, Kabile altıgen). Boyut 28×22 (k=1), dolgu sancak rengi, 2 px `--ink` hale + 1 px iç açık çizgi (`rgba(255,255,255,.25)`), sayı `--ink` 700 12 px `--font-num`. Seçili: hale 3 px beyaz + dış 2 px `--ink`. Bilinmeyen asker "?" aynı rozet, desen sisli (8.4). Askeri kuruluş kademesi (`⚑2`) rozetin sağ üstüne 12 px küçük daire içinde rakam (`--bg-1` zemin, `--brand` rakam).
2. **Özel bölge işareti** (`iFeat`): bugünkü 8,5 px yarıçaplı daire korunur, ama içeriği SVG sprite'ındaki aynı silüet olur ki HUD'daki ikonla birebir eşleşsin. Yöntem: açılışta her `i-…` simgesini bir kez `Path2D`'ye çevir (`new Path2D(d)`, sprite'taki `d` dizgeleri bir JS sabitinde de tutulur: `ICON_PATHS={gecit:'M1 21…',…}`; yalnız 8 özel bölge + 5 kuruluş + baskent = 14 yol, ~3 KB) ve `ctx.translate/scale(k*12/24)` ile `fill`. Daire zemin `rgba(16,19,26,.78)`, kenar 1,5 px `--brand`; ikon `#F1F3F7`.
3. **Kale/köy**: `iCastle` bayrağı (`flag`) sancak rengini ve **desenini** taşır (bayrak üstünde tek çapraz çizgi / nokta: 2.6). Kademe ≥ 2 sur duvarı korunur.
4. **Çizim kuralı**: tüm harita ikonları önce 2 px `--ink` (`rgba(16,19,26,.85)`) hale, sonra dolgu; gölge elipsi (`rgba(0,0,0,.3)`) korunur. `k` ölçeği bugünkü `clamp(z*1.05,.5,1.55)` korunur ama LOD eşiklerine bağlanır (8.5).
5. **Performans**: rozetler her karede çiziliyor (55 bölge × ~10 çağrı); efekt döngüsü 60 fps çalışırken bu sorun değil (~0,5 ms), ama rozetler `OffscreenCanvas` önbelleğine alınabilir (sahip+sayı+seçim değişince yeniden).

---

## 8. Harita görsel dili

Katmanlar (alttan üste): `ART` (rölyef, değişmez) → `OVL` (sahiplik, `drawOverlay`, yalnız durum değişince) → **`FX` (yeni efekt katmanı)** → ikonlar/rozetler/etiketler (`drawIcons`) → DOM (bağlamsal düğme, ipucu). `FX` ayrı bir `<canvas id=fx>` değil, `render()` içinde OVL'den sonra çizilen geçici öğeler listesidir (`FXQ`); döngü yalnız `FXQ` boş değilken veya seçim nabzı varken `requestAnimationFrame` ile döner, boşken durur (pil).

### 8.1 Sahiplik katmanı (`drawOverlay`)

| Öğe | Bugün | Yeni |
|---|---|---|
| Bölge dolgusu | sahip rengi, alfa 58/255 (%23) | sahip rengi **%18** düz + **desen** (2.6) %22 alfada 6 px aralıkla; oyuncu desensiz %22 |
| İç sınır şeridi | yok | sahip rengi **3 px** iç şerit (sınır pikselinden 3 px içe, `bP` komşuluğundan mesafe ile), alfa %85; komşu aynı sahipse yok |
| Devlet sınırı | sahip rengi tek piksel 240 | 1 px `--ink` %70 (iki devlet arası) + iki yanda iç şeritler → okunur çift renkli sınır |
| İç (aynı sahip) bölge sınırı | `[30,24,18]` alfa 60 | aynı, alfa 50 (ince, kesik değil) |
| Kabile | boyanmaz | boyanmaz; yalnız 1 px kemik rengi `#CFC8BA` %45 sınır |

Desen üretimi: `drawOverlay` piksel döngüsünde zaten `(x+y)>>3` deseni kullanılıyor; aynı yerde sahip türüne göre: Kızıl `((x+y)%6<1)`, Mavi `(x%6<2&&y%6<2)`, Yeşil `(y%6<1)`, Mor `((x-y+6000)%6<1)`. Maliyet: döngüye bir tamsayı karşılaştırması (bugünkü 1,76 Mpx döngü ~25-40 ms; değişmez). **Renk körü modu** açıkken desen alfası %22 → %40.

### 8.2 Seçim vurgusu (nabız)

Bugün: seçili bölge beyaz %24 dolgu + tam opak açık sınır (OVL'de sabit).
Yeni: OVL'de seçili bölgeye yalnız %10 açık dolgu; **sınır FX'te** çizilir: seçim değişince seçili bölgenin sınır pikselleri bbox boyutunda küçük bir tuvale (`selMask`) bir kez yazılır (bP listesi zaten var, ~1-2 ms), her karede `globalAlpha = .55 + .45*sin(t*2π/1.6s)` ile `drawImage` edilir, ayrıca 2 px dışa genişletilmiş kopyası `--brand` %30 (parıltı). Azaltılmış harekette nabız yok, sabit %100.

### 8.3 Saldırılabilir / taşınabilir hedefler (çizgili taramanın yerine)

Bugünkü kırmızı/beyaz çapraz tarama (`hatchFlags`, alfa 52/40) araziyi örtüyor ve "saldırı şansı" bilgisini vermiyor. Yeni:

- **Saldırılabilir komşu:** bölge iç şeridi 3 px → `--bad` kesik çizgi (6 on/4 off, FX'te; seçim maskesi gibi bir kez üretilir) + bölge merkezinde, rozetin üstünde **hedef işareti**: 22 px yuvarlak `--bg-1` zemin, `i-saldiri` ikonu ve yanında şans `%62` (renk: ≥70 `--good`, ≥40 `--brand`, altı `--bad`; 11 px 700). Zoom < 0,7'de yalnız ikon, yüzde ipucuda.
- **Taşınabilir (kendi) komşu:** 2 px beyaz kesik iç çizgi + rozet üstünde `i-tasi` 18 px beyaz.
- **Ateşkes/vasal (saldırılamaz) komşu:** `i-ateskes` / `i-vasal` gri, kesik çizgi yok.
- **Hover/odak hedef:** seçili bölgeden hedefe **ordu oku önizlemesi** (8.6) %50 opak; mobilde bağlamsal düğme (6.3).

### 8.4 Sis / bilinmeyen bölge

Oyunda "görüş" yalnız asker sayısını gizliyor (`vis(i).txt='?'`, Sisli Harita kartı, Haritacılık/Casusluk). Görsel karşılık:
- Asker sayısı bilinmeyen bölge: rozet sayısı "?" ve rozet dolgusu `--bg-3` (sahip rengi yalnız 3 px kenar halkasında) → "bilgi yok" bir bakışta okunur.
- Tahmini sayı (Haritacılık "~12"): rozet normal, sayı önünde küçük `~`, 85% opak.
- Sisli Harita kartı açıkken görüş dışı bölgelerde OVL'ye ek `rgba(14,17,23,.28)` perde + `filter` değil piksel döngüsünde doygunluk azaltma (gri karışım %35). Kenar 24 px yumuşak geçiş gerekmez (bölge birimi).

### 8.5 Etiket tipografisi ve LOD

Etiketler `--font-ui` 700 (Georgia kaldırılır), 2,8 px `rgba(16,19,26,.85)` hale. Oyuncunun bölgeleri `#FFE2A0`, diğerleri `#F1F3F7` (bugünkü gibi). Başkent etiketi büyük harf ve `letter-spacing:.06em` (`toLocaleUpperCase('tr-TR')`).

| Zoom (`cam.z`) | Görünen |
|---|---|
| < 0,6 (tüm harita, mobil açılış) | Sahiplik dolgusu + sınırlar; yalnız başkent kaleleri; rozetler küçük (k=.5) ve **yalnız sayı**; etiket yalnız başkentler ve seçili bölge; özel bölge işaretleri gizli |
| 0,6-1,0 | Tüm yerleşimler; rozetler; özel bölge işaretleri; etiket: başkentler, seçili, oyuncunun bölgeleri |
| 1,0-1,8 | + tüm etiketler, kuruluş kademesi rozeti, hedef işaretlerinde yüzde |
| > 1,8 | + rozet altında birlik bileşimi şeridi (5 küçük renkli çubuk: piyade/okçu/süvari/kuşatma/yeniçeri oranı; yalnız görülebilen bölgelerde) |

Etiket çakışması: etiketler `ly` sırasıyla çiziliyor; çakışan etikette (bbox kesişimi) düşük öncelikli (oyuncuya ait değil, başkent değil) olan gizlenir. 55 bölgede basit O(n²) bbox kontrolü < 0,2 ms.

### 8.6 Ordu hareket oku

- Şekil: kaynak bölge merkezinden hedefe **ikinci derece Bezier**, kontrol noktası orta noktanın 18% dik yönde ötesinde (düz ok değil, harita ölçeğinde "sefer" hissi). Kalınlık `clamp(3 + n/6, 3, 10)` px (n = gönderilen asker), sahip rengi + 2 px `--ink` hale, uçta 14 px üçgen ok başı.
- Animasyon: saldırı onayında ok 0 → tam uzunluğa 350 ms (`setLineDash` + `lineDashOffset`), ardından ok boyunca 3 adet küçük sancak noktası 500 ms akar. Nehir geçişi varsa (`crossAt`) geçiş noktasında küçük `i-nehir` / `i-kopru` işareti.
- Yapay zekâ saldırıları (tur sonunda): aynı ok, rakip renginde, %70 opak, sırayla 120 ms aralıkla (en çok 6 ok; fazlası birlikte); oyuncunun bölgesine yönelenler önce ve kalın.

### 8.7 Savaş efekti

Hedef bölge merkezinde, ok bittikten sonra, toplam 600 ms:
1. 0-120 ms: iki kılıç silueti (`i-v-fetih` Path2D) 1,4 → 1,0 ölçek, beyaz.
2. 120-400 ms: dışa genişleyen halka (r 8 → 48 px, 3 → 0 px, `--tx-1` → saydam) + 6 kıvılcım çizgisi (rastgele açılı 10 px, sönerek); `savas-carpisma` sesi bu anda.
3. 400-600 ms: sonuç işareti: kazanıldıysa `i-onay` `--good` daire içinde, kaybedildiyse `i-kapat` `--bad`; 700 ms kalır, solar.
4. Ekran sarsıntısı: yalnız başkent alındığında ve oyuncunun başkenti düştüğünde, 3 px, 180 ms, `cam` ofseti üzerinden (DOM değil). Azaltılmış harekette yok.

### 8.8 Ganimet yüzen sayılar

Fetih/yağma sonrası hedef bölgeden HUD'a: her kaynak için `[ikon 14][+38]` hapı (`--bg-1` %90, kaynak rengi sayı), 80 ms aralıkla sıralı doğar, 900 ms'de 28 px yukarı süzülür ve solar (`ease-out`). Aynı anda HUD'daki ilgili çip `up` nabzı + sayaç. Masaüstünde ek olarak hap, son 300 ms'de çipin ekran konumuna doğru kayar ("toplanma"); mobilde yalnız yukarı süzülme (şerit kaydırılmış olabilir). En çok 6 hap. Kayıp (savunmada stok kaybı, veba): aynı desen `--bad` ve aşağı süzülme.

### 8.9 Sahiplik değişimi (renk dalgası)

Fethedilen bölgede eski renkten yeni renge **dalga**: saldırının geldiği sınır noktasından (kaynak bölgeye en yakın sınır pikseli) başlayan genişleyen daire maskesi, 500 ms `ease-in-out`.
Uygulama: fetih anında bölgenin bbox'ı kadar küçük tuvale yeni sahip dolgusu + iç şerit çizilir (OVL'nin o bölge kesiti, `ids` maskesiyle; ~bbox 120×120 = 14 kpx, < 1 ms). FX her karede `ctx.save(); clip(daire r=t*Rmax); drawImage(kesit)`. Dalga bitince `drawOverlay()` bir kez çalışır ve kesit atılır. Dalga ön cephesinde 2 px `--tx-1` %60 halka (ince "mürekkep yayılması" çizgisi). Ardından başkentse kale bayrağı 0 → 1 ölçek "dikilme" (300 ms, `--ease-back`) + `fetih` sesi.
Kaybedilen bölge: aynı dalga, rakip renginde, %70 hızda; ek olarak bölge bir kez `--bad` %25 yanıp söner.

### 8.10 Olay işaretleri

Bir bölgeye bağlı olaylar (veba, isyan, maden çöküşü, kervan, yağmalandı, yıldız) haritada **pin** bırakır: 18 px baklava, `--bg-1` zemin, olay tür rengi 2 px kenar, içinde olay ikonu 12 px; bölge rozetinin sol üstünde. Geliş: yukarıdan 12 px düşüp oturma (240 ms) + tek halka dalgası. Süre: etkisi sürdükçe (ör. yağmalandı 3 tur), yoksa 1 tur. Pinler tıklanabilir (ipucu: olay adı + kalan süre). Koalisyon kurulduğunda üye rakiplerin başkentlerinde `i-koalisyon` pini ve aralarında 1 px kesik `--bad` çizgi (yalnız ilk 2 s, sonra pin kalır).

### 8.11 Tur geçişi haritada

Turu Bitir → (1) yapay zekâ okları (8.6) hızlı akış, (2) yıl kartı (9. bölüm "tur geçişi"), (3) kaynak çipleri sayar. Toplam ≤ 1,2 s; oyuncu herhangi bir yere dokunursa tamamı anında bitirilir ve son durum gösterilir. "Hızlı tur" ayarı (13) açıkken yalnız (3).

---

## 9. Hareket (animasyon) kataloğu

### 9.1 Easing ve süre token'ları

```css
:root{
 --ease-out:cubic-bezier(.2,.8,.2,1);      /* varsayılan: giriş, nabız */
 --ease-in:cubic-bezier(.4,0,1,1);         /* çıkış */
 --ease-io:cubic-bezier(.65,0,.35,1);      /* yer değiştirme, dalga */
 --ease-back:cubic-bezier(.34,1.56,.64,1); /* ödül, rütbe, bayrak (hafif taşma) */
 --d-1:80ms;--d-2:140ms;--d-3:200ms;--d-4:260ms;--d-5:400ms;--d-6:600ms;
}
@media (prefers-reduced-motion:reduce){:root{--d-1:0ms;--d-2:0ms;--d-3:0ms;--d-4:0ms;--d-5:0ms;--d-6:0ms}}
:root.rm{--d-1:0ms;--d-2:0ms;--d-3:0ms;--d-4:0ms;--d-5:0ms;--d-6:0ms} /* ayarlardan "animasyonları azalt" */
```
JS animasyonları tek bir `RM()` işlevine bakar: `matchMedia('(prefers-reduced-motion: reduce)').matches || SET.rm`. Kural: azaltılmış harekette **yer değiştirme ve ölçek yok, opaklık geçişi ≤ 120 ms kalabilir**, bilgi taşıyan sonuç (sayının son değeri, renk) aynen gösterilir.

### 9.2 Katalog

| Ad | Tetikleyici | Süre | Easing | Özellik | Azaltılmış hareket |
|---|---|---|---|---|---|
| `press` | düğme basılı | 80 | ease-out | transform translateY(1px) scale(.98) | yok |
| `tab-ink` | sekme değişimi: alt çizgi kayar | 180 | ease-out | transform translateX + scaleX | anında |
| `tab-swap` | sekme içeriği değişimi | 140 | ease-out | opacity 0→1, translateY(4px→0) | yalnız opacity 100 ms |
| `panel-in` | sağ panel/tablet çekmece açılışı | 260 | ease-out | transform translateX(100%→0) | anında |
| `sheet-state` | mobil alt çekmece durum değişimi (peek/yarım/tam) | 260 (sürüklemede parmağı izler, bırakınca yay) | ease-out | transform translateY | anında |
| `modal-in` / `modal-out` | modal aç / kapa | 200 / 140 | ease-out / ease-in | opacity, scale(.96→1); perde opacity | opacity 100 |
| `sheet-in` | mobil modal (alt çekmece kalıbı) | 260 | ease-out | translateY(100%→0) | opacity 100 |
| `count` | sayı sayacı (HUD stok, skor, MP) | HUD 400; skor 1200; MP 600 | ease-out (skorda expo) | `textContent` (rAF), genişlik sabit (tabular) | son değer anında |
| `pulse-good` / `pulse-bad` | kaynak artış / azalış | 400 | ease-out | çip `background-color` wash → saydam; sayı scale(1.08→1) | yalnız renk (ölçek yok) |
| `crit-blink` | eksik kaynak vurgusu | 3×200 | ease-io | box-shadow kenar rengi | 1 kez, 200 |
| `toast-in` / `toast-out` | toast | 180 / 140 | ease-out / ease-in | translateY(-8px→0), opacity | opacity |
| `float-num` | ganimet/kayıp yüzen sayı (8.8) | 900 | ease-out | Canvas: y −28, alpha 1→0 | sayı 900 ms yerinde durur, sonra kaybolur |
| `year-card` | tur geçişi: ortada "Yıl 35" kartı | 700 (200 giriş + 300 bekle + 200 çıkış) | ease-out / ease-in | opacity, scale(.92→1), yıl rakamı alttan kayar (translateY 100%→0, eskisi yukarı) | yalnız HUD'daki yıl çipi değişir, kart yok |
| `ai-arrows` | tur sonu rakip hareketleri (8.6) | ≤ 720 toplam | ease-io | Canvas lineDashOffset | okların son hali 600 ms gösterilir, akış yok |
| `march` | saldırı oku çizimi | 350 + 500 akış | ease-io | Canvas | ok anında tam |
| `clash` | savaş efekti (8.7) | 600 | ease-out | Canvas ölçek, halka, kıvılcım | yalnız sonuç işareti (✓/✕) 700 ms |
| `shake` | başkent alındı/düştü | 180 | ease-io | Canvas `cam` ofseti ±3 px | yok |
| `conquest-wave` | fetih: renk dalgası (8.9) | 500 | ease-io | Canvas clip daire | anında yeni renk + 1 kez opacity 200 ms |
| `flag-raise` | başkent fethi bayrağı | 300 | ease-back | Canvas ölçek 0→1 | anında |
| `loss-flash` | bölge kaybı | 2×160 | ease-io | Canvas `--bad` %25 alfa | 1 kez 160 |
| `defeat` | oyun yenilgisi: ekran renk çekilmesi | 900 | ease-in | harita tuvaline `filter:saturate(1→.15) brightness(1→.7)` (yalnız tuval, CSS filter bir kez) + bitiş ekranı `modal-in` 300 ms gecikmeli | anında gri, gecikme yok |
| `victory` | oyun zaferi: tüm sahiplik %100 parlaklıkla 1 kez dalga + bitiş ekranı | 900 | ease-io | OVL alfa 1→1,6→1 (FX'te ek parlak kopya) | anında |
| `beat-in` | bitiş ödül vuruşları | 240, 350 aralıkla | ease-out | opacity, translateX(12px→0) | hepsi birlikte, opacity 100 |
| `rank-up` | rütbe yükselişi | 500 | ease-back | scale 1→1.15→1, `--e-glow` | yalnız glow sabit |
| `unlock` | kilit açılışı (miras, kart, teknoloji kademesi) | 450 | ease-back | `i-kilit` dili 0→−4 px yukarı + -20° dönüş (ayrı `<g>`), sonra kart kenarı gri→altın 200 | ikon doğrudan `i-kilit-acik` |
| `event-in` | olay kartı | 260 | ease-out | opacity, translateY(24px→0); tür şeridi soldan dolar (scaleX) | opacity 100 |
| `event-pick` | olay seçeneği seçildi | 200 + 140 kapanış | ease-out | seçilen kart bg → `--brand-wash`, diğerleri opacity .4 | renk anında |
| `pin-drop` | olay pini (8.10) | 240 | ease-back | Canvas y −12→0 | anında |
| `sel-pulse` | seçili bölge sınırı (8.2) | 1600 döngü | sin | Canvas alfa | sabit |
| `end-glow` | "Turu Bitir" hazır | 2000 döngü | ease-io | box-shadow opacity (sözde öğe opacity) | sabit hafif glow |
| `spin` | yükleniyor halkası | 800 döngü | doğrusal | transform rotate | 3 nokta, opaklık değişimi |
| `load-map` | açılış: "Harita çiziliyor" | genMap+buildArt süresi (~1,3 s) | — | ilerleme çubuğu scaleX aşamalara göre (genMap %40, buildArt %90, ilk render %100) + wordmark | çubuk aynı (bilgi) |
| `wiz-step` | sihirbaz adım geçişi | 200 | ease-out | içerik translateX(±16px→0), opacity | opacity |
| `card-flip` | sihirbaz kural kartları çevrilir (§12 "yüzü kapalı çekilir ve çevrilir") | 3×320, 90 aralıkla | ease-io | transform rotateY(180→0) (`backface-visibility:hidden`) | yüzü açık gelir |

### 9.3 Performans kuralları

- DOM'da yalnız `transform` ve `opacity` anime edilir (istisna: kaynak çipi `background-color` 400 ms; çip katmanı küçük ve `contain:paint` ile yalıtılır). `width`, `height`, `top`, `left`, `box-shadow` anime edilmez; glow için sözde öğe opacity'si kullanılır.
- `will-change` yalnız animasyon süresince eklenir/kaldırılır (kalıcı katman şişirmez; mobil GPU belleği).
- 60 fps mobil bütçesi: kare başına ≤ 8 ms JS + çizim (orta seviye Android, 4× CPU yavaşlatma ile ölçülür). `render()` bugün ~1 ms; FX + rozetler ≤ 3 ms hedef.
- **`drawOverlay()` asla animasyon karesinde çağrılmaz** (1,76 Mpx döngü 25-40 ms). Tüm geçici görseller FX listesinde bbox kesitleriyle yapılır (8.2, 8.3, 8.9). `drawOverlay` yalnız durum değişince (bugünkü `refresh()`), ve fetih dalgası bitince.
- Tek rAF döngüsü: `loop(t)` → `FXQ` güncelle → `render()`; `FXQ` boş ve nabız yoksa döngü durur (`req()` bugünkü gibi talep üzerine çizim). Sekme gizliyken (`visibilitychange`) döngü durur ve bekleyen efektler son karelerine atlanır.
- Sayaç (`count`) birden çok çipte aynı anda: tek rAF içinde topluca güncellenir, çip başına ayrı zamanlayıcı yok.
- Ölçüm: Chrome Performance, 375×812 + 4× CPU, 20 tur: uzun görev (> 50 ms) yalnız `endTurn`+`refresh` içinde kabul (bugün refresh ort. 9 ms); animasyon karelerinde 0 uzun görev.

---

## 10. Ses tasarımı (WebAudio, dosyasız)

### 10.1 Motor mimarisi

```
AudioContext (tek, ilk kullanıcı etkileşiminde)
 └─ master (GainNode, SET.vol.master) ─ DynamicsCompressor (eşik −14 dB, oran 4, atak 3 ms) ─ destination
     ├─ sfxBus (Gain, SET.vol.sfx)  ← her efekt sesi kendi geçici düğümleriyle buraya
     ├─ uiBus  (Gain, SET.vol.ui)   ← tık/hover (ayrı kısılabilsin: en sık duyulan)
     └─ musBus (Gain, SET.vol.music) ─ BiquadFilter "duck" (lowpass 18 kHz; olay/savaşta 900 Hz'e 300 ms iner)
NOISE: açılışta 1 s beyaz gürültü AudioBuffer (mono, 44,1 kHz ≈ 176 KB RAM) bir kez üretilir, tüm gürültülü efektler paylaşır.
```

```js
const SND={ctx:null,buses:{},noise:null,last:{}};
function sndInit(){if(SND.ctx)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
 const c=SND.ctx=new C({latencyHint:'interactive'});const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.attack.value=.003;
 const m=c.createGain();m.connect(comp);comp.connect(c.destination);SND.buses.master=m;
 for(const k of['sfx','ui','mus']){const g=c.createGain();g.connect(m);SND.buses[k]=g}
 const b=c.createBuffer(1,c.sampleRate,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;SND.noise=b;sndApply()}
// ilk etkileşim: pointerdown/keydown bir kez → sndInit(); ctx.state==='suspended' ise resume()
['pointerdown','keydown'].forEach(e=>addEventListener(e,()=>{sndInit();SND.ctx&&SND.ctx.state!=='running'&&SND.ctx.resume()},{once:false,passive:true}));
document.addEventListener('visibilitychange',()=>{if(!SND.ctx)return;document.hidden?SND.ctx.suspend():SND.ctx.resume()});
```
- **Kullanıcı etkileşiminde açma:** tarayıcılar otomatik sesi engeller; ilk `pointerdown/keydown` öncesi tüm `sfx()` çağrıları sessizce düşer (kuyruğa alınmaz: geç gelen "tık" yanlış hisseder).
- **Ses seviyeleri:** `SET.vol={master:.8,sfx:.8,ui:.5,music:.35}`, `localStorage` anahtarı `fetih-ayar` (kayıt ve mirastan ayrı; bozulursa varsayılana döner). Değişim `gain.setTargetAtTime(v, now, .03)` (tık sesi yok).
- **Sessize alma:** HUD'da `i-ses-acik/kapali` tek dokunuş = `master` 0 (kaydedilir). Kısayol `M`.
- **`visibilitychange`:** gizlenince `suspend()` (müzik ve zamanlayıcı durur, CPU 0), görünürken `resume()`; müzik zamanlayıcısı dönüşte ileri zamanı yeniden hesaplar (birikmiş nota patlaması olmaz).
- **Sınırlar:** aynı efekt 40 ms içinde tekrar çalmaz (`SND.last[id]`); aynı anda en çok 12 efekt sesi (fazlası düşer, en eskisi değil yenisi); her efekt düğümü `onended` ile `disconnect()`.
- **Yardımcılar** (tüm tarifler bunlarla yazılır; ~2 KB):

```js
const T=()=>SND.ctx.currentTime;
// tek ton: tip, frekans (dizi ise [başlangıç, bitiş] üstel kayma), ADSR, süre, filtre, kazanç, gecikme, otobüs
function tone({type='sine',f=440,f2,a=.005,d=.1,s=0,r=.08,dur=.15,g=.3,flt,q=1,det=0,at=0,bus='sfx'}){
 const c=SND.ctx,t=T()+at,o=c.createOscillator(),v=c.createGain();o.type=type;o.detune.value=det;
 o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
 v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+a);v.gain.setTargetAtTime(g*s,t+a,d/3);v.gain.setTargetAtTime(0,t+dur,r/3);
 let n=o;if(flt){const b=c.createBiquadFilter();b.type=flt[0];b.frequency.value=flt[1];b.Q.value=q;if(flt[2])b.frequency.exponentialRampToValueAtTime(flt[2],t+dur);o.connect(b);n=b}
 n.connect(v);v.connect(SND.buses[bus]);o.start(t);o.stop(t+dur+r+.05);o.onended=()=>v.disconnect()}
// gürültü: bant filtreli
function noise({f=1000,f2,q=1,type='bandpass',a=.002,dur=.1,r=.05,g=.3,at=0,bus='sfx'}){
 const c=SND.ctx,t=T()+at,s=c.createBufferSource(),b=c.createBiquadFilter(),v=c.createGain();s.buffer=SND.noise;s.loop=true;
 b.type=type;b.frequency.setValueAtTime(f,t);if(f2)b.frequency.exponentialRampToValueAtTime(f2,t+dur);b.Q.value=q;
 v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+a);v.gain.setTargetAtTime(0,t+dur,r/3);
 s.connect(b);b.connect(v);v.connect(SND.buses[bus]);s.start(t,Math.random()*.5);s.stop(t+dur+r+.05);s.onended=()=>v.disconnect()}
function sfx(id,o){if(!SND.ctx||SET.mute)return;const n=performance.now();if(n-(SND.last[id]||0)<40)return;SND.last[id]=n;(SFX[id]||(()=>{}))(o||{})}
```

### 10.2 Efekt tarifleri (27)

Notasyon: `tone(tip, f[→f2] Hz, A/D/S/R ms, süre ms, filtre, kazanç)`; `noise(bant f[→f2], Q, süre, kazanç)`; `+Nms` = gecikme. Kazançlar 0-1 (otobüs kazancından önce). Gam referansı: oyunun "anahtar" sesi **Re (D)**, Hicaz renk için Mi♭ ve Fa♯.

| # | Kimlik | Tetikleyici | Tarif | Süre |
|---|---|---|---|---|
| 1 | `ui-tik` | her düğme/sekme basışı | `tone(triangle, 1800→1200, 1/30/0/20, 40, highpass 600, .12)` + `noise(4000, Q2, 15, .05)` | 50 ms |
| 2 | `ui-hover` | birincil düğme / harita bölgesi hover (120 ms kısıtlı) | `tone(sine, 2400, 1/15/0/15, 25, —, .03)` | 30 ms |
| 3 | `ui-onay` | onay penceresi "Evet", kur/yükselt başarılı | `tone(triangle, 660, 2/60/0/60, 80, lowpass 3k, .18)` + `tone(triangle, 990, …, +60ms)` (yükselen beşli) | 160 ms |
| 4 | `ui-hata` | devre dışı/eksik kaynakla basış, geçersiz eylem | `tone(square, 180, 2/80/0/40, 90, lowpass 900, .12)` ×2 (+110 ms ikinci 160 Hz) | 220 ms |
| 5 | `ui-ac` | modal/çekmece açılış | `noise(800→2400, Q.7, 140, .08)` (hava "fış" yükselen) | 150 ms |
| 6 | `ui-kapa` | modal kapanış | `noise(2400→700, Q.7, 110, .06)` | 120 ms |
| 7 | `kaynak-kazan` | stok arttı (tur sonu toplu tek çağrı; ganimet) | 3 nota arpej `tone(sine, D6 1175 / F♯6 1480 / A6 1760, 2/90/0/80, 90, —, .10)` 45 ms aralıkla + `noise(7000, Q3, 40, .03)` (sikke şıngırtısı) | 220 ms |
| 8 | `kaynak-harca` | maliyetli eylem ödendi | `tone(triangle, 520→380, 2/70/0/50, 90, lowpass 2k, .14)` + `noise(3000→1200, Q1.5, 60, .05)` (kese) | 120 ms |
| 9 | `insa` | tesis/kuruluş/sur kuruldu | 2 vuruş "çekiç": `noise(1800, Q4, 30, .25)` + `tone(sine, 220→140, 1/80/0/40, 80, —, .25)`; +180 ms tekrar; +360 ms `tone(triangle, D5 587, 5/200/0/150, 250, lowpass 2.5k, .12)` | 600 ms |
| 10 | `yukselt` | tesis/kuruluş seviye arttı | `insa`ın ilk vuruşu + yükselen üçlü `tone(triangle, D5→F♯5→A5, …)` 70 ms aralıkla, son nota 300 ms tutulur | 450 ms |
| 11 | `asker-topla` | birlik yetiştirildi | adım sesi: 3× `noise(400, Q1, 40, .18, lowpass)` 90 ms aralıkla + `tone(sawtooth, 110, 5/120/0/60, 150, lowpass 500, .08)` (davul gümbürtüsü) | 350 ms |
| 12 | `saldiri-basla` | Saldır! onayı (ok çizilirken) | boru: `tone(sawtooth, D4 294, 30/200/.6/150, 380, lowpass 1.4k→2.2k Q2, .14)` + aynı A4 440 +120 ms, `det` ±6 (koro) | 550 ms |
| 13 | `savas-carpisma` | savaş efektinin 120. ms'si | `noise(2500, Q.8, 160, .32)` + `noise(6000, Q6, 60, .12)` (metal) + `tone(sine, 90→45, 2/200/0/100, 220, —, .35)` | 300 ms |
| 14 | `savas-zafer` | saldırı kazanıldı | `tone(triangle, D5, 5/150/.5/200, 200)` + `A5 +110ms` + `D6 +220ms 400ms tutulur`, lowpass 3k, .16; altta `tone(sine, D3 147, 10/300/0/200, 400, —, .18)` | 700 ms |
| 15 | `savas-yenilgi` | saldırı/savunma kaybedildi | `tone(sawtooth, A3 220→D3 147, 20/300/0/250, 450, lowpass 700, .14)` + `tone(sine, 73, 10/400/0/300, 500, —, .2)` | 700 ms |
| 16 | `fetih` | bölge fethedildi (dalga başlangıcı) | büyük davul `tone(sine, 120→48, 2/350/0/200, 400, —, .45)` + `noise(150, Q1, 200, .2, lowpass)`; +160 ms `savas-zafer`ın üç notası bir oktav aşağı + `noise(5000→9000, Q.5, 300, .04)` (bayrak dalgalanma) | 900 ms |
| 17 | `baskent-alindi` | rakip başkenti alındı | `fetih` + 400 ms sonra 2 boru (`saldiri-basla` notaları D4+F♯4+A4 akor, 600 ms) | 1,3 s |
| 18 | `bolge-kayip` | oyuncunun bölgesi düştü | `tone(square, D4→C♯4, 10/250/0/200, 350, lowpass 800, .1)` + düşük davul `tone(sine, 70, …, 300, .3)` | 500 ms |
| 19 | `tur-sonu` | Turu Bitir basıldı | `tone(sine, D3 147, 5/300/0/300, 400, lowpass 600, .22)` + `noise(300, Q2, 150, .08)` (perde/davul derisi) | 500 ms |
| 20 | `yil-gecis` | yıl kartı göründü | çan: `tone(sine, 880, 2/800/0/600, 900, —, .08)` + `tone(sine, 880×2,76 = 2429, 2/300/0/200, 400, —, .03)` (çan kısmisi) + `tone(sine, 880×5,4, …, 200, .015)` | 1 s |
| 21 | `olay-ac` | olay penceresi | İkilem/Sistem: `tone(triangle, A4→D5 Hicaz geçişi E♭5→D5, 10/150/.3/200, 500, lowpass 2k, .12)`; Kötü: aynı bir oktav aşağı + `noise(200, Q1, 300, .06)`; İyi: `kaynak-kazan` yumuşak | 600 ms |
| 22 | `uyari` | kıtlık yaklaşıyor, hazine boş, koalisyon kuruldu, moral < 30 | 2× `tone(square, 880, 2/60/0/40, 80, bandpass 1.2k Q4, .09)` 140 ms aralık; koalisyonda 3× ve 660 Hz | 300 ms |
| 23 | `arastirma` | teknoloji kademesi tamam | `tone(triangle, D5, …)` → `F♯5` → `A5` → `D6` 80 ms aralık, her biri 2/150/0/120; son notaya `tone(sine, D7 2349, 2/600/0/400, 700, —, .04)` parıltı | 900 ms |
| 24 | `kilit-acildi` | miras kilidi, yeni kart/hanedan, kademe açıldı | metal tık `noise(5000, Q8, 25, .2)` + 60 ms sonra `tone(sine, 1320→1760, 2/200/0/200, 250, —, .1)` | 350 ms |
| 25 | `basarim` | başarım kazanıldı | `arastirma` arpeji + altta `tone(triangle, D4, 20/600/.4/500, 800, lowpass 1.5k, .12)` (akor dolgusu) | 1,1 s |
| 26 | `skor-tik` / `skor-son` / `odul` / `rutbe` | bitiş sayacı / sayaç bitti / ödül vuruşu / rütbe yükseldi | tik: `tone(sine, 1200+i×60, 1/30/0/20, 30, —, .05)`; son: `savas-zafer`; ödül: pentatonik merdiven D-E-F♯-A-B (n'inci vuruş n'inci nota, oktav döner) `tone(triangle, …, 2/200/0/150, 250, lowpass 3k, .12)`; rütbe: `baskent-alindi`ın boru akoru | — |
| 27 | `bitis-zafer` / `bitis-yenilgi` | bitiş ekranı açılışı (müzik susar) | zafer: davul rulosu (8× `noise(180, Q1, 40, .2)` 45 ms aralık, kreşendo) → D majör akor D3-A3-D4-F♯4-A4 `sawtooth` lowpass 1.8k, 40/1500/.5/1200, 2,5 s, `det` ±5 koro; yenilgi: D3 + A♭3 (tritone yok, **Hicaz** D-E♭-F♯ yavaş inen: F♯4→E♭4→D4, her biri 600 ms) `triangle` lowpass 900 + düşük davul 3 vuruş | 3 s |

Notlar:
- **Katmanlama**: efekt sesi müziği bastırır: `savas-*`, `fetih`, `olay-ac`, `bitis-*` çalarken müzik otobüsü filtresi 900 Hz'e iner (300 ms), 1,2 s sonra geri açılır (`duck()`).
- Tur sonunda çok sayıda olay (5 savaş, 3 kaynak değişimi) aynı anda olursa: **öncelik sırası** bitis > baskent > fetih/kayip > savas > uyari > olay > kaynak > ui; aynı karede yalnız en yüksek 2 öncelik çalar, kaynak sesleri tek `kaynak-kazan`'a toplanır.
- Kazançlar `tests` altında ölçülmez; uygulayıcı kulakla dengeler: hedef, `ui-tik` en sessiz, `fetih` en yüksek (yaklaşık 12 dB fark).

### 10.3 Müzik: üretken ortam döngüsü

Amaç: dosyasız, ~3 KB kodla, saatlerce tekrar etmeyen, ağırbaşlı "uç beyliği" ortamı. Tematik dayanak: Türk makam renkleri (batı akortlu yaklaşık: koma yok) ve usul (ritim döngüsü).

**Gamlar (Re / D merkezli, Hz için `440*2**((m-69)/12)`, D4 = MIDI 62):**
| Durum | Gam (yaklaşık makam) | MIDI dereceleri (D4'ten yarım ses) | Karakter |
|---|---|---|---|
| Barış | Uşşak/Buselik karışımı ≈ Re Dorian | 0 2 3 5 7 9 10 | Sakin, açık |
| Savaş | Hicaz ≈ Re Frigyen-majör | 0 1 4 5 7 8 10 | Gergin, "doğulu" artık ikili (E♭–F♯) |
| Kriz | Hicaz, perde 1 yarım ses aşağı, yalnız 0 1 4 7 | 0 1 4 7 | Seyrek, karanlık |

**Durum seçimi** (her tur sonunda hesaplanır, geçiş 8 s çapraz geçiş):
- *Kriz*: tahıl stoğu < 2 tur gideri **veya** moral < 35 **veya** başkent kuşatma altında (son 2 turda başkente saldırı) **veya** koalisyon kuruldu ve oyuncuya savaşta.
- *Savaş*: son 3 turda oyuncunun dahil olduğu ≥ 2 savaş **veya** barış süresi (`grace`) bittikten sonra cephede düşman yığınağı (`aiPer.stack`) var.
- *Barış*: diğer.
Yoğunluk (0-1) her durumda ayrıca `savaş sayısı/5` ile ince ayarlanır (katman açılıp kapanır).

**Tempo:** barış 66 BPM, savaş 92 BPM, kriz 58 BPM (geçişte tempo değişmez, yeni durum yeni ölçünün başında başlar).

**Katmanlar** (her biri `musBus`'a):
| Katman | Barış | Savaş | Kriz | Tarif |
|---|---|---|---|---|
| **Pad (dem)** | açık | açık | açık, daha koyu | Kök + beşli (D3 + A3) **dem sesi** (makam müziğindeki sürekli taban): 2× `sawtooth` (`det` ±7 cent) → lowpass 500 Hz (kriz 300) Q .7, LFO 0,07 Hz ile kesim ±120 Hz; kazanç .05. Her 8 ölçüde kök 1 derece değişir (D → C → D → A♭(kriz)) — sabit dron sıkmasın |
| **Arp (saz/ud)** | seyrek | yoğun | çok seyrek | "Mızrap" notası: `triangle` + 2. oktav `sine` %30, A 2 ms, D 180 ms, S 0, lowpass 2,4 kHz → 1,2 kHz kayan (telli çalgı sönümü), kazanç .07. Melodi: rastgele yürüyüş, adım ±1-2 derece (%80), sıçrama ±4 (%20), aralık D4-D5; çalma olasılığı adım başına barış .35, savaş .7, kriz .15. Her 4 ölçüde bir **kalış** (tam not, durak derecesine D veya A dönüş) |
| **Perküsyon (davul-def)** | yok veya yalnız düm | usul tam | yalnız düm, yarı tempo | Usul **Düyek** (8/8): `DÜM . tek tek DÜM . tek .` → adımlar 0:DÜM, 2:tek, 3:tek, 4:DÜM, 6:tek. DÜM: `tone(sine, 110→55, 2/250/0/100, 250, —, .22)` + `noise(120, Q1, 80, .08, lowpass)`. tek: `noise(2200, Q1.2, 50, .07)` + `tone(triangle, 330, 1/40/0/30, 50, —, .03)`. Savaşta yoğunluk > .6 ise her 2. ölçüde süsleme (16'lık tek) |
| **Boru çağrısı** (nadir) | yok | 16 ölçüde 1 | yok | `saldiri-basla` tarifi, gam dereceleri 0-4-7, kazanç .06 |

**Zamanlayıcı:** klasik "look-ahead" (A Tale of Two Clocks): `setInterval(tick, 25)`; her tick'te `ctx.currentTime + 0,12 s` öncesine kadar olan 16'lık adımlar `tone/noise` ile planlanır. Adım süresi `60/BPM/2`. Rastgelelik oyun tohumundan **bağımsız** `Math.random` (oyun belirlenimciliği bozulmasın: `TEST` ve sim betikleri `rnd()` akışını izliyor).

**CPU bütçesi:** eşzamanlı ses ≤ 8 (pad 2 sürekli + arp ≤ 2 kuyruk + perküsyon ≤ 3 + boru ≤ 1). Planlanan düğümler `stop()` sonrası `disconnect`. Hedef: orta seviye Android'de müzik açıkken ana iş parçacığı yükü < %2 (Performance paneli, 60 s ortalama), ses iş parçacığı < %5. Pad sürekli osilatör olduğundan durum geçişinde yeniden yaratılmaz, yalnız filtre/frekans `setTargetAtTime` ile kayar.

**Kapatılabilirlik:** ayarlarda Müzik anahtarı + seviye; kapatınca zamanlayıcı **tamamen durur** (sessiz çalmaz). Varsayılan: müzik **açık, .35**; ilk açılışta sihirbaz karşılamasında küçük "`i-ses-acik` Ses: açık" anahtarı görünür (oyuncu ilk anda kapatabilsin). Bitiş ekranında müzik 1,5 s'de söner, `bitis-*` çalar, 4 s sonra barış durumu 20 s'de yavaşça geri gelir.

### 10.4 Ses ayarları arayüzü

Ayarlar panelinde (13) "Ses" grubu:
```
Ses                                   [● açık ]
  Ana ses      ━━━━━━━━●━━  80
  Efektler     ━━━━━━━━●━━  80
  Arayüz tıkı  ━━━━━●━━━━━  50
  Müzik        ━━━●━━━━━━━  35   [● açık ]
  Müzik ruhu   (Otomatik) (Hep barış) (Kapalı)
```
Sürgüyü bırakınca o otobüste örnek ses çalar (efekt: `kaynak-kazan`, arayüz: `ui-tik`). HUD'da hızlı erişim yalnız `i-ses-acik/kapali` (ana sessiz).

---

## 11. Erişilebilirlik

QA B12'deki tüm maddeler bu bölümle kapanır.

### 11.1 Odak

- Tüm etkileşimli öğelerde `:focus-visible{outline:2px solid var(--focus);outline-offset:2px}`; fare tıklamasında halka çıkmaz. `outline:none` hiçbir yerde kullanılmaz.
- `onclick`'li `div/span/a` öğeleri (`.r` HUD çipleri, `a.lnk` bölge bağlantısı, `.node` teknoloji, `.pick` kartlar, `.step`) **`<button>`a dönüştürülür** (B12: "iki onclick'li öğe tabindex'siz"). Seçilebilir kart: `<button aria-pressed>`.
- Harita tuvali: `tabindex=0`, `role=application`, `aria-label="Harita. Ok tuşlarıyla bölgeler arasında gez, Enter ile seç."`. Odaktayken: oklar → en yakın komşu bölge (yön açısına göre `adj` içinden), Enter = seç, `A` = seçiliden odaktakine saldır, `T` = taşı, `+/-` yakınlaştır, `0` sığdır. Odaktaki bölge FX'te kesik `--focus` sınırla gösterilir.

### 11.2 Klavye kısayolları

| Tuş | Eylem | Koşul |
|---|---|---|
| `Space` / `Enter` | Turu Bitir | Odak harita veya gövdede, modal yok (odak bir düğmedeyse o düğme çalışır, çakışmaz) |
| `1`-`6` | Ana sekmeler | Modal yok |
| `1`-`3` | Olay seçeneği | Olay penceresi (bugünkü davranış) |
| `Esc` | Modal/çekmece/ipucu kapat; seçimi kaldır | Kapatılabilir pencereler (5.8) |
| `M` | Sesi aç/kapa | her zaman |
| `F` | Seçili bölgeye git | |
| `?` | Kısayol listesi | |
| `Tab` / `Shift+Tab` | Mantıklı sıra: üst çubuk → harita → panel sekmeleri → panel içi → Turu Bitir | |

Kısayollar `?` penceresinde ve Ayarlar'da listelenir; harf kısayolları `e.ctrlKey/metaKey/altKey` varken ve bir `input` odaktayken çalışmaz.

### 11.3 ARIA rolleri

| Öğe | Rol / öznitelik |
|---|---|
| `#modal` | `role=dialog aria-modal=true aria-labelledby=mTitle`; kapatılamaz pencerede `role=alertdialog` (bitiş, bozuk kayıt) |
| Odak tuzağı | açıkken arka plan `inert` (`main`, `header`'a `inert` özniteliği; tüm modern tarayıcılarda var) |
| `#tabs` | `role=tablist`; düğmeler `role=tab aria-selected aria-controls=panel`; `#panel` `role=tabpanel aria-labelledby`. Ok tuşları sekmeler arası (roving tabindex) |
| Alt sekmeler (`.sub`) | aynı tablist deseni |
| Toast | `role=status aria-live=polite`; hata `role=alert` |
| Olay akışı (harita sol) | `role=log aria-live=polite aria-relevant=additions` |
| HUD kaynak çipleri | `<button aria-label="Tahıl 412, tur başına artı 3">` (görsel `▲ +3`, sesli tam cümle) |
| İlerleme | `role=progressbar aria-valuenow aria-valuemin aria-valuemax aria-valuetext="Fetih 18 / 33 bölge"` |
| Sürgü | yerleşik `input[type=range]` + `aria-valuetext="12 piyade, en çok 16"` |
| Anahtar | `role=switch aria-checked` |
| Tuval | `role=application` (11.1); bitiş haritası `aria-hidden` (bugünkü gibi) ve grafik `role=img aria-label` özetli |
| Kilitli öğe | `aria-disabled=true` + `aria-describedby` koşul metni |

### 11.4 Ekran okuyucu için sayısal bildirimler

Tek `#sr` canlı bölgesi (`aria-live=polite`, görsel olarak gizli `.sr-only`). Tur sonunda **tek özet cümlesi** yazılır (her sayı için ayrı bildirim değil):
"Yıl 35. Tahıl 412, artı 3. Altın 205, artı 6. Moral 78. 2 savaş: Taşhisar alındı, Akdere savunuldu. 1 olay bekliyor."
Savaş sonucu: "Saldırı kazanıldı. Taşhisar senin. 6 kayıp. Ganimet: 38 tahıl, 12 altın." Kritik uyarılar (`uyari` sesi olanlar) `aria-live=assertive` ayrı bölgede. Sayılar `fmtN` ile (Türkçe okunur), eksi "eksi" sözcüğüyle (U+2212 bazı okuyucularda okunmaz: `aria-label`'da metin olarak yazılır).

### 11.5 Renk körü modu

Ayarlar → "Renk körü desteği" (varsayılan kapalı; açıkken):
- Harita sahiplik desenleri %22 → %40 alfa, iç şerit 3 → 4 px (8.1).
- Rozet şekilleri zaten her zaman açık (2.6); modda rozet yanında sahip baş harfi 9 px: K (Kızıl), M (Mavi), Y (Yeşil), S (Mor Sultanlık; "M" Mavi'de kullanıldığı için), B (Bağımsız); oyuncu `★`.
- Saldırı şansı rengi yanında her zaman sözcük ("Güçlü/Belirsiz/Riskli") — modda hedef işaretinde de.
- `--good`/`--bad` metinlerinin önüne `▲/▼` veya `✓/✕` (aslında her zaman var; mod yalnız grafik çizgilerine desen ekler: bitiş grafiğinde asker çizgisi kesikli).
- Türe göre üç önayar gerekmez; desen + şekil + metin her tür için çalışır (ölçüm 2.6).

### 11.6 Hareket, metin ölçekleme, kontrast

- `prefers-reduced-motion` + ayarlardaki "Animasyonları azalt" (9.1, 9.2 son sütun). Varsayılan: sistem ayarını izle.
- **Metin boyutu:** Ayarlar'da %90 / %100 / %115 / %130 → `html{font-size}` değişir; tüm ölçek `rem` olduğundan HUD, panel, modal birlikte büyür. %130'da mobil üst çubuk şeridi kaydırmalı olduğu için taşmaz; masaüstünde çipler 2 satıra **inmez** (eğilim gizlenir, ipucuna taşınır). Tarayıcı yakınlaştırması %200'de yatay kaydırma olmamalı (WCAG 1.4.10: 320 CSS px genişlikte tek sütun çalışır, bu zaten mobil düzen).
- **Yüksek kontrast:** `@media (prefers-contrast:more)` ve ayar: `--tx-2:#D3D9E3`, `--line:#5A6880`, `--edge:#AEB8C8`, kart kenarları 1 → 2 px, sahiplik iç şeridi `--ink` hale 2 px. `forced-colors:active` (Windows yüksek kontrast) için ikonlar `currentColor` olduğundan doğal çalışır; tuval etkilenmez.
- Hedef kontrast ölçütü: tüm metin ≥ 4.5 (QA B11 listesindeki 5 öğe dahil), tüm etkileşimli kenar/ikon ≥ 3.

---

## 12. Dönüşüm planı (uygulama sırası)

İlke: her aşama tek başına yayınlanabilir (GitHub Pages), oyun mantığına dokunmaz (`economy`, `endTurn`, AI, kayıt şeması değişmez; `SAVE_VER` artmaz), `tests/sim.js` ve QA koşuları aynen geçer. Görsel ayarlar `localStorage['fetih-ayar']`'da, kayıttan ayrı.

**Dosya boyutu bütçesi** (ham, şu an 262,5 KB; hedef < 450 KB; GitHub Pages gzip'ler):

| Aşama | Ek (KB) | Birikimli |
|---|---|---|
| 1 Token + tipografi + temel bileşen | +14 (CSS yeniden yazımı, eski kurallar silinir: net ~+8) | ~271 |
| 2 İkon sprite + emoji değişimi | +26 sprite, +3 eşleme | ~300 |
| 3 HUD + mobil alt çekmece | +12 | ~312 |
| 4 Sihirbaz/bitiş/modal | +6 | ~318 |
| 5 Harita dili + FX | +14 | ~332 |
| 6 Animasyonlar | +8 | ~340 |
| 7 Ses motoru + efektler | +10 | ~350 |
| 8 Müzik + ayarlar + erişilebilirlik | +12 | ~362 |
Pay: ~88 KB. Aşama başına bütçe aşımı %25'i geçerse aşama durdurulur ve küçültülür.

### Aşama 1: Tasarım token'ları, tipografi, temel bileşenler
- **Değişen:** `<style>` başı `:root` (2.7 bloğu + 4, 9.1 token'ları; geriye uyum takma adları); `body` font; `.btn*`, `.tabs`, `.sub`, `.card`, `.chip`, `.tag`, `.bar`, `.prog`, `.kv`, `table`, `.warn`, `.feat`, `input[type=range]`, `select`, `.inp`, `.switch` CSS blokları (bölüm 5). Georgia kaldırılır (`.title`, `h2`, `h3`, `#loading`, `#endSc`). `.btn:disabled` opaklığı → token. `FAC[].col` yeni değerler (2.6). Harita etiket fontu `drawIcons` içinde `Georgia` → `system-ui` (tek satır).
- **Kabul:** tüm metin ≥ 4.5 (otomatik: axe-core veya `tests` içindeki kontrast betiği, QA B11 öğeleri dahil); tüm `.btn` vuruş alanı ≥ 44 px (QA `c_ui_*` ölçüm betiği yeniden: `smallN=0`); `tests/sim.js` farkı 0; dosya ≤ 275 KB.
- **Risk:** satır içi `style="…"` ile verilmiş renkler (`style="color:#c96f5f"`, `font-size:11.5px` vb., ~40 yer) token'a geçmezse karışık görünüm. Önce `grep -o 'style="[^"]*"'` envanteri.

### Aşama 2: İkon sprite'ı ve emoji değişimi
- **Değişen:** `<body>` başına `docs/ikonlar.svg` içeriği; `ic()` yardımcısı; sabitlere ikon kimliği alanı: `RES[].i`, `FIELD[].i`, `UNITS[].i`, `BR[].i`, `DYN[].i`, `MUTS[].i`, `MAPTYPES[].i`, `EVENTS[].i`, `AIPERS[].i`, `VIC[].i`, `BONUS[].i` (eşleme 7.3). `e` alanları silinmez (`shareTxt` ve günlük metni). `costTxt`, `lootLine`, `uTxt`, `renderHeader`, sekme etiketleri, `picker`, `pRegion`/`rg*`, `pEco`, `pArmy`, `pGoal`, `pTech`, `pLog`, `showEvent`, `showEnd`, `wz*`, `showMiras` içindeki emoji dizgeleri `ic()` çağrılarına. `log()` mesajları **metin** olarak kalır ama baştaki emoji `l.i` alanına taşınabilir (kayıttaki eski günlükler emoji ile gösterilmeye devam eder; şema değişmez).
- **Kabul:** `index.html` içinde HTML'ye giden emoji sayısı 0 (`shareTxt`/kopyalama hariç; betikle sayılır, şu an 110 farklı simge / ~600 kullanım); ikonlar 14/18/24 px'te Chrome, Safari, Firefox'ta görünür; Windows'ta emoji fontu eksikliği sorunu (bugün 🪙🪨🛖 Windows 10'da kutu) ortadan kalkar; ≤ 300 KB.
- **Risk:** `innerHTML` ile çok sayıda `<svg><use>` → panel yeniden çiziminde (`refresh` ort. 9 ms) artış. Ölçüt: `refresh` ort. ≤ 12 ms. Aşarsa sık değişen listelerde ikon önbelleği (aynı dizge).

### Aşama 3: HUD ve mobil alt çekmece
- **Değişen:** `<header>` yapısı (wordmark, yıl, `.res` → kaynak şeridi, durum blokları, zafer çipi, ayar/ses düğmeleri); `renderHeader` (çip HTML'i + `data-r` + önceki değer saklama, nabız sınıfları; hedef başarım ve hanedan çipi Hedef/Ordu sekmesine); kaynak ayrıntı popover'ı; `aside` → masaüstü panel / tablet çekmece / mobil alt çekmece (`ui.sheet` durumu, sürükleme işleyicisi `pointer*`); Turu Bitir FAB (mobil); `.mapctl` 44 px; toast kanalı yeniden (5.9) ve `#tip` yerine ipucu yöneticisi; bağlamsal eylem düğmesi (haritada hedefe dokunma). `@media (max-width:860px)` ve `(max-width:520px)` blokları → 768/1100 kırılımları.
- **Kabul:** 375×812'de üst çubuk ≤ 52 px (QA B10: 128), panelde yatay taşma yok (Ordu, Teknoloji: `scrollWidth ≤ clientWidth`), toast Turu Bitir'i örtmez; mobilde sağ tık olmadan saldırı ve taşıma yapılabilir (QA'nın arayüz zinciri betiği dokunma emülasyonuyla); başparmak: Turu Bitir merkezi ekran altından ≤ 120 px, sağdan ≤ 80 px.
- **Risk:** en büyük aşama; `refresh()` → `renderPanel()` innerHTML yaklaşımı çekmece durumunu ve kaydırmayı sıfırlayabilir. `ui.sheet` + `scrollTop` koruması (`renderPanel`'deki `same` kontrolü genişletilir). iOS Safari'de `dvh` ve sürükleme ile sayfa kaydırması çakışması (`touch-action:none` yalnız tutamaçta).

### Aşama 4: Sihirbaz, bitiş ekranı, modal yeniden stili
- **Değişen:** `modal()/closeModal()` (dialog rolü, odak tuzağı, `inert`, `scrollTop=0`, mobil alt çekmece kalıbı, kapatılamaz türler listesi tek yerde, B2/B7 düzeltmeleri); `wizShow`/`wz1..wz4` (adım göstergesi, kart bileşeni, kilitli kart, mobil tam ekran, kart çevirme); `showSetup`; `showEnd` + `endAnim` (skor sayacı, rütbe çubuğu, vuruşlar); `showEvent` (5.13); `openAttack/openMove/updAtk/picker` (şans halkası, sürgü satırı, B8); `showMiras`, `showHelp`, `showImport`.
- **Kabul:** QA B2, B7, B8, B9 kapanır; sihirbaz 375'te yatay taşma yok ve gezinme düğmeleri her adımda görünür; Esc/odak davranışı 11.2-11.3'e uygun (Tab ile modal dışına çıkılamaz); bitiş ekranı 4 boyutta (375/390/768/1440) ekran görüntüsü karşılaştırması.
- **Risk:** saldırı sonucu modalının kaldırılması (5.14) oyuncu alışkanlığını değiştirir; savaş ayrıntısı (kayıp, ganimet) toast'ta kaybolabilir → sonuç bölge kartında ve günlükte kalıcı, "Son savaş" kartı Ordu sekmesinde.

### Aşama 5: Harita görsel dili ve efektler
- **Değişen:** `FAC` renkleri (aşama 1'de geldi) + `drawOverlay` (desen, iç şerit, seçim dolgusu azaltma, `hatchFlags` taraması kaldırılır); yeni `FXQ` + `loop()`; `selMask`, hedef işaretleri, kesit tuvalleri; `iBadge` sancak şekilleri, `iFeat` → `ICON_PATHS` Path2D; LOD (8.5) `drawIcons`; ordu oku, savaş efekti, yüzen sayılar, renk dalgası, olay pinleri; savaş/fetih çağrı noktaları: `doAttack`, `doRaid`, `endTurn` içindeki AI savaş kayıtları (`ev` listesi) → FX olayları.
- **Kabul:** `drawOverlay` çağrı sayısı animasyon sırasında 0 (sayaç ile ölçülür); 375×812 + 4× CPU yavaşlatmada efekt sırasında kare süresi ≤ 16,7 ms (p95), boşta rAF döngüsü durur; renk körü simülasyonunda (Chrome DevTools "Emulate vision deficiencies") 6 sahiplik desen/şekil ile ayırt edilir; `TEST` modunda FX kapalı (belirlenimci testler etkilenmez).
- **Risk:** `drawOverlay`'e desen eklemek 1,76 Mpx döngüsünü yavaşlatabilir (bugün ~25-40 ms, `refresh` başına). Ölçüt: +%15'ten fazla artmamalı; aşarsa desen tek seferlik `CanvasPattern` ile ayrı tuvalde bölge maskesiyle birleştirilir.

### Aşama 6: Animasyonlar
- **Değişen:** 9.2 kataloğundaki CSS `@keyframes` ve geçişler; `count()` sayaç yardımcısı (HUD, skor, MP); yıl kartı; sekme mürekkebi; toast/modal/çekmece giriş-çıkış; kilit açılışı; `RM()` ve `:root.rm`.
- **Kabul:** her animasyonun azaltılmış hareket karşılığı (otomatik: `prefers-reduced-motion: reduce` emülasyonunda `getAnimations()` boş ya da yalnız ≤ 120 ms opaklık); tur geçişi toplam ≤ 1,2 s ve dokununca atlanır; 60 hızlı Turu Bitir (QA senaryosu) sırasında kuyruk birikmez (yeni tur başlarken önceki efektler son karelerine atlar).
- **Risk:** hızlı tıklayan oyuncuda animasyonlar oyunu yavaşlatmış hissi verir → "Hızlı tur" ayarı ve her animasyonun atlanabilir olması şart.

### Aşama 7: Ses motoru ve efektler
- **Değişen:** `SND` modülü (10.1), `SFX` sözlüğü (10.2: 27 tarif), çağrı noktaları: `.btn` genel tıklama (temsilci olay dinleyicisi, tek yerde), `upgradeField/upgradeMil/buildField/recruit`, `doAttack/doRaid` sonuçları, `endTurn`, `showEvent/pickEvent`, araştırma tamamlama, `unlockItem`, `commitMeta`/`showEnd` vuruşları; öncelik ve toplama kuralı.
- **Kabul:** ilk etkileşimden önce `AudioContext` oluşturulmaz (konsol uyarısı yok); sekme gizlenince `ctx.state==='suspended'`; aynı karede ≤ 2 öncelikli efekt; sessize alma kalıcı (yenilemede korunur); Safari iOS'ta (sessiz anahtarı kapalıyken) çalışır.
- **Risk:** iOS'ta `AudioContext` donanım sessiz anahtarına uyar (ses yok sanılır) → ayarlarda not; eski Safari `webkitAudioContext` ve `setTargetAtTime` farkları.

### Aşama 8: Müzik, ayarlar paneli, erişilebilirlik tamamlama
- **Değişen:** müzik zamanlayıcısı ve durum seçici (10.3); ayarlar paneli (13) ve `fetih-ayar` saklama; ARIA rolleri, roving tabindex, harita klavye gezintisi, `#sr` canlı bölgesi ve tur özeti, renk körü modu, metin boyutu, yüksek kontrast (11).
- **Kabul:** axe-core 0 ciddi/kritik ihlal (sihirbaz, oyun, olay, saldırı, bitiş, miras ekranlarında); yalnız klavyeyle bir oyun kurulup 10 tur oynanabilir ve bir saldırı yapılabilir; müzik açıkken 60 s ortalama ana iş parçacığı yükü < %2 artış; VoiceOver/NVDA ile tur özeti okunur; dosya ≤ 450 KB.
- **Risk:** müziğin uzun oturumda yorması → varsayılan seviye düşük (.35) ve "Müzik ruhu: Hep barış" seçeneği; harita klavye gezintisi için "yöne göre en yakın komşu" seçimi tuhaf sonuç verebilir (dar bölgeler) → Tab ile komşu listesinde sıralı gezinti yedeği.

---

## 13. Ayarlar paneli

Erişim: masaüstü üst çubuk sağında `i-ayarlar`; mobil `≡` menüsü → Ayarlar; kısayol yok (Esc kapatır). Pencere türü: geniş modal / mobilde tam yükseklik alt çekmece. Değişiklikler anında uygulanır ve kaydedilir (Kaydet düğmesi yok). Anahtar: `localStorage['fetih-ayar']` = `{v:1,vol:{master,sfx,ui,music},mute,music,musicMode,rm,fastTurn,cb,hc,text,endLeft,tips}`.

| Grup | Ayar | Denetim | Varsayılan |
|---|---|---|---|
| **Ses** | Ses (ana) | anahtar + sürgü | açık, 80 |
| | Efektler | sürgü (örnek ses) | 80 |
| | Arayüz tıkı | sürgü | 50 |
| | Müzik | anahtar + sürgü | açık, 35 |
| | Müzik ruhu | 3'lü bölümlü: Otomatik / Hep barış / Kapalı | Otomatik |
| **Görüntü** | Animasyonları azalt | anahtar ("Sistem ayarını izle" alt notu) | sisteme göre |
| | Hızlı tur | anahtar: tur geçişi animasyonları ve AI okları atlanır, yalnız sayaçlar | kapalı |
| | Yazı boyutu | 4'lü bölümlü: %90 · %100 · %115 · %130 (canlı önizleme satırı "Tahıl 412 ▲3") | %100 |
| | Renk körü desteği | anahtar (11.5) | kapalı |
| | Yüksek kontrast | anahtar (sistem `prefers-contrast:more` ise açık başlar) | sisteme göre |
| | Harita etiketleri | 3'lü: Otomatik (LOD) / Hep / Yalnız başkent | Otomatik |
| **Oynanış** | Turu Bitir düğmesi | 2'li: Sağda / Solda (mobil) | Sağda |
| | Tur bitirme onayı | anahtar: hazır askerin ve kullanılmamış kaynakla kurulabilir tesisin varken "Yine de bitir?" | kapalı |
| | İpuçları | anahtar: ilk oyunlardaki bağlamsal ipucu balonları | açık (ilk 3 oyun) |
| | Kısayollar | liste (11.2), salt okunur | — |
| **Dil** | Dil | `<select>` yalnız "Türkçe" (devre dışı değil, tek seçenek) + not: "Diğer diller sonraki sürümlerde" | Türkçe |
| | *Çerçeve* | Uygulayıcıya not: tüm görünen dizgeler bugün kod içinde; ileride `L.tr={…}` sözlüğüne taşınabilsin diye yeni yazılan arayüz metinleri (`aria-label`, ayar etiketleri, toast'lar) tek bir `TXT` nesnesinden okunur. Sayı/tarih biçimi `Intl` ve `tr-TR` sabiti tek yerde (`LOC='tr-TR'`). Büyük harf dönüşümleri `toLocaleUpperCase(LOC)` | — |
| **Kayıt** | Kayıt durumu | bilgi satırı: "Son kayıt: Yıl 34 · 2 dk önce · 49 KB" + depolama hatası varsa `--bad` (ST.quota) | — |
| | Kaydı kopyala | ikincil düğme (`exportSave`) | — |
| | Kayıt yükle | ikincil düğme (`showImport`) | — |
| | Mirası kopyala | ikincil düğme (yalnız META) | — |
| | Oyunu sil (yeni sefer) | tehlike düğmesi, onaylı (bugünkü ↻ `askNew`) | — |
| | Tüm verileri sıfırla | tehlike düğmesi, iki adımlı onay ("SIFIRLA" yaz): kayıt + miras + ayarlar | — |
| **Hakkında** | Sürüm `GAME_VERSION`, oyun kodu (`seedCode`), "Nasıl oynanır" bağlantısı | — | — |

Notlar:
- Ayarlar paneli **oyun dışında da** (sihirbaz açılışında, bitiş ekranında) erişilebilir: sihirbaz karşılamasında sağ üstte `i-ayarlar`.
- `fetih-ayar` bozuk/eksikse sessizce varsayılana döner (mirastaki gibi şerit gösterilmez: kritik veri değil).
- Ayarlar `exportSave` dışa aktarımına **dahil edilmez** (cihaza özgü: mobil yazı boyutu masaüstüne taşınmasın).

---

## Uygulama notları (görsel 1-3)

Uygulanan: Aşama 1 (token, tipografi, temel bileşenler), Aşama 2 (ikon sprite'ı, emoji → ikon), Aşama 3 (HUD, mobil alt çekmece, tablet çekmecesi, FAB, bağlamsal eylem düğmesi). Oyun mantığı, kayıt biçimi (`SAVE_VER` 8), RNG ve test altyapısı değişmedi: `tests/baseline-v4.json` `rows` ve `rowsOff` 12/12 tohum birebir, `randLeak` 0, `checkMaps` 20/20 + 12/12, `evUnit` 43 satır 0 hata; `fast:false` (gerçek `refresh`/çizim yolu) 3 tohumda da birebir.

**Mimari kararlar**
- Emoji, **çıkışta** ikona çevrilir: `emo(html)` yalnız metin düğümlerine dokunur (`<textarea>` hariç), `title=` → `data-tip=`. Sinkler: `modal`, `renderPanel`, `renderHeader`, `toast`, `note`, `updAtk`, harita `#tip`, ipucu yöneticisi. Böylece kayıttaki eski günlük metinleri (emoji ile saklanır, `log()` değişmedi; bot `/^Kıtlık/` ile okur) ve `costTxt`/`lootLine`/`give()` çıktıları dokunulmadan ikonlu görünür. Anlamı bağlama göre değişen yerler (tesis/kaynak, hanedan, kart, harita türü, zafer yolu, birlik, teknoloji dalı, olay başlığı, bonus, sancak) kaynakta `ic(X.i)` ile yazıldı; `i` alanları tek blokta atanır (`KATMAN: SAHİPLİK` öncesi). `e` alanları silinmedi (`shareTxt`, günlük).
- Panoya kopyalanan `shareTxt` emoji ile kalır (§7.3). Arayüzde kalan tek "simge" metin oku `→` (izinli).
- `prodParts` etiketi oyun mantığı sıcak yolunda (`production`) çağrıldığı için emoji kaldı; gösterimde `emo()` çevirir.
- Panel yeniden çizimi: içerik dizgesi aynıysa DOM'a dokunulmaz; kaydırma `ui.scr[sekme+altsekme+seçim]`'de tutulur. Çekmece durumu `ui.sheet` (DOM dışında) + `body[data-sheet]`; `aside` hiç yeniden yazılmaz. `refresh` ortalaması 1440×880'de 6,5 → 4,8 ms (40 tur, 60 ölçüm).
- Mobilde `aside` sabit ve dönüştürülmemiş kap; yalnız iç `#sheet` `transform` ile kayar (FAB `position:fixed` bozulmasın diye). Yarım durumda gizli kalan alt kısım için `#panel` alt dolgusu büyütülür (son satır görünür alana kaydırılabilir).
- Tablet (768-1099): panel haritanın üstüne biner (360 px), `#sideTgl` ile 56 px ikon sütununa daralır; `centerOn` görünen genişliği (`visW`) kullanır. Mobilde `centerOn` görünen yüksekliği (`visH`) kullanır.
- Bağlamsal eylem: kendi bölgen seçiliyken saldırılabilir/taşınabilir komşuya dokununca hedef seçilir ve hedefin üstünde "Saldır %N / Taşı" hapı çıkar (`ui.ctx`); sağ tık masaüstünde aynen çalışır. Hedef seçiliyken tarama (`hatchFlags`) kaynak bölgeden çizilmeye devam eder.
- İpucu yöneticisi (`#tipx`, `data-tip`): masaüstünde 350 ms hover / klavye odağı, dokunmatikte 450 ms uzun basış (sonraki tıklama yutulur). `hint` ve yardım metni cihaza göre (`(hover:none),(pointer:coarse)`).
- Modal açıkken `header` ve `main` `inert`; başlık `aria-labelledby`; eylem satırı (`.row`) modalda yapışkan alt. Mobilde modal alt çekmece kalıbında (tutamaç çizgisi, `sheet-in`).

**Belgeden sapmalar**
- Kaynak çipine dokunma: ayrı popover/çekmece yerine Ekonomi sekmesi açılır ve ilgili satır vurgulanır (mobilde çekmece yarıya); ayrıntı masaüstünde hover, mobilde uzun basış ipucunda. Son 10 tur mini grafiği yok.
- Ölçek token'ları `px` (mobil kırılımda yeniden tanımlı); `rem` + metin boyutu ayarı Aşama 8'e kaldı.
- Sprite'taki `<title>` öğeleri gömülürken çıkarıldı (ikonlar her yerde `aria-hidden`; ~2,3 KB kazanç). `docs/ikonlar.svg` değişmedi.
- Tablolar mobilde kart listesine dönmedi; `.tw` içinde yatay kaydırılır (panelin kendisi taşmıyor). Teknoloji ağacı mobilde dal başlığı üstte + 4 sütun.
- Saldırı sonucu hâlâ modal (5.14'teki toast'a geçiş Aşama 4).
- Masaüstünde ≡ menü düğmesi de görünür (mobildeki "Yeni sefer / Yardım / Miras / Kayıt" menüsü).
- Sihirbaz mobilde tam ekran sayfa değil, %92 alt çekmece (Aşama 4).

**Harita (Canvas) — Aşama 5'e notlar**
- `FAC[].col` yeni sancak renkleri (§2.6) uygulandı; sahiplik dolgusu, desenler, iç şerit, rozet şekilleri (`iBadge` hâlâ kalkan, beyaz sayı) Aşama 5'te.
- Kuruluş kademesi `⚑N` metni yerine rozet sağ üstünde `--bg-1` daire + `--brand` rakam çiziliyor (emoji kalmadı). Etiket ve rozet fontu Georgia → sistem yığını.
- `iFeat` özel bölge işaretleri mevcut el çizimiyle korundu (emoji değil); `ICON_PATHS`/Path2D eşlemesi Aşama 5.
- Harita arka planı `--bg-map` (#0B1622); bitiş grafiği renkleri token'a çekildi.

**Bilinen riskler / yapılmayanlar**
- Sürükleme ve uzun basış yalnız başsız Chrome'da CDP dokunma olaylarıyla sentetik test edildi; gerçek iOS/Android cihazda (Safari `dvh`, sayfa sıçraması, sessiz anahtar) denenmedi.
- `--tx-3` `--bg-3` üstünde 4,16 (yalnız hover anında `±0` eğilim metni); `--bad` `--brand-wash` üstünde 4,18 (seçili kartta kırmızı satır, nadir).
- Dosya boyutu 329 KB: Aşama 4-8 için bütçe planı (§12) yeniden hesaplanmalı (sprite + CSS beklenenden ~+20 KB).
- Animasyon, ses, nabız/sayaç (Aşama 6-7), odak tuzağı ve roving tabindex'in tamamı (Aşama 8) yapılmadı; ana sekmelerde ok tuşu gezinmesi ve `role=tab/aria-selected` eklendi.

---

## Uygulama notları (görsel 4-6)

Uygulanan: Aşama 4 (pencere kalıbı, olay, saldırı, sonuç akışı, sihirbaz, bitiş, Miras, başarım kartı, ayar hazırlığı), Aşama 5 (sahiplik deseni + iç şerit, sınırlar, seçim nabzı, hedef işaretleri, sis, LOD, rozet/özellik sprite'ları, ok, savaş, dalga, ganimet, pinler), Aşama 6 (hareket düzeyi, sayaçlar, sekme, toast, pencere giriş/çıkış, yıl kartı, ödül/rütbe/kilit, olay kartı, yükleme). Oyun mantığı, denge, kayıt biçimi (`SAVE_VER` 8), RNG değişmedi: `baseline-v4` `rows` + `rowsOff` 12/12 birebir, `randLeak` 0, `fast:false` 3 tohum birebir. Dosya 329 → ~369 KB.

**Mimari kararlar**
- **Ayar:** `PREF` (`localStorage['fetih-ayar']`, `{v:1,battleModal,motion}`; TEST kipinde okunmaz/yazılmaz). Arayüz Aşama 8'de; şimdilik konsoldan `PREF.battleModal='hep'` (oturumluk) ya da `prefSet('battleModal','hep')` (kalıcı). `prefSet('motion','tam'|'az'|'yok')`; boşsa `prefers-reduced-motion` izlenir.
- **Hareket düzeyi:** `MOT()` 2 tam / 1 az / 0 yok; `:root.rm` (az: tüm CSS animasyonları kapalı, pencere/toast/olay yalnız 100 ms opaklık) ve `:root.rm0` (hiç). Belgedeki `RM()` adı `RM` sabitiyle (kaynak haritası) çakıştığı için `MOT()`. `@media (prefers-reduced-motion)` kuralları sınıfa taşındı (açık ayar sistem ayarını ezebilsin diye).
- **Tek rAF döngüsü:** `FX` durumu + `fxLoop`. `req()` artık döngüyü tetikler. Döngü yalnız efekt, sayaç ya da seçim nabzı varken döner (nabız ~30 fps'e kısılır, pencere açıkken durur). `drawOverlay` animasyon karelerinde çağrılmaz (ölçüldü: 0). TEST kipinde `FX.on=false`: efekt, sayaç, odak taşıma yok; testler etkilenmez.
- **Savaş kancası:** `resolve()` içinde yalnız görsel kayıt (`fxPre`: hedefin eski OVL kesiti; `FX.b`: savaş kaydı). Oyun durumuna/RNG'ye dokunmaz; efekt süsleri `hsh()` ile belirlenimci (Math.random yok).
- **Sahiplik katmanı:** dolgu %18 + 6 px desen (Kızıl /, Mavi nokta, Yeşil yatay, Mor \; oyuncu düz %22), 1 px mürekkep devlet sınırı (kabile tarafı kemik), 3 px iç şerit. Şerit için harita başına bir kez `mgeo()` (bölge kutusu, bölge başına sınır listesi, sınıra 1-3 px uzak piksellerin seyrek listesi ~113-134 bin piksel, ~0,9-1 MB; kurulum 13-40 ms). Kesik hedef çizgisi aynı listeyle OVL'de (seçim zaten `refresh` → `drawOverlay` tetikliyordu). Seçim sınırı OVL'den çıktı, `selMask` küçük tuvali ile FX'te nabız atar.
- **Dalga:** OVL saldırı anında zaten yeni durumda; eski görünüm (ART + eski OVL kesiti, bölge maskeli) açılan dairenin dışında çizilir. Böylece dalga sonunda `drawOverlay` gerekmez.
- **Harita ikonları:** `iFeat`, hedef işaretleri, pinler, savaş/ganimet ikonları SVG sprite simgesinden bir kez 48 px tuvale çizilir (`icoImg`, renk gömülü; `ICON_PATHS`/Path2D yerine: çok öğeli simgeler için daha az kod, HUD ile birebir silüet). Rozet `iBadge` sancak şekilli, sayı mürekkep. Kale/kale-köy bayrağı sahip deseni taşır.
- **Sonuç penceresi (5.14):** varsayılan `onemli`: pencere yalnız oyun bitince, başkent alınınca ya da kayıp ≥ gönderilenin %60'ı olunca; aksi halde saldırı penceresi kapanır, toast + harita efekti + bölge panelinde "Son savaş" kartı (`ui.lastB`, kayda yazılmaz) + günlük. Not: püskürtülen saldırıda yalnız %20 geri çekildiği için **her yenilgi** %60 eşiğini aşar; pratikte pencere = başkent / bitiş / tüm yenilgiler / ağır kayıplı zaferler. `hep` modunda eski akış (Tamam, `afterModal` zinciri) aynen. `doAttack`, `doRaid`, `closeModal`→`afterModal` adları ve zinciri korundu.
- **Pencere kapanışı:** `closeModal` durumu anında kapatır (`ui.modal=null`, `display:none`: test betikleri etkilenmez); görsel çıkış (140 ms) bir hayalet kopyada (`.mghost`). Yeni pencere açılırsa hayalet hemen silinir.
- **Kapatılamaz türler** tek yerde (`NOCL`, `mCan`): Esc ve sağ üstteki kapat düğmesi aynı kuralı kullanır; oyunu bitiren `res` penceresinde kapat düğmesi yok (Tamam/Esc → `afterModal`). Odak tuzağı (Tab döngüsü) ve açılışta odak (olayda 1. seçenek, saldırıda sürgü), kapanışta açan öğeye dönüş.
- **Olay seçimi:** `evPick` 200 ms altın dolma + diğerleri solar, sonra `pickEvent` (TEST ve az/yok harekette anında). 1/2/3 tuşları `evPick` üzerinden.
- **Sayaçlar:** `hudAnim` kaynak/nüfus/moral/asker çiplerinde değişimi 400 ms sayar + `pulse-good/bad` (yalnız `background-color` ve sayı `scale`). Skor sayacı aynı döngüde (`fxCount`, 1200 ms ease-out-expo).
- **Atlama:** her `pointerdown`/`keydown` ve her `endTurn` başında `fxSkip()`: efektler kaldırılır, sayaçlar son değere, bitiş vuruşları anında. Kuyruk birikmez.

**Belgeden sapmalar**
- Mobil üst sınır: sihirbaz, bitiş, Miras mobilde tam ekran sayfa (`#modal.full`); kuruluş penceresi %92 çekmece kaldı (harita görünsün) ama adım göstergesinin 4. adımını taşır.
- Saldırı penceresinde birlik sürgüleri şans göstergesinin altına alındı; çarpanlar ve birim güçleri `<details>Ayrıntılar` içinde. Tahmini kayıp `winFr` ile (zarsız orta değer).
- Yapay zekâ okları: yalnız oyuncuya yönelen ya da toprak değiştiren savaşlar (AI–kabile püskürtmeleri gösterilmez), en çok 12. Oyuncuya yönelen saldırıda çarpışma işareti; kaybedilen bölgede yavaş dalga + kırmızı yanıp sönme. Tur geçişinin ok/dalga kısmı ≤ ~1,2 sn; sonuç işareti (✓/✕) 1,3 sn'ye kadar kalır (girdi engellemez).
- Rapor penceresi (`rep`) tur sonunda hemen açılır (testler buna güveniyor); yıl kartı ve oklar perdenin arkasında oynar.
- Olay pinleri: yağmalandı (`raid`), karantina (`qt`), koalisyon üyesi başkenti. Koalisyon kesik çizgisi, nehir/köprü geçiş işareti, `crit-blink` (eksik kaynak), `end-glow` (Turu Bitir hazır), tablet çekmece `panel-in` (genişlik geçişi) yapılmadı.
- LOD 0 (z < 0,6) masaüstünde erişilemez (en küçük zoom ~0,65); mobilde açılış görünümü.
- Etiket çakışması: öncelik seçili > oyuncu/başkent > diğer; başkent etiketi büyük harf + `letterSpacing` (destekleyen tarayıcıda).

**Ölçümler (başsız Chrome, bu makine)**
- `drawOverlay` (Normal, 41. yıl, 30 çağrı ort.): 1440×880 5,7 → 5,6 ms; 375×812 4× CPU 18,45 → 19,08 ms (+%3,4; sınır %15). Uzun boy 92. yıl: 5,6 ms / 4× 21,6 ms.
- `refresh` ort.: 1440 5,2 → 5,5-6,0 ms; 375 4× 19,9 → 20,3-21,4 ms.
- Efekt sırasında (saldırı ok+çarpışma+dalga+ganimet; tur geçişi): kare aralığı p95 16,7-16,8 ms, `render` p95 1,4-2,1 ms, `drawOverlay` çağrısı 0; boşta (seçim/efekt yok) 1 sn'de 0 `render`. Uzun boy 4× CPU saldırıda en uzun kare 33,3 ms (1 kare).
- Bellek: JS yığını 23 → ~30 MB (geometri listesi ~1 MB + ikon tuvalleri 16×9 KB + seçim/dalga kesitleri).

**Bilinen riskler / yapılmayanlar**
- Gerçek dokunmatik cihazda (iOS Safari, Android) denenmedi; tam ekran sayfa `100dvh`, hayalet kapanış ve `letterSpacing` yalnız Chrome'da görüldü.
- `icoImg` SVG'yi `data:` görüntüsü olarak tuvale çizer; eski Safari'de SVG görüntüsü tuvali "kirletebilir" (yalnız `getImageData` etkilenir; görünüm tuvalinden okuma yapılmıyor).
- Ses (Aşama 7-8) yok; ayarlar arayüzü, renk körü modunda desen alfası %40 ve klavye harita gezintisi Aşama 8.
