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
