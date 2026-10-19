// Fetih bot simülasyonu: ../index.html'i gizli bir iframe'de yükler, oyunun global fonksiyonlarıyla botu oynatır.
// Kullanım (tarayıcı konsolu ya da javascript_tool): await runSim({seeds:[11,22],maxTurns:140})
'use strict';
(function(){
const DEF_SEEDS=[11,22,33,44,55,66,77,88,99,111,123,234];
// Bot ayarları: varsayılanlar referans bot2 ile birebir aynıdır.
const DEF_BOT={wStart:{tarla:1.6,pazar:1.5,medrese:2},wNew:{medrese:1.4,pazar:1.2,tarla:1.3},techMax:4,
 upTahil:80,newTahil:60,milAltin:60,milFrontOwn:4,suvAt:3,surMax:2,surTas:60,resMul:4,resAdd:20,okcMil:2,okcP:.3,popKeep:.5,minReady:4,atkCh:.75};
// Oyun ayarı: dynasty (klasik|boru|tunc|kartal|bilge|deniz|akinci), cards ([kart id'leri]), mapType (kita|vadi|dag|korfez), difficulty (cirak|kalfa|usta|destan), size (kisa|orta|uzun).
// Varsayılan = Klasik + kart yok + Kıta + Normal + Çırak (Faz 0 oyunu).
const DEF={seeds:DEF_SEEDS,maxTurns:140,src:'../index.html?test=1&t='+Date.now(),seedRandom:true,fast:true,slice:8,bot:{},onProgress:null,timeoutMs:15000,
 dynasty:'klasik',cards:[],mapType:'kita',difficulty:'cirak',size:'orta',dice:false};

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
 // Eski sürümlerle uyum: tcost/fundCost/rnd yoksa Faz 0 karşılıkları
 const TC=k=>typeof tcost==='function'?tcost(k):TCOST[k],FC=k=>typeof fundCost==='function'?fundCost(k):FIELD[k].fund;
 return async function bot2(seed,maxT,C,tick,cfg){newGame(seed,cfg);const cap=capIdx(),brnd=mulberry32(seed*7919+13);
  const pick=Object.keys(FIELD).map(k=>({k,v:fieldOut(cap,{t:k,lv:1})*(C.wStart[k]||1)})).sort((a,b)=>b.v-a.v);
  for(const p of pick){if(S.fund>=FC(p.k))buyStart(p.k)}if(!S.regions[cap].fields.length&&typeof autoSetup==='function')autoSetup();finishSetup();closeModal();
  let t25=null,t50=null,t75=null,acts=0,fam=0,coal=0,akin=0;const P=MAP.playN,errs=[];
  for(let k=0;k<maxT&&!S.over;k++){const e=economy();
   for(const b of ['ure','eko','sal','sav','str','kus'].filter(b=>S.tech[b]<C.techMax).sort((a,b)=>S.tech[a]-S.tech[b])){if(S.res.bilgi>=TC(S.tech[b])){research(b,S.tech[b]);acts++}}
   own().forEach(i=>{const r=S.regions[i];r.fields.forEach((f,j)=>{if(S.res.tahil>C.upTahil){const b4=f.lv;upgradeField(i,j);if(f.lv>b4)acts++}});
    if(r.fields.length<slots(i)&&S.res.tahil>C.newTahil){const have=new Set(r.fields.map(f=>f.t));const best=Object.keys(FIELD).filter(t=>!have.has(t)).map(t=>({t,v:fieldEff(i,t)*(C.wNew[t]||1)})).sort((a,b)=>b.v-a.v)[0];if(best){buildField(i,best.t);acts++}}});
   own().forEach(i=>{const r=S.regions[i],front=MAP.regions[i].adj.some(j=>S.regions[j].owner!==0);const m0=r.mil;if(S.res.altin>C.milAltin&&(r.capital||r.mil||(front&&own().length>=C.milFrontOwn)))upgradeMil(i);if(r.mil!==m0)acts++;
    if(r.mil>=C.suvAt)r.autoU=MAP.regions[i].adj.some(j=>S.regions[j].owner>0&&['ova','vadi'].includes(MAP.regions[j].terrain))?'suv':'piy';
    if(front&&r.fort<C.surMax&&S.res.tas>C.surTas){buildSur(i);acts++}});
   const reserve=e.up.altin*C.resMul+C.resAdd;own().forEach(i=>{const r=S.regions[i];if(r.mil&&S.res.altin>reserve){recruit(i,r.mil>=C.okcMil&&brnd()<C.okcP?'okc':'piy',Math.max(0,Math.floor(S.regions[i].pop-maxPop(i)*C.popKeep)));acts++}});
   const atk=i=>{const r=S.regions[i];const tg=MAP.regions[i].adj.filter(j=>S.regions[j].owner>0&&(typeof canAttack!=='function'||canAttack(i,j))).map(j=>({j,p:previewAtk(i,j,{...r.rd})})).sort((a,b)=>b.p.ch-a.p.ch);
    for(const t of tg){if(r.ready<C.minReady)break;if(S.regions[t.j].owner===0)continue;const p=previewAtk(i,t.j,{...r.rd});if(p.ch>C.atkCh){const x=resolve(0,i,t.j,{...r.rd});if(x&&x.akin)akin++;acts+=2;checkEnd()}}};
   const o0=own();o0.forEach(atk);
   // yeni fethedilen ve hazır askeri olan bölgeler (Börü Akın'ı); Klasik'te böyle bölge yoktur
   own().filter(i=>!o0.includes(i)&&S.regions[i].ready>=C.minReady).forEach(atk);
   own().forEach(i=>{const r=S.regions[i];const fr=MAP.regions[i].adj.some(j=>S.regions[j].owner!==0);if(!fr&&r.ready>0){const j=MAP.regions[i].adj.find(j=>S.regions[j].owner===0&&MAP.regions[j].adj.some(q=>S.regions[q].owner!==0));if(j!=null){const A={...r.rd};remU(r,A,true);addU(S.regions[j],A,false);acts++}}});
   const c0=S.coal&&S.coal.on;endTurn();closeModal();fam+=famineNow();if(S.coal&&S.coal.on&&!c0)coal++;const n=own().length;if(n>=P*.25&&!t25)t25=S.turn;if(n>=P*.5&&!t50)t50=S.turn;if(n>=P*.75&&!t75)t75=S.turn;
   const bad=check(seed);if(bad.length&&errs.length<5)errs.push({tur:S.turn,tip:'invariant',m:bad.slice(0,4).join(', ')});
   if(tick&&k%tick.every===tick.every-1)await tick.fn(S.turn)}
  return{seed,end:S.turn,over:S.over||'-',own:own().length,playN:P,t25,t50,t75,famine:fam,coal,akin,acts:+(acts/S.turn).toFixed(2),errors:errs}}
}

// ---- dış taraf ----
// slice:0 → turlar arasında bekleme yok; tohumlar arasında MessageChannel ile nefes alınır (gizli sekmede setTimeout kısıtlanır, bu kısıtlanmaz)
let NOSLEEP=false;const yieldMC=()=>new Promise(r=>{const c=new MessageChannel();c.port1.onmessage=()=>r();c.port2.postMessage(0)});
const sleep=ms=>NOSLEEP?yieldMC():new Promise(r=>setTimeout(r,ms));
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
 const say=m=>{if(prog)prog.textContent=m;if(o.onProgress)o.onProgress(m)};NOSLEEP=!o.slice;
 const t0=performance.now(),rows=[],LEAK={n:0};let fatal=null;
 try{const win=await getFrame(o.src,o.timeoutMs);
  const bot2=win.eval('('+botFactory.toString()+')()');
  // hızlı kip: refresh yalnızca oyun mantığını etkileyen görüşü günceller, çizim/panel atlanır
  if(o.fast)win.eval('refresh=function(){computeVision()}');else win.refresh=FRAME.orig.refresh;
  const hasRnd=win.eval('typeof rnd==="function"'),cfg={dyn:o.dynasty,muts:o.cards||[],map:o.mapType,size:o.size,diff:o.difficulty,dice:o.dice};
  for(let s=0;s<o.seeds.length;s++){const seed=o.seeds[s],ts=performance.now();
   // Yeni sürümde oyun RNG'si S.rs ile zaten belirlenimci: Math.random'a giden her çağrı bir sızıntıdır (sayılır). Eski sürümde (rnd yok) seedRandom Math.random'ı sabitler.
   if(hasRnd){const R=FRAME.orig.random;win.Math.random=function(){LEAK.n++;return R.call(this)}}else if(o.seedRandom)win.Math.random=win.eval('mulberry32')(seed*7919+13);else win.Math.random=FRAME.orig.random;
   say(`Tohum ${seed} (${s+1}/${o.seeds.length}) başlıyor…`);let r;
   try{r=await bot2(seed,o.maxTurns,C,o.slice&&{every:o.slice,fn:async t=>{say(`Tohum ${seed} (${s+1}/${o.seeds.length}) · yıl ${t}`);await sleep(0)}},cfg)}
   catch(e){r={seed,end:win.eval('S&&S.turn'),over:'-',own:null,errors:[{tip:'istisna',m:String(e&&e.stack||e).slice(0,300)}]}}
   r.ms=Math.round(performance.now()-ts);rows.push(r);if(out)out.innerHTML=table(rows);await sleep(0)}
  win.Math.random=FRAME.orig.random;win.refresh=FRAME.orig.refresh;
 }catch(e){fatal=String(e&&e.stack||e)}
 const wins=rows.filter(r=>r.over==='win'),ends=rows.map(r=>r.end).filter(v=>v!=null),errN=rows.reduce((s,r)=>s+(r.errors?r.errors.length:0),0);
 const avg=a=>a.length?+(a.reduce((s,v)=>s+v,0)/a.length).toFixed(1):null;
 const sum={n:rows.length,win:wins.length,lose:rows.filter(r=>r.over==='lose').length,winRate:rows.length?+(wins.length/rows.length).toFixed(3):0,
  avgEnd:avg(ends),avgWinEnd:avg(wins.map(r=>r.end)),minWinEnd:wins.length?Math.min(...wins.map(r=>r.end)):null,maxWinEnd:wins.length?Math.max(...wins.map(r=>r.end)):null,
  avgT50:avg(rows.map(r=>r.t50).filter(v=>v!=null)),avgT25:avg(rows.map(r=>r.t25).filter(v=>v!=null)),avgFamine:avg(rows.map(r=>r.famine||0)),avgActs:avg(rows.map(r=>r.acts||0)),coalGames:rows.filter(r=>r.coal).length,errors:errN,fatal,randLeak:LEAK.n,
  ms:Math.round(performance.now()-t0),gameVersion:FRAME&&FRAME.ver,opts:{seeds:o.seeds,maxTurns:o.maxTurns,fast:o.fast,dynasty:o.dynasty,cards:o.cards,mapType:o.mapType,difficulty:o.difficulty,size:o.size,dice:o.dice,bot:C}};
 const res={summary:sum,rows,when:new Date().toISOString()};window.SIM_RESULT=res;
 if(out)out.innerHTML=summaryHtml(sum)+table(rows);say(fatal?'Hata: '+fatal:`Bitti: ${sum.win}/${sum.n} kazanma, ${(sum.ms/1000).toFixed(1)} sn`);return res}

