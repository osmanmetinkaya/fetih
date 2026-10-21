# python3 econ-analyze.py NAME  -> SP/eana_NAME.json ve özet çıktı (politika telemetrisi)
import json,sys,statistics as st
SP='/private/tmp/claude-501/-Users-osman/43ff13d3-c66b-4b6c-9bc1-b657fa0f123e/scratchpad'
R=json.load(open(f'{SP}/eres_{sys.argv[1]}.json'))
RS=['tahil','odun','tas','demir','altin','bilgi']
mean=lambda a:round(sum(a)/len(a),2) if a else None
def wilson(w,n):
    if not n:return None
    z=1.96;p=w/n;d=1+z*z/n;c=p+z*z/(2*n);r=z*((p*(1-p)/n+z*z/(4*n*n))**.5);return [round((c-r)/d*100),round((c+r)/d*100)]
OUT={}
GR={}
for job in R:
    if 'tel' not in job or not job['tel']:continue
    k=job['name'].replace('_s2','');
    if k not in GR:GR[k]={'name':k,'tel':[],'rows':[],'s':{}}
    GR[k]['tel']+=job['tel'];GR[k]['rows']+=job['rows']
for job in GR.values():
    G=job['tel'];n=len(G);o={}
    rr=job['rows'];job['s']={'avgEnd':mean([r['e'] for r in rr]),'avgWinEnd':mean([r['e'] for r in rr if r['o']=='win'])}
    o['n']=n;o['win']=sum(1 for r in rr if r['o']=='win');o['lose']=sum(1 for r in rr if r['o']=='lose');o['timeout']=sum(1 for r in rr if r['o'] not in('win','lose'));o['ci95']=wilson(o['win'],n)
    # kaynak eğrileri
    cur={}
    for T in (5,10,20,40,60):
        row={}
        for r in RS:
            gr=[];stk=[];sp=[];
            for g in G:
                tt=[x for x in g['turns'] if x['t']==T]
                if not tt:continue
                x=tt[0];gr.append(x['gross'][r]-x['up'].get(r,0));stk.append(x['pre'][r]);
                s0=g['start'].get(str(T));
                if s0:sp.append(s0[r]-x['pre'][r])
            row[r]={'net':mean(gr),'stok':mean(stk),'harcama':mean(sp)}
        pops=[x for g in G for x in g['turns'] if x['t']==T]
        row['own']=mean([x['own'] for x in pops]);row['pop']=mean([x['pop'] for x in pops]);row['troops']=mean([x['troops'] for x in pops]);row['n']=len(pops)
        cur[T]=row
    o['curve']=cur
    # brüt gelir
    # kıtlık / hazine boş
    tot=sum(len(g['turns']) for g in G)
    o['starveTurns']=sum(x['starve'] for g in G for x in g['turns']);o['brokeTurns']=sum(x['broke'] for g in G for x in g['turns']);o['turns']=tot
    o['starveGames']=sum(1 for g in G if any(x['starve'] for x in g['turns']));o['brokeGames']=sum(1 for g in G if any(x['broke'] for x in g['turns']))
    # atıl: stok / brüt gelir oranı (tur 20-60 ortalaması), stok > 10 turluk gelir olan tur oranı
    idle={}
    for r in RS:
        rat=[];hi=0;cnt=0;zero=0
        for g in G:
            for x in g['turns']:
                if 15<=x['t']<=60:
                    gn=max(x['gross'][r]-x['up'].get(r,0),0.01);rat.append(x['pre'][r]/gn);cnt+=1
                    if x['pre'][r]>10*max(gn,1):hi+=1
        idle[r]={'stok_per_net_gelir':round(st.median(rat),1) if rat else None,'>10tur_birikmis_oran':round(hi/cnt,2) if cnt else None}
    o['idle']=idle
    # tesis sv. & kademe
    mh=[0]*6;ml=[]
    first_mil={k:[] for k in range(2,6)}
    reach_mil={k:0 for k in range(2,6)}
    for g in G:
        seen={}
        for x in g['turns']:
            for k in range(2,6):
                if x['milh'][k]>0 and k not in seen:seen[k]=x['t']
        for k in range(2,6):
            if k in seen:first_mil[k].append(seen[k]);reach_mil[k]+=1
    o['mil']={k:{'oyun_orani':round(reach_mil[k]/n,2),'ilk_tur':mean(first_mil[k])} for k in range(2,6)}
    # son durumdaki kademe dağılımı (son tur)
    dist=[0]*6
    for g in G:
        x=g['turns'][-1];
        for k in range(6):dist[k]+=x['milh'][k]
    o['mil_son_dagilim']=dist
    # tesis türü: oyun ortası (t=40) ve son
    for T in ('40','son'):
        fc={};fl={}
        for g in G:
            x=g['turns'][-1] if T=='son' else next((y for y in g['turns'] if y['t']==40),None)
            if not x:continue
            for k,v in x['fc'].items():fc[k]=fc.get(k,0)+v;fl[k]=fl.get(k,0)+x['fl'][k]
        o['tesis_'+T]={k:{'adet_ort':round(fc[k]/n,1),'sv_ort':round(fl[k]/fc[k],2)} for k in fc}
    # teknoloji
    br=['sal','sav','kus','eko','ure','str'];tf={b:{t:[] for t in range(1,5)} for b in br}
    final={b:0 for b in br}
    for g in G:
        for bi,b in enumerate(br):
            seen={}
            for x in g['turns']:
                for t in range(1,5):
                    if x['tech'][bi]>=t and t not in seen:seen[t]=x['t']
            for t,v in seen.items():tf[b][t].append(v)
            final[b]+=g['turns'][-1]['tech'][bi]
    o['tech']={b:{'ort_final':round(final[b]/n,2),**{f'K{t}':{'oran':round(len(tf[b][t])/n,2),'ilk_tur':mean(tf[b][t])} for t in range(1,5)}} for b in br}
    # birlikler
    rec={k:0 for k in ('piy','okc','suv','kus','yen')};atk={k:0 for k in rec};man={k:0 for k in rec}
    for g in G:
        for k in rec:rec[k]+=g['end']['rec'][k] if g['end'] else g['turns'][-1] and 0
        for x in g['turns']:
            for k in rec:atk[k]+=x['attU'][k];man[k]+=x['man'][k]
    tr=sum(rec.values()) or 1;ta=sum(atk.values()) or 1
    o['birlik']={k:{'uretilen_pay':round(rec[k]/tr,3),'saldiriya_gonderilen_pay':round(atk[k]/ta,3),'uretilen_ort':round(rec[k]/n,1),'manuel_pay':round(man[k]/rec[k],2) if rec[k] else None} for k in rec}
    # tempo
    dens=[];wait=[];nopt=[];noact=0;cnt=0;cat=[]
    by={}
    for g in G:
        for x in g['turns']:
            if x['t']<=25:
                a=x['act'];tot=a['res']+a['fup']+a['fnew']+a['mil']+a['sur']+a['rec']+a['atk']
                op=g['opts'].get(str(x['t']))
                if op:
                    k=sum(1 for v in op.values() if v>0);tot_o=sum(op.values())
                    by.setdefault(x['t'],{'cats':[],'tot':[],'act':[],'noopt':0,'noact':0,'n':0})
                    b=by[x['t']];b['cats'].append(k);b['tot'].append(tot_o);b['act'].append(tot);b['n']+=1
                    if k==0:b['noopt']+=1
                    if tot==0:b['noact']+=1
    o['tempo']={t:{'secenek_kategori':mean(b['cats']),'toplam_secenek':mean(b['tot']),'tur_basi_eylem':mean(b['act']),'secenek_yok_orani':round(b['noopt']/b['n'],2),'eylemsiz_tur_orani':round(b['noact']/b['n'],2)} for t,b in sorted(by.items())}
    # ilan / temizlik
    dt=[];cl=[];dr=[];
    for g in G:
        d=next((x['t'] for x in g['turns'] if x.get('dok')),None)
        if d:dt.append(d)
        if d and g['end'] and g['end']['over']=='win':cl.append(g['end']['turn']-d)
    blk={}
    for g in G:
        for x in g['turns']:
            if 10<=x['t']<=70 and x.get('blk') is not None:
                for q in (x['blk'] or ['yok']):blk[q]=blk.get(q,0)+1
    tt=sum(1 for g in G for x in g['turns'] if 10<=x['t']<=70)
    o['kademe_engel']={q:round(v/tt,2) for q,v in sorted(blk.items(),key=lambda a:-a[1])}
    o['ilan']={'n_cleanup':len(cl),'ilan_acilan_oyun':len(dt),'ilk_ilan_turu':mean(dt),'zafere_kadar_kalan_tur(ortalama)':mean(cl),'zafer_oyunu':sum(1 for g in G if g['end'] and g['end']['over']=='win')}
    # bölge eğrisi: ilk tur 25/50/75 -> rows
    rows=job['rows'];o['t25']=mean([r['t25'] for r in rows if r['t25']]);o['t50']=mean([r['t50'] for r in rows if r['t50']]);o['t75']=mean([r['t75'] for r in rows if r['t75']])
    o['avgEnd']=job['s']['avgEnd'];o['avgWinEnd']=job['s']['avgWinEnd']
    o['final_eko']={'own':mean([g['end']['own'] for g in G if g['end']]),'pop':mean([g['turns'][-1]['pop'] for g in G]),'troops':mean([g['turns'][-1]['troops'] for g in G]),'techsum':mean([sum(g['turns'][-1]['tech']) for g in G])}
    o['gross_final']={r:mean([g['turns'][-1]['gross'][r] for g in G]) for r in RS}
    o['loot_ort']=mean([g['end']['loot'] for g in G if g['end']])
    OUT[job['name']]=o
json.dump(OUT,open(f'{SP}/eana_{sys.argv[1]}.json','w'),ensure_ascii=False)
print('ok',list(OUT))
