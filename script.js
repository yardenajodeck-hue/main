// ===== INICIALIZACIÓN DEL APP =====
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  if (window._appInitialized) return;
  window._appInitialized = true;
  
  initTabs();
  initTutorialCards();
}

// ===== NAVEGACIÓN DE PESTAÑAS =====
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      
      // Desactivar todas las pestañas
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Activar la pestaña seleccionada
      btn.classList.add('active');
      document.getElementById(tabName).classList.add('active');
    });
  });
}

// ===== TOGGLEAR DETALLES DE TUTORIALES =====
function toggleDetails(card) {
  card.classList.toggle('expanded');
}

// ===== SCROLL SUAVE =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


// ===== ANIMACIÓN DE FLUJO (obsoleto, mantenido para compatibilidad) =====
function initFlowAnimation(){
  // Esta función ya no se usa en la nueva página
}

// ===== CALCULADORAS (obsoleto) =====
function initCalculators(){
  // Esta función ya no se usa en la nueva página
}

// ===== STENCILS (obsoleto) =====
function initStencils(){
  // Esta función ya no se usa en la nueva página
}

// ===== SIMULADOR RÁPIDO (obsoleto) =====
function initSimpleSimulator(){
  // Esta función ya no se usa en la nueva página
}

// ===== INTEGRACIÓN TEMPORAL (obsoleto) =====
function initTimeIntegration(){
  // Esta función ya no se usa en la nueva página
}

// ===== NAVEGACIÓN DE CAPÍTULOS (actualizado) =====
function initNavigation(){
  // Manejo de botones de capítulos antiguos (si aún existen)
  document.querySelectorAll('.chapter-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const chapter = btn.getAttribute('data-chapter');
      document.querySelectorAll('.chapter').forEach(s=>{ s.classList.remove('active'); });
      document.querySelectorAll('.chapter-btn').forEach(b=>{ b.classList.remove('active'); });
      const targetSection = document.getElementById(chapter);
      if(targetSection) targetSection.classList.add('active');
      btn.classList.add('active');
    });
  });
  
  // Manejo de botones de unidades (nuevo)
  document.querySelectorAll('.unit-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const unit = btn.getAttribute('data-unit');
      document.querySelectorAll('.unit-section').forEach(s=>{ s.classList.remove('active'); });
      document.querySelectorAll('.unit-btn').forEach(b=>{ b.classList.remove('active'); });
      const targetSection = document.getElementById(unit);
      if(targetSection) targetSection.classList.add('active');
      btn.classList.add('active');
    });
  });
}

  
  const ctx = canvas.getContext('2d');
  const particles = [];
  let W, H;

  function resize(){
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * devicePixelRatio);
    canvas.height = Math.floor(rect.height * devicePixelRatio);
    W = canvas.width;
    H = canvas.height;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function initParticles(n){
    particles.length = 0;
    const area = Math.max(1, canvas.clientWidth * canvas.clientHeight);
    n = n || Math.min(600, Math.max(120, Math.floor(area / 2000)));
    for(let i=0; i<n; i++){
      particles.push({ x: Math.random()*canvas.clientWidth, y: Math.random()*canvas.clientHeight, age: 0 });
    }
  }

  function velocityField(x,y,t,type,s){
    const nx = (x/canvas.clientWidth)*2-1;
    const ny = (y/canvas.clientHeight)*2-1;
    if(type==='vortex'){
      const strength = s*1.6;
      return [-ny*strength, nx*strength];
    }
    if(type==='shear'){
      return [s*nx, s*0.2*Math.sin(ny*Math.PI*2+t*0.5)];
    }
    const r2 = nx*nx+ny*ny + 0.0001;
    const factor = s*0.8/Math.sqrt(r2);
    return [nx*factor, ny*factor];
  }

  let last = 0;
  function step(t){
    const dt = Math.min(0.04, (t-last)/1000 || 0.016);
    last = t;
    ctx.fillStyle = 'rgba(5,8,16,0.12)';
    ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);
    
    const type = document.getElementById('fieldType').value;
    const s = parseFloat(document.getElementById('strength').value);
    ctx.globalCompositeOperation = 'lighter';
    
    for(const p of particles){
      const [u,v] = velocityField(p.x, p.y, t/1000, type, s);
      p.x += u*60*dt;
      p.y += v*60*dt;
      p.age += dt;
      if(p.x < 0) p.x += canvas.clientWidth;
      if(p.x > canvas.clientWidth) p.x -= canvas.clientWidth;
      if(p.y < 0) p.y += canvas.clientHeight;
      if(p.y > canvas.clientHeight) p.y -= canvas.clientHeight;
      const alpha = Math.max(0.08, Math.min(0.9, 0.9-p.age*0.02));
      ctx.fillStyle = `rgba(86,182,240,${alpha})`;
      ctx.fillRect(p.x, p.y, 1.5, 1.5);
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(step);
  }

  resize();
  initParticles();
  requestAnimationFrame(step);

  window.addEventListener('resize', ()=>{ ctx.setTransform(1,0,0,1,0,0); resize(); });
  const resetBtn = document.getElementById('resetBtn');
  if(resetBtn) resetBtn.addEventListener('click', ()=>{ initParticles(); });
}

