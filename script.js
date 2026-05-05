const STATE = {
  name: '',
  avatar: '',
  level: 'beginner',
  xp: 0,
  gamesPlayed: 0,
  bestCombo: 0,
  totalScore: 0,
  soundOn: true,
  volume: 0.5,
  bestScores: {space:0,flappy:0,asteroid:0,whack:0,dino:0,zombie:0},

  leaderboard: [],
  emojiAvatar: '🎮',
  theme: 'default',
  

};
const ACHIEVEMENTS_LIST = [
  { id: 'arcade_rookie', name: 'Arcade Rookie', desc: 'Play 10 total games.', icon: '🕹️' },
  { id: 'combo_king', name: 'Combo King', desc: 'Reach a 15x combo in any game.', icon: '💥' },
  { id: 'space_commander', name: 'Space Commander', desc: 'Score over 500 points in Space Shooter.', icon: '🚀' },
  { id: 'legendary_gamer', name: 'Legendary Gamer', desc: 'Reach the "LEGEND" rank via XP.', icon: '🏆' }
];

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
  select:()=>{playTone(600,'sine',0.08,0.1);setTimeout(()=>playTone(900,'sine',0.06,0.08),60)}
};

// ===== PARTICLE BACKGROUND =====
const pbCanvas=document.getElementById('particle-bg');
const pbCtx=pbCanvas?pbCanvas.getContext('2d'):null;
let particles=[],mouse={x:0,y:0};
function resizeParticles(){
  if(!pbCanvas)return;
  pbCanvas.width=window.innerWidth;pbCanvas.height=window.innerHeight
}
function initParticles(){
  if(!pbCanvas)return;
  particles=[];
  const n=Math.min(80,Math.floor(window.innerWidth*window.innerHeight/12000));
  for(let i=0;i<n;i++)particles.push({
    x:Math.random()*pbCanvas.width,y:Math.random()*pbCanvas.height,
    vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,
    r:Math.random()*2+1,alpha:Math.random()*.5+.1
  });
}
function drawParticles(){
  if(!pbCtx||!pbCanvas)return;
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
function loadState(){
  const s=localStorage.getItem('hw_state');
  if(s){const d=JSON.parse(s);Object.assign(STATE,d)}
}
loadState();

// ====================== MULTI-THEME SYSTEM ======================
const THEMES = {
    default: { name: "Default",     icon: "🌌", next: "sea" },
    sea:     { name: "Deep Sea",    icon: "🌊", next: "sunset" },
    sunset:  { name: "Sunset",      icon: "🌅", next: "pixel" },
    pixel:   { name: "Pixel",       icon: "🟩", next: "default" }
};

function applyTheme(theme) {
    if (!THEMES[theme]) theme = "default";

    // Remove all theme classes
    document.body.classList.remove('theme-sea', 'theme-sunset', 'theme-pixel');

    // Add new theme class (default has no class)
    if (theme !== "default") {
        document.body.classList.add(`theme-${theme}`);
    }

    STATE.theme = theme;
    saveState();
    updateThemeButton();
}

function cycleTheme() {
    const current = STATE.theme || "default";
    const nextTheme = THEMES[current].next;
    applyTheme(nextTheme);
    SFX.click();
}

function updateThemeButton() {
    const btn = document.getElementById('themeToggleNav');
    if (!btn) return;
    const t = THEMES[STATE.theme] || THEMES.default;
    btn.innerHTML = `${t.icon} <span>${t.name}</span>`;
}
applyTheme(STATE.theme || "default");

// ===== HUB =====
function getRank(){return LEVELS_XP.find(l=>STATE.xp>=l.min&&STATE.xp<l.max)||LEVELS_XP[0]}
function getRankClass(name){return{ROOKIE:'rank-rookie',PLAYER:'rank-player',PRO:'rank-pro',LEGEND:'rank-legend'}[name]}
function loadHub(){
  document.getElementById('navName').textContent=STATE.name;
  document.getElementById('navBest').textContent=Math.max(...Object.values(STATE.bestScores),0);
  document.getElementById('hubAvatar').src=STATE.avatar;
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
  document.getElementById('totalScore').textContent=STATE.totalScore;
  document.getElementById('totalGames').textContent=STATE.gamesPlayed;
  document.getElementById('bestCombo').textContent=STATE.bestCombo+'x';
  document.getElementById('totalXp').textContent=STATE.xp;
  document.querySelectorAll('.best-score').forEach(el=>{el.textContent=STATE.bestScores[el.dataset.game]||0});
  renderLeaderboard();
  renderLeaderboard();
  renderAchievements();
  document.getElementById('settingsName').value=STATE.name;
  document.getElementById('soundToggle').classList.toggle('on',STATE.soundOn);
  document.getElementById('soundToggleNav').textContent=STATE.soundOn?'🔊':'🔇';
  document.getElementById('volumeSlider').value=STATE.volume;
  applyTheme(STATE.theme || "default");
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
function renderAchievements(){
  const list = document.getElementById('achievementsList');
  if(!list) return;
  list.innerHTML = '';
  ACHIEVEMENTS_LIST.forEach(ach => {
    const unlocked = STATE.achievements && STATE.achievements.includes(ach.id);
    const div = document.createElement('div');
    div.className = 'achievement-item' + (unlocked ? ' unlocked' : ' locked');
    div.innerHTML = `
      <div class="achievement-icon">${ach.icon}</div>
      <div class="achievement-info">
        <div class="achievement-name">${ach.name}</div>
        <div class="achievement-desc">${ach.desc}</div>
      </div>
    `;
    list.appendChild(div);
  });
}
function showAchievementPopup(ach) {
  SFX.levelUp();
  spawnConfetti();
  const container = document.getElementById('achievement-toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="toast-icon">${ach.icon}</div>
    <div class="toast-content">
      <div class="toast-title">Achievement Unlocked!</div>
      <div class="toast-name">${ach.name}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 600);
  }, 4000);
}
function checkAchievements() {
  if (!STATE.achievements) STATE.achievements = [];
  let changed = false;
  ACHIEVEMENTS_LIST.forEach(ach => {
    if (!STATE.achievements.includes(ach.id)) {
      let unlocked = false;
      if (ach.id === 'arcade_rookie' && STATE.gamesPlayed >= 10) unlocked = true;
      if (ach.id === 'combo_king' && STATE.bestCombo >= 15) unlocked = true;
      if (ach.id === 'space_commander' && STATE.bestScores.space >= 500) unlocked = true;
      if (ach.id === 'legendary_gamer' && getRank().name === 'LEGEND') unlocked = true;
      if (unlocked) {
        STATE.achievements.push(ach.id);
        changed = true;
        showAchievementPopup(ach);
      }
    }
  });
  if (changed) {
    saveState();
    renderAchievements();
  }
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
  if(curr.name!==prev.name){SFX.levelUp();showFloatingText(gameCanvasWrap,'🎉 RANK UP: '+curr.name+'!',true)}
  checkAchievements();
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
  saveState();
};
document.getElementById('soundToggleNav').onclick=()=>document.getElementById('soundToggle').click();
document.getElementById('themeToggleNav').onclick=()=>{
  cycleTheme();
};
document.getElementById('volumeSlider').oninput=function(){STATE.volume=+this.value;saveState()};
document.getElementById('saveName').onclick=()=>{
  const n=document.getElementById('settingsName').value.trim();
  if(n){STATE.name=n;saveState();loadHub();SFX.select()}
};
document.getElementById('resetScores').onclick=()=>{
  if(confirm('Reset all scores and XP? This cannot be undone.')){
    STATE.xp=0;STATE.gamesPlayed=0;STATE.bestCombo=0;STATE.totalScore=0;
    STATE.bestScores={space:0,flappy:0,asteroid:0,whack:0,dino:0,zombie:0};STATE.leaderboard=[];
    STATE.achievements=[];
    saveState();loadHub();SFX.hit();
  }
};

