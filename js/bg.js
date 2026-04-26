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
