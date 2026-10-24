# python3 tests/usta-analyze.py SONUÇ.json [ÇIKTI.json]
# usta-run.mjs çıktısını (iş adı "bot|zorluk|hanedan|parça", satırlarda tel:true) özetler: kazanma, tempo, kartopu ölçütleri (K1-K11, docs/faz2-derinlik.md §B.3.3),
# kaynak eğrileri, güç oranı serisi. Markdown tablolarını yazdırır, ÇIKTI.json'a özet yazar.
import json, sys, math, statistics as stt
from collections import defaultdict
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else None
res = json.load(open(src))
G = defaultdict(list); meta = {'errors': 0, 'randLeak': 0, 'audio': 0, 'fatal': 0, 'jobs': len(res), 'invariant': 0}
for x in res:
    if 's' not in x: meta['fatal'] += 1; print('HATA', x.get('name'), str(x.get('err'))[:300]); continue
    bot, d, dy, _ = x['name'].split('|')
    meta['errors'] += x['s']['errors']; meta['randLeak'] += x['s']['randLeak']; meta['audio'] += x.get('audio', 0); meta['fatal'] += 1 if x['s'].get('fatal') else 0
    for r in x['rows']:
        meta['invariant'] += sum(1 for e in (r.get('errors') or []) if e.get('tip') == 'invariant')
        G[(bot, d, dy)].append(r)
med = lambda a: (round(stt.median(a), 2) if a else None)
avg = lambda a: (round(sum(a) / len(a), 1) if a else None)
pct = lambda a, b: (round(100 * a / b, 1) if b else None)
def wilson(k, n, z=1.96):
    if not n: return (None, None)
    p = k / n; d = 1 + z * z / n; c = (p + z * z / (2 * n)) / d; h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return (round(100 * (c - h), 1), round(100 * (c + h), 1))
