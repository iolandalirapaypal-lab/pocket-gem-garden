/* Lawl underground caves: deterministic organic layouts (hub, lure chambers, looping tunnels, dead-end spurs). */
(function(root){
"use strict";
function rng(seed){let s=Math.abs(Math.floor(seed))%2147483647||1;return()=>((s=s*16807%2147483647)-1)/2147483646}
const ROCK=6,FLOOR=7;
function carve(grid,z,seed){
 const R=rng(seed),x1=z.x1+1,x2=z.x2-1,y1=z.y1+1,y2=z.y2-1,cx=z.cx,cy=z.cy;
 const inb=(x,y)=>x>=x1&&x<=x2&&y>=y1&&y<=y2,set=(x,y)=>{if(inb(x,y))grid[y][x]=FLOOR},isF=(x,y)=>inb(x,y)&&grid[y][x]===FLOOR;
 for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)grid[y][x]=ROCK;
 const blob=(bx,by,r)=>{const k=Math.ceil(r+1);for(let dy=-k;dy<=k;dy++)for(let dx=-k;dx<=k;dx++){if(Math.hypot(dx,dy*1.15)<=r+(R()-.5)*1.3)set(bx+dx,by+dy)}};
 // corridors are 2 or 3 SQM wide: a w×w stamp is pressed at every step of the walk
 const stamp=(x,y,w)=>{const o=w>=3?1:0;for(let j=0;j<w;j++)for(let i=0;i<w;i++)set(x+i-o,y+j-o)};
 const tunnel=(ax,ay,bx,by,wide)=>{const w=wide?3:2;let x=ax,y=ay;stamp(x,y,w);for(let n=0;n<500&&(x!==bx||y!==by);n++){
   const ddx=bx-x,ddy=by-y,r=R();
   if(r<.68){if(Math.abs(ddx)>=Math.abs(ddy)?ddx:!ddy)x+=Math.sign(ddx)||1;else y+=Math.sign(ddy)}
   else if(r<.84){if(ddx)x+=Math.sign(ddx);else y+=Math.sign(ddy)}
   else if(Math.abs(ddx)>=Math.abs(ddy))y+=R()<.5?-1:1;else x+=R()<.5?-1:1;
   x=Math.max(x1,Math.min(x2,x));y=Math.max(y1,Math.min(y2,y));stamp(x,y,w)}};
 // open areas grow between 1x and 3x their original area (radius × √factor)
 const grow=r=>r*Math.sqrt(1+R()*2);
 // central hub around the stairs (and the boss portal at cx+2)
 blob(cx,cy,grow(2.3));for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+3;x++)set(x,y);
 // lure chambers near the corners and edges
 const iw=x2-x1+1,ih=y2-y1+1,area=iw*ih,inset=3,j=()=>Math.round((R()-.5)*2);
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const k=Math.floor(R()*(i+1));[a[i],a[k]]=[a[k],a[i]]}return a};
 const corners=shuffle([[x1+inset,y1+inset],[x2-inset,y1+inset],[x1+inset,y2-inset],[x2-inset,y2-inset]]);
 const mids=shuffle([[cx,y1+inset-1],[cx,y2-inset+1],[x1+inset-1,cy],[x2-inset+1,cy]]);
 const cand=[...corners,...mids].map(([a,b])=>[a+j(),b+j()]).filter(([a,b])=>Math.hypot(a-cx,b-cy)>=5);
 const want=area<280?4:area<420?5:6,big=area>=420?3.3:area>=300?2.7:2.3;
 const ch=cand.slice(0,Math.min(want,cand.length)).map(([a,b],i)=>({x:a,y:b,r:i===0?big+.4:2+R()*(big-2)}));
 ch.forEach(c=>{c.r=grow(c.r);blob(c.x,c.y,c.r)});
 // ring of tunnels between chambers (several routes) plus links from the hub
 ch.sort((a,b)=>Math.atan2(a.y-cy,a.x-cx)-Math.atan2(b.y-cy,b.x-cx));
 for(let i=0;i<ch.length;i++){const a=ch[i],b=ch[(i+1)%ch.length];if(i<ch.length-1||R()<.75)tunnel(a.x,a.y,b.x,b.y,R()<.4)}
 const near=[...ch].sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy));
 tunnel(cx,cy,near[0].x,near[0].y,true);
 if(near.length>2){const far=near[near.length-1];tunnel(cx,cy,far.x,far.y,false)}
 if(near.length>3)tunnel(cx,cy,near[2].x,near[2].y,R()<.5);
 // pointed dead-end spurs ("bicos")
 const spurs=4+Math.floor(R()*4),D=[[1,0],[-1,0],[0,1],[0,-1]];
 for(let s=0,t=0;s<spurs&&t<200;t++){const x=x1+Math.floor(R()*iw),y=y1+Math.floor(R()*ih);if(!isF(x,y))continue;
  let [dx,dy]=D[Math.floor(R()*4)],px=x,py=y;const len=2+Math.floor(R()*4);
  for(let k=0;k<len;k++){if(R()<.3)[dx,dy]=R()<.5?[dy,dx]:[-dy,-dx];px+=dx;py+=dy;if(!inb(px,py))break;stamp(px,py,2)}s++}
 // no 1-SQM passages: any floor tile squeezed between rock on opposite sides gets a second lane
 for(let pass=0,changed=true;changed&&pass<12;pass++){changed=false;
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){if(!isF(x,y))continue;
   if(!isF(x-1,y)&&!isF(x+1,y)){if(inb(x+1,y))set(x+1,y);else set(x-1,y);changed=true}
   if(!isF(x,y-1)&&!isF(x,y+1)){if(inb(x,y+1))set(x,y+1);else set(x,y-1);changed=true}}}
 // rock pillars inside open areas: need a 5×5 open patch so at least 2 SQM stay free around each one
 for(let y=y1+2;y<y2-1;y++)for(let x=x1+2;x<x2-1;x++){if(Math.max(Math.abs(x-cx),Math.abs(y-cy))<=3)continue;
  let open=true;for(let dy=-2;dy<=2&&open;dy++)for(let dx=-2;dx<=2;dx++)if(!isF(x+dx,y+dy)){open=false;break}
  if(open&&R()<.09)grid[y][x]=ROCK}
 // keep only floor reachable from the stairs
 const seen=new Set([cx+","+cy]),q=[[cx,cy]];
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy] of D){const nx=x+dx,ny=y+dy,k=nx+","+ny;if(!seen.has(k)&&isF(nx,ny)){seen.add(k);q.push([nx,ny])}}}
 for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)if(grid[y][x]===FLOOR&&!seen.has(x+","+y))grid[y][x]=ROCK;
 return ch.map(c=>{const tiles=[];const k=Math.ceil(c.r+1);for(let dy=-k;dy<=k;dy++)for(let dx=-k;dx<=k;dx++){const x=c.x+dx,y=c.y+dy;if(isF(x,y)&&Math.hypot(dx,dy)<=c.r+.6)tiles.push([x,y])}return {x:c.x,y:c.y,r:c.r,tiles}}).filter(c=>c.tiles.length>=4);
}

