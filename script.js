const canvas = document.getElementById('flowCanvas');
const ctx = canvas.getContext('2d');
const particles = [];
let W, H;

function resize(){
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * devicePixelRatio);
  canvas.height = Math.floor(rect.height * devicePixelRatio);
  W = canvas.width; H = canvas.height;
  ctx.scale(devicePixelRatio, devicePixelRatio);
}

function rand(min, max){ return Math.random()*(max-min)+min }

function initParticles(n=800){
  particles.length = 0;
  const rect = canvas.getBoundingClientRect();
  for(let i=0;i<n;i++){
    particles.push({
      x: Math.random()*rect.width,
      y: Math.random()*rect.height,
      age: 0
    });
  }
}

function velocityField(x,y,t,type,s){
  // normalize coords to [-1,1]
  const nx = (x/canvas.clientWidth)*2-1;
  const ny = (y/canvas.clientHeight)*2-1;
  if(type==='vortex'){
    const strength = s*1.6;
    const u = -ny * strength;
    const v = nx * strength;
    return [u,v];
  }
  if(type==='shear'){
    const u = s * nx;
    const v = s * 0.2 * Math.sin(ny*Math.PI*2 + t*0.5);
    return [u,v];
  }
  // source/sink
  const r2 = nx*nx+ny*ny + 0.0001;
  const factor = s*0.8 / Math.sqrt(r2);
  return [nx*factor, ny*factor];
}

let last=0;
function step(t){
  const dt = Math.min(0.04, (t-last)/1000 || 0.016);
  last = t;

  // fade background slightly
  ctx.fillStyle = 'rgba(5,8,16,0.12)';
  ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);

  const type = document.getElementById('fieldType').value;
  const s = parseFloat(document.getElementById('strength').value);

  ctx.globalCompositeOperation = 'lighter';
  for(const p of particles){
    const [u,v] = velocityField(p.x,p.y,t/1000,type,s);
    p.x += u*60*dt;
    p.y += v*60*dt;
    p.age += dt;

    // wrap
    if(p.x < 0) p.x += canvas.clientWidth;
    if(p.x > canvas.clientWidth) p.x -= canvas.clientWidth;
    if(p.y < 0) p.y += canvas.clientHeight;
    if(p.y > canvas.clientHeight) p.y -= canvas.clientHeight;

    const alpha = Math.max(0.08, Math.min(0.9, 0.9 - p.age*0.02));
    ctx.fillStyle = `rgba(86,182,240,${alpha})`;
    ctx.fillRect(p.x, p.y, 1.5, 1.5);
  }
  ctx.globalCompositeOperation = 'source-over';

  requestAnimationFrame(step);
}

window.addEventListener('resize', ()=>{
  // reset transform then resize
  ctx.setTransform(1,0,0,1,0,0);
  resize();
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  initParticles(800);
});

// initialize
resize();
initParticles(800);
requestAnimationFrame(step);
