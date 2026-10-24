# Fetih v0.13.0 (G2) · Atölyeler ve donanım hiyerarşisi: önce/sonra ölçümü

**Yöntem.** Önce = v0.12.0 (`usta-bot-v0120.json` "after"; dondurulmuş kopya `tests/_eski/v0120.html`), sonra = `index.html` 0.13.0. Başsız Chrome, `usta-run.mjs` 9 işçi, işler `g2-jobs.py` (4 zorluk × Klasik/Börü/Kartal × 48 tohum 1001-1048 × usta/ref + Kalfa/Klasik Kısa/Uzun = 1.344 oyun), özet `g1-analyze.py` + `g2-analyze.py`. Ham özet: `usta-bot-v0130.json` (`before`, `after`, `eq`).

**Denetimler:** hata 0, invariant 0, `randLeak` 0, AudioContext 0, ölümcül iş 0. `checkMaps` 20/20 + 12/12, `evUnit(7)` 43 seçenek temiz, belirlenimcilik (ref ve usta, aynı tohum iki kez birebir), `cfg.rules=1` → `baseline-v6` rows/rowsOff birebir. Hata payı: 144 oyunda ±7-8 puan, 48 oyunda ±13.

## 1. Kazanma (Normal, 3 hanedan, 144 oyun/zorluk)

| Zorluk | Usta bot önce → sonra | Hedef | Ref bot önce → sonra | Ort. bitiş (usta) | t25 (usta) | %75→%100 | K1 | Sıkıntı turu % | Bitmeyen |
|---|---|---|---|---|---|---|---|---|---|
| Çırak | 69 → **72** | 65-75 | 48 → 63 | 88 → 101 | 17 → 23,5 | 10 → 10 | 86 → 89 | 1,1 → 1,5 | 1 → 0 |
| Kalfa | 42 → **40** | 35-45 | 25 → 39 | 94 → 107 | 18 → 25 | 11 → 10 | 78 → 76 | 2,7 → 3,2 | 2 → 3 |
| Usta | 19 → **24** | 15-25 | 8 → 29 | 87 → 105 | 20 → 28 | 12 → 11 | 64 → 68 | 3,3 → 3,3 | 5 → 8 |
| Destan | 7 → **9** | 5-10 | 3 → 7 | 81 → 94 | 20 → 27 | 12,5 → 10 | 43 → 57 | 4,7 → 3,7 | 3 → 8 |

Hanedan (usta, Kalfa, 48'er): Klasik 38 → 35, Börü 46 → 38, Kartal 44 → 46. Boy (usta, Kalfa/Klasik): Kısa 33 → 29, Uzun 71 → **54** (Uzun artık bandın yakınında).

## 2. Donanım kullanımı (usta bot, medyan; `g2-analyze.py`)

| Zorluk | ≥2 atölye (oyun %) | Sv.3+ atölye (oyun %) | t40 kılıç kademesi | t60 kılıç kademesi / kapsama | t60 zırh kapsaması (ort.) | Demir stok÷net (t15-60) | Rakip kademesi t40/t60/t80 |
|---|---|---|---|---|---|---|---|
| Çırak | 92 | 16 | 1,46 | 1,74 / %100 | %41 | 9,9 | 1 / 2 / 2 |
| Kalfa | 81 | 9 | 1,35 | 1,69 / %100 | %38 | 11,9 | 2 / 3 / 3 |
| Usta | 72 | 4 | 1,40 | 1,85 / %100 | %28 | 14,3 | 2 / 3 / 4 |
| Destan | 57 | 1 | 1,46 | 1,83 / %100 | %29 | 11,9 | 2 / 3 / 4 |

Ref bot: atölyesini yükseltmiyor (yükseltmeyi altın > 60 ile koşullar), kılıç kademesi t60'ta ~1,3; zırh yok; demir stok÷net ~30 (atıl). Birlik karışımı (usta): Piyade %88-93, Okçu %7-12, Süvari %0,3, Yeniçeri %0.

## 3. Kalibrasyon özeti (usta bot, Kalfa ya da 4 zorluk, 36-144 oyun)

| Değişken | Denenen | Seçilen | Not |
|---|---|---|---|
| `DIFFS.eco` | G1 değerleri ×1 / ×0,85 / ×0,75 / ×0,65; ayrıca eqCap −1 ile ×0,85-0,9 | **0,88 / 1,00 / 1,06 / 1,25** | G1 değerleriyle (1,25/1,40/1,55/1,75) usta bot 31/6/0/0: rakibin kademesi artık çarpan (T3 saldırı ×1,38, savunma ×1,24), oyuncunun eski +%25-35 demir donanımı kalktı |
| `tCap` | G1 / −0,10 | −0,10 (,30/,35/,40/,45) | tek başına etkisi gürültü içinde |
| eqCap −1 + yüksek eco | denendi | ret | ref botu G1 düzeyine getiriyor ama usta bot 62/19/10/6 |
| Atölye bedeli | belge (taş/odun/altın) → demir → tahıl+demir+odun | {tahıl 25, demir 15, odun 10} (Zırhhane 30/20/10) | taş ve altın darboğazdı: usta bot hiç yükseltme yapamıyordu |
| Atölye seviye kapısı | bölgenin kuruluşu (belge) → ülkenin en yüksek kuruluşu, Sv.2 Karakol ile | ülke geneli | bölge kapısında Sv.2 bile nadirdi; sonuç değişmedi ama arayüzde daha anlaşılır |
| Kabile zırhı | D[1]=1,08 (belge) → 1,00 | 1,00 | erken oyunun kabile fethi G1'e yakın kalsın |
| Rakip kademe yılı | 14·(T−1) → 24·(T−1) | 24 | belge tahmini (Kalfa T2 ~30, T3 ~50) ile uyumlu |
