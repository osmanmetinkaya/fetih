// node cdp.mjs <port> <jsfile> <outfile> : başsız Chrome'da tests/index.html açar, jsfile içeriğini (async ifade, string döner) çalıştırır
import {spawn} from 'node:child_process';import fs from 'node:fs';
const [port,jsf,outf]=process.argv.slice(2);const dir=`/private/tmp/claude-501/-Users-osman/43ff13d3-c66b-4b6c-9bc1-b657fa0f123e/scratchpad/chr${port}`;
const ch=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new',`--remote-debugging-port=${port}`,`--user-data-dir=${dir}`,'--no-first-run','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let tabs;
for(let i=0;i<60;i++){try{tabs=await (await fetch(`http://127.0.0.1:${port}/json`)).json();if(tabs.length)break}catch(e){}await sleep(250)}
const t=tabs.find(x=>x.type==='page');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id)}};
const call=(method,params)=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
await call('Page.enable');await call('Page.navigate',{url:(process.env.URL||'http://localhost:8123/tests/index.html')+'?cdp='+Date.now()});if(process.env.MOB)await call('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await sleep(1500);
const expr=fs.readFileSync(jsf,'utf8');
const r=await call('Runtime.evaluate',{expression:`(async()=>{${expr}})()`,awaitPromise:true,returnByValue:true,timeout:3600000});
fs.writeFileSync(outf,r.result&&r.result.result&&typeof r.result.result.value==="string"?r.result.result.value:JSON.stringify(r).slice(0,3000));
ws.close();ch.kill();process.exit(0);
