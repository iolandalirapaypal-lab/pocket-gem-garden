/* Browser-safe combat rules shared by monster and PvP fights: the damage number shown, dead-player regeneration and the "hurt" broadcast. */
(function(root){
"use strict";
const MAX=100000;
/* The number shown is the HP actually lost: never more than the HP left, never negative. */
function shown(hpBefore,dmg){const h=Math.max(0,Number(hpBefore)||0),d=Math.max(0,Math.round(Number(dmg)||0)),v=Math.min(d,h);return v>0?Math.max(1,Math.round(v)):0}
/* Applies a hit to an entity with .hp and returns the number to show. */
function apply(ent,dmg){const n=shown(ent.hp,dmg);ent.hp=Math.max(0,(Number(ent.hp)||0)-Math.max(0,Math.round(Number(dmg)||0)));return n}
/* A player at 0 HP is dead until respawned at the temple: regeneration must not revive them. */
function regen(hp,max,amount){hp=Number(hp)||0;if(hp<=0)return hp;return Math.min(Number(max)||0,hp+Math.max(0,Number(amount)||0))}
function dead(ent){return !!ent&&(Number(ent.hp)||0)<=0}
/* Sanitises a "hurt" broadcast (damage another player took) before it is drawn. */
function hurtMsg(d){if(!d||typeof d!=="object")return null;
 if(d.miss===true)return {n:0,el:"phys",ms:false,miss:true};
 const n=Math.round(Number(d.n));if(!Number.isFinite(n)||n<1||n>MAX)return null;
 const el=typeof d.el==="string"&&/^[a-z]{1,12}$/.test(d.el)?d.el:"phys";
 return {n,el,ms:d.ms===true,miss:false}}
/* Line of sight for attacks at a distance: trees (2), walls (4, 9) and rock (6, 11) stop basic attacks, spells and runes;
   water and floors do not. Off-map tiles block. Neighbours (and the same tile) always see each other, so melee is unaffected. */
const SHOT_BLOCK=[2,4,6,9,11];
function blocksShot(t){return t===undefined||t===null||SHOT_BLOCK.includes(t)}
function ray(ax,ay,bx,by,tileAt){let x=ax,y=ay;const dx=Math.abs(bx-ax),dy=Math.abs(by-ay),sx=ax<bx?1:-1,sy=ay<by?1:-1;let err=dx-dy;
 while(x!==bx||y!==by){const e=2*err;if(e>-dy){err-=dy;x+=sx}if(e<dx){err+=dx;y+=sy}if((x!==bx||y!==by)&&blocksShot(tileAt(x,y)))return false}return true}
/* Symmetric: clear when either straight line (a→b or b→a) passes, so attacker and victim always agree. */
function sight(ax,ay,bx,by,tileAt){ax=Math.round(ax);ay=Math.round(ay);bx=Math.round(bx);by=Math.round(by);
 if(Math.max(Math.abs(ax-bx),Math.abs(ay-by))<=1)return true;return ray(ax,ay,bx,by,tileAt)||ray(bx,by,ax,ay,tileAt)}
/* Keeps only the area cells a spell/rune centred on (cx,cy) can reach: not on a blocking tile and not behind one. */
function reach(cells,cx,cy,tileAt){return (cells||[]).filter(([x,y])=>!blocksShot(tileAt(x,y))&&sight(cx,cy,x,y,tileAt))}
root.LawlCombat={MAX,shown,apply,regen,dead,hurtMsg,SHOT_BLOCK,blocksShot,sight,reach};
})(typeof window!=="undefined"?window:globalThis);
