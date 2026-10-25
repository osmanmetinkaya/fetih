# Fetih v0.14.0 (G3) · Liman, tersane, gemi, dış ticaret, balıkçılık: önce/sonra ölçümü

**Yöntem.** Önce = v0.13.0 (`usta-bot-v0130.json` "after"; deniz bloğu dondurulmuş kopya `tests/_eski/v0130.html` ile ayrıca koşuldu), sonra = `index.html` 0.14.0. Başsız Chrome, `usta-run.mjs` 9 işçi, işler `g3-jobs.py` (4 zorluk × Klasik/Börü/Kartal × 48 tohum 1001-1048 × usta/ref + Kalfa/Klasik Kısa/Uzun + deniz bloğu Kalfa × Körfez/Klasik, Kıta/Deniz Beyleri, Körfez/Deniz Beyleri = 1.632 oyun), özet `g1-analyze.py` + `g2-analyze.py` + `g3-analyze.py`. Ham özet: `usta-bot-v0140.json` (`before`, `after`, `eq`, `sea`).

**Denetimler:** hata 0, invariant 0, `randLeak` 0, AudioContext 0, ölümcül iş 0. `checkMaps` 20/20 + 12/12, `evUnit(7)` 46 seçenek temiz (E19 dahil), belirlenimcilik (ref; usta Kıta/Klasik ve Körfez/Deniz Beyleri, aynı tohum iki kez birebir, modül süreleri hariç), `cfg.rules=1` → `baseline-v6` rows/rowsOff birebir. Hata payı: 144 oyunda ±7-8 puan, 48 oyunda ±13.

## 1. Kazanma (Normal, 3 hanedan, 144 oyun/zorluk)

| Zorluk | Usta bot önce → sonra | Hedef | Ref bot önce → sonra | Ort. bitiş (usta) | t25 | %75→%100 | K1 | Sıkıntı turu % | Bitmeyen |
|---|---|---|---|---|---|---|---|---|---|
| Çırak | 72 → **67** | 65-75 | 63 → 65 | 101 → 103 | 23,5 → 23 | 10 → 11 | 89 → 83 | 1,5 → 1,8 | 0 → 5 |
| Kalfa | 40 → **39** | 35-45 | 39 → 45 | 107 → 105 | 25 → 25 | 10 → 12 | 76 → 68 | 3,2 → 3,5 | 3 → 6 |
| Usta | 24 → **21** | 15-25 | 29 → 28 | 105 → 109 | 28 → 28 | 11 → 11 | 68 → 59 | 3,3 → 3,4 | 8 → 8 |
| Destan | 9 → **6** | 5-10 | 7 → 6 | 94 → 88 | 27 → 29 | 10 → 8,5 | 57 → 42 | 3,7 → 4,5 | 8 → 6 |

Hanedan (usta, Kalfa, 48'er): Klasik 35 → 38, Börü 38 → 42, Kartal 46 → 38. Boy (usta, Kalfa/Klasik): Kısa 29 → 29, Uzun 54 → **75** (risk). Kartopu yok: t60 brüt toplam (usta Kalfa) 139 → 142, net altın 18,8 → 26,4 (ticaret), en güçlü rakip geliri 120 → 98 (Kalfa `eco` 1,00 → 0,93).

## 2. Deniz bloğu (Kalfa, 48 oyun)

| Hücre | Usta önce → sonra | Ref önce → sonra | Gemi yapan oyun % | t50-80 ticaret ÷ brüt altın (gemili oyun, medyan) | Tavana dayanan tur % |
|---|---|---|---|---|---|
| Kıta / Klasik (144) | 40 → 39 | 39 → 45 | 72 | %17 | 9,5 |
| Körfez / Klasik | 40 → 44 | 29 → 42 | 73 | %21 | 9,5 |
| Kıta / Deniz Beyleri | 25 → 23 | 44 → 62 | 65 | %20 | 20 |
| Körfez / Deniz Beyleri | 29 → 38 | 33 → 33 | 77 | %22 | 6,7 |

Körfez Kalfa (44) Kıta'nın (39) ±10 puanı içinde. Ticaret payı belge bandında (%15-35).

## 3. Deniz kullanımı (usta bot, Normal, `g3-analyze.py`)

| Zorluk | Liman kuran % | Gemi yapan % | Balıkhane kuran % | İlk gemi (yıl, medyan) | t60 gemi (ort.) / ticaret (ort. altın) / tavan | Batan gemi / korsan baskını (oyun başı) | Rakip liman seviyesi t60 (toplam) |
|---|---|---|---|---|---|---|---|
| Çırak | 96 | 88 | 46 | 40 | 2,2 / 13,2 / 31 | 1,1 / 0,9 | 4 |
| Kalfa | 90 | 72 | 39 | 40 | 1,6 / 9,3 / 23 | 0,9 / 0,7 | 6 |
| Usta | 83 | 58 | 46 | 43 | 1,1 / 6,2 / 20 | 0,8 / 0,8 | 8 |
| Destan | 70 | 45 | 42 | 43 | 0,7 / 3,9 / 15 | 0,4 / 0,6 | 11,5 |

Ref bot: liman kurar (%15-58), gemi nadir (%5-10; liman/tersane için altın > 100 eşiği, ilk gemi ~130. yıl), balıkhane %83-91 oyunda.

## 4. Kalibrasyon (usta bot, Kalfa ya da Kalfa+Usta, 144 oyun)

| Değişken | Denenen | Seçilen | Not |
|---|---|---|---|
| Rakip liman/balık getirisi `SEA.ai` | y 1,2 / balık 0,6, azami Sv.2 (Tüccar 4) → y 0,5 / balık 0,2, azami Sv.1 (Tüccar 3, Deniz +1) | küçük | ilk sürümde usta bot 72/40/24/9 → 40/15/11/4; varyantlar: rakip denizi kapalı +10, oyuncu limanı kapalı +7, balık kapalı +4 puan |
| Rakip gelişim sırası | liman + gelişim getiri/bedel oranına göre karışık sıra → gelişim sırası korunur, liman yalnız sıradaki gelişimden iyiyse | korunur | oran sıralaması ucuz gelişimi öne alıp rakip gelirini hızlandırıyordu (Kalfa 22 → 33) |
| Liman/tersane bedeli | belge (taş ağırlıklı) → odun ağırlıklı | odun | taş kuruluş/surda darboğaz; usta bot hiç liman kuramıyordu |
| Usta bot `liman` | 6. yıldan, ufuk ×1,2, 2 adım/yıl → 20. yıldan, ufuk ×1, 1 adım/yıl, `T.saveSea` | ikincisi | erken gemi yatırımı askerî tempoyu düşürüyordu |
| `DIFFS.eco` | 0,88/1,00/1,06/1,25 → 0,86/0,97/1,06/1,30 → Kalfa 0,93/0,90/0,87 | **0,86 / 0,93 / 1,06 / 1,30** | Kalfa 0,97'de 28, 0,93'te 39, 0,90'da 47 |
| Deniz Beyleri | — | ticaret ×1,15, gemi bakımı −%25 | kıyı hanedanı yeni sistemden yararlansın (Kıta/Deniz 25 → 23, Körfez/Deniz 29 → 38) |
