# Fetih v0.12.0 (G1) · Zorluk ve ekonomi dengesi: önce/sonra ölçümü

**Yöntem.** Önce = v0.11.0'ın dondurulmuş kopyası (`tests/_eski/v0110.html`, oyun mantığı v0.10.0 ile aynı; sonuçlar `usta-bot-v0100.md` ile örtüşüyor), sonra = `index.html` 0.12.0. Başsız Chrome, `tests/usta-run.mjs` 9 işçi; özet `tests/g1-analyze.py`. Klasik kurallar, Kıta, kart yok, olaylar ve alternatif zaferler açık (karar `devam`), `maxTurns` 240 (Uzun 280), tohum 1001-1048, zorluk × hanedan (Klasik, Börü, Kartal) × iki bot (`ref`, `usta`), ayrıca Kalfa/Klasik Kısa ve Uzun = **1.344 oyun / koşu**. Ham özet: `usta-bot-v0120.json` (`before`, `after`: `agg` = 3 hanedan Normal, `cells`).

**Denetimler (ölçüldü):** hata 0, invariant 0, `randLeak` 0, sim'de AudioContext 0, ölümcül iş 0 (iki koşuda da). `checkMaps` 20/20 + 12/12. `evUnit(7)` 43 seçenek temiz. Belirlenimcilik: aynı tohum iki kez (usta ve ref) birebir. `cfg.rules=1` (yalnız `?test=1`) `baseline-v6` `rows` ve `rowsOff` 12/12 birebir. Hata payı: 144 oyunda ±7-8 puan, 48 oyunda ±13.

## 1. Kazanma ve tempo (Normal, 3 hanedan, 144 oyun/zorluk)

**Usta bot (hedef ölçüm botu)**

| Zorluk | Kazanma önce→sonra | Hedef | Ort. bitiş | Kazanılan (medyan) | t25 | t50 | t75 | %75→%100 | K1 | K4 (≥1 bölge kaybı %50 sonrası) | Sıkıntı turu % | Rakip saldırısı/oyun | Başkent kaybı/oyun | Bitmeyen |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Çırak | 100 → **69** | 65-75 | 36 → 88 | 35 → 86 | 12 → 17 | 22 → 40 | 31 → 73 | 4 → 10 | 100 → 86 | 19 → 77 | 0,02 → 1,1 | 0,6 → 16,8 | 0,01 → 0,78 | 0 → 1 |
| Kalfa | 93 → **42** | 35-45 | 42 → 94 | 39 → 110 | 12 → 18 | 24 → 56 | 34 → 96 | 4 → 11 | 98 → **78** | 38 → 85 | 0,4 → 2,7 | 4,5 → 23,0 | 0,25 → 1,52 | 0 → 2 |
| Usta | 81 → **19** | 15-25 | 52 → 87 | 45 → 121 | 14 → 20 | 28 → 77 | 40 → 103 | 3 → 12 | 95 → 64 | 48 → 89 | 0,4 → 3,3 | 8,5 → 20,8 | 0,5 → 2,2 | 1 → 5 |
| Destan | 78 → **7** | 5-10 | 50 → 81 | 44 → 148 | 14 → 20 | 27 → 77 | 39 → 117 | 4 → 12,5 | 92 → 43 | 55 → 91 | 0,8 → 4,7 | 9,6 → 22,0 | 0,6 → 2,7 | 1 → 3 |

