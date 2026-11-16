/* Imbuimentos (Charging do Lawl MMORPG): bônus do personagem comprados com Charles e cancelados com Russel.
   Cada tipo tem 3 níveis (Básico, Intermediário, Extremo). O tempo (20h) só corre em combate.
   O personagem guarda até MAX_OWNED imbuimentos (um por tipo) e só MAX_ACTIVE ficam ligados ao mesmo tempo.
   Save: p.charging = [{t:"life",tier:3,left:segundos,on:true}]. Os valores vêm sempre deste catálogo, nunca do save. */
(function(root){
const DURATION=20*3600,MAX_OWNED=8,MAX_ACTIVE=4,COMBAT_MS=10000,CRIT_CHANCE=10;
const TIERS=[
 {k:1,n:"Básico",short:"Básico",lvl:20,gold:15000,prem:false},
 {k:2,n:"Intermediário",short:"Interm.",lvl:60,gold:50000,prem:false},
 {k:3,n:"Extremo",short:"Extremo",lvl:150,gold:150000,prem:true}];
// Quantidade de cada criatura pedida: o nível N pede os N primeiros itens do tipo.
const COUNTS=[20,15,10];
const GROUPS=[["misc","Diversos"],["skill","Habilidades"],["prot","Proteção"]];
const TYPES=[
 {id:"speed",grp:"misc",n:"Velocidade",ic:"💨",v:[10,15,30],items:["Elf Ear","Cyclops Hair","Witch Finger"]},
 {id:"life",grp:"misc",n:"Vida",ic:"🩸",v:[5,10,25],items:["Bat Wing","Werewolf Tooth","Necromancy Witchcraft"]},
 {id:"mana",grp:"misc",n:"Mana",ic:"🔮",v:[3,5,8],items:["Orc Ear","Magic Sand Bottle","Mystic Trinket"]},
 {id:"crit",grp:"misc",n:"Crítico",ic:"💥",v:[10,25,50],items:["Orc Skin","Minotaur Horn","Demon Horn"]},
 {id:"melee",grp:"skill",n:"Corpo a Corpo",ic:"⚔️",skill:"sword",v:[1,2,4],items:["Orc Chain","Minotaur Skull","Dragon Claw"]},
 {id:"distance",grp:"skill",n:"Distância",ic:"🏹",skill:"distance",v:[1,2,4],items:["Elf Tiara","Hunter Quiver","Royal Dragon Claw"]},
 {id:"magic",grp:"skill",n:"Magia",ic:"🪄",skill:"magic",v:[1,2,4],items:["Cyclops Eye","Magic Sand Bag","Eye"]},
 {id:"defense",grp:"skill",n:"Defesa",ic:"🛡️",skill:"shielding",v:[1,2,4],items:["Dwarvin Skull","Nose Ring","Dry Dragon Bones"]},
 {id:"fire",grp:"prot",n:"Fogo",ic:"🔥",el:"fire",v:[3,8,15],items:["Dragon Leather","Dragon Egg","Royal Dragon Leather"]},
 {id:"ice",grp:"prot",n:"Gelo",ic:"❄️",el:"ice",v:[3,8,15],items:["Frozen Dragon Leather","White Piece of Cloth","Frozen Dragon Claw"]},
 {id:"earth",grp:"prot",n:"Terra",ic:"🌿",el:"earth",v:[3,8,15],items:["Spider Poison","Snake Skin","Remains of a Hydra"]},
 {id:"energy",grp:"prot",n:"Energia",ic:"⚡",el:"energy",v:[3,8,15],items:["Thunder Dragon Leather","Green Piece of Cloth","Thunder Dragon Claw"]},
 {id:"death",grp:"prot",n:"Morte",ic:"💀",el:"death",v:[2,5,10],items:["Hollow Bone","Scream in a Bottle","Grim Reaper Hood"]}];
const BY_ID=new Map(TYPES.map(x=>[x.id,x]));
const SKILL_NAME={sword:"Corpo a Corpo",distance:"Distância",magic:"Magia",shielding:"Defesa"};
const byId=id=>BY_ID.get(id)||null;
const tierOf=k=>TIERS.find(t=>t.k===Number(k))||null;
const valueOf=(id,k)=>{const T=byId(id),t=tierOf(k);return T&&t?T.v[t.k-1]:0};
function recipe(id,k){const T=byId(id),t=tierOf(k);if(!T||!t)return [];return T.items.slice(0,t.k).map((name,i)=>({name,n:COUNTS[i]}))}
function effectText(id,k){const T=byId(id),v=valueOf(id,k);if(!T||!v)return "";
 if(id==="speed")return `+${v} de velocidade`;
 if(id==="life")return `+${v}% de dreno de vida com 100% de chance`;
 if(id==="mana")return `+${v}% de dreno de mana com 100% de chance`;
 if(id==="crit")return `+${v}% de dano crítico com ${CRIT_CHANCE}% de chance`;
 if(T.skill)return `+${v} de ${SKILL_NAME[T.skill]}`;
 return `+${v}% de proteção contra ${T.n}`}
function describe(id,k){const t=tierOf(k);if(!byId(id)||!t)return [];
 return [effectText(id,k),`Duração: ${DURATION/3600}h`,"Ativação: em combate",`Nível necessário: ${t.lvl}`,`Só Premium: ${t.prem?"Sim":"Não"}`]}
const list=pl=>Array.isArray(pl&&pl.charging)?pl.charging:[];
const entry=(pl,id)=>list(pl).find(e=>e.t===id)||null;
const activeCount=pl=>list(pl).filter(e=>e.on).length;
// Save limpo: tipos conhecidos, um por tipo, nível 1–3, tempo 0–20h, até 8 guardados e no máximo 4 ligados.
function normalize(raw){const out=[],seen=new Set();let on=0;
 for(const e of Array.isArray(raw)?raw:[]){if(out.length>=MAX_OWNED)break;if(!e||typeof e!=="object")continue;
  const T=byId(e.t),t=tierOf(e.tier),left=Number(e.left);if(!T||!t||seen.has(T.id)||!Number.isFinite(left)||left<=0)continue;
  seen.add(T.id);const isOn=e.on===true&&on<MAX_ACTIVE;if(isOn)on++;out.push({t:T.id,tier:t.k,left:Math.min(DURATION,left),on:isOn})}
 return out}
const lootOf=(pl,n)=>Math.max(0,Math.floor(Number(pl&&pl.loot&&pl.loot[n])||0));
// ctx: {premium}. Retorna {ok,reason,missing:[{name,n,have}],gold}.
function check(pl,id,k,ctx){const T=byId(id),t=tierOf(k);if(!pl||!T||!t)return {ok:false,reason:"unknown"};
 const missing=recipe(id,k).map(r=>({...r,have:lootOf(pl,r.name)})).filter(r=>r.have<r.n);
 const base={missing,gold:t.gold};
 if(entry(pl,id))return {...base,ok:false,reason:"owned"};
 if(list(pl).length>=MAX_OWNED)return {...base,ok:false,reason:"full"};
 if((Number(pl.level)||0)<t.lvl)return {...base,ok:false,reason:"level"};
 if(t.prem&&!(ctx&&ctx.premium))return {...base,ok:false,reason:"premium"};
 if((Number(pl.gold)||0)<t.gold)return {...base,ok:false,reason:"gold"};
 if(missing.length)return {...base,ok:false,reason:"items"};
 return {...base,ok:true}}
// Cobra ouro e itens e adiciona o imbuimento; liga sozinho se houver menos de 4 ligados.
function charge(pl,id,k,ctx){const c=check(pl,id,k,ctx);if(!c.ok)return c;const t=tierOf(k);
 pl.gold-=t.gold;for(const r of recipe(id,k)){pl.loot[r.name]-=r.n;if(pl.loot[r.name]<=0)delete pl.loot[r.name]}
 pl.charging=normalize(pl.charging);const e={t:id,tier:t.k,left:DURATION,on:activeCount(pl)<MAX_ACTIVE};pl.charging.push(e);return {ok:true,entry:e}}
// Russel: remove o imbuimento (sem devolver ouro ou itens).
function cancel(pl,id){const l=list(pl),i=l.findIndex(e=>e.t===id);if(i<0)return null;const [e]=l.splice(i,1);return e}
// Liga/desliga um imbuimento; ligar falha quando já há 4 ligados.
function toggle(pl,id){const e=entry(pl,id);if(!e)return {ok:false,reason:"none"};
 if(e.on){e.on=false;return {ok:true,on:false}}if(activeCount(pl)>=MAX_ACTIVE)return {ok:false,reason:"active"};e.on=true;return {ok:true,on:true}}
// Funciona agora: ligado, com tempo e (no Extremo) com Premium ativo.
const works=(e,premium)=>!!e&&e.on&&e.left>0&&(!(tierOf(e.tier)||{}).prem||!!premium);
function bonus(pl,premium){const out={skill:{},res:{},speed:0,life:0,mana:0,crit:0};
 for(const e of list(pl)){if(!works(e,premium))continue;const T=byId(e.t),v=valueOf(e.t,e.tier);if(!T||!v)continue;
  if(T.skill)out.skill[T.skill]=(out.skill[T.skill]||0)+v;else if(T.el)out.res[T.el]=(out.res[T.el]||0)+v;else out[T.id]+=v}
 return out}
// Soma habilidades e proteções dos imbuimentos aos bônus dos equipamentos (proteção limitada a cap).
function merge(eq,pl,premium,cap){const b=bonus(pl,premium),out={...eq,skill:{...(eq&&eq.skill)},res:{...(eq&&eq.res)}};
 for(const k in b.skill)out.skill[k]=(out.skill[k]||0)+b.skill[k];
 for(const k in b.res)out.res[k]=Math.min(Number(cap)||100,(out.res[k]||0)+b.res[k]);return out}
// Um quadro do jogo: só desconta tempo em combate; devolve os que acabaram (já removidos).
function tick(pl,dt,inCombat,premium){if(!inCombat)return [];const gone=[],d=Math.max(0,Number(dt)||0);if(!d)return gone;
 for(const e of list(pl))if(works(e,premium)){e.left-=d;if(e.left<=0)gone.push(e)}
 if(gone.length)pl.charging=list(pl).filter(e=>!gone.includes(e));return gone}
// Crítico: CRIT_CHANCE% de chance de somar o bônus ao dano; r = sorteio 0..1.
function strike(b,dmg,r){const d=Number(dmg)||0;if(!b||!(b.crit>0)||d<=0)return {dmg:d,crit:false};
 const roll=typeof r==="number"?r:Math.random();if(roll*100>=CRIT_CHANCE)return {dmg:d,crit:false};return {dmg:Math.round(d*(1+b.crit/100)),crit:true}}
// Dreno de vida e mana sobre o dano causado.
function leech(b,dmg){const d=Math.max(0,Number(dmg)||0);return {hp:b?Math.round(d*b.life/100):0,mp:b?Math.round(d*b.mana/100):0}}
function leftText(s){const m=Math.max(0,Math.ceil((Number(s)||0)/60));return `${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}min`}
root.LawlCharging={DURATION,MAX_OWNED,MAX_ACTIVE,COMBAT_MS,CRIT_CHANCE,TIERS,COUNTS,GROUPS,TYPES,byId,tierOf,valueOf,recipe,effectText,describe,entry,activeCount,normalize,check,charge,cancel,toggle,works,bonus,merge,tick,strike,leech,leftText};
})(typeof window!=="undefined"?window:globalThis);
