# python3 tests/g3-var.py AD 'ad1@zorluk1,zorluk2=iframe yaması' ... → AD.json: G3 varyant işleri (usta bot, Klasik/Börü/Kartal × 48 tohum Normal; tel:true)
# Yama oyunun iframe'inde koşudan önce çalışır (ör. 'denizsiz=SEA.ai.max=0;SEA.ai.maxT=0;SEA.ai.maxD=0'); her işe benzersiz src verilir (yama sızmaz)
import json,sys
name=sys.argv[1];J=[];seeds=list(range(1001,1049))
for spec in sys.argv[2:]:
  head,pre=spec.split('=',1) if '=' in spec else (spec,'')
  vn,ds=head.split('@') if '@' in head else (head,'kalfa')
  for d in ds.split(','):
    for dy in ['klasik','boru','kartal']:
      for p in range(0,48,12):
        sim={'seeds':seeds[p:p+12],'difficulty':d,'dynasty':dy,'size':'orta','maxTurns':240,'tel':True,'altChoice':'devam','src':'../index.html?test=1&v=%s&j=%d'%(vn,len(J)),'bot':{'profile':'usta'}}
        J.append({'name':f'{vn}|{d}|{dy}|orta{p//12}','sim':sim,**({'pre':pre} if pre else {})})
json.dump(J,open(name+'.json','w'));print(len(J))