const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function table(rows){return'<table><tr><th>Tohum</th><th>Bitiş turu</th><th>Sonuç</th><th>Bölge</th><th>%25</th><th>%50</th><th>%75</th><th>Kıtlık</th><th>Eylem/tur</th><th>Hata</th><th>ms</th></tr>'+
 rows.map(r=>`<tr class="${r.over}"><td>${r.seed}</td><td>${r.end??'—'}</td><td>${r.over}</td><td>${r.own??'—'}/${r.playN??'—'}</td><td>${r.t25??'—'}</td><td>${r.t50??'—'}</td><td>${r.t75??'—'}</td><td>${r.famine??'—'}</td><td>${r.acts??'—'}</td><td title="${esc((r.errors||[]).map(e=>e.tip+' @'+(e.tur??'?')+': '+e.m).join('\n'))}">${(r.errors||[]).length}</td><td>${r.ms}</td></tr>`).join('')+'</table>'}
function summaryHtml(s){return`<p class=sum><b>Kazanma:</b> ${s.win}/${s.n} (${Math.round(s.winRate*100)}%) · <b>Kayıp:</b> ${s.lose} · <b>Ort. bitiş:</b> ${s.avgEnd} · <b>Kazanılan oyunlarda tur:</b> ${s.avgWinEnd} (${s.minWinEnd}–${s.maxWinEnd}) · <b>Ort. %50:</b> ${s.avgT50} · <b>Ort. kıtlık:</b> ${s.avgFamine} · <b>Eylem/tur:</b> ${s.avgActs} · <b>Hata:</b> ${s.errors} · ${(s.ms/1000).toFixed(1)} sn</p>${s.fatal?`<pre class=bad>${esc(s.fatal)}</pre>`:''}`}

