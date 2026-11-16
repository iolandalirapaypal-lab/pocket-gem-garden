/* Browser-safe cosmetic rules and pixel renderer, shared by world and wardrobe. */
(function(root){
"use strict";
const palette=[
 ["Carvão","#252936"],["Prata","#b9c5ce"],["Neve","#edf1ea"],["Vermelho","#bd414b"],
 ["Coral","#ea806d"],["Ouro","#e7bc58"],["Verde","#559969"],["Menta","#82c8a1"],
 ["Azul","#477da8"],["Gelo","#87bed8"],["Violeta","#8968a5"],["Rosa","#ce8bb0"],
 ["Cobre","#976640"],["Areia","#cead7c"],["Marfim","#e5d5b7"],["Noite","#3e455c"]
];
const catalog=[
 {id:"citizen",name:"Cidadão",hat:"hair",detail:"Colete e cinto de viagem"},
 {id:"knight",name:"Cavaleiro",hat:"helm",detail:"Armadura, elmo e ombreiras"},
 {id:"hunter",name:"Caçador",hat:"hood",detail:"Capuz e traje de patrulha"},
 {id:"mage",name:"Mago",hat:"wizard",detail:"Chapéu pontudo e túnica"},
 {id:"druid",name:"Druida",hat:"leaf",detail:"Coroa de folhas e veste ritual"},
 {id:"assassin",name:"Assassino",hat:"mask",detail:"Máscara e traje furtivo"},
 {id:"noble",name:"Nobre",hat:"crown",detail:"Coroa e casaca bordada"},
 {id:"barbarian",name:"Bárbaro",hat:"horns",detail:"Elmo com chifres e peles"},
 /* Outfits do Lawl MMORPG: redesenhados no estilo próprio do jogo; Addon 1 usa o campo cape e Addon 2 o campo ornament do save */
 {id:"villager",name:"Villager",hat:"hair",hair:"spiky",suit:"plain",addons:["Lenço no rosto","Espada nas costas"],a:["mask","backsword"],detail:"Camponês de cabelo espetado"},
 {id:"lknight",name:"Knight",hat:"hair",hair:"spiky",suit:"armor",hat1:"helm",addons:["Elmo com crista","Espada nas costas"],a:["plume","backsword"],detail:"Peitoral e saiote de placas"},
 {id:"lpaladin",name:"Paladin",hat:"hair",hair:"streak",suit:"pads",addons:["Pena no cabelo","Besta nas costas"],a:["feather","crossbow"],detail:"Mecha clara e ombreiras"},
 {id:"wizard",name:"Wizard",hat:"hood",robe:true,addons:["Véu no rosto","Cajado"],a:["mask","staff"],detail:"Capuz escuro e túnica longa"},
 {id:"amazon",name:"Amazon",hat:"hair",hair:"ponytail",suit:"midriff",skirt:true,addons:["Ombreiras","Adaga na cintura"],a:["pads","dagger"],detail:"Rabo de cavalo e saia de guerreira"},
 {id:"summoner",name:"Summoner",hat:"hair",hair:"long",robe:true,addons:["Ombreiras","Vestido longo"],a:["pads","skirt"],detail:"Cabelo longo e vestido de invocadora"},
 {id:"slayer",name:"Slayer",hat:"hair",hair:"bun",suit:"ninja",addons:["Máscara ninja","Espada nas costas"],a:["ninja","backsword"],detail:"Coque e traje ninja em V"},
 {id:"primal",name:"Primal",hat:"mohawk",hair:"mohawk",suit:"bare",addons:["Pintura de guerra","Ombreiras de osso"],a:["scar","bones"],detail:"Moicano e peito à mostra"},
 {id:"warlock",name:"Warlock",hat:"hair",hair:"wild",suit:"collar",addons:["Cabelo em chamas","Bola de fogo"],a:["flames","fireball"],detail:"Gola alta de feiticeiro"},
 {id:"sensei",name:"Sensei",hat:"hair",hair:"sidepart",suit:"gi",addons:["Faixa e máscara","Katana nas costas"],a:["band","backsword"],detail:"Quimono aberto e faixa"},
 {id:"lhunter",name:"Hunter",hat:"hair",hair:"sidepart",suit:"stripes",hat1:"hood",addons:["Capuz","Arco nas costas"],a:["hood","bow"],detail:"Franja no olho e túnica listrada"},
 {id:"hitman",name:"Hitman",hat:"hair",hair:"sidepart",suit:"collar",coat:true,addons:["Lenço no rosto","Foice"],a:["mask","scythe"],detail:"Casaco de gola alta"},
 {id:"voyager",name:"Voyager",hat:"hair",hair:"wild",suit:"midriff",addons:["Lenço no rosto","Espada nas costas"],a:["mask","backsword"],detail:"Cabelo selvagem e colete aberto"},
 {id:"sublime",name:"Sublime",hat:"hair",hair:"long",suit:"collar",robe:true,hat1:"hood",addons:["Capuz","Cajado espiral"],a:["hood","crook"],detail:"Manto de gola alta"}
];
const defaults={knight:["knight",1,1,15,12],paladin:["hunter",5,5,6,12],sorcerer:["mage",10,10,15,0],druid:["druid",6,6,12,12]};
function normalize(value,voc){
 const d=defaults[voc]||defaults.knight,o=value&&typeof value==="object"?value:{};
 const col=(k,i)=>Number.isInteger(o[k])&&o[k]>=0&&o[k]<palette.length?o[k]:d[i];
 const r={id:catalog.some(c=>c.id===o.id)?o.id:d[0],head:col("head",1),body:col("body",2),legs:col("legs",3),feet:col("feet",4),cape:o.cape===true,ornament:o.ornament===true};
 if(r.id==="mage"&&o.hat===false)r.hat=false;
 return r;
}
function apply(player,draft){player.outfit=normalize(draft,player.voc);return player.outfit}
/* Pixel-art chibi sprites (big head, dark outline, flat 2-tone shading), baked once per look/direction/step and cached. */
const STEEL="#cfd6de",WOOD="#8a5a33",WOOD_D="#5c3a20",STRING="#e8e1c8",FIRE="#ff7a2a",FIRE_L="#ffd25a",DARK="#2b2433";
const INK="#1b1424",SKIN="#f2c49b",SKIN_D="#d4936c",BLUSH="#ec9a8c",GOLD="#e7bc58",IVORY="#efe3c4",LEAF="#82c8a1",LEAF_D="#3f7f4f";
const GW=20,GH=28,PAD=1,TOP=7,cache=new Map();
function rgb(h){h=h.replace("#","");return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16))}
function mix(a,b,k){const A=rgb(a),B=rgb(b);return"#"+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,"0")).join("")}
const dk=(c,k=.3)=>mix(c,"#120c1a",k),lt=(c,k=.28)=>mix(c,"#ffffff",k);
function canvas(w,h){if(typeof document!=="undefined"&&document.createElement){const c=document.createElement("canvas");c.width=w;c.height=h;return c}return typeof OffscreenCanvas!=="undefined"?new OffscreenCanvas(w,h):null}
/* Acabamento em pixel art: luz do alto à esquerda em faixas duras (borda clara, meio, terço escuro e borda de sombra),
   sombra projetada sob cabeça/peças grandes e contorno seletivo (mais claro do lado da luz, escuro do lado da sombra).
   Tudo na resolução nativa do sprite, sem degradê nem suavização, feito uma vez por visual/direção/passo e guardado no cache. */
