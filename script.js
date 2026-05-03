// ===== GLOBAL STATE =====
const STATE = {
  name: '', avatar: '', level: 'beginner', xp: 0, gamesPlayed: 0,
  bestCombo: 0, totalScore: 0, soundOn: true, volume: 0.5,
  coins: 0,
  bestScores: {space:0,flappy:0,asteroid:0,whack:0,dino:0},
  leaderboard: [], emojiAvatar: '🎮',
  dayStreak: 0,
  dailyChallengeDay: '',
  dailyChallengeCompleted: false,
  dailyRewardClaimed: false,
  dailyGamesPlayed: 0,
  dailyCategoriesPlayed: [],
  dailyHighScoreChallenge: false,
  dailyWinStreak: 0,
  gameStats: {
    space:{plays:420,views:950},
    flappy:{plays:320,views:840},
    asteroid:{plays:280,views:760},
    whack:{plays:230,views:510},
    dino:{plays:390,views:920},
    zombie:{plays:170,views:430}
  }
};

const QUOTES = [
  "Every pixel tells a story...",
  "Loading your gaming destiny...",
  "Calibrating fun levels...",
  "Charging the turbo engines...",
  "Summoning high scores...",
  "Warming up the joystick...",
  "The moles are hiding...",
  "Asteroids incoming...",
  "Ready player one?"
];

const LEVELS_XP = [{name:'ROOKIE',min:0,max:500},{name:'PLAYER',min:500,max:2000},{name:'PRO',min:2000,max:5000},{name:'LEGEND',min:5000,max:Infinity}];
const AVATAR_STYLES = ['adventurer','adventurer-neutral','avataaars','big-ears','big-ears-neutral','bottts','croodles','fun-emoji','icons','identicon','initials','lorelei','micah','miniavs','notionists','open-peeps','personas','pixel-art','shapes'];

const GAME_LIST = [
  {id:'space',name:'SPACE SHOOTER',emoji:'🚀',category:'action',desc:'Power-ups: 🔱 Triple Shot, 💥 Big Bullet, 💣 Bomb! Press B for Bomb.',banner:'banner-space',subline:'⚡💥🔱'},
  {id:'flappy',name:'FLAPPY BIRD',emoji:'🐦',category:'arcade',desc:'Classic flappy action. Space or tap to flap.',banner:'banner-flappy',subline:'🌿🌤️💨'},
  {id:'asteroid',name:'ASTEROID DODGE',emoji:'☄️',category:'action',desc:'Dodge spinning rocks. Speed increases over time.',banner:'banner-asteroid',subline:'🌌🪐✨'},
  {id:'whack',name:'WHACK A BEAR',emoji:'🐻',category:'multiplayer',desc:'60 seconds. Click those bears before they hide!',banner:'banner-whack',subline:'🔨💥⭐'},
  {id:'dino',name:'DINO JUMP',emoji:'🦕',category:'arcade',desc:'Endless runner with double jump. Dodge cacti & pterodactyls!',banner:'banner-dino',subline:'🌵🦅💨'},
  {id:'zombie',name:'ZOMBIE SHOOTER',emoji:'🧟',category:'multiplayer',desc:'Survive the apocalypse. WASD to move, Click to shoot!',banner:'banner-zombie',subline:'🩸🔫🧟'}
];
const GAME_STATS_DEFAULTS = {
  space:{plays:420,views:950},
  flappy:{plays:320,views:840},
  asteroid:{plays:280,views:760},
  whack:{plays:230,views:510},
  dino:{plays:390,views:920},
  zombie:{plays:170,views:430}
};

// ===== AUDIO ENGINE =====
let audioCtx;
function getAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();return audioCtx;}
function playTone(freq,type='sine',dur=0.1,vol=0.3,decay=true){
  if(!STATE.soundOn)return;
  try{
    const ctx=getAudio(),o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.type=type;o.frequency.setValueAtTime(freq,ctx.currentTime);
    g.gain.setValueAtTime(vol*STATE.volume,ctx.currentTime);
    if(decay)g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
    o.start();o.stop(ctx.currentTime+dur);
  }catch(e){}
}
const SFX={
  shoot:()=>{playTone(800,'square',0.08,0.2);playTone(1200,'square',0.05,0.15)},
  hit:()=>{playTone(200,'sawtooth',0.15,0.3);playTone(150,'sawtooth',0.1,0.2)},
  point:()=>{playTone(600,'sine',0.1,0.2);setTimeout(()=>playTone(900,'sine',0.08,0.15),80)},
  levelUp:()=>{[400,500,600,800].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.2,0.3),i*100))},
  die:()=>{[400,300,200,100].forEach((f,i)=>setTimeout(()=>playTone(f,'sawtooth',0.15,0.4),i*80))},
  flap:()=>{playTone(300,'sine',0.06,0.15)},
  whack:()=>{playTone(500,'square',0.1,0.3);playTone(300,'square',0.08,0.2)},
  powerup:()=>{[300,400,500,700,1000].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.15,0.3),i*60))},
  click:()=>{playTone(800,'sine',0.05,0.1)},
  select:()=>{playTone(600,'sine',0.08,0.1);setTimeout(()=>playTone(900,'sine',0.06,0.08),60)},
  success:()=>{playTone(523.25,'sine',0.2,0.2);setTimeout(()=>playTone(659.25,'sine',0.2,0.2),100);setTimeout(()=>playTone(783.99,'sine',0.3,0.25),200)},
  notification:()=>{playTone(440,'sine',0.1,0.15);setTimeout(()=>playTone(494,'sine',0.1,0.15),80)},
  hover:()=>{playTone(700,'sine',0.05,0.08)}
};

let bgMusicNodes=null;
function playBackgroundTone(freq,dur=0.18,vol=0.06){
  if(!STATE.soundOn) return;
  const ctx=getAudio();
  const o=ctx.createOscillator();
  const g=ctx.createGain();
  o.connect(g);g.connect(ctx.destination);
  o.type='triangle';o.frequency.setValueAtTime(freq,ctx.currentTime);
  g.gain.setValueAtTime(vol*STATE.volume,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
  o.start();o.stop(ctx.currentTime+dur);
}
function startBackgroundMusic(){
  if(bgMusicNodes||!STATE.soundOn) return;
  const ctx=getAudio();
  if(ctx.state==='suspended'){ctx.resume();}
  const masterGain=ctx.createGain();
  masterGain.gain.value=0.03*STATE.volume;
  masterGain.connect(ctx.destination);

  const bass=ctx.createOscillator();
  bass.type='sine';
  bass.frequency.value=55;
  const bassGain=ctx.createGain();
  bassGain.gain.value=0.02*STATE.volume;
  bass.connect(bassGain);
  bassGain.connect(masterGain);

  const pad=ctx.createOscillator();
  pad.type='triangle';
  pad.frequency.value=220;
  const padGain=ctx.createGain();
  padGain.gain.value=0.01*STATE.volume;
  padGain.gain.setValueAtTime(0.01*STATE.volume,ctx.currentTime);
  padGain.gain.linearRampToValueAtTime(0.02*STATE.volume,ctx.currentTime+2);
  pad.connect(padGain);

  const filter=ctx.createBiquadFilter();
  filter.type='lowpass';
  filter.frequency.value=800;
  padGain.connect(filter);
  filter.connect(masterGain);

  bass.start();
  pad.start();

  const notes=[220,246.94,196,174.61];
  let noteIndex=0;
  const melodyInterval=setInterval(()=>{
    if(!STATE.soundOn) return;
    const freq=notes[noteIndex%notes.length];
    playBackgroundTone(freq,0.5,0.035);
    noteIndex++;
  },1400);

  bgMusicNodes={ctx,bass,pad,masterGain,melodyInterval};
}
function stopBackgroundMusic(){
  if(!bgMusicNodes) return;
  if(bgMusicNodes.bass) bgMusicNodes.bass.stop();
  if(bgMusicNodes.pad) bgMusicNodes.pad.stop();
  clearInterval(bgMusicNodes.melodyInterval);
  bgMusicNodes=null;
}
function updateBackgroundMusic(){
  if(STATE.soundOn) startBackgroundMusic(); else stopBackgroundMusic();
}

document.body.addEventListener('click',()=>{ if(STATE.soundOn) startBackgroundMusic(); },{once:true});

// ===== PARTICLE BACKGROUND =====
const pbCanvas=document.getElementById('particle-bg');
const pbCtx=pbCanvas.getContext('2d');
let particles=[],mouse={x:0,y:0};
function resizeParticles(){pbCanvas.width=window.innerWidth;pbCanvas.height=window.innerHeight}
function initParticles(){
  particles=[];
  const n=Math.min(80,Math.floor(window.innerWidth*window.innerHeight/12000));
  for(let i=0;i<n;i++)particles.push({
    x:Math.random()*pbCanvas.width,y:Math.random()*pbCanvas.height,
    vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,
    r:Math.random()*2+1,alpha:Math.random()*.5+.1
  });
}
function drawParticles(){
  pbCtx.clearRect(0,0,pbCanvas.width,pbCanvas.height);
  particles.forEach(p=>{
    const dx=p.x-mouse.x,dy=p.y-mouse.y,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<100){p.vx+=dx/dist*.05;p.vy+=dy/dist*.05}
    p.vx*=.99;p.vy*=.99;
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0||p.x>pbCanvas.width)p.vx*=-1;
    if(p.y<0||p.y>pbCanvas.height)p.vy*=-1;
    pbCtx.beginPath();pbCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
    pbCtx.fillStyle=`rgba(124,58,237,${p.alpha})`;pbCtx.fill();
  });
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<120){
        pbCtx.beginPath();pbCtx.moveTo(particles[i].x,particles[i].y);
        pbCtx.lineTo(particles[j].x,particles[j].y);
        pbCtx.strokeStyle=`rgba(124,58,237,${.15*(1-d/120)})`;
        pbCtx.lineWidth=.5;pbCtx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
window.addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY});
resizeParticles();initParticles();drawParticles();
window.addEventListener('resize',()=>{resizeParticles();initParticles()});

// ===== ENGAGEMENT & NOTIFICATIONS =====
function getDailyChallengeIndex(){
  return Math.floor(Date.now()/(1000*60*60*24))%4;
}
function getDailyChallenge(){
  const challenges=['Play 3 games','Score 1000+ points','Try all categories','Win 2 games in a row'];
  return challenges[getDailyChallengeIndex()];
}
function getDailyChallengeReward(){
  const rewards=[150,180,160,200];
  return rewards[getDailyChallengeIndex()];
}
function checkDailyReward(){
  const lastDaily=localStorage.getItem('last_daily_reward');
  const today=new Date().toDateString();
  if(lastDaily!==today){localStorage.setItem('last_daily_reward',today);return true;}
  return false;
}
function checkReturnVisit(){
  const lastVisit=localStorage.getItem('last_hub_visit');
  const today=new Date().toDateString();
  if(lastVisit&&lastVisit!==today){
    const lastDate=new Date(lastVisit);
    const daysDiff=Math.floor((new Date()-lastDate)/(1000*60*60*24));
    if(daysDiff===1){STATE.dayStreak=(STATE.dayStreak||0)+1;showEngagementNotification('Welcome back! You\'re on a streak 🔥','🏆');}
    else if(daysDiff>1){STATE.dayStreak=1;showEngagementNotification('Welcome back after '+daysDiff+' days!','👋');}
    localStorage.setItem('last_hub_visit',today);
    saveState();
  }
  else if(!lastVisit){
    STATE.dayStreak=1;localStorage.setItem('last_hub_visit',today);saveState();
  }
}
function completeDailyChallenge(reason){
  if(STATE.dailyChallengeCompleted) return;
  STATE.dailyChallengeCompleted=true;
  saveState();
  showEngagementNotification('Daily challenge complete! '+reason,'✅');
  updateDailyChallengeUI();
}
function claimDailyChallengeReward(){
  if(STATE.dailyRewardClaimed) return;
  STATE.dailyRewardClaimed=true;
  STATE.dailyChallengeCompleted=true;
  const reward = getDailyChallengeReward();
  const coinReward = 30 + Math.floor(reward * 0.2);
  STATE.coins = (STATE.coins||0) + coinReward;
  addXp(reward);
  saveState();
  showEngagementNotification('Claimed reward: +'+reward+' XP +'+coinReward+' coins','🎁');
  spawnConfetti();
  updateDailyChallengeUI();
}
function refreshDailyChallengeProgress(){
  const challenge=getDailyChallenge();
  if(STATE.dailyChallengeCompleted) return;
  if(challenge==='Play 3 games'&&STATE.dailyGamesPlayed>=3) return completeDailyChallenge('Played 3 games');
  if(challenge==='Try all categories'&&new Set(STATE.dailyCategoriesPlayed||[]).size>=3) return completeDailyChallenge('Tried all categories');
  if(challenge==='Score 1000+ points'&&STATE.dailyHighScoreChallenge) return completeDailyChallenge('Scored 1000+ points');
  if(challenge==='Win 2 games in a row'&&STATE.dailyWinStreak>=2) return completeDailyChallenge('Won two games in a row');
}
function updateDailyChallengeUI(){
  const amount=getDailyChallengeReward();
  const status=document.getElementById('challengeStatus');
  const completeBtn=document.getElementById('completeChallengeBtn');
  const claimBtn=document.getElementById('claimRewardBtn');
  const bonusLabel=document.getElementById('dailyBonus');
  const coinLabel=document.getElementById('coinBalance');
  if(!status||!completeBtn||!claimBtn||!bonusLabel||!coinLabel) return;
  bonusLabel.textContent='+'+amount+' XP';
  coinLabel.textContent=(STATE.coins||0)+' coins';
  document.getElementById('dailyStreak').textContent=STATE.dayStreak||1;
  if(STATE.dailyRewardClaimed){
    status.textContent='STATUS: Reward claimed';
    status.style.background='rgba(16,185,129,0.18)';
    completeBtn.classList.add('hidden');
    claimBtn.classList.add('hidden');
  } else {
    status.textContent=STATE.dailyChallengeCompleted ? 'STATUS: Complete — claim now' : 'STATUS: Claim coins now';
    status.style.background='rgba(59,130,246,0.15)';
    completeBtn.classList.add('hidden');
    claimBtn.classList.remove('hidden');
  }
  document.getElementById('dailyChallenge').textContent=getDailyChallenge()+' — reward '+amount+' XP!';
}
function resetDailyChallengeIfNeeded(){
  const today=new Date().toDateString();
  if(STATE.dailyChallengeDay!==today){
    STATE.dailyChallengeDay=today;
    STATE.dailyChallengeCompleted=false;
    STATE.dailyRewardClaimed=false;
    STATE.dailyGamesPlayed=0;
    STATE.dailyCategoriesPlayed=[];
    STATE.dailyHighScoreChallenge=false;
    STATE.dailyWinStreak=0;
    saveState();
  }
}
function showEngagementNotification(msg,icon='✨'){
  const div=document.createElement('div');
  div.style.cssText='position:fixed;top:80px;right:20px;background:rgba(124,58,237,0.9);color:#fff;padding:1rem 1.5rem;border-radius:12px;z-index:1000;animation:slideIn 0.4s ease;font-family:Orbitron,sans-serif;font-size:0.9rem;border:1px solid rgba(255,255,255,0.2);box-shadow:0 0 20px rgba(124,58,237,0.6)';
  div.textContent=`${icon} ${msg}`;
  document.body.appendChild(div);
  SFX.notification();
  setTimeout(()=>div.remove(),3000);
}
function spawnConfetti(){
  const colors=['#7C3AED','#22D3EE','#F59E0B','#EC4899','#10B981'];
  for(let i=0;i<30;i++){
    const piece=document.createElement('div');
    piece.className='confetti-piece';
    piece.style.left=Math.random()*window.innerWidth+'px';
    piece.style.backgroundColor=colors[Math.floor(Math.random()*colors.length)];
    piece.style.animationDuration=(2+Math.random()*1)+'s';
    piece.style.animationDelay=Math.random()*0.5+'s';
    document.body.appendChild(piece);
    setTimeout(()=>piece.remove(),3000);
  }
}