RS = ['tahil', 'odun', 'tas', 'demir', 'altin', 'bilgi']
def summ(rows):
    n = len(rows); W = [r for r in rows if r['over'] == 'win']; L = [r for r in rows if r['over'] == 'lose']; U = [r for r in rows if r['over'] == '-']
    T = lambda k, a=rows: [r[k] for r in a if r.get(k) is not None]
    tel = [r['tel'] for r in rows if r.get('tel')]
    r50 = [r for r in rows if r.get('t50')]; r25 = [r for r in rows if r.get('t25')]
    s = {'n': n, 'win': len(W), 'winPct': pct(len(W), n), 'ci95': wilson(len(W), n), 'lose': len(L), 'unfinished': len(U),
         'avgEnd': avg(T('end')), 'medEnd': med(T('end')), 'avgWinEnd': avg(T('end', W)), 'medWinEnd': med(T('end', W)), 'medLoseEnd': med(T('end', L)),
         't25': med(T('t25')), 't50': med(T('t50')), 't75': med(T('t75')), 't100': med(T('t100')),
         't75to100': med([r['t100'] - r['t75'] for r in rows if r.get('t100') and r.get('t75')]),
         'K1_winIf50': pct(sum(1 for r in r50 if r['over'] == 'win'), len(r50)), 'n50': len(r50),
         'K2_winIf25': pct(sum(1 for r in r25 if r['over'] == 'win'), len(r25)), 'n25': len(r25),
         'K4_lost1after50': pct(sum(1 for r in r50 if r.get('tel') and r['tel']['lostAfter50'] >= 1), len(r50)),
         'K4_lost3after50': pct(sum(1 for r in r50 if r.get('tel') and r['tel']['lostAfter50'] >= 3), len(r50)),
         'K5_lossAfter60': pct(sum(1 for r in L if r['end'] > 60), len(L)),
         'K6_comeback35': pct(sum(1 for r in L if r.get('tel') and r['tel']['peak'] >= .35), len(L)),
         'K8_gamesShort': pct(sum(1 for r in rows if r.get('tel') and (r['tel']['famT'] + r['tel']['hazine']) > 0), n),
         'K8_shortTurnPct': pct(sum(r['tel']['famT'] + r['tel']['hazine'] for r in rows if r.get('tel')), sum(r['end'] for r in rows)),
         'famT': sum(r['tel']['famT'] for r in rows if r.get('tel')), 'hazine': sum(r['tel']['hazine'] for r in rows if r.get('tel')),
         'K9_idle': {k: med([t['idle'][k] for t in tel if t['idle'].get(k) is not None]) for k in RS},
         'K10_aiPeak25': pct(sum(1 for t in tel if t['aiPeak'] >= .25), len(tel)), 'aiPeakMed': med([t['aiPeak'] for t in tel]),
         'K11_recap': pct(sum(1 for t in tel if t['recap'] >= 1), len(tel)),
         'lostRegionsMed': med([t['lost'] for t in tel]), 'lostAfter50Med': med([r['tel']['lostAfter50'] for r in r50 if r.get('tel')]),
         'capLost': sum(r.get('capLost') or 0 for r in rows), 'coalGames': pct(sum(1 for r in rows if r.get('coal')), n),
         'atkWon': avg(T('atkWon')), 'atkLost': avg(T('atkLost')), 'defLost': avg(T('defLost')), 'defWon': avg(T('defWon')),
         'tech': avg(T('tech')), 'events': avg(T('ev')), 'altDecisions': sum(len(r.get('alt') or []) for r in rows)}
    # kaynak anlık görüntüleri (tur 20/40/60/80; o tura kadar sürmüş oyunlar)
    sn = {}
    for t in ['20', '40', '60', '80']:
        A = [x['snap'][t] for x in tel if t in x['snap']]
        if not A: continue
        sn[t] = {'n': len(A), 'own': med([a['own'] for a in A]), 'troops': med([a['troops'] for a in A]), 'fields': med([a['fields'] for a in A]), 'flv': med([a['flv'] for a in A]),
                 'milMax': med([a['milMax'] for a in A]), 'tech': med([a['tech'] for a in A]), 'morale': med([a['morale'] for a in A]),
                 'stock': {k: med([a['res'][k] for a in A]) for k in RS}, 'net': {k: med([a['net'][k] for a in A]) for k in RS}, 'gross': {k: med([a['gross'][k] for a in A]) for k in RS}}
    s['snap'] = sn
    # güç serisi: her 5 turda medyan (o tura kadar süren oyunlar): pay, asker/rakip toplamı, asker/en güçlü rakip, toplam brüt gelir
    se = {}
    for x in tel:
        P0 = None
        for row in x.get('ser', []):
            t, o, tr, aiS, aiM, aiR, na, nt, gr, sa, st_ = row
            q = se.setdefault(t, {'own': [], 'r_sum': [], 'r_max': [], 'gross': [], 'netA': [], 'netT': [], 'stockA': [], 'stockT': []})
            q['own'].append(o); q['r_sum'].append(tr / max(1, aiS)); q['r_max'].append(tr / max(1, aiM)); q['gross'].append(gr); q['netA'].append(na); q['netT'].append(nt); q['stockA'].append(sa); q['stockT'].append(st_)
    s['series'] = {t: {k: round(med(v), 2) for k, v in q.items()} | {'n': len(q['own'])} for t, q in sorted(se.items()) if len(q['own']) >= max(3, n // 4)}
    # kartopu: tur T'de toprak payı ≥ X olan oyunlarda kazanma
    snow = {}
    for T0 in [20, 30, 40, 50]:
        for X in [.25, .35, .5]:
            a = [r for r in rows if r.get('tel') and any(row[0] == T0 and row[1] / r['playN'] >= X for row in r['tel'].get('ser', []))]
            if a: snow[f't{T0}>={int(X*100)}%'] = [len(a), pct(sum(1 for r in a if r['over'] == 'win'), len(a))]
    s['snowball'] = snow
    us = [r['usta'] for r in rows if r.get('usta')]
    if us:
        rec = defaultdict(int)
        for u in us:
            for k, v in u['recruited'].items(): rec[k] += v
        tot = sum(rec.values()) or 1
        s['usta'] = {'atk': avg([u['atk'] for u in us]), 'fail': avg([u['fail'] for u in us]), 'lossPct': avg([100 * u['lossPct'] for u in us if u['lossPct'] is not None]),
                     'moves': avg([u['moves'] for u in us]), 'loot': avg([u['loot'] for u in us]), 'mix': {k: round(100 * v / tot, 1) for k, v in rec.items()}, 'fieldN': avg([u['fieldN'] for u in us]), 'milN': avg([u['milN'] for u in us]), 'surN': avg([u['surN'] for u in us])}
    else:
        rec = defaultdict(int)
        for t in tel:
            for k, v in t['rec'].items(): rec[k] += v
        tot = sum(rec.values()) or 1
        s['mix'] = {k: round(100 * v / tot, 1) for k, v in rec.items()}
    return s
OUT = {'meta': meta, 'cells': {}, 'byDiff': {}}
for k in sorted(G): OUT['cells']['|'.join(k)] = summ(G[k])
bots = sorted({k[0] for k in G}); diffs = [d for d in ['cirak', 'kalfa', 'usta', 'destan'] if any(k[1] == d for k in G)]
for b in bots:
    for d in diffs: OUT['byDiff'][f'{b}|{d}'] = summ([r for k, v in G.items() if k[0] == b and k[1] == d for r in v])
print('meta', meta)
print('\n| Bot | Zorluk | Hanedan | n | Kazanma | %95 | Kayıp/bitmeyen | Ort. bitiş | Kazanılan (medyan) | t25 | t50 | t75 | t100 | %75→%100 | K1 | K4 (≥1/≥3) | Kayıp% (usta) |')
print('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
for k, s in OUT['cells'].items():
    b, d, dy = k.split('|')
    print(f"| {b} | {d} | {dy} | {s['n']} | {s['winPct']}% | {s['ci95'][0]}–{s['ci95'][1]} | {s['lose']}/{s['unfinished']} | {s['avgEnd']} | {s['medWinEnd']} | {s['t25']} | {s['t50']} | {s['t75']} | {s['t100']} | {s['t75to100']} | {s['K1_winIf50']} | {s['K4_lost1after50']}/{s['K4_lost3after50']} | {s.get('usta', {}).get('lossPct', '—')} |")
print('\n| Bot | Zorluk | n | Kazanma | %95 | Ort. bitiş | K1 | K2 | K3 | K4≥1 | K5 | K6 | K8 oyun/tur% | K10 | K11 | rakip tepe | atıl (demir/odun/taş/altın/tahıl/bilgi) |')
print('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
for k, s in OUT['byDiff'].items():
    b, d = k.split('|'); I = s['K9_idle']
    print(f"| {b} | {d} | {s['n']} | {s['winPct']}% | {s['ci95'][0]}–{s['ci95'][1]} | {s['avgEnd']} | {s['K1_winIf50']} | {s['K2_winIf25']} | {s['t75to100']} | {s['K4_lost1after50']} | {s['K5_lossAfter60']} | {s['K6_comeback35']} | {s['K8_gamesShort']}/{s['K8_shortTurnPct']} | {s['K10_aiPeak25']} | {s['K11_recap']} | {s['aiPeakMed']} | {I['demir']}/{I['odun']}/{I['tas']}/{I['altin']}/{I['tahil']}/{I['bilgi']} |")
if out: json.dump(OUT, open(out, 'w'), ensure_ascii=False, indent=1); print('yazıldı', out)