/* Hunting grounds (surface and underground): wide lure spots for 8+ monsters, smaller side chambers and
   corridors 2, 3 or 4 SQM wide. `floor`/`rock` pick the tiles (surface uses trees/rocks as walls),
   `gates` opens 3-wide tunnels from the zone gates to the stairs. Same layout for every player. */
function carveHunt(grid,z,seed,o){
 o=o||{};const F=o.floor??FLOOR,K=o.rock??ROCK,R=rng(seed);
 const x1=z.x1+1,x2=z.x2-1,y1=z.y1+1,y2=z.y2-1,cx=z.cx,cy=z.cy;
 const inb=(x,y)=>x>=x1&&x<=x2&&y>=y1&&y<=y2,set=(x,y)=>{if(inb(x,y))grid[y][x]=F},isF=(x,y)=>inb(x,y)&&grid[y][x]===F;
 for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)grid[y][x]=K;
 const ell=(bx,by,rx,ry,jag)=>{const kx=Math.ceil(rx+1),ky=Math.ceil(ry+1);for(let dy=-ky;dy<=ky;dy++)for(let dx=-kx;dx<=kx;dx++){if((dx/rx)**2+(dy/ry)**2<=1+(R()-.5)*(jag??.3))set(bx+dx,by+dy)}};
 const stamp=(x,y,w)=>{const o=w>=3?1:0;for(let j=0;j<w;j++)for(let i=0;i<w;i++)set(x+i-o,y+j-o)};
 const tunnel=(ax,ay,bx,by,w)=>{let x=ax,y=ay;stamp(x,y,w);for(let n=0;n<600&&(x!==bx||y!==by);n++){
   const ddx=bx-x,ddy=by-y,r=R();
   if(r<.7){if(Math.abs(ddx)>=Math.abs(ddy)?ddx:!ddy)x+=Math.sign(ddx)||1;else y+=Math.sign(ddy)}
   else if(r<.86){if(ddx)x+=Math.sign(ddx);else y+=Math.sign(ddy)}
   else if(Math.abs(ddx)>=Math.abs(ddy))y+=R()<.5?-1:1;else x+=R()<.5?-1:1;
   x=Math.max(x1,Math.min(x2,x));y=Math.max(y1,Math.min(y2,y));stamp(x,y,w)}};
 const width=()=>[2,3,4][Math.floor(R()*3)];
 // hub around the stairs (boss portal at cx+2)
 ell(cx,cy,2.6,2.4,.2);for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+3;x++)set(x,y);
 // two wide lure spots on opposite corners, smaller chambers on the other corners/edges
 const corners=[[x1+4,y1+4],[x2-4,y1+4],[x1+4,y2-4],[x2-4,y2-4]],mids=[[cx,y1+3],[cx,y2-3],[x1+3,cy],[x2-3,cy]];
 const c0=Math.floor(R()*4),big=[corners[c0],corners[3-c0]];
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const k=Math.floor(R()*(i+1));[a[i],a[k]]=[a[k],a[i]]}return a};
 const rest=shuffle([...corners.filter((_,i)=>i!==c0&&i!==3-c0),...mids]),j=()=>Math.round((R()-.5)*2);
 const ch=big.map(([a,b])=>({x:a,y:b,rx:3.5+R()*.7,ry:3.5+R()*.7,big:true}));
 const area=(x2-x1+1)*(y2-y1+1);rest.slice(0,area>=420?4:3).forEach(([a,b])=>ch.push({x:a+j(),y:b+j(),rx:2.2+R()*.9,ry:2.2+R()*.9,big:false}));
 ch.forEach(c=>ell(c.x,c.y,c.rx,c.ry,c.big?.15:.35));
 // a closed ring between all chambers plus links from the hub
 ch.sort((a,b)=>Math.atan2(a.y-cy,a.x-cx)-Math.atan2(b.y-cy,b.x-cx));
 for(let i=0;i<ch.length;i++){const a=ch[i],b=ch[(i+1)%ch.length];tunnel(a.x,a.y,b.x,b.y,width())}
 const near=[...ch].sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy));
 tunnel(cx,cy,near[0].x,near[0].y,R()<.5?3:4);tunnel(cx,cy,near[1].x,near[1].y,width());
 for(const c of ch)if(c.big&&c!==near[0]&&c!==near[1]){tunnel(cx,cy,c.x,c.y,3);break}
 if(o.gates)for(const [gx,gy] of [[cx,y1],[cx,y2],[x1,cy],[x2,cy]])tunnel(gx,gy,cx,cy,3);
 // short dead-end spurs
 const D=[[1,0],[-1,0],[0,1],[0,-1]],iw=x2-x1+1,ih=y2-y1+1,spurs=3+Math.floor(R()*3);
 for(let s=0,t=0;s<spurs&&t<200;t++){const x=x1+Math.floor(R()*iw),y=y1+Math.floor(R()*ih);if(!isF(x,y))continue;
  let [dx,dy]=D[Math.floor(R()*4)],px=x,py=y;const len=2+Math.floor(R()*3);
  for(let k=0;k<len;k++){px+=dx;py+=dy;if(!inb(px,py))break;stamp(px,py,2)}s++}
 // no 1-SQM passages
 for(let pass=0,changed=true;changed&&pass<12;pass++){changed=false;
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){if(!isF(x,y))continue;
   if(!isF(x-1,y)&&!isF(x+1,y)){if(inb(x+1,y))set(x+1,y);else set(x-1,y);changed=true}
   if(!isF(x,y-1)&&!isF(x,y+1)){if(inb(x,y+1))set(x,y+1);else set(x,y-1);changed=true}}}
 // a few pillars in open side areas, never inside lure spots or the hub
 const inBig=(x,y)=>ch.some(c=>c.big&&((x-c.x)/(c.rx+1))**2+((y-c.y)/(c.ry+1))**2<=1);
 const nearC=(x,y)=>ch.some(c=>Math.max(Math.abs(x-c.x),Math.abs(y-c.y))<=1);
 for(let y=y1+2;y<y2-1;y++)for(let x=x1+2;x<x2-1;x++){if(Math.max(Math.abs(x-cx),Math.abs(y-cy))<=3||inBig(x,y))continue;
  let open=true;for(let dy=-2;dy<=2&&open;dy++)for(let dx=-2;dx<=2;dx++)if(!isF(x+dx,y+dy)){open=false;break}
  if(open&&R()<.07&&!nearC(x,y))grid[y][x]=K}
 // keep only what is reachable from the stairs
 const seen=new Set([cx+","+cy]),q=[[cx,cy]];
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy] of D){const nx=x+dx,ny=y+dy,k=nx+","+ny;if(!seen.has(k)&&isF(nx,ny)){seen.add(k);q.push([nx,ny])}}}
 for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)if(grid[y][x]===F&&!seen.has(x+","+y))grid[y][x]=K;
 return ch.map(c=>{const tiles=[],k=Math.ceil(Math.max(c.rx,c.ry)+1);for(let dy=-k;dy<=k;dy++)for(let dx=-k;dx<=k;dx++){const x=c.x+dx,y=c.y+dy;if(isF(x,y)&&(dx/(c.rx+.5))**2+(dy/(c.ry+.5))**2<=1&&Math.hypot(x-cx,y-cy)>=3)tiles.push([x,y])}
  return {x:c.x,y:c.y,r:Math.max(c.rx,c.ry),big:c.big,tiles}}).filter(c=>c.tiles.length>=4);
}
/* Deep underground hunts (subsolo, ~6–7× a surface hunt): a jittered grid of chambers around the stairs hub,
   about a third of them wide lure spots, joined by a winding tunnel tree plus extra loops (2–4 SQM wide). */
