// Fetih bot simülasyonu: ../index.html'i gizli bir iframe'de yükler, oyunun global fonksiyonlarıyla botu oynatır.
// Kullanım (tarayıcı konsolu ya da javascript_tool): await runSim({seeds:[11,22],maxTurns:140})
'use strict';
(function(){
const DEF_SEEDS=[11,22,33,44,55,66,77,88,99,111,123,234];
// Bot ayarları: varsayılanlar referans bot2 ile birebir aynıdır.
const DEF_BOT={wStart:{tarla:1.6,pazar:1.5,medrese:2},wNew:{medrese:1.4,pazar:1.2,tarla:1.3},techMax:4,
 upTahil:80,newTahil:60,milAltin:60,milFrontOwn:4,suvAt:3,surMax:2,surTas:60,resMul:4,resAdd:20,okcMil:2,okcP:.3,popKeep:.5,minReady:4,atkCh:.75,
 // 1b: olay seçimi ('first' = ilk seçilebilir seçenek, 'random' = bot üreteciyle rastgele) ve zafer yolu politikaları
 evPick:'first',medStop:99,medCh:.9,turtle:false,turtleAt:12,wNewMed:{medrese:1.8,tasocagi:1.4,kereste:1.2,pazar:1.2,tarla:1.3},hegCh:.6};
// Oyun ayarı: dynasty (klasik|boru|tunc|kartal|bilge|deniz|akinci), cards ([kart id'leri]), mapType (kita|vadi|dag|korfez), difficulty (cirak|kalfa|usta|destan), size (kisa|orta|uzun).
// Varsayılan = Klasik + kart yok + Kıta + Normal + Çırak (Faz 0 oyunu).
// 1b: goal (fetih|medeniyet|hegemonya: botun izlediği yol), ferman (true: goal'u ferman olarak beyan et), pers (bütün rakiplere tek kişilik), ev/alt (false: olaylar / alternatif zaferler kapalı; Faz 1a karşılaştırması için)
const DEF={seeds:DEF_SEEDS,maxTurns:140,src:'../index.html?test=1&t='+Date.now(),seedRandom:true,fast:true,slice:8,bot:{},onProgress:null,timeoutMs:15000,
 dynasty:'klasik',cards:[],mapType:'kita',difficulty:'cirak',size:'orta',dice:false,goal:'fetih',ferman:false,pers:null,ev:true,alt:true,meta:false,declare:false,cfgExtra:null};

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
 return async function bot2(seed,maxT,C,tick,cfg){newGame(seed,cfg);const cap=capIdx(),brnd=mulberry32(seed*7919+13),goal=C.goal||'fetih',v1b=typeof evAuto==='function',med=goal==='medeniyet'&&v1b,heg=goal==='hegemonya'&&v1b;
  const pick=Object.keys(FIELD).map(k=>({k,v:fieldOut(cap,{t:k,lv:1})*(C.wStart[k]||1)})).sort((a,b)=>b.v-a.v);
  for(const p of pick){if(S.fund>=FC(p.k))buyStart(p.k)}if(!S.regions[cap].fields.length&&typeof autoSetup==='function')autoSetup();finishSetup();closeModal();
  let t25=null,t50=null,t75=null,acts=0,fam=0,coal=0,akin=0,dec=null;const P=MAP.playN,errs=[],wNew=med?C.wNewMed:C.wNew;
  // Medeniyet: Büyük Eser için kaynak ayır (eşik geçildiyse sıradaki aşamanın bedeli harcanmaz)
  const wRes=()=>{if(!med||S.wonder.stage>=5||S.wonder.build||S.medClosed!=null||S.tech.eko<2||(!S.wonder.stage&&own().length<10))return null;return wonderCost()};
  const okSpend=c=>{const r=wRes();if(!r)return true;for(const k in c)if(k!=='tahil'&&k!=='altin'&&r[k]&&S.res[k]-c[k]<r[k])return false;return true};
  const altRes=()=>{const r=wRes();return r&&['tas','odun','bilgi'].every(k=>S.res[k]>=(r[k]||0))?r.altin:0};
  for(let k=0;k<maxT&&!S.over;k++){const e=economy();
   if(med)startWonder();
   const br=['ure','eko','sal','sav','str','kus'].filter(b=>S.tech[b]<C.techMax).sort((a,b)=>S.tech[a]-S.tech[b]||(med?(b==='eko')-(a==='eko'):0));
   for(const b of br){if(S.res.bilgi>=TC(S.tech[b])&&(!med||techCount()<18||okSpend({bilgi:TC(S.tech[b])}))){research(b,S.tech[b]);acts++}}
   own().forEach(i=>{const r=S.regions[i];r.fields.forEach((f,j)=>{if(S.res.tahil>C.upTahil&&(!med||okSpend(upFieldCost(f)))){const b4=f.lv;upgradeField(i,j);if(f.lv>b4)acts++}});
    if(r.fields.length<slots(i)&&S.res.tahil>C.newTahil){const have=new Set(r.fields.map(f=>f.t));const best=Object.keys(FIELD).filter(t=>!have.has(t)).map(t=>({t,v:fieldEff(i,t)*(wNew[t]||1)})).sort((a,b)=>b.v-a.v)[0];if(best&&(!med||okSpend(newFieldCost(best.t)))){buildField(i,best.t);acts++}}});
   own().forEach(i=>{const r=S.regions[i],front=MAP.regions[i].adj.some(j=>S.regions[j].owner!==0);const m0=r.mil;if(S.res.altin>C.milAltin&&(r.capital||r.mil||(front&&own().length>=C.milFrontOwn))&&(!med||r.mil<5&&okSpend(MIL[r.mil+1]?MIL[r.mil+1].cost:{})))upgradeMil(i);if(r.mil!==m0)acts++;
    if(r.mil>=C.suvAt)r.autoU=MAP.regions[i].adj.some(j=>S.regions[j].owner>0&&['ova','vadi'].includes(MAP.regions[j].terrain))?'suv':'piy';
    const sm=med&&own().length>=10?Math.max(C.surMax,maxFort(i)):C.surMax;if(front&&r.fort<sm&&S.res.tas>C.surTas&&(!med||okSpend(surCost(i)))){buildSur(i);acts++}});
   const reserve=e.up.altin*C.resMul+C.resAdd+altRes();own().forEach(i=>{const r=S.regions[i];if(r.mil&&S.res.altin>reserve){recruit(i,r.mil>=C.okcMil&&brnd()<C.okcP?'okc':'piy',Math.max(0,Math.floor(S.regions[i].pop-maxPop(i)*C.popKeep)));acts++}});
   // Hegemonya: tutulmayan eski başkentlere uzaklık (çok kaynaklı BFS); saldırı ve asker kaydırma buna göre
   let dT=null;const hc=heg?hegHeld().filter(x=>x.st==='own').map(x=>x.i):[];if(heg){const tg=hegHeld().filter(x=>x.st==='x').map(x=>x.i);dT=S.heg.count>0&&hc.length?bfs(hc):tg.length?bfs(tg):null}
   const heldCap=i=>hc.includes(i);if(heg)for(const i of hc){while(S.regions[i].fort<maxFort(i)&&canPay(surCost(i))){const f0=S.regions[i].fort;buildSur(i);if(S.regions[i].fort===f0)break;acts++}}
   const mayAtk=()=>!med||(C.turtle?own().length<C.turtleAt:true);
   const atk=i=>{const r=S.regions[i];if(heldCap(i))return;const tg=MAP.regions[i].adj.filter(j=>S.regions[j].owner>0&&(typeof canAttack!=='function'||canAttack(i,j))).map(j=>({j,p:previewAtk(i,j,{...r.rd})})).sort((a,b)=>dT?(dT[a.j]-dT[b.j])||(b.p.ch-a.p.ch):b.p.ch-a.p.ch);
    for(const t of tg){if(r.ready<C.minReady||!mayAtk())break;if(S.regions[t.j].owner===0)continue;const p=previewAtk(i,t.j,{...r.rd});
     const th=med&&own().length>=C.medStop?C.medCh:heg&&dT&&dT[t.j]===0?C.hegCh:C.atkCh;if(p.ch>th){const x=resolve(0,i,t.j,{...r.rd});if(x&&x.akin)akin++;acts+=2;checkEnd()}}};
   const o0=own();o0.forEach(atk);
   // yeni fethedilen ve hazır askeri olan bölgeler (Börü Akın'ı); Klasik'te böyle bölge yoktur
   own().filter(i=>!o0.includes(i)&&S.regions[i].ready>=C.minReady).forEach(atk);
   own().forEach(i=>{const r=S.regions[i];const fr=MAP.regions[i].adj.some(j=>S.regions[j].owner!==0);if(!fr&&r.ready>0){
    let j=MAP.regions[i].adj.find(j=>S.regions[j].owner===0&&MAP.regions[j].adj.some(q=>S.regions[q].owner!==0));
    if(dT){const nb=MAP.regions[i].adj.filter(q=>S.regions[q].owner===0&&dT[q]<dT[i]).sort((a,b)=>dT[a]-dT[b]);if(nb.length)j=nb[0]}
    if(heg&&heldCap(i))j=null;
    if(j!=null){const A={...r.rd};remU(r,A,true);addU(S.regions[j],A,false);acts++}}});
   if(med){const ar=altRes();for(const i of own())S.regions[i].auto=!(ar&&S.res.altin<ar+e.up.altin*2)}
   const c0=S.coal&&S.coal.on;endTurn();closeModal();if(v1b){evAuto(C.evPick==='random'?brnd:'first');closeModal()}
   // 1c: ilk "Zaferi ilan et" anı ve o anda bitirilseydi skoru (meta:true; bot ilan etmez, oynamayı sürdürür). C.declare:true → bot ilk fırsatta ilan eder
   if(C.meta&&typeof declOk==='function'&&!S.over&&dec==null&&declOk()){dec=declProbe();if(C.declare){S.over='win';S.winBy='ilan';S.stats.declared=S.turn}}
   fam+=S.stats?0:famineNow();if(S.coal&&S.coal.on&&!c0)coal++;const n=own().length;if(n>=P*.25&&!t25)t25=S.turn;if(n>=P*.5&&!t50)t50=S.turn;if(n>=P*.75&&!t75)t75=S.turn;
   const bad=check(seed);if(bad.length&&errs.length<5)errs.push({tur:S.turn,tip:'invariant',m:bad.slice(0,4).join(', ')});
   if(tick&&k%tick.every===tick.every-1)await tick.fn(S.turn)}
  const st=S.stats,aiS={};if(v1b)for(const f of S.cfg.ais){const a=S.ai[f],q=aiS[a.per]=aiS[a.per]||{n:0,atk:0,lost:0,end:0};q.n++;q.atk+=a.atk||0;q.lost+=a.lost||0;q.end+=S.regions.filter(r=>r.owner===f).length}
  const mx=C.meta&&typeof scoreOf==='function'?(()=>{const sc=scoreOf(S),m=mpCalc(S,{games:5}),M1=mpCalc(S,{games:0});return{score:sc.v,raw:sc.p.raw,mp:m.game,mpNew:M1.game,share:+m.share.toFixed(3),dec,stats:{surBuilt:st.surBuilt,recruited:st.recruited,famine:st.famine,capLost:st.capLost,coalBroken:st.coalBroken,plagues:st.plagues,loot:Math.round(st.loot),maxHarb:st.maxHarb,evN:st.evN,akinN:st.akinN}}})():null;
  return{...(mx?{meta:mx}:{}),seed,end:S.turn,over:S.over||'-',winBy:S.winBy||null,own:own().length,playN:P,t25,t50,t75,famine:st?st.famine:fam,coal,akin,acts:+(acts/S.turn).toFixed(2),
   ev:st?st.events:null,evN:st?st.evN:null,choices:st?st.choices:null,coalBroken:st?st.coalBroken:null,coalJoin:st?st.coalJoin:null,wonder:v1b?S.wonder.stage:null,aiWonder:v1b?S.aiW.stage:null,medClosed:v1b?S.medClosed!=null:null,
   tech:v1b?techCount():null,hegMax:st?st.hegMax:null,hegHeld:st?st.hegHeld:null,w1:st?st.wonderT:null,wT:st?st.wT||[]:null,capLost:st?st.capLost:null,vassals:st?st.vassals:null,maxReg:st?st.maxRegions:null,atkWon:st?st.atkWon:null,atkLost:st?st.atkLost:null,defWon:st?st.defWon:null,defLost:st?st.defLost:null,
   pers:v1b?S.cfg.ais.map(f=>S.ai[f].per):null,aiS,errors:errs}}
}

// Olay birim testi (iframe içinde): her olayın koşulu sağlanmış olgun bir durum kurulur; her seçenek ayrı bir kopyada uygulanır,
// tutarlılık denetlenir ve 3 yıl oynanır. Dönüş: [{id, cond, opt, m, bad}]
function evUnitFactory(){
 return function(seed){const ok=v=>typeof v==='number'&&isFinite(v),R=()=>S.regions,G=()=>MAP.regions;
  const inv=()=>{const bad=[];for(const k in S.res)if(!ok(S.res[k])||S.res[k]<-1e-6)bad.push('res.'+k+'='+S.res[k]);if(!ok(S.morale)||S.morale<0)bad.push('morale='+S.morale);
   R().forEach((r,i)=>{if(!r.u)return;for(const k of UK)if(!ok(r.u[k])||r.u[k]<0||r.rd[k]>r.u[k])bad.push(`r${i}.${k}`);if(r.troops!==sumU(r.u))bad.push('troops'+i);if(r.owner!==BLOCK&&(!ok(r.pop)||r.pop<0))bad.push('pop'+i)});
   if(!Array.isArray(S.evQ)||!S.stats||!S.buffs)bad.push('1b alanları');return bad};
  newGame(seed,{dyn:'klasik',diff:'kalfa'});autoSetup();finishSetup();closeModal();const c=capIdx();S.turn=30;S.evNext=99;for(const k in S.res)S.res[k]=400;
  // 10 bölgelik bir beylik: başkentten kabile bölgelerine doğru
  const q=[c],seen=new Set([c]);while(q.length&&own().length<10){const i=q.shift();for(const j of G()[i].adj){if(seen.has(j))continue;seen.add(j);if(R()[j].owner===NEUTRAL&&own().length<10){const r=R()[j];r.owner=0;r.u=Object.assign(Z(),{piy:12});r.rd=Object.assign(Z(),{piy:12});sync(r);r.fort=0;q.push(j)}}}
  const o=own(),nb=[...new Set(o.flatMap(i=>G()[i].adj))].filter(j=>R()[j].owner===NEUTRAL);
  // komşu rakip (Tüccar), zayıf kabile, harabe, tarlalar, maden Sv.2, kalabalık ordu, savaş/fetih geçmişi, kıtlık serisi
  if(nb[0]!=null){const r=R()[nb[0]];r.owner=1;r.u=Object.assign(Z(),{piy:20});r.rd=Z();sync(r)}S.ai[1].per='tuccar';
  if(nb[1]!=null){const r=R()[nb[1]];r.u=Object.assign(Z(),{piy:2});r.rd=Z();sync(r)}
  G()[o[1]].feat='harabe';
  for(const i of o.slice(0,3)){const r=R()[i];r.fields=r.fields.filter(f=>f.t!=='tarla');r.fields.unshift({t:'tarla',lv:2})}R()[o[2]].fields.push({t:'demir',lv:2});
  addU(R()[c],{piy:120},true);S.stats.batT=[21,22,23,24,25,26,27,28,29];S.stats.conqT=[26,27,29];S.stats.famineStreak=2;computeVision();
  const snap=JSON.stringify(S),out=[];
  const fresh=()=>{S=JSON.parse(snap);computeVision()};
  for(const E of EVENTS){fresh();let cond=E.sys?true:!!E.cond();const d0=E.sys?{f:1}:E.prep?E.prep():{};
   const n=E.auto?1:E.opts.length;for(let k=0;k<n;k++){fresh();const d=E.sys?{f:1}:E.prep?E.prep():{};let m=null,bad=[],err=null;
    try{if(!d)throw Error('prep boş');if(E.auto)m=E.opts[0].fx(d);else{S.evQ=[{id:E.id,d,t:S.turn}];const okk=!E.opts[k].ok||E.opts[k].ok(d);if(!okk){out.push({id:E.id,cond,opt:k,m:'(seçilemez)',bad:[]});continue}const r=applyEvent(k);m=r&&r.m}
     if(typeof m!=='string')bad.push('sonuç metni yok');bad=bad.concat(inv());
     for(let t=0;t<3&&!S.over;t++){endTurn();closeModal();evAuto('first');closeModal();bad=bad.concat(inv().map(x=>'yıl+'+(t+1)+' '+x))}}catch(e){err=String(e&&e.stack||e).slice(0,300)}
    out.push({id:E.id,cond,opt:k,m:m&&String(m).replace(/<[^>]+>/g,'').slice(0,90),bad:bad.slice(0,4),err})}}
  return out}}
window.evUnit=async function(seed=7){const win=await getFrame(DEF.src,DEF.timeoutMs);win.eval('refresh=function(){computeVision()}');const f=win.eval('('+evUnitFactory.toString()+')()');try{return f(seed)}finally{win.refresh=FRAME.orig.refresh}};
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
  const hasRnd=win.eval('typeof rnd==="function"'),cfg={dyn:o.dynasty,muts:o.cards||[],map:o.mapType,size:o.size,diff:o.difficulty,dice:o.dice,ev:o.ev,alt:o.alt,ferman:o.ferman?o.goal:null};if(o.pers)cfg.pers=o.pers;if(o.cfgExtra)Object.assign(cfg,o.cfgExtra);C.goal=o.goal;C.meta=o.meta;C.declare=o.declare;
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
  avgT50:avg(rows.map(r=>r.t50).filter(v=>v!=null)),byWin:{fetih:wins.filter(r=>(r.winBy||'fetih')==='fetih').length,medeniyet:wins.filter(r=>r.winBy==='medeniyet').length,hegemonya:wins.filter(r=>r.winBy==='hegemonya').length},avgEv:avg(rows.map(r=>r.ev).filter(v=>v!=null)),evPer75:(()=>{const a=rows.filter(r=>r.ev!=null&&r.end);return a.length?+(a.reduce((s,r)=>s+r.ev*75/r.end,0)/a.length).toFixed(1):null})(),coalBroken:rows.reduce((s,r)=>s+(r.coalBroken||0),0),avgT25:avg(rows.map(r=>r.t25).filter(v=>v!=null)),avgFamine:avg(rows.map(r=>r.famine||0)),avgActs:avg(rows.map(r=>r.acts||0)),coalGames:rows.filter(r=>r.coal).length,errors:errN,fatal,randLeak:LEAK.n,
  ms:Math.round(performance.now()-t0),gameVersion:FRAME&&FRAME.ver,opts:{seeds:o.seeds,maxTurns:o.maxTurns,fast:o.fast,dynasty:o.dynasty,cards:o.cards,mapType:o.mapType,difficulty:o.difficulty,size:o.size,dice:o.dice,goal:o.goal,ferman:o.ferman,pers:o.pers,ev:o.ev,alt:o.alt,bot:C}};
 const res={summary:sum,rows,when:new Date().toISOString()};window.SIM_RESULT=res;
 if(out)out.innerHTML=summaryHtml(sum)+table(rows);say(fatal?'Hata: '+fatal:`Bitti: ${sum.win}/${sum.n} kazanma, ${(sum.ms/1000).toFixed(1)} sn`);return res}

