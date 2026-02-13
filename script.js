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

// Visualizar convergencia
document.getElementById('calcConv').addEventListener('click', ()=>{
  const dx0 = parseFloat(document.getElementById('conv-dx0').value) || 0.1;
  const nRefine = parseInt(document.getElementById('conv-refine').value) || 4;
  const order = parseFloat(document.getElementById('conv-order').value) || 2;
  
  const convCanvas = document.getElementById('convCanvas');
  const convCtx = convCanvas.getContext('2d');
  convCanvas.width = convCanvas.offsetWidth * devicePixelRatio;
  convCanvas.height = convCanvas.offsetHeight * devicePixelRatio;
  convCtx.scale(devicePixelRatio, devicePixelRatio);
  
  // datos de convergencia simulados: error ∝ (dx)^order
  const dxes = [];
  const errors = [];
  for(let i=0; i<nRefine; i++){
    const dx = dx0 / Math.pow(2, i);
    const error = Math.pow(dx, order) * 10; // escala artificial
    dxes.push(dx);
    errors.push(error);
  }
  
  // dibujar gráfico logarítmico
  const w = convCanvas.offsetWidth;
  const h = convCanvas.offsetHeight;
  const margin = 40;
  
  // ejes
  convCtx.strokeStyle = 'rgba(255,255,255,0.2)';
  convCtx.beginPath();
  convCtx.moveTo(margin, h - margin);
  convCtx.lineTo(w - margin, h - margin);
  convCtx.lineTo(w - margin, margin);
  convCtx.stroke();
  
  // escala logarítmica
  const minDx = Math.min(...dxes);
  const maxDx = Math.max(...dxes);
  const minErr = Math.min(...errors);
  const maxErr = Math.max(...errors);
  const logMinDx = Math.log10(minDx);
  const logMaxDx = Math.log10(maxDx);
  const logMinErr = Math.log10(minErr);
  const logMaxErr = Math.log10(maxErr);
  
  // puntos y línea
  convCtx.strokeStyle = 'rgba(86,182,240,0.8)';
  convCtx.fillStyle = 'rgba(86,182,240,0.9)';
  convCtx.lineWidth = 2;
  convCtx.beginPath();
  
  for(let i=0; i<dxes.length; i++){
    const logDx = Math.log10(dxes[i]);
    const logErr = Math.log10(errors[i]);
    const x = margin + ((logDx - logMaxDx) / (logMinDx - logMaxDx)) * (w - 2*margin);
    const y = h - margin - ((logErr - logMinErr) / (logMaxErr - logMinErr)) * (h - 2*margin);
    
    if(i===0) convCtx.moveTo(x, y);
    else convCtx.lineTo(x, y);
  }
  convCtx.stroke();
  
  // dibujar puntos
  for(let i=0; i<dxes.length; i++){
    const logDx = Math.log10(dxes[i]);
    const logErr = Math.log10(errors[i]);
    const x = margin + ((logDx - logMaxDx) / (logMinDx - logMaxDx)) * (w - 2*margin);
    const y = h - margin - ((logErr - logMinErr) / (logMaxErr - logMinErr)) * (h - 2*margin);
    convCtx.beginPath();
    convCtx.arc(x, y, 3, 0, Math.PI*2);
    convCtx.fill();
  }
  
  // etiquetas
  convCtx.fillStyle = 'rgba(210,210,210,0.7)';
  convCtx.font = '11px Arial';
  convCtx.textAlign = 'center';
  convCtx.fillText('log(Δx)', w/2, h - 10);
  convCtx.save();
  convCtx.translate(10, h/2);
  convCtx.rotate(-Math.PI/2);
  convCtx.fillText('log(Error)', 0, 0);
  convCtx.restore();
  
  // leyenda
  convCtx.fillStyle = 'rgba(150,180,220,0.8)';
  convCtx.font = '12px Arial';
  convCtx.textAlign = 'left';
  convCtx.fillText(`Orden p=${order}`, margin + 10, margin + 15);
});

// initialize
resize();
initParticles(800);
requestAnimationFrame(step);
