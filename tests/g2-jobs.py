# python3 tests/g2-jobs.py AD [src] → AD.json: G2 tam ölçüm işleri (usta-run.mjs): 4 zorluk × Klasik/Börü/Kartal × 48 tohum (Normal) × usta/ref + Kalfa/Klasik Kısa/Uzun. Ad: bot|zorluk|hanedan|boy+parça
import json,sys
name=sys.argv[1];src=sys.argv[2] if len(sys.argv)>2 else '../index.html?test=1';J=[];seeds=list(range(1001,1049))
def add(b,d,dy,sz):
  for p in range(0,48,12):
    sim={'seeds':seeds[p:p+12],'difficulty':d,'dynasty':dy,'size':sz,'maxTurns':280 if sz=='uzun' else 240,'tel':True,'altChoice':'devam','src':src+'&j=%d'%len(J)}
    if b=='usta':sim['bot']={'profile':'usta'}
    J.append({'name':f'{b}|{d}|{dy}|{sz}{p//12}','sim':sim})
for b in ['usta','ref']:
  for d in ['cirak','kalfa','usta','destan']:
    for dy in ['klasik','boru','kartal']:add(b,d,dy,'orta')
  for sz in ['kisa','uzun']:add(b,'kalfa','klasik',sz)
json.dump(J,open(name+'.json','w'));print(len(J))
