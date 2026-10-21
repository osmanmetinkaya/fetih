# python3 econ-jobs.py -> SP/ejobs_pol.json, ejobs_sens.json
import json
SP='/private/tmp/claude-501/-Users-osman/43ff13d3-c66b-4b6c-9bc1-b657fa0f123e/scratchpad'
SEEDS=[11,22,33,44,55,66,77,88,99,111,123,234,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324]
base=dict(seeds=SEEDS,difficulty='kalfa',dynasty='klasik',maxTurns=150)
def sim(bot=None,**k):
    d=dict(base);d.update(k)
    if bot:d['bot']=bot
    return d
# politika yamaları (iframe)
UNITSET=lambda kind,mn:("{const _r=recruit;recruit=function(i,k,n){if(k==='piy'&&S.regions[i].mil>=%d)k='%s';return _r.call(this,i,k,n)};const _e=endTurn;endTurn=function(){for(const i of own()){const r=S.regions[i];if(r.mil>=%d)r.autoU='%s'}return _e.apply(this,arguments)}}"%(mn,kind,mn,kind))
pol=[
 dict(name='a_referans',sim=sim(),pre=''),
 dict(name='b_ekonomi',sim=sim(bot=dict(upTahil=25,newTahil=25,milAltin=250,milFrontOwn=8,atkCh=.9,minReady=8,resMul=6,wStart={'tarla':2,'pazar':1.5,'medrese':1.5},wNew={'tarla':1.6,'pazar':1.4,'medrese':1.2},okcP=.1)),pre=''),
 dict(name='c_askeri_rush',sim=sim(bot=dict(milAltin=25,milFrontOwn=1,atkCh=.6,minReady=3,techMax=3,upTahil=150,newTahil=120,resMul=2,resAdd=0,wNew={'tarla':1.3,'pazar':1.2,'medrese':.3})),pre=''),
 dict(name='d_teknoloji',sim=sim(bot=dict(wStart={'tarla':1.4,'pazar':1.3,'medrese':6},wNew={'medrese':4,'pazar':1.2,'tarla':1.3},atkCh=.85,minReady=6,milAltin=150)),pre=''),
 dict(name='e_kaplumbaga',sim=sim(bot=dict(surMax=5,surTas=15,atkCh=.93,minReady=8,okcMil=2,okcP=.9,milFrontOwn=1)),pre=UNITSET('okc',2)),
 dict(name='f_suvari',sim=sim(bot=dict(milAltin=40,milFrontOwn=2,atkCh=.7,minReady=4,suvAt=3)),pre=UNITSET('suv',3)),
]
for p in pol:p['tel']=True
json.dump(pol,open(SP+'/ejobs_pol.json','w'))
# duyarlılık (ref bot, tek yama): teldeğil
def S(name,pre):return dict(name=name,sim=sim(),pre=pre,tel=False)
sens=[S('ref',''),]
def mul(code_pos,code_neg,label):
    sens.append(S(label+'+20',code_pos));sens.append(S(label+'-20',code_neg))
f=lambda m:'for(const k in FIELD)FIELD[k].base*=%s;'%m
mul(f(1.2),f(.8),'FIELD.base')
l=lambda m:'for(let i=2;i<LVM.length;i++)LVM[i]=1+(LVM[i]-1)*%s;'%m
mul(l(1.2),l(.8),'LVM(Sv2-5 kazanci)')
u=lambda m:'for(const k in UNITS)for(const r in UNITS[k].cost)UNITS[k].cost[r]*=%s;'%m
mul(u(1.2),u(.8),'UNITS.cost')
t=lambda m:'for(let i=0;i<TCOST.length;i++)TCOST[i]=Math.round(TCOST[i]*%s);'%m
mul(t(1.2),t(.8),'TCOST')
m_=lambda m:'for(let i=1;i<MIL.length;i++)for(const r in MIL[i].cost)MIL[i].cost[r]=Math.round(MIL[i].cost[r]*%s);'%m
mul(m_(1.2),m_(.8),'MIL.cost')
a=lambda m:'for(let i=1;i<MIL.length;i++)MIL[i].auto=Math.max(1,Math.round(MIL[i].auto*%s));'%m
mul(a(1.2),a(.8),'MIL.auto')
lo=lambda m:'{const _l=lootStore;lootStore=function(){const s=_l.apply(this,arguments);for(const k in s)s[k]*=%s;return s}}'%m
mul(lo(1.3),lo(.7),'lootStore(+-30)')
pg=lambda m:'{const _p=popGrowth;popGrowth=function(){return _p.apply(this,arguments)*%s}}'%m
mul(pg(1.3),pg(.7),'popGrowth(+-30)')
up=lambda m:'{const _e=economy;economy=function(){const e=_e.apply(this,arguments);const m=%s;e.up.tahil*=m;e.up.altin*=m;e.net.tahil=e.gross.tahil-e.up.tahil;e.net.altin=e.gross.altin-e.up.altin;return e}}'%m
# yukarıdaki ek terim 0: vasal haracı gross'a dahil olduğundan net = gross-up
mul(up(1.2),up(.8),'upkeep(ordu gideri)')
ai=lambda m:'DIFFS.kalfa.aiGain*=%s;'%m
mul(ai(1.2),ai(.8),'AI aiGain(referans)')
# tek kaynak
for k in ['tarla','kereste','tasocagi','demir','pazar','medrese']:
    sens.append(S('base_%s-30'%k,'FIELD.%s.base*=.7;'%k))
for s in sens:s['tel']=False
json.dump(sens,open(SP+'/ejobs_sens.json','w'))
print(len(pol),len(sens))
