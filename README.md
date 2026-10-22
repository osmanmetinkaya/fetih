# ⚔ Fetih

Tarayıcıda oynanan, tek oyunculu, tur tabanlı bir fetih stratejisi. Tek bir başkentle başlarsın; kaynak toplar, nüfusu ve ordunu büyütür, teknoloji geliştirir ve rakip devletleri fethedersin. Her oyun farklı: hanedan, kural kartları, harita türü, rakip kişilikleri ve olaylar her seferinde yeni bir problem sunar.

🎮 **Hemen oyna:** https://osmanmetinkaya.github.io/fetih/

Kurulum yok; `index.html` dosyasını tarayıcıda açman yeterli. İlerleme tarayıcıya otomatik kaydedilir.

## Özellikler

- **Her oyun farklı.** 6 hanedan (+ Klasik), 14 kural kartı, 4 harita türü (Kıta, Nehir Vadisi, Dağ Kalesi, Körfez), 3 oyun boyu, 4 zorluk. 4 adımlı yeni oyun sihirbazı ve tek tıkla "Hızlı Başla".
- **Akıllı rakipler.** 4 yapay zekâ devleti saldırgan, tüccar, savunmacı ya da fırsatçı kişilikle oynar; koalisyon kurabilirler.
- **Olaylar ve ikilemler.** Her birkaç yılda bir seçimli olaylar çıkar.
- **3 zafer yolu.** Fetih (haritadaki bütün bölgeleri al: rakipler ve bağımsız kabileler; son bölgeler Hedef sekmesinde ve haritada işaretlenir), Medeniyet (Büyük Eser) ve Hegemonya. Oyun Fetih ile biter; Medeniyet ya da Hegemonya koşulu sağlanınca zaferi o an alıp almayacağın sorulur (fetihe devam edersen kilometre taşı olarak kalır). İstersen "Ferman" ile hedefini önceden ilan edersin; yeterince güçlüysen "Zaferi ilan et" ile oyunu isteğe bağlı erken bitirirsin.
- **Büyük, gerçekçi harita.** Yaklaşık 55 bölge; dağlar, ormanlar, tarlalar, nehirler ve yollar tek bir rölyefe işlenmiş. Geçilmez sıradağlar, dağ geçitleri, nehirler ve köprüler savaşı belirler.
- **Ekonomi ve nüfus.** 6 kaynağın her birinin askeri bir rolü var. Askerler nüfustan çıkar; çok asker almak üretimi düşürür. Tesisler 5 seviyeye kadar gelişir.
- **Ordu.** Karakol → Kışla → Talimhane → Ordugâh → Harbiye; her kademe yeni bir birlik açar (piyade, okçu, süvari, kuşatma, yeniçeri). Fetihte ganimetin yalnızca bir kısmı ele geçer, kalanı zayi olur.
- **6 dallı teknoloji ağacı** (dal başına 4 kademe).
- **Miras ve "bir oyun daha".** Her oyun sonunda miras puanı (MP) kazanırsın; hanedan, kart ve harita açarsın. Oyun sonu ekranı skor, rekor, rütbe ve ödül sırasını gösterir; tek tıkla yeni oyuna geçersin.
- **Günlük meydan okuma** (tarihten tohum), seri, paylaşılabilir sonuç kodu ve 25 başarım.
- **Oyun gibi arayüz.** Temiz modern strateji teması, tek stil SVG ikonlar, animasyonlar, WebAudio ile sentezlenmiş ses efektleri ve isteğe bağlı üretken müzik (varsayılan kapalı).
- **Masaüstü ve mobil.** Mobilde alt çekmece, başparmakla ulaşılan "Turu Bitir" düğmesi ve ≥44 px dokunma hedefleri.
- **Erişilebilirlik.** Klavye kısayolları, odak halkası, ARIA rolleri, renk körü modu, yüksek kontrast, yazı ölçeği, azaltılmış hareket.
- **Güvenli kayıt.** Sürümlü kayıt ve göç, bozuk kayıt yedeği, dışa/içe aktarma, tarayıcı kaydı kapalıyken uyarı.

## Kontroller

| | Masaüstü | Mobil |
|---|---|---|
| Bölge seç | sol tık | dokun |
| Saldır / asker taşı | seçili bölgeden komşuya sağ tık ya da "Saldır %N" düğmesi | komşuya dokun → "Saldır %N" |
| Harita | sürükle, tekerlek, çift tık | sürükle, iki parmak |
| Tur bitir | Boşluk / Enter | sağ alttaki düğme |

Kısayollar: `1-6` sekmeler, `M` sesi kapat/aç, `F` seçili bölgeye git, `?` yardım, `Esc` kapat. Ayarlar üst çubuktaki dişli simgesinde.

## Teknik

Tek bir HTML dosyası: düz JavaScript ve Canvas, dış bağımlılık yok (ses dosyası, font ya da kütüphane yok; ikonlar ve sesler kodla üretilir). Statik olarak yayınlanır.

## Geliştirme ve test

```bash
python3 -m http.server 8123   # sonra http://localhost:8123/
```

- `tests/index.html`: oyunu bir iframe'de açıp bot ile yüzlerce oyun koşturan simülasyon (`runSim`, `simJob`). Kullanım: `tests/README.md`.
- `tests/baseline-v6.json`: denge taban çizgisi (0.9.2, Fetih = bütün bölgeler; Medeniyet/Hegemonya karar penceresi); oyun mantığı değişmediyse birebir tekrarlanmalıdır.
- `tests/qa-*.md`, `tests/economy-1c.md`: QA ve ekonomi/denge raporları.
- `docs/faz1-tasarim.md`, `docs/gorsel-dil.md`: oyun tasarımı ve görsel dil belgeleri; `docs/ikonlar.svg`: ikon seti.
