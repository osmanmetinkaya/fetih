// Fetih bot simülasyonu: ../index.html'i gizli bir iframe'de yükler, oyunun global fonksiyonlarıyla botu oynatır.
// Kullanım (tarayıcı konsolu ya da javascript_tool): await runSim({seeds:[11,22],maxTurns:140})
'use strict';
(function(){
const DEF_SEEDS=[11,22,33,44,55,66,77,88,99,111,123,234];
// Bot ayarları: varsayılanlar referans bot2 ile birebir aynıdır.
const DEF_BOT={wStart:{tarla:1.6,pazar:1.5,medrese:2},wNew:{medrese:1.4,pazar:1.2,tarla:1.3},techMax:4,
 upTahil:80,newTahil:60,milAltin:60,milFrontOwn:4,suvAt:3,surMax:2,surTas:60,resMul:4,resAdd:20,okcMil:2,okcP:.3,popKeep:.5,minReady:4,atkCh:.75};
const DEF={seeds:DEF_SEEDS,maxTurns:140,src:'../index.html?test=1&t='+Date.now(),seedRandom:true,fast:true,slice:8,bot:{},onProgress:null,timeoutMs:15000};

// ---- iframe içinde çalışan kod (toString ile iframe'e aktarılır; serbest adlar oyunun globallerine bağlanır) ----
function botFactory(){
 const sumOK=v=>typeof v==='number'&&isFinite(v);
 function check(seed){const bad=[];
  for(const k in S.res)if(!sumOK(S.res[k]))bad.push(`res.${k}=${S.res[k]}`);
  if(!sumOK(S.morale))bad.push('morale='+S.morale);
  S.regions.forEach((r,i)=>{if(!r.u)return;
   for(const k of UK){if(!sumOK(r.u[k])||r.u[k]<0)bad.push(`r${i}.u.${k}=${r.u[k]}`);if(!sumOK(r.rd[k])||r.rd[k]<0)bad.push(`r${i}.rd.${k}=${r.rd[k]}`)}
   if(r.troops!==sumU(r.u))bad.push(`r${i}.troops=${r.troops}≠${sumU(r.u)}`);
   if(r.owner!==BLOCK&&(!sumOK(r.pop)||r.pop<0))bad.push(`r${i}.pop=${r.pop}`)});
  return bad}
 const famineNow=()=>S.log.filter(l=>l.t===S.turn&&/^Kıtlık/.test(l.m)).length;
 return async function bot2(seed,maxT,C,tick){newGame(seed);const cap=capIdx();
  const pick=Object.keys(FIELD).map(k=>({k,v:fieldOut(cap,{t:k,lv:1})*(C.wStart[k]||1)})).sort((a,b)=>b.v-a.v);
  for(const p of pick){if(S.fund>=FIELD[p.k].fund)buyStart(p.k)}finishSetup();closeModal();
  let t25=null,t50=null,t75=null,acts=0,fam=0;const P=MAP.playN,errs=[];
  for(let k=0;k<maxT&&!S.over;k++){const e=economy();
   for(const b of ['ure','eko','sal','sav','str','kus'].filter(b=>S.tech[b]<C.techMax).sort((a,b)=>S.tech[a]-S.tech[b])){if(S.res.bilgi>=TCOST[S.tech[b]]){research(b,S.tech[b]);acts++}}
   own().forEach(i=>{const r=S.regions[i];r.fields.forEach((f,j)=>{if(S.res.tahil>C.upTahil){const b4=f.lv;upgradeField(i,j);if(f.lv>b4)acts++}});
    if(r.fields.length<slots(i)&&S.res.tahil>C.newTahil){const have=new Set(r.fields.map(f=>f.t));const best=Object.keys(FIELD).filter(t=>!have.has(t)).map(t=>({t,v:fieldEff(i,t)*(C.wNew[t]||1)})).sort((a,b)=>b.v-a.v)[0];if(best){buildField(i,best.t);acts++}}});
   own().forEach(i=>{const r=S.regions[i],front=MAP.regions[i].adj.some(j=>S.regions[j].owner!==0);const m0=r.mil;if(S.res.altin>C.milAltin&&(r.capital||r.mil||(front&&own().length>=C.milFrontOwn)))upgradeMil(i);if(r.mil!==m0)acts++;
    if(r.mil>=C.suvAt)r.autoU=MAP.regions[i].adj.some(j=>S.regions[j].owner>0&&['ova','vadi'].includes(MAP.regions[j].terrain))?'suv':'piy';
    if(front&&r.fort<C.surMax&&S.res.tas>C.surTas){buildSur(i);acts++}});
   const reserve=e.up.altin*C.resMul+C.resAdd;own().forEach(i=>{const r=S.regions[i];if(r.mil&&S.res.altin>reserve){recruit(i,r.mil>=C.okcMil&&Math.random()<C.okcP?'okc':'piy',Math.max(0,Math.floor(S.regions[i].pop-maxPop(i)*C.popKeep)));acts++}});
   own().forEach(i=>{const r=S.regions[i];const tg=MAP.regions[i].adj.filter(j=>S.regions[j].owner>0).map(j=>({j,p:previewAtk(i,j,{...r.rd})})).sort((a,b)=>b.p.ch-a.p.ch);
    for(const t of tg){if(r.ready<C.minReady)break;if(S.regions[t.j].owner===0)continue;const p=previewAtk(i,t.j,{...r.rd});if(p.ch>C.atkCh){resolve(0,i,t.j,{...r.rd});acts+=2;checkEnd()}}});
   own().forEach(i=>{const r=S.regions[i];const fr=MAP.regions[i].adj.some(j=>S.regions[j].owner!==0);if(!fr&&r.ready>0){const j=MAP.regions[i].adj.find(j=>S.regions[j].owner===0&&MAP.regions[j].adj.some(q=>S.regions[q].owner!==0));if(j!=null){const A={...r.rd};remU(r,A,true);addU(S.regions[j],A,false);acts++}}});
   endTurn();closeModal();fam+=famineNow();const n=own().length;if(n>=P*.25&&!t25)t25=S.turn;if(n>=P*.5&&!t50)t50=S.turn;if(n>=P*.75&&!t75)t75=S.turn;
   const bad=check(seed);if(bad.length&&errs.length<5)errs.push({tur:S.turn,tip:'invariant',m:bad.slice(0,4).join(', ')});
   if(tick&&k%tick.every===tick.every-1)await tick.fn(S.turn)}
  return{seed,end:S.turn,over:S.over||'-',own:own().length,playN:P,t25,t50,t75,famine:fam,acts:+(acts/S.turn).toFixed(2),errors:errs}}
}

// ---- dış taraf ----
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let FRAME=null;
async function getFrame(src,timeoutMs){
 if(FRAME&&FRAME.src===src&&FRAME.win)return FRAME.win;
 if(FRAME)FRAME.el.remove();
 const el=document.createElement('iframe');el.style.cssText='position:fixed;left:-12000px;top:0;width:1100px;height:720px;opacity:0;pointer-events:none;border:0';el.setAttribute('aria-hidden','true');
 const loaded=new Promise((res,rej)=>{el.onload=res;el.onerror=rej});el.src=src;document.body.appendChild(el);await loaded;
 const win=el.contentWindow,t0=Date.now();
 // eski (test kipini bilmeyen) sürümlerde açılış yüklemesinin bitmesini bekle
 while(!win.eval('(typeof TEST!=="undefined"&&TEST)||(typeof S!=="undefined"&&!!S&&document.querySelector("#loading").style.display==="none")')){if(Date.now()-t0>timeoutMs)throw Error('iframe açılışı zaman aşımına uğradı');await sleep(50)}
 win.eval('save=function(){};if(typeof saveNow==="function")saveNow=function(){};');
 FRAME={el,src,win,ver:win.eval('typeof GAME_VERSION!="undefined"?GAME_VERSION:"?"'),orig:{refresh:win.eval('refresh'),random:win.Math.random}};return win}

async function runSim(opts={}){
 const o=Object.assign({},DEF,opts),C=Object.assign({},DEF_BOT,o.bot),out=document.getElementById('simOut'),prog=document.getElementById('simProg');
 const say=m=>{if(prog)prog.textContent=m;if(o.onProgress)o.onProgress(m)};
 const t0=performance.now(),rows=[];let fatal=null;
 try{const win=await getFrame(o.src,o.timeoutMs);
  const bot2=win.eval('('+botFactory.toString()+')()');
  // hızlı kip: refresh yalnızca oyun mantığını etkileyen görüşü günceller, çizim/panel atlanır
  if(o.fast)win.eval('refresh=function(){computeVision()}');else win.refresh=FRAME.orig.refresh;
  for(let s=0;s<o.seeds.length;s++){const seed=o.seeds[s],ts=performance.now();
   if(o.seedRandom)win.Math.random=win.eval('mulberry32')(seed*7919+13);else win.Math.random=FRAME.orig.random;
   say(`Tohum ${seed} (${s+1}/${o.seeds.length}) başlıyor…`);let r;
   try{r=await bot2(seed,o.maxTurns,C,{every:o.slice,fn:async t=>{say(`Tohum ${seed} (${s+1}/${o.seeds.length}) · yıl ${t}`);await sleep(0)}})}
   catch(e){r={seed,end:win.eval('S&&S.turn'),over:'-',own:null,errors:[{tip:'istisna',m:String(e&&e.stack||e).slice(0,300)}]}}
   r.ms=Math.round(performance.now()-ts);rows.push(r);if(out)out.innerHTML=table(rows);await sleep(0)}
  win.Math.random=FRAME.orig.random;win.refresh=FRAME.orig.refresh;
 }catch(e){fatal=String(e&&e.stack||e)}
 const wins=rows.filter(r=>r.over==='win'),ends=rows.map(r=>r.end).filter(v=>v!=null),errN=rows.reduce((s,r)=>s+(r.errors?r.errors.length:0),0);
 const avg=a=>a.length?+(a.reduce((s,v)=>s+v,0)/a.length).toFixed(1):null;
 const sum={n:rows.length,win:wins.length,lose:rows.filter(r=>r.over==='lose').length,winRate:rows.length?+(wins.length/rows.length).toFixed(3):0,
  avgEnd:avg(ends),avgWinEnd:avg(wins.map(r=>r.end)),minWinEnd:wins.length?Math.min(...wins.map(r=>r.end)):null,maxWinEnd:wins.length?Math.max(...wins.map(r=>r.end)):null,
  avgT50:avg(rows.map(r=>r.t50).filter(v=>v!=null)),avgFamine:avg(rows.map(r=>r.famine||0)),avgActs:avg(rows.map(r=>r.acts||0)),errors:errN,fatal,
  ms:Math.round(performance.now()-t0),gameVersion:FRAME&&FRAME.ver,opts:{seeds:o.seeds,maxTurns:o.maxTurns,seedRandom:o.seedRandom,fast:o.fast,bot:C}};
 const res={summary:sum,rows,when:new Date().toISOString()};window.SIM_RESULT=res;
 if(out)out.innerHTML=summaryHtml(sum)+table(rows);say(fatal?'Hata: '+fatal:`Bitti: ${sum.win}/${sum.n} kazanma, ${(sum.ms/1000).toFixed(1)} sn`);return res}

const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function table(rows){return'<table><tr><th>Tohum</th><th>Bitiş turu</th><th>Sonuç</th><th>Bölge</th><th>%25</th><th>%50</th><th>%75</th><th>Kıtlık</th><th>Eylem/tur</th><th>Hata</th><th>ms</th></tr>'+
 rows.map(r=>`<tr class="${r.over}"><td>${r.seed}</td><td>${r.end??'—'}</td><td>${r.over}</td><td>${r.own??'—'}/${r.playN??'—'}</td><td>${r.t25??'—'}</td><td>${r.t50??'—'}</td><td>${r.t75??'—'}</td><td>${r.famine??'—'}</td><td>${r.acts??'—'}</td><td title="${esc((r.errors||[]).map(e=>e.tip+' @'+(e.tur??'?')+': '+e.m).join('\n'))}">${(r.errors||[]).length}</td><td>${r.ms}</td></tr>`).join('')+'</table>'}
function summaryHtml(s){return`<p class=sum><b>Kazanma:</b> ${s.win}/${s.n} (${Math.round(s.winRate*100)}%) · <b>Kayıp:</b> ${s.lose} · <b>Ort. bitiş:</b> ${s.avgEnd} · <b>Kazanılan oyunlarda tur:</b> ${s.avgWinEnd} (${s.minWinEnd}–${s.maxWinEnd}) · <b>Ort. %50:</b> ${s.avgT50} · <b>Ort. kıtlık:</b> ${s.avgFamine} · <b>Eylem/tur:</b> ${s.avgActs} · <b>Hata:</b> ${s.errors} · ${(s.ms/1000).toFixed(1)} sn</p>${s.fatal?`<pre class=bad>${esc(s.fatal)}</pre>`:''}`}

window.runSim=runSim;window.SIM_DEFAULTS={...DEF,bot:DEF_BOT};
})();
