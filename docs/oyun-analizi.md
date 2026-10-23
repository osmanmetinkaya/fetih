# Fetih: "Gerçek bir strateji oyunu gibi görünmek" analizi ve planı

> Rol: oyun analisti / sanat yönetmeni. Tarih: 23.10.2026. Kod değiştirilmedi; bu belge yalnızca teşhis ve plandır.
> Kullanıcının şikâyeti: *"Oyun arayüzü hâlâ gerçek bir oyun gibi durmuyor. Yapay zekâdan çıktığı çok belli."*

## 1. Ne gördüm (yöntem ve kanıt)

**Nasıl baktım.** `index.html` (429 136 bayt, v0.9.2) yerel sunucudan (`localhost:8123`) başsız Chrome ile açıldı; betik (`scratchpad/oa/shots.mjs` + `steps.json`) oyunun kendi işlevlerini çağırarak (`wizGo`, `launch`, `quickSetup`, `setTab`, `showEvent`, `openAttack`, `showMiras`, `showSettings`, `showMenu`, `centerOn`, `fitCam`, `showEnd`) 19 ekranı **1440×880** ve **375×812 (2x, dokunmatik)** boyutlarında çekti. Toplam 38 ekran görüntüsü:
`/private/tmp/claude-501/-Users-osman/43ff13d3-c66b-4b6c-9bc1-b657fa0f123e/scratchpad/oa/shots/` (`00-wiz0` … `18-bitis`, mobil için `m-` önekli). Hepsini açıp inceledim. Ayrıca `README.md`, `docs/gorsel-dil.md` (başlıklar ve ilke bölümleri) ve `index.html` içindeki `:root` token'ları, CSS kalıpları, `SFX` ses tanımları, `showEvent` şablonu okundu.

**Önemli not.** Çekimler, başka bir ajanın fontları serife çevirmesinden **önceki** hâli gösteriyor (`--font-ui: system-ui…`, `@font-face` sayısı 0). Referans oyunlarla ilgili yazdıklarım bu oturumda çekilmiş ekran görüntülerine değil, alan bilgisine dayanıyor; font lisans/alt küme bilgileri Google Fonts deposundaki `METADATA.pb` dosyalarından doğrulandı (Alegreya, Alegreya SC, Cinzel: OFL, `latin-ext`).

**Ölçülen taban çizgisi (bugünkü durum):**

| Ölçü | Değer | Kaynak |
|---|---|---|
| Font ailesi | 1 (sistem sans: SF/Segoe/Roboto) + `ui-rounded` sayılar | `:root --font-ui/--font-num` |
| Gömülü font | 0 | `@font-face` sayısı |
| Doku (kağıt/deri/taş vb.) | 0 | `mask-image`, `border-image`, `feTurbulence`, doku `url()` yok |
| Çerçeve/köşe süsü | 0 | `border-image` 0 |
| Köşe yarıçapı | 4/6/10/14/999 px; en sık 10 px (`--rad-md`, 13 yer) | CSS |
| Gölge | 32 `box-shadow`; hepsi "iç üstte 1 px beyaz çizgi + aşağı yumuşak gölge" kalıbı (`--e-1..3`) | `:root` |
| İllüstrasyon / portre / amblem | Oyunun hiçbir ekranında yok. Tek "resim" bitiş ekranındaki harita küçük resmi | ekranlar |
| İkon | 95 SVG `<symbol>`, tek stil dolu glif; kaynakta hâlâ ~110 farklı emoji kod noktası (`⚔` 30, `🪙` 25, `📜` 25 …; çıkışta ikona çevriliyor, `🔓 Aç` gibi birkaçı doğrudan görünüyor) | kaynak sayımı |
| " · " ayracı | 233 kez | kaynak sayımı |
| Ses: UI tıkı | 1800→1200 Hz üçgen dalga + 4 kHz gürültü; üzerine gelme sesi 2400 Hz bip | `SFX['ui-tik']`, `SFX['ui-hover']` |
| Ana menü / başlık ekranı | Yok. Oyun boş HUD iskeletinin üstünde bir modal ile açılıyor | `00-wiz0` |

**Güçlü taraf (korunmalı).** Harita gerçekten oyun gibi: rölyefli dağlar, karlı zirveler, ormanlar, tarla şeritleri, nehirler, yollar, köy siluetleri, kale simgesi. Ekranlarda "oyun" duygusunu veren **tek** öğe bu. Sorun haritada değil; haritanın etrafındaki her şey bir yönetim paneli dilinde yazılmış ve harita bu panelin içine yerleştirilmiş bir "grafik" gibi duruyor.