// ===== LOADING =====
function runLoading(){
  const bar=document.getElementById('loadBar'),pct=document.getElementById('loadPct'),quote=document.getElementById('loadQuote');
  let p=0,qi=0;
  const interval=setInterval(()=>{
    p+=Math.random()*4+1;if(p>100)p=100;
    bar.style.width=p+'%';pct.textContent=Math.floor(p)+'%';

    //Refactored loading completion logic to conditionally navigate users based on state

    if(p>=100){
  clearInterval(interval);
  setTimeout(()=>{
    if(STATE.name){
      loadHub();
      showScreen('hub-screen');
    } else {
      showScreen('name-screen');
    }
  },400);
}
},60);
  
  setInterval(()=>{
    quote.style.opacity='0';
    setTimeout(()=>{quote.textContent=QUOTES[qi++%QUOTES.length];quote.style.opacity='1'},400);
  },1800);
}

// ===== SCREEN MANAGEMENT =====
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ===== AVATAR PICKER =====
let currentStyle=AVATAR_STYLES[6],selectedSeed='seed1',avatarOpen=false;
function buildAvatarStyles(){
  const tabs=document.getElementById('styleTabs');
  AVATAR_STYLES.forEach((s,i)=>{
    const t=document.createElement('div');
    t.className='style-tab'+(i===6?' active':'');
    t.textContent=s;t.dataset.style=s;
    t.onclick=()=>{
      currentStyle=s;document.querySelectorAll('.style-tab').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');loadAvatars();SFX.click();
    };tabs.appendChild(t);
  });
}
function dicebearUrl(style,seed){return`https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=transparent`}
function loadAvatars(){
  const grid=document.getElementById('avatarGrid');grid.innerHTML='';
  for(let i=0;i<18;i++){
    const seed='user'+i,url=dicebearUrl(currentStyle,seed);
    const item=document.createElement('div');item.className='avatar-item'+(seed===selectedSeed?' selected':'');
    const img=document.createElement('img');img.src=url;img.alt='avatar';img.loading='lazy';
    item.appendChild(img);
    item.onclick=()=>{
      selectedSeed=seed;currentAvatarUrl=url;
      document.querySelectorAll('.avatar-item').forEach(x=>x.classList.remove('selected'));
      item.classList.add('selected');
      document.getElementById('selectedAvatarImg').src=url;
      SFX.select();
      setTimeout(()=>{avatarSection.classList.remove('open');avatarOpen=false;document.getElementById('avatarToggleArrow').textContent='▼';document.getElementById('avatarToggleText').textContent='Change avatar'},600);
    };
    grid.appendChild(item);
  }
}
let currentAvatarUrl='';
const avatarSection=document.getElementById('avatarSection');
document.getElementById('avatarToggle').onclick=()=>{
  avatarOpen=!avatarOpen;
  avatarSection.classList.toggle('open',avatarOpen);
  document.getElementById('avatarToggleArrow').textContent=avatarOpen?'▲':'▼';
  document.getElementById('avatarToggleText').textContent=avatarOpen?'Close':'Choose avatar';
  if(avatarOpen&&!document.getElementById('avatarGrid').children.length)loadAvatars();
  SFX.click();
};
buildAvatarStyles();
currentAvatarUrl=dicebearUrl(currentStyle,'user0');
document.getElementById('selectedAvatarImg').src=currentAvatarUrl;

// Name submit
document.getElementById('nameSubmitBtn').onclick=()=>{
  const n=document.getElementById('nameInput').value.trim();
  if(!n){document.getElementById('nameInput').style.borderColor='var(--red)';return}
  STATE.name=n;STATE.avatar=currentAvatarUrl||dicebearUrl('fun-emoji','user0');

  //Add  saveState() to persist temporary UI state
  saveState();

  SFX.select();showScreen('level-screen');
};
document.getElementById('nameInput').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('nameSubmitBtn').click()});

// ===== LEVEL SELECT =====
document.querySelectorAll('.level-card').forEach(card=>{
  card.onclick=()=>{
    STATE.level=card.dataset.level;
    SFX.levelUp();
    document.querySelectorAll('.level-card').forEach(c=>c.classList.remove('selected'));
    card.classList.add('selected');
    //Add  saveState() to persist temporary UI state
    saveState();
    setTimeout(()=>{loadHub();showScreen('hub-screen')},400);
  };
});

// ===== SAVE/LOAD =====
function saveState(){localStorage.setItem('hw_state',JSON.stringify(STATE))}
function ensureGameStats(){
  STATE.gameStats = STATE.gameStats || {};
  Object.keys(GAME_STATS_DEFAULTS).forEach(id=>{
    if(!STATE.gameStats[id]) STATE.gameStats[id] = {...GAME_STATS_DEFAULTS[id]};
  });
}
function loadState(){
  const s=localStorage.getItem('hw_state');
  if(s){const d=JSON.parse(s);Object.assign(STATE,d)}
  ensureGameStats();
}
loadState();
let currentGameFilter = 'all';
let currentGameSearch = '';

function getGameData(){
  return GAME_LIST.map(game=>{
    const stats = STATE.gameStats[game.id] || {plays:0,views:0};
    const engagement = stats.plays * 1.2 + stats.views;
    return {...game,plays:stats.plays,views:stats.views,engagement};
  });
}
function renderGameCard(game, index=0){
  return `
    <div class="game-card" data-game="${game.id}" data-category="${game.category}" style="animation:slideIn 0.5s ease-out ${index*0.05}s forwards;opacity:0">
      <div class="game-banner ${game.banner}">${game.emoji}<span style="position:absolute;font-size:1rem;bottom:8px;left:10px;opacity:.5">${game.subline}</span></div>
      <div class="game-card-info">
        <div class="game-name">${game.name}</div>
        <div class="game-desc">${game.desc}</div>
        <div class="game-meta" style="font-size:.82rem;color:var(--text2);margin:0.6rem 0;">Plays: ${game.plays} · Views: ${game.views}</div>
        <div class="game-best">BEST: <span class="best-score" data-game="${game.id}">${STATE.bestScores[game.id]||0}</span></div>
      </div>
      <button class="play-btn">▶ Play Now</button>
    </div>
  `;
}
function filterGames(games){
  return games.filter(game=>{
    const matchCategory = currentGameFilter==='all' || game.category===currentGameFilter;
    const query = currentGameSearch.trim().toLowerCase();
    if(!matchCategory) return false;
    if(!query) return true;
    return game.name.toLowerCase().includes(query) || game.desc.toLowerCase().includes(query) || game.category.toLowerCase().includes(query);
  });
}
function renderGameSections(){
  const games = filterGames(getGameData());
  const popular = games.slice().sort((a,b)=>b.plays-a.plays||b.engagement-a.engagement).slice(0,3);
  const trending = games.slice().sort((a,b)=>b.views-a.views||b.engagement-a.engagement).slice(0,3);
  const allGames = games.slice().sort((a,b)=>b.engagement-a.engagement);
  document.getElementById('popularGames').innerHTML = popular.map((g,i)=>renderGameCard(g,i)).join('') || '';
  document.getElementById('trendingGames').innerHTML = trending.map((g,i)=>renderGameCard(g,i)).join('') || '';
  document.getElementById('allGamesGrid').innerHTML = allGames.map((g,i)=>renderGameCard(g,i)).join('') || '';
}

function setGameFilter(filter){
  currentGameFilter = filter;
  document.querySelectorAll('#filterPills .filter-btn').forEach(btn=>btn.classList.toggle('active', btn.dataset.filter===filter));
  renderGameSections();
}
function setSearchQuery(value){
  currentGameSearch = value;
  renderGameSections();
}

function initGameSearchAndFilters(){
  const searchInput = document.getElementById('gameSearch');
  const filterContainer = document.getElementById('filterPills');
  if(searchInput){
    searchInput.addEventListener('input', e=>{setSearchQuery(e.target.value)});
  }
  if(filterContainer){
    filterContainer.addEventListener('click', e=>{
      const btn = e.target.closest('.filter-btn');
      if(!btn) return;
      setGameFilter(btn.dataset.filter || 'all');
    });
  }
}
initGameSearchAndFilters();

// ===== HUB =====
function getRank(){return LEVELS_XP.find(l=>STATE.xp>=l.min&&STATE.xp<l.max)||LEVELS_XP[0]}
function getRankClass(name){return{ROOKIE:'rank-rookie',PLAYER:'rank-player',PRO:'rank-pro',LEGEND:'rank-legend'}[name]}
function loadHub(){
  resetDailyChallengeIfNeeded();
  document.getElementById('navName').textContent=STATE.name;
  document.getElementById('navBest').textContent=Math.max(...Object.values(STATE.bestScores),0);
  document.getElementById('hubAvatar').src=STATE.avatar;
  updateBackgroundMusic();
  checkReturnVisit();
  if(checkDailyReward()){showEngagementNotification('Daily Reward Unlocked! Play to earn XP','🎁');}
  refreshDailyChallengeProgress();
  updateDailyChallengeUI();
  document.getElementById('heroName').textContent=STATE.name;
  const rank=getRank();
  const badge=document.getElementById('rankBadge');
  badge.textContent=rank.name;badge.className='rank-badge '+getRankClass(rank.name);
  const nextRank=LEVELS_XP[LEVELS_XP.indexOf(rank)+1];
  const pct=nextRank?Math.min(100,Math.round((STATE.xp-rank.min)/(rank.max-rank.min)*100)):100;
  document.getElementById('xpBar').style.width=pct+'%';
  document.getElementById('xpLabel').textContent=STATE.xp+' XP total';
  document.getElementById('rankXp').textContent=STATE.xp+' / '+(rank.max===Infinity?'∞':rank.max)+' XP';
  document.getElementById('xpNext').textContent=nextRank?(rank.max-STATE.xp)+' XP to '+nextRank.name:'MAX RANK 🏆';
  document.getElementById('statGames').textContent=STATE.gamesPlayed;
  document.getElementById('statCombo').textContent=STATE.bestCombo+'x';
  document.getElementById('dailyStreak').textContent=STATE.dayStreak||1;
  document.getElementById('totalScore').textContent=STATE.totalScore;
  document.getElementById('totalGames').textContent=STATE.gamesPlayed;
  document.getElementById('bestCombo').textContent=STATE.bestCombo+'x';
  document.getElementById('totalXp').textContent=STATE.xp;
  renderGameSections();
  document.querySelectorAll('.best-score').forEach(el=>{el.textContent=STATE.bestScores[el.dataset.game]||0});
  renderLeaderboard();
  document.getElementById('settingsName').value=STATE.name;
  document.getElementById('soundToggle').classList.toggle('on',STATE.soundOn);
  document.getElementById('soundToggleNav').textContent=STATE.soundOn?'🔊':'🔇';
  document.getElementById('volumeSlider').value=STATE.volume;
}
function renderLeaderboard(){
  const list=document.getElementById('leaderboardList');list.innerHTML='';
  const top=STATE.leaderboard.slice(0,5);
  if(!top.length){list.innerHTML='<div style="color:var(--text2);font-size:.8rem;text-align:center;padding:1rem">No scores yet. Play some games!</div>';return}
  top.forEach((e,i)=>{
    const div=document.createElement('div');div.className='lb-entry';
    const rankClass=i===0?'gold':i===1?'silver':i===2?'bronze':'';
    div.innerHTML=`<div class="lb-rank ${rankClass}">${i===0?'👑':i+1}</div><div class="lb-name">${e.game} — ${e.name}</div><div class="lb-score">${e.score}</div>`;
    list.appendChild(div);
  });
}
function addToLeaderboard(game,score){
  STATE.leaderboard.push({game,name:STATE.name,score,date:Date.now()});
  STATE.leaderboard.sort((a,b)=>b.score-a.score);
  STATE.leaderboard=STATE.leaderboard.slice(0,20);
  if(score>STATE.bestScores[game])STATE.bestScores[game]=score;
  saveState();
}
function addXp(amount){
  const prev=getRank();
  STATE.xp+=amount;saveState();
  const curr=getRank();
  if(curr.name!==prev.name){SFX.success();showFloatingText(gameCanvasWrap,'🎉 RANK UP: '+curr.name+'!',true);showEngagementNotification('New Rank: '+curr.name,'🏆');}
  else if(amount>50){showEngagementNotification('+'+amount+' XP Earned!','⭐');}
}

// ===== SETTINGS =====
document.getElementById('settingsBtn').onclick=()=>{
  document.getElementById('settingsOverlay').classList.remove('hidden');
  const emojis=['🎮','⚡','🔥','💀','🚀','🌟','👾','🎯'];
  const ep=document.getElementById('emojiPick');ep.innerHTML='';
  emojis.forEach(e=>{
    const b=document.createElement('button');b.className='emoji-btn'+(STATE.emojiAvatar===e?' active':'');
    b.textContent=e;b.onclick=()=>{STATE.emojiAvatar=e;document.querySelectorAll('.emoji-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');saveState();SFX.click()};
    ep.appendChild(b);
  });
  SFX.click();
};
document.getElementById('closeSettings').onclick=()=>{document.getElementById('settingsOverlay').classList.add('hidden')};
document.getElementById('soundToggle').onclick=function(){
  STATE.soundOn=!STATE.soundOn;this.classList.toggle('on',STATE.soundOn);
  document.getElementById('soundToggleNav').textContent=STATE.soundOn?'🔊':'🔇';
  updateBackgroundMusic();
  saveState();
  if(STATE.soundOn){SFX.success();showEngagementNotification('Sound Enabled','🔊');}
  else{showEngagementNotification('Sound Disabled','🔇');}
};
document.getElementById('soundToggleNav').onclick=()=>document.getElementById('soundToggle').click();
document.getElementById('volumeSlider').oninput=function(){
  STATE.volume=+this.value;
  saveState();
  if(bgMusicNodes&&bgMusicNodes.masterGain){
    bgMusicNodes.masterGain.gain.value=0.05*STATE.volume;
  }
};
document.getElementById('completeChallengeBtn').onclick=()=>completeDailyChallenge('Manually marked complete');
document.getElementById('claimRewardBtn').onclick=()=>claimDailyChallengeReward();
document.getElementById('saveName').onclick=()=>{
  const n=document.getElementById('settingsName').value.trim();
  if(n){STATE.name=n;saveState();loadHub();SFX.select()}
};
document.getElementById('resetScores').onclick=()=>{
  if(confirm('Reset all scores and XP? This cannot be undone.')){
    STATE.xp=0;STATE.gamesPlayed=0;STATE.bestCombo=0;STATE.totalScore=0;
    STATE.bestScores={space:0,flappy:0,asteroid:0,whack:0,dino:0};STATE.leaderboard=[];
    saveState();loadHub();SFX.hit();
  }
};

