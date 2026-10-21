# Fetih v0.8.0 QA raporu (Faz 1c, ara sürüm)

Ortam: başsız Chrome (CDP), localhost:8123. Betikler ve ham çıktılar: scratchpad `qa/` (c1_summary.json, a_save.log, b_daily.log, c_ui_*.json, d_robust.log, e_flow.log, f_fix.log, shots/*.png). index.html değiştirilmedi.

## Bulgular

| Kimlik | Şiddet | Bulgu | Yeniden üretme | Kanıt |
|---|---|---|---|---|
| B1 | orta (yüksek etki) | Kayıt doğrulaması "harita uyuşmuyor" ile başarısız olursa açılış ekranı kilitlenir: `showBad` içinde `r.raw` tanımsız, TypeError; yükleme perdesi açık kalır, modal yok. Bozuk kayıt silinir, yedek anahtarına `"undefined"` yazılır. Harita üretimi değişen bir sürüm güncellemesinde de aynı yol tetiklenir | Geçerli v8 kaydı al, `regions` dizisini 10 elemana kısalt, localStorage'a yaz, sayfayı aç | d_robust.log "bozuk:bölge-sayısı-uyuşmaz"; hata `showBad (index.html:877)` ← `start (:1960)`; ikinci yenilemede sihirbaz açılır (kayıt gitmiş) |
| B2 | orta | Oyunu bitiren saldırıdan sonra sonuç penceresi Esc ile kapatılırsa bitiş ekranı ve miras ödülü gelmez: `res` penceresi Esc korumalı değil, `afterModal` yalnız "Tamam" düğmesinde. Sonra "Turu Bitir" sessizce hiçbir şey yapmaz (`endTurn` S.over'da döner, toast yok). Sayfa yenilenince bitiş ekranı kurtarılır | Son rakip bölgesini saldırıyla al, Esc'ye bas, Turu Bitir'e bas | e_flow.log "final-savaş": afterEsc modal=null, over=win, metaDone=false, games=0; yenileme sonrası modal=over |
| B3 | düşük | `FTH-D20261301` (ay 13) gibi geçersiz tarihli günlük kod kabul edilir, `startDaily('2026-13-01')` oyun kurar ve kayda geçersiz tarih yazar | Tohum alanına `FTH-D20261301` | b_daily.log "kod:gecersiz-gun-ay13" |
| B4 | düşük | İçe aktarmada `{"a":1}` gibi JSON için ham "Cannot read properties of undefined (reading 'filter')" mesajı gösterilir (kayıt bozulmaz) | Kayıt yükle → `{"a":1}` | d_robust.log "aktarma:JSON-ama-oyun-değil" |
| B5 | düşük | Kayıt doğrulaması yüzeysel: `res.tahil=null`, `morale="x"`, negatif/metin asker sayısı sessizce kabul edilir (elle düzenlenmiş kayıt) | localStorage kaydını düzenle | d_robust.log "bozuk:kaynak-null", "bozuk:negatif/metin-asker" |
| B6 | düşük | `zoomBy(0)`, `zoomBy(NaN)`: kamera x/y/z NaN olur, harita kaybolur. İki parmak aynı noktaya basarsa (pinch d=0) aynı yola girer (kod okuma; dokunmatik ile denenmedi) | Konsolda `zoomBy(0)` | f_fix.log "zoom:NaN/Infinity/0/negatif" |
| B7 | düşük | `modal()` yeni içerikte kaydırma konumunu sıfırlamaz: Miras'ta aşağı kaydırıp Geri ile bitiş ekranına dönünce ekran kaydırılmış açılır (mobil 375, başlık kesik görünür) | Mobilde Miras → aşağı kaydır → Geri | shots/m375-13-bitis-fetih-zafer.png. Not: aynı sayfada showHelp→showImport'ta sıfırlandı (scrollTop 0), yani sorun yalnız bazı yollarda; tam koşul doğrulanmadı |
| B8 | düşük (mobil) | Saldırı/taşıma penceresinde asker sürgüsü satırı 375 px'te yatay taşar ("/16" kesilir); modal scrollWidth > clientWidth | 375x812, saldırı penceresi | c_ui_m375.json 07-saldiri, 08-tasima clipped.x=true; shots/m375-07-saldiri.png |
| B9 | düşük (mobil) | Dokunma hedefleri < 40 px: harita ＋ − ⤢ ◎ (34x34), Vazgeç/Saldır!/Taşı/Yükle (34 px yüksek), sürgü 16 px, "Kilitli kartlar" özeti 30 px, sihirbazdaki "🏛 Miras" bağlantısı 49x16. Masaüstünde de aynı | Tüm boyutlar | c_ui_*.json smallN/small |
| B10 | düşük | Mobil 375/390'da üst çubuk 128 px (ekranın %16'sı), Ordu ve Teknoloji sekmelerinde panel yatay taşar (panelX). Toast Turu Bitir düğmesini örter | 375x812 Ordu sekmesi | c_ui_m375.json hdrH=128, 06-sekme-ordu panelX=true; shots/m375-06-sekme-ordu.png |
| B11 | düşük | Kontrast < 4.5: "✖ Sur başına savunma" (4.1), "Kötü" etiketi (3.7), "Verim: %50" (4.4), "⚔ Koalisyon" (4.4), "şu an yapılamaz" (4.4) | Hanedan ekranı, kuruluş, üst çubuk | c_ui_*.json low |
| B12 | bilgi | Erişilebilirlik: aria-* ve role yok (beklenen), pencere role=dialog değil, tuval etiketsiz, toast aria-live değil, sekmeler role=tab değil; özel odak stili yok, tarayıcı varsayılan `outline:auto` kullanılıyor; Tab sırası mantıklı. İki onclick'li öğe tabindex'siz | Tab ile gez | e_flow.log a11y |

## Geçen kontroller (özet)

- Kombinasyon koşuları: 79 ayar × 5 tohum = 395 oyun; hata 0, invariant 0, randLeak 0, NaN/negatif kaynak 0 (tests/sim.js denetimi). Ayrıntı qa-1c.json.
- Olaylar: 18 olay + Biat Teklifi (S3), 43 seçenek koşusu, hata/invariant 0. Bekleyen olayla kaydet→yenile (1 ve 2 olay), 1/2/3 tuşları, çok olay, Esc'nin olayı kapatmaması, seçilemez seçeneğin tuşla uygulanmaması geçti.
- Kayıt: kuruluş, olay bekliyor, 2 olay bekliyor, savaş sonrası (40. yıl), bitiş ekranı noktalarında kaydet→yenile→devam bire bir aynı ve belirlenimci; bitiş ekranı 4 yenilemede ödülü tekrar vermedi; v4/v5 (gerçek Faz 0 kaydı), v6/v7 (kurgusal), bitmiş v7 göçü; bozuk/eksik/gelecek sürüm/bozuk META; localStorage erişim hatası, kota dolu; dışa/içe aktarma (oyun+miras, düz JSON, yalnız miras, geri miras, 8 çöp girdi).
- Günlük: 14 tarih (yıl/ay/artık gün sınırları), belirlenimci, 2 kart yasaksız, Kısa, Cuma Usta; ilk başlatma sayılır, ikincisi ve geçmiş tarih antrenman; gece yarısı geçişi; seri/mühür/boşluk/haftalık sancak; kod gidiş-dönüş 1008 kombinasyon.
- Arayüz: sihirbaz adımları, Zar at, Yeniden çek (1 kez), Kartsız, 2 kart sınırı, Hızlı Başla, geçersiz kod; Zaferi ilan et; 60 hızlı Turu Bitir; yeniden boyutlandırma 6 boyut; hata yakalayıcı gruplama; reduced-motion.
- 4 ekran boyutunda 7 bitiş ekranı türü dahil ekran görüntüleri: `scratchpad/qa/shots/`.

## Ek bulgular ve ölçümler (2. bölüm)

| Kimlik | Şiddet | Bulgu | Kanıt |
|---|---|---|---|
| B13 | bilgi | Kombinasyon koşuları: hata 0, invariant 0, randLeak 0, NaN/negatif kaynak 0 (395 oyun, 79 ayar x 5 tohum). Zorluğa göre kazanma: Çırak 86%, Kalfa 60%, Usta 31%, Destan 9%. Aykırı (<15% ya da >90%, n=5): Destan (Klasik, Börü, Tunç, Deniz 0/5), Kartal Usta/Destan 0/5, Börü Çırak 5/5, Bilge Çırak 5/5, Vadi Kısa 5/5, Vadi Uzun 0/5, Erken Savaş tek kart 5/5, 4 kart çifti (Kutsal İttifak+Kabile Destan, Sur+İttifak Usta, Kıtlık+Kabile Destan 0/5; Erken+Sürgün 5/5). Örneklem küçük: yalnız işaret | qa-1c.json combos.rows |
| B14 | bilgi | 150-190 turda bitmeyen oyunlar (bot sınırı): 13 ayar, en çok Savunmacı kişilik (3/5 oyun), Vadi Normal 2/5, Dağ Uzun 2/5. Kilitlenme/tur ilerlememe yok; yalnız yavaş kapanış | c1_summary.json noend |
| B15 | bilgi | `Erken Savaş + Sürgün Bey` yasaklı çift sessizce tek karta indirgenir (normCfg); sonuç Erken Savaş tek başına ile aynı. Beklenen davranış, kullanıcıya bildirim yalnız sihirbazda var | pair:erken+surgun |
| B16 | bilgi | Tasarım belgesi ile kod ayrışıyor: rövanş çarpanı belgede 0,5, kodda 0,8; Dağ Kalesi 45/Körfez 60 MP belgede, kodda 30/45; yenilgi MP'si belgede 8+ham/120, kodda 12+yakınlık+ham/120 | docs/faz1-tasarim.md 9.1-9.2, mpCalc, lockCost |
| B17 | bilgi | Meta alanları yanlış tipli (mp:"abc") sessizce varsayılana çekilir, bildirim yok (ham metin yedeklenmez). Bozuk JSON/dizi/sürümsüz META ise yedeklenir ve şerit gösterir; gelecek sürüm META salt okunur | d_robust.log meta-bozuk |

Geçen ölçümler (ek):
- Başarımlar: 25 başarımın 25'i koşulu kurulan sentetik oyunla `commitMeta` üzerinden tetiklendi, 10 olumsuz varyant tetiklemedi, Çırak'ta yalnız c işaretliler, rövanş/antrenman başarım açmıyor, ikinci kez verilmiyor. Not: gerçek oyunda üretilmedi, `S.stats` kurularak üretildi.
- MP: 864 kombinasyonluk ızgara (zafer/yenilgi x 4 zorluk x ilk 2 oyun x rövanş/antrenman x ferman x 2 hanedan x 3 tur) bağımsız hesapla eşleşti (kodun yorum satırındaki formülden; tasarım belgesinden değil). İlk sefer +20 bir kez, <15 yıl 0 MP ve oyun sayılmıyor, günlük +5 (antrenmanda yok), aynı oyun kimliği ikinci kez ödül vermiyor.
- Kilitler: yetersiz MP reddi, harcama/mpSpent, ikinci açma reddi, 2. bonus yuvası 400 MP harcamada, koşullu açılımlar (Usta, Destan, İttifak, Sürgün, Bilge, Deniz, Akıncı; Çırak ve antrenmanda yok).
- Hedef başarım: `lv()` olan 10 başarımın tamamı geçerli {t,ok} döndürdü; üst çubukta 🎯 görünüyor. Miras ekranı boş/zengin/kısmi META ile undefined/NaN olmadan çizildi.
- Gerçek oyun (UI zinciri): Klasik/Çırak/Kısa tohum 11: 82 Turu Bitir düğmesi tıklaması, 153 saldırı (Saldır! düğmesi), 10 olay (1 tuşu), 83. yılda Fetih zaferi; bitiş ekranı kendiliğinden açıldı, miras (68 MP, 1 oyun, 1 başarım) kendiliğinden yazıldı, 2 yenilemede ödül tekrarlanmadı, bitişten yeni oyun açıldı. Börü/Destan tohum 5: 20. yılda yenilgi, 45 MP, aynı doğrulamalar geçti. Not: bot kararları betik içinde (ekonomi işlevleri doğrudan çağrıldı), saldırı/tur/olay/bitiş yolları arayüz düğmeleri ve tuşlarıyla.
- Performans (başsız Chrome, yük altında): genMap 411-813 ms, buildArt 548-730 ms (12 tür/boy); yükleme 1,26-1,30 sn, en uzun ana iş parçacığı bloğu 289 ms (6 longtask, 50 ms üstü 6 kare boşluğu: üretim aşamalara bölünmüş). 200 turluk Uzun boy: endTurn ort 0,3-0,4 ms, en çok 1,2 ms; refresh ort 9 ms (en çok 19); render ort 1 ms; kayıt 49 KB; JS yığını ~25 MB. Bellek sızıntısı için tek ölçüm var, trend ölçülmedi.

## Test edilmedi / sınırlı
- Gerçek dokunmatik (iki parmak pinch, uzun basma): yalnız kod okuma; CDP dokunma emülasyonu açık ama pinch denenmedi.
- Gerçek cihaz/Safari/Firefox: yalnız Chrome (başsız).
- Ekran okuyucu ile gerçek kullanım; yalnız DOM/aria denetimi. Kontrast hesabı yaklaşık (hesaplanmış renk, yarı saydam arka plan ve görsel üstü metin kapsam dışı).
- Kombinasyonlar: 5 tohum/ayar; kazanma oranı sapmaları istatistiksel olarak zayıf. Yalnız fetih-odaklı bot ve iki yol botu; insan oyunu yok. 14 kartın hepsi tek başına ve 10 seçili çift koşuldu; 91 olası çiftin tamamı koşulmadı. Kişilik karması yalnız varsayılan dağılım.
- Gerçek `Date` değişimi sırasında (açık sayfada gece yarısı) otomatik yenileme yok; yalnız kayıtlı oyunun cfg.daily'sinin sabit kaldığı ve sihirbaz düğmesinin yeni günü gösterdiği ölçüldü.
- v6 ve v7 göçleri gerçek eski sürüm kaydı değil, v8 kaydından alan silinerek kurgusal üretildi (v4/v5 gerçek Faz 0 kaydı).
- Başarımların gerçek oyunda üretilebilirliği (örn. Son Kale, Küllerinden) ölçülmedi; yalnız koşul fonksiyonları.
- Tarayıcı sekmesi donması/bellek trendi uzun süreli, Safari/iOS bellek sınırları.
- Ekran görüntüleri: scratchpad/qa/shots (m375, m390, t768, d1440 x 20 ekran); bitiş ekranı türlerinde 1440 ve 768 görsel olarak tek tek incelenmedi, yalnız ölçüm; 375'te fetih zaferi ve yenilgi görsel incelendi.