// ===== CALCULADORAS =====
function initCalculators(){
  const calcRe = document.getElementById('calcRe');
  if(calcRe){
    calcRe.addEventListener('click', ()=>{
      const u = parseFloat(document.getElementById('re-u').value) || 0;
      const L = parseFloat(document.getElementById('re-L').value) || 0;
      const nu = parseFloat(document.getElementById('re-nu').value) || 0;
      const Re = (u*L)/nu;
      const regime = Re<1? 'viscoso' : Re<1000? 'transición' : 'turbulento';
      document.getElementById('reResult').innerHTML = `<strong>Re = ${Re.toFixed(2)}</strong><br/>${regime}`;
    });
  }

  const calcPe = document.getElementById('calcPe');
  if(calcPe){
    calcPe.addEventListener('click', ()=>{
      const u = parseFloat(document.getElementById('pe-u').value) || 0;
      const dx = parseFloat(document.getElementById('pe-dx').value) || 0;
      const alpha = parseFloat(document.getElementById('pe-alpha').value) || 0;
      const Pe = (u*dx)/alpha;
      const stable = Pe <= 2? 'central estable' : 'upwind recomendado';
      document.getElementById('peResult').innerHTML = `<strong>Pe = ${Pe.toFixed(2)}</strong><br/>${stable}`;
    });
  }
}

// ===== STENCILS =====
function initStencils(){
  const canvas = document.getElementById('stencil3Mini');
  if(!canvas) return;
  drawStencil(canvas, [true, true, true]);
}

function drawStencil(canvas, points){
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth * devicePixelRatio;
  canvas.height = canvas.offsetHeight * devicePixelRatio;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(devicePixelRatio, devicePixelRatio);
  
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  const centerY = h/2;
  const spacing = w/(points.length+2);
  
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(spacing, centerY);
  ctx.lineTo(w-spacing, centerY);
  ctx.stroke();
  
  for(let i=0; i<points.length; i++){
    const x = spacing + (i+1)*spacing;
    ctx.fillStyle = points[i]? 'rgba(86,182,240,0.9)' : 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(x, centerY, 6, 0, Math.PI*2);
    ctx.fill();
  }
}