function carveDeep(grid,z,seed){
 const F=FLOOR,K=ROCK,R=rng(seed);
 const x1=z.x1+1,x2=z.x2-1,y1=z.y1+1,y2=z.y2-1,cx=z.cx,cy=z.cy;
 let open=0;const inb=(x,y)=>x>=x1&&x<=x2&&y>=y1&&y<=y2,set=(x,y)=>{if(inb(x,y)&&grid[y][x]!==F){grid[y][x]=F;open++}},isF=(x,y)=>inb(x,y)&&grid[y][x]===F;
 for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)grid[y][x]=K;
 const ell=(bx,by,rx,ry,jag)=>{const kx=Math.ceil(rx+1),ky=Math.ceil(ry+1);for(let dy=-ky;dy<=ky;dy++)for(let dx=-kx;dx<=kx;dx++){if((dx/rx)**2+(dy/ry)**2<=1+(R()-.5)*jag)set(bx+dx,by+dy)}};
 const stamp=(x,y,w)=>{const o=w>=3?1:0;for(let j=0;j<w;j++)for(let i=0;i<w;i++)set(x+i-o,y+j-o)};
 const tunnel=(ax,ay,bx,by,w)=>{let x=ax,y=ay;stamp(x,y,w);for(let n=0;n<2000&&(x!==bx||y!==by);n++){
   const ddx=bx-x,ddy=by-y,r=R();
   if(r<.66){if(Math.abs(ddx)>=Math.abs(ddy)?ddx:!ddy)x+=Math.sign(ddx)||1;else y+=Math.sign(ddy)}
   else if(r<.84){if(ddx)x+=Math.sign(ddx);else y+=Math.sign(ddy)}
   else if(Math.abs(ddx)>=Math.abs(ddy))y+=R()<.5?-1:1;else x+=R()<.5?-1:1;
   x=Math.max(x1,Math.min(x2,x));y=Math.max(y1,Math.min(y2,y));stamp(x,y,w)}};
 const width=()=>[2,3,4][Math.floor(R()*3)];
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const k=Math.floor(R()*(i+1));[a[i],a[k]]=[a[k],a[i]]}return a};
 const iw=x2-x1+1,ih=y2-y1+1,odd=v=>Math.max(3,2*Math.round((v-1)/2)+1);
 const cols=odd(iw/10.5),rows=odd(ih/10.5),cw=iw/cols,chh=ih/rows,hc=cols>>1,hr=rows>>1,cell=Math.min(cw,chh);
 // hub around the stairs (boss portal at cx+2)
 ell(cx,cy,3.2,3,.2);for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+3;x++)set(x,y);
 // one chamber per grid cell, the hub takes the middle cell
 const nodes=[];
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  if(r===hr&&c===hc){nodes.push({c,r,x:cx,y:cy,hub:true});continue}
  const x=Math.round(Math.max(x1+4,Math.min(x2-4,x1+(c+.5)*cw+(R()-.5)*cw*.35)));
  const y=Math.round(Math.max(y1+4,Math.min(y2-4,y1+(r+.5)*chh+(R()-.5)*chh*.35)));
  nodes.push({c,r,x,y})}
 const ch=shuffle(nodes.filter(n=>!n.hub)),nBig=Math.max(4,Math.round(ch.length*.35)),cap=Math.max(3.6,cell*.5);
 ch.forEach((n,i)=>{n.big=i<nBig;const b=n.big?4.1:2.8,v=n.big?1.2:1.2;n.rx=Math.min(cap,b+R()*v);n.ry=Math.min(cap,b+R()*v);ell(n.x,n.y,n.rx,n.ry,n.big?.15:.35)});
 // tunnel tree from the hub (randomized depth-first), extra loops, and every hub neighbour linked
 const at=(c,r)=>nodes[r*cols+c],key=(a,b)=>a.r*cols+a.c<b.r*cols+b.c?`${a.c},${a.r}-${b.c},${b.r}`:`${b.c},${b.r}-${a.c},${a.r}`;
 const D=[[1,0],[-1,0],[0,1],[0,-1]],edges=new Map(),hub=at(hc,hr),seenN=new Set([hub]),stack=[hub];
 while(stack.length){const n=stack[stack.length-1];
  const nb=shuffle(D.map(([dc,dr])=>[n.c+dc,n.r+dr]).filter(([c,r])=>c>=0&&r>=0&&c<cols&&r<rows&&!seenN.has(at(c,r))));
  if(!nb.length){stack.pop();continue}const m=at(nb[0][0],nb[0][1]);seenN.add(m);edges.set(key(n,m),[n,m]);stack.push(m)}
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=at(c,r);
  for(const [dc,dr] of [[1,0],[0,1]]){if(c+dc>=cols||r+dr>=rows)continue;const b=at(c+dc,r+dr),k=key(a,b);if(!edges.has(k)&&(a.hub||b.hub||R()<.5))edges.set(k,[a,b])}}
 for(const [a,b] of edges.values())tunnel(a.x,a.y,b.x,b.y,a.hub||b.hub?(R()<.5?3:4):width());
 // dead-end spurs
 const spurs=3+Math.round(iw*ih/400);
 for(let s=0,t=0;s<spurs&&t<600;t++){const x=x1+Math.floor(R()*iw),y=y1+Math.floor(R()*ih);if(!isF(x,y))continue;
  let [dx,dy]=D[Math.floor(R()*4)],px=x,py=y;const len=2+Math.floor(R()*4);
  for(let k=0;k<len;k++){if(R()<.3)[dx,dy]=R()<.5?[dy,dx]:[-dy,-dx];px+=dx;py+=dy;if(!inb(px,py))break;stamp(px,py,2)}s++}
 // side pockets grow from the cave walls until about 2/3 of the area is open, as open as the old caves
 const goal=Math.round(iw*ih*.68);
 for(let t=0;open<goal&&t<6000;t++){const x=x1+Math.floor(R()*iw),y=y1+Math.floor(R()*ih);
  if(isF(x,y)||Math.hypot(x-cx,y-cy)<5||!(isF(x+1,y)||isF(x-1,y)||isF(x,y+1)||isF(x,y-1)))continue;ell(x,y,1.8+R()*1.7,1.8+R()*1.7,.4)}
 // no 1-SQM passages
 for(let pass=0,changed=true;changed&&pass<12;pass++){changed=false;
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){if(!isF(x,y))continue;
   if(!isF(x-1,y)&&!isF(x+1,y)){if(inb(x+1,y))set(x+1,y);else set(x-1,y);changed=true}
   if(!isF(x,y-1)&&!isF(x,y+1)){if(inb(x,y+1))set(x,y+1);else set(x,y-1);changed=true}}}
 // a few pillars in open side areas, never inside lure spots or the hub
 const inBig=(x,y)=>ch.some(c=>c.big&&((x-c.x)/(c.rx+1))**2+((y-c.y)/(c.ry+1))**2<=1);
 const nearC=(x,y)=>ch.some(c=>Math.max(Math.abs(x-c.x),Math.abs(y-c.y))<=1);
 for(let y=y1+2;y<y2-1;y++)for(let x=x1+2;x<x2-1;x++){if(Math.max(Math.abs(x-cx),Math.abs(y-cy))<=3||inBig(x,y))continue;
  let open=true;for(let dy=-2;dy<=2&&open;dy++)for(let dx=-2;dx<=2;dx++)if(!isF(x+dx,y+dy)){open=false;break}
  if(open&&R()<.07&&!nearC(x,y))grid[y][x]=K}
 // keep only what is reachable from the stairs
 const seen=new Set([cx+","+cy]),q=[[cx,cy]];
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy] of D){const nx=x+dx,ny=y+dy,k=nx+","+ny;if(!seen.has(k)&&isF(nx,ny)){seen.add(k);q.push([nx,ny])}}}
 for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)if(grid[y][x]===F&&!seen.has(x+","+y))grid[y][x]=K;
 // wide lure spots first so the spawn quota fills them before the side chambers
 ch.sort((a,b)=>(b.big?1:0)-(a.big?1:0));
 return ch.map(c=>{const tiles=[],k=Math.ceil(Math.max(c.rx,c.ry)+1);for(let dy=-k;dy<=k;dy++)for(let dx=-k;dx<=k;dx++){const x=c.x+dx,y=c.y+dy;if(isF(x,y)&&(dx/(c.rx+.5))**2+(dy/(c.ry+.5))**2<=1&&Math.hypot(x-cx,y-cy)>=3)tiles.push([x,y])}
  return {x:c.x,y:c.y,r:Math.max(c.rx,c.ry),big:c.big,tiles}}).filter(c=>c.tiles.length>=4);
}
/* Best-candidate spread: of `tries` random floor tiles, keep the one farthest (Chebyshev) from every monster already in the cave,
   so each new or respawned monster fills the emptiest part of the hunt instead of piling into a few chambers. */
function pickSpread(tiles,others,rand,tries){if(!tiles.length)return null;let best=null,bd=-1;
 for(let i=0;i<(tries||24);i++){const t=tiles[Math.floor(rand()*tiles.length)];let d=1e9;
  for(const o of others){const e=Math.max(Math.abs(o.x-t[0]),Math.abs(o.y-t[1]));if(e<d){d=e;if(d<=bd)break}}
  if(d>bd){bd=d;best=t}}return bd>0?best:null}
function pickLureTile(lures,rand){const total=lures.reduce((s,c)=>s+c.tiles.length,0);if(!total)return null;let r=rand()*total;for(const c of lures){if(r<c.tiles.length)return c.tiles[Math.floor(r)];r-=c.tiles.length}return lures[lures.length-1].tiles[0]}
root.LawlCaves={carve,carveHunt,carveDeep,pickSpread,pickLureTile,rng,ROCK,FLOOR};
})(typeof window!=="undefined"?window:globalThis);
