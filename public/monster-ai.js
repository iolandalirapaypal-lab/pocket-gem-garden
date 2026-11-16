(function(root){
 "use strict";
 // Catalogs without an explicit level derive it from combat rewards; never from the player's level.
 // Monsters walk at 45% of their catalog speed (cut by 55% because hunts felt too fast).
 const SPEED_SCALE=.45;
 function profile(m){
  const t=m.t||m,level=Math.max(1,Number(t.level)||Math.round(Math.sqrt(Math.max(1,Number(t.xp)||1)/2)));
  const strength=Math.sqrt(Math.max(0,Number(t.hp)||0))/3+Math.max(0,Number(t.dmg)||0)/2;
  // Some wiki monsters (Rat, Snake, Bat...) publish speed 0; they use the derived speed instead of crawling one SQM every ~3 minutes.
  const wiki=Number(t.speed)>0?Number(t.speed):0,base=t.official&&wiki?wiki:Math.min(300,105+level*2+strength);
  const speed=base*(t.official&&m.hasteUntil>Date.now()?1.3:1)*SPEED_SCALE;
  return {level,speed,step:Math.round(75000/speed)/1000,sight:Math.min(12,7+Math.floor(level/10)),leash:Math.min(15,10+Math.floor(level/10))};
 }
 function target(m,players,allowed){
  const stats=profile(m),radius=m._hunting?stats.leash:stats.sight;
  let best=null,distance=Infinity;
  for(const q of players){if(q.z!==m.z||q.hp<=0||!allowed(q))continue;const d=Math.max(Math.abs(q.x-m.x),Math.abs(q.y-m.y));if(d<=radius&&d<distance){best=q;distance=d}}
  return best;
 }
 function tick(m,dt,engaged){
  m.mv=(Number(m.mv)||0)-dt;
  if(engaged&&!m._hunting)m.mv=0; // interrupt idle wandering immediately on detection
  m._hunting=engaged;
  return m.mv<=0;
 }
 const DIRS=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
 // True when none of the 8 SQM around the target is free to stand on (walls and other creatures block).
 function surrounded(tx,ty,pass,occ){for(const [dx,dy] of DIRS){const x=tx+dx,y=ty+dy;if(pass(x,y)&&!occ(x,y))return false}return true}
 // A melee monster that cannot reach the target wanders one random SQM (or waits) and re-checks next step.
 function wander(m,pass,occ,rnd=Math.random){
  if(rnd()<.5)return null;
  const opts=DIRS.filter(([dx,dy])=>pass(m.x+dx,m.y+dy)&&!occ(m.x+dx,m.y+dy)&&(!dx||!dy||pass(m.x+dx,m.y)||pass(m.x,m.y+dy)));
  return opts.length?opts[Math.floor(rnd()*opts.length)]:null;
 }
 /* Idle step: random, but a monster pressed against 2+ others steps away from them, so piles left after a lure break up. */
 function idleDir(m,occ,rnd=Math.random){let n=0,ax=0,ay=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&occ(m.x+dx,m.y+dy)){n++;ax+=dx;ay+=dy}
  if(n>=2&&(ax||ay))return [-Math.sign(ax),-Math.sign(ay)];return [Math.floor(rnd()*3)-1,Math.floor(rnd()*3)-1]}
 root.LawlMonsterAI={profile,target,tick,surrounded,wander,idleDir,SPEED_SCALE};
})(globalThis);