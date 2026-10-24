# python3 tests/g2-analyze.py SONUÇ.json ÖZET.json — G2 donanım özeti (usta-run.mjs çıktısı, tel:true; iş adı bot|zorluk|hanedan|boy+parça):
# t20/40/60/80 kılıç/zırh kapsaması ve ortalama kademe, atölye sayısı, en yüksek atölye seviyesi dağılımı, Sv.3+ ve ≥2 atölyeli oyun payı, demir stok÷net (K9), rakip kademesi, birlik karışımı (Yeniçeri payı)
import json,sys,statistics as st,collections
from collections import defaultdict
d=json.load(open(sys.argv[1]));G=defaultdict(list)
for x in d:
  if 'rows' not in x:continue
  b,df,dy,p=x['name'].split('|')
  if 'orta' in p:G[(b,df)]+=x['rows']
med=lambda a:round(st.median(a),2) if a else None
out={}
for k,rows in sorted(G.items()):
  o={'n':len(rows)}
  for T in ['20','40','60','80']:
    A=[r['tel']['snap'][T] for r in rows if T in r['tel']['snap'] and r['tel']['snap'][T].get('eq')]
    if not A:continue
    e=[a['eq'] for a in A]
    o['t'+T]=dict(n=len(A),own=med([a['own'] for a in A]),covK=med([q['cov']['kilic'] for q in e]),TK=med([q['T']['kilic'] for q in e]),covZ=med([q['cov']['zirh'] for q in e]),covZavg=round(sum(q['cov']['zirh'] for q in e)/len(e),2),
      ws=med([q['ws'] for q in e]),wsMax=dict(sorted(collections.Counter(q['wsMax'] for q in e).items())),demir=med([a['res']['demir'] for a in A]),aiT=med([max([z[3] for z in a['ai']] or [0]) for a in A if a.get('ai')]))
  t=[r['tel'] for r in rows]
  def mx(r,key):
    return max([s['eq'][key] for s in r['tel']['snap'].values() if s.get('eq')] or [0])
  o['ws2']=round(100*sum(1 for r in rows if mx(r,'ws')>=2)/len(rows));o['sv3']=round(100*sum(1 for r in rows if mx(r,'wsMax')>=3)/len(rows))
  rec=collections.Counter()
  for x in t:rec.update(x.get('rec',{}))
  tot=sum(rec.values()) or 1;o['mix']={k:round(100*v/tot,1) for k,v in rec.items()}
  o['idleDemir']=med([x['idle']['demir'] for x in t if x['idle'].get('demir') is not None])
  out['|'.join(k)]=o
json.dump(out,open(sys.argv[2],'w'),indent=0)
for k,o in out.items():
  print(k,o['n'],'ws≥2 %',o['ws2'],'Sv3+ %',o['sv3'],'idleDemir',o['idleDemir'],'mix',o['mix'])
  for T in ['t40','t60','t80']:
    if T in o:print('  ',T,o[T])
