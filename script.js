const canvas = document.getElementById('flowCanvas');
const ctx = canvas.getContext('2d');
const particles = [];
let W, H;

function resize(){
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * devicePixelRatio);
  canvas.height = Math.floor(rect.height * devicePixelRatio);
  W = canvas.width; H = canvas.height;
  // reset transform then scale once to handle high-DPI crisply
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(devicePixelRatio, devicePixelRatio);
}

function rand(min, max){ return Math.random()*(max-min)+min }

function initParticles(n){
  particles.length = 0;
  const rect = canvas.getBoundingClientRect();
  // adapt particle count to canvas area if not provided
  if(!n){
    const area = Math.max(1, rect.width * rect.height);
    n = Math.min(600, Math.max(120, Math.floor(area / 2000)));
  }
  for(let i=0;i<n;i++){
    particles.push({ x: Math.random()*rect.width, y: Math.random()*rect.height, age: 0 });
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
}

window.addEventListener('resize', ()=>{
  // reset transform then resize
  ctx.setTransform(1,0,0,1,0,0);
  resize();
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  initParticles();
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
  ctx.setTransform(1,0,0,1,0,0);
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
  convCtx.setTransform(1,0,0,1,0,0);
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
  ctx.setTransform(1,0,0,1,0,0);
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
initParticles();

// ====== INTERACTIVIDAD ADICIONAL Y EFECTOS ======
(function(){
  // Capítulos
  const chapterBtns = document.querySelectorAll('.chapter-btn');
  const chapters = document.querySelectorAll('.chapter');
  function showChapter(id){
    chapters.forEach(c=>c.classList.remove('active'));
    const el = document.getElementById(id);
    if(el) el.classList.add('active');
    chapterBtns.forEach(b=>b.classList.toggle('active', b.dataset.chapter===id));
  }
  chapterBtns.forEach(btn=>{
    btn.addEventListener('click', ()=> showChapter(btn.dataset.chapter));
  });

  // keyboard navigation (left/right)
  let idx = 0;
  function idxOfActive(){
    const list = Array.from(chapterBtns);
    return list.findIndex(b=>b.classList.contains('active'));
  }
  window.addEventListener('keydown', (e)=>{
    const list = Array.from(chapterBtns);
    if(e.key==='ArrowRight'){ idx = (idxOfActive()+1) % list.length; list[idx].click(); }
    if(e.key==='ArrowLeft'){ idx = (idxOfActive()-1+list.length) % list.length; list[idx].click(); }
  });

  // Canvas mouse forces + confetti bursts
  const canvasEl = document.getElementById('flowCanvas');
  let mouse = {x:0,y:0,down:false};
  const effects = [];

  canvasEl.addEventListener('mousemove', (ev)=>{
    const r = canvasEl.getBoundingClientRect();
    mouse.x = ev.clientX - r.left;
    mouse.y = ev.clientY - r.top;
  });
  canvasEl.addEventListener('mouseleave', ()=>{ mouse.x = -9999; mouse.y = -9999; });
  canvasEl.addEventListener('mousedown', (ev)=>{
    mouse.down = true;
    spawnBurst(mouse.x, mouse.y);
  });
  window.addEventListener('mouseup', ()=> mouse.down = false);

  function spawnBurst(x,y){
    const colors = ['#00ff88','#00d9ff','#ff006e','#ffd166'];
    for(let i=0;i<20;i++){
      const ang = Math.random()*Math.PI*2;
      const speed = Math.random()*4 + 1;
      effects.push({x, y, vx: Math.cos(ang)*speed, vy: Math.sin(ang)*speed - 1.2, life: 1 + Math.random()*0.8, color: colors[i%colors.length], size: 3 + Math.random()*4, rot: Math.random()*360});
    }
  }

  // integrate effects inside main step loop by monkey-patching step
  const originalStep = step;
  window.step = function(t){
    // mouse influence on particles (simple repulsion)
    if(mouse.x > -1000){
      for(const p of particles){
        const dx = p.x - mouse.x; const dy = p.y - mouse.y;
        const d2 = dx*dx + dy*dy;
        if(d2 < 16000){ // radius ~126
          const d = Math.sqrt(d2) + 0.0001;
          const force = (mouse.down? -2200 : -900) / (d2 + 400);
          p.x += (dx/d) * force * 0.016;
          p.y += (dy/d) * force * 0.016;
          // small color trail aging
          p.age = Math.max(0, p.age - 0.02);
        }
      }
    }

    // draw effects (confetti)
    const ctxLocal = ctx; // same ctx
    // call original step (which clears/fades background and draws particles)
    originalStep(t);

    // draw and update effects (use save/restore per particle to avoid resetting transform)
    ctxLocal.globalCompositeOperation = 'lighter';
    for(let i=effects.length-1;i>=0;i--){
      const e = effects[i];
      e.vy += 0.06; // gravity
      e.vx *= 0.995; e.vy *= 0.995;
      e.x += e.vx; e.y += e.vy;
      e.life -= 0.02;
      ctxLocal.save();
      ctxLocal.globalAlpha = Math.max(0, Math.min(1, e.life));
      ctxLocal.translate(e.x, e.y);
      ctxLocal.rotate(e.rot * Math.PI/180);
      ctxLocal.fillStyle = e.color;
      ctxLocal.fillRect(-e.size/2, -e.size/2, e.size, e.size);
      ctxLocal.restore();
      if(e.life <= 0) effects.splice(i,1);
    }
    ctxLocal.globalCompositeOperation = 'source-over';

    requestAnimationFrame(window.step);
  };

  // tarjeta divertida: al click lanzar emoji flotante
  document.querySelectorAll('.chapter-card').forEach(card=>{
    card.addEventListener('click', (ev)=>{
      const emoji = ['✨','🔥','🌊','🌀','🚀'][Math.floor(Math.random()*5)];
      const span = document.createElement('span');
      span.textContent = emoji;
      span.style.position = 'absolute';
      const r = card.getBoundingClientRect();
      span.style.left = (r.left + r.width/2) + 'px';
      span.style.top = (r.top + r.height/2) + 'px';
      span.style.fontSize = '28px';
      span.style.pointerEvents = 'none';
      span.style.transition = 'transform 900ms cubic-bezier(.2,.9,.2,1), opacity 900ms';
      document.body.appendChild(span);
      requestAnimationFrame(()=>{
        span.style.transform = `translateY(-120px) translateX(${(Math.random()-0.5)*80}px) scale(1.4)`;
        span.style.opacity = '0';
      });
      setTimeout(()=> span.remove(), 1000);
    });
  });

  // ripple for buttons (dynamic)
  document.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const r = btn.getBoundingClientRect();
      const ink = document.createElement('span');
      ink.style.position = 'absolute';
      ink.style.left = (e.clientX - r.left) + 'px';
      ink.style.top = (e.clientY - r.top) + 'px';
      ink.style.width = ink.style.height = '10px';
      ink.style.background = 'rgba(255,255,255,0.18)';
      ink.style.borderRadius = '50%';
      ink.style.transform = 'translate(-50%,-50%) scale(0)';
      ink.style.transition = 'transform 600ms ease-out, opacity 600ms';
      ink.style.pointerEvents = 'none';
      btn.style.position = 'relative';
      btn.appendChild(ink);
      requestAnimationFrame(()=> ink.style.transform = 'translate(-50%,-50%) scale(40)');
      setTimeout(()=> ink.style.opacity = '0', 400);
      setTimeout(()=> ink.remove(), 800);
    });
  });

  // show intro by default
  showChapter('intro');
})();