// ===== GAME LAUNCH =====
document.getElementById('gamesGrid').addEventListener('click',e=>{
  const card=e.target.closest('.game-card');
  if(!card||card.classList.contains('locked'))return;
  const game=card.dataset.game;SFX.select();
  launchGame(game);
});
document.getElementById('gamesGrid').addEventListener('mouseover',e=>{
  const card=e.target.closest('.game-card');
  if(card&&!card.classList.contains('locked')){SFX.hover();}
});
document.getElementById('backToHub').onclick=()=>{stopGame();showMobileControls('');showScreen('hub-screen');loadHub()};
document.getElementById('pauseBtn').onclick=togglePause;
document.getElementById('resumeBtn').onclick=togglePause;
document.getElementById('restartBtn').onclick=()=>{togglePause();setTimeout(()=>launchGame(currentGame),100)};
document.getElementById('quitBtn').onclick=()=>{stopGame();showMobileControls('');showScreen('hub-screen');loadHub()};
document.getElementById('playAgainBtn').onclick=()=>{document.getElementById('gameOverOverlay').classList.add('hidden');launchGame(currentGame)};
document.getElementById('goHubBtn').onclick=()=>{stopGame();showMobileControls('');showScreen('hub-screen');loadHub()};

// ===== GAME SPINNER =====
const SPINNER_GAMES = [
  { id: 'space', name: 'SPACE SHOOTER', emoji: '🚀', color: '#7C3AED' },
  { id: 'flappy', name: 'FLAPPY BIRD', emoji: '🐦', color: '#22D3EE' },
  { id: 'asteroid', name: 'ASTEROID DODGE', emoji: '☄️', color: '#A855F7' },
  { id: 'whack', name: 'WHACK-A-MOLE', emoji: '🐻', color: '#10B981' },
  { id: 'dino', name: 'DINO JUMP', emoji: '🦕', color: '#F59E0B' },
  { id: 'zombie', name: 'ZOMBIE SHOOTER', emoji: '🧟', color: '#EF4444' }
];

let selectedSpinnerGame = null;
let isSpinning = false;

function openSpinner() {
  document.getElementById('spinnerOverlay').classList.remove('hidden');
  // Reset canvas rotation
  const canvas = document.getElementById('spinnerCanvas');
  canvas.style.transition = 'none';
  canvas.style.transform = 'rotate(0rad)';
  initSpinnerCanvas();
  // Automatically start spinning when opened
  setTimeout(() => {
    spinWheelJS();
  }, 500); // Small delay to show the wheel first
  SFX.click();
}

function closeSpinner() {
  document.getElementById('spinnerOverlay').classList.add('hidden');
}

function initSpinnerCanvas() {
  const canvas = document.getElementById('spinnerCanvas');
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 175;
  const segments = SPINNER_GAMES.length;
  const anglePerSegment = (2 * Math.PI) / segments;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  SPINNER_GAMES.forEach((game, i) => {
    const startAngle = i * anglePerSegment - Math.PI / 2;
    const endAngle = startAngle + anglePerSegment;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = game.color;
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + anglePerSegment / 2);

    // Draw emoji
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(game.emoji, radius - 12, 0);

    ctx.restore();

    // Draw game name radially
    const midAngle = startAngle + anglePerSegment / 2;
    const nameRadius = radius - 50;
    const nameX = cx + Math.cos(midAngle) * nameRadius;
    const nameY = cy + Math.sin(midAngle) * nameRadius;

    ctx.save();
    ctx.translate(nameX, nameY);
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 4;
    ctx.font = 'bold 11px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText(game.name, 0, 0);
    ctx.fillText(game.name, 0, 0);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
  ctx.fillStyle = '#07070F';
  ctx.fill();
  ctx.strokeStyle = '#7C3AED';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('❓', cx, cy);
}

function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;

  const canvas = document.getElementById('spinnerCanvas');
  const segments = SPINNER_GAMES.length;
  const anglePerSegment = 2 * Math.PI / segments;
  const fullRotations = 5 + Math.random() * 3;
  const selectedIndex = Math.floor(Math.random() * segments);
  const targetAngle = fullRotations * 2 * Math.PI + selectedIndex * anglePerSegment;

  // Reset canvas rotation
  canvas.style.transition = 'none';
  canvas.style.transform = 'rotate(0rad)';

  // Force reflow
  canvas.offsetHeight;

  // Start spinning animation
  requestAnimationFrame(() => {
    canvas.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)';
    canvas.style.transform = `rotate(${targetAngle}rad)`;
  });

  SFX.select();

  setTimeout(() => {
    selectedSpinnerGame = SPINNER_GAMES[selectedIndex];
    isSpinning = false;
    showSpinnerResult();
  }, 4200);
}

// Alternative spinning function using JavaScript animation
function spinWheelJS() {
  if (isSpinning) return;
  isSpinning = true;

  const canvas = document.getElementById('spinnerCanvas');
  if (!canvas) {
    console.error('Spinner canvas not found');
    isSpinning = false;
    return;
  }

  // For testing: simple 360 degree rotation
  const targetAngle = 2 * Math.PI; // One full rotation

  // Reset canvas rotation
  canvas.style.transition = 'none';
  canvas.style.transform = 'rotate(0rad)';
  canvas.style.transformOrigin = 'center center';

  let currentAngle = 0;
  const startTime = performance.now();
  const duration = 2000; // 2 seconds for testing

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Linear interpolation for testing
    currentAngle = targetAngle * progress;
    
    canvas.style.transform = `rotate(${currentAngle}rad)`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // For testing, just reset after one rotation
      setTimeout(() => {
        canvas.style.transform = 'rotate(0rad)';
        isSpinning = false;
      }, 500);
    }
  }

  requestAnimationFrame(animate);
}

function showSpinnerResult() {
  const overlay = document.getElementById('spinnerResultOverlay');
  document.getElementById('spinnerResultEmoji').textContent = selectedSpinnerGame.emoji;
  document.getElementById('spinnerResultTitle').textContent = selectedSpinnerGame.name;
  document.getElementById('spinnerResultDesc').textContent = 'Feeling lucky? Let\'s go!';

  document.getElementById('spinnerOverlay').classList.add('hidden');
  overlay.classList.remove('hidden');

  spawnConfetti();
  SFX.levelUp();
}

function hideSpinnerResult() {
  document.getElementById('spinnerResultOverlay').classList.add('hidden');
  selectedSpinnerGame = null;
}

let currentGame='',gamePaused=false,gameRunning=false,gameLoop=null;
const gameCanvasWrap=document.getElementById('gameCanvasWrap');
const gameCanvas=document.getElementById('gameCanvas');
const gCtx=gameCanvas.getContext('2d');

function resizeCanvas(){
  gameCanvas.width=gameCanvasWrap.clientWidth;
  gameCanvas.height=gameCanvasWrap.clientHeight;
}
function stopGame(){gameRunning=false;gamePaused=false;if(gameLoop)cancelAnimationFrame(gameLoop);gameLoop=null;clearGame()}
function togglePause(){
  gamePaused=!gamePaused;
  document.getElementById('pauseOverlay').classList.toggle('hidden',!gamePaused);
  document.getElementById('pauseBtn').textContent=gamePaused?'▶':'⏸';
}
function launchGame(game){
  currentGame=game;stopGame();
  document.getElementById('hudGameName').textContent={space:'SPACE SHOOTER',flappy:'FLAPPY BIRD',asteroid:'ASTEROID DODGE',whack:'WHACK-A-MOLE',dino:'DINO JUMP'}[game];
  document.getElementById('pauseOverlay').classList.add('hidden');
  document.getElementById('gameOverOverlay').classList.add('hidden');
  document.getElementById('spaceTutorial').classList.add('hidden');
  resizeCanvas();showScreen('game-screen');
  showMobileControls(game);

  // Space Shooter: show tutorial on desktop before starting
  if(game==='space'&&!('ontouchstart' in window)){
    document.getElementById('spaceTutorial').classList.remove('hidden');
    return; // game starts after Continue click
  }

  gameRunning=true;
  STATE.gamesPlayed++;
  STATE.gameStats[currentGame] = STATE.gameStats[currentGame] || {plays:0,views:0};
  STATE.gameStats[currentGame].views = (STATE.gameStats[currentGame].views||0) + 1;
  const gameData = GAME_LIST.find(g=>g.id===game);
  if(gameData){
    STATE.dailyGamesPlayed = (STATE.dailyGamesPlayed||0)+1;
    STATE.dailyCategoriesPlayed = STATE.dailyCategoriesPlayed||[];
    if(!STATE.dailyCategoriesPlayed.includes(gameData.category)) STATE.dailyCategoriesPlayed.push(gameData.category);
  }
  refreshDailyChallengeProgress();
  saveState();
  GAMES[game]?.start();
}

// Space tutorial continue button
document.getElementById('spaceTutorialBtn').onclick=()=>{
  document.getElementById('spaceTutorial').classList.add('hidden');
  gameRunning=true;
  STATE.gamesPlayed++;saveState();
  GAMES.space?.start();
};

// ===== UTILITY =====
function showFloatingText(parent,text,big=false){
  const el=document.createElement('div');el.className='float-popup';el.textContent=text;
  el.style.cssText=`left:${Math.random()*60+20}%;top:${Math.random()*40+30}%;font-size:${big?'1.5rem':'1rem'}`;
  parent.appendChild(el);setTimeout(()=>el.remove(),900);
}
function screenShake(){
  gameCanvasWrap.classList.remove('shaking');
  void gameCanvasWrap.offsetWidth;
  gameCanvasWrap.classList.add('shaking');
  setTimeout(()=>gameCanvasWrap.classList.remove('shaking'),250);
}
function spawnConfetti(){
  for(let i=0;i<60;i++){
    const c=document.createElement('div');c.className='confetti-piece';
    const colors=['#7C3AED','#22D3EE','#EC4899','#F59E0B','#10B981'];
    c.style.cssText=`left:${Math.random()*100}vw;top:-10px;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${Math.random()*2+1.5}s;animation-delay:${Math.random()*.5}s`;
    document.body.appendChild(c);setTimeout(()=>c.remove(),3000);
  }
}
function endGame(score,gameName){
  gameRunning=false;
  const isHighScore=score>STATE.bestScores[currentGame];
  addToLeaderboard(gameName,score);
  STATE.gameStats[currentGame] = STATE.gameStats[currentGame] || {plays:0,views:0};
  STATE.gameStats[currentGame].plays = (STATE.gameStats[currentGame].plays||0) + 1;
  const xpGained=Math.floor(score/2)+STATE.gamesPlayed*5;
  addXp(xpGained);
  STATE.totalScore+=score;
  STATE.dailyHighScoreChallenge = STATE.dailyHighScoreChallenge || score>=1000;
  STATE.dailyWinStreak = score>0 ? (STATE.dailyWinStreak||0)+1 : 0;
  refreshDailyChallengeProgress();
  saveState();
  const overlay=document.getElementById('gameOverOverlay');
  document.getElementById('gameOverTitle').textContent=isHighScore?'🏆 NEW HIGH SCORE!':'GAME OVER';
  document.getElementById('gameOverScore').textContent='Score: '+score;
  document.getElementById('gameOverExtra').innerHTML=`+${xpGained} XP earned<br>Best: ${STATE.bestScores[currentGame]}`;
  overlay.classList.remove('hidden');
  if(isHighScore)spawnConfetti();
  SFX.die();
}

// ===== KEYS =====
const keys={};
document.addEventListener('keydown',e=>{keys[e.key]=true;if(e.key===' ')e.preventDefault()});
document.addEventListener('keyup',e=>{keys[e.key]=false});
// D-Pad buttons (asteroid)
document.querySelectorAll('.dpad-btn').forEach(btn=>{
  const dir=btn.dataset.dir;if(!dir)return;
  btn.addEventListener('touchstart',e=>{e.preventDefault();keys['Arrow'+dir.charAt(0).toUpperCase()+dir.slice(1)]=true;btn.classList.add('pressed')},{passive:false});
  btn.addEventListener('touchend',e=>{e.preventDefault();keys['Arrow'+dir.charAt(0).toUpperCase()+dir.slice(1)]=false;btn.classList.remove('pressed')},{passive:false});
});

// Space Shooter mobile: left/right buttons
['spaceLeft','spaceRight'].forEach(id=>{
  const btn=document.getElementById(id);if(!btn)return;
  const dir=btn.dataset.dir;
  btn.addEventListener('touchstart',e=>{e.preventDefault();keys['Arrow'+dir.charAt(0).toUpperCase()+dir.slice(1)]=true;btn.classList.add('pressed')},{passive:false});
  btn.addEventListener('touchend',e=>{e.preventDefault();keys['Arrow'+dir.charAt(0).toUpperCase()+dir.slice(1)]=false;btn.classList.remove('pressed')},{passive:false});
});

// Space Shooter bomb button
document.getElementById('spaceBomb').addEventListener('touchstart',e=>{e.preventDefault();keys['b']=true;document.getElementById('spaceBomb').classList.add('pressed')},{passive:false});
document.getElementById('spaceBomb').addEventListener('touchend',e=>{e.preventDefault();keys['b']=false;document.getElementById('spaceBomb').classList.remove('pressed')},{passive:false});

// Fire button
document.getElementById('fireBtn').addEventListener('touchstart',e=>{e.preventDefault();keys[' ']=true});
document.getElementById('fireBtn').addEventListener('touchend',e=>{e.preventDefault();keys[' ']=false});

// ===== SPACE SLIDER BAR =====
(function(){
  const track=document.getElementById('spaceSliderTrack');
  const thumb=document.getElementById('spaceSliderThumb');
  if(!track||!thumb)return;
  let dragging=false;
  function getSliderPos(clientX){
    const rect=track.getBoundingClientRect();
    const pct=Math.max(0,Math.min(1,(clientX-rect.left)/rect.width));
    return pct;
  }
  function moveThumb(pct){
    thumb.style.left=(pct*100)+'%';
    // Move spaceship proportionally
    if(currentGame==='space'&&GAMES.space.player&&gameRunning){
      const W=gameCanvas.width;
      GAMES.space.player.x=pct*(W-GAMES.space.player.w);
    }
  }
  track.addEventListener('touchstart',e=>{
    e.preventDefault();dragging=true;
    const pct=getSliderPos(e.touches[0].clientX);moveThumb(pct);
  },{passive:false});
  track.addEventListener('touchmove',e=>{
    e.preventDefault();if(!dragging)return;
    const pct=getSliderPos(e.touches[0].clientX);moveThumb(pct);
  },{passive:false});
  track.addEventListener('touchend',e=>{e.preventDefault();dragging=false},{passive:false});
  // Mouse fallback
  track.addEventListener('mousedown',e=>{dragging=true;moveThumb(getSliderPos(e.clientX))});
  window.addEventListener('mousemove',e=>{if(dragging)moveThumb(getSliderPos(e.clientX))});
  window.addEventListener('mouseup',()=>{dragging=false});
})();

