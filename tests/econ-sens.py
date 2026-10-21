# duyarlılık: sens + sens2 (72 tohum) birleştir
import json,math
SP='/private/tmp/claude-501/-Users-osman/43ff13d3-c66b-4b6c-9bc1-b657fa0f123e/scratchpad'
A=json.load(open(SP+'/eres_sens.json'))+json.load(open(SP+'/eres_sens2.json'))
G={}
for r in A:
    if 's' not in r:continue
    k=r['name'].replace(' [s2]','');g=G.setdefault(k,{'rows':[]});g['rows']+=r['rows']
m=lambda a:sum(a)/len(a) if a else None
out={}
for k,g in G.items():
    rr=g['rows'];n=len(rr);w=sum(1 for r in rr if r['o']=='win')
    out[k]={'n':n,'win':w,'rate':round(w/n*100),'avgEnd':round(m([r['e'] for r in rr]),1),'t50':round(m([r['t50'] for r in rr if r['t50']]),1),'t25':round(m([r['t25'] for r in rr if r['t25']]),1),'winEnd':round(m([r['e'] for r in rr if r['o']=='win']),1)}
ref=out['ref']
for k,v in out.items():v['d_rate']=v['rate']-ref['rate'];v['d_t50']=round(v['t50']-ref['t50'],1)
# parametre başına etki: |+20 - -20| win farkı
par={}
for k in out:
    if k.endswith('+20') or k.endswith('-20'):
        b=k[:-3];par.setdefault(b,{})[k[-3:]]=out[k]
rank=[]
for b,d in par.items():rank.append((abs(d['+20']['rate']-d['-20']['rate']),b,d['+20']['rate'],d['-20']['rate'],d['+20']['t50'],d['-20']['t50']))
rank.sort(reverse=True)
singles={k:out[k] for k in out if k.startswith('base_')}
json.dump({'ref':ref,'all':out,'rank':rank,'singles':singles},open(SP+'/esens.json','w'),ensure_ascii=False)
print('ref',ref)
for r in rank:print(r)
for k,v in singles.items():print(k,v['rate'],v['d_rate'],v['t50'],v['d_t50'])
sd=math.sqrt(.64*.36/72*2);print('2 örnek fark SE ~',round(sd*100,1),'pp')