// start the optimized animation loop
requestAnimationFrame(window.step);

// ====== INTEGRACIÓN TEMPORAL: Explícito vs Implícito (difusión 1D) ======
(()=>{
  const Ti = {
    nx: 100, dx: 1/100, alpha: 0.02, dt: 0.0005, substeps: 1,
    T0: null, Texp: null, Timp: null, t: 0, running: false, errHistory: [],
    runExplicit: true, runImplicit: true, expOscillating: false, expPrevMax: 0
  };

  function thomasSolve(a,b,c,d){ // a: lower (n-1), b: diag (n), c: upper (n-1), d: rhs (n)
    const n = b.length;
    const cp = new Array(n-1);
    const dp = new Array(n);
    cp[0] = c[0] / b[0];
    dp[0] = d[0] / b[0];
    for(let i=1;i<n-1;i++){
      const m = b[i] - a[i-1]*cp[i-1];
      cp[i] = c[i] / m;
      dp[i] = (d[i] - a[i-1]*dp[i-1]) / m;
    }
    dp[n-1] = (d[n-1] - a[n-2]*dp[n-2]) / (b[n-1] - a[n-2]*cp[n-2]);
    const x = new Array(n);
    x[n-1] = dp[n-1];
    for(let i=n-2;i>=0;i--) x[i] = dp[i] - cp[i]*x[i+1];
    return x;
  }

  function initTimeInt(){
    Ti.alpha = parseFloat(document.getElementById('ti-alpha').value) || 0.02;
    Ti.nx = parseInt(document.getElementById('ti-nx').value) || 100;
    Ti.dt = parseFloat(document.getElementById('ti-dt').value) || 0.0005;
    Ti.substeps = parseInt(document.getElementById('ti-substeps').value) || 1;
    Ti.runExplicit = document.getElementById('ti-runExplicit').checked;
    Ti.runImplicit = document.getElementById('ti-runImplicit').checked;

    Ti.dx = 1 / Ti.nx;
    Ti.T0 = new Array(Ti.nx).fill(0);
    const c = Math.floor(Ti.nx/2);
    for(let i=0;i<Ti.nx;i++){
      const r = (i - c) / (Ti.nx*0.06);
      Ti.T0[i] = Math.exp(-r*r);
    }
    Ti.Texp = [...Ti.T0];
    Ti.Timp = [...Ti.T0];
    Ti.t = 0;
    Ti.errHistory = [];
    Ti.expOscillating = false;
    Ti.expPrevMax = 0;
    drawTimeFields();
    drawErr();
    updateTiInfo();
    updateStatus();
  }

  function stepExplicitOnce(){
    const n = Ti.nx; const dx = Ti.dx; const r = Ti.alpha * Ti.dt / (dx*dx);
    const T = Ti.Texp; const Tnew = new Array(n);
    for(let i=1;i<n-1;i++){
      Tnew[i] = T[i] + r*(T[i+1] - 2*T[i] + T[i-1]);
    }
    Tnew[0] = Tnew[1];
    Tnew[n-1] = Tnew[n-2];
    Ti.Texp = Tnew;
  }

  function stepImplicitOnce(){
    const n = Ti.nx; const dx = Ti.dx; const r = Ti.alpha * Ti.dt / (dx*dx);
    if(n<=2) return;
    // build tridiagonal for interior nodes 1..n-2 (m = n-2)
    const m = n-2;
    const a = new Array(m-1).fill(-r);
    const b = new Array(m).fill(1 + 2*r);
    const c = new Array(m-1).fill(-r);
    const d = new Array(m);
    for(let i=0;i<m;i++) d[i] = Ti.Timp[i+1];
    const x = thomasSolve(a,b,c,d);
    const Tnew = new Array(n);
    Tnew[0] = x[0];
    for(let i=1;i<n-1;i++) Tnew[i] = x[i-1];
    Tnew[n-1] = x[m-1];
    // enforce mild Neumann at boundaries
    Tnew[0] = Tnew[1]; Tnew[n-1] = Tnew[n-2];
    Ti.Timp = Tnew;
  }

  function computeError(){
    const n = Ti.nx; let s=0;
    for(let i=0;i<n;i++){ const d = (Ti.Texp[i] - Ti.Timp[i]); s += d*d; }
    return Math.sqrt(s / n);
  }

  function detectOscillations(){
    // Detecta si la solución explícita está oscilando (crecimiento de amplitud)
    const maxT = Math.max(...Ti.Texp);
    const isOscillating = maxT > Ti.expPrevMax * 1.5 && Ti.t > 0.001; // Crecimiento rápido = inestabilidad
    Ti.expOscillating = isOscillating;
    Ti.expPrevMax = maxT;
    
    // Mostrar advertencia
    const warning = document.getElementById('ti-warning');
    const r = Ti.alpha * Ti.dt / (Ti.dx * Ti.dx);
    if(r > 0.5 && Ti.running) {
      warning.style.display = 'block';
    } else {
      warning.style.display = 'none';
    }
  }

  function drawFieldToCanvas(id, T){
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(devicePixelRatio, devicePixelRatio);
    const w = canvas.offsetWidth; const h = canvas.offsetHeight; const margin = 18;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(margin, margin, w-2*margin, h-2*margin);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.moveTo(margin, h-margin); ctx.lineTo(w-margin, h-margin); ctx.stroke();
    const n = T.length; const maxT = Math.max(...T); const minT = Math.min(...T); const range = maxT - minT || 1;
    ctx.strokeStyle = 'rgba(86,182,240,0.9)'; ctx.lineWidth = 2; ctx.beginPath();
    for(let i=0;i<n;i++){ const x = margin + (i/n)*(w-2*margin); const y = h - margin - ((T[i]-minT)/range)*(h-2*margin); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
    ctx.stroke();
  }

  function drawTimeFields(){ drawFieldToCanvas('ti-explicit-canvas', Ti.Texp); drawFieldToCanvas('ti-implicit-canvas', Ti.Timp); }

  function drawErr(){
    const c = document.getElementById('ti-err-canvas'); const ctx = c.getContext('2d');
    c.width = c.offsetWidth * devicePixelRatio; c.height = c.offsetHeight * devicePixelRatio;
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(devicePixelRatio, devicePixelRatio);
    const w = c.offsetWidth; const h = c.offsetHeight; ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(0,0,w,h);
    // axes
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.moveTo(36,h-24); ctx.lineTo(w-12,h-24); ctx.lineTo(w-12,12); ctx.stroke();
    if(Ti.errHistory.length===0) return;
    const maxErr = Math.max(...Ti.errHistory.map(p=>p.err));
    const minErr = Math.min(...Ti.errHistory.map(p=>p.err));
    const tmax = Ti.errHistory[Ti.errHistory.length-1].t || 1;
    ctx.strokeStyle = 'rgba(255,120,80,0.9)'; ctx.lineWidth = 2; ctx.beginPath();
    for(let i=0;i<Ti.errHistory.length;i++){ const p = Ti.errHistory[i]; const x = 36 + (p.t / tmax) * (w-60); const y = h-24 - ((p.err - minErr)/(maxErr - minErr || 1))*(h-40); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
    ctx.stroke();
  }

  function updateTiInfo(){
    const info = document.getElementById('ti-info');
    const dt = Ti.dt; const dx = Ti.dx; const alpha = Ti.alpha;
    const dtCrit = dx*dx/(2*alpha + 1e-12);
    info.textContent = `nx=${Ti.nx}, dx=${dx.toFixed(4)}, dt=${dt} (CFL_approx limit ≈ ${dtCrit.toExponential(2)})`;
    if(dt > dtCrit) info.style.color = '#ffb4b4'; else info.style.color = 'var(--muted)';
  }

  let tiAnimId = null;
  function tiAnimate(){
    if(!Ti.running){ tiAnimId = null; return; }
    for(let s=0;s<Ti.substeps;s++){
      if(Ti.runExplicit) stepExplicitOnce();
      if(Ti.runImplicit) stepImplicitOnce();
      Ti.t += Ti.dt;
      const err = computeError();
      Ti.errHistory.push({t: Ti.t, err});
      if(Ti.errHistory.length > 400) Ti.errHistory.shift();
      detectOscillations();
    }
    drawTimeFields(); drawErr(); updateStatus();
    tiAnimId = requestAnimationFrame(tiAnimate);
  }

  function updateStatus(){
    const r = Ti.alpha * Ti.dt / (Ti.dx * Ti.dx);
    const expStatus = document.getElementById('ti-expStatus');
    const impStatus = document.getElementById('ti-impStatus');
    
    if(Ti.running){
      if(r > 0.5){
        expStatus.textContent = `⚠️ INESTABLE (r=${r.toFixed(3)} > 0.5)`;
        expStatus.style.color = '#ffb4b4';
      } else {
        expStatus.textContent = `✓ Estable (r=${r.toFixed(3)} ≤ 0.5)`;
        expStatus.style.color = '#00ff88';
      }
      impStatus.textContent = `✓ Siempre Estable (r=${r.toFixed(3)})`;
      impStatus.style.color = '#00d9ff';
    } else {
      expStatus.textContent = 'Status: listo';
      impStatus.textContent = 'Status: listo';
      expStatus.style.color = 'var(--muted)';
      impStatus.style.color = 'var(--muted)';
    }
  }

  // UI bindings
  window.addEventListener('load', ()=>{
    initTimeInt();
    document.getElementById('ti-start').addEventListener('click', ()=>{
      Ti.running = !Ti.running;
      if(Ti.running && !tiAnimId) tiAnimate();
      updateStatus();
    });
    document.getElementById('ti-reset').addEventListener('click', ()=>{ 
      Ti.running = false; 
      if(tiAnimId) cancelAnimationFrame(tiAnimId); 
      document.getElementById('ti-warning').style.display = 'none';
      initTimeInt(); 
    });
    ['ti-alpha','ti-nx','ti-dt','ti-substeps'].forEach(id=>{
      const el = document.getElementById(id);
      el.addEventListener('change', ()=>{ initTimeInt(); });
    });
    document.getElementById('ti-runExplicit').addEventListener('change', (e)=>{ Ti.runExplicit = e.target.checked; });
    document.getElementById('ti-runImplicit').addEventListener('change', (e)=>{ Ti.runImplicit = e.target.checked; });
  });

})();