// ===== GAME LAUNCH =====
document.getElementById('gamesGrid').addEventListener('click',e=>{
  // Only trigger if clicking the Play Now button, not the entire card
  const btn=e.target.closest('.play-now-btn');
  if(!btn)return;
  
  const card=btn.closest('.game-card');
  if(!card)return;
  
  const game=card.dataset.game;
  if(!game||card.classList.contains('locked'))return;
  
  SFX.select();
  launchGame(game);
});
document.getElementById('backToHub').onclick=()=>{stopGame();showMobileControls('');showScreen('hub-screen');loadHub()};
document.getElementById('pauseBtn').onclick=togglePause;
document.getElementById('resumeBtn').onclick=togglePause;
document.getElementById('restartBtn').onclick=()=>{togglePause();setTimeout(()=>launchGame(currentGame),100)};
document.getElementById('quitBtn').onclick=()=>{stopGame();showMobileControls('');showScreen('hub-screen');loadHub()};
document.getElementById('playAgainBtn').onclick=()=>{document.getElementById('gameOverOverlay').classList.add('hidden');launchGame(currentGame)};
document.getElementById('goHubBtn').onclick=()=>{stopGame();showMobileControls('');showScreen('hub-screen');loadHub()};

let currentGame='',gamePaused=false,gameRunning=false,gameLoop=null;
const gameCanvasWrap=document.getElementById('gameCanvasWrap');
const gameCanvas=document.getElementById('gameCanvas');
const dinoMobileHint=document.getElementById('dinoMobileHint');
const gCtx=gameCanvas?gameCanvas.getContext('2d'):null;
const DINO_MOBILE_PLAY_RATIO=0.62;
const DINO_MOBILE_HUD_OFFSET=30;
const DINO_MOBILE_TAP_HINT_Y=20;
const DINO_MOBILE_TAP_HINT='TAP UPPER AREA';
const DINO_MOBILE_IDLE_HINT='TAP TOP AREA TO START';

function isMobileViewport(){return window.matchMedia('(max-width: 768px)').matches}
function updateDinoMobileLayout(){
  const gameScreenVisible=!document.getElementById('game-screen').classList.contains('hidden');
  const enabled=gameScreenVisible&&currentGame==='dino'&&isMobileViewport();
  gameCanvasWrap.classList.toggle('dino-mobile-split',enabled);
  gameCanvasWrap.style.setProperty('--dino-mobile-split-pct',`${DINO_MOBILE_PLAY_RATIO*100}%`);
  if(dinoMobileHint)dinoMobileHint.hidden=!enabled;
}

function resizeCanvas(){
  gameCanvas.width=gameCanvasWrap.clientWidth;
  gameCanvas.height=gameCanvasWrap.clientHeight;
  updateDinoMobileLayout();
}
function stopGame(){
  gameRunning=false;gamePaused=false;if(gameLoop)cancelAnimationFrame(gameLoop);gameLoop=null;
  gameCanvasWrap.classList.remove('dino-mobile-split');
  
  clearGame();
}
function togglePause(){
  gamePaused=!gamePaused;
  document.getElementById('pauseOverlay').classList.toggle('hidden',!gamePaused);
  document.getElementById('pauseBtn').textContent=gamePaused?'▶':'⏸';
}
function launchGame(game){
  currentGame=game;stopGame();
  document.getElementById('hudGameName').textContent={space:'SPACE SHOOTER',flappy:'FLAPPY BIRD',asteroid:'ASTEROID DODGE',whack:'WHACK-A-MOLE',dino:'DINO JUMP',zombie:'ZOMBIE SHOOTER'}[game];
  document.getElementById('pauseOverlay').classList.add('hidden');
  document.getElementById('gameOverOverlay').classList.add('hidden');
  document.getElementById('spaceTutorial').classList.add('hidden');
  document.getElementById('asteroidTutorial').classList.add('hidden');
  if(document.getElementById('zombieTutorial'))document.getElementById('zombieTutorial').classList.add('hidden');
  showScreen('game-screen');
  requestAnimationFrame(()=>resizeCanvas());
  showMobileControls(game);

  // Space Shooter: show tutorial on desktop before starting
  if(game==='space'&&!('ontouchstart' in window)){
    document.getElementById('spaceTutorial').classList.remove('hidden');
    return; // game starts after Continue click
  }

  // Asteroid Dodge: show tutorial on desktop before starting
  if(game==='asteroid'&&!('ontouchstart' in window)){
    document.getElementById('asteroidTutorial').classList.remove('hidden');
    return; // game starts after Continue click
  }

  // Zombie Shooter: show tutorial on desktop before starting
  if(game==='zombie'&&!('ontouchstart' in window)){
    if(document.getElementById('zombieTutorial'))document.getElementById('zombieTutorial').classList.remove('hidden');
    return; // game starts after Continue click
  }

  gameRunning=true;
  STATE.gamesPlayed++;saveState();
  checkAchievements();
  GAMES[game]?.start();
}

// Space tutorial continue button
document.getElementById('spaceTutorialBtn').onclick=()=>{
  document.getElementById('spaceTutorial').classList.add('hidden');
  gameRunning=true;
  STATE.gamesPlayed++;saveState();
  checkAchievements();
  GAMES.space?.start();
};

// Asteroid tutorial continue button
document.getElementById('asteroidTutorialBtn').onclick=()=>{
  document.getElementById('asteroidTutorial').classList.add('hidden');
  gameRunning=true;
  STATE.gamesPlayed++;saveState();
  GAMES.asteroid?.start();
};

