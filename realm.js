window.Realm=(()=>{
const titles=['潮路の岬','銅嶺の山道','月川の灯市'],images=[],loads=[];
function supply(k,url){const im=new Image();images[k]=im;im.src=url}
function load(k){if(!loads[k])loads[k]=new Promise((ok,fail)=>{const s=document.createElement('script');s.src='./realm-art'+k+'.js';s.onload=()=>images[k].decode().then(ok,fail);s.onerror=fail;document.head.append(s)});return loads[k]}
function draw(c,i){c.width=40;c.height=48;c.dataset.realm=String(i);const k=Math.floor(i/100),j=i%100;function paint(){if(c.dataset.realm===String(i))c.getContext('2d').drawImage(images[k],j%10*40,Math.floor(j/10)*48,40,48,0,0,40,48)}if(images[k]?.naturalWidth)paint();else load(k).then(paint)}
const stems=['アレ カイ セラ ドゥ ミオ グラ ノエ トリ ハル リュ','エル バル ティ オル ベル ラグ アス ディ ヴェ ユル','アサ ユウ ミツ サヨ トウ ヒナ キヨ ツキ ハナ シラ'].map(s=>s.split(' '));
const ends=['オル ナ リス サム ト ルカ ミヤ レン コア ネス','ドン ダ サル ガル メル トム ハン ラフ ノル テル','ノ ネ ハ ナギ マル リ ホ セ ヤ ネリ'].map(s=>s.split(' '));
function name(i){let k=Math.floor(i/100),j=i%100;return stems[k][j%10]+ends[k][(Math.floor(j/10)+3*j)%10]}
function role(i){return (i+Math.floor(i/10))%4}
function apply(p,v){if(!/^\d{1,3}$/.test(v??'')||+v>=300||p.role!==role(+v))return;p.realmId=+v;p.name=name(+v);p.origin=titles[Math.floor(v/100)]}
function entry(i){let n=900000+i*200;for(;;n++){let j=AlveinDeck.init(n).offers.findIndex(p=>p.role===role(i));if(j>=0)return[n,j]}}
return {titles,load,supply,draw,name,role,apply,entry};
})();