Hanedan (usta, Kalfa, 48'er): Klasik 94 → **38**, Börü 94 → **46**, Kartal 92 → **44** (bant %25-55 içinde). Boy (usta, Kalfa/Klasik): Kısa 98 → 33 (ort. 86 tur), Uzun 100 → **71** (ort. 102 tur; Uzun hâlâ kolay, bkz. riskler).

**Ref bot (ikinci kaynak, "acemi")**

| Zorluk | Kazanma önce→sonra | B0 beklentisi | Ort. bitiş | Kazanılan (medyan) | t25 | t50 | %75→%100 | K1 | Bitmeyen |
|---|---|---|---|---|---|---|---|---|---|
| Çırak | 90 → 48 | 45-60 | 93 → 103 | 85 → 121 | 35 → 42 | 64 → 77 | 4 → 14 | 96 → 86 | 6 → 9 |
| Kalfa | 49 → 25 | 20-30 | 81 → 90 | 92 → 148 | 39 → 41 | 73 → 99 | 4 → 13,5 | 93 → 80 | 5 → 4 |
| Usta | 24 → 8 | 8-15 | 66 → 75 | 96 → 156 | 44 → 41 | 77 → 117 | 4 → 15,5 | 92 → 75 | 3 → 4 |
| Destan | 12 → 3 | 2-6 | 61 → 58 | 123 → 187 | 50 → 53 | 88 → 123 | 4 → 8,5 | 85 → 57 | 2 → 3 |

## 2. Kaynak ve güç eğrisi (usta, Kalfa, medyan; o tura kadar süren oyunlar)

| Tur | Bölge önce→sonra | Asker | Brüt gelir (6 kaynak) | Net altın | Net tahıl | Divan gideri | Stok÷net tahıl | Rakip ordusu (toplam / en büyük) | En büyük rakip hazinesi / kademe / geliri |
|---|---|---|---|---|---|---|---|---|---|
| 20 | 24 → 15 | 142 → 110 | 139 → 95 | 29 → 13 | 34 → 26 | 0 → 4,7 | 2,3 → 2,6 | 219/68 → 238/71 | — → 51 akçe / II(1) / 55 |
| 40 | 44 → 19 | 333 → 165 | 338 → 183 | 80 → 20 | 111 → 70 | 0 → 7,5 | 2,0 → 2,6 | 325/131 → 423/137 | — → 100 / III / 130 |
| 60 | — → 19 | — → 285 | — → 240 | — → 38 | — → 79 | — → 6,7 | — → 2,0 | — → 695/292 | — → 221 / III / 223 |

Brüt gelir büyümesi (t5 → t20 → t40): önce 3,4× / 8,3×, sonra ~2,3× / ~4,5×. Divan gideri oyun boyu brüt altının medyan ~%10'u (gerçek arayüz oyununda 15-20 bölgede %16-22). Çürüyen stok (oyun başına, usta Kalfa): tahıl 590, altın 112, demir 34, taş 27; ref botta çok daha fazla (odun 1.296, tahıl 1.161, demir 564: ref harcamayı bilmiyor). İsyan oyun başına 0,4 (usta) / 3,0 (ref, garnizon bırakmıyor).

## 3. Kartopu ölçütleri (usta, Kalfa)

K1 P(kazanma | %50) 98 → **78** (hedef ≤ 90) · K3 %75→%100 4 → **11 tur** (10-18) · K4 ≥1 bölge kaybı %50 sonrası 38 → 85 · K10 bir rakip ≥ %25 toprak 6 → 76 · kaybedilen oyunların medyan bitişi 52 → 71 · kıtlık/hazine boş turu %0,4 → %2,7 (< %5). Rakip saldırısı oyuncuya oyun başına 4,5 → 23 (başarı %99: rakip yalnız yeterli üstünlükte saldırır). "Eşgüdüm" ölçütü (aynı tur aynı bölgeye 2+ saldırı) %0-1: rakip eşgüdümü dalgalar yerine yığınak (S1: tek, büyük saldırı) ve koalisyonun ortak hedefi (S8) üzerinden işliyor; bu ölçüt onu yakalamıyor.

## 4. Kalibrasyon özeti (temiz iframe varyantları, 48-144 oyun)

| Değişken | Denenen | Seçilen | Not |
|---|---|---|---|
| `DIFFS.eco` Kalfa | 1,0 / 1,05 / 1,1 / 1,15 / 1,3 / 1,4 / 1,5 | **1,40** (bakım 0,22 ile) | 1,15 + bakım 0,15 → usta %60 |
| rakip bakımı `AIX.up` | 0,15 / 0,22 | **0,22** | geç oyunda rakip ordusunu sınırlar, bitmeyen oyun azalır |
| Çırak / Usta / Destan `eco` | 1,0-1,3 / 1,3-1,65 / 1,45-1,85 | **1,25 / 1,55 / 1,75** | |
| `smart` | 0 / .65 / .85 / 1 | .35 / .85 / 1 / 1 | ref botu daha çok etkiliyor |
| Son direniş | yok / (.6, .5) / (.5, .8) | (.6, .5) | tek başına K3'ü değiştirmedi |
| Vasal sadakati | 0 / 8 yıl | **8 yıl** | K3 2 → 15 turun asıl nedeni: son rakipler biatla bir anda "alınıyordu" |

Yöntem uyarısı: ilk varyant koşularında `pre` yaması aynı işçinin sonraki işlerine sızıyordu (sonuçlar karıştı); `usta-run.mjs` düzeltildi (pre'li işe benzersiz `src`) ve seçilen değerler temiz koşularla doğrulandı. Son tam koşu (bu belgedeki tablo) yamasız, oyunun kendi sabitleriyle; rakip turu içinde oyuncu payı önbelleğe alındıktan sonra yeniden koşuldu (sonuçlar ±3 puan oynadı).