// ===== SHOW/HIDE MOBILE CONTROLS PER GAME =====
function showMobileControls(game){
  // Hide all mobile control sets
  document.querySelectorAll('.mobile-controls').forEach(el=>el.classList.remove('active'));
  // Show the correct one
  const map={space:'mobileSpace',asteroid:'mobileAsteroid'};
  const id=map[game];
  if(id){const el=document.getElementById(id);if(el)el.classList.add('active')}
  // Sync slider thumb to ship position
  if(game==='space'){
    const thumb=document.getElementById('spaceSliderThumb');
    if(thumb)thumb.style.left='50%';
  }
}

// ===== COMBO SYSTEM =====
let comboCount=0,comboTimer=null;
function addCombo(){
  comboCount++;
  if(comboCount>STATE.bestCombo){STATE.bestCombo=comboCount;saveState()}
  const el=document.getElementById('hudCombo');
  el.textContent=comboCount>1?`${comboCount}x COMBO!`:'';
  if(comboCount>2){el.classList.remove('combo-flash');void el.offsetWidth;el.classList.add('combo-flash')}
  if(comboTimer)clearTimeout(comboTimer);
  comboTimer=setTimeout(()=>{comboCount=0;document.getElementById('hudCombo').textContent=''},2000);
  return comboCount;
}
function resetCombo(){comboCount=0;document.getElementById('hudCombo').textContent=''}
function setLives(n){
  const max=Math.max(n,5);
  let hearts='';
  for(let i=0;i<Math.max(0,n);i++)hearts+='❤️';
  for(let i=n;i<max;i++)hearts+='🖤';
  document.getElementById('hudLives').textContent=hearts;
}
function setScore(n){document.getElementById('hudScore').textContent=n}

// ===== CLEAR GAME =====
function clearGame(){clearTimeout(whackTimer);whackInterval&&clearInterval(whackInterval);whackTimer=null;whackInterval=null}
let whackTimer=null,whackInterval=null;

// ===== GAMES =====
const GAMES={};

// ============================================================
// SPACE SHOOTER — AAA with Power-ups, Bombs, Time-based Difficulty
// ============================================================
const POWERUP_TYPES={
  TRIPLE: {emoji:'🔱',color:'#00BFFF',label:'TRIPLE SHOT!',duration:420},
  BIG:    {emoji:'💥',color:'#FFD700',label:'BIG BULLET!',duration:360},
  BOMB:   {emoji:'💣',color:'#FF6347',label:'+1 BOMB!',duration:0},
  LIFE:   {emoji:'❤️',color:'#FF69B4',label:'+1 LIFE!',duration:0}
};
const getDifficulty=(gt)=>{const s=gt/60;if(s<45)return 0;if(s<90)return 1;if(s<150)return 2;if(s<225)return 3;if(s<320)return 4;return Math.min(5,Math.floor((s-320)/120)+5)};
const getDiffSettings=(lv)=>[
  {speed:0.6,spawnRate:0.008,maxE:3,label:'Easy'},
  {speed:0.8,spawnRate:0.010,maxE:4,label:'Easy'},
  {speed:1.0,spawnRate:0.012,maxE:4,label:'Normal'},
  {speed:1.3,spawnRate:0.014,maxE:5,label:'Normal'},
  {speed:1.6,spawnRate:0.016,maxE:6,label:'Hard'},
  {speed:2.0,spawnRate:0.018,maxE:6,label:'Hard'}
][Math.min(lv,5)];

GAMES.space={
  score:0,lives:5,stars:[],bullets:[],enemies:[],particles:[],powerups:[],
  tripleShot:false,tripleShotTimer:0,bigBullet:false,bigBulletTimer:0,bombs:0,
  gameTime:0,diffLevel:0,nextPUTime:0,maxE:3,puMsg:'',puMsgTimer:0,puMsgColor:'#fff',bombFlash:0,
  player:null,lastMilestone:0,surpriseFlash:0,surpriseFlashColor:'#fff',

  start(){
    const W=gameCanvas.width,H=gameCanvas.height;
    this.score=0;this.lives=5;this.gameTime=0;this.diffLevel=0;this.bombs=0;
    this.tripleShot=false;this.tripleShotTimer=0;this.bigBullet=false;this.bigBulletTimer=0;
    this.bullets=[];this.enemies=[];this.particles=[];this.powerups=[];
    this.nextPUTime=300+Math.floor(Math.random()*180);this.maxE=3;
    this.puMsg='';this.puMsgTimer=0;this.bombFlash=0;this.lastMilestone=0;this.surpriseFlash=0;
    this.player={x:W/2,y:H-80,w:64,h:64,vx:0,vy:0,acc:1.2,fric:0.88,maxSpd:12,invincible:0};
    this.stars=Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+.5,v:Math.random()*.8+.2}));
    setScore(0);setLives(5);resetCombo();
    gameLoop=requestAnimationFrame(()=>this.loop());
  },

  loop(){
    if(!gameRunning)return;
    if(!gamePaused)this.update();
    this.draw();
    gameLoop=requestAnimationFrame(()=>this.loop());
  },

  fireBullets(){
    const p=this.player,cx=p.x+p.w/2,cy=p.y;
    this.bullets.push({x:cx,y:cy,vx:0,vy:-7,big:this.bigBullet});
    if(this.tripleShot){
      this.bullets.push({x:cx-16,y:cy+10,vx:-2,vy:-6,big:this.bigBullet});
      this.bullets.push({x:cx+16,y:cy+10,vx:2,vy:-6,big:this.bigBullet});
    }
    SFX.shoot();
  },

  useBomb(){
    if(this.bombs<=0)return;
    this.bombs--;
    this.enemies.forEach(e=>{this.score+=10;this.spawnParticles(e.x+16,e.y+16,'#FF6347')});
    this.enemies=[];
    this.bombFlash=15;
    this.showPU('💣 BOOM! ALL ENEMIES DESTROYED! 💣','#FF6347');
    SFX.hit();screenShake();
    setScore(this.score);
  },

  showPU(msg,color){this.puMsg=msg;this.puMsgTimer=120;this.puMsgColor=color},

  collectPU(pu){
    const info=POWERUP_TYPES[pu.type];
    SFX.powerup();
    switch(pu.type){
      case'TRIPLE':this.tripleShot=true;this.tripleShotTimer=info.duration;this.showPU('🔱 TRIPLE SHOT ACTIVATED! 🔱',info.color);break;
      case'BIG':this.bigBullet=true;this.bigBulletTimer=info.duration;this.showPU('💥 BIG BULLET ACTIVATED! 💥',info.color);break;
      case'BOMB':this.bombs++;this.showPU('💣 BOMB COLLECTED! Press B to use! 💣',info.color);break;
      case'LIFE':this.lives=Math.min(this.lives+1,7);setLives(this.lives);this.showPU('❤️ EXTRA LIFE! ❤️',info.color);break;
    }
  },

  spawnEnemy(){
    const W=gameCanvas.width,s=getDiffSettings(this.diffLevel);
    const spd=s.speed+Math.random()*0.3;
    const mt=Math.random()<0.4?'zigzag':'straight';
    this.enemies.push({
      x:Math.random()*(W-32),y:-32,w:32,h:32,
      moveType:mt,vx:(Math.random()-.5)*2,vy:spd,
      amplitude:Math.random()*40+20,frequency:Math.random()*0.03+0.01,
      phase:Math.random()*Math.PI*2,baseX:Math.random()*(W-32),
      frame:0
    });
  },

  spawnPowerUp(){
    const W=gameCanvas.width;
    const types=Object.keys(POWERUP_TYPES);
    const type=types[Math.floor(Math.random()*types.length)];
    const info=POWERUP_TYPES[type];
    this.powerups.push({
      x:Math.random()*(W-40)+20,y:-30,w:30,h:30,vy:1.2,
      type,emoji:info.emoji,color:info.color,label:info.label,
      bobPhase:Math.random()*Math.PI*2,frame:0
    });
  },

  spawnParticles(x,y,color){
    for(let i=0;i<12;i++){
      const a=(i/12)*Math.PI*2,v=3+Math.random()*2;
      this.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,color,size:Math.random()*4+2});
    }
  },

  update(){
    const W=gameCanvas.width,H=gameCanvas.height,p=this.player;
    this.gameTime++;

    if(keys['b']||keys['B']){this.useBomb();keys['b']=false;keys['B']=false}
    if(keys[' ']&&this.gameTime%8===0)this.fireBullets();

    const nd=getDifficulty(this.gameTime);
    if(nd>this.diffLevel){
      this.diffLevel=nd;const s=getDiffSettings(nd);this.maxE=s.maxE;
      this.showPU('⭐ DIFFICULTY UP: '+s.label+'! ⭐','#FFD700');
      showFloatingText(gameCanvasWrap,'⭐ '+s.label+' MODE',true);
    }
    const ds=getDiffSettings(this.diffLevel);

    if(this.tripleShot){this.tripleShotTimer--;if(this.tripleShotTimer<=0)this.tripleShot=false}
    if(this.bigBullet){this.bigBulletTimer--;if(this.bigBulletTimer<=0)this.bigBullet=false}
    if(this.puMsgTimer>0)this.puMsgTimer--;
    if(this.bombFlash>0)this.bombFlash--;

    if(keys['ArrowLeft'])p.vx-=p.acc;
    if(keys['ArrowRight'])p.vx+=p.acc;
    if(keys['ArrowUp'])p.vy-=p.acc;
    if(keys['ArrowDown'])p.vy+=p.acc;
    p.vx*=p.fric;p.vy*=p.fric;
    p.vx=Math.max(-p.maxSpd,Math.min(p.maxSpd,p.vx));
    p.vy=Math.max(-p.maxSpd,Math.min(p.maxSpd,p.vy));
    p.x+=p.vx;p.y+=p.vy;
    p.x=Math.max(0,Math.min(W-p.w,p.x));
    p.y=Math.max(0,Math.min(H-p.h,p.y));

    if(this.enemies.length<this.maxE&&Math.random()<ds.spawnRate)this.spawnEnemy();

    if(this.gameTime>=this.nextPUTime){
      this.spawnPowerUp();
      this.nextPUTime=this.gameTime+300+Math.floor(Math.random()*300);
    }

    this.stars.forEach(s=>{s.y+=s.v;if(s.y>H){s.y=0;s.x=Math.random()*W}});

    this.enemies.forEach(e=>{
      e.frame++;
      if(e.moveType==='zigzag'){e.x=e.baseX+Math.sin(e.frame*e.frequency)*e.amplitude}
      else{e.x+=e.vx;if(e.x<0||e.x>W-32)e.vx*=-1}
      e.y+=e.vy;
    });

    this.powerups.forEach(pu=>{pu.frame++;pu.y+=pu.vy;pu.x+=Math.sin(pu.frame*0.05)*0.5});
    this.powerups=this.powerups.filter(pu=>pu.y<H+40);

    this.bullets=this.bullets.filter(b=>{b.y+=b.vy;b.x+=(b.vx||0);return b.y>-20&&b.x>-20&&b.x<W+20});

    this.bullets=this.bullets.filter(b=>{
      let alive=true;
      this.enemies=this.enemies.filter(e=>{
        const bw=b.big?12:4,bh=b.big?16:10;
        if(b.x<e.x+e.w&&b.x+bw>e.x&&b.y<e.y+e.h&&b.y+bh>e.y){
          const pts=b.big?20:10;
          this.score+=pts;addCombo();setScore(this.score);
          showFloatingText(gameCanvasWrap,'+'+pts);
          SFX.point();
          this.spawnParticles(e.x+16,e.y+16,b.big?'#FFD700':'#7C3AED');
          if(!b.big)alive=false;
          return false;
        }
        return true;
      });
      return alive;
    });

    const milestones=[50,100,200,350,500,750,1000];
    const nextM=milestones.find(m=>m>this.lastMilestone);
    if(nextM&&this.score>=nextM){
      this.lastMilestone=nextM;spawnConfetti();SFX.levelUp();
      if(nextM<=100){this.bombs+=2;this.showPU('🎉 '+nextM+'PTS! +2 BOMBS!','#FFD700');showFloatingText(gameCanvasWrap,'🎉 MILESTONE '+nextM+'!',true)}
      else if(nextM<=350){this.tripleShot=true;this.tripleShotTimer=600;this.bigBullet=true;this.bigBulletTimer=600;this.showPU('🔥 '+nextM+'PTS! ALL WEAPONS 10s!','#FF6347');showFloatingText(gameCanvasWrap,'🔥 POWER SURGE!',true)}
      else if(nextM<=750){this.lives=Math.min(this.lives+2,7);setLives(this.lives);this.bombs+=3;this.showPU('💎 '+nextM+'PTS! +2❤️ +3💣!','#C084FC');showFloatingText(gameCanvasWrap,'💎 MEGA BONUS!',true)}
      else{this.tripleShot=true;this.tripleShotTimer=900;this.bigBullet=true;this.bigBulletTimer=900;this.lives=Math.min(this.lives+3,7);setLives(this.lives);this.bombs+=5;this.showPU('👑 '+nextM+'PTS! LEGENDARY!','#FFD700');showFloatingText(gameCanvasWrap,'👑 LEGENDARY!',true)}
      this.surpriseFlash=25;this.surpriseFlashColor=nextM>=500?'#FFD700':'#C084FC';
      screenShake();
    }
    if(this.surpriseFlash>0)this.surpriseFlash--;

    this.powerups=this.powerups.filter(pu=>{
      if(pu.x<p.x+p.w&&pu.x+pu.w>p.x&&pu.y<p.y+p.h&&pu.y+pu.h>p.y){
        this.collectPU(pu);
        this.spawnParticles(pu.x+15,pu.y+15,pu.color);
        return false;
      }
      return true;
    });

    this.enemies=this.enemies.filter(e=>{
      if(e.y>H){
        if(p.invincible<=0){
          this.lives--;setLives(this.lives);SFX.hit();screenShake();
          p.invincible=90;resetCombo();
          if(this.lives<=0){endGame(this.score,'Space Shooter');return false}
        }
        return false;
      }
      if(p.invincible<=0&&e.x<p.x+p.w&&e.x+e.w>p.x&&e.y<p.y+p.h&&e.y+e.h>p.y){
        this.lives--;setLives(this.lives);SFX.hit();screenShake();
        p.invincible=90;resetCombo();
        this.spawnParticles(e.x+16,e.y+16,'#EF4444');
        if(this.lives<=0){endGame(this.score,'Space Shooter');return false}
        return false;
      }
      return true;
    });

    if(p.invincible>0)p.invincible--;

    this.particles=this.particles.filter(pt=>{
      pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=0.15;pt.life-=0.02;pt.vx*=0.95;
      return pt.life>0;
    });
  },

  draw(){
    const W=gameCanvas.width,H=gameCanvas.height,p=this.player;
    const bg=gCtx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#020209');bg.addColorStop(1,'#1a0533');
    gCtx.fillStyle=bg;gCtx.fillRect(0,0,W,H);

    if(this.bombFlash>0){
      gCtx.fillStyle=`rgba(255,99,71,${this.bombFlash/20})`;
      gCtx.fillRect(0,0,W,H);
    }

    if(this.surpriseFlash>0){
      const c=this.surpriseFlashColor==='#FFD700'?'255,215,0':'192,132,252';
      gCtx.fillStyle=`rgba(${c},${this.surpriseFlash/30})`;
      gCtx.fillRect(0,0,W,H);
    }

    this.stars.forEach(s=>{
      gCtx.fillStyle=`rgba(255,255,255,${s.s/3})`;
      gCtx.beginPath();gCtx.arc(s.x,s.y,s.s,0,Math.PI*2);gCtx.fill();
    });

    gCtx.save();
    gCtx.translate(p.x+p.w/2,p.y+p.h/2);
    if(p.invincible>0&&Math.floor(p.invincible/5)%2===0)gCtx.globalAlpha=0.4;
    gCtx.fillStyle='#7C3AED';
    gCtx.beginPath();gCtx.moveTo(-20,-24);gCtx.lineTo(20,-24);gCtx.lineTo(28,24);gCtx.lineTo(-28,24);gCtx.closePath();gCtx.fill();
    gCtx.fillStyle='#A78BFA';
    gCtx.beginPath();gCtx.moveTo(-28,-10);gCtx.lineTo(-38,15);gCtx.lineTo(-28,15);gCtx.closePath();gCtx.fill();
    gCtx.beginPath();gCtx.moveTo(28,-10);gCtx.lineTo(38,15);gCtx.lineTo(28,15);gCtx.closePath();gCtx.fill();
    gCtx.fillStyle='#FFD700';gCtx.beginPath();gCtx.arc(0,-15,6,0,Math.PI*2);gCtx.fill();
    gCtx.shadowColor='#7C3AED';gCtx.shadowBlur=15;
    gCtx.fillStyle='rgba(124,58,237,0.6)';gCtx.fillRect(-12,20,24,12);gCtx.shadowBlur=0;
    const fi=Math.random()*0.5+0.5;
    gCtx.fillStyle=`rgba(255,107,53,${fi})`;
    gCtx.beginPath();gCtx.moveTo(-10,32);gCtx.lineTo(-6,42);gCtx.lineTo(0,38);gCtx.lineTo(6,42);gCtx.lineTo(10,32);gCtx.closePath();gCtx.fill();
    gCtx.globalAlpha=1;gCtx.restore();

    if(this.tripleShot||this.bigBullet){
      gCtx.save();
      const cx=p.x+p.w/2,cy=p.y+p.h/2;
      const col=this.tripleShot?'rgba(0,191,255,0.15)':'rgba(255,215,0,0.15)';
      const pulse=Math.sin(this.gameTime*0.1)*5;
      gCtx.beginPath();gCtx.arc(cx,cy,40+pulse,0,Math.PI*2);gCtx.fillStyle=col;gCtx.fill();
      gCtx.restore();
    }

    this.bullets.forEach(b=>{
      if(b.big){
        const gr=gCtx.createLinearGradient(b.x,b.y,b.x,b.y+20);
        gr.addColorStop(0,'#FFD700');gr.addColorStop(1,'#FF6B35');
        gCtx.fillStyle=gr;gCtx.shadowColor='#FFD700';gCtx.shadowBlur=12;
        gCtx.fillRect(b.x-4,b.y,12,16);gCtx.shadowBlur=0;
      }else{
        gCtx.fillStyle='#10B981';gCtx.shadowColor='#10B981';gCtx.shadowBlur=6;
        gCtx.fillRect(b.x,b.y,4,10);gCtx.shadowBlur=0;
      }
    });

    this.enemies.forEach(e=>{
      gCtx.save();gCtx.translate(e.x+e.w/2,e.y+e.h/2);
      gCtx.fillStyle='#EF4444';
      gCtx.beginPath();gCtx.moveTo(-14,-14);gCtx.lineTo(14,-14);gCtx.lineTo(18,14);gCtx.lineTo(-18,14);gCtx.closePath();gCtx.fill();
      gCtx.fillStyle='#F97316';
      gCtx.beginPath();gCtx.moveTo(-18,0);gCtx.lineTo(-24,-6);gCtx.lineTo(-18,-2);gCtx.closePath();gCtx.fill();
      gCtx.beginPath();gCtx.moveTo(18,0);gCtx.lineTo(24,-6);gCtx.lineTo(18,-2);gCtx.closePath();gCtx.fill();
      gCtx.shadowColor='#EF4444';gCtx.shadowBlur=10;
      gCtx.fillStyle='#FFF';gCtx.beginPath();gCtx.arc(-6,-3,3,0,Math.PI*2);gCtx.fill();
      gCtx.fillStyle='#000';gCtx.beginPath();gCtx.arc(-6,-3,1.5,0,Math.PI*2);gCtx.fill();
      gCtx.shadowBlur=0;gCtx.restore();
    });

    this.powerups.forEach(pu=>{
      gCtx.save();
      const bob=Math.sin(pu.frame*0.08)*3;
      const cx=pu.x+pu.w/2,cy=pu.y+pu.h/2+bob;
      gCtx.shadowColor=pu.color;gCtx.shadowBlur=20;
      gCtx.strokeStyle=pu.color;gCtx.lineWidth=2;
      gCtx.beginPath();gCtx.arc(cx,cy,22,0,Math.PI*2);gCtx.stroke();
      gCtx.shadowBlur=0;
      gCtx.font='22px serif';gCtx.textAlign='center';gCtx.textBaseline='middle';
      gCtx.fillText(pu.emoji,cx,cy);
      gCtx.restore();
    });

    this.particles.forEach(pt=>{
      gCtx.globalAlpha=pt.life;gCtx.fillStyle=pt.color;
      gCtx.fillRect(pt.x,pt.y,pt.size,pt.size);gCtx.globalAlpha=1;
    });

    if(this.bombs>0){
      gCtx.fillStyle='rgba(255,99,71,0.9)';gCtx.font='bold 16px Orbitron,monospace';
      gCtx.textAlign='left';gCtx.fillText('💣 x'+this.bombs+'  [B]',16,H-20);
    }

    let hy=30;
    if(this.tripleShot){
      const s=Math.ceil(this.tripleShotTimer/60);
      gCtx.fillStyle='#00BFFF';gCtx.font='bold 14px Orbitron,monospace';gCtx.textAlign='center';
      gCtx.fillText('🔱 TRIPLE SHOT '+s+'s',W/2,hy);hy+=22;
    }
    if(this.bigBullet){
      const s=Math.ceil(this.bigBulletTimer/60);
      gCtx.fillStyle='#FFD700';gCtx.font='bold 14px Orbitron,monospace';gCtx.textAlign='center';
      gCtx.fillText('💥 BIG BULLET '+s+'s',W/2,hy);hy+=22;
    }

    if(this.puMsgTimer>0){
      const a=Math.min(1,this.puMsgTimer/30);
      gCtx.save();gCtx.globalAlpha=a;
      gCtx.fillStyle=this.puMsgColor;gCtx.font='bold 20px Orbitron,monospace';gCtx.textAlign='center';
      gCtx.fillText(this.puMsg,W/2,H/2-50-(120-this.puMsgTimer)*0.3);
      gCtx.globalAlpha=1;gCtx.restore();
    }

    gCtx.fillStyle='rgba(255,255,255,0.5)';gCtx.font='12px Orbitron,monospace';gCtx.textAlign='right';
    const mn=Math.floor(this.gameTime/3600),sc=String(Math.floor((this.gameTime/60)%60)).padStart(2,'0');
    gCtx.fillText(getDiffSettings(this.diffLevel).label+' | '+mn+':'+sc,W-16,H-20);
  }
};

