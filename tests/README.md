# Fetih testleri

Bot simülasyonu, oyunu (`../index.html?test=1`) gizli bir iframe'de yükler ve oyunun kendi global fonksiyonlarıyla (newGame, research, recruit, resolve, endTurn…) oynar. `?test=1` kipinde oyun açılış yüklemesini atlar ve localStorage'a hiç dokunmaz; gerçek kaydın bozulmaz.

## Çalıştırma

```sh
cd /Users/osman/fetih && python3 -m http.server 8123
```

Tarayıcıda: <http://localhost:8123/tests/index.html> → **Çalıştır**. `?auto` eklersen sayfa açılınca kendiliğinden başlar.

Konsoldan ya da `javascript_tool` ile:

```js
const r = await runSim({seeds:[11,22,33,44,55,66,77,88,99,111,123,234], maxTurns:140});
r.summary          // kazanma oranı, ortalama tur, hata sayısı…
window.SIM_RESULT  // son çalıştırmanın tamamı
```

## Seçenekler

| Ad | Varsayılan | Açıklama |
|---|---|---|
| `seeds` | 12 tohum | Harita tohumları |
| `maxTurns` | 140 | Tohum başına azami tur |
| `seedRandom` | `true` | Oyunun `Math.random`'ını tohumla sabitler: aynı kodla sonuçlar birebir tekrarlanır. `false` gerçek rastgelelik verir. |
| `fast` | `true` | `refresh()` yalnızca görüşü günceller (çizim/panel atlanır). Oyun mantığını değiştirmez; `false` ile aynı sonuç çıkar, yalnızca daha yavaş. |
| `slice` | 8 | Kaç turda bir tarayıcıya nefes aldırılacağı (ilerleme metni güncellenir) |
| `bot` | bkz. `SIM_DEFAULTS.bot` | Bot eşikleri (`atkCh:.75`, `upTahil:80`, `okcP:.3`…). Varsayılanlar referans bot2 ile aynı. |

## Çıktı

Tohum başına: bitiş turu, sonuç (`win`/`lose`/`-`), son bölge sayısı, %25/%50/%75 toprağa ulaşılan tur, kıtlık sayısı, tur başına eylem, hatalar.
Her turdan sonra tutarlılık denetimi yapılır: `troops === sumU(u)`, birimler negatif/NaN değil, kaynaklar ve moral sayı, nüfus ≥ 0. İhlal `invariant`, yakalanan istisna `istisna` hatası olarak yazılır.

## Taban çizgisi

`baseline.json`: Faz 0 değişikliklerinden önceki oyunla, 12 tohum, `seedRandom:true`. Oyun mantığına dokunmayan bir değişiklikten sonra `rows` birebir aynı çıkmalıdır:

```js
const r = await runSim({}), b = await fetch('baseline.json').then(x=>x.json());
JSON.stringify(r.rows.map(({ms,...x})=>x)) === JSON.stringify(b.rows)
```

Denge değişikliğinden sonra yeni taban çizgisi kaydedilmeli.
