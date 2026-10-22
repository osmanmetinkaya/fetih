# Fetih görsel dil (aşama 1-8) final QA raporu

Sürüm: v0.8.1, commit "Görsel dil aşama 7-8", `index.html` 412.892 bayt (403,2 KiB, gzip 147.223). Ortam: başsız Chrome (CDP, macOS), `localhost:8123`; `index.html` ve `tests/` içindeki mevcut dosyalar değiştirilmedi. Betikler, ham çıktılar ve ekran görüntüleri: `/private/tmp/claude-501/-Users-osman/43ff13d3-c66b-4b6c-9bc1-b657fa0f123e/scratchpad/qg/` (aşağıda `qg/`; görüntüler `qg/shots/`). Özet veri: `tests/qa-gorsel.json`.

Not: Ses, gerçek dokunmatik, gerçek cihaz, ekran okuyucu ve Safari/Firefox ölçülmedi (ayrıntı "Test edilmedi" bölümünde). "Test edildi" yalnız ölçülenler için yazıldı.

## 1. Bulgular

| Kimlik | Şiddet | Bulgu | Yeniden üretme | Kanıt |
|---|---|---|---|---|
| G1 | orta | HUD kaynak şeridi (`#res`) yatay kayar; 10 çipin "her zaman görünür" ilkesi (§1.2) 1280 px ve altında, tablet ve mobilde tutmuyor. 1100 px: Moral, Asker ve zafer çipi şerit dışında; 1280: zafer çipi; 768: 10 çipten ~4'ü (Altın, Bilgi, Nüfus, Moral, Asker görünmüyor); 375: ~3. 1440'ta bile oyun içinde Koalisyon ya da "Zaferi ilan et" çipi çıkınca sığmıyor ("Koali" kesik, ilan çipi sağ kenarın 76 px dışında). Şerit kaydırılabilir ve "more" gradyanı var, ama masaüstünde fare tekeri yatay kaydırmaz | Oyun başlat, 1100/1280 px aç; ya da 1440'ta koalisyon kurulmuş bir oyun | `qg/kb2.mjs` çıktısı: `hud:taşma@1100 sw 1037 cw 743 clipped moral,asker,hc vic`; `@1280 sw 1037 cw 923 clipped hc vic`; 1440 koalisyonlu: `shots/g-d1440-06-sekme-bolge.png`; 768: `shots/g-t768-06-sekme-bolge.png`; 375: `shots/g-m375-06-sekme-bolge.png` |
| G2 | orta (mobil) | Mobil "Turu Bitir" FAB'ı satır sonundaki sağa hizalı düğmeleri örtüyor; panel sonuna kadar kaydırılınca bile `elementFromPoint` FAB'ı veriyor (`#panel` alt dolgusu 35 px, FAB 64 px). 375: yarım çekmece + Bölge/Tesisler: son satır maliyet düğmesi; yarım + Genel: iki komşu "%100" saldırı düğmesi; kapalı (peek) + Teknoloji: "Topçu" düğümü. 390: peek/Tesisler "Savunma" alt sekmesi, yarım/Tesisler, yarım/Teknoloji. Tam (full) çekmecede örtülme yok; 768 ve 812×375'te yok | 375×812, çekmeceyi yarıya aç, Tesisler sekmesinin sonuna kaydır | `qg/mob2.mjs` (`mob2_375.log`, `mob2_390.log`): `half/bolge.tesis ["35 7 @753"]`, `half/bolge.genel ["%100 @736","%100 @794"]`; görüntü `shots/mob-375-half-end.png` |
| G3 | düşük | Pencere kapanırken görsel çıkış hayaleti (`.mghost`, ~140 ms) `modal` ve `mTitle` kimliklerini kopyalıyor: DOM'da kısa süre tekrar eden kimlik (HTML geçerliliği, `aria-labelledby` çakışması) | Herhangi bir pencereyi aç/kapat; kapanış anında `document.querySelectorAll('[id]')` | `qg/monkey.mjs`: 2 koşuda (1440 ve 390, her birinde 10 örneklemde) tekrarlayan `dup:["modal","mTitle"]` (`monkey_1440_7.json`, `monkey_390_11.json`) |
| G4 | düşük (kullanıcı yanılması) | Casusluk yokken gösterilen saldırı şansı tahmindir ama yalnız saldırı penceresi "tahmini" diyor; hedef işareti (%N), bağlamsal hap ("Saldır %100"), hover ("saldırı şansı %N") ve ekran okuyucu etiketi sözcüksüz sunuyor. Tahmin asker sayısını 5'in katına yuvarlıyor (`est`), 3 ve altı garnizon `~2` biçiminde tam gösteriliyor. 8 tohum x 3 durum, Casusluk sıfırlanmış, 221 saldırılabilir hedef: ortalama mutlak sapma 1,2 puan, en çok 69,6 puan; 8 hedefte >10 puan, 2'sinde >30 puan (örnek: gösterilen %100, gerçek %30; garnizon 7, tahmin 5) | Casusluk yokken komşu kabileye bak | `qg/leak2.mjs` çıktısı: `n 221, maxAbs 0.696, over10 8, over30 2, shownGE95_truthLT80 1` |
| G5 | düşük | B9 kısmen açık: 44 px altı hedefler duruyor: sihirbaz karşılamada "Seferi kendim hazırlayayım" bağlantısı 199×21 (masaüstü 188×19), kuruluşta "Nasıl oynanır?" 79×17, sihirbaz 3. adımda "Miras" bağlantısı 51×17, HUD kaynak çipleri 36 px yüksek (`.hc`, vuruş alanı genişletilmemiş), anahtar kutuları 44×26. `.btn.sm` 36 px görsel ama `::before` ±4 px ile 44 px vuruş alanı var (geçti) | Sihirbaz, kuruluş penceresi | `qg/b9.mjs`, `c_ui2_*.json` `small` alanı (375/390/768/1440/812) |
| G6 | düşük | Kayıtlı oyun açılışı: 1440 px'te hazır olma ~1,09 sn ve en uzun ana iş parçacığı bloğu 351 ms (5 longtask); 4x CPU'da 4,1 sn ve tek blok 1,35 sn (7 longtask). Önceki turdaki en uzun blok 289 ms idi (+%21). Açılışta JS yığını geçici 115-155 MB'a çıkıyor (GC sonrası ~23 MB) | Oyun kaydet, sayfayı yenile | `qg/load.mjs` çıktısı (`1x kayıtlı ready ~1090 ms maxLongTask 351`; `4x ... 4111 ms 1315-1354`) |
| G7 | düşük | Yazı boyutu %130'da satır içi px yazılar ölçeklenmiyor: kodda 46 satır içi `font-size:…px`; 8 ekranda 2-11 metin düğümü (toplamın %2-10'u): "FETİH" wordmark, `.muted` açıklama paragrafları (12/12,5 px), ekonomide "Nüfus tahıl stoğu…" satırı, Teknoloji dal başlığı (16 px) | Ayarlar > Yazı boyutu %130 | `qg/txt1.mjs`, `txt1_1440.json` |
| G8 | düşük | %130 yazıda 768 ve 812×375'te Teknoloji paneli yatay taşıyor (`panelX`; kademe ağacı 360 px panelden geniş) | 768 px, Teknoloji sekmesi, %130 | `qg/acc1.mjs` → `acc1s_768.json` (`06-tek panelX true`), `acc1s_812.json` |
| G9 | düşük | Tablist ok tuşlarını destekliyor ama Home/End yok (APG önerisi) | Sekmede odak, End | `qg/kb2.mjs`: `e1 bolge|bolge` |
| G10 | düşük | Bağlamsal "Saldır/Taşı" hapı hedef bölge görünüm kenarına yakınsa gizleniyor (`ctxUpd`: sx 30-visW-30, sy 48-visH-8), kullanıcıya geri bildirim ve otomatik kaydırma yok (sağ tık/Bölge paneli çalışıyor). Uçtan uca UI oyununda 43 saldırı denemesinden 2'sinde hap çıkmadı. Kenar durumu tek tek doğrulanamadı (kod okuma + `pillMiss`) | Hedefi ekran kenarına getirip seç | `play-w2.json`, `play-w3.json` (`pillMiss: 2`) |
| G11 | düşük | Sihirbaz kart seçimi girişinde kartlar genişlik 0 → tam (~400 ms) animasyonla açılıyor: düzen kayması (`0x178`, `14x107`, `33x175` ölçüldü). Kararlı hâl doğru (169 px) | 375 px, Hanedan > İleri | `qg/card1.mjs` |
| G12 | bilgi | "SIFIRLA" onayı `toLocaleUpperCase('tr-TR')` kullanıyor: kullanıcı küçük harf ASCII `sifirla` yazarsa "SİFİRLA" olur ve reddedilir ("Onay için SIFIRLA yaz" toast'ı çıkıyor); `SIFIRLA` ve `sıfırla` kabul. Beklenen Türkçe davranış, yalnız not | Ayarlar > Kayıt > Tüm verileri sıfırla | `qg/set1.mjs` çıktısı |
| G13 | bilgi | Mobil çekmece durumu sayfa yenilemede korunmuyor (`ui.sheet` kayda yazılmıyor, peek'e döner); `refresh()` çağrısında korunuyor | Çekmeceyi aç, yenile | `qg/mob1.mjs` (`r1/r2/r3`; `reload sheet peek`) |
| G14 | bilgi | Kaybedilen `fetih-ayar` doğrulaması sağlam; meta alanı yanlış tipli (`mp:"abc"`) sessizce varsayılana çekiliyor (qa-1c B17 aynen) | `d_robust.mjs` | `d_robust.log` `meta-bozuk:tipler` (bilinen, B17) |

Beklenmeyen kritik bulgu yok. Oyun mantığı, RNG, kayıt biçimi ve denge değişmemiş (aşağıda).

## 2. Önceki bulguların (qa-1c) yeniden kontrolü

| Eski | Durum | Ölçülü sonuç |
|---|---|---|
| B1 (bozuk kayıt `showBad` çökmesi) | kapandı | `bozuk:bölge-sayısı-uyuşmaz` → "Kayıtlı oyun okunamadı" penceresi, hata listesi boş, yedek yazıldı; 14 bozuk kayıt biçimi geçti (`qg/d_robust.log`) |
| B2 (oyunu bitiren `res` penceresinde Esc) | kapandı | Esc sonrası `modal:'over'`, `metaDone:true`; Tamam yolu aynı; `res` penceresinde kapat (X) düğmesi yok (`qg/atk1.mjs`) |
| B3 (geçersiz günlük tarih kodu) | kapandı | `parseCode('FTH-D20261301')` null (`b_daily.log` 31 OK) |
| B4 (ham TypeError mesajı) | kapandı | "Bu bir Fetih oyun kaydı değil (bölge listesi yok)", durum korunuyor |
| B5 (yüzeysel kayıt doğrulaması) | kapandı | `kaynak-null/morale-string`, `negatif/metin-asker` artık "bozuk kayıt" yolundan reddediliyor |
| B6 (`zoomBy(0/NaN)`) | kapandı | `f_fix.log` `zoom:NaN/Infinity/0/negatif` kamera 102/212/1'de kaldı; 7 uç değer, kamera NaN değil, `zoomAt` 40x yaklaş/60x uzaklaş sınırda (`qg/perfL.mjs`) |
| B7 (modal kaydırma konumu) | kapandı | Miras'ta `scrollTop` 400 → Geri → 0 (375 ve 1440) (`qg/end1.mjs`) |
| B8 (taşan asker sürgüsü, 375) | kapandı | Saldırı penceresi `modalOverflowX:false`, sürgü 343/343, 44 px yüksek (`qg/b9.mjs`) |
| B9 (<40 px hedefler) | kısmen | Kapanan: harita kontrolleri 44×44, Vazgeç/Saldır!/Taşı 44, sürgü 44, `.btn.sm` ±4 px vuruş alanıyla 44. Açık: bkz. G5 |
| B10 (mobil üst çubuk 128 px, panel taşması, toast ↔ Turu Bitir) | büyük ölçüde kapandı | Üst çubuk 48 px; `panelX` yok (Ordu/Teknoloji 375/390); toast'lar üstte, FAB'ı örtmüyor. Yeni sorun: G1 (HUD şeridi), G2 (FAB ↔ satır düğmeleri) |
| B11 (kontrast < 4,5) | kapandı | Hesaplanmış renk taraması (yarı saydam katmanlar birleştirilerek) `c_ui2` 5 boyut (normal mod) + `acc1` 4 boyut x 6 mod x ~16 ekran: `lowN` 0 (devre dışı öğeler hariç). Token tablosu (24 renk x 4 yüzey): `--tx-dis` dışında metin için 4,5 altı çift yok; `--tx-dis` devre dışı öğeler için bilinçli (4,24/3,92/3,50/2,98) |
| B12 (aria / odak) | kapandı (G3, G9 hariç) | `role=dialog aria-modal aria-labelledby`, `tablist/tab/tabpanel` (`aria-selected`, `aria-controls`), `role=status` x2 + toast `aria-live=polite`, tuval `role=application` + etiket, adsız düğme 0, odak tuzağı + geri dönüş, `:focus-visible` 2 px `#FFD66B`/2 px boşluk. Tekrar eden kimlik yalnız G3 |

## 3. Kapsama göre sonuçlar

### 3.1 Regresyon (ölçüldü)

- Bot sim, `tests/baseline-v4.json`: `rows` 12/12 birebir (`ms` hariç), `rowsOff` 12/12 birebir, `checkMaps` 20/20 + 12/12, `randLeak` 0, hata 0, `evUnit(7)` 43 satır, hata 0, `bad` 0. `fast:true` ile `fast:false` (gerçek `refresh`/çizim yolu) 3 tohum x 70 tur birebir aynı (`qg/sim1.mjs`, `qg/sim3.mjs`).
- 11 farklı ayar (hanedan x zorluk x harita türü x kart karması x boy x hedef x günlük x kişilik; her biri 12 tohum, günlük/fast:false 3 tohum) = 114 oyun: hata 0, `fatal` null, NaN/`invariant` 0, `randLeak` 0, kilitlenme yok (`noend` ≤2: yalnız bot tur sınırı). Ayarlar ve sonuçlar `qg/sim2.json`.
- Sim boyunca `AudioContext`/`OfflineAudioContext` kurucusu 0 kez çağrıldı (CDP kurucu sarmalayıcısı; gerçek sayfada aynı sarmalayıcı 1'i saydı, yani yöntem çalışıyor).
- Eski betikler (hepsi `PREF.battleModal='hep'` ile; yalnız tuş sonrası 350 ms bekleme eklendi, çünkü olay seçimi artık 200 ms animasyonlu): `a_save` 6/6 OK, `b_daily` 31 OK, `d_robust` 41 OK + 1 bilinen (B17), `g_meta` 52 OK/0 FAIL, `f_fix` 8 OK + 2 betik uyumsuzluğu, `e_flow` 38 OK + 6 betik uyumsuzluğu. Betik uyumsuzlukları (uygulama hatası değil, doğrulandı): `E01.prep` yok (olay kuyruğu betiği), `CAM` yerine `cam`, Seçilemez seçenek senaryosunda altın 470, ilan senaryosunda tur <15 (MP sayılmıyor kuralı; tur 20'de `games:1`), "▶" metni aranan yeni-oyun düğmesi bitiş ekranından kalkmış.
- Kayıt/yükleme: kuruluş, olay bekliyor, 2 olay, savaş sonrası, bitiş noktalarında kaydet → yenile → devam birebir aynı, bitiş ödülü 3 yenilemede tekrar verilmedi (`a_save.log`).
- Günlük meydan okuma, miras, başarım, MP ızgarası, kilitler: `b_daily`, `g_meta` (52 kontrol) geçti.

### 3.2 Gerçek oyun akışı, yalnız UI düğmeleri/tuşları (ölçüldü)

`qg/play.mjs`: sihirbaz (Seferi kendim → hanedan → Kartsız → boy/zorluk → Seferi Başlat), kuruluş (tesis satın alma + Kuruluşu Tamamla), sonra tur başına Tesisler/Asker/Savunma sekmesi düğmeleri, Teknoloji'de "Araştır", haritada gerçek fare tıklamasıyla bölge seçimi, bağlamsal hap → pencere → "Saldır!", "Taşı", olaylarda ilk seçilebilir seçenek için sayı tuşu, "Turu Bitir" düğmesi.

| Koşu | Boyut | Ayar | Turlar | Saldırı (pencere/bildirim) | Sonuç | Konsol hatası |
|---|---|---|---|---|---|---|
| w1 | 1440×880 | Klasik/Kısa/Çırak | 83 | 17 (3 pencere/14 bildirim) | yenilgi, 84. yıl | 0 |
| w2 | 1440×880 | Klasik/Normal/Çırak | 108 | 38 (3/35), 15 taşıma, 71 tesis, 16 araştırma | yenilgi, 109. yıl | 0 |
| w3 | 390×844 | Börü/Kısa/Kalfa | 96 | 5 (1/4), 10 taşıma | yenilgi, 97. yıl | 0 |
| l1 | 375×812 | Klasik/Kısa/Kalfa, pasif | 40 | 0 | yenilgi, 41. yıl | 0 |
| i_e2e (karma) | 1440×880 | Klasik/Kısa/Çırak tohum 11 | 122 | 259 | **zafer** (Fetih, 123. yıl, skor 3148, 74 MP) | 0 |
| i_e2e (karma) | 1440×880 | Börü/Destan/Kısa tohum 5 | 19 | 7 | yenilgi, 20. yıl (65 MP) | 0 |

- Bitiş ekranı (`over`) tüm koşularda kendiliğinden açıldı; `metaDone`, MP/başarım yazıldı (ör. w1: 1 oyun, 37 MP, "ders"), yenilemede ödül ikinci kez verilmedi, Esc ve Tamam yolları bitişe götürüyor.
- Zafer koşusunun ekonomi/araştırma kısmı betik içinden işlev çağrılarıyla yapıldı (qa-1c ile aynı yöntem: `TURN` işlevi `research`, `upgradeField`, `recruit` çağırır); saldırı, tur, olay ve bitiş UI düğmeleri/tuşlarıyla. Yalnız UI botu 4 oyunda kazanamadı (zayıf bot politikası; hata ya da kilitlenme değil). Aynı tohumda `hep` ile `onemli` modunda i_e2e birebir aynı çıktı verdi (123 yıl, 259 saldırı, skor 3148): sonuç penceresi modu oyun mantığını değiştirmiyor. qa-1c'deki 83 yıllık zafer, 1d denge değişikliğinden (baseline-v4) sonra 123 yıla uzadı; görsel dilden değil.
- "Zaferi ilan et" UI yolu: panel düğmesi → pencere → "İlan et" → bitiş + miras (`games:1`, 56 MP) çalışıyor (`qg/ilan1.mjs`).
- Bitişten sonra: "Yeni sefer" → sihirbaz, "Aynı kurallar" → yeni kuruluş (yeni tohum, aynı kurallar), "Miras" ↔ "Geri", "Sonucu kopyala" (başsızda pano yok → "Elle kopyala" penceresi, hata yok) (`qg/end1.mjs`, 375 ve 1440).
- Rastgele davranış (maymun) testi: 1440 ve 390'da 1500'er eylem (tıklama, tuş, düğme, sürükleme, tur): `invariant` ihlali 0, hata 0, kamera hep sonlu; yalnız G3 görüldü (`qg/monkey.mjs`).

### 3.3 Saldırı sonuç akışı ve gizli bilgi (ölçüldü)

`qg/atk1.mjs` (UI ile: bölge tıkla, hap, "Saldır!"):

| Durum | `battleModal` | Beklenen | Ölçülen |
|---|---|---|---|
| Sıradan zafer | `onemli` | bildirim + bölge kartı + günlük, pencere yok | `modal:null`, toast "…fethedildi · 0 kayıp · düşman 3", `.lastb` kartı, günlük satırı, `#sr` "Saldırı kazanıldı…" |
| Başkent alımı | `onemli` | pencere | `modal:'res'` |
| Oyunu bitiren | `onemli` | pencere (Esc ve Tamam bitişe götürür) | `res` → Esc → `over`, `metaDone:true`; Tamam aynı |
| Ağır yenilgi (12 asker vs 400) | `onemli` | pencere | `res` "Yenilgi" |
| Sıradan zafer | `hep` | eski pencere | `res` |
| 12 ardışık saldırı | `onemli` | efekt birikmez | FX kuyruğu en çok 8, 3,5 sn sonra 0; toast 0 |

Gizli bilgi (`qg/leak.mjs`, `qg/leak2.mjs`; Casusluk ve "reveal" sıfırlanmış mid-game durumu, 39 görüş dışı/içi hedef): `vis()` görüş dışında `?`, görüş içinde `~N` (yalnız ≤3'te `~2`: kesin sayı); bölge paneli, komşu satırları, hover ipucu (gerçek fare, 39 bölge) gerçek asker sayısını hiç göstermedi (0 sızıntı); bileşim "bilinmiyor". Gösterilen şans gerçekten tahmin (G4). Bileşim sızıntısı testi bu durumda yüzdeyi değiştirmedi (4 karışım, aynı yüzde: kanıt zayıf, tek hedef).

### 3.4 Harita görselleri (ölçüldü + görsel inceleme)

- Sahiplik deseni/şerit, 6 sancak, rozet şekilleri, seçim sınırı, hedef işaretleri (%N + kılıç), nehir/köprü, ordu oku, fetih efekti, yüzen sayılar, yıl kartı: ekran görüntülerinde okunaklı (`shots/vis-1-fit.png`, `shots/vis2-normal.png`, `shots/vis3-fx-200.png`, `shots/vis3-lod-*.png`). LOD 1-3 görüldü (z 0,65 / 1,0 / 1,7 / 3,2); LOD 3'te (z 3,2) zemin tuvali bulanık/piksel (beklenen, tuval çözünürlüğü).
- Renk körü: `PREF.cb` ile desen daha belirgin, rozet yanında harf (★ K M Y S B), hedefte sözcük ("%0 Riskli") (`shots/vis2-cb.png`, `shots/vis2-cb-targets.png`). Sahiplik ayrımı görsel olarak sağlandı; CVD simülasyonuyla piksel ΔE ölçülmedi.
- Uzun oyun (Uzun boy, Vadi, 166 yıl, canlı): `refresh` ort. 7,4 ms (p95 9), `drawOverlay` ort. 7,7 (p95 18), `render` 0,55, kayıt 49 KB, JS yığını GC sonrası 23 MB; 4x CPU: `refresh` 27 ms, `drawOverlay` 26 ms, `render` 2,1 ms (`qg/perfL.mjs`). Not: o ölçümde bot yenildiği için oyuncunun bölgesi 0-1 (en kötü durum değil).
- Bellek: 14 art arda yeni oyun x 25 yıl: GC sonrası yığın 22,4-23,5 MB, DOM düğümü 647-665 (sızıntı yok); 300 bölge tıklaması sonrası 23,6 MB (`qg/memleak.mjs`).
- Efekt: 30 hızlı "Turu Bitir" ve 12 ardışık saldırı sonrası FX kuyruğu boşalıyor, toast ve `.mghost` kalmıyor (`qg/atk1.mjs`). `perf46` yöntemiyle saldırı/tur efekti sırasında rAF p95 16,7 ms, `drawOverlay` efekt sırasında 0 çağrı, boşta 0 `render`.
- Yeniden boyutlandırma: 15 boyut (320×480 … 3840×2160, 500×300, 767/768, 1099/1100, yatay): tuval = kapsayıcı (DPR dahil), kamera sonlu, sayfa taşması yok, tuval boş değil, hata 0 (`qg/rsz.mjs`). Zoom uç değerleri: `zoomBy(1e6,1e-6,0,NaN,-3,Infinity)`, `cam.z=0,0001/50/NaN` kıskaçlanıyor (0,65-3,2).

### 3.5 Ses (ölçülebilir kısım; "duyularak değerlendirilmedi")

`qg/aud.mjs`, `qg/aud_offline.json`:
- İlk etkileşimden önce `AudioContext` yok (0); ilk gerçek tıklamada 1 adet, `running`, ana kazanç 0,8.
- Sessize alma: `M` ve düğme (`aria-pressed`, `aria-label` "Sesi aç (M)"), `fetih-ayar.mute:true`, ana kazanç 0, sessizken 20+20 `sfx()` çağrısında yeni düğüm 0; düğmeyle açınca 0,8; yenilemede kalıcı.
- Sekme gizlenince (document.hidden + `visibilitychange` sahte olayı; gerçek sekme gizleme değil): bağlam `suspended`, müzik zamanlayıcısı durdu; görünür olunca `running` + müzik yeniden.
- Test kipi (`?test=1`): `SND.ok=false`, bağlam yok, `M`/`sfx`/`sndInit` etkisiz.
- `OfflineAudioContext`: 33 efekt/çeşit: kırpma 0, NaN 0, en yüksek tepe -11,1 dBFS; önceki ölçümlerle fark: ui-tik +0,6, ui-kapa +1,3, asker-topla -1,0 dB (diğerleri ±0,5 içinde). Müzik 20 sn: barış/savaş/kriz tepe -21,2/-19,1/-21,1 dBFS, RMS -39,8/-33,8/-37,4, kırpma ve NaN 0, eşzamanlı ses en çok 4/6/4, her saniye RMS'de sessiz boşluk yok (ilk saniye -54 dB giriş).
- Kurallar: aynı efekt arka arkaya → 1; 5 efekt aynı anda → yalnız `fetih`+`uyari`; 30 eşzamanlı ton → 12 çaldı, 18 düştü.
- Aşırı hızlı tur/tık: 40 tur + 40 tık + 10 sekme tıkı: eşzamanlı ses tepe 12 (sınır), 144 düşürüldü, hata 0; 500 `sfx` patlaması: tepe 12, 115 düşürüldü, 13 osilatör + 12 tampon kaynağı.
- Müzik açık/kapalı (10 sn, seçim nabzı): ana iş parçacığı görev süresi 0,046/0,072 sn, rAF p95 16,7/16,8 ms (fark yok).

### 3.6 Ayarlar ve erişilebilirlik (ölçüldü)

- Ayarlar paneli 6 bölüm (Ses, Görüntü, Oynanış, Dil, Kayıt, Hakkında; Kısayollar Oynanış içinde) + grup gezinmesi. UI ile 11 ayar değişti: `localStorage['fetih-ayar']` yazıldı, yenilemede aynı, sınıflar/değişkenler uygulandı (`hcm cbm rm0`, `--ts:1.15`, `body.endl`) (`qg/set1.mjs`).
- Bozuk `fetih-ayar`: 15 varyant (bozuk JSON, null, dizi, metin, sayı, yanlış tipler, aralık dışı, `__proto__`): her alan ayrı varsayılana dönüyor, açılış hatası 0, prototip kirlenmedi. Depolama kapalı (`localStorage` erişimi SecurityError): açılış "Tarayıcı kaydı kapalı" şeridi, ses/ayar/oyun akışı çalışıyor, Ayarlar > Kayıt "tarayıcı kaydı kapalı" gösteriyor (`qg/set2.mjs`).
- Hareket: `prefers-reduced-motion: reduce` → `MOT=1` + `:root.rm`; `PREF.motion='tam'` sistemi eziyor; `'yok'` → `rm0`, 0 animasyon, FX kuyruğu 0; `'Sistem'`e dönünce tam; `prefers-contrast: more` → `hcm` (canlı geçiş ~0,8 sn) (`qg/rm1.mjs`, `rm2.mjs`).
- Yüksek kontrast, renk körü, %90/%130 yazı, hc+%130: 4 boyutta (375/768/1440/812) x 6 mod x ~16 ekran: sayfa yatay taşması 0, pencere kesilmesi 0, kontrast `lowN` 0, adsız düğme 0; yalnız G8 (`qg/acc1.mjs`, `acc1s_*.json`).
- Klavye (`qg/kb.mjs`, `kb2.mjs`, `kb3.mjs`, `tab1.mjs`): karşılama Tab/Shift+Tab odak tuzağı pencere içinde; Esc Ayarlar → sihirbaza dönüş ve odak "Hızlı Başla"; kuruluşta Esc kapatmıyor; Boşluk gövdede/haritada tur bitirir, odak düğmedeyken bitirmez; Enter haritada bölge seçer, tur bitirmez; 1-6 sekmeler; M sessiz; ? kısayol penceresi; olay penceresinde odak 1. seçenek + Tab tuzağı; saldırı penceresinde odak sürgü, Esc → hap düğmesine dönüş; Ayarlar düğmesi → Esc → odak düğmeye döner; Tab sırası: menü → HUD çipleri → ses/ayar → harita → harita kontrolleri → sekmeler → panel → alt çubuk. Seçilemez olay seçeneği sayı tuşuyla uygulanmıyor (30+ yıl asılı kalan koşuda doğrulandı). Harita okları yöne göre en yakın komşuya, `#sr` "Çamhisar, Bağımsız Kabileler, asker ~5, saldırı şansı yüzde 100, A ile saldır" (G4 ile aynı sözcüksüz şans).
- Canlı bölge: tur sonu `#sr` "Yıl 4. Tahıl 74, artı 4,8. Altın 94, artı 7,1. Moral 79."; tahıl <0 iken `#sra` "Uyarı: kıtlık ya da boş hazine." Savaş sonrası `#sr` kazanç/kayıp özeti.
- ARIA tarama (`kb.mjs`): tekrar eden kimlik 0 (G3 hariç), adsız düğme 0, `aria-hidden` içinde odaklanabilir 0, rol/`aria-live` yukarıdaki gibi.

### 3.7 Ekran boyutları (ölçüldü + görsel)

375×812, 390×844, 768×1024, 1440×880, 812×375: sihirbaz 4 adım, kuruluş, oyun + 6 sekme (+ Bölge/Tesisler), saldırı, taşıma, yardım, içe aktar, olay, Miras (üst/alt), 7 bitiş türü (Fetih/Medeniyet/Hegemonya/yenilgi/rövanş/günlük/antrenman): sayfa yatay taşması 0, modal yatay taşması 0, hata 0 (`qg/c_ui2.mjs` → `c_ui2_*.json`, ekran görüntüleri `shots/g-<boyut>-*.png`).
- Bulunan sorunlar: G1, G2, G5, G11. Yatay 812×375'te bitiş ekranı eylem düğmeleri ilk ekranın dışında (kaydırmayla ulaşılıyor, `modal.sh 809 > ch 336`).
- Mobil alt çekmece: 3 durum (peek 72 px, yarım, tam) dokunmatik kaydırmayla (CDP touch) ulaşıldı, tutamaç 375×72; `refresh()` sonrası durum korunuyor; HUD şeridi dokunmatik yatay kaydırma çalışıyor (0 → 185 px); FAB 64×64, sağ alt.
- Güvenli alan: `viewport-fit=cover`, `env(safe-area-inset-*)` üst çubukta, FAB'da, çekmecede, modalda kullanılıyor; `Emulation.setSafeAreaInsetsOverride` (üst 47, alt 34) ile üst çubuk 48 → 95 px, FAB alt boşluğu 16 → 50 px: uygulanıyor (`shots/mob-375-safearea.png`).
- Klavye açıkken yerleşim (sayı/tohum alanı): yalnız görüntü alanını küçültme emülasyonuyla: sticky "Geri/Seferi Başlat" satırı görünür kalıyor, alanın kendisi bu emülasyonda otomatik kaydırılmıyor (gerçek klavyede tarayıcı kaydırır); kesin sonuç yok.

### 3.8 Performans ve boyut (ölçüldü)

- Dosya 412.892 bayt (403,2 KiB, bütçe ≤450 KB içinde, gzip 147 KB).
- Yeni oyun açılışı (sihirbaz): ~58 ms, hata 0. FCP 24-40 ms (4x CPU 84-92 ms).
- `perf46` yöntemi (Normal, 42. yıl, tek bölge): 1440×880: `drawOverlay` 4,8 ms, `refresh` 5,2 ms, `render` 0,32 ms, rAF 16,4 ms; 4x CPU: 19,0 / 20,1 / 1,2 / 16,4. 375×812: 4,9 / 5,2 / 0,17; 4x CPU: 19,0 / 19,9 / 0,66. 390×844 4x: 18,7 / 20,6. Uzun boy 92. yıl: 5,6 / 6,2; 375 4x: 21,5 / 24,3. Önceki belge ölçümleriyle (drawOverlay 5,6; 4x 18,5-21,6) uyumlu: gerileme yok.
- Efekt sırasında (saldırı, tur geçişi): rAF p95 16,7 ms, en uzun boşluk 16,8 ms (4x'te bir 33,3 ms kare), `drawOverlay` 0.
- Açılış G6. Bellek: bkz. 3.4.

### 3.9 Kayıt bütünlüğü

`fetih-ayar` bozuk/yok: bkz. 3.6. "SIFIRLA": küçük harf ASCII reddedildi (G12); doğru yazımda `SAVE`, `SAVE_OLD`, `SAVE_BAD`, `META_KEY`, `PREF_KEY` siliniyor ve sayfa yenileniyor (kod okuma; reload sonrası durum tam tarayıcı akışıyla ayrıca doğrulanmadı, yalnız yanlış girişin hiçbir şeyi silmediği ölçüldü). Depolama kapalıyken akış: 3.6.

## 4. Test edilmedi / sınırlı

- Gerçek dokunmatik cihaz (iOS Safari, Android Chrome): yalnız CDP dokunma emülasyonu (çekmece sürükleme, HUD kaydırma). İki parmak pinch, uzun basma ipucu, `100dvh`/adres çubuğu sıçraması, iOS sessiz anahtarı, gerçek klavye açılışı (visual viewport) denenmedi.
- Gerçek ses: duyularak değerlendirilmedi; yalnız sayısal ölçüm (tepe/RMS/kırpma/NaN/ses sayısı). Müzik/efekt dengesi, çalma güvenilirliği, Safari AudioContext davranışı bilinmiyor. Sekme gizleme gerçek sekme değiştirme değil, sahte `visibilitychange`.
- Ekran okuyucu (VoiceOver, NVDA) ile gerçek kullanım; `#sr`/`#sra` metinleri DOM'dan okundu, okunuşu/okunma sırası duyulmadı. axe-core çalıştırılmadı.
- Safari/Firefox, düşük bellekli cihaz bellek sınırları.
- Kontrast taraması hesaplanmış renk üzerinden: yarı saydam katmanlar birleştirildi ama harita üstü metinler (etiketler, rozet sayıları), gradyan/görüntü üstü yazılar ve devre dışı öğeler kapsam dışı. CVD simülasyonuyla sahiplik ayrımı sayısal ölçülmedi (yalnız görsel).
- Tuval çizim efektlerinin kare kare doğruluğu (dalga, ok, yüzen sayı) tek tek incelenmedi; ekran görüntüleriyle örneklem.
- UI ile kazanılmış tam oyun: yalnız karma yöntemle (ekonomi işlevleri doğrudan, saldırı/tur/olay/bitiş UI); tam saf-UI botu 4 oyunda yenildi.
- G10 (kenarda gizlenen hap) tek tek doğrulanmadı (kod okuma + 2 denemelik `pillMiss`).
- Bileşim sızıntısı testi tek hedefte yapıldı; sonuç zayıf kanıt.
- Savaş tahmin sapması (G4): 221 örnek, 24 oyun durumu; farklı bot/hanedan karmaları sınırlı.
- Sihirbazın 4 adımının hepsi 5 boyutta ekran görüntüsüyle alındı ama bitiş ekranı türlerinin 1440/768 sürümleri tek tek gözle incelenmedi (yalnız ölçüm + 375 örnekleri).
- Gerçek `Date` gece yarısı geçişi, uzun süreli (saatlerce) oturum belleği.
