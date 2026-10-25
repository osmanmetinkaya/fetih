# python3 tests/g3-analyze.py SONUÇ.json ÖZET.json — G3 deniz özeti (usta-run.mjs çıktısı, tel:true; iş adı bot|zorluk|hanedan|boy+parça):
# liman kuran / gemi yapan / balıkhane kuran oyun payı, t40/t60/t80 gemi-yük-ticaret-tavan, t50-80 ticaretin brüt altına oranı, tavana dayanma payı, fırtına/korsan, rakip liman seviyesi
import json,sys,statistics as st
from collections import defaultdict
d=json.load(open(sys.argv[1]));G=defaultdict(list)
for x in d:
  if 'rows' not in x:continue
  b,df,dy,p=x['name'].split('|');sz=''.join(c for c in p if not c.isdigit())
  key=(b,df,sz) if sz=='orta' else (b,df,dy+'/'+sz)
  G[key]+=x['rows']
med=lambda a:round(st.median(a),2) if a else None
out={}
for k,rows in sorted(G.items()):
  n=len(rows);T=[r['tel'] for r in rows if r.get('tel')];sea=[t.get('sea') or {} for t in T]
  o={'n':n,'win':round(100*sum(r['over']=='win' for r in rows)/n),
     'port%':round(100*sum(1 for s in sea if s.get('port') is not None)/max(1,len(sea))),
     'ship%':round(100*sum(1 for s in sea if s.get('shipMax',0)>0)/max(1,len(sea))),
     'fish%':round(100*sum(1 for s in sea if s.get('fishMax',0)>0)/max(1,len(sea))),
     'shipMax':med([s.get('shipMax',0) for s in sea]),
     'firstShip':med([s['firstShip'] for s in sea if s.get('firstShip') is not None]),
     'trShare':med([s['trShare'] for s in sea if s.get('trShare') is not None and s.get('shipMax',0)>0]),
     'trShareAll':med([s['trShare'] for s in sea if s.get('trShare') is not None]),
     'capHit':round(100*sum(s.get('capT',0) for s in sea)/max(1,sum(s.get('seaT',0) for s in sea)),1),
     'sunk':round(sum((s.get('st') or {}).get('sunk',0) for s in sea)/max(1,len(sea)),2),
     'pir':round(sum((s.get('st') or {}).get('pir',0) for s in sea)/max(1,len(sea)),2)}
  for TT in ['40','60','80']:
    A=[t['snap'][TT]['sea'] for t in T if TT in t['snap'] and t['snap'][TT].get('sea')]
    if A:o['t'+TT]=dict(n=len(A),ships=med([a['ships'] for a in A]),shipsAvg=round(sum(a['ships'] for a in A)/len(A),2),Y=med([a['Y'] for a in A]),tr=med([a['tr'] for a in A]),trAvg=round(sum(a['tr'] for a in A)/len(A),1),cap=med([a['cap'] for a in A]),fish=round(sum(a['fish'] for a in A)/len(A),2),aiPort=med([a['aiPort'] for a in A]))
  out['|'.join(k)]=o
json.dump(out,open(sys.argv[2],'w'),indent=0)
for k,o in out.items():print(k,{x:o[x] for x in o if not x.startswith('t') or x=='trShare'},'\n   ',o.get('t60'))