// Zombie tutorial continue button
if(document.getElementById('zombieTutorialBtn')){
  document.getElementById('zombieTutorialBtn').onclick=()=>{
    document.getElementById('zombieTutorial').classList.add('hidden');
    gameRunning=true;
    STATE.gamesPlayed++;saveState();
    GAMES.zombie?.start();
  };
}

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
  const xpGained=Math.floor(score/2)+STATE.gamesPlayed*5;
  addXp(xpGained);STATE.totalScore+=score;saveState();
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
document.addEventListener('keydown',e=>{
  keys[e.key]=true;
  if(e.key===' ')e.preventDefault();
});
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
  const map={space:'mobileSpace',asteroid:'mobileAsteroid',zombie:'mobileZombie'};
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
  checkAchievements();
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
function updateXPDisplay(xp){
  const xpPercent=Math.min(100,Math.floor((xp/50)*100));
  document.getElementById('hudLives').innerHTML=`<div style="text-align:center"><div style="font-size:12px;color:#EC4899;font-weight:bold;margin-bottom:4px">💎 XP</div><div style="background:#EF4444;height:6px;width:100px;border:2px solid #FFF;border-radius:3px;margin:0 auto;position:relative;overflow:hidden"><div style="background:#22C55E;height:100%;width:${xpPercent}%;transition:width 0.2s"></div></div><div style="font-size:10px;color:#FFF;margin-top:2px">${xp}/50</div></div>`;
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
  player:null,lastMilestone:0,surpriseFlash:0,surpriseFlashColor:'#fff',freeze:0,enemyBullets:[],

  start(){
    const W=gameCanvas.width,H=gameCanvas.height;
    this.score=0;this.lives=5;this.gameTime=0;this.diffLevel=0;this.bombs=0;
    this.tripleShot=false;this.tripleShotTimer=0;this.bigBullet=false;this.bigBulletTimer=0;
    this.bullets=[];this.enemies=[];this.particles=[];this.powerups=[];this.enemyBullets=[];this.freeze=0;
    this.nextPUTime=300+Math.floor(Math.random()*180);this.maxE=3;
    this.puMsg='';this.puMsgTimer=0;this.bombFlash=0;this.lastMilestone=0;this.surpriseFlash=0;
    this.player={x:W/2,y:H-80,w:64,h:64,vx:0,vy:0,acc:1.2,fric:0.88,maxSpd:12,invincible:0,xp:0};
    this.stars=Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+.5,v:Math.random()*.8+.2}));
    setScore(0);updateXPDisplay(0);resetCombo();
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
    const types=['straight','zigzag','orbit','flanker'];
    const mt=types[Math.floor(Math.random()*types.length)];
    const rand=Math.random();
    const eType=rand<0.5?'yellow':rand<0.8?'darkRed':rand<0.95?'white':'blue';
    const isBigBlue=eType==='blue';
    const enemy={
      w:isBigBlue?48:32,h:isBigBlue?48:32,moveType:mt,vy:spd,frame:0,type:eType,
      amplitude:Math.random()*40+20,frequency:Math.random()*0.03+0.01,
      phase:Math.random()*Math.PI*2,hp:isBigBlue?3:1,maxHp:isBigBlue?3:1,shootCooldown:0
    };
    if(mt==='flanker'){
      enemy.y=-32;
      const fromLeft=Math.random()<0.5;
      enemy.x=fromLeft?-32:W+32;
      enemy.vx=fromLeft?spd*1.5:-spd*1.5;
      enemy.targetX=0;
    }else if(mt==='orbit'){
      enemy.x=Math.random()*(W-64)+32;
      enemy.y=-32;
      enemy.orbitX=enemy.x;
      enemy.orbitY=100+Math.random()*150;
      enemy.orbitRadius=30+Math.random()*40;
      enemy.orbitDuration=150+Math.random()*100;
      enemy.vx=0;
    }else{
      enemy.x=Math.random()*(W-32);
      enemy.y=-32;
      enemy.baseX=enemy.x;
      enemy.vx=(Math.random()-.5)*2;
    }
    this.enemies.push(enemy);
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
    if(keys[' ']&&this.gameTime%8===0&&this.freeze<=0)this.fireBullets();
    if(this.freeze>0)this.freeze--;

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

    if(this.freeze<=0){
      if(keys['ArrowLeft'])p.vx-=p.acc;
      if(keys['ArrowRight'])p.vx+=p.acc;
      if(keys['ArrowUp'])p.vy-=p.acc;
      if(keys['ArrowDown'])p.vy+=p.acc;
    }
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
      e.frame++;e.shootCooldown--;
      if(e.moveType==='zigzag'){
        e.x=e.baseX+Math.sin(e.frame*e.frequency)*e.amplitude;
        e.y+=e.vy;
      }else if(e.moveType==='orbit'){
        if(e.frame<e.orbitDuration){
          e.y+=(e.orbitY-e.y)*0.05;
          e.x=e.orbitX+Math.cos(e.frame*0.05)*e.orbitRadius;
        }else{
          if(e.frame===Math.floor(e.orbitDuration)){
            const dx=(p.x+p.w/2)-(e.x+e.w/2);
            e.vx=dx>0?2:-2;
            e.vy=ds.speed*1.8;
          }
          e.x+=e.vx;e.y+=e.vy;
        }
      }else if(e.moveType==='flanker'){
        if(e.frame<100){
          e.x+=e.vx;
          e.y+=e.vy*0.5;
          const distToPlayerX=Math.abs(e.x-(p.x+p.w/2));
          if(distToPlayerX<30) e.vx*=0.8;
        }else{
          e.y+=ds.speed*2;
        }
      }else{
        e.x+=e.vx;if(e.x<0||e.x>W-32)e.vx*=-1;
        e.y+=e.vy;
      }

      const canShoot=(e.type==='darkRed'||e.type==='white'||e.type==='blue');
      const shootChance=canShoot?0.003+this.diffLevel*0.002:0;
      if(e.shootCooldown<=0&&Math.random()<shootChance && e.y>0 && e.y<H/2){
        if(e.type==='white'){
          this.enemyBullets.push({x:e.x+e.w/2,y:e.y+e.h,vx:0,vy:ds.speed*1.5+2,type:'ice'});
        }else if(e.type==='blue'){
          if(Math.random()<0.5){
            this.enemyBullets.push({x:e.x+e.w/2,y:e.y+e.h,vx:0,vy:ds.speed*1.5+2,type:'fire'});
          }else{
            this.enemyBullets.push({x:e.x+e.w/2,y:e.y+e.h,vx:0,vy:ds.speed*1.5+2,type:'ice'});
          }
        }else{
          this.enemyBullets.push({x:e.x+e.w/2,y:e.y+e.h,vx:0,vy:ds.speed*1.5+2,type:'normal'});
        }
        e.shootCooldown=60;
      }
    });

    this.enemyBullets=this.enemyBullets.filter(b=>{
      b.x+=b.vx;b.y+=b.vy;
      if(p.invincible<=0&&b.x>p.x&&b.x<p.x+p.w&&b.y>p.y&&b.y<p.y+p.h){
        if(b.type==='ice'){this.freeze=180;SFX.hit();showFloatingText(gameCanvasWrap,'❄️ FROZEN!')}
        else{this.lives--;setLives(this.lives);SFX.hit();screenShake()}
        p.invincible=90;resetCombo();
        this.spawnParticles(b.x,b.y,b.type==='ice'?'#06B6D4':'#EF4444');
        if(this.lives<=0)endGame(this.score,'Space Shooter');
        return false;
      }
      return b.y<H+20;
    });

    this.powerups.forEach(pu=>{pu.frame++;pu.y+=pu.vy;pu.x+=Math.sin(pu.frame*0.05)*0.5});
    this.powerups=this.powerups.filter(pu=>pu.y<H+40);

    this.bullets=this.bullets.filter(b=>{b.y+=b.vy;b.x+=(b.vx||0);return b.y>-20&&b.x>-20&&b.x<W+20});

    this.bullets=this.bullets.filter(b=>{
      let alive=true;
      this.enemies=this.enemies.filter(e=>{
        const bw=b.big?12:4,bh=b.big?16:10;
        if(b.x<e.x+e.w&&b.x+bw>e.x&&b.y<e.y+e.h&&b.y+bh>e.y){
          e.hp--;
          const pts=e.type==='blue'?50:(e.type==='white'||e.type==='darkRed'?20:10);
          this.score+=pts;addCombo();setScore(this.score);
          showFloatingText(gameCanvasWrap,'+'+pts);
          SFX.point();
          this.player.xp++;updateXPDisplay(this.player.xp);
          if(e.hp<=0){
            this.spawnParticles(e.x+16,e.y+16,e.type==='yellow'?'#FFD700':e.type==='darkRed'?'#8B0000':e.type==='white'?'#06B6D4':'#3B82F6');
            if(!b.big)alive=false;
            return false;
          }
          this.spawnParticles(e.x+16,e.y+16,'#FCA5A5');
          if(!b.big)alive=false;
          return true;
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

    this.enemyBullets.forEach(b=>{
      if(b.type==='ice'){
        gCtx.fillStyle='#06B6D4';gCtx.shadowColor='#00BFFF';gCtx.shadowBlur=10;
        gCtx.beginPath();gCtx.arc(b.x,b.y,3,0,Math.PI*2);gCtx.fill();
      }else{
        gCtx.fillStyle='#EF4444';gCtx.shadowColor='#F97316';gCtx.shadowBlur=8;
        gCtx.beginPath();gCtx.arc(b.x,b.y,4,0,Math.PI*2);gCtx.fill();
        gCtx.fillStyle='#F97316';gCtx.beginPath();gCtx.arc(b.x,b.y,2,0,Math.PI*2);gCtx.fill();
      }
      gCtx.shadowBlur=0;
    });

    this.enemies.forEach(e=>{
      gCtx.save();gCtx.translate(e.x+e.w/2,e.y+e.h/2);
      const color=e.type==='yellow'?'#FFD700':e.type==='darkRed'?'#8B0000':e.type==='white'?'#F5F5DC':'#3B82F6';
      const glow=e.type==='yellow'?'#FFD700':e.type==='darkRed'?'#FF0000':e.type==='white'?'#00BFFF':'#0099FF';
      const scale=e.type==='blue'?1.5:1;
      gCtx.fillStyle=color;
      gCtx.beginPath();gCtx.moveTo(-14*scale,-14*scale);gCtx.lineTo(14*scale,-14*scale);gCtx.lineTo(18*scale,14*scale);gCtx.lineTo(-18*scale,14*scale);gCtx.closePath();gCtx.fill();
      gCtx.fillStyle='rgba(255,255,255,0.3)';
      gCtx.beginPath();gCtx.moveTo(-14*scale,-14*scale);gCtx.lineTo(14*scale,-14*scale);gCtx.lineTo(18*scale,14*scale);gCtx.lineTo(-18*scale,14*scale);gCtx.closePath();gCtx.fill();
      gCtx.shadowColor=glow;gCtx.shadowBlur=15;
      gCtx.fillStyle='#FFF';gCtx.beginPath();gCtx.arc(-6*scale,-3*scale,3*scale,0,Math.PI*2);gCtx.fill();
      gCtx.fillStyle='#000';gCtx.beginPath();gCtx.arc(-6*scale,-3*scale,1.5*scale,0,Math.PI*2);gCtx.fill();
      gCtx.shadowBlur=0;gCtx.restore();
      gCtx.save();
      gCtx.fillStyle='#EF4444';gCtx.fillRect(e.x,e.y-8,e.w,4);
      gCtx.fillStyle='#22C55E';
      const hpPercent=Math.max(0,e.hp/e.maxHp);
      gCtx.fillRect(e.x,e.y-8,e.w*hpPercent,4);
      gCtx.strokeStyle='#FFF';gCtx.lineWidth=1;gCtx.strokeRect(e.x,e.y-8,e.w,4);
      gCtx.restore();
    });

    if(this.freeze>0){
      gCtx.fillStyle=`rgba(6,182,212,${Math.sin(this.gameTime*0.1)*0.3+0.4})`;
      gCtx.fillRect(0,0,gameCanvas.width,gameCanvas.height);
      gCtx.font='bold 32px Orbitron,monospace';gCtx.fillStyle='#06B6D4';gCtx.textAlign='center';
      gCtx.fillText('❄️ FROZEN ❄️',gameCanvas.width/2,gameCanvas.height/2);
    }

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
  bird:null,pipes:[],score:0,started:false,dead:false,frameCount:0,bg:0,lives:3,invincible:0,powerups:[],shield:false,shieldTimer:0,nextPUScore:5,lastPUScore:0,
  start(){
    const W=gameCanvas.width,H=gameCanvas.height;
    this.bird={x:W*0.22,y:H/2,vy:0,r:14,rot:0};
    this.pipes=[];this.score=0;this.started=false;this.dead=false;this.frameCount=0;this.bg=0;this.pipeTimer=0;this.lives=3;this.invincible=0;this.powerups=[];this.shield=false;this.shieldTimer=0;this.nextPUScore=5;this.lastPUScore=0;
    setScore(0);setLives(3);resetCombo();
    document.getElementById('flappyTutorial').classList.remove('hidden');
    document.getElementById('flappyTutorialBtn').onclick=()=>{document.getElementById('flappyTutorial').classList.add('hidden');this.started=true;gameLoop=requestAnimationFrame(()=>this.loop())};
    document.addEventListener('click',this._flap=()=>this.flap(),{once:false});
  },
  spawnPowerUp(type){
    const W=gameCanvas.width,H=gameCanvas.height;
    const validTypes=['heart','shield','electric'];
    const pType=validTypes.includes(type)?type:validTypes[Math.floor(Math.random()*validTypes.length)];
    const randPipe=this.pipes[Math.floor(Math.random()*Math.min(3,this.pipes.length))];
    if(!randPipe)return;
    this.powerups.push({x:randPipe.x+randPipe.w/2-15,y:(randPipe.top+randPipe.bottom)/2-15,w:30,h:30,type:pType,frame:0,collected:false});
  },
  collectPU(pu){
    switch(pu.type){
      case'heart':
        this.lives=Math.min(this.lives+1,6);
        setLives(this.lives);
        SFX.powerup();
        showFloatingText(gameCanvasWrap,'❤️ +LIFE');
        break;
      case'shield':
        this.shield=true;
        this.shieldTimer=400;
        SFX.select();
        showFloatingText(gameCanvasWrap,'🛡️ SHIELD');
        break;
      case'electric':
        this.pipes=this.pipes.slice(Math.min(10,Math.floor(this.pipes.length/2)));
        this.score+=10;
        setScore(this.score);
        SFX.levelUp();
        showFloatingText(gameCanvasWrap,'⚡ +10 PTS');
        break;
    }
    this.addCombo();
  },
  addCombo(){addCombo()},
  flap(){
    if(!this.started||this.dead||!gameRunning)return;
    this.bird.vy=-6;
    SFX.flap();
  },
  loop(){
    if(!gameRunning)return;
    if(!gamePaused)this.updateGame();
    this.draw();
    gameLoop=requestAnimationFrame(()=>this.loop());
  },
  updateGame(){
    const W=gameCanvas.width,H=gameCanvas.height,b=this.bird;
    if(!this.started)return;
    this.frameCount++;this.bg+=1.5;
    if(this.shield)this.shieldTimer--;if(this.shieldTimer<=0)this.shield=false;
    b.vy+=.38;b.y+=b.vy;b.rot=Math.min(Math.max(b.vy*4,-30),90);
    if(b.y+b.r>H-40){if(!this.shield){this.lives--;setLives(this.lives);SFX.die();screenShake();if(this.lives<=0){this.dead=true;document.removeEventListener('click',this._flap);endGame(this.score,'Flappy Bird');return}}else{this.shield=false;this.shieldTimer=0;SFX.hit()}b.y=H/2;b.vy=-3;this.invincible=90;return}
    if(b.y-b.r<0){b.y=b.r;b.vy=0}
    if(this.score>=this.nextPUScore&&this.lastPUScore<this.nextPUScore){this.lastPUScore=this.nextPUScore;this.spawnPowerUp();this.nextPUScore+=5}
    this.pipeTimer++;const gap=120+Math.max(0,60-this.score*2);const pipeSpeed=2+this.score*.08;
    if(this.pipeTimer>90){
      this.pipeTimer=0;
      const top=80+Math.random()*(H-gap-140);
      this.pipes.push({x:W+30,top,bottom:top+gap,scored:false,w:52});
    }
    this.pipes=this.pipes.filter(p=>{
      p.x-=pipeSpeed;
      if(!p.scored&&p.x+p.w<b.x){p.scored=true;this.score++;setScore(this.score);addCombo();SFX.point();showFloatingText(gameCanvasWrap,'+'+(addCombo()))}
      if(!this.shield&&this.invincible<=0&&b.x+b.r>p.x&&b.x-b.r<p.x+p.w&&(b.y-b.r<p.top||b.y+b.r>p.bottom)){this.lives--;setLives(this.lives);SFX.hit();screenShake();resetCombo();if(this.lives<=0){this.dead=true;document.removeEventListener('click',this._flap);endGame(this.score,'Flappy Bird')}else{b.y=(p.top+p.bottom)/2;b.vy=-3;this.invincible=90}}
      else if(this.shield&&this.invincible<=0&&b.x+b.r>p.x&&b.x-b.r<p.x+p.w&&(b.y-b.r<p.top||b.y+b.r>p.bottom)){this.shield=false;this.shieldTimer=0;SFX.hit()}
      return p.x>-100;
    });
    this.powerups.forEach(pu=>{pu.frame++;pu.x+=pipeSpeed*-1});
    this.powerups=this.powerups.filter(pu=>{
      if(pu.x<b.x+b.r&&pu.x+pu.w>b.x-b.r&&pu.y<b.y+b.r&&pu.y+pu.h>b.y-b.r){this.collectPU(pu);return false}
      return pu.x>-100;
    });
    if(this.invincible>0)this.invincible--;
  },
  _updateReal(){if(!gameRunning)return;if(!gamePaused)this.updateGame();this.draw();gameLoop=requestAnimationFrame(()=>this._updateReal())},
  update(){
    if(!gameRunning)return;
    if(!gamePaused)this.updateGame();
    this.draw();
    gameLoop=requestAnimationFrame(()=>this.loop());
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
    this.powerups.forEach(pu=>{
      gCtx.save();
      const bob=Math.sin(pu.frame*0.08)*4;
      const cx=pu.x+pu.w/2,cy=pu.y+pu.h/2+bob;
      gCtx.shadowColor=pu.type==='heart'?'#FF69B4':pu.type==='shield'?'#22D3EE':'#F59E0B';
      gCtx.shadowBlur=25;
      gCtx.strokeStyle=pu.type==='heart'?'#FF69B4':pu.type==='shield'?'#22D3EE':'#F59E0B';
      gCtx.lineWidth=2.5;
      gCtx.beginPath();gCtx.arc(cx,cy,25,0,Math.PI*2);gCtx.stroke();
      gCtx.fillStyle='rgba(255,255,255,0.15)';gCtx.fill();
      gCtx.font='28px serif';gCtx.textAlign='center';gCtx.textBaseline='middle';
      gCtx.fillStyle=pu.type==='heart'?'#FF69B4':pu.type==='shield'?'#22D3EE':'#F59E0B';
      gCtx.fillText(pu.type==='heart'?'❤️':pu.type==='shield'?'🛡️':'⚡',cx,cy);
      gCtx.shadowBlur=0;gCtx.restore();
    });
    const gG=gCtx.createLinearGradient(0,H-40,0,H);gG.addColorStop(0,'#3d8a37');gG.addColorStop(1,'#2a6a25');
    gCtx.fillStyle=gG;gCtx.fillRect(0,H-40,W,40);
    gCtx.save();gCtx.shadowColor='#4ade80';gCtx.shadowBlur=10;gCtx.strokeStyle='#4ade80';gCtx.lineWidth=1.5;
    gCtx.beginPath();gCtx.moveTo(0,H-40);gCtx.lineTo(W,H-40);gCtx.stroke();gCtx.shadowBlur=0;gCtx.restore();
    if(this.shield){
      gCtx.save();
      gCtx.shadowColor='#22D3EE';
      gCtx.shadowBlur=20;
      gCtx.strokeStyle='rgba(34,211,238,0.7)';
      gCtx.lineWidth=3;
      gCtx.beginPath();gCtx.arc(b.x,b.y,b.r+15,0,Math.PI*2);
      gCtx.stroke();
      gCtx.shadowBlur=0;gCtx.restore();
    }
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
    if(keys['ArrowLeft']||keys['a']||keys['A'])p.x-=p.speed;
    if(keys['ArrowRight']||keys['d']||keys['D'])p.x+=p.speed;
    if(keys['ArrowUp']||keys['w']||keys['W'])p.y-=p.speed*.7;
    if(keys['ArrowDown']||keys['s']||keys['S'])p.y+=p.speed*.7;
    if(p.x<p.r+5)p.x=p.r+5;if(p.x>W-p.r-5)p.x=W-p.r-5;
    if(p.y<p.r+5)p.y=p.r+5;if(p.y>H-p.r-5)p.y=H-p.r-5;
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
    gCtx.shadowColor='#22D3EE';gCtx.shadowBlur=12;
    gCtx.fillStyle='#CBD5E1';gCtx.fillRect(-11,-4,22,16);
    gCtx.fillStyle='#F8FAFC';
    gCtx.fillRect(-8,0,16,14);
    gCtx.fillRect(-7,14,4,6);gCtx.fillRect(3,14,4,6);
    gCtx.fillRect(-13,2,4,10);gCtx.fillRect(9,2,4,10);
    gCtx.beginPath();gCtx.arc(0,-10,12,0,Math.PI*2);gCtx.fill();
    gCtx.fillStyle='#06B6D4';
    gCtx.beginPath();gCtx.ellipse(0,-10,9,5,0,0,Math.PI*2);gCtx.fill();
    gCtx.fillStyle='rgba(34,211,238,.8)';
    gCtx.beginPath();gCtx.ellipse(-8,16,3,6+Math.random()*3,0,0,Math.PI*2);gCtx.fill();
    gCtx.beginPath();gCtx.ellipse(8,16,3,6+Math.random()*3,0,0,Math.PI*2);gCtx.fill();
    gCtx.globalAlpha=1;gCtx.restore();
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
        const sy=h.whacked?h.whackAnim*30:-35+h.anim*35;
        gCtx.save();gCtx.beginPath();gCtx.ellipse(h.x,h.y,34,35,0,0,Math.PI*2);gCtx.clip();
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
  const GROUND_Y_OFFSET=60;
  const MOBILE_GROUND_Y_OFFSET=120;
  let W,H,groundY;
  let dino,obstacles,pteros,stars,mountains,groundDots,dustParts,deathParts,speedLines;
  let score,hiScore,frameCount,gameSpeed,maxSpeed,state; // 'idle','playing','dead'
  let jumpsLeft,dayNightPhase,spawnCooldown,lastMilestone;
  let shakeTimer,shakeIntensity;
  let bgPulsePhase,bgPulseTimer;
  let dinoAnimFrame,dinoAnimTimer,dinoBreathPhase;
  let deathSpin,deathFlashTimer;
  let speedBarPct;

  function getGroundOffset(){
    return isMobileViewport()?MOBILE_GROUND_Y_OFFSET:GROUND_Y_OFFSET;
  }

  function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();}

  function reset(){
    W=gameCanvas.width; H=gameCanvas.height;
    groundY=H-getGroundOffset();
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
    groundY=H-getGroundOffset();

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
    const mobileDino=isMobileViewport();
    const splitY=Math.floor(H*DINO_MOBILE_PLAY_RATIO);
    ctx.save();
    ctx.shadowColor='#00ff88';ctx.shadowBlur=8;
    ctx.fillStyle='#00ff88';ctx.font='bold 16px Orbitron,monospace';ctx.textAlign='left';
    ctx.fillText('SCORE: '+score,15,mobileDino?splitY+DINO_MOBILE_HUD_OFFSET:30);
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='12px Orbitron,monospace';ctx.textAlign='right';
    ctx.fillText('HI: '+hiScore,W-15,mobileDino?splitY+DINO_MOBILE_HUD_OFFSET:30);
    ctx.shadowBlur=0;

    // speed bar
    ctx.fillStyle='rgba(255,255,255,0.15)';
    ctx.fillRect(15,H-20,100,6);
    ctx.fillStyle='#00ff88';
    ctx.fillRect(15,H-20,100*speedBarPct,6);
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px Orbitron,monospace';ctx.textAlign='left';
    ctx.fillText('SPD',120,H-15);
    if(mobileDino){
      ctx.fillStyle='rgba(0,255,136,0.45)';ctx.font='10px Orbitron,monospace';ctx.textAlign='center';
      ctx.fillText(DINO_MOBILE_TAP_HINT,W/2,DINO_MOBILE_TAP_HINT_Y);
      ctx.fillStyle='rgba(0,255,136,0.22)';
      ctx.fillRect(0,splitY,W,H-splitY);
      ctx.strokeStyle='rgba(0,255,136,0.35)';
      ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(0,splitY);ctx.lineTo(W,splitY);ctx.stroke();
    }
    ctx.restore();

    // idle text
    if(state==='idle'){
      ctx.save();ctx.shadowColor='#00ff88';ctx.shadowBlur=15;
      ctx.fillStyle=Math.floor(frameCount/30)%2===0?'#00ff88':'rgba(0,255,136,0.3)';
      ctx.font='bold 18px Orbitron,monospace';ctx.textAlign='center';
      ctx.fillText(mobileDino?DINO_MOBILE_IDLE_HINT:'PRESS SPACE TO START',W/2,H/2-20);
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
function isDinoPlayTap(clientY){
  if(!isMobileViewport())return true;
  const rect=gameCanvas.getBoundingClientRect();
  if((clientY-rect.top)<rect.height*DINO_MOBILE_PLAY_RATIO)return true;
  return false;
}
gameCanvas.addEventListener('click',e=>{
  if(currentGame==='dino'&&gameRunning&&!gamePaused&&isDinoPlayTap(e.clientY))GAMES.dino.jump();
});
gameCanvas.addEventListener('touchstart',e=>{
  if(currentGame==='dino'&&gameRunning&&!gamePaused){
    const t=e.touches[0];
    if(!t)return;
    if(isDinoPlayTap(t.clientY)){e.preventDefault();GAMES.dino.jump();}
  }
},{passive:false});

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

// ===== SPIN TO PLAY WHEEL =====
const SPIN_WHEEL = {
  games: [
    {name:'SPACE SHOOTER', emoji:'🚀', color:'#7C3AED'},
    {name:'FLAPPY BIRD', emoji:'🐦', color:'#22D3EE'},
    {name:'ASTEROID DODGE', emoji:'☄️', color:'#A855F7'},
    {name:'WHACK A BEAR', emoji:'🐻', color:'#10B981'},
    {name:'DINO JUMP', emoji:'🦕', color:'#F59E0B'},
    {name:'ZOMBIE SHOOTER', emoji:'🧟', color:'#EF4444'}
  ],
  gameKeys: ['space', 'flappy', 'asteroid', 'whack', 'dino', 'zombie'],
  spinning: false,
  currentRotation: 0,
  selectedGame: null,
  spinCanvas: null,
  spinCtx: null,
  
  init() {
    const spinBtn = document.getElementById('spinToPlayBtn');
    const spinModal = document.getElementById('spinModal');
    const spinCloseBtn = document.getElementById('spinCloseBtn');
    const resultCloseBtn = document.getElementById('resultCloseBtn');
    const spinButton = document.getElementById('spinButton');
    const resultPlayBtn = document.getElementById('resultPlayBtn');
    const resultSpinAgainBtn = document.getElementById('resultSpinAgainBtn');
    
    this.spinCanvas = document.getElementById('spinCanvas');
    this.spinCtx = this.spinCanvas ? this.spinCanvas.getContext('2d') : null;
    
    if(spinBtn) spinBtn.onclick = () => this.openWheel();
    if(spinCloseBtn) spinCloseBtn.onclick = () => this.closeWheel();
    if(resultCloseBtn) resultCloseBtn.onclick = () => this.closeResult();
    if(spinButton) spinButton.onclick = () => this.spin();
    if(resultPlayBtn) resultPlayBtn.onclick = () => this.playSelected();
    if(resultSpinAgainBtn) resultSpinAgainBtn.onclick = () => {
      this.closeResult();
      this.openWheel();
    };
  },
  
  openWheel() {
    const spinModal = document.getElementById('spinModal');
    if(spinModal) {
      spinModal.classList.remove('hidden');
      this.currentRotation = 0;
      this.drawWheel();
    }
  },
  
  closeWheel() {
    const spinModal = document.getElementById('spinModal');
    if(spinModal) spinModal.classList.add('hidden');
  },
  
  closeResult() {
    const resultModal = document.getElementById('spinResultModal');
    if(resultModal) resultModal.classList.add('hidden');
  },
  
  drawWheel() {
    if(!this.spinCtx || !this.spinCanvas) return;
    
    const ctx = this.spinCtx;
    const canvas = this.spinCanvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    const slices = this.games.length;
    const sliceAngle = (Math.PI * 2) / slices;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.currentRotation);
    
    // Draw segments
    for(let i = 0; i < slices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = (i + 1) * sliceAngle;
      
      // Draw slice
      ctx.fillStyle = this.games[i].color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.stroke();
      
      // Draw text
      const textAngle = startAngle + sliceAngle / 2;
      ctx.save();
      ctx.rotate(textAngle);
      ctx.translate(radius * 0.65, 0);
      ctx.rotate(-textAngle);
      
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 14px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.games[i].emoji, 0, 0);
      
      ctx.font = '11px Orbitron, monospace';
      ctx.fillText(this.games[i].name, 0, 18);
      
      ctx.restore();
    }
    
    // Draw center circle
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 2);
    
    ctx.restore();
  },
  
  spin() {
    if(this.spinning) return;
    
    const spinButton = document.getElementById('spinButton');
    if(spinButton) spinButton.disabled = true;
    
    this.spinning = true;
    SFX.select();
    
    const spins = 3 + Math.random() * 2; // 3-5 rotations
    const duration = 3000 + Math.random() * 2000; // 3-5 seconds
    const targetRotation = this.currentRotation + (spins * Math.PI * 2) + (Math.random() * Math.PI * 2);
    const startTime = Date.now();
    const startRotation = this.currentRotation;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      // Easing function for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      this.currentRotation = startRotation + (targetRotation - startRotation) * easeProgress;
      this.drawWheel();
      
      if(progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.spinning = false;
        if(spinButton) spinButton.disabled = false;
        this.showResult();
      }
    };
    
    animate();
  },
  
  showResult() {
    // Calculate which game was selected
    const sliceAngle = (Math.PI * 2) / this.games.length;
    const normalizedRotation = (this.currentRotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const selectedIndex = Math.floor(((Math.PI * 2) - normalizedRotation) / sliceAngle) % this.games.length;
    
    this.selectedGame = selectedIndex;
    const game = this.games[selectedIndex];
    
    // Update result modal
    document.getElementById('resultAvatar').textContent = game.emoji;
    document.getElementById('resultTitle').textContent = game.name;
    
    // Close spin modal and show result modal
    this.closeWheel();
    const resultModal = document.getElementById('spinResultModal');
    if(resultModal) resultModal.classList.remove('hidden');
    
    SFX.levelUp();
  },
  
  playSelected() {
    if(this.selectedGame !== null) {
      const gameKey = this.gameKeys[this.selectedGame];
      this.closeResult();
      launchGame(gameKey);
    }
  }
};

// Initialize spin wheel
SPIN_WHEEL.init();

// ===== START =====
window.addEventListener('load',()=>{
  if(STATE.name){
    loadHub();showScreen('hub-screen');
  }else{
    runLoading();
  }
});
window.addEventListener('resize',()=>{if(gameRunning){resizeCanvas()}});

// ============================================================
// ZOMBIE SHOOTER — Survival Top-Down
// ============================================================
GAMES.zombie = {
  score: 0, lives: 3, gameTime: 0, player: null, bullets: [], zombies: [], particles: [], lastShot: 0,

  start() {
    const W = gameCanvas.width, H = gameCanvas.height;
    this.score = 0; this.lives = 3; this.gameTime = 0;
    this.bullets = []; this.zombies = []; this.particles = [];
    this.player = { x: W/2, y: H/2, w: 32, h: 32, vx: 0, vy: 0, speed: 4 };
    setScore(0); setLives(3); resetCombo();
    gameLoop = requestAnimationFrame(() => this.loop());
    
    this.mouseHandler = (e) => this.shoot(e);
    gameCanvas.addEventListener('mousedown', this.mouseHandler);
    gameCanvas.addEventListener('touchstart', this.mouseHandler, {passive: false});
  },

  stop() {
    gameCanvas.removeEventListener('mousedown', this.mouseHandler);
    gameCanvas.removeEventListener('touchstart', this.mouseHandler);
  },

  shoot(e) {
    if(!gameRunning || gamePaused) return;
    e.preventDefault();
    const W = gameCanvas.width, H = gameCanvas.height;
    const rect = gameCanvas.getBoundingClientRect();
    let cx, cy;
    if(e.touches && e.touches.length > 0) {
      cx = e.touches[0].clientX - rect.left; cy = e.touches[0].clientY - rect.top;
    } else {
      cx = e.clientX - rect.left; cy = e.clientY - rect.top;
    }
    const dx = cx - (this.player.x + 16);
    const dy = cy - (this.player.y + 16);
    const dist = Math.sqrt(dx*dx + dy*dy);
    if(dist === 0) return;
    this.bullets.push({ x: this.player.x + 16, y: this.player.y + 16, vx: (dx/dist)*10, vy: (dy/dist)*10 });
    SFX.shoot();
  },

  spawnZombie() {
    const W = gameCanvas.width, H = gameCanvas.height;
    let x, y;
    if(Math.random() < 0.5) {
      x = Math.random() < 0.5 ? -30 : W + 30;
      y = Math.random() * H;
    } else {
      x = Math.random() * W;
      y = Math.random() < 0.5 ? -30 : H + 30;
    }
    this.zombies.push({ x, y, w: 32, h: 32, speed: 1 + Math.random() * 2 + (this.gameTime/1000), hp: 1 + Math.floor(this.gameTime/600) });
  },

  spawnParticles(x, y, color) {
    for(let i = 0; i < 15; i++) {
      const a = (i/15)*Math.PI*2, v = 2 + Math.random()*3;
      this.particles.push({x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, life: 1, color, size: Math.random()*4+2});
    }
  },

  update() {
    const W = gameCanvas.width, H = gameCanvas.height, p = this.player;
    this.gameTime++;

    let dx = 0, dy = 0;
    if(keys['ArrowLeft'] || keys['a'] || keys['A']) dx = -1;
    if(keys['ArrowRight'] || keys['d'] || keys['D']) dx = 1;
    if(keys['ArrowUp'] || keys['w'] || keys['W']) dy = -1;
    if(keys['ArrowDown'] || keys['s'] || keys['S']) dy = 1;
    
    if(dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; } // normalize diagonal
    p.x += dx * p.speed; p.y += dy * p.speed;
    p.x = Math.max(0, Math.min(W - p.w, p.x));
    p.y = Math.max(0, Math.min(H - p.h, p.y));

    if(this.gameTime % Math.max(20, 60 - Math.floor(this.gameTime/100)) === 0) {
      this.spawnZombie();
    }

    this.bullets.forEach((b, i) => {
      b.x += b.vx; b.y += b.vy;
      if(b.x < 0 || b.x > W || b.y < 0 || b.y > H) this.bullets.splice(i, 1);
    });

    this.particles.forEach((pt, i) => {
      pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.05;
      if(pt.life <= 0) this.particles.splice(i, 1);
    });

    this.zombies.forEach((z, i) => {
      const zdx = (p.x + 16) - (z.x + 16);
      const zdy = (p.y + 16) - (z.y + 16);
      const dist = Math.sqrt(zdx*zdx + zdy*zdy);
      if(dist > 0) { z.x += (zdx/dist)*z.speed; z.y += (zdy/dist)*z.speed; }

      // collision with player
      if(dist < 20) {
        this.lives--; setLives(this.lives); SFX.hit(); screenShake();
        this.zombies.splice(i, 1);
        this.spawnParticles(p.x+16, p.y+16, '#ff0000');
        if(this.lives <= 0) { this.stop(); endGame(this.score, 'zombie'); }
      }
    });

    // bullets hit zombies
    for(let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      for(let j = this.zombies.length - 1; j >= 0; j--) {
        const z = this.zombies[j];
        if(b.x > z.x && b.x < z.x + z.w && b.y > z.y && b.y < z.y + z.h) {
          this.bullets.splice(i, 1);
          z.hp--;
          if(z.hp <= 0) {
            this.zombies.splice(j, 1);
            this.score += 10; setScore(this.score); addCombo();
            this.spawnParticles(z.x+16, z.y+16, '#00ff00'); // zombie blood
            SFX.point();
          } else {
             this.spawnParticles(z.x+16, z.y+16, '#008800');
          }
          break;
        }
      }
    }
  },

  draw() {
    gCtx.fillStyle = '#111'; gCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Grid lines for zombie mode
    gCtx.strokeStyle = '#222'; gCtx.lineWidth = 2;
    for(let x=0; x<gameCanvas.width; x+=50) { gCtx.beginPath(); gCtx.moveTo(x,0); gCtx.lineTo(x,gameCanvas.height); gCtx.stroke(); }
    for(let y=0; y<gameCanvas.height; y+=50) { gCtx.beginPath(); gCtx.moveTo(0,y); gCtx.lineTo(gameCanvas.width,y); gCtx.stroke(); }

    const p = this.player;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    // Body (torso)
    gCtx.fillStyle = '#2d5a8a';
    gCtx.beginPath();
    gCtx.ellipse(cx, cy + 10, 10, 14, 0, 0, Math.PI * 2);
    gCtx.fill();
    // Head
    gCtx.fillStyle = '#f5c5a3';
    gCtx.beginPath();
    gCtx.arc(cx, cy - 6, 10, 0, Math.PI * 2);
    gCtx.fill();
    // Eyes
    gCtx.fillStyle = '#222';
    gCtx.beginPath();
    gCtx.arc(cx - 3.5, cy - 8, 2, 0, Math.PI * 2);
    gCtx.arc(cx + 3.5, cy - 8, 2, 0, Math.PI * 2);
    gCtx.fill();
    // Gun barrel pointing upward
    gCtx.fillStyle = '#555';
    gCtx.fillRect(cx + 4, cy - 22, 5, 16);
    gCtx.fillStyle = '#888';
    gCtx.fillRect(cx + 2, cy - 22, 9, 4);

    gCtx.fillStyle = '#ffdf00';
    this.bullets.forEach(b => { gCtx.beginPath(); gCtx.arc(b.x, b.y, 4, 0, Math.PI*2); gCtx.fill(); });

    this.zombies.forEach(z => {
      gCtx.fillStyle = '#2e8b57'; gCtx.fillRect(z.x, z.y, z.w, z.h);
      gCtx.fillStyle = '#8b0000'; gCtx.fillRect(z.x + 4, z.y + 4, 8, 8); // eyes
      gCtx.fillRect(z.x + 20, z.y + 4, 8, 8);
    });

    this.particles.forEach(pt => {
      gCtx.globalAlpha = pt.life; gCtx.fillStyle = pt.color;
      gCtx.beginPath(); gCtx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2); gCtx.fill();
    });
    gCtx.globalAlpha = 1;
  },

  loop() {
    if(!gameRunning) return;
    if(!gamePaused) this.update();
    this.draw();
    gameLoop = requestAnimationFrame(() => this.loop());
  }
};


// ===== SEARCH & FILTER LOGIC =====


// ===== SEARCH & FILTER LOGIC =====

const gameSearch = document.getElementById('gameSearch');
const filterBtns = document.querySelectorAll('.filter-btn');
const noResults = document.getElementById('noResults');

function filterGames() {
    const searchTerm = gameSearch.value.toLowerCase();
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    const gameCards = document.querySelectorAll('.game-card'); 
    let visibleCount = 0;

    gameCards.forEach(card => {
        const gameName = card.querySelector('.game-name').textContent.toLowerCase();
        const gameCategory = card.dataset.category || 'all';

        // Check if it matches Search AND Filter
        const matchesSearch = gameName.includes(searchTerm);
        const matchesFilter = (activeFilter === 'all' || gameCategory === activeFilter);

        if (matchesSearch && matchesFilter) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    if (visibleCount === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
    }
}

gameSearch.addEventListener('input', filterGames);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        filterGames();
    });
});

window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== gameSearch) {
        e.preventDefault(); // Prevent the '/' from being typed
        gameSearch.focus();
    }
});
