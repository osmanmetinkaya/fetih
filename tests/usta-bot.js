// Fetih · Usta bot: deneyimli insan oyuncunun vekili (docs/faz2-derinlik.md §B.3.1 "B2").
// tests/sim.js bu dosyanın metnini oyunun iframe'inde eval eder (bot:{profile:'usta'}); serbest adlar (S, MAP, own, economy, previewAtk,
// resolve, recruit, upgradeMil, …) oyunun globallerine bağlanır. Oyun koduna dokunulmaz, oyunun rnd() akışına ek çağrı yapılmaz, Math.random kullanılmaz.
// Dürüstlük: bot yalnızca oyuncunun arayüzde yapabildiği eylemleri yapar (hazır askeri komşuya / Yol Ağı ile taşıma, komşudan saldırı, tesis, kuruluş,
// sur, alım, araştırma, olay seçimi, otomatik üretim aç/kapa) ve oyuncunun gördüğü bilgiyi kullanır: düşman asker sayısı ~5'e yuvarlı tahmin
// (Casusluk ile kesin), kişilik Haritacılık ile; kesin bilinmeyen sayılarda tahmin hatası payı (+2,5 asker) eklenir.
//
// Yapı: her tur bir bağlam T kurulur, sonra USTA_BOT.order sırasıyla karar modülleri USTA_BOT.mods[ad](T,P,st) çalışır:
//   arastirma → saldiri → yiginak (savunma + yığınak planı + taşıma) → ekonomi (tesis) → kurulus (askeri kademe) → sur → asker (alım + otomatik üretim)
//   tur sonunda: olay (değer tahminiyle seçim) ve zafer kararı ('devam').
// Genişletme: yeni mekanik için yeni modül yaz ve sıraya ekle; parametreler USTA_BOT.P (koşu başına bot:{usta:{…}} ile değiştirilir):
//   USTA_BOT.mods.tersane=(T,P,st)=>{…}; USTA_BOT.order.splice(USTA_BOT.order.indexOf('ekonomi')+1,0,'tersane')
// Yardımcılar (U.h): threatRaw, spare, atkEst, tVal, vRes, reserveA … modüller arasında ortaktır.
(function(){'use strict';
const U=window.USTA_BOT={ver:'1.0'};
// ---- Parametreler ----
U.P={
 setup:['tarla','pazar'],            // kuruluş hazinesi: sırayla, yettikçe (kalan akçe hazineye)
 // Araştırma sırası (dal+hedef kademe). Katı sıra: ilk eksik teknolojiye bilgi biriktirilir; kuşatma gereği öne alınır (bkz. arastirma)
 tech:['str1','ure1','sal1','eko1','sav1','sal2','ure2','str2','eko2','eko3','sal3','str3','kus1','ure3','sav2','kus2','sal4','eko4','str4','kus3','sav3','ure4','kus4','sav4'],
 V:{tahil:.7,odun:.45,tas:.55,demir:.35,altin:1,bilgi:.8},   // kaynak değeri (altın eşdeğeri); kıtlık/atıllık ile çarpılır (vRes)
 comfort:{tahil:90,odun:70,tas:70,demir:90,altin:90,bilgi:40},
 H0:45,Hmin:24,Hdec:.15,fieldsPerTurn:4,slotCost:15,  // tesis geri ödeme ufku H=max(Hmin,H0−tur·Hdec)
 keepA:12,keepT:20,                  // asgari altın / tahıl stoğu
 popKeepF:.5,popKeepN:.3,            // asker alırken korunan nüfus payı (tesisli bölge: işgücü tam kalsın / tesissiz)
 milMinPop:8,hubTier:3,capTier:5,saveFrom:4,kusMax:4,              // karakol için asgari alınabilir nüfus; yığınak merkezlerinin hedef kademesi (başkent: en yüksek)
 surMax:3,surCapMax:9,               // sur tavanı (cephe / başkent: oyunun izin verdiği kadar)
 atk:{r:1.3,rSmall:1.15,rBig:1.5,ch:.8,capR:3.5,minSend:3,lossW:.08,err:2.5},
 planR:1.25,                         // yığınak hedefi: eşik × planR kuvvet topla
 safety:1.15,capSafety:1.5,multi:.35,// savunma payı; aynı bölgeye birden çok rakip bölgesinin ek tehdidi
 endAt:.75,endR:1.1,
 capV:2,coalCapV:2,soften:false,look:2,holdMin:.6,holdW:1,defReach:4,longReach:6,
 ev:'value',alt:'devam',
 unrG:1,ambAt:.85,                   // G1: huzursuz bölgede garnizon ≥ unrG·G; stok tavanın ambAt'ına yaklaşınca Ambar
 ws:{cov:.9,grow:.06,ups:2,ironT:1,capMil:3,surResv:true,kislaSave:true,capResv:true},  // G2: kapsama hedefi; atölye kapasitesi ≥ grow·kullanıcı; yılda en çok ups yükseltme; demir stoğu ≥ ironT yıllık kit talebi
 sea:{from:20,hK:1,kadAt:.03,acts:1,saveK:.5,kalyon:true}  // G3: paket geri ödemesi ≤ hK·H ise adım; korsan riski ≥ kadAt ise Kadırga; geri ödeme ≤ saveK·hK·H ise altın biriktirilir
};
U.order=['arastirma','ilhak','savunma','saldiri','yiginak','askerSav','liman','kurulus','atolye','sur','ambar','ekonomi','asker'];
U.mods={};const h=U.h={};let CP=U.P,CT=null;   // CP: koşudaki etkin parametreler; CT: turun bağlamı (T)
// ---- Ortak yardımcılar ----
const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
const LEAVE=['suv','yen','piy','kus','okc'];   // cepheden ayrılış / saldırıya gönderiliş sırası (önce saldırı birlikleri)
const DEFO=['okc','yen','piy','suv','kus'];    // savunmaya gönderiliş sırası
const FV={liman:.6,kavsak:.6,verimli:.5,harabe:.35,mabet:.5,damar:.3,gecit:.4,kale:.2};
h.knownU=j=>{const t=S.regions[j];if(!t.troops)return Z();if(mil().spy||revealed(t.owner))return Object.assign(Z(),t.u);return scaleU(t.u,est(t.troops)/t.troops)};
h.exact=j=>{const t=S.regions[j];return mil().spy||revealed(t.owner)||t.troops<=3};
h.isEnd=P=>own().length>=MAP.playN*P.endAt||!S.cfg.ais.some(f=>aliveAI(f)&&!isVas(f));
// Rakibin oyuncuya saldırı eşiği (oyuncunun bildiği kadarıyla): kişilik Haritacılık ile görünür, yoksa temkinli 1,3
h.aiNeed=f=>{const P=aiPer(f),D=DIFFS[S.cfg.diff],kp=knowPers()||P===AIPERS.klasik;let n=kp?P.needP:1.3;
 if(kp&&P.postGrace&&S.turn<S.cfg.grace+P.postGrace[1])n+=P.postGrace[0];n+=D.needAdd;const C=S.coal;if(C&&C.on&&C.mem.includes(f))n-=.15;if(h.g1())n-=balance().need;return Math.max(.95,n-.05)};
// G1 (0.12.0) kuralları: rakip serbest askerin tamamıyla saldırabilir (rezerv yok), koalisyonun ortak hedefine ve yeni kaybettiği bölgeye eşiği düşer (arayüzde görünen bilgiler)
h.g1=()=>typeof G1==='function'&&G1();
h.aiNeedAt=(f,i)=>{let n=h.aiNeed(f);if(!h.g1())return n;const C=S.coal,P=aiPer(f),kp=knowPers()||P===AIPERS.klasik;if(C&&C.on&&C.tgt===i&&C.mem.includes(f))n-=.1;
 const a=S.ai[f];if(a&&a.lostR&&a.lostR.some(x=>x.i===i&&x.t>=S.turn-2))n=Math.min(n,kp?P.ctr:1.05);return Math.max(.95,n)};
// Rakibin w bölgesinden (j) bize saldırı gücü / eşik: bölgemiz için gereken ham savunmayı verir. fight: bölge bu tur savaşa girecek (Fırsatçı eşiği düşer)
h.aiPush=(j,i,dm,fight)=>{const R=S.regions,w=R[j].owner,P=aiPer(w),kp=knowPers()||P===AIPERS.klasik,u=h.knownU(j);let n=sumU(u);if(!n)return 0;
 const mr=kp?P.minReady:3,rs=h.g1()?0:kp?P.reserve:.1;const nE=h.exact(j)?n:n+CP.atk.err;if(nE<mr)return 0;const s=nE-Math.max(1,fl(nE*rs));if(s<3)return 0;const A=scaleU(u,s/n);
 let need=h.aiNeedAt(w,i);if((!kp||P.needWeak)&&(fight||R[i].bt>=S.turn-1||S.stats.lostT===S.turn))need=Math.min(need,(kp?P.needWeak:1.1)+DIFFS[S.cfg.diff].needAdd-.05);
 return rawAtk(A,j,i,w)*atkMult(w,s,j,i)/(Math.max(.9,need)*(dm||defMult(i,siegeOf(w,R[i].fort,A))))};
const hostileTo=(w,look)=>isAI(w)&&!isVas(w)&&!(S.truce&&S.truce[w]>S.turn+look);
// i bölgesini rakip saldırısına karşı tutmak için gereken ham savunma (rawDef birimi). excl: bu tur alınacak komşu (tehdidi sayılmaz).
// Barış dönemi ve ateşkesin bitimine CP.look tur kala tehdit sayılır (yığınak önceden kurulur). Birden çok rakip bölgesi: en güçlüsü + diğerlerinin CP.multi payı
h.threatRaw=(i,excl,fight)=>{if(S.turn<S.cfg.grace-CP.look)return 0;const R=S.regions,G=MAP.regions,vals=[];
 for(const j of G[i].adj){if(j===excl)continue;const w=R[j].owner;if(!hostileTo(w,CP.look))continue;const P=aiPer(w);
  if(knowPers()&&P.onlyCounter){const x=S.ai[w].hit;if(!(fight||x&&x.t>=S.turn-1&&(x.from===i||x.to===i)))continue}
  const v=h.aiPush(j,i,null,fight);if(v>0)vals.push(v)}
 if(!vals.length)return 0;vals.sort((a,b)=>b-a);let v=vals[0];for(let k=1;k<vals.length;k++)v+=vals[k]*CP.multi;return v};
// Fethedilecek j'yi tutabilir miyiz: j'ye komşu (j'nin sahibi dahil) rakip bölgelerinin tehdidi, bizim olursa savunma çarpanıyla (sur −1, moral)
h.holdThreat=j=>{if(S.turn<S.cfg.grace-CP.look)return 0;const R=S.regions,G=MAP.regions,g=G[j],M=mil(),t=R[j];
 const dm=(1+TER[g.terrain].def+(g.feat&&FEAT[g.feat].def||0)+Math.max(0,t.fort-1)*M.fortPer*.65+M.def+M.defDyn+(M.gecitDef&&g.feat==='gecit'?M.gecitDef:0))*moraleMult(S.morale);
 const vals=[];for(const q of g.adj){const w=R[q].owner;if(!hostileTo(w,CP.look)||q===j)continue;const v=h.aiPush(q,j,dm,true);if(v>0)vals.push(v)}
 if(!vals.length)return 0;vals.sort((a,b)=>b-a);let v=vals[0];for(let k=1;k<vals.length;k++)v+=vals[k]*CP.multi;return v};
h.sf=(i,P)=>S.regions[i].capital?P.capSafety:P.safety;
h.req=(i,P,excl,fight)=>Math.max(h.threatRaw(i,excl,fight)*h.sf(i,P),h.g1()&&unrOf(i)?garrNeed(i)*P.unrG:0);
const udef=k=>{const ud=mil().unitDef;return(ud&&ud[k]||UNITS[k].def)*(typeof eqD==='function'?eqD(0,k):1)};
// G2 (0.13.0): atölye/donanım kuralları oyunda var mı
h.g2=()=>h.g1()&&typeof buildWS==='function';
// G3 (0.14.0): liman/gemi/ticaret kuralları oyunda var mı
h.g3=()=>h.g1()&&typeof buildShip==='function'&&G3();
// i'den ayrılabilecek birlikler: kalan rawDef ≥ req olacak kadar. fromU: bütün birlikler (gelecek tur hepsi hazır), değilse yalnız hazırlar
h.spare=(i,req,fromU)=>{const r=S.regions[i],src=fromU?r.u:r.rd,out=Z();let def=rawDef(r.u,0);
 for(const k of LEAVE){const n=src[k];if(!n)continue;const d=udef(k),c=req<=0?n:clampN(fl((def-req)/d),0,n);out[k]=c;def-=c*d}return out};
// previewAtk'in olasılıksız (hızlı) eşi + tahmin hatası payı: dPhi = kesin değilse savunmacı (tahmin+err) asker
h.atkEst=(i,j,A)=>{const t=S.regions[j],n=sumU(A);if(!n)return{n:0,aP:0,dP:1,dPhi:1,r:0};const siege=siegeOf(0,t.fort,A),am=atkMult(0,n,i,j),dm=defMult(j,siege),K=h.knownU(j),kn=sumU(K);
 const aP=rawAtk(A,i,j,0)*am,dP=rawDef(K,t.owner)*dm,dPhi=h.exact(j)||!kn?dP:dP*(kn+CP.atk.err)/kn;return{n,aP,dP,dPhi,r:dPhi>0?aP/dPhi:99}};
h.lossFrac=r=>{if(r<=1)return 1;const M=mil();return(1-Math.sqrt(1-1/(r*r)))*M.lossMult*M.conqLoss};
h.isBig=j=>{const t=S.regions[j],g=MAP.regions[j];return(t.capital&&isAI(t.owner))||g.feat==='gecit'||g.feat==='kale'||t.fort>=2};
h.thr=(j,e,P,endG)=>{const t=S.regions[j];let r=h.isBig(j)?P.atk.rBig:e.dPhi<12?P.atk.rSmall:P.atk.r;if(endG&&t.owner===NEUTRAL)r=Math.min(r,P.endR);return r};
// Hedef değeri: bölge (+1), üretim, özellik, rakip başkenti (koalisyonda daha çok), zayıf rakibi bitirme, cepheyi kısaltma
h.tVal=(j,P)=>{const R=S.regions,G=MAP.regions,t=R[j],g=G[j],w=t.owner,y=production(j);let v=1;for(const k in y)v+=y[k]*(P.V[k]||.5)*.12;
 if(g.feat)v+=FV[g.feat]||.2;if(isAI(w)){v+=.4;if(t.capital){v+=P.capV;if(S.coal&&S.coal.on&&S.coal.mem.includes(w))v+=P.coalCapV}const n=aiRegs(w);if(n<=3)v+=.9/n}
 v+=.3*(g.adj.filter(q=>R[q].owner===0).length-1);return v};
// Dinamik kaynak değeri: stok rahat düzeyin üstündeyse (atıl) düşer, altındaysa (darboğaz) artar
// gain: üretilecek kaynağın değeri (atılsa neredeyse sıfır), değilse harcanacak kaynağın fırsat değeri
h.vRes=(k,P,e,gain)=>{const cf=(P.comfort[k]||60)*(1+S.turn/50);let f=clampN(1.7-S.res[k]/cf,gain?.08:.25,1.7);if(gain&&CT&&CT.resv&&CT.resv[k])f=Math.max(f,1.3);if(gain&&e.net[k]>cf/4)f=Math.min(f,.4);if(k==='tahil'&&e.net.tahil<3)f=Math.max(f,1.5);if(k==='altin')f=Math.max(f,.8);return(P.V[k]||.5)*f};
h.costV=(c,P,e)=>{let s=0;for(const k in c)s+=(c[k]||0)*h.vRes(k,P,e);return s};
h.reserveA=(P,e)=>P.keepA+Math.max(0,-e.net.altin)*3;
// G2: kalıcı yatırım hedefi için ayrılan taş/odun/demir (T.resv): başka harcama bu payı yemez
h.resvOk=(c,T)=>{const v=T&&T.resv;if(!v)return true;for(const k in v)if(c[k]&&S.res[k]-c[k]<v[k])return false;return true};
h.resvSet=(T,c)=>{if(T.resv)return;const v={};for(const k of['tas','odun','demir'])if(c[k])v[k]=c[k];if(Object.keys(v).length)T.resv=v};
h.reserveT=(P,e)=>P.keepT+Math.max(0,-e.net.tahil)*4;
h.canMoveU=(a,b)=>canMove(a,b);
h.mv=(a,b,A,st)=>{const r=S.regions[a];for(const k of UK)A[k]=Math.min(A[k]||0,r.rd[k]);if(!sumU(A))return 0;remU(r,A,true);addU(S.regions[b],A,false);st.moves++;return sumU(A)};
// Kendi topraklarında çok kaynaklı BFS (kaynak listesinden uzaklık)
h.ownBfs=src=>{const d=new Array(MAP.n).fill(99),q=[];for(const s of src){if(d[s]){d[s]=0;q.push(s)}}while(q.length){const c=q.shift();for(const j of MAP.regions[c].adj)if(S.regions[j].owner===0&&d[j]===99){d[j]=d[c]+1;q.push(j)}}return d};
h.enemyAdj=i=>MAP.regions[i].adj.filter(j=>{const w=S.regions[j].owner;return w>0&&w!==BLOCK&&!isVas(w)});

// ---- Modüller ----
// Araştırma: katı sıra, kuşatma ihtiyacı (komşu surlu hedefler) Kuşatma I-II'yi öne alır
U.mods.arastirma=(T,P,st)=>{const R=S.regions,list=P.tech.slice();
 const forts=[...new Set(own().flatMap(h.enemyAdj))].filter(j=>R[j].fort>=2).length;if(forts>=2&&S.tech.kus<2){for(const x of['kus2','kus1']){const k=list.indexOf(x);if(k>=0){list.splice(k,1);list.unshift(x)}}}
 for(let n=0;n<4;n++){const x=list.find(x=>S.tech[x.slice(0,3)]<+x[3]);if(!x)return;const b=x.slice(0,3),k=S.tech[b];if(S.res.bilgi<tcost(k))return;research(b,k);st.acts++}};
// Savunma açıklarını komşudan (Yol Ağı ile her yerden) kapat. Dönüş: {req, free (taşınabilir hazır), gap (kalan açık), left (kapanmayan), all}
h.fillDef=(P,st)=>{const R=S.regions,G=MAP.regions,o=own(),req={},free={},gp={},left=[];
 for(const i of o){req[i]=h.req(i,P,null);free[i]=h.spare(i,req[i],false)}
 const gap=i=>req[i]-rawDef(R[i].u,0);
 const all=o.filter(i=>req[i]>0&&gap(i)>0).sort((a,b)=>(R[b].capital-R[a].capital)||gap(b)-gap(a)),isDef=new Set(all);
 const sendDef=(k,d,g)=>{const A=Z();for(const u of DEFO){const n=free[k][u];if(!n||g<=0)continue;const c=Math.min(n,Math.ceil(g/udef(u)));A[u]=c;g-=c*udef(u)}for(const u of UK)free[k][u]-=A[u];h.mv(k,d,A,st);return g};
 for(const d of all){let g=gap(d);const src=o.filter(k=>k!==d&&sumU(free[k])>0&&!isDef.has(k)&&canMove(k,d)).sort((a,b)=>(G[d].adj.includes(b)-G[d].adj.includes(a))||sumU(free[b])-sumU(free[a]));
  for(const k of src){if(g<=0)break;g=sendDef(k,d,g)}if(g>0){left.push(d);gp[d]=g}}
 return{req,free,gap:gp,left,all}};
// Savunma (saldırıdan önce): açıklar kapanır, böylece saldırı yalnız artan askerle yapılır
U.mods.savunma=(T,P,st)=>{const D=h.fillDef(P,st);T.defLeft=D.left};
// Saldırı: her yinelemede bütün (kaynak, hedef) çiftleri değerlendirilir, en iyi tek saldırı yapılır; fetihten sonra yeni hedefler (ve Akın) açılır.
// Gönderilen kuvvet = hazır asker − kaynak bölgede kalması gereken savunma; aynı kaynağın başka hedefi varsa kuvvet capR oranına kırpılır.
U.mods.saldiri=(T,P,st)=>{const endG=h.isEnd(P);
 for(let it=0;it<60&&!S.over;it++){const R=S.regions,G=MAP.regions,cands=[];
  for(const i of own()){const r=R[i];if(r.ready<P.atk.minSend)continue;const tg=G[i].adj.filter(j=>canAttack(i,j));if(!tg.length)continue;
   for(const j of tg){let A=h.spare(i,h.req(i,P,j,true),false);if(sumU(A)<P.atk.minSend)continue;let e=h.atkEst(i,j,A);const th=h.thr(j,e,P,endG);if(e.r<th)continue;
    if(tg.length>1&&e.r>P.atk.capR){const A2=takeProp(A,Math.max(P.atk.minSend,Math.ceil(e.n*P.atk.capR/e.r)));const e2=h.atkEst(i,j,A2);if(e2.r>=th){A=A2;e=e2}}
    const ch=odds(e.aP,e.dPhi);if(ch<P.atk.ch)continue;let sc=h.tVal(j,P)-P.atk.lossW*e.n*h.lossFrac(e.r);
    // tutabilir miyiz: sağ kalanların savunması / fetihten sonraki tehdit (son aşamada ve rakip başkentinde aranmaz)
    const ht=endG?0:h.holdThreat(j);if(ht>0){const sv=scaleU(A,1-h.lossFrac(e.r)),hr=rawDef(sv,0)/(ht*P.safety);if(hr<P.holdMin&&!(R[j].capital&&isAI(R[j].owner)))continue;if(hr<1)sc-=(1-hr)*P.holdW}
    cands.push({i,j,A,e,sc})}}
  if(!cands.length){if(P.soften)soften(P,st,endG);break}
  cands.sort((a,b)=>b.sc-a.sc);const c=cands[0],x=resolve(0,c.i,c.j,c.A);st.atk++;if(x.win){st.won++;st.lostA+=x.lost;st.sentA+=x.sent}else{st.fail++;st.lostA+=x.lost;st.sentA+=x.sent}st.acts+=2;checkEnd()}};
// (Deneysel, varsayılan kapalı) aynı tur çok kaynaklı saldırı: tek başına yetmeyen komşular sırayla vurur, son vuruş fethi alır
function soften(P,st,endG){const R=S.regions,G=MAP.regions,tg=[...new Set(own().flatMap(i=>G[i].adj.filter(j=>canAttack(i,j))))];
 for(const j of tg){const src=G[j].adj.filter(i=>R[i].owner===0&&canAttack(i,j)).map(i=>{const A=h.spare(i,h.req(i,P,j),false);return{i,A,e:h.atkEst(i,j,A)}}).filter(x=>x.e.n>=P.atk.minSend);
  if(src.length<2)continue;const tot=src.reduce((s,x)=>s+x.e.aP,0),d=src[0].e.dPhi;if(tot<d*h.thr(j,src[0].e,P,endG)*1.6)continue;src.sort((a,b)=>a.e.aP-b.e.aP);
  for(const x of src){if(R[j].owner===0||S.over)break;const r=resolve(0,x.i,j,x.A);st.atk++;st.soft++;if(r.win)st.won++;else st.fail++;st.lostA+=r.lost;st.sentA+=r.sent;checkEnd()}}}
// Savunma + yığınak: (1) savunma açığı olan bölgelere komşudan (Yol Ağı ile her yerden) takviye, başkent önce; kapanmayan açık "talep" olur,
// (2) gelecek tur için hedef seç ve kuvveti yığınak bölgesine topla (hedefe komşu kendi bölgelerinden ve iç bölgelerden; birleşik saldırı),
// yetişmeyen en değerli hedef uzun vadeli yığınak olur, (3) boştaki asker: açığa (≤defReach) > uzun yığınağa (≤longReach) > rakip cephesine bir adım
// (Yol Ağı varsa doğrudan). Kabile cephesinde boşta bekleyen asker de rakip cephesine kayar.
U.mods.yiginak=(T,P,st)=>{const R=S.regions,G=MAP.regions,o=own(),endG=h.isEnd(P),req={},free={},dgap={},roads=mil().roads;T.plan={stages:[],tgt:[],deficit:[]};
 const D=h.fillDef(P,st);Object.assign(req,D.req);Object.assign(free,D.free);Object.assign(dgap,D.gap);T.plan.deficit=D.left;const isDef=new Set(D.all);
 // hedef planı: her hedef için en güçlü yığınak bölgesi s (gelecek tur: s'nin bütün birlikleri − savunması + taşınabilir boş asker)
 const tg=[...new Set(o.flatMap(h.enemyAdj))].filter(j=>!(S.truce&&S.truce[R[j].owner]>S.turn+1)),used=new Set(),plans=[];
 const pw=(A,s,j)=>{const n=sumU(A);return n?rawAtk(A,s,j,0)*atkMult(0,n,s,j):0};
 for(const j of tg){const dPhi=h.atkEst(o[0],j,{piy:1}).dPhi,th=h.thr(j,{dPhi},P,endG),need=dPhi*th*P.planR;let best=null;
  for(const s of G[j].adj){if(R[s].owner!==0||isDef.has(s))continue;const base=pw(h.spare(s,h.req(s,P,j,true),true),s,j);
   const gs=o.filter(k=>k!==s&&sumU(free[k])>0&&!isDef.has(k)&&canMove(k,s));const gat=gs.reduce((a,k)=>a+pw(free[k],s,j),0);
   if(!best||base+gat>best.base+best.gat)best={s,base,gat,gs}}
  if(best){let v=h.tVal(j,P);const ht=endG?0:h.holdThreat(j);if(ht>0&&!(R[j].capital&&isAI(R[j].owner))){const hr=(best.base+best.gat)/Math.max(1,need)*.6*dPhi/(ht*P.safety);if(hr<1)v-=(1-Math.max(0,hr))*P.holdW}
   plans.push({j,need,...best,v:v/Math.max(4,need)})}}
 plans.sort((a,b)=>b.v-a.v);let longT=null;
 for(const p of plans){if(used.has(p.s))continue;const ok=p.base+p.gat>=p.need;if(!ok){if(!longT)longT=p;continue}used.add(p.s);T.plan.stages.push(p.s);T.plan.tgt.push(p.j);
  let have=p.base;for(const k of p.gs.sort((a,b)=>pw(free[b],p.s,p.j)-pw(free[a],p.s,p.j))){if(have>=p.need)break;if(used.has(k)||!sumU(free[k]))continue;const A=Object.assign(Z(),free[k]);have+=pw(A,p.s,p.j);for(const u of UK)free[k][u]=0;h.mv(k,p.s,A,st)}
  if(T.plan.stages.length>=4)break}
 if(longT&&!used.has(longT.s)){T.plan.stages.push(longT.s);T.plan.tgt.push(longT.j);T.plan.long=longT.s}
 // akış: boştaki asker talebe doğru
 const front=o.filter(i=>h.enemyAdj(i).length),aiF=o.filter(i=>G[i].adj.some(j=>hostileTo(R[j].owner,P.look+2)));
 const dD=T.plan.deficit.length?h.ownBfs(T.plan.deficit):null,dL=T.plan.long!=null?h.ownBfs([T.plan.long]):null,dA=aiF.length?h.ownBfs(aiF):null,dF=front.length?h.ownBfs(front):null;
 const step=(i,d,tgts)=>{if(roads){const t=tgts.filter(x=>x!==i&&canMove(i,x)).sort((a,b)=>d[a]-d[b])[0];if(t!=null)return t}return G[i].adj.filter(q=>R[q].owner===0&&d[q]<d[i]).sort((a,b)=>d[a]-d[b])[0]};
 for(const i of o){if(!sumU(free[i])||used.has(i))continue;let j=null,lim=null;
  if(dD&&dD[i]<=P.defReach&&dD[i]>0){const left=T.plan.deficit.filter(d=>dgap[d]>0);if(left.length){j=step(i,dD,left);lim='def'}}
  if(j==null&&dL&&dL[i]>0&&dL[i]<=P.longReach)j=step(i,dL,[T.plan.long]);
  if(j==null){if(aiF.includes(i))continue;if(dA&&dA[i]<99)j=step(i,dA,aiF);else if(dF&&dF[i]>0&&dF[i]<99)j=step(i,dF,front)}
  if(j==null)continue;let A=Object.assign(Z(),free[i]);
  if(lim==='def'&&!roads){/* çok adımlı takviye: en yakın açığın kalan payı kadar */const d0=T.plan.deficit.filter(d=>dgap[d]>0).sort((a,b)=>dD[a]-dD[b])[0];if(d0!=null){let g=dgap[d0];const B=Z();for(const u of DEFO){const n=A[u];if(!n||g<=0)continue;const c=Math.min(n,Math.ceil(g/udef(u)));B[u]=c;g-=c*udef(u)}dgap[d0]=Math.max(0,g);A=B}}
  for(const u of UK)free[i][u]-=A[u];h.mv(i,j,A,st)}};
// Tesis: aday (yeni tesis ya da yükseltme) başına geri ödeme = maliyet değeri / ek üretim değeri; en kısa geri ödeme, ufuk içindeyse ve stok payı kalıyorsa
U.mods.ekonomi=(T,P,st)=>{const H=Math.max(P.Hmin,P.H0-S.turn*P.Hdec);
 for(let n=0;n<P.fieldsPerTurn;n++){const e=economy(),R=S.regions,rA=h.reserveA(P,e)+(T.plan&&T.plan.deficit.length?20+T.plan.deficit.length*10:0)+(h.g2()?T.save||0:0)+(T.saveSea||0),rT=h.reserveT(P,e)+.5*Math.max(0,S.res.altin-h.reserveA(P,e)),c=[],mf=mil().maxField;
  for(const i of own()){const r=R[i];if(h.g1()&&unrOf(i))continue;
   r.fields.forEach((f,k)=>{if(f.lv>=mf)return;const g=fieldOut(i,f,f.lv+1)-fieldOut(i,f);if(g<=0)return;const cost=upFieldCost(f);c.push({i,k,cost,pb:h.costV(cost,P,e)/(g*h.vRes(FIELD[f.t].r,P,e,true))})});
   if(r.fields.length<slots(i))for(const t in FIELD){const g=fieldOut(i,{t,lv:1});if(g<=0)continue;const cost=newFieldCost(t);c.push({i,t,cost,pb:(h.costV(cost,P,e)+P.slotCost)/(g*h.vRes(FIELD[t].r,P,e,true))})}}
  c.sort((a,b)=>a.pb-b.pb);const b=c.find(x=>x.pb<=H&&canPay(x.cost)&&h.resvOk(x.cost,T)&&(!x.cost.altin||S.res.altin-x.cost.altin>=rA)&&(!x.cost.tahil||S.res.tahil-x.cost.tahil>=rT));if(!b)return;
  if(b.t)buildField(b.i,b.t);else upgradeField(b.i,b.k);st.acts++;st.fieldN++}};
// Askeri kuruluş: başkent en yüksek kademeye, yığınak merkezleri hubTier'a, savunma açığı olan bölge Kışla'ya (okçu); cephe ve cepheye yakın,
// nüfusu yeten bölgelere Karakol. Odun/taş/demir (çoğu zaman atıl) burada harcanır.
U.mods.kurulus=(T,P,st)=>{const R=S.regions,o=own(),e=economy(),rA=h.reserveA(P,e)+(T.saveSea||0),cap=capIdx(),pl=T.plan||{stages:[],deficit:[]};
 T.save=0;const up=(i,maxT,sv)=>{const r=R[i];const nx=r.mil+1;if(nx>Math.min(5,maxT)||S.tech.ure<MIL[nx].tech)return false;const c=milCost(nx);
  if(!canPay(c)||S.res.altin-(c.altin||0)<rA){/* biriktirme hedefi: altın dışındaki bedel hazırsa altını biriktir (alım ve otomatik üretim bekler) */if(sv&&!T.save&&(Object.keys(c).every(k=>k==='altin'||S.res[k]>=c[k])||h.g2()&&P.ws.kislaSave&&i===cap&&nx===2))T.save=(c.altin||0)+rA-S.res.altin;return false}
  upgradeMil(i);if(r.mil===nx){st.acts++;st.milN++;return true}return false};
 for(const i of pl.deficit)if(R[i].owner===0&&R[i].mil<2&&(R[i].mil||draftable(i)>=4))while(up(i,2));
 if(cap!=null)while(up(cap,P.capTier,S.turn>=P.saveFrom||h.g2()&&P.ws.kislaSave));
 // G2: başkentin kademesi atölye seviyesini sınırlar: capMil'e dek bedelin taş/odun/demiri ayrılır
 if(h.g2()&&P.ws.capResv&&cap!=null&&R[cap].mil<P.ws.capMil){const nx=R[cap].mil+1;if(S.tech.ure>=MIL[nx].tech&&!canPay(milCost(nx)))h.resvSet(T,milCost(nx))}
 for(const i of pl.stages)if(R[i].owner===0)while(up(i,P.hubTier,S.turn>=P.saveFrom));
 const dF=h.ownBfs(o.filter(i=>h.enemyAdj(i).length));
 const cand=o.filter(i=>!R[i].mil&&dF[i]<=1&&draftable(i)>=P.milMinPop).sort((a,b)=>draftable(b)-draftable(a));for(const i of cand)if(!up(i,1))break};
// Sur: savunma açığı kalan bölgede (tehdit varken) ve başkentte; taş atılsa daha cömert
U.mods.sur=(T,P,st)=>{const R=S.regions,e=economy(),cap=capIdx(),pl=T.plan||{deficit:[]},tasIdle=h.vRes('tas',P,e)<P.V.tas*.6;
 const go=(i,mx,em)=>{let n=0;while(R[i].owner===0&&R[i].fort<Math.min(mx,maxFort(i))&&canPay(surCost(i))&&(em||h.resvOk(surCost(i),T))&&n<2){const f0=R[i].fort;buildSur(i);if(R[i].fort===f0)break;n++;st.acts++;st.surN++}};
 for(const i of pl.deficit)go(i,P.surMax,R[i].capital||!h.g2()||!P.ws.surResv);if(cap!=null&&(h.threatRaw(cap,null)>0||tasIdle))go(cap,P.surCapMax);
 if(tasIdle)for(const i of own())if(h.threatRaw(i,null)>rawDef(R[i].u,0)*.6)go(i,P.surMax)};
// G2: atölyeler. Her kuruluşlu bölgede ilk yuva Demirhane; kapsama < ws.cov ya da kapasite < grow·kullanıcı ise yeni atölye (öncelik kılıç → zırh → yay),
// sonra yükseltme (önce Demirhane: Talimhane + Demircilik ile Çelik; Yeniçeri için T3), demir stoğu ironT yıllık kit talebini karşılıyorsa. Altın/tahıl payı korunur
U.mods.atolye=(T,P,st)=>{if(!h.g2())return;const R=S.regions,o=own(),e=economy(),rA=h.reserveA(P,e),rT=h.reserveT(P,e),W=P.ws,sm=eqSummary(),cap={kilic:0,yay:0,zirh:0},has={kilic:0,yay:0,zirh:0};
 for(const i of o)for(const w of wsList(i)){cap[WS[w.t].k]+=w.on?wsRate(w):0;has[WS[w.t].k]++}
 const okC=c=>canPay(c)&&S.res.altin-(c.altin||0)>=rA&&S.res.tahil-(c.tahil||0)>=rT;
 const need=wsNeed(),ironOk=c=>S.res.demir-(c.demir||0)>=W.ironT*(need.demir||0);
 // (1) yükseltme: kademe kaliteyi verir. Öncelik Demirhane, sonra Zırhhane; en düşük seviye önce. Karşılanamazsa bedel ayrılır (taş/odun/demir) ya da altın biriktirilir
 let n=0;const ups=[],pr=t=>t==='demirhane'?0:t==='zirhhane'?1:2;for(const i of o){if(unrOf(i))continue;wsList(i).forEach((w,k)=>{if(w.lv<wsMaxLv(i,w.t))ups.push({i,k,w})})}
 ups.sort((a,b)=>pr(a.w.t)-pr(b.w.t)||a.w.lv-b.w.lv||R[b.i].capital-R[a.i].capital);
 for(const u of ups){if(n>=W.ups)break;const c=wsCost(u.w.t,u.w.lv+1);if(!okC(c)||!ironOk(c)){if(!n&&u.w.t!=='yayhane')h.resvSet(T,c);break}const l0=u.w.lv;upWS(u.i,u.k);if(u.w.lv>l0){n++;st.acts++;st.wsUp=(st.wsUp||0)+1}}
 // (2) yeni atölye: ilk yuva Demirhane; kapsama < cov ya da kapasite < grow·kullanıcı ise (öncelik kılıç → zırh → yay). Zırh: Savunma I ya da Talimhane ile
 const short=k=>sm[k].U>0&&(sm[k].cov<W.cov||cap[k]<W.grow*sm[k].U);
 const cand=o.filter(i=>R[i].mil&&!unrOf(i)&&wsList(i).length<wsSlots(i)).sort((a,b)=>R[b].mil-R[a].mil||R[b].capital-R[a].capital||h.enemyAdj(a).length-h.enemyAdj(b).length);
 for(const i of cand){const ws=wsList(i);let t=null;const zOk=S.tech.sav>=1||milTop()>=2;
  if(!has.kilic||short('kilic'))t='demirhane';else if(zOk&&(!has.zirh||short('zirh')))t='zirhhane';else if(short('yay'))t='yayhane';
  if(!t)continue;const c=wsCost(t,1);if(!okC(c)||!h.resvOk(c,T)||!ironOk(c))break;const l0=ws.length;buildWS(i,t);if(wsList(i).length>l0){has[WS[t].k]++;cap[WS[t].k]+=EQ.rate[1];st.acts++;st.wsN=(st.wsN||0)+1}}};
// G3: liman, tersane, gemi. Her kıyı bölgesi ve gemi türü için paket: eksik liman seviyeleri (yer + kapı) + eksik tersane seviyeleri + gemi bedeli;
// getiri = gemi eklenince ticaret artışı (tavan ve doygunluk dahil; tradeGain) − bakım. Geri ödeme (değer/değer) ≤ hK·H olan en iyi paketin ilk adımı atılır
// (liman → tersane → gemi). Doğal liman ve düşman komşusuz kıyı önce (eşitlikte); korsan riski ≥ kadAt ve kadırga yoksa Kadırga. Çok iyi paket için altın biriktirilir.
// Balıkhane ekonomi modülünde sıradan tesis adayıdır (fieldOut > 0 olan bölgede).
U.mods.liman=(T,P,st)=>{if(!h.g3()||S.turn<P.sea.from)return;const W=P.sea,H=Math.max(P.Hmin,P.H0-S.turn*P.Hdec)*W.hK;let acts=0;
 for(let rep=0;rep<W.acts;rep++){const e=economy(),tr=e.trade;if(!tr)return;const rA=h.reserveA(P,e)+(T.save||0),rT=h.reserveT(P,e),vA=h.vRes('altin',P,e,true);
  const okC=c=>canPay(c)&&h.resvOk(c,T)&&S.res.altin-(c.altin||0)>=rA&&S.res.tahil-(c.tahil||0)>=rT;let best=null;
  for(const i of own()){if(!isCoast(i)||unrOf(i))continue;const p=portOf(i),safe=h.enemyAdj(i).length?1:0,kad=shipsAt(i).some(s=>s.t==='kadirga');
   for(const t of SHK){const S1=SHIPS[t];if(t==='kalyon'&&!W.kalyon)continue;if(t==='kadirga'&&(kad||Math.max(pirP(i),shipsAt(i).length>=1?(DIFFS[S.cfg.diff].pir||0):0)<W.kadAt))continue;
    let L=Math.max(p.lv,S1.yd),ok=true;while(L<=4&&portUsed(i)+S1.slot>PORT[L].cap+(natPort(i)?SEA.natCap:0))L++;if(L>4)continue;for(let q=p.lv+1;q<=L;q++)if(!portReqOk(q))ok=false;if(!ok)continue;
    const cost={};const add=c=>{for(const k in c)cost[k]=(cost[k]||0)+c[k]};for(let q=p.lv+1;q<=L;q++)add(portCost(i,q));for(let q=p.yard+1;q<=S1.yd;q++)add(yardCost(q));add(S1.cost);
    let g=tradeGain(i,t)*vA-h.costV(S1.up,P,e);if(t==='kadirga')g+=pirP(i)*.5*(tr.v*SEA.pirT)*vA;if(p.yard<S1.yd&&!p.yard)g-=h.costV(YARD[1].wage,P,e)*SEA.idle;if(g<=0)continue;
    const pb=(h.costV(cost,P,e)+(S1.crew*.5))/g+safe*2-(natPort(i)?1:0);
    if(!best||pb<best.pb)best={i,t,pb,L,cost}}}
  if(!best||best.pb>H)return;const p=portOf(best.i),S1=SHIPS[best.t];let c,go;
  if(p.lv<best.L){c=portCost(best.i,p.lv+1);go=()=>buildPort(best.i)}else if(p.yard<S1.yd){c=yardCost(p.yard+1);go=()=>upYard(best.i)}else if(!p.b){c=S1.cost;go=()=>buildShip(best.i,best.t)}else return;
  if(!okC(c)){if(best.pb<=W.saveK*H&&!(T.plan&&T.plan.deficit.length)){if(Object.keys(c).every(k=>k==='altin'||S.res[k]>=c[k]))T.saveSea=Math.max(0,(c.altin||0)+h.reserveA(P,e)-S.res.altin);else h.resvSet(T,c)}return}
  const s0=JSON.stringify(p)+S.ships.length;go();if(JSON.stringify(p)+S.ships.length===s0)return;acts++;st.acts++;st.seaN=(st.seaN||0)+1}};
// G1: Ambar (stok tavana yaklaşınca, en güvenli bölgede: başkent ya da en iç bölge) ve vasal ilhakı (Fetih yalnız vasal toprağından ulaşılabilir kaldıysa)
U.mods.ambar=(T,P,st)=>{if(!h.g1())return;const near=['tahil','odun','tas','demir'].some(k=>S.res[k]>stockCap(k)*P.ambAt);if(!near)return;const c=capIdx();
 const o=own().filter(i=>(S.regions[i].amb||0)<BRK.ambMax).sort((a,b)=>(b===c)-(a===c)||h.enemyAdj(a).length-h.enemyAdj(b).length);if(!o.length)return;const i=o[0];if(canPay(ambCost(i))&&h.resvOk(ambCost(i),T)){buildAmbar(i);st.acts++}};
U.mods.ilhak=(T,P,st)=>{if(!h.g1())return;const lf=fetihLeft(),vn=f=>lf.some(i=>MAP.regions[i].adj.some(j=>S.regions[j].owner===f));
 if(h.isEnd(P)&&lf.length&&!lf.some(i=>MAP.regions[i].adj.some(j=>S.regions[j].owner===0&&canAttack(j,i)&&S.regions[i].troops<20)))for(const f of S.cfg.ais.filter(f=>vasLoyal(f)&&vn(f)))if(S.res.altin>=annexCost(f)){annex(f);st.acts++;return}
 if(!fetihBlocked())return;const v=S.cfg.ais.filter(vasLoyal).sort((a,b)=>annexCost(a)-annexCost(b));for(const f of v){if(S.res.altin>=annexCost(f)){annex(f);st.acts++;if(!fetihBlocked())return}}};
// Alım: altın bütçesi (stok − asgari pay), tahıl bakımı karşılanabilirse. Rol: savunma açığı → okçu; yığınak → ova/vadi hedefinde süvari (demir atılsa),
// nüfus darsa yeniçeri; diğer → piyade. Öncelik: açık > yığınak > yığınağa yakın > başkent. Otomatik üretim yalnız cephe/yığınak/başkentte açık.
const recruitPass=(T,P,st,defOnly)=>{const R=S.regions,G=MAP.regions,o=own(),e=economy(),pl=T.plan||{stages:[],tgt:[],deficit:[]},cap=capIdx();
 const sinks=pl.stages.length?pl.stages:o.filter(i=>h.enemyAdj(i).length),dS=h.ownBfs(sinks.length?sinks:[cap!=null?cap:o[0]]);
 const dDf=pl.deficit.length?h.ownBfs(pl.deficit):null;
 const role=i=>pl.deficit.includes(i)?'def':dDf&&dDf[i]<=2?'near':pl.stages.includes(i)?'atk':h.enemyAdj(i).length?'front':'ic';
 const tgtTer=i=>{const k=pl.stages.indexOf(i);const j=k>=0?pl.tgt[k]:h.enemyAdj(i)[0];return j!=null?MAP.regions[j].terrain:null};
 const pick=i=>{const r=R[i],ro=role(i),can=k=>r.mil>=unitMil(k)&&(!h.g2()||eqCap(k)>0);if((ro==='def'||ro==='near')&&can('okc')&&S.res.odun>=10)return'okc';
  if(ro!=='def'&&ro!=='near'&&can('yen')&&S.res.altin>200)return'yen';const tt=tgtTer(i);if(can('suv')&&(tt==='ova'||tt==='vadi')&&S.res.demir>40)return'suv';
  if(ro==='front'&&h.threatRaw(i,null)>0&&can('okc')&&S.res.odun>40&&rawDef(r.u,0)<h.threatRaw(i,null)*1.6)return'okc';return'piy'};
 const keep=i=>R[i].fields.length?P.popKeepF:P.popKeepN;
 const mr=o.filter(i=>R[i].mil>0);const pr={def:0,near:1,atk:2,front:3,ic:4};mr.sort((a,b)=>pr[role(a)]-pr[role(b)]||dS[a]-dS[b]||R[b].capital-R[a].capital);
 const sv=(T.save||0)+(T.saveSea||0);let bud=S.res.altin-h.reserveA(P,e),tah=S.res.tahil-h.reserveT(P,e),upT=e.net.tahil;
 for(const i of mr){const ro0=role(i),dr=ro0==='def'||ro0==='near';if(defOnly&&!dr)continue;const b2=dr?bud:bud-sv;if(b2<3)continue;const r=R[i],k=pick(i),U1=UNITS[k],c=unitCost(i,k);
  const popN=fl((r.pop-maxPop(i)*keep(i))/U1.pop);let n=Math.min(canRecruit(i,k),popN,fl(b2/(c.altin||1)),c.tahil?fl(tah/c.tahil):99);
  // bakım: tahıl net geliri 0'ın altına düşmesin (stok 6 tur karşılamıyorsa)
  const dUp=.15*U1.up*mil().upkeep*mil().upTahil;if(dUp>0){const lim=fl((upT+Math.max(0,S.res.tahil-40)/6)/dUp);n=Math.min(n,Math.max(0,lim))}
  // surlu hedefe hazırlanan yığınakta birkaç kuşatma takımı (her biri surun %8'ini kırar)
  if(!dr&&r.mil>=unitMil('kus')){const q=pl.stages.indexOf(i),j=q>=0?pl.tgt[q]:null;if(j!=null&&R[j].fort>=2&&r.u.kus<P.kusMax&&S.res.odun>=30){const nk=Math.min(P.kusMax-r.u.kus,canRecruit(i,'kus'),fl(b2/(unitCost(i,'kus').altin||1)));if(nk>0){const b1=S.res.altin;recruit(i,'kus',nk);bud-=b1-S.res.altin;st.rec+=nk}}
   n=Math.min(n,canRecruit(i,k))}
  if(n<1)continue;const b0=S.res.altin;recruit(i,k,n);const sp=b0-S.res.altin;if(sp>0){bud-=sp;tah-=(c.tahil||0)*n;upT-=dUp*n;st.rec+=n;st.acts++}}
 if(defOnly)return;
 // otomatik üretim: savunma rolünde hep; diğerlerinde yalnız artan altın + net gelir karşılıyorsa (rol sırasıyla); biriktirirken kapalı
 let left=Math.max(0,bud-sv)+Math.max(0,e.net.altin)-(sv?1e9:0);
 for(const i of mr){const r=R[i],ro=role(i);r.autoU=pick(i);if(ro==='def'||ro==='near'){r.auto=true;continue}if(ro==='ic'&&i!==cap&&!mil().roads){r.auto=false;continue}
  const k=autoType(i),c=(unitCost(i,k).altin||0)*MIL[r.mil].auto*mil().autoMult/UNITS[k].w;r.auto=left>=c;if(r.auto)left-=c}};
U.mods.askerSav=(T,P,st)=>recruitPass(T,P,st,true);
U.mods.asker=(T,P,st)=>recruitPass(T,P,st,false);
// Olay ikilemleri: değer tahminiyle seçim (sıradaki seçilebilir seçenek yedektir)
h.evPick=(q,P)=>{const E=EVM[q.id],d=q.d,ok=evOk(E,d),A=S.res.altin,e=economy(),rA=h.reserveA(P,e);const pick=(...ks)=>{for(const k of ks)if(ok.includes(k))return k;return ok[0]};
 const isTgt=f=>f!=null&&(own().some(i=>MAP.regions[i].adj.some(j=>S.regions[j].owner===f&&S.regions[j].capital))||aiRegs(f)<=3);
 switch(q.id){
  case'E01':return e.net.tahil<4&&A>=30+rA?pick(0,1):pick(1);
  case'E02':return A>=35+rA?pick(0,1,2):pick(1,2);
  case'E04':return A>=45+rA&&S.res.tahil>=40?pick(0,1):pick(1);
  case'E05':return pick(0);
  case'E06':return!isTgt(d.f)?pick(0,1,2):A>=50+rA+40&&S.morale<90?pick(1,2):pick(2);
  case'E07':return pick(1,0);
  case'E08':return S.res.bilgi<20&&A>150?pick(0,1):pick(1,0);
  case'E09':return pick(0);
  case'E10':return A>=60+rA+40&&S.turn>=S.cfg.grace-2?pick(0,1):pick(1);
  case'E11':return isTgt(d.f)?(totTroops()>=1.5*aiTroops(d.f)?pick(2,1):pick(1)):pick(0,1);
  case'E12':return pick(0,1);case'E13':return pick(0,1);case'E14':return A>=60+rA?pick(0,1):pick(1);
  case'E15':{const r=S.regions[d.i];if(!r||r.owner!==0)return pick(1);const n=6+fl(r.pop*.1),dd=rawDef(r.u,0)*defMult(d.i,0);return dd>=n*1.35?pick(1,0):pick(0,1)}
  case'E16':return pick(0,1);case'E17':return pick(0,1);
  case'E19':return S.ships&&S.ships.some(s=>s.t==='kadirga')?pick(1,0,2):A>=40+rA?pick(0,2):pick(2);case'S3':return h.vasOk(d.f)?pick(0,1):pick(1,0);
  default:return ok[0]}};
// Biat kabulü Fetih'i kilitler mi: f vasal olunca kalan (vasal olmayan) bölgelerin hepsine kendi topraklarımızdan vasal/sıradağ geçmeden ulaşılabilmeli
h.vasOk=f=>{const R=S.regions,G=MAP.regions,bad=w=>w===BLOCK||w===f||isVas(w),seen=new Set(own()),q=[...seen];
 while(q.length){const c=q.shift();for(const j of G[c].adj)if(!seen.has(j)&&!bad(R[j].owner)){seen.add(j);q.push(j)}}
 return R.every((r,i)=>r.owner===0||bad(r.owner)||seen.has(i))};
h.events=(P,st)=>{let n=0;while(S.evQ.length&&!S.over&&n<20){const q=S.evQ[0],k=P.ev==='value'?h.evPick(q,P):evOk(EVM[q.id],q.d)[0];if(!applyEvent(k)){if(!applyEvent(evOk(EVM[q.id],q.d)[0]))S.evQ.shift()}n++;st.evC++}};

// ---- Telemetri (her iki bot için; bot:{tel:true}). Yalnızca okur: durum ve rnd() değişmez ----
// G1: rakip saldırıları resolve() sarmalayıcısıyla sayılır (rnd() tüketmez, sonucu değiştirmez): toplam, oyuncuya, başarılı, aynı tur aynı bölgeye 2+ saldırı (eşgüdüm)
const telHook=()=>{const R0=window.resolve;if(R0.__tel)return;const w=function(ao,from,to,A){const d0=S.regions[to].owner,c0=S.regions[to].capital,x=R0(ao,from,to,A);const T=U.telCur;if(T&&T.hit)T.hit(ao,d0,c0,to,x);return x};w.__tel=1;window.resolve=w};
U.tel=function(){telHook();const RS=['tahil','odun','tas','demir','altin','bilgi'],P0=MAP.playN,snap={},idle={},curve=[];let prev=S.regions.map(r=>r.owner),peak=0,peakT=0,aiPeak=0,aiPeakT=0,t50=null,lost=0,lostAfter50=0,recap=0,hazine=0,famT=0,aiTake=0;const conqT={},ser=[];
 const A={n:0,p:0,pw:0,coord:0,grp:0,cap:0,capW:0,aiCapLost:0,last:{}};let idaS=0,grS=0;const SE={seaT:0,capT:0,trS:0,gaS:0,trAll:0,shipMax:0,fishMax:0,firstShip:null,port:null};
 RS.forEach(k=>idle[k]=[]);
 const T0={hit(ao,d0,c0,to,x){if(ao>0&&ao<NEUTRAL){A.n++;if(d0===0){A.p++;if(x.win)A.pw++;if(c0){A.cap++;if(x.win)A.capW++}const k=S.turn+':'+to;A.last[k]=(A.last[k]||0)+1;if(A.last[k]===2){A.grp++;A.coord+=2}else if(A.last[k]>2)A.coord++}}
   if(ao===0&&x.win&&c0&&isAI(d0))A.aiCapLost++},
  turn(){const t=S.turn,R=S.regions,n=R.reduce((s,r)=>s+(r.owner===0),0),sh=n/P0;if(sh>peak){peak=sh;peakT=t}if(t50==null&&sh>=.5)t50=t;
   for(const k in A.last)if(+k.split(':')[0]<t-1)delete A.last[k];
   for(const f of S.cfg.ais){const a=R.reduce((s,r)=>s+(r.owner===f),0)/P0;if(a>aiPeak){aiPeak=a;aiPeakT=t}}
   R.forEach((r,i)=>{const p=prev[i];if(p!==0&&r.owner===0)conqT[i]=t;if(p===0&&r.owner!==0){lost++;if(t50!=null)lostAfter50++;if(isAI(r.owner)){aiTake++;if(conqT[i]!=null&&t-conqT[i]<=3)recap++}}});prev=R.map(r=>r.owner);
   if(S.log.some(l=>l.t===t&&/^Hazine boş/.test(l.m)))hazine++;if(S.log.some(l=>l.t===t&&/^Kıtlık/.test(l.m)))famT++;
   const e=economy();if(t>=15&&t<=60)for(const k of RS)if(e.net[k]>.5)idle[k].push(S.res[k]/e.net[k]);idaS+=e.idare||0;grS+=e.gross.altin;
   if(e.trade){const q=e.trade;if(q.n){SE.seaT++;if(SE.firstShip==null)SE.firstShip=t;if(q.raw>=q.cap*.98)SE.capT++}if(q.ports&&SE.port==null)SE.port=t;SE.trAll+=q.v;if(t>=50&&t<=80){SE.trS+=q.v;SE.gaS+=e.gross.altin}SE.shipMax=Math.max(SE.shipMax,q.n);SE.fishMax=Math.max(SE.fishMax,own().reduce((s,i)=>s+S.regions[i].fields.filter(f=>f.t==='balik').length,0))}
   if(t%10===0)curve.push(n);
   if(t%5===0){const at=S.cfg.ais.map(f=>aiTroops(f)),ar=S.cfg.ais.map(f=>aiRegs(f));ser.push([t,n,totTroops(),at.reduce((a,b)=>a+b,0),Math.max(0,...at),Math.max(0,...ar),+e.net.altin.toFixed(1),+e.net.tahil.toFixed(1),Math.round(RS.reduce((a,k)=>a+e.gross[k],0)),Math.round(S.res.altin),Math.round(S.res.tahil)])}
   if([20,40,60,80].includes(t))snap[t]={own:n,troops:totTroops(),res:Object.fromEntries(RS.map(k=>[k,Math.round(S.res[k])])),net:Object.fromEntries(RS.map(k=>[k,+e.net[k].toFixed(1)])),gross:Object.fromEntries(RS.map(k=>[k,+e.gross[k].toFixed(1)])),fields:own().reduce((s,i)=>s+S.regions[i].fields.length,0),flv:+(own().reduce((s,i)=>s+S.regions[i].fields.reduce((a,f)=>a+f.lv,0),0)/Math.max(1,own().reduce((s,i)=>s+S.regions[i].fields.length,0))).toFixed(2),milMax:Math.max(0,...own().map(i=>S.regions[i].mil)),tech:techCount(),morale:Math.round(S.morale),
    eq:typeof eqSummary==='function'&&S.cfg.rules!==1?(()=>{const q=eqSummary(),ws=own().flatMap(i=>S.regions[i].ws||[]);return{cov:Object.fromEntries(Object.entries(q).map(([k,v])=>[k,+v.cov.toFixed(2)])),T:Object.fromEntries(Object.entries(q).map(([k,v])=>[k,+v.T.toFixed(2)])),n:Object.fromEntries(Object.entries(q).map(([k,v])=>[k,Math.round(v.n)])),ws:ws.length,wsLv:ws.reduce((a,w)=>a+w.lv,0),wsMax:Math.max(0,...ws.map(w=>w.lv)),wage:+((e.wage&&e.wage.altin)||0).toFixed(1)}})():null,
    sea:e.trade?(()=>{const q=e.trade,P=own().filter(i=>portLv(i)>0);return{ports:P.length,plv:P.reduce((s,i)=>s+portLv(i),0),yard:P.reduce((s,i)=>s+(S.regions[i].port.yard||0),0),ships:q.n,Y:q.Y,tr:+q.v.toFixed(1),cap:+q.cap.toFixed(1),raw:+q.raw.toFixed(1),up:e.sea?+e.sea.altin.toFixed(1):0,fish:own().reduce((s,i)=>s+S.regions[i].fields.filter(f=>f.t==='balik').length,0),aiPort:S.regions.reduce((s,r)=>s+(isAI(r.owner)&&r.port?r.port.lv:0),0)}})():null,
    idare:+(e.idare||0).toFixed(1),cap:typeof stockCap==='function'?Object.fromEntries(RS.map(k=>[k,Math.round(stockCap(k))])):null,unr:own().filter(i=>(S.regions[i].unr||0)>0).length,
    ai:S.cfg.ais.filter(f=>aliveAI(f)).map(f=>{const a=S.ai[f];return[aiRegs(f),aiTroops(f),Math.round(a.h||0),a.tier||0,+(typeof aiB==='function'?aiB(f):0).toFixed(2),typeof aiIncome==='function'&&S.cfg.rules!==1?Math.round(aiIncome(f)):null]})}},
  end(){const med=a=>{if(!a.length)return null;const b=a.slice().sort((x,y)=>x-y);return+b[fl(b.length/2)].toFixed(1)};if(U.telCur===T0)U.telCur=null;
   return{peak:+peak.toFixed(3),peakT,aiPeak:+aiPeak.toFixed(3),aiPeakT,lost,lostAfter50,recap,aiTake,hazine,famT,idle:Object.fromEntries(RS.map(k=>[k,med(idle[k])])),snap,curve,ser,rec:Object.assign({},S.stats.recruited),
    aiA:{n:A.n,p:A.p,pw:A.pw,coord:A.coord,grp:A.grp,cap:A.cap,capW:A.capW,aiCapLost:A.aiCapLost},idaShare:grS?+(idaS/grS).toFixed(3):0,rot:S.stats.rot?Object.fromEntries(Object.entries(S.stats.rot).map(([k,v])=>[k,Math.round(v)])):null,riot:S.stats.riot||0,annex:S.stats.annex||0,milis:S.stats.milis||0,sea:{...SE,trShare:SE.gaS?+(SE.trS/SE.gaS).toFixed(3):null,st:S.stats.sea||null},recPO:(S.stats.recruited.piy||0)+(S.stats.recruited.okc||0)}}};
 U.telCur=T0;return T0};

// ---- Koşu: bot2 ile aynı satır biçimi (+ usta alanları) ----
const sumOK=v=>typeof v==='number'&&isFinite(v);
function check(){const bad=[];for(const k in S.res)if(!sumOK(S.res[k]))bad.push(`res.${k}=${S.res[k]}`);if(!sumOK(S.morale))bad.push('morale='+S.morale);
 S.regions.forEach((r,i)=>{if(!r.u)return;for(const k of UK){if(!sumOK(r.u[k])||r.u[k]<0)bad.push(`r${i}.u.${k}=${r.u[k]}`);if(!sumOK(r.rd[k])||r.rd[k]<0)bad.push(`r${i}.rd.${k}=${r.rd[k]}`)}
  if(r.troops!==sumU(r.u))bad.push(`r${i}.troops=${r.troops}≠${sumU(r.u)}`);if(r.owner!==BLOCK&&(!sumOK(r.pop)||r.pop<0))bad.push(`r${i}.pop=${r.pop}`)});return bad}
const mergeP=o=>{const P=Object.assign({},U.P,o||{});P.atk=Object.assign({},U.P.atk,o&&o.atk||{});P.V=Object.assign({},U.P.V,o&&o.V||{});P.comfort=Object.assign({},U.P.comfort,o&&o.comfort||{});return P};
U.run=async function(seed,maxT,C,tick,cfg){const P=CP=mergeP(C.usta);newGame(seed,cfg);const c0=capIdx();
 for(const t of P.setup)if(S.fund>=fundCost(t)&&S.regions[c0].fields.length<slots(c0))buyStart(t);if(!S.regions[c0].fields.length)autoSetup();finishSetup();closeModal();
 const st={tm:{},atk:0,won:0,fail:0,soft:0,lostA:0,sentA:0,moves:0,rec:0,acts:0,fieldN:0,milN:0,surN:0,evC:0},P0=MAP.playN,errs=[],altD=[],TL=C.tel?U.tel():null;let t25=null,t50=null,t75=null,t100=null,coal=0;
 const altGo=()=>{let n=0;while(S.altQ&&!S.over&&n<4){const q=S.altQ;altD.push({p:q.p,t:q.t,k:P.alt});altPick(P.alt);n++}};
 for(let k=0;k<maxT&&!S.over;k++){const T=CT={turn:S.turn,plan:null};
  for(const m of U.order){const t0=performance.now();try{U.mods[m](T,P,st)}catch(e){if(errs.length<5)errs.push({tur:S.turn,tip:'istisna',m:(m+': '+String(e&&e.stack||e)).slice(0,300)})}st.tm[m]=(st.tm[m]||0)+performance.now()-t0;if(S.over)break}
  if(C.dbg)C.dbg(T,st,h);altGo();const cw=S.coal&&S.coal.on;endTurn();closeModal();altGo();h.events(P,st);closeModal();altGo();
  if(S.coal&&S.coal.on&&!cw)coal++;const n=own().length;if(n>=P0*.25&&!t25)t25=S.turn;if(n>=P0*.5&&!t50)t50=S.turn;if(n>=P0*.75&&!t75)t75=S.turn;if(!t100&&!fetihLeft().length)t100=S.turn;
  const bad=check();if(bad.length&&errs.length<5)errs.push({tur:S.turn,tip:'invariant',m:bad.slice(0,4).join(', ')});if(TL)TL.turn();
  if(tick&&k%tick.every===tick.every-1)await tick.fn(S.turn)}
 const s=S.stats,aiS={};for(const f of S.cfg.ais){const a=S.ai[f],q=aiS[a.per]=aiS[a.per]||{n:0,atk:0,lost:0,end:0};q.n++;q.atk+=a.atk||0;q.lost+=a.lost||0;q.end+=S.regions.filter(r=>r.owner===f).length}
 return{...(TL?{tel:TL.end()}:{}),seed,end:S.turn,over:S.over||'-',winBy:S.winBy||null,own:own().length,playN:P0,t25,t50,t75,t100,left:fetihLeft().length,aisEnd:S.cfg.ais.filter(f=>aliveAI(f)&&!isVas(f)).length,famine:s.famine,coal,akin:s.akinN,acts:+(st.acts/S.turn).toFixed(2),
  ev:s.events,evN:s.evN,choices:s.choices,coalBroken:s.coalBroken,coalJoin:s.coalJoin,wonder:S.wonder.stage,aiWonder:S.aiW.stage,medClosed:S.medClosed!=null,tech:techCount(),hegMax:s.hegMax,hegHeld:s.hegHeld,w1:s.wonderT,wT:s.wT||[],capLost:s.capLost,vassals:s.vassals,maxReg:s.maxRegions,
  atkWon:s.atkWon,atkLost:s.atkLost,defWon:s.defWon,defLost:s.defLost,pers:S.cfg.ais.map(f=>S.ai[f].per),aiS,alt:altD,mile:Object.keys(S.altM||{}),
  usta:{tm:Object.fromEntries(Object.entries(st.tm).map(([k,v])=>[k,Math.round(v)])),atk:st.atk,fail:st.fail,soft:st.soft,lossPct:st.sentA?+(st.lostA/st.sentA).toFixed(3):null,moves:st.moves,rec:st.rec,fieldN:st.fieldN,milN:st.milN,surN:st.surN,loot:Math.round(s.loot),recruited:Object.assign({},s.recruited)},errors:errs}};
})();
