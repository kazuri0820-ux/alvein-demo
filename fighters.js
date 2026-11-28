/* Fixed human combatants. Numeric IDs are permanent save identifiers. */
window.Fighters = (() => {
  const roles = "3000000000202002020020102110001001000000000000202202011200001000010201000000000100001010000101000000001000000010021000300000101300000200002200020000000000000000120010000031000301100030001000001002000000100010123000002012000002200000000001001000000001300000001000100000200000010110100100010000110000000000100020100000000010001000000000020220000100000010000000000000100002010000120002110200000300000110000000030000000110000200001010000100000220021000001000000020002020000002000022000010000000000000002200010000032100000000020012000000022000000000000020000000100100030000001200100102021000000100001210020100000220102101000000003010001003000000101101020000202200000000010000000320000001000200000000000010000022122020102200020001200021010021010000000000000000100000010232000000200200203020000000320001000022002100000001100002010001130000000000000100012120002300000002000100000000000010130010030100300003000000300200100200001020000323002020000000000001020000000000000001100000000000000000000300000000020003";
  const count = roles.length;
  const first = 'アキ イサ エナ オリ カナ キヨ クレ コハ サヨ シノ スイ セナ ソラ タキ チセ ツキ トワ ナギ ニオ ネリ ハル ヒナ フウ ホノ マオ ミナ ムツ メイ モカ ユラ ライ リク'.split(' ');
  const last = 'ヤ リン ト ネ カ セ リ オ ナギ レイ ホ マル サギ ルカ ロン ラ ノア ユキ ノリ ミヤ タル イル アン ガル ラン タカ スズ マキ リオ フミ サク'.split(' ');
  const honors = '白刃 緋盾 金糸 黒曜 蒼星 翡翠 銀弦 黎明 藍月 残火'.split(' ');
  const images = new Map(), loading = new Map();
  const byRole = [[], [], [], []];
  for (let i=0;i<count;i++) byRole[+roles[i]].push(i);
  function valid(id) { return Number.isInteger(id) && id>=0 && id<count; }
  function name(id) {
    if (id===0) return 'ノル';
    const n=first[id%first.length]+last[Math.floor(id/first.length)%last.length];
    return id>=count-100 ? honors[Math.floor((id-count+100)/10)]+'の'+n : n;
  }
  function use(p,id) {
    if(!valid(id)||p.role!==+roles[id]) return false;
    p.fighterId=id;p.name=name(id);p.origin=id>=count-100?'残火の百傑':'残火の城';
    if(id>=count-100)p.rarity='rare';else delete p.rarity;
    return true;
  }
  function pick(p) {
    if(valid(p.fighterId))return p.fighterId;
    if(p.roadId===0)return 0;
    const choices=byRole[p.role]||byRole[0];
    return choices[(p.appearanceSeed>>>0)%choices.length];
  }
  function migrate(p) {
    if(valid(p.fighterId))return;
    const legacy=['realmId','landId','roadId','folioId'].filter(k=>Number.isInteger(p[k]));
    if(!legacy.length)return;
    let target=pick(p);
    if(p.rarity==='rare'){
      const elite=byRole[p.role].filter(id=>id>=count-100);
      if(elite.length)target=elite[(p.appearanceSeed>>>0)%elite.length];
    }
    use(p,target);for(const key of legacy)delete p[key];
  }
  function entry(id) {
    for(let seed=1500000+id*200;;seed++){
      const pos=AlveinDeck.init(seed).offers.findIndex(p=>p.role===+roles[id]);
      if(pos>=0)return [seed,pos];
    }
  }
  function load(k) {
    if(!loading.has(k))loading.set(k,new Promise((ok,fail)=>{
      const s=document.createElement('script');s.src='./fighter-art'+k+'.js';
      s.onload=()=>images.get(k).decode().then(()=>{dispatchEvent(new Event('fighters-ready'));ok()},fail);
      s.onerror=fail;document.head.append(s);
    }).catch(e=>{loading.delete(k);throw e}));
    return loading.get(k);
  }
  function supply(k,url){const im=new Image();images.set(k,im);im.src=url}
  function draw(canvas,id) {
    canvas.width=40;canvas.height=48;canvas.dataset.fighter=String(id);
    const k=Math.floor(id/100), j=id%100;
    const paint=()=>{if(canvas.dataset.fighter===String(id)) canvas.getContext('2d').drawImage(images.get(k),j%10*40,Math.floor(j/10)*48,40,48,0,0,40,48)};
    if(images.get(k)?.naturalWidth)paint();else load(k).then(paint);
  }
  return {count,roles,name,valid,use,pick,migrate,entry,draw,supply,load};
})();
