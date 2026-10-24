// Başsız Chrome ile paralel sim koşucusu (usta bot ölçümleri için).
// node tests/usta-run.mjs JOBS.json OUT.json [paralel=8]
//   JOBS = [{name, sim:{runSim seçenekleri}, pre?:"iframe'de eval edilecek js"}, ...]
//   pre kullanan işe benzersiz bir sim.src ver (ör. '../index.html?test=1&j=7'): her iş taze bir iframe alır, yama sonraki işlere sızmaz
//   Ortam: URL (varsayılan http://localhost:8123/tests/index.html), CHROME (Chrome yolu), TMP (profil klasörleri için).
// Her işçi bir Chrome açar ve işleri sırayla çeker; sonuç OUT.json: [{name, sim, s:summary, rows}]
import {spawn} from 'node:child_process';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
const [jf,outf,parS]=process.argv.slice(2);const par=+parS||8;
const URL0=process.env.URL||'http://localhost:8123/tests/index.html',CH=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',TMP=process.env.TMP||os.tmpdir();
const jobs=JSON.parse(fs.readFileSync(jf,'utf8')),res=new Array(jobs.length).fill(null);let next=0,done=0;const t0=Date.now();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function worker(w){const port=9400+w+(process.pid%50)*12,dir=path.join(TMP,'uchr'+port);
 const ch=spawn(CH,['--headless=new',`--remote-debugging-port=${port}`,`--user-data-dir=${dir}`,'--no-first-run','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','about:blank'],{stdio:'ignore'});
 try{let tabs=[];for(let i=0;i<80;i++){try{tabs=await (await fetch(`http://127.0.0.1:${port}/json`)).json();if(tabs.length)break}catch(e){}await sleep(250)}
  const t=tabs.find(x=>x.type==='page');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id)}};
  const call=(method,params)=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
  await call('Page.enable');await call('Page.navigate',{url:URL0+'?cdp='+Date.now()});await sleep(1500);
  while(next<jobs.length){const k=next++,J=jobs[k];
   const expr=`(async()=>{const J=${JSON.stringify(J)};if(J.pre){await runSim({seeds:[],src:J.sim.src});simFrame().eval(J.pre)}const r=await runSim(Object.assign({slice:0},J.sim));
    const ac=simFrame().eval('typeof SND!=="undefined"&&SND.ctx?1:0');return JSON.stringify({name:J.name,sim:J.sim,s:Object.assign({},r.summary,{opts:undefined}),audio:ac,rows:r.rows.map(({ms,...x})=>x)})})()`;
   const r=await call('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true,timeout:7200000});
   const v=r.result&&r.result.result&&r.result.result.value;try{res[k]=JSON.parse(v)}catch(e){res[k]={name:J.name,err:JSON.stringify(r).slice(0,1500)}}
   done++;const s=res[k].s;process.stdout.write(`[${done}/${jobs.length} ${Math.round((Date.now()-t0)/1000)}s] ${J.name}: `+(s?`${s.win}/${s.n} err ${s.errors} leak ${s.randLeak}${s.fatal?' FATAL '+s.fatal.slice(0,200):''}`:'HATA '+res[k].err.slice(0,300))+'\n')}
  ws.close()}finally{ch.kill()}}
await Promise.all(Array.from({length:Math.min(par,jobs.length)},(_,w)=>worker(w)));
fs.writeFileSync(outf,JSON.stringify(res));console.log('süre',Math.round((Date.now()-t0)/1000),'sn');process.exit(0);