**Kök neden (belgelerde açıkça yazıyor).** `docs/gorsel-dil.md` §1: *"Arayüz soğuk, koyu lacivert-arduvaz ve düz renkli … Arayüzde doku, ahşap, parşömen yok. Süs yalnızca altın vurgu çizgisi ve ikonlarda."* ve §3.1: *"Georgia/serif kaldırılır … kimlik … serifle değil."* Yani yapay görünüm bir uygulama hatası değil, **bilinçli olarak seçilmiş bir yönün** sonucu: "temiz modern strateji" yönü, uygulandığında, 2020'lerin koyu temalı SaaS bileşen kitaplıklarından (shadcn/Radix/Tailwind koyu tema) ayırt edilemiyor. `--bg-0:#0E1117` neredeyse GitHub'ın koyu tema zemini (#0D1117); bu tesadüf durumu iyi özetliyor.

## 2. Teşhis: "yapay zekâ yapımı / SaaS paneli" göstergeleri

Önem sırasına göre. "Ağırlık" sütunu, o göstergenin "bu bir web uygulaması" izlenimine katkısı hakkındaki yargım (Y = yüksek, O = orta, D = düşük).

| # | Gösterge | Nerede (ekran / CSS) | Neden yapay hissettiriyor | Gerçek oyunlarda karşılığı | Ağ. |
|---|---|---|---|---|---|
| 1 | **Başlık ekranı / ana menü yok** | `00-wiz0`: oyun, arkada boş sekme çubuğu ve sönük "Turu Bitir" düğmesi görünen HUD iskeletinin üstünde 880 px genişliğinde bir diyalogla açılıyor. Başlık: 18 px sistem fontunda "Fetih" ve bir cümle | İlk 3 saniye "uygulamaya hoş geldiniz" diyaloğu gibi. Oyunun adı, amblemi, müziği, dünyası yok. İlk izlenim bütün oyunun algısını belirliyor | Civ VI: tam ekran sanat + tema müziği; HoMM3: resimli ana menü; Northgard: klan sancakları; Songs of Conquest: sanatlı başlık + canlı müzik. Hepsinde ana menü oyunun "kapağı" | Y |
| 2 | **Hazır koyu tema token seti** | `:root`: `#0E1117/#151A23/#1D2430` arduvaz katmanları, `#F2B33D` amber vurgu, `--e-1..3` (iç üst 1 px beyaz + aşağı gölge), 4-px boşluk ızgarası, `--rad-md:10px` | Tek tek doğru ama hepsi birlikte Vercel/Linear/shadcn panellerinin birebir görünümü. Hiçbir dönem, malzeme, kültür göstermiyor. Göz bunu "web uygulaması" olarak saniyeler içinde tanıyor | Her strateji oyununun arayüzü bir **malzemeden** yapılmış: CK3 koyu ahşap ve altın; Old World parşömen ve bronz; Total War: Warhammer taş ve demir; Civ VI mavi-yeşil harita masası + pirinç | Y |
| 3 | **Sistem sans font, 3 ağırlıkla her şey** | Bütün metinler `system-ui`; başlıklar kalın sans (`Hanedanını seç`, `Kural kartları`), bölüm etiketleri BÜYÜK HARF + harf aralığı (`HARİTA TÜRÜ`, `YENİ TESİS KUR`, `BİRLİKLER`) | Kalın sans başlık + gri büyük harf bölüm etiketi + 14 px gövde, Tailwind şablonlarının imzası. Tipografi kimliği sıfır | Civ VI (yüksek kontrastlı serif başlık), CK3 (serif başlık + okunur gövde), HoMM (serif), Old World (klasik serif). "Temiz" Humankind bile özel bir display font kullanıyor | Y |
| 4 | **KPI karoları ve kart içinde kart** | Bölge sekmesi: `Asker 17 / Nüfus 62 / Savunma ×1.23` üç karo; Ordu: `Toplam asker / Oto. üretim / Moral`; sihirbaz, olay, saldırı, miras: hepsi aynı 10 px yuvarlak, 1 px `#2F394A` kenarlı kutular; panel > kart > kart iç içe | "Metrik karosu" (etiket üstte küçük, değer altta büyük) analitik panolarının birinci kalıbı. Bütün bilgi aynı kutu tipine konunca hiyerarşi kaybolur ve "bileşen kitaplığı" hissi doğar | Oyunlarda istatistik ya illüstrasyonun yanına yazılır (HoMM kahraman ekranı), ya defter satırı gibi dizilir (CK3 karakter sayfası), ya ikonlu tek satır olur (Civ şehir paneli). Karo yok | Y |
| 5 | **Üst çubukta kutulu "ikon + sayı + ▲delta" çipleri** | `05-oyun` üst çubuk: 9 ayrı yuvarlak kutu; her biri `70 ▲+8,2` biçiminde, renkli sol kenarlı | Borsa/analitik "ticker"ı gibi. Her değeri kutulamak eşit önem verir; delta okları finans dilidir | Civ VI ve Humankind: üst şerit tek bir bant; ikon + sayı + parantezde gelir, **kutusuz**. CK3: bant üstünde gömme (kakma) yuvalar. Kutu yok, bant var | Y |
| 6 | **Her ekran aynı ortalanmış koyu modal** | Olay, saldırı, ayarlar, menü, miras, sihirbaz, bitiş: hepsi ortada, aynı zemin, aynı köşe, sağ üstte `×` | Ekran türleri arasında hiçbir ayrım yok. Oyunlarda her ekranın kendi "nesnesi" vardır (mektup, rapor, kitap, harita masası); burada hepsi "Dialog" bileşeni | CK3: olay = resimli mektup; Total War: savaş öncesi = iki ordunun sancaklı karşılaştırma ekranı; Civ: teknoloji = tam ekran ağaç; HoMM: kasaba = tam ekran sahne | Y |
| 7 | **Hiç illüstrasyon, portre, amblem, sancak yok** | Hanedanlar 1 em'lik glif (`Börü Hanlığı` kurt başı); rakipler `▼ ● ■ ◆` renkli işaretler (`04-kurulus`, `08-hedef`: grafik lejantı gibi); olaylarda görsel yok | Strateji oyununda "kiminle savaşıyorum" duygusu amblem ve yüzle kurulur. Renkli nokta, Excel grafiğinin lejantıdır | CK3 hanedan armaları ve portreleri; Old World aile amblemleri ve portreler; Total War faksiyon sancakları; Civ lider portreleri; Northgard klan hayvan amblemleri | Y |
| 8 | **Harita ile arayüz arasında üslup kopukluğu** | Sıcak rölyef harita, soğuk düz lacivert arayüz (bilinçli karar, `gorsel-dil.md` §1). Harita, koyu lacivert boşlukta keskin dikdörtgen kenarla duruyor (`17-harita-uzak`: üstte ve altta "letterbox" boşluk; mobilde `m-05` haritanın üstünde ~60 px boş koyu şerit). Harita üstü bilgiler (`~10` altıgen, `~%95` yeşil kenarlı hap) web rozetleri | İki ayrı ürünün yan yana konduğu izlenimi: "bir harita bileşeni + bir yönetim paneli". Haritadaki haplar oyun dünyasına değil arayüze ait | Old World ve Civ'de çerçeve, harita ile aynı sıcak paletten; harita kenarı sise, buluta veya kağıt kenarına erir. Harita üstü bilgiler kalkan, sancak, mühür biçiminde | Y |
| 9 | **Metin dili: formül ve açıklama** | `Süvari saldırısı ×1,2 (1,7→2,04)`, `Verim: 240%`, `Kart çarpanı ×1 · toplam miras ×0,6 · zorluk ●●○○○`, `(isteğe bağlı, üst çubukta izlenir)`, rakip adlarında `(?)`, kalıcı ipucu şeridi `Sol tık: seç · Sağ tık: saldır …`; 233 adet " · " | Tasarım belgesi dili oyuncuya aktarılmış. Her cümle bir mekanik açıklıyor, hiçbiri dünyayı anlatmıyor. Yapay zekâ çıktısının tipik izi: eksiksiz, doğru, ama sesi yok | CK3/Old World: önce anlatı cümlesi, sayılar ipucunda ya da sonuç satırında. Civ: ad + tek satır + ikonlu sayı; ayrıntı Civilopedia'da | Y |
| 10 | **Teknoloji ağacı = 24 küçük kutu ve kırık sözcükler** | `09-tek`: 4×6 ızgara, sözcükler harf ortasından bölünmüş: `Demir/cilik`, `Kuşat/ma Kulele/ri`, `Harita/cılık`, `Askeri Disipli/n`. Sebep: `.node{overflow-wrap:anywhere}` + dar sütun | Kırık sözcük "bitmemiş, kimse bakmamış" hissinin en güçlü işareti. Ağaçta bağlantı çizgisi, çağ, görsel yok; tablo hücresi | Civ: tam ekran, bağlantılı, çağ bantlı ağaç; Humankind: çağ sütunları; AoW4: kitap sayfası | Y |
| 11 | **Oyunlaştırma/uygulama sözlüğü** | Bitiş: `SKOR 2.060`, rütbe çubuğu, `Sonucu kopyala`; miras: `Seri 0 gün`, `Mühür 0/2`, `Günlük meydan okuma`, `MP`; sihirbaz: `⚡ Hızlı Başla`, `Önerilenle başla` | Mobil F2P ve Wordle dili. Dönem ve dünya sözcükleri yerine metrik sözcükleri | Oyunlarda puan bile dünyadan adlandırılır: CK3 "Prestige/Renown", Old World "Legitimacy", Civ "Era Score" | O |
| 12 | **Birincil eylem = dev sarı dolu düğme** | `Turu Bitir` sağ altta 260×56 sarı dikdörtgen; `Hızlı Başla`, `Bugünü oyna`, `Önerilenle yeni oyun` tam genişlik sarı şeritler; mobilde Material Design FAB (`Bitir`) | Bootstrap/shadcn "primary CTA". Oyunlarda tur düğmesi bir **nesnedir** | Civ: sağ altta yuvarlak, durum ikonlu madalyon; HoMM: kum saati; Old World: tur düğmesi süslü madalyon; Humankind: büyük dairesel tur halkası | O |
| 13 | **Simetrik ızgara ve sihirbaz adım çubuğu** | `1 Hanedan — 2 Kartlar — 3 Harita — 4 Kuruluş` adım göstergesi (e-ticaret ödeme akışı); eşit 5 sütunlu kart ızgaraları; bitişte 3+2 eşit düğme ızgarası | Ödeme/kayıt akışının kalıbı. Oyunlarda yeni oyun kurulumu tek sayfalık "masa"dır | Civ VI "Create Game"; Old World kurulum: tek ekran, solda lider/aile görselleri, sağda ayarlar | O |
| 14 | **Ayarlar = web ayarlar sayfası** | iOS anahtarları, sarı dolu sürgüler, segment kontrolleri (`14-ayar`) | Tek başına sorun değil (oyunlarda da ayarlar sade) ama öteki her şeyle birleşince "uygulama" izlenimini pekiştiriyor | Oyunlarda ayarlar sade ama oyunun malzemesinden: sürgü tutamacı bir mühür ya da pirinç topuz | D |
| 15 | **Tek stil dolu glif ikonlar her yerde, aynı boyda** | Sekmeler, çipler, düğmeler, tablolar: 1,15 em dolu glif; metinle aynı ağırlık | FontAwesome/Material izlenimi; ikonlar hiyerarşi kurmuyor, süs olmuyor | Oyunlarda ikon iki sınıftır: küçük kaynak ikonları (sade) + büyük "nesne" ikonları (çerçeveli, gölgeli, renkli: teknoloji, birim, bina) | O |
| 16 | **Ses: dijital tık ve bip** | `ui-tik` 1800 Hz üçgen + 4 kHz gürültü; `ui-hover` 2400 Hz bip; `ui-hata` 180 Hz kare dalga | Bilgisayar arayüzü sesleri. Göz "uygulama" görüyorsa kulak bunu onaylıyor | Oyunlarda UI foley'dir: tahta tok, kağıt hışırtısı, metal tıngırtı, mühür basma, zar, sancak dalgalanması | O |
| 17 | **Yardım metni kalabalığı ve boş durum cümleleri** | `Geliştirilebilir tesis yok. Yeni tesis kurmak için bir bölgenin Tesisler sekmesine git.`; `Tesisler ağırlıkla tahılla kurulur ve geliştirilir. Üretim bölgenin işgücüne bağlıdır (şu an %100). Azami seviye Sv.1.`; `Klavye: 1 / 2 · Seçmeden yıl bitmez.` | Her paragraf bir "empty state" ya da "helper text". Kullanıcı arayüzü yazım kılavuzlarının dili | Oyunlarda bu bilgiler ipucunda, danışmanda ya da Civilopedia'dadır; ana ekranda tek satırlık durum yazılır | O |
| 18 | **Renk kodlaması pano gibi** | Her +/− yeşil/kırmızı; `Verim: 240%` yeşil, `50%` kırmızı; saldırı penceresinde yeşil halka grafiği `~%95 Güçlü` | KPI halkası ve kırmızı/yeşil trend, pano dilinin parçası | Total War: iki ordunun güç çubuğu (sancak renkleriyle); Civ: savaş önizlemesinde iki birim portresi ve kılıç ikonları | D-O |
| 19 | **Hareket dili: "ease-back" sıçrama, kayma, parıltı** | `--ease-back` taşan eğri, `--e-glow` amber halka, kartların yukarı kayması | Mikro etkileşim kitaplıklarının imzası. Malzemesi olmayan nesneler sıçrıyor | Oyunlarda hareket malzemeye uyar: parşömen açılır, mühür basılır, sancak dalgalanır, mürekkep yayılır | D |
| 20 | **Mobilde boşa harcanan alan ve FAB** | `m-05`: üst çubuk ile harita arasında boş koyu şerit, haritanın %40'ı deniz, ipucu baloncuğu harita üstünde kalıcı, `Bitir` FAB'ı | Mobil web uygulaması kalıbı | Mobil strateji (Polytopia, Civ VI iOS, Northgard mobil): harita tam ekran, kenarlarda ince oyun çerçevesi, tur düğmesi köşede madalyon | O |

**Özet cümle:** Fetih'in arayüzü **doğru, tutarlı, erişilebilir ve kişiliksiz**. Kişiliksizlik tam da "yapay zekâ yapımı" algısını yaratan şey: hiçbir şey yanlış değil, ama hiçbir şey bir insanın bu dünyayı sevdiğini göstermiyor (amblem, illüstrasyon, dönem sesi, kırık kurallar, el işçiliği izi). Harita bu sevgiyi gösteren tek yer.

## 3. Referans karşılaştırması

Kaynak: oyunlarla ilgili alan bilgisi (bu oturumda bu oyunların ekran görüntüsü çekilmedi). Görsel içerik kopyalanmaz; yalnızca ilkeler çıkarılır.

| Oyun | Ekran mimarisi | HUD düzeni | Bilgi hiyerarşisi | Görsel kimlik (malzeme, çerçeve, tipografi, renk) | His (hover/tık/geri bildirim) | Ses | Anlatım dili |
|---|---|---|---|---|---|---|---|
| **Civilization VI** | Ana menü (sanat + tema şarkısı) → kurulum → harita; tam ekran teknoloji/kültür ağaçları, lider diplomasi ekranı (3D portre), şehir paneli sol alt | Üstte tek bant (kaynak + gelir parantezde), sağ üstte rapor düğmeleri, sağ altta yuvarlak tur düğmesi + bildirim yığını, sol altta birim/şehir paneli | Harita > tur düğmesi/bildirim > seçili nesne paneli > üst bant. Sayılar ikonlu ve kısa | "Kartograf masası": harita sis yerine eski harita çizimine dönüşür; panellerde koyu mavi-yeşil + pirinç çerçeve; serif başlık; her teknolojinin küçük resmi | Düğmelerde ince parlama; tur başı bildirimleri sağdan kayar; savaş önizlemesi iki birimi karşı karşıya koyar | Her çağda değişen müzik; teknoloji alıntıları sesli okunur | Her teknolojiye tarihî alıntı; danışman uyarıları kısa ve kişili |
| **Civilization VII** | Çağ geçişleriyle bölünmüş oturum; liderler ve uygarlıklar ayrık seçilir | Civ VI'nın sadeleşmiş, daha "modern" bant düzeni | Harita odaklı, paneller daha ince | Daha düz ve modern; ama zengin 3D harita, lider portreleri ve süslü başlıklarla dengelenir | Akıcı geçişler, belirgin kartlar | Orkestral, çağa göre | Anlatı olayları, seçimli metinler |
| **Humankind** | Ana menü → avatar/kültür seçimi → harita; çağ geçişinde tam ekran kültür seçimi | Üstte ince bant, sağ altta büyük dairesel tur halkası, sol altta seçim paneli | Harita > halka > seçim | **"Temiz modern" yönün başarılı örneği**: düz paneller ama her kültürün resimli kartı, avatarlar, zengin harita. Ders: düz arayüz, ancak illüstrasyon ve kişi yüzleriyle taşınabiliyor | Yumuşak, büyük geçişler | Kültüre göre değişen müzik | Kısa, tarihî tonlu olay metinleri |
| **Age of Wonders 4** | Ana menü (3D sahne) → yönetici/krallık yaratma → harita; büyüler bir "kitap" | Üst bant + sağda bildirim, alt köşede tur | Harita > hükümdar > bildirim | Fantastik ama tutarlı malzeme: koyu metal + altın + kitap sayfası. Büyü ağacı = kitap sayfaları | Kart ve kitap metaforu tıklarken hissedilir | Orkestral + diegetik ses | Lore dolu ama kısa |
| **Total War (Rome II, Three Kingdoms, Warhammer)** | Kampanya haritası + taktik savaş; her faksiyon kendi UI çerçevesine sahip (Three Kingdoms'ta mürekkep resmi, Warhammer'da faksiyon başına malzeme) | Alt orta: seçili ordu/şehir şeridi; sağ alt: tur; sol üst: faksiyon amblemi | Amblem + ordu kartları + harita | **Faksiyon kimliği**: arayüz malzemesi ve sancak faksiyonla değişir. Three Kingdoms: Çin mürekkep resmi harita ve ipek/kağıt paneller | Savaş öncesi "iki sancak karşı karşıya" ekranı; ganimet ve kayıp listesi | Davul, boru, koro; faksiyona göre müzik | Askeri, kısa, rütbe ve unvanlarla |
| **Crusader Kings III** | Harita (ülke boyalı) + karakter odaklı; olaylar resimli pencereler; hanedan ağacı ekranı | Sol üstte hükümdar portresi ve armalar; üstte kaynak bandı; sağ altta zaman kontrolü; sağda uyarı simgeleri | **Kişi > hanedan > ülke > kaynak** | Koyu ahşap/deri zemin, altın çerçeve, prosedürel armalar (alan bölmesi × figür × renk), prosedürel portreler; serif başlık | Uyarılar küçük simge yığını; olay penceresi illüstrasyon + 2-4 seçenek; ipucu içinde ipucu | Ortaçağ enstrümanları (lavta, davul, koro) | Dönem tonlu, kişisel, kısa olay metinleri; seçeneklerin altında sonuç satırı |
| **Old World** | Harita (hex) + aile/karakter; olaylar seçimli mektuplar | Üst bant; sağda olay/uyarı; alt orta: seçim | Hükümdar ve aileler > olay > kaynak | **Parşömen + bronz**: açık parşömen paneller, koyu mürekkep metin, süslü çerçeve; klasik serif; aile amblemleri | Olay kartları kağıt gibi açılır | Antik dönem enstrümanları | Edebi, bol olaylı; her kararın tarihî bağlamı |
| **Northgard** | Klan seçimi (büyük hayvan amblemi) → harita | Üst bant (kaynak), sol alt seçim, sağ üst mini harita | Klan > kaynak > harita | İskandinav: ahşap + taş + rün; büyük klan amblemleri (kurt, ayı, karga…); stilize el boyaması harita | Çok sade ama dokulu; mevsim değişimi tüm haritayı boyar | Nordik çalgılar, mevsime göre müzik | Az metin, sert ve kısa |
| **Songs of Conquest** | Piksel sanat ana menü → harita → savaş | Alt şerit (kahraman + ordu), sağ üst mini harita | Kahraman > ordu > harita | Piksel sanat + el yapımı süslü çerçeveler; HoMM mirası | Her tık bir "tok" sesi; parlak geri bildirim | Canlı, melodik müzik; ses kimliği güçlü | Masalsı |
| **Heroes of Might and Magic III** | Ana menü → harita → tam ekran kasaba (kasaba = resim) → savaş | Sağda dikey panel: mini harita, kahraman portreleri, kasaba listesi, kum saati (tur); altta durum çubuğu | Kahraman/kasaba portreleri > harita | Taş/ahşap/deri dokulu çerçeve, her faksiyonun kasaba illüstrasyonu, serif | Her eylemin sesi; kum saati | Faksiyona özgü kasaba müzikleri, efsanevi | Kısa ve tarihî/masalsı |
| **Into the Breach / Slay the Spire** (minimalist kontrol) | Az ekran, sade | Sade | Net | **Minimalizm ama kimlikli**: özel piksel/el çizimi font, sınırlı ama karakterli palet, el çizimi illüstrasyon | Çok güçlü "juice": sarsıntı, ses, sayı uçması | Kimlikli müzik | Kısa, kuru mizahlı |

**Çıkarılan ilkeler (Fetih'e uygulanacak):**

1. **Arayüzün bir malzemesi olmalı** (ahşap, parşömen, deri, metal, ipek). "Düz renk" bile bir malzeme olarak sunulmalı (Humankind'ın düzlüğü illüstrasyonla dengeleniyor). Fetih'in hiç illüstrasyonu olmadığı için düz yön işlemiyor.
2. **Kimlik amblemle ve yüzle kurulur.** Her güç (oyuncu, rakipler, kabileler) bir sancak/armayla görünmeli; renkli nokta asla tek başına durmamalı.
3. **Ekran türleri nesne olarak farklılaşır:** olay = mektup/ferman, savaş = iki sancağın karşılaşması, teknoloji = kitap/ağaç, bitiş = vakayiname. Her şey aynı "dialog" olmamalı.
4. **Üst bant kutusuz bir şerittir;** tur düğmesi bir madalyon/nesnedir; bildirimler yanında yığılır.
5. **Önce anlatı, sonra sayı.** Mekanik ayrıntı ipucuna, ansiklopediye ya da sonuç satırına gider.
6. **Ses foley'dir,** dijital bip değil; müzik dönem çalgılarıyla.
7. **Harita ile çerçeve aynı paletten gelir;** harita kenarları kâğıda, sise ya da denize erir.
8. **Minimalizm ancak kimlikli bir font + kısıtlı ama karakterli palet + el işçiliği izleriyle** (Into the Breach) "bilinçli" görünür; kimliksiz minimalizm "şablon" görünür.

## 4. Bir strateji oyunu nasıl olmalı: Fetih'e uyarlanmış plan

### 4a. Ekran ve öğe envanteri

Öncelik: **P1** = "oyun gibi" algısına en büyük katkı / düşük-orta maliyet; **P2** = belirgin katkı; **P3** = sonra.

| Öğe | Referans | Fetih'te bugün | Öneri | Öncelik | Maliyet |
|---|---|---|---|---|---|
| **Başlık ekranı / ana menü** | Civ, HoMM, Northgard | Yok (doğrudan sihirbaz diyaloğu) | Tam ekran: arka planda haritanın yavaş kayan rölyefi (mevcut `ART` Canvas'ı kullanılır), ortada sözcük işareti "FETİH" + tezhip süsü, "Sefere Çık / Devam Et / Yeni Sefer / Günlük Ferman / Miras / Ayarlar"; müzik ilk dokunuşla başlar | P1 | Orta |
| **Hanedan amblemleri / sancaklar** | CK3, Total War, Northgard | 1 em glif; rakipler renkli geometrik işaret | Prosedürel SVG sancak: biçim (kırlangıç kuyruk / üçgen flama / dikdörtgen) × bölme (düz, ikiye, çapraz, şerit) × figür (hanedanın mevcut glifi büyütülmüş) × renk (mevcut `--f0..f5`). Her yerde kullanılır: üst bant, bölge paneli, saldırı, hedef, bitiş, harita başkentleri | P1 | Orta |
| **Tur düğmesi madalyonu + bildirim yığını** | Civ, Humankind, HoMM kum saati | Sarı dikdörtgen "Turu Bitir" | Yuvarlak şemse (Osmanlı kitap kapağı madalyonu) içinde kum saati; altında "Yılı Bitir" ve yıl sayısı; durum: hazır / bekleyen olay (mühür) / boşta birlik. Solunda dikey bildirim yığını (küçük mühürlü mektup simgeleri) | P1 | Düşük-orta |
| **Olay kartı illüstrasyonu** | CK3, Old World | Görsel yok | Olay türüne göre prosedürel minyatür sahne (8-10 sahne şablonu × renk/rastgele tohum): savaş, kıtlık, ticaret kervanı, veba, elçi, isyan, doğa olayı, paralı asker, keşif, şenlik | P1-P2 | Orta-yüksek |
| **Bölge detayı illüstrasyonu (manzara şeridi)** | HoMM kasaba, Civ şehir | Başlık + KPI karoları | Panelin tepesinde 100-120 px manzara şeridi: bölgenin arazisinden (dağ/orman/tarla/nehir/kıyı) haritanın kendi gürültüsüyle üretilmiş 3 katman silüet + yapılar (kale, köy, tarla, maden) tesis seviyesine göre | P2 | Orta |
| **Tam ekran teknoloji ağacı** | Civ, Humankind | Sağ panelde 4×6 kutu; sözcükler kırık | Tam ekran (mobilde tam sayfa) "Bilimler" ağacı: 6 dal satırı × 4 kademe sütunu, bağlantı çizgileri, düğüm = madalyon + ad (bölünmeden, 2 satır), sağda seçili düğüm ayrıntısı. Panelde yalnızca "şu an araştırılan" özeti | P1 (kırık sözcük düzeltmesi) / P2 (tam ekran) | Düşük / Orta |
| **Danışman / uyarı paneli** | Civ danışmanları, CK3 uyarıları | Toast ve panel içi açıklamalar | 3 danışman (Vezir: ekonomi, Serasker: ordu, Kadı/Müneccim: olay ve bilim), her biri prosedürel minik portre-silüet; uyarılar tek cümle | P2 | Orta |
| **Diplomasi / ilişkiler ekranı** | Civ, CK3 | Yalnızca Hedef sekmesinde metin; ateşkes mekaniği var | Rakip başına sancak + kişilik (saldırgan/tüccar/savunmacı/fırsatçı) + ilişki durumu + son olaylar. Yeni mekanik gerektirmez, mevcut veriyi gösterir | P2 | Orta |
| **Vakayiname (tarih günlüğü)** | CK3 karakter geçmişi, Civ zaman çizelgesi | "Kayıt" sekmesinde düz liste + kayıt düğmeleri | Kayıt düğmeleri menüye; sekme "Vakayiname" olur: yıl başlıklı, dönem tonlu cümleler, önemli olaylar süslü baş harfle; bitişte aynı metin oyunun öyküsü olarak gösterilir | P2 | Düşük-orta |
| **Birim silüetleri** | HoMM, Total War birim kartları | Tabloda 1 em glif | Ordu sekmesinde ve saldırı penceresinde birim başına 48-64 px silüet (piyade, okçu, süvari, kuşatma, yeniçeri), prosedürel SVG | P2 | Orta |
| **Yükleme/geçiş ipuçları** | Civ, Total War | Yok (yükleme kısa) | Başlık ekranından oyuna geçişte tek bir dönem cümlesi ("Sınır boylarında beylikler, kılıç ve kervanla büyür.") | P3 | Düşük |
| **Unvan/rütbe amblemleri** | Total War, CK3 unvanları | Bitişte çubuk + metin | Subaşı → Sancakbeyi → Beylerbeyi → … her biri küçük amblem (tuğ sayısı: 1, 2, 3 tuğ gibi; tarihî gönderme, gerçek bir kişinin tuğrası değil) | P2 | Düşük |
| **Harita çerçevesi ve kenar** | Civ, Old World | Lacivert boşlukta dikdörtgen | Harita kenarları denize ve kâğıt kenarına (vignette) erir; harita alanının çevresinde ince tezhip cetveli; mobilde boş şerit kaldırılır | P1 | Düşük |
| **Harita üstü işaretler** | Total War sancakları, Civ şehir bandı | `~10` altıgen ve `~%95` yeşil haplar | Asker sayısı küçük kalkan/sancak içinde; saldırı şansı mühür biçiminde (yalnız seçiliyken); `?` işaretleri sis dokusu ile değiştirilir | P1-P2 | Orta |
| **Ansiklopedi ("Nasıl oynanır" yerine "Kitap")** | Civilopedia | Yardım diyaloğu | Formüller ve ayrıntılar buraya taşınır; ana ekranlar sadeleşir | P3 | Orta |

### 4b. Görsel kimlik yönü: üç seçenek

Ortak kısıtlar: dış dosya yok; tipografi serif; Türkçe glifler (İ ı Ğ ğ Ş ş Ç ç Ö ö Ü ü, â î û) şart; font bütçesi ~60-120 KB; toplam dosya ≤ ~700 KB.

#### Seçenek A: "Saray Haritacısı" (nüsha + tezhip) — **TAVSİYE**

- **Fikir:** Fetih bir saray kütüphanesindeki el yazması sefer defteri. Harita bir minyatürcü haritacının elinden çıkmış; arayüz bu defterin cildi ve sayfaları. Piri Reis haritaları, Matrakçı Nasuh'un menzil minyatürleri, tezhipli kitap kapakları esin kaynağı (taklit değil: ilkeler: şemse, köşebent, cetvel, rumi kıvrım).
- **Palet:**
  - Cilt (koyu çerçeve, üst bant): `#1F1A17` mürekkep-kahve, `#2A211B` deri, `#3A2D22` deri açık.
  - Sayfa (okuma yüzeyleri: bölge paneli, olay, teknoloji): parşömen `#E8DCC0`, gölgeli `#D9C9A6`, kenar `#C4AF86`.
  - Mürekkep (metin): `#231A12` (parşömende kontrast ~13:1), ikincil `#5A4632` (~6,5:1; ölçülmeli).
  - Tezhip altını: `#B8892E` (çizgi), `#D9AE55` (vurgu), lacivert tezhip `#1E3A5F`, lal kırmızısı `#8E2B1F` (tehlike), yeşil `#3F6B3A` (iyi). Mevcut kaynak renkleri doygunluğu ~%20 düşürülerek mürekkep tonuna çekilir.
- **Doku:** parşömen lifi (Canvas'ta açılışta bir kez 256×256 gürültü karosu üretilir → `toDataURL` → CSS değişkeni); deri cilt için ince gren; kağıt kenarlarında hafif yanık (radyal gradyan). Doku opaklığı ≤ %8 (okunabilirlik).
- **Çerçeve/süs dili:** *cetvel* (altın ince + boşluk + kalın çift çizgi: `box-shadow: inset` katmanlarıyla, görsel yok); köşelerde *köşebent* (rumi kıvrımlı çeyrek madalyon, tek SVG yolu, 4 köşeye döndürülür, `border-image` 9 dilim); ana başlıklarda *şemse* (bademsi madalyon) ayırıcı; bölüm ayırıcılarında `❖` yerine küçük rumi SVG. Köşe yarıçapı ≤ 3 px (kitap sayfası düz köşe) ya da kesik köşe.
- **Tipografi çifti:** Başlık/sözcük işareti/düğme: **Alegreya SC** (küçük büyük harfli, kaligrafik kökenli; OFL; `latin-ext`). Gövde ve sayılar: **Alegreya** değişken (`wght` 400-900; OFL; `latin-ext`; kitap metni için tasarlanmış, düşük boyutta okunur). Aynı aileden gelmeleri uyumu garanti eder; sayılar `font-variant-numeric: lining-nums tabular-nums` ile hizalı.
- **İkon/amblem dili:** Mevcut 95 glif korunur ama iki sınıfa ayrılır: (1) kaynak ikonları mürekkep renginde, küçük; (2) "nesne" ikonları (teknoloji, birim, bina, olay) altın kenarlı madalyon içinde. Sancaklar ve unvan amblemleri prosedürel SVG.
- **Harita-arayüz uyumu:** Harita zaten sıcak toprak paleti; parşömen ve deri aynı sıcaklıkta, bu yüzden kopukluk ortadan kalkar. Harita kenarına kağıt kenarı ve deniz için hafif dalga tarama çizgileri eklenir (eski harita deniz taraması). Etiketler Alegreya SC, mürekkep rengi, açık hale ile.
- **Ses/his:** kağıt hışırtısı, mühür basma, tahta tok, ney/saz çekme, davul (kös), zurna (mehter). Panel açılışı = sayfa çevirme; olay = mühür kırılıp ferman açılır.
- **Neden tavsiye:** (1) Haritanın mevcut sıcak rölyefiyle tek bir dünya oluşturan tek yön. (2) Türk dönem kimliğini (beylik, sancak, akçe, yeniçeri) taşıyan, jenerik Avrupa fantastiğinden ayrışan bir dil: ayırt edicilik "yapay" algısının panzehiri. (3) Süslerin hepsi çizgi ve geometri: prosedürel SVG/CSS ile ucuz üretilir (rumi ve şemse matematiksel olarak simetrik). (4) Parşömen üstünde koyu mürekkep, bugünkü koyu temadan **daha yüksek** kontrast verir. (5) Serif isteğiyle doğal olarak uyuşur.
- **Riskler:** açık parşömen panelin geniş alanı göz yorabilir → yalnız okuma yüzeyleri parşömen, çerçeve ve HUD koyu cilt. "Kitsch" tehlikesi → süs yalnız köşelerde ve başlıklarda, gövde metninde asla.

#### Seçenek B: "Sefer Çadırı" (deri + dövme demir + keçe)

- **Fikir:** Arayüz bir ordugâh çadırındaki sefer masası: koyu deri, perçinli demir köşebentler, keçe zemin, balmumu mühür.
- **Palet:** deri `#3A2618`, koyu keçe `#241C17`, demir `#4A4F55` / `#7C838A`, pirinç `#C08A3E`, kumaş kırmızısı `#7A1F1A`, kemik beyazı metin `#EDE3CF`.
- **Doku:** deri gren + dikiş çizgisi (kesik çizgi kenar), metal fırça izi (doğrusal gürültü).
- **Çerçeve:** pirinç perçinli köşebentler, dikişli kenarlar; düğmeler metal plaka.
- **Tipografi:** **Cinzel** (başlık; Roma büyük harfi; OFL, `latin-ext`, `wght` 400-900; Türkçe `ı` küçük büyük harf biçiminde: alt kümede doğrulanmalı) + **Spectral** ya da **Alegreya** (gövde).
- **İkon/amblem:** dövme demir siluetler, kalkan biçimli armalar.
- **Harita uyumu:** iyi (koyu sıcak çerçeve), ama harita açık tonlu olduğundan çerçeve çok ağır görünebilir.
- **Ses:** demir şıngırtısı, deri gerilmesi, kös davul, boru.
- **Artı/eksi:** Total War/CK3 hissine en yakın; ama koyu temada kalır, okunabilirlik bugünküyle aynı; jenerik "ortaçağ fantastik" kalıbına kayma riski yüksek (Avrupa ortaçağı görünür, Türk kimliği zayıf).

#### Seçenek C: "Nakkaşhane" (düz pigment minyatür)

- **Fikir:** Osmanlı minyatürünün düz renk alanları, perspektifsiz düzlemleri, altın zemini. Arayüz ve illüstrasyonlar aynı düz pigment dilinde; gölge yok, desen var.
- **Palet:** lapis `#23408E`, zencefre (cinnabar) `#B83A2A`, malakit `#2E7D5B`, aşı boyası `#D9A441`, fildişi `#F3E9D2`, is siyahı `#1A1714`, altın varak `#C9A24A`.
- **Doku:** neredeyse yok; yerine desen (çintemani, bulut motifi, hatayi) düz renkle, düşük kontrastta.
- **Çerçeve:** renkli bordür şeritleri (minyatür sayfa kenar bandı), altın cetvel.
- **Tipografi:** **EB Garamond** (gövde) + **Alegreya SC** ya da **Cormorant SC** (başlık; Cormorant ince olduğu için yalnız 24 px üstünde).
- **İkon/amblem:** düz şekilli figürler; prosedürel illüstrasyon en kolay bu dilde (düz poligonlar).
- **Harita uyumu:** **zayıf**: mevcut harita gölgeli 3D rölyef; minyatür düzlüğüyle çelişir. Ya harita yeniden stilize edilmeli (yüksek maliyet) ya da çelişki kabul edilmeli.
- **Ses:** ney, kanun, def.
- **Artı/eksi:** En ayırt edici ve en "sanatsal" seçenek; illüstrasyonları en ucuz yön. Ama haritayla uyumsuz ve renkli paleti bilgi kodlamasıyla (sahiplik renkleri) çakışabilir.

**Tavsiye:** **A (Saray Haritacısı)**; illüstrasyonlarda (olay sahneleri, manzara şeridi) C'nin düz pigment tekniği "alt dil" olarak kullanılır (prosedürel üretim kolaylığı için). Böylece A'nın haritayla uyumu + C'nin ucuz illüstrasyonu birleşir.

#### Font üretim yolu (dış varlık yok kuralına uygun)

| Rol | Font | Lisans | Kaynak | Not |
|---|---|---|---|---|
| Gövde + sayılar | Alegreya (değişken, `wght` 400-900) | OFL 1.1 | `github.com/google/fonts/tree/main/ofl/alegreya` → `Alegreya[wght].ttf` | `latin-ext` alt kümesi Türkçeyi kapsar; `lnum`, `tnum`, `smcp`, `locl` özellikleri korunmalı |
| Başlık / sözcük işareti / düğme | Alegreya SC Bold (700) (gerekirse Medium 500) | OFL 1.1 | `.../ofl/alegreyasc/AlegreyaSC-Bold.ttf` | Küçük büyük harf: Türkçe `i`→`İ` için `lang="tr"` (zaten var) + `locl` |
| İtalik (isteğe bağlı) | Alegreya Italic (değişken) | OFL 1.1 | `.../ofl/alegreya/Alegreya-Italic[wght].ttf` | Olay anlatı metni ve alıntılar; bütçe yetmezse tarayıcı eğik yazısına bırakılır (sentetik italik çirkin; tercih edilmez) |

Alt küme üretimi (bu makinede `fonttools` kurulu değil; önce `pip install fonttools brotli`):

```bash
U="U+0020-007E,U+00A0-00FF,U+0100-017F,U+0131,U+0130,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,U+2032,U+2033,U+2190-2193,U+2212,U+2116"
pyftsubset "Alegreya[wght].ttf" --unicodes="$U" \
  --layout-features="kern,liga,clig,lnum,tnum,pnum,onum,smcp,c2sc,case,locl,mark,mkmk" \
  --flavor=woff2 --output-file=alegreya-tr.woff2
pyftsubset "AlegreyaSC-Bold.ttf" --unicodes="$U" --layout-features="kern,liga,lnum,tnum,locl,case" \
  --flavor=woff2 --output-file=alegreyasc-b-tr.woff2
base64 -i alegreya-tr.woff2 | tr -d '\n' > alegreya.b64   # @font-face src:url(data:font/woff2;base64,...)
```

- `U+0100-017F` (Latin Extended-A) bütününü almak İ/ı/Ğ/ğ/Ş/ş'yi kesin kapsar; daha da küçültmek için yalnız `U+011E,U+011F,U+0130,U+0131,U+015E,U+015F` alınabilir (yaklaşık 100 glif tasarruf).
- `→ × −` gibi arayüzde kullanılan simgeler fontta yoksa sistem fontuna düşer; kullanılan simgeler `grep` ile listelenip ya kümeye eklenmeli ya da SVG ikona çevrilmeli.
- **Bütçe tahmini (ölçülmedi, alt küme üretildikten sonra ölçülecek):** değişken Alegreya alt kümesi woff2 ~45-60 KB, Alegreya SC Bold ~20-25 KB; base64 ile ×1,33 → toplam **~90-115 KB**. İtalik eklenirse +~55-75 KB; bu durumda bütçe aşılır, ilk aşamada italik yok.
- OFL gereği lisans metni ve telif satırı HTML içinde yorum olarak bulunmalı; font adı değiştirilmeden kullanılabilir (Reserved Font Name yalnız değiştirilmiş türevlerde sorun).
- `font-display: block` yerine `swap` + aynı metriklere yakın yedek (`Georgia`) ile ilk boyamada kayma azaltılır; base64 gömülü olduğundan gecikme zaten düşük.
- **Başka ajanın çalışmasıyla ilişki:** Şu an fontları serife çeviren çalışma (muhtemelen sistem serif yığını) bu planın ilk adımıyla uyumlu; gömülü Alegreya'ya geçiş yalnızca `--font-*` değişkenlerinin değerini değiştirir.

#### Diğer prosedürel üretim yolları

| Varlık | Teknik | Boyut | Not |
|---|---|---|---|
| Parşömen/deri dokusu | Açılışta Canvas 256×256 değer gürültüsü (mevcut harita gürültü işlevi yeniden kullanılır) → `toDataURL('image/webp')` → `--tex-parch`, `--tex-cilt` | ~1 KB kod | Canlı `feTurbulence` CSS'te kullanılmaz (her boyamada pahalı) |
| Cetvel çerçeve | `box-shadow: inset 0 0 0 1px altın, inset 0 0 0 4px zemin, inset 0 0 0 5px altın-koyu` | 0 | Sıfır görsel |
| Köşebent süsü | Tek SVG yol (rumi çeyrek), `border-image` 9 dilim veya 4 adet `::before/::after` döndürme | ~1,5 KB | Panel, olay, modal köşeleri |
| Şemse madalyon | SVG: badem biçimi + 8/16 dilimli rozet + iç kum saati ikonu | ~1 KB | Tur düğmesi, başlık ayırıcı |
| Sancak/arma | `banner(seed, dyn)` işlevi: biçim × bölme × figür × 2 renk → SVG dizgisi | ~3 KB kod | Önbelleğe alınır |
| Olay sahnesi | Katmanlı düz poligonlar: gökyüzü bandı + 2-3 tepe silüeti + sahne nesneleri (çadır, at, kervan, kale, ev, bayrak, ateş) + figür siluetleri; tohum ile yerleşim | ~10-15 KB kod | 8-10 sahne şablonu |
| Bölge manzara şeridi | Bölgenin arazi türü + tesisleri → Canvas 3 katman silüet, haritanın renk paleti | ~4 KB kod | Bölge seçiminde bir kez çizilir, önbelleğe alınır |
| Kağıt kenarı/vignette | Harita Canvas'ının son katmanı: radyal gradyan + düzensiz kenar maskesi | ~1 KB | |

### 4c. Ekran ekran yeniden tasarım şartnamesi (A yönü)

#### 1) Başlık ekranı / ana menü (yeni)

```
1440×880
┌──────────────────────────────────────────────────────────────────────┐
│░░ harita rölyefi (ART canvas), çok yavaş kayma, %35 karartma + vignette░│
│░░                                                                    ░│
│░░                      ╭──── rumi ────╮                               ░│
│░░                         F E T İ H          (Alegreya SC 72, altın)  ░│
│░░                      ╰──── rumi ────╯                               ░│
│░░               Bir uç beyliğinden cihana                (italik 18)  ░│
│░░                                                                    ░│
│░░                  ┌──────────────────────────┐                      ░│
│░░                  │ ⟡  SEFERE ÇIK            │ (şemse kenarlı plaka) ░│
│░░                  └──────────────────────────┘                      ░│
│░░                  Devam et — Börü Hanlığı, Yıl 23                   ░│
│░░                  Yeni sefer · Günlük ferman · Miras · Ayarlar      ░│
│░░                                                                    ░│
│░░ v0.9.2                                          ♪ müzik   🔈 ses    ░│
└──────────────────────────────────────────────────────────────────────┘
```
- **Bileşenler:** arka plan harita (mevcut `ART` ile; yeni oyunda rastgele tohumlu tanıtım haritası), sözcük işareti (Alegreya SC + iki yanda rumi kıvrım SVG), alt başlık, birincil plaka düğme, metin bağlantıları, sürüm ve ses düğmeleri.
- **Doku/süs:** sözcük işaretinin altında şemse ayırıcı; düğme = deri plaka + altın cetvel; vignette.
- **Metin tonu:** `⚡ Hızlı Başla` → **Sefere Çık**; `Seferi kendim hazırlayayım →` → **Seferi kendin düzenle**; `Tek bir bölgeden başla: kaynak topla, ordunu büyüt, rakip devletleri fethet.` → **Bir uç beyliğinden cihana.**
- **His/ses:** ilk dokunuşta müzik (ney/saz girişi) başlar; düğme üzerine gelince altın cetvel parlar (ses yok); tıklayınca davul vuruşu + sayfa çevirme ile sihirbaza geçiş.
- **Mobil:** aynı katmanlar dikey; sözcük işareti 44 px; düğmeler tam genişlik −32 px; menü bağlantıları alt alta (≥44 px).

#### 2) Oyun içi HUD + harita

```
1440×880
┌─[sancak] BÖRÜ HANLIĞI  Yıl 5 ┃ 🌾85 +7  🪵50  ▦40  ⚒38 +2  ◉122 +1  📖17 +3 ┃ 👥67/96  🔥82  🛡25 ┃ ⚔ Fetih 1/56 ┃ ♪ ⚙─┐
│ (koyu cilt bandı, alt kenarında altın cetvel; kutu yok, değerler arasında küçük rumi ayraç)                            │
├───────────────────────────────────────────────────────────────────────┬───────────────────────────────────────────┤
│ ┌ cetvel ─────────────────────────────────────────────────────────┐ │ ╔ köşebent ════════════════════════════╗ │
│ │ harita: kenarlar kâğıda ve denize erir                            │ │ ║ [manzara şeridi 100 px]               ║ │
│ │   bölge adları Alegreya SC, mürekkep, açık hale                  │ │ ║ SARIGÖL ★        (sancak)             ║ │
│ │   asker = küçük kalkan [17]; başkent = kale + sancak             │ │ ║ Nehir vadisi · Beyliğin               ║ │
│ │   saldırı şansı yalnız seçiliyken, mühür biçiminde               │ │ ║ "Verimli topraklar" (tezhipli satır) ║ │
│ │                                                         [+][−]   │ │ ║ Asker ........... 17 (hazır 17)       ║ │
│ │                                                         [⌖]      │ │ ║ Nüfus ........... 62 / 96  +3,1       ║ │
│ │                                                                  │ │ ║ Sur ............. 1   savunma ×1,23   ║ │
│ │                                    ✉ ✉ ✉   (bildirim yığını)     │ │ ║ ─ Tesisler ─ Asker ─ Savunma ─        ║ │
│ │                                    ╭─────╮                       │ │ ║ ...                                   ║ │
│ │                                    │ ⌛  │  ŞEMSE: "Yılı Bitir"   │ │ ╚══════════════════════════════════════╝ │
│ └──────────────────────────────────── ╰─────╯ ─────────────────────┘ │ [Bölge][Hazine][Ordu][Zafer][Bilim][Vakayiname] (ayraç kurdeleleri) │
└───────────────────────────────────────────────────────────────────────┴───────────────────────────────────────────┘
```
- **Bileşenler:** cilt bandı (üst), harita çerçevesi (cetvel), şemse tur düğmesi (harita sağ altında, panelin değil haritanın parçası), bildirim yığını (mühürlü mektup simgeleri, tıklanınca ilgili bölge/olay), sağda "defter" paneli, sekmeler kitap ayracı kurdelesi.
- **Doku/süs:** bant deri dokusu %6; panel parşömen dokusu %5; harita kenarında kâğıt kenarı; panel köşelerinde köşebent; yuvarlak köşe yok.
- **Kaldırılacak:** üst çubuktaki kutular ve renkli sol kenarlar; panel içindeki KPI karoları; kalıcı ipucu şeridi (`Sol tık: seç …`, yalnız ilk 3 turda gösterilip kaybolur, sonra `?` düğmesinde); harita üstü yeşil/kırmızı haplar (seçim dışı).
- **Metin tonu:** sekmeler `Bölge / Ekonomi / Ordu / Hedef / Teknoloji / Kayıt` → **Bölge / Hazine / Ordu / Zafer / Bilim / Vakayiname**; `Turu Bitir` → **Yılı Bitir** (oyunda tur = yıl); `Olayı Çöz` → **Fermanı oku**.
- **Mobil:** cilt bandı 48 px, yatay kaydırmalı şerit aynen (kutusuz); harita tam ekran, üstteki boş şerit kaldırılır; şemse sağ altta 64 px; alt çekmece parşömen sayfa, tutamaç yerine sayfa kenarı kıvrımı; sekmeler çekmecenin tepesinde ayraç kurdeleleri (≥44 px).

#### 3) Bölge paneli (defter sayfası)

```
╔═ köşebent ═══════════════════════════════════╗
║ ░░░ manzara şeridi: nehir vadisi, kale, tarla ░░░║  (100 px, Canvas, haritanın renkleri)
║ [sancak] SARIGÖL ★                              ║  Alegreya SC 26
║ Nehir vadisi · Börü Hanlığı'nın başkenti       ║  italik 14
║ ── ❖ ──                                         ║
║ ❦ Verimli topraklar: tarla ve pazar 1,5 kat     ║  tezhipli tek satır; ayrıntı ipucunda
║   üretir.                                       ║
║ Asker ............................. 17  hazır   ║  noktalı defter satırları,
║ Nüfus ......................... 62 / 96  +3,1   ║  sayılar sağa hizalı, tabular
║ Sur ................................ 1   ×1,23   ║
║ ─ TESİSLER (1/5) ─────────────────────────────  ║
║ [tarla silüeti] Tarla      ●○○○○   +7,2 tahıl   ║
║                 [ Geliştir — 30 🌾 6 🪵 ]        ║  plaka düğme
║ ─ YENİ TESİS ─                                  ║
║ [orman] Kereste ormanı  +2,4 odun  [ Kur — 30 🌾 6 ◉ ]║
╚═════════════════════════════════════════════════╝
```
- **Bileşenler:** manzara şeridi, sancaklı başlık, özellik satırı, defter satırları (noktalı çizgi önderli), tesis satırları (silüet + seviye boncukları + plaka düğme), alt sekmeler (Genel/Tesisler/Asker/Savunma) ayraç olarak.
- **Metin tonu:** `Tesisler ağırlıkla tahılla kurulur ve geliştirilir. Üretim bölgenin işgücüne bağlıdır (şu an %100). Azami seviye Sv.1.` → **İşgücü tam. Tesisler en çok 1. seviyeye çıkabilir.** (ayrıntı ipucuna); `Geliştirilebilir tesis yok. Yeni tesis kurmak için …` → **Defterde bekleyen iş yok.**
- **Mobil:** çekmecede aynı sayfa; manzara şeridi 72 px; defter satırları tek sütun.

#### 4) Bilimler (teknoloji) ekranı

```
Tam ekran (masaüstü), tam sayfa (mobil)
╔══ BİLİMLER ═════ Bilgi 17 (+3/yıl) ═══════════════════════════════════════ [×] ╗
║            I. KADEME       II. KADEME        III. KADEME       IV. KADEME        ║
║ ⚔ Saldırı  (◉)Demircilik ─ (◯)Çelik Dövme ─ (◯)Ağır Süvari ─ (◯)Barut           ║
║ 🛡 Savunma  (◉)Okçuluk ──── (◯)Taş İşçiliği ─ (◯)Hendekler ─── (◯)Burçlar         ║
║ ⚙ Kuşatma  (◉)Koçbaşı ──── (◯)Kuşatma Kul. ─ (◯)Mancınık ──── (◯)Topçu           ║
║ 🌾 İkmal    (◉)Sulama ───── (◯)Loncalar ───── (◯)Lojistik ──── (◯)Ticaret Yolları  ║
║ ⚑ Üretim   (◉)Talim Usulü ─ (◯)Sefer Düzeni ─ (◯)Tımar Sistemi ─ (◯)Harbiye Nizamı ║
║ 👁 Strateji (◉)Haritacılık ─ (◯)Casusluk ──── (◯)Yol Ağı ────── (◯)Askeri Disiplin ║
╟──────────────────────────────────────────────────────────────────────────────────╢
║ [madalyon] DEMİRCİLİK — 15 bilgi                                                  ║
║ "Ocakta dövülen demir, sınırda kılıç olur."   Etkisi: saldırı +%10      [ Araştır ]║
╚══════════════════════════════════════════════════════════════════════════════════╝
```
- **Bileşenler:** dal satırları (sol: dal ikonu + ad), düğümler (48 px madalyon: açık = altın dolu, araştırılabilir = altın kenar + parıltı, kilitli = mürekkep çizgi), bağlantı çizgileri (cetvel), alt ayrıntı şeridi (alıntı + etki + düğme).
- **Zorunlu düzeltme (Aşama 1):** `.node{overflow-wrap:anywhere}` kaldırılır → `overflow-wrap:normal; hyphens:manual`; uzun adlar için `&shy;` ya da kısaltma ("Kuşatma Kul." yerine iki satır "Kuşatma / Kuleleri"); kabul: hiçbir düğümde sözcük içi bölünme yok.
- **Metin tonu:** `Her dalda bir kademeyi açınca sonraki aktif olur. Ayrıntı için tıkla.` → **Her dalda bilgi sırayla açılır.** Her düğüme 1 satırlık dönem cümlesi (yeni metin; 24 adet).
- **Panelde kalan:** yalnız "Şu an: Demircilik (2 yıl)" ve "Bilimler'i aç" düğmesi.
- **Mobil:** tam sayfa; satırlar yatay kaydırma yerine dal başına dikey liste (4 düğüm yan yana 72 px), ayrıntı alt sayfa.

#### 5) Olay kartı (ferman)

```
        ╔═ köşebent ════════════════════════════════╗
        ║ ░░░░░░ minyatür sahne: tepeler, 8 atlı,  ░░║  (16:9, 520×240, düz pigment)
        ║ ░░░░░░ sancak, kuşluk vakti göğü         ░░║
        ║ ─────────────── ❖ ───────────────          ║
        ║ PARALI BÖLÜK                    (mühür)  ║  Alegreya SC 26 + kırmızı balmumu mühür (tür)
        ║ Yıl 5 · Sarıgöl                            ║
        ║ Sınır boyunda sekiz atlı bekliyor. Başları ║  italik/normal gövde 16, ≤ 35 sözcük
        ║ kılıcını en çok ödeyene satar.             ║
        ║ ┌────────────────────────────────────────┐║
        ║ │ I  Kirala                               │║  seçenek = defter satırı
        ║ │    60 altın peşin; 12 yıl boyunca 3/yıl │║  sonuç satırı küçük büyük harf, ikonlu
        ║ └────────────────────────────────────────┘║
        ║ ┌────────────────────────────────────────┐║
        ║ │ II Geri çevir                           │║
        ║ │    "Başka kapıya gitsinler."            │║
        ║ └────────────────────────────────────────┘║
        ╚═══════════════════════════════════════════╝
```
- **Bileşenler:** sahne (prosedürel), başlık, tür mührü (iyi = yeşil balmumu, kötü = lal, ikilem = altın), yıl ve yer satırı, anlatı, 2-4 seçenek (Roma rakamı, ad, sonuç satırı).
- **Kural:** anlatı cümlesinde `×`, `→`, `%` yok; sayılar yalnız sonuç satırında.
- **Metin tonu:** `8 atlıdan oluşan bir paralı bölük kılıcını satıyor.` → **Sınır boyunda sekiz atlı bekliyor. Başları kılıcını en çok ödeyene satar.**; `Bölük başka kapıya gider` → **"Başka kapıya gitsinler."**; `Klavye: 1 / 2 · Seçmeden yıl bitmez.` → yalnız klavyeli cihazda seçenek numarası görünür; alt not kaldırılır.
- **His:** açılırken ferman yukarıdan açılır (scaleY 0→1, 240 ms) + kağıt sesi; seçim yapılınca mühür basma animasyonu + davul.
- **Mobil:** alt sayfa değil tam ekran kart; sahne 16:9 tam genişlik; seçenekler ≥56 px.

#### 6) Oyun sonu (vakayiname kapanışı)

```
╔═ köşebent ══════════════════════════════════════════════════════════════════╗
║ [harita: fetih sırasının hızlı tekrarı, sahiplik renkleri mürekkep gibi yayılır] ║
║                                                                               ║
║        ── ❖ ──  HÜKÜMDARLIK KURULDU  ── ❖ ──          (Alegreya SC 40, altın)  ║
║                     Fetih Zaferi                                              ║
║  [sancak] Börü Hanlığı, 34 yılda Kızıl Tunçlar'ı Yıldızbük'te, Mavi Börüler'i  ║
║  Kartalçay'da dize getirdi. Son kabile Yıl 34'te tacına boyun eğdi.          ║
║                                                                               ║
║  ŞAN 2.060          UNVAN: [1 tuğ] SUBAŞI  →  Sancakbeyi için 440 şan          ║
║  Fethedilen 55 · Kazanılan savaş 41 · Kaybedilen 6 · En büyük ordu 212        ║
║  MİRAS +12 · Sıradaki: Demir Kıtlığı (20 MP)                                  ║
║                                                                               ║
║  [ Yeni sefer ]   [ Aynı kurallar ]   [ Günlük ferman ]    Vakayiname · Paylaş  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```
- **Bileşenler:** harita tekrar oynatımı (mevcut sahiplik dalgası efekti), başlık, 2-3 cümlelik prosedürel öykü (oyun istatistiklerinden: ilk büyük zafer, en uzun savaş, son fethedilen), şan ve unvan amblemi, istatistik defteri, düğmeler.
- **Metin tonu:** `SKOR` → **Şan**; `Miras yok: oyun 15. yıldan önce bitti.` → **Sefer kısa sürdü; miras için en az 15 yıl hüküm sürmek gerekir.**; `Sonucu kopyala` → **Paylaş**; `Önerilenle yeni oyun` → **Yeni sefer** (önerilen ayar altında küçük yazı).
- **Mobil:** harita üstte 16:9, öykü ve defter altta, düğmeler alt alta.

> Not: yukarıdaki yerleşimlerdeki yer adları, sayılar ve öykü cümleleri örnektir; gerçek değerler oyun durumundan üretilir.

### 4d. Dil, ses ve his

**Metin sesi (ilkeler):**
1. **Ciddi, dönem tonlu, kısa.** Cümle başına ≤ 20 sözcük; olay anlatısı ≤ 35 sözcük.
2. **Önce dünya, sonra sayı.** Anlatı cümlesinde formül yok; sayılar sonuç satırında ya da ipucunda.
3. **Hafif dönem sözlüğü** (anlaşılırlığı bozmadan): yıl, sefer, ferman, akçe, hazine, sancak, beylik, vakayiname, şan, unvan. Ağır Osmanlıca yok (*"Hazine-i Âmire"* gibi).
4. **Ekran dışı açıklama yok.** "… için … sekmesine git" tipi yönlendirmeler yerine doğrudan bağlantılı eylem ("Tesis kur ›").
5. **Parantez ve " · " azaltılır.** Hedef: görünür metinde " · " sayısı ekran başına ≤ 3.

| Eski (bugün) | Yeni (önerilen) |
|---|---|
| Hızlı Başla | Sefere Çık |
| Turu Bitir | Yılı Bitir |
| Kuruluşu Tamamla / Önerilenle başla | Beyliği Kur / Vezirin önerisiyle kur |
| Başkentin Sarıgöl… Sana 180 akçelik kuruluş hazinesi verildi. Bununla başkentine kaynak tesisi satın al. Rakipler 12. yıla kadar sana saldırmaz. | Sarıgöl senin. Hazinede 180 akçe var; ilk tesislerini kur. Komşular 12. yıla dek kılıç çekmez. |
| Kazanma şansı (tahmini) ~%95 · Güçlü | Ezici üstünlük (~%95) |
| Saldır! / Vazgeç | Hücum! / Geri dur |
| Kalan 55 bölge: kabile 51 · Kızıl Tunçlar 1 … | Boyun eğmeyen 55 bölge kaldı. |
| Erken Savaş · Kötü · miras ×1,05 · Barış dönemi 12 → 5 yıl. | **Erken Savaş.** Komşular 5. yıldan sonra saldırabilir. (sonuç satırı: miras ×1,05) |
| Yıl 1 Kuruluş tamamlandı: Tarla. Kalan 80 akçe hazineye aktarıldı. | Yıl 1. Sarıgöl'de ilk tarla sürüldü; hazinede 80 akçe kaldı. |
| SKOR | Şan |
| Seri 0 gün · Mühür 0/2 | Kesintisiz 0 gün · Mühürler 0/2 |

**Tipografi hiyerarşisi (5 seviye, hepsi Alegreya ailesi):**

| Seviye | Kullanım | Font | Boyut (masaüstü / mobil) | Not |
|---|---|---|---|---|
| D1 | Sözcük işareti, bitiş başlığı | Alegreya SC 700 | 56-72 / 40 | harf aralığı .08em, altın |
| D2 | Ekran başlığı (Bilimler, Ferman başlığı, bölge adı) | Alegreya SC 700 | 26 / 24 | |
| H3 | Bölüm başlığı (Tesisler, Birlikler) | Alegreya SC 500 | 16 / 16 | büyük harf yerine küçük büyük harf; gri değil mürekkep-ikincil |
| Gövde | Paneller, açıklamalar | Alegreya 400 | 15 / 16 | satır yüksekliği 1,45; **12-13 px'lik `--t-xs/--t-micro` gövde metninde kullanılmaz** (serif küçük boyutta zayıf) |
| Sayı | Kaynaklar, istatistikler | Alegreya 600 | 15-18 | `font-variant-numeric: lining-nums tabular-nums` (Alegreya'nın varsayılan rakamları eski stil; HUD'da hizalama için lining şart) |
| Anlatı | Olay metni, alıntı | Alegreya Italic (bütçe yoksa 400 normal) | 16 | |

**Hover / tık / geri bildirim:**
- Hover: renk değişimi yerine **altın cetvelin parlaması** ve ikonun hafif aydınlanması; yukarı kalkma (translateY) yok; hover sesi yok.
- Tık: 60 ms içinde basılma (düğme 1 px içe gömülür, iç gölge koyulaşır) + tahta "tok".
- Onay gerektiren eylemler (saldırı, tesis, araştırma): mühür basma (ölçek 1,15→1, 160 ms) + davul.
- Kaynak kazanımı: sayı akışı (zaten var) + akçe şıngırtısı; kayıp: kısa düşük davul.
- Olumsuz geri bildirim: kırmızı titreşim yerine lal mürekkep lekesi ve "mühür kırık" ikonu.

**Ses paleti (mevcut WebAudio sentezinin dönüşümü, örnek dosya yok):**

| Olay | Bugün | Önerilen sentez |
|---|---|---|
| UI tık (`ui-tik`) | 1800→1200 Hz üçgen + 4 kHz gürültü | **Tahta tok:** bant geçiren gürültü 900-1400 Hz, 25 ms, hızlı sönüm + 180 Hz sinüs gövde 40 ms |
| Hover (`ui-hover`) | 2400 Hz bip | **Kaldır** (ya da çok kısa 4-6 kHz kâğıt hışırtısı, -30 dB) |
| Panel aç/kapa | gürültü süpürmesi | **Sayfa çevirme:** gürültü 1,5-5 kHz, genlik titreşimli (20-30 Hz AM) 180 ms |
| Onay (`ui-onay`) | 660/990 Hz üçgen ikilisi | **Saz/bağlama çekme:** Karplus-Strong (gürültü patlaması → `DelayNode` + geri besleme + alçak geçiren), perde Hicaz/Uşşak dizisinden |
| Hata (`ui-hata`) | 180 Hz kare dalga | **Boğuk davul + mızrap susturma** (düşük sinüs 90→60 Hz + kısa gürültü) |
| Saldırı başla (`saldiri-basla`) | `horn` | **Zurna/boru:** testere dişi → bant geçiren 900-1800 Hz + 5,5 Hz vibrato LFO + hafif distorsiyon (`WaveShaper`); mehter havası 2 nota |
| Tur bitişi | — | **Kös:** 2 vuruş (sinüs 70→45 Hz + gürültü) + zil (yüksek inharmonik kısmîler, 1,2 s sönüm) |
| Müzik | Re Dorian / Hicaz üretken (varsayılan kapalı) | Aynı yapı korunur; enstrüman sesleri Karplus-Strong saz + ney (sinüs + nefes gürültüsü + yavaş vibrato) + def/davul; ana menüde müzik varsayılan **açık** (kullanıcı ilk dokunuştan sonra) |

**Geçiş ve animasyon dili:**
- Modal yerine nesne: ferman = yukarıdan açılır (scaleY), kitap (Bilimler) = sayfa yana döner (rotateY 8°→0 + opaklık), savaş raporu = iki sancak yanlardan gelir.
- `--ease-back` (taşan sıçrama) kaldırılır; yerine `--ease-out` ve doğal sönüm. Süreler 160-280 ms.
- Harita: sahiplik değişimi mürekkep yayılması (mevcut dalga efektinin rengi mürekkep dokusuyla), savaş sonrası kısa toz bulutu.
- Azaltılmış hareket: hepsi 120 ms opaklığa iner (mevcut altyapı korunur).

### 4e. "Yapma" listesi (yapay görünümü geri getiren hatalar)

1. **Kart içinde kart** yapma. Bir yüzey, içinde satırlar; ikinci kutu yalnız gerçekten ayrı bir nesne için (olay seçeneği, tesis).
2. **Etiket üstte küçük, değer altta büyük KPI karosu** kullanma.
3. **Her değeri kutulama** (üst bant çipleri). Bant + ayraç yeterli.
4. **Gri BÜYÜK HARF + geniş harf aralığı bölüm etiketi** kullanma; küçük büyük harf serif ve mürekkep rengi kullan.
5. **10-14 px yuvarlak köşe** kullanma; kitap sayfası düz ya da kesik köşelidir.
6. **"İç üst 1 px beyaz çizgi + yumuşak aşağı gölge"** (Apple/shadcn yükselti) kullanma; derinlik dokuyla, cetvelle ve gömme gölgeyle verilir.
7. **Tam genişlik sarı dolu CTA şeridi** kullanma; birincil eylem plaka ya da madalyondur.
8. **Doku yoğunluğunu artırma:** %8'i geçen doku "Photoshop filtresi" ucuzluğu verir; gövde metninin altında doku ≤ %5.
9. **Süsü her yere koyma:** köşebent yalnız ana yüzeylerde (panel, ferman, bitiş, Bilimler); düğmelerde ve satırlarda süs yok. Aşırı süs "yapay zekâ fantastik" klişesidir.
10. **Formülü anlatı metnine koyma** (`×1,2 (1,7→2,04)`). Formül ipucuna, sayı sonuç satırına.
11. **Emoji kullanma** (kaynakta ~110 farklı emoji kaldı; görünür olanlar ikon ya da metin olmalı: `🔓 Aç` → kilit ikonu + "Aç").
12. **Yeşil/kırmızı'yı tek bilgi taşıyıcısı yapma;** her zaman ikon/biçim eşliği (renk körü uyumu; sancak biçimleri bunu doğal sağlar).
13. **Jenerik Avrupa ortaçağ fantastiği** (ejderha, Gotik yazı, kalkan-kılıç klişesi, "Ye Olde" dil) kullanma; kimlik Türk-İslam kitap sanatından ve beylik döneminden gelmeli.
14. **Yapay "eski" Türkçe** (uydurma Osmanlıca, yanlış şapka) yazma; doğru ve yaşayan Türkçe, birkaç dönem sözcüğüyle.
15. **Sentetik italik/kalın** üretme (font dosyası olmayan ağırlık). Ya ağırlığı göm ya kullanma.
16. **Her ekranı aynı ortalanmış modal** yapma; ekran türüne göre nesne seç.
17. **Hover'da bip, yukarı kalkma, parıltı halkası** kullanma.
18. **Açıklama paragrafını panelin en üstüne** koyma ("Tesisler ağırlıkla tahılla kurulur…"); ilk satır her zaman durumu söyler.
19. **Simetri takıntısı:** eşit sütunlu kart ızgaraları yerine birincil öğe büyük, ikincil öğeler küçük (asimetrik hiyerarşi).
20. **Gerçek tarihî kişileri, gerçek tuğraları, gerçek devlet armalarını** taklit etme; ilke al, kopyalama.

## 5. Uygulama planı

Genel kurallar: her aşama tek başına yayınlanabilir; oyun mantığı (`economy`, `endTurn`, AI, kayıt şeması, `SAVE_VER`) değişmez; `tests/` simülasyonu ve taban çizgisi aynen geçer; mevcut erişilebilirlik kipleri (yüksek kontrast, renk körü, yazı ölçeği, azaltılmış hareket) her aşamada çalışır. Bugünkü boyut 429 KB; hedef ≤ ~700 KB.

### Aşama 1: Kimlik temeli (malzeme + tipografi + kırık şeyler) — en yüksek etki / maliyet oranı

- **CSS:** `:root` token'ları A paletine (cilt/parşömen/mürekkep/altın/lal); `--rad-*` → 0-3 px; `--e-1..3` → gömme gölge + cetvel; `--font-*` → gömülü Alegreya/Alegreya SC (`@font-face` base64); tipografi ölçeği 4d tablosuna; `.node{overflow-wrap:anywhere}` düzeltmesi; doku değişkenleri (`--tex-parch`, `--tex-cilt`, açılışta Canvas ile).
- **DOM/JS:** `renderHeader` çip kutuları → bant + ayraç; bölge/ordu panellerindeki KPI karoları → defter satırları; `Turu Bitir` → şemse madalyon (SVG) ; kalıcı ipucu şeridi ilk 3 yıldan sonra gizlenir; görünür metinlerde 4d tablosundaki ilk 15 değişiklik (düğme ve sekme adları dahil); görünür emojiler ikona.
- **Kabul ölçütleri (betikle ölçülür):**
  - `document.fonts.check('16px Alegreya')` ve `'16px "Alegreya SC"'` = true; görünür metin öğelerinin %100'ünde hesaplanan `fontFamily` Alegreya içerir (sayım betiği: `[...document.querySelectorAll('body *')]` görünür ve metin içeren öğeler).
  - Görünür ve `border-radius` > 4 px olan öğe sayısı = 0 (daire ikonlar ve sürgü tutamakları hariç).
  - Her ana yüzeyde (panel, modal) ≥ 1 doku katmanı ve cetvel; ana yüzeylerin 4 köşesinde köşebent.
  - Tipografi: en az 4 ayrı seviye (D2, H3, gövde, sayı) her oyun içi ekranda bulunur; gövde metninde < 13 px font yok.
  - Bilimler düğümlerinde sözcük içi bölünme 0 (her düğümde `Range.getClientRects()` ile satır sonlarının boşluk karakterine denk geldiği doğrulanır).
  - Kontrast: tüm metin/zemin çiftleri ≥ 4,5:1 (büyük başlık ≥ 3:1), betikle hesaplanır; yüksek kontrast kipinde ≥ 7:1.
  - Üst bantta kutulu çip sayısı = 0.
- **Boyut:** +90-115 KB font (base64) + ~6 KB CSS/SVG → **~535 KB**.
- **Riskler:** serif küçük boyutta okunabilirlik (gövde ≥ 15 px kuralı); yazı ölçeği 130 % kipinde taşmalar (Alegreya Sans'a göre daha geniş; 768 ve 375 genişlikte `scrollWidth ≤ clientWidth` testi); kaynak renklerinin parşömen üstünde kontrastı (koyulaştırılmış "mürekkep" sürümleri gerekir); renk körü kipinde altın/yeşil ayrımı.

### Aşama 2: Başlık ekranı + amblemler + harita çerçevesi

- **JS:** `showTitle()` (yeni ana menü; `wz0` yerine ilk ekran; "Devam et" kayıttan); `banner(seed,dyn)` prosedürel sancak SVG üreteci; sancaklar üst bant, bölge başlığı, saldırı penceresi (iki sancak karşı karşıya), Zafer sekmesi, bitiş, harita başkent işaretleri; unvan amblemleri (tuğ sayısı); harita son katmanında vignette + kâğıt kenarı + deniz tarama çizgileri; harita üstü `~10` / `~%95` hapları → kalkan ve mühür biçimleri; mobilde harita üstündeki boş şeridin kaldırılması.
- **Kabul:** sayfa açılışında ilk görünen ekran başlık ekranıdır (sihirbaz değil); oyuncu ve 4 rakip + kabileler için 5+1 farklı amblem üretilir ve şu 5 ekranın her birinde ≥ 1 amblem görünür: HUD, Bölge, Saldırı, Zafer, Bitiş; renkli geometrik işaret (`▼●■◆`) tek başına hiçbir yerde kalmaz; her oyun içi ekranda ikon dışı görsel öğe sayısı ≥ 2 (amblem, madalyon, manzara, harita küçük resmi vb.); harita kenarında düz dikdörtgen kesim görünmez (1440×880 ve 375×812 çekimlerinde).
- **Boyut:** +~15-20 KB → **~555 KB**.
- **Riskler:** harita katmanı eklemenin kare süresine etkisi (vignette ve kenar önceden çizilmiş görüntü olarak önbelleğe alınmalı; 60 hızlı tur senaryosunda ortalama `render` süresi en fazla %10 artabilir); amblemlerin küçük boyutta (16 px) okunurluğu (küçük boyutta sadeleşmiş sürüm).

### Aşama 3: İllüstrasyon ve anlatı

- **JS:** `scene(kind, seed)` prosedürel minyatür sahne üreteci (8-10 şablon: savaş, kıtlık, kervan/ticaret, salgın, elçi, isyan, doğa olayı, paralı asker, keşif, şenlik); bütün olaylara tür eşlemesi; ferman biçimli olay penceresi; bölge manzara şeridi (`landStrip(i)`, önbellekli); "Kayıt" → "Vakayiname" (yıl başlıklı, dönem tonlu cümleler; kayıt düğmeleri menüye); bitiş ekranında prosedürel öykü (2-3 cümle) ve harita tekrar oynatımı; olay metinlerinin ve en sık görülen 40 arayüz dizgesinin yeniden yazımı.
- **Kabul:** olayların %100'ünde sahne görseli; olay anlatı cümlelerinde `×`, `→`, `%` sayısı = 0 (betik tüm `EVM` metinlerini tarar); olay anlatısı ≤ 35 sözcük; bölge panelinin ilk 120 px'inde manzara şeridi; görünür arayüzde " · " sayısı ekran başına ≤ 3; Vakayiname'de her kayıt "Yıl N." ile başlar ve formül içermez.
- **Boyut:** +~25-35 KB kod + metin → **~590 KB**.
- **Riskler:** prosedürel sahnelerin "yapay" görünmesi (çözüm: az sayıda elle ayarlanmış şablon, düz pigment stili, sınırlı palet; rastgelelik yalnız yerleşimde); metin yeniden yazımında oyun dengesi bilgisinin kaybolması (sayılar ipucunda ve Kitap'ta kalmalı); bot testleri metin regex'ine bağlıysa (`/^Kıtlık/` gibi) günlük dizgeleri değişmemeli, yalnız görüntüleme katmanı değişmeli.

### Aşama 4: His, ses ve tam ekran Bilimler

- **JS:** `SFX` dönüşümü (4d tablosu: tahta tok, sayfa, saz Karplus-Strong, zurna, kös); hover sesi kaldırılır; müzik çalgıları (saz, ney, def); başlık ekranında müzik varsayılan açık; geçiş dili (ferman açılması, kitap sayfası, iki sancak); tam ekran Bilimler ağacı (bağlantı çizgileri, madalyon düğümler, alıntılar); danışman uyarı yığını (3 danışman).
- **Kabul:** UI seslerinde 1,5 kHz üstü saf ton (sinüs/üçgen/kare) = 0; `ui-hover` çağrısı 0; her ekran türü (olay, saldırı, Bilimler, bitiş, ayarlar) farklı giriş animasyonuna sahip (`getAnimations()` ile ad/süre kaydı); Bilimler 1440×880'de tam ekran, 24 düğüm + ≥ 18 bağlantı çizgisi; azaltılmış hareket kipinde tüm animasyonlar ≤ 120 ms opaklık; ses tepe seviyesi (mevcut `SND.peak` ölçümü) bugünkünü aşmaz.
- **Boyut:** +~15-25 KB → **~615 KB** (bütçe payı ~85 KB; gerekirse İtalik font buraya).
- **Riskler:** Karplus-Strong'un düşük güçlü mobilde ses kesmesi (ses sayısı sınırı; mevcut `SND.dropped` sayacıyla izlenir); iOS Safari ses kilidi (ilk dokunuş).

### Ölçülebilir "oyun gibi" karnesi (her aşama sonunda 1440 ve 375 çekimleri üzerinde)

| Ölçüt | Bugün | A1 | A2 | A3 | A4 |
|---|---|---|---|---|---|
| Gömülü kimlik fontu | 0 | 2 | 2 | 2 | 2-3 |
| Doku katmanı olan ana yüzey | 0 | tümü | tümü | tümü | tümü |
| Köşe süslü ana yüzey | 0 | panel + modal | + başlık ekranı | + ferman | + Bilimler |
| Amblem görünen ekran (5 ekran içinden) | 0 | 0 | 5 | 5 | 5 |
| İllüstrasyonlu ekran (başlık, bölge, olay, bitiş) | 1 (bitiş küçük resmi) | 1 | 2 | 4 | 4 |
| Tipografi seviyesi (oyun içi) | 2-3 (aynı aile, ağırlık farkı) | 4 | 5 | 5 | 5 |
| KPI karosu / kutulu çip | 6 karo + 9 çip | 0 | 0 | 0 | 0 |
| Kırık sözcük (Bilimler) | ≥ 10 | 0 | 0 | 0 | 0 |
| Saf ton UI sesi | 3 | 3 | 3 | 3 | 0 |

## 6. Kullanıcıya sorular (en fazla 5)

1. **Sanat yönü hangisi?**
   (a) **Saray Haritacısı**: parşömen + tezhip + koyu cilt (önerilen); (b) **Sefer Çadırı**: koyu deri + demir + pirinç (Total War/CK3'e yakın, daha karanlık); (c) **Nakkaşhane**: düz pigment minyatür (en özgün, ama haritayla uyumsuz, harita da stilize edilmeli).
2. **Okuma yüzeyleri açık mı koyu mu?**
   (a) Açık parşömen paneller, koyu mürekkep metin (Old World gibi; en yüksek okunabilirlik); (b) koyu cilt zemin, krem metin, altın çerçeve (CK3 gibi; bugünkü koyu düzene daha yakın); (c) karışık: HUD koyu, yalnız olay/bölge/Bilimler parşömen (önerilen).
3. **Dil tonu ne kadar dönem kokmalı?**
   (a) Hafif: bugünkü Türkçe + birkaç dönem sözcüğü (sefer, ferman, akçe, şan; önerilen); (b) Orta: sekme ve unvan adları da dönemsel (Hazine, Vakayiname, Serasker); (c) Ağır: Osmanlıca terimler ve uzun anlatılar.
4. **Oyunlaştırma öğeleri (skor, seri, günlük, MP) ne olsun?**
   (a) Dönem adlarıyla kalsın (Şan, Kesintisiz gün, Günlük ferman, Miras); (b) yalnız bitiş ve Miras ekranında görünsün, oyun içinde gizlensin; (c) olduğu gibi kalsın.
5. **Font ve süs bütçesi?**
   (a) Tek aile, 2 dosya (Alegreya + Alegreya SC, ~90-115 KB; önerilen); (b) + İtalik (anlatı için, ~+60 KB; toplam ~170 KB); (c) daha ayırt edici bir başlık fontu (ör. Cinzel; +~30-40 KB, Türkçe glifleri alt kümede doğrulanmalı).
