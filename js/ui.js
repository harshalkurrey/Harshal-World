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
