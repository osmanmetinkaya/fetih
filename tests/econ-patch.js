// 1c ekonomi/denge ölçümü: iframe içinde (oyunun global kapsamında) eval edilir. index.html'e dokunmaz; yalnızca global işlevleri sarar.
// TEL: oyun başına {seed, turns:[tur kaydı], start:{tur:stok}, opts:{tur:{...}}, end:{...}}
(function(){
if(window.__ECON)return;window.__ECON=1;
const TEL=window.TEL=[];let cur=null;
const Z0=()=>({piy:0,okc:0,suv:0,kus:0,yen:0});
let man=Z0(),att,attW,attU,attSV,fortSum,fortN,act;
const reset=()=>{man=Z0();att=0;attW=0;attU=Z0();attSV=Z0();fortSum=0;fortN=0;act={res:0,fup:0,fnew:0,mil:0,sur:0,rec:0,atk:0}};reset();
const cp=o=>JSON.parse(JSON.stringify(o));
const _new=newGame;newGame=function(seed,cfg){const r=_new.apply(this,arguments);cur={seed,turns:[],start:{},opts:{},end:null};TEL.push(cur);reset();return r};
const _recruit=recruit;recruit=function(i,k,n){const b=S.stats.recruited[k];const r=_recruit.apply(this,arguments);const d=S.stats.recruited[k]-b;if(d>0){man[k]+=d;act.rec++}return r};
const _research=research;research=function(b,k){const t=S.tech[b];const r=_research.apply(this,arguments);if(S.tech[b]>t)act.res++;return r};
const _uf=upgradeField;upgradeField=function(i,k){const f=S.regions[i].fields[k],l=f&&f.lv;const r=_uf.apply(this,arguments);if(f&&f.lv>l)act.fup++;return r};
const _bf=buildField;buildField=function(i,t){const n=S.regions[i].fields.length;const r=_bf.apply(this,arguments);if(S.regions[i].fields.length>n)act.fnew++;return r};
const _um=upgradeMil;upgradeMil=function(i){const m=S.regions[i].mil;const r=_um.apply(this,arguments);if(S.regions[i].mil>m)act.mil++;return r};
const _bs=buildSur;buildSur=function(i){const f=S.regions[i].fort;const r=_bs.apply(this,arguments);if(S.regions[i].fort>f)act.sur++;return r};
const _resolve=resolve;resolve=function(ao,from,to,A){const fo=S.regions[to].fort,ow=S.regions[to].owner;const x=_resolve.apply(this,arguments);
 if(ao===0){att++;act.atk++;for(const k of UK)attU[k]+=A[k]||0;fortSum+=fo;if(fo>0)fortN++;if(x&&x.win){attW++;if(x.SV)for(const k of UK)attSV[k]+=x.SV[k]||0}}return x};
function opts(){const o={res:0,fup:0,fnew:0,mil:0,rec:0,sur:0,atk:0},own_=own();const mx=mil().maxField;
 for(const b of ['ure','eko','sal','sav','str','kus'])if(S.tech[b]<4&&S.res.bilgi>=tcost(S.tech[b]))o.res++;
 const ft=new Set(),nt=new Set(),ut=new Set();let ms=0,sr=0,at=0;
 for(const i of own_){const r=S.regions[i];
  r.fields.forEach(f=>{if(f.lv<mx&&canPay(upFieldCost(f)))ft.add(f.t)});
  if(r.fields.length<slots(i)){const have=new Set(r.fields.map(f=>f.t));for(const t of Object.keys(FIELD))if(!have.has(t)&&canPay(newFieldCost(t)))nt.add(t)}
  const nx=r.mil+1;if(nx<=5&&S.tech.ure>=MIL[nx].tech&&canPay(milCost(nx)))ms++;
  if(r.mil)for(const k of UK)if(r.mil>=unitMil(k)&&canRecruit(i,k)>0)ut.add(k);
  if(r.fort<maxFort(i)&&canPay(surCost(i)))sr++;
  if(S.turn<=40&&r.ready>=1)for(const j of MAP.regions[i].adj)if(S.regions[j].owner>0&&S.regions[j].owner!==BLOCK&&(typeof canAttack!=='function'||canAttack(i,j))){try{if(previewAtk(i,j,{...r.rd}).ch>.5)at++}catch(e){}}}
 o.fup=ft.size;o.fnew=nt.size;o.mil=ms;o.rec=ut.size;o.sur=sr;o.atk=at;return o}
function recOpts(){if(!cur||!S||S.over)return;cur.start[S.turn]=cp(S.res);if(S.turn<=40)cur.opts[S.turn]=opts()}
const _fin=finishSetup;finishSetup=function(){const r=_fin.apply(this,arguments);recOpts();return r};
function endRec(){const st=S.stats;cur.end={turn:S.turn,over:S.over,winBy:S.winBy,own:own().length,rec:cp(st.recruited),loot:Math.round(st.loot),atkWon:st.atkWon,atkLost:st.atkLost,defWon:st.defWon,defLost:st.defLost,surBuilt:st.surBuilt,famine:st.famine,tech:cp(S.tech),milh:(()=>{const h=[0,0,0,0,0,0];for(const i of own())h[S.regions[i].mil]++;return h})()}}
const _ce=checkEnd;checkEnd=function(){const r=_ce.apply(this,arguments);if(S&&S.over&&cur&&!cur.end)endRec();return r};
// başkentin bir sonraki kademesinde eksik olan kaynaklar
function blk(){const c=capIdx();if(c==null)return null;const r=S.regions[c],nx=r.mil+1;if(nx>5)return['max'];const out=[];if(S.tech.ure<MIL[nx].tech)out.push('tek');const cs=milCost(nx);for(const k in cs)if(S.res[k]<cs[k])out.push(k);return out}
const _end=endTurn;endTurn=function(){
 if(!S||S.over||S.phase!=='oyun'||S.evQ.length||!cur)return _end.apply(this,arguments);
 const t=S.turn,e=economy(),pre=cp(S.res),st=S.stats,rec0=cp(st.recruited),loot0=st.loot,fam0=st.famine,m0=S.morale;
 const own_=own();const R={t,own:own_.length,pop:Math.round(e.pop),mpop:Math.round(e.mpop),troops:e.troops,morale:Math.round(S.morale),
  gross:cp(e.gross),up:cp(e.up),pre,
  starve:S.res.tahil+e.net.tahil<0?1:0,broke:S.res.altin+e.net.altin<0?1:0,
  tech:[S.tech.sal,S.tech.sav,S.tech.kus,S.tech.eko,S.tech.ure,S.tech.str],
  milh:[0,0,0,0,0,0],fl:{},fc:{},sur:0,uni:Z0(),ready:0,
  man:cp(man),act:cp(act),att,attW,attU:cp(attU),attSV:cp(attSV),fortN,fortSum};
 for(const i of own_){const r=S.regions[i];R.milh[r.mil]++;R.sur+=r.fort;R.ready+=r.ready;for(const k of UK)R.uni[k]+=r.u[k];
  r.fields.forEach(f=>{R.fc[f.t]=(R.fc[f.t]||0)+1;R.fl[f.t]=(R.fl[f.t]||0)+f.lv})}
 R.blk=blk();
 try{const d=declInfo();R.dr=+d.r.toFixed(2);R.dsh=+d.sh.toFixed(3);R.dok=d.ok?1:0}catch(x){}
 let ai=0;for(const f of S.cfg.ais)ai+=aiRegs(f);R.aiReg=ai;
 reset();
 const r=_end.apply(this,arguments);
 R.auto={};for(const k of UK)R.auto[k]=st.recruited[k]-rec0[k]-R.man[k];
 R.loot=Math.round(st.loot-loot0);R.fam=st.famine-fam0;R.post=cp(S.res);
 cur.turns.push(R);
 if(S.over&&!cur.end)endRec();
 else recOpts();
 return r};
})();
