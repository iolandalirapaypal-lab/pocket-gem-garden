/* Destino do loot e as duas mochilas (Mochila e Mochila de Loot).
   Cada item tem uma regra no Assistente: "loot" (Mochila de Loot), "bag" (Mochila) ou "ignore" (fica no chão).
   Cada mochila tem a própria backpack (equip.Mochila e equip.MochilaLoot) e guarda os espaços dela (sem backpack: LawlItems.BAG_BASE).
   Cada espaço guarda um equipamento ou uma pilha de um item agrupável; cheia, só entram unidades de pilhas que você já tem.
   Chaves: "l:Nome" (loot de monstro), "c:id" (poção/runa/munição; "c:hp"/"c:mp" = poções antigas), "g:Nome" (equipamento). */
(function(root){
const DESTS=["bag","loot","ignore"],MAX_RULES=3000,CONS_MAX=100000;
const I=()=>root.LawlItems;
const isKey=k=>typeof k==="string"&&k.length>2&&k.length<=80&&/^[lcg]:/.test(k);
const defaultDest=key=>String(key).startsWith("l:")?"loot":"bag";
const keyOf=it=>it.kind==="gear"?"g:"+(it.name||(it.gear&&it.gear.name)||""):it.kind==="loot"?"l:"+it.name:"c:"+it.id;
/* Só guarda regras diferentes do padrão (loot de monstro → Mochila de Loot; o resto → Mochila). */
function normRoute(r){const out={};if(!r||typeof r!=="object"||Array.isArray(r))return out;let n=0;
 for(const [k,v] of Object.entries(r)){if(n>=MAX_RULES)break;if(isKey(k)&&DESTS.includes(v)&&v!==defaultDest(k)){out[k]=v;n++}}return out}
function routeOf(pl,key){const r=pl&&pl.auto&&pl.auto.route,v=r&&r[key];return DESTS.includes(v)?v:defaultDest(key)}
function setRoute(pl,keys,dest){if(!pl||!DESTS.includes(dest))return 0;pl.auto??={};const r=pl.auto.route=normRoute(pl.auto.route);let n=0;
 for(const k of keys||[]){if(!isKey(k))continue;if(dest===defaultDest(k))delete r[k];else r[k]=dest;n++}return n}
const cap=(pl,which)=>I().bagCapacity(pl&&pl.equip,which);
const used=(pl,which)=>I().bagUsed(pl,which);
function count(pl,key){if(!pl)return 0;const k=String(key),id=k.slice(2);
 if(k.startsWith("l:"))return Math.max(0,+(pl.loot&&pl.loot[id])||0);
 if(k==="c:hp")return Math.max(0,+pl.hpPot||0);if(k==="c:mp")return Math.max(0,+pl.mpPot||0);
 if(k.startsWith("c:"))return Math.max(0,+(pl.cons&&pl.cons[id])||0);return 0}
const where=(pl,key)=>I().stackIn(pl,key);
function setWhere(pl,key,dest){pl.where=pl.where&&typeof pl.where==="object"?pl.where:{};if(dest===defaultDest(key))delete pl.where[key];else pl.where[key]=dest}
function addTo(pl,key,n){const k=String(key),id=k.slice(2);
 if(k.startsWith("l:")){pl.loot??={};pl.loot[id]=(+pl.loot[id]||0)+n}
 else if(k==="c:hp")pl.hpPot=(+pl.hpPot||0)+n;else if(k==="c:mp")pl.mpPot=(+pl.mpPot||0)+n;
 else{pl.cons??={};pl.cons[id]=Math.min(CONS_MAX,(+pl.cons[id]||0)+n)}}
const room=(pl,which,gm)=>!!gm||used(pl,which)<cap(pl,which);
/* Guarda o item na mochila escolhida. Retorna "bag"/"loot" onde ficou, ou "" se não coube (ou destino "ignore").
   Item: {kind:"gear",gear} · {kind:"loot",name,n} · {kind:"cons",id,n}. Pilha que já existe junta mesmo com a mochila cheia. */
function stow(pl,it,dest,gm){if(!pl||!it||(dest!=="bag"&&dest!=="loot"))return "";
 if(it.kind==="gear"){if(!it.gear||!room(pl,dest,gm))return "";const g={...it.gear};delete g.inLoot;if(dest==="loot")g.inLoot=true;(pl.bag??=[]).push(g);return dest}
 const key=keyOf(it),n=Math.max(1,Math.floor(+it.n||1));
 if(count(pl,key)>0){const w=where(pl,key);addTo(pl,key,n);return w}
 if(!room(pl,dest,gm))return "";addTo(pl,key,n);setWhere(pl,key,dest);return dest}
/* Auto-Loot do Assistente: segue a regra do item. */
const take=(pl,it,gm)=>stow(pl,it,routeOf(pl,keyOf(it)),gm);
/* Pegar do chão com o botão: itens marcados "ignore" vão para a mochila padrão deles. */
function pickDest(pl,key){const d=routeOf(pl,key);return d==="ignore"?defaultDest(key):d}
/* Espaços novos que uma bolsa do chão precisa em cada mochila: {bag,loot,ok}. */
function fits(pl,list,gm){const need={bag:0,loot:0},seen=new Set();
 for(const it of list||[]){const key=keyOf(it),d=pickDest(pl,key);
  if(it.kind==="gear"){need[d]++;continue}if(count(pl,key)>0||seen.has(key))continue;seen.add(key);need[d]++}
 const ok=!!gm||(used(pl,"bag")+need.bag<=cap(pl,"bag")&&used(pl,"loot")+need.loot<=cap(pl,"loot"));return {...need,ok}}
/* Move uma pilha ("l:"/"c:") ou um equipamento (índice da mochila) para a outra mochila, se houver espaço. */
function move(pl,ref,to,gm){if(!pl||(to!=="bag"&&to!=="loot"))return {ok:false,reason:"dest"};
 if(typeof ref==="number"){const g=pl.bag&&pl.bag[ref];if(!g)return {ok:false,reason:"none"};if((g.inLoot?"loot":"bag")===to)return {ok:true};
  if(!room(pl,to,gm))return {ok:false,reason:"full"};if(to==="loot")g.inLoot=true;else delete g.inLoot;return {ok:true}}
 if(!isKey(ref)||ref.startsWith("g:")||count(pl,ref)<=0)return {ok:false,reason:"none"};if(where(pl,ref)===to)return {ok:true};
 if(!room(pl,to,gm))return {ok:false,reason:"full"};setWhere(pl,ref,to);return {ok:true}}
/* Limpa o save: só posições válidas de pilhas que existem; equipamento usado nunca fica marcado como da Mochila de Loot. */
function clean(pl){if(!pl)return;const w=pl.where&&typeof pl.where==="object"&&!Array.isArray(pl.where)?pl.where:{},out={};
 for(const [k,v] of Object.entries(w))if(isKey(k)&&!k.startsWith("g:")&&(v==="bag"||v==="loot")&&v!==defaultDest(k)&&count(pl,k)>0)out[k]=v;pl.where=out;
 for(const e of Object.values(pl.equip||{}))if(e&&typeof e==="object")delete e.inLoot;
 for(const e of (pl.depot&&pl.depot.items)||[])if(e&&typeof e==="object")delete e.inLoot;
 for(const e of pl.bag||[])if(e&&typeof e==="object"&&e.inLoot!==true)delete e.inLoot}
root.LawlBags={DESTS,defaultDest,keyOf,normRoute,routeOf,setRoute,cap,used,count,where,stow,take,pickDest,fits,move,clean};
})(typeof window!=="undefined"?window:globalThis);
