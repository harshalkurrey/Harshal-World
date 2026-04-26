// ===== GLOBAL STATE =====
const STATE = {
  name: '', avatar: '', level: 'beginner', xp: 0, gamesPlayed: 0,
  bestCombo: 0, totalScore: 0, soundOn: true, volume: 0.5,
  bestScores: {space:0,flappy:0,asteroid:0,whack:0,dino:0,zombie:0},
  leaderboard: [], emojiAvatar: '🎮', theme: 'default'
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

// ===== SAVE/LOAD =====
function saveState(){localStorage.setItem('hw_state',JSON.stringify(STATE))}
function loadState(){
  const s=localStorage.getItem('hw_state');
  if(s){const d=JSON.parse(s);Object.assign(STATE,d)}
}
loadState();