// ===== SIMULADOR RÁPIDO =====
function initSimpleSimulator(){
  const Simp = {
    T: [], T0: [], alpha: 0.01, dt: 0.0003, nx: 100, dx: 1/100,
    amp: 1, initFunc: 'gaussian', t: 0, running: false, animId: null
  };

  function initFunc(){
    Simp.alpha = parseFloat(document.getElementById('simpl-alpha-slider')?.value) || 0.01;
    Simp.dt = parseFloat(document.getElementById('simpl-dt-slider')?.value) || 0.0003;
    Simp.nx = parseInt(document.getElementById('simpl-nx-slider')?.value) || 100;
    Simp.amp = parseFloat(document.getElementById('simpl-amplitude')?.value) || 1;
    Simp.initFunc = document.getElementById('simpl-init-func')?.value || 'gaussian';
    
    Simp.dx = 1/Simp.nx;
    Simp.T0 = new Array(Simp.nx).fill(0);
    
    // Generar función inicial según selección
    if(Simp.initFunc === 'gaussian'){
      const c = Math.floor(Simp.nx/2);
      for(let i=0; i<Simp.nx; i++){
        const r = (i-c)/(Simp.nx*0.06);
        Simp.T0[i] = Simp.amp * Math.exp(-r*r);
      }
    } else if(Simp.initFunc === 'square'){
      const q = Math.floor(Simp.nx/4);
      for(let i=q; i<3*q; i++) Simp.T0[i] = Simp.amp;
    } else if(Simp.initFunc === 'ramp'){
      for(let i=0; i<Simp.nx; i++){
        Simp.T0[i] = Simp.amp * (i/Simp.nx);
      }
    } else if(Simp.initFunc === 'sine'){
      for(let i=0; i<Simp.nx; i++){
        Simp.T0[i] = Simp.amp * Math.sin(Math.PI*i/Simp.nx);
      }
    }
    
    Simp.T = [...Simp.T0];
    Simp.t = 0;
    Simp.running = false;
    drawSimple();
    updateSimpleInfo();
  }

  function stepOnce(){
    const n = Simp.nx;
    const r = Simp.alpha*Simp.dt/(Simp.dx*Simp.dx);
    const T = Simp.T;
    const Tnew = new Array(n);
    for(let i=1; i<n-1; i++){
      Tnew[i] = T[i] + r*(T[i+1]-2*T[i]+T[i-1]);
    }
    Tnew[0] = Tnew[1];
    Tnew[n-1] = Tnew[n-2];
    Simp.T = Tnew;
    Simp.t += Simp.dt;
  }

  function drawSimple(){
    const canvas = document.getElementById('simpl-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const margin = 30;
    
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0,0,w,h);
    
    // Ejes
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, h-margin);
    ctx.lineTo(w-margin, h-margin);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, h-margin);
    ctx.stroke();
    
    // Dibuja líneas de referencia
    for(let i=1; i<5; i++){
      const y = h-margin - (i/5)*(h-2*margin);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(w-margin, y);
      ctx.stroke();
    }
    
    // Dibuja la función
    const maxT = Math.max(...Simp.T0);
    const range = maxT || 1;
    
    ctx.strokeStyle = 'rgba(86,182,240,0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for(let i=0; i<Simp.nx; i++){
      const x = margin + (i/Simp.nx)*(w-2*margin);
      const y = h-margin - (Simp.T[i]/range)*(h-2*margin);
      if(i===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }
    ctx.stroke();
    
    // Dibuja función inicial en gris
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4,4]);
    ctx.beginPath();
    for(let i=0; i<Simp.nx; i++){
      const x = margin + (i/Simp.nx)*(w-2*margin);
      const y = h-margin - (Simp.T0[i]/range)*(h-2*margin);
      if(i===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function updateSimpleInfo(){
    const info = document.getElementById('simpl-info');
    const r = Simp.alpha*Simp.dt/(Simp.dx*Simp.dx);
    const stability = r <= 0.5 ? '✓ Estable' : '⚠️ INESTABLE';
    if(info) info.textContent = `t=${Simp.t.toFixed(4)}, r=${r.toFixed(3)} [${stability}] | Función inicial: ${Simp.initFunc}`;
  }

  function animate(){
    if(!Simp.running){ Simp.animId = null; return; }
    stepOnce();
    drawSimple();
    updateSimpleInfo();
    Simp.animId = requestAnimationFrame(animate);
  }

  if(document.getElementById('simpl-canvas')){
    initFunc();
    
    const startBtn = document.getElementById('simpl-start');
    const resetBtn = document.getElementById('simpl-reset');
    
    if(startBtn){
      startBtn.addEventListener('click', ()=>{
        Simp.running = !Simp.running;
        startBtn.textContent = Simp.running ? '⏸ Pausar' : '▶ Ejecutar';
        if(Simp.running && !Simp.animId) animate();
      });
    }
    
    if(resetBtn){
      resetBtn.addEventListener('click', ()=>{
        Simp.running = false;
        if(Simp.animId) cancelAnimationFrame(Simp.animId);
        startBtn.textContent = '▶ Ejecutar';
        initFunc();
      });
    }
    
    // Sliders con feedback en tiempo real
    ['simpl-alpha-slider', 'simpl-dt-slider', 'simpl-nx-slider', 'simpl-amplitude', 'simpl-init-func'].forEach(id=>{
      const el = document.getElementById(id);
      if(el){
        el.addEventListener('change', ()=>{
          Simp.running = false;
          startBtn.textContent = '▶ Ejecutar';
          if(Simp.animId) cancelAnimationFrame(Simp.animId);
          initFunc();
        });
        el.addEventListener('input', ()=>{
          // Actualizar labels
          if(id === 'simpl-alpha-slider'){
            const val = document.getElementById('simpl-alpha-val');
            if(val) val.textContent = parseFloat(el.value).toFixed(4);
          }
          if(id === 'simpl-dt-slider'){
            const val = document.getElementById('simpl-dt-val');
            if(val) val.textContent = parseFloat(el.value).toFixed(5);
          }
          if(id === 'simpl-nx-slider'){
            const val = document.getElementById('simpl-nx-val');
            if(val) val.textContent = el.value;
          }
        });
      }
    });
  }
}

// ===== INTEGRACIÓN TEMPORAL =====
function initTimeIntegration(){
  const Ti = {
    nx: 100, dx: 1/100, alpha: 0.02, dt: 0.0005, substeps: 1,
    T0: null, Texp: null, Timp: null, t: 0, running: false, errHistory: [],
    runExplicit: true, runImplicit: true, expOscillating: false, expPrevMax: 0
  };

  function thomasSolve(a,b,c,d){
    const n = b.length;
    const cp = new Array(n-1);
    const dp = new Array(n);
    cp[0] = c[0]/b[0];
    dp[0] = d[0]/b[0];
    for(let i=1; i<n-1; i++){
      const m = b[i]-a[i-1]*cp[i-1];
      cp[i] = c[i]/m;
      dp[i] = (d[i]-a[i-1]*dp[i-1])/m;
    }
    dp[n-1] = (d[n-1]-a[n-2]*dp[n-2])/(b[n-1]-a[n-2]*cp[n-2]);
    const x = new Array(n);
    x[n-1] = dp[n-1];
    for(let i=n-2; i>=0; i--) x[i] = dp[i]-cp[i]*x[i+1];
    return x;
  }

  function initTimeInt(){
    Ti.alpha = parseFloat(document.getElementById('ti-alpha').value) || 0.02;
    Ti.nx = parseInt(document.getElementById('ti-nx').value) || 100;
    Ti.dt = parseFloat(document.getElementById('ti-dt').value) || 0.0005;
    Ti.substeps = parseInt(document.getElementById('ti-substeps').value) || 1;
    Ti.runExplicit = document.getElementById('ti-runExplicit').checked;
    Ti.runImplicit = document.getElementById('ti-runImplicit').checked;

    Ti.dx = 1/Ti.nx;
    Ti.T0 = new Array(Ti.nx).fill(0);
    const c = Math.floor(Ti.nx/2);
    for(let i=0; i<Ti.nx; i++){
      const r = (i-c)/(Ti.nx*0.06);
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
    const n = Ti.nx;
    const dx = Ti.dx;
    const r = Ti.alpha*Ti.dt/(dx*dx);
    const T = Ti.Texp;
    const Tnew = new Array(n);
    for(let i=1; i<n-1; i++){
      Tnew[i] = T[i] + r*(T[i+1]-2*T[i]+T[i-1]);
    }
    Tnew[0] = Tnew[1];
    Tnew[n-1] = Tnew[n-2];
    Ti.Texp = Tnew;
  }

  function stepImplicitOnce(){
    const n = Ti.nx;
    const dx = Ti.dx;
    const r = Ti.alpha*Ti.dt/(dx*dx);
    if(n<=2) return;
    const m = n-2;
    const a = new Array(m-1).fill(-r);
    const b = new Array(m).fill(1+2*r);
    const c = new Array(m-1).fill(-r);
    const d = new Array(m);
    for(let i=0; i<m; i++) d[i] = Ti.Timp[i+1];
    const x = thomasSolve(a,b,c,d);
    const Tnew = new Array(n);
    Tnew[0] = x[0];
    for(let i=1; i<n-1; i++) Tnew[i] = x[i-1];
    Tnew[n-1] = x[m-1];
    Tnew[0] = Tnew[1];
    Tnew[n-1] = Tnew[n-2];
    Ti.Timp = Tnew;
  }

  function computeError(){
    const n = Ti.nx;
    let s = 0;
    for(let i=0; i<n; i++){
      const d = Ti.Texp[i]-Ti.Timp[i];
      s += d*d;
    }
    return Math.sqrt(s/n);
  }

  function detectOscillations(){
    const maxT = Math.max(...Ti.Texp);
    const isOscillating = maxT > Ti.expPrevMax*1.5 && Ti.t > 0.001;
    Ti.expOscillating = isOscillating;
    Ti.expPrevMax = maxT;
    const warning = document.getElementById('ti-warning');
    const r = Ti.alpha*Ti.dt/(Ti.dx*Ti.dx);
    if(warning && r > 0.5 && Ti.running){
      warning.style.display = 'block';
    } else if(warning){
      warning.style.display = 'none';
    }
  }

  function drawFieldToCanvas(id, T){
    const canvas = document.getElementById(id);
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth*devicePixelRatio;
    canvas.height = canvas.offsetHeight*devicePixelRatio;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const margin = 18;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(margin, margin, w-2*margin, h-2*margin);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(margin, h-margin);
    ctx.lineTo(w-margin, h-margin);
    ctx.stroke();
    const n = T.length;
    const maxT = Math.max(...T);
    const minT = Math.min(...T);
    const range = maxT-minT || 1;
    ctx.strokeStyle = 'rgba(86,182,240,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let i=0; i<n; i++){
      const x = margin+(i/n)*(w-2*margin);
      const y = h-margin-((T[i]-minT)/range)*(h-2*margin);
      if(i===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }

  function drawTimeFields(){
    drawFieldToCanvas('ti-explicit-canvas', Ti.Texp);
    drawFieldToCanvas('ti-implicit-canvas', Ti.Timp);
  }

  function drawErr(){
    const c = document.getElementById('ti-err-canvas');
    if(!c) return;
    const ctx = c.getContext('2d');
    c.width = c.offsetWidth*devicePixelRatio;
    c.height = c.offsetHeight*devicePixelRatio;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const w = c.offsetWidth;
    const h = c.offsetHeight;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.moveTo(36,h-24);
    ctx.lineTo(w-12,h-24);
    ctx.lineTo(w-12,12);
    ctx.stroke();
    if(Ti.errHistory.length===0) return;
    const maxErr = Math.max(...Ti.errHistory.map(p=>p.err));
    const minErr = Math.min(...Ti.errHistory.map(p=>p.err));
    const tmax = Ti.errHistory[Ti.errHistory.length-1].t || 1;
    ctx.strokeStyle = 'rgba(255,120,80,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let i=0; i<Ti.errHistory.length; i++){
      const p = Ti.errHistory[i];
      const x = 36+(p.t/tmax)*(w-60);
      const y = h-24-((p.err-minErr)/(maxErr-minErr||1))*(h-40);
      if(i===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }

  function updateTiInfo(){
    const info = document.getElementById('ti-info');
    if(!info) return;
    const dt = Ti.dt;
    const dx = Ti.dx;
    const alpha = Ti.alpha;
    const dtCrit = dx*dx/(2*alpha+1e-12);
    info.textContent = `nx=${Ti.nx}, dx=${dx.toFixed(4)}, dt=${dt}, r≈${(Ti.alpha*Ti.dt/(Ti.dx*Ti.dx)).toFixed(3)}`;
    if(dt > dtCrit) info.style.color = '#ffb4b4';
    else info.style.color = 'var(--muted)';
  }

  function updateStatus(){
    const r = Ti.alpha*Ti.dt/(Ti.dx*Ti.dx);
    const expStatus = document.getElementById('ti-expStatus');
    const impStatus = document.getElementById('ti-impStatus');
    if(!expStatus || !impStatus) return;
    if(Ti.running){
      if(r > 0.5){
        expStatus.textContent = `⚠️ INESTABLE (r=${r.toFixed(3)})`;
        expStatus.style.color = '#ffb4b4';
      } else {
        expStatus.textContent = `✓ Estable (r=${r.toFixed(3)})`;
        expStatus.style.color = '#00ff88';
      }
      impStatus.textContent = `✓ Siempre Estable`;
      impStatus.style.color = '#00d9ff';
    } else {
      expStatus.textContent = 'Status: listo';
      impStatus.textContent = 'Status: listo';
      expStatus.style.color = 'var(--muted)';
      impStatus.style.color = 'var(--muted)';
    }
  }

  let tiAnimId = null;
  function tiAnimate(){
    if(!Ti.running){ tiAnimId = null; return; }
    for(let s=0; s<Ti.substeps; s++){
      if(Ti.runExplicit) stepExplicitOnce();
      if(Ti.runImplicit) stepImplicitOnce();
      Ti.t += Ti.dt;
      const err = computeError();
      Ti.errHistory.push({t: Ti.t, err});
      if(Ti.errHistory.length > 400) Ti.errHistory.shift();
      detectOscillations();
    }
    drawTimeFields();
    drawErr();
    updateStatus();
    tiAnimId = requestAnimationFrame(tiAnimate);
  }

  if(document.getElementById('ti-alpha')){
    initTimeInt();
    const tiStart = document.getElementById('ti-start');
    const tiReset = document.getElementById('ti-reset');
    
    if(tiStart){
      tiStart.addEventListener('click', ()=>{
        Ti.running = !Ti.running;
        if(Ti.running && !tiAnimId) tiAnimate();
        updateStatus();
      });
    }
    
    if(tiReset){
      tiReset.addEventListener('click', ()=>{
        Ti.running = false;
        if(tiAnimId) cancelAnimationFrame(tiAnimId);
        const warning = document.getElementById('ti-warning');
        if(warning) warning.style.display = 'none';
        initTimeInt();
      });
    }
    
    ['ti-alpha','ti-nx','ti-dt','ti-substeps'].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.addEventListener('change', ()=>{ initTimeInt(); });
    });
    
    const checkbox1 = document.getElementById('ti-runExplicit');
    const checkbox2 = document.getElementById('ti-runImplicit');
    if(checkbox1) checkbox1.addEventListener('change', (e)=>{ Ti.runExplicit = e.target.checked; });
    if(checkbox2) checkbox2.addEventListener('change', (e)=>{ Ti.runImplicit = e.target.checked; });
  }
}

// ===== NAVEGACIÓN DE CAPÍTULOS =====
function initNavigation(){
  // Manejo de botones de capítulos antiguos (si aún existen)
  document.querySelectorAll('.chapter-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const chapter = btn.getAttribute('data-chapter');
      document.querySelectorAll('.chapter').forEach(s=>{ s.classList.remove('active'); });
      document.querySelectorAll('.chapter-btn').forEach(b=>{ b.classList.remove('active'); });
      const targetSection = document.getElementById(chapter);
      if(targetSection) targetSection.classList.add('active');
      btn.classList.add('active');
    });
  });
  
  // Manejo de botones de unidades (nuevo)
  document.querySelectorAll('.unit-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const unit = btn.getAttribute('data-unit');
      document.querySelectorAll('.unit-section').forEach(s=>{ s.classList.remove('active'); });
      document.querySelectorAll('.unit-btn').forEach(b=>{ b.classList.remove('active'); });
      const targetSection = document.getElementById(unit);
      if(targetSection) targetSection.classList.add('active');
      btn.classList.add('active');
    });
  });
  
  // Animar Euler Explícito
  const eulerBtn = document.getElementById('eulerPlayBtn');
  if(eulerBtn){
    eulerBtn.addEventListener('click', ()=>{ animateEulerProcess(); });
  }
}