// Harita özeti: aynı tohum + ayar → aynı özet. map-hashes.json Faz 0 genMap çıktısıdır.
function mapHash(M){let h=2166136261>>>0;const add=v=>{h^=(v&0xffff);h=Math.imul(h,16777619)>>>0;h^=(v>>>16)&0xffff;h=Math.imul(h,16777619)>>>0};const s=str=>{for(const c of String(str))add(c.charCodeAt(0))};
 add(M.n);add(M.playN);for(let p=0;p<M.ids.length;p+=7)add(M.ids[p]+1);for(const r of M.regions){s(r.terrain);s(r.feat||'-');s(r.name);for(const j of r.adj)add(j);add(Math.round(r.lx*10));add(Math.round(r.ly*10))}add(M.rivers.length);for(const c of M.cross.values())add(c.bridge?1:0);return (h>>>0).toString(16)}
// Klasik/Kıta/Normal haritaları ve başlangıç durumu Faz 0 ile aynı mı?
async function checkMaps(src){const win=await getFrame(src||DEF.src,DEF.timeoutMs),ref=await fetch('map-hashes.json?t='+Date.now()).then(r=>r.json()),out={same:0,diff:[],init:{same:0,diff:[]}};
 const mh=win.eval('('+mapHash.toString()+')');for(const sd in ref.maps){const M=win.genMap(+sd);if(mh(M)===ref.maps[sd].h)out.same++;else out.diff.push(sd)}
 const ih=win.eval(`(function(seed){MAP=genMap(seed);initGame(seed);let h=0;for(const c of JSON.stringify(S.regions.map(r=>[r.owner,r.u,r.fort,r.capital?1:0,r.mil,Math.round(r.pop*1000),r.base])))h=(Math.imul(h,31)+c.charCodeAt(0))|0;return h>>>0})`);
 for(const sd in ref.init){if(ih(+sd)===ref.init[sd])out.init.same++;else out.init.diff.push(sd)}return out}
// Uzun ölçümler için: simJob(isim, [{...seçenek}, ...]) arka planda sırayla koşar, sonuç window.JOBS[isim]'de birikir
window.JOBS={};async function simJob(name,list){const J=JOBS[name]={done:0,total:list.length,res:[],fin:false};for(const o of list){const r=await runSim(Object.assign({slice:0},o));J.res.push({o:Object.fromEntries(Object.entries(o).filter(([k])=>k!=='bot')),s:r.summary,rows:r.rows.map(({ms,...x})=>x)});J.done++}J.fin=true;return J}
window.simJob=simJob;window.runSim=runSim;window.mapHash=mapHash;window.checkMaps=checkMaps;window.simFrame=()=>FRAME&&FRAME.win;window.SIM_DEFAULTS={...DEF,bot:DEF_BOT};
})();