function px(c){return"#"+[c>>16&255,c>>8&255,c&255].map(v=>v.toString(16).padStart(2,"0")).join("")}
function shadePixel(base){
 const w=base.width,h=base.height,g0=base.getContext("2d",{willReadFrequently:true});if(!g0||!g0.getImageData)return null;
 const src=g0.getImageData(0,0,w,h).data,n=w*h,lk=new Int32Array(n),size=new Int32Array(n),lab=new Int32Array(n).fill(-1);
 for(let i=0;i<n;i++)lk[i]=src[i*4+3]<8?-1:(src[i*4]<<16|src[i*4+1]<<8|src[i*4+2]);
 const nb=i=>{const x=i%w,y=i/w|0;return[x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1]};
 for(let i0=0,nl=0;i0<n;i0++){if(lk[i0]<0||lab[i0]>=0)continue;const st=[i0],cells=[];lab[i0]=nl;
  while(st.length){const i=st.pop();cells.push(i);for(const q of nb(i))if(q>=0&&lab[q]<0&&lk[q]===lk[i]){lab[q]=nl;st.push(q)}}
  for(const i of cells)size[i]=cells.length;nl++}
 const op=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&lk[y*w+x]>=0,out=canvas(w,h),q=out&&out.getContext("2d");if(!q)return null;
 const memo=new Map(),C=(c,k)=>{const key=c+"|"+k;let v=memo.get(key);if(!v){const hx=px(c);v=k>0?mix(hx,"#fff6dc",k):k<0?mix(hx,"#1a1030",-k):hx;memo.set(key,v)}return v};
 for(let y=0;y<h;y++){let x=0;while(x<w){if(!op(x,y)){x++;continue}let x1=x;while(x1+1<w&&op(x1+1,y))x1++;
   for(let xx=x;xx<=x1;xx++){const i=y*w+xx,c=lk[i],t=x1>x?(xx-x)/(x1-x):.5,big=size[i]>3;let k=0;
    if(!op(xx,y-1)||!op(xx-1,y))k=.24;
    else if(!op(xx+1,y)||!op(xx,y+1))k=-.3;
    else if(t>.7)k=-.14;
    else if(t<.3&&y<h*.5)k=.08;
    if(big&&k>=0&&y>0&&lk[i-w]>=0&&lk[i-w]!==c&&size[i-w]>3)k=-.18;
    q.fillStyle=C(c,k);q.fillRect(xx,y,1,1)}
   x=x1+1}}
 /* contorno seletivo de 1 pixel em volta do corpo inteiro */
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(op(x,y))continue;let c=-1,lit=false;
  if(op(x+1,y)){c=lk[y*w+x+1];lit=true}else if(op(x,y+1)){c=lk[(y+1)*w+x];lit=true}else if(op(x-1,y))c=lk[y*w+x-1];else if(op(x,y-1))c=lk[(y-1)*w+x];
  if(c<0)continue;q.fillStyle=lit?mix(px(c),INK,.72):INK;q.fillRect(x,y,1,1)}
 return out;
}
function sprite(o,kind,view,s){
 const key=[o.id,o.head,o.body,o.legs,o.feet,o.cape?1:0,o.ornament?1:0,o.hat===false?0:1,view,s].join("|"),hit=cache.get(key);if(hit)return hit;
 const W=GW+PAD*2,H=GH+PAD*2,base=canvas(W,H),out=canvas(W,H);if(!base||!out)return null;
 const g=base.getContext("2d"),P=(x,y,w,h,col)=>{if(w>0&&h>0){g.fillStyle=col;g.fillRect(x+PAD,y+PAD,w,h)}};
 const C=k=>palette[o[k]][1],Hc=C("head"),Hd=dk(Hc),Hl=lt(Hc),B0=C("body"),L=C("legs"),Ld=dk(L),F=C("feet"),Fd=dk(F,.35);
 const suit=kind.suit||"",bare=suit==="bare",B=bare?SKIN:B0,Bd=bare?SKIN_D:dk(B0),Bl=bare?lt(SKIN,.2):lt(B0,.22);
 const ad=!!kind.addons,on=k=>ad&&((o.cape&&kind.a[0]===k)||(o.ornament&&kind.a[1]===k));
 const hat=ad&&o.cape&&kind.hat1?kind.hat1:kind.hat,wizHat=hat==="wizard",robe=wizHat||!!kind.robe,front=view==="south",back=view==="north",side=view==="east";
 const bald=hat==="mohawk",hC=bald?SKIN:Hc,hD=bald?SKIN_D:Hd,hL=bald?lt(SKIN,.2):Hl,hairUp=hat==="hair"||bald;
 /* armas e acessórios presos nas costas: atrás do corpo de frente/lado, por cima nas costas */
 const backGear=()=>{
  if(on("backsword")){if(back){for(let i=0;i<10;i++)P(5+i,24-i,2,1,STEEL);P(15,12,2,3,WOOD_D);P(14,15,4,1,GOLD)}else if(side){P(5,12,1,4,WOOD_D);P(4,16,3,1,GOLD);P(5,17,1,8,STEEL)}else{P(16,12,1,4,WOOD_D);P(15,16,3,1,GOLD);P(3,23,1,3,STEEL)}}
  if(on("bow")){if(back){P(13,12,2,1,WOOD);P(14,13,1,2,WOOD);P(15,15,1,6,WOOD);P(14,21,1,2,WOOD);P(13,23,2,1,WOOD);P(12,13,1,10,STRING)}else if(side){P(4,12,1,2,WOOD);P(3,14,1,8,WOOD);P(4,22,1,2,WOOD)}else{P(17,13,1,2,WOOD);P(18,15,1,7,WOOD);P(17,22,1,2,WOOD)}}
  if(on("crossbow")){if(back){P(5,14,10,1,WOOD_D);P(9,12,2,11,WOOD);P(9,12,1,11,lt(WOOD,.2))}else if(side){P(3,13,2,9,WOOD);P(2,14,4,1,WOOD_D)}else{P(0,15,5,1,WOOD_D);P(2,13,1,5,WOOD)}}};
 if(!back)backGear();
 /* capa atrás do corpo */
 if(!ad&&o.cape&&!back){if(side){P(3,19,4,7,Hd);P(4,19,3,6,Hc)}else{P(3,19,14,7,Hd);P(4,19,12,6,Hc)}}
 /* pernas e pés: ciclo de caminhada em 4 quadros (s=1..4; 0 = parado). 1/3 = passada aberta, 2/4 = perna passando no ar */
 const walk=s>0,contact=s===1||s===3,A=s===1||s===2,FS=dk(F,.15);
 const leg=(x,fy,w,sh)=>{if(fy>24){P(x,24,w,fy-24,sh?Ld:L);P(x+w-1,24,1,fy-24,Ld)}P(x,fy,w,1,sh?FS:F);P(x,fy+1,w,1,Fd);if(!sh)P(x,fy,1,1,lt(F,.25))};
 const sleg=(xt,xf,w,up,sh)=>{P(xt,24,3,1,sh?Ld:L);const fy=up?24:25;P(xf,fy,w,1,sh?FS:F);P(xf,fy+1,w,1,Fd);if(!sh)P(xf,fy,1,1,lt(F,.25))};
 if(side){
  if(!walk){sleg(7,7,3,false,true);sleg(10,10,4,false,false)}
  else if(contact){if(A){sleg(7,4,3,false,true);sleg(10,11,4,false,false)}else{sleg(9,11,4,false,true);sleg(7,4,4,false,false)}}
  else{if(A){sleg(10,11,3,true,true);sleg(8,7,4,false,false)}else{sleg(8,7,4,false,true);sleg(10,11,4,true,false)}}}
 else{
  /* de frente o pé que vem para a frente desce 1 pixel e abre para fora; o de trás sobe */
  const lowLeft=front?A:!A;
  if(!walk){leg(6,25,3);leg(11,25,3)}
  else if(contact){if(lowLeft){leg(11,24,3,true);leg(5,26,3)}else{leg(6,24,3,true);leg(12,26,3)}}
  else{if(lowLeft){leg(11,24,3,true);leg(6,25,3)}else{leg(6,24,3,true);leg(11,25,3)}}}
 /* balanço dos braços: oposto à perna que avança */
 const na=!walk?0:contact?(A?-2:2):(A?-1:1);
 /* braço de trás (lateral) */
 if(side){P(8-na,19,2,3,dk(B,.45));P(8-na,22,2,1,SKIN_D)}
 /* tronco */
 const tx=side?6:5,tw=side?8:10;
 P(tx,19,tw,5,B);P(tx,19,1,4,Bl);P(tx+tw-2,19,2,5,Bd);P(tx,23,tw,1,Bd);P(tx,22,tw,1,dk(F,.2));
 if(front&&!bare){P(9,19,2,1,SKIN);P(9,22,2,1,!ad&&o.ornament?GOLD:"#c9c3b4")}
 if(hat==="hair"&&front){P(5,19,2,3,dk(B,.32));P(13,19,2,3,dk(B,.45))}
 if(hat==="crown"&&!back){side?P(9,19,2,4,Hc):(P(8,19,1,4,Hc),P(11,19,1,4,Hc))}
 if(robe){P(tx,19,tw,7,B);P(tx,19,1,6,Bl);P(tx+tw-2,19,2,7,Bd);P(tx,25,tw,1,kind.robe?L:Hc);P(tx,22,tw,1,dk(B,.4));if(front)P(9,19,2,1,SKIN)}
 /* trajes dos outfits do Lawl */
 if(suit==="armor"){if(front){P(6,20,8,1,Bl);P(9,19,2,3,Bd)}P(tx,23,tw,2,L);if(!side)for(let i=tx+2;i<tx+tw;i+=3)P(i,23,1,2,Ld);else P(tx,24,tw,1,Ld)}
 if(suit==="pads"&&!side){P(3,19,2,2,L);P(15,19,2,2,L);P(3,19,2,1,lt(L,.25))}
 if(suit==="midriff"){side?P(7,21,6,1,SKIN):P(tx+1,21,tw-2,1,SKIN);if(front)P(9,21,1,1,SKIN_D)}
 if(kind.skirt){P(tx,23,tw,2,L);P(tx,24,tw,1,Ld)}
 if(suit==="ninja"&&front){P(7,19,1,1,Hc);P(8,20,1,1,Hc);P(9,21,2,1,Hc);P(11,20,1,1,Hc);P(12,19,1,1,Hc)}
 if(bare){if(front){P(7,21,2,1,SKIN_D);P(11,21,2,1,SKIN_D);P(9,20,2,1,lt(SKIN,.2))}P(tx,22,tw,2,B0);P(tx,23,tw,1,dk(B0,.3))}
 if(suit==="collar"){if(side)P(4,16,2,3,B);else{P(2,16,3,3,B);P(15,16,3,3,B);P(3,17,1,2,Hc);P(16,17,1,2,Hc)}if(front){P(9,19,2,4,Hc);P(9,19,2,1,SKIN)}if(kind.coat)P(tx,24,tw,1,B)}
 if(suit==="gi"){if(front){P(8,19,4,1,SKIN);P(9,20,2,2,SKIN);P(9,21,1,1,SKIN_D)}P(tx,22,tw,1,Hc)}
 if(suit==="stripes"){P(tx,20,tw,1,Hc);if(!side)P(tx+1,20,1,1,Hl)}
 /* braços */
 if(!side){const arm=(x,dy,sh)=>{P(x,19,2,3+dy,B);P(sh?x+1:x,19,1,3+dy,sh?Bd:Bl);P(x,22+dy,2,2,SKIN);P(sh?x+1:x,23+dy,1,1,SKIN_D)};
  const lowLeft=front?A:!A,sw=!walk?0:contact?1:0;arm(3,sw?(lowLeft?-1:1):0,false);arm(15,sw?(lowLeft?1:-1):0,true)}
 else{P(9+na,19,2,3,dk(B,.15));P(10+na,19,1,3,Bd);P(9+na,22,2,2,SKIN);P(10+na,23,1,1,SKIN_D)}
 if(back)backGear();
 if(!ad&&o.cape&&back){P(4,19,12,7,Hc);P(4,19,12,1,Hl);P(14,19,2,7,Hd);P(4,25,12,1,Hd)}
 /* cabeça grande */
 if(back){P(5,9,10,1,hC);P(4,10,12,7,hC);P(5,17,10,1,hD);P(6,10,4,1,hL);P(14,10,1,6,hD);P(7,18,6,1,SKIN_D)}
 else if(side){P(6,9,8,1,hC);P(5,10,10,3,hC);P(5,13,10,4,SKIN);P(6,17,8,1,SKIN);P(7,18,6,1,SKIN_D);P(5,13,4,4,hC);P(6,17,2,1,hD);P(9,13,2,1,hC);P(9,15,1,1,SKIN_D);P(12,14,1,2,INK);P(15,15,1,1,SKIN);P(12,16,1,1,BLUSH);P(7,10,4,1,hL);P(5,12,1,4,hD)}
 else{P(5,9,10,1,hC);P(4,10,12,3,hC);P(4,13,12,4,SKIN);P(5,17,10,1,SKIN);P(6,18,8,1,SKIN_D);P(4,13,2,2,hC);P(14,13,2,2,hC);P(7,13,2,1,hC);P(11,13,1,1,hC);P(4,15,1,1,SKIN_D);P(15,15,1,2,SKIN_D);
  P(7,14,1,2,INK);P(12,14,1,2,INK);P(6,16,1,1,BLUSH);P(13,16,1,1,BLUSH);P(9,17,2,1,SKIN_D);P(6,10,4,1,hL);P(14,10,1,3,hD)}
 /* penteados dos outfits do Lawl (só quando a cabeça não está coberta) */
 if(hairUp&&kind.hair){const hs=kind.hair;
  if(hs==="spiky"){side?(P(6,8,2,1,Hc),P(9,7,2,2,Hc),P(12,8,2,2,Hc)):(P(5,8,2,1,Hc),P(8,7,2,2,Hc),P(11,7,2,2,Hc),P(14,9,2,1,Hc))}
  if(hs==="streak"){side?P(7,10,2,3,IVORY):P(6,10,2,3,IVORY)}
  if(hs==="ponytail"){if(side){P(6,6,4,3,Hc);P(4,7,3,3,Hc);P(3,10,2,5,Hc);P(3,14,2,1,Hd)}else{P(8,6,4,3,Hc);P(8,6,2,1,Hl);if(back){P(9,9,2,10,Hc);P(9,9,1,10,Hl)}else{P(10,4,3,2,Hc);P(12,3,2,1,Hc)}}}
  if(hs==="long"){if(back){P(4,10,12,10,Hc);P(14,10,1,10,Hd);P(4,19,12,1,Hd)}else if(side){P(4,10,3,10,Hc);P(4,19,3,1,Hd)}else{P(3,12,2,8,Hc);P(15,12,2,8,Hc);P(3,19,2,1,Hd);P(15,19,2,1,Hd)}}
  if(hs==="bun"){side?(P(6,6,5,3,Hc),P(7,5,3,1,Hc)):(P(7,6,6,3,Hc),P(8,5,4,1,Hc),P(8,6,2,1,Hl))}
  if(hs==="mohawk"){if(back)P(8,5,4,12,Hc);else if(side){P(6,6,6,1,Hc);P(5,7,9,3,Hc);P(6,7,6,1,Hl)}else{P(8,5,4,6,Hc);P(8,5,1,5,Hl)}}
  if(hs==="wild"){if(side){P(4,8,2,2,Hc);P(6,6,2,3,Hc);P(9,5,2,4,Hc);P(12,6,2,3,Hc)}else{P(3,9,2,2,Hc);P(15,9,2,2,Hc);P(4,7,2,2,Hc);P(14,7,2,2,Hc);P(7,5,2,4,Hc);P(11,5,2,4,Hc);P(9,4,2,2,Hc);P(9,4,1,2,Hl)}}
  if(hs==="sidepart"){if(back)P(4,13,12,4,Hc);else if(side){P(9,13,5,2,Hc);P(12,15,1,1,INK)}else{P(10,13,6,2,Hc);P(13,15,3,1,Hc);P(11,13,1,1,Hl)}}}
 /* chapéus e acessórios de cabeça */
 if(hat==="helm"||hat==="horns"){
  if(back){P(5,7,10,1,Hc);P(4,8,12,10,Hc);P(6,8,4,1,Hl);P(14,8,1,9,Hd);P(4,17,12,1,Hd)}
  else if(side){P(6,7,8,1,Hc);P(5,8,10,5,Hc);P(5,13,4,4,Hc);P(7,8,4,1,Hl);P(5,12,10,1,Hd);P(13,13,2,1,Hd)}
  else{P(5,7,10,1,Hc);P(4,8,12,5,Hc);P(4,13,2,4,Hc);P(14,13,2,4,Hc);P(6,8,4,1,Hl);P(14,9,1,3,Hd);P(4,12,12,1,Hd);P(9,13,2,2,Hd)}
  if(!side){P(2,19,4,2,Hc);P(14,19,4,2,Hc);P(2,19,4,1,Hl);P(14,20,4,1,Hd)}else{P(8,19,4,2,Hc);P(8,19,4,1,Hl)}
  if(hat==="horns"){if(side){P(5,6,2,3,IVORY);P(4,4,2,2,IVORY)}else{P(2,7,2,3,IVORY);P(1,5,2,2,IVORY);P(16,7,2,3,IVORY);P(17,5,2,2,IVORY);P(2,9,2,1,dk(IVORY,.2));P(16,9,2,1,dk(IVORY,.2))}}}
 if(hat==="hood"||hat==="mask"){
  if(back){P(7,6,6,1,Hc);P(5,7,10,1,Hc);P(4,8,12,10,Hc);P(6,8,4,1,Hl);P(14,8,1,10,Hd)}
  else if(side){P(4,8,2,2,Hc);P(6,7,8,1,Hc);P(5,8,10,5,Hc);P(4,10,5,8,Hc);P(7,8,4,1,Hl);P(9,12,6,1,Hd)}
  else{P(7,6,6,1,Hc);P(5,7,10,1,Hc);P(4,8,12,5,Hc);P(4,13,2,5,Hc);P(14,13,2,5,Hc);P(6,8,4,1,Hl);P(6,12,8,1,Hd);P(14,9,1,8,Hd)}
  if(hat==="mask"&&!back){side?(P(11,16,5,2,Hd),P(11,16,5,1,Hc)):(P(5,16,10,2,Hd),P(5,16,10,1,Hc))}}
 if(wizHat){if(o.hat!==false){
   if(side){P(3,11,14,2,Hc);P(3,12,14,1,Hd);P(6,8,8,3,Hc);P(6,10,8,1,GOLD);P(5,5,6,3,Hc);P(4,3,4,2,Hc);P(3,2,2,1,Hc);P(7,8,3,1,Hl)}
   else{P(2,11,16,2,Hc);P(2,12,16,1,Hd);P(5,8,10,3,Hc);P(5,10,10,1,GOLD);P(7,5,6,3,Hc);P(9,3,4,2,Hc);P(11,2,3,1,Hc);P(6,8,3,1,Hl);P(13,8,1,2,Hd);if(front)P(10,10,1,1,"#fff6c8")}}
  else if(!back){side?P(5,13,3,6,Hc):(P(4,13,2,6,Hc),P(14,13,2,6,Hc))}}
 if(hat==="leaf"){if(side){P(5,10,10,1,LEAF_D);P(6,8,2,2,LEAF);P(10,8,2,2,LEAF)}else{P(4,10,12,1,LEAF_D);P(4,8,2,2,LEAF);P(9,7,2,2,LEAF);P(14,8,2,2,LEAF);P(9,7,1,1,lt(LEAF,.35))}}
 if(hat==="crown"){const x0=side?6:5,w=side?8:10;P(x0,8,w,2,GOLD);P(x0,9,w,1,dk(GOLD,.25));for(let i=x0;i<x0+w;i+=side?3:4)P(i,6,2,2,GOLD);if(!back)P(side?11:9,8,2,1,palette[3][1])}
 if(!ad&&o.ornament&&!side){P(3,19,2,1,GOLD);P(15,19,2,1,GOLD)}
 /* addons dos outfits do Lawl */
 if(ad){
  if(on("mask")||on("ninja")||on("band")){if(back)P(9,15,2,1,Hd);else if(side){P(11,16,5,2,Hd);P(11,16,5,1,Hc)}else{P(5,16,10,2,Hd);P(5,16,10,1,Hc)}}
  if(on("band")||on("ninja")){side?P(5,11,10,1,Hd):P(4,11,12,1,Hd);if(back){P(9,11,2,3,Hd)}}
  if(on("ninja")&&!side){P(4,7,1,3,Hc);P(15,7,1,3,Hc)}else if(on("ninja"))P(6,7,1,3,Hc);
  if(on("plume")){side?(P(8,3,3,4,IVORY),P(8,3,3,1,"#ffffff")):(P(9,3,2,4,IVORY),P(9,3,2,1,"#ffffff"))}
  if(on("feather")){if(side)P(7,5,2,4,Hc);else if(back)P(6,5,2,4,Hc);else{P(12,5,2,4,Hc);P(13,4,1,2,Hl);P(12,9,2,1,Hd)}}
  if(on("scar")&&!back){side?(P(11,13,3,3,Hc),P(12,14,1,2,INK)):(P(6,13,3,3,Hc),P(7,14,1,2,INK))}
  if(on("flames")){const fl=(x,y,w,h)=>{P(x,y,w,h,FIRE);P(x,y+h-1,w,1,Hc);P(x,y,1,1,FIRE_L)};side?(fl(6,5,2,4),fl(9,3,2,6),fl(12,5,2,4)):(fl(5,5,2,4),fl(9,3,2,6),fl(13,5,2,4))}
  if(on("pads")||on("bones")){const c=on("bones")?IVORY:L;if(side){P(8,18,4,3,c);P(8,18,4,1,lt(c,.25))}else{P(2,18,4,3,c);P(14,18,4,3,c);P(2,18,4,1,lt(c,.25));P(14,18,4,1,lt(c,.25))}
   if(on("bones")){side?P(9,16,2,2,IVORY):(P(2,16,2,2,IVORY),P(16,16,2,2,IVORY))}}
  if(on("dagger")&&!back){side?(P(6,22,1,3,STEEL),P(5,22,3,1,GOLD)):(P(14,22,1,3,STEEL),P(13,22,3,1,GOLD))}
  if(on("skirt")){P(4,23,12,3,L);P(4,23,1,3,lt(L,.2));P(4,25,12,1,Ld)}
  /* item na mão: cajado, cajado espiral, foice e bola de fogo */
  const hx=back?2:side?12:17;
  if(on("staff")||on("crook")||on("scythe")){P(hx,10,1,16,WOOD);P(hx,25,1,1,WOOD_D);
   if(on("staff")){P(hx-1,8,3,2,WOOD_D);P(hx,7,1,1,palette[9][1])}
   if(on("crook")){P(hx-2,6,3,1,DARK);P(hx+1,7,1,3,DARK);P(hx-2,7,1,2,DARK);P(hx-1,9,1,1,DARK);P(hx,10,1,2,DARK)}
   if(on("scythe")){const d=back?-1:1;P(hx,9,1,1,WOOD_D);for(let i=0;i<3;i++)P(hx+d*(i+1),8+i,1,1,STEEL);P(hx+d,9,1,1,STEEL);P(hx+d*3,11,1,1,lt(STEEL,.4))}
   if(!back)P(hx-1,22,2,2,SKIN)}
  if(on("fireball")){const fx=back?16:side?12:0;P(fx,19,4,4,FIRE);P(fx+1,20,2,2,FIRE_L);P(fx+1,18,2,1,"#ff5a1f")}}
 /* acabamento em pixel art (luz em faixas e contorno seletivo); sem suporte a leitura de pixels cai no contorno simples de 1 pixel */
 let fin=null;try{fin=shadePixel(base)}catch(e){fin=null}
 if(!fin){const q=out.getContext("2d");for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])q.drawImage(base,a,b);
  q.globalCompositeOperation="source-in";q.fillStyle=INK;q.fillRect(0,0,W,H);q.globalCompositeOperation="source-over";q.drawImage(base,0,0);fin=out}
 if(cache.size>420){let n=0;for(const k of cache.keys()){cache.delete(k);if(++n>=105)break}}cache.set(key,fin);return fin;
}
function draw(ctx,x,y,size,value,voc,dir="south",time=0,moving=false){
 const o=normalize(value,voc),kind=catalog.find(c=>c.id===o.id),u=size/20;
 const view=dir==="north"?"north":dir==="east"||dir==="west"?"east":"south",f=moving?((Math.floor(time*8)%4)+4)%4+1:0,contact=f===1||f===3;
 const img=sprite(o,kind,view,f);if(!img)return;
 /* passada em pixels inteiros: o corpo sobe 1 pixel quando a perna passa no ar e respira 1 pixel parado (sem girar nem esticar, para não borrar os pixels) */
 const bob=moving?(contact?0:-u):(Math.sin(time*2.4)>.6?-u:0);
 ctx.save();ctx.imageSmoothingEnabled=false;
 if(dir==="west"){ctx.translate(2*x+size,0);ctx.scale(-1,1)}
 ctx.drawImage(img,Math.round(x-PAD*u),Math.round(y+(-TOP-PAD)*u+bob),Math.round((GW+2*PAD)*u),Math.round((GH+2*PAD)*u));
 ctx.restore();
}
/* Quadro do ciclo de caminhada (0 parado, 1..4 andando); exposto para a poeira dos passos acompanhar os pés. */
function walkFrame(time,moving){return moving?((Math.floor(time*8)%4)+4)%4+1:0}
root.LawlOutfits={palette,catalog,normalize,apply,draw,walkFrame};
})(globalThis);