// ===== ANIMACIÓN EULER EXPLÍCITO =====
function animateEulerProcess(){
  const canvas = document.getElementById('eulerAnimCanvas');
  if(!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  
  canvas.width = w * devicePixelRatio;
  canvas.height = h * devicePixelRatio;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(devicePixelRatio, devicePixelRatio);
  
  // Parámetros de la animación
  const nx = 11;
  const dt = 0.0005;
  const alpha = 0.02;
  const dx = 1/nx;
  const r = alpha*dt/(dx*dx);
  
  // Crear solución inicial gaussiana
  let T = new Array(nx).fill(0);
  const center = Math.floor(nx/2);
  for(let i=0; i<nx; i++){
    const dist = (i-center)/(nx*0.06);
    T[i] = Math.exp(-dist*dist);
  }
  
  let frame = 0;
  const totalFrames = 60;
  
  function drawFrame(){
    ctx.fillStyle = 'rgba(5,8,16,0.8)';
    ctx.fillRect(0, 0, w, h);
    
    const margin = 20;
    const gridX = margin;
    const gridY = h/2;
    const cellWidth = (w-2*margin)/(nx-1);
    
    // Dibujar grilla de nodos
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    for(let i=0; i<nx; i++){
      const x = gridX + i*cellWidth;
      ctx.moveTo(x, gridY-50);
      ctx.lineTo(x, gridY+50);
    }
    ctx.stroke();
    
    // Dibujar valores actuales
    const maxT = Math.max(...T);
    for(let i=0; i<nx; i++){
      const x = gridX + i*cellWidth;
      const barHeight = (T[i]/maxT)*40;
      
      // Barra de temperatura
      ctx.fillStyle = `hsl(${T[i]/maxT*360}, 100%, ${50+T[i]/maxT*30}%)`;
      ctx.fillRect(x-cellWidth*0.35, gridY, cellWidth*0.7, -barHeight);
      
      // Valor numérico
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(T[i].toFixed(2), x, gridY+15);
    }
    
    // Información de parámetros
    ctx.fillStyle = 'rgba(255,100,0,0.8)';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Paso: ${Math.floor(frame/10)} | r = ${r.toFixed(3)} | Δt = ${dt}`, 15, 15);
    
    frame++;
    
    if(frame < totalFrames){
      // Calcular siguiente paso
      const Tnew = new Array(nx);
      for(let i=1; i<nx-1; i++){
        Tnew[i] = T[i] + r*(T[i+1] - 2*T[i] + T[i-1]);
      }
      Tnew[0] = Tnew[1];
      Tnew[nx-1] = Tnew[nx-2];
      T = Tnew;
      
      requestAnimationFrame(drawFrame);
    }
  }
  
  drawFrame();
}