// ============================================================
// FLAPPY BIRD
// ============================================================
GAMES.flappy={
  bird:null,pipes:[],score:0,started:false,dead:false,frameCount:0,bg:0,lives:3,invincible:0,
  start(){
    const W=gameCanvas.width,H=gameCanvas.height;
    this.bird={x:W*0.22,y:H/2,vy:0,r:14,rot:0};
    this.pipes=[];this.score=0;this.started=false;this.dead=false;this.frameCount=0;this.bg=0;this.pipeTimer=0;this.lives=3;this.invincible=0;
    setScore(0);setLives(3);resetCombo();
    document.addEventListener('click',this._flap=()=>this.flap(),{once:false});
    gameLoop=requestAnimationFrame(()=>this.loop());
  },
  flap(){if(!gamePaused&&!this.dead){this.bird.vy=-6.5;SFX.flap();if(!this.started)this.started=true}},
  loop(){
    if(!gameRunning)return;
    if(!gamePaused)this.update();
    this.draw();
    gameLoop=requestAnimationFrame(()=>this.loop());
  },
  update(){
    const W=gameCanvas.width,H=gameCanvas.height,b=this.bird;
    if(keys[' ']&&!this._spaceHeld){this.flap();this._spaceHeld=true}
    if(!keys[' '])this._spaceHeld=false;
    if(!this.started)return;
    this.frameCount++;this.bg+=1.5;
    b.vy+=.38;b.y+=b.vy;b.rot=Math.min(Math.max(b.vy*4,-30),90);
    if(b.y+b.r>H-40){this.lives--;setLives(this.lives);SFX.die();screenShake();
      if(this.lives<=0){this.dead=true;document.removeEventListener('click',this._flap);endGame(this.score,'Flappy Bird');return}
      b.y=H/2;b.vy=-3;this.invincible=90;return}
    if(b.y-b.r<0){b.y=b.r;b.vy=0}
    this.pipeTimer++;const gap=120+Math.max(0,60-this.score*2);const pipeSpeed=2+this.score*.08;
    if(this.pipeTimer>90){
      this.pipeTimer=0;
      const top=80+Math.random()*(H-gap-140);
      this.pipes.push({x:W+30,top,bottom:top+gap,scored:false,w:52});
    }
    this.pipes=this.pipes.filter(p=>{
      p.x-=pipeSpeed;
      if(!p.scored&&p.x+p.w<b.x){p.scored=true;this.score++;setScore(this.score);addCombo();SFX.point();showFloatingText(gameCanvasWrap,'+'+(addCombo()))}
      if(this.invincible<=0&&b.x+b.r>p.x&&b.x-b.r<p.x+p.w&&(b.y-b.r<p.top||b.y+b.r>p.bottom)){
        this.lives--;setLives(this.lives);SFX.hit();screenShake();resetCombo();
        if(this.lives<=0){this.dead=true;document.removeEventListener('click',this._flap);endGame(this.score,'Flappy Bird')}
        else{b.y=(p.top+p.bottom)/2;b.vy=-3;this.invincible=90}
      }
      return p.x>-100;
    });
    if(this.invincible>0)this.invincible--;
  },
  draw(){
    const W=gameCanvas.width,H=gameCanvas.height,b=this.bird;
    const sky=gCtx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#0a4d7a');sky.addColorStop(0.5,'#1a8ab5');sky.addColorStop(1,'#0e6e9e');
    gCtx.fillStyle=sky;gCtx.fillRect(0,0,W,H);
    gCtx.fillStyle='rgba(255,255,255,.12)';
    for(let i=0;i<5;i++){const cx=(this.bg*.3+i*180)%W;gCtx.beginPath();gCtx.ellipse(cx,50+i*30,55,22,0,0,Math.PI*2);gCtx.fill();gCtx.beginPath();gCtx.ellipse(cx+30,48+i*30,35,18,0,0,Math.PI*2);gCtx.fill()}
    this.pipes.forEach(p=>{
      gCtx.save();
      gCtx.shadowColor='#22c55e';gCtx.shadowBlur=16;
      const tG=gCtx.createLinearGradient(p.x,0,p.x+p.w,0);
      tG.addColorStop(0,'#0d4d1a');tG.addColorStop(.5,'#1a7a2e');tG.addColorStop(1,'#0d4d1a');
      gCtx.fillStyle=tG;gCtx.strokeStyle='#4ade80';gCtx.lineWidth=1.5;
      gCtx.fillRect(p.x,0,p.w,p.top);gCtx.strokeRect(p.x,0,p.w,p.top);
      gCtx.fillRect(p.x,p.bottom,p.w,H-p.bottom-38);gCtx.strokeRect(p.x,p.bottom,p.w,H-p.bottom-38);
      gCtx.shadowBlur=20;
      gCtx.fillStyle='#22a63f';gCtx.strokeStyle='#86efac';gCtx.lineWidth=1;
      gCtx.fillRect(p.x-4,p.top-16,p.w+8,16);gCtx.strokeRect(p.x-4,p.top-16,p.w+8,16);
      gCtx.fillRect(p.x-4,p.bottom,p.w+8,16);gCtx.strokeRect(p.x-4,p.bottom,p.w+8,16);
      gCtx.shadowBlur=0;gCtx.restore();
    });
    const gG=gCtx.createLinearGradient(0,H-40,0,H);gG.addColorStop(0,'#3d8a37');gG.addColorStop(1,'#2a6a25');
    gCtx.fillStyle=gG;gCtx.fillRect(0,H-40,W,40);
    gCtx.save();gCtx.shadowColor='#4ade80';gCtx.shadowBlur=10;gCtx.strokeStyle='#4ade80';gCtx.lineWidth=1.5;
    gCtx.beginPath();gCtx.moveTo(0,H-40);gCtx.lineTo(W,H-40);gCtx.stroke();gCtx.shadowBlur=0;gCtx.restore();
    gCtx.save();gCtx.translate(b.x,b.y);gCtx.rotate(b.rot*Math.PI/180);
    if(this.invincible>0&&Math.floor(this.invincible/5)%2===0)gCtx.globalAlpha=0.4;
    gCtx.shadowColor='#FBBF24';gCtx.shadowBlur=25;
    gCtx.fillStyle='#D97706';gCtx.beginPath();gCtx.ellipse(-b.r*.9,b.r*.1,b.r*.4,b.r*.2,-.3,0,Math.PI*2);gCtx.fill();
    gCtx.fillStyle='#B45309';gCtx.beginPath();gCtx.ellipse(-b.r*.85,b.r*.25,b.r*.3,b.r*.15,-.2,0,Math.PI*2);gCtx.fill();
    const bodyG=gCtx.createRadialGradient(0,0,2,0,0,b.r);
    bodyG.addColorStop(0,'#FDE68A');bodyG.addColorStop(.6,'#FBBF24');bodyG.addColorStop(1,'#D97706');
    gCtx.beginPath();gCtx.ellipse(0,0,b.r,b.r*.75,0,0,Math.PI*2);gCtx.fillStyle=bodyG;gCtx.fill();
    gCtx.strokeStyle='rgba(251,191,36,0.5)';gCtx.lineWidth=1.5;gCtx.stroke();
    gCtx.fillStyle='rgba(254,243,199,.5)';gCtx.beginPath();gCtx.ellipse(-b.r*.1,b.r*.15,b.r*.5,b.r*.35,0,0,Math.PI*2);gCtx.fill();
    const wingFlap=Math.sin(this.frameCount*.3)*b.r*.15;
    gCtx.fillStyle='#1E40AF';gCtx.beginPath();gCtx.ellipse(b.r*.2,-b.r*.1+wingFlap,b.r*.55,b.r*.35,.1,0,Math.PI*2);gCtx.fill();
    gCtx.fillStyle='#2563EB';gCtx.beginPath();gCtx.ellipse(b.r*.25,-b.r*.05+wingFlap,b.r*.4,b.r*.25,.1,0,Math.PI*2);gCtx.fill();
    gCtx.fillStyle='#fff';gCtx.beginPath();gCtx.arc(b.r*.5,-b.r*.15,b.r*.22,0,Math.PI*2);gCtx.fill();
    gCtx.fillStyle='#1a1a1a';gCtx.beginPath();gCtx.arc(b.r*.56,-b.r*.17,b.r*.12,0,Math.PI*2);gCtx.fill();
    gCtx.fillStyle='#fff';gCtx.beginPath();gCtx.arc(b.r*.6,-b.r*.2,b.r*.05,0,Math.PI*2);gCtx.fill();
    gCtx.fillStyle='#EF4444';gCtx.beginPath();gCtx.moveTo(b.r*.5,b.r*.05);gCtx.lineTo(b.r*.9,0);gCtx.lineTo(b.r*.5,b.r*.15);gCtx.closePath();gCtx.fill();
    gCtx.fillStyle='#DC2626';gCtx.beginPath();gCtx.moveTo(b.r*.5,b.r*.1);gCtx.lineTo(b.r*.85,b.r*.05);gCtx.lineTo(b.r*.5,b.r*.15);gCtx.closePath();gCtx.fill();
    gCtx.globalAlpha=1;
    gCtx.restore();
    if(!this.started){gCtx.save();gCtx.shadowColor='#FBBF24';gCtx.shadowBlur=15;gCtx.fillStyle=Math.floor(this.frameCount/20)%2===0?'#FBBF24':'rgba(251,191,36,0.35)';gCtx.font='bold 16px Nunito,sans-serif';gCtx.textAlign='center';gCtx.fillText('Tap or press SPACE to start',W/2,H/2-60);gCtx.shadowBlur=0;gCtx.restore()}
  }
};

