/* Assistente de Caça: Auto-Cura + Auto-Loot. Só funciona com Premium ativo E assistente comprado (30 dias).
   Se o Premium acabar antes, o assistente é zerado. Sem ele, o loot cai no chão: 30s só do dono, some em 3 min. */
(function(root){
const DAY=864e5,DAYS=30,PRICE=100,BUNDLE=250,OWNER_MS=30000,LIFE_MS=180000;
const num=v=>Number.isFinite(+v)?+v:0;
function premium(p,now){return !!p&&num(p.premiumUntil)>now}
function active(p,now){return premium(p,now)&&num(p.assistUntil)>now}
/* Zera o assistente quando o Premium acaba ou o prazo vence. Retorna "premium", "expired" ou "". */
function settle(p,now){if(!p||num(p.assistUntil)<=0)return "";
 if(!premium(p,now)){const had=num(p.assistUntil)>now;p.assistUntil=0;return had?"premium":"expired"}
 if(num(p.assistUntil)<=now){p.assistUntil=0;return "expired"}return ""}
function buy(p,now){if(!premium(p,now))return {ok:false,reason:"premium"};if(num(p.gems)<PRICE)return {ok:false,reason:"gems"};
 p.gems=num(p.gems)-PRICE;p.assistUntil=Math.max(now,num(p.assistUntil))+DAYS*DAY;return {ok:true}}
function buyBundle(p,now){if(num(p.gems)<BUNDLE)return {ok:false,reason:"gems"};p.gems=num(p.gems)-BUNDLE;
 p.premiumUntil=Math.max(now,num(p.premiumUntil))+DAYS*DAY;p.assistUntil=Math.max(now,num(p.assistUntil))+DAYS*DAY;return {ok:true}}
function autoLoot(p,now){return active(p,now)&&!(p.auto&&p.auto.loot===false)}
/* Monta o que vai para o chão: XP e gemas sempre entram direto; o resto cai. */
function pile(){return {gold:0,hpPot:0,mpPot:0,loot:{},gear:[]}}
function empty(x){return !x||(!(x.gold>0)&&!(x.hpPot>0)&&!(x.mpPot>0)&&!Object.keys(x.loot||{}).length&&!(x.gear||[]).length)}
function canPick(drop,now){if(!drop||now>=drop.until)return {ok:false,reason:"gone"};if(!drop.mine&&now<drop.freeAt)return {ok:false,reason:"owner",ms:drop.freeAt-now};return {ok:true}}
function left(p,now){return Math.max(0,num(p&&p.assistUntil)-now)}
/* Magias de cura automáticas: 3 espaços, cada um com magia, limite de vida (%) e liga/desliga. */
const SPELL_SLOTS=3,HEAL_KINDS=["heal","hot","massheal"];
function healSpell(sp){return !!sp&&sp.g==="heal"&&HEAL_KINDS.includes(sp.k)}
function normSpells(list){const src=Array.isArray(list)?list:[];return Array.from({length:SPELL_SLOTS},(_,i)=>{const s=src[i]||{};
 return {w:typeof s.w==="string"?s.w.slice(0,40):"",pct:Math.min(99,Math.max(1,Math.round(num(s.pct))||70)),on:!!s.on&&typeof s.w==="string"&&!!s.w}})}
/* Primeiro espaço ligado (ordem 1→3) cuja vida está abaixo do limite e que pode ser lançado agora. */
function pickSpell(slots,hpPct,canCast){for(const s of slots||[]){if(s&&s.on&&s.w&&hpPct<s.pct&&canCast(s.w))return s.w}return ""}
/* Prioridade das curas: sobe (-1) ou desce (+1) um espaço, trocando de lugar com o vizinho. */
function moveSpell(slots,i,dir){const a=normSpells(slots),j=i+(dir<0?-1:1);if(!(i>=0&&i<a.length&&j>=0&&j<a.length))return a;[a[i],a[j]]=[a[j],a[i]];return a}
/* Poção escolhida para a Auto-Cura: precisa ser uma poção que recupera vida ("hp") ou mana ("mp"). */
function potionFits(it,kind){return !!it&&["health","mana","blended"].includes(it.cat)&&(kind==="mp"?(+it.mp>0):(+it.hp>0))}
function normPotion(id,kind,byId){const d=kind==="mp"?"mp":"hp";return typeof id==="string"&&potionFits(byId(id),kind)?id:d}
root.LawlAssist={DAY,DAYS,PRICE,BUNDLE,OWNER_MS,LIFE_MS,SPELL_SLOTS,premium,active,settle,buy,buyBundle,autoLoot,pile,empty,canPick,left,healSpell,normSpells,pickSpell,moveSpell,potionFits,normPotion};
})(typeof window!=="undefined"?window:globalThis);
