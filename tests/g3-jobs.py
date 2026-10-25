# python3 tests/g3-jobs.py AD [src] [blok] → AD.json: G3 ölçüm işleri (usta-run.mjs). blok: 'all' (varsayılan) = G2 matrisi (4 zorluk × Klasik/Börü/Kartal × 48 tohum Normal × usta/ref + Kalfa/Klasik Kısa/Uzun)
# + deniz bloğu; 'sea' = yalnız deniz bloğu (Kalfa × {Körfez/Klasik, Kıta/Deniz Beyleri, Körfez/Deniz Beyleri} × 48 tohum × usta/ref). Ad: bot|zorluk|hanedan|boy+parça (deniz: boy alanı 'korfez'/'kita'+'D')
import json,sys
name=sys.argv[1];src=sys.argv[2] if len(sys.argv)>2 else '../index.html?test=1';blk=sys.argv[3] if len(sys.argv)>3 else 'all';J=[];seeds=list(range(1001,1049))
def add(b,d,dy,sz,mt='kita',tag=None):
  for p in range(0,48,12):
    sim={'seeds':seeds[p:p+12],'difficulty':d,'dynasty':dy,'size':sz,'mapType':mt,'maxTurns':280 if sz=='uzun' else 240,'tel':True,'altChoice':'devam','src':src+'&j=%d'%len(J)}
    if b=='usta':sim['bot']={'profile':'usta'}
    J.append({'name':f'{b}|{d}|{dy}|{tag or sz}{p//12}','sim':sim})
for b in ['usta','ref']:
  if blk=='all':
    for d in ['cirak','kalfa','usta','destan']:
      for dy in ['klasik','boru','kartal']:add(b,d,dy,'orta')
    for sz in ['kisa','uzun']:add(b,'kalfa','klasik',sz)
  add(b,'kalfa','klasik','orta','korfez','korfezD');add(b,'kalfa','deniz','orta','kita','kitaD');add(b,'kalfa','deniz','orta','korfez','korfezD')
json.dump(J,open(name+'.json','w'));print(len(J))
