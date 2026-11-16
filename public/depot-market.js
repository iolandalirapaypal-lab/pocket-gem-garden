/* Mercado do Depot (estilo Lawl): ofertas de compra e venda entre jogadores.
   Regras compartilhadas, sem DOM: taxa, limites e movimentação do depot. */
(function(root){
"use strict";
const MAX_STACK=2000,MAX_GEAR=1,MAX_PRICE=1e9,MAX_TOTAL=1e10,MAX_OFFERS=100,DAYS=30,FEE_RATE=0.02,FEE_MIN=20,FEE_MAX=1e6;
/* Taxa de criação em ouro: 2% do total, mínimo 20 e máximo 1.000.000 (não é devolvida ao cancelar). */
function fee(total){total=Math.max(0,Math.floor(Number(total)||0));return Math.min(FEE_MAX,Math.max(FEE_MIN,Math.ceil(total*FEE_RATE)))}
const maxAmount=kind=>kind==="gear"?MAX_GEAR:MAX_STACK;
function check(d){
 if(!d||(d.side!=="sell"&&d.side!=="buy")||(d.kind!=="gear"&&d.kind!=="loot")||!d.item)return {ok:false,reason:"Escolha um item."};
 const n=Number(d.amount),pr=Number(d.price);
 if(!Number.isInteger(n)||n<1||n>maxAmount(d.kind))return {ok:false,reason:d.kind==="gear"?"Equipamentos são vendidos um por oferta.":"Escolha de 1 a 2000 unidades."};
 if(!Number.isInteger(pr)||pr<1||pr>MAX_PRICE)return {ok:false,reason:"Preço por unidade deve ser de 1 a 1.000.000.000 🪙."};
 const total=n*pr;if(total>MAX_TOTAL)return {ok:false,reason:"O valor total passa do limite de 10.000.000.000 🪙."};
 const f=fee(total);return {ok:true,total,fee:f,cost:d.side==="buy"?total+f:f};
}
/* Quantas unidades de um item existem no depot. keyOf identifica equipamentos (nome|vocação). */
function have(depot,kind,item,keyOf){if(!depot)return 0;
 if(kind==="loot")return Math.max(0,Math.floor(Number(depot.loot&&depot.loot[item])||0));
 return (depot.items||[]).filter(e=>keyOf(e)===item).length}
/* Tira n unidades do depot; devolve {charge} (carga de botas etc.) ou null se não houver. */
function take(depot,kind,item,n,keyOf){if(have(depot,kind,item,keyOf)<n||n<1)return null;
 if(kind==="loot"){depot.loot[item]-=n;if(depot.loot[item]<=0)delete depot.loot[item];return {charge:null}}
 const i=depot.items.findIndex(e=>keyOf(e)===item),[e]=depot.items.splice(i,1);
 return {charge:e&&Number.isFinite(e.charge)?e.charge:null}}
/* Coloca no depot o que o servidor entregou. catalogFor recria o equipamento pelo nome|vocação. */
function give(p,dl,catalogFor,isLoot){p.depot??={items:[],loot:{}};p.depot.items??=[];p.depot.loot??={};
 const n=Math.max(0,Math.floor(Number(dl.amount)||0)),g=Math.max(0,Math.floor(Number(dl.gold)||0));
 p.gold=(Number(p.gold)||0)+g;let got=0;
 if(n>0&&dl.kind==="loot"&&isLoot(dl.item)){p.depot.loot[dl.item]=(p.depot.loot[dl.item]||0)+n;got=n}
 else if(n>0&&dl.kind==="gear"){const e=catalogFor(dl.item);if(e)for(let k=0;k<n;k++){const it={...e};if(dl.charge!=null&&Number.isFinite(Number(dl.charge)))it.charge=Number(dl.charge);p.depot.items.push(it);got++}}
 return {gold:g,items:got}}
root.LawlDepotMarket={MAX_STACK,MAX_GEAR,MAX_PRICE,MAX_TOTAL,MAX_OFFERS,DAYS,fee,maxAmount,check,have,take,give};
})(typeof window!=="undefined"?window:globalThis);
