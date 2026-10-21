# python3 econ-run.py NAME JOBS.json [paralel=6]
# JOBS = [{"name":..,"sim":{runSim seçenekleri},"pre":"iframe'de eval edilecek js (politika/yama)","tel":true}, ...]
# Her iş ayrı başsız Chrome'da koşar (sunucu: http://localhost:8131). Çıktı: SP/eres_NAME.json
import json,sys,subprocess,os,time
H=os.path.dirname(os.path.abspath(__file__));SP='/private/tmp/claude-501/-Users-osman/43ff13d3-c66b-4b6c-9bc1-b657fa0f123e/scratchpad'
name,jf=sys.argv[1],sys.argv[2];par=int(sys.argv[3]) if len(sys.argv)>3 else 6
jobs=json.load(open(jf));res=[None]*len(jobs);port0=9100+(abs(hash(name))%40)*8
PATCH=open(H+'/econ-patch.js').read()
TPL="""const o=%s;const PATCH=%s;await runSim({seeds:[]});const w=simFrame();w.eval(PATCH);if(o.pre)w.eval(o.pre);
const r=await runSim(Object.assign({slice:0},o.sim));const s=r.summary;
return JSON.stringify({name:o.name,sim:o.sim,s:{win:s.win,n:s.n,rate:s.winRate,lose:s.lose,avgEnd:s.avgEnd,avgWinEnd:s.avgWinEnd,avgT25:s.avgT25,avgT50:s.avgT50,avgFamine:s.avgFamine,errors:s.errors,randLeak:s.randLeak,fatal:s.fatal,ms:s.ms},
 rows:r.rows.map(x=>({sd:x.seed,o:x.over,w:x.winBy,e:x.end,own:x.own,p:x.playN,t25:x.t25,t50:x.t50,t75:x.t75,fam:x.famine,aw:[x.atkWon,x.atkLost,x.defWon,x.defLost],err:x.errors&&x.errors.length})),
 tel:o.tel?w.TEL.map(g=>g):null})"""
def start(k,slot):
    jfn=f"{SP}/_ej_{name}_{k}.js";open(jfn,'w').write(TPL%(json.dumps(jobs[k]),json.dumps(PATCH)))
    env=dict(os.environ,URL='http://localhost:8131/tests/index.html')
    return subprocess.Popen(['node',H+'/econ-cdp.mjs',str(port0+slot),jfn,f'{SP}/_er_{name}_{k}.json'],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
q=list(range(len(jobs)));run={};t0=time.time()
while q or run:
    free=[s for s in range(par) if s not in run]
    while q and free:
        k=q.pop(0);s=free.pop(0);run[s]=(k,start(k,s))
    for s,(k,p) in list(run.items()):
        if p.poll() is not None:
            fn=f'{SP}/_er_{name}_{k}.json'
            try:res[k]=json.load(open(fn))
            except Exception as e:res[k]={'name':jobs[k].get('name'),'err':(open(fn).read()[:500] if os.path.exists(fn) else str(e))}
            del run[s]
    time.sleep(.5)
json.dump(res,open(f'{SP}/eres_{name}.json','w'))
for r in res:
    if 's' not in r: print('ERR',r.get('name'),r.get('err'));continue
    s=r['s'];print(str(r['name']).ljust(22),f"{s['win']}/{s['n']} ({round(s['rate']*100)}%) end {s['avgEnd']} t25 {s['avgT25']} t50 {s['avgT50']} fam {s['avgFamine']} err {s['errors']} leak {s['randLeak']} {s['fatal'] or ''}")
print('süre',round(time.time()-t0),'sn')
