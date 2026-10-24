# python3 tests/g1-jobs.py AD tohumSayısı zorluklar hanedanlar botlar 'varyant[@zorluk]=iframe js yaması' ... → AD.json (usta-run.mjs işi). Her iş benzersiz src ile taze iframe alır (yama sızmaz).
import json,sys,subprocess
# var.py NAME nseeds diffs dyns bots 'vname=js' ...
name,ns,diffs,dyns,bots=sys.argv[1],int(sys.argv[2]),sys.argv[3].split(','),sys.argv[4].split(','),sys.argv[5].split(',')
V=[a.split('=',1) for a in sys.argv[6:]];J=[]
seeds=list(range(1001,1001+ns))
for vn,pre in V:
 for b in bots:
  for d in ([vn.split('@')[1]] if '@' in vn else diffs):
   for dy in dyns:
    for p in range(0,ns,12):
     sim={'seeds':seeds[p:p+12],'difficulty':d,'dynasty':dy,'size':'orta','maxTurns':240,'tel':True,'altChoice':'devam'}
     sim['src']='../index.html?test=1&j=%d'%len(J)
     if b=='usta':sim['bot']={'profile':'usta'}
     J.append({'name':f'{b}|{d}|{vn.split("@")[0]}|orta{p//12}','sim':sim,'pre':pre or 'void 0'})
json.dump(J,open(name+'.json','w'));print(len(J))
