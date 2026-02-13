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

// ====== CALCULADORA CFD INTERACTIVA ======

// Calcular Reynolds
document.getElementById('calcRe').addEventListener('click', ()=>{
  const u = parseFloat(document.getElementById('re-u').value) || 0;
  const L = parseFloat(document.getElementById('re-L').value) || 0;
  const nu = parseFloat(document.getElementById('re-nu').value) || 0;
  const Re = (u * L) / nu;
  const regime = Re < 1? 'muy viscoso' : Re < 1000? 'transición' : 'turbulento';
  document.getElementById('reResult').innerHTML = `<strong>Re = ${Re.toFixed(2)}</strong><br/>Régimen: ${regime}`;
});

// Calcular Péclet
document.getElementById('calcPe').addEventListener('click', ()=>{
  const u = parseFloat(document.getElementById('pe-u').value) || 0;
  const dx = parseFloat(document.getElementById('pe-dx').value) || 0;
  const alpha = parseFloat(document.getElementById('pe-alpha').value) || 0;
  const Pe = (u * dx) / alpha;
  const stable = Pe <= 2? 'esquema central estable' : 'usar upwind o estabilización';
  document.getElementById('peResult').innerHTML = `<strong>Pe = ${Pe.toFixed(2)}</strong><br/>Recomendación: ${stable}`;
});

// Dibujar stencils
function drawStencil(canvasId, points, title){
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth * devicePixelRatio;
  canvas.height = canvas.offsetHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  const centerX = w/2;
  const centerY = h/2;
  const nodeRadius = 8;
  const spacing = w / (points.length + 2);
  
  // línea base
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(spacing, centerY);
  ctx.lineTo(w - spacing, centerY);
  ctx.stroke();
  
  // nodos
  for(let i=0; i<points.length; i++){
    const x = spacing + (i+1) * spacing;
    const isActive = points[i];
    
    ctx.fillStyle = isActive? 'rgba(86,182,240,0.9)' : 'rgba(255,255,255,0.2)';
    ctx.strokeStyle = isActive? 'rgba(86,182,240,0.9)' : 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, centerY, nodeRadius, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    
    // etiqueta
    ctx.fillStyle = 'rgba(200,200,200,0.8)';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    const label = ['i-2','i-1','i','i+1','i+2'][i];
    ctx.fillText(label, x, centerY + 20);
  }
}

// Visualizar convergencia mejorada
document.getElementById('calcConv').addEventListener('click', ()=>{
  const convCanvas = document.getElementById('convCanvas');
  const convCtx = convCanvas.getContext('2d');
  convCanvas.width = convCanvas.offsetWidth * devicePixelRatio;
  convCanvas.height = convCanvas.offsetHeight * devicePixelRatio;
  convCtx.scale(devicePixelRatio, devicePixelRatio);
  
  const w = convCanvas.offsetWidth;
  const h = convCanvas.offsetHeight;
  const margin = 35;
  
  // datos: 4 líneas de orden diferente
  const orders = [1, 2, 3, 4];
  const colors = ['rgba(100,200,100,0.7)', 'rgba(86,182,240,0.7)', 'rgba(255,150,100,0.7)', 'rgba(200,100,200,0.7)'];
  
  // ejes
  convCtx.strokeStyle = 'rgba(255,255,255,0.3)';
  convCtx.lineWidth = 1;
  convCtx.beginPath();
  convCtx.moveTo(margin, h - margin);
  convCtx.lineTo(w - margin, h - margin);
  convCtx.lineTo(w - margin, margin);
  convCtx.stroke();
  
  // grid
  convCtx.strokeStyle = 'rgba(255,255,255,0.1)';
  for(let i=0; i<=4; i++){
    const x = margin + (i/4)*(w-2*margin);
    convCtx.beginPath();
    convCtx.moveTo(x, h - margin);
    convCtx.lineTo(x, h - margin + 5);
    convCtx.stroke();
    
    const y = h - margin - (i/4)*(h-2*margin);
    convCtx.beginPath();
    convCtx.moveTo(margin - 5, y);
    convCtx.lineTo(margin, y);
    convCtx.stroke();
  }
  
  // dibujar curvas de convergencia
  for(let order of orders){
    const idx = orders.indexOf(order);
    convCtx.strokeStyle = colors[idx];
    convCtx.lineWidth = 2;
    convCtx.beginPath();
    
    for(let i=0; i<=20; i++){
      const dx = 0.1 / Math.pow(2, i/5); // escala log
      const error = Math.pow(dx, order);
      const logDx = Math.log10(dx);
      const logErr = Math.log10(error);
      
      // mapear a canvas (rango: log10(0.001) a log10(0.1) = -3 a -1)
      const x = margin + ((logDx + 3)/2) * (w - 2*margin);
      const y = h - margin - ((logErr + 2)/2) * (h - 2*margin);
      
      if(i===0) convCtx.moveTo(x, y);
      else convCtx.lineTo(x, y);
    }
    convCtx.stroke();
  }
  
  // leyenda
  convCtx.font = '11px Arial';
  for(let i=0; i<orders.length; i++){
    convCtx.fillStyle = colors[i];
    convCtx.fillRect(w - 100, margin + i*18, 10, 10);
    convCtx.fillStyle = 'rgba(200,200,200,0.9)';
    convCtx.textAlign = 'left';
    convCtx.fillText(`Orden ${orders[i]}`, w - 85, margin + i*18 + 9);
  }
});

