(function(root){'use strict';
const roles=[{name:'騎士',job:'guard',armor:'plate',weapon:'sword',hp:38,deck:['strike','ward','break','strike','ward','oath']},{name:'術師',job:'mage',armor:'robe',weapon:'staff',hp:28,deck:['spark','flame','focus','spark','flame','ward']},{name:'弓兵',job:'ranger',armor:'leather',weapon:'bow',hp:32,deck:['arrow','mark','blast','arrow','mark','ward']},{name:'司祭',job:'mage',armor:'robe',weapon:'staff',hp:34,deck:['mend','ward','light','mend','light','oath']}];
const cards={
strike:['斬撃','⚔',1,'enemy','敵に7ダメージ','剣技'],ward:['守り','⛨',1,'ally','味方1人に防御8','防御'],break:['破甲斬','⚒',1,'enemy','敵に5ダメージ・破甲2ターン','剣技'],oath:['守護誓約','✦',1,'ally','防御5。対象が次に攻撃すると追加4','支援'],
spark:['雷撃','ϟ',1,'enemy','敵に6。破甲中なら追加4','魔法'],flame:['業火','♨',1,'enemy','敵に4・火傷4。破甲中なら火傷+3','魔法'],focus:['星の導き','✧',0,'self','自分の山札から1枚引く。消費型','支援'],
arrow:['速射','➶',1,'enemy','敵に6。印があれば追加4','射撃'],mark:['狩人の印','◎',1,'enemy','敵に3・印2','射撃'],blast:['炸裂矢','✹',1,'enemy','敵に5。火傷を消費し敵全体にその値を追加','射撃'],
mend:['癒しの光','✚',1,'ally','味方を7回復','回復'],light:['聖なる光','✦',1,'enemy','敵に7。最も負傷した味方を2回復','魔法'],
mirror:['鏡影剣','◇',1,'enemy','敵に6。直前の仲間が魔法を使ったなら追加6','剣技'],blood:['血盟','♦',0,'enemy','自分のHP4を払い敵に8','剣技'],fortress:['城塞','⛨',1,'ally','味方に防御12','防御'],storm:['連鎖雷','ϟ',2,'enemy','敵全体に8。印がある敵には追加4','魔法'],bloom:['生命の環','✿',2,'ally','全員を5回復し、防御3','回復'],volley:['流星雨','➶',2,'enemy','敵全体に7。破甲中なら追加3','射撃'],
vow:['煉獄の城壁','♜',1,'ally','防御10、次に防御で受け止めると火傷6','連携'],nova:['灼熱の連携','☀',1,'enemy','敵に4。火傷と印をそれぞれ2追加','連携'],pierce:['裂空斬','⚔',1,'enemy','敵に10。破甲2','剣技']
};
const talents=[{name:'残響',desc:'各ターン初めて仲間の攻撃の後に攻撃すると追加3'},{name:'代償',desc:'各ターン一度、行動力不足のカードをHP5で使用'},{name:'蓄積',desc:'前ターンの未使用行動力1を持ち越す'},{name:'共鳴',desc:'各ターン初めて仲間が状態を付けた敵を攻撃すると追加4'},{name:'双撃',desc:'各ターン最初の攻撃で追加3'},{name:'献身',desc:'各ターン最初に味方を守ると追加防御4'}];
const names1=['ア','リュ','セ','ヴァ','ノ','ミ','イ','レ','エル','カ','オル','フィ','シェ','ロ','テ','ユ'],names2=['ル','ディン','リア','ノア','ベル','ゼル','シア','ラン','メル','ティス','ヴェン','ネス','フォル','リス','ナ','リオ'];
const origins=['北方の砦','翠雨の森','白銀の都','星の谷','赤土の村','湖畔の修道院'];
const pools=[['mirror','fortress','pierce','oath','vow'],['storm','flame','nova','focus','spark'],['volley','blast','nova','arrow','mark'],['bloom','mend','vow','light','oath']];
const enemyTypes=[{name:'灰狼の群れ',hp:24,atk:6,kind:'single',art:'wolf'},{name:'古代の番兵',hp:34,atk:8,kind:'single',art:'guard'},{name:'灯霊',hp:25,atk:5,kind:'all',art:'spirit'},{name:'黒鋼の騎士',hp:55,atk:11,kind:'single',art:'guard'},{name:'星喰いの竜',hp:105,atk:9,kind:'all',art:'dragon'}];
const rand=s=>{s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296},pick=(s,a)=>a[Math.floor(rand(s)*a.length)],copy=o=>JSON.parse(JSON.stringify(o)),alive=a=>a.filter(p=>p.hp>0),note=(r,m)=>{r.log=[m,...r.log].slice(0,22)};
function person(s,role,forced){const id=s.next++,job=role??Math.floor(rand(s)*4),r=roles[job],talent=forced??Math.floor(rand(s)*6),name=names1[id%16]+names2[Math.floor(id/16)%16]+(id>=256?' '+Math.floor(id/256):''),signature=pick(s,pools[job].filter(x=>['mirror','fortress','storm','bloom','volley','pierce','nova','vow'].includes(x)));return {id,name,role:job,talent,origin:pick(s,origins),potential:2+Math.floor(rand(s)*4),hp:r.hp+Math.floor(rand(s)*7),deck:[...r.deck,signature],signature,learned:[],wins:0}}
function init(seed=Date.now()>>>0){let s={version:1,rng:seed>>>0,next:1,coins:4,roster:[],offers:[],party:[],runs:0,record:0,run:null};s.roster=[person(s,0,5),person(s,1,3),person(s,2,0)];s.party=s.roster.map(p=>p.id);s.offers=Array.from({length:3},()=>person(s));return s}
function recruit(s,id){if(s.run||s.coins<1||s.roster.length>=40)return false;let p=s.offers.find(p=>p.id===id);if(!p)return false;s.coins--;s.roster.push(p);s.offers=s.offers.map(q=>q===p?person(s):q);return true}
function scout(s){if(s.run||s.coins<1)return false;s.coins--;s.offers=Array.from({length:3},()=>person(s));return true}
function assign(s,i,id){if(s.run||!Number.isInteger(i)||i<0||i>2||!s.roster.some(p=>p.id===id))return false;let j=s.party.indexOf(id);if(j>=0)s.party[j]=s.party[i];s.party[i]=id;return true}
function equip(s,id,card,idx){let p=s.roster.find(p=>p.id===id);if(s.run||!p||!p.learned.includes(card)||!Number.isInteger(idx)||idx<0||idx>=p.deck.length||idx===p.deck.length-1)return false;p.deck[idx]=card;return true}
function shuffle(s,a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(rand(s)*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function draw(s,h,n){for(let i=0;i<n;i++){if(!h.deck.length){h.deck=shuffle(s,h.discard);h.discard=[]}if(!h.deck.length)break;h.hand.push(h.deck.pop())}}
function foes(stage){let a=stage===1?[0,1]:stage===2?[2,3]:[4,2];return a.map((k,i)=>({...enemyTypes[k],id:'e'+i,max:enemyTypes[k].hp,burn:0,break:0,mark:0,shield:0,target:i}))}
function openHands(s,r){
  const lesson=['break','flame','blast'];
  r.guide=s.runs===0&&r.heroes.every((h,i)=>h.role===i&&h.base.includes(lesson[i]));
  r.heroes.forEach((h,i)=>{
    if(r.guide)h.hand.push(h.deck.splice(h.deck.indexOf(lesson[i]),1)[0]);
    draw(s,h,3-h.hand.length);
  });
}
function start(s,mode='personal'){if(s.run)return false;let r=s.run={mode:mode==='shared'?'shared':'personal',energy:6,stage:1,turn:1,phase:'battle',heroes:s.party.map(id=>{let p=s.roster.find(q=>q.id===id);return {...copy(p),max:p.hp,hp:p.hp,base:[...p.deck],deck:shuffle(s,p.deck),hand:[],discard:[],temp:[],energy:2,block:0,boost:0,fireward:0,used:false}}),enemies:foes(1),last:null,chain:0,best:0,link:0,log:['遠征開始。騎士・術師・弓兵の連携を試そう。'],rewards:[],permanent:[]};openHands(s,r);intents(r);return true}
function intents(r){
  const heroes=alive(r.heroes);
  r.enemies.forEach((e,i)=>{e.target=heroes.length?heroes[(r.turn+i-1)%heroes.length].id:null});
}
function intent(r,e,predictBurn=true){
  const target=r.heroes.find(h=>h.id===e.target&&h.hp>0)||alive(r.heroes)[0];
  if(predictBurn&&e.burn>=e.hp&&e.hp>0)return {kind:'burn',value:e.burn};
  if(e.art==='guard'&&r.turn%3===2)return {kind:'guard',value:10};
  const value=e.art==='dragon'?(r.turn%3===1?7:r.turn%3===2?19:10):e.atk;
  return {kind:e.kind,value,target:target?.id,description:e.art==='dragon'?(r.turn%3===2?'蝕の咆哮':'星火'):'攻撃'};
}
function damage(r,e,n){
  if(!e||e.hp<=0)return;
  let d=n+(e.break>0?2:0), shield=Math.min(e.shield,d);
  e.shield-=shield;
  e.hp=Math.max(0,e.hp-d+shield);
}
function heal(h,n){h.hp=Math.min(h.max,h.hp+n)}
function energy(r,h){return r?.mode==='shared'?r.energy:h.energy}
function unavailable(h,c,r){
  if(!h||h.hp<=0)return '戦闘不能';
  if(!Object.hasOwn(cards,c))return 'カードなし';
  if(c==='blood'&&h.hp<=4)return 'HPが5以上必要';
  if(energy(r,h)>=cards[c][2])return '';
  if(h.talent===1&&!h.used&&h.hp>5)return '';
  return '行動力不足';
}
function affordable(h,c,r){return !unavailable(h,c,r)}
function uid(r,id){return r.heroes.find(h=>h.id===id)?.name}
function targetType(c){
  if(['storm','volley','bloom','focus'].includes(c))return 'self';
  return cards[c]?.[3];
}
function offer(s){let r=s.run;r.phase='reward';r.rewards=[];for(let h of alive(r.heroes)){let a=pools[h.role].filter(c=>!h.base.includes(c));if(!a.length)a=pools[h.role];r.rewards.push({id:h.id,card:pick(s,a)})}if(r.link>=2&&alive(r.heroes).length>=2){let h=alive(r.heroes)[0];r.rewards.push({id:h.id,card:r.heroes.some(p=>p.role===0)&&r.heroes.some(p=>p.role===1)?'vow':'nova'})}note(r,'勝利！ カードを1枚選ぶ。')}
function check(s){let r=s.run;if(!alive(r.heroes).length){r.phase='defeat';note(r,'部隊は撤退した。')}else if(!alive(r.enemies).length&&r.phase==='battle'){s.record=Math.max(s.record,r.stage);offer(s)}}
function play(s,id,index,target,report){
  const r=s.run;
  if(!r||r.phase!=='battle'||!Number.isInteger(index))return false;
  const h=r.heroes.find(p=>p.id===id), c=h?.hand[index], a=cards[c];
  if(!affordable(h,c,r))return false;
  const type=targetType(c), atk=a[3]==='enemy';
  const e=(type==='self'&&atk?alive(r.enemies)[0]:r.enemies.find(p=>p.id===target&&p.hp>0));
  const ally=type==='self'?h:r.heroes.find(p=>p.id===target&&p.hp>0);
  if((type==='enemy'&&!e)||(type==='ally'&&!ally))return false;
  const reasons=[];
  const reactions=new Set();
  const reason=(message,source)=>{
    reasons.push(source&&uid(r,source)?uid(r,source)+'の'+message:message);
    if(source&&source!==id)reactions.add(source);
  };
  const pool=r.mode==='shared'?r:h, cost=a[2];
  if(pool.energy<cost){
    h.hp-=5; h.used=true; pool.energy=0; reason('代償 −5 HP');
  }else pool.energy-=cost;
  h.hand.splice(index,1);
  if(c==='focus')h.exhausted=[...(h.exhausted||[]),c];
  else h.discard.push(c);
  const prev=r.last, targets=type==='self'?alive(r.enemies):[e];
  let bonus=0;
  if(atk){
    if(h.boost){
      bonus+=h.boost; reason('守護誓約 +'+h.boost,h.boostBy); h.boost=0; h.boostBy=null;
    }
    const source=targets.flatMap(p=>p?[p.break&&p.breakBy,p.burn&&p.burnBy,p.mark&&p.markBy]:[])
      .find(src=>src&&src!==id);
    if(!h.used&&((h.talent===0&&prev&&prev.id!==id&&prev.attack)||(h.talent===3&&source)||h.talent===4)){
      const extra=h.talent===3?4:3;
      bonus+=extra; h.used=true;
      reason(talents[h.talent].name+' +'+extra);
      if(h.talent===0)reactions.add(prev.id);
      if(h.talent===3)reactions.add(source);
    }
  }
  const hit=(p,n)=>{
    if(p.break)reason('破甲 +2',p.breakBy);
    damage(r,p,n+bonus);
  };
  const status=(p,key,n)=>{
    if(p.hp<=0)return;
    p[key]=key==='burn'?p[key]+n:Math.max(p[key],n);
    p[key+'By']=id;
  };
  switch(c){
    case 'strike': hit(e,7); break;
    case 'ward': ally.block+=8; break;
    case 'break': hit(e,5); status(e,'break',2); break;
    case 'oath': ally.block+=5; ally.boost+=4; ally.boostBy=id; break;
    case 'spark':
      if(e.break)reason('破甲に雷撃 +4',e.breakBy);
      hit(e,6+(e.break?4:0)); break;
    case 'flame':
      if(e.break)reason('破甲に業火 · 火傷+3',e.breakBy);
      hit(e,4); status(e,'burn',4+(e.break?3:0)); break;
    case 'focus': draw(s,h,1); break;
    case 'arrow':
      if(e.mark)reason('印に速射 +4',e.markBy);
      hit(e,6+(e.mark?4:0)); break;
    case 'mark': hit(e,3); status(e,'mark',2); break;
    case 'blast': {
      const burn=e.burn;
      hit(e,5);
      if(burn){
        reason('火傷を爆発 · 全体 '+burn,e.burnBy);
        e.burn=0; e.burnBy=null;
        alive(r.enemies).forEach(p=>hit(p,burn-bonus));
      }
      break;
    }
    case 'mend': heal(ally,7); break;
    case 'light':
      hit(e,7); heal(alive(r.heroes).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0],2); break;
    case 'mirror': {
      const afterMagic=prev&&prev.id!==id&&prev.type==='魔法';
      if(afterMagic)reason('魔法を反射 +6',prev.id);
      hit(e,6+(afterMagic?6:0)); break;
    }
    case 'blood': h.hp-=4; reason('血盟 −4 HP'); hit(e,8); break;
    case 'fortress': ally.block+=12; break;
    case 'storm':
      targets.forEach(p=>{
        if(p.mark)reason('印に連鎖雷 +4',p.markBy);
        hit(p,8+(p.mark?4:0));
      }); break;
    case 'bloom': alive(r.heroes).forEach(p=>{heal(p,5);p.block+=3}); break;
    case 'volley': targets.forEach(p=>hit(p,7+(p.break?3:0))); break;
    case 'vow': ally.block+=10; ally.fireward=6; ally.firewardBy=id; break;
    case 'nova': hit(e,4); status(e,'burn',2); status(e,'mark',2); break;
    case 'pierce': hit(e,10); status(e,'break',2); break;
  }
  if(ally&&!h.used&&h.talent===5&&['ward','oath','fortress','vow','bloom'].includes(c)){
    ally.block+=4;h.used=true;reason('献身 · 防御+4');
  }
  if(reactions.size){
    r.link++;r.chain++;r.best=Math.max(r.best,r.chain);
  }else if(atk)r.chain=0;
  r.last={id,attack:atk,type:a[5]};
  r.feedback={text:h.name+' · '+a[0],reasons:[...new Set(reasons)],linked:reactions.size>0};
  note(r,r.feedback.text+(reasons.length?' ／ '+r.feedback.reasons.join('、'):''));
  if(report)Object.assign(report,r.feedback);
  check(s);
  return true;
}
function preview(s,id,index,target){
  const simulation=copy(s), result={};
  if(!play(simulation,id,index,target,result))return null;
  const delta=(group,keys)=>simulation.run[group].flatMap((p,i)=>{
    const changes=Object.fromEntries(keys.filter(k=>p[k]!==s.run[group][i][k]).map(k=>[k,p[k]-s.run[group][i][k]]));
    return Object.keys(changes).length?[{id:p.id,name:p.name,...changes}]:[];
  });
  const actor=simulation.run.heroes.find(h=>h.id===id);
  const before=s.run.heroes.find(h=>h.id===id);
  const drawn=before.hand[index]==='focus'?actor.hand.length-before.hand.length+1:0;
  return {...result,drawn,enemies:delta('enemies',['hp','break','burn','mark','shield']),
    heroes:delta('heroes',['hp','block','boost','fireward'])};
}
function enemyHit(r,e,h,n){
  if(!h||h.hp<=0)return;
  const block=Math.min(h.block,n); h.block-=block;
  h.hp=Math.max(0,h.hp-(n-block));
  if(h.fireward&&block>0){
    e.burn+=h.fireward;e.burnBy=h.firewardBy;h.fireward=0;note(r,'煉獄の城壁が反撃！');
  }
  note(r,e.name+' → '+h.name+' '+(n-block)+'ダメージ');
}
function end(s){
  const r=s.run;
  if(!r||r.phase!=='battle')return false;
  r.feedback=null; r.guide=false;
  for(const e of alive(r.enemies)){
    if(e.burn){
      e.hp=Math.max(0,e.hp-e.burn);note(r,e.name+' 火傷 '+e.burn);e.burn--;
    }
    if(e.hp<=0)continue;
    const move=intent(r,e,false);
    if(move.kind==='guard'){
      e.shield=move.value;
      note(r,e.name+'が防御'+move.value+'を張った');
    }else if(e.kind==='all'){
      alive(r.heroes).forEach(h=>enemyHit(r,e,h,move.value));
    }else enemyHit(r,e,r.heroes.find(h=>h.id===move.target),move.value);
    e.break=Math.max(0,e.break-1);e.mark=Math.max(0,e.mark-1);
  }
  check(s);
  if(r.phase!=='battle')return true;
  if(r.turn>=30)return withdraw(s);
  const carry=r.mode==='shared'&&r.energy>0?alive(r.heroes).filter(h=>h.talent===2).length:0;
  r.energy=6+carry; r.turn++;r.last=null;r.chain=0;
  r.heroes.forEach(h=>{
    const extra=h.talent===2&&h.energy>0?1:0;
    h.energy=2+extra;h.used=false;h.block=0;h.fireward=0;
    h.discard.push(...h.hand);h.hand=[];
    if(h.hp>0)draw(s,h,3);
  });
  intents(r);
  return true;
}
function withdraw(s){
  if(s.run?.phase!=='battle')return false;
  s.run.phase='defeat';
  note(s.run,'部隊は遠征を切り上げた。');
  return true;
}
function reward(s,i){let r=s.run;if(!r||r.phase!=='reward'||!Number.isInteger(i)||i< -1||i>=r.rewards.length)return false;let a=r.rewards[i];if(a){let h=r.heroes.find(h=>h.id===a.id);h.base.push(a.card);h.temp.push(a.card);r.permanent.push({id:a.id,card:a.card});note(r,h.name+' が '+cards[a.card][0]+' を獲得')}if(r.stage>=3){r.phase='return';note(r,'遠征制覇！ 1枚を永続習得できる');return true}r.stage++;r.turn=1;r.phase='battle';r.guide=false;r.feedback=null;r.energy=6;r.enemies=foes(r.stage);r.last=null;r.chain=0;r.heroes.forEach(h=>{if(h.hp<=0)h.hp=Math.ceil(h.max*.35);else heal(h,Math.ceil(h.max*.25));h.deck=shuffle(s,h.base);h.discard=[];h.hand=[];h.exhausted=[];h.energy=2;h.used=false;h.block=0;h.fireward=0;h.boost=0;draw(s,h,3)});intents(r);return true}
function returnHome(s,i=-1){let r=s.run;if(!r||!['return','defeat'].includes(r.phase)||!Number.isInteger(i)||i< -1||i>=r.permanent.length)return false;let a=r.permanent[i];if(a){let p=s.roster.find(p=>p.id===a.id);if(p&&!p.learned.includes(a.card))p.learned.push(a.card)}let won=r.phase==='return';s.coins+=won?4:Math.max(1,r.stage-1);s.runs++;if(won)r.heroes.forEach(h=>{s.roster.find(p=>p.id===h.id).wins++});s.run=null;return true}
const count=(v,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
const known=c=>typeof c==='string'&&Object.hasOwn(cards,c);
const deck=(a,max)=>Array.isArray(a)&&a.length<=max&&a.every(known);
function valid(s){
  if(!s||s.version!==1||!count(s.rng,0xffffffff)||!count(s.next)||!count(s.coins)
    ||!count(s.runs)||!count(s.record,3)||!Array.isArray(s.roster)||s.roster.length<3
    ||s.roster.length>40||!Array.isArray(s.offers)||s.offers.length!==3)return false;
  const people=[...s.roster,...s.offers];
  const ids=new Set(people.map(p=>p?.id));
  if(ids.size!==people.length||!people.every(p=>p&&count(p.id)&&p.id>0&&p.id<s.next
    &&typeof p.name==='string'&&p.name.length<=50&&typeof p.origin==='string'
    &&count(p.role,roles.length-1)&&count(p.talent,talents.length-1)&&count(p.hp,100)&&p.hp>0
    &&count(p.potential,5)&&p.potential>=2&&count(p.wins)
    &&deck(p.deck,7)&&p.deck.length===7&&known(p.signature)&&p.deck.at(-1)===p.signature
    &&deck(p.learned,Object.keys(cards).length)))return false;
  if(!Array.isArray(s.party)||s.party.length!==3||new Set(s.party).size!==3
    ||!s.party.every(id=>s.roster.some(p=>p.id===id)))return false;
  if(s.run===null)return true;
  const r=s.run;
  if(!r||!count(r.stage,3)||r.stage<1||!count(r.turn)||r.turn<1
    ||!['battle','reward','return','defeat'].includes(r.phase)
    ||(r.mode!==undefined&&!['personal','shared'].includes(r.mode))
    ||(r.mode==='shared'&&!count(r.energy,9))
    ||!['chain','best','link'].every(key=>count(r[key]))
    ||!Array.isArray(r.log)||r.log.length>22||!r.log.every(v=>typeof v==='string')
    ||!Array.isArray(r.heroes)||r.heroes.length!==3
    ||!r.heroes.every((h,i)=>h&&h.id===s.party[i]&&typeof h.name==='string'
      &&count(h.role,roles.length-1)&&count(h.talent,talents.length-1)
      &&count(h.max,100)&&h.max>0&&count(h.hp,h.max)&&count(h.energy,3)
      &&['block','fireward','boost'].every(key=>count(h[key]))
      &&deck(h.base,10)&&h.base.length>=7&&deck(h.deck,10)&&deck(h.hand,10)&&deck(h.discard,10)
      &&deck(h.temp,3)&&(h.exhausted===undefined||deck(h.exhausted,10)))
    ||!Array.isArray(r.enemies)||r.enemies.length!==2
    ||!r.enemies.every((e,i)=>e&&e.id==='e'+i&&typeof e.name==='string'
      &&count(e.max,150)&&e.max>0&&count(e.hp,e.max)&&count(e.atk,50)
      &&['single','all'].includes(e.kind)&&['wolf','guard','spirit','dragon'].includes(e.art)
      &&['burn','break','mark','shield'].every(key=>count(e[key]))))return false;
  const loot=(a,max)=>Array.isArray(a)&&a.length<=max&&a.every(x=>x&&s.party.includes(x.id)&&known(x.card));
  if(!loot(r.permanent,3)||!loot(r.rewards,4))return false;
  return r.phase!=='battle'||(alive(r.heroes).length>0&&alive(r.enemies).length>0);
}
root.AlveinDeck={roles,cards,talents,init,recruit,scout,assign,equip,start,play,preview,
  intent,energy,targetType,affordable,unavailable,end,withdraw,reward,returnHome,valid};
})(globalThis);