const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function table(rows){return'<table><tr><th>Tohum</th><th>Bitiş turu</th><th>Sonuç</th><th>Yol</th><th>Olay</th><th>Bölge</th><th>%25</th><th>%50</th><th>%75</th><th>Kıtlık</th><th>Eylem/tur</th><th>Hata</th><th>ms</th></tr>'+
 rows.map(r=>`<tr class="${r.over}"><td>${r.seed}</td><td>${r.end??'—'}</td><td>${r.over}</td><td>${r.winBy??'—'}</td><td>${r.ev??'—'}</td><td>${r.own??'—'}/${r.playN??'—'}</td><td>${r.t25??'—'}</td><td>${r.t50??'—'}</td><td>${r.t75??'—'}</td><td>${r.famine??'—'}</td><td>${r.acts??'—'}</td><td title="${esc((r.errors||[]).map(e=>e.tip+' @'+(e.tur??'?')+': '+e.m).join('\n'))}">${(r.errors||[]).length}</td><td>${r.ms}</td></tr>`).join('')+'</table>'}
function summaryHtml(s){return`<p class=sum><b>Kazanma:</b> ${s.win}/${s.n} (${Math.round(s.winRate*100)}%) · <b>Kayıp:</b> ${s.lose} · <b>Yol:</b> ⚔${s.byWin.fetih} 📜${s.byWin.medeniyet} 👑${s.byWin.hegemonya} · <b>Olay/75 tur:</b> ${s.evPer75} · <b>Ort. bitiş:</b> ${s.avgEnd} · <b>Kazanılan oyunlarda tur:</b> ${s.avgWinEnd} (${s.minWinEnd}–${s.maxWinEnd}) · <b>Ort. %50:</b> ${s.avgT50} · <b>Ort. kıtlık:</b> ${s.avgFamine} · <b>Eylem/tur:</b> ${s.avgActs} · <b>Hata:</b> ${s.errors} · ${(s.ms/1000).toFixed(1)} sn</p>${s.fatal?`<pre class=bad>${esc(s.fatal)}</pre>`:''}`}

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
// 1c: miras ilerleme eğrisi (§9.3). Her tekrar boş bir META ile 10 oyun oynar; oyun sonunda oyunun kendi commitMeta'sı çalışır,
// bot en ucuz alınabilir açılımı hemen satın alır. Plan: §9.3 tablosu (kilitliyse açık bir eşdeğeri). Sonuç JOBS[name].res: [{rep, games:[{k,cfg,over,winBy,turn,mp,cum,bought,auto,ach}]}]
const META_PLAN=[{dyn:'boru',diff:'cirak'},{dyn:'tunc',diff:'kalfa',muts:['kitlik']},{dyn:'kartal',diff:'kalfa',muts:['sur'],map:'vadi'},{dyn:'bilge',diff:'kalfa',muts:['erken'],ferman:'medeniyet',goal:'medeniyet'},
 {dyn:'boru',diff:'usta',muts:['kabile']},{daily:true},{dyn:'deniz',diff:'kalfa',muts:['kitlik','sur']},{dyn:'kartal',diff:'usta',map:'dag'},{dyn:'boru',diff:'usta',muts:['erken','kanli']},{dyn:'tunc',diff:'kalfa'}];
