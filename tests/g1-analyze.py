# python3 tests/g1-analyze.py SONUÇ.json ÖZET.json — usta-run.mjs çıktısının G1 özeti (iş adı bot|zorluk|hanedan|boy+parça, tel:true): kazanma, tempo, K1/K4, %75→%100, sıkıntı turu, rakip saldırıları, eşgüdüm, kaynak anlık görüntüleri (net, stok÷net, Divan gideri, rakip ordusu/hazine/kademe), çürüme
import json,sys,statistics as st
from collections import defaultdict
res=json.load(open(sys.argv[1]));G=defaultdict(list);meta=dict(err=0,leak=0,audio=0,fatal=0,inv=0)
for x in res:
    if 's' not in x: meta['fatal']+=1;continue
    b,d,dy,p=x['name'].split('|');sz=''.join(c for c in p if not c.isdigit())
    meta['err']+=x['s']['errors'];meta['leak']+=x['s']['randLeak'];meta['audio']+=x.get('audio',0)
    for r in x['rows']:
        meta['inv']+=sum(1 for e in (r.get('errors') or []) if e.get('tip')=='invariant');G[(b,d,dy,sz)].append(r)
med=lambda a:(round(st.median(a),1) if a else None)
pc=lambda a,b:(round(100*a/b) if b else None)
def S(rows):
    n=len(rows);W=[r for r in rows if r['over']=='win'];L=[r for r in rows if r['over']=='lose']
    r50=[r for r in rows if r.get('t50')];tel=[r['tel'] for r in rows if r.get('tel')]
    turns=sum(r['end'] for r in rows)
    o=dict(n=n,win=pc(len(W),n),unf=sum(1 for r in rows if r['over']=='-'),avgEnd=round(sum(r['end'] for r in rows)/n,1),medWin=med([r['end'] for r in W]),medLose=med([r['end'] for r in L]),
     t25=med([r['t25'] for r in rows if r.get('t25')]),t50=med([r['t50'] for r in rows if r.get('t50')]),t75=med([r['t75'] for r in rows if r.get('t75')]),
     d75=med([r['t100']-r['t75'] for r in rows if r.get('t100') and r.get('t75')]),K1=pc(sum(1 for r in r50 if r['over']=='win'),len(r50)),n50=len(r50),
     K4=pc(sum(1 for r in r50 if r.get('tel') and r['tel']['lostAfter50']>=1),len(r50)),
     short=round(100*sum(t['famT']+t['hazine'] for t in tel)/max(1,turns),2),
     aiAtkP=round(sum(t.get('aiA',{}).get('p',0) for t in tel)/max(1,len(tel)),1),aiWinP=pc(sum(t.get('aiA',{}).get('pw',0) for t in tel),sum(t.get('aiA',{}).get('p',0) for t in tel)),
     coord=pc(sum(t.get('aiA',{}).get('coord',0) for t in tel),sum(t.get('aiA',{}).get('p',0) for t in tel)),aiCapLost=round(sum(t.get('aiA',{}).get('aiCapLost',0) for t in tel)/max(1,len(tel)),2),
     K10=pc(sum(1 for t in tel if t['aiPeak']>=.25),len(tel)),ida=med([t.get('idaShare',0) for t in tel]),riot=round(sum(t.get('riot',0) for t in tel)/max(1,len(tel)),1),
     capLost=round(sum(r.get('capLost') or 0 for r in rows)/n,2))
    for T in ['20','40','60']:
        A=[t['snap'][T] for t in tel if T in t['snap']]
        if len(A)>=max(3,n//5): o['s'+T]=dict(n=len(A),own=med([a['own'] for a in A]),nA=med([a['net']['altin'] for a in A]),nT=med([a['net']['tahil'] for a in A]),gr=med([sum(a['gross'].values()) for a in A]),idare=med([a.get('idare',0) for a in A]),
            idleT=med([a['res']['tahil']/a['net']['tahil'] for a in A if a['net']['tahil']>.5]),idleA=med([a['res']['altin']/a['net']['altin'] for a in A if a['net']['altin']>.5]),
            aiTr=med([sum(x[1] for x in a['ai']) for a in A if a.get('ai')]),aiMax=med([max([x[1] for x in a['ai']] or [0]) for a in A if a.get('ai')]),aiH=med([max([x[2] for x in a['ai']] or [0]) for a in A if a.get('ai')]),tier=med([max([x[3] for x in a['ai']] or [0]) for a in A if a.get('ai')]),aiInc=med([max([x[5] or 0 for x in a['ai']] or [0]) for a in A if a.get('ai')]),troops=med([a['troops'] for a in A]))
    rot=defaultdict(float)
    for t in tel:
        for k,v in (t.get('rot') or {}).items(): rot[k]+=v
    o['rotPerGame']={k:round(v/max(1,len(tel))) for k,v in rot.items()}
    return o
out={'meta':meta,'cells':{},'agg':{}}
for k,rows in sorted(G.items()): out['cells']['|'.join(k)]=S(rows)
A=defaultdict(list)
for (b,d,dy,sz),rows in G.items():
    if sz=='orta':A[(b,d)]+=rows
for k,rows in sorted(A.items()): out['agg']['|'.join(k)]=S(rows)
json.dump(out,open(sys.argv[2],'w'),indent=0)
print(meta)
keys=['n','win','unf','avgEnd','medWin','medLose','t25','t50','t75','d75','K1','K4','short','aiAtkP','aiWinP','coord','K10','riot','capLost']
print('cell',*keys,sep='\t')
for k,o in list(out['agg'].items())+list(out['cells'].items()):print(k,*[o.get(x) for x in keys],sep='\t')