// ====== SIMULADOR 1D ANIMADO ======
let simRunning = false;
let sim1dData = null;
let simT = 0;

function init1dSim(){
  const nx = 100;
  sim1dData = {nx: nx, u: [], T: Array(nx).fill(0), Told: Array(nx).fill(0)};
  // condición inicial: gaussiana en el centro
  const center = Math.floor(nx/2);
  for(let i=0; i<nx; i++){
    const r = Math.abs(i - center) / 10;
    sim1dData.T[i] = Math.exp(-r*r);
  }
  sim1dData.Told = [...sim1dData.T];
  simT = 0;
}

function step1dSim(u, alpha, dt){
  const {nx, T, Told} = sim1dData;
  const dx = 1 / nx;
  const Pe = (u * dx) / (alpha + 1e-6);
  const scheme = Pe < 2? 'central' : 'upwind';
  
  for(let i=1; i<nx-1; i++){
    let adv = 0, diff = 0;
    
    if(scheme === 'central'){
      adv = -u * (T[i+1] - T[i-1]) / (2*dx);
    } else {
      adv = -u * (T[i] - T[i-1]) / dx;
    }
    diff = alpha * (T[i+1] - 2*T[i] + T[i-1]) / (dx*dx);
    
    Told[i] = T[i] + dt * (adv + diff);
  }
  // condiciones de frontera
  Told[0] = Told[1];
  Told[nx-1] = Told[nx-2];
  
  sim1dData.T = [...Told];
}

function draw1dSim(){
  const canvas = document.getElementById('sim1dCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth * devicePixelRatio;
  canvas.height = canvas.offsetHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  const margin = 30;
  
  // fondo
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(margin, margin, w-2*margin, h-2*margin);
  
  // ejes
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.moveTo(margin, h - margin);
  ctx.lineTo(w - margin, h - margin);
  ctx.stroke();
  
  // graficar
  const {T, nx} = sim1dData;
  const maxT = Math.max(...T);
  const minT = Math.min(...T);
  const range = maxT - minT || 1;
  
  ctx.strokeStyle = 'rgba(86,182,240,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for(let i=0; i<nx; i++){
    const x = margin + (i/nx) * (w - 2*margin);
    const y = h - margin - ((T[i] - minT) / range) * (h - 2*margin);
    if(i===0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // llenar bajo la curva
  ctx.lineTo(w - margin, h - margin);
  ctx.lineTo(margin, h - margin);
  ctx.fillStyle = 'rgba(86,182,240,0.1)';
  ctx.fill();
}

document.getElementById('simStart').addEventListener('click', ()=>{
  if(!sim1dData) init1dSim();
  simRunning = !simRunning;
  
  const animate = ()=>{
    if(!simRunning) return;
    
    const u = parseFloat(document.getElementById('sim-u').value) || 0;
    const alpha = parseFloat(document.getElementById('sim-alpha').value) || 0;
    const dt = parseFloat(document.getElementById('sim-dt').value) || 0.01;
    
    step1dSim(u, alpha, dt);
    draw1dSim();
    simT += dt;
    document.getElementById('simTime').textContent = `t = ${simT.toFixed(3)}`;
    
    requestAnimationFrame(animate);
  };
  animate();
});

document.getElementById('simReset').addEventListener('click', ()=>{
  simRunning = false;
  init1dSim();
  draw1dSim();
  document.getElementById('simTime').textContent = 't = 0';
});

// Dibujar stencils al cargar
window.addEventListener('load', ()=>{
  drawStencil('stencil3', [false, true, true, true, false]);
  drawStencil('stencil5', [true, true, true, true, true]);
  drawStencil('stencilUp', [false, true, true, false, false]);
  init1dSim();
  draw1dSim();
});

// initialize flujo
resize();
initParticles(800);
requestAnimationFrame(step);