async function metaRun(name,reps=5,base=5000){const J=JOBS[name]={done:0,total:reps,res:[],fin:false};
 for(let rep=0;rep<reps;rep++){const win=await getFrame(DEF.src,DEF.timeoutMs);win.eval('META=metaFix(null)');const games=[];
  for(let k=0;k<META_PLAN.length;k++){const P=META_PLAN[k],seed=base+rep*101+k*7;let o;
   if(P.daily){const d=win.eval(`(()=>{const k=dateKey();META.daily.started[k]=1;return dailyOf(k)})()`);o={seeds:[seed],dynasty:d.cfg.dyn,cards:d.cfg.muts,mapType:d.cfg.map,size:d.cfg.size,difficulty:d.cfg.diff,cfgExtra:{daily:d.cfg.daily}}}
   else{const op=(c,id,d)=>win.eval(`isOpen('${c}','${id}')`)?id:d;o={seeds:[seed],dynasty:op('dyn',P.dyn,'boru'),difficulty:op('diff',P.diff,'kalfa'),mapType:op('map',P.map||'kita','kita'),cards:(P.muts||[]).filter(m=>win.eval(`isOpen('mut','${m}')`)),goal:P.goal||'fetih',ferman:!!P.ferman,cfgExtra:{bonus:win.eval('META.equipped.bonus.slice()')}}}
   const mp0=win.eval('META.mp'),r=await runSim(Object.assign({slice:0,maxTurns:160},o));const row=r.rows[0];
   const R=win.eval('(()=>{if(S.over&&!S.metaDone)afterModal();closeModal();return S.endRes||null})()');
   const bought=win.eval(`(()=>{const b=[];for(let q=0;q<10;q++){const L=lockList().filter(x=>x.cost&&!x.open&&x.cost<=META.mp).sort((a,b)=>a.cost-b.cost)[0];if(!L)break;unlockItem(L.cat,L.id);if(L.cat==='bonus')META.equipped.bonus=[L.id];b.push(L.cat+':'+L.id)}return b})()`);
   games.push({k:k+1,cfg:o.dynasty+'/'+o.difficulty+'/'+o.mapType+(o.cards.length?'/'+o.cards.join('+'):''),over:row.over,winBy:row.winBy,turn:row.end,mp:R?R.mpTot:0,mpG:R?R.mpG:null,cum:win.eval('META.mpTotal'),bal:win.eval('META.mp'),bought,auto:R?R.unl.map(u=>u.cat+':'+u.id):[],ach:R?R.ach:[]})}
  J.res.push({rep,games,unlocked:win.eval('JSON.parse(JSON.stringify(META.unlocked))')});J.done++}J.fin=true;return J}
window.metaRun=metaRun;window.simJob=simJob;window.runSim=runSim;window.mapHash=mapHash;window.checkMaps=checkMaps;window.simFrame=()=>FRAME&&FRAME.win;window.SIM_DEFAULTS={...DEF,bot:DEF_BOT};
})();
