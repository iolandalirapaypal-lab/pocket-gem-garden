/* Modo de perseguição em combate (3 etapas, como no Tibia): Parado, Seguir e Distância.
   Regras puras e seguras no navegador; o jogo só pergunta para qual SQM andar. */
(function(root){
const MODES={
 stand:{id:"stand",ic:"🧍",name:"Parado",msg:"fica no lugar enquanto luta."},
 chase:{id:"chase",ic:"🏃",name:"Seguir",msg:"persegue o alvo até ficar colado nele."},
 keep:{id:"keep",ic:"↔️",name:"Distância",msg:"mantém distância do alvo, sem sair do alcance."}
};
const ORDER=["stand","chase","keep"];
const KEEP=3; // distância ideal (SQM) no modo Distância, limitada ao alcance do ataque
function normalize(s){return Object.prototype.hasOwnProperty.call(MODES,s)?s:"stand"}
function mode(s){return MODES[normalize(s)]}
const cheb=(ax,ay,bx,by)=>Math.max(Math.abs(ax-bx),Math.abs(ay-by));
const near=(me,a,b)=>{const da=cheb(me.x,me.y,a[0],a[1]),db=cheb(me.x,me.y,b[0],b[1]);if(da!==db)return da-db;
 return ((a[0]-me.x)**2+(a[1]-me.y)**2)-((b[0]-me.x)**2+(b[1]-me.y)**2)};
function keepDist(range){return Math.max(1,Math.min(KEEP,Math.floor(Number(range)||1)))}
// Anel de SQMs a exatamente r de (cx,cy).
function ring(cx,cy,r){const out=[];for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(Math.max(Math.abs(dx),Math.abs(dy))===r)out.push([cx+dx,cy+dy]);return out}
// Devolve o SQM para onde o personagem deve andar, ou null para ficar parado.
// free(x,y) diz se o SQM é andável e está livre.
// see(x,y) (optional) says whether an attack from (x,y) reaches the target past trees and walls.
function goal(m,me,t,range,free,see){
 m=normalize(m);if(m==="stand"||!me||!t)return null;
 const d=cheb(me.x,me.y,t.x,t.y),ok=(x,y)=>!(x===me.x&&y===me.y)&&free(x,y),sees=(x,y)=>!see||see(x,y);
 const want=m==="chase"?1:keepDist(range),max=m==="chase"?1:Math.max(want,Math.floor(Number(range)||1));
 const spot=()=>{for(let r=want;r>=1;r--){const c=ring(t.x,t.y,r).filter(([x,y])=>ok(x,y)&&sees(x,y)).sort((a,b)=>near(me,a,b));if(c[0])return c[0]}
  const c=ring(t.x,t.y,1).filter(([x,y])=>ok(x,y)).sort((a,b)=>near(me,a,b));return c[0]||null};
 if(d>=want&&d<=max)return sees(me.x,me.y)?null:spot();
 if(d>max)return spot();
 // Perto demais (só no modo Distância): um passo para longe, sem sair do alcance.
 let best=null,bd=d;
 for(const [x,y] of ring(me.x,me.y,1)){if(!ok(x,y))continue;const nd=cheb(x,y,t.x,t.y);if(nd>bd&&nd<=max){bd=nd;best=[x,y]}}
 return best}
root.LawlChase={MODES,ORDER,KEEP,normalize,mode,keepDist,goal};
})(typeof window!=="undefined"?window:globalThis);
