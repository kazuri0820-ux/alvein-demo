window.RecruitFoundry=(()=>{
 const images=RecruitLayers.map(src=>{const im=new Image();im.src=src;return im});
 const ready=Promise.all(images.map(im=>im.decode()));
 const places=['水鐘楼','焼門','灰果園'],cards=['ward','mark','arrow'];
 const first=['エ','カ','サ','シ','ナ','ハ','ミ','ユ','リ','ル','レ','ロ'],last=['イル','オ','キ','ク','セ','ト','ナ','ネ','ハ','ヤ','リ','ワ'];
 function random(seed){let x=seed>>>0;return n=>{x=(x+0x6d2b79f5)>>>0;let z=Math.imul(x^(x>>>15),x|1);z^=z+Math.imul(z^(z>>>7),z|61);return ((z^(z>>>14))>>>0)%n}}
 function identity(p){const roll=random(p.appearanceSeed),origin=roll(3),head=roll(3),coat=roll(4)?origin:roll(3),dye=roll(3);
 return {look:732+head+3*coat+9*dye,name:first[roll(12)]+last[roll(12)],origin:places[origin],card:cards[origin]}}
 // Each recruit has a former occupation. Its learned technique is fixed;
 // temperament varies within a weighted pool appropriate to that occupation.
 const trades=[
  [['渡し綱の番人','濁流の音を聞き分け、最後の一人が渡るまで綱を張った。','ward','volley',[5,5,2]],['灯船の先導','霧の日には、燃える矢で帰港する船に水路を示した。','mark','nova',[3,3,0]]],
  [['落とし門の衛士','味方の退路を空け、門の狭間から追手を押し返した。','ward','volley',[5,5,4]],['焼印の見張り','敵の通る橋桁に印を刻み、火矢の合図を仲間に教えた。','mark','nova',[3,3,2]]],
  [['尾根の走り使い','追手が尾根を越す前に、一矢で仲間に危険を報せた。','arrow','volley',[4,4,0]],['火除けの剪定師','飛び火の先を読み、延焼する枝だけを射落とした。','blast','nova',[2,2,3]]]
 ];
 function apply(p){
   const a=identity(p),roll=random(p.appearanceSeed^0x7139d2ab);
   const [job,history,opening,signature,talents]=trades[places.indexOf(a.origin)][roll(2)];
   const slot=p.deck.indexOf(p.signature);
   if(slot>=0)p.deck[slot]=signature;
   p.signature=signature;p.deck[0]=opening;p.talent=talents[roll(talents.length)];
   p.emberLook=a.look;p.name=a.name;p.origin=a.origin;p.trade=job;p.tradeHistory=history;
 }
 const cache=new Map();
 function draw(canvas,n){
 canvas.width=274;canvas.height=440;
 if(!images.every(im=>im.complete&&im.naturalWidth))return;
 if(!cache.has(n)){
 const tile=document.createElement('canvas');tile.width=274;tile.height=440;const c=tile.getContext('2d');
 const k=n-732,coat=Math.floor(k/3)%3,dye=Math.floor(k/9)%3;
 c.drawImage(images[3+coat],0,0);if(dye){
 const data=c.getImageData(0,0,274,440),v=data.data;
 for(let i=0;i<v.length;i+=4){const r=v[i],g=v[i+1],b=v[i+2];
 const cloth=coat===0?r>g*1.3&&g>b*1.5:coat===1?b>r*1.14&&b>g*1.04:r>g*1.7&&b>g*.88;
 if(cloth&&v[i+3]){const y=.28*r+.55*g+.17*b;const pal=dye===1?[.68,1.12,1.13]:[1.18,.85,1.19];for(let j=0;j<3;j++)v[i+j]=y*pal[j]}}
 c.putImageData(data,0,0)}
 c.drawImage(images[k%3],0,0);cache.set(n,tile)}
 canvas.getContext('2d').drawImage(cache.get(n),0,0)
 }
 function batch(seed,slot,used=[]){let b=(seed+Math.imul(slot,2654435761))>>>0;
 for(;;){const offers=AlveinDeck.init(b).offers,i=offers.findIndex(p=>p.role===2);
 if(i>=0){const p=offers[i];apply(p);if(!used.some(v=>v.p.name===p.name||(v.p.emberLook-732)%9===(p.emberLook-732)%9))return {p,i,b}}b=(b+1)>>>0}}
 return {batch,apply,draw,ready};
})();