// ============================================================
// ASTEROID DODGE
// ============================================================
GAMES.asteroid={
  player:null,asteroids:[],particles:[],score:0,lives:3,frameCount:0,stars:[],
  start(){
    const W=gameCanvas.width,H=gameCanvas.height;
    this.player={x:W/2,y:H-80,r:14,speed:4.5,invincible:0,trail:[]};
    this.asteroids=[];this.particles=[];this.score=0;this.lives=3;this.frameCount=0;
    this.stars=Array.from({length:100},()=>({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+.3,v:Math.random()*1.5+.5,twinkle:Math.random()}));
    setScore(0);setLives(3);resetCombo();
    gameLoop=requestAnimationFrame(()=>this.loop());
  },
  loop(){if(!gameRunning)return;if(!gamePaused)this.update();this.draw();gameLoop=requestAnimationFrame(()=>this.loop())},
  update(){
    const W=gameCanvas.width,H=gameCanvas.height,p=this.player;
    this.frameCount++;const speed=Math.min(2+this.frameCount/800,5.5);
    if(keys['ArrowLeft']&&p.x>p.r+5)p.x-=p.speed;
    if(keys['ArrowRight']&&p.x<W-p.r-5)p.x+=p.speed;
    if(keys['ArrowUp']&&p.y>p.r+5)p.y-=p.speed*.7;
    if(keys['ArrowDown']&&p.y<H-p.r-5)p.y+=p.speed*.7;
    p.trail.push({x:p.x,y:p.y});if(p.trail.length>12)p.trail.shift();
    if(p.invincible>0)p.invincible--;
    if(this.frameCount%60===0){this.score++;setScore(this.score);addCombo()}
    if(this.frameCount%Math.max(40,90-Math.floor(this.frameCount/200)*10)===0){
      const sides=['top','left','right'];const side=sides[Math.floor(Math.random()*sides.length)];
      let x,y,vx,vy;
      if(side==='top'){x=Math.random()*W;y=-40;vx=(Math.random()-.5)*2;vy=speed}
      else if(side==='left'){x=-40;y=Math.random()*H;vx=speed;vy=(Math.random()-.5)*1.5}
      else{x=W+40;y=Math.random()*H;vx=-speed;vy=(Math.random()-.5)*1.5}
      const size=20+Math.random()*25;
      const pts=5+Math.floor(Math.random()*4);
      const shape=Array.from({length:pts},(_,i)=>{const a=i/pts*Math.PI*2,r2=size*(0.6+Math.random()*.4);return{x:Math.cos(a)*r2,y:Math.sin(a)*r2}});
      this.asteroids.push({x,y,vx,vy,rot:Math.random()*Math.PI*2,rspeed:(Math.random()-.5)*.06,size,shape,color:`hsl(${200+Math.random()*60},60%,${40+Math.random()*20}%)`});
    }
    this.stars.forEach(s=>{s.y+=s.v;if(s.y>H)s.y=-5;s.twinkle=(s.twinkle+.02)%1});
    this.asteroids=this.asteroids.filter(a=>{
      a.x+=a.vx;a.y+=a.vy;a.rot+=a.rspeed;
      if(a.x<-80||a.x>W+80||a.y>H+80)return false;
      if(p.invincible<=0&&Math.sqrt((a.x-p.x)**2+(a.y-p.y)**2)<a.size*.6+p.r*.7){
        this.lives--;setLives(this.lives);SFX.hit();screenShake();resetCombo();p.invincible=90;
        for(let i=0;i<15;i++)this.particles.push({x:p.x,y:p.y,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,life:40,color:'#EC4899'});
        if(this.lives<=0){endGame(this.score,'Asteroid Dodge');return false}
      }
      return true;
    });
    this.particles=this.particles.filter(pt=>{pt.x+=pt.vx;pt.y+=pt.vy;pt.life--;pt.vx*=.92;pt.vy*=.92;return pt.life>0});
  },
  draw(){
    const W=gameCanvas.width,H=gameCanvas.height,p=this.player;
    gCtx.fillStyle='#050510';gCtx.fillRect(0,0,W,H);
    this.stars.forEach(s=>{const a=.3+Math.sin(s.twinkle*Math.PI*2)*.2;gCtx.fillStyle=`rgba(200,200,255,${a})`;gCtx.beginPath();gCtx.arc(s.x,s.y,s.s,0,Math.PI*2);gCtx.fill()});
    p.trail.forEach((t,i)=>{const a=i/p.trail.length*.5;gCtx.shadowColor='#A855F7';gCtx.shadowBlur=14;gCtx.fillStyle=`rgba(168,85,247,${a})`;gCtx.beginPath();gCtx.arc(t.x,t.y,p.r*(i/p.trail.length),0,Math.PI*2);gCtx.fill();gCtx.shadowBlur=0});
    this.asteroids.forEach(a=>{
      gCtx.save();gCtx.translate(a.x,a.y);gCtx.rotate(a.rot);
      gCtx.shadowColor=a.color;gCtx.shadowBlur=16;
      gCtx.beginPath();gCtx.moveTo(a.shape[0].x,a.shape[0].y);
      a.shape.slice(1).forEach(pt=>gCtx.lineTo(pt.x,pt.y));gCtx.closePath();
      gCtx.fillStyle=a.color;gCtx.fill();
      gCtx.strokeStyle='rgba(180,210,255,.35)';gCtx.lineWidth=1.5;gCtx.stroke();
      gCtx.shadowBlur=0;gCtx.restore();
    });
    this.particles.forEach(pt=>{gCtx.globalAlpha=pt.life/40;gCtx.shadowColor=pt.color;gCtx.shadowBlur=12;gCtx.fillStyle=pt.color;gCtx.beginPath();gCtx.arc(pt.x,pt.y,3,0,Math.PI*2);gCtx.fill();gCtx.shadowBlur=0;gCtx.globalAlpha=1});
    const pi=p.invincible;
    gCtx.save();gCtx.translate(p.x,p.y);
    if(pi>0&&Math.floor(pi/5)%2===0)gCtx.globalAlpha=.3;
    gCtx.shadowColor='#22D3EE';gCtx.shadowBlur=28;
    gCtx.fillStyle='#22D3EE';gCtx.strokeStyle='rgba(165,243,252,0.6)';gCtx.lineWidth=1.5;
    gCtx.beginPath();gCtx.moveTo(0,-16);gCtx.lineTo(12,12);gCtx.lineTo(0,6);gCtx.lineTo(-12,12);gCtx.closePath();gCtx.fill();gCtx.stroke();
    gCtx.globalAlpha=1;gCtx.restore();
    gCtx.save();gCtx.shadowColor='#22D3EE';gCtx.shadowBlur=18;
    gCtx.fillStyle='rgba(34,211,238,.6)';gCtx.beginPath();gCtx.ellipse(p.x,p.y+14,5,10,0,0,Math.PI*2);gCtx.fill();gCtx.shadowBlur=0;gCtx.restore();
    const spd=Math.min(2+this.frameCount/800,5.5);
    gCtx.save();gCtx.shadowColor='#A855F7';gCtx.shadowBlur=10;
    gCtx.fillStyle='rgba(168,85,247,.7)';gCtx.font='11px Orbitron,monospace';gCtx.textAlign='right';gCtx.fillText('SPEED: '+spd.toFixed(1)+'x',W-15,H-15);
    gCtx.shadowBlur=0;gCtx.restore();
  }
};

