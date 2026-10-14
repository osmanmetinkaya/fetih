# ⚔ Fetih

Tarayıcıda oynanan, tek oyunculu, tur tabanlı bir strateji ve fetih oyunu. Tek bir bölgeden başlarsın. Kaynak toplar, bilgi geliştirir, ordunu büyütür ve rakip devletleri fethedersin.

## Nasıl oynanır?

🎮 **Hemen oyna:** https://osmanmetinkaya.github.io/fetih/


Kurulum gerekmez. `index.html` dosyasını tarayıcıda açman yeterli. Oyun ilerlemesi tarayıcıya otomatik kaydedilir.

## Özellikler

- **Her seferinde farklı bir harita.** Geçilmez sıradağlar, stratejik dağ geçitleri, nehirler ve köprüler, ayrıca liman, kavşak, harabe, eski kale gibi özel bölgeler var.
- **Kuruluş aşaması.** Oyun başında verilen 260 akçeyle başkentine 1–2 kaynak tesisi satın alırsın.
- **Kaynak tesisleri.** Tarla, kereste, taş ocağı, demir madeni, pazar ve medrese var. Fethettiğin bölgelerde tarımdan gelen tahılla yenilerini kurarsın. 5 seviyeye kadar gelişirler ve verimleri araziye göre değişir.
- **Her kaynağın askeri bir rolü var:**
  - Tahıl ikmali sağlar.
  - Odun kuşatmada kullanılır.
  - Taş sur yapmaya yarar.
  - Demir silah donanımı sağlar.
  - Altın asker ve maaş için gerekir.
  - Bilgi teknoloji açar.
- **Askeri kuruluşlar.** Karakol → Kışla → Talimhane → Ordugâh → Harbiye. Her kademe otomatik üretimi hızlandırır ve yeni bir birlik türü açar.
- **Birlik türleri:**
  - 🗡️ Piyade: dengeli
  - 🏹 Okçu: savunmada güçlü
  - 🐎 Süvari: ovada güçlü hücum birliği
  - 🪨 Kuşatma Takımı: surları kırar
  - ⚔️ Yeniçeri: seçkin birlik
- **Teknoloji ağacı.** 6 dal ve her dalda 4 kademe var. Her teknolojinin kendi detay penceresi açılır.
- **Yapay zekâ rakipler.** 3 rakip devlet ve bağımsız kabileler var.

## Teknik

Tek bir HTML dosyası: düz JavaScript ve Canvas. Dış bağımlılık yok.

## Kontroller

- **Sol tık:** bölge seçer.
- **Sağ tık:** kendi bölgen seçiliyken komşu bölgeye saldırır ya da asker taşır.
- **Çift tık:** bölge yönetim penceresini açar.
