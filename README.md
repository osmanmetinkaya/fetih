# ⚔ Fetih

Tarayıcıda oynanan, tek oyunculu, tur tabanlı bir strateji ve fetih oyunu. Tek bir bölgeden başlarsın. Kaynak toplar, bilgi geliştirir, ordunu büyütür ve rakip devletleri fethedersin.

## Nasıl oynanır?

🎮 **Hemen oyna:** https://osmanmetinkaya.github.io/fetih/


Kurulum gerekmez. `index.html` dosyasını tarayıcıda açman yeterli. Oyun ilerlemesi tarayıcıya otomatik kaydedilir.

## Özellikler

- **Büyük ve gerçekçi harita.** Yaklaşık 55 oynanabilir bölge var. Yakınlaştırılıp kaydırılabilen haritada dağlar, ormanlar, tarlalar, nehirler ve yollar ayrı çıkartmalar değil, tek bir yüzeyin parçası: hepsi aynı ışıkla gölgelenen rölyefe işlenmiş. Dağlar yükseklikten doğar, ormanlar tek tek ağaç taçlarından oluşur, tarlalar sürülmüş parseller halindedir.
- **Arazi önemli.** Sıradağlar geçilmez. Dağ geçitleri savunmaya +%40 verir. Köprüsüz nehir geçişi saldırıyı zayıflatır, süvariyi daha da çok. Dağ ve orman savunmayı güçlendirir.
- **Ganimet.** Fethettiğin bölgenin stokundan yalnızca %30–70'i ele geçer, kalanı yangın ve yağmada zayi olur. Az kayıpla kazanırsan daha çok kurtarırsın.
- **Nüfus.** Askerler bölgenin nüfusundan çıkar. Nüfus tahılla büyür. Çok asker almak işgücünü ve dolayısıyla üretimi düşürür.
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
- **Yapay zekâ rakipler.** 4 rakip devlet ve bağımsız kabileler var.

## Teknik

Tek bir HTML dosyası: düz JavaScript ve Canvas. Dış bağımlılık yok.

## Kontroller

- **Sol tık:** bölge seçer.
- **Sağ tık:** kendi bölgen seçiliyken komşu bölgeye saldırır ya da asker taşır.
- **Sürükle / tekerlek:** haritayı kaydırır ve yakınlaştırır.
- **Çift tık:** bölgeye yakınlaştırır.
- **Sağ panel:** Bölge, Ekonomi, Ordu, Teknoloji ve Kayıt sekmeleri. Tüm yönetim tek yerde.