// ============================================================
// WHACK A BEAR
// ============================================================
GAMES.whack={
  holes:[],score:0,misses:0,timeLeft:60,interval:null,
  start(){
    this.score=0;this.misses=0;this.timeLeft=60;
    this.holes=Array.from({length:9},(_,i)=>({active:false,timer:0,maxTimer:0,x:0,y:0,idx:i,anim:0,whacked:false,whackAnim:0}));
    setScore(0);setLives(3);resetCombo();
    document.getElementById('hudLives').textContent='⏱ 60';
    gameLoop=requestAnimationFrame(()=>this.loop());
    this.startTimers();
  },
  startTimers(){
    const self=this;
    whackInterval=setInterval(()=>{
      if(!gameRunning||gamePaused)return;
      self.timeLeft--;document.getElementById('hudLives').textContent='⏱ '+self.timeLeft;
      if(self.timeLeft<=0){clearInterval(whackInterval);clearTimeout(whackTimer);endGame(self.score,'Whack-a-Mole')}
    },1000);
    const popMole=()=>{
      if(!gameRunning)return;
      if(!gamePaused){
        const inactive=self.holes.filter(h=>!h.active);
        if(inactive.length){
          const h=inactive[Math.floor(Math.random()*inactive.length)];
          h.active=true;h.whacked=false;h.anim=0;
          h.maxTimer=Math.max(40,80-Math.floor(self.score/5)*5);h.timer=h.maxTimer;
        }
      }
      if(gameRunning)whackTimer=setTimeout(popMole,Math.max(400,900-self.score*15));
    };
    popMole();
  },
  loop(){if(!gameRunning)return;if(!gamePaused)this.update();this.draw();gameLoop=requestAnimationFrame(()=>this.loop())},
  update(){
    const W=gameCanvas.width,H=gameCanvas.height;
    const cols=3,rows=3,pw=Math.min(W,500),ph=Math.min(H-40,400);
    const ox=(W-pw)/2,oy=(H-ph)/2+20,cw=pw/cols,ch=ph/rows;
    this.holes.forEach((h,i)=>{
      h.x=ox+cw*(i%3)+cw/2;h.y=oy+ch*Math.floor(i/3)+ch*.7;
      if(h.active&&!h.whacked){h.anim=Math.min(1,h.anim+.12);h.timer--;if(h.timer<=0){h.active=false;h.anim=0;this.misses++;setLives(Math.max(0,3-Math.floor(this.misses/3)))}}
      if(h.whacked){h.whackAnim+=.15;if(h.whackAnim>=1){h.active=false;h.whacked=false;h.anim=0;h.whackAnim=0}}
    });
  },
  click(ex,ey){
    this.holes.forEach(h=>{
      if(h.active&&!h.whacked&&Math.sqrt((ex-h.x)**2+(ey-h.y)**2)<35){
        h.whacked=true;h.whackAnim=0;
        this.score+=Math.max(1,addCombo());setScore(this.score);SFX.whack();
        showFloatingText(gameCanvasWrap,'+'+(addCombo()));
      }
    });
  },
  draw(){
    const W=gameCanvas.width,H=gameCanvas.height;
    const bg=gCtx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a5a0f');bg.addColorStop(0.5,'#2d8a22');bg.addColorStop(1,'#1a5a0f');
    gCtx.fillStyle=bg;gCtx.fillRect(0,0,W,H);
    this.holes.forEach(h=>{
      const visible=h.active?h.anim:0;
      gCtx.save();gCtx.shadowColor='#000';gCtx.shadowBlur=14;
      gCtx.fillStyle='rgba(0,0,0,.6)';gCtx.beginPath();gCtx.ellipse(h.x,h.y+5,38,20,0,0,Math.PI*2);gCtx.fill();
      gCtx.shadowBlur=0;gCtx.restore();
      gCtx.fillStyle='#1a0d00';gCtx.beginPath();gCtx.ellipse(h.x,h.y,34,18,0,0,Math.PI*2);gCtx.fill();
      gCtx.save();gCtx.shadowColor='#F59E0B';gCtx.shadowBlur=h.active?16:0;
      gCtx.strokeStyle=h.active?'rgba(245,158,11,0.5)':'rgba(100,80,40,0.3)';gCtx.lineWidth=2;
      gCtx.beginPath();gCtx.ellipse(h.x,h.y,34,18,0,0,Math.PI*2);gCtx.stroke();gCtx.shadowBlur=0;gCtx.restore();
      if(h.active){
        const sy=h.whacked?h.whackAnim*30:-30+h.anim*30;
        gCtx.save();gCtx.beginPath();gCtx.ellipse(h.x,h.y,34,18,0,0,Math.PI*2);gCtx.clip();
        gCtx.save();gCtx.translate(h.x,h.y+sy);
        gCtx.fillStyle=h.whacked?'#7A4A1A':'#8B5E3C';gCtx.beginPath();gCtx.arc(-14,-32,8,0,Math.PI*2);gCtx.fill();gCtx.beginPath();gCtx.arc(14,-32,8,0,Math.PI*2);gCtx.fill();
        gCtx.fillStyle='#D2956C';gCtx.beginPath();gCtx.arc(-14,-32,4,0,Math.PI*2);gCtx.fill();gCtx.beginPath();gCtx.arc(14,-32,4,0,Math.PI*2);gCtx.fill();
        gCtx.shadowColor=h.whacked?'#D97706':'#8B5E3C';gCtx.shadowBlur=h.whacked?5:12;
        gCtx.fillStyle=h.whacked?'#7A4A1A':'#8B5E3C';gCtx.beginPath();gCtx.ellipse(0,-10,22,28,0,0,Math.PI*2);gCtx.fill();
        gCtx.strokeStyle=h.whacked?'rgba(217,119,6,0.4)':'rgba(180,140,100,0.4)';gCtx.lineWidth=1.5;gCtx.stroke();
        gCtx.shadowBlur=0;
        gCtx.fillStyle='#D2B48C';gCtx.beginPath();gCtx.ellipse(0,-18,15,13,0,0,Math.PI*2);gCtx.fill();
        gCtx.fillStyle='#E8D5B7';gCtx.beginPath();gCtx.ellipse(0,-15,8,6,0,0,Math.PI*2);gCtx.fill();
        if(!h.whacked){
          gCtx.fillStyle='#1a1a1a';gCtx.beginPath();gCtx.arc(-6,-22,3,0,Math.PI*2);gCtx.fill();gCtx.beginPath();gCtx.arc(6,-22,3,0,Math.PI*2);gCtx.fill();
          gCtx.fillStyle='#fff';gCtx.beginPath();gCtx.arc(-5,-23,1.5,0,Math.PI*2);gCtx.fill();gCtx.beginPath();gCtx.arc(7,-23,1.5,0,Math.PI*2);gCtx.fill();
          gCtx.fillStyle='#333';gCtx.beginPath();gCtx.ellipse(0,-16,3.5,2.5,0,0,Math.PI*2);gCtx.fill();
          gCtx.strokeStyle='#555';gCtx.lineWidth=1;gCtx.beginPath();gCtx.arc(0,-13,3,0,Math.PI);gCtx.stroke();
        }else{
          gCtx.fillStyle='#F59E0B';gCtx.font='20px serif';gCtx.textAlign='center';gCtx.fillText('⭐',-15,-35+h.whackAnim*-15);gCtx.fillText('⭐',15,-30+h.whackAnim*-10);
        }
        gCtx.restore();gCtx.restore();
      }
    });
    gCtx.save();gCtx.shadowColor='#A855F7';gCtx.shadowBlur=12;
    gCtx.fillStyle='rgba(168,130,255,.7)';gCtx.font='bold 14px Orbitron,monospace';gCtx.textAlign='center';gCtx.fillText('WHACK-A-BEAR',W/2,30);
    gCtx.shadowColor='#EF4444';gCtx.shadowBlur=8;
    gCtx.fillStyle='rgba(239,68,68,.8)';gCtx.font='11px Nunito,sans-serif';gCtx.textAlign='left';gCtx.fillText('Misses: '+this.misses,15,H-15);
    gCtx.shadowBlur=0;gCtx.restore();
  }
};
// ============================================================
// DINO JUMP — Neon Endless Runner
// ============================================================
GAMES.dino=(function(){
  // --- constants & state ---
  const GRAVITY=0.6, JUMP_FORCE=-12, DOUBLE_JUMP_FORCE=-10;
  const GROUND_Y_OFFSET=60; // from bottom
  let W,H,groundY;
  let dino,obstacles,pteros,stars,mountains,groundDots,dustParts,deathParts,speedLines;
  let score,hiScore,frameCount,gameSpeed,maxSpeed,state; // 'idle','playing','dead'
  let jumpsLeft,dayNightPhase,spawnCooldown,lastMilestone;
  let shakeTimer,shakeIntensity;
  let bgPulsePhase,bgPulseTimer;
  let dinoAnimFrame,dinoAnimTimer,dinoBreathPhase;
  let deathSpin,deathFlashTimer;
  let speedBarPct;

  function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();}

  function reset(){
    W=gameCanvas.width; H=gameCanvas.height;
    groundY=H-GROUND_Y_OFFSET;
    hiScore=parseInt(localStorage.getItem('dinoJump_best'))||0;
    score=0; frameCount=0; gameSpeed=5; maxSpeed=15;
    state='idle'; jumpsLeft=2; dayNightPhase=0; lastMilestone=0;
    shakeTimer=0; shakeIntensity=0; bgPulsePhase=0; bgPulseTimer=0;
    dinoAnimFrame=0; dinoAnimTimer=0; dinoBreathPhase=0;
    deathSpin=0; deathFlashTimer=0; speedBarPct=0;
    dino={x:80, y:groundY, vy:0, w:40, h:48, onGround:true, ducking:false};
    obstacles=[]; pteros=[]; dustParts=[]; deathParts=[]; speedLines=[];
    spawnCooldown=60;
    // parallax layers
    stars=Array.from({length:60},()=>({x:Math.random()*W,y:Math.random()*(groundY-40),s:Math.random()*1.5+.5,twinkle:Math.random()*Math.PI*2}));
    mountains=[];
    for(let x=0;x<W+200;x+=60+Math.random()*80){
      mountains.push({x,h:30+Math.random()*50,w:50+Math.random()*60});
    }
    groundDots=[];
    for(let x=0;x<W+100;x+=8+Math.random()*15){
      groundDots.push({x,y:groundY+8+Math.random()*35,s:Math.random()*2+.5});
    }
  }

  // --- SFX (Web Audio) ---
  function sfxJump(){
    if(!STATE.soundOn)return;
    try{const ctx=getAudio(),o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);o.type='sine';
    o.frequency.setValueAtTime(400,ctx.currentTime);
    o.frequency.linearRampToValueAtTime(800,ctx.currentTime+0.1);
    g.gain.setValueAtTime(0.2*STATE.volume,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.12);
    o.start();o.stop(ctx.currentTime+0.12);}catch(e){}
  }
  function sfxDie(){
    if(!STATE.soundOn)return;
    try{const ctx=getAudio(),o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);o.type='sawtooth';
    o.frequency.setValueAtTime(500,ctx.currentTime);
    o.frequency.linearRampToValueAtTime(80,ctx.currentTime+0.4);
    g.gain.setValueAtTime(0.3*STATE.volume,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);
    o.start();o.stop(ctx.currentTime+0.4);}catch(e){}
  }
  function sfxMilestone(){
    if(!STATE.soundOn)return;
    try{const ctx=getAudio();
    [600,800,1000].forEach((f,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);o.type='sine';
      o.frequency.setValueAtTime(f,ctx.currentTime+i*0.08);
      g.gain.setValueAtTime(0.2*STATE.volume,ctx.currentTime+i*0.08);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.08+0.15);
      o.start(ctx.currentTime+i*0.08);o.stop(ctx.currentTime+i*0.08+0.15);
    });}catch(e){}
  }
  function bgPulse(){
    if(!STATE.soundOn)return;
    try{const ctx=getAudio(),o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);o.type='sine';
    o.frequency.setValueAtTime(55,ctx.currentTime);
    g.gain.setValueAtTime(0.06*STATE.volume,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.15);
    o.start();o.stop(ctx.currentTime+0.15);}catch(e){}
  }

  // --- jump ---
  function jump(){
    if(state==='idle'){state='playing'; score=0; frameCount=0; gameSpeed=5; obstacles=[]; pteros=[];spawnCooldown=60;}
    if(state==='dead')return;
    if(jumpsLeft>0){
      dino.vy=jumpsLeft===2?JUMP_FORCE:DOUBLE_JUMP_FORCE;
      dino.onGround=false;
      jumpsLeft--;
      sfxJump();
      // dust on first jump from ground
      if(jumpsLeft===1){
        for(let i=0;i<6;i++) dustParts.push({x:dino.x+Math.random()*20-10,y:groundY,vx:(Math.random()-.5)*3,vy:-Math.random()*2-1,life:20+Math.random()*10});
      }
    }
  }

  // --- draw dino ---
  function drawDino(ctx){
    const dx=dino.x, dy=dino.y;
    ctx.save();
    // death animation
    if(state==='dead'){
      ctx.translate(dx+dino.w/2,dy-dino.h/2);
      ctx.rotate(deathSpin);
      ctx.translate(-(dx+dino.w/2),-(dy-dino.h/2));
      if(Math.floor(deathFlashTimer/4)%2===0){
        ctx.shadowColor='#ff0000';ctx.shadowBlur=20;
      }
    }
    // body color
    const bodyColor=state==='dead'&&Math.floor(deathFlashTimer/4)%2===0?'#ff4444':'#00ff88';
    const outlineColor='#004422';

    ctx.shadowColor='#00ff88';ctx.shadowBlur=state==='dead'?5:12;

    // idle breathing
    let breathOffset=0;
    if(state==='idle'){breathOffset=Math.sin(dinoBreathPhase)*2;}

    // body
    const bx=dx, by=dy-dino.h+breathOffset;
    ctx.fillStyle=bodyColor;
    ctx.strokeStyle=outlineColor;ctx.lineWidth=2;
    // torso
    rr(ctx,bx+6,by+10,28,28,6);
    ctx.fill();ctx.stroke();
    // head
    rr(ctx,bx+14,by-6,22,20,5);
    ctx.fill();ctx.stroke();
    // eye
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bx+28,by+2,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#000';ctx.beginPath();ctx.arc(bx+29,by+2,2,0,Math.PI*2);ctx.fill();
    // mouth
    ctx.strokeStyle='#004422';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(bx+34,by+8);ctx.lineTo(bx+36,by+8);ctx.stroke();

    // tail
    ctx.fillStyle=bodyColor;ctx.strokeStyle=outlineColor;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(bx+6,by+15);ctx.lineTo(bx-8,by+8);ctx.lineTo(bx-4,by+18);ctx.closePath();ctx.fill();ctx.stroke();

    // legs (animated)
    const legY=by+36;
    if(dino.onGround&&state==='playing'){
      dinoAnimTimer++;
      if(dinoAnimTimer>6){dinoAnimTimer=0;dinoAnimFrame=(dinoAnimFrame+1)%4;}
      const offsets=[[0,4],[4,0],[0,-2],[-2,0]];
      const loff=offsets[dinoAnimFrame];
      // left leg
      ctx.fillStyle=bodyColor;ctx.strokeStyle=outlineColor;
      ctx.fillRect(bx+10,legY+loff[0],6,10);ctx.strokeRect(bx+10,legY+loff[0],6,10);
      // right leg
      ctx.fillRect(bx+24,legY+loff[1],6,10);ctx.strokeRect(bx+24,legY+loff[1],6,10);
    } else if(!dino.onGround){
      // tucked legs
      ctx.fillStyle=bodyColor;ctx.strokeStyle=outlineColor;
      ctx.fillRect(bx+12,legY-4,6,8);ctx.strokeRect(bx+12,legY-4,6,8);
      ctx.fillRect(bx+22,legY-4,6,8);ctx.strokeRect(bx+22,legY-4,6,8);
    } else {
      // idle legs
      ctx.fillStyle=bodyColor;ctx.strokeStyle=outlineColor;
      ctx.fillRect(bx+10,legY+Math.sin(dinoBreathPhase)*1,6,10);ctx.strokeRect(bx+10,legY+Math.sin(dinoBreathPhase)*1,6,10);
      ctx.fillRect(bx+24,legY+Math.sin(dinoBreathPhase+1)*1,6,10);ctx.strokeRect(bx+24,legY+Math.sin(dinoBreathPhase+1)*1,6,10);
    }

    // arms
    ctx.fillStyle=bodyColor;ctx.strokeStyle=outlineColor;ctx.lineWidth=1.5;
    ctx.fillRect(bx+30,by+14,4,10);ctx.strokeRect(bx+30,by+14,4,10);

    ctx.shadowBlur=0;
    ctx.restore();
  }

  // --- draw cactus ---
  function drawCactus(ctx,ob){
    ctx.save();
    ctx.shadowColor='#ff00ff';ctx.shadowBlur=10;
    const cx=ob.x,cy=groundY;
    if(ob.variant===1){
      // single cactus
      ctx.fillStyle='#cc00ff';ctx.strokeStyle='#660088';ctx.lineWidth=2;
      rr(ctx,cx,cy-ob.h,16,ob.h,3);ctx.fill();ctx.stroke();
      // spines
      ctx.fillStyle='#ff66ff';
      ctx.fillRect(cx-4,cy-ob.h+10,4,2);
      ctx.fillRect(cx+16,cy-ob.h+20,4,2);
    }else if(ob.variant===2){
      // double cactus
      ctx.fillStyle='#cc00ff';ctx.strokeStyle='#660088';ctx.lineWidth=2;
      rr(ctx,cx,cy-ob.h,14,ob.h,3);ctx.fill();ctx.stroke();
      rr(ctx,cx+18,cy-ob.h+10,14,ob.h-10,3);ctx.fill();ctx.stroke();
      ctx.fillRect(cx+14,cy-ob.h+15,4,4);
    }else{
      // triple cactus
      ctx.fillStyle='#cc00ff';ctx.strokeStyle='#660088';ctx.lineWidth=2;
      rr(ctx,cx,cy-ob.h+5,12,ob.h-5,3);ctx.fill();ctx.stroke();
      rr(ctx,cx+14,cy-ob.h,14,ob.h,3);ctx.fill();ctx.stroke();
      rr(ctx,cx+30,cy-ob.h+8,12,ob.h-8,3);ctx.fill();ctx.stroke();
      ctx.fillRect(cx+12,cy-ob.h+12,2,4);ctx.fillRect(cx+28,cy-ob.h+10,2,4);
    }
    ctx.shadowBlur=0;
    ctx.restore();
  }

  // --- draw ptero ---
  function drawPtero(ctx,pt){
    ctx.save();
    ctx.shadowColor='#00ffff';ctx.shadowBlur=12;
    ctx.fillStyle='#00e5ff';ctx.strokeStyle='#005566';ctx.lineWidth=1.5;
    const px=pt.x,py=pt.y;
    const wingFlap=Math.sin(frameCount*0.15)*12;
    // body
    ctx.beginPath();ctx.ellipse(px,py,16,8,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    // beak
    ctx.beginPath();ctx.moveTo(px+16,py-2);ctx.lineTo(px+26,py);ctx.lineTo(px+16,py+2);ctx.closePath();ctx.fill();
    // eye
    ctx.fillStyle='#000';ctx.beginPath();ctx.arc(px+10,py-2,2,0,Math.PI*2);ctx.fill();
    // wings
    ctx.fillStyle='#00e5ff';ctx.strokeStyle='#005566';
    ctx.beginPath();ctx.moveTo(px-4,py-4);ctx.lineTo(px-18,py-20+wingFlap);ctx.lineTo(px+6,py-4);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(px-4,py+4);ctx.lineTo(px-18,py+20-wingFlap);ctx.lineTo(px+6,py+4);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.shadowBlur=0;
    ctx.restore();
  }

  // --- spawn obstacles ---
  function spawnObstacle(){
    spawnCooldown-=gameSpeed;
    if(spawnCooldown>0)return;
    // decide what to spawn
    const spawnPtero=score>=300&&Math.random()<0.35;
    if(spawnPtero){
      const levels=[groundY-90,groundY-140,groundY-190];
      const py=levels[Math.floor(Math.random()*levels.length)];
      pteros.push({x:W+30,y:py,w:42,h:20});
    } else {
      const variant=Math.random()<0.5?1:(Math.random()<0.6?2:3);
      const h=30+Math.random()*20;
      const w=variant===1?16:variant===2?32:42;
      obstacles.push({x:W+10,h,w,variant});
    }
    // cooldown decreases as difficulty rises (more frequent obstacles)
    const minCD=Math.max(120,280-score*0.15);
    const maxCD=minCD+80;
    spawnCooldown=minCD+Math.random()*(maxCD-minCD);
  }

  // --- collision ---
  function checkCollision(){
    const dx=dino.x+8,dy=dino.y-dino.h+6,dw=dino.w-16,dh=dino.h-10;
    for(const ob of obstacles){
      if(dx<ob.x+ob.w&&dx+dw>ob.x&&dy+dh>groundY-ob.h&&dy<groundY){
        return true;
      }
    }
    for(const pt of pteros){
      if(dx<pt.x+20&&dx+dw>pt.x-16&&dy<pt.y+10&&dy+dh>pt.y-10){
        return true;
      }
    }
    return false;
  }

  // --- die ---
  function die(){
    state='dead';
    sfxDie();
    shakeTimer=18;shakeIntensity=6;
    deathSpin=0;deathFlashTimer=30;
    // death particles
    for(let i=0;i<30;i++){
      deathParts.push({
        x:dino.x+dino.w/2,y:dino.y-dino.h/2,
        vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8-3,
        life:40+Math.random()*20,
        color:['#00ff88','#ff00ff','#00e5ff','#ffff00'][Math.floor(Math.random()*4)],
        size:Math.random()*4+2
      });
    }
    // save high score
    if(score>hiScore){hiScore=score;localStorage.setItem('dinoJump_best',hiScore);}
    // delayed game over
    setTimeout(()=>{
      if(state==='dead'){
        const xpGained=Math.floor(score/10);
        addXp(xpGained);
        addToLeaderboard('Dino Jump',score);
        STATE.totalScore+=score;saveState();
        const isHigh=score>=hiScore;
        const overlay=document.getElementById('gameOverOverlay');
        document.getElementById('gameOverTitle').textContent=isHigh?'🏆 NEW HIGH SCORE!':'GAME OVER';
        document.getElementById('gameOverScore').textContent='Score: '+score;
        document.getElementById('gameOverExtra').innerHTML='+'+xpGained+' XP earned<br>Best: '+hiScore;
        overlay.classList.remove('hidden');
        if(isHigh)spawnConfetti();
        gameRunning=false;
      }
    },1200);
  }

  // --- update ---
  function update(){
    frameCount++;
    dinoBreathPhase+=0.05;

    // bg pulse
    bgPulseTimer++;
    if(bgPulseTimer>30){bgPulseTimer=0;bgPulsePhase=(bgPulsePhase+1)%4;if(state==='playing')bgPulse();}

    if(state==='idle')return;
    if(state==='dead'){
      deathSpin+=0.15;deathFlashTimer=Math.max(0,deathFlashTimer-1);
      deathParts=deathParts.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.15;p.life--;return p.life>0;});
      if(shakeTimer>0)shakeTimer--;
      return;
    }

    // scoring
    if(frameCount%10===0){
      score++;
      setScore(score);
      // milestone
      if(score%100===0&&score!==lastMilestone){
        lastMilestone=score;score+=10;
        sfxMilestone();
        showFloatingText(gameCanvasWrap,'🎉 '+score+' pts!');
      }
    }

    // difficulty
    gameSpeed=Math.min(maxSpeed,5+Math.floor(score/200)*0.5);
    speedBarPct=(gameSpeed-5)/(maxSpeed-5);

    // day/night
    dayNightPhase=(score/500)%3;

    // dino physics
    if(!dino.onGround){
      dino.vy+=GRAVITY;
      dino.y+=dino.vy;
      if(dino.y>=groundY){
        dino.y=groundY;dino.vy=0;dino.onGround=true;jumpsLeft=2;
        // land dust
        for(let i=0;i<4;i++) dustParts.push({x:dino.x+Math.random()*20-10,y:groundY,vx:(Math.random()-.5)*2,vy:-Math.random()*1.5-0.5,life:15+Math.random()*8});
      }
    }

    // spawn
    spawnObstacle();

    // move obstacles
    obstacles=obstacles.filter(ob=>{ob.x-=gameSpeed;return ob.x>-60;});
    pteros=pteros.filter(pt=>{pt.x-=gameSpeed+1;return pt.x>-60;});

    // collision
    if(checkCollision()) die();

    // particles
    dustParts=dustParts.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.life--;return p.life>0;});

    // speed lines
    if(gameSpeed>8&&Math.random()<0.3){
      speedLines.push({x:W,y:Math.random()*(groundY-20),len:20+Math.random()*40,life:15});
    }
    speedLines=speedLines.filter(l=>{l.x-=gameSpeed*2;l.life--;return l.life>0;});

    // parallax
    stars.forEach(s=>{s.x-=gameSpeed*0.1;s.twinkle+=0.03;if(s.x<-5){s.x=W+5;s.y=Math.random()*(groundY-40);}});
    mountains.forEach(m=>{m.x-=gameSpeed*0.3;if(m.x<-m.w){m.x=W+Math.random()*100;}});
    groundDots.forEach(d=>{d.x-=gameSpeed*0.8;if(d.x<-5){d.x=W+Math.random()*50;}});
  }

  // --- draw ---
  function draw(){
    const ctx=gCtx;
    W=gameCanvas.width;H=gameCanvas.height;
    groundY=H-GROUND_Y_OFFSET;

    ctx.save();
    if(shakeTimer>0){
      const sx=(Math.random()-.5)*shakeIntensity*(shakeTimer/18);
      const sy=(Math.random()-.5)*shakeIntensity*(shakeTimer/18);
      ctx.translate(sx,sy);
    }

    // background - day/night cycle
    let bgColor;
    const phase=dayNightPhase%3;
    if(phase<1) bgColor=lerpColor([10,10,15],[10,15,40],phase);
    else if(phase<2) bgColor=lerpColor([10,15,40],[25,10,35],phase-1);
    else bgColor=lerpColor([25,10,35],[10,10,15],phase-2);
    ctx.fillStyle=`rgb(${bgColor[0]},${bgColor[1]},${bgColor[2]})`;
    ctx.fillRect(0,0,W,H);

    // stars layer
    stars.forEach(s=>{
      const a=0.3+Math.sin(s.twinkle)*0.3;
      ctx.fillStyle=`rgba(255,255,255,${a})`;
      ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,Math.PI*2);ctx.fill();
    });

    // mountains layer
    ctx.fillStyle='rgba(40,15,60,0.6)';
    mountains.forEach(m=>{
      ctx.beginPath();
      ctx.moveTo(m.x,groundY);
      ctx.lineTo(m.x+m.w/2,groundY-m.h);
      ctx.lineTo(m.x+m.w,groundY);
      ctx.closePath();ctx.fill();
    });

    // speed lines
    speedLines.forEach(l=>{
      ctx.strokeStyle=`rgba(255,255,255,${l.life/15*0.3})`;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(l.x+l.len,l.y);ctx.stroke();
    });

    // ground line (neon glow)
    ctx.save();
    ctx.shadowColor='#00ff88';ctx.shadowBlur=15;
    ctx.strokeStyle='#00ff88';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(0,groundY+2);ctx.lineTo(W,groundY+2);ctx.stroke();
    ctx.shadowBlur=0;ctx.restore();

    // ground dots
    groundDots.forEach(d=>{
      ctx.fillStyle='rgba(0,255,136,0.15)';
      ctx.beginPath();ctx.arc(d.x,d.y,d.s,0,Math.PI*2);ctx.fill();
    });

    // obstacles
    obstacles.forEach(ob=>drawCactus(ctx,ob));
    pteros.forEach(pt=>drawPtero(ctx,pt));

    // dust
    dustParts.forEach(p=>{
      ctx.fillStyle=`rgba(0,255,136,${p.life/25})`;
      ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);ctx.fill();
    });

    // death particles
    deathParts.forEach(p=>{
      ctx.globalAlpha=p.life/60;
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
    });

    // dino
    drawDino(ctx);

    // HUD on canvas
    ctx.save();
    ctx.shadowColor='#00ff88';ctx.shadowBlur=8;
    ctx.fillStyle='#00ff88';ctx.font='bold 16px Orbitron,monospace';ctx.textAlign='left';
    ctx.fillText('SCORE: '+score,15,30);
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='12px Orbitron,monospace';ctx.textAlign='right';
    ctx.fillText('HI: '+hiScore,W-15,30);
    ctx.shadowBlur=0;

    // speed bar
    ctx.fillStyle='rgba(255,255,255,0.15)';
    ctx.fillRect(15,H-20,100,6);
    ctx.fillStyle='#00ff88';
    ctx.fillRect(15,H-20,100*speedBarPct,6);
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px Orbitron,monospace';ctx.textAlign='left';
    ctx.fillText('SPD',120,H-15);
    ctx.restore();

    // idle text
    if(state==='idle'){
      ctx.save();ctx.shadowColor='#00ff88';ctx.shadowBlur=15;
      ctx.fillStyle=Math.floor(frameCount/30)%2===0?'#00ff88':'rgba(0,255,136,0.3)';
      ctx.font='bold 18px Orbitron,monospace';ctx.textAlign='center';
      ctx.fillText('PRESS SPACE TO START',W/2,H/2-20);
      ctx.shadowBlur=0;ctx.restore();
    }

    ctx.restore(); // shake
  }

  function lerpColor(a,b,t){return[Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),Math.round(a[2]+(b[2]-a[2])*t)];}

  // --- main loop ---
  function loop(){
    if(!gameRunning)return;
    if(!gamePaused){update();}
    draw();
    gameLoop=requestAnimationFrame(loop);
  }

  return {
    start(){
      reset();
      setScore(0);setLives(0);
      document.getElementById('hudLives').textContent='🦕';
      resetCombo();
      gameLoop=requestAnimationFrame(loop);
    },
    jump:jump
  };
})();

