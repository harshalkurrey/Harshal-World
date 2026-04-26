// ===== GAME LAUNCH =====
document.getElementById('gamesGrid').addEventListener('click',e=>{
  const card=e.target.closest('.game-card');
  if(!card||card.classList.contains('locked'))return;
  const game=card.dataset.game;SFX.select();
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
const gCtx=gameCanvas.getContext('2d');
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
function stopGame(){gameRunning=false;gamePaused=false;if(gameLoop)cancelAnimationFrame(gameLoop);gameLoop=null;gameCanvasWrap.classList.remove('dino-mobile-split');clearGame()}
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
  resizeCanvas();showScreen('game-screen');
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
function setScore(n){document.getElementById('hudScore').textContent=n}

// ===== CLEAR GAME =====
function clearGame(){clearTimeout(whackTimer);whackInterval&&clearInterval(whackInterval);whackTimer=null;whackInterval=null}
let whackTimer=null,whackInterval=null;