// Whack click handler
gameCanvas.addEventListener('click',e=>{
  if(currentGame==='whack'&&gameRunning&&!gamePaused){
    const r=gameCanvas.getBoundingClientRect();
    const sx=gameCanvas.width/r.width,sy=gameCanvas.height/r.height;
    GAMES.whack.click((e.clientX-r.left)*sx,(e.clientY-r.top)*sy);
  }
});
gameCanvas.addEventListener('touchstart',e=>{
  if(currentGame==='whack'&&gameRunning&&!gamePaused){
    e.preventDefault();
    const r=gameCanvas.getBoundingClientRect(),t=e.touches[0];
    const sx=gameCanvas.width/r.width,sy=gameCanvas.height/r.height;
    GAMES.whack.click((t.clientX-r.left)*sx,(t.clientY-r.top)*sy);
  }
},{passive:false});

// Flappy click (exclude whack)
gameCanvas.addEventListener('click',e=>{if(currentGame==='flappy')GAMES.flappy.flap()});
gameCanvas.addEventListener('touchstart',e=>{if(currentGame==='flappy'){e.preventDefault();GAMES.flappy.flap()}},{passive:false});

// Dino jump handlers
document.addEventListener('keydown',e=>{
  if(currentGame==='dino'&&gameRunning&&!gamePaused&&(e.key===' '||e.key==='ArrowUp')){e.preventDefault();GAMES.dino.jump();}
});
gameCanvas.addEventListener('click',e=>{if(currentGame==='dino'&&gameRunning&&!gamePaused)GAMES.dino.jump()});
gameCanvas.addEventListener('touchstart',e=>{if(currentGame==='dino'&&gameRunning&&!gamePaused){e.preventDefault();GAMES.dino.jump()}},{passive:false});

// ===== TWEMOJI AUTO-PARSE =====
function parseEmoji(el){if(typeof twemoji!=='undefined')twemoji.parse(el||document.body,{folder:'svg',ext:'.svg'});}
// MutationObserver: auto-parse any newly added DOM nodes
(function(){
  let parseTimer=null;
  const observer=new MutationObserver(()=>{
    if(parseTimer)clearTimeout(parseTimer);
    parseTimer=setTimeout(()=>parseEmoji(document.body),50);
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  // Initial parse
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>parseEmoji())}else{parseEmoji()}
})();

// ===== START =====
window.addEventListener('load',()=>{
  if(STATE.name){
    loadHub();showScreen('hub-screen');
  }else{
    runLoading();
  }
});
window.addEventListener('resize',()=>{if(gameRunning)resizeCanvas()});
// ===== ARCADE SPIN WHEEL LOGIC =====
let currentWheelRotation = 0;
let spunGameId = ''; // Stores the ID of the winning game

const spinBtn = document.getElementById('spinBtn');
const wheelOverlay = document.getElementById('wheelOverlay');
const winnerOverlay = document.getElementById('winnerOverlay');
const openWheelBtn = document.getElementById('openWheelBtn');
const closeWheelBtn = document.getElementById('closeWheelBtn');
const closeWinnerBtn = document.getElementById('closeWinnerBtn');

// Open/Close Modals
if(openWheelBtn) openWheelBtn.onclick = () => wheelOverlay.classList.remove('hidden');
if(closeWheelBtn) closeWheelBtn.onclick = () => wheelOverlay.classList.add('hidden');

// "PLAY NOW" Button Logic
if(closeWinnerBtn) {
    closeWinnerBtn.onclick = () => {
        winnerOverlay.classList.add('hidden'); // Hide the winner popup
        
        // Launch the game! (Unless it's Zombie Shooter, which is locked)
        if(spunGameId === 'zombie') {
            alert("🧟 Zombie Shooter is coming soon! Try spinning again.");
        } else if (spunGameId) {
            launchGame(spunGameId);
        }
    };
}

// The Spin
if(spinBtn) {
    spinBtn.onclick = () => {
        // Disable button while spinning
        spinBtn.disabled = true;
        spinBtn.style.opacity = '0.5';
        
        const wheel = document.getElementById('spinWheel');
        const randomSpin = Math.floor(Math.random() * 360) + 1800; 
        currentWheelRotation += randomSpin;
        wheel.style.transform = `rotate(${currentWheelRotation}deg)`;
        
        // Wait for CSS transition (4 seconds)
        setTimeout(() => {
            const finalAngle = currentWheelRotation % 360;
            const pointerAngle = (360 - finalAngle) % 360;
            const winningSlice = Math.floor(pointerAngle / 60);
            
            // The display names for the popup
            const games = [
                "🚀 SPACE SHOOTER", "🐦 FLAPPY BIRD", "☄️ ASTEROID DODGE", 
                "🐻 WHACK A BEAR", "🦕 DINO JUMP", "🧟 ZOMBIE SHOOTER"
            ];
            
            // The internal IDs used by your launchGame() function
            const gameIds = [
                "space", "flappy", "asteroid", 
                "whack", "dino", "zombie"
            ];
            
            // Hide Wheel, Show Winner Pop-up
            wheelOverlay.classList.add('hidden');
            
            document.getElementById('winnerName').textContent = games[winningSlice];
            spunGameId = gameIds[winningSlice]; // Save the winning ID to the variable!
            
            winnerOverlay.classList.remove('hidden');
            
            // Audio & Visual Effects
            if (typeof SFX !== 'undefined' && SFX.levelUp) SFX.levelUp();
            if (typeof spawnConfetti === 'function') spawnConfetti();
            
            // Re-enable spin button for next time
            spinBtn.disabled = false;
            spinBtn.style.opacity = '1';
            
        }, 4000); 
    };